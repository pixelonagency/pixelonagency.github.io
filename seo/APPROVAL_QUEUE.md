# PIXELON SEO — APPROVAL QUEUE

```text
READY FOR APPROVAL: 0
MEASURING: 2
OWNER DECISION: 1
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

Şu anda onay bekleyen iş yok. Kuyruk boş — sistem yeni yayınlanabilir iş üretebilir.

---

## Ölçümde (müdahale edilmeyecek)

### `SEO-2026-0068` — İki yeni hizmet sayfası · MEASURING

`/hizmetlerimiz/kurumsal-web-tasarim/` · `/en/services/healthcare-marketing/`
Yayın: 2026-08-22 11:40 · Kontrol: **29 Ağu** / **5 Eyl** / **19 Eyl**
Ölçülen: gösterim · tıklama · CTR · ortalama konum · sorgular · landing page performansı

**Kural:** yeterli veri oluşmadan büyük yeniden yazım yapılmaz.

### `SEO-2026-0069` — Eski URL yönlendirmeleri · MEASURING

12 kural canlı, 301 → tek hop → 200. Baseline 2026-08-22 11:40'ta donduruldu.
Kontrol: **29 Ağu** / **5 Eyl** / **19 Eyl**

**Kural:** sıralama değişimi 301'e atfedilmez; yalnızca gözlenen sinyal raporlanır.

---

## Sahip kararı bekleyen

### `SEO-2026-0073` — İki yeni sayfa için hero görseli · P2

22 hizmet sayfasının hiçbirinde hero görseli yok ve `ServiceDetail` `cover` alanını
okumuyor. İki sayfaya görsel eklemek site bütünlüğünü bozardı.

**Seçenekler:** (a) görselsiz devam — mevcut desene uyar; (b) 22 hizmet sayfasına
birden görsel sistemi kur — ayrı ve büyük bir iş. Brief'ler hazır bekliyor.

_Bu kayıt onay kuyruğu limitine sayılmaz; yayın engellemez._
