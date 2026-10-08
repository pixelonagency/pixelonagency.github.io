import { describe, expect, test } from 'bun:test';
import { makeChecklistSchema, makeRehberSchema } from './rehber-schema';

const rehberSchema = makeRehberSchema();
const checklistSchema = makeChecklistSchema();

const article = {
  title: 'Hekimin Google profili',
  description: 'Google profilinizi bir hasta gibi kontrol etmenin yolu.',
  slug: 'hekimin-google-profili',
  sektor: 'saglik',
  kitle: 'hekimler',
  seri: 'Hekimin dijital görünürlüğü',
  okuma_suresi: 6,
  yayin_tarihi: '2026-10-08',
};

describe('rehber yazısı şeması', () => {
  test('zorunlu alanlarla geçerlidir', () => {
    const result = rehberSchema.safeParse(article);
    expect(result.success ? [] : result.error.issues).toEqual([]);
  });

  test('varsayılan durum taslaktır ve hukuk kontrolü yapılmamış sayılır', () => {
    const parsed = rehberSchema.parse(article);
    expect(parsed.durum).toBe('taslak');
    expect(parsed.hukuk_kontrolu).toBe(false);
  });

  test('yalnızca taslak ve yayında durumlarını kabul eder', () => {
    expect(rehberSchema.safeParse({ ...article, durum: 'yayinda' }).success).toBe(true);
    expect(rehberSchema.safeParse({ ...article, durum: 'published' }).success).toBe(false);
  });

  test('bilinen dört kitleyi kabul eder, başkasını reddeder', () => {
    for (const kitle of ['hekimler', 'klinikler', 'hastaneler', 'saglik-turizmi']) {
      expect({ kitle, ok: rehberSchema.safeParse({ ...article, kitle }).success }).toEqual({ kitle, ok: true });
    }
    expect(rehberSchema.safeParse({ ...article, kitle: 'eczaneler' }).success).toBe(false);
  });

  test('bilinmeyen sektörü reddeder', () => {
    expect(rehberSchema.safeParse({ ...article, sektor: 'egitim' }).success).toBe(false);
  });

  test('slug URL parçasıdır: küçük harf, rakam ve tire dışında karakter almaz', () => {
    expect(rehberSchema.safeParse({ ...article, slug: 'Hekimin Profili' }).success).toBe(false);
    expect(rehberSchema.safeParse({ ...article, slug: 'hekimin-profili/' }).success).toBe(false);
  });

  test('okuma süresi pozitif tam sayı dakikadır', () => {
    expect(rehberSchema.safeParse({ ...article, okuma_suresi: 0 }).success).toBe(false);
    expect(rehberSchema.safeParse({ ...article, okuma_suresi: 2.5 }).success).toBe(false);
  });

  test('checklist bağlantısı isteğe bağlıdır; CMS boş bıraktığında yok sayılır', () => {
    expect(rehberSchema.parse({ ...article, checklist: '' }).checklist).toBeUndefined();
    expect(rehberSchema.parse({ ...article, checklist: null }).checklist).toBeUndefined();
    expect(rehberSchema.parse({ ...article, checklist: 'dijital-gorunurluk-checklisti' }).checklist).toBe(
      'dijital-gorunurluk-checklisti',
    );
  });
});

const checklist = {
  title: 'Hekimler için Dijital Görünürlük Checklisti',
  description: 'Hastanızın sizi aradığında ne gördüğünü 20 dakikada kontrol edin.',
  slug: 'dijital-gorunurluk-checklisti',
  sektor: 'saglik',
  kitle: 'hekimler',
  sure_dakika: 20,
  intro: 'Hastanız sizi aramadan önce, adınızı arıyor.',
  bolumler: [{ baslik: 'Google profili', maddeler: ['Profiliniz ilk ekranda çıkıyor.'] }],
};

