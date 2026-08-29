import { describe, expect, test } from 'bun:test';
import { breadcrumbSchema, caseStudySchema, serviceSchema, SERVICE_BY_PROJECT_CATEGORY, type Crumb } from './schema';

/**
 * Google `BreadcrumbList` içinde SON eleman dışındaki her `ListItem` için `item`
 * alanını zorunlu tutar. Search Console bunu "item alanı eksik (itemListElement
 * içinde)" hatasıyla bildiriyordu: blog yazılarında kategori kırıntısının hedef
 * sayfası olmadığı için `item` yazılmıyor, ancak kırıntı son eleman olmadığı için
 * hata sayılıyordu.
 *
 * Kural bu yüzden kütüphane seviyesine taşındı — çağıran taraf ne gönderirse
 * göndersin geçersiz ara eleman üretilemez.
 */

const items = (crumbs: Crumb[]): Record<string, unknown>[] =>
  breadcrumbSchema(crumbs).itemListElement as Record<string, unknown>[];

describe('breadcrumbSchema', () => {
  test('hedefi olmayan ARA kırıntıyı atar', () => {
    const result = items([
      { label: 'Ana Sayfa', url: 'https://pixelon.com.tr/' },
      { label: 'Blog', url: 'https://pixelon.com.tr/blog/' },
      { label: 'Dijital Dönüşüm' },
      { label: 'CRM Nedir?' },
    ]);

    expect(result.map((item) => item.name)).toEqual(['Ana Sayfa', 'Blog', 'CRM Nedir?']);
  });

  test('atma sonrası position değerleri boşluksuz kalır', () => {
    const result = items([
      { label: 'Ana Sayfa', url: 'https://pixelon.com.tr/' },
      { label: 'Blog', url: 'https://pixelon.com.tr/blog/' },
      { label: 'Dijital Dönüşüm' },
      { label: 'CRM Nedir?' },
    ]);

    expect(result.map((item) => item.position)).toEqual([1, 2, 3]);
  });

  test('SON kırıntı hedefsiz kalabilir — Google buna izin verir', () => {
    const result = items([{ label: 'Ana Sayfa', url: 'https://pixelon.com.tr/' }, { label: 'CRM Nedir?' }]);

    expect(result).toHaveLength(2);
    expect(result[1]).not.toHaveProperty('item');
  });

  test('son eleman dışındaki her elemanda item bulunur', () => {
    const result = items([
      { label: 'Ana Sayfa', url: 'https://pixelon.com.tr/' },
      { label: 'Blog', url: 'https://pixelon.com.tr/blog/' },
      { label: 'CRM Nedir?' },
    ]);

    for (const item of result.slice(0, -1)) expect(item).toHaveProperty('item');
  });

  test('kategori sayfası geldiğinde ara kırıntı korunur', () => {
    const result = items([
      { label: 'Ana Sayfa', url: 'https://pixelon.com.tr/' },
      { label: 'Blog', url: 'https://pixelon.com.tr/blog/' },
      { label: 'Dijital Dönüşüm', url: 'https://pixelon.com.tr/blog/kategori/dijital-donusum/' },
      { label: 'CRM Nedir?' },
    ]);

    expect(result.map((item) => item.name)).toEqual(['Ana Sayfa', 'Blog', 'Dijital Dönüşüm', 'CRM Nedir?']);
    expect(result[2]).toHaveProperty('item', 'https://pixelon.com.tr/blog/kategori/dijital-donusum/');
  });

  test('tek kırıntı hedefsiz olsa da geçerli kalır', () => {
    expect(items([{ label: 'Ana Sayfa' }])).toEqual([{ '@type': 'ListItem', position: 1, name: 'Ana Sayfa' }]);
  });
});

