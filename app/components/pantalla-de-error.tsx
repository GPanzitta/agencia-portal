'use client';

import { useEffect } from 'react';

import { linkTelefono, linkWhatsapp, whatsappArgentino } from '../lib/whatsapp';
import { useContacto } from './contacto';

/**
 * Lo que ve el cliente cuando una página no se pudo armar. Sin esto era la
 * pantalla de fábrica de Next, en inglés y sin una sola salida. El caso más
 * común es el backend dormido, que tarda unos segundos en despertar: por eso
 * el texto invita a reintentar, y siempre hay una salida por WhatsApp o por
 * teléfono.
 *
 * Estilos en línea a propósito: también se muestra suelta en
 * `global-error.tsx`, donde no hay ninguna hoja de estilos cargada.
 */
export default function PantallaDeError({
  error,
  retry,
  titulo = 'No pudimos cargar esta página',
}: {
  error?: Error & { digest?: string };
  retry?: () => void;
  titulo?: string;
}) {
  const contacto = useContacto();

  useEffect(() => {
    if (error) console.error(error);
  }, [error]);

  const wa = whatsappArgentino(contacto.whatsapp)
    ? linkWhatsapp(
        contacto.whatsapp,
        `Hola, quise entrar a la página y no cargó${error?.digest ? ` (código ${error.digest})` : ''}.`,
      )
    : null;
  const tel = linkTelefono(contacto.telefono);

  const boton: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 44, padding: '0 20px',
    borderRadius: 999, fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', cursor: 'pointer',
    fontFamily: 'inherit',
  };

  return (
    <div role="alert" style={{ maxWidth: 560, margin: '0 auto', padding: '56px 16px 64px', color: '#181818' }}>
      <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5a6572' }}>
        Algo no anduvo
      </p>
      <h1 style={{ margin: '8px 0 0', fontSize: '1.5rem', lineHeight: 1.2 }}>{titulo}</h1>
      <p style={{ margin: '12px 0 0', color: '#5a6572', maxWidth: '52ch' }}>
        Puede que el sistema se esté despertando: suele tardar unos segundos. Probá de nuevo y, si sigue sin andar, escribinos y te atendemos por ahí.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 24 }}>
        {retry && (
          <button type="button" onClick={() => retry()} style={{ ...boton, border: 'none', background: '#181818', color: '#fff' }}>
            Probar de nuevo
          </button>
        )}
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" style={{ ...boton, background: '#1f7a4d', color: '#fff' }}>
            Escribinos por WhatsApp
          </a>
        )}
        {tel && !wa && (
          <a href={tel} style={{ ...boton, border: '1px solid #c9d0d8', color: '#181818' }}>
            Llamar
          </a>
        )}
        {/* Un <a> a propósito: después de un error conviene recargar entero, no navegar dentro de la app rota. */}
        <a href="/" style={{ ...boton, border: '1px solid #c9d0d8', color: '#181818' }}>
          Ir al inicio
        </a>
      </div>
      {error?.digest && (
        <p style={{ margin: '20px 0 0', fontSize: '0.75rem', color: '#5a6572' }}>Código del error: {error.digest}</p>
      )}
    </div>
  );
}
