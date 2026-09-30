---
title: 'Teknik SEO Nedir? Site İçi ve Site Dışı SEO ile Farkı'
category: SEO
translationKey: what-is-technical-seo
excerpt: 'Teknik SEO, Google''ın sitenizi tarayabilmesi, anlayabilmesi ve dizine ekleyebilmesi için yapılan altyapı işidir. Tarama, dizine ekleme, hız, mobil uyum, sitemap, robots.txt, canonical, yönlendirmeler ve çok dilli sitelerde hreflang; site içi ve site dışı SEO ile nasıl birleştiğini de anlattık.'
date: 2026-10-01
cover: '/src/assets/images/blog/teknik-seo-nedir-cover.webp'
coverAlt: Gece iki monitörde site kodunu ve sayfa hızı göstergesini inceleyen bir geliştirici
author: Pixelon Ekibi
status: published
featured: false
seo:
  title: 'Teknik SEO Rehberi: Tarama, Hız ve Hreflang | Pixelon'
  description: 'Teknik SEO nedir? Tarama, dizine ekleme, Core Web Vitals, mobil uyum, sitemap, robots.txt, canonical ve hreflang. Site içi ve site dışı SEO ile farkı tabloda.'
article:
  updated: 2026-10-01
  quickAnswer:
    heading: Kısa Cevap
    text: 'Teknik SEO, arama motorunun sitenizi sorunsuz tarayıp dizine ekleyebilmesi için yapılan altyapı çalışmasıdır: hız, mobil uyum, HTTPS, sitemap, robots.txt, canonical etiketleri, yönlendirmeler, yapılandırılmış veri ve çok dilli sitelerde hreflang. Site içi SEO sayfanın içeriğiyle, site dışı SEO ise sitenin başka yerlerdeki itibarıyla ilgilenir. Teknik taraf bozuksa diğer ikisinin emeği Google''a ulaşmaz.'
  tocHeading: İçindekiler
  related:
    - seo-nedir-nasil-calisir
    - google-search-console-nedir
    - yapilandirilmis-veri-nedir
  blocks:
    - type: section
      id: nedir
      heading: Teknik SEO nedir?
      lead: Teknik SEO, Google'ın sitenizi bulabilmesi, okuyabilmesi ve arama sonuçlarına koyabilmesi için sitenin altyapısında yapılan düzenlemelerin tamamıdır.
      text: |-
        Bir sayfanın Google'da çıkması için üç şeyin sırayla olması gerekiyor. Önce Google'ın tarayıcısı sayfayı bulup okuyor. Sonra sayfayı dizine, yani kendi büyük kütüphanesine ekliyor. En son, biri bir arama yaptığında o sayfayı diğerleriyle karşılaştırıp bir sıraya koyuyor.

        Teknik SEO ilk iki adımla ilgileniyor. İçeriğiniz ne kadar iyi olursa olsun, tarayıcı sayfaya ulaşamıyorsa ya da sayfa dizine alınmıyorsa sıralama yarışına hiç girmiyorsunuz.

        Bunu bir mağazanın kapısı gibi düşünebilirsiniz. Vitrin ne kadar güzel olursa olsun kapı kilitliyse kimse içeri giremiyor. SEO'nun genel resmini [SEO nedir, nasıl çalışır](/blog/seo-nedir-nasil-calisir/) yazısında anlattık; burada kapının kendisine bakıyoruz.

    - type: table
      heading: Teknik, site içi ve site dışı SEO
      intro: Üçü aynı hedefe çalışıyor ama farklı yerlere dokunuyor.
      columns:
        - Kriter
        - Teknik SEO
        - Site içi SEO
        - Site dışı SEO
      rows:
        - - Neye bakar
          - Sitenin altyapısına
          - Sayfanın içeriğine
          - Sitenin dışarıdaki itibarına
        - - Örnek işler
          - Hız, sitemap, robots.txt, canonical, yönlendirme, hreflang
          - Başlık, meta açıklama, içerik, ara başlıklar, iç bağlantılar
          - Backlink, marka anılmaları, yorumlar, işletme profili
        - - Kim yapar
          - Çoğunlukla geliştirici ve SEO uzmanı birlikte
          - İçerik ekibi ve SEO uzmanı
          - SEO uzmanı, PR ve işletmenin kendisi
        - - Bozulursa ne olur
          - Sayfa dizine girmez ya da yanlış sürümü girer
          - Sayfa dizinde ama doğru aramada çıkmaz
          - Sayfa çıkar ama rakiplerin gerisinde kalır
        - - Ne sıklıkla bakılır
          - Kurulumda ve her büyük değişiklikte, sonra aylık
          - Her yeni sayfada
          - Sürekli

    - type: section
      id: tarama-dizin
      heading: Tarama ve dizine ekleme
      text: |-
        Google'ın sitenizi nasıl gezeceğini iki dosya yönlendiriyor. robots.txt, tarayıcıya hangi bölümlere girmemesi gerektiğini söylüyor. XML sitemap ise dizine eklenmesini istediğiniz sayfaların listesini veriyor.

        Burada en sık yapılan hata şu: robots.txt bir sayfanın dizine girmesini engellemiyor, yalnızca taranmasını engelliyor. Başka sitelerden bağlantı alan bir sayfa, taranmadan da arama sonucunda çıplak bir adres olarak görünebiliyor. Bir sayfanın aramada çıkmasını istemiyorsanız doğru araç noindex etiketi, ve bu etiketin görülebilmesi için sayfanın taranabilir olması gerekiyor.

        Tarayıcı sayfaları bağlantıları izleyerek buluyor. Hiçbir sayfadan bağlantı almayan, yalnızca sitemap'te duran bir sayfa, Google için önemsiz bir sayfa gibi görünüyor. Önemli hizmet sayfalarının ana menüden ve ilgili yazılardan bağlantı alması bu yüzden hem kullanıcı hem tarama için gerekli.

        İkinci yaygın hata, yeni sitenin yayına çıkarken geliştirme ortamındaki "hiçbir şeyi tarama" ayarını taşıması. Site yayında, her şey yolunda görünüyor ama Google tek bir sayfaya giremiyor. Bunu en hızlı [Google Search Console](/blog/google-search-console-nedir/) gösteriyor.

    - type: section
      id: hiz
      heading: Hız ve Core Web Vitals
      lead: Google, sayfa deneyimini gerçek kullanıcı verisinden gelen üç ölçüyle değerlendiriyor.
      text: |-
        LCP, sayfanın en büyük görsel ya da metin bloğunun ne kadar sürede yüklendiğini ölçüyor; iyi sayılan sınır 2,5 saniye. INP, bir düğmeye bastığınızda sayfanın ne kadar hızlı tepki verdiğini ölçüyor; iyi sınır 200 milisaniye. CLS ise sayfa yüklenirken içeriğin ne kadar kaydığını ölçüyor; iyi sınır 0,1.

        Bu ölçüler sıralamada tek başına belirleyici değil. Aynı soruya benzer kalitede cevap veren iki sayfadan hızlı olanı öne geçebiliyor, ama yavaş bir sayfa daha iyi bir içerikle hâlâ önde çıkabiliyor. Hızın asıl etkisi ziyaretçide: yavaş açılan sayfadan insanlar geri dönüyor.

        Sık görülen nedenler hep benzer. Sıkıştırılmamış büyük görseller, gereksiz eklentiler, üçüncü taraf kodlarının yükü ve boyutu belirtilmemiş görsellerin sayfayı kaydırması.

    - type: section
      id: mobil-https
      heading: Mobil uyum ve HTTPS
      text: |-
        Google siteleri artık mobil sürümlerine bakarak dizine ekliyor. Masaüstünde duran ama mobilde gizlenen bir içerik, Google için büyük ölçüde yok sayılabiliyor. Mobilde yazıların okunur olması, düğmelerin parmakla rahat basılır olması ve yatay kaydırma olmaması bu yüzden teknik bir konu.

        HTTPS, Google'ın küçük bir sıralama sinyali. Asıl önemi güvende: tarayıcılar HTTPS olmayan formlarda ziyaretçiyi uyarıyor ve bu uyarı güveni doğrudan kırıyor. Ayrıntısını [SSL sertifikası nedir](/blog/ssl-sertifikasi-nedir/) yazısında anlattık.

    - type: section
      id: canonical-yonlendirme
      heading: Canonical ve yönlendirmeler
      text: |-
        Aynı içerik birden fazla adreste açılabiliyor: sonunda eğik çizgi olan ve olmayan, parametreli ve parametresiz, www'lu ve www'suz. Canonical etiketi, Google'a bu kopyalardan hangisinin asıl sayfa olduğunu söylüyor. Ama bu etiket bir emir değil, bir öneri; Google başka sinyallere bakıp farklı karar verebiliyor, bu yüzden iç bağlantıların ve sitemap'in de aynı adresi göstermesi gerekiyor.

        Bir sayfanın adresi değiştiğinde eski adresi 301 ile yenisine yönlendirmek gerekiyor. Yönlendirmesiz bir site yenilemesi, yıllarca biriken arama görünürlüğünü birkaç haftada silebiliyor. Yönlendirmeleri zincir halinde bırakmamak da önemli: A'dan B'ye, B'den C'ye giden bir zincir yerine A doğrudan C'ye gitmeli.

    - type: section
      id: yapilandirilmis-veri-hreflang
      heading: Yapılandırılmış veri ve hreflang
      text: |-
        Yapılandırılmış veri, sayfadaki bilgiyi Google'ın doğrudan okuyabileceği bir biçimde işaretliyor: bu bir işletme, adresi bu, bu bir makale, yazarı bu. Nasıl yazıldığını ve hangi türlerin işe yaradığını [yapılandırılmış veri nedir](/blog/yapilandirilmis-veri-nedir/) yazısında ayrıca anlattık.

        Hreflang ise çok dilli siteler için. Aynı sayfanın Türkçe, İngilizce ve Almanca sürümleri olduğunda, Google'a hangi dildeki kullanıcıya hangi sürümü göstereceğini söylüyor. Her sürümün diğerlerini ve kendisini listelemesi gerekiyor; tek yönlü bir hreflang Google tarafından yok sayılabiliyor.

        Dentasay'ın sitesi 13 dilde yayında. Her tedavi sayfasının her dildeki sürümü birbirine hreflang ile bağlı; Almanya'dan arayan kişi Almanca sayfayı, İngiltere'den arayan kişi İngilizce sayfayı görüyor. Bu altyapıyı nasıl kurduğumuzu [Dentasay projesinde](/projelerimiz/dentasay/) anlattık.

    - type: checklist
      heading: Teknik SEO için temel kontrol listesi
      items:
        - title: Site taranabiliyor mu
          text: robots.txt önemli bölümleri engellemiyor, sayfalarda yanlışlıkla bırakılmış noindex yok.
        - title: Sitemap güncel mi
          text: Yalnızca dizine girmesini istediğiniz, 200 dönen ve canonical olan adresler listede. Search Console'a gönderilmiş.
        - title: Tek bir asıl adres var mı
          text: HTTP ve HTTPS, www'lu ve www'suz sürümler tek bir adrese yönleniyor. Her sayfanın canonical etiketi doğru.
        - title: Kırık bağlantı ve zincir var mı
          text: 404 veren iç bağlantılar düzeltilmiş, eski adresler 301 ile yeni adreslere doğrudan gidiyor.
        - title: Mobilde okunuyor mu
          text: Metin büyütmeden okunuyor, düğmeler rahat basılıyor, yatay kaydırma yok.
        - title: Core Web Vitals yeşil mi
          text: Search Console'daki rapor mobil ve masaüstü için iyi durumda. Kötü olan sayfa grupları tespit edilmiş.
        - title: Çok dilli sitede hreflang karşılıklı mı
          text: Her dil sürümü diğerlerini ve kendisini listeliyor, x-default belirlenmiş.

    - type: callout
      variant: note
      heading: Site yenilemesi en riskli an
      text: Teknik SEO'nun en çok para kaybettirdiği yer yeni site geçişi. Adresler değişiyor, eski sayfalar siliniyor, yönlendirme listesi unutuluyor. Yeni siteye geçmeden önce eski sitenin trafik alan sayfalarını çıkarıp her birinin yeni adresini belirlemek, geçişten sonra da Search Console'u birkaç hafta yakından izlemek gerekiyor.

    - type: section
      id: nasil-denetlenir
      heading: Teknik SEO nasıl denetlenir?
      text: |-
        Başlangıç noktası Google Search Console. Sayfa dizine ekleme raporu hangi sayfaların neden dizinde olmadığını, Core Web Vitals raporu hangi sayfa gruplarının yavaş olduğunu gösteriyor. Buna bir tarama aracı ekleniyor; biz Semrush'ın site denetimini kullanıyoruz. Kırık bağlantıları, yönlendirme zincirlerini, eksik başlıkları ve kopya içeriği tek listede çıkarıyor.

        Denetimi sırayla yapmak işe yarıyor: önce dizine girememe sorunları, sonra kopya ve yönlendirme sorunları, en son hız. Adım adım bir denetimi [SEO analizi nasıl yapılır](/blog/seo-analizi-nasil-yapilir/) yazısında anlattık.

    - type: faq
      heading: Sık Sorulan Sorular
      items:
        - question: Teknik SEO bir kez yapılıp bitiyor mu?
          answer: Temeli bir kez kuruluyor ama bitmiyor. Yeni sayfa eklendiğinde, eklenti güncellendiğinde ya da tasarım değiştiğinde yeni sorunlar çıkabiliyor. Kurulumdan sonra aylık bir kontrol çoğu site için yeterli.
        - question: Site içi SEO ile teknik SEO aynı şey mi?
          answer: Hayır, ama iç içe. Site içi SEO sayfanın içeriğiyle ilgileniyor; başlık, metin, meta açıklama. Teknik SEO o sayfanın Google'a sorunsuz ulaşmasıyla ilgileniyor. Bazı kaynaklar teknik SEO'yu site içi SEO'nun bir parçası sayıyor.
        - question: Site dışı SEO sadece backlink mi?
          answer: Backlink en bilinen parçası ama tek parçası değil. Markanın başka sitelerde anılması, Google yorumları ve işletme profili de site dışı sinyaller. Backlink tarafını [backlink nedir](/blog/backlink-nedir/) yazısında anlattık.
        - question: Hazır site altyapısında teknik SEO yapılabilir mi?
          answer: Temel ayarların çoğu yapılabiliyor. Ama hız, kod yapısı ve çok dilli yapı gibi konularda altyapının izin verdiği kadar ilerleyebiliyorsunuz.

    - type: section
      id: kisaca
      heading: Kısaca
      text: |-
        Teknik SEO, içeriğinizin Google'a ulaşmasını sağlayan altyapı. Tarama ve dizine ekleme doğru çalışıyorsa, site hızlı ve mobilde rahatsa, her sayfanın tek bir asıl adresi varsa site içi ve site dışı çalışmaların emeği karşılığını buluyor.

        Teknik denetimi, içeriği ve dış sinyalleri birlikte nasıl yürüttüğümüzü [SEO ve içerik pazarlaması](/hizmetlerimiz/seo-ve-icerik-pazarlamasi/) sayfasında, danışmanlık olarak nasıl çalıştığımızı [SEO danışmanlığı](/hizmetlerimiz/seo-ve-icerik-pazarlamasi/seo-danismanligi/) sayfasında anlattık.

    - type: cta
      heading: Sitenizin teknik altyapısına birlikte bakalım.
      text: Tarama, dizine ekleme ve hız sorunlarını ücretsiz bir ön analizle çıkaralım.
      primary:
        label: Ücretsiz Analiz Talep Et
        href: /ucretsiz-analiz
      secondary:
        label: SEO Hizmetimiz
        href: /hizmetlerimiz/seo-ve-icerik-pazarlamasi
---
