# Privacy / Tracking Inventory — Pixelon (dahili bakım kaydı)

Amaç: ileride bir izleme servisi eklendiğinde/kaldırıldığında Çerez Politikası + Klaro config + Consent Mode
eşlemesinin birlikte güncellenmesini garanti etmek. **Her servis değişikliğinde bu tablo ve Çerez Politikası
AYNI commit'te güncellenmelidir.**

| Service                | Status                   | Purpose                                                                                                                                   | Consent Category                                       | Cookies / Storage                                                                                                                              | Data Categories    | Provider                             | Potential International Transfer | Legal Review                                             | Policy Updated |
| ---------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------ | -------------------------------- | -------------------------------------------------------- | -------------- |
| Klaro (self-hosted)    | **Active**               | Çerez tercihi yönetimi                                                                                                                    | Zorunlu                                                | `pixelon-consent` (çerez, 365 gün)                                                                                                             | tercih durumu      | Pixelon (kendi alan adı)             | Yok                              | —                                                        | —              |
| Google Tag Manager     | **Active**               | Etiket yönetimi (ölçüm etiketi yok)                                                                                                       | Zorunlu (altyapı; etiketler kendi kategorilerine tabi) | kendisi çerez yazmaz                                                                                                                           | IP (script isteği) | Google                               | Evet                             | Aktarım mekanizması doğrulanmadı                         | —              |
| Google Consent Mode v2 | **Active**               | İzin sinyali yönetimi (4 sinyal, varsayılan denied)                                                                                       | —                                                      | dataLayer (bellek içi)                                                                                                                         | izin durumu        | Google (sinyal standardı)            | —                                | —                                                        | —              |
| Web3Forms              | **Active**               | Form iletimi (e-posta)                                                                                                                    | — (çerez tabanlı değil; form gönderiminde işler)       | yok                                                                                                                                            | form alanları      | Web3Forms                            | Evet (muhtemel)                  | Veri işleyen ilişkisi doğrulanmalı                       | —              |
| Google Fonts (CDN)     | **Active**               | Tipografi                                                                                                                                 | Zorunlu (teknik)                                       | yok                                                                                                                                            | IP                 | Google                               | Evet                             | Self-host alternatifi değerlendirilebilir                | —              |
| Google Analytics 4     | **Active**               | Website analytics and performance measurement                                                                                             | Analytics (Klaro `google-analytics`)                   | `_ga`, `_ga_15DCDNXNG7` (gözlemlendi 2026-08-19: ~400 gün, domain pixelon.com.tr; yalnız Analitik izniyle oluşur, izin geri çekilince silinir) | kullanım/etkileşim | Google (`G-15DCDNXNG7`)              | Evet                             | Aktarım mekanizması doğrulanmadı (mevcut flag yaklaşımı) | 2026-08-19     |
| Microsoft Clarity      | **Planned / Not Active** | user behavior analytics, session recordings, heatmaps, UX improvement (hazırlık tamam; production doğrulaması yapılmadan Active yazılmaz) | Analytics (Klaro `microsoft-clarity`)                  | Belgelenen: `_clck`, `_clsk` (1. taraf) + CLID/MUID/ANONCHK/MR/SM (3. taraf) — canlıda gözlemlenince işlenir                                   | davranış/etkileşim | Microsoft (Project ID: `y4y9pvz009`) | Evet                             | Aktivasyondan önce                                       | —              |
| Google Ads             | Not Active               | —                                                                                                                                         | Pazarlama                                              | `_gcl_au` gözlemlendi (~90 gün; yalnız Marketing consent sonrası, Google tag yerleştiriyor — servis Not Active, bkz. not)                      | —                  | Google                               | Evet                             | Eklenmeden önce                                          | —              |
| Meta Pixel             | Not Active               | —                                                                                                                                         | Pazarlama                                              | (eklenirse `_fbp`)                                                                                                                             | —                  | Meta                                 | Evet                             | Eklenmeden önce                                          | —              |
| LinkedIn Insight       | Not Active               | —                                                                                                                                         | Pazarlama                                              | —                                                                                                                                              | LinkedIn           | —                                    | Evet                             | Eklenmeden önce                                          | —              |
| Yandex Metrica         | Not Active               | —                                                                                                                                         | Analitik                                               | —                                                                                                                                              | Yandex             | —                                    | Evet                             | Eklenmeden önce                                          | —              |
| TikTok Pixel           | Not Active               | —                                                                                                                                         | Pazarlama                                              | —                                                                                                                                              | TikTok             | —                                    | Evet                             | Eklenmeden önce                                          | —              |

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

CLARITY HAZIRLIĞI (2026-08-19): Proje oluşturuldu (`y4y9pvz009`); GTM'de resmî tag
"Microsoft Clarity - Pixelon" hazır (Custom/Session ID boş, trigger All Pages) — Preview
consent testleri tamamlanana dek PUBLISH EDİLMEDİ. Kurulum GTM'deki resmî "Microsoft Clarity - Official"
template'iyle yapılacak (site koduna doğrudan clarity.ms script'i EKLENMEZ — dist testleri
bunu yasaklar). Consent stratejisi: Clarity Consent Mode ON + birincil sinyal mevcut Google
Consent Mode akışı (resmî consent-management dokümanı GCM'i destekli yol olarak listeler,
son güncelleme 2026-05-21); production testinde herhangi bir senaryo yanlışsa
`window.clarity('consentv2', {ad_Storage, analytics_Storage})` köprüsüne geçilir (bkz.
CLARITY_IMPLEMENTATION.md). ad_Storage bu fazda HER durumda denied tutulur (Microsoft
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
