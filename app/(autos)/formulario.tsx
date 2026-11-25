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

const TIPOS_VEHICULO: [string, string][] = [
  ['Auto', 'Auto'],
  ['SUV / Camioneta', 'SUV / Camioneta'],
  ['Pickup', 'Pickup'],
  ['Utilitario', 'Utilitario'],
  ['Moto', 'Moto'],
  ['Otro', 'Otro'],
];

const CATALOGO_MARCAS_MODELOS: Record<string, string[]> = {
  Volkswagen: ['Amarok', 'Gol Trend', 'Golf', 'Nivus', 'Polo', 'Saveiro', 'Suran', 'T-Cross', 'Taos', 'Tiguan', 'Up!', 'Vento', 'Virtus', 'Voyage'],
  Toyota: ['Corolla', 'Corolla Cross', 'Etios', 'Hilux', 'RAV4', 'SW4', 'Yaris'],
  Ford: ['Bronco Sport', 'EcoSport', 'Fiesta Kinetic', 'Focus', 'Ka', 'Kuga', 'Maverick', 'Mondeo', 'Ranger', 'Territory'],
  Chevrolet: ['Cruze', 'Equinox', 'Onix', 'Prisma', 'S10', 'Spin', 'Tracker', 'Trailblazer'],
  Peugeot: ['208', '2008', '308', '3008', '408', '5008', 'Partner'],
  Fiat: ['Argo', 'Cronos', 'Fastback', 'Fiorino', 'Mobi', 'Palio', 'Pulse', 'Siena', 'Strada', 'Toro', 'Uno'],
  Renault: ['Alaskan', 'Captur', 'Clio', 'Duster', 'Kangoo', 'Kardian', 'Kwid', 'Logan', 'Oroch', 'Sandero', 'Stepway'],
  'Citroën': ['Berlingo', 'C3', 'C3 Aircross', 'C4 Cactus', 'C4 Lounge', 'C5 Aircross'],
  Jeep: ['Compass', 'Commander', 'Grand Cherokee', 'Renegade', 'Wrangler'],
  Nissan: ['Frontier', 'Kicks', 'March', 'Note', 'Sentra', 'Versa', 'X-Trail'],
  Honda: ['City', 'Civic', 'CR-V', 'Fit', 'HR-V', 'WR-V', 'ZR-V'],
};

