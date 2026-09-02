import { describe, expect, test } from 'bun:test';
import { z } from 'astro/zod';
import { makePageSchema } from './page-schema';
import type { ImageResolver } from './schemas';

const pageSchema = makePageSchema();

const base = {
  seo: { title: 'Biz Kimiz? | Pixelon', description: 'Pixelon ekibini tanıyın.' },
  sections: [],
};

const parseSection = (section: unknown) => pageSchema.safeParse({ ...base, sections: [section] });

describe('ana sayfa görünümleri', () => {
  test('projects slider görünümünü kabul eder', () => {
    const base = { type: 'projects', heading: 'Projeler' };
    expect(parseSection({ ...base, kind: 'slider' }).success).toBe(true);
    expect(parseSection({ ...base, kind: 'kaydirak' }).success).toBe(false);
  });

  test('steps timeline görünümünü kabul eder', () => {
    const base = { type: 'steps', heading: 'Süreç', items: [{ title: 'Keşif', description: 'Dinleriz.' }] };
    expect(parseSection({ ...base, kind: 'timeline' }).success).toBe(true);
  });

  test('sektör kartı açıklaması opsiyoneldir', () => {
    const card = { label: 'E-Ticaret', image: 'src/assets/images/sector-e-ticaret.webp' };
    const base = { type: 'sectorCards', heading: 'Sektörler' };
    expect(parseSection({ ...base, cards: [card] }).success).toBe(true);
    expect(parseSection({ ...base, cards: [{ ...card, description: 'Satışa odaklı çözümler.' }] }).success).toBe(true);
  });
});

describe('hizmetler görünümleri', () => {
  test('bullets orbit görünümünü kabul eder', () => {
    const base = { type: 'bullets', heading: '360° Yaklaşım', items: ['Strateji', 'Tasarım'] };
    expect(parseSection({ ...base, kind: 'orbit' }).success).toBe(true);
  });
});

describe('ücretsiz analiz görünümleri', () => {
  const card = { title: 'SEO', description: 'İndeks durumu ve teknik sorunlar.' };

  test('cards için audit ve report görünümleri tanımlıdır', () => {
    expect(parseSection({ type: 'cards', kind: 'audit', items: [{ ...card, icon: 'seo' }] }).success).toBe(true);
    expect(parseSection({ type: 'cards', kind: 'report', items: [card] }).success).toBe(true);
  });

  test('denetim ikonları kart ikon sözlüğünde tanımlıdır', () => {
    for (const icon of ['web', 'seo', 'ads', 'social', 'brand', 'commerce']) {
      expect(parseSection({ type: 'cards', kind: 'audit', items: [{ ...card, icon }] }).success).toBe(true);
    }
  });

  test('bullets için check ve tags görünümleri tanımlıdır', () => {
    const base = { type: 'bullets', heading: 'Sonuç', items: ['Güçlü yönleriniz'] };
    expect(parseSection({ ...base, kind: 'check' }).success).toBe(true);
    expect(parseSection({ ...base, kind: 'tags' }).success).toBe(true);
    expect(parseSection({ ...base, kind: 'liste' }).success).toBe(false);
  });
});

describe('biz kimiz görünümleri', () => {
  const card = { title: 'Strateji', description: 'Doğru soruları sorarız.' };

  test('cards için feature ve ledger görünümleri tanımlıdır', () => {
    expect(parseSection({ type: 'cards', kind: 'feature', items: [{ ...card, icon: 'strategy' }] }).success).toBe(true);
    expect(parseSection({ type: 'cards', kind: 'ledger', items: [card] }).success).toBe(true);
  });

  test('kart ikonu opsiyoneldir ama tanımsız ad reddedilir', () => {
    expect(parseSection({ type: 'cards', items: [card] }).success).toBe(true);
    expect(parseSection({ type: 'cards', items: [{ ...card, icon: 'strateji' }] }).success).toBe(false);
  });

  test('accent zemini tanımlıdır — lime bölüm tam genişlikte basılır', () => {
    const step = { title: 'Keşif', description: 'Markanızı dinleriz.' };
    expect(parseSection({ type: 'steps', heading: 'Süreç', background: 'accent', items: [step] }).success).toBe(true);
  });

  test('steps akış görünümünü kabul eder', () => {
    const step = { title: 'Keşif', description: 'Markanızı dinleriz.' };
    expect(parseSection({ type: 'steps', heading: 'Süreç', kind: 'flow', items: [step] }).success).toBe(true);
    expect(parseSection({ type: 'steps', heading: 'Süreç', items: [step] }).success).toBe(true);
    expect(parseSection({ type: 'steps', heading: 'Süreç', kind: 'akis', items: [step] }).success).toBe(false);
  });
});

