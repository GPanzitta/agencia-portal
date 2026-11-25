'use client';

import { useActionState, useId, useState } from 'react';

import { acotarAnticipo, anticipoMinimo, cuota, type Financiacion } from '../lib/financiacion';
import { enviarConsulta, type EstadoConsulta } from './acciones';

const plata = (n: number, moneda: string) => `${moneda === 'USD' ? 'US$' : '$'} ${n.toLocaleString('es-AR')}`;
const INICIAL: EstadoConsulta = { enviada: false, error: null };

/**
 * Simulador de cuotas en la página de un auto (13/11/2026): el cliente mueve
 * el anticipo y el plazo, ve una cuota estimada con la tasa de la agencia y
 * puede pedir la precalificación crediticia con ese plan.
 */
export default function Simulador({
  unidadId,
  precio,
  moneda,
  financiacion,
}: {
  unidadId?: string;
  precio: number;
  moneda: string;
  financiacion: Financiacion;
}) {
  const campo = useId();
  const minimo = anticipoMinimo(precio, financiacion);
  const [escrito, setEscrito] = useState(String(minimo));
  const [meses, setMeses] = useState(financiacion.plazos[Math.min(1, financiacion.plazos.length - 1)]);
  const [pidiendo, setPidiendo] = useState(false);
  const [estado, enviar, enviando] = useActionState(enviarConsulta, INICIAL);

  const anticipo = acotarAnticipo(Number(escrito.replace(/[^0-9]/g, '')), precio, financiacion);
  const aFinanciar = precio - anticipo;
  const valor = cuota(aFinanciar, financiacion.tna, meses);

  const pedirPlan = (datos: FormData) => {
    const dni = String(datos.get('dni') ?? '').trim();
    const usado = String(datos.get('usado_anticipo') ?? '').trim();
    const resumen = [
      `Solicita financiación: anticipo de ${plata(anticipo, moneda)} + ${meses} cuotas de ${plata(valor, moneda)} (financia ${plata(aFinanciar, moneda)}, TNA ${financiacion.tna.toLocaleString('es-AR')}%)`,
      dni ? `DNI/CUIT: ${dni}` : null,
      usado ? `Usado en parte del anticipo: ${usado}` : null,
    ].filter(Boolean).join(' · ');
    datos.set('asunto', 'consulta');
    if (unidadId) datos.set('unidad_id', unidadId);
    datos.set('mensaje', resumen);
    return enviar(datos);
  };

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
          {!estado.enviada && !pidiendo && (
            <button type="button" className="au-boton" style={{ marginTop: '0.75rem' }} onClick={() => setPidiendo(true)}>
              Pedir este plan de cuotas
            </button>
          )}
        </div>
      </div>

      {estado.enviada && (
        <p className="au-consulta-ok" role="status">
          Recibimos tu solicitud de financiación ({meses} cuotas de {plata(valor, moneda)} con anticipo de {plata(anticipo, moneda)}). Te contactamos hoy mismo para precalificar.
        </p>
      )}

      {!estado.enviada && pidiendo && (
        <form action={pedirPlan} className="au-consulta" style={{ marginTop: '1rem' }}>
          <h3>Precalificá para este plan ({meses} cuotas de {plata(valor, moneda)})</h3>
          <div className="au-trampa" aria-hidden="true">
            <label>No completar<input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" /></label>
          </div>
          <label>Nombre y apellido<input type="text" name="nombre" required minLength={2} maxLength={120} autoComplete="name" /></label>
          <label>Teléfono / WhatsApp<input type="tel" name="telefono" required maxLength={40} autoComplete="tel" placeholder="11 5555 0100" /></label>
          <label>DNI o CUIT (opcional, agiliza la evaluación crediticia)<input type="text" name="dni" maxLength={20} inputMode="numeric" placeholder="20-12345678-9" /></label>
          <label>¿Entregás un usado como parte del anticipo? (opcional)<input type="text" name="usado_anticipo" maxLength={140} placeholder="Marca, modelo y año de tu usado" /></label>
          {estado.error && <p className="au-consulta-error" role="alert">{estado.error}</p>}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button type="submit" className="au-boton" disabled={enviando}>{enviando ? 'Enviando…' : 'Solicitar preaprobación'}</button>
            <button type="button" className="au-boton au-boton--linea" onClick={() => setPidiendo(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <p className="au-ayuda">Es una estimación para orientarte, no una oferta de crédito: la cuota final depende de la aprobación y puede sumar gastos, seguros e impuestos.</p>
    </section>
  );
}
