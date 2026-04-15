const fs = require("fs");
const path = require("path");
const { readJsonInput, writeJsonOutput } = require("../utils");

function safeJsonRead(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (err) {
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

function listFiles(dirPath, maxDepth = 2) {
  const result = [];

  function walk(currentPath, depth) {
    if (depth < 0) return;
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isFile()) {
        result.push(path.relative(dirPath, fullPath));
      } else if (entry.isDirectory()) {
        walk(fullPath, depth - 1);
      }
    }
  }

  try {
    walk(dirPath, maxDepth);
  } catch {
    return [];
  }

  return result;
}

function findDirectory(root, candidates) {
  for (const candidate of candidates) {
    const fullPath = path.join(root, candidate);
    if (exists(fullPath) && fs.statSync(fullPath).isDirectory()) {
      return fullPath;
    }
  }
  return null;
}

function getNextjsStructure(projectPath = process.cwd()) {
  const root = path.resolve(projectPath);
  const result = {
    root,
    packageJson: null,
    nextDependencies: {},
    configFiles: [],
    appFolder: null,
    pagesFolder: null,
    apiRoutes: [],
    components: [],
    errors: [],
  };

  try {
    const packagePath = path.join(root, "package.json");
    if (exists(packagePath)) {
      const packageJson = safeJsonRead(packagePath);
      result.packageJson = packageJson;
      if (packageJson) {
        const deps = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };
        result.nextDependencies = Object.fromEntries(
          Object.entries(deps).filter(([key]) =>
            key === "next" || key.startsWith("next") || key.includes("react") || key.includes("typescript")
          )
        );
      }
    }

    const configFiles = ["next.config.js", "next.config.mjs", "next.config.ts"];
    result.configFiles = configFiles.filter((file) => exists(path.join(root, file)));

    const appFolder = findDirectory(root, ["app", "src/app"]);
    const pagesFolder = findDirectory(root, ["pages", "src/pages"]);

    if (appFolder) {
      result.appFolder = path.relative(root, appFolder);
      result.components = result.components.concat(listFiles(appFolder, 2));
    }

    if (pagesFolder) {
      result.pagesFolder = path.relative(root, pagesFolder);
      result.components = result.components.concat(listFiles(pagesFolder, 2));
      const apiFolder = path.join(pagesFolder, "api");
      if (exists(apiFolder)) {
        result.apiRoutes = listFiles(apiFolder, 3);
      }
    }

    const componentFolder = findDirectory(root, ["components", "src/components"]);
    if (componentFolder) {
      result.components = result.components.concat(listFiles(componentFolder, 2));
    }

    result.components = Array.from(new Set(result.components)).sort();
  } catch (err) {
    result.errors.push(err.message);
  }

  return result;
}

if (require.main === module) {
  (async () => {
    try {
      const input = await readJsonInput();
      const root = input.root || input.projectPath;
      const result = getNextjsStructure(root);
      writeJsonOutput({ provider: "nextjs", result });
    } catch (err) {
      writeJsonOutput({ error: err.message });
      process.exit(1);
    }
  })();
}

module.exports = {
  getNextjsStructure,
};
