import { describe, expect, test } from 'bun:test';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { makePageSchema } from '../src/content/page-schema';
import { makeServiceSchema, makeTeamSchema, settingsSchema } from '../src/content/schemas';

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
