import type { InfographicName } from '../../../lib/rehber-blocks';
import CekimDuzeni from './CekimDuzeni.astro';
import GoogleProfilAnatomisi from './GoogleProfilAnatomisi.astro';
import YorumAkisi from './YorumAkisi.astro';

/**
 * `[[infografik: <name>]]` → component and caption. Typed against `INFOGRAPHIC_NAMES`,
 * so adding a name without a component (or the reverse) fails the typecheck.
 */
export const INFOGRAPHICS: Record<
  InfographicName,
  { component: typeof GoogleProfilAnatomisi; title: string; caption: string }
> = {
  'hekimin-google-profili': {
    component: GoogleProfilAnatomisi,
    title: 'Google profilinin anatomisi',
    caption: 'Numaralar checklistin 1-6. maddeleriyle eşleşir.',
  },
  'hasta-yorumlarini-toplamak-ve-cevaplamak': {
    component: YorumAkisi,
    title: 'Yorum akışı',
    caption: 'Yorum isteği resepsiyondaki standa ve görevlinin günlük rutinine bağlanır.',
  },
  'kamera-karsisinda-hekim': {
    component: CekimDuzeni,
    title: 'Çekim düzeni',
    caption: 'Antalya’daki dermatoloji kliniği için kurduğumuz aylık video düzeni.',
  },
};
