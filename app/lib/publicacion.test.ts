import { describe, expect, it } from 'vitest';

import type { Auto } from './autos';
import { opcionesDeCompra, porGrupo, PUBLICACION_VACIA } from './publicacion';

const auto = (x: Partial<Auto>): Auto => ({
  id: 'a', titulo: 'Fiat Cronos', marca: 'Fiat', modelo: 'Cronos', version: null, anio: 2022, km: 40000, color: null, combustible: null, transmision: null,
  carroceria: null, condicion: 'usado', reservada: false, nuevo_ingreso: false, moneda: 'USD', precio: 15000, descripcion: null, portada: null, fotos: [],
  ubicacion: null, publicacion: PUBLICACION_VACIA, ...x,
});

describe('la publicación de un auto', () => {
  it('agrupa las características en el orden de siempre, con los grupos propios al final', () => {
    const g = porGrupo([{ grupo: 'Off road', etiqueta: 'Reductora', valor: 'Sí' }, { grupo: 'Seguridad', etiqueta: 'Airbags', valor: '6' }, { grupo: 'General', etiqueta: 'Litros', valor: '1.8' }]);
    expect(g.map((x) => x.grupo)).toEqual(['General', 'Seguridad', 'Off road']);
  });

  it('si la agencia eligió qué ofrecer al lado, van esos y sólo los que siguen publicados', () => {
    const a = auto({ publicacion: { ...PUBLICACION_VACIA, relacionadas: ['c', 'ya-vendido', 'b'] } });
    const stock = [a, auto({ id: 'b' }), auto({ id: 'c', marca: 'Toyota', modelo: 'Hilux', precio: 40000 })];
    expect(opcionesDeCompra(a, stock).map((o) => o.id)).toEqual(['c', 'b']);
  });

  it('si no eligió, primero el mismo modelo y después los de precio parecido en la misma moneda', () => {
    const a = auto({});
    const stock = [
      a, auto({ id: 'caro', marca: 'Toyota', modelo: 'Hilux', precio: 40000 }), auto({ id: 'parecido', marca: 'Peugeot', modelo: '208', precio: 16000 }),
      auto({ id: 'pesos', marca: 'Renault', modelo: 'Logan', precio: 15000, moneda: 'ARS' }), auto({ id: 'mismo', precio: 19500 }),
    ];
    expect(opcionesDeCompra(a, stock).map((o) => o.id)).toEqual(['mismo', 'parecido']);
  });
});
