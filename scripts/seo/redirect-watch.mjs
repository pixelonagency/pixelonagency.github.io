/**
 * 404 dönen ama Google'da hâlâ sıralanan URL'lerin haftalık takibi.
 *
 * Neden: 8 eski URL 404 veriyor, bazıları 1–3. sırada. Redirect kararı TLS mimarisi
 * çözülene kadar ertelendi. Bu script, ertelemenin bedelini ÖLÇÜLEBİLİR tutar —
 * gösterim/tıklama/pozisyon eğrisi bozulmaya başlarsa aciliyet veriyle savunulur.
 *
 * Çıktı gizli katmana yazılır: URL + pozisyon kombinasyonu hassastır.
 *
 * Çalıştırma: bun run seo:watch404
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { join } from 'node:path';
import { parseCsv } from './sources.mjs';
import { stampFor } from './clock.mjs';

const ROOT = process.cwd();
const HISTORY = join(ROOT, 'seo/private/redirects/watch-history.jsonl');

/** İzlenen eski URL'ler ve karar durumları. */
export const WATCHED = [
  { path: '/hizmet/web-tasarim-yazilim/', status: 'APPROVED' },
  { path: '/hizmet/sosyal-medya-yonetimi/', status: 'APPROVED' },
  { path: '/hizmet/dijital-reklam-yonetimi/', status: 'APPROVED' },
  { path: '/hizmet/seo-icerik-uretimi/', status: 'APPROVED' },
  { path: '/hizmet/fotograf-video-produksiyon/', status: 'APPROVED' },
  { path: '/referanslar/', status: 'APPROVED' },
  { path: '/hizmet/markalasma-kreatif-cozumler/', status: 'HOLD' },
  { path: '/hizmet/mobil-uygulama/', status: 'HOLD' },
];

const num = (v) => Number(String(v ?? '').replace(/[%,]/g, '')) || 0;

/**
 * GSC sayfa satırlarından izlenen URL'lerin metriklerini çıkarır.
 * Veri yoksa sıfır uydurmaz — `seen: false` ile işaretler.
 */
export function extractWatched(pageRows, watched = WATCHED, origin = 'https://pixelon.com.tr') {
  const byPath = new Map();
  for (const r of pageRows ?? []) {
    const url = r.page ?? r.url ?? '';
    byPath.set(url.replace(origin, ''), r);
  }
  return watched.map((w) => {
    const r = byPath.get(w.path);
    return r
      ? {
          path: w.path,
          status: w.status,
          seen: true,
          impressions: num(r.impressions),
          clicks: num(r.clicks),
          position: num(r.position),
        }
      : { path: w.path, status: w.status, seen: false, impressions: 0, clicks: 0, position: null };
  });
}

/** Bir önceki ölçümle karşılaştırıp yön verir. */
export function diffAgainst(current, previous) {
  const prev = new Map((previous ?? []).map((r) => [r.path, r]));
  return current.map((c) => {
    const p = prev.get(c.path);
    return {
      ...c,
      deltaImpressions: p ? c.impressions - p.impressions : null,
      deltaPosition:
        p && p.position !== null && c.position !== null ? Number((c.position - p.position).toFixed(2)) : null,
    };
  });
}

/** Toplam — public rapora yalnızca bu sayılar girebilir (URL taşımaz). */
export function totals(rows) {
  const seen = rows.filter((r) => r.seen);
  return {
    watchedCount: rows.length,
    seenInGsc: seen.length,
    impressions: seen.reduce((s, r) => s + r.impressions, 0),
    clicks: seen.reduce((s, r) => s + r.clicks, 0),
    bestPosition: seen.length ? Math.min(...seen.map((r) => r.position ?? Infinity)) : null,
  };
}

function main() {
  const files = globSync('seo/data/gsc/*/pages.csv').sort();
  if (!files.length) {
    console.error('✖ GSC verisi yok — önce `bun run seo:gsc` çalıştır.');
    process.exit(2);
  }
  const latest = files[files.length - 1];
  const rows = extractWatched(parseCsv(readFileSync(latest, 'utf8')));

  let previous = null;
  if (existsSync(HISTORY)) {
    const lines = readFileSync(HISTORY, 'utf8').trim().split('\n').filter(Boolean);
    if (lines.length) previous = JSON.parse(lines[lines.length - 1]).rows;
  }
  const diffed = diffAgainst(rows, previous);
  const t = totals(rows);

  console.log(`\n404 REDIRECT WATCH — ${stampFor()}  (kaynak: ${latest})\n`);
  console.log(
    `${'durum'.padEnd(9)}${'URL'.padEnd(42)}${'gös'.padStart(5)}${'tık'.padStart(5)}${'poz'.padStart(8)}${'Δgös'.padStart(7)}${'Δpoz'.padStart(8)}`,
  );
  for (const r of diffed) {
    const d = (v, suffix = '') => (v === null ? '—' : `${v > 0 ? '+' : ''}${v}${suffix}`);
    console.log(
      r.status.padEnd(9) +
        r.path.padEnd(42) +
        String(r.impressions).padStart(5) +
        String(r.clicks).padStart(5) +
        (r.position === null ? '—' : r.position.toFixed(2)).padStart(8) +
        d(r.deltaImpressions).padStart(7) +
        d(r.deltaPosition).padStart(8),
    );
  }
  console.log(
    `\nTOPLAM  ${t.impressions} gösterim · ${t.clicks} tıklama · ${t.seenInGsc}/${t.watchedCount} URL GSC'de görünüyor`,
  );
  console.log(`En iyi pozisyon: ${t.bestPosition ?? 'UNKNOWN'}`);

  mkdirSync(join(ROOT, 'seo/private/redirects'), { recursive: true });
  appendFileSync(HISTORY, JSON.stringify({ date: stampFor(), source: latest, totals: t, rows }) + '\n');
  console.log(`\n→ ${HISTORY} (gitignored)`);
}

if (import.meta.main) main();
