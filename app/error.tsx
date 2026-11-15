'use client';

import PantallaDeError from './components/pantalla-de-error';

/**
 * Error de servidor en cualquier tramo del sitio: en vez de la pantalla de
 * fábrica de Next, en inglés, la nuestra con reintento y salida por WhatsApp.
 */
export default function ErrorDelTramo({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <PantallaDeError error={error} retry={retry} />;
}
