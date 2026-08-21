/**
 * SEMrush MCP → SEO runner köprüsü.
 *
 * Sorun: SEMrush MCP yalnızca Claude oturumunda yaşıyor; `daily.mjs` onu göremiyor.
 * Çözüm: MCP çıktısı bu köprüden geçirilip **normalize** edilerek gizli katmana yazılır.
 * Runner'lar MCP'nin ham CSV biçimine değil, buradaki veri modeline bağımlı olur —
 * SEMrush kolon adlarını değiştirse tek düzeltme noktası burasıdır.
 *
 * Veri kaynağı hiyerarşisi (ihlal edilirse rapor yanlış olur):
 *   Pixelon MEVCUT performansı  → GSC          (tek doğruluk kaynağı)
 *   Pazar / rakip / keyword     → SEMrush      (birincil)
 *   Güncel arama niyeti         → canlı SERP
 *   Google politikası           → Search Central
 * SEMrush'ın Pixelon için verdiği trafik/pozisyon tahminleri BU KÖPRÜDE REDDEDİLİR.
 *
 * Kullanım: bun scripts/seo/semrush-bridge.mjs <girdi.json> [--date YYYY-MM-DD]
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { stampFor } from './clock.mjs';

export const OUT_ROOT = 'seo/private/data/semrush';
const n = (v) => (v === '' || v === null || v === undefined ? null : Number(v));

/** SEMrush noktalı virgüllü CSV → nesne dizisi. */
export function parseSemrushCsv(text) {
  const [head, ...rows] = String(text ?? '')
    .trim()
    .split('\n')
    .filter(Boolean);
  if (!head) return [];
  const cols = head.split(';');
  return rows.map((r) => Object.fromEntries(r.split(';').map((v, i) => [cols[i], v])));
}

/** Semrush intent kodu → okunabilir etiket. Bilinmeyen kod uydurulmaz. */
export const INTENT = { 0: 'commercial', 1: 'informational', 2: 'navigational', 3: 'transactional' };

/**
 * @typedef {{ keyword: string, volume: number|null, difficulty: number|null, cpc: number|null,
 *             competition: number|null, intent: string|null, database: string,
 *             source: 'semrush', fetchedAt: string }} NormalizedKeyword
 */

/** @returns {NormalizedKeyword[]} */
export function normalizeKeywords(rows, database, fetchedAt) {
  return (rows ?? [])
    .filter((r) => r.Keyword)
    .map((r) => ({
      keyword: r.Keyword,
      volume: n(r['Search Volume']),
      difficulty: n(r['Keyword Difficulty Index']),
      cpc: n(r.CPC),
      competition: n(r.Competition),
      intent: r.Intent === '' || r.Intent === undefined ? null : (INTENT[r.Intent] ?? null),
      database,
      source: 'semrush',
      fetchedAt,
    }));
}

/**
 * @typedef {{ domain: string, authorityScore: number|null, backlinks: number|null,
 *             referringDomains: number|null, follow: number|null, nofollow: number|null,
 *             organicKeywords: number|null, organicTraffic: number|null,
 *             source: 'semrush', fetchedAt: string }} NormalizedDomain
 */

/** @returns {NormalizedDomain} */
export function normalizeDomain(domain, backlinks, ranks, fetchedAt) {
  const b = backlinks ?? {};
  const r = ranks ?? {};
  return {
    domain,
    authorityScore: n(b.ascore),
    backlinks: n(b.total),
    referringDomains: n(b.domains_num),
    follow: n(b.follows_num),
    nofollow: n(b.nofollows_num),
    organicKeywords: n(r['Organic Keywords']),
    organicTraffic: n(r['Organic Traffic']),
    source: 'semrush',
    fetchedAt,
  };
}

/**
 * @typedef {{ keyword: string, position: number, domain: string, url: string,
 *             hasDedicatedPage: boolean, source: 'semrush', fetchedAt: string }} NormalizedSerpRow
 */

/**
 * SERP satırlarını normalize eder ve "sorguya özel landing page mi" sorusunu işaretler.
 * Ana sayfa ile derin bir landing page arasındaki fark, içerik stratejisinin tamamını belirliyor.
 * @returns {NormalizedSerpRow[]}
 */
export function normalizeSerp(keyword, rows, fetchedAt) {
  return (rows ?? [])
    .filter((r) => r.Domain)
    .map((r, i) => {
      let path = '/';
      try {
        path = new URL(r.Url).pathname;
      } catch {
        // Bozuk URL satırı düşürülmez; yol kökmüş gibi işlenir.
      }
      return {
        keyword,
        position: i + 1,
        domain: r.Domain,
        url: r.Url,
        hasDedicatedPage: path.replace(/\/$/, '').length > 0,
        source: 'semrush',
        fetchedAt,
      };
    });
}

/** Köprünün kabul ettiği girdi paketini normalize edip diske yazar. */
export function buildBundle(input, fetchedAt) {
  const keywords = [];
  for (const [database, csv] of Object.entries(input.keywords ?? {})) {
    keywords.push(...normalizeKeywords(parseSemrushCsv(csv), database, fetchedAt));
  }
  const domains = (input.domains ?? []).map((d) =>
    normalizeDomain(
      d.domain,
      parseSemrushCsv(d.backlinksCsv ?? '')[0],
      parseSemrushCsv(d.ranksCsv ?? '')[0],
      fetchedAt,
    ),
  );
  const serp = [];
  for (const [keyword, csv] of Object.entries(input.serp ?? {})) {
    serp.push(...normalizeSerp(keyword, parseSemrushCsv(csv), fetchedAt));
  }
  return {
    fetchedAt,
    source: 'semrush-mcp',
    // Sözleşme: bu paket Pixelon'ın MEVCUT performansı için kullanılmaz.
    authoritativeFor: ['market', 'competitor', 'keyword-research'],
    notAuthoritativeFor: ['pixelon-current-performance'],
    counts: { keywords: keywords.length, domains: domains.length, serpRows: serp.length },
    keywords,
    domains,
    serp,
  };
}

if (import.meta.main) {
  const [inputPath] = process.argv.slice(2);
  if (!inputPath) {
    console.error('Kullanım: bun scripts/seo/semrush-bridge.mjs <girdi.json>');
    process.exit(2);
  }
  const fetchedAt = new Date().toISOString();
  const bundle = buildBundle(JSON.parse(readFileSync(inputPath, 'utf8')), fetchedAt);
  const dir = join(process.cwd(), OUT_ROOT, stampFor());
  mkdirSync(dir, { recursive: true });
  for (const key of ['keywords', 'domains', 'serp']) {
    writeFileSync(join(dir, `${key}.json`), JSON.stringify(bundle[key], null, 2) + '\n');
  }
  writeFileSync(join(dir, 'bundle.json'), JSON.stringify(bundle, null, 2) + '\n');
  console.log(`✔ ${dir}`);
  console.log(`  keywords:${bundle.counts.keywords} domains:${bundle.counts.domains} serp:${bundle.counts.serpRows}`);
  console.log('  gitignored — sources.mjs bunu kendiliğinden okur.');
}
