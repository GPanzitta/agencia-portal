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
  title: 'Seguimiento de tu Orden de Venta (OV)',
  robots: { index: false, follow: false },
};

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3200/api';
const API_ORIGIN = API.replace(/\/api\/?$/, '');
const urlFoto = (u: string) => (u.startsWith('http') ? u : `${API_ORIGIN}${u.startsWith('/') ? '' : '/'}${u}`);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface VistaOrdenDeVentaPublica {
  id: string;
  numero: string;
  estado: 'reservada' | 'vendida' | 'anulada';
  cliente_nombre: string;
  precio: number;
  moneda: 'ARS' | 'USD';
  pagado: number;
  saldo: number;
  saldada: boolean;
  reserva_vence: string | null;
  created_at: string;
  cerrada_at: string | null;
  auto: {
    id: string;
    numero: string;
    titulo: string;
    anio: number;
    km: number;
    dominio: string | null;
    color: string | null;
    portada: string | null;
  };
  papeles: {
    resumen: string;
    items: { tipo: string; nombre: string; estado: 'al_dia' | 'en_tramite' | 'pendiente' }[];
  } | null;
  transferencia: {
    estado: 'falta' | 'en_tramite' | 'ok';
    nota: string | null;
  };
  fotos_ov: {
    id: string;
    url: string;
    url_miniatura: string;
    nota: string | null;
    etapa: string;
    fecha: string;
  }[];
}

async function obtenerOrdenDeVenta(id: string): Promise<VistaOrdenDeVentaPublica | null> {
  if (!UUID.test(id)) return null;
  try {
    const res = await fetch(`${API}/catalogo/ov/${id}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
      headers: await cabecerasDeAgencia(),
    });
    if (!res.ok) return null;
    return (await res.json()) as VistaOrdenDeVentaPublica;
  } catch {
    return null;
  }
}

type Props = { params: Promise<{ id: string }> };

export default async function SeguimientoOrdenDeVentaPage({ params }: Props) {
  const { id } = await params;
  const [ov, p] = await Promise.all([obtenerOrdenDeVenta(id), perfil()]);
  if (!ov) notFound();

  const numero = whatsappArgentino(p.whatsapp ?? p.telefono);
  const wa = numero
    ? `https://wa.me/${numero}?text=${encodeURIComponent(`Hola, soy ${ov.cliente_nombre}. Consulto por mi Orden de Venta ${ov.numero} (${ov.auto.titulo} ${ov.auto.anio}).`)}`
    : null;

  const tonoEstado = ov.estado === 'anulada' ? 'vencida' : 'confirmada';
  const textoEstado =
    ov.estado === 'vendida'
      ? 'Orden de Venta Cerrada · En postventa / entrega'
      : ov.estado === 'reservada'
        ? 'Unidad Reservada · Operación en curso'
        : 'Operación anulada';

  const cubiertoPct = ov.precio > 0 ? Math.max(0, Math.min(100, Math.round((ov.pagado / ov.precio) * 100))) : 0;

  return (
    <article className="au-reserva" style={{ maxWidth: '720px' }}>
      <p className="au-reserva-estado" data-estado={tonoEstado}>
        {textoEstado} · {ov.numero}
      </p>
      <h1>{ov.auto.titulo} {ov.auto.anio}</h1>
      <p className="au-reservar-nota">
        Titular de la orden: <b>{ov.cliente_nombre}</b> · Unidad <b>{ov.auto.numero}</b>
        {ov.auto.dominio ? <> · Dominio <b>{ov.auto.dominio}</b></> : null}
        {' · '}{ov.auto.km.toLocaleString('es-AR')} km
      </p>

      {/* Estado de cuenta */}
      <section className="au-bloque">
        <h2>Estado de cuenta de tu operación ({ov.numero})</h2>
        <dl className="au-reserva-datos">
          <div>
            <dt>Precio total acordado</dt>
            <dd>{precio({ precio: ov.precio, moneda: ov.moneda })}</dd>
          </div>
          <div>
            <dt>Abonado / Seña y entregas ({cubiertoPct}%)</dt>
            <dd>{precio({ precio: ov.pagado, moneda: ov.moneda })}</dd>
          </div>
          <div>
            <dt>Saldo restante</dt>
            <dd>{ov.saldada ? '✓ Cuenta saldada' : precio({ precio: ov.saldo, moneda: ov.moneda })}</dd>
          </div>
          {ov.estado === 'reservada' && ov.reserva_vence && (
            <div>
              <dt>Reserva garantizada hasta</dt>
              <dd>{diaLegible(ov.reserva_vence)}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* Estado de transferencia y gestoría */}
      <section className="au-bloque" style={{ marginTop: '12px' }}>
        <h2>Seguimiento de gestoría y Registro Automotor</h2>
        <dl className="au-reserva-datos">
          <div>
            <dt>Estado del trámite registral</dt>
            <dd>
              {ov.transferencia.estado === 'ok'
                ? '✓ Transferencia inscripta · Cédula y título listos para retirar'
                : ov.transferencia.estado === 'en_tramite'
                  ? 'En trámite en el Registro de la Propiedad Automotor'
                  : 'Carpeta registral en preparación'}
            </dd>
          </div>
          {ov.transferencia.nota && (
            <div>
              <dt>Detalle de gestoría</dt>
              <dd>{ov.transferencia.nota}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* Papeles de la unidad */}
      {ov.papeles && (
        <section className="au-bloque au-papeles" style={{ marginTop: '12px' }}>
          <h2>Checklist de documentación del vehículo</h2>
          <ul>
            {ov.papeles.items.map((item) => (
              <li key={item.tipo} data-estado={item.estado}>
                <span>{item.nombre}</span>
                <b>{item.estado === 'al_dia' ? 'Al día' : item.estado === 'en_tramite' ? 'En trámite' : 'En preparación'}</b>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Fotos y constancias de la OV */}
      {ov.fotos_ov && ov.fotos_ov.length > 0 && (
        <section className="au-bloque" style={{ marginTop: '12px' }}>
          <h2>Fotos y constancias de tu Orden de Venta ({ov.fotos_ov.length})</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginTop: '10px' }}>
            {ov.fotos_ov.map((f) => (
              <a
                key={f.id}
                href={urlFoto(f.url)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid #d8dce3',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  color: 'inherit',
                  background: '#fff',
                }}
              >
                <img
                  src={urlFoto(f.url_miniatura)}
                  alt={f.nota || 'Foto de la OV'}
                  style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block' }}
                />
                {f.nota && (
                  <span style={{ padding: '6px 8px', fontSize: '0.8rem', color: '#333' }}>
                    {f.nota}
                  </span>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
        <Link href={`/autos/${ov.auto.id}`} className="au-boton">
          Ver ficha del vehículo
        </Link>
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="au-boton au-boton--wa">
            Consultar a la agencia por WhatsApp
          </a>
        )}
      </div>
    </article>
  );
}
