/**
 * Zamanlayıcı muhasebesi testleri.
 *
 * Korunan davranış: başarısız bir koşunun, en son BAŞARILI koşu kaydını silmemesi.
 * Bu bilgi kaybolursa "sistem ne zamandır bozuk" sorusu cevapsız kalır.
 */
import { describe, expect, test } from 'bun:test';
import { recordRun } from './record-run.mjs';

describe('recordRun', () => {
  test('başarılı koşu her iki damgayı da yazar', () => {
    const s = recordRun({}, 'weekly', 0, 'T1', '/log/a');
    expect(s.scheduler.weekly).toMatchObject({
      lastRun: 'T1',
      lastSuccessfulRun: 'T1',
      lastExitCode: 0,
      consecutiveFailures: 0,
    });
  });

  test('başarısız koşu son BAŞARILI koşuyu KORUR', () => {
    const first = recordRun({}, 'weekly', 0, 'T1', '/log/a');
    const second = recordRun(first, 'weekly', 1, 'T2', '/log/b');
    expect(second.scheduler.weekly).toMatchObject({
      lastRun: 'T2',
      lastSuccessfulRun: 'T1',
      lastExitCode: 1,
      consecutiveFailures: 1,
    });
  });

  test('arka arkaya hatalar sayılır, başarı sayacı sıfırlar', () => {
    let s = recordRun({}, 'daily', 1, 'T1', '/l');
    s = recordRun(s, 'daily', 1, 'T2', '/l');
    expect(s.scheduler.daily.consecutiveFailures).toBe(2);
    s = recordRun(s, 'daily', 0, 'T3', '/l');
    expect(s.scheduler.daily.consecutiveFailures).toBe(0);
  });

  test('modlar birbirini ezmez', () => {
    let s = recordRun({}, 'daily', 0, 'T1', '/l');
    s = recordRun(s, 'monthly', 0, 'T2', '/l');
    expect(Object.keys(s.scheduler).sort()).toEqual(['daily', 'monthly']);
  });

  test('mevcut state anahtarlarını korur', () => {
    const s = recordRun({ warnings: ['x'] }, 'daily', 0, 'T1', '/l');
    expect(s.warnings).toEqual(['x']);
  });
});
