#!/usr/bin/env bun
/**
 * Pixelon teknik SEO denetimi — build çıktısı (`dist/`) üzerinden çalışır.
 *
 * Denetim canlı siteye değil üretim build'ine bakar: aynı HTML yayına gittiği için
 * sonuç özdeştir, ağ dalgalanmasından etkilenmez ve yayına almadan önce çalıştırılabilir.
 *
 * Çıktı: seo/reports/TECHNICAL-AUDIT-<tarih>.json + insan okunur özet (stdout).
 */
import { readFileSync, writeFileSync, globSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { stampFor } from './clock.mjs';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
if (!existsSync(DIST)) {
  console.error('dist/ yok — önce `bun run build` çalıştırın.');
  process.exit(1);
}

const SITE = 'https://pixelon.com.tr';
const pages = globSync('dist/**/*.html').sort();

/** Basit öznitelik çıkarıcı — build çıktısı tek satırlık minify HTML olabildiği için regex tabanlı. */
const attr = (html, re) => html.match(re)?.[1] ?? null;
const all = (html, re) => [...html.matchAll(re)].map((m) => m[1]);

const findings = [];
const add = (severity, category, url, message) => findings.push({ severity, category, url, message });

const routeOf = (file) =>
  '/' +
  file
    .replace(/^dist\//, '')
    .replace(/index\.html$/, '')
    .replace(/\.html$/, '/');

const seen = { title: new Map(), description: new Map(), canonical: new Set() };
const inventory = [];

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const url = routeOf(file);

  const title = attr(html, /<title[^>]*>([\s\S]*?)<\/title>/i)?.trim() ?? null;
  const description = attr(html, /<meta[^>]+name="description"[^>]+content="([^"]*)"/i);
  const canonical = attr(html, /<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i);
  const lang = attr(html, /<html[^>]+lang="([^"]*)"/i);
  const robots = attr(html, /<meta[^>]+name="robots"[^>]+content="([^"]*)"/i);
  const ogImage = attr(html, /<meta[^>]+property="og:image"[^>]+content="([^"]*)"/i);
  const h1s = all(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi);
  const hreflang = all(html, /<link[^>]+rel="alternate"[^>]+hreflang="([^"]*)"/gi);
  const jsonld = all(html, /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const noindex = /noindex/i.test(robots ?? '');

  const schemaTypes = [];
  for (const block of jsonld) {
    try {
      const parsed = JSON.parse(block);
      const walk = (n) => {
        if (Array.isArray(n)) return n.forEach(walk);
        if (n && typeof n === 'object') {
          if (n['@type']) schemaTypes.push(...[].concat(n['@type']));
          Object.values(n).forEach(walk);
        }
      };
      walk(parsed);
    } catch {
      add('P0', 'schema', url, 'JSON-LD parse edilemiyor (syntax hatası)');
    }
  }

  // --- kontroller ---
  if (!noindex) {
    if (!title) add('P0', 'metadata', url, 'title yok');
    else {
      if (title.length > 65) add('P2', 'metadata', url, `title ${title.length} karakter (>65, SERP'te kısalır)`);
      if (title.length < 20) add('P2', 'metadata', url, `title ${title.length} karakter (çok kısa)`);
      const prev = seen.title.get(title);
      if (prev) add('P1', 'metadata', url, `title yinelenmiş — ${prev} ile aynı`);
      else seen.title.set(title, url);
    }

    if (!description) add('P1', 'metadata', url, 'meta description yok');
    else {
      if (description.length > 165) add('P2', 'metadata', url, `description ${description.length} karakter (>165)`);
      if (description.length < 70)
        add('P2', 'metadata', url, `description ${description.length} karakter (<70, alan boşa gidiyor)`);
      const prev = seen.description.get(description);
      if (prev) add('P1', 'metadata', url, `description yinelenmiş — ${prev} ile aynı`);
      else seen.description.set(description, url);
    }

    if (!canonical) add('P0', 'indexability', url, 'canonical yok');
    else {
      if (!canonical.startsWith(SITE)) add('P0', 'indexability', url, `canonical farklı host: ${canonical}`);
      if (seen.canonical.has(canonical)) add('P1', 'indexability', url, `canonical çakışması: ${canonical}`);
      seen.canonical.add(canonical);
    }

    if (h1s.length === 0) add('P1', 'content', url, 'H1 yok');
    if (h1s.length > 1) add('P1', 'content', url, `${h1s.length} adet H1 (tek olmalı)`);
    if (!lang) add('P1', 'i18n', url, 'html lang yok');
    if (!ogImage) add('P2', 'social', url, 'og:image yok');
  }

  for (const img of imgs) {
    // Astro `alt=""` çıktısını çıplak `alt` olarak basar; ikisi de "dekoratif" demektir
    // ve geçerli işaretlemedir. Eksik sayılması gereken tek durum alt'ın hiç olmaması.
    const hasAlt = /\balt(=|[\s>])/.test(img);
    if (!hasAlt) add('P1', 'images', url, 'alt özniteliği hiç yok');
    if (!/\bwidth=/.test(img) || !/\bheight=/.test(img)) add('P2', 'images', url, 'width/height yok (CLS riski)');
  }

  inventory.push({
    url,
    title,
    description,
    canonical,
    lang,
    noindex,
    h1: h1s.length,
    hreflang: hreflang.length,
    schemaTypes: [...new Set(schemaTypes)],
    images: imgs.length,
  });
}

