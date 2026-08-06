import type { PageSection } from '../content/page-schema';
import { localizedPath, type Locale } from './i18n';
import { t } from './ui';

/**
 * Hizmet detay sayfaları, sayfa bölümleriyle aynı görsel dili paylaşır. Bu yüzden ayrı bir
 * şablon yazmak yerine, `services` koleksiyonundaki sabit alanlı veri buradaki saf fonksiyonla
 * `PageSection[]` listesine çevrilir ve `SectionRenderer` ile basılır.
 *
 * Bölüm SIRASI burada belirlenir — 10 hizmet sayfasının tamamı aynı kanonik akışı izler.
 */

interface TitledItem {
  title: string;
  description: string;
}

interface Block {
  eyebrow: string;
  heading: string;
  lead?: string | undefined;
}

export interface ServiceLike {
  title: string;
  hero: {
    eyebrow: string;
    headingLines: string[];
    lead: string;
    tagline?: string | undefined;
  };
  intro?: (Block & { body: string; highlight?: string | undefined }) | undefined;
  why: Block & { items: TitledItem[] };
  scope: Block & { items: TitledItem[] };
  platforms?: (Block & { items: TitledItem[] }) | undefined;
  principles?: (Block & { items: TitledItem[] }) | undefined;
  comparison?: (Block & { items: TitledItem[]; note?: string | undefined }) | undefined;
  contentTypes?: (Block & { items: string[] }) | undefined;
  process: Block & { steps: TitledItem[] };
  projects?:
    | (Block & { items: { eyebrow?: string | undefined; title: string; description: string; href?: string }[] })
    | undefined;
  value?: (Block & { bullets: string[] }) | undefined;
  sectors?: (Block & { body: string }) | undefined;
  cta: Block;
  faq: Block & { items: { question: string; answer: string }[] };
}

const cards = (block: Block & { items: PageSection extends never ? never : TitledItem[] }): PageSection => ({
  type: 'cards',
  eyebrow: block.eyebrow,
  heading: block.heading,
  lead: block.lead,
  background: 'dark',
  ctas: [],
  items: block.items,
});

export function serviceToSections(service: ServiceLike, whatsappUrl: string, locale: Locale = 'tr'): PageSection[] {
  const contactPath = localizedPath('contact', locale);
  const homePath = localizedPath('home', locale);
  const servicesPath = localizedPath('services', locale);
  const sections: PageSection[] = [];

  sections.push({
    type: 'hero',
    eyebrow: service.hero.eyebrow,
    background: 'dark',
    chips: [],
    headingLines: service.hero.headingLines,
    lead: service.hero.lead,
    tagline: service.hero.tagline,
    breadcrumb: [
      { label: t('nav.home', locale), href: homePath },
      { label: t('nav.services', locale), href: servicesPath },
      { label: service.title },
    ],
    ctas: [
      { label: t('cta.quote', locale), href: contactPath, variant: 'primary', external: false },
      { label: t('cta.whatsapp', locale), href: whatsappUrl, variant: 'outline', icon: 'whatsapp', external: true },
    ],
  });

  if (service.intro) {
    sections.push({
      type: 'text',
      eyebrow: service.intro.eyebrow,
      heading: service.intro.heading,
      body: service.intro.body,
      highlight: service.intro.highlight,
      background: 'dark',
      ctas: [],
    });
  }

  sections.push(cards(service.why));
  sections.push(cards(service.scope));

  if (service.platforms) sections.push(cards(service.platforms));
  if (service.principles) sections.push(cards(service.principles));

  if (service.comparison) {
    sections.push({
      type: 'cards',
      eyebrow: service.comparison.eyebrow,
      heading: service.comparison.heading,
      lead: service.comparison.lead,
      note: service.comparison.note,
      background: 'dark',
      ctas: [],
      items: service.comparison.items,
      columns: 2,
    });
  }

  if (service.contentTypes) {
    sections.push({
      type: 'bullets',
      eyebrow: service.contentTypes.eyebrow,
      heading: service.contentTypes.heading,
      lead: service.contentTypes.lead,
      background: 'dark',
      ctas: [],
      items: service.contentTypes.items,
    });
  }

  sections.push({
    type: 'steps',
    eyebrow: service.process.eyebrow,
    heading: service.process.heading,
    lead: service.process.lead,
    background: 'dark',
    ctas: [],
    items: service.process.steps,
  });

  if (service.projects) {
    sections.push({
      type: 'cards',
      eyebrow: service.projects.eyebrow,
      heading: service.projects.heading,
      lead: service.projects.lead,
      background: 'dark',
      ctas: [],
      items: service.projects.items,
    });
  }

  if (service.value) {
    // Madde listesi varsa bullets; yoksa lead tek paragraflık bir metin bölümüne düşer.
    if (service.value.bullets.length > 0) {
      sections.push({
        type: 'bullets',
        eyebrow: service.value.eyebrow,
        heading: service.value.heading,
        lead: service.value.lead,
        background: 'dark',
        ctas: [],
        items: service.value.bullets,
      });
    } else if (service.value.lead) {
      sections.push({
        type: 'text',
        eyebrow: service.value.eyebrow,
        heading: service.value.heading,
        body: service.value.lead,
        background: 'dark',
        ctas: [],
      });
    }
  }

  if (service.sectors) {
    sections.push({
      type: 'text',
      eyebrow: service.sectors.eyebrow,
      heading: service.sectors.heading,
      body: service.sectors.body,
      background: 'dark',
      ctas: [],
    });
  }

  sections.push({
    type: 'cta',
    eyebrow: service.cta.eyebrow,
    heading: service.cta.heading,
    lead: service.cta.lead,
    background: 'dark',
    ctas: [
      { label: t('cta.quoteFormal', locale), href: contactPath, variant: 'primary', external: false },
      { label: t('cta.whatsapp', locale), href: whatsappUrl, variant: 'outline', icon: 'whatsapp', external: true },
    ],
  });

  sections.push({
    type: 'faq',
    eyebrow: service.faq.eyebrow,
    heading: service.faq.heading,
    lead: service.faq.lead,
    background: 'dark',
    ctas: [],
    items: service.faq.items,
  });

  return sections;
}
