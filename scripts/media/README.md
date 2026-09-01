# `public/media/**` → Cloudflare R2 taşıma runbook'u

**Durum: HAZIRLIK. Hiçbir Cloudflare kaynağı oluşturulmadı, hiçbir dosya yüklenmedi.**
Bu makinede Cloudflare kimlik bilgisi yok (`~/.wrangler` yok, `CLOUDFLARE_API_TOKEN` yok;
token yalnızca GitHub Actions secret'ında). Aşağıdaki adımlar, sahip token verdiği anda
sırayla koşulmak üzere yazıldı.

---

## 0) Bu ZORUNLU değil — ne kazandırır, ne riske atar

Ölçüm (2026-09-01):

| Ne                   | Değer                                               |
| -------------------- | --------------------------------------------------- |
| `public/media/**`    | 120 dosya · 191 MB                                  |
| `dist/`              | 1299 dosya · 344 MB                                 |
| En büyük tek dosya   | 13,7 MiB (`projects/dentasay/behind-the-smile.mp4`) |
| Workers dosya limiti | 25 MiB / dosya                                      |

**Deploy şu an limite TAKILMIYOR.** Yani R2 bir zorunluluk değil, bir optimizasyondur.
Kazanç: deploy paketi 344 MB → ~153 MB (%56 küçülme), her deploy'da 191 MB'lık
değişmeyen video yeniden yüklenmez, CI süresi kısalır.
Bedel: ikinci bir alan adı, ikinci bir yayın hattı ve senkronize tutulması gereken
bir kopya daha. Değmiyorsa yapma — hazırlık dosyaları depoda kalır, zararı yoktur.

---

## 1) Nasıl çalışıyor (mimari)

`/media/**` varlıkları Astro'nun görsel hattından **geçmez**: parmak izi almazlar,
`public/` içinden `dist/` içine olduğu gibi kopyalanırlar. Yollar içerikte düz string
olarak durur (`src/content/**` içindeki `video`, `src`, `poster`, `desktopMp4` … alanları;
şemada `z.string()`).

Adres tek noktada üretilir: **`src/lib/media.ts` → `mediaUrl()`**.

```
PUBLIC_MEDIA_BASE boş   →  /media/reels/kolajen.mp4                         (bugünkü davranış)
PUBLIC_MEDIA_BASE dolu  →  https://media.pixelon.com.tr/reels/kolajen.mp4
```

Üç kural:

1. `/media` öneki taban adresin **yerine** konur, eklenmez. Bu yüzden R2 anahtarları
   `public/media/` klasörüne **görelidir** (`reels/kolajen.mp4`, `hero/marka/...`).
   `scripts/media/r2-upload.mjs` aynı varsayımı kullanır; ikisi ayrışırsa
   `.../media/media/...` gibi çift önek oluşur.
2. Yalnızca `/media/` ile başlayan yollar taşınır. `/_astro/...` (parmak izli),
   `/src/assets/...` (CMS yolu), `https://...` ve `data:` **dokunulmadan geçer**.
3. Değer mutlak değilse (örn. `media.pixelon.com.tr`) **yok sayılır** ve `/media/...`
   davranışına geri düşülür. Sessizce kırık göreli adres üretmez.

`mediaUrl()`'den geçen bileşenler:

| Dosya                                           | Alanlar                                              |
| ----------------------------------------------- | ---------------------------------------------------- |
| `src/components/sections/HeroSection.astro`     | `desktop/mobile` × `Mp4/Webm/Poster` (6 `data-*`)    |
| `src/components/sections/ProjectsBoard.astro`   | aynı 6 alan (board hero'su)                          |
| `src/components/sections/ShowreelSection.astro` | `item.video`, poster                                 |
| `src/components/ProjectDetail.astro`            | `block.video.{mp4,webm,poster}`, `reel.{src,poster}` |

`MediaSection.astro` **bilerek dışarıda**: o bölüm `src/assets/images/webdesignvideo.webm`
dosyasını `?url` ile paketten alır, `/media/` altında değildir.

---

## 2) Bucket ve alan adı (Cloudflare panelinde, insan eliyle)

> Bu adımlar iş akışına gömülmez. `wrangler.jsonc` içinde de alan adı/route tanımlı
> değildir — depodaki kural bu (bkz. `wrangler.jsonc` başlığındaki not).

1. **Bucket oluştur** — R2 → Create bucket
   - Ad: `pixelon-media`
   - Konum: `EEUR` (Doğu Avrupa) — hedef kitle Türkiye. Sonradan değiştirilemez.
   - Storage class: Standard.

2. **Alan adını bağla** — Bucket → Settings → Public access → **Connect Domain**
   - `media.pixelon.com.tr`
   - Cloudflare, DNS'te CNAME kaydını kendisi açar (bölge zaten Cloudflare'da).
   - **`r2.dev` public URL'sini AÇMA.** Rate-limit'li, cache'siz ve markasız;
     üretimde kullanılmamalı.

3. **Cache kuralı (opsiyonel ama önerilir)** — Rules → Cache Rules
   - Eşleşme: `Hostname equals media.pixelon.com.tr`
   - Edge TTL: 1 yıl. Nesneler `Cache-Control: public, max-age=31536000, immutable`
     ile yükleniyor; kural bunu edge'de de sabitler.

4. **CORS** — Bucket → Settings → CORS policy
   `<video src>` ve `<img src>` **CORS gerektirmez** (basit gömme). Kural yalnızca
   şu iki durumda gerekir: JS'ten `fetch()` ile medya çekmek, ya da `<video crossorigin>`
   ile altyazı/track okumak. Site bugün ikisini de yapmıyor — **CORS kuralı EKLEME**.
   İleride gerekirse en dar hâli:

   ```json
   [
     {
       "AllowedOrigins": ["https://pixelon.com.tr"],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedHeaders": ["Range"],
       "ExposeHeaders": ["Content-Length", "Content-Range", "ETag"],
       "MaxAgeSeconds": 86400
     }
   ]
   ```

---

## 3) Token kapsamı

R2 → Manage R2 API Tokens → **Create API token**

| Ayar        | Değer                                                             |
| ----------- | ----------------------------------------------------------------- |
| Ad          | `pixelon-media-upload`                                            |
| İzin        | **Object Read & Write** (Admin DEĞİL)                             |
| Kapsam      | **Yalnızca `pixelon-media` bucket'ı** (Apply to specific buckets) |
| TTL         | Mümkünse süreli                                                   |
| IP filtresi | Yalnızca elle yüklemede sabit IP varsa                            |

Token üretildiğinde ekranda **Access Key ID** ve **Secret Access Key** görünür —
S3 uyumlu API bunları ister, "API token" değerini değil. Secret bir kez gösterilir.

**Mevcut `CLOUDFLARE_API_TOKEN` secret'ını KULLANMA.** O token Workers deploy içindir;
R2 yüklemesi ayrı ve dar kapsamlı bir kimlik kullanmalı. Kapsam ayrımı, yükleme
kimliği sızarsa üretim Worker'ının ele geçmemesini sağlar.

**Anahtarlar depoya YAZILMAZ.** Depo public; `.env` gitignore'da ama yine de yazma.
`.secretlintrc.json` bir kaçağı yakalar, ama ona güvenme.

---

## 4) Yükleme

```sh
export PATH="$HOME/.bun/bin:$PATH"

# Baştaki BOŞLUK bilinçli: zsh/bash bu satırları geçmişe yazmaz (HIST_IGNORE_SPACE).
 export R2_ACCOUNT_ID='<cloudflare hesap id>'
 export R2_ACCESS_KEY_ID='<token ekranındaki Access Key ID>'
 export R2_SECRET_ACCESS_KEY='<token ekranındaki Secret Access Key>'
 export R2_BUCKET='pixelon-media'

# 1) Ne olacağını gör — hiçbir şey yazmaz
bun scripts/media/r2-upload.mjs --dry-run

# 2) Gerçek yükleme
bun scripts/media/r2-upload.mjs

# 3) Tekrar çalıştır: "Yüklenecek dosya yok" demeli (idempotent olduğunun kanıtı)
bun scripts/media/r2-upload.mjs
```

Bayraklar:

| Bayrak            | Ne yapar                                                                       |
| ----------------- | ------------------------------------------------------------------------------ |
| `--dry-run`       | Yazmaz. Kimlik bilgisi yoksa da çalışır; o durumda "uzak durum bilinmiyor" der |
| `--force`         | Değişmemişleri de yeniden yükler (Content-Type/Cache-Control düzeltmek için)   |
| `--concurrency N` | Eşzamanlı yükleme (varsayılan 4)                                               |
| `--key-prefix v2` | Anahtarların başına klasör ekler — `PUBLIC_MEDIA_BASE` de `.../v2` olmalı      |
| `--dir <yol>`     | Kaynak klasörü değiştirir (varsayılan `public/media`)                          |

Betiğin davranışı:

- Kimlik bilgisi eksikse (dry-run dışında) **hangi değişkenin eksik olduğunu yazıp
  1 ile çıkar** — tahmin etmez, boş değerle denemez.
- Bilinmeyen uzantıda **durur**. Sessiz `application/octet-stream`, videoyu tarayıcıda
  oynatılabilir olmaktan çıkarıp indirilen dosyaya çevirir; yeni uzantı `CONTENT_TYPES`
  tablosuna eklenmeli.
- Uzak envanteri **tek** `ListObjectsV2` çağrısıyla alır, boyut + ETag (tek parça
  yüklemede = MD5) karşılaştırır, yalnızca değişeni yükler.
- Uzakta olup yerelde olmayan nesneleri **raporlar ama SİLMEZ**. Otomatik silme,
  yanlış bir `--key-prefix` ile bütün bucket'ı boşaltabilirdi. Silme elle yapılır.

---

## 5) Doğrulama

```sh
# a) Nesne gerçekten orada ve doğru tiple mi?
curl -sI https://media.pixelon.com.tr/reels/kolajen.mp4 | grep -iE 'HTTP/|content-type|cache-control|content-length'
# Beklenen: 200 · content-type: video/mp4 · cache-control: public, max-age=31536000, immutable

# b) Range isteği çalışıyor mu? (video seek bunu kullanır — 206 dönmeli)
curl -sI -H 'Range: bytes=0-1023' https://media.pixelon.com.tr/reels/kolajen.mp4 | head -1
# Beklenen: HTTP/2 206

# c) Dosya sayısı ve toplam boyut tutuyor mu?
bun scripts/media/r2-upload.mjs --dry-run   # "Yüklenecek dosya yok" demeli

# d) Site tarafı: taban adresle derle ve çıktıda R2 adresi var mı?
PUBLIC_MEDIA_BASE='https://media.pixelon.com.tr' bun run build
grep -o 'https://media.pixelon.com.tr[^"]*' dist/index.html | head
grep -c '"/media/' dist/index.html   # 0 olmalı

# e) Kapı hâlâ yeşil mi?
bun run gate
```

Tarayıcıda son kontrol (bunlar otomatik test edilmiyor):

- Ana sayfa hero videosu oynuyor · mobil genişlikte mobil varyant iniyor
- `/projelerimiz/` board hero videosu oynuyor
- `/projelerimiz/dentasay/` blok videoları + reel'ler oynuyor, poster'lar görünüyor
- `/hizmetlerimiz/sosyal-medya-yonetimi/` reel şeridi (8 video) oynuyor
- Konsolda CORS ya da 404 hatası **yok**
- `prefers-reduced-motion` açıkken video yüklenmiyor, poster kalıyor

---

## 6) Yayına alma

`PUBLIC_MEDIA_BASE` **build zamanında** okunur (Astro SSG). Yani üretimde etkili
olması için deploy iş akışının build adımına verilmesi gerekir.

`.github/workflows/deploy-workers-production.yml` içinde **İKİ** build adımı var
(redirect üretiminden önce ve sonra); ikisine de eklenmeli:

```yaml
- name: Build
  env:
    PUBLIC_WEB3FORMS_ACCESS_KEY: ${{ secrets.WEB3FORMS_ACCESS_KEY }}
    PUBLIC_MEDIA_BASE: ${{ vars.PUBLIC_MEDIA_BASE }} # ← eklenecek
  run: bun run build
```

`vars` (secret değil) kullanılıyor: değer gizli değil, sayfa kaynağında zaten görünür.
Tanımsızsa boş gelir ve site bugünkü davranışına düşer — bu **kasıtlı**, güvenli
varsayılandır.

> Bu düzenleme **yapılmadı**. Depo kuralı: `main`'e push = canlı deploy. İş akışını
> değiştirmek üretim yayınıdır ve sahip onayı ister.

`public/_headers` içindeki `/media/*` kuralına **dokunma**. Medya R2'ye taşınsa bile
kural zararsızdır (eşleşecek istek kalmaz) ve dosyalar depoda durduğu sürece geri
düşüş yolunu açık tutar. Ancak Bölüm 6'nın son adımı yapılırsa (dosyalar depodan
silinirse) kural ölür ve o zaman kaldırılabilir.

