import { describe, expect, test } from 'bun:test';
import {
  CATEGORY_MIN_POSTS,
  categoriesWithPages,
  categoryPath,
  categorySlug,
  groupByCategory,
  hasCategoryPage,
  type CategorizablePost,
} from './blog-categories';

/**
 * Kategori sayfaları blog yazılarını hizmet hattına bağlayan konu merkezleridir.
 *
 * EŞİK: tek yazılık bir "kategori" sayfası Google'ın zayıf içerik saydığı şeydir —
 * indekse giren ama hiçbir şey anlatmayan bir liste. Bu yüzden sayfa yalnızca
 * `CATEGORY_MIN_POSTS` ve üzeri yazıya sahip kategoriler için üretilir. Eşiğin
 * altındaki kategoriler etiket olarak yaşamaya devam eder; yalnızca hedefleri olmaz.
 */

const post = (id: string, category: string, day: number): CategorizablePost => ({
  id,
  data: { category, date: new Date(2026, 7, day) },
});

const posts: CategorizablePost[] = [
  post('tr/web-1', 'Web Tasarım', 1),
  post('tr/web-2', 'Web Tasarım', 5),
  post('tr/web-3', 'Web Tasarım', 3),
  post('tr/seo-1', 'SEO', 2),
  post('tr/marka-1', 'Marka', 4),
  post('en/health-1', 'Healthcare Marketing', 6),
];

describe('categorySlug', () => {
  test('Türkçe karakterleri ASCII slug yapar', () => {
    expect(categorySlug('Web Tasarım')).toBe('web-tasarim');
    expect(categorySlug('Sağlık Pazarlaması')).toBe('saglik-pazarlamasi');
    expect(categorySlug('CRM ve Dijital Dönüşüm')).toBe('crm-ve-dijital-donusum');
  });
});

describe('categoryPath', () => {
  test('Türkçe yol `kategori` segmentini kullanır ve kanoniktir', () => {
    expect(categoryPath('tr', 'Web Tasarım')).toBe('/blog/kategori/web-tasarim/');
  });

  test('İngilizce yol dil ön ekini ve `category` segmentini kullanır', () => {
    expect(categoryPath('en', 'Healthcare Marketing')).toBe('/en/blog/category/healthcare-marketing/');
  });
});

describe('groupByCategory', () => {
  test('yalnızca istenen dilin yazılarını gruplar', () => {
    const groups = groupByCategory(posts, 'tr');
    expect(groups.map((group) => group.name)).not.toContain('Healthcare Marketing');
  });

  test('grupları yazı sayısına göre azalan, eşitlikte alfabetik sıralar', () => {
    const groups = groupByCategory(posts, 'tr');
    // 'Marka' ve 'SEO' birer yazılık; eşitlik Türkçe alfabetik sırayla bozulur.
    expect(groups.map((group) => group.name)).toEqual(['Web Tasarım', 'Marka', 'SEO']);
  });

  test('grup içindeki yazılar en yeniden eskiye dizilir', () => {
    const web = groupByCategory(posts, 'tr').find((group) => group.slug === 'web-tasarim');
    expect(web?.posts.map((entry) => entry.id)).toEqual(['tr/web-2', 'tr/web-3', 'tr/web-1']);
  });
});

describe('categoriesWithPages', () => {
  test('eşiğin altındaki kategoriler sayfa almaz', () => {
    const withPages = categoriesWithPages(posts, 'tr');
    expect(withPages.map((group) => group.name)).toEqual(['Web Tasarım']);
  });

  test('eşik tam sınırda kapsayıcıdır', () => {
    const web = categoriesWithPages(posts, 'tr').find((group) => group.slug === 'web-tasarim');
    expect(web?.posts).toHaveLength(CATEGORY_MIN_POSTS);
  });

  test('diğer dil kendi eşiğiyle değerlendirilir', () => {
    expect(categoriesWithPages(posts, 'en')).toEqual([]);
  });
});

describe('hasCategoryPage', () => {
  test('eşiği geçen kategori için doğrudur', () => {
    expect(hasCategoryPage(posts, 'tr', 'Web Tasarım')).toBe(true);
  });

  test('eşiğin altındaki kategori için yanlıştır', () => {
    expect(hasCategoryPage(posts, 'tr', 'Marka')).toBe(false);
  });

  test('bilinmeyen kategori için yanlıştır', () => {
    expect(hasCategoryPage(posts, 'tr', 'Yok Böyle Bir Şey')).toBe(false);
  });
});
