import { describe, expect, test } from 'bun:test';
import { canonicalUrl, truncateDescription } from './seo';

const SITE = 'https://pixelon.com.tr';

describe('canonicalUrl', () => {
  test('returns the bare site origin with a trailing slash for the home page', () => {
    expect(canonicalUrl('/', SITE)).toBe('https://pixelon.com.tr/');
  });

  test('appends a trailing slash to a top-level route', () => {
    expect(canonicalUrl('/biz-kimiz', SITE)).toBe('https://pixelon.com.tr/biz-kimiz/');
  });

  test('keeps an already trailing-slashed route unchanged', () => {
    expect(canonicalUrl('/blog/', SITE)).toBe('https://pixelon.com.tr/blog/');
  });

  test('handles a nested service route', () => {
    expect(canonicalUrl('/hizmetlerimiz/web-tasarim-ve-yazilim', SITE)).toBe(
      'https://pixelon.com.tr/hizmetlerimiz/web-tasarim-ve-yazilim/',
    );
  });

  test('does not double the slash when the site base itself ends in one', () => {
    expect(canonicalUrl('/blog', 'https://pixelon.com.tr/')).toBe('https://pixelon.com.tr/blog/');
  });
});

describe('truncateDescription', () => {
  test('leaves a description under the limit untouched', () => {
    expect(truncateDescription('Kısa açıklama.', 160)).toBe('Kısa açıklama.');
  });

  test('truncates at a word boundary and appends an ellipsis', () => {
    const long = 'Pixelon 360 derece dijital pazarlama ajansı olarak markanızı büyütecek stratejiler üretiyoruz.';
    const out = truncateDescription(long, 40);
    expect(out.length).toBeLessThanOrEqual(41);
    expect(out.endsWith('…')).toBe(true);
    expect(out).not.toContain('  ');
  });

  test('never splits a word in half', () => {
    expect(truncateDescription('abcdef ghijkl mnopqr', 10)).toBe('abcdef…');
  });
});
