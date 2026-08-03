/** Sondaki eğik çizgiyi garanti eden mutlak kanonik URL üretir. */
export function canonicalUrl(path: string, site: string): string {
  const base = site.replace(/\/+$/, '');
  const clean = path.replace(/^\/+/, '').replace(/\/+$/, '');
  return clean === '' ? `${base}/` : `${base}/${clean}/`;
}

/** Meta description'ı kelime sınırında keser; kesme olduysa sonuna `…` ekler. */
export function truncateDescription(text: string, max = 160): string {
  if (text.length <= max) return text;
  const sliced = text.slice(0, max);
  const lastSpace = sliced.lastIndexOf(' ');
  const cut = lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced;
  return `${cut.trimEnd()}…`;
}
