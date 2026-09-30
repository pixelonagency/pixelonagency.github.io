---
title: 'SSL Sertifikası Nedir? Web Sitesi Güvenliğinin Temelleri'
category: Web Tasarım
translationKey: what-is-an-ssl-certificate
excerpt: 'Adres çubuğundaki kilit simgesi, siteyle ziyaretçi arasındaki bağlantının şifreli olduğunu gösteriyor. SSL sertifikasının ne olduğunu, olmadığında ne olduğunu ve bir sitenin güvenliği için SSL''in yanında nelerin gerektiğini sade bir dille anlattık.'
date: 2026-09-30
cover: '/src/assets/images/blog/ssl-sertifikasi-nedir-cover.webp'
coverAlt: Koyu bir ofiste dizüstü bilgisayar ekranında parlayan kilit simgesinin göründüğü, masada gerçek bir asma kilit ve anahtarın durduğu fotoğraf
author: Pixelon Ekibi
status: published
featured: false
seo:
  title: 'SSL Sertifikası Nedir, Ne İşe Yarar? | Pixelon'
  description: 'SSL sertifikası nedir, HTTPS ne demek, SSL olmayan sitede ne olur? Ücretsiz ve ücretli SSL farkı, yenileme ve web sitesi güvenliği için SSL dışında gerekenler.'
