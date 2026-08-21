# PIXELON SEO OPERATING SYSTEM

Bu klasör Pixelon'ın sürekli çalışan SEO sisteminin hafızası ve kontrol yüzeyidir.

## Dosyalar

| Dosya                 | Ne işe yarar                                                 |
| --------------------- | ------------------------------------------------------------ |
| `SEO_MASTER_PLAN.md`  | **Source of truth.** Tüm görevler ve durumları               |
| `SEO_STATE.json`      | Makine hafızası — yeni oturum nerede kaldığını buradan bilir |
| `APPROVAL_QUEUE.md`   | Onay bekleyen işler + onay komutları                         |
| `SEO_CHANGELOG.md`    | Yapılan her gerçek değişiklik                                |
| `COMPETITORS.md`      | Rakip analizi ve gap analizi                                 |
| `reports/BASELINE.md` | Dondurulmuş başlangıç ölçümü                                 |
| `reports/DAILY-*.md`  | Günlük raporlar                                              |
| `data/`               | Ham veri (rakip taraması, keyword master, GSC dışa aktarımı) |
| `content-briefs/`     | İçerik brief'leri — draft'tan önce zorunlu                   |
| `visual-briefs/`      | Görsel brief'leri                                            |

## Komutlar

```bash
bun run seo:audit     # teknik denetim (dist/ üzerinden)
bun run seo:comp      # rakip yapısal tarama
bun run seo:daily     # günlük operasyon
bun run seo:weekly    # haftalık karşılaştırma
bun run seo:monthly   # aylık strateji gözden geçirme
bun run seo:run       # daily ile aynı — manuel tetikleme
```

## Çalışma modeli

```text
ARAŞTIR / ANALİZ ET / PLANLA / HAZIRLA / TEST ET / RAPORLA  →  OTOMATİK
YAYINLA / RİSKLİ DEĞİŞTİR / DIŞ İLETİŞİM / PARA HARCA       →  ONAY
```

## Bloklu erişimler

GSC, SEMrush ve GBP erişimi **yok**. Bu nedenle arama hacmi, gerçek sıralama, tıklama ve
backlink otoritesi ölçülemiyor. Bu dosyalarda tahmini rakam üretilmez; bloklu alanlar
açıkça boş bırakılır. Açılış koşulları `SEO_STATE.json → blockedTasks` içinde.
