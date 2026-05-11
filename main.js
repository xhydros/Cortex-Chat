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
const PLUGIN_ID = "obsidian-codex";
const LEGACY_PLUGIN_ID = ["agent", "memory", "sync"].join("-");
const LEGACY_PLUGIN_NAME = ["Agent", "Memory", "Sync"].join(" ");
const LEGACY_DEVICE_TOKEN_SECRET_NAME = `${LEGACY_PLUGIN_ID}-device-token`;
const VIEW_TYPE = `${PLUGIN_ID}-view`;
const MEMORY_CATEGORIES = ["preferences", "projects", "people", "decisions", "recent"];
const AGENT_SCHEMA_VERSION = "2";
const LOCAL_STATE_VERSION = "1";
const SHARED_SETTING_KEYS = [
  "backendUrl",
  "allowRemoteBackend",
  "maxContextChars",
  "defaultInteractionMode",
  "showDiagnostics",
  "localFallbackDelayMs",
  "maxFolderReferences",
  "systemPromptSections",
  "uiScale"
];
const LOCAL_SETTING_KEYS = [
  "deviceId",
  "deviceTokenSecretName",
  "localBootstrapToken",
  "localBackendBootstrapScript",
  "localCodexCommand",
  "codexSetupPrompted",
  "codexSetupCompleted",
  "codexStatus",
  "codexVersion",
  "codexLastCheck",
  "codexInstalledOk",
  "codexLoginOk",
  "codexExecutionOk"
];
const DEFAULT_SYSTEM_PROMPT_SECTIONS = {
  role: "Actúa como un agente integrado en una bóveda personal de Obsidian. Tu trabajo es ayudar a pensar, organizar, escribir y ejecutar tareas dentro del contexto de la vault.",
  context: "Responde en el idioma del usuario. Usa primero el contexto explícito: nota activa, selección, referencias @, enlaces salientes, memoria compartida y sesiones recientes. No inventes contenido de notas que no se hayan proporcionado.",
  behavior: "Si falta contexto crítico, dilo y pide lo mínimo necesario. Distingue hechos observados, inferencias y recomendaciones. Prioriza respuestas accionables, breves y útiles para continuar trabajando.",
  safety: "Protege datos sensibles y evita persistir secretos. Si una acción puede modificar contenido importante o borrar información, explica el riesgo y busca una intención clara antes de actuar.",
  output: "Da respuestas claras, con estructura ligera cuando ayude. Referencia notas, rutas o secciones cuando proceda. Evita relleno y no muestres razonamiento oculto; resume solo las razones necesarias.",
  memory: "Usa la memoria como contexto auxiliar, no como fuente absoluta. Si detectas preferencias, decisiones o estado de proyectos, intégralo con cuidado y evita duplicar información obsoleta."
};

const DEFAULT_SETTINGS = {
  backendUrl: "http://127.0.0.1:8787",
  deviceId: "desktop-main",
  deviceTokenSecretName: `${PLUGIN_ID}-device-token`,
  allowRemoteBackend: false,
  maxContextChars: 2000,
  localBootstrapToken: "",
  localBackendBootstrapScript: "",
  defaultInteractionMode: "plan",
  showDiagnostics: true,
  localFallbackDelayMs: 900,
  maxFolderReferences: 24,
  localCodexCommand: "codex",
  codexSetupPrompted: false,
  codexSetupCompleted: false,
  codexStatus: "No comprobado",
  codexVersion: "",
  codexLastCheck: "",
  codexInstalledOk: false,
  codexLoginOk: false,
  codexExecutionOk: false,
  systemPromptSections: DEFAULT_SYSTEM_PROMPT_SECTIONS,
  uiScale: 1
};

const MIN_UI_SCALE = 0.85;
const MAX_UI_SCALE = 1.75;
const UI_SCALE_STEP = 0.1;
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

