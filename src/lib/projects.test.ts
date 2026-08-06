import { describe, expect, test } from 'bun:test';
import { buildCategoryFilters, filterProjects, sortProjects } from './projects';

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
