// Matchers de Testing Library (`toHaveAttribute`, etc.) para los `.test.tsx`.
// Importarlo acá no toca el DOM: sólo extiende `expect`, así que no molesta
// a los tests en entorno `node`.
import '@testing-library/jest-dom/vitest';

import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Sin `test.globals: true` no hay `afterEach` implícito para que
// `@testing-library/react` desmonte solo: lo registramos a mano para que un
// segundo `render()` en el mismo archivo no arrastre el DOM del anterior.
afterEach(() => {
  cleanup();
});

// jsdom no trae `ResizeObserver` y Embla lo usa para recalcular el carrusel
// cuando cambia el ancho: sin esto, todo test que renderice uno explota con
// "ResizeObserver is not defined". El falso no observa nada — en jsdom no hay
// layout que medir — y alcanza para que el componente monte y se pueda
// inspeccionar el DOM. En entorno `node` no hay `window`, pero tampoco hay
// quien lo pida: definirlo en `globalThis` no molesta.
if (!('ResizeObserver' in globalThis)) {
  class ResizeObserverFalso {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = ResizeObserverFalso;
}

// Mismo motivo que el de arriba: la sección `SlidesInView` de Embla usa
// `IntersectionObserver` para saber qué reseñas quedaron a la vista, y jsdom
// tampoco lo trae. Sin este falso, el carrusel explota al montar con
// "IntersectionObserver is not defined" antes de llegar a ninguna aserción.
if (!('IntersectionObserver' in globalThis)) {
  class IntersectionObserverFalso {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver = IntersectionObserverFalso;
}
