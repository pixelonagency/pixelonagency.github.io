/**
 * Analiz katmanı testleri.
 *
 * En kritik davranış: veri yokken UNKNOWN dönmek, sıfır ya da uydurma sayı DEĞİL.
 * İkincisi: `checkSummary` çıktısının sorgu/URL taşımaması — public rapora giren tek şey o.
 */
import { describe, expect, test } from 'bun:test';
import {
  aggregate,
  checkSummary,
  clusterPerformance,
  comparePeriods,
  contentDecay,
  deriveNextPriorities,
  positionBuckets,
  runChecks,
  splitBrand,
  trendThirds,
  weightedPosition,
} from './analysis.mjs';

const dates = (rows: [string, number, number][]) =>
  rows.map(([date, clicks, impressions]) => ({ date, clicks, impressions }));
const win = (c: number, i: number, queries: unknown[] = [], pages: unknown[] = []) => ({
  dates: dates([['2026-08-12', c, i]]),
  queries,
  pages,
});

describe('aggregate / weightedPosition', () => {
  test('toplam ve CTR hesaplar', () => {
    expect(
      aggregate(
        dates([
          ['2026-08-12', 5, 300],
          ['2026-08-13', 7, 351],
        ]),
      ),
    ).toEqual({
      clicks: 12,
      impressions: 651,
      ctr: 1.84,
    });
  });

  test('gösterim yoksa konum null — sıfır uydurmaz', () => {
    expect(weightedPosition([])).toBeNull();
    expect(weightedPosition([{ position: '5', impressions: '0' }])).toBeNull();
  });

  test('konumu gösterime göre ağırlıklandırır', () => {
    expect(
      weightedPosition([
        { position: '10', impressions: '400' },
        { position: '20', impressions: '100' },
      ]),
    ).toBe(12);
  });
});

describe('comparePeriods', () => {
  test('yüzde değişimleri ve konum farkını verir', () => {
    const cur = win(12, 600, [{ position: '10', impressions: '600' }]);
    const prev = win(10, 500, [{ position: '12', impressions: '500' }]);
    const c = comparePeriods(cur, prev);
    expect(c.clicks).toMatchObject({ current: 12, previous: 10, pct: 20 });
    expect(c.impressions.pct).toBe(20);
    expect(c.position.delta).toBe(-2);
  });

  test('önceki dönem sıfırsa pct null', () => {
    expect(comparePeriods(win(5, 100), win(0, 0)).clicks.pct).toBeNull();
  });
});

describe('splitBrand / positionBuckets', () => {
  const queries = [
    { query: 'pixelon', position: '1', impressions: '48', ctr: '14' },
    { query: 'ornek sorgu a', position: '6', impressions: '100', ctr: '0' },
    { query: 'ornek sorgu b', position: '15', impressions: '80', ctr: '0' },
    { query: 'ornek sorgu c', position: '3', impressions: '200', ctr: '1' },
  ];

  test('marka sorgusunu ayırır', () => {
    const { brand, nonBrand } = splitBrand(queries);
    expect(brand).toHaveLength(1);
    expect(nonBrand).toHaveLength(3);
  });

  test('kovalar marka sorgusunu içermez ve sınırlar örtüşmez', () => {
    const b = positionBuckets(queries);
    expect(b.quickWin.map((r: { query: string }) => r.query)).toEqual(['ornek sorgu a']);
    expect(b.strikingDistance.map((r: { query: string }) => r.query)).toEqual(['ornek sorgu b']);
    expect(b.quickWin.concat(b.strikingDistance).some((r: { query: string }) => r.query === 'pixelon')).toBe(false);
  });

  test('CTR fırsatı: ≥50 gösterim + %2 altı CTR, gösterime göre sıralı', () => {
    // Üçü de eşiği geçiyor (200/100/80 gösterim, hepsi %2 altı CTR).
    expect(positionBuckets(queries).ctrOpportunity.map((r: { query: string }) => r.query)).toEqual([
      'ornek sorgu c',
      'ornek sorgu a',
      'ornek sorgu b',
    ]);
  });

  test('gösterim eşiğinin altındaki düşük CTR fırsat sayılmaz', () => {
    const low = [{ query: 'az gosterim', position: '8', impressions: '10', ctr: '0' }];
    expect(positionBuckets(low).ctrOpportunity).toEqual([]);
  });
});