describe('contactInfo bölümü', () => {
  const item = { label: 'E-posta', value: 'info@pixelon.com.tr', href: 'mailto:info@pixelon.com.tr' };

  test('kanal ikonu opsiyoneldir — ikonsuz madde geçerli kalır', () => {
    const parsed = parseSection({ type: 'contactInfo', items: [item] });
    expect(parsed.success).toBe(true);
  });

  test('tanımlı kanal ikonunu kabul eder', () => {
    const parsed = parseSection({ type: 'contactInfo', items: [{ ...item, icon: 'mail' }] });
    expect(parsed.success).toBe(true);
  });

  test('tanımsız ikon adını reddeder — yazım hatası sessizce ikonsuz kalmasın', () => {
    const parsed = parseSection({ type: 'contactInfo', items: [{ ...item, icon: 'eposta' }] });
    expect(parsed.success).toBe(false);
  });
});

describe('page frame', () => {
  test('accepts a page with SEO metadata and no sections yet', () => {
    expect(pageSchema.safeParse(base).success).toBe(true);
  });

  test('rejects a page with no SEO block', () => {
    expect(pageSchema.safeParse({ sections: [] }).success).toBe(false);
  });

  test('rejects a page whose SEO description is empty', () => {
    expect(pageSchema.safeParse({ ...base, seo: { title: 'X', description: '' } }).success).toBe(false);
  });

  test('keeps an optional whatsappMessage override', () => {
    const parsed = pageSchema.parse({ ...base, whatsappMessage: 'Merhaba Pixelon' });
    expect(parsed.whatsappMessage).toBe('Merhaba Pixelon');
  });
});

describe('hero section', () => {
  const hero = {
    type: 'hero',
    headingLines: ['Markanızı Dijitalde', 'Büyütüyoruz.'],
    lead: '360 derece dijital pazarlama.',
    ctas: [{ label: 'Hemen Teklif Al', href: '/iletisim', variant: 'primary' }],
  };

  test('accepts a hero with heading lines and CTAs', () => {
    expect(parseSection(hero).success).toBe(true);
  });

  test('rejects a hero with no heading lines', () => {
    expect(parseSection({ ...hero, headingLines: [] }).success).toBe(false);
  });

  test('rejects a CTA with an unknown variant', () => {
    expect(parseSection({ ...hero, ctas: [{ label: 'X', href: '/', variant: 'ghost' }] }).success).toBe(false);
  });

  test('defaults a CTA variant to primary', () => {
    const parsed = pageSchema.parse({
      ...base,
      sections: [{ ...hero, ctas: [{ label: 'Teklif Al', href: '/iletisim' }] }],
    });
    const section = parsed.sections[0];
    expect(section?.type === 'hero' && section.ctas[0]?.variant).toBe('primary');
  });
});

