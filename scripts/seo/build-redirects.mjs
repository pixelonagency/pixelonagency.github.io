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
  ['/hizmet/fotograf-video-produksiyon', '/hizmetlerimiz/sosyal-medya-yonetimi/'],
  ['/referanslar', '/referanslarimiz/'],
  ['/hizmet/saglik-turizm-danismanligi', '/hizmetlerimiz/saglik-turizmi-danismanligi/'],
  ['/hizmet/markalasma-kreatif-cozumler', '/hizmetlerimiz/marka-ve-kurumsal-kimlik/'],
  ['/hizmet/mobil-uygulama', '/hizmetlerimiz/web-tasarim-ve-yazilim/'],
  /* 28 Ağu 2026 — marka adı düzeltmesi: müşterinin adı "Annelik Hikayesi", slug
     "anneligin-hikayesi" yanlış yazımdı. Sayfanın GSC gösterimi 0 olduğu için
     değişim maliyetsiz; yine de eski URL canlıda olduğundan 301 gerekiyor. */
  ['/projelerimiz/anneligin-hikayesi', '/projelerimiz/annelik-hikayesi/'],
  /* 16 Eyl 2026 — hedef Türkçeye çevrildi; İngilizce bölüm yayından kalktı ve eski
     hedef (`/en/projects/annelik-hikayesi/`) artık üretilmiyor. */
  ['/en/projects/anneligin-hikayesi', '/projelerimiz/annelik-hikayesi/'],
  /* 1 Eylül 2026 — HİZMET BİRLEŞTİRME. Envanter 11 başlıktan 7'ye indi; kapanan
     yedi sayfa (dört TR, üç EN) yerine kalan hizmetlere yönlendiriliyor.
     Sağlık turizmi sayfaları KAPANMADI, yalnız menüden çıkarıldı.

     90 günlük GSC ölçümü: dördünün toplamı 19 gösterim, 0 tıklama — yani
     yönlendirmenin trafik maliyeti yok. Emekli sayfalara giden iki eski kural
     (`fotograf-video-produksiyon`, `mobil-uygulama`) da yukarıda nihai hedefe
     çevrildi; aksi halde eski URL → emekli sayfa → yeni sayfa zinciri oluşurdu.

     Kalemler yalnız EĞİK ÇİZGİSİZ yazılır: `render` her kaleme eğik çizgili
     varyantını kendisi ekliyor. İkisini birden yazmak çift kural ve `//` ile
     biten bozuk bir kural üretiyordu. */
  ['/hizmetlerimiz/kurumsal-web-tasarim', '/hizmetlerimiz/web-tasarim-ve-yazilim/'],
  ['/hizmetlerimiz/ux-ui-tasarimi', '/hizmetlerimiz/web-tasarim-ve-yazilim/'],
  ['/hizmetlerimiz/video-ve-produksiyon', '/hizmetlerimiz/sosyal-medya-yonetimi/'],
  ['/hizmetlerimiz/crm-ve-dijital-donusum', '/hizmetlerimiz/'],
  /* Bu üç kalemin hedefi 16 Eyl 2026'da Türkçeye çevrildi — aynı gerekçe: nihai
     hedefe tek adımda gidilir, emekli sayfa üzerinden zincir kurulmaz. */
  ['/en/services/ux-ui-design', '/hizmetlerimiz/web-tasarim-ve-yazilim/'],
  ['/en/services/video-and-production', '/hizmetlerimiz/sosyal-medya-yonetimi/'],
  ['/en/services/crm-and-digital-transformation', '/hizmetlerimiz/'],
  /* 7 Eylül 2026 — GSC "Bulunamadı (404)" raporundaki TEK gerçek içerik URL'si.
     Eski WordPress sitesinin sağlık turizmi sayfası; 27 Ağu'da hâlâ taranıyordu.
     Rapordaki diğer altı kayıt wp-admin/wp-content/hello-world gibi WordPress
     artığı — onlar için 404 doğru davranış, kural yazılmaz. */
  ['/saglik-turizmi', '/hizmetlerimiz/saglik-turizmi-danismanligi/'],

  /* 16 Eylül 2026 — İNGİLİZCE BÖLÜM YAYINDAN KALKTI (sahip kararı).

     Ölçüm: 41 İngilizce sayfa sitenin %38'iydi ve 28 günde 25 tıklama getiriyordu;
     bunun 17'si `/en/` ana sayfasına düşen MARKA aramasıydı, yani Türkçe ana sayfaya
     gidecek trafikti. Marka dışı gerçek getiri ~4 tıklama. Buna karşılık Google,
     Türkiye'den yapılan `pixelon` aramasında 1. sırada Türkçe ana sayfayı değil
     `/en/`'i gösteriyordu (16 Eyl 2026'da gl=tr&hl=tr ile canlı doğrulandı).

     404 DEĞİL 301: 41 URL indeksliydi ve `/en/` marka sorgusunda 1. sıradaydı.
     301 o sırayı Türkçe ana sayfaya devreder; 404 çöpe atardı.

     Hedefler UYDURULMADI: her satır, yayından kalkmadan önceki build'in kendi
     `hreflang="tr"` etiketinden okundu — yani sayfanın ilan ettiği Türkçe karşılığı.
     Türkçe karşılığı olmayan üç sayfa aşağıda ayrıca işaretlendi.

     Geri açılırsa bu blok silinir; `PUBLISHED_LOCALES`'e `'en'` eklemek yeterlidir. */
  ['/en', '/'],
  ['/en/about-us', '/biz-kimiz/'],
  ['/en/services', '/hizmetlerimiz/'],
  ['/en/services/brand-and-corporate-identity', '/hizmetlerimiz/marka-ve-kurumsal-kimlik/'],
  ['/en/services/digital-advertising', '/hizmetlerimiz/dijital-reklam-yonetimi/'],
  ['/en/services/e-commerce-solutions', '/hizmetlerimiz/e-ticaret-cozumleri/'],
  ['/en/services/health-tourism-consulting', '/hizmetlerimiz/saglik-turizmi-danismanligi/'],
  ['/en/services/seo-and-content-marketing', '/hizmetlerimiz/seo-ve-icerik-pazarlamasi/'],
  ['/en/services/social-media-management', '/hizmetlerimiz/sosyal-medya-yonetimi/'],
  ['/en/services/web-design-and-development', '/hizmetlerimiz/web-tasarim-ve-yazilim/'],
  ['/en/get-a-website', '/web-sitesi-yaptir/'],
  ['/en/projects', '/projelerimiz/'],
  ['/en/projects/annelik-hikayesi', '/projelerimiz/annelik-hikayesi/'],
  ['/en/projects/cagla-aytac', '/projelerimiz/cagla-aytac/'],
  ['/en/projects/dentasay', '/projelerimiz/dentasay/'],
  ['/en/projects/dr-ayse-cinkaya-kahveci', '/projelerimiz/dr-ayse-cinkaya-kahveci/'],
  ['/en/projects/handsforall', '/projelerimiz/handsforall/'],
  ['/en/projects/mobico', '/projelerimiz/mobico/'],
  ['/en/projects/op-dr-ismail-buyukcayir', '/projelerimiz/op-dr-ismail-buyukcayir/'],
  ['/en/projects/redex-glass', '/projelerimiz/redex-glass/'],
  ['/en/projects/sekoya', '/projelerimiz/sekoya/'],
  ['/en/projects/sera-natura', '/projelerimiz/sera-natura/'],
  ['/en/projects/touch-consulting', '/projelerimiz/touch-consulting/'],
  ['/en/projects/valueset', '/projelerimiz/valueset/'],
  ['/en/projects/vennyx', '/projelerimiz/vennyx/'],
  ['/en/projects/xray-groupe', '/projelerimiz/xray-groupe/'],
  ['/en/references', '/referanslarimiz/'],
  ['/en/portfolio', '/portfolyo/'],
  ['/en/blog', '/blog/'],
  [
    '/en/blog/how-to-build-a-digital-marketing-strategy-for-healthcare-brands',
    '/blog/saglik-markalari-icin-dijital-pazarlama-stratejisi-nasil-olusturulur/',
  ],
  [
    '/en/blog/how-to-earn-international-patient-trust-in-health-tourism',
    '/blog/saglik-turizminde-uluslararasi-hasta-guveni-nasil-kazanilir/',
  ],
  ['/en/careers', '/kariyer/'],
  ['/en/contact', '/iletisim/'],
  ['/en/free-analysis', '/ucretsiz-analiz/'],
  ['/en/personal-data-processing-notice', '/kvkk-aydinlatma-metni/'],
  ['/en/privacy-policy', '/gizlilik-politikasi/'],
  ['/en/cookie-policy', '/cerez-politikasi/'],
  ['/en/terms-of-use', '/kullanim-kosullari/'],

  /* Türkçe karşılığı OLMAYAN üç İngilizce sayfa — hedef konu yakınlığıyla seçildi.
     Üçünün de 28 günlük GSC gösterimi SIFIR, yani seçimin trafik maliyeti yok. */
  ['/en/services/healthcare-marketing', '/hizmetlerimiz/saglik-turizmi-danismanligi/'],
  [
    '/en/blog/healthcare-digital-advertising',
    '/blog/saglik-markalari-icin-dijital-pazarlama-stratejisi-nasil-olusturulur/',
  ],
  ['/en/blog/category/healthcare-marketing', '/blog/'],
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
