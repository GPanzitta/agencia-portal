'use client';

import { useState } from 'react';

type Foto = { url: string; url_miniatura: string };

/**
 * Las fotos de la publicación: una grande, con flechas y contador, y la tira de
 * miniaturas abajo para saltar a cualquiera. Con el teclado, las flechas del
 * teclado cambian de foto cuando el foco está en la galería.
 */
export default function Galeria({ fotos, titulo, etiqueta }: { fotos: Foto[]; titulo: string; etiqueta?: { texto: string; tono: string } | null }) {
  const [activa, setActiva] = useState(0);
  if (!fotos.length) {
    return <div className="au-sin-fotos">Todavía no cargamos las fotos de este auto. Pedilas por WhatsApp.</div>;
  }
  // Relativo a la foto que está puesta en ese momento: dos toques seguidos avanzan dos.
  const mover = (pasos: number) => setActiva((a) => (a + pasos + fotos.length) % fotos.length);
  const alTeclear = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') mover(1);
    if (e.key === 'ArrowLeft') mover(-1);
  };
  return (
    <section className="au-gal" aria-label="Fotos" onKeyDown={alTeclear}>
      <div className="au-gal-grande">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fotos[activa].url} alt={`${titulo}, foto ${activa + 1} de ${fotos.length}`} />
        {etiqueta && <b className="au-etiqueta" data-tono={etiqueta.tono}>{etiqueta.texto}</b>}
        {fotos.length > 1 && (
          <>
            <button type="button" className="au-gal-flecha au-gal-flecha--izq" onClick={() => mover(-1)} aria-label="Foto anterior">‹</button>
            <button type="button" className="au-gal-flecha au-gal-flecha--der" onClick={() => mover(1)} aria-label="Foto siguiente">›</button>
            <span className="au-gal-cuenta" aria-hidden="true">{activa + 1} / {fotos.length}</span>
          </>
        )}
      </div>
      {fotos.length > 1 && (
        <ul className="au-gal-minis">
          {fotos.map((f, i) => (
            <li key={f.url}>
              <button type="button" onClick={() => setActiva(i)} aria-label={`Ver la foto ${i + 1}`} aria-current={i === activa ? 'true' : undefined}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url_miniatura || f.url} alt="" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
