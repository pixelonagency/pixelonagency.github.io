/**
 * Portfolyo sunumunun sayfa listesi.
 *
 * Kaynak, 105 A4 sayfalık bir sunum PDF'iydi (1,04 GB). Görseller 4096×4096 piksele ve
 * 6125 ppi'ye kadar KAYIPSIZ gömülmüştü; ekranda 150 ppi yeterli olduğu için bu, ihtiyacın
 * ~40 katıydı. Sayfalar 1240 px genişliğinde WebP'ye çevrildi: toplam 7,1 MB, sayfa başına
 * ortalama 68 KB. Metinler PDF'te vektördü, render sırasında keskinliğini koruyor.
 *
 * PDF YERİNE SAYFA GÖRSELİ — neden: PDF tek bir dosyadır, tarayıcı tamamı inmeden ilk
 * sayfayı bile gösteremez. 16,5 MB'a sıkıştırılmış hâli bile mobilde 10–20 saniye demekti.
 * Ayrı görsellerde ilk ekran ~150 KB ve gerisi kaydırdıkça geliyor; üstelik içerik arama
 * motoruna da görünür hâle geliyor.
 *
 * Dosyalar `public/media/` altında durur, yani Astro'nun varlık hattından geçmez ve
 * parmak izi almaz — zaten optimize edilmiş oldukları için gerek de yok. `_headers`
 * içindeki `/media/*` kuralı bir aylık cache verir. Adres `mediaUrl()` üzerinden
 * basılmalı ki R2'ye taşınırsa yollar tek yerden değişsin.
 */

/** Sunumdaki toplam sayfa. Dosya sayısıyla birlikte `portfolio.test.ts` doğrular. */
export const PORTFOLIO_PAGE_COUNT = 105;

/** Hemen yüklenen sayfa sayısı — ilki ekranda, ikincisi hemen altında. */
export const EAGER_PAGES = 2;

/** Render çözünürlüğü: A4 @ 150 ppi. Oran sabit, ölçü tek yerden gelir (CLS yok). */
const PAGE_WIDTH = 1240;
const PAGE_HEIGHT = 1755;

const DIR = '/media/portfolyo/';

export interface PortfolioPage {
  page: number;
  src: string;
  alt: string;
  /** `true` → `loading="eager"`; yalnızca ilk sayfalar. */
  eager: boolean;
  width: number;
  height: number;
}

/** `3` → `/media/portfolyo/pg-003.webp` */
export function portfolioPageSrc(page: number): string {
  if (!Number.isInteger(page) || page < 1 || page > PORTFOLIO_PAGE_COUNT) {
    throw new RangeError(`Portfolyo sayfası aralık dışı: ${page} (1–${PORTFOLIO_PAGE_COUNT})`);
  }
  return `${DIR}pg-${String(page).padStart(3, '0')}.webp`;
}

export function portfolioPages(): PortfolioPage[] {
  return Array.from({ length: PORTFOLIO_PAGE_COUNT }, (_, index) => {
    const page = index + 1;
    return {
      page,
      src: portfolioPageSrc(page),
      /*
       * Sayfaların metni görselin içinde; ekran okuyucu için anlamlı tek bilgi sıradır.
       * "Portfolyo sayfası 7 / 105" gibi bir metin, konumu duyurur ve 105 kez tekrar
       * eden anlamsız bir alt metin üretmez.
       */
      alt: `Pixelon portfolyo — sayfa ${page} / ${PORTFOLIO_PAGE_COUNT}`,
      eager: page <= EAGER_PAGES,
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
    };
  });
}
