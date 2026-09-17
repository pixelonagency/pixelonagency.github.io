import { describe, expect, test } from 'bun:test';

import { buildLastmodMap } from './lastmod.mjs';

/**
 * Sitemap `lastmod` haritası.
 *
 * 17 Eyl 2026 denetimi: sitemap'teki 65 URL'in hiçbirinde `lastmod` yoktu.
 *
 * Kritik kural: **tarih UYDURULMAZ.** Tüm sayfalara build zamanını yazmak,
 * hiç değişmemiş bir sayfaya "bugün güncellendi" demek olurdu; Google tutarsız
 * `lastmod`'u tamamen yok sayıyor, yani yalan sinyal sinyalsizlikten kötü.
 *
 * Bu yüzden `lastmod` YALNIZCA içerikte gerçek bir editoryal tarih varsa yazılır:
 *   · blog yazısı → `article.updated` (yoksa yayın tarihi `date`)
 *   · yasal metin → `updated`
 * Diğer sayfalar `lastmod`'suz kalır — eksik olması, yanlış olmasından iyidir.
 */

const map = buildLastmodMap();

describe('buildLastmodMap — yalnız gerçek tarihler', () => {
  test('boş değildir', () => {
    expect(map.size).toBeGreaterThan(20);
  });

  test('her değer geçerli bir Date’tir', () => {
    for (const [url, date] of map) {
      expect({ url, gecerli: date instanceof Date && !Number.isNaN(date.getTime()) }).toEqual({
        url,
        gecerli: true,
      });
    }
  });

  test('anahtarlar kanonik yoldur — eğik çizgiyle biter, kök göreli', () => {
    for (const url of map.keys()) {
      expect({ url, kanonik: url.startsWith('/') && url.endsWith('/') }).toEqual({ url, kanonik: true });
    }
  });

  test('blog yazıları haritada yer alır', () => {
    expect(map.has('/blog/roas-nedir-nasil-hesaplanir/')).toBe(true);
  });

  test('yasal metinler ROUTE_SLUGS karşılığıyla eşlenir', () => {
    /* Dosya adı `kvkk.md`, URL `/kvkk-aydinlatma-metni/` — eşleme yapılmazsa
       sitemap'te hiç var olmayan bir `/kvkk/` yolu için lastmod üretilirdi. */
    expect(map.has('/kvkk-aydinlatma-metni/')).toBe(true);
    expect(map.has('/kvkk/')).toBe(false);
  });

  test('tarih GELECEKTE olamaz — build zamanı sızmış olurdu', () => {
    const yarin = new Date(Date.now() + 86_400_000);
    const gelecek = [...map].filter(([, d]) => d > yarin).map(([u]) => u);
    expect(gelecek).toEqual([]);
  });

  test('hiçbir tarih bugüne eşit değil — toplu damgalama olmadığının kanıtı', () => {
    /* Hepsi aynı güne düşüyorsa birisi `new Date()` yazmış demektir. */
    const gunler = new Set([...map.values()].map((d) => d.toISOString().slice(0, 10)));
    expect(gunler.size).toBeGreaterThan(1);
  });

  test('ana sayfa ve hizmet sayfaları haritada YOKTUR — tarihleri bilinmiyor', () => {
    expect(map.has('/')).toBe(false);
    expect(map.has('/hizmetlerimiz/')).toBe(false);
  });
});
