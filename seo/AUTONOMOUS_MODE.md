# PIXELON SEO — OTONOM BÜYÜME MODU

**Yürürlük:** 2026-08-22 · **Mod:** `AUTONOMOUS_GROWTH`

Sistem her gün kendi kendine çalışır. Sahip yalnızca yayın ve risk kararlarında onay verir.

---

## Faz durumu

| Faz                                        | Durum                                                  |
| ------------------------------------------ | ------------------------------------------------------ |
| Altyapı (hosting, CI/CD, yönlendirme, TLS) | **KAPALI** — yeni bir üretim sorunu çıkmadıkça açılmaz |
| SEO büyüme                                 | **AKTİF**                                              |

**Altyapıda yapılmayacaklar:** Cloudflare ayarlarını kurcalamak · hosting migration işi üretmek ·
yönlendirme sistemini değiştirmek · deploy hattını yeniden tasarlamak.

---

## Günlük döngü

Her `seo:daily` koşusunda sırasıyla:

1. GSC verisini güncelle
2. Gerekirse SEMrush köprüsünü tazele
3. Teknik regresyon kontrolü
4. Açık görevleri değerlendir
5. Yeni fırsatları tespit et
6. **En yüksek öncelikli en fazla 3 anlamlı görevi ilerlet**
7. `SEO_STATE.private.json` güncelle
8. Onay kuyruğunu güncelle
9. Morning Brief üret

## Öncelik formülü

```
İş Değeri × Arama Fırsatı × Mevcut Google Sinyali × Güven
─────────────────────────────────────────────────────────
                  Efor × Risk
```

## Küme önceliği

| Seviye | Küme                                                               |
| ------ | ------------------------------------------------------------------ |
| **P0** | Web Design / Kurumsal Web Tasarım · Healthcare Marketing (EN)      |
| **P1** | Sosyal Medya · İçerik Pazarlama · Otorite / backlink çeşitlendirme |

GSC daha güçlü bir fırsat gösterirse **veri önceliği değiştirir** — bu liste bağlayıcı değil, başlangıç.

---

## Onay politikası

**Onaysız yapılabilir:** keşif · araştırma · analiz · planlama · taslak yazımı · hazırlık · test · ölçüm

**READY_FOR_APPROVAL olarak durulur:**
yeni hizmet sayfası · yeni landing page · yeni blog yayını · büyük yeniden yazım ·
önemli title/H1 değişikliği · geniş iç bağlantı yayılımı

**Asla otomatik yapılmaz:**
URL değişikliği · yönlendirme · canonical/noindex/robots · DNS/Cloudflare ·
yıkıcı taşıma · ücretli backlink · dış iletişim (outreach) · para harcama

**Kuyruk sınırı: 3.** Üçe ulaşıldığında yeni _yayınlanabilir_ iş üretilmez; ancak analiz,
ölçüm, rakip araştırması, backlink araştırması ve teknik izleme devam eder.
**Bekleyen bir onay tüm sistemi durdurmaz.**

---

## İçerik kalitesi

İçerik sayısı artırmak için içerik üretilmez. Her yeni içerik için önce **kanıt** gerekir:
GSC sinyali ve/veya SEMrush fırsatı ve/veya SERP içerik boşluğu.

Hedef: insana fayda + özgün içgörü + gerçek Pixelon deneyimi + sağlam yapı.
AI dedektöründen kaçmak hedef değildir. **Metrik uydurulmaz.**

---

## Backlink politikası

**Yapılabilir:** Behance fırsatı hazırlama · Dribbble değerlendirmesi · Clutch · Sortlist ·
kaliteli gerçek dizin/profil · editöryel yayın araştırması · proje/case-study dağıtım planı

**Yapılmaz:** otomatik outreach · müşteri sitesine footer link ekleme · PBN ·
satın alınmış dofollow · spam dizin · sahte yorum

---

## Ölçüm disiplini

Yeni yayınlanan sayfalar ve yönlendirmeler **MEASURING** durumundadır.
Yeterli veri oluşmadan büyük yeniden yazım yapılmaz. Kontrol noktaları: **+7 / +14 / +28 gün**.

Sıralama değişimi bir değişikliğe **atfedilmez**; yalnızca gözlenen sinyal raporlanır.

---

## Maliyet politikası

İlk koşu 46 tur / 12,5 dk / **4,19 USD** ile geçti. Bu bootstrap maliyetiydi; günlük
denge durumu bundan ucuz olmalı. **Yeniden kullanım, yeniden çekmeye tercih edilir.**

| Koşu                 | Veri tazeleme                                                                                                                                                                                                                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Günlük**           | Normalize SEMrush paketi yeniden kullanılır. Yeni çağrı yalnızca seçilen görev paketin kapsamadığı bir kelime/domain gerektiriyorsa ya da paket ~7 günden eskiyse. Rakip ve backlink araştırması her gün tekrarlanmaz. Geniş web araştırması yalnızca görev gerektiriyorsa. Kaynak ağacı değişmediyse teknik denetim tekrar koşulmaz. |
| **Haftalık** (Pazar) | Daha derin rakip / backlink / SERP tazelemesi uygun.                                                                                                                                                                                                                                                                                  |
| **Aylık**            | Kapsamlı pazar tazelemesi uygun.                                                                                                                                                                                                                                                                                                      |

Her koşu sonunda raporlanır: tur · süre · maliyet · ilerletilen görev ·
**anlamlı görev başına maliyet** · **yeniden kullanılan vs yeni çekilen veri**.

İlk hafta sert tavan **5,00 USD**. Hedef, günlük koşunun bu tavana sürekli
yaklaşmaması. 3–5 günlük gerçek veriden sonra bütçe yeniden değerlendirilecek.
Bütçe bir tavandır, hedef değildir.
