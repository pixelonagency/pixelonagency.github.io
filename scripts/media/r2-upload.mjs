#!/usr/bin/env bun
/**
 * `public/media/**` → Cloudflare R2 yükleyicisi.
 *
 * NEDEN ELDE YAZILDI: R2, S3 uyumlu bir API sunuyor ama `@aws-sdk/client-s3`
 * bağımlılığı ~15 MB'lık bir ağaç getiriyor ve bu depo üretim bağımlılıklarını
 * bilinçli olarak üçte tutuyor. İhtiyacımız tek bir imza şeması (SigV4) ve iki
 * istek tipi (ListObjectsV2 + PutObject); ikisi de `node:crypto` ile yüz satıra
 * sığıyor. Wrangler'ın `r2 object put` komutu da vardı ama dosya başına bir
 * süreç açıyor, değişmeyen dosyayı atlamıyor ve Content-Type'ı kendi tahmin
 * etmiyor.
 *
 * NEDEN "yalnızca değişeni yükle": 192 MB'lık klasörün tamamını her seferinde
 * yollamak hem yavaş hem de R2 A-sınıfı işlem kotasını boşuna yiyor. Uzak
 * envanter TEK bir ListObjectsV2 çağrısıyla alınır (114 HEAD isteği yerine) ve
 * boyut + ETag (tek parça yüklemede = MD5) karşılaştırılır.
 *
 * KİMLİK BİLGİSİ: yalnızca ortam değişkeninden okunur, asla dosyadan/argümandan.
 * Eksikse betik UYDURMAZ — hangi değişkenin eksik olduğunu yazıp 1 ile çıkar.
 *
 * Kullanım:
 *   bun scripts/media/r2-upload.mjs --dry-run
 *   bun scripts/media/r2-upload.mjs
 *   bun scripts/media/r2-upload.mjs --force --concurrency 8
 *
 * Ayrıntılı runbook (bucket açma, alan adı, CORS, token kapsamı, geri alma):
 *   scripts/media/README.md
 */

import { createHash, createHmac } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// --- sabitler --------------------------------------------------------------

const REPO_ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));

/** Yüklenecek kaynak klasör. Anahtarlar BU klasöre göre görelidir. */
export const DEFAULT_SOURCE_DIR = join(REPO_ROOT, 'public', 'media');

/**
 * Bir yıl + `immutable`.
 *
 * `public/_headers` içinde `/media/*` bir AY cache'leniyor çünkü dosyalar parmak
 * izli değil ve aynı isimle değiştirilebiliyorlar. R2'de daha uzun süre veriyoruz
 * ama bunun bir bedeli var: bir dosyayı aynı isimle değiştirirsen tarayıcıda bir
 * yıl eski sürüm kalır. Kural: R2'ye taşındıktan sonra medya İÇERİĞİ değişiyorsa
 * DOSYA ADI da değişir (ya da `PUBLIC_MEDIA_BASE` sürümlenir: `.../v2`).
 */
export const CACHE_CONTROL = 'public, max-age=31536000, immutable';

/**
 * Uzantı → Content-Type.
 *
 * R2 gönderilen Content-Type'ı olduğu gibi saklar; göndermezsek
 * `application/octet-stream` yazar ve tarayıcı videoyu OYNATMAK yerine indirir.
 * Bu yüzden eşleşmeyen uzantıda sessizce varsayılana düşmek yerine hata veririz.
 */
const CONTENT_TYPES = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.vtt': 'text/vtt; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

/** Klasörde işe yaramayan, yüklenmemesi gereken dosyalar. */
const IGNORED_NAMES = new Set(['.DS_Store', 'Thumbs.db', '.gitkeep']);

// --- saf yardımcılar (test edilir) -----------------------------------------

/**
 * Dosya adından Content-Type üretir. Bilinmeyen uzantı `undefined` döner —
 * çağıran taraf bunu HATA sayar; sessiz `octet-stream` videoyu indirilebilir
 * dosyaya çevirir ve kimse fark etmez.
 */
export function contentTypeFor(name) {
  const dot = name.lastIndexOf('.');
  if (dot < 0) return undefined;
  return CONTENT_TYPES[name.slice(dot).toLowerCase()];
}

