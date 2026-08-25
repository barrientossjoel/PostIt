import type { IAiGeneratorService, GeneratePostOptions, RefinePostOptions, GeneratedPostOutput } from '../../core/interfaces/IAiGeneratorService';

export class GeminiAiAdapter implements IAiGeneratorService {
  async generatePostFromCommits(options: GeneratePostOptions): Promise<GeneratedPostOutput> {
    const { apiKey, commits, repoName, tone, language } = options;

    if (!apiKey) throw new Error('API Key de Gemini no configurada.');

    const commitsText = commits
      .map(
        (c) => `- Commit [${c.sha.slice(0, 7)}]: ${c.message} (Autor: ${c.author.name}, Fecha: ${c.author.date})`
      )
      .join('\n');

    const prompt = `Eres un creador de contenido dev y community manager.
Genera una publicación para redes sociales basada en la siguiente actualización del repositorio "${repoName}":

COMMITS:
${commitsText}

REGLAS:
- Idioma: ${language === 'es' ? 'Español' : 'Inglés'}.
- Tono: ${tone} (ejemplos: 'developer': geek/tecnológico; 'enthusiastic': avance genial; 'professional': limpio/changelog; 'concise': directo; 'storytelling': dev journey).
- Estructura limpia y atrayente para la comunidad dev.
- Responde estrictamente con un objeto JSON sin formato adicional con las siguientes claves:
  "title": Título corto y atractivo
  "content": Texto completo del post (máximo 280 caracteres ideal para X/Twitter o extensible para LinkedIn)
  "hashtags": Array de 3 a 5 hashtags sugeridos en formato string (ej: ["#BuildInPublic", "#WebDev"])`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Error de Gemini API (${res.status}): ${err.error?.message || res.statusText}`);
    }

    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const clean = raw.replace(/```json/gi, '').replace(/```/g, '').trim();

    try {
      const parsed = JSON.parse(clean);
      return {
        title: parsed.title || `Novedades en ${repoName}`,
        content: parsed.content || raw,
        hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : ['#BuildInPublic', '#DevUpdate'],
      };
    } catch {
      return {
        title: `Actualización de ${repoName}`,
        content: raw,
        hashtags: ['#BuildInPublic', '#DevUpdate'],
      };
    }
  }

  async refinePost(options: RefinePostOptions): Promise<string> {
    const { apiKey, currentContent, actionInstruction, language } = options;

    if (!apiKey) throw new Error('API Key de Gemini no configurada.');

    const prompt = `Post actual:
"${currentContent}"

Instruction: "${actionInstruction}"
Idioma deseado: ${language === 'es' ? 'Español' : 'Inglés'}

Devuelve SOLO el texto refinado para redes sociales sin introducciones ni comillas.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!res.ok) throw new Error(`Error al refinar en Gemini API (${res.status})`);

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || currentContent;
  }
}
