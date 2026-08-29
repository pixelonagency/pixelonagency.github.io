/**
 * Vaka sayfasındaki "ölçülen sonuç" rakamlarının sayaç animasyonu için ayrıştırıcı.
 *
 * Rakam HTML'de ZATEN son hâliyle basılıdır; animasyon yalnızca üstüne biner. Bu yüzden
 * ayrıştırıcının işi, ekrandaki dizeden sayısal çekirdeği ve onu saran metni çıkarmak:
 *   "%25"   → önek "%",  hedef 25
 *   "9,2M"  → sonek "M", hedef 9.2
 *   "2.886" → hedef 2886
 *
 * Biçim DİLE BAĞLI: Türkçe'de binlik nokta / ondalık virgül, İngilizce'de tersi. Sabit
 * Türkçe ayrıştırma, İngilizce sayfada "9.2M" değerini 92'ye çeviriyordu.
 */
import type { Locale } from './i18n';

export interface ParsedStat {
  /** Sayıdan ÖNCE gelen metin — Türkçe'de "%25"in yüzde işareti. */
  prefix: string;
  /** Sayıdan SONRA gelen metin — "M", "%", "+" gibi. */
  suffix: string;
  target: number;
  /** Ondalık basamak sayısı; sayaç ara değerleri aynı hassasiyetle basar. */
  decimals: number;
}

export function parseStatValue(raw: string, locale: Locale): ParsedStat | null {
  const match = raw.match(/[\d.,]+/);
  if (!match || match.index === undefined) return null;

  const decimalSep = locale === 'tr' ? ',' : '.';
  const groupSep = locale === 'tr' ? '.' : ',';

  const digits = match[0];
  const normalised = digits.split(groupSep).join('').replace(decimalSep, '.');
  const target = Number.parseFloat(normalised);
  if (!Number.isFinite(target)) return null;

  return {
    prefix: raw.slice(0, match.index),
    suffix: raw.slice(match.index + digits.length),
    target,
    /* Ondalık ayırıcı geçiyorsa tek basamak gösterilir ("9,2M" → "9,2M" kalır). */
    decimals: digits.includes(decimalSep) ? 1 : 0,
  };
}
