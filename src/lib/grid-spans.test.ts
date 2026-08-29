/**
 * Izgara satır doldurma — regresyon testleri.
 *
 * Korunan davranış: son satır ASLA yarım kalmaz. 30 Ağu 2026'da 7 platformlu
 * ızgarada son satırda iki kart kalıp sağda iki sütunluk boşluk oluşuyordu;
 * bölüm bitmemiş görünüyordu.
 */
import { describe, expect, test } from 'bun:test';
import { gridSpans } from './grid-spans';

const f = (featured: boolean) => ({ featured });

describe('gridSpans', () => {
  test('7 kart: 3+3 · 2+2+2 · 3+3 — üç satır da tam dolar', () => {
    const spans = gridSpans([f(true), f(true), f(false), f(false), f(false), f(false), f(false)]);
    expect(spans).toEqual([3, 3, 2, 2, 2, 3, 3]);
  });

  test('her satırın toplamı sütun sayısına eşittir', () => {
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      const items = Array.from({ length: n }, (_, i) => f(i < 2));
      const spans = gridSpans(items);
      let row = 0;
      for (const s of spans) {
        row += s;
        expect(row).toBeLessThanOrEqual(6);
        if (row === 6) row = 0;
      }
      expect(row).toBe(0);
    }
  });

  test('tek kart tüm satırı kaplar', () => {
    expect(gridSpans([f(false)])).toEqual([6]);
  });

  test('öne çıkan kart normalden geniştir', () => {
    const spans = gridSpans([f(true), f(false), f(false)]);
    expect(spans[0]).toBeGreaterThan(spans[1]!);
  });

  test('boş liste boş dizi döner', () => {
    expect(gridSpans([])).toEqual([]);
  });
});
