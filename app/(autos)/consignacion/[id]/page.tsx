import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { cabecerasDeAgencia } from '../../../lib/agencia-servidor';
import { precio } from '../../../lib/autos';
import { perfil } from '../../../lib/perfil';
import { diaLegible } from '../../../lib/reserva';
import { whatsappArgentino } from '../../../lib/whatsapp';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Seguimiento de tu auto en consignación',
  robots: { index: false, follow: false },
};

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3200/api';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface VistaConsignacion {
  id: string;
  numero: string;
  titulo: string;
  marca: string;
  modelo: string;
  version: string | null;
  anio: number;
  km: number;
  dominio: string | null;
  estado: 'ingreso' | 'alistaje' | 'disponible' | 'reservada' | 'vendida' | 'devuelta' | 'baja';
  publicada: boolean;
  ubicacion: string | null;
  moneda: 'ARS' | 'USD';
  precio_piso: number | null;
  precio_publicado: number | null;
  total_gastos: number;
  neto_estimado: number | null;
  dias_en_gestion: number;
  fecha_ingreso: string;
  fecha_venta: string | null;
  titular_nombre: string | null;
  portada: string | null;
  papeles: { tipo: string; nombre: string; estado: 'falta' | 'en_tramite' | 'ok' }[];
  actividad: {
    consultas_directas: number;
    compradores_en_cartera: number;
  };
}

async function obtenerConsignacion(id: string): Promise<VistaConsignacion | null> {
  if (!UUID.test(id)) return null;
  try {
    const res = await fetch(`${API}/catalogo/consignacion/${id}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
      headers: await cabecerasDeAgencia(),
    });
    if (!res.ok) return null;
    return (await res.json()) as VistaConsignacion;
  } catch {
    return null;
  }
}

const ROTULO_ESTADO: Record<VistaConsignacion['estado'], { texto: string; tono: 'pendiente' | 'confirmada' | 'vencida' }> = {
  ingreso: { texto: 'Recién ingresado · En recepción', tono: 'pendiente' },
  alistaje: { texto: 'En preparación y alistaje', tono: 'pendiente' },
  disponible: { texto: 'Disponible para la venta', tono: 'confirmada' },
  reservada: { texto: '¡Reservado con seña!', tono: 'confirmada' },
  vendida: { texto: '¡Vendido! Listo para liquidar', tono: 'confirmada' },
  devuelta: { texto: 'Retirado por el propietario', tono: 'vencida' },
  baja: { texto: 'Fuera de stock', tono: 'vencida' },
};

const ROTULO_PAPEL = {
  ok: 'Al día',
  en_tramite: 'En trámite',
  falta: 'Pendiente',
} as const;

type Props = { params: Promise<{ id: string }> };

export default async function SeguimientoConsignacionPage({ params }: Props) {
  const { id } = await params;
  const [c, p] = await Promise.all([obtenerConsignacion(id), perfil()]);
  if (!c) notFound();

  const estado = ROTULO_ESTADO[c.estado] ?? ROTULO_ESTADO.ingreso;
  const numero = whatsappArgentino(p.whatsapp ?? p.telefono);
  const wa = numero
    ? `https://wa.me/${numero}?text=${encodeURIComponent(`Hola, soy ${c.titular_nombre || 'el dueño'} del ${c.titulo} (${c.numero}) en consignación. Quería consultar cómo viene la venta.`)}`
    : null;

  return (
    <article className="au-reserva" style={{ maxWidth: '680px' }}>
      <p className="au-reserva-estado" data-estado={estado.tono}>
        {estado.texto}
      </p>
      <h1>{c.titulo} {c.anio}</h1>
      <p className="au-reservar-nota">
        Unidad <b>{c.numero}</b>
        {c.dominio ? <> · Patente <b>{c.dominio}</b></> : null}
        {' · '}{c.km.toLocaleString('es-AR')} km
        {c.ubicacion ? <> · Ubicación: <b>{c.ubicacion}</b></> : null}
      </p>

      {/* Actividad comercial */}
      <section className="au-bloque">
        <h2>Actividad comercial en vivo</h2>
        <dl className="au-reserva-datos">
          <div>
            <dt>Estado en el sitio web</dt>
            <dd>{c.publicada ? 'Publicado y visible en el catálogo' : 'En preparación interna'}</dd>
          </div>
          <div>
            <dt>Interesados que consultaron por tu auto</dt>
            <dd>{c.actividad.consultas_directas} {c.actividad.consultas_directas === 1 ? 'consulta recibida' : 'consultas recibidas'}</dd>
          </div>
          <div>
            <dt>Compradores en cartera que buscan este perfil</dt>
            <dd>{c.actividad.compradores_en_cartera} {c.actividad.compradores_en_cartera === 1 ? 'interesado activo' : 'interesados activos'}</dd>
          </div>
          <div>
            <dt>Tiempo en gestión</dt>
            <dd>{c.dias_en_gestion} {c.dias_en_gestion === 1 ? 'día' : 'días'} (ingresó el {diaLegible(c.fecha_ingreso)})</dd>
          </div>
        </dl>
      </section>

      {/* Números acordados */}
      <section className="au-bloque">
        <h2>Valores de la consignación</h2>
        <dl className="au-reserva-datos">
          <div>
            <dt>Precio publicado de venta</dt>
            <dd>{c.precio_publicado !== null ? precio({ precio: c.precio_publicado, moneda: c.moneda }) : 'A definir'}</dd>
          </div>
          <div>
            <dt>Tu valor piso acordado</dt>
            <dd>{c.precio_piso !== null ? precio({ precio: c.precio_piso, moneda: c.moneda }) : 'A convenir'}</dd>
          </div>
          {c.total_gastos > 0 && (
            <div>
              <dt>Gastos de alistaje / preparación registrados</dt>
              <dd>- {precio({ precio: c.total_gastos, moneda: c.moneda })}</dd>
            </div>
          )}
          {c.neto_estimado !== null && (
            <div>
              <dt>Neto estimado a liquidar a tu favor</dt>
              <dd>{precio({ precio: c.neto_estimado, moneda: c.moneda })}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* Documentación */}
      <section className="au-bloque au-papeles">
        <h2>Estado de la documentación</h2>
        <ul>
          {c.papeles.map((item) => (
            <li key={item.tipo} data-estado={item.estado === 'ok' ? 'al_dia' : item.estado}>
              <span>{item.nombre}</span>
              <b>{ROTULO_PAPEL[item.estado]}</b>
            </li>
          ))}
        </ul>
      </section>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
        {c.publicada && (
          <Link href={`/autos/${c.id}`} className="au-boton">
            Ver publicación en el sitio
          </Link>
        )}
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="au-boton au-boton--wa">
            Hablar con la agencia por WhatsApp
          </a>
        )}
      </div>
    </article>
  );
}
