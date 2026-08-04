import { describe, expect, test } from 'bun:test';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { PAGE_SECTION_TYPES } from '../src/content/page-schema';
import {
  makePostSchema,
  makeProjectSchema,
  makeReferenceSchema,
  makeServiceSchema,
  makeTeamSchema,
  settingsSchema,
} from '../src/content/schemas';

/**
 * Sveltia CMS yapılandırması ile zod şemaları arasındaki sözleşme testi.
 *
 * İkisi elle senkron tutuluyor; biri değişip diğeri unutulursa editörün kaydettiği içerik
 * build'de doğrulamadan geçemez (ya da sessizce silinir). Bu testler o kaymayı yakalar.
 */

interface CmsField {
  name: string;
  widget?: string;
  fields?: CmsField[];
  field?: CmsField;
  types?: CmsField[];
  required?: boolean;
}

interface CmsCollection {
  name: string;
  fields?: CmsField[];
  files?: { name: string; fields: CmsField[] }[];
}

const CONTENT = join(import.meta.dir, '..', 'src', 'content');

const adminHtml = await Bun.file(join(import.meta.dir, '..', 'public', 'admin', 'index.html')).text();

const config = parse(await Bun.file(join(import.meta.dir, '..', 'public', 'admin', 'config.yml')).text()) as {
  backend: { name: string; repo: string; branch: string };
  media_folder: string;
  public_folder: string;
  collections: CmsCollection[];
};

const collection = (name: string): CmsCollection => {
  const found = config.collections.find((entry) => entry.name === name);
  if (!found) throw new Error(`CMS koleksiyonu bulunamadı: ${name}`);
  return found;
};

/** zod nesnesinin üst düzey anahtarları. */
const schemaKeys = (schema: { shape: Record<string, unknown> }): string[] => Object.keys(schema.shape).sort();

const fieldNames = (fields: CmsField[]): string[] => fields.map((field) => field.name).sort();

/** Her alan girdisi tek bir nesne olmalı — YAML anchor'ı bir listeye eklenirse iç içe dizi oluşur. */
const collectFields = (fields: CmsField[] | undefined, path: string, found: string[] = []): string[] => {
  if (!fields) return found;
  for (const field of fields) {
    if (Array.isArray(field)) {
      found.push(`${path} içinde iç içe dizi (YAML anchor hatası)`);
      continue;
    }
    if (!field || typeof field !== 'object' || typeof field.name !== 'string') {
      found.push(`${path} içinde adsız alan: ${JSON.stringify(field)}`);
      continue;
    }
    collectFields(field.fields, `${path}.${field.name}`, found);
    collectFields(field.types, `${path}.${field.name}[types]`, found);
    if (field.field) collectFields([field.field], `${path}.${field.name}`, found);
  }
  return found;
};

