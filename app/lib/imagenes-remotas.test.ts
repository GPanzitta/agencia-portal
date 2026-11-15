import { describe, expect, it } from 'vitest';
import { patronesDeImagenes } from './imagenes-remotas';

describe('patronesDeImagenes (SEG-POR-05)', () => {
  it('el backend con su puerto, y nada de comodines de Google ni YouTube', () => {
    const p = patronesDeImagenes('http://localhost:3100/api', {});
    expect(p[0]).toEqual({ protocol: 'http', hostname: 'localhost', port: '3100', pathname: '/**' });
    const hosts = p.map((x) => x.hostname);
    expect(hosts).toContain('lh3.googleusercontent.com');
    expect(hosts.some((h) => h.includes('*'))).toBe(false);
    expect(hosts).not.toContain('i.ytimg.com');
  });

  it('con CLOUDINARY_CLOUD_NAME, sólo la cuenta propia', () => {
    const nube = patronesDeImagenes('https://api.agencia.test/api', { CLOUDINARY_CLOUD_NAME: 'fgautos' })
      .find((x) => x.hostname === 'res.cloudinary.com');
    expect(nube?.pathname).toBe('/fgautos/**');
  });

  it('un cloud name raro se ignora (no arma un patrón roto)', () => {
    const nube = patronesDeImagenes('https://api.agencia.test/api', { CLOUDINARY_CLOUD_NAME: '../x' })
      .find((x) => x.hostname === 'res.cloudinary.com');
    expect(nube?.pathname).toBeUndefined();
  });
});
