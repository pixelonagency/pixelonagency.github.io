# Privacy / Tracking Inventory — Pixelon (dahili bakım kaydı)

Amaç: ileride bir izleme servisi eklendiğinde/kaldırıldığında Çerez Politikası + Klaro config + Consent Mode
eşlemesinin birlikte güncellenmesini garanti etmek. **Her servis değişikliğinde bu tablo ve Çerez Politikası
AYNI commit'te güncellenmelidir.**

| Service                | Status     | Purpose                                                                                      | Consent Category                                       | Cookies / Storage                                                                                                                                                                                                                        | Data Categories                                                            | Provider                                 | Potential International Transfer | Legal Review                                             | Policy Updated |
| ---------------------- | ---------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------- | -------------------------------- | -------------------------------------------------------- | -------------- |
| Klaro (self-hosted)    | **Active** | Çerez tercihi yönetimi                                                                       | Zorunlu                                                | `pixelon-consent` (çerez, 365 gün)                                                                                                                                                                                                       | tercih durumu                                                              | Pixelon (kendi alan adı)                 | Yok                              | —                                                        | —              |
| Google Tag Manager     | **Active** | Etiket yönetimi (ölçüm etiketi yok)                                                          | Zorunlu (altyapı; etiketler kendi kategorilerine tabi) | kendisi çerez yazmaz                                                                                                                                                                                                                     | IP (script isteği)                                                         | Google                                   | Evet                             | Aktarım mekanizması doğrulanmadı                         | —              |
| Google Consent Mode v2 | **Active** | İzin sinyali yönetimi (4 sinyal, varsayılan denied)                                          | —                                                      | dataLayer (bellek içi)                                                                                                                                                                                                                   | izin durumu                                                                | Google (sinyal standardı)                | —                                | —                                                        | —              |
| Web3Forms              | **Active** | Form iletimi (e-posta)                                                                       | — (çerez tabanlı değil; form gönderiminde işler)       | yok                                                                                                                                                                                                                                      | form alanları                                                              | Web3Forms                                | Evet (muhtemel)                  | Veri işleyen ilişkisi doğrulanmalı                       | —              |
| Google Fonts (CDN)     | **Active** | Tipografi                                                                                    | Zorunlu (teknik)                                       | yok                                                                                                                                                                                                                                      | IP                                                                         | Google                                   | Evet                             | Self-host alternatifi değerlendirilebilir                | —              |
| Google Analytics 4     | **Active** | Website analytics and performance measurement                                                | Analytics (Klaro `google-analytics`)                   | `_ga`, `_ga_15DCDNXNG7` (gözlemlendi 2026-08-19: ~400 gün, domain pixelon.com.tr; yalnız Analitik izniyle oluşur, izin geri çekilince silinir)                                                                                           | kullanım/etkileşim                                                         | Google (`G-15DCDNXNG7`)                  | Evet                             | Aktarım mekanizması doğrulanmadı (mevcut flag yaklaşımı) | 2026-08-19     |
| Microsoft Clarity      | **Active** | user behavior analytics, session recordings, heatmaps, UX improvement, interaction analysis  | Analytics (Klaro `microsoft-clarity`)                  | Gözlemlendi (2026-08-19): `_clck` ~365 gün, `_clsk` ~1 gün (1. taraf; yalnız Analitik izniyle oluşur, revoke'ta Klaro silmesiyle temizlenir). 3. taraf Microsoft çerezleri (CLID/MUID/…) tarayıcıda GÖZLEMLENMEDİ                        | davranış/etkileşim (input içerikleri maskeli — ağ payload'ında doğrulandı) | Microsoft (Project ID: `y4y9pvz009`)     | Evet                             | Aktarım mekanizması doğrulanmadı (mevcut flag yaklaşımı) | 2026-08-19     |
| Google Ads             | Not Active | —                                                                                            | Pazarlama                                              | `_gcl_au` gözlemlendi (~90 gün; yalnız Marketing consent sonrası, Google tag yerleştiriyor — servis Not Active, bkz. not)                                                                                                                | —                                                                          | Google                                   | Evet                             | Eklenmeden önce                                          | —              |
| Meta Pixel             | **Active** | advertising measurement, conversion measurement, marketing attribution, audience measurement | Marketing (Klaro `meta-pixel`)                         | Gözlemlendi (2026-08-20): `_fbp` ~90 gün (1. taraf; YALNIZ Marketing izniyle oluşur, revoke'ta silinir); `_fbc` ~90 gün YALNIZ `fbclid`'li ziyarette (koşullu — canlıda doğrulandı), revoke'ta silinir. İzin yokken loader hiç yüklenmez | reklam/dönüşüm (form PII gönderilmez — ağ payload'ında doğrulandı)         | Meta (Pixel/Dataset: `1096159972333769`) | Evet                             | Aktarım mekanizması doğrulanmadı (mevcut flag yaklaşımı) | 2026-08-20     |
| LinkedIn Insight       | Not Active | —                                                                                            | Pazarlama                                              | —                                                                                                                                                                                                                                        | LinkedIn                                                                   | —                                        | Evet                             | Eklenmeden önce                                          | —              |
| Yandex Metrica         | Not Active | —                                                                                            | Analitik                                               | —                                                                                                                                                                                                                                        | Yandex                                                                     | —                                        | Evet                             | Eklenmeden önce                                          | —              |
| TikTok Pixel           | Not Active | —                                                                                            | Pazarlama                                              | —                                                                                                                                                                                                                                        | TikTok                                                                     | —                                        | Evet                             | Eklenmeden önce                                          | —              |

