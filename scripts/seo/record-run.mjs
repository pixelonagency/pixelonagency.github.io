/**
 * Zamanlanmış bir koşunun sonucunu gizli state'e yazar.
 *
 * Ayrı dosya olmasının sebebi: `bun -e` ile argv indeksleri sürüme göre kayabiliyor
 * ve sessizce yanlış argümanı okuyabiliyor. Zamanlayıcı muhasebesi sessizce
 * bozulabilecek bir yere konulmaz.
 *
 * Kullanım: bun scripts/seo/record-run.mjs <statePath> <mode> <exitCode> <isoTime> <logPath> [costUsd] [budgetUsd] [violation]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * @param {Record<string, any>} state
 * @param {string} mode
 * @param {number} exitCode
 * @returns {Record<string, any>}
 */
export function recordRun(state, mode, exitCode, when, logPath, extra = {}) {
  const next = { ...state };
  const scheduler = { ...(next.scheduler ?? {}) };
  const previous = scheduler[mode] ?? {};
  scheduler[mode] = {
    lastRun: when,
    lastExitCode: exitCode,
    lastLog: logPath,
    // Başarısız koşu, en son BAŞARILI koşunun kaydını silmez — aksi hâlde
    // "en son ne zaman çalıştı" bilgisi ilk hatada kaybolur.
    lastSuccessfulRun: exitCode === 0 ? when : (previous.lastSuccessfulRun ?? null),
    consecutiveFailures: exitCode === 0 ? 0 : (previous.consecutiveFailures ?? 0) + 1,
    // Ajan koşusuna özel alanlar; diğer modlarda verilmez ve yazılmaz.
    ...(extra.costUsd !== undefined ? { lastCostUsd: Number(extra.costUsd) } : {}),
    ...(extra.budgetUsd !== undefined ? { budgetUsd: Number(extra.budgetUsd) } : {}),
    ...(extra.violation !== undefined ? { lastViolation: extra.violation || null } : {}),
  };
  next.scheduler = scheduler;
  return next;
}

if (import.meta.main) {
  const [statePath, mode, exitCode, when, logPath, costUsd, budgetUsd, violation] = process.argv.slice(2);
  if (!statePath || !mode) {
    console.error('record-run: eksik argüman');
    process.exit(2);
  }
  mkdirSync(dirname(statePath), { recursive: true });
  let state = {};
  if (existsSync(statePath)) {
    try {
      state = JSON.parse(readFileSync(statePath, 'utf8'));
    } catch {
      // Bozuk state koşuyu düşürmez; yeniden kurulur.
    }
  }
  const extra = {};
  if (costUsd !== undefined) extra.costUsd = costUsd;
  if (budgetUsd !== undefined) extra.budgetUsd = budgetUsd;
  if (violation !== undefined) extra.violation = violation;
  writeFileSync(
    statePath,
    JSON.stringify(recordRun(state, mode, Number(exitCode), when, logPath, extra), null, 2) + '\n',
  );
  console.log(`record-run: ${mode} exit=${exitCode} kaydedildi`);
}
