# 🧠 FluxDB Project Context

This file serves as the foundational mandate for FluxDB development. It contains the technical architecture, operational guidelines, and project status.

## 🎯 Project Overview
FluxDB is a lightweight in-memory JSON document database with a hybrid key-value/document store architecture. It is designed for speed, simplicity, and ease of integration across different platforms.

## 🏗️ Technical Architecture

### 1. Core Store (`src/core/store.ts`)
- **Native Storage**: Uses a TypeScript `Map<string, StoreValue>` for O(1) access.
- **Lazy TTL**: Expiration is checked during read operations (`get`, `keys`, `exists`). Expired entries are deleted on-the-fly.
- **Path-based Access**: Supports dot notation for both `set` and `get` (e.g., `set user:1.profile.age 25`).
- **Collection Support**: If a key does not match exactly, the store checks for a collection prefix (e.g., `get user` will return all keys starting with `user:`).
- **Auto-ID in Collections**: When retrieving a collection, documents are returned as an array with an added `id` field derived from the key suffix.

### 2. HTTP Server (`src/server/app.ts`)
- **Framework**: Express-based REST API running on port **3000** by default.
- **Endpoints**:
    - `POST /set`: Sets a key/value. Body: `{ key, value, ttl? }`.
    - `GET /get?key=...`: Retrieves a value or collection.
    - `DELETE /del?key=...`: Deletes a key.
    - `GET /exists?key=...`: Checks for existence (returns 1 or 0).
    - `GET /keys`: Lists all active (non-expired) keys.
    - `GET /find?collection=...&path=...&op=...&val=...`: Advanced query endpoint.

### 3. Query Engine (`src/query/engine.ts`)
- **Capabilities**: Filtering collections based on document properties.
- **Operators**: Supports `=`, `>`, and `<`.
- **Path Resolution**: Can filter by nested properties (e.g., `find users profile.age > 18`).

### 4. Interactive CLI (`src/cli/repl.ts`)
- **Process Management**: Uses **PM2** to manage the server process in the background.
    - `flux start`: Starts server via PM2.
    - `flux stop`: Stops server.
    - `flux status`: Shows CPU/Memory usage.
    - `flux logs`: Streams server logs.
- **REPL**: Interactive shell with custom tokenizer/parser and ANSI color-coded JSON output.

### 5. SDK (`src/sdk/index.ts`)
- **Fluent Interface**: Chainable query builder for modern DX.
- **Example**: `const users = await db.find('user', 'age').gt(25);`
- **Methods**: `set`, `get`, `del`, `exists`, `keys`, `find`, `all`, `update`.

## 📜 Mandates & Conventions
- **TypeScript First**: Strict typing is required. Avoid `any`. Use interfaces for data structures.
- **Surgical Updates**: Maintain codebase integrity with targeted edits.
- **Separation of Concerns**: Keep store logic, server routes, query engine, and CLI parsing in their respective modules.
- **Aesthetics**: Maintain the colored/stylized output of the CLI and REPL.
- **Validation**:
    - **Testing**: Use **Vitest** for unit and integration tests.
    - **Linting**: Follow ESLint and Prettier rules (`npm run lint`, `npm run format`).
    - **CI**: GitHub Actions workflow (`ci.yml`) must pass for all changes.

## 🛠️ Development Workflow
- **Build**: `npm run build` (outputs to `dist/`).
- **Dev Mode**: Use `ts-node` for rapid iteration (`start:server`, `start:cli`).
- **Port**: Default port is 3000. Ensure it's available or configurable.

## 📍 Current Status
- ✅ Core Map-based Store with Path support.
- ✅ Lazy TTL Expiration.
- ✅ REST API with Express.
- ✅ Query Engine with basic operators.
- ✅ Interactive CLI with PM2 integration.
- ✅ Fluent TypeScript SDK.
- ✅ CI/CD Pipeline (Linting, Testing, Build).
- ✅ C# Integration Documentation.
