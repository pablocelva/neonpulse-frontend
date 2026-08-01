import { describe, it, expect } from 'vitest';
import { createFeaturedBannerElement } from '../../src/components/FeaturedBanner/FeaturedBanner';
import { EventStatus, type Event } from '../../src/models';

describe('FeaturedBanner Component', () => {
  const featuredEvent: Event = {
    id: '1',
    title: 'Braxton Cook Latam Tour',
    artist: 'Braxton Cook',
    date: new Date(2026, 7, 14),
    time: '21:30',
    status: EventStatus.LIVE,
    imageUrl: '/images/punk1.png',
    isFeatured: true,
  };

  it('debe crear un elemento de banner destacado completo', () => {
    const el = createFeaturedBannerElement(featuredEvent);
    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.tagName).toBe('SECTION');
    expect(el.innerHTML).toContain('Braxton Cook Latam Tour');
    expect(el.innerHTML).toContain('Braxton Cook');
    expect(el.innerHTML).toContain('21:30 hrs');
    expect(el.innerHTML).toContain('HEADLINER JAZZ');
    expect(el.innerHTML).toContain('EN VIVO AHORA');
  });

  it('debe utilizar fallbacks cuando faltan propiedades en el concierto', () => {
    const minimalEvent: Event = {
      id: '2',
      title: '',
      artist: '',
      date: new Date('invalid'),
      status: EventStatus.SCHEDULED,
    };
    const el = createFeaturedBannerElement(minimalEvent);
    expect(el.innerHTML).toContain('Evento Destacado');
    expect(el.innerHTML).toContain('Artista por confirmar');
    expect(el.innerHTML).toContain('Por confirmar');
    expect(el.innerHTML).toContain('/images/punk1.png');
  });
});