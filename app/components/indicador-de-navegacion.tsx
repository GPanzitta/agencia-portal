'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * Una barra fina arriba mientras se carga la página siguiente (auditoría
 * POR-03). `ficha()` y `listadoDeCategoria()` esperan al backend hasta 15 s y,
 * sin respuesta visual, el cliente que tocó un auto tocaba de nuevo o se
 * iba.
 *
 * No es un `loading.tsx` a propósito: en las páginas que se indexan (`/p`,
 * `/c`, `/m`) un `loading.tsx` hace que Next mande la respuesta en streaming
 * y los 404 salgan con 200 (medido en dev, también con el user agent de
 * Googlebot). Esto sólo acompaña la navegación del lado del cliente, no toca
 * la respuesta del servidor.
 */
export function esNavegacionInterna(
  evento: Pick<MouseEvent, 'button' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey'>,
  enlace: { href: string; target?: string; hasAttribute(nombre: string): boolean } | null,
  actual: string,
): boolean {
  if (!enlace || evento.button !== 0) return false;
  if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return false;
  if ((enlace.target && enlace.target !== '_self') || enlace.hasAttribute('download')) return false;
  let destino: URL;
  let origen: URL;
  try {
    destino = new URL(enlace.href, actual);
    origen = new URL(actual);
  } catch {
    return false;
  }
  if (destino.origin !== origen.origin) return false;
  // Un ancla de la misma página no carga nada.
  return destino.pathname !== origen.pathname || destino.search !== origen.search;
}

/** Va adentro de un `<Suspense>` en el layout raíz: usa `useSearchParams`. */
export default function IndicadorDeNavegacion() {
  const ruta = usePathname();
  const consulta = useSearchParams().toString();
  const clave = `${ruta}?${consulta}`;
  // Dónde estaba el cliente cuando tocó el link. Está cargando mientras siga
  // ahí: al llegar la página nueva (o al volver con «atrás») la clave cambia y
  // la barra se apaga sola, sin un setState dentro de un efecto.
  const [tocadoEn, setTocadoEn] = useState<string | null>(null);
  // Al cambiar de página se olvida dónde se tocó: si no, volver más tarde a
  // esa misma página la mostraría cargando. Es el ajuste de estado durante el
  // render que recomienda React para «resetear al cambiar una prop».
  const [claveVista, setClaveVista] = useState(clave);
  if (claveVista !== clave) {
    setClaveVista(clave);
    setTocadoEn(null);
  }
  const cargando = tocadoEn !== null && tocadoEn === clave;
  const claveActual = useRef(clave);
  useEffect(() => {
    claveActual.current = clave;
  }, [clave]);

  useEffect(() => {
    const alTocar = (e: MouseEvent) => {
      const enlace = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (esNavegacionInterna(e, enlace, window.location.href)) setTocadoEn(claveActual.current);
    };
    // En captura: el `<Link>` de Next hace `preventDefault` para navegar del lado
    // del cliente, así que en la fase de burbuja todo toque parecería cancelado.
    document.addEventListener('click', alTocar, true);
    return () => document.removeEventListener('click', alTocar, true);
  }, []);

  // Por las dudas (una navegación que el router abortó): nunca queda prendida.
  useEffect(() => {
    if (!cargando) return;
    const t = setTimeout(() => setTocadoEn(null), 20000);
    return () => clearTimeout(t);
  }, [cargando]);

  return (
    <>
      <div className={`indicador-navegacion${cargando ? ' activo' : ''}`} aria-hidden="true" />
      <span className="sr-only" role="status">
        {cargando ? 'Cargando la página…' : ''}
      </span>
    </>
  );
}
