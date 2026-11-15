import { describe, expect, it } from 'vitest';


import { linkTelefono, linkWhatsapp, telefonoInternacional, whatsappArgentino } from './whatsapp';

describe('whatsappArgentino', () => {
  it.each([
    // El caso de producción: el perfil decía "1133313834".
    ['1133313834', '5491133313834'],
    ['11 3331-3834', '5491133313834'],
    ['011 3331-3834', '5491133313834'],
    ['011 15 3331-3834', '5491133313834'],
    ['+54 9 11 3331-3834', '5491133313834'],
    ['5491133313834', '5491133313834'],
    ['+54 11 3331-3834', '5491133313834'],
    ['0054 11 3331 3834', '5491133313834'],
    ['54 011 15 3331 3834', '5491133313834'],
    // Área de 4 dígitos con el 15: 02944 15 123456 → 2944 123456.
    ['02944 15-123456', '5492944123456'],
    ['0351 155 123456', '5493515123456'],
  ])('%s → %s', (entrada, salida) => {
    expect(whatsappArgentino(entrada)).toBe(salida);
  });

  it('lo que no es un número argentino reconocible sale como vino, sólo dígitos', () => {
    expect(whatsappArgentino('4555-1234')).toBe('45551234');
    expect(whatsappArgentino('+1 (305) 555-0100')).toBe('13055550100');
  });

  it('vacío o nulo → null', () => {
    expect(whatsappArgentino(null)).toBeNull();
    expect(whatsappArgentino(undefined)).toBeNull();
    expect(whatsappArgentino('  -  ')).toBeNull();
  });
});

describe('linkWhatsapp', () => {
  it('arma el wa.me con el número normalizado (el backend viejo mandaba "1133313834")', () => {
    expect(linkWhatsapp('1133313834', 'Hola')).toBe('https://wa.me/5491133313834?text=Hola');
    expect(linkWhatsapp('5491133313834', 'Hola')).toBe('https://wa.me/5491133313834?text=Hola');
  });

  it('sin número abre WhatsApp para elegir el chat', () => {
    expect(linkWhatsapp(null, 'Mi consulta: https://x.test/autos/abc')).toBe(
      `https://wa.me/?text=${encodeURIComponent('Mi consulta: https://x.test/autos/abc')}`,
    );
  });
});

describe('linkTelefono', () => {
  it('saca espacios y guiones, deja el + del país', () => {
    expect(linkTelefono('11 3331-3834')).toBe('tel:1133313834');
    expect(linkTelefono('+54 9 11 3331-3834')).toBe('tel:+5491133313834');
  });
  it('sin dígitos no hay link', () => {
    expect(linkTelefono(null)).toBeNull();
    expect(linkTelefono(' - ')).toBeNull();
  });
});

describe('telefonoInternacional (JSON-LD, POR-25)', () => {
  it('celular con 15 o con 549: +54 9', () => {
    expect(telefonoInternacional('011 15 3331-3834')).toBe('+54 9 1133313834');
    expect(telefonoInternacional('5491133313834')).toBe('+54 9 1133313834');
    expect(telefonoInternacional('+54 9 11 3331-3834')).toBe('+54 9 1133313834');
  });
  it('nacional de 10 dígitos sin marcas de celular: +54', () => {
    expect(telefonoInternacional('11 4321-4321')).toBe('+54 1143214321');
    expect(telefonoInternacional('0221 421-4321')).toBe('+54 2214214321');
    expect(telefonoInternacional('54 11 4321 4321')).toBe('+54 1143214321');
  });
  it('lo que no se reconoce sale como vino', () => {
    expect(telefonoInternacional('4321-4321')).toBe('4321-4321');
    expect(telefonoInternacional(null)).toBeNull();
    expect(telefonoInternacional(' - ')).toBeNull();
  });
});
