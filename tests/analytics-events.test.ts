import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ANALYTICS_EVENTS,
  buildEventPayload,
  leadTypeForForm,
  pushToDataLayer,
  resolveClickEvent,
  resolvePageLocation,
} from '../src/lib/analytics-events';

const ROOT = join(import.meta.dir, '..');

describe('event allowlist', () => {
  test('only the five business events exist in the taxonomy', () => {
    expect([...ANALYTICS_EVENTS]).toEqual([
      'generate_lead',
      'click_whatsapp',
      'click_phone',
      'click_email',
      'click_free_analysis',
    ]);
  });

  test('unknown or drifted event names are rejected as no-op', () => {
    for (const bad of ['generate-lead', 'whatsapp_click', 'contact_clicked', 'page_view', 'click', '']) {
      expect(buildEventPayload(bad, { language: 'tr' })).toBeNull();
    }
  });
});

describe('payload shape (PII guard)', () => {
  test('generate_lead carries exactly event, lead_type, interaction_location, page_language', () => {
    const payload = buildEventPayload('generate_lead', {
      leadType: 'contact',
      location: 'contact_page',
      language: 'tr',
    });
    expect(payload).toEqual({
      event: 'generate_lead',
      lead_type: 'contact',
      interaction_location: 'contact_page',
      page_language: 'tr',
    });
    // Payload anahtarları sabittir — form alanı adları payload'a giremez.
    expect(Object.keys(payload ?? {}).sort()).toEqual(['event', 'interaction_location', 'lead_type', 'page_language']);
    for (const banned of ['email', 'phone', 'name', 'company', 'website', 'message', 'budget']) {
      expect(payload).not.toHaveProperty(banned);
    }
  });

  test('free-text values cannot enter the payload — invalid enums are dropped, not forwarded', () => {
    const payload = buildEventPayload('click_whatsapp', {
      location: 'ali@example.com',
      language: '+90 555 111 22 33',
    });
    expect(payload).toEqual({ event: 'click_whatsapp' });
  });

  test('lead_type is required for generate_lead and forbidden values kill the event', () => {
    expect(buildEventPayload('generate_lead', { language: 'tr' })).toBeNull();
    expect(buildEventPayload('generate_lead', { leadType: 'ContactFormV2Astro' })).toBeNull();
  });

  test('lead_type never appears on click events', () => {
    const payload = buildEventPayload('click_phone', { leadType: 'contact', location: 'footer', language: 'en' });
    expect(payload).toEqual({ event: 'click_phone', interaction_location: 'footer', page_language: 'en' });
  });

  test('missing parameters are omitted entirely — undefined is never pushed', () => {
    const payload = buildEventPayload('click_email', {});
    expect(payload).toEqual({ event: 'click_email' });
    expect(Object.keys(payload ?? {})).toEqual(['event']);
  });
});

describe('click resolution', () => {
  test('real link patterns map to the correct business events', () => {
    expect(resolveClickEvent('tel:+905065229034')).toBe('click_phone');
    expect(resolveClickEvent('mailto:info@pixelon.com.tr')).toBe('click_email');
    expect(resolveClickEvent('https://wa.me/905065229034?text=Merhaba')).toBe('click_whatsapp');
    expect(resolveClickEvent('https://api.whatsapp.com/send?phone=905065229034')).toBe('click_whatsapp');
    expect(resolveClickEvent('/ucretsiz-analiz')).toBe('click_free_analysis');
    expect(resolveClickEvent('/en/free-analysis')).toBe('click_free_analysis');
  });

  test('ordinary navigation produces no business event', () => {
    for (const href of [
      '/',
      '/biz-kimiz',
      '/blog/yazi',
      'https://instagram.com/pixelon',
      '#form',
      '/ucretsiz-analizler',
    ]) {
      expect(resolveClickEvent(href)).toBeNull();
    }
  });
});

describe('page context', () => {
  test('page location derives from real route slugs, TR and EN', () => {
    expect(resolvePageLocation('/iletisim/')).toBe('contact_page');
    expect(resolvePageLocation('/en/contact/')).toBe('contact_page');
    expect(resolvePageLocation('/ucretsiz-analiz/')).toBe('free_analysis_page');
    expect(resolvePageLocation('/en/free-analysis')).toBe('free_analysis_page');
    expect(resolvePageLocation('/web-sitesi-yaptir/')).toBe('landing_page');
    expect(resolvePageLocation('/hizmetlerimiz/web-tasarim-ve-yazilim/')).toBe('service_page');
    expect(resolvePageLocation('/en/services/')).toBe('service_page');
    expect(resolvePageLocation('/projelerimiz/')).toBe('project_page');
  });

  test('pages without a business location yield undefined (no invented values)', () => {
    for (const path of ['/', '/biz-kimiz/', '/blog/', '/kvkk-aydinlatma-metni/', '/kariyer/']) {
      expect(resolvePageLocation(path)).toBeUndefined();
    }
  });

  test('form panel ids map to business lead types, unknown ids are rejected', () => {
    expect(leadTypeForForm('contact')).toBe('contact');
    expect(leadTypeForForm('analysis')).toBe('free_analysis');
    expect(leadTypeForForm('newsletter')).toBeNull();
  });
});

describe('delivery', () => {
  test('pushes only into an existing dataLayer and never throws without one', () => {
    const w = globalThis as { dataLayer?: unknown[] };
    delete w.dataLayer;
    expect(() => pushToDataLayer({ event: 'click_phone' })).not.toThrow(); // dataLayer yok → no-op
    w.dataLayer = [];
    pushToDataLayer({ event: 'click_phone', page_language: 'tr' });
    expect(w.dataLayer).toEqual([{ event: 'click_phone', page_language: 'tr' }]);
    delete w.dataLayer;
  });
});

describe('architecture guards', () => {
  test('the helper contains no GA4/GTM identifiers and no direct gtag calls', () => {
    const source = readFileSync(join(ROOT, 'src', 'lib', 'analytics-events.ts'), 'utf-8');
    for (const banned of ['G-15DCDNXNG7', 'GT-M3K8V5NL', 'GTM-MWVJ2S27', "gtag('event'", 'gtag("event"']) {
      expect(source.includes(banned), `${banned} helper'a sızmış`).toBe(false);
    }
  });

  test('the listener component handles only delegated CTA clicks — no lead production', () => {
    const source = readFileSync(join(ROOT, 'src', 'components', 'AnalyticsEvents.astro'), 'utf-8');
    expect(source).toContain("document.addEventListener('click'");
    expect(source).toContain('data-analytics-bound');
    // Lead üretimi buradan tamamen çıkarıldı — kaynağı formun başarı dalıdır.
    expect(source.includes('MutationObserver')).toBe(false);
    expect(source.includes("'generate_lead'")).toBe(false);
    expect(source.includes('preventDefault'), 'analytics navigasyonu bloklayamaz').toBe(false);
  });

  test('generate_lead fires only from the verified Web3Forms success branch, guarded and best-effort', () => {
    const source = readFileSync(join(ROOT, 'src', 'components', 'sections', 'ContactFormFields.astro'), 'utf-8');
    const successIndex = source.indexOf('payload.success !== true');
    const leadIndex = source.indexOf("buildEventPayload('generate_lead'");
    expect(successIndex).toBeGreaterThan(-1);
    // Olay üretimi doğrulanmış başarı kontrolünden SONRA gelir.
    expect(leadIndex).toBeGreaterThan(successIndex);
    // Duplicate guard + best-effort sarmalayıcı yerinde.
    expect(source).toContain('data-lead-tracked');
    expect(source.slice(successIndex, leadIndex)).toContain('try {');
  });
});
