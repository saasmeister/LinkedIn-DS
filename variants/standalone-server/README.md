# Standalone server

Drives **claude-opus-4-8** with the design system's principles as a cached
system prompt. Visuals generated here follow the same framework as the Claude
Design variants — but run outside Claude Design, on your own Anthropic API key.

## Run

```bash
cp .env.example .env        # add your ANTHROPIC_API_KEY
npm install
npm start                   # http://localhost:8787
```

## API

`POST /api/generate`

```json
{
  "brief": "Turn this post into a single visual: ...",
  "stylePack": "doodle",
  "archetype": "single-01-funnel",
  "brand": "/* contents of overrides/brand.css */"
}
```

Returns `{ html, stop_reason, usage }` — `html` is one `.artboard` block ready to
drop onto the Visual Board.

## How it fits the UI

The standalone bundle ships the full design system (principles, templates,
tokens) **plus** this `server/`. Point the UI's generate action (the "+ New
visual" / "Iterate" flow in `board-editor.js`) at `POST /api/generate` instead
of the copy-to-Claude-Design prompt. Everything else — the Visual Board, the
board editor, the icon library, brand settings — stays exactly as it is.

## Why a cached system prompt

`lib/system-prompt.mjs` splits the prompt so the large, unchanging principles
corpus is sent with `cache_control: ephemeral`. You pay for it ~once; every
later call reads it at ~0.1× cost. The per-request brief and brand go in the
user message, so they never invalidate that cache.
