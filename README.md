# GenChat

GenChat is an offchain browser extension that adds contextual AI assistance to GenLayer-related content on desktop browsers. It detects relevant docs pages and relevant X/Twitter posts, captures a bounded local snapshot of what the user is reading, and sends that context to a shared hosted backend for grounded responses.

The v1 architecture is designed for zero tester setup:

- no local model install
- no local helper service
- no API key entry in the extension
- no onchain dependency

Testers load the unpacked extension once, visit supported pages, and GenChat works immediately.

## What It Does

- Detects relevant GenLayer docs pages using URL, title, headings, and glossary-aware relevance scoring
- Detects relevant X/Twitter posts using feed-specific active tweet selection logic
- Injects the UI through a Shadow DOM content-script app so page styles do not break the extension
- Builds grounded prompts from page snapshots while treating page and tweet text as untrusted data
- Sends chat requests through a shared Cloudflare Worker backend
- Uses hosted inference through Workers AI with hard usage guardrails for public testing

## Architecture

### Frontend

`apps/extension`

- Manifest V3 browser extension
- React-based injected overlay UI
- Docs mode and X mode context handling
- Local storage for settings and session state
- Packaged extension icons and tester-ready release output

### Backend

`apps/api`

- Cloudflare Workers runtime
- Hono API
- Hosted AI orchestration through the Worker `AI` binding
- Input validation, request limits, and usage throttling
- Health and chat endpoints for the extension

### Shared Contracts

`packages/shared`

- Zod schemas
- snapshot contracts
- glossary seed data
- prompt helpers
- retrieval helpers
- product constants and defaults

## Monorepo Layout

```text
apps/
  api/
  extension/
packages/
  shared/
scripts/
release/
```

## Core Endpoints

The hosted API exposes:

- `GET /api/v1/health`
- `POST /api/v1/chat/bootstrap`
- `POST /api/v1/chat/turn`

## Local Development

### Prerequisites

- Node.js 20+
- npm
- A Chromium browser such as Chrome, Brave, or Edge
- A Cloudflare account for API deployment

### Install

```bash
npm install
```

### Configure the Extension

Create `apps/extension/.env` from `apps/extension/.env.example` and set:

```env
VITE_GENCHAT_API_BASE=https://your-worker-url.workers.dev
```

### Run the Extension Build Watcher

```bash
npm run dev:extension
```

Load the unpacked extension from `apps/extension/dist` in `chrome://extensions`.

### Run the Local API Dev Server

```bash
npm run dev:api
```

If you want to run the Worker runtime directly during backend development, use:

```bash
npm run dev --workspace @genchat/api
npm run dev:worker --workspace @genchat/api
```

## Build And Test

```bash
npm run build
npm run test
```

## Deploy The Hosted API

1. Authenticate Wrangler:

```bash
npx wrangler login
```

2. Review production variables in `apps/api/wrangler.jsonc`.

3. Deploy:

```bash
npm run deploy:api
```

4. Confirm the deployment:

```text
https://<your-worker-url>/api/v1/health
```

5. Update `apps/extension/.env` so the extension points at the deployed Worker URL.

6. Rebuild the workspace:

```bash
npm run build
```

## Public Tester Release

Once the API is live and `apps/extension/.env` points at it, generate the public tester package:

```bash
npm run release:tester
```

That command:

- verifies the live API health endpoint
- rebuilds the workspace
- creates `release/tester-extension`
- creates `release/tester-extension.zip`
- writes an `INSTALL.txt` for testers

Testers install by:

1. Opening `chrome://extensions`
2. Turning on `Developer mode`
3. Clicking `Load unpacked`
4. Selecting `release/tester-extension`

Public testing notes are in `PUBLIC_TESTING.md`.

## Environment Notes

### Extension

- `VITE_GENCHAT_API_BASE`

### Worker

- `GENCHAT_PUBLIC_ORIGIN`
- `GENCHAT_SESSION_LIMIT`
- `GENCHAT_DAILY_LIMIT`
- `AI` binding

## Current Scope

- Fully offchain
- Desktop Chromium browsers only
- Shared hosted backend
- Docs mode and X/Twitter mode
- No extension-bundled secrets
- Public testing constrained by free-tier backend limits

## License

No license file is currently included in this repository.
