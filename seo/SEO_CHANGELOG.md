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
