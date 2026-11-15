import type { Publicacion } from './publicacion';
/**
 * El catálogo público de la agencia (diseño del 12/11/2026). Una sola
 * dependencia: `GET /catalogo/unidades` del backend, que nunca manda costos.
 */
import { cabecerasDeAgencia } from './agencia-servidor';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3200/api';

/** Cómo está un papel del auto, para quien lo mira en el sitio. */
export interface PapelPublico {
  tipo: string;
  nombre: string;
  estado: 'al_dia' | 'en_tramite' | 'pendiente';
}

export interface Auto {
  /** Las condiciones para simular la cuota; no viene si la agencia no financia. */
  financiacion?: { anticipo_minimo_pct: number; plazos: number[]; tna: number } | null;
  /** La seña con la que se reserva desde el sitio; no viene si la agencia no toma reservas o el auto no está libre. */
  reserva?: { monto: number; moneda: 'ARS' | 'USD'; horas: number; dias: number; en_curso: boolean } | null;
  /** Los papeles de un usado; un 0 km no trae. */
  papeles?: { al_dia: boolean; items: PapelPublico[] } | null;
  id: string;
  titulo: string;
  marca: string;
  modelo: string;
  version: string | null;
  anio: number;
  km: number;
  color: string | null;
  combustible: string | null;
  transmision: string | null;
  carroceria: string | null;
  condicion: 'usado' | '0km';
  reservada: boolean;
  nuevo_ingreso: boolean;
  moneda: 'ARS' | 'USD';
  precio: number;
  descripcion: string | null;
  portada: string | null;
  fotos: { url: string; url_miniatura: string }[];
  /** Dónde está el auto, si la agencia lo cargó. */
  ubicacion?: string | null;
  /** Equipamiento, características, colores y opciones de compra que armó la agencia. */
  publicacion?: Publicacion | null;
}

export const CLAVES_DE_FILTRO = ['marca', 'carroceria', 'combustible', 'transmision', 'condicion', 'q'] as const;
export type ClaveDeFiltro = (typeof CLAVES_DE_FILTRO)[number];
export type Filtros = Partial<Record<ClaveDeFiltro, string>>;

export const ROTULOS: Record<string, Record<string, string>> = {
  carroceria: {
    sedan: 'Sedán', hatchback: 'Hatchback', suv: 'SUV', pickup: 'Pickup', coupe: 'Coupé', rural: 'Rural',
    monovolumen: 'Monovolumen', utilitario: 'Utilitario', moto: 'Moto', otro: 'Otro',
  },
  combustible: { nafta: 'Nafta', diesel: 'Diésel', gnc: 'GNC', hibrido: 'Híbrido', electrico: 'Eléctrico' },
  transmision: { manual: 'Manual', automatica: 'Automática' },
  condicion: { usado: 'Usado', '0km': '0 km' },
};

export const rotulo = (clave: string, valor: string | null | undefined): string | null =>
  valor ? ROTULOS[clave]?.[valor] ?? valor : null;

/** Lo que llega por la URL, recortado y sólo con las claves conocidas. */
export function filtrosDe(params: Record<string, string | string[] | undefined>): Filtros {
  const f: Filtros = {};
  for (const clave of CLAVES_DE_FILTRO) {
    const crudo = params[clave];
    const valor = (Array.isArray(crudo) ? crudo[0] : crudo)?.trim().slice(0, 80);
    if (valor) f[clave] = valor;
  }
  return f;
}

/** El enlace que prende o apaga un filtro, conservando los demás. */
export function hrefConFiltro(actual: Filtros, clave: ClaveDeFiltro, valor: string, orden?: Orden): string {
  const siguiente: Filtros = { ...actual };
  if (siguiente[clave]?.toLowerCase() === valor.toLowerCase()) delete siguiente[clave];
  else siguiente[clave] = valor;
  return hrefDelCatalogo(siguiente, orden);
}

export const hayFiltros = (f: Filtros): boolean => Object.keys(f).length > 0;

export interface Catalogo {
  unidades: Auto[];
  marcas: string[];
  /** El backend no contestó: la página lo dice en vez de mostrar «no hay autos». */
  caido: boolean;
}

