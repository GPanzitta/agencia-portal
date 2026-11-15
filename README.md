# FG autos — sitio

El sitio público de cada agencia: su stock con la publicación de cada auto, reserva con seña,
simulador de cuotas, «Cotizá tu auto» y contacto. Cada agencia entra por su subdominio.

Next.js. Lee todo de `fg-autos-backend`.

## Para correrlo en tu máquina

1. Creá `.env.local` con `NEXT_PUBLIC_API_URL=http://localhost:3200/api`.
2. `npm install`
3. `npm run dev -- -p 3201`
4. Abrí `http://<agencia>.localhost:3201` (por ejemplo `http://agencia-demo.localhost:3201`).

## Pruebas

`npx vitest run`
