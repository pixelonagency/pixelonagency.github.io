/**
 * IndexNow otomasyonu — yalnızca ANLAMLI şekilde değişen sayfaları bildirir.
 *
 * Tasarım (bkz. INDEXNOW.md):
 * - Sitemap "aktif URL" kümesinin tek doğruluk kaynağıdır: eklenen/değişen URL'ler
 *   sitemap'te yoksa gönderilmez (indexability guard). Silinen URL'ler bu filtreden
 *   bilinçli olarak muaftır — IndexNow 404/410/redirect bildirimini destekler.
 * - Route eşlemesi src/lib/i18n.ts'teki GERÇEK yardımcılardan türetilir; ikinci bir
 *   hardcoded slug tablosu tutulmaz.
 * - Global etkili kaynaklar (layout, paylaşılan bileşenler, tokens, lib) değiştiğinde
 *   etkilenen alt kümeyi güvenilir hesaplayamayız → fallback olarak sitemap'teki tüm
 *   URL'ler gönderilir. Bu YALNIZCA global değişiklikte olur; normal içerik
 *   güncellemesi yalnız kendi URL'lerini üretir.
 * - Test/doküman/CI değişiklikleri hiçbir gönderim üretmez.
 * - Gönderim tarayıcıdan DEĞİL, yalnızca bu CI/CLI script'inden yapılır.
 *
 * Kullanım:
 *   bun scripts/seo/indexnow.ts --base <sha> --head <sha> [--dry-run]
 *   bun scripts/seo/indexnow.ts --urls "https://pixelon.com.tr/a/ https://..." [--dry-run]
 */
import { localizedPath, ROUTE_SLUGS, type Locale, type PageKey } from '../../src/lib/i18n';
import { INDEXNOW_KEY } from './indexnow-key';

export const INDEXNOW_HOST = 'pixelon.com.tr';
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const ORIGIN = `https://${INDEXNOW_HOST}`;
export const KEY_LOCATION = `${ORIGIN}/${INDEXNOW_KEY}.txt`;

/* ---------------------------------------------------------------- mapping */

export interface MappedChange {
  /** Sitemap guard'ından geçmesi gereken canlı URL'ler. */
  urls: string[];
  /** Silinen/taşınan eski URL'ler — sitemap guard'ına TABİ DEĞİL. */
  deletedUrls: string[];
  /** true → güvenilir alt küme hesaplanamaz, tüm sitemap gönderilir. */
  global: boolean;
  /** Tek bir dilin tüm sayfalarını etkileyen değişiklik (settings/<locale>/site.yml). */
  globalLocale?: Locale;
  reason: string;
}

const NONE: MappedChange = { urls: [], deletedUrls: [], global: false, reason: 'ignored' };

const abs = (path: string): string => {
  const withSlash = path.endsWith('/') ? path : `${path}/`;
  return `${ORIGIN}${withSlash}`;
};

/** Sayfa içeriğini etkileMEyen dosyalar: gönderim üretmez. */
const IGNORED = [
  /^tests\//,
  /^scripts\//,
  /^\.github\//,
  /^[^/]+\.md$/i, // kök dokümanlar (README, SEO raporları, envanterler)
  /^(package\.json|bun\.lock[^/]*|tsconfig[^/]*|knip[^/]*|eslint[^/]*|\.prettier[^/]*|\.secretlint[^/]*|\.gitignore|\.bun-version|LICENSE)$/,
  /^design_handoff_astro_site\//,
  /*
   * Tracking/analytics YAPILANDIRMASI crawlable içerik değildir: GA4/GTM/Klaro
   * davranışı değişti diye sayfaların indexlenebilir HTML'i/metadata'sı değişmez.
   * Bu dosyalar IGNORED listesinde olduğu için GLOBAL kontrolüne hiç ulaşmaz.
   */
  /^src\/lib\/(analytics|consent-config|analytics-events)\.ts$/,
  /^src\/components\/(ConsentManager|AnalyticsEvents)\.astro$/,
  /^public\/admin\//,
  /^public\/[A-Za-z0-9-]{8,128}\.txt$/, // IndexNow key dosyasının kendisi
  /^public\//, // favicon vb. — sayfa içeriği değil
];

/** Tek bir locale'in tüm sayfalarını etkileyen içerik. */
const LOCALE_GLOBAL = /^src\/content\/settings\/(tr|en)\/site\.yml$/;

/**
 * Route'a eşlenemeyen ama sayfaları gerçekten etkileyen kaynaklar → global fallback.
 * (references/team hangi sayfalarda render edildiği CMS section verisine bağlı
 * olduğundan güvenilir alt küme çıkarılamaz — nadir değiştikleri için global kabul.)
 */
