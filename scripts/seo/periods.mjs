/**
 * Dönem matematiği — haftalık/aylık karşılaştırmaların tek kaynağı.
 *
 * GSC verisi ~2 gün gecikmeli geldiği için tüm pencereler LAG_DAYS kadar geriden biter.
 * "Önceki dönem" mevcut dönemin bittiği yerden değil, BAŞLADIĞI yerden bir gün önce biter —
 * aksi hâlde iki pencere bir gün üst üste biner ve karşılaştırma bozulur.
 */
export const LAG_DAYS = 3;
const DAY = 86400000;
const iso = (d) => d.toISOString().slice(0, 10);

/** @param {Date} now @param {number} days */
export function windowFor(now, days, offsetWindows = 0) {
  const end = new Date(now.getTime() - (LAG_DAYS + offsetWindows * days) * DAY);
  const start = new Date(end.getTime() - (days - 1) * DAY);
  return { startDate: iso(start), endDate: iso(end), days };
}

/** Mevcut ve önceki dönem, üst üste binmeden. */
export function comparePair(now, days) {
  return { current: windowFor(now, days, 0), previous: windowFor(now, days, 1) };
}

/**
 * Bir koşunun çekmesi gereken tüm pencereler.
 * Ad → API tarih aralığı. Adlar dosya sistemine klasör olarak yansır.
 */
export function windowPlan(now) {
  const w7 = comparePair(now, 7);
  const w28 = comparePair(now, 28);
  return {
    w7: w7.current,
    'w7-prev': w7.previous,
    w28: w28.current,
    'w28-prev': w28.previous,
    d90: windowFor(now, 90, 0),
  };
}

/** Yüzde değişim. Payda sıfırsa null döner — bölme hatası yerine UNKNOWN. */
export function pctChange(current, previous) {
  if (!previous) return null;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}
