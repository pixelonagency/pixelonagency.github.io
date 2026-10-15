import { describe, expect, test } from 'bun:test';
import { makeJobSchema } from './page-schema';

const schema = makeJobSchema();

const base = {
  title: 'Satış ve İş Geliştirme Uzmanı',
  datePosted: '2026-10-14',
  seo: { title: 'Satış ve İş Geliştirme Uzmanı | Pixelon', description: 'Pixelon satış ekibine katılın.' },
  sections: [],
};

describe('iş ilanı şeması', () => {
  test('başlık, yayın tarihi ve sayfa gövdesiyle geçerlidir', () => {
    expect(schema.safeParse(base).success).toBe(true);
  });

  test('yayın tarihi olmadan geçersizdir: Google iş ilanı tarihsiz ilanı kabul etmez', () => {
    const { datePosted: _date, ...rest } = base;
    expect(schema.safeParse(rest).success).toBe(false);
  });

  test('varsayılan durum taslaktır ve ilan uzaktan değildir', () => {
    const parsed = schema.parse(base);
    expect(parsed.status).toBe('draft');
    expect(parsed.remote).toBe(false);
  });

  test('son başvuru tarihi opsiyoneldir', () => {
    expect(schema.parse(base).validThrough).toBeUndefined();
    expect(schema.parse({ ...base, validThrough: '2026-12-31' }).validThrough).toBeInstanceOf(Date);
  });

  test('bilinmeyen durum reddedilir', () => {
    expect(schema.safeParse({ ...base, status: 'published' }).success).toBe(true);
    expect(schema.safeParse({ ...base, status: 'yayinda' }).success).toBe(false);
  });
});
