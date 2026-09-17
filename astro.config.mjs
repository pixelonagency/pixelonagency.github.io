// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { buildLastmodMap } from './scripts/seo/lastmod.mjs';

/*
 * `lastmod` haritası build başında bir kez kurulur (65 URL için dosya okuma).
 * Eklentinin global `lastmod` seçeneği BİLEREK kullanılmıyor: o, her URL'e aynı
 * damgayı basar ve dokunulmamış sayfaya "bugün güncellendi" dedirtir — Google
 * tutarsız lastmod'u yok sayar. Gerekçe: scripts/seo/lastmod.mjs.
 */
const LASTMOD = buildLastmodMap();

// Kanonik site adresi — canonical etiketleri ve sitemap bu değerden üretilir.
// Apex alan adı kanoniktir; www.pixelon.com.tr Cloudflare üzerinden buraya 301 yapar.
// Alan adı değişirse `public/CNAME` ve `public/admin/config.yml` de güncellenmelidir
// (tests/domain.test.ts üçünün tutarlılığını kapıda doğrular).
export default defineConfig({
  site: 'https://pixelon.com.tr',
  integrations: [
    sitemap({
      // Portfolyo sunumu satış aracı; noindex olduğu için sitemap'te de yer almaz.
      // Noindex bir URL'yi sitemap'te bırakmak Google'a çelişkili sinyal verir.
      filter: (page) => !/\/(portfolyo|portfolio)\/$/.test(page),

      /*
       * Tarihi BİLİNEN sayfaya `lastmod` ekler, bilinmeyene dokunmaz.
       * `serialize` undefined dönerse URL sitemap'ten DÜŞER — bu yüzden her dalda
       * item geri verilir; yalnız tarih varsa alan eklenir.
       */
      serialize: (item) => {
        const path = new URL(item.url).pathname;
        const lastmod = LASTMOD.get(path);
        /* `SitemapItem.lastmod` STRING bekler (eklentinin global `lastmod` seçeneği
           Date alır — ikisi aynı değil). ISO 8601, sitemap şemasının kabul ettiği
           W3C datetime biçimi. */
        return lastmod ? { ...item, lastmod: lastmod.toISOString() } : item;
      },
    }),
  ],
  build: {
    assets: 'assets',
  },
  image: {
    responsiveStyles: true,
  },
});
