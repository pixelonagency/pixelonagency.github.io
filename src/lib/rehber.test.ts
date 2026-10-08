import { describe, expect, test } from 'bun:test';
import {
  buildRehberTree,
  pdfMockupHeading,
  pixelMotif,
  isChecklistBuilt,
  isRehberEntryBuilt,
  rehberCrumbs,
  rehberIndexView,
  rehberPath,
} from './rehber';

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

describe('rehber listeleme görünümü', () => {
  const article = (slug: string, durum: 'taslak' | 'yayinda') => ({
    id: `tr/${slug}`,
    data: {
      slug,
      sektor: 'saglik' as const,
      kitle: 'hekimler' as const,
      yayin_tarihi: new Date('2026-10-01'),
      title: `Yazı ${slug}`,
      description: 'Özet',
      seri: 'Seri',
      okuma_suresi: 5,
      durum,
    },
  });
  const checklist = {
    id: 'tr/dijital-gorunurluk-checklisti',
    data: {
      slug: 'dijital-gorunurluk-checklisti',
      sektor: 'saglik' as const,
      kitle: 'hekimler' as const,
      title: 'Checklist',
      description: 'Özet',
      sure_dakika: 20,
      durum: 'taslak' as const,
    },
  };

  test('merkez sayfası sektörleri listeler', () => {
    const tree = buildRehberTree({ articles: [article('a', 'yayinda')], checklists: [], dev: false });
    const view = rehberIndexView('tr', { tree });
    expect(view.title).toBe('Sektör Rehberleri');
    expect(view.cards.map((card) => card.href)).toEqual(['/rehber/saglik/']);
    expect(view.crumbs.at(-1)).toEqual({ label: 'Rehber' });
  });

  test('sektör sayfası kitleleri listeler', () => {
    const tree = buildRehberTree({ articles: [article('a', 'yayinda')], checklists: [], dev: false });
    const view = rehberIndexView('tr', { tree, sector: tree[0] });
    expect(view.cards.map((card) => card.title)).toEqual(['Hekimler']);
    expect(view.cards[0]?.href).toBe('/rehber/saglik/hekimler/');
  });

  test('kitle sayfası yazılarını ve checklistini listeler, taslakları işaretler', () => {
    const tree = buildRehberTree({
      articles: [article('yayinda-yazi', 'yayinda'), article('taslak-yazi', 'taslak')],
      checklists: [checklist],
      dev: true,
    });
    const sector = tree[0];
    const audience = sector?.audiences.find((node) => node.kitle === 'hekimler');
    const view = rehberIndexView('tr', { tree, sector, audience });

    expect(view.title).toBe('Hekimler için Rehber');
    expect(view.cards.map((card) => [card.href, card.draft])).toEqual([
      ['/rehber/saglik/hekimler/yayinda-yazi/', false],
      ['/rehber/saglik/hekimler/taslak-yazi/', true],
    ]);
    expect(view.checklists?.map((card) => [card.href, card.draft])).toEqual([
      ['/rehber/saglik/hekimler/dijital-gorunurluk-checklisti/', true],
    ]);
  });
});

describe('rehber kart kapakları', () => {
  const entry = (slug: string, kapak?: string) => ({
    id: `tr/${slug}`,
    data: {
      slug,
      sektor: 'saglik' as const,
      kitle: 'hekimler' as const,
      yayin_tarihi: new Date(slug === 'yeni' ? '2026-10-05' : '2026-09-01'),
      title: slug,
      description: 'Özet',
      seri: 'Hekimler için dijital görünürlük',
      okuma_suresi: 5,
      durum: 'yayinda' as const,
      ...(kapak ? { kapak, kapak_alt: `${slug} kapağı` } : {}),
    },
  });

  test('yazı kartı kendi kapağını taşır; kapak yoksa seri etiketiyle yedek kapak çizilir', () => {
    const tree = buildRehberTree({
      articles: [entry('yeni', 'kapak.webp'), entry('eski')],
      checklists: [],
      dev: false,
    });
    const audience = tree[0]?.audiences[0];
    const view = rehberIndexView('tr', { tree, sector: tree[0], audience });
    expect(view.cards.map((card) => card.cover)).toEqual([
      { image: 'kapak.webp', alt: 'yeni kapağı', label: 'Hekimler için dijital görünürlük', seed: 'yeni' },
      { image: undefined, alt: undefined, label: 'Hekimler için dijital görünürlük', seed: 'eski' },
    ]);
  });

  test('kitle kartı en yeni yazının kapağını, yoksa kitle adıyla yedek kapağı kullanır', () => {
    const tree = buildRehberTree({ articles: [entry('eski'), entry('yeni', 'kapak.webp')], checklists: [], dev: true });
    const view = rehberIndexView('tr', { tree, sector: tree[0] });
    expect(view.cards[0]?.cover).toEqual({
      image: 'kapak.webp',
      alt: 'yeni kapağı',
      label: 'Hekimler',
      seed: 'hekimler',
    });
    expect(view.cards[1]?.cover).toEqual({ image: undefined, alt: undefined, label: 'Klinikler', seed: 'klinikler' });
  });
});

describe('piksel motifi', () => {
  test('aynı tohum her build’de aynı deseni verir', () => {
    expect(pixelMotif('kamera-karsisinda-hekim')).toEqual(pixelMotif('kamera-karsisinda-hekim'));
  });

  test('farklı yazılar farklı desen alır', () => {
    expect(pixelMotif('hekimin-google-profili')).not.toEqual(pixelMotif('kamera-karsisinda-hekim'));
  });

  test('tek bir lime vurgu kümesi vardır, gerisi nötr', () => {
    const cells = pixelMotif('hekimin-google-profili');
    const lime = cells.filter((cell) => cell.accent);
    expect(lime.length).toBeGreaterThan(0);
    expect(lime.length).toBeLessThan(cells.length / 3);
  });
});

describe('PDF önizleme başlığı', () => {
  test('kitle ön eki çipe taşınır, son kelime vurgulanır', () => {
    expect(pdfMockupHeading('Hekimler için Dijital Görünürlük Checklisti', 'hekimler')).toEqual({
      chip: 'Hekimler için',
      lead: 'Dijital Görünürlük',
      mark: 'Checklisti',
    });
  });

  test('ön ek yoksa başlık olduğu gibi kalır', () => {
    expect(pdfMockupHeading('Klinik Yorum Checklisti', 'klinikler')).toEqual({
      chip: 'Klinikler için',
      lead: 'Klinik Yorum',
      mark: 'Checklisti',
    });
  });
});
