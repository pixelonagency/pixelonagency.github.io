import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { makePageSchema, makeSubpageSchema } from './content/page-schema';
import { checklistSchema, rehberSchema } from './content/rehber-schema';
import {
  blogCategorySchema,
  legalSchema,
  makePostSchema,
  makeProjectSchema,
  makeReferenceSchema,
  makeServiceSchema,
  makeTeamSchema,
  settingsSchema,
} from './content/schemas';

const CONTENT = './src/content';

/**
 * Çok dilli koleksiyonlar `<koleksiyon>/<locale>/<ad>` düzenindedir; dolayısıyla girdi
 * kimliği `tr/home`, `en/services` biçiminde oluşur. `resolveEntryId()` (src/lib/i18n.ts)
 * istenen dilde girdi yoksa varsayılan dile düşer.
 *
 * `references` ve `team` dile bağlı değildir (logo ve isimler ortaktır) — düz kalırlar.
 */

const services = defineCollection({
  loader: glob({ pattern: '*/*.yml', base: `${CONTENT}/services` }),
  schema: ({ image }) => makeServiceSchema(image),
});

const projects = defineCollection({
  loader: glob({ pattern: '*/*.md', base: `${CONTENT}/projects` }),
  schema: ({ image }) => makeProjectSchema(image),
});

const posts = defineCollection({
  loader: glob({ pattern: '*/*.md', base: `${CONTENT}/posts` }),
  schema: ({ image }) => makePostSchema(image),
});

const references = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: `${CONTENT}/references` }),
  schema: ({ image }) => makeReferenceSchema(image),
});

const team = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: `${CONTENT}/team` }),
  schema: ({ image }) => makeTeamSchema(image),
});

// Tekil (singleton) ayarlar — tek girdi: `site`.
const settings = defineCollection({
  loader: glob({ pattern: '*/site.yml', base: `${CONTENT}/settings` }),
  schema: settingsSchema,
});

// Yasal metinler — uzun düzyazı olduğu için markdown gövdeli ayrı koleksiyon.
// Dosya adı ROUTE_SLUGS anahtarıdır (kvkk/privacy/cookies/terms); slug dile göre çevrilir.
const legal = defineCollection({
  loader: glob({ pattern: '*/*.md', base: `${CONTENT}/legal` }),
  schema: legalSchema,
});

// Blog kategori merkezlerinin editoryal metni. Dosya adı kategori slug'ıdır; içerik
// yalnızca metin olduğu için görsel çözümleyicisi almaz.
const categories = defineCollection({
  loader: glob({ pattern: '*/*.yml', base: `${CONTENT}/categories` }),
  schema: blogCategorySchema,
});

// Sayfa gövdeleri — her biri sıralı bir `sections` listesinden oluşur (bkz. page-schema.ts).
const pages = defineCollection({
  loader: glob({ pattern: '*/*.yml', base: `${CONTENT}/pages` }),
  schema: ({ image }) => makePageSchema(image),
});

// Hizmet alt sayfaları — `/hizmetlerimiz/<hizmet>/<alt-sayfa>/`. Dosya adı alt sayfanın
// slug'ıdır, üst hizmet dosyadaki `parent` alanıyla belirlenir (bkz. src/lib/subpages.ts).
const subpages = defineCollection({
  loader: glob({ pattern: '*/*.yml', base: `${CONTENT}/subpages` }),
  schema: ({ image }) => makeSubpageSchema(image),
});

/*
 * The guide collections carry a `slug` field, and the glob loader would use it as the
 * entry id, dropping the `<locale>/` prefix every route relies on. The id is taken from
 * the file path instead, like every other collection here.
 */
const idFromPath = ({ entry }: { entry: string }): string => entry.replace(/\.(md|yml)$/, '');

// Sector guide articles — `/rehber/<sektor>/<kitle>/<slug>/`. The file name is the
// `slug` field; drafts (`durum: taslak`) are built only by the dev server.
const rehber = defineCollection({
  loader: glob({ pattern: '*/*.md', base: `${CONTENT}/rehber`, generateId: idFromPath }),
  schema: rehberSchema,
});

// Gated checklists shown as a landing page with a sign-up form under their audience.
const checklists = defineCollection({
  loader: glob({ pattern: '*/*.yml', base: `${CONTENT}/checklists`, generateId: idFromPath }),
  schema: checklistSchema,
});

export const collections = {
  services,
  projects,
  posts,
  references,
  team,
  settings,
  pages,
  legal,
  categories,
  subpages,
  rehber,
  checklists,
};
