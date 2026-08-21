# PIXELON SEO — MASTER PLAN

**Source of truth.** Bütün SEO operasyonları bu dosyadan yürür.
Görev tamamlandığında checkbox anında `[ ] → [x]` yapılır ve `SEO_CHANGELOG.md`'ye yazılır.

**Çalışma modu:** `APPROVAL_REQUIRED`
Araştırma/analiz/hazırlık otonom · yayın ve riskli değişiklik onaya bağlı.

**Son güncelleme:** 2026-08-21

---

## Durum özeti

|                      |                                          |
| -------------------- | ---------------------------------------- |
| Teknik sağlık        | ✅ P0: 0 · P1: 0 · P2: 2                 |
| İndexlenebilir sayfa | 99                                       |
| Blog yazısı          | 23 TR · 2 EN                             |
| Case study           | 13                                       |
| Ölçüm erişimi        | ❌ GSC yok · ❌ SEMrush yok · ❌ GBP yok |
| Onay bekleyen        | `seo/APPROVAL_QUEUE.md`                  |

---

## P0 — Critical

- [x] `SEO-2026-0001` Teknik SEO denetim aracı yaz (`scripts/seo/audit.mjs`) — tekrar çalıştırılabilir
- [x] `SEO-2026-0002` Tam teknik denetim çalıştır — P0/P1 bulgu **yok** olarak doğrulandı
- [x] `SEO-2026-0003` Baseline oluştur (`seo/reports/BASELINE.md`)
- [x] `SEO-2026-0004` Rakip yapısal tarama aracı yaz (`scripts/seo/competitors.mjs`)
- [x] `SEO-2026-0005` Verilen 10 rakibi analiz et
- [x] `SEO-2026-0006` SERP'ten listede olmayan 14 gerçek rakip keşfet
- [x] `SEO-2026-0007` Gap analizi (`seo/COMPETITORS.md`)
- [x] `SEO-2026-0008` SEO işletim sistemi dosya yapısını kur
- [ ] `SEO-2026-0009` **Google Search Console erişimi aç** — BLOCKED, sahip aksiyonu gerekiyor
- [ ] `SEO-2026-0010` **SEMrush veya eşdeğer keyword/backlink verisi sağla** — BLOCKED

## P1 — High Impact

- [ ] `SEO-2026-0011` Sağlık turizmi ticari landing page — sorgu odaklı, hizmet sayfasından ayrı `READY_FOR_APPROVAL` bekliyor
- [ ] `SEO-2026-0012` Web tasarım ticari landing page — sorgu odaklı
- [ ] `SEO-2026-0013` Klinik / doktor web sitesi sektör sayfası
- [ ] `SEO-2026-0014` Web tasarım fiyatları — ticari sayfa (blog yazısı var, ticari sayfa yok; SERP'te boş alan)
- [ ] `SEO-2026-0015` Hizmet sayfalarına `Service` schema ekle
- [ ] `SEO-2026-0016` EN sağlık turizmi içerik derinliği (uluslararası hasta kümesi)

## Technical SEO

- [x] `SEO-2026-0017` Crawlability / indexability doğrulaması
- [x] `SEO-2026-0018` Canonical + hreflang + x-default doğrulaması
- [x] `SEO-2026-0019` Sitemap tutarlılığı (99 URL, noindex sızıntısı yok)
- [x] `SEO-2026-0020` Orphan sayfa taraması — 0
- [x] `SEO-2026-0021` Kırık iç bağlantı taraması — 0
- [x] `SEO-2026-0022` Yinelenen metadata taraması — 0
- [ ] `SEO-2026-0023` Core Web Vitals laboratuvar ölçümü (Lighthouse)
- [ ] `SEO-2026-0024` Blog title 70 karakter düzeltmesi (P2)
- [ ] `SEO-2026-0025` `Organization.sameAs` sosyal profil bağlantılarını doğrula/güçlendir

## Web Design Cluster

- [ ] `SEO-2026-0026` Web kümesi keyword→sayfa haritası (GSC verisi gelince kesinleşir)
- [ ] `SEO-2026-0027` `/web-sitesi-yaptir` dönüşüm denetimi
- [ ] `SEO-2026-0028` Web hizmet sayfası ↔ blog iç bağlantı güçlendirmesi

## Social Media Cluster

- [x] `SEO-2026-0029` Sosyal medya blog kümesi yayında (3 yazı + mevcut ajans yazısı)
- [ ] `SEO-2026-0030` Sosyal medya hizmet sayfası ↔ blog bağlantı denetimi

## Health Tourism Cluster

- [ ] `SEO-2026-0031` Sağlık turizmi konu kümesi mimarisi (SERP'e göre)
- [ ] `SEO-2026-0032` Klinik/diş/saç ekimi dikey içerik araştırması
- [ ] `SEO-2026-0033` Dentasay case study'sini sağlık kümesine bağla

## Content

- [x] `SEO-2026-0034` 20 yazılık blog kümesi yayınlandı (WEB/ADS/SEO/SOCIAL/BRAND/CRM)
- [ ] `SEO-2026-0035` Yayınlanan 23 yazı için performans takip tablosu kur
- [ ] `SEO-2026-0036` İçerik decay izleme (GSC gerektirir) — BLOCKED

## GEO / AEO

- [x] `SEO-2026-0037` Blog kümesinde answer-first + kısa cevap bloğu yapısı uygulandı
- [ ] `SEO-2026-0038` Güncel Google Search Central generative search dokümanını doğrula
- [ ] `SEO-2026-0039` Entity ilişkilerini güçlendir (Organization ↔ Service ↔ Case)

## Internal Linking

- [x] `SEO-2026-0040` Blog içi kırık bağlantı sıfırlandı
- [ ] `SEO-2026-0041` Blog → hizmet sayfası geçiş oranını ölçülebilir hale getir

## Case Studies

- [ ] `SEO-2026-0042` Case study'lere ölçülebilir sonuç ekle (sahip verisi gerekiyor)
- [ ] `SEO-2026-0043` Case study ↔ hizmet ↔ blog üçgen bağlantısı

## CRO

- [ ] `SEO-2026-0044` Ticari sayfalarda dönüşüm yolu denetimi
- [ ] `SEO-2026-0045` WhatsApp / form / telefon olaylarının gerçekten kaydedildiğini doğrula

## Backlinks / Authority

- [ ] `SEO-2026-0046` Backlink gap analizi — BLOCKED (API yok)
- [ ] `SEO-2026-0047` Linkable asset fırsat araştırması
- [ ] `SEO-2026-0048` Ajans dizini / tasarım galerisi prospect listesi (iletişim ONAY gerektirir)

## Measurement

- [x] `SEO-2026-0049` Baseline donduruldu
- [ ] `SEO-2026-0050` Haftalık rapor otomasyonu
- [ ] `SEO-2026-0051` Aylık strateji gözden geçirme
