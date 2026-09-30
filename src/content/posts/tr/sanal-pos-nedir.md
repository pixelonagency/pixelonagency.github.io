---
title: 'Sanal POS Nedir? Banka POS''u ile Ödeme Kuruluşu Arasındaki Fark'
category: E-Ticaret
translationKey: what-is-a-virtual-pos
excerpt: 'Sanal POS, internet sitenizden kartla ödeme almanızı sağlayan sistem. Bankayla mı yoksa bir ödeme kuruluşuyla mı çalışacağınızı; komisyon, hesaba geçiş süresi, taksit ve 3D Secure gibi kavramlarla birlikte sade bir dille anlattık.'
date: 2026-10-01
cover: '/src/assets/images/blog/sanal-pos-nedir-cover.webp'
coverAlt: Dizüstü bilgisayardaki güvenli ödeme sayfasının önünde kredi kartı tutan bir elin yakın plan fotoğrafı
author: Pixelon Ekibi
status: published
featured: false
seo:
  title: 'Sanal POS Nasıl Seçilir? Ödeme Sistemleri Rehberi | Pixelon'
  description: 'Sanal POS nedir, nasıl çalışır? Banka sanal POS''u ile ödeme kuruluşları arasındaki fark, 3D Secure, komisyon, hesaba geçiş süresi, taksit ve e-ticaret altyapısıyla entegrasyon.'
