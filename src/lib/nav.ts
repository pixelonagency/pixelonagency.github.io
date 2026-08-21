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
  { label: 'Kariyer', href: '/kariyer/' },
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

const stripSlash = (path: string): string => (path.length > 1 ? path.replace(/\/+$/, '') : path);

/** Geçerli sayfa, verilen nav route'unun içinde mi? Alt sayfalar üst bölümü aktif sayar. */
export function isActiveRoute(currentPath: string, navHref: string): boolean {
  const current = stripSlash(currentPath);
  const target = stripSlash(navHref.split('#')[0] ?? navHref);
  if (target === '/') return current === '/';
  return current === target || current.startsWith(`${target}/`);
}
