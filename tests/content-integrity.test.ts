import { describe, expect, test } from 'bun:test';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { makePageSchema } from '../src/content/page-schema';
import { makeServiceSchema, makeTeamSchema, settingsSchema } from '../src/content/schemas';
import { isLocale, localePrefix, LOCALES, ROUTE_SLUGS, type Locale } from '../src/lib/i18n';

/**
 * İçerik bütünlüğü kapısı.
 *
 * zod, şemada TANIMSIZ anahtarları hatasız biçimde SİLER. Bu yüzden "şema geçti" demek
 * "içerik korundu" demek değildir — bir bölüm eklenip şemaya işlenmezse build sırasında
 * sessizce kaybolur. Bu testler tam olarak bu sessiz kaybı yakalar.
 */

const CONTENT = join(import.meta.dir, '..', 'src', 'content');

/** Çok dilli koleksiyonlarda dosyalar `<koleksiyon>/<locale>/<ad>` altındadır. */
const yamlFiles = (dir: string): string[] => {
  const full = join(CONTENT, dir);
  if (!existsSync(full)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(full, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      for (const file of readdirSync(join(full, entry.name))) {
        if (file.endsWith('.yml')) out.push(`${entry.name}/${file}`);
      }
    } else if (entry.name.endsWith('.yml')) {
      out.push(entry.name);
    }
  }
  return out;
};

const readYaml = async (dir: string, file: string): Promise<Record<string, unknown>> =>
  parse(await Bun.file(join(CONTENT, dir, file)).text());

const strippedKeys = (raw: Record<string, unknown>, parsed: Record<string, unknown>): string[] =>
  Object.keys(raw).filter((key) => !(key in parsed));

describe('services collection', () => {
  const files = yamlFiles('services');

  test('varsayılan dilde on hizmet sayfası bulunur', () => {
    expect(files.filter((f) => f.startsWith('tr/'))).toHaveLength(10);
  });

  for (const file of files) {
    test(`${file} validates against the service schema`, async () => {
      const result = makeServiceSchema().safeParse(await readYaml('services', file));
      expect(result.success ? [] : result.error.issues).toEqual([]);
    });

    test(`${file} loses no section to silent schema stripping`, async () => {
      const raw = await readYaml('services', file);
      const parsed = makeServiceSchema().parse(raw);
      expect(strippedKeys(raw, parsed)).toEqual([]);
    });
  }
});

describe('pages collection', () => {
  const files = yamlFiles('pages');

  for (const file of files) {
    test(`${file} validates against the page schema`, async () => {
      const result = makePageSchema().safeParse(await readYaml('pages', file));
      expect(result.success ? [] : result.error.issues).toEqual([]);
    });

    test(`${file} loses no key to silent schema stripping`, async () => {
      const raw = await readYaml('pages', file);
      const parsed = makePageSchema().parse(raw);
      expect(strippedKeys(raw, parsed)).toEqual([]);
    });

    test(`${file} declares a non-empty SEO title and description`, async () => {
      const parsed = makePageSchema().parse(await readYaml('pages', file));
      expect(parsed.seo.title.length).toBeGreaterThan(0);
      expect(parsed.seo.description.length).toBeGreaterThan(0);
    });
  }
});

