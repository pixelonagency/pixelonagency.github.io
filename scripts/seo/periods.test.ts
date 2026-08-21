/**
 * Dönem matematiği testleri.
 *
 * Kritik davranış: iki pencerenin ÜST ÜSTE BİNMEMESİ. Bir günlük binme,
 * haftalık büyüme oranını sessizce şişirir ve fark edilmesi çok zordur.
 */
import { describe, expect, test } from 'bun:test';
import { LAG_DAYS, comparePair, pctChange, windowFor, windowPlan } from './periods.mjs';

const NOW = new Date('2026-08-22T00:00:00Z');

describe('windowFor', () => {
  test('GSC gecikmesi kadar geriden biter', () => {
    expect(windowFor(NOW, 7).endDate).toBe('2026-08-19');
    expect(LAG_DAYS).toBe(3);
  });

  test('pencere uçları dahil gün sayısını verir', () => {
    const w = windowFor(NOW, 7);
    expect((Date.parse(w.endDate) - Date.parse(w.startDate)) / 86400000 + 1).toBe(7);
  });
});

describe('comparePair', () => {
  test('önceki dönem, mevcut dönemin bir gün öncesinde biter — BİNME YOK', () => {
    const { current, previous } = comparePair(NOW, 7);
    const gap = (Date.parse(current.startDate) - Date.parse(previous.endDate)) / 86400000;
    expect(gap).toBe(1);
  });

  test('iki pencere de aynı uzunlukta', () => {
    const { current, previous } = comparePair(NOW, 28);
    const len = (w: { startDate: string; endDate: string }) =>
      (Date.parse(w.endDate) - Date.parse(w.startDate)) / 86400000 + 1;
    expect(len(current)).toBe(28);
    expect(len(previous)).toBe(28);
  });

  test('28 günlük çift somut tarihler üretir', () => {
    const { current, previous } = comparePair(NOW, 28);
    expect(current).toMatchObject({ startDate: '2026-07-23', endDate: '2026-08-19' });
    expect(previous).toMatchObject({ startDate: '2026-06-25', endDate: '2026-07-22' });
  });
});

describe('windowPlan', () => {
  test('beş pencere tanımlar', () => {
    expect(Object.keys(windowPlan(NOW)).sort()).toEqual(['d90', 'w28', 'w28-prev', 'w7', 'w7-prev']);
  });
});

describe('pctChange', () => {
  test('artışı ve azalışı hesaplar', () => {
    expect(pctChange(120, 100)).toBe(20);
    expect(pctChange(80, 100)).toBe(-20);
  });

  test('önceki dönem sıfırsa null — sonsuz büyüme uydurmaz', () => {
    expect(pctChange(50, 0)).toBeNull();
  });
});
