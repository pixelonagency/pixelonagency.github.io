# IndexNow — Pixelon Otomasyon Mimarisi

Deploy sonrası **yalnızca gerçekten değişen** public URL'leri IndexNow'a bildirir
(Bing ve IndexNow'u destekleyen diğer arama motorları). Sitemap "tam envanter",
IndexNow "hızlı keşif" katmanıdır — ikisi birlikte çalışır.

## Architecture

| Parça                | Konum                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Anahtar (tek kaynak) | `scripts/seo/indexnow-key.ts` → `INDEXNOW_KEY`                                                                      |
| Doğrulama dosyası    | `public/<KEY>.txt` → canlıda `https://pixelon.com.tr/<KEY>.txt` (HTTP 200, içerik yalnız anahtar)                   |
| Script               | `scripts/seo/indexnow.ts` (Bun + yerleşik `fetch`, sıfır ek bağımlılık, üçüncü parti Action yok)                    |
| Endpoint             | `https://api.indexnow.org/indexnow` (bulk POST: `host`, `key`, `keyLocation`, `urlList`; limit 10.000 URL)          |
| Otomatik tetik       | `.github/workflows/deploy.yml` → `indexnow` job'ı (`needs: deploy` — yalnız BAŞARILI deploy sonrası, yalnız `push`) |
| Manuel tetik         | `.github/workflows/indexnow-manual.yml` (`workflow_dispatch`, `urls` girdisi + `dry_run`)                           |

## Change Detection

`git diff --name-status <event.before>..<sha>` çıktısı gerçek route'lara eşlenir
(eşleme `src/lib/i18n.ts` yardımcılarından türetilir, ikinci bir slug tablosu yoktur):

- `src/content/posts/<dil>/<slug>.md` → yazı + o dilin blog listesi
- `src/content/services/<dil>/<slug>.yml` → hizmet + o dilin hizmet listesi
- `src/content/pages|legal/<dil>/<ad>` → ilgili sayfa (ROUTE_SLUGS üzerinden)
- `src/content/projects/<dil>/*` → proje listesi + ana sayfa (detay route'u yok)
- Silme/taşıma → eski URL "deleted" olarak listeye girer (sitemap guard'ından muaf;
  IndexNow 404/410/301 bildirimini destekler), yeni URL normal eklenir
- `src/content/settings/<dil>/site.yml` → yalnız o dilin tüm sayfaları
- Global kaynaklar (`src/components|layouts|styles|lib|pages|assets`, content
  şemaları, `references/`, `team/`, `astro.config.mjs`) → **global fallback**:
  aktif sitemap'in tamamı (yalnız bu durumda!)
- `tests/`, `scripts/`, `.github/`, kök `*.md`, lockfile, `public/` → **hiçbir gönderim yok**

Guard'lar: yalnız `https://pixelon.com.tr` host'u; eklenen/değişen URL üretimdeki
sitemap'te yoksa gönderilmez; aynı URL bir çalıştırmada bir kez gönderilir;
değişiklik yoksa `IndexNow: no indexable URL changes detected` yazılır ve API
isteği atılmaz. Güvenilmez diff tabanı (ilk push/force-push) → gönderim atlanır.

## Response Codes

`200` başarı · `202` alındı, anahtar doğrulaması bekliyor (ilk gönderimde normal) ·
`400/403/422` yapılandırma hatası → job kırmızı, inceleme gerekir ·
`429`/`5xx`/ağ → 30s/60s geri çekilmeli en fazla 2 tekrar, sonra warning (deploy
etkilenmez, sonsuz tekrar yok).

## Dry Run

```bash
bun scripts/seo/indexnow.ts --base <sha> --head <sha> --dry-run
```

Gönderilecek listeyi yazar, API isteği atmaz. Manuel workflow'un `dry_run` girdisi
aynı işi CI'da yapar.

## Key Rotation

1. Yeni anahtar üret: `openssl rand -hex 32`
2. `scripts/seo/indexnow-key.ts` içindeki değeri değiştir
3. `public/<eskiKEY>.txt` dosyasını sil, `public/<yeniKEY>.txt` oluştur (içerik = anahtar)
4. `bun run gate` — testler anahtar/dosya senkronunu ve tek anahtar kuralını zorlar

Anahtar protokol gereği herkese açıktır (sır değildir, GitHub Secret gerekmez);
yalnız doğrulama dosyasında yaşar — testler bundle/HTML'e sızmadığını da denetler.

## Troubleshooting

- **`202` sürüyor:** anahtar dosyası canlıda 200 dönüyor mu? (`curl -i https://pixelon.com.tr/<KEY>.txt`)
- **Job "güvenilir diff tabanı yok" dedi:** force-push/ilk push — gerekirse manuel workflow'dan gönderin.
- **Beklenmedik "global fallback":** log'daki `değişiklik: global: <dosya>` satırı hangi kaynağın tetiklediğini söyler.
- **Eski WordPress kaydı:** Bing'deki `/hello-world/` (RankMath) tarihsel kayıttır; bu otomasyonla ilişkisi yoktur.
