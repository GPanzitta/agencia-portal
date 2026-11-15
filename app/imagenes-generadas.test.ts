import { afterEach, describe, expect, it, vi } from 'vitest';

import AppleIcon from './apple-icon';
import Icon from './icon';
import TarjetaSocial from './opengraph-image';
import { PERFIL_POR_DEFECTO } from './lib/perfil';

/**
 * Las tres imágenes que el portal DIBUJA: el ícono de la pestaña, el de iOS y
 * la tarjeta de WhatsApp.
 *
 * No hay mucho que afirmar sobre un PNG, pero sí las dos cosas que pueden
 * dejar al sitio con un ícono roto o ajeno sin que nadie se entere: que el
 * layout de `ImageResponse` esté bien armado (un `div` con dos hijos y sin
 * `display: flex` hace explotar el render, y recién se ve cuando alguien pide
 * /icon), y que con el backend caído NO se dibuje el de respaldo: quien pide
 * estas imágenes las guarda, así que lo que corresponde es un 503.
 */
const fetchReal = globalThis.fetch;
let backendCaido = false;

vi.stubGlobal('fetch', (entrada: RequestInfo | URL, init?: RequestInit) => {
  const url = String(entrada);
  // Sólo se simula el backend: lo que el renderizador pida para sí
  // (las fuentes) tiene que seguir andando.
  if (url.includes('/catalogo/')) {
    if (backendCaido || !url.includes('/catalogo/perfil')) return Promise.reject(new Error('backend caído'));
    const perfil = { ...PERFIL_POR_DEFECTO, nombre: 'Autos Pérez', color_acento: 'rojo' };
    return Promise.resolve(
      new Response(JSON.stringify(perfil), { status: 200, headers: { 'content-type': 'application/json' } }),
    );
  }
  return fetchReal(entrada, init);
});

afterEach(() => {
  backendCaido = false;
});

const FIRMA_PNG = [0x89, 0x50, 0x4e, 0x47];

describe.each([
  ['el ícono de la pestaña', Icon],
  ['el ícono de iOS', AppleIcon],
  ['la tarjeta de WhatsApp', TarjetaSocial],
])('%s', (_titulo, generar) => {
  it(
    'con el perfil de la agencia sale como PNG',
    async () => {
      const res = await generar();
      expect(res.status).toBe(200);
      const bytes = new Uint8Array(await res.arrayBuffer());
      expect([...bytes.slice(0, 4)]).toEqual(FIRMA_PNG);
      // Un PNG de cuatro bytes de contenido sería un cuadrado vacío.
      expect(bytes.byteLength).toBeGreaterThan(1000);
    },
    30_000,
  );

  it('con el backend caído contesta 503 y no dibuja un ícono ajeno que alguien guarde', async () => {
    backendCaido = true;
    const res = await generar();
    expect(res.status).toBe(503);
    expect(res.headers.get('Retry-After')).toBe('120');
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect((await res.arrayBuffer()).byteLength).toBe(0);
  });
});
