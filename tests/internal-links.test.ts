import { describe, expect, test } from 'bun:test';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { categoriesWithPages, type CategorizablePost } from '../src/lib/blog-categories';
import { localizedPath, LOCALES, type Locale } from '../src/lib/i18n';

/**
 * İç bağlantı kapısı.
 *
 * Site 1 Eylül denetiminde teknik olarak temizdi (0 hata) ama bağlantı gücü beş yazıda
 * toplanmıştı: 23 Türkçe yazının 13'ü başka hiçbir yazıdan bağlantı ALMIYORDU ve
 * `/web-sitesi-yaptir/` ile `/ucretsiz-analiz/` — sitenin iki dönüşüm sayfası — blog
 * gövdelerinden HİÇ bağlantı almıyordu. Bu bir "uyarı" değil, doğrudan kayıp: arama
 * motoru bir sayfaya ne kadar az iç bağlantı görürse onu o kadar önemsiz sayar.
 *
 * Buradaki eşikler estetik değil; bir yazının hem kendi konu kümesine bağlanmasını hem
 * de o kümeden bağlantı almasını zorunlu kılar. Yeni yazı eklendiğinde bu test kırılır
 * ve yazıyı kümeye bağlamayı unutmak imkânsız hâle gelir.
 *
 * Ölçülen şey GÖVDE bağlantılarıdır — `article.related` listesi ya da otomatik
 * "İlgili Yazılar" bloğu SAYILMAZ. Otomatik blok her yazıda zaten var; bağlam içinde
 * kurulan cümle bağlantısı ise editoryal bir karardır ve değeri oradan gelir.
 */

const CONTENT = join(import.meta.dir, '..', 'src', 'content');

/** Bir yazının hem gövdesi hem ön verisi tek metin — bağlantılar gövdededir. */
const postFiles = (locale: Locale): string[] =>
  readdirSync(join(CONTENT, 'posts', locale)).filter((file) => file.endsWith('.md'));

const readPost = async (locale: Locale, file: string): Promise<string> =>
  Bun.file(join(CONTENT, 'posts', locale, file)).text();

/**
 * Gövdedeki markdown bağlantılarının hedefleri.
 *
 * Yalnızca site içi (`/` ile başlayan) hedefler döner; çapa (`#...`) kısmı atılır çünkü
 * rota geçerliliği çapadan bağımsızdır.
 */
const bodyLinks = (raw: string): string[] => {
  const out: string[] = [];
  for (const match of raw.matchAll(/\[[^\]]+\]\((\/[^)\s]*)\)/g)) {
    const href = match[1];
    if (href) out.push(href.split('#')[0] ?? href);
  }
  return out;
};

/** İçerikten türetilen gerçek rota kümesi — hepsi kanonik (sonda eğik çizgi). */
const buildRoutes = async (): Promise<Set<string>> => {
  const routes = new Set<string>();

  for (const locale of LOCALES) {
    for (const page of [
      'home',
      'about',
      'services',
      'website',
      'projects',
      'references',
      'blog',
      'careers',
      'contact',
      'analysis',
      'kvkk',
      'privacy',
      'cookies',
      'terms',
    ] as const) {
      routes.add(localizedPath(page, locale));
    }

    for (const dir of [
      { name: 'services', page: 'services' },
      { name: 'projects', page: 'projects' },
      { name: 'posts', page: 'blog' },
    ] as const) {
      for (const file of readdirSync(join(CONTENT, dir.name, locale))) {
        const slug = file.replace(/\.(md|yml)$/, '');
        routes.add(localizedPath(dir.page, locale, slug));
      }
    }

    // Kategori merkezleri yalnızca eşiği geçen kategoriler için üretilir.
    const posts: CategorizablePost[] = [];
    for (const file of postFiles(locale)) {
      const front = parse((await readPost(locale, file)).split('---')[1] ?? '') as {
        category?: string;
        date?: string | Date;
      };
      // yaml, tarihi kaynağa göre Date ya da string döndürebilir; karşılaştırma Date bekler.
      if (front?.category) {
        posts.push({
          id: `${locale}/${file}`,
          data: { category: front.category, date: new Date(front.date ?? 0) },
        });
      }
    }
    for (const group of categoriesWithPages(posts, locale)) routes.add(categoryHref(locale, group.slug));
  }

  return routes;
};

