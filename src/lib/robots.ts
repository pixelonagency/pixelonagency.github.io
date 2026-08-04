/**
 * `robots.txt` gövdesini üretir.
 *
 * Sitemap adresi `Astro.site` değerinden türetilir — alan adı yalnızca
 * `astro.config.mjs` içinde tanımlı kalsın, burada tekrarlanmasın diye.
 */
export function buildRobotsTxt(site: string): string {
  const base = site.replace(/\/+$/, '');

  return [
    'User-agent: *',
    'Allow: /',
    // CMS arayüzü indekslenmemeli; sayfanın kendisinde ayrıca noindex meta'sı var.
    'Disallow: /admin/',
    '',
    `Sitemap: ${base}/sitemap-index.xml`,
    '',
  ].join('\n');
}
