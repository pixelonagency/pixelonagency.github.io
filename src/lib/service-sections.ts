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

export function serviceToSections(service: ServiceLike, whatsappUrl: string, locale: Locale = 'tr'): PageSection[] {
  const contactPath = localizedPath('contact', locale);
  const homePath = localizedPath('home', locale);
  const servicesPath = localizedPath('services', locale);
  const sections: PageSection[] = [];

  /*
   * Referans tasarımda hizmet sayfaları koyu hero'nun ardından KATI bir
   * beyaz/koyu bölüm ritmiyle akar. Hangi opsiyonel bölümlerin var olduğundan
   * bağımsız olarak sıradaki her içerik bölümü zemini değiştirir.
   */
  let lightNext = true;
  const nextBg = (): 'light' | 'dark' => {
    const bg = lightNext ? 'light' : 'dark';
    lightNext = !lightNext;
    return bg;
  };

  const cards = (block: Block & { items: TitledItem[] }): PageSection => ({
    type: 'cards',
    eyebrow: block.eyebrow,
    heading: block.heading,
    lead: block.lead,
    background: nextBg(),
    ctas: [],
    items: block.items,
  });

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
    // Referans: giriş bölümü beyazdır — başlık solda sticky, paragraflar sağda.
    sections.push({
      type: 'text',
      eyebrow: service.intro.eyebrow,
      heading: service.intro.heading,
      body: service.intro.body,
      highlight: service.intro.highlight,
      layout: 'split',
      background: nextBg(),
      ctas: [],
    });
  }

  sections.push(cards(service.why));
  sections.push(cards(service.scope));

  if (service.platforms) sections.push(cards(service.platforms));

  if (service.principles) {
    // Referans: ilkeler/standartlar beyaz zeminde krem dolgulu kartlardır.
    const background = nextBg();
    sections.push({
      type: 'cards',
      eyebrow: service.principles.eyebrow,
      heading: service.principles.heading,
      lead: service.principles.lead,
      kind: background === 'light' ? 'tinted' : 'grid',
      background,
      ctas: [],
      items: service.principles.items,
    });
  }

  if (service.comparison) {
    sections.push({
      type: 'cards',
      eyebrow: service.comparison.eyebrow,
      heading: service.comparison.heading,
      lead: service.comparison.lead,
      note: service.comparison.note,
      background: nextBg(),
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
      background: nextBg(),
      ctas: [],
      items: service.contentTypes.items,
    });
  }

  sections.push({
    type: 'steps',
    eyebrow: service.process.eyebrow,
    heading: service.process.heading,
    lead: service.process.lead,
    background: nextBg(),
    ctas: [],
    items: service.process.steps,
  });

  if (service.projects) {
    sections.push({
      type: 'cards',
      eyebrow: service.projects.eyebrow,
      heading: service.projects.heading,
      lead: service.projects.lead,
      background: nextBg(),
      ctas: [],
      items: service.projects.items,
    });
  }

  if (service.value) {
    // Referans: değer listesi 2 sütunlu noktalı listedir; maddesizse düz metin bölümü.
    if (service.value.bullets.length > 0) {
      sections.push({
        type: 'bullets',
        eyebrow: service.value.eyebrow,
        heading: service.value.heading,
        lead: service.value.lead,
        kind: 'split',
        background: nextBg(),
        ctas: [],
        items: service.value.bullets,
      });
    } else if (service.value.lead) {
      sections.push({
        type: 'text',
        eyebrow: service.value.eyebrow,
        heading: service.value.heading,
        body: service.value.lead,
        background: nextBg(),
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
      background: nextBg(),
      ctas: [],
    });
  }

  sections.push({
    type: 'cta',
    eyebrow: service.cta.eyebrow,
    heading: service.cta.heading,
    lead: service.cta.lead,
    background: nextBg(),
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
    background: nextBg(),
    ctas: [],
    items: service.faq.items,
  });

  return sections;
}