/**
 * Göreli dosya yolundan nesne anahtarı üretir.
 *
 * Anahtar `public/media/` klasörüne GÖRE tutulur (`reels/kolajen.mp4`), çünkü
 * `src/lib/media.ts` taban adresi `/media` önekinin YERİNE koyar. İkisi aynı
 * varsayımı paylaşmalı, yoksa `.../media/media/...` gibi çift önek oluşur.
 */
export function toObjectKey(relativePath, keyPrefix = '') {
  const normalized = relativePath.split(/[\\/]/).filter(Boolean).join('/');
  const prefix = keyPrefix.replace(/^\/+|\/+$/g, '');
  return prefix ? `${prefix}/${normalized}` : normalized;
}

/**
 * Yerel dosya uzaktakinden farklı mı?
 *
 * ETag tek parça (PutObject) yüklemede içeriğin MD5'idir; bu betik her zaman tek
 * parça yüklediği için karşılaştırma güvenilirdir. Ama nesne başka bir araçla
 * (rclone, panel) çok parçalı yüklendiyse ETag `-3` gibi bir sonek taşır ve MD5
 * DEĞİLDİR. O durumda ETag'e güvenmek yerine yalnızca boyuta bakarız: yanlış
 * "değişmemiş" demektense fazladan yükleme yapmak daha ucuzdur.
 */
export function needsUpload(local, remote, options = {}) {
  if (options.force) return { upload: true, reason: 'force' };
  if (!remote) return { upload: true, reason: 'yeni' };
  if (remote.size !== local.size) return { upload: true, reason: 'boyut farklı' };
  if (remote.etag.includes('-')) return { upload: true, reason: 'çok parçalı ETag — doğrulanamıyor' };
  if (remote.etag.toLowerCase() !== local.md5) return { upload: true, reason: 'içerik farklı' };
  return { upload: false, reason: 'değişmemiş' };
}

/**
 * AWS'nin beklediği yol kodlaması: her segment ayrı kodlanır, eğik çizgiler
 * korunur. `encodeURIComponent` `!'()*` karakterlerini bırakır; AWS bunları da
 * kodlanmış ister, yoksa imza tutmaz.
 */
