import { describe, expect, it } from 'vitest';
import { cabecerasDePaginasConToken, cabecerasDeSeguridad, politicaDeContenido } from './cabeceras-seguridad';

const valor = (lista: { key: string; value: string }[], clave: string) => lista.find((c) => c.key === clave)?.value;

describe('cabecerasDeSeguridad (SEG-12)', () => {
  it('no se deja enmarcar, no adivina tipos y recorta el referer', () => {
    const c = cabecerasDeSeguridad('https://api.agencia.test', true);
    expect(valor(c, 'X-Frame-Options')).toBe('DENY');
    expect(valor(c, 'Content-Security-Policy')).toContain("frame-ancestors 'none'");
    expect(valor(c, 'X-Content-Type-Options')).toBe('nosniff');
    expect(valor(c, 'Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(valor(c, 'Permissions-Policy')).toContain('camera=()');
  });

  it('HSTS sólo en producción', () => {
    expect(valor(cabecerasDeSeguridad('https://api.agencia.test', true), 'Strict-Transport-Security')).toBe('max-age=31536000');
    expect(valor(cabecerasDeSeguridad('http://localhost:3100', false), 'Strict-Transport-Security')).toBeUndefined();
  });

  it('la CSP completa va en modo informe y deja pasar lo que usa el sitio', () => {
    const c = cabecerasDeSeguridad('https://api.agencia.test', true);
    const csp = valor(c, 'Content-Security-Policy-Report-Only')!;
    expect(csp).toContain('connect-src \'self\' https://api.agencia.test wss://api.agencia.test');
    expect(csp).toContain('https://www.google.com'); // mapa
    expect(csp).toContain('https://videos.pexels.com');
    expect(csp).toContain('https://res.cloudinary.com');
    expect(csp).toContain('https://*.tile.openstreetmap.org');
  });

  it("'unsafe-eval' sólo en desarrollo (lo pide React en dev)", () => {
    expect(politicaDeContenido('http://localhost:3100', false)).toContain("'unsafe-eval'");
    expect(politicaDeContenido('https://api.agencia.test', true)).not.toContain("'unsafe-eval'");
  });
});

describe('CSP lista para ser obligatoria (SEG-POR-06)', () => {
  it('con cspObligatoria la política completa se aplica y no queda la de informe', () => {
    const c = cabecerasDeSeguridad('https://api.agencia.test', true, { cspObligatoria: true });
    const csp = valor(c, 'Content-Security-Policy')!;
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(valor(c, 'Content-Security-Policy-Report-Only')).toBeUndefined();
  });

  it('sin la variable sigue como hasta ahora: mínima aplicada + completa en informe', () => {
    const c = cabecerasDeSeguridad('https://api.agencia.test', true);
    expect(valor(c, 'Content-Security-Policy')).toBe("frame-ancestors 'none'; object-src 'none'; base-uri 'self'");
    expect(valor(c, 'Content-Security-Policy-Report-Only')).toContain("default-src 'self'");
  });

  it('form-action deja ir a Mercado Pago: el checkout sin JS redirige al init_point', () => {
    expect(politicaDeContenido('https://api.agencia.test', true)).toMatch(/form-action 'self' https:\/\/www\.mercadopago\.com\.ar/);
  });

  it('upgrade-insecure-requests sólo en producción con el backend en https', () => {
    expect(politicaDeContenido('https://api.agencia.test', true)).toContain('upgrade-insecure-requests');
    expect(politicaDeContenido('http://localhost:3100', true)).not.toContain('upgrade-insecure-requests');
    expect(politicaDeContenido('https://api.agencia.test', false)).not.toContain('upgrade-insecure-requests');
  });
});

describe('cabecerasDePaginasConToken (SEG-POR-04)', () => {
  it('el token no viaja en el referer y la página no se indexa ni se archiva', () => {
    const c = cabecerasDePaginasConToken();
    expect(valor(c, 'Referrer-Policy')).toBe('no-referrer');
    expect(valor(c, 'X-Robots-Tag')).toContain('noindex');
    expect(valor(c, 'X-Robots-Tag')).toContain('noarchive');
  });
});
