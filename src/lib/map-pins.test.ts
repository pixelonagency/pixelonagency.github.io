import { describe, expect, it } from 'bun:test';
import { placePins, projectPin } from './map-pins';

describe('projectPin', () => {
  it('Greenwich meridyenini tam ortaya koyar', () => {
    // Çerçeve -180..180 olduğu için 0° boylam matematiksel olarak %50'dir.
    expect(projectPin({ lat: 0, lon: 0 }).left).toBe(50);
  });

  it('çerçeve kenarlarını tam 0 ve 100’e oturtur', () => {
    expect(projectPin({ lat: 0, lon: -180 }).left).toBe(0);
    expect(projectPin({ lat: 0, lon: 180 }).left).toBe(100);
    expect(projectPin({ lat: 84, lon: 0 }).top).toBe(0);
  });

  it('ekvatoru enlem çerçevesine göre doğru yere koyar (+84..-58)', () => {
    // (84 - 0) / 142 = %59,15
    expect(projectPin({ lat: 0, lon: 0 }).top).toBeCloseTo(59.15, 1);
  });

  it('İstanbul’u sağ üst çeyreğe yerleştirir', () => {
    const p = projectPin({ lat: 41, lon: 29 });
    expect(p.left).toBeCloseTo(58.06, 1);
    expect(p.top).toBeCloseTo(30.27, 1);
  });

  it('New York’u merkezin soluna, İstanbul’la benzer enleme koyar', () => {
    const ny = projectPin({ lat: 40.7, lon: -74 });
    const ist = projectPin({ lat: 41, lon: 29 });
    expect(ny.left).toBeLessThan(ist.left);
    expect(ny.left).toBeCloseTo(29.44, 1);
    expect(Math.abs(ny.top - ist.top)).toBeLessThan(2);
  });

  it('güney yarımküreyi ekvatorun altına koyar', () => {
    const cape = projectPin({ lat: -34, lon: 18.5 });
    const equator = projectPin({ lat: 0, lon: 18.5 });
    expect(cape.top).toBeGreaterThan(equator.top);
  });

  it('doğuya gidildikçe sola değil sağa kayar', () => {
    expect(projectPin({ lat: 0, lon: 60 }).left).toBeGreaterThan(projectPin({ lat: 0, lon: 10 }).left);
  });

  it('uç koordinatlarda bile yüzdeyi 0–100 aralığında tutar', () => {
    for (const c of [
      { lat: 90, lon: 180 },
      { lat: -90, lon: -180 },
      { lat: 85, lon: -179 },
    ]) {
      const p = projectPin(c);
      expect(p.left).toBeGreaterThanOrEqual(0);
      expect(p.left).toBeLessThanOrEqual(100);
      expect(p.top).toBeGreaterThanOrEqual(0);
      expect(p.top).toBeLessThanOrEqual(100);
    }
  });
});

describe('placePins', () => {
  it('yalnızca koordinatı olan ülkeleri pine çevirir', () => {
    const pins = placePins([
      { label: 'Türkiye', lat: 39, lon: 35, highlighted: true },
      { label: 'Katar' },
      { label: 'Almanya', lat: 51.2, lon: 10.4 },
    ]);
    expect(pins.map((p) => p.label)).toEqual(['Türkiye', 'Almanya']);
  });

  it('vurgulu ülkeyi işaretler, diğerlerini işaretlemez', () => {
    const pins = placePins([
      { label: 'Türkiye', lat: 39, lon: 35, highlighted: true },
      { label: 'Almanya', lat: 51.2, lon: 10.4 },
    ]);
    expect(pins[0]?.highlighted).toBe(true);
    expect(pins[1]?.highlighted).toBe(false);
  });

  it('animasyon sırası için 0’dan başlayan ardışık order verir', () => {
    const pins = placePins([
      { label: 'A', lat: 1, lon: 1 },
      { label: 'B' },
      { label: 'C', lat: 2, lon: 2 },
      { label: 'D', lat: 3, lon: 3 },
    ]);
    expect(pins.map((p) => p.order)).toEqual([0, 1, 2]);
  });

  it('yarım koordinatı (yalnız lat veya yalnız lon) reddeder', () => {
    const pins = placePins([
      { label: 'Yarım', lat: 10 },
      { label: 'Diğer yarım', lon: 10 },
      { label: 'Tam', lat: 10, lon: 10 },
    ]);
    expect(pins.map((p) => p.label)).toEqual(['Tam']);
  });

  it('NaN koordinatı reddeder', () => {
    expect(placePins([{ label: 'Bozuk', lat: Number.NaN, lon: 5 }])).toEqual([]);
  });

  it('hiç koordinat yoksa boş dizi döner — sayfa pinsiz çalışmaya devam eder', () => {
    expect(placePins([{ label: 'Türkiye' }, { label: 'Almanya' }])).toEqual([]);
  });
});
