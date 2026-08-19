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
     * TEST MODU (Aşama 1): banner otomatik gösterilmez; yalnızca URL'ye
     * `#klaro-testing` eklenince açılır. Üretim onayından sonra bu bayrak
     * kaldırılarak banner tüm ziyaretçilere açılacak.
     */
    testing: true,
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
        // privacyPolicyUrl bilinçli YOK: yasal sayfalar hazır olana dek link verilmez (OWNER ACTION)
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
