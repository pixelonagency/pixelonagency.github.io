import { describe, expect, test } from 'bun:test';

import { parseStatValue } from './stat-counter';

/*
 * Sayaç animasyonu, vaka sayfasındaki rakamı HTML'de yazdığı biçimden ayrıştırır.
 * Biçim dile göre değişiyor: Türkçe'de binlik nokta / ondalık virgül ("2.886", "9,2M"),
 * İngilizce'de tersi ("2,886", "9.2M"). Ayrıştırıcı sabit Türkçe olduğu sürece
 * İngilizce sayfada "9.2M" → 92 oluyordu; rakam ekranda bozuluyordu.
 */
describe('parseStatValue', () => {
  test('Türkçe: yüzde öneki ayrılır', () => {
    expect(parseStatValue('%25', 'tr')).toEqual({ prefix: '%', suffix: '', target: 25, decimals: 0 });
  });

  test('Türkçe: ondalık virgül ve harf soneki korunur', () => {
    expect(parseStatValue('9,2M', 'tr')).toEqual({ prefix: '', suffix: 'M', target: 9.2, decimals: 1 });
  });

  test('Türkçe: binlik nokta ayırıcıdır, ondalık değil', () => {
    expect(parseStatValue('2.886', 'tr')).toEqual({ prefix: '', suffix: '', target: 2886, decimals: 0 });
  });

  test('İngilizce: ondalık NOKTA, binlik VİRGÜL', () => {
    expect(parseStatValue('9.2M', 'en')).toEqual({ prefix: '', suffix: 'M', target: 9.2, decimals: 1 });
    expect(parseStatValue('2,886', 'en')).toEqual({ prefix: '', suffix: '', target: 2886, decimals: 0 });
  });

  test('İngilizce: yüzde soneki ayrılır', () => {
    expect(parseStatValue('25%', 'en')).toEqual({ prefix: '', suffix: '%', target: 25, decimals: 0 });
  });

  test('sayı içermeyen değer ayrıştırılmaz', () => {
    expect(parseStatValue('—', 'tr')).toBeNull();
    expect(parseStatValue('', 'en')).toBeNull();
  });
});
