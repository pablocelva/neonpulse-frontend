import type { Event } from '../models';
import { EventService } from '../services/event.service';
import { createEventCardElement } from '../components/EventCard';
import { createFeaturedBannerElement } from '../components/FeaturedBanner/FeaturedBanner';
import {
  createBannerSkeletonElement,
  createGridSkeletonElement,
} from '../components/LoadingSkeleton/LoadingSkeleton';
import {
  createErrorStateElement,
  createEmptyStateElement,
} from '../components/StateViews/StateViews';
import { createBookingFormElement  } from '../components/BookingForm';

export class EventBoardView {
  private bannerContainer: HTMLElement | null;
  private carteleraContainer: HTMLElement | null;
  private contadorFechasContainer: HTMLElement | null;
  private bookingContainer: HTMLElement | null;

  constructor() {
    this.bannerContainer = document.getElementById('contenedor-banner');
    this.carteleraContainer = document.getElementById('contenedor-cartelera');
    this.contadorFechasContainer = document.getElementById('contador-fechas');
    this.bookingContainer = document.getElementById('contenedor-reserva');
  }

  /**
   * Muestra esqueletos de carga visuales en los contenedores e icono de spin en el contador.
   */
  showLoading(): void {
    if (this.contadorFechasContainer) {
      this.contadorFechasContainer.innerHTML = `
        <svg class="animate-spin h-3 w-3 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Cargando fechas...</span>
      `;
    }

    if (this.bannerContainer) {
      this.bannerContainer.replaceChildren(createBannerSkeletonElement());
    }

    if (this.carteleraContainer) {
      this.carteleraContainer.replaceChildren(createGridSkeletonElement(3));
    }

    if (this.bookingContainer) {
      this.bookingContainer.replaceChildren();
    }
  }

  /**
   * Renderiza el formulario de reserva de entradas.
   * @param selectedEvent Concierto opcional preseleccionado para la reserva.
   */
  renderBookingForm(selectedEvent?: Event): void {
    if (!this.bookingContainer) return;

    try {
      const bookingElement = createBookingFormElement(selectedEvent, (data) => {
        console.log('[NeonPulse] Reserva realizada con éxito:', data);
      });
      this.bookingContainer.replaceChildren(bookingElement);
    } catch (bookingError) {
      console.error(
        '[NeonPulse] Error al renderizar el formulario de reserva:',
        bookingError,
      );
      this.bookingContainer.replaceChildren();
    }
  }

  /**
   * Renderiza el banner destacado, la grilla de conciertos y actualiza el contador dinámico de fechas.
   */
  renderEvents(events: Event[]): void {
    if (!this.carteleraContainer) {
      console.error(
        '[NeonPulse] Error crítico: No se encontró "#contenedor-cartelera" en el DOM.',
      );
      return;
    }

    // Actualizar el contador dinámico de fechas confirmadas
    if (this.contadorFechasContainer) {
      const count = events.length;
      const label = count === 1 ? 'Fecha Confirmada' : 'Fechas Confirmadas';
      this.contadorFechasContainer.innerHTML = `<span>${count} ${label}</span>`;
    }

    // 1. Renderizar Banner Destacado
    const featuredEvent = EventService.getFeaturedEvent(events);
    if (this.bannerContainer && featuredEvent) {
      try {
        const bannerElement = createFeaturedBannerElement(featuredEvent);
        this.bannerContainer.replaceChildren(bannerElement);
      } catch (bannerError) {
        console.error(
          '[NeonPulse] Error al renderizar banner destacado:',
          bannerError,
        );
        this.bannerContainer.replaceChildren();
      }
    }

    // 2. Renderizar Grilla de Eventos
    const gridEvents = EventService.getGridEvents(events);
    const fragment = document.createDocumentFragment();

    gridEvents.forEach((event) => {
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

    this.carteleraContainer.replaceChildren(fragment);

    // 3. Renderizar Formulario de Reserva
    this.renderBookingForm();

    // 4. Configurar eventos de interacción para seleccionar concierto
    this.setupBookingListeners(events, featuredEvent);
  }

  /**
   * Configura los escuchadores de evento click para seleccionar un concierto y hacer scroll hacia la reserva.
   */
  private setupBookingListeners(events: Event[], featuredEvent: Event | null): void {
    const handleTicketClick = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button');
      if (!button || button.disabled) return;

      const card = target.closest('[data-id]') as HTMLElement | null;
      const eventId = card?.getAttribute('data-id');

      let selectedEvent: Event | undefined;
      if (eventId) {
        selectedEvent = events.find((e) => e.id === eventId);
      } else if (this.bannerContainer?.contains(target)) {
        selectedEvent = featuredEvent || undefined;
      }

      if (selectedEvent) {
        this.renderBookingForm(selectedEvent);
        this.bookingContainer?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    if (this.carteleraContainer) {
      this.carteleraContainer.addEventListener('click', handleTicketClick);
    }
    if (this.bannerContainer) {
      this.bannerContainer.addEventListener('click', handleTicketClick);
    }
  }

  /**
   * Muestra la vista de estado vacío cuando no hay conciertos.
   */
  showEmpty(): void {
    if (this.contadorFechasContainer) {
      this.contadorFechasContainer.innerHTML = `<span>0 Fechas Confirmadas</span>`;
    }
    if (this.bannerContainer) {
      this.bannerContainer.replaceChildren();
    }
    if (this.carteleraContainer) {
      this.carteleraContainer.replaceChildren(createEmptyStateElement());
    }
    if (this.bookingContainer) {
      this.bookingContainer.replaceChildren();
    }
  }

  /**
   * Muestra la vista de estado de error global.
   */
  showError(message: string, onRetry?: () => void): void {
    if (this.contadorFechasContainer) {
      this.contadorFechasContainer.innerHTML = `<span>0 Fechas Confirmadas</span>`;
    }
    if (this.bannerContainer) {
      this.bannerContainer.replaceChildren();
    }
    if (this.carteleraContainer) {
      this.carteleraContainer.replaceChildren(
        createErrorStateElement(message, onRetry),
      );
    }
    if (this.bookingContainer) {
      this.bookingContainer.replaceChildren();
    }
  }
}