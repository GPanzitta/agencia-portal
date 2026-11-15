'use client';

import { useState } from 'react';

import Formulario from './formulario';
import Motivo, { type MotivoDeCotizacion } from './motivo';

/**
 * El cotizador (14/11/2026): primero se elige para qué se cotiza —vender, permutar o consignar—,
 * se explica cómo funciona cada caso y esa elección viaja con el pedido al ERP.
 */
export default function Cotizador({ unidadId, sobre, children }: { unidadId?: string; sobre?: string; children?: React.ReactNode }) {
  // Quien llega desde la publicación de un auto viene a entregar el suyo en parte de pago.
  const [motivo, setMotivo] = useState<MotivoDeCotizacion>(unidadId ? 'entregar' : 'vender');
  return (
    <div className="mq-cotizar-cuerpo">
      <div className="mq-motivo-columna">
        <Motivo elegido={motivo} onElegir={setMotivo} />
        {children}
      </div>
      <div className="mq-form"><Formulario modo="vender" unidadId={unidadId} sobre={sobre} intencion={motivo} /></div>
    </div>
  );
}
