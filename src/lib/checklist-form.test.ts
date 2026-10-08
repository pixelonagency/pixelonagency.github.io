import { describe, expect, test } from 'bun:test';
import { CHECKLIST_FORM_ENDPOINT, checklistFormEndpoint, mailerLitePayload } from './checklist-form';

describe('checklist form endpoint', () => {
  test('is unset until the MailerLite account exists: the form stays inactive', () => {
    expect(CHECKLIST_FORM_ENDPOINT).toBe('');
    expect(checklistFormEndpoint('')).toBe('');
  });

  test('accepts the MailerLite embedded form subscribe URL', () => {
    const url = 'https://assets.mailerlite.com/jsonp/1234567/forms/987654321/subscribe';
    expect(checklistFormEndpoint(url)).toBe(url);
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

describe('MailerLite payload', () => {
  const input = {
    name: 'Dr. Ayşe Yılmaz',
    email: 'ayse@ornek.com',
    title: 'Dermatoloji uzmanı',
    city: 'İzmir',
    kvkk: true,
    marketing: false,
  };

  test('maps the form onto MailerLite subscriber fields', () => {
    expect(mailerLitePayload(input)).toEqual([
      ['fields[name]', 'Dr. Ayşe Yılmaz'],
      ['fields[email]', 'ayse@ornek.com'],
      ['fields[unvan]', 'Dermatoloji uzmanı'],
      ['fields[sehir]', 'İzmir'],
      ['fields[kvkk_onay]', 'evet'],
      ['fields[pazarlama_izni]', 'hayir'],
      ['ml-submit', '1'],
      ['anticsrf', 'true'],
    ]);
  });

  test('records marketing consent explicitly in both directions', () => {
    const yes = mailerLitePayload({ ...input, marketing: true });
    expect(yes).toContainEqual(['fields[pazarlama_izni]', 'evet']);
  });

  test('trims values and sends an empty city as empty', () => {
    const payload = mailerLitePayload({ ...input, name: '  Ayşe  ', city: '   ' });
    expect(payload).toContainEqual(['fields[name]', 'Ayşe']);
    expect(payload).toContainEqual(['fields[sehir]', '']);
  });
});
