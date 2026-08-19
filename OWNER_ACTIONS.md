# Owner Actions — Pixelon SEO

Kod tarafında çözülemeyen, sahibinden bilgi/karar/erişim gerektiren maddeler.

---

**NEEDED:** Resmî şirket unvanı (ör. "Pixelon Dijital Pazarlama Ltd. Şti.")
**WHY:** Organization schema'da `legalName` alanı ve KVKK sayfası tutarlılığı için. Şu an yalnız "Pixelon" markası kullanılıyor (doğru ama eksik).
**WHERE IT WILL BE USED:** JSON-LD Organization, iletişim sayfası.
**PRIORITY:** P2

---

**NEEDED:** Açık adres (sokak/no) — şu an yalnız "Kadıköy, İstanbul" biliniyor.
**WHY:** `streetAddress` şemaya bilerek eklenmedi (uydurmamak için). Google Business Profile ile birebir eşleşmeli.
**WHERE IT WILL BE USED:** Organization schema, iletişim sayfası, GBP.
**PRIORITY:** P1 (GBP ile birlikte)

---

**NEEDED:** Google Business Profile oluşturma/erişimi.
**WHY:** Local SEO + Knowledge Panel + AI yanıt sistemleri için en güçlü dış sinyal.
**WHERE IT WILL BE USED:** Off-site (bkz. SEO_OFFSITE_ROADMAP #1).
**PRIORITY:** P0 (off-site)

---

**NEEDED:** 2-3 gerçek, yayın izinli müşteri yorumu (ad, rol, marka, metin).
**WHY:** Placeholder yorumlar üretimden kaldırıldı; bölüm gerçek yorumlarla CMS'ten geri açılacak. Sahte yorum/rating schema kullanılmayacak.
**WHERE IT WILL BE USED:** Ana sayfa "Müşterilerimiz Ne Diyor?" bölümü (içerik hazır, `cards` + `rating` ile geri eklenir).
**PRIORITY:** P1

---

**NEEDED:** Google Search Console erişimi/exportları (Performance + Page Indexing + CWV) ve varsa GA4 organik veri.
**WHY:** Keyword map şu an içerik temelli tahmin; gerçek query/impression verisiyle FINAL SEO PASS önceliklendirilecek. CWV alan verisi lab ölçümünden daha değerli.
**WHERE IT WILL BE USED:** SEO_KEYWORD_MAP güncellemesi, içerik yol haritası, performans doğrulaması.
**PRIORITY:** P1

---

**NEEDED:** Proje sonuç metrikleri (varsa): trafik/dönüşüm/talep artışları, kaynaklarıyla.
**WHY:** Case study'ler şu an sonuç metriği içermiyor; gerçek veri E-E-A-T ve GEO için en güçlü içerik. Veri yoksa mevcut anlatım korunur — metrik uydurulmaz.
**WHERE IT WILL BE USED:** Proje detay sayfaları.
**PRIORITY:** P2

---

**NEEDED:** AI crawler politikası kararı (GPTBot, ClaudeBot, PerplexityBot vb. erişimine izin/kısıt).
**WHY:** robots.txt şu an tüm bot'lara açık. GEO görünürlüğü isteniyorsa açık kalması önerilir; kısıt istenirse ekleriz. Politika kararı sahibindir — sessizce değiştirilmedi.
**WHERE IT WILL BE USED:** `public/robots.txt`.
**PRIORITY:** P3 (öneri: açık bırak)

---

**NEEDED:** Yasal sayfaların (KVKK vb.) gerçek metin içerikleri hukukçu onaylı mı, indekslenmeli mi kararı.
**WHY:** Şu an indekslenebilir durumdalar (zararsız); noindex istenirse tek satırla uygulanır.
**WHERE IT WILL BE USED:** İlgili sayfalar.
**PRIORITY:** P3

---

**NEEDED:** Bing Webmaster Tools + (istenirse) IndexNow anahtarı.
**WHY:** Bing/Copilot görünürlüğü. IndexNow, GH Pages statik yapıya eklenebilir ama anahtar üretimi/doğrulaması sahibinde.
**WHERE IT WILL BE USED:** Deploy akışı (yalnız değişen URL'ler push edilir).
**PRIORITY:** P3

---

## Yasal Sayfalar (2026-08-19)

- Yasal sayfalar FINAL sahip verileriyle güncellendi: veri sorumlusu Mehmet Fatih Dayan,
  adres Sahrayıcedit Mah. Şafak Sok. No:1, Kadıköy / İstanbul, kanal info@pixelon.com.tr.
  Saklama politikası sahip onaylı (müşteri ilişkisine dönüşmeyen talepler → en geç 2 yıl).
- **Yapılacak:** Metinleri hukukçuya kontrol ettir — özellikle hukuki sebepler (form: m.5/2-c,
  güvenlik/çerez: m.5/2-f) ve yetkili mahkeme yazılmaması. "Türkçe metin esastır" hükmü
  kaldırıldı; istenirse hukukçu onayıyla geri eklenir.
- Yeni bir izleme aracı (GA4/Meta/Clarity/Ads) eklenirse Çerez Politikası + Klaro yapılandırması
  - PRIVACY_TRACKING_INVENTORY.md aynı committe güncellenmeli (dist-smoke testleri bunu zorlar).
