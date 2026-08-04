import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';
import { parse } from 'yaml';

/**
 * Kanonik alan adı üç ayrı dosyada tekrarlanıyor:
 *
 *   1. `astro.config.mjs`      → canonical etiketleri + sitemap
 *   2. `public/CNAME`          → GitHub Pages'in hangi alan adına hizmet vereceği
 *   3. `public/admin/config.yml` → CMS'teki "site" ve "önizleme" bağlantıları
 *
 * Biri güncellenip diğeri unutulursa sonuç sessiz bir hata olur: site açılır ama
 * canonical yanlış alan adını gösterir (kopya içerik) ya da deploy sonrası custom
 * domain düşer. Bu testler üçünü birbirine bağlar.
 */

const ROOT = join(import.meta.dir, '..');

const astroConfig = await Bun.file(join(ROOT, 'astro.config.mjs')).text();
const cnameFile = (await Bun.file(join(ROOT, 'public', 'CNAME')).text()).trim();
const cmsConfig = parse(await Bun.file(join(ROOT, 'public', 'admin', 'config.yml')).text()) as {
  site_url: string;
  display_url: string;
};

const astroSite = /site:\s*'([^']+)'/.exec(astroConfig)?.[1] ?? '';

const CANONICAL_HOST = 'pixelon.com.tr';

describe('canonical domain', () => {
  test('astro.config.mjs points at the canonical domain over HTTPS', () => {
    expect(astroSite).toBe(`https://${CANONICAL_HOST}`);
  });

  test('public/CNAME holds exactly the bare host, no scheme or trailing slash', () => {
    expect(cnameFile).toBe(CANONICAL_HOST);
    expect(cnameFile).not.toContain('http');
    expect(cnameFile).not.toContain('/');
  });

  test('CNAME is a single line — GitHub Pages ignores the file otherwise', () => {
    expect(cnameFile.split('\n')).toHaveLength(1);
  });

  test('the CMS site_url matches the Astro canonical exactly', () => {
    expect(cmsConfig.site_url).toBe(astroSite);
  });

  test('the CMS display_url matches the Astro canonical exactly', () => {
    expect(cmsConfig.display_url).toBe(astroSite);
  });

  test('the Astro site host and the CNAME host agree', () => {
    expect(new URL(astroSite).host).toBe(cnameFile);
  });

  test('the canonical host is the apex, since www redirects to it', () => {
    // Cloudflare'de www.pixelon.com.tr → https://pixelon.com.tr/ 301 yapılandırıldı.
    // Kanonik www olsaydı her sayfa kendini bir yönlendirmeye işaret ederdi.
    expect(CANONICAL_HOST.startsWith('www.')).toBe(false);
  });

  test('the site URL carries no trailing slash, so canonicalUrl builds clean paths', () => {
    expect(astroSite.endsWith('/')).toBe(false);
  });
});