describe('cards section', () => {
  const cards = {
    type: 'cards',
    heading: 'Hizmetlerimiz',
    items: [{ title: 'SEO', description: 'Organik büyüme.' }],
  };

  test('accepts a cards section', () => {
    expect(parseSection(cards).success).toBe(true);
  });

  test('rejects a cards section with an empty item list', () => {
    expect(parseSection({ ...cards, items: [] }).success).toBe(false);
  });

  test('rejects a card missing its description', () => {
    expect(parseSection({ ...cards, items: [{ title: 'SEO' }] }).success).toBe(false);
  });

  test('carries an optional eyebrow on a card, used by service project showcases', () => {
    const parsed = pageSchema.parse({
      ...base,
      sections: [{ ...cards, items: [{ eyebrow: 'Çok Dilli SEO', title: 'Dentasay', description: 'X' }] }],
    });
    const section = parsed.sections[0];
    expect(section?.type === 'cards' && section.items[0]?.eyebrow).toBe('Çok Dilli SEO');
  });

  test('carries an optional closing note under the grid', () => {
    const parsed = pageSchema.parse({ ...base, sections: [{ ...cards, note: 'UX ve UI birlikte planlanmalıdır.' }] });
    const section = parsed.sections[0];
    expect(section?.type === 'cards' && section.note).toBe('UX ve UI birlikte planlanmalıdır.');
  });

  test('carries an optional href so a card can link out', () => {
    const parsed = pageSchema.parse({
      ...base,
      sections: [{ ...cards, items: [{ title: 'SEO', description: 'X', href: '/hizmetlerimiz/seo' }] }],
    });
    const section = parsed.sections[0];
    expect(section?.type === 'cards' && section.items[0]?.href).toBe('/hizmetlerimiz/seo/');
  });
});

describe('stats section', () => {
  test('accepts counter stats with a numeric value', () => {
    expect(
      parseSection({
        type: 'stats',
        heading: 'Rakamlarla Pixelon',
        items: [{ value: 120, suffix: '+', label: 'Tamamlanan Proje' }],
      }).success,
    ).toBe(true);
  });

  test('rejects a stat whose value is not a number, so the counter can animate', () => {
    expect(parseSection({ type: 'stats', heading: 'R', items: [{ value: 'yüz yirmi', label: 'Proje' }] }).success).toBe(
      false,
    );
  });
});

describe('faq section', () => {
  test('accepts a FAQ section', () => {
    expect(
      parseSection({
        type: 'faq',
        heading: 'Sıkça Sorulan Sorular',
        items: [{ question: 'Ne kadar sürer?', answer: 'Projeye göre değişir.' }],
      }).success,
    ).toBe(true);
  });

  test('rejects a FAQ entry with no answer', () => {
    expect(parseSection({ type: 'faq', heading: 'SSS', items: [{ question: 'Ne?' }] }).success).toBe(false);
  });
});

describe('bullets and text sections', () => {
  test('accepts a bullets section of plain strings', () => {
    expect(parseSection({ type: 'bullets', heading: 'Avantajlar', items: ['Hızlı', 'Ölçülebilir'] }).success).toBe(
      true,
    );
  });

  test('accepts a text section with a body', () => {
    expect(parseSection({ type: 'text', heading: 'Hakkımızda', body: 'Uzun paragraf.' }).success).toBe(true);
  });

  test('rejects a text section with no body', () => {
    expect(parseSection({ type: 'text', heading: 'Hakkımızda' }).success).toBe(false);
  });

  test('carries an optional pull-quote highlight on a text section', () => {
    const parsed = pageSchema.parse({
      ...base,
      sections: [{ type: 'text', heading: 'Giriş', body: 'Uzun metin.', highlight: 'Amacımız bağ kurmaktır.' }],
    });
    const section = parsed.sections[0];
    expect(section?.type === 'text' && section.highlight).toBe('Amacımız bağ kurmaktır.');
  });
});