describe('every page and service has a usable hero heading', () => {
  // Şema `headingLines`'ı min(1) ile zorunlu kılıyor, ama boş bir liste toplu düzenleme
  // sırasında sessizce oluşabiliyor — bu testler sayfanın H1'siz kalmasını engeller.
  for (const file of yamlFiles('pages')) {
    test(`pages/${file} hero heading is not empty`, async () => {
      const parsed = makePageSchema().parse(await readYaml('pages', file));
      const hero = parsed.sections.find((section) => section.type === 'hero');
      if (!hero) return; // her sayfanın hero'su olmak zorunda değil
      expect({ file, lines: hero.headingLines.length > 0 }).toEqual({ file, lines: true });
      expect({ file, blank: hero.headingLines.some((line) => line.trim() === '') }).toEqual({ file, blank: false });
    });
  }

  for (const file of yamlFiles('services')) {
    test(`services/${file} hero heading is not empty`, async () => {
      const parsed = makeServiceSchema().parse(await readYaml('services', file));
      expect({ file, lines: parsed.hero.headingLines.length > 0 }).toEqual({ file, lines: true });
    });
  }

  test('her dilde hizmet sıraları 1..N kesintisizdir', async () => {
    const orders: number[] = [];
    for (const file of yamlFiles('services').filter((f) => f.startsWith('tr/'))) {
      orders.push(makeServiceSchema().parse(await readYaml('services', file)).order);
    }
    expect([...orders].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});

describe('team collection', () => {
  for (const file of yamlFiles('team')) {
    test(`${file} validates against the team schema`, async () => {
      const result = makeTeamSchema().safeParse(await readYaml('team', file));
      expect(result.success ? [] : result.error.issues).toEqual([]);
    });
  }
});

describe('site settings', () => {
  test('site.yml validates against the settings schema', async () => {
    const result = settingsSchema.safeParse(await readYaml('settings', 'tr/site.yml'));
    expect(result.success ? [] : result.error.issues).toEqual([]);
  });

  test('site.yml loses no key to silent schema stripping', async () => {
    const raw = await readYaml('settings', 'tr/site.yml');
    const parsed = settingsSchema.parse(raw);
    expect(strippedKeys(raw, parsed)).toEqual([]);
  });
});

/**
 * Diller arası sızıntı kapısı.
 *
 * Çeviri turlarında en sık yapılan hata, İngilizce içeriğin gövdesindeki bağlantıların
 * Türkçe rotalara işaret etmeye devam etmesidir (`/hizmetlerimiz/...`). Build bunu
 * yakalamaz — link kırık değildir, sadece kullanıcıyı yanlış dile atar.
 */
describe('locale-scoped content links stay inside their own locale', () => {
  const LINK = /(?:\]\(|href:\s*"?)(\/[A-Za-z0-9/#._-]*)/g;

  const localeFiles = (): { locale: Locale; file: string; path: string }[] => {
    const out: { locale: Locale; file: string; path: string }[] = [];
    for (const collection of readdirSync(CONTENT, { withFileTypes: true })) {
      if (!collection.isDirectory()) continue;
      const collectionDir = join(CONTENT, collection.name);
      for (const localeDir of readdirSync(collectionDir, { withFileTypes: true })) {
        if (!localeDir.isDirectory() || !isLocale(localeDir.name)) continue;
        for (const file of readdirSync(join(collectionDir, localeDir.name))) {
          if (!/\.(md|yml)$/.test(file)) continue;
          out.push({
            locale: localeDir.name,
            file: `${collection.name}/${localeDir.name}/${file}`,
            path: join(collectionDir, localeDir.name, file),
          });
        }
      }
    }
    return out;
  };

  /** Bir dilin kök slug'ları — `blog` gibi dillerde ortak olanlar ayırt edici değildir. */
  const ownSlugs = (locale: Locale): Set<string> =>
    new Set(
      Object.values(ROUTE_SLUGS)
        .map((slugs) => slugs[locale])
        .filter(Boolean),
    );

  const distinctiveSlugs = (locale: Locale): Set<string> => {
    const shared = LOCALES.filter((code) => code !== locale).flatMap((code) => [...ownSlugs(code)]);
    return new Set([...ownSlugs(locale)].filter((slug) => !shared.includes(slug)));
  };

  for (const { locale, file, path } of localeFiles()) {
    test(`${file} links only to ${locale} routes`, async () => {
      const text = await Bun.file(path).text();
      const prefix = localePrefix(locale);
      const others = LOCALES.filter((code) => code !== locale);

      const foreign = [...text.matchAll(LINK)]
        .map(([, href]) => href as string)
        .filter((href) => !/\.[A-Za-z0-9]{2,4}(?:$|[#?])/.test(href))
        .filter((href) => {
          const first = href.split('/')[1]?.split(/[#?]/)[0] ?? '';
          // Açık dil ön eki varsa bu dosyanınkiyle birebir eşleşmeli.
          if (isLocale(first)) return `/${first}` !== prefix;
          // Ön eksiz yollar varsayılan dile aittir. Ön ekli bir dilde bunlar ancak
          // bilinen bir sayfa slug'ına denk geliyorsa hatadır — henüz üretilmeyen
          // `/kvkk-aydinlatma-metni` gibi yer tutucular her iki dilde de ortaktır.
          if (prefix !== '') return LOCALES.some((code) => ownSlugs(code).has(first));
          return others.some((code) => distinctiveSlugs(code).has(first));
        });
      expect(foreign).toEqual([]);
    });
  }
});
