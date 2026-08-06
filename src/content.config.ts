import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { makePageSchema } from './content/page-schema';
import {
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

// Sayfa gövdeleri — her biri sıralı bir `sections` listesinden oluşur (bkz. page-schema.ts).
const pages = defineCollection({
  loader: glob({ pattern: '*/*.yml', base: `${CONTENT}/pages` }),
  schema: ({ image }) => makePageSchema(image),
});

export const collections = { services, projects, posts, references, team, settings, pages };