describe('collection-backed sections', () => {
  test('accepts a projects section that pulls from the collection', () => {
    expect(parseSection({ type: 'projects', heading: 'Projelerimiz', limit: 6 }).success).toBe(true);
  });

  test('accepts a posts section', () => {
    expect(parseSection({ type: 'posts', heading: 'Blog', limit: 3 }).success).toBe(true);
  });

  /**
   * Öne çıkan yazı bloğu içeriği koleksiyondan çeker — başlık/özet/tarih elle
   * yazılmaz, böylece kartın anlattığı yazı ile açtığı yazı ayrışamaz.
   */
  test('accepts a featuredPost section with no pinned slug', () => {
    expect(parseSection({ type: 'featuredPost', ctaLabel: 'Yazıyı Okuyun →' }).success).toBe(true);
  });

  test('accepts a featuredPost section pinned to a slug', () => {
    const result = parseSection({ type: 'featuredPost', slug: 'sosyal-medya-ajanslari-ne-is-yapar' });
    expect(result.success).toBe(true);
  });

  test('rejects a featuredPost section that carries hand-written body copy', () => {
    // `body`/`heading` kabul edilseydi sabit metin geri sızardı.
    const result = parseSection({ type: 'featuredPost', heading: 'Elle yazılmış başlık' });
    expect(result.success && !('heading' in result.data)).toBe(true);
  });

  test('accepts a logos marquee backed by the references collection', () => {
    expect(parseSection({ type: 'logos', heading: 'Referanslarımız' }).success).toBe(true);
  });

  test('accepts a team section', () => {
    expect(parseSection({ type: 'team', heading: 'Ekibimiz' }).success).toBe(true);
  });
});

describe('form section', () => {
  test('accepts the contact form', () => {
    expect(parseSection({ type: 'form', heading: 'Bize Yazın', formId: 'contact' }).success).toBe(true);
  });

  test('accepts the analysis form', () => {
    expect(parseSection({ type: 'form', heading: 'Ücretsiz Analiz', formId: 'analysis' }).success).toBe(true);
  });

  test('rejects an unknown form id', () => {
    expect(parseSection({ type: 'form', heading: 'X', formId: 'newsletter' }).success).toBe(false);
  });

  test('carries the post-submit success copy', () => {
    const parsed = pageSchema.parse({
      ...base,
      sections: [
        {
          type: 'form',
          heading: 'Bize Yazın',
          formId: 'contact',
          successHeading: 'Talebiniz Bize Ulaştı!',
          successBody: 'En kısa sürede sizinle iletişime geçeceğiz.',
          successNote: 'Bu sırada çalışmalarımızı inceleyebilirsiniz.',
          successCtas: [{ label: 'Projelerimizi İnceleyin', href: '/projelerimiz' }],
        },
      ],
    });
    const section = parsed.sections[0];
    expect(section?.type === 'form' && section.successHeading).toBe('Talebiniz Bize Ulaştı!');
    expect(section?.type === 'form' && section.successCtas[0]?.variant).toBe('primary');
  });

  test('carries the submission failure copy', () => {
    const parsed = pageSchema.parse({
      ...base,
      sections: [
        {
          type: 'form',
          heading: 'Bize Yazın',
          formId: 'contact',
          errorHeading: 'Form Gönderilemedi',
          errorBody: 'Teknik bir sorun oluştu. Lütfen tekrar deneyin.',
        },
      ],
    });
    const section = parsed.sections[0];
    expect(section?.type === 'form' && section.errorHeading).toBe('Form Gönderilemedi');
  });

  test('leaves the success and error copy optional so a form still validates without it', () => {
    expect(parseSection({ type: 'form', heading: 'X', formId: 'contact' }).success).toBe(true);
  });

  test('defaults successCtas to an empty list', () => {
    const parsed = pageSchema.parse({ ...base, sections: [{ type: 'form', heading: 'X', formId: 'contact' }] });
    const section = parsed.sections[0];
    expect(section?.type === 'form' && section.successCtas).toEqual([]);
  });
});

