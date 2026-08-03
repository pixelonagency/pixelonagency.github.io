import { describe, expect, test } from 'bun:test';
import { buildWhatsAppUrl, normalisePhone, telHref } from './whatsapp';

describe('normalisePhone', () => {
  test('strips spaces and the leading plus from an international number', () => {
    expect(normalisePhone('+90 506 522 90 34')).toBe('905065229034');
  });

  test('strips parentheses and dashes', () => {
    expect(normalisePhone('+90 (506) 522-90-34')).toBe('905065229034');
  });

  test('assumes Turkey and drops the trunk zero for a national number', () => {
    expect(normalisePhone('0506 522 90 34')).toBe('905065229034');
  });
});

describe('buildWhatsAppUrl', () => {
  test('builds a wa.me link from a formatted phone number', () => {
    expect(buildWhatsAppUrl('+90 506 522 90 34', 'Merhaba')).toBe('https://wa.me/905065229034?text=Merhaba');
  });

  test('percent-encodes the prefilled message', () => {
    expect(buildWhatsAppUrl('+90 506 522 90 34', 'Merhaba, teklif almak istiyorum.')).toBe(
      'https://wa.me/905065229034?text=Merhaba%2C%20teklif%20almak%20istiyorum.',
    );
  });

  test('percent-encodes Turkish characters in the message', () => {
    expect(buildWhatsAppUrl('+905065229034', 'Ücretsiz analiz')).toBe(
      'https://wa.me/905065229034?text=%C3%9Ccretsiz%20analiz',
    );
  });

  test('omits the text query entirely when no message is given', () => {
    expect(buildWhatsAppUrl('+905065229034')).toBe('https://wa.me/905065229034');
  });

  test('omits the text query when the message is only whitespace', () => {
    expect(buildWhatsAppUrl('+905065229034', '   ')).toBe('https://wa.me/905065229034');
  });
});

describe('telHref', () => {
  test('produces a dialable tel: URI in E.164 form', () => {
    expect(telHref('+90 506 522 90 34')).toBe('tel:+905065229034');
  });
});
