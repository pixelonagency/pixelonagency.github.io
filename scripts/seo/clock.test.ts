/**
 * Tarih damgası testleri.
 *
 * Asıl korunan şey: UTC ile Türkiye saatinin ayrıştığı gece penceresinde audit.mjs ve
 * daily.mjs'in AYNI günü üretmesi. Bu ayrışma teknik metrikleri sessizce "?" yapıyordu.
 */
import { describe, expect, test } from 'bun:test';
import { TZ, stampFor } from './clock.mjs';

describe('stampFor', () => {
  test('Türkiye saat dilimini kullanır', () => {
    expect(TZ).toBe('Europe/Istanbul');
  });

  test('UTC ile ayrışan gece penceresinde Türkiye gününü verir', () => {
    // 21 Ağustos 21:26 UTC = 22 Ağustos 00:26 TR — bug tam burada oluşuyordu.
    expect(stampFor(new Date('2026-08-21T21:26:00Z'))).toBe('2026-08-22');
    expect(new Date('2026-08-21T21:26:00Z').toISOString().slice(0, 10)).toBe('2026-08-21');
  });

  test('gün ortasında UTC ile aynı sonucu verir', () => {
    expect(stampFor(new Date('2026-08-21T09:00:00Z'))).toBe('2026-08-21');
  });

  test('YYYY-MM-DD biçiminde döner', () => {
    expect(stampFor(new Date('2026-01-05T12:00:00Z'))).toBe('2026-01-05');
  });
});
