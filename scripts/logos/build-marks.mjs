/**
 * Referans duvarı için tek renk logo maskeleri üretir.
 *
 * Duvardaki her logo CSS'te TEK bir renkle boyanır (`mask-image` + `currentColor`),
 * bu yüzden çıktı bir alfa maskesidir: mürekkep beyaz, zemin saydam. Kaynak SVG'nin
 * kendi renkleri, gömülü rasterleri veya opak zemini sonucu etkilemez.
 *
 * İKİ ÖNEMLİ NOKTA
 * 1. Bazı kaynaklarda logo, gömülü bir PNG'nin İÇİNDE opak (beyaz/krem) zeminle
 *    gelir; alfa doğrudan maske olarak kullanılamaz. `INK_FROM_LUMINANCE` listesindeki
 *    dosyalarda maske parlaklıktan çıkarılır: koyu piksel = mürekkep.
 * 2. Logolar farklı en-boy oranlarında (10:1 ile 0,8:1 arası). Kutuya "contain"
 *    sığdırmak geniş logoyu dev, kare logoyu cüce gösterir. Bu yüzden her mürekkep
 *    kutusu GEOMETRİK ORTALAMASI sabitlenerek ölçeklenir (optik denge) ve sabit
 *    boyutlu bir tuvale ortalanır — CSS tarafında hepsi aynı kutuyu paylaşır.
 *
 * Kullanım: bun scripts/logos/build-marks.mjs <kaynak-svg-klasörü>
 */
import sharp from 'sharp';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_DIR = path.join(ROOT, 'src/assets/client-logos/marks');

/** Tuval ve optik ölçek — 2x. CSS kutusu 440x170 olarak kurgulanmıştır. */
const CANVAS_W = 880;
const CANVAS_H = 340;
const MAX_W = 800;
const MAX_H = 300;
/** Ölçek hedefi: sqrt(genişlik × yükseklik). Sabit tutulunca logolar eşit "ağırlıkta" görünür. */
const OPTICAL_TARGET = 262;

/** Opak zeminli kaynaklar — maske alfadan değil parlaklıktan çıkarılır. */
const INK_FROM_LUMINANCE = new Set(['derinderehastane-logo.svg', 'seranatura.svg']);

/*
 * İçinde AÇIK RENKLİ OYMA taşıyan kaynaklar (Sekoya'nın turuncu altıgenindeki beyaz "S",
 * Vennyx'in koyu dairesindeki açık düğüm). Alfa doğrudan alınırsa oyma dolar ve logo
 * anlamsız bir blok olur; bu dosyalarda açık pikseller maskeden düşülür.
 * Liste bilerek açıktır: mürekkebi zaten beyaz olan logolarda (Opet, Dentasay…) aynı
 * kural her şeyi silerdi.
 */
const KNOCKOUT_LIGHT = new Set(['sekoya-logo.svg', 'vennyxlogo.svg']);

/** Kaynak dosya → referans girdisinin slug'ı. Sıra duvarda kullanılmaz (order alanı belirler). */
const MAP = [
  ['Annelik Hikayesi Logo.svg', 'annelik-hikayesi'],
  ['cayraclinic-loog.svg', 'cayra-clinic'],
  ['çağlaaytaçlogo.svg', 'cagla-aytac'],
  ['Dentasay Logo.svg', 'dentasay'],
  ['derinderehastane-logo.svg', 'derindere-hastane'],
  ['Dr Ayse Cinkaya Kahveci Logo.svg', 'dr-ayse-cinkaya-kahveci'],
  ['efsanemedlogo.svg', 'efsanemed'],
  ['Enda Clinic logo.svg', 'enda-clinic'],
  ['Hands For All Logo.svg', 'hands-for-all'],
  ['İstanbul Hairline logo.svg', 'istanbul-hairline'],
  ['Kosgeb logo.svg', 'kosgeb'],
  ['medistate-logo.svg', 'medistate'],
  ['Mobico logo.svg', 'mobico'],
  ['mustafasağlam logo.svg', 'mustafa-saglam'],
  ['nbkadıkoy-logo.svg', 'nb-kadikoy'],
  ['opdrismailbüyükçayır.svg', 'ismail-buyukcayir'],
  ['Opet Logo.svg', 'opet'],
  ['Ptt Logo.svg', 'ptt'],
  ['redexglasslogo.svg', 'redex-glass'],
  ['sekoya-logo.svg', 'sekoya'],
  ['seranatura.svg', 'sera-natura'],
  ['touch-logo.svg', 'touch-consulting'],
  ['valusetlogo.svg', 'valueset'],
  ['vennyxlogo.svg', 'vennyx'],
  ['xraygruplogo.svg', 'xray-groupe'],
  ['Zubizu-Logo.svg', 'zubizu'],
];

