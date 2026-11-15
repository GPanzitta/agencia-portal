import { ImageResponse } from 'next/og';

import { ACENTO_HEX, TINTA, inicial, perfilNoDisponible } from './lib/identidad';
import { perfil } from './lib/perfil';

/**
 * El ícono de la pestaña y el que Google muestra al lado del resultado en el
 * celular.
 *
 * Se DIBUJA en vez de subirse un .png porque cada agencia tiene su sitio: el
 * nombre y el acento salen del backend, así que la agencia no tiene que mandar
 * ningún archivo para tener ícono propio. Con el backend caído NO se dibuja el
 * de respaldo: contesta 503 (`perfilNoDisponible`), porque el favicon lo
 * guarda Google y una inicial ajena guardada dura semanas.
 */

/**
 * 192: Google pide el favicon cuadrado y de un múltiplo de 48 px para
 * mostrarlo en el resultado, y 192 es además el tamaño estándar de PWA. El
 * navegador lo baja a 16 solo.
 */
export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

export default async function Icon() {
  const p = await perfil();
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
          // A sangre y opaco: un logo transparente con tinta oscura
          // desaparece en la barra de pestañas en modo oscuro.
          background: ACENTO_HEX[p.color_acento],
          color: TINTA,
          fontSize: 132,
          letterSpacing: '-0.04em',
        }}
      >
        {inicial(p.nombre)}
      </div>
    ),
    { ...size },
  );
}
