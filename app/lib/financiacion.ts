/**
 * El simulador de cuotas del sitio (13/11/2026). Cuenta pura: sistema francés
 * (cuota fija) con la tasa nominal anual que cargó la agencia. Es una
 * estimación para orientar al cliente, no una oferta de crédito.
 */
export interface Financiacion {
  anticipo_minimo_pct: number;
  plazos: number[];
  /** Tasa nominal anual, en porcentaje. */
  tna: number;
}

/** La cuota mensual fija por financiar `monto` en `meses`. Con tasa 0 es el monto repartido. */
export function cuota(monto: number, tna: number, meses: number): number {
  if (!(monto > 0) || !(meses > 0)) return 0;
  const i = tna / 100 / 12;
  if (i <= 0) return Math.round(monto / meses);
  return Math.round((monto * i) / (1 - Math.pow(1 + i, -meses)));
}

/** El anticipo más chico que acepta la agencia para este precio. */
export function anticipoMinimo(precio: number, f: Financiacion): number {
  return Math.ceil((precio * f.anticipo_minimo_pct) / 100);
}

/** Deja el anticipo dentro de lo posible: entre el mínimo y casi todo el precio. */
export function acotarAnticipo(anticipo: number, precio: number, f: Financiacion): number {
  const minimo = anticipoMinimo(precio, f);
  if (!Number.isFinite(anticipo)) return minimo;
  return Math.min(Math.max(Math.round(anticipo), minimo), Math.max(minimo, precio - 1));
}
