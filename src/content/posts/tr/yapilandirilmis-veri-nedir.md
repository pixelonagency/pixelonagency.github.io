---
title: 'Yapılandırılmış Veri Nedir? Schema Markup Rehberi'
category: SEO
translationKey: what-is-structured-data
excerpt: 'Yapılandırılmış veri, sayfanızdaki bilgiyi Google''ın doğrudan okuyabileceği biçimde işaretleyen koddur. JSON-LD''yi, en çok kullanılan schema türlerini, zengin sonuçları, nasıl test edileceğini ve sık yapılan hataları anlattık.'
date: 2026-10-01
cover: '/src/assets/images/blog/yapilandirilmis-veri-nedir-cover.webp'
coverAlt: Karanlık bir ofiste düzenli kod bloklarının ve yıldız puanlı bir arama sonucu kartının göründüğü monitör
author: Pixelon Ekibi
status: published
featured: false
seo:
  title: 'Schema Markup Nedir? JSON-LD ve Türleri | Pixelon'
  description: 'Yapılandırılmış veri ve schema markup nedir? JSON-LD, Organization, LocalBusiness, Article, FAQ ve Product türleri, zengin sonuçlar, test araçları ve sık yapılan hatalar.'
article:
  updated: 2026-10-01
  quickAnswer:
    heading: Kısa Cevap
    text: 'Yapılandırılmış veri, sayfadaki bilgiyi (bu bir işletme, adresi şu, bu bir ürün, fiyatı şu) arama motorlarının doğrudan okuyabileceği standart bir biçimde işaretleyen koddur. Bu biçimin sözlüğü schema.org, Google''ın önerdiği yazım şekli JSON-LD. Doğru işaretleme, ürün fiyatı, yıldız puanı ya da içerik haritası gibi zengin sonuçlara uygun olmanızı sağlıyor ama bunları garanti etmiyor.'
  tocHeading: İçindekiler
  related:
    - teknik-seo-nedir
    - geo-nedir
    - google-search-console-nedir
  blocks:
    - type: section
      id: nedir
      heading: Yapılandırılmış veri nedir?
      lead: Yapılandırılmış veri, sayfanızda zaten yazan bilgiyi makinenin kesin olarak anlayacağı bir biçimde tekrar söylemektir.
      text: |-
        Bir insan sayfanızın altındaki "Kadıköy, İstanbul. Pazartesi-Cumartesi 09.00-19.00" satırını görünce bunun adres ve çalışma saati olduğunu hemen anlıyor. Arama motoru da çoğu zaman anlıyor, ama tahmin ederek.

        Yapılandırılmış veri bu tahmini ortadan kaldırıyor. Sayfaya eklenen kısa bir kod bloğu "bu bir işletme, adı bu, adresi bu, çalışma saatleri bunlar" diyor. Google, Bing ve Yandex aynı sözlüğü, yani schema.org'u kullanıyor.

        İngilizce kaynaklarda "schema markup" diye geçiyor. Türkçede yapılandırılmış veri, schema işaretlemesi ya da kısaca schema deniyor; üçü aynı şey.

    - type: section
      id: json-ld
      heading: JSON-LD nedir?
      text: |-
        Yapılandırılmış veri üç farklı biçimde yazılabiliyor: JSON-LD, Microdata ve RDFa. Google üçünü de okuyor ama JSON-LD'yi öneriyor.

        Nedeni pratik. JSON-LD, sayfanın görünen HTML'ine karışmıyor; sayfanın içine ayrı bir script bloğu olarak ekleniyor. Tasarım değiştiğinde işaretleme bozulmuyor, işaretlemeyi değiştirmek için tasarıma dokunmak gerekmiyor.

        Blok, bir türle ve o türün özellikleriyle yazılıyor. Bir işletme için tür LocalBusiness, özellikler de ad, adres, telefon, çalışma saatleri ve web adresi. Bir makale için tür Article, özellikler başlık, yazar, yayın ve güncelleme tarihi.

    - type: section
      id: ornek
      heading: Bir işaretleme neyi söylüyor?
      text: |-
        Bir diş kliniğinin iletişim sayfasını düşünün. Sayfada kliniğin adı, açık adresi, telefonu, çalışma saatleri, harita ve birkaç fotoğraf var.

        Bu sayfanın JSON-LD bloğu kabaca şunu söylüyor: tür Dentist. Adı şu. Adresi şu sokak, şu ilçe, şu şehir, şu posta kodu. Telefonu şu. Pazartesiden cumartesiye şu saatler arasında açık. Haritadaki konumu şu enlem ve boylam. Web sitesi şu adres, sosyal hesapları şunlar.

        Bunların hiçbiri sayfaya yeni bir bilgi eklemiyor. Hepsi zaten ziyaretçiye görünen bilgiler. İşaretleme yalnızca hangi satırın ne olduğunu kesinleştiriyor: bu sayı telefon, bu metin adres, bu aralık çalışma saati.

        Çok dilli bir sitede işaretleme her dilde o dilin sayfasıyla birlikte geliyor. Türkçe sayfa Türkçe açıklamayı, Almanca sayfa Almanca açıklamayı taşıyor; adres ve telefon gibi bilgiler ise her dilde aynı kalıyor.

    - type: table
      heading: En çok kullanılan schema türleri
      columns:
        - Tür
        - Ne için
        - Nerede kullanılır
      rows:
        - - Organization
          - Kurumun adı, logosu, sosyal hesapları, iletişim bilgisi
          - Ana sayfa ya da hakkımızda sayfası
        - - LocalBusiness
          - Fiziksel adresi olan işletmenin adresi, saatleri, telefonu
          - İletişim sayfası, şube sayfaları
        - - MedicalBusiness
          - LocalBusiness'ın sağlık işletmeleri için alt türü; klinik, diş hekimi gibi
          - Klinik ve muayenehane siteleri
        - - Article
          - Makalenin başlığı, yazarı, tarihleri, görseli
          - Blog yazıları, haberler
        - - FAQPage
          - Sayfadaki soru ve cevaplar
          - Sık sorulan sorular bölümü olan sayfalar
        - - Product
          - Ürün adı, fiyatı, stok durumu, değerlendirmeleri
          - E-ticaret ürün sayfaları
        - - BreadcrumbList
          - Sayfanın site içindeki yolu
          - Hiyerarşisi olan her sayfa

    - type: section
      id: zengin-sonuclar
      heading: Zengin sonuç nedir?
      lead: Zengin sonuç, arama sonucunda başlık ve açıklamanın ötesinde fiyat, yıldız, stok durumu ya da görsel gibi ek bilgi gösteren sonuçtur.
      text: |-
        Bir ürün aradığınızda bazı sonuçların altında fiyatı ve yıldız puanı görüyorsunuz. Bir tarif aradığınızda pişirme süresi ve kalori çıkıyor. Bu sonuçların çoğu yapılandırılmış veriden besleniyor.

        Önemli nokta şu: doğru işaretleme sizi zengin sonuca uygun hale getiriyor, zengin sonucu garanti etmiyor. Google hangi sonucu hangi aramada zengin göstereceğine kendisi karar veriyor. Yapılandırılmış veri doğrudan bir sıralama sinyali de değil; Google'ın sayfayı daha iyi anlamasına yardım ediyor, sıranızı tek başına yükseltmiyor.

        Google zaman zaman bazı zengin sonuç türlerini kaldırıyor ya da daraltıyor. 2023'te sık sorulan sorular zengin sonucunu büyük ölçüde iyi bilinen, yetkili devlet ve sağlık sitelerine sınırladı; nasıl yapılır sonuçlarını ise kaldırdı. Bu yüzden FAQ işaretlemesi çoğu site için artık arama sonucunda soru ve cevap göstermiyor. Yine de sayfadaki soru cevap yapısını makinenin anlaması için işaretlemenin zararı yok.

    - type: section
      id: yerel-isletme
      heading: Yerel işletmeler için yapılandırılmış veri
      text: |-
        Kliniği, mağazası ya da ofisi olan bir işletme için en değerli tür LocalBusiness ve onun alt türleri. Bir diş kliniği için Dentist, bir dermatoloji kliniği için MedicalClinic gibi daha dar bir tür seçmek, Google'a işletmenin ne olduğunu daha net söylüyor.

        Burada işaretlemenin Google işletme profiliyle aynı bilgiyi taşıması önemli. Adres sitede bir, profilde başka yazıyorsa işaretleme güven vermek yerine kafa karıştırıyor. Profil tarafını [Google İşletme Profili nasıl oluşturulur](/blog/google-isletme-profili-nasil-olusturulur/) yazısında anlattık.

        Yapılandırılmış veri yapay zeka cevap motorları için de işe yarıyor olabilir: işletmenin türünü, adresini ve hizmetlerini açık biçimde söylüyor. Bunun cevaplara etkisi henüz net ölçülmüş değil; ayrıntısını [GEO nedir](/blog/geo-nedir/) yazısında anlattık.

    - type: process
      heading: Yapılandırılmış veri nasıl test edilir?
      steps:
        - title: Zengin Sonuç Testi
          text: Google'ın Zengin Sonuç Testi aracına sayfa adresini ya da kodu yapıştırın. Sayfanın hangi zengin sonuçlara uygun olduğunu, hata ve uyarıları gösteriyor.
        - title: Schema Markup Validator
          text: validator.schema.org, Google'ın desteklemediği türler dahil bütün schema.org işaretlemesini kontrol ediyor. Kodun sözdizimi doğru mu, oradan bakın.
        - title: Search Console geliştirmeler raporu
          text: Yayına aldıktan sonra Search Console'daki ilgili raporlar sitenin tamamındaki geçerli ve hatalı öğeleri listeliyor. Bir şablondaki hata yüzlerce sayfada birden burada görünüyor.
        - title: Düzeltip doğrulayın
          text: Hatayı giderdikten sonra raporda düzeltmeyi doğrula diyerek Google'dan yeniden kontrol isteyin.

    - type: section
      id: hatalar
      heading: Sık yapılan hatalar
      text: |-
        En sık yapılan hata, sayfada olmayan bilgiyi işaretlemek. Sayfada görünmeyen bir yıldız puanını, var olmayan bir indirimi ya da gerçekte olmayan soruları koda eklemek Google'ın kurallarına aykırı. Bu, yapılandırılmış veri için manuel işleme, yani sitenin zengin sonuçlardan çıkarılmasına yol açabiliyor.

        İkincisi, işletmenin kendi sitesinde kendisi hakkındaki yorumları işaretleyip yıldız beklemek. Google, LocalBusiness ve Organization türlerinde işletmenin kendi hakkında topladığı yorumlar için yıldız göstermiyor. Çağla Aytaç'ın sitesinde her şubenin Google ve Trustpilot yorumları ziyaretçiye gösteriliyor; bu güven için değerli, ama arama sonucunda yıldız için bir yol değil.

        Üçüncüsü, işaretlemeyi bir kez yazıp unutmak. Fiyat değişiyor, çalışma saati değişiyor, işaretleme eski kalıyor. Kod elle değil, sayfanın içeriğinden otomatik üretiliyorsa bu sorun ortadan kalkıyor.

        Dördüncüsü, aynı sayfada birbiriyle çelişen işaretlemeler. Tema bir işletme bloğu, SEO eklentisi başka bir işletme bloğu, harita eklentisi üçüncü bir blok ekliyor; her birinde adres ya da ad biraz farklı. Sayfanın kaynak koduna bakıp kaç ayrı blok olduğunu kontrol etmek, bu sorunu birkaç dakikada ortaya çıkarıyor.

    - type: checklist
      heading: Yapılandırılmış veri kontrol listesi
      items:
        - title: Doğru tür
          text: Sayfanın gerçekte ne olduğuna uyan en dar tür seçildi.
        - title: Görünen bilgiyle aynı
          text: İşaretlenen her bilgi sayfada ziyaretçiye de görünüyor.
        - title: Profil ile tutarlı
          text: Ad, adres ve telefon Google işletme profiliyle birebir aynı.
        - title: Hatasız
          text: Zengin Sonuç Testi ve Search Console'da hata yok.
        - title: Güncel
          text: Fiyat, saat ve tarih gibi değişen bilgiler içerikle birlikte güncelleniyor.

    - type: callout
      variant: tip
      heading: Önce temel türler
      text: Her sayfaya onlarca tür eklemeye gerek yok. Çoğu işletme için Organization ya da LocalBusiness, blog için Article ve sayfa yolu için BreadcrumbList iyi bir başlangıç. Gerisini ihtiyaç doğdukça ekleyin.

    - type: faq
      heading: Sık Sorulan Sorular
      items:
        - question: Yapılandırılmış veri sıralamayı yükseltir mi?
          answer: Doğrudan değil. Google'ın sayfayı daha iyi anlamasını ve zengin sonuçlara uygun olmasını sağlıyor. Zengin sonuç tıklama oranını artırabildiği için dolaylı bir etkisi olabiliyor.
        - question: Yapılandırılmış veriyi eklemek için yazılımcı gerekir mi?
          answer: WordPress gibi sistemlerde eklentilerle temel türler eklenebiliyor. Özel yapılmış sitelerde işaretlemenin şablona bir kez kurulması ve içerikten otomatik üretilmesi en sağlıklısı; bu da bir geliştirici işi.
        - question: FAQ işaretlemesi artık işe yaramıyor mu?
          answer: Çoğu site için arama sonucunda soru cevap göstermiyor. Ama işaretleme sayfanın yapısını makineye anlatmaya devam ediyor ve kurallara uygun yazıldığı sürece zarar vermiyor.
        - question: Hangi türün desteklendiğini nereden öğrenirim?
          answer: Google Search Central'daki yapılandırılmış veri galerisi, Google'ın zengin sonuç için desteklediği türleri ve zorunlu alanları listeliyor. Liste zaman zaman değiştiği için işe başlamadan oradan kontrol etmek gerekiyor.

    - type: section
      id: kisaca
      heading: Kısaca
      text: |-
        Yapılandırılmış veri, sayfanızdaki bilgiyi arama motorlarına kesin bir dille söyleyen kod. Google JSON-LD biçimini öneriyor. Doğru tür, sayfada görünen bilgiyle birebir aynı içerik ve düzenli test, zengin sonuçlara uygun olmanın yolu. Teknik SEO'nun diğer parçalarıyla birlikte [teknik SEO nedir](/blog/teknik-seo-nedir/) yazısında anlattık.

        Yapılandırılmış veriyi de kapsayan SEO çalışmamızı [SEO ve içerik pazarlaması](/hizmetlerimiz/seo-ve-icerik-pazarlamasi/) sayfasında, yerel işletmeler için yaptıklarımızı [yerel SEO](/hizmetlerimiz/seo-ve-icerik-pazarlamasi/yerel-seo/) sayfasında anlattık.

    - type: cta
      heading: Sitenizin yapılandırılmış verisine birlikte bakalım.
      text: Eksik ve hatalı işaretlemeleri ücretsiz bir ön analizle çıkaralım.
      primary:
        label: Ücretsiz Analiz Talep Et
        href: /ucretsiz-analiz
      secondary:
        label: SEO Hizmetimiz
        href: /hizmetlerimiz/seo-ve-icerik-pazarlamasi
---
