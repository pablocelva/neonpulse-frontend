# NeonPulse - Frontend

Cartelera de conciertos Jazz & RnB con Vite + TypeScript + Tailwind CSS.

## Stack

- **Vite** — bundler y dev server
- **TypeScript** — tipado estático
- **Tailwind CSS v4** — estilos utilitarios
- **Lucide** — iconos SVG

## Scripts

```bash
pnpm run dev      # Inicia servidor de desarrollo
pnpm run build    # Compila TS + build de producción
pnpm run preview  # Previsualiza el build
```

## Estructura

```
src/
├── components/
│   ├── EventCard/         # Tarjeta de evento
│   └── FeaturedBanner/    # Banner de evento destacado
├── models/
│   ├── event.ts           # Interfaz Event y enum EventStatus
│   └── index.ts
├── assets/
├── main.ts                # Punto de entrada
├── global.css             # Estilos globales con Tailwind
└── style.css
```
