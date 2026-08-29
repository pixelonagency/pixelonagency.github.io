/**
 * Izgara kartlarının sütun genişlikleri.
 *
 * Neden var: kartlar sabit genişlikte olduğunda (öne çıkan 3, diğeri 2 sütun)
 * kart sayısı 6'nın katı değilse son satır yarım kalıyor. 7 platformda son
 * satırda iki kart kalıp sağda iki sütunluk boşluk oluşuyor, bölüm bitmemiş
 * görünüyordu.
 *
 * Çözüm: kartlar taban genişlikleriyle satırlara paylaştırılır, sonra HER
 * satırda artan sütunlar o satırın kartlarına dağıtılır. Böylece kart sayısı
 * ne olursa olsun ızgaranın sağ kenarı düz kalır.
 */

const GRID_COLUMNS = 6;

const BASE_FEATURED = 3;
const BASE_NORMAL = 2;

/**
 * @param items Sıralı kart listesi; `featured` olan taban genişliği daha büyüktür.
 * @returns Her karta karşılık gelen sütun genişliği, giriş sırasında.
 */
export function gridSpans(items: readonly { featured?: boolean | undefined }[]): number[] {
  const base = items.map((item) => (item.featured ? BASE_FEATURED : BASE_NORMAL));

  // Taban genişliklerle satırlara böl — bir kart satıra sığmıyorsa yeni satır açılır.
  const rows: number[][] = [];
  let row: number[] = [];
  let width = 0;

  base.forEach((span, index) => {
    if (width + span > GRID_COLUMNS && row.length > 0) {
      rows.push(row);
      row = [];
      width = 0;
    }
    row.push(index);
    width += span;
  });
  if (row.length > 0) rows.push(row);

  // Her satırdaki artan sütunları o satırın kartlarına soldan sağa dağıt.
  const spans = [...base];
  for (const indices of rows) {
    const used = indices.reduce((sum, i) => sum + spans[i]!, 0);
    let left = GRID_COLUMNS - used;
    for (let i = 0; left > 0; i = (i + 1) % indices.length) {
      spans[indices[i]!] += 1;
      left -= 1;
    }
  }

  return spans;
}
