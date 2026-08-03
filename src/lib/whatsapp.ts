const TR_COUNTRY_CODE = '90';

/**
 * Serbest biçimli bir telefon numarasını, ülke kodu dahil yalnızca rakamlardan
 * oluşan biçime indirger. Başında `0` olan ulusal numaralar Türkiye kabul edilir.
 */
export function normalisePhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('0')) return TR_COUNTRY_CODE + digits.slice(1);
  if (digits.length === 10) return TR_COUNTRY_CODE + digits;
  return digits;
}

/** `tel:` URI'si (E.164 biçiminde). */
export function telHref(phone: string): string {
  return `tel:+${normalisePhone(phone)}`;
}

/** Ön-dolu mesajlı wa.me bağlantısı üretir. Mesaj boşsa `text` parametresi eklenmez. */
export function buildWhatsAppUrl(phone: string, message?: string): string {
  const base = `https://wa.me/${normalisePhone(phone)}`;
  const trimmed = message?.trim();
  return trimmed ? `${base}?text=${encodeURIComponent(trimmed)}` : base;
}
