import type { ChecklistFormInput } from './forms';

/**
 * Where the checklist sign-up form posts: a MailerLite embedded form.
 *
 * THE single config value for the checklist form. Paste the form's subscribe URL from
 * MailerLite (Forms › Embedded form › HTML code, the `action` of the <form>):
 *
 *   https://assets.mailerlite.com/jsonp/<account id>/forms/<form id>/subscribe
 *
 * The embedded form endpoint takes no API key, so nothing secret reaches the browser.
 *
 * While it is empty the form renders an "henüz aktif değil" state on the dev server, and
 * a checklist marked `yayinda` stops the production build (see `isChecklistBuilt`).
 */
export const CHECKLIST_FORM_ENDPOINT = '';

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
 * Form values → MailerLite embedded form body.
 *
 * `name` and `email` are MailerLite default fields. `unvan`, `sehir`, `kvkk_onay` and
 * `pazarlama_izni` are custom fields that must exist in the MailerLite account with
 * exactly these keys. Marketing consent is sent as `evet` or `hayir` every time, so the
 * subscriber record says which one the reader chose instead of leaving it blank.
 */
export function mailerLitePayload(input: ChecklistFormInput): [string, string][] {
  return [
    ['fields[name]', input.name.trim()],
    ['fields[email]', input.email.trim()],
    ['fields[unvan]', input.title.trim()],
    ['fields[sehir]', (input.city ?? '').trim()],
    ['fields[kvkk_onay]', input.kvkk ? 'evet' : 'hayir'],
    ['fields[pazarlama_izni]', input.marketing ? 'evet' : 'hayir'],
    // The two control fields MailerLite's own embed code sends with every submission.
    ['ml-submit', '1'],
    ['anticsrf', 'true'],
  ];
}
