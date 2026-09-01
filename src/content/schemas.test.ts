import { describe, expect, test } from 'bun:test';
import {
  href,
  optHref,
  makePostSchema,
  makeProjectSchema,
  makeReferenceSchema,
  makeServiceSchema,
  makeTeamSchema,
  settingsSchema,
} from './schemas';

const serviceSchema = makeServiceSchema();
const projectSchema = makeProjectSchema();
const postSchema = makePostSchema();
const referenceSchema = makeReferenceSchema();
const teamSchema = makeTeamSchema();

const validService = {
  title: 'SEO ve İçerik Pazarlaması',
  navLabel: 'SEO ve İçerik Pazarlaması',
  order: 4,
  seo: { title: 'SEO ve İçerik Pazarlaması | Pixelon', description: 'Teknik SEO ve içerik.' },
  hero: {
    eyebrow: 'SEO ve İçerik Pazarlaması',
    headingLines: ["SEO Uyumlu İçeriklerle Google'da", 'Zirveye Çıkın.'],
    lead: 'Teknik SEO, anahtar kelime analizi ve kullanıcı odaklı içerikler.',
    tagline: 'Doğru aramalarda, doğru içeriklerle.',
    whatsappMessage: 'Merhaba Pixelon, SEO hizmeti hakkında bilgi almak istiyorum.',
  },
  why: {
    eyebrow: 'Neden Pixelon?',
    heading: 'Görünürlükten Daha Fazlasını Hedefliyoruz',
    lead: 'SEO çalışmalarını yalnızca üst sıra olarak görmüyoruz.',
    items: [{ title: 'Google Odaklı SEO', description: 'Sürdürülebilir yol haritası.' }],
  },
  scope: {
    eyebrow: 'Hizmet Kapsamı',
    heading: 'Organik Büyüme İçin Bütüncül SEO Çözümleri',
    items: [{ title: 'SEO Analizi', description: 'Teknik yapı analizi.' }],
  },
  process: {
    eyebrow: 'SEO Sürecimiz Nasıl İşler?',
    heading: 'Analizden Sürdürülebilir Büyümeye',
    steps: [{ title: 'Analiz ve Keşif', description: 'Web sitenizi inceliyoruz.' }],
  },
  value: {
    eyebrow: 'SEO Neden Önemlidir?',
    heading: 'Reklam Bütçesine Bağımlı Olmadan Görünürlük',
    lead: 'SEO markanızı doğru anda gösterir.',
    bullets: ["Google'daki görünürlüğünüzü artırabilirsiniz."],
  },
  sectors: {
    eyebrow: 'Sektör Deneyimimiz',
    heading: 'Hangi Sektörlerle Çalışıyoruz?',
    body: 'Sağlık, e-ticaret, inşaat.',
  },
  cta: {
    eyebrow: "Markanızı Google'da Öne Çıkaralım",
    heading: 'Daha Fazla Organik Trafik Almaya Hazır mısınız?',
    lead: 'Pixelon ekibiyle iletişime geçin.',
  },
  faq: {
    eyebrow: 'Merak Edilenler',
    heading: 'SEO Hakkında Sıkça Sorulan Sorular',
    items: [{ question: 'Ne kadar sürede sonuç verir?', answer: 'Uzun vadeli bir çalışmadır.' }],
  },
};

