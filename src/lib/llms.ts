/**
 * `llms.txt` gövdesini üretir (llmstxt.org biçimi).
 *
 * Üretken yanıt sistemleri ve AI arama motorları siteyi tararken hangi sayfaların
 * kaynak niteliğinde olduğunu bu dosyadan okur. Semrush Site Audit dosyanın
 * yokluğunu bildiriyordu.
 *
 * İçerik ELLE YAZILMAZ: bağlantılar site içeriğinden (rota tablosu ve koleksiyonlar)
 * türetilir — yeni bir hizmet ya da sayfa eklendiğinde dosya kendiliğinden güncellenir
 * ve sitede karşılığı olmayan bir adres asla listelenmez.
 */

export interface LlmsLink {
  label: string;
  /** Kök-göreli, kanonik yol (`/hizmetlerimiz/seo-ve-icerik-pazarlamasi/`). */
  path: string;
  description?: string | undefined;
}

interface LlmsSection {
  heading: string;
  links: LlmsLink[];
}

interface LlmsInput {
  site: string;
  title: string;
  summary: string;
  sections: LlmsSection[];
}

export function buildLlmsTxt({ site, title, summary, sections }: LlmsInput): string {
  const base = site.replace(/\/+$/, '');
  const absolute = (path: string): string => `${base}/${path.replace(/^\/+/, '')}`;

  const lines = [`# ${title}`, '', `> ${summary}`];

  for (const section of sections) {
    if (section.links.length === 0) continue;
    lines.push('', `## ${section.heading}`, '');
    for (const link of section.links) {
      const suffix = link.description ? `: ${link.description}` : '';
      lines.push(`- [${link.label}](${absolute(link.path)})${suffix}`);
    }
  }

  return `${lines.join('\n')}\n`;
}
