import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { auto, catalogo, especificaciones, etiqueta, kilometros, linkWhatsapp, parecidos, precio, renglon } from '../../../lib/autos';
import { perfil } from '../../../lib/perfil';
import { opcionesDeCompra, porGrupo, PUBLICACION_VACIA } from '../../../lib/publicacion';
import { SITIO } from '../../../lib/sitio';
import { linkTelefono, whatsappArgentino } from '../../../lib/whatsapp';
import Formulario from '../../formulario';
import Galeria from '../../galeria';
import Reservar from '../../reservar';
import Simulador from '../../simulador';
import Tarjeta from '../../tarjeta';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

/** Cómo se le dice al comprador el estado de cada papel. */
const ESTADO_PAPEL = { al_dia: 'Al día', en_tramite: 'En trámite', pendiente: 'Pendiente' } as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const a = await auto(id).catch(() => null);
  if (!a) return { title: 'Auto no disponible' };
  return {
    title: `${a.titulo} ${a.anio}`,
    description: `${a.titulo} ${a.anio}, ${renglon(a)}. ${precio(a)}.`,
    openGraph: a.portada ? { images: [a.portada] } : undefined,
  };
}

/**
 * La publicación de un auto (14/11/2026): fotos a la izquierda y, a la derecha,
 * el panel con las formas de comprarlo. Debajo, lo que la agencia cargó en el
 * ERP: equipamiento destacado, características por grupo y colores.
 */
