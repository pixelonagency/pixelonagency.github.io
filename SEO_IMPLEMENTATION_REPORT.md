# SEO Implementation Report — Pixelon (2026-08-19)

Bu turda **teknik SEO, uluslararası SEO, şema mimarisi, performans ve GEO/AEO altyapısı** çözüldü.
İçerik yeniden yazımı, URL değişikliği ve kapsamlı keyword hedeflemesi bilinçli olarak FINAL SEO PASS'e bırakıldı.

## Düzeltmeler (Before / After)

| Sorun                    | Önem | Önce                                            | Düzeltme                                                                                                                                                                                                                                       | Sonra                                                           | Etkilenen               |
| ------------------------ | ---- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------- |
| Yapılandırılmış veri yok | P0   | 0 JSON-LD bloğu                                 | Merkezi entity graph: `src/lib/schema.ts` + BaseLayout — her sayfada `Organization(#organization)` + `WebSite(#website)` + `WebPage`; hizmetlerde `Service`, blogda `BlogPosting`, breadcrumb'lı sayfalarda görünenle birebir `BreadcrumbList` | 68 geçerli JSON-LD bloğu, tümü tek Organization kimliğine bağlı | 43 sayfa                |
| Placeholder yorumlar     | P0   | "Ad Soyad / Yayın izni alınmış…" 3 kart prod'da | Bölüm TR+EN ana sayfadan kaldırıldı; gerçek yorumlar gelince CMS'ten geri eklenecek                                                                                                                                                            | Placeholder yok (regresyon testi korumada)                      | `/`, `/en/`             |
| og:image yok             | P1   | 0 sayfa                                         | BaseLayout'a `og:image`+`twitter:image`; varsayılan marka görseli, blog yazılarında kapak görseli                                                                                                                                              | 43 sayfada mutlak og:image                                      | 43 sayfa                |
| Sayaçlar HTML'de 0       | P1   | Kaynakta `0+`                                   | Gerçek değer HTML'de basılıyor; animasyon progressive enhancement                                                                                                                                                                              | Crawler "15+ / 180+ / 120+ / 50+" okuyor                        | 6 sayfa                 |
| Hero görseli lazy        | P1   | `loading="lazy"` (LCP adayı)                    | `loading="eager"` + `fetchpriority="high"`                                                                                                                                                                                                     | LCP görseli öncelikli                                           | `/`, `/biz-kimiz` (+EN) |
| Fazla font ağırlığı      | P2   | SG 400/500/600/700 + Archivo 400/500/600        | Kullanılmayan SG 400 + Archivo 500 kaldırıldı (Archivo 600 `<strong>` için korunur)                                                                                                                                                            | 2 font dosyası daha az                                          | tüm sayfalar            |
| Inline script hint'leri  | P3   | 2 Astro hint                                    | `is:inline` eklendi                                                                                                                                                                                                                            | typecheck 0 hint (ld+json)                                      | —                       |

## Şema mimarisi

```
#organization (Organization)
  ├─ name, url, logo, email, telephone
  ├─ address: Kadıköy / İstanbul / TR   ← görünen içerikle birebir
  ├─ contactPoint (TR+EN)
  └─ sameAs: Instagram, Facebook        ← site ayarlarından
#website (WebSite) — publisher → #organization
WebPage (her sayfa) — isPartOf → #website, about → #organization
Service (10×2 hizmet)  — provider → #organization
BlogPosting (yazılar)  — author/publisher → #organization ("Pixelon*" kurumsal yazar; kişi adları Person olur)
BreadcrumbList         — yalnız görünür breadcrumb'ı olan sayfalarda, aynı sırayla
```

Kurallar: hiçbir alan uydurulmadı; her değer görünen içerik veya `settings` deposundan geliyor.
Sokak adresi bilinmediği için `streetAddress` **bilinçli olarak eklenmedi** (bkz. OWNER_ACTIONS).

## GEO / AEO iyileştirmeleri

- **Entity clarity:** tek kalıcı `#organization` kimliği; tüm sayfa tipleri ona bağlanıyor.
- **Machine-readable rakamlar:** deneyim/proje sayıları artık ilk HTML'de.
- **Kaynaklanabilirlik:** placeholder (doğrulanamaz) yorumlar üretimden çıkarıldı.
- Mevcut yapı zaten güçlü: kritik içerik JS'siz HTML'de, SSS'ler gerçek soru-cevap, breadcrumb + semantik HTML.

## Otomatik SEO regresyon paketi (`tests/dist-smoke.ts`)

Her `bun run verify` çalışmasında: title/description/canonical/H1/lang varlığı · site genelinde benzersiz title ·
self-canonical + doğru URL biçimi · her sayfada parse edilebilir JSON-LD (+Organization/WebPage) · Service/BlogPosting
sayfa tipi şemaları · hreflang hedeflerinin build'de var olması · sitemap↔dist eşleşmesi (+`/admin` dışlaması) ·
mutlak og:image · sayaç HTML değerleri · placeholder yorum sızıntısı. **Toplam 87 dist testi.**

## Performans notu

Site statik Astro; ölçülen sayfa ağırlığı düşük (ana sayfa HTML ~90KB, görseller srcset'li webp, JS yalnızca
küçük progressive-enhancement blokları). Bu turda: LCP görseli eager/high-priority, 2 gereksiz font dosyası kaldırıldı,
`aspect-ratio` sabitlemeleri zaten CLS'i engelliyor. Gerçek alan verisi (CrUX/Search Console CWV) için OWNER_ACTIONS'a bakınız.

## Değişen dosyalar

`src/lib/schema.ts` (yeni) · `src/layouts/BaseLayout.astro` · `src/components/ServiceDetail.astro` ·
`src/components/PostDetail.astro` · `src/components/sections/HeroSection.astro` · `src/components/sections/StatsSection.astro` ·
`src/content/pages/{tr,en}/home.yml` · `tests/dist-smoke.ts`

URL değişikliği yok → `REDIRECT_PLAN.md` gerekmedi.
