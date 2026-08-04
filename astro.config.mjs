// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Kanonik site adresi — canonical etiketleri ve sitemap bu değerden üretilir.
// Apex alan adı kanoniktir; www.pixelon.com.tr Cloudflare üzerinden buraya 301 yapar.
// Alan adı değişirse `public/CNAME` ve `public/admin/config.yml` de güncellenmelidir
// (tests/domain.test.ts üçünün tutarlılığını kapıda doğrular).
export default defineConfig({
  site: 'https://pixelon.com.tr',
  integrations: [sitemap()],
  build: {
    assets: 'assets',
  },
  image: {
    responsiveStyles: true,
  },
});
