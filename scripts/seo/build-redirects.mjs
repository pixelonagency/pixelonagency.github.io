#!/usr/bin/env bun
/**
 * `public/_redirects` üretici — SEO-2026-0069.
 *
 * Neden gerekli: Cloudflare Workers Static Assets `auto-trailing-slash` davranışı
 * slash normalizasyonunu **307** ile yapıyor. GitHub Pages aynı işi **301** ile yapıyordu.
 * 307 geçici yönlendirmedir ve Google kanonikleştirmesi için 301'in yerini tutmaz.
 * Bu yüzden kanonik HTML rotalarının slash'sız biçimleri için AÇIK 301 kuralı üretiyoruz.
 *
 * Kurallar (bilinçli olarak dar):
 *   - Yalnızca sitemap'teki kanonik HTML sayfalardan üretilir.
 *   - Kök `/` için kural üretilmez (slash'sız biçimi yok).
 *   - Uzantılı yollar (.xml/.txt/.js/.css/görsel) atlanır.
 *   - Hedef her zaman slash ile biten kanonik URL'dir.
 *   - Wildcard/`/*` KULLANILMAZ — her kural birebir eşleşme.
 *   - Çıktı deterministiktir: sitemap sırası alfabetik olarak sabitlenir.
 *
 * Eski URL yönlendirmeleri (6 onaylı) dosyanın EN ÜSTÜNDE kalır; Cloudflare kuralları
 * sırayla değerlendirir, böylece eski URL kuralı kanonik slash kuralından önce eşleşir.
 */
import { readFileSync, writeFileSync } from 'node:fs';

export const SITEMAP = 'dist/sitemap-0.xml';
export const OUT = 'public/_redirects';
const ORIGIN = 'https://pixelon.com.tr';

/** Eski URL → yeni URL. Onaylı 6 kalem; HOLD'lar bilinçli olarak yok. */
export const LEGACY = [
  ['/hizmet/web-tasarim-yazilim', '/hizmetlerimiz/web-tasarim-ve-yazilim/'],
  ['/hizmet/sosyal-medya-yonetimi', '/hizmetlerimiz/sosyal-medya-yonetimi/'],
  ['/hizmet/dijital-reklam-yonetimi', '/hizmetlerimiz/dijital-reklam-yonetimi/'],
  ['/hizmet/seo-icerik-uretimi', '/hizmetlerimiz/seo-ve-icerik-pazarlamasi/'],
  ['/hizmet/fotograf-video-produksiyon', '/hizmetlerimiz/video-ve-produksiyon/'],
  ['/referanslar', '/referanslarimiz/'],
];

/** Sitemap XML → kanonik yol listesi (alfabetik, deterministik). */
export function canonicalPaths(xml) {
  return [...new Set([...String(xml).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]))]
    .filter((u) => u.startsWith(ORIGIN))
    .map((u) => u.slice(ORIGIN.length) || '/')
    .filter((p) => p !== '/') // kök için slash'sız biçim yok
    .filter((p) => p.endsWith('/')) // yalnızca dizin biçimli kanonik sayfalar
    .filter((p) => !/\.[a-z0-9]+\/?$/i.test(p)) // uzantılı yol yok
    .sort();
}

/** Kanonik slash kuralları: /yol → /yol/ 301 */
export function slashRules(paths) {
  return paths.map((p) => [p.replace(/\/$/, ''), p]);
}

export function render(legacy, slash) {
  const width = Math.max(...[...legacy, ...slash].map(([from]) => from.length)) + 2;
  const line = ([from, to]) => `${from.padEnd(width)}${to.padEnd(width)}301`;
  return [
    '# OTOMATİK ÜRETİLDİ — elle düzenlemeyin.',
    '# Üretici: scripts/seo/build-redirects.mjs  (bun run seo:redirects)',
    '#',
    '# GitHub Pages bu dosyayı OKUMAZ; yalnızca Cloudflare Workers/Pages üzerinde etkilidir.',
    '#',
    '# 1) ESKİ URL YÖNLENDİRMELERİ — sırası önemli, kanonik kurallardan ÖNCE gelir.',
    '#    HOLD (bilinçli olarak yok): /hizmet/markalasma-kreatif-cozumler/, /hizmet/mobil-uygulama/',
    '',
    ...legacy.flatMap(([from, to]) => [line([from, to]), line([`${from}/`, to])]),
    '',
    '# 2) KANONİK SLASH NORMALİZASYONU — Workers auto-trailing-slash 307 döndürüyor;',
    '#    Google kanonikleştirmesi için kalıcı 301 gerekiyor. Wildcard kullanılmaz.',
    '',
    ...slash.map(line),
    '',
  ].join('\n');
}

if (import.meta.main) {
  const paths = canonicalPaths(readFileSync(SITEMAP, 'utf8'));
  const slash = slashRules(paths);
  writeFileSync(OUT, render(LEGACY, slash));
  const total = LEGACY.length * 2 + slash.length;
  console.log(`✔ ${OUT}`);
  console.log(`  eski URL kuralı   : ${LEGACY.length * 2}  (6 kalem × slash'lı/slash'sız)`);
  console.log(`  kanonik slash     : ${slash.length}`);
  console.log(`  TOPLAM            : ${total}  (Cloudflare statik yönlendirme sınırı: 2000)`);
}
