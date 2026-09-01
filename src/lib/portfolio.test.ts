import { describe, expect, test } from 'bun:test';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { EAGER_PAGES, PORTFOLIO_PAGE_COUNT, portfolioPages, portfolioPageSrc } from './portfolio';

/**
 * Portfolyo sunumu 105 A4 sayfadan oluşuyor ve her sayfa ayrı bir WebP.
 *
 * Kaynak PDF 1,04 GB'tı: görseller 6125 ppi'ye kadar kayıpsız gömülmüştü (ekran için
 * 150 ppi yeterli). Sayfalar 1240 px genişliğinde WebP'ye çevrilince toplam 7,1 MB'a
 * indi — sıkıştırılmış PDF'in bile yarısından hafif. Asıl kazanç KISMİ YÜKLEME: PDF'te
 * tarayıcı dosyanın tamamı inmeden tek sayfa göstermez, burada ilk ekran ~150 KB.
 */

const PUBLIC = join(import.meta.dir, '..', '..', 'public');

describe('portfolioPageSrc', () => {
  test('sayfa numarasını üç haneye tamamlar', () => {
    expect(portfolioPageSrc(1)).toBe('/media/portfolyo/pg-001.webp');
    expect(portfolioPageSrc(42)).toBe('/media/portfolyo/pg-042.webp');
    expect(portfolioPageSrc(105)).toBe('/media/portfolyo/pg-105.webp');
  });

  test('aralık dışını reddeder', () => {
    /* Sessizce var olmayan bir yol üretmek 404'ü sayfaya taşırdı. */
    expect(() => portfolioPageSrc(0)).toThrow();
    expect(() => portfolioPageSrc(PORTFOLIO_PAGE_COUNT + 1)).toThrow();
  });
});

describe('portfolioPages', () => {
  const pages = portfolioPages();

  test('her sayfa için bir girdi üretir', () => {
    expect(pages).toHaveLength(PORTFOLIO_PAGE_COUNT);
    expect(pages[0]?.page).toBe(1);
    expect(pages.at(-1)?.page).toBe(PORTFOLIO_PAGE_COUNT);
  });

  test(`ilk ${EAGER_PAGES} sayfa hemen, gerisi tembel yüklenir`, () => {
    /*
     * Tembel yükleme burada bir optimizasyon değil, tasarımın kendisi: 105 görselin
     * hepsi birden istenirse sayfa 7,1 MB indirir ve PDF'ten farkı kalmaz.
     */
    expect(pages.filter((p) => p.eager)).toHaveLength(EAGER_PAGES);
    expect(pages.slice(0, EAGER_PAGES).every((p) => p.eager)).toBe(true);
    expect(pages.slice(EAGER_PAGES).some((p) => p.eager)).toBe(false);
  });

  test('boyut bilgisi taşır — CLS olmasın diye', () => {
    /*
     * Genişlik/yükseklik verilmezse 105 görsel yüklendikçe sayfa sıçrar. A4 oranı
     * sabit olduğu için ölçü tek yerden gelir.
     */
    for (const page of pages) {
      expect(page.width).toBeGreaterThan(0);
      expect(page.height).toBeGreaterThan(0);
      expect(page.width / page.height).toBeCloseTo(595 / 842, 2);
    }
  });

  test('her sayfanın alt metni sırasını söyler', () => {
    expect(pages[0]?.alt).toContain('1');
    expect(pages[0]?.alt).toContain(String(PORTFOLIO_PAGE_COUNT));
  });
});

describe('dosyalar diskte gerçekten var', () => {
  /*
   * Görseller `public/media/` altında duruyor ve Astro'nun varlık hattından GEÇMEZ —
   * yani eksik bir dosya build'i düşürmez, sessizce 404 olur. Bu test o sessizliği kapatır.
   */
  test('105 sayfanın tamamı public/media/portfolyo altında', () => {
    const missing = portfolioPages()
      .map((page) => page.src)
      .filter((src) => !existsSync(join(PUBLIC, src.replace(/^\//, ''))));

    expect(missing).toEqual([]);
  });
});
