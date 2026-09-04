import { DEFAULT_LOCALE, type Locale } from './i18n';

/**
 * Vaka sayfasındaki hizmet çipini ilgili hizmet sayfasının slug'ına eşler.
 *
 * Proje sayfaları MÜŞTERİ bazlıdır: bir vaka, o marka için yapılan bütün
 * hizmetleri barındırır. Bu yüzden vaka tek bir hizmete daraltılmaz; hero'daki
 * çipler ayrı ayrı kendi hizmet sayfasına bağlanır. Kümenin eksik yarısı buydu:
 * hizmet → proje bağlantısı vardı, proje → hizmet yoktu.
 *
 * Eşleşme çip METNİ üzerinden yapılır çünkü içerik dosyalarında çipler serbest
 * metindir ("Web Tasarımı", "Web Sitesi Tasarımı & Geliştirme", "Web Design"…).
 * Karşılığı olmayan kalem `null` döner ve düz metin kalır — kırık link üretmeyiz.
 *
 * DİL BİLİNCİ ZORUNLU: hizmet slug'ları iki dilde farklıdır
 * (`marka-ve-kurumsal-kimlik` ↔ `brand-and-corporate-identity`). İlk sürüm
 * dili yok saydığı için İngilizce çipler Türkçe slug üretti ve 11 kırık link
 * oluştu; o yüzden slug artık locale'e göre seçiliyor.
 */

/** Türkçe karakterleri sadeleştirip küçük harfe indirir. */
function normalize(value: string): string {
  return value
    .toLocaleLowerCase('tr')
    .replaceAll('ı', 'i')
    .replaceAll('İ', 'i')
    .replaceAll('ş', 's')
    .replaceAll('ğ', 'g')
    .replaceAll('ü', 'u')
    .replaceAll('ö', 'o')
    .replaceAll('ç', 'c')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Hizmetin dile göre slug'ı — içerik dosyalarındaki dosya adlarıyla birebir. */
const SLUGS = {
  brand: { tr: 'marka-ve-kurumsal-kimlik', en: 'brand-and-corporate-identity' },
  web: { tr: 'web-tasarim-ve-yazilim', en: 'web-design-and-development' },
  social: { tr: 'sosyal-medya-yonetimi', en: 'social-media-management' },
  ads: { tr: 'dijital-reklam-yonetimi', en: 'digital-advertising' },
  seo: { tr: 'seo-ve-icerik-pazarlamasi', en: 'seo-and-content-marketing' },
  ecommerce: { tr: 'e-ticaret-cozumleri', en: 'e-commerce-solutions' },
  health: { tr: 'saglik-turizmi-danismanligi', en: 'health-tourism-consulting' },
} as const satisfies Record<string, Record<Locale, string>>;

type ServiceKey = keyof typeof SLUGS;

/**
 * Sıra ÖNEMLİ: yukarıdaki kural önce dener. "Marka İletişimi" hem markaya hem
 * iletişime benziyor; marka kuralı üstte olduğu için marka kazanır. Desenler
 * iki dili birlikte kapsar — çip metni hangi dilde yazılmışsa onu yakalar.
 */
const RULES: ReadonlyArray<readonly [key: ServiceKey, patterns: readonly string[]]> = [
  ['health', ['hasta', 'saglik turizmi', 'patient', 'health tourism']],
  ['ecommerce', ['e-ticaret', 'eticaret', 'urun satis', 'urun katalogu', 'e-commerce', 'product catalog']],
  ['brand', ['logo', 'kurumsal kimlik', 'marka', 'amblem', 'brand', 'corporate identity', 'emblem']],
  ['web', ['web tasarim', 'web sitesi', 'web sayfasi', 'yazilim', 'web design', 'website', 'development']],
  ['social', ['sosyal medya', 'social media', 'instagram', 'reels']],
  ['ads', ['reklam', 'advertising', 'google ads', 'meta ads', 'performans pazarlama', 'performance marketing']],
  ['seo', ['seo', 'icerik', 'content']],
] as const;

/** Çip metnine karşılık gelen hizmet slug'ı; yoksa `null`. */
export function serviceSlugForChip(chip: string, locale: Locale = DEFAULT_LOCALE): string | null {
  const value = normalize(chip);
  if (!value) return null;
  for (const [key, patterns] of RULES) {
    if (patterns.some((pattern) => value.includes(pattern))) return SLUGS[key][locale];
  }
  return null;
}