DUPLICATE BULGUSU — **RESOLVED (2026-08-19)**: Eski birleşik Google tag yapılandırması,
`G-15DCDNXNG7` hedefine ek olarak `G-61M0DZLYES` (ikinci GA4 property) ve `AW-17843555663`
(Google Ads) hedeflerini tetikliyordu. Sahip, Pixelon GA4 hedefini bağımsız Google tag'e
ayırdı ve GTM'deki etiketin Tag ID'si doğrudan **GT-M3K8V5NL** olarak publish edildi.
Canlı doğrulama (2026-08-19 16:0x, gerçek tarayıcı/ağ seviyesi): yalnız
`gtag/js?id=GT-M3K8V5NL` yükleniyor; collect istekleri YALNIZ `G-15DCDNXNG7`'ye gidiyor;
`G-61M0DZLYES` ve `AW-17843555663` istekleri tamamen kesildi; izinle yalnız `_ga` +
`_ga_15DCDNXNG7` oluşuyor (`_ga_61M0DZLYES` artık oluşmuyor); sayfa başına tek page_view.

`_gcl_au` GÖZLEMİ (2026-08-19, production): Pazarlama izni verildiğinde Google tag,
`_gcl_au` birinci taraf çerezini (~90 gün) yerleştiriyor — reklam/dönüşüm ilişkilendirmesi
mekanizması. **Google Ads dönüşüm takibi AKTİF DEĞİLDİR**; çerez yalnız Marketing consent
sonrası oluşur (consent-uyumlu). TEKNİK NOT: Pazarlama izni geri çekildiğinde `_gcl_au`
fiziksel olarak tarayıcıda kalıyor (yeni işleme durur); silme mantığı bilinçli olarak bu
görevde eklenmedi — ileriki Google Ads fazında Klaro service `cookies` listesiyle ele alınabilir.

META PIXEL AKTİVASYONU (2026-08-20): GTM publish + Lead trigger düzeltmesi sonrası production
final doğrulaması: consent matrisi (fresh/reject/analytics-only/marketing-only/accept-all/
revoke), tek pixel/tek PageView, Lead yalnız doğrulanmış form başarısında (contact +
free_analysis; fail=0, çift submit=1), 4 micro event 1×, PII ağ payload'larında YOK, GA4/
Clarity etkilenmedi. **Automatic Advanced Matching KAPALI; manuel matching yok; form PII
Meta'ya gönderilmez.** AÇIK KALEM (OWNER ACTION): pixel config'i `InferredEvents` optIn=true
taşımaya devam ediyor → her CTA tıklamasında taksonomi dışı `SubscribedButtonClick` otomatik
olayı üretiliyor (Marketing izniyle sınırlı, PII içermiyor; buton etiketleri generic). Events
Manager → veri kaynağı → "olayları kodsuz otomatik izle / buton izleme" kapatılıp yayılımı
doğrulanmalı.

