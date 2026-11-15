import { describe, expect, it } from 'vitest';

import { esNavegacionInterna } from './indicador-de-navegacion';

const toque = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false };
const enlace = (href: string, extra: { target?: string; download?: boolean } = {}) => ({
  href,
  target: extra.target ?? '',
  hasAttribute: (n: string) => n === 'download' && !!extra.download,
});
const AQUI = 'http://localhost:3201/autos';

describe('esNavegacionInterna (POR-03)', () => {
  it('un auto o un filtro del mismo sitio: sí', () => {
    expect(esNavegacionInterna(toque, enlace('/p/correa-1270'), AQUI)).toBe(true);
    expect(esNavegacionInterna(toque, enlace('/autos?marca=ford'), AQUI)).toBe(true);
  });

  it('afuera, en otra pestaña, con modificador, descarga o ancla: no', () => {
    expect(esNavegacionInterna(toque, enlace('https://wa.me/549113'), AQUI)).toBe(false);
    expect(esNavegacionInterna(toque, enlace('/p/x', { target: '_blank' }), AQUI)).toBe(false);
    expect(esNavegacionInterna({ ...toque, ctrlKey: true }, enlace('/p/x'), AQUI)).toBe(false);
    expect(esNavegacionInterna(toque, enlace('/factura.pdf', { download: true }), AQUI)).toBe(false);
    expect(esNavegacionInterna(toque, enlace('/autos#filtros'), AQUI)).toBe(false);
    expect(esNavegacionInterna({ ...toque, button: 1 }, enlace('/p/x'), AQUI)).toBe(false);
    expect(esNavegacionInterna(toque, null, AQUI)).toBe(false);
  });
});
