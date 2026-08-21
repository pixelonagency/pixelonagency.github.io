/**
 * 404 izleme testleri.
 *
 * Korunan davranış: veri yoksa sıfır uydurulmaması (`seen: false`) ve toplam
 * çıktısının URL taşımaması — public rapora yalnızca `totals()` girebilir.
 */
import { describe, expect, test } from 'bun:test';
import { WATCHED, diffAgainst, extractWatched, totals } from './redirect-watch.mjs';

const rows = [
  { page: 'https://pixelon.com.tr/hizmet/web-tasarim-yazilim/', impressions: '7', clicks: '0', position: '1.14' },
  { page: 'https://pixelon.com.tr/referanslar/', impressions: '3', clicks: '1', position: '2' },
];

describe('extractWatched', () => {
  test('izlenen URL listesi 6 APPROVED + 2 HOLD içerir', () => {
    expect(WATCHED).toHaveLength(8);
    expect(WATCHED.filter((w) => w.status === 'APPROVED')).toHaveLength(6);
    expect(WATCHED.filter((w) => w.status === 'HOLD')).toHaveLength(2);
  });

  test('GSC satırından metrikleri okur', () => {
    const out = extractWatched(rows);
    expect(out.find((r) => r.path === '/hizmet/web-tasarim-yazilim/')).toMatchObject({
      seen: true,
      impressions: 7,
      clicks: 0,
      position: 1.14,
    });
  });

  test("GSC'de olmayan URL için sıfır UYDURMAZ, seen=false işaretler", () => {
    const out = extractWatched(rows);
    const missing = out.find((r) => r.path === '/hizmet/mobil-uygulama/');
    expect(missing).toMatchObject({ seen: false, position: null });
  });

  test('satır yoksa tüm liste seen=false döner', () => {
    expect(extractWatched([]).every((r) => r.seen === false)).toBe(true);
  });
});

describe('diffAgainst', () => {
  test('önceki ölçüm yoksa delta null — sahte trend üretmez', () => {
    const d = diffAgainst(extractWatched(rows), null);
    expect(d[0].deltaImpressions).toBeNull();
    expect(d[0].deltaPosition).toBeNull();
  });

  test('gösterim ve pozisyon değişimini hesaplar', () => {
    const prev = extractWatched([
      { page: 'https://pixelon.com.tr/hizmet/web-tasarim-yazilim/', impressions: '4', clicks: '0', position: '2.14' },
    ]);
    const d = diffAgainst(extractWatched(rows), prev);
    const r = d.find((x: { path: string }) => x.path === '/hizmet/web-tasarim-yazilim/')!;
    expect(r.deltaImpressions).toBe(3);
    expect(r.deltaPosition).toBe(-1); // pozisyon iyileşti
  });
});

describe('totals', () => {
  test("yalnızca GSC'de görülenleri toplar", () => {
    const t = totals(extractWatched(rows));
    expect(t).toMatchObject({ watchedCount: 8, seenInGsc: 2, impressions: 10, clicks: 1, bestPosition: 1.14 });
  });

  test('ÇIKTIDA HİÇBİR URL BULUNMAZ — public rapora güvenle girebilir', () => {
    const json = JSON.stringify(totals(extractWatched(rows)));
    expect(json).not.toContain('hizmet');
    expect(json).not.toContain('pixelon.com.tr');
  });

  test('hiç görülmezse bestPosition null döner', () => {
    expect(totals(extractWatched([])).bestPosition).toBeNull();
  });
});
