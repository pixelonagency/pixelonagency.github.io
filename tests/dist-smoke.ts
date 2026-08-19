import { beforeAll, describe, expect, test } from 'bun:test';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
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

  test('robots.txt is generated and points at the sitemap on the canonical domain', async () => {
    const robots = join(DIST, 'robots.txt');
    expect(existsSync(robots)).toBe(true);
    const body = await Bun.file(robots).text();
    expect(body).toContain('Sitemap: https://pixelon.com.tr/sitemap-index.xml');
    expect(body).toContain('Disallow: /admin/');
  });

  test('the CNAME file ships in the artifact so deploys keep the custom domain', async () => {
    const cname = join(DIST, 'CNAME');
    expect(existsSync(cname)).toBe(true);
    expect((await Bun.file(cname).text()).trim()).toBe('pixelon.com.tr');
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

  test('points its canonical at the live domain, not the github.io fallback', () => {
    for (const [route, source] of html) {
      const canonical = /<link rel="canonical" href="([^"]+)"/.exec(source)?.[1] ?? '';
      expect({ route, canonical }).toEqual({
        route,
        canonical: `https://pixelon.com.tr${route === '/' ? '/' : `${route}/`}`,
      });
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

  test('both forms post to Web3Forms and carry its required fields', () => {
    for (const route of ['/iletisim', '/ucretsiz-analiz']) {
      const source = html.get(route) ?? '';
      expect({ route, endpoint: source.includes('action="https://api.web3forms.com/submit"') }).toEqual({
        route,
        endpoint: true,
      });
      expect({ route, key: source.includes('name="access_key"') }).toEqual({ route, key: true });
      expect({ route, subject: /name="subject" value="[^"]+"/.test(source) }).toEqual({ route, subject: true });
      // Web3Forms sunucu tarafında bu adı denetler.
      expect({ route, honeypot: source.includes('name="botcheck"') }).toEqual({ route, honeypot: true });
    }
  });

  test('the service dropdown is not named "subject", which Web3Forms reserves for the mail subject', () => {
    const source = html.get('/iletisim') ?? '';
    // `subject` yalnızca gizli alanda bulunmalı; görünür seçim kutusu `service` olmalı.
    expect(source).toContain('name="service"');
    expect(source).not.toMatch(/<select[^>]*name="subject"/);
  });

  test('the shipped CSS forces [hidden] to win over component display rules', async () => {
    // Bileşenler `display:flex` tanımladığında tarayıcının düşük özgüllüklü
    // `[hidden]{display:none}` kuralı eziliyor ve `el.hidden = true` işe yaramıyor.
    // Mobil menü ve form panelleri tam olarak bu yüzden bozulmuştu.
    const cssDir = join(DIST, 'assets');
    const sheets = readdirSync(cssDir).filter((file) => file.endsWith('.css'));
    expect(sheets.length).toBeGreaterThan(0);

    const all = (await Promise.all(sheets.map((file) => Bun.file(join(cssDir, file)).text()))).join('');
    expect(all.replace(/\s/g, '')).toContain('[hidden]{display:none!important}');
  });

  test('both forms ship the post-submit success and error panels', () => {
    for (const route of ['/iletisim', '/ucretsiz-analiz']) {
      const source = html.get(route) ?? '';
      expect({ route, ok: source.includes('data-form-success=') }).toEqual({ route, ok: true });
      expect({ route, ok: source.includes('data-form-error=') }).toEqual({ route, ok: true });
      expect({ route, ok: source.includes('Bize Ulaştı!') }).toEqual({ route, ok: true });
    }
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

describe('SEO regression suite', () => {
  /** dist altındaki tüm gerçek sayfalar (admin hariç — noindex CMS paneli). */
  const allPages = (): { url: string; body: string }[] => {
    const out: { url: string; body: string }[] = [];
    const walk = (dir: string, prefix: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
          walk(join(dir, entry.name), `${prefix}${entry.name}/`);
        } else if (entry.name === 'index.html' && !prefix.startsWith('admin/')) {
          out.push({ url: `/${prefix}`, body: readFileSync(join(dir, entry.name), 'utf-8') });
        }
      }
    };
    walk(DIST, '');
    return out;
  };

  const pages = allPages();

  test('every page has title, description, canonical, single H1 and lang', () => {
    const offenders: string[] = [];
    for (const { url, body } of pages) {
      const head = body.slice(0, body.indexOf('</head>'));
      if (!/<title>[^<]{3,}<\/title>/.test(head)) offenders.push(`${url}: title`);
      if (!/<meta name="description" content="[^"]{20,}"/.test(head)) offenders.push(`${url}: description`);
      if (!/rel="canonical" href="https:\/\/pixelon\.com\.tr\//.test(head)) offenders.push(`${url}: canonical`);
      if (!/<html lang="(tr|en)">/.test(body)) offenders.push(`${url}: lang`);
      if ((body.match(/<h1[\s>]/g) ?? []).length !== 1) offenders.push(`${url}: h1`);
    }
    expect(offenders).toEqual([]);
  });

  test('titles are unique across the site', () => {
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const { url, body } of pages) {
      const title = body.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
      if (seen.has(title)) dupes.push(`${title} → ${seen.get(title)} & ${url}`);
      seen.set(title, url);
    }
    expect(dupes).toEqual([]);
  });

  test('canonical is self-referential and matches the trailing-slash URL form', () => {
    const offenders: string[] = [];
    for (const { url, body } of pages) {
      const canonical = body.match(/rel="canonical" href="([^"]*)"/)?.[1];
      if (canonical !== `https://pixelon.com.tr${url}`) offenders.push(`${url} → ${canonical}`);
    }
    expect(offenders).toEqual([]);
  });

  test('every page ships a parseable JSON-LD graph with the Organization entity', () => {
    const offenders: string[] = [];
    for (const { url, body } of pages) {
      const blocks = [...body.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)];
      if (blocks.length === 0) {
        offenders.push(`${url}: no JSON-LD`);
        continue;
      }
      try {
        const graphs = blocks.map(([, raw]) => JSON.parse(raw ?? ''));
        const types = graphs.flatMap((graph) => graph['@graph']?.map((node: { '@type': string }) => node['@type']));
        if (!types.includes('Organization')) offenders.push(`${url}: no Organization`);
        if (!types.includes('WebPage')) offenders.push(`${url}: no WebPage`);
      } catch {
        offenders.push(`${url}: JSON parse error`);
      }
    }
    expect(offenders).toEqual([]);
  });

  test('page-type schemas are present (Service on services, BlogPosting on articles)', () => {
    const service = readFileSync(join(DIST, 'hizmetlerimiz', 'web-tasarim-ve-yazilim', 'index.html'), 'utf-8');
    expect(service).toContain('"@type":"Service"');
    expect(service).toContain('"@type":"BreadcrumbList"');

    const posts = readdirSync(join(DIST, 'blog'), { withFileTypes: true }).filter((entry) => entry.isDirectory());
    for (const post of posts) {
      const body = readFileSync(join(DIST, 'blog', post.name, 'index.html'), 'utf-8');
      expect(body).toContain('"@type":"BlogPosting"');
    }
  });

  test('hreflang pairs are reciprocal for the localized route table', () => {
    const offenders: string[] = [];
    for (const { url, body } of pages) {
      const head = body.slice(0, body.indexOf('</head>'));
      const links = [...head.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)];
      if (links.length === 0) continue;
      for (const [, , target] of links) {
        const targetPath = target.replace('https://pixelon.com.tr', '');
        const file = join(DIST, targetPath.replace(/^\//, ''), 'index.html');
        if (!existsSync(file)) offenders.push(`${url} → ${target} (yok)`);
      }
    }
    expect(offenders).toEqual([]);
  });

  test('sitemap URLs all resolve to built pages', () => {
    const xml = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf-8');
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc as string);
    expect(locs.length).toBeGreaterThan(30);
    const missing = locs.filter((loc) => {
      const path = loc.replace('https://pixelon.com.tr', '').replace(/^\//, '');
      return !existsSync(join(DIST, path, 'index.html'));
    });
    expect(missing).toEqual([]);
    expect(xml).not.toContain('/admin');
  });

  test('og:image is absolute on every page', () => {
    const offenders = pages.filter(
      ({ body }) => !/property="og:image" content="https:\/\/pixelon\.com\.tr\//.test(body),
    );
    expect(offenders.map((page) => page.url)).toEqual([]);
  });

  test('stats counters render their real values in source HTML', () => {
    const home = readFileSync(join(DIST, 'index.html'), 'utf-8');
    const counters = [...home.matchAll(/data-counter-to="(\d+)"[^>]*>\s*(\d+)\s*</g)];
    expect(counters.length).toBeGreaterThan(0);
    for (const [, target, rendered] of counters) expect(rendered).toBe(target);
  });

  test('no placeholder testimonials ship to production', () => {
    for (const { url, body } of pages) {
      expect(body.includes('Yayın izni alınmış gerçek müşteri yorumu'), `${url} placeholder içeriyor`).toBe(false);
      expect(body.includes('A real client testimonial'), `${url} placeholder içeriyor`).toBe(false);
    }
  });
});

describe('analytics (GTM)', () => {
  const GTM = 'GTM-MWVJ2S27';

  test('every public page loads the GTM container exactly once (script + noscript)', () => {
    const walk = (dir: string, prefix: string, out: string[][]) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) walk(join(dir, entry.name), `${prefix}${entry.name}/`, out);
        else if (entry.name === 'index.html' && !prefix.startsWith('admin/'))
          out.push([`/${prefix}`, readFileSync(join(dir, entry.name), 'utf-8')]);
      }
      return out;
    };
    const offenders: string[] = [];
    for (const [url, body] of walk(DIST, '', [])) {
      const scripts = (body.match(/googletagmanager\.com\/gtm\.js/g) ?? []).length;
      const noscripts = (body.match(/googletagmanager\.com\/ns\.html/g) ?? []).length;
      if (scripts !== 1) offenders.push(`${url}: gtm.js ×${scripts}`);
      if (noscripts !== 1) offenders.push(`${url}: ns.html ×${noscripts}`);
      if (!body.includes(GTM)) offenders.push(`${url}: container ID yok`);
      // script <head> içinde, noscript <body> açılışından hemen sonra olmalı
      if (body.indexOf('gtm.js') > body.indexOf('</head>')) offenders.push(`${url}: script head dışında`);
      if (body.indexOf('ns.html') < body.indexOf('<body')) offenders.push(`${url}: noscript body öncesi`);
    }
    expect(offenders).toEqual([]);
  });

  test('the admin CMS panel ships no tracking at all', () => {
    const admin = readFileSync(join(DIST, 'admin', 'index.html'), 'utf-8');
    expect(admin).not.toContain('googletagmanager');
    expect(admin).not.toContain(GTM);
  });

  test('runtime guard limits collection to the production hostname', () => {
    const home = readFileSync(join(DIST, 'index.html'), 'utf-8');
    expect(home).toContain("location.hostname==='pixelon.com.tr'");
  });
});