export function encodeUriPath(path) {
  return path
    .split('/')
    .map((segment) =>
      encodeURIComponent(segment).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`),
    )
    .join('/');
}

/** Kanonik sorgu dizesi: anahtar adına göre sıralı, her iki taraf da kodlanmış. */
export function canonicalQueryString(params) {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => [encodeURIComponent(key), encodeURIComponent(String(value))])
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
}

/** `2026-09-01T12:34:56.789Z` → `20260901T123456Z` (AWS'nin istediği biçim). */
export function amzDate(date) {
  return date
    .toISOString()
    .replace(/[:-]/g, '')
    .replace(/\.\d{3}/, '');
}

const sha256Hex = (data) => createHash('sha256').update(data).digest('hex');
const hmac = (key, data) => createHmac('sha256', key).update(data, 'utf8').digest();

/**
 * SigV4 imzalama anahtarı: tarih → bölge → servis → `aws4_request` zinciri.
 * Ayrı export edilmesinin nedeni AWS'nin yayımladığı referans vektörüyle test
 * edilebilmesi; imza kodunun sessizce yanlış olması, ilk gerçek çalıştırmada
 * anlaşılmaz bir 403 olarak geri döner.
 */
export function signingKey(secretAccessKey, dateStamp, region, service) {
  let key = hmac(`AWS4${secretAccessKey}`, dateStamp);
  key = hmac(key, region);
  key = hmac(key, service);
  return hmac(key, 'aws4_request');
}

/**
 * İsteği SigV4 ile imzalar ve gönderilecek başlık kümesini döndürür.
 *
 * `host` ve `x-amz-date` her zaman imzalanır. Diğer her şey — `x-amz-content-sha256`
 * dahil — çağıranın verdiği `headers` kümesinden gelir. `x-amz-content-sha256`'ın
 * burada zorla eklenmemesinin nedeni test edilebilirlik: AWS'nin yayımladığı
 * referans imza vektörleri o başlığı taşımaz, zorla eklenirse imza kodu bilinen
 * bir doğru cevaba karşı doğrulanamaz. R2 çağrılarının hepsi başlığı geçirir.
 */
export function signRequest({
  method,
  host,
  path,
  query = '',
  headers = {},
  payloadHash,
  accessKeyId,
  secretAccessKey,
  region = 'auto',
  service = 's3',
  date,
}) {
  const stamp = amzDate(date);
  const dateStamp = stamp.slice(0, 8);

  const all = { host, 'x-amz-date': stamp, ...headers };
  const entries = Object.entries(all)
    .map(([key, value]) => [key.toLowerCase(), String(value).trim().replace(/\s+/g, ' ')])
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));

  const signedHeaders = entries.map(([key]) => key).join(';');
  const canonicalHeaders = entries.map(([key, value]) => `${key}:${value}\n`).join('');
  const canonicalRequest = [method, path, query, canonicalHeaders, signedHeaders, payloadHash].join('\n');

  const scope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', stamp, scope, sha256Hex(canonicalRequest)].join('\n');
  const signature = createHmac('sha256', signingKey(secretAccessKey, dateStamp, region, service))
    .update(stringToSign, 'utf8')
    .digest('hex');

  return {
    ...all,
    authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
}

/**
 * ListObjectsV2 yanıtını (XML) ayrıştırır.
 *
 * XML ayrıştırıcı bağımlılığı eklemiyoruz: yanıt şeması sabit ve alanlar
 * (Key/Size/ETag) düz metin. Anahtarlarda XML kaçışı gerektiren karakter
 * bulunabileceği için `&amp;` ve arkadaşları geri çevrilir.
 */
export function parseListObjects(xml) {
  const contents = [...xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)].map((match) => {
    const block = match[1];
    const field = (name) => {
      const found = new RegExp(`<${name}>([\\s\\S]*?)</${name}>`).exec(block);
      return found ? found[1] : '';
    };
    return {
      key: unescapeXml(field('Key')),
      size: Number(field('Size')),
      etag: unescapeXml(field('ETag')).replace(/^"|"$/g, ''),
    };
  });

  const truncated = /<IsTruncated>\s*true\s*<\/IsTruncated>/i.test(xml);
  const tokenMatch = /<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/.exec(xml);
  return { contents, truncated, nextToken: tokenMatch ? unescapeXml(tokenMatch[1]) : undefined };
}

function unescapeXml(value) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

/** Komut satırı bayrakları. Bilinmeyen bayrak sessizce yutulmaz. */
export function parseArgs(argv) {
  const options = { dryRun: false, force: false, concurrency: 4, keyPrefix: '', dir: DEFAULT_SOURCE_DIR };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--force') options.force = true;
    else if (arg === '--concurrency') options.concurrency = Math.max(1, Number(argv[++index]) || 1);
    else if (arg === '--key-prefix') options.keyPrefix = String(argv[++index] ?? '');
    else if (arg === '--dir') options.dir = resolve(String(argv[++index] ?? ''));
    else throw new Error(`bilinmeyen bayrak: ${arg}`);
  }
  return options;
}

/**
 * Ortamdan kimlik bilgilerini toplar. Eksik olanların listesini döndürür —
 * hangi değişkenin eksik olduğunu söylemeyen bir hata mesajı işe yaramaz.
 */
export function readCredentials(env) {
  const names = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET'];
  const missing = names.filter((name) => !String(env[name] ?? '').trim());
  if (missing.length > 0) return { missing };
  return {
    missing: [],
    accountId: env.R2_ACCOUNT_ID.trim(),
    accessKeyId: env.R2_ACCESS_KEY_ID.trim(),
    secretAccessKey: env.R2_SECRET_ACCESS_KEY.trim(),
    bucket: env.R2_BUCKET.trim(),
  };
}

// --- G/Ç -------------------------------------------------------------------

/** Klasörü özyinelemeli tarar; göreli yolları sıralı döndürür. */
export async function collectFiles(dir, base = dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (IGNORED_NAMES.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await collectFiles(full, base)));
    else if (entry.isFile()) out.push(relative(base, full));
  }
  return out.sort();
}

async function fetchRemoteInventory({ endpointHost, bucket, prefix, credentials }) {
  const inventory = new Map();
  let token;

  do {
    const query = canonicalQueryString({
      'list-type': 2,
      'max-keys': 1000,
      prefix: prefix || undefined,
      'continuation-token': token,
    });
    const path = `/${encodeUriPath(bucket)}`;
    const payloadHash = sha256Hex('');
    const headers = signRequest({
      method: 'GET',
      host: endpointHost,
      path,
      query,
      payloadHash,
      headers: { 'x-amz-content-sha256': payloadHash },
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      date: new Date(),
    });

    // `host` imzaya girer ama fetch'e VERİLMEZ: yasaklı başlıktır, çalışma zamanı
    // kendi Host satırını yazar; ikisini birden göndermek isteği bozabilir.
    const { host: _host, ...wireHeaders } = headers;
    const response = await fetch(`https://${endpointHost}${path}?${query}`, { method: 'GET', headers: wireHeaders });
    const body = await response.text();
    if (!response.ok) {
      throw new Error(`ListObjectsV2 başarısız (${response.status}): ${body.slice(0, 400)}`);
    }

    const parsed = parseListObjects(body);
    for (const item of parsed.contents) inventory.set(item.key, item);
    token = parsed.truncated ? parsed.nextToken : undefined;
  } while (token);

  return inventory;
}

