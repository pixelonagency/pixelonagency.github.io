import { describe, expect, test } from 'bun:test';
import { serviceToSections } from './service-sections';

const minimal = {
  title: 'SEO ve İçerik Pazarlaması',
  navLabel: 'SEO ve İçerik Pazarlaması',
  order: 4,
  seo: { title: 'SEO | Pixelon', description: 'SEO hizmeti.' },
  hero: {
    eyebrow: 'SEO ve İçerik Pazarlaması',
    headingLines: ["SEO Uyumlu İçeriklerle Google'da", 'Zirveye Çıkın.'],
    lead: 'Teknik SEO ve içerik.',
    tagline: 'Doğru aramalarda.',
    whatsappMessage: 'Merhaba Pixelon.',
  },
  why: { eyebrow: 'Neden Pixelon?', heading: 'Görünürlükten Fazlası', items: [{ title: 'A', description: 'a' }] },
  scope: { eyebrow: 'Hizmet Kapsamı', heading: 'Bütüncül SEO', items: [{ title: 'B', description: 'b' }] },
  process: { eyebrow: 'Sürecimiz', heading: 'Analizden Büyümeye', steps: [{ title: 'C', description: 'c' }] },
  cta: { eyebrow: 'Öne Çıkaralım', heading: 'Hazır mısınız?', lead: 'İletişime geçin.' },
  faq: { eyebrow: 'Merak Edilenler', heading: 'SSS', items: [{ question: 'Q', answer: 'A' }] },
};

const WA = 'https://wa.me/905065229034?text=Merhaba';
const build = (extra: Record<string, unknown> = {}) => serviceToSections({ ...minimal, ...extra }, WA);

const types = (extra: Record<string, unknown> = {}) => build(extra).map((section) => section.type);

