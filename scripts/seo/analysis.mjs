/**
 * Haftalık/aylık kontrol kayıt defteri.
 *
 * Her kontrol üç durumdan biriyle döner:
 *   OK        → hesaplandı, sorun yok
 *   ATTENTION → hesaplandı, insan bakmalı
 *   UNKNOWN   → veri kaynağı yok. Sayı UYDURULMAZ, engelin adı yazılır.
 *
 * UNKNOWN bir kusur değil, sistemin en değerli özelliği: hangi kararın hangi veriyle
 * bloklu olduğunu her koşuda tekrar söyler. Bir kaynak açıldığı an kontrol kendiliğinden
 * canlanır; kod değişmez.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseCsv } from './sources.mjs';
import { pctChange } from './periods.mjs';

const num = (v) => Number(String(v ?? '').replace(/[%,]/g, '')) || 0;
const BRAND = /pixelon/i;

/** Bir karşılaştırma penceresini diskten okur. Yoksa null — boş nesne değil. */
export function loadWindow(baseDir, name) {
  const dir = join(baseDir, name);
  const read = (f) => (existsSync(join(dir, f)) ? parseCsv(readFileSync(join(dir, f), 'utf8')) : null);
  const queries = read('queries.csv');
  if (!queries) return null;
  return { queries, pages: read('pages.csv') ?? [], dates: read('dates.csv') ?? [] };
}

export function aggregate(dateRows) {
  const clicks = (dateRows ?? []).reduce((s, r) => s + num(r.clicks), 0);
  const impressions = (dateRows ?? []).reduce((s, r) => s + num(r.impressions), 0);
  return { clicks, impressions, ctr: impressions ? Number(((clicks / impressions) * 100).toFixed(2)) : 0 };
}

/** Gösterime göre ağırlıklı ortalama konum. Gösterim yoksa null. */
export function weightedPosition(rows) {
  const imp = (rows ?? []).reduce((s, r) => s + num(r.impressions), 0);
  if (!imp) return null;
  return Number(((rows ?? []).reduce((s, r) => s + num(r.position) * num(r.impressions), 0) / imp).toFixed(1));
}

export function comparePeriods(cur, prev) {
  const a = aggregate(cur?.dates);
  const b = aggregate(prev?.dates);
  const pa = weightedPosition(cur?.queries);
  const pb = weightedPosition(prev?.queries);
  return {
    clicks: { current: a.clicks, previous: b.clicks, pct: pctChange(a.clicks, b.clicks) },
    impressions: { current: a.impressions, previous: b.impressions, pct: pctChange(a.impressions, b.impressions) },
    ctr: { current: a.ctr, previous: b.ctr, pct: pctChange(a.ctr, b.ctr) },
    position: { current: pa, previous: pb, delta: pa !== null && pb !== null ? Number((pa - pb).toFixed(1)) : null },
  };
}

export function splitBrand(queries) {
  const brand = [],
    nonBrand = [];
  for (const r of queries ?? []) (BRAND.test(r.query ?? '') ? brand : nonBrand).push(r);
  return { brand, nonBrand };
}

/** Konum kovaları — sadece marka dışı sorgular. */
export function positionBuckets(queries) {
  const { nonBrand } = splitBrand(queries);
  const pick = (lo, hi) =>
    nonBrand
      .filter((r) => num(r.position) >= lo && num(r.position) <= hi && num(r.impressions) > 0)
      .sort((x, y) => num(y.impressions) - num(x.impressions));
  return {
    quickWin: pick(4, 10),
    strikingDistance: pick(10.001, 20),
    ctrOpportunity: nonBrand
      .filter((r) => num(r.impressions) >= 50 && num(r.ctr) < 2)
      .sort((x, y) => num(y.impressions) - num(x.impressions)),
  };
}

