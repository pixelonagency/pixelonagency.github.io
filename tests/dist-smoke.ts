import { beforeAll, describe, expect, test } from 'bun:test';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, sep } from 'node:path';
import { GA4_MEASUREMENT_ID } from '../src/lib/analytics';

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

describe('analytics (GTM + GA4)', () => {
  const GTM = 'GTM-MWVJ2S27';
  const GA4 = GA4_MEASUREMENT_ID;

  test('the GA4 measurement ID single source of truth is correct and not loaded directly', () => {
    expect(GA4).toBe('G-15DCDNXNG7');
    // GA4 yalnızca GTM container'ından yönetilir: ölçüm kimliği ve gtag.js HTML'e girmez.
    const offenders: string[] = [];
    for (const file of allHtmlFiles(DIST)) {
      const body = readFileSync(file, 'utf-8');
      if (body.includes(GA4)) offenders.push(`${file}: ölçüm kimliği HTML'de`);
      if (body.includes('googletagmanager.com/gtag/js')) offenders.push(`${file}: doğrudan gtag.js yükleyicisi`);
    }
    expect(offenders).toEqual([]);
  });

  test('the tracking inventory records GA4 as the only active measurement service', () => {
    const inventory = readFileSync(join(import.meta.dir, '..', 'PRIVACY_TRACKING_INVENTORY.md'), 'utf-8');
    const row = (name: string): string => inventory.split('\n').find((line) => line.includes(name)) ?? '';
    // GA4 GTM'den publish edildi ve canlıda doğrulandı (2026-08-19) — durum Active.
    expect(row('Google Analytics 4')).toContain('**Active**');
    expect(row('Google Analytics 4')).toContain(GA4);
    for (const inactive of ['Microsoft Clarity', 'Meta Pixel', 'LinkedIn Insight', 'Yandex Metrica', 'TikTok Pixel']) {
      expect(row(inactive), `${inactive} hâlâ Not Active olmalı`).toContain('Not Active');
    }
    expect(row('Google Ads')).toContain('Not Active');
  });

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
      'google-analytics',
    ]) {
      expect(bundle.includes(copy), `${copy} paket içinde yok`).toBe(true);
    }
    // Canlı mod: banner tüm ziyaretçilere açık — test modu bayrağı pakette kapalı olmalı.
    expect(bundle).toContain('testing:!1');
    expect(bundle).not.toContain('testing:!0');
  });

  test('no analytics or marketing trackers ship beyond GTM (GA4/Meta/Clarity/Ads absent)', () => {
    const offenders: string[] = [];
    for (const file of allHtmlFiles(DIST)) {
      const body = readFileSync(file, 'utf-8');
      for (const loader of [
        'googletagmanager.com/gtag/js',
        'google-analytics.com/analytics.js',
        'connect.facebook.net',
        'clarity.ms',
        'googleadservices.com',
        'googlesyndication.com',
      ]) {
        if (body.includes(loader)) offenders.push(`${file}: ${loader}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  test('business event wiring ships as a shared chunk without direct gtag calls or IDs', () => {
    // Helper iki script tarafından paylaşıldığı için ayrı chunk olarak çıkar.
    const assets = readdirSync(join(DIST, 'assets')).filter((name) => name.endsWith('.js'));
    const eventChunk = assets
      .map((name) => readFileSync(join(DIST, 'assets', name), 'utf-8'))
      .find((body) => body.includes('generate_lead') && body.includes('click_whatsapp'));
    expect(eventChunk, 'iş olayı sözlüğü chunk olarak yayınlanmıyor').toBeDefined();
    expect(eventChunk ?? '').not.toContain(GA4_MEASUREMENT_ID);
    // Her public sayfa dinleyici script'ini yükler; admin yüklemez.
    for (const body of [home(), enHome()]) expect(body).toContain('AnalyticsEvents');
    expect(admin()).not.toContain('AnalyticsEvents');
    // Site kodu GA4'ü doğrudan çağırmaz; teslimat GTM'deki Google tag'e aittir.
    for (const file of allHtmlFiles(DIST)) {
      const body = readFileSync(file, 'utf-8');
      expect(body.includes("gtag('event'") || body.includes('gtag("event"'), `${file} doğrudan gtag`).toBe(false);
    }
  });

  test('the footer ships a cookie-preferences trigger on TR and EN pages', () => {
    for (const body of [home(), enHome()]) expect(body).toContain('data-cookie-prefs');
    expect(home()).toContain('Çerez Tercihleri');
    expect(enHome()).toContain('Cookie Preferences');
  });
});

describe('IndexNow key file', () => {
  test('ships at the dist root with the exact key as its only content', async () => {
    const { INDEXNOW_KEY } = await import('../scripts/seo/indexnow-key');
    const file = join(DIST, `${INDEXNOW_KEY}.txt`);
    expect(existsSync(file)).toBe(true);
    expect(readFileSync(file, 'utf-8')).toBe(INDEXNOW_KEY);
  });

  test('is not referenced by the sitemap and the key leaks into no other dist file', async () => {
    const { INDEXNOW_KEY } = await import('../scripts/seo/indexnow-key');
    expect(readFileSync(join(DIST, 'sitemap-0.xml'), 'utf-8')).not.toContain(INDEXNOW_KEY);
    // Anahtar yalnız <KEY>.txt doğrulama dosyasında yaşar — bundle/HTML'e gömülmez.
    const walk = (dir: string, out: string[] = []): string[] => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full, out);
        else if (!entry.name.endsWith('.png') && !entry.name.endsWith('.webp') && !entry.name.endsWith('.jpg'))
          out.push(full);
      }
      return out;
    };
    const offenders = walk(DIST).filter(
      (file) => !file.endsWith(`${INDEXNOW_KEY}.txt`) && readFileSync(file, 'latin1').includes(INDEXNOW_KEY),
    );
    expect(offenders).toEqual([]);
  });
});

describe('legal pages', () => {
  const LEGAL_ROUTES = [
    { url: '/kvkk-aydinlatma-metni/', lang: 'tr', h1: 'KVKK Aydınlatma Metni' },
    { url: '/gizlilik-politikasi/', lang: 'tr', h1: 'Gizlilik Politikası' },
    { url: '/cerez-politikasi/', lang: 'tr', h1: 'Çerez Politikası' },
    { url: '/kullanim-kosullari/', lang: 'tr', h1: 'Kullanım Koşulları' },
    { url: '/en/personal-data-processing-notice/', lang: 'en', h1: 'Personal Data Processing Notice' },
    { url: '/en/privacy-policy/', lang: 'en', h1: 'Privacy Policy' },
    { url: '/en/cookie-policy/', lang: 'en', h1: 'Cookie Policy' },
    { url: '/en/terms-of-use/', lang: 'en', h1: 'Terms of Use' },
  ] as const;

  const read = (url: string): string => readFileSync(join(DIST, url.replace(/^\//, ''), 'index.html'), 'utf-8');

  test('all eight legal routes are built with correct lang, H1, canonical and hreflang', () => {
    for (const { url, lang, h1 } of LEGAL_ROUTES) {
      const body = read(url);
      expect(body.includes(`<html lang="${lang}"`), `${url} lang=${lang} değil`).toBe(true);
      expect(body.includes(`>${h1}</h1>`), `${url} H1 "${h1}" içermiyor`).toBe(true);
      expect(body).toContain(`<link rel="canonical" href="https://pixelon.com.tr${url}"`);
      expect(body).toContain('hreflang="tr"');
      expect(body).toContain('hreflang="en"');
      expect(body).toContain('hreflang="x-default"');
      expect(/<meta name="description" content="[^"]{40,}"/.test(body), `${url} meta description eksik/kısa`).toBe(
        true,
      );
    }
  });

  test('legal pages carry the real controller facts and no invented registry numbers', () => {
    const CONTROLLER = 'Mehmet Fatih Dayan';
    const ADDRESS = 'Sahrayıcedit Mah. Şafak Sok. No:1, Kadıköy / İstanbul';
    for (const { url } of LEGAL_ROUTES) {
      const body = read(url);
      expect(body).toContain('info@pixelon.com.tr');
      // Sahip verisi gelmeden önceki geçici ad üretimde kalamaz.
      expect(body.includes('Pixelon Agency'), `${url} eski geçici veri sorumlusu adını içeriyor`).toBe(false);
      // MERSİS/VERBİS/KEP numarası uydurulmadığından bu etiketler hiç geçmemeli.
      for (const banned of ['MERSİS', 'VERBİS', 'KEP adresi']) {
        expect(body.includes(banned), `${url} doğrulanmamış kayıt bilgisi (${banned}) içeriyor`).toBe(false);
      }
    }
    // Veri sorumlusunu adıyla anan sayfalar gerçek kimliği ve adresi taşımalı (TR/EN paritesi).
    for (const url of [
      '/kvkk-aydinlatma-metni/',
      '/gizlilik-politikasi/',
      '/kullanim-kosullari/',
      '/en/personal-data-processing-notice/',
      '/en/privacy-policy/',
      '/en/terms-of-use/',
    ]) {
      expect(read(url).includes(CONTROLLER), `${url} veri sorumlusunun gerçek adını içermiyor`).toBe(true);
    }
    for (const url of ['/kvkk-aydinlatma-metni/', '/en/personal-data-processing-notice/']) {
      expect(read(url).includes(ADDRESS), `${url} gerçek adresi içermiyor`).toBe(true);
    }
  });

  test('footer legal links on TR and EN pages resolve to built legal pages', () => {
    const cases: Array<[string, string[]]> = [
      [
        readFileSync(join(DIST, 'index.html'), 'utf-8'),
        ['/kvkk-aydinlatma-metni/', '/gizlilik-politikasi/', '/cerez-politikasi/', '/kullanim-kosullari/'],
      ],
      [
        readFileSync(join(DIST, 'en', 'index.html'), 'utf-8'),
        ['/en/personal-data-processing-notice/', '/en/privacy-policy/', '/en/cookie-policy/', '/en/terms-of-use/'],
      ],
    ];
    for (const [body, hrefs] of cases) {
      for (const href of hrefs) {
        // Site içi bağlantılar eğik çizgisiz üretilir; canonical'lar eğik çizgilidir.
        expect(body.includes(`href="${href.replace(/\/$/, '')}"`), `footer ${href} bağlantısı yok`).toBe(true);
        expect(existsSync(join(DIST, href.replace(/^\//, ''), 'index.html')), `${href} build edilmemiş`).toBe(true);
      }
    }
  });

  test('the Klaro bundle links to the cookie policy pages and both targets exist', () => {
    const assets = readdirSync(join(DIST, 'assets'));
    const klaroAsset = assets.find((name) => {
      if (!name.endsWith('.js')) return false;
      return readFileSync(join(DIST, 'assets', name), 'utf-8').includes('pixelon-consent');
    });
    expect(klaroAsset).toBeDefined();
    const bundle = readFileSync(join(DIST, 'assets', klaroAsset ?? ''), 'utf-8');
    for (const target of ['/cerez-politikasi', '/en/cookie-policy']) {
      expect(bundle.includes(target), `Klaro paketi ${target} bağlantısını içermiyor`).toBe(true);
      expect(existsSync(join(DIST, target.replace(/^\//, ''), 'index.html')), `${target} build edilmemiş`).toBe(true);
    }
  });

  test('cookie policy pages describe GA4 as the active consent-gated analytics service', () => {
    const cases: Array<[string, string]> = [
      ['/cerez-politikasi/', 'şu anda sitede aktif bir analitik veya reklam ölçüm hizmeti çalışmamaktadır'],
      ['/en/cookie-policy/', 'no analytics or advertising measurement service is currently active'],
    ];
    for (const [url, staleClaim] of cases) {
      const body = read(url);
      expect(body.includes('Google Analytics 4'), `${url} GA4'ü anlatmıyor`).toBe(true);
      expect(body.includes(staleClaim), `${url} eski "aktif analitik yok" iddiasını içeriyor`).toBe(false);
      expect(body.includes('analytics_storage'), `${url} consent sinyalini anlatmıyor`).toBe(true);
      // Gözlemlenen _gcl_au çerezi anlatılmalı; "pazarlama çerez yerleştirmez" iddiası kalkmış olmalı.
      expect(body.includes('_gcl_au'), `${url} _gcl_au çerezini anlatmıyor`).toBe(true);
      for (const stale of ['bu kategoriye ait çerez yerleştirilmemektedir', 'sets no cookies']) {
        expect(body.includes(stale), `${url} eski pazarlama-çerezsiz iddiasını içeriyor`).toBe(false);
      }
    }
    // Gizlilik politikaları da GA4'ü GTM'den ayrı, izne bağlı ölçüm olarak anlatmalı.
    for (const url of ['/gizlilik-politikasi/', '/en/privacy-policy/']) {
      expect(read(url).includes('Google Analytics 4'), `${url} GA4'ü anlatmıyor`).toBe(true);
    }
  });

  test('cookie policy pages ship a working manage-preferences trigger', () => {
    for (const url of ['/cerez-politikasi/', '/en/cookie-policy/']) {
      expect(read(url).includes('data-cookie-prefs'), `${url} tercih düğmesi içermiyor`).toBe(true);
    }
  });

  test('form consent labels say "okudum" (not "kabul ediyorum") and link to the KVKK notice', () => {
    const contact = readFileSync(join(DIST, 'iletisim', 'index.html'), 'utf-8');
    const enContact = readFileSync(join(DIST, 'en', 'contact', 'index.html'), 'utf-8');
    expect(contact).toContain('href="/kvkk-aydinlatma-metni"');
    expect(contact.includes('okudum ve kabul ediyorum')).toBe(false);
    expect(enContact).toContain('href="/en/personal-data-processing-notice"');
  });

  test('legal pages contain no provisional labels, wrong legal-basis pairing or unconfirmed clauses', () => {
    const offenders: string[] = [];
    for (const { url } of LEGAL_ROUTES) {
      const body = read(url);
      // "geçici" etiketi üretime sızmamalı (sahip bilgileri kesinleşmeden bu ibare metne yazılmaz).
      if (/geçici/i.test(body)) offenders.push(`${url}: "geçici" içeriyor`);
      // m.5/2-e "meşru menfaat" DEĞİLDİR (meşru menfaat = m.5/2-f) — yanlış eşleştirme yasak.
      if (body.includes('5/2-e') && /meşru menfaat|legitimate interest/i.test(body)) {
        offenders.push(`${url}: 5/2-e ile meşru menfaat aynı sayfada eşleştirilmiş`);
      }
      // Dil önceliği hükmü sahip/hukukçu onayı olmadan yer alamaz.
      for (const clause of [
        'Türkçe metin esas',
        'Türkçe versiyon geçerli',
        'Turkish text prevails',
        'Turkish version prevails',
      ]) {
        if (body.includes(clause)) offenders.push(`${url}: onaysız dil önceliği hükmü ("${clause}")`);
      }
    }
    expect(offenders).toEqual([]);
  });

  test('sitemap matches the actual public build inventory both ways, including all legal pages', () => {
    const xml = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf-8');
    const sitemapUrls = new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc as string));

    /*
     * Public/indexlenebilir envanter build çıktısından dinamik türetilir: /admin/ (CMS kabuğu),
     * 404.html ve noindex işaretli sayfalar dışında kalan her HTML bir sitemap URL'sine
     * karşılık gelmelidir — ve tersi. Böylece yeni içerik eklendiğinde test kendini uyarlar;
     * yalnızca gerçek bir kapsam farkı (eksik/fazla URL) kırar.
     */
    const builtUrls = new Set(
      allHtmlFiles(DIST)
        .filter((file) => !file.includes(`${sep}admin${sep}`) && !file.endsWith(`${sep}404.html`))
        .filter((file) => !/<meta name="robots" content="[^"]*noindex/.test(readFileSync(file, 'utf-8')))
        .map((file) => {
          const route = file.slice(DIST.length, -'index.html'.length).split(sep).join('/');
          return `https://pixelon.com.tr${route}`;
        }),
    );

    const missingFromSitemap = [...builtUrls].filter((url) => !sitemapUrls.has(url));
    const missingFromBuild = [...sitemapUrls].filter((url) => !builtUrls.has(url));
    expect(missingFromSitemap).toEqual([]);
    expect(missingFromBuild).toEqual([]);

    // Yasal sayfalar ayrıca ve açıkça: 8/8 sitemap'te olmalı.
    for (const { url } of LEGAL_ROUTES) expect(sitemapUrls.has(`https://pixelon.com.tr${url}`)).toBe(true);
  });

  test('no legal placeholder text leaks into any public page', () => {
    const offenders: string[] = [];
    for (const file of allHtmlFiles(DIST)) {
      if (file.includes(`${sep}admin${sep}`)) continue;
      const body = readFileSync(file, 'utf-8');
      for (const pattern of [/\bTODO\b/, /COMPANY NAME/, /ADDRESS HERE/, /\bXXXX*\b/]) {
        if (pattern.test(body)) offenders.push(`${file}: ${String(pattern)}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe('language switcher', () => {
  test('links to the current page counterpart in the other language, not the homepage', () => {
    const offenders: string[] = [];
    for (const file of allHtmlFiles(DIST)) {
      if (file.includes(`${sep}admin${sep}`) || file.endsWith(`${sep}404.html`)) continue;
      const body = readFileSync(file, 'utf-8');
      const isTr = body.includes('<html lang="tr"');
      const otherLang = isTr ? 'en' : 'tr';
      const switcher = body.match(
        new RegExp(`<a class="lang-switch__item"[^>]*href="([^"]+)"[^>]*hreflang="${otherLang}"`),
      );
      if (!switcher) continue;
      const alternate = body.match(
        new RegExp(`<link rel="alternate" hreflang="${otherLang}" href="https://pixelon\\.com\\.tr([^"]+)"`),
      );
      // hreflang karşılığı yoksa (çevirisi olmayan sayfa) ana sayfaya düşmek doğru davranış.
      const expected = alternate ? alternate[1] : otherLang === 'en' ? '/en/' : '/';
      const normalize = (path: string): string => (path.endsWith('/') ? path : `${path}/`);
      if (normalize(switcher[1] ?? '') !== normalize(expected)) {
        offenders.push(`${file}: switcher ${switcher[1]} ≠ alternate ${expected}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