const srcDir = process.argv[2];
if (!srcDir) {
  console.error('Kullanım: bun scripts/logos/build-marks.mjs <kaynak-svg-klasörü>');
  process.exit(1);
}

/** Kaynağı yüksek çözünürlükte alfa maskesine çevirir (mürekkep = opak). */
async function toMask(file) {
  const raw = await sharp(file, { density: 600 })
    .resize({ width: 1400, height: 700, fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { data, info } = raw;
  const n = info.width * info.height;
  const alpha = Buffer.alloc(n);
  const name = path.basename(file);
  const fromLuminance = INK_FROM_LUMINANCE.has(name);
  const knockout = KNOCKOUT_LIGHT.has(name);
  for (let i = 0; i < n; i++) {
    const a = data[i * info.channels + 3];
    if (!fromLuminance && !knockout) {
      alpha[i] = a;
      continue;
    }
    const lum =
      0.299 * data[i * info.channels] + 0.587 * data[i * info.channels + 1] + 0.114 * data[i * info.channels + 2];
    // Koyu piksel = mürekkep. Krem/beyaz zemin saydamlaşır, ara tonlar yumuşak kalır.
    const ink = fromLuminance ? Math.max(0, Math.min(1, (235 - lum) / 120)) : 1;
    // Açık oyma alanları maskeden düşülür — form içindeki boşluk boşluk kalsın.
    const carve = knockout ? 1 - Math.max(0, Math.min(1, (lum - 150) / 80)) : 1;
    alpha[i] = Math.round(ink * carve * (a / 255) * 255);
  }
  return { alpha, width: info.width, height: info.height };
}

/** Maskenin dolu bölgesinin sınır kutusu — kaynaklardaki farklı iç boşluklar temizlenir. */
function inkBounds(alpha, width, height) {
  let top = height,
    left = width,
    right = -1,
    bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (alpha[y * width + x] > 12) {
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }
  if (right < 0) throw new Error('maske boş');
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

await mkdir(OUT_DIR, { recursive: true });
const report = [];

for (const [file, slug] of MAP) {
  const full = path.join(srcDir, file);
  if (!existsSync(full)) {
    console.error(`ATLANDI (kaynak yok): ${file}`);
    continue;
  }
  const { alpha, width, height } = await toMask(full);
  const box = inkBounds(alpha, width, height);

  // Beyaz mürekkep + hesaplanan alfa, sonra sınır kutusuna kırp.
  const trimmed = await sharp(Buffer.from(alpha), { raw: { width, height, channels: 1 } })
    .toColourspace('b-w')
    .raw()
    .toBuffer()
    .then((a) =>
      sharp({ create: { width, height, channels: 3, background: '#ffffff' } })
        .joinChannel(a, { raw: { width, height, channels: 1 } })
        .extract(box)
        .png()
        .toBuffer(),
    );

  // Optik ölçek: geometrik ortalama sabit, sonra kutu sınırlarına kısıl.
  let scale = OPTICAL_TARGET / Math.sqrt(box.width * box.height);
  scale = Math.min(scale, MAX_W / box.width, MAX_H / box.height);
  const w = Math.max(1, Math.round(box.width * scale));
  const h = Math.max(1, Math.round(box.height * scale));

  const scaled = await sharp(trimmed).resize(w, h, { fit: 'fill' }).png().toBuffer();
  const out = path.join(OUT_DIR, `${slug}-mark.webp`);
  await sharp({
    create: { width: CANVAS_W, height: CANVAS_H, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 0 } },
  })
    .composite([{ input: scaled, left: Math.round((CANVAS_W - w) / 2), top: Math.round((CANVAS_H - h) / 2) }])
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(out);

  report.push({ slug, w, h });
}

console.table(report);
console.log(`${report.length} maske üretildi → src/assets/client-logos/marks/`);
