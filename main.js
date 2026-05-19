const {
  ItemView,
  Menu,
  MarkdownView,
  MarkdownRenderer,
  Modal,
  Notice,
  Platform,
  Plugin,
  PluginSettingTab,
  SecretComponent,
  Setting,
  setIcon,
  requestUrl
} = require("obsidian");
// BEGIN CORTEX CHAT BUNDLED LIBS
const __cortexChatModules = Object.create(null);
const __cortexChatModuleCache = Object.create(null);

function __cortexChatDefine(id, factory) {
  __cortexChatModules[id] = factory;
}

function __cortexChatRequire(id) {
  if (!__cortexChatModules[id]) {
    return require(id);
  }
  if (!__cortexChatModuleCache[id]) {
    const module = { exports: {} };
    __cortexChatModuleCache[id] = module;
    __cortexChatModules[id](module, module.exports, __cortexChatRequire);
  }
  return __cortexChatModuleCache[id].exports;
}

__cortexChatDefine('./lib/i18n', function(module, exports, require) {
const DEFAULT_LANGUAGE = "en";
const SUPPORTED_LANGUAGES = ["en", "es"];

const PROMPTS = {
  en: {
    role:
      "Act as an assistant embedded in a personal Obsidian vault. Your job is to help think, organize, write, and execute tasks using the vault context.",
    context:
      "Answer in the user's language. Prioritize explicit context: active note, @ references, outgoing links, shared memory, and recent sessions. Do not invent note content that was not provided.",
    behavior:
      "If critical context is missing, say so and ask for the minimum needed. Distinguish observed facts, inferences, and recommendations. Prefer actionable, concise, useful answers.",
    safety:
      "Protect sensitive data and avoid persisting secrets. If an action may modify important content or delete information, explain the risk and require clear intent before acting.",
    output:
      "Give clear answers with light structure when helpful. Reference notes, paths, or sections when useful. Avoid filler and do not expose hidden reasoning; summarize only the necessary reasons.",
    memory:
      "Use memory as auxiliary context, not as absolute truth. If you detect preferences, decisions, or project state, integrate them carefully and avoid duplicating obsolete information."
  },
  es: {
    role:
      "Actúa como un asistente integrado en una bóveda personal de Obsidian. Tu trabajo es ayudar a pensar, organizar, escribir y ejecutar tareas usando el contexto de la bóveda.",
    context:
      "Responde en el idioma del usuario. Usa primero el contexto explícito: nota activa, referencias @, enlaces salientes, memoria compartida y sesiones recientes. No inventes contenido de notas que no se hayan proporcionado.",
    behavior:
      "Si falta contexto crítico, dilo y pide lo mínimo necesario. Distingue hechos observados, inferencias y recomendaciones. Prioriza respuestas accionables, breves y útiles.",
    safety:
      "Protege datos sensibles y evita persistir secretos. Si una acción puede modificar contenido importante o borrar información, explica el riesgo y exige una intención clara antes de actuar.",
    output:
      "Da respuestas claras, con estructura ligera cuando ayude. Referencia notas, rutas o secciones cuando proceda. Evita relleno y no muestres razonamiento oculto; resume solo las razones necesarias.",
    memory:
      "Usa la memoria como contexto auxiliar, no como fuente absoluta. Si detectas preferencias, decisiones o estado de proyectos, intégralo con cuidado y evita duplicar información obsoleta."
  }
};

const I18N = {
  en: {
    languageEnglish: "English",
    languageSpanish: "Spanish",
    languageAuto: "Automatic",
    appTitle: "Cortex",
    openChat: "Open Cortex Chat",
    newTab: "New tab",
    closeTab: "Close tab",
    tabLimitReached: "Maximum {count} tabs allowed.",
    untitledTab: "New chat",
    askCurrentNote: "Ask about current note",
    insertLastResponse: "Insert response into note",
    viewMemoryUsed: "View memory used for last response",
    configureCodex: "Configure Codex OAuth",
    consistencyDiagnostics: "Consistency diagnostics",
    connectionSecurity: "Connection and security",
    backendUrl: "Backend URL",
    backendUrlDesc: "Central backend address. If it fails and the backend is local, the plugin can use direct local mode.",
    deviceState: "Device state",
    deviceStateDesc: "Device: {state} · ID: {id}",
    registered: "registered",
    pending: "pending",
    generatedAutomatically: "(will be generated automatically)",
    repairLocalConfig: "Repair local configuration",
    registerNow: "Register now",
    deviceId: "Device ID",
    deviceIdDesc: "Stable local identifier generated automatically. It is not synced through Obsidian Sync.",
    allowRemoteBackend: "Allow remote backend",
    allowRemoteBackendDesc: "Keep disabled unless you use a remote HTTPS backend under your control.",
    response: "Response",
    defaultWorkMode: "Default work mode",
    defaultWorkModeDesc:
      "Planner acts as a copilot and does not modify content on its own. Execute works without additional prompts and requires backups before touching files.",
    planner: "Planner",
    execute: "Execute",
    copilot: "Copilot",
    unrestricted: "Unrestricted",
    showDiagnostics: "Show diagnostics in panel",
    showDiagnosticsDesc: "Shows backend, device, and current context in the chat header.",
    folderRoots: "Folder reference roots",
    folderRootsDesc: "Comma-separated vault folders that the assistant may load when the user asks to review a folder.",
    maxFolderReferences: "Maximum notes when summarizing a folder",
    maxFolderReferencesDesc: "Limit of notes added as context when folder roots are explicitly configured.",
    systemPrompt: "System Prompt",
    systemPromptDesc: "These sections are composed in fixed order and shared between devices through data.json.",
    promptRole: "Role",
    promptRoleDesc: "Base identity and scope of the assistant inside the vault.",
    promptContext: "Context",
    promptContextDesc: "How active note, references, memory, and sessions should be prioritized.",
    promptBehavior: "Behavior",
    promptBehaviorDesc: "Response criteria, operating tone, and initiative level.",
    promptSafety: "Safety",
    promptSafetyDesc: "Limits for sensitive data, risky actions, or persistence.",
    promptOutput: "Output",
    promptOutputDesc: "Expected response format and style.",
    promptMemory: "Memory",
    promptMemoryDesc: "How to use shared memory without over-trusting it.",
    pluginScale: "Plugin scale",
    visualScale: "Visual scale",
    visualScaleDesc: "Panel-specific scale. You can also use Ctrl/Cmd +, Ctrl/Cmd - and Ctrl/Cmd 0 inside the chat.",
    reset100: "Reset 100%",
    advancedLocal: "Advanced local",
    localBootstrapToken: "Local bootstrap token",
    localBootstrapTokenDesc: "Advanced diagnostic. It is autogenerated if SecretStorage is unavailable. It is not synced.",
    localBackendBootstrapScript: "Local backend bootstrap script",
    localBackendBootstrapScriptDesc:
      "Local script that may start the backend only after explicit local consent. It is not synced.",
    allowLocalBootstrapScript: "Allow local bootstrap script",
    allowLocalBootstrapScriptDesc: "Disabled by default. Enable only if you trust the configured local script.",
    trustCodexVault: "Allow Codex vault trust",
    trustCodexVaultDesc: "Disabled by default. Enable to let the plugin add this vault to Codex trusted projects.",
    localCodexCommand: "Local Codex command",
    localCodexCommandDesc: "Local Codex command. Use `codex` for the official CLI installed with npm.",
    openAssistant: "Open assistant",
    check: "Check",
    tokenSecret: "Token secret",
    tokenSecretDesc: "Local SecretStorage name that stores the device token. It is not synced.",
    maxContextChars: "Max context chars",
    maxContextCharsDesc: "Maximum active-note characters sent to the assistant on each request.",
    language: "Language",
    languageDesc: "Automatic uses Obsidian/browser language when available. Supported languages: English and Spanish.",
    askPlaceholder: "Ask Cortex...",
    inputHint: "Enter sends · Shift+Enter new line · @note",
    sendMessage: "Send message",
    ready: "Ready",
    setup: "Setup",
    error: "Error",
    context: "Context",
    activeContext: "Active context",
    contextPending: "Pending context",
    contextToSend: "Context that will be sent",
    contextLoaded: "Context loaded: {path}",
    noMarkdownOpen: "No open Markdown note found.",
    newChatReady: "New chat ready.",
    hide: "Hide",
    details: "Details",
    hideContextDetails: "Hide context details",
    viewContextDetails: "View context details",
    activeNote: "Active note",
    links: "Links",
    references: "References",
    noNote: "no note",
    noRefs: "0 references",
    referenceCount: "{count} references",
    chatEmpty: "The conversation will appear here. The chat prioritizes the active note and its references.",
    you: "You",
    responseCopied: "Response copied.",
    insertResponse: "Insert this response",
    copyResponse: "Copy this response",
    useAsContext: "Use as context",
    preparingResponse: "Preparing response",
    openEditableNote: "Open an editable note before inserting the response.",
    responseInserted: "Response inserted into the note.",
    writeMessageFirst: "Write a message before sending.",
    sendingToAgent: "Sending message to the assistant",
    preparingContext: "Preparing context",
    codexThinking: "Cortex is thinking",
    codexPreparingResponse: "Cortex is preparing the response",
    unrestrictedActive: "Unrestricted mode active: changes will not ask for additional confirmation.",
    unresolvedReferences: "Could not resolve these @ references: {refs}",
    requestFailed: "Could not complete the request: {error}",
    memoryUsed: "Memory used",
    noMemoryContext: "No memory context is available for this response.",
    memoryFiles: "Memory files",
    recentSessions: "Recent sessions",
    noConsistencyIssues: "No consistency issues detected.",
    diagnosticsUnavailable: "Local diagnostics are not available in this environment.",
    issuesDetected: "{count} issue(s) detected.",
    openSettingsSelectPlugin: "Open Obsidian settings and select Cortex Chat.",
    localBackendReset: "Non-portable local paths were reset on this device.",
    codexLocalProvider: "Codex local",
    codexOauthProvider: "Codex OAuth",
    backendProvider: "Backend",
    serverProvider: "Server",
    serverFallbackProvider: "Server fallback",
    localFallbackProvider: "Local fallback",
    fast: "Fast",
    thinking: "Thinking",
    noLastResponseCopy: "There is no response to copy yet.",
    noLastResponseInsert: "There is no response to insert yet.",
    noLastResponseMemory: "There is no response with memory context yet.",
    memoryLoadFailed: "Could not load memory used: {error}",
    setupMobileTitle: "Remote backend setup",
    setupDesktopTitle: "Configure Codex OAuth",
    setupDesktopDesc:
      "This plugin needs Codex CLI installed and authenticated with ChatGPT for full local answers. If Codex is not ready, it can only use local fallback.",
    setupInstall: "1. Install/update Codex",
    setupLogin: "2. Start OAuth",
    setupTest: "3. Test Codex",
    setupRegister: "Register device",
    setupRefresh: "Refresh status",
    backendStatus: "Backend: {url}",
    status: "Status: {status}",
    version: "Version: {version}",
    lastCheck: "Last check: {time}",
    localOnlyDesktop: "Local Codex CLI is only available on desktop.",
    remoteHttpsRequiredMobile: "Remote HTTPS backend is required on mobile/iOS.",
    remoteHttpsRequired: "Configure a remote HTTPS backend and allow remote backends.",
    mobileUnavailable: "Mobile mode is not available: {error}",
    remoteBackendReady: "Remote backend available.",
    remoteBackendNotReady: "Remote backend is not ready.",
    codexReady: "Codex is ready.",
    codexNotReady: "Codex is not ready. Use install/update.",
    codexInstalledNoOauth: "Codex CLI is installed, but OAuth is missing.",
    codexFound: "Codex CLI found.",
    codexLoginDetected: "Codex OAuth detected.",
    codexLoginPending: "Codex OAuth pending.",
    oauthCheckFailed: "Could not check Codex OAuth.",
    installingCodex: "Installing or updating Codex CLI. This may take a few minutes.",
    codexInstalled: "Codex CLI installed or updated.",
    codexInstallFailed: "Could not install Codex CLI from Obsidian.",
    oauthLaunched: "Codex OAuth launched in an external window.",
    testingCodex: "Testing Codex with a minimal request.",
    codexOauthOk: "Codex OAuth works correctly.",
    codexExecutionFailed: "Codex still cannot execute correctly.",
    deviceRegistered: "Local device registered.",
    deviceRegisterFailed: "Could not register local device. Start the backend and try again.",
    backupFailed: "Could not create the note backup: {error}",
    sensitiveContextRedacted: "Sensitive data was redacted before persisting or sending context: {types}",
    folderReview: "Cortex is reviewing folder {folder}",
    configuredFolderToken: "folder",
    lastNoteHelp: "Last note seen: {note}. Use @NoteName or quick actions to pin context.",
    dataJsonHasLocalKey: "`{path}` still contains `{key}`, which should be local and not synced.",
    duplicateSessionsDetected: "{count} logically duplicated session(s) found from Sync conflicts in `_cortex/sessions`.",
    memoryFileMissingSchema: "`_cortex/memory/{category}.md` is missing a schema version and will be treated as degraded.",
    memoryFileNonCanonical: "`_cortex/memory/{category}.md` contains {count} non-canonical entries that will be ignored when shared memory is used.",
    indexEmpty: "`_cortex/index` is empty or not being used yet.",
    indexUnreadable: "`_cortex/index` does not exist or cannot be read.",
    outboxStale: "`_cortex/outbox` keeps {count} temporary file(s) older than 24h.",
    workModeExecutePrompt:
      "Active work mode: Execute / Unrestricted.\nYou may act without asking for additional confirmation, but before editing or deleting any file or note you must create a backup of the affected file.\n{backupInstruction}\nIf the backup cannot be created first, do not modify or delete the file and explain the block.",
    workModeExecuteBackupPath: "Store those copies in: {backupRoot}, preserving the file path relative to the vault.",
    workModeExecuteBackupGeneric: "Store those copies in a session backup folder, preserving the file path relative to the vault.",
    workModePlannerPrompt:
      "Active work mode: Planner / Copilot.\nDo not modify, delete, rename, or rewrite vault files unless the user asks for it clearly and explicitly.",
    noCodexNoContext:
      "I could not use local Codex and there is not enough content to answer well.\n\nNext steps:\n- open a note with relevant context\n- use an @ reference to add a note",
    localBackupModeNote: "Note: this response uses local backup mode, not the full Codex flow.",
    relevantContextFound: "I found this relevant context:",
    referenceDocument: "Reference document: {doc}.",
    localDeviceRegisteredStatus: "Local device registered.",
    localDevicePendingStatus: "Local configuration pending: {error}",
    noDeviceToken: "Local configuration pending: no device token is available.",
    codexNoJson: "Codex did not return JSON.",
    codexNoOk: "Codex did not return OK.",
    codexNoOutput: "Codex did not return output.",
    localFallbackDesktopOnly: "Local Codex CLI fallback is only available on desktop.",
    vaultPathUnavailable: "Could not resolve the local vault path for local mode.",
    backupFilePathUnavailable: "Could not resolve the file path to create the backup.",
    backupVaultPathUnavailable: "Could not resolve the local vault path to create the backup."
    ,
    localCodexUnavailableDetail:
      "{classification} The backend is not accessible and local mode could not use Codex. Detail: {detail}"
  },
  es: {
    languageEnglish: "Inglés",
    languageSpanish: "Español",
    languageAuto: "Automático",
    appTitle: "Cortex",
    openChat: "Abrir Cortex Chat",
    newTab: "Nueva pestaña",
    closeTab: "Cerrar pestaña",
    tabLimitReached: "Máximo {count} pestañas permitidas.",
    untitledTab: "Chat nuevo",
    askCurrentNote: "Preguntar sobre nota actual",
    insertLastResponse: "Insertar respuesta en la nota",
    viewMemoryUsed: "Ver memoria usada para la última respuesta",
    configureCodex: "Configurar Codex OAuth",
    consistencyDiagnostics: "Diagnóstico de consistencia",
    connectionSecurity: "Conexión y seguridad",
    backendUrl: "Backend URL",
    backendUrlDesc: "Dirección del backend central. Si falla y el backend es local, el plugin puede usar modo local directo.",
    deviceState: "Estado de dispositivo",
    deviceStateDesc: "Dispositivo: {state} · ID: {id}",
    registered: "registrado",
    pending: "pendiente",
    generatedAutomatically: "(se generará automáticamente)",
    repairLocalConfig: "Reparar configuración local",
    registerNow: "Registrar ahora",
    deviceId: "Device ID",
    deviceIdDesc: "Identificador estable local generado automáticamente. No se sincroniza por Obsidian Sync.",
    allowRemoteBackend: "Permitir backend remoto",
    allowRemoteBackendDesc: "Déjalo desactivado salvo que uses un backend remoto HTTPS bajo tu control.",
    response: "Respuesta",
    defaultWorkMode: "Modo de trabajo por defecto",
    defaultWorkModeDesc:
      "Planificador actúa como copiloto sin modificar nada por su cuenta. Ejecutar trabaja sin pedir permisos adicionales y exige backups previos si toca archivos.",
    planner: "Planificador",
    execute: "Ejecutar",
    copilot: "Copiloto",
    unrestricted: "Sin restricciones",
    showDiagnostics: "Mostrar diagnóstico en el panel",
    showDiagnosticsDesc: "Muestra backend, dispositivo y contexto actual en la cabecera del chat.",
    folderRoots: "Raíces de carpetas referenciables",
    folderRootsDesc: "Carpetas de la vault, separadas por comas, que el asistente puede cargar cuando pidas revisar una carpeta.",
    maxFolderReferences: "Notas máximas al resumir una carpeta",
    maxFolderReferencesDesc: "Límite de notas añadidas como contexto cuando haya carpetas configuradas explícitamente.",
    systemPrompt: "System Prompt",
    systemPromptDesc: "Estas secciones se combinan en orden fijo y se comparten entre equipos mediante data.json.",
    promptRole: "Rol",
    promptRoleDesc: "Identidad base y ámbito del asistente dentro de la vault.",
    promptContext: "Contexto",
    promptContextDesc: "Cómo debe priorizar nota activa, referencias, memoria y sesiones.",
    promptBehavior: "Comportamiento",
    promptBehaviorDesc: "Criterios de respuesta, tono operativo y nivel de iniciativa.",
    promptSafety: "Seguridad",
    promptSafetyDesc: "Límites al tratar datos sensibles, acciones riesgosas o persistencia.",
    promptOutput: "Salida",
    promptOutputDesc: "Formato y estilo esperados en las respuestas.",
    promptMemory: "Memoria",
    promptMemoryDesc: "Cómo usar la memoria compartida sin sobreconfiar en ella.",
    pluginScale: "Escala del plugin",
    visualScale: "Escala visual",
    visualScaleDesc: "Escala propia del panel. También puedes usar Ctrl/Cmd +, Ctrl/Cmd - y Ctrl/Cmd 0 dentro del chat.",
    reset100: "Reset 100%",
    advancedLocal: "Avanzado local",
    localBootstrapToken: "Local bootstrap token",
    localBootstrapTokenDesc: "Diagnóstico avanzado. Se autogenera si SecretStorage no está disponible. No se sincroniza.",
    localBackendBootstrapScript: "Local backend bootstrap script",
    localBackendBootstrapScriptDesc:
      "Script local que puede arrancar el backend solo tras consentimiento local explícito. No se sincroniza.",
    allowLocalBootstrapScript: "Permitir script local de arranque",
    allowLocalBootstrapScriptDesc: "Desactivado por defecto. Actívalo solo si confías en el script local configurado.",
    trustCodexVault: "Permitir confianza de vault en Codex",
    trustCodexVaultDesc: "Desactivado por defecto. Permite que el plugin añada esta vault a los proyectos de confianza de Codex.",
    localCodexCommand: "Comando local de Codex",
    localCodexCommandDesc: "Comando local de Codex. Usa `codex` para el CLI oficial instalado por npm.",
    openAssistant: "Abrir asistente",
    check: "Comprobar",
    tokenSecret: "Token secret",
    tokenSecretDesc: "Nombre local del secreto en SecretStorage que contiene el token del dispositivo. No se sincroniza.",
    maxContextChars: "Max context chars",
    maxContextCharsDesc: "Número máximo de caracteres de la nota activa que se enviarán al asistente en cada consulta.",
    language: "Idioma",
    languageDesc: "Automático usa el idioma de Obsidian/navegador cuando está disponible. Idiomas soportados: inglés y español.",
    askPlaceholder: "Pregunta a Cortex...",
    inputHint: "Enter envía · Shift+Enter línea · @nota",
    sendMessage: "Enviar mensaje",
    ready: "Listo",
    setup: "Configurar",
    error: "Error",
    context: "Contexto",
    activeContext: "Contexto activo",
    contextPending: "Contexto pendiente",
    contextToSend: "Contexto que se enviará",
    contextLoaded: "Contexto cargado: {path}",
    noMarkdownOpen: "No he encontrado una nota Markdown abierta.",
    newChatReady: "Chat nuevo preparado.",
    hide: "Ocultar",
    details: "Detalles",
    hideContextDetails: "Ocultar detalles de contexto",
    viewContextDetails: "Ver detalles de contexto",
    activeNote: "Nota",
    links: "Enlaces",
    references: "Referencias",
    noNote: "sin nota",
    noRefs: "0 referencias",
    referenceCount: "{count} referencias",
    chatEmpty: "La conversación aparecerá aquí. El chat prioriza el contexto de la nota activa y sus referencias.",
    you: "Tú",
    responseCopied: "Respuesta copiada.",
    insertResponse: "Insertar esta respuesta",
    copyResponse: "Copiar esta respuesta",
    useAsContext: "Usar como contexto",
    preparingResponse: "Preparando respuesta",
    openEditableNote: "Abre una nota editable antes de insertar la respuesta.",
    responseInserted: "Respuesta insertada en la nota.",
    writeMessageFirst: "Escribe un mensaje antes de enviar.",
    sendingToAgent: "Enviando mensaje al asistente",
    preparingContext: "Preparando contexto",
    codexThinking: "Cortex está pensando",
    codexPreparingResponse: "Cortex está preparando la respuesta",
    unrestrictedActive: "Sin restricciones activo: si hay cambios, se ejecutarán sin pedir confirmación adicional.",
    unresolvedReferences: "No he podido resolver estas referencias @: {refs}",
    requestFailed: "No se pudo completar la petición: {error}",
    memoryUsed: "Memoria usada",
    noMemoryContext: "No hay contexto de memoria disponible para esta respuesta.",
    memoryFiles: "Archivos de memoria",
    recentSessions: "Sesiones recientes",
    noConsistencyIssues: "No se han detectado incidencias de consistencia.",
    diagnosticsUnavailable: "Diagnóstico local no disponible en este entorno.",
    issuesDetected: "Se han detectado {count} incidencias.",
    openSettingsSelectPlugin: "Abre los ajustes de Obsidian y selecciona Cortex Chat.",
    localBackendReset: "Se han reseteado rutas locales no portables al cargar este equipo.",
    codexLocalProvider: "Codex local",
    codexOauthProvider: "Codex OAuth",
    backendProvider: "Backend",
    serverProvider: "Servidor",
    serverFallbackProvider: "Respaldo servidor",
    localFallbackProvider: "Respaldo local",
    fast: "Rápido",
    thinking: "Pensar",
    noLastResponseCopy: "Todavía no hay una respuesta para copiar.",
    noLastResponseInsert: "Todavía no hay una respuesta para insertar.",
    noLastResponseMemory: "Todavía no hay una respuesta con contexto de memoria.",
    memoryLoadFailed: "No se pudo cargar la memoria usada: {error}",
    setupMobileTitle: "Configurar backend remoto",
    setupDesktopTitle: "Configurar Codex OAuth",
    setupDesktopDesc:
      "Este plugin necesita Codex CLI instalado y autenticado con ChatGPT para dar respuestas locales completas. Si Codex no está listo, solo puede usar respaldo local.",
    setupInstall: "1. Instalar/actualizar Codex",
    setupLogin: "2. Iniciar OAuth",
    setupTest: "3. Probar Codex",
    setupRegister: "Registrar dispositivo",
    setupRefresh: "Actualizar estado",
    backendStatus: "Backend: {url}",
    status: "Estado: {status}",
    version: "Versión: {version}",
    lastCheck: "Última comprobación: {time}",
    localOnlyDesktop: "Codex CLI local solo está disponible en escritorio.",
    remoteHttpsRequiredMobile: "En móvil/iOS hace falta un backend remoto HTTPS.",
    remoteHttpsRequired: "Configura un backend remoto HTTPS y activa backends remotos.",
    mobileUnavailable: "Modo móvil no disponible: {error}",
    remoteBackendReady: "Backend remoto disponible.",
    remoteBackendNotReady: "El backend remoto no está listo.",
    codexReady: "Codex está listo.",
    codexNotReady: "Codex CLI no está listo. Usa Instalar/actualizar.",
    codexInstalledNoOauth: "Codex CLI está instalado, pero falta OAuth.",
    codexFound: "Codex CLI encontrado.",
    codexLoginDetected: "OAuth de Codex detectado.",
    codexLoginPending: "OAuth de Codex pendiente.",
    oauthCheckFailed: "No se pudo comprobar OAuth de Codex.",
    installingCodex: "Instalando o actualizando Codex CLI. Puede tardar unos minutos.",
    codexInstalled: "Codex CLI instalado o actualizado.",
    codexInstallFailed: "No se pudo instalar Codex CLI desde Obsidian.",
    oauthLaunched: "OAuth de Codex lanzado en una ventana externa.",
    testingCodex: "Probando Codex con una petición mínima.",
    codexOauthOk: "Codex OAuth funciona correctamente.",
    codexExecutionFailed: "Codex todavía no ejecuta correctamente.",
    deviceRegistered: "Dispositivo local registrado.",
    deviceRegisterFailed: "No se pudo registrar el dispositivo local. Arranca el backend y vuelve a intentarlo.",
    backupFailed: "No se ha podido crear la copia previa de la nota: {error}",
    sensitiveContextRedacted: "Se han redactado datos sensibles antes de persistir o reenviar contexto: {types}",
    folderReview: "Cortex está revisando la carpeta {folder}",
    configuredFolderToken: "carpeta",
    lastNoteHelp: "Última nota vista: {note}. Usa @NombreNota o las acciones rápidas para anclar el contexto.",
    dataJsonHasLocalKey: "`{path}` aún contiene `{key}`, que debería ser local y no sincronizarse.",
    duplicateSessionsDetected: "Hay {count} sesiones duplicadas lógicamente por conflictos de Sync en `_cortex/sessions`.",
    memoryFileMissingSchema: "`_cortex/memory/{category}.md` no tiene versión de esquema y se tratará como degradado.",
    memoryFileNonCanonical: "`_cortex/memory/{category}.md` contiene {count} entradas no canónicas que el plugin ignorará al usar memoria compartida.",
    indexEmpty: "`_cortex/index` está vacío o no se está usando todavía.",
    indexUnreadable: "`_cortex/index` no existe o no se puede leer.",
    outboxStale: "`_cortex/outbox` conserva {count} temporales con más de 24h.",
    workModeExecutePrompt:
      "Modo de trabajo activo: Ejecutar / Sin restricciones.\nPuedes actuar sin pedir permiso adicional, pero antes de editar o borrar cualquier archivo o nota debes crear una copia de seguridad del archivo afectado.\n{backupInstruction}\nSi no puedes crear la copia previa, no modifiques ni borres el archivo y explica el bloqueo.",
    workModeExecuteBackupPath: "Guarda esas copias dentro de: {backupRoot} preservando la ruta relativa del archivo dentro de la vault.",
    workModeExecuteBackupGeneric: "Guarda esas copias dentro de una carpeta de backup de la sesión preservando la ruta relativa del archivo dentro de la vault.",
    workModePlannerPrompt:
      "Modo de trabajo activo: Planificador / Copiloto.\nNo modifiques, borres, renombres ni reescribas archivos de la vault salvo que el usuario lo pida de forma clara y explícita.",
    noCodexNoContext:
      "No he podido usar Codex local y tampoco tengo contenido suficiente para responder bien.\n\nSiguientes pasos:\n- abre una nota con contexto relevante\n- usa una referencia @ para añadir una nota",
    localBackupModeNote: "Nota: esta respuesta usa un modo local de respaldo, no el flujo completo con Codex.",
    relevantContextFound: "He encontrado este contexto relevante:",
    referenceDocument: "Documento de referencia: {doc}.",
    localDeviceRegisteredStatus: "Dispositivo local registrado.",
    localDevicePendingStatus: "Configuración local pendiente: {error}",
    noDeviceToken: "Configuración local pendiente: no hay token de dispositivo disponible.",
    codexNoJson: "Codex no devolvió JSON.",
    codexNoOk: "Codex no devolvió OK.",
    codexNoOutput: "Codex no devolvió salida.",
    localFallbackDesktopOnly: "El respaldo local con Codex CLI solo está disponible en escritorio.",
    vaultPathUnavailable: "No he podido resolver la ruta local de la vault para usar el modo local.",
    backupFilePathUnavailable: "No he podido resolver la ruta del archivo para crear la copia de seguridad.",
    backupVaultPathUnavailable: "No he podido resolver la ruta local de la vault para crear la copia de seguridad."
    ,
    localCodexUnavailableDetail:
      "{classification} El backend no está accesible y el modo local tampoco ha podido usar Codex. Detalle: {detail}"
  }
};

function normalizeLanguage(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized.startsWith("es")) {
    return "es";
  }
  if (normalized.startsWith("en")) {
    return "en";
  }
  return DEFAULT_LANGUAGE;
}

function detectObsidianLanguage() {
  const candidates = [];
  try {
    candidates.push(globalThis?.document?.documentElement?.lang);
  } catch {}
  try {
    candidates.push(globalThis?.localStorage?.getItem?.("language"));
  } catch {}
  try {
    candidates.push(globalThis?.moment?.locale?.());
  } catch {}
  try {
    candidates.push(globalThis?.navigator?.language);
  } catch {}
  for (const candidate of candidates) {
    if (candidate) {
      return normalizeLanguage(candidate);
    }
  }
  return DEFAULT_LANGUAGE;
}

function resolveLanguage(mode) {
  if (mode === "es" || mode === "en") {
    return mode;
  }
  return detectObsidianLanguage();
}

function formatTemplate(template, params = {}) {
  return String(template || "").replace(/\{([^}]+)\}/g, (_, key) =>
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : `{${key}}`
  );
}