const GLOBAL = [
  /^src\/(components|layouts|styles|lib|pages|assets)\//,
  /^src\/content\.config\.ts$/,
  /^src\/content\/(schemas|page-schema)\.ts$/,
  /^src\/content\/(references|team)\//,
  /^astro\.config\.mjs$/,
];

const CONTENT = /^src\/content\/(pages|posts|services|projects|legal)\/(tr|en)\/([^/]+)\.(md|yml)$/;

/** Değişen tek bir kaynak dosyayı canlı URL'lere eşler. */
export function mapFile(path: string, status: 'A' | 'M' | 'D'): MappedChange {
  if (IGNORED.some((rx) => rx.test(path))) return { ...NONE, reason: `ignored: ${path}` };

  const localeGlobal = path.match(LOCALE_GLOBAL);
  if (localeGlobal) {
    return {
      urls: [],
      deletedUrls: [],
      global: false,
      globalLocale: localeGlobal[1] as Locale,
      reason: `locale-global (${localeGlobal[1]}): ${path}`,
    };
  }
  /*
   * Form bileşeni route-aware eşlenir: ContactFormFields yalnızca `form`/`contact`
   * section'ı içeren sayfalarda render edilir (kaynak incelemesi: contact, analysis,
   * website landing + ContactSection üzerinden home; TR+EN). Markup/metin değişirse
   * yalnız bu sayfalar bildirilir — analytics/JS değişikliği için 50 URL gönderilmez.
   */
  if (/^src\/components\/sections\/ContactFormFields\.astro$/.test(path)) {
    const urls = (['tr', 'en'] as Locale[]).flatMap((locale) =>
      (['contact', 'analysis', 'website', 'home'] as PageKey[]).map((key) => abs(localizedPath(key, locale))),
    );
    return { urls, deletedUrls: [], global: false, reason: `form-component: ${path}` };
  }
  if (GLOBAL.some((rx) => rx.test(path))) return { urls: [], deletedUrls: [], global: true, reason: `global: ${path}` };

  const match = path.match(CONTENT);
  if (!match) return { ...NONE, reason: `unmapped (ignored): ${path}` };
  const [, collection, locale, slug] = match as [string, string, Locale, string];

  const urls: string[] = [];
  switch (collection) {
    case 'pages':
      if (slug in ROUTE_SLUGS) urls.push(abs(localizedPath(slug as PageKey, locale)));
      break;
    case 'posts':
      // Dosya adı = o dildeki blog slug'ı; yazının kendisi + listeleme sayfası değişir.
      urls.push(abs(localizedPath('blog', locale, slug)), abs(localizedPath('blog', locale)));
      break;
    case 'services':
      urls.push(abs(localizedPath('services', locale, slug)), abs(localizedPath('services', locale)));
      break;
    case 'projects':
      // Detay URL'si yalnız case study içeriği olan projelerde üretilir; olmayanlar
      // sitemap guard'ında elenir. Listeleme + (öne çıkanların olduğu) ana sayfa da değişir.
      urls.push(
        abs(localizedPath('projects', locale, slug)),
        abs(localizedPath('projects', locale)),
        abs(localizedPath('home', locale)),
      );
      break;
    case 'legal':
      if (slug in ROUTE_SLUGS) urls.push(abs(localizedPath(slug as PageKey, locale)));
      break;
  }
  if (urls.length === 0) return { ...NONE, reason: `unmapped (ignored): ${path}` };

  if (status === 'D') {
    // Sayfanın kendi URL'si artık silinmiş kabul edilir; listeleme sayfaları yaşamaya
    // devam ettiği için normal guard'lı kümede kalır.
    const [own, ...listings] = urls;
    return { urls: listings, deletedUrls: [own as string], global: false, reason: `deleted: ${path}` };
  }
  return { urls, deletedUrls: [], global: false, reason: `${status}: ${path}` };
}

export interface DiffEntry {
  status: string; // A | M | D | Rxx
  path: string;
  newPath?: string | undefined;
}

/** `git diff --name-status` çıktısını satır satır ayrıştırır. */
export function parseNameStatus(output: string): DiffEntry[] {
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [status = '', path = '', newPath] = line.split('\t');
      return { status, path, newPath };
    })
    .filter((entry) => entry.status && entry.path);
}

export interface ChangeSet {
  urls: Set<string>;
  deletedUrls: Set<string>;
  global: boolean;
  globalLocales: Set<Locale>;
  reasons: string[];
}

