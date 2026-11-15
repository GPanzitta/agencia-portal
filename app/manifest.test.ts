import { afterEach, describe, expect, it, vi } from 'vitest';

import manifest from './manifest';
import { PERFIL_POR_DEFECTO } from './lib/perfil';

/**
 * El manifest es lo que queda guardado cuando el cliente instala el sitio en
 * la pantalla de inicio: el `short_name` es el rótulo que va a leer cada vez
 * que vuelva, y con el backend caído no se puede guardar el genérico.
 */
let respuesta: () => Promise<Response> = () => Promise.reject(new Error('backend caído'));

vi.stubGlobal('fetch', () => respuesta());

function conNombre(nombre: string) {
  respuesta = () =>
    Promise.resolve(
      new Response(JSON.stringify({ ...PERFIL_POR_DEFECTO, nombre }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
}

afterEach(() => {
  respuesta = () => Promise.reject(new Error('backend caído'));
});

describe('manifest — el rótulo del ícono', () => {
  it('un nombre corto va entero', async () => {
    conNombre('Autos Sur');
    expect(await manifest()).toMatchObject({ name: 'Autos Sur', short_name: 'Autos Sur' });
  });

  it('uno largo no se corta por palabras: sin short_name, el sistema recorta name desde el final', async () => {
    conNombre('La Casa del Lavarropas');
    const m = await manifest();
    expect(m.name).toBe('La Casa del Lavarropas');
    expect(m).not.toHaveProperty('short_name');
  });

  it('con el backend caído no sale el manifest de respaldo', async () => {
    await expect(manifest()).rejects.toThrow(/no servimos el manifest de respaldo/);
  });
});
