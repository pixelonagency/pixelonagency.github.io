import type { FormMessages } from './forms';
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
  'nav.website': { tr: 'Web Sitesi Yaptır', en: 'Get a Website' },
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

  'brand.logoAlt': {
    tr: 'Pixelon 360 dijital pazarlama ajansı logosu',
    en: 'Pixelon 360 digital marketing agency logo',
  },
  'brand.logoAltShort': { tr: 'Pixelon logosu', en: 'Pixelon logo' },

  'footer.corporate': { tr: 'Kurumsal', en: 'Corporate' },
  'footer.services': { tr: 'Hizmetlerimiz', en: 'Services' },
  'footer.contact': { tr: 'İletişim', en: 'Contact' },

  'cta.quote': { tr: 'Hemen Teklif Al', en: 'Get a Quote' },
  'cta.quoteFormal': { tr: 'Hemen Teklif Alın', en: 'Request a Quote' },
  'cta.whatsapp': { tr: "WhatsApp'tan Yazın", en: 'Message us on WhatsApp' },
  'cta.whatsappAria': { tr: "WhatsApp'tan iletişime geçin", en: 'Contact us on WhatsApp' },
  'cta.allPosts': { tr: '← Tüm Yazılar', en: '← All Posts' },

  'blog.readingTime': { tr: 'dk okuma', en: 'min read' },
  'blog.readPost': { tr: 'Yazıyı Okuyun', en: 'Read the Article' },
  'blog.updated': { tr: 'Güncellenme:', en: 'Updated:' },
  'blog.toc': { tr: 'İçindekiler', en: 'Contents' },
  'blog.related': { tr: 'İlgili Yazılar', en: 'Related Articles' },
  'blog.applyHeading': {
    tr: 'Bu Stratejiyi Markanız İçin Uygulayalım.',
    en: "Let's Put This Strategy to Work for Your Brand.",
  },
  'blog.exploreServices': { tr: 'Hizmetlerimizi İnceleyin', en: 'Explore Our Services' },
  'services.viewDetails': { tr: 'Detayları Gör', en: 'View Details' },
  'footer.cookiePrefs': { tr: 'Çerez Tercihleri', en: 'Cookie Preferences' },
  'legal.eyebrow': { tr: 'Yasal', en: 'Legal' },
  'legal.updated': { tr: 'Son Güncelleme', en: 'Last Updated' },
  'legal.related': { tr: 'İlgili Yasal Metinler', en: 'Related Legal Documents' },
  'form.noticeLink': { tr: 'KVKK Aydınlatma Metni', en: 'Personal Data Processing Notice' },

  'logos.groupLabel': { tr: 'Çalıştığımız markalar', en: 'Brands we work with' },
  /** Marka adının ARDINA gelir: "Dentasay logosu" / "Dentasay logo". */
  'logos.altSuffix': { tr: 'logosu', en: 'logo' },

  'projects.all': { tr: 'Tümü', en: 'All' },
  'projects.categories': { tr: 'Proje kategorileri', en: 'Project categories' },
  'projects.view': { tr: 'Projeyi İncele', en: 'View Project' },
  'projects.empty': {
    tr: 'Bu kategoride henüz proje bulunmuyor.',
    en: 'There are no projects in this category yet.',
  },

  'jobs.apply': { tr: 'Başvur', en: 'Apply' },
  'jobs.contact': { tr: 'Bize Yazın', en: 'Get in Touch' },

  'form.required': { tr: '(zorunlu)', en: '(required)' },
  'form.sending': { tr: 'Gönderiliyor…', en: 'Sending…' },
  'form.missingKey': {
    tr: 'Form gönderimi için PUBLIC_WEB3FORMS_ACCESS_KEY ortam değişkeni tanımlanmalı.',
    en: 'PUBLIC_WEB3FORMS_ACCESS_KEY must be set for form submission.',
  },
  'form.selectPlaceholder': { tr: 'Seçiniz', en: 'Select' },
  /** Bal küpü alanının ekran okuyucu etiketi — gerçek kullanıcı asla doldurmamalı. */
  'form.honeypot': { tr: 'Bu alanı boş bırakın', en: 'Leave this field empty' },
  'form.fromName': { tr: 'Pixelon Web Sitesi', en: 'Pixelon Website' },

  'form.submit.analysis': { tr: 'Ücretsiz Analiz Talep Et', en: 'Request a Free Analysis' },
  'form.submit.contact': { tr: 'Mesajı Gönder', en: 'Send Message' },

  /** Web3Forms bu değeri bildirim e-postasının konu satırı yapar. */
  'form.subject.analysis': {
    tr: 'Pixelon — Yeni Ücretsiz Analiz Talebi',
    en: 'Pixelon — New Free Analysis Request',
  },
  'form.subject.contact': {
    tr: 'Pixelon — Yeni İletişim Formu Mesajı',
    en: 'Pixelon — New Contact Form Message',
  },

  'form.successHeading': { tr: 'Talebiniz Bize Ulaştı!', en: 'We Have Received Your Request!' },
  'form.successBody': {
    tr: 'Paylaştığınız bilgileri inceleyerek en kısa sürede sizinle iletişime geçeceğiz.',
    en: 'We will review the details you shared and get back to you as soon as possible.',
  },
  'form.errorHeading': { tr: 'Form Gönderilemedi', en: 'The Form Could Not Be Sent' },
  'form.errorBody': {
    tr: 'Teknik bir sorun oluştu. Lütfen tekrar deneyin veya doğrudan WhatsApp üzerinden bizimle iletişime geçin.',
    en: 'A technical problem occurred. Please try again or contact us directly on WhatsApp.',
  },

  'form.checksLegend': {
    tr: 'Analiz Edilmesini İstediğiniz Alanlar',
    en: 'Areas You Would Like Us to Analyse',
  },

  /*
   * Aydınlatma ONAY konusu değildir (2026/347 sayılı İlke Kararı'ndaki
   * aydınlatma/açık rıza ayrımı): kutu "kabul" değil "okudum" beyanıdır ve
   * metnin kendisine bağlantı verilir.
   */
  'form.consent.analysis': {
    tr: 'Kişisel verilerimin ücretsiz analiz talebimin değerlendirilmesi amacıyla işlenmesine ilişkin',
    en: 'Regarding the processing of my personal data to evaluate my free analysis request, I have read the',
  },
  'form.consent.contact': {
    tr: 'Kişisel verilerimin iletişim talebimin değerlendirilmesi amacıyla işlenmesine ilişkin',
    en: 'Regarding the processing of my personal data to evaluate my contact request, I have read the',
  },
  'form.consent.suffix': { tr: "'ni okudum.", en: '.' },
  'form.privacy.analysis': {
    tr: 'Bilgileriniz yalnızca analiz talebinizi değerlendirmek ve sizinle iletişim kurmak amacıyla kullanılacaktır.',
    en: 'Your information will only be used to evaluate your analysis request and to contact you.',
  },
  'form.privacy.contact': {
    tr: 'Bilgileriniz yalnızca talebinizi değerlendirmek ve sizinle iletişim kurmak amacıyla kullanılacaktır.',
    en: 'Your information will only be used to evaluate your request and to contact you.',
  },

  'form.field.name': { tr: 'Adınız ve Soyadınız', en: 'Your Full Name' },
  'form.field.email': { tr: 'E-posta Adresiniz', en: 'Your Email Address' },
  'form.field.phone': { tr: 'Telefon Numaranız', en: 'Your Phone Number' },
  'form.field.company': { tr: 'Şirket / Marka Adı', en: 'Company / Brand Name' },
  'form.field.website': { tr: 'Web Siteniz', en: 'Your Website' },
  'form.field.service': { tr: 'İlgilendiğiniz Hizmet', en: 'Service You Are Interested In' },
  'form.field.budget': { tr: 'Tahmini Proje Bütçesi', en: 'Estimated Project Budget' },
  'form.field.message': { tr: 'Mesajınız', en: 'Your Message' },

  'form.placeholder.name': { tr: 'Ad Soyad', en: 'Full name' },
  'form.placeholder.email': { tr: 'ornek@sirketiniz.com', en: 'name@yourcompany.com' },
  'form.placeholder.phone': { tr: '+90 5xx xxx xx xx', en: '+90 5xx xxx xx xx' },
  'form.placeholder.company': { tr: 'Şirketinizin adı', en: 'Your company name' },
  'form.placeholder.website': { tr: 'ornek.com.tr', en: 'example.com' },
  'form.placeholder.service': { tr: 'Hizmet seçin', en: 'Select a service' },
  'form.placeholder.budget': { tr: 'Bütçe seçin', en: 'Select a budget' },
  'form.placeholder.message': {
    tr: 'Markanız, ihtiyaç duyduğunuz hizmet ve hedefleriniz hakkında kısaca bilgi verin.',
    en: 'Tell us briefly about your brand, the service you need and your goals.',
  },

  /* Doğrulama hataları — tarayıcıda `src/lib/forms.ts` tarafından basılır. */
  'form.error.name': { tr: 'Lütfen adınızı ve soyadınızı girin.', en: 'Please enter your first and last name.' },
  'form.error.email': { tr: 'Geçerli bir e-posta adresi girin.', en: 'Please enter a valid email address.' },
  'form.error.phone': { tr: 'Geçerli bir telefon numarası girin.', en: 'Please enter a valid phone number.' },
  'form.error.message': {
    tr: 'Mesajınız en az 10 karakter olmalı.',
    en: 'Your message must be at least 10 characters long.',
  },
  'form.error.consent': {
    tr: 'Devam etmek için aydınlatma metnini onaylayın.',
    en: 'Please accept the disclosure notice to continue.',
  },
  'form.error.company': { tr: 'Lütfen şirket adınızı girin.', en: 'Please enter your company name.' },
  'form.error.website': { tr: 'Geçerli bir web sitesi adresi girin.', en: 'Please enter a valid website address.' },
  'form.error.services': { tr: 'En az bir hizmet seçin.', en: 'Please select at least one service.' },

  'error.notFoundSeoTitle': { tr: 'Sayfa Bulunamadı | Pixelon', en: 'Page Not Found | Pixelon' },
  'error.notFoundSeoDescription': {
    tr: 'Aradığınız sayfa taşınmış veya kaldırılmış olabilir. Pixelon ana sayfasından devam edebilirsiniz.',
    en: 'The page you are looking for may have moved or been removed. Continue from the Pixelon home page.',
  },
  'error.notFoundTitle': { tr: 'Aradığınız sayfayı bulamadık.', en: 'We could not find that page.' },
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

/**
 * Form doğrulama metinlerinin o dildeki seti.
 *
 * Doğrulama tarayıcıda çalıştığı için bu nesne build sırasında üretilip forma
 * `data-messages` özniteliğiyle gömülür — istemciye ayrıca sözlük taşınmaz.
 */
export function formMessages(locale: Locale): FormMessages {
  return {
    name: t('form.error.name', locale),
    email: t('form.error.email', locale),
    phone: t('form.error.phone', locale),
    message: t('form.error.message', locale),
    consent: t('form.error.consent', locale),
    company: t('form.error.company', locale),
    website: t('form.error.website', locale),
    services: t('form.error.services', locale),
  };
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
    { label: t('nav.references', locale), href: localizedPath('references', locale) },
    item('nav.careers', 'careers'),
    item('nav.contact', 'contact'),
  ];
}
