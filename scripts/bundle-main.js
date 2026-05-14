const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const mainPath = path.join(root, "main.js");
const libNames = [
  "i18n",
  "security",
  "context",
  "agent-store",
  "codex-cli",
  "settings"
];

const startMarker = "// BEGIN CODEX CHAT BUNDLED LIBS";
const endMarker = "// END CODEX CHAT BUNDLED LIBS";

function normalizeLibRequires(source) {
  return source.replace(/require\("\.\/([^"]+)"\)/g, '__codexChatRequire("./lib/$1")');
}

function stripExistingBundle(source) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker);
  if (start === -1 || end === -1 || end < start) {
    return source;
  }
  const afterEnd = source.indexOf("\n", end);
  return source.slice(0, start) + source.slice(afterEnd === -1 ? source.length : afterEnd + 1);
}

function stripRequireLocalPatch(source) {
  return source
    .replace(/\r?\nconst nodePathForLocalRequire = require\("path"\);\r?\n\r?\nfunction requireLocal\(modulePath\) \{[\s\S]*?\r?\n\}\r?\n/, "\n")
    .replace(/requireLocal\("\.\/lib\/([^"]+)"\)/g, '__codexChatRequire("./lib/$1")')
    .replace(/require\("\.\/lib\/([^"]+)"\)/g, '__codexChatRequire("./lib/$1")');
}

function buildBundle() {
  const parts = [
    startMarker,
    "const __codexChatModules = Object.create(null);",
    "const __codexChatModuleCache = Object.create(null);",
    "",
    "function __codexChatDefine(id, factory) {",
    "  __codexChatModules[id] = factory;",
    "}",
    "",
    "function __codexChatRequire(id) {",
    "  if (!__codexChatModules[id]) {",
    "    return require(id);",
    "  }",
    "  if (!__codexChatModuleCache[id]) {",
    "    const module = { exports: {} };",
    "    __codexChatModuleCache[id] = module;",
    "    __codexChatModules[id](module, module.exports, __codexChatRequire);",
    "  }",
    "  return __codexChatModuleCache[id].exports;",
    "}",
    ""
  ];

  for (const name of libNames) {
    const id = `./lib/${name}`;
    const libPath = path.join(root, "lib", `${name}.js`);
    const code = normalizeLibRequires(fs.readFileSync(libPath, "utf8")).trimEnd();
    parts.push(`__codexChatDefine("${id}", function(module, exports, require) {`);
    parts.push(code);
    parts.push("});");
    parts.push("");
  }

  parts.push(endMarker);
  return parts.join("\n") + "\n";
}

function insertBundle(source, bundle) {
  const anchor = '} = require("obsidian");';
  const index = source.indexOf(anchor);
  if (index === -1) {
    throw new Error(`Cannot find Obsidian require anchor: ${anchor}`);
  }
  const insertAt = source.indexOf("\n", index);
  if (insertAt === -1) {
    throw new Error("Cannot find insertion point after Obsidian require.");
  }
  return source.slice(0, insertAt + 1) + bundle + source.slice(insertAt + 1);
}

let source = fs.readFileSync(mainPath, "utf8");
source = stripExistingBundle(source);
source = stripRequireLocalPatch(source);
source = insertBundle(source, buildBundle());
fs.writeFileSync(mainPath, source, "utf8");