describe('section-level buttons', () => {
  // Referans tasarımda ızgaraların ALTINDA bölüm düzeyinde butonlar var
  // ("Tüm Hizmetlerimizi Keşfedin", "Projenizi Birlikte Planlayalım" …).
  // Bunlar yalnızca hero/cta bölümlerine özgü değil — her bölüm tipi taşıyabilmeli.
  test('a cards section can carry buttons under the grid', () => {
    const parsed = pageSchema.parse({
      ...base,
      sections: [
        {
          type: 'cards',
          heading: 'Hizmetlerimiz',
          items: [{ title: 'SEO', description: 'x' }],
          ctas: [{ label: 'Tüm Hizmetlerimizi Keşfedin', href: '/hizmetlerimiz' }],
        },
      ],
    });
    expect(parsed.sections[0]?.ctas[0]?.label).toBe('Tüm Hizmetlerimizi Keşfedin');
  });

  test('a stats section can carry a button', () => {
    const parsed = pageSchema.parse({
      ...base,
      sections: [
        {
          type: 'stats',
          heading: 'Rakamlarla',
          items: [{ value: 15, suffix: '+', label: 'Yıl' }],
          ctas: [{ label: '☕ Bir Kahve İçip Tanışalım', href: '/iletisim', variant: 'outline' }],
        },
      ],
    });
    expect(parsed.sections[0]?.ctas[0]?.variant).toBe('outline');
  });

  test('a steps section can carry a button', () => {
    const parsed = pageSchema.parse({
      ...base,
      sections: [
        {
          type: 'steps',
          heading: 'Süreç',
          items: [{ title: 'A', description: 'a' }],
          ctas: [{ label: 'Projenizi Birlikte Planlayalım', href: '/iletisim' }],
        },
      ],
    });
    expect(parsed.sections[0]?.ctas).toHaveLength(1);
  });

  test('a text section can carry a button', () => {
    const parsed = pageSchema.parse({
      ...base,
      sections: [
        { type: 'text', body: 'x', ctas: [{ label: 'Global Projelerimizi İnceleyin', href: '/projelerimiz' }] },
      ],
    });
    expect(parsed.sections[0]?.ctas).toHaveLength(1);
  });

  test('a logos section can carry a button', () => {
    const parsed = pageSchema.parse({
      ...base,
      sections: [{ type: 'logos', ctas: [{ label: 'Tüm Referanslarımızı İnceleyin', href: '/projelerimiz' }] }],
    });
    expect(parsed.sections[0]?.ctas).toHaveLength(1);
  });

  test('sections default to no buttons rather than undefined', () => {
    const parsed = pageSchema.parse({ ...base, sections: [{ type: 'text', body: 'x' }] });
    expect(parsed.sections[0]?.ctas).toEqual([]);
  });
});

describe('stats items keep their explanatory paragraph', () => {
  test('a stat can carry a description alongside its label', () => {
    const parsed = pageSchema.parse({
      ...base,
      sections: [
        {
          type: 'stats',
          heading: 'Rakamlarla Pixelon',
          items: [{ value: 15, suffix: '+', label: 'Yıl sektör deneyimi', description: 'Uzun açıklama cümlesi.' }],
        },
      ],
    });
    const section = parsed.sections[0];
    expect(section?.type === 'stats' && section.items[0]?.description).toBe('Uzun açıklama cümlesi.');
  });
});

describe('hero trust chips', () => {
  test('a hero can carry short trust badges as a list', () => {
    const parsed = pageSchema.parse({
      ...base,
      sections: [
        {
          type: 'hero',
          headingLines: ['Bir'],
          chips: ['15+ Yıllık Deneyim', '180+ Tamamlanan Proje'],
        },
      ],
    });
    const section = parsed.sections[0];
    expect(section?.type === 'hero' && section.chips).toEqual(['15+ Yıllık Deneyim', '180+ Tamamlanan Proje']);
  });

  test('hero chips default to an empty list', () => {
    const parsed = pageSchema.parse({ ...base, sections: [{ type: 'hero', headingLines: ['Bir'] }] });
    const section = parsed.sections[0];
    expect(section?.type === 'hero' && section.chips).toEqual([]);
  });
});

