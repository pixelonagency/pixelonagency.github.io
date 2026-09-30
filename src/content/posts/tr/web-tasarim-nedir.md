---
title: 'Web Tasarım Nedir? Tasarım, Kodlama ve İşe Yarayan Site'
category: Web Tasarım
translationKey: what-is-web-design
excerpt: Web tasarım, bir sitenin nasıl göründüğünden önce ziyaretçinin orada ne yapacağına karar verme işi. Tasarımın kodlamadan farkını, bir sitede hangi kararların verildiğini ve sürecin nasıl işlediğini kendi projelerimizden örneklerle anlattık.
date: 2026-09-30
cover: '/src/assets/images/blog/web-tasarim-nedir-cover.webp'
coverAlt: Koyu bir tasarım stüdyosunda iki kişinin masaya yayılmış kâğıt site taslaklarını incelediği, birinin taslaktaki bir bölümü işaret ettiği ve ekranda aynı düzenin bitmiş site olarak açık olduğu fotoğraf
author: Pixelon Ekibi
status: published
featured: false
seo:
  title: 'Web Tasarım Nedir? Tasarım ve Kodlama Farkı | Pixelon'
  description: 'Web tasarım nedir, ne işe yarar, kodlamadan farkı ne? Bir sitede verilen tasarım kararlarını ve süreci gerçek projelerden örneklerle anlattık.'
