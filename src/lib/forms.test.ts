import { describe, expect, test } from 'bun:test';
import { validateAnalysisForm, validateContactForm, type FormMessages } from './forms';

const validContact = {
  name: 'Ayşe Yılmaz',
  email: 'ayse@ornek.com',
  phone: '+90 506 522 90 34',
  service: 'Web Tasarım',
  message: 'Merhaba, yeni bir kurumsal site için teklif almak istiyorum.',
  consent: true,
};

describe('validateContactForm', () => {
  test('accepts a fully filled valid submission', () => {
    const result = validateContactForm(validContact);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  test('rejects an empty name with a Turkish message', () => {
    const result = validateContactForm({ ...validContact, name: '   ' });
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBe('Lütfen adınızı ve soyadınızı girin.');
  });

  test('rejects a name shorter than two characters', () => {
    expect(validateContactForm({ ...validContact, name: 'A' }).errors.name).toBe('Lütfen adınızı ve soyadınızı girin.');
  });

  test('rejects an email without an @ sign', () => {
    expect(validateContactForm({ ...validContact, email: 'ayse.ornek.com' }).errors.email).toBe(
      'Geçerli bir e-posta adresi girin.',
    );
  });

  test('rejects an email without a dotted domain', () => {
    expect(validateContactForm({ ...validContact, email: 'ayse@ornek' }).errors.email).toBe(
      'Geçerli bir e-posta adresi girin.',
    );
  });

  test('rejects a phone number with fewer than ten digits', () => {
    expect(validateContactForm({ ...validContact, phone: '506 522' }).errors.phone).toBe(
      'Geçerli bir telefon numarası girin.',
    );
  });

  test('accepts an empty phone because the field is optional', () => {
    const result = validateContactForm({ ...validContact, phone: '' });
    expect(result.valid).toBe(true);
    expect(result.errors.phone).toBeUndefined();
  });

  test('rejects a message shorter than ten characters', () => {
    expect(validateContactForm({ ...validContact, message: 'Merhaba' }).errors.message).toBe(
      'Mesajınız en az 10 karakter olmalı.',
    );
  });

  test('rejects a submission without the KVKK consent checkbox', () => {
    expect(validateContactForm({ ...validContact, consent: false }).errors.consent).toBe(
      'Devam etmek için aydınlatma metnini onaylayın.',
    );
  });

  test('reports every invalid field at once rather than stopping at the first', () => {
    const result = validateContactForm({ name: '', email: 'x', phone: '', message: '', consent: false });
    expect(Object.keys(result.errors).sort()).toEqual(['consent', 'email', 'message', 'name']);
  });
});

const validAnalysis = {
  name: 'Mehmet Demir',
  email: 'mehmet@sirket.com.tr',
  phone: '05065229034',
  company: 'Örnek A.Ş.',
  website: 'https://ornek.com.tr',
  services: ['seo'],
  consent: true,
};

describe('validateAnalysisForm', () => {
  test('accepts a fully filled valid submission', () => {
    const result = validateAnalysisForm(validAnalysis);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  test('requires the company name', () => {
    expect(validateAnalysisForm({ ...validAnalysis, company: '' }).errors.company).toBe('Lütfen şirket adınızı girin.');
  });

  test('requires the phone number, unlike the contact form', () => {
    expect(validateAnalysisForm({ ...validAnalysis, phone: '' }).errors.phone).toBe(
      'Geçerli bir telefon numarası girin.',
    );
  });

  test('requires at least one selected service', () => {
    expect(validateAnalysisForm({ ...validAnalysis, services: [] }).errors.services).toBe('En az bir hizmet seçin.');
  });

  test('accepts a website typed without a protocol', () => {
    const result = validateAnalysisForm({ ...validAnalysis, website: 'ornek.com.tr' });
    expect(result.valid).toBe(true);
  });

  test('accepts an empty website because the field is optional', () => {
    expect(validateAnalysisForm({ ...validAnalysis, website: '' }).valid).toBe(true);
  });

  test('rejects a website that is not a plausible domain', () => {
    expect(validateAnalysisForm({ ...validAnalysis, website: 'ornek' }).errors.website).toBe(
      'Geçerli bir web sitesi adresi girin.',
    );
  });
});

/**
 * Doğrulama metinleri tarayıcıda gösterilir; sayfa İngilizceyse hata da İngilizce
 * olmalıdır. Metinler `src/lib/ui.ts` sözlüğünden gelir ve buraya parametreyle geçilir.
 */
const english: FormMessages = {
  name: 'Please enter your first and last name.',
  email: 'Please enter a valid email address.',
  phone: 'Please enter a valid phone number.',
  message: 'Your message must be at least 10 characters long.',
  consent: 'Please accept the disclosure notice to continue.',
  company: 'Please enter your company name.',
  website: 'Please enter a valid website address.',
  services: 'Please select at least one service.',
};

describe('locale-aware validation messages', () => {
  test('validateContactForm uses the supplied message set', () => {
    const result = validateContactForm({ ...validContact, name: '', message: '' }, english);
    expect(result.errors.name).toBe(english.name);
    expect(result.errors.message).toBe(english.message);
  });

  test('validateAnalysisForm uses the supplied message set', () => {
    const result = validateAnalysisForm({ ...validAnalysis, company: '', services: [] }, english);
    expect(result.errors.company).toBe(english.company);
    expect(result.errors.services).toBe(english.services);
  });

  test('consent and email messages come from the supplied set too', () => {
    const result = validateAnalysisForm({ ...validAnalysis, consent: false, email: 'nope' }, english);
    expect(result.errors.consent).toBe(english.consent);
    expect(result.errors.email).toBe(english.email);
  });

  test('falls back to the Turkish defaults when no message set is given', () => {
    expect(validateContactForm({ ...validContact, name: '' }).errors.name).toBe('Lütfen adınızı ve soyadınızı girin.');
  });
});
