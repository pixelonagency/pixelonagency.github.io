import { describe, expect, test } from 'bun:test';
import { mediaUrl, resolveMediaBase, withMediaBase } from './media';

/**
 * `/media/**` altındaki video ve posterler Astro'nun varlık hattından GEÇMEZ —
 * parmak izi almazlar, `public/` içinden olduğu gibi kopyalanırlar. Bu yüzden
 * onları bir CDN'e (Cloudflare R2 + `media.pixelon.com.tr`) taşımak, işaretlemede
 * tek bir taban adres değiştirmekten ibaret olmalı.
 *
 * Sözleşme: taban adres BOŞSA hiçbir şey değişmez. Bu kasıtlıdır — R2 kapanırsa,
 * alan adı düşerse ya da ortam değişkeni deploy'a ulaşmazsa site bugünkü hâliyle
 * çalışmaya devam eder (dosyalar `public/media/` içinde durduğu sürece).
 */
describe('withMediaBase', () => {
  test('taban adres boşken yolu aynen bırakır', () => {
    expect(withMediaBase('/media/hero/marka/hero-marka-desktop.mp4', '')).toBe(
      '/media/hero/marka/hero-marka-desktop.mp4',
    );
    expect(withMediaBase('/media/reels/kolajen.mp4', '   ')).toBe('/media/reels/kolajen.mp4');
  });

  test('taban adres doluyken /media önekini taban adresle değiştirir', () => {
    expect(withMediaBase('/media/reels/kolajen.mp4', 'https://media.pixelon.com.tr')).toBe(
      'https://media.pixelon.com.tr/reels/kolajen.mp4',
    );
    expect(withMediaBase('/media/projects/dentasay/eurovision.webp', 'https://media.pixelon.com.tr')).toBe(
      'https://media.pixelon.com.tr/projects/dentasay/eurovision.webp',
    );
  });

  /*
   * Taban adres CMS'ten ya da CI ortamından elle girilir; sondaki eğik çizgi
   * insan hatasıdır ve `//reels/...` gibi çift eğik çizgi üretmemelidir.
   */
  test('taban adresin sonundaki eğik çizgiyi yutar', () => {
    expect(withMediaBase('/media/reels/kolajen.mp4', 'https://media.pixelon.com.tr/')).toBe(
      'https://media.pixelon.com.tr/reels/kolajen.mp4',
    );
    expect(withMediaBase('/media/reels/kolajen.mp4', 'https://media.pixelon.com.tr///')).toBe(
      'https://media.pixelon.com.tr/reels/kolajen.mp4',
    );
  });

  /*
   * Sürümlü klasör (`/v2`) taban adrese eklenerek cache patlatılabilir; bu
   * durumda yükleyicideki `--key-prefix` ile aynı değer verilmelidir.
   */
  test('taban adresteki alt yolu korur', () => {
    expect(withMediaBase('/media/reels/kolajen.mp4', 'https://media.pixelon.com.tr/v2')).toBe(
      'https://media.pixelon.com.tr/v2/reels/kolajen.mp4',
    );
  });

  /*
   * Astro'nun kendi hattından geçen görseller (`/_astro/...`), CMS'in yazdığı
   * kaynak yolları (`/src/assets/...`) ve dış adresler CDN'e taşınmaz. Bunlara
   * dokunmak parmak izli asset'leri kırardı.
   */
  test('/media dışındaki yollara dokunmaz', () => {
    const base = 'https://media.pixelon.com.tr';
    expect(withMediaBase('/_astro/kolajen.a1b2c3.webp', base)).toBe('/_astro/kolajen.a1b2c3.webp');
    expect(withMediaBase('/src/assets/images/reels/kolajen.webp', base)).toBe('/src/assets/images/reels/kolajen.webp');
    expect(withMediaBase('https://cdn.example.com/a.mp4', base)).toBe('https://cdn.example.com/a.mp4');
    expect(withMediaBase('data:image/gif;base64,R0lGOD', base)).toBe('data:image/gif;base64,R0lGOD');
    expect(withMediaBase('/mediatek/a.mp4', base)).toBe('/mediatek/a.mp4');
    expect(withMediaBase('/media', base)).toBe('/media');
  });

  /*
   * Şemada video alanlarının çoğu opsiyoneldir (`desktopWebm`, `mobilePoster` …).
   * Yardımcı, tanımsız değeri tanımsız döndürmeli ki çağrı yerlerinde her alan
   * için ayrıca koşul yazmak gerekmesin.
   */
  test('tanımsız ve boş girdiyi olduğu gibi geri verir', () => {
    expect(withMediaBase(undefined, 'https://media.pixelon.com.tr')).toBeUndefined();
    expect(withMediaBase('', 'https://media.pixelon.com.tr')).toBe('');
  });
});

/**
 * Taban adres `PUBLIC_MEDIA_BASE` ortam değişkeninden okunur. Okuma saf bir
 * fonksiyona ayrıldı: aksi hâlde testin sonucu, testi çalıştıran makinenin
 * `.env` dosyasına bağlı olurdu.
 */
describe('resolveMediaBase', () => {
  test('değişken yoksa boş taban döndürür (bugünkü davranış)', () => {
    expect(resolveMediaBase({})).toBe('');
    expect(resolveMediaBase({ PUBLIC_MEDIA_BASE: undefined })).toBe('');
    expect(resolveMediaBase({ PUBLIC_MEDIA_BASE: '' })).toBe('');
  });

  test('değişken doluysa taban adresi verir', () => {
    expect(resolveMediaBase({ PUBLIC_MEDIA_BASE: 'https://media.pixelon.com.tr' })).toBe(
      'https://media.pixelon.com.tr',
    );
  });

  /*
   * Protokolsüz bir değer ("media.pixelon.com.tr") yolun başına yapışır ve
   * `media.pixelon.com.tr/reels/...` gibi göreli, kırık bir adres üretirdi.
   * Sessizce kırılmaktansa yok sayılır: site `/media/...` ile çalışmaya devam eder.
   */
  test('mutlak olmayan taban adresi yok sayar', () => {
    expect(resolveMediaBase({ PUBLIC_MEDIA_BASE: 'media.pixelon.com.tr' })).toBe('');
    expect(resolveMediaBase({ PUBLIC_MEDIA_BASE: 'reels' })).toBe('');
  });
});

/**
 * `mediaUrl()` ortama bağlıdır, bu yüzden burada yalnızca ortamdan BAĞIMSIZ
 * güvenceler doğrulanır: `/media` dışı yollar ve tanımsız değer her koşulda
 * dokunulmadan geçmelidir.
 */
describe('mediaUrl', () => {
  test('/media dışındaki yollar taban adresten etkilenmez', () => {
    expect(mediaUrl('/src/assets/images/reels/kolajen.webp')).toBe('/src/assets/images/reels/kolajen.webp');
    expect(mediaUrl('/_astro/kolajen.a1b2c3.webp')).toBe('/_astro/kolajen.a1b2c3.webp');
    expect(mediaUrl(undefined)).toBeUndefined();
  });
});
