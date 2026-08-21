/**
 * Gizlilik katmanı testleri.
 *
 * Repo public olduğu için buradaki her test bir güvenlik testidir: amaç, sorgu metni /
 * sıralama / rakip istihbaratının public çıktıya sızmadığını kanıtlamak. `assertPublicSafe`
 * son savunma hattı — sessiz sızıntı yerine build'i çökertmesi beklenir.
 */
import { describe, expect, test } from 'bun:test';
import {
  MUST_NOT_BE_TRACKED,
  PRIVATE_PATHS,
  PRIVATE_STATE_KEYS,
  assertPublicSafe,
  countOpportunities,
  splitState,
  summariseGSC,
} from './privacy.mjs';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

describe('splitState', () => {
  const state = {
    mode: 'APPROVAL_REQUIRED',
    lastRun: '2026-08-22T00:00:00Z',
    currentKeywordClusters: ['ornek-kume-a', 'ornek-kume-b'],
    warnings: ['Ticari sorgular için landing page yok'],
    technicalHealth: { P0: 0 },
  };

  test('hassas anahtarları public state dışına taşır', () => {
    const { publicState } = splitState(state);
    for (const k of PRIVATE_STATE_KEYS) expect(publicState).not.toHaveProperty(k);
    expect(publicState.mode).toBe('APPROVAL_REQUIRED');
    expect(publicState.technicalHealth).toEqual({ P0: 0 });
  });

  test('hassas anahtarları private state içinde korur — veri kaybolmaz', () => {
    const { privateState } = splitState(state);
    expect(privateState.currentKeywordClusters).toEqual(['ornek-kume-a', 'ornek-kume-b']);
    expect(privateState.warnings).toHaveLength(1);
  });

  test('iki parça birleşince orijinal state geri gelir', () => {
    const { publicState, privateState } = splitState(state);
    expect({ ...publicState, ...privateState }).toEqual(state);
  });
});

describe('summariseGSC', () => {
  const datasets = {
    dates: [
      { date: '2026-08-01', clicks: '5', impressions: '300' },
      { date: '2026-08-02', clicks: '7', impressions: '351' },
    ],
    queries: [
      { query: 'ornek sorgu bir', clicks: '2', impressions: '400', position: '10' },
      { query: 'ornek sorgu iki', clicks: '10', impressions: '100', position: '20' },
    ],
    pages: [{ page: 'https://pixelon.com.tr/', clicks: '12', impressions: '651' }],
  };

  test('toplam tıklama, gösterim ve CTR hesaplar', () => {
    const s = summariseGSC(datasets)!;
    expect(s.clicks).toBe(12);
    expect(s.impressions).toBe(651);
    expect(s.ctr).toBe(1.84);
  });

  test('ortalama konumu gösterime göre ağırlıklandırır', () => {
    expect(summariseGSC(datasets)!.avgPosition).toBe(12);
  });

  test('sayım ve tarih aralığı verir', () => {
    const s = summariseGSC(datasets)!;
    expect(s).toMatchObject({ queryCount: 2, pageCount: 1, days: 2, rangeStart: '2026-08-01', rangeEnd: '2026-08-02' });
  });

  test('ÇIKTIDA HİÇBİR SORGU METNİ YA DA URL BULUNMAZ', () => {
    const json = JSON.stringify(summariseGSC(datasets));
    expect(json).not.toContain('ornek sorgu');
    expect(json).not.toContain('pixelon.com.tr');
  });

  test('veri yoksa null döner — sıfır uydurmaz', () => {
    expect(summariseGSC(null)).toBeNull();
    expect(summariseGSC({})!.impressions).toBe(0);
  });
});

describe('countOpportunities', () => {
  test('listeleri sayıya indirger, metni atar', () => {
    const c = countOpportunities({
      quickWin: [{ q: 'ornek sorgu bir' }, { q: 'x' }],
      strikingDistance: [{ q: 'ornek sorgu iki' }],
      ctrOpportunity: [],
    });
    expect(c).toEqual({ quickWin: 2, strikingDistance: 1, ctrOpportunity: 0, highPriority: 3 });
    expect(JSON.stringify(c)).not.toContain('ornek sorgu');
  });
});

describe('assertPublicSafe', () => {
  test('yasaklı dize geçerse fırlatır', () => {
    expect(() => assertPublicSafe('Rapor: ornek sorgu bir — pos 6', ['ornek sorgu bir'])).toThrow(/GİZLİLİK İHLALİ/);
  });

  test('büyük/küçük harf farkını yakalar', () => {
    expect(() => assertPublicSafe('ORNEK SORGU IKI', ['ornek sorgu iki'])).toThrow(/GİZLİLİK İHLALİ/);
  });

  test('temiz metinde sessizce geçer', () => {
    expect(assertPublicSafe('Organic clicks: 12\nImpressions: 651', ['ornek sorgu'])).toBe(true);
  });

  test('marka adı listeye alınmadığı sürece rapor başlığında geçebilir', () => {
    // "pixelon" alan adında ve her rapor başlığında geçiyor; forbidden listesine
    // marka sorguları bilerek konmaz, yoksa guard her koşuda kendi başlığında takılır.
    expect(assertPublicSafe('# PIXELON SEO — DAILY SUMMARY', ['ornek sorgu bir'])).toBe(true);
  });

  test('çok kısa dizeleri yok sayar — yanlış pozitif üretmez', () => {
    expect(assertPublicSafe('CTR: 1.84%', ['tr', 'a', ''])).toBe(true);
  });
});

describe('.gitignore sözleşmesi', () => {
  const ignore = readFileSync('.gitignore', 'utf8');
  for (const p of PRIVATE_PATHS) {
    test(`${p} gitignore'da tanımlı`, () => {
      expect(ignore).toContain(p.replace(/\/$/, ''));
    });
  }
});

describe('git takip sözleşmesi', () => {
  // `git rm --cached` ile takipten çıkarılan hassas belgeler bir daha içeri sızmamalı.
  // Bu test, bir sonraki kişinin (ya da benim) yanlışlıkla `git add -A` yapmasına karşı kapı.
  const tracked = new Set(execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n'));

  for (const path of MUST_NOT_BE_TRACKED) {
    test(`${path} git tarafından TAKİP EDİLMİYOR`, () => {
      expect(tracked.has(path)).toBe(false);
    });
  }

  test('takip edilen hiçbir dosya seo/private/ altında değil', () => {
    expect([...tracked].filter((f) => f.startsWith('seo/private/'))).toEqual([]);
  });

  test('takip edilen hiçbir GSC ham veri dosyası yok', () => {
    expect([...tracked].filter((f) => f.startsWith('seo/data/gsc'))).toEqual([]);
  });

  test('public dosyalar private strateji belgelerinin adını açık etmiyor', () => {
    const leaky = ['SEO_KEYWORD_MAP', 'SEO_CONTENT_ROADMAP', 'SEO_OFFSITE_ROADMAP', 'COMPETITORS.md'];
    const offenders: string[] = [];
    for (const f of tracked) {
      if (!f.endsWith('.md') || f.startsWith('seo/private/')) continue;
      const text = readFileSync(f, 'utf8');
      if (leaky.some((n) => text.includes(n))) offenders.push(f);
    }
    expect(offenders).toEqual([]);
  });
});
