import { describe, expect, test } from 'bun:test';
import { inlineHtml } from './types';

/**
 * Gövde metnindeki satır içi bağlantılar editörün elinden çıkar; `/iletisim`
 * yazmak doğaldır ama sunucu bunu `/iletisim/` adresine 301 ile taşır. Bağlantı
 * HTML'e çevrilirken kanonikleştirilir — makale içi her bağlantı doğrudan hedefe gider.
 */
describe('inlineHtml — satır içi bağlantı', () => {
  test('site içi bağlantıyı kanonik biçimde basar', () => {
    expect(inlineHtml('[dönüşüm takibi](/blog/donusum-takibi-nedir) yazısı')).toBe(
      '<a href="/blog/donusum-takibi-nedir/">dönüşüm takibi</a> yazısı',
    );
  });

  test('çapa bağlantısında yol kısmı eğik çizgi alır, çapa korunur', () => {
    expect(inlineHtml('[projeler](/hizmetlerimiz/saglik-turizmi-danismanligi#projeler)')).toBe(
      '<a href="/hizmetlerimiz/saglik-turizmi-danismanligi/#projeler">projeler</a>',
    );
  });

  test('dış bağlantı olduğu gibi kalır ve yeni sekmede açılır', () => {
    expect(inlineHtml('[kaynak](https://example.com/a)')).toBe(
      '<a href="https://example.com/a" target="_blank" rel="noopener noreferrer">kaynak</a>',
    );
  });

  test('güvensiz şema bağlanmaz, düz metin olarak kalır', () => {
    expect(inlineHtml('[tıkla](javascript:alert(1))')).toBe('[tıkla](javascript:alert(1))');
  });

  test('metin kaçırılır — ham HTML geçmez', () => {
    expect(inlineHtml('<script>x</script>')).toBe('&lt;script&gt;x&lt;/script&gt;');
  });
});
