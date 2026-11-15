'use client';

import { useEffect, useId, useRef, useState } from 'react';

/** Una foto ya achicada, lista para viajar con el formulario. */
export interface FotoLista {
  id: string;
  blob: Blob;
  vista: string;
}

export const MAXIMO_FOTOS = 6;
/** El lado más largo con el que viaja: el mismo con el que la guarda el backend. */
const LADO = 1600;

/**
 * Achica la foto en el navegador antes de mandarla: una foto de celular pesa
 * varios megas y con datos móviles seis de esas no llegan. Devuelve `null` si
 * el navegador no la puede leer (un HEIC fuera de Safari, un archivo roto).
 */
async function achicar(archivo: File): Promise<Blob | null> {
  try {
    const mapa = await createImageBitmap(archivo, { imageOrientation: 'from-image' });
    const escala = Math.min(1, LADO / Math.max(mapa.width, mapa.height));
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.max(1, Math.round(mapa.width * escala));
    lienzo.height = Math.max(1, Math.round(mapa.height * escala));
    const ctx = lienzo.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(mapa, 0, 0, lienzo.width, lienzo.height);
    mapa.close();
    return await new Promise<Blob | null>((listo) => lienzo.toBlob(listo, 'image/jpeg', 0.82));
  } catch {
    return null;
  }
}

/**
 * Las fotos del auto en «Vendé tu auto» (13/11/2026): se eligen de la galería
 * o se sacan en el momento, se ven antes de mandar y se pueden quitar.
 */
export default function Fotos({ fotos, onCambio, onPreparando }: {
  fotos: FotoLista[];
  onCambio: (fotos: FotoLista[]) => void;
  onPreparando: (preparando: boolean) => void;
}) {
  const campo = useId();
  const [aviso, setAviso] = useState<string | null>(null);
  const [preparando, setPreparando] = useState(false);
  // Para soltar las vistas previas cuando el formulario se va.
  const vivas = useRef<FotoLista[]>(fotos);
  useEffect(() => { vivas.current = fotos; }, [fotos]);
  useEffect(() => () => vivas.current.forEach((f) => URL.revokeObjectURL(f.vista)), []);

  async function agregar(evento: React.ChangeEvent<HTMLInputElement>) {
    const elegidas = Array.from(evento.target.files ?? []);
    // Se vacía para que elegir otra vez la misma foto vuelva a avisar.
    evento.target.value = '';
    if (!elegidas.length) return;
    const lugar = MAXIMO_FOTOS - fotos.length;
    const entran = elegidas.slice(0, lugar);
    setPreparando(true);
    onPreparando(true);
    const nuevas: FotoLista[] = [];
    let fallidas = 0;
    for (const archivo of entran) {
      const blob = await achicar(archivo);
      if (blob) nuevas.push({ id: crypto.randomUUID(), blob, vista: URL.createObjectURL(blob) });
      else fallidas++;
    }
    setPreparando(false);
    onPreparando(false);
    onCambio([...fotos, ...nuevas]);
    const avisos = [
      fallidas ? `No pudimos leer ${fallidas === 1 ? 'una foto' : `${fallidas} fotos`}: probá con JPG o PNG.` : null,
      elegidas.length > lugar ? `Entran hasta ${MAXIMO_FOTOS} fotos: dejamos las primeras.` : null,
    ].filter(Boolean);
    setAviso(avisos.length ? avisos.join(' ') : null);
  }

  function quitar(foto: FotoLista) {
    URL.revokeObjectURL(foto.vista);
    onCambio(fotos.filter((f) => f.id !== foto.id));
    setAviso(null);
  }

  const llena = fotos.length >= MAXIMO_FOTOS;
  return (
    <div className="au-fotos" role="group" aria-labelledby={`${campo}-titulo`}>
      <span id={`${campo}-titulo`} className="au-fotos-titulo">Fotos de tu auto (opcional)</span>
      <span className="au-fotos-ayuda">Hasta {MAXIMO_FOTOS}. Frente, costados, interior y tablero ayudan a pasarte un valor.</span>
      {fotos.length > 0 && (
        <ul className="au-fotos-lista">
          {fotos.map((f, i) => (
            <li key={f.id}>
              {/* Vista previa local (blob:): no pasa por el optimizador de imágenes. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.vista} alt={`Foto ${i + 1} de tu auto`} />
              <button type="button" onClick={() => quitar(f)} aria-label={`Quitar la foto ${i + 1}`}>Quitar</button>
            </li>
          ))}
        </ul>
      )}
      {!llena && (
        <label className="au-fotos-agregar" htmlFor={campo}>
          <input id={campo} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple onChange={agregar} disabled={preparando} />
          <span>{preparando ? 'Preparando las fotos…' : fotos.length ? 'Agregar más fotos' : 'Agregar fotos'}</span>
        </label>
      )}
      <p className="au-fotos-aviso" role="status">{aviso}</p>
    </div>
  );
}
