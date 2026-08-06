import { describe, expect, test } from 'bun:test';
import { LOCALES } from './i18n';
import { buildPrimaryNav, formMessages, serviceHref, t, UI_KEYS } from './ui';

describe('t — arayüz sözlüğü', () => {
  test('istenen dildeki dizeyi döner', () => {
    expect(t('nav.about', 'tr')).toBe('Biz Kimiz?');
    expect(t('nav.about', 'en')).toBe('About Us');
  });

  test('her anahtar her dilde tanımlıdır — eksik çeviri kalmaz', () => {
    const eksik: string[] = [];
    for (const key of UI_KEYS) {
      for (const locale of LOCALES) {
        const value = t(key, locale);
        if (!value || value === key) eksik.push(`${key}/${locale}`);
      }
    }
    expect(eksik).toEqual([]);
  });

  test('bilinmeyen anahtarda anahtarın kendisini döner (sessizce boş bırakmaz)', () => {
    // @ts-expect-error — kasıtlı geçersiz anahtar
    expect(t('yok.boyle.bir.anahtar', 'tr')).toBe('yok.boyle.bir.anahtar');
  });

  /**
   * Dil değiştirici bilinçli istisnadır: İngilizce sayfada gösterilen etiket, gidilecek
   * dilin KENDİ adıdır ("Türkçeye geç") — çevrilseydi amacını yitirirdi.
   */
  const DIL_ADI_ANAHTARLARI: readonly string[] = ['lang.switchTo'];

  test('İngilizce karşılıklarda Türkçe harf kalmaz', () => {
    const kirli = UI_KEYS.filter((key) => !DIL_ADI_ANAHTARLARI.includes(key) && /[çğıöşüÇĞİÖŞÜ]/.test(t(key, 'en')));
    expect(kirli).toEqual([]);
  });

  test('İngilizce karşılıklarda eğik tırnak yerine düz tırnak kullanılır', () => {
    const kirli = UI_KEYS.filter((key) => /[‘’“”]/.test(t(key, 'en')));
    expect(kirli).toEqual([]);
  });
});

describe('formMessages', () => {
  test('her dilde sekiz alanın da metni doludur', () => {
    for (const locale of LOCALES) {
      const messages = formMessages(locale);
      expect(Object.keys(messages).sort()).toEqual([
        'company',
        'consent',
        'email',
        'message',
        'name',
        'phone',
        'services',
        'website',
      ]);
      for (const value of Object.values(messages)) expect(value.length).toBeGreaterThan(0);
    }
  });

  test('diller birbirinden farklı metinler döner', () => {
    expect(formMessages('en').name).not.toBe(formMessages('tr').name);
  });

  test('sözlükteki hata anahtarlarıyla aynı metni verir', () => {
    expect(formMessages('en').services).toBe(t('form.error.services', 'en'));
  });
});

describe('serviceHref', () => {
  test('varsayılan dilde Türkçe yol üretir', () => {
    expect(serviceHref('seo-ve-icerik-pazarlamasi', 'tr')).toBe('/hizmetlerimiz/seo-ve-icerik-pazarlamasi');
  });

  test('ikincil dilde ön ekli ve çevrilmiş yol üretir', () => {
    expect(serviceHref('seo-and-content-marketing', 'en')).toBe('/en/services/seo-and-content-marketing');
  });
});

describe('buildPrimaryNav', () => {
  test('referans tasarımdaki sırayı korur', () => {
    expect(buildPrimaryNav('tr').map((item) => item.label)).toEqual([
      'Biz Kimiz?',
      'Hizmetlerimiz',
      'Projelerimiz',
      'Referanslarımız',
      'Kariyer',
      'İletişim',
    ]);
  });

  test('İngilizcede etiketler çevrilir, sıra korunur', () => {
    expect(buildPrimaryNav('en').map((item) => item.label)).toEqual([
      'About Us',
      'Services',
      'Projects',
      'References',
      'Careers',
      'Contact',
    ]);
  });

  test('her dilde bağlantılar o dilin ön ekini taşır', () => {
    for (const item of buildPrimaryNav('en')) {
      expect(item.href.startsWith('/en')).toBe(true);
    }
    for (const item of buildPrimaryNav('tr')) {
      expect(item.href.startsWith('/en')).toBe(false);
    }
  });

  test('Hizmetlerimiz dropdown ebeveyni olarak işaretlidir', () => {
    for (const locale of LOCALES) {
      const dropdown = buildPrimaryNav(locale).filter((item) => item.hasDropdown);
      expect(dropdown).toHaveLength(1);
    }
  });
});
