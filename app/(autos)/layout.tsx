import type { Metadata } from 'next';
import Link from 'next/link';

import { linkWhatsapp } from '../lib/autos';
import { formatearHorario, perfil, type Acento } from '../lib/perfil';
import { linkTelefono, whatsappArgentino } from '../lib/whatsapp';
import './autos.css';
import './sitio.css';

export async function generateMetadata(): Promise<Metadata> {
  const p = await perfil();
  return {
    title: { default: `${p.nombre} · Autos usados y 0 km`, template: `%s · ${p.nombre}` },
    description: `Autos usados y 0 km en ${p.nombre}. Mirá el stock con precio, kilómetros y fotos, y consultá por WhatsApp.`,
  };
}

/** El color de cada agencia (lo elige en el ERP) y la tinta que se lee encima. */
const ACENTO: Record<Acento, [fondo: string, tinta: string]> = {
  amarillo: ['#f2b705', '#111111'], naranja: ['#e8650c', '#ffffff'], celeste: ['#1976c2', '#ffffff'], verde: ['#1c8546', '#ffffff'],
  rojo: ['#d4201f', '#ffffff'], violeta: ['#6a3fb3', '#ffffff'], fuego: ['#e01b12', '#ffffff'],
};

/** El marco del sitio de la agencia (14/11/2026): barra negra, fondo claro y el color de la agencia en franjas. */
export default async function LayoutAutos({ children }: { children: React.ReactNode }) {
  const p = await perfil();
  const whatsapp = linkWhatsapp(whatsappArgentino(p.whatsapp ?? p.telefono), null, '');
  const telefono = linkTelefono(p.telefono);
  const [acento, sobre] = ACENTO[p.color_acento] ?? ACENTO.rojo;
  const mapa = p.direccion ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.direccion)}` : null;
  return (
    <div className="mq" style={{ '--mq-acento': acento, '--mq-sobre-acento': sobre } as React.CSSProperties}>
      <a className="mq-salto" href="#contenido">Ir al contenido</a>
      <header className="mq-barra">
        <Link href="/" className="mq-marca">{p.nombre}</Link>
        <nav aria-label="Principal">
          <Link href="/">Inicio</Link>
          <Link href="/autos?condicion=0km">0 km</Link>
          <Link href="/autos?condicion=usado">Usados</Link>
          <Link href="/#cuotas">Financiación</Link>
          <Link href="/cotiza-tu-auto">Cotizador de usados</Link>
          <a href="#salon">Dónde estamos</a>
        </nav>
        {whatsapp && <a className="mq-boton mq-boton--acento" href={whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
      </header>
      {/* Las páginas de adentro (ficha, contacto, reserva) usan los estilos `au-`: por eso el `au` acá. */}
      <main id="contenido" tabIndex={-1} className="mq-principal au">{children}</main>
      <section className="mq-salon" id="salon">
        <h2><i className="mq-rayas" aria-hidden="true" />Nuestro salón</h2>
        <div className="mq-salon-cuerpo">
          <div>
            <h3>Dónde estamos</h3>
            <p className="mq-direccion">{p.direccion ?? 'Cargá la dirección en el ERP'}</p>
            {p.zona && <p>{p.zona}</p>}
            {mapa && <a className="mq-boton mq-boton--claro" href={mapa} target="_blank" rel="noopener noreferrer">Cómo llegar</a>}
          </div>
          <div>
            <h3>Horarios</h3>
            {p.horarios.length ? p.horarios.map((h) => <p key={formatearHorario(h)}>{formatearHorario(h)}</p>) : <p>Lunes a viernes de 9 a 18. Sábados de 9 a 13.</p>}
          </div>
          <div>
            <h3>Hablemos</h3>
            {telefono && p.telefono && <p><a href={telefono}>{p.telefono}</a></p>}
            {whatsapp && <p><a href={whatsapp} target="_blank" rel="noopener noreferrer">Escribinos por WhatsApp</a></p>}
            <p><Link href="/contacto">Dejanos tu consulta</Link></p>
          </div>
        </div>
      </section>
      <footer className="mq-pie">
        <strong>{p.nombre}</strong>
        <nav aria-label="Pie"><Link href="/autos">Todos los autos</Link><Link href="/cotiza-tu-auto">Cotizá tu usado</Link><Link href="/contacto">Contacto</Link></nav>
        <small>Los precios y la disponibilidad pueden cambiar sin aviso. Consultá antes de acercarte.</small>
      </footer>
      {/* El WhatsApp siempre a mano en el celular. */}
      {whatsapp && <a className="mq-wa-flotante" href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Escribir por WhatsApp">WhatsApp</a>}
    </div>
  );
}
