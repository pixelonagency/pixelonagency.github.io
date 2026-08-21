import { describe, expect, test } from 'bun:test';
import { buildLlmsTxt } from './llms';

const build = (): string =>
  buildLlmsTxt({
    site: 'https://pixelon.com.tr/',
    title: 'Pixelon',
    summary: '360° dijital ajans.',
    sections: [
      {
        heading: 'Hizmetler',
        links: [
          { label: 'Web Tasarım', path: '/hizmetlerimiz/web-tasarim-ve-yazilim/', description: 'Kurumsal site' },
          { label: 'SEO', path: '/hizmetlerimiz/seo-ve-icerik-pazarlamasi/' },
        ],
      },
      { heading: 'Boş Bölüm', links: [] },
    ],
  });

describe('buildLlmsTxt', () => {
  test('llmstxt.org biçimiyle başlar: H1, ardından blockquote özet', () => {
    const lines = build().split('\n');
    expect(lines[0]).toBe('# Pixelon');
    expect(lines[2]).toBe('> 360° dijital ajans.');
  });

  test('bölümleri H2, bağlantıları mutlak adresli madde olarak yazar', () => {
    const body = build();
    expect(body).toContain('## Hizmetler');
    expect(body).toContain(
      '- [Web Tasarım](https://pixelon.com.tr/hizmetlerimiz/web-tasarim-ve-yazilim/): Kurumsal site',
    );
  });

  test('açıklaması olmayan bağlantıda iki nokta üst üste eklenmez', () => {
    expect(build()).toContain('- [SEO](https://pixelon.com.tr/hizmetlerimiz/seo-ve-icerik-pazarlamasi/)\n');
  });

  test('bağlantısı olmayan bölüm hiç yazılmaz', () => {
    expect(build()).not.toContain('Boş Bölüm');
  });

  test('adres tekrarında çift eğik çizgi oluşmaz', () => {
    expect(build()).not.toContain('tr//');
  });

  test('dosya tek satır sonuyla biter', () => {
    expect(build().endsWith('\n')).toBe(true);
    expect(build().endsWith('\n\n')).toBe(false);
  });
});
