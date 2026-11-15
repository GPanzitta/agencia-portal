import { redirect } from 'next/navigation';

/** La dirección vieja de «Vendé tu auto»: desde el 13/11/2026 es «Cotizá tu auto». */
export default function VendeTuAuto(): never {
  redirect('/cotiza-tu-auto');
}
