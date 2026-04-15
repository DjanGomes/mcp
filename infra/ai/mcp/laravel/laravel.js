const fs = require("fs");
const path = require("path");
const { resolveRoot, readJsonInput, writeJsonOutput } = require("../utils");

function getLaravelStructure(root) {
  try {
    const resolvedRoot = resolveRoot(root);

    const controllersPath = path.join(resolvedRoot, "app", "Http", "Controllers");
    const modelsPath = path.join(resolvedRoot, "app", "Models");

    const controllers = fs.existsSync(controllersPath)
      ? fs.readdirSync(controllersPath)
      : [];

    const models = fs.existsSync(modelsPath)
      ? fs.readdirSync(modelsPath)
      : [];

    const isLaravelProject =
      fs.existsSync(path.join(resolvedRoot, "artisan")) &&
      fs.existsSync(path.join(resolvedRoot, "composer.json"));

    return {
      root: resolvedRoot,
      isLaravelProject,
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
      const input = await readJsonInput();
      const root = input.root || input.projectPath;

      const result = getLaravelStructure(root);

      writeJsonOutput({
        provider: "laravel",
        result
      });
    } catch (err) {
      writeJsonOutput({ error: err.message });
      process.exit(1);
    }
  })();
}

module.exports = {
  getLaravelStructure,
};