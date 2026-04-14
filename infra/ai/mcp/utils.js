const path = require("path");

function resolveRoot(projectPath) {
  return projectPath ? path.resolve(projectPath) : process.cwd();
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
  readJsonInput,
  writeJsonOutput,
};