describe('contentDecay', () => {
  const cur = [
    { page: '/a/', impressions: '50' },
    { page: '/b/', impressions: '100' },
  ];
  const prev = [
    { page: '/a/', impressions: '100' },
    { page: '/b/', impressions: '100' },
  ];

  test('gösterimi düşen sayfayı yakalar', () => {
    const d = contentDecay(cur, prev)!;
    expect(d).toHaveLength(1);
    expect(d[0]).toMatchObject({ page: '/a/', before: 100, after: 50, pct: -50 });
  });

  test('karşılaştırma penceresi yoksa null — boş dizi DEĞİL', () => {
    expect(contentDecay(cur, null)).toBeNull();
    expect(contentDecay(null, prev)).toBeNull();
  });

  test('gürültü eşiğinin altındaki sayfaları yok sayar', () => {
    expect(contentDecay([{ page: '/c/', impressions: '0' }], [{ page: '/c/', impressions: '4' }])).toEqual([]);
  });
});

describe('clusterPerformance', () => {
  test('URL desenine göre kümeler', () => {
    const out = clusterPerformance([
      { page: 'https://x/hizmetlerimiz/web-tasarim-ve-yazilim/', clicks: '2', impressions: '100', position: '5' },
      { page: 'https://x/blog/saglik-turizminde-hasta-guveni/', clicks: '0', impressions: '50', position: '30' },
    ]);
    expect(out.find((c) => c.id === 'web-tasarim')).toMatchObject({ pages: 1, clicks: 2, impressions: 100 });
    expect(out.find((c) => c.id === 'saglik-turizmi')).toMatchObject({ pages: 1, impressions: 50 });
  });

  test('eşleşme yoksa sıfır döner, çökmez', () => {
    expect(clusterPerformance([]).every((c) => c.pages === 0)).toBe(true);
  });
});

describe('trendThirds', () => {
  test('90 günü üç eşit dilime böler', () => {
    const rows = Array.from({ length: 90 }, (_, i) => ({ date: `2026-06-${i}`, clicks: 1, impressions: 10 }));
    const t = trendThirds(rows)!;
    expect(t).toHaveLength(3);
    expect(t[0].clicks).toBe(30);
  });

  test('üç satırdan az veriyle null', () => {
    expect(trendThirds([{ date: 'a', clicks: 1, impressions: 1 }])).toBeNull();
  });
});

describe('runChecks', () => {
  test('GSC penceresi yoksa arama kontrolleri UNKNOWN — sıfır uydurmaz', () => {
    const checks = runChecks('weekly', { readyCount: 0 });
    const search = checks.filter((c) => /period-comparison|non-brand|pos-|ctr-|content-decay/.test(c.id));
    expect(search.every((c) => c.status === 'UNKNOWN')).toBe(true);
    expect(search[0].reason).toMatch(/seo:gsc/);
  });

  test('veri kaynağı olmayan kontroller her zaman engel sebebini taşır', () => {
    const checks = runChecks('weekly', {});
    for (const id of ['competitor-movement', 'backlink-gap', 'semrush-keyword-gap']) {
      const c = checks.find((x) => x.id === id)!;
      expect(c.status).toBe('UNKNOWN');
      expect(c.reason!.length).toBeGreaterThan(10);
    }
  });

  test('haftalık 13, aylık daha fazla kontrol çalıştırır', () => {
    const w = runChecks('weekly', {}).length;
    const m = runChecks('monthly', {}).length;
    expect(w).toBeGreaterThanOrEqual(13);
    expect(m).toBeGreaterThan(w);
  });

  test('404 izlemesinde gösterim varsa ATTENTION', () => {
    const c = runChecks('weekly', { watch: { impressions: 41, clicks: 0 } }).find((x) => x.id === 'legacy-404')!;
    expect(c.status).toBe('ATTENTION');
  });

  test('aylık koşu küme kontrollerini içerir', () => {
    const ids = runChecks('monthly', { w28: win(1, 10, [], []) }).map((c) => c.id);
    expect(ids).toContain('cluster-saglik-turizmi');
    expect(ids).toContain('reprioritization');
  });
});

describe('checkSummary', () => {
  test('durumları sayar', () => {
    expect(checkSummary(runChecks('weekly', {})).total).toBeGreaterThan(0);
  });

  test('ÇIKTIDA SORGU YA DA URL BULUNMAZ — public rapora güvenli', () => {
    const json = JSON.stringify(checkSummary(runChecks('monthly', { w28: win(1, 10) })));
    expect(json).not.toMatch(/https?:|sorgu|query/i);
  });
});

describe('deriveNextPriorities', () => {
  test('ATTENTION olanları en üste koyar', () => {
    const p = deriveNextPriorities([
      { id: 'a', status: 'UNKNOWN', reason: 'veri yok' },
      { id: 'b', status: 'ATTENTION', value: 1 },
    ]);
    expect(p[0].id).toBe('b');
  });
});
