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
      const input = await readJsonInput();
      const root = input.root || input.projectPath;
      const options = input.options || {};
      const result = await runCommand(options.command || "", root);
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