// --- iç bağlantı grafiği ---
const routes = new Set(inventory.filter((p) => !p.noindex).map((p) => p.url));
const inbound = new Map([...routes].map((r) => [r, 0]));
const broken = new Set();
for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const from = routeOf(file);
  for (const href of all(html, /href="(\/[^"#?]*)"/g)) {
    const target = href.endsWith('/') ? href : `${href}/`;
    if (routes.has(target)) inbound.set(target, (inbound.get(target) ?? 0) + 1);
    else if (!existsSync(join(DIST, href.replace(/^\//, '')))) broken.add(`${from} → ${href}`);
  }
}
for (const b of broken) add('P0', 'links', b.split(' → ')[0], `kırık iç bağlantı: ${b.split(' → ')[1]}`);
const orphans = [...inbound].filter(([r, n]) => n === 0 && r !== '/').map(([r]) => r);
for (const o of orphans) add('P1', 'links', o, 'orphan sayfa — hiçbir sayfadan iç bağlantı almıyor');

// --- sitemap ---
const smPath = join(DIST, 'sitemap-0.xml');
let sitemapUrls = [];
if (existsSync(smPath)) {
  sitemapUrls = all(readFileSync(smPath, 'utf8'), /<loc>([^<]+)<\/loc>/g);
  const smRoutes = new Set(sitemapUrls.map((u) => u.replace(SITE, '')));
  for (const p of inventory) {
    if (p.noindex && smRoutes.has(p.url)) add('P0', 'sitemap', p.url, 'noindex sayfa sitemap içinde');
    if (!p.noindex && !smRoutes.has(p.url)) add('P2', 'sitemap', p.url, 'indexlenebilir sayfa sitemap dışında');
  }
} else add('P0', 'sitemap', '/', 'sitemap-0.xml üretilmemiş');

const bySeverity = (s) => findings.filter((f) => f.severity === s).length;
const report = {
  generatedAt: new Date().toISOString(),
  site: SITE,
  totals: {
    htmlPages: pages.length,
    indexable: inventory.filter((p) => !p.noindex).length,
    noindex: inventory.filter((p) => p.noindex).length,
    sitemapUrls: sitemapUrls.length,
    orphans: orphans.length,
    brokenLinks: broken.size,
  },
  severity: { P0: bySeverity('P0'), P1: bySeverity('P1'), P2: bySeverity('P2'), P3: bySeverity('P3') },
  findings,
  inventory,
};

const stamp = stampFor();
const out = join(ROOT, 'seo/reports', `TECHNICAL-AUDIT-${stamp}.json`);
writeFileSync(out, JSON.stringify(report, null, 2));

console.log(`\nPIXELON TEKNİK SEO DENETİMİ — ${stamp}`);
console.log(
  `HTML sayfa: ${report.totals.htmlPages} · indexlenebilir: ${report.totals.indexable} · noindex: ${report.totals.noindex}`,
);
console.log(
  `Sitemap URL: ${report.totals.sitemapUrls} · orphan: ${report.totals.orphans} · kırık iç link: ${report.totals.brokenLinks}`,
);
console.log(
  `Bulgu — P0: ${report.severity.P0} · P1: ${report.severity.P1} · P2: ${report.severity.P2} · P3: ${report.severity.P3}`,
);
if (findings.length) {
  const grouped = {};
  for (const f of findings) (grouped[`${f.severity} ${f.category}`] ??= []).push(f);
  console.log('\nÖzet:');
  for (const [k, v] of Object.entries(grouped).sort()) console.log(`  ${k}: ${v.length}`);
}
console.log(`\nRapor: ${out.replace(ROOT + '/', '')}`);
process.exit(report.severity.P0 > 0 ? 1 : 0);
