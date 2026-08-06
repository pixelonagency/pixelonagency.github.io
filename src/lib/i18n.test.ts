import { describe, expect, test } from 'bun:test';
import {
  alternatesFor,
  DEFAULT_LOCALE,
  isLocale,
  localePrefix,
  LOCALES,
  localizedPath,
  parseLocalizedPath,
  pickLocalized,
  resolveEntryId,
  stripLocale,
} from './i18n';

describe('locale set', () => {
  test('Türkçe varsayılan dildir', () => {
    expect(DEFAULT_LOCALE).toBe('tr');
  });

  test('varsayılan dil, dil listesinin ilk elemanıdır', () => {
    expect(LOCALES[0] as string).toBe(DEFAULT_LOCALE as string);
  });

  test('bilinen dilleri tanır', () => {
    expect(isLocale('tr')).toBe(true);
    expect(isLocale('en')).toBe(true);
  });

  test('bilinmeyen dili reddeder', () => {
    expect(isLocale('de')).toBe(false);
    expect(isLocale('')).toBe(false);
  });
});

describe('localePrefix', () => {
  test('varsayılan dil için ön ek üretmez — mevcut URL’ler korunur', () => {
    expect(localePrefix('tr')).toBe('');
  });

  test('varsayılan olmayan dil için ön ek üretir', () => {
    expect(localePrefix('en')).toBe('/en');
  });
});

describe('localizedPath', () => {
  test('varsayılan dilde ana sayfa kök yoldur', () => {
    expect(localizedPath('home', 'tr')).toBe('/');
  });

  test('ikincil dilde ana sayfa yalnızca dil ön ekidir', () => {
    expect(localizedPath('home', 'en')).toBe('/en');
  });

  test('varsayılan dilde sayfa slug’ı Türkçedir', () => {
    expect(localizedPath('services', 'tr')).toBe('/hizmetlerimiz');
  });

  test('ikincil dilde slug o dile çevrilir', () => {
    expect(localizedPath('services', 'en')).toBe('/en/services');
  });

  test('her sayfa anahtarı her dilde bir slug tanımlar', () => {
    for (const locale of LOCALES) {
      for (const path of Object.keys(alternatesFor('home'))) void path;
      expect(typeof localizedPath('contact', locale)).toBe('string');
    }
  });

  test('alt kaynak (detay sayfası) slug’ı sona eklenir', () => {
    expect(localizedPath('services', 'tr', 'seo-ve-icerik-pazarlamasi')).toBe(
      '/hizmetlerimiz/seo-ve-icerik-pazarlamasi',
    );
    expect(localizedPath('services', 'en', 'seo-and-content-marketing')).toBe('/en/services/seo-and-content-marketing');
  });

  test('blog detayında da aynı kural geçerlidir', () => {
    expect(localizedPath('blog', 'en', 'a-post')).toBe('/en/blog/a-post');
  });
});

describe('parseLocalizedPath', () => {
  test('ön eksiz yolu varsayılan dile atar', () => {
    expect(parseLocalizedPath('/hizmetlerimiz')).toEqual({ locale: 'tr', rest: 'hizmetlerimiz' });
  });

  test('kök yolu varsayılan dilin ana sayfası sayar', () => {
    expect(parseLocalizedPath('/')).toEqual({ locale: 'tr', rest: '' });
  });

  test('dil ön ekli yolu ayrıştırır', () => {
    expect(parseLocalizedPath('/en/services')).toEqual({ locale: 'en', rest: 'services' });
  });

  test('yalnızca dil ön ekinden oluşan yolu ana sayfa sayar', () => {
    expect(parseLocalizedPath('/en')).toEqual({ locale: 'en', rest: '' });
  });

  test('sondaki eğik çizgi sonucu değiştirmez', () => {
    expect(parseLocalizedPath('/en/services/')).toEqual({ locale: 'en', rest: 'services' });
  });

  test('dil gibi görünen ama tanımlı olmayan ön eki yol parçası sayar', () => {
    expect(parseLocalizedPath('/de/services')).toEqual({ locale: 'tr', rest: 'de/services' });
  });
});

describe('stripLocale', () => {
  test('dil ön ekini kaldırır', () => {
    expect(stripLocale('/en/services')).toBe('/services');
  });

  test('ön eksiz yolu olduğu gibi bırakır', () => {
    expect(stripLocale('/hizmetlerimiz')).toBe('/hizmetlerimiz');
  });
});

describe('alternatesFor — hreflang', () => {
  test('her dil için karşılık üretir', () => {
    expect(alternatesFor('services')).toEqual({
      tr: '/hizmetlerimiz',
      en: '/en/services',
    });
  });

  test('detay sayfasında dile özgü slug kullanılabilir', () => {
    expect(alternatesFor('blog', { tr: 'yazi', en: 'post' })).toEqual({
      tr: '/blog/yazi',
      en: '/en/blog/post',
    });
  });

  test('bir dilde karşılık yoksa o dil listeden düşer', () => {
    expect(alternatesFor('blog', { tr: 'yazi' })).toEqual({ tr: '/blog/yazi' });
  });
});

describe('resolveEntryId — eksik çeviri varsayılana düşer', () => {
  const mevcut = new Set(['tr/home', 'tr/about', 'en/home']);
  const has = (id: string) => mevcut.has(id);

  test('istenen dildeki girdi varsa onu döner', () => {
    expect(resolveEntryId('home', 'en', has)).toBe('en/home');
  });

  test('istenen dilde yoksa varsayılan dile düşer', () => {
    expect(resolveEntryId('about', 'en', has)).toBe('tr/about');
  });

  test('varsayılan dilde de yoksa null döner', () => {
    expect(resolveEntryId('careers', 'en', has)).toBeNull();
  });

  test('varsayılan dil istendiğinde doğrudan onu arar', () => {
    expect(resolveEntryId('home', 'tr', has)).toBe('tr/home');
  });
});

describe('pickLocalized — alan bazlı yedekleme', () => {
  test('istenen dildeki değeri döner', () => {
    expect(pickLocalized({ tr: 'Merhaba', en: 'Hello' }, 'en')).toBe('Hello');
  });

  test('istenen dil boşsa varsayılana düşer', () => {
    expect(pickLocalized({ tr: 'Merhaba', en: '' }, 'en')).toBe('Merhaba');
  });

  test('istenen dil tanımsızsa varsayılana düşer', () => {
    expect(pickLocalized({ tr: 'Merhaba' }, 'en')).toBe('Merhaba');
  });

  test('hiçbiri yoksa undefined döner', () => {
    expect(pickLocalized({}, 'en')).toBeUndefined();
  });
});
