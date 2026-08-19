import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildPlan,
  fetchSitemapUrls,
  isValidProductionUrl,
  mapDiff,
  mapFile,
  parseArgs,
  parseNameStatus,
  submit,
  INDEXNOW_HOST,
  KEY_LOCATION,
} from '../scripts/seo/indexnow';
import { INDEXNOW_KEY } from '../scripts/seo/indexnow-key';

const ROOT = join(import.meta.dir, '..');
const SITE = 'https://pixelon.com.tr';

/* -------------------------------------------------------------------- key */

describe('IndexNow key', () => {
  test('conforms to the official format (8-128 chars, [a-zA-Z0-9-])', () => {
    expect(INDEXNOW_KEY).toMatch(/^[A-Za-z0-9-]{8,128}$/);
  });

  test('the public key file exists, matches the key exactly and is the only key file', () => {
    const file = join(ROOT, 'public', `${INDEXNOW_KEY}.txt`);
    expect(existsSync(file)).toBe(true);
    // UTF-8, yalnız anahtarın kendisi — HTML/boşluk/yorum yok.
    expect(readFileSync(file, 'utf-8')).toBe(INDEXNOW_KEY);
    // Döndürme disiplini: public/ altında başka olası key dosyası kalmamalı.
    const keyFiles = readdirSync(join(ROOT, 'public')).filter((name) => /^[A-Za-z0-9-]{32,128}\.txt$/.test(name));
    expect(keyFiles).toEqual([`${INDEXNOW_KEY}.txt`]);
  });

  test('keyLocation points at the production root key file', () => {
    expect(KEY_LOCATION).toBe(`${SITE}/${INDEXNOW_KEY}.txt`);
  });
});

/* ------------------------------------------------------------- validation */

describe('URL validation', () => {
  test('accepts only the production host', () => {
    expect(isValidProductionUrl(`${SITE}/blog/foo/`)).toBe(true);
    expect(isValidProductionUrl('https://www.pixelon.com.tr/blog/foo/')).toBe(false);
    expect(isValidProductionUrl('https://pixelonagency.github.io/blog/foo/')).toBe(false);
    expect(isValidProductionUrl('http://localhost:4321/blog/foo/')).toBe(false);
    expect(isValidProductionUrl('https://evil.example.com/?ref=pixelon.com.tr')).toBe(false);
    expect(isValidProductionUrl('not a url')).toBe(false);
    // http (TLS'siz) kabul edilmez — canonical şema https.
    expect(isValidProductionUrl('http://pixelon.com.tr/blog/foo/')).toBe(false);
  });
});

/* ---------------------------------------------------------- route mapping */

