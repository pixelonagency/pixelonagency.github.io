/**
 * Çok dillilik çekirdeği.
 *
 * URL stratejisi: **varsayılan dil kökte kalır**, diğerleri ön ekli olur.
 *   tr (varsayılan) → /hizmetlerimiz
 *   en             → /en/services
 *
 * Bu, canlıda zaten yayında olan Türkçe URL'lerin bozulmamasını sağlar (SEO kaybı yok).
 *
 * Slug'lar dile göre ÇEVRİLİR — `/en/hizmetlerimiz` gibi melez yollar üretilmez.
 * Latin harfli olmayan diller için slug transliterasyonla yazılır (ör. ar → `al-khadamat`).
 */

import { internalHref } from './url';

export const LOCALES = ['tr', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/** Dizinin ilk elemanı varsayılan dildir — tek kaynak. */
export const DEFAULT_LOCALE: Locale = LOCALES[0];

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Sayfa anahtarı → dile göre slug. Boş string ana sayfayı temsil eder. */
export const ROUTE_SLUGS = {
  home: { tr: '', en: '' },
  about: { tr: 'biz-kimiz', en: 'about-us' },
  services: { tr: 'hizmetlerimiz', en: 'services' },
  website: { tr: 'web-sitesi-yaptir', en: 'get-a-website' },
  projects: { tr: 'projelerimiz', en: 'projects' },
  references: { tr: 'referanslarimiz', en: 'references' },
  blog: { tr: 'blog', en: 'blog' },
  careers: { tr: 'kariyer', en: 'careers' },
  contact: { tr: 'iletisim', en: 'contact' },
  analysis: { tr: 'ucretsiz-analiz', en: 'free-analysis' },
  kvkk: { tr: 'kvkk-aydinlatma-metni', en: 'personal-data-processing-notice' },
  privacy: { tr: 'gizlilik-politikasi', en: 'privacy-policy' },
  cookies: { tr: 'cerez-politikasi', en: 'cookie-policy' },
  terms: { tr: 'kullanim-kosullari', en: 'terms-of-use' },
} as const satisfies Record<string, Record<Locale, string>>;

export type PageKey = keyof typeof ROUTE_SLUGS;

/** Varsayılan dil ön eksizdir; diğerleri `/xx`. */
export function localePrefix(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? '' : `/${locale}`;
}

/**
 * Bir sayfanın (ve isteğe bağlı alt kaynağın) verilen dildeki yolu.
 *
 * Dönen değer KANONİK biçimdedir: sonda her zaman eğik çizgi bulunur. Site dizin
 * biçiminde yayınlandığı için sunucu eğik çizgisiz isteği 301 ile buraya taşır;
 * bağlantıyı baştan kanonik yazmak o yönlendirmeyi site içinde hiç doğurmaz.
 * Rota üretimi (`getStaticPaths`) yol parametresini kendi normalize eder.
 */
export function localizedPath(page: PageKey, locale: Locale, child?: string): string {
  const prefix = localePrefix(locale);
  const slug = ROUTE_SLUGS[page][locale];

  const segments = [slug, child].filter((part): part is string => Boolean(part));
  const tail = segments.join('/');

  if (!tail) return internalHref(prefix || '/');
  return internalHref(`${prefix}/${tail}`);
}

/** `/en/services/` → `{ locale: 'en', rest: 'services' }` */
export function parseLocalizedPath(path: string): { locale: Locale; rest: string } {
  const clean = path.replace(/^\/+/, '').replace(/\/+$/, '');
  if (clean === '') return { locale: DEFAULT_LOCALE, rest: '' };

  const [first, ...others] = clean.split('/');
  if (first && isLocale(first) && first !== DEFAULT_LOCALE) {
    return { locale: first, rest: others.join('/') };
  }
  return { locale: DEFAULT_LOCALE, rest: clean };
}

/** Dil ön ekini yoldan çıkarır. */
export function stripLocale(path: string): string {
  const { rest } = parseLocalizedPath(path);
  return `/${rest}`;
}

/**
 * hreflang için tüm dillerdeki karşılıklar.
 * `children` verilirse detay sayfası içindir; bir dilde slug yoksa o dil listeden düşer
 * (o dile çevrilmemiş bir yazıya hreflang vermek yanlış olurdu).
 */
export function alternatesFor(
  page: PageKey,
  children?: Partial<Record<Locale, string>>,
): Partial<Record<Locale, string>> {
  const result: Partial<Record<Locale, string>> = {};

  for (const locale of LOCALES) {
    if (children) {
      const child = children[locale];
      if (!child) continue;
      result[locale] = localizedPath(page, locale, child);
    } else {
      result[locale] = localizedPath(page, locale);
    }
  }

  return result;
}

/**
 * İçerik girdisinin kimliği: `<locale>/<key>`.
 * İstenen dilde yoksa **varsayılan dile düşer** — çeviri eksikse sayfa kaybolmaz.
 * Varsayılanda da yoksa `null`.
 */
export function resolveEntryId(key: string, locale: Locale, exists: (id: string) => boolean): string | null {
  const wanted = `${locale}/${key}`;
  if (exists(wanted)) return wanted;

  const fallback = `${DEFAULT_LOCALE}/${key}`;
  return exists(fallback) ? fallback : null;
}

/** Alan bazlı yedekleme: dil karşılığı boş/tanımsızsa varsayılan dildeki değer. */
export function pickLocalized<T>(values: Partial<Record<Locale, T>>, locale: Locale): T | undefined {
  const wanted = values[locale];
  if (wanted !== undefined && wanted !== '') return wanted;
  return values[DEFAULT_LOCALE];
}
