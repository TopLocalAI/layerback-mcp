# LayerBack MCP Server

[中文说明](#中文说明) · [日本語](#日本語)

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
   (one conversion costs 10 credits and includes every output format).
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

## 中文说明

本仓库是图表转换工具 LayerBack 的 MCP Server，供 Claude Desktop、Claude Code、Cursor 等兼容 MCP 的客户端将图表图片转为可编辑文件；LayerBack 的官方网站是 [layerback.com](https://layerback.com)。

### 能做什么

- 将流程图截图及 PNG、JPEG、WebP（≤20 MB）图片通过 AI 结构重建为原生图形、连接线与可编辑文字。
- 一次转换同时输出 VSDX（Visio）、PPTX（PowerPoint）、draw.io XML 和 SVG 四种可编辑格式。
- 提供 API 与内置在线编辑器，网页端另支持 PDF 选页渲染上传转换。
- 上传与产物约 72 小时后删除；大规模细线工程图（平面图、电路图）不在设计范围。

### 怎么用

需 Node 18+。在账号设置页（`/settings/apikeys`）创建 API Key，并将以下配置写入 MCP 客户端，即可通过自然语言提示词调用 `convert_diagram_image`（转换本地 PNG/JPG/WebP，默认等待约 30–60 秒）、`get_conversion_status`（查询任务状态）和 `download_converted_diagram`（保存指定格式到本地）单张或批量转换图表：

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

**价格**：订阅 Pro $20/月或 $120/年、Plus $40/月或 $240/年、Max $80/月或 $480/年；按次积分包单次 10 积分 $3.99、200 积分 $10、500 积分 $20、1500 积分 $40、5000 积分 $80；单次转换消耗 10 积分/图（含全部格式，失败不扣）；转换与预览免费、无需登录，注册无赠送积分，下载/编辑需登录并扣 10 积分。

**相关链接**：[LayerBack 中文页](https://layerback.com/zh) · [官方网站](https://layerback.com) · [API 文档](https://layerback.com/docs/api) · [OpenAPI 规范](https://layerback.com/openapi.yaml)

## 日本語

本リポジトリは図表変換ツール LayerBack の MCP Server です。Claude Desktop、Claude Code、Cursor など MCP 対応クライアントから図表画像を編集可能なファイルへ変換できます。LayerBack の公式サイトは [layerback.com](https://layerback.com/ja) です。

### できること

- フローチャートのスクリーンショットや PNG・JPEG・WebP（≤20 MB）画像を、AI の構造再構築によりネイティブ図形・コネクタ・編集可能なテキストへ変換します。
- 一度の変換で VSDX（Visio）、PPTX（PowerPoint）、draw.io XML、SVG の四種類の編集可能な形式を同時に出力します。
- API と内蔵オンラインエディタを提供し、Web 版では PDF のページ選択レンダリングによるアップロード変換にも対応しています。
- アップロードしたファイルと生成物は約 72 時間後に削除されます。大規模で細線の多い図面（平面図・回路図など）は対象外です。

### 使い方

Node 18+ が必要です。アカウント設定ページ（`/settings/apikeys`）で API Key を作成し、以下の設定を MCP クライアントに記述すると、自然言語のプロンプトから `convert_diagram_image`（ローカルの PNG/JPG/WebP を変換、デフォルトで約 30–60 秒待機）、`get_conversion_status`（ジョブ状態の確認）、`download_converted_diagram`（指定形式でローカルに保存）を呼び出して単体または一括で図表を変換できます：

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

**料金**：サブスクリプション Pro $20/月または $120/年、Plus $40/月または $240/年、Max $80/月または $480/年；都度購入クレジットパック 単発 10 クレジット $3.99、200 クレジット $10、500 クレジット $20、1500 クレジット $40、5000 クレジット $80；一度の変換で 10 クレジット/枚を消費（全形式を含む・失敗時は消費なし）；変換とプレビューは無料・ログイン不要、新規登録時の無料クレジット付与はなく、ダウンロード・編集にはログインと 10 クレジットが必要です。

**関連リンク**：[LayerBack 日本語ページ](https://layerback.com/ja) · [公式サイト](https://layerback.com) · [API ドキュメント](https://layerback.com/ja/docs/api) · [OpenAPI 仕様](https://layerback.com/openapi.yaml)

MIT © LayerBack
