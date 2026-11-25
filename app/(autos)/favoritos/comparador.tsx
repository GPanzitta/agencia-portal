'use client';

import Link from 'next/link';

import type { Auto } from '../../lib/autos';
import { SITIO } from '../../lib/sitio';
import { useFavoritos } from '../favorito-boton';

const ROTULOS_COMP: Record<string, Record<string, string>> = {
  carroceria: {
    sedan: 'Sedán', hatchback: 'Hatchback', suv: 'SUV', pickup: 'Pickup', coupe: 'Coupé', rural: 'Rural',
    monovolumen: 'Monovolumen', utilitario: 'Utilitario', moto: 'Moto', otro: 'Otro',
  },
  combustible: { nafta: 'Nafta', diesel: 'Diésel', gnc: 'GNC', hibrido: 'Híbrido', electrico: 'Eléctrico' },
  transmision: { manual: 'Manual', automatica: 'Automática' },
  condicion: { usado: 'Usado', '0km': '0 km' },
};

const rotulo = (clave: string, valor: string | null | undefined): string | null =>
  valor ? ROTULOS_COMP[clave]?.[valor] ?? valor : null;

const precio = (a: Pick<Auto, 'precio' | 'moneda'>): string =>
  `${a.moneda === 'USD' ? 'US$' : '$'} ${Math.round(a.precio).toLocaleString('es-AR')}`;

const kilometros = (a: Pick<Auto, 'km' | 'condicion'>): string =>
  a.condicion === '0km' ? '0 km' : `${a.km.toLocaleString('es-AR')} km`;

function linkWhatsapp(numero: string | null, a: Pick<Auto, 'titulo' | 'anio'> | null, origen: string): string | null {
  if (!numero) return null;
  const texto = a
    ? `Hola, vi el ${a.titulo} ${a.anio} en la página y quiero consultar. ${origen}`
    : 'Hola, estoy buscando un auto y quiero consultar.';
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto.trim())}`;
}

export default function ComparadorFavoritos({ unidades, whatsappNumero }: { unidades: Auto[]; whatsappNumero: string | null }) {
  const [ids, toggle] = useFavoritos();
  const guardados = ids
    .map((id) => unidades.find((u) => u.id === id))
    .filter((u): u is Auto => !!u);

  if (!guardados.length) {
    return (
      <div className="au-comparador-vacio">
        <p>Todavía no guardaste ningún auto para comparar.</p>
        <p className="au-ayuda">Tocá la estrella (☆) en cualquier auto del catálogo para guardarlo acá y comparar precios, kilómetros y equipamiento lado a lado.</p>
        <Link href="/autos" className="au-boton" style={{ marginTop: '14px' }}>Ver el catálogo de autos</Link>
      </div>
    );
  }

  return (
    <div className="au-comparador-tabla-wrap">
      <table className="au-comparador-tabla">
        <thead>
          <tr>
            <th>Vehículo</th>
            {guardados.map((a) => (
              <th key={a.id}>
                <div className="au-comp-cab">
                  <Link href={`/autos/${a.id}`} className="au-comp-foto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {a.portada ? <img src={a.portada} alt={a.titulo} /> : <span>{a.marca}</span>}
                  </Link>
                  <Link href={`/autos/${a.id}`} className="au-comp-titulo">
                    {a.marca} {a.modelo} {a.anio}
                  </Link>
                  {a.version && <small>{a.version}</small>}
                  <button type="button" className="au-comp-quitar" onClick={() => toggle(a.id)}>
                    Quitar
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Precio contado</th>
            {guardados.map((a) => (
              <td key={a.id}><b className="au-comp-precio">{precio(a)}</b></td>
            ))}
          </tr>
          <tr>
            <th>Año</th>
            {guardados.map((a) => <td key={a.id}>{a.anio}</td>)}
          </tr>
          <tr>
            <th>Kilómetros</th>
            {guardados.map((a) => <td key={a.id}>{kilometros(a)}</td>)}
          </tr>
          <tr>
            <th>Condición</th>
            {guardados.map((a) => <td key={a.id}>{rotulo('condicion', a.condicion) ?? a.condicion}</td>)}
          </tr>
          <tr>
            <th>Transmisión</th>
            {guardados.map((a) => <td key={a.id}>{rotulo('transmision', a.transmision) ?? '—'}</td>)}
          </tr>
          <tr>
            <th>Combustible</th>
            {guardados.map((a) => <td key={a.id}>{rotulo('combustible', a.combustible) ?? '—'}</td>)}
          </tr>
          <tr>
            <th>Carrocería</th>
            {guardados.map((a) => <td key={a.id}>{rotulo('carroceria', a.carroceria) ?? '—'}</td>)}
          </tr>
          <tr>
            <th>Color</th>
            {guardados.map((a) => <td key={a.id}>{a.color ?? '—'}</td>)}
          </tr>
          <tr>
            <th>Estado</th>
            {guardados.map((a) => (
              <td key={a.id}>
                {a.reservada ? 'Reservado' : 'Disponible'}
              </td>
            ))}
          </tr>
          <tr>
            <th>Acciones</th>
            {guardados.map((a) => {
              const wa = linkWhatsapp(whatsappNumero, a, `${SITIO}/autos/${a.id}`);
              return (
                <td key={a.id}>
                  <div className="au-comp-acciones">
                    <Link href={`/autos/${a.id}`} className="au-boton">Ver auto</Link>
                    {wa && (
                      <a href={wa} target="_blank" rel="noopener noreferrer" className="au-boton au-boton--wa">
                        WhatsApp
                      </a>
                    )}
                  </div>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
