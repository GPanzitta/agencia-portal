import { describe, expect, it } from 'vitest';

import robots from './robots';

describe('robots.txt', () => {
  // `rules` es un array; el sitio declara una sola regla, para todos los bots.
  const regla = () => (robots().rules as { allow?: string; disallow?: string[] }[])[0];

  it('bloquea las páginas con token, que no se descubren por un enlace', () => {
    expect(regla().disallow).toEqual(['/reserva/']);
  });

  it('deja rastrear el resto y declara el sitemap', () => {
    expect(regla().allow).toBe('/');
    expect(robots().sitemap).toMatch(/\/sitemap\.xml$/);
  });
});
