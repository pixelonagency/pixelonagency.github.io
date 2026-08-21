#!/usr/bin/env bun
/**
 * Rakip yapısal tarama — her domain için canlı HTML'den SEO/konumlandırma sinyalleri çıkarır.
 *
 * Üçüncü parti metrik (trafik, DR) API'si olmadığı için burada *doğrulanabilir* sinyaller
 * toplanır: konumlandırma metni, hizmet mimarisi, blog varlığı, schema, dil, teknik hijyen.
 * Tahmini trafik/otorite rakamı ÜRETİLMEZ — uydurma veri stratejiyi bozar.
 */
import { writeFileSync } from 'node:fs';

const targets = [
  'https://www.keepkind.co/',
  'https://www.newhealth.media/',
  'https://www.zugadigital.com/',
  'https://1618.agency/',
  'https://www.kreatif.net/',
  'https://www.growdijital.com/',
  'https://peganom.com/',
  'https://basework.studio/tr/ana-sayfa/',
  'https://fol.com.tr/tr/ana-sayfa/',
  'https://lokummedya.com/',
  'https://pixelon.com.tr/',
];

const one = (h, re) => h.match(re)?.[1]?.replace(/\s+/g, ' ').trim() ?? null;
const many = (h, re) =>
  [...h.matchAll(re)]
    .map((m) =>
      m[1]
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean);

// Mutlak veya göreli iç yolları yakalar. Regex literal yerine RegExp kullanılıyor:
// literaldeki `//` dizisi TS parser'ında yorum başlangıcı sanılıyor.
const HREF_PATH_RE = new RegExp(String.raw`href="(?:https?://[^"/]*)?(/[a-z0-9\-/]{2,60})"`, 'gi');

const results = [];
for (const url of targets) {
  const host = new URL(url).hostname.replace(/^www\./, '');
  const row = { host, url, ok: false };
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; PixelonSEOAudit/1.0)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(25000),
    });
    row.status = res.status;
    const html = await res.text();
    row.ok = res.ok;
    row.bytes = html.length;
    row.title = one(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    row.description = one(html, /<meta[^>]+name="description"[^>]+content="([^"]*)"/i);
    row.h1 = many(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).slice(0, 3);
    row.lang = one(html, /<html[^>]+lang="([^"]*)"/i);
    row.canonical = one(html, /<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i);
    row.hreflang = [...new Set(many(html, /rel="alternate"[^>]+hreflang="([^"]*)"/gi))];
    row.schemaTypes = [...new Set(many(html, /"@type"\s*:\s*"([^"]+)"/gi))];
    row.h2Count = (html.match(/<h2[\b>]/gi) ?? []).length;
    // İç yollar — hizmet/blog mimarisi sinyali
    const paths = [...new Set([...html.matchAll(HREF_PATH_RE)].map((m) => m[1].toLowerCase()))];
    row.pathCount = paths.length;
    row.hasBlog = paths.some((p) => /\/(blog|makale|yazilar|insights|journal|icerik)/.test(p));
    row.hasCase = paths.some((p) => /(case|proje|work|portfol|calisma|referans)/.test(p));
    row.hasPricing = paths.some((p) => /(fiyat|price|pricing|paket)/.test(p));
    row.servicePaths = paths
      .filter((p) => /(hizmet|service|solutions|cozum|ne-yapiyoruz|what-we-do)/.test(p))
      .slice(0, 12);
    row.samplePaths = paths.slice(0, 25);
  } catch (e) {
    row.error = String(e).slice(0, 120);
  }
  results.push(row);
  console.log(
    `${row.ok ? 'OK ' : '!! '} ${host.padEnd(22)} ${String(row.status ?? row.error).padEnd(6)} paths:${row.pathCount ?? '-'} blog:${row.hasBlog ?? '-'} case:${row.hasCase ?? '-'} fiyat:${row.hasPricing ?? '-'} schema:${(row.schemaTypes ?? []).length}`,
  );
}

writeFileSync('seo/data/competitors-raw.json', JSON.stringify(results, null, 2));
console.log('\n→ seo/data/competitors-raw.json');
