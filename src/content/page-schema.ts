import { z } from 'astro/zod';
import { heroVideoSchema, href, list, opt, optHref, type ImageResolver } from './schemas';

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
  href,
  /** `link` = altı çizili düz bağlantı (referanstaki "Hemen Arayın" gibi). */
  variant: z.enum(['primary', 'outline', 'link']).default('primary'),
  /** Etiketin solunda gösterilen küçük satır içi SVG. */
  icon: opt(z.enum(['whatsapp', 'phone', 'arrow'])),
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
  eyebrow: opt(z.string()),
  anchor: opt(z.string()),
  /**
   * `accent` = tam genişlikte lime zemin. Sayfada nefes aldıran bir duraklama içindir,
   * seyrek kullanılır; üstündeki metin koyu renge döner (bkz. Section.astro).
   */
  background: z.enum(['dark', 'light', 'accent']).default('dark'),
  ctas: list(cta),
};

export function makePageSchema(image: ImageResolver = defaultImage) {
  const hero = z.object({
    ...sectionBase,
    type: z.literal('hero'),
    headingLines: z.array(nonEmpty).min(1),
    lead: opt(z.string()),
    tagline: opt(z.string()),
    breadcrumb: list(z.object({ label: nonEmpty, href: optHref })),
    /** Hero arka plan loop videosu — metnin arkasında, overlay ile. */
    video: opt(heroVideoSchema),
    /** Hero altındaki kısa güven rozetleri ("15+ Yıllık Deneyim" …). */
    chips: list(nonEmpty),
    /**
     * CTA'ların altında duran platform marka işareti şeridi. Metin yerine logo
     * kullanılır: yedi platform adını okumak yerine ziyaretçi onları tanır.
     */
    logos: list(
      z.enum([
        'google',
        'instagram',
        'facebook',
        'tiktok',
        'yandex',
        'linkedin',
        'snapchat',
        'perplexity',
        'searchconsole',
        'analytics',
        'semrush',
        'youtube',
      ]),
    ),
    /** Referans: kariyer gibi bazı alt sayfa hero'ları ortalanmıştır. */
    align: opt(z.enum(['start', 'center'])),
    image: opt(image()),
    imageAlt: opt(z.string()),
  });

  const cards = z.object({
    ...sectionBase,
    type: z.literal('cards'),
    /* Panels varyantında (vizyon/misyon) bölüm başlığı yoktur — bu yüzden opsiyonel. */
    heading: opt(z.string()),
    lead: opt(z.string()),
    columns: opt(z.number()),
    /**
     * `grid` = çerçeveli kart ızgarası (varsayılan). `tinted` = krem dolgulu, çerçevesiz
     * kartlar (değerler). `panels` = üst çizgili açık bloklar; madde eyebrow'u noktalı
     * bölüm eyebrow'u gibi basılır (vizyon/misyon). Alan adı bilinçli olarak `variant`
     * DEĞİL: CMS senkron testi `variant` adını buton görünümü sanıyor.
     */
    kind: opt(z.enum(['grid', 'tinted', 'panels', 'feature', 'ledger', 'audit', 'report'])),
    /** Izgaranın altında yer alan kapanış notu (ör. UX/UI karşılaştırmasındaki bağlayıcı cümle). */
    note: opt(z.string()),
    items: z
      .array(
        z.object({
          eyebrow: opt(z.string()),
          title: nonEmpty,
          description: nonEmpty,
          href: optHref,
          /**
           * Kart ikonu. İlk altısı sektör ikonlarıdır (SectorIcon.astro), son beşi
           * `feature` görünümündeki gerekçe ikonlarıdır (ReasonIcon.astro).
           */
          icon: opt(
            z.enum([
              'health',
              'tourism',
              'ecommerce',
              'construction',
              'sme',
              'education',
              'strategy',
              'bespoke',
              'craft',
              'orbit',
              'partnership',
              'web',
              'seo',
              'ads',
              'social',
              'brand',
              'commerce',
            ]),
          ),
          /** Sürekli (yalnızca hover'da değil) lime çerçeveyle öne çıkarılan kart. */
          featured: opt(z.boolean()),
          /** 1-5 yıldız derecelendirmesi (müşteri yorumu kartlarında). */
          rating: opt(z.number()),
        }),
      )
      .min(1),
  });

  const steps = z.object({
    ...sectionBase,
    type: z.literal('steps'),
    heading: nonEmpty,
    lead: opt(z.string()),
    /**
     * `list` (varsayılan) = numaralı dikey liste. `flow` = lime zeminli panel içinde
     * hafifçe eğik, noktalı çizgilerle bağlanmış numaralı kartlar (Biz Kimiz süreci).
     */
    kind: opt(z.enum(['list', 'flow'])),
    items: z.array(z.object({ title: nonEmpty, description: nonEmpty })).min(1),
  });

  const bullets = z.object({
    ...sectionBase,
    type: z.literal('bullets'),
    heading: nonEmpty,
    lead: opt(z.string()),
    /**
     * `grid` (varsayılan) = numaralı ince çizgili hücre ızgarası. `split` = başlık solda,
     * lime noktalı satır listesi sağda. `check` = lime tikli iki sütunlu kazanım listesi.
     * `tags` = akan büyük etiketler (kimler için uygun). `orbit` = lime çekirdeğin
     * çevresinde dönen etiketli düğümler (360° yaklaşım).
     */
    kind: opt(z.enum(['grid', 'split', 'check', 'tags', 'orbit'])),
    items: z.array(nonEmpty).min(1),
  });

  const marquee = z.object({
    ...sectionBase,
    type: z.literal('marquee'),
    /**
     * `strip` = dekoratif lime kayan yazı şeridi (hero altı). `wordmarks` = düz metin marka
     * isimleri şeridi. Alan adı bilinçli olarak `variant` DEĞİL `kind`: CMS senkron testi
     * `variant` adlı her alanı buton görünümü (primary/outline/link) sanıyor.
     */
    kind: z.enum(['strip', 'wordmarks']).default('strip'),
    heading: opt(z.string()),
    lead: opt(z.string()),
    /** Bir turun kaç saniye süreceği — verilmezse bileşen varyanta göre varsayılan kullanır. */
    speed: opt(z.number()),
    items: z.array(nonEmpty).min(1),
  });

  const worldMap = z.object({
    ...sectionBase,
    type: z.literal('worldMap'),
    heading: nonEmpty,
    lead: opt(z.string()),
    countries: z
      .array(
        z.object({
          label: nonEmpty,
          flag: nonEmpty,
          /** Diğerlerinden ayrışan, sürekli vurgulu çip (ör. "Türkiye"). */
          highlighted: z.boolean().default(false),
          /**
           * Harita pini için enlem/boylam. İKİSİ BİRDEN verilmezse ülke yalnızca
           * çip listesinde görünür, pin çizilmez — bkz. src/lib/map-pins.ts.
           * Avrupa'da birbirine çok yakın ülkelerde pinler üst üste bineceği için
           * koordinat bilerek boş bırakılabilir.
           */
          lat: opt(z.number().min(-90).max(90)),
          lon: opt(z.number().min(-180).max(180)),
        }),
      )
      .min(1),
    /** `*yıldız*` işaretlemesi destekler — bkz. src/lib/highlight.ts. */
    closingLine: opt(z.string()),
    mapImageAlt: opt(z.string()),
  });

  /**
   * Sektör kartları: görselli, üstünde sektör adı olan ızgara. `sectors.items`
   * verilmediğinde bu bölüm hiç üretilmez ve sayfa eskisi gibi düz metin
   * bölümü gösterir — bkz. src/lib/service-sections.ts.
   */
  const sectorCards = z.object({
    ...sectionBase,
    type: z.literal('sectorCards'),
    heading: nonEmpty,
    body: opt(z.string()),
    cards: z
      .array(
        z.object({
          label: nonEmpty,
          /*
           * `image()` ile çözümlenir, düz string DEĞİL: bileşen görseli
           * `<Image />` ile basıyor ve ham yol verilince kart sessizce boş
           * çıkıyordu (hizmet şemasındaki karşılığı da `image()`).
           */
          image: image(),
          alt: opt(z.string()),
        }),
      )
      .min(1),
  });

  /**
   * Kayan iş şeridi — müşteri sitelerinin cihaz mockup'ları, her biri kendi
   * vaka sayfasına bağlı. Kesintisiz döngü için liste iki kez basılır.
   */
  const showreel = z.object({
    ...sectionBase,
    type: z.literal('showreel'),
    heading: opt(z.string()),
    variant: opt(z.enum(['wide', 'square', 'reel'])),
    items: z
      .array(
        z.object({
          label: nonEmpty,
          image: z.string(),
          alt: opt(z.string()),
          href: nonEmpty,
          video: opt(z.string()),
        }),
      )
      .min(2),
  });

  const text = z.object({
    ...sectionBase,
    type: z.literal('text'),
    heading: opt(z.string()),
    body: nonEmpty,
    /** Gövdeden sonra gelen vurgulu alıntı satırı. */
    highlight: opt(z.string()),
    /**
     * Referans tasarımdaki üç metin düzeni:
     * `stack` (varsayılan) = başlık üstte, gövde altta.
     * `split` = başlık solda sticky, paragraflar sağda; `highlight` 20px kapanış satırı.
     * `center` = ortalanmış blok; `highlight` büyük (lime vurgulu) kapanış cümlesi.
     */
    layout: opt(z.enum(['stack', 'split', 'center'])),
    image: opt(image()),
    imageAlt: opt(z.string()),
  });

  const stats = z.object({
    ...sectionBase,
    type: z.literal('stats'),
    heading: opt(z.string()),
    lead: opt(z.string()),
    items: z
      .array(
        z.object({
          // Sayaç animasyonu 0'dan bu değere sayar — bu yüzden sayı olmak zorunda.
          value: z.number(),
          prefix: opt(z.string()),
          suffix: opt(z.string()),
          label: nonEmpty,
          /** Etiketin altındaki açıklama paragrafı. */
          description: opt(z.string()),
        }),
      )
      .min(1),
  });

  const faq = z.object({
    ...sectionBase,
    type: z.literal('faq'),
    heading: nonEmpty,
    lead: opt(z.string()),
    items: z.array(z.object({ question: nonEmpty, answer: nonEmpty })).min(1),
  });

  const ctaSection = z.object({
    ...sectionBase,
    type: z.literal('cta'),
    heading: nonEmpty,
    lead: opt(z.string()),
    /* classic: mevcut koyu kapanış bloğu · spot: lime zeminli yüksek-dikkat panel. */
    kind: opt(z.enum(['classic', 'spot'])),
    // `ctas` sectionBase'ten gelir.
  });

  /*
   * Reklam platformları — kart listesinden ayrı bir tip, çünkü her girdi bir
   * marka işareti taşır ve ızgara asimetriktir. `featured` olan kart iki sütun
   * kaplar: Google ve Instagram ölçülen talebin %91'ini oluşturuyor, düzen de
   * bunu yansıtır.
   */
  const platforms = z.object({
    ...sectionBase,
    type: z.literal('platforms'),
    heading: nonEmpty,
    lead: opt(z.string()),
    items: z
      .array(
        z.object({
          title: nonEmpty,
          description: nonEmpty,
          logo: z.enum([
            'google',
            'instagram',
            'facebook',
            'tiktok',
            'yandex',
            'linkedin',
            'snapchat',
            'perplexity',
            'searchconsole',
            'analytics',
            'semrush',
            'youtube',
          ]),
          featured: z.boolean().default(false),
        }),
      )
      .min(1),
  });

  /*
   * Reklam yönetimi ilkeleri — kart listesinden ayrı tip, çünkü her girdi bir
   * çizgi ikon taşır ve kart üzerine gelindiğinde ikon kendini çizer.
   */
  const principles = z.object({
    ...sectionBase,
    type: z.literal('principles'),
    heading: nonEmpty,
    lead: opt(z.string()),
    items: z
      .array(
        z.object({
          title: nonEmpty,
          description: nonEmpty,
          icon: z.enum(['audience', 'strategy', 'creative', 'landing', 'tracking', 'optimize']),
        }),
      )
      .min(1),
  });

  /*
   * "Neden Pixelon?" — kart listesinden ayrı tip: her kart farklı bir ikon
   * muamelesi alır (dolu daire, beyaz panel, çıplak glif, katman rozeti) ve
   * bölümde markaya gönderme yapan piksel imleç bulunur.
   */
  const why = z.object({
    ...sectionBase,
    type: z.literal('why'),
    heading: nonEmpty,
    lead: opt(z.string()),
    items: z
      .array(
        z.object({
          title: nonEmpty,
          description: nonEmpty,
          icon: z.enum(['team', 'conversion', 'report', 'cycle']),
          featured: z.boolean().default(false),
        }),
      )
      .min(1),
  });

  /*
   * Hizmet kapsamı — kart ızgarası değil editoryal satır listesi. Sayfada
   * zaten birden çok kart ızgarası olduğunda kapsamı da ızgara yapmak tekrara
   * sokuyordu; satır listesi hem farklı bir form hem de uzun kalem listelerini
   * daha az yer kaplayarak taşır.
   */
  const scope = z.object({
    ...sectionBase,
    type: z.literal('scope'),
    heading: nonEmpty,
    lead: opt(z.string()),
    items: z.array(z.object({ title: nonEmpty, description: nonEmpty })).min(1),
  });

  /*
   * Süreç — hizalı adım ızgarası değil dağınık kart dizilimi. Her kart bir
   * arayüz penceresi gibi okunur (pencere noktaları, /01 numarası) ve başlık
   * fosforlu kalemle vurgulanır.
   */
  const process = z.object({
    ...sectionBase,
    type: z.literal('process'),
    heading: nonEmpty,
    lead: opt(z.string()),
    items: z
      .array(
        z.object({
          title: nonEmpty,
          description: nonEmpty,
          icon: z.enum(['discover', 'plan', 'build', 'launch', 'optimize', 'measure']),
        }),
      )
      .min(1),
  });

  const logos = z.object({
    ...sectionBase,
    type: z.literal('logos'),
    heading: opt(z.string()),
    lead: opt(z.string()),
    /**
     * `marquee` = akan beyaz-ton logo şeridi (varsayılan, anasayfa).
     * `wall` = renkli marka kartlarından ızgara (referanslar sayfası; `card`
     * alanı dolu girdileri basar).
     */
    kind: opt(z.enum(['marquee', 'wall'])),
  });

  const projects = z.object({
    /* Board hero'sunun arkasında dönen sessiz döngü — HeroSection ile aynı şema. */
    video: opt(heroVideoSchema),
    ...sectionBase,
    type: z.literal('projects'),
    heading: nonEmpty,
    lead: opt(z.string()),
    /* Hero altı küçük metadata satırı (yalnız board görünümünde kullanılır). */
    tagline: opt(z.string()),
    limit: opt(z.number()),
    /**
     * Belirli projeleri, verilen sırayla göster. Hizmet sayfaları bunu kullanır:
     * reklam sayfasında yalnızca reklam işi yapılan vakalar çıkmalı, tüm portföy
     * değil. Boş bırakılırsa koleksiyonun tamamı sıralanır (ana sayfa davranışı).
     */
    slugs: opt(list(z.string())),
    /**
     * Sabit sütun sayısı. Verilmezse ızgara `auto-fit` ile kendi doldurur.
     * Az sayıda vakayı geniş göstermek isteyen bölümler bunu 2 verir.
     */
    columns: opt(z.number()),
    showFilters: z.boolean().default(false),
    /* grid: mevcut kompakt liste (ana sayfa) · board: tam sayfa editoryal vitrin. */
    kind: z.enum(['grid', 'board']).default('grid'),
    ctaLabel: opt(z.string()),
    ctaHref: optHref,
  });

  const posts = z.object({
    ...sectionBase,
    type: z.literal('posts'),
    heading: nonEmpty,
    lead: opt(z.string()),
    limit: opt(z.number()),
    ctaLabel: opt(z.string()),
    ctaHref: optHref,
  });

  /**
   * Öne çıkan tek yazı kartı. Başlık, özet, tarih, okuma süresi ve kapak
   * KOLEKSİYONDAN gelir — bu bölümde elle metin alanı YOKTUR. Aksi hâlde
   * kartın anlattığı yazı ile açtığı yazı zamanla ayrışıyor.
   *
   * `slug` verilirse o yazı sabitlenir; verilmezse `featured: true` olan en
   * yeni yazı, o da yoksa genel olarak en yeni yazı gösterilir.
   */
  const featuredPost = z.object({
    ...sectionBase,
    type: z.literal('featuredPost'),
    slug: opt(z.string()),
    ctaLabel: opt(z.string()),
  });

  const team = z.object({
    ...sectionBase,
    type: z.literal('team'),
    heading: nonEmpty,
    lead: opt(z.string()),
  });

  const services = z.object({
    ...sectionBase,
    type: z.literal('services'),
    heading: nonEmpty,
    lead: opt(z.string()),
    limit: opt(z.number()),
    /**
     * `rows` (varsayılan) = koleksiyondan beslenen numaralı satır listesi.
     * `showcase` = ana sayfadaki 6'lı editoryal kart vitrini — kartlar `items`ten gelir,
     * her kart kendi hizmet detayına bağlanır. Alan adı bilinçli olarak `variant` değil.
     */
    kind: opt(z.enum(['rows', 'showcase'])),
    /** Showcase kartları. `service` = bu dildeki hizmet slug'ı (detay sayfası bağlantısı). */
    items: list(
      z.object({
        service: nonEmpty,
        title: nonEmpty,
        description: nonEmpty,
        image: opt(image()),
        imageAlt: opt(z.string()),
      }),
    ),
  });

  const form = z.object({
    ...sectionBase,
    type: z.literal('form'),
    heading: nonEmpty,
    lead: opt(z.string()),
    formId: z.enum(['contact', 'analysis']),
    submitLabel: opt(z.string()),
    /** Gönderim başarılı olduğunda formun yerine geçen panel. */
    successHeading: opt(z.string()),
    successBody: opt(z.string()),
    successNote: opt(z.string()),
    successCtas: list(cta),
    /** Gönderim başarısız olduğunda formun üstünde gösterilen uyarı. */
    errorHeading: opt(z.string()),
    errorBody: opt(z.string()),
  });

  /**
   * İletişim bölümünün referanstaki gibi TEK, iki sütunlu blok halinde basılması için:
   * sol sütun (metin + iletişim bilgileri) + sağ sütun (form), aynı görsel çerçeve içinde.
   * `cta`/`contactInfo`/`form` tipleri başka sayfalarda (ör. /iletisim) bağımsız olarak
   * kullanıldığı için DOKUNULMAZ — bu, yalnızca birleşik blok gereken sayfalar içindir.
   */
  const contact = z.object({
    ...sectionBase,
    type: z.literal('contact'),
    heading: nonEmpty,
    lead: opt(z.string()),
    contactItems: z.array(z.object({ label: nonEmpty, value: nonEmpty, href: optHref })).min(1),
    formHeading: nonEmpty,
    formLead: opt(z.string()),
    formId: z.enum(['contact', 'analysis']),
    submitLabel: opt(z.string()),
    successHeading: opt(z.string()),
    successBody: opt(z.string()),
    successNote: opt(z.string()),
    successCtas: list(cta),
    errorHeading: opt(z.string()),
    errorBody: opt(z.string()),
  });

  const contactInfo = z.object({
    ...sectionBase,
    type: z.literal('contactInfo'),
    heading: opt(z.string()),
    lead: opt(z.string()),
    items: z
      .array(
        z.object({
          label: nonEmpty,
          /*
           * İlk satır kanalın kendisidir (numara, adres, şehir); varsa sonraki
           * satırlar açıklamadır. Bölüm bunu ayrı tipografiyle basar, bu yüzden
           * açıklama için ayrı bir alan tutulmuyor.
           */
          value: nonEmpty,
          href: optHref,
          /** Kanal ikonu — bkz. ContactIcon.astro. Verilmezse madde ikonsuz basılır. */
          icon: opt(z.enum(['whatsapp', 'phone', 'mail', 'location', 'social'])),
        }),
      )
      .min(1),
  });

  const media = z.object({
    ...sectionBase,
    type: z.literal('media'),
    heading: opt(z.string()),
    lead: opt(z.string()),
    image: opt(image()),
    video: opt(z.string()),
    alt: opt(z.string()),
  });

  const jobs = z.object({
    ...sectionBase,
    type: z.literal('jobs'),
    heading: nonEmpty,
    lead: opt(z.string()),
    items: z
      .array(
        z.object({
          title: nonEmpty,
          location: opt(z.string()),
          employmentType: opt(z.string()),
          description: nonEmpty,
          href: optHref,
        }),
      )
      .min(1),
  });

  const section = z.discriminatedUnion('type', [
    hero,
    cards,
    steps,
    bullets,
    marquee,
    worldMap,
    sectorCards,
    showreel,
    platforms,
    principles,
    why,
    scope,
    process,
    text,
    stats,
    faq,
    ctaSection,
    logos,
    projects,
    posts,
    featuredPost,
    team,
    services,
    form,
    contact,
    contactInfo,
    media,
    jobs,
  ]);

  return z.object({
    seo: z.object({ title: nonEmpty, description: nonEmpty }),
    whatsappMessage: opt(z.string()),
    sections: list(section),
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
  'marquee',
  'worldMap',
  'sectorCards',
  'showreel',
  'platforms',
  'principles',
  'why',
  'scope',
  'process',
  'text',
  'stats',
  'faq',
  'cta',
  'logos',
  'projects',
  'posts',
  'featuredPost',
  'team',
  'services',
  'form',
  'contact',
  'contactInfo',
  'media',
  'jobs',
] as const satisfies readonly PageSectionType[];

// Ters yön: birleşime yeni bir bölüm eklenip listeye eklenmezse burada tip hatası oluşur.
type _MissingFromList = Exclude<PageSectionType, (typeof PAGE_SECTION_TYPES)[number]>;
const _exhaustive: _MissingFromList extends never ? true : false = true;
void _exhaustive;
