import { describe, expect, it, vi } from 'vitest';

vi.mock('next/headers', () => ({ headers: async () => { throw new Error('fuera de un pedido'); } }));

import { slugDelHost } from './agencia';
import { agenciaDelPedido, cabecerasDeAgencia } from './agencia-servidor';

describe('agencia del sitio', () => {
  it('lee la agencia de la primera parte del host', () => {
    expect(slugDelHost('perez.fgautos.com.ar', 'fgautos.com.ar')).toBe('perez');
    expect(slugDelHost('Perez-Autos.FGautos.com.ar:443', 'fgautos.com.ar')).toBe('perez-autos');
    expect(slugDelHost('demo.localhost:3201', 'localhost')).toBe('demo');
  });

  it('sin subdominio, con www o en otro dominio no hay agencia', () => {
    expect(slugDelHost('fgautos.com.ar', 'fgautos.com.ar')).toBeNull();
    expect(slugDelHost('www.fgautos.com.ar', 'fgautos.com.ar')).toBeNull();
    expect(slugDelHost('localhost:3201', 'localhost')).toBeNull();
    expect(slugDelHost('perez.otro.com', 'fgautos.com.ar')).toBeNull();
    expect(slugDelHost(null, 'localhost')).toBeNull();
  });

  it('no acepta subdominios anidados ni caracteres raros', () => {
    expect(slugDelHost('a.b.fgautos.com.ar', 'fgautos.com.ar')).toBeNull();
    expect(slugDelHost('per_ez.fgautos.com.ar', 'fgautos.com.ar')).toBeNull();
    expect(slugDelHost('-perez.fgautos.com.ar', 'fgautos.com.ar')).toBeNull();
  });

  it('fuera de un pedido no rompe: no hay agencia ni cabeceras', async () => {
    await expect(agenciaDelPedido()).resolves.toBeNull();
    await expect(cabecerasDeAgencia()).resolves.toEqual({});
  });
});
