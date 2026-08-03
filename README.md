# Pixelon — 360° Dijital Ajans Web Sitesi

Astro ile üretilen **statik** (SSG) kurumsal site. İçerik yönetimi **Sveltia CMS** (Git tabanlı)
ile `/admin` altından yapılır; ayrı bir veritabanı yoktur. Site tamamen Türkçedir.

|                         |                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------- |
| Çatı                    | Astro 7 (statik çıktı, sunucu çalışma zamanı yok)                                      |
| Paket yöneticisi & test | Bun 1.3.14                                                                             |
| CMS                     | Sveltia CMS — GitHub backend, içerik repoya commit edilir                              |
| Stil                    | CSS custom properties (`src/styles/tokens.css`) + bileşen içi `<style>` — Tailwind yok |
| Deploy                  | GitHub Pages (release ile tetiklenir)                                                  |

---

## Hızlı başlangıç

Bun PATH'te değilse önce şunu çalıştırın (kurulum: `curl -fsSL https://bun.sh/install | bash`):

```sh
export PATH="$HOME/.bun/bin:$PATH"
```

```sh
bun install          # bağımlılıklar + git hook'larını kurar
bun run dev          # http://localhost:4321
bun run build        # dist/ üretir
bun run preview      # dist/ önizlemesi
```

---

## Komutlar

| Komut                           | Ne yapar                                                     |
| ------------------------------- | ------------------------------------------------------------ |
| `bun run dev`                   | Geliştirme sunucusu                                          |
| `bun run build`                 | Statik çıktı (`dist/`)                                       |
| `bun run gate`                  | **Kalite kapısı:** typecheck → format → lint → knip → test   |
| `bun run verify`                | `build` + `dist/` üzerinde duman testleri                    |
| `bun run typecheck`             | `astro check` (`.astro` dosyaları dahil tip kontrolü)        |
| `bun run format` / `format:fix` | Prettier kontrol / düzelt                                    |
| `bun run lint`                  | oxlint                                                       |
| `bun run knip`                  | Ölü kod ve kullanılmayan bağımlılık taraması                 |
| `bun test`                      | Birim testleri                                               |
| `bun run test:dist`             | Yalnızca build sonrası duman testleri (önce `build` gerekir) |
| `bun run secrets`               | secretlint ile sır sızıntısı taraması                        |
| `bun run audit`                 | `bun audit` (danışma niteliğinde, bloklamaz)                 |

Ayrıntılı araç zinciri gerekçeleri: `design_handoff_astro_site/TOOLCHAIN.md`.

---

## Kalite kapıları

**Yerel hook'lar** (`core.hooksPath .githooks`, `bun install` sonrası otomatik kurulur):

| Hook         | Çalıştırdığı               | Amaç                                   |
| ------------ | -------------------------- | -------------------------------------- |
| `pre-commit` | `secrets` + `format`       | Ucuz kontroller — commit'i yavaşlatmaz |
| `pre-push`   | `gate` + `audit \|\| true` | CI'nın enforce ettiğinin aynısı        |

**CI/CD** (`.github/workflows/`):

- `ci.yml` — **pull request'lerde**: `gate` → `secrets` → `audit` (non-blocking) → `verify`.
  **Deploy etmez.**
- `deploy.yml` — **`main` dalına giden her commit'te** (veya manuel dispatch):
  `gate` → `secrets` → `verify` → GitHub Pages'e OIDC ile deploy.
  Kapı deploy'dan ÖNCE çalışır; gate veya build başarısızsa deploy adımı hiç çalışmaz,
  dolayısıyla bozuk bir commit canlıya çıkamaz.

`main` push'unda kapı yalnızca `deploy.yml` içinde koşar — iki workflow'un aynı işi
tekrarlamaması için `ci.yml` push'ta tetiklenmez.

Tüm GitHub Action'ları tam commit SHA'sına sabitlenmiştir (supply-chain koruması);
Dependabot bunları ve bağımlılıkları haftalık günceller.

---

## Test yaklaşımı (TDD)

Üretim kodu yazılmadan önce test yazılır ve kırmızı görüldüğü doğrulanır.

