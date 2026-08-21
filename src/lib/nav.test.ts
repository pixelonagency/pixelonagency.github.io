import { describe, expect, test } from 'bun:test';
import { buildServicesNav, isActiveRoute, PRIMARY_NAV, serviceHref } from './nav';

describe('serviceHref', () => {
  test('nests a service slug under /hizmetlerimiz', () => {
    expect(serviceHref('seo-ve-icerik-pazarlamasi')).toBe('/hizmetlerimiz/seo-ve-icerik-pazarlamasi/');
  });
});

describe('buildServicesNav', () => {
  const entries = [
    { id: 'ux-ui-tasarimi', data: { navLabel: 'UX/UI Tasarımı', order: 6 } },
    { id: 'web-tasarim-ve-yazilim', data: { navLabel: 'Web Tasarım ve Yazılım', order: 1 } },
    { id: 'sosyal-medya-yonetimi', data: { navLabel: 'Sosyal Medya Yönetimi', order: 2 } },
  ];

  test('orders services by their order field, not by id', () => {
    expect(buildServicesNav(entries).map((item) => item.label)).toEqual([
      'Web Tasarım ve Yazılım',
      'Sosyal Medya Yönetimi',
      'UX/UI Tasarımı',
    ]);
  });

  test('builds an href for each service', () => {
    expect(buildServicesNav(entries)[0]?.href).toBe('/hizmetlerimiz/web-tasarim-ve-yazilim/');
  });

  test('returns an empty list when there are no services yet', () => {
    expect(buildServicesNav([])).toEqual([]);
  });
});

describe('PRIMARY_NAV', () => {
  test('matches the reference header order', () => {
    expect(PRIMARY_NAV.map((item) => item.label)).toEqual([
      'Biz Kimiz?',
      'Hizmetlerimiz',
      'Projelerimiz',
      'Referanslarımız',
      'Kariyer',
      'İletişim',
    ]);
  });

  test('flags Hizmetlerimiz as the dropdown parent', () => {
    expect(PRIMARY_NAV.find((item) => item.label === 'Hizmetlerimiz')?.hasDropdown).toBe(true);
  });

  test('points every entry at a real internal route', () => {
    for (const item of PRIMARY_NAV) {
      expect(item.href.startsWith('/')).toBe(true);
      // Kanonik biçim: yol kısmı eğik çizgiyle biter, aksi halde her tıklama 301 harcar.
      expect(item.href.split('#')[0]?.endsWith('/')).toBe(true);
    }
  });
});

describe('isActiveRoute', () => {
  test('marks the exact route as active', () => {
    expect(isActiveRoute('/biz-kimiz', '/biz-kimiz')).toBe(true);
  });

  test('ignores a trailing slash difference', () => {
    expect(isActiveRoute('/biz-kimiz/', '/biz-kimiz')).toBe(true);
  });

  test('marks a service detail page as inside the Hizmetlerimiz section', () => {
    expect(isActiveRoute('/hizmetlerimiz/seo-ve-icerik-pazarlamasi', '/hizmetlerimiz')).toBe(true);
  });

  test('does not mark an unrelated route as active', () => {
    expect(isActiveRoute('/blog', '/biz-kimiz')).toBe(false);
  });

  test('treats the home route as active only for itself', () => {
    expect(isActiveRoute('/blog', '/')).toBe(false);
    expect(isActiveRoute('/', '/')).toBe(true);
  });
});
