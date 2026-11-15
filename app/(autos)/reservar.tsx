'use client';

import { useActionState, useState } from 'react';

import { pedirReserva, type EstadoReserva } from './reserva-accion';

const INICIAL: EstadoReserva = { error: null };

/**
 * «Reservalo con una seña» en la página del auto (13/11/2026). Pide lo mínimo
 * para guardar el auto a nombre de alguien; la seña se transfiere después,
 * desde la página de la reserva.
 */
export default function Reservar({ unidadId, sena, horas, dias, enCurso }: { unidadId: string; sena: string; horas: number; dias: number; enCurso: boolean }) {
  const [abierto, setAbierto] = useState(false);
  const [estado, enviar, enviando] = useActionState(pedirReserva, INICIAL);

  if (enCurso && !abierto) {
    return (
      <div className="au-reservar">
        <p className="au-reservar-nota">Alguien está reservando este auto ahora. Si no confirma la seña, vuelve a quedar libre.</p>
        <button type="button" className="au-enlace" onClick={() => setAbierto(true)}>Es mi reserva: quiero ver los datos</button>
      </div>
    );
  }
  if (!abierto) {
    return (
      <div className="au-reservar">
        <button type="button" className="au-boton" onClick={() => setAbierto(true)}>Reservalo con una seña de {sena}</button>
        <p className="au-reservar-nota">Te lo guardamos {dias} días. La seña se descuenta del precio.</p>
      </div>
    );
  }
  return (
    <form action={enviar} className="au-reservar au-reservar--abierto">
      <h2>Reservar este auto</h2>
      <p className="au-reservar-nota">Dejanos tus datos y te mostramos adónde transferir la seña de {sena}. Tenés {horas} horas; cuando la vemos acreditada, el auto queda a tu nombre por {dias} días.</p>
      <input type="hidden" name="unidad_id" value={unidadId} />
      <div className="au-trampa" aria-hidden="true">
        <label>No completar<input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <label>Nombre y apellido<input type="text" name="nombre" required minLength={2} maxLength={120} autoComplete="name" /></label>
      <label>Teléfono<input type="tel" name="telefono" required maxLength={40} autoComplete="tel" placeholder="11 5555 0100" /></label>
      <label>DNI (opcional)<input type="text" name="documento" inputMode="numeric" maxLength={20} /></label>
      {estado.error && <p className="au-consulta-error" role="alert">{estado.error}</p>}
      <button type="submit" className="au-boton" disabled={enviando}>{enviando ? 'Reservando…' : 'Continuar'}</button>
    </form>
  );
}
