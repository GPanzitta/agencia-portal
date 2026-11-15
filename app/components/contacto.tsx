'use client';

import { createContext, useContext } from 'react';

/**
 * Cómo comunicarse con la agencia, al alcance de los componentes cliente que
 * no pueden pedir el perfil por su cuenta: las pantallas de error
 * (`error.tsx`) son Client Components y se muestran justamente cuando algo
 * del servidor falló. El layout raíz ya tiene el perfil en la mano y lo deja
 * acá.
 *
 * Con el backend dormido el perfil es el de respaldo y no trae WhatsApp: por
 * eso `whatsappDeRespaldo` lee `NEXT_PUBLIC_WHATSAPP_TALLER` (opcional, va en
 * el bundle a propósito: es un número público; el nombre de la variable viene
 * de antes y se conserva para no romper deploys).
 */
export interface Contacto {
  nombre: string;
  whatsapp: string | null;
  telefono: string | null;
}

const Contexto = createContext<Contacto | null>(null);

export function ProveedorDeContacto({ contacto, children }: { contacto: Contacto; children: React.ReactNode }) {
  return <Contexto.Provider value={contacto}>{children}</Contexto.Provider>;
}

export const whatsappDeRespaldo = (): string | null => process.env.NEXT_PUBLIC_WHATSAPP_TALLER || null;

/** El contacto del perfil, con el WhatsApp de respaldo si el perfil no lo trae. */
export function useContacto(): Contacto {
  const c = useContext(Contexto);
  return {
    nombre: c?.nombre ?? '',
    whatsapp: c?.whatsapp || whatsappDeRespaldo(),
    telefono: c?.telefono ?? null,
  };
}
