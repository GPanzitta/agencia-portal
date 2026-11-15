import type { Auto } from './autos';

/** Lo que la agencia arma en el ERP para la publicación de cada auto. */
export interface Publicacion {
  destacados: { nombre: string; categoria: string }[];
  caracteristicas: { grupo: string; etiqueta: string; valor: string }[];
  colores: { nombre: string; hex: string }[];
  precio_financiado: number | null;
  mostrar_toma: boolean;
  relacionadas: string[];
}

export const PUBLICACION_VACIA: Publicacion = { destacados: [], caracteristicas: [], colores: [], precio_financiado: null, mostrar_toma: true, relacionadas: [] };

const GRUPOS = ['General', 'Exterior', 'Equipamiento y confort', 'Seguridad', 'Interior', 'Entretenimiento'];

/** Las características por grupo, en el orden de siempre y con los grupos propios de la agencia al final. */
export function porGrupo(lista: Publicacion['caracteristicas']): { grupo: string; items: Publicacion['caracteristicas'] }[] {
  const grupos = [...new Set([...GRUPOS, ...lista.map((c) => c.grupo)])];
  return grupos.map((grupo) => ({ grupo, items: lista.filter((c) => c.grupo === grupo) })).filter((g) => g.items.length);
}

/**
 * Los otros autos que se ofrecen al lado del precio. Si la agencia eligió
 * cuáles, van esos (los que sigan publicados); si no, los del mismo modelo
 * y después los de precio más parecido en la misma moneda.
 */
export function opcionesDeCompra(a: Auto, todas: Auto[], cuantas = 4): Auto[] {
  const otras = todas.filter((o) => o.id !== a.id);
  const elegidas = (a.publicacion?.relacionadas ?? []).map((id) => otras.find((o) => o.id === id)).filter((o): o is Auto => !!o);
  if (elegidas.length) return elegidas.slice(0, cuantas);
  const distancia = (o: Auto) => Math.abs(o.precio - a.precio);
  const mismoModelo = otras.filter((o) => o.marca === a.marca && o.modelo === a.modelo).sort((x, y) => distancia(x) - distancia(y));
  const parecidas = otras
    .filter((o) => !mismoModelo.includes(o) && o.moneda === a.moneda && distancia(o) <= a.precio * 0.25)
    .sort((x, y) => distancia(x) - distancia(y));
  return [...mismoModelo, ...parecidas].slice(0, cuantas);
}
