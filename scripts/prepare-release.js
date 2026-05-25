const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const releaseDir = path.join(root, "release");
const requiredFiles = ["main.js", "manifest.json", "styles.css"];
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
const versions = JSON.parse(fs.readFileSync(path.join(root, "versions.json"), "utf8"));

if (!manifest.version || versions[manifest.version] !== manifest.minAppVersion) {
  throw new Error("manifest.version must exist in versions.json with the same minAppVersion.");
}

fs.rmSync(releaseDir, { recursive: true, force: true });
fs.mkdirSync(releaseDir, { recursive: true });

for (const fileName of requiredFiles) {
  fs.copyFileSync(path.join(root, fileName), path.join(releaseDir, fileName));
}

const releaseMain = fs.readFileSync(path.join(releaseDir, "main.js"), "utf8");
for (const snippet of [
  "setupDiagnose",
  "setupNode",
  "setupNpmOptionalDetail",
  "localCodexExecSpec",
  "diagnoseCodexCli",
  "runLocalCommandDetailed",
  "codex-node",
  "isExecSpecCompatibleWithPlatform",
  "normalizeCodexExecSpec",
  "setupClearLog",
  "setupToggleDiagnostics"
]) {
  if (!releaseMain.includes(snippet)) {
    throw new Error(`release/main.js is missing required Codex setup snippet: ${snippet}`);
  }
}

console.log(`Prepared Cortex Chat ${manifest.version} release assets in ${releaseDir}`);
