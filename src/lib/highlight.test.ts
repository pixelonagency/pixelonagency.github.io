import { describe, expect, test } from 'bun:test';
import { hasHighlight, parseHighlights, stripHighlights } from './highlight';

describe('parseHighlights', () => {
  test('returns a single plain segment when there is no markup', () => {
    expect(parseHighlights('Markanızı Büyütüyoruz.')).toEqual([{ text: 'Markanızı Büyütüyoruz.', accent: false }]);
  });

  test('marks a single starred word as accented', () => {
    expect(parseHighlights('Markanızı *Strateji* ile')).toEqual([
      { text: 'Markanızı ', accent: false },
      { text: 'Strateji', accent: true },
      { text: ' ile', accent: false },
    ]);
  });

  test('handles several highlights in one line', () => {
    expect(parseHighlights('Markanızı *Strateji*, *Tasarım* ve *Teknolojiyle* Büyütüyoruz.')).toEqual([
      { text: 'Markanızı ', accent: false },
      { text: 'Strateji', accent: true },
      { text: ', ', accent: false },
      { text: 'Tasarım', accent: true },
      { text: ' ve ', accent: false },
      { text: 'Teknolojiyle', accent: true },
      { text: ' Büyütüyoruz.', accent: false },
    ]);
  });

  test('handles a highlight at the very start of the line', () => {
    expect(parseHighlights('*15+* Yıllık Deneyim')).toEqual([
      { text: '15+', accent: true },
      { text: ' Yıllık Deneyim', accent: false },
    ]);
  });

  test('handles a highlight at the very end of the line', () => {
    expect(parseHighlights('Google’da *Zirveye*')).toEqual([
      { text: 'Google’da ', accent: false },
      { text: 'Zirveye', accent: true },
    ]);
  });

  test('highlights a multi-word phrase', () => {
    expect(parseHighlights('*Dijital Pazarlama* Ajansı')).toEqual([
      { text: 'Dijital Pazarlama', accent: true },
      { text: ' Ajansı', accent: false },
    ]);
  });

  test('leaves a lone unmatched asterisk as literal text', () => {
    expect(parseHighlights('5 * 3 hesabı')).toEqual([{ text: '5 * 3 hesabı', accent: false }]);
  });

  test('produces no empty segments', () => {
    for (const segment of parseHighlights('*A* *B*')) {
      expect(segment.text.length).toBeGreaterThan(0);
    }
  });

  test('returns an empty list for an empty string', () => {
    expect(parseHighlights('')).toEqual([]);
  });
});

describe('hasHighlight', () => {
  test('detects highlight markup', () => {
    expect(hasHighlight('Markanızı *Strateji*')).toBe(true);
  });

  test('reports none for plain text', () => {
    expect(hasHighlight('Markanızı Strateji')).toBe(false);
  });

  test('reports none for an unmatched asterisk', () => {
    expect(hasHighlight('5 * 3')).toBe(false);
  });
});

describe('stripHighlights', () => {
  test('removes the markers so the text can be used in a title or alt attribute', () => {
    expect(stripHighlights('Markanızı *Strateji*, *Tasarım* ve *Teknolojiyle* Büyütüyoruz.')).toBe(
      'Markanızı Strateji, Tasarım ve Teknolojiyle Büyütüyoruz.',
    );
  });

  test('leaves plain text untouched', () => {
    expect(stripHighlights('Düz metin')).toBe('Düz metin');
  });
});
