# PIXELON SEO — APPROVAL QUEUE

```text
READY FOR APPROVAL: 0
MEASURING: 5
OWNER DECISION: 3
LIMIT: 3
```

**Son güncelleme:** 2026-08-23

> **Sayaç düzeltmesi (2026-08-23):** başlık `READY FOR APPROVAL: 2` diyordu; gerçek sayı
> **0**. `SEO-2026-0081` 22 Ağu 21:52'de sahip onayıyla yayınlandı, `SEO-2026-0082`
> onaylandı ve kullanımda. İkisi de artık onay beklemiyor. Kuyruk **boş** —
> yeni yayınlanabilir iş üretimi açık.
> **Mod:** `AUTONOMOUS_GROWTH` — çalışma kuralları `seo/AUTONOMOUS_MODE.md`

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

**Şu anda onay bekleyen iş yok.** Aşağıdaki kayıtlar yayınlanmış / ölçümdeki işlerin
geçmişidir.

---

### `SEO-2026-0081` — Yeni EN blog yazısı: sağlık sektöründe dijital reklam · ~~READY_FOR_APPROVAL~~ → YAYINDA

Taslak hazır, yerel gizli katmanda (`seo/private/drafts/`). ~1.450 kelime,
2 iç bağlantı (ikisi de canlı doğrulandı), SSS bloğu dahil.

**Gerekçe (toplulaştırılmış):** Son 90 günde sitenin toplam arama gösteriminin
**%72,5'i** İngilizce sağlık pazarlaması kümesinden geliyor ve bu kümenin
tıklaması **0**. Gösterimin %94'ü 21. sıranın altında — bu bir başlık/CTR sorunu
değil, sıralama derinliği sorunu. Küme 47 sorgu içeriyor ve neredeyse tamamı
**tek bir mevcut yazıya** düşüyor.

Taslak, bu kümenin **kapsanmamış ve ilk sayfaya en yakın** alt kümesini
hedefliyor (iki haneli gösterim, ağırlıklı ortalama pozisyon 3. sayfa bandında;
sitede karşılığı olan özel bir sayfa yok — kesin rakamlar özel katmanda). Mevcut yazının konumunu koruduğu alt kümeye dokunulmuyor —
niyet çakışması yok.

**Yayın zamanlaması önerisi:** 29 Ağustos kontrol noktasından **sonra**.
Yazı, şu anda MEASURING durumundaki hizmet sayfasına bağlantı veriyor; ölçüm
penceresini temiz tutmak için beklemek tercih edilir. Karar sahibindedir.

**Açık madde:** kapak görseli seçilmedi — bkz. `SEO-2026-0082`.

### `SEO-2026-0083` — Dentasay vaka çalışması · **YAYINDA / ÖLÇÜMDE**

22 Ağu 2026 13:15 +03 · `/projelerimiz/dentasay/` · `/en/projects/dentasay/`
Kontrol noktaları: +7g 29 Ağu · +14g 5 Eyl · +28g 19 Eyl.
**Sıralama değişimi vaka çalışmasına atfedilmez.**

### `SEO-2026-0086` — Bağlamsal iç bağlantı · **YAYINDA**

22 Ağu 2026 20:45 +03 · 4 sayfa. Blog yazılarında mevcut cümleye doğal çapa,
hizmet sayfalarında mevcut Dentasay kartına `href`. Bileşen değişikliği yok,
14 hizmet sayfasına rollout yok.

### `SEO-2026-0081` — EN sağlık sektöründe dijital reklam rehberi · **YAYINDA / ÖLÇÜMDE**

22 Ağu 2026 21:52 +03 · `/en/blog/healthcare-digital-advertising/`
Sahip açık onayı: _"OWNER APPROVAL — FINAL · SEO-2026-0081 APPROVED FOR PUBLISH"_.

3 iç bağlantı (healthcare-marketing · digital-advertising · **Dentasay vaka çalışması**),
3 birinci el resmî dış kaynak, 5 SSS, özgün kapak. Eski strateji yazısındaki
Google/Meta Ads bölümüne yeni yazıya tek bağlamsal bağlantı eklendi.

Ölçüm: +7g 29 Ağu · +14g 5 Eyl · +28g 19 Eyl.
İzlenen sorgu listesi ve taban rakamları **özel katmanda** tutulur
(`seo/private/measurement/`). **Nedensellik iddiası yapılmayacak.**

### `SEO-2026-0082` — 0081 kapak görseli · **ONAYLI / KULLANIMDA**

Sahip onayı **yalnız 0081 kapak kullanımıyla sınırlı**. Başka sayfaya rollout yok,
yeni görsel üretimi yok. Varlık artık production'da referanslı.

### `SEO-2026-0087` — Dentasay bağlantısı · **SUPERSEDED**

Dentasay canlı (200) doğrulandı; bağlantı doğrudan 0081 yayın paketine girdi.
Ayrı görev gereksiz kaldı.

`SEO-2026-0084` (dentasay-kurumsal-kimlik) ve `SEO-2026-0085` (ella-scarf) **DEFERRED** —
kaynak yetersiz, otonom kuyruğu meşgul etmiyorlar.

### `SEO-2026-0090` — Ölçüm tabanı donduruldu · **DONE** (2026-08-23)

22 Ağustos yayın paketinin (`0068` · `0069` · `0081` · `0083` · `0086`) **yayın öncesi
sayısal tabanı** kayıt altına alındı. Önceki koşularda ölçülecek metrikler tanımlıydı
ama taban kayıtlı değildi — bu haliyle 29 Ağustos karşılaştırması yapılamazdı.

Taban penceresi tüm yayınlardan **öncesini** kapsıyor; içinde yayın sonrası tek gün yok.
Yeni yayınlanan beş sayfanın hepsi tabanda **sıfır** — ölçüm açısından en temiz durum.

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

### `SEO-2026-0082` — ~~`SEO-2026-0081` için kapak görseli~~ · KAPANDI

22 Ağu 21:52 sahip onayıyla çözüldü: özgün görsel üretildi ve yalnızca 0081 kapağı
olarak kullanımda. Karar bekleyen bir şey kalmadı.

### `SEO-2026-0089` — EN healthcare branding sayfası · **KANIT TAMAM, GİRDİ BEKLİYOR**

Bu bir onay talebi **değil** — içerik yazılmadı. Kanıt zinciri tamamlandı, bir
halka eksik.

**Ölçülen (2026-08-23, SEMrush):** hedef sorgunun aylık hacmi dört haneli, zorluk
endeksi kümedeki en düşükler arasında, niyeti **ticari**. İlk 10'un **8'i gerçek
ajans hizmet sayfası** — büyük yayıncı veya akademik yayın yok. Yani bir ajansın
kazanabileceği tipte bir SERP.

**Neden yazılmadı:** Pixelon'ın sağlık dikeyinde markalama işi elde doğrulanmış tek
bir vaka üzerinde duruyor ve o vakanın kurumsal kimlik tarafı için yalnızca birkaç
cümlelik kaynak var. Gösterilecek gerçek iş olmadan yazmak "sayı için içerik" olurdu.

**Açan girdi:** `SEO-2026-0084` — `dentasay-kurumsal-kimlik` gerçek proje anlatımı.
Bu gelirse taslak yazılabilir ve normal onay akışına girer.

_Sahip kararı kayıtları onay kuyruğu limitine sayılmaz; yayın engellemez._
