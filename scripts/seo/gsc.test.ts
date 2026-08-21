/**
 * GSC service account çekicisinin testleri.
 *
 * Ağ çağrısı yapılmaz; doğrulanan şey saf dönüşümlerdir: tarih penceresi, JWT
 * iddiası/imzası, API satırı → CSV nesnesi ve CSV serileştirme. Amaç, gerçek key
 * geldiği gün biçim sürprizi yaşamamak — özellikle CTR'ın yüzde olarak yazılması,
 * çünkü sources.mjs eşikleri (ctr < 2) yüzde varsayıyor.
 */
import { describe, expect, test } from 'bun:test';
import { createVerify, generateKeyPairSync } from 'node:crypto';
import { LAG_DAYS, buildClaim, dateRange, signJwt, toCsv, toRows } from './gsc.mjs';
import { classifyQueries, parseCsv } from './sources.mjs';

describe('dateRange', () => {
  test('GSC gecikmesi kadar geriden biter', () => {
    const { endDate } = dateRange(new Date('2026-08-21T00:00:00Z'), 28);
    expect(endDate).toBe('2026-08-18');
    expect(LAG_DAYS).toBe(3);
  });

  test('pencere uçları dahil olacak şekilde gün sayısını verir', () => {
    const { startDate, endDate } = dateRange(new Date('2026-08-21T00:00:00Z'), 28);
    const gun = (Date.parse(endDate) - Date.parse(startDate)) / 86400000 + 1;
    expect(gun).toBe(28);
  });
});

describe('JWT', () => {
  test('iddia doğru scope ve bir saatlik ömürle kurulur', () => {
    const claim = buildClaim('sa@proje.iam.gserviceaccount.com', 1_000_000);
    expect(claim.iss).toBe('sa@proje.iam.gserviceaccount.com');
    expect(claim.scope).toBe('https://www.googleapis.com/auth/webmasters.readonly');
    expect(claim.aud).toBe('https://oauth2.googleapis.com/token');
    expect(claim.exp - claim.iat).toBe(3600);
  });

  test('RS256 imzası service account anahtarıyla doğrulanabilir', () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
    const jwt = signJwt(buildClaim('sa@proje.iam.gserviceaccount.com', 1_000_000), pem);

    const [head, body, sig] = jwt.split('.');
    expect(JSON.parse(Buffer.from(head, 'base64url').toString())).toEqual({ alg: 'RS256', typ: 'JWT' });
    expect(JSON.parse(Buffer.from(body, 'base64url').toString()).iat).toBe(1_000_000);

    const ok = createVerify('RSA-SHA256').update(`${head}.${body}`).verify(publicKey, Buffer.from(sig, 'base64url'));
    expect(ok).toBe(true);
  });

  test('base64url dolgusu ve URL güvenli olmayan karakter bırakmaz', () => {
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const jwt = signJwt(
      buildClaim('a@b.iam.gserviceaccount.com', 1),
      privateKey.export({ type: 'pkcs8', format: 'pem' }) as string,
    );
    expect(jwt).not.toMatch(/[+/=]/);
  });
});

describe('toRows', () => {
  const api = [{ keys: ['web tasarım'], clicks: 4, impressions: 210, ctr: 0.019047, position: 8.4321 }];

  test('boyutları isimli alanlara açar', () => {
    expect(toRows(['query'], api)[0].query).toBe('web tasarım');
    expect(toRows(['page', 'device'], [{ keys: ['https://x/y', 'MOBILE'] }])[0]).toMatchObject({
      page: 'https://x/y',
      device: 'MOBILE',
    });
  });

  test('CTR oranı yüzdeye çevrilir — sources.mjs eşikleri yüzde bekliyor', () => {
    expect(toRows(['query'], api)[0].ctr).toBe(1.9);
  });

  test('konumu iki basamağa yuvarlar', () => {
    expect(toRows(['query'], api)[0].position).toBe(8.43);
  });

  test('eksik alanları sıfırlar, satır düşürmez', () => {
    expect(toRows(['query'], [{ keys: ['x'] }])[0]).toMatchObject({ clicks: 0, impressions: 0, ctr: 0, position: 0 });
  });

  test('satır yoksa boş dizi döner', () => {
    expect(toRows(['query'], undefined)).toEqual([]);
  });
});

describe('toCsv', () => {
  test('başlık satırı ve alanları yazar', () => {
    expect(toCsv([{ query: 'a', clicks: 1 }])).toBe('query,clicks\na,1\n');
  });

  test('virgül, tırnak ve satır sonunu kaçırır', () => {
    expect(toCsv([{ query: 'web, "iyi"' }])).toBe('query\n"web, ""iyi"""\n');
  });

  test('satır yoksa boş dosya üretir', () => {
    expect(toCsv([])).toBe('');
  });
});

describe('uçtan uca biçim sözleşmesi', () => {
  test('yazılan CSV, sources.mjs tarafından okunup sınıflandırılabilir', () => {
    const csv = toCsv(
      toRows(
        ['query'],
        [
          { keys: ['saglik turizmi ajansi'], clicks: 2, impressions: 300, ctr: 0.0067, position: 6.2 },
          { keys: ['pixelon'], clicks: 40, impressions: 60, ctr: 0.667, position: 1.1 },
          { keys: ['kurumsal web tasarım'], clicks: 0, impressions: 90, ctr: 0, position: 14.8 },
        ],
      ),
    );
    const buckets = classifyQueries(parseCsv(csv));

    expect(buckets.quickWin.map((r) => r.q)).toEqual(['saglik turizmi ajansi']);
    expect(buckets.strikingDistance.map((r) => r.q)).toEqual(['kurumsal web tasarım']);
    expect(buckets.ctrOpportunity.map((r) => r.q)).toEqual(['saglik turizmi ajansi']);
    expect(buckets.brand.map((r) => r.q)).toEqual(['pixelon']);
  });
});
