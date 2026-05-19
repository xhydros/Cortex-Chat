const path = require("node:path");

const CORTEX_DATA_ROOT = "_cortex";
const LEGACY_AGENT_DATA_ROOT = "_agent";

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

function legacyAgentPaths(vaultRoot) {
  const agentRoot = path.join(vaultRoot, LEGACY_AGENT_DATA_ROOT);
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
  LEGACY_AGENT_DATA_ROOT,
  agentPaths,
  legacyAgentPaths,
  sessionBackupRoot
};
