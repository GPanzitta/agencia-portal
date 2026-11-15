import type { Metadata } from 'next';
import Link from 'next/link';

import LayoutAutos from './(autos)/layout';

/**
 * El 404 de las URLs que no matchean ninguna ruta: links viejos, direcciones
 * renombradas, lo que Google todavía tenga anotado de una versión anterior del
 * sitio. Sin este archivo caían en la pantalla que trae Next de fábrica, en
 * inglés, sin cabecera y sin una sola salida.
 *
 * Renderiza bajo `app/layout.tsx` y no bajo el layout del grupo `(autos)`: por
 * eso lo envuelve a mano, para salir con la cabecera y el pie de la agencia.
 */
export const metadata: Metadata = {
  title: 'No encontramos esa página',
  robots: { index: false, follow: true },
};

export default function NoEncontradoRaiz() {
  return (
    <LayoutAutos>
      <section className="au-portada">
        <h1>No encontramos esa página</h1>
        <p>Puede que el link esté viejo o que ese auto ya no esté publicado.</p>
        <p><Link href="/autos" className="au-boton">Ver el stock de hoy</Link></p>
      </section>
    </LayoutAutos>
  );
}
