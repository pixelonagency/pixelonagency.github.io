import { describe, expect, test } from 'bun:test';
import { buildRehberTree, isChecklistBuilt, isRehberEntryBuilt, rehberCrumbs, rehberPath } from './rehber';

describe('rehber adresleri', () => {
  test('merkez, sektör, kitle ve yazı aynı ağaçta durur', () => {
    expect(rehberPath('tr')).toBe('/rehber/');
    expect(rehberPath('tr', 'saglik')).toBe('/rehber/saglik/');
    expect(rehberPath('tr', 'saglik', 'hekimler')).toBe('/rehber/saglik/hekimler/');
    expect(rehberPath('tr', 'saglik', 'hekimler', 'dijital-gorunurluk-checklisti')).toBe(
      '/rehber/saglik/hekimler/dijital-gorunurluk-checklisti/',
    );
  });
});

describe('rehber breadcrumb', () => {
  test('merkez sayfası: ana sayfa › rehber', () => {
    expect(rehberCrumbs({ locale: 'tr' })).toEqual([{ label: 'Ana Sayfa', href: '/' }, { label: 'Rehber' }]);
  });

  test('sektör sayfası: son öğe sektördür ve hedefsizdir', () => {
    expect(rehberCrumbs({ locale: 'tr', sektor: 'saglik' })).toEqual([
      { label: 'Ana Sayfa', href: '/' },
      { label: 'Rehber', href: '/rehber/' },
      { label: 'Sağlık' },
    ]);
  });

  test('kitle sayfası', () => {
    expect(rehberCrumbs({ locale: 'tr', sektor: 'saglik', kitle: 'saglik-turizmi' })).toEqual([
      { label: 'Ana Sayfa', href: '/' },
      { label: 'Rehber', href: '/rehber/' },
      { label: 'Sağlık', href: '/rehber/saglik/' },
      { label: 'Sağlık Turizmi' },
    ]);
  });

  test('yazı sayfası: ara öğelerin hepsi gerçek bir sayfaya gider', () => {
    expect(
      rehberCrumbs({ locale: 'tr', sektor: 'saglik', kitle: 'hekimler', title: 'Hekimin Google profili' }),
    ).toEqual([
      { label: 'Ana Sayfa', href: '/' },
      { label: 'Rehber', href: '/rehber/' },
      { label: 'Sağlık', href: '/rehber/saglik/' },
      { label: 'Hekimler', href: '/rehber/saglik/hekimler/' },
      { label: 'Hekimin Google profili' },
    ]);
  });
});

describe('rehber yayın kuralı', () => {
  test('yayında içerik her ortamda üretilir', () => {
    expect(isRehberEntryBuilt('yayinda', false)).toBe(true);
    expect(isRehberEntryBuilt('yayinda', true)).toBe(true);
  });

  test('taslak yalnızca geliştirme sunucusunda üretilir, üretim build’ine girmez', () => {
    expect(isRehberEntryBuilt('taslak', true)).toBe(true);
    expect(isRehberEntryBuilt('taslak', false)).toBe(false);
  });
});

describe('checklist yayın kuralı', () => {
  const entry = { slug: 'dijital-gorunurluk-checklisti' };
  const ENDPOINT = 'https://assets.mailerlite.com/jsonp/1/forms/2/subscribe';

  test('taslak checklist üretimde hiçbir koşulda üretilmez', () => {
    expect(isChecklistBuilt({ ...entry, durum: 'taslak' }, ENDPOINT, false)).toBe(false);
    expect(isChecklistBuilt({ ...entry, durum: 'taslak' }, '', false)).toBe(false);
  });

  test('geliştirme sunucusunda form adresi olmasa da önizlenir', () => {
    expect(isChecklistBuilt({ ...entry, durum: 'taslak' }, '', true)).toBe(true);
    expect(isChecklistBuilt({ ...entry, durum: 'yayinda' }, '', true)).toBe(true);
  });

  test('yayında ve form adresi tanımlı checklist üretilir', () => {
    expect(isChecklistBuilt({ ...entry, durum: 'yayinda' }, ENDPOINT, false)).toBe(true);
  });

  test('yayında ama form adresi boş checklist build’i durdurur: çalışmayan form yayına çıkmaz', () => {
    expect(() => isChecklistBuilt({ ...entry, durum: 'yayinda' }, '', false)).toThrow(/dijital-gorunurluk-checklisti/);
  });
});

describe('rehber ağacı', () => {
  const article = (slug: string, kitle: string, date: string) => ({
    id: `tr/${slug}`,
    data: { slug, sektor: 'saglik' as const, kitle: kitle as 'hekimler', yayin_tarihi: new Date(date) },
  });
  const checklist = (slug: string, kitle: string) => ({
    id: `tr/${slug}`,
    data: { slug, sektor: 'saglik' as const, kitle: kitle as 'hekimler' },
  });

  test('üretimde yalnızca içeriği olan kitle ve sektör sayfası açılır', () => {
    const tree = buildRehberTree({ articles: [article('a', 'hekimler', '2026-10-01')], checklists: [], dev: false });
    expect(tree.map((sector) => sector.sektor)).toEqual(['saglik']);
    expect(tree[0]?.audiences.map((audience) => audience.kitle)).toEqual(['hekimler']);
  });

  test('üretimde hiç içerik yoksa rehber ağacı boştur: merkez sayfası da üretilmez', () => {
    expect(buildRehberTree({ articles: [], checklists: [], dev: false })).toEqual([]);
  });

  test('geliştirme sunucusunda boş kitleler de önizlenir', () => {
    const tree = buildRehberTree({ articles: [], checklists: [], dev: true });
    expect(tree[0]?.audiences.map((audience) => audience.kitle)).toEqual([
      'hekimler',
      'klinikler',
      'hastaneler',
      'saglik-turizmi',
    ]);
  });

  test('yalnız checklisti olan kitle de sayfa alır', () => {
    const tree = buildRehberTree({ articles: [], checklists: [checklist('c', 'klinikler')], dev: false });
    expect(tree[0]?.audiences.map((audience) => audience.kitle)).toEqual(['klinikler']);
    expect(tree[0]?.audiences[0]?.checklists.map((entry) => entry.data.slug)).toEqual(['c']);
  });

  test('kitle yazıları en yeni yayın tarihinden eskiye sıralanır', () => {
    const tree = buildRehberTree({
      articles: [
        article('eski', 'hekimler', '2026-09-01'),
        article('yeni', 'hekimler', '2026-10-05'),
        article('baska-kitle', 'hastaneler', '2026-10-06'),
      ],
      checklists: [],
      dev: false,
    });
    const hekimler = tree[0]?.audiences.find((audience) => audience.kitle === 'hekimler');
    expect(hekimler?.articles.map((entry) => entry.data.slug)).toEqual(['yeni', 'eski']);
  });
});
