const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../../..", ".env") });
const sql = require("mssql");
const { readJsonInput, writeJsonOutput } = require("../utils");

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function queryDatabase(query) {
  try {
    await sql.connect(config);
    const result = await sql.query(query);
    return result.recordset;
  } catch (err) {
    return { error: err.message };
  }
}

if (require.main === module) {
  (async () => {
    try {
      const { options = {} } = await readJsonInput();
      const result = await queryDatabase(options.query || "");
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