article:
  updated: 2026-09-30
  quickAnswer:
    heading: Kısa Cevap
    text: SSL sertifikası, bir web sitesiyle ziyaretçinin tarayıcısı arasındaki bağlantıyı şifreleyen dijital bir sertifikadır. Sertifikası olan siteler "https" ile açılır ve adres çubuğunda kilit simgesi görünür. Sertifikası olmayan sitelerde tarayıcılar "güvenli değil" uyarısı gösterir; bu hem ziyaretçiyi kaçırır hem de formlardan gönderilen bilgilerin korunmasız kalması demektir.
  tocHeading: İçindekiler
  related:
    - alan-adi-nedir
    - seo-uyumlu-web-sitesi
    - web-sitesi-analizi-nasil-yapilir
  blocks:
    - type: section
      id: nedir
      heading: SSL sertifikası nedir?
      lead: SSL sertifikası, siteyle ziyaretçi arasında gidip gelen bilgiyi şifreleyerek üçüncü kişilerin okumasını engelleyen dijital bir sertifikadır.
      text: |-
        Bir iletişim formuna adınızı ve telefon numaranızı yazdığınızda, bu bilgi sizin cihazınızdan sitenin sunucusuna kadar birçok ağdan geçiyor. Bağlantı şifreli değilse, yol üzerindeki biri bu bilgiyi okuyabiliyor.

        SSL sertifikası bu yolu şifreliyor. Bugün kullanılan teknolojinin asıl adı TLS, ama yerleşik alışkanlıkla hâlâ SSL deniyor. Sertifikası olan site "https" ile açılıyor; sondaki "s" güvenli anlamına geliyor.

    - type: table
      heading: HTTP ile HTTPS arasındaki fark
      columns:
        - Konu
        - HTTP (sertifikasız)
        - HTTPS (sertifikalı)
      rows:
        - - Bağlantı
          - Şifresiz
          - Şifreli
        - - Tarayıcıdaki görünüm
          - '"Güvenli değil" uyarısı'
          - Kilit simgesi
        - - Form bilgileri
          - Yolda okunabilir
          - Şifreli gider
        - - Arama motoru
          - Olumsuz sinyal
          - Beklenen standart

    - type: section
      id: olmazsa
      heading: SSL olmayan sitede ne olur?
      text: |-
        Tarayıcılar sertifikasız siteleri açıkça işaretliyor. Adres çubuğunda "güvenli değil" yazısını gören ziyaretçinin önemli bir kısmı, özellikle form doldurması gerekiyorsa, siteden çıkıyor.

        Arama motorları da HTTPS'i temel bir beklenti olarak görüyor. Sertifika tek başına sıralamayı yükseltmiyor, ama eksikliği hem güveni hem görünürlüğü zayıflatıyor.

        Kişisel veri toplayan formlarda şifreleme ayrıca bir yükümlülük meselesi. Ad, telefon ve e-posta gibi bilgilerin korunması için bağlantının şifreli olması gerekiyor.

    - type: section
      id: turleri
      heading: Ücretsiz SSL ile ücretli SSL arasındaki fark
      text: |-
        Şifreleme gücü açısından ücretsiz ve ücretli sertifikalar arasında fark yok; ikisi de bağlantıyı aynı şekilde şifreliyor. Fark, sertifikayı veren kurumun işletmeyi ne kadar doğruladığında.

        Kurumsal sitelerin ve blogların çoğu için ücretsiz sertifikalar yeterli. Barındırma firmalarının çoğu bunları otomatik kuruyor ve yeniliyor. Bankacılık ya da büyük e-ticaret gibi alanlarda, şirketin kimliğini ayrıca doğrulayan ücretli sertifikalar tercih edilebiliyor.

    - type: checklist
      heading: Güvenli bir site için SSL'in yanında gerekenler
      intro: SSL bağlantıyı korur; sitenin kendisini korumaz. Bir sitenin güvenliği için şu maddeler de gerekiyor.
      items:
        - title: Güncel yazılım
          text: Yönetim paneli, tema ve eklentilerin güncel tutulması. Saldırıların büyük kısmı, bilinen ama güncellenmemiş açıkları hedef alıyor.
        - title: Az ve gerekli eklenti
          text: Kullanılmayan her eklenti bir risk. Gereksiz olanları kaldırmak hem güvenliği hem hızı artırıyor.
        - title: Düzenli yedek
          text: Bir sorun çıktığında siteyi geri yükleyebilmek için yedeklerin düzenli alınması ve sitenin durduğu yerden ayrı bir yerde saklanması.
        - title: Güçlü şifre ve iki adımlı giriş
          text: Yönetim paneline giriş yapan herkes için ayrı hesap, güçlü şifre ve mümkünse iki adımlı doğrulama.
        - title: Tüm sayfaların HTTPS olması
          text: Sertifika kurulduktan sonra eski "http" adreslerin "https" adreslere yönlendirilmesi ve sayfadaki görsellerin de güvenli adresten yüklenmesi gerekiyor. Aksi halde tarayıcı sayfayı yine de güvensiz sayabiliyor.

    - type: callout
      variant: tip
      heading: Kendi sitenizi kontrol edin
      text: Sitenizin adresini başına "http://" yazarak açın. Tarayıcı sizi otomatik olarak "https://" adresine götürüyorsa ve adres çubuğunda kilit simgesi görünüyorsa temel ayar doğru. "Güvenli değil" uyarısı görüyorsanız sertifika eksik ya da süresi dolmuş olabilir.

    - type: section
      id: bakim
      heading: Güvenlik bir kerelik iş değil
      text: |-
        Sertifikaların süresi dolar, yazılımlar güncelleme ister, yeni açıklar ortaya çıkar. Bu yüzden güvenlik, sitenin yayına alındığı gün tamamlanan bir iş değil.

        Bakım paketlerimiz aylık 2.000 TL'den başlıyor; güvenlik ve altyapı güncellemeleri, yedekleme ve tanımlı bir değişiklik kotası bu pakete dahil, barındırma hariç. Kendi sitemizde de bağımlılıkları düzenli olarak güvenlik taramasından geçiriyor ve bulunan açıkları kapatıyoruz.

    - type: faq
      heading: Sık Sorulan Sorular
      items:
        - question: SSL sertifikası ücretli mi?
          answer: Ücretsiz sertifikalar yaygın ve kurumsal sitelerin çoğu için yeterli. Barındırma firmalarının çoğu bunları otomatik kuruyor. Kimlik doğrulaması gereken bazı alanlarda ücretli sertifikalar tercih ediliyor.
        - question: SSL sertifikasının süresi dolarsa ne olur?
          answer: Tarayıcılar siteyi açmadan önce uyarı sayfası gösteriyor ve ziyaretçilerin çoğu geri dönüyor. Otomatik yenileme açıksa bu risk ortadan kalkıyor.
        - question: SSL sitemi hacklenmekten korur mu?
          answer: Hayır. SSL, siteyle ziyaretçi arasındaki bağlantıyı korur. Sitenin kendisini korumak için güncel yazılım, yedek ve güçlü giriş bilgileri gerekiyor.

    - type: section
      id: kisaca
      heading: Kısaca
      text: |-
        SSL sertifikası, siteyle ziyaretçi arasındaki bağlantıyı şifreler ve adres çubuğunda kilit simgesini gösterir. Bugün her site için temel bir gereklilik; çoğu durumda ücretsiz.

        Ama güvenlik SSL'le bitmiyor: güncel yazılım, düzenli yedek ve güçlü giriş bilgileri de gerekiyor. Sitenin adresiyle ilgili diğer temel kavramları [alan adı nedir](/blog/alan-adi-nedir/) yazısında anlattık. Sitelerimizi nasıl kurduğumuzu ve yayından sonra nasıl bakımını yaptığımızı [web tasarım ve yazılım](/hizmetlerimiz/web-tasarim-ve-yazilim/) sayfasında bulabilirsiniz.

    - type: cta
      heading: Sitenizin güvenliğini birlikte kontrol edelim.
      text: Sertifikadan güncellemelere kadar sitenizin nerede risk taşıdığını çıkaralım.
      primary:
        label: Ücretsiz Analiz Talep Et
        href: /ucretsiz-analiz
      secondary:
        label: Web Tasarım Hizmetimiz
        href: /hizmetlerimiz/web-tasarim-ve-yazilim
---