/** `categoryPath()` adı alır, burada elimizde slug var — segment dile göre sabittir. */
const categoryHref = (locale: Locale, slug: string): string =>
  localizedPath('blog', locale, `${locale === 'tr' ? 'kategori' : 'category'}/${slug}`);

/** Yazı slug'ından kanonik yola. */
const postHref = (locale: Locale, slug: string): string => localizedPath('blog', locale, slug);

interface Graph {
  /** Yazı slug'ı → o yazının gövdesinden çıkan benzersiz iç hedefler. */
  out: Map<string, Set<string>>;
  /** Hedef yol → ona bağlantı veren yazı slug'ları. */
  in: Map<string, Set<string>>;
}

const buildGraph = async (locale: Locale): Promise<Graph> => {
  const out = new Map<string, Set<string>>();
  const inbound = new Map<string, Set<string>>();

  for (const file of postFiles(locale)) {
    const slug = file.replace(/\.md$/, '');
    const links = new Set(bodyLinks(await readPost(locale, file)));
    links.delete(postHref(locale, slug)); // kendine bağlantı sayılmaz
    out.set(slug, links);
    for (const href of links) {
      if (!inbound.has(href)) inbound.set(href, new Set());
      inbound.get(href)!.add(slug);
    }
  }

  return { out, in: inbound };
};

