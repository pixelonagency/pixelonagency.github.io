import { describe, expect, test } from 'bun:test';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { PAGE_SECTION_TYPES } from '../src/content/page-schema';
import { DEFAULT_LOCALE, LOCALES } from '../src/lib/i18n';
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

/** Sveltia'nın alan bazlı i18n değerleri. `duplicate` = tek dilde girilir, ötekine kopyalanır. */
type CmsI18n = boolean | 'duplicate' | 'translate' | 'none';

interface CmsField {
  name: string;
  widget?: string;
  fields?: CmsField[];
  field?: CmsField;
  types?: CmsField[];
  required?: boolean;
  i18n?: CmsI18n;
}

interface CmsI18nOptions {
  structure?: string;
  locales?: string[];
  default_locale?: string;
  canonical_slug?: { key?: string; value?: string };
}

interface CmsCollection {
  name: string;
  folder?: string;
  slug?: string;
  i18n?: CmsI18n | CmsI18nOptions;
  fields?: CmsField[];
  files?: { name: string; file: string; i18n?: CmsI18n | CmsI18nOptions; fields: CmsField[] }[];
}

const CONTENT = join(import.meta.dir, '..', 'src', 'content');

const adminHtml = await Bun.file(join(import.meta.dir, '..', 'public', 'admin', 'index.html')).text();