describe('route mapping', () => {
  test('added blog post maps to its localized URL plus the listing page', () => {
    const tr = mapFile('src/content/posts/tr/yeni-yazi.md', 'A');
    expect(tr.urls).toEqual([`${SITE}/blog/yeni-yazi/`, `${SITE}/blog/`]);
    const en = mapFile('src/content/posts/en/new-post.md', 'A');
    expect(en.urls).toEqual([`${SITE}/en/blog/new-post/`, `${SITE}/en/blog/`]);
  });

  test('only the changed locale is submitted — TR edit does not drag the EN counterpart', () => {
    const changes = mapDiff([{ status: 'M', path: 'src/content/posts/tr/yeni-yazi.md' }]);
    expect([...changes.urls].some((url) => url.startsWith(`${SITE}/en/`))).toBe(false);
  });

  test('service and page files use the real slug conventions from i18n', () => {
    expect(mapFile('src/content/services/en/web-design-and-development.yml', 'M').urls).toContain(
      `${SITE}/en/services/web-design-and-development/`,
    );
    expect(mapFile('src/content/pages/tr/about.yml', 'M').urls).toEqual([`${SITE}/biz-kimiz/`]);
    expect(mapFile('src/content/legal/en/cookies.md', 'M').urls).toEqual([`${SITE}/en/cookie-policy/`]);
  });

  test('project content maps to the listing and home (no detail routes exist)', () => {
    expect(mapFile('src/content/projects/tr/dentasay.md', 'M').urls).toEqual([`${SITE}/projelerimiz/`, `${SITE}/`]);
  });

  test('deleted post keeps its old URL for submission while the listing stays guarded', () => {
    const deleted = mapFile('src/content/posts/tr/eski-yazi.md', 'D');
    expect(deleted.deletedUrls).toEqual([`${SITE}/blog/eski-yazi/`]);
    expect(deleted.urls).toEqual([`${SITE}/blog/`]);
  });

  test('a rename produces both the deleted old URL and the added new URL', () => {
    const changes = mapDiff([
      { status: 'R100', path: 'src/content/posts/tr/eski.md', newPath: 'src/content/posts/tr/yeni.md' },
    ]);
    expect([...changes.deletedUrls]).toEqual([`${SITE}/blog/eski/`]);
    expect([...changes.urls]).toContain(`${SITE}/blog/yeni/`);
  });

  test('non-page changes produce zero URLs', () => {
    for (const path of [
      'README.md',
      'SEO_AUDIT.md',
      'tests/dist-smoke.ts',
      'scripts/seo/indexnow.ts',
      '.github/workflows/deploy.yml',
      'package.json',
      'bun.lock',
      'public/favicon.svg',
      'public/admin/config.yml',
      `public/${INDEXNOW_KEY}.txt`,
      // Tracking/analytics config crawlable içerik değildir → gönderim üretmez.
      'src/lib/analytics.ts',
      'src/lib/consent-config.ts',
      'src/lib/analytics-events.ts',
      'src/components/ConsentManager.astro',
      'src/components/AnalyticsEvents.astro',
    ]) {
      const mapped = mapFile(path, 'M');
      expect(mapped.urls, path).toEqual([]);
      expect(mapped.global, path).toBe(false);
    }
  });

  test('global sources trigger the global fallback flag', () => {
    for (const path of [
      'src/layouts/BaseLayout.astro',
      'src/components/Footer.astro',
      'src/lib/schema.ts',
      'src/styles/tokens.css',
      'src/pages/[...path].astro',
      'src/content.config.ts',
    ]) {
      expect(mapFile(path, 'M').global, path).toBe(true);
    }
  });

  test('ContactFormFields change maps to its exact route set, not the global sitemap', () => {
    const mapped = mapFile('src/components/sections/ContactFormFields.astro', 'M');
    expect(mapped.global).toBe(false);
    expect(mapped.urls.sort()).toEqual(
      [
        `${SITE}/iletisim/`,
        `${SITE}/en/contact/`,
        `${SITE}/ucretsiz-analiz/`,
        `${SITE}/en/free-analysis/`,
        `${SITE}/web-sitesi-yaptir/`,
        `${SITE}/en/get-a-website/`,
        `${SITE}/`,
        `${SITE}/en/`,
      ].sort(),
    );
  });

  test('locale settings changes scope the fallback to that locale only', () => {
    const changes = mapDiff([{ status: 'M', path: 'src/content/settings/en/site.yml' }]);
    expect(changes.global).toBe(false);
    expect([...changes.globalLocales]).toEqual(['en']);
    const sitemap = new Set([`${SITE}/`, `${SITE}/biz-kimiz/`, `${SITE}/en/`, `${SITE}/en/about-us/`]);
    const plan = buildPlan(changes, sitemap);
    expect(plan.urlList.sort()).toEqual([`${SITE}/en/`, `${SITE}/en/about-us/`]);
  });
});

/* -------------------------------------------------------------- diff/plan */

describe('diff parsing and plan building', () => {
  test('parses git name-status output including renames', () => {
    const entries = parseNameStatus('M\tsrc/content/posts/tr/a.md\nR087\told.md\tnew.md\n\nD\tx.md\n');
    expect(entries).toHaveLength(3);
    expect(entries[1]).toEqual({ status: 'R087', path: 'old.md', newPath: 'new.md' });
  });

  test('duplicate URLs collapse into a unique submission list', () => {
    const changes = mapDiff([
      { status: 'M', path: 'src/content/posts/tr/a.md' },
      { status: 'M', path: 'src/content/posts/tr/b.md' },
    ]);
    const sitemap = new Set([`${SITE}/blog/a/`, `${SITE}/blog/b/`, `${SITE}/blog/`]);
    const plan = buildPlan(changes, sitemap);
    // /blog/ iki dosyadan da gelir ama listede bir kez yer alır.
    expect(plan.urlList.filter((url) => url === `${SITE}/blog/`)).toHaveLength(1);
  });

  test('new URLs missing from the sitemap are skipped (indexability guard)', () => {
    const changes = mapDiff([{ status: 'A', path: 'src/content/posts/tr/taslak.md' }]);
    const sitemap = new Set([`${SITE}/blog/`]);
    const plan = buildPlan(changes, sitemap);
    expect(plan.urlList).toEqual([`${SITE}/blog/`]);
    expect(plan.skipped.some((line) => line.includes('/blog/taslak/'))).toBe(true);
  });

  test('deleted URLs bypass the sitemap guard and are reported separately', () => {
    const changes = mapDiff([{ status: 'D', path: 'src/content/posts/tr/eski.md' }]);
    const sitemap = new Set([`${SITE}/blog/`]);
    const plan = buildPlan(changes, sitemap);
    expect(plan.deleted).toEqual([`${SITE}/blog/eski/`]);
    expect(plan.urlList).toContain(`${SITE}/blog/eski/`);
  });

  test('global fallback submits the whole active sitemap set', () => {
    const changes = mapDiff([{ status: 'M', path: 'src/layouts/BaseLayout.astro' }]);
    const sitemap = new Set([`${SITE}/`, `${SITE}/en/`, `${SITE}/blog/`]);
    const plan = buildPlan(changes, sitemap);
    expect(plan.urlList.sort()).toEqual([...sitemap].sort());
    expect(plan.global).toBe(true);
  });

  test('empty diff produces an empty plan (no request would be made)', () => {
    const plan = buildPlan(mapDiff([{ status: 'M', path: 'README.md' }]), new Set([`${SITE}/`]));
    expect(plan.urlList).toEqual([]);
  });
});

