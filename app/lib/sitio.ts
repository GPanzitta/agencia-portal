/**
 * La URL pública con la que el sitio se identifica ante Google. De acá cuelga
 * el `metadataBase` del layout raíz (y con él cada canónico), el sitemap.xml,
 * la línea `Sitemap:` del robots.txt y el link del auto que viaja en el
 * mensaje de WhatsApp.
 *
 * En producción es obligatoria y el build se cae si falta: las `NEXT_PUBLIC_*`
 * se inlinean EN EL BUILD, y sin ella todo eso sale a `http://localhost:3201`
 * sin que se note en el navegador. Preferimos un deploy que falla ruidoso a
 * uno invisible.
 *
 * El `typeof window` evita que un visitante se coma la excepción si este
 * módulo llega al bundle del navegador: ahí la condición es falsa siempre.
 */
const urlConfigurada = process.env.NEXT_PUBLIC_SITE_URL?.trim();

if (typeof window === 'undefined' && !urlConfigurada && process.env.NODE_ENV === 'production') {
  throw new Error(
    'Falta NEXT_PUBLIC_SITE_URL. Se lee EN EL BUILD: sin ella los canónicos, el sitemap.xml, el robots.txt y la tarjeta de WhatsApp salen a http://localhost:3201 y Google no indexa nada. Cargala en Render (Environment) y volvé a deployar.',
  );
}

/**
 * Se tolera el host pelado (sin `https://`), que es como queda si alguien lo
 * copia del panel de Render: un valor sin esquema hace reventar al
 * `new URL(SITIO)` del layout con un "Invalid URL" que no dice de dónde salió.
 */
export const SITIO = (
  urlConfigurada
    ? /^https?:\/\//i.test(urlConfigurada)
      ? urlConfigurada
      : `https://${urlConfigurada}`
    : 'http://localhost:3201'
).replace(/\/+$/, '');

export const urlDe = (camino: string) => `${SITIO}${camino.startsWith('/') ? camino : `/${camino}`}`;

/**
 * Las fotos llegan como `/uploads/...` (backend en dev, rewrite de Next) o ya
 * absolutas (`https://res.cloudinary.com/...` en el deploy): esas van tal cual.
 */
export const urlAbsolutaDeFoto = (ruta: string | null) =>
  ruta ? (/^https?:\/\//i.test(ruta) ? ruta : urlDe(ruta)) : null;
