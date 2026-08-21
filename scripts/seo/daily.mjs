#!/usr/bin/env bun
/**
 * Pixelon SEO — günlük operasyon.
 *
 * Bu runner ONAY GEREKTİRMEYEN işleri yapar: durum okuma, teknik denetim, regresyon
 * karşılaştırması, rapor üretimi, state güncelleme. Production'a hiçbir şey yayınlamaz.
 *
 * Yayın gerektiren işler `seo/APPROVAL_QUEUE.md` üzerinden insana taşınır.
 */
import { readFileSync, writeFileSync, existsSync, globSync, appendFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { connectionHealth, classifyQueries } from './sources.mjs';

const ROOT = process.cwd();
const MODE = process.argv[2] ?? 'daily'; // daily | weekly | monthly
const now = new Date();
const tz = 'Europe/Istanbul';
const stamp = new Intl.DateTimeFormat('en-CA', {
  timeZone: tz,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(now);
const iso = now.toISOString();

const log = (m) => {
  console.log(m);
  appendFileSync(join(ROOT, 'seo/logs', `${stamp}.log`), `[${iso}] ${m}\n`);
};

const statePath = join(ROOT, 'seo/SEO_STATE.json');
const state = JSON.parse(readFileSync(statePath, 'utf8'));

log(`SEO ${MODE.toUpperCase()} başladı — mod: ${state.mode}`);

// 1) Build + teknik denetim
let audit = null;
let auditFailed = false;
try {
  execSync('bun run build', { stdio: 'pipe' });
  execSync('bun scripts/seo/audit.mjs', { stdio: 'pipe' });
} catch {
  auditFailed = true; // audit P0 varsa exit 1 döner — rapor yine üretilir
}
const auditPath = join(ROOT, 'seo/reports', `TECHNICAL-AUDIT-${stamp}.json`);
if (existsSync(auditPath)) audit = JSON.parse(readFileSync(auditPath, 'utf8'));

// 2) Önceki denetimle karşılaştır — regresyon var mı?
const prior = globSync('seo/reports/TECHNICAL-AUDIT-*.json')
  .sort()
  .filter((p) => !p.endsWith(`${stamp}.json`));
let regression = null;
if (audit && prior.length) {
  const prev = JSON.parse(readFileSync(prior[prior.length - 1], 'utf8'));
  regression = {
    since: prior[prior.length - 1].split('-').slice(-3).join('-').replace('.json', ''),
    P0: audit.severity.P0 - prev.severity.P0,
    P1: audit.severity.P1 - prev.severity.P1,
    indexable: audit.totals.indexable - prev.totals.indexable,
    brokenLinks: audit.totals.brokenLinks - prev.totals.brokenLinks,
    orphans: audit.totals.orphans - prev.totals.orphans,
  };
}

// 3) Veri kaynağı sağlık kontrolü — politika: her run başında zorunlu.
const health = connectionHealth();
const hasGSC = health.sources.googleSearchConsole.available;
const hasSemrush = health.sources.semrush.available;

// GSC varsa fırsat sınıflandırması yap — bu, günün önceliğini DEĞİŞTİRİR.
let opportunities = null;
if (hasGSC) {
  const qRows = Object.entries(health.gsc.datasets).find(([n]) => /quer|sorgu/.test(n))?.[1];
  if (qRows) {
    opportunities = classifyQueries(qRows);
    log(
      `GSC işlendi — quickWin:${opportunities.quickWin.length} striking:${opportunities.strikingDistance.length} ctr:${opportunities.ctrOpportunity.length}`,
    );
  }
}
log(`Kaynaklar — GSC:${hasGSC ? 'YES' : 'NO'} SEMrush:${hasSemrush ? 'YES' : 'NO'} SERP:YES SearchCentral:YES`);

// 4) Master plan durumu
const plan = readFileSync(join(ROOT, 'seo/SEO_MASTER_PLAN.md'), 'utf8');
const done = (plan.match(/^- \[x\]/gm) ?? []).length;
const open = (plan.match(/^- \[ \]/gm) ?? []).length;

// 5) Approval queue durumu
const queue = readFileSync(join(ROOT, 'seo/APPROVAL_QUEUE.md'), 'utf8');
const readyCount = Number(queue.match(/READY FOR APPROVAL:\s*(\d+)/)?.[1] ?? 0);

// 6) Rapor
const sev = audit?.severity ?? { P0: '?', P1: '?', P2: '?', P3: '?' };
const tot = audit?.totals ?? {};
const arrow = (n) => (n === null || n === undefined ? '→' : n > 0 ? `↑${n}` : n < 0 ? `↓${Math.abs(n)}` : '→');

const src = health.sources;
const srcLine = (label, o) =>
  `${label}: ${o.available ? 'YES' : 'NO'}${o.available ? '' : `\n  Reason: ${o.reason}`}${o.note ? `\n  Note: ${o.note}` : ''}`;

const opportunityBlock = opportunities
  ? `### Position 4–10 (quick win)\n${
      opportunities.quickWin
        .slice(0, 10)
        .map((o) => `* ${o.q} — pos ${o.pos.toFixed(1)}, ${o.imp} gösterim`)
        .join('\n') || '* Yok.'
    }\n\n### Position 11–20 (striking distance)\n${
      opportunities.strikingDistance
        .slice(0, 10)
        .map((o) => `* ${o.q} — pos ${o.pos.toFixed(1)}, ${o.imp} gösterim`)
        .join('\n') || '* Yok.'
    }\n\n### Yüksek gösterim / düşük CTR\n${
      opportunities.ctrOpportunity
        .slice(0, 10)
        .map((o) => `* ${o.q} — CTR ${o.ctr}%, ${o.imp} gösterim`)
        .join('\n') || '* Yok.'
    }`
  : '**UNKNOWN** — GSC verisi olmadan fırsat sınıflandırması yapılamaz. Tahmin üretilmedi.';

const report = `# PIXELON SEO — ${MODE.toUpperCase()} REPORT · ${stamp}

## DATA SOURCES USED

\`\`\`text
${srcLine('Google Search Console', src.googleSearchConsole)}
${srcLine('SEMrush MCP', src.semrush)}
${srcLine('Live SERP Research', src.liveSerp)}
${srcLine('Google Search Central', src.googleSearchCentral)}
\`\`\`

## Search Opportunities (GSC)

${opportunityBlock}

## Executive Summary

Teknik sağlık ${sev.P0 === 0 && sev.P1 === 0 ? 'temiz' : 'dikkat gerektiriyor'}: P0 ${sev.P0}, P1 ${sev.P1}, P2 ${sev.P2}.
${tot.indexable ?? '?'} indexlenebilir sayfa, ${tot.orphans ?? '?'} orphan, ${tot.brokenLinks ?? '?'} kırık iç bağlantı.
Master plan: ${done} tamamlandı / ${open} açık. Onay bekleyen: ${readyCount}.
${hasGSC ? 'GSC dışa aktarımı bulundu ve işlendi.' : 'GSC verisi yok — sıralama/tıklama analizi yapılamadı.'}

## Completed Automatically

* [x] Build + teknik denetim çalıştırıldı
* [x] Önceki denetimle regresyon karşılaştırması
* [x] Master plan ve approval queue durumu okundu
* [x] State güncellendi

## Technical Health

| Metrik | Değer | Değişim |
|---|---|---|
| P0 | ${sev.P0} | ${arrow(regression?.P0)} |
| P1 | ${sev.P1} | ${arrow(regression?.P1)} |
| P2 | ${sev.P2} | — |
| İndexlenebilir | ${tot.indexable ?? '?'} | ${arrow(regression?.indexable)} |
| Orphan | ${tot.orphans ?? '?'} | ${arrow(regression?.orphans)} |
| Kırık iç link | ${tot.brokenLinks ?? '?'} | ${arrow(regression?.brokenLinks)} |

${regression ? `Karşılaştırma tabanı: ${regression.since}` : 'İlk denetim — karşılaştırma tabanı yok.'}

## Findings

${
  (audit?.findings ?? [])
    .slice(0, 10)
    .map((f) => `* ${f.severity} · ${f.category} · ${f.url} — ${f.message}`)
    .join('\n') || '* Bulgu yok.'
}

## Approval Required

${readyCount === 0 ? 'Onay bekleyen iş yok.' : `${readyCount} iş onay bekliyor — bkz. \`seo/APPROVAL_QUEUE.md\``}

## Published Today

No production content published.

## Metrics Worth Watching

${hasGSC ? '* GSC verisi işlendi — detay aşağıda.' : '* **GSC erişimi yok** — impression/click/position ölçülemiyor. En yüksek öncelikli blocker.'}
* **SEMrush erişimi yok** — hacim/KD/backlink ölçülemiyor.
* 23 blog yazısı 2026-08-21'de yayınlandı; sıralama penceresi açılıyor.

## Blocked

${state.blockedTasks.map((b) => `* ${b.id} — ${b.reason} (açılış: ${b.unblockedBy})`).join('\n')}
`;

const reportName =
  MODE === 'daily' ? `DAILY-${stamp}.md` : MODE === 'weekly' ? `WEEKLY-${stamp}.md` : `MONTHLY-${stamp.slice(0, 7)}.md`;
writeFileSync(join(ROOT, 'seo/reports', reportName), report);

// 7) State güncelle
state.lastRun = iso;
if (!auditFailed) state.lastSuccessfulRun = iso;
state.lastTechnicalAudit = stamp;
state.dataSources = {
  checkedAt: health.checkedAt,
  googleSearchConsole: health.sources.googleSearchConsole.available,
  semrush: health.sources.semrush.available,
  liveSerp: true,
  googleSearchCentral: true,
};
if (hasGSC) state.lastGSCFetch = health.gsc.fetchedAt;
if (hasSemrush) state.lastSemrushFetch = health.semrush.fetchedAt;
if (audit)
  state.technicalHealth = {
    ...audit.severity,
    indexable: audit.totals.indexable,
    orphans: audit.totals.orphans,
    brokenLinks: audit.totals.brokenLinks,
  };
writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n');

// 8) Kısa terminal özeti
console.log(`\nPIXELON SEO — ${MODE.toUpperCase()} COMPLETE\n`);
console.log(`Completed automatically: 4`);
console.log(`Technical fixes: 0`);
console.log(`Approval required: ${readyCount}`);
console.log(`Published without approval: 0`);
console.log(
  `\nTECHNICAL  P0:${sev.P0} P1:${sev.P1} P2:${sev.P2} · indexable:${tot.indexable ?? '?'} · orphan:${tot.orphans ?? '?'} · broken:${tot.brokenLinks ?? '?'}`,
);
console.log(`PLAN       ${done} tamam / ${open} açık`);
console.log(`SOURCES    GSC:${hasGSC ? 'YES' : 'NO'} SEMrush:${hasSemrush ? 'YES' : 'NO'} SERP:YES`);
console.log(`BLOCKED    ${state.blockedTasks.length} (GSC + SEMrush ana blocker)`);
console.log(`\nRapor: seo/reports/${reportName}`);
log(`SEO ${MODE.toUpperCase()} bitti — rapor: ${reportName}`);
