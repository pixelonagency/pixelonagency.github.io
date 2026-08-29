import { z } from 'astro/zod';

import { internalHref } from '../lib/url';

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

/**
 * Bağlantı alanı.
 *
 * Site dizin biçiminde yayınlandığı için kanonik adres sonda eğik çizgi taşır ve
 * sunucu eğik çizgisiz isteği 301 ile oraya götürür. Editör Sveltia'da bağlantıyı
 * hangi biçimde yazarsa yazsın (`/iletisim` ya da `/iletisim/`) çıktı kanonik olur —
 * böylece site içinde tek bir yönlendirme doğmaz. Dış adresler, `mailto:`/`tel:`
 * bağlantıları ve dosya yolları olduğu gibi kalır (bkz. `src/lib/url.ts`).
 */
export const href = z.string().min(1).transform(internalHref);

/** Opsiyonel bağlantı alanı — `null` / `''` "verilmemiş" sayılır. */
export const optHref = opt(href);

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

/**
 * Hero arka plan videosu — public/ altındaki kök-göreli varlık yolları.
 * Masaüstü ve mobil AYRI kompozisyonlardır (crop değil); poster reduced-motion
 * ve ilk boya için kullanılır. Alanlar dile göre değişmez (i18n: duplicate).
 */
export const heroVideoSchema = z.object({
  desktopMp4: nonEmpty,
  desktopWebm: opt(z.string()),
  desktopPoster: opt(z.string()),
  mobileMp4: opt(z.string()),
  mobileWebm: opt(z.string()),
  mobilePoster: opt(z.string()),
});

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
    /** Hero arka plan loop videosu (Pixelon Miniature Digital World). */
    heroVideo: opt(heroVideoSchema),
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
      items: z
        .array(
          z.object({
            title: nonEmpty,
            description: nonEmpty,
            /* İkon verilirse bölüm ikonlu ızgaraya geçer; eksikse klasik kart listesi. */
            icon: opt(z.enum(['team', 'conversion', 'report', 'cycle'])),
            featured: z.boolean().default(false),
          }),
        )
        .min(1),
    }),
    /*
     * Platform/kanal kartları — yalnızca bazı hizmetlerde bulunur.
     * Her girdi bir marka işareti taşır (bkz. PlatformLogo.astro); `featured`
     * olan kart ızgarada iki sütun kaplar.
     */
    platforms: opt(
      z.object({
        eyebrow: nonEmpty,
        heading: nonEmpty,
        lead: opt(z.string()),
        items: z
          .array(
            z.object({
              title: nonEmpty,
              description: nonEmpty,
              logo: opt(z.enum(['google', 'instagram', 'facebook', 'tiktok', 'yandex', 'linkedin', 'snapchat'])),
              featured: z.boolean().default(false),
            }),
          )
          .min(1),
      }),
    ),
    scope: z.object({
      eyebrow: nonEmpty,
      heading: nonEmpty,
      lead: opt(z.string()),
      /* `list` = editoryal satır listesi. Verilmezse klasik kart ızgarası. */
      layout: opt(z.enum(['cards', 'list'])),
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
        items: z
          .array(
            z.object({
              title: nonEmpty,
              description: nonEmpty,
              /* İkon verilirse bölüm ikonlu ızgaraya geçer; eksikse klasik kart listesi. */
              icon: opt(z.enum(['audience', 'strategy', 'creative', 'landing', 'tracking', 'optimize'])),
            }),
          )
          .min(1),
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
              href: optHref,
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
    /*
     * --- Zengin kanıt bölümleri (hepsi opsiyonel) -------------------------
     * Rakip analizi (29 Ağu 2026): "google ads ajansı" sorgusunda 1. sıradaki
     * sayfa 992 kelime, 5. sıradaki 3.157. Uzunluk sıralama getirmiyor. Fark
     * yaratan şey kanıt: sayı, harita, gerçek vaka. Bu üç blok metin yerine
     * kanıt basar; verilmediklerinde sayfa eskisi gibi davranır.
     */
    /** Animasyonlu sayaç bandı — hero'nun hemen altında. */
    stats: opt(
      z.object({
        eyebrow: opt(z.string()),
        heading: opt(z.string()),
        lead: opt(z.string()),
        items: z
          .array(
            z.object({
              value: z.number(),
              prefix: opt(z.string()),
              suffix: opt(z.string()),
              label: nonEmpty,
              description: opt(z.string()),
            }),
          )
          .min(1),
      }),
    ),
    /** Ülke/dil erişimi — bayrak çipli dünya haritası. */
    reach: opt(
      z.object({
        eyebrow: nonEmpty,
        heading: nonEmpty,
        lead: opt(z.string()),
        countries: z
          .array(
            z.object({
              label: nonEmpty,
              flag: nonEmpty,
              highlighted: z.boolean().default(false),
            }),
          )
          .min(1),
      }),
    ),
    /**
     * Görselli vaka vitrini. `projects` alanından farkı: o elle yazılmış kart
     * metnidir, bu ise projects koleksiyonundan kapak görseli ve bağlantısıyla
     * gerçek vaka sayfalarını çeker. `slugs` sırası korunur.
     */
    showcase: opt(
      z.object({
        eyebrow: nonEmpty,
        heading: nonEmpty,
        lead: opt(z.string()),
        slugs: list(z.string()),
        /* Sabit sütun sayısı — verilmezse ızgara kendi doldurur. */
        columns: opt(z.number()),
        ctaLabel: opt(z.string()),
        ctaHref: optHref,
      }),
    ),
    /** Tek konuya odaklanan görselli blok (ör. sağlık turizmi). */
    spotlight: opt(
      z.object({
        eyebrow: opt(z.string()),
        heading: nonEmpty,
        lead: opt(z.string()),
        image: opt(image()),
        alt: opt(z.string()),
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
    seo: opt(seo.partial()),
    /**
     * Case study (detay sayfası) içeriği. Bu alan dolu olan projeler
     * /projelerimiz/<slug> altında kendi sayfasını alır; boş olanlar
     * listede bağlantısız kart olarak kalır (kırık link üretilmez).
     */
    detail: opt(
      z.object({
        /** Hero'daki tek cümlelik konumlama (H1 altı vurgu). */
        intro: nonEmpty,
        /** Hero paragrafı — projenin bağlamı ve hedefi. */
        description: nonEmpty,
        period: opt(z.string()),
        heroImage: opt(image()),
        /** Proje kapsamındaki hizmet çipleri. */
        services: list(z.string()),
        /** Künye şeridi: Müşteri / Hizmetler / Süre / Teslimatlar. */
        meta: list(z.object({ label: nonEmpty, value: nonEmpty })),
        /**
         * Ölçülen sonuç rakamları — sayfada sayaç bloğu olarak vurgulanır.
         *
         * Düzyazının içinde kalan rakam kayboluyordu; ayrı alan olunca hem ekranda
         * öne çıkıyor hem de anlatı metni kısalabiliyor. `value` METİNDİR çünkü biçim
         * projeden projeye değişir: "%25", "9,2M", "2.886", "6". Sayaç animasyonu
         * sayısal çekirdeği kendisi ayıklar; ön/son ek olduğu gibi korunur.
         */
        stats: list(
          z.object({
            value: nonEmpty,
            label: nonEmpty,
            /** Rakamın kapsamı — "ilk yılda", "reklamdan" gibi. */
            note: opt(z.string()),
          }),
        ),
        /** "Neler Yaptık?" — yaklaşım anlatısı (\n\n ile paragraflanır). */
        approach: opt(z.object({ heading: nonEmpty, text: nonEmpty })),
        /** Disiplin bölümleri: başlık + metin + sunum görselleri (+ opsiyonel loop video). */
        sections: list(
          z.object({
            heading: nonEmpty,
            text: nonEmpty,
            images: list(image()),
            /**
             * Sosyal medya videoları — konuşmalı, altyazılı, 30+ saniyelik reel'ler.
             *
             * `video` alanından ayrıdır: o sessiz vitrin döngüsüdür, bunlar TIKLANARAK
             * sesli oynatılır. Otomatik oynatılmaz çünkü uzunlar ve üçü birden döngüye
             * girerse mobilde üç video çözücü aynı anda çalışır. `poster` zorunludur —
             * tıklamadan önce görünen tek şey odur.
             */
            reels: list(
              z.object({
                src: nonEmpty,
                poster: nonEmpty,
                title: nonEmpty,
                /**
                 * Kaynak en-boyu. Verilmezse oynatıcı 9:16 varsayar (dikey sosyal medya
                 * reel'i). Kurgulanmış saha filmleri 16:9 gelebiliyor; sabit çerçeve
                 * onları dikey bir şeride kırpıyordu.
                 */
                width: opt(z.number()),
                height: opt(z.number()),
              }),
            ),
            /**
             * Sessiz vitrin animasyonu (public/ altındaki kök-göreli yollar).
             * Görünür olunca oynar, görünmez olunca durur; reduced-motion'da poster kalır.
             */
            video: opt(
              z.object({
                mp4: nonEmpty,
                webm: opt(z.string()),
                poster: opt(z.string()),
                width: opt(z.number()),
                height: opt(z.number()),
              }),
            ),
          }),
        ),
        /** Kapanış — sonuç/etki anlatısı. */
        result: opt(z.object({ heading: nonEmpty, text: nonEmpty })),
      }),
    ),
  });
}

// --- posts ----------------------------------------------------------------

/**
 * Blog gövdesinin modüler blok sistemi. Sıra CMS'te belirlenir; her blok kendi
 * bileşenine karşılık gelir (`src/components/article/`). Bloklar tek bir yazıya
 * bağlı değildir — sonraki yazılarda farklı sırayla yeniden kullanılır.
 *
 * `type` alanı ayrımlı birlik anahtarıdır: bilinmeyen bir tür sessizce
 * yoksayılmaz, doğrulamada patlar.
 */
function makeArticleBlock(image: ImageResolver) {
  /** Çift satır sonuyla paragraflanan düz metin (markdown değil). */
  const prose = nonEmpty;

  const linkItem = z.object({ label: nonEmpty, href });

  return z.discriminatedUnion('type', [
    /** Ana metin bölümü. `id` içindekiler bağlantısının çıpasıdır. */
    z.object({
      type: z.literal('section'),
      id: nonEmpty,
      heading: nonEmpty,
      /** Başlığın hemen altındaki kısa doğrudan cevap (öne çıkan snippet için). */
      lead: opt(z.string()),
      text: prose,
    }),
    z.object({
      type: z.literal('image'),
      src: image(),
      alt: nonEmpty,
      caption: opt(z.string()),
    }),
    /** Numaralı hizmet/özellik kartları. */
    z.object({
      type: z.literal('cards'),
      heading: opt(z.string()),
      intro: opt(z.string()),
      items: z.array(z.object({ title: nonEmpty, text: prose })).min(1),
    }),
    z.object({
      type: z.literal('callout'),
      variant: opt(z.enum(['note', 'tip'])),
      heading: nonEmpty,
      text: prose,
    }),
    z.object({
      type: z.literal('quote'),
      text: prose,
      cite: opt(z.string()),
    }),
    z.object({
      type: z.literal('checklist'),
      heading: opt(z.string()),
      intro: opt(z.string()),
      items: z.array(z.object({ title: nonEmpty, text: prose })).min(1),
    }),
    /** Karşılaştırma tablosu; ilk kolon kriter sütunudur. */
    z
      .object({
        type: z.literal('table'),
        heading: opt(z.string()),
        intro: opt(z.string()),
        columns: z.array(nonEmpty).min(2),
        rows: z.array(z.array(nonEmpty).min(2)).min(1),
      })
      .superRefine((value, ctx) => {
        const width = value.columns.length;
        value.rows.forEach((row, index) => {
          if (row.length !== width) {
            ctx.addIssue({
              code: 'custom',
              path: ['rows', index],
              message: `Satır ${index + 1} ${row.length} hücre içeriyor; ${width} olmalı (kolon sayısı).`,
            });
          }
        });
      }),
    z.object({
      type: z.literal('process'),
      heading: opt(z.string()),
      intro: opt(z.string()),
      steps: z.array(z.object({ title: nonEmpty, text: prose })).min(1),
    }),
    z.object({
      type: z.literal('chips'),
      heading: opt(z.string()),
      intro: opt(z.string()),
      items: z.array(nonEmpty).min(1),
    }),
    /** Merkez + çevresel düğüm diyagramı; etiketler HTML/SVG olarak basılır. */
    z.object({
      type: z.literal('infographic'),
      heading: opt(z.string()),
      intro: opt(z.string()),
      center: nonEmpty,
      nodes: z.array(nonEmpty).min(3),
    }),
    z.object({
      type: z.literal('faq'),
      heading: opt(z.string()),
      items: z.array(z.object({ question: nonEmpty, answer: prose })).min(1),
    }),
    z.object({
      type: z.literal('cta'),
      heading: nonEmpty,
      text: opt(z.string()),
      primary: linkItem,
      secondary: opt(linkItem),
    }),
  ]);
}

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
    /** Kapak görselinin alt metni; verilmezse başlığa düşer. */
    coverAlt: opt(z.string()),
    author: z.string().default('Pixelon'),
    status: z.enum(['draft', 'published']).default('published'),
    featured: z.boolean().default(false),
    /**
     * Modüler editorial gövde. Dolu olan yazılar blok şablonuyla render edilir;
     * boş olanlar mevcut markdown akışında kalır (geriye dönük uyumlu).
     */
    article: opt(
      z.object({
        /** İçerik gerçekten değiştiğinde elle güncellenir — build tarihi DEĞİLDİR. */
        updated: opt(z.coerce.date()),
        /** Hero'nun altındaki iki kolonlu bandın sol tarafı: doğrudan cevap. */
        quickAnswer: opt(z.object({ heading: nonEmpty, text: nonEmpty })),
        /** İçindekiler başlığı; girdiler `section` bloklarından türetilir. */
        tocHeading: opt(z.string()),
        blocks: list(makeArticleBlock(image)),
        /** İlgili yazılar — diğer post dosyalarının translationKey/slug değerleri. */
        related: list(nonEmpty),
      }),
    ),
    seo: opt(seo.partial()),
  });
}

// --- references -----------------------------------------------------------

export function makeReferenceSchema(image: ImageResolver = defaultImage) {
  return z.object({
    name: nonEmpty,
    sector: opt(z.string()),
    /** Beyaz tonlu şerit logosu — anasayfa marquee'sinde kullanılır. */
    logo: opt(image()),
    /** Renkli marka kartı (kendi zeminiyle) — referans duvarında kullanılır. */
    card: opt(image()),
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
      href,
    }),
  ),
  footerIntro: opt(z.string()),
  copyright: opt(z.string()),
});
