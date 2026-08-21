import { describe, expect, test } from 'bun:test';
import { internalHref } from './url';

/**
 * Sunucu (GitHub Pages) `/biz-kimiz` isteğini `/biz-kimiz/` adresine 301 ile taşır.
 * Site içi bağlantılar eğik çizgisiz yazıldığında her tıklama bir yönlendirme
 * harcar: tarama bütçesi ve bağlantı değeri kaybolur, aynı sayfa iki ayrı URL
 * olarak taranır. `internalHref()` bu kaymayı tek noktada kapatır.
 */
describe('internalHref', () => {
  test('site içi yola sondaki eğik çizgiyi ekler', () => {
    expect(internalHref('/biz-kimiz')).toBe('/biz-kimiz/');
    expect(internalHref('/hizmetlerimiz/web-tasarim-ve-yazilim')).toBe('/hizmetlerimiz/web-tasarim-ve-yazilim/');
    expect(internalHref('/en/services')).toBe('/en/services/');
  });

  test('zaten eğik çizgiyle biten yolu değiştirmez', () => {
    expect(internalHref('/blog/')).toBe('/blog/');
    expect(internalHref('/')).toBe('/');
  });

  test('çapayı ve sorgu dizesini yolun sonrasında korur', () => {
    expect(internalHref('/projelerimiz#referanslar')).toBe('/projelerimiz/#referanslar');
    expect(internalHref('/blog?sayfa=2')).toBe('/blog/?sayfa=2');
    expect(internalHref('/iletisim/#form')).toBe('/iletisim/#form');
  });

  test('yalnız çapa olan bağlantıya dokunmaz', () => {
    expect(internalHref('#main')).toBe('#main');
    expect(internalHref('#hizmetler')).toBe('#hizmetler');
  });

  test('dış bağlantılara ve protokollü adreslere dokunmaz', () => {
    expect(internalHref('https://wa.me/905065229034')).toBe('https://wa.me/905065229034');
    expect(internalHref('http://example.com/sayfa')).toBe('http://example.com/sayfa');
    expect(internalHref('//cdn.example.com/x')).toBe('//cdn.example.com/x');
    expect(internalHref('mailto:sosyal@pixelon.com.tr')).toBe('mailto:sosyal@pixelon.com.tr');
    expect(internalHref('tel:+905065229034')).toBe('tel:+905065229034');
  });

  test('dosya uzantılı yollar dizin değildir — eğik çizgi almaz', () => {
    expect(internalHref('/sitemap-index.xml')).toBe('/sitemap-index.xml');
    expect(internalHref('/favicon.svg')).toBe('/favicon.svg');
    expect(internalHref('/robots.txt')).toBe('/robots.txt');
  });

  test('boş değeri olduğu gibi bırakır', () => {
    expect(internalHref('')).toBe('');
  });
});
