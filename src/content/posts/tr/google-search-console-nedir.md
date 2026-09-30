---
title: 'Google Search Console Nedir, Nasıl Kullanılır?'
category: SEO
translationKey: what-is-google-search-console
excerpt: 'Google Search Console, sitenizin Google aramalarında nasıl göründüğünü gösteren ücretsiz araç. Siteyi doğrulamayı, performans raporunu, dizine ekleme raporunu, URL denetimini, sitemap göndermeyi ve raporu her ay nasıl okuduğumuzu adım adım anlattık.'
date: 2026-10-01
cover: '/src/assets/images/blog/google-search-console-nedir-cover.webp'
coverAlt: Masada tıklama ve gösterim grafiklerinin açık olduğu bir dizüstü bilgisayar ve basılı rapor üzerinde kalem tutan bir el
author: Pixelon Ekibi
status: published
featured: false
seo:
  title: 'Search Console Nedir? Adım Adım Kullanım | Pixelon'
  description: 'Google Search Console nedir, nasıl kurulur? Site doğrulama, performans raporu, dizine ekleme, URL denetimi, sitemap, Core Web Vitals ve aylık okuma rutini.'
article:
  updated: 2026-10-01
  quickAnswer:
    heading: Kısa Cevap
    text: 'Google Search Console, Google''ın site sahiplerine verdiği ücretsiz araç. Sitenizin hangi aramalarda kaç kez göründüğünü, kaç tıklama aldığını ve ortalama hangi sırada çıktığını gösteriyor. Hangi sayfaların dizinde olup hangilerinin neden dışarıda kaldığını, hız sorunlarını ve Google''ın uyguladığı manuel işlemleri de buradan görüyorsunuz. Kullanmak için sitenin size ait olduğunu doğrulamanız gerekiyor.'
  tocHeading: İçindekiler
  related:
    - teknik-seo-nedir
    - seo-analizi-nasil-yapilir
    - web-sitesi-analizi-nasil-yapilir
  blocks:
    - type: section
      id: nedir
      heading: Google Search Console nedir?
      lead: Search Console, Google'ın sitenizi nasıl gördüğünü doğrudan Google'ın kendi verisiyle gösteren ücretsiz bir araç.
      text: |-
        Google Analytics sitenize gelen ziyaretçinin sitede ne yaptığını gösteriyor. Search Console ise ziyaretçi daha siteye gelmeden önceki kısmı gösteriyor: hangi aramada göründünüz, kaç kişi sonucu gördü, kaçı tıkladı.

        Bunun yanında Google'ın sitenizle yaşadığı sorunları da raporluyor. Dizine alınmayan sayfalar, yavaş sayfa grupları, yapılandırılmış veri hataları ve varsa Google'ın elle uyguladığı cezalar burada çıkıyor.

        SEO çalışmasının neredeyse her kararı bu veriden başlıyor. Biz de her müşteride ilk iş olarak Search Console erişimi istiyoruz. Yanında Google Analytics ve Semrush kullanıyoruz ama Google'ın kendi verisinin yerini hiçbiri tutmuyor.

    - type: process
      heading: Siteyi Search Console'a eklemek
      steps:
        - title: Mülk türünü seçin
          text: search.google.com/search-console adresine Google hesabınızla girin. Alan adı mülkü sitenin bütün alt alan adlarını ve HTTP ile HTTPS sürümlerini tek yerde topluyor. URL öneki mülkü yalnızca yazdığınız adresi kapsıyor.
        - title: Sahipliği doğrulayın
          text: Alan adı mülkünde doğrulama, alan adınızın DNS ayarlarına bir TXT kaydı ekleyerek yapılıyor. URL öneki mülkünde HTML dosyası, meta etiketi, Google Analytics ya da Google Tag Manager ile de doğrulayabiliyorsunuz.
        - title: Sitemap gönderin
          text: Sitemaps bölümüne sitenizin XML sitemap adresini yazın. Google sayfalarınızı bu listeden daha hızlı keşfediyor.
        - title: Veri birikmesini bekleyin
          text: Performans verisi doğrulamadan sonra birkaç gün içinde görünmeye başlıyor. Rapor en fazla 16 aylık geçmişi saklıyor, bu yüzden erken kurmak geçmişe dönük karşılaştırma için önemli.

    - type: section
      id: performans
      heading: Performans raporu nasıl okunur?
      text: |-
        Performans raporu dört sayı gösteriyor. Toplam tıklama, sonucunuza tıklayan kişi sayısı. Toplam gösterim, sonucunuzun arama sayfasında görüntülenme sayısı. Ortalama TO, yani tıklama oranı, gösterimlerin yüzde kaçının tıklamaya dönüştüğü. Ortalama konum, sonucunuzun ortalama sırası.

        Bu sayıların altında sekmeler var. Sorgular sekmesi insanların hangi kelimelerle sizi bulduğunu, sayfalar sekmesi hangi sayfanın trafik aldığını gösteriyor. Ülke ve cihaz sekmeleri de işe yarıyor; çok dilli bir sitede hangi ülkeden trafik geldiğini buradan görüyorsunuz.

        Ortalama konumu dikkatli okumak gerekiyor. Bir sayfanın yüzlerce farklı aramada farklı sıralarda çıkmasının ortalaması bu. Tek başına bakmak yerine tek bir sorguya ya da tek bir sayfaya filtreleyip bakmak çok daha anlamlı.

    - type: table
      heading: Performans raporundaki tablo size ne söylüyor
      columns:
        - Gördüğünüz tablo
        - Muhtemel anlamı
        - Ne yapılır
      rows:
        - - Gösterim yüksek, tıklama oranı düşük
          - Sonuç görülüyor ama seçilmiyor
          - Başlığı ve meta açıklamayı aramaya daha net cevap verecek şekilde yeniden yazın
        - - Konum 8 ile 20 arasında
          - Sayfa ilk sayfanın eşiğinde
          - İçeriği güçlendirin, sayfaya iç bağlantı verin
        - - Gösterim yıldan yıla düşüyor
          - Rakip öne geçti ya da içerik eskidi
          - Sayfayı güncelleyin, arama sonucundaki rakip sayfalarla karşılaştırın
        - - Beklenmedik sorgular
          - Sayfa başka bir niyete cevap veriyor
          - O sorgu için ayrı bir sayfa gerekip gerekmediğine bakın

    - type: section
      id: dizine-ekleme
      heading: Sayfa dizine ekleme raporu
      text: |-
        Bu rapor sitenizdeki adresleri iki gruba ayırıyor: dizine eklenenler ve eklenmeyenler. Asıl bilgi ikinci grubun nedenlerinde.

        Bazı nedenler normal. "Alternatif sayfa, uygun standart etiketi var" ya da "noindex etiketi tarafından hariç tutuldu" çoğu zaman bilinçli bir tercihin sonucu. Ama önemli bir hizmet sayfanız "Tarandı, şu anda dizine eklenmedi" listesindeyse Google o sayfayı gördü ve dizine almaya değer bulmadı demek. Bu çoğunlukla içeriğin zayıf ya da başka bir sayfanın kopyası gibi durduğunu gösteriyor.

        "Bulundu, şu anda dizine eklenmedi" ise Google'ın adresi bildiğini ama henüz taramadığını söylüyor. Yeni sitelerde bir süre normal; uzun sürüyorsa iç bağlantı eksikliğine ya da tarama sorununa bakmak gerekiyor. Bu sorunların altyapı tarafını [teknik SEO nedir](/blog/teknik-seo-nedir/) yazısında anlattık.

    - type: section
      id: url-denetimi
      heading: URL denetimi
      text: |-
        URL denetimi, bir sorunun kaynağını bulmanın en hızlı yolu. Bir sayfa beklediğiniz aramada hiç çıkmıyorsa önce buraya bakın: sayfa dizinde değilse sorun içerikte değil, altyapıda.

        Sayfanın üstündeki arama kutusuna sitenizden bir adres yapıştırdığınızda Search Console o sayfanın durumunu gösteriyor: dizinde mi, Google hangi adresi asıl sayfa olarak seçmiş, en son ne zaman taranmış, mobilde nasıl görünüyor.

        "Canlı URL'yi test et" düğmesi sayfanın şu anki halini kontrol ediyor. Yeni yayınladığınız ya da büyük ölçüde güncellediğiniz bir sayfa için "Dizine eklenmesini iste" diyebiliyorsunuz. Bu bir garanti değil, bir istek; günlük bir sınırı da var. Her sayfa için tek tek istemek yerine sitemap'in ve iç bağlantıların düzgün olması uzun vadede daha çok işe yarıyor.

    - type: cards
      heading: Diğer raporlar
      items:
        - title: Sitemaps
          text: Gönderdiğiniz sitemap'lerin okunup okunmadığını ve kaç adres bulunduğunu gösteriyor. Hata varsa burada çıkıyor.
        - title: Core Web Vitals
          text: Sayfaları gerçek kullanıcı verisine göre iyi, iyileştirilmeli ve kötü olarak gruplandırıyor. Mobil ve masaüstü ayrı. Az ziyaret alan sitelerde yeterli veri olmayabiliyor.
        - title: Geliştirmeler
          text: Sitenizde bulunan yapılandırılmış veri türlerini ve hatalarını listeliyor. Ayrıntısını yapılandırılmış veri yazısında anlattık.
        - title: Manuel işlemler
          text: Google'dan bir çalışanın sitenize elle ceza uyguladığı durumlar burada görünüyor. Çoğu sitede boş, boş olması da iyi haber.
        - title: Bağlantılar
          text: Sitenize en çok bağlantı veren dış siteleri ve en çok iç bağlantı alan sayfalarınızı gösteriyor.

    - type: section
      id: aylik-okuma
      heading: Search Console'u her ay nasıl okuyoruz?
      text: |-
        Search Console'a her gün bakmak gereksiz; günlük dalgalanma çoğu zaman bir şey söylemiyor. Ayda bir, aynı sırayla bakmak daha verimli.

        Performans raporunda son 28 günü bir önceki 28 günle ve geçen yılın aynı dönemiyle karşılaştırıyoruz. Mevsimsel işlerde, örneğin sağlık turizminde, yıllık karşılaştırma aylık olandan daha doğru bir tablo veriyor.

        Dr. Ayşe Cinkaya Kahveci'nin kliniğinde site bir yılda Google'da 487 bin kez göründü. Gösterim dediğimiz sayı tam olarak bu: sonucun arama sayfasında kaç kez görüldüğü. Bu kadar gösterimin hangi tedavi sayfasından ve hangi aramadan geldiğini ancak sorgu ve sayfa sekmelerinde tek tek açınca görebiliyorsunuz. Projenin ayrıntısı [Dr. Ayşe Cinkaya Kahveci projesinde](/projelerimiz/dr-ayse-cinkaya-kahveci/).

        Kısa bir rutin önerisi: önce genel eğilim, sonra düşen sayfalar, sonra yükselen sorgular, en son dizine ekleme ve hız raporları. Sayfa bazında daha derin bir inceleme için [SEO analizi nasıl yapılır](/blog/seo-analizi-nasil-yapilir/) yazısına bakabilirsiniz.

    - type: checklist
      heading: Aylık kontrol listesi
      items:
        - title: Tıklama ve gösterim eğilimi
          text: Son 28 gün, önceki dönem ve geçen yılın aynı dönemiyle karşılaştırıldı mı?
        - title: Düşen sayfalar
          text: Tıklaması en çok düşen beş sayfa belirlendi mi, nedeni arandı mı?
        - title: Yükselen sorgular
          text: Yeni çıkan ya da gösterimi artan sorgular için içerik fırsatı not edildi mi?
        - title: Dizine ekleme
          text: Dizine eklenmeyen sayfalar arasında önemli bir sayfa var mı?
        - title: Hız ve deneyim
          text: Core Web Vitals raporunda kötü duruma düşen yeni bir sayfa grubu var mı?
        - title: Uyarılar
          text: Manuel işlemler ve güvenlik sorunları raporları boş mu?

    - type: callout
      variant: tip
      heading: Erişimi ajansa şifreyle değil kullanıcı olarak verin
      text: Search Console'un sahibi siz olmalısınız. Ajansa ya da bir uzmana erişim verirken Ayarlar içindeki Kullanıcılar ve izinler bölümünden onların Google hesabını ekleyin. Çalışma bittiğinde erişimi tek tıkla kaldırırsınız ve mülk her zaman sizde kalır.

    - type: faq
      heading: Sık Sorulan Sorular
      items:
        - question: Google Search Console ücretli mi?
          answer: Hayır, tamamen ücretsiz. Bir Google hesabı ve sitenizin sahibi olduğunuzu doğrulamanız yeterli.
        - question: Search Console ile Google Analytics arasındaki fark ne?
          answer: Search Console aramada olanı gösteriyor, yani gösterim, tıklama ve sıra. Analytics siteye geldikten sonra olanı gösteriyor, yani hangi sayfaya gidildiği ve form doldurulup doldurulmadığı. İkisini birbirine bağlamak mümkün. Dönüşüm tarafını [dönüşüm takibi nedir](/blog/donusum-takibi-nedir/) yazısında anlattık.
        - question: Search Console'daki tıklama sayısı neden Analytics'ten farklı?
          answer: İki araç farklı şeyleri farklı yöntemle sayıyor. Search Console arama sonucundaki tıklamayı sayıyor. Analytics ise sayfanın yüklenip ölçüm kodunun çalıştığı ziyareti sayıyor; çerez onayı vermeyen ziyaretçi Analytics'te görünmeyebiliyor. Küçük farklar normal.
        - question: Yeni sitem Search Console'da neden görünmüyor?
          answer: Doğrulamadan sonra verinin görünmesi birkaç gün sürebiliyor. Birkaç hafta sonra hâlâ gösterim yoksa dizine ekleme raporuna ve robots.txt dosyasına bakın; site yanlışlıkla taramaya kapalı kalmış olabilir.

    - type: section
      id: kisaca
      heading: Kısaca
      text: |-
        Google Search Console, sitenizin Google aramalarındaki durumunu Google'ın kendi verisiyle gösteren ücretsiz araç. Performans raporu hangi aramada göründüğünüzü, dizine ekleme raporu hangi sayfaların dışarıda kaldığını, URL denetimi tek bir sayfanın durumunu gösteriyor. Ayda bir aynı sırayla okumak çoğu site için yeterli.

        Search Console verisini bir SEO planına nasıl çevirdiğimizi [SEO ve içerik pazarlaması](/hizmetlerimiz/seo-ve-icerik-pazarlamasi/) sayfasında, bu raporları sizin için okuyup yorumladığımız çalışmayı [SEO danışmanlığı](/hizmetlerimiz/seo-ve-icerik-pazarlamasi/seo-danismanligi/) sayfasında anlattık.

    - type: cta
      heading: Search Console verinizi birlikte okuyalım.
      text: Sitenizin aramadaki durumunu ve kaçırdığı fırsatları ücretsiz bir ön analizle çıkaralım.
      primary:
        label: Ücretsiz Analiz Talep Et
        href: /ucretsiz-analiz
      secondary:
        label: SEO Hizmetimiz
        href: /hizmetlerimiz/seo-ve-icerik-pazarlamasi
---
