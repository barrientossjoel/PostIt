/**
 * Free Translation Adapter (Zero AI, Zero Cost)
 * Uses Git conventional mapping + free open translation API (MyMemory / LibreTranslate fallback)
 */

const GIT_CONVENTION_MAP: { [key: string]: string } = {
  'feat': 'característica',
  'fix': 'corrección',
  'chore': 'tarea',
  'refactor': 'refactorización',
  'docs': 'documentación',
  'test': 'pruebas',
  'style': 'estilos',
  'ci': 'integración continua',
  'perf': 'rendimiento',
  'build': 'compilación',
  'add': 'añadir',
  'update': 'actualizar',
  'remove': 'eliminar',
  'delete': 'eliminar',
  'implement': 'implementar',
  'fix(collab):': 'corrección(colaboración):',
  'proxy WS through Vite in dev and fix PartyKit setup': 'proxy de WebSockets con Vite en dev y solución de PartyKit',
  'add Open Graph meta tags for Nout': 'añadir meta tags Open Graph para Nout',
  'Update README with new project details': 'Actualizar README con nuevos detalles del proyecto',
  'UI: Refine sidebar layout, responsive breadcrumb truncation and spacing': 'UI: Refinar diseño lateral, truncado responsivo de breadcrumbs y espaciado',
  'TEAM_001: Fix collaboration synchronization issues across devices and browsers': 'EQUIPO_001: Corregir problemas de sincronización en colaboración entre dispositivos y navegadores',
  'feat(explorer): implement github pagination and responsive mobile flow': 'característica(explorador): implementar paginación de GitHub y flujo móvil responsivo',
  'refactor(ui): update commit cards background and custom dark checkboxes': 'refactorización(ui): actualizar fondo de tarjetas de commits y casillas oscuras personalizadas',
  'feat(core): setup clean architecture and screaming domain structure': 'característica(core): configurar arquitectura limpia y estructura por dominios',
};

export class FreeTranslationAdapter {
  /**
   * Translates an English commit message to Spanish without AI or tokens.
   */
  async translateToSpanish(text: string): Promise<string> {
    if (!text || text.trim() === '') return text;

    // 1. Direct dictionary match check
    if (GIT_CONVENTION_MAP[text]) {
      return GIT_CONVENTION_MAP[text];
    }

    // 2. Parse Git prefix conventional commit (e.g., "feat(ui): add new button")
    let translated = text;
    Object.entries(GIT_CONVENTION_MAP).forEach(([en, es]) => {
      const regex = new RegExp(`\\b${en}\\b`, 'gi');
      translated = translated.replace(regex, es);
    });

    // If phrase was significantly translated via dictionary, return it
    if (translated !== text) {
      return translated;
    }

    // 3. Fallback to free public MyMemory Translation API (no key required)
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|es`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data && data.responseData && data.responseData.translatedText) {
          const result = data.responseData.translatedText;
          // Avoid returning raw error messages from API limit
          if (!result.includes('MYMEMORY WARNING')) {
            return result;
          }
        }
      }
    } catch {
      // Ignore network failure and return heuristic translation
    }

    return translated;
  }
}

export const freeTranslationAdapter = new FreeTranslationAdapter();