describe('serviceToSections', () => {
  test('opens with the hero section', () => {
    expect(types()[0]).toBe('hero');
  });

  test('closes with the FAQ section', () => {
    expect(types().at(-1)).toBe('faq');
  });

  test('maps the mandatory sections in the canonical reference order', () => {
    expect(types()).toEqual(['hero', 'cards', 'cards', 'steps', 'cta', 'faq']);
  });

  test('builds the hero breadcrumb down to the service title', () => {
    const hero = build()[0];
    expect(hero?.type === 'hero' && hero.breadcrumb.map((crumb) => crumb.label)).toEqual([
      'Ana Sayfa',
      'Hizmetlerimiz',
      'SEO ve İçerik Pazarlaması',
    ]);
  });

  test('gives the hero a quote CTA and a WhatsApp CTA using the supplied link', () => {
    const hero = build()[0];
    expect(hero?.type === 'hero' && hero.ctas).toEqual([
      { label: 'Hemen Teklif Al', href: '/iletisim/', variant: 'primary', external: false },
      { label: "WhatsApp'tan Yazın", href: WA, variant: 'outline', icon: 'whatsapp', external: true },
    ]);
  });

  test('marks the WhatsApp CTA as external so it opens in a new tab', () => {
    const cta = build().find((section) => section.type === 'cta');
    const whatsapp = cta?.type === 'cta' ? cta.ctas.find((item) => item.href === WA) : undefined;
    expect(whatsapp?.external).toBe(true);
    expect(whatsapp?.icon).toBe('whatsapp');
  });

  test('carries the hero heading lines through untouched', () => {
    const hero = build()[0];
    expect(hero?.type === 'hero' && hero.headingLines).toEqual(["SEO Uyumlu İçeriklerle Google'da", 'Zirveye Çıkın.']);
  });

  test('places the optional intro right after the hero as a text section', () => {
    const sections = build({
      intro: { eyebrow: 'Giriş', heading: 'Başlık', body: 'Gövde.', highlight: 'Vurgu.' },
    });
    const intro = sections[1];
    expect(intro?.type).toBe('text');
    expect(intro?.type === 'text' && intro.highlight).toBe('Vurgu.');
  });

  test('maps contentTypes to a bullets section', () => {
    const sections = build({
      contentTypes: { eyebrow: 'İçerikler', heading: 'Ne Üretiyoruz?', items: ['Tanıtım Filmi', 'Reels'] },
    });
    const bullets = sections.find((section) => section.type === 'bullets');
    expect(bullets?.type === 'bullets' && bullets.items).toEqual(['Tanıtım Filmi', 'Reels']);
  });

  test('carries the comparison note onto its cards section', () => {
    const sections = build({
      comparison: {
        eyebrow: 'UX vs UI',
        heading: 'Fark Nedir?',
        items: [{ title: 'UX', description: 'x' }],
        note: 'Birlikte planlanmalı.',
      },
    });
    const cards = sections.filter((section) => section.type === 'cards');
    expect(cards.some((section) => section.type === 'cards' && section.note === 'Birlikte planlanmalı.')).toBe(true);
  });

  test('maps a value section with bullets to a bullets section', () => {
    const sections = build({
      value: { eyebrow: 'Neden Önemli', heading: 'Sürekli Görünürlük', lead: 'Açıklama.', bullets: ['Bir', 'İki'] },
    });
    const bullets = sections.find((section) => section.type === 'bullets' && section.heading === 'Sürekli Görünürlük');
    expect(bullets?.type === 'bullets' && bullets.items).toEqual(['Bir', 'İki']);
  });

  test('falls back to a text section when the value section has no bullets', () => {
    const sections = build({
      value: { eyebrow: 'Neden Önemli', heading: 'Sürekli Görünürlük', lead: 'Tek paragraf.', bullets: [] },
    });
    const match = sections.find((section) => section.type === 'text' && section.heading === 'Sürekli Görünürlük');
    expect(match?.type === 'text' && match.body).toBe('Tek paragraf.');
  });

  test('maps the projects showcase to cards that keep their per-item eyebrow', () => {
    const sections = build({
      projects: {
        eyebrow: 'Projeler',
        heading: 'Değer Kattık',
        items: [{ eyebrow: 'Çok Dilli SEO', title: 'Dentasay', description: 'Açıklama.' }],
      },
    });
    const cards = sections.find((section) => section.type === 'cards' && section.heading === 'Değer Kattık');
    expect(cards?.type === 'cards' && cards.items[0]?.eyebrow).toBe('Çok Dilli SEO');
  });

  test('maps sectors to a text section', () => {
    const sections = build({
      sectors: { eyebrow: 'Sektörler', heading: 'Kimlerle Çalışıyoruz?', body: 'Sağlık, e-ticaret.' },
    });
    const match = sections.find((section) => section.type === 'text' && section.heading === 'Kimlerle Çalışıyoruz?');
    expect(match?.type === 'text' && match.body).toBe('Sağlık, e-ticaret.');
  });

  test('gives the closing CTA both a quote and a WhatsApp button', () => {
    const cta = build().find((section) => section.type === 'cta');
    expect(cta?.type === 'cta' && cta.ctas.map((item) => item.label)).toEqual([
      'Hemen Teklif Alın',
      "WhatsApp'tan Yazın",
    ]);
  });

  test('renders every optional section when a service supplies all of them', () => {
    const full = types({
      intro: { eyebrow: 'e', heading: 'h', body: 'b' },
      platforms: { eyebrow: 'e', heading: 'h', items: [{ title: 't', description: 'd', logo: 'google' }] },
      principles: { eyebrow: 'e', heading: 'h', items: [{ title: 't', description: 'd' }] },
      comparison: { eyebrow: 'e', heading: 'h', items: [{ title: 't', description: 'd' }] },
      contentTypes: { eyebrow: 'e', heading: 'h', items: ['x'] },
      projects: { eyebrow: 'e', heading: 'h', items: [{ title: 't', description: 'd' }] },
      value: { eyebrow: 'e', heading: 'h', bullets: ['x'] },
      sectors: { eyebrow: 'e', heading: 'h', body: 'b' },
    });
    expect(full).toEqual([
      'hero',
      'text', // intro
      'cards', // why
      'cards', // scope
      'platforms', // platforms — kart değil kendi tipi (30 Ağu 2026)
      'cards', // principles
      'cards', // comparison
      'bullets', // contentTypes
      'steps', // process
      'cards', // projects
      'bullets', // value
      'text', // sectors
      'cta',
      'faq',
    ]);
  });

  test('produces sections that all pass the page section schema', async () => {
    const { makePageSchema } = await import('../content/page-schema');
    const sections = build({
      intro: { eyebrow: 'e', heading: 'h', body: 'b', highlight: 'x' },
      contentTypes: { eyebrow: 'e', heading: 'h', items: ['x'] },
      value: { eyebrow: 'e', heading: 'h', bullets: ['x'] },
      sectors: { eyebrow: 'e', heading: 'h', body: 'b' },
    });
    const result = makePageSchema().safeParse({ seo: minimal.seo, sections });
    expect(result.success ? [] : result.error.issues).toEqual([]);
  });
});

