export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export interface ContactFormInput {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
  consent: boolean;
}

export interface AnalysisFormInput {
  name: string;
  email: string;
  phone: string;
  company: string;
  website?: string;
  services: string[];
  consent: boolean;
}

export const MESSAGES = {
  name: 'Lütfen adınızı ve soyadınızı girin.',
  email: 'Geçerli bir e-posta adresi girin.',
  phone: 'Geçerli bir telefon numarası girin.',
  message: 'Mesajınız en az 10 karakter olmalı.',
  consent: 'Devam etmek için aydınlatma metnini onaylayın.',
  company: 'Lütfen şirket adınızı girin.',
  website: 'Geçerli bir web sitesi adresi girin.',
  services: 'En az bir hizmet seçin.',
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DOMAIN_RE = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i;
const MIN_PHONE_DIGITS = 10;
const MIN_MESSAGE_LENGTH = 10;

const isBlank = (value: string | undefined): boolean => !value || value.trim().length === 0;
const digitCount = (value: string): number => value.replace(/\D/g, '').length;

function isValidWebsite(value: string): boolean {
  const host = value
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '');
  return DOMAIN_RE.test(host);
}

function validateShared(
  input: Pick<ContactFormInput, 'name' | 'email' | 'consent'>,
  errors: Record<string, string>,
): void {
  if (isBlank(input.name) || input.name.trim().length < 2) errors.name = MESSAGES.name;
  if (!EMAIL_RE.test(input.email.trim())) errors.email = MESSAGES.email;
  if (!input.consent) errors.consent = MESSAGES.consent;
}

/** İletişim formu doğrulaması — telefon ve konu isteğe bağlıdır. */
export function validateContactForm(input: ContactFormInput): ValidationResult {
  const errors: Record<string, string> = {};
  validateShared(input, errors);

  if (!isBlank(input.phone) && digitCount(input.phone ?? '') < MIN_PHONE_DIGITS) errors.phone = MESSAGES.phone;
  if (isBlank(input.message) || input.message.trim().length < MIN_MESSAGE_LENGTH) errors.message = MESSAGES.message;

  return { valid: Object.keys(errors).length === 0, errors };
}

/** Ücretsiz analiz formu doğrulaması — telefon, şirket ve en az bir hizmet zorunludur. */
export function validateAnalysisForm(input: AnalysisFormInput): ValidationResult {
  const errors: Record<string, string> = {};
  validateShared(input, errors);

  if (digitCount(input.phone) < MIN_PHONE_DIGITS) errors.phone = MESSAGES.phone;
  if (isBlank(input.company)) errors.company = MESSAGES.company;
  if (!isBlank(input.website) && !isValidWebsite(input.website ?? '')) errors.website = MESSAGES.website;
  if (input.services.length === 0) errors.services = MESSAGES.services;

  return { valid: Object.keys(errors).length === 0, errors };
}