function estimarAnioPorPatente(patente: string): number | null {
  const p = (patente ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (/^[A-Z]{2}[0-9]{3}[A-Z]{0,2}$/.test(p)) {
    const pref = p.slice(0, 2);
    const num = Number(p.slice(2, 5));
    if (pref === 'AA') return 2016;
    if (pref === 'AB') return 2017;
    if (pref === 'AC') return 2018;
    if (pref === 'AD') return num >= 500 ? 2020 : 2019;
    if (pref === 'AE') return num >= 350 ? 2021 : 2020;
    if (pref === 'AF') return num < 200 ? 2021 : num >= 850 ? 2023 : 2022;
    if (pref === 'AG') return num < 350 ? 2023 : 2024;
    if (pref === 'AH') return num >= 450 ? 2026 : 2025;
  }
  if (/^[A-Z]{3}[0-9]{3}$/.test(p)) {
    const mapa: Record<string, number> = {
      A: 1996, B: 1998, C: 1999, D: 2001, E: 2004, F: 2006, G: 2007,
      H: 2008, I: 2010, J: 2011, K: 2011, L: 2012, M: 2013, N: 2014, O: 2015, P: 2015,
    };
    return mapa[p[0]] ?? null;
  }
  return null;
}

const RADICACIONES: string[] = [
  'Ciudad Autónoma de Buenos Aires',
  'Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
];

const PREGUNTAS_GUIA: { clave: string; pregunta: string; tipo?: 'date' | 'textarea'; placeholder: string }[] = [
  {
    clave: 'guia_uso',
    pregunta: '¿Qué tipo de uso se le dio al auto?',
    placeholder: 'Ej: Uso diario, de fin de semana, solo viajes, uso profesional...',
  },
  {
    clave: 'guia_guardado',
    pregunta: '¿Se guardó en cochera o en la calle?',
    placeholder: 'Ej: cochera techada, cochera a la intemperie, calle, etc.',
  },
  {
    clave: 'guia_motivo_venta',
    pregunta: '¿Por qué lo vendés?',
    placeholder: 'Ej: cambio por uno nuevo, necesito la plata, no lo uso lo suficiente, etc.',
  },
  {
    clave: 'guia_ultimo_service',
    pregunta: 'Fecha del último service',
    tipo: 'date',
    placeholder: 'dd/mm/aaaa',
  },
  {
    clave: 'guia_ultima_vtv',
    pregunta: 'Fecha de la última VTV',
    tipo: 'date',
    placeholder: 'dd/mm/aaaa',
  },
  {
    clave: 'guia_mantenimiento',
    pregunta: 'Describí el mantenimiento realizado',
    placeholder: 'Ej: cambio de aceite y filtros, correa de distribución, pastillas de freno...',
  },
  {
    clave: 'guia_neumaticos',
    pregunta: '¿Cuál es el estado de los neumáticos?',
    placeholder: 'Fecha de colocación, fecha de vencimiento, kilómetros recorridos, etc.',
  },
  {
    clave: 'guia_transferencia',
    pregunta: '¿Está listo para transferir?',
    placeholder: 'Estado de los trámites pre venta: policial, si tiene 08 firmado, estado de multas y pago de patente...',
  },
  {
    clave: 'guia_agregados',
    pregunta: '¿Tiene agregados?',
    placeholder: 'Ej: llantas, equipo de audio, iluminación, pantalla, reprogramación, escape, etc.',
  },
  {
    clave: 'guia_paneles_choques',
    pregunta: '¿Tiene paneles repintados? ¿Tuvo choques?',
    placeholder: 'Es importante ser sinceros sobre el historial del auto.',
  },
  {
    clave: 'guia_reparaciones',
    pregunta: '¿Tuvo reparaciones importantes?',
    placeholder: 'Ej: mejoras por defectos de fábrica, rectificación, cambio de embrague, arreglos en la caja, etc.',
  },
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
  const [modoDescripcion, setModoDescripcion] = useState<'libre' | 'guiada'>('guiada');
  const [marcaElegida, setMarcaElegida] = useState('');
  const [anioAuto, setAnioAuto] = useState('');
  const modelosDeLaMarca = Object.entries(CATALOGO_MARCAS_MODELOS).find(([m]) => m.toLowerCase() === marcaElegida.trim().toLowerCase())?.[1] ?? [];
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
        <>
          <fieldset className="au-vender-seccion">
            <legend>Datos del vehículo</legend>
            <label>
              <span>Tipo de vehículo</span>
              <select name="usado_tipo" defaultValue="Auto">
                {TIPOS_VEHICULO.map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
              </select>
            </label>
            <label>
              <span>Patente</span>
              <input
                type="text"
                name="usado_patente"
                maxLength={12}
                placeholder="AE852RA"
                style={{ textTransform: 'uppercase' }}
                onChange={(e) => {
                  const est = estimarAnioPorPatente(e.target.value);
                  if (est && !anioAuto) setAnioAuto(String(est));
                }}
              />
            </label>
            <label>
              <span>Año</span>
              <input type="text" name="usado_anio" required inputMode="numeric" maxLength={4} placeholder="2021" value={anioAuto} onChange={(e) => setAnioAuto(e.target.value)} />
            </label>
            <label>
              <span>Marca</span>
              <input type="text" name="usado_marca" list="portal-marcas" required maxLength={40} placeholder="Volkswagen" value={marcaElegida} onChange={(e) => setMarcaElegida(e.target.value)} />
            </label>
            <label>
              <span>Modelo</span>
              <input type="text" name="usado_modelo" list="portal-modelos" required maxLength={60} placeholder="Nivus" />
            </label>
            <datalist id="portal-marcas">
              {Object.keys(CATALOGO_MARCAS_MODELOS).map((m) => <option key={m} value={m} />)}
            </datalist>
            <datalist id="portal-modelos">
              {modelosDeLaMarca.map((mod) => <option key={mod} value={mod} />)}
            </datalist>
            <label>
              <span>Versión</span>
              <input type="text" name="usado_version" maxLength={80} placeholder="Hero 200 TSI AT 5P" />
            </label>
            <label>
              <span>Kilometraje</span>
              <input type="text" name="usado_km" required inputMode="numeric" maxLength={9} placeholder="50000" />
            </label>
            <label>
              <span>Combustible <small className="au-opcional">Opcional</small></span>
              <select name="usado_combustible" defaultValue="">
                <option value="">Elegí</option>
                <option value="nafta">Nafta</option>
                <option value="diesel">Diésel</option>
                <option value="gnc">Nafta y GNC</option>
                <option value="hibrido">Híbrido</option>
                <option value="electrico">Eléctrico</option>
              </select>
            </label>
            <label>
              <span>Caja <small className="au-opcional">Opcional</small></span>
              <select name="usado_caja" defaultValue="">
                <option value="">Elegí</option>
                <option value="manual">Manual</option>
                <option value="automatica">Automática</option>
              </select>
            </label>
          </fieldset>

          <fieldset className="au-vender-seccion">
            <legend>Seguro, patente y radicación</legend>
            <label>
              <span>Cuota mensual del seguro <small className="au-opcional">Opcional</small></span>
              <input type="text" name="usado_seguro_cuota" inputMode="numeric" maxLength={12} placeholder="50000" />
            </label>
            <label>
              <span>Tipo de cobertura <small className="au-opcional">Opcional</small></span>
              <input type="text" name="usado_seguro_cobertura" maxLength={60} placeholder="Todo riesgo / Terceros completo / Total" />
            </label>
            <label>
              <span>Compañía de seguro <small className="au-opcional">Opcional</small></span>
              <input type="text" name="usado_seguro_compania" maxLength={60} placeholder="Sancor" />
            </label>
            <label>
              <span>Costo patente <small className="au-opcional">Opcional</small></span>
              <input type="text" name="usado_costo_patente" inputMode="numeric" maxLength={12} placeholder="150000" />
            </label>
            <label className="au-campo-ancho">
              <span>Radicación <small className="au-opcional">Opcional</small></span>
              <select name="usado_radicacion" defaultValue="">
                <option value="">Seleccioná dónde está radicado</option>
                {RADICACIONES.map((prov) => <option key={prov} value={prov}>{prov}</option>)}
              </select>
            </label>
          </fieldset>
        </>
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

      {modo === 'vender' ? (
        <div className="au-descripcion-bloque">
          <div className="au-descripcion-cab">
            <h3>Descripción</h3>
            <input type="hidden" name="modo_descripcion" value={modoDescripcion} />
            <div className="au-switch-desc" role="tablist" aria-label="Modo de descripción">
              <button
                type="button"
                role="tab"
                aria-selected={modoDescripcion === 'libre'}
                className={modoDescripcion === 'libre' ? 'activo' : undefined}
                onClick={() => setModoDescripcion('libre')}
              >
                Texto libre
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={modoDescripcion === 'guiada'}
                className={modoDescripcion === 'guiada' ? 'activo' : undefined}
                onClick={() => setModoDescripcion('guiada')}
              >
                ✨ Guiada
              </button>
            </div>
          </div>

          <div className="au-guia" hidden={modoDescripcion !== 'guiada'}>
            <p className="au-guia-banner">
              Todas las preguntas de la guía son opcionales, pero cada una de ellas es muy importante para lograr la mejor descripción posible.
            </p>
            {PREGUNTAS_GUIA.map((item) => (
              <label key={item.clave}>
                <span>{item.pregunta}</span>
                {item.tipo === 'date' ? (
                  <input type="date" name={item.clave} placeholder={item.placeholder} />
                ) : (
                  <textarea name={item.clave} rows={3} maxLength={500} placeholder={item.placeholder} />
                )}
              </label>
            ))}
          </div>

          <div className="au-libre" hidden={modoDescripcion !== 'libre'}>
            <label>
              <span>Contanos sobre tu auto <small className="au-opcional">Opcional</small></span>
              <textarea name="mensaje" rows={5} maxLength={2000} placeholder={t.mensaje} />
            </label>
          </div>
        </div>
      ) : (
        <label>Mensaje (opcional)
          <textarea name="mensaje" rows={3} maxLength={1000} placeholder={t.mensaje} /></label>
      )}

      <label>Nombre<input type="text" name="nombre" required minLength={2} maxLength={120} autoComplete="name" /></label>
      <label>Teléfono<input type="tel" name="telefono" required maxLength={40} autoComplete="tel" placeholder="11 5555 0100" /></label>
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
