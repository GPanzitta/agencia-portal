'use server';

/**
 * Los formularios del sitio de la agencia (12/11/2026): consultar por un auto,
 * ofrecer el propio y el contacto general. Los tres terminan en el mismo lugar
 * del ERP: Interesados. Corre en el servidor: el navegador nunca le habla
 * directo al backend, así que no depende de CORS ni expone la URL de la API.
 */
import { cabecerasDeAgencia } from '../lib/agencia-servidor';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3200/api';

export interface EstadoConsulta {
  enviada: boolean;
  error: string | null;
}

const MAXIMO_FOTOS = 6;
const TOPE_FOTO = 8 * 1024 * 1024;

const NO_SE_PUDO = 'No pudimos enviar la consulta. Probá de nuevo o escribinos por WhatsApp.';

export async function enviarConsulta(_previo: EstadoConsulta, datos: FormData): Promise<EstadoConsulta> {
  const texto = (clave: string) => String(datos.get(clave) ?? '').trim();
  const nombre = texto('nombre');
  const telefono = texto('telefono');
  const partes = texto('dia_preferido').split('-');
  const dia = partes.length === 3 && partes.every((p) => p !== '' && !Number.isNaN(Number(p))) && partes[0].length === 4 ? texto('dia_preferido') : undefined;
  let asunto = ['consulta', 'vender', 'contacto', 'aviso'].includes(texto('asunto')) ? texto('asunto') : 'consulta';
  // Quien consulta por un auto y elige un día, está pidiendo una visita.
  if (asunto === 'consulta' && dia && texto('unidad_id')) asunto = 'visita';
  const tope = texto('precio_max').split('').filter((c) => c >= '0' && c <= '9').join('');
  if (nombre.length < 2) return { enviada: false, error: 'Decinos tu nombre.' };
  if (telefono.replace(/\D/g, '').length < 8) return { enviada: false, error: 'Dejanos un teléfono con característica, así te contestamos.' };

  // «Vendé tu auto»: los datos del auto van juntos en una línea, como los leería el vendedor.
  let usado: string | undefined;
  let usadoDatos: string | undefined;
  if (asunto === 'vender') {
    const marca = texto('usado_marca');
    const modelo = texto('usado_modelo');
    const anio = texto('usado_anio');
    const km = texto('usado_km').replace(/\D/g, '');
    const version = texto('usado_version');
    const elegido = (clave: string, validos: string[]) => (validos.includes(texto(clave)) ? texto(clave) : null);
    const combustible = elegido('usado_combustible', ['nafta', 'diesel', 'gnc', 'hibrido', 'electrico']);
    const caja = elegido('usado_caja', ['manual', 'automatica']);
    const estado = elegido('usado_estado', ['excelente', 'bueno', 'regular', 'a reparar']);
    const ROTULOS: Record<string, string> = { diesel: 'diésel', gnc: 'nafta y GNC', hibrido: 'híbrido', electrico: 'eléctrico', automatica: 'automática' };
    if (marca.length < 2 || !modelo || !/^(19|20)\d{2}$/.test(anio)) {
      return { enviada: false, error: 'Contanos la marca, el modelo y el año de tu auto.' };
    }
    usado = [
      [marca, modelo, version, anio].filter(Boolean).join(' '),
      km ? `${Number(km).toLocaleString('es-AR')} km` : null,
      caja ? `caja ${ROTULOS[caja] ?? caja}` : null,
      combustible ? ROTULOS[combustible] ?? combustible : null,
      estado ? `estado ${estado}` : null,
    ].filter(Boolean).join(', ').slice(0, 200);
    // Los mismos datos, sueltos: el ERP los usa para pasar el auto al stock sin tipearlo de nuevo.
    usadoDatos = JSON.stringify({ marca, modelo, version: version || null, anio: Number(anio), km: km ? Number(km) : null, combustible, transmision: caja });
  }

  // Las fotos del auto que ofrece. El formulario ya las achicó; acá sólo se cuida el tope.
  const fotos = asunto === 'vender'
    ? datos.getAll('fotos').filter((f): f is File => f instanceof File && f.size > 0)
    : [];
  if (fotos.length > MAXIMO_FOTOS) return { enviada: false, error: `Mandanos hasta ${MAXIMO_FOTOS} fotos.` };
  if (fotos.some((f) => !f.type.startsWith('image/') || f.size > TOPE_FOTO)) {
    return { enviada: false, error: 'Una de las fotos no se pudo enviar. Quitala y probá de nuevo.' };
  }

  const campos: Record<string, string | undefined> = {
    nombre: nombre.slice(0, 120),
    telefono: telefono.slice(0, 40),
    asunto,
    mensaje: texto('mensaje').slice(0, 1000) || undefined,
    unidad_id: texto('unidad_id') || undefined,
    tiene_usado: usado,
    usado_datos: usadoDatos,
    dia_preferido: asunto === 'visita' ? dia : undefined,
    ...(asunto === 'aviso' ? {
      busca_marca: texto('busca_marca').slice(0, 60) || undefined,
      busca_carroceria: texto('busca_carroceria') || undefined,
      precio_max: tope || undefined,
      precio_moneda: tope ? (texto('precio_moneda') === 'ARS' ? 'ARS' : 'USD') : undefined,
    } : {}),
    intencion: asunto === 'vender' && ['vender', 'entregar', 'consignar'].includes(texto('intencion')) ? texto('intencion') : undefined,
    // El campo trampa viaja tal cual: el backend decide qué hacer con un bot.
    sitio_web: texto('sitio_web') || undefined,
  };
  // Con fotos va como formulario con archivos; sin fotos, como siempre.
  let cuerpo: BodyInit = JSON.stringify(campos);
  if (fotos.length) {
    const envio = new FormData();
    for (const [clave, valor] of Object.entries(campos)) if (valor !== undefined) envio.append(clave, valor);
    fotos.forEach((f, i) => envio.append('fotos', f, `foto-${i + 1}.jpg`));
    cuerpo = envio;
  }

  try {
    const res = await fetch(`${API}/catalogo/consultas`, {
      method: 'POST',
      // La consulta entra a la agencia dueña de la dirección por la que se está mirando el sitio.
      // Con archivos, el tipo de contenido (con su borde) lo pone `fetch`.
      headers: { ...(fotos.length ? {} : { 'Content-Type': 'application/json' }), ...(await cabecerasDeAgencia()) },
      body: cuerpo,
      cache: 'no-store',
      signal: AbortSignal.timeout(fotos.length ? 30000 : 8000),
    });
    if (res.status === 429) return { enviada: false, error: 'Recibimos varias consultas seguidas. Probá de nuevo en un rato o escribinos por WhatsApp.' };
    if (!res.ok) return { enviada: false, error: NO_SE_PUDO };
    return { enviada: true, error: null };
  } catch {
    return { enviada: false, error: NO_SE_PUDO };
  }
}
