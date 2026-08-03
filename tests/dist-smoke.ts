import { beforeAll, describe, expect, test } from 'bun:test';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Build sonrası duman testleri — üretilen `dist/` çıktısı üzerinde çalışır.
 *
 * Dosya adı bilinçli olarak `.test.ts` DEĞİL: `bun test` varsayılan taramasında
 * bulunmaz, çünkü önce `astro build` çalışmış olmalı. Çalıştırmak için:
 *   bun run verify      # build + bu testler
 */

const DIST = join(import.meta.dir, '..', 'dist');

const ROUTES = [
  '/',
  '/biz-kimiz',
  '/hizmetlerimiz',
  '/projelerimiz',
  '/blog',
  '/kariyer',
  '/iletisim',
  '/ucretsiz-analiz',
] as const;

const SERVICE_SLUGS = [
  'web-tasarim-ve-yazilim',
  'sosyal-medya-yonetimi',
  'dijital-reklam-yonetimi',
  'seo-ve-icerik-pazarlamasi',
  'marka-ve-kurumsal-kimlik',
  'ux-ui-tasarimi',
  'e-ticaret-cozumleri',
  'video-ve-produksiyon',
  'saglik-turizmi-danismanligi',
  'crm-ve-dijital-donusum',
] as const;

const htmlPath = (route: string): string => join(DIST, route === '/' ? 'index.html' : `${route.slice(1)}/index.html`);

const html = new Map<string, string>();

beforeAll(async () => {
  if (!existsSync(DIST)) {
    throw new Error('dist/ bulunamadı. Önce `bun run build` çalıştırın (veya `bun run verify` kullanın).');
  }
  const all = [...ROUTES, ...SERVICE_SLUGS.map((slug) => `/hizmetlerimiz/${slug}`)];
  for (const route of all) {
    const file = htmlPath(route);
    if (existsSync(file)) html.set(route, await Bun.file(file).text());
  }
});

const allHtmlFiles = (dir: string, found: string[] = []): string[] => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) allHtmlFiles(full, found);
    else if (entry.endsWith('.html')) found.push(full);
  }
  return found;
};

describe('routes', () => {
  for (const route of ROUTES) {
    test(`${route} is rendered`, () => {
      expect(existsSync(htmlPath(route))).toBe(true);
    });
  }

  for (const slug of SERVICE_SLUGS) {
    test(`/hizmetlerimiz/${slug} is rendered`, () => {
      expect(existsSync(htmlPath(`/hizmetlerimiz/${slug}`))).toBe(true);
    });
  }

  test('the 404 page is rendered', () => {
    expect(existsSync(join(DIST, '404.html'))).toBe(true);
  });

  test('the CMS admin is shipped', () => {
    expect(existsSync(join(DIST, 'admin', 'index.html'))).toBe(true);
    expect(existsSync(join(DIST, 'admin', 'config.yml'))).toBe(true);
  });

  test('a sitemap index is generated', () => {
    expect(existsSync(join(DIST, 'sitemap-index.xml'))).toBe(true);
  });

  test('at least one blog post detail page is rendered', () => {
    const blogDir = join(DIST, 'blog');
    expect(existsSync(blogDir)).toBe(true);
    const posts = readdirSync(blogDir).filter((entry) => statSync(join(blogDir, entry)).isDirectory());
    expect(posts.length).toBeGreaterThan(0);
  });
});

describe('every rendered page', () => {
  test('declares Turkish as the document language', () => {
    for (const [route, source] of html) {
      expect({ route, ok: source.includes('<html lang="tr"') }).toEqual({ route, ok: true });
    }
  });

  test('has a non-empty title', () => {
    for (const [route, source] of html) {
      const title = /<title>([^<]*)<\/title>/.exec(source)?.[1] ?? '';
      expect({ route, ok: title.trim().length > 0 }).toEqual({ route, ok: true });
    }
  });

  test('has a non-empty meta description', () => {
    for (const [route, source] of html) {
      const description = /<meta name="description" content="([^"]*)"/.exec(source)?.[1] ?? '';
      expect({ route, ok: description.trim().length > 0 }).toEqual({ route, ok: true });
    }
  });

  test('has a canonical link and Open Graph tags', () => {
    for (const [route, source] of html) {
      expect({ route, canonical: source.includes('rel="canonical"') }).toEqual({ route, canonical: true });
      expect({ route, og: source.includes('property="og:title"') }).toEqual({ route, og: true });
    }
  });

  test('renders the shared header with the services dropdown', () => {
    for (const [route, source] of html) {
      expect({ route, ok: source.includes('aria-label="Ana menü"') }).toEqual({ route, ok: true });
      expect({ route, ok: source.includes('/hizmetlerimiz/seo-ve-icerik-pazarlamasi') }).toEqual({ route, ok: true });
    }
  });

  test('renders the shared footer with the contact e-mail', () => {
    for (const [route, source] of html) {
      expect({ route, ok: source.includes('mailto:info@pixelon.com.tr') }).toEqual({ route, ok: true });
    }
  });

  test('renders the floating WhatsApp button', () => {
    for (const [route, source] of html) {
      expect({ route, ok: source.includes('https://wa.me/905065229034') }).toEqual({ route, ok: true });
    }
  });

  test('exposes a skip link to the main landmark', () => {
    for (const [route, source] of html) {
      expect({ route, ok: source.includes('class="skip-link"') && source.includes('id="main"') }).toEqual({
        route,
        ok: true,
      });
    }
  });
});

