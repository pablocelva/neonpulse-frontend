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

## Arquitectura

Los eventos se cargan desde `public/data/events.json` mediante `fetch` asíncrono con manejo de estados: carga (skeleton), vacío, error con reintento y renderizado exitoso.

```
src/
├── config/
│   └── app.config.ts          # Configuración global (URL de datos, delays)
├── services/
│   └── event.service.ts       # Fetch, transformación y lógica de negocio
├── views/
│   └── eventBoard.view.ts     # Orquestación de vista (loading, render, error, empty)
├── components/
│   ├── EventCard/             # Tarjeta de evento individual
│   ├── FeaturedBanner/        # Banner del evento destacado
│   ├── LoadingSkeleton/       # Esqueletos de carga (banner + grilla)
│   └── StateViews/            # Vistas de estado vacío y error
├── models/
│   ├── event.ts               # Interfaz Event y enum EventStatus
│   └── index.ts
├── styles/
│   └── global.css             # Estilos globales con Tailwind
├── assets/
└── main.ts                    # Punto de entrada (bootstrap asíncrono)
```
