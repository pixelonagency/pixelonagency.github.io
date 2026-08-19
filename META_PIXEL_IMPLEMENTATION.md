# Meta Pixel — Pixelon Uygulama Mimarisi (Marketing-only, strict)

Amaç: Klaro Marketing izni → Meta Pixel → PageView + Lead + kontrollü micro event'ler.
İzin gelmeden **hiçbir** Meta isteği/çerezi oluşmaz (Clarity'deki gibi cookieless mod da yok).
Bu fazda CAPI / server-side GTM / access token / event deduplication / Advanced Matching YOK.

## Architecture

| Parça            | Karar                                                                                                                                                                                                                         |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pixel/Dataset    | `Pixelon` → **`1096159972333769`** (mevcut; yeni pixel yok). ID sır değildir ama bundle'a dağıtılmaz — yalnız GTM + envanter/doküman (testli)                                                                                 |
| Loader           | YALNIZ GTM **Custom HTML** (resmî Meta base snippet, developers.facebook.com'dan) — Community Template YOK, site koduna doğrudan loader YOK (dist testleri `fbevents.js`/`facebook.com/tr`/`connect.facebook.net`'i yasaklar) |
| Consent kaynağı  | Klaro `meta-pixel` servisi (Marketing) → dataLayer `meta_consent_update` + `meta_marketing_consent: granted                                                                                                                   | denied` (kapalı enum, testli) |
| Revoke temizliği | Klaro `cookies: [/^_fbp/, /^_fbc/]` (kanıtlanmış mekanizma) + GTM revoke tag'i `fbq('consent','revoke')`                                                                                                                      |
| /admin/          | GTM admin'de hiç yüklenmediği için otomatik kapsam dışı                                                                                                                                                                       |

## Consent Matrix (beklenen)

| Senaryo                             | Meta durumu                                                                                                                                                                  |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fresh / Reject All / Analytics Only | Loader YOK, istek YOK, `_fbp/_fbc` YOK                                                                                                                                       |
| Marketing Only / Accept All         | Tek loader, tek init, **tek PageView**; `_fbp` oluşabilir                                                                                                                    |
| Revoke (aynı sayfa)                 | `fbq('consent','revoke')` → yeni gönderim durur; Klaro `_fbp/_fbc` siler; loader zaten yoksa hiçbir şey yüklenmez                                                            |
| Re-grant (aynı sayfa)               | Base tag sayfada 1 kez (duplicate init/PageView yok); grant tag'i `fbq('consent','grant')` ile devam ettirir                                                                 |
| Dönen ziyaretçi (granted)           | Klaro callback'i yüklemede state'i push eder → GTM base tag normal tetiklenir, sayfa başına 1 PageView                                                                       |
| İzin öncesi form başarısı           | dataLayer `generate_lead` oluşur, GA4 kendi kuralıyla çalışır; Meta'ya Lead GİTMEZ ve sonradan izinde geçmiş olaylar **replay edilmez** (GTM tetikleyicileri geçmişe bakmaz) |

## Event Mapping

| dataLayer (mevcut, değişmez) | Meta                              | Parametreler                                                                                                  |
| ---------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| sayfa yükleme (izinli)       | `PageView` (standard, base tag)   | —                                                                                                             |
| `generate_lead`              | `Lead` (standard)                 | `lead_type`, `interaction_location`, `page_language` — **value/currency YOK** (doğrulanmış parasal değer yok) |
| `click_whatsapp`             | `WhatsAppClick` (trackCustom)     | `interaction_location`, `page_language`                                                                       |
| `click_phone`                | `PhoneClick` (trackCustom)        | aynı — telefon numarası asla gönderilmez                                                                      |
| `click_email`                | `EmailClick` (trackCustom)        | aynı — e-posta adresi asla gönderilmez                                                                        |
| `click_free_analysis`        | `FreeAnalysisClick` (trackCustom) | aynı                                                                                                          |

Kurallar: Lead YALNIZ doğrulanmış Web3Forms başarısından (mevcut `generate_lead` kaynağı —
`response.ok && payload.success===true`); klikler Lead DEĞİLDİR; bu fazda `Contact` standard
eventine map yok; DOM listener'lar yeniden yazılmaz — mevcut dataLayer olayları tek kaynak.
Custom isimler resmî `trackCustom` kurallarına uygun (string, kısa, harf/rakam).

## PII

- Payload'lara yalnız mevcut kapalı enum parametreleri girer (`lead_type` /
  `interaction_location` / `page_language`) — kullanıcı girdisi tasarımla imkânsız.
- **Automatic Advanced Matching: OFF tutulacak** (owner action); manuel matching
  (`em`/`ph`/`fn`/`ln`) bu fazda tamamen yasak.
- **Automatic Events: tercihen OFF** (owner audit + action); Event Setup Tool kullanılmaz.
- Access token / app secret hiçbir yerde yok.

## Cookies

Beklenen: `_fbp` (1. taraf) yalnız Marketing granted'da; `_fbc` her ziyarette oluşmaz
(tipik olarak `fbclid` reklam tıklamasında) — "her kullanıcıda oluşur" DENMEZ. İzin öncesi
hiçbir Meta çerezi olmamalı; revoke'ta 1. taraf Meta çerezleri silinmeli. Politika/envanter
yalnız **canlıda gözlemlenen** değerlerle güncellenir (aktivasyon sonrası adım).

## GTM Plan (owner kuracak — bkz. rapor)

Variables: `DLV - meta_marketing_consent` (Version 2; mevcut lead_type/interaction_location/
page_language DLV'leri yeniden oluşturulmaz).
Triggers: `CE - Meta Consent Update` (+granted koşullu türevleri), mevcut business-event
tetikleyicisi koşullandırılır.
Tags: `Meta Pixel - Base - Pixelon` (Custom HTML: resmî snippet + init + PageView; **Once per
page**; trigger: consent granted), `Meta - Consent Grant` (yalnız `window.fbq` varsa grant),
`Meta - Consent Revoke` (yalnız `window.fbq` varsa revoke — loader yaratmaz), `Meta - Lead`
ve `Meta - Micro Events` (Custom HTML `fbq('track'/'trackCustom', ...)`; tetikleyici: ilgili
dataLayer olayı + `meta_marketing_consent=granted`; **Tag Sequencing: Setup Tag = Base**,
"once per event"). setTimeout/polling YOK — sıralama GTM sequencing + dataLayer yaşam
döngüsüyle deterministik.

## Verification (aktivasyon sonrası)

GTM Preview + Meta Events Manager **Test Events** birlikte: consent matrisi, PageView 1×,
Lead testleri (contact/free_analysis/başarısız form 0/çift submit 1), micro event'ler 1×,
Pixel ID guard (tüm isteklerde yalnız `1096159972333769`), `_fbp` gözlemi, revoke temizliği,
GA4/Clarity regresyonu, CWV/LCP (render-blocking yasak). Preview temiz olmadan Publish yok;
Publish sonrası production doğrulaması → temizse envanter Active + TR/EN politika güncellemesi
(yalnız gözlemlenen çerezler; IndexNow yalnız değişen policy URL'leri).
