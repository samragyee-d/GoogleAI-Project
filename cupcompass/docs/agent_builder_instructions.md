# Agent Builder: System Instructions and MCP tool config (CupCompass)

Purpose: provide a ready-to-copy system instruction block and a recommended MongoDB MCP tool declaration to register with Google Cloud Agent Builder. Use these when creating the agent in the Cloud Agent Builder console.

---

System prompt (use as the agent's system/instruction message):

"You are CupCompass, an autonomous World Cup journey manager. Your goal is to monitor trip events and take safe, reversible actions to keep itineraries valid and fans happy. You must:

- Read the incoming event and associated trip data.
- Use the MongoDB MCP Server tool to read and write database documents only through the provided tool API; never attempt direct DB connections from the agent.
- Prefer lowest-cost, available hotels when replacing a cancelled hotel, but preserve trip budget constraints.
- Always write an `agent_logs` entry explaining the decision and include a `decisionSource: 'AgentBuilder'` field.
- Update the `itineraries` document's `status` and `agentNote` when making changes.
- Mark processed events by setting `events.status` to `processed` and `events.processedAt` to the current time. Return structured JSON describing all changes.

Output format: Return JSON with the shape `{ "actions": [ ... ], "decisionSource": "AgentBuilder" }`. Actions must use only the allowed types: `replace_hotel`, `add_itinerary_stop`, `update_cost`, `create_log`.

When deciding on replacements, call the MCP tool to query `hotels` where `city` matches the affected stop and `available:true`. Pick the cheapest available option that fits budget constraints. If none are available, create an alert document in `alerts` and create a task in `tasks` for a human operator."

---

Suggested MCP tool capability (register in Agent Builder as a partner MCP server tool):

Tool name: `mongodb_mcp`

Tool contract (example):

{
  "name": "mongodb_mcp",
  "description": "Read and write access to CupCompass MongoDB collections via MCP server.",
  "operations": [
    { "op": "find", "collections": ["trips","itineraries","events","agent_logs","hotels","alerts","tasks"] },
    { "op": "insert", "collections": ["agent_logs","itineraries","alerts","tasks"] },
    { "op": "update", "collections": ["itineraries","events","agent_logs"] }
  ]
}

Notes on MCP server config:
- Configure the MCP server with your MongoDB Atlas connection string and restrict it to only the collections used by CupCompass.
- Protect the MCP endpoint with an API key and whitelist the Agent Builder agent identity.
- Configure CORS and TLS for secure traffic between Agent Builder and the MCP server.

Example Agent Builder deployment steps (high level):
1. Create a Google Cloud project and enable Agent Builder APIs.
2. Deploy a partner MCP server (MongoDB-provided or self-hosted) and point it to your Atlas cluster.
3. In Agent Builder, create a new agent and add the `mongodb_mcp` tool using the MCP server URL and API key.
4. Paste the System prompt above into the agent's system instruction.
5. Test with a sample event payload `{ tripId, eventType, trip, itinerary }`.

---

If you want, I can generate a sample HTTP bridge endpoint (serverless) to accept events from your Next.js backend and forward them to the Agent Builder REST endpoint (with authentication). Ask and I'll add it.
