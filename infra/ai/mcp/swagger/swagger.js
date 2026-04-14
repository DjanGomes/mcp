const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../../..", ".env") });
const axios = require("axios");
const { readJsonInput, writeJsonOutput } = require("../utils");

async function getSwagger(url = process.env.SWAGGER_URL) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (err) {
    return { error: err.message };
  }
}

if (require.main === module) {
  (async () => {
    try {
      const { options = {} } = await readJsonInput();
      const result = await getSwagger(options.url);
      writeJsonOutput({ provider: "swagger", result });
    } catch (err) {
      writeJsonOutput({ error: err.message });
      process.exit(1);
    }
  })();
}

module.exports = {
  getSwagger,
};