/**
 * Zengin bölümler — 29 Ağu 2026'da Dijital Reklam Yönetimi sayfası için eklendi.
 *
 * Gerekçe: rakip analizinde 1. sıradaki sayfa 992 kelimeydi, 5. sıradaki 3.157.
 * Uzunluk sıralama getirmiyor; kanıt getiriyor. Bu bölümler metin yerine sayı,
 * harita, görsel ve vaka kartı basar. Hepsi OPSİYONEL — diğer 10 hizmet sayfası
 * etkilenmez.
 */
describe('serviceToSections — zengin bölümler', () => {
  const stats = {
    items: [{ value: 80, prefix: '₺', suffix: 'M+', label: 'yönetilen reklam bütçesi' }],
  };
  const reach = {
    eyebrow: 'Erişim',
    heading: '20+ ülkede reklam yayınladık',
    countries: [{ label: 'Almanya', flag: '🇩🇪' }],
  };
  const showcase = {
    eyebrow: 'Vakalar',
    heading: 'Reklam projelerimiz',
    slugs: ['cagla-aytac', 'sera-natura'],
  };

  test('stats bölümü hero ile ilk içerik bölümü arasına girer', () => {
    expect(types({ stats })).toEqual(['hero', 'stats', 'cards', 'cards', 'steps', 'cta', 'faq']);
  });

  test('stats verilmezse hiç basılmaz', () => {
    expect(types()).not.toContain('stats');
  });

  test('reach, worldMap bölümü olarak basılır', () => {
    expect(types({ reach })).toContain('worldMap');
  });

  test('showcase, seçilen slug listesiyle projects bölümü basar', () => {
    const section = build({ showcase }).find((s) => s.type === 'projects');
    expect(section?.type === 'projects' && section.slugs).toEqual(['cagla-aytac', 'sera-natura']);
  });

  test('showcase görsel vitrin olduğu için grid görünümü kullanır', () => {
    const section = build({ showcase }).find((s) => s.type === 'projects');
    expect(section?.type === 'projects' && section.kind).toBe('grid');
  });

  test('showcase, süreç bölümünden SONRA gelir — önce nasıl çalıştığımız, sonra kanıt', () => {
    const list = types({ showcase });
    expect(list.indexOf('projects')).toBeGreaterThan(list.indexOf('steps'));
  });

  test('spotlight, görselli media bölümü basar', () => {
    const spotlight = { heading: 'Sağlık turizmi', lead: 'Kliniklere özel.', alt: 'Klinik' };
    expect(types({ spotlight })).toContain('media');
  });

  test('zengin bölümlerin hiçbiri zorunlu akışı bozmaz', () => {
    const list = types({ stats, reach, showcase });
    expect(list[0]).toBe('hero');
    expect(list.at(-1)).toBe('faq');
    expect(list.at(-2)).toBe('cta');
  });
});

/**
 * Platform bölümü — 30 Ağu 2026'da kart listesinden ayrıldı.
 *
 * Gerekçe: sahip "kuru duruyor, logolar büyük ve dikkat çekici olsun" dedi.
 * Platformlar artık `cards` değil kendi bölüm tipi; her kart marka işaretini
 * taşır ve `featured` olanlar ızgarada iki sütun kaplar.
 */