describe('serviceSchema', () => {
  test('accepts a fully populated service entry', () => {
    expect(serviceSchema.safeParse(validService).success).toBe(true);
  });

  test('rejects a service without a hero section', () => {
    const { hero: _hero, ...withoutHero } = validService;
    expect(serviceSchema.safeParse(withoutHero).success).toBe(false);
  });

  test('rejects a hero whose heading has no lines', () => {
    const broken = { ...validService, hero: { ...validService.hero, headingLines: [] } };
    expect(serviceSchema.safeParse(broken).success).toBe(false);
  });

  test('rejects a FAQ item missing its answer', () => {
    const broken = {
      ...validService,
      faq: { ...validService.faq, items: [{ question: 'Soru?' }] },
    };
    expect(serviceSchema.safeParse(broken).success).toBe(false);
  });

  test('treats the optional projects showcase as absent-friendly', () => {
    expect(serviceSchema.safeParse(validService).success).toBe(true);
  });

  test('keeps an optional projects showcase when supplied', () => {
    const parsed = serviceSchema.parse({
      ...validService,
      projects: {
        eyebrow: 'Projeler',
        heading: 'Değer Kattık',
        lead: 'Markalar.',
        items: [{ eyebrow: 'SEO', title: 'Dentasay', description: 'Çok dilli SEO.' }],
      },
    });
    expect(parsed.projects?.items[0]?.title).toBe('Dentasay');
  });

  test('defaults order to 0 when omitted', () => {
    const { order: _order, ...withoutOrder } = validService;
    expect(serviceSchema.parse(withoutOrder).order).toBe(0);
  });

  // Bazı hizmet sayfalarında bulunan, hepsinde bulunmayan ek bölümler. Şemada tanımlı
  // olmazlarsa zod bunları SESSİZCE siler ve içerik build'de kaybolur — bu yüzden her biri
  // ayrı ayrı doğrulanır.
  test('keeps the optional intro section instead of stripping it', () => {
    const parsed = serviceSchema.parse({
      ...validService,
      intro: {
        eyebrow: 'Sadece Görünür Olmak Yetmez',
        heading: 'Markanızın Hatırlanmasını Sağlıyoruz',
        body: 'İlk paragraf.\n\nİkinci paragraf.',
        highlight: 'Amacımız gerçek bağ kuran bir topluluk oluşturmaktır.',
      },
    });
    expect(parsed.intro?.highlight).toBe('Amacımız gerçek bağ kuran bir topluluk oluşturmaktır.');
  });

  test('keeps the optional platforms section', () => {
    const parsed = serviceSchema.parse({
      ...validService,
      platforms: {
        eyebrow: 'Platform Deneyimimiz',
        heading: 'Her Platforma Uygun İçerik',
        items: [{ title: 'Instagram', description: 'Görsel odaklı içerik.' }],
      },
    });
    expect(parsed.platforms?.items).toHaveLength(1);
  });

  test('keeps the optional principles section', () => {
    const parsed = serviceSchema.parse({
      ...validService,
      principles: {
        eyebrow: 'Neye Önem Veriyoruz?',
        heading: 'Estetikten Önce Anlam',
        items: [{ title: 'Özgünlük', description: 'Markaya özel tasarım.' }],
      },
    });
    expect(parsed.principles?.items[0]?.title).toBe('Özgünlük');
  });

  test('keeps the optional contentTypes section, whose items are plain strings', () => {
    const parsed = serviceSchema.parse({
      ...validService,
      contentTypes: {
        eyebrow: 'Ürettiğimiz İçerikler',
        heading: 'Hangi Video İçeriklerini Üretiyoruz?',
        items: ['Tanıtım Filmi', 'Reels / TikTok Videoları'],
      },
    });
    expect(parsed.contentTypes?.items).toEqual(['Tanıtım Filmi', 'Reels / TikTok Videoları']);
  });

  test('keeps the optional comparison section together with its closing note', () => {
    const parsed = serviceSchema.parse({
      ...validService,
      comparison: {
        eyebrow: 'UX ve UI Arasındaki Fark Nedir?',
        heading: 'İkisini Birlikte Ele Alıyoruz.',
        items: [
          { title: 'UX — Kullanıcı Deneyimi', description: 'Akış ve kullanılabilirlik.' },
          { title: 'UI — Kullanıcı Arayüzü', description: 'Görsel dil ve bileşenler.' },
        ],
        note: 'UX ve UI birlikte planlanmalıdır.',
      },
    });
    expect(parsed.comparison?.note).toBe('UX ve UI birlikte planlanmalıdır.');
  });

  test('accepts a service that has no value section at all', () => {
    const { value: _value, ...withoutValue } = validService;
    expect(serviceSchema.safeParse(withoutValue).success).toBe(true);
  });
});

