import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { checkApiKey } from "@/lib/auth";
import { createMcpServer } from "@/lib/mcp/server";

// Streamable HTTP MCP endpoint, stateless: a fresh server + transport per
// request, so it works behind any load balancer without session affinity.
async function handle(req: Request): Promise<Response> {
  const denied = checkApiKey(req);
  if (denied) return denied;

  const server = createMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  try {
    return await transport.handleRequest(req);
  } finally {
    void server.close();
  }
}

export { handle as GET, handle as POST, handle as DELETE };
