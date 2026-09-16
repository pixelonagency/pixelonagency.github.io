import { describe, expect, test } from 'bun:test';

import { ROUTE_SLUGS, type PageKey } from '../../src/lib/i18n';
import { LEGACY } from './build-redirects.mjs';

/**
 * `LEGACY` elle bakılan bir tablodur; bu yüzden yapısal kuralları test koruyor.
 *
 * 16 Eyl 2026'da İngilizce bölüm yayından kaldırıldığında tabloya 40+ kalem eklendi
 * ve ÜÇ eski kalemin hedefi (`/en/services/...`) bir anda ölü URL'e dönüştü. Aşağıdaki
 * "zincir yok" ve "hedef İngilizce olamaz" testleri tam olarak o hatayı yakalar.
 */

/* `.mjs` tarafı düz JS; tip bilgisi burada daraltılır. */
const rules = (LEGACY as string[][]).map(([from, to]) => [from ?? '', to ?? ''] as const);
const sources = rules.map(([from]) => from);
const targets = rules.map(([, to]) => to);

const bare = (path: string) => path.replace(/\/$/, '');

describe('LEGACY — yapısal kurallar', () => {
  test('her kaynak benzersizdir — aynı URL iki kez yönlendirilemez', () => {
    expect(new Set(sources).size).toBe(sources.length);
  });

  test('kaynaklar eğik çizgisiz yazılır — çizgili varyantı `render` ekler', () => {
    /* İkisini birden yazmak `//` ile biten bozuk bir kural üretiyordu (1 Eyl 2026 notu). */
    expect(sources.filter((from) => from.endsWith('/'))).toEqual([]);
  });

  test('hedefler kanoniktir — eğik çizgiyle biter', () => {
    expect(targets.filter((to) => !to.endsWith('/'))).toEqual([]);
  });

  test('zincir yok — hiçbir hedef başka bir kuralın kaynağı değildir', () => {
    const sourceSet = new Set(sources.map(bare));
    const chained = rules.filter(([, to]) => sourceSet.has(bare(to)));
    expect(chained).toEqual([]);
  });

  test('hiçbir hedef yayından kalkmış İngilizce bölüme gitmez', () => {
    expect(targets.filter((to) => to === '/en/' || to.startsWith('/en/'))).toEqual([]);
  });
});

describe('LEGACY — İngilizce bölümün emekliliği', () => {
  const ruleFor = (from: string) => rules.find(([source]) => source === bare(from));

  test('İngilizce ana sayfa Türkçe köke yönlenir', () => {
    expect(ruleFor('/en/')?.[1]).toBe('/');
  });

  test('ROUTE_SLUGS’taki her İngilizce sayfa yolunun bir kuralı vardır', () => {
    const eksik = (Object.keys(ROUTE_SLUGS) as PageKey[])
      .map((key) => `/en/${ROUTE_SLUGS[key].en}`)
      .filter((path) => path !== '/en/')
      .filter((path) => !ruleFor(path));

    expect(eksik).toEqual([]);
  });

  test('her İngilizce sayfa, Türkçe karşılığının slug’ına yönlenir', () => {
    for (const key of Object.keys(ROUTE_SLUGS) as PageKey[]) {
      const { tr, en } = ROUTE_SLUGS[key];
      const kural = ruleFor(`/en/${en}`);
      if (!kural) continue; // ana sayfa; yukarıdaki testte ayrıca doğrulanıyor
      expect(kural[1]).toBe(tr === '' ? '/' : `/${tr}/`);
    }
  });
});
