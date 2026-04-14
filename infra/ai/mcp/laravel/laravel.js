const fs = require("fs");
const path = require("path");
const { resolveRoot, readJsonInput, writeJsonOutput } = require("../utils");

function getLaravelStructure(projectPath = process.cwd()) {
  try {
    const root = resolveRoot(projectPath);
    const controllers = fs.readdirSync(path.join(root, "app", "Http", "Controllers"));
    const models = fs.readdirSync(path.join(root, "app", "Models"));

    return {
      controllers,
      models,
    };
  } catch (err) {
    return { error: err.message };
  }
}

if (require.main === module) {
  (async () => {
    try {
      const { projectPath } = await readJsonInput();
      const result = getLaravelStructure(projectPath);
      writeJsonOutput({ provider: "laravel", result });
    } catch (err) {
      writeJsonOutput({ error: err.message });
      process.exit(1);
    }
  })();
}

module.exports = {
  getLaravelStructure,
};