export function mapDiff(entries: DiffEntry[]): ChangeSet {
  const set: ChangeSet = {
    urls: new Set(),
    deletedUrls: new Set(),
    global: false,
    globalLocales: new Set(),
    reasons: [],
  };
  for (const entry of entries) {
    const mapped: MappedChange[] = [];
    if (entry.status.startsWith('R') && entry.newPath) {
      // Yeniden adlandırma = eski URL silindi/yönlendi + yeni URL eklendi.
      mapped.push(mapFile(entry.path, 'D'), mapFile(entry.newPath, 'A'));
    } else if (entry.status === 'A' || entry.status === 'M' || entry.status === 'D') {
      mapped.push(mapFile(entry.path, entry.status));
    } else {
      mapped.push(mapFile(entry.path, 'M'));
    }
    for (const m of mapped) {
      if (m.global) set.global = true;
      if (m.globalLocale) set.globalLocales.add(m.globalLocale);
      for (const url of m.urls) set.urls.add(url);
      for (const url of m.deletedUrls) set.deletedUrls.add(url);
      if (m.reason !== 'ignored') set.reasons.push(m.reason);
    }
  }
  return set;
}

/* ------------------------------------------------------------- validation */

/** Yalnızca canlı host kabul edilir — www/github.io/localhost/preview reddedilir. */
export function isValidProductionUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname === INDEXNOW_HOST;
  } catch {
    return false;
  }
}

/* ---------------------------------------------------------------- sitemap */

type Fetcher = typeof fetch;

/** Sitemap index → alt sitemap'ler → tüm <loc> URL'leri (aktif küme). */
export async function fetchSitemapUrls(indexUrl: string, fetcher: Fetcher = fetch): Promise<Set<string>> {
  const collect = (xml: string): string[] => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc as string);
  const indexXml = await (await fetcher(indexUrl)).text();
  const locs = collect(indexXml);
  const children = locs.filter((loc) => loc.endsWith('.xml'));
  const pages = locs.filter((loc) => !loc.endsWith('.xml'));
  for (const child of children) {
    const childXml = await (await fetcher(child)).text();
    pages.push(...collect(childXml));
  }
  return new Set(pages);
}

/* ------------------------------------------------------------- submission */

export interface SubmissionPlan {
  urlList: string[];
  deleted: string[];
  skipped: string[];
  global: boolean;
}

/** Diff kümesi + aktif sitemap → gönderilecek nihai (dedupe edilmiş) liste. */
export function buildPlan(changes: ChangeSet, sitemap: Set<string>): SubmissionPlan {
  const skipped: string[] = [];
  const live = new Set<string>();
  if (changes.global) {
    // Global fallback: aktif kümenin tamamı (sitemap zaten admin/404/noindex içermez).
    for (const url of sitemap) live.add(url);
  } else if (changes.globalLocales.size > 0) {
    // Tek dilin ayarları değişti: yalnız o dilin sayfaları (EN = /en/ öneki).
    for (const url of sitemap) {
      const isEn = url.startsWith(`${ORIGIN}/en/`);
      if ((isEn && changes.globalLocales.has('en')) || (!isEn && changes.globalLocales.has('tr'))) live.add(url);
    }
  }
  for (const url of changes.urls) {
    if (!isValidProductionUrl(url)) skipped.push(`${url} (host reddedildi)`);
    else if (!sitemap.has(url)) skipped.push(`${url} (sitemap'te yok — indexable değil)`);
    else live.add(url);
  }
  const deleted: string[] = [];
  for (const url of changes.deletedUrls) {
    if (!isValidProductionUrl(url)) skipped.push(`${url} (host reddedildi)`);
    else if (sitemap.has(url))
      live.add(url); // hâlâ canlı: normal güncelleme say
    else deleted.push(url);
  }
  const urlList = [...new Set([...live, ...deleted])];
  return { urlList, deleted, skipped, global: changes.global };
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export interface SubmitResult {
  ok: boolean;
  status: number | 'network-error';
  hardFailure: boolean;
}

/** Bulk POST + resmi yanıt kodları; 429/5xx için sınırlı geri çekilmeli tekrar. */
export async function submit(
  urlList: string[],
  fetcher: Fetcher = fetch,
  waits: number[] = [30_000, 60_000],
): Promise<SubmitResult> {
  const body = JSON.stringify({ host: INDEXNOW_HOST, key: INDEXNOW_KEY, keyLocation: KEY_LOCATION, urlList });
  for (let attempt = 0; ; attempt++) {
    let status: number | 'network-error';
    try {
      const response = await fetcher(INDEXNOW_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body,
      });
      status = response.status;
    } catch {
      status = 'network-error';
    }
    if (status === 200 || status === 202) return { ok: true, status, hardFailure: false };
    // Yapılandırma hataları: tekrar denemek anlamsız, açık hata.
    if (status === 400 || status === 403 || status === 422) return { ok: false, status, hardFailure: true };
    // 429 / 5xx / ağ: sınırlı tekrar — API spamlenmez, sonsuz döngü yok.
    if (attempt >= waits.length) return { ok: false, status, hardFailure: false };
    await sleep(waits[attempt] ?? 30_000);
  }
}

