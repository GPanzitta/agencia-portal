'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';

import { TIPOS, type Tipo } from './piezas';

export interface EnVitrina { id: string; nombre: string; detalle: string; precio: string; tipo: Tipo; dibujo: React.ReactNode }

/**
 * La vitrina: cada auto recortado sobre las franjas del color de la agencia. Arriba se elige la
 * clase de vehículo; con las flechas (o deslizando) se recorre la fila. Al pasar por encima, el
 * auto se acerca un poco.
 */
export default function Vitrina({ autos }: { autos: EnVitrina[] }) {
  const [tipo, setTipo] = useState<Tipo | 'todos'>('todos');
  const fila = useRef<HTMLUListElement>(null);
  const visibles = autos.filter((a) => tipo === 'todos' || a.tipo === tipo);
  const mover = (lado: 1 | -1) => fila.current?.scrollBy({ left: lado * fila.current.clientWidth * 0.8, behavior: 'smooth' });
  return (
    <div className="mq-vitrina">
      <div className="mq-pestanas" role="tablist" aria-label="Clase de vehículo">
        {TIPOS.filter(([t]) => t === 'todos' || autos.some((a) => a.tipo === t)).map(([t, rotulo]) => (
          <button key={t} type="button" role="tab" aria-selected={tipo === t} onClick={() => { setTipo(t); fila.current?.scrollTo({ left: 0 }); }}>{rotulo}</button>
        ))}
      </div>
      <div className="mq-fila">
        <button type="button" className="mq-flecha" onClick={() => mover(-1)} aria-label="Ver los anteriores">‹</button>
        <ul ref={fila}>
          {visibles.map((a) => (
            <li key={a.id}>
              <Link href={`/autos/${a.id}`} className="mq-escena" aria-label={a.nombre}>
                <span className="mq-franjas" aria-hidden="true" />
                {a.dibujo}
              </Link>
              <h3>{a.nombre}</h3>
              <p>{a.detalle}</p>
              <b>{a.precio}</b>
              <div className="mq-par">
                <Link href={`/autos/${a.id}`} className="mq-sesgo mq-sesgo--claro"><span>Ver más</span></Link>
                <Link href={`/autos/${a.id}#consulta`} className="mq-sesgo"><span>Consulta</span></Link>
              </div>
            </li>
          ))}
        </ul>
        <button type="button" className="mq-flecha" onClick={() => mover(1)} aria-label="Ver los siguientes">›</button>
      </div>
    </div>
  );
}
