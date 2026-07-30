import './styles/global.css'
import { EventService } from './services/event.service';
import { EventBoardView } from './views/eventBoard.view';

/**
 * Inicializa y orquesta la aplicación NeonPulse con Top-Level Await.
 */
async function bootstrap(): Promise<void> {
  const view = new EventBoardView();

  try {
    // 1. Mostrar estado de carga (skeleton loaders)
    view.showLoading();

    // 2. Obtener datos de la fuente asíncrona
    const events = await EventService.getAllEvents();

    // 3. Manejo de estado vacío
    if (events.length === 0) {
      view.showEmpty();
      return;
    }

    // 4. Renderizado exitoso de la cartelera
    view.renderEvents(events);
  } catch (error) {
    console.error('[NeonPulse] Error crítico durante la inicialización:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Error al cargar los eventos.';
    view.showError(errorMessage, () => bootstrap());
  }
}

// Inicializar la aplicación utilizando Top-Level Await
await bootstrap();