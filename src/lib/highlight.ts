export interface HighlightSegment {
  text: string;
  /** true ise segment aksan (lime) rengiyle basılır. */
  accent: boolean;
}

/**
 * Başlık ve rozet metinlerinde vurgulu kelimeler `*yıldız*` ile işaretlenir:
 *
 *   "Markanızı *Strateji*, *Tasarım* ve *Teknolojiyle* Büyütüyoruz."
 *
 * Bu, CMS'te düz metin alanında yazılabilen en sade işaretlemedir — editörün HTML
 * yazmasına gerek kalmaz, çıktı da her zaman güvenli metin olarak render edilir.
 *
 * Eşleşmeyen tek bir yıldız düz metin olarak korunur ("5 * 3" bozulmaz).
 */
const PATTERN = /\*([^*]+)\*/g;

export function parseHighlights(text: string): HighlightSegment[] {
  if (text.length === 0) return [];

  const segments: HighlightSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(PATTERN)) {
    const start = match.index;
    if (start > lastIndex) {
      segments.push({ text: text.slice(lastIndex, start), accent: false });
    }
    segments.push({ text: match[1] as string, accent: true });
    lastIndex = start + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), accent: false });
  }

  return segments;
}

/** Metinde vurgu işaretlemesi var mı? */
export function hasHighlight(text: string): boolean {
  return new RegExp(PATTERN.source).test(text);
}

/** İşaretleri kaldırır — `<title>`, `alt` gibi düz metin gereken yerlerde kullanılır. */
export function stripHighlights(text: string): string {
  return text.replace(PATTERN, '$1');
}
