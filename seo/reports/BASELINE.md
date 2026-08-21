# PIXELON SEO — BASELINE

**Tarih:** 2026-08-21 · **Domain:** https://pixelon.com.tr
**Yöntem:** üretim build'i (`dist/`) programatik denetimi + canlı HTTP kontrolü + SERP gözlemi.

Bu dosya donmuş bir referans noktasıdır. Sonraki tüm ölçümler buna göre karşılaştırılır.
Rakam güncellemesi yapılmaz; yeni ölçüm yeni rapor dosyasına yazılır.

---

## 1. Erişilebilen ve erişilemeyen veri kaynakları

| Kaynak                      | Durum         | Not                                                                                                                    |
| --------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Repository / build çıktısı  | ✅ TAM        | Teknik denetimin tamamı buradan yapılıyor                                                                              |
| Canlı site (HTTP)           | ✅ TAM        | Durum kodu, robots, sitemap, redirect                                                                                  |
| Google SERP gözlemi         | ⚠️ KISITLI    | Arama aracı ABD merkezli; Google Türkiye SERP'i birebir değil                                                          |
| **Google Search Console**   | ✅ **BAĞLI**  | Service account (2026-08-22). Bu baseline GSC öncesi donduruldu; arama metrikleri için karşılaştırma tabanı 2026-08-22 |
| **SEMrush**                 | ❌ **BLOKLU** | MCP/API/CLI yok. Hacim, KD, DR, backlink verisi **yok**                                                                |
| **Google Business Profile** | ❌ **BLOKLU** | Erişim yok                                                                                                             |
| Google Analytics / GTM      | ⚠️ KISITLI    | Sitede dataLayer olayları var; rapor erişimi yok                                                                       |

> **Kritik uyarı:** GSC ve SEMrush olmadan arama hacmi, gerçek sıralama, tıklama ve
> backlink otoritesi **ölçülemez**. Bu dosyadaki hiçbir yerde tahmini hacim veya
> uydurma sıralama rakamı yoktur. Bu iki erişim açıldığında baseline'ın 4. ve 5.
> bölümleri gerçek veriyle doldurulacaktır.

---

## 2. Teknik sağlık — ÖLÇÜLDÜ

Kaynak: `seo/reports/TECHNICAL-AUDIT-2026-08-21.json`

| Metrik            | Değer                                         |
| ----------------- | --------------------------------------------- |
| Toplam HTML sayfa | 101                                           |
| İndexlenebilir    | 99                                            |
| Noindex           | 2 (`/admin`, `/en/admin` — CMS paneli, doğru) |
| Sitemap URL       | 99                                            |
| Orphan sayfa      | **0**                                         |
| Kırık iç bağlantı | **0**                                         |
| P0 bulgu          | **0**                                         |
| P1 bulgu          | **0**                                         |
| P2 bulgu          | 2                                             |
| P3 bulgu          | 0                                             |

**Kalan 2 P2:**

1. `/admin/` — img width/height yok (noindex CMS paneli, SEO etkisi yok, düzeltme gereksiz)
2. `/blog/saglik-turizminde-uluslararasi-hasta-guveni-nasil-kazanilir/` — title 70 karakter

**Doğrulanan sağlam alanlar:** host kanonikalizasyonu (301 zinciri temiz), trailing slash tekliği,
self-canonical, TR/EN hreflang + x-default, benzersiz title/description, sayfa başına tek H1,
semantik HTML, `astro:assets` ile responsive görseller, gerçek 404.

---

## 3. İçerik envanteri — ÖLÇÜLDÜ

| Tür               | TR                                            | EN  | Toplam |
| ----------------- | --------------------------------------------- | --- | ------ |
| Ana sayfa         | 1                                             | 1   | 2      |
| Hizmet sayfası    | 10                                            | 10  | 20     |
| Hizmetler indeksi | 1                                             | 1   | 2      |
| Case study        | 13                                            | 13  | 26     |
| Blog yazısı       | 23                                            | 2   | 25     |
| Dönüşüm sayfası   | 2 (`/ucretsiz-analiz`, `/web-sitesi-yaptir`)  | 2   | 4      |
| Kurumsal          | 4 (biz-kimiz, iletişim, kariyer, referanslar) | 4   | 8      |
| Yasal             | 4                                             | 4   | 8      |

**Not:** Blog TR/EN dengesizliği belirgin — 23 TR'ye karşı 2 EN. EN tarafı sağlık turizminde
uluslararası talep için stratejik önem taşıyor (detay: yerel gizli katman).

---

## 4. Sıralama / trafik baseline — ❌ ÖLÇÜLEMEDİ

GSC erişimi olmadığı için aşağıdakiler **boş bırakılmıştır**. Tahmin yazılmamıştır.

- [ ] Organik click
- [ ] Organik impression
- [ ] CTR
- [ ] Ortalama pozisyon
- [ ] Branded / non-branded ayrımı
- [ ] Top 3 / 10 / 20 kelime sayısı
- [ ] En çok trafik alan sayfalar
- [ ] Organik dönüşüm

**Durum:** Açıldı — service account `pixelon-seo-gsc@…` Search Console'a eklendi. Tarihsel not: bu satır
(servis hesabı JSON'u `.env` üzerinden) veya GSC performans dışa aktarımının CSV olarak
`seo/data/gsc-export.csv` yoluna konması.

---

## 5. Otorite / backlink baseline — ❌ ÖLÇÜLEMEDİ

SEMrush veya eşdeğer backlink API'si olmadığı için referring domain sayısı, backlink profili
ve otorite metrikleri ölçülememiştir. Rakip backlink karşılaştırması da bu nedenle
`BLOCKED` durumundadır.

---

## 6. Core Web Vitals — kısmi

Saha verisi (CrUX) GSC üzerinden gelir → bloklu.
Laboratuvar ölçümü Chrome DevTools üzerinden yapılabilir; ilk daily run'da alınacak.

---

## 7. Baseline özeti

Pixelon **teknik olarak sağlıklı, içerik olarak yeni güçlenmiş, ticari sayfa mimarisi
bakımından eksik** bir sitedir.

- Teknik borç neredeyse sıfır — bu, SEO çalışmasının teknik düzeltmeye değil
  **ticari sayfa mimarisi ve otoriteye** ayrılabileceği anlamına gelir.
- 23 blog yazısı yeni yayınlandı; henüz sıralama verisi oluşmadı (ölçüm penceresi başlıyor).
- Ticari sayfa mimarisiyle ilgili açık tespit edildi; ayrıntı ve hedefleme yerel gizli
  katmanda tutulur.
