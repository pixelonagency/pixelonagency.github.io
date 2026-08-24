/**
 * Görev kimliği regresyon testleri.
 *
 * Korunan davranış: bir kimlik ikinci kez kullanılamaz. 24 Ağu 2026'da
 * `SEO-2026-0093` yeniden kullanıldı ve önceki kaydın üzerine yazdı; sebebi
 * public state'teki sayacın elle tutulması ve 68'de kalmasıydı (gerçek en
 * yüksek kimlik 105).
 */
import { describe, expect, test } from 'bun:test';
import { checkCounter, maxTaskNumber, nextTaskId } from './task-id.mjs';

const tasks = {
  'SEO-2026-0001': {},
  'SEO-2026-0093': {},
  'SEO-2026-0105': {},
  notATask: {},
  'SEO-BOZUK': {},
};

describe('maxTaskNumber', () => {
  test('en yüksek sıra numarasını bulur', () => {
    expect(maxTaskNumber(tasks)).toBe(105);
  });

  test('geçersiz anahtarları yok sayar', () => {
    expect(maxTaskNumber({ notATask: {}, 'SEO-BOZUK': {} })).toBe(0);
  });

  test('boş tablo 0 döner', () => {
    expect(maxTaskNumber({})).toBe(0);
    expect(maxTaskNumber()).toBe(0);
  });
});

describe('nextTaskId', () => {
  test('en yüksek kimliğin bir fazlasını üretir', () => {
    expect(nextTaskId(tasks, 2026)).toBe('SEO-2026-0106');
  });

  test('sıfırla doldurur', () => {
    expect(nextTaskId({ 'SEO-2026-0008': {} }, 2026)).toBe('SEO-2026-0009');
  });

  test('boş tabloda 0001 ile başlar', () => {
    expect(nextTaskId({}, 2026)).toBe('SEO-2026-0001');
  });

  test('üretilen kimlik mevcut hiçbir kimlikle çakışmaz', () => {
    const id = nextTaskId(tasks, 2026);
    expect(Object.keys(tasks)).not.toContain(id);
  });
});

describe('checkCounter — 0093 regresyonu', () => {
  test('sayaç en yüksek kimlikten küçükse REDDEDİLİR', () => {
    // Gerçek olay: sayaç 68, en yüksek kimlik 105.
    const r = checkCounter(68, tasks);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.expected).toBe(106);
      expect(r.reason).toContain('üzerine yazar');
    }
  });

  test('sayaç en yüksek kimliğe EŞİTSE de reddedilir', () => {
    // 105 ile üretilen kimlik SEO-2026-0105 olur — mevcut kaydın üzerine yazar.
    expect(checkCounter(105, tasks).ok).toBe(false);
  });

  test('sayaç en yüksek kimlikten büyükse geçer', () => {
    expect(checkCounter(106, tasks).ok).toBe(true);
    expect(checkCounter(200, tasks).ok).toBe(true);
  });

  test('sayı olmayan sayaç reddedilir', () => {
    expect(checkCounter(undefined as unknown as number, tasks).ok).toBe(false);
    expect(checkCounter('106' as unknown as number, tasks).ok).toBe(false);
  });

  test('boş tabloda 1 geçerli başlangıçtır', () => {
    expect(checkCounter(1, {}).ok).toBe(true);
    expect(checkCounter(0, {}).ok).toBe(false);
  });
});