function createTranslator(getLanguage) {
  return function translate(key, params = {}) {
    const language = resolveLanguage(typeof getLanguage === "function" ? getLanguage() : getLanguage);
    const template = I18N[language]?.[key] ?? I18N[DEFAULT_LANGUAGE]?.[key] ?? key;
    return formatTemplate(template, params);
  };
}

function getDefaultSystemPromptSections(languageMode = "auto") {
  const language = resolveLanguage(languageMode);
  return { ...(PROMPTS[language] || PROMPTS[DEFAULT_LANGUAGE]) };
}

module.exports = {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  I18N,
  PROMPTS,
  createTranslator,
  detectObsidianLanguage,
  formatTemplate,
  getDefaultSystemPromptSections,
  normalizeLanguage,
  resolveLanguage
};
});

__cortexChatDefine('./lib/security', function(module, exports, require) {
function isForeignWindowsUserPath(value, homeDir = "") {
  const current = String(value || "").toLowerCase();
  const home = String(homeDir || "").toLowerCase();
  return current.startsWith("c:\\users\\") && Boolean(home) && !current.startsWith(home);
}

function isLocalBackendUrl(value) {
  try {
    const parsed = new URL(value);
    return ["127.0.0.1", "localhost", "::1"].includes(parsed.hostname);
  } catch {
    return false;
  }
}

function validateBackendUrl(value, options = {}) {
  const parsed = new URL(value);
  const isLocal = isLocalBackendUrl(value);
  if (options.isMobile && isLocal) {
    throw new Error(options.messages?.mobileLocal || "Localhost is not available on mobile.");
  }
  if (isLocal) {
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error(options.messages?.localProtocol || "Local backend must use http or https.");
    }
    return;
  }
  if (!options.allowRemoteBackend) {
    throw new Error(options.messages?.remoteDisabled || "Remote backends are disabled.");
  }
  if (parsed.protocol !== "https:") {
    throw new Error(options.messages?.remoteHttps || "Remote backend must use HTTPS.");
  }
}

function normalizeFolderRoots(value) {
  const source = Array.isArray(value) ? value : String(value || "").split(",");
  const seen = new Set();
  const roots = [];
  for (const item of source) {
    const normalized = String(item || "")
      .replaceAll("\\", "/")
      .replace(/^\/+|\/+$/g, "")
      .trim();
    if (
      !normalized ||
      normalized.startsWith("_cortex/") ||
      normalized === "_cortex" ||
      seen.has(normalized)
    ) {
      continue;
    }
    seen.add(normalized);
    roots.push(normalized);
  }
  return roots;
}

function parseFolderRootsInput(value) {
  return normalizeFolderRoots(value);
}

function formatFolderRoots(value) {
  return normalizeFolderRoots(value).join(", ");
}

const DEFAULT_EXCLUDED_PATH_SEGMENTS = new Set([
  "node_modules",
  ".git",
  ".obsidian",
  "_cortex",
  "dist",
  "build",
  ".cache",
  ".vite",
  "coverage"
]);

function isIgnoredVaultPath(filePath, extraSegments = []) {
  const extras = Array.isArray(extraSegments) ? extraSegments : [];
  const excluded = new Set([...DEFAULT_EXCLUDED_PATH_SEGMENTS, ...extras].map((item) => String(item).toLowerCase()));
  return String(filePath || "")
    .replaceAll("\\", "/")
    .split("/")
    .some((segment) => excluded.has(segment.toLowerCase()));
}

module.exports = {
  DEFAULT_EXCLUDED_PATH_SEGMENTS,
  formatFolderRoots,
  isForeignWindowsUserPath,
  isIgnoredVaultPath,
  isLocalBackendUrl,
  normalizeFolderRoots,
  parseFolderRootsInput,
  validateBackendUrl
};
});

__cortexChatDefine('./lib/context', function(module, exports, require) {
const { normalizeFolderRoots } = __cortexChatRequire('./lib/security');

function wantsFolderContext(message, roots = []) {
  const source = String(message || "").toLowerCase();
  const configuredRoots = normalizeFolderRoots(roots);
  return (
    configuredRoots.length > 0 &&
    (/(carpeta|folder|directorio|all notes|todas las notas|todos los archivos)/.test(source) ||
      configuredRoots.some((root) => source.includes(root.toLowerCase())))
  );
}

function isInsideConfiguredRoot(filePath, roots = []) {
  const normalizedPath = String(filePath || "").replaceAll("\\", "/");
  return normalizeFolderRoots(roots).some((root) => normalizedPath === root || normalizedPath.startsWith(`${root}/`));
}

function rootForPath(filePath, roots = []) {
  const normalizedPath = String(filePath || "").replaceAll("\\", "/");
  return normalizeFolderRoots(roots).find((root) => normalizedPath === root || normalizedPath.startsWith(`${root}/`)) || "";
}

module.exports = {
  isInsideConfiguredRoot,
  rootForPath,
  wantsFolderContext
};
});

__cortexChatDefine('./lib/agent-store', function(module, exports, require) {
const path = require("node:path");

const CORTEX_DATA_ROOT = "_cortex";

function agentPaths(vaultRoot) {
  const agentRoot = path.join(vaultRoot, CORTEX_DATA_ROOT);
  return {
    agentRoot,
    memoryRoot: path.join(agentRoot, "memory"),
    sessionsRoot: path.join(agentRoot, "sessions"),
    outboxRoot: path.join(agentRoot, "outbox"),
    indexRoot: path.join(agentRoot, "index")
  };
}

function sessionBackupRoot(createdAt, threadId, sessionId) {
  const date = new Date(createdAt || new Date().toISOString());
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return path.join(CORTEX_DATA_ROOT, "backups", year, month, day, `${threadId}-${sessionId}`).replaceAll("\\", "/");
}

module.exports = {
  CORTEX_DATA_ROOT,
  agentPaths,
  sessionBackupRoot
};
});

__cortexChatDefine('./lib/codex-cli', function(module, exports, require) {
function escapePowerShellSingleQuoted(value) {
  return String(value).replace(/'/g, "''");
}

function codexSandboxForMode(runOptions = {}) {
  return runOptions.interactionMode === "execute" ? "workspace-write" : "read-only";
}

function codexReasoningForEffort(runOptions = {}) {
  return runOptions.effort === "fast" ? "medium" : "high";
}

function buildCodexExecCommand(options) {
  const codexCommand = escapePowerShellSingleQuoted(options.codexCommand || "codex");
  const promptPath = escapePowerShellSingleQuoted(options.promptPath);
  const outputPath = escapePowerShellSingleQuoted(options.outputPath);
  const vaultRoot = escapePowerShellSingleQuoted(options.vaultRoot);
  const sandbox = codexSandboxForMode(options.runOptions);
  const effort = codexReasoningForEffort(options.runOptions);

  return [
    "$ErrorActionPreference = 'Stop'",
    "[Console]::InputEncoding = [System.Text.Encoding]::UTF8",
    "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8",
    `$promptPath = '${promptPath}'`,
    `$outputPath = '${outputPath}'`,
    `$vaultRoot = '${vaultRoot}'`,
    `Get-Content -Raw -Encoding utf8 -LiteralPath $promptPath | & '${codexCommand}' --ask-for-approval never exec -C $vaultRoot --skip-git-repo-check --sandbox ${sandbox} -c 'model_reasoning_effort="${effort}"' --output-last-message $outputPath -`
  ].join("\n");
}

function hasNonAscii(value) {
  return /[^\u0000-\u007f]/.test(String(value || ""));
}

function classifyLocalCodexFailure(detail, context = {}, messages = {}) {
  const source = String(detail || "");
  const lower = source.toLowerCase();
  const notePath = String(context.notePath || "");
  const hasUnicodePath = hasNonAscii(notePath);
  if (/login required|not authenticated|oauth pendiente|error loading configuration|not logged|not signed/i.test(source)) {
    return messages.notAuthenticated || "Codex local is not authenticated on this device.";
  }
  if (/timeout waiting for child process to exit|timed out|operation timed out/i.test(lower)) {
    return hasUnicodePath
      ? messages.timeoutUnicode || "Codex local timed out. Unicode paths or content may be involved."
      : messages.timeout || "Codex local timed out.";
  }
  if (/constrainedlanguage|propertysetter not supported in constrainedlanguage/i.test(lower)) {
    return messages.constrainedLanguage || "PowerShell is running in restricted mode and blocked Codex commands.";
  }
  if (/blocked by policy|rejected: blocked by policy|executionpolicy/i.test(lower)) {
    return messages.blockedPolicy || "Local policy blocked commands attempted by Codex.";
  }
  if (/\?\?/.test(source) || /visi\?\?|c\?\?maras|t\?\?cnica/i.test(source)) {
    return messages.encoding || "Unicode encoding degradation was detected in local execution.";
  }
  return messages.generic || "Codex local failed while answering with the injected context.";
}

module.exports = {
  buildCodexExecCommand,
  classifyLocalCodexFailure,
  codexReasoningForEffort,
  codexSandboxForMode,
  escapePowerShellSingleQuoted,
  hasNonAscii
};
});

__cortexChatDefine('./lib/settings', function(module, exports, require) {
const { getDefaultSystemPromptSections, resolveLanguage } = __cortexChatRequire('./lib/i18n');
const { normalizeFolderRoots } = __cortexChatRequire('./lib/security');

const MEMORY_CATEGORIES = ["preferences", "projects", "people", "decisions", "recent"];
const CORTEX_SCHEMA_VERSION = "3";
const LOCAL_STATE_VERSION = "1";

const SHARED_SETTING_KEYS = [
  "backendUrl",
  "allowRemoteBackend",
  "maxContextChars",
  "defaultInteractionMode",
  "showDiagnostics",
  "localFallbackDelayMs",
  "maxFolderReferences",
  "folderReferenceRoots",
  "systemPromptSections",
  "uiScale",
  "languageMode",
  "chatTabs",
  "activeChatTabId"
];

const LOCAL_SETTING_KEYS = [
  "deviceId",
  "deviceLabel",
  "deviceTokenSecretName",
  "localBootstrapToken",
  "localBackendBootstrapScript",
  "localBackendBootstrapAllowed",
  "localCodexCommand",
  "allowCodexVaultTrust",
  "codexSetupPrompted",
  "codexSetupCompleted",
  "codexStatus",
  "codexVersion",
  "codexLastCheck",
  "codexInstalledOk",
  "codexLoginOk",
  "codexExecutionOk",
  "deviceRegisteredOk"
];

function buildDefaultSettings(pluginId) {
  return {
    backendUrl: "http://127.0.0.1:8787",
    deviceId: "",
    deviceLabel: "",
    deviceTokenSecretName: `${pluginId}-device-token`,
    allowRemoteBackend: false,
    maxContextChars: 2000,
    localBootstrapToken: "",
    localBackendBootstrapScript: "",
    localBackendBootstrapAllowed: false,
    defaultInteractionMode: "plan",
    showDiagnostics: true,
    localFallbackDelayMs: 900,
    maxFolderReferences: 24,
    folderReferenceRoots: [],
    localCodexCommand: "codex",
    allowCodexVaultTrust: false,
    codexSetupPrompted: false,
    codexSetupCompleted: false,
    codexStatus: "",
    codexVersion: "",
    codexLastCheck: "",
    codexInstalledOk: false,
    codexLoginOk: false,
    codexExecutionOk: false,
    deviceRegisteredOk: false,
    systemPromptSections: getDefaultSystemPromptSections("auto"),
    uiScale: 1,
    languageMode: "auto",
    chatTabs: [],
    activeChatTabId: ""
  };
}

function normalizeSystemPromptSections(value, languageMode = "auto") {
  const defaults = getDefaultSystemPromptSections(languageMode);
  const current = value && typeof value === "object" ? value : {};
  const normalized = {};
  for (const key of Object.keys(defaults)) {
    normalized[key] = typeof current[key] === "string" ? current[key] : defaults[key];
  }
  return normalized;
}

function normalizeLanguageMode(value) {
  return value === "es" || value === "en" || value === "auto" ? value : "auto";
}

function normalizeSettings(settings, defaults) {
  const next = { ...defaults, ...(settings || {}) };
  next.languageMode = normalizeLanguageMode(next.languageMode);
  next.systemPromptSections = normalizeSystemPromptSections(next.systemPromptSections, next.languageMode);
  next.folderReferenceRoots = normalizeFolderRoots(next.folderReferenceRoots);
  next.chatTabs = Array.isArray(next.chatTabs) ? next.chatTabs : [];
  next.activeChatTabId = typeof next.activeChatTabId === "string" ? next.activeChatTabId : "";
  return next;
}

function getSettingsLanguage(settings) {
  return resolveLanguage(settings?.languageMode || "auto");
}

module.exports = {
  CORTEX_SCHEMA_VERSION,
  LOCAL_SETTING_KEYS,
  LOCAL_STATE_VERSION,
  MEMORY_CATEGORIES,
  SHARED_SETTING_KEYS,
  buildDefaultSettings,
  getSettingsLanguage,
  normalizeLanguageMode,
  normalizeSettings,
  normalizeSystemPromptSections
};
});

// END CORTEX CHAT BUNDLED LIBS

const {
  createTranslator,
  getDefaultSystemPromptSections,
  resolveLanguage
} = __cortexChatRequire('./lib/i18n');
const {
  formatFolderRoots,
  isForeignWindowsUserPath,
  isIgnoredVaultPath,
  isLocalBackendUrl: isLocalBackendUrlValue,
  normalizeFolderRoots,
  parseFolderRootsInput,
  validateBackendUrl: validateBackendUrlValue
} = __cortexChatRequire('./lib/security');
const {
  isInsideConfiguredRoot,
  rootForPath,
  wantsFolderContext
} = __cortexChatRequire('./lib/context');
const {
  CORTEX_DATA_ROOT,
  agentPaths,
  sessionBackupRoot
} = __cortexChatRequire('./lib/agent-store');
const {
  buildCodexExecCommand: buildCodexExecCommandSafe,
  classifyLocalCodexFailure: classifyLocalCodexFailureSafe
} = __cortexChatRequire('./lib/codex-cli');
const {
  CORTEX_SCHEMA_VERSION,
  LOCAL_SETTING_KEYS,
  LOCAL_STATE_VERSION,
  MEMORY_CATEGORIES,
  SHARED_SETTING_KEYS,
  buildDefaultSettings,
  normalizeLanguageMode,
  normalizeSettings,
  normalizeSystemPromptSections
} = __cortexChatRequire('./lib/settings');

function optionalRequire(moduleName) {
  try {
    return require(moduleName);
  } catch {
    return null;
  }
}

const fs = optionalRequire("node:fs/promises");
const os = optionalRequire("node:os");
const path = optionalRequire("node:path");
const nodeCrypto = optionalRequire("node:crypto");
const zlib = optionalRequire("node:zlib");
const childProcess = optionalRequire("node:child_process");
const util = optionalRequire("node:util");
const execFileAsync =
  childProcess?.execFile && util?.promisify ? util.promisify(childProcess.execFile) : null;
const PLUGIN_ID = "cortex-chat";
const VIEW_TYPE = `${PLUGIN_ID}-view`;
const DEFAULT_SETTINGS = buildDefaultSettings(PLUGIN_ID);

const MIN_UI_SCALE = 0.85;
const MAX_UI_SCALE = 1.75;
const UI_SCALE_STEP = 0.1;
const MAX_CHAT_TABS = 3;
const PDF_PREVIEW_MAX_CHARS = 24000;
const PDF_STREAM_SCAN_LIMIT = 24;

function makeId(prefix) {
  if (nodeCrypto?.randomBytes) {
    return `${prefix}_${nodeCrypto.randomBytes(6).toString("hex")}`;
  }
  const bytes = new Uint8Array(6);
  window.crypto?.getRandomValues?.(bytes);
  const random = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("") || String(Date.now());
  return `${prefix}_${random}`;
}

function randomHex(bytes = 16) {
  if (nodeCrypto?.randomBytes) {
    return nodeCrypto.randomBytes(bytes).toString("hex");
  }
  const buffer = new Uint8Array(bytes);
  window.crypto?.getRandomValues?.(buffer);
  return Array.from(buffer, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function cleanDevicePart(value, fallback = "device") {
  const cleaned = String(value || "")
    .trim()
    .replace(/[^A-Za-z0-9_.-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return cleaned || fallback;
}

function getHostLabel() {
  try {
    return cleanDevicePart(os?.hostname?.() || "device");
  } catch {
    return "device";
  }
}

function generateDeviceId() {
  return `${getHostLabel()}-${randomHex(4)}`;
}

function generateDeviceToken() {
  return randomHex(32);
}

function summarize(text) {
  return String(text || "").replace(/\s+/g, " ").trim().slice(0, 160);
}

function createDefaultChatTab(t = createTranslator("en")) {
  const now = new Date().toISOString();
  return {
    id: makeId("tab"),
    threadId: null,
    title: t("untitledTab"),
    createdAt: now,
    updatedAt: now,
    messages: [],
    context: null,
    contextSummary: "",
    isActive: true,
    isStreaming: false,
    needsAttention: false
  };
}

function normalizeChatMessage(message) {
  if (!message || typeof message !== "object") {
    return null;
  }
  const role = message.role === "assistant" ? "assistant" : "user";
  return {
    id: typeof message.id === "string" && message.id ? message.id : makeId("msg"),
    role,
    content: typeof message.content === "string" ? message.content : "",
    meta: message.meta && typeof message.meta === "object" ? message.meta : {}
  };
}

function normalizeChatTab(tab, t = createTranslator("en")) {
  if (!tab || typeof tab !== "object") {
    return createDefaultChatTab(t);
  }
  const fallback = createDefaultChatTab(t);
  const messages = Array.isArray(tab.messages)
    ? tab.messages.map(normalizeChatMessage).filter(Boolean).slice(-40)
    : [];
  return {
    id: typeof tab.id === "string" && tab.id ? tab.id : fallback.id,
    threadId: typeof tab.threadId === "string" ? tab.threadId : null,
    title: typeof tab.title === "string" && tab.title.trim() ? tab.title.trim().slice(0, 80) : fallback.title,
    createdAt: typeof tab.createdAt === "string" ? tab.createdAt : fallback.createdAt,
    updatedAt: typeof tab.updatedAt === "string" ? tab.updatedAt : fallback.updatedAt,
    messages,
    context: tab.context && typeof tab.context === "object" ? tab.context : null,
    contextSummary: typeof tab.contextSummary === "string" ? tab.contextSummary : "",
    isActive: Boolean(tab.isActive),
    isStreaming: Boolean(tab.isStreaming),
    needsAttention: Boolean(tab.needsAttention)
  };
}

function titleFromMessage(message, fallback) {
  const summary = summarize(message);
  return summary ? summary.slice(0, 48) : fallback;
}

function normalizeForFingerprint(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function sha1(value) {
  const normalized = String(value || "");
  if (nodeCrypto?.createHash) {
    return nodeCrypto.createHash("sha1").update(normalized).digest("hex");
  }
  let hash = 0;
  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash * 31 + normalized.charCodeAt(index)) >>> 0;
  }
  return `fallback-${hash.toString(16)}`;
}

function sessionFingerprint(session) {
  return sha1(
    [
      normalizeForFingerprint(session.threadId),
      normalizeForFingerprint(session.createdAt),
      normalizeForFingerprint(session.notePath),
      normalizeForFingerprint(session.userMessage),
      normalizeForFingerprint(session.assistantMessage)
    ].join("\n")
  );
}

function composeSystemPrompt(sections) {
  const normalized = normalizeSystemPromptSections(sections);
  const lines = [];
  for (const [key, value] of Object.entries(normalized)) {
    const trimmed = String(value || "").trim();
    if (!trimmed) {
      continue;
    }
    lines.push(`[${key}]`);
    lines.push(trimmed);
    lines.push("");
  }
  return lines.join("\n").trim();
}

function workModeLabel(interactionMode, t = createTranslator("en")) {
  return interactionMode === "execute" ? t("execute") : t("planner");
}

function workModeDetail(interactionMode, t = createTranslator("en")) {
  return interactionMode === "execute" ? t("unrestricted") : t("copilot");
}

function classifyEffort(message, context = {}, interactionMode = "plan") {
  let score = 0;
  const normalizedMessage = String(message || "").trim();
  const references = context.references || [];
  const notePreview = String(context.content || "");
  const pdfReferences = references.filter((reference) => (reference.kind || reference.fileType) === "pdf").length;

  if (interactionMode === "execute") {
    score += 2;
  }
  if (normalizedMessage.length > 240) {
    score += 1;
  }
  if (normalizedMessage.length > 700) {
    score += 1;
  }
  if (references.length >= 2) {
    score += 1;
  }
  if (references.length >= 5) {
    score += 1;
  }
  if (pdfReferences > 0) {
    score += 2;
  }
  if (notePreview.length > 2200) {
    score += 1;
  }
  if ((context.outgoingLinks || []).length >= 4) {
    score += 1;
  }
  if (
    /(analiza|analisis|compar|contrasta|sinteti|resume|planifica|arquitect|riesg|depura|investiga|normaliza|refactor|audita|diagn[oó]stic|explica|revisa|propon|eval[uú]a)/i.test(
      normalizedMessage
    )
  ) {
    score += 1;
  }
  if (interactionMode === "execute" && /(borra|elimina|edita|reescribe|actualiza|mueve|renombra|corrige|aplica|implementa)/i.test(normalizedMessage)) {
    score += 1;
  }

  return score >= 3 ? "thinking" : "fast";
}

function clampUiScale(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return DEFAULT_SETTINGS.uiScale;
  }
  return Math.min(MAX_UI_SCALE, Math.max(MIN_UI_SCALE, Math.round(numeric * 100) / 100));
}

function truncatePreviewText(text, maxChars, suffix = "") {
  const normalized = normalizeWhitespace(String(text || ""));
  if (!normalized) {
    return "";
  }
  if (!maxChars || normalized.length <= maxChars) {
    return normalized;
  }
  const trimmed = normalized.slice(0, Math.max(0, maxChars - suffix.length - 1)).trimEnd();
  return `${trimmed}${suffix || "…"}`;
}

function decodePdfLiteralString(value) {
  let result = "";
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char !== "\\") {
      result += char;
      continue;
    }
    const next = value[index + 1];
    if (!next) {
      break;
    }
    index += 1;
    if (/[0-7]/.test(next)) {
      let octal = next;
      while (index + 1 < value.length && octal.length < 3 && /[0-7]/.test(value[index + 1])) {
        octal += value[index + 1];
        index += 1;
      }
      result += String.fromCharCode(parseInt(octal, 8));
      continue;
    }
    const escaped = {
      n: "\n",
      r: "\r",
      t: "\t",
      b: "\b",
      f: "\f",
      "(": "(",
      ")": ")",
      "\\": "\\"
    }[next];
    result += escaped ?? next;
  }
  return result;
}

function decodePdfHexString(value) {
  const cleaned = String(value || "").replace(/[^0-9a-f]/gi, "");
  if (!cleaned) {
    return "";
  }
  const padded = cleaned.length % 2 === 1 ? `${cleaned}0` : cleaned;
  const bytes = [];
  for (let index = 0; index < padded.length; index += 2) {
    bytes.push(parseInt(padded.slice(index, index + 2), 16));
  }
  const buffer = Buffer.from(bytes);
  if (buffer.length >= 2) {
    const bom = buffer.slice(0, 2).toString("hex").toLowerCase();
    if (bom === "feff" || bom === "fffe") {
      const chars = [];
      for (let index = 2; index + 1 < buffer.length; index += 2) {
        chars.push(String.fromCharCode(buffer.readUInt16BE(index)));
      }
      return chars.join("");
    }
  }
  return buffer.toString("latin1");
}

function extractPdfTextFromStreamText(streamText, maxChars = PDF_PREVIEW_MAX_CHARS) {
  const blocks = String(streamText || "").match(/BT[\s\S]*?ET/g) || [];
  const sources = blocks.length ? blocks : [String(streamText || "")];
  const parts = [];
  for (const source of sources) {
    const tokens = source.match(/(?:\((?:\\.|[^\\)])*\)|<[0-9A-Fa-f\s]+>)/g) || [];
    for (const token of tokens) {
      let decoded = "";
      if (token.startsWith("(") && token.endsWith(")")) {
        decoded = decodePdfLiteralString(token.slice(1, -1));
      } else if (token.startsWith("<") && token.endsWith(">")) {
        decoded = decodePdfHexString(token.slice(1, -1));
      }
      decoded = String(decoded || "").replace(/[^\S\r\n]+/g, " ").trim();
      if (!decoded || !/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]/.test(decoded)) {
        continue;
      }
      parts.push(decoded);
      if (parts.join(" ").length >= maxChars) {
        return truncatePreviewText(parts.join(" "), maxChars, "… [PDF truncado]");
      }
    }
  }
  return truncatePreviewText(parts.join(" "), maxChars, "… [PDF truncado]");
}

