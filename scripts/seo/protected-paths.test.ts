/**
 * Korunan yolların cerrahi geri alınması — regresyon testleri.
 *
 * Korunan davranış: ajanın temizliği, sahibin commit'lenmemiş işine ASLA
 * dokunmaz. 29 Ağu 2026'da `src/` ve `public/` altında commit'lenmemiş 137
 * dosya vardı; `agent.sh` ihlal gördüğünde `git checkout -- src public`
 * çalıştırıyordu ve bu komut kimin yazdığını ayırt etmiyor. Ajan o koşuda
 * korunan yollardan birine dokunsaydı, sahibin bir haftalık işi de sessizce
 * geri alınacaktı.
 */
import { describe, expect, test } from 'bun:test';
import { agentDirtiedPaths, ownerDirtiedPaths } from './protected-paths.mjs';

/** `git status --porcelain` çıktısı biçimi: iki karakter durum + boşluk + yol. */
const before = [' M src/pages/index.astro', '?? public/media/projects/'].join('\n');

describe('agentDirtiedPaths', () => {
  test('yalnızca koşu sırasında yeni kirlenen yolları döner', () => {
    const after = [' M src/pages/index.astro', '?? public/media/projects/', ' M src/lib/seo.ts'].join('\n');
    expect(agentDirtiedPaths(before, after)).toEqual(['src/lib/seo.ts']);
  });

  test('hiçbir şey eklenmediyse boş dizi — geri alma çalışmaz', () => {
    expect(agentDirtiedPaths(before, before)).toEqual([]);
  });

  test('koşu öncesi temizken ajanın kirlettiği her şey döner', () => {
    const after = [' M src/a.astro', '?? public/b.txt'].join('\n');
    expect(agentDirtiedPaths('', after)).toEqual(['src/a.astro', 'public/b.txt']);
  });

  test('sahibin dosyası koşu sırasında temizlenmişse geri alma listesine girmez', () => {
    expect(agentDirtiedPaths(before, ' M src/pages/index.astro')).toEqual([]);
  });

  test('yeniden adlandırma okunda hedef yol alınır', () => {
    const after = 'R  src/eski.astro -> src/yeni.astro';
    expect(agentDirtiedPaths('', after)).toEqual(['src/yeni.astro']);
  });

  test('boş satırlar yok sayılır', () => {
    expect(agentDirtiedPaths('', '\n M src/a.astro\n\n')).toEqual(['src/a.astro']);
  });
});

describe('ownerDirtiedPaths', () => {
  test('koşu öncesinde kirli olanlar sahibin işi sayılır', () => {
    expect(ownerDirtiedPaths(before)).toEqual(['src/pages/index.astro', 'public/media/projects/']);
  });

  test('temiz ağaçta boş dizi', () => {
    expect(ownerDirtiedPaths('')).toEqual([]);
  });
});
