# SEO Audit Baseline — Pixelon (2026-08-19)

Denetim kapsamı: canlı site (`https://pixelon.com.tr`) + üretim build çıktısı (`dist/`, 43 sayfa + `/admin`).
Yöntem: canlı HTTP denetimi (host/redirect/robots/sitemap/404) + tüm build sayfalarının programatik taranması
(title, description, canonical, H1, lang, hreflang, JSON-LD, og:image).

## Envanter

- **44 HTML sayfa** (43 genel + 1 noindex `/admin`)
- Diller: 23 TR / 21 EN — her sayfada doğru `<html lang>`
- Sitemap: `sitemap-index.xml` → `sitemap-0.xml`, **42 URL** (yalnızca 200 + canonical; `/admin` yok)

## Sağlam bulunan alanlar (değişiklik gerekmedi)

| Alan                   | Durum                                                                           |
| ---------------------- | ------------------------------------------------------------------------------- |
| Host kanonikalizasyonu | `http://`, `http://www`, `https://www` → hepsi 301 → `https://pixelon.com.tr` ✓ |
| Trailing slash         | `/yol` → 301 → `/yol/` — tek indekslenebilir biçim ✓                            |
| robots.txt             | `Allow: /`, `Disallow: /admin/`, sitemap satırı mevcut ✓                        |
| 404                    | Gerçek HTTP 404 dönüyor (soft-404 yok) ✓                                        |
| Canonical              | Her sayfada self-canonical, https + apex host, sondaki eğik çizgili ✓           |
| hreflang               | TR/EN karşılıklı + `x-default` (TR) — yalnız gerçek çeviri çiftlerinde ✓        |
| Title / Description    | 43 sayfanın tamamında benzersiz title + description ✓                           |
| H1                     | Her sayfada tam olarak 1 semantik H1 ✓                                          |
| Noindex                | Yalnız `/admin` (CMS paneli) — doğru ✓                                          |
| Semantik HTML          | `header/nav/main/section/footer`, skip-link, gerçek `<a>` navigasyon ✓          |
| Marquee klonları       | Tüm dekoratif kopyalar `aria-hidden="true"` ✓                                   |
| Görseller              | astro:assets + srcset + lazy; anlamlı Türkçe/İngilizce alt metinleri ✓          |

## Bulunan sorunlar

| #   | Sorun                                                                                                                            | Önem   | Etkilenen                                |
| --- | -------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------- |
| 1   | **JSON-LD / yapılandırılmış veri yok** — Organization, WebSite, WebPage, BreadcrumbList, Service, BlogPosting hiçbir sayfada yok | **P0** | 43 sayfa                                 |
| 2   | **Placeholder müşteri yorumları prod'da** ("Ad Soyad", "Yayın izni alınmış gerçek müşteri yorumu…") — güven/kalite riski         | **P0** | `/` ve `/en/`                            |
| 3   | **`og:image` hiçbir sayfada yok** — sosyal paylaşımlar görselsiz                                                                 | **P1** | 43 sayfa                                 |
| 4   | **Sayaçlar kaynak HTML'de `0`** — crawler'lar/AI sistemleri "0+ Yıl Deneyim" okuyor; gerçek değerler yalnız JS sonrası           | **P1** | `/`, `/biz-kimiz`, `/projelerimiz` (+EN) |
| 5   | **Ana sayfa hero görseli `loading="lazy"`** — LCP adayı geç yükleniyor                                                           | **P1** | `/`, `/en/`, `/biz-kimiz` (+EN)          |
| 6   | Kullanılmayan font ağırlıkları yükleniyor (Space Grotesk 400, Archivo 500)                                                       | P2     | tüm sayfalar                             |
| 7   | Astro inline script uyarıları (`is:inline` eksik)                                                                                | P3     | build hijyeni                            |
| 8   | `http://www` → apex zinciri 2 sıçrama (GitHub Pages davranışı; tek sıçrama DNS/GH tarafında mümkün değil)                        | P3     | —                                        |

## Not edilen, değiştirilmeyen kararlar

- **URL yapısı korundu** — indekslenmiş hiçbir URL değişmedi; REDIRECT_PLAN gerekmedi.
- **Yasal sayfalar** (KVKK/Gizlilik/Çerez/Koşullar) indekslenebilir bırakıldı — noindex kararı stratejik değil, gerekirse sahibin kararına bırakıldı (bkz. OWNER_ACTIONS).
- **robots.txt AI crawler politikası değiştirilmedi** — politika kararı sahibe ait (bkz. OWNER_ACTIONS).
