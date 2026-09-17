/**
 * Çerez diyaloglarının erişilebilirlik yaması.
 *
 * SORUN (17 Eyl 2026 denetimi): Klaro, bandı `role="dialog"` ve
 * `aria-labelledby="id-cookie-title"` ile çiziyor — ama o id'li elemanı bantta HİÇ
 * basmıyor (başlık yalnız modal şablonunda var). Ekran okuyucu adsız bir diyalog
 * duyuruyor; axe/Lighthouse bunu `aria-dialog-name` ihlali olarak raporluyor ve
 * erişilebilirlik puanını 100'den 97'ye düşürüyor.
 *
 * ÇÖZÜM: Klaro çizdikten sonra, adı gerçekten eksik olan diyaloglara `aria-label`
 * veriyoruz. Etiket metni UYDURULMAZ — Klaro yapılandırmasındaki başlığın kendisidir,
 * böylece görsel başlıkla sesli okunan ad ayrışamaz.
 *
 * Klaro'nun kendi davranışına dokunulmaz: yalnız eksik öznitelik tamamlanır.
 * Yukarı akış bir gün başlığı basmaya başlarsa `zatenAdlandirilmis()` bunu görür
 * ve yama sessizce devre dışı kalır.
 */

import { buildKlaroConfig } from './consent-config';
import { DEFAULT_LOCALE, isLocale, type Locale } from './i18n';

/** Klaro çeviri bloğunun bu yama için gereken en dar biçimi. */
interface ConsentTranslations {
  translations?: Partial<Record<Locale, { consentNotice?: { title?: string } }>>;
}

/**
 * Diyaloga verilecek erişilebilir ad — yapılandırmadaki banner başlığı.
 * Bilinmeyen dil varsayılana düşer; bu fonksiyon hiçbir durumda boş dönmez.
 */
export function consentDialogLabel(lang: Locale): string {
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const config = buildKlaroConfig(locale) as ConsentTranslations;
  const title = config.translations?.[locale]?.consentNotice?.title;
  return title && title.trim() !== '' ? title : consentDialogLabel(DEFAULT_LOCALE);
}

/** Diyalogun halihazırda geçerli bir erişilebilir adı var mı? */
function zatenAdlandirilmis(el: Element): boolean {
  if ((el.getAttribute('aria-label') ?? '').trim() !== '') return true;

  const labelledby = el.getAttribute('aria-labelledby');
  if (!labelledby) return false;

  /* `aria-labelledby` birden çok id taşıyabilir; en az biri DOLU bir elemana
     çözülüyorsa ad geçerlidir. Klaro'nun bantta ürettiği tek id hiçbir elemana
     çözülmüyor — hatanın tam noktası burası. */
  return labelledby
    .split(/\s+/)
    .filter(Boolean)
    .some((id) => (el.ownerDocument.getElementById(id)?.textContent ?? '').trim() !== '');
}

/**
 * Eksik adı olan çerez diyaloglarını etiketler ve DOM değiştikçe etiketlemeye devam eder.
 *
 * Klaro bandı asenkron çizdiği ve modal her açılışta yeniden oluşturulduğu için tek
 * seferlik bir düzeltme yetmez; gözlemci kalıcıdır.
 */
export function labelConsentDialogs(root: Document, lang: Locale): void {
  const label = consentDialogLabel(lang);

  const apply = (): void => {
    for (const dialog of root.querySelectorAll('#klaro [role="dialog"], #klaro [role="alertdialog"]')) {
      if (zatenAdlandirilmis(dialog)) continue;
      dialog.setAttribute('aria-label', label);
    }
  };

  apply();

  const host = root.getElementById('klaro') ?? root.body;
  if (!host) return;
  new MutationObserver(apply).observe(host, { childList: true, subtree: true });
}
