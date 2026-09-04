# DealFinder Prototype - Phase 2

This repository extends the Phase 1 static prototype with a minimal backend and a pluggable Source Adapter architecture for Phase 2: the DealFinder Engine.

Overview

- Frontend: the existing static UI (index.html, style.css, app.js) is preserved. The frontend fetches live deals from the new backend API; if no sources are configured it shows an honest empty state.
- Backend: Node.js + Express API implementing a Deal Engine, Source Registry, GenericFeedAdapter, SQLite data store, sync engine, and API endpoints.
- Sources: adapters are pluggable. A GenericFeedAdapter supports JSON, JSONL, CSV and XML product feeds. Adapter configuration comes from environment variables.

Architecture

Frontend -> API -> Deal Engine -> Product DB (SQLite) -> Source Adapters -> External Feeds

Files created

- package.json
- server.js
- src/db.js
- src/models/models.js
- src/adapters/sourceAdapter.js
- src/adapters/genericFeedAdapter.js
- src/registry.js
- src/engine/sync.js
- src/routes/api.js
- .env.example
- .gitignore
- README.md (updated)
- Updated app.js to call the API

How to run locally

1. Install:
   npm install

2. Copy .env.example to .env and edit if needed. By default no feeds are configured.

3. Start:
   npm start

   The server serves the frontend and API at http://localhost:3000

Environment variables

- PORT - server port (default 3000)
- DATABASE_FILE - SQLite file path (default ./data/dealfinder.db)
- FEED_URLS - comma-separated feed URLs for GenericFeedAdapter (optional)

Source Adapters

- GenericFeedAdapter (supports JSON, JSONL, CSV, XML feeds)

How to add a new Source Adapter

- Implement the SourceAdapter interface in src/adapters, register in src/registry.js and ensure configuration (credentials or feed URLs) are supplied via environment variables.

How to run a source sync

- POST /api/sync/:sourceId will run a sync for a configured source id (see /api/sources for registered ids)

API endpoints

- GET /api/health
- GET /api/sources
- GET /api/products?q=
- GET /api/deals
- GET /api/deals/:id
- GET /api/search?q=
- GET /api/merchants
- GET /api/categories
- POST /api/sync/:sourceId

Security

Do NOT commit API keys, secrets, or affiliate credentials. Use environment variables and keep .env out of version control.

Testing

Run tests with:

  npm test

Current limitations / Next steps

- The GenericFeedAdapter requires feed URLs in FEED_URLS. If none are configured the API will return an empty state.
- Additional adapters (Awin, Amazon, eBay, etc.) are not implemented but the adapter interface and registry are ready.

