# SEO Keyword / Intent Map — Pixelon

Kaynak: mevcut site içeriği + hizmet yapısı. **Gerçek sorgu verisi (Search Console) olmadan tahmini önceliklendirmedir** —
GSC erişimi sağlandığında impressions/query verisiyle güncellenmelidir (bkz. OWNER_ACTIONS).
Kural: her intent'in TEK primary landing page'i vardır; diğer sayfalar ona iç bağlantı verir.

## Türkçe

| Küme                | Sorgular                                                                                                | Intent                                          | Primary sayfa                                | Destek                            |
| ------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------- | --------------------------------- |
| Ajans               | dijital pazarlama ajansı · dijital ajans · dijital pazarlama ajansı istanbul · 360 derece dijital ajans | commercial                                      | `/`                                          | `/biz-kimiz`, `/hizmetlerimiz`    |
| Web                 | web tasarım · web tasarım ajansı · web tasarım ajansı istanbul · kurumsal web tasarım                   | commercial                                      | `/hizmetlerimiz/web-tasarim-ve-yazilim`      | blog web yazıları, projeler       |
| Web (transactional) | web sitesi yaptırma · web sitesi yaptırmak istiyorum                                                    | transactional                                   | `/web-sitesi-yaptir`                         | web hizmet sayfası                |
| Sosyal              | sosyal medya yönetimi · sosyal medya ajansı · sosyal medya yönetimi istanbul                            | commercial                                      | `/hizmetlerimiz/sosyal-medya-yonetimi`       | ilgili blog                       |
| Reklam              | dijital reklam ajansı · google ads ajansı · meta reklam ajansı · performans pazarlama                   | commercial                                      | `/hizmetlerimiz/dijital-reklam-yonetimi`     | blog: Google vs Meta Ads          |
| SEO                 | seo ajansı · seo danışmanlığı · içerik pazarlama                                                        | commercial                                      | `/hizmetlerimiz/seo-ve-icerik-pazarlamasi`   | blog SEO kümesi                   |
| Marka               | kurumsal kimlik tasarımı · marka tasarımı · logo tasarım ajansı                                         | commercial                                      | `/hizmetlerimiz/marka-ve-kurumsal-kimlik`    | projeler (HandsForAll vb.)        |
| UX/UI               | ux ui tasarım · ui ux ajansı                                                                            | commercial                                      | `/hizmetlerimiz/ux-ui-tasarimi`              | web hizmeti                       |
| Prodüksiyon         | video prodüksiyon · video prodüksiyon ajansı                                                            | commercial                                      | `/hizmetlerimiz/video-ve-produksiyon`        | sosyal medya                      |
| E-ticaret           | e-ticaret ajansı · e-ticaret sitesi kurma                                                               | commercial                                      | `/hizmetlerimiz/e-ticaret-cozumleri`         | web, reklam                       |
| Sağlık turizmi      | sağlık turizmi pazarlaması · sağlık turizmi danışmanlığı · yurtdışı hasta kazanımı                      | commercial (niş, düşük rekabet — yüksek fırsat) | `/hizmetlerimiz/saglik-turizmi-danismanligi` | Dentasay case, blog sağlık kümesi |
| CRM                 | crm danışmanlığı · dijital dönüşüm danışmanlığı                                                         | commercial                                      | `/hizmetlerimiz/crm-ve-dijital-donusum`      | —                                 |
| Analiz              | ücretsiz seo analizi · site analizi                                                                     | transactional                                   | `/ucretsiz-analiz`                           | SEO hizmeti                       |

## English

| Cluster         | Queries                                                                             | Intent                                         | Primary                                   | Not                                                   |
| --------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------- | ----------------------------------------------------- |
| Agency          | digital marketing agency turkey/istanbul                                            | commercial                                     | `/en/`                                    | uluslararası niş: TR pazarına açılan yabancı markalar |
| Health tourism  | health tourism marketing · patient acquisition marketing · dental tourism marketing | commercial — **EN tarafının en güçlü fırsatı** | `/en/services/health-tourism-consulting`  | Dentasay case EN                                      |
| Web             | web design agency istanbul                                                          | commercial                                     | `/en/services/web-design-and-development` | —                                                     |
| Diğer hizmetler | social media management agency vb.                                                  | commercial                                     | ilgili `/en/services/*`                   | —                                                     |

## Kanibalizasyon değerlendirmesi

- `/(ana sayfa)` geniş "ajans" intent'ine, hizmet sayfaları kendi hizmet intent'lerine hedefli — çakışma yok.
- `web tasarım` intent'inde `/hizmetlerimiz/web-tasarim-ve-yazilim` (hizmet) ile `/web-sitesi-yaptir` (transactional landing)
  ayrımı doğru kurulmuş: hizmet sayfası bilgi+hizmet, landing dönüşüm odaklı. İzlenmeli; GSC verisiyle teyit edilmeli.
- Blog yazıları informational — hizmet sayfalarını destekliyor, yarışmıyor. ✓
