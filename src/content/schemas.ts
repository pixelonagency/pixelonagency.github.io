import { z } from 'astro/zod';

/**
 * Görsel alanları için çözümleyici. Astro içinde `image()` yardımcısı geçilir;
 * birim testlerinde varsayılan string şeması kullanılır — böylece şemalar
 * Astro çalışma zamanı olmadan da doğrulanabilir.
 */
export type ImageResolver = () => z.ZodTypeAny;

const defaultImage: ImageResolver = () => z.string();

const nonEmpty = z.string().min(1);

/**
 * Sveltia CMS, dokunulmamış opsiyonel alanları `undefined` olarak değil `null` veya boş
 * string olarak yazar (`seo: null`, `cover: ''`). zod'un `.optional()` yalnızca
 * `undefined` kabul ettiği için bu içerik doğrulamadan geçemiyor, build patlıyor ve
 * editörün kaydı hiç yayına çıkmıyor.
 *
 * `opt()` ve `list()` bu iki biçimi "verilmemiş" sayar. Opsiyonel HER alan bunlardan
 * biriyle sarılmalıdır — `src/content/cms-round-trip.test.ts` bunu CMS'in ürettiği
 * gerçek yüklerle doğrular.
 */
const blankToUndefined = (value: unknown): unknown => (value === null || value === '' ? undefined : value);

/** Opsiyonel alan: `null` ve `''` da "verilmemiş" sayılır. */
export const opt = <T extends z.ZodTypeAny>(schema: T) => z.preprocess(blankToUndefined, schema.optional());

/** Opsiyonel liste: `null` / `''` boş listeye düşer. */
export const list = <T extends z.ZodTypeAny>(schema: T) => z.preprocess(blankToUndefined, z.array(schema).default([]));

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
    /**
     * Diller arası eşleştirme anahtarı. Slug dile göre değişebildiği için
     * (`seo-ve-icerik-pazarlamasi` ↔ `seo-and-content-marketing`) hreflang ve dil
     * değiştirici bu alanla bağ kurar. Verilmezse dosya adı anahtar sayılır.
     */
    translationKey: opt(z.string()),
    order: z.number().default(0),
    seo,
    cover: opt(image()),
    hero: z.object({
      eyebrow: nonEmpty,
      headingLines: z.array(nonEmpty).min(1),
      lead: nonEmpty,
      tagline: opt(z.string()),
      whatsappMessage: nonEmpty,
    }),
    // Hizmet sayfalarındaki giriş/manşet bölümü (referans HTML'lerde "GİRİŞ").
    intro: opt(
      z.object({
        eyebrow: nonEmpty,
        heading: nonEmpty,
        body: nonEmpty,
        highlight: opt(z.string()),
      }),
    ),
    why: z.object({
      eyebrow: nonEmpty,
      heading: nonEmpty,
      lead: opt(z.string()),
      items: z.array(titledItem).min(1),
    }),
    // Platform/kanal kartları — yalnızca bazı hizmetlerde bulunur.
    platforms: opt(
      z.object({
        eyebrow: nonEmpty,
        heading: nonEmpty,
        lead: opt(z.string()),
        items: z.array(titledItem).min(1),
      }),
    ),
    scope: z.object({
      eyebrow: nonEmpty,
      heading: nonEmpty,
      lead: opt(z.string()),
      items: z.array(titledItem).min(1),
    }),
    // İki kavramın karşılaştırıldığı sekmeli bölüm (ör. UX/UI sayfasındaki
    // "UX ve UI Arasındaki Fark Nedir?").
    comparison: opt(
      z.object({
        eyebrow: nonEmpty,
        heading: nonEmpty,
        lead: opt(z.string()),
        items: z.array(titledItem).min(1),
        note: opt(z.string()),
      }),
    ),
    // "Neye önem veriyoruz?" bölümü — bazı hizmet sayfalarında `why` bölümünden
    // ayrı, ikinci bir kart listesi olarak yer alır.
    principles: opt(
      z.object({
        eyebrow: nonEmpty,
        heading: nonEmpty,
        lead: opt(z.string()),
        items: z.array(titledItem).min(1),
      }),
    ),
    // Üretilen içerik türleri — düz etiket listesi (yalnızca Video ve Prodüksiyon sayfasında).
    contentTypes: opt(
      z.object({
        eyebrow: nonEmpty,
        heading: nonEmpty,
        lead: opt(z.string()),
        items: z.array(nonEmpty).min(1),
      }),
    ),
    process: z.object({
      eyebrow: nonEmpty,
      heading: nonEmpty,
      steps: z.array(titledItem).min(1),
    }),
    projects: opt(
      z.object({
        eyebrow: nonEmpty,
        heading: nonEmpty,
        lead: opt(z.string()),
        items: z
          .array(
            z.object({
              eyebrow: opt(z.string()),
              title: nonEmpty,
              description: nonEmpty,
              href: opt(z.string()),
            }),
          )
          .min(1),
      }),
    ),
    // Madde listesi bölümü (ör. "İÇERİK TÜRLERİ", "KİMLER İÇİN").
    // Her hizmet sayfasında bulunmaz.
    value: opt(
      z.object({
        eyebrow: nonEmpty,
        heading: nonEmpty,
        lead: opt(z.string()),
        bullets: list(nonEmpty),
      }),
    ),
    sectors: opt(
      z.object({
        eyebrow: nonEmpty,
        heading: nonEmpty,
        body: nonEmpty,
      }),
    ),
    cta: z.object({
      eyebrow: nonEmpty,
      heading: nonEmpty,
      lead: opt(z.string()),
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
    categoryLabel: opt(z.string()),
    excerpt: nonEmpty,
    cover: opt(image()),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    tags: list(z.string()),
    year: opt(z.string()),
    url: opt(z.string()),
  });
}

