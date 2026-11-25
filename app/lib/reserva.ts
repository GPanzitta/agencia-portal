/** La reserva de un auto desde el sitio (13/11/2026): lo que el cliente ve de su pedido. */
import { cabecerasDeAgencia } from './agencia-servidor';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3200/api';

export interface ReservaPublica {
  estado: 'pendiente' | 'confirmada' | 'rechazada' | 'vencida';
  nombre: string;
  auto: { id: string; titulo: string; anio: number };
  monto: number;
  moneda: 'ARS' | 'USD';
  alias: string | null;
  titular: string | null;
  vence_at: string;
  guardado_hasta: string | null;
  papeles?: {
    al_dia: boolean;
    items: { tipo: string; nombre: string; estado: 'al_dia' | 'en_tramite' | 'pendiente' }[];
  } | null;
  transferencia?: {
    estado: 'falta' | 'en_tramite' | 'ok';
    nota: string | null;
    vendida: boolean;
  } | null;
}

export async function reservaPublica(token: string): Promise<ReservaPublica | null> {
  try {
    const res = await fetch(`${API}/catalogo/reservas/${encodeURIComponent(token)}`, { cache: 'no-store', signal: AbortSignal.timeout(6000), headers: await cabecerasDeAgencia() });
    if (!res.ok) return null;
    return (await res.json()) as ReservaPublica;
  } catch {
    return null;
  }
}

/** «domingo 15 de noviembre a las 15:10», en hora de Argentina. */
export function hastaCuando(iso: string): string {
  const zona = 'America/Argentina/Buenos_Aires';
  const f = new Date(iso);
  const dia = f.toLocaleDateString('es-AR', { timeZone: zona, weekday: 'long', day: 'numeric', month: 'long' }).replace(',', '');
  const hora = f.toLocaleTimeString('es-AR', { timeZone: zona, hour: '2-digit', minute: '2-digit', hour12: false });
  return `${dia} a las ${hora}`;
}

/** AAAA-MM-DD → «20/11/2026». */
export function diaLegible(fecha: string): string {
  return fecha.split('-').reverse().join('/');
}
