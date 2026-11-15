import { unstable_rethrow } from 'next/navigation';
import { cache } from 'react';

import { cabecerasDeAgencia } from './agencia-servidor';

/**
 * El perfil público de la agencia: lo que carga en el ERP y el sitio muestra
 * (nombre, dirección, teléfonos, horarios). Se lee tolerante: con el backend
 * caído vuelve el perfil por defecto marcado con `respaldo: true`, así las
 * páginas siguen saliendo con un nombre; las imágenes generadas (ícono,
 * tarjeta social) contestan 503 y el manifest tira.
 */
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3200/api';

/** El color con el que se dibujan el ícono y la tarjeta social de la agencia. */
export const ACENTOS = ['amarillo', 'naranja', 'celeste', 'verde', 'rojo', 'violeta', 'fuego'] as const;
export type Acento = (typeof ACENTOS)[number];

export interface Horario { dias: string; desde: string; hasta: string }

export interface PerfilPublico {
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  whatsapp: string | null;
  lat: number | null;
  lng: number | null;
  eslogan: string | null;
  quienes_somos: string | null;
  zona: string | null;
  color_acento: Acento;
  horarios: Horario[];
  /**
   * Este perfil es el de respaldo, no lo que contestó el backend. Lo miran las
   * imágenes generadas (ícono, tarjeta social, manifest), que quien las pide
   * las guarda y no se pueden dibujar con un nombre ajeno. A propósito NO está
   * en `PERFIL_POR_DEFECTO`: no puede colarse en el camino feliz.
   */
  respaldo?: true;
}

/**
 * El nombre de respaldo no depende de que el backend conteste: es dato de
 * deploy. Sin la variable cargada queda la frase genérica, que es lo correcto
 * para un sitio multi-agencia: poner acá una marca haría que cualquier agencia
 * con el backend dormido saliera con un nombre ajeno. (La variable conserva el
 * nombre que traía, para no romper deploys.)
 */
export const NOMBRE_DE_RESPALDO = process.env.NEXT_PUBLIC_NOMBRE_TALLER || 'Agencia de autos';

export const PERFIL_POR_DEFECTO: PerfilPublico = {
  nombre: NOMBRE_DE_RESPALDO, direccion: null, telefono: null, whatsapp: null, lat: null, lng: null,
  eslogan: null, quienes_somos: null, zona: null, color_acento: 'amarillo', horarios: [],
};

/** Una llamada por request aunque la pidan el layout raíz, el del grupo y la página. */
export const perfil = cache(async (): Promise<PerfilPublico> => {
  try {
    // Un backend colgado no puede colgar la página: a los 2.5 s se corta y cae al catch.
    // Con dirección propia (`perez.dominio`) el perfil es el de esa agencia. Sólo para el
    // servidor (lee el host con `next/headers`): ningún componente del navegador carga este archivo.
    const agencia = await cabecerasDeAgencia();
    const ruta = agencia['x-agencia'] ? 'catalogo/perfil' : 'tienda/perfil';
    const res = await fetch(`${API}/${ruta}`, { cache: 'no-store', signal: AbortSignal.timeout(2500), headers: agencia });
    if (!res.ok) return { ...PERFIL_POR_DEFECTO, respaldo: true };
    const datos = (await res.json()) as PerfilPublico;
    // `respaldo` lo decide este archivo, no el backend.
    delete datos.respaldo;
    return { ...PERFIL_POR_DEFECTO, ...datos, color_acento: acentoValido(datos.color_acento) };
  } catch (err) {
    // Los errores internos de Next (el `fetch` sin caché durante el build, un
    // `notFound()`) no son "el backend no contestó": se relanzan para que Next
    // los maneje, y sólo lo demás cae al respaldo.
    unstable_rethrow(err);
    return { ...PERFIL_POR_DEFECTO, respaldo: true };
  }
});

export function acentoValido(x: unknown): Acento {
  return (ACENTOS as readonly unknown[]).includes(x) ? (x as Acento) : 'amarillo';
}

/**
 * La localidad sola, para la tarjeta social. Sale primero de la dirección
 * («Av. Lafuente 67, CABA» → «CABA»): la zona es texto libre del ERP y puede
 * ser un lema. Si no hay, la primera parte de la zona («Villa Ballester y
 * alrededores» → «Villa Ballester»).
 */
export function localidadDe(p: Pick<PerfilPublico, 'direccion' | 'zona'>): string | null {
  const deLaDireccion = p.direccion?.split(',').slice(1).pop()?.trim();
  if (deLaDireccion) return deLaDireccion;
  const primera = p.zona?.split(/\s+y\s+|,|·/)[0].trim();
  return primera || null;
}

export const formatearHorario = (h: Horario) => `${h.dias} · ${h.desde} a ${h.hasta}`;
