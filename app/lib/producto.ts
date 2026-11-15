/** La página del producto FG autos (tanda 2, 12/11/2026). */

/** Dónde se registra y dónde entra una agencia: el ERP. */
export const ERP = (process.env.NEXT_PUBLIC_ERP_URL || 'http://localhost:4400').replace(/[/]+$/, '');

export interface Plan { unidades_gratis: number; precio_mensual: number }

/** «$ 25.000». */
export const pesos = (n: number): string => `$ ${Math.round(n).toLocaleString('es-AR')}`;

/** Sólo lo que el sistema hace hoy: si se agrega algo acá, tiene que existir. */
export const INCLUYE: [titulo: string, texto: string][] = [
  ['Stock por unidad', 'Cada auto con su dominio, sus fotos, sus días en stock y lo que lleva puesto: lo que se pagó más cada gasto de alistaje.'],
  ['Pesos y dólares', 'Precios, gastos y pagos en las dos monedas, cada uno con el tipo de cambio del día en que se hizo.'],
  ['Papeles con semáforo', 'Título, cédula, 08, informe de dominio y verificación: el sistema no deja entregar un auto con papeles que frenan la transferencia.'],
  ['Reserva, seña y venta', 'Pagos mixtos, usado en parte de pago que entra solo al stock, recibo de seña y boleto con los datos ya cargados.'],
  ['Consignación', 'Con el precio piso del dueño del auto, para saber cuánto le queda a la agencia en cada operación.'],
  ['Interesados', 'Quién consultó, qué busca y cuándo hay que volver a hablarle. Te avisa qué autos del stock le sirven a cada uno.'],
  ['Tu propio sitio', 'El catálogo con tus autos publicados en una dirección tuya. Las consultas entran solas a tu lista de interesados.'],
  ['Vendedores sin costos', 'Tu equipo carga, reserva y cobra, pero el costo y el margen de cada auto los ves solamente vos.'],
];
