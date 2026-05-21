const { getDefaultSystemPromptSections, resolveLanguage, SUPPORTED_LANGUAGES } = require("./i18n");
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
  "maxFolderContextChars",
  "folderReferenceRoots",
  "systemPromptSections",
  "uiScale",
  "uiDensity",
  "tabBarPosition",
  "contextManifestEnabled",
  "contextIncludeActiveNote",
  "contextIncludeLinks",
  "contextIncludeMentions",
  "contextIncludeFolders",
  "contextIncludePinned",
  "contextIncludeMemory",
  "contextIncludeRecentSessions",
  "contextIncludeRag",
  "ragIndexEnabled",
  "ragIndexMaxNotes",
  "ragCandidateLimit",
  "contextExclusionPatterns",
  "approvedEditsOnly",
  "activePromptProfile",
  "skillsEnabled",
  "skillsRoot",
  "enabledSkillIds",
  "maxSkillContextChars",
  "mcpEnabled",
  "mcpServers",
  "mcpReadOnlyToolsOnly",
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
    maxFolderReferences: 80,
    maxFolderContextChars: 120000,
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
    uiDensity: "compact",
    tabBarPosition: "header",
    contextManifestEnabled: true,
    contextIncludeActiveNote: true,
    contextIncludeLinks: true,
    contextIncludeMentions: true,
    contextIncludeFolders: true,
    contextIncludePinned: true,
    contextIncludeMemory: true,
    contextIncludeRecentSessions: true,
    contextIncludeRag: false,
    ragIndexEnabled: true,
    ragIndexMaxNotes: 600,
    ragCandidateLimit: 5,
    contextExclusionPatterns: [],
    approvedEditsOnly: true,
    activePromptProfile: "planner",
    skillsEnabled: false,
    skillsRoot: "_cortex/skills",
    enabledSkillIds: [],
    maxSkillContextChars: 12000,
    mcpEnabled: false,
    mcpServers: [],
    mcpReadOnlyToolsOnly: true,
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

function normalizePromptText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function isSameSystemPromptSections(left, right) {
  const defaults = getDefaultSystemPromptSections("en");
  return Object.keys(defaults).every((key) => normalizePromptText(left?.[key]) === normalizePromptText(right?.[key]));
}

function isDefaultSystemPromptSections(value) {
  if (!value || typeof value !== "object") {
    return true;
  }
  return SUPPORTED_LANGUAGES.some((language) =>
    isSameSystemPromptSections(normalizeSystemPromptSections(value, language), getDefaultSystemPromptSections(language))
  );
}

function normalizeSystemPromptForLanguage(value, languageMode = "auto") {
  if (!value || isDefaultSystemPromptSections(value)) {
    return getDefaultSystemPromptSections(languageMode);
  }
  return normalizeSystemPromptSections(value, languageMode);
}

function normalizeLanguageMode(value) {
  return value === "es" || value === "en" || value === "auto" ? value : "auto";
}

function normalizeUiDensity(value) {
  return value === "comfortable" ? "comfortable" : "compact";
}

function normalizeTabBarPosition(value) {
  return value === "composer" ? "composer" : "header";
}

function normalizePromptProfile(value) {
  return ["researcher", "editor", "planner", "safe-executor"].includes(value) ? value : "planner";
}

function normalizeRagCandidateLimit(value, fallback = 5) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 && numeric <= 20 ? Math.round(numeric) : fallback;
}

function normalizeRagIndexMaxNotes(value, fallback = 600) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 50 && numeric <= 5000 ? Math.round(numeric) : fallback;
}

function normalizeMaxFolderReferences(value, fallback = 80) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 3 && numeric <= 300 ? Math.round(numeric) : fallback;
}

function normalizeMaxFolderContextChars(value, fallback = 120000) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 10000 && numeric <= 500000 ? Math.round(numeric) : fallback;
}

function normalizeSkillsRoot(value, fallback = "_cortex/skills") {
  const normalized = String(value || fallback)
    .replaceAll("\\", "/")
    .replace(/^\/+|\/+$/g, "")
    .trim();
  return normalized || fallback;
}

