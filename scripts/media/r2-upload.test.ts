import { describe, expect, test } from 'bun:test';
// Betik saf JS (.mjs); tsconfig `allowJs` sayesinde tipler çıkarımla gelir.
import {
  amzDate,
  canonicalQueryString,
  contentTypeFor,
  encodeUriPath,
  needsUpload,
  parseArgs,
  parseListObjects,
  readCredentials,
  signRequest,
  signingKey,
  toObjectKey,
} from './r2-upload.mjs';

/**
 * İmza kodu bu betiğin en kırılgan yeri: bir karakterlik hata, ilk gerçek
 * çalıştırmada gerekçesiz bir `403 SignatureDoesNotMatch` olarak geri döner ve
 * hata ayıklaması saatler alır. Bu yüzden AWS'nin YAYIMLADIĞI referans
 * vektörlerine karşı doğrulanır — sahibin token'ı geldiğinde imza kodunun
 * doğruluğu zaten kanıtlanmış olur.
 */
describe('SigV4', () => {
  const SECRET = 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY';

  test('AWS dokümanındaki imzalama anahtarı türetme örneğini üretir', () => {
    // AWS Signature Version 4 dokümanı, "derive a signing key" örneği.
    expect(signingKey(SECRET, '20120215', 'us-east-1', 'iam').toString('hex')).toBe(
      'f4780e2d9f65fa895f9c67b32ce1baf0b0d8a43505a000a1a9e090d414db404d',
    );
  });

  test('aws-sig-v4-test-suite / get-vanilla imzasını üretir', () => {
    const headers = signRequest({
      method: 'GET',
      host: 'example.amazonaws.com',
      path: '/',
      query: '',
      headers: {},
      payloadHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      accessKeyId: 'AKIDEXAMPLE',
      secretAccessKey: SECRET,
      region: 'us-east-1',
      service: 'service',
      date: new Date('2015-08-30T12:36:00.000Z'),
    });

    expect(headers.authorization).toBe(
      'AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE/20150830/us-east-1/service/aws4_request, ' +
        'SignedHeaders=host;x-amz-date, ' +
        'Signature=5fa00fa31553b73ebf1942676e86291e8372ff2a2260956d9b8aae1d763fbf31',
    );
  });

  test('ek başlıklar imzaya girer ve SignedHeaders alfabetik sıralanır', () => {
    const headers = signRequest({
      method: 'PUT',
      host: 'acct.r2.cloudflarestorage.com',
      path: '/pixelon-media/reels/kolajen.mp4',
      payloadHash: 'abc',
      headers: {
        'content-type': 'video/mp4',
        'cache-control': 'public, max-age=31536000, immutable',
        'x-amz-content-sha256': 'abc',
      },
      accessKeyId: 'KEY',
      secretAccessKey: SECRET,
      date: new Date('2026-09-01T00:00:00.000Z'),
    });

    expect(headers.authorization).toContain(
      'SignedHeaders=cache-control;content-type;host;x-amz-content-sha256;x-amz-date',
    );
    expect(headers.authorization).toContain('Credential=KEY/20260901/auto/s3/aws4_request');
    expect(headers['x-amz-date']).toBe('20260901T000000Z');
  });

  test('tarih biçimi AWS kalıbına uyar', () => {
    expect(amzDate(new Date('2026-09-01T12:34:56.789Z'))).toBe('20260901T123456Z');
  });
});

describe('encodeUriPath', () => {
  test('eğik çizgileri korur, segmentleri kodlar', () => {
    expect(encodeUriPath('reels/kolajen.mp4')).toBe('reels/kolajen.mp4');
    expect(encodeUriPath('hero/dijital reklam/a.mp4')).toBe('hero/dijital%20reklam/a.mp4');
  });

  /* encodeURIComponent bu karakterleri bırakır; AWS kodlanmış ister. */
  test("encodeURIComponent'in bıraktığı karakterleri de kodlar", () => {
    expect(encodeUriPath("a!b'c(d)e*f.mp4")).toBe('a%21b%27c%28d%29e%2Af.mp4');
  });
});