/* ----------------------------------------------------------- HTTP (mock) */

const fakeFetch = (handler: (url: string, init?: RequestInit) => Response): typeof fetch =>
  ((url: unknown, init?: RequestInit) => Promise.resolve(handler(String(url), init))) as typeof fetch;

describe('submission (mock HTTP — no real API calls)', () => {
  test('POST body carries host, key, keyLocation and the exact url list', async () => {
    let captured: Record<string, unknown> = {};
    const fetcher = fakeFetch((url, init) => {
      expect(url).toBe('https://api.indexnow.org/indexnow');
      const headers = (init?.headers ?? {}) as Record<string, string>;
      expect(headers['Content-Type']).toContain('application/json');
      captured = JSON.parse(String(init?.body)) as Record<string, unknown>;
      return new Response('', { status: 200 });
    });
    const result = await submit([`${SITE}/blog/a/`, `${SITE}/`], fetcher, []);
    expect(result).toEqual({ ok: true, status: 200, hardFailure: false });
    expect(captured['host']).toBe(INDEXNOW_HOST);
    expect(captured['key']).toBe(INDEXNOW_KEY);
    expect(captured['keyLocation']).toBe(KEY_LOCATION);
    expect(captured['urlList']).toEqual([`${SITE}/blog/a/`, `${SITE}/`]);
  });

  test('202 counts as success (key validation pending)', async () => {
    const result = await submit(
      [`${SITE}/`],
      fakeFetch(() => new Response('', { status: 202 })),
      [],
    );
    expect(result.ok).toBe(true);
    expect(result.status).toBe(202);
  });

  test('400/403/422 are hard configuration failures without retries', async () => {
    let calls = 0;
    const result = await submit(
      [`${SITE}/`],
      fakeFetch(() => {
        calls++;
        return new Response('', { status: 422 });
      }),
      [1, 1],
    );
    expect(result).toEqual({ ok: false, status: 422, hardFailure: true });
    expect(calls).toBe(1);
  });

  test('429 retries with backoff a limited number of times, never infinitely', async () => {
    let calls = 0;
    const result = await submit(
      [`${SITE}/`],
      fakeFetch(() => {
        calls++;
        return new Response('', { status: 429 });
      }),
      [1, 1],
    );
    expect(calls).toBe(3); // ilk deneme + 2 kontrollü tekrar
    expect(result.ok).toBe(false);
    expect(result.hardFailure).toBe(false);
  });

  test('sitemap index and children are flattened into the active URL set', async () => {
    const fetcher = fakeFetch((url) => {
      if (url.endsWith('sitemap-index.xml')) {
        return new Response(`<sitemapindex><sitemap><loc>${SITE}/sitemap-0.xml</loc></sitemap></sitemapindex>`);
      }
      return new Response(`<urlset><url><loc>${SITE}/</loc></url><url><loc>${SITE}/blog/</loc></url></urlset>`);
    });
    const urls = await fetchSitemapUrls(`${SITE}/sitemap-index.xml`, fetcher);
    expect([...urls].sort()).toEqual([`${SITE}/`, `${SITE}/blog/`]);
  });
});

/* -------------------------------------------------------------------- cli */

describe('cli options', () => {
  test('parses dry-run, shas, sitemap and manual urls', () => {
    const options = parseArgs(['--dry-run', '--base', 'abc', '--head', 'def', '--urls', `${SITE}/a/\n${SITE}/b/`]);
    expect(options.dryRun).toBe(true);
    expect(options.base).toBe('abc');
    expect(options.head).toBe('def');
    expect(options.urls).toEqual([`${SITE}/a/`, `${SITE}/b/`]);
    expect(options.sitemapUrl).toBe(`${SITE}/sitemap-index.xml`);
  });
});
