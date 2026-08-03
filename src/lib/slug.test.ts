import { describe, expect, test } from 'bun:test';
import { slugify } from './slug';

describe('slugify', () => {
  test('lowercases and hyphenates a plain phrase', () => {
    expect(slugify('Web Tasarim ve Yazilim')).toBe('web-tasarim-ve-yazilim');
  });

  test('transliterates Turkish lowercase characters to ASCII', () => {
    expect(slugify('şğüıöç')).toBe('sguioc');
  });

  test('transliterates Turkish uppercase characters, including dotted İ', () => {
    expect(slugify('İSTANBUL ŞİŞLİ')).toBe('istanbul-sisli');
  });

  test('slugifies a real service title with Turkish diacritics', () => {
    expect(slugify('Web Tasarım ve Yazılım')).toBe('web-tasarim-ve-yazilim');
  });

  test('slugifies a service title containing a slash', () => {
    expect(slugify('UX/UI Tasarım')).toBe('ux-ui-tasarim');
  });

  test('drops punctuation instead of turning it into separators', () => {
    expect(slugify('Marka ve Kurumsal Kimlik!')).toBe('marka-ve-kurumsal-kimlik');
  });

  test('collapses runs of whitespace into a single hyphen', () => {
    expect(slugify('SEO   ve    İçerik')).toBe('seo-ve-icerik');
  });

  test('trims leading and trailing separators', () => {
    expect(slugify('  --Blog--  ')).toBe('blog');
  });

  test('returns an empty string when nothing slug-worthy remains', () => {
    expect(slugify('!!!')).toBe('');
  });
});