describe('canonicalQueryString', () => {
  test('anahtara göre sıralar ve tanımsızları atar', () => {
    expect(canonicalQueryString({ 'max-keys': 1000, 'list-type': 2, prefix: undefined })).toBe(
      'list-type=2&max-keys=1000',
    );
  });

  test('devam belirtecini kodlar', () => {
    expect(canonicalQueryString({ 'continuation-token': 'a/b+c=' })).toBe('continuation-token=a%2Fb%2Bc%3D');
  });
});

/**
 * Yanlış Content-Type, videoyu tarayıcıda oynatılabilir olmaktan çıkarıp
 * indirilen bir dosyaya çevirir; sessizce `octet-stream`'e düşmek yerine
 * bilinmeyen uzantı `undefined` döner ve betik durur.
 */
describe('contentTypeFor', () => {
  test('medya uzantılarını doğru eşler', () => {
    expect(contentTypeFor('kolajen.mp4')).toBe('video/mp4');
    expect(contentTypeFor('hero-marka-desktop.webm')).toBe('video/webm');
    expect(contentTypeFor('hero-marka-desktop-poster.webp')).toBe('image/webp');
    expect(contentTypeFor('KOLAJEN.MP4')).toBe('video/mp4');
  });

  test('bilinmeyen ve uzantısız dosyada tanımsız döner', () => {
    expect(contentTypeFor('notlar.psd')).toBeUndefined();
    expect(contentTypeFor('LICENSE')).toBeUndefined();
  });
});

/**
 * Anahtar `public/media/` klasörüne göre görelidir; `src/lib/media.ts` taban
 * adresi `/media` önekinin YERİNE koyduğu için önek tekrar edilmemelidir.
 */
describe('toObjectKey', () => {
  test('göreli yolu olduğu gibi anahtara çevirir', () => {
    expect(toObjectKey('reels/kolajen.mp4')).toBe('reels/kolajen.mp4');
    expect(toObjectKey('hero/marka/hero-marka-desktop.mp4')).toBe('hero/marka/hero-marka-desktop.mp4');
  });

  test('Windows ayracını normalize eder', () => {
    expect(toObjectKey('hero\\marka\\a.mp4')).toBe('hero/marka/a.mp4');
  });

  test('sürüm öneki verilirse başa ekler', () => {
    expect(toObjectKey('reels/kolajen.mp4', 'v2')).toBe('v2/reels/kolajen.mp4');
    expect(toObjectKey('reels/kolajen.mp4', '/v2/')).toBe('v2/reels/kolajen.mp4');
  });
});

describe('needsUpload', () => {
  const local = { size: 100, md5: 'aabb' };

  test('uzakta yoksa yükler', () => {
    expect(needsUpload(local, undefined).upload).toBe(true);
  });

  test('boyut ve ETag aynıysa atlar', () => {
    expect(needsUpload(local, { size: 100, etag: 'aabb' }).upload).toBe(false);
    expect(needsUpload(local, { size: 100, etag: 'AABB' }).upload).toBe(false);
  });

  test('boyut ya da içerik farklıysa yükler', () => {
    expect(needsUpload(local, { size: 101, etag: 'aabb' }).upload).toBe(true);
    expect(needsUpload(local, { size: 100, etag: 'ccdd' }).upload).toBe(true);
  });

  /* Çok parçalı yüklenmiş nesnenin ETag'i MD5 değildir; ona güvenilmez. */
  test('çok parçalı ETag doğrulanamaz sayılır', () => {
    expect(needsUpload(local, { size: 100, etag: 'aabb-3' }).upload).toBe(true);
  });

  test('--force her şeyi yeniden yükler', () => {
    expect(needsUpload(local, { size: 100, etag: 'aabb' }, { force: true }).upload).toBe(true);
  });
});

