/**
 * Veri kaynağı sağlık kontrolü ve alımı.
 *
 * Politika: "NO DATA = NO ASSUMPTION". Bir kaynak yoksa sayı uydurulmaz; UNKNOWN yazılır.
 * Kaynak açıldığı anda sistem kendiliğinden kullanmaya başlar — kod değişikliği gerekmez.
 */
import { existsSync, globSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

/** CSV → satır nesneleri. GSC dışa aktarımları tırnaklı alan içerebilir. */
export function parseCsv(text) {
  const rows = [];
  let row = [],
    field = '',
    inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c !== '\r') field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  if (!rows.length) return [];
  const head = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return rows
    .slice(1)
    .filter((r) => r.some((v) => v !== ''))
    .map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? '').trim()])));
}

/**
 * GSC verisi arar. Kabul edilen yollar:
 *   seo/data/gsc/<tarih>/*.csv     (Search Console "Dışa aktar" zip'inin açılmış hâli)
 *   seo/data/gsc-export.csv        (tek dosya, hızlı yol)
 */
export function loadGSC() {
  const single = join(ROOT, 'seo/data/gsc-export.csv');
  const dated = globSync('seo/data/gsc/*/*.csv').sort();
  const files = dated.length ? dated : existsSync(single) ? [single] : [];
  if (!files.length) return { available: false, reason: 'GSC dışa aktarımı bulunamadı (seo/data/gsc/ boş)', files: [] };

  const datasets = {};
  for (const f of files) {
    const name = f.split('/').pop().replace('.csv', '').toLowerCase();
    try {
      datasets[name] = parseCsv(readFileSync(f, 'utf8'));
    } catch (e) {
      return { available: false, reason: `CSV okunamadı: ${f} — ${e.message}`, files };
    }
  }
  return { available: true, files, datasets, fetchedAt: new Date().toISOString() };
}

/**
 * @typedef {{ q: string, pos: number, imp: number, clicks: number, ctr: number }} QueryRow
 * @typedef {{ quickWin: QueryRow[], strikingDistance: QueryRow[], ctrOpportunity: QueryRow[],
 *             brand: QueryRow[], nonBrand: QueryRow[] }} QueryBuckets
 */

/**
 * GSC sorgu tablosundan fırsat sınıflandırması. Veri yoksa boş döner — tahmin üretmez.
 * @param {Record<string, string>[] | undefined} rows
 * @returns {QueryBuckets}
 */
export function classifyQueries(rows) {
  const num = (v) => Number(String(v).replace(/[%,]/g, '').replace(',', '.')) || 0;
  /** @type {QueryBuckets} */
  const out = { quickWin: [], strikingDistance: [], ctrOpportunity: [], brand: [], nonBrand: [] };
  for (const r of rows ?? []) {
    const q = r.query ?? r.top_queries ?? r['en_i̇yi_sorgular'] ?? '';
    if (!q) continue;
    const pos = num(r.position ?? r.average_position ?? r.ortalama_konum);
    const imp = num(r.impressions ?? r.gösterim ?? r.gosterim);
    const clicks = num(r.clicks ?? r.tıklama ?? r.tiklama);
    const ctr = num(r.ctr ?? r.tıklama_oranı);
    const isBrand = /pixelon/i.test(q);
    (isBrand ? out.brand : out.nonBrand).push({ q, pos, imp, clicks, ctr });
    if (isBrand) continue;
    if (pos >= 4 && pos <= 10 && imp > 0) out.quickWin.push({ q, pos, imp, clicks, ctr });
    else if (pos > 10 && pos <= 20 && imp > 0) out.strikingDistance.push({ q, pos, imp, clicks, ctr });
    if (imp >= 100 && ctr > 0 && ctr < 2) out.ctrOpportunity.push({ q, pos, imp, clicks, ctr });
  }
  const byImp = (a, b) => b.imp - a.imp;
  for (const k of ['quickWin', 'strikingDistance', 'ctrOpportunity']) out[k].sort(byImp);
  return out;
}

/** SEMrush: MCP/API/CLI hiçbiri yoksa dosya tabanlı dışa aktarım kabul edilir. */
export function loadSemrush() {
  const files = globSync('seo/data/semrush/*/*.csv').sort();
  if (!files.length) return { available: false, reason: 'SEMrush MCP/API yok ve seo/data/semrush/ boş', files: [] };
  const datasets = {};
  for (const f of files)
    datasets[f.split('/').pop().replace('.csv', '').toLowerCase()] = parseCsv(readFileSync(f, 'utf8'));
  return { available: true, files, datasets, fetchedAt: new Date().toISOString() };
}

/** Her run başında çalışan bağlantı sağlık kontrolü. */
export function connectionHealth() {
  const gsc = loadGSC();
  const semrush = loadSemrush();
  return {
    checkedAt: new Date().toISOString(),
    sources: {
      googleSearchConsole: { available: gsc.available, reason: gsc.available ? null : gsc.reason },
      semrush: { available: semrush.available, reason: semrush.available ? null : semrush.reason },
      liveSerp: {
        available: true,
        reason: null,
        note: "Arama aracı ABD merkezli — Google Türkiye SERP'i birebir değil",
      },
      googleSearchCentral: { available: true, reason: null },
      repository: { available: true, reason: null },
    },
    gsc,
    semrush,
  };
}
