import { afterEach, describe, expect, it, vi } from 'vitest';

import { PERFIL_POR_DEFECTO, acentoValido, formatearHorario, localidadDe, perfil } from './perfil';

describe('acentoValido', () => {
  it('devuelve el acento si es de la lista; amarillo si no', () => {
    expect(acentoValido('verde')).toBe('verde');
    expect(acentoValido('rosa')).toBe('amarillo');
    expect(acentoValido(undefined)).toBe('amarillo');
  });

  it('fuego, el acento con el degradé del logo, es válido (spec 2026-09-27 §5)', () => {
    expect(acentoValido('fuego')).toBe('fuego');
  });
});

describe('formatearHorario', () => {
  it('"Lun a Vie · 9:00 a 18:00"', () => {
    expect(formatearHorario({ dias: 'Lun a Vie', desde: '9:00', hasta: '18:00' })).toBe('Lun a Vie · 9:00 a 18:00');
  });
});

describe('localidadDe', () => {
  it('se queda con la primera parte de la zona', () => {
    expect(localidadDe({ ...PERFIL_POR_DEFECTO, zona: 'Villa Ballester y alrededores' })).toBe('Villa Ballester');
    expect(localidadDe({ ...PERFIL_POR_DEFECTO, zona: 'Villa Ballester, San Martín' })).toBe('Villa Ballester');
    expect(localidadDe({ ...PERFIL_POR_DEFECTO, zona: 'Villa Crespo' })).toBe('Villa Crespo');
  });

  it('sin zona, o con una zona en blanco, no inventa nada', () => {
    expect(localidadDe(PERFIL_POR_DEFECTO)).toBeNull();
    expect(localidadDe({ ...PERFIL_POR_DEFECTO, zona: '   ' })).toBeNull();
  });
});


/**
 * La marca `respaldo` es la que hace contestar 503 a las imágenes generadas
 * (ícono, tarjeta social) y tirar al manifest. Tiene que aparecer sólo cuando el backend no contestó, y
 * nunca venir del backend: si se colara en el camino feliz, saldrían
 * rotas siempre.
 */
describe('perfil — la marca de respaldo', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('un 503 del backend da el perfil de respaldo, marcado', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 503 })));
    await expect(perfil()).resolves.toMatchObject({ nombre: PERFIL_POR_DEFECTO.nombre, respaldo: true });
  });

  it('un corte de red, también', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('fetch failed'); }));
    await expect(perfil()).resolves.toMatchObject({ respaldo: true });
  });

  it('con el perfil real no hay marca, aunque el JSON del backend la traiga', async () => {
    const datos = { ...PERFIL_POR_DEFECTO, nombre: 'Autos Pérez', respaldo: true };
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(datos), { status: 200 })));
    const p = await perfil();
    expect(p.nombre).toBe('Autos Pérez');
    expect(p).not.toHaveProperty('respaldo');
  });
});