/** Gösterimi düşen sayfalar. İki pencere de gerekli; biri yoksa null. */
export function contentDecay(curPages, prevPages, minDropPct = 20) {
  if (!curPages || !prevPages) return null;
  const prev = new Map(prevPages.map((r) => [r.page, r]));
  const out = [];
  for (const r of curPages) {
    const p = prev.get(r.page);
    if (!p) continue;
    const before = num(p.impressions);
    const after = num(r.impressions);
    if (before < 5) continue; // gürültü eşiği
    const pct = pctChange(after, before);
    if (pct !== null && pct <= -minDropPct) out.push({ page: r.page, before, after, pct });
  }
  return out.sort((a, b) => a.pct - b.pct);
}

/** URL desenine göre hizmet kümesi tanımları — yalnızca clusterPerformance varsayılanı. */
const CLUSTERS = [
  { id: 'web-tasarim', match: /web-tasarim|web-sitesi-yaptir|web-design|kurumsal-web|landing-page/ },
  { id: 'sosyal-medya', match: /sosyal-medya|social-media|instagram|reels/ },
  { id: 'saglik-turizmi', match: /saglik-turizmi|health-tourism|saglik-markalari|hasta/ },
  { id: 'dijital-reklam', match: /dijital-reklam|digital-advertising|google-ads|meta-reklam|roas/ },
  { id: 'seo-icerik', match: /seo-|seo\/|icerik-pazarlamasi|content-marketing|blog-yazmak/ },
  { id: 'marka-kimlik', match: /marka-|brand-|kurumsal-kimlik/ },
  { id: 'crm', match: /crm|dijital-donusum|digital-transformation/ },
];

export function clusterPerformance(pages, clusters = CLUSTERS) {
  return clusters.map((c) => {
    const rows = (pages ?? []).filter((r) => c.match.test(r.page ?? ''));
    return {
      id: c.id,
      pages: rows.length,
      clicks: rows.reduce((s, r) => s + num(r.clicks), 0),
      impressions: rows.reduce((s, r) => s + num(r.impressions), 0),
      position: weightedPosition(rows),
    };
  });
}

/** 90 günlük eğri — aylık trend için üçe bölünür. */
export function trendThirds(dateRows) {
  const rows = (dateRows ?? []).slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
  if (rows.length < 3) return null;
  const size = Math.floor(rows.length / 3);
  return [rows.slice(0, size), rows.slice(size, size * 2), rows.slice(size * 2)].map(aggregate);
}

/**
 * @typedef {{ id: string, title: string, status: 'OK'|'ATTENTION'|'UNKNOWN',
 *             value?: any, detail?: any, reason?: string }} Check
 */

/** @returns {Check} */
const unknown = (id, title, reason) => ({ id, title, status: 'UNKNOWN', reason });
/** @returns {Check} */
const ok = (id, title, value, detail = null) => ({ id, title, status: 'OK', value, detail });
/** @returns {Check} */
const attention = (id, title, value, detail = null) => ({ id, title, status: 'ATTENTION', value, detail });

/**
 * Kontrolleri çalıştırır.
 * @param {'weekly'|'monthly'} mode
 * @returns {Check[]}
 * @param {object} ctx { w7, w7prev, w28, w28prev, d90, audit, regression, readyCount, watch, hasSemrush }
 */
