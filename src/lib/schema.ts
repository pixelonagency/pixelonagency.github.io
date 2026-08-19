import type { Locale } from './i18n';

/**
 * Site geneli JSON-LD entity graph'ı.
 *
 * Tek ve kalıcı Organization kimliği (`#organization`) tüm sayfalarda aynıdır;
 * WebSite, WebPage, Service, BlogPosting ve BreadcrumbList düğümleri ona
 * `@id` ile referans verir. Böylece arama motorları ve üretken yanıt sistemleri
 * Pixelon'u tek tutarlı varlık olarak okur.
 *
 * KURAL: Buradaki her alan sayfada KULLANICIYA GÖRÜNEN veya içerik deposunda
 * doğrulanabilir bilgiden gelir — uydurma veri eklenmez.
 */

const ORG_ID = 'https://pixelon.com.tr/#organization';
const WEBSITE_ID = 'https://pixelon.com.tr/#website';

interface OrgInput {
  site: string;
  logoUrl: string;
  email: string;
  phone: string;
  /** İçerikteki görünen adres ("Kadıköy, İstanbul") — sokak adresi bilinmiyor, eklenmez. */
  socialUrls: string[];
}

export function organizationSchema({ site, logoUrl, email, phone, socialUrls }: OrgInput): Record<string, unknown> {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'Pixelon',
    url: site,
    logo: { '@type': 'ImageObject', url: logoUrl },
    email,
    telephone: phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kadıköy',
      addressRegion: 'İstanbul',
      addressCountry: 'TR',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: phone,
      email,
      contactType: 'customer service',
      availableLanguage: ['Turkish', 'English'],
    },
    sameAs: socialUrls,
  };
}

export function webSiteSchema(site: string): Record<string, unknown> {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: 'Pixelon',
    url: site,
    inLanguage: ['tr', 'en'],
    publisher: { '@id': ORG_ID },
  };
}

interface PageInput {
  url: string;
  title: string;
  description: string;
  locale: Locale;
}

export function webPageSchema({ url, title, description, locale }: PageInput): Record<string, unknown> {
  return {
    '@type': 'WebPage',
    '@id': url,
    url,
    name: title,
    description,
    inLanguage: locale,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
  };
}

export interface Crumb {
  label: string;
  url?: string | undefined;
}

/** Görünen breadcrumb ile birebir aynı sırayı bekler — görünmeyen kırıntı eklenmez. */
export function breadcrumbSchema(crumbs: Crumb[]): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      ...(crumb.url ? { item: crumb.url } : {}),
    })),
  };
}

interface ServiceInput {
  name: string;
  description: string;
  url: string;
  locale: Locale;
}

export function serviceSchema({ name, description, url, locale }: ServiceInput): Record<string, unknown> {
  return {
    '@type': 'Service',
    name,
    description,
    url,
    inLanguage: locale,
    provider: { '@id': ORG_ID },
    areaServed: 'TR',
  };
}

interface ArticleInput {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  author: string;
  locale: Locale;
  imageUrl?: string | undefined;
}

export function blogPostingSchema({
  headline,
  description,
  url,
  datePublished,
  author,
  locale,
  imageUrl,
}: ArticleInput): Record<string, unknown> {
  // "Pixelon" / "Pixelon Ekibi" kurumsal yazarlıktır; başka bir ad gerçek kişidir.
  const isOrgAuthor = /^pixelon/i.test(author.trim());
  return {
    '@type': 'BlogPosting',
    headline,
    description,
    url,
    mainEntityOfPage: url,
    datePublished,
    inLanguage: locale,
    author: isOrgAuthor ? { '@id': ORG_ID } : { '@type': 'Person', name: author },
    publisher: { '@id': ORG_ID },
    ...(imageUrl ? { image: imageUrl } : {}),
  };
}

/** Düğümleri tek `@graph` altında güvenli JSON'a serileştirir. */
export function toJsonLd(nodes: Record<string, unknown>[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes }).replace(/</g, '\\u003c');
}