describe('consent management (Klaro + Consent Mode v2)', () => {
  const home = () => readFileSync(join(DIST, 'index.html'), 'utf-8');
  const enHome = () => readFileSync(join(DIST, 'en', 'index.html'), 'utf-8');
  const admin = () => readFileSync(join(DIST, 'admin', 'index.html'), 'utf-8');

  test('consent-mode defaults (all four denied) ship inline BEFORE the GTM loader on every public page', () => {
    const walk = (dir: string, prefix: string, out: string[][]) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) walk(join(dir, entry.name), `${prefix}${entry.name}/`, out);
        else if (entry.name === 'index.html' && !prefix.startsWith('admin/'))
          out.push([`/${prefix}`, readFileSync(join(dir, entry.name), 'utf-8')]);
      }
      return out;
    };
    const offenders: string[] = [];
    for (const [url, body] of walk(DIST, '', [])) {
      const defaults = body.indexOf("gtag('consent','default'");
      if (defaults === -1) {
        offenders.push(`${url}: default yok`);
        continue;
      }
      for (const key of ['ad_storage', 'analytics_storage', 'ad_user_data', 'ad_personalization']) {
        if (!body.includes(`${key}:'denied'`)) offenders.push(`${url}: ${key} denied değil`);
      }
      if (!body.includes("gtag('set','ads_data_redaction',true)")) offenders.push(`${url}: redaction yok`);
      if (defaults > body.indexOf('googletagmanager.com/gtm.js')) offenders.push(`${url}: default GTM'den sonra`);
    }
    expect(offenders).toEqual([]);
  });

  test('the Klaro bundle is self-hosted, present on public pages and absent from /admin/', () => {
    expect(home()).not.toContain('cdn.kiprotect.com');
    const adminBody = admin();
    expect(adminBody).not.toContain('klaro');
    expect(adminBody).not.toContain("gtag('consent'");
    // Public sayfalar Klaro'yu kendi alan adından paketlenmiş modül olarak yükler.
    const assets = readdirSync(join(DIST, 'assets'));
    const klaroAsset = assets.find((name) => {
      if (!name.endsWith('.js')) return false;
      const body = readFileSync(join(DIST, 'assets', name), 'utf-8');
      return body.includes('klaro') && body.includes('Tümünü Kabul Et');
    });
    expect(klaroAsset).toBeDefined();
    const bundle = readFileSync(join(DIST, 'assets', klaroAsset ?? ''), 'utf-8');
    // TR + EN metinleri, test modu ve varsayılan-kapalı yapı pakette olmalı.
    for (const copy of [
      'Tümünü Kabul Et',
      'Tümünü Reddet',
      'Tercihleri Yönet',
      'Accept All',
      'Reject All',
      'Manage Preferences',
      'pixelon-consent',
    ]) {
      expect(bundle.includes(copy), `${copy} paket içinde yok`).toBe(true);
    }
    expect(bundle).toContain('testing:!0');
  });

  test('the footer ships a cookie-preferences trigger on TR and EN pages', () => {
    for (const body of [home(), enHome()]) expect(body).toContain('data-cookie-prefs');
    expect(home()).toContain('Çerez Tercihleri');
    expect(enHome()).toContain('Cookie Preferences');
  });
});
