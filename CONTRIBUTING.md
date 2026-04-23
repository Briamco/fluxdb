# Contributing to FluxDB

First off, thank you for considering contributing to FluxDB! It's people like you that make FluxDB such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct. (Link to be added)

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please create an issue on GitHub with:
- A clear title and description.
- Steps to reproduce the bug.
- What you expected to happen.
- What actually happened.
- Your OS and Node.js version.

### Suggesting Enhancements

We welcome new ideas! Please open an issue and describe:
- The problem this enhancement would solve.
- How you imagine the feature working.

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. Install dependencies: `npm install`.
3. If you've added code that should be tested, add tests.
4. Ensure the test suite passes: `npm test`.
5. Make sure your code follows the linting rules: `npm run lint`.
6. Submit a Pull Request!

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/fluxdb.git
cd fluxdb

# Install dependencies
npm install

# Start development server
npm run start:server

# Run tests
npm test
```

## Style Guide

We use ESLint and Prettier for code styling. Please run `npm run format` before committing.
