const DEFAULT_LANGUAGE = "en";
const SUPPORTED_LANGUAGES = ["en", "es"];

const PROMPTS = {
  en: {
    role:
      "Act as an assistant embedded in a personal Obsidian vault. Your job is to help think, organize, write, and execute tasks using the vault context.",
    context:
      "Answer in the user's language. Prioritize explicit context: active note, selection, @ references, outgoing links, shared memory, and recent sessions. Do not invent note content that was not provided.",
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
      "Responde en el idioma del usuario. Usa primero el contexto explícito: nota activa, selección, referencias @, enlaces salientes, memoria compartida y sesiones recientes. No inventes contenido de notas que no se hayan proporcionado.",
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
    appTitle: "Codex",
    openChat: "Open Codex Chat",
    askCurrentNote: "Ask about current note",
    askSelection: "Ask about selection",
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
    folderRootsDesc: "Comma-separated vault folders that Codex may load when the user asks to review a folder.",
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
    askPlaceholder: "Ask Codex...",
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
    noValidSelection: "No valid active selection in this note.",
    noValidSelectionInNote: "No valid active selection in this note: {path}",
    selectionLoaded: "Selection loaded from {path}",
    newChatReady: "New chat ready.",
    hide: "Hide",
    details: "Details",
    hideContextDetails: "Hide context details",
    viewContextDetails: "View context details",
    activeNote: "Active note",
    selection: "Selection",
    references: "References",
    noSelection: "no selection",
    withSelection: "with selection",
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
    codexThinking: "Codex is thinking",
    codexPreparingResponse: "Codex is preparing the response",
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
    openSettingsSelectPlugin: "Open Obsidian settings and select Codex Chat.",
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
    folderReview: "Codex is reviewing folder {folder}",
    configuredFolderToken: "folder",
    lastNoteHelp: "Last note seen: {note}. Use @NoteName or quick actions to pin context.",
    dataJsonHasLocalKey: "`{path}` still contains `{key}`, which should be local and not synced.",
    duplicateSessionsDetected: "{count} logically duplicated session(s) found from Sync conflicts in `_agent/sessions`.",
    memoryFileLegacySchema: "`_agent/memory/{category}.md` uses an old schema and will be read in compatibility mode.",
    memoryFileNonCanonical: "`_agent/memory/{category}.md` contains {count} non-canonical entries that will be ignored when shared memory is used.",
    indexEmpty: "`_agent/index` is empty or not being used yet.",
    indexUnreadable: "`_agent/index` does not exist or cannot be read.",
    outboxStale: "`_agent/outbox` keeps {count} temporary file(s) older than 24h.",
    workModeExecutePrompt:
      "Active work mode: Execute / Unrestricted.\nYou may act without asking for additional confirmation, but before editing or deleting any file or note you must create a backup of the affected file.\n{backupInstruction}\nIf the backup cannot be created first, do not modify or delete the file and explain the block.",
    workModeExecuteBackupPath: "Store those copies in: {backupRoot}, preserving the file path relative to the vault.",
    workModeExecuteBackupGeneric: "Store those copies in a session backup folder, preserving the file path relative to the vault.",
    workModePlannerPrompt:
      "Active work mode: Planner / Copilot.\nDo not modify, delete, rename, or rewrite vault files unless the user asks for it clearly and explicitly.",
    noCodexNoContext:
      "I could not use local Codex and there is not enough content to answer well.\n\nNext steps:\n- open a note with relevant context\n- select the fragment you want to analyze\n- use an @ reference to add a note",
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
    appTitle: "Codex",
    openChat: "Abrir Codex Chat",
    askCurrentNote: "Preguntar sobre nota actual",
    askSelection: "Preguntar sobre selección",
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
    folderRootsDesc: "Carpetas de la vault, separadas por comas, que Codex puede cargar cuando pidas revisar una carpeta.",
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
    askPlaceholder: "Pregunta a Codex...",
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
    noValidSelection: "No hay una selección activa válida en esta nota.",
    noValidSelectionInNote: "No hay una selección activa válida en esta nota: {path}",
    selectionLoaded: "Selección cargada desde {path}",
    newChatReady: "Chat nuevo preparado.",
    hide: "Ocultar",
    details: "Detalles",
    hideContextDetails: "Ocultar detalles de contexto",
    viewContextDetails: "Ver detalles de contexto",
    activeNote: "Nota",
    selection: "Selección",
    references: "Referencias",
    noSelection: "sin selección",
    withSelection: "con selección",
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
    codexThinking: "Codex está pensando",
    codexPreparingResponse: "Codex está preparando la respuesta",
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
    openSettingsSelectPlugin: "Abre los ajustes de Obsidian y selecciona Codex Chat.",
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
    folderReview: "Codex está revisando la carpeta {folder}",
    configuredFolderToken: "carpeta",
    lastNoteHelp: "Última nota vista: {note}. Usa @NombreNota o las acciones rápidas para anclar el contexto.",
    dataJsonHasLocalKey: "`{path}` aún contiene `{key}`, que debería ser local y no sincronizarse.",
    duplicateSessionsDetected: "Hay {count} sesiones duplicadas lógicamente por conflictos de Sync en `_agent/sessions`.",
    memoryFileLegacySchema: "`_agent/memory/{category}.md` sigue en esquema antiguo y se leerá en modo compatible.",
    memoryFileNonCanonical: "`_agent/memory/{category}.md` contiene {count} entradas no canónicas que el plugin ignorará al usar memoria compartida.",
    indexEmpty: "`_agent/index` está vacío o no se está usando todavía.",
    indexUnreadable: "`_agent/index` no existe o no se puede leer.",
    outboxStale: "`_agent/outbox` conserva {count} temporales con más de 24h.",
    workModeExecutePrompt:
      "Modo de trabajo activo: Ejecutar / Sin restricciones.\nPuedes actuar sin pedir permiso adicional, pero antes de editar o borrar cualquier archivo o nota debes crear una copia de seguridad del archivo afectado.\n{backupInstruction}\nSi no puedes crear la copia previa, no modifiques ni borres el archivo y explica el bloqueo.",
    workModeExecuteBackupPath: "Guarda esas copias dentro de: {backupRoot} preservando la ruta relativa del archivo dentro de la vault.",
    workModeExecuteBackupGeneric: "Guarda esas copias dentro de una carpeta de backup de la sesión preservando la ruta relativa del archivo dentro de la vault.",
    workModePlannerPrompt:
      "Modo de trabajo activo: Planificador / Copiloto.\nNo modifiques, borres, renombres ni reescribas archivos de la vault salvo que el usuario lo pida de forma clara y explícita.",
    noCodexNoContext:
      "No he podido usar Codex local y tampoco tengo contenido suficiente para responder bien.\n\nSiguientes pasos:\n- abre una nota con contexto relevante\n- selecciona el fragmento que quieres analizar\n- usa una referencia @ para añadir una nota",
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
