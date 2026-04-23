# ⚡ FluxDB

[![CI](https://github.com/gbria/fluxdb/actions/workflows/ci.yml/badge.svg)](https://github.com/gbria/fluxdb/actions/workflows)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

FluxDB is a lightweight, in-memory JSON document database designed for speed and simplicity. It combines the ease of use of a key-value store with the power of JSON path queries and document collections.

## 🚀 Features

- **In-Memory Storage**: Blazing fast operations.
- **JSON Document Support**: Store complex objects and query nested properties.
- **TTL Support**: Automatic lazy expiration of keys.
- **Collection Queries**: Group data using prefixes and query them as a list.
- **Aesthetic CLI**: Interactive terminal with syntax highlighting and colors.
- **Fluent JS/TS SDK**: Modern query builder interface.
- **HTTP REST API**: Fully accessible via standard HTTP methods.

## 📦 Installation

### As a CLI tool (Global)
```bash
npm install -g fluxdb
```
Then run:
```bash
flux
```

### As an SDK (Local)
```bash
npm install fluxdb
```

## 🛠️ Getting Started (Development)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Tests**:
   ```bash
   npm test
   ```

3. **Start the Server**:
   ```bash
   npm run start:server
   ```

## 🖥️ CLI Usage

```bash
flux > set user:1 {"name": "Briam", "age": 25}
flux > get user:1.name
flux > find user age > 20
```

## 📦 SDK Usage

```javascript
import { FluxDB } from 'fluxdb';

const db = new FluxDB('http://localhost:3000');

// Fluent chainable queries
const seniors = await db.find('user', 'age').gt(30);
```

## 🔌 Integration Example (C#)

```csharp
using System.Net.Http.Json;
var client = new HttpClient();
await client.PostAsJsonAsync("http://localhost:3000/set", new { key = "x", value = 1 });
```

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT © [Briam](LICENSE)
