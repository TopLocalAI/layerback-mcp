#!/usr/bin/env node
/**
 * LayerBack MCP server — lets AI agents convert diagram images
 * (PNG/JPG/WebP/screenshots/whiteboard photos) into fully editable
 * Visio (VSDX), PowerPoint (PPTX), draw.io, and SVG files.
 *
 * Env:
 *   LAYERBACK_API_KEY   required — create one at https://layerback.com/settings/apikeys
 *   LAYERBACK_BASE_URL  optional — defaults to https://layerback.com
 */

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const BASE_URL = (
  process.env.LAYERBACK_BASE_URL || 'https://layerback.com'
).replace(/\/$/, '');
const API_KEY = process.env.LAYERBACK_API_KEY;

if (!API_KEY) {
  console.error(
    'LAYERBACK_API_KEY is required. Create one at https://layerback.com/settings/apikeys'
  );
  process.exit(1);
}

const FORMATS = ['vsdx', 'pptx', 'drawio', 'svg', 'ir', 'preview'];

async function api(path, init = {}) {
  const response = await fetch(`${BASE_URL}/api/v1${path}`, {
    ...init,
    headers: { 'x-api-key': API_KEY, ...(init.headers || {}) },
  });
  return response;
}

async function getStatus(jobId) {
  const response = await api(`/jobs/${jobId}`);
  if (!response.ok) {
    throw new Error(`status check failed: ${response.status}`);
  }
  return response.json();
}

const server = new McpServer({ name: 'layerback', version: '0.1.0' });

server.tool(
  'convert_diagram_image',
  'Convert a diagram image (flowchart, architecture diagram, org chart, network map — PNG/JPG/WebP file, screenshot, or whiteboard photo) into fully editable Visio (VSDX), PowerPoint (PPTX), draw.io, and SVG files. Every shape, connector, and label becomes a real editable object. Costs 10 LayerBack credits. Returns a job_id; by default waits for completion (~30-60s).',
  {
    file_path: z
      .string()
      .describe('Absolute path to the diagram image (PNG, JPG, or WebP)'),
    wait: z
      .boolean()
      .default(true)
      .describe(
        'Wait for the conversion to finish (recommended). If false, poll with get_conversion_status.'
      ),
  },
  async ({ file_path, wait }) => {
    const bytes = await readFile(resolve(file_path));
    const response = await api('/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: bytes,
    });
    if (!response.ok) {
      const detail = await response.text();
      return {
        content: [
          {
            type: 'text',
            text: `Conversion failed to start (${response.status}): ${detail}`,
          },
        ],
        isError: true,
      };
    }
    const { job_id } = await response.json();
    if (!wait) {
      return {
        content: [
          {
            type: 'text',
            text: `Conversion started. job_id: ${job_id}. Poll with get_conversion_status.`,
          },
        ],
      };
    }
    const deadline = Date.now() + 5 * 60 * 1000;
    let state = { status: 'queued' };
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 5000));
      state = await getStatus(job_id);
      if (state.status === 'succeeded' || state.status === 'failed') break;
    }
    if (state.status !== 'succeeded') {
      return {
        content: [
          {
            type: 'text',
            text: `Conversion ${state.status} (job_id: ${job_id})${state.error ? `: ${state.error}` : ''}`,
          },
        ],
        isError: state.status === 'failed',
      };
    }
    return {
      content: [
        {
          type: 'text',
          text:
            `Conversion succeeded in ${state.total_seconds}s. job_id: ${job_id}. ` +
            `Available formats: ${(state.formats || FORMATS).join(', ')}. ` +
            'Use download_converted_diagram to save a file.',
        },
      ],
    };
  }
);

server.tool(
  'get_conversion_status',
  'Check the status of a LayerBack diagram conversion job.',
  { job_id: z.string().describe('The job id returned by convert_diagram_image') },
  async ({ job_id }) => {
    const state = await getStatus(job_id);
    return { content: [{ type: 'text', text: JSON.stringify(state) }] };
  }
);

server.tool(
  'download_converted_diagram',
  'Download one output of a finished LayerBack conversion to a local file. Formats: vsdx (Visio), pptx (PowerPoint), drawio, svg, ir (structured JSON), preview (PNG). Downloads are free and repeatable.',
  {
    job_id: z.string().describe('The job id of a succeeded conversion'),
    format: z.enum(FORMATS).default('vsdx').describe('Which output to download'),
    output_path: z
      .string()
      .describe('Absolute path to write the file, e.g. /tmp/diagram.vsdx'),
  },
  async ({ job_id, format, output_path }) => {
    const response = await api(`/jobs/${job_id}/download?format=${format}`);
    if (!response.ok) {
      return {
        content: [
          {
            type: 'text',
            text: `Download failed (${response.status}) — is the job finished?`,
          },
        ],
        isError: true,
      };
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    const target = resolve(output_path);
    await writeFile(target, bytes);
    return {
      content: [
        {
          type: 'text',
          text: `Saved ${format} (${bytes.length} bytes) to ${target}`,
        },
      ],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
