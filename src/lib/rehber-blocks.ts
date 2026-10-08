/**
 * Rich blocks inside guide article Markdown.
 *
 * The site has no MDX, and blog posts keep their rich blocks in structured frontmatter.
 * Guide articles are prose-first Markdown, so a block is placed with a marker paragraph
 * on its own line:
 *
 *     [[infografik: hekimin-google-profili]]   inline SVG infographic with caption
 *     [[alinti]]                               pull quote from the `alinti` field
 *     [[istatistikler]]                        stat cards from the `istatistikler` field
 *     [[checklist: 13-17]]                     callout linking to the related checklist
 *
 * Astro renders the Markdown as usual; the article page splits the rendered HTML at the
 * marker paragraphs and renders Astro components in between. No remark/rehype plugin and
 * no new dependency, and editors type the markers in the CMS Markdown field.
 *
 * An unknown or malformed marker throws, so a typo stops the build instead of printing
 * `[[...]]` on the page.
 */

/**
 * Infographics that `[[infografik: <name>]]` may place. Each name has an inline SVG
 * component in src/components/rehber/infographics; the registry there is typed against
 * this list, so the two cannot drift apart.
 */
export const INFOGRAPHIC_NAMES = [
  'hekimin-google-profili',
  'hasta-yorumlarini-toplamak-ve-cevaplamak',
  'kamera-karsisinda-hekim',
] as const;
export type InfographicName = (typeof INFOGRAPHIC_NAMES)[number];

export type BodyBlock =
  | { kind: 'infografik'; name: string }
  | { kind: 'alinti' }
  | { kind: 'istatistikler' }
  | { kind: 'checklist'; from: number; to: number };

export type BodySegment = { kind: 'html'; html: string } | BodyBlock;

const MARKER = /^\[\[\s*([a-z]+)\s*(?::\s*([^\]]*?))?\s*\]\]$/;

/** Parses a whole paragraph as a marker; `null` when the text is not a marker at all. */
export function parseMarker(text: string): BodyBlock | null {
  const match = MARKER.exec(text.trim());
  if (!match) return null;
  const [, kind = '', arg] = match;

  switch (kind) {
    case 'infografik':
      if (!arg || !/^[a-z0-9-]+$/.test(arg)) throw new Error(`[[infografik: <name>]] needs a name, got "${text}".`);
      return { kind, name: arg };
    case 'alinti':
    case 'istatistikler':
      if (arg) throw new Error(`[[${kind}]] takes no argument; its content comes from frontmatter. Got "${text}".`);
      return { kind };
    case 'checklist': {
      const range = /^(\d+)(?:-(\d+))?$/.exec(arg ?? '');
      const from = Number(range?.[1]);
      const to = Number(range?.[2] ?? range?.[1]);
      if (!range || from < 1 || to < from) {
        throw new Error(`[[checklist: <from>-<to>]] needs an ascending item range, got "${text}".`);
      }
      return { kind, from, to };
    }
    default:
      throw new Error(`Unknown guide block "${kind}" in "${text}".`);
  }
}

/* A marker survives Markdown rendering as a paragraph of its own. */
const MARKER_PARAGRAPH = /<p>(\[\[[^\]<]*\]\])<\/p>/g;

/** Splits rendered article HTML into plain HTML parts and blocks, in order. */
export function splitArticleBody(html: string): BodySegment[] {
  const segments: BodySegment[] = [];
  let cursor = 0;

  for (const match of html.matchAll(MARKER_PARAGRAPH)) {
    const block = parseMarker(match[1] ?? '');
    if (!block) continue;
    if (match.index > cursor) segments.push({ kind: 'html', html: html.slice(cursor, match.index) });
    segments.push(block);
    cursor = match.index + match[0].length;
  }

  if (cursor < html.length) segments.push({ kind: 'html', html: html.slice(cursor) });
  return segments;
}

/** "Bu bölüm checklistin 13-17. maddeleri." */
export const checklistRangeText = (from: number, to: number): string =>
  from === to ? `Bu bölüm checklistin ${from}. maddesi.` : `Bu bölüm checklistin ${from}-${to}. maddeleri.`;
