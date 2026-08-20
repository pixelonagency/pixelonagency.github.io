export interface ProjectLike {
  title: string;
  category: string;
  featured?: boolean;
  order?: number;
}

export interface CategoryFilter {
  slug: string;
  label: string;
  count: number;
}

/** Filtre çubuğundaki "hepsi" sözde kategorisi. */
export const ALL_CATEGORY = 'tumu';
const ALL_LABEL = 'Tümü';

const titleCase = (slug: string): string =>
  slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

/** Verilen kategoriye ait projeleri döner; `tumu` tüm listeyi döner. */
export function filterProjects<T extends ProjectLike>(projects: T[], category: string): T[] {
  if (category === ALL_CATEGORY) return [...projects];
  return projects.filter((project) => project.category === category);
}

/** Öne çıkanlar önce, ardından `order` alanına göre sıralar. */
export function sortProjects<T extends ProjectLike>(projects: T[]): T[] {
  return [...projects].sort((a, b) => {
    if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1;
    return (a.order ?? 0) - (b.order ?? 0);
  });
}

/**
 * Kategori filtre çubuğunu üretir: başta "Tümü", ardından ilk görülme sırasına göre kategoriler.
 * `labels` içinde `tumu` anahtarı varsa "Tümü" etiketi de o dile göre değişir.
 */
export function buildCategoryFilters(projects: ProjectLike[], labels: Record<string, string> = {}): CategoryFilter[] {
  const counts = new Map<string, number>();
  for (const project of projects) {
    counts.set(project.category, (counts.get(project.category) ?? 0) + 1);
  }

  return [
    { slug: ALL_CATEGORY, label: labels[ALL_CATEGORY] ?? ALL_LABEL, count: projects.length },
    ...[...counts.entries()].map(([slug, count]) => ({
      slug,
      label: labels[slug] ?? titleCase(slug),
      count,
    })),
  ];
}

// --- hizmet taksonomisi (board görünümü) ----------------------------------

/**
 * Board filtreleri MARKA bazlı çoklu üyelikle çalışır: bir proje birden çok
 * hizmet filtresinde görünür ama hiçbir zaman çoğaltılmaz. Hizmetler ayrı bir
 * içerik alanından DEĞİL, projelerin zaten beyan ettiği `tags` + `category`
 * verisinden türetilir — CMS'e yeni zorunlu alan eklemeden geleceğe uyumludur.
 */
export const SERVICE_KEYS = ['web', 'marka', 'sosyal', 'performance', 'video', 'seo'] as const;
export type ServiceKey = (typeof SERVICE_KEYS)[number];

const SERVICE_MATCHERS: Record<ServiceKey, RegExp> = {
  web: /web|site|ux|ui|e-?ticaret|e-?commerce/i,
  marka: /marka|kimlik|logo|brand|identity/i,
  sosyal: /sosyal|social/i,
  performance: /reklam|ads|advertis|performans|performance/i,
  video: /video|prod(ü|u)ksiyon|production|foto(ğ|g)raf|photo/i,
  seo: /\bseo\b|i(ç|c)erik pazarlama|content marketing/i,
};

const CATEGORY_TO_SERVICE: Record<string, ServiceKey> = {
  web: 'web',
  uxui: 'web',
  marka: 'marka',
  sosyal: 'sosyal',
};

export const SERVICE_LABELS: Record<ServiceKey, Record<'tr' | 'en', string>> = {
  web: { tr: 'Web Tasarım', en: 'Web Design' },
  marka: { tr: 'Kurumsal Kimlik', en: 'Brand Identity' },
  sosyal: { tr: 'Sosyal Medya', en: 'Social Media' },
  performance: { tr: 'Reklam', en: 'Advertising' },
  video: { tr: 'Video & Fotoğraf', en: 'Video & Photo' },
  seo: { tr: 'SEO', en: 'SEO' },
};

export const ALL_SERVICE_LABEL: Record<'tr' | 'en', string> = { tr: 'Tümü', en: 'All' };

/** Projenin etiket/kategori beyanından hizmet anahtarlarını türetir (sıra sabit). */
export function deriveServices(tags: readonly string[], category: string): ServiceKey[] {
  const haystack = tags.join(' ');
  const derived = SERVICE_KEYS.filter((key) => SERVICE_MATCHERS[key].test(haystack));
  const fromCategory = CATEGORY_TO_SERVICE[category];
  if (fromCategory && !derived.includes(fromCategory)) derived.unshift(fromCategory);
  return derived;
}

/** Board filtresi: `all` tüm listeyi döner; aksi halde hizmete üyelikle süzer. */
export function filterByService<T extends { services: readonly ServiceKey[] }>(
  projects: readonly T[],
  service: ServiceKey | 'all',
): T[] {
  if (service === 'all') return [...projects];
  return projects.filter((project) => project.services.includes(service));
}
