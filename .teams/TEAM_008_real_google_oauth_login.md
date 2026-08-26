# TEAM_008 — Selector e Integración de Cuentas de Google OAuth (GCP Client ID + Hybrid Account Chooser)

## Diagnóstico y Requerimiento
El usuario preguntó si se requiere configurar un OAuth 2.0 Client ID en Google Cloud Platform (GCP).
- **Respuesta**: Sí, para OAuth 2.0 nativo en producción Google exige registrar un `Client ID` en Google Cloud Console.
- **Solución Híbrida**: Soportar `VITE_GOOGLE_CLIENT_ID` para Google Identity Services nativo, y proveer un **Google Account Chooser UI** interactivo dentro del modal para seleccionar/alternar cuentas reales (`joel.barrientos@gmail.com`, `barrientossjoel@gmail.com`, o agregar cualquier cuenta `@gmail.com` con su avatar y nombre real) sin depender obligatoriamente de una clave de GCP en desarrollo local.

## Plan de Acción Propuesto
1. **Soporte de Google Cloud Client ID (`VITE_GOOGLE_CLIENT_ID`)**:
   - Cargar `https://accounts.google.com/gsi/client`. Si hay un `VITE_GOOGLE_CLIENT_ID` definido, activar la integración nativa de Google Identity Services (popup de Google).
2. **Selector de Cuentas de Google (Google Account Picker UI)**:
   - Crear una interfaz estilo Google Account Chooser con lista de cuentas `@gmail.com` guardadas/recientes (con avatar oficial, correo y estado de conexión).
   - Permitir al usuario cambiar de cuenta en 1 clic o añadir una nueva cuenta `@gmail.com`.
3. **Aislación y Sincronización por Cuenta**:
   - Cada cuenta seleccionada cargará e hidratará sus propios tokens de GitHub y API Keys de Google Gemini asociados.
4. **Ingreso y Guía de Google Cloud Client ID (Opcional)**:
   - Agregar un campo configurable en Ajustes / Modal de Autenticación para ingresar el `Google Client ID` (ej. `xxxxxx.apps.googleusercontent.com`) con enlace directo a Google Cloud Console.

## Estado
- **Completado**: 
  - Desarrollada e integrada la librería nativa de **Google Identity Services (GSI)**.
  - Implementado el **Google Account Picker oficial** (botón de Google) cuando se configura el `Client ID`.
  - Agregado campo interactivo para guardar el **Google OAuth Client ID** directamente desde la UI o mediante `VITE_GOOGLE_CLIENT_ID`.
  - Incluido parser JWT para decodificar automáticamente el ID Token (`email`, `name`, `picture`).
  - Mantenido el selector rápido de cuentas (Google Account Chooser UI) para alternar entre perfiles (`joel.barrientos@gmail.com`, `barrientossjoel@gmail.com`).

## Handoff Checklist
- [x] Project builds cleanly (`npm run build` exit code 0).
- [x] All TypeScript types check out without errors.
- [x] Google GIS integration and Account Chooser UI active.
- [x] Dynamic profile data (email, avatar, name) synced with Settings repository.
