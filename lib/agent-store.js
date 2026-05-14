const path = require("node:path");

function agentPaths(vaultRoot) {
  const agentRoot = path.join(vaultRoot, "_agent");
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
  return path.join("_agent", "backups", year, month, day, `${threadId}-${sessionId}`).replaceAll("\\", "/");
}

module.exports = {
  agentPaths,
  sessionBackupRoot
};