// --- posts ----------------------------------------------------------------

export function makePostSchema(image: ImageResolver = defaultImage) {
  return z.object({
    title: nonEmpty,
    category: nonEmpty,
    excerpt: nonEmpty,
    date: z.coerce.date(),
    /**
     * Diller arası eşleştirme anahtarı. Slug dile göre değişebildiği için
     * (`seo-ve-icerik-pazarlamasi` ↔ `seo-and-content-marketing`) hreflang ve dil
     * değiştirici bu alanla bağ kurar. Verilmezse dosya adı anahtar sayılır.
     */
    translationKey: opt(z.string()),
    cover: opt(image()),
    author: z.string().default('Pixelon'),
    status: z.enum(['draft', 'published']).default('published'),
    featured: z.boolean().default(false),
    seo: opt(seo.partial()),
  });
}

// --- references -----------------------------------------------------------

export function makeReferenceSchema(image: ImageResolver = defaultImage) {
  return z.object({
    name: nonEmpty,
    sector: opt(z.string()),
    logo: image(),
    order: z.number().default(0),
  });
}

// --- team -----------------------------------------------------------------

// --- legal ---------------------------------------------------------------

/**
 * Yasal metin sayfaları (KVKK, gizlilik, çerez, koşullar). `updated` yalnız içerik
 * gerçekten değiştiğinde elle güncellenir — build tarihi DEĞİLDİR.
 */
export const legalSchema = z.object({
  title: z.string().min(1),
  seo: z.object({ title: z.string().min(1), description: z.string().min(1) }),
  /** Başlık altındaki kısa giriş cümlesi. */
  intro: opt(z.string()),
  updated: z.coerce.date(),
});

export function makeTeamSchema(image: ImageResolver = defaultImage) {
  return z.object({
    name: nonEmpty,
    role: nonEmpty,
    photo: opt(image()),
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
  social: list(
    z.object({
      label: nonEmpty,
      short: opt(z.string()),
      url: z.string().regex(URL_RE, 'Geçerli bir bağlantı olmalı.'),
    }),
  ),
  legalLinks: list(
    z.object({
      label: nonEmpty,
      href: nonEmpty,
    }),
  ),
  footerIntro: opt(z.string()),
  copyright: opt(z.string()),
});
