/**
 * Free Translation Adapter (Zero AI, Zero Cost)
 * Uses Git conventional mapping + free open translation API (MyMemory)
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
};

export class FreeTranslationAdapter {
  /**
   * Translates an English commit message to Spanish without AI or tokens.
   */
  async translateToSpanish(text: string): Promise<string> {
    if (!text || text.trim() === '') return text;

    // 1. Parse Git prefix conventional commit (e.g., "feat(ui): add new button")
    let translated = text;
    Object.entries(GIT_CONVENTION_MAP).forEach(([en, es]) => {
      const regex = new RegExp(`\\b${en}\\b`, 'gi');
      translated = translated.replace(regex, es);
    });

    // If phrase was significantly translated via dictionary, return it
    if (translated !== text) {
      return translated;
    }

    // 2. Fallback to free public MyMemory Translation API (no key required)
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|es`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data && data.responseData && data.responseData.translatedText) {
          const result = data.responseData.translatedText;
          if (!result.includes('MYMEMORY WARNING')) {
            return result;
          }
        }
      }
    } catch {
      // Ignore network failure and return original text
    }

    return translated;
  }
}

export const freeTranslationAdapter = new FreeTranslationAdapter();
