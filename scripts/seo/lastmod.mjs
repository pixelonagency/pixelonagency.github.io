/**
 * Sitemap `lastmod` haritası — URL → gerçek editoryal tarih.
 *
 * NEDEN ELLE: `@astrojs/sitemap` tek bir global `lastmod` alabiliyor, o da her URL'e
 * aynı damgayı basardı — yani hiç dokunulmamış bir sayfaya "bugün güncellendi" demek.
 * Google tutarsız `lastmod`'u tamamen yok sayıyor; yalan sinyal, sinyalsizlikten kötü.
 *
 * NEDEN GIT DEĞİL: dosyanın son commit tarihi doğru kaynak olurdu ama üretim iş akışı
 * sığ checkout (`fetch-depth: 1`) ile çalışıyor — CI'da git geçmişi yok, tarih
 * güvenilmez. İçeriğin kendi alanı hem doğru hem taşınabilir.
 *
 * KAPSAM: yalnızca içerikte GERÇEK bir tarih taşıyan sayfalar haritaya girer:
 *   · blog yazısı → `article.updated`, yoksa yayın tarihi `date`
 *   · yasal metin → `updated`
 * Ana sayfa, hizmet ve vaka sayfalarının gerçek bir güncelleme tarihi yok; onlar
 * `lastmod`'suz kalır. Eksik olması yanlış olmasından iyidir (sitemap şemasında
 * `lastmod` zaten URL başına opsiyonel).
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const CONTENT = join(process.cwd(), 'src', 'content');

/** Yasal dosya adı → yayındaki Türkçe slug (kaynak: src/lib/i18n.ts ROUTE_SLUGS). */
const LEGAL_SLUGS = {
  kvkk: 'kvkk-aydinlatma-metni',
  privacy: 'gizlilik-politikasi',
  cookies: 'cerez-politikasi',
  terms: 'kullanim-kosullari',
};

/** `---` bloğunu ayrıştırır; bozuk frontmatter build'i kırmaz, sayfa lastmod'suz kalır. */
function frontmatter(path) {
  const raw = readFileSync(path, 'utf8');
  const block = raw.split('---')[1];
  if (!block) return null;
  try {
    return parse(block);
  } catch {
    return null;
  }
}

const gecerliTarih = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** @returns {Map<string, Date>} kanonik yol (`/blog/x/`) → tarih */
export function buildLastmodMap() {
  const map = new Map();

  // --- Blog yazıları: article.updated > date ---
  const postsDir = join(CONTENT, 'posts', 'tr');
  if (existsSync(postsDir)) {
    for (const file of readdirSync(postsDir).filter((f) => f.endsWith('.md'))) {
      const data = frontmatter(join(postsDir, file));
      if (!data || data.status === 'draft') continue;
      const date = gecerliTarih(data.article?.updated) ?? gecerliTarih(data.date);
      if (date) map.set(`/blog/${file.replace(/\.md$/, '')}/`, date);
    }
  }

  // --- Yasal metinler: updated ---
  const legalDir = join(CONTENT, 'legal', 'tr');
  if (existsSync(legalDir)) {
    for (const file of readdirSync(legalDir).filter((f) => f.endsWith('.md'))) {
      const key = file.replace(/\.md$/, '');
      const slug = LEGAL_SLUGS[key];
      if (!slug) continue; // bilinmeyen yasal dosya → uydurma slug üretme
      const date = gecerliTarih(frontmatter(join(legalDir, file))?.updated);
      if (date) map.set(`/${slug}/`, date);
    }
  }

  return map;
}
