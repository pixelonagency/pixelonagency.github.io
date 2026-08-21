/**
 * Site içi bağlantı normalizasyonu.
 *
 * Site statik olarak dizin biçiminde yayınlanır (`/biz-kimiz/index.html`), bu yüzden
 * kanonik adres HER ZAMAN sondaki eğik çizgiyi taşır — `canonicalUrl()` ve sitemap
 * de öyle üretir. Sunucu eğik çizgisiz isteği 301 ile eğik çizgili adrese taşır.
 *
 * Bağlantılar eğik çizgisiz yazıldığında bu 301 site içinde tetiklenir: tarama bütçesi
 * yönlendirmelerde erir, bağlantı değeri seyrelir ve aynı sayfa iki ayrı URL olarak
 * taranır. `internalHref()` bu kaymayı bağlantının üretildiği noktada kapatır.
 *
 * Dokunulmayanlar: protokollü/protokolsüz dış adresler, salt çapa bağlantıları ve
 * dosya uzantılı yollar (bunlar dizin değildir).
 */

/** `path` kısmını `?`/`#` ekinden ayırır. */
const SPLIT_RE = /^([^?#]*)([?#][\s\S]*)?$/;

/** `https:`, `mailto:`, `tel:` … ve protokolsüz `//host` biçimleri. */
const ABSOLUTE_RE = /^([a-z][a-z\d+.-]*:|\/\/)/i;

/** Son parçada uzantı varsa yol bir dosyadır (`/sitemap-index.xml`). */
const FILE_RE = /\.[a-z\d]{1,8}$/i;

export function internalHref(href: string): string {
  if (href === '' || href.startsWith('#') || href.startsWith('?')) return href;
  if (ABSOLUTE_RE.test(href)) return href;

  const match = SPLIT_RE.exec(href);
  const path = match?.[1] ?? '';
  const suffix = match?.[2] ?? '';

  if (path === '' || path.endsWith('/')) return href;
  if (FILE_RE.test(path.slice(path.lastIndexOf('/') + 1))) return href;

  return `${path}/${suffix}`;
}