/* -------------------------------------------------------------------- cli */

interface CliOptions {
  dryRun: boolean;
  base?: string | undefined;
  head?: string | undefined;
  urls?: string[] | undefined;
  sitemapUrl: string;
}

export function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { dryRun: false, sitemapUrl: `${ORIGIN}/sitemap-index.xml` };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--base') options.base = argv[++i];
    else if (arg === '--head') options.head = argv[++i];
    else if (arg === '--sitemap') options.sitemapUrl = argv[++i] ?? options.sitemapUrl;
    else if (arg === '--urls') options.urls = (argv[++i] ?? '').split(/[\s,]+/).filter(Boolean);
  }
  return options;
}

const ZERO_SHA = /^0+$/;

async function gitDiff(base: string, head: string): Promise<string> {
  const proc = Bun.spawn(['git', 'diff', '--name-status', '--find-renames', `${base}..${head}`], {
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const [out, code] = await Promise.all([new Response(proc.stdout).text(), proc.exited]);
  if (code !== 0) throw new Error(`git diff başarısız (${base}..${head})`);
  return out;
}

async function shaExists(sha: string): Promise<boolean> {
  const proc = Bun.spawn(['git', 'cat-file', '-e', `${sha}^{commit}`], { stdout: 'ignore', stderr: 'ignore' });
  return (await proc.exited) === 0;
}

async function run(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  let plan: SubmissionPlan;

  if (options.urls) {
    // Manuel gönderim: host doğrulaması yine zorunlu; sitemap guard'ı bilinçli olarak
    // uygulanmaz (acil düzeltme/silinen URL senaryoları için).
    const invalid = options.urls.filter((url) => !isValidProductionUrl(url));
    if (invalid.length > 0) {
      console.error(`Geçersiz URL(ler) — yalnız https://${INDEXNOW_HOST} kabul edilir:\n${invalid.join('\n')}`);
      process.exit(1);
    }
    plan = { urlList: [...new Set(options.urls)], deleted: [], skipped: [], global: false };
  } else {
    const { base, head } = options;
    if (!base || !head || ZERO_SHA.test(base) || !(await shaExists(base)) || !(await shaExists(head))) {
      // İlk push / force-push / bilinmeyen base: körlemesine HEAD~1 KULLANILMAZ.
      console.log('IndexNow: güvenilir diff tabanı yok (ilk push/force-push?) — gönderim atlandı.');
      console.log('Gerekirse manuel gönderim: Actions → IndexNow Manual Submission.');
      return;
    }
    const changes = mapDiff(parseNameStatus(await gitDiff(base, head)));
    const sitemap = await fetchSitemapUrls(options.sitemapUrl);
    plan = buildPlan(changes, sitemap);
    for (const reason of changes.reasons) console.log(`  değişiklik: ${reason}`);
  }

  if (plan.skipped.length > 0) console.log(`Atlandı:\n  ${plan.skipped.join('\n  ')}`);
  if (plan.deleted.length > 0) {
    console.log(`Deleted / Redirected URLs:\n  ${plan.deleted.join('\n  ')}`);
  }
  if (plan.urlList.length === 0) {
    console.log('IndexNow: no indexable URL changes detected');
    return;
  }

  console.log(`IndexNow\nDetected changes: ${plan.urlList.length}${plan.global ? ' (global fallback)' : ''}`);
  console.log(`Submitted URLs:\n  ${plan.urlList.join('\n  ')}`);
  if (options.dryRun) {
    console.log('Dry run: API isteği atılmadı.');
    return;
  }

  const result = await submit(plan.urlList);
  console.log(`Response: ${result.status}`);
  if (result.ok) return;
  if (result.hardFailure) {
    console.error('IndexNow yapılandırma hatası (key/URL doğrulaması) — inceleme gerekli.');
    process.exit(1);
  }
  // Geçici hata: deploy'u/workflow'u kırmayız, görünür uyarı bırakırız.
  console.log(`::warning::IndexNow geçici olarak ulaşılamadı (${String(result.status)}) — gönderim yapılamadı.`);
}

if (import.meta.main) {
  await run();
}