export function runChecks(mode, ctx) {
  /** @type {Check[]} */
  const checks = [];
  const cur = mode === 'weekly' ? ctx.w7 : ctx.w28;
  const prev = mode === 'weekly' ? ctx.w7prev : ctx.w28prev;
  const label = mode === 'weekly' ? 'son 7 gün / önceki 7 gün' : 'son 28 gün / önceki 28 gün';

  if (cur && prev) {
    const cmp = comparePeriods(cur, prev);
    const worse = cmp.clicks.pct !== null && cmp.clicks.pct < -20;
    checks.push((worse ? attention : ok)('period-comparison', `Dönem karşılaştırması (${label})`, cmp));

    const nbCur = splitBrand(cur.queries).nonBrand;
    const nbPrev = splitBrand(prev.queries).nonBrand;
    checks.push(
      ok('non-brand', 'Marka dışı performans', {
        queries: { current: nbCur.length, previous: nbPrev.length },
        impressions: {
          current: nbCur.reduce((s, r) => s + num(r.impressions), 0),
          previous: nbPrev.reduce((s, r) => s + num(r.impressions), 0),
        },
        position: { current: weightedPosition(nbCur), previous: weightedPosition(nbPrev) },
      }),
    );

    const b = positionBuckets(cur.queries);
    checks.push(ok('pos-4-10', 'Konum 4–10 fırsatları', b.quickWin.length, b.quickWin.slice(0, 10)));
    checks.push(ok('pos-11-20', 'Konum 11–20 fırsatları', b.strikingDistance.length, b.strikingDistance.slice(0, 10)));
    checks.push(ok('ctr-opportunity', 'CTR fırsatları', b.ctrOpportunity.length, b.ctrOpportunity.slice(0, 10)));

    const decay = contentDecay(cur.pages, prev.pages);
    checks.push(
      decay === null
        ? unknown('content-decay', 'İçerik erozyonu', 'Karşılaştırma penceresi eksik')
        : (decay.length ? attention : ok)('content-decay', 'İçerik erozyonu', decay.length, decay.slice(0, 10)),
    );
  } else {
    for (const [id, title] of [
      ['period-comparison', `Dönem karşılaştırması (${label})`],
      ['non-brand', 'Marka dışı performans'],
      ['pos-4-10', 'Konum 4–10 fırsatları'],
      ['pos-11-20', 'Konum 11–20 fırsatları'],
      ['ctr-opportunity', 'CTR fırsatları'],
      ['content-decay', 'İçerik erozyonu'],
    ])
      checks.push(unknown(id, title, 'GSC karşılaştırma penceresi yok — `bun run seo:gsc` çalıştırılmalı'));
  }

  checks.push(
    ctx.watch
      ? (ctx.watch.impressions > 0 ? attention : ok)('legacy-404', 'Eski 404 URL izlemesi', ctx.watch)
      : unknown('legacy-404', 'Eski 404 URL izlemesi', 'İzleme verisi yok'),
  );

  checks.push(
    unknown('competitor-movement', 'Rakip hareketi', 'Rakip sıralama takibi yok — yalnızca yapısal tarama var'),
  );
  checks.push(
    ctx.hasSemrush
      ? ok('semrush-keyword-gap', 'Semrush keyword gap', 'veri mevcut')
      : unknown('semrush-keyword-gap', 'Semrush keyword gap', 'SEMrush dosya tabanlı dışa aktarımı yok'),
  );
  checks.push(unknown('backlink-gap', 'Backlink gap', 'Backlink API erişimi yok'));

  checks.push(
    ctx.audit
      ? (ctx.regression && (ctx.regression.P0 > 0 || ctx.regression.P1 > 0) ? attention : ok)(
          'technical-regression',
          'Teknik regresyon',
          { severity: ctx.audit.severity, regression: ctx.regression },
        )
      : unknown('technical-regression', 'Teknik regresyon', 'Denetim çıktısı okunamadı'),
  );

  checks.push(ok('approval-queue', 'Onay kuyruğu', ctx.readyCount ?? 0));

  if (cur) {
    const published = (cur.pages ?? []).filter((r) => /\/blog\//.test(r.page ?? ''));
    checks.push(
      ok('published-performance', 'Yayınlanan içerik performansı', {
        pages: published.length,
        impressions: published.reduce((s, r) => s + num(r.impressions), 0),
        clicks: published.reduce((s, r) => s + num(r.clicks), 0),
        position: weightedPosition(published),
      }),
    );
  } else {
    checks.push(unknown('published-performance', 'Yayınlanan içerik performansı', 'GSC verisi yok'));
  }

  if (mode === 'monthly') {
    const thirds = trendThirds(ctx.d90?.dates);
    checks.push(
      thirds
        ? ok('trend-90d', '90 günlük trend (üç eşit dilim)', thirds)
        : unknown('trend-90d', '90 günlük trend', '90 günlük pencere yok'),
    );
    checks.push(
      unknown(
        'baseline-comparison',
        'Baseline karşılaştırması',
        'Baseline GSC erişimi olmadan dondurulmuştu — arama metrikleri için karşılaştırma tabanı 2026-08-22',
      ),
    );
    if (cur) {
      const clusters = clusterPerformance(cur.pages);
      checks.push(ok('cluster-performance', 'Hizmet kümesi performansı', clusters));
      for (const id of ['web-tasarim', 'sosyal-medya', 'saglik-turizmi']) {
        const c = clusters.find((x) => x.id === id);
        checks.push(ok(`cluster-${id}`, `Küme: ${id}`, c));
      }
    }
    checks.push(unknown('organic-conversions', 'Organik dönüşümler', 'GA4 veri kaynağı bağlı değil'));
    checks.push(
      unknown(
        'channel-performance',
        'WhatsApp / form / arama performansı',
        'Etkileşimler GA4 event; veri kaynağı bağlı değil',
      ),
    );
    checks.push(unknown('content-roi', 'İçerik ROI', 'Dönüşüm verisi olmadan hesaplanamaz'));
    checks.push(
      unknown(
        'new-vs-refreshed',
        'Yeni vs tazelenmiş içerik',
        'Tazeleme geçmişi henüz yok — ilk tazeleme sonrası ölçülebilir',
      ),
    );
    checks.push(unknown('referring-domains', 'Referring domain sayısı', 'Backlink API erişimi yok'));
    checks.push(unknown('share-of-voice', 'Rakip share of voice', 'Rakip sıralama verisi yok'));
    checks.push(
      ctx.audit
        ? ok('technical-health', 'Teknik sağlık', { severity: ctx.audit.severity, totals: ctx.audit.totals })
        : unknown('technical-health', 'Teknik sağlık', 'Denetim çıktısı okunamadı'),
    );
    checks.push(
      ctx.geo
        ? ok('geo-aeo', 'GEO / AEO durumu', ctx.geo)
        : unknown('geo-aeo', 'GEO / AEO durumu', 'Build çıktısı okunamadı'),
    );
    checks.push(ok('reprioritization', 'Gelecek ay önceliklendirme', deriveNextPriorities(checks)));
  }

  return checks;
}

/**
 * Kontrol sonuçlarından gelecek ayın önceliklerini türetir.
 * Kural: ATTENTION olanlar önce, sonra fırsat sayısı yüksek olanlar, en sonda blokajlar.
 */
export function deriveNextPriorities(checks) {
  const priorities = [];
  for (const c of checks) {
    if (c.status === 'ATTENTION') priorities.push({ rank: 1, id: c.id, why: 'Dikkat gerektiriyor' });
  }
  for (const c of checks) {
    if (c.status === 'OK' && typeof c.value === 'number' && c.value > 0 && /pos-|ctr-/.test(c.id))
      priorities.push({ rank: 2, id: c.id, why: `${c.value} fırsat bekliyor` });
  }
  for (const c of checks) {
    if (c.status === 'UNKNOWN') priorities.push({ rank: 3, id: c.id, why: c.reason });
  }
  return priorities.sort((a, b) => a.rank - b.rank).slice(0, 12);
}

/** Kontrol özetini sayıya indirger — public rapora yalnızca bu girer. */
export function checkSummary(checks) {
  return {
    total: checks.length,
    ok: checks.filter((c) => c.status === 'OK').length,
    attention: checks.filter((c) => c.status === 'ATTENTION').length,
    unknown: checks.filter((c) => c.status === 'UNKNOWN').length,
  };
}
