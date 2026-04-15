const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../..", ".env") });
const http = require("http");
const url = require("url");
const providers = require("./index");

const PORT = Number(process.env.MCP_SERVER_PORT || 4000);

const providerDescriptions = {
  "sql-server": "SQL Server database provider",
  sql: "SQL Server alias provider",
  swagger: "Swagger/OpenAPI documentation provider",
  prisma: "Prisma schema provider",
  laravel: "Laravel project provider",
  flutter: "Flutter project provider",
  terminal: "Terminal/command execution provider",
  nextjs: "Next.js project provider",
  nestjs: "NestJS project provider",
};

function getToolsList() {
  return Object.keys(providers).map((name) => ({
    id: name,
    name,
    title: providerDescriptions[name] || name,
    description: providerDescriptions[name] || name,
    version: "1.0.0",
    type: "tool",
    supportedOperations: ["execute", "invoke"],
    inputs: {
      type: "object",
      properties: {
        root: { type: "string", description: "Project root path" },
        query: { type: "string", description: "Natural language query or SQL query" },
        url: { type: "string", description: "Override Swagger URL" },
        command: { type: "string", description: "Command to run for terminal provider" },
      },
    },
    parameters: {
      type: "object",
      properties: {
        root: { type: "string", description: "Project root path" },
        query: { type: "string", description: "Natural language query or SQL query" },
        url: { type: "string", description: "Override Swagger URL" },
        command: { type: "string", description: "Command to run for terminal provider" },
      },
    },
  }));
}

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

