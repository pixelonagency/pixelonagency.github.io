/**
 * Vaka sayfasındaki hizmet çipini ilgili hizmet sayfasına eşler.
 *
 * Proje sayfaları MÜŞTERİ bazlıdır: bir vaka, o marka için yapılan bütün
 * hizmetleri barındırır. Bu yüzden vaka tek bir hizmete daraltılmaz; hero'daki
 * çipler ayrı ayrı kendi hizmet sayfasına bağlanır. Kümenin eksik yarısı buydu:
 * hizmet → proje bağlantısı vardı, proje → hizmet yoktu.
 *
 * Eşleşme çip METNİ üzerinden yapılır çünkü içerik dosyalarında çipler serbest
 * metindir ("Web Tasarımı", "Web Sitesi Tasarımı & Geliştirme", "web tasarim"…).
 * Karşılığı olmayan kalem `null` döner ve düz metin kalır — kırık link üretmeyiz.
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
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sıra ÖNEMLİ: yukarıdaki kural önce dener. "Marka İletişimi" hem markaya hem
 * iletişime benziyor; marka kuralı üstte olduğu için marka kazanır.
 */
const RULES: ReadonlyArray<readonly [slug: string, patterns: readonly string[]]> = [
  ['saglik-turizmi-danismanligi', ['hasta', 'saglik turizmi']],
  ['e-ticaret-cozumleri', ['e-ticaret', 'eticaret', 'urun satis', 'urun katalogu']],
  ['marka-ve-kurumsal-kimlik', ['logo', 'kurumsal kimlik', 'marka', 'amblem']],
  ['web-tasarim-ve-yazilim', ['web tasarim', 'web sitesi', 'web sayfasi', 'yazilim']],
  ['sosyal-medya-yonetimi', ['sosyal medya', 'instagram', 'reels']],
  ['dijital-reklam-yonetimi', ['reklam', 'google ads', 'meta ads', 'performans pazarlama']],
  ['seo-ve-icerik-pazarlamasi', ['seo', 'icerik']],
] as const;

/** Çip metnine karşılık gelen hizmet slug'ı; yoksa `null`. */
export function serviceSlugForChip(chip: string): string | null {
  const value = normalize(chip);
  if (!value) return null;
  for (const [slug, patterns] of RULES) {
    if (patterns.some((pattern) => value.includes(pattern))) return slug;
  }
  return null;
}
