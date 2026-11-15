import type { NextConfig } from 'next';
import { cabecerasDePaginasConToken, cabecerasDeSeguridad } from './app/lib/cabeceras-seguridad';
import { patronesDeImagenes } from './app/lib/imagenes-remotas';

// Origen del backend (sin /api): en dev corre en :3200; en el deploy sale de
// NEXT_PUBLIC_API_URL, la misma variable que usa la app.
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3200/api';
const backend = new URL(apiUrl);

// El host canónico del sitio, el mismo con el que `app/lib/sitio.ts` arma
// canónicos y sitemap. Acá sirve para el redirect de host de más abajo.
const sitio = process.env.NEXT_PUBLIC_SITE_URL;

// El dominio del que cuelgan las agencias, como patrón de host (con o sin puerto).
const dominioBase = (process.env.NEXT_PUBLIC_DOMINIO_BASE || 'localhost').toLowerCase().split('.').join('[.]') + '(?::[0-9]+)?';

const nextConfig: NextConfig = {
  // Sin `X-Powered-By: Next.js` (SEG-12): no regalar la versión del framework.
  poweredByHeader: false,
  // En desarrollo cada agencia se prueba en `<agencia>.localhost`: sin esto Next no le sirve sus recursos.
  allowedDevOrigins: ['*.localhost'],
  experimental: {
    // Las fotos de «Vendé tu auto» pasan por una server action (`(autos)/acciones.ts`),
    // y el tope por defecto del cuerpo es 1 MB. El formulario ya las achica antes de mandarlas.
    serverActions: { bodySizeLimit: '12mb' },
  },
  images: {
    // Sin `formats`: el default es WebP (AVIF cuesta varias veces más CPU).
    // SEG-POR-05: sólo los orígenes que se usan (ver app/lib/imagenes-remotas.ts).
    remotePatterns: patronesDeImagenes(apiUrl),
  },
  /**
   * Render no deja de servir el subdominio `*.onrender.com` cuando se agrega
   * un dominio propio: los dos hosts contestan 200 con el mismo HTML, y eso es
   * contenido duplicado con las señales de enlace repartidas entre los dos. El
   * canónico ayuda, pero es una sugerencia; el 308 no.
   *
   * Queda puesto desde ahora sin hacer nada: mientras el canónico SEA el de
   * Render, el lookahead lo excluye y la regla no matchea nunca.
   *
   * A propósito acotado a `*.onrender.com` en vez de "cualquier host que no sea
   * el canónico": el health check de Render (render.yaml, `healthCheckPath`)
   * pega al host interno, y un 308 ahí deja el deploy sin pasar. Si algún día
   * aparece otro alias que haya que absorber, se agrega su patrón acá.
   */
  async redirects() {
    if (!sitio) return [];
    const canonico = new URL(sitio);
    // Next compara el hostname sin puerto y en minúsculas contra `^valor$`.
    const host = canonico.hostname.replace(/\./g, '\\.');
    return [
      {
        source: '/:ruta*',
        has: [{ type: 'host' as const, value: `(?!${host}$)[a-z0-9-]+\\.onrender\\.com` }],
        destination: `${canonico.origin}/:ruta*`,
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      // La portada del sitio es la de la agencia (`/inicio`), servida en `/`.
      beforeFiles: [
        // Con `PORTADA_PRODUCTO=1`, el dominio pelado (sin nombre de agencia delante) muestra la página
        // del producto, donde se registra una agencia nueva. Sin eso muestra la agencia por defecto.
        ...(process.env.PORTADA_PRODUCTO === '1'
          ? [{ source: '/', has: [{ type: 'host' as const, value: dominioBase }], destination: '/fg-autos' }]
          : []),
        { source: '/', destination: '/inicio' },
      ],
      afterFiles: [
        // Proxy de imágenes del backend — /uploads/* → <backend>/uploads/*
        {
          source: '/uploads/:path*',
          destination: `${backend.origin}/uploads/:path*`,
        },
      ],
      fallback: [],
    };
  },
  // SEG-12: cabeceras de seguridad en todo el sitio (ver app/lib/cabeceras-seguridad.ts).
  async headers() {
    return [
      {
        source: '/:ruta*',
        headers: cabecerasDeSeguridad(backend.origin, process.env.NODE_ENV === 'production', {
          // SEG-POR-06: la CSP completa pasa a obligatoria con CSP_OBLIGATORIA=1 (se lee en el build).
          cspObligatoria: process.env.CSP_OBLIGATORIA === '1',
        }),
      },
      // SEG-POR-04: la página por token. Va después: la misma clave pisa a la de arriba.
      { source: '/reserva/:token', headers: cabecerasDePaginasConToken() },
    ];
  },
};

export default nextConfig;