article:
  updated: 2026-10-01
  quickAnswer:
    heading: Kısa Cevap
    text: 'Sanal POS, bir internet sitesinin kredi ve banka kartıyla ödeme alabilmesini sağlayan dijital ödeme terminalidir. İki yolla alınır: doğrudan bir bankayla anlaşarak ya da iyzico, PayTR, Param gibi ödeme kuruluşları üzerinden. Banka POS''u genellikle daha fazla evrak ve daha uzun başvuru ister; ödeme kuruluşu daha hızlı açılır ve birçok bankanın kartını tek entegrasyonla kabul eder. Seçimi komisyon oranı, paranın hesaba geçiş süresi, taksit seçenekleri ve kullandığınız e-ticaret altyapısıyla uyum belirler.'
  tocHeading: İçindekiler
  related:
    - e-ticaret-sitesi-kurma
    - e-ticaret-altyapisi-nasil-secilir
    - etbis-nedir
  blocks:
    - type: section
      id: sanal-pos-ne-ise-yarar
      heading: Sanal POS ne işe yarar?
      lead: 'Mağazadaki kart makinesinin internetteki karşılığıdır: müşteri kart bilgisini girer, ödeme bankadan onay alır ve para sizin hesabınıza geçer.'
      text: |-
        Fiziksel mağazada müşteri kartını cihaza yaklaştırır, ödeme onaylanır. İnternette cihaz yok, ama aynı işi yapan bir altyapı gerekiyor. Sanal POS tam olarak bu.

        Müşteri ödeme sayfasında kart numarasını, son kullanma tarihini ve güvenlik kodunu yazar. Bu bilgi sizin sitenizde saklanmaz; doğrudan bankaya ya da ödeme kuruluşuna gider. Kartı çıkaran banka bakiyeyi ve güvenliği kontrol eder, onay verir. Tutar belirli bir süre sonra hesabınıza aktarılır.

        Kulağa tek bir adım gibi geliyor ama arkada birkaç taraf çalışıyor: sizin siteniz, ödeme sağlayıcınız, kart ağı ve müşterinin bankası. Sanal POS seçerken aslında bu zincirin sizin tarafınızdaki halkasını seçiyorsunuz.

    - type: process
      heading: Bir kart ödemesi nasıl ilerler?
      intro: Müşterinin "Siparişi Tamamla" tuşuna bastığı andan paranın hesabınıza geçmesine kadar olan akış.
      steps:
        - title: Kart bilgisi girilir
          text: 'Müşteri ödeme sayfasında kart bilgisini yazar. Bilgi şifreli bağlantıyla doğrudan ödeme sağlayıcısına gider, sitenizin veritabanına yazılmaz.'
        - title: 3D Secure doğrulaması
          text: 'Kartı çıkaran banka, müşterinin telefonuna tek kullanımlık kod gönderir ya da mobil uygulamadan onay ister. Kartın gerçekten sahibinin elinde olduğu burada doğrulanır.'
        - title: Provizyon ve onay
          text: 'Banka bakiye ve limiti kontrol eder, tutarı bloke eder. Siteniz "ödeme başarılı" cevabını alır ve sipariş oluşur.'
        - title: Hesaba aktarım
          text: 'Tutar, anlaşmanızdaki süre dolduğunda komisyon düşülerek hesabınıza geçer. Bu süreye bankacılıkta valör ya da blokeli gün denir.'

    - type: section
      id: banka-mi-odeme-kurulusu-mu
      heading: Banka sanal POS'u mu, ödeme kuruluşu mu?
      lead: İkisi de aynı işi yapar; fark başvuru sürecinde, kart kapsamında ve hesaba geçiş koşullarında çıkar.
      text: |-
        Türkiye'de sanal POS'a iki yoldan ulaşılıyor.

        Birincisi doğrudan bankayla anlaşmak. Ticari hesabınızın olduğu bankaya başvurursunuz, banka şirketinizi ve sitenizi inceler, onay verirse size özel bir POS tanımlar. Bu yol genellikle daha fazla evrak ister ve açılması zaman alır. Karşılığında hacminiz büyüdükçe komisyonu pazarlık edebileceğiniz bir muhatabınız olur.

        İkincisi bir ödeme kuruluşu kullanmak. iyzico, PayTR, Param gibi şirketler Türkiye Cumhuriyet Merkez Bankası lisansıyla çalışan ödeme kuruluşlarıdır. Sizinle bankalar arasında aracı olurlar: tek başvuru ve tek entegrasyonla farklı bankaların kartlarını kabul edersiniz. Yeni kurulan bir mağaza için başlangıç çoğu zaman bu yoldan daha hızlı oluyor.

        Hangisinin daha ucuz olduğu sorusunun tek bir cevabı yok. Oranlar işletmenin hacmine, sektörüne, hesaba geçiş süresine ve dönemin koşullarına göre değişiyor. Doğru yöntem, aynı hacim varsayımıyla iki üç teklif alıp yan yana koymak.

    - type: table
      heading: İki yolun karşılaştırması
      intro: Genel eğilimler; kesin koşulları her sağlayıcının güncel sözleşmesi belirler.
      columns:
        - Kalem
        - Banka sanal POS'u
        - Ödeme kuruluşu
      rows:
        - - Başvuru
          - Daha fazla evrak, daha uzun inceleme
          - Genellikle daha hızlı ve çevrim içi
        - - Kart kapsamı
          - Kendi kartlarında en geniş taksit
          - Birçok bankanın kartı tek entegrasyonda
        - - Komisyon
          - Hacim büyüdükçe pazarlığa açık
          - Standart tarifeler, hacimle iyileşebilir
        - - Taksit
          - Bankanın kendi kart programına bağlı
          - Birden fazla kart programını birlikte sunabilir
        - - Kimler için uygun
          - Hacmi oturmuş, tek bankayla çalışan işletme
          - Yeni mağaza ya da hızlı başlamak isteyen marka

    - type: section
      id: temel-kavramlar
      heading: Teklif okurken karşınıza çıkacak kavramlar
      lead: Sanal POS teklifleri birkaç terim etrafında döner; bunları bilmeden iki teklifi karşılaştırmak mümkün değil.
      text: |-
        Sözleşmede ya da teklif tablosunda aşağıdaki başlıkları arayın. Birinin eksik olması, sonradan sürpriz bir kesinti demek olabilir.

    - type: cards
      items:
        - title: Komisyon oranı
          text: 'Her başarılı işlemden kesilen yüzde. Tek çekim ile taksitli satışta oranlar farklıdır; taksit sayısı arttıkça oran da genellikle yükselir. Bazı sağlayıcılar yüzdenin yanına işlem başına sabit bir ücret de ekler.'
        - title: Hesaba geçiş süresi
          text: 'Paranın hesabınıza kaç gün sonra aktarıldığı. Süre kısaldıkça komisyon çoğu zaman artar. Nakit akışı sıkı bir işletme için bu kalem, oranın kendisinden daha önemli olabilir.'
        - title: 3D Secure
          text: 'Kart sahibinin bankası üzerinden yapılan ek doğrulama. Sahte kart kullanımını azaltır ve itiraz durumunda satıcıyı daha güçlü bir konuma koyar. E-ticarette artık standart kabul ediliyor.'
        - title: İade ve iptal
          text: 'Aynı gün iptal ile sonraki günlerde yapılan iade farklı işler. İadenin panelden kolayca yapılıp yapılamadığı ve iadede komisyonun geri dönüp dönmediği sözleşmede yazmalı.'
        - title: Harcama itirazı
          text: 'Müşterinin bankasına "bu işlemi ben yapmadım" ya da "ürün gelmedi" diye itiraz etmesi. Sağlayıcının bu süreçte sizden hangi belgeleri istediğini baştan öğrenin.'
        - title: Ek ücretler
          text: 'Kurulum, yıllık kullanım, asgari ciro şartı ya da erken fesih bedeli. Oranı düşük görünen bir teklif bu kalemlerle pahalıya dönebilir.'

    - type: callout
      variant: note
      heading: Pixelon Notu
      text: 'Müşterilerimizin en sık yaptığı hata, sanal POS''u sadece komisyon oranına bakarak seçmek. Asıl fark çoğu zaman ödeme sayfasında çıkıyor: 3D Secure ekranı sitenizin içinde mi açılıyor, yoksa müşteriyi tanımadığı bir sayfaya mı götürüyor; taksit tablosu ürün sayfasında görünüyor mu; hata mesajı müşteriye ne yapması gerektiğini söylüyor mu. Oranda yapılan küçük tasarruf, ödeme adımında vazgeçen birkaç müşteriyle kolayca siliniyor.'

    - type: section
      id: taksit
      heading: Taksit neden bu kadar belirleyici?
      text: |-
        Türkiye'de kartla alışverişte taksit, özellikle orta ve yüksek tutarlı ürünlerde satın alma kararının parçası. Müşteri ürün sayfasında "kaç taksit yapılıyor" sorusunun cevabını arıyor.

        Taksit seçenekleri kart programlarına bağlı çalışıyor. Bir bankanın POS'u o bankanın kartlarında en geniş taksiti sunarken diğer bankaların kartlarında sınırlı kalabiliyor. Ödeme kuruluşları ise birden fazla kart programını tek ekranda toplayabiliyor.

        İki şeyi unutmayın. Birincisi, taksit sayısı arttıkça komisyon da artıyor; bu farkı müşteriye mi yansıtacağınız, kendiniz mi karşılayacağınız fiyatlama kararıdır. İkincisi, bazı ürün gruplarında yasal taksit sınırları var. Satacağınız kategori için güncel kuralı sağlayıcınıza sorun.

    - type: section
      id: odeme-sistemleri
      heading: Sanal POS tek ödeme sistemi değil
      lead: Kartın yanında havale, kapıda ödeme ve dijital cüzdan gibi seçenekler de satın alma oranını etkiler.
      text: |-
        "Ödeme sistemleri" denince akla ilk kart geliyor ama müşterilerin bir kısmı kart bilgisini girmek istemiyor.

        Havale ve EFT hâlâ kullanılıyor, özellikle yüksek tutarlı siparişlerde. Kapıda ödeme bazı kategorilerde ilk alışverişin güven eşiğini düşürüyor, ama iade edilen kargo maliyeti de beraberinde geliyor. Ödeme kuruluşlarının sunduğu kayıtlı kart ve cüzdan çözümleri ise tekrar eden alışverişte ödeme adımını birkaç saniyeye indiriyor.

        Hepsini birden açmak şart değil. Hedef kitlenizin nasıl ödemeyi tercih ettiğine bakın, iki üç seçenekle başlayın, siparişlerin hangi yöntemle geldiğini ölçün.

    - type: section
      id: entegrasyon
      heading: E-ticaret altyapısıyla entegrasyon
      lead: Sanal POS'u seçmeden önce kullandığınız ya da kuracağınız altyapının o sağlayıcıyla hazır çalışıp çalışmadığına bakın.
      text: |-
        Shopify, ikas, WooCommerce, T-Soft, IdeaSoft, Ticimax gibi altyapıların çoğu, Türkiye'deki yaygın ödeme kuruluşları ve bankalarla hazır eklenti ya da modül sunuyor. Hazır entegrasyon varsa kurulum günler değil saatler sürüyor, test de daha kolay oluyor.

        Hazır entegrasyon yoksa ödeme sağlayıcısının teknik dokümanına göre bağlantı yazılıyor. Bu yol özel yazılımda doğal; hazır platformda ise çoğu zaman ek maliyet ve bakım yükü demek. Platform ile POS kararını bu yüzden birlikte vermek gerekiyor. Altyapı seçimini [e-ticaret altyapısı nasıl seçilir](/blog/e-ticaret-altyapisi-nasil-secilir/) yazısında ayrıca ele aldık.

        Pixelon olarak mağazaları Shopify, ikas, WooCommerce, T-Soft, IdeaSoft, Ticimax ya da özel yazılım üzerinde kuruyoruz ve seçimi her işletmenin ürün yapısına ve ödeme ihtiyacına göre yapıyoruz. Hazır altyapılarda kurulum 50.000 ile 150.000 TL arasında değişiyor, KDV hariç; özel yazılım ayrıca fiyatlanıyor. Kalemlerin ayrıntısı [e-ticaret sitesi fiyatları](/hizmetlerimiz/e-ticaret-cozumleri/e-ticaret-sitesi-fiyatlari/) sayfasında.

        Yurt dışına satış planınız varsa POS kararı bir adım daha karmaşıklaşıyor: yabancı kartlar ve farklı para birimleri devreye giriyor. Bu tarafı [e-ihracat nedir](/blog/e-ihracat-nedir/) yazısında anlattık.

    - type: checklist
      heading: Sanal POS seçerken kontrol listesi
      intro: Görüştüğünüz her sağlayıcıya aynı soruları sorun; cevaplar teklifleri karşılaştırılabilir hale getirir.
      items:
        - title: Tek çekim ve taksit komisyonları ayrı ayrı yazıldı mı?
          text: 'Tek bir oran verilen teklif eksiktir. Her taksit seçeneğinin oranını görün.'
        - title: Para kaç gün sonra hesaba geçiyor?
          text: 'Farklı süre seçenekleri varsa her birinin oranını isteyin.'
        - title: Kurulum, yıllık ücret veya asgari ciro var mı?
          text: 'Sabit giderler küçük mağazada komisyondan daha ağır basabilir.'
        - title: Altyapınızla hazır entegrasyon var mı?
          text: 'Yoksa bağlantının kim tarafından, hangi maliyetle yazılacağını netleştirin.'
        - title: 3D Secure ekranı nasıl açılıyor?
          text: 'Ödeme adımını mobilde kendiniz deneyin; müşterinin gördüğü ekranı görün.'
        - title: İade panelden yapılabiliyor mu?
          text: 'İade için müşteri hizmetlerini aramak zorunda kalmak operasyonu yavaşlatır.'
        - title: Sözleşmeden çıkış koşulu ne?
          text: 'Erken fesih bedeli ve bildirim süresini imzadan önce okuyun.'

    - type: section
      id: guvenlik
      heading: Güvenlik tarafında sizin sorumluluğunuz
      text: |-
        Kart bilgisini sanal POS sağlayıcısı taşıyor ve saklıyor, ama bu sitenizin güvenliğini ilgilendirmiyor demek değil.

        Sitenin tamamı SSL ile şifreli çalışmalı; ödeme sayfasından önceki adımlarda da. Bunun neden gerekli olduğunu [SSL sertifikası nedir](/blog/ssl-sertifikasi-nedir/) yazısında açtık. Yönetim paneline erişen herkesin ayrı kullanıcısı olmalı, eklentiler güncel tutulmalı. Ödeme adımına dışarıdan kod eklenen her araç (takip kodu, sohbet penceresi, reklam etiketi) ayrıca sorgulanmalı.

        Son olarak, e-ticaret yapan işletmelerin ETBİS kaydı gibi yasal yükümlülükleri de var. Sağlayıcılar başvuru sırasında bunları sorabiliyor; ayrıntısı [ETBİS nedir](/blog/etbis-nedir/) yazısında.

    - type: faq
      heading: Sık Sorulan Sorular
      items:
        - question: Şahıs şirketi sanal POS alabilir mi?
          answer: 'Genellikle evet. Hem bankalar hem ödeme kuruluşları şahıs şirketlerine sanal POS veriyor; istenen belgeler ve onay süreci sağlayıcıya göre değişiyor. Vergi levhası ve çalışan bir internet sitesi çoğu başvuruda temel şart.'
        - question: Sanal POS ücretli mi?
          answer: 'Çoğu sağlayıcı işlem başına komisyonla çalışıyor. Bazılarında kurulum, yıllık kullanım veya asgari ciro gibi ek kalemler de olabiliyor. Bu yüzden teklifleri yalnızca orana göre değil, yıllık toplam maliyete göre karşılaştırmak gerekiyor.'
        - question: Birden fazla sanal POS kullanılabilir mi?
          answer: 'Evet. Bazı mağazalar taksit avantajı için birden fazla bankayla çalışıyor ya da bir sağlayıcıda sorun çıktığında devreye girecek ikinci bir POS tutuyor. Altyapınızın bunu destekleyip desteklemediğine bakmak gerekiyor.'
        - question: Sanal POS ne kadar sürede açılır?
          answer: 'Ödeme kuruluşlarında belgeler tamsa süreç genellikle daha kısa; bankalarda inceleme daha uzun sürebiliyor. Süreyi en çok uzatan şey, sitenin başvuru sırasında hazır olmaması: iade koşulları, mesafeli satış sözleşmesi ve iletişim bilgileri sayfada görünmeli.'

    - type: section
      id: kisaca
      heading: Kısaca
      text: |-
        Sanal POS, sitenizin kartla ödeme almasını sağlayan altyapı. Banka üzerinden de ödeme kuruluşu üzerinden de alınabiliyor; ikisi aynı işi farklı koşullarla yapıyor.

        Seçerken komisyon oranına, paranın hesaba geçiş süresine, taksit seçeneklerine, ek ücretlere ve altyapınızla uyuma birlikte bakın. Ödeme ekranını mobilde kendiniz deneyin; müşterinin vazgeçtiği yer çoğu zaman orası.

        Mağazanın geri kalanıyla birlikte nasıl kurguladığımızı [e-ticaret çözümleri](/hizmetlerimiz/e-ticaret-cozumleri/) sayfasında, kuruluşun genel akışını [e-ticaret sitesi kurma](/blog/e-ticaret-sitesi-kurma/) yazısında anlattık.

    - type: cta
      heading: Ödeme adımınızı birlikte kuralım.
      text: Ürün yapınıza, sepet tutarınıza ve hedef kitlenize uygun ödeme seçeneklerini birlikte belirleyelim; altyapı ile sanal POS kararını aynı masada verelim.
      primary:
        label: Ücretsiz Analiz Talep Et
        href: /ucretsiz-analiz
      secondary:
        label: E-Ticaret Hizmetimiz
        href: /hizmetlerimiz/e-ticaret-cozumleri
---
