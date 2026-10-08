import { z } from 'astro/zod';

import { REHBER_AUDIENCES, REHBER_SECTORS, REHBER_STATUSES } from '../lib/rehber';
import { list, opt, type ImageResolver } from './schemas';

/**
 * Rehber (sector guide) collections: guide articles and gated checklists.
 *
 * New entries start as `taslak` (draft): guide copy for healthcare goes through owner
 * and legal review before it ships. Drafts are built only by the dev server
 * (see `src/lib/rehber.ts`).
 */

const nonEmpty = z.string().min(1);

/* Unit tests run without Astro; the image field is then a plain path string. */
const defaultImage: ImageResolver = () => z.string();

/** The URL segment of the entry; the CMS writes the file name from it. */
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug may only contain a-z, 0-9 and single hyphens.');

const taxonomy = {
  title: nonEmpty,
  /** Meta description and listing summary. */
  description: nonEmpty,
  slug,
  sektor: z.enum(REHBER_SECTORS),
  kitle: z.enum(REHBER_AUDIENCES),
  durum: z.enum(REHBER_STATUSES).default('taslak'),
  /** Set by the editor once a lawyer has read the copy. Informational; it does not gate the build. */
  hukuk_kontrolu: z.boolean().default(false),
};

/**
 * Cover image (16:9, 1600x900, `src/assets/images/rehber/<slug>.webp`). Optional: without
 * one the page draws a designed fallback. An image without alt text is rejected.
 */
const cover = (image: ImageResolver) => ({
  kapak: opt(image()),
  kapak_alt: opt(z.string()),
});

const requireCoverAlt = (data: { kapak?: unknown; kapak_alt?: string | undefined }, ctx: z.RefinementCtx): void => {
  if (data.kapak !== undefined && !data.kapak_alt?.trim()) {
    ctx.addIssue({ code: 'custom', path: ['kapak_alt'], message: 'kapak_alt is required when kapak is set.' });
  }
};

export const makeRehberSchema = (image: ImageResolver = defaultImage) =>
  z
    .object({
      ...taxonomy,
      ...cover(image),
      /** Series the article belongs to, shown above the title. */
      seri: nonEmpty,
      /** Reading time in whole minutes, entered by the editor. */
      okuma_suresi: z.number().int().positive(),
      yayin_tarihi: z.coerce.date(),
      /** Slug of the related checklist in the same audience. */
      checklist: opt(slug),
    })
    .superRefine(requireCoverAlt);

export const makeChecklistSchema = (image: ImageResolver = defaultImage) =>
  z
    .object({
      ...taxonomy,
      ...cover(image),
      /** How long filling in the checklist takes, in minutes. */
      sure_dakika: z.number().int().positive(),
      intro: nonEmpty,
      /**
       * Only the first section is shown on the page as a preview; the full list is what the
       * reader receives by e-mail. The rest is kept here so the content has one source.
       */
      bolumler: z
        .array(
          z.object({
            baslik: nonEmpty,
            /** Editorial note on the section, e.g. a pending legal review. Not rendered. */
            not: opt(z.string()),
            maddeler: z.array(nonEmpty).min(1),
          }),
        )
        .min(1),
      puanlama: list(z.object({ aralik: nonEmpty, metin: nonEmpty })),
      sonraki_adim: opt(z.string()),
    })
    .superRefine(requireCoverAlt);
