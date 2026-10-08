/**
 * Rehber (sector guides) taxonomy.
 *
 * The guide is organised as sector › audience › article. Both lists are closed
 * vocabularies: the schema, the routes and the CMS select options all read them,
 * so an unknown sector or audience can never reach a URL.
 */

export const REHBER_SECTORS = ['saglik'] as const;
export type RehberSector = (typeof REHBER_SECTORS)[number];

export const REHBER_AUDIENCES = ['hekimler', 'klinikler', 'hastaneler', 'saglik-turizmi'] as const;
export type RehberAudience = (typeof REHBER_AUDIENCES)[number];

/** `taslak` never ships to production; `yayinda` does. */
export const REHBER_STATUSES = ['taslak', 'yayinda'] as const;
export type RehberStatus = (typeof REHBER_STATUSES)[number];