describe('iç bağlantı bütünlüğü', () => {
  test('gövdedeki her iç bağlantı var olan bir rotaya gider', async () => {
    const routes = await buildRoutes();
    const broken: string[] = [];

    for (const locale of LOCALES) {
      for (const file of postFiles(locale)) {
        for (const href of bodyLinks(await readPost(locale, file))) {
          if (!routes.has(href)) broken.push(`${locale}/${file} → ${href}`);
        }
      }
    }

    expect(broken).toEqual([]);
  });

  test('gövdedeki her iç bağlantı kanoniktir (sonda eğik çizgi)', async () => {
    /*
     * Eğik çizgisiz bağlantı sunucuda 301 doğurur. Ziyaretçi için görünmez ama tarayıcı
     * her seferinde fazladan bir atlama yapar ve denetimlerde "yönlendirme zinciri"
     * olarak raporlanır. Kanonik yazmak bu zinciri hiç doğurmaz.
     */
    const offenders: string[] = [];

    for (const locale of LOCALES) {
      for (const file of postFiles(locale)) {
        for (const href of bodyLinks(await readPost(locale, file))) {
          if (!href.endsWith('/')) offenders.push(`${locale}/${file} → ${href}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});

describe('bağlantı gücü dağılımı — Türkçe', () => {
  const MIN_OUTBOUND = 2;
  const MIN_INBOUND = 2;

  test(`her yazı gövdesinden en az ${MIN_OUTBOUND} iç bağlantı verir`, async () => {
    const graph = await buildGraph('tr');
    const thin = [...graph.out.entries()]
      .filter(([, links]) => links.size < MIN_OUTBOUND)
      .map(([slug, links]) => `${slug} (${links.size})`);

    expect(thin).toEqual([]);
  });

  test(`her yazı başka yazılardan en az ${MIN_INBOUND} bağlantı alır`, async () => {
    /*
     * Ölçüt "kaç bağlantı" değil "kaç FARKLI yazıdan" — aynı yazının bir hedefe iki kez
     * bağlanması tek kaynak sayılır, çünkü arama motoru için de tek bir ilişki kurar.
     */
    const graph = await buildGraph('tr');
    const starved = postFiles('tr')
      .map((file) => file.replace(/\.md$/, ''))
      .map((slug) => ({ slug, sources: graph.in.get(postHref('tr', slug))?.size ?? 0 }))
      .filter(({ sources }) => sources < MIN_INBOUND)
      .map(({ slug, sources }) => `${slug} (${sources})`);

    expect(starved).toEqual([]);
  });
});

describe('bağlantı gücü dağılımı — İngilizce', () => {
  /*
   * İngilizce tarafta yalnızca üç yazı var; "en az 2 kaynak" her yazının diğer ikisine
   * de bağlanmasını zorunlu kılardı ve bu, bağlamı olmayan yapay bağlantı üretirdi.
   * Küme büyüyene kadar taban 1'dir.
   */
  const MIN_INBOUND = 1;
  const MIN_OUTBOUND = 2;

  test(`her yazı gövdesinden en az ${MIN_OUTBOUND} iç bağlantı verir`, async () => {
    const graph = await buildGraph('en');
    const thin = [...graph.out.entries()]
      .filter(([, links]) => links.size < MIN_OUTBOUND)
      .map(([slug, links]) => `${slug} (${links.size})`);

    expect(thin).toEqual([]);
  });

  test(`her yazı başka yazılardan en az ${MIN_INBOUND} bağlantı alır`, async () => {
    const graph = await buildGraph('en');
    const starved = postFiles('en')
      .map((file) => file.replace(/\.md$/, ''))
      .map((slug) => ({ slug, sources: graph.in.get(postHref('en', slug))?.size ?? 0 }))
      .filter(({ sources }) => sources < MIN_INBOUND)
      .map(({ slug, sources }) => `${slug} (${sources})`);

    expect(starved).toEqual([]);
  });
});

describe('dönüşüm sayfaları blog gövdelerinden bağlantı alır', () => {
  /*
   * Bu sayfalar menüde var ama menü bağlantısı her sayfada tekrarlandığı için arama
   * motoruna "bu sayfa önemli" demiyor. Ayırt edici sinyal, konusu geçtiği yerde
   * cümle içinde kurulan bağlantıdır. 1 Eylül denetiminde `/web-sitesi-yaptir/`
   * blogdan sıfır bağlantı alıyordu; iç bağlantısı 2 olan tek dönüşüm sayfasıydı.
   */
  const FLOORS: Array<{ page: 'website' | 'analysis' | 'references'; locale: Locale; min: number }> = [
    { page: 'website', locale: 'tr', min: 2 },
    { page: 'analysis', locale: 'tr', min: 2 },
    { page: 'references', locale: 'tr', min: 1 },
    { page: 'website', locale: 'en', min: 1 },
  ];

  for (const { page, locale, min } of FLOORS) {
    const href = localizedPath(page, locale);
    test(`${href} en az ${min} yazıdan bağlantı alır`, async () => {
      const graph = await buildGraph(locale);
      expect(graph.in.get(href)?.size ?? 0).toBeGreaterThanOrEqual(min);
    });
  }
});

describe('sağlık turizmi kümesi', () => {
  /*
   * Pixelon'un en güçlü olduğu niş bu ve hizmet sayfası 1 Eylül'de yalnızca 4 iç bağlantı
   * alıyordu — blogdan gelen yalnızca 2'siydi. Niş sayfası, kümesindeki yazıların
   * tamamından bağlantı almalı ki o küme tek bir hizmet sayfasına akmış olsun.
   */
  test('sağlık turizmi hizmet sayfası en az 3 yazıdan bağlantı alır', async () => {
    const graph = await buildGraph('tr');
    const href = localizedPath('services', 'tr', 'saglik-turizmi-danismanligi');
    expect(graph.in.get(href)?.size ?? 0).toBeGreaterThanOrEqual(3);
  });
});
