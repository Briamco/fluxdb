# 🧠 FluxDB Project Context

This file serves as the foundational mandate for FluxDB development.

## 🎯 Project Overview
FluxDB is a lightweight in-memory JSON document database with a hybrid key-value/document store architecture.

## 🏗️ Technical Architecture
- **Core Store**: Native `Map` based storage with lazy TTL expiration and nested path support (`set user:1.age 25`).
- **HTTP Server**: Express-based REST API (Port 3000).
- **Query Engine**: Prefix-based collection filtering with support for `=`, `>`, and `<` operators.
- **CLI**: Interactive REPL with custom tokenizer/parser and ANSI color support.
- **SDK**: TypeScript/JavaScript SDK with a fluent Query Builder interface (`db.find('user', 'age').gt(30)`).

## 📜 Mandates & Conventions
- **TypeScript First**: Strict typing is required. No `any` unless absolutely necessary.
- **Surgical Updates**: Use targeted edits to maintain codebase integrity.
- **Separation of Concerns**: Keep store logic, server routes, and CLI parsing in their respective modules.
- **Aesthetics Matter**: Maintain the colored/stylized output of the CLI.
- **Documentation**: Keep the README updated with any new integration examples or API changes.
- **Testing**: Every new feature or bug fix MUST include unit tests. Use Vitest.
- **Code Quality**: Adhere to ESLint and Prettier configurations. CI MUST pass for all PRs.

## 📍 Current Status
- Prototype MVP delivered.
- Open Source Architecture established (Testing, Linting, CI/CD).
- HTTP API fully operational.
- Interactive CLI with syntax highlighting.
- Fluent JS/TS SDK implemented.
- C# integration examples provided.
