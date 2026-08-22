/**
 * Hizmet/sayfa gövde metinlerinde satır içi bağlantı desteği — sözleşme testleri.
 *
 * Bölüm bileşenleri `inlineHtml()` üzerinden metin basıyor. Bu testler yardımcının
 * bölüm metinleri bağlamındaki davranışını kilitliyor:
 *   1. Köşeli parantez içermeyen metin AYNEN kalmalı (20 mevcut hizmet sayfası buna bağlı).
 *   2. Güvensiz adres bağlantıya çevrilmemeli.
 *   3. Site içi yol kanonik biçime çekilmeli — aksi hâlde her bağlantı bir 301 harcar.
 */
import { describe, expect, test } from 'bun:test';
import { inlineHtml } from '../article/types';

describe('geriye dönük uyumluluk', () => {
  test('düz metin değişmeden geçer', () => {
    const text = 'Markanızın yapısını yansıtan, yönetilebilir web siteleri tasarlıyoruz.';
    expect(inlineHtml(text)).toBe(text);
  });

  test('köşeli parantez tek başına bağlantı üretmez', () => {
    expect(inlineHtml('Kaynak [1] ve [2] numaralı maddeler.')).toBe('Kaynak [1] ve [2] numaralı maddeler.');
  });

  test('parantez tek başına bağlantı üretmez', () => {
    expect(inlineHtml('Hız (Core Web Vitals) ölçülür.')).toBe('Hız (Core Web Vitals) ölçülür.');
  });

  test('Türkçe karakterler bozulmaz', () => {
    expect(inlineHtml('İçerik yönetimi ve çok dillilik şart.')).toBe('İçerik yönetimi ve çok dillilik şart.');
  });
});

describe('bağlantıya çevirme', () => {
  test('site içi yol bağlantı olur', () => {
    expect(inlineHtml('Bkz. [kurumsal web tasarım](/hizmetlerimiz/kurumsal-web-tasarim/).')).toBe(
      'Bkz. <a href="/hizmetlerimiz/kurumsal-web-tasarim/">kurumsal web tasarım</a>.',
    );
  });

  test('aynı metinde birden fazla bağlantı çalışır', () => {
    const out = inlineHtml('[bir](/a/) ve [iki](/b/)');
    expect(out).toBe('<a href="/a/">bir</a> ve <a href="/b/">iki</a>');
  });

  test('https bağlantısı yeni sekmede ve rel korumasıyla açılır', () => {
    expect(inlineHtml('[kaynak](https://example.com/x)')).toBe(
      '<a href="https://example.com/x" target="_blank" rel="noopener noreferrer">kaynak</a>',
    );
  });
});

describe('güvenlik', () => {
  for (const unsafe of ['javascript:alert(1)', 'data:text/html;base64,x', 'http://example.com', '//evil.com']) {
    test(`${unsafe} bağlantıya ÇEVRİLMEZ`, () => {
      const out = inlineHtml(`[tıkla](${unsafe})`);
      expect(out).not.toContain('<a ');
      expect(out).toContain('[tıkla]');
    });
  }

  test('ham HTML kaçırılır — script enjekte edilemez', () => {
    const out = inlineHtml('<script>alert(1)</script>');
    expect(out).not.toContain('<script>');
    expect(out).toContain('&lt;script&gt;');
  });

  test('bağlantı etiketi içindeki HTML de kaçırılır', () => {
    expect(inlineHtml('[<b>kalın</b>](/a/)')).toBe('<a href="/a/">&lt;b&gt;kalın&lt;/b&gt;</a>');
  });
});