export default async function PublicacionDelAuto({ params }: Props) {
  const { id } = await params;
  const [a, p, stock] = await Promise.all([auto(id), perfil(), catalogo()]);
  if (!a) notFound();
  const pub = { ...PUBLICACION_VACIA, ...(a.publicacion ?? {}) };
  const opciones = opcionesDeCompra(a, stock.unidades);
  const otros = parecidos(a, stock.unidades.filter((o) => !opciones.includes(o)));
  const grupos = porGrupo(pub.caracteristicas);

  const whatsapp = linkWhatsapp(whatsappArgentino(p.whatsapp ?? p.telefono), a, `${SITIO}/autos/${a.id}`);
  const telefono = linkTelefono(p.telefono);
  const donde = a.ubicacion || p.zona;

  return (
    <article className="au-pub">
      <nav className="au-migas" aria-label="Dónde estás">
        <Link href="/autos">Autos</Link><span aria-hidden="true">›</span>
        <Link href={`/autos?marca=${encodeURIComponent(a.marca)}`}>{a.marca}</Link><span aria-hidden="true">›</span>
        <span>{a.modelo}</span><span aria-hidden="true">›</span><span>{a.anio}</span>
      </nav>

      <div className="au-pub-cuerpo">
        <div className="au-pub-fotos"><Galeria fotos={a.fotos} titulo={a.titulo} etiqueta={etiqueta(a)} /></div>

        <aside className="au-pub-panel">
          <h1>{a.titulo} {a.anio}</h1>
          <p className="au-renglon">{kilometros(a)}{donde ? `, ${donde}` : ''}</p>

          <div className="au-opcion au-opcion--principal">
            <span>Precio contado</span>
            <b>{precio(a)}</b>
          </div>

          {pub.precio_financiado !== null && !a.reservada && (
            <div className="au-opcion">
              <span>Precio financiando con la agencia</span>
              <b>{precio({ precio: pub.precio_financiado, moneda: a.moneda })}</b>
              {a.financiacion && <a href="#cuotas">Simulá las cuotas</a>}
            </div>
          )}

          {pub.mostrar_toma && !a.reservada && (
            <div className="au-opcion au-opcion--fila">
              <span><strong>Entregá tu usado</strong>Lo cotizamos y lo tomamos en parte de pago.</span>
              <Link href={`/cotiza-tu-auto?por=${a.id}`}>Cotizar</Link>
            </div>
          )}

          {a.reservada && <p className="au-aviso">Este auto está reservado. Consultanos: podemos avisarte si se libera o mostrarte uno parecido.</p>}

          {a.reserva && !a.reservada && (
            <Reservar unidadId={a.id} sena={precio({ precio: a.reserva.monto, moneda: a.reserva.moneda })} horas={a.reserva.horas} dias={a.reserva.dias} enCurso={a.reserva.en_curso} />
          )}
          <div className="au-acciones">
            <a className="au-boton" href="#consulta">Agendar una visita</a>
            {whatsapp && <a className="au-boton au-boton--wa" href={whatsapp} target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a>}
            {telefono && p.telefono && <a className="au-boton au-boton--linea" href={telefono}>Llamar al {p.telefono}</a>}
          </div>

          {opciones.length > 0 && (
            <div className="au-otras">
              <h2>Otras opciones de compra</h2>
              <ul>
                {opciones.map((o) => (
                  <li key={o.id}>
                    <Link href={`/autos/${o.id}`}>
                      <span><strong>{o.marca} {o.modelo}</strong>{renglon(o)}</span>
                      <b>{precio(o)}</b>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <div className="au-pub-detalle">
          {pub.destacados.length > 0 && (
            <section className="au-bloque">
              <h2>Equipamiento destacado</h2>
              <ul className="au-destacados">
                {pub.destacados.map((d) => <li key={d.nombre}><strong>{d.nombre}</strong><span>{d.categoria}</span></li>)}
              </ul>
            </section>
          )}

          {a.descripcion && (
            <section className="au-bloque">
              <h2>Sobre este auto</h2>
              <p className="au-texto-largo">{a.descripcion}</p>
            </section>
          )}

          <section className="au-bloque">
            <h2>Información básica</h2>
            <dl className="au-ficha-tecnica">
              {especificaciones(a).map((d) => <div key={d.nombre}><dd>{d.valor}</dd><dt>{d.nombre}</dt></div>)}
            </dl>
            {pub.colores.length > 0 && (
              <div className="au-colores">
                <h3>{pub.colores.length === 1 ? 'Color' : 'Colores'}</h3>
                <ul>{pub.colores.map((c) => <li key={c.nombre}><i style={{ background: c.hex }} aria-hidden="true" />{c.nombre}</li>)}</ul>
              </div>
            )}
          </section>

          {grupos.length > 0 && (
            <section className="au-bloque">
              <h2>Características</h2>
              {grupos.map((g) => (
                <div key={g.grupo} className="au-grupo">
                  <h3>{g.grupo}</h3>
                  <dl className="au-ficha-tecnica">
                    {g.items.map((c) => <div key={c.etiqueta}><dd>{c.valor}</dd><dt>{c.etiqueta}</dt></div>)}
                  </dl>
                </div>
              ))}
            </section>
          )}

          {a.financiacion && !a.reservada && <div id="cuotas" className="au-ancla"><Simulador precio={a.precio} moneda={a.moneda} financiacion={a.financiacion} /></div>}

          {a.papeles && (
            <section className="au-bloque au-papeles">
              <h2>Papeles</h2>
              <p className="au-papeles-resumen" data-estado={a.papeles.al_dia ? 'al_dia' : 'pendiente'}>
                {a.papeles.al_dia
                  ? 'Papeles al día: listo para transferir, sin deuda de patentes ni multas.'
                  : `${a.papeles.items.filter((i) => i.estado === 'al_dia').length} de ${a.papeles.items.length} papeles al día. Los que faltan los completamos antes de la entrega.`}
              </p>
              <ul>
                {a.papeles.items.map((i) => (
                  <li key={i.tipo} data-estado={i.estado}><span>{i.nombre}</span><b>{ESTADO_PAPEL[i.estado]}</b></li>
                ))}
              </ul>
            </section>
          )}

          <section id="consulta" className="au-bloque au-ancla">
            <Formulario modo="consulta" unidadId={a.id} sobre={`${a.marca} ${a.modelo}`} />
          </section>
        </div>
      </div>

      {otros.length > 0 && (
        <section className="au-datos">
          <h2>También te puede interesar</h2>
          <ul className="au-grilla">{otros.map((o) => <Tarjeta key={o.id} a={o} />)}</ul>
        </section>
      )}
    </article>
  );
}
