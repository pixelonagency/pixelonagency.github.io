---
title: 'Google Tag Manager Nedir? Etiket, Tetikleyici ve Değişken Mantığı'
category: Dijital Reklam
translationKey: what-is-google-tag-manager
excerpt: 'Google Tag Manager, sitenize eklenen takip kodlarını tek bir panelden yönetmenizi sağlayan ücretsiz bir araç. Konteyner, etiket, tetikleyici ve değişkenin ne olduğunu, GA4, Google Ads dönüşümü ve Meta Pikseli''nin GTM ile nasıl kurulduğunu ve en sık yapılan hataları anlattık.'
date: 2026-10-01
cover: '/src/assets/images/blog/google-tag-manager-nedir-cover.webp'
coverAlt: Akşam iki monitörde bir web sitesi ve bağlantılı etiket şemasıyla çalışan bir geliştirici
author: Pixelon Ekibi
status: published
featured: false
seo:
  title: 'Google Tag Manager Nedir, Nasıl Kurulur? | Pixelon'
  description: 'Google Tag Manager (GTM) nedir? Konteyner, etiket, tetikleyici ve değişken; GA4, Google Ads dönüşümü ve Meta Pikseli kurulumu, izin modu, önizleme ve sık yapılan hatalar.'
article:
  updated: 2026-10-01
  quickAnswer:
    heading: Kısa Cevap
    text: Google Tag Manager (GTM), Google'ın ücretsiz etiket yönetim aracıdır. Sitenize bir kez tek bir konteyner kodu eklenir; Google Analytics 4, Google Ads dönüşüm etiketi, Meta Pikseli gibi bütün takip kodları bundan sonra koda dokunmadan GTM panelinden eklenir, değiştirilir ve yayına alınır. Her etiket bir tetikleyiciyle, yani hangi durumda çalışacağını söyleyen bir kuralla birlikte çalışır.
  tocHeading: İçindekiler
  related:
    - donusum-takibi-nedir
    - cpc-cpm-ctr-nedir
    - instagram-reklam-nasil-verilir
  blocks:
    - type: section
      id: nedir
      heading: Google Tag Manager ne işe yarar?
      lead: Google Tag Manager, bir web sitesindeki analiz ve reklam takip kodlarını tek bir panelden yöneten ücretsiz bir araçtır; kodlar siteye tek tek gömülmek yerine GTM konteynerinin içinden çalışır.
      text: |-
        Bir işletme sitesinde zamanla bir sürü küçük kod birikiyor. Google Analytics, Google Ads dönüşüm etiketi, Meta Pikseli, TikTok Pikseli, bir ısı haritası aracı. Her biri sitenin koduna ayrı ayrı eklendiğinde iki sorun çıkıyor.

        Birincisi, her değişiklik için yazılımcıya ihtiyaç duyuluyor. Yeni bir form takibi eklemek, bir etiketi kaldırmak ya da bir olayı düzeltmek sitenin koduna dokunmak demek.

        İkincisi, neyin nerede çalıştığını kimse tam bilmiyor. Aynı kod iki kez eklenmiş, eski bir reklam hesabının etiketi hâlâ çalışıyor, bir dönüşüm iki kez sayılıyor.

        GTM bu ikisini birden çözüyor. Siteye bir kez konteyner kodu ekleniyor. Bundan sonra bütün takip kodları GTM panelinde duruyor, orada ekleniyor, orada test ediliyor, orada yayına alınıyor.

    - type: table
      heading: GTM'in dört temel kavramı
      columns:
        - Kavram
        - Ne demek
        - Örnek
      rows:
        - - Konteyner
          - Bir siteye ait bütün etiketlerin durduğu kutu; siteye tek kod olarak eklenir
          - Şirket sitesi için bir konteyner
        - - Etiket
          - Çalıştırılacak takip kodu
          - GA4 etiketi, Google Ads dönüşüm etiketi, Meta Pikseli
        - - Tetikleyici
          - Etiketin hangi durumda çalışacağını söyleyen kural
          - Tüm sayfalarda, teşekkür sayfası açıldığında, form gönderildiğinde
        - - Değişken
          - Etiketin ya da tetikleyicinin kullandığı değer
          - Sayfa adresi, tıklanan butonun metni, sipariş tutarı

    - type: section
      id: nasil-calisir
      heading: Etiket ve tetikleyici birlikte çalışır
      text: |-
        GTM'in mantığı tek cümleyle anlatılabiliyor: şu olduğunda, şu kodu çalıştır.

        "Şu olduğunda" kısmı tetikleyici. Sayfa görüntülendiğinde, bir butona tıklandığında, form gönderildiğinde, sayfanın yarısına kadar kaydırıldığında. "Şu kodu" kısmı etiket.

        Değişkenler ise bu ikisini daha akıllı yapıyor. Örneğin tetikleyiciye "sayfa adresinde tesekkurler geçtiğinde" diyebilmek için sayfa adresi değişkenine ihtiyaç var. Bir satışın tutarını reklam platformuna göndermek için de sipariş tutarının bir değişkende tutulması gerekiyor.

        Sitenin GTM'e bilgi aktardığı ortak alana veri katmanı (dataLayer) deniyor. Bir e-ticaret sitesi satın alma olduğunda ürün ve tutar bilgisini buraya yazıyor, GTM de oradan okuyup ilgili etiketlere dağıtıyor.

    - type: section
      id: neden-ajans
      heading: Ajanslar neden GTM ile çalışır?
      text: |-
        Reklam yönetiminde ölçüm sürekli değişiyor. Yeni bir kampanya yeni bir dönüşüm ister, yeni bir kanal yeni bir piksel ister, bir form değişince tetikleyici değişir.

        Bunların her biri için sitenin yazılımcısını beklemek kampanyayı haftalarca geciktirebiliyor. GTM ile bu işleri reklam ekibi kendisi yapıyor, üstelik sitenin koduna dokunmadan.

        Bir de erişim meselesi var. GTM hesabının sahibi işletme oluyor; ajansa yalnızca gereken yetki veriliyor. İş bittiğinde erişim geri alınıyor ve bütün kurulum işletmede kalıyor. Her sürüm kaydedildiği için bir değişiklik sorun çıkarırsa önceki sürüme dönmek birkaç tıklama.

    - type: process
      heading: GTM ile temel kurulum adım adım
      intro: Sıfırdan başlayan bir sitede izlediğimiz sıra bu.
      steps:
        - title: Hesap ve konteyneri oluşturun
          text: tagmanager.google.com adresinde işletmenin kendi Google hesabıyla hesap ve web konteyneri açılıyor. Sahiplik işletmede kalmalı.
        - title: Konteyner kodunu siteye ekleyin
          text: GTM'in verdiği iki kod parçası sitenin tüm sayfalarına bir kez ekleniyor. Site altyapısına göre bu işi bir eklenti ya da tema ayarı da yapabiliyor.
        - title: GA4 etiketini kurun
          text: Google etiketi türünde bir etiket oluşturup GA4 ölçüm kimliğini giriyorsunuz, tetikleyici olarak tüm sayfaları seçiyorsunuz. Form, arama, WhatsApp tıklaması gibi olaylar için ayrıca GA4 etkinlik etiketleri ekleniyor.
        - title: Google Ads dönüşümünü bağlayın
          text: Google Ads'te oluşturduğunuz dönüşümün kimliği ve etiketi GTM'de Google Ads dönüşüm izleme etiketine giriliyor. Tetikleyici, dönüşümün gerçekleştiği an, örneğin teşekkür sayfası. Yanına tüm sayfalarda çalışan bir dönüşüm bağlayıcı etiketi ekleniyor.
        - title: Meta Pikseli'ni ekleyin
          text: Pikselin temel kodu tüm sayfalarda çalışan bir etiket olarak, form veya satın alma gibi olaylar ise ayrı etiketler olarak ekleniyor. GTM'in şablon galerisindeki hazır şablonlar da kullanılabiliyor.
        - title: Önizleme ile test edin
          text: Önizleme modunda site açılıyor ve hangi etiketin hangi anda çalıştığı tek tek görülüyor. Dönüşüm etiketinin yalnızca doğru anda, bir kez çalıştığını doğrulamadan yayına almıyoruz.
        - title: Sürümü yayınlayın
          text: Değişikliklere açıklayıcı bir ad verip yayınlıyorsunuz. Her yayın bir sürüm olarak saklanıyor.

    - type: section
      id: izin
      heading: Çerez izni ve izin modu
      text: |-
        Takip kodlarının çoğu çerez kullanıyor ve kişisel veriyle ilişkili. Bu yüzden ziyaretçinin iznini almadan her etiketi çalıştırmak hukuki bir risk.

        Pratikte sitede bir çerez izin aracı kullanılıyor ve GTM bu araçtan gelen tercihe göre hangi etiketin çalışacağına karar veriyor. Google'ın izin modu da bu tercihi Google etiketlerine iletiyor; ziyaretçi reddettiğinde etiketler çerez yazmadan, sınırlı şekilde çalışıyor.

        İzin yapısının nasıl kurulacağı sitenin hangi ülkelere hitap ettiğine ve hangi verileri işlediğine bağlı. KVKK ve hedef pazarlardaki kurallar için hukuki danışmanlık almanızı öneriyoruz; teknik kurulum bu kararın üzerine yapılıyor.

    - type: callout
      variant: note
      heading: İzin reddedildiğinde dönüşüm kaybolmaz, azalır
      text: Çerez izni vermeyen ziyaretçilerin dönüşümleri panelde eksik görünebilir. Bu yüzden panel ile gerçek talep sayısını ara ara karşılaştırmak gerekiyor. Aradaki farkı bilmek, kampanyayı yanlış bir sebeple kapatmanızı önlüyor.

    - type: section
      id: ornek
      heading: 'Pratikte: tedavi başına sayfa, tedavi başına dönüşüm'
      text: |-
        [Dentasay](/projelerimiz/dentasay/) için Meta ve Google kampanyalarını 20 ülkede ve 13 dilde yürüttük ve her tedavi için ayrı bir açılış sayfası kurduk. Hasta iletişimi için de WhatsApp akışları hazırladık.

        Böyle bir yapıda ölçümün sitenin koduna gömülü olması yönetilemez hâle gelir. Hangi sayfadan, hangi dilde, hangi kanala talep geldiğini ayırabilmek için dönüşümleri tek bir etiket yönetim yapısı üzerinden takip etmek, yeni bir sayfa ya da dil eklendiğinde kurulumu koda dokunmadan genişletmeyi mümkün kılıyor.

    - type: checklist
      heading: En sık gördüğümüz hatalar
      items:
        - title: Aynı etiket hem kodda hem GTM'de
          text: GA4 veya piksel hem sitenin koduna gömülü hem de GTM'de ekliyse her ziyaret ve dönüşüm iki kez sayılıyor.
        - title: Dönüşüm tetikleyicisi fazla geniş
          text: Teşekkür sayfası yerine tüm sayfalarda çalışan bir dönüşüm etiketi, her ziyareti dönüşüm gibi gösteriyor.
        - title: Form tıklaması dönüşüm sayılıyor
          text: Gönder butonuna tıklamak formun başarıyla gönderildiği anlamına gelmiyor. Hatalı ya da eksik gönderimler de sayılıyor.
        - title: Önizleme yapmadan yayın
          text: Test edilmeden yayına alınan değişiklik, bozuk bir ölçümle günlerce kampanya yönetmek demek.
        - title: Hesap ajansın elinde
          text: GTM, Analytics ve reklam hesapları işletmenin kendi hesabında açılmalı. Aksi halde ajans değiştiğinde bütün kurulum kayboluyor.
        - title: İsimlendirme yok
          text: Etiket 1, Etiket 2 gibi isimler birkaç ay sonra kimsenin anlamadığı bir konteyner bırakıyor.

    - type: section
      id: ga4-farki
      heading: GTM ile GA4 arasındaki fark
      text: |-
        İki araç çoğu zaman birbirine karıştırılıyor, çünkü ikisi de Google'ın ve ikisi de ölçümle ilgili.

        Google Analytics 4 bir raporlama aracı. Ziyaretçinin nereden geldiğini, hangi sayfaları gezdiğini, hangi eylemleri yaptığını toplayıp raporluyor. Google Tag Manager ise bir dağıtım aracı. Kendisi hiçbir veri saklamıyor ve rapor göstermiyor; yalnızca GA4'ün, Google Ads'in ya da Meta'nın kodunu doğru anda çalıştırıyor.

        Bir benzetmeyle: GA4 kaydı tutan defter, GTM ise hangi olayın deftere ne zaman yazılacağını belirleyen kural listesi.

        Bu yüzden GTM'e ihtiyaç duyup duymadığınız, kaç araç kullandığınıza ve ne sıklıkla değişiklik yaptığınıza bağlı. Tek sayfalık, yalnızca GA4 kullanan ve hiç reklam vermeyen bir sitede GTM şart değil. Ama birden fazla reklam kanalı, birkaç farklı dönüşüm ve düzenli kampanya değişikliği varsa, GTM olmadan ölçümü düzenli tutmak çok zorlaşıyor. Reklam ağırlıklı çalışan işletmelerde bu yüzden kurulumu en baştan GTM üzerinden yapıyoruz.

    - type: faq
      heading: Sık Sorulan Sorular
      items:
        - question: Google Tag Manager ücretli mi?
          answer: Standart sürümü ücretsiz ve çoğu işletmenin ihtiyacını karşılıyor. Büyük kurumlar için Google Marketing Platform içinde ücretli bir kurumsal sürüm de var.
        - question: GTM, Google Analytics'in yerini alır mı?
          answer: Hayır. GTM veri toplamaz ve rapor göstermez; yalnızca Analytics gibi araçların kodlarını doğru anda çalıştırır. Raporları yine GA4'te görürsünüz.
        - question: GTM siteyi yavaşlatır mı?
          answer: Konteynerin kendisi hafif. Yavaşlığı içindeki etiketlerin sayısı ve ağırlığı belirliyor. Kullanılmayan etiketleri temizlemek, GTM'siz dağınık kurulumdan genellikle daha iyi sonuç veriyor.
        - question: Hangi dönüşümleri takip etmeliyim?
          answer: İşletmeniz için gerçek değeri olan eylemleri. Satış, form, telefon araması ve WhatsApp mesajı en yaygınları. Seçimi ve olay kurgusunu [dönüşüm takibi nedir](/blog/donusum-takibi-nedir/) yazısında anlattık.

    - type: section
      id: kisaca
      heading: Kısaca
      text: |-
        Google Tag Manager, takip kodlarını sitenin kodundan alıp tek bir panele taşıyor. Konteyner bir kez eklenir; etiketler, tetikleyiciler ve değişkenlerle GA4, Google Ads ve Meta Pikseli koda dokunmadan kurulur, önizleme ile test edilir, sürüm olarak yayınlanır.

        Ölçüm doğru kurulduğunda panelde okuduğunuz CPA ve ROAS anlam kazanıyor; bu metrikleri [CPC, CPM, CTR nedir](/blog/cpc-cpm-ctr-nedir/) yazısında anlattık. Ölçümü kampanya kurgusuyla birlikte nasıl ele aldığımızı [Google Ads yönetimi](/hizmetlerimiz/dijital-reklam-yonetimi/google-ads-yonetimi/) ve [dijital reklam yönetimi](/hizmetlerimiz/dijital-reklam-yonetimi/) sayfalarında gösterdik.

    - type: cta
      heading: Ölçüm kurulumunuzu kontrol edelim.
      text: Hangi etiketin çalıştığını, hangi dönüşümün eksik ya da çift sayıldığını çıkaralım.
      primary:
        label: Ücretsiz Analiz Talep Et
        href: /ucretsiz-analiz
      secondary:
        label: Reklam Yönetimi Hizmetimiz
        href: /hizmetlerimiz/dijital-reklam-yonetimi
---
