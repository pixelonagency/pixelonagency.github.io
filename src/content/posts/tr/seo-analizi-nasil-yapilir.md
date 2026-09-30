---
title: 'SEO Analizi Nasıl Yapılır? Adım Adım Site Denetimi'
category: SEO
translationKey: how-to-do-an-seo-audit
excerpt: 'SEO analizi, sitenizin Google''da neden olduğu yerde durduğunu gösteren bir denetim. Search Console''daki dizin durumundan teknik kontrollere, sayfa içi SEO''dan rakiplerle içerik farkına ve backlinklere kadar, bir analizi sırasıyla nasıl yaptığımızı ve bulguları nasıl önceliklendirdiğimizi anlattık.'
date: 2026-10-01
cover: '/src/assets/images/blog/seo-analizi-nasil-yapilir-cover.webp'
coverAlt: Akşam şehir manzaralı bir ofiste monitördeki site denetim grafiklerini ve kontrol listesini inceleyen bir uzman
author: Pixelon Ekibi
status: published
featured: false
seo:
  title: 'SEO Analizi: Adım Adım Denetim Rehberi | Pixelon'
  description: 'SEO analizi nasıl yapılır? Search Console dizin kontrolü, teknik SEO, sayfa içi SEO, rakip içerik farkı, backlink ve yerel sinyaller, bulguları öncelik listesine çevirme.'
