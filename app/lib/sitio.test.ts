import { afterEach, describe, expect, it, vi } from 'vitest';

describe('SITIO', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  /** Se lee al importar el módulo, así que hay que reimportarlo por caso. */
  async function conSitio(valor: string) {
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', valor);
    return import('./sitio');
  }

  it('saca la barra final, que duplicaría la de cada URL del sitemap', async () => {
    const { SITIO, urlDe } = await conSitio('https://agencias.example.com/');
    expect(SITIO).toBe('https://agencias.example.com');
    expect(urlDe('/sitemap.xml')).toBe('https://agencias.example.com/sitemap.xml');
  });

  it('host pelado: le pone https, porque `new URL()` sin esquema revienta', async () => {
    const { SITIO } = await conSitio('agencias.example.com');
    expect(SITIO).toBe('https://agencias.example.com');
    expect(() => new URL(SITIO)).not.toThrow();
  });

  it('vacío fuera de producción: cae a localhost y `next dev` sigue andando', async () => {
    const { SITIO } = await conSitio('');
    expect(SITIO).toBe('http://localhost:3201');
  });

  it('las fotos absolutas van tal cual y las relativas cuelgan del sitio', async () => {
    const { urlAbsolutaDeFoto } = await conSitio('https://agencias.example.com');
    expect(urlAbsolutaDeFoto(null)).toBeNull();
    expect(urlAbsolutaDeFoto('https://res.cloudinary.com/x/a.jpg')).toBe('https://res.cloudinary.com/x/a.jpg');
    expect(urlAbsolutaDeFoto('/uploads/a.jpg')).toBe('https://agencias.example.com/uploads/a.jpg');
  });
});
