/**
 * La agencia del pedido en curso, leída del host (tanda 2, 12/11/2026).
 * Sólo para el servidor: usa `next/headers`. Lo puro (cómo se lee el nombre
 * de la agencia de un host) está en `agencia.ts`, que también puede cargar el navegador.
 */
import { headers } from 'next/headers';

import { slugDelHost } from './agencia';

/** La agencia del pedido en curso, o null. Fuera de un pedido (tests, build) no hay cabeceras: null. */
export async function agenciaDelPedido(): Promise<string | null> {
  try {
    const h = await headers();
    return slugDelHost(h.get('x-forwarded-host') ?? h.get('host'));
  } catch {
    return null;
  }
}

/** Las cabeceras que identifican a la agencia ante el backend. */
export async function cabecerasDeAgencia(): Promise<Record<string, string>> {
  const slug = await agenciaDelPedido();
  return slug ? { 'x-agencia': slug } : {};
}
