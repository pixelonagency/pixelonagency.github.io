import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildKlaroConfig } from '../src/lib/consent-config';

/**
 * Meta Pixel consent köprüsünün birim testleri — STRICT mimari.
 *
 * Marketing izni gelmeden Meta loader'ı hiç yüklenmez; site kodu yalnızca
 * kontrollü `meta_consent_update` dataLayer durumu üretir. Gerçek Meta/GTM'e
 * istek atılmaz.
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

const metaEvents = (): Array<Record<string, string>> =>
  (globalRef.window?.dataLayer ?? []).filter(
    (entry): entry is Record<string, string> =>
      typeof entry === 'object' &&
      entry !== null &&
      (entry as Record<string, unknown>)['event'] === 'meta_consent_update',
  );

beforeEach(() => {
  globalRef.window = { dataLayer: [] };
});
afterEach(() => {
  delete globalRef.window;
});

describe('Meta Pixel consent bridge (Marketing-only, strict)', () => {
  const meta = () => serviceByName('meta-pixel');

  test('the service lives under Marketing with the agreed display names', () => {
    expect(meta().purposes).toEqual(['marketing']);
    const config = buildKlaroConfig('tr') as {
      services: Array<{ name: string; translations: Record<string, { title: string }> }>;
    };
    const entry = config.services.find((s) => s.name === 'meta-pixel');
    expect(entry?.translations['tr']?.title).toBe('Reklam ve Dönüşüm Ölçümü (Meta Pixel)');
    expect(entry?.translations['en']?.title).toBe('Advertising & Conversion Measurement (Meta Pixel)');
  });

  test('marketing granted → exactly one controlled granted state', () => {
    meta().callback?.(true, { name: 'meta-pixel' });
    expect(metaEvents()).toEqual([{ event: 'meta_consent_update', meta_marketing_consent: 'granted' }]);
  });

  test('fresh / reject-all / revoke → denied state', () => {
    meta().callback?.(false, { name: 'meta-pixel' });
    expect(metaEvents()).toEqual([{ event: 'meta_consent_update', meta_marketing_consent: 'denied' }]);
  });

  test('analytics-only never produces a Meta state — categories do not leak', () => {
    serviceByName('google-analytics').callback?.(true, { name: 'google-analytics' });
    serviceByName('microsoft-clarity').callback?.(true, { name: 'microsoft-clarity' });
    expect(metaEvents()).toEqual([]);
  });

  test('marketing consent change does not touch the Clarity analytics bridge', () => {
    meta().callback?.(true, { name: 'meta-pixel' });
    serviceByName('google-ads').callback?.(true, { name: 'google-ads' });
    const clarityCalls = (globalRef.window?.clarity?.q ?? []).length;
    expect(clarityCalls).toBe(0); // Marketing tarafı Clarity'ye sinyal göndermez
  });

  test('re-grant in the same lifecycle re-emits granted (GTM base tag stays once-per-page)', () => {
    meta().callback?.(true, { name: 'meta-pixel' });
    meta().callback?.(false, { name: 'meta-pixel' });
    meta().callback?.(true, { name: 'meta-pixel' });
    expect(metaEvents().map((e) => e['meta_marketing_consent'])).toEqual(['granted', 'denied', 'granted']);
  });

  test('payload is a closed enum — no PII fields, no free text possible', () => {
    meta().callback?.(true, { name: 'meta-pixel' });
    const event = metaEvents()[0] ?? {};
    expect(Object.keys(event).sort()).toEqual(['event', 'meta_marketing_consent']);
    expect(['granted', 'denied']).toContain(event['meta_marketing_consent']);
    for (const banned of ['email', 'phone', 'name', 'surname', 'company', 'website', 'message', 'budget']) {
      expect(event).not.toHaveProperty(banned);
    }
  });

  test('revoke cleanup pattern targets the documented first-party Meta cookies', () => {
    expect(String(meta().cookies)).toContain('_fbp');
    expect(String(meta().cookies)).toContain('_fbc');
  });

  test('GA4 consent flow is untouched by the Meta bridge', () => {
    serviceByName('google-analytics').callback?.(true, { name: 'google-analytics' });
    const gtagUpdates = (globalRef.window?.dataLayer ?? []).filter(
      (entry) => (entry as ArrayLike<unknown>)[0] === 'consent' && (entry as ArrayLike<unknown>)[1] === 'update',
    );
    expect(gtagUpdates.length).toBeGreaterThan(0);
  });

  test('no direct Meta loader in site code — the pixel exists only in the GTM plan', () => {
    const source = readFileSync(join(ROOT, 'src', 'lib', 'consent-config.ts'), 'utf-8');
    for (const banned of ['connect.facebook.net', 'fbevents', "fbq('init'", 'facebook.com/tr']) {
      expect(source.includes(banned), `${banned} site koduna sızmış`).toBe(false);
    }
    // Pixel ID uygulama bundle'ına dağıtılmaz (yalnız GTM + envanter/doküman).
    expect(source.includes('1096159972333769')).toBe(false);
  });
});
