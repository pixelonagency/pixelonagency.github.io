import { describe, expect, test } from 'bun:test';
import {
  buildCategoryFilters,
  filterProjects,
  sortProjects,
  deriveServices,
  filterByService,
  SERVICE_KEYS,
  SERVICE_LABELS,
  type ServiceKey,
} from './projects';

type P = Parameters<typeof filterProjects>[0][number];

const projects: P[] = [
  { title: 'Dentasay', category: 'web-tasarim', featured: true, order: 2 },
  { title: 'Enda Clinic', category: 'saglik-turizmi', featured: false, order: 1 },
  { title: 'Opet', category: 'sosyal-medya', featured: false, order: 3 },
  { title: 'PTT', category: 'web-tasarim', featured: false, order: 4 },
];

describe('filterProjects', () => {
  test('returns every project for the "all" pseudo-category', () => {
    expect(filterProjects(projects, 'tumu')).toHaveLength(4);
  });

  test('returns only the projects in the requested category', () => {
    expect(filterProjects(projects, 'web-tasarim').map((p) => p.title)).toEqual(['Dentasay', 'PTT']);
  });

  test('returns an empty list for a category with no projects', () => {
    expect(filterProjects(projects, 'video-produksiyon')).toEqual([]);
  });
});

describe('buildCategoryFilters', () => {
  test('puts the "Tümü" filter first with the total count', () => {
    const filters = buildCategoryFilters(projects);
    expect(filters[0]).toEqual({ slug: 'tumu', label: 'Tümü', count: 4 });
  });

  test('lists each distinct category exactly once', () => {
    const slugs = buildCategoryFilters(projects).map((f) => f.slug);
    expect(slugs).toEqual(['tumu', 'web-tasarim', 'saglik-turizmi', 'sosyal-medya']);
  });

  test('counts the projects in each category', () => {
    const webTasarim = buildCategoryFilters(projects).find((f) => f.slug === 'web-tasarim');
    expect(webTasarim?.count).toBe(2);
  });

  test('uses the supplied label map for human-readable category names', () => {
    const filters = buildCategoryFilters(projects, { 'web-tasarim': 'Web Tasarım' });
    expect(filters.find((f) => f.slug === 'web-tasarim')?.label).toBe('Web Tasarım');
  });

  test('lets the label map translate the "all" pseudo-category', () => {
    const filters = buildCategoryFilters(projects, { tumu: 'All' });
    expect(filters[0]).toEqual({ slug: 'tumu', label: 'All', count: 4 });
  });

  test('falls back to a title-cased slug when the label map has no entry', () => {
    const filters = buildCategoryFilters(projects, {});
    expect(filters.find((f) => f.slug === 'saglik-turizmi')?.label).toBe('Saglik Turizmi');
  });
});

describe('sortProjects', () => {
  test('places featured projects before the rest', () => {
    expect(sortProjects(projects)[0]?.title).toBe('Dentasay');
  });

  test('orders non-featured projects by their order field', () => {
    expect(sortProjects(projects).map((p) => p.title)).toEqual(['Dentasay', 'Enda Clinic', 'Opet', 'PTT']);
  });
});

describe('board hizmet taksonomisi', () => {
  test('etiketlerden çoklu hizmet üyeliği türetilir — proje çoğaltılmaz', () => {
    const services = deriveServices(['Web Tasarım', 'Sosyal Medya', 'Dijital Reklam'], 'saglik');
    expect(services).toEqual(['web', 'sosyal', 'performance']);
  });

  test('kategori, etiketlerde karşılığı yoksa hizmet olarak eklenir', () => {
    expect(deriveServices(['İçerik Sistemi'], 'marka')).toEqual(['marka']);
    expect(deriveServices([], 'uxui')).toEqual(['web']);
  });

  test('video/prodüksiyon/fotoğraf ve SEO kalıpları yakalanır', () => {
    expect(deriveServices(['Video Prodüksiyon', 'Fotoğraf Çekimi'], 'web')).toContain('video');
    expect(deriveServices(['SEO Danışmanlığı'], 'web')).toContain('seo');
  });

  test('filterByService: all hepsini döner, hizmet üyeliği süzer', () => {
    const items = [
      { name: 'a', services: ['web', 'marka'] as ServiceKey[] },
      { name: 'b', services: ['sosyal'] as ServiceKey[] },
    ];
    expect(filterByService(items, 'all')).toHaveLength(2);
    expect(filterByService(items, 'marka').map((i) => i.name)).toEqual(['a']);
    expect(filterByService(items, 'seo')).toHaveLength(0);
  });

  test('etiket sözlüğü TR/EN tam ve anahtarlarla eşleşir', () => {
    for (const key of SERVICE_KEYS) {
      expect(SERVICE_LABELS[key]?.tr.length).toBeGreaterThan(0);
      expect(SERVICE_LABELS[key]?.en.length).toBeGreaterThan(0);
    }
  });
});
