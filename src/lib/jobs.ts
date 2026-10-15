import { localizedPath, type Locale } from './i18n';
import { t } from './ui';

/**
 * Kariyer ilanları (`/kariyer/<ilan>/`).
 *
 * Adres, breadcrumb, yayın kuralı ve JobPosting açıklaması tek yerde durur: yönlendirme,
 * sayfa bileşeni ve testler aynı fonksiyonları kullanır.
 */

export type JobStatus = 'draft' | 'published';

/** `/kariyer/<ilan>/` */
export const jobPath = (locale: Locale, slug: string): string => localizedPath('careers', locale, slug);

/** Ana Sayfa › Kariyer › ilan. Breadcrumb hiyerarşiden gelir, editör elle yazmaz. */
export const jobCrumbs = ({ locale, title }: { locale: Locale; title: string }): { label: string; href?: string }[] => [
  { label: t('nav.home', locale), href: localizedPath('home', locale) },
  { label: t('nav.careers', locale), href: localizedPath('careers', locale) },
  { label: title },
];

/** Taslak ilan yalnızca geliştirme sunucusunda üretilir; üretim build'ine girmez. */
export const isJobBuilt = (status: JobStatus, dev: boolean): boolean => status === 'published' || dev;

interface DescribableSection {
  type: string;
  heading?: string | undefined;
  lead?: string | undefined;
  body?: string | undefined;
  items?: readonly unknown[] | undefined;
}

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const paragraphs = (value: string): string =>
  value
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `<p>${escapeHtml(part)}</p>`)
    .join('');

/**
 * Google iş ilanı tam metni ister. Metin ayrı bir alanda tekrar yazılmaz, sayfada
 * görünen bölümlerden üretilir: hero'nun girişi, metin bölümleri ve madde listeleri.
 * Çağrı bölümleri (başvuru butonu) açıklamaya girmez.
 */
export function jobDescriptionHtml(sections: readonly DescribableSection[]): string {
  return sections
    .map((section) => {
      const heading = section.heading ? `<h2>${escapeHtml(section.heading)}</h2>` : '';
      if (section.type === 'hero') return section.lead ? paragraphs(section.lead) : '';
      if (section.type === 'text' && section.body) return heading + paragraphs(section.body);
      if (section.type === 'bullets' && section.items) {
        const items = section.items.filter((item): item is string => typeof item === 'string');
        return `${heading}<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
      }
      return '';
    })
    .join('');
}
