import { z } from 'astro/zod';

/**
 * Görsel alanları için çözümleyici. Astro içinde `image()` yardımcısı geçilir;
 * birim testlerinde varsayılan string şeması kullanılır — böylece şemalar
 * Astro çalışma zamanı olmadan da doğrulanabilir.
 */
export type ImageResolver = () => z.ZodTypeAny;

const defaultImage: ImageResolver = () => z.string();

const nonEmpty = z.string().min(1);

// Not: `z.string().email()` / `.url()` bu zod sürümünde deprecate edilmiş durumda —
// `astro check` çıktısını temiz tutmak için düz regex doğrulaması kullanılır.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const URL_RE = /^https?:\/\/\S+$/;

const titledItem = z.object({
  title: nonEmpty,
  description: nonEmpty,
});

const seo = z.object({
  title: nonEmpty,
  description: nonEmpty,
});

const faqItem = z.object({
  question: nonEmpty,
  answer: nonEmpty,
});

// --- services -------------------------------------------------------------

export function makeServiceSchema(image: ImageResolver = defaultImage) {
  return z.object({
    title: nonEmpty,
    navLabel: nonEmpty,
    order: z.number().default(0),
    seo,
    cover: image().optional(),
    hero: z.object({
      eyebrow: nonEmpty,
      headingLines: z.array(nonEmpty).min(1),
      lead: nonEmpty,
      tagline: z.string().optional(),
      whatsappMessage: nonEmpty,
    }),
    // Hizmet sayfalarındaki giriş/manşet bölümü (referans HTML'lerde "GİRİŞ").
    intro: z
      .object({
        eyebrow: nonEmpty,
        heading: nonEmpty,
        body: nonEmpty,
        highlight: z.string().optional(),
      })
      .optional(),
    why: z.object({
      eyebrow: nonEmpty,
      heading: nonEmpty,
      lead: z.string().optional(),
      items: z.array(titledItem).min(1),
    }),
    // Platform/kanal kartları — yalnızca bazı hizmetlerde bulunur.
    platforms: z
      .object({
        eyebrow: nonEmpty,
        heading: nonEmpty,
        lead: z.string().optional(),
        items: z.array(titledItem).min(1),
      })
      .optional(),
    scope: z.object({
      eyebrow: nonEmpty,
      heading: nonEmpty,
      lead: z.string().optional(),
      items: z.array(titledItem).min(1),
    }),
    // İki kavramın karşılaştırıldığı sekmeli bölüm (ör. UX/UI sayfasındaki
    // "UX ve UI Arasındaki Fark Nedir?").
    comparison: z
      .object({
        eyebrow: nonEmpty,
        heading: nonEmpty,
        lead: z.string().optional(),
        items: z.array(titledItem).min(1),
        note: z.string().optional(),
      })
      .optional(),
    // "Neye önem veriyoruz?" bölümü — bazı hizmet sayfalarında `why` bölümünden
    // ayrı, ikinci bir kart listesi olarak yer alır.
    principles: z
      .object({
        eyebrow: nonEmpty,
        heading: nonEmpty,
        lead: z.string().optional(),
        items: z.array(titledItem).min(1),
      })
      .optional(),
    // Üretilen içerik türleri — düz etiket listesi (yalnızca Video ve Prodüksiyon sayfasında).
    contentTypes: z
      .object({
        eyebrow: nonEmpty,
        heading: nonEmpty,
        lead: z.string().optional(),
        items: z.array(nonEmpty).min(1),
      })
      .optional(),
    process: z.object({
      eyebrow: nonEmpty,
      heading: nonEmpty,
      steps: z.array(titledItem).min(1),
    }),
    projects: z
      .object({
        eyebrow: nonEmpty,
        heading: nonEmpty,
        lead: z.string().optional(),
        items: z
          .array(
            z.object({
              eyebrow: z.string().optional(),
              title: nonEmpty,
              description: nonEmpty,
              href: z.string().optional(),
            }),
          )
          .min(1),
      })
      .optional(),
    // Madde listesi bölümü (ör. "İÇERİK TÜRLERİ", "KİMLER İÇİN").
    // Her hizmet sayfasında bulunmaz.
    value: z
      .object({
        eyebrow: nonEmpty,
        heading: nonEmpty,
        lead: z.string().optional(),
        bullets: z.array(nonEmpty).default([]),
      })
      .optional(),
    sectors: z
      .object({
        eyebrow: nonEmpty,
        heading: nonEmpty,
        body: nonEmpty,
      })
      .optional(),
    cta: z.object({
      eyebrow: nonEmpty,
      heading: nonEmpty,
      lead: z.string().optional(),
    }),
    faq: z.object({
      eyebrow: nonEmpty,
      heading: nonEmpty,
      items: z.array(faqItem).min(1),
    }),
  });
}

// --- projects -------------------------------------------------------------

export function makeProjectSchema(image: ImageResolver = defaultImage) {
  return z.object({
    title: nonEmpty,
    client: nonEmpty,
    category: nonEmpty,
    categoryLabel: z.string().optional(),
    excerpt: nonEmpty,
    cover: image().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    tags: z.array(z.string()).default([]),
    year: z.string().optional(),
    url: z.string().optional(),
  });
}

// --- posts ----------------------------------------------------------------

export function makePostSchema(image: ImageResolver = defaultImage) {
  return z.object({
    title: nonEmpty,
    category: nonEmpty,
    excerpt: nonEmpty,
    date: z.coerce.date(),
    cover: image().optional(),
    author: z.string().default('Pixelon'),
    status: z.enum(['draft', 'published']).default('published'),
    featured: z.boolean().default(false),
    seo: seo.partial().optional(),
  });
}

// --- references -----------------------------------------------------------

export function makeReferenceSchema(image: ImageResolver = defaultImage) {
  return z.object({
    name: nonEmpty,
    sector: z.string().optional(),
    logo: image(),
    order: z.number().default(0),
  });
}

// --- team -----------------------------------------------------------------

export function makeTeamSchema(image: ImageResolver = defaultImage) {
  return z.object({
    name: nonEmpty,
    role: nonEmpty,
    photo: image().optional(),
    order: z.number().default(0),
  });
}

// --- settings (singleton) -------------------------------------------------

export const settingsSchema = z.object({
  phone: nonEmpty,
  email: z.string().regex(EMAIL_RE, 'Geçerli bir e-posta adresi olmalı.'),
  address: nonEmpty,
  whatsapp: z.object({
    number: nonEmpty,
    defaultMessage: nonEmpty,
  }),
  social: z
    .array(
      z.object({
        label: nonEmpty,
        short: z.string().optional(),
        url: z.string().regex(URL_RE, 'Geçerli bir bağlantı olmalı.'),
      }),
    )
    .default([]),
  legalLinks: z
    .array(
      z.object({
        label: nonEmpty,
        href: nonEmpty,
      }),
    )
    .default([]),
  footerIntro: z.string().optional(),
  copyright: z.string().optional(),
});
