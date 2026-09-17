import { describe, expect, test } from 'bun:test';

import { consentDialogLabel } from './consent-a11y';
import { buildKlaroConfig } from './consent-config';
import { LOCALES } from './i18n';

/**
 * Çerez bandının erişilebilir adı.
 *
 * 17 Eyl 2026 denetimi: Klaro bandı `role="dialog"` ve
 * `aria-labelledby="id-cookie-title"` basıyor ama O ID'Lİ ELEMANI HİÇ ÇİZMİYOR —
 * başlık yalnız modalda render ediliyor, bantta değil. Sonuç: ekran okuyucuda
 * adsız diyalog; Lighthouse erişilebilirlik 100 yerine 97.
 *
 * Etiket metni uydurulmaz — Klaro yapılandırmasındaki başlığın ta kendisidir,
 * yani görsel başlıkla sesli okunan ad ayrışamaz.
 */

describe('consentDialogLabel', () => {
  test('Türkçe etiket yapılandırmadaki başlıkla birebir aynıdır', () => {
    const config = buildKlaroConfig('tr') as {
      translations: Record<string, { consentNotice: { title: string } }>;
    };
    expect(consentDialogLabel('tr')).toBe(config.translations.tr!.consentNotice.title);
  });

  test('her bilinen dil için boş olmayan bir etiket üretir', () => {
    for (const locale of LOCALES) {
      const label = consentDialogLabel(locale);
      expect({ locale, bos: label.trim() === '' }).toEqual({ locale, bos: false });
    }
  });

  test('diller farklı etiket döner — sabit bir metne düşmez', () => {
    expect(consentDialogLabel('tr')).not.toBe(consentDialogLabel('en'));
  });

  test('bilinmeyen dil varsayılana düşer, patlamaz', () => {
    expect(consentDialogLabel('de' as never)).toBe(consentDialogLabel('tr'));
  });
});