article:
  updated: 2026-10-01
  quickAnswer:
    heading: Kısa Cevap
    text: 'SEO analizi, bir sitenin arama motorlarındaki durumunu sırayla kontrol etmektir. Önce Google''ın sayfaları görüp dizine ekleyip eklemediğine bakılır, sonra hız, mobil ve yönlendirme gibi teknik konulara, ardından başlık, açıklama ve içeriğin arama niyetine uyup uymadığına geçilir. Rakiplerle içerik farkı, backlink profili ve yerel sinyaller de incelenir. Analizin sonu bir rapor değil, etkisine ve zahmetine göre sıralanmış bir iş listesidir.'
  tocHeading: İçindekiler
  related:
    - web-sitesi-analizi-nasil-yapilir
    - seo-nedir-nasil-calisir
    - seo-ne-kadar-surede-sonuc-verir
  blocks:
    - type: section
      id: seo-analizi-nedir
      heading: SEO analizi ne işe yarar?
      lead: SEO analizi, sitenizin aramada neden görünmediğini ya da neden yerinde saydığını tahminle değil, veriyle gösterir.
      text: |-
        "Sitemiz Google'da çıkmıyor" cümlesinin arkasında çok farklı sorunlar olabiliyor. Sayfalar dizine hiç girmemiş olabilir. Girmiş ama yanlış kelimeyi hedefliyor olabilir. Ya da içerik iyi, ama rakiplerin arkasında güvenilirlik farkı var.

        Analiz bu olasılıkları tek tek eliyor. Sıra önemli: dizine girmeyen bir sayfanın başlığını düzeltmek hiçbir şeyi değiştirmez. O yüzden temelden başlayıp yukarı çıkıyoruz.

        Bu yazı yalnızca SEO tarafını anlatıyor. Sitenin ziyaretçiyi müşteriye çevirip çevirmediğini, form ve dönüşüm tarafını da kapsayan genel denetimi [web sitesi analizi nasıl yapılır](/blog/web-sitesi-analizi-nasil-yapilir/) yazısında ayrıca anlattık.

    - type: process
      heading: SEO analizinin sırası
      intro: Her adım bir öncekinin sağlam olduğunu varsayıyor. Sırayı atlamak, yanlış yerde vakit harcamak demek.
      steps:
        - title: Dizin ve kapsam
          text: Google sayfaları görüyor ve dizine ekliyor mu? Search Console'daki sayfa raporu ilk durak.
        - title: Teknik kontroller
          text: Hız, mobil görünüm, tarama hataları, yönlendirmeler ve canonical etiketleri.
        - title: Sayfa içi SEO
          text: Başlık, meta açıklama, başlık hiyerarşisi ve içeriğin arama niyetine uyumu.
        - title: İçerik farkı
          text: Rakiplerin trafik aldığı ama sizin hiç cevap vermediğiniz konular.
        - title: Backlink ve yerel sinyaller
          text: Siteye kimlerin bağlantı verdiği, Google İşletme Profili ve yorumlar.
        - title: Öncelik listesi
          text: Bulguları etkisine ve zahmetine göre sıralayıp işe dönüştürmek.

    - type: section
      id: dizin-kontrolu
      heading: 1. Search Console'da dizin ve kapsam
      lead: İlk soru basit, Google sayfalarınızı biliyor mu?
      text: |-
        Search Console'da "Dizin oluşturma" altındaki sayfalar raporu, sitenizde kaç sayfanın dizinde olduğunu ve kaçının neden dışarıda kaldığını gösteriyor. "Tarandı, şu anda dizine eklenmedi", "Yinelenen sayfa" ya da "noindex etiketiyle hariç tutuldu" gibi nedenler burada listeleniyor.

        Burada iki şeye bakıyoruz. Önemli sayfalarınız, yani hizmet ve ürün sayfaları, dizinde mi? Ve dizinde olmaması gereken sayfalar, yani filtre sonuçları, test sayfaları, eski kampanya sayfaları, dizine girmiş mi?

        Tek bir sayfayı kontrol etmek için URL denetimi aracı var. Adresi yazdığınızda Google'ın o sayfayı en son ne zaman taradığını ve hangi canonical adresi seçtiğini gösteriyor. Aracı hiç kullanmadıysanız [Google Search Console nedir](/blog/google-search-console-nedir/) yazısından başlayabilirsiniz.

        Site haritasını da burada kontrol ediyoruz. Gönderilmiş mi, hata veriyor mu, içindeki adresler gerçekten açılıyor mu?

    - type: section
      id: teknik-kontroller
      heading: 2. Teknik kontroller
      text: |-
        Teknik tarafta amaç, Google'ın siteyi zahmetsizce tarayabildiğinden ve ziyaretçinin sayfayı hızlı açabildiğinden emin olmak.

        Hız için Search Console'daki Core Web Vitals raporuna ve PageSpeed Insights'a bakıyoruz. Burada üç ölçüm var: sayfanın ana içeriğinin ne kadar sürede yüklendiği (LCP), tıklamaya ne kadar hızlı tepki verdiği (INP) ve yüklenirken içeriğin kayıp kaymadığı (CLS). Gerçek kullanıcı verisi varsa laboratuvar skorundan daha anlamlı.

        Mobilde sayfayı telefonda açıp gerçekten kullanıyoruz. Google siteyi ağırlıklı olarak mobil sürümüne göre değerlendiriyor; masaüstünde düzgün görünen ama telefonda menüsü açılmayan bir site, Google'ın gözünde o bozuk halidir.

        Bir tarama aracıyla siteyi baştan sona dolaşıp kırık bağlantıları (404), yönlendirme zincirlerini ve birbirine yönlenen döngüleri buluyoruz. Site yenilendiyse eski adreslerin yeni karşılıklarına 301 ile gidip gitmediği özellikle önemli; yeniden tasarımdan sonra trafiğin düşmesinin en sık nedeni bu.

        Canonical etiketlerinde de aynı adresin birden fazla sürümü (www ve www'suz, sonda eğik çizgili ve çizgisiz) tek bir adreste birleşiyor mu, ona bakıyoruz. Teknik tarafın tamamını [teknik SEO nedir](/blog/teknik-seo-nedir/) yazısında açtık.

    - type: section
      id: sayfa-ici
      heading: 3. Sayfa içi SEO ve arama niyeti
      lead: Bir sayfa doğru kelimeyi hedeflese bile, arayan kişinin beklediği türde içerik sunmuyorsa üst sıraya çıkmakta zorlanır.
      text: |-
        Her önemli sayfa için başlık etiketi, meta açıklama, H1 ve alt başlıkları tek tek okuyoruz. Başlık sayfanın konusunu söylüyor mu? İki sayfa aynı başlığı taşıyor mu? Açıklama tıklamaya değer bir şey vaat ediyor mu? Bu etiketlerin nasıl yazılacağını [meta description nedir](/blog/meta-description-nedir/) yazısında anlattık.

        Asıl kritik kontrol arama niyeti. Hedeflenen kelimeyi Google'a yazıp ilk sayfaya bakıyoruz. Orada rehber yazılar mı var, hizmet sayfaları mı, ürün listeleri mi? Google'ın o arama için ne tür sayfa gösterdiği, arayan kişinin ne istediğini anlatıyor. Hizmet sayfanızla bilgi amaçlı bir aramada yarışmaya çalışıyorsanız, sorun içeriğin kalitesinde değil türünde.

        Bir de aynı kelimeyi hedefleyen birden fazla sayfa olup olmadığına bakıyoruz. Bu durumda sayfalar birbirinin önünü kesebiliyor; konuyu [anahtar kelime nedir](/blog/anahtar-kelime-nedir/) yazısında anlattık.

    - type: section
      id: icerik-farki
      heading: 4. Rakiplerle içerik farkı
      text: |-
        Aramada sizin önünüzde çıkan iki üç siteyi seçiyoruz. Bunlar iş hayatındaki rakiplerinizle aynı olmayabilir; aramadaki rakibiniz bazen bir rehber sitesi ya da bir dergidir.

        Semrush gibi bir araçla bu sitelerin trafik aldığı kelimeleri sizinkilerle karşılaştırıyoruz. Onların sıralandığı ama sizin hiç sayfanızın olmadığı konular, içerik planının hammaddesi. Search Console'da da gösterim alan ama tıklama almayan sorgular, yarım kalmış fırsatları gösteriyor.

        Her fark yazılmaya değmez. Bakılan şey, o aramayı yapan kişinin sizin müşteriniz olup olmadığı.

    - type: section
      id: backlink-yerel
      heading: 5. Backlink ve yerel sinyaller
      text: |-
        Search Console'daki bağlantılar raporu, sitenize en çok bağlantı veren siteleri ve en çok bağlantı alan sayfalarınızı gösteriyor. Burada sayıdan çok kaliteye bakıyoruz: bağlantılar sektörünüzle ilgili, gerçek sitelerden mi geliyor? Konuyu [backlink nedir](/blog/backlink-nedir/) yazısında ayrıntılı anlattık.

        Belli bir bölgeye hizmet veren işletmelerde yerel sinyaller de analize giriyor. Google İşletme Profili eksiksiz mi, kategori doğru mu, adres ve telefon sitede ve profilde aynı mı yazıyor, yorumlar düzenli geliyor mu? Yorum tarafını [Google yorumları nasıl artırılır](/blog/google-yorumlari-nasil-artirilir/) yazısında anlattık. Bölgesel aramanın tamamını [yerel SEO](/hizmetlerimiz/seo-ve-icerik-pazarlamasi/yerel-seo/) sayfasında ele aldık.

    - type: table
      heading: Bulguları önceliklendirmek
      intro: Analizin sonunda elinizde onlarca madde olur. Hepsini aynı anda yapmak yerine etkisine ve zahmetine göre sıralıyoruz.
      columns:
        - Bulgu türü
        - Örnek
        - Öncelik
      rows:
        - - Önemli sayfa dizinde değil
          - Hizmet sayfasında yanlışlıkla noindex kalmış
          - Hemen
        - - Eski adresler yönlenmiyor
          - Yenilenen sitede eski sayfalar 404 veriyor
          - Hemen
        - - Başlık ve açıklama sorunları
          - Beş sayfa aynı başlığı taşıyor
          - Kısa vadede
        - - Arama niyetiyle uyumsuz sayfa
          - Bilgi aranan kelimede satış sayfası yarışıyor
          - Kısa vadede
        - - Hız sorunları
          - Ana görsel çok büyük, LCP yavaş
          - Kısa ya da orta vadede
        - - İçerik farkı
          - Rakiplerin sıralandığı konularda sayfa yok
          - Planlı, aylara yayılarak
        - - Backlink eksikliği
          - Sektör sitelerinden hiç bağlantı yok
          - Sürekli, uzun vadede

    - type: callout
      variant: tip
      heading: Rapor değil, iş listesi
      text: İyi bir SEO analizinin çıktısı yüz sayfalık bir PDF değil. Her maddenin karşısında ne yapılacağı, kimin yapacağı ve neden önemli olduğu yazan bir listedir. Bir araçtan otomatik alınmış skor raporu bu işi görmez, çünkü hangi uyarının sizin işiniz için önemli olduğunu söylemez.

    - type: checklist
      heading: Hızlı SEO analizi kontrol listesi
      items:
        - title: Önemli sayfalar dizinde
          text: Search Console'da hizmet ve ürün sayfalarının dizinde olduğunu, gereksiz sayfaların olmadığını kontrol edin.
        - title: Site haritası temiz
          text: Gönderilmiş, hatasız ve yalnızca açılan, dizine girmesi istenen adresleri içeriyor.
        - title: Kırık bağlantı ve yönlendirme
          text: 404 veren sayfalar ve zincirleme yönlendirmeler temizlenmiş.
        - title: Hız ve mobil
          text: Core Web Vitals raporunda kötü görünen sayfa grubu yok, site telefonda rahat kullanılıyor.
        - title: Tekil başlık ve açıklama
          text: Her sayfanın kendi başlığı ve kendi açıklaması var.
        - title: Arama niyeti
          text: Hedef kelimede ilk sayfada çıkan sayfa türü, sizin sayfanızın türüyle aynı.
        - title: Yerel bilgiler tutarlı
          text: İşletme adı, adres ve telefon her yerde aynı yazılıyor.

    - type: section
      id: ornek
      heading: Analiz sonrası neye dönüşüyor?
      text: |-
        Dr. Ayşe Cinkaya Kahveci'nin dermatoloji kliniğinde analiz, estetik ve dermatolojik tedavi arayan hastaların farklı şeyler aradığını gösterdi. Bu yüzden iki grup için ayrı kategori yapısı kurduk ve her tedaviye kendi sayfasını verdik. Bilgi amaçlı aramaları ise "Sağlık Rehberi" içerik bölümüyle karşıladık. Bugün "Manavgat dermatolog" aramasında klinik ilk sayfada çıkıyor. Projenin tamamını [Dr. Ayşe Cinkaya Kahveci](/projelerimiz/dr-ayse-cinkaya-kahveci/) sayfasında anlattık.

    - type: faq
      heading: Sık Sorulan Sorular
      items:
        - question: SEO analizi ne sıklıkla yapılmalı?
          answer: Kapsamlı bir analiz genellikle yılda bir, site yenilendiğinde ya da trafikte açıklanamayan bir düşüş olduğunda yapılır. Search Console'daki dizin ve performans raporlarına ise ayda bir bakmak yeterli.
        - question: Ücretsiz araçlarla SEO analizi yapılabilir mi?
          answer: Temel kısmı yapılabilir. Search Console ve PageSpeed Insights ücretsiz ve analizin en değerli verisi onlarda. Rakip kelime ve backlink karşılaştırması için Semrush gibi ücretli araçlar işi çok kolaylaştırır.
        - question: SEO analizi ile web sitesi analizi aynı şey mi?
          answer: Değil. SEO analizi sitenin aramada nasıl göründüğüne odaklanır. Web sitesi analizi ise buna ek olarak ziyaretçinin sitede ne yaptığına, formlara ve dönüşüme de bakar.
        - question: Analizden sonra sonuç ne zaman görülür?
          answer: Dizin ve yönlendirme gibi teknik düzeltmelerin etkisi birkaç hafta içinde görülebilir. İçerik ve backlink tarafı aylar sürer. Ayrıntısını SEO ne kadar sürede sonuç verir yazısında anlattık.

    - type: section
      id: kisaca
      heading: Kısaca
      text: |-
        SEO analizi dizinden başlar, teknik konulara, sayfa içi SEO'ya, rakiplerle içerik farkına ve backlinklere doğru ilerler. Her adım bir öncekinin üstüne kurulur. Sonunda elinizde etkisine göre sıralanmış bir iş listesi olmalı.

        Analizi ve sonrasındaki uygulamayı nasıl yürüttüğümüzü [SEO ve içerik pazarlaması](/hizmetlerimiz/seo-ve-icerik-pazarlamasi/) sayfasında, dışarıdan bir göz isteyenler için çalışma modelimizi [SEO danışmanlığı](/hizmetlerimiz/seo-ve-icerik-pazarlamasi/seo-danismanligi/) sayfasında anlattık. Analizi kime yaptıracağınızı düşünüyorsanız [SEO uzmanı ne iş yapar](/blog/seo-uzmani-ne-is-yapar/) yazısı seçimde yardımcı olur.

    - type: cta
      heading: Sitenizin SEO durumuna birlikte bakalım.
      text: Ücretsiz bir ön analizle sitenizin aramada nerede takıldığını çıkaralım.
      primary:
        label: Ücretsiz Analiz Talep Et
        href: /ucretsiz-analiz
      secondary:
        label: SEO Hizmetimiz
        href: /hizmetlerimiz/seo-ve-icerik-pazarlamasi
---
