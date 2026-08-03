# Pixelon Web Sitesi — Geliştirme Sözleşmesi

Pixelon 360° dijital ajans kurumsal sitesi. **Astro (SSG) + Sveltia CMS (Git tabanlı)**.
Tüm site içeriği Türkçedir. Sunucu çalışma zamanı yoktur.

## Ortam — ÖNEMLİ

`bun` PATH'te değil. Her kabuk komutunu şununla başlat:

```sh
export PATH="$HOME/.bun/bin:$PATH"
```

Paket yöneticisi ve test koşucusu **bun**'dur. `npm`/`yarn`/`pnpm` KULLANMA.

## Kaynak tasarım paketi

`design_handoff_astro_site/` (git'te yok sayılır, üretim reposuna dahil değil):

- `design-reference-pages/*.html` — 20 sayfanın hifi tasarım referansı
- `screenshots/*.png` — aynı numaralandırmayla ekran görüntüleri
- `README.md` — design token'lar, sayfa/route tablosu, koleksiyon şemaları

### Referans HTML'leri okuma kuralları

Bu dosyalar bir prototip aracının çıktısıdır. **Şu etiketleri üretim koduna KOPYALAMA:**
`<x-dc>`, `<helmet>`, `<sc-for>`, `<sc-if>`, `<image-slot>`, `{{ ... }}`,
`style-hover="..."`, `support.js`, `image-slot.js`.

- Görsel değerler (renk, spacing, radius, font) inline `style` içindedir — bunları al.
- `style-hover="..."` → gerçek CSS `:hover` kuralına çevir.
- Döngü/durum verisi (SSS listeleri, sekmeler vb.) dosyanın **sonundaki**
  `<script type="text/x-dc">` bloğunun `state = { ... }` kısmındadır — içeriği oradan al.
- `<image-slot>` → gerçek `<img>` / `<Image />`; anlamlı Türkçe `alt` ve en-boy oranını koru.
- `<title>`, `<meta name="description">`, Open Graph etiketleri **birebir** korunur.

## Mimari kurallar

- **Tailwind YOK.** Stil, `src/styles/tokens.css` içindeki CSS custom property'leri +
  bileşen içi Astro `<style>` blokları ile yazılır. Inline `style` kullanma.
- **İkon kütüphanesi YOK.** Metin okları (`→ ▼ ✕ ☰`), emoji bayraklar ve lime noktalar
  kullanılır; gerekirse minimal inline SVG (stroke 1.5px).
- Client-side JS minimumda: yalnızca gerçekten interaktif parçalarda. Astro bileşenlerinde
  küçük `<script>` blokları tercih edilir; React/Svelte adaları eklenmez.
- Görseller `astro:assets` (`<Image />`) ile optimize edilir; `src/assets/**` altından import.
- İçerik `getCollection()` / `getEntry()` ile okunur — sayfa dosyalarına metin gömme.

## Design token'lar (`src/styles/tokens.css`)

| Token            | Değer                         |
| ---------------- | ----------------------------- |
| `--bg`           | `#0A0A0A`                     |
| `--bg-footer`    | `#050505`                     |
| `--bg-light`     | `#F5F5EF`                     |
| `--accent`       | `#CFFF00`                     |
| `--text`         | `#FFFFFF`                     |
| `--text-muted`   | `rgba(255,255,255,.62)`       |
| `--border`       | `rgba(255,255,255,.12)`       |
| `--font-display` | `'Space Grotesk', sans-serif` |
| `--font-body`    | `'Archivo', sans-serif`       |
| `--container`    | `1280px` (header `1320px`)    |
| `--radius-card`  | `18px`                        |
| `--radius-pill`  | `999px`                       |

- Kenar boşluğu: `padding: 0 clamp(20px, 6vw, 80px)`
- Bölüm boşluğu: `padding: clamp(60px, 7vw, 90px) 0`
- Kart hover: `border-color: var(--accent); transform: translateY(-6px); transition: .3s`
- Buton primary: `background: var(--accent); color: var(--bg);` hover → `background:#fff`
- Breakpoint'ler: `≤1020px` (tablet/nav gizlenir), `≤720px` (mobil)

## Route tablosu

| Route                   | Kaynak                    |
| ----------------------- | ------------------------- |
| `/`                     | `01-Ana-Sayfa.html`       |
| `/biz-kimiz`            | `02-Biz-Kimiz.html`       |
| `/hizmetlerimiz`        | `03-Hizmetlerimiz.html`   |
| `/hizmetlerimiz/[slug]` | `04`–`13` (10 hizmet)     |
| `/projelerimiz`         | `14-Projelerimiz.html`    |
| `/blog`                 | `15-Blog.html`            |
| `/blog/[slug]`          | `16`, `17`                |
| `/kariyer`              | `18-Kariyer.html`         |
| `/iletisim`             | `19-Iletisim.html`        |
| `/ucretsiz-analiz`      | `20-Ucretsiz-Analiz.html` |

Hizmet slug'ları (`slugify()` çıktısıyla birebir):
`web-tasarim-ve-yazilim`, `sosyal-medya-yonetimi`, `dijital-reklam-yonetimi`,
`seo-ve-icerik-pazarlamasi`, `marka-ve-kurumsal-kimlik`, `ux-ui-tasarimi`,
`e-ticaret-cozumleri`, `video-ve-produksiyon`, `saglik-turizmi-danismanligi`,
`crm-ve-dijital-donusum`

## Test yaklaşımı — TDD zorunlu

`bun test`, `**/*.test.ts` dosyalarını koşar. **Üretim kodu yazmadan önce testi yaz ve
kırmızı gördüğünü doğrula.**

- Saf mantık (`src/lib/**`) → birim testi.
- İçerik şemaları (`src/content/schemas/**`) → geçerli/geçersiz örneklerle şema testi.
  Şemalar `astro/zod`'dan `z` import eder ve **görsel alanları için bir `image` çözümleyici
  parametresi alan fabrika fonksiyonu** olarak yazılır (bkz. `src/content/schemas.ts`) —
  böylece Astro çalışma zamanı olmadan test edilebilirler.
- Sayfa/bileşen çıktısı → `tests/build.test.ts` içinde `dist/` üzerinde duman testi.

## Kalite kapısı

```sh
export PATH="$HOME/.bun/bin:$PATH"
bun run gate   # typecheck → format → lint → knip → test
```

Biçim hatasında `bun run format:fix`. Commit öncesi `.githooks/pre-commit`
(secrets + format), push öncesi `.githooks/pre-push` (tam gate) çalışır.

## İçerik koleksiyonları

`src/content/` altında; her koleksiyonun zod şeması `src/content/schemas/*.ts`
içinde ayrı dosyada, `src/content.config.ts` bunları birleştirir.
Sveltia CMS tanımı (`public/admin/config.yml`) bu şemaların **birebir aynası** olmalıdır.
