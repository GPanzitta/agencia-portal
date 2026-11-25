'use client';

import { useEffect, useState } from 'react';

export const CLAVE_FAVORITOS = 'fg_autos_favoritos';
const EVENTO_FAVORITOS = 'fg-favoritos-cambio';

export function leerFavoritos(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const crudo = window.localStorage.getItem(CLAVE_FAVORITOS);
    const lista = crudo ? (JSON.parse(crudo) as unknown) : [];
    return Array.isArray(lista) ? lista.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function alternarFavorito(id: string): string[] {
  const actuales = leerFavoritos();
  const nuevos = actuales.includes(id)
    ? actuales.filter((x) => x !== id)
    : [...actuales.slice(-5), id];
  try {
    window.localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(nuevos));
    window.dispatchEvent(new Event(EVENTO_FAVORITOS));
  } catch {
    /* localStorage no disponible */
  }
  return nuevos;
}

export function useFavoritos(): [string[], (id: string) => void] {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const actualizar = () => setIds(leerFavoritos());
    actualizar();
    window.addEventListener(EVENTO_FAVORITOS, actualizar);
    window.addEventListener('storage', actualizar);
    return () => {
      window.removeEventListener(EVENTO_FAVORITOS, actualizar);
      window.removeEventListener('storage', actualizar);
    };
  }, []);

  const toggle = (id: string) => {
    setIds(alternarFavorito(id));
  };

  return [ids, toggle];
}

/**
 * Botón para guardar un auto en favoritos / comparador sin necesidad de crear cuenta.
 */
export default function FavoritoBoton({ id, variante = 'icono' }: { id: string; variante?: 'icono' | 'boton' }) {
  const [ids, toggle] = useFavoritos();
  const guardado = ids.includes(id);

  if (variante === 'boton') {
    return (
      <button
        type="button"
        className={`au-boton au-boton--linea au-fav-btn${guardado ? ' activo' : ''}`}
        aria-pressed={guardado}
        onClick={() => toggle(id)}
      >
        {guardado ? '★ Guardado para comparar' : '☆ Guardar para comparar'}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`au-fav-icono${guardado ? ' activo' : ''}`}
      aria-pressed={guardado}
      aria-label={guardado ? 'Quitar de mis guardados' : 'Guardar para comparar'}
      title={guardado ? 'Guardado para comparar' : 'Guardar para comparar'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
    >
      {guardado ? '★' : '☆'}
    </button>
  );
}
