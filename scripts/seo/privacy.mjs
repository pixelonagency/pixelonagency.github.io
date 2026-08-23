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

/**
 * Public `SEO_STATE.json` içinde bulunmasına İZİN VERİLEN anahtarlar.
 *
 * Kural bilerek TERSİNE çevrildi: eskiden bir kara liste vardı ve listede
 * olmayan her yeni anahtar sessizce public tarafa düşüyordu. 23 Ağustos 2026'da
 * `seoTasks` ve `healthcareEnCluster` gibi 11 sınıflandırılmamış anahtar bu
 * yolla public state'e yazılmak üzereydi; sızıntıyı `assertPublicSafe` son anda
 * yakaladı ve daily/weekly koşuları kırıldı.
 *
 * Beyaz liste güvenli tarafa düşer: tanımadığı anahtarı public yapmaz, private
 * yapar. Yeni bir alanın public olması isteniyorsa bilinçli olarak buraya
 * eklenir — unutulduğunda kaybedilen şey görünürlüktür, gizlilik değil.
 */
export const PUBLIC_STATE_KEYS = [
  // Kimlik ve sürüm
  'version',
  'mode',
  'site',
  // Koşu muhasebesi (mutlak yol taşımaz — `scheduler` public DEĞİL)
  'lastRun',
  'lastSuccessfulRun',
  'lastGSCFetch',
  'lastSemrushFetch',
  'lastCompetitorAnalysis',
  'lastTechnicalAudit',
  'lastContentPublish',
  'lastContentRefresh',
  // Faz / görev kimlikleri — yalnız ID, içerik veya sorgu yok
  'currentPhase',
  'phasesCompleted',
  'phasesBlocked',
  'currentTask',
  'nextTaskIds',
  'completedTaskIds',
  'nextTaskIdCounter',
  'blockedTasks',
  // Toplam / anonim metrikler ve ilkeler
  'technicalHealth',
  'dataSources',
  'dataSourcePolicy',
  'visualPolicy',
  'gscSummary',
  'opportunityCounts',
  'overnight',
];

/**
 * Geriye dönük uyumluluk ve dokümantasyon için tutulan açık kara liste.
 * Beyaz liste zaten bunları dışarıda bırakır; buradaki değer, bir anahtarın
 * NEDEN private olduğunu tek yerde okunur kılmasıdır.
 */
export const PRIVATE_STATE_KEYS = [
  // Zamanlayıcı muhasebesi mutlak log yolu taşır (ev dizini dahil) — public repoya girmez.
  'scheduler',
  'currentKeywordClusters',
  'warnings',
  'opportunities',
  'gsc',
  'keywordTargets',
  'competitorGaps',
  'backlinkProspects',
  'conversions',
  // 23 Ağu 2026'da eklendi — hedef sorgu, onay kaynağı, taslak yolu ve rakip notu taşıyor.
  'seoTasks',
  'healthcareEnCluster',
  'autonomous',
  'autonomousBacklog',
  'lastAutonomousRun',
  'cutover',
  'infrastructure',
  'liveVerification',
  'measurementPolicy',
  'costPolicy',
  'dataQualityNotes',
];

/** Gitignore'a giren yollar — dokümantasyon ve test için tek kaynak. */
export const PRIVATE_PATHS = [
  'seo/private/',
  'seo/data/gsc/',
  'seo/data/gsc-export.csv',
  'seo/data/semrush/',
  // Kökte tutulmuş strateji belgeleri; asılları seo/private/strategy/ altında.
  'SEO_KEYWORD_MAP.md',
  'SEO_CONTENT_ROADMAP.md',
  'SEO_OFFSITE_ROADMAP.md',
  // seo/private/reports/ ve seo/private/strategy/ ayrıca listelenmez —
  // 'seo/private/' zaten tüm alt ağacı kapsar.
];

/**
 * Public repoda ASLA takip edilmemesi gereken yollar. `git ls-files` çıktısında
 * bunlardan biri görünürse gizlilik politikası delinmiş demektir.
 */
export const MUST_NOT_BE_TRACKED = [
  'SEO_KEYWORD_MAP.md',
  'SEO_CONTENT_ROADMAP.md',
  'SEO_OFFSITE_ROADMAP.md',
  'seo/COMPETITORS.md',
  'seo/data/competitors-raw.json',
  'seo/private/COMPETITORS.md',
  'seo/private/data/competitors-raw.json',
  'seo/private/strategy/SEO_KEYWORD_MAP.md',
  'seo/private/strategy/SEO_CONTENT_ROADMAP.md',
  'seo/private/strategy/SEO_OFFSITE_ROADMAP.md',
  'seo/reports/DAILY-2026-08-21.md',
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
    // Beyaz liste: tanınmayan anahtar private tarafa düşer, public'e SIZMAZ.
    const isPublic = PUBLIC_STATE_KEYS.includes(k) && !PRIVATE_STATE_KEYS.includes(k);
    (isPublic ? pub : priv)[k] = v;
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
