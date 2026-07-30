import { type Event, EventStatus } from '../models';
import { APP_CONFIG } from '../config/app.config';

export class EventService {
  private static readonly DATA_URL = APP_CONFIG.EVENTS_DATA_URL;

  /**
   * Utilidad privada para simular latencia de red en milisegundos.
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Obtiene todos los conciertos desde la fuente de datos.
   * @param delayMs Tiempo en ms para simular carga de red. Por defecto usa APP_CONFIG.SIMULATED_NETWORK_DELAY_MS.
   */
  static async getAllEvents(
    delayMs: number = APP_CONFIG.SIMULATED_NETWORK_DELAY_MS,
  ): Promise<Event[]> {
    if (delayMs > 0) {
      await this.delay(delayMs);
    }

    const response = await fetch(this.DATA_URL);

    if (!response.ok) {
      throw new Error(
        `Error HTTP al obtener los conciertos: status ${response.status} (${response.statusText})`,
      );
    }

    const rawData = await response.json();

    if (!Array.isArray(rawData)) {
      throw new Error('La respuesta de conciertos no tiene un formato válido (se esperaba un array).');
    }

    // Transformación y parseo seguro de datos (string date -> Date instance)
    return rawData.map((item: any): Event => ({
      id: String(item.id),
      title: String(item.title || 'Evento sin título'),
      artist: String(item.band || 'Artista desconocido'),
      date: item.date ? new Date(item.date) : new Date(),
      time: item.time ? String(item.time) : undefined,
      status: (Object.values(EventStatus).includes(item.status as EventStatus)
        ? item.status
        : EventStatus.SCHEDULED) as EventStatus,
      imageUrl: item.imageUrl ? String(item.imageUrl) : undefined,
      isFeatured: Boolean(item.isFeatured),
    }));
  }

  /**
   * Obtiene el concierto destacado o el primero disponible.
   */
  static getFeaturedEvent(events: Event[]): Event | null {
    if (events.length === 0) return null;
    return events.find((c) => c.isFeatured) || events[0];
  }

  /**
   * Filtra los conciertos para la grilla omitiendo el evento destacado si existe.
   */
  static getGridEvents(events: Event[]): Event[] {
    if (events.length <= 1) return events;
    return events.filter((c) => !c.isFeatured);
  }
}