function escapeYamlString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function escapePowerShellSingleQuoted(value) {
  return String(value).replace(/'/g, "''");
}

function parseLastJsonObject(output) {
  const source = String(output || "").trim();
  const matches = source.match(/\{[^\r\n]*\}/g);
  if (!matches?.length) {
    throw new Error(source || "Codex no devolvió JSON.");
  }
  return JSON.parse(matches[matches.length - 1]);
}

function isPortableCodexCommand(value) {
  const current = String(value || "").trim().toLowerCase();
  return !current || current === "codex";
}

function toFrontmatter(data) {
  const lines = ["---"];
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - "${escapeYamlString(item)}"`);
      }
      continue;
    }
    lines.push(`${key}: "${escapeYamlString(value || "")}"`);
  }
  lines.push("---");
  return lines.join("\n");
}

function buildSessionMarkdown(session) {
  return `${toFrontmatter({
    kind: "cortex-session",
    schema_version: session.schemaVersion || CORTEX_SCHEMA_VERSION,
    plugin_version: session.pluginVersion || "",
    session_id: session.sessionId,
    thread_id: session.threadId,
    created_at: session.createdAt,
    device_id: session.deviceId,
    content_fingerprint: session.contentFingerprint || sessionFingerprint(session),
    note_path: session.notePath || "",
    note_title: session.noteTitle || "",
    reference_paths: session.referencePaths || [],
    work_mode: session.workMode || "plan",
    effort: session.effort || "thinking",
    backup_policy: session.backupPolicy || "",
    backup_root: session.backupRoot || "",
    summary: session.summary || ""
  })}

# Session

## User

${session.userMessage}

## Assistant

${session.assistantMessage}

## Context

- Note path: ${session.notePath || "(none)"}
- References: ${(session.referencePaths || []).join(", ") || "(none)"}
- Work mode: ${session.workMode || "plan"}
- Effort: ${session.effort || "thinking"}
- Backup policy: ${session.backupPolicy || "(none)"}
- Backup root: ${session.backupRoot || "(none)"}
`;
}

function buildMemoryMarkdown(category, bullets) {
  return `${toFrontmatter({
    kind: "cortex-memory",
    schema_version: CORTEX_SCHEMA_VERSION,
    category,
    updated_at: new Date().toISOString(),
    managed_by: "cortex-chat-local-fallback"
  })}

# ${category}

${(bullets || []).length ? bullets.map((bullet) => `- ${bullet}`).join("\n") : ""}
`;
}

function buildMemoryCandidateMarkdown(candidate) {
  const sections = [];
  for (const category of MEMORY_CATEGORIES) {
    const bullets = candidate.extracted?.[category] || [];
    if (!bullets.length) {
      continue;
    }
    sections.push(`## ${category}`);
    sections.push(bullets.map((bullet) => `- ${bullet}`).join("\n"));
    sections.push("");
  }

  return `${toFrontmatter({
    kind: "cortex-memory-candidate",
    schema_version: CORTEX_SCHEMA_VERSION,
    plugin_version: candidate.pluginVersion || "",
    session_id: candidate.sessionId || "",
    thread_id: candidate.threadId || "",
    created_at: candidate.createdAt || new Date().toISOString(),
    device_id: candidate.deviceId || "",
    source: "cortex-chat-local-fallback"
  })}

# memory-candidate

${sections.length ? sections.join("\n").trim() : "_No candidate memory extracted._"}
`;
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return { data: {}, body: markdown };
  }

  const data = {};
  const lines = match[1].split("\n");
  let currentArrayKey = null;

  for (const line of lines) {
    if (/^\s*-\s+/.test(line) && currentArrayKey) {
      const value = line.replace(/^\s*-\s+/, "").replace(/^"|"$/g, "");
      data[currentArrayKey].push(value);
      continue;
    }

    const keyValueMatch = line.match(/^([^:]+):\s*(.*)$/);
    if (!keyValueMatch) {
      continue;
    }

    const key = keyValueMatch[1].trim();
    const rawValue = keyValueMatch[2].trim();
    if (!rawValue) {
      data[key] = [];
      currentArrayKey = key;
      continue;
    }

    currentArrayKey = null;
    data[key] = rawValue.replace(/^"|"$/g, "");
  }

  return {
    data,
    body: markdown.slice(match[0].length)
  };
}

function parseBulletLines(markdown) {
  return String(markdown || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2))
    .filter(Boolean);
}

function dedupeLimit(values, limit) {
  const result = [];
  const seen = new Set();
  for (const value of values) {
    const normalized = String(value || "").trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    result.push(normalized);
    if (result.length >= limit) {
      break;
    }
  }
  return result;
}

function isPlaceholderBullet(value) {
  return /^no memory captured yet\.?$/i.test(String(value || "").trim());
}

function isReferenceBullet(value) {
  return /^reference used:/i.test(String(value || "").trim());
}

function looksLikePromptResidue(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) {
    return true;
  }
  return [
    /^si quieres\b/,
    /^haz estos cambios\b/,
    /^crea(?:me)?\b/,
    /^a continuacion\b/,
    /^hemos completado\b/,
    /^##\s+/,
    /^\*\*cambios/,
    /^resumen del razonamiento:/,
    /^he (creado|añadido|dejado|sustituido)\b/,
    /^-+\s/,
    /^`pry-/,
    /^en \[/,
    /^1\.\s+en\b/,
    /^5\.\s+sustituye\b/
  ].some((pattern) => pattern.test(normalized));
}

function sanitizeMemoryBullets(category, bullets) {
  const issues = [];
  const cleaned = [];

  for (const bullet of bullets || []) {
    const normalized = cleanWikiLinks(bullet);
    if (!normalized) {
      continue;
    }
    if (isPlaceholderBullet(normalized)) {
      issues.push(`Eliminado placeholder en ${category}.`);
      continue;
    }
    if (isReferenceBullet(normalized)) {
      issues.push(`Eliminada referencia contextual no canónica en ${category}.`);
      continue;
    }
    if (category !== "recent" && looksLikePromptResidue(normalized)) {
      issues.push(`Eliminado residuo transitorio en ${category}.`);
      continue;
    }
    cleaned.push(normalized);
  }

  return {
    bullets: dedupeLimit(cleaned, category === "recent" ? 25 : 50),
    issues
  };
}

function heuristicMemoryFromExchange(payload) {
  const lines = `${payload.userMessage}\n${payload.assistantMessage}`
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const memory = {
    preferences: [],
    projects: [],
    people: [],
    decisions: [],
    recent: []
  };

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (/(prefiero|me gusta|prefer|habitualmente|usually)/i.test(lower)) {
      memory.preferences.push(line);
    }
    if (/(proyecto|project|roadmap|milestone|speech)/i.test(lower)) {
      memory.projects.push(line);
    }
    if (/(equipo|team|cliente|customer|stakeholder|persona|people)/i.test(lower)) {
      memory.people.push(line);
    }
    if (/(decid|decision|acord|resolved|vamos a|we will)/i.test(lower)) {
      memory.decisions.push(line);
    }
  }

  memory.recent.push(payload.summary || summarize(payload.userMessage));
  return memory;
}

function splitIntoParagraphChunks(text) {
  return String(text || "")
    .split(/\n\s*\n/)
    .map((chunk) => chunk.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function normalizeWhitespace(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function cleanWikiLinks(text) {
  return normalizeWhitespace(
    String(text || "")
      .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
      .replace(/\[\[([^\]]+)\]\]/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/^"+|"+$/g, "")
      .replace(/\s*—\s*/g, " — ")
  );
}

function parseInlineList(value) {
  const raw = String(value || "").trim();
  if (!raw.startsWith("[") || !raw.endsWith("]")) {
    return [];
  }

  return raw
    .slice(1, -1)
    .split(",")
    .map((item) => cleanWikiLinks(item.replace(/^"+|"+$/g, "")))
    .filter(Boolean);
}

function normalizeFrontmatterValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanWikiLinks(item)).filter(Boolean);
  }

  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }

  const inlineList = parseInlineList(raw);
  if (inlineList.length) {
    return inlineList;
  }

  return cleanWikiLinks(raw);
}

function parseLooseFrontmatter(markdown) {
  const source = String(markdown || "");
  const match = /(^|\n)---\n([\s\S]*?)\n---\n?/.exec(source);
  if (!match) {
    return { data: {}, body: source, preamble: "" };
  }

  const fenceStart = match.index + match[1].length;
  const fenceEnd = fenceStart + match[0].length - match[1].length;
  const data = {};
  const lines = match[2].split("\n");
  let currentArrayKey = null;

  for (const line of lines) {
    if (/^\s*-\s+/.test(line) && currentArrayKey) {
      const value = line.replace(/^\s*-\s+/, "").replace(/^"|"$/g, "");
      data[currentArrayKey].push(value);
      continue;
    }

    const keyValueMatch = line.match(/^([^:]+):\s*(.*)$/);
    if (!keyValueMatch) {
      continue;
    }

    const key = keyValueMatch[1].trim();
    const rawValue = keyValueMatch[2].trim();
    if (!rawValue) {
      data[key] = [];
      currentArrayKey = key;
      continue;
    }

    currentArrayKey = null;
    data[key] = rawValue.replace(/^"|"$/g, "");
  }

  return {
    data,
    body: source.slice(fenceEnd),
    preamble: source.slice(0, fenceStart).trim()
  };
}

function extractHeadingTitle(markdown) {
  const match = String(markdown || "").match(/^#\s+(.+)$/m);
  return match ? cleanWikiLinks(match[1]) : "";
}

function extractCalloutBody(markdown, label) {
  const lines = String(markdown || "").split(/\r?\n/);
  const labelLower = String(label || "").toLowerCase();

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const match = line.match(/^>\s*\[![^\]]+\]\s*(.+)$/i);
    if (!match || !match[1].toLowerCase().includes(labelLower)) {
      continue;
    }

    const collected = [];
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const current = lines[cursor];
      if (!current.startsWith(">")) {
        break;
      }
      collected.push(current.replace(/^>\s?/, ""));
    }
    return cleanWikiLinks(collected.join(" "));
  }

  return "";
}

function extractSection(markdown, heading) {
  const lines = String(markdown || "").split(/\r?\n/);
  const target = normalizeWhitespace(heading).toLowerCase();

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line.startsWith("## ")) {
      continue;
    }

    const currentHeading = normalizeWhitespace(line.replace(/^##\s+/, "")).toLowerCase();
    if (currentHeading !== target) {
      continue;
    }

    const collected = [];
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const current = lines[cursor];
      if (/^##\s+/.test(current)) {
        break;
      }
      collected.push(current);
    }
    return collected.join("\n").trim();
  }

  return "";
}

function extractLabeledValue(markdown, label) {
  const match = String(markdown || "").match(new RegExp(`\\*\\*${label}\\*\\*:\\s*(.+)`, "i"));
  return match ? cleanWikiLinks(match[1]) : "";
}

function extractChecklistItems(markdown, limit, checked) {
  const matcher = checked ? /^\s*-\s+\[x\]\s+(.+)$/i : /^\s*-\s+\[\s\]\s+(.+)$/i;
  return String(markdown || "")
    .split(/\r?\n/)
    .map((line) => line.match(matcher))
    .filter(Boolean)
    .map((match) => cleanWikiLinks(match[1]))
    .filter(Boolean)
    .slice(0, limit);
}

function firstMeaningfulParagraph(markdown) {
  return splitIntoParagraphChunks(markdown)
    .map((chunk) => cleanWikiLinks(chunk))
    .find(Boolean);
}

function formatHumanList(values) {
  const items = dedupeLimit((values || []).map((value) => cleanWikiLinks(value)), 8);
  if (!items.length) {
    return "";
  }
  if (items.length === 1) {
    return items[0];
  }
  if (items.length === 2) {
    return `${items[0]} y ${items[1]}`;
  }
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

function buildStructuredSourceSummary(source) {
  const parsed = parseLooseFrontmatter(source.preview || "");
  const meta = Object.fromEntries(
    Object.entries(parsed.data || {}).map(([key, value]) => [key, normalizeFrontmatterValue(value)])
  );
  const title = extractHeadingTitle(parsed.body) || source.title || meta.nombre || "";
  const purpose = extractCalloutBody(parsed.body, "Propósito");
  const stateSection = extractSection(parsed.body, "Estado actual");
  const currentPhase = extractLabeledValue(stateSection, "Fase");
  const currentStatus = firstMeaningfulParagraph(
    stateSection
      .split(/\r?\n/)
      .filter((line) => !/^\*\*Fase\*\*/.test(line))
      .join("\n")
  );
  const betaCriteria = extractSection(parsed.body, "Criterio de salida a beta");
  const pendingBetaItems = extractChecklistItems(betaCriteria, 2, false);
  const completedBetaItems = extractChecklistItems(betaCriteria, 2, true);
  const projectType = Array.isArray(meta.tipo) ? meta.tipo[0] : meta.tipo;
  const status = Array.isArray(meta.estado) ? meta.estado[0] : meta.estado;
  const phase = Array.isArray(meta.fase) ? meta.fase[0] : meta.fase;
  const startDate = Array.isArray(meta.fecha_inicio) ? meta.fecha_inicio[0] : meta.fecha_inicio;
  const betaTarget = Array.isArray(meta.fecha_objetivo_beta) ? meta.fecha_objetivo_beta[0] : meta.fecha_objetivo_beta;
  const tags = Array.isArray(meta.tags) ? meta.tags : [];
  const related = Array.isArray(meta.relacionadas) ? meta.relacionadas : [];
  const tools = Array.isArray(meta.herramientas) ? meta.herramientas : [];
  const stack = Array.isArray(meta.stack) ? meta.stack : [];
  const preambleLinks = String(parsed.preamble || "")
    .split(/\r?\n/)
    .map((line) => cleanWikiLinks(line))
    .filter((line) => /\[\[/.test(line) || line);
  const referenceDoc = preambleLinks.length ? preambleLinks[0] : "";

  const introParts = [title];
  if (projectType) {
    introParts.push(`es un ${projectType}`);
  }
  if (status) {
    introParts.push(status);
  }
  const effectivePhase = currentPhase || phase;
  if (effectivePhase) {
    introParts.push(`en fase ${effectivePhase}`);
  }

  const lines = [];
  if (introParts.length) {
    lines.push(`${introParts.join(" ")}.`);
  }
  if (purpose) {
    lines.push(purpose);
  }
  if (betaTarget) {
    lines.push(`Objetivo beta: ${betaTarget}.`);
  }
  if (startDate) {
    lines.push(`Inicio: ${startDate}.`);
  }
  if (currentStatus) {
    lines.push(`Situación actual: ${currentStatus.replace(/[.。]+$/, "")}.`);
  }
  if (stack.length) {
    lines.push(`Stack principal: ${formatHumanList(stack)}.`);
  }
  if (tools.length) {
    lines.push(`Herramientas clave: ${formatHumanList(tools)}.`);
  }
  if (referenceDoc) {
    lines.push(`Documento de referencia: ${referenceDoc}.`);
  }
  if (related.length) {
    lines.push(`Notas relacionadas: ${formatHumanList(related)}.`);
  }
  if (pendingBetaItems.length) {
    lines.push(`Pendiente para salida a beta: ${formatHumanList(pendingBetaItems)}.`);
  } else if (completedBetaItems.length) {
    lines.push(`Aspectos ya cubiertos: ${formatHumanList(completedBetaItems)}.`);
  }
  if (tags.length) {
    lines.push(`Etiquetas: ${formatHumanList(tags.slice(0, 5))}.`);
  }

  return lines.filter(Boolean).join("\n");
}

function extractSourceFacts(source) {
  const parsed = parseLooseFrontmatter(source.preview || "");
  const meta = Object.fromEntries(
    Object.entries(parsed.data || {}).map(([key, value]) => [key, normalizeFrontmatterValue(value)])
  );
  const title = extractHeadingTitle(parsed.body) || source.title || meta.nombre || "";
  const purpose = extractCalloutBody(parsed.body, "Propósito");
  const stateSection = extractSection(parsed.body, "Estado actual");
  const betaCriteria = extractSection(parsed.body, "Criterio de salida a beta");
  const currentPhase = extractLabeledValue(stateSection, "Fase") || meta.fase || "";
  const pendingBetaItems = extractChecklistItems(betaCriteria, 6, false);
  const completedBetaItems = extractChecklistItems(betaCriteria, 4, true);
  const openSignals = String(parsed.body || "")
    .split(/\r?\n/)
    .map((line) => cleanWikiLinks(line.replace(/^\|\s*/, "").replace(/\s*\|$/, "").replace(/\s*\|\s*/g, " · ")))
    .filter((line) => /(abierto|pendiente|proceso|inestable|validar|bloqueo|bug|crítica|alta|roto)/i.test(line))
    .filter((line) => line.length > 12 && !/^[-:]+$/.test(line))
    .slice(0, 8);
  const todoSignals = String(parsed.body || "")
    .split(/\r?\n/)
    .map((line) => line.match(/^>\s*\[!todo\]\s*(.+)$/i))
    .filter(Boolean)
    .map((match) => cleanWikiLinks(match[1]))
    .slice(0, 6);

  return {
    title,
    purpose,
    type: Array.isArray(meta.tipo) ? meta.tipo[0] : meta.tipo,
    status: Array.isArray(meta.estado) ? meta.estado[0] : meta.estado,
    phase: Array.isArray(currentPhase) ? currentPhase[0] : currentPhase,
    betaTarget: Array.isArray(meta.fecha_objetivo_beta) ? meta.fecha_objetivo_beta[0] : meta.fecha_objetivo_beta,
    stack: Array.isArray(meta.stack) ? meta.stack : [],
    tools: Array.isArray(meta.herramientas) ? meta.herramientas : [],
    related: Array.isArray(meta.relacionadas) ? meta.relacionadas : [],
    pendingBetaItems,
    completedBetaItems,
    openSignals: dedupeLimit([...todoSignals, ...openSignals], 8)
  };
}

function bulletList(items, limit) {
  return dedupeLimit(items, limit)
    .map((item) => `- ${item}`)
    .join("\n");
}

function buildImprovementAnswer(source, message, runOptions) {
  const facts = extractSourceFacts(source);
  const effort = runOptions?.effort || "thinking";
  const mode = runOptions?.interactionMode || "plan";
  const limit = effort === "fast" ? 3 : 6;
  const title = facts.title || source.title || "esta nota";
  const blockers = facts.openSignals.length
    ? facts.openSignals
    : [
        "cerrar los elementos pendientes antes de abrir nuevos frentes",
        "hacer verificables los criterios de salida",
        "reducir ambiguedad entre plan, ejecucion y validacion"
      ];
  const priorities = [
    facts.phase ? `Alinear el trabajo real con la fase actual: ${facts.phase}.` : "",
    facts.betaTarget ? `Convertir el objetivo beta (${facts.betaTarget}) en una lista corta de pruebas de aceptacion.` : "",
    facts.pendingBetaItems.length ? `Cerrar pendientes de salida a beta: ${formatHumanList(facts.pendingBetaItems)}.` : "",
    facts.stack.length ? `Separar responsabilidades por herramienta: ${formatHumanList(facts.stack)}.` : "",
    "Registrar cada decision como criterio verificable en la nota, no como comentario suelto."
  ].filter(Boolean);
  const nextSteps =
    mode === "execute"
      ? [
          "Crear una seccion `## Siguiente ejecucion` con una unica tarea prioritaria.",
          "Marcar responsable, herramienta, dependencia y criterio de cierre.",
          "Mover cualquier mejora no critica a una lista posterior para proteger el cierre beta.",
          "Revisar la nota al final de la sesion y convertir avances en checkboxes cerrados."
        ]
      : [
          "Definir el criterio de exito de beta en 5 pruebas observables.",
          "Ordenar los bloqueos por impacto en usuario, no por facilidad tecnica.",
          "Separar bugs de producto, deuda visual y funcionalidad nueva.",
          "Planificar una sola iteracion cerrada antes de tocar nuevas features."
        ];
  const riskLines = [
    "El mayor riesgo es mezclar cierre beta con funcionalidades nuevas y perder capacidad de validacion.",
    "This note already contains enough context; the next step is to convert it into small operational decisions.",
    facts.tools.length ? `Usaria ${formatHumanList(facts.tools)} solo cuando cada herramienta tenga una responsabilidad clara.` : ""
  ].filter(Boolean);

  return [
    `## Diagnostico de ${title}`,
    facts.purpose || `La nota describe un ${facts.type || "proyecto"} ${facts.status || "activo"}.`,
    "",
    "## Puntos que mas conviene mejorar",
    bulletList(priorities, limit),
    "",
    "## Bloqueos o senales detectadas",
    bulletList(blockers, limit),
    "",
    mode === "execute" ? "## Ejecucion recomendada" : "## Plan recomendado",
    bulletList(nextSteps, effort === "fast" ? 3 : 4),
    "",
    "## Riesgos a vigilar",
    bulletList(riskLines, effort === "fast" ? 2 : 3)
  ]
    .filter(Boolean)
    .join("\n");
}

