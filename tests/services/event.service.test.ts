import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventService } from '../../src/services/event.service';
import { EventStatus, type Event } from '../../src/models';

describe('EventService', () => {
  const mockEventsRaw = [
    {
      id: '1',
      title: 'Braxton Cook Latam Tour',
      artist: 'Braxton Cook',
      date: '2026-08-15',
      time: '21:00',
      status: 'LIVE',
      imageUrl: '/images/braxton.webp',
      isFeatured: true,
    },
    {
      id: '2',
      title: 'Rock Night',
      artist: 'Green Day',
      date: '2026-09-10',
      status: 'SCHEDULED',
      isFeatured: false,
    },
    {
      id: '3',
      title: 'Underground Jam',
      status: 'INVALID_STATUS',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('debe obtener y mapear correctamente los conciertos desde la API/JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockEventsRaw,
    }));

    const events = await EventService.getAllEvents(0);

    expect(events).toHaveLength(3);
    expect(events[0].id).toBe('1');
    expect(events[0].title).toBe('Braxton Cook Latam Tour');
    expect(events[0].artist).toBe('Braxton Cook');
    expect(events[0].date).toBeInstanceOf(Date);
    expect(events[0].status).toBe(EventStatus.LIVE);
    expect(events[0].isFeatured).toBe(true);

    // Mapeo de valores por defecto cuando faltan propiedades
    expect(events[2].title).toBe('Underground Jam');
    expect(events[2].artist).toBe('Artista desconocido');
    expect(events[2].time).toBeUndefined();
    expect(events[2].status).toBe(EventStatus.SCHEDULED);
    expect(events[2].imageUrl).toBeUndefined();
  });

  it('debe aplicar retardo simulado cuando delayMs > 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }));

    const startTime = Date.now();
    await EventService.getAllEvents(10);
    const elapsedTime = Date.now() - startTime;

    expect(elapsedTime).toBeGreaterThanOrEqual(5);
  });

  it('debe lanzar error cuando response.ok es false', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    }));

    await expect(EventService.getAllEvents(0)).rejects.toThrow(
      'Error HTTP al obtener los conciertos: status 404 (Not Found)',
    );
  });

  it('debe lanzar error cuando la respuesta JSON no es un array', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ error: 'Invalid payload' }),
    }));

    await expect(EventService.getAllEvents(0)).rejects.toThrow(
      'La respuesta de conciertos no tiene un formato válido (se esperaba un array).',
    );
  });

  it('debe obtener el concierto destacado correctamente', () => {
    const list: Event[] = [
      { id: '1', title: 'Regular', artist: 'A1', date: new Date(), status: EventStatus.SCHEDULED, isFeatured: false },
      { id: '2', title: 'Featured', artist: 'A2', date: new Date(), status: EventStatus.LIVE, isFeatured: true },
    ];

    const featured = EventService.getFeaturedEvent(list);
    expect(featured?.id).toBe('2');
  });

  it('debe retornar el primer concierto si ninguno tiene isFeatured=true', () => {
    const list: Event[] = [
      { id: '1', title: 'First', artist: 'A1', date: new Date(), status: EventStatus.SCHEDULED, isFeatured: false },
    ];

    const featured = EventService.getFeaturedEvent(list);
    expect(featured?.id).toBe('1');
  });

  it('debe retornar null si la lista de conciertos está vacía en getFeaturedConcert', () => {
    expect(EventService.getFeaturedEvent([])).toBeNull();
  });

  it('debe filtrar los conciertos para la grilla omitiendo el destacado', () => {
    const list: Event[] = [
      { id: '1', title: 'Featured', artist: 'A1', date: new Date(), status: EventStatus.LIVE, isFeatured: true },
      { id: '2', title: 'Grid 1', artist: 'A2', date: new Date(), status: EventStatus.SCHEDULED, isFeatured: false },
      { id: '3', title: 'Grid 2', artist: 'A3', date: new Date(), status: EventStatus.SCHEDULED, isFeatured: false },
    ];

    const grid = EventService.getGridEvents(list);
    expect(grid).toHaveLength(2);
    expect(grid.map((c) => c.id)).toEqual(['2', '3']);
  });

  it('debe retornar la lista completa en getGridConcerts si la longitud es <= 1', () => {
    const single: Event[] = [
      { id: '1', title: 'Single', artist: 'A1', date: new Date(), status: EventStatus.LIVE, isFeatured: true },
    ];
    expect(EventService.getGridEvents(single)).toEqual(single);
    expect(EventService.getGridEvents([])).toEqual([]);
  });
});