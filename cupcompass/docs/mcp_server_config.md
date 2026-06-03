# MongoDB MCP Server: setup notes and sample config

This document shows the minimal configuration patterns for a MongoDB MCP Server that exposes a controlled tool interface to Agent Builder and only allows CupCompass collections.

1) Deploy options:
- Use MongoDB's MCP partner offering (if available) or deploy a lightweight adapter on a VM/container that exposes an authenticated HTTP API and proxies operations to your Atlas cluster.
- Ensure TLS, API-key protection, and IP allowlisting between Agent Builder and the MCP endpoint.

2) Minimal config (example YAML for a self-hosted MCP adapter):

```yaml
mongodb:
  uri: "YOUR_ATLAS_CONNECTION_STRING"
  db: "cupcompass"

server:
  port: 8080
  apiKey: "REPLACE_WITH_RANDOM_SECRET"
  allowedOrigins: ["https://agent-builder.googleapis.com"]

policy:
  allowedCollections:
    - trips
    - itineraries
    - events
    - agent_logs
    - hotels
    - alerts
    - tasks
  operations:
    find: true
    insert: true
    update: true
    delete: false
```

3) Example MCP endpoints the agent will call (conceptual):
- `POST /v1/mcp/find` { collection, filter }
- `POST /v1/mcp/insert` { collection, document }
- `POST /v1/mcp/update` { collection, filter, update }

4) Security and testing:
- Use an API key in a header `Authorization: Bearer <API_KEY>`.
- Test with `curl`:

```powershell
curl -X POST "https://your-mcp.example.com/v1/mcp/find" -H "Authorization: Bearer REPLACE" -H "Content-Type: application/json" -d '{"collection":"hotels","filter":{"city":"Toronto","available":true}}'
```

If you need, I can scaffold a tiny Node/Express MCP adapter for local testing. Ask and I'll add it.
