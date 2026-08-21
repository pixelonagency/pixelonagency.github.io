import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { DEFAULT_LOCALE, localizedPath, type PageKey } from '../lib/i18n';
import { buildLlmsTxt, type LlmsLink } from '../lib/llms';
import { truncateDescription } from '../lib/seo';
import { t } from '../lib/ui';

/**
 * Statik build sırasında dosyaya dönüşür: `dist/llms.txt`.
 *
 * Yalnız varsayılan dildeki (TR) sayfalar listelenir — dosya sitenin ana kaynak
 * haritasıdır, çeviri kopyaları hreflang üzerinden zaten keşfedilir.
 */
export const GET: APIRoute = async ({ site }) => {
  const base = site?.toString() ?? 'https://pixelon.com.tr';
  const locale = DEFAULT_LOCALE;

  const settings = await getEntry('settings', `${locale}/site`);

  const services = (await getCollection('services'))
    .filter((entry) => entry.id.startsWith(`${locale}/`))
    .sort((a, b) => a.data.order - b.data.order)
    .map<LlmsLink>((entry) => ({
      label: entry.data.navLabel,
      path: localizedPath('services', locale, entry.id.split('/').slice(1).join('/')),
      description: truncateDescription(entry.data.hero.tagline ?? entry.data.seo.description, 120),
    }));

  const posts = (await getCollection('posts'))
    .filter((entry) => entry.id.startsWith(`${locale}/`) && entry.data.status === 'published')
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .map<LlmsLink>((entry) => ({
      label: entry.data.title,
      path: localizedPath('blog', locale, entry.id.split('/').slice(1).join('/')),
      description: truncateDescription(entry.data.excerpt, 120),
    }));

  const page = (key: PageKey, label: string): LlmsLink => ({ label, path: localizedPath(key, locale) });

  const body = buildLlmsTxt({
    site: base,
    title: 'Pixelon',
    summary: truncateDescription(settings?.data.footerIntro ?? t('brand.logoAltShort', locale), 220),
    sections: [
      {
        heading: 'Kurumsal',
        links: [
          page('about', t('nav.about', locale)),
          page('services', t('nav.services', locale)),
          page('projects', t('nav.projects', locale)),
          page('references', t('nav.references', locale)),
          page('careers', t('nav.careers', locale)),
          page('contact', t('nav.contact', locale)),
          page('analysis', t('nav.analysis', locale)),
          page('website', t('nav.website', locale)),
        ],
      },
      { heading: 'Hizmetler', links: services },
      { heading: 'Blog', links: posts },
    ],
  });

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