| Katman           | Nerede                            | Ne doğrular                                                                                                     |
| ---------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Saf mantık       | `src/lib/*.test.ts`               | slug, telefon/WhatsApp, form doğrulama, tarih, SEO, proje filtreleme, nav, hizmet→bölüm eşlemesi                |
| İçerik şemaları  | `src/content/*.test.ts`           | zod şemalarının geçerli/geçersiz içeriği doğru ayırması                                                         |
| İçerik bütünlüğü | `tests/content-integrity.test.ts` | **Şemada tanımsız anahtarların sessizce silinmemesi** — bir bölüm eklenip şemaya işlenmezse build'de kaybolurdu |
| CMS sözleşmesi   | `tests/cms-config.test.ts`        | `public/admin/config.yml` ile zod şemalarının birebir aynı olması                                               |
| Render çıktısı   | `tests/dist-smoke.ts`             | 20 sayfanın üretilmesi, SEO etiketleri, header/footer, prototip artığı kalmaması                                |

`tests/dist-smoke.ts` bilinçli olarak `.test.ts` değildir — `astro build` gerektirdiği için
varsayılan `bun test` taramasına girmez; `bun run verify` ile çalışır.

---

## Mimari

### İçerik → sayfa akışı

Sayfalar sabit şablonlar değildir. Her sayfa, sıralı bir **bölüm listesinden** oluşur:

```
src/content/pages/<sayfa>.yml   →  sections: [{ type: hero }, { type: cards }, …]
                                       ↓
                     src/components/SectionRenderer.astro  (tip başına switch)
                                       ↓
                     src/components/sections/<Tip>Section.astro
```

Bölüm sözlüğü `src/content/page-schema.ts` içindeki ayrıştırılmış birleşimde (discriminated
union) tanımlıdır: `hero, cards, steps, bullets, text, stats, faq, cta, logos, projects,
posts, team, services, form, contactInfo, media, jobs`.

Bu sayede editör Sveltia'da bölüm ekleyebilir, çıkarabilir ve **sırasını değiştirebilir**.

**Hizmet detay sayfaları** ayrı şablon kullanmaz: `services` koleksiyonundaki sabit alanlı veri
`src/lib/service-sections.ts` içindeki saf fonksiyonla aynı bölüm listesine çevrilir. Böylece
10 hizmet sayfası tek bir kanonik akışı ve aynı görsel dili paylaşır — ve bu eşleme birim
testlerinden geçer.

### İçerik koleksiyonları

| Koleksiyon   | Konum                           | İçerik                                                  |
| ------------ | ------------------------------- | ------------------------------------------------------- |
| `settings`   | `src/content/settings/site.yml` | Telefon, e-posta, adres, WhatsApp, sosyal medya, footer |
| `pages`      | `src/content/pages/*.yml`       | Sayfa gövdeleri (bölüm listesi)                         |
| `services`   | `src/content/services/*.yml`    | 10 hizmet — hero, kapsam, süreç, SSS …                  |
| `projects`   | `src/content/projects/*.md`     | Proje vitrini                                           |
| `posts`      | `src/content/posts/*.md`        | Blog yazıları (Markdown gövde)                          |
| `references` | `src/content/references/*.yml`  | Müşteri logoları (marquee)                              |
| `team`       | `src/content/team/*.yml`        | Ekip üyeleri                                            |

Şemalar `src/content/schemas.ts` ve `src/content/page-schema.ts` içindedir; `src/content.config.ts`
bunları Astro koleksiyonlarına bağlar.

> **Önemli:** zod, şemada tanımsız anahtarları **hatasız siler**. Yani "şema geçti" ≠ "içerik
> korundu". `tests/content-integrity.test.ts` her içerik dosyası için hiçbir anahtarın
> düşmediğini doğrular — yeni bir bölüm eklerken şemayı güncellemeyi unutursanız test kırılır.

### Routing

| Route                                                                                                 | Kaynak                            |
| ----------------------------------------------------------------------------------------------------- | --------------------------------- |
| `/`                                                                                                   | `pages/home.yml`                  |
| `/biz-kimiz`, `/hizmetlerimiz`, `/projelerimiz`, `/blog`, `/kariyer`, `/iletisim`, `/ucretsiz-analiz` | ilgili `pages/*.yml`              |
| `/hizmetlerimiz/[slug]`                                                                               | `services` koleksiyonu (10 sayfa) |
| `/blog/[slug]`                                                                                        | `posts` koleksiyonu               |
| `/404`                                                                                                | `src/pages/404.astro`             |

---

## İçerik yönetimi (Sveltia CMS)

Admin arayüzü: **`/admin`** (`public/admin/index.html` + `config.yml`).

