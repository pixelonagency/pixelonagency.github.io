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

## 2026-08-21 (3. tur — deploy ayrımı + GSC kalıcı bağlantı)

| Alan                           | Değişiklik                                          | Gerekçe                                                           | Beklenen etki                                       |
| ------------------------------ | --------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------- |
| `.github/workflows/deploy.yml` | `paths-ignore`: `seo/**`, `scripts/seo/**`, `*.md`  | Push ile production deploy aynı şey olmamalı                      | SEO operasyon commit'i canlıya dokunmaz             |
| `scripts/seo/gsc.mjs`          | Service account ile Search Console veri çekimi      | Elle CSV dışa aktarımı sürdürülebilir değil                       | Günlük koşu "UNKNOWN" yerine gerçek veriyle çalışır |
| `scripts/seo/gsc.test.ts`      | 14 test — CTR yüzde sözleşmesi uçtan uca kilitlendi | `classifyQueries` eşikleri yüzde varsayıyor, biçim kayması riskli | Veri geldiği gün sessiz yanlış sınıflandırma olmaz  |
| `.gitignore`                   | `*gsc-sa*.json`, `*service-account*.json`           | Key repo dışında durmalı; kaza payı kapatıldı                     | —                                                   |

**Site içeriğinde değişiklik yapılmadı.** Bu tur da yalnızca operasyon altyapısı.

### Deploy politikası

`main`'e push artık otomatik olarak "yayına çıktı" demek değil. `paths-ignore` yalnızca
push'taki **tüm** dosyalar listeye uyduğunda devreye girer; karma commit (örn. `seo/` + `src/`)
normal şekilde deploy olur. `src/content/**/*.md` bilerek listeye alınmadı — blog yazıları
yayına çıkmaya devam eder. Operasyon commit'ini elle yayına almak gerekirse `workflow_dispatch`.

Gate kaybı yok: `.githooks/pre-push` zaten CI'nın koştuğu gate'in aynısını lokalde çalıştırıyor.

### GSC bağlantısı — bekleyen adımlar (sahip aksiyonu)

Kod hazır, kimlik bilgisi yok. Sırasıyla:

1. Google Cloud → **Google Search Console API** enable
2. Service account + JSON key
3. Key → `~/.config/pixelon/gsc-sa.json` (repo dışı)
4. Search Console → _Settings > Users and permissions_ → key'deki `client_email` → **Full**
5. `bun run seo:gsc`

Üçüncü parti GSC MCP sunucuları değerlendirildi ve **reddedildi**: hiçbiri Google resmi değil
ve tamamı service account key'ine tam erişim istiyor. Kendi çekicimiz ek bağımlılık da getirmiyor.

## 2026-08-22 — gizlilik katmanı + forward-only temizlik

Repo public. Search Console bağlantısı açıldığı an gerçek sorgu, sıralama ve fırsat verisi
üretilmeye başladı; bunların git'e girmesi rakibe hazır istihbarat vermek olurdu.

| Alan                          | Değişiklik                                                    | Gerekçe                                            |
| ----------------------------- | ------------------------------------------------------------- | -------------------------------------------------- |
| `scripts/seo/privacy.mjs`     | public/private ayrımı tek noktadan tanımlandı                 | Politika dokümanda değil kodda yaşamalı            |
| `scripts/seo/clock.mjs`       | Tek tarih kaynağı (Europe/Istanbul)                           | UTC ayrışması teknik metrikleri sessizce siliyordu |
| `seo/SEO_STATE.json`          | İki katmana ayrıldı; public tarafta yalnızca operasyon durumu | Hedefleme ve fırsat verisi yerelde kalır           |
| `seo/reports/`                | Public tarafa yalnızca `SUMMARY-*` toplam metrik yazılır      | Sorgu ve sıralama detayı yerelde kalır             |
| `scripts/seo/competitors.mjs` | Çıktı gizli katmana yazılır                                   | Rakip taraması istihbarattır                       |
| 6 belge                       | `git rm --cached` ile takipten çıkarıldı, yerelde korundu     | Hedefleme, rekabet ve off-site planları            |

**Site içeriğinde değişiklik yapılmadı.** Bu tur da yalnızca operasyon altyapısı.

### Forward-only temizlik — ne yapıldı, ne yapılmadı

Hedefleme haritası, içerik yol haritası, off-site planı, rekabet analizi, rakip ham verisi ve
eski detaylı günlük rapor yerel gizli katmana taşındı ve takipten çıkarıldı. Dosyalar
makinede duruyor; hiçbir bilgi kaybolmadı.

