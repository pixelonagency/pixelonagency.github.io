import { describe, expect, test } from 'bun:test';
import { formatTurkishDate, isoDate, readingTime } from './format';

describe('formatTurkishDate', () => {
  test('renders a date with the Turkish month name', () => {
    expect(formatTurkishDate(new Date('2026-03-14T00:00:00Z'))).toBe('14 Mart 2026');
  });

  test('renders January correctly', () => {
    expect(formatTurkishDate(new Date('2026-01-01T00:00:00Z'))).toBe('1 Ocak 2026');
  });

  test('renders December correctly', () => {
    expect(formatTurkishDate(new Date('2025-12-31T00:00:00Z'))).toBe('31 Aralık 2025');
  });

  test('does not shift the day for a date near midnight UTC', () => {
    expect(formatTurkishDate(new Date('2026-08-03T23:30:00Z'))).toBe('3 Ağustos 2026');
  });
});

describe('isoDate', () => {
  test('produces a YYYY-MM-DD string for the datetime attribute', () => {
    expect(isoDate(new Date('2026-03-14T10:20:30Z'))).toBe('2026-03-14');
  });
});

describe('readingTime', () => {
  test('reports at least one minute for a very short text', () => {
    expect(readingTime('Kısa bir yazı.')).toBe(1);
  });

  test('rounds up to the next whole minute', () => {
    // 260 words at 200 wpm = 1.3 min -> 2
    expect(readingTime(Array.from({ length: 260 }, () => 'kelime').join(' '))).toBe(2);
  });

  test('ignores markdown punctuation when counting words', () => {
    expect(readingTime('## Başlık\n\nBir **iki** üç.')).toBe(1);
  });
});
