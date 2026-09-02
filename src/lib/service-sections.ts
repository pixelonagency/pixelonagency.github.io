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
    logos?:
      | (
          | 'google'
          | 'instagram'
          | 'facebook'
          | 'tiktok'
          | 'yandex'
          | 'linkedin'
          | 'snapchat'
          | 'perplexity'
          | 'searchconsole'
          | 'analytics'
          | 'semrush'
          | 'youtube'
        )[]
      | undefined;
  };
  heroVideo?: Extract<PageSection, { type: 'hero' }>['video'];
  intro?: (Block & { body: string; highlight?: string | undefined }) | undefined;
  why: Block & {
    items: (TitledItem & {
      icon?: 'team' | 'conversion' | 'report' | 'cycle' | undefined;
      featured?: boolean | undefined;
    })[];
  };
  scope: Block & { items: TitledItem[]; layout?: 'cards' | 'list' | undefined };
  platforms?:
    | (Block & {
        items: (TitledItem & {
          logo?:
            | 'google'
            | 'instagram'
            | 'facebook'
            | 'tiktok'
            | 'yandex'
            | 'linkedin'
            | 'snapchat'
            | 'perplexity'
            | 'searchconsole'
            | 'analytics'
            | 'semrush'
            | 'youtube'
            | undefined;
          featured?: boolean | undefined;
        })[];
      })
    | undefined;
  principles?:
    | (Block & {
        items: (TitledItem & {
          icon?: 'audience' | 'strategy' | 'creative' | 'landing' | 'tracking' | 'optimize' | undefined;
        })[];
      })
    | undefined;
  comparison?: (Block & { items: TitledItem[]; note?: string | undefined }) | undefined;
  contentTypes?: (Block & { items: string[] }) | undefined;
  process: Block & {
    steps: (TitledItem & { icon?: 'discover' | 'plan' | 'build' | 'launch' | 'optimize' | 'measure' | undefined })[];
  };
  projects?:
    | (Block & { items: { eyebrow?: string | undefined; title: string; description: string; href?: string }[] })
    | undefined;
  value?: (Block & { bullets: string[] }) | undefined;
  sectors?:
    | {
        eyebrow: string;
        heading: string;
        body: string;
        /** Verilirse bölüm görselli karta döner; yoksa düz metin kalır. */
        cards?: { label: string; image: unknown; alt?: string | undefined }[] | undefined;
      }
    | undefined;
  /* --- Zengin kanıt bölümleri (opsiyonel) — bkz. schemas.ts gerekçesi. --- */
  stats?:
    | {
        eyebrow?: string | undefined;
        heading?: string | undefined;
        lead?: string | undefined;
        items: {
          value: number;
          prefix?: string | undefined;
          suffix?: string | undefined;
          label: string;
          description?: string | undefined;
        }[];
      }
    | undefined;
  reach?:
    | (Block & {
        countries: {
          label: string;
          flag: string;
          highlighted?: boolean;
          /** İkisi birden varsa harita pini çizilir — bkz. src/lib/map-pins.ts. */
          lat?: number | undefined;
          lon?: number | undefined;
        }[];
      })
    | undefined;
  showcase?:
    | (Block & {
        slugs: string[];
        columns?: number | undefined;
        ctaLabel?: string | undefined;
        ctaHref?: string | undefined;
      })
    | undefined;
  spotlight?:
    | {
        eyebrow?: string | undefined;
        heading: string;
        lead?: string | undefined;
        image?: unknown;
        alt?: string | undefined;
      }
    | undefined;
  showreel?:
    | {
        eyebrow?: string | undefined;
        heading?: string | undefined;
        placement?: 'top' | 'mid' | undefined;
        variant?: 'wide' | 'square' | 'reel' | undefined;
        items: {
          label: string;
          image: unknown;
          alt?: string | undefined;
          href: string;
          video?: string | undefined;
        }[];
      }[]
    | undefined;
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
    video: service.heroVideo,
    chips: [],
    /* Hizmet sayfalarında rozet yok; lead tek özet cümle olduğu için mobilde de kalır. */
    hideLeadOnMobile: false,
    headingLines: service.hero.headingLines,
    lead: service.hero.lead,
    tagline: service.hero.tagline,
    logos: service.hero.logos ?? [],
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

  /*
   * Kanıt bandı hero'nun hemen altındadır. Ziyaretçinin gördüğü ikinci şey
   * iddia değil rakam olsun diye: sayfanın ilk ekranında "biz iyiyiz" yazan
   * bir paragraf yerine sayılan bir sayaç durur.
   */
  if (service.stats) {
    sections.push({
      type: 'stats',
      eyebrow: service.stats.eyebrow,
      heading: service.stats.heading,
      lead: service.stats.lead,
      background: 'dark',
      ctas: [],
      items: service.stats.items,
    });
  }

  /*
   * İş şeritleri. `top` olanlar hero'nun hemen altında, intro'dan ÖNCE basılır:
   * sayfaya giren kişi ilk olarak gerçek işleri görsün. `mid` olanlar vaka
   * vitrininden sonra gelir. Şerit kendi zeminini bastığı için nextBg() sırası
   * TÜKETİLMEZ — araya girse de sonraki bölümlerin açık/koyu ritmi kaymasın.
   */
  const pushReels = (where: 'top' | 'mid') => {
    for (const reel of service.showreel ?? []) {
      if ((reel.placement ?? 'top') !== where) continue;
      sections.push({
        type: 'showreel',
        eyebrow: reel.eyebrow,
        heading: reel.heading,
        variant: reel.variant,
        background: 'dark',
        ctas: [],
        items: reel.items.map((item) => ({
          label: item.label,
          image: item.image,
          alt: item.alt,
          href: item.href,
          video: item.video,
        })),
      } as PageSection);
    }
  };

  pushReels('top');

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

  /*
   * "Neden Pixelon?" ikonlar VARSA kendi bölüm tipiyle basılır. İkon eksikse
   * klasik kart ızgarasına düşülür — `why` her hizmet sayfasında zorunlu bir
   * alan (22 dosya) ama ikon yalnız reklam sayfasında var.
   */
  const whyItems = service.why.items;
  if (whyItems.length > 0 && whyItems.every((item) => Boolean(item.icon))) {
    sections.push({
      type: 'why',
      eyebrow: service.why.eyebrow,
      heading: service.why.heading,
      lead: service.why.lead,
      background: nextBg(),
      ctas: [],
      items: whyItems.map((item) => ({
        title: item.title,
        description: item.description,
        icon: item.icon!,
        featured: item.featured ?? false,
      })),
    });
  } else {
    sections.push(
      cards({ ...service.why, items: whyItems.map((i) => ({ title: i.title, description: i.description })) }),
    );
  }

  /*
   * Kapsam, `layout: 'list'` verildiğinde editoryal satır listesi olur.
   * Verilmezse kart ızgarası — `scope` her hizmet sayfasında zorunlu bir alan
   * (22 dosya) ve varsayılan davranış değişmemeli.
   */
  if (service.scope.layout === 'list') {
    sections.push({
      type: 'scope',
      eyebrow: service.scope.eyebrow,
      heading: service.scope.heading,
      lead: service.scope.lead,
      background: nextBg(),
      ctas: [],
      items: service.scope.items,
    });
  } else {
    sections.push(cards(service.scope));
  }

  /*
   * Platformlar, marka işaretleri VARSA kendi bölüm tipiyle basılır: büyük
   * logolu, asimetrik ızgara. Düz kart listesi olarak basıldığında bölüm
   * sayfanın en kuru yeriydi.
   *
   * Logo eksikse eski kart ızgarasına düşülür — sosyal medya ve sağlık
   * turizmi sayfaları da bu alanı kullanıyor ama marka işaretleri yok;
   * logoyu zorunlu tutmak o sayfaları kırıyordu.
   */
  if (service.platforms) {
    const items = service.platforms.items;
    const hepsiLogolu = items.length > 0 && items.every((item) => Boolean(item.logo));

    if (hepsiLogolu) {
      sections.push({
        type: 'platforms',
        eyebrow: service.platforms.eyebrow,
        heading: service.platforms.heading,
        lead: service.platforms.lead,
        background: nextBg(),
        ctas: [],
        items: items.map((item) => ({
          title: item.title,
          description: item.description,
          logo: item.logo!,
          featured: item.featured ?? false,
        })),
      });
    } else {
      sections.push(cards(service.platforms));
    }
  }

  /*
   * İlkeler, çizgi ikonlar VARSA kendi bölüm tipiyle basılır: kart üzerine
   * gelindiğinde zemin lime'a döner ve ikon kendini çizer.
   *
   * İkon eksikse eski krem kart ızgarasına düşülür — bu alanı on hizmet
   * dosyası kullanıyor ama yalnız birinde ikon var; zorunlu tutmak diğer
   * dokuz sayfayı kırardı.
   */
  if (service.principles) {
    const items = service.principles.items;
    const hepsiIkonlu = items.length > 0 && items.every((item) => Boolean(item.icon));
    const background = nextBg();

    if (hepsiIkonlu) {
      sections.push({
        type: 'principles',
        eyebrow: service.principles.eyebrow,
        heading: service.principles.heading,
        lead: service.principles.lead,
        background,
        ctas: [],
        items: items.map((item) => ({ title: item.title, description: item.description, icon: item.icon! })),
      });
    } else {
      // Referans: ilkeler/standartlar beyaz zeminde krem dolgulu kartlardır.
      sections.push({
        type: 'cards',
        eyebrow: service.principles.eyebrow,
        heading: service.principles.heading,
        lead: service.principles.lead,
        kind: background === 'light' ? 'tinted' : 'grid',
        background,
        ctas: [],
        items: items.map((item) => ({ title: item.title, description: item.description })),
      });
    }
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

  /*
   * Süreç, ikonlar VARSA dağınık kart dizilimiyle basılır. İkon eksikse eski
   * numaralı adım ızgarası —  her hizmet sayfasında zorunlu (22 dosya).
   */
  const steps = service.process.steps;
  if (steps.length > 0 && steps.every((step) => Boolean(step.icon))) {
    sections.push({
      type: 'process',
      eyebrow: service.process.eyebrow,
      heading: service.process.heading,
      lead: service.process.lead,
      background: nextBg(),
      ctas: [],
      items: steps.map((step) => ({ title: step.title, description: step.description, icon: step.icon! })),
    });
  } else {
    sections.push({
      type: 'steps',
      eyebrow: service.process.eyebrow,
      heading: service.process.heading,
      lead: service.process.lead,
      background: nextBg(),
      ctas: [],
      items: steps.map((step) => ({ title: step.title, description: step.description })),
    });
  }

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

  /*
   * Kanıt sırası: önce nasıl çalıştığımızı anlatırız (steps), sonra sonucu
   * gösteririz. Vitrin süreçten önce gelirse ziyaretçi "güzel işler ama nasıl
   * yapıyorsunuz" sorusuyla kalır.
   */
  if (service.showcase) {
    sections.push({
      type: 'projects',
      eyebrow: service.showcase.eyebrow,
      heading: service.showcase.heading,
      lead: service.showcase.lead,
      slugs: service.showcase.slugs,
      columns: service.showcase.columns,
      kind: 'grid',
      showFilters: false,
      background: nextBg(),
      ctas: [],
      ctaLabel: service.showcase.ctaLabel,
      ctaHref: service.showcase.ctaHref,
    });
  }

  pushReels('mid');

  if (service.spotlight) {
    sections.push({
      type: 'media',
      heading: service.spotlight.heading,
      lead: service.spotlight.lead,
      eyebrow: service.spotlight.eyebrow,
      image: service.spotlight.image,
      alt: service.spotlight.alt,
      background: nextBg(),
      ctas: [],
    } as PageSection);
  }

  if (service.reach) {
    sections.push({
      type: 'worldMap',
      eyebrow: service.reach.eyebrow,
      heading: service.reach.heading,
      lead: service.reach.lead,
      background: nextBg(),
      ctas: [],
      countries: service.reach.countries.map((c) => ({ ...c, highlighted: c.highlighted ?? false })),
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
    const sectorCards = service.sectors.cards ?? [];
    /*
     * Görsel verilmişse kart ızgarası, verilmemişse eski düz metin bölümü.
     * Geri düşüş bilinçli: `cards` hizmet dosyalarının çoğunda yok.
     */
    if (sectorCards.length > 0) {
      sections.push({
        type: 'sectorCards',
        eyebrow: service.sectors.eyebrow,
        heading: service.sectors.heading,
        body: service.sectors.body,
        background: nextBg(),
        ctas: [],
        cards: sectorCards.map((card) => ({
          label: card.label,
          image: card.image,
          alt: card.alt,
        })),
      } as PageSection);
    } else {
      sections.push({
        type: 'text',
        eyebrow: service.sectors.eyebrow,
        heading: service.sectors.heading,
        body: service.sectors.body,
        background: nextBg(),
        ctas: [],
      });
    }
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
