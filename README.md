# ⚡ FluxDB

[![CI](https://github.com/gbria/fluxdb/actions/workflows/ci.yml/badge.svg)](https://github.com/gbria/fluxdb/actions/workflows)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

FluxDB is a lightweight, high-performance in-memory JSON document database. It combines the simplicity of a key-value store with the power of JSON path queries and document collections.

## 🚀 Features

- **Blazing Fast**: Pure in-memory storage using native TypeScript Maps.
- **JSON Document Support**: Store complex nested objects and access them via **dot notation**.
- **Lazy TTL**: Set expiration times for any key. Memory is reclaimed automatically during reads.
- **Smart Collections**: Prefix-based grouping (e.g., `user:1`, `user:2`) allows querying documents as a collection.
- **Advanced Queries**: Filter collections using operators (`=`, `>`, `<`) on any document property.
- **Aesthetic CLI**: Interactive REPL with syntax highlighting and built-in background server management via PM2.
- **Fluent SDK**: Chainable, type-safe TypeScript/JavaScript SDK for modern development.
- **RESTful API**: Standard HTTP interface for easy integration with any language.

## 📦 Installation

### As a Global CLI Tool
```bash
npm install -g fluxdb
```

### As a Project Dependency (SDK)
```bash
npm install fluxdb
```

## 🖥️ CLI & Server Management

FluxDB comes with a powerful CLI that manages its own server process using PM2.

```bash
# Start the FluxDB server in the background
flux start

# Check server health and resource usage
flux status

# Enter the interactive REPL
flux

# Stop the server
flux stop

# View real-time server logs
flux logs
```

### REPL Examples
```bash
flux > set user:1 {"name": "Briam", "age": 25, "role": "admin"}
{"result":"OK"}

# Access nested properties
flux > get user:1.name
"Briam"

# Query collections
flux > find user age > 20
[
  { "id": "1", "name": "Briam", "age": 25, "role": "admin" }
]
```

## 📦 SDK Usage

The SDK provides a fluent interface for interacting with your database.

```typescript
import { FluxDB } from 'fluxdb';

const db = new FluxDB('http://localhost:3000');

// Set documents with optional TTL (in milliseconds)
await db.set('product:42', { name: 'Keyboard', price: 59.99 }, 3600000);

// Fluent chainable queries
const premiumProducts = await db.find('product', 'price').gt(50);

// Get all documents in a collection
const allUsers = await db.all('user');

// Update nested paths directly
await db.update('user:1.profile.lastLogin', Date.now());
```

## 🌐 REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/set` | Store a key/value. Body: `{key, value, ttl?}` |
| `GET`  | `/get` | Retrieve value. Query: `?key=...` |
| `DEL`  | `/del` | Delete a key. Query: `?key=...` |
| `GET`  | `/exists`| Check if key exists. Query: `?key=...` |
| `GET`  | `/find` | Filter collection. Query: `?collection=...&path=...&op=...&val=...` |
| `GET`  | `/keys` | List all non-expired keys. |

## 🔌 Language Integrations

### C# / .NET
```csharp
using System.Net.Http.Json;

var client = new HttpClient();
var response = await client.PostAsJsonAsync("http://localhost:3000/set", new { 
    key = "config:theme", 
    value = "dark" 
});
```

### Python
```python
import requests

res = requests.post("http://localhost:3000/set", json={
    "key": "status",
    "value": "online"
})
print(res.json())
```

## 🛠️ Development

1. **Clone & Install**:
   ```bash
   git clone https://github.com/gbria/fluxdb.git
   cd fluxdb
   npm install
   ```

2. **Run Tests**:
   ```bash
   npm test
   ```

3. **Build**:
   ```bash
   npm run build
   ```

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT © [Briam](LICENSE)
