import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

/*
 * SEG-POR-07: guardia de secretos. Next sólo mete en el bundle del navegador
 * las variables `NEXT_PUBLIC_*`; las demás quedan en el servidor. Estos tests
 * cuidan las dos puntas: que nada secreto se llame `NEXT_PUBLIC_*`, y que
 * ningún componente de cliente lea una variable que no lo sea.
 */
const RAIZ = path.resolve(import.meta.dirname, '..', '..');

function archivos(dir: string): string[] {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = path.join(dir, nombre);
    if (nombre === 'node_modules' || nombre.startsWith('.')) return [];
    if (statSync(ruta).isDirectory()) return archivos(ruta);
    return /\.(ts|tsx|mjs)$/.test(nombre) && !/\.test\.tsx?$/.test(nombre) ? [ruta] : [];
  });
}

const fuentes = [...archivos(path.join(RAIZ, 'app')), path.join(RAIZ, 'next.config.ts')]
  .map((ruta) => ({ ruta: path.relative(RAIZ, ruta).split(path.sep).join('/'), texto: readFileSync(ruta, 'utf8') }));

const esCliente = (texto: string) => /^\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*['"]use client['"]/.test(texto);

describe('secretos del sitio (SEG-POR-07)', () => {
  it('ninguna variable NEXT_PUBLIC_ tiene nombre de secreto', () => {
    const publicas = new Set(fuentes.flatMap((f) => f.texto.match(/NEXT_PUBLIC_[A-Z0-9_]+/g) ?? []));
    expect(publicas.size).toBeGreaterThan(0);
    for (const v of publicas) expect(v).not.toMatch(/CLAVE|SECRET|TOKEN|KEY|PASS|PRIVAD/);
  });

  it('ningún componente de cliente lee variables que no sean NEXT_PUBLIC_', () => {
    const clientes = fuentes.filter((f) => esCliente(f.texto));
    expect(clientes.length).toBeGreaterThan(3);
    for (const f of clientes) {
      const variables = f.texto.match(/process\.env\.[A-Z0-9_]+/g) ?? [];
      for (const v of variables) expect(v, f.ruta).toMatch(/^process\.env\.(NEXT_PUBLIC_|NODE_ENV$)/);
    }
  });
});