function normalizeSkillIds(value) {
  const source = Array.isArray(value) ? value : String(value || "").split(/[\n,]/);
  return Array.from(
    new Set(
      source
        .map((item) =>
          String(item || "")
            .replaceAll("\\", "/")
            .replace(/^\/+|\/+$/g, "")
            .trim()
        )
        .filter(Boolean)
    )
  ).slice(0, 80);
}

function normalizeMaxSkillContextChars(value, fallback = 12000) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 1000 && numeric <= 60000 ? Math.round(numeric) : fallback;
}

function normalizeMcpServers(value) {
  return Array.isArray(value)
    ? value
        .map((server) => ({
          id: String(server?.id || "").trim(),
          name: String(server?.name || "").trim(),
          url: String(server?.url || "").trim(),
          enabled: server?.enabled === true,
          readOnly: server?.readOnly !== false
        }))
        .filter((server) => server.id && server.url)
        .slice(0, 20)
    : [];
}

function normalizeExclusionPatterns(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 80);
  }
  return String(value || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 80);
}

function normalizeSettings(settings, defaults) {
  const next = { ...defaults, ...(settings || {}) };
  next.languageMode = normalizeLanguageMode(next.languageMode);
  next.uiDensity = normalizeUiDensity(next.uiDensity);
  next.tabBarPosition = normalizeTabBarPosition(next.tabBarPosition);
  next.contextManifestEnabled = next.contextManifestEnabled !== false;
  next.contextIncludeActiveNote = next.contextIncludeActiveNote !== false;
  next.contextIncludeLinks = next.contextIncludeLinks !== false;
  next.contextIncludeMentions = next.contextIncludeMentions !== false;
  next.contextIncludeFolders = next.contextIncludeFolders !== false;
  next.contextIncludePinned = next.contextIncludePinned !== false;
  next.contextIncludeMemory = next.contextIncludeMemory !== false;
  next.contextIncludeRecentSessions = next.contextIncludeRecentSessions !== false;
  next.contextIncludeRag = next.contextIncludeRag === true;
  next.maxFolderReferences = normalizeMaxFolderReferences(next.maxFolderReferences, defaults.maxFolderReferences);
  next.maxFolderContextChars = normalizeMaxFolderContextChars(next.maxFolderContextChars, defaults.maxFolderContextChars);
  next.ragIndexEnabled = next.ragIndexEnabled !== false;
  next.ragIndexMaxNotes = normalizeRagIndexMaxNotes(next.ragIndexMaxNotes, defaults.ragIndexMaxNotes);
  next.ragCandidateLimit = normalizeRagCandidateLimit(next.ragCandidateLimit, defaults.ragCandidateLimit);
  next.contextExclusionPatterns = normalizeExclusionPatterns(next.contextExclusionPatterns);
  next.approvedEditsOnly = next.approvedEditsOnly !== false;
  next.activePromptProfile = normalizePromptProfile(next.activePromptProfile);
  next.skillsEnabled = next.skillsEnabled === true;
  next.skillsRoot = normalizeSkillsRoot(next.skillsRoot, defaults.skillsRoot);
  next.enabledSkillIds = normalizeSkillIds(next.enabledSkillIds);
  next.maxSkillContextChars = normalizeMaxSkillContextChars(next.maxSkillContextChars, defaults.maxSkillContextChars);
  next.mcpEnabled = next.mcpEnabled === true;
  next.mcpServers = normalizeMcpServers(next.mcpServers);
  next.mcpReadOnlyToolsOnly = next.mcpReadOnlyToolsOnly !== false;
  next.systemPromptSections = normalizeSystemPromptForLanguage(next.systemPromptSections, next.languageMode);
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
  normalizeExclusionPatterns,
  normalizeLanguageMode,
  normalizeMaxFolderContextChars,
  normalizeMaxFolderReferences,
  normalizePromptProfile,
  normalizeRagCandidateLimit,
  normalizeRagIndexMaxNotes,
  normalizeSkillIds,
  normalizeSkillsRoot,
  normalizeMaxSkillContextChars,
  normalizeMcpServers,
  normalizeTabBarPosition,
  normalizeUiDensity,
  normalizeSettings,
  normalizeSystemPromptForLanguage,
  normalizeSystemPromptSections,
  isDefaultSystemPromptSections
};
