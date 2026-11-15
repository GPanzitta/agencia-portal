/**
 * Espejo de `src/common/whatsapp.util.ts` del backend: el portal puede
 * correr contra un backend viejo que todavía manda el número sin el 549, así
 * que `linkWhatsapp` lo normaliza de nuevo (sobre uno ya normalizado no cambia nada).
 *
 * El número de WhatsApp de Argentina en formato E.164 sin el `+`
 * (`5491133313834`), que es lo único que `wa.me` entiende.
 *
 * Antes cada lugar sacaba los no-dígitos y listo: un teléfono cargado como
 * "11 3331-3834" salía `wa.me/1133313834`, que abre un chat con un número que
 * no existe. Para un celular argentino `wa.me` necesita el 54 del país y el 9
 * de móvil, sin el 0 del área ni el 15.
 *
 * Reglas, en orden:
 * - sólo dígitos; un `00` internacional adelante se descarta;
 * - `549…` ya está bien;
 * - `54…` sin el 9: se le agrega, si lo que queda es un número nacional;
 * - se saca el 0 del código de área;
 * - si después de un área de 2 a 4 dígitos viene el 15 del celular y sacarlo
 *   deja 10 dígitos, se saca (`011 15 3331 3834` → `11 3331 3834`);
 * - 10 dígitos nacionales → `549` adelante.
 *
 * Cualquier otra cosa sale como vino (sólo dígitos): un número de afuera o
 * uno incompleto no se adivina.
 */
export function whatsappArgentino(telefono: string | null | undefined): string | null {
  let digitos = String(telefono ?? '').replace(/\D/g, '');
  if (digitos.startsWith('00')) digitos = digitos.slice(2);
  if (!digitos) return null;
  if (digitos.startsWith('549')) return digitos;
  // Ningún código de área argentino empieza con 5: un 54 adelante es el país.
  const nacional = nacionalDeDiez(digitos.startsWith('54') ? digitos.slice(2) : digitos);
  return nacional ? `549${nacional}` : digitos;
}

/** El número nacional de 10 dígitos (área + abonado, sin 0 ni 15), o null si no se llega. */
function nacionalDeDiez(numero: string): string | null {
  const sinCero = numero.startsWith('0') ? numero.slice(1) : numero;
  if (sinCero.length === 10) return sinCero;
  if (sinCero.length === 12) {
    for (let area = 2; area <= 4; area++) {
      if (sinCero.slice(area, area + 2) === '15') return sinCero.slice(0, area) + sinCero.slice(area + 2);
    }
  }
  return null;
}

/**
 * El `href` para llamar: el teléfono tal como lo cargó la agencia, sin
 * espacios ni guiones (`tel:` no los necesita y algunos marcadores se
 * confunden). Es lo mismo que el cliente tipearía a mano: no se adivina si es
 * celular o fijo. `null` si no hay dígitos.
 */
export function linkTelefono(telefono: string | null | undefined): string | null {
  const limpio = String(telefono ?? '').replace(/[^\d+]/g, '');
  return /\d/.test(limpio) ? `tel:${limpio}` : null;
}

/**
 * El teléfono con el +54 adelante para el JSON-LD (`telephone`, POR-25):
 * Google lo pide en formato internacional. Un celular reconocible (con el 15
 * o ya con el 549) sale con el 9 de móvil; un número nacional de 10 dígitos
 * sin esas marcas sale como fijo (`+54 1143214321`), que es lo que se marca
 * desde afuera. Lo que no se reconoce sale como vino: no se adivina.
 */
export function telefonoInternacional(telefono: string | null | undefined): string | null {
  const crudo = String(telefono ?? '').trim();
  let digitos = crudo.replace(/\D/g, '');
  if (digitos.startsWith('00')) digitos = digitos.slice(2);
  if (!digitos) return null;
  if (digitos.startsWith('549') && digitos.length === 13) return `+54 9 ${digitos.slice(3)}`;
  const resto = digitos.startsWith('54') && digitos.length === 12 ? digitos.slice(2) : digitos;
  const sinCero = resto.startsWith('0') ? resto.slice(1) : resto;
  if (sinCero.length === 10) return `+54 ${sinCero}`;
  const movil = nacionalDeDiez(resto);
  if (movil) return `+54 9 ${movil}`;
  return crudo;
}

/**
 * El link de WhatsApp con un mensaje ya escrito. El número pasa por
 * `whatsappArgentino` (549 + área sin 0 + número sin 15). Sin número, el link
 * abre WhatsApp para que la persona elija a quién mandarlo.
 */
export function linkWhatsapp(numero: string | null, texto: string): string {
  const mensaje = encodeURIComponent(texto);
  const destino = whatsappArgentino(numero);
  if (!destino) return `https://wa.me/?text=${mensaje}`;
  return `https://wa.me/${destino}?text=${mensaje}`;
}
