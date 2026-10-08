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

/**
 * Copy for the generated hub, sector and audience pages (title, meta description, intro).
 * Draft wording: these pages have no CMS entry because they only list content.
 */
export const REHBER_HUB_COPY = {
  title: 'Sektör Rehberleri',
  description:
    'Sektörünüze özel dijital görünürlük rehberleri ve kontrol listeleri: hastanızın ya da müşterinizin sizi bulduğu yerde ne gördüğünü adım adım kontrol edin.',
};

export const REHBER_SECTOR_COPY: Record<RehberSector, { title: string; description: string }> = {
  saglik: {
    title: 'Sağlık Rehberi',
    description:
      'Hekimler, klinikler, hastaneler ve sağlık turizmi kurumları için dijital görünürlük rehberleri ve kontrol listeleri.',
  },
};

export const REHBER_AUDIENCE_COPY: Record<RehberAudience, { title: string; description: string }> = {
  hekimler: {
    title: 'Hekimler için Rehber',
    description: 'Muayenehane hekimleri ve kendi adıyla çalışan uzmanlar için dijital görünürlük rehberleri.',
  },
  klinikler: {
    title: 'Klinikler için Rehber',
    description: 'Poliklinik, diş ve estetik klinikleri için dijital görünürlük rehberleri.',
  },
  hastaneler: {
    title: 'Hastaneler için Rehber',
    description: 'Özel hastanelerin pazarlama ve iletişim ekipleri için dijital görünürlük rehberleri.',
  },
  'saglik-turizmi': {
    title: 'Sağlık Turizmi Rehberi',
    description: 'Yurt dışından hasta kabul eden kurumlar için dijital görünürlük rehberleri.',
  },
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

interface ListedArticle extends TreeArticle {
  data: TreeArticle['data'] & {
    slug: string;
    title: string;
    description: string;
    seri: string;
    okuma_suresi: number;
    durum: RehberStatus;
  };
}

interface ListedChecklist extends TreeEntry {
  data: TreeEntry['data'] & {
    slug: string;
    title: string;
    description: string;
    sure_dakika: number;
    durum: RehberStatus;
  };
}

/** One listing page: the hub (tree only), a sector, or an audience inside a sector. */
export interface RehberLevel<A, C> {
  tree: RehberSectorNode<A, C>[];
  sector?: RehberSectorNode<A, C> | undefined;
  audience?: RehberAudienceNode<A, C> | undefined;
}

interface RehberCard {
  href: string;
  title: string;
  description: string;
  meta?: string | undefined;
  eyebrow?: string | undefined;
  draft?: boolean | undefined;
}

interface RehberIndexView {
  crumbs: { label: string; href?: string }[];
  eyebrow: string;
  title: string;
  description: string;
  listHeading?: string | undefined;
  emptyText?: string | undefined;
  cards: RehberCard[];
  checklistHeading?: string | undefined;
  checklists?: RehberCard[] | undefined;
}

/**
 * What a listing page shows. Cards are derived from the same tree that produced the
 * routes, so a listing can never link to a page that was not built.
 */
export function rehberIndexView<A extends ListedArticle, C extends ListedChecklist>(
  locale: Locale,
  { tree, sector, audience }: RehberLevel<A, C>,
): RehberIndexView {
  if (sector && audience) {
    const copy = REHBER_AUDIENCE_COPY[audience.kitle];
    return {
      crumbs: rehberCrumbs({ locale, sektor: sector.sektor, kitle: audience.kitle }),
      eyebrow: `${REHBER_LABEL} · ${REHBER_SECTOR_LABELS[sector.sektor]}`,
      title: copy.title,
      description: copy.description,
      listHeading: 'Yazılar',
      emptyText: 'Bu kitle için henüz yayında yazı yok.',
      cards: audience.articles.map((entry) => ({
        href: rehberPath(locale, sector.sektor, audience.kitle, entry.data.slug),
        eyebrow: entry.data.seri,
        title: entry.data.title,
        description: entry.data.description,
        meta: `${entry.data.okuma_suresi} ${t('blog.readingTime', locale)}`,
        draft: entry.data.durum === 'taslak',
      })),
      checklistHeading: 'Kontrol listesi',
      checklists: audience.checklists.map((entry) => ({
        href: rehberPath(locale, sector.sektor, audience.kitle, entry.data.slug),
        title: entry.data.title,
        description: entry.data.description,
        meta: `${entry.data.sure_dakika} dakikada doldurulur`,
        draft: entry.data.durum === 'taslak',
      })),
    };
  }

  if (sector) {
    const copy = REHBER_SECTOR_COPY[sector.sektor];
    return {
      crumbs: rehberCrumbs({ locale, sektor: sector.sektor }),
      eyebrow: REHBER_LABEL,
      title: copy.title,
      description: copy.description,
      listHeading: 'Kime göre?',
      cards: sector.audiences.map((node) => ({
        href: rehberPath(locale, sector.sektor, node.kitle),
        title: REHBER_AUDIENCE_LABELS[node.kitle],
        description: REHBER_AUDIENCE_COPY[node.kitle].description,
        meta: node.articles.length > 0 ? `${node.articles.length} yazı` : undefined,
      })),
    };
  }

  return {
    crumbs: rehberCrumbs({ locale }),
    eyebrow: REHBER_LABEL,
    title: REHBER_HUB_COPY.title,
    description: REHBER_HUB_COPY.description,
    cards: tree.map((node) => ({
      href: rehberPath(locale, node.sektor),
      title: REHBER_SECTOR_LABELS[node.sektor],
      description: REHBER_SECTOR_COPY[node.sektor].description,
    })),
  };
}
