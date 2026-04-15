const fs = require("fs");
const path = require("path");
const { resolveRoot, readJsonInput, writeJsonOutput } = require("../utils");

function getFlutterStructure(root) {
  try {
    const resolvedRoot = resolveRoot(root);
    const libPath = path.join(resolvedRoot, "lib");

    if (!fs.existsSync(libPath)) {
      return { error: "Diretório 'lib' não encontrado" };
    }

    const files = fs.readdirSync(libPath);
    return files;
  } catch (err) {
    return { error: err.message };
  }
}

if (require.main === module) {
  (async () => {
    try {
      const { root } = await readJsonInput();

      const result = getFlutterStructure(root);

      writeJsonOutput({
        provider: "flutter",
        root: resolveRoot(root),
        result
      });
    } catch (err) {
      writeJsonOutput({ error: err.message });
      process.exit(1);
    }
  })();
}

module.exports = {
  getFlutterStructure,
};