describe('checklist şeması', () => {
  test('zorunlu alanlarla geçerlidir ve varsayılan durum taslaktır', () => {
    const result = checklistSchema.safeParse(checklist);
    expect(result.success ? [] : result.error.issues).toEqual([]);
    expect(checklistSchema.parse(checklist).durum).toBe('taslak');
  });

  test('en az bir bölüm ister: önizlemede gösterilecek ilk bölüm olmadan sayfa kurulamaz', () => {
    expect(checklistSchema.safeParse({ ...checklist, bolumler: [] }).success).toBe(false);
  });

  test('maddesiz bölüm geçersizdir', () => {
    expect(checklistSchema.safeParse({ ...checklist, bolumler: [{ baslik: 'Boş', maddeler: [] }] }).success).toBe(
      false,
    );
  });

  test('puanlama ve sonraki adım isteğe bağlıdır; CMS boş bıraktığında yok sayılır', () => {
    const parsed = checklistSchema.parse({ ...checklist, puanlama: null, sonraki_adim: '' });
    expect(parsed.puanlama).toEqual([]);
    expect(parsed.sonraki_adim).toBeUndefined();
  });

  test('bölüm notu (hukuk uyarısı gibi) isteğe bağlıdır', () => {
    const parsed = checklistSchema.parse({
      ...checklist,
      bolumler: [{ baslik: 'Tanıtım kuralları', not: 'Avukat kontrolü bekliyor.', maddeler: ['Madde'] }],
    });
    expect(parsed.bolumler[0]?.not).toBe('Avukat kontrolü bekliyor.');
  });
});

describe('kapak görseli', () => {
  const cases = [
    { name: 'rehber yazısı', schema: rehberSchema, base: article },
    { name: 'checklist', schema: checklistSchema, base: checklist },
  ] as const;

  for (const { name, schema, base } of cases) {
    test(`${name}: kapak isteğe bağlıdır; CMS boş bıraktığında yok sayılır`, () => {
      expect(schema.parse(base).kapak).toBeUndefined();
      expect(schema.parse({ ...base, kapak: '', kapak_alt: '' }).kapak).toBeUndefined();
    });

    test(`${name}: kapak verildiyse alt metni de verilmeli`, () => {
      const kapak = '/src/assets/images/rehber/ornek.webp';
      expect(schema.safeParse({ ...base, kapak }).success).toBe(false);
      expect(schema.safeParse({ ...base, kapak, kapak_alt: '  ' }).success).toBe(false);
      expect(schema.safeParse({ ...base, kapak, kapak_alt: 'Muayenehanede hekim' }).success).toBe(true);
    });
  }
});

describe('makale blok verileri', () => {
  test('alıntı isteğe bağlıdır; verildiyse metin ve kaynak ister', () => {
    expect(rehberSchema.parse(article).alinti).toBeUndefined();
    expect(rehberSchema.parse({ ...article, alinti: null }).alinti).toBeUndefined();
    expect(rehberSchema.safeParse({ ...article, alinti: { metin: 'Söz' } }).success).toBe(false);
    expect(
      rehberSchema.parse({ ...article, alinti: { metin: 'Söz', kaynak: 'Uzman dermatolog, Antalya' } }).alinti,
    ).toEqual({ metin: 'Söz', kaynak: 'Uzman dermatolog, Antalya' });
  });

  test('istatistik kartları değer ve etiket ister, not isteğe bağlıdır', () => {
    expect(rehberSchema.parse(article).istatistikler).toEqual([]);
    const parsed = rehberSchema.parse({
      ...article,
      istatistikler: [
        { deger: '100+', etiket: 'video' },
        { deger: '%266', etiket: 'profil ziyareti', not: 'Meta reklam sonuçları' },
      ],
    });
    expect(parsed.istatistikler[1]?.not).toBe('Meta reklam sonuçları');
    expect(rehberSchema.safeParse({ ...article, istatistikler: [{ deger: '100+' }] }).success).toBe(false);
  });
});

describe('checklist PDF', () => {
  test('isteğe bağlıdır ve yalnızca /rehber/indir/ altındaki bir PDF olabilir', () => {
    expect(checklistSchema.parse(checklist).pdf).toBeUndefined();
    expect(checklistSchema.parse({ ...checklist, pdf: '' }).pdf).toBeUndefined();
    const pdf = '/rehber/indir/hekimler-dijital-gorunurluk-checklisti.pdf';
    expect(checklistSchema.parse({ ...checklist, pdf }).pdf).toBe(pdf);
    expect(checklistSchema.safeParse({ ...checklist, pdf: 'https://example.com/a.pdf' }).success).toBe(false);
    expect(checklistSchema.safeParse({ ...checklist, pdf: '/rehber/indir/a.docx' }).success).toBe(false);
  });
});
