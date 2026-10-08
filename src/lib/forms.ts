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

/**
 * Doğrulama hatalarının alan → metin eşlemesi.
 *
 * Metinler burada SABİT DEĞİL: sayfanın dili build sırasında bilindiği için çağıran
 * (bkz. `FormSection.astro`) `src/lib/ui.ts` sözlüğünden ürettiği seti geçirir.
 * Parametre verilmezse Türkçe varsayılanlar kullanılır.
 */
export interface FormMessages {
  name: string;
  email: string;
  phone: string;
  message: string;
  consent: string;
  company: string;
  website: string;
  services: string;
}

const DEFAULT_MESSAGES: FormMessages = {
  name: 'Lütfen adınızı ve soyadınızı girin.',
  email: 'Geçerli bir e-posta adresi girin.',
  phone: 'Geçerli bir telefon numarası girin.',
  message: 'Mesajınız en az 10 karakter olmalı.',
  consent: 'Devam etmek için aydınlatma metnini onaylayın.',
  company: 'Lütfen şirket adınızı girin.',
  website: 'Geçerli bir web sitesi adresi girin.',
  services: 'En az bir hizmet seçin.',
};

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
  messages: FormMessages,
): void {
  if (isBlank(input.name) || input.name.trim().length < 2) errors.name = messages.name;
  if (!EMAIL_RE.test(input.email.trim())) errors.email = messages.email;
  if (!input.consent) errors.consent = messages.consent;
}

/** İletişim formu doğrulaması — telefon ve konu isteğe bağlıdır. */
export function validateContactForm(
  input: ContactFormInput,
  messages: FormMessages = DEFAULT_MESSAGES,
): ValidationResult {
  const errors: Record<string, string> = {};
  validateShared(input, errors, messages);

  if (!isBlank(input.phone) && digitCount(input.phone ?? '') < MIN_PHONE_DIGITS) errors.phone = messages.phone;
  if (isBlank(input.message) || input.message.trim().length < MIN_MESSAGE_LENGTH) errors.message = messages.message;

  return { valid: Object.keys(errors).length === 0, errors };
}

/** Ücretsiz analiz formu doğrulaması — telefon, şirket ve en az bir hizmet zorunludur. */
export function validateAnalysisForm(
  input: AnalysisFormInput,
  messages: FormMessages = DEFAULT_MESSAGES,
): ValidationResult {
  const errors: Record<string, string> = {};
  validateShared(input, errors, messages);

  if (digitCount(input.phone) < MIN_PHONE_DIGITS) errors.phone = messages.phone;
  if (isBlank(input.company)) errors.company = messages.company;
  if (!isBlank(input.website) && !isValidWebsite(input.website ?? '')) errors.website = messages.website;
  if (input.services.length === 0) errors.services = messages.services;

  return { valid: Object.keys(errors).length === 0, errors };
}

export interface ChecklistFormInput {
  name: string;
  email: string;
  /** Title or specialty, e.g. "Dermatoloji uzmanı". */
  title: string;
  city?: string;
  /** Read the KVKK notice: required. */
  kvkk: boolean;
  /** Marketing e-mails: optional, never required, never pre-checked. */
  marketing: boolean;
}

interface ChecklistFormMessages {
  name: string;
  email: string;
  title: string;
  kvkk: string;
}

/* The guide is Turkish only, so the checklist form has a single message set. */
const CHECKLIST_MESSAGES: ChecklistFormMessages = {
  name: DEFAULT_MESSAGES.name,
  email: DEFAULT_MESSAGES.email,
  title: 'Lütfen unvanınızı veya uzmanlık alanınızı girin.',
  kvkk: 'Devam etmek için aydınlatma metnini okuduğunuzu onaylayın.',
};

/** Checklist sign-up form: city and marketing consent are optional. */
export function validateChecklistForm(input: ChecklistFormInput): ValidationResult {
  const errors: Record<string, string> = {};
  if (isBlank(input.name) || input.name.trim().length < 2) errors.name = CHECKLIST_MESSAGES.name;
  if (!EMAIL_RE.test(input.email.trim())) errors.email = CHECKLIST_MESSAGES.email;
  if (isBlank(input.title)) errors.title = CHECKLIST_MESSAGES.title;
  if (!input.kvkk) errors.kvkk = CHECKLIST_MESSAGES.kvkk;
  return { valid: Object.keys(errors).length === 0, errors };
}
