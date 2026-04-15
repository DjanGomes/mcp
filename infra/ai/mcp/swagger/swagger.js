const axios = require("axios");
const { loadRootEnv, readJsonInput, writeJsonOutput } = require("../utils");

function isUrlString(value) {
  return typeof value === "string" && /^(https?:)?\/\//i.test(value);
}

function normalizeText(text = "") {
  return text.toString().toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s]/g, " ").trim();
}

function filterSwaggerPaths(spec, query) {
  const queryWords = normalizeText(query).split(/\s+/).filter(Boolean);
  if (!queryWords.length) {
    return spec;
  }

  const paths = spec.paths || {};
  const matches = [];

  for (const [pathKey, methods] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(methods || {})) {
      const text = normalizeText(
        [pathKey, method, operation.summary, operation.description, operation.operationId, ...(operation.tags || [])].join(" ")
      );
      const score = queryWords.reduce((acc, word) => (text.includes(word) ? acc + 1 : acc), 0);
      if (score > 0) {
        matches.push({
          path: pathKey,
          method: method.toUpperCase(),
          summary: operation.summary || null,
          description: operation.description || null,
          tags: operation.tags || [],
          operationId: operation.operationId || null,
          security: operation.security || null,
        });
      }
    }
  }

  return {
    query,
    swaggerUrl: spec.url || null,
    filteredPaths: matches,
    matchedCount: matches.length,
  };
}

async function getSwagger(urlOrOptions = {}) {
  let url;
  let root;
  let query;

  if (typeof urlOrOptions === "string") {
    url = urlOrOptions;
  } else if (urlOrOptions && typeof urlOrOptions === "object") {
    url = urlOrOptions.url || urlOrOptions.options?.url;
    root = urlOrOptions.root;
    query = urlOrOptions.query || urlOrOptions.input || urlOrOptions.options?.query || urlOrOptions.options?.input;
    if (typeof query === "string" && isUrlString(query)) {
      if (!url) url = query;
      query = undefined;
    }
  }

  loadRootEnv(root);

  const swaggerUrl = url || process.env.SWAGGER_URL;
  if (!swaggerUrl) {
    return { error: "Swagger URL not defined in options or env." };
  }

  try {
    const response = await axios.get(swaggerUrl);
    const spec = response.data;
    if (query) {
      return filterSwaggerPaths(spec, query);
    }
    return spec;
  } catch (err) {
    return { error: err.message };
  }
}

if (require.main === module) {
  (async () => {
    try {
      const input = await readJsonInput();
      const root = input.root || input.projectPath;
      const options = input.options || {};
      const result = await getSwagger({
        url: options.url || input.url,
        root,
        query: options.query || input.query,
        input: options.input || input.input,
        options,
      });
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