import Link from 'next/link';

import type { Metadata } from 'next';

import { catalogo, kilometros, precio, type Auto } from '../../lib/autos';
import Formulario from '../formulario';
import { AutoDibujo, esSedan, pinturaDe, tipoDe, type Tipo } from '../piezas';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Autos en venta', description: 'Todo el stock, con filtros por marca, tipo, caja, año, kilómetros y precio.' };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const NOMBRE_TIPO: Record<string, string> = { auto: 'Autos', suv: 'SUV', pickup: 'Pick-ups', utilitario: 'Utilitarios' };
const ORDENES: [string, string][] = [['recientes', 'Recién ingresados'], ['menor', 'Menor precio'], ['mayor', 'Mayor precio'], ['km', 'Menos kilómetros'], ['anio', 'Más nuevos']];

/**
 * El catálogo (14/11/2026): la barra de filtros de arriba y la línea de búsqueda, más la columna
 * con cantidades para ir achicando. Abajo, «¿No está el que buscás?» deja pedir un aviso.
 */
export default async function Catalogo({ searchParams }: Props) {
  const sp = await searchParams;
  const uno = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k])?.toString().trim() ?? '';
  const f = { q: uno('q'), marca: uno('marca'), tipo: uno('tipo'), caja: uno('caja') || uno('transmision'), condicion: uno('condicion'), desde: uno('desde'), hasta: uno('hasta'), precio: uno('precio'), km: uno('km'), orden: uno('orden') || 'recientes' };
  const { unidades, caido } = await catalogo();
  const num = (s: string) => Number(s.replace(/\D/g, '')) || 0;
  const cumple = (a: Auto, salvo?: keyof typeof f) => {
    const es = (k: keyof typeof f) => k !== salvo && f[k];
    if (es('q') && !`${a.marca} ${a.modelo} ${a.version ?? ''} ${a.anio}`.toLowerCase().includes(f.q.toLowerCase())) return false;
    if (es('marca') && a.marca !== f.marca) return false;
    if (es('tipo') && tipoDe(a) !== f.tipo) return false;
    if (es('caja') && a.transmision !== f.caja) return false;
    if (es('condicion') && a.condicion !== f.condicion) return false;
    if (es('desde') && a.anio < num(f.desde)) return false;
    if (es('hasta') && a.anio > num(f.hasta)) return false;
    if (es('precio') && a.precio > num(f.precio)) return false;
    if (es('km') && a.km > num(f.km)) return false;
    return true;
  };
  const lista = unidades.filter((a) => cumple(a)).sort((a, b) =>
    f.orden === 'menor' ? a.precio - b.precio : f.orden === 'mayor' ? b.precio - a.precio : f.orden === 'km' ? a.km - b.km : f.orden === 'anio' ? b.anio - a.anio : Number(b.nuevo_ingreso) - Number(a.nuevo_ingreso));
  // Las cantidades de cada opción se cuentan sin ese mismo filtro: así se ve qué hay si se cambia.
  const contar = <K extends string>(clave: keyof typeof f, de: (a: Auto) => K) => {
    const m = new Map<K, number>();
    for (const a of unidades.filter((x) => cumple(x, clave))) m.set(de(a), (m.get(de(a)) ?? 0) + 1);
    return [...m.entries()].sort((x, y) => y[1] - x[1]);
  };
  const con = (cambios: Partial<typeof f>) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...f, ...cambios })) if (v && !(k === 'orden' && v === 'recientes')) q.set(k, v);
    const s = q.toString();
    return `/autos${s ? `?${s}` : ''}`;
  };
  const activos = ([['q', f.q && `«${f.q}»`], ['marca', f.marca], ['tipo', NOMBRE_TIPO[f.tipo]], ['caja', f.caja && (f.caja === 'automatica' ? 'Automática' : 'Manual')], ['condicion', f.condicion && (f.condicion === '0km' ? '0 km' : 'Usados')],
    ['desde', f.desde && `Desde ${f.desde}`], ['hasta', f.hasta && `Hasta ${f.hasta}`], ['precio', f.precio && `Hasta ${f.precio}`], ['km', f.km && `Hasta ${f.km} km`]] as [keyof typeof f, string][]).filter(([, v]) => v);
  const marcas = [...new Set(unidades.map((a) => a.marca))].sort();

  return (
    <>
      <form action="/autos" className="mq-filtros">
        <div className="mq-filtros-grilla">
          <label><span>Marca</span><select name="marca" defaultValue={f.marca}><option value="">Todas</option>{marcas.map((m) => <option key={m}>{m}</option>)}</select></label>
          <label><span>Tipo</span><select name="tipo" defaultValue={f.tipo}><option value="">Todos</option>{Object.entries(NOMBRE_TIPO).map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></label>
          <label><span>Transmisión</span><select name="caja" defaultValue={f.caja}><option value="">Todas</option><option value="manual">Manual</option><option value="automatica">Automática</option></select></label>
          <label><span>Condición</span><select name="condicion" defaultValue={f.condicion}><option value="">Todas</option><option value="usado">Usados</option><option value="0km">0 km</option></select></label>
          <label><span>Kilómetros hasta</span><input name="km" inputMode="numeric" placeholder="80.000" defaultValue={f.km} /></label>
          <div className="mq-doble"><label><span>Año desde</span><input name="desde" inputMode="numeric" placeholder="2018" defaultValue={f.desde} /></label><label><span>Año hasta</span><input name="hasta" inputMode="numeric" placeholder="2026" defaultValue={f.hasta} /></label></div>
          <label><span>Precio hasta</span><input name="precio" inputMode="numeric" placeholder="20.000" defaultValue={f.precio} /></label>
          <label><span>Ordenar</span><select name="orden" defaultValue={f.orden}>{ORDENES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></label>
        </div>
        <div className="mq-filtros-linea">
          <input type="search" name="q" placeholder="Buscá por marca, modelo, año" aria-label="Buscar" defaultValue={f.q} />
          <button type="submit" className="mq-boton mq-boton--senal">Buscar</button>
          <Link href="/autos" className="mq-limpiar">Limpiar todo</Link>
        </div>
      </form>

      <div className="mq-resultados">
        <aside aria-label="Achicar la búsqueda">
          <h2>Filtrar por</h2>
          <section><h3>Marcas</h3><ul>{contar('marca', (a) => a.marca).map(([m, n]) => <li key={m}><Link href={con({ marca: f.marca === m ? '' : m })} aria-current={f.marca === m || undefined}>{m} <span>({n})</span></Link></li>)}</ul></section>
          <section><h3>Tipo</h3><ul>{contar('tipo', (a) => tipoDe(a)).map(([t, n]) => <li key={t}><Link href={con({ tipo: f.tipo === t ? '' : t })} aria-current={f.tipo === t || undefined}>{NOMBRE_TIPO[t]} <span>({n})</span></Link></li>)}</ul></section>
          <section><h3>Transmisión</h3><ul>{contar('caja', (a) => a.transmision ?? '').filter(([c]) => c).map(([c, n]) => <li key={c}><Link href={con({ caja: f.caja === c ? '' : c })} aria-current={f.caja === c || undefined}>{c === 'automatica' ? 'Automática' : 'Manual'} <span>({n})</span></Link></li>)}</ul></section>
          <section><h3>Año</h3><ul>{contar('desde', (a) => String(a.anio)).sort((x, y) => Number(y[0]) - Number(x[0])).map(([y, n]) => <li key={y}><Link href={con({ desde: y, hasta: y })}>{y} <span>({n})</span></Link></li>)}</ul></section>
        </aside>
        <div>
          <div className="mq-cabeza">
            <h1>{caido ? 'No pudimos cargar el stock' : `${lista.length} ${lista.length === 1 ? 'vehículo encontrado' : 'vehículos encontrados'}`}</h1>
            <span>{ORDENES.find(([v]) => v === f.orden)?.[1]}</span>
          </div>
          {activos.length > 0 && (
            <ul className="mq-activos" aria-label="Filtros puestos">
              {activos.map(([k, v]) => <li key={k}><Link href={con({ [k]: '' })} aria-label={`Quitar ${v}`}>{v}<span aria-hidden="true">×</span></Link></li>)}
            </ul>
          )}
          {caido && <p className="mq-vacio">El stock no está disponible en este momento. Probá de nuevo en un rato o escribinos por WhatsApp.</p>}
          {!caido && lista.length === 0 && <p className="mq-vacio">{activos.length ? 'Con esos filtros no hay autos. Probá quitando alguno o ' : 'Todavía no hay autos publicados. Si querés, '}<a href="#avisame">dejanos tus datos</a> y te avisamos cuando entre uno.</p>}
          <ul className="mq-tarjetas mq-tarjetas--tres">
            {lista.map((a) => (
              <li key={a.id}>
                <Link href={`/autos/${a.id}`} className="mq-tarjeta">
                  <div className="mq-tarjeta-foto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {a.portada ? <img src={a.portada} alt="" loading="lazy" /> : <AutoDibujo tipo={tipoDe(a) as Tipo} color={pinturaDe(a)} sedan={esSedan(a)} />}
                    {a.reservada ? <b data-tono="reservado">Reservado</b> : a.nuevo_ingreso ? <b>Recién ingresado</b> : null}
                  </div>
                  <h3>{a.marca} {a.modelo}</h3>
                  {a.version && <p>{a.version}</p>}
                  <strong>{precio(a)}</strong>
                  <dl><div><dt>Año</dt><dd>{a.anio}</dd></div><div><dt>Km</dt><dd>{kilometros(a)}</dd></div><div><dt>Caja</dt><dd>{a.transmision === 'automatica' ? 'Automática' : a.transmision === 'manual' ? 'Manual' : 'Consultar'}</dd></div></dl>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {!caido && (
        <section className="mq-avisame" id="avisame">
          <div>
            <h2 className="mq-titulo"><i className="mq-rayas" aria-hidden="true" />¿No está el que buscás?</h2>
            <p>Decinos qué auto querés y te avisamos apenas entre al stock.</p>
          </div>
          <Formulario modo="aviso" marca={f.marca || undefined} />
        </section>
      )}
    </>
  );
}
