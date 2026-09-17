import { describe, expect, test } from 'bun:test';
import {
  alternatesFor,
  DEFAULT_LOCALE,
  isLocale,
  hasLanguageSwitcher,
  isPublishedLocale,
  languageSwitcherLocales,
  localePrefix,
  LOCALES,
  localizedPath,
  parseLocalizedPath,
  pickLocalized,
  PUBLISHED_LOCALES,
  resolveEntryId,
  ROUTE_SLUGS,
  stripLocale,
  type Locale,
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
    expect(localizedPath('home', 'en')).toBe('/en/');
  });

  test('varsayılan dilde sayfa slug’ı Türkçedir', () => {
    expect(localizedPath('services', 'tr')).toBe('/hizmetlerimiz/');
  });

  test('ikincil dilde slug o dile çevrilir', () => {
    expect(localizedPath('services', 'en')).toBe('/en/services/');
  });

  test('her sayfa anahtarı her dilde bir slug tanımlar', () => {
    for (const locale of LOCALES) {
      for (const path of Object.keys(alternatesFor('home'))) void path;
      expect(typeof localizedPath('contact', locale)).toBe('string');
    }
  });

  test('alt kaynak (detay sayfası) slug’ı sona eklenir', () => {
    expect(localizedPath('services', 'tr', 'seo-ve-icerik-pazarlamasi')).toBe(
      '/hizmetlerimiz/seo-ve-icerik-pazarlamasi/',
    );
    expect(localizedPath('services', 'en', 'seo-and-content-marketing')).toBe(
      '/en/services/seo-and-content-marketing/',
    );
  });

  test('blog detayında da aynı kural geçerlidir', () => {
    expect(localizedPath('blog', 'en', 'a-post')).toBe('/en/blog/a-post/');
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
  test('yalnızca YAYINLANAN diller için karşılık üretir', () => {
    expect(alternatesFor('services')).toEqual({ tr: '/hizmetlerimiz/' });
  });

  test('detay sayfasında dile özgü slug kullanılabilir', () => {
    expect(alternatesFor('blog', { tr: 'yazi', en: 'post' })).toEqual({ tr: '/blog/yazi/' });
  });

  test('bir dilde karşılık yoksa o dil listeden düşer', () => {
    expect(alternatesFor('blog', { tr: 'yazi' })).toEqual({ tr: '/blog/yazi/' });
  });

  test('yayından kalkmış dilin slug’ı bilinse bile hreflang’a girmez', () => {
    /* `ROUTE_SLUGS` İngilizce slug’ı hâlâ taşır (301 haritası ve geri açış için),
       ama yayında olmayan bir URL’e hreflang vermek Google’a hayalet sayfa gösterir. */
    expect(Object.keys(alternatesFor('about'))).toEqual(['tr']);
  });
});

describe('PUBLISHED_LOCALES — yayın kapısı', () => {
  test('şu an yalnızca Türkçe yayında', () => {
    expect([...PUBLISHED_LOCALES]).toEqual(['tr']);
  });

  test('yayınlanan her dil aynı zamanda bilinen bir dildir', () => {
    for (const locale of PUBLISHED_LOCALES) expect(isLocale(locale)).toBe(true);
  });

  test('varsayılan dil her zaman yayında olmalıdır', () => {
    expect(isPublishedLocale(DEFAULT_LOCALE)).toBe(true);
  });

  test('İngilizce biliniyor ama yayında değil', () => {
    expect(isLocale('en')).toBe(true);
    expect(isPublishedLocale('en')).toBe(false);
  });

  test('bilinmeyen dil yayında da sayılmaz', () => {
    expect(isPublishedLocale('de')).toBe(false);
  });

  test('İngilizce slug tablosu korunur — geri açış ve 301 haritası buna dayanır', () => {
    expect(ROUTE_SLUGS.about.en).toBe('about-us');
    expect(ROUTE_SLUGS.services.en).toBe('services');
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

describe('languageSwitcherLocales', () => {
  test('karşılığı olan dilleri, geçerli dille birlikte döner', () => {
    expect(languageSwitcherLocales('tr', { tr: '/blog/x/', en: '/en/blog/x/' })).toEqual(['tr', 'en']);
  });

  test('çevirisi olmayan sayfada boş dizi döner — anahtar hiç çizilmez', () => {
    expect(languageSwitcherLocales('tr', { tr: '/blog/x/' })).toEqual([]);
  });

  test('alternates hiç verilmezse boş dizi döner', () => {
    expect(languageSwitcherLocales('tr', {})).toEqual([]);
  });

  test('boş dizeli karşılık yok sayılır', () => {
    expect(languageSwitcherLocales('tr', { tr: '/blog/x/', en: '' })).toEqual([]);
  });

  test('İngilizce sayfada Türkçe karşılığı yoksa da gizlenir — kural simetrik', () => {
    expect(languageSwitcherLocales('en', { en: '/en/only/' })).toEqual([]);
  });

  test('geçerli dilin kendi girdisi eksik olsa bile karşılık varsa gösterilir', () => {
    expect(languageSwitcherLocales('tr', { en: '/en/blog/x/' })).toEqual(['tr', 'en']);
  });
});

describe('hasLanguageSwitcher — seçicinin ÇEVRESİNİ çizen tek kural', () => {
  /*
   * Seçicinin kendisi `languageSwitcherLocales(...).length > 1` ile gizleniyordu, ama
   * Header'daki ETİKET ve sarmalayıcı bu kuralı bilmiyordu. 16 Eyl 2026'da İngilizce
   * yayından kalkınca mobil menüde altı boş bir "Dil" başlığı, masaüstünde de boş bir
   * flex öğesi (16px ölü boşluk) kaldı. Kural artık tek yerde.
   */
  test('karşılık varken true', () => {
    expect(hasLanguageSwitcher('tr', { tr: '/blog/x/', en: '/en/blog/x/' })).toBe(true);
  });

  test('tek dil yayındayken false — etiket de sarmalayıcı da çizilmez', () => {
    expect(hasLanguageSwitcher('tr', { tr: '/blog/x/' })).toBe(false);
  });

  test('alternates boşken false', () => {
    expect(hasLanguageSwitcher('tr', {})).toBe(false);
  });

  test('seçicinin kendi kuralıyla birebir aynı cevabı verir', () => {
    const durumlar: Partial<Record<Locale, string>>[] = [
      {},
      { tr: '/blog/x/' },
      { en: '/en/blog/x/' },
      { tr: '/blog/x/', en: '' },
      { tr: '/blog/x/', en: '/en/blog/x/' },
    ];
    for (const alternates of durumlar) {
      expect({ alternates, sonuc: hasLanguageSwitcher('tr', alternates) }).toEqual({
        alternates,
        sonuc: languageSwitcherLocales('tr', alternates).length > 1,
      });
    }
  });
});
