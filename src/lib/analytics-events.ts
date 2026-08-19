/**
 * İş-etkinliği (business event) sözlüğünün TEK doğruluk kaynağı.
 *
 * Mimari: SİTE → dataLayer.push → GTM → GA4. Bu modül hiçbir GA4/GTM kimliği
 * içermez ve doğrudan gtag çağırmaz — teslimat tamamen GTM'deki Google tag'in
 * ve Consent Mode v2'nin sorumluluğundadır.
 *
 * PII koruması TASARIMLA sağlanır: payload'a serbest metin GİREMEZ. Tüm alanlar
 * kapalı enum'lardan doğrulanır; enum dışı her değer olayı sessizce düşürür
 * (typo/taxonomy-drift koruması). Form içeriği, ad, e-posta, telefon, mesaj vb.
 * hiçbir kullanıcı verisi bu katmana taşınamaz.
 */
import { ROUTE_SLUGS, type Locale } from './i18n';

export const ANALYTICS_EVENTS = [
  'generate_lead',
  'click_whatsapp',
  'click_phone',
  'click_email',
  'click_free_analysis',
] as const;
export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

const LEAD_TYPES = ['contact', 'free_analysis'] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

/** Gerçek bileşenlere karşılık gelen kontrollü konum sözlüğü — serbest metin yok. */
const INTERACTION_LOCATIONS = [
  'header',
  'footer',
  'floating_cta',
  'contact_page',
  'free_analysis_page',
  'service_page',
  'project_page',
  'landing_page',
] as const;
export type InteractionLocation = (typeof INTERACTION_LOCATIONS)[number];

const LANGUAGES = ['tr', 'en'] as const;
type PageLanguage = (typeof LANGUAGES)[number];

export interface EventInput {
  leadType?: string | undefined;
  location?: string | undefined;
  language?: string | undefined;
}

export interface EventPayload {
  event: AnalyticsEvent;
  lead_type?: LeadType;
  interaction_location?: InteractionLocation;
  page_language?: PageLanguage;
}

const isEvent = (value: string): value is AnalyticsEvent => (ANALYTICS_EVENTS as readonly string[]).includes(value);
const isLeadType = (value: string): value is LeadType => (LEAD_TYPES as readonly string[]).includes(value);
const isLocation = (value: string): value is InteractionLocation =>
  (INTERACTION_LOCATIONS as readonly string[]).includes(value);
const isLanguage = (value: string): value is PageLanguage => (LANGUAGES as readonly string[]).includes(value);

/**
 * Doğrulanmış dataLayer payload'ı üretir; olay adı allowlist dışındaysa `null`.
 *
 * Enum'a uymayan parametreler payload'a hiç yazılmaz (GTM'e `undefined`
 * gönderilmez); `lead_type` yalnızca `generate_lead` olayında yer alabilir.
 */
export function buildEventPayload(name: string, input: EventInput = {}): EventPayload | null {
  if (!isEvent(name)) return null;
  const payload: EventPayload = { event: name };
  if (name === 'generate_lead' && input.leadType && isLeadType(input.leadType)) payload.lead_type = input.leadType;
  if (name === 'generate_lead' && !payload.lead_type) return null; // lead türsüz lead olmaz
  if (input.location && isLocation(input.location)) payload.interaction_location = input.location;
  if (input.language && isLanguage(input.language)) payload.page_language = input.language;
  return payload;
}

/** Bir bağlantı href'ini iş olayına çevirir; iş anlamı yoksa `null`. */
export function resolveClickEvent(href: string): Exclude<AnalyticsEvent, 'generate_lead'> | null {
  if (/^tel:/i.test(href)) return 'click_phone';
  if (/^mailto:/i.test(href)) return 'click_email';
  if (/(^https?:)?\/\/(wa\.me|api\.whatsapp\.com)\//i.test(href)) return 'click_whatsapp';
  if (isAnalysisPath(href)) return 'click_free_analysis';
  return null;
}

const analysisPaths = new Set(
  (['tr', 'en'] as Locale[]).flatMap((locale) => {
    const prefix = locale === 'tr' ? '' : '/en';
    const slug = ROUTE_SLUGS.analysis[locale];
    return [`${prefix}/${slug}`, `${prefix}/${slug}/`];
  }),
);

function isAnalysisPath(href: string): boolean {
  const path = href.split(/[?#]/, 1)[0] ?? '';
  return analysisPaths.has(path);
}

/**
 * Sayfa yolundan sayfa-düzeyi konum türetir (yalnız iş anlamı taşıyan sayfalar).
 * Diğer sayfalarda konum bilinçli olarak atlanır — uydurma değer üretilmez.
 */
export function resolvePageLocation(pathname: string): InteractionLocation | undefined {
  const clean = pathname.replace(/\/+$/, '');
  const startsWithRoute = (key: 'services' | 'projects'): boolean => {
    for (const locale of ['tr', 'en'] as Locale[]) {
      const prefix = locale === 'tr' ? '' : '/en';
      if (
        clean === `${prefix}/${ROUTE_SLUGS[key][locale]}` ||
        clean.startsWith(`${prefix}/${ROUTE_SLUGS[key][locale]}/`)
      )
        return true;
    }
    return false;
  };
  const equalsRoute = (key: 'contact' | 'analysis' | 'website'): boolean => {
    for (const locale of ['tr', 'en'] as Locale[]) {
      const prefix = locale === 'tr' ? '' : '/en';
      if (clean === `${prefix}/${ROUTE_SLUGS[key][locale]}`) return true;
    }
    return false;
  };
  if (equalsRoute('contact')) return 'contact_page';
  if (equalsRoute('analysis')) return 'free_analysis_page';
  if (equalsRoute('website')) return 'landing_page';
  if (startsWithRoute('services')) return 'service_page';
  if (startsWithRoute('projects')) return 'project_page';
  return undefined;
}

/** `data-form-success` kimliğini iş sözlüğündeki lead türüne çevirir. */
export function leadTypeForForm(formId: string): LeadType | null {
  if (formId === 'contact') return 'contact';
  if (formId === 'analysis') return 'free_analysis';
  return null;
}

/**
 * Payload'ı dataLayer'a iletir — best effort: analytics hiçbir kullanıcı
 * aksiyonunu bloklayamaz, dataLayer yoksa sessizce vazgeçilir.
 */
export function pushToDataLayer(payload: EventPayload): void {
  try {
    const w = globalThis as { dataLayer?: unknown[] };
    if (!Array.isArray(w.dataLayer)) return;
    w.dataLayer.push(payload);
  } catch {
    /* analytics asla site işlevini bozamaz */
  }
}
