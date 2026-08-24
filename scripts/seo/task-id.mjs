/**
 * Görev kimliği üretimi ve senkron denetimi.
 *
 * Neden var: 24 Ağustos 2026'da otonom ajan `SEO-2026-0093` kimliğini ikinci
 * kez kullandı ve bir gün önceki kaydın üzerine yazdı. Sebep, public state'teki
 * `nextTaskIdCounter` alanının **hiçbir yerde okunmuyor ve yazılmıyor** olması
 * — elle tutulan dekoratif bir sayıydı ve 68'de kalmıştı; gerçek en yüksek
 * kimlik ise 105'ti.
 *
 * Kural: sonraki kimlik her zaman görev tablosundan TÜRETİLİR, tahmin edilmez.
 */

const ID_RE = /^SEO-(\d{4})-(\d{4})$/;

/**
 * Görev tablosundaki en yüksek sıra numarası.
 * @param {Record<string, unknown>} tasks
 * @returns {number} kimlik yoksa 0
 */
export function maxTaskNumber(tasks = {}) {
  let max = 0;
  for (const key of Object.keys(tasks)) {
    const m = ID_RE.exec(key);
    if (m) max = Math.max(max, Number(m[2]));
  }
  return max;
}

/**
 * Bir sonraki kullanılabilir görev kimliği.
 * @param {Record<string, unknown>} tasks
 * @param {number} year
 * @returns {string} ör. `SEO-2026-0106`
 */
export function nextTaskId(tasks = {}, year = new Date().getFullYear()) {
  const n = maxTaskNumber(tasks) + 1;
  if (n > 9999) throw new Error('Görev kimliği 9999 sınırını aştı — şema genişletilmeli.');
  return `SEO-${year}-${String(n).padStart(4, '0')}`;
}

/**
 * Sayaç ile gerçek tablo arasındaki kaymayı yakalar.
 *
 * Sayaç, bir sonraki kimliği göstermelidir: en yüksek numaradan BÜYÜK olmalı.
 * Küçük veya eşitse, o sayaçla üretilecek kimlik mevcut bir kaydın üzerine
 * yazar — 0093'te tam olarak bu oldu.
 *
 * @param {number} counter public state'teki `nextTaskIdCounter`
 * @param {Record<string, unknown>} tasks private state'teki `seoTasks`
 * @returns {{ ok: true } | { ok: false, reason: string, expected: number }}
 */
export function checkCounter(counter, tasks = {}) {
  const max = maxTaskNumber(tasks);
  const expected = max + 1;
  if (!Number.isInteger(counter)) {
    return { ok: false, reason: `nextTaskIdCounter sayı değil: ${counter}`, expected };
  }
  if (counter <= max) {
    return {
      ok: false,
      reason: `nextTaskIdCounter=${counter}, en yüksek kimlik=${max} — bu sayaçla üretilecek kimlik MEVCUT bir kaydın üzerine yazar.`,
      expected,
    };
  }
  return { ok: true };
}
