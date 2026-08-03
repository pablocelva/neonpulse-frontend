import { describe, it, expect, vi } from 'vitest';
import {
  generateEventCardHtml,
  createEventCardElement,
} from '../../src/components/EventCard/EventCard';
import { EventStatus, type Event } from '../../src/models';
import * as EventCardModule from '../../src/components/EventCard/EventCard';

describe('EventCard Component', () => {
  const baseEvent: Event = {
    id: '101',
    title: 'Braxton Cook Latam Tour',
    artist: 'Braxton Cook',
    date: new Date(2026, 9, 20),
    time: '22:00',
    status: EventStatus.SCHEDULED,
    imageUrl: '/images/braxton.webp',
  };

  it('debe generar HTML de fallback si el objeto concert no está definido', () => {
    // @ts-expect-error testing null
    const html = generateEventCardHtml(null);
    expect(html).toContain('Información de concierto no disponible');
  });

  it('debe generar HTML correcto para un concierto SCHEDULED', () => {
    const html = generateEventCardHtml(baseEvent);
    expect(html).toContain('Braxton Cook Latam Tour');
    expect(html).toContain('Braxton Cook');
    expect(html).toContain('Programado');
    expect(html).toContain('Comprar Entradas');
    expect(html).toContain('20 de octubre de 2026');
  });

  it('debe generar HTML correcto para un concierto LIVE', () => {
    const liveEvent: Event = { ...baseEvent, status: EventStatus.LIVE };
    const html = generateEventCardHtml(liveEvent);
    expect(html).toContain('EN VIVO ⚡');
    expect(html).toContain('Ver Transmisión');
  });

  it('debe generar HTML correcto para un concierto FINISHED', () => {
    const finishedEvent: Event = { ...baseEvent, status: EventStatus.FINISHED };
    const html = generateEventCardHtml(finishedEvent);
    expect(html).toContain('Finalizado');
    expect(html).toContain('Show Finalizado');
    expect(html).toContain('disabled');
  });

  it('debe generar HTML correcto para un concierto CANCELLED', () => {
    const cancelledEvent: Event = { ...baseEvent, status: EventStatus.CANCELED };
    const html = generateEventCardHtml(cancelledEvent);
    expect(html).toContain('Cancelado');
    expect(html).toContain('Show Cancelado');
    expect(html).toContain('disabled');
  });

  it('debe manejar un estado desconocido (default case)', () => {
    const unknownEvent: Event = {
      ...baseEvent,
      // @ts-expect-error testing custom status string
      status: 'CUSTOM_STATUS',
    };
    const html = generateEventCardHtml(unknownEvent);
    expect(html).toContain('CUSTOM_STATUS');
    expect(html).toContain('Ver Detalles');
  });

  it('debe usar valores por defecto cuando faltan propiedades opcionales', () => {
    const minimalEvent: Event = {
      id: '',
      title: '',
      artist: '',
      date: new Date('invalid'),
      status: EventStatus.SCHEDULED,
    };
    const html = generateEventCardHtml(minimalEvent);
    expect(html).toContain('Concierto sin título');
    expect(html).toContain('Artista por confirmar');
    expect(html).toContain('Por confirmar');
    expect(html).toContain('/images/punk1.png');
  });

  it('debe crear un elemento DOM seguro con createEventCardElement', () => {
    const el = createEventCardElement(baseEvent);
    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.tagName).toBe('ARTICLE');
    expect(el.getAttribute('data-id')).toBe('101');
  });

  it('debe retornar fallback UI si ocurre un error inesperado al crear el elemento', () => {
    const throwingEvent = {
      get id() {
        throw new Error('Render error');
      },
    } as unknown as Event;

    const fallbackEl = createEventCardElement(throwingEvent);
    expect(fallbackEl).toBeInstanceOf(HTMLElement);
    expect(fallbackEl.innerHTML).toContain('No se pudo cargar esta tocata.');
  });
  
  it('debe retornar fallback UI si createConcertCardElement lanza un error por elemento nulo generado', () => {
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'div') {
        const div = originalCreateElement('div');
        Object.defineProperty(div, 'firstElementChild', {
          get: () => null,
          configurable: true
        });
        return div;
      }
      return originalCreateElement(tagName);
    });
    const fallbackEl = createEventCardElement(baseEvent);
    expect(fallbackEl).toBeInstanceOf(HTMLElement);
    expect(fallbackEl.innerHTML).toContain('No se pudo cargar esta tocata.');
    createElementSpy.mockRestore();
  });
});