'use client';

import { useId, useState } from 'react';

import { acotarAnticipo, anticipoMinimo, cuota, type Financiacion } from '../lib/financiacion';

const plata = (n: number, moneda: string) => `${moneda === 'USD' ? 'US$' : '$'} ${n.toLocaleString('es-AR')}`;

/**
 * Simulador de cuotas en la página de un auto (13/11/2026): el cliente mueve
 * el anticipo y el plazo y ve una cuota estimada con la tasa de la agencia.
 */
export default function Simulador({ precio, moneda, financiacion }: { precio: number; moneda: string; financiacion: Financiacion }) {
  const campo = useId();
  const minimo = anticipoMinimo(precio, financiacion);
  const [escrito, setEscrito] = useState(String(minimo));
  const [meses, setMeses] = useState(financiacion.plazos[Math.min(1, financiacion.plazos.length - 1)]);
  const anticipo = acotarAnticipo(Number(escrito.replace(/[^0-9]/g, '')), precio, financiacion);
  const aFinanciar = precio - anticipo;
  const valor = cuota(aFinanciar, financiacion.tna, meses);

  return (
    <section className="au-datos au-simulador" aria-labelledby={`${campo}-t`}>
      <h2 id={`${campo}-t`}>Simulá tus cuotas</h2>
      <div className="au-simulador-cuerpo">
        <div className="au-simulador-campos">
          <label htmlFor={`${campo}-a`}>Anticipo ({moneda === 'USD' ? 'dólares' : 'pesos'})
            <input id={`${campo}-a`} type="text" inputMode="numeric" value={escrito} maxLength={14}
              onChange={(e) => setEscrito(e.target.value)} onBlur={() => setEscrito(String(anticipo))} />
            <small>Mínimo {plata(minimo, moneda)}{financiacion.anticipo_minimo_pct ? ` (${financiacion.anticipo_minimo_pct}% del precio)` : ''}.</small>
          </label>
          <fieldset>
            <legend>Plazo</legend>
            {financiacion.plazos.map((p) => (
              <label key={p} className={p === meses ? 'activo' : undefined}>
                <input type="radio" name={`${campo}-p`} value={p} checked={p === meses} onChange={() => setMeses(p)} />{p} meses
              </label>
            ))}
          </fieldset>
        </div>
        <div className="au-simulador-resultado" role="status">
          <span>{meses} cuotas fijas de</span>
          <b>{plata(valor, moneda)}</b>
          <span>Financiás {plata(aFinanciar, moneda)} · TNA {financiacion.tna.toLocaleString('es-AR')}%</span>
        </div>
      </div>
      <p className="au-ayuda">Es una estimación para orientarte, no una oferta de crédito: la cuota final depende de la aprobación y puede sumar gastos, seguros e impuestos.</p>
    </section>
  );
}
