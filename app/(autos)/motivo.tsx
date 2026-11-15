'use client';

const MOTIVOS = [
  { valor: 'vender', rotulo: 'Vender', titulo: '¿Cómo funciona la venta?', texto: 'Lo miramos, te pasamos un valor y, si te sirve, te lo pagamos en el momento, en pesos o en dólares. La transferencia la hacemos nosotros.' },
  { valor: 'entregar', rotulo: 'Permutar', titulo: '¿Cómo funciona la permuta?', texto: 'Elegís un auto de nuestro stock, tomamos el tuyo en parte de pago y pagás la diferencia: de contado o en cuotas.' },
  { valor: 'consignar', rotulo: 'Consignar', titulo: '¿Cómo funciona la consignación?', texto: 'Dejás el auto en nuestro salón y lo vendemos por vos. Acordamos el precio piso, lo publicamos y cobrás cuando se vende.' },
] as const;

export type MotivoDeCotizacion = (typeof MOTIVOS)[number]['valor'];

/** Lo primero que se pregunta al cotizar: para qué. La respuesta cambia lo que se le explica y viaja con el pedido. */
export default function Motivo({ elegido, onElegir }: { elegido: MotivoDeCotizacion; onElegir: (m: MotivoDeCotizacion) => void }) {
  const m = MOTIVOS.find((x) => x.valor === elegido) ?? MOTIVOS[0];
  return (
    <div className="mq-motivo">
      <h2>Motivo por el que querés cotizar</h2>
      <div className="mq-chips" role="radiogroup" aria-label="Motivo">
        {MOTIVOS.map((x) => (
          <button key={x.valor} type="button" role="radio" aria-checked={elegido === x.valor} onClick={() => onElegir(x.valor)}>{x.rotulo}</button>
        ))}
      </div>
      <div aria-live="polite">
        <h3>{m.titulo}</h3>
        <p>{m.texto}</p>
      </div>
    </div>
  );
}
