---
title: Cookie Policy
seo:
  title: Cookie Policy | Pixelon
  description: >-
    The cookies actually used on the Pixelon website, consent management with
    Klaro, and how Google Consent Mode v2 is applied.
intro: >-
  This policy describes the cookies genuinely in use on this website and how
  you can manage your preferences; it is kept in step with the live system.
updated: 2026-08-19
---

## 1. What Are Cookies?

Cookies are small text files that websites store in your browser. They serve purposes ranging from essential functions, such as remembering preferences, to measurement.

## 2. Managing Your Preferences

Cookie consent on this site is managed with the open-source **Klaro** consent manager, served from our own domain. Analytics and marketing categories are **off by default** and only become active if you allow them. You can change your choice at any time using the button below or the "Cookie Preferences" link in the footer:

<button type="button" class="btn btn--primary" data-cookie-prefs>Manage Cookie Preferences</button>

You can also delete or block cookies in your browser settings; blocking essential cookies may prevent some functions from working.

## 3. Cookies Currently in Use

Unless you give permission, the website sets **only one first-party essential cookie**:

| Name              | Provider              | Purpose                         | Category  | Duration | Type        |
| ----------------- | --------------------- | ------------------------------- | --------- | -------- | ----------- |
| `pixelon-consent` | Pixelon (first party) | Remembering your cookie choices | Essential | 365 days | HTTP cookie |

If you allow the Analytics category, Google Analytics 4 places the following measurement cookies (values verified on the live system). These cookies are only created after your permission and are deleted from your browser when you withdraw it:

| Name             | Provider | Purpose                                   | Category  | Duration          | Type        |
| ---------------- | -------- | ----------------------------------------- | --------- | ----------------- | ----------- |
| `_ga`            | Google   | Distinguishing visitors (GA4 measurement) | Analytics | ~400 days (13 mo) | HTTP cookie |
| `_ga_15DCDNXNG7` | Google   | Maintaining GA4 session state             | Analytics | ~400 days (13 mo) | HTTP cookie |

## 4. Analytics and Marketing Categories

The **Analytics** category uses **Google Analytics 4**, a measurement service that helps us understand how the site is used and how it performs. If you do not allow the category, or if you withdraw your permission, the `analytics_storage` signal remains "denied": in that case Analytics cookies are **not used and not created**; however, as part of Google's Consent Mode infrastructure, cookieless, non-identifying measurement/consent signals (consent pings) may still be sent to Google. Once you give permission, cookie-based Analytics measurement can become active. The **Marketing** category currently has no active service and sets no cookies; if a marketing service is added in the future, this policy will be updated with the real cookie list **beforehand**.

## 5. Google Tag Manager and Consent Mode

**Google Tag Manager** is loaded only as tag-management infrastructure; it does not measure anything by itself and does not set cookies. All tags, including Google Analytics 4, are managed through this container. Your choices are communicated to the tag infrastructure through **Google Consent Mode v2** signals (analytics and advertising storage default to "denied"); tags behave according to these signals.

## 6. More Information

See the [Personal Data Processing Notice](/en/personal-data-processing-notice) for the legal disclosure on personal data and the [Privacy Policy](/en/privacy-policy) for our general practices. Questions: [info@pixelon.com.tr](mailto:info@pixelon.com.tr)
