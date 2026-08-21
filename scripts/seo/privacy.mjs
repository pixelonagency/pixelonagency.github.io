/**
 * SEO gizlilik katmanı.
 *
 * Repo PUBLIC. Bu dosya, hangi bilginin git'e girip hangisinin makinede kalacağını
 * tek noktadan tanımlar. Kural tek cümle: **rakip bir insanın işine yarayacak her şey
 * private'tır.** Toplam/anonim metrik public kalabilir.
 *
 * PUBLIC (commit edilir)          PRIVATE (gitignore, makinede kalır)
 * ------------------------        -----------------------------------
 * sistem kodu, scriptler          Search Console ham CSV/JSON
 * çalışma prensipleri             query bazlı sonuçlar
 * boş şablonlar                   URL + keyword + position kombinasyonları
 * toplam/anonim metrikler         competitor keyword gap detayları
 * hassas olmayan operasyon durumu backlink prospect listeleri
 *                                 conversion / lead verileri
 *                                 detaylı fırsat listeleri
 */

/** Public `SEO_STATE.json` içinde ASLA bulunmayacak anahtarlar. */
export const PRIVATE_STATE_KEYS = [
  'currentKeywordClusters',
  'warnings',
  'opportunities',
  'gsc',
  'keywordTargets',
  'competitorGaps',
  'backlinkProspects',
  'conversions',
];

/** Gitignore'a giren yollar — dokümantasyon ve test için tek kaynak. */
export const PRIVATE_PATHS = [
  'seo/private/',
  'seo/data/gsc/',
  'seo/data/gsc-export.csv',
  'seo/data/semrush/',
  // seo/private/reports/ ayrıca listelenmez — 'seo/private/' zaten tüm alt ağacı kapsar.
];

const num = (v) => Number(String(v ?? '').replace(/[%,]/g, '')) || 0;

/**
 * State'i public ve private olarak ikiye ayırır.
 * @param {Record<string, unknown>} state
 */
export function splitState(state) {
  /** @type {Record<string, unknown>} */ const pub = {};
  /** @type {Record<string, unknown>} */ const priv = {};
  for (const [k, v] of Object.entries(state)) {
    (PRIVATE_STATE_KEYS.includes(k) ? priv : pub)[k] = v;
  }
  return { publicState: pub, privateState: priv };
}

/**
 * GSC veri setlerinden **sorgu metni içermeyen** toplam metrikler üretir.
 * Public rapora yalnızca bu çıktı girer.
 */
export function summariseGSC(datasets) {
  if (!datasets) return null;
  const pick = (re) => Object.entries(datasets).find(([n]) => re.test(n))?.[1];
  const dates = pick(/date|tarih/) ?? [];
  const queries = pick(/quer|sorgu/) ?? [];
  const pages = pick(/page|sayfa/) ?? [];

  const clicks = dates.reduce((s, r) => s + num(r.clicks), 0);
  const impressions = dates.reduce((s, r) => s + num(r.impressions), 0);
  const sorted = dates
    .map((r) => r.date)
    .filter(Boolean)
    .sort();

  return {
    clicks,
    impressions,
    ctr: impressions ? Number(((clicks / impressions) * 100).toFixed(2)) : 0,
    // Ağırlıklı ortalama konum: gösterime göre. Sorgu metni taşımaz.
    avgPosition: (() => {
      const imp = queries.reduce((s, r) => s + num(r.impressions), 0);
      if (!imp) return null;
      return Number((queries.reduce((s, r) => s + num(r.position) * num(r.impressions), 0) / imp).toFixed(1));
    })(),
    queryCount: queries.length,
    pageCount: pages.length,
    days: dates.length,
    rangeStart: sorted[0] ?? null,
    rangeEnd: sorted[sorted.length - 1] ?? null,
  };
}

/** Fırsat listelerini sayıya indirger — metin sızmaz. */
export function countOpportunities(opportunities) {
  if (!opportunities) return null;
  return {
    quickWin: opportunities.quickWin.length,
    strikingDistance: opportunities.strikingDistance.length,
    ctrOpportunity: opportunities.ctrOpportunity.length,
    highPriority: opportunities.quickWin.length + opportunities.strikingDistance.length,
  };
}

/**
 * Son savunma hattı: public metin içinde yasaklı dizelerden biri geçiyorsa fırlatır.
 * Sessiz sızıntı yerine gürültülü çökme tercih edilir.
 * @param {string} text @param {string[]} forbidden
 */
export function assertPublicSafe(text, forbidden) {
  const hay = text.toLowerCase();
  const hits = [...new Set(forbidden.filter((s) => s && s.trim().length >= 4 && hay.includes(s.toLowerCase())))];
  if (hits.length) {
    throw new Error(
      `GİZLİLİK İHLALİ: public rapora ${hits.length} hassas dize sızdı — ${hits
        .slice(0, 3)
        .map((h) => JSON.stringify(h))
        .join(', ')}`,
    );
  }
  return true;
}
