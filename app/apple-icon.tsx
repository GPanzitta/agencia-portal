import { ImageResponse } from 'next/og';

import { ACENTO_HEX, TINTA, inicial, perfilNoDisponible } from './lib/identidad';
import { perfil } from './lib/perfil';

/**
 * El ícono de iOS, el que queda cuando el cliente guarda el sitio en la
 * pantalla de inicio. Sin este
 * archivo el iPhone pega una captura de la página, que a ese tamaño no se
 * entiende.
 *
 * Es el mismo dibujo que `icon.tsx` a otra medida y no un import suyo: son
 * dos rutas de metadata distintas y no conviene que una dependa de la otra.
 */

/** 180x180 es la medida que pide iOS, y sin transparencia: la recorta él. */
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default async function AppleIcon() {
  const p = await perfil();
  // El ícono de la pantalla de inicio se guarda al instalar: nunca el de respaldo.
  if (p.respaldo) return perfilNoDisponible();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: ACENTO_HEX[p.color_acento],
          color: TINTA,
          fontSize: 124,
          letterSpacing: '-0.04em',
        }}
      >
        {inicial(p.nombre)}
      </div>
    ),
    { ...size },
  );
}
