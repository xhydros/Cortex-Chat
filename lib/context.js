const { normalizeFolderRoots } = require("./security");

function wantsFolderContext(message, roots = []) {
  const source = String(message || "").toLowerCase();
  const configuredRoots = normalizeFolderRoots(roots);
  return (
    configuredRoots.length > 0 &&
    (/(carpeta|folder|directorio|all notes|todas las notas|todos los archivos)/.test(source) ||
      configuredRoots.some((root) => source.includes(root.toLowerCase())))
  );
}

function isInsideConfiguredRoot(filePath, roots = []) {
  const normalizedPath = String(filePath || "").replaceAll("\\", "/");
  return normalizeFolderRoots(roots).some((root) => normalizedPath === root || normalizedPath.startsWith(`${root}/`));
}

function rootForPath(filePath, roots = []) {
  const normalizedPath = String(filePath || "").replaceAll("\\", "/");
  return normalizeFolderRoots(roots).find((root) => normalizedPath === root || normalizedPath.startsWith(`${root}/`)) || "";
}

module.exports = {
  isInsideConfiguredRoot,
  rootForPath,
  wantsFolderContext
};
