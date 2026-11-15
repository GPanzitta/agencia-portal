import { localidadDe, type Acento, type PerfilPublico } from './perfil';

/**
 * La identidad de la agencia para las imágenes que el sitio GENERA: el ícono
 * de la pestaña, el de iOS, la tarjeta de WhatsApp y el manifest.
 *
 * Vive acá y no en cada archivo porque los cuatro son rutas de metadata de
 * Next (`app/icon.tsx`, `app/apple-icon.tsx`, `app/opengraph-image.tsx`,
 * `app/manifest.ts`) y una ruta no le puede importar nada a otra sin que se
 * arrastren entre sí. Todo lo de acá es función pura o tabla: lo que sale del
 * backend lo pide cada ruta con `perfil()`.
 */

/**
 * Los acentos, en TypeScript porque `ImageResponse` arma un PNG en el
 * servidor: no hay hoja de estilos de donde leerlos.
 */
export const ACENTO_HEX: Record<Acento, string> = {
  amarillo: '#f5c518',
  naranja: '#f97316',
  celeste: '#38bdf8',
  verde: '#22c55e',
  rojo: '#ef4444',
  violeta: '#a78bfa',
  fuego: '#ff7801',
};

/**
 * La tinta que va ARRIBA del acento, y el fondo de la tarjeta social y del
 * manifest. Negro puro: da contraste de sobra sobre los siete acentos. El
 * orden es siempre tinta sobre acento, nunca al revés.
 */
export const TINTA = '#000000';

/**
 * La inicial de la agencia, que es lo único que entra en 32 px. Se busca la
 * primera letra o dígito y no el primer carácter a secas para que un nombre
 * que arranca con comilla o guion no dibuje el signo.
 */
export function inicial(nombre: string): string {
  const letra = [...nombre.trim()].find((c) => /[\p{L}\p{N}]/u.test(c));
  // Sin nombre queda la del nombre por defecto ('Agencia de autos'): un
  // cuadrado vacío se lee como ícono roto.
  return (letra ?? 'A').toLocaleUpperCase('es-AR');
}

/**
 * Dónde, para la tarjeta: la localidad primero, que es lo que ubica a alguien
 * que ve el link en un grupo de WhatsApp; si no, la dirección.
 */
export function donde(p: Pick<PerfilPublico, 'direccion' | 'zona'>): string | null {
  return localidadDe(p) ?? p.direccion;
}

/**
 * Lo que contestan el ícono, el de iOS y la tarjeta social cuando `perfil()`
 * cayó al respaldo.
 *
 * Una página se vuelve a pedir; estas imágenes no: el favicon del resultado de
 * Google, la vista previa de WhatsApp y el ícono de la pantalla de inicio los
 * guarda quien los pide, a veces por semanas. Dibujarlas con el respaldo es
 * dejar guardada una inicial que no es de la agencia. Un 503 con `Retry-After`
 * dice lo que pasa de verdad —el backend se está despertando— y que se vuelva
 * a pedir en un rato.
 */
export function perfilNoDisponible(): Response {
  return new Response(null, {
    status: 503,
    headers: { 'Retry-After': '120', 'Cache-Control': 'no-store' },
  });
}