/**
 * Entity grafiği: Organization ↔ Service ↔ Case.
 *
 * Vaka (proje detay) sayfalarında projeye özel HİÇBİR düğüm yoktu — 29 sayfa yalnızca
 * site geneli Organization/WebPage kalıbını taşıyordu. Arama motoru ve üretken yanıt
 * sistemleri "bu sayfa Pixelon'ın yaptığı bir iştir" bilgisini hiçbir yerden okuyamıyordu.
 *
 * Hizmet bağı proje `category` alanından kurulur — `detail.services` çipleri serbest
 * metindir ve hizmet adlarıyla eşleşmez, oradan bağ kurmak uydurma veri olurdu.
 */
describe('caseStudySchema', () => {
  const base = {
    url: 'https://pixelon.com.tr/projelerimiz/annelik-hikayesi/',
    title: 'Annelik Hikayesi',
    description: 'Anne ve kadın odaklı içerik platformu için marka dünyası.',
    client: 'Annelik Hikayesi',
    locale: 'tr' as const,
  };

  test('işi Pixelon’a atfeder ve siteye bağlar', () => {
    const [work] = caseStudySchema(base);
    expect(work).toMatchObject({
      '@type': 'CreativeWork',
      '@id': `${base.url}#project`,
      creator: { '@id': 'https://pixelon.com.tr/#organization' },
    });
  });

  test('müşteriyi `about` altında varlık olarak taşır', () => {
    const [work] = caseStudySchema(base);
    expect(work?.about).toEqual([{ '@type': 'Organization', name: 'Annelik Hikayesi' }]);
  });

  test('hizmet verildiğinde `about` hizmeti de içerir ve tanımlayıcı düğüm eklenir', () => {
    const nodes = caseStudySchema({
      ...base,
      service: {
        name: 'Marka ve Kurumsal Kimlik',
        url: 'https://pixelon.com.tr/hizmetlerimiz/marka-ve-kurumsal-kimlik/',
      },
    });

    const serviceNodeId = 'https://pixelon.com.tr/hizmetlerimiz/marka-ve-kurumsal-kimlik/#service';
    expect(nodes[0]?.about).toEqual([{ '@type': 'Organization', name: 'Annelik Hikayesi' }, { '@id': serviceNodeId }]);
    // Referans havada kalmasın diye hizmetin kendini tanıtan düğümü de eklenir.
    expect(nodes[1]).toMatchObject({ '@type': 'Service', '@id': serviceNodeId });
  });

  test('hizmet yoksa tek düğüm döner — uydurma bağ kurulmaz', () => {
    expect(caseStudySchema(base)).toHaveLength(1);
  });

  test('yıl ve etiketler yalnızca verildiğinde yazılır', () => {
    const [bare] = caseStudySchema(base);
    expect(bare).not.toHaveProperty('dateCreated');
    expect(bare).not.toHaveProperty('keywords');

    const [full] = caseStudySchema({ ...base, year: '2022–2024', tags: ['Logo Tasarımı'] });
    expect(full).toMatchObject({ dateCreated: '2022–2024', keywords: ['Logo Tasarımı'] });
  });
});

describe('SERVICE_BY_PROJECT_CATEGORY', () => {
  test('her proje kategorisi bir hizmet çeviri anahtarına düşer', () => {
    expect(SERVICE_BY_PROJECT_CATEGORY).toEqual({
      marka: 'branding',
      web: 'web-design',
      sosyal: 'social-media',
      saglik: 'health-tourism',
      uxui: 'ux-ui',
    });
  });
});

describe('serviceSchema', () => {
  test('hizmet düğümü başka düğümlerin referans verebileceği kalıcı bir kimlik taşır', () => {
    const node = serviceSchema({
      name: 'Marka ve Kurumsal Kimlik',
      description: 'Marka kimliği ve kurumsal uygulamalar.',
      url: 'https://pixelon.com.tr/hizmetlerimiz/marka-ve-kurumsal-kimlik/',
      locale: 'tr',
    });

    expect(node['@id']).toBe('https://pixelon.com.tr/hizmetlerimiz/marka-ve-kurumsal-kimlik/#service');
    expect(node.provider).toEqual({ '@id': 'https://pixelon.com.tr/#organization' });
  });
});
