/**
 * "İlgili Yazılar" seçimi.
 *
 * Liste önce editörün `article.related` alanında seçtiği yazılardan kurulur. Bu alan
 * boş ya da eksik bırakıldığında kart alanı boş kalıyordu: yazı hiçbir başka yazıya
 * bağlanmıyor, karşılığında da bağlantı almıyordu. Semrush taraması bunu "yalnızca tek
 * iç bağlantısı olan 21 sayfa" olarak raporladı — blog ağı birbirine değmiyordu.
 *
 * Bu yüzden eksik kalan yerler ÖNCE aynı kategoriden, sonra blogun geri kalanından
 * tamamlanır. Editörün seçimi her zaman önce ve verdiği sırayla gelir.
 *
 * Doldurma "en yeniden" değil HALKA sırasıyla yapılır: liste tarihe göre dizilir ve
 * o yazının hemen ardından gelenlerden başlanıp başa sarılır. "En yeni" kuralı
 * bağlantıların hep aynı birkaç güncel yazıya yığılmasına, eski yazıların hiç
 * bağlantı almamasına yol açıyordu; halka sırası payı eşit dağıtır.
 */

export interface RelatablePost {
  /** `<locale>/<slug>` biçiminde koleksiyon kimliği. */
  id: string;
  data: {
    category: string;
    date: Date;
    translationKey?: string | undefined;
  };
}

interface PickInput<T extends RelatablePost> {
  current: T;
  /** Aynı dildeki yayımlanmış yazılar. */
  all: T[];
  /** Editörün seçtiği slug ya da çeviri anahtarları. */
  keys: readonly string[];
  count: number;
}

const slugOf = (id: string): string => id.split('/').pop() ?? id;

const newestFirst = <T extends RelatablePost>(a: T, b: T): number => b.data.date.getTime() - a.data.date.getTime();

/**
 * `current`'ın hemen ardından başlayıp başa saran, tarihe göre dizili sıra.
 * `current` listede yoksa (ya da süzgeç onu dışarıda bırakıyorsa) sıra baştan başlar.
 */
function ring<T extends RelatablePost>(all: T[], current: T, keep: (entry: T) => boolean = () => true): T[] {
  const ordered = all.filter((entry) => entry.id === current.id || keep(entry)).sort(newestFirst);
  const index = ordered.findIndex((entry) => entry.id === current.id);
  const start = index === -1 ? 0 : index + 1;

  return [...ordered.slice(start), ...ordered.slice(0, start)].filter((entry) => entry.id !== current.id);
}

export function pickRelatedPosts<T extends RelatablePost>({ current, all, keys, count }: PickInput<T>): T[] {
  const candidates = all.filter((entry) => entry.id !== current.id);
  const picked: T[] = [];
  const taken = new Set<string>();

  const take = (entry: T | undefined): void => {
    if (!entry || taken.has(entry.id) || picked.length >= count) return;
    taken.add(entry.id);
    picked.push(entry);
  };

  // 1) Editörün seçimi — verilen sırayla.
  for (const key of keys) {
    take(candidates.find((entry) => slugOf(entry.id) === key || entry.data.translationKey === key));
  }

  // 2) Aynı kategoriden, halka sırasıyla.
  for (const entry of ring(all, current, (item) => item.data.category === current.data.category)) take(entry);

  // 3) Hâlâ eksikse blogun geri kalanından, yine halka sırasıyla.
  for (const entry of ring(all, current)) take(entry);

  return picked;
}
