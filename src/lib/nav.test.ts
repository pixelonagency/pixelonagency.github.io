import { describe, expect, test } from 'bun:test';
import { buildServicesNav, isActiveRoute, menuServices, serviceHref } from './nav';
import { buildPrimaryNav } from './ui';

/*
 * Testler ÜRETİMİN OKUDUĞU kaynağı ölçer. Daha önce `nav.ts` içinde ayrı bir
 * `PRIMARY_NAV` sabiti vardı ve yalnızca bu dosya onu okuyordu; header ise
 * `buildPrimaryNav()` kullanıyordu. İkisi zamanla ayrıştı ve sabit, kırık
 * `/projelerimiz/#referanslar` bağlantısını taşımaya devam etti — testler yeşil
 * kalırken üretimde başka bir şey yayınlanıyordu. Sabit kaldırıldı (1 Eyl 2026).
 */
const PRIMARY_NAV = buildPrimaryNav('tr');

describe('serviceHref', () => {
  test('nests a service slug under /hizmetlerimiz', () => {
    expect(serviceHref('seo-ve-icerik-pazarlamasi')).toBe('/hizmetlerimiz/seo-ve-icerik-pazarlamasi/');
  });
});

describe('buildServicesNav', () => {
  const entries = [
    { id: 'ux-ui-tasarimi', data: { navLabel: 'UX/UI Tasarımı', order: 6 } },
    { id: 'web-tasarim-ve-yazilim', data: { navLabel: 'Web Tasarım ve Yazılım', order: 1 } },
    { id: 'sosyal-medya-yonetimi', data: { navLabel: 'Sosyal Medya Yönetimi', order: 2 } },
  ];

  test('orders services by their order field, not by id', () => {
    expect(buildServicesNav(entries).map((item) => item.label)).toEqual([
      'Web Tasarım ve Yazılım',
      'Sosyal Medya Yönetimi',
      'UX/UI Tasarımı',
    ]);
  });

  test('builds an href for each service', () => {
    expect(buildServicesNav(entries)[0]?.href).toBe('/hizmetlerimiz/web-tasarim-ve-yazilim/');
  });

  test('returns an empty list when there are no services yet', () => {
    expect(buildServicesNav([])).toEqual([]);
  });
});

describe('PRIMARY_NAV', () => {
  test('matches the reference header order', () => {
    expect(PRIMARY_NAV.map((item) => item.label)).toEqual([
      'Biz Kimiz?',
      'Hizmetlerimiz',
      'Projelerimiz',
      'Referanslarımız',
      'İletişim',
    ]);
  });

  test('üst menüde Kariyer yok — yalnız footer ve mobil menüde durur', () => {
    expect(PRIMARY_NAV.some((item) => item.label === 'Kariyer')).toBe(false);
  });

  test('flags Hizmetlerimiz as the dropdown parent', () => {
    expect(PRIMARY_NAV.find((item) => item.label === 'Hizmetlerimiz')?.hasDropdown).toBe(true);
  });

  test('points every entry at a real internal route', () => {
    for (const item of PRIMARY_NAV) {
      expect(item.href.startsWith('/')).toBe(true);
      // Kanonik biçim: yol kısmı eğik çizgiyle biter, aksi halde her tıklama 301 harcar.
      expect(item.href.split('#')[0]?.endsWith('/')).toBe(true);
    }
  });

  test('hiçbir menü girdisi çapaya bağlanmaz', () => {
    /*
     * Çapa, ana menüde SESSİZCE kırılan tek bağlantı türü: hedef bölüm yeniden
     * adlandırılınca ya da kaldırılınca bağlantı 404 vermez, sayfayı açar ve hiçbir
     * şey yapmaz — kimse fark etmez.
     *
     * "Referanslarımız" tam olarak böyle kırılmıştı: `/projelerimiz/#referanslar`
     * adresini gösteriyordu ama `#referanslar` çapası o sayfada YOKTU (1 Eyl 2026'da
     * ölçüldü; sayfadaki id'ler: iletisim, main, projeler ve menü düğmeleri). Üstelik
     * ayrı bir `/referanslarimiz/` sayfası vardı ve ana menüden hiç bağlantı almıyordu —
     * yalnızca footer'dan erişilebiliyordu.
     *
     * Bir bölüme değil SAYFAYA bağlanmak bu hatayı yapısal olarak imkânsız kılıyor.
     */
    const withAnchor = PRIMARY_NAV.filter((item) => item.href.includes('#')).map(
      (item) => `${item.label} → ${item.href}`,
    );
    expect(withAnchor).toEqual([]);
  });

  test('Referanslarımız kendi sayfasına gider', () => {
    expect(PRIMARY_NAV.find((item) => item.label === 'Referanslarımız')?.href).toBe('/referanslarimiz/');
  });
});

describe('isActiveRoute', () => {
  test('marks the exact route as active', () => {
    expect(isActiveRoute('/biz-kimiz', '/biz-kimiz')).toBe(true);
  });

  test('ignores a trailing slash difference', () => {
    expect(isActiveRoute('/biz-kimiz/', '/biz-kimiz')).toBe(true);
  });

  test('marks a service detail page as inside the Hizmetlerimiz section', () => {
    expect(isActiveRoute('/hizmetlerimiz/seo-ve-icerik-pazarlamasi', '/hizmetlerimiz')).toBe(true);
  });

  test('does not mark an unrelated route as active', () => {
    expect(isActiveRoute('/blog', '/biz-kimiz')).toBe(false);
  });

  test('treats the home route as active only for itself', () => {
    expect(isActiveRoute('/blog', '/')).toBe(false);
    expect(isActiveRoute('/', '/')).toBe(true);
  });
});

describe('menuServices', () => {
  const entries = [
    { id: 'ux-ui-tasarimi', data: { navLabel: 'UX/UI Tasarımı', order: 6, menu: false } },
    { id: 'e-ticaret-cozumleri', data: { navLabel: 'E-Ticaret Çözümleri', order: 8 } },
    { id: 'web-tasarim-ve-yazilim', data: { navLabel: 'Web Tasarım ve Yazılım', order: 1 } },
  ];

  test('menü dışı bırakılan hizmeti eler', () => {
    expect(menuServices(entries).map((e) => e.id)).toEqual(['web-tasarim-ve-yazilim', 'e-ticaret-cozumleri']);
  });

  test('alan verilmemişse hizmet menüde kalır — varsayılan görünürdür', () => {
    expect(menuServices([{ id: 'seo', data: { navLabel: 'SEO', order: 4 } }])).toHaveLength(1);
  });

  test('order alanına göre sıralar, kaynak diziyi bozmaz', () => {
    const source = [...entries];
    menuServices(source);
    expect(source.map((e) => e.id)).toEqual(entries.map((e) => e.id));
  });
});
