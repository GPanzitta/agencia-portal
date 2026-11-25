'use client';

import { useActionState, useState } from 'react';

import { enviarConsulta, type EstadoConsulta } from './acciones';

const INICIAL: EstadoConsulta = { enviada: false, error: null };

function manianaIso(): string {
  const d = new Date(Date.now() + 86_400_000);
  return d.toISOString().slice(0, 10);
}

/**
 * Agendador rápido de visita al salón o prueba de manejo (Test Drive) desde la
 * publicación de un auto. Entra al ERP directo en la columna «Visita».
 */
export default function AgendarVisita({ unidadId, titulo }: { unidadId: string; titulo: string }) {
  const [abierto, setAbierto] = useState(false);
  const [dia, setDia] = useState(manianaIso);
  const [franja, setFranja] = useState<'Mañana (9 a 13 h)' | 'Tarde (14 a 18 h)'>('Mañana (9 a 13 h)');
  const [testDrive, setTestDrive] = useState(true);
  const [estado, enviar, enviando] = useActionState(enviarConsulta, INICIAL);

  const enviarReservaVisita = (datos: FormData) => {
    const detalle = [
      `Horario preferido: ${franja}`,
      testDrive ? 'Quiere hacer prueba de manejo (Test Drive)' : 'Visita en salón',
    ].join(' · ');
    datos.set('asunto', 'visita');
    datos.set('unidad_id', unidadId);
    datos.set('dia_preferido', dia);
    datos.set('mensaje', detalle);
    return enviar(datos);
  };

  if (estado.enviada) {
    const fechaLegible = dia.split('-').reverse().join('/');
    return (
      <p className="au-consulta-ok" role="status" style={{ margin: 0 }}>
        Agendamos tu {testDrive ? 'visita y Test Drive' : 'visita'} para ver el <b>{titulo}</b> el <b>{fechaLegible}</b> ({franja}). Te confirmamos por WhatsApp.
      </p>
    );
  }

  if (!abierto) {
    return (
      <button type="button" className="au-boton" onClick={() => setAbierto(true)}>
        Agendar visita / Test Drive
      </button>
    );
  }

  return (
    <form action={enviarReservaVisita} className="au-reservar au-reservar--abierto">
      <h2>Agendar visita o Test Drive</h2>
      <p className="au-reservar-nota">Elegí qué día y en qué horario querés venir a ver y probar el {titulo}.</p>
      <div className="au-trampa" aria-hidden="true">
        <label>No completar<input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <label>
        Día de la visita
        <input type="date" name="dia_preferido" required min={new Date().toISOString().slice(0, 10)} value={dia} onChange={(e) => setDia(e.target.value)} />
      </label>
      <label>
        Franja horaria
        <select name="franja" value={franja} onChange={(e) => setFranja(e.target.value as typeof franja)}>
          <option value="Mañana (9 a 13 h)">Mañana (9 a 13 h)</option>
          <option value="Tarde (14 a 18 h)">Tarde (14 a 18 h)</option>
        </select>
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={testDrive}
          onChange={(e) => setTestDrive(e.target.checked)}
          style={{ width: '18px', height: '18px', minHeight: 0 }}
        />
        Quiero hacer una prueba de manejo (Test Drive)
      </label>
      <label>Nombre y apellido<input type="text" name="nombre" required minLength={2} maxLength={120} autoComplete="name" /></label>
      <label>Teléfono / WhatsApp<input type="tel" name="telefono" required maxLength={40} autoComplete="tel" placeholder="11 5555 0100" /></label>
      {estado.error && <p className="au-consulta-error" role="alert">{estado.error}</p>}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button type="submit" className="au-boton" disabled={enviando} style={{ flex: 1 }}>
          {enviando ? 'Agendando…' : 'Confirmar turno'}
        </button>
        <button type="button" className="au-boton au-boton--linea" onClick={() => setAbierto(false)} style={{ width: 'auto' }}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
