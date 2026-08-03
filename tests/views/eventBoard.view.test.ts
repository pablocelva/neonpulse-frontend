import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBoardView } from '../../src/views/eventBoard.view';
import { EventStatus, type Event } from '../../src/models';
import * as FeaturedBannerModule from '../../src/components/FeaturedBanner/FeaturedBanner';
import * as EventCardModule from '../../src/components/EventCard/EventCard';
import * as BookingFormModule from '../../src/components/BookingForm/BookingForm';

describe('EventBoardView', () => {
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
      <div id="contenedor-reserva"></div>
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

  it('debe renderizar el formulario de reserva al ejecutar renderConcerts', () => {
    const view = new EventBoardView();
    view.renderEvents(mockEvents);

    const bookingContainer = document.getElementById('contenedor-reserva');
    expect(bookingContainer?.children.length).toBe(1);
    expect(bookingContainer?.innerHTML).toContain('Reserva de Entradas');
  });

  it('debe registrar en consola cuando se completa exitosamente la reserva desde la vista', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const view = new EventBoardView();
    view.renderEvents(mockEvents);

    const bookingContainer = document.getElementById('contenedor-reserva')!;
    const form = bookingContainer.querySelector('#form-reserva') as HTMLFormElement;
    const emailInput = bookingContainer.querySelector('#email') as HTMLInputElement;
    const cantidadInput = bookingContainer.querySelector('#cantidad') as HTMLInputElement;

    emailInput.value = 'fan@punkrock.cl';
    cantidadInput.value = '4';
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

    expect(consoleSpy).toHaveBeenCalledWith(
      '[NeonPulse] Reserva realizada con éxito:',
      expect.objectContaining({ email: 'fan@punkrock.cl', cantidad: 4 })
    );

    consoleSpy.mockRestore();
  });

  it('debe limpiar el contenedor de reserva si createBookingFormElement lanza un error', () => {
    const spy = vi.spyOn(BookingFormModule, 'createBookingFormElement').mockImplementation(() => {
      throw new Error('Form render error');
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const view = new EventBoardView();
    view.renderBookingForm(mockEvents[0]);

    const bookingContainer = document.getElementById('contenedor-reserva');
    expect(bookingContainer?.children.length).toBe(0);

    spy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('debe actualizar el formulario de reserva con el concierto correcto cuando se hace click en Comprar Entradas en una tarjeta', () => {
    const view = new EventBoardView();
    view.renderEvents(mockEvents);

    const bookingContainer = document.getElementById('contenedor-reserva')!;
    
    // Al principio, el formulario no tiene concierto seleccionado (badge de SELECCIONADO no está)
    expect(bookingContainer.innerHTML).not.toContain('SELECCIONADO');

    // Clickear el botón de comprar entradas en la tarjeta con data-id="2"
    const card2 = carteleraContainer.querySelector('[data-id="2"]') as HTMLElement;
    const btn = card2.querySelector('button') as HTMLButtonElement;
    
    // Mockear scrollIntoView para evitar error en jsdom
    const scrollSpy = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollSpy;

    btn.click();

    // Ahora el formulario debe tener la información del concierto seleccionado
    expect(bookingContainer.innerHTML).toContain('SELECCIONADO');
    expect(bookingContainer.innerHTML).toContain('Grid Concert 1');
    expect(scrollSpy).toHaveBeenCalled();
  });

  it('debe actualizar el formulario de reserva con el concierto correcto cuando se hace click en Ver Transmisión en el banner destacado', () => {
    const view = new EventBoardView();
    view.renderEvents(mockEvents);

    const bookingContainer = document.getElementById('contenedor-reserva')!;
    expect(bookingContainer.innerHTML).not.toContain('SELECCIONADO');

    // Mockear scrollIntoView
    const scrollSpy = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollSpy;

    // Clickear el botón en el banner
    const bannerBtn = bannerContainer.querySelector('button') as HTMLButtonElement;
    bannerBtn.click();

    expect(bookingContainer.innerHTML).toContain('SELECCIONADO');
    expect(bookingContainer.innerHTML).toContain('Featured Concert');
  });

  it('no debe hacer nada en setupBookingListeners si el botón clickeado está deshabilitado o no es un botón de reserva', () => {
    const view = new EventBoardView();
    view.renderEvents(mockEvents);

    const bookingContainer = document.getElementById('contenedor-reserva')!;
    expect(bookingContainer.innerHTML).not.toContain('SELECCIONADO');

    // Clickear en cualquier otra parte de la cartelera
    carteleraContainer.click();
    expect(bookingContainer.innerHTML).not.toContain('SELECCIONADO');
  });
});