import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Mismo alias que `tsconfig.json` (`@/* → ./*`): sin esto, los `.test.tsx`
  // que ejercitan componentes reales no resuelven `@/components/ui/...`.
  resolve: { alias: { '@': path.resolve(import.meta.dirname) } },
  test: {
    // `passWithNoTests`: no todas las tareas de S1a suman un `*.test.ts`
    // propio. Sin esto, `vitest run` sale con código 1 cuando alguna no
    // encuentra ninguno, lo que rompe `npm test` en CI.
    include: ['app/**/*.test.{ts,tsx}'],
    // Lógica pura en `node` (más rápido); un `.test.tsx` que renderice
    // componentes (Testing Library) pide `jsdom` por archivo con el docblock
    // `// @vitest-environment jsdom` — esta versión de Vitest no trae
    // `environmentMatchGlobs`.
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    passWithNoTests: true,
  },
});
