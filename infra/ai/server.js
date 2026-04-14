const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../..", ".env") });
const http = require("http");
const url = require("url");
const providers = require("./index");

const PORT = Number(process.env.MCP_SERVER_PORT || 4000);

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, statusCode, payload) {
  const payloadString = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(payloadString);
}

async function invokeProvider(providerName, projectPath, options) {
  const provider = providers[providerName];

  if (!provider) {
    throw new Error(`Provider not found: ${providerName}`);
  }

  const rootPath = projectPath ? path.resolve(projectPath) : process.cwd();

  if (providerName === "sql-server" || providerName === "sql") {
    return provider.queryDatabase(options?.query || "");
  }

  if (providerName === "swagger") {
    return provider.getSwagger();
  }

  if (providerName === "prisma") {
    return provider.getPrismaSchema();
  }

  if (providerName === "laravel") {
    return provider.getLaravelStructure();
  }

  if (providerName === "flutter") {
    return provider.getFlutterStructure();
  }

  if (providerName === "terminal") {
    return provider.runCommand(options?.command || "");
  }

  if (providerName === "nextjs") {
    return provider.getNextjsStructure(rootPath);
  }

  if (providerName === "nestjs") {
    return provider.getNestjsStructure(rootPath);
  }

  if (typeof provider.getContext === "function") {
    return provider.getContext(rootPath, options);
  }

  throw new Error(`Provider does not support invocation: ${providerName}`);
}

const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = url.parse(req.url, true);

    if (req.method === "GET" && parsedUrl.pathname === "/") {
      return sendJson(res, 200, {
        message: "MCP server is running",
        port: PORT,
        providers: Object.keys(providers),
        endpoints: ["GET /providers", "POST /context"],
      });
    }

    if (req.method === "GET" && parsedUrl.pathname === "/providers") {
      return sendJson(res, 200, Object.keys(providers));
    }

    if (req.method === "GET" && parsedUrl.pathname === "/context") {
      return sendJson(res, 200, {
        status: "ok",
        providers: Object.keys(providers)
      });
    }

    if (req.method === "POST" && parsedUrl.pathname === "/context") {
      const body = await parseJsonBody(req);
      const { provider, projectPath, options } = body;

      if (!provider) {
        return sendJson(res, 400, { error: "provider is required" });
      }

      const result = await invokeProvider(provider, projectPath, options || {});
      return sendJson(res, 200, { provider, result });
    }

    return sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    return sendJson(res, 500, { error: error.message || "Internal server error" });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`MCP server listening on http://0.0.0.0:${PORT}`);
});
