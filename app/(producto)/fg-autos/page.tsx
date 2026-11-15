import { ERP, INCLUYE, pesos, type Plan } from '../../lib/producto';

export const dynamic = 'force-dynamic';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3200/api';

/** La lista de precios la define el dueño de la plataforma en su panel: acá no se inventa ningún número. */
async function plan(): Promise<Plan | null> {
  try {
    const res = await fetch(`${API}/catalogo/plan`, { cache: 'no-store', signal: AbortSignal.timeout(4000) });
    return res.ok ? ((await res.json()) as Plan | null) : null;
  } catch {
    return null;
  }
}

export default async function Producto() {
  const p = await plan();
  return (
    <>
      <section className="au-hero pr-hero">
        <div>
          <h1>El sistema de tu agencia de autos</h1>
          <p className="au-hero-bajada">
            Stock, ventas, interesados y tu propio sitio con el catálogo, en un solo lugar. Hecho para agencias argentinas:
            pesos y dólares, toma de usados, consignación y los papeles de la transferencia.
          </p>
          <p className="au-hero-acciones">
            <a href={`${ERP}/auth/registro`} className="au-boton pr-boton">Registrá tu agencia</a>
            <a href="#incluye" className="au-boton au-boton--linea au-boton--clara">Ver qué incluye</a>
          </p>
          {p && <p className="pr-nota">Gratis hasta {p.unidades_gratis} unidades en stock. Sin tarjeta.</p>}
        </div>
      </section>

      <section className="au-seccion" id="incluye" aria-labelledby="t-incluye">
        <h2 id="t-incluye">Qué incluye</h2>
        <ul className="pr-incluye">
          {INCLUYE.map(([titulo, texto]) => <li key={titulo}><b>{titulo}</b><span>{texto}</span></li>)}
        </ul>
      </section>

      <section className="au-seccion" aria-labelledby="t-empezar">
        <h2 id="t-empezar">Cómo se empieza</h2>
        <ol className="au-pasos">
          <li><b>Registrás la agencia</b><span>Con tu correo. Confirmás la cuenta y ya entrás.</span></li>
          <li><b>Cargás tu stock</b><span>Los autos, sus papeles y sus fotos. El sistema te guía con los primeros pasos.</span></li>
          <li><b>Publicás</b><span>Los autos que elijas aparecen en tu sitio, y las consultas te llegan al sistema.</span></li>
        </ol>
      </section>

      {p && (
        <section className="au-seccion" id="planes" aria-labelledby="t-planes">
          <h2 id="t-planes">Planes</h2>
          <div className="pr-planes">
            <article>
              <h3>Gratis</h3>
              <p className="pr-precio">$ 0</p>
              <p>Hasta {p.unidades_gratis} unidades en stock a la vez. Todo el sistema y tu sitio, sin límite de tiempo.</p>
            </article>
            <article className="pr-plan-pago">
              <h3>Completo</h3>
              <p className="pr-precio">{pesos(p.precio_mensual)} <small>por mes</small></p>
              <p>Sin tope de unidades. Si un mes no pagás, no perdés nada: podés ver todo y terminar lo que está en curso.</p>
            </article>
          </div>
        </section>
      )}

      <section className="au-banda">
        <div>
          <h2>Probalo con tus autos</h2>
          <p>Registrás la agencia en un minuto y empezás a cargar el stock.</p>
        </div>
        <a href={`${ERP}/auth/registro`} className="au-boton pr-boton">Registrá tu agencia</a>
      </section>
    </>
  );
}
