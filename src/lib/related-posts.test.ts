import { describe, expect, test } from 'bun:test';
import { pickRelatedPosts, type RelatablePost } from './related-posts';

const post = (id: string, category: string, date: string, translationKey?: string): RelatablePost => ({
  id,
  data: { category, date: new Date(date), ...(translationKey ? { translationKey } : {}) },
});

const ALL: RelatablePost[] = [
  post('tr/seo-nedir', 'SEO', '2026-01-10', 'what-is-seo'),
  post('tr/seo-sure', 'SEO', '2026-03-10'),
  post('tr/seo-blog', 'SEO', '2026-02-10'),
  post('tr/reels', 'Sosyal Medya', '2026-04-10'),
  post('tr/instagram', 'Sosyal Medya', '2026-05-10'),
  post('tr/roas', 'Reklam', '2026-06-10'),
];

describe('pickRelatedPosts', () => {
  test('editörün seçtiği yazıları verilen sırayla döner', () => {
    const picked = pickRelatedPosts({ current: ALL[3]!, all: ALL, keys: ['roas', 'seo-sure'], count: 3 });
    expect(picked.map((entry) => entry.id)).toEqual(['tr/roas', 'tr/seo-sure', 'tr/instagram']);
  });

  test('çeviri anahtarıyla da eşleşir', () => {
    const picked = pickRelatedPosts({ current: ALL[5]!, all: ALL, keys: ['what-is-seo'], count: 1 });
    expect(picked.map((entry) => entry.id)).toEqual(['tr/seo-nedir']);
  });

  test('seçim eksikse aynı kategoriden tamamlanır', () => {
    const picked = pickRelatedPosts({ current: ALL[0]!, all: ALL, keys: [], count: 2 });
    expect(picked.map((entry) => entry.id).sort()).toEqual(['tr/seo-blog', 'tr/seo-sure']);
  });

  test('kategori yetmezse diğer kategorilerden tamamlanır', () => {
    const picked = pickRelatedPosts({ current: ALL[5]!, all: ALL, keys: [], count: 3 });
    expect(picked.length).toBe(3);
    expect(picked.map((entry) => entry.id)).not.toContain('tr/roas');
  });

  /**
   * Doldurma "en yeniden" başlasaydı bağlantılar hep aynı birkaç yeni yazıya
   * yığılır, eski yazılar hiç bağlantı almazdı (Semrush: "tek iç bağlantısı olan
   * sayfalar"). Halka sırası her yazıya eşit pay dağıtır.
   */
  test('aynı kategorideki her yazı doldurmadan eşit pay alır', () => {
    const seo = ALL.filter((entry) => entry.data.category === 'SEO');
    const counts = new Map<string, number>();
    for (const current of seo) {
      for (const entry of pickRelatedPosts({ current, all: seo, keys: [], count: 1 })) {
        counts.set(entry.id, (counts.get(entry.id) ?? 0) + 1);
      }
    }
    expect([...counts.values()]).toEqual([1, 1, 1]);
  });

  test('yazının kendisi asla listeye girmez', () => {
    const picked = pickRelatedPosts({ current: ALL[1]!, all: ALL, keys: ['seo-sure'], count: 3 });
    expect(picked.map((entry) => entry.id)).not.toContain('tr/seo-sure');
  });

  test('aynı yazı iki kez listelenmez', () => {
    const picked = pickRelatedPosts({ current: ALL[5]!, all: ALL, keys: ['seo-sure'], count: 3 });
    expect(new Set(picked.map((entry) => entry.id)).size).toBe(picked.length);
  });

  test('havuz küçükse istenen sayıdan az döner, patlamaz', () => {
    const picked = pickRelatedPosts({ current: ALL[0]!, all: [ALL[0]!, ALL[1]!], keys: [], count: 5 });
    expect(picked.map((entry) => entry.id)).toEqual(['tr/seo-sure']);
  });
});
