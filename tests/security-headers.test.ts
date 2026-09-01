import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';

/**
 * `public/_headers` sözleşmesi.
 *
 * HSTS burada özel bir durum: diğer güvenlik başlıklarının aksine GERİ ALINAMIYOR.
 * Tarayıcı `max-age` boyunca alan adını "yalnızca HTTPS" diye hatırlıyor; başlığı
 * kaldırmak o hafızayı silmiyor. `includeSubDomains` bunu tüm alt alan adlarına,
 * `preload` ise tarayıcıya gömülü listeye taşıyor — sonuncusundan çıkmak aylar sürüyor.
 *
 * Bu yüzden burada iki şey birden korunuyor: başlığın VAR olması (Semrush 1 Eylül
 * denetiminde eksikliğini iki sayfada bildirdi) ve KISA kalması. `max-age` bilinçli
 * olarak düşük tutuldu; yükseltmek sahibin ayrı bir kararı ve bu testi güncellemeyi
 * gerektirir — dalgınlıkla bir yıla çıkmasını engelleyen şey bu.
 */

const headers = await Bun.file(join(import.meta.dir, '..', 'public', '_headers')).text();

/** `/*` bloğunun altındaki girintili satırlar — tüm siteye uygulanan başlıklar. */
const globalBlock = (): string[] => {
  const lines = headers.split('\n');
  const start = lines.findIndex((line) => line.trim() === '/*');
  if (start === -1) return [];
  const out: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (!/^\s+\S/.test(line)) break;
    out.push(line.trim());
  }
  return out;
};

const hsts = (): string | undefined =>
  globalBlock()
    .find((line) => line.toLowerCase().startsWith('strict-transport-security:'))
    ?.split(':')
    .slice(1)
    .join(':')
    .trim();

describe('güvenlik başlıkları', () => {
  test('tüm siteye uygulanan temel başlıklar duruyor', () => {
    const block = globalBlock().map((line) => line.split(':')[0]?.trim());
    expect(block).toContain('X-Content-Type-Options');
    expect(block).toContain('Referrer-Policy');
    expect(block).toContain('X-Frame-Options');
    expect(block).toContain('Permissions-Policy');
  });

  test('HSTS tanımlı', () => {
    expect(hsts()).toBeDefined();
  });

  test('HSTS max-age deneme aşamasında kalıyor (≤ 1 gün)', () => {
    const maxAge = Number(/max-age=(\d+)/.exec(hsts() ?? '')?.[1] ?? -1);
    expect(maxAge).toBeGreaterThan(0);
    expect(maxAge).toBeLessThanOrEqual(86_400);
  });

  test('HSTS alt alan adlarını kapsamıyor ve preload listesine girmiyor', () => {
    /*
     * `includeSubDomains`, alan adının TÜM alt adlarını kilitler — bugün HTTPS
     * sunmayan bir alt alan (staging, panel, mail arayüzü) anında erişilemez olur.
     * `preload` ise geri alınması aylar süren tek başlık direktifi.
     */
    const value = (hsts() ?? '').toLowerCase();
    expect(value).not.toContain('includesubdomains');
    expect(value).not.toContain('preload');
  });
});