article:
  updated: 2026-09-30
  quickAnswer:
    heading: Kısa Cevap
    text: Web tasarım, bir web sitesinin yapısını, görünümünü ve kullanımını planlama işidir. Hangi sayfaların olacağı, ziyaretçinin aradığını nasıl bulacağı, sayfanın telefonda nasıl davranacağı ve her sayfanın ziyaretçiyi hangi adıma götüreceği tasarımda belirlenir. Kodlama ise bu kararları tarayıcının çalıştırabildiği bir siteye dönüştürür.
  tocHeading: İçindekiler
  related:
    - kurumsal-web-sitesi-nasil-olmali
    - wordpress-mi-ozel-yazilim-mi
    - web-tasarim-fiyatlari
  blocks:
    - type: section
      id: tanim
      heading: Web tasarım nedir?
      lead: Web tasarım, bir sitenin yapısını, görünümünü ve kullanımını planlama işidir. Amaç ziyaretçinin aradığını hızlıca bulması ve bir sonraki adımı atmasıdır.
      text: |-
        Çoğu kişi web tasarım deyince renkleri, fontları ve fotoğrafları düşünüyor. Bunlar işin görünen kısmı, ama en büyük kısmı değil.

        Bir siteyi tasarlarken ilk sorduğumuz soru "nasıl görünsün" değil. Soru şu: Bu siteye kim gelecek, ne arıyor ve ondan ne yapmasını bekliyoruz?

        Renk ve tipografi bu sorunun cevabı netleştikten sonra devreye giriyor. Sırayı ters çevirince ortaya güzel ama ne işe yaradığı belli olmayan siteler çıkıyor.

    - type: infographic
      heading: Bir web tasarımının parçaları
      intro: Ziyaretçi bunları ayrı ayrı fark etmiyor, ama biri eksik olduğunda site aksıyor.
      center: Web Tasarım
      nodes:
        - Site haritası ve sayfa yapısı
        - Kullanıcı deneyimi (UX)
        - Arayüz tasarımı (UI)
        - İçerik ve metin
        - Mobil davranış
        - Ölçüm ve dönüşüm

    - type: section
      id: tasarim-ve-kodlama
      heading: Web tasarımı ve kodlama arasındaki fark
      lead: Tasarım sitenin ne olacağına karar verir, kodlama o kararı çalışan bir siteye dönüştürür.
      text: |-
        İkisi çoğu zaman aynı cümlede geçiyor ve karıştırılıyor. Aslında sıralı iki iş.

        Tasarım aşamasında sayfaların listesi, her sayfadaki bilgi sırası, butonların yeri ve telefondaki düzen belirleniyor. Çıktısı çizimler ve tasarım dosyaları. Bu kararların hangi ilkelere göre verildiğini [web tasarım ilkeleri](/blog/web-tasarim-ilkeleri/) yazısında anlattık.

        Kodlama aşamasında bu çizimler HTML, CSS ve JavaScript ile tarayıcının anlayacağı hâle getiriliyor. Formun nereye gideceği, sayfanın ne kadar hızlı açılacağı ve yönetim panelinin nasıl çalışacağı burada çözülüyor.

        Tasarımın içinde de iki ayrı katman var: kullanıcının işi nasıl yapacağı ve bunun ekranda nasıl görüneceği. Bu ayrımı [UI ve UX nedir](/blog/ui-ux-nedir/) yazısında anlattık.

        İyi bir sitede ikisi birbirinden kopuk ilerlemiyor. Tasarımcı kodun neye izin verdiğini, geliştirici de tasarımın neden öyle kurulduğunu biliyor.

    - type: table
      heading: Tasarım ve kodlama yan yana
      columns:
        - Konu
        - Web tasarım
        - Kodlama
      rows:
        - - Cevapladığı soru
          - Site ne yapacak, ziyaretçi nereye gidecek?
          - Bu kararlar tarayıcıda nasıl çalışacak?
        - - Çıktısı
          - Site haritası, taslak ekranlar, görsel tasarım
          - Yayına alınabilen, yönetilebilen site
        - - Kullanılan araçlar
          - Tasarım ve prototip araçları
          - HTML, CSS, JavaScript, yönetim paneli
        - - Eksik kalırsa
          - Site çalışır ama ziyaretçi ne yapacağını anlamaz
          - Tasarım güzeldir ama sayfa yavaş açılır, form çalışmaz

    - type: section
      id: kararlar
      heading: Bir sitenin tasarımında aslında neye karar veriliyor?
      text: |-
        Tanımı somutlaştırmanın en iyi yolu, gerçek projelerde verilen kararlara bakmak. Aşağıdaki üç örnekte de asıl iş görsel değil, ziyaretçinin aradığı bilgiye nasıl ulaşacağıydı.

    - type: cards
      items:
        - title: 'Redex Glass: alıcı ölçüyü arıyor'
          text: İlaç ve kozmetik sektörüne cam ambalaj üreten bir firma. Alıcı güzel bir ürün fotoğrafından çok hacim, ölçü ve ağız çapı arıyor. Tasarım kararı, onlarca ürün ailesini teknik tablolara oturtmak ve her satırdan teknik çizime inilebilmesini sağlamaktı.
        - title: 'Xray Groupe: yatırımcı kanıt arıyor'
          text: Demokratik Kongo'da çalışan bir inşaat firması. Siteyi hizmet listesi olarak değil, kanıt arşivi olarak kurduk. Her proje kendi sayfasını aldı; konum, proje tipi, başlangıç ve bitiş tarihi, durum tek ekranda.
        - title: 'Touch Consulting: işletme kendine uygun desteği arıyor'
          text: Teşvik ve hibe danışmanlığı yapan bir firma. Üç hizmet dalını birbirine karıştırmadan ayırdık ve her sayfayı bir form bloğuyla kapattık. Site yalnızca tanıtmıyor, talep topluyor.

    - type: section
      id: surec
      heading: Web tasarım süreci nasıl işler?
      text: |-
        Projeden projeye ayrıntılar değişse de sıra genellikle aynı. Kurumsal sitelerde bu süreç bizde ortalama 30 gün sürüyor; süreyi en çok içeriklerin hazırlanması ve onay beklemek belirliyor. Aynı sürecin işletme tarafında nasıl göründüğünü [web sitesi nasıl yapılır](/blog/web-sitesi-nasil-yapilir/) yazısında anlattık.

    - type: process
      steps:
        - title: Keşif
          text: İşinizi, müşterinizi ve sitenin hangi işi yapması gerektiğini konuşuyoruz. Rakip siteler ve mevcut sitenin verileri varsa burada inceleniyor.
        - title: Site haritası
          text: Hangi sayfaların olacağı ve birbirine nasıl bağlanacağı belirleniyor. Her hizmet için ayrı sayfa mı, tek sayfa mı, kararı burada veriliyor.
        - title: Taslak ekranlar
          text: Renksiz, fotoğrafsız taslaklarla her sayfadaki bilgi sırası ve butonların yeri netleşiyor. Önce telefon ekranı çiziliyor. Bu aşamayı [wireframe nedir](/blog/wireframe-nedir/) yazısında ayrıntılı anlattık.
        - title: Görsel tasarım
          text: Marka kimliği taslaklara giydiriliyor. Renk, tipografi ve görsel dil bu aşamada devreye giriyor.
        - title: Kodlama ve panel
          text: Tasarım kodlanıyor, yönetim paneli kuruluyor, formlar ve ölçüm araçları bağlanıyor.
        - title: Test ve yayın
          text: Farklı telefon ve tarayıcılarda test ediliyor, hız ölçülüyor, yönlendirmeler kontrol ediliyor ve site yayına alınıyor.

    - type: callout
      variant: note
      heading: Pixelon Notu
      text: En çok zaman kaybettiren adım tasarım değil, içerik. Metinler ve fotoğraflar tasarımın sonuna bırakıldığında sayfalar boş kutularla onaylanıyor, sonra içerik gelince düzen baştan değişiyor. Metni ve fotoğraf planını ilk haftada birlikte çıkarmak süreyi belirgin şekilde kısaltıyor.

    - type: section
      id: iyi-tasarim
      heading: İyi bir web tasarımını nasıl anlarsınız?
      text: |-
        Beğeni kişiden kişiye değişir, ama iyi tasarımın ölçülebilir birkaç işareti var.

    - type: checklist
      items:
        - title: İlk ekranda ne iş yaptığınız anlaşılıyor
          text: Ziyaretçi birkaç saniye içinde ne sattığınızı ve kime sattığınızı görebilmeli. Slogan tek başına bu işi görmüyor.
        - title: Telefonda rahat kullanılıyor
          text: Butonlar parmakla kolayca basılıyor, metin yakınlaştırmadan okunuyor, menü açılıp kapanırken sayfa kaymıyor. Telefonda denenecek maddelerin tamamı [mobil uyumlu web sitesi](/blog/mobil-uyumlu-web-sitesi/) yazısında.
        - title: Sayfa hızlı açılıyor
          text: Büyük fotoğraflar küçültülmüş, gereksiz eklentiler çıkarılmış. Yavaş açılan sayfada ziyaretçi içeriği görmeden çıkıyor.
        - title: Her sayfanın bir sonraki adımı var
          text: Teklif almak, randevu oluşturmak, WhatsApp'tan yazmak. Hangi adım olduğu belirsizse ziyaretçi çıkışı seçiyor.
        - title: Sonuç ölçülüyor
          text: Form gönderimi, telefon tıklaması ve WhatsApp mesajı ölçülüyor. Ölçülmeyen bir sitede neyin işe yaradığı tahmine kalıyor.

    - type: faq
      heading: Sık Sorulan Sorular
      items:
        - question: Web tasarımcı ne iş yapar?
          answer: Web tasarımcı sitenin sayfa yapısını, ekranlardaki bilgi sırasını ve görsel dilini planlar. Kodlamayı genellikle bir geliştirici yapar; küçük ekiplerde iki iş aynı kişide birleşebilir. Önemli olan tasarımcının kodun neye izin verdiğini bilmesidir.
        - question: Web tasarımı ve kodlama bölümü nedir?
          answer: Türkiye'de meslek yüksekokullarında okutulan iki yıllık bir önlisans programıdır. Program hem tasarım hem kodlama derslerini kapsar. Bu yazı ise bir işletme için web sitesi tasarımının nasıl işlediğini anlatıyor.
        - question: Hazır şablon kullanmak web tasarım sayılır mı?
          answer: Şablon hazır bir tasarımdır; kendi içeriğinize uyarlamak da bir tasarım işidir. Hizmetleriniz standart ve bütçeniz sınırlıysa şablon hızlı bir başlangıç sağlar. Ürün tabloları, çok dilli yapı ya da özel bir başvuru akışı gerekiyorsa şablonun kalıbı dar gelir. Şablonun ne zaman yettiğini [hazır şablon mu, özel web tasarım mı](/blog/hazir-site-mi-ozel-tasarim-mi/) yazısında, altyapı tarafını [WordPress mi, özel yazılım mı](/blog/wordpress-mi-ozel-yazilim-mi/) yazısında anlattık.
        - question: Web tasarım ne kadar sürer?
          answer: Kurumsal sitelerde bizde ortalama 30 gün. Sayfa sayısı, dil sayısı ve içeriklerin hazır olup olmaması süreyi değiştiriyor.
        - question: Web tasarım fiyatları ne kadar?
          answer: Kurumsal web siteleri 50.000 TL'den başlıyor, KDV hariç. Fiyatı sayfa sayısı, dil sayısı ve bağlanacak sistemler belirliyor. Paketlerin tamamını [web sitesi fiyatları](/hizmetlerimiz/web-tasarim-ve-yazilim/web-sitesi-fiyatlari/) sayfasında bulabilirsiniz.

    - type: section
      id: kisaca
      heading: Kısaca
      text: |-
        Web tasarım, ziyaretçinin sitede ne yapacağını planlama işi. Görsel kısım bu planın son katmanı.

        Kodlama bu planı çalışan bir siteye dönüştürüyor. İkisi birbirini bildiğinde site hem güzel görünüyor hem de iş getiriyor.

        Tasarımdan kodlamaya kadar bütün süreci tek ekiple nasıl yürüttüğümüzü [web tasarım ve yazılım](/hizmetlerimiz/web-tasarim-ve-yazilim/) hizmet sayfamızda anlattık.

        Kurumsal bir sitede neye dikkat etmek gerektiğini [kurumsal web sitesi nasıl olmalı](/blog/kurumsal-web-sitesi-nasil-olmali/) yazısında, bu kararları kendi projelerimizde nasıl uyguladığımızı [kurumsal web tasarım](/hizmetlerimiz/web-tasarim-ve-yazilim/kurumsal-web-tasarim/) sayfasında anlattık.

    - type: cta
      heading: Sitenizde hangi kararın eksik olduğunu birlikte bulalım.
      text: Mevcut sitenizi ya da aklınızdaki projeyi anlatın, ilk görüşmede nereden başlanması gerektiğini söyleyelim.
      primary:
        label: Ücretsiz Analiz Talep Et
        href: /ucretsiz-analiz
      secondary:
        label: Web Tasarım Hizmetimiz
        href: /hizmetlerimiz/web-tasarim-ve-yazilim
---