**History rewrite YAPILMADI.** Bu belgeler bugüne kadar public'ti ve commit geçmişinde
kalmaya devam ediyor — klonlarda, fork'larda ve GitHub cache'inde de öyle. Forward-only
temizlik geçmiş maruziyeti kaldırmaz, yalnızca bugünden sonrasını kapatır. Kapatılması
gereken bir kimlik bilgisi yok; maruziyet strateji ile sınırlı, rotasyon gerekmiyor.

Public belgeler artık gizli belgelerin **adını da** anmıyor; dosya adı bile stratejiyi
ele verebilir. Bu kural `privacy.test.ts` ile kapıda doğrulanıyor.

## 2026-09-16 — İNGİLİZCE BÖLÜM YAYINDAN KALDIRILDI

Sahip kararı. Teşhis 16 Eyl'de canlı doğrulamayla kapandı.

### Ölçülen durum (karardan önce)

Ham GSC rakamları **izlenmeyen** dosyaya yazıldı: `seo/private/measurement/`
(repo public — [gizlilik kuralı](#) gereği burada yalnızca bant ifadesi kullanılır).

| Kanıt                                    | Durum                                                                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `pixelon` araması (gl=tr&hl=tr) 1. sonuç | **`/en/`** — İngilizce başlık + "Bu sayfanın çevirisini yap"                                                                    |
| `pixelon ajans` araması                  | Google sorguyu "pixel ajans" diye düzeltiyor; site ilk sayfada **yok**                                                          |
| İngilizce sayfa sayısı                   | 41 / 109 (**%38**) — yapısal, GSC değil                                                                                         |
| İngilizce tarafın gösterim payı          | site toplamının üçte ikisinden fazlası                                                                                          |
| İngilizce CTR                            | Türkçenin **üçte biri**; tek bir EN blog yazısı gösterimin çoğunu üretiyor ve 3. sayfa bandında, tıklaması yok denecek kadar az |
| `/en/` ana sayfasının tıklamaları        | neredeyse tamamı MARKA araması — yani Türkçe ana sayfaya gidecek trafik                                                         |
| Marka dışı gerçek getiri                 | tek haneli tıklama / 28 gün                                                                                                     |
| İç link grafiğinin İngilizceye akan payı | 988 / 2.687 (**%37**) — yapısal, GSC değil                                                                                      |

### Yapılan

| Alan                              | Değişiklik                                                  | Gerekçe                                                                          |
| --------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `src/lib/i18n.ts`                 | `PUBLISHED_LOCALES` eklendi (`LOCALES`'ten ayrı)            | "Bilinen dil" ile "yayınlanan dil" ayrımı; geri açış tek satır                   |
| `src/pages/[...path].astro`       | Rota üretimi yayınlanan dile bağlandı + koleksiyon filtresi | `content/<x>/en/` altına bırakılan dosya sessizce yayına giremesin               |
| `src/layouts/BaseLayout.astro`    | Tek dil yayındayken hreflang hiç yazılmıyor                 | Kendine dönen etiket sinyal üretmez, gürültü yapar                               |
| `src/content/**/en/`              | 48 içerik dosyası silindi                                   | Git geçmişinde duruyor                                                           |
| `scripts/seo/build-redirects.mjs` | 45 İngilizce URL → Türkçe karşılığı **301**                 | 404 değil 301: `/en/` marka sorgusunda 1. sıradaydı, o güç Türkçeye devrediliyor |
| `public/admin/config.yml`         | CMS dil listesi `[tr]`                                      | Editör yayınlanmayan dilde içerik yazmasın                                       |

**Sökülmeyen:** çokdillilik altyapısı (54 dosya) ve `ui.ts`'deki 113 İngilizce metin
anahtarı. Sökmek teknik olarak kusursuz bir siteyi riske atar ve geri açışı pahalılaştırırdı.
İngilizceyi geri açmak = `PUBLISHED_LOCALES`'e `'en'` eklemek + içerik koymak.

### Sonuç (doğrulandı)

| Ölçüm                | Önce                      | Sonra                     |
| -------------------- | ------------------------- | ------------------------- |
| İç link              | 2.687 (988'i İngilizceye) | **1.661 · İngilizceye 0** |
| Sitemap URL          | 105                       | 65                        |
| hreflang etiketi     | var                       | 0                         |
| Teknik bulgu (P0–P3) | 0                         | **0** (korundu)           |
| Orphan / kırık link  | 0 / 0                     | **0 / 0**                 |

Hedef, bu turda tıklama artışı DEĞİL: marka sorgusunun Türkçe ana sayfaya dönmesi ve
Türkçe sayfa üretiminin İngilizce ikiz zorunluluğundan kurtulması. Ölçüm penceresi
yayına alındığı günden itibaren başlar.

**Değişmeyen tespit:** otorite hâlâ asıl darboğaz — Authority Score **2**, referring
domain **5** (beşi de müşteri footer'ı). Bkz. `seo/private/backlinks/`.
