const sql = require("mssql");
const { loadRootEnv, readJsonInput, writeJsonOutput } = require("../utils");

function buildSqlConfig() {
  return {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };
}

async function queryDatabase(queryOrOptions = {}) {
  let query = "";
  let root;

  if (typeof queryOrOptions === "string") {
    query = queryOrOptions;
  } else if (queryOrOptions && typeof queryOrOptions === "object") {
    query = queryOrOptions.query || "";
    root = queryOrOptions.root;
    console.log("🔥 SQL Server Query:", query, "root:", root);
  }

  loadRootEnv(root);
  const config = buildSqlConfig();

  try {
    await sql.connect(config);
    const result = await sql.query(query);
    return result.recordset;
  } catch (err) {
    return { error: err.message };
  }
}

if (require.main === module) {
  console.log("🔥 SQL Server MCP Provider HIT");
  (async () => {
    try {
      const input = await readJsonInput();
      const root = input.root || input.projectPath;
      const options = input.options || {};
      const result = await queryDatabase({ query: options.query || input.query || "", root });
      writeJsonOutput({ provider: "sql-server", result });
    } catch (err) {
      writeJsonOutput({ error: err.message });
      process.exit(1);
    }
  })();
}

module.exports = {
  queryDatabase,
};