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
    // 404 şablonu `dist/404.html` olarak da yazılıyor ve tarayıcı onu 200 dönen sıradan
    // bir sayfa gibi çekebiliyor. İçinde gezinme dışında metin yok; taranması denetimde
    // gürültü üretmekten başka bir işe yaramıyor.
    'Disallow: /404.html',
    '',
    `Sitemap: ${base}/sitemap-index.xml`,
    '',
  ].join('\n');
}