async function invokeProvider(providerName, rootPath, options) {
  const provider = providers[providerName];

  if (!provider) {
    throw new Error(`Provider not found: ${providerName}`);
  }

  if (providerName === "sql-server" || providerName === "sql") {
    return provider.queryDatabase({ query: options?.query || "", root: rootPath });
  }

  if (providerName === "swagger") {
    return provider.getSwagger({ url: options?.url, root: rootPath, query: options?.query, input: options?.input, options });
  }

  if (providerName === "prisma") {
    return provider.getPrismaSchema(rootPath);
  }

  if (providerName === "laravel") {
    return provider.getLaravelStructure(rootPath);
  }

  if (providerName === "flutter") {
    return provider.getFlutterStructure(rootPath);
  }

  if (providerName === "terminal") {
    return provider.runCommand(options?.command || "", rootPath);
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
        endpoints: ["GET /providers", "POST /context", "POST /"],
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

    function isUrlString(value) {
      return typeof value === "string" && /^(https?:)?\/\//i.test(value);
    }

    function parseUriRoot(value) {
      if (typeof value !== "string") return value;
      if (value.startsWith("file://")) {
        try {
          return decodeURIComponent(new URL(value).pathname);
        } catch {
          return value;
        }
      }
      return value;
    }

    function resolveInvocationParams(params = {}) {
      const tool = params.tool || {};
      const provider =
        params.provider ||
        tool.id ||
        tool.name ||
        params.toolId ||
        tool.toolId ||
        params.providerId ||
        params.id;

      const root = parseUriRoot(
        params.root ||
          params.projectPath ||
          params.workspace ||
          params.workspaceFolder ||
          (Array.isArray(params.workspaceFolders) && params.workspaceFolders[0]?.uri) ||
          params.rootUri ||
          params.workspaceUri ||
          params.documentUri ||
          tool.root ||
          tool.rootUri ||
          tool.workspace ||
          tool.workspaceFolder
      );
      const options = Object.assign({}, params.options || {}, tool.inputs || {});

      if (typeof tool.input === "string") {
        if (provider === "swagger") {
          if (isUrlString(tool.input)) {
            options.url = tool.input;
          } else if (!options.query && !options.input) {
            options.query = tool.input;
          }
        } else if (provider === "sql-server" || provider === "sql") {
          if (!options.query && !options.input) {
            options.query = tool.input;
          }
        } else if (provider === "terminal") {
          if (!options.command && !options.input) {
            options.command = tool.input;
          }
        } else if (!options.input) {
          options.input = tool.input;
        }
      }

      if (typeof params.input === "string") {
        if (provider === "swagger") {
          if (isUrlString(params.input)) {
            options.url = params.input;
          } else if (!options.query && !options.input) {
            options.query = params.input;
          }
        } else if (provider === "sql-server" || provider === "sql") {
          if (!options.query && !options.input) {
            options.query = params.input;
          }
        } else if (provider === "terminal") {
          if (!options.command && !options.input) {
            options.command = params.input;
          }
        } else if (!options.input) {
          options.input = params.input;
        }
      }

      if (typeof params.query === "string") {
        options.query = params.query;
      }
      if (typeof tool.query === "string") {
        options.query = tool.query;
      }
      if (typeof params.url === "string") {
        options.url = params.url;
      }
      if (typeof tool.url === "string") {
        options.url = tool.url;
      }
      if (typeof params.command === "string") {
        options.command = params.command;
      }
      if (typeof tool.command === "string") {
        options.command = tool.command;
      }

      return { provider, root, options };
    }

    async function handleJsonRpcRequest(req, body) {
      async function handleToolInvocation(body) {
        if (!body.params || typeof body.params !== "object") {
          return sendJson(res, 200, {
            jsonrpc: "2.0",
            id: body.id,
            error: { code: -32602, message: "params object is required" },
          });
        }

        const { provider, root, options } = resolveInvocationParams(body.params);
        if (!provider || typeof provider !== "string") {
          return sendJson(res, 200, {
            jsonrpc: "2.0",
            id: body.id,
            error: { code: -32602, message: "provider/tool id is required and must be a string" },
          });
        }

        const rootPath = root ? path.resolve(root) : process.cwd();
        const result = await invokeProvider(provider, rootPath, options || {});
        return sendJson(res, 200, {
          jsonrpc: "2.0",
          id: body.id,
          result,
        });
      }

      if (body.method === "initialize" || body.method === "mcp.initialize") {
        return sendJson(res, 200, {
          jsonrpc: "2.0",
          id: body.id,
          result: {
            protocolVersion: "2025-11-25",
            capabilities: {
              roots: {
                supported: true,
                multiple: false,
              },
              tools: {
                supported: true,
                execute: true,
                invoke: true,
                supportedOperations: ["execute", "invoke"],
              },
              sampling: { supported: false },
              elicitation: { supported: false },
              tasks: { supported: false },
              extensions: {},
            },
            serverInfo: {
              name: "MCP HTTP Server",
              version: "1.0.0",
            },
          },
        });
      }

      if (body.method === "shutdown" || body.method === "mcp.shutdown") {
        return sendJson(res, 200, {
          jsonrpc: "2.0",
          id: body.id,
          result: null,
        });
      }

      if (
        body.method === "getTools" ||
        body.method === "tools" ||
        body.method === "listTools" ||
        body.method === "discoverTools" ||
        body.method === "getProviders" ||
        body.method === "mcp.getTools" ||
        body.method === "mcp.listTools" ||
        body.method === "mcp.discoverTools" ||
        body.method === "tool/list" ||
        body.method === "tool.list" ||
        body.method === "providers/list" ||
        body.method === "tools/list" ||
        body.method === "mcp.tool.list" ||
        body.method === "mcp.tools.list"
      ) {
        const tools = getToolsList();
        return sendJson(res, 200, {
          jsonrpc: "2.0",
          id: body.id,
          result: {
            tools,
            toolList: tools,
          },
        });
      }

      if (
        body.method === "getContext" ||
        body.method === "context" ||
        body.method === "invoke" ||
        body.method === "execute" ||
        body.method === "mcp.getContext" ||
        body.method === "mcp.context" ||
        body.method === "mcp.invoke" ||
        body.method === "mcp.execute" ||
        body.method === "mcp.tool.execute" ||
        body.method === "mcp.tool.invoke" ||
        /^tool(?:\/|\.)?(?:execute|invoke|run|call)$/i.test(body.method) ||
        /^(?:executeTool|invokeTool|toolExecute|toolInvoke|toolRun|toolCall)$/i.test(body.method)
      ) {
        return await handleToolInvocation(body);
      }

      if (typeof body.method === "string" && Object.prototype.hasOwnProperty.call(providers, body.method)) {
        const params = body.params || {};
        const { provider, root, options } = resolveInvocationParams(params);
        const rootPath = root ? path.resolve(root) : process.cwd();
        const result = await invokeProvider(body.method, rootPath, options || {});
        return sendJson(res, 200, {
          jsonrpc: "2.0",
          id: body.id,
          result,
        });
      }

      if (typeof body.method === "string" && /tools?|providers?|discover|list/i.test(body.method)) {
        return sendJson(res, 200, {
          jsonrpc: "2.0",
          id: body.id,
          result: {
            tools: getToolsList(),
          },
        });
      }

      if (typeof body.method === "string" && /^notifications\//.test(body.method)) {
        console.log("🔥 MCP IGNORED NOTIFICATION:", body.method);
        return sendJson(res, 200, {
          jsonrpc: "2.0",
          result: null,
        });
      }

      console.log("🔥 MCP UNKNOWN METHOD:", body.method, body.params);
      return sendJson(res, 200, {
        jsonrpc: "2.0",
        id: body.id,
        error: { code: -32601, message: "Method not found" },
      });
    }

    async function handleContextRequest(req) {
      let body;
      try {
        body = await parseJsonBody(req);
        console.log("🔥 MCP HIT:", body);
      } catch (err) {
        return sendJson(res, 400, { error: "Invalid JSON body" });
      }

      if (body && body.jsonrpc === "2.0" && typeof body.method === "string") {
        return await handleJsonRpcRequest(req, body);
      }

      const { provider, projectPath, root, options } = body;

      if (!provider || typeof provider !== "string") {
        return sendJson(res, 400, { error: "provider is required and must be a string" });
      }

      if (root != null && typeof root !== "string") {
        return sendJson(res, 400, { error: "root must be a string" });
      }

      if (projectPath != null && typeof projectPath !== "string") {
        return sendJson(res, 400, { error: "projectPath must be a string" });
      }

      if (options != null && typeof options !== "object") {
        return sendJson(res, 400, { error: "options must be an object" });
      }

      const rootPath = root
        ? path.resolve(root)
        : projectPath
        ? path.resolve(projectPath)
        : process.cwd();

      const result = await invokeProvider(provider, rootPath, options || {});
      return sendJson(res, 200, { provider, result });
    }

    if (req.method === "POST" && (parsedUrl.pathname === "/context" || parsedUrl.pathname === "/")) {
      return await handleContextRequest(req);
    }

    return sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    return sendJson(res, 500, { error: error.message || "Internal server error" });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`MCP server listening on http://0.0.0.0:${PORT}`);
});
