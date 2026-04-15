const fs = require("fs");
const path = require("path");
const { resolveRoot, readJsonInput, writeJsonOutput } = require("../utils");

function getPrismaSchema(projectPath = process.cwd()) {
  try {
    const root = resolveRoot(projectPath);
    const schema = fs.readFileSync(path.join(root, "prisma", "schema.prisma"), "utf-8");
    return schema;
  } catch (err) {
    return { error: err.message };
  }
}

if (require.main === module) {
  (async () => {
    try {
      const input = await readJsonInput();
      const root = input.root || input.projectPath;
      const result = getPrismaSchema(root);
      writeJsonOutput({ provider: "prisma", result });
    } catch (err) {
      writeJsonOutput({ error: err.message });
      process.exit(1);
    }
  })();
}

module.exports = {
  getPrismaSchema,
};