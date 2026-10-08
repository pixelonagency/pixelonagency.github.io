import { describe, expect, test } from 'bun:test';
import { checklistRangeText, parseMarker, splitArticleBody } from './rehber-blocks';

describe('blok işaretleri', () => {
  test('dört blok türünü tanır', () => {
    expect(parseMarker('[[infografik: hekimin-google-profili]]')).toEqual({
      kind: 'infografik',
      name: 'hekimin-google-profili',
    });
    expect(parseMarker('[[alinti]]')).toEqual({ kind: 'alinti' });
    expect(parseMarker('[[istatistikler]]')).toEqual({ kind: 'istatistikler' });
    expect(parseMarker('[[checklist: 13-17]]')).toEqual({ kind: 'checklist', from: 13, to: 17 });
    expect(parseMarker('[[checklist: 5]]')).toEqual({ kind: 'checklist', from: 5, to: 5 });
  });

  test('işaret olmayan metin işaret sayılmaz', () => {
    expect(parseMarker('Düz bir paragraf.')).toBeNull();
    expect(parseMarker('Metin [[alinti]] ortasında')).toBeNull();
  });

  test('bilinmeyen tür ya da bozuk argüman build’i durdurur: sessizce metin olarak basılmaz', () => {
    expect(() => parseMarker('[[video: x]]')).toThrow(/video/);
    expect(() => parseMarker('[[checklist: 17-13]]')).toThrow(/checklist/);
    expect(() => parseMarker('[[checklist: on üç]]')).toThrow(/checklist/);
    expect(() => parseMarker('[[infografik]]')).toThrow(/infografik/);
    expect(() => parseMarker('[[alinti: fazla]]')).toThrow(/alinti/);
  });
});

describe('makale gövdesini bölme', () => {
  test('yalnızca işaret paragrafları blok olur, aradaki HTML olduğu gibi kalır', () => {
    const html = '<h2 id="a">Başlık</h2>\n<p>Giriş.</p>\n<p>[[checklist: 1-6]]</p>\n<p>Devam.</p>\n<p>[[alinti]]</p>';
    expect(splitArticleBody(html)).toEqual([
      { kind: 'html', html: '<h2 id="a">Başlık</h2>\n<p>Giriş.</p>\n' },
      { kind: 'checklist', from: 1, to: 6 },
      { kind: 'html', html: '\n<p>Devam.</p>\n' },
      { kind: 'alinti' },
    ]);
  });

  test('işaretsiz gövde tek HTML parçasıdır', () => {
    expect(splitArticleBody('<p>Yalnız metin.</p>')).toEqual([{ kind: 'html', html: '<p>Yalnız metin.</p>' }]);
  });
});

describe('checklist bağlantı metni', () => {
  test('aralık ve tek madde', () => {
    expect(checklistRangeText(13, 17)).toBe('Bu bölüm checklistin 13-17. maddeleri.');
    expect(checklistRangeText(5, 5)).toBe('Bu bölüm checklistin 5. maddesi.');
  });
});
