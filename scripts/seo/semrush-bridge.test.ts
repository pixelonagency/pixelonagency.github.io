/**
 * SEMrush köprüsü testleri.
 *
 * En kritik iki davranış:
 *   1. Paketin Pixelon'ın MEVCUT performansı için YETKİLİ OLMADIĞINI açıkça taşıması.
 *      Veri kaynağı hiyerarşisi bozulursa rapor sessizce yanlış olur.
 *   2. Boş SEMrush alanının 0 DEĞİL null olması. Sıfır "ölçüldü ve sıfır" demektir;
 *      null "ölçülmedi" demektir. İkisini karıştırmak fırsat listesini bozar.
 */
import { describe, expect, test } from 'bun:test';
import { buildBundle, normalizeDomain, normalizeKeywords, normalizeSerp, parseSemrushCsv } from './semrush-bridge.mjs';

const KW_CSV = `Keyword;Search Volume;CPC;Competition;Keyword Difficulty Index;Intent
ornek kelime;2400;1.54;0.26;13;1
bos kelime;30;0;0.1;0;`;

describe('parseSemrushCsv', () => {
  test('noktalı virgüllü başlıkları alanlara çevirir', () => {
    const rows = parseSemrushCsv(KW_CSV);
    expect(rows).toHaveLength(2);
    expect(rows[0]['Search Volume']).toBe('2400');
  });

  test('boş girdi çökmez', () => {
    expect(parseSemrushCsv('')).toEqual([]);
    expect(parseSemrushCsv(undefined)).toEqual([]);
  });
});

describe('normalizeKeywords', () => {
  const out = normalizeKeywords(parseSemrushCsv(KW_CSV), 'tr', 'T0');

  test('sayısal alanları çevirir ve kaynağı damgalar', () => {
    expect(out[0]).toMatchObject({
      keyword: 'ornek kelime',
      volume: 2400,
      difficulty: 13,
      cpc: 1.54,
      source: 'semrush',
      database: 'tr',
      fetchedAt: 'T0',
    });
  });

  test('intent kodunu etikete çevirir', () => {
    expect(out[0].intent).toBe('informational');
  });

  test('boş intent null döner — uydurma etiket yok', () => {
    expect(out[1].intent).toBeNull();
  });

  test('gerçekten sıfır olan hacim 0 kalır, null olmaz', () => {
    expect(out[1].volume).toBe(30);
    expect(out[1].difficulty).toBe(0);
  });
});

describe('normalizeDomain', () => {
  test('backlink ve organik metrikleri tek modelde birleştirir', () => {
    const d = normalizeDomain(
      'ornek.com',
      { ascore: '14', total: '1341', domains_num: '139', follows_num: '1237', nofollows_num: '104' },
      { 'Organic Keywords': '22', 'Organic Traffic': '8' },
      'T0',
    );
    expect(d).toMatchObject({
      domain: 'ornek.com',
      authorityScore: 14,
      backlinks: 1341,
      referringDomains: 139,
      organicKeywords: 22,
      organicTraffic: 8,
      source: 'semrush',
    });
  });

  test('veri yoksa null döner — sıfır UYDURMAZ', () => {
    const d = normalizeDomain('yok.com', null, null, 'T0');
    expect(d.authorityScore).toBeNull();
    expect(d.organicTraffic).toBeNull();
  });
});

describe('normalizeSerp', () => {
  const rows = [
    { Domain: 'a.com', Url: 'https://a.com/' },
    { Domain: 'b.com', Url: 'https://b.com/kurumsal-web-tasarim' },
  ];
  const out = normalizeSerp('ornek kelime', rows, 'T0');

  test('sırayı pozisyona çevirir', () => {
    expect(out.map((r) => r.position)).toEqual([1, 2]);
  });

  test('ana sayfa ile özel landing page ayrımını işaretler', () => {
    expect(out[0].hasDedicatedPage).toBe(false);
    expect(out[1].hasDedicatedPage).toBe(true);
  });

  test('bozuk URL satırı düşürmez', () => {
    expect(normalizeSerp('k', [{ Domain: 'c.com', Url: 'bozuk' }], 'T0')[0].hasDedicatedPage).toBe(false);
  });
});

describe('buildBundle', () => {
  const bundle = buildBundle(
    {
      keywords: { tr: KW_CSV },
      domains: [{ domain: 'ornek.com', backlinksCsv: 'ascore;total\n5;100', ranksCsv: '' }],
      serp: { 'ornek kelime': 'Domain;Url\na.com;https://a.com/' },
    },
    'T0',
  );

  test('üç veri kümesini de normalize eder', () => {
    expect(bundle.counts).toEqual({ keywords: 2, domains: 1, serpRows: 1 });
  });

  test('PIXELON MEVCUT PERFORMANSI İÇİN YETKİLİ OLMADIĞINI taşır', () => {
    expect(bundle.notAuthoritativeFor).toContain('pixelon-current-performance');
    expect(bundle.authoritativeFor).toContain('keyword-research');
  });

  test('boş girdiyle çökmez, sayıları sıfırlar', () => {
    expect(buildBundle({}, 'T0').counts).toEqual({ keywords: 0, domains: 0, serpRows: 0 });
  });
});
