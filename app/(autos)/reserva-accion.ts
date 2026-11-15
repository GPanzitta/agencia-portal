'use server';

/**
 * Pedir la reserva de un auto desde el sitio (13/11/2026). Corre en el
 * servidor, como el resto de los formularios: el navegador no le habla directo
 * al backend. Si sale bien, lleva al cliente a la página de su reserva, donde
 * están los datos para transferir la seña.
 */
import { redirect } from 'next/navigation';

import { cabecerasDeAgencia } from '../lib/agencia-servidor';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3200/api';

export interface EstadoReserva {
  error: string | null;
}

const NO_SE_PUDO = 'No pudimos tomar la reserva. Probá de nuevo o escribinos por WhatsApp.';

export async function pedirReserva(_previo: EstadoReserva, datos: FormData): Promise<EstadoReserva> {
  const texto = (clave: string) => String(datos.get(clave) ?? '').trim();
  const nombre = texto('nombre');
  const telefono = texto('telefono');
  const digitos = telefono.split('').filter((c) => c >= '0' && c <= '9').length;
  if (nombre.length < 2) return { error: 'Decinos tu nombre y apellido, como figura en tu documento.' };
  if (digitos < 8) return { error: 'Dejanos un teléfono con característica: te avisamos ahí cuando confirmemos la seña.' };
  let token: string | null = null;
  try {
    const res = await fetch(`${API}/catalogo/reservas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await cabecerasDeAgencia()) },
      body: JSON.stringify({
        unidad_id: texto('unidad_id'), nombre, telefono,
        ...(texto('documento') ? { documento: texto('documento').slice(0, 20) } : {}),
        ...(texto('sitio_web') ? { sitio_web: texto('sitio_web') } : {}),
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (res.status === 429) return { error: 'Recibimos varios pedidos seguidos. Probá de nuevo en un rato o escribinos por WhatsApp.' };
    if (!res.ok) {
      const cuerpo = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
      const mensaje = Array.isArray(cuerpo?.message) ? null : cuerpo?.message;
      // Los motivos de negocio (ya lo pidió otro, no se toma reservas) vienen escritos para el cliente.
      return { error: res.status === 409 || res.status === 422 || res.status === 400 ? mensaje ?? NO_SE_PUDO : NO_SE_PUDO };
    }
    token = ((await res.json()) as { token: string | null }).token;
  } catch {
    return { error: NO_SE_PUDO };
  }
  // Un bot que cayó en la trampa no tiene reserva que ver.
  redirect(token ? `/reserva/${token}` : '/autos');
}
