/**
 * Duyarlılık (responsive) regresyon taraması.
 *
 * NEDEN VAR: `bun test` HTML ve içerik doğruluyor, `test:dist` üretilen çıktıyı
 * kontrol ediyor. İkisi de GERÇEK TARAYICIDA, GERÇEK GENİŞLİKTE ortaya çıkan hataları
 * göremiyor. 1 Eylül 2026'da bu tarama dört hata buldu ve 1070 testin hiçbiri onları
 * yakalamamıştı:
 *
 *   - `.reasons` ızgarası mobilde belgeyi 104–135 px taşırıyordu (CSS özgüllük çakışması)
 *   - Çerez tablosu 360 px'te +208 px taşıyordu (kural hiç yazılmamıştı)
 *   - `--cols: 3` olan hizmet sayfaları 768 px ve 1021–1090 px'te taşıyordu
 *   - `/en/projects/` dört genişlikte de JS hatasıyla düşüyordu
 *
 * BİLİNÇLİ OLARAK `gate`'e VE CI'A BAĞLI DEĞİL: tarayıcı indirmesi ve ~2-3 dakikalık
 * koşu süresi her commit'e yüklenmemeli. Deploy öncesi elle koşulur.
 *
 * KULLANIM
 *   bun run build                       # önce dist üretilmeli
 *   bunx playwright install chromium    # ilk kullanımda bir kez
 *   bun run qa:responsive               # yerel dist'i tarar
 *   bun run qa:responsive -- --base https://pixelon.com.tr   # canlıyı tarar
 *
 * ÇIKIŞ KODU: bulgu varsa 1 — böylece bir kabuk zincirinde kapı olarak kullanılabilir.
 */
import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = join(ROOT, 'dist');

/** Dar mobilden geniş masaüstüne. 1080, 1021–1090 arası kırılma noktası boşluğunu kapatır. */
const VIEWPORTS = [
  { name: 'mobil-360', width: 360, height: 740 },
  { name: 'mobil-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'tablet-1080', width: 1080, height: 900 },
  { name: 'masaustu-1440', width: 1440, height: 900 },
];

const argOf = (flag, fallback) => {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};

const PORT = Number(argOf('--port', '4399'));
const BASE = argOf('--base', null);

/**
 * Sayfada belgeyi genişleten elemanları bulur.
 *
 * `getBoundingClientRect()` ata kırpmasını görmez, bu yüzden bir kaydırma kutusunun
 * İÇİNDEKİ geniş içerik de taşıyor gibi görünür — kasıtlı yatay kaydırıcılar (marquee,
 * proje rayı, tablo kutusu) yanlış alarm üretirdi. Kırpan atası olanlar elenir.
 *
 * `position: fixed` elemanlar da elenir: belge zaten genişlediğinde header ve çerez
 * bandı ona yayılır — sonuçtur, sebep değil. 1 Eylül'de asıl suçluyu bunlar gizliyordu.
 */
const PROBE = () => {
  const vw = document.documentElement.clientWidth;

  const path = (el) => {
    const bits = [];
    let node = el;
    while (node && node.nodeType === 1 && bits.length < 4) {
      let sel = node.tagName.toLowerCase();
      if (node.id) {
        bits.unshift(`${sel}#${node.id}`);
        break;
      }
      const cls = (node.className || '')
        .toString()
        .trim()
        .split(/\s+/)
        .filter((c) => c && !c.startsWith('astro-'));
      if (cls.length) sel += `.${cls.slice(0, 2).join('.')}`;
      bits.unshift(sel);
      node = node.parentElement;
    }
    return bits.join(' > ');
  };

  const isClipped = (el) => {
    let node = el.parentElement;
    while (node && node !== document.body) {
      const ox = getComputedStyle(node).overflowX;
      if (ox === 'hidden' || ox === 'clip' || ox === 'auto' || ox === 'scroll') return true;
      node = node.parentElement;
    }
    return false;
  };

  const offenders = [];
  for (const el of document.querySelectorAll('body *')) {
    const rect = el.getBoundingClientRect();
    if (!rect.width && !rect.height) continue;
    const overRight = Math.round(rect.right - vw);
    const overLeft = Math.round(-rect.left);
    if (overRight <= 1 && overLeft <= 1) continue;
    if (isClipped(el)) continue;
    if (getComputedStyle(el).position === 'fixed') continue;
    offenders.push({ sel: path(el), over: overRight > 1 ? overRight : -overLeft, w: Math.round(rect.width) });
  }
  offenders.sort((a, b) => Math.abs(b.over) - Math.abs(a.over));

  /*
   * Dokunma hedefi (WCAG 2.5.8, AA): asgari 24×24 px.
   *
   * İki İSTİSNA bilinçli olarak elenir, aksi halde rapor yanlış alarmla dolar:
   *   - Cümle içindeki bağlantı: standardın "inline" istisnası — boyutu satır
   *     yüksekliğine bağlıdır, büyütmek metni bozar.
   *   - Ekrandan gizlenmiş alanlar (`aria-hidden`, `tabindex="-1"`): iletişim
   *     formundaki bal küpü böyle; kullanıcıya hiç görünmez.
   *
   * Ölçülen şey elemanın kendi kutusu DEĞİL, varsa sarmalayan `<label>`ın kutusudur:
   * onay kutusunda parmağın dokunduğu alan etiketin tamamıdır.
   */
  const PROSE = '.post__body, .legal__body, .as__text, .as__lead';
  const inProse = (el) => {
    // Makale gövdesindeki her bağlantı istisna kapsamında: boyutu düzyazının satır
    // yüksekliğine bağlı, büyütmek metnin ritmini bozar.
    if (el.closest(PROSE)) return true;
    const parent = el.parentElement;
    if (!parent) return false;
    if (!['P', 'LI', 'FIGCAPTION', 'BLOCKQUOTE', 'TD'].includes(parent.tagName)) return false;
    return (parent.textContent || '').trim().length > (el.textContent || '').trim().length + 12;
  };

  const tinyTargets = [];
  for (const el of document.querySelectorAll('a,button,[role="button"],input:not([type=hidden]),select,summary')) {
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) continue;
    const style = getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none') continue;
    if (el.closest('[aria-hidden="true"]') || el.getAttribute('tabindex') === '-1') continue;
    if (inProse(el)) continue;

    let { width, height } = rect;
    const label = el.closest('label');
    if (label) {
      const lr = label.getBoundingClientRect();
      width = Math.max(width, lr.width);
      height = Math.max(height, lr.height);
    }
    if (width >= 24 && height >= 24) continue;
    tinyTargets.push({ sel: path(el), w: Math.round(width), h: Math.round(height) });
  }

  return {
    vw,
    html: document.documentElement.scrollWidth,
    overflow: document.documentElement.scrollWidth > vw + 1,
    offenders: offenders.slice(0, 3),
    brokenImages: [...document.images]
      .filter((i) => i.complete && i.naturalWidth === 0)
      .map((i) => i.currentSrc || i.src),
    tinyTargets,
  };
};

