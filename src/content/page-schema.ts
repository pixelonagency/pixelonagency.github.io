import { z } from 'astro/zod';
import type { ImageResolver } from './schemas';

/**
 * Sayfa gövdesi "bölüm sözlüğü".
 *
 * Sabit alanlı sayfa şemaları yerine, her sayfa sıralı bir `sections` listesinden
 * oluşur ve her bölüm `type` ile ayrışır. Böylece editör Sveltia'da bölüm ekleyip
 * sırasını değiştirebilir; Astro tarafında `SectionRenderer` tek bir switch ile
 * doğru bileşeni basar.
 */

const defaultImage: ImageResolver = () => z.string();
const nonEmpty = z.string().min(1);

const cta = z.object({
  label: nonEmpty,
  href: nonEmpty,
  /** `link` = altı çizili düz bağlantı (referanstaki "Hemen Arayın" gibi). */
  variant: z.enum(['primary', 'outline', 'link']).default('primary'),
  /** Etiketin solunda gösterilen küçük satır içi SVG. */
  icon: z.enum(['whatsapp', 'phone', 'arrow']).optional(),
  /** Dış bağlantı — yeni sekmede açılır. */
  external: z.boolean().default(false),
});

/**
 * Her bölümün paylaştığı alanlar.
 *
 * `ctas` bilinçli olarak TÜM bölüm tiplerinde bulunur: referans tasarımda ızgaraların
 * altında bölüm düzeyinde butonlar var ("Tüm Hizmetlerimizi Keşfedin", "Projenizi Birlikte
 * Planlayalım" …). Bunları yalnızca hero/cta bölümlerine bağlamak, diğer bölümlerdeki
 * butonların içerikte hiç yerinin olmamasına yol açıyordu.
 */
const sectionBase = {
  eyebrow: z.string().optional(),
  anchor: z.string().optional(),
  background: z.enum(['dark', 'light']).default('dark'),
  ctas: z.array(cta).default([]),
};

