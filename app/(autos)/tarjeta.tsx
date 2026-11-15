import Link from 'next/link';

import { etiqueta, precio, renglon, type Auto } from '../lib/autos';

/** La tarjeta de un auto: la usan la portada, el catálogo y «otros parecidos». */
export default function Tarjeta({ a }: { a: Auto }) {
  const e = etiqueta(a);
  return (
    <li>
      <Link href={`/autos/${a.id}`} className="au-tarjeta" data-reservada={a.reservada || undefined}>
        <div className="au-foto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {a.portada ? <img src={a.portada} alt="" loading="lazy" /> : <span aria-hidden="true">{a.marca}</span>}
          {e && <b className="au-etiqueta" data-tono={e.tono}>{e.texto}</b>}
        </div>
        <div className="au-tarjeta-texto">
          <h3>{a.marca} {a.modelo}</h3>
          {a.version && <p className="au-version">{a.version}</p>}
          <p className="au-renglon">{renglon(a)}</p>
          <p className="au-precio">{precio(a)}</p>
        </div>
      </Link>
    </li>
  );
}