describe('marquee section', () => {
  test('accepts a marquee with a list of items', () => {
    expect(parseSection({ type: 'marquee', items: ['Strateji', 'Tasarım'] }).success).toBe(true);
  });

  test('rejects a marquee with no items', () => {
    expect(parseSection({ type: 'marquee', items: [] }).success).toBe(false);
  });

  test('defaults kind to strip', () => {
    const parsed = pageSchema.parse({ ...base, sections: [{ type: 'marquee', items: ['A'] }] });
    const section = parsed.sections[0];
    expect(section?.type === 'marquee' && section.kind).toBe('strip');
  });

  test('accepts the wordmarks kind with an optional heading and lead', () => {
    const parsed = pageSchema.parse({
      ...base,
      sections: [{ type: 'marquee', kind: 'wordmarks', heading: 'Partnerlerimiz', lead: 'Metin', items: ['Google'] }],
    });
    const section = parsed.sections[0];
    expect(section?.type === 'marquee' && section.heading).toBe('Partnerlerimiz');
  });

  test('rejects an unknown kind', () => {
    expect(parseSection({ type: 'marquee', kind: 'ticker', items: ['A'] }).success).toBe(false);
  });
});

describe('worldMap section', () => {
  const worldMap = {
    type: 'worldMap',
    heading: 'Pixelon Dünyanın Her Yerinde!',
    countries: [{ label: 'Türkiye', flag: '🇹🇷' }],
  };

  test('accepts a worldMap section with at least one country', () => {
    expect(parseSection(worldMap).success).toBe(true);
  });

  test('rejects a worldMap section with no countries', () => {
    expect(parseSection({ ...worldMap, countries: [] }).success).toBe(false);
  });

  test('defaults a country to not highlighted', () => {
    const parsed = pageSchema.parse({ ...base, sections: [worldMap] });
    const section = parsed.sections[0];
    expect(section?.type === 'worldMap' && section.countries[0]?.highlighted).toBe(false);
  });

  test('carries an optional closing line and map alt text', () => {
    const parsed = pageSchema.parse({
      ...base,
      sections: [{ ...worldMap, closingLine: 'Sınırlar değişir.', mapImageAlt: 'Dünya haritası' }],
    });
    const section = parsed.sections[0];
    expect(section?.type === 'worldMap' && section.closingLine).toBe('Sınırlar değişir.');
  });
});

describe('contact section', () => {
  const contact = {
    type: 'contact',
    heading: 'Markanızı Birlikte Büyütelim.',
    contactItems: [{ label: 'E-posta', value: 'info@pixelon.com.tr' }],
    formHeading: 'Projenizden Bize Bahsedin',
    formId: 'contact',
  };

  test('accepts a unified contact section', () => {
    expect(parseSection(contact).success).toBe(true);
  });

  test('rejects a contact section with no contact items', () => {
    expect(parseSection({ ...contact, contactItems: [] }).success).toBe(false);
  });

  test('rejects an unknown formId', () => {
    expect(parseSection({ ...contact, formId: 'newsletter' }).success).toBe(false);
  });

  test('defaults successCtas to an empty list', () => {
    const parsed = pageSchema.parse({ ...base, sections: [contact] });
    const section = parsed.sections[0];
    expect(section?.type === 'contact' && section.successCtas).toEqual([]);
  });
});

describe('cards section extras', () => {
  test('accepts an icon, a permanent featured highlight and a star rating on a card', () => {
    const parsed = pageSchema.parse({
      ...base,
      sections: [
        {
          type: 'cards',
          heading: 'Sektörler',
          items: [{ title: 'E-Ticaret', description: 'x', icon: 'ecommerce', featured: true, rating: 5 }],
        },
      ],
    });
    const section = parsed.sections[0];
    expect(section?.type === 'cards' && section.items[0]?.featured).toBe(true);
    expect(section?.type === 'cards' && section.items[0]?.rating).toBe(5);
  });

  test('rejects an unknown icon name', () => {
    expect(
      parseSection({
        type: 'cards',
        heading: 'Sektörler',
        items: [{ title: 'X', description: 'x', icon: 'rocket' }],
      }).success,
    ).toBe(false);
  });

  test('featured and rating stay optional', () => {
    const parsed = pageSchema.parse({
      ...base,
      sections: [{ type: 'cards', heading: 'X', items: [{ title: 'A', description: 'b' }] }],
    });
    const section = parsed.sections[0];
    expect(section?.type === 'cards' && section.items[0]?.featured).toBeUndefined();
  });
});

