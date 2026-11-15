import type { MetadataRoute } from 'next';

import { catalogo } from './lib/autos';
import { urlDe } from './lib/sitio';

/**
 * El sitemap sale del stock publicado, no de una lista escrita a mano: cada
 * auto que la agencia publica entra solo, y el que se vende o se despublica
 * desaparece.
 *
 * Sin `lastModified`: poner "hoy" en cada request le enseña a Google que ese
 * dato no vale nada.
 *
 * Con el backend caído tira, a propósito: un sitemap de cinco URLs con HTTP 200
 * se ve sano y no lo es; el 500 hace que Google reintente y conserve la lista
 * que ya tenía. Y `force-dynamic` lo mantiene FUERA del prerender del build,
 * donde esa excepción voltearía `npm run build` si el backend no está levantado.
 */
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { unidades, caido } = await catalogo();
  if (caido) throw new Error('El backend no contestó el catálogo: no servimos un sitemap incompleto');

  return [
    { url: urlDe('/'), changeFrequency: 'daily', priority: 1 },
    { url: urlDe('/autos'), changeFrequency: 'daily', priority: 0.9 },
    { url: urlDe('/cotiza-tu-auto'), changeFrequency: 'monthly', priority: 0.6 },
    { url: urlDe('/contacto'), changeFrequency: 'monthly', priority: 0.5 },
    ...unidades.map((a) => ({ url: urlDe(`/autos/${a.id}`), changeFrequency: 'weekly' as const, priority: 0.8 })),
  ];
}
