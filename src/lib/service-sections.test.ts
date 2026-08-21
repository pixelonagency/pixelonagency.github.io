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
      platforms: { eyebrow: 'e', heading: 'h', items: [{ title: 't', description: 'd' }] },
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
      'cards', // platforms
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
