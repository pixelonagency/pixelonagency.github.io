import { describe, expect, test } from 'bun:test';
import { isJobBuilt, jobCrumbs, jobDescriptionHtml, jobPath } from './jobs';

describe('ilan adresi', () => {
  test('kariyer sayfasının altında durur', () => {
    expect(jobPath('tr', 'satis-ve-is-gelistirme-uzmani')).toBe('/kariyer/satis-ve-is-gelistirme-uzmani/');
  });
});

describe('ilan breadcrumb', () => {
  test('ana sayfa › kariyer › ilan', () => {
    expect(jobCrumbs({ locale: 'tr', title: 'Satış ve İş Geliştirme Uzmanı' })).toEqual([
      { label: 'Ana Sayfa', href: '/' },
      { label: 'Kariyer', href: '/kariyer/' },
      { label: 'Satış ve İş Geliştirme Uzmanı' },
    ]);
  });
});

describe('ilan yayın durumu', () => {
  test('yayında ilan her ortamda üretilir', () => {
    expect(isJobBuilt('published', false)).toBe(true);
    expect(isJobBuilt('published', true)).toBe(true);
  });

  test('taslak yalnızca geliştirme sunucusunda görünür, üretim build’ine girmez', () => {
    expect(isJobBuilt('draft', true)).toBe(true);
    expect(isJobBuilt('draft', false)).toBe(false);
  });
});

describe('ilan açıklaması (JobPosting description)', () => {
  test('sayfada görünen metin ve maddelerden üretilir', () => {
    const html = jobDescriptionHtml([
      { type: 'hero', lead: 'Bir çalışma arkadaşı arıyoruz.' },
      { type: 'text', heading: 'Pozisyon', body: 'İlk paragraf.\n\nİkinci paragraf.' },
      { type: 'bullets', heading: 'Neler yapacaksın?', items: ['Görüşme yapmak.', 'Teklif hazırlamak.'] },
      { type: 'cta', heading: 'Başvur' },
    ]);

    expect(html).toBe(
      '<p>Bir çalışma arkadaşı arıyoruz.</p>' +
        '<h2>Pozisyon</h2><p>İlk paragraf.</p><p>İkinci paragraf.</p>' +
        '<h2>Neler yapacaksın?</h2><ul><li>Görüşme yapmak.</li><li>Teklif hazırlamak.</li></ul>',
    );
  });

  test('HTML karakterlerini kaçırır', () => {
    expect(jobDescriptionHtml([{ type: 'text', body: 'A & B <c>' }])).toBe('<p>A &amp; B &lt;c&gt;</p>');
  });
});
