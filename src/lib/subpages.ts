import { localizedPath, type Locale } from './i18n';
import { t } from './ui';

/**
 * Hizmet alt sayfaları (web tasarım yol haritası, 29 Eyl 2026).
 *
 * Adres, breadcrumb ve yayın kuralı tek yerde durur: yönlendirme, sayfa bileşeni ve
 * testler aynı fonksiyonları kullanır, böylece üçü birbirinden kopamaz.
 */

export type SubpageStatus = 'draft' | 'published';

/** `/hizmetlerimiz/<hizmet>/<alt-sayfa>/` */
export const subpagePath = (locale: Locale, parentKey: string, slug: string): string =>
  localizedPath('services', locale, `${parentKey}/${slug}`);

interface CrumbInput {
  locale: Locale;
  parentKey: string;
  parentTitle: string;
  title: string;
}

/**
 * Ana Sayfa › Hizmetlerimiz › üst hizmet › alt sayfa.
 *
 * Breadcrumb içerikten değil buradan gelir: alt sayfanın hiyerarşisi dosyasındaki
 * `parent` alanıyla belirlenir, editörün elle yazdığı bir listeyle değil. Böylece
 * breadcrumb kuralı (CLAUDE.md) her alt sayfada kendiliğinden sağlanır.
 */
export const subpageCrumbs = ({
  locale,
  parentKey,
  parentTitle,
  title,
}: CrumbInput): { label: string; href?: string }[] => [
  { label: t('nav.home', locale), href: localizedPath('home', locale) },
  { label: t('nav.services', locale), href: localizedPath('services', locale) },
  { label: parentTitle, href: localizedPath('services', locale, parentKey) },
  { label: title },
];

/** Taslak yalnızca geliştirme sunucusunda üretilir; üretim build'ine girmez. */
export const isSubpageBuilt = (status: SubpageStatus, dev: boolean): boolean => status === 'published' || dev;
