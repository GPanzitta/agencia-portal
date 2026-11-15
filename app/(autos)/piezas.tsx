import type { Auto } from '../lib/autos';

/**
 * MAQUETA (14/11/2026): piezas de la propuesta de sitio nuevo. No reemplaza al sitio
 * actual; vive en /maqueta para mirarla y decidir.
 */
export type Tipo = 'auto' | 'suv' | 'pickup' | 'utilitario';
export const TIPOS: [Tipo | 'todos', string][] = [['todos', 'Todos'], ['auto', 'Autos'], ['suv', 'SUV'], ['pickup', 'Pick-ups'], ['utilitario', 'Utilitarios']];

const PICKUPS = /hilux|amarok|ranger|s10|frontier|toro|strada|saveiro|titano|maverick|rampage|l200|alaskan|oroch/i;
const SUVS = /kardian|tracker|t-cross|taos|nivus|compass|renegade|duster|captur|kicks|corolla cross|ecosport|territory|2008|3008|c3 aircross|pulse|fastback|hr-v|creta|tiggo|koleos|sw4|bronco|kuga/i;
const UTILITARIOS = /kangoo|partner|berlingo|fiorino|transit|master|sprinter|boxer|ducato|doblo|trafic/i;

/** Qué clase de vehículo es, por lo que dice la ficha o, si no lo dice, por el modelo. */
export function tipoDe(a: Pick<Auto, 'carroceria' | 'modelo'>): Tipo {
  const c = (a.carroceria ?? '').toLowerCase();
  if (c === 'pickup' || PICKUPS.test(a.modelo)) return 'pickup';
  if (c === 'suv' || SUVS.test(a.modelo)) return 'suv';
  if (c === 'utilitario' || c === 'monovolumen' || UTILITARIOS.test(a.modelo)) return 'utilitario';
  return 'auto';
}

const COLORES: [RegExp, string][] = [
  [/blanc/i, '#e9ecee'], [/negr/i, '#23282d'], [/gris|plata|platead/i, '#8b949c'], [/roj|bord/i, '#b3261e'], [/azul/i, '#2a4f8f'],
  [/naranj/i, '#d2691e'], [/verd/i, '#3f6b52'], [/beige|arena|champ/i, '#c9b79a'], [/amarill/i, '#e0b020'], [/marr/i, '#6b4a34'],
];
const DE_RESERVA = ['#8b949c', '#b3261e', '#2a4f8f', '#e9ecee', '#23282d', '#3f6b52'];

/** El color con el que se dibuja: el de la ficha o, si no tiene, uno fijo para ese auto. */
export function pinturaDe(a: Pick<Auto, 'color' | 'id'>): string {
  const hallado = COLORES.find(([re]) => re.test(a.color ?? ''));
  if (hallado) return hallado[1];
  return DE_RESERVA[[...a.id].reduce((n, ch) => n + ch.charCodeAt(0), 0) % DE_RESERVA.length];
}

const CARROCERIA: Record<Tipo | 'sedan', { cuerpo: string; vidrios: string[] }> = {
  auto: {
    cuerpo: 'M22 94V78q2-13 24-17l46-7q24-27 66-28h74q30 2 48 26l16 8q8 6 8 20v14Z',
    vidrios: ['M104 55q22-22 54-23h14v23Z', 'M180 32h50q22 2 36 23h-86Z'],
  },
  sedan: {
    cuerpo: 'M20 94V80q2-12 24-16l52-8q24-26 64-28h46q30 2 52 28l34 6q12 4 12 18v20Z',
    vidrios: ['M106 56q20-20 52-22h14v22Z', 'M180 34h24q24 2 42 22h-66Z'],
  },
  suv: {
    cuerpo: 'M20 94V70q2-12 24-16l44-6q22-28 64-30h94q26 2 40 28l12 8q8 6 8 22v20Z',
    vidrios: ['M98 48q20-22 52-24h18v24Z', 'M176 24h64q18 2 30 24h-94Z'],
  },
  pickup: {
    cuerpo: 'M18 94V72q2-12 24-16l44-6q20-28 60-30h50q8 0 10 10l2 30h92q6 2 6 10v30Z',
    vidrios: ['M96 50q18-22 50-24h8v24Z', 'M162 26h36l2 24h-38Z'],
  },
  utilitario: {
    cuerpo: 'M18 94V68q4-28 44-42l218-2q24 0 26 18v52Z',
    vidrios: ['M40 62q8-20 36-30h30v30Z', 'M116 32h60v30h-60Z'],
  },
};

/** Un auto dibujado de costado, del color de la unidad. En el sitio real acá va la foto recortada. */
export function AutoDibujo({ tipo, color, sedan = false }: { tipo: Tipo; color: string; sedan?: boolean }) {
  const c = CARROCERIA[tipo === 'auto' && sedan ? 'sedan' : tipo];
  const claro = color === '#e9ecee';
  return (
    <svg viewBox="0 0 324 124" className="mq-auto" role="img" aria-label="Dibujo del auto: acá va la foto">
      <ellipse cx="162" cy="112" rx="142" ry="7" fill="#000" opacity="0.28" />
      <path d={c.cuerpo} fill={color} stroke={claro ? '#aab1b6' : 'none'} strokeWidth="1.5" />
      <path d="M22 84h284v10H22Z" fill="#000" opacity="0.16" />
      {c.vidrios.map((v) => <path key={v} d={v} fill="#1c2329" opacity="0.88" />)}
      <rect x="296" y="66" width="12" height="7" rx="2" fill="#ffe9a8" />
      <rect x="18" y="68" width="9" height="7" rx="2" fill="#d23b2f" />
      {[80, 244].map((x) => (
        <g key={x}>
          <circle cx={x} cy="94" r="23" fill="#14181b" />
          <circle cx={x} cy="94" r="12" fill="#c9cfd3" />
          <circle cx={x} cy="94" r="4" fill="#14181b" />
        </g>
      ))}
    </svg>
  );
}

const SEDANES = /cronos|corolla|virtus|logan|versa|vento|civic|sentra|prisma|siena|fluence|city|yaris sedan|408/i;
export const esSedan = (a: Pick<Auto, 'modelo' | 'carroceria'>): boolean => (a.carroceria ?? '') === 'sedan' || SEDANES.test(a.modelo);

/**
 * Cómo se ve un auto en el sitio (15/11/2026): con la foto de portada que la agencia subió desde
 * el ERP. El dibujo queda sólo para el auto que todavía no tiene ninguna foto cargada.
 */
export function Estampa({ a, prioridad = false }: { a: Auto; prioridad?: boolean }) {
  if (!a.portada) return <AutoDibujo tipo={tipoDe(a)} color={pinturaDe(a)} sedan={esSedan(a)} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <span className="mq-marco"><img className="mq-foto" src={a.portada} alt={`${a.marca} ${a.modelo}`} loading={prioridad ? 'eager' : 'lazy'} /></span>;
}
