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

/**
 * Görünen breadcrumb ile birebir aynı sırayı bekler — görünmeyen kırıntı eklenmez.
 *
 * Google `BreadcrumbList` içinde SON eleman dışındaki her `ListItem` için `item`
 * alanını zorunlu tutar; yalnızca son eleman hedefsiz kalabilir (zaten bulunulan
 * sayfadır). Hedefi olmayan bir ARA kırıntı bu yüzden şemadan düşürülür —
 * Search Console aksi hâlde "item alanı eksik" hatası veriyordu.
 *
 * Düşürme çağıran tarafta değil burada yapılır: kırıntı listesi birden çok
 * bileşenden geliyor ve hedefi olmayan ara kırıntının geçerli bir kullanımı yok.
 * Kategori sayfaları yayına girip kırıntı bir hedef kazandığında otomatik döner.
 */
export function breadcrumbSchema(crumbs: Crumb[]): Record<string, unknown> {
  const kept = crumbs.filter((crumb, index) => crumb.url || index === crumbs.length - 1);

  return {
    '@type': 'BreadcrumbList',
    itemListElement: kept.map((crumb, index) => ({
      '@type': 'ListItem',
      // Ara kırıntı düşürülmüş olabilir; sıra numarası boşluksuz kalmalı.
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

/**
 * Bir hizmet sayfasının kalıcı düğüm kimliği.
 *
 * Hizmet düğümlerinin kimliği yoktu; dolayısıyla hiçbir şey onlara referans
 * veremiyordu — vaka sayfaları "bu iş şu hizmetin kapsamındadır" diyemiyordu.
 */
function serviceNodeId(serviceUrl: string): string {
  return `${serviceUrl}#service`;
}

export function serviceSchema({ name, description, url, locale }: ServiceInput): Record<string, unknown> {
  return {
    '@type': 'Service',
    '@id': serviceNodeId(url),
    name,
    description,
    url,
    inLanguage: locale,
    provider: { '@id': ORG_ID },
    areaServed: 'TR',
  };
}

/**
 * Proje kategorisi → hizmet `translationKey` eşlemesi.
 *
 * Neden `category`: proje `detail.services` çipleri serbest metindir ("Web Sitesi
 * Tasarımı & Geliştirme"), hizmet sayfası adlarıyla eşleşmez ve 37 farklı çipten
 * yalnızca ikisi birebir tutar. Oradan bağ kurmak uydurma veri olurdu. `category`
 * ise beş değerli kontrollü bir sözlüktür ve işin ana hizmet hattını gösterir.
 *
 * Eşleşmeyen kategori sessizce bağsız kalır — yanlış bağ kurmaktansa bağ kurmamak.
 * `translationKey` kullanılır çünkü hizmet slug'ı dile göre değişir.
 */
export const SERVICE_BY_PROJECT_CATEGORY: Record<string, string> = {
  marka: 'branding',
  web: 'web-design',
  sosyal: 'social-media',
  saglik: 'health-tourism',
  uxui: 'ux-ui',
};

interface CaseStudyInput {
  url: string;
  title: string;
  description: string;
  /** Künyede görünen müşteri adı. */
  client: string;
  locale: Locale;
  year?: string | undefined;
  tags?: readonly string[] | undefined;
  imageUrl?: string | undefined;
  /** İşin ait olduğu hizmet; kategori eşleşmezse verilmez. */
  service?: { name: string; url: string } | undefined;
}

/**
 * Vaka (proje detay) sayfasının varlık düğümleri.
 *
 * Dönen dizi bir `CreativeWork` ve — hizmet bağı varsa — o hizmeti tanıtan kısa bir
 * `Service` düğümü içerir. İkincisi referansın havada kalmaması içindir: `@id` başka
 * sayfadaki düğümü gösterir, yanına adı ve adresi konunca graf kendi kendini anlatır.
 */
export function caseStudySchema({
  url,
  title,
  description,
  client,
  locale,
  year,
  tags,
  imageUrl,
  service,
}: CaseStudyInput): Record<string, unknown>[] {
  const serviceId = service ? serviceNodeId(service.url) : undefined;

  const work: Record<string, unknown> = {
    '@type': 'CreativeWork',
    '@id': `${url}#project`,
    name: title,
    description,
    url,
    inLanguage: locale,
    /* İşi Pixelon üretti; sayfa müşteriyi ve verilen hizmeti konu alır. */
    creator: { '@id': ORG_ID },
    isPartOf: { '@id': WEBSITE_ID },
    about: [{ '@type': 'Organization', name: client }, ...(serviceId ? [{ '@id': serviceId }] : [])],
    ...(year ? { dateCreated: year } : {}),
    ...(tags && tags.length > 0 ? { keywords: [...tags] } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
  };

  if (!service || !serviceId) return [work];

  return [work, { '@type': 'Service', '@id': serviceId, name: service.name, url: service.url }];
}

interface ArticleInput {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  /** Yalnız içerik gerçekten güncellendiyse verilir — build tarihi DEĞİLDİR. */
  dateModified?: string | undefined;
  author: string;
  locale: Locale;
  imageUrl?: string | undefined;
}

export function blogPostingSchema({
  headline,
  description,
  url,
  datePublished,
  dateModified,
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
    ...(dateModified ? { dateModified } : {}),
    inLanguage: locale,
    author: isOrgAuthor ? { '@id': ORG_ID } : { '@type': 'Person', name: author },
    publisher: { '@id': ORG_ID },
    ...(imageUrl ? { image: imageUrl } : {}),
  };
}

/**
 * Sayfada GÖRÜNEN soru-cevapları işaretler. Yalnız gerçekten yayımlanan SSS
 * bloğu için çağrılır — görünmeyen ya da uydurulmuş içerik işaretlenmez.
 */
export function faqPageSchema(items: { question: string; answer: string }[]): Record<string, unknown> {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}

/** Düğümleri tek `@graph` altında güvenli JSON'a serileştirir. */
export function toJsonLd(nodes: Record<string, unknown>[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes }).replace(/</g, '\\u003c');
}