const sitemapUrls = () => {
  const file = join(DIST, 'sitemap-0.xml');
  if (!existsSync(file)) {
    console.error('dist/sitemap-0.xml yok — önce `bun run build` çalıştırın.');
    process.exit(2);
  }
  return [...readFileSync(file, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
};

/** Yerel statik sunucu — `--base` verilmediğinde dist bunun üzerinden taranır. */
const serveDist = async () => {
  const child = spawn('bunx', ['--bun', 'serve', DIST, '-l', String(PORT)], { stdio: 'ignore', detached: false });
  for (let i = 0; i < 40; i += 1) {
    try {
      const res = await fetch(`http://localhost:${PORT}/`);
      if (res.ok) return child;
    } catch {
      /* sunucu henüz ayakta değil */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  child.kill();
  throw new Error(`Yerel sunucu ${PORT} portunda ayağa kalkmadı.`);
};

const origin = 'https://pixelon.com.tr';
const urls = sitemapUrls().map((u) => u.replace(origin, BASE ?? `http://localhost:${PORT}`));

const server = BASE ? null : await serveDist();
const browser = await chromium.launch();
const findings = [];

try {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.width < 768,
      hasTouch: vp.width < 768,
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    const errors = [];
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text().slice(0, 150));
    });
    page.on('pageerror', (e) => errors.push(`JS: ${String(e).slice(0, 150)}`));

    for (const url of urls) {
      errors.length = 0;
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      } catch (error) {
        findings.push({ url, vp: vp.name, kind: 'yüklenemedi', detail: String(error).slice(0, 90) });
        continue;
      }
      // Reveal ve lazy içerikleri tetikle; ölçüm başa dönünce yapılır.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 25));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 120));
      });

      const probe = await page.evaluate(PROBE);
      const short = url.replace(BASE ?? `http://localhost:${PORT}`, '') || '/';

      if (probe.overflow) {
        findings.push({
          url: short,
          vp: vp.name,
          kind: 'yatay taşma',
          detail: `+${probe.html - probe.vw}px · ${probe.offenders.map((o) => `${o.sel} (${o.over > 0 ? '+' : ''}${o.over}px)`).join(' · ') || 'suçlu bulunamadı'}`,
        });
      }
      for (const img of probe.brokenImages)
        findings.push({ url: short, vp: vp.name, kind: 'kırık görsel', detail: img });
      // Dokunma hedefi yalnızca dokunmatik genişliklerde raporlanır; masaüstünde imleç var.
      if (vp.width < 768) {
        for (const t of probe.tinyTargets) {
          findings.push({
            url: short,
            vp: vp.name,
            kind: 'küçük dokunma hedefi',
            detail: `${t.w}×${t.h}px · ${t.sel}`,
          });
        }
      }
      for (const error of new Set(errors))
        findings.push({ url: short, vp: vp.name, kind: 'konsol hatası', detail: error });
      process.stderr.write('.');
    }
    await context.close();
    process.stderr.write(` ${vp.name}\n`);
  }
} finally {
  await browser.close();
  server?.kill();
}

const scanned = urls.length * VIEWPORTS.length;
console.log(`\n${scanned} ölçüm — ${urls.length} sayfa × ${VIEWPORTS.length} genişlik\n`);

if (findings.length === 0) {
  console.log('✓ Bulgu yok: yatay taşma, kırık görsel ve konsol hatası temiz.');
  process.exit(0);
}

const byKind = findings.reduce((acc, f) => ((acc[f.kind] ??= []).push(f), acc), {});
for (const [kind, list] of Object.entries(byKind)) {
  console.log(`✗ ${kind.toUpperCase()} — ${list.length}`);
  for (const f of list) console.log(`   ${f.vp.padEnd(14)} ${f.url}\n      ${f.detail}`);
  console.log('');
}
console.log(`Toplam ${findings.length} bulgu.`);
process.exit(1);
