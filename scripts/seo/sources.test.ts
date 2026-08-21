/**
 * Veri alım katmanı testleri.
 *
 * GSC dışa aktarımı henüz elimizde olmadığı için parser ve sınıflandırıcı, gerçek
 * Search Console CSV biçimi taklit edilerek doğrulanır. Veri geldiğinde sürprizle
 * karşılaşmamak bu testlerin asıl amacı.
 */
import { describe, expect, test } from 'bun:test';
import { classifyQueries, loadGSC, loadSemrush, parseCsv } from './sources.mjs';

describe('parseCsv', () => {
  test('başlıkları normalize eder ve satırları nesneye çevirir', () => {
    const rows = parseCsv('Query,Clicks,Impressions\nweb tasarım,5,120\n');
    expect(rows).toEqual([{ query: 'web tasarım', clicks: '5', impressions: '120' }]);
  });

  test('tırnak içindeki virgülü alan ayırıcı saymaz', () => {
    const rows = parseCsv('Query,Position\n"web tasarım, istanbul",12.4\n');
    expect(rows[0].query).toBe('web tasarım, istanbul');
    expect(rows[0].position).toBe('12.4');
  });

  test('kaçırılmış çift tırnağı tek tırnağa indirger', () => {
    expect(parseCsv('A\n"o ""iyi"" olan"\n')[0].a).toBe('o "iyi" olan');
  });

  test('boş satırları atar ve son satırı kaybetmez', () => {
    const rows = parseCsv('Query,Clicks\na,1\n\nb,2');
    expect(rows.map((r) => r.query)).toEqual(['a', 'b']);
  });

  test('boş girdide çökmez', () => {
    expect(parseCsv('')).toEqual([]);
  });
});

describe('classifyQueries', () => {
  const rows = [
    { query: 'web tasarım ajansı', position: '6.2', impressions: '400', clicks: '10', ctr: '2.5' },
    { query: 'kurumsal web sitesi', position: '14.8', impressions: '900', clicks: '3', ctr: '0.3' },
    { query: 'pixelon ajans', position: '1.1', impressions: '300', clicks: '120', ctr: '40' },
    { query: 'sağlık turizmi ajansı', position: '32.0', impressions: '50', clicks: '0', ctr: '0' },
  ];

  test('pozisyon 4–10 quick win olarak sınıflanır', () => {
    expect(classifyQueries(rows).quickWin.map((o) => o.q)).toEqual(['web tasarım ajansı']);
  });

  test('pozisyon 11–20 striking distance olarak sınıflanır', () => {
    expect(classifyQueries(rows).strikingDistance.map((o) => o.q)).toEqual(['kurumsal web sitesi']);
  });

  test('yüksek gösterim + düşük CTR ayrı fırsat olarak işaretlenir', () => {
    expect(classifyQueries(rows).ctrOpportunity.map((o) => o.q)).toContain('kurumsal web sitesi');
  });

  test('marka sorgusu non-brand fırsatlarına karışmaz', () => {
    const r = classifyQueries(rows);
    expect(r.brand.map((o) => o.q)).toEqual(['pixelon ajans']);
    expect(r.quickWin.map((o) => o.q)).not.toContain('pixelon ajans');
  });

  test('20. sıranın ötesi hiçbir fırsat kovasına düşmez', () => {
    const r = classifyQueries(rows);
    const all = [...r.quickWin, ...r.strikingDistance].map((o) => o.q);
    expect(all).not.toContain('sağlık turizmi ajansı');
  });

  test('veri yoksa boş sonuç döner — uydurma üretmez', () => {
    const r = classifyQueries([]);
    expect(r.quickWin).toEqual([]);
    expect(r.strikingDistance).toEqual([]);
  });

  test('fırsatlar gösterime göre azalan sıralanır', () => {
    const many = [
      { query: 'a', position: '5', impressions: '10', clicks: '1', ctr: '10' },
      { query: 'b', position: '5', impressions: '900', clicks: '1', ctr: '10' },
    ];
    expect(classifyQueries(many).quickWin.map((o) => o.q)).toEqual(['b', 'a']);
  });
});

describe('kaynak yükleyiciler', () => {
  test('GSC verisi yokken available:false ve gerekçe döner', () => {
    const r = loadGSC();
    expect(typeof r.available).toBe('boolean');
    if (!r.available) expect(r.reason).toBeTruthy();
  });

  test('SEMrush verisi yokken available:false ve gerekçe döner', () => {
    const r = loadSemrush();
    expect(typeof r.available).toBe('boolean');
    if (!r.available) expect(r.reason).toBeTruthy();
  });
});