function buildHeuristicAnswer(message, context, recentSessions, runOptions = {}) {
  const referenced = context.references || [];
  const notePreview = context.content || "";
  const sources = referenced.length
    ? referenced
    : notePreview
      ? [{ title: context.title || "", path: context.path || "", preview: notePreview }]
      : [];
  const asksForImprovement = /(mejor|mejorar|optimiza|optimizar|improve|upgrade|como puedo|cómo puedo|recomienda|siguiente paso|next step)/i.test(
    message
  );

  if (sources.length && asksForImprovement) {
    return sources.map((source) => buildImprovementAnswer(source, message, runOptions)).join("\n\n");
  }

  const structuredSources = referenced
    .map((reference) => buildStructuredSourceSummary(reference))
    .filter(Boolean);

  if (!structuredSources.length && notePreview) {
    const activeNoteSummary = buildStructuredSourceSummary({
      title: context.title || "",
      path: context.path || "",
      preview: notePreview
    });
    if (activeNoteSummary) {
      structuredSources.push(activeNoteSummary);
    }
  }

  if (structuredSources.length) {
    return structuredSources.join("\n\n");
  }

  const activeSource =
    referenced.length > 0
      ? referenced
          .map((reference) => `- ${reference.title}: ${splitIntoParagraphChunks(reference.preview).slice(0, 2).join(" ")}`)
          .join("\n")
      : splitIntoParagraphChunks(notePreview).slice(0, 4).join("\n\n");

  if (!activeSource) {
    return [
      "I could not use local Codex and there is not enough content to answer well.",
      "Try one of these options:",
      "- open the note before asking",
      "- use an @ reference"
    ].join("\n");
  }

  if (/resumen|summary|resume/i.test(message)) {
    return [
      "Resumen rápido basado en el contenido disponible:",
      "",
      activeSource.slice(0, 1800),
      "Nota: esta respuesta usa un modo local de respaldo, no el flujo completo con Codex."
    ].join("\n");
  }

  return [
    "I found this relevant context:",
    "",
    activeSource.slice(0, 1800),
    "",
    "Nota: esta respuesta usa un modo local de respaldo, no el flujo completo con Codex."
  ].join("\n");
}

function extractAtTokens(text) {
  return [...String(text || "").matchAll(/(^|\s)@([^\s@,.;:!?()[\]{}]+)/g)].map((match) => match[2]);
}

function mergeReferences(...groups) {
  const result = [];
  const seen = new Set();

  for (const group of groups) {
    for (const reference of group || []) {
      const key = reference?.path || reference?.title || reference?.token;
      if (!key || seen.has(key)) {
        continue;
      }
      seen.add(key);
      result.push(reference);
    }
  }

  return result;
}

class MemoryContextModal extends Modal {
  constructor(app, payload, t = createTranslator("en")) {
    super(app);
    this.payload = payload || { documents: [], recentSessions: [] };
    this.t = t;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: this.t("memoryUsed") });

    const docs = this.payload.documents || [];
    const sessions = this.payload.recentSessions || [];

    if (!docs.length && !sessions.length) {
      contentEl.createEl("p", { text: this.t("noMemoryContext") });
      return;
    }

    if (docs.length) {
      contentEl.createEl("h3", { text: this.t("memoryFiles") });
      const list = contentEl.createEl("ul");
      for (const doc of docs) {
        list.createEl("li", { text: `${doc.category || "memory"}: ${doc.path}` });
      }
    }

    if (sessions.length) {
      contentEl.createEl("h3", { text: "Sesiones recientes" });
      const list = contentEl.createEl("ul");
      for (const session of sessions) {
        list.createEl("li", {
          text: `${session.createdAt || ""} ${session.summary || session.path || ""}`.trim()
        });
      }
    }
  }
}

class CodexSetupModal extends Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("cortex-chat-setup-modal");
    const mobile = this.plugin.isMobileRuntime();
    contentEl.createEl("h2", { text: mobile ? this.plugin.t("setupMobileTitle") : this.plugin.t("setupDesktopTitle") });
    contentEl.createEl("p", {
      text:
        mobile
          ? this.plugin.t("remoteHttpsRequiredMobile")
          : this.plugin.t("setupDesktopDesc")
    });

    this.statusEl = contentEl.createDiv({ cls: "cortex-chat-setup-status" });
    this.renderStatus();

    const actionsEl = contentEl.createDiv({ cls: "cortex-chat-setup-actions" });
    if (mobile) {
      this.addAction(actionsEl, this.plugin.t("openAssistant"), "allowRemoteBackend", async () => {
        this.plugin.openPluginSettings();
      });
      this.addAction(actionsEl, this.plugin.t("check"), "codexSetupCompleted", async () => {
        await this.plugin.checkRemoteBackendForMobile({ notify: true });
        this.renderStatus();
      });
      return;
    }
    this.addAction(actionsEl, this.plugin.t("setupInstall"), "codexInstalledOk", async () => {
      await this.plugin.installOrUpdateCodex();
      this.renderStatus();
    });
    this.addAction(actionsEl, this.plugin.t("setupLogin"), "codexLoginOk", async () => {
      await this.plugin.launchCodexLogin();
      this.renderStatus();
    });
    this.addAction(actionsEl, this.plugin.t("setupTest"), "codexExecutionOk", async () => {
      await this.plugin.testCodexExecution();
      this.renderStatus();
    });
    this.addAction(actionsEl, this.plugin.t("setupRegister"), "deviceRegisteredOk", async () => {
      await this.plugin.repairLocalProvisioning();
      this.renderStatus();
    });
    this.addAction(actionsEl, this.plugin.t("setupRefresh"), "codexSetupCompleted", async () => {
      await this.plugin.autoCheckCodexSetup({ notify: true });
      this.renderStatus();
    });
  }

  renderStatus() {
    if (!this.statusEl) {
      return;
    }
    this.statusEl.empty();
    if (this.plugin.isMobileRuntime()) {
      this.statusEl.createDiv({ text: this.plugin.t("status", { status: this.plugin.getMobileBackendStatus() }) });
      this.statusEl.createDiv({ text: this.plugin.t("backendStatus", { url: this.plugin.settings.backendUrl || "(unset)" }) });
      return;
    }
    this.statusEl.createDiv({ text: this.plugin.t("status", { status: this.plugin.settings.codexStatus || this.plugin.t("pending") }) });
    this.statusEl.createDiv({
      text: this.plugin.t("deviceStateDesc", {
        state: this.plugin.settings.deviceRegisteredOk ? this.plugin.t("registered") : this.plugin.t("pending"),
        id: this.plugin.settings.deviceId || this.plugin.t("generatedAutomatically")
      })
    });
    if (this.plugin.settings.codexVersion) {
      this.statusEl.createDiv({ text: this.plugin.t("version", { version: this.plugin.settings.codexVersion }) });
    }
    if (this.plugin.settings.codexLastCheck) {
      this.statusEl.createDiv({ text: this.plugin.t("lastCheck", { time: this.plugin.settings.codexLastCheck }) });
    }
  }

  addAction(parentEl, label, statusKey, onClick) {
    const button = parentEl.createEl("button", { cls: "cortex-chat-setup-action" });
    this.renderActionButton(button, label, statusKey);
    button.addEventListener("click", async () => {
      button.disabled = true;
      this.renderActionButton(button, this.plugin.t("preparingResponse"), statusKey);
      try {
        await onClick();
      } finally {
        button.disabled = false;
        this.renderActionButton(button, label, statusKey);
      }
    });
  }

  renderActionButton(button, label, statusKey) {
    button.empty();
    const ok = Boolean(this.plugin.settings[statusKey]);
    button.createSpan({
      cls: `cortex-chat-setup-badge ${ok ? "is-ok" : "is-pending"}`,
      text: ok ? "✓" : "•"
    });
    button.createSpan({ text: label });
  }
}

