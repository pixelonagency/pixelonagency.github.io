import { describe, expect, test } from 'bun:test';
import {
  CHECKLIST_CONSENT_TEXTS,
  CHECKLIST_CONSENT_VERSION,
  CHECKLIST_SUCCESS_TEXT,
  CHECKLIST_FORM_ENDPOINT,
  checklistFormEndpoint,
  checklistSource,
  mailerLiteBody,
  mailerLitePayload,
} from './checklist-form';

describe('checklist form endpoint', () => {
  test('points at the live MailerLite embedded form', () => {
    expect(CHECKLIST_FORM_ENDPOINT).toBe(
      'https://assets.mailerlite.com/jsonp/2695085/forms/200745219577087214/subscribe',
    );
    expect(checklistFormEndpoint(CHECKLIST_FORM_ENDPOINT)).toBe(CHECKLIST_FORM_ENDPOINT);
  });

  test('an empty value is still allowed: the form then shows its inactive state', () => {
    expect(checklistFormEndpoint('')).toBe('');
  });

  test('rejects anything else instead of posting personal data to an unknown address', () => {
    for (const bad of [
      'http://assets.mailerlite.com/jsonp/1/forms/2/subscribe',
      'https://assets.mailerlite.com/jsonp/1/forms/2',
      'https://example.com/jsonp/1/forms/2/subscribe',
      '987654321',
    ]) {
      expect(() => checklistFormEndpoint(bad)).toThrow(/MailerLite/);
    }
  });
});

describe('consent text version', () => {
  test('matches the approved form notice (rehber/saglik/kvkk-checklist-formu.md)', () => {
    expect(CHECKLIST_CONSENT_VERSION).toBe('kvkk-checklist-1-v1');
  });
});

describe('approved form texts (kvkk-checklist-1-v1)', () => {
  test('checkbox 1 links the KVKK notice and states it was read', () => {
    expect(CHECKLIST_CONSENT_TEXTS.kvkk).toEqual({ link: 'Aydınlatma Metni', after: "'ni okudum." });
  });

  test('checkbox 2 is the marketing consent, word for word', () => {
    expect(CHECKLIST_CONSENT_TEXTS.marketing).toBe(
      "Pixelon'un yeni rehber ve checklistleri, hizmetleri ve ücretsiz dijital analiz davetleri hakkında bana e-posta gönderilmesine ve bu amaçla ad soyad, e-posta, unvan/uzmanlık ve şehir bilgilerimin işlenmesine açık rıza veriyorum. Onayımı istediğim zaman geri çekebilirim.",
    );
    expect(CHECKLIST_CONSENT_TEXTS.marketingNote).toBe(
      'Bu kutuyu işaretlemeseniz de checklist e-posta adresinize gönderilir.',
    );
  });

  test('success message tells the reader where the email goes', () => {
    expect(CHECKLIST_SUCCESS_TEXT).toBe(
      'Checklist e-posta adresinize gönderildi. Birkaç dakika içinde gelen kutunuzu, gelmezse spam klasörünü kontrol edin.',
    );
  });
});

describe('source of the sign-up', () => {
  const PATH = '/rehber/saglik/hekimler/dijital-gorunurluk-checklisti/';

  test('is the page path', () => {
    expect(checklistSource(PATH, '')).toBe(PATH);
  });

  test('keeps utm_source and drops every other query parameter', () => {
    expect(checklistSource(PATH, '?utm_source=instagram&utm_medium=bio&fbclid=abc')).toBe(
      `${PATH}?utm_source=instagram`,
    );
    expect(checklistSource(PATH, '?fbclid=abc')).toBe(PATH);
  });
});

describe('MailerLite payload', () => {
  const input = {
    name: 'Dr. Ayşe Yılmaz',
    email: 'ayse@ornek.com',
    title: 'Dermatoloji uzmanı',
    city: 'İzmir',
    kvkk: true,
    marketing: false,
  };
  const context = {
    submittedAt: new Date('2026-10-12T08:30:00.000Z'),
    source: '/rehber/saglik/hekimler/dijital-gorunurluk-checklisti/?utm_source=instagram',
  };

  test('maps the form onto the MailerLite subscriber fields the account accepts', () => {
    expect(mailerLitePayload(input, context)).toEqual([
      ['fields[name]', 'Dr. Ayşe Yılmaz'],
      ['fields[email]', 'ayse@ornek.com'],
      ['fields[unvan]', 'Dermatoloji uzmanı'],
      ['fields[city]', 'İzmir'],
      ['fields[kvkk_onay]', 'evet'],
      ['fields[pazarlama_izni]', 'hayir'],
      ['fields[onay_tarihi]', '2026-10-12T08:30:00.000Z'],
      ['fields[metin_surumu]', 'kvkk-checklist-1-v1'],
      ['fields[kaynak]', '/rehber/saglik/hekimler/dijital-gorunurluk-checklisti/?utm_source=instagram'],
      ['ml-submit', '1'],
      ['anticsrf', 'true'],
    ]);
  });

  test('records marketing consent explicitly in both directions', () => {
    expect(mailerLitePayload({ ...input, marketing: true }, context)).toContainEqual([
      'fields[pazarlama_izni]',
      'evet',
    ]);
  });

  test('trims values and sends an empty city as empty', () => {
    const payload = mailerLitePayload({ ...input, name: '  Ayşe  ', city: '   ' }, context);
    expect(payload).toContainEqual(['fields[name]', 'Ayşe']);
    expect(payload).toContainEqual(['fields[city]', '']);
  });

  test('refuses to build a submission without the required KVKK confirmation', () => {
    expect(() => mailerLitePayload({ ...input, kvkk: false }, context)).toThrow(/KVKK/);
  });

  test('encodes as application/x-www-form-urlencoded with Turkish characters intact', () => {
    const body = mailerLiteBody(mailerLitePayload(input, context));
    expect(body).toBeInstanceOf(URLSearchParams);
    expect(body.get('fields[name]')).toBe('Dr. Ayşe Yılmaz');
    expect(body.toString()).toContain('fields%5Bname%5D=Dr.+Ay%C5%9Fe+Y%C4%B1lmaz');
  });
});
