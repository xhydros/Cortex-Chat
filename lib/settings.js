const { getDefaultSystemPromptSections, resolveLanguage } = require("./i18n");
const { normalizeFolderRoots } = require("./security");

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