class CortexChatView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.tabs = [];
    this.activeTabId = "";
    this.messages = [];
    this.threadId = null;
    this.context = null;
    this.contextExpanded = false;
    this.isSending = false;
    this.mentionState = {
      open: false,
      query: "",
      range: null,
      items: [],
      selectedIndex: 0
    };
    this.lastPendingStatus = "";
    this.keydownHandler = null;
  }

  getViewType() {
    return VIEW_TYPE;
  }

  getDisplayText() {
    return this.plugin.t("appTitle");
  }

  getIcon() {
    return "bot";
  }

  async onOpen() {
    this.restoreTabs();
    this.render();
  }

  async onClose() {
    if (this.keydownHandler) {
      this.contentEl?.removeEventListener("keydown", this.keydownHandler);
      this.keydownHandler = null;
    }
  }

  async prepareContext(context) {
    this.setActiveTabState({
      context,
      threadId: null,
      messages: [],
      title: context?.title || context?.path || this.plugin.t("untitledTab"),
      contextSummary: this.describeContext(context)
    });
    this.plugin.setLastResponse(null);
    this.render();
  }

  appendMessage(role, content, meta = {}) {
    const id = makeId("msg");
    const tab = this.getActiveTab();
    tab.messages.push({ id, role, content, meta });
    tab.messages = tab.messages.slice(-40);
    tab.updatedAt = new Date().toISOString();
    this.syncActiveFields();
    void this.persistTabs();
    this.renderMessages();
    this.renderTabBar();
    return id;
  }

  updateMessage(id, content, meta = {}) {
    const tab = this.getActiveTab();
    const message = tab.messages.find((entry) => entry.id === id);
    if (!message) {
      return;
    }
    message.content = content;
    message.meta = { ...(message.meta || {}), ...meta };
    tab.updatedAt = new Date().toISOString();
    this.syncActiveFields();
    void this.persistTabs();
    this.renderMessages();
    this.renderTabBar();
  }

  restoreTabs() {
    const rawTabs = Array.isArray(this.plugin.settings.chatTabs) ? this.plugin.settings.chatTabs : [];
    this.tabs = rawTabs.map((tab) => normalizeChatTab(tab, this.plugin.t)).slice(0, MAX_CHAT_TABS);
    if (!this.tabs.length) {
      this.tabs = [createDefaultChatTab(this.plugin.t)];
    }
    const configuredActiveId = this.plugin.settings.activeChatTabId;
    const active = this.tabs.find((tab) => tab.id === configuredActiveId) || this.tabs.find((tab) => tab.isActive) || this.tabs[0];
    this.activeTabId = active.id;
    this.tabs.forEach((tab) => {
      tab.isActive = tab.id === this.activeTabId;
    });
    this.syncActiveFields();
    void this.persistTabs();
  }

  getActiveTab() {
    let tab = this.tabs.find((entry) => entry.id === this.activeTabId);
    if (!tab) {
      tab = this.tabs[0] || createDefaultChatTab(this.plugin.t);
      if (!this.tabs.length) {
        this.tabs.push(tab);
      }
      this.activeTabId = tab.id;
    }
    return tab;
  }

  getTab(tabId) {
    return this.tabs.find((entry) => entry.id === tabId) || null;
  }

  syncActiveFields() {
    const tab = this.getActiveTab();
    this.threadId = tab.threadId || null;
    this.messages = tab.messages || [];
    this.context = tab.context || null;
  }

  setActiveTabState(patch) {
    const tab = this.getActiveTab();
    this.setTabState(tab.id, patch);
  }

  setTabState(tabId, patch) {
    const tab = this.getTab(tabId);
    if (!tab) {
      return;
    }
    Object.assign(tab, patch, {
      updatedAt: new Date().toISOString()
    });
    tab.contextSummary = tab.contextSummary || this.describeContext(tab.context);
    if (tab.id === this.activeTabId) {
      this.syncActiveFields();
    }
    void this.persistTabs();
  }

  updateMessageInTab(tabId, id, content, meta = {}) {
    const tab = this.getTab(tabId);
    if (!tab) {
      return;
    }
    const message = tab.messages.find((entry) => entry.id === id);
    if (!message) {
      return;
    }
    message.content = content;
    message.meta = { ...(message.meta || {}), ...meta };
    tab.updatedAt = new Date().toISOString();
    if (tab.id === this.activeTabId) {
      this.syncActiveFields();
      this.renderMessages();
    } else {
      tab.needsAttention = true;
    }
    void this.persistTabs();
    this.renderTabBar();
  }

  serializeTabs() {
    return this.tabs.map((tab) => ({
      id: tab.id,
      threadId: tab.threadId || null,
      title: tab.title || this.plugin.t("untitledTab"),
      createdAt: tab.createdAt,
      updatedAt: tab.updatedAt,
      messages: (tab.messages || []).slice(-40),
      context: tab.context || null,
      contextSummary: tab.contextSummary || "",
      isActive: tab.id === this.activeTabId,
      isStreaming: Boolean(tab.isStreaming),
      needsAttention: Boolean(tab.needsAttention)
    }));
  }

  async persistTabs() {
    this.plugin.settings.chatTabs = this.serializeTabs();
    this.plugin.settings.activeChatTabId = this.activeTabId;
    await this.plugin.saveSettings();
  }

  describeContext(context) {
    if (!context) {
      return "";
    }
    const refs = context.references?.length || 0;
    return `${context.title || context.path || this.plugin.t("noNote")} · ${refs ? this.plugin.t("referenceCount", { count: refs }) : this.plugin.t("noRefs")}`;
  }

  applyUiScale() {
    if (!this.contentEl) {
      return;
    }
    this.contentEl.style.setProperty("--cortex-chat-scale", String(this.plugin.getUiScale()));
  }

  registerScaleShortcuts() {
    if (!this.contentEl) {
      return;
    }
    if (this.keydownHandler) {
      this.contentEl.removeEventListener("keydown", this.keydownHandler);
    }
    this.keydownHandler = async (event) => {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }
      if (event.altKey) {
        return;
      }

      const key = String(event.key || "");
      if (key === "+" || key === "=") {
        event.preventDefault();
        await this.plugin.adjustUiScale(UI_SCALE_STEP);
        return;
      }
      if (key === "-" || key === "_") {
        event.preventDefault();
        await this.plugin.adjustUiScale(-UI_SCALE_STEP);
        return;
      }
      if (key === "0") {
        event.preventDefault();
        await this.plugin.resetUiScale();
      }
    };
    this.contentEl.addEventListener("keydown", this.keydownHandler);
  }

  getFolderReviewStatus(message, context) {
    const folderReference = (context?.references || []).find((reference) => reference.source === "folder");
    if (!folderReference) {
      const normalizedMessage = String(message || "").toLowerCase();
      if (!wantsFolderContext(normalizedMessage, this.plugin.settings.folderReferenceRoots)) {
        return "";
      }
      const roots = normalizeFolderRoots(this.plugin.settings.folderReferenceRoots);
      if (!roots.length) {
        return "";
      }
      return this.plugin.t("folderReview", { folder: roots[0] });
    }
    const firstSegment = String(folderReference.path || "")
      .split("/")
      .filter(Boolean)
      .slice(0, 2)
      .join("/");
    const label = firstSegment || folderReference.token || folderReference.title || this.plugin.t("configuredFolderToken");
    return this.plugin.t("folderReview", { folder: label });
  }

  setPendingStatus(id, status, meta = {}, tabId = this.activeTabId) {
    this.lastPendingStatus = status;
    this.updateMessageInTab(tabId, id, "", {
      loading: true,
      status,
      ...meta
    });
  }

  render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("cortex-chat-view");
    contentEl.setAttr("tabindex", "0");
    this.applyUiScale();
    this.registerScaleShortcuts();

    this.headerEl = contentEl.createDiv({ cls: "cortex-chat-header" });
    this.tabBarEl = contentEl.createDiv({ cls: "cortex-chat-tabbar" });
    this.messagesEl = contentEl.createDiv({ cls: "cortex-chat-messages" });
    this.sendEl = contentEl.createDiv({ cls: "cortex-chat-send" });
    this.contextEl = this.sendEl.createDiv({ cls: "cortex-chat-context" });
    this.modeCardsEl = this.sendEl.createDiv({ cls: "cortex-chat-mode-cards" });
    this.renderModeCards();

    this.suggestionsEl = this.sendEl.createDiv({
      cls: "cortex-chat-suggestions suggestion-container"
    });
    this.suggestionsEl.hide();

    this.composerRowEl = this.sendEl.createDiv({ cls: "cortex-chat-composer-row" });
    this.inputEl = this.composerRowEl.createEl("textarea", {
      attr: {
        placeholder: this.plugin.t("askPlaceholder")
      }
    });
    this.inputEl.addClass("cortex-chat-input");

    this.inputEl.addEventListener("input", () => {
      this.autoResizeInput();
      this.updateMentionSuggestions();
    });

    this.inputEl.addEventListener("click", () => {
      this.updateMentionSuggestions();
    });

    this.inputEl.addEventListener("keydown", async (event) => {
      if (this.handleMentionNavigation(event)) {
        return;
      }

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        await this.sendMessage();
      }
    });

    this.inputEl.addEventListener("blur", () => {
      window.setTimeout(() => this.hideMentionSuggestions(), 120);
    });

    this.sendButtonEl = this.composerRowEl.createEl("button", {
      cls: "cortex-chat-send-button",
      attr: { "aria-label": this.plugin.t("sendMessage") }
    });
    setIcon(this.sendButtonEl, "send-horizontal");
    this.sendButtonEl.addEventListener("click", async () => {
      await this.sendMessage();
    });
    this.sendHintEl = this.sendEl.createDiv({
      cls: "cortex-chat-input-hint",
      text: this.plugin.t("inputHint")
    });

    this.renderHeader();
    this.renderTabBar();
    this.renderContext();
    this.renderMessages();
    this.autoResizeInput();
    if (this.isSending) {
      this.setSending(true);
    }
  }

  renderModeCards() {
    if (!this.modeCardsEl) {
      return;
    }

    this.modeCardsEl.empty();
    this.addSegmentedSetting({
      settingKey: "defaultInteractionMode",
      title: this.plugin.t("defaultWorkMode"),
      values: {
        plan: { label: this.plugin.t("planner"), detail: this.plugin.t("copilot") },
        execute: { label: this.plugin.t("execute"), detail: this.plugin.t("unrestricted") }
      }
    });
  }

  addSegmentedSetting(config) {
    const current = this.plugin.settings[config.settingKey] || DEFAULT_SETTINGS[config.settingKey];
    const active = config.values[current] || config.values[Object.keys(config.values)[0]];
    const groupEl = this.modeCardsEl.createDiv({ cls: "cortex-chat-mode-group" });
    const headerEl = groupEl.createDiv({ cls: "cortex-chat-mode-group-header" });
    headerEl.createSpan({ cls: "cortex-chat-mode-group-title", text: config.title });
    if (active?.detail) {
      headerEl.createSpan({ cls: "cortex-chat-mode-group-hint", text: active.detail });
    }
    const segmentedEl = groupEl.createDiv({ cls: "cortex-chat-mode-segmented" });
    for (const [value, option] of Object.entries(config.values)) {
      const buttonEl = segmentedEl.createEl("button", {
        cls: `cortex-chat-mode-segment${value === current ? " is-active" : ""}`,
        attr: {
          "aria-label": `${config.title}: ${option.label}`,
          "aria-pressed": String(value === current),
          title: option.detail ? `${option.label} · ${option.detail}` : option.label
        }
      });
      buttonEl.createSpan({ cls: "cortex-chat-mode-segment-label", text: option.label });
      if (option.detail) {
        buttonEl.createSpan({ cls: "cortex-chat-mode-segment-detail", text: option.detail });
      }
      buttonEl.addEventListener("click", async () => {
        if (this.plugin.settings[config.settingKey] === value) {
          return;
        }
        this.plugin.settings[config.settingKey] = value;
        await this.plugin.saveSettings();
        this.renderModeCards();
        this.renderHeader();
      });
    }
  }

  renderHeader() {
    if (!this.headerEl) {
      return;
    }
    this.headerEl.empty();
    const leftEl = this.headerEl.createDiv({ cls: "cortex-chat-header-left" });
    leftEl.createDiv({ cls: "cortex-chat-title", text: this.plugin.t("appTitle") });
    const state = this.getCodexState();
    const stateEl = leftEl.createDiv({ cls: `cortex-chat-state is-${state.kind}` });
    stateEl.createSpan({ cls: "cortex-chat-state-dot" });
    stateEl.createSpan({ text: state.label });
    if ((this.plugin.settings.defaultInteractionMode || DEFAULT_SETTINGS.defaultInteractionMode) === "execute") {
      leftEl.createDiv({ cls: "cortex-chat-header-mode-chip is-unrestricted", text: this.plugin.t("unrestricted") });
    }
    const actionsButton = this.createIconButton(this.headerEl, "settings", this.plugin.t("consistencyDiagnostics"), "cortex-chat-icon-button");
    actionsButton.addEventListener("click", (event) => this.openActionsMenu(event));
    const newTabButton = this.createIconButton(this.headerEl, "square-plus", this.plugin.t("newTab"), "cortex-chat-icon-button");
    newTabButton.addEventListener("click", () => this.createNewTab());
    const newChatButton = this.createIconButton(this.headerEl, "square-pen", this.plugin.t("newChatReady"), "cortex-chat-icon-button");
    newChatButton.addEventListener("click", () => this.startNewChat());
    const noteButton = this.createIconButton(this.headerEl, "file-text", this.plugin.t("activeNote"), "cortex-chat-icon-button");
    noteButton.addEventListener("click", async () => this.loadCurrentNoteContext());
    if (this.plugin.settings.showDiagnostics) {
      this.headerEl.createDiv({
        cls: "cortex-chat-diagnostics",
        text: `${this.plugin.settings.backendUrl} | ${this.plugin.settings.deviceId}`
      });
    }
  }

  getCodexState() {
    if (this.plugin.isMobileRuntime()) {
      return this.plugin.canUseRemoteBackend()
        ? { kind: "ready", label: this.plugin.t("backendProvider") }
        : { kind: "pending", label: this.plugin.t("setup") };
    }
    const status = String(this.plugin.settings.codexStatus || "").toLowerCase();
    if (this.plugin.settings.codexSetupCompleted || /probado correctamente|oauth detectado/.test(status)) {
      return { kind: "ready", label: this.plugin.t("ready") };
    }
    if (/error|no disponible|no pudo|no se pudo/.test(status)) {
      return { kind: "error", label: this.plugin.t("error") };
    }
    return { kind: "pending", label: this.plugin.t("pending") };
  }

  renderTabBar() {
    if (!this.tabBarEl) {
      return;
    }
    this.tabBarEl.empty();
    if (this.tabs.length < 2) {
      this.tabBarEl.addClass("is-hidden");
      return;
    }
    this.tabBarEl.removeClass("is-hidden");
    for (const tab of this.tabs) {
      const button = this.tabBarEl.createEl("button", {
        cls: `cortex-chat-tab${tab.id === this.activeTabId ? " is-active" : ""}${tab.isStreaming ? " is-streaming" : ""}${tab.needsAttention ? " needs-attention" : ""}`,
        attr: {
          "aria-pressed": String(tab.id === this.activeTabId),
          title: tab.title || this.plugin.t("untitledTab")
        }
      });
      button.createSpan({ cls: "cortex-chat-tab-title", text: tab.title || this.plugin.t("untitledTab") });
      if (this.tabs.length > 1) {
        const close = button.createSpan({ cls: "cortex-chat-tab-close", text: "×" });
        close.setAttribute("aria-label", this.plugin.t("closeTab"));
        close.addEventListener("click", async (event) => {
          event.stopPropagation();
          await this.closeTab(tab.id);
        });
      }
      button.addEventListener("click", async () => {
        await this.activateTab(tab.id);
      });
    }
  }

  async activateTab(tabId) {
    if (!this.tabs.find((tab) => tab.id === tabId)) {
      return;
    }
    this.activeTabId = tabId;
    this.tabs.forEach((tab) => {
      tab.isActive = tab.id === tabId;
      if (tab.isActive) {
        tab.needsAttention = false;
      }
    });
    this.syncActiveFields();
    await this.persistTabs();
    this.render();
  }

  async createNewTab() {
    if (this.tabs.length >= MAX_CHAT_TABS) {
      new Notice(this.plugin.t("tabLimitReached", { count: MAX_CHAT_TABS }));
      return;
    }
    const tab = createDefaultChatTab(this.plugin.t);
    this.tabs.push(tab);
    await this.activateTab(tab.id);
  }

  async closeTab(tabId) {
    if (this.tabs.length <= 1) {
      this.startNewChat();
      return;
    }
    const index = this.tabs.findIndex((tab) => tab.id === tabId);
    if (index === -1) {
      return;
    }
    const wasActive = this.tabs[index].id === this.activeTabId;
    this.tabs.splice(index, 1);
    if (wasActive) {
      const next = this.tabs[Math.max(0, index - 1)] || this.tabs[0];
      this.activeTabId = next.id;
    }
    this.syncActiveFields();
    await this.persistTabs();
    this.render();
  }

  renderQuickActions() {
    if (!this.quickActionsEl) {
      return;
    }
    this.quickActionsEl.empty();
    this.createQuickAction("message-square-plus", this.plugin.t("newChatReady"), () => this.startNewChat());
    this.createQuickAction("file-text", this.plugin.t("activeNote"), async () => this.loadCurrentNoteContext());
    this.createQuickAction("copy", this.plugin.t("copyResponse"), async () => {
      await this.plugin.copyLastResponse();
    });
    this.createQuickAction("corner-down-left", this.plugin.t("insertResponse"), async () => {
      await this.plugin.insertLastResponseIntoNote();
    });
  }

  createQuickAction(icon, ariaLabel, handler) {
    const button = this.quickActionsEl.createEl("button", {
      cls: "cortex-chat-quick-action",
      attr: { "aria-label": ariaLabel, title: ariaLabel }
    });
    setIcon(button, icon);
    button.addEventListener("click", handler);
    return button;
  }

  createIconButton(parentEl, icon, ariaLabel, className) {
    const button = parentEl.createEl("button", {
      cls: className,
      attr: { "aria-label": ariaLabel, title: ariaLabel }
    });
    setIcon(button, icon);
    return button;
  }

  async loadCurrentNoteContext() {
    const context = await this.plugin.captureCurrentContext(false);
    await this.prepareContext(context);
    new Notice(context.path ? this.plugin.t("contextLoaded", { path: context.path }) : this.plugin.t("noMarkdownOpen"));
  }

  insertMentionTrigger() {
    if (!this.inputEl) {
      return;
    }

    const value = this.inputEl.value || "";
    const caret = this.inputEl.selectionStart || value.length;
    const before = value.slice(0, caret);
    const after = value.slice(caret);
    const prefix = before && !/\s$/.test(before) ? " " : "";
    const insertion = `${prefix}@`;
    const nextCursor = before.length + insertion.length;
    this.inputEl.value = `${before}${insertion}${after}`;
    this.inputEl.focus();
    this.inputEl.setSelectionRange(nextCursor, nextCursor);
    this.autoResizeInput();
    this.updateMentionSuggestions();
  }

  startNewChat() {
    this.setActiveTabState({
      threadId: null,
      messages: [],
      context: null,
      contextSummary: "",
      title: this.plugin.t("untitledTab"),
      isStreaming: false,
      needsAttention: false
    });
    this.plugin.setLastResponse(null);
    this.render();
    new Notice(this.plugin.t("newChatReady"));
  }

  openActionsMenu(event) {
    const menu = new Menu();
    menu.addItem((item) =>
      item.setTitle(this.plugin.t("viewMemoryUsed")).setIcon("database").onClick(async () => {
        await this.plugin.showMemoryUsed();
      })
    );
    menu.addItem((item) =>
      item.setTitle(this.plugin.t("configureCodex")).setIcon("key").onClick(() => {
        new CodexSetupModal(this.app, this.plugin).open();
      })
    );
    menu.addItem((item) =>
      item.setTitle(this.plugin.t("check")).setIcon("refresh-cw").onClick(async () => {
        await this.plugin.autoCheckCodexSetup({ notify: true });
        this.renderHeader();
      })
    );
    menu.addItem((item) =>
      item.setTitle(this.plugin.t("consistencyDiagnostics")).setIcon("shield-alert").onClick(async () => {
        await this.plugin.openConsistencyDiagnostics();
      })
    );
    menu.addSeparator();
    menu.addItem((item) =>
      item.setTitle(this.plugin.t("openAssistant")).setIcon("settings").onClick(() => {
        this.plugin.openPluginSettings();
      })
    );
    menu.showAtMouseEvent(event);
  }

  createContextItem(parentEl, label, value, state = "") {
    const itemEl = parentEl.createDiv({ cls: `cortex-chat-context-item ${state}`.trim() });
    itemEl.createDiv({ cls: "cortex-chat-context-label", text: label });
    itemEl.createDiv({ cls: "cortex-chat-context-value", text: value });
  }

  getContextSummary() {
    const note = this.context?.title || this.plugin.lastMarkdownFile?.basename || this.plugin.t("noNote");
    const referenceCount = this.context?.references?.length || 0;
    const referenceLabel = referenceCount ? this.plugin.t("referenceCount", { count: referenceCount }) : this.plugin.t("noRefs");
    return `${note} · ${referenceLabel}`;
  }

  renderContext() {
    this.contextEl.empty();
    const summaryEl = this.contextEl.createDiv({ cls: "cortex-chat-context-summary" });
    summaryEl.setAttribute("role", "button");
    summaryEl.setAttribute("tabindex", "0");
    summaryEl.setAttribute("aria-expanded", String(this.contextExpanded));
    const toggleContext = () => {
      this.contextExpanded = !this.contextExpanded;
      this.renderContext();
    };
    summaryEl.addEventListener("click", toggleContext);
    summaryEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleContext();
      }
    });
    const summaryTextEl = summaryEl.createDiv({ cls: "cortex-chat-context-line" });
    const noteReady = Boolean(this.context?.path || this.plugin.lastMarkdownFile);
    const referenceReady = Boolean(this.context?.references?.length);
    const indicators = [
      ["file-text", noteReady, this.plugin.t("activeNote"), async () => this.loadCurrentNoteContext()],
      ["at-sign", referenceReady, "@", () => this.insertMentionTrigger()]
    ];
    for (const [icon, ready, label, handler] of indicators) {
      const indicatorEl = summaryTextEl.createEl("button", {
        cls: ready ? "cortex-chat-context-icon is-ready" : "cortex-chat-context-icon",
        attr: { "aria-label": label, title: label }
      });
      setIcon(indicatorEl, icon);
      indicatorEl.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await handler();
      });
    }
    summaryTextEl.createSpan({ cls: "cortex-chat-context-kicker", text: this.context?.path ? this.plugin.t("activeContext") : this.plugin.t("context") });
    summaryTextEl.createSpan({ cls: "cortex-chat-context-text", text: this.getContextSummary() });
    const toggleButton = this.createIconButton(
      summaryEl,
      this.contextExpanded ? "chevron-down" : "chevron-right",
      this.contextExpanded ? this.plugin.t("hideContextDetails") : this.plugin.t("viewContextDetails"),
      "cortex-chat-context-toggle"
    );
    toggleButton.setAttribute("aria-expanded", String(this.contextExpanded));
    toggleButton.createSpan({
      cls: "cortex-chat-context-toggle-label",
      text: this.contextExpanded ? this.plugin.t("hide") : this.plugin.t("details")
    });
    toggleButton.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleContext();
    });

    if (!this.contextExpanded) {
      return;
    }

    if (!this.context) {
      const lastNote = this.plugin.lastMarkdownFile?.path || this.plugin.t("noNote");
      this.contextEl.createDiv({ cls: "cortex-chat-context-title", text: this.plugin.t("contextPending") });
      this.contextEl.createDiv({
        cls: "cortex-chat-context-help",
        text: this.plugin.t("lastNoteHelp", { note: lastNote })
      });
      return;
    }

    const references = this.context.references || [];
    const mentions = references.filter((reference) => reference.source === "mention").length;
    const linked = references.filter((reference) => reference.source === "outgoing-link").length;
    const folders = references.filter((reference) => reference.source === "folder").length;
    const referenceSummary = references.length
      ? `${this.plugin.t("referenceCount", { count: references.length })} (${mentions} @, ${linked} links, ${folders} folders)`
      : this.plugin.t("noRefs");
    const outgoingSummary = this.context.outgoingLinks?.length
      ? `${this.context.outgoingLinks.length}: ${this.context.outgoingLinks.slice(0, 4).join(", ")}${
          this.context.outgoingLinks.length > 4 ? "..." : ""
        }`
      : this.plugin.t("noRefs");

    this.contextEl.createDiv({ cls: "cortex-chat-context-title", text: this.plugin.t("contextToSend") });
    const gridEl = this.contextEl.createDiv({ cls: "cortex-chat-context-grid" });
    this.createContextItem(gridEl, this.plugin.t("activeNote"), this.context.path || this.plugin.t("noNote"), this.context.path ? "is-ready" : "");
    this.createContextItem(gridEl, this.plugin.t("links"), outgoingSummary, this.context.outgoingLinks?.length ? "is-ready" : "");
    this.createContextItem(gridEl, this.plugin.t("references"), referenceSummary, references.length ? "is-ready" : "");

    if (references.length) {
      this.contextEl.createDiv({
        cls: "cortex-chat-context-help",
        text: references
          .slice(0, 5)
          .map((reference) => reference.path)
          .join(" · ")
      });
    }
  }

  renderMessages() {
    if (!this.messagesEl) {
      return;
    }

    this.messagesEl.empty();
    if (!this.messages.length) {
      this.messagesEl.createEl("div", {
        cls: "cortex-chat-empty-state",
        text: this.plugin.t("chatEmpty")
      });
      return;
    }

    for (const message of this.messages) {
      const isAssistant = message.role === "assistant";
      const messageEl = this.messagesEl.createDiv({
        cls: `cortex-chat-message ${isAssistant ? "is-assistant" : "is-user"}`
      });
      const headerEl = messageEl.createDiv({ cls: "cortex-chat-message-header" });
      const metaEl = headerEl.createDiv({ cls: "cortex-chat-message-meta" });
      metaEl.createDiv({
        cls: "cortex-chat-role",
        text: isAssistant ? "Codex" : this.plugin.t("you")
      });
      if (message.meta?.label) {
        metaEl.createDiv({ cls: "cortex-chat-message-chip", text: message.meta.label });
      }
      if (isAssistant && !message.meta?.loading && message.content) {
        const actionsEl = headerEl.createDiv({ cls: "cortex-chat-message-actions" });
        const copyButton = this.createIconButton(actionsEl, "copy", this.plugin.t("copyResponse"), "cortex-chat-message-action");
        copyButton.addEventListener("click", async () => {
          await navigator.clipboard.writeText(message.content);
          new Notice(this.plugin.t("responseCopied"));
        });
        const insertButton = this.createIconButton(actionsEl, "corner-down-left", this.plugin.t("insertResponse"), "cortex-chat-message-action");
        insertButton.addEventListener("click", async () => {
          await this.insertTextIntoActiveNote(message.content);
        });
        const useButton = this.createIconButton(actionsEl, "message-square-plus", this.plugin.t("useAsContext"), "cortex-chat-message-action");
        useButton.addEventListener("click", () => {
          this.appendToComposer(`Contexto de respuesta anterior:\n${message.content}`);
        });
      }
      const bodyEl = messageEl.createDiv({ cls: "cortex-chat-message-body" });
      if (message.meta?.loading) {
        bodyEl.createDiv({ cls: "cortex-chat-loading", text: message.meta.status || this.plugin.t("preparingResponse") });
        bodyEl.createDiv({ cls: "cortex-chat-loading-bar" });
      } else if (isAssistant) {
        void this.renderAssistantMessage(bodyEl, message.content);
      } else {
        bodyEl.setText(message.content);
      }
      if (message.meta?.detail) {
        const footerEl = messageEl.createDiv({ cls: "cortex-chat-message-detail" });
        footerEl.createSpan({ cls: "cortex-chat-message-detail-text", text: message.meta.detail });
      }
    }

    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }

  async renderAssistantMessage(containerEl, content) {
    containerEl.empty();
    try {
      await MarkdownRenderer.render(this.app, content, containerEl, this.context?.path || "", this.plugin);
    } catch {
      containerEl.setText(content);
    }
  }

  async insertTextIntoActiveNote(content) {
    const view = this.plugin.refreshLastMarkdownView();
    if (!view || !view.editor) {
      new Notice(this.plugin.t("openEditableNote"));
      return;
    }
    view.editor.replaceRange(`\n\n${content}\n`, view.editor.getCursor());
    new Notice(this.plugin.t("responseInserted"));
  }

  appendToComposer(content) {
    if (!this.inputEl) {
      return;
    }
    const current = this.inputEl.value.trim();
    this.inputEl.value = current ? `${current}\n\n${content}` : content;
    this.inputEl.focus();
    this.autoResizeInput();
  }

  autoResizeInput() {
    if (!this.inputEl) {
      return;
    }

    this.inputEl.style.height = "0px";
    const nextHeight = Math.min(this.inputEl.scrollHeight, Math.round(window.innerHeight * 0.24));
    this.inputEl.style.height = `${Math.max(nextHeight, 40)}px`;
  }

  handleMentionNavigation(event) {
    if (!this.mentionState.open) {
      return false;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      this.mentionState.selectedIndex =
        (this.mentionState.selectedIndex + 1) % this.mentionState.items.length;
      this.renderMentionSuggestions();
      return true;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      this.mentionState.selectedIndex =
        (this.mentionState.selectedIndex - 1 + this.mentionState.items.length) % this.mentionState.items.length;
      this.renderMentionSuggestions();
      return true;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const selected = this.mentionState.items[this.mentionState.selectedIndex];
      if (selected) {
        this.insertMention(selected);
      }
      return true;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      this.hideMentionSuggestions();
      return true;
    }

    return false;
  }

  getActiveMentionRange() {
    if (!this.inputEl) {
      return null;
    }

    const value = this.inputEl.value || "";
    const caret = this.inputEl.selectionStart || value.length;
    const beforeCaret = value.slice(0, caret);
    const match = beforeCaret.match(/(?:^|\s)@([^\s@,.;:!?()[\]{}]*)$/);
    if (!match) {
      return null;
    }

    const query = match[1] || "";
    return {
      query,
      start: caret - query.length - 1,
      end: caret
    };
  }

  updateMentionSuggestions() {
    const mention = this.getActiveMentionRange();
    if (!mention) {
      this.hideMentionSuggestions();
      return;
    }

    const candidates = this.plugin.getMentionCandidates(mention.query);
    if (!candidates.length) {
      this.hideMentionSuggestions();
      return;
    }

    this.mentionState = {
      open: true,
      query: mention.query,
      range: mention,
      items: candidates,
      selectedIndex: Math.min(this.mentionState.selectedIndex || 0, candidates.length - 1)
    };

    this.renderMentionSuggestions();
  }

  hideMentionSuggestions() {
    this.mentionState.open = false;
    this.mentionState.items = [];
    this.mentionState.range = null;
    if (this.suggestionsEl) {
      this.suggestionsEl.empty();
      this.suggestionsEl.hide();
    }
  }

  renderMentionSuggestions() {
    if (!this.suggestionsEl || !this.mentionState.open) {
      return;
    }

    this.suggestionsEl.empty();
    this.suggestionsEl.show();

    this.mentionState.items.forEach((file, index) => {
      const itemEl = this.suggestionsEl.createDiv({
        cls: `suggestion-item cortex-chat-suggestion-item${index === this.mentionState.selectedIndex ? " is-selected" : ""}`
      });

      itemEl.createDiv({
        cls: "suggestion-title",
        text: file.basename
      });
      itemEl.createDiv({
        cls: "suggestion-note cortex-chat-suggestion-note",
        text: file.path
      });

      itemEl.addEventListener("mouseenter", () => {
        this.mentionState.selectedIndex = index;
        this.renderMentionSuggestions();
      });

      itemEl.addEventListener("mousedown", (event) => {
        event.preventDefault();
        this.insertMention(file);
      });
    });
  }

  insertMention(file) {
    if (!this.inputEl || !this.mentionState.range) {
      return;
    }

    const value = this.inputEl.value || "";
    const before = value.slice(0, this.mentionState.range.start);
    const after = value.slice(this.mentionState.range.end);
    const insertion = `@${file.basename} `;
    const nextValue = `${before}${insertion}${after}`;
    const nextCursor = before.length + insertion.length;

    this.inputEl.value = nextValue;
    this.inputEl.focus();
    this.inputEl.setSelectionRange(nextCursor, nextCursor);
    this.autoResizeInput();
    this.hideMentionSuggestions();
  }

  setSending(value) {
    this.isSending = value;
    if (this.sendButtonEl) {
      this.sendButtonEl.disabled = value;
      this.sendButtonEl.classList.toggle("is-sending", value);
      this.sendButtonEl.empty();
      setIcon(this.sendButtonEl, value ? "loader-2" : "send-horizontal");
    }
    if (this.inputEl) {
      this.inputEl.disabled = value;
    }
    if (this.quickActionsEl) {
      this.quickActionsEl.classList.toggle("is-disabled", value);
    }
  }

  async waitForMinimumDuration(startedAt, minimumMs) {
    const remaining = Math.max(0, minimumMs - (Date.now() - startedAt));
    if (remaining > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, remaining));
    }
  }

  responseMetaFor(response, elapsedMs, runOptions) {
    const rawProvider = response.raw?.provider || "";
    const label = response.localFallback
      ? this.plugin.t("codexLocalProvider")
      : rawProvider === "heuristic-fallback"
        ? this.plugin.t("serverFallbackProvider")
        : rawProvider === "codex-cli"
        ? this.plugin.t("codexOauthProvider")
        : this.plugin.t("serverProvider");
    const detailParts = [
      `${runOptions.effort === "fast" ? this.plugin.t("fast") : this.plugin.t("thinking")}`,
      `${workModeLabel(runOptions.interactionMode, this.plugin.t)}`,
      `${Math.max(1, Math.round(elapsedMs / 100) / 10)}s`
    ];
    if (response.sessionPath) {
      detailParts.push(response.sessionPath);
    }
    return {
      label,
      detail: detailParts.join(" · ")
    };
  }

  async sendMessage() {
    const message = this.inputEl?.value?.trim();
    if (!message) {
      new Notice(this.plugin.t("writeMessageFirst"));
      return;
    }
    if (this.isSending) {
      return;
    }

    this.appendMessage("user", message);
    const requestTabId = this.activeTabId;
    const activeTab = this.getActiveTab();
    if (!activeTab.threadId && activeTab.messages.length <= 1) {
      activeTab.title = titleFromMessage(message, this.plugin.t("untitledTab"));
    }
    activeTab.isStreaming = true;
    activeTab.updatedAt = new Date().toISOString();
    void this.persistTabs();
    this.renderTabBar();
    this.inputEl.value = "";
    this.autoResizeInput();
    this.hideMentionSuggestions();
    this.setSending(true);

    const startedAt = Date.now();
    const activeWorkMode = this.plugin.settings.defaultInteractionMode || DEFAULT_SETTINGS.defaultInteractionMode;
    const pendingId = this.appendMessage("assistant", "", {
      loading: true,
      label: workModeDetail(activeWorkMode, this.plugin.t),
      status: this.plugin.t("sendingToAgent")
    });
    this.lastPendingStatus = this.plugin.t("sendingToAgent");
    if (!this.context?.path && !this.context?.references?.length) {
      this.setPendingStatus(pendingId, this.plugin.t("preparingContext"), {}, requestTabId);
      this.context = await this.plugin.captureCurrentContext(false);
      this.setTabState(requestTabId, {
        context: this.context,
        contextSummary: this.describeContext(this.context)
      });
      if (requestTabId === this.activeTabId) {
        this.renderHeader();
        this.renderContext();
      }
    }
    try {
      const requestTab = this.getTab(requestTabId);
      const requestContext = requestTab?.context || this.context || {};
      const runOptions = this.plugin.getRunOptions(requestContext, message);
      const folderStatus = this.getFolderReviewStatus(message, requestContext);
      if (folderStatus) {
        this.setPendingStatus(pendingId, folderStatus, {}, requestTabId);
      }
      this.setPendingStatus(pendingId, this.plugin.t("codexThinking"), {}, requestTabId);
      const response = await this.plugin.sendMessageToAgent(requestTab?.threadId || null, message, requestContext, runOptions);
      const isFallback = response.localFallback || response.raw?.provider === "heuristic-fallback";
      this.setPendingStatus(pendingId, this.plugin.t("codexPreparingResponse"), {
        detail:
          runOptions.interactionMode === "execute"
            ? this.plugin.t("unrestrictedActive")
            : isFallback
              ? this.plugin.t("localFallbackProvider")
              : ""
      }, requestTabId);
      await this.waitForMinimumDuration(startedAt, isFallback ? this.plugin.settings.localFallbackDelayMs : 350);
      const responseContext = response.context || requestContext;
      this.setTabState(requestTabId, {
        threadId: response.threadId,
        context: responseContext,
        contextSummary: this.describeContext(responseContext),
        isStreaming: false,
        needsAttention: false
      });
      if (requestTabId === this.activeTabId) {
        this.renderHeader();
        this.renderContext();
      }
      this.updateMessageInTab(requestTabId, pendingId, response.answer, {
        loading: false,
        ...this.responseMetaFor(response, Date.now() - startedAt, runOptions)
      });
      this.plugin.setLastResponse(response);

      if (response.unresolvedReferences?.length) {
        new Notice(this.plugin.t("unresolvedReferences", { refs: response.unresolvedReferences.join(", ") }));
      }

      if (response.security?.redacted) {
        new Notice(
          this.plugin.t("sensitiveContextRedacted", { types: response.security.detectedTypes.join(", ") })
        );
      }
    } catch (error) {
      this.setTabState(requestTabId, {
        isStreaming: false,
        needsAttention: false
      });
      this.updateMessageInTab(requestTabId, pendingId, `Error: ${error.message}`, {
        loading: false,
        label: this.plugin.t("error"),
        detail: `Fase: ${this.lastPendingStatus || "desconocida"} · La respuesta no se ha persistido como salida válida.`
      });
      new Notice(this.plugin.t("requestFailed", { error: error.message }));
    } finally {
      this.setTabState(requestTabId, {
        isStreaming: false
      });
      this.setSending(false);
    }
  }
}

