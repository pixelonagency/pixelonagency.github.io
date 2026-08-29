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

/**
 * Eski URL → yeni URL. Onaylı 9 kalem; HOLD kalmadı.
 *
 * İlk 6 kalem 22 Ağu 2026'da onaylandı. Son 3'ü 24 Ağu 2026'da sahip kararıyla
 * eklendi — otonom ajan bu üç URL'in canlıda 404 verdiğini ve GSC'de hâlâ
 * sinyal aldığını (61 gösterim, sitenin %4,2'si) ölçtükten sonra:
 *   · saglik-turizm-danismanligi  — belgelenmemiş boşluk; slug tek harf farklı
 *   · markalasma-kreatif-cozumler — eski sayfanın kapsamı sahip tarafından teyit edildi
 *   · mobil-uygulama              — UX/UI sayfası "Mobil Uygulama Tasarımı" kalemini
 *                                   içeriyor. Not: bu URL'in GSC gösterimlerinin
 *                                   tamamı MARKA sorgusuydu, konu sorgusu değil;
 *                                   yönlendirme konu trafiği kazandırmaz, marka
 *                                   aramasındaki 404'ü kapatır.
 */
export const LEGACY = [
  ['/hizmet/web-tasarim-yazilim', '/hizmetlerimiz/web-tasarim-ve-yazilim/'],
  ['/hizmet/sosyal-medya-yonetimi', '/hizmetlerimiz/sosyal-medya-yonetimi/'],
  ['/hizmet/dijital-reklam-yonetimi', '/hizmetlerimiz/dijital-reklam-yonetimi/'],
  ['/hizmet/seo-icerik-uretimi', '/hizmetlerimiz/seo-ve-icerik-pazarlamasi/'],
  ['/hizmet/fotograf-video-produksiyon', '/hizmetlerimiz/video-ve-produksiyon/'],
  ['/referanslar', '/referanslarimiz/'],
  ['/hizmet/saglik-turizm-danismanligi', '/hizmetlerimiz/saglik-turizmi-danismanligi/'],
  ['/hizmet/markalasma-kreatif-cozumler', '/hizmetlerimiz/marka-ve-kurumsal-kimlik/'],
  ['/hizmet/mobil-uygulama', '/hizmetlerimiz/ux-ui-tasarimi/'],
  /* 28 Ağu 2026 — marka adı düzeltmesi: müşterinin adı "Annelik Hikayesi", slug
     "anneligin-hikayesi" yanlış yazımdı. Sayfanın GSC gösterimi 0 olduğu için
     değişim maliyetsiz; yine de eski URL canlıda olduğundan 301 gerekiyor. */
  ['/projelerimiz/anneligin-hikayesi', '/projelerimiz/annelik-hikayesi/'],
  ['/en/projects/anneligin-hikayesi', '/en/projects/annelik-hikayesi/'],
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
    '#    HOLD kalmadı: üç eski URL 24 Ağu 2026 sahip kararıyla yönlendirildi.',
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
  console.log(`  eski URL kuralı   : ${LEGACY.length * 2}  (kalem × slash'lı/slash'sız)`);
  console.log(`  kanonik slash     : ${slash.length}`);
  console.log(`  TOPLAM            : ${total}  (Cloudflare statik yönlendirme sınırı: 2000)`);
}
