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

If you allow the Analytics category, Google Analytics 4 places the following measurement cookies (values verified on the live system). These cookies are only created after your permission and are deleted from your browser when you withdraw the Analytics permission. The Analytics category also runs **Microsoft Clarity** (session recording/heatmaps), which places the cookies below once you give permission; without permission Clarity uses NO cookies (it stays in a limited, cookieless mode), and its cookies are deleted when you withdraw:

| Name             | Provider  | Purpose                                   | Category  | Duration          | Type        |
| ---------------- | --------- | ----------------------------------------- | --------- | ----------------- | ----------- |
| `_ga`            | Google    | Distinguishing visitors (GA4 measurement) | Analytics | ~400 days (13 mo) | HTTP cookie |
| `_ga_15DCDNXNG7` | Google    | Maintaining GA4 session state             | Analytics | ~400 days (13 mo) | HTTP cookie |
| `_clck`          | Microsoft | Clarity user ID/preferences               | Analytics | ~365 days         | HTTP cookie |
| `_clsk`          | Microsoft | Linking Clarity session recordings        | Analytics | ~1 day            | HTTP cookie |

If you allow the Marketing category, the following cookies may be created (values observed on the live system; only after Marketing permission). The **Meta Pixel** never loads before permission; when you withdraw it, the `_fbp`/`_fbc` cookies are deleted. For `_gcl_au`, withdrawing stops new data processing; you can delete the existing cookie in your browser settings. `_fbc` is not created for every visitor — only when you arrive via a Meta ad click (`fbclid`):

| Name      | Provider | Purpose                                            | Category  | Duration | Type        |
| --------- | -------- | -------------------------------------------------- | --------- | -------- | ----------- |
| `_fbp`    | Meta     | Advertising/conversion measurement (visitor scope) | Marketing | ~90 days | HTTP cookie |
| `_fbc`    | Meta     | Ad-click attribution (conditional)                 | Marketing | ~90 days | HTTP cookie |
| `_gcl_au` | Google   | Advertising/conversion attribution and measurement | Marketing | ~90 days | HTTP cookie |

## 4. Analytics and Marketing Categories

The **Analytics** category uses **Google Analytics 4**, a measurement service that helps us understand how the site is used and how it performs, and **Microsoft Clarity** (behaviour analytics with anonymous session recordings and heatmaps; form contents are masked). If you do not allow the category, or if you withdraw your permission, the `analytics_storage` signal remains "denied": in that case Analytics cookies are **not used and not created**; however, as part of Google's Consent Mode infrastructure, cookieless, non-identifying measurement/consent signals (consent pings) may still be sent to Google. Once you give permission, cookie-based Analytics measurement can become active. The **Marketing** category uses the **Meta Pixel** (ad performance and conversion measurement), which **loads only if you give permission**; without permission no request is sent to Meta, and when you withdraw it, its cookies are deleted. The content you type into form fields is never sent to Meta. Google Ads conversion tracking is not yet active; if you allow the category, the Google tag may only place the `_gcl_au` cookie listed above. If a new marketing service is activated, this policy will be updated with the real cookie list **beforehand**.

## 5. Google Tag Manager and Consent Mode

**Google Tag Manager** is loaded only as tag-management infrastructure; it does not measure anything by itself and does not set cookies. All tags, including Google Analytics 4, are managed through this container. Your choices are communicated to the tag infrastructure through **Google Consent Mode v2** signals (analytics and advertising storage default to "denied"); tags behave according to these signals.

## 6. More Information

See the [Personal Data Processing Notice](/en/personal-data-processing-notice/) for the legal disclosure on personal data and the [Privacy Policy](/en/privacy-policy/) for our general practices. Questions: [info@pixelon.com.tr](mailto:info@pixelon.com.tr)
