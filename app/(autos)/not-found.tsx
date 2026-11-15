import Link from 'next/link';

/** Un auto que ya no está publicado (se vendió, se despublicó) o un link viejo. */
export default function AutoNoDisponible() {
  return (
    <section className="au-portada">
      <h1>Ese auto ya no está</h1>
      <p>Puede que se haya vendido o que el link esté viejo.</p>
      <p><Link href="/autos" className="au-boton">Ver el stock de hoy</Link></p>
    </section>
  );
}
