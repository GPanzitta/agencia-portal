import Link from 'next/link';

import { catalogo, kilometros, precio, type Auto } from '../../lib/autos';
import { anticipoMinimo, cuota } from '../../lib/financiacion';
import { perfil } from '../../lib/perfil';
import { AutoDibujo, Estampa, tipoDe, type Tipo } from '../piezas';
import Vitrina from '../vitrina';

export const dynamic = 'force-dynamic';

const NOMBRE_TIPO: Record<Tipo, string> = { auto: 'Autos', suv: 'SUV', pickup: 'Pick-ups', utilitario: 'Utilitarios' };
const dibujo = (a: Auto, prioridad = false) => <Estampa a={a} prioridad={prioridad} />;
const caja = (a: Auto) => (a.transmision === 'automatica' ? 'Automática' : a.transmision === 'manual' ? 'Manual' : 'Consultar');

/**
 * La portada del sitio (14/11/2026): banner grande arriba, buscador, la vitrina
 * con franjas, los tres accesos, las cuotas, los atajos por tipo y marca, y los últimos ingresos.
 */
export default async function Inicio() {
  const [{ unidades, marcas }, p] = await Promise.all([catalogo(), perfil()]);
  const porTipo = (['auto', 'suv', 'pickup', 'utilitario'] as Tipo[]).map((t) => ({ t, autos: unidades.filter((a) => tipoDe(a) === t) })).filter((x) => x.autos.length);
  const porMarca = marcas.map((m) => ({ m, n: unidades.filter((a) => a.marca === m).length })).sort((a, b) => b.n - a.n);
  const ultimos = [...unidades].sort((a, b) => Number(b.nuevo_ingreso) - Number(a.nuevo_ingreso)).slice(0, 4);
  // El banner prefiere un auto que ya tenga foto cargada desde el ERP.
  const destacado = unidades.find((a) => !a.reservada && a.portada) ?? unidades.find((a) => !a.reservada) ?? unidades[0];
  // La cuota más baja de cada auto: con el anticipo mínimo y el plazo más largo que ofrece la agencia.
  const enCuotas = unidades.filter((a) => a.financiacion && !a.reservada).slice(0, 3).map((a) => {
    const f = a.financiacion!;
    const [anticipo, meses] = [anticipoMinimo(a.precio, f), Math.max(...f.plazos)];
    return { a, anticipo, meses, valor: cuota(a.precio - anticipo, f.tna, meses) };
  });

  return (
    <>
      <section className="mq-banner">
        <div className="mq-banner-texto">
          <h1>{p.eslogan ?? 'Usados seleccionados y 0 km'}</h1>
          <p>{unidades.length} autos publicados, con precio, fotos y el estado de los papeles.</p>
          <Link href="/autos" className="mq-sesgo mq-sesgo--blanco"><span>Ver el stock</span></Link>
        </div>
        {destacado && <div className="mq-banner-auto"><span className="mq-franjas" aria-hidden="true" />{dibujo(destacado, true)}</div>}
      </section>

      <form action="/autos" className="mq-busca" role="search">
        <input type="search" name="q" placeholder="Buscá por marca, modelo o año" aria-label="Buscar un auto" />
        <button type="submit" className="mq-boton mq-boton--acento">Buscar</button>
        <div className="mq-caminos"><Link href="/autos">Quiero comprar</Link><Link href="/cotiza-tu-auto">Quiero vender</Link><Link href="/cotiza-tu-auto">Quiero permutar</Link></div>
      </form>

      <section className="mq-seccion">
        <h2 className="mq-titulo mq-titulo--centro"><i className="mq-rayas" aria-hidden="true" />Elegí tu auto en {p.nombre}</h2>
        <Vitrina autos={unidades.map((a) => ({ id: a.id, nombre: `${a.marca} ${a.modelo}`, detalle: `${a.anio}, ${kilometros(a)}`, precio: precio(a), tipo: tipoDe(a), dibujo: dibujo(a) }))} />
      </section>

      <section className="mq-seccion">
        <ul className="mq-accesos">
          <li><Link href="/cotiza-tu-auto"><strong>Cotizamos tu usado</strong><span>Para venderlo, permutarlo o dejarlo en consignación.</span><em>Cotizar</em></Link></li>
          <li><a href="#cuotas"><strong>Financiación a tu medida</strong><span>Elegís el anticipo y el plazo, y ves la cuota de cada auto.</span><em>Ver cuotas</em></a></li>
          <li><Link href="/autos"><strong>Reservalo con una seña</strong><span>Transferís la seña desde tu casa y te lo guardamos.</span><em>Ver autos</em></Link></li>
        </ul>
      </section>

      <section className="mq-seccion mq-seccion--cuotas" id="cuotas">
        <h2 className="mq-titulo mq-titulo--centro"><i className="mq-rayas" aria-hidden="true" />Llevalo en cuotas</h2>
        {enCuotas.length > 0 ? (
          <ul className="mq-planes">
            {enCuotas.map(({ a, anticipo, meses, valor }) => (
              <li key={a.id}>
                <div className="mq-plan-auto">{dibujo(a)}</div>
                <h3>{a.marca} {a.modelo}</h3>
                <p>Cuota desde <b>{precio({ precio: valor, moneda: a.moneda })}</b></p>
                <small>{meses} cuotas fijas con un anticipo de {precio({ precio: anticipo, moneda: a.moneda })}</small>
                <Link href={`/autos/${a.id}#cuotas`} className="mq-sesgo"><span>Simular</span></Link>
              </li>
            ))}
          </ul>
        ) : <p className="mq-vacio">La agencia todavía no cargó sus condiciones de financiación. Cuando las cargue en el ERP, acá aparece la cuota de cada auto.</p>}
        <p className="mq-nota">Valores estimados, no son una oferta de crédito. La cuota final depende de la aprobación.</p>
      </section>

      <section className="mq-seccion">
        <h2 className="mq-titulo">Buscá por tipo de vehículo</h2>
        <ul className="mq-tipos">
          {porTipo.map(({ t, autos }) => (
            <li key={t}><Link href={`/autos?tipo=${t}`}><AutoDibujo tipo={t} color="#1a1a1a" /><strong>{NOMBRE_TIPO[t]}</strong><span>{autos.length} {autos.length === 1 ? 'disponible' : 'disponibles'}</span></Link></li>
          ))}
        </ul>
        <h3 className="mq-subtitulo">Marcas en stock</h3>
        <ul className="mq-marcas">{porMarca.map(({ m, n }) => <li key={m}><Link href={`/autos?marca=${encodeURIComponent(m)}`}>{m}<span>{n}</span></Link></li>)}</ul>
      </section>

      <section className="mq-seccion">
        <div className="mq-cabeza"><h2 className="mq-titulo">Últimos ingresos</h2><Link href="/autos">Ver todo el stock</Link></div>
        <ul className="mq-tarjetas">
          {ultimos.map((a) => (
            <li key={a.id}>
              <Link href={`/autos/${a.id}`} className="mq-tarjeta">
                <div className="mq-tarjeta-foto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {a.portada ? <img src={a.portada} alt="" loading="lazy" /> : <Estampa a={a} />}
                  {a.reservada ? <b data-tono="reservado">Reservado</b> : a.nuevo_ingreso ? <b>Recién ingresado</b> : null}
                </div>
                <h3>{a.marca} {a.modelo}</h3>
                {a.version && <p>{a.version}</p>}
                <strong>{precio(a)}</strong>
                <dl><div><dt>Año</dt><dd>{a.anio}</dd></div><div><dt>Km</dt><dd>{kilometros(a)}</dd></div><div><dt>Caja</dt><dd>{caja(a)}</dd></div></dl>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mq-porque">
        <h2 className="mq-titulo"><i className="mq-rayas" aria-hidden="true" />Por qué elegirnos</h2>
        <ul>
          <li><strong>Papeles claros</strong><p>En cada publicación ves cómo están el título, la cédula, la VTV y las deudas.</p></li>
          <li><strong>Precio publicado</strong><p>Contado, financiado o entregando tu usado: las tres cuentas están a la vista.</p></li>
          <li><strong>Reserva desde tu casa</strong><p>Con una seña por transferencia te guardamos el auto los días acordados.</p></li>
        </ul>
      </section>
    </>
  );
}
