/**
 * `/media/**` varlıkları için tek taban adres.
 *
 * NEDEN VAR: `public/media/` altındaki 114 dosya (192 MB, çoğu mp4/webm)
 * Astro'nun varlık hattından geçmez — parmak izi almaz, olduğu gibi `dist/`
 * içine kopyalanır ve her deploy'da Worker'ın statik varlık paketiyle birlikte
 * yeniden yüklenir. Bunları bir nesne deposuna (Cloudflare R2 + `media.pixelon.com.tr`)
 * taşımak deploy paketini küçültür. Ancak yollar şu an içerikte düz string
 * olarak (`/media/reels/kolajen.mp4`) duruyor ve şemada `z.string()`. İçeriğin
 * 100+ satırını elle değiştirmek yerine, adresin ÜRETİLDİĞİ tek nokta burasıdır.
 *
 * GERİ DÜŞÜŞ SÖZLEŞMESİ: `PUBLIC_MEDIA_BASE` boş ya da tanımsızsa hiçbir şey
 * değişmez ve yollar bugünkü hâliyle (`/media/...`) basılır. Yani bu dosya
 * bugünün davranışını bozmaz; R2 bir ZORUNLULUK değil, açılıp kapatılabilir bir
 * optimizasyondur. R2 düşerse ya da değişken deploy'a ulaşmazsa dosyalar hâlâ
 * `public/media/` içinde olduğu sürece site çalışır.
 */

/** CDN'e taşınabilir tek önek. Bunun dışındaki hiçbir yola dokunulmaz. */
const MEDIA_PREFIX = '/media/';

/** Taban adres mutlak olmalı: `https://…`, `http://…` ya da protokolsüz `//host`. */
const ABSOLUTE_BASE_RE = /^(https?:)?\/\//i;

/**
 * Ortam değişkeninden taban adresi çözer.
 *
 * Ayrı ve saf bir fonksiyon olmasının nedeni test edilebilirlik: doğrudan
 * `import.meta.env` okunsaydı testin sonucu makinedeki `.env` dosyasına bağlı olurdu.
 *
 * Mutlak olmayan bir değer (örn. `media.pixelon.com.tr`) yolun başına yapışıp
 * göreli ve kırık bir adres üretirdi; sessizce kırılmaktansa yok sayılır.
 */
export function resolveMediaBase(env: Record<string, string | undefined>): string {
  const raw = (env.PUBLIC_MEDIA_BASE ?? '').trim();
  if (raw === '') return '';
  if (!ABSOLUTE_BASE_RE.test(raw)) return '';
  return raw;
}

/**
 * `/media/...` yolunu verilen taban adrese taşır.
 *
 * `/media` öneki taban adresle DEĞİŞTİRİLİR (eklenmez): R2 anahtarları
 * `public/media/` klasörüne göre göreli tutulur (`reels/kolajen.mp4`), böylece
 * `https://media.pixelon.com.tr/media/reels/...` gibi çift önek oluşmaz.
 * Yükleyicideki `--key-prefix` ile taban adresteki alt yol (örn. `/v2`) aynı
 * olmalıdır — bkz. scripts/media/README.md.
 */
export function withMediaBase(path: string, base: string): string;
export function withMediaBase(path: string | undefined, base: string): string | undefined;
export function withMediaBase(path: string | undefined, base: string): string | undefined {
  if (path === undefined || path === '') return path;
  if (!path.startsWith(MEDIA_PREFIX)) return path;

  // Sondaki eğik çizgi(ler) insan hatasıdır; `//reels/...` üretmemeli.
  const trimmed = base.trim().replace(/\/+$/, '');
  if (trimmed === '') return path;

  return trimmed + path.slice(MEDIA_PREFIX.length - 1);
}

/** Yapılandırılmış taban adres — build sırasında bir kez çözülür. */
const MEDIA_BASE = resolveMediaBase(import.meta.env as Record<string, string | undefined>);

/**
 * İşaretlemede kullanılan biçim: `src={mediaUrl(item.video)}`.
 * Tanımsız girdi tanımsız döner, böylece opsiyonel şema alanları (mobileWebm,
 * desktopPoster …) için çağrı yerinde ayrıca koşul yazmak gerekmez.
 */
export function mediaUrl(path: string): string;
export function mediaUrl(path: string | undefined): string | undefined;
export function mediaUrl(path: string | undefined): string | undefined {
  return withMediaBase(path, MEDIA_BASE);
}
