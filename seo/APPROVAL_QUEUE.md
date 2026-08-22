# PIXELON SEO — APPROVAL QUEUE

```text
READY FOR APPROVAL: 2
MEASURING: 2
OWNER DECISION: 2
LIMIT: 3
```

**Son güncelleme:** 2026-08-22
**Mod:** `AUTONOMOUS_GROWTH` — çalışma kuralları `seo/AUTONOMOUS_MODE.md`

---

## Onay komutları

```text
APPROVE SEO-2026-00XX                  tek görevi onayla
APPROVE SEO-2026-00XX SEO-2026-00YY    birden fazla
APPROVE ALL READY                      yalnızca READY_FOR_APPROVAL olanlar
REJECT SEO-2026-00XX                   reddet (silinmez, REJECTED olur)
REVISE SEO-2026-00XX: [talimat]         revize et, tekrar onaya sun
```

---

## Onay bekleyen

### `SEO-2026-0081` — Yeni EN blog yazısı: sağlık sektöründe dijital reklam · READY_FOR_APPROVAL

Taslak hazır, yerel gizli katmanda (`seo/private/drafts/`). ~1.450 kelime,
2 iç bağlantı (ikisi de canlı doğrulandı), SSS bloğu dahil.

**Gerekçe (toplulaştırılmış):** Son 90 günde sitenin toplam arama gösteriminin
**%72,5'i** İngilizce sağlık pazarlaması kümesinden geliyor ve bu kümenin
tıklaması **0**. Gösterimin %94'ü 21. sıranın altında — bu bir başlık/CTR sorunu
değil, sıralama derinliği sorunu. Küme 47 sorgu içeriyor ve neredeyse tamamı
**tek bir mevcut yazıya** düşüyor.

Taslak, bu kümenin **kapsanmamış ve ilk sayfaya en yakın** alt kümesini
hedefliyor (80 gösterim, ağırlıklı ortalama pozisyon 26,4; sitede karşılığı olan
özel bir sayfa yok). Mevcut yazının konumunu koruduğu alt kümeye dokunulmuyor —
niyet çakışması yok.

**Yayın zamanlaması önerisi:** 29 Ağustos kontrol noktasından **sonra**.
Yazı, şu anda MEASURING durumundaki hizmet sayfasına bağlantı veriyor; ölçüm
penceresini temiz tutmak için beklemek tercih edilir. Karar sahibindedir.

**Açık madde:** kapak görseli seçilmedi — bkz. `SEO-2026-0082`.

### `SEO-2026-0083` — Dentasay vaka çalışması · **YAYINDA / ÖLÇÜMDE**

Sahip onayıyla 22 Ağu 2026 13:15 +03'te yayınlandı:

- `/projelerimiz/dentasay/`
- `/en/projects/dentasay/`

Ölçüm kontrol noktaları: +7g 29 Ağu · +14g 5 Eyl · +28g 19 Eyl.
Takip edilen: gösterim, tık, sorgu, yönlendiren iç sayfa.
**Sıralama değişimi vaka çalışmasına atfedilmez** — yalnız gözlenen sinyal raporlanır.

Takip işi: `SEO-2026-0086` — bağlamsal iç bağlantı, **onay bekliyor**.
Kapsam bilinçli olarak dar: yalnız TR+EN sağlık turizmi hizmet sayfası ve
2 healthcare blog yazısı. Dentasay'dan söz eden **14 hizmet sayfasının tamamına
rollout yapılmayacak.**

`SEO-2026-0084` (dentasay-kurumsal-kimlik) ve `SEO-2026-0085` (ella-scarf) **DEFERRED** —
kaynak yetersiz, otonom kuyruğu meşgul etmiyorlar.

### `SEO-2026-0068` — İki yeni hizmet sayfası · MEASURING

`/hizmetlerimiz/kurumsal-web-tasarim/` · `/en/services/healthcare-marketing/`
Yayın: 2026-08-22 11:40 · Kontrol: **29 Ağu** / **5 Eyl** / **19 Eyl**
Ölçülen: gösterim · tıklama · CTR · ortalama konum · sorgular · landing page performansı

Bugün canlı doğrulama: her iki URL de **200**, yönlendirme yok.

**Kural:** yeterli veri oluşmadan büyük yeniden yazım yapılmaz.

### `SEO-2026-0069` — Eski URL yönlendirmeleri · MEASURING

12 kural canlı, 301 → tek hop → 200. Baseline 2026-08-22 11:40'ta donduruldu.
Kontrol: **29 Ağu** / **5 Eyl** / **19 Eyl**

Bugün canlı doğrulama: örneklenen eski URL'ler **301, tek hop**; kanonik
sondaki-bölü yönlendirmeleri de **301, tek hop**; `http://` → `https://` çalışıyor.

**Kural:** sıralama değişimi 301'e atfedilmez; yalnızca gözlenen sinyal raporlanır.

---

## Sahip kararı bekleyen

### `SEO-2026-0073` — Hizmet sayfalarında hero görseli · P2

22 hizmet sayfasının hiçbirinde hero görseli yok ve `ServiceDetail` `cover` alanını
okumuyor. İki sayfaya görsel eklemek site bütünlüğünü bozardı.

**Seçenekler:** (a) görselsiz devam — mevcut desene uyar; (b) 22 hizmet sayfasına
birden görsel sistemi kur — ayrı ve büyük bir iş. Brief'ler hazır bekliyor.

### `SEO-2026-0082` — `SEO-2026-0081` için kapak görseli · P2

**Seçenekler:** (a) mevcut sağlık pazarlaması kapak görselini paylaş — sıfır
maliyet, iki yazı aynı görseli kullanır; (b) `seo/VISUAL-SYSTEM.md` kurallarına
göre yeni görsel üret — ayrı iş.

_Sahip kararı kayıtları onay kuyruğu limitine sayılmaz; yayın engellemez._
