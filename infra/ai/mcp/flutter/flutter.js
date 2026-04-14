const fs = require("fs");
const path = require("path");
const { resolveRoot, readJsonInput, writeJsonOutput } = require("../utils");

function getFlutterStructure(projectPath = process.cwd()) {
  try {
    const root = resolveRoot(projectPath);
    const files = fs.readdirSync(path.join(root, "lib"));
    return files;
  } catch (err) {
    return { error: err.message };
  }
}

if (require.main === module) {
  (async () => {
    try {
      const { projectPath } = await readJsonInput();
      const result = getFlutterStructure(projectPath);
      writeJsonOutput({ provider: "flutter", result });
    } catch (err) {
      writeJsonOutput({ error: err.message });
      process.exit(1);
    }
  })();
}

module.exports = {
  getFlutterStructure,
};