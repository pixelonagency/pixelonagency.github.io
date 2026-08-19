# Microsoft Clarity — Pixelon Uygulama Mimarisi

Amaç: privacy-safe, consent-aware, çerez davranışı canlıda doğrulanmış, PII maskelenmiş,
GTM üzerinden yönetilen ve mevcut GA4/Klaro mimarisini bozmayan Clarity kurulumu
(oturum kaydı + ısı haritası + davranış analitiği). Bu fazda Microsoft Ads / UET /
remarketing YOK.

## Architecture

| Parça   | Karar                                                                                                                                                                                                                     |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project | Tek proje: `Pixelon` → `https://pixelon.com.tr/` — **Project ID: `y4y9pvz009`** (tek kaynak: `src/lib/analytics.ts` → `CLARITY_PROJECT_ID`)                                                                               |
| Yükleme | YALNIZ GTM → Community Template Gallery → **"Microsoft Clarity - Official"** template. Site koduna doğrudan `clarity.ms` script'i eklenmez (dist testleri her HTML'de yasaklar) — tek tracker, duplicate kurulum imkânsız |
| Tag adı | `Microsoft Clarity - Pixelon` (Project ID `y4y9pvz009`, Custom/Session ID boş), trigger: All Pages — GTM'de oluşturuldu, Preview testleri öncesi publish edilmedi                                                         |
| /admin/ | Otomatik kapsam dışı: `/admin/` sayfalarında GTM hiç yüklenmez (dist testli) → Clarity da yüklenemez; ek trigger istisnası gerekmiyor                                                                                     |
| Klaro   | Yeni kategori YOK — `microsoft-clarity` servisi Analitik kategorisi altında (`src/lib/consent-config.ts`); `cookies: [/^_clck/, /^_clsk/]` deseniyle revoke'ta çerezler google-analytics ile aynı mekanizmayla silinir    |

## Consent Strategy (resmî dokümana göre, test-first)