describe('section discrimination', () => {
  test('rejects an unknown section type outright', () => {
    expect(parseSection({ type: 'carousel', heading: 'X' }).success).toBe(false);
  });

  test('keeps section order as authored', () => {
    const parsed = pageSchema.parse({
      ...base,
      sections: [
        { type: 'text', heading: 'Bir', body: 'a' },
        { type: 'text', heading: 'İki', body: 'b' },
      ],
    });
    expect(parsed.sections.map((s) => (s.type === 'text' ? s.heading : ''))).toEqual(['Bir', 'İki']);
  });

  test('accepts an optional anchor id so nav links can target a section', () => {
    const parsed = pageSchema.parse({
      ...base,
      sections: [{ type: 'text', heading: 'Referanslar', body: 'x', anchor: 'referanslar' }],
    });
    expect(parsed.sections[0]?.anchor).toBe('referanslar');
  });

  test('accepts the light background variant used by inverted sections', () => {
    expect(parseSection({ type: 'text', heading: 'X', body: 'y', background: 'light' }).success).toBe(true);
  });

  test('rejects an unknown background variant', () => {
    expect(parseSection({ type: 'text', heading: 'X', body: 'y', background: 'purple' }).success).toBe(false);
  });
});

/*
 * Showreel şeridi görselleri `<Image />` ile basılıyor. Ham string bırakılırsa
 * kart sessizce boş çıkar — sectorCards'ta bire bir aynı hata yaşandı ve
 * `image()` ile çözüldü. Bu test aynı hatanın showreel'de tekrarlanmasını
 * engeller: görselin ENJEKTE EDİLEN çözümleyiciden geçtiğini doğrular.
 */
describe('showreel görselleri Astro görsel hattından geçer', () => {
  const markingResolver: ImageResolver = () => z.string().transform((src) => ({ src, resolved: true }));
  const schema = makePageSchema(markingResolver);

  const item = {
    label: 'Dentasay',
    image: '/src/assets/images/projects/dentasay/web-anasayfa.webp',
    href: '/projelerimiz/dentasay/',
  };

  test('showreel item görseli image() çözümleyicisinden geçer', () => {
    const result = schema.safeParse({
      ...base,
      sections: [{ type: 'showreel', items: [item, { ...item, label: 'Xray Groupe' }] }],
    });

    expect(result.success).toBe(true);
    const section = result.data!.sections[0] as { items: { image: unknown }[] };
    expect(section.items[0].image).toEqual({ src: item.image, resolved: true });
  });
});

/*
 * Reklam açılış sayfasında hero lead'i mobilde ekranın yarısını yiyor ve CTA'yı
 * katlamanın altına itiyordu. Gizleme SİTE GENELİNDE yapılamaz — aynı bileşeni
 * kullanan ana sayfa, iletişim ve analiz hero'ları lead'lerini kaybederdi. Bu
 * yüzden karar içerikte, bölüm bazında veriliyor.
 */
describe('hero lead mobilde bölüm bazında gizlenebilir', () => {
  const hero = { type: 'hero', headingLines: ['Başlık'], lead: 'Uzun bir giriş cümlesi.' };

  test('bayrak verilmezse lead mobilde de görünür', () => {
    const result = parseSection(hero);
    expect(result.success).toBe(true);
    expect((result.data!.sections[0] as { hideLeadOnMobile: boolean }).hideLeadOnMobile).toBe(false);
  });

  test('hideLeadOnMobile true kabul edilir', () => {
    const result = parseSection({ ...hero, hideLeadOnMobile: true });
    expect(result.success).toBe(true);
    expect((result.data!.sections[0] as { hideLeadOnMobile: boolean }).hideLeadOnMobile).toBe(true);
  });
});
