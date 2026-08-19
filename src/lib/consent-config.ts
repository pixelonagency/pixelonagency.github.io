import type { Locale } from './i18n';

/**
 * Klaro consent yönetiminin TEK kaynağı — Google Consent Mode v2 eşlemesiyle.
 *
 * Mimari (resmî Klaro GTM eğitimi + Google Consent Mode v2 belgeleri):
 *   - Consent Mode varsayılanları (hepsi denied) BaseLayout'ta GTM'den ÖNCE
 *     inline kurulur (bkz. CONSENT_DEFAULTS_SNIPPET).
 *   - GTM her zaman yüklenir (Advanced Consent Mode); etiketlerin depolama
 *     davranışını buradaki gtag('consent','update') çağrıları yönetir.
 *   - Her hizmet kabulünde `klaro-<service>-accepted` dataLayer olayı da
 *     gönderilir; ileride GTM tetikleyicileri buna bağlanabilir.
 *
 * Gelecekte GA4/Clarity/Meta/LinkedIn eklemek = bu dosyaya yeni service
 * girdisi eklemek. Bileşenlere config dağıtılmaz.
 */

/* GTM'den önce çalışması gereken inline varsayılanlar (Consent Mode v2). */
export const CONSENT_DEFAULTS_SNIPPET = [
  'window.dataLayer=window.dataLayer||[];',
  'function gtag(){dataLayer.push(arguments);}',
  "gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});",
  "gtag('set','ads_data_redaction',true);",
].join('');

type ConsentState = 'granted' | 'denied';

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

function gtag(..._args: unknown[]): void {
  window.dataLayer = window.dataLayer || [];
  // Consent Mode, gtag imzasıyla (`arguments` objesi) push bekler — dizi değil.
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

function pushEvent(name: string): void {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name });
}

function updateAnalytics(state: ConsentState): void {
  gtag('consent', 'update', { analytics_storage: state });
}

function updateMarketing(state: ConsentState): void {
  gtag('consent', 'update', { ad_storage: state, ad_user_data: state, ad_personalization: state });
  // Google önerisi: reklam depolaması reddedildiğinde reklam verisi kırpılır.
  gtag('set', 'ads_data_redaction', state !== 'granted');
}

/**
 * Microsoft Clarity Consent API v2 köprüsü — Klaro tercihleri source-of-truth.
 *
 * GTM Preview canlı testi (2026-08-19), Clarity'nin otomatik Google Consent Mode
 * yorumunun güvenilmez olduğunu kanıtladı (Analytics granted + Marketing denied
 * durumunda ters metadata) — bu yüzden sinyal resmî `consentv2` API'siyle açıkça
 * gönderilir. `ad_Storage` bu fazda HER ZAMAN denied: Microsoft Ads/UET aktif
 * değildir; kullanıcı Klaro'da Pazarlama'yı kabul etse bile Clarity üzerinden
 * reklam paylaşımı açılmaz.
 *
 * Race güvenliği: aşağıdaki stub, resmî Clarity yükleyicisinin kendi kuyruk
 * sözleşmesidir (`c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)}`).
 * Sinyal tag'den ÖNCE oluşursa kuyruklanır ve script yüklenince uygulanır;
 * SONRA oluşursa gerçek fonksiyon çalışır. Polling/setTimeout gerekmez.
 */
type ClarityQueueFn = { (...args: unknown[]): void; q?: unknown[] };

function updateClarity(state: ConsentState): void {
  try {
    const w = window as Window & { clarity?: ClarityQueueFn };
    if (!w.clarity) {
      const stub: ClarityQueueFn = function () {
        // Resmî yükleyici kuyruğu `arguments` objeleriyle boşaltır — dizi değil.
        // eslint-disable-next-line prefer-rest-params
        (stub.q = stub.q || []).push(arguments);
      };
      w.clarity = stub;
    }
    w.clarity('consentv2', {
      ad_Storage: 'denied', // Microsoft Ads ayrı faz — koşulsuz denied
      analytics_Storage: state,
    });
  } catch {
    /* consent köprüsü hiçbir kullanıcı akışını bozamaz */
  }
}

/**
 * Meta Pixel consent köprüsü — Klaro Marketing tercihi tek kaynak.
 *
 * STRICT mimari: Marketing izni gelmeden Meta loader'ı HİÇ yüklenmez (Clarity'deki
 * gibi cookieless mod da yok). Bu helper yalnızca kontrollü bir dataLayer durumu
 * üretir; Meta yükleyicisi/istemcisi site kodunda YOKTUR — base Pixel, Lead ve micro-event
 * tag'leri GTM'de `meta_consent_update` + `meta_marketing_consent=granted`
 * koşuluna bağlanır (bkz. META_PIXEL_IMPLEMENTATION.md). Değerler kapalı enum:
 * yalnız 'granted' | 'denied'. Kayıtlı tercihle dönen ziyaretçide Klaro callback'i
 * sayfa yüklenirken çalıştığı için sinyal GTM'den önce dataLayer'a girer — race yok.
 */
