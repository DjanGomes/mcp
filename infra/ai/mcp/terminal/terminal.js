const { exec } = require("child_process");
const { resolveRoot, readJsonInput, writeJsonOutput } = require("../utils");

function runCommand(command, projectPath = process.cwd()) {
  return new Promise((resolve) => {
    exec(command, { cwd: resolveRoot(projectPath) }, (error, stdout, stderr) => {
      if (error) return resolve(stderr || error.message);
      resolve(stdout);
    });
  });
}

if (require.main === module) {
  (async () => {
    try {
      const { projectPath, options = {} } = await readJsonInput();
      const result = await runCommand(options.command || "", projectPath);
      writeJsonOutput({ provider: "terminal", result });
    } catch (err) {
      writeJsonOutput({ error: err.message });
      process.exit(1);
    }
  })();
}

module.exports = {
  runCommand,
};