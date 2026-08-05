# LayerBack MCP Server

Give your AI agent the one diagram skill it's missing: turning **pictures of
diagrams into fully editable files**.

Agents can write Mermaid — but when the input is a screenshot, a whiteboard
photo, or a diagram trapped in a PDF page, they're stuck. This MCP server
connects any MCP-compatible agent (Claude Desktop, Claude Code, Cursor, …) to
[LayerBack](https://layerback.com), which rebuilds every shape, connector, and
label as a native object and returns **Visio (VSDX), PowerPoint (PPTX),
draw.io, and SVG** — all editable, from one conversion.

## Tools

| Tool | What it does |
|---|---|
| `convert_diagram_image` | Convert a local image file (PNG/JPG/WebP); waits for the result by default (~30–60 s) |
| `get_conversion_status` | Poll a running job |
| `download_converted_diagram` | Save any output format to a local path |

## Setup

1. Create an API key at <https://layerback.com/settings/apikeys>
   (new accounts include free credits — one conversion costs 10 and includes
   every output format).
2. Add the server to your MCP client config:

```json
{
  "mcpServers": {
    "layerback": {
      "command": "npx",
      "args": ["-y", "layerback-mcp"],
      "env": { "LAYERBACK_API_KEY": "your-key-here" }
    }
  }
}
```

## Example prompts

- "Convert ~/Desktop/whiteboard.jpg into a Visio file and save it to my
  Downloads folder."
- "Here's a screenshot of our architecture diagram — rebuild it as an
  editable draw.io file."
- "Batch-convert every PNG in ./legacy-diagrams to VSDX."

## Notes

- Requires Node 18+.
- REST API docs: <https://layerback.com/docs/api> ·
  OpenAPI: <https://layerback.com/openapi.yaml>
- Files upload to LayerBack for conversion and are deleted within 72 hours.

MIT © LayerBack
