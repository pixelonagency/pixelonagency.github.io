/**
 * Blog kategori merkezleri.
 *
 * Kategoriler şimdiye kadar yalnızca yazı üstünde duran bir ETİKETTİ: hedefi yoktu,
 * tıklanamıyordu ve aynı konudaki yazılar birbirine yalnızca "İlgili Yazılar" üzerinden
 * değiyordu. Bunun iki somut bedeli vardı — Search Console blog yazılarında
 * "item alanı eksik (itemListElement içinde)" hatası veriyordu (kırıntı hedefsizdi,
 * bkz. `breadcrumbSchema`) ve aynı konudaki yazılar hizmet sayfasına toplu bir
 * giriş noktası oluşturamıyordu.
 *
 * EŞİK — neden var: tek yazılık bir kategori sayfası indekse giren ama hiçbir şey
 * anlatmayan bir listedir; Google bunu zayıf içerik olarak değerlendirir. Bu yüzden
 * sayfa yalnızca `CATEGORY_MIN_POSTS` ve üzeri yazıya sahip kategoriler için üretilir.
 * Eşiğin altındaki kategoriler etiket olarak yaşamaya devam eder — yalnızca hedefleri
 * olmaz, `breadcrumbSchema` da hedefsiz ara kırıntıyı kendiliğinden düşürür.
 */
import { localizedPath, type Locale } from './i18n';
import { slugify } from './slug';

/** Bu sayıdan az yazısı olan kategori için sayfa üretilmez. */
export const CATEGORY_MIN_POSTS = 3;

/**
 * Kategori listelerinin yol segmenti — dile göre çevrilir.
 * Yola yalnızca `categoryPath()` üzerinden girer; dışarı açılmaz ki kategori
 * adresleri tek bir yerden üretilsin.
 */
const CATEGORY_SEGMENT: Record<Locale, string> = { tr: 'kategori', en: 'category' };

export interface CategorizablePost {
  /** `<locale>/<slug>` biçiminde koleksiyon kimliği. */
  id: string;
  data: {
    category: string;
    date: Date;
  };
}

export interface CategoryGroup<T extends CategorizablePost = CategorizablePost> {
  /** İçerikte yazıldığı hâliyle görünen ad — başlıkta ve kırıntıda bu kullanılır. */
  name: string;
  slug: string;
  locale: Locale;
  /** En yeniden eskiye. */
  posts: T[];
}

const localeOf = (id: string): string => id.split('/')[0] ?? '';

const newestFirst = (a: CategorizablePost, b: CategorizablePost): number =>
  b.data.date.getTime() - a.data.date.getTime();

/** Kategori adından URL-güvenli slug. */
export function categorySlug(name: string): string {
  return slugify(name);
}

/** Kategori sayfasının kanonik yolu (sonda eğik çizgi ile). */
export function categoryPath(locale: Locale, name: string): string {
  return localizedPath('blog', locale, `${CATEGORY_SEGMENT[locale]}/${categorySlug(name)}`);
}

/**
 * Verilen dildeki yazıları kategoriye göre gruplar.
 *
 * Sıra rastgele değil: en çok yazısı olan kategori önce gelir, eşitlikte ada göre
 * alfabetik. Böylece kategori listesi build'den build'e aynı sırayla üretilir —
 * sıralaması oynayan bir liste her yayında gereksiz diff yaratıyordu.
 */
export function groupByCategory<T extends CategorizablePost>(posts: T[], locale: Locale): CategoryGroup<T>[] {
  const groups = new Map<string, CategoryGroup<T>>();

  for (const entry of posts) {
    if (localeOf(entry.id) !== locale) continue;

    const name = entry.data.category;
    const slug = categorySlug(name);
    const group = groups.get(slug) ?? { name, slug, locale, posts: [] };

    group.posts.push(entry);
    groups.set(slug, group);
  }

  return [...groups.values()]
    .map((group) => ({ ...group, posts: [...group.posts].sort(newestFirst) }))
    .sort((a, b) => b.posts.length - a.posts.length || a.name.localeCompare(b.name, 'tr'));
}

/** Yalnızca kendi sayfasını hak eden kategoriler. */
export function categoriesWithPages<T extends CategorizablePost>(posts: T[], locale: Locale): CategoryGroup<T>[] {
  return groupByCategory(posts, locale).filter((group) => group.posts.length >= CATEGORY_MIN_POSTS);
}

/**
 * Bu kategorinin bir hedefi var mı?
 *
 * Kırıntı ve etiket bağlantıları bunu sorar: yoksa bağlantı hiç kurulmaz, böylece
 * 404'e giden bir kategori bağlantısı üretilemez.
 */
export function hasCategoryPage(posts: CategorizablePost[], locale: Locale, name: string): boolean {
  const slug = categorySlug(name);
  return categoriesWithPages(posts, locale).some((group) => group.slug === slug);
}