describe('projectSchema', () => {
  const validProject = {
    title: 'Dentasay',
    client: 'Dentasay',
    category: 'saglik-turizmi',
    excerpt: 'Çok dilli sağlık turizmi SEO çalışması.',
    cover: 'src/assets/images/dentasay.webp',
  };

  test('accepts a minimal valid project', () => {
    expect(projectSchema.safeParse(validProject).success).toBe(true);
  });

  /*
   * Sonuç rakamları (`detail.stats`) düzyazının içinde kayboluyordu. Ayrı bir alan
   * olarak tutulur ki sayfada sayaç bloğu olarak vurgulanabilsin ve metin kısalabilsin.
   * `value` metindir çünkü biçim değişiyor: "%25", "9,2M", "2.886", "6".
   */
  test('detail.stats verilebilir', () => {
    const parsed = projectSchema.safeParse({
      ...validProject,
      detail: {
        intro: 'Kısa konumlama.',
        description: 'Bağlam.',
        stats: [
          { value: '%25', label: 'hasta artışı', note: 'ilk yılda' },
          { value: '9,2M', label: 'içerik görüntülenmesi' },
        ],
      },
    });
    expect(parsed.success).toBe(true);
  });

  test('stats verilmezse boş dizi olur — çağıran taraf kontrol etmek zorunda kalmaz', () => {
    const parsed = projectSchema.safeParse({
      ...validProject,
      detail: { intro: 'Kısa konumlama.', description: 'Bağlam.' },
    });
    expect(parsed.success && parsed.data.detail?.stats).toEqual([]);
  });

  /*
   * Sosyal medya videoları bölüm içinde gösterilir. Mevcut `video` alanı sessiz
   * vitrin döngüsü içindir; bunlar konuşmalı, altyazılı ve 30+ saniyelik reel'ler —
   * poster üzerinden tıklanarak sesli oynatılır. Bu yüzden ayrı alan.
   */
  test('bölüme reels verilebilir', () => {
    const parsed = projectSchema.safeParse({
      ...validProject,
      detail: {
        intro: 'Kısa konumlama.',
        description: 'Bağlam.',
        sections: [
          {
            heading: 'Sosyal Medya',
            text: 'Metin.',
            reels: [{ src: '/media/a.mp4', poster: '/media/a.webp', title: 'Cilt bariyeri' }],
          },
        ],
      },
    });
    expect(parsed.success).toBe(true);
  });

  /*
   * Yatay reel: kaynak 16:9 olabiliyor (kurgulanmış saha filmi). Oynatıcı çerçevesi
   * 9:16 sabitlenirse yatay film dikey bir şeride kırpılıyor — en-boy içerikten gelmeli.
   */
  test('reel en-boy oranı width/height ile verilebilir', () => {
    const parsed = projectSchema.safeParse({
      ...validProject,
      detail: {
        intro: 'Kısa konumlama.',
        description: 'Bağlam.',
        sections: [
          {
            heading: 'Video',
            text: 'Metin.',
            reels: [{ src: '/media/a.mp4', poster: '/media/a.webp', title: 'Saha filmi', width: 1920, height: 1080 }],
          },
        ],
      },
    });
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.detail?.sections[0]?.reels[0]?.width).toBe(1920);
    expect(parsed.success && parsed.data.detail?.sections[0]?.reels[0]?.height).toBe(1080);
  });

  test('reels verilmezse boş dizi olur', () => {
    const parsed = projectSchema.safeParse({
      ...validProject,
      detail: {
        intro: 'Kısa konumlama.',
        description: 'Bağlam.',
        sections: [{ heading: 'Sosyal Medya', text: 'Metin.' }],
      },
    });
    expect(parsed.success && parsed.data.detail?.sections[0]?.reels).toEqual([]);
  });

  test('posteri olmayan reel reddedilir — poster zorunlu, tıklamadan önce görünen o', () => {
    const parsed = projectSchema.safeParse({
      ...validProject,
      detail: {
        intro: 'Kısa konumlama.',
        description: 'Bağlam.',
        sections: [{ heading: 'Sosyal Medya', text: 'Metin.', reels: [{ src: '/media/a.mp4', title: 'X' }] }],
      },
    });
    expect(parsed.success).toBe(false);
  });

  test('değeri boş olan istatistik reddedilir', () => {
    const parsed = projectSchema.safeParse({
      ...validProject,
      detail: {
        intro: 'Kısa konumlama.',
        description: 'Bağlam.',
        stats: [{ value: '', label: 'hasta artışı' }],
      },
    });
    expect(parsed.success).toBe(false);
  });

  test('defaults featured to false', () => {
    expect(projectSchema.parse(validProject).featured).toBe(false);
  });

  test('defaults tags to an empty array', () => {
    expect(projectSchema.parse(validProject).tags).toEqual([]);
  });

  test('rejects a project with no category', () => {
    const { category: _c, ...noCategory } = validProject;
    expect(projectSchema.safeParse(noCategory).success).toBe(false);
  });
});

describe('translationKey — diller arası eşleştirme', () => {
  test('hizmet, slug’dan bağımsız bir çeviri anahtarı taşıyabilir', () => {
    const parsed = serviceSchema.parse({ ...validService, translationKey: 'seo' });
    expect(parsed.translationKey).toBe('seo');
  });

  test('verilmezse tanımsız kalır — dosya adı anahtar sayılır', () => {
    expect(serviceSchema.parse(validService).translationKey).toBeUndefined();
  });
});

