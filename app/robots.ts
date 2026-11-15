import type { MetadataRoute } from 'next';

import { urlDe } from './lib/sitio';

/**
 * Lo que se indexa y lo que no. Se rastrea todo el sitio de la agencia; lo
 * único bloqueado es `/reserva/`, que son páginas con token que llegan por
 * WhatsApp o por mail: no hay link público que las descubra y no queremos que
 * se abran.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/reserva/'] }],
    sitemap: urlDe('/sitemap.xml'),
  };
}