describe('serviceToSections — platform bölümü', () => {
  const platforms = {
    eyebrow: 'Platformlar',
    heading: 'Altı platformda kampanya',
    items: [
      { title: 'Google Ads', description: 'a', logo: 'google', featured: true },
      { title: 'TikTok', description: 'b', logo: 'tiktok' },
    ],
  };

  test('kendi bölüm tipiyle basılır, kart listesi değil', () => {
    expect(types({ platforms })).toContain('platforms');
  });

  test('logo ve featured alanları bölüme taşınır', () => {
    const section = build({ platforms }).find((s) => s.type === 'platforms');
    expect(section?.type === 'platforms' && section.items).toEqual([
      { title: 'Google Ads', description: 'a', logo: 'google', featured: true },
      { title: 'TikTok', description: 'b', logo: 'tiktok', featured: false },
    ]);
  });

  test('platforms verilmezse bölüm hiç basılmaz', () => {
    expect(types()).not.toContain('platforms');
  });
});

describe('serviceToSections — logosuz platform listesi', () => {
  /*
   * Sosyal medya ve sağlık turizmi sayfaları da `platforms` kullanıyor ama
   * marka işaretleri yok. Logo zorunlu tutulduğunda o sayfalar kırılıyordu:
   * bölüm, logo TAM olduğunda yeni tipe geçer, aksi hâlde kart ızgarası kalır.
   */
  const logosuz = {
    eyebrow: 'e',
    heading: 'h',
    items: [{ title: 'YouTube', description: 'd' }],
  };
  const karisik = {
    eyebrow: 'e',
    heading: 'h',
    items: [
      { title: 'Google', description: 'd', logo: 'google' },
      { title: 'YouTube', description: 'd' },
    ],
  };

  test('logo yoksa eski kart ızgarası basılır', () => {
    expect(types({ platforms: logosuz })).not.toContain('platforms');
  });

  test('logo eksik olan tek bir kart bile varsa kart ızgarasına düşer', () => {
    expect(types({ platforms: karisik })).not.toContain('platforms');
  });

  test('logosuz liste yine de bir bölüm üretir — sessizce kaybolmaz', () => {
    const before = types().length;
    expect(types({ platforms: logosuz }).length).toBe(before + 1);
  });
});

/**
 * İlkeler bölümü — 30 Ağu 2026'da ikonlu kendi tipine ayrıldı.
 *
 * Platform bölümüyle AYNI tuzak: `principles` alanını 10 hizmet dosyası
 * kullanıyor ama yalnız birinde ikon var. İkon zorunlu tutulsa diğer dokuz
 * sayfa kırılırdı — bu yüzden ikon tamsa yeni tip, değilse eski kart ızgarası.
 */
describe('serviceToSections — ilkeler bölümü', () => {
  const ikonlu = {
    eyebrow: 'e',
    heading: 'h',
    items: [
      { title: 'Hedef Kitle', description: 'd', icon: 'audience' },
      { title: 'Strateji', description: 'd', icon: 'strategy' },
    ],
  };
  const ikonsuz = {
    eyebrow: 'e',
    heading: 'h',
    items: [{ title: 'Hedef Kitle', description: 'd' }],
  };
  const karisik = {
    eyebrow: 'e',
    heading: 'h',
    items: [
      { title: 'Hedef Kitle', description: 'd', icon: 'audience' },
      { title: 'Strateji', description: 'd' },
    ],
  };

  test('ikonlar tamsa kendi bölüm tipiyle basılır', () => {
    expect(types({ principles: ikonlu })).toContain('principles');
  });

  test('ikon yoksa eski kart ızgarasına düşer', () => {
    expect(types({ principles: ikonsuz })).not.toContain('principles');
  });

  test('tek bir ikon bile eksikse kart ızgarasına düşer', () => {
    expect(types({ principles: karisik })).not.toContain('principles');
  });

  test('ikonsuz liste yine de bir bölüm üretir — sessizce kaybolmaz', () => {
    expect(types({ principles: ikonsuz }).length).toBe(types().length + 1);
  });

  test('ikon ve başlıklar bölüme taşınır', () => {
    const section = build({ principles: ikonlu }).find((s) => s.type === 'principles');
    expect(section?.type === 'principles' && section.items).toEqual([
      { title: 'Hedef Kitle', description: 'd', icon: 'audience' },
      { title: 'Strateji', description: 'd', icon: 'strategy' },
    ]);
  });
});

