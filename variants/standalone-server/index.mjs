// Standalone server for the LinkedIn Visual Design System.
//
// Drives claude-opus-4-8 with the design-system principles as a cached system
// prompt, so visuals generated here follow the exact same framework as the
// Claude Design variants — just outside Claude Design, on your own API key.
//
//   cp .env.example .env   &&   fill in ANTHROPIC_API_KEY
//   npm install
//   npm start
//
// Then POST http://localhost:8787/api/generate
//   { "brief": "...", "stylePack": "doodle", "archetype": "single-01-funnel", "brand": "<css>" }

import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemBlocks } from "./lib/system-prompt.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const envPath = join(HERE, ".env");
if (existsSync(envPath)) process.loadEnvFile(envPath); // Node 22+

const PORT = Number(process.env.PORT || 8787);
const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

async function generate({ brief, brand, stylePack, archetype }) {
  const system = buildSystemBlocks({ stylePack, archetype });

  const userParts = [];
  if (brand) userParts.push(`Brand layer (the visual wears this — colours, font, signature):\n${brand}`);
  userParts.push(`Brief:\n${brief || "(no brief provided)"}`);

  // Streaming: HTML artboards can be long, and large max_tokens on a
  // non-streaming request risks an SDK HTTP timeout.
  const stream = client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 64000,
    thinking: { type: "adaptive" },
    output_config: { effort: "high" },
    system,
    messages: [{ role: "user", content: userParts.join("\n\n") }],
  });

  const msg = await stream.finalMessage();
  const html = msg.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  return { html, stop_reason: msg.stop_reason, usage: msg.usage };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  if (req.method === "OPTIONS") return res.writeHead(204, cors).end();

  if (req.method === "POST" && req.url === "/api/generate") {
    try {
      const body = JSON.parse((await readBody(req)) || "{}");
      const result = await generate(body);
      res.writeHead(200, { "content-type": "application/json", ...cors });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500, { "content-type": "application/json", ...cors });
      res.end(JSON.stringify({ error: String(err?.message || err) }));
    }
    return;
  }

  res.writeHead(404, { "content-type": "application/json", ...cors });
  res.end(JSON.stringify({ error: "POST /api/generate" }));
});

server.listen(PORT, () => {
  console.log(`LinkedIn Visual DS — standalone server on http://localhost:${PORT}`);
  console.log(`  POST /api/generate  { brief, stylePack?, archetype?, brand? }`);
});
