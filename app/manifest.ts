import type { MetadataRoute } from 'next';

import { ACENTO_HEX, TINTA } from './lib/identidad';
import { perfil } from './lib/perfil';

/**
 * El manifest, para el cliente que guarda el sitio de la agencia en la
 * pantalla de inicio del celular. Se arma con `perfil()` y no con el nombre
 * escrito a mano porque cada agencia tiene el suyo.
 *
 * No lo bloquea `robots.ts`, así que se sirve normalmente en
 * /manifest.webmanifest.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const p = await perfil();
  // Con el perfil de respaldo, no: el manifest se guarda al instalar el ícono
  // y quedaría el nombre genérico en la pantalla de inicio del cliente. Un
  // error es "volvé a pedirlo", que es lo que pasa cuando el backend despierta.
  if (p.respaldo) {
    throw new Error('El backend no contestó el perfil: no servimos el manifest de respaldo');
  }
  const nombre = p.nombre.trim();

  return {
    name: nombre,
    // `short_name` es el rótulo de abajo del ícono. Va el nombre entero si
    // entra; si no, se omite y el sistema recorta `name`, que conserva el
    // principio. Cortar a mano por palabras deja «La» de «La Casa del
    // Usado», o «Autos» de «Autos Pérez».
    ...(nombre.length <= 12 ? { short_name: nombre } : {}),
    description: p.eslogan ?? 'Autos usados y 0 km.',
    lang: 'es-AR',
    start_url: '/',
    display: 'standalone',
    background_color: TINTA,
    theme_color: ACENTO_HEX[p.color_acento],
    // Los dos los dibuja Next con `ImageResponse`; las rutas son las de las
    // convenciones de archivo (`app/icon.tsx` y `app/apple-icon.tsx`).
    icons: [
      { src: '/icon', sizes: '192x192', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
