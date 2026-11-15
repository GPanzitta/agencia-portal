import type { Metadata } from 'next';
import Link from 'next/link';

import { auto, precio } from '../../lib/autos';
import Cotizador from '../cotizador';

export const metadata: Metadata = {
  title: 'Cotizá tu auto',
  description: 'Pedí la cotización de tu auto para venderlo, permutarlo o dejarlo en consignación: contanos qué unidad es, mandanos fotos y te pasamos un valor.',
};

type Props = { searchParams: Promise<{ por?: string | string[] }> };

/**
 * «Cotizá tu auto»: el cliente dice para qué lo cotiza, describe su unidad y manda fotos.
 * Llega al ERP como un interesado con la cotización pendiente. Con `?por=<auto>` viene desde
 * la publicación de un auto del stock: lo quiere entregar en parte de pago por ese.
 */
export default async function CotizaTuAuto({ searchParams }: Props) {
  const { por } = await searchParams;
  const elegido = typeof por === 'string' ? await auto(por).catch(() => null) : null;
  return (
    <div className="mq-cotizar">
      <header>
        <h1>Cotizá tu auto</h1>
        <p>Contanos qué auto tenés y para qué lo querés cotizar. Te pasamos un valor el mismo día.</p>
      </header>
      <Cotizador unidadId={elegido?.id} sobre={elegido ? `${elegido.marca} ${elegido.modelo}` : undefined}>
        {elegido && <p className="mq-por">Lo entregás en parte de pago por el <Link href={`/autos/${elegido.id}`}>{elegido.titulo} {elegido.anio}</Link> ({precio(elegido)}).</p>}
        <p className="mq-tener">Tené a mano el título, la cédula y la VTV: son lo primero que se revisa. El valor final se confirma con el auto a la vista.</p>
      </Cotizador>
    </div>
  );
}
