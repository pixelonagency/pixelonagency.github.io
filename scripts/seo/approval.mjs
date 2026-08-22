/**
 * Onay çıkarımı koruması.
 *
 * Neden var: 22 Ağustos 2026'da `SEO-2026-0082` state'i "ONAYLANDI" olarak
 * yazıldı. Sahip onay vermemişti; verilen karar "UNBLOCKED / READY_FOR_APPROVAL"
 * idi. Onay, dolaylı sinyallerden çıkarılmıştı: görsel hazırdı, kuru prova
 * PASS'ti, varlık paralel bir oturumun push'uyla repoya girmişti. Bunların
 * hiçbiri onay değildir.
 *
 * Kural: onaylı bir duruma geçmek için AÇIK sahip talimatı ve kanıtı gerekir.
 * Kanıt yoksa görev `READY_FOR_APPROVAL` olarak kalır — sessizce yükselmez.
 */

/** Sahip onayı olmadan yazılamayacak durumlar. Modül dışına açılmaz. */
const APPROVED_STATUSES = new Set([
  'OWNER APPROVED',
  'APPROVED',
  'APPROVED_FOR_PUBLISH',
  'APPROVED_FOR_PREPARATION',
  'PUBLISHED',
  'PUBLISHED / MEASURING',
  'APPROVED / PREPARED',
]);

/**
 * Onay YERİNE GEÇMEYEN sinyaller. Bunlar bir görevi ilerletir ama onaylamaz.
 * Ajanın "demek ki onaylandı" diye okumaya en yatkın olduğu ifadeler.
 */
export const NON_APPROVAL_SIGNALS = [
  'hazırla',
  'prepare',
  'unblocked',
  'unblock',
  'finalize visual brief',
  'preview getir',
  'preview',
  "production'a dokunma",
  'do not touch production',
  'ready_for_approval',
  'dry-run passed',
  'dry run passed',
  'gate passed',
  'asset exists in repository',
  'committed by another session',
  'pushed by another session',
];

const isNonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;

/**
 * Bir metnin onay kanıtı sayılıp sayılmayacağı.
 * Yalnızca dolaylı sinyal içeren metin kanıt değildir.
 * @param {unknown} source
 * @returns {boolean}
 */
export function isApprovalEvidence(source) {
  if (!isNonEmpty(source)) return false;
  const s = String(source).trim().toLowerCase();
  return !NON_APPROVAL_SIGNALS.some((signal) => s.includes(signal));
}

/**
 * Görev durumunu doğrular. Onaylı duruma geçiş için üç alan da zorunludur.
 * @param {string} id
 * @param {Record<string, any>} task
 * @returns {{ ok: true } | { ok: false, reason: string, fallback: 'READY_FOR_APPROVAL' }}
 */
export function checkApproval(id, task) {
  const status = task?.status;
  if (!isNonEmpty(status)) return { ok: false, reason: `${id}: status yok`, fallback: 'READY_FOR_APPROVAL' };
  if (!APPROVED_STATUSES.has(status.trim().toUpperCase()) && !APPROVED_STATUSES.has(status.trim())) {
    return { ok: true };
  }

  const missing = ['approval_source', 'approval_timestamp', 'approval_scope'].filter(
    (field) => !isNonEmpty(task[field]),
  );
  if (missing.length > 0) {
    return {
      ok: false,
      reason: `${id}: "${status}" için onay kanıtı eksik → ${missing.join(', ')}`,
      fallback: 'READY_FOR_APPROVAL',
    };
  }
  if (!isApprovalEvidence(task.approval_source)) {
    return {
      ok: false,
      reason: `${id}: approval_source onay değil, dolaylı sinyal → "${task.approval_source}"`,
      fallback: 'READY_FOR_APPROVAL',
    };
  }
  return { ok: true };
}

/**
 * Tüm görev tablosunu tarar; kanıtsız yükseltilmiş görevleri döndürür.
 * @param {Record<string, any>} tasks
 * @returns {string[]} ihlal açıklamaları
 */
export function auditApprovals(tasks = {}) {
  const problems = [];
  for (const [id, task] of Object.entries(tasks)) {
    if (!task || typeof task !== 'object') continue;
    const result = checkApproval(id, task);
    if (!result.ok) problems.push(result.reason);
  }
  return problems;
}
