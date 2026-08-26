# TEAM_006: Corregir Paginación de Commits y Sistema de Caché de GitHub API

## Contexto y Diagnóstico
En `GithubApiAdapter.ts`, la función `fetchRepositoryCommits` realizaba una solicitud a la API de GitHub pasando `per_page=${limit}&page=${page}`, devolviendo correctamente la lista paginada de GitHub.
Sin embargo, aplicaba de forma errónea un segundo recorte local: `mapped.slice((page - 1) * limit, page * limit)`.
- En la página 1: recortaba del índice `0` al `35` de un arreglo de 35 elementos (devolvía 35 commits).
- En la página 2: recortaba del índice `35` al `70` de un arreglo de 35 elementos (devolvía `[]`).

Esto ocasionaba que al presionar "Siguiente" apareciera el mensaje *"No se encontraron commits recientes en este repositorio"*.

## Implementación Realizada
1. **Paginación Corregida**: Eliminado el segundo recorte local en `GithubApiAdapter.ts`. Las respuestas paginadas de GitHub API ahora retornan directamente el arreglo mapeado sin desfasar índices.
2. **Sistema de Caché Inteligente (TTL 5 min)**:
   - Implementado almacén en memoria `Map<string, CacheEntry>` con expiración TTL en `GithubApiAdapter.ts`.
   - Se cachean las llamadas a la API de GitHub por clave:
     - Repositorios del usuario (`repos:${token}`, TTL 5 min).
     - Datos del usuario (`user:${token}`, TTL 10 min).
     - Commits paginados de repositorio (`commits:${repoFullName}:${limit}:${page}:${sortOrder}`, TTL 5 min).
   - Al navegar entre páginas (Página 1 -> Página 2 -> Página 1) o alternar repositorios, los datos se cargan de forma instantánea sin consumir cuota de peticiones de la API de GitHub.
3. **Invalidación Manual de Caché**: Al presionar el botón de recargar repositorio en la lista de repositorios, la caché se limpia para obtener los datos más recientes bajo demanda.

## Handoff Checklist
- [x] El proyecto compila sin errores (`npm run build`).
- [x] La paginación de commits funciona correctamente para repositorios con más de 35 commits (como Nout con 151 commits).
- [x] Sistema de caché implementado y funcionando en memoria con expiración TTL.
- [x] Archivo de equipo `TEAM_006_fix_commit_pagination.md` actualizado.