describe('parseListObjects', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ListBucketResult>
  <IsTruncated>true</IsTruncated>
  <NextContinuationToken>tok&amp;en</NextContinuationToken>
  <Contents><Key>reels/kolajen.mp4</Key><Size>1234</Size><ETag>&quot;deadbeef&quot;</ETag></Contents>
  <Contents><Key>hero/marka/a.webm</Key><Size>9</Size><ETag>&quot;cafe-2&quot;</ETag></Contents>
</ListBucketResult>`;

  test('anahtar, boyut ve tırnaksız ETag çıkarır', () => {
    const parsed = parseListObjects(xml);
    expect(parsed.contents).toEqual([
      { key: 'reels/kolajen.mp4', size: 1234, etag: 'deadbeef' },
      { key: 'hero/marka/a.webm', size: 9, etag: 'cafe-2' },
    ]);
  });

  test('sayfalama bilgisini okur ve XML kaçışını çözer', () => {
    const parsed = parseListObjects(xml);
    expect(parsed.truncated).toBe(true);
    expect(parsed.nextToken).toBe('tok&en');
  });

  test('boş bucket yanıtını sorunsuz işler', () => {
    const parsed = parseListObjects('<ListBucketResult><IsTruncated>false</IsTruncated></ListBucketResult>');
    expect(parsed.contents).toEqual([]);
    expect(parsed.truncated).toBe(false);
  });
});

describe('parseArgs', () => {
  test('varsayılanlar güvenlidir (yükleme yapmaz demez ama zorlamaz)', () => {
    const options = parseArgs([]);
    expect(options.dryRun).toBe(false);
    expect(options.force).toBe(false);
    expect(options.concurrency).toBe(4);
    expect(options.keyPrefix).toBe('');
  });

  test('bayrakları okur', () => {
    const options = parseArgs(['--dry-run', '--force', '--concurrency', '8', '--key-prefix', 'v2']);
    expect(options).toMatchObject({ dryRun: true, force: true, concurrency: 8, keyPrefix: 'v2' });
  });

  /* Yazım hatası olan bir bayrak sessizce yutulursa (örn. `--dryrun`) betik
     gerçek yükleme yapar. Bilinmeyen bayrak hata olmalıdır. */
  test('bilinmeyen bayrakta hata verir', () => {
    expect(() => parseArgs(['--dryrun'])).toThrow();
  });
});

/**
 * Kimlik bilgisi eksikse betik "uydurmaz": hangi değişkenin eksik olduğunu
 * isim isim söyler. Bu makinede Cloudflare kimlik bilgisi TUTULMAZ.
 */
describe('readCredentials', () => {
  test('eksik değişkenleri isimleriyle bildirir', () => {
    expect(readCredentials({}).missing).toEqual([
      'R2_ACCOUNT_ID',
      'R2_ACCESS_KEY_ID',
      'R2_SECRET_ACCESS_KEY',
      'R2_BUCKET',
    ]);
    expect(readCredentials({ R2_ACCOUNT_ID: 'a', R2_ACCESS_KEY_ID: 'b', R2_SECRET_ACCESS_KEY: 'c' }).missing).toEqual([
      'R2_BUCKET',
    ]);
  });

  test('boş dizeyi tanımlı saymaz', () => {
    expect(readCredentials({ R2_BUCKET: '   ' }).missing).toContain('R2_BUCKET');
  });

  test('tamamı verilince değerleri kırpar', () => {
    const credentials = readCredentials({
      R2_ACCOUNT_ID: ' acct ',
      R2_ACCESS_KEY_ID: 'key',
      R2_SECRET_ACCESS_KEY: 'secret',
      R2_BUCKET: 'pixelon-media',
    });
    expect(credentials.missing).toEqual([]);
    expect(credentials.accountId).toBe('acct');
    expect(credentials.bucket).toBe('pixelon-media');
  });
});
