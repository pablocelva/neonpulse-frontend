# NeonPulse - Frontend

Cartelera de conciertos Jazz & RnB con Vite + TypeScript + Tailwind CSS.

## Stack

- **Vite** — bundler y dev server
- **TypeScript** — tipado estático
- **Tailwind CSS v4** — estilos utilitarios
- **Lucide** — iconos SVG
- **Vitest + jsdom** — testing unitario y de componentes

## Scripts

```bash
pnpm run dev        # Inicia servidor de desarrollo
pnpm run build      # Compila TS + build de producción
pnpm run preview    # Previsualiza el build
pnpm run test       # Ejecuta los tests con Vitest
pnpm run coverage   # Ejecuta tests con reporte de cobertura (v8, umbral 100%)
```

## Arquitectura

Los eventos se cargan desde `public/data/events.json` mediante `fetch` asíncrono con manejo de estados: carga (skeleton), vacío, error con reintento y renderizado exitoso. Incluye un formulario de reserva de entradas con validación.

```
src/
├── config/
│   └── app.config.ts          # Configuración global (URL de datos, delays)
├── services/
│   └── event.service.ts       # Fetch, transformación y lógica de negocio
├── views/
│   └── eventBoard.view.ts     # Orquestación de vista (loading, render, error, empty)
├── components/
│   ├── BookingForm/           # Formulario de reserva con validación
│   ├── EventCard/             # Tarjeta de evento individual
│   ├── FeaturedBanner/        # Banner del evento destacado
│   ├── LoadingSkeleton/       # Esqueletos de carga (banner + grilla)
│   └── StateViews/            # Vistas de estado vacío y error
├── models/
│   ├── event.ts               # Interfaz Event y enum EventStatus
│   └── index.ts
├── utils/
│   ├── date.utils.ts          # Formato de fechas en español
│   └── icon.utils.ts          # Render seguro de iconos Lucide
├── styles/
│   └── global.css             # Estilos globales con Tailwind
├── assets/
└── main.ts                    # Punto de entrada (bootstrap asíncrono)

tests/
├── components/                # Tests de componentes (BookingForm, EventCard, etc.)
├── services/                  # Tests de servicios
├── views/                     # Tests de vistas
├── utils/                     # Tests de utilidades
└── config/                    # Tests de configuración
```

## Testing

- Configurado en `vite.config.ts` con entorno `jsdom` y globals activados.
- Cobertura con provider `v8` (reportes `text`, `json`, `html`) exigiendo 100% en lines, functions, branches y statements.
- Excluidos del reporte: `src/main.ts`, `vite.config.ts`, `node_modules` y `dist`.
