import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { precio } from '../../../lib/autos';
import { perfil } from '../../../lib/perfil';
import { diaLegible, hastaCuando, reservaPublica } from '../../../lib/reserva';
import { whatsappArgentino } from '../../../lib/whatsapp';

export const dynamic = 'force-dynamic';
// El enlace es personal: no se indexa.
export const metadata: Metadata = { title: 'Tu reserva', robots: { index: false, follow: false } };

type Props = { params: Promise<{ token: string }> };

export default async function TuReserva({ params }: Props) {
  const { token } = await params;
  const [r, p] = await Promise.all([reservaPublica(token), perfil()]);
  if (!r) notFound();
  const sena = precio({ precio: r.monto, moneda: r.moneda });
  const auto = `${r.auto.titulo} ${r.auto.anio}`;
  const numero = whatsappArgentino(p.whatsapp ?? p.telefono);
  const avisar = numero
    ? `https://wa.me/${numero}?text=${encodeURIComponent(`Hola, soy ${r.nombre}. Transferí la seña de ${sena} para reservar el ${auto}. Les mando el comprobante.`)}`
    : null;

  return (
    <article className="au-reserva">
      <p className="au-reserva-estado" data-estado={r.estado}>
        {r.estado === 'pendiente' ? 'Esperando tu seña' : r.estado === 'confirmada' ? 'Reserva confirmada' : r.estado === 'vencida' ? 'Se venció el plazo' : 'Reserva no tomada'}
      </p>
      <h1>{auto}</h1>

      {r.estado === 'pendiente' && (
        <>
          <p>{r.nombre}, para reservarlo transferí la seña antes del <b>{hastaCuando(r.vence_at)}</b>.</p>
          <dl className="au-reserva-datos">
            <div><dt>Seña</dt><dd>{sena}</dd></div>
            <div><dt>Alias o CBU</dt><dd>{r.alias ?? 'Pedinos los datos por WhatsApp'}</dd></div>
            <div><dt>A nombre de</dt><dd>{r.titular ?? '—'}</dd></div>
          </dl>
          <p className="au-reservar-nota">Antes de confirmar la transferencia, fijate que la cuenta esté a ese nombre. La seña se descuenta del precio del auto.</p>
          {avisar && <a className="au-boton au-boton--wa" href={avisar} target="_blank" rel="noopener noreferrer">Ya transferí: mandar el comprobante</a>}
          <p className="au-reservar-nota">Cuando la vemos acreditada, esta misma página te lo confirma. Guardá el enlace.</p>
        </>
      )}

      {r.estado === 'confirmada' && (
        <>
          <p>{r.nombre}, recibimos tu seña de {sena}. El auto queda a tu nombre{r.guardado_hasta ? <> hasta el <b>{diaLegible(r.guardado_hasta)}</b></> : null}.</p>
          <p>Te escribimos para coordinar la visita, los papeles y el pago del resto.</p>

          {r.transferencia && (
            <section className="au-bloque" style={{ marginTop: '12px' }}>
              <h2>Estado de transferencia y gestoría</h2>
              <dl className="au-reserva-datos">
                <div>
                  <dt>Etapa de la operación</dt>
                  <dd>{r.transferencia.vendida ? 'Venta cerrada · En postventa' : 'Unidad reservada'}</dd>
                </div>
                <div>
                  <dt>Trámite en Registro Automotor</dt>
                  <dd>
                    {r.transferencia.estado === 'ok'
                      ? '✓ Transferencia inscripta · Cédula y título listos para retirar'
                      : r.transferencia.estado === 'en_tramite'
                        ? 'En trámite en el Registro Automotor'
                        : 'Carpeta en preparación'}
                  </dd>
                </div>
                {r.transferencia.nota && (
                  <div>
                    <dt>Observaciones de gestoría</dt>
                    <dd>{r.transferencia.nota}</dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {r.papeles && (
            <section className="au-bloque au-papeles" style={{ marginTop: '8px' }}>
              <h2>Documentación del vehículo</h2>
              <ul>
                {r.papeles.items.map((i) => (
                  <li key={i.tipo} data-estado={i.estado}>
                    <span>{i.nombre}</span>
                    <b>{i.estado === 'al_dia' ? 'Al día' : i.estado === 'en_tramite' ? 'En trámite' : 'En preparación'}</b>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {r.estado === 'vencida' && (
        <>
          <p>No vimos la seña dentro del plazo, así que el auto volvió a quedar libre.</p>
          <p>Si ya transferiste, escribinos con el comprobante y lo resolvemos. Si todavía te interesa, podés pedirlo de nuevo.</p>
        </>
      )}

      {r.estado === 'rechazada' && <p>No pudimos tomar esta reserva. Escribinos y vemos cómo seguir.</p>}

      <p className="au-reserva-pie">
        <Link href={`/autos/${r.auto.id}`}>Ver el auto</Link>
        {numero && r.estado !== 'pendiente' && <> · <a href={`https://wa.me/${numero}`} target="_blank" rel="noopener noreferrer">Escribirnos por WhatsApp</a></>}
      </p>
    </article>
  );
}