Resmî kaynak durumu (2026-08-19'da doğrulandı):

- `consent-management` (güncelleme 2026-05-21): sinyal yolları = Consent API, destekli
  CMP'ler, üçüncü taraf platformlar, **Google Consent Mode — "GCM uygulayan siteler için
  önerilir"**.
- `cookie-consent`: otomatik CMP entegrasyonu şimdilik yalnız CookieYes; özel CMP'ler
  (Klaro dahil) Consent API kullanmalı.
- Bu ikisi çelişkili olabildiği için **doküman değil, gerçek production davranışı
  source-of-truth**tur.

**SONUÇ (2026-08-19, GTM Preview canlı testi):** GCM otomatik yorumu GÜVENİLMEZ çıktı —
Klaro'da Analytics=granted + Marketing=denied iken Clarity metadata'sı `ad_Storage: granted`,
`analytics_Storage: denied` (ters) döndürdü. Bu nedenle **explicit Consent API v2 köprüsü
AKTİF**: kaynak yalnız Klaro tercihleri; sinyal `microsoft-clarity` servis callback'indeki
`updateClarity()` ile gönderilir (`src/lib/consent-config.ts`). Kesin eşleme:

| Klaro Analytics | consentv2                                                |
| --------------- | -------------------------------------------------------- |
| OFF             | `{ ad_Storage: 'denied', analytics_Storage: 'denied' }`  |
| ON              | `{ ad_Storage: 'denied', analytics_Storage: 'granted' }` |

`ad_Storage` bu fazda **koşulsuz denied** — Klaro Marketing izni Clarity'ye hiçbir sinyal
göndermez (Microsoft Ads/UET ayrı faz). Köprünün resmî sözdizimi:

```js
window.clarity('consentv2', {
  ad_Storage: 'denied', // BU FAZDA HER ZAMAN denied (Microsoft Ads ayrı faz)
  analytics_Storage: consent ? 'granted' : 'denied',
});
```

Konum: `microsoft-clarity` Klaro servisinin `callback`'i — Klaro her uygulanışta
(ilk yükleme, karar, revoke, kayıtlı tercihle dönen ziyaretçi) çağırır. Race
güvenliği resmî kuyruk sözleşmesiyle sağlanır: `window.clarity` yoksa köprü, resmî
yükleyicinin stub'ıyla birebir aynı kuyruğu kurar
(`function(){(clarity.q=clarity.q||[]).push(arguments)}`); Clarity script'i
yüklendiğinde kuyruğu boşaltır, script zaten yüklüyse çağrı anında uygulanır —
**setTimeout/polling/retry yok**. Eski `clarity('consent', ...)` API'si deprecation
yolunda — YALNIZ revoke testinde consentv2'nin çerez temizliği yetersiz kalırsa
resmî cleanup olarak değerlendirilir.

### Beklenen consent matrisi

| Senaryo             | analytics_Storage | ad_Storage | Beklenen                                                                                                                                                                      |
| ------------------- | ----------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fresh / Reject All  | denied            | denied     | Script çalışabilir (no-consent mode: sayfa başına kimlik, sınırlı veri); `_clck`/`_clsk` YOK, kalıcı oturum YOK                                                               |
| Analytics only      | granted           | **denied** | Tam analitik + kayıt + ısı haritası; `_clck`/`_clsk` oluşabilir                                                                                                               |
| Marketing only      | denied            | **denied** | Analitik çerezleri OLUŞMAZ (Marketing izni Clarity'yi açmaz)                                                                                                                  |
| Accept All          | granted           | **denied** | Tam analitik; **Microsoft Ads paylaşımı bu fazda kapalı**                                                                                                                     |
| Revoke (aynı sayfa) | denied            | denied     | Yeni çerez tabanlı izleme durur; `_clck`/`_clsk` Klaro `cookies` mekanizmasıyla silinir — kalıyorsa production issue olarak raporlanır ve resmî erase mekanizması test edilir |

Race senaryoları (hepsi test edilecek): consent GTM'den önce hazır / Clarity geç yükleniyor /
banner açıkken karar / kayıtlı tercihle dönen ziyaretçi / tercih ekranından revoke.

## Masking

- Dashboard: Settings → Masking → **Balanced** (Relaxed YASAK; Strict gereksiz).
- Form yüzeyleri (İletişim, Ücretsiz Analiz, landing, ana sayfa contact): tüm PII yalnız
  `<input>/<textarea>/<select>` içinde; success/error panelleri sabit çeviri metnidir,
  kullanıcı verisi DOM'a yazılmaz (kaynak incelendi) → ek `data-clarity-mask` şimdilik
  gerekmiyor; production replay doğrulaması yine de yapılacak. PII içeren hiçbir elemanda
  `data-clarity-unmask` KULLANILMAZ. İleride kullanıcı verisi DOM'a yazılırsa
  `data-clarity-mask="True"` eklenir.

## Cookies (belgelenen — canlı gözlem AKTİVASYON SONRASI işlenecek)

Birinci taraf: `_clck` (kullanıcı kimliği/tercih), `_clsk` (oturum birleştirme).
Üçüncü taraf (Microsoft): `CLID`, `MUID`, `ANONCHK`, `MR`, `SM` — canlıda gözlenirse
raporlanır; `ad_Storage=denied`e rağmen oluşan olursa nedeni araştırılmadan Ads Active
denmez. Çerez/Gizlilik Politikası yalnız gözlemlenmiş değerlerle güncellenir
(aktivasyon sonrası ayrı adım) — "Clarity hiç veri toplamaz" gibi yanlış ifade
kullanılmaz; no-consent mode'un çerezsiz sınırlı veri ürettiği doğru anlatılır.

## Verification (aktivasyon sonrası koşulacak)

1. GTM **Preview**: fresh denied / analytics accept / revoke — tag state + çerezler.
   Preview temiz olmadan Publish YOK.
2. Publish sonrası production: consent matrisi + ağ testi (clarity.ms istekleri; denied'de
   kalıcı kimlik yok), form alanlarına yazılan benzersiz test değerlerinin Clarity
   payload'larında düz metin bulunmadığı, GA4 isteklerinin değişmediği, Lighthouse/CWV
   regresyonu (LCP, blocking, script sayısı; Clarity render-blocking olamaz).
3. Clarity dashboard: Installation status, canlı oturum, kayıt; replay'de input içerikleri
   okunamamalı. Heatmap: homepage + contact + free analysis veri toplayabilmeli
   (propagation süresi resmî dokümana göre beklenir).
4. Temizse envanter **Active**'e çekilir + Cookie/Privacy Policy TR+EN gözlemlenmiş
   değerlerle güncellenir (IndexNow yalnız değişen policy URL'lerini bildirir).

## Troubleshooting

- Consent sinyali gitmiyor gibi görünüyorsa: dataLayer'da `consent default/update`
  sıralamasını ve Clarity tag'inin yüklendiğini GTM Preview'da doğrula; GCM yolu
  çalışmıyorsa consentv2 köprüsünü aç (yukarıdaki snippet, Klaro callback).
- `_clck/_clsk` revoke sonrası kalıyorsa: Klaro `cookies` deseninin çalıştığını,
  gerekiyorsa resmî erase davranışını (eski `consent,false`) test et; sonucu envantere işle.
- Kayıtlarda PII görünüyorsa: ilgili elemana `data-clarity-mask="True"`, asla unmask etme.
