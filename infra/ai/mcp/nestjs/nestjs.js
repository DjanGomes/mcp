const fs = require("fs");
const path = require("path");
const { readJsonInput, writeJsonOutput } = require("../utils");

function safeJsonRead(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function exists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function listSourceFiles(root, extensions = [".ts", ".js"]) {
  const result = [];

  function walk(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        if (extensions.includes(path.extname(entry.name))) {
          result.push(path.relative(root, fullPath));
        }
      }
    }
  }

  try {
    walk(root);
  } catch {
    return [];
  }

  return result;
}

function findFile(root, names) {
  for (const name of names) {
    const fullPath = path.join(root, name);
    if (exists(fullPath)) {
      return path.relative(root, fullPath);
    }
  }
  return null;
}

// 🔥 ALTERADO AQUI
function getNestjsStructure(rootPath = process.cwd()) {
  const root = path.resolve(rootPath);

  const result = {
    root,
    packageJson: null,
    isNestProject: false,
    appModule: null,
    controllers: [],
    modules: [],
    services: [],
    files: [],
    errors: [],
  };

  try {
    const packagePath = path.join(root, "package.json");

    if (exists(packagePath)) {
      const packageJson = safeJsonRead(packagePath);
      result.packageJson = packageJson;

      const deps = {
        ...(packageJson?.dependencies || {}),
        ...(packageJson?.devDependencies || {}),
      };

      result.isNestProject = Boolean(
        deps["@nestjs/core"] ||
        deps["@nestjs/common"] ||
        deps["@nestjs/platform-express"]
      );
    }

    const srcPath = path.join(root, "src");

    if (exists(srcPath) && fs.statSync(srcPath).isDirectory()) {
      result.files = listSourceFiles(srcPath);

      result.appModule = findFile(srcPath, [
        "app.module.ts",
        "app.module.js",
      ]);

      result.controllers = result.files.filter(
        (file) =>
          file.endsWith(".controller.ts") ||
          file.endsWith(".controller.js")
      );

      result.modules = result.files.filter(
        (file) =>
          file.endsWith(".module.ts") ||
          file.endsWith(".module.js")
      );

      result.services = result.files.filter(
        (file) =>
          file.endsWith(".service.ts") ||
          file.endsWith(".service.js")
      );
    }
  } catch (err) {
    result.errors.push(err.message);
  }

  return result;
}

// 🔥 ALTERADO AQUI
if (require.main === module) {
  (async () => {
    try {
      const { root } = await readJsonInput(); // <-- agora vem "root"
      const result = getNestjsStructure(root); // <-- usa root diretamente

      writeJsonOutput({
        provider: "nestjs",
        result,
      });
    } catch (err) {
      writeJsonOutput({ error: err.message });
      process.exit(1);
    }
  })();
}

module.exports = {
  getNestjsStructure,
};