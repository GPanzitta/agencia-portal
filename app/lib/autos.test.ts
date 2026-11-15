import { describe, expect, it } from 'vitest';

import { especificaciones, etiqueta, filtrosDe, hrefConFiltro, hrefDelCatalogo, linkWhatsapp, ordenDe, ordenar, parecidos, precio, renglon, tipos, type Auto } from './autos';

const base: Auto = {
  id: '1fa99da7-4e80-44b8-b2fd-8b9f1df6d93a', titulo: 'Toyota Corolla XEI 2.0 CVT', marca: 'Toyota', modelo: 'Corolla', version: 'XEI 2.0 CVT',
  anio: 2019, km: 82000, color: null, combustible: 'nafta', transmision: 'automatica', carroceria: 'sedan', condicion: 'usado',
  reservada: false, nuevo_ingreso: false, moneda: 'USD', precio: 18500, descripcion: null, portada: null, fotos: [],
};

describe('catálogo de autos', () => {
  it('escribe el precio en dólares y en pesos', () => {
    expect(precio(base)).toBe('US$ 18.500');
    expect(precio({ precio: 13900000, moneda: 'ARS' })).toBe('$ 13.900.000');
  });

  it('arma el renglón con lo que hay', () => {
    expect(renglon(base)).toBe('2019 · 82.000 km · Automática · Nafta');
    expect(renglon({ anio: 2026, km: 0, condicion: '0km', transmision: null, combustible: null })).toBe('2026 · 0 km');
  });

  it('elige una sola etiqueta, y reservado gana', () => {
    expect(etiqueta(base)).toBeNull();
    expect(etiqueta({ ...base, nuevo_ingreso: true })?.texto).toBe('Recién ingresado');
    expect(etiqueta({ ...base, condicion: '0km', nuevo_ingreso: true })?.texto).toBe('0 km');
    expect(etiqueta({ ...base, reservada: true, condicion: '0km' })?.texto).toBe('Reservado');
  });

  it('lee sólo los filtros conocidos y los recorta', () => {
    expect(filtrosDe({ marca: ' Toyota ', otro: 'x', carroceria: ['suv', 'sedan'], q: '' })).toEqual({ marca: 'Toyota', carroceria: 'suv' });
    expect(filtrosDe({ q: 'a'.repeat(200) }).q).toHaveLength(80);
  });

  it('prende y apaga un filtro conservando los demás', () => {
    expect(hrefConFiltro({}, 'marca', 'Toyota')).toBe('/autos?marca=Toyota');
    expect(hrefConFiltro({ marca: 'Toyota' }, 'marca', 'toyota')).toBe('/autos');
    expect(hrefConFiltro({ marca: 'Toyota' }, 'carroceria', 'suv')).toBe('/autos?marca=Toyota&carroceria=suv');
    expect(hrefConFiltro({ marca: 'Toyota' }, 'marca', 'Ford')).toBe('/autos?marca=Ford');
  });

  it('lista sólo las especificaciones cargadas', () => {
    const nombres = especificaciones(base).map((e) => e.nombre);
    expect(nombres).toEqual(['Año', 'Kilómetros', 'Caja', 'Combustible', 'Carrocería', 'Condición']);
    expect(especificaciones({ ...base, color: 'Gris' }).find((e) => e.nombre === 'Color')?.valor).toBe('Gris');
  });

  it('arma el WhatsApp con el auto en el mensaje, o nada si no hay número', () => {
    expect(linkWhatsapp(null, base, '')).toBeNull();
    const link = linkWhatsapp('5491155550100', base, 'https://agencia.test/autos/1');
    expect(link).toContain('https://wa.me/5491155550100?text=');
    expect(decodeURIComponent(link!.split('text=')[1])).toBe('Hola, vi el Toyota Corolla XEI 2.0 CVT 2019 en la página y quiero consultar. https://agencia.test/autos/1');
  });
});

describe('orden, tipos y parecidos', () => {
  const auto = (p: Partial<Auto>): Auto => ({ ...base, ...p });
  const stock = [
    auto({ id: 'a', marca: 'Toyota', carroceria: 'pickup', precio: 34900, km: 98000, anio: 2020 }),
    auto({ id: 'b', marca: 'Volkswagen', carroceria: 'pickup', precio: 36500, km: 64000, anio: 2021 }),
    auto({ id: 'c', marca: 'Peugeot', carroceria: 'hatchback', precio: 14800, km: 71000, anio: 2019 }),
    auto({ id: 'd', marca: 'Chevrolet', carroceria: 'hatchback', precio: 13900000, moneda: 'ARS', km: 132000, anio: 2015 }),
  ];

  it('ordena por precio dentro de cada moneda, con los dólares primero', () => {
    expect(ordenar(stock, 'precio_asc').map((a) => a.id)).toEqual(['c', 'a', 'b', 'd']);
    expect(ordenar(stock, 'precio_desc').map((a) => a.id)).toEqual(['b', 'a', 'c', 'd']);
  });

  it('ordena por kilómetros y por año sin tocar la lista original', () => {
    expect(ordenar(stock, 'km').map((a) => a.id)).toEqual(['b', 'c', 'a', 'd']);
    expect(ordenar(stock, 'anio').map((a) => a.id)).toEqual(['b', 'a', 'c', 'd']);
    expect(ordenar(stock, 'recientes')).toBe(stock);
    expect(stock.map((a) => a.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('lee el orden de la URL y cae en «recientes» si no lo conoce', () => {
    expect(ordenDe({ orden: 'km' })).toBe('km');
    expect(ordenDe({ orden: 'cualquiera' })).toBe('recientes');
    expect(ordenDe({})).toBe('recientes');
  });

  it('arma el enlace del catálogo sin poner el orden por defecto', () => {
    expect(hrefDelCatalogo({ marca: 'Toyota' })).toBe('/autos?marca=Toyota');
    expect(hrefDelCatalogo({ marca: 'Toyota' }, 'precio_asc')).toBe('/autos?marca=Toyota&orden=precio_asc');
    expect(hrefConFiltro({}, 'carroceria', 'suv', 'km')).toBe('/autos?carroceria=suv&orden=km');
  });

  it('cuenta los tipos que hay en el stock, de más a menos', () => {
    expect(tipos(stock)).toEqual([['hatchback', 'Hatchback', 2], ['pickup', 'Pickup', 2]]);
    expect(tipos([auto({ carroceria: null })])).toEqual([]);
  });

  it('sugiere parecidos: mismo tipo o marca, sin el propio ni los reservados', () => {
    expect(parecidos(stock[0], stock).map((a) => a.id)).toEqual(['b']);
    expect(parecidos(stock[2], stock).map((a) => a.id)).toEqual(['d']);
    expect(parecidos(stock[0], [stock[0], auto({ id: 'r', carroceria: 'pickup', reservada: true })])).toEqual([]);
  });
});
