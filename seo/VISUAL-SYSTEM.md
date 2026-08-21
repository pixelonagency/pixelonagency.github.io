# PIXELON SEO — GÖRSEL İÇERİK SİSTEMİ

Her içerik brief'i bir **VISUAL PLAN** içerir. Görsel eklemeden önce tek soru:

> Bu görsel kullanıcıya **ilave bilgi veya anlayış** sağlıyor mu?

Hayırsa görsel üretilmez. Sayfayı doldurmak için dekoratif AI görseli yasaktır.

---

## 1. Öncelik sırası — bağlayıcı

```text
ORIGINAL INFORMATION  →  ORIGINAL DESIGN  →  REAL PROJECT MATERIAL
     →  SCREENSHOT  →  DIAGRAM  →  DECORATIVE IMAGE
```

**Gerçek Pixelon çalışması, AI üretimi ve stok görselden her zaman önceliklidir.**
Üretmeden önce `src/assets/images/` ve `src/content/projects/` içinde konuya uygun
gerçek proje materyali olup olmadığı kontrol edilir.

---

## 2. Marka tokenları — `src/styles/tokens.css`'ten okundu, uydurulmadı

| Token             | Değer         | Kullanım                                   |
| ----------------- | ------------- | ------------------------------------------ |
| `--accent`        | `#cfff00`     | **Tek aksan rengi.** Küçük alan, tek vurgu |
| `--bg`            | `#0a0a0a`     | Koyu zemin                                 |
| `--bg-footer`     | `#050505`     | En koyu yüzey                              |
| `--bg-light`      | `#ffffff`     | Açık bölüm                                 |
| `--bg-tint`       | `#f5f5ef`     | Krem ton                                   |
| `--text`          | `#ffffff`     | Koyu zeminde metin                         |
| `--text-on-light` | `#0a0a0a`     | Açık zeminde metin                         |
| `--font-display`  | Space Grotesk | Başlık                                     |
| `--font-body`     | Archivo       | Gövde                                      |
| `--radius-media`  | `16px`        | Görsel köşe yarıçapı                       |

> **Düzeltme kaydı:** Ağustos 2026'daki blog görsel üretiminde prompt'larda
> `#C8F04B` kullanıldı; gerçek marka aksanı **`#cfff00`**. Sonraki üretimlerde
> doğru değer kullanılacak, mevcut görseller yeniden üretilirken düzeltilecek.

---

## 3. Yerleşik blog görsel dili

23 yazılık blog kümesinde kullanılan ve **korunması gereken** dil:

- Fotorealistik ajans/ofis sahnesi — koyu mat iç mekân, ahşap/cam aksan
- Siyah kıyafetli ekip; sahne konuya **özel** (soyut metafor değil)
- Ekranlarda gri tonlu pano/site düzeni; lime yalnızca küçük vurgu
- Ekrandaki ve basılı **tüm metin okunamaz** — sahte Türkçe/İngilizce yazı yok
- Üçüncü taraf logosu/kelime markası yok
- Kapak `1920×1080`, iç görsel `1600×900`, WebP q86

**Her yazıda farklı AI art stili kullanılmaz.** Site bütünlüğü korunur.

---

## 4. Yasak görsel tipleri

- Jenerik AI stok görseli
- Anlamsız 3D objeler, futuristik/robot/beyin/devre klişeleri
- Yapay görünen insan yüzleri
- Üzerine anlamsız yazı basılmış AI görselleri
- Yalnızca sayfayı doldurmak için konan dekoratif görsel
- Gerçek bir marka/uygulama arayüzünü taklit eden ekran

---

## 5. Görsel yoğunluğu

Sabit sayı kuralı **yok**. İçerik türü belirler.

~1.500 kelimelik kapsamlı rehber için tipik: 1 kapak + 2–4 açıklayıcı görsel
(+ gerekiyorsa 1 diyagram). Konu gerektirmiyorsa daha az.

---

## 6. Image SEO kontrol listesi

Yayınlanan her görsel için:

- [ ] Açıklayıcı dosya adı (konu-anlatan-slug.webp)
- [ ] Gerçekte ne göründüğünü anlatan alt metin — **keyword stuffing yok**
- [ ] `width` / `height` (CLS)
- [ ] Responsive `srcset` (`astro:assets` otomatik üretir)
- [ ] WebP / AVIF
- [ ] Makul dosya boyutu
- [ ] Above-the-fold ise `loading` stratejisi doğru

> Alt metin kuralı: **görseli açıp gördüğünü yaz.** Prompt'a göre yazma —
> üretilen görsel prompt'la örtüşmeyebiliyor. (Bu hata Ağustos 2026'da yaşandı.)

---

## 7. Onay akışı

Magnific ile üretilen görseller production'a **otomatik eklenmez.**
İçerik `READY_FOR_APPROVAL` olduğunda görseller aynı pakette sunulur:

```text
Content: SEO-2026-00XX
Visuals:
  - cover.webp
  - process-diagram.webp
Status: READY_FOR_APPROVAL
```

İçerik onaylandığında görseller de onaylanmış sayılır. Ayrıca görsel revizyonu
istenirse yayınlanmaz.
