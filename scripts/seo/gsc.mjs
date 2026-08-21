/**
 * Google Search Console → seo/data/gsc/<tarih>/*.csv
 *
 * Kalıcı bağlantı: service account (JSON key) → JWT → OAuth token → Search Analytics API.
 * Üçüncü parti MCP sunucusu ya da ek npm bağımlılığı kullanmaz; imzalama node:crypto ile yapılır.
 *
 * Kurulum:
 *   1. Google Cloud → "Google Search Console API"yi enable et
 *   2. Service account + JSON key oluştur
 *   3. Key'i repo DIŞINA koy:  ~/.config/pixelon/gsc-sa.json
 *   4. Search Console → Settings > Users and permissions → key'deki client_email'i "Full" izinle ekle
 *
 * Çalıştırma:  bun run seo:gsc
 * Ayarlar:     GSC_SA_KEY (key yolu), GSC_SITE_URL (property), GSC_DAYS (pencere)
 *
 * Politika: "NO DATA = NO ASSUMPTION". Kurulum eksikse sayı uydurulmaz, sebep yazılır ve çıkılır.
 */
import { createSign } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { LAG_DAYS, windowFor, windowPlan } from './periods.mjs';

export { LAG_DAYS };

/** Geriye dönük uyumluluk: tek pencere hesabı. */
export const dateRange = (end, days) => windowFor(end, days);

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const API = 'https://searchconsole.googleapis.com/webmasters/v3/sites';

/** Karşılaştırma pencerelerinde yalnızca dönem farkı için gerekenler çekilir. */
export const COMPARE_PULLS = [
  { file: 'queries', dimensions: ['query'] },
  { file: 'pages', dimensions: ['page'] },
  { file: 'dates', dimensions: ['date'] },
];

export const PULLS = [
  { file: 'queries', dimensions: ['query'] },
  { file: 'pages', dimensions: ['page'] },
  { file: 'dates', dimensions: ['date'] },
  { file: 'devices', dimensions: ['device'] },
  { file: 'countries', dimensions: ['country'] },
];

export function base64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function buildClaim(clientEmail, nowSec) {
  return { iss: clientEmail, scope: SCOPE, aud: TOKEN_URL, exp: nowSec + 3600, iat: nowSec };
}

export function signJwt(claim, privateKey) {
  const head = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify(claim));
  const sig = base64url(createSign('RSA-SHA256').update(`${head}.${body}`).sign(privateKey));
  return `${head}.${body}.${sig}`;
}

/**
 * API satırlarını CSV nesnelerine çevirir.
 * CTR yüzde olarak yazılır (5.2 = %5.2) — classifyQueries eşikleri yüzde varsayar.
 */
export function toRows(dimensions, apiRows) {
  return (apiRows ?? []).map((r) => {
    const out = {};
    dimensions.forEach((d, i) => (out[d] = r.keys?.[i] ?? ''));
    out.clicks = r.clicks ?? 0;
    out.impressions = r.impressions ?? 0;
    out.ctr = Number(((r.ctr ?? 0) * 100).toFixed(2));
    out.position = Number((r.position ?? 0).toFixed(2));
    return out;
  });
}

export function toCsv(rows) {
  if (!rows.length) return '';
  const head = Object.keys(rows[0]);
  const esc = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  return [head.join(','), ...rows.map((r) => head.map((h) => esc(r[h])).join(','))].join('\n') + '\n';
}

export function readKey(path) {
  const key = JSON.parse(readFileSync(path, 'utf8'));
  if (!key.client_email || !key.private_key) throw new Error(`${path}: client_email/private_key alanları yok`);
  return key;
}

async function getToken(key) {
  const jwt = signJwt(buildClaim(key.client_email, Math.floor(Date.now() / 1000)), key.private_key);
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`token alınamadı (${res.status}): ${json.error_description ?? JSON.stringify(json)}`);
  return json.access_token;
}

async function query(token, siteUrl, body) {
  const rows = [];
  for (let startRow = 0; ; startRow += 25000) {
    const res = await fetch(`${API}/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ ...body, rowLimit: 25000, startRow, type: 'web' }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(`API ${res.status}: ${json.error?.message ?? JSON.stringify(json)}`);
    const batch = json.rows ?? [];
    rows.push(...batch);
    if (batch.length < 25000) return rows;
  }
}

async function main() {
  const keyPath = process.env.GSC_SA_KEY ?? join(homedir(), '.config/pixelon/gsc-sa.json');
  const siteUrl = process.env.GSC_SITE_URL ?? 'sc-domain:pixelon.com.tr';
  const days = Number(process.env.GSC_DAYS ?? 28);

  let key;
  try {
    key = readKey(keyPath);
  } catch (e) {
    console.error(`✖ GSC bağlantısı kurulu değil: ${e.message}`);
    console.error(`  Key beklenen yol: ${keyPath}  (GSC_SA_KEY ile değiştirilebilir)`);
    console.error('  Kurulum adımları için bu dosyanın başındaki açıklamaya bak.');
    process.exit(2);
  }

  const now = new Date();
  const { startDate, endDate } = dateRange(now, days);
  const token = await getToken(key);
  const outDir = join(process.cwd(), 'seo/data/gsc', endDate);
  mkdirSync(outDir, { recursive: true });

  console.log(`▸ ${siteUrl} — ${startDate} → ${endDate} (${days} gün)`);
  for (const pull of PULLS) {
    const rows = toRows(
      pull.dimensions,
      await query(token, siteUrl, { startDate, endDate, dimensions: pull.dimensions }),
    );
    writeFileSync(join(outDir, `${pull.file}.csv`), toCsv(rows));
    console.log(`  ${pull.file}.csv — ${rows.length} satır`);
  }

  // Karşılaştırma pencereleri: haftalık/aylık analiz bunlar olmadan dönem farkı üretemez.
  // Alt klasöre yazılır; loadGSC'nin `gsc/*/*.csv` globu bunları görmez, çakışma olmaz.
  const plan = windowPlan(now);
  for (const [name, w] of Object.entries(plan)) {
    const dir = join(outDir, name);
    mkdirSync(dir, { recursive: true });
    for (const pull of COMPARE_PULLS) {
      const rows = toRows(
        pull.dimensions,
        await query(token, siteUrl, { startDate: w.startDate, endDate: w.endDate, dimensions: pull.dimensions }),
      );
      writeFileSync(join(dir, `${pull.file}.csv`), toCsv(rows));
    }
    console.log(`  ${name.padEnd(9)} ${w.startDate} → ${w.endDate}`);
  }

  console.log(`✔ ${outDir}`);
  console.log('  sources.mjs bu dosyaları kendiliğinden kullanır; kod değişikliği gerekmez.');
}

if (import.meta.main) await main();
