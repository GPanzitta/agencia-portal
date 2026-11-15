import { describe, expect, it } from 'vitest';

import { ACENTO_HEX, donde, inicial } from './identidad';
import { ACENTOS, PERFIL_POR_DEFECTO } from './perfil';

describe('la paleta', () => {
  it('hay un color en #rrggbb para cada acento', () => {
    for (const acento of ACENTOS) expect(ACENTO_HEX[acento]).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe('inicial', () => {
  it('la primera letra, en mayúscula', () => {
    expect(inicial('Autos Pérez')).toBe('A');
    expect(inicial('sur motors')).toBe('S');
    expect(inicial('ñandú')).toBe('Ñ');
  });

  it('saltea lo que no es letra ni número: un ícono no puede ser una comilla', () => {
    expect(inicial('"El Galpón"')).toBe('E');
    expect(inicial('  — Frente Sur')).toBe('F');
  });

  it('sin nombre queda la del nombre por defecto', () => {
    expect(inicial('')).toBe('A');
    expect(inicial('   ')).toBe('A');
  });
});


describe('donde', () => {
  it('la localidad le gana a la calle', () => {
    const p = { ...PERFIL_POR_DEFECTO, zona: 'Villa Ballester', direccion: 'Av. Siempre Viva 742' };
    expect(donde(p)).toBe('Villa Ballester');
  });

  it('sin zona va la dirección, y sin ninguna de las dos no va nada', () => {
    expect(donde({ ...PERFIL_POR_DEFECTO, direccion: 'Av. Siempre Viva 742' })).toBe('Av. Siempre Viva 742');
    expect(donde(PERFIL_POR_DEFECTO)).toBeNull();
  });
});

