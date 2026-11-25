import type { Metadata } from 'next';

import { catalogo } from '../../lib/autos';
import { perfil } from '../../lib/perfil';
import { whatsappArgentino } from '../../lib/whatsapp';
import ComparadorFavoritos from './comparador';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mis autos guardados y comparador',
  description: 'Compará lado a lado los autos que guardaste del catálogo: precio, año, kilómetros, caja y combustible.',
};

export default async function FavoritosPage() {
  const [stock, p] = await Promise.all([catalogo(), perfil()]);
  const numero = whatsappArgentino(p.whatsapp ?? p.telefono);

  return (
    <section className="au-favoritos-pagina">
      <header className="au-portada au-portada--simple">
        <h1>Mis autos guardados</h1>
        <p>Compará lado a lado las unidades que te interesaron para elegir la mejor opción.</p>
      </header>
      <ComparadorFavoritos unidades={stock.unidades} whatsappNumero={numero} />
    </section>
  );
}
