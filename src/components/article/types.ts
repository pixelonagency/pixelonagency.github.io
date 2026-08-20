import type { CollectionEntry } from 'astro:content';

/**
 * Blok birliği doğrudan koleksiyon tipinden türetilir — zod şeması değişirse
 * bileşenler derlemede patlar, elle tutulan bir kopya sessizce kaymaz.
 */
export type Article = NonNullable<CollectionEntry<'posts'>['data']['article']>;
export type ArticleBlock = Article['blocks'][number];

/** Belirli bir blok türünü ayıklar: `BlockOf<'table'>`. */
export type BlockOf<T extends ArticleBlock['type']> = Extract<ArticleBlock, { type: T }>;

/**
 * Metin alanları markdown değil düz metindir; paragraflar çift satır sonuyla
 * ayrılır (proje detay sayfasındaki `paragraphs()` ile aynı sözleşme).
 */
export const paragraphs = (text: string): string[] =>
  text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

/** İki haneli blok/adım numarası: 1 → "01". */
export const stepNo = (index: number): string => String(index + 1).padStart(2, '0');

/**
 * Blok gövdesindeki tüm okunabilir metni toplar — okuma süresi bloklardan
 * hesaplanır, markdown gövdesi boş olduğu için `post.body` kullanılamaz.
 */
export const blocksText = (blocks: ArticleBlock[]): string => {
  const parts: string[] = [];
  for (const block of blocks) {
    switch (block.type) {
      case 'section':
        parts.push(block.heading, block.lead ?? '', block.text);
        break;
      case 'cards':
      case 'checklist':
        parts.push(block.heading ?? '', block.intro ?? '', ...block.items.flatMap((i) => [i.title, i.text]));
        break;
      case 'process':
        parts.push(block.heading ?? '', block.intro ?? '', ...block.steps.flatMap((s) => [s.title, s.text]));
        break;
      case 'callout':
        parts.push(block.heading, block.text);
        break;
      case 'quote':
        parts.push(block.text);
        break;
      case 'table':
        parts.push(block.heading ?? '', block.intro ?? '', ...block.rows.flat());
        break;
      case 'chips':
        parts.push(block.heading ?? '', block.intro ?? '', ...block.items);
        break;
      case 'infographic':
        parts.push(block.heading ?? '', block.intro ?? '', block.center, ...block.nodes);
        break;
      case 'faq':
        parts.push(block.heading ?? '', ...block.items.flatMap((i) => [i.question, i.answer]));
        break;
      case 'cta':
        parts.push(block.heading, block.text ?? '');
        break;
      case 'image':
        parts.push(block.caption ?? '');
        break;
    }
  }
  return parts.filter(Boolean).join(' ');
};

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Yalnız site içi yollar ve https bağlantıları kabul edilir. */
const isSafeHref = (href: string): boolean => /^\/(?!\/)/.test(href) || /^https:\/\/[^\s"']+$/.test(href);

/**
 * Gövde metni markdown DEĞİLDİR; tek istisna satır içi bağlantıdır:
 *
 *     [sosyal medya yönetimi](/hizmetlerimiz/sosyal-medya-yonetimi)
 *
 * Böylece editör CMS'te iç bağlantı verebilir ama tam markdown yüzeyi (ham HTML,
 * script) açılmaz. Metin önce kaçırılır, sonra yalnız güvenli href'ler bağlanır.
 */
export const inlineHtml = (text: string): string =>
  escapeHtml(text).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label: string, href: string) => {
    if (!isSafeHref(href)) return match;
    const external = href.startsWith('https://');
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${href}"${attrs}>${label}</a>`;
  });
