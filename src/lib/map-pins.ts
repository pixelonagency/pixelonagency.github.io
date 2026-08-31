/**
 * Dünya haritası pin konumlandırma.
 *
 * `src/assets/images/worldmap-dotted.webp` ARTIK ÜRETİLMİŞ BİR GÖRSEL DEĞİL —
 * Natural Earth ülke sınırlarından bizim çizdiğimiz bir eşdikdörtgen haritadır
 * (üretici script: seo yerine scratchpad'deki buildmap.py, sabitler burayla aynı).
 * Projeksiyon bizim kontrolümüzde olduğu için pin konumu tahmin değil tam hesaptır.
 *
 * Önceki sürüm yapay zekâ ile üretilmiş bir haritaydı ve kalibrasyonu üç noktaya
 * elle oturtulmuştu; bölgesel çarpıklık yüzünden Türkiye pini karaya oturmuyordu.
 * Bu yüzden harita gerçek veriden yeniden üretildi.
 *
 * Çerçeve: boylam -180..180, enlem +84..-58 (Antarktika kırpılı).
 * DEĞİŞTİRİLİRSE buildmap.py ile birlikte değiştirilmelidir.
 */
const MAP_WIDTH = 2400;
const MAP_HEIGHT = 947;
const PX_PER_DEGREE = MAP_WIDTH / 360;
const LAT_TOP = 84;

export interface Coords {
  /** Enlem, kuzey pozitif. */
  lat: number;
  /** Boylam, doğu pozitif. */
  lon: number;
}

export interface PinPosition {
  /** Soldan yüzde. */
  left: number;
  /** Üstten yüzde. */
  top: number;
}

/** Enlem/boylamı haritanın yüzde konumuna çevirir. */
export function projectPin({ lat, lon }: Coords): PinPosition {
  const x = (lon + 180) * PX_PER_DEGREE;
  const y = (LAT_TOP - lat) * PX_PER_DEGREE;
  return {
    left: round(clampPercent((x / MAP_WIDTH) * 100)),
    top: round(clampPercent((y / MAP_HEIGHT) * 100)),
  };
}

interface CountryLike {
  label: string;
  lat?: number | undefined;
  lon?: number | undefined;
  highlighted?: boolean | undefined;
}

export interface PlacedPin extends PinPosition {
  label: string;
  highlighted: boolean;
  /** Sıralı animasyonda kaçıncı sırada belireceği. */
  order: number;
}

/**
 * Koordinatı olan ülkeleri pine çevirir. Koordinatsız ülkeler sessizce atlanır —
 * çip listesinde görünmeye devam ederler. Böylece koordinat alanı opsiyonel
 * kalır ve eksik veri sayfayı kırmaz.
 */
export function placePins(countries: readonly CountryLike[]): PlacedPin[] {
  return countries
    .filter((c): c is CountryLike & Coords => isFiniteNumber(c.lat) && isFiniteNumber(c.lon))
    .map((c, index) => ({
      label: c.label,
      highlighted: c.highlighted === true,
      order: index,
      ...projectPin({ lat: c.lat, lon: c.lon }),
    }));
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