/**
 * "Neden Pixelon?" bölümü — 30 Ağu 2026'da ikonlu karta çevrildi.
 *
 * `why` HER hizmet sayfasında zorunlu (22 dosya) ama ikon yalnız reklam
 * sayfasında var. Platform ve ilkeler bölümlerindeki aynı kural burada da
 * geçerli: ikon tamsa yeni tip, değilse klasik kart ızgarası.
 */
describe('serviceToSections — neden bölümü', () => {
  const ikonlu = {
    eyebrow: 'Neden Pixelon?',
    heading: 'h',
    items: [
      { title: 'A', description: 'a', icon: 'team' },
      { title: 'B', description: 'b', icon: 'cycle' },
    ],
  };

  test('ikonlar tamsa kendi bölüm tipiyle basılır', () => {
    expect(types({ why: ikonlu })).toContain('why');
  });

  test('ikon yoksa klasik kart ızgarası kalır — varsayılan davranış korunur', () => {
    expect(types()).not.toContain('why');
  });

  test('yeni tip de hero ile scope arasındaki yerini korur', () => {
    const list = types({ why: ikonlu });
    expect(list.indexOf('why')).toBe(1);
  });

  test('ikon ve featured alanları bölüme taşınır', () => {
    const section = build({ why: ikonlu }).find((s) => s.type === 'why');
    expect(section?.type === 'why' && section.items[0]).toEqual({
      title: 'A',
      description: 'a',
      icon: 'team',
      featured: false,
    });
  });
});

describe('serviceToSections — vitrin sütun sayısı', () => {
  /*
   * Vitrin varsayılan olarak `auto-fit` ızgara kullanır ve geniş ekranda kartlar
   * daralır. Az sayıda vakada (2×2) kartların geniş durması istendiğinde sütun
   * sayısı içerikten verilebilir.
   */
  const base = { eyebrow: 'e', heading: 'h', slugs: ['a', 'b', 'c', 'd'] };

  test('columns verilirse bölüme taşınır', () => {
    const section = build({ showcase: { ...base, columns: 2 } }).find((s) => s.type === 'projects');
    expect(section?.type === 'projects' && section.columns).toBe(2);
  });

  test('columns verilmezse tanımsız kalır — bileşen kendi varsayılanını kullanır', () => {
    const section = build({ showcase: base }).find((s) => s.type === 'projects');
    expect(section?.type === 'projects' && section.columns).toBeUndefined();
  });
});

/**
 * Hizmet kapsamı — 30 Ağu 2026'da opsiyonel liste düzeni eklendi.
 *
 * Sayfada zaten dört kart ızgarası var (neden, platformlar, ilkeler, süreç).
 * Sekiz kalemlik kapsamı beşinci bir ızgara yapmak sayfayı tekrara sokuyordu;
 * bu yüzden kapsam editoryal bir satır listesine dönüştürüldü.
 *
 * `scope` HER hizmet sayfasında zorunlu (22 dosya) — düzen opsiyonel:
 * `layout: 'list'` verilmezse eski kart ızgarası basılır.
 */
describe('serviceToSections — kapsam düzeni', () => {
  const kalemler = [
    { title: 'A', description: 'a' },
    { title: 'B', description: 'b' },
  ];

  test('layout verilmezse kart ızgarası basılır — varsayılan korunur', () => {
    expect(types()).not.toContain('scope');
  });

  test("layout: 'list' verilirse kendi bölüm tipiyle basılır", () => {
    const scope = { eyebrow: 'e', heading: 'h', layout: 'list', items: kalemler };
    expect(types({ scope })).toContain('scope');
  });

  test('liste düzeninde kalemler sırasıyla taşınır', () => {
    const scope = { eyebrow: 'e', heading: 'h', layout: 'list', items: kalemler };
    const section = build({ scope }).find((s) => s.type === 'scope');
    expect(section?.type === 'scope' && section.items).toEqual(kalemler);
  });

  test('kapsam kanonik sırada yerini korur', () => {
    const scope = { eyebrow: 'e', heading: 'h', layout: 'list', items: kalemler };
    const list = types({ scope });
    expect(list.indexOf('scope')).toBe(2);
  });
});
