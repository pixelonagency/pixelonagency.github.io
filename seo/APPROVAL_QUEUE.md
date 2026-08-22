# PIXELON SEO — APPROVAL QUEUE

```text
READY FOR APPROVAL: 3
HIGH PRIORITY (P0/P1): 2
MEDIUM: 1
HIGH RISK: 0
```

**Son güncelleme:** 2026-08-22
**Mod:** `APPROVAL_REQUIRED` — production yayını yalnızca açık onayla yapılır.

---

## Onay komutları

```text
APPROVE SEO-2026-0011                  tek görevi onayla
APPROVE SEO-2026-0011 SEO-2026-0014    birden fazla
APPROVE ALL READY                      yalnızca READY_FOR_APPROVAL olanlar
REJECT SEO-2026-0011                   reddet (silinmez, REJECTED olur)
REVISE SEO-2026-0011: [talimat]         revize et, tekrar onaya sun
```

---

## Kuyruk

### `SEO-2026-0068` — İki yeni hizmet sayfasının yayını · **P0** · READY_FOR_APPROVAL

Dosyalar yazıldı, build ve gate geçti, yayına alınmadı. Kapsam A–F (2 yeni sayfa +
4 mevcut sayfa düzenlemesi). Ayrıntı yerel gizli katmandaki uygulama raporunda.

**Risk:** düşük — P0/P1 sıfır, orphan sıfır, kırık link sıfır, 830 test geçiyor.
**Bekleyen karar:** görseller yayından önce mi üretilsin, yoksa varsayılan og:image ile mi çıkılsın.

---

### `SEO-2026-0069` — Eski URL yönlendirmeleri · **P0** · BLOCKED → READY_FOR_APPROVAL

Onaylı 6 yönlendirme hazır (gizli katmanda import dosyası). Uygulama gerçek 301
üretebilen bir TLS mimarisi kararına bağlı.

**Yeni kanıt (2026-08-22):** ölçülen 5 çiftin **5'inde de** eski 404 URL, canlı
karşılığından daha yüksek sıralıyor. İki durumda canlı sayfa arama verisinde hiç
görünmüyor. Bu iş artık "kayıp gösterim kurtarma" değil, **canlı hizmet
sayfalarının sıralayabilmesinin önündeki engel.**

---

### `SEO-2026-0070` — Hizmet sayfalarında satır içi bağlantı desteği · **P2** · ✅ TAMAMLANDI (2026-08-22)

Hizmet YAML alanları Markdown render etmiyor; şema da bunu "markdown değil" diye
belgeliyor. Üç seçenek değerlendirildi:

1. **Mevcut şemayla çözülür mü?** Kısmen — yalnızca `projects.items[].href` bağlantı
   kabul ediyor. Gövde metninde bağlantı mümkün değil.
2. **Mevcut CTA/related deseni?** Hizmet sayfalarında böyle bir desen yok; yeni bölüm
   eklemek şema değişikliği demek, daha büyük bir müdahale.
3. **Küçük ve geriye dönük uyumlu çözüm — önerilen.** Kodda zaten test edilmiş bir
   `inlineHtml()` yardımcısı var (`src/components/article/types.ts`): HTML kaçırır,
   `[etiket](/yol)` biçimini bağlantıya çevirir, güvenli olmayan adresi reddeder ve
   site içi yolu kanonik biçime çeker (301 harcamaz). Blog tarafında üretimde çalışıyor.

**Plan:** `ServiceDetail.astro` içinde gövde metni alanlarını bu yardımcıdan geçirmek.
Yeni bağımlılık yok, yeni yardımcı yok. Köşeli parantez içermeyen mevcut 20 hizmet
sayfasının çıktısı değişmez — geriye dönük uyumlu.

**Uygulandı.** Mevcut `inlineHtml()` kullanıldı; yeni parser/bağımlılık yok. Geriye dönük
uyumluluk token seviyesinde kanıtlandı: bileşenler geri alınıp yeniden derlendi, dokunulmamış
sayfa ve mevcut hizmet sayfası çıktısı **birebir aynı** çıktı. 13 unit + 7 render testi eklendi.

---

### `SEO-2026-0073` — İki yeni hizmet sayfası için hero görseli · **P2** · KARAR BEKLİYOR

Görsel üretimi **durduruldu**. Sebep: 20 mevcut hizmet sayfasının **hiçbirinde** hero
görseli yok (`cover` alanı 22 dosyanın 22'sinde tanımsız) ve `ServiceDetail` bu alanı
zaten okumuyor. Site genelinde hero görseli yalnızca 4 sayfada var: TR/EN ana sayfa ve
TR/EN hakkımızda.

İki yeni sayfaya görsel eklemek 22 hizmet sayfasından 2'sini farklılaştırırdı ve
`VISUAL-SYSTEM.md`'nin iki kuralına aykırı olurdu: "dekoratif AI görseli yasaktır" ve
"site bütünlüğü korunur".

**Seçenekler:** (a) görselsiz yayınla — mevcut desene uyar, og:image marka görseline
düşer; (b) 22 hizmet sayfasına birden görsel sistemi kur — ayrı ve büyük bir iş.
Brief'ler hazır bekliyor.

İlk analiz turu tamamlandı; içerik/landing page üretimi bir sonraki adımda başlayacak ve
her biri burada `READY_FOR_APPROVAL` olarak listelenecek.

---

## Sırada hazırlanacaklar (henüz onay istemiyor)

| ID            | İş                                        | Öncelik | Neden                                                 | Risk |
| ------------- | ----------------------------------------- | ------- | ----------------------------------------------------- | ---- |
| SEO-2026-0011 | Sağlık turizmi ticari landing page        | P1      | Pixelon'ın en güçlü nişi, SERP'te en zayıf olduğu yer | LOW  |
| SEO-2026-0014 | Web tasarım fiyatları ticari sayfa        | P1      | Hiçbir rakipte fiyat sayfası yok — SERP'te boş alan   | LOW  |
| SEO-2026-0012 | Web tasarım ticari landing page           | P1      | SERP'te sorgu odaklı sayfalar sıralanıyor             | LOW  |
| SEO-2026-0013 | Klinik / doktor web sitesi sektör sayfası | P1      | Dikey niş, düşük rekabet, gerçek Pixelon deneyimi var | LOW  |

> Bunlar önce content brief → draft → QA sürecinden geçecek, sonra buraya
> `READY_FOR_APPROVAL` olarak taşınacak. Onayınız olmadan hiçbiri yayınlanmaz.

---

## Geçmiş

| Tarih | ID  | Karar | Not                    |
| ----- | --- | ----- | ---------------------- |
| —     | —   | —     | Henüz onay geçmişi yok |