### Dosyaları depodan çıkarmak (İSTEĞE BAĞLI, EN SON)

Asıl kazanç ancak `public/media/` depodan silinince gelir. **Bunu ancak yukarıdaki
doğrulamaların tamamı canlıda geçtikten ve en az bir hafta sorunsuz geçtikten sonra
yap.** Silmeden önce `git tag media-in-repo-<tarih>` at: geri dönüşün tek garantisi o.

Silinirse `PUBLIC_MEDIA_BASE` artık bir "optimizasyon" değil, **zorunluluk** olur —
geri düşüş kaybolur. Bu yüzden acele etme; 191 MB'lık depo maliyeti, kırık bir
portfolyo sayfasından ucuzdur.

---

## 7) Geri alma

Ne olduğuna göre üç kademe:

| Sorun                                 | Yapılacak                                                                                                                                                                                          |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R2 ya da `media.pixelon.com.tr` düştü | İş akışından `PUBLIC_MEDIA_BASE` satırını kaldır (ya da `vars`'ı boşalt) → yeniden deploy. Dosyalar `public/media/` içinde durduğu sürece site eski hâline döner.                                  |
| Tek dosya bozuk yüklendi              | Dosyayı düzelt → `bun scripts/media/r2-upload.mjs` (yalnız o dosya gider). Cache'i temizlemek için Cloudflare → Caching → Purge, ya da dosya adını değiştir.                                       |
| Yanlış içerik bir yıl cache'lendi     | `immutable` verildiği için tarayıcı cache'i **purge ile temizlenmez**. Tek gerçek çözüm: **dosya adını değiştir** ya da `PUBLIC_MEDIA_BASE`'i `.../v2` yap ve `--key-prefix v2` ile yeniden yükle. |

Geri alma **her zaman tek ortam değişkeni** kadar uzaktadır — `public/media/` depodan
silinmediği sürece. Bölüm 6'nın son kısmını bu yüzden en sona bıraktık.

---

## 8) Bilinen riskler

1. **`immutable` + sabit dosya adı.** `public/_headers` bugün `/media/*` için bir AY
   veriyor; R2'ye bir YIL + `immutable` yazılıyor. Aynı isimle içerik değiştirmek
   ziyaretçide bir yıl eski video bırakır. Kural: **içerik değişirse dosya adı değişir.**
2. **İki kopya birbirinden ayrışır.** `public/media/` depoda kalırken R2 de canlıysa,
   yeni bir video eklenip yükleme unutulursa site 404 verir. `bun scripts/media/r2-upload.mjs`
   deploy'dan önce koşulmalı — şu an bunu zorlayan bir kapı yok.
3. **Anahtar öneki uyumu.** `PUBLIC_MEDIA_BASE` sonundaki alt yol ile `--key-prefix`
   birebir aynı olmalı. Ayrışırsa tüm medya 404 verir; birim testler bu eşleşmeyi
   **doğrulamaz** (biri site, diğeri betik tarafında).
4. **CORS'a gerek yok — ama ileride gerekirse sessiz kırılır.** Bugün `<video src>`
   CORS istemiyor. İleride altyazı (`<track>`) ya da `crossorigin` eklenirse medya
   sessizce yüklenmez. Bölüm 2'deki kuralı o zaman ekle.
5. **`--dry-run` kimlik bilgisi olmadan da çalışır** ve o durumda "hepsi yüklenecek"
   der. Bu bir tahmin değil, açıkça "uzak durum bilinmiyor" olarak etiketlenir —
   ama rapor olarak okunursa yanıltıcıdır.
6. **Silinen dosya R2'de kalır.** Betik orphan'ları raporlar ama silmez; bucket
   zamanla şişer. Periyodik olarak listeye bakılmalı.
7. **Deploy hattı R2'yi bilmiyor.** Bugün medya yükleme tamamen elle. CI'a bağlanırsa
   token CI'a girer ve saldırı yüzeyi büyür; elle tutmak bilinçli bir seçim.
