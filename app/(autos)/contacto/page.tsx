import type { Metadata } from 'next';

import { linkWhatsapp } from '../../lib/autos';
import { formatearHorario, perfil } from '../../lib/perfil';
import { linkTelefono, whatsappArgentino } from '../../lib/whatsapp';
import Formulario from '../formulario';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Contacto', description: 'Dónde estamos, horarios y cómo escribirnos.' };

/** Contacto: sólo muestra lo que la agencia cargó en su perfil. */
export default async function Contacto() {
  const p = await perfil();
  const whatsapp = linkWhatsapp(whatsappArgentino(p.whatsapp ?? p.telefono), null, '');
  const telefono = linkTelefono(p.telefono);
  const mapa = p.lat !== null && p.lng !== null
    ? `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`
    : p.direccion ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.direccion)}` : null;
  const hayDatos = p.direccion || p.telefono || p.horarios.length > 0 || whatsapp;

  return (
    <>
      <section className="au-portada au-portada--simple">
        <h1>Contacto</h1>
        <p>Escribinos o pasá a ver los autos.</p>
      </section>
      <div className="au-dos">
        <Formulario modo="contacto" />
        <section className="au-al-lado">
          <h2>{p.nombre}</h2>
          {!hayDatos && <p className="au-ayuda">Dejanos tus datos en el formulario y te contestamos.</p>}
          <dl className="au-contacto">
            {p.direccion && (
              <div><dt>Dirección</dt><dd>{p.direccion}{mapa && <> · <a href={mapa} target="_blank" rel="noopener noreferrer">Cómo llegar</a></>}</dd></div>
            )}
            {p.horarios.length > 0 && (
              <div><dt>Horarios</dt><dd><ul>{p.horarios.map((h) => <li key={formatearHorario(h)}>{formatearHorario(h)}</li>)}</ul></dd></div>
            )}
            {telefono && p.telefono && <div><dt>Teléfono</dt><dd><a href={telefono}>{p.telefono}</a></dd></div>}
          </dl>
          {whatsapp && <a className="au-boton au-boton--wa" href={whatsapp} target="_blank" rel="noopener noreferrer">Escribir por WhatsApp</a>}
        </section>
      </div>
    </>
  );
}
