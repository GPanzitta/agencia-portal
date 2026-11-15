/**
 * De qué agencia es el sitio que se está mirando (tanda 2, 12/11/2026).
 *
 * Un solo sitio sirve a todas las agencias: cada una entra por su dirección
 * (`perez.fgautos.com.ar`) y acá se lee esa primera parte del host para
 * mandársela al backend en la cabecera `x-agencia`. Sin subdominio no se manda
 * nada y el backend se comporta como antes (la agencia única del despliegue).
 *
 * Este archivo es puro: lo puede cargar el navegador. Leer el host del pedido es
 * cosa del servidor y vive en `agencia-servidor.ts`.
 */
/** El dominio del que cuelgan las agencias. En desarrollo, `localhost` (`perez.localhost:3201`). */
export const DOMINIO_BASE = (process.env.NEXT_PUBLIC_DOMINIO_BASE || 'localhost').toLowerCase();

/** `perez.fgautos.com.ar` → `perez`. null si el host es el dominio pelado, `www`, otro dominio o algo raro. */
export function slugDelHost(host: string | null | undefined, base: string = DOMINIO_BASE): string | null {
  const limpio = (host ?? '').trim().toLowerCase().split(':')[0];
  if (!limpio || !limpio.endsWith(`.${base}`)) return null;
  const sub = limpio.slice(0, -(base.length + 1));
  if (sub === 'www' || !/^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/.test(sub)) return null;
  return sub;
}
