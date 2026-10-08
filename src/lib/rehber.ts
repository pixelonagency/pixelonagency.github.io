import { localizedPath, type Locale } from './i18n';
import { t } from './ui';

/**
 * Rehber (sector guides) taxonomy.
 *
 * The guide is organised as sector › audience › article. Both lists are closed
 * vocabularies: the schema, the routes and the CMS select options all read them,
 * so an unknown sector or audience can never reach a URL.
 */

export const REHBER_SECTORS = ['saglik'] as const;
export type RehberSector = (typeof REHBER_SECTORS)[number];

export const REHBER_AUDIENCES = ['hekimler', 'klinikler', 'hastaneler', 'saglik-turizmi'] as const;
export type RehberAudience = (typeof REHBER_AUDIENCES)[number];

/** `taslak` never ships to production; `yayinda` does. */
export const REHBER_STATUSES = ['taslak', 'yayinda'] as const;
export type RehberStatus = (typeof REHBER_STATUSES)[number];

export const REHBER_LABEL = 'Rehber';

export const REHBER_SECTOR_LABELS: Record<RehberSector, string> = { saglik: 'Sağlık' };

export const REHBER_AUDIENCE_LABELS: Record<RehberAudience, string> = {
  hekimler: 'Hekimler',
  klinikler: 'Klinikler',
  hastaneler: 'Hastaneler',
  'saglik-turizmi': 'Sağlık Turizmi',
};

/** `/rehber/`, `/rehber/<sektor>/`, `/rehber/<sektor>/<kitle>/`, `/rehber/<sektor>/<kitle>/<slug>/` */
export const rehberPath = (locale: Locale, ...segments: string[]): string =>
  localizedPath('guide', locale, segments.join('/') || undefined);

interface CrumbInput {
  locale: Locale;
  sektor?: RehberSector | undefined;
  kitle?: RehberAudience | undefined;
  /** Title of an article or checklist page. */
  title?: string | undefined;
}

/**
 * Ana Sayfa › Rehber › sektör › kitle › sayfa, cut at the current level.
 *
 * Built from the taxonomy, never typed by the editor, so every guide page satisfies the
 * breadcrumb rule (CLAUDE.md). The last crumb is the current page and has no target.
 */
export function rehberCrumbs({ locale, sektor, kitle, title }: CrumbInput): { label: string; href?: string }[] {
  const trail: { label: string; href: string }[] = [
    { label: t('nav.home', locale), href: localizedPath('home', locale) },
    { label: REHBER_LABEL, href: rehberPath(locale) },
  ];
  if (sektor) trail.push({ label: REHBER_SECTOR_LABELS[sektor], href: rehberPath(locale, sektor) });
  if (sektor && kitle) trail.push({ label: REHBER_AUDIENCE_LABELS[kitle], href: rehberPath(locale, sektor, kitle) });
  if (title) trail.push({ label: title, href: '' });

  const last = trail.at(-1);
  return trail.map((crumb) => (crumb === last ? { label: crumb.label } : crumb));
}

/** Drafts are built only by the dev server so the editor can preview them. */
export const isRehberEntryBuilt = (durum: RehberStatus, dev: boolean): boolean => durum === 'yayinda' || dev;

/**
 * A checklist page is a sign-up form. Publishing one whose form has nowhere to send to
 * would put a dead form live, so a published checklist without an endpoint stops the
 * build instead of quietly disappearing from it.
 */
export function isChecklistBuilt(
  entry: { durum: RehberStatus; slug: string },
  endpoint: string,
  dev: boolean,
): boolean {
  if (dev) return true;
  if (entry.durum !== 'yayinda') return false;
  if (!endpoint) {
    throw new Error(
      `Checklist "${entry.slug}" is marked yayinda but CHECKLIST_FORM_ENDPOINT is empty (src/lib/checklist-form.ts). ` +
        'Set the MailerLite form endpoint or move the checklist back to taslak.',
    );
  }
  return true;
}

interface TreeEntry {
  data: { sektor: RehberSector; kitle: RehberAudience };
}

interface TreeArticle extends TreeEntry {
  data: TreeEntry['data'] & { yayin_tarihi: Date };
}

export interface RehberAudienceNode<A, C> {
  kitle: RehberAudience;
  articles: A[];
  checklists: C[];
}

export interface RehberSectorNode<A, C> {
  sektor: RehberSector;
  audiences: RehberAudienceNode<A, C>[];
}

/**
 * Which hub, sector and audience pages exist.
 *
 * Inputs are already filtered by the publish rules above. In production a level gets a
 * page only when something is published below it, so an empty guide ships no pages at
 * all (no empty hubs, no orphans in the sitemap). The dev server shows every level so
 * the structure can be previewed before content exists.
 */
export function buildRehberTree<A extends TreeArticle, C extends TreeEntry>({
  articles,
  checklists,
  dev,
}: {
  articles: A[];
  checklists: C[];
  dev: boolean;
}): RehberSectorNode<A, C>[] {
  return REHBER_SECTORS.map((sektor) => ({
    sektor,
    audiences: REHBER_AUDIENCES.map((kitle) => ({
      kitle,
      articles: articles
        .filter((entry) => entry.data.sektor === sektor && entry.data.kitle === kitle)
        .sort((a, b) => b.data.yayin_tarihi.getTime() - a.data.yayin_tarihi.getTime()),
      checklists: checklists.filter((entry) => entry.data.sektor === sektor && entry.data.kitle === kitle),
    })).filter((node) => dev || node.articles.length > 0 || node.checklists.length > 0),
  })).filter((node) => dev || node.audiences.length > 0);
}
