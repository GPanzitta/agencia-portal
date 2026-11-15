/**
 * Cabeceras de seguridad de todo el sitio (SEG-12). Las arma `next.config.ts`.
 *
 * Se APLICAN las que no pueden romper nada:
 * - no dejarse enmarcar (`X-Frame-Options` + `frame-ancestors`);
 * - `nosniff`, `Referrer-Policy` (el token de `/reserva/<token>` no viaja
 *   en el referer a otros sitios) y `Permissions-Policy`;
 * - HSTS sólo en producción (en dev es http://localhost).
 *
 * La CSP completa va en **modo informe** (`Content-Security-Policy-Report-Only`):
 * el navegador avisa en la consola lo que bloquearía, pero no bloquea. Lleva
 * `'unsafe-inline'` en scripts porque Next mete scripts en línea (hidratación)
 * y las alternativas (nonce) obligan a renderizar todo dinámico.
 *
 * La lista de orígenes permitidos viene del sitio anterior (mapas, videos,
 * Mercado Pago) y es más ancha de lo que hoy usa la agencia: achicarla es una
 * decisión de seguridad aparte, que pide recorrer el sitio con la consola
 * abierta.
 *
 * **Pasarla a obligatoria** (SEG-POR-06): con `CSP_OBLIGATORIA=1` en el
 * entorno del BUILD, la misma política sale como `Content-Security-Policy` y
 * deja de ir la de informe. Para volver atrás alcanza con sacar la variable y
 * redeployar.
 */
type Cabecera = { key: string; value: string };

/** Mercado Pago, para `form-action`: un pago sin JavaScript termina en una redirección a su dominio. */
const MERCADO_PAGO = ['https://www.mercadopago.com.ar', 'https://*.mercadopago.com.ar', 'https://*.mercadopago.com'];

export function politicaDeContenido(backendOrigen: string, prod: boolean): string {
  const backend = new URL(backendOrigen);
  const ws = `${backend.protocol === 'https:' ? 'wss:' : 'ws:'}//${backend.host}`;
  const directivas: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", ...(prod ? [] : ["'unsafe-eval'"])],
    'style-src': ["'self'", "'unsafe-inline'"],
    // next/font/google descarga las fuentes en el build: salen del propio sitio.
    'font-src': ["'self'", 'data:'],
    'img-src': [
      "'self'", 'data:', 'blob:', backend.origin,
      'https://res.cloudinary.com', 'https://images.pexels.com',
      'https://*.googleusercontent.com', 'https://i.ytimg.com',
      'https://*.tile.openstreetmap.org',
    ],
    'media-src': ["'self'", 'blob:', backend.origin, 'https://res.cloudinary.com', 'https://videos.pexels.com'],
    'connect-src': ["'self'", backend.origin, ws],
    'frame-src': ['https://www.google.com', 'https://maps.google.com', 'https://www.youtube-nocookie.com'],
    'worker-src': ["'self'", 'blob:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'", ...MERCADO_PAGO],
    'frame-ancestors': ["'none'"],
  };
  const politica = Object.entries(directivas).map(([nombre, valores]) => `${nombre} ${valores.join(' ')}`);
  // Con el backend en https (producción), nada del sitio se pide por http.
  // En local (`npm start` contra http://localhost:3200) no va: lo rompería.
  if (prod && backend.protocol === 'https:') politica.push('upgrade-insecure-requests');
  return politica.join('; ');
}

export function cabecerasDeSeguridad(
  backendOrigen: string,
  prod: boolean,
  { cspObligatoria = false }: { cspObligatoria?: boolean } = {},
): Cabecera[] {
  const politica = politicaDeContenido(backendOrigen, prod);
  return [
    ...(cspObligatoria
      ? [{ key: 'Content-Security-Policy', value: politica }]
      : [
          // Lo de la CSP que se aplica ya: no hay <object>/<embed> ni <base> en el sitio.
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'" },
          { key: 'Content-Security-Policy-Report-Only', value: politica },
        ]),
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
    },
    ...(prod ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }] : []),
  ];
}

/**
 * Lo que se suma en la página por token (`/reserva/<token>`, SEG-POR-04).
 * El token ES la llave de la reserva:
 * - `Referrer-Policy: no-referrer`: ni siquiera el origen viaja a otros
 *   sitios, y la URL entera nunca;
 * - `X-Robots-Tag`: además del `noindex` de la metadata (que sólo ve quien
 *   lee el HTML), que ningún buscador ni vista previa la guarde.
 */
export function cabecerasDePaginasConToken(): Cabecera[] {
  return [
    { key: 'Referrer-Policy', value: 'no-referrer' },
    { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
  ];
}
