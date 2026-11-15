import type { Metadata } from 'next';
import Link from 'next/link';

import { ERP } from '../lib/producto';
import '../(autos)/autos.css';
import './producto.css';

export const metadata: Metadata = {
  title: 'FG autos · El sistema para agencias de autos',
  description: 'Stock, ventas, interesados y tu propio sitio con el catálogo, en un solo sistema. Probalo gratis.',
};

/** La página del producto (tanda 2, 12/11/2026): lo que ve una agencia que todavía no es cliente. */
export default function LayoutProducto({ children }: { children: React.ReactNode }) {
  return (
    <div className="au">
      <a className="au-salto" href="#contenido">Ir al contenido</a>
      <header className="au-cabecera">
        <Link href="/fg-autos" className="au-marca">FG autos</Link>
        <nav aria-label="Principal">
          <a href="#incluye">Qué incluye</a>
          <a href="#planes">Planes</a>
          <a href={`${ERP}/auth/login`}>Ingresar</a>
        </nav>
        <a className="au-boton pr-boton" href={`${ERP}/auth/registro`}>Registrá tu agencia</a>
      </header>
      <main id="contenido" tabIndex={-1}>{children}</main>
      <footer className="au-pie">
        <div><strong>FG autos</strong><span>El sistema para agencias de compra y venta de autos.</span></div>
        <nav aria-label="Pie">
          <a href={`${ERP}/auth/registro`}>Registrá tu agencia</a>
          <a href={`${ERP}/auth/login`}>Ingresar</a>
        </nav>
      </footer>
    </div>
  );
}