export function makePageSchema(image: ImageResolver = defaultImage) {
  const hero = z.object({
    ...sectionBase,
    type: z.literal('hero'),
    headingLines: z.array(nonEmpty).min(1),
    lead: z.string().optional(),
    tagline: z.string().optional(),
    breadcrumb: z.array(z.object({ label: nonEmpty, href: z.string().optional() })).default([]),
    /** Hero altındaki kısa güven rozetleri ("15+ Yıllık Deneyim" …). */
    chips: z.array(nonEmpty).default([]),
    image: image().optional(),
    imageAlt: z.string().optional(),
  });

  const cards = z.object({
    ...sectionBase,
    type: z.literal('cards'),
    heading: nonEmpty,
    lead: z.string().optional(),
    columns: z.number().optional(),
    /** Izgaranın altında yer alan kapanış notu (ör. UX/UI karşılaştırmasındaki bağlayıcı cümle). */
    note: z.string().optional(),
    items: z
      .array(
        z.object({
          eyebrow: z.string().optional(),
          title: nonEmpty,
          description: nonEmpty,
          href: z.string().optional(),
          icon: z.string().optional(),
        }),
      )
      .min(1),
  });

  const steps = z.object({
    ...sectionBase,
    type: z.literal('steps'),
    heading: nonEmpty,
    lead: z.string().optional(),
    items: z.array(z.object({ title: nonEmpty, description: nonEmpty })).min(1),
  });

  const bullets = z.object({
    ...sectionBase,
    type: z.literal('bullets'),
    heading: nonEmpty,
    lead: z.string().optional(),
    items: z.array(nonEmpty).min(1),
  });

  const text = z.object({
    ...sectionBase,
    type: z.literal('text'),
    heading: z.string().optional(),
    body: nonEmpty,
    /** Gövdeden sonra gelen vurgulu alıntı satırı. */
    highlight: z.string().optional(),
    image: image().optional(),
    imageAlt: z.string().optional(),
  });

  const stats = z.object({
    ...sectionBase,
    type: z.literal('stats'),
    heading: z.string().optional(),
    lead: z.string().optional(),
    items: z
      .array(
        z.object({
          // Sayaç animasyonu 0'dan bu değere sayar — bu yüzden sayı olmak zorunda.
          value: z.number(),
          prefix: z.string().optional(),
          suffix: z.string().optional(),
          label: nonEmpty,
          /** Etiketin altındaki açıklama paragrafı. */
          description: z.string().optional(),
        }),
      )
      .min(1),
  });

  const faq = z.object({
    ...sectionBase,
    type: z.literal('faq'),
    heading: nonEmpty,
    lead: z.string().optional(),
    items: z.array(z.object({ question: nonEmpty, answer: nonEmpty })).min(1),
  });

  const ctaSection = z.object({
    ...sectionBase,
    type: z.literal('cta'),
    heading: nonEmpty,
    lead: z.string().optional(),
    // `ctas` sectionBase'ten gelir.
  });

  const logos = z.object({
    ...sectionBase,
    type: z.literal('logos'),
    heading: z.string().optional(),
    lead: z.string().optional(),
  });

  const projects = z.object({
    ...sectionBase,
    type: z.literal('projects'),
    heading: nonEmpty,
    lead: z.string().optional(),
    limit: z.number().optional(),
    showFilters: z.boolean().default(false),
    ctaLabel: z.string().optional(),
    ctaHref: z.string().optional(),
  });

  const posts = z.object({
    ...sectionBase,
    type: z.literal('posts'),
    heading: nonEmpty,
    lead: z.string().optional(),
    limit: z.number().optional(),
    ctaLabel: z.string().optional(),
    ctaHref: z.string().optional(),
  });

  const team = z.object({
    ...sectionBase,
    type: z.literal('team'),
    heading: nonEmpty,
    lead: z.string().optional(),
  });

  const services = z.object({
    ...sectionBase,
    type: z.literal('services'),
    heading: nonEmpty,
    lead: z.string().optional(),
    limit: z.number().optional(),
  });

  const form = z.object({
    ...sectionBase,
    type: z.literal('form'),
    heading: nonEmpty,
    lead: z.string().optional(),
    formId: z.enum(['contact', 'analysis']),
    submitLabel: z.string().optional(),
    /** Gönderim başarılı olduğunda formun yerine geçen panel. */
    successHeading: z.string().optional(),
    successBody: z.string().optional(),
    successNote: z.string().optional(),
    successCtas: z.array(cta).default([]),
    /** Gönderim başarısız olduğunda formun üstünde gösterilen uyarı. */
    errorHeading: z.string().optional(),
    errorBody: z.string().optional(),
  });

  const contactInfo = z.object({
    ...sectionBase,
    type: z.literal('contactInfo'),
    heading: z.string().optional(),
    lead: z.string().optional(),
    items: z.array(z.object({ label: nonEmpty, value: nonEmpty, href: z.string().optional() })).min(1),
  });

  const media = z.object({
    ...sectionBase,
    type: z.literal('media'),
    heading: z.string().optional(),
    lead: z.string().optional(),
    image: image().optional(),
    video: z.string().optional(),
    alt: z.string().optional(),
  });

  const jobs = z.object({
    ...sectionBase,
    type: z.literal('jobs'),
    heading: nonEmpty,
    lead: z.string().optional(),
    items: z
      .array(
        z.object({
          title: nonEmpty,
          location: z.string().optional(),
          employmentType: z.string().optional(),
          description: nonEmpty,
          href: z.string().optional(),
        }),
      )
      .min(1),
  });

  const section = z.discriminatedUnion('type', [
    hero,
    cards,
    steps,
    bullets,
    text,
    stats,
    faq,
    ctaSection,
    logos,
    projects,
    posts,
    team,
    services,
    form,
    contactInfo,
    media,
    jobs,
  ]);

  return z.object({
    seo: z.object({ title: nonEmpty, description: nonEmpty }),
    whatsappMessage: z.string().optional(),
    sections: z.array(section).default([]),
  });
}

export type PageSection = z.infer<ReturnType<typeof makePageSchema>>['sections'][number];
export type PageSectionType = PageSection['type'];

/**
 * Bölüm sözlüğünün tam listesi. Sveltia CMS yapılandırmasıyla karşılaştırma testi bunu
 * kullanır — zod'un iç yapısına (`_def`) bağlanmak yerine tek bir kaynak.
 *
 * Bu listenin yukarıdaki birleşimden sapması derleme hatasına yol açar: aşağıdaki tip
 * ataması, iki tarafın birbirini tam olarak kapsamasını zorunlu kılar.
 */
export const PAGE_SECTION_TYPES = [
  'hero',
  'cards',
  'steps',
  'bullets',
  'text',
  'stats',
  'faq',
  'cta',
  'logos',
  'projects',
  'posts',
  'team',
  'services',
  'form',
  'contactInfo',
  'media',
  'jobs',
] as const satisfies readonly PageSectionType[];

// Ters yön: birleşime yeni bir bölüm eklenip listeye eklenmezse burada tip hatası oluşur.
type _MissingFromList = Exclude<PageSectionType, (typeof PAGE_SECTION_TYPES)[number]>;
const _exhaustive: _MissingFromList extends never ? true : false = true;
void _exhaustive;
