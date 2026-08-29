/**
 * Korunan yollarda cerrahi geri alma.
 *
 * Neden var: `agent.sh`, koşu sonrası korunan yollarda (`src`, `public`, ...)
 * değişiklik görürse temizlik yapıyordu — ama komut `git checkout -- src public`
 * biçiminde TOPTANDI ve o yollardaki commit'lenmemiş her şeyi siliyordu.
 * Ajanın yazdığını sahibin yazdığından ayırt etmiyordu.
 *
 * 29 Ağustos 2026'da `src/` ve `public/` altında sahibe ait, commit'lenmemiş
 * 137 dosya (13 vaka çalışması + 128 MB görsel) duruyordu. Ajan o koşuda
 * korunan yollardan birine dokunsaydı, temizlik sahibin işini de götürecekti.
 * Hata mesajı da çıkmayacaktı — geri alma "başarılı" sayılırdı.
 *
 * Kural: **geri alma yalnızca koşu sırasında yeni kirlenen yollara uygulanır.**
 * Koşu başlamadan önce zaten kirli olan yol sahibindir; ona dokunulmaz, ihlal
 * olarak loglanır ve sahip karar verir.
 */

/**
 * `git status --porcelain` çıktısının bir satırından yol çıkarır.
 * Biçim: iki karakter durum kodu, boşluk, yol. Yeniden adlandırmada
 * `eski -> yeni` gelir; geri alınacak olan hedef yoldur.
 * @param {string} line
 * @returns {string} yol; satır boşsa boş string
 */
function pathOf(line) {
  const trimmed = line.trim();
  if (!trimmed) return '';

  // Durum kodu iki karakter + en az bir boşluk. Yol tırnaklı gelebilir.
  const withoutStatus = trimmed.replace(/^\S{1,2}\s+/, '');
  const arrow = withoutStatus.indexOf(' -> ');
  const path = arrow === -1 ? withoutStatus : withoutStatus.slice(arrow + 4);
  return path.replace(/^"|"$/g, '');
}

/**
 * @param {string} porcelain `git status --porcelain -- <korunan yollar>` çıktısı
 * @returns {string[]} kirli yollar, çıktıdaki sırayla
 */
function pathsFrom(porcelain) {
  return (porcelain ?? '')
    .split('\n')
    .map(pathOf)
    .filter((p) => p.length > 0);
}

/**
 * Koşu BAŞLAMADAN önce kirli olan yollar — bunlar sahibin işidir.
 * @param {string} before
 * @returns {string[]}
 */
export function ownerDirtiedPaths(before) {
  return pathsFrom(before);
}

/**
 * Koşu SIRASINDA yeni kirlenen yollar — geri alınacak olanlar bunlardır.
 *
 * Koşu öncesinde de kirli olan bir yol listeye GİRMEZ: o yol sahibin işini
 * taşıyor olabilir ve geri almak veri kaybı demektir. Ajan böyle bir dosyayı
 * ayrıca değiştirmişse bu, geri almayla değil ihlal loguyla ele alınır.
 *
 * @param {string} before koşu öncesi porcelain çıktısı
 * @param {string} after koşu sonrası porcelain çıktısı
 * @returns {string[]}
 */
export function agentDirtiedPaths(before, after) {
  const known = new Set(pathsFrom(before));
  return pathsFrom(after).filter((p) => !known.has(p));
}

/**
 * CLI: `bun scripts/seo/protected-paths.mjs`
 *
 * Girdi ortam değişkenleriyle alınır, argv ile DEĞİL — `bun -e` argv indeksi
 * sürüme göre kayabiliyor (bir kez kökte `0` adlı dosya üretti, bkz. agent.sh).
 * Çıktı: geri alınacak yollar, satır başına bir tane.
 */
if (import.meta.main) {
  const paths = agentDirtiedPaths(process.env.PROTECTED_BEFORE_RAW ?? '', process.env.PROTECTED_AFTER_RAW ?? '');
  process.stdout.write(paths.join('\n'));
}