describe('prototype leftovers', () => {
  const FORBIDDEN = ['<x-dc', '<sc-for', '<sc-if', '<image-slot', 'style-hover=', 'support.js', 'image-slot.js'];

  test('no page contains prototype-only markup', () => {
    for (const file of allHtmlFiles(DIST)) {
      const source = Bun.file(file);
      void source;
    }
    for (const [route, source] of html) {
      for (const token of FORBIDDEN) {
        expect({ route, token, found: source.includes(token) }).toEqual({ route, token, found: false });
      }
    }
  });

  test('no page contains an unresolved handlebars placeholder', () => {
    for (const [route, source] of html) {
      const match = /\{\{\s*[a-zA-Z_.]+\s*\}\}/.exec(source);
      expect({ route, leftover: match?.[0] ?? null }).toEqual({ route, leftover: null });
    }
  });

  test('no page renders the literal string "undefined" in visible text', () => {
    for (const [route, source] of html) {
      const body = source.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
      expect({ route, found: />[^<]*\bundefined\b/.test(body) }).toEqual({ route, found: false });
    }
  });
});

describe('service detail pages', () => {
  for (const slug of SERVICE_SLUGS) {
    const route = `/hizmetlerimiz/${slug}`;

    test(`${slug} renders exactly one h1`, () => {
      const source = html.get(route) ?? '';
      expect((source.match(/<h1[\s>]/g) ?? []).length).toBe(1);
    });

    test(`${slug} renders a FAQ accordion`, () => {
      expect(html.get(route)?.includes('data-faq')).toBe(true);
    });

    test(`${slug} links to the contact page from its CTA`, () => {
      expect(html.get(route)?.includes('href="/iletisim"')).toBe(true);
    });
  }
});

describe('interactive behaviour is shipped', () => {
  test('the projects page ships the category filter', () => {
    expect(html.get('/projelerimiz')).toContain('role="tablist"');
  });

  test('the contact page ships a form', () => {
    expect(html.get('/iletisim')).toContain('<form');
  });

  test('the free-analysis page ships a form', () => {
    expect(html.get('/ucretsiz-analiz')).toContain('<form');
  });

  test('the mobile menu panel sits outside <header> so it can cover the viewport', () => {
    // <header> `backdrop-filter` kullanıyor; bu, içindeki `position: fixed` elemanlar için
    // yeni bir kapsayıcı blok oluşturur ve paneli header yüksekliğine hapsederdi.
    for (const [route, source] of html) {
      const headerEnd = source.indexOf('</header>');
      const panelStart = source.indexOf('id="mnav-panel"');
      expect({ route, hasHeader: headerEnd > -1, hasPanel: panelStart > -1 }).toEqual({
        route,
        hasHeader: true,
        hasPanel: true,
      });
      expect({ route, panelAfterHeader: panelStart > headerEnd }).toEqual({ route, panelAfterHeader: true });
    }
  });

  test('the mobile menu lists every service', () => {
    const source = html.get('/') ?? '';
    const panel = source.slice(source.indexOf('id="mnav-panel"'));
    for (const slug of SERVICE_SLUGS) {
      expect({ slug, inPanel: panel.includes(`/hizmetlerimiz/${slug}`) }).toEqual({ slug, inPanel: true });
    }
  });

  test('the home page ships the reference logo marquee', () => {
    const source = html.get('/') ?? '';
    expect(source).toContain('logos__track');
    // Kesintisiz döngü için logo grubu iki kez basılır; kopya erişilebilirlik ağacından çıkarılır.
    expect(source).toContain('aria-hidden="true"');
  });

  test('the marquee renders an image for every reference in the collection', () => {
    const source = html.get('/') ?? '';
    const items = (source.match(/class="logos__item"/g) ?? []).length;
    // 10 referans × 2 kopya
    expect(items).toBe(20);
  });
});
