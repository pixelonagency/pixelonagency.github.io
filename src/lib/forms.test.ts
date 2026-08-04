import { describe, expect, test } from 'bun:test';
import { validateAnalysisForm, validateContactForm } from './forms';

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
