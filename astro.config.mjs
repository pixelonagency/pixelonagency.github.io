// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Kanonik site adresi. Özel alan adına (ör. https://www.pixelon.com.tr) geçilecekse
// yalnızca bu değer değiştirilir ve `public/CNAME` dosyası eklenir.
export default defineConfig({
  site: 'https://pixelonagency.github.io',
  integrations: [sitemap()],
  build: {
    assets: 'assets',
  },
  image: {
    responsiveStyles: true,
  },
});
