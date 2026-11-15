'use client';

import { useActionState, useState } from 'react';

import { enviarConsulta, type EstadoConsulta } from './acciones';
import Fotos, { type FotoLista } from './fotos';

const INICIAL: EstadoConsulta = { enviada: false, error: null };

type Modo = 'consulta' | 'vender' | 'contacto' | 'aviso';

const TIPOS: [string, string][] = [
  ['sedan', 'Sedán'], ['hatchback', 'Hatchback'], ['suv', 'SUV'], ['pickup', 'Pickup'], ['coupe', 'Coupé'],
  ['rural', 'Rural'], ['monovolumen', 'Monovolumen'], ['utilitario', 'Utilitario'], ['moto', 'Moto'],
];

const TEXTOS: Record<Modo, { titulo: string; boton: string; mensaje: string; listo: string }> = {
  consulta: {
    titulo: 'Consultar por este auto',
    boton: 'Enviar consulta',
    mensaje: '¿Toman un usado? ¿Se puede financiar?',
    listo: 'Te contestamos hoy mismo al teléfono que nos dejaste.',
  },
  vender: {
    titulo: 'Pedí tu cotización',
    boton: 'Pedir cotización',
    mensaje: 'Único dueño, service al día, algún detalle de chapa…',
    listo: 'Lo miramos y te pasamos la cotización al teléfono que nos dejaste.',
  },
  aviso: {
    titulo: 'Te avisamos cuando entre',
    boton: 'Avisarme',
    mensaje: 'Automático, pocos kilómetros, para la familia…',
    listo: 'Apenas entre un auto así te escribimos al teléfono que nos dejaste.',
  },
  contacto: {
    titulo: 'Escribinos',
    boton: 'Enviar',
    mensaje: 'Contanos qué estás buscando',
    listo: 'Te contestamos al teléfono que nos dejaste.',
  },
};

/**
 * El formulario del sitio. Según el modo consulta por un auto, ofrece el propio
 * o deja un contacto: en los tres casos llega al ERP como un interesado.
 */
export default function Formulario({ modo, unidadId, sobre, marca, tipo, intencion }: { modo: Modo; unidadId?: string; sobre?: string; marca?: string; tipo?: string; intencion?: 'vender' | 'entregar' | 'consignar' }) {
  const [estado, enviar, enviando] = useActionState(enviarConsulta, INICIAL);
  const t = TEXTOS[modo];
  const [fotos, setFotos] = useState<FotoLista[]>([]);
  const [preparando, setPreparando] = useState(false);
  // Las fotos viajan ya achicadas: se suman a los datos del formulario al enviar.
  const enviarConFotos = (datos: FormData) => {
    fotos.forEach((f, i) => datos.append('fotos', f.blob, `foto-${i + 1}.jpg`));
    return enviar(datos);
  };

  if (estado.enviada) {
    return (
      <p className="au-consulta-ok" role="status">
        Recibimos tu {modo === 'vender' ? 'pedido de cotización' : modo === 'aviso' ? 'pedido' : 'consulta'}{sobre && modo !== 'vender' ? ` por el ${sobre}` : ''}. {t.listo}
      </p>
    );
  }

  return (
    <form action={enviarConFotos} className="au-consulta">
      <h2>{t.titulo}</h2>
      <input type="hidden" name="asunto" value={modo} />
      {unidadId && <input type="hidden" name="unidad_id" value={unidadId} />}
      {/* Trampa para bots: fuera de la vista y del orden de tabulación. */}
      <div className="au-trampa" aria-hidden="true">
        <label>No completar<input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" /></label>
      </div>
      {modo === 'vender' && (
        <fieldset>
          <legend>Tu auto</legend>
          <label>Marca<input type="text" name="usado_marca" required maxLength={40} placeholder="Volkswagen" /></label>
          <label>Modelo<input type="text" name="usado_modelo" required maxLength={60} placeholder="Gol Trend" /></label>
          <label>Versión (opcional)<input type="text" name="usado_version" maxLength={60} placeholder="1.6 Trendline" /></label>
          <label>Año<input type="text" name="usado_anio" required inputMode="numeric" maxLength={4} placeholder="2018" /></label>
          <label>Kilómetros<input type="text" name="usado_km" required inputMode="numeric" maxLength={9} placeholder="90.000" /></label>
          <label>Combustible
            <select name="usado_combustible" defaultValue="">
              <option value="">Elegí</option>
              <option value="nafta">Nafta</option>
              <option value="diesel">Diésel</option>
              <option value="gnc">Nafta y GNC</option>
              <option value="hibrido">Híbrido</option>
              <option value="electrico">Eléctrico</option>
            </select></label>
          <label>Caja
            <select name="usado_caja" defaultValue="">
              <option value="">Elegí</option>
              <option value="manual">Manual</option>
              <option value="automatica">Automática</option>
            </select></label>
          <label>Estado general
            <select name="usado_estado" defaultValue="">
              <option value="">Elegí</option>
              <option value="excelente">Excelente</option>
              <option value="bueno">Bueno</option>
              <option value="regular">Regular, tiene detalles</option>
              <option value="a reparar">Para reparar</option>
            </select></label>
        </fieldset>
      )}
      {/* Si el motivo ya se eligió afuera (el cotizador), viaja escondido; si no, se pregunta acá. */}
      {modo === 'vender' && intencion && <input type="hidden" name="intencion" value={intencion} />}
      {modo === 'vender' && !intencion && (
        <fieldset className="au-opciones">
          <legend>¿Qué querés hacer con tu auto?</legend>
          <label><input type="radio" name="intencion" value="entregar" defaultChecked={!!unidadId} required />Entregarlo en parte de pago</label>
          <label><input type="radio" name="intencion" value="vender" defaultChecked={!unidadId} />Venderlo</label>
        </fieldset>
      )}
      {modo === 'aviso' && (
        <fieldset>
          <legend>Qué estás buscando</legend>
          <label>Marca (opcional)<input type="text" name="busca_marca" maxLength={60} defaultValue={marca ?? ''} placeholder="Toyota" /></label>
          <label>Tipo
            <select name="busca_carroceria" defaultValue={tipo ?? ''}>
              <option value="">Cualquiera</option>
              {TIPOS.map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
            </select></label>
          <label>Hasta cuánto (opcional)<input type="text" name="precio_max" inputMode="numeric" maxLength={14} placeholder="15.000" /></label>
          <label>Moneda
            <select name="precio_moneda" defaultValue="USD">
              <option value="USD">Dólares</option>
              <option value="ARS">Pesos</option>
            </select></label>
        </fieldset>
      )}
      <label>Nombre<input type="text" name="nombre" required minLength={2} maxLength={120} autoComplete="name" /></label>
      <label>Teléfono<input type="tel" name="telefono" required maxLength={40} autoComplete="tel" placeholder="11 5555 0100" /></label>
      <label>{modo === 'vender' ? 'Algo más que quieras contarnos (opcional)' : 'Mensaje (opcional)'}
        <textarea name="mensaje" rows={3} maxLength={1000} placeholder={t.mensaje} /></label>
      {modo === 'consulta' && unidadId && (
        <label>¿Querés venir a verlo? Elegí un día (opcional)
          <input type="date" name="dia_preferido" /></label>
      )}
      {modo === 'vender' && <Fotos fotos={fotos} onCambio={setFotos} onPreparando={setPreparando} />}
      {estado.error && <p className="au-consulta-error" role="alert">{estado.error}</p>}
      <button type="submit" className="au-boton" disabled={enviando || preparando}>{enviando ? 'Enviando…' : t.boton}</button>
    </form>
  );
}