export async function catalogo(f: Filtros = {}): Promise<Catalogo> {
  try {
    const qs = new URLSearchParams(f as Record<string, string>).toString();
    const res = await fetch(`${API}/catalogo/unidades${qs ? `?${qs}` : ''}`, { cache: 'no-store', signal: AbortSignal.timeout(6000), headers: await cabecerasDeAgencia() });
    if (!res.ok) return { unidades: [], marcas: [], caido: true };
    const datos = (await res.json()) as { unidades: Auto[]; marcas: string[] };
    return { unidades: datos.unidades ?? [], marcas: datos.marcas ?? [], caido: false };
  } catch {
    return { unidades: [], marcas: [], caido: true };
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** null si no existe o ya no está publicada; tira si el backend está caído (para no dar un 404 falso). */
export async function auto(id: string): Promise<Auto | null> {
  if (!UUID.test(id)) return null;
  const res = await fetch(`${API}/catalogo/unidades/${id}`, { cache: 'no-store', signal: AbortSignal.timeout(6000), headers: await cabecerasDeAgencia() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`El catálogo contestó ${res.status}`);
  return (await res.json()) as Auto;
}

/** «US$ 18.500» o «$ 13.900.000». */
export function precio(a: Pick<Auto, 'precio' | 'moneda'>): string {
  const n = Math.round(a.precio).toLocaleString('es-AR');
  return `${a.moneda === 'USD' ? 'US$' : '$'} ${n}`;
}

export const kilometros = (a: Pick<Auto, 'km' | 'condicion'>): string =>
  a.condicion === '0km' ? '0 km' : `${a.km.toLocaleString('es-AR')} km`;

/** «2019 · 82.000 km · Automática · Nafta». */
export function renglon(a: Pick<Auto, 'anio' | 'km' | 'condicion' | 'transmision' | 'combustible'>): string {
  return [String(a.anio), kilometros(a), rotulo('transmision', a.transmision), rotulo('combustible', a.combustible)].filter(Boolean).join(' · ');
}

/** La etiqueta de la tarjeta: una sola, la que más importa. */
export function etiqueta(a: Pick<Auto, 'reservada' | 'condicion' | 'nuevo_ingreso'>): { texto: string; tono: 'reservado' | 'cero' | 'nuevo' } | null {
  if (a.reservada) return { texto: 'Reservado', tono: 'reservado' };
  if (a.condicion === '0km') return { texto: '0 km', tono: 'cero' };
  if (a.nuevo_ingreso) return { texto: 'Recién ingresado', tono: 'nuevo' };
  return null;
}

/** Los datos de la ficha, sólo los que el auto tiene cargados. */
export function especificaciones(a: Auto): { nombre: string; valor: string }[] {
  const filas: [string, string | null][] = [
    ['Año', String(a.anio)],
    ['Kilómetros', kilometros(a)],
    ['Caja', rotulo('transmision', a.transmision)],
    ['Combustible', rotulo('combustible', a.combustible)],
    ['Carrocería', rotulo('carroceria', a.carroceria)],
    ['Color', a.color],
    ['Condición', rotulo('condicion', a.condicion)],
  ];
  return filas.filter((f): f is [string, string] => !!f[1]).map(([nombre, valor]) => ({ nombre, valor }));
}

/** El enlace de WhatsApp con el mensaje ya escrito. `numero` viene normalizado (sólo dígitos, con país). */
export function linkWhatsapp(numero: string | null, a: Pick<Auto, 'titulo' | 'anio'> | null, origen: string): string | null {
  if (!numero) return null;
  const texto = a
    ? `Hola, vi el ${a.titulo} ${a.anio} en la página y quiero consultar. ${origen}`
    : 'Hola, estoy buscando un auto y quiero consultar.';
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto.trim())}`;
}

// ─── Orden, tipos y parecidos ────────────────────────────────────────────────

export const ORDENES = [
  ['recientes', 'Lo último que entró'],
  ['precio_asc', 'Menor precio'],
  ['precio_desc', 'Mayor precio'],
  ['km', 'Menos kilómetros'],
  ['anio', 'Más nuevos'],
] as const;
export type Orden = (typeof ORDENES)[number][0];

export function ordenDe(params: Record<string, string | string[] | undefined>): Orden {
  const crudo = Array.isArray(params.orden) ? params.orden[0] : params.orden;
  return ORDENES.some(([v]) => v === crudo) ? (crudo as Orden) : 'recientes';
}

/** El catálogo con estos filtros y este orden. «Recientes» es el orden por defecto y no viaja en la URL. */
export function hrefDelCatalogo(f: Filtros, orden: Orden = 'recientes'): string {
  const qs = new URLSearchParams(f as Record<string, string>);
  if (orden !== 'recientes') qs.set('orden', orden);
  const texto = qs.toString();
  return texto ? `/autos?${texto}` : '/autos';
}

/**
 * Ordena sin tocar la lista original. El precio sólo se compara dentro de la
 * misma moneda: los dólares van primero y los pesos después, cada grupo en su orden.
 */
export function ordenar(lista: Auto[], orden: Orden): Auto[] {
  if (orden === 'recientes') return lista;
  const copia = [...lista];
  if (orden === 'km') return copia.sort((a, b) => a.km - b.km);
  if (orden === 'anio') return copia.sort((a, b) => b.anio - a.anio || a.km - b.km);
  const signo = orden === 'precio_asc' ? 1 : -1;
  return copia.sort((a, b) => (a.moneda === b.moneda ? signo * (a.precio - b.precio) : a.moneda === 'USD' ? -1 : 1));
}

/** Los tipos de carrocería que hay en el stock, con cuántos autos tiene cada uno, de más a menos. */
export function tipos(unidades: Auto[]): [valor: string, texto: string, cantidad: number][] {
  const cuenta = new Map<string, number>();
  for (const u of unidades) if (u.carroceria) cuenta.set(u.carroceria, (cuenta.get(u.carroceria) ?? 0) + 1);
  return [...cuenta.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([valor, cantidad]) => [valor, rotulo('carroceria', valor) ?? valor, cantidad]);
}

/** Otros autos para mostrar al pie de una ficha: primero el mismo tipo, después la misma marca, por cercanía de precio. */
export function parecidos(a: Auto, todas: Auto[], cuantos = 3): Auto[] {
  const puntaje = (u: Auto) => (u.carroceria && u.carroceria === a.carroceria ? 2 : 0) + (u.marca === a.marca ? 1 : 0);
  const distancia = (u: Auto) => (u.moneda === a.moneda ? Math.abs(u.precio - a.precio) : Number.MAX_SAFE_INTEGER);
  return todas
    .filter((u) => u.id !== a.id && !u.reservada && puntaje(u) > 0)
    .sort((x, y) => puntaje(y) - puntaje(x) || distancia(x) - distancia(y))
    .slice(0, cuantos);
}
