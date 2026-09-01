import { describe, expect, test } from 'bun:test';
import { buildRobotsTxt } from './robots';

const SITE = 'https://pixelon.com.tr';

describe('buildRobotsTxt', () => {
  test('allows every crawler by default', () => {
    const body = buildRobotsTxt(SITE);
    expect(body).toContain('User-agent: *');
    expect(body).toContain('Allow: /');
  });

  test('keeps the CMS admin out of crawlers', () => {
    expect(buildRobotsTxt(SITE)).toContain('Disallow: /admin/');
  });

  test('keeps the 404 template out of crawlers', () => {
    /*
     * Şablon `dist/404.html` olarak da yazılıyor ve tarayıcılar onu 200 dönen sıradan
     * bir sayfa gibi çekebiliyor. İçinde gezinme dışında metin olmadığı için denetimlerde
     * "düşük metin/HTML oranı" uyarısı üretiyordu (Semrush, 1 Eyl 2026) — sayfanın kendisi
     * doğruydu, taranması yanlıştı.
     */
    expect(buildRobotsTxt(SITE)).toContain('Disallow: /404.html');
  });

  test('points at the sitemap index on the canonical domain', () => {
    expect(buildRobotsTxt(SITE)).toContain('Sitemap: https://pixelon.com.tr/sitemap-index.xml');
  });

  test('derives the sitemap URL from the site passed in, not a hardcoded host', () => {
    expect(buildRobotsTxt('https://example.test')).toContain('Sitemap: https://example.test/sitemap-index.xml');
  });

  test('does not double the slash when the site ends in one', () => {
    expect(buildRobotsTxt('https://pixelon.com.tr/')).toContain('Sitemap: https://pixelon.com.tr/sitemap-index.xml');
  });

  test('ends with a trailing newline', () => {
    expect(buildRobotsTxt(SITE).endsWith('\n')).toBe(true);
  });

  test('contains no blank Disallow line, which would block the whole site', () => {
    // "Disallow:" (boş değer) her şeye izin verir ama "Disallow: /" her şeyi kapatır —
    // kazara tam kapatmayı engellemek için açıkça kontrol edilir.
    expect(buildRobotsTxt(SITE)).not.toMatch(/^Disallow: \/$/m);
  });
});
