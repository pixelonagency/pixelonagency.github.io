import { internalHref } from './url';

export interface NavItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
}

export interface ServiceNavEntry {
  id: string;
  data: { navLabel: string; order: number };
}

/** Header ve mobil menüdeki ana gezinme — referans tasarımdaki sırayla. */
export const PRIMARY_NAV: readonly NavItem[] = [
  { label: 'Biz Kimiz?', href: '/biz-kimiz/' },
  { label: 'Hizmetlerimiz', href: '/hizmetlerimiz/', hasDropdown: true },
  { label: 'Projelerimiz', href: '/projelerimiz/' },
  { label: 'Referanslarımız', href: '/projelerimiz/#referanslar' },
  // Kariyer bilerek YOK: üst menüyü kısa tutmak için yalnız footer ve mobil menüde durur.
  { label: 'İletişim', href: '/iletisim/' },
];

/** Bir hizmet slug'ının route'u — kanonik biçimde (sonda eğik çizgi). */
export function serviceHref(slug: string): string {
  return internalHref(`/hizmetlerimiz/${slug}`);
}

/** "Hizmetlerimiz" dropdown'ı — koleksiyon girdilerinden `order` sırasına göre üretilir. */
export function buildServicesNav(entries: ServiceNavEntry[]): NavItem[] {
  return [...entries]
    .sort((a, b) => a.data.order - b.data.order)
    .map((entry) => ({ label: entry.data.navLabel, href: serviceHref(entry.id) }));
}

interface ServiceMenuEntry {
  id: string;
  data: { order: number; menu?: boolean | undefined };
}

/**
 * Menüde (header, footer, mobil panel) gösterilecek hizmetler.
 *
 * `menu: false` işaretli hizmet listeden düşer ama sayfası yerinde kalır — hizmet
 * envanteri daraltılırken sayfayı silmeden menüden çıkarabilmek için. Alan verilmemişse
 * hizmet görünür sayılır, yani yeni bir hizmet eklendiğinde menüye kendiliğinden girer.
 */
export function menuServices<T extends ServiceMenuEntry>(entries: readonly T[]): T[] {
  return [...entries].filter((entry) => entry.data.menu !== false).sort((a, b) => a.data.order - b.data.order);
}

const stripSlash = (path: string): string => (path.length > 1 ? path.replace(/\/+$/, '') : path);

/** Geçerli sayfa, verilen nav route'unun içinde mi? Alt sayfalar üst bölümü aktif sayar. */
export function isActiveRoute(currentPath: string, navHref: string): boolean {
  const current = stripSlash(currentPath);
  const target = stripSlash(navHref.split('#')[0] ?? navHref);
  if (target === '/') return current === '/';
  return current === target || current.startsWith(`${target}/`);
}
