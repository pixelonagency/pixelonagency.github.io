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