async function putObject({ endpointHost, bucket, key, body, contentType, credentials }) {
  const path = `/${encodeUriPath(bucket)}/${encodeUriPath(key)}`;
  const payloadHash = sha256Hex(body);
  const headers = signRequest({
    method: 'PUT',
    host: endpointHost,
    path,
    payloadHash,
    headers: {
      'content-type': contentType,
      'cache-control': CACHE_CONTROL,
      'x-amz-content-sha256': payloadHash,
    },
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    date: new Date(),
  });

  const { host: _host, ...wireHeaders } = headers;
  const response = await fetch(`https://${endpointHost}${path}`, { method: 'PUT', headers: wireHeaders, body });
  if (!response.ok) {
    throw new Error(`PUT ${key} başarısız (${response.status}): ${(await response.text()).slice(0, 400)}`);
  }
}

/** Basit havuz: aynı anda en fazla `limit` iş. */
async function runPool(items, limit, worker) {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      await worker(items[index], index);
    }
  });
  await Promise.all(workers);
}

/** Küçük dosyalarda "0.0 MB" bilgi vermiyordu; ölçek otomatik seçilir. */
const formatSize = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// --- ana akış --------------------------------------------------------------

export async function main(argv = process.argv.slice(2), env = process.env) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    console.error(`HATA: ${error.message}`);
    console.error('Kullanım: bun scripts/media/r2-upload.mjs [--dry-run] [--force] [--concurrency N] [--key-prefix P]');
    return 1;
  }

  const credentials = readCredentials(env);

  if (credentials.missing.length > 0 && !options.dryRun) {
    console.error('HATA: R2 kimlik bilgileri eksik. Şu ortam değişkenleri tanımlı değil:');
    for (const name of credentials.missing) console.error(`  - ${name}`);
    console.error('');
    console.error('Bu makinede Cloudflare kimlik bilgisi TUTULMAZ; değerleri kabuk oturumuna');
    console.error('elle verin (tarihçeye yazılmaması için baştaki boşluğa dikkat) veya CI');
    console.error("secret'ından okutun. Kurulum adımları: scripts/media/README.md");
    return 1;
  }

  // Yerel envanter
  let relativePaths;
  try {
    relativePaths = await collectFiles(options.dir);
  } catch (error) {
    console.error(`HATA: kaynak klasör okunamadı (${options.dir}): ${error.message}`);
    return 1;
  }
  if (relativePaths.length === 0) {
    console.error(`HATA: ${options.dir} altında yüklenecek dosya yok.`);
    return 1;
  }

  const files = [];
  const unknownTypes = [];
  for (const relativePath of relativePaths) {
    const full = join(options.dir, relativePath);
    const contentType = contentTypeFor(relativePath);
    if (!contentType) {
      unknownTypes.push(relativePath);
      continue;
    }
    const info = await stat(full);
    files.push({ relativePath, full, size: info.size, key: toObjectKey(relativePath, options.keyPrefix), contentType });
  }

  if (unknownTypes.length > 0) {
    console.error('HATA: Content-Type eşlemesi olmayan dosya(lar) var. Sessizce octet-stream göndermek');
    console.error('videoyu tarayıcıda oynatılmak yerine indirilir hâle getirir. CONTENT_TYPES tablosuna ekleyin:');
    for (const name of unknownTypes) console.error(`  - ${name}`);
    return 1;
  }

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  console.log(`Kaynak : ${options.dir}`);
  console.log(`Dosya  : ${files.length} (${formatSize(totalBytes)})`);
  if (options.keyPrefix) console.log(`Önek   : ${options.keyPrefix}/`);

  const offline = credentials.missing.length > 0;
  let remote = new Map();

  if (offline) {
    console.log('');
    console.log('UYARI: kimlik bilgisi yok — UZAK KARŞILAŞTIRMA YAPILMADI.');
    console.log(`Eksik: ${credentials.missing.join(', ')}`);
    console.log('Aşağıdaki liste yalnızca yerel plandır; hangi dosyanın gerçekten değiştiği bilinmiyor.');
  } else {
    const endpointHost = `${credentials.accountId}.r2.cloudflarestorage.com`;
    try {
      remote = await fetchRemoteInventory({
        endpointHost,
        bucket: credentials.bucket,
        prefix: options.keyPrefix ? `${options.keyPrefix.replace(/^\/+|\/+$/g, '')}/` : '',
        credentials,
      });
    } catch (error) {
      console.error(`HATA: uzak envanter alınamadı — ${error.message}`);
      return 1;
    }
    console.log(`Bucket : ${credentials.bucket} (uzakta ${remote.size} nesne)`);
  }

  /*
   * Değişiklik kararı. Dosya içeriği burada TUTULMAZ, yalnızca MD5'i alınır:
   * 120 dosyanın tamamını (191 MB) bellekte tutmak gereksiz. Gerçekten
   * yüklenecek olanlar yükleme anında tekrar okunur.
   */
  const planned = [];
  for (const file of files) {
    const md5 = createHash('md5')
      .update(await readFile(file.full))
      .digest('hex');
    const decision = needsUpload({ size: file.size, md5 }, remote.get(file.key), { force: options.force });
    if (decision.upload) planned.push({ ...file, reason: offline ? 'uzak durum bilinmiyor' : decision.reason });
  }

  // Uzakta olup yerelde olmayanlar: silinmez, yalnızca raporlanır. Otomatik
  // silme, yanlış bir `--key-prefix` ile bütün bucket'ı boşaltabilirdi.
  const localKeys = new Set(files.map((file) => file.key));
  const orphans = [...remote.keys()].filter((key) => !localKeys.has(key));

  console.log('');
  if (planned.length === 0) {
    console.log('Yüklenecek dosya yok — uzak kopya güncel.');
  } else {
    const plannedBytes = planned.reduce((sum, file) => sum + file.size, 0);
    console.log(
      `${options.dryRun ? 'YÜKLENECEK (deneme)' : 'YÜKLENİYOR'}: ${planned.length} dosya, ${formatSize(plannedBytes)}`,
    );
    for (const file of planned) console.log(`  ${file.key}  [${file.reason}, ${formatSize(file.size)}]`);
  }

  if (orphans.length > 0) {
    console.log('');
    console.log(`Uzakta olup yerelde OLMAYAN ${orphans.length} nesne (silinmedi — elle karar verin):`);
    for (const key of orphans) console.log(`  ${key}`);
  }

  if (options.dryRun) {
    console.log('');
    console.log('--dry-run: hiçbir şey yazılmadı.');
    return 0;
  }

  if (planned.length === 0) return 0;

  const endpointHost = `${credentials.accountId}.r2.cloudflarestorage.com`;
  let done = 0;
  let failed = 0;
  await runPool(planned, options.concurrency, async (file) => {
    try {
      await putObject({
        endpointHost,
        bucket: credentials.bucket,
        key: file.key,
        body: await readFile(file.full),
        contentType: file.contentType,
        credentials,
      });
      done += 1;
      console.log(`  ✓ ${file.key} (${done}/${planned.length})`);
    } catch (error) {
      failed += 1;
      console.error(`  ✗ ${file.key} — ${error.message}`);
    }
  });

  console.log('');
  console.log(`Bitti: ${done} yüklendi, ${failed} başarısız.`);
  return failed > 0 ? 1 : 0;
}

// Doğrudan çalıştırıldığında ana akışı işlet; import edildiğinde (test) işletme.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(await main());
}