class ConsistencyDiagnosticsModal extends Modal {
  constructor(app, report, t = createTranslator("en")) {
    super(app);
    this.report = report;
    this.t = t;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("cortex-chat-setup-modal");
    contentEl.createEl("h3", { text: this.t("consistencyDiagnostics") });
    contentEl.createEl("p", {
      text: this.report.summary
    });

    if (this.report.items.length) {
      const list = contentEl.createEl("ul");
      for (const item of this.report.items) {
        list.createEl("li", { text: `${item.severity.toUpperCase()}: ${item.message}` });
      }
    } else {
      contentEl.createEl("p", { text: this.t("noConsistencyIssues") });
    }
  }
}

class CortexChatSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    const t = this.plugin.t;
    containerEl.empty();
    containerEl.createEl("h3", { text: t("connectionSecurity") });

    new Setting(containerEl)
      .setName(t("backendUrl"))
      .setDesc(t("backendUrlDesc"))
      .addText((text) =>
        text
          .setPlaceholder("http://127.0.0.1:8787")
          .setValue(this.plugin.settings.backendUrl)
          .onChange(async (value) => {
            this.plugin.settings.backendUrl = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t("deviceState"))
      .setDesc(
        t("deviceStateDesc", {
          state: this.plugin.settings.deviceRegisteredOk ? t("registered") : t("pending"),
          id: this.plugin.settings.deviceId || t("generatedAutomatically")
        })
      )
      .addButton((button) =>
        button.setButtonText(t("repairLocalConfig")).onClick(async () => {
          await this.plugin.repairLocalProvisioning();
          this.display();
        })
      )
      .addButton((button) =>
        button.setButtonText(t("registerNow")).onClick(async () => {
          await this.plugin.registerLocalDeviceIfPossible({ notify: true });
          this.display();
        })
      );

    new Setting(containerEl)
      .setName(t("deviceId"))
      .setDesc(t("deviceIdDesc"))
      .addText((text) => {
        text.setValue(this.plugin.settings.deviceId || `(${t("pending")})`);
        text.inputEl.disabled = true;
      });

    new Setting(containerEl)
      .setName(t("allowRemoteBackend"))
      .setDesc(t("allowRemoteBackendDesc"))
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.allowRemoteBackend).onChange(async (value) => {
          this.plugin.settings.allowRemoteBackend = value;
          await this.plugin.saveSettings();
        })
      );

    containerEl.createEl("h3", { text: t("response") });

    new Setting(containerEl)
      .setName(t("defaultWorkMode"))
      .setDesc(t("defaultWorkModeDesc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("plan", t("planner"))
          .addOption("execute", t("execute"))
          .setValue(this.plugin.settings.defaultInteractionMode || DEFAULT_SETTINGS.defaultInteractionMode)
          .onChange(async (value) => {
            this.plugin.settings.defaultInteractionMode = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t("showDiagnostics"))
      .setDesc(t("showDiagnosticsDesc"))
      .addToggle((toggle) =>
        toggle.setValue(Boolean(this.plugin.settings.showDiagnostics)).onChange(async (value) => {
          this.plugin.settings.showDiagnostics = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName(t("language"))
      .setDesc(t("languageDesc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("auto", t("languageAuto"))
          .addOption("en", t("languageEnglish"))
          .addOption("es", t("languageSpanish"))
          .setValue(this.plugin.settings.languageMode || DEFAULT_SETTINGS.languageMode)
          .onChange(async (value) => {
            this.plugin.settings.languageMode = normalizeLanguageMode(value);
            if (!this.plugin.settings.systemPromptSections) {
              this.plugin.settings.systemPromptSections = getDefaultSystemPromptSections(value);
            }
            await this.plugin.saveSettings();
            this.display();
          })
      );

    new Setting(containerEl)
      .setName(t("folderRoots"))
      .setDesc(t("folderRootsDesc"))
      .addText((text) =>
        text.setValue(formatFolderRoots(this.plugin.settings.folderReferenceRoots)).onChange(async (value) => {
          this.plugin.settings.folderReferenceRoots = parseFolderRootsInput(value);
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName(t("maxFolderReferences"))
      .setDesc(t("maxFolderReferencesDesc"))
      .addText((text) =>
        text.setValue(String(this.plugin.settings.maxFolderReferences || DEFAULT_SETTINGS.maxFolderReferences)).onChange(async (value) => {
          const numeric = Number(value);
          this.plugin.settings.maxFolderReferences =
            Number.isFinite(numeric) && numeric >= 3 && numeric <= 80 ? numeric : DEFAULT_SETTINGS.maxFolderReferences;
          await this.plugin.saveSettings();
        })
      );

    containerEl.createEl("h3", { text: t("systemPrompt") });
    containerEl.createEl("p", {
      text: t("systemPromptDesc")
    });

    const promptFieldMeta = [
      ["role", t("promptRole"), t("promptRoleDesc")],
      ["context", t("promptContext"), t("promptContextDesc")],
      ["behavior", t("promptBehavior"), t("promptBehaviorDesc")],
      ["safety", t("promptSafety"), t("promptSafetyDesc")],
      ["output", t("promptOutput"), t("promptOutputDesc")],
      ["memory", t("promptMemory"), t("promptMemoryDesc")]
    ];

    for (const [key, name, description] of promptFieldMeta) {
      new Setting(containerEl)
        .setName(name)
        .setDesc(description)
        .addTextArea((text) => {
          text.setValue(this.plugin.settings.systemPromptSections?.[key] || "");
          text.inputEl.rows = 4;
          text.inputEl.addClass("cortex-chat-settings-textarea");
          text.onChange(async (value) => {
            this.plugin.settings.systemPromptSections = {
              ...normalizeSystemPromptSections(this.plugin.settings.systemPromptSections, this.plugin.settings.languageMode),
              [key]: value
            };
            await this.plugin.saveSettings();
          });
        });
    }

    containerEl.createEl("h3", { text: t("pluginScale") });

    new Setting(containerEl)
      .setName(t("visualScale"))
      .setDesc(t("visualScaleDesc"))
      .addText((text) => {
        text.setPlaceholder("1.0").setValue(this.plugin.getUiScale().toFixed(2));
        text.onChange(async (value) => {
          const numeric = Number(String(value).replace(",", "."));
          await this.plugin.setUiScale(Number.isFinite(numeric) ? numeric : DEFAULT_SETTINGS.uiScale);
          this.display();
        });
      })
      .addButton((button) =>
        button.setButtonText(t("reset100")).onClick(async () => {
          await this.plugin.resetUiScale();
          this.display();
        })
      );

    containerEl.createEl("h3", { text: t("advancedLocal") });

    new Setting(containerEl)
      .setName(t("localBootstrapToken"))
      .setDesc(t("localBootstrapTokenDesc"))
      .addText((text) => {
        text.setValue(this.plugin.settings.localBootstrapToken ? t("registered") : t("pending"));
        text.inputEl.disabled = true;
      });

    new Setting(containerEl)
      .setName(t("localBackendBootstrapScript"))
      .setDesc(t("localBackendBootstrapScriptDesc"))
      .addText((text) =>
        text.setValue(this.plugin.settings.localBackendBootstrapScript || "").onChange(async (value) => {
          this.plugin.settings.localBackendBootstrapScript = value.trim();
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName(t("allowLocalBootstrapScript"))
      .setDesc(t("allowLocalBootstrapScriptDesc"))
      .addToggle((toggle) =>
        toggle.setValue(Boolean(this.plugin.settings.localBackendBootstrapAllowed)).onChange(async (value) => {
          this.plugin.settings.localBackendBootstrapAllowed = Boolean(value);
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName(t("trustCodexVault"))
      .setDesc(t("trustCodexVaultDesc"))
      .addToggle((toggle) =>
        toggle.setValue(Boolean(this.plugin.settings.allowCodexVaultTrust)).onChange(async (value) => {
          this.plugin.settings.allowCodexVaultTrust = Boolean(value);
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName(t("localCodexCommand"))
      .setDesc(t("localCodexCommandDesc"))
      .addText((text) =>
        text.setValue(this.plugin.settings.localCodexCommand || "").onChange(async (value) => {
          this.plugin.settings.localCodexCommand = value.trim();
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Codex OAuth")
      .setDesc(t("status", { status: this.plugin.settings.codexStatus || t("pending") }) + (this.plugin.settings.codexVersion ? ` · ${this.plugin.settings.codexVersion}` : ""))
      .addButton((button) =>
        button.setButtonText(t("openAssistant")).onClick(() => {
          new CodexSetupModal(this.app, this.plugin).open();
        })
      )
      .addButton((button) =>
        button.setButtonText(t("check")).onClick(async () => {
          await this.plugin.checkCodexStatus();
          this.display();
        })
      );

    if (SecretComponent) {
      new Setting(containerEl)
        .setName(t("tokenSecret"))
        .setDesc(t("tokenSecretDesc"))
        .addComponent((el) =>
          new SecretComponent(this.app, el)
            .setValue(this.plugin.settings.deviceTokenSecretName)
            .onChange(async (value) => {
              this.plugin.settings.deviceTokenSecretName = value;
              await this.plugin.saveSettings();
            })
        );
    } else {
      new Setting(containerEl)
        .setName(t("tokenSecret"))
        .setDesc(t("tokenSecretDesc"))
        .addText((text) =>
          text.setValue(this.plugin.settings.deviceTokenSecretName).onChange(async (value) => {
            this.plugin.settings.deviceTokenSecretName = value.trim();
            await this.plugin.saveSettings();
          })
        );
    }

    new Setting(containerEl)
      .setName(t("maxContextChars"))
      .setDesc(t("maxContextCharsDesc"))
      .addText((text) =>
        text.setValue(String(this.plugin.settings.maxContextChars)).onChange(async (value) => {
          const numeric = Number(value);
          this.plugin.settings.maxContextChars =
            Number.isFinite(numeric) && numeric > 200 ? numeric : DEFAULT_SETTINGS.maxContextChars;
          await this.plugin.saveSettings();
        })
      );
  }
}

module.exports = class CortexChatPlugin extends Plugin {
  async onload() {
    await this.loadSettings();
    this.t = createTranslator(() => this.getLanguage());
    this.lastResponse = null;
    this.lastMarkdownView = null;
    this.lastMarkdownFile = null;
    this.normalizePortableSettings();
    await this.ensureLocalIdentity();

    this.registerView(VIEW_TYPE, (leaf) => new CortexChatView(leaf, this));
    this.addSettingTab(new CortexChatSettingTab(this.app, this));

    this.addRibbonIcon("bot", this.t("openChat"), async () => {
      await this.activateView();
    });

    this.addCommand({
      id: "open-cortex-chat",
      name: this.t("openChat"),
      callback: async () => {
        await this.activateView();
      }
    });

    this.addCommand({
      id: "ask-about-current-note",
      name: this.t("askCurrentNote"),
      callback: async () => {
        const context = await this.captureCurrentContext(false);
        const view = await this.activateView();
        await view.prepareContext(context);
      }
    });

    this.addCommand({
      id: "insert-last-response",
      name: this.t("insertLastResponse"),
      editorCallback: async () => {
        await this.insertLastResponseIntoNote();
      }
    });

    this.addCommand({
      id: "view-memory-used",
      name: this.t("viewMemoryUsed"),
      callback: async () => {
        await this.showMemoryUsed();
      }
    });

    this.addCommand({
      id: "open-codex-setup",
      name: this.t("configureCodex"),
      callback: () => {
        new CodexSetupModal(this.app, this).open();
      }
    });

    this.addCommand({
      id: "run-consistency-diagnostics",
      name: this.t("consistencyDiagnostics"),
      callback: async () => {
        await this.openConsistencyDiagnostics();
      }
    });

    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => {
        const view = this.getMarkdownViewFromLeaf(leaf);
        if (view) {
          this.rememberMarkdownView(view);
        }
      })
    );

    this.registerEvent(
      this.app.workspace.on("file-open", (file) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (view?.file) {
          this.rememberMarkdownView(view);
        } else if (file?.extension === "md") {
          this.lastMarkdownFile = file;
        }
      })
    );

    this.app.workspace.onLayoutReady(async () => {
      this.refreshLastMarkdownView();
      if (this.isMobileRuntime()) {
        await this.checkRemoteBackendForMobile({ notify: false });
        if (!this.canUseRemoteBackend()) {
          new CodexSetupModal(this.app, this).open();
        }
        return;
      }
      await this.registerLocalDeviceIfPossible({ notify: false });
      const status = await this.autoCheckCodexSetup({ notify: false });
      if (!status.ready) {
        new CodexSetupModal(this.app, this).open();
      }
    });
  }

  async onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
  }

  getLanguage() {
    return resolveLanguage(this.settings?.languageMode || DEFAULT_SETTINGS.languageMode);
  }

  async loadSettings() {
    const currentShared = Object.assign({}, await this.loadData());
    const shared = Object.assign({}, currentShared);
    const local = await this.loadLocalRuntimeState(shared);
    this.settings = normalizeSettings(Object.assign({}, shared, local), DEFAULT_SETTINGS);
    this.settings.languageMode = normalizeLanguageMode(this.settings.languageMode);
    this.settings.systemPromptSections = normalizeSystemPromptSections(
      this.settings.systemPromptSections,
      this.settings.languageMode
    );
    this.settings.uiScale = clampUiScale(this.settings.uiScale);
    this.settings.folderReferenceRoots = normalizeFolderRoots(this.settings.folderReferenceRoots);
    this.normalizePortableSettings();
  }

  async saveSettings() {
    this.settings.languageMode = normalizeLanguageMode(this.settings.languageMode);
    this.settings.systemPromptSections = normalizeSystemPromptSections(
      this.settings.systemPromptSections,
      this.settings.languageMode
    );
    this.settings.uiScale = clampUiScale(this.settings.uiScale);
    this.settings.folderReferenceRoots = normalizeFolderRoots(this.settings.folderReferenceRoots);
    this.normalizePortableSettings();
    await this.saveData(this.pickSettings(SHARED_SETTING_KEYS));
    await this.saveLocalRuntimeState(this.pickSettings(LOCAL_SETTING_KEYS));
  }

  pickSettings(keys) {
    const picked = {};
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(this.settings, key)) {
        picked[key] = this.settings[key];
      }
    }
    return picked;
  }

  getLocalStateDirectory(pluginId = PLUGIN_ID) {
    if (!os?.homedir || !path) {
      return "";
    }
    return path.join(os.homedir(), `.${pluginId}`);
  }

  getLocalStatePath(pluginId = PLUGIN_ID) {
    const directory = this.getLocalStateDirectory(pluginId);
    if (!directory) {
      return "";
    }
    const vaultRoot = this.getVaultRoot() || "unknown-vault";
    const suffix = sha1(`${pluginId}::${vaultRoot}`);
    return path.join(directory, `${suffix}.json`);
  }

  getLocalTempDirectory() {
    const directory = this.getLocalStateDirectory();
    if (directory) {
      return path.join(directory, "tmp");
    }
    return os?.tmpdir ? path.join(os.tmpdir(), "cortex-chat") : "";
  }

  async loadLocalRuntimeState(sharedSettings = {}) {
    const localStatePath = this.getLocalStatePath();
    const localState = {};
    let migrated = false;

    for (const key of LOCAL_SETTING_KEYS) {
      if (Object.prototype.hasOwnProperty.call(sharedSettings, key)) {
        localState[key] = sharedSettings[key];
        delete sharedSettings[key];
        migrated = true;
      }
    }

    if (!localStatePath || !fs) {
      return localState;
    }

    const mergeLocalStateFile = async (statePath) => {
      const raw = await fs.readFile(statePath, "utf8");
      const parsed = JSON.parse(raw);
      const payload = parsed?.state && typeof parsed.state === "object" ? parsed.state : parsed;
      for (const key of LOCAL_SETTING_KEYS) {
        if (Object.prototype.hasOwnProperty.call(payload, key)) {
          localState[key] = payload[key];
        }
      }
    };

    try {
      await mergeLocalStateFile(localStatePath);
    } catch {
      // No local state yet.
    }

    return localState;
  }

  async saveLocalRuntimeState(localState) {
    const localStatePath = this.getLocalStatePath();
    if (!localStatePath || !fs) {
      return;
    }

    await fs.mkdir(path.dirname(localStatePath), { recursive: true });
    await fs.writeFile(
      localStatePath,
      JSON.stringify(
        {
          version: LOCAL_STATE_VERSION,
          plugin: this.manifest?.id || PLUGIN_ID,
          vault: this.getVaultRoot(),
          updated_at: new Date().toISOString(),
          state: localState
        },
        null,
        2
      ),
      "utf8"
    );
  }

  isMobileRuntime() {
    return Boolean(Platform?.isMobile);
  }

  hasNodeRuntime() {
    return Boolean(fs && path && os && execFileAsync);
  }

  canUseLocalCodex() {
    return !this.isMobileRuntime() && this.hasNodeRuntime();
  }

  canUseRemoteBackend() {
    try {
      const parsed = new URL(this.settings.backendUrl || "");
      return this.settings.allowRemoteBackend && parsed.protocol === "https:" && !this.isLocalBackendUrl(this.settings.backendUrl);
    } catch {
      return false;
    }
  }

  getMobileBackendStatus() {
    if (!this.isMobileRuntime()) {
      return this.settings.codexStatus || "No comprobado";
    }
    return this.canUseRemoteBackend()
      ? this.t("remoteBackendReady")
      : this.t("remoteHttpsRequiredMobile");
  }

  async checkRemoteBackendForMobile(options = {}) {
    if (!this.isMobileRuntime()) {
      return this.autoCheckCodexSetup(options);
    }
    const notify = options.notify !== false;
    try {
      if (!this.canUseRemoteBackend()) {
        throw new Error(this.t("remoteHttpsRequiredMobile"));
      }
      const health = await requestUrl({
        url: `${this.settings.backendUrl.replace(/\/$/, "")}/health`,
        method: "GET"
      });
      const ok = health.status < 400;
      this.settings.codexSetupCompleted = ok;
      this.settings.codexStatus = ok ? this.t("remoteBackendReady") : `HTTP ${health.status}`;
      this.settings.codexLastCheck = new Date().toISOString();
      await this.saveSettings();
      if (notify) {
        new Notice(ok ? this.t("remoteBackendReady") : this.t("remoteBackendNotReady"));
      }
      return ok;
    } catch (error) {
      this.settings.codexSetupCompleted = false;
      this.settings.codexStatus = this.t("mobileUnavailable", { error: error.message });
      this.settings.codexLastCheck = new Date().toISOString();
      await this.saveSettings();
      if (notify) {
        new Notice(error.message);
      }
      return false;
    }
  }

  openPluginSettings() {
    if (this.app.setting?.open && this.app.setting?.openTabById) {
      this.app.setting.open();
      this.app.setting.openTabById(this.manifest.id);
    } else {
      new Notice(this.t("openSettingsSelectPlugin"));
    }
  }

  async openConsistencyDiagnostics() {
    const report = await this.collectConsistencyDiagnostics();
    new ConsistencyDiagnosticsModal(this.app, report, this.t).open();
  }

  async collectConsistencyDiagnostics() {
    const items = [];
    const shared = Object.assign({}, await this.loadData());
    for (const key of LOCAL_SETTING_KEYS) {
      if (Object.prototype.hasOwnProperty.call(shared, key)) {
        items.push({
          severity: "warn",
          message: this.t("dataJsonHasLocalKey", {
            path: ".obsidian/plugins/cortex-chat/data.json",
            key
          })
        });
      }
    }

    const vaultRoot = this.getVaultRoot();
    if (!vaultRoot || !fs || !path) {
      return {
        summary: items.length ? this.t("issuesDetected", { count: items.length }) : this.t("diagnosticsUnavailable"),
        items
      };
    }

    const duplicateCount = await this.countDuplicateSessions(vaultRoot);
    if (duplicateCount > 0) {
      items.push({
        severity: "warn",
        message: this.t("duplicateSessionsDetected", { count: duplicateCount })
      });
    }

    const memoryIssues = await this.collectMemoryIssues(vaultRoot);
    items.push(...memoryIssues);

    const indexIssues = await this.collectIndexIssues(vaultRoot);
    items.push(...indexIssues);

    const outboxIssues = await this.collectOutboxIssues(vaultRoot);
    items.push(...outboxIssues);

    if (this.localStatePortabilityReset) {
      items.push({
        severity: "info",
        message: this.t("localBackendReset")
      });
    }

    return {
      summary: items.length
        ? this.t("issuesDetected", { count: items.length })
        : this.t("noConsistencyIssues"),
      items
    };
  }

  async countDuplicateSessions(vaultRoot) {
    const sessionsRoot = agentPaths(vaultRoot).sessionsRoot;
    const files = await this.walkMarkdownFiles(sessionsRoot);
    const seen = new Set();
    let duplicates = 0;

    for (const filePath of files) {
      const markdown = await fs.readFile(filePath, "utf8");
      const parsed = parseFrontmatter(markdown);
      const fingerprint = parsed.data.content_fingerprint || sha1(normalizeForFingerprint(parsed.body));
      const sessionId = parsed.data.session_id || "";
      const key = sessionId || fingerprint;
      if (!key) {
        continue;
      }
      if (seen.has(key)) {
        duplicates += 1;
        continue;
      }
      seen.add(key);
    }

    return duplicates;
  }

  async collectMemoryIssues(vaultRoot) {
    const issues = [];
    const memoryRoot = agentPaths(vaultRoot).memoryRoot;
    for (const category of MEMORY_CATEGORIES) {
      const filePath = path.join(memoryRoot, `${category}.md`);
      let markdown = "";
      try {
        markdown = await fs.readFile(filePath, "utf8");
      } catch {
        continue;
      }
      const parsed = parseFrontmatter(markdown);
      const bullets = parseBulletLines(parsed.body);
      const sanitization = sanitizeMemoryBullets(category, bullets);
      if (!parsed.data.schema_version) {
        issues.push({
          severity: "info",
          message: this.t("memoryFileMissingSchema", { category })
        });
      }
      if (sanitization.issues.length) {
        issues.push({
          severity: "warn",
          message: this.t("memoryFileNonCanonical", { category, count: sanitization.issues.length })
        });
      }
    }
    return issues;
  }

  async collectIndexIssues(vaultRoot) {
    const issues = [];
    const indexRoot = agentPaths(vaultRoot).indexRoot;
    try {
      const entries = await fs.readdir(indexRoot, { withFileTypes: true });
      if (!entries.length) {
        issues.push({
          severity: "info",
          message: this.t("indexEmpty")
        });
      }
    } catch {
      issues.push({
        severity: "warn",
        message: this.t("indexUnreadable")
      });
    }
    return issues;
  }

  async collectOutboxIssues(vaultRoot) {
    const issues = [];
    const outboxRoot = agentPaths(vaultRoot).outboxRoot;
    let staleCount = 0;
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const files = await this.walkFiles(outboxRoot);
    for (const filePath of files) {
      try {
        const stat = await fs.stat(filePath);
        if (stat.mtimeMs < cutoff) {
          staleCount += 1;
        }
      } catch {
        // Ignore unreadable files.
      }
    }
    if (staleCount > 0) {
      issues.push({
        severity: "info",
        message: this.t("outboxStale", { count: staleCount })
      });
    }
    return issues;
  }

  normalizePortableSettings() {
    this.localStatePortabilityReset = false;
    this.normalizeCodexCommand();
    this.normalizeLocalBackendBootstrapScript();
  }

  normalizeCodexCommand() {
    const current = String(this.settings.localCodexCommand || "").toLowerCase();
    const foreignWindowsUserPath = isForeignWindowsUserPath(current, os?.homedir?.() || "");
    if (current.includes("\\windowsapps\\") || current.endsWith("\\codex.exe") || foreignWindowsUserPath) {
      this.settings.localCodexCommand = "codex";
      this.localStatePortabilityReset = true;
    }
  }

  normalizeLocalBackendBootstrapScript() {
    if (isForeignWindowsUserPath(this.settings.localBackendBootstrapScript, os?.homedir?.() || "")) {
      this.settings.localBackendBootstrapScript = "";
      this.localStatePortabilityReset = true;
    }
  }

  setLastResponse(response) {
    this.lastResponse = response;
  }

  getMarkdownViewFromLeaf(leaf) {
    const view = leaf?.view;
    return view instanceof MarkdownView && view.file ? view : null;
  }

  rememberMarkdownView(view) {
    if (!(view instanceof MarkdownView) || !view.file) {
      return;
    }
    this.lastMarkdownView = view;
    this.lastMarkdownFile = view.file;
  }

  refreshLastMarkdownView() {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView?.file) {
      this.rememberMarkdownView(activeView);
      return activeView;
    }

    if (this.lastMarkdownView?.file) {
      return this.lastMarkdownView;
    }

    const leaf = this.app.workspace
      .getLeavesOfType("markdown")
      .find((candidate) => candidate.view instanceof MarkdownView && candidate.view.file);
    if (leaf?.view) {
      this.rememberMarkdownView(leaf.view);
      return leaf.view;
    }

    return null;
  }

  getRunOptions(context = {}, message = "") {
    const interactionMode = this.settings.defaultInteractionMode || DEFAULT_SETTINGS.defaultInteractionMode;
    return {
      effort: classifyEffort(message, context, interactionMode),
      interactionMode,
      backupPolicy: interactionMode === "execute" ? "backup-per-file" : "none"
    };
  }

  getConfiguredSystemPrompt(runOptions = {}, backupRoot = "") {
    const basePrompt = composeSystemPrompt(this.settings.systemPromptSections);
    const backupInstruction = backupRoot
      ? this.t("workModeExecuteBackupPath", { backupRoot })
      : this.t("workModeExecuteBackupGeneric");
    const modeLines =
      runOptions.interactionMode === "execute"
        ? ["[work-mode]", this.t("workModeExecutePrompt", { backupInstruction })]
        : ["[work-mode]", this.t("workModePlannerPrompt")];
    return [basePrompt, modeLines.join("\n")].filter(Boolean).join("\n\n").trim();
  }

  getUiScale() {
    return clampUiScale(this.settings.uiScale);
  }

  getOpenAgentViews() {
    return this.app.workspace
      .getLeavesOfType(VIEW_TYPE)
      .map((leaf) => leaf.view)
      .filter((view) => view instanceof CortexChatView);
  }

  refreshAgentViewScale() {
    for (const view of this.getOpenAgentViews()) {
      view.applyUiScale?.();
    }
  }

  async setUiScale(value) {
    this.settings.uiScale = clampUiScale(value);
    await this.saveSettings();
    this.refreshAgentViewScale();
  }

  async adjustUiScale(delta) {
    await this.setUiScale(this.getUiScale() + Number(delta || 0));
  }

  async resetUiScale() {
    await this.setUiScale(DEFAULT_SETTINGS.uiScale);
  }

  async copyLastResponse() {
    if (!this.lastResponse?.answer) {
      new Notice(this.t("noLastResponseCopy"));
      return;
    }
    await navigator.clipboard.writeText(this.lastResponse.answer);
    new Notice(this.t("responseCopied"));
  }

  async runPowerShell(command, timeout = 120000) {
    if (!this.canUseLocalCodex()) {
      throw new Error(this.t("localOnlyDesktop"));
    }
    const { stdout, stderr } = await execFileAsync(
      "powershell.exe",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command],
      {
        cwd: this.getVaultRoot() || undefined,
        windowsHide: true,
        timeout,
        maxBuffer: 1024 * 1024 * 10
      }
    );
    return `${stdout || ""}${stderr ? `\n${stderr}` : ""}`.trim();
  }

  async runPowerShellScript(script, timeout = 120000) {
    if (!this.canUseLocalCodex()) {
      throw new Error("Codex CLI local solo está disponible en escritorio.");
    }
    const vaultRoot = this.getVaultRoot();
    const scriptRoot = this.getLocalTempDirectory() || (vaultRoot ? agentPaths(vaultRoot).outboxRoot : os.tmpdir());
    await fs.mkdir(scriptRoot, { recursive: true });
    const scriptPath = path.join(scriptRoot, `${makeId("codex_script")}.ps1`);
    await fs.writeFile(scriptPath, `\uFEFF${script}`, "utf8");
    try {
      const { stdout, stderr } = await execFileAsync(
        "powershell.exe",
        ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", scriptPath],
        {
          cwd: vaultRoot || undefined,
          windowsHide: true,
          timeout,
          maxBuffer: 1024 * 1024 * 10
        }
      );
      return `${stdout || ""}${stderr ? `\n${stderr}` : ""}`.trim();
    } finally {
      try {
        await fs.unlink(scriptPath);
      } catch {
        // Best effort cleanup.
      }
    }
  }

  async autoCheckCodexSetup(options = {}) {
    if (this.isMobileRuntime()) {
      const ready = await this.checkRemoteBackendForMobile(options);
      return { ready, installed: false, login: ready, execution: ready };
    }
    const notify = Boolean(options.notify);
    await this.registerLocalDeviceIfPossible({ notify: false });
    const install = await this.checkCodexStatus({ notify: false });
    if (!install) {
      if (notify) {
        new Notice(this.t("codexNotReady"));
      }
      return { ready: false, installed: false, login: false, execution: false };
    }

    const login = await this.checkCodexLoginStatus({ notify: false });
    if (!login) {
      this.settings.codexSetupCompleted = false;
      await this.saveSettings();
      if (notify) {
        new Notice(this.t("codexInstalledNoOauth"));
      }
      return { ready: false, installed: true, login: false, execution: false };
    }

    const execution = await this.testCodexExecution({ notify: false });
    const ready = Boolean(execution);
    this.settings.codexSetupCompleted = ready;
    if (ready) {
      this.settings.codexStatus = this.t("codexOauthOk");
    }
    await this.saveSettings();
    if (notify) {
      new Notice(ready ? this.t("codexReady") : this.t("codexExecutionFailed"));
    }
    return { ready, installed: true, login: true, execution: ready };
  }

  async checkCodexStatus(options = {}) {
    const notify = options.notify !== false;
    try {
      if (!this.canUseLocalCodex()) {
        throw new Error(this.t("localOnlyDesktop"));
      }
      this.normalizeCodexCommand();
      const configuredCodexCommand = this.settings.localCodexCommand || "codex";
      const codexCommand = escapePowerShellSingleQuoted(configuredCodexCommand);
      const command = [
        "$ErrorActionPreference = 'Stop'",
        `$target = '${codexCommand}'`,
        "$cmd = Get-Command $target -ErrorAction SilentlyContinue",
        "$path = if ($cmd) { $cmd.Source } elseif ([System.IO.Path]::IsPathRooted($target) -and -not (Test-Path -LiteralPath $target)) { (Get-Command codex -ErrorAction Stop).Source } else { $target }",
        "$versionOutput = (& $path --version) 2>&1",
        "$versionText = ($versionOutput | Where-Object { $_ -match 'codex-cli\\s+\\S+' } | Select-Object -Last 1)",
        "$version = if ($versionText) { $versionText } else { ($versionOutput -join ' ') }",
        "[pscustomobject]@{ Path = $path; Version = $version } | ConvertTo-Json -Compress"
      ].join("; ");
      const output = await this.runPowerShell(command, 30000);
      const parsed = parseLastJsonObject(output);
      if (parsed.Path && !isPortableCodexCommand(configuredCodexCommand)) {
        this.settings.localCodexCommand = parsed.Path;
      }
      this.settings.codexVersion = parsed.Version || "";
      this.settings.codexStatus = `${this.t("codexFound")} ${parsed.Path || "PATH"}`;
      this.settings.codexLastCheck = new Date().toISOString();
      this.settings.codexInstalledOk = true;
      await this.saveSettings();
      if (notify) {
        new Notice(this.t("codexFound"));
      }
      return parsed;
    } catch (error) {
      this.settings.codexStatus = `Codex no disponible: ${error.message}`;
      this.settings.codexLastCheck = new Date().toISOString();
      this.settings.codexInstalledOk = false;
      this.settings.codexLoginOk = false;
      this.settings.codexExecutionOk = false;
      this.settings.codexSetupCompleted = false;
      await this.saveSettings();
      if (notify) {
        new Notice(this.t("codexNotReady"));
      }
      return null;
    }
  }

  async checkCodexLoginStatus(options = {}) {
    const notify = options.notify !== false;
    try {
      if (!this.canUseLocalCodex()) {
        throw new Error(this.t("localOnlyDesktop"));
      }
      const codexCommand = escapePowerShellSingleQuoted(this.settings.localCodexCommand || "codex");
      const output = await this.runPowerShell(`& '${codexCommand}' login status`, 30000);
      const loginOk = !/(not logged|not signed|no auth|login required|error loading configuration|not authenticated)/i.test(output);
      this.settings.codexLoginOk = loginOk;
      this.settings.codexStatus = loginOk ? this.t("codexLoginDetected") : this.t("codexLoginPending");
      this.settings.codexLastCheck = new Date().toISOString();
      if (!loginOk) {
        this.settings.codexExecutionOk = false;
        this.settings.codexSetupCompleted = false;
      }
      await this.saveSettings();
      if (notify) {
        new Notice(loginOk ? this.t("codexLoginDetected") : this.t("codexLoginPending"));
      }
      return loginOk;
    } catch (error) {
      this.settings.codexLoginOk = false;
      this.settings.codexExecutionOk = false;
      this.settings.codexSetupCompleted = false;
      this.settings.codexStatus = `${this.t("oauthCheckFailed")} ${error.message}`;
      this.settings.codexLastCheck = new Date().toISOString();
      await this.saveSettings();
      if (notify) {
        new Notice(this.t("oauthCheckFailed"));
      }
      return false;
    }
  }

  async ensureCodexVaultTrust() {
    if (!this.canUseLocalCodex()) {
      throw new Error(this.t("localOnlyDesktop"));
    }
    if (!this.settings.allowCodexVaultTrust) {
      return false;
    }
    const vaultRoot = this.getVaultRoot();
    if (!vaultRoot) {
      return false;
    }

    const configDir = path.join(os.homedir(), ".codex");
    const configPath = path.join(configDir, "config.toml");
    const normalizedVault = vaultRoot.toLowerCase().replaceAll("\\", "\\\\");
    const projectBlock = `[projects.'${normalizedVault}']\ntrust_level = "trusted"\n`;

    await fs.mkdir(configDir, { recursive: true });
    let existing = "";
    try {
      existing = await fs.readFile(configPath, "utf8");
    } catch {
      existing = "";
    }

    if (existing.toLowerCase().includes(`[projects.'${normalizedVault}']`)) {
      return true;
    }

    const next = `${existing.trimEnd()}\n\n${projectBlock}`;
    await fs.writeFile(configPath, next.trimStart(), "utf8");
    return true;
  }

  async installOrUpdateCodex() {
    if (!this.canUseLocalCodex()) {
      new Notice(this.t("localOnlyDesktop"));
      throw new Error(this.t("localOnlyDesktop"));
    }
    new Notice(this.t("installingCodex"));
    try {
      const output = await this.runPowerShell("npm install -g @openai/codex", 300000);
      this.settings.codexStatus = this.t("codexInstalled");
      this.settings.codexLastCheck = new Date().toISOString();
      await this.saveSettings();
      new Notice(this.t("codexInstalled"));
      await this.checkCodexStatus();
      return output;
    } catch (error) {
      this.settings.codexStatus = `${this.t("codexInstallFailed")} ${error.message}`;
      this.settings.codexLastCheck = new Date().toISOString();
      this.settings.codexSetupCompleted = false;
      await this.saveSettings();
      new Notice(this.t("codexInstallFailed"));
      throw error;
    }
  }

  async launchCodexLogin() {
    if (!this.canUseLocalCodex()) {
      new Notice(this.t("localOnlyDesktop"));
      throw new Error(this.t("localOnlyDesktop"));
    }
    const codexCommand = escapePowerShellSingleQuoted(this.settings.localCodexCommand || "codex");
    const loginCommand = `& '${codexCommand}' login`;
    const command = `Start-Process -FilePath powershell.exe -ArgumentList @('-NoExit','-ExecutionPolicy','Bypass','-Command','${escapePowerShellSingleQuoted(loginCommand)}')`;
    await this.runPowerShell(command, 30000);
    this.settings.codexStatus = this.t("oauthLaunched");
    this.settings.codexLastCheck = new Date().toISOString();
    await this.saveSettings();
    new Notice(this.t("oauthLaunched"));
  }

  async testCodexExecution(options = {}) {
    const notify = options.notify !== false;
    if (!this.canUseLocalCodex()) {
      if (notify) {
        new Notice(this.t("localOnlyDesktop"));
      }
      throw new Error(this.t("localOnlyDesktop"));
    }
    if (notify) {
      new Notice(this.t("testingCodex"));
    }
    try {
      await this.ensureCodexVaultTrust();
      const vaultRoot = this.getVaultRoot();
      const tempRoot = this.getLocalTempDirectory() || agentPaths(vaultRoot).outboxRoot;
      const promptPath = path.join(tempRoot, `${makeId("codex_test")}.txt`);
      const outputPath = path.join(tempRoot, `${makeId("codex_test_result")}.txt`);
      await fs.mkdir(tempRoot, { recursive: true });
      await fs.writeFile(promptPath, "Responde exactamente: OK", "utf8");
      const output = await this.runPowerShellScript(
        buildCodexExecCommandSafe({
          codexCommand: this.settings.localCodexCommand || "codex",
          promptPath,
          outputPath,
          vaultRoot,
          runOptions: { effort: "fast", interactionMode: "plan" }
        }),
        180000
      );
      let finalMessage = "";
      try {
        finalMessage = await fs.readFile(outputPath, "utf8");
      } catch {
        finalMessage = output;
      }
      if (!/OK/i.test(output)) {
        if (!/OK/i.test(finalMessage)) {
          throw new Error(finalMessage || output || this.t("codexNoOk"));
        }
      }
      await Promise.allSettled([fs.unlink(promptPath), fs.unlink(outputPath)]);
      this.settings.codexSetupCompleted = true;
      this.settings.codexLoginOk = true;
      this.settings.codexExecutionOk = true;
      this.settings.codexStatus = this.t("codexOauthOk");
      this.settings.codexLastCheck = new Date().toISOString();
      await this.saveSettings();
      if (notify) {
        new Notice(this.t("codexOauthOk"));
      }
      return output;
    } catch (error) {
      this.settings.codexSetupCompleted = false;
      this.settings.codexExecutionOk = false;
      this.settings.codexStatus = `${this.t("codexExecutionFailed")} ${error.message}`;
      this.settings.codexLastCheck = new Date().toISOString();
      await this.saveSettings();
      if (notify) {
        new Notice(this.t("codexExecutionFailed"));
        throw error;
      }
      return null;
    }
  }

  async activateView() {
    let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE)[0];
    if (!leaf) {
      leaf = this.app.workspace.getRightLeaf(false);
      await leaf.setViewState({
        type: VIEW_TYPE,
        active: true
      });
    }
    this.app.workspace.revealLeaf(leaf);
    return leaf.view;
  }

  async captureCurrentContext() {
    const view = this.refreshLastMarkdownView();
    const file = view?.file || this.lastMarkdownFile;
    if (!file) {
      return {
        path: "",
        title: "",
        content: "",
        outgoingLinks: [],
        references: []
      };
    }

    const editor = view?.editor;
    const content = editor ? editor.getValue() : await this.app.vault.cachedRead(file);
    const outgoingLinks = this.extractOutgoingLinks(content);
    const references = await this.resolveOutgoingLinkReferences(outgoingLinks, file.path);

    return {
      path: file.path,
      title: file.basename,
      content: content.slice(0, this.settings.maxContextChars),
      outgoingLinks,
      references
    };
  }

  extractOutgoingLinks(content) {
    const source = String(content || "");
    const wikiLinks = [...source.matchAll(/\[\[([^\]#|]+).*?\]\]/g)].map((match) => match[1].trim());
    const markdownLinks = [...source.matchAll(/\[[^\]]+\]\((?!https?:\/\/|mailto:)([^)#]+)(?:#[^)]*)?\)/gi)].map(
      (match) => {
        const raw = match[1].replace(/^<|>$/g, "").replace(/\.md$/i, "").trim();
        try {
          return decodeURIComponent(raw);
        } catch {
          return raw;
        }
      }
    );

    return [...new Set([...wikiLinks, ...markdownLinks].filter(Boolean))].slice(0, 30);
  }

  getReferenceableFiles() {
    return this.app.vault
      .getFiles()
      .filter((file) => !isIgnoredVaultPath(file.path))
      .filter((file) => ["md", "pdf"].includes(String(file.extension || "").toLowerCase()));
  }

  getReferenceKind(file) {
    return String(file?.extension || "").toLowerCase() === "pdf" ? "pdf" : "markdown";
  }

  async buildReferenceFromFile(file, source, token = "") {
    const kind = this.getReferenceKind(file);
    let preview = "";
    if (kind === "pdf") {
      preview = await this.extractPdfPreview(file);
    } else {
      const content = await this.app.vault.cachedRead(file);
      preview = truncatePreviewText(content, 2500);
    }
    return {
      token: token || file.basename,
      path: file.path,
      title: file.basename,
      preview,
      source,
      kind,
      fileType: kind
    };
  }

  async extractPdfPreview(file) {
    try {
      const adapter = this.app.vault.adapter;
      const binary = await adapter.readBinary(file.path);
      const buffer = Buffer.isBuffer(binary) ? binary : Buffer.from(binary);
      const extracted = this.extractPdfTextFromBuffer(buffer, PDF_PREVIEW_MAX_CHARS);
      if (extracted) {
        return extracted;
      }
      return "[PDF sin texto extraíble en esta versión]";
    } catch (error) {
      return `[PDF no extraíble: ${error.message}]`;
    }
  }

  extractPdfTextFromBuffer(buffer, maxChars = PDF_PREVIEW_MAX_CHARS) {
    if (!buffer?.length) {
      return "";
    }
    const binary = buffer.toString("binary");
    const previews = [];
    const streamRegex = /stream\r?\n([\s\S]*?)endstream/g;
    let match = null;
    let scanned = 0;
    while ((match = streamRegex.exec(binary)) && scanned < PDF_STREAM_SCAN_LIMIT) {
      scanned += 1;
      const prefix = binary.slice(Math.max(0, match.index - 180), match.index);
      const rawBuffer = Buffer.from(match[1], "binary");
      const candidates = [];
      if (/\/FlateDecode/i.test(prefix) && zlib?.inflateSync) {
        try {
          candidates.push(zlib.inflateSync(rawBuffer));
        } catch {
          try {
            candidates.push(zlib.inflateRawSync(rawBuffer));
          } catch {
            // Ignore this compressed stream and continue.
          }
        }
      } else {
        candidates.push(rawBuffer);
      }
      for (const candidate of candidates) {
        const text = extractPdfTextFromStreamText(candidate.toString("binary"), maxChars);
        if (text) {
          previews.push(text);
          if (previews.join(" ").length >= maxChars) {
            return truncatePreviewText(previews.join(" "), maxChars, "… [PDF truncado]");
          }
        }
      }
    }

    if (!previews.length) {
      const fallback = extractPdfTextFromStreamText(binary, maxChars);
      if (fallback) {
        previews.push(fallback);
      }
    }

    return truncatePreviewText(previews.join(" "), maxChars, "… [PDF truncado]");
  }

  async resolveOutgoingLinkReferences(outgoingLinks, sourcePath) {
    const references = [];
    for (const link of outgoingLinks || []) {
      const file = this.app.metadataCache.getFirstLinkpathDest(link, sourcePath || "");
      if (!file || file.path === sourcePath || isIgnoredVaultPath(file.path)) {
        continue;
      }

      const source = this.getReferenceKind(file) === "pdf" ? "pdf-outgoing-link" : "outgoing-link";
      references.push(await this.buildReferenceFromFile(file, source, link));

      if (references.length >= 8) {
        break;
      }
    }

    return references;
  }

  getMentionCandidates(query) {
    const normalizedQuery = String(query || "").trim().toLowerCase();
    const files = this.getReferenceableFiles();

    return files
      .map((file) => {
        const basename = file.basename.toLowerCase();
        const fullPath = file.path.toLowerCase();
        let score = 4;

        if (!normalizedQuery) {
          score = 3;
        } else if (basename === normalizedQuery) {
          score = 0;
        } else if (basename.startsWith(normalizedQuery)) {
          score = 1;
        } else if (basename.includes(normalizedQuery)) {
          score = 2;
        } else if (fullPath.includes(normalizedQuery)) {
          score = 3;
        } else {
          return null;
        }

        return { file, score };
      })
      .filter(Boolean)
      .sort((left, right) => {
        if (left.score !== right.score) {
          return left.score - right.score;
        }
        return left.file.path.localeCompare(right.file.path, this.getLanguage(), { sensitivity: "base" });
      })
      .slice(0, 8)
      .map((entry) => entry.file);
  }

  async getSecretToken(secretName = this.settings.deviceTokenSecretName) {
    const getter =
      this.app.secretStorage && this.app.secretStorage.get
        ? this.app.secretStorage.get.bind(this.app.secretStorage)
        : null;
    if (!getter || !secretName) {
      return "";
    }
    return (await Promise.resolve(getter(secretName))) || "";
  }

  async setSecretToken(secretName, token) {
    const setter =
      this.app.secretStorage && this.app.secretStorage.set
        ? this.app.secretStorage.set.bind(this.app.secretStorage)
        : null;
    if (!setter || !secretName || !token) {
      return false;
    }
    await Promise.resolve(setter(secretName, token));
    return true;
  }

  async ensureLocalIdentity(options = {}) {
    let changed = false;
    if (!this.settings.deviceId) {
      this.settings.deviceId = generateDeviceId();
      changed = true;
    }
    if (!this.settings.deviceLabel) {
      this.settings.deviceLabel = getHostLabel();
      changed = true;
    }
    if (!this.settings.deviceTokenSecretName) {
      this.settings.deviceTokenSecretName = `${PLUGIN_ID}-device-token`;
      changed = true;
    }

    let token = await this.getSecretToken(this.settings.deviceTokenSecretName);
    if (!token && this.settings.localBootstrapToken) {
      token = this.settings.localBootstrapToken;
    }
    if (!token) {
      token = generateDeviceToken();
      changed = true;
    }

    const storedInSecret = await this.setSecretToken(this.settings.deviceTokenSecretName, token).catch(() => false);
    if (!storedInSecret && this.settings.localBootstrapToken !== token) {
      this.settings.localBootstrapToken = token;
      changed = true;
    }
    if (storedInSecret && this.settings.localBootstrapToken) {
      this.settings.localBootstrapToken = "";
      changed = true;
    }

    if (changed || options.save) {
      await this.saveSettings();
    }
    return { deviceId: this.settings.deviceId, token };
  }

  async registerLocalDeviceIfPossible(options = {}) {
    if (this.isMobileRuntime() || !this.isLocalBackendUrl(this.settings.backendUrl)) {
      return false;
    }
    await this.ensureLocalBackendRunning();
    const identity = await this.ensureLocalIdentity();
    try {
      const response = await requestUrl({
        url: `${this.settings.backendUrl.replace(/\/$/, "")}/auth/register-device`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: identity.deviceId,
          token: identity.token,
          label: this.settings.deviceLabel || identity.deviceId
        })
      });
      if (response.status >= 400) {
        throw new Error(response.text || `HTTP ${response.status}`);
      }
      this.settings.deviceRegisteredOk = true;
      if (!this.settings.codexStatus || /token|configuración local pendiente|local configuration pending/i.test(this.settings.codexStatus)) {
        this.settings.codexStatus = this.t("localDeviceRegisteredStatus");
      }
      await this.saveSettings();
      if (options.notify) {
        new Notice(this.t("deviceRegistered"));
      }
      return true;
    } catch (error) {
      this.settings.deviceRegisteredOk = false;
      this.settings.codexStatus = this.t("localDevicePendingStatus", { error: error.message });
      await this.saveSettings();
      if (options.notify) {
        new Notice(this.t("deviceRegisterFailed"));
      }
      return false;
    }
  }

  async repairLocalProvisioning() {
    this.settings.deviceId = generateDeviceId();
    this.settings.deviceLabel = getHostLabel();
    this.settings.localBootstrapToken = generateDeviceToken();
    this.settings.deviceRegisteredOk = false;
    await this.setSecretToken(this.settings.deviceTokenSecretName, this.settings.localBootstrapToken).catch(() => false);
    await this.saveSettings();
    return this.registerLocalDeviceIfPossible({ notify: true });
  }

  async getDeviceToken() {
    await this.ensureLocalIdentity();
    const token = await this.getSecretToken(this.settings.deviceTokenSecretName);
    if (token) {
      return token;
    }

    if (this.isLocalBackendUrl(this.settings.backendUrl) && this.settings.localBootstrapToken) {
      return this.settings.localBootstrapToken;
    }

    throw new Error(this.t("noDeviceToken"));
  }

  async apiRequest(method, endpoint, body) {
    if (this.isMobileRuntime() && !this.canUseRemoteBackend()) {
      throw new Error(this.t("remoteHttpsRequired"));
    }
    await this.ensureLocalBackendRunning();
    if (this.isLocalBackendUrl(this.settings.backendUrl)) {
      await this.registerLocalDeviceIfPossible({ notify: false });
    }
    const token = await this.getDeviceToken();
    const url = `${this.settings.backendUrl.replace(/\/$/, "")}${endpoint}`;
    this.validateBackendUrl(url);

    const response = await requestUrl({
      url,
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Device-Id": this.settings.deviceId
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (response.status >= 400) {
      throw new Error(response.text || `HTTP ${response.status}`);
    }

    return response.json;
  }

  async ensureLocalBackendRunning() {
    if (this.isMobileRuntime()) {
      return;
    }
    if (!this.isLocalBackendUrl(this.settings.backendUrl)) {
      return;
    }

    try {
      const health = await requestUrl({
        url: `${this.settings.backendUrl.replace(/\/$/, "")}/health`,
        method: "GET"
      });
      if (health.status < 400) {
        return;
      }
    } catch {
      // Try bootstrapping below.
    }

    if (!this.settings.localBackendBootstrapScript || !this.settings.localBackendBootstrapAllowed) {
      return;
    }

    try {
      childProcess?.execFile?.(this.getShellExecutable(), [
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        this.settings.localBackendBootstrapScript
      ]);
    } catch {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1800));
  }

  getShellExecutable() {
    return "powershell.exe";
  }

  validateBackendUrl(value) {
    validateBackendUrlValue(value, {
      allowRemoteBackend: this.settings.allowRemoteBackend,
      isMobile: this.isMobileRuntime(),
      messages: {
        mobileLocal: this.t("remoteHttpsRequiredMobile"),
        localProtocol: "Local backend must use http or https.",
        remoteDisabled: "Remote backends are disabled in plugin settings.",
        remoteHttps: "Remote backend must use HTTPS."
      }
    });
  }

  isLocalBackendUrl(value) {
    return isLocalBackendUrlValue(value);
  }

  async sendMessageToAgent(threadId, message, baseContext, preparedRunOptions = null) {
    const referenceResolution = await this.resolveAtReferences(message);
    const baseReferences = baseContext.references || [];
    const referencesBeforeFolder = mergeReferences(baseReferences, referenceResolution.references);
    const folderReferences = await this.resolveFolderReferences(message, referencesBeforeFolder);
    const context = {
      ...baseContext,
      references: mergeReferences(baseReferences, referenceResolution.references, folderReferences)
    };
    const runOptions = preparedRunOptions || this.getRunOptions(context, message);
    const systemPrompt = this.getConfiguredSystemPrompt(runOptions);

    try {
      let activeThreadId = threadId;
      if (!activeThreadId) {
        const started = await this.apiRequest("POST", "/chat/start", {
          notePath: context.path || "",
          title: context.title || ""
        });
        activeThreadId = started.threadId;
      }

      const response = await this.apiRequest("POST", "/chat/message", {
        threadId: activeThreadId,
        message,
        noteContext: context,
        runOptions,
        systemPrompt
      });

      return {
        ...response,
        threadId: response.threadId || activeThreadId,
        context,
        unresolvedReferences: referenceResolution.unresolved
      };
    } catch (error) {
      if (!this.shouldUseLocalFallback(error)) {
        throw error;
      }

      const localResponse = await this.sendLocalMessage(threadId || makeId("thread"), message, context, runOptions);
      return {
        ...localResponse,
        localFallback: true,
        context,
        unresolvedReferences: referenceResolution.unresolved
      };
    }
  }

  shouldUseLocalFallback(error) {
    if (!this.canUseLocalCodex()) {
      return false;
    }
    if (!this.isLocalBackendUrl(this.settings.backendUrl)) {
      return false;
    }

    const message = String(error?.message || "");
    return /(ERR_CONNECTION_REFUSED|ECONNREFUSED|connection refused|Failed to fetch|HTTP 5|status 500|request failed|No se puede establecer una conexión)/i.test(
      message
    );
  }

  async resolveAtReferences(text) {
    const tokens = [...new Set(extractAtTokens(text))];
    const files = this.getReferenceableFiles();
    const references = [];
    const unresolved = [];

    for (const token of tokens) {
      const normalizedToken = token.toLowerCase();
      const exact = files.find((file) => file.basename.toLowerCase() === normalizedToken);
      const startsWith = files.find((file) => file.basename.toLowerCase().startsWith(normalizedToken));
      const includes = files.find(
        (file) =>
          file.basename.toLowerCase().includes(normalizedToken) || file.path.toLowerCase().includes(normalizedToken)
      );
      const match = exact || startsWith || includes;

      if (!match) {
        unresolved.push(token);
        continue;
      }
      const source = this.getReferenceKind(match) === "pdf" ? "pdf-mention" : "mention";
      references.push(await this.buildReferenceFromFile(match, source, token));
    }

    return {
      references,
      unresolved
    };
  }

  async resolveFolderReferences(text, existingReferences = []) {
    const roots = normalizeFolderRoots(this.settings.folderReferenceRoots);

    if (!wantsFolderContext(text, roots)) {
      return [];
    }

    const existingPaths = new Set((existingReferences || []).map((reference) => reference.path));
    const files = this.app.vault
      .getMarkdownFiles()
      .filter((file) => isInsideConfiguredRoot(file.path, roots))
      .filter((file) => !isIgnoredVaultPath(file.path))
      .filter((file) => !existingPaths.has(file.path))
      .sort((left, right) => {
        return left.path.localeCompare(right.path, this.getLanguage(), { sensitivity: "base" });
      })
      .slice(0, this.settings.maxFolderReferences || DEFAULT_SETTINGS.maxFolderReferences);

    const references = [];
    for (const file of files) {
      const root = rootForPath(file.path, roots);
      references.push(await this.buildReferenceFromFile(file, "folder", root || this.t("configuredFolderToken")));
    }

    return references;
  }

  async sendLocalMessage(threadId, message, context, runOptions) {
    if (!this.canUseLocalCodex()) {
      throw new Error(this.t("localFallbackDesktopOnly"));
    }
    const vaultRoot = this.getVaultRoot();
    if (!vaultRoot) {
      throw new Error(this.t("vaultPathUnavailable"));
    }

    await this.ensureAgentStructure(vaultRoot);
    const memoryDocuments = await this.readMemoryDocuments(vaultRoot);
    const recentSessions = await this.readRecentSessions(vaultRoot, threadId, 6);
    const sessionId = makeId("session");
    const createdAt = new Date().toISOString();
    const backupRoot = this.getSessionBackupRoot(createdAt, threadId, sessionId);
    if (runOptions.interactionMode === "execute") {
      await fs.mkdir(path.join(vaultRoot, backupRoot), { recursive: true });
    }
    const answer = await this.runLocalCodex(message, context, memoryDocuments, recentSessions, runOptions, backupRoot);
    const summary = summarize(`${message} ${answer}`);
    const sessionPath = await this.writeLocalSession(vaultRoot, {
      sessionId,
      threadId,
      createdAt,
      deviceId: this.settings.deviceId,
      notePath: context.path || "",
      noteTitle: context.title || "",
      userMessage: message,
      assistantMessage: answer,
      referencePaths: (context.references || []).map((reference) => reference.path),
      workMode: runOptions.interactionMode,
      effort: runOptions.effort,
      backupPolicy: runOptions.backupPolicy || "none",
      backupRoot,
      summary
    });

    await this.updateLocalMemory(vaultRoot, {
      createdAt,
      deviceId: this.settings.deviceId,
      sessionId,
      threadId,
      userMessage: message,
      assistantMessage: answer,
      summary,
      references: context.references || []
    });

    return {
      threadId,
      sessionId,
      sessionPath,
      answer,
      raw: {
        provider: "plugin-local"
      },
      security: {
        redacted: false,
        detectedTypes: []
      },
      memoryContext: {
        documents: memoryDocuments.map((document) => ({
          path: document.path,
          category: document.category
        }))
      }
    };
  }

  getVaultRoot() {
    const adapter = this.app.vault.adapter;
    return adapter && adapter.basePath ? adapter.basePath : "";
  }

  async walkFiles(rootPath) {
    const files = [];

    async function walk(currentPath) {
      let entries = [];
      try {
        entries = await fs.readdir(currentPath, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
    }

    await walk(rootPath);
    return files;
  }

  async walkMarkdownFiles(rootPath) {
    const files = await this.walkFiles(rootPath);
    return files.filter((filePath) => filePath.endsWith(".md"));
  }

  async ensureAgentStructure(vaultRoot) {
    const { memoryRoot, sessionsRoot, outboxRoot, indexRoot } = agentPaths(vaultRoot);

    await Promise.all([
      fs.mkdir(memoryRoot, { recursive: true }),
      fs.mkdir(sessionsRoot, { recursive: true }),
      fs.mkdir(outboxRoot, { recursive: true }),
      fs.mkdir(indexRoot, { recursive: true })
    ]);

    for (const category of MEMORY_CATEGORIES) {
      const filePath = path.join(memoryRoot, `${category}.md`);
      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, buildMemoryMarkdown(category, []), "utf8");
      }
    }
  }

  async readMemoryDocuments(vaultRoot) {
    const memoryRoot = agentPaths(vaultRoot).memoryRoot;
    const documents = [];

    for (const category of MEMORY_CATEGORIES) {
      const filePath = path.join(memoryRoot, `${category}.md`);
      let markdown = "";
      try {
        markdown = await fs.readFile(filePath, "utf8");
      } catch {
        markdown = "";
      }
      const parsed = parseFrontmatter(markdown);
      const sanitization = sanitizeMemoryBullets(category, parseBulletLines(parsed.body));
      const degraded = !parsed.data.schema_version || sanitization.issues.length > 0;
      documents.push({
        category,
        path: path.relative(vaultRoot, filePath).replaceAll("\\", "/"),
        text: buildMemoryMarkdown(category, sanitization.bullets),
        degraded,
        issues: sanitization.issues
      });
    }

    return documents;
  }

  async readRecentSessions(vaultRoot, threadId, limit) {
    const sessionsRoot = agentPaths(vaultRoot).sessionsRoot;
    const files = await this.walkMarkdownFiles(sessionsRoot);
    const deduped = new Map();

    for (const filePath of files) {
      const markdown = await fs.readFile(filePath, "utf8");
      const parsed = parseFrontmatter(markdown);
      if (parsed.data.thread_id !== threadId) {
        continue;
      }
      const sessionId = parsed.data.session_id || "";
      const fingerprint = parsed.data.content_fingerprint || sha1(normalizeForFingerprint(parsed.body));
      const dedupeKey = sessionId || fingerprint || path.basename(filePath).replace(/\s+\(\d+\)(?=\.md$)/, "");
      const current = {
        path: path.relative(vaultRoot, filePath).replaceAll("\\", "/"),
        createdAt: parsed.data.created_at,
        summary: parsed.data.summary || "",
        sessionId,
        fingerprint
      };
      const previous = deduped.get(dedupeKey);
      if (!previous) {
        deduped.set(dedupeKey, current);
        continue;
      }
      const previousPath = previous.path || "";
      const currentPath = current.path || "";
      const previousIsConflictCopy = /\(\d+\)\.md$/.test(previousPath);
      const currentIsConflictCopy = /\(\d+\)\.md$/.test(currentPath);
      if (previousIsConflictCopy && !currentIsConflictCopy) {
        deduped.set(dedupeKey, current);
      }
    }

    return Array.from(deduped.values())
      .sort((left, right) => String(left.createdAt || "").localeCompare(String(right.createdAt || "")))
      .slice(-limit);
  }

  getSessionBackupRoot(createdAt, threadId, sessionId) {
    return sessionBackupRoot(createdAt, threadId, sessionId);
  }

  async backupVaultFile(filePath, options = {}) {
    const normalizedPath = String(filePath || "").replaceAll("\\", "/").replace(/^\/+/, "");
    if (!normalizedPath) {
      throw new Error(this.t("backupFilePathUnavailable"));
    }
    const vaultRoot = this.getVaultRoot();
    if (!vaultRoot) {
      throw new Error(this.t("backupVaultPathUnavailable"));
    }
    const sourcePath = path.join(vaultRoot, normalizedPath);
    const relativeBackupRoot =
      options.backupRoot ||
      this.getSessionBackupRoot(options.createdAt || new Date().toISOString(), options.threadId || "manual", options.sessionId || makeId("manual"));
    const targetPath = path.join(vaultRoot, relativeBackupRoot, normalizedPath);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.copyFile(sourcePath, targetPath);
    return path.join(relativeBackupRoot, normalizedPath).replaceAll("\\", "/");
  }

  async runLocalCodex(message, context, memoryDocuments, recentSessions, runOptions, backupRoot = "") {
    const systemPrompt = this.getConfiguredSystemPrompt(runOptions, backupRoot);
    const prompt = [
      "System prompt:",
      systemPrompt || "(empty)",
      "",
      "Operational constraints:",
      "Use only the provided note context, referenced notes, shared memory, and recent sessions.",
      "If references are provided, treat them as part of the active context.",
      "Do not inspect the filesystem, list directories, or run shell commands unless the user explicitly asked for shell-level inspection and the provided context is insufficient.",
      "Assume the injected paths and previews may contain non-ASCII characters. Do not try to re-resolve or normalize them via shell commands.",
      "If the provided context is insufficient, say what is missing instead of trying to discover it by executing tools.",
      runOptions?.effort === "fast"
        ? "Use a fast, direct answer with only the highest value details."
        : "Reason carefully before answering, but do not expose hidden chain-of-thought; provide a concise reasoning summary and clear next steps.",
      runOptions?.interactionMode === "execute"
        ? "The user selected execution mode: prefer concrete actions, drafts, patches, checklists, and direct next changes. If you edit or delete files, create backups first."
        : "The user selected plan mode: prefer diagnosis, tradeoffs, sequencing, and acceptance criteria before execution.",
      "",
      "Response controls:",
      JSON.stringify(runOptions || {}, null, 2),
      "",
      "Backup workspace:",
      backupRoot || "(not applicable)",
      "",
      "Active note context:",
      JSON.stringify(
        {
          path: context.path || "",
          title: context.title || "",
          outgoing_links: context.outgoingLinks || [],
          note_preview: context.content || ""
        },
        null,
        2
      ),
      "",
      "Referenced notes:",
      JSON.stringify(
        (context.references || []).map((reference) => ({
          path: reference.path,
          title: reference.title,
          preview: reference.preview,
          source: reference.source,
          kind: reference.kind || reference.fileType || "markdown"
        })),
        null,
        2
      ),
      "",
      "Shared memory:",
      JSON.stringify(memoryDocuments, null, 2),
      "",
      "Recent sessions in this thread:",
      JSON.stringify(recentSessions, null, 2),
      "",
      "User request:",
      message
    ].join("\n");

    const vaultRoot = this.getVaultRoot();
    const tempRoot = this.getLocalTempDirectory() || agentPaths(vaultRoot).outboxRoot;
    const promptPath = path.join(tempRoot, `${makeId("codex_prompt")}.txt`);
    const outputPath = path.join(tempRoot, `${makeId("codex_output")}.txt`);
    try {
      await this.ensureCodexVaultTrust();
      await fs.mkdir(path.dirname(promptPath), { recursive: true });
      await fs.writeFile(promptPath, prompt, "utf8");
      const command = buildCodexExecCommandSafe({
        codexCommand: this.settings.localCodexCommand || "codex",
        promptPath,
        outputPath,
        vaultRoot,
        runOptions
      });
      const output = await this.runPowerShellScript(command, 180000);
      let finalMessage = "";
      try {
        finalMessage = await fs.readFile(outputPath, "utf8");
      } catch {
        finalMessage = output;
      }

      const answer = String(finalMessage || output || "").trim();
      if (!answer) {
        throw new Error(this.t("codexNoOutput"));
      }

      return answer;
    } catch (error) {
      const detail = [error.message, error.stdout, error.stderr].filter(Boolean).join(" | ");
      const classified = classifyLocalCodexFailureSafe(detail, { notePath: context.path || "" });
      throw new Error(this.t("localCodexUnavailableDetail", { classification: classified, detail }));
    } finally {
      try {
        await fs.unlink(promptPath);
      } catch {
        // Best effort cleanup.
      }
      try {
        await fs.unlink(outputPath);
      } catch {
        // Best effort cleanup.
      }
    }
  }

  async writeLocalSession(vaultRoot, session) {
    const date = new Date(session.createdAt);
    const year = String(date.getUTCFullYear());
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const filename = `${session.createdAt.replace(/[:.]/g, "-")}-${session.threadId}-${session.sessionId}.md`;
    const relativePath = path.join(CORTEX_DATA_ROOT, "sessions", year, month, day, filename).replaceAll("\\", "/");
    const absolutePath = path.join(vaultRoot, relativePath);

    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(
      absolutePath,
      buildSessionMarkdown({
        ...session,
        schemaVersion: CORTEX_SCHEMA_VERSION,
        pluginVersion: this.manifest?.version || "",
        contentFingerprint: session.contentFingerprint || sessionFingerprint(session)
      }),
      "utf8"
    );
    return relativePath;
  }

  async updateLocalMemory(vaultRoot, payload) {
    const extracted = heuristicMemoryFromExchange(payload);
    const date = new Date(payload.createdAt || new Date().toISOString());
    const year = String(date.getUTCFullYear());
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const candidatesRoot = path.join(vaultRoot, CORTEX_DATA_ROOT, "index", "memory-candidates", year, month, day);
    const fileName = `${(payload.createdAt || new Date().toISOString()).replace(/[:.]/g, "-")}-${payload.threadId}-${payload.sessionId}.md`;
    await fs.mkdir(candidatesRoot, { recursive: true });
    await fs.writeFile(
      path.join(candidatesRoot, fileName),
      buildMemoryCandidateMarkdown({
        extracted,
        createdAt: payload.createdAt,
        deviceId: payload.deviceId,
        pluginVersion: this.manifest?.version || "",
        sessionId: payload.sessionId,
        threadId: payload.threadId
      }),
      "utf8"
    );
  }

  async insertLastResponseIntoNote() {
    if (!this.lastResponse?.answer) {
      new Notice(this.t("noLastResponseInsert"));
      return;
    }

    const view = this.refreshLastMarkdownView();
    if (!view || !view.editor) {
      new Notice(this.t("openEditableNote"));
      return;
    }

    if ((this.settings.defaultInteractionMode || DEFAULT_SETTINGS.defaultInteractionMode) === "execute" && view.file?.path) {
      try {
        await this.backupVaultFile(view.file.path, {
          createdAt: new Date().toISOString(),
          threadId: this.lastResponse.threadId || "manual",
          sessionId: this.lastResponse.sessionId || makeId("manual")
        });
      } catch (error) {
        new Notice(this.t("backupFailed", { error: error.message }));
        return;
      }
    }

    const insertion = `\n\n${this.lastResponse.answer}\n`;
    view.editor.replaceRange(insertion, view.editor.getCursor());
    new Notice(this.t("responseInserted"));
  }

  async showMemoryUsed() {
    if (!this.lastResponse?.threadId) {
      new Notice(this.t("noLastResponseMemory"));
      return;
    }

    if (this.lastResponse.localFallback) {
      new MemoryContextModal(this.app, {
        documents: this.lastResponse.memoryContext?.documents || [],
        recentSessions: []
      }, this.t).open();
      return;
    }

    try {
      const context = await this.apiRequest(
        "GET",
        `/memory/context/${encodeURIComponent(this.lastResponse.threadId)}`
      );
      new MemoryContextModal(this.app, context, this.t).open();
    } catch (error) {
      new Notice(this.t("memoryLoadFailed", { error: error.message }));
    }
  }
};
