import type { Locale } from './i18n';

const TR_MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
] as const;

const WORDS_PER_MINUTE = 200;

/**
 * `14 Mart 2026` biçiminde Türkçe tarih. Yerel saat diliminden bağımsız olması için
 * UTC bileşenleri kullanılır — aksi halde gece yarısına yakın tarihler bir gün kayar.
 */
export function formatTurkishDate(date: Date): string {
  return `${date.getUTCDate()} ${TR_MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/**
 * BCP-47 etiketleri. `en-GB` bilinçli: gün-ay-yıl sırası Türkçe biçimle aynı kalır,
 * böylece iki dilde de aynı görsel ritim korunur (`14 March 2026`).
 */
const DATE_TAGS: Record<Locale, string> = { tr: 'tr-TR', en: 'en-GB' };

/**
 * Sayfanın diline göre uzun tarih. Türkçe elle üretilir (ICU'dan bağımsız, testli),
 * diğer diller `Intl` ile biçimlenir. Her iki dalda da UTC bileşenleri kullanılır —
 * aksi halde gece yarısına yakın tarihler bir gün kayar.
 */
export function formatDate(date: Date, locale: Locale): string {
  if (locale === 'tr') return formatTurkishDate(date);

  return date.toLocaleDateString(DATE_TAGS[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** `<time datetime="...">` için makine okunur tarih. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Yaklaşık okuma süresi (dakika); en az 1 döner. */
export function readingTime(text: string): number {
  const words = text
    .replace(/[#*_`>~[\]()]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
