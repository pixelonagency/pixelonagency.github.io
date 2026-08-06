import { DEFAULT_LOCALE, localizedPath, type Locale, type PageKey } from './i18n';

/**
 * Arayüz mikro-metinleri (nav etiketleri, buton yazıları, bölüm başlıkları).
 *
 * Sayfa İÇERİĞİ burada değil, `src/content/**` altındadır ve CMS'ten yönetilir.
 * Buradakiler tasarımla birlikte sabitlenen "kabuk" metinleridir; her anahtarın
 * her dilde karşılığı olmak zorundadır — `ui.test.ts` bunu zorunlu kılar.
 */
const STRINGS = {
  'nav.about': { tr: 'Biz Kimiz?', en: 'About Us' },
  'nav.services': { tr: 'Hizmetlerimiz', en: 'Services' },
  'nav.projects': { tr: 'Projelerimiz', en: 'Projects' },
  'nav.references': { tr: 'Referanslarımız', en: 'References' },
  'nav.careers': { tr: 'Kariyer', en: 'Careers' },
  'nav.contact': { tr: 'İletişim', en: 'Contact' },
  'nav.blog': { tr: 'Blog', en: 'Blog' },
  'nav.allServices': { tr: 'Tüm Hizmetlerimiz →', en: 'All Services →' },
  'nav.analysis': { tr: 'Ücretsiz Analiz', en: 'Free Analysis' },
  'nav.openMenu': { tr: 'Menüyü aç', en: 'Open menu' },
  'nav.closeMenu': { tr: 'Menüyü kapat', en: 'Close menu' },
  'nav.mainMenu': { tr: 'Ana menü', en: 'Main menu' },
  'nav.mobileMenu': { tr: 'Mobil menü', en: 'Mobile menu' },
  'nav.home': { tr: 'Ana Sayfa', en: 'Home' },
  'nav.skipToContent': { tr: 'İçeriğe geç', en: 'Skip to content' },
  'nav.breadcrumb': { tr: 'Site haritası', en: 'Breadcrumb' },
  'nav.logoHome': { tr: 'Pixelon ana sayfa', en: 'Pixelon home' },

  'footer.corporate': { tr: 'Kurumsal', en: 'Corporate' },
  'footer.services': { tr: 'Hizmetlerimiz', en: 'Services' },
  'footer.contact': { tr: 'İletişim', en: 'Contact' },

  'cta.quote': { tr: 'Hemen Teklif Al', en: 'Get a Quote' },
  'cta.quoteFormal': { tr: 'Hemen Teklif Alın', en: 'Request a Quote' },
  'cta.whatsapp': { tr: "WhatsApp'tan Yazın", en: 'Message us on WhatsApp' },
  'cta.whatsappAria': { tr: "WhatsApp'tan iletişime geçin", en: 'Contact us on WhatsApp' },
  'cta.allPosts': { tr: '← Tüm Yazılar', en: '← All Posts' },

  'blog.readingTime': { tr: 'dk okuma', en: 'min read' },

  'form.required': { tr: '(zorunlu)', en: '(required)' },
  'form.sending': { tr: 'Gönderiliyor…', en: 'Sending…' },
  'form.missingKey': {
    tr: 'Form gönderimi için PUBLIC_WEB3FORMS_ACCESS_KEY ortam değişkeni tanımlanmalı.',
    en: 'PUBLIC_WEB3FORMS_ACCESS_KEY must be set for form submission.',
  },

  'error.notFoundTitle': { tr: 'Aradığınız sayfayı bulamadık.', en: 'We couldn’t find that page.' },
  'error.notFoundBody': {
    tr: 'Sayfa taşınmış, adı değişmiş veya kaldırılmış olabilir. Aşağıdaki bağlantılardan devam edebilirsiniz.',
    en: 'The page may have moved, been renamed or removed. Continue from the links below.',
  },

  'lang.switchTo': { tr: 'Switch to English', en: 'Türkçeye geç' },
} as const satisfies Record<string, Record<Locale, string>>;

export type UiKey = keyof typeof STRINGS;
export const UI_KEYS = Object.keys(STRINGS) as UiKey[];

/** Sözlükten dize çeker; anahtar yoksa anahtarın kendisini döner (sessiz boşluk yerine görünür hata). */
export function t(key: UiKey, locale: Locale): string {
  const entry = STRINGS[key] as Record<Locale, string> | undefined;
  if (!entry) return key;
  return entry[locale] ?? entry[DEFAULT_LOCALE] ?? key;
}

export interface NavItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
}

/** Bir hizmet detay sayfasının yolu (slug zaten o dile ait olmalıdır). */
export function serviceHref(slug: string, locale: Locale): string {
  return localizedPath('services', locale, slug);
}

/** Header ve mobil menüdeki ana gezinme — referans tasarımdaki sırayla. */
export function buildPrimaryNav(locale: Locale): NavItem[] {
  const item = (key: UiKey, page: PageKey, extra?: Partial<NavItem>): NavItem => ({
    label: t(key, locale),
    href: localizedPath(page, locale),
    ...extra,
  });

  return [
    item('nav.about', 'about'),
    item('nav.services', 'services', { hasDropdown: true }),
    item('nav.projects', 'projects'),
    { label: t('nav.references', locale), href: `${localizedPath('projects', locale)}#referanslar` },
    item('nav.careers', 'careers'),
    item('nav.contact', 'contact'),
  ];
}
