const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

function resolveRoot(root) {
  return root ? path.resolve(root) : process.cwd();
}

function loadRootEnv(root) {
  const resolvedRoot = resolveRoot(root);
  const envPath = path.join(resolvedRoot, ".env");

  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
  }

  return resolvedRoot;
}

async function readJsonInput() {
  let raw = "";

  if (process.stdin.isTTY) {
    raw = process.argv[2] || "";
  } else {
    for await (const chunk of process.stdin) {
      raw += chunk;
    }
    raw = raw.trim();
    if (!raw) {
      raw = process.argv[2] || "";
    }
  }

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON input: ${err.message}`);
  }
}

function writeJsonOutput(payload) {
  process.stdout.write(JSON.stringify(payload, null, 2));
}

module.exports = {
  resolveRoot,
  loadRootEnv,
  readJsonInput,
  writeJsonOutput,
};