function summarize(text) {
  return String(text || "").replace(/\s+/g, " ").trim().slice(0, 160);
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

function normalizeSystemPromptSections(value) {
  const current = value && typeof value === "object" ? value : {};
  const normalized = {};
  for (const key of Object.keys(DEFAULT_SYSTEM_PROMPT_SECTIONS)) {
    normalized[key] = typeof current[key] === "string" ? current[key] : DEFAULT_SYSTEM_PROMPT_SECTIONS[key];
  }
  return normalized;
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

function workModeLabel(interactionMode) {
  return interactionMode === "execute" ? "Ejecutar" : "Planificador";
}

function workModeDetail(interactionMode) {
  return interactionMode === "execute" ? "Sin restricciones" : "Copiloto";
}

function classifyEffort(message, context = {}, interactionMode = "plan") {
  let score = 0;
  const normalizedMessage = String(message || "").trim();
  const references = context.references || [];
  const notePreview = String(context.content || "");
  const selection = String(context.selection || "");
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
  if (selection.length > 900) {
    score += 1;
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

function isForeignWindowsUserPath(value) {
  const current = String(value || "").toLowerCase();
  const homeDir = os?.homedir ? os.homedir().toLowerCase() : "";
  return current.startsWith("c:\\users\\") && Boolean(homeDir) && !current.startsWith(homeDir);
}

function isPortableCodexCommand(value) {
  const current = String(value || "").trim().toLowerCase();
  return !current || current === "codex";
}

function codexSandboxForMode(runOptions = {}) {
  return runOptions.interactionMode === "execute" ? "workspace-write" : "read-only";
}

function codexReasoningForEffort(runOptions = {}) {
  return runOptions.effort === "fast" ? "medium" : "high";
}

function hasNonAscii(value) {
  return /[^\x00-\x7F]/.test(String(value || ""));
}

function classifyLocalCodexFailure(detail, context = {}) {
  const source = String(detail || "");
  const lower = source.toLowerCase();
  const notePath = String(context.notePath || "");
  const hasUnicodePath = hasNonAscii(notePath);

  if (
    /login required|not authenticated|oauth pendiente|error loading configuration|not logged|not signed/i.test(source)
  ) {
    return "Codex local no está autenticado con ChatGPT en este equipo.";
  }
  if (/timeout waiting for child process to exit|timed out|operation timed out/i.test(lower)) {
    return hasUnicodePath
      ? "Codex local agotó el tiempo durante la ejecución. Hay indicios de fragilidad con rutas o contenido Unicode en Windows."
      : "Codex local agotó el tiempo durante la ejecución.";
  }
  if (/constrainedlanguage|propertysetter not supported in constrainedlanguage/i.test(lower)) {
    return "PowerShell está ejecutándose en modo restringido y ha bloqueado comandos internos de Codex.";
  }
  if (/blocked by policy|rejected: blocked by policy|executionpolicy/i.test(lower)) {
    return "La política local ha bloqueado comandos internos que Codex intentó ejecutar.";
  }
  if (/\?\?/.test(source) || /visi\?\?|c\?\?maras|t\?\?cnica/i.test(source)) {
    return "Se detecta degradación de codificación Unicode en rutas o contexto inyectado durante la ejecución local.";
  }
  return "Codex local falló al responder sobre el contexto inyectado.";
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
    `$codexCommand = '${codexCommand}'`,
    `$promptPath = '${promptPath}'`,
    `$outputPath = '${outputPath}'`,
    `$vaultRoot = '${vaultRoot}'`,
    `Get-Content -Raw -Encoding utf8 -LiteralPath $promptPath | & $codexCommand --ask-for-approval never exec -C $vaultRoot --skip-git-repo-check --sandbox ${sandbox} -c 'model_reasoning_effort="${effort}"' --output-last-message $outputPath -`
  ].join("\n");
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
    kind: "agent-session",
    schema_version: session.schemaVersion || AGENT_SCHEMA_VERSION,
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
- Selection: ${session.selection ? "yes" : "no"}
- References: ${(session.referencePaths || []).join(", ") || "(none)"}
- Work mode: ${session.workMode || "plan"}
- Effort: ${session.effort || "thinking"}
- Backup policy: ${session.backupPolicy || "(none)"}
- Backup root: ${session.backupRoot || "(none)"}
`;
}

function buildMemoryMarkdown(category, bullets) {
  return `${toFrontmatter({
    kind: "agent-memory",
    schema_version: AGENT_SCHEMA_VERSION,
    category,
    updated_at: new Date().toISOString(),
    managed_by: "plugin-local-fallback"
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
    kind: "agent-memory-candidate",
    schema_version: AGENT_SCHEMA_VERSION,
    plugin_version: candidate.pluginVersion || "",
    session_id: candidate.sessionId || "",
    thread_id: candidate.threadId || "",
    created_at: candidate.createdAt || new Date().toISOString(),
    device_id: candidate.deviceId || "",
    source: "plugin-local-fallback"
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
    "La nota ya contiene bastante contexto; ahora conviene convertirlo en decisiones operativas pequenas.",
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
      "No he podido usar Codex local y tampoco tengo contenido suficiente para responder bien.",
      "Prueba una de estas dos opciones:",
      "- abre la nota antes de preguntar",
      "- usa una referencia como `@PRY-Speech`"
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
    "He encontrado este contexto relevante:",
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
  constructor(app, payload) {
    super(app);
    this.payload = payload || { documents: [], recentSessions: [] };
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Memoria usada" });

    const docs = this.payload.documents || [];
    const sessions = this.payload.recentSessions || [];

    if (!docs.length && !sessions.length) {
      contentEl.createEl("p", { text: "No hay contexto de memoria disponible para esta respuesta." });
      return;
    }

    if (docs.length) {
      contentEl.createEl("h3", { text: "Archivos de memoria" });
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
    contentEl.addClass("obsidian-codex-setup-modal");
    const mobile = this.plugin.isMobileRuntime();
    contentEl.createEl("h2", { text: mobile ? "Configurar backend móvil" : "Configurar Codex OAuth" });
    contentEl.createEl("p", {
      text:
        mobile
          ? "En móvil/iOS este plugin no puede ejecutar Codex CLI local. Necesita un backend remoto HTTPS configurado en los ajustes."
          : "Este plugin necesita Codex CLI actualizado y autenticado con ChatGPT para dar respuestas reales. Si Codex no está listo, solo puede usar respaldo local."
    });

    this.statusEl = contentEl.createDiv({ cls: "obsidian-codex-setup-status" });
    this.renderStatus();

    const actionsEl = contentEl.createDiv({ cls: "obsidian-codex-setup-actions" });
    if (mobile) {
      this.addAction(actionsEl, "Abrir ajustes", "allowRemoteBackend", async () => {
        this.plugin.openPluginSettings();
      });
      this.addAction(actionsEl, "Comprobar backend", "codexSetupCompleted", async () => {
        await this.plugin.checkRemoteBackendForMobile({ notify: true });
        this.renderStatus();
      });
      return;
    }
    this.addAction(actionsEl, "1. Instalar/actualizar", "codexInstalledOk", async () => {
      await this.plugin.installOrUpdateCodex();
      this.renderStatus();
    });
    this.addAction(actionsEl, "2. Iniciar OAuth", "codexLoginOk", async () => {
      await this.plugin.launchCodexLogin();
      this.renderStatus();
    });
    this.addAction(actionsEl, "3. Probar Codex", "codexExecutionOk", async () => {
      await this.plugin.testCodexExecution();
      this.renderStatus();
    });
    this.addAction(actionsEl, "Recomprobar", "codexSetupCompleted", async () => {
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
      this.statusEl.createDiv({ text: `Estado: ${this.plugin.getMobileBackendStatus()}` });
      this.statusEl.createDiv({ text: `Backend: ${this.plugin.settings.backendUrl || "(sin configurar)"}` });
      return;
    }
    this.statusEl.createDiv({ text: `Estado: ${this.plugin.settings.codexStatus || "No comprobado"}` });
    if (this.plugin.settings.codexVersion) {
      this.statusEl.createDiv({ text: `Versión: ${this.plugin.settings.codexVersion}` });
    }
    if (this.plugin.settings.codexLastCheck) {
      this.statusEl.createDiv({ text: `Última comprobación: ${this.plugin.settings.codexLastCheck}` });
    }
  }

  addAction(parentEl, label, statusKey, onClick) {
    const button = parentEl.createEl("button", { cls: "obsidian-codex-setup-action" });
    this.renderActionButton(button, label, statusKey);
    button.addEventListener("click", async () => {
      button.disabled = true;
      this.renderActionButton(button, "Trabajando...", statusKey);
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
      cls: `obsidian-codex-setup-badge ${ok ? "is-ok" : "is-pending"}`,
      text: ok ? "✓" : "•"
    });
    button.createSpan({ text: label });
  }
}

class AgentMemoryView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
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
    return "Codex";
  }

  getIcon() {
    return "bot";
  }

  async onOpen() {
    this.render();
  }

  async onClose() {
    if (this.keydownHandler) {
      this.contentEl?.removeEventListener("keydown", this.keydownHandler);
      this.keydownHandler = null;
    }
  }

  async prepareContext(context) {
    this.context = context;
    this.threadId = null;
    this.messages = [];
    this.plugin.setLastResponse(null);
    this.render();
  }

  appendMessage(role, content, meta = {}) {
    const id = makeId("msg");
    this.messages.push({ id, role, content, meta });
    this.renderMessages();
    return id;
  }

  updateMessage(id, content, meta = {}) {
    const message = this.messages.find((entry) => entry.id === id);
    if (!message) {
      return;
    }
    message.content = content;
    message.meta = { ...(message.meta || {}), ...meta };
    this.renderMessages();
  }

  applyUiScale() {
    if (!this.contentEl) {
      return;
    }
    this.contentEl.style.setProperty("--obsidian-codex-scale", String(this.plugin.getUiScale()));
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
      if (
        !/(carpeta|folder|directorio).{0,30}proyectos/.test(normalizedMessage) &&
        !/(todos|todas).{0,35}(archivos|notas).{0,35}proyectos/.test(normalizedMessage) &&
        !/200\s+proyectos/.test(normalizedMessage)
      ) {
        return "";
      }
      return "Codex está revisando la carpeta 200 Proyectos";
    }
    const firstSegment = String(folderReference.path || "")
      .split("/")
      .filter(Boolean)
      .slice(0, 2)
      .join("/");
    const label = firstSegment || folderReference.token || folderReference.title || "carpeta";
    return `Codex está revisando la carpeta ${label}`;
  }

  setPendingStatus(id, status, meta = {}) {
    this.lastPendingStatus = status;
    this.updateMessage(id, "", {
      loading: true,
      status,
      ...meta
    });
  }

  render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("obsidian-codex-view");
    contentEl.setAttr("tabindex", "0");
    this.applyUiScale();
    this.registerScaleShortcuts();

    this.headerEl = contentEl.createDiv({ cls: "obsidian-codex-header" });
    this.quickActionsEl = contentEl.createDiv({ cls: "obsidian-codex-quick-actions" });
    this.messagesEl = contentEl.createDiv({ cls: "obsidian-codex-messages" });
    this.sendEl = contentEl.createDiv({ cls: "obsidian-codex-send" });
    this.contextEl = this.sendEl.createDiv({ cls: "obsidian-codex-context" });
    this.modeCardsEl = this.sendEl.createDiv({ cls: "obsidian-codex-mode-cards" });
    this.renderModeCards();

    this.suggestionsEl = this.sendEl.createDiv({
      cls: "obsidian-codex-suggestions suggestion-container"
    });
    this.suggestionsEl.hide();

    this.composerRowEl = this.sendEl.createDiv({ cls: "obsidian-codex-composer-row" });
    this.inputEl = this.composerRowEl.createEl("textarea", {
      attr: {
        placeholder: "Pregunta a Codex..."
      }
    });
    this.inputEl.addClass("obsidian-codex-input");

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
      cls: "obsidian-codex-send-button",
      attr: { "aria-label": "Enviar mensaje" }
    });
    setIcon(this.sendButtonEl, "send-horizontal");
    this.sendButtonEl.addEventListener("click", async () => {
      await this.sendMessage();
    });
    this.sendHintEl = this.sendEl.createDiv({
      cls: "obsidian-codex-input-hint",
      text: "Enter envía · Shift+Enter línea · @nota"
    });

    this.renderHeader();
    this.renderQuickActions();
    this.renderContext();
    this.renderMessages();
    this.autoResizeInput();
  }

  renderModeCards() {
    if (!this.modeCardsEl) {
      return;
    }

    this.modeCardsEl.empty();
    this.addSegmentedSetting({
      settingKey: "defaultInteractionMode",
      title: "Modo de trabajo",
      values: {
        plan: { label: "Planificador", detail: "Copiloto" },
        execute: { label: "Ejecutar", detail: "Sin restricciones" }
      }
    });
  }

  addSegmentedSetting(config) {
    const current = this.plugin.settings[config.settingKey] || DEFAULT_SETTINGS[config.settingKey];
    const active = config.values[current] || config.values[Object.keys(config.values)[0]];
    const groupEl = this.modeCardsEl.createDiv({ cls: "obsidian-codex-mode-group" });
    const headerEl = groupEl.createDiv({ cls: "obsidian-codex-mode-group-header" });
    headerEl.createSpan({ cls: "obsidian-codex-mode-group-title", text: config.title });
    if (active?.detail) {
      headerEl.createSpan({ cls: "obsidian-codex-mode-group-hint", text: active.detail });
    }
    const segmentedEl = groupEl.createDiv({ cls: "obsidian-codex-mode-segmented" });
    for (const [value, option] of Object.entries(config.values)) {
      const buttonEl = segmentedEl.createEl("button", {
        cls: `obsidian-codex-mode-segment${value === current ? " is-active" : ""}`,
        attr: {
          "aria-label": `${config.title}: ${option.label}`,
          "aria-pressed": String(value === current),
          title: option.detail ? `${option.label} · ${option.detail}` : option.label
        }
      });
      buttonEl.createSpan({ cls: "obsidian-codex-mode-segment-label", text: option.label });
      if (option.detail) {
        buttonEl.createSpan({ cls: "obsidian-codex-mode-segment-detail", text: option.detail });
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
    const leftEl = this.headerEl.createDiv({ cls: "obsidian-codex-header-left" });
    leftEl.createDiv({ cls: "obsidian-codex-title", text: "Codex" });
    const state = this.getCodexState();
    const stateEl = leftEl.createDiv({ cls: `obsidian-codex-state is-${state.kind}` });
    stateEl.createSpan({ cls: "obsidian-codex-state-dot" });
    stateEl.createSpan({ text: state.label });
    if ((this.plugin.settings.defaultInteractionMode || DEFAULT_SETTINGS.defaultInteractionMode) === "execute") {
      leftEl.createDiv({ cls: "obsidian-codex-header-mode-chip is-unrestricted", text: "Sin restricciones" });
    }
    const actionsButton = this.createIconButton(this.headerEl, "settings", "Opciones y diagnostico", "obsidian-codex-icon-button");
    actionsButton.addEventListener("click", (event) => this.openActionsMenu(event));
    if (this.plugin.settings.showDiagnostics) {
      this.headerEl.createDiv({
        cls: "obsidian-codex-diagnostics",
        text: `${this.plugin.settings.backendUrl} | ${this.plugin.settings.deviceId}`
      });
    }
  }

  getCodexState() {
    if (this.plugin.isMobileRuntime()) {
      return this.plugin.canUseRemoteBackend()
        ? { kind: "ready", label: "Remoto" }
        : { kind: "pending", label: "Móvil" };
    }
    const status = String(this.plugin.settings.codexStatus || "").toLowerCase();
    if (this.plugin.settings.codexSetupCompleted || /probado correctamente|oauth detectado/.test(status)) {
      return { kind: "ready", label: "Listo" };
    }
    if (/error|no disponible|no pudo|no se pudo/.test(status)) {
      return { kind: "error", label: "Revisar" };
    }
    return { kind: "pending", label: "Pendiente" };
  }

  renderQuickActions() {
    if (!this.quickActionsEl) {
      return;
    }
    this.quickActionsEl.empty();
    this.createQuickAction("message-square-plus", "Nuevo chat", () => this.startNewChat());
    this.createQuickAction("file-text", "Cargar nota actual", async () => this.loadCurrentNoteContext());
    const selectionButton = this.createQuickAction("text-select", "Cargar selección", async () => this.loadSelectionContext());
    const hasSelection = this.hasActiveSelection();
    selectionButton.classList.toggle("is-muted", !hasSelection);
    selectionButton.disabled = !hasSelection;
    selectionButton.setAttribute("aria-disabled", String(!hasSelection));
    this.createQuickAction("copy", "Copiar última respuesta", async () => {
      await this.plugin.copyLastResponse();
    });
    this.createQuickAction("corner-down-left", "Insertar última respuesta", async () => {
      await this.plugin.insertLastResponseIntoNote();
    });
  }

  createQuickAction(icon, ariaLabel, handler) {
    const button = this.quickActionsEl.createEl("button", {
      cls: "obsidian-codex-quick-action",
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

  hasActiveSelection() {
    return Boolean(this.plugin.getCurrentSelectionForActiveNote());
  }

  async loadCurrentNoteContext() {
    const context = await this.plugin.captureCurrentContext(false);
    await this.prepareContext(context);
    new Notice(context.path ? `Contexto cargado: ${context.path}` : "No he encontrado una nota Markdown abierta.");
  }

  async loadSelectionContext() {
    const context = await this.plugin.captureSelectionContext();
    if (!context?.selection) {
      const notePath = this.plugin.lastMarkdownFile?.path || this.plugin.refreshLastMarkdownView()?.file?.path || "";
      new Notice(
        notePath
          ? `No hay una selección activa válida en esta nota: ${notePath}`
          : "No he encontrado una nota Markdown abierta."
      );
      this.renderQuickActions();
      return;
    }
    await this.prepareContext(context);
    new Notice(`Selección cargada desde ${context.path}`);
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
    this.threadId = null;
    this.messages = [];
    this.plugin.setLastResponse(null);
    this.renderMessages();
    new Notice("Chat nuevo preparado.");
  }

  openActionsMenu(event) {
    const menu = new Menu();
    menu.addItem((item) =>
      item.setTitle("Ver memoria usada").setIcon("database").onClick(async () => {
        await this.plugin.showMemoryUsed();
      })
    );
    menu.addItem((item) =>
      item.setTitle(this.plugin.isMobileRuntime() ? "Configurar backend remoto" : "Configurar Codex OAuth").setIcon("key").onClick(() => {
        new CodexSetupModal(this.app, this.plugin).open();
      })
    );
    menu.addItem((item) =>
      item.setTitle(this.plugin.isMobileRuntime() ? "Comprobar backend" : "Recomprobar Codex").setIcon("refresh-cw").onClick(async () => {
        await this.plugin.autoCheckCodexSetup({ notify: true });
        this.renderHeader();
      })
    );
    menu.addItem((item) =>
      item.setTitle("Diagnóstico de consistencia").setIcon("shield-alert").onClick(async () => {
        await this.plugin.openConsistencyDiagnostics();
      })
    );
    menu.addSeparator();
    menu.addItem((item) =>
      item.setTitle("Abrir ajustes del plugin").setIcon("settings").onClick(() => {
        this.plugin.openPluginSettings();
      })
    );
    menu.showAtMouseEvent(event);
  }

  createContextItem(parentEl, label, value, state = "") {
    const itemEl = parentEl.createDiv({ cls: `obsidian-codex-context-item ${state}`.trim() });
    itemEl.createDiv({ cls: "obsidian-codex-context-label", text: label });
    itemEl.createDiv({ cls: "obsidian-codex-context-value", text: value });
  }

  getContextSummary() {
    const note = this.context?.title || this.plugin.lastMarkdownFile?.basename || "sin nota";
    const referenceCount = this.context?.references?.length || 0;
    const selection = this.context?.selection ? "con selección" : "sin selección";
    const referenceLabel = `${referenceCount} ${referenceCount === 1 ? "referencia" : "referencias"}`;
    return `${note} · ${referenceLabel} · ${selection}`;
  }

  renderContext() {
    this.contextEl.empty();
    const summaryEl = this.contextEl.createDiv({ cls: "obsidian-codex-context-summary" });
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
    const summaryTextEl = summaryEl.createDiv({ cls: "obsidian-codex-context-line" });
    const noteReady = Boolean(this.context?.path || this.plugin.lastMarkdownFile);
    const referenceReady = Boolean(this.context?.references?.length);
    const selectionReady = Boolean(this.context?.selection);
    const indicators = [
      ["file-text", noteReady, "Cargar nota actual", async () => this.loadCurrentNoteContext()],
      ["at-sign", referenceReady, "Referenciar nota con @", () => this.insertMentionTrigger()],
      ["text-select", selectionReady, "Cargar selección", async () => this.loadSelectionContext()]
    ];
    for (const [icon, ready, label, handler] of indicators) {
      const indicatorEl = summaryTextEl.createEl("button", {
        cls: ready ? "obsidian-codex-context-icon is-ready" : "obsidian-codex-context-icon",
        attr: { "aria-label": label, title: label }
      });
      setIcon(indicatorEl, icon);
      indicatorEl.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await handler();
      });
    }
    summaryTextEl.createSpan({ cls: "obsidian-codex-context-kicker", text: this.context?.path ? "Contexto activo" : "Contexto" });
    summaryTextEl.createSpan({ cls: "obsidian-codex-context-text", text: this.getContextSummary() });
    const toggleButton = this.createIconButton(
      summaryEl,
      this.contextExpanded ? "chevron-down" : "chevron-right",
      this.contextExpanded ? "Ocultar detalles de contexto" : "Ver detalles de contexto",
      "obsidian-codex-context-toggle"
    );
    toggleButton.setAttribute("aria-expanded", String(this.contextExpanded));
    toggleButton.createSpan({
      cls: "obsidian-codex-context-toggle-label",
      text: this.contextExpanded ? "Ocultar" : "Detalles"
    });
    toggleButton.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleContext();
    });

    if (!this.contextExpanded) {
      return;
    }

    if (!this.context) {
      const lastNote = this.plugin.lastMarkdownFile?.path || "(ninguna detectada)";
      this.contextEl.createDiv({ cls: "obsidian-codex-context-title", text: "Contexto pendiente" });
      this.contextEl.createDiv({
        cls: "obsidian-codex-context-help",
        text: `Última nota vista: ${lastNote}. Usa @NombreNota o las acciones rápidas para anclar el contexto.`
      });
      return;
    }

    const references = this.context.references || [];
    const mentions = references.filter((reference) => reference.source === "mention").length;
    const linked = references.filter((reference) => reference.source === "outgoing-link").length;
    const folders = references.filter((reference) => reference.source === "folder").length;
    const referenceSummary = references.length
      ? `${references.length} cargadas (${mentions} @, ${linked} enlaces, ${folders} carpeta)`
      : "(ninguna)";
    const selectionSummary = this.context.selection
      ? `${this.context.selection.length} caracteres seleccionados`
      : "(ninguna)";
    const outgoingSummary = this.context.outgoingLinks?.length
      ? `${this.context.outgoingLinks.length}: ${this.context.outgoingLinks.slice(0, 4).join(", ")}${
          this.context.outgoingLinks.length > 4 ? "..." : ""
        }`
      : "(ninguno)";

    this.contextEl.createDiv({ cls: "obsidian-codex-context-title", text: "Contexto que se enviará" });
    const gridEl = this.contextEl.createDiv({ cls: "obsidian-codex-context-grid" });
    this.createContextItem(gridEl, "Nota", this.context.path || "(ninguna)", this.context.path ? "is-ready" : "");
    this.createContextItem(gridEl, "Selección", selectionSummary, this.context.selection ? "is-ready" : "");
    this.createContextItem(gridEl, "Enlaces salientes", outgoingSummary, this.context.outgoingLinks?.length ? "is-ready" : "");
    this.createContextItem(gridEl, "Referencias", referenceSummary, references.length ? "is-ready" : "");

    if (references.length) {
      this.contextEl.createDiv({
        cls: "obsidian-codex-context-help",
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
        cls: "obsidian-codex-empty-state",
        text: "La conversación aparecerá aquí. El chat prioriza el contexto de la nota activa y sus referencias."
      });
      return;
    }

    for (const message of this.messages) {
      const isAssistant = message.role === "assistant";
      const messageEl = this.messagesEl.createDiv({
        cls: `obsidian-codex-message ${isAssistant ? "is-assistant" : "is-user"}`
      });
      const headerEl = messageEl.createDiv({ cls: "obsidian-codex-message-header" });
      const metaEl = headerEl.createDiv({ cls: "obsidian-codex-message-meta" });
      metaEl.createDiv({
        cls: "obsidian-codex-role",
        text: isAssistant ? "Codex" : "Tú"
      });
      if (message.meta?.label) {
        metaEl.createDiv({ cls: "obsidian-codex-message-chip", text: message.meta.label });
      }
      if (isAssistant && !message.meta?.loading && message.content) {
        const actionsEl = headerEl.createDiv({ cls: "obsidian-codex-message-actions" });
        const copyButton = this.createIconButton(actionsEl, "copy", "Copiar esta respuesta", "obsidian-codex-message-action");
        copyButton.addEventListener("click", async () => {
          await navigator.clipboard.writeText(message.content);
          new Notice("Respuesta copiada.");
        });
        const insertButton = this.createIconButton(actionsEl, "corner-down-left", "Insertar esta respuesta", "obsidian-codex-message-action");
        insertButton.addEventListener("click", async () => {
          await this.insertTextIntoActiveNote(message.content);
        });
        const useButton = this.createIconButton(actionsEl, "message-square-plus", "Usar como contexto", "obsidian-codex-message-action");
        useButton.addEventListener("click", () => {
          this.appendToComposer(`Contexto de respuesta anterior:\n${message.content}`);
        });
      }
      const bodyEl = messageEl.createDiv({ cls: "obsidian-codex-message-body" });
      if (message.meta?.loading) {
        bodyEl.createDiv({ cls: "obsidian-codex-loading", text: message.meta.status || "Preparando respuesta" });
        bodyEl.createDiv({ cls: "obsidian-codex-loading-bar" });
      } else if (isAssistant) {
        void this.renderAssistantMessage(bodyEl, message.content);
      } else {
        bodyEl.setText(message.content);
      }
      if (message.meta?.detail) {
        const footerEl = messageEl.createDiv({ cls: "obsidian-codex-message-detail" });
        footerEl.createSpan({ cls: "obsidian-codex-message-detail-text", text: message.meta.detail });
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
      new Notice("Abre una nota editable antes de insertar la respuesta.");
      return;
    }
    view.editor.replaceRange(`\n\n${content}\n`, view.editor.getCursor());
    new Notice("Respuesta insertada en la nota.");
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
        cls: `suggestion-item obsidian-codex-suggestion-item${index === this.mentionState.selectedIndex ? " is-selected" : ""}`
      });

      itemEl.createDiv({
        cls: "suggestion-title",
        text: file.basename
      });
      itemEl.createDiv({
        cls: "suggestion-note obsidian-codex-suggestion-note",
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
      ? "Codex local"
      : rawProvider === "heuristic-fallback"
        ? "Respaldo servidor"
        : rawProvider === "codex-cli"
        ? "Codex OAuth"
        : "Servidor";
    const detailParts = [
      `${runOptions.effort === "fast" ? "Rápido" : "Pensar"}`,
      `${workModeLabel(runOptions.interactionMode)}`,
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
      new Notice("Escribe un mensaje antes de enviar.");
      return;
    }
    if (this.isSending) {
      return;
    }

    this.appendMessage("user", message);
    this.inputEl.value = "";
    this.autoResizeInput();
    this.hideMentionSuggestions();
    this.setSending(true);

    const startedAt = Date.now();
    const activeWorkMode = this.plugin.settings.defaultInteractionMode || DEFAULT_SETTINGS.defaultInteractionMode;
    const pendingId = this.appendMessage("assistant", "", {
      loading: true,
      label: workModeDetail(activeWorkMode),
      status: "Enviando mensaje al agente"
    });
    this.lastPendingStatus = "Enviando mensaje al agente";
    if (!this.context?.path && !this.context?.references?.length) {
      this.setPendingStatus(pendingId, "Preparando contexto");
      this.context = await this.plugin.captureCurrentContext(false);
      this.renderHeader();
      this.renderQuickActions();
      this.renderContext();
    }
    try {
      const runOptions = this.plugin.getRunOptions(this.context || {}, message);
      const folderStatus = this.getFolderReviewStatus(message, this.context || {});
      if (folderStatus) {
        this.setPendingStatus(pendingId, folderStatus);
      }
      this.setPendingStatus(pendingId, "Codex está pensando");
      const response = await this.plugin.sendMessageToAgent(this.threadId, message, this.context || {}, runOptions);
      const isFallback = response.localFallback || response.raw?.provider === "heuristic-fallback";
      this.setPendingStatus(pendingId, "Codex está preparando la respuesta", {
        detail:
          runOptions.interactionMode === "execute"
            ? "Sin restricciones activo: si hay cambios, se ejecutarán sin pedir confirmación adicional."
            : isFallback
              ? "El backend no respondió; se ha usado el modo local."
              : ""
      });
      await this.waitForMinimumDuration(startedAt, isFallback ? this.plugin.settings.localFallbackDelayMs : 350);
      this.threadId = response.threadId;
      this.context = response.context || this.context;
      this.renderHeader();
      this.renderQuickActions();
      this.renderContext();
      this.updateMessage(pendingId, response.answer, {
        loading: false,
        ...this.responseMetaFor(response, Date.now() - startedAt, runOptions)
      });
      this.plugin.setLastResponse(response);

      if (response.unresolvedReferences?.length) {
        new Notice(`No he podido resolver estas referencias @: ${response.unresolvedReferences.join(", ")}`);
      }

      if (response.security?.redacted) {
        new Notice(
          `Se han redactado datos sensibles antes de persistir o reenviar contexto: ${response.security.detectedTypes.join(", ")}`
        );
      }
    } catch (error) {
      this.updateMessage(pendingId, `Error: ${error.message}`, {
        loading: false,
        label: "Error",
        detail: `Fase: ${this.lastPendingStatus || "desconocida"} · La respuesta no se ha persistido como salida válida.`
      });
      new Notice(`No se pudo completar la petición: ${error.message}`);
    } finally {
      this.setSending(false);
    }
  }
}

class ConsistencyDiagnosticsModal extends Modal {
  constructor(app, report) {
    super(app);
    this.report = report;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("obsidian-codex-setup-modal");
    contentEl.createEl("h3", { text: "Diagnóstico de consistencia" });
    contentEl.createEl("p", {
      text: this.report.summary
    });

    if (this.report.items.length) {
      const list = contentEl.createEl("ul");
      for (const item of this.report.items) {
        list.createEl("li", { text: `${item.severity.toUpperCase()}: ${item.message}` });
      }
    } else {
      contentEl.createEl("p", { text: "No se han detectado incidencias de consistencia." });
    }
  }
}

class AgentMemorySettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h3", { text: "Conexión y seguridad" });

    new Setting(containerEl)
      .setName("Backend URL")
      .setDesc("Dirección del backend central. Si falla y el backend es local, el plugin intentará usar un modo local directo.")
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
      .setName("Device ID")
      .setDesc("Identificador estable local para este equipo. No se sincroniza por Obsidian Sync.")
      .addText((text) =>
        text.setValue(this.plugin.settings.deviceId).onChange(async (value) => {
          this.plugin.settings.deviceId = value.trim();
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Allow remote backend")
      .setDesc("Déjalo desactivado salvo que vayas a usar un backend remoto por HTTPS bajo tu control.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.allowRemoteBackend).onChange(async (value) => {
          this.plugin.settings.allowRemoteBackend = value;
          await this.plugin.saveSettings();
        })
      );

    containerEl.createEl("h3", { text: "Respuesta" });

    new Setting(containerEl)
      .setName("Modo de trabajo por defecto")
      .setDesc("Planificador actúa como copiloto sin modificar nada por su cuenta. Ejecutar trabaja sin pedir permisos adicionales y exige backups previos si toca archivos.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("plan", "Planificador")
          .addOption("execute", "Ejecutar")
          .setValue(this.plugin.settings.defaultInteractionMode || DEFAULT_SETTINGS.defaultInteractionMode)
          .onChange(async (value) => {
            this.plugin.settings.defaultInteractionMode = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Mostrar diagnóstico en el panel")
      .setDesc("Muestra backend, dispositivo y contexto actual en la cabecera del chat.")
      .addToggle((toggle) =>
        toggle.setValue(Boolean(this.plugin.settings.showDiagnostics)).onChange(async (value) => {
          this.plugin.settings.showDiagnostics = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Notas máximas al resumir una carpeta")
      .setDesc("Límite de notas que se añaden como contexto al pedir resúmenes de carpetas como 200 Proyectos.")
      .addText((text) =>
        text.setValue(String(this.plugin.settings.maxFolderReferences || DEFAULT_SETTINGS.maxFolderReferences)).onChange(async (value) => {
          const numeric = Number(value);
          this.plugin.settings.maxFolderReferences =
            Number.isFinite(numeric) && numeric >= 3 && numeric <= 80 ? numeric : DEFAULT_SETTINGS.maxFolderReferences;
          await this.plugin.saveSettings();
        })
      );

    containerEl.createEl("h3", { text: "System Prompt" });
    containerEl.createEl("p", {
      text: "Estas secciones se combinan en orden fijo y se comparten entre equipos mediante data.json."
    });

    const promptFieldMeta = [
      ["role", "Rol", "Identidad base y ámbito del agente dentro de la vault."],
      ["context", "Contexto", "Cómo debe priorizar nota activa, referencias, memoria y sesiones."],
      ["behavior", "Comportamiento", "Criterios de respuesta, tono operativo y nivel de iniciativa."],
      ["safety", "Seguridad", "Límites al tratar datos sensibles, acciones riesgosas o persistencia."],
      ["output", "Salida", "Formato y estilo esperados en las respuestas."],
      ["memory", "Memoria", "Cómo utilizar la memoria compartida sin sobreconfiar en ella."]
    ];

    for (const [key, name, description] of promptFieldMeta) {
      new Setting(containerEl)
        .setName(name)
        .setDesc(description)
        .addTextArea((text) => {
          text.setValue(this.plugin.settings.systemPromptSections?.[key] || "");
          text.inputEl.rows = 4;
          text.inputEl.addClass("obsidian-codex-settings-textarea");
          text.onChange(async (value) => {
            this.plugin.settings.systemPromptSections = {
              ...normalizeSystemPromptSections(this.plugin.settings.systemPromptSections),
              [key]: value
            };
            await this.plugin.saveSettings();
          });
        });
    }

    containerEl.createEl("h3", { text: "Escala del plugin" });

    new Setting(containerEl)
      .setName("Escala visual")
      .setDesc("Escala propia del panel. También puedes usar Ctrl/Cmd +, Ctrl/Cmd - y Ctrl/Cmd 0 dentro del chat.")
      .addText((text) => {
        text.setPlaceholder("1.0").setValue(this.plugin.getUiScale().toFixed(2));
        text.onChange(async (value) => {
          const numeric = Number(String(value).replace(",", "."));
          await this.plugin.setUiScale(Number.isFinite(numeric) ? numeric : DEFAULT_SETTINGS.uiScale);
          this.display();
        });
      })
      .addButton((button) =>
        button.setButtonText("Reset 100%").onClick(async () => {
          await this.plugin.resetUiScale();
          this.display();
        })
      );

    containerEl.createEl("h3", { text: "Avanzado local" });

    new Setting(containerEl)
      .setName("Local bootstrap token")
      .setDesc("Solo para pruebas locales rápidas cuando SecretStorage no tenga token. No se sincroniza.")
      .addText((text) =>
        text.setValue(this.plugin.settings.localBootstrapToken || "").onChange(async (value) => {
          this.plugin.settings.localBootstrapToken = value.trim();
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Local backend bootstrap script")
      .setDesc("Script local que el plugin puede lanzar si el backend en localhost no está activo. No se sincroniza.")
      .addText((text) =>
        text.setValue(this.plugin.settings.localBackendBootstrapScript || "").onChange(async (value) => {
          this.plugin.settings.localBackendBootstrapScript = value.trim();
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Local Codex command")
      .setDesc("Comando local de Codex. Usa `codex` para el CLI oficial instalado por npm; evita rutas WindowsApps si dan permisos denegados. No se sincroniza.")
      .addText((text) =>
        text.setValue(this.plugin.settings.localCodexCommand || "").onChange(async (value) => {
          this.plugin.settings.localCodexCommand = value.trim();
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Codex OAuth")
      .setDesc(`Estado: ${this.plugin.settings.codexStatus || "No comprobado"}${this.plugin.settings.codexVersion ? ` · ${this.plugin.settings.codexVersion}` : ""}`)
      .addButton((button) =>
        button.setButtonText("Abrir asistente").onClick(() => {
          new CodexSetupModal(this.app, this.plugin).open();
        })
      )
      .addButton((button) =>
        button.setButtonText("Comprobar").onClick(async () => {
          await this.plugin.checkCodexStatus();
          this.display();
        })
      );

    if (SecretComponent) {
      new Setting(containerEl)
        .setName("Token secret")
        .setDesc("Nombre local del secreto en SecretStorage que contiene el token del dispositivo. No se sincroniza.")
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
        .setName("Token secret")
        .setDesc("Nombre local del secreto en SecretStorage. No se sincroniza.")
        .addText((text) =>
          text.setValue(this.plugin.settings.deviceTokenSecretName).onChange(async (value) => {
            this.plugin.settings.deviceTokenSecretName = value.trim();
            await this.plugin.saveSettings();
          })
        );
    }

    new Setting(containerEl)
      .setName("Max context chars")
      .setDesc("Número máximo de caracteres de la nota activa que se enviarán al agente en cada consulta.")
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

module.exports = class AgentMemorySyncPlugin extends Plugin {
  async onload() {
    await this.loadSettings();
    this.lastResponse = null;
    this.lastMarkdownView = null;
    this.lastMarkdownFile = null;
    this.lastEditorSelection = null;
    this.normalizePortableSettings();
    if (this.hasLegacySharedLocalSettings) {
      await this.saveSettings();
    }

    this.registerView(VIEW_TYPE, (leaf) => new AgentMemoryView(leaf, this));
    this.addSettingTab(new AgentMemorySettingTab(this.app, this));

    this.addRibbonIcon("bot", "Open Obsidian-Codex chat", async () => {
      await this.activateView();
    });

    this.addCommand({
      id: "open-agent-sidebar",
      name: "Open agent sidebar",
      callback: async () => {
        await this.activateView();
      }
    });

    this.addCommand({
      id: "ask-about-current-note",
      name: "Preguntar sobre nota actual",
      callback: async () => {
        const context = await this.captureCurrentContext(false);
        const view = await this.activateView();
        await view.prepareContext(context);
      }
    });

    this.addCommand({
      id: "ask-about-selection",
      name: "Preguntar sobre selección",
      editorCallback: async () => {
        const context = await this.captureSelectionContext();
        if (!context?.selection) {
          new Notice("No hay una selección activa válida en esta nota.");
          return;
        }
        const view = await this.activateView();
        await view.prepareContext(context);
      }
    });

    this.addCommand({
      id: "insert-last-response",
      name: "Insertar respuesta en la nota",
      editorCallback: async () => {
        await this.insertLastResponseIntoNote();
      }
    });

    this.addCommand({
      id: "view-memory-used",
      name: "Ver memoria usada para la última respuesta",
      callback: async () => {
        await this.showMemoryUsed();
      }
    });

    this.addCommand({
      id: "open-codex-setup",
      name: "Configurar Codex OAuth",
      callback: () => {
        new CodexSetupModal(this.app, this).open();
      }
    });

    this.addCommand({
      id: "run-consistency-diagnostics",
      name: "Diagnóstico de consistencia de Obsidian-Codex",
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

    this.registerDomEvent(document, "selectionchange", () => {
      this.rememberCurrentSelection();
    });

    this.app.workspace.onLayoutReady(async () => {
      this.refreshLastMarkdownView();
      if (this.isMobileRuntime()) {
        await this.checkRemoteBackendForMobile({ notify: false });
        if (!this.canUseRemoteBackend()) {
          new CodexSetupModal(this.app, this).open();
        }
        return;
      }
      const status = await this.autoCheckCodexSetup({ notify: false });
      if (!status.ready) {
        new CodexSetupModal(this.app, this).open();
      }
    });
  }

  async onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
  }

  async loadSettings() {
    const currentShared = Object.assign({}, await this.loadData());
    const legacyShared = await this.loadLegacySharedSettings(currentShared);
    const shared = Object.assign({}, legacyShared, currentShared);
    const local = await this.loadLocalRuntimeState(shared);
    this.settings = Object.assign({}, DEFAULT_SETTINGS, shared, local);
    this.settings.systemPromptSections = normalizeSystemPromptSections(this.settings.systemPromptSections);
    this.settings.uiScale = clampUiScale(this.settings.uiScale);
    this.normalizePortableSettings();
  }

  async loadLegacySharedSettings(currentShared = {}) {
    const hasCurrentShared = SHARED_SETTING_KEYS.some((key) =>
      Object.prototype.hasOwnProperty.call(currentShared, key)
    );
    if (hasCurrentShared || !fs || !path) {
      return {};
    }

    const vaultRoot = this.getVaultRoot();
    if (!vaultRoot) {
      return {};
    }

    try {
      const legacyPath = path.join(vaultRoot, ".obsidian", "plugins", LEGACY_PLUGIN_ID, "data.json");
      const parsed = JSON.parse(await fs.readFile(legacyPath, "utf8"));
      const legacyShared = {};
      for (const key of SHARED_SETTING_KEYS) {
        if (Object.prototype.hasOwnProperty.call(parsed, key)) {
          legacyShared[key] = parsed[key];
        }
      }
      return legacyShared;
    } catch {
      return {};
    }
  }

  async saveSettings() {
    this.settings.systemPromptSections = normalizeSystemPromptSections(this.settings.systemPromptSections);
    this.settings.uiScale = clampUiScale(this.settings.uiScale);
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
    return os?.tmpdir ? path.join(os.tmpdir(), "obsidian-codex") : "";
  }

  async loadLocalRuntimeState(sharedSettings = {}) {
    const localStatePath = this.getLocalStatePath();
    const legacyLocalStatePath = this.getLocalStatePath(LEGACY_PLUGIN_ID);
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
      this.hasLegacySharedLocalSettings = migrated;
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

    if (!Object.keys(localState).length && legacyLocalStatePath && legacyLocalStatePath !== localStatePath) {
      try {
        await mergeLocalStateFile(legacyLocalStatePath);
        migrated = true;
      } catch {
        // No legacy local state to migrate.
      }
    }

    this.hasLegacySharedLocalSettings = migrated;
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
      ? "Modo móvil listo para backend remoto HTTPS."
      : "Modo móvil: requiere backend remoto HTTPS.";
  }

  async checkRemoteBackendForMobile(options = {}) {
    if (!this.isMobileRuntime()) {
      return this.autoCheckCodexSetup(options);
    }
    const notify = options.notify !== false;
    try {
      if (!this.canUseRemoteBackend()) {
        throw new Error("Configura un backend remoto HTTPS y activa backends remotos. En móvil no se admite localhost ni Codex CLI local.");
      }
      const health = await requestUrl({
        url: `${this.settings.backendUrl.replace(/\/$/, "")}/health`,
        method: "GET"
      });
      const ok = health.status < 400;
      this.settings.codexSetupCompleted = ok;
      this.settings.codexStatus = ok ? "Backend remoto HTTPS disponible." : `Backend remoto respondió HTTP ${health.status}.`;
      this.settings.codexLastCheck = new Date().toISOString();
      await this.saveSettings();
      if (notify) {
        new Notice(ok ? "Backend remoto disponible." : "El backend remoto no está listo.");
      }
      return ok;
    } catch (error) {
      this.settings.codexSetupCompleted = false;
      this.settings.codexStatus = `Modo móvil no disponible: ${error.message}`;
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
      new Notice("Abre los ajustes de Obsidian y selecciona Obsidian-Codex.");
    }
  }

  async openConsistencyDiagnostics() {
    const report = await this.collectConsistencyDiagnostics();
    new ConsistencyDiagnosticsModal(this.app, report).open();
  }

  async collectConsistencyDiagnostics() {
    const items = [];
    const shared = Object.assign({}, await this.loadData());
    for (const key of LOCAL_SETTING_KEYS) {
      if (Object.prototype.hasOwnProperty.call(shared, key)) {
        items.push({
          severity: "warn",
          message: `\`.obsidian/plugins/obsidian-codex/data.json\` aún contiene \`${key}\`, que debería ser local y no sincronizarse.`
        });
      }
    }

    const vaultRoot = this.getVaultRoot();
    if (!vaultRoot || !fs || !path) {
      return {
        summary: items.length ? `Se han detectado ${items.length} incidencias.` : "Diagnóstico local no disponible en este entorno.",
        items
      };
    }

    const duplicateCount = await this.countDuplicateSessions(vaultRoot);
    if (duplicateCount > 0) {
      items.push({
        severity: "warn",
        message: `Hay ${duplicateCount} sesiones duplicadas lógicamente por conflictos de Sync en \`_agent/sessions\`.`
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
        message: "Se han reseteado rutas locales no portables al cargar este equipo."
      });
    }

    return {
      summary: items.length
        ? `Se han detectado ${items.length} incidencias o avisos de consistencia.`
        : "No se han detectado incidencias de consistencia.",
      items
    };
  }

  async countDuplicateSessions(vaultRoot) {
    const sessionsRoot = path.join(vaultRoot, "_agent", "sessions");
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
    for (const category of MEMORY_CATEGORIES) {
      const filePath = path.join(vaultRoot, "_agent", "memory", `${category}.md`);
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
          message: `\`_agent/memory/${category}.md\` sigue en esquema antiguo y se leerá en modo compatible.`
        });
      }
      if (sanitization.issues.length) {
        issues.push({
          severity: "warn",
          message: `\`_agent/memory/${category}.md\` contiene ${sanitization.issues.length} entradas no canónicas que el plugin ignorará al usar memoria compartida.`
        });
      }
    }
    return issues;
  }

  async collectIndexIssues(vaultRoot) {
    const issues = [];
    const indexRoot = path.join(vaultRoot, "_agent", "index");
    try {
      const entries = await fs.readdir(indexRoot, { withFileTypes: true });
      if (!entries.length) {
        issues.push({
          severity: "info",
          message: "`_agent/index` está vacío o no se está usando todavía."
        });
      }
    } catch {
      issues.push({
        severity: "warn",
        message: "`_agent/index` no existe o no se puede leer."
      });
    }
    return issues;
  }

  async collectOutboxIssues(vaultRoot) {
    const issues = [];
    const outboxRoot = path.join(vaultRoot, "_agent", "outbox");
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
        message: `\`_agent/outbox\` conserva ${staleCount} temporales con más de 24h.`
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
    const foreignWindowsUserPath =
      isForeignWindowsUserPath(current);
    if (current.includes("\\windowsapps\\") || current.endsWith("\\codex.exe") || foreignWindowsUserPath) {
      this.settings.localCodexCommand = "codex";
      this.localStatePortabilityReset = true;
    }
  }

  normalizeLocalBackendBootstrapScript() {
    if (isForeignWindowsUserPath(this.settings.localBackendBootstrapScript)) {
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

  rememberCurrentSelection() {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    const view = activeView || this.lastMarkdownView;
    const file = activeView?.file || view?.file || this.lastMarkdownFile;
    if (!file) {
      return;
    }

    let selection = "";
    try {
      selection = view?.editor?.getSelection?.() || "";
    } catch {
      selection = "";
    }

    if (!selection) {
      if (!activeView?.file) {
        return;
      }
      const domSelection = window.getSelection?.();
      const anchorNode = domSelection?.anchorNode;
      const anchorEl = anchorNode?.nodeType === Node.ELEMENT_NODE ? anchorNode : anchorNode?.parentElement;
      if (anchorEl?.closest?.(".obsidian-codex-view, .modal")) {
        return;
      }
      selection = domSelection?.toString?.() || "";
    }

    selection = String(selection || "").trim();
    if (!selection) {
      return;
    }

    this.lastEditorSelection = {
      text: selection,
      path: file.path,
      title: file.basename,
      capturedAt: Date.now()
    };
  }

  getCachedSelectionForCurrentNote() {
    const view = this.refreshLastMarkdownView();
    const file = view?.file || this.lastMarkdownFile || this.lastMarkdownView?.file;
    return file ? this.getCachedSelectionForFile(file.path) : "";
  }

  getCurrentSelectionForFile(filePath) {
    const view = this.refreshLastMarkdownView();
    const directSelection =
      view?.file?.path === filePath ? String(view?.editor?.getSelection?.() || "").trim() : "";
    if (directSelection) {
      return directSelection;
    }
    return this.getCachedSelectionForFile(filePath);
  }

  getCurrentSelectionForActiveNote() {
    const view = this.refreshLastMarkdownView();
    const file = view?.file || this.lastMarkdownFile || this.lastMarkdownView?.file;
    return file ? this.getCurrentSelectionForFile(file.path) : "";
  }

  getCachedSelectionForFile(filePath) {
    const cached = this.lastEditorSelection;
    const maxAgeMs = 15 * 60 * 1000;
    if (!cached?.text || cached.path !== filePath || Date.now() - cached.capturedAt > maxAgeMs) {
      return "";
    }
    return cached.text;
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
    const modeLines =
      runOptions.interactionMode === "execute"
        ? [
            "[work-mode]",
            "Modo de trabajo activo: Ejecutar / Sin restricciones.",
            "Puedes actuar sin pedir permiso adicional, pero antes de editar o borrar cualquier archivo o nota debes crear una copia de seguridad del archivo afectado.",
            backupRoot
              ? `Guarda esas copias dentro de: ${backupRoot} preservando la ruta relativa del archivo dentro de la vault.`
              : "Guarda esas copias dentro de una carpeta de backup de la sesion preservando la ruta relativa del archivo dentro de la vault.",
            "Si no puedes crear la copia previa, no modifiques ni borres el archivo y explica el bloqueo."
          ]
        : [
            "[work-mode]",
            "Modo de trabajo activo: Planificador / Copiloto.",
            "No modifiques, borres, renombres ni reescribas archivos de la vault salvo que el usuario lo pida de forma clara y explícita."
          ];
    return [basePrompt, modeLines.join("\n")].filter(Boolean).join("\n\n").trim();
  }

  getUiScale() {
    return clampUiScale(this.settings.uiScale);
  }

  getOpenAgentViews() {
    return this.app.workspace
      .getLeavesOfType(VIEW_TYPE)
      .map((leaf) => leaf.view)
      .filter((view) => view instanceof AgentMemoryView);
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
      new Notice("Todavía no hay una respuesta para copiar.");
      return;
    }
    await navigator.clipboard.writeText(this.lastResponse.answer);
    new Notice("Respuesta copiada.");
  }

  async runPowerShell(command, timeout = 120000) {
    if (!this.canUseLocalCodex()) {
      throw new Error("Codex CLI local solo está disponible en escritorio.");
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
    const scriptRoot = this.getLocalTempDirectory() || (vaultRoot ? path.join(vaultRoot, "_agent", "outbox") : os.tmpdir());
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
    const install = await this.checkCodexStatus({ notify: false });
    if (!install) {
      if (notify) {
        new Notice("Codex CLI no está instalado o no se puede ejecutar.");
      }
      return { ready: false, installed: false, login: false, execution: false };
    }

    const login = await this.checkCodexLoginStatus({ notify: false });
    if (!login) {
      this.settings.codexSetupCompleted = false;
      await this.saveSettings();
      if (notify) {
        new Notice("Codex CLI está instalado, pero falta OAuth.");
      }
      return { ready: false, installed: true, login: false, execution: false };
    }

    const execution = await this.testCodexExecution({ notify: false });
    const ready = Boolean(execution);
    this.settings.codexSetupCompleted = ready;
    if (ready) {
      this.settings.codexStatus = "Codex OAuth probado correctamente.";
    }
    await this.saveSettings();
    if (notify) {
      new Notice(ready ? "Codex está listo." : "Codex tiene OAuth, pero no ejecuta correctamente.");
    }
    return { ready, installed: true, login: true, execution: ready };
  }

  async checkCodexStatus(options = {}) {
    const notify = options.notify !== false;
    try {
      if (!this.canUseLocalCodex()) {
        throw new Error("Codex CLI local solo está disponible en escritorio.");
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
      this.settings.codexStatus = `Codex encontrado en ${parsed.Path || "PATH"}`;
      this.settings.codexLastCheck = new Date().toISOString();
      this.settings.codexInstalledOk = true;
      await this.saveSettings();
      if (notify) {
        new Notice("Codex CLI encontrado.");
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
        new Notice("Codex CLI no está listo. Usa Instalar/actualizar.");
      }
      return null;
    }
  }

  async checkCodexLoginStatus(options = {}) {
    const notify = options.notify !== false;
    try {
      if (!this.canUseLocalCodex()) {
        throw new Error("OAuth local solo está disponible en escritorio.");
      }
      const codexCommand = escapePowerShellSingleQuoted(this.settings.localCodexCommand || "codex");
      const output = await this.runPowerShell(`& '${codexCommand}' login status`, 30000);
      const loginOk = !/(not logged|not signed|no auth|login required|error loading configuration|not authenticated)/i.test(output);
      this.settings.codexLoginOk = loginOk;
      this.settings.codexStatus = loginOk ? "Codex OAuth detectado." : "Codex instalado, OAuth pendiente.";
      this.settings.codexLastCheck = new Date().toISOString();
      if (!loginOk) {
        this.settings.codexExecutionOk = false;
        this.settings.codexSetupCompleted = false;
      }
      await this.saveSettings();
      if (notify) {
        new Notice(loginOk ? "OAuth de Codex detectado." : "OAuth de Codex pendiente.");
      }
      return loginOk;
    } catch (error) {
      this.settings.codexLoginOk = false;
      this.settings.codexExecutionOk = false;
      this.settings.codexSetupCompleted = false;
      this.settings.codexStatus = `No se pudo comprobar OAuth: ${error.message}`;
      this.settings.codexLastCheck = new Date().toISOString();
      await this.saveSettings();
      if (notify) {
        new Notice("No se pudo comprobar OAuth de Codex.");
      }
      return false;
    }
  }

  async ensureCodexVaultTrust() {
    if (!this.canUseLocalCodex()) {
      throw new Error("La confianza de vault de Codex solo aplica en escritorio.");
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
      new Notice("En móvil/iOS no se puede instalar Codex CLI local. Configura un backend remoto HTTPS.");
      throw new Error("Codex CLI local no está disponible en móvil.");
    }
    new Notice("Instalando o actualizando Codex CLI. Puede tardar unos minutos.");
    try {
      const output = await this.runPowerShell("npm install -g @openai/codex", 300000);
      this.settings.codexStatus = "Codex CLI instalado/actualizado. Ejecuta la comprobación y después OAuth.";
      this.settings.codexLastCheck = new Date().toISOString();
      await this.saveSettings();
      new Notice("Codex CLI instalado o actualizado.");
      await this.checkCodexStatus();
      return output;
    } catch (error) {
      this.settings.codexStatus = `No se pudo instalar Codex: ${error.message}`;
      this.settings.codexLastCheck = new Date().toISOString();
      this.settings.codexSetupCompleted = false;
      await this.saveSettings();
      new Notice("No se pudo instalar Codex CLI desde Obsidian.");
      throw error;
    }
  }

  async launchCodexLogin() {
    if (!this.canUseLocalCodex()) {
      new Notice("En móvil/iOS no se puede iniciar OAuth local. Configura un backend remoto HTTPS.");
      throw new Error("OAuth local no está disponible en móvil.");
    }
    const codexCommand = escapePowerShellSingleQuoted(this.settings.localCodexCommand || "codex");
    const loginCommand = `& '${codexCommand}' login`;
    const command = `Start-Process -FilePath powershell.exe -ArgumentList @('-NoExit','-ExecutionPolicy','Bypass','-Command','${escapePowerShellSingleQuoted(loginCommand)}')`;
    await this.runPowerShell(command, 30000);
    this.settings.codexStatus = "OAuth lanzado. Completa el login en la ventana de terminal/navegador y después pulsa Probar Codex.";
    this.settings.codexLastCheck = new Date().toISOString();
    await this.saveSettings();
    new Notice("OAuth de Codex lanzado en una ventana externa.");
  }

  async testCodexExecution(options = {}) {
    const notify = options.notify !== false;
    if (!this.canUseLocalCodex()) {
      if (notify) {
        new Notice("En móvil/iOS no se puede probar Codex CLI local.");
      }
      throw new Error("Codex CLI local no está disponible en móvil.");
    }
    if (notify) {
      new Notice("Probando Codex con una petición mínima.");
    }
    try {
      await this.ensureCodexVaultTrust();
      const vaultRoot = this.getVaultRoot();
      const tempRoot = this.getLocalTempDirectory() || path.join(vaultRoot, "_agent", "outbox");
      const promptPath = path.join(tempRoot, `${makeId("codex_test")}.txt`);
      const outputPath = path.join(tempRoot, `${makeId("codex_test_result")}.txt`);
      await fs.mkdir(tempRoot, { recursive: true });
      await fs.writeFile(promptPath, "Responde exactamente: OK", "utf8");
      const output = await this.runPowerShellScript(
        buildCodexExecCommand({
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
          throw new Error(finalMessage || output || "Codex no devolvió OK.");
        }
      }
      await Promise.allSettled([fs.unlink(promptPath), fs.unlink(outputPath)]);
      this.settings.codexSetupCompleted = true;
      this.settings.codexLoginOk = true;
      this.settings.codexExecutionOk = true;
      this.settings.codexStatus = "Codex OAuth probado correctamente.";
      this.settings.codexLastCheck = new Date().toISOString();
      await this.saveSettings();
      if (notify) {
        new Notice("Codex OAuth funciona correctamente.");
      }
      return output;
    } catch (error) {
      this.settings.codexSetupCompleted = false;
      this.settings.codexExecutionOk = false;
      this.settings.codexStatus = `Codex no pudo ejecutar una prueba: ${error.message}`;
      this.settings.codexLastCheck = new Date().toISOString();
      await this.saveSettings();
      if (notify) {
        new Notice("Codex todavía no ejecuta correctamente.");
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

  async captureCurrentContext(includeSelection) {
    const view = this.refreshLastMarkdownView();
    const file = view?.file || this.lastMarkdownFile;
    if (!file) {
      return {
        path: "",
        title: "",
        content: "",
        selection: "",
        outgoingLinks: [],
        references: []
      };
    }

    const editor = view?.editor;
    const content = editor ? editor.getValue() : await this.app.vault.cachedRead(file);
    let selection = "";
    if (includeSelection) {
      this.rememberCurrentSelection();
      selection = editor ? editor.getSelection() : "";
      if (!selection) {
        selection = this.getCachedSelectionForFile(file.path);
      }
    }
    const outgoingLinks = this.extractOutgoingLinks(content);
    const references = await this.resolveOutgoingLinkReferences(outgoingLinks, file.path);

    return {
      path: file.path,
      title: file.basename,
      content: content.slice(0, this.settings.maxContextChars),
      selection,
      outgoingLinks,
      references
    };
  }

  async captureSelectionContext() {
    const context = await this.captureCurrentContext(false);
    if (!context.path) {
      return context;
    }
    const selection = this.getCurrentSelectionForFile(context.path);
    if (!selection) {
      return {
        ...context,
        selection: ""
      };
    }
    return {
      ...context,
      selection
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
      .filter((file) => !file.path.startsWith("_agent/"))
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
      if (!file || file.path === sourcePath || file.path.startsWith("_agent/")) {
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
        return left.file.path.localeCompare(right.file.path, "es", { sensitivity: "base" });
      })
      .slice(0, 8)
      .map((entry) => entry.file);
  }

  async getDeviceToken() {
    const getter =
      this.app.secretStorage && this.app.secretStorage.get
        ? this.app.secretStorage.get.bind(this.app.secretStorage)
        : null;

    if (getter) {
      const token = await Promise.resolve(getter(this.settings.deviceTokenSecretName));
      if (token) {
        return token;
      }
      if (this.settings.deviceTokenSecretName !== LEGACY_DEVICE_TOKEN_SECRET_NAME) {
        const legacyToken = await Promise.resolve(getter(LEGACY_DEVICE_TOKEN_SECRET_NAME));
        if (legacyToken) {
          return legacyToken;
        }
      }
    }

    if (this.isLocalBackendUrl(this.settings.backendUrl) && this.settings.localBootstrapToken) {
      return this.settings.localBootstrapToken;
    }

    throw new Error("No se encontró el token del dispositivo en SecretStorage ni en el token local de arranque.");
  }

  async apiRequest(method, endpoint, body) {
    if (this.isMobileRuntime() && !this.canUseRemoteBackend()) {
      throw new Error("Configura un backend remoto HTTPS y activa backends remotos para usar el plugin en móvil/iOS.");
    }
    await this.ensureLocalBackendRunning();
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

    if (!this.settings.localBackendBootstrapScript) {
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
    const parsed = new URL(value);
    const isLocal = this.isLocalBackendUrl(value);
    if (this.isMobileRuntime() && isLocal) {
      throw new Error("En móvil/iOS el backend debe ser remoto HTTPS; localhost no está disponible.");
    }
    if (isLocal) {
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error("El backend local debe usar http o https.");
      }
      return;
    }

    if (!this.settings.allowRemoteBackend) {
      throw new Error("Los backends remotos están desactivados por seguridad en la configuración del plugin.");
    }

    if (parsed.protocol !== "https:") {
      throw new Error("Un backend remoto debe usar HTTPS.");
    }
  }

  isLocalBackendUrl(value) {
    const parsed = new URL(value);
    return ["127.0.0.1", "localhost", "::1"].includes(parsed.hostname);
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
    const source = String(text || "").toLowerCase();
    const wantsProjectFolder =
      /(carpeta|folder|directorio).{0,30}proyectos/.test(source) ||
      /(todos|todas).{0,35}(archivos|notas).{0,35}proyectos/.test(source) ||
      /200\s+proyectos/.test(source);

    if (!wantsProjectFolder) {
      return [];
    }

    const existingPaths = new Set((existingReferences || []).map((reference) => reference.path));
    const files = this.app.vault
      .getMarkdownFiles()
      .filter((file) => file.path.startsWith("200 Proyectos/"))
      .filter((file) => !existingPaths.has(file.path))
      .sort((left, right) => {
        const leftIsProject = left.basename.startsWith("PRY-") ? 0 : 1;
        const rightIsProject = right.basename.startsWith("PRY-") ? 0 : 1;
        if (leftIsProject !== rightIsProject) {
          return leftIsProject - rightIsProject;
        }
        return left.path.localeCompare(right.path, "es", { sensitivity: "base" });
      })
      .slice(0, this.settings.maxFolderReferences || DEFAULT_SETTINGS.maxFolderReferences);

    const references = [];
    for (const file of files) {
      references.push(await this.buildReferenceFromFile(file, "folder", "200 Proyectos"));
    }

    return references;
  }

  async sendLocalMessage(threadId, message, context, runOptions) {
    if (!this.canUseLocalCodex()) {
      throw new Error("El respaldo local con Codex CLI solo está disponible en escritorio.");
    }
    const vaultRoot = this.getVaultRoot();
    if (!vaultRoot) {
      throw new Error("No he podido resolver la ruta local de la vault para usar el modo local.");
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
      selection: context.selection || "",
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
    const agentRoot = path.join(vaultRoot, "_agent");
    const memoryRoot = path.join(agentRoot, "memory");
    const sessionsRoot = path.join(agentRoot, "sessions");
    const outboxRoot = path.join(agentRoot, "outbox");
    const indexRoot = path.join(agentRoot, "index");

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
    const memoryRoot = path.join(vaultRoot, "_agent", "memory");
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
    const sessionsRoot = path.join(vaultRoot, "_agent", "sessions");
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
    const date = new Date(createdAt || new Date().toISOString());
    const year = String(date.getUTCFullYear());
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return path.join("_agent", "backups", year, month, day, `${threadId}-${sessionId}`).replaceAll("\\", "/");
  }

  async backupVaultFile(filePath, options = {}) {
    const normalizedPath = String(filePath || "").replaceAll("\\", "/").replace(/^\/+/, "");
    if (!normalizedPath) {
      throw new Error("No he podido resolver la ruta del archivo para crear la copia de seguridad.");
    }
    const vaultRoot = this.getVaultRoot();
    if (!vaultRoot) {
      throw new Error("No he podido resolver la ruta local de la vault para crear la copia de seguridad.");
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
          selection: context.selection || "",
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
    const tempRoot = this.getLocalTempDirectory() || path.join(vaultRoot, "_agent", "outbox");
    const promptPath = path.join(tempRoot, `${makeId("codex_prompt")}.txt`);
    const outputPath = path.join(tempRoot, `${makeId("codex_output")}.txt`);
    try {
      await this.ensureCodexVaultTrust();
      await fs.mkdir(path.dirname(promptPath), { recursive: true });
      await fs.writeFile(promptPath, prompt, "utf8");
      const command = buildCodexExecCommand({
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
        throw new Error("Codex no devolvió salida.");
      }

      return answer;
    } catch (error) {
      const detail = [error.message, error.stdout, error.stderr].filter(Boolean).join(" | ");
      const classified = classifyLocalCodexFailure(detail, { notePath: context.path || "" });
      throw new Error(
        `${classified} El backend no está accesible y el modo local tampoco ha podido usar Codex. Detalle: ${detail}`
      );
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
    const relativePath = path.join("_agent", "sessions", year, month, day, filename).replaceAll("\\", "/");
    const absolutePath = path.join(vaultRoot, relativePath);

    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(
      absolutePath,
      buildSessionMarkdown({
        ...session,
        schemaVersion: AGENT_SCHEMA_VERSION,
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
    const candidatesRoot = path.join(vaultRoot, "_agent", "index", "memory-candidates", year, month, day);
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
      new Notice("Todavía no hay una respuesta para insertar.");
      return;
    }

    const view = this.refreshLastMarkdownView();
    if (!view || !view.editor) {
      new Notice("Abre una nota editable antes de insertar la respuesta.");
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
        new Notice(`No se ha podido crear la copia previa de la nota: ${error.message}`);
        return;
      }
    }

    const insertion = `\n\n${this.lastResponse.answer}\n`;
    view.editor.replaceRange(insertion, view.editor.getCursor());
    new Notice("Respuesta insertada en la nota.");
  }

  async showMemoryUsed() {
    if (!this.lastResponse?.threadId) {
      new Notice("Todavía no hay una respuesta con contexto de memoria.");
      return;
    }

    if (this.lastResponse.localFallback) {
      new MemoryContextModal(this.app, {
        documents: this.lastResponse.memoryContext?.documents || [],
        recentSessions: []
      }).open();
      return;
    }

    try {
      const context = await this.apiRequest(
        "GET",
        `/memory/context/${encodeURIComponent(this.lastResponse.threadId)}`
      );
      new MemoryContextModal(this.app, context).open();
    } catch (error) {
      new Notice(`No se pudo cargar la memoria usada: ${error.message}`);
    }
  }
};
