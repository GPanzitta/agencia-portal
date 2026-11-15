import { ImageResponse } from 'next/og';

import { ACENTO_HEX, TINTA, donde, inicial, perfilNoDisponible } from './lib/identidad';
import { perfil } from './lib/perfil';

/**
 * La tarjeta que se ve cuando alguien pega el link en WhatsApp, que es por
 * donde se comparte un auto. Sin `og:image` WhatsApp no dibuja tarjeta:
 * muestra un renglón de texto gris y el link pierde el clic.
 *
 * La dibujamos con los datos del perfil en vez de pedirle a la agencia que
 * suba un archivo de 1200x630: así la tarjeta EXISTE desde el primer día.
 *
 * Ojo con el alcance: la imagen por convención de archivo sólo entra en el
 * segmento donde vive, y cualquier layout o page que declare `openGraph` la
 * pisa entera. Este archivo cubre el árbol que no declara nada.
 */

export const alt = 'Autos usados y 0 km';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function TarjetaSocial() {
  const p = await perfil();
  // WhatsApp guarda la vista previa del link: una tarjeta con el nombre
  // genérico quedaría pegada a cada mensaje que ya se mandó.
  if (p.respaldo) return perfilNoDisponible();
  const acento = ACENTO_HEX[p.color_acento];
  const lugar = donde(p);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: TINTA,
          color: '#eef1f4',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flexGrow: 1,
            padding: '72px 80px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 104,
                height: 104,
                marginRight: 28,
                background: acento,
                color: TINTA,
                fontSize: 64,
                letterSpacing: '-0.04em',
              }}
            >
              {inicial(p.nombre)}
            </div>
            <div style={{ display: 'flex', fontSize: 27, letterSpacing: '0.2em', color: '#aeb8c4' }}>
              AUTOS USADOS Y 0 KM
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 84, lineHeight: 1.05, letterSpacing: '-0.03em' }}>{p.nombre}</div>
            {p.eslogan ? <div style={{ fontSize: 40, marginTop: 20, color: '#aeb8c4' }}>{p.eslogan}</div> : null}
            {lugar ? <div style={{ fontSize: 34, marginTop: 14, color: acento }}>{lugar}</div> : null}
          </div>
        </div>

        {/* La franja del acento a sangre: es lo que hace que la tarjeta se lea
            como de la agencia y no como una placa genérica. */}
        <div style={{ display: 'flex', height: 16, background: acento }} />
      </div>
    ),
    { ...size },
  );
}
