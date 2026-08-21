# PIXELON SEO — CHANGELOG

Siteyi veya SEO operasyonunu etkileyen her gerçek değişiklik buraya yazılır.

---

## 2026-08-21

| Alan                          | Değişiklik                         | Gerekçe                                            | Hedef | Beklenen etki               | Ölçüm                   |
| ----------------------------- | ---------------------------------- | -------------------------------------------------- | ----- | --------------------------- | ----------------------- |
| `scripts/seo/audit.mjs`       | Teknik SEO denetim aracı eklendi   | Tekrar çalıştırılabilir, ölçülebilir teknik sağlık | —     | Regresyon erken yakalanır   | Her run'da P0/P1 sayısı |
| `scripts/seo/competitors.mjs` | Rakip yapısal tarama aracı eklendi | Rakip mimarisini elle değil programatik izlemek    | —     | Rakip hamlesi erken görülür | Aylık karşılaştırma     |
| `seo/**`                      | SEO işletim sistemi kuruldu        | Kalıcı hafıza + onay kontrolü                      | —     | Oturumlar arası süreklilik  | —                       |
| `seo/reports/BASELINE.md`     | Baseline donduruldu                | Sonraki ölçümlerin referansı                       | —     | —                           | —                       |

**Site içeriğinde değişiklik yapılmadı.** Bu tur yalnızca analiz + altyapı.

### Denetim düzeltmesi (araç, site değil)

`audit.mjs` ilk çalışmasında 20 adet "alt yok" bulgusu üretti. İncelendi: Astro `alt=""`
çıktısını çıplak `alt` olarak basıyor ve bu görseller zaten `aria-hidden` marquee kopyaları.
**Site doğruydu, denetim regex'i yanlıştı** — regex düzeltildi, yanlış pozitif kaldırıldı.
Ders: denetim aracının bulgusu, siteyi değiştirmeden önce doğrulanmalı.

## 2026-08-21 (2. tur — veri kaynağı + görsel politikaları)

| Alan                                 | Değişiklik                                              | Gerekçe                              | Beklenen etki                                   |
| ------------------------------------ | ------------------------------------------------------- | ------------------------------------ | ----------------------------------------------- |
| `scripts/seo/sources.mjs`            | Veri kaynağı sağlık kontrolü + GSC/SEMrush alım katmanı | "NO DATA = NO ASSUMPTION" politikası | Kaynak açıldığı an kod değişmeden devreye girer |
| `scripts/seo/daily.mjs`              | `DATA SOURCES USED` bloğu + GSC fırsat sınıflandırıcı   | Veri → karar döngüsü                 | GSC gelince günün önceliği otomatik değişir     |
| `seo/VISUAL-SYSTEM.md`               | Görsel içerik sistemi                                   | Görsel = bilgi, dekor değil          | Tutarlı ve bilgi taşıyan görsel                 |
| `seo/visual-briefs/_TEMPLATE.md`     | Zorunlu brief şablonu                                   | Brief'siz görsel üretilmez           | —                                               |
| `seo/data/gsc/`, `seo/data/semrush/` | Alım klasörleri                                         | Tarih bazlı saklama                  | —                                               |

**Site içeriğinde değişiklik yapılmadı.**

### Tespit edilen veri hatası — marka aksan rengi

Ağustos 2026'da üretilen 32 blog görselinin prompt'larında lime aksan `#C8F04B` olarak
verilmişti. `src/styles/tokens.css` doğrulandı: gerçek değer **`--accent: #cfff00`**.
Görseller marka paletiyle birebir örtüşmüyor. Yayındaki görseller görsel olarak tutarlı
olduğu için acil değil; `SEO-2026-0062` altına alındı ve sonraki üretimlerde doğru
değer kullanılacak. **Kaynak kod doğrulanmadan renk değeri kullanılmamalıydı.**

### SEMrush MCP eklendi — henüz kullanılabilir değil

`claude mcp add semrush https://mcp.semrush.com/v2/mcp -t http` çalıştırıldı; sunucu proje
local config'e yazıldı. **Durum: `Needs authentication`** ve araçları bu oturuma yüklenmedi.
Kullanılabilir hâle gelmesi için: Claude Code yeniden başlatılmalı → OAuth tamamlanmalı.
Bu tamamlanana kadar keyword/backlink verisi **UNKNOWN** kalmaya devam eder; tahmin üretilmez.
