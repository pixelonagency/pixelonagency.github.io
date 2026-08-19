/**
 * IndexNow anahtarının TEK doğruluk kaynağı.
 *
 * Anahtar, IndexNow protokolü gereği `public/<KEY>.txt` dosyasıyla herkese açık
 * olarak yayımlanır — yani bir "sır" DEĞİLDİR; GitHub Secret gerektirmez. Burada
 * merkezî tutulmasının amacı kolay döndürülebilmesidir (bkz. INDEXNOW.md → Key
 * Rotation): değer değiştiğinde `public/<eskiKEY>.txt` silinip `public/<yeniKEY>.txt`
 * oluşturulur; dist-smoke testi ikisinin senkron olduğunu zorlar.
 *
 * Biçim kuralı (indexnow.org): 8–128 karakter, yalnızca a-z A-Z 0-9 ve tire.
 */
export const INDEXNOW_KEY = 'c4d8be782a330e643cd1d33da84aa6104e6df9e2965c5adf83561763668f4328';