META PIXEL HAZIRLIĞI (2026-08-19): STRICT consent mimarisi — Marketing izni gelmeden
fbevents.js/connect.facebook.net HİÇ yüklenmez (cookieless mod da yok). Köprü: Klaro
`meta-pixel` callback'i → dataLayer `meta_consent_update` + `meta_marketing_consent`
(granted|denied, kapalı enum). GTM: base tag (resmî snippet, init+PageView, sayfada 1 kez)
yalnız granted koşuluyla; Lead = yalnız doğrulanmış `generate_lead`; micro event'ler
trackCustom (WhatsAppClick/PhoneClick/EmailClick/FreeAnalysisClick); revoke'ta
fbq('consent','revoke') + Klaro _fbp/_fbc temizliği; geçmiş olaylar replay edilmez.
Advanced Matching (auto+manual) KAPALI; value/currency yok; CAPI ayrı faz.

CLARITY AKTİVASYONU (2026-08-19): GTM publish sonrası full production doğrulaması TEMİZ —
consent matrisi (fresh/reject/analytics-only/marketing-only/accept-all/revoke/dönen ziyaretçi),
tek yükleme, /admin/ dışı, UET yok, GA4 etkilenmedi, PII ağ payload'ında yok (gzip açılarak
doğrulandı; maskeleme işaretleri mevcut), no-consent modda çerezsiz sınırlı veri. Durum: Active.

CLARITY HAZIRLIĞI (2026-08-19): Proje oluşturuldu (`y4y9pvz009`); GTM'de resmî tag
"Microsoft Clarity - Pixelon" hazır (Custom/Session ID boş, trigger All Pages) — Preview
consent testleri tamamlanana dek PUBLISH EDİLMEDİ. Kurulum GTM'deki resmî "Microsoft Clarity - Official"
template'iyle yapılacak (site koduna doğrudan clarity.ms script'i EKLENMEZ — dist testleri
bunu yasaklar). Consent stratejisi: GTM Preview canlı testi (2026-08-19) GCM otomatik yorumunun
güvenilmez olduğunu kanıtladı (Analytics granted + Marketing denied → ters metadata) —
**explicit `consentv2` köprüsü aktif**: Klaro `microsoft-clarity` callback'i tek kaynak,
resmî kuyruk sözleşmesiyle race-güvenli (bkz. CLARITY_IMPLEMENTATION.md). ad_Storage bu fazda HER durumda denied tutulur (Microsoft
Ads/UET ayrı faz). Revoke'ta _clck/_clsk, Klaro servis `cookies` mekanizmasıyla silinir
(google-analytics ile aynı desen).

EVENT KATMANI (2026-08-19): İş olayları site kodunda yalnız `dataLayer.push` ile üretilir
(`src/lib/analytics-events.ts` + `src/components/AnalyticsEvents.astro`); GA4 teslimatı GTM'deki
Google tag'e aittir. Payload şeması kapalı enum'dur (`lead_type`, `interaction_location`,
`page_language`) — **form içeriği, ad, e-posta, telefon, şirket, mesaj veya başka hiçbir PII
GA4'e gönderilmez**; `generate_lead` yalnız doğrulanmış Web3Forms başarısında tetiklenir.

GA4 uygulama notu (2026-08-19): GA4 site koduna EKLENMEZ — ölçüm yalnızca `GTM-MWVJ2S27`
container'ındaki "GA4 - Google Tag - Pixelon" Google tag'i (Tag ID `GT-M3K8V5NL`, hedef `G-15DCDNXNG7`, trigger:
All Pages) üzerinden yapılır ve Consent Mode v2 `analytics_storage` sinyaline tabidir
(Advanced Consent Mode: varsayılan denied, Klaro Analitik izniyle granted). Kimliğin tek
doğruluk kaynağı: `src/lib/analytics.ts` → `GA4_MEASUREMENT_ID`. Enhanced Measurement web
stream (13219601136) tarafında açıktır; page_view/scroll/outbound click/file download/video/
site search için GTM'de ayrıca etiket OLUŞTURULMAZ (duplicate önlemi).

Süreç kuralı: "Not Active" bir servis koda eklenirken sırasıyla (1) bu tablo, (2) Klaro service girdisi
(`src/lib/consent-config.ts`), (3) Çerez Politikası çerez tablosu, (4) dist-smoke consent testleri güncellenir.