### Yerel kullanım (kurulum gerektirmez)

```sh
bun run dev
```

`http://localhost:4321/admin/index.html` → **"Work with Local Repository"** seçin. Değişiklikler
doğrudan `src/content/` altındaki dosyalara yazılır; Astro anında yeniden derler.

> Geliştirme sunucusunda `public/` alt klasörleri için dizin indeksi sunulmadığından
> `/admin/` yerine `/admin/index.html` adresini kullanın. Üretim çıktısında (`bun run build`
>
> - `bun run preview` veya GitHub Pages) `/admin/` doğrudan çalışır.

### Üretimde kimlik doğrulama — yapılması gereken tek kurulum

GitHub Pages statik bir barındırmadır, dolayısıyla OAuth el sıkışmasını yapacak bir
sunucu yoktur. Sveltia bunun için küçük bir Cloudflare Workers aracısı kullanır:

1. [`sveltia/sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth) worker'ını deploy edin.
2. GitHub'da bir **OAuth App** oluşturun; callback URL'i worker adresiniz olsun.
3. Worker'ın `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` secret'larını doldurun.
4. `public/admin/config.yml` içindeki `backend.base_url` değerini worker adresinizle değiştirin.

Bundan sonra `https://<site>/admin/` üzerinden GitHub hesabıyla giriş yapılır; her kayıt
repoya bir commit olarak yazılır ve release ile yayına alınır.

### Görseller

CMS'ten yüklenen görseller `src/assets/uploads/` altına yazılır (`media_folder`), içerik
dosyalarına `../../assets/uploads/…` bağıl yoluyla kaydedilir (`public_folder`) — böylece
`astro:assets` optimizasyonundan geçerler.

Tasarımda `<image-slot>` ile temsil edilen alanlar şu an anlamlı `alt` metinli yer tutucular
olarak render ediliyor; gerçek görseller CMS'ten yüklendiğinde otomatik olarak yerlerine geçer.

---

## Formlar

İletişim ve Ücretsiz Analiz formlarının doğrulama mantığı `src/lib/forms.ts` içindedir ve
birim testleriyle korunur; aynı modül hem sunucu-öncesi hem tarayıcı tarafında kullanılır.

Statik sitede form uç noktası yoktur; gönderim bir dış servise POST edilir:

```sh
# .env
PUBLIC_FORM_ENDPOINT="https://formspree.io/f/xxxxxxx"
```

Bu değişken tanımlı değilse formlar render edilir ama gönderim engellenir ve kullanıcıya
yapılandırma uyarısı gösterilir. Formspree, Resend ya da düz POST kabul eden herhangi bir
servis kullanılabilir.

---

## Deploy

Yayın **otomatiktir**: `main` dalına push edilen her commit, kapıyı geçtiği takdirde
GitHub Pages'e yayınlanır.

```sh
git push origin main    # gate → build → deploy
```

Yayın durumu: repo → **Actions → Deploy to GitHub Pages**.
Pages kaynağı **GitHub Actions** olarak ayarlıdır (Settings → Pages → Source).

Özel alan adına (`www.pixelon.com.tr`) geçiş:

1. `astro.config.mjs` içindeki `site` değerini güncelleyin.
2. `public/CNAME` dosyası oluşturup alan adını yazın.
3. DNS'te GitHub Pages kayıtlarını tanımlayın ve repo ayarlarından custom domain'i seçin.

---

## Erişilebilirlik ve performans notları

- Her sayfada içeriğe atlama bağlantısı, tek `<h1>`, landmark'lar ve `aria-*` durumları.
- Mobil menü ve SSS akordeonu klavyeyle kullanılabilir; `Escape` menüyü kapatır.
- `prefers-reduced-motion: reduce` tüm giriş animasyonlarını, marquee'yi ve sayaçları durdurur.
- Client-side JS yalnızca gerçekten etkileşimli parçalarda (menü, akordeon, sayaç, proje
  filtresi, form doğrulama); framework adası yok.
- Görseller `astro:assets` ile optimize edilir, fontlar `display=swap` ile yüklenir.

---

## Kaynak tasarım paketi

`design_handoff_astro_site/` — 20 sayfanın hifi HTML referansı, ekran görüntüleri, design
token listesi ve araç zinciri dokümanı. Bu klasör `.gitignore`'dadır: üretim reposunun parçası
değildir, yalnızca geliştirme sırasında referans olarak kullanılır.
