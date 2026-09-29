import { describe, expect, test } from 'bun:test';
import { makeSubpageSchema } from './page-schema';

const schema = makeSubpageSchema();

const base = {
  title: 'Kurumsal Web Tasarım',
  parent: 'web-tasarim-ve-yazilim',
  seo: { title: 'Kurumsal Web Tasarım | Pixelon', description: 'Kurumsal web sitesi tasarımı.' },
  sections: [],
};

describe('hizmet alt sayfası şeması', () => {
  test('başlık, üst hizmet ve sayfa gövdesiyle geçerlidir', () => {
    expect(schema.safeParse(base).success).toBe(true);
  });

  test('üst hizmet olmadan geçersizdir: alt sayfa hangi pillar altında durduğunu bilmeli', () => {
    const { parent: _parent, ...rest } = base;
    expect(schema.safeParse(rest).success).toBe(false);
  });

  test('varsayılan durum taslaktır: onaylanmamış metin kendiliğinden yayına çıkmaz', () => {
    const parsed = schema.parse(base);
    expect(parsed.status).toBe('draft');
  });

  test('yayında durumu kabul edilir, bilinmeyen durum reddedilir', () => {
    expect(schema.safeParse({ ...base, status: 'published' }).success).toBe(true);
    expect(schema.safeParse({ ...base, status: 'yayinda' }).success).toBe(false);
  });

  test('sayfa bölüm kütüphanesini aynen kullanır', () => {
    const hero = { type: 'hero', headingLines: ['Kurumsal Web Tasarım'] };
    expect(schema.safeParse({ ...base, sections: [hero] }).success).toBe(true);
  });
});
