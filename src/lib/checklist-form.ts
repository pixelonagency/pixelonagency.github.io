import type { ChecklistFormInput } from './forms';

/**
 * Where the checklist sign-up form posts: a MailerLite embedded form.
 *
 * THE single config value for the checklist form: the form's subscribe URL from
 * MailerLite (Forms › Embedded form › HTML code, the `action` of the <form>).
 * The embedded form endpoint takes no API key, so nothing secret reaches the browser.
 *
 * Emptying it puts the form into its "henüz aktif değil" state on the dev server, and a
 * checklist marked `yayinda` then stops the production build (see `isChecklistBuilt`).
 */
export const CHECKLIST_FORM_ENDPOINT = 'https://assets.mailerlite.com/jsonp/2695085/forms/200745219577087214/subscribe';

/**
 * Version of the consent notice shown on the form, stored with every sign-up as proof of
 * what the reader agreed to. Change it whenever the checkbox texts or the notice change,
 * and keep the old text (source: rehber/saglik/kvkk-checklist-formu.md, `metin_surumu`).
 */
export const CHECKLIST_CONSENT_VERSION = 'kvkk-checklist-1-v1';

/**
 * Form texts approved together with `CHECKLIST_CONSENT_VERSION`; they change together.
 * Checkbox 1 is required, checkbox 2 (marketing) is optional and never pre-checked.
 */
export const CHECKLIST_CONSENT_TEXTS = {
  kvkk: { link: 'Aydınlatma Metni', after: "'ni okudum." },
  marketing:
    "Pixelon'un yeni rehber ve checklistleri, hizmetleri ve ücretsiz dijital analiz davetleri hakkında bana e-posta gönderilmesine ve bu amaçla ad soyad, e-posta, unvan/uzmanlık ve şehir bilgilerimin işlenmesine açık rıza veriyorum. Onayımı istediğim zaman geri çekebilirim.",
  marketingNote: 'Bu kutuyu işaretlemeseniz de checklist e-posta adresinize gönderilir.',
} as const;

/** Shown after MailerLite confirms the sign-up. */
export const CHECKLIST_SUCCESS_TEXT =
  'Checklist e-posta adresinize gönderildi. Birkaç dakika içinde gelen kutunuzu, gelmezse spam klasörünü kontrol edin.';

const MAILERLITE_SUBSCRIBE = /^https:\/\/assets\.mailerlite\.com\/jsonp\/\d+\/forms\/\d+\/subscribe$/;

/**
 * Returns the endpoint when it is empty or a MailerLite subscribe URL; throws otherwise,
 * so a typo cannot send readers' personal data to an unintended address.
 */
export function checklistFormEndpoint(value: string): string {
  if (value === '' || MAILERLITE_SUBSCRIBE.test(value)) return value;
  throw new Error(
    `CHECKLIST_FORM_ENDPOINT is not a MailerLite embedded form subscribe URL: "${value}". ` +
      'Expected https://assets.mailerlite.com/jsonp/<account id>/forms/<form id>/subscribe',
  );
}

/**
 * Where the sign-up came from: the page path, plus `utm_source` when the link carried one.
 * Other query parameters (click ids, other UTM keys) are dropped on purpose.
 */
export function checklistSource(pathname: string, search: string): string {
  const utmSource = new URLSearchParams(search).get('utm_source');
  return utmSource ? `${pathname}?utm_source=${encodeURIComponent(utmSource)}` : pathname;
}

interface SubmissionContext {
  /** Moment of submission; stored as the consent timestamp. */
  submittedAt: Date;
  /** See `checklistSource`. */
  source: string;
}

/**
 * Form values → MailerLite embedded form fields.
 *
 * `name`, `email` and `city` are MailerLite default fields; `unvan`, `kvkk_onay`,
 * `pazarlama_izni`, `onay_tarihi`, `metin_surumu` and `kaynak` are custom fields that
 * exist in the account with exactly these keys. Marketing consent is sent as `evet` or
 * `hayir` every time, so the record says which one the reader chose.
 */
export function mailerLitePayload(input: ChecklistFormInput, context: SubmissionContext): [string, string][] {
  if (!input.kvkk) throw new Error('A checklist sign-up cannot be sent without the KVKK notice confirmation.');
  return [
    ['fields[name]', input.name.trim()],
    ['fields[email]', input.email.trim()],
    ['fields[unvan]', input.title.trim()],
    ['fields[city]', (input.city ?? '').trim()],
    ['fields[kvkk_onay]', 'evet'],
    ['fields[pazarlama_izni]', input.marketing ? 'evet' : 'hayir'],
    ['fields[onay_tarihi]', context.submittedAt.toISOString()],
    ['fields[metin_surumu]', CHECKLIST_CONSENT_VERSION],
    ['fields[kaynak]', context.source],
    // The two control fields MailerLite's own embed code sends with every submission.
    ['ml-submit', '1'],
    ['anticsrf', 'true'],
  ];
}

/** Request body: `application/x-www-form-urlencoded`, as MailerLite's embed posts it. */
export const mailerLiteBody = (payload: [string, string][]): URLSearchParams => new URLSearchParams(payload);
