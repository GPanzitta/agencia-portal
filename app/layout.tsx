import type { Metadata } from 'next';
import { Big_Shoulders, IBM_Plex_Sans } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';

import { ProveedorDeContacto } from './components/contacto';
import IndicadorDeNavegacion from './components/indicador-de-navegacion';
import { perfil } from './lib/perfil';
import { SITIO } from './lib/sitio';

/**
 * Las dos letras del sitio (`(autos)/autos.css`): Big Shoulders condensada
 * para los títulos y Plex Sans para el texto. Next 16 exporta la primera como
 * `Big_Shoulders` (Google le sacó el "Display").
 */
const titular = Big_Shoulders({ subsets: ['latin'], weight: ['700', '900'], variable: '--font-titular', display: 'swap', preload: false, adjustFontFallback: false, fallback: ['Impact', 'Arial Narrow', 'sans-serif'] });
const texto = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-texto', display: 'swap' });

/**
 * El token de Search Console. Va SIN `NEXT_PUBLIC_` porque la metadata se
 * arma en el servidor y no hay motivo para inlinearlo en el bundle del
 * navegador. Si no está cargado no se emite el tag: un `content=""` no
 * verifica nada y deja basura en el head.
 */
const verificacionGoogle = process.env.GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  /**
   * Acá arriba y no repetido en cada grupo: es lo que resuelve a absoluto los
   * canónicos y las imágenes que cada página declara en relativo. El título y
   * la descripción de verdad los pone cada grupo (`(autos)/layout.tsx`,
   * `(producto)/layout.tsx`); éstos son el piso.
   */
  metadataBase: new URL(SITIO),
  title: 'Autos usados y 0 km',
  description: 'Autos usados y 0 km: mirá el stock con precio, kilómetros y fotos.',
  ...(verificacionGoogle ? { verification: { google: verificacionGoogle } } : {}),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const p = await perfil();
  return (
    <html lang="es-AR" className={`${titular.variable} ${texto.variable}`}>
      <body>
        {/* El contacto de la agencia para las pantallas de error (`error.tsx`),
            que son Client Components y no pueden pedir el perfil. */}
        <ProveedorDeContacto contacto={{ nombre: p.nombre, whatsapp: p.whatsapp, telefono: p.telefono }}>
          {/* La barra de «cargando la página siguiente». */}
          <Suspense fallback={null}>
            <IndicadorDeNavegacion />
          </Suspense>
          {children}
        </ProveedorDeContacto>
      </body>
    </html>
  );
}
