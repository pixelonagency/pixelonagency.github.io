import { describe, expect, test } from 'bun:test';
import { makePageSchema } from './page-schema';
import { makePostSchema, makeProjectSchema, makeServiceSchema, makeTeamSchema, settingsSchema } from './schemas';

/**
 * Sveltia CMS "boş bırakılmış" opsiyonel alanları `undefined` olarak DEĞİL,
 * `null` ya da boş string olarak yazar:
 *
 *     seo: null
 *     cover: ''
 *
 * zod'un `.optional()` yalnızca `undefined` kabul ettiği için bu içerik şemadan
 * geçemiyor, `astro check` patlıyor ve deploy hiç çalışmıyor — editör ise sitenin
 * neden güncellenmediğini göremiyor. Bu testler CMS'in gerçekte ürettiği biçimi
 * kullanır (yukarıdaki örnekler repoya düşen gerçek dosyadan alınmıştır).
 */

describe('posts written by the CMS', () => {
  const base = {
    title: 'test',
    category: 'test',
    excerpt: 'teest',
    date: '2026-08-04',
    author: 'Pixelon',
    status: 'published',
    featured: false,
  };

  test('accepts a post whose untouched optional object group is null', () => {
    const result = makePostSchema().safeParse({ ...base, seo: null });
    expect(result.success ? [] : result.error.issues).toEqual([]);
  });

  test('accepts a post whose untouched optional image is an empty string', () => {
    const result = makePostSchema().safeParse({ ...base, cover: '' });
    expect(result.success ? [] : result.error.issues).toEqual([]);
  });

  test('accepts the exact frontmatter shape the CMS committed', () => {
    const result = makePostSchema().safeParse({ ...base, cover: '', seo: null });
    expect(result.success ? [] : result.error.issues).toEqual([]);
  });

  test('normalises the empty optional image away instead of keeping an empty string', () => {
    expect(makePostSchema().parse({ ...base, cover: '' }).cover).toBeUndefined();
  });

  test('normalises a null optional group away', () => {
    expect(makePostSchema().parse({ ...base, seo: null }).seo).toBeUndefined();
  });

  test('still keeps a real seo object', () => {
    const parsed = makePostSchema().parse({ ...base, seo: { title: 'X', description: 'Y' } });
    expect(parsed.seo?.title).toBe('X');
  });

  test('still rejects a post missing a required field', () => {
    const { title: _t, ...noTitle } = base;
    expect(makePostSchema().safeParse({ ...noTitle, seo: null }).success).toBe(false);
  });
});

describe('projects written by the CMS', () => {
  const base = { title: 'T', client: 'C', category: 'web', excerpt: 'E' };

  test('accepts empty optional strings and images', () => {
    const result = makeProjectSchema().safeParse({ ...base, cover: '', year: '', url: '', categoryLabel: '' });
    expect(result.success ? [] : result.error.issues).toEqual([]);
  });

  test('accepts a null list where the editor added no tags', () => {
    expect(makeProjectSchema().parse({ ...base, tags: null }).tags).toEqual([]);
  });
});

describe('team and settings written by the CMS', () => {
  test('accepts a team member with an empty photo', () => {
    const result = makeTeamSchema().safeParse({ name: 'A', role: 'B', photo: '' });
    expect(result.success ? [] : result.error.issues).toEqual([]);
  });

  test('accepts settings with null optional lists', () => {
    const result = settingsSchema.safeParse({
      phone: '+90 506 522 90 34',
      email: 'info@pixelon.com.tr',
      address: 'Kadıköy, İstanbul',
      whatsapp: { number: '905065229034', defaultMessage: 'Merhaba' },
      social: null,
      legalLinks: null,
      footerIntro: '',
      copyright: '',
    });
    expect(result.success ? [] : result.error.issues).toEqual([]);
  });
});

describe('services written by the CMS', () => {
  const minimal = {
    title: 'S',
    navLabel: 'S',
    order: 1,
    seo: { title: 'T', description: 'D' },
    hero: { eyebrow: 'E', headingLines: ['L'], lead: 'L', whatsappMessage: 'M' },
    why: { eyebrow: 'E', heading: 'H', items: [{ title: 'a', description: 'b' }] },
    scope: { eyebrow: 'E', heading: 'H', items: [{ title: 'a', description: 'b' }] },
    process: { eyebrow: 'E', heading: 'H', steps: [{ title: 'a', description: 'b' }] },
    cta: { eyebrow: 'E', heading: 'H' },
    faq: { eyebrow: 'E', heading: 'H', items: [{ question: 'q', answer: 'a' }] },
  };

  test('accepts null for every untouched optional section', () => {
    const result = makeServiceSchema().safeParse({
      ...minimal,
      cover: '',
      intro: null,
      platforms: null,
      principles: null,
      comparison: null,
      contentTypes: null,
      projects: null,
      value: null,
      sectors: null,
    });
    expect(result.success ? [] : result.error.issues).toEqual([]);
  });

  test('accepts an empty optional lead inside a section', () => {
    const result = makeServiceSchema().safeParse({
      ...minimal,
      why: { eyebrow: 'E', heading: 'H', lead: '', items: [{ title: 'a', description: 'b' }] },
    });
    expect(result.success ? [] : result.error.issues).toEqual([]);
  });
});

describe('pages written by the CMS', () => {
  const page = (section: unknown) => ({
    seo: { title: 'T', description: 'D' },
    sections: [section],
  });

  test('accepts a hero whose optional fields came back empty', () => {
    const result = makePageSchema().safeParse(
      page({ type: 'hero', headingLines: ['A'], lead: '', tagline: '', breadcrumb: null, ctas: null, chips: null }),
    );
    expect(result.success ? [] : result.error.issues).toEqual([]);
  });

  test('accepts a cards section with a null note and empty item eyebrow', () => {
    const result = makePageSchema().safeParse(
      page({
        type: 'cards',
        heading: 'H',
        note: null,
        items: [{ title: 'a', description: 'b', eyebrow: '', href: '' }],
      }),
    );
    expect(result.success ? [] : result.error.issues).toEqual([]);
  });

  test('accepts a form section whose post-submit copy was left empty', () => {
    const result = makePageSchema().safeParse(
      page({
        type: 'form',
        heading: 'H',
        formId: 'contact',
        submitLabel: '',
        successHeading: '',
        successNote: null,
        successCtas: null,
        errorHeading: null,
      }),
    );
    expect(result.success ? [] : result.error.issues).toEqual([]);
  });

  test('accepts a stats item whose optional affixes are empty strings', () => {
    const result = makePageSchema().safeParse(
      page({ type: 'stats', heading: 'H', items: [{ value: 5, prefix: '', suffix: '', label: 'L', description: '' }] }),
    );
    expect(result.success ? [] : result.error.issues).toEqual([]);
  });

  test('still rejects a section type the renderer cannot handle', () => {
    expect(makePageSchema().safeParse(page({ type: 'carousel', heading: 'H' })).success).toBe(false);
  });
});