describe('backend wiring', () => {
  test('commits to the GitHub repository that hosts the site', () => {
    expect(config.backend.name).toBe('github');
    expect(config.backend.repo).toBe('pixelonagency/pixelonagency.github.io');
  });

  test('uploads media into the asset pipeline so astro:assets can optimise it', () => {
    expect(config.media_folder).toBe('src/assets/uploads');
    expect(config.public_folder).toBe('/src/assets/uploads');
  });

  test('public_folder is absolute — Sveltia rejects relative paths outright', () => {
    // Sveltia: "The configured public folder is invalid. It must be an absolute path
    // starting with /". Decap kabul ederdi, Sveltia etmiyor — bu yüzden kapıda tutuluyor.
    expect(config.public_folder.startsWith('/')).toBe(true);
    expect(config.public_folder.startsWith('..')).toBe(false);
  });

  test('public_folder is not an absolute URL, which Sveltia also rejects', () => {
    expect(/^https?:\/\//.test(config.public_folder)).toBe(false);
  });

  test('declares no Decap-only options that Sveltia ignores', () => {
    // Bunlar Decap'te geçerli ama Sveltia bunları yok sayıp konsola uyarı basıyor.
    // Yapılandırmayı yanıltıcı hâle getirdikleri için hiç bulunmamalılar.
    const unsupported = ['local_backend', 'locale'] as const;
    const present = unsupported.filter((key) => key in (config as Record<string, unknown>));
    expect(present).toEqual([]);
  });
});

describe('admin entry point', () => {
  test('loads the CMS as a classic script, not an ES module', () => {
    // Sveltia paketi ES modülü değil; type="module" ile yüklenirse JS API'si bozuluyor.
    const scriptTag = /<script[\s\S]*?<\/script>/.exec(adminHtml)?.[0] ?? '';
    expect(scriptTag).toContain('sveltia-cms.js');
    expect(scriptTag).not.toContain('type="module"');
  });

  test('pins the CMS to an exact version with subresource integrity', () => {
    expect(adminHtml).toMatch(/@sveltia\/cms@\d+\.\d+\.\d+\//);
    expect(adminHtml).toContain('integrity="sha384-');
    expect(adminHtml).toContain('crossorigin="anonymous"');
  });

  test('keeps the admin out of search results', () => {
    expect(adminHtml).toContain('noindex');
  });
});

describe('committed image paths match the CMS public_folder convention', () => {
  // CMS bir görsel yazdığında `/src/assets/...` üretir. Elle eklenmiş içerik de aynı
  // biçimi kullanmalı, aksi halde editör aynı alanı açtığında yol bozulur.
  test('every reference logo uses a root-absolute path', async () => {
    const offenders: string[] = [];
    for (const file of readdirSync(join(CONTENT, 'references')).filter((f) => f.endsWith('.yml'))) {
      const raw = parse(await Bun.file(join(CONTENT, 'references', file)).text()) as { logo?: string };
      if (typeof raw.logo === 'string' && !raw.logo.startsWith('/')) offenders.push(`${file}: ${raw.logo}`);
    }
    expect(offenders).toEqual([]);
  });
});

describe('config structure', () => {
  test('no collection contains a nested field array from a spliced YAML anchor', () => {
    const problems = config.collections.flatMap((entry) => [
      ...collectFields(entry.fields, entry.name),
      ...(entry.files ?? []).flatMap((file) => collectFields(file.fields, `${entry.name}/${file.name}`)),
    ]);
    expect(problems).toEqual([]);
  });

  test('declares every collection the Astro content config defines', () => {
    expect(config.collections.map((entry) => entry.name).sort()).toEqual([
      'pages',
      'posts',
      'projects',
      'references',
      'services',
      'settings',
      'team',
    ]);
  });
});

describe('services collection mirrors the service schema', () => {
  test('exposes exactly the schema top-level fields', () => {
    expect(fieldNames(collection('services').fields ?? [])).toEqual(schemaKeys(makeServiceSchema()));
  });

  test('hero exposes every hero sub-field', () => {
    const hero = collection('services').fields?.find((field) => field.name === 'hero');
    expect(fieldNames(hero?.fields ?? [])).toEqual(['eyebrow', 'headingLines', 'lead', 'tagline', 'whatsappMessage']);
  });

  test('faq items expose question and answer', () => {
    const faq = collection('services').fields?.find((field) => field.name === 'faq');
    const items = faq?.fields?.find((field) => field.name === 'items');
    expect(fieldNames(items?.fields ?? [])).toEqual(['answer', 'question']);
  });
});

describe('projects collection mirrors the project schema', () => {
  test('exposes the schema fields plus the markdown body', () => {
    const names = fieldNames(collection('projects').fields ?? []).filter((name) => name !== 'body');
    expect(names).toEqual(schemaKeys(makeProjectSchema()));
  });
});

describe('posts collection mirrors the post schema', () => {
  test('exposes the schema fields plus the markdown body', () => {
    const names = fieldNames(collection('posts').fields ?? []).filter((name) => name !== 'body');
    expect(names).toEqual(schemaKeys(makePostSchema()));
  });

  test('offers exactly the statuses the schema allows', () => {
    const status = collection('posts').fields?.find((field) => field.name === 'status') as
      { options?: string[] } | undefined;
    expect(status?.options).toEqual(['draft', 'published']);
  });
});

describe('references and team collections mirror their schemas', () => {
  test('references exposes the schema fields', () => {
    expect(fieldNames(collection('references').fields ?? [])).toEqual(schemaKeys(makeReferenceSchema()));
  });

  test('team exposes the schema fields', () => {
    expect(fieldNames(collection('team').fields ?? [])).toEqual(schemaKeys(makeTeamSchema()));
  });
});

describe('settings singleton mirrors the settings schema', () => {
  test('exposes the schema fields', () => {
    const file = collection('settings').files?.find((entry) => entry.name === 'site');
    expect(fieldNames(file?.fields ?? [])).toEqual(schemaKeys(settingsSchema));
  });
});

describe('pages collection mirrors the page section vocabulary', () => {
  const pages = collection('pages');
  const sections = pages.fields?.find((field) => field.name === 'sections');

  test('exposes seo, whatsappMessage and sections at the top level', () => {
    expect(fieldNames(pages.fields ?? [])).toEqual(['sections', 'seo', 'whatsappMessage']);
  });

  test('offers a variable type for every section type in the schema', () => {
    const schemaTypes = [...PAGE_SECTION_TYPES].sort();
    expect((sections?.types ?? []).map((entry) => entry.name).sort()).toEqual(schemaTypes);
  });

  test('every section type offers the shared eyebrow/anchor/background controls', () => {
    for (const type of sections?.types ?? []) {
      const names = fieldNames(type.fields ?? []);
      expect({ type: type.name, has: names.includes('background') }).toEqual({ type: type.name, has: true });
      expect({ type: type.name, has: names.includes('anchor') }).toEqual({ type: type.name, has: true });
    }
  });

  test('every section type lets the editor add section-level buttons', () => {
    // sectionBase.ctas her bölümde var — CMS de her bölümde sunmalı, aksi halde
    // referanstaki ızgara-altı butonları editörden gizlenir.
    for (const type of sections?.types ?? []) {
      const names = fieldNames(type.fields ?? []);
      expect({ type: type.name, hasCtas: names.includes('ctas') }).toEqual({ type: type.name, hasCtas: true });
    }
  });

  test('hero offers the trust chips list', () => {
    const hero = (sections?.types ?? []).find((type) => type.name === 'hero');
    expect(fieldNames(hero?.fields ?? [])).toContain('chips');
  });

  test('stats items offer the explanatory description', () => {
    const stats = (sections?.types ?? []).find((type) => type.name === 'stats');
    const items = stats?.fields?.find((field) => field.name === 'items');
    expect(fieldNames(items?.fields ?? [])).toContain('description');
  });

  test('every button list offers exactly the variants the schema allows', () => {
    // page-schema'daki cta.variant enum'u: primary | outline | link
    const expected = ['primary', 'outline', 'link'];
    const lists: { where: string; options: string[] }[] = [];

    const walk = (fields: CmsField[] | undefined, where: string): void => {
      for (const field of fields ?? []) {
        if (field.name === 'variant') {
          lists.push({ where, options: (field as unknown as { options: string[] }).options });
        }
        walk(field.fields, `${where}.${field.name}`);
        walk(field.types, `${where}.${field.name}`);
      }
    };
    walk(sections?.types, 'sections');

    expect(lists.length).toBeGreaterThan(0);
    for (const list of lists)
      expect({ where: list.where, options: list.options }).toEqual({
        where: list.where,
        options: expected,
      });
  });

  test('the form section exposes the post-submit copy fields', () => {
    const form = (sections?.types ?? []).find((type) => type.name === 'form');
    const names = fieldNames(form?.fields ?? []);
    for (const field of ['successHeading', 'successBody', 'successNote', 'successCtas', 'errorHeading', 'errorBody']) {
      expect({ field, present: names.includes(field) }).toEqual({ field, present: true });
    }
  });

  test('the form section offers exactly the form ids the schema allows', () => {
    const form = (sections?.types ?? []).find((type) => type.name === 'form');
    const formId = form?.fields?.find((field) => field.name === 'formId') as { options?: string[] } | undefined;
    expect(formId?.options).toEqual(['contact', 'analysis']);
  });
});
