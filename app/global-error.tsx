'use client';

import PantallaDeError from './components/pantalla-de-error';

/**
 * Lo último que queda cuando falla el layout raíz. Reemplaza al layout entero:
 * trae su propio `<html>` y `<body>`, ninguna hoja de estilos (por eso
 * `PantallaDeError` va con estilos en línea) y no hay contexto del perfil: el
 * WhatsApp sale de la variable de respaldo, si está cargada. Sin `metadata`
 * (es un Client Component): el título va con la etiqueta `<title>` de React.
 */
export default function ErrorGlobal({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="es-AR">
      <body style={{ margin: 0, background: '#F3F5F9', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.45 }}>
        <title>No pudimos cargar esta página</title>
        <PantallaDeError error={error} retry={retry} />
      </body>
    </html>
  );
}
