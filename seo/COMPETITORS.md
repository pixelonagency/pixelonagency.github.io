# PIXELON — REKABET ANALİZİ

**Tarih:** 2026-08-21
**Yöntem:** 11 domainin canlı HTML'i programatik tarandı (`scripts/seo/competitors.mjs`) +
ticari sorgularda SERP gözlemi. Ham veri: `seo/data/competitors-raw.json`.

> **Metodoloji uyarısı:** Trafik, ranking keyword sayısı, referring domain ve otorite
> metrikleri SEMrush erişimi olmadığı için **ölçülememiştir**. Bu dosyada tahmini trafik
> rakamı üretilmemiştir — uydurma sayı stratejiyi bozar. Ölçülebilen şey: konumlandırma,
> sayfa mimarisi, içerik varlığı, schema, teknik hijyen ve SERP görünürlüğü.

---

## 1. Verilen 10 rakip — ölçülen durum

| Domain             | Konumlandırma                               | Blog | Case | Fiyat | Schema | Teknik not                                      |
| ------------------ | ------------------------------------------- | ---- | ---- | ----- | ------ | ----------------------------------------------- |
| peganom.com        | **Sağlık turizmi ajansı** (title'da açık)   | ✅   | ✅   | ❌    | 19 tip | En zengin schema; doğrudan niş rakip            |
| newhealth.media    | "Türkiye'nin ilk sağlık reklam ajansı"      | ✅   | ✅   | ❌    | **0**  | Schema yok; H1 sadece rakamlar (240+/185+/135+) |
| basework.studio    | **Web tasarımı ve yazılım** (title'da açık) | ✅   | ✅   | ❌    | 8 tip  | Doğrudan web rakibi                             |
| keepkind.co        | Strateji/medya/performans                   | ✅   | ❌   | ❌    | 8 tip  | **H1 yok**                                      |
| kreatif.net        | Multidisipliner iletişim ajansı             | ❌   | ❌   | ❌    | 14 tip | Blog yok — içerik boşluğu                       |
| lokummedya.com     | Dijital tasarım & reklam                    | ✅   | ❌   | ❌    | 1 tip  | Zayıf schema                                    |
| fol.com.tr         | —                                           | ❌   | ✅   | ❌    | 5 tip  | **desc yok, H1 yok, lang="en"** (TR sayfada)    |
| 1618.agency        | Yaratıcı ajans                              | ✅   | ❌   | ❌    | **0**  | desc yok, schema yok                            |
| growdijital.com    | Sosyal medya/içerik/fotoğraf                | ❌   | ❌   | ❌    | 3 tip  | LocalBusiness var; site çok küçük               |
| zugadigital.com    | —                                           | ?    | ?    | ?     | ?      | **Tarama zaman aşımı** — yeniden denenecek      |
| **pixelon.com.tr** | **360° dijital pazarlama ajansı**           | ✅   | ✅   | ❌    | 6 tip  | H1/desc/canonical/hreflang tam                  |

---

## 2. SERP'te keşfedilen — listede OLMAYAN gerçek rakipler

Bunlar verilen listede yoktu; ticari sorgularda fiilen görünüyorlar.

### Sağlık turizmi kümesi (Pixelon'ın en güçlü nişi — SERP'te en zayıf olduğu yer)

- peganom.com _(listede vardı, SERP'te de çıkıyor)_
- medicondigital.com — "Sağlık Turizmi Reklam Ajansı"
- adverpeak.com — `/saglik-turizmi-dijital-pazarlama-ajansi/` özel landing
- boomdijital.com — `/saglik-turizmi-reklam-ajansi/` özel landing
- saglikturizmajansi.com — **tam eşleşen alan adı**
- dijitalsaglikturizmi.com — **tam eşleşen alan adı**
- ahmethallac.com — kişi markası + niş konumlandırma
- hepsireklam.com — blog üzerinden giriyor

### Web tasarım kümesi

- webtasarimiajansi.com.tr — tam eşleşen alan adı
- realwebtasarim.com — tam eşleşen alan adı
- istanbulwebtasarimajansi.com — tam eşleşen alan adı
- webtasarimsistemleri.com
- demircode.com — `/hizmetler/kurumsal-web-tasarim-profesyonel-web-sitesi` özel landing
- interaksiyon.com
- artarda.com — `/web-tasarim-ve-yazilim`

---

## 3. SERP'ten okunan desen — en önemli bulgu

Her iki kümede de sıralanan siteler aynı iki şeyi yapıyor:

1. **Sorgu kelimesi alan adında veya URL'de** — `saglikturizmajansi.com`,
   `/saglik-turizmi-reklam-ajansi/`, `/kurumsal-web-tasarim-...`
2. **Sorguya özel tek amaçlı landing page** — geniş hizmet sayfası değil

Pixelon'ın karşılığı `/hizmetlerimiz/web-tasarim-ve-yazilim/` ve
`/hizmetlerimiz/saglik-turizmi-danismanligi/`. İkisi de **hizmet adını** taşıyor,
**arama sorgusunu** değil.

Alan adı değiştirilemez ve değiştirilmemeli. Ama sorgu odaklı landing page açılabilir.

---

## 4. GAP ANALİZİ

### Rakiplerde olup Pixelon'da olmayan

| Gap                                          | Kimde var                         | Pixelon durumu              | Öncelik |
| -------------------------------------------- | --------------------------------- | --------------------------- | ------- |
| Sorguya özel ticari landing page             | adverpeak, boomdijital, demircode | Yok — sadece hizmet sayfası | **P0**  |
| Sektör/dikey sayfaları (klinik, doktor, diş) | peganom, medicondigital           | Yok                         | **P1**  |
| `Service` schema hizmet sayfalarında         | kısmen peganom                    | Yok                         | P1      |
| Sağlık turizminde içerik derinliği           | peganom (blog kümesi)             | 2 TR + 2 EN yazı            | **P1**  |
| EN içerik derinliği (uluslararası hasta)     | peganom, medicondigital           | 2 EN blog                   | **P1**  |

### Pixelon'da olup rakiplerin çoğunda olmayan — korunacak avantaj

| Avantaj                                         | Durum                                                |
| ----------------------------------------------- | ---------------------------------------------------- |
| Teknik hijyen (0 P0/P1, 0 orphan, 0 kırık link) | Rakiplerin çoğunda H1/desc/schema eksik              |
| 13 gerçek case study (TR+EN)                    | Çoğunda case study hiç yok                           |
| 23 yazılık yapılandırılmış blog kümesi          | kreatif.net, growdijital, fol'da blog yok            |
| TR/EN hreflang + x-default doğru kurulmuş       | Rakiplerde nadir; fol.com.tr'de TR sayfa `lang="en"` |
| Blog kümeleri birbirine bağlı (topic cluster)   | Rakiplerde dağınık yazılar                           |

### Content gap

Sağlık turizmi ve klinik pazarlaması kümesi: Pixelon'ın **iş olarak en güçlü**,
**içerik olarak en zayıf** alanı. Bu ters orantı en büyük fırsat.

### Keyword gap

❌ **ÖLÇÜLEMEDİ** — SEMrush yok. SERP gözlemiyle nitel olarak daraltıldı; gerçek hacim/KD
verisi geldiğinde `seo/data/keyword-master.csv` doldurulacak.

### Backlink gap

❌ **ÖLÇÜLEMEDİ** — backlink API'si yok. `BLOCKED`.

### Conversion gap

Rakiplerin hiçbirinde fiyat/paket sayfası yok. Pixelon'ın **fiyat konusunda şeffaf bir
ticari sayfası** olsa SERP'te boş bir alanı doldurur. (Blog yazısı var, ticari sayfa yok.)

### Entity gap

Pixelon `Organization` schema'ya sahip ama `sameAs` sosyal profil bağlantıları ve
hizmet ilişkileri zayıf. Entity güçlendirme fırsatı var.
