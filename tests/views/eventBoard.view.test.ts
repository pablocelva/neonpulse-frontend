import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBoardView } from '../../src/views/eventBoard.view';
import { EventStatus, type Event } from '../../src/models';
import * as FeaturedBannerModule from '../../src/components/FeaturedBanner/FeaturedBanner';
import * as EventCardModule from '../../src/components/EventCard/EventCard';

describe('ConcertBoardView', () => {
  let bannerContainer: HTMLElement;
  let carteleraContainer: HTMLElement;
  let contadorFechasContainer: HTMLElement;

  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Featured Concert',
      artist: 'Artist A',
      date: new Date(),
      status: EventStatus.LIVE,
      isFeatured: true,
    },
    {
      id: '2',
      title: 'Grid Concert 1',
      artist: 'Artist B',
      date: new Date(),
      status: EventStatus.SCHEDULED,
    },
    {
      id: '3',
      title: 'Grid Concert 2',
      artist: 'Artist C',
      date: new Date(),
      status: EventStatus.SCHEDULED,
    },
  ];

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="contenedor-banner"></div>
      <span id="contador-fechas"></span>
      <div id="contenedor-cartelera"></div>
    `;

    bannerContainer = document.getElementById('contenedor-banner')!;
    carteleraContainer = document.getElementById('contenedor-cartelera')!;
    contadorFechasContainer = document.getElementById('contador-fechas')!;
  });

  it('debe mostrar esqueletos de carga con showLoading', () => {
    const view = new EventBoardView();
    view.showLoading();

    expect(contadorFechasContainer.innerHTML).toContain('Cargando fechas...');
    expect(bannerContainer.children.length).toBeGreaterThan(0);
    expect(carteleraContainer.children.length).toBe(3);
  });

  it('debe renderizar conciertos correctamente y actualizar el contador en plural', () => {
    const view = new EventBoardView();
    view.renderEvents(mockEvents);

    expect(contadorFechasContainer.innerHTML).toContain('3 Fechas Confirmadas');
    expect(bannerContainer.children.length).toBe(1);
    expect(carteleraContainer.children.length).toBe(2);
  });

  it('debe utilizar la forma singular en el contador cuando hay 1 solo concierto', () => {
    const view = new EventBoardView();
    view.renderEvents([mockEvents[0]]);

    expect(contadorFechasContainer.innerHTML).toContain('1 Fecha Confirmada');
  });

  it('debe retornar temprano sin lanzar excepción si no existe el contenedor de cartelera', () => {
    document.body.innerHTML = ''; // Limpiar DOM
    const view = new EventBoardView();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    view.renderEvents(mockEvents);
    expect(consoleSpy).toHaveBeenCalledWith(
      '[NeonPulse] Error crítico: No se encontró "#contenedor-cartelera" en el DOM.',
    );

    consoleSpy.mockRestore();
  });

  it('debe limpiar el banner si createFeaturedBannerElement lanza un error', () => {
    const spy = vi
      .spyOn(FeaturedBannerModule, 'createFeaturedBannerElement')
      .mockImplementationOnce(() => {
        throw new Error('Banner render error');
      });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const view = new EventBoardView();
    view.renderEvents(mockEvents);

    expect(bannerContainer.children.length).toBe(0);

    spy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('debe registrar error en consola si falla el renderizado de una tarjeta de concierto individual', () => {
    const spy = vi
      .spyOn(EventCardModule, 'createEventCardElement')
      .mockImplementationOnce(() => {
        throw new Error('Card error');
      });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const view = new EventBoardView();
    view.renderEvents(mockEvents);

    expect(consoleSpy).toHaveBeenCalled();

    spy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('debe renderizar el estado vacío con showEmpty', () => {
    const view = new EventBoardView();
    view.showEmpty();

    expect(contadorFechasContainer.innerHTML).toContain('0 Fechas Confirmadas');
    expect(bannerContainer.children.length).toBe(0);
    expect(carteleraContainer.innerHTML).toContain('No hay conciertos programados por el momento.');
  });

  it('debe renderizar el estado de error con showError', () => {
    const view = new EventBoardView();
    const onRetry = vi.fn();
    view.showError('Falla de red', onRetry);

    expect(contadorFechasContainer.innerHTML).toContain('0 Fechas Confirmadas');
    expect(bannerContainer.children.length).toBe(0);
    expect(carteleraContainer.innerHTML).toContain('Falla de red');
  });

  it('debe comportarse de forma segura si los elementos del DOM son nulos al llamar showLoading, showEmpty y showError', () => {
    document.body.innerHTML = ''; // Nodos nulos
    const view = new EventBoardView();

    expect(() => {
      view.showLoading();
      view.showEmpty();
      view.showError('Error test');
    }).not.toThrow();
  });
});