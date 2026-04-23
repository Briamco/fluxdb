import express from 'express';
import { globalStore } from '../core/store';
import { QueryEngine } from '../query/engine';

const app = express();
app.use(express.json());

const queryEngine = new QueryEngine(globalStore);

app.post('/set', (req, res) => {
  const { key, value, ttl } = req.body;
  if (!key) return res.status(400).json({ error: 'Missing key' });
  const result = globalStore.set(key, value, ttl);
  res.json({ result });
});

app.get('/get', (req, res) => {
  const key = req.query.key as string;
  if (!key) return res.status(400).json({ error: 'Missing key' });
  const value = globalStore.get(key);
  res.json({ value });
});

app.delete('/del', (req, res) => {
  const key = req.query.key as string;
  if (!key) return res.status(400).json({ error: 'Missing key' });
  const count = globalStore.del(key);
  res.json({ count });
});

app.get('/exists', (req, res) => {
  const key = req.query.key as string;
  if (!key) return res.status(400).json({ error: 'Missing key' });
  const exists = globalStore.exists(key);
  res.json({ exists });
});

app.get('/keys', (req, res) => {
  res.json({ keys: globalStore.keys() });
});

// Basic find endpoint
// Example: /find?collection=users&path=age&op=>&val=18
app.get('/find', (req, res) => {
  const { collection, path, op, val } = req.query;
  if (!collection) return res.status(400).json({ error: 'Missing collection' });

  let condition;
  if (path && op && val) {
    condition = {
      path: path as string,
      operator: op as string,
      value: isNaN(Number(val)) ? val : Number(val),
    };
  }

  const results = queryEngine.find(collection as string, condition);
  res.json({ results });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`FluxDB server running on http://localhost:${PORT}`);
});