const config = parse(await Bun.file(join(import.meta.dir, '..', 'public', 'admin', 'config.yml')).text()) as {
  backend: { name: string; repo: string; branch: string };
  media_folder: string;
  public_folder: string;
  i18n: CmsI18nOptions;
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
      'categories',
      'legal',
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

/**
 * Çok dillilik sözleşmesi.
 *
 * CMS'in dil listesi `src/lib/i18n.ts` ile elle senkron tutuluyor. Bir dil eklendiğinde
 * (LOCALES büyüdüğünde) CMS geride kalırsa editör yeni dili hiç göremez — site o dilde
 * build olur ama içerik yönetilemez hâle gelir. Aşağıdaki testler o kaymayı kapıda tutar.
 */
describe('i18n wiring', () => {
  /** İçeriği dile göre klasörlenmiş koleksiyonlar. */
  const LOCALISED_COLLECTIONS = ['categories', 'legal', 'pages', 'posts', 'projects', 'services', 'settings'] as const;
  /** Dile bağlı OLMAYAN koleksiyonlar — düz klasör, dil alt klasörü yok. */
  const PLAIN_COLLECTIONS = ['references', 'team'] as const;
  /** Dosya adı (= URL slug'ı) dile göre değişen koleksiyonlar. */
  const LOCALISED_SLUG_COLLECTIONS = ['posts', 'services'] as const;

  /**
   * Dile göre DEĞİŞMEYEN alanlar: editör bunları iki dilde ayrı ayrı girmemeli.
   * Sıra/öne çıkan/çeviri anahtarı/kategori/tarih/durum, iletişim numaraları ve görsel yolları.
   */
  const LANGUAGE_INDEPENDENT_FIELDS = new Set([
    'author',
    'category',
    'client',
    'cover',
    'date',
    'email',
    // Video varlık yolları dile bağlı değildir (public/media altındaki dosyalar).
    'heroVideo',
    // Menüde görünürlük ve menü görseli iki dilde de aynıdır: hizmet ya menüdedir ya değil.
    'menu',
    'updated',
    'featured',
    'order',
    'phone',
    'social',
    'status',
    'translationKey',
    'url',
    'year',
  ]);

  /** Bir dil klasöründeki içerik dosyaları — `.gitkeep` gibi nokta dosyaları sayılmaz. */
  const entryFiles = (collectionName: string, locale: string): string[] =>
    readdirSync(join(CONTENT, collectionName, locale))
      .filter((file) => !file.startsWith('.'))
      .sort();

  const subDirectories = (path: string): string[] =>
    readdirSync(path)
      .filter((entry) => statSync(join(path, entry)).isDirectory())
      .sort();

  /** Koleksiyonun üst düzey alanları — "file" koleksiyonunda tek dosyanın alanları. */
  const topLevelFields = (name: string): CmsField[] => {
    const entry = collection(name);
    return entry.fields ?? (entry.files ?? []).flatMap((file) => file.fields);
  };

  test('declares the folder-per-locale structure the content tree actually uses', () => {
    // `multiple_folders` = <koleksiyon>/<locale>/<ad>. Kardeş seçenekler farklı bir düzen
    // bekler: multiple_files → `about.en.yml`, single_file → tek dosyada iç içe diller,
    // multiple_root_folders → dil klasörü en üstte. Depodaki gerçek düzenle doğruluyoruz.
    expect(config.i18n.structure).toBe('multiple_folders');

    const layout = Object.fromEntries(
      ['legal', 'pages', 'posts', 'projects', 'services', 'settings'].map((name) => [
        name,
        subDirectories(join(CONTENT, name)),
      ]),
    );
    const expected = Object.fromEntries(Object.keys(layout).map((name) => [name, [...LOCALES].sort()]));
    expect(layout).toEqual(expected);
  });

  test('locales mirror LOCALES in src/lib/i18n.ts', () => {
    expect(config.i18n.locales).toEqual([...LOCALES]);
  });

  test('default_locale mirrors DEFAULT_LOCALE in src/lib/i18n.ts', () => {
    expect(config.i18n.default_locale).toBe(DEFAULT_LOCALE);
  });

  test('default_locale is one of the declared locales', () => {
    // Sveltia, tanınmayan bir default_locale'i sessizce listenin ilkine düşürür.
    expect(config.i18n.locales ?? []).toContain(config.i18n.default_locale as string);
  });

  test('every locale-dependent collection opts into i18n', () => {
    // Sveltia'da koleksiyon i18n'e AÇIKÇA katılmalı; üst düzey blok tek başına yetmez.
    const optedOut = LOCALISED_COLLECTIONS.filter((name) => !collection(name).i18n);
    expect(optedOut).toEqual([]);
  });

  test('locale-independent collections stay out of i18n', () => {
    // `references` ve `team` düz klasörde duruyor; i18n açılırsa Sveltia var olmayan
    // `src/content/references/tr/` yolunu arar ve koleksiyon boş görünür.
    for (const name of PLAIN_COLLECTIONS) {
      expect({ name, i18n: collection(name).i18n }).toEqual({ name, i18n: false });
    }
  });

  test('locale-independent collections really have no locale sub-folders', () => {
    for (const name of PLAIN_COLLECTIONS) {
      const path = join(CONTENT, name);
      if (!existsSync(path)) continue;
      expect({ name, subDirs: subDirectories(path) }).toEqual({ name, subDirs: [] });
    }
  });

  test('the settings file collection resolves through a {{locale}} placeholder', () => {
    // "file" koleksiyonlarında yol elle yazılır: hem koleksiyon hem dosya i18n'e katılmalı
    // ve yol `{{locale}}` içermelidir. İçermezse Sveltia `single_file` yapısına düşer ve
    // iki dili tek dosyaya iç içe yazmaya çalışır.
    const settings = collection('settings');
    const file = settings.files?.find((entry) => entry.name === 'site');

    expect(settings.i18n).toBe(true);
    expect(file?.i18n).toBe(true);
    expect(file?.file).toContain('{{locale}}');

    // Yer tutucu her dil için gerçekten var olan bir dosyaya çözülmeli.
    const missing = LOCALES.filter(
      (locale) => !existsSync(join(CONTENT, '..', '..', (file?.file ?? '').replace('{{locale}}', locale))),
    );
    expect(missing).toEqual([]);
  });

  test('collections whose filenames differ per locale localize the slug', () => {
    // `| localize` olmadan Sveltia her dilde AYNI dosya adını bekler; farklı adlar
    // birbirine bağlanmaz ve her dil "çevirisi eksik" ayrı bir girdi gibi görünür.
    for (const name of LOCALISED_SLUG_COLLECTIONS) {
      const perLocale = LOCALES.map((locale) => new Set(entryFiles(name, locale)));
      const shared = [...perLocale[0]!].filter((file) => perLocale.slice(1).every((set) => set.has(file)));

      expect({ name, sharedFilenames: shared }).toEqual({ name, sharedFilenames: [] });
      expect({ name, slug: collection(name).slug }).toEqual({ name, slug: '{{title | localize}}' });
    }
  });

  test('collections that share filenames across locales do not localize the slug', () => {
    for (const name of ['legal', 'pages', 'projects'] as const) {
      const perLocale = LOCALES.map((locale) => entryFiles(name, locale));
      const expected = perLocale.map(() => perLocale[0]);
      expect({ name, perLocale }).toEqual({ name, perLocale: expected as string[][] });
      expect({ name, slug: collection(name).slug }).toEqual({ name, slug: '{{slug}}' });
    }
  });

  test('localized-slug collections link their locales through translationKey', () => {
    // Dosya adları ayrıştığı için bağ dosya içindeki bir özellikten kurulur.
    // `src/pages/[...path].astro` hreflang'i tam da bu alandan üretiyor.
    for (const name of LOCALISED_SLUG_COLLECTIONS) {
      const options = collection(name).i18n as CmsI18nOptions;
      expect({ name, key: options?.canonical_slug?.key }).toEqual({ name, key: 'translationKey' });

      const declared = topLevelFields(name).map((field) => field.name);
      expect({ name, declares: declared.includes('translationKey') }).toEqual({ name, declares: true });
    }
  });

  test('language-independent fields are duplicated so the editor enters them once', () => {
    const offenders: string[] = [];
    for (const name of LOCALISED_COLLECTIONS) {
      for (const field of topLevelFields(name)) {
        if (!LANGUAGE_INDEPENDENT_FIELDS.has(field.name)) continue;
        if (field.i18n !== 'duplicate') offenders.push(`${name}.${field.name} = ${String(field.i18n)}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  test('every other top-level field is explicitly translatable', () => {
    // Sveltia'da alan varsayılanı `false`: işaretlenmeyen alan yalnızca varsayılan dilde
    // düzenlenebilir ve diğer dillerde GİZLENİR. Yani unutulan bir alan sessizce
    // çevrilemez hâle gelir. Nesne/liste alanında `i18n: true` alt alanlara miras kalır.
    const offenders: string[] = [];
    for (const name of LOCALISED_COLLECTIONS) {
      for (const field of topLevelFields(name)) {
        if (LANGUAGE_INDEPENDENT_FIELDS.has(field.name)) continue;
        if (field.i18n !== true) offenders.push(`${name}.${field.name} = ${String(field.i18n)}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  test('the WhatsApp number is duplicated while its message is translated', () => {
    // Numara dile bağlı değil, hazır mesaj bağlı — aynı nesnenin içinde ayrışıyorlar.
    const whatsapp = topLevelFields('settings').find((field) => field.name === 'whatsapp');
    const byName = Object.fromEntries((whatsapp?.fields ?? []).map((field) => [field.name, field.i18n]));
    expect(byName).toEqual({ number: 'duplicate', defaultMessage: true });
  });

  test('locale-independent collections declare no field-level i18n', () => {
    const offenders: string[] = [];
    for (const name of PLAIN_COLLECTIONS) {
      for (const field of topLevelFields(name)) {
        if (field.i18n !== undefined) offenders.push(`${name}.${field.name} = ${String(field.i18n)}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe('services collection mirrors the service schema', () => {
  test('exposes exactly the schema top-level fields', () => {
    expect(fieldNames(collection('services').fields ?? [])).toEqual(schemaKeys(makeServiceSchema()));
  });

  test('hero exposes every hero sub-field', () => {
    const hero = collection('services').fields?.find((field) => field.name === 'hero');
    // `logos` 30 Ağu 2026'da eklendi: CTA altındaki platform marka şeridi.
    expect(fieldNames(hero?.fields ?? [])).toEqual([
      'eyebrow',
      'headingLines',
      'lead',
      'logos',
      'tagline',
      'whatsappMessage',
    ]);
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
