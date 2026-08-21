/**
 * SEO operasyonunun tek tarih kaynağı.
 *
 * Neden ayrı bir modül: `audit.mjs` UTC (`toISOString`), `daily.mjs` Europe/Istanbul
 * kullanıyordu. Gece 00:00–03:00 arasında ikisi farklı gün üretiyor, `daily.mjs` o günün
 * denetim dosyasını bulamıyor ve tüm teknik metrikler sessizce "?" oluyordu. 05:00
 * zamanlanmış koşuda hiç görünmediği için aylarca fark edilmeyebilirdi.
 */
export const TZ = 'Europe/Istanbul';

/** `YYYY-MM-DD` — Türkiye saatine göre. @param {Date} [date] */
export function stampFor(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
