import { describe, expect, it } from 'vitest';

import { acotarAnticipo, anticipoMinimo, cuota } from './financiacion';

describe('simulador de cuotas', () => {
  it('calcula la cuota fija del sistema francés', () => {
    // 10.000 a 12 meses con TNA 12% (1% mensual): 888,49.
    expect(cuota(10000, 12, 12)).toBe(888);
    expect(cuota(12000, 0, 12)).toBe(1000);
    expect(cuota(0, 30, 12)).toBe(0);
  });

  it('a más plazo, cuota más baja y más total pagado', () => {
    const corta = cuota(9000000, 60, 12);
    const larga = cuota(9000000, 60, 36);
    expect(larga).toBeLessThan(corta);
    expect(larga * 36).toBeGreaterThan(corta * 12);
  });

  it('acota el anticipo entre el mínimo y casi todo el precio', () => {
    const f = { anticipo_minimo_pct: 30, plazos: [12], tna: 40 };
    expect(anticipoMinimo(14800, f)).toBe(4440);
    expect(acotarAnticipo(1000, 14800, f)).toBe(4440);
    expect(acotarAnticipo(99999, 14800, f)).toBe(14799);
    expect(acotarAnticipo(Number.NaN, 14800, f)).toBe(4440);
  });
});
