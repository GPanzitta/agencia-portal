/**
 * Los orígenes que el optimizador de imágenes de Next (`/_next/image`) acepta
 * bajar y recodificar. Cada patrón es una puerta: cualquiera puede pedir
 * `/_next/image?url=<algo de ese host>` y el servidor del portal lo baja y lo
 * recodifica con su CPU. Con `*.googleusercontent.com`
 * y `res.cloudinary.com/**` entraba cualquier archivo de cualquier cuenta de
 * Google o de Cloudinary (auditoría de seguridad del portal 14/10/2026,
 * SEG-POR-05; la falla grave del optimizador, SEG-02, ya se cerró con Next 16.3.8).
 *
 * - el backend (sus `/uploads`);
 * - las fotos de los autores de las opiniones de Google: `lh3` a `lh6`;
 * - Cloudinary: sólo la cuenta propia si está `CLOUDINARY_CLOUD_NAME` en
 *   el build; sin ella, cualquier cuenta, como antes.
 */
type Patron = { protocol: 'http' | 'https'; hostname: string; port?: string; pathname?: string };

export function patronesDeImagenes(apiUrl: string, entorno: Record<string, string | undefined> = process.env): Patron[] {
  const backend = new URL(apiUrl);
  const nube = entorno.CLOUDINARY_CLOUD_NAME?.trim();
  return [
    {
      protocol: backend.protocol.replace(':', '') as 'http' | 'https',
      hostname: backend.hostname,
      ...(backend.port ? { port: backend.port } : {}),
      pathname: '/**',
    },
    ...['lh3', 'lh4', 'lh5', 'lh6'].map((h) => ({ protocol: 'https' as const, hostname: `${h}.googleusercontent.com` })),
    {
      protocol: 'https',
      hostname: 'res.cloudinary.com',
      ...(nube && /^[a-z0-9_-]+$/i.test(nube) ? { pathname: `/${nube}/**` } : {}),
    },
  ];
}