function updateMeta(state: ConsentState): void {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'meta_consent_update', meta_marketing_consent: state });
}

/** Klaro service callback imzası. */
type ServiceCallback = (consent: boolean, service: { name: string }) => void;

export interface KlaroConfigShape {
  [key: string]: unknown;
}

export function buildKlaroConfig(lang: Locale): KlaroConfigShape {
  return {
    version: 1,
    elementID: 'klaro',
    /*
     * Canlı mod: banner ilk ziyarette tüm ziyaretçilere gösterilir (sahip onayı
     * 2026-08-19). Test aşamasına dönmek gerekirse `testing: true` yapılır —
     * o modda banner yalnızca URL'ye `#klaro-testing` eklenince açılır.
     */
    testing: false,
    storageMethod: 'cookie',
    cookieName: 'pixelon-consent',
    cookieExpiresAfterDays: 365,
    default: false, // analitik/pazarlama varsayılan KAPALI — karanlık desen yok
    mustConsent: false,
    acceptAll: true,
    hideDeclineAll: false, // "Tümünü Reddet" her zaman görünür
    hideLearnMore: false,
    noticeAsModal: false,
    htmlTexts: false,
    lang,
    translations: {
      tr: {
        privacyPolicyUrl: '/cerez-politikasi',
        /* privacyPolicyUrl tanımlanınca Klaro bu metni ekler; anahtar verilmezse
         * ekranda "[missing translation]" görünür. */
        privacyPolicy: {
          name: 'Çerez Politikası',
          text: 'Ayrıntılar için {privacyPolicy} sayfamızı inceleyebilirsiniz.',
        },
        purposeItem: { service: 'hizmet', services: 'hizmet' },
        consentNotice: {
          title: 'Gizliliğiniz bizim için önemli.',
          description:
            'Site deneyimini geliştirmek, performansı ölçmek ve tercihlerinize göre hizmetler sunmak için çerezler kullanıyoruz. Zorunlu çerezler her zaman aktiftir; analitik ve pazarlama çerezlerini dilediğiniz gibi yönetebilirsiniz.',
          learnMore: 'Tercihleri Yönet',
        },
        consentModal: {
          title: 'Gizliliğiniz bizim için önemli.',
          description:
            'Aşağıdan analitik ve pazarlama çerezlerini ayrı ayrı yönetebilirsiniz. Zorunlu çerezler sitenin çalışması için her zaman aktiftir.',
        },
        acceptAll: 'Tümünü Kabul Et',
        acceptSelected: 'Seçimlerimi Kaydet',
        decline: 'Tümünü Reddet',
        ok: 'Tümünü Kabul Et',
        save: 'Seçimlerimi Kaydet',
        close: 'Kapat',
        purposes: {
          essential: {
            title: 'Zorunlu',
            description: 'Web sitesinin güvenli ve doğru şekilde çalışması için gereklidir.',
          },
          analytics: {
            title: 'Analitik',
            description:
              'Ziyaretçilerin siteyi nasıl kullandığını anlamamıza ve deneyimi geliştirmemize yardımcı olur.',
          },
          marketing: {
            title: 'Pazarlama',
            description: 'Reklam performansını ölçmek ve daha ilgili iletişimler sunmak için kullanılabilir.',
          },
        },
      },
      en: {
        privacyPolicyUrl: '/en/cookie-policy',
        privacyPolicy: {
          name: 'Cookie Policy',
          text: 'To learn more, please read our {privacyPolicy}.',
        },
        purposeItem: { service: 'service', services: 'services' },
        consentNotice: {
          title: 'Your privacy matters to us.',
          description:
            'We use cookies to improve the website experience, measure performance and provide more relevant services. Essential cookies are always active; you can choose whether to allow analytics and marketing cookies.',
          learnMore: 'Manage Preferences',
        },
        consentModal: {
          title: 'Your privacy matters to us.',
          description:
            'You can manage analytics and marketing cookies separately below. Essential cookies are always active so the website can function.',
        },
        acceptAll: 'Accept All',
        acceptSelected: 'Save Preferences',
        decline: 'Reject All',
        ok: 'Accept All',
        save: 'Save Preferences',
        close: 'Close',
        purposes: {
          essential: {
            title: 'Essential',
            description: 'Required for the website to operate securely and correctly.',
          },
          analytics: {
            title: 'Analytics',
            description: 'Helps us understand how visitors use the website and improve the experience.',
          },
          marketing: {
            title: 'Marketing',
            description: 'May be used to measure advertising performance and provide more relevant communications.',
          },
        },
      },
    },
    services: [
      {
        name: 'google-tag-manager',
        purposes: ['essential'],
        required: true,
        translations: {
          tr: {
            title: 'Google Tag Manager',
            description:
              'Etiket yönetim altyapısı. Kendi başına ölçüm yapmaz; analitik ve pazarlama etiketleri yalnızca ilgili izinler verildiğinde çalışır.',
          },
          en: {
            title: 'Google Tag Manager',
            description:
              'Tag management infrastructure. It does not measure anything by itself; analytics and marketing tags only run when the related consents are granted.',
          },
        },
      },
      {
        name: 'google-analytics',
        purposes: ['analytics'],
        default: false,
        cookies: [/^_ga(_.*)?/, '_gid'],
        translations: {
          tr: { title: 'Analitik Ölçüm (Google Analytics)', description: 'Site kullanım istatistikleri.' },
          en: { title: 'Analytics Measurement (Google Analytics)', description: 'Website usage statistics.' },
        },
        callback: ((consent) => {
          updateAnalytics(consent ? 'granted' : 'denied');
          if (consent) pushEvent('klaro-google-analytics-accepted');
        }) satisfies ServiceCallback,
      },
      {
        /*
         * Microsoft Clarity (oturum kaydı + ısı haritası) — Analitik kategorisi.
         * Yükleme GTM'deki resmî Clarity template'i üzerinden yapılır; consent
         * sinyali AÇIKÇA consentv2 köprüsüyle taşınır (updateClarity — GCM
         * otomatik yorumu canlı testte güvenilmez çıktı, bkz.
         * CLARITY_IMPLEMENTATION.md). `cookies` deseni, izin geri çekildiğinde Klaro'nun
         * _clck/_clsk çerezlerini google-analytics ile aynı mekanizmayla
         * temizlemesini sağlar.
         */
        name: 'microsoft-clarity',
        purposes: ['analytics'],
        default: false,
        cookies: [/^_clck/, /^_clsk/],
        callback: ((consent) => {
          // Klaro her uygulanışta (ilk yükleme, karar, revoke, kayıtlı tercih)
          // çağırır — dönen ziyaretçide de doğru state Clarity'ye iletilir.
          updateClarity(consent ? 'granted' : 'denied');
          if (consent) pushEvent('klaro-microsoft-clarity-accepted');
        }) satisfies ServiceCallback,
        translations: {
          tr: {
            title: 'Davranış Analitiği (Microsoft Clarity)',
            description:
              'Oturum kayıtları ve ısı haritalarıyla site deneyimini geliştirme (form içerikleri maskelenir).',
          },
          en: {
            title: 'Behaviour Analytics (Microsoft Clarity)',
            description: 'Session recordings and heatmaps to improve the site experience (form contents are masked).',
          },
        },
      },
      {
        /*
         * Meta Pixel — Pazarlama kategorisi (Pixel ID yalnız GTM + envanterde). Loader YALNIZ
         * GTM'de ve YALNIZ Marketing izni sonrası; izin yokken hiçbir Meta
         * isteği/çerezi oluşmaz. `cookies` deseni revoke'ta _fbp/_fbc'yi
         * Klaro'nun kanıtlanmış mekanizmasıyla temizler; GTM tarafı ayrıca
         * resmî Meta consent-revoke API'sini çağırır.
         */
        name: 'meta-pixel',
        purposes: ['marketing'],
        default: false,
        cookies: [/^_fbp/, /^_fbc/],
        translations: {
          tr: {
            title: 'Reklam ve Dönüşüm Ölçümü (Meta Pixel)',
            description: 'Reklam performansı ve dönüşüm ölçümü (form içerikleri gönderilmez).',
          },
          en: {
            title: 'Advertising & Conversion Measurement (Meta Pixel)',
            description: 'Ad performance and conversion measurement (form contents are never sent).',
          },
        },
        callback: ((consent) => {
          updateMeta(consent ? 'granted' : 'denied');
          if (consent) pushEvent('klaro-meta-pixel-accepted');
        }) satisfies ServiceCallback,
      },
      {
        name: 'google-ads',
        purposes: ['marketing'],
        default: false,
        translations: {
          tr: {
            title: 'Pazarlama (Google Ads ve reklam etiketleri)',
            description: 'Reklam ölçümü ve kişiselleştirme.',
          },
          en: {
            title: 'Marketing (Google Ads and advertising tags)',
            description: 'Ad measurement and personalisation.',
          },
        },
        callback: ((consent) => {
          updateMarketing(consent ? 'granted' : 'denied');
          if (consent) pushEvent('klaro-google-ads-accepted');
        }) satisfies ServiceCallback,
      },
    ],
  };
}
