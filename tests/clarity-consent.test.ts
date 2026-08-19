import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildKlaroConfig } from '../src/lib/consent-config';

/**
 * Clarity Consent API v2 köprüsünün birim testleri.
 *
 * GTM Preview canlı testi GCM otomatik yorumunun güvenilmez olduğunu kanıtladı;
 * bu testler Klaro tercihlerinin tek kaynak olduğunu ve resmî kuyruk
 * sözleşmesinin korunduğunu kilitler. Gerçek Clarity/GTM'e istek atılmaz.
 */

type ClarityStub = { (...args: unknown[]): void; q?: unknown[] };
type TestWindow = { dataLayer: unknown[]; clarity?: ClarityStub };
type Service = {
  name: string;
  purposes: string[];
  cookies?: unknown[];
  callback?: (consent: boolean, service: { name: string }) => void;
};

const ROOT = join(import.meta.dir, '..');
const globalRef = globalThis as { window?: TestWindow };

const serviceByName = (name: string): Service => {
  const config = buildKlaroConfig('tr') as { services: Service[] };
  const service = config.services.find((entry) => entry.name === name);
  if (!service) throw new Error(`${name} servisi yok`);
  return service;
};

/** Kuyruktaki `arguments` objesini [ad, payload] olarak okur. */
const queuedCalls = (): Array<[string, Record<string, string>]> =>
  (globalRef.window?.clarity?.q ?? []).map((entry) => {
    const args = entry as ArrayLike<unknown>;
    return [args[0] as string, args[1] as Record<string, string>];
  });

beforeEach(() => {
  globalRef.window = { dataLayer: [] };
});
afterEach(() => {
  delete globalRef.window;
});

describe('Clarity consentv2 bridge (Klaro = source of truth)', () => {
  const clarity = () => serviceByName('microsoft-clarity');

  test('Analytics ON → ad_Storage stays denied, analytics_Storage granted', () => {
    clarity().callback?.(true, { name: 'microsoft-clarity' });
    const calls = queuedCalls().filter(([name]) => name === 'consentv2');
    expect(calls).toHaveLength(1);
    expect(calls[0]?.[1]).toEqual({ ad_Storage: 'denied', analytics_Storage: 'granted' });
  });

  test('Analytics OFF / Reject All / fresh visitor → denied/denied', () => {
    clarity().callback?.(false, { name: 'microsoft-clarity' });
    const calls = queuedCalls().filter(([name]) => name === 'consentv2');
    expect(calls[0]?.[1]).toEqual({ ad_Storage: 'denied', analytics_Storage: 'denied' });
  });

  test('Marketing consent never reaches Clarity — accept-all still yields ad_Storage denied', () => {
    // Accept All: analytics + marketing callbacks birlikte tetiklenir.
    clarity().callback?.(true, { name: 'microsoft-clarity' });
    serviceByName('google-ads').callback?.(true, { name: 'google-ads' });
    const calls = queuedCalls().filter(([name]) => name === 'consentv2');
    expect(calls).toHaveLength(1); // google-ads callback'i Clarity'ye sinyal göndermez
    expect(calls[0]?.[1]?.['ad_Storage']).toBe('denied');
    // Kaynakta da koşulsuz: ad_Storage hiçbir koşulda granted üretilemez.
    const source = readFileSync(join(ROOT, 'src', 'lib', 'consent-config.ts'), 'utf-8');
    expect(source.includes("ad_Storage: 'granted'")).toBe(false);
  });

  test('revoke pushes an explicit denied update in the same lifecycle', () => {
    clarity().callback?.(true, { name: 'microsoft-clarity' });
    clarity().callback?.(false, { name: 'microsoft-clarity' });
    const calls = queuedCalls().filter(([name]) => name === 'consentv2');
    expect(calls.map(([, payload]) => payload['analytics_Storage'])).toEqual(['granted', 'denied']);
  });

  test('race safety: queue follows the official loader contract when Clarity is not loaded yet', () => {
    clarity().callback?.(true, { name: 'microsoft-clarity' });
    const stub = globalRef.window?.clarity;
    expect(typeof stub).toBe('function');
    // Kuyruk girdisi `arguments` objesidir (resmî yükleyici böyle boşaltır) — dizi değil.
    const entry = stub?.q?.[0] as ArrayLike<unknown>;
    expect(Array.isArray(entry)).toBe(false);
    expect(entry.length).toBe(2);
    expect(entry[0]).toBe('consentv2');
  });

  test('race safety: applies immediately through the real function when Clarity already loaded', () => {
    const received: unknown[][] = [];
    globalRef.window!.clarity = ((...args: unknown[]) => {
      received.push(args);
    }) as ClarityStub;
    clarity().callback?.(false, { name: 'microsoft-clarity' });
    expect(received).toEqual([['consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' }]]);
  });

  test('returning visitor path uses the same callback, so saved consent re-applies', () => {
    // Klaro kayıtlı tercihle açılışta callback'i mevcut state ile çağırır — aynı yol.
    clarity().callback?.(true, { name: 'microsoft-clarity' });
    expect(queuedCalls().at(-1)?.[1]).toEqual({ ad_Storage: 'denied', analytics_Storage: 'granted' });
  });

  test('cleanup and architecture stay intact: cookie patterns, GA4 consent flow untouched', () => {
    expect(String(clarity().cookies)).toContain('_clck');
    expect(String(clarity().cookies)).toContain('_clsk');
    // GA4/GTM consent davranışı değişmedi: analytics callback'i hâlâ gtag update push'lar.
    serviceByName('google-analytics').callback?.(true, { name: 'google-analytics' });
    const gtagUpdates = (globalRef.window?.dataLayer ?? []).filter(
      (entry) => (entry as ArrayLike<unknown>)[0] === 'consent' && (entry as ArrayLike<unknown>)[1] === 'update',
    );
    expect(gtagUpdates.length).toBeGreaterThan(0);
    // Doğrudan Clarity loader'ı yok: köprü yalnız consent sinyali gönderir, script yüklemez.
    const source = readFileSync(join(ROOT, 'src', 'lib', 'consent-config.ts'), 'utf-8');
    expect(source.includes('clarity.ms')).toBe(false);
    expect(source.includes('setTimeout(')).toBe(false);
    expect(source.includes('setInterval(')).toBe(false);
  });
});
