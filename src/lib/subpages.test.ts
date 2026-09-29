import { describe, expect, test } from 'bun:test';
import { isSubpageBuilt, subpageCrumbs, subpagePath } from './subpages';

describe('alt sayfa adresi', () => {
  test('hizmetin altında durur', () => {
    expect(subpagePath('tr', 'web-tasarim-ve-yazilim', 'kurumsal-web-tasarim')).toBe(
      '/hizmetlerimiz/web-tasarim-ve-yazilim/kurumsal-web-tasarim/',
    );
  });
});

describe('alt sayfa breadcrumb', () => {
  test('ana sayfa › hizmetlerimiz › üst hizmet › sayfa', () => {
    expect(
      subpageCrumbs({
        locale: 'tr',
        parentKey: 'web-tasarim-ve-yazilim',
        parentTitle: 'Web Tasarım ve Yazılım',
        title: 'Kurumsal Web Tasarım',
      }),
    ).toEqual([
      { label: 'Ana Sayfa', href: '/' },
      { label: 'Hizmetlerimiz', href: '/hizmetlerimiz/' },
      { label: 'Web Tasarım ve Yazılım', href: '/hizmetlerimiz/web-tasarim-ve-yazilim/' },
      { label: 'Kurumsal Web Tasarım' },
    ]);
  });
});

describe('alt sayfa yayın durumu', () => {
  test('yayında sayfa her ortamda üretilir', () => {
    expect(isSubpageBuilt('published', false)).toBe(true);
    expect(isSubpageBuilt('published', true)).toBe(true);
  });

  test('taslak yalnızca geliştirme sunucusunda görünür, üretim build’ine girmez', () => {
    expect(isSubpageBuilt('draft', true)).toBe(true);
    expect(isSubpageBuilt('draft', false)).toBe(false);
  });
});
