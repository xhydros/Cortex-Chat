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
    if (!normalized || normalized.startsWith("_agent/") || normalized === "_agent" || seen.has(normalized)) {
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

module.exports = {
  formatFolderRoots,
  isForeignWindowsUserPath,
  isLocalBackendUrl,
  normalizeFolderRoots,
  parseFolderRootsInput,
  validateBackendUrl
};
