import { describe, expect, test } from 'bun:test';
import { serviceSlugForChip } from './service-chip';

/*
 * Vaka sayfaları MÜŞTERİ bazlıdır: bir proje o marka için yapılan bütün
 * hizmetleri barındırır (Dentasay'da logo, web, reklam, video, sosyal medya…).
 * Bu yüzden vaka tek bir hizmete daraltılmaz; hero'daki hizmet çipleri
 * eşleştikleri hizmet sayfasına AYRI AYRI bağlanır. Böylece küme çift yönlü
 * çalışır: hizmet → proje bağlantısı zaten vardı, proje → hizmet yoktu.
 */
describe('serviceSlugForChip', () => {
  test('web tasarım varyantlarını yakalar', () => {
    for (const chip of ['Web Tasarımı', 'Web Sitesi Tasarımı & Geliştirme', 'web tasarim']) {
      expect(serviceSlugForChip(chip)).toBe('web-tasarim-ve-yazilim');
    }
  });

  test('sosyal medya varyantlarını yakalar', () => {
    expect(serviceSlugForChip('Sosyal Medya Yönetimi')).toBe('sosyal-medya-yonetimi');
    expect(serviceSlugForChip('Sosyal Medya Tasarımları')).toBe('sosyal-medya-yonetimi');
  });

  test('reklam varyantlarını yakalar', () => {
    expect(serviceSlugForChip('Dijital Reklam Yönetimi')).toBe('dijital-reklam-yonetimi');
    expect(serviceSlugForChip('Reklam Tasarımı & Yönetimi')).toBe('dijital-reklam-yonetimi');
  });

  test('marka ve kimlik varyantlarını yakalar', () => {
    expect(serviceSlugForChip('Logo Tasarımı')).toBe('marka-ve-kurumsal-kimlik');
    expect(serviceSlugForChip('Logo & Kurumsal Kimlik')).toBe('marka-ve-kurumsal-kimlik');
    expect(serviceSlugForChip('Marka Kılavuzu')).toBe('marka-ve-kurumsal-kimlik');
  });

  test('SEO ve içerik varyantlarını yakalar', () => {
    expect(serviceSlugForChip('SEO')).toBe('seo-ve-icerik-pazarlamasi');
    expect(serviceSlugForChip('SEO & İçerik Yapısı')).toBe('seo-ve-icerik-pazarlamasi');
    expect(serviceSlugForChip('İçerik Üretimi')).toBe('seo-ve-icerik-pazarlamasi');
  });

  test('e-ticaret varyantlarını yakalar', () => {
    expect(serviceSlugForChip('Ürün Satış Yapısı')).toBe('e-ticaret-cozumleri');
    expect(serviceSlugForChip('Ürün Kataloğu Mimarisi')).toBe('e-ticaret-cozumleri');
  });

  test('sağlık turizmi varyantlarını yakalar', () => {
    expect(serviceSlugForChip('Uluslararası Hasta Kazanımı')).toBe('saglik-turizmi-danismanligi');
    expect(serviceSlugForChip('Hasta İletişimi')).toBe('saglik-turizmi-danismanligi');
  });

  /*
   * Hizmet sayfası OLMAYAN kalemler bağlanmaz: kırık link üretmektense
   * düz metin kalması doğru. Video ve UX/UI şu an ayrı sayfa değil.
   */
  test('karşılığı olmayan çipler için null döner', () => {
    expect(serviceSlugForChip('Video Prodüksiyon')).toBeNull();
    expect(serviceSlugForChip('Influencer Marketing')).toBeNull();
    expect(serviceSlugForChip('Mobil Uygulama Tasarımı')).toBeNull();
    expect(serviceSlugForChip('')).toBeNull();
  });

  /* "Marka İletişimi" hem marka hem iletişim çağrıştırıyor; marka kazanır. */
  test('belirsiz kalemde en spesifik eşleşme kazanır', () => {
    expect(serviceSlugForChip('Marka İletişimi')).toBe('marka-ve-kurumsal-kimlik');
  });
});
