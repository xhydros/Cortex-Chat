function escapePowerShellSingleQuoted(value) {
  return String(value).replace(/'/g, "''");
}

function codexSandboxForMode(runOptions = {}) {
  return runOptions.interactionMode === "execute" ? "workspace-write" : "read-only";
}

function codexReasoningForEffort(runOptions = {}) {
  return runOptions.effort === "fast" ? "medium" : "high";
}

function buildCodexExecArgs(options = {}) {
  const sandbox = codexSandboxForMode(options.runOptions);
  const effort = codexReasoningForEffort(options.runOptions);
  const args = [
    "--ask-for-approval",
    "never",
    "exec"
  ];
  if (options.vaultRoot) {
    args.push("-C", options.vaultRoot);
  }
  args.push(
    "--skip-git-repo-check",
    "--sandbox",
    sandbox,
    "-c",
    `model_reasoning_effort="${effort}"`
  );
  if (options.outputPath) {
    args.push("--output-last-message", options.outputPath);
  }
  args.push("-");
  return args;
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

function detectCodexPlatform(value) {
  const platform = String(value || "").toLowerCase();
  if (platform === "win32" || platform === "windows") {
    return "windows";
  }
  if (platform === "darwin" || platform === "macos") {
    return "macos";
  }
  if (platform === "linux") {
    return "linux";
  }
  return "unsupported";
}

module.exports = {
  buildCodexExecArgs,
  buildCodexExecCommand,
  classifyLocalCodexFailure,
  codexReasoningForEffort,
  codexSandboxForMode,
  detectCodexPlatform,
  escapePowerShellSingleQuoted,
  hasNonAscii
};