describe('postSchema', () => {
  const validPost = {
    title: 'SEO Nedir?',
    category: 'SEO',
    excerpt: 'Arama motoru optimizasyonuna giriş.',
    date: '2026-03-14',
  };

  test('accepts a minimal valid post', () => {
    expect(postSchema.safeParse(validPost).success).toBe(true);
  });

  test('coerces an ISO date string into a Date instance', () => {
    expect(postSchema.parse(validPost).date).toBeInstanceOf(Date);
  });

  test('defaults status to published', () => {
    expect(postSchema.parse(validPost).status).toBe('published');
  });

  test('rejects an unknown status value', () => {
    expect(postSchema.safeParse({ ...validPost, status: 'archived' }).success).toBe(false);
  });

  test('accepts the draft status', () => {
    expect(postSchema.parse({ ...validPost, status: 'draft' }).status).toBe('draft');
  });

  /**
   * `article` dolu olan yazılar modüler editorial şablonla render edilir; boş
   * olanlar markdown gövdesine düşer. Blok dizisi CMS'te sıralanabilir olduğu
   * için ayrımlı birlik (discriminated union) olarak doğrulanır.
   */
  describe('article blocks', () => {
    const withBlocks = (blocks: unknown[]) => ({ ...validPost, article: { blocks } });

    test('a post without an article still validates', () => {
      expect(postSchema.parse(validPost).article).toBeUndefined();
    });

    test('accepts an empty block list', () => {
      expect(postSchema.safeParse(withBlocks([])).success).toBe(true);
    });

    test('accepts a section block and keeps its anchor id', () => {
      const parsed = postSchema.parse(
        withBlocks([{ type: 'section', id: 'nedir', heading: 'Nedir?', text: 'Bir paragraf.' }]),
      );
      expect(parsed.article?.blocks[0]).toMatchObject({ type: 'section', id: 'nedir' });
    });

    test('rejects a block whose type is unknown', () => {
      expect(postSchema.safeParse(withBlocks([{ type: 'carousel', text: 'x' }])).success).toBe(false);
    });

    test('rejects a section block without a heading', () => {
      expect(postSchema.safeParse(withBlocks([{ type: 'section', id: 'a', text: 'x' }])).success).toBe(false);
    });

    test('accepts each remaining block type', () => {
      const blocks = [
        { type: 'image', src: '/src/assets/x.webp', alt: 'Görsel' },
        { type: 'cards', items: [{ title: 'Strateji', text: 'Analiz yapılır.' }] },
        { type: 'callout', heading: 'Pixelon Notu', text: 'Kısa not.' },
        { type: 'quote', text: 'Alıntı.' },
        { type: 'checklist', items: [{ title: 'Referanslar', text: 'İncelenebiliyor mu?' }] },
        { type: 'table', columns: ['Kriter', 'A', 'B'], rows: [['Maliyet', 'x', 'y']] },
        { type: 'process', steps: [{ title: 'Analiz', text: 'Hesaplar incelenir.' }] },
        { type: 'chips', items: ['Instagram', 'TikTok'] },
        { type: 'infographic', center: 'Ajans Yönetimi', nodes: ['Strateji', 'İçerik', 'Reklam'] },
        { type: 'faq', items: [{ question: 'Soru?', answer: 'Cevap.' }] },
        { type: 'cta', heading: 'Başlık', text: 'Metin.', primary: { label: 'Git', href: '/iletisim' } },
      ];
      const result = postSchema.safeParse(withBlocks(blocks));
      expect(result.success ? [] : result.error.issues).toEqual([]);
    });

    test('rejects a table whose row width does not match the columns', () => {
      const bad = withBlocks([{ type: 'table', columns: ['A', 'B'], rows: [['tek']] }]);
      expect(postSchema.safeParse(bad).success).toBe(false);
    });

    test('accepts the null the CMS writes for an untouched article group', () => {
      expect(postSchema.safeParse({ ...validPost, article: null }).success).toBe(true);
    });
  });
});

describe('settingsSchema', () => {
  const validSettings = {
    phone: '+90 506 522 90 34',
    email: 'info@pixelon.com.tr',
    address: 'Kadıköy, İstanbul',
    whatsapp: { number: '905065229034', defaultMessage: 'Merhaba Pixelon' },
    social: [{ label: 'Instagram', short: 'IG', url: 'https://instagram.com/pixelon' }],
  };

  test('accepts a fully populated settings singleton', () => {
    expect(settingsSchema.safeParse(validSettings).success).toBe(true);
  });

  test('rejects settings without a WhatsApp number', () => {
    const broken = { ...validSettings, whatsapp: { defaultMessage: 'Merhaba' } };
    expect(settingsSchema.safeParse(broken).success).toBe(false);
  });

  test('rejects a malformed contact e-mail', () => {
    expect(settingsSchema.safeParse({ ...validSettings, email: 'info-at-pixelon' }).success).toBe(false);
  });

  test('defaults social links to an empty list', () => {
    const { social: _s, ...noSocial } = validSettings;
    expect(settingsSchema.parse(noSocial).social).toEqual([]);
  });
});

