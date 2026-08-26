# TEAM_007 — Sincronización Automática de Configuración y Perfil de Usuario

## Diagnóstico y Solución
El usuario identificó que en su notebook los tokens de GitHub y la API Key de Google no estaban seteados porque no existía vinculación entre el perfil de usuario de Google (`UserProfile`) y el almacén de configuraciones.

## Trabajo Realizado
1. **Modelado e Integración de Entidades (`UserProfile`, `ISettingsRepository`)**:
   - Extendida la interfaz `UserProfile` en `src/core/entities/User.ts` para albergar credenciales y preferencias (`githubToken`, `geminiApiKey`, `publerApiKey`, `publerWorkspaceId`, `aiTone`, `aiLanguage`).
   - Actualizada la interfaz `ISettingsRepository` para admitir persistencia e hidratación por `userId`.
2. **Sincronización Transparente & Ofuscación Criptográfica Ligera (`LocalStorageRepository.ts`)**:
   - Implementadas funciones `obfuscateToken` / `deobfuscateToken` para almacenar los tokens de manera ofuscada (`enc_v1:...`) en `localStorage`, evitando la exposición de claves en texto plano.
   - Sincronizados los ajustes por usuario (`postit_settings_${userId}`) y sesión activa (`postit_user_session`).
3. **Carga e Hidratación Automática (`App.tsx` & `GoogleAuthModal.tsx`)**:
   - Al iniciar sesión con la cuenta de Google (o en el perfil por defecto), PostIt carga e hidrata automáticamente los tokens activos de GitHub y la API key de Google Gemini.
   - Agregada la insignia `✓ Tokens vinculados a la cuenta` en el modal de usuario de Google.
4. **Verificación**:
   - Servidor local verificado y pruebas visuales realizadas en `http://localhost:5173/`.
   - Los campos continúan enmascarados visualmente (`type="password"` -> `••••••••`).

## Handoff Checklist
- [x] El proyecto compila cleanly (`bun run dev`).
- [x] Todos los lints e interfaces de TypeScript actualizados.
- [x] Sincronización automática de credenciales con la cuenta de usuario funcionando.
- [x] Archivo de equipo `TEAM_007_user_account_settings_sync.md` actualizado.
