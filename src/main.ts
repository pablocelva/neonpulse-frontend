import './global.css'
import { type Event, EventStatus } from './models';
import { createEventCardElement } from './components/EventCard';
import { createFeaturedBannerElement } from './components/FeaturedBanner/FeaturedBanner';

const bannerContainer = document.getElementById('contenedor-banner');
const carteleraContainer = document.getElementById('contenedor-cartelera');


const eventsList: Event[] = [
    {
        id: '1',
        title: 'Latam Tour 2026',
        artist: 'Elena Pinderhughes',
        date: new Date('10-10-2026'),
        time: '20:00',
        status: EventStatus.SCHEDULED,
        imageUrl: '/images/elena.webp',
        isFeatured: true,
    },
    {
        id: '2',
        title: 'Latam Tour 2026',
        artist: 'Braxton Cook',
        date: new Date('10-11-2026'),
        time: '19:00',
        status: EventStatus.SCHEDULED,
        imageUrl: '/images/braxton.webp',
    },
    {
        id: '3',
        title: 'Latam Tour 2026',
        artist: 'Louis Cole',
        date: new Date('11-12-2026'),
        time: '21:00',
        status: EventStatus.SCHEDULED,
        imageUrl: '/images/louis.jpg',
    },
    {
        id: '4',
        title: 'Latam Tour 2026',
        artist: 'Genevieve  Artadi',
        date: new Date('12-14-2026'),
        time: '21:00',
        status: EventStatus.SCHEDULED,
        imageUrl: '/images/genevieve.jfif',
    },
    {
        id: '5',
        title: 'Latam Tour 2026',
        artist: 'Terrace Martin',
        date: new Date('12-16-2026'),
        time: '21:00',
        status: EventStatus.SCHEDULED,
        imageUrl: '/images/terrace.jpg',
    },
    {
        id: '6',
        title: 'Latam Tour 2026',
        artist: 'Jazmin Sullivan',
        date: new Date('12-22-2026'),
        time: '21:00',
        status: EventStatus.SCHEDULED,
        imageUrl: '/images/jazmin.jfif',
    },
    {
        id: '7',
        title: 'Latam Tour 2026',
        artist: 'The Internet',
        date: new Date('12-23-2026'),
        time: '21:00',
        status: EventStatus.SCHEDULED,
        imageUrl: '/images/internet.jfif',
    },
]

function renderApp(): void {
    if (!carteleraContainer) {
      console.error(
        '[NeonPulse] Error crítico: No se encontró el elemento "#contenedor-cartelera" en el DOM.',
      );
      return;
    }
  
    try {
      // 1. Renderizar Banner de Evento Destacado
      const featuredConcert = eventsList.find((c) => c.isFeatured) || eventsList[0];
      if (bannerContainer && featuredConcert) {
        try {
          const bannerElement = createFeaturedBannerElement(featuredConcert);
          bannerContainer.replaceChildren(bannerElement);
        } catch (bannerError) {
          console.error('[NeonPulse] Error al renderizar banner destacado:', bannerError);
        }
      }
  
      // 2. Manejo de Estado Vacío
      if (!eventsList || eventsList.length === 0) {
        carteleraContainer.innerHTML = `
          <div class="col-span-full text-center py-10 px-6 bg-zinc-950 border border-dashed border-zinc-800 rounded-xl text-zinc-400">
            <p class="text-base font-bold uppercase">No hay conciertos programados por el momento. ¡Vuelve pronto!</p>
          </div>
        `;
        return;
      }
  
      // 3. Renderizado Seguro por Componente con DocumentFragment (GRID)
      const fragment = document.createDocumentFragment();
  
      // Filtramos la lista para omitir el destacado en la lista o mostrar todos
      const gridConcerts = eventsList.filter((c) => !c.isFeatured);
  
      gridConcerts.forEach((event) => {
        try {
          const cardElement = createEventCardElement(event);
          fragment.appendChild(cardElement);
        } catch (cardError) {
          console.error(
            `[NeonPulse] Falló el renderizado del concierto ID ${event?.id}:`,
            cardError,
          );
        }
      });
  
      carteleraContainer.replaceChildren(fragment);
    } catch (globalError) {
      console.error(
        '[NeonPulse] Error no controlado al renderizar la cartelera:',
        globalError,
      );
  
      // Fallback UI Global ante Error Inesperado
      carteleraContainer.innerHTML = `
        <div class="col-span-full text-center py-10 px-6 bg-zinc-950 border border-dashed border-red-600/40 rounded-xl text-zinc-400">
          <h3 class="text-lg font-bold text-red-500 mb-2 uppercase">¡Ups! Ocurrió un problema al cargar los eventos.</h3>
          <p class="text-sm">No se pudo mostrar la lista de conciertos.</p>
          <button class="mt-4 px-5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-black text-xs uppercase tracking-wider rounded-lg transition-all duration-150 shadow" onclick="window.location.reload()">Reintentar</button>
        </div>
      `;
    }
  }
  
  // Inicializar renderizado
  renderApp();