describe('serviceSchema — menü alanları', () => {
  const base = validService;

  test('menu alanı verilmezse hizmet menüde görünür sayılır', () => {
    expect(serviceSchema.parse(base).menu).toBe(true);
  });

  test('menu: false ile hizmet menüden çıkarılabilir — sayfası yerinde kalır', () => {
    expect(serviceSchema.parse({ ...base, menu: false }).menu).toBe(false);
  });

  test('kart özeti opsiyoneldir — özeti olmayan hizmet şemayı kırmaz', () => {
    expect(serviceSchema.parse(base).summary).toBeUndefined();
  });

  test('kart özeti verilince korunur', () => {
    const parsed = serviceSchema.parse({ ...base, summary: 'Hızlı ve dönüşüm odaklı siteler.' });
    expect(parsed.summary).toBe('Hızlı ve dönüşüm odaklı siteler.');
  });
});

describe('referenceSchema', () => {
  test('accepts a client reference with a logo', () => {
    const parsed = referenceSchema.parse({
      name: 'Opet',
      sector: 'Enerji',
      logo: 'src/assets/client-logos/opet-logo.webp',
    });
    expect(parsed.name).toBe('Opet');
  });

  test('accepts a wall-only reference (mark without a strip logo)', () => {
    // Şerit logosu olmayan marka marquee'de yer almaz ama tek renk maskesi varsa duvarda basılır.
    const parsed = referenceSchema.parse({ name: 'TEB', mark: 'src/assets/client-logos/marks/teb-mark.webp' });
    expect(parsed.mark).toBe('src/assets/client-logos/marks/teb-mark.webp');
  });

  test('keeps every asset field optional — eksik görselli marka şemayı kırmaz', () => {
    const parsed = referenceSchema.parse({ name: 'Sekoya' });
    expect(parsed.mark).toBeUndefined();
    expect(parsed.logo).toBeUndefined();
  });

  test('rejects a reference with no name', () => {
    expect(referenceSchema.safeParse({ sector: 'Enerji' }).success).toBe(false);
  });
});

describe('teamSchema', () => {
  test('accepts a team member', () => {
    expect(teamSchema.safeParse({ name: 'Fatih', role: 'Kurucu', order: 1 }).success).toBe(true);
  });

  test('rejects a team member with no role', () => {
    expect(teamSchema.safeParse({ name: 'Fatih' }).success).toBe(false);
  });
});

describe('bağlantı alanları — kanonik biçim', () => {
  /**
   * CMS editörü bağlantıyı `/iletisim` diye yazar; site dizin biçiminde yayınlandığı
   * için sunucu bunu `/iletisim/` adresine 301 ile taşır. Normalizasyon şema
   * seviyesinde yapılır: editör hangi biçimde yazarsa yazsın çıktı kanoniktir.
   */
  test('site içi bağlantı sonuna eğik çizgi alır', () => {
    expect(href.parse('/iletisim')).toBe('/iletisim/');
    expect(href.parse('/hizmetlerimiz/seo-ve-icerik-pazarlamasi')).toBe('/hizmetlerimiz/seo-ve-icerik-pazarlamasi/');
    expect(href.parse('/projelerimiz#referanslar')).toBe('/projelerimiz/#referanslar');
  });

  test('dış bağlantı ve protokollü adres olduğu gibi kalır', () => {
    expect(href.parse('https://wa.me/905065229034')).toBe('https://wa.me/905065229034');
    expect(href.parse('mailto:sosyal@pixelon.com.tr')).toBe('mailto:sosyal@pixelon.com.tr');
    expect(href.parse('tel:+905065229034')).toBe('tel:+905065229034');
  });

  test('boş bağlantı reddedilir', () => {
    expect(href.safeParse('').success).toBe(false);
  });

  test('opsiyonel bağlantı alanı da normalize edilir, boşluk “verilmemiş” sayılır', () => {
    expect(optHref.parse('/kariyer')).toBe('/kariyer/');
    expect(optHref.parse(null)).toBeUndefined();
    expect(optHref.parse('')).toBeUndefined();
  });
});
