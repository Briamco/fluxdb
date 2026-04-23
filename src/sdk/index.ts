/**
 * FluxDB Lightweight SDK
 */

export class FluxQueryBuilder<T = unknown> {
  constructor(
    private baseUrl: string,
    private collection: string,
    private path: string
  ) {}

  private async execute(op: string, val: unknown): Promise<T[]> {
    let url = `${this.baseUrl}/find?collection=${encodeURIComponent(this.collection)}`;
    url += `&path=${encodeURIComponent(this.path)}&op=${encodeURIComponent(
      op
    )}&val=${encodeURIComponent(val as string | number | boolean)}`;

    const response = await fetch(url);
    const data = await response.json();
    return data.results;
  }

  /** Match exactly */
  async eq(val: unknown): Promise<T[]> {
    return this.execute('=', val);
  }
  /** Greater than */
  async gt(val: unknown): Promise<T[]> {
    return this.execute('>', val);
  }
  /** Less than */
  async lt(val: unknown): Promise<T[]> {
    return this.execute('<', val);
  }
}

export class FluxDB {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }

  /**
   * Set a value or a whole document.
   */
  async set(key: string, value: unknown, ttl?: number): Promise<{ result: string }> {
    const response = await fetch(`${this.baseUrl}/set`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value, ttl }),
    });
    return response.json();
  }

  /**
   * Update a nested property using dot notation.
   */
  async update(path: string, value: unknown): Promise<{ result: string }> {
    return this.set(path, value);
  }

  /**
   * Get a value by key or a whole collection by prefix.
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    const response = await fetch(`${this.baseUrl}/get?key=${encodeURIComponent(key)}`);
    const data = await response.json();
    return data.value;
  }

  /**
   * Delete a key.
   */
  async del(key: string): Promise<{ count: number }> {
    const response = await fetch(`${this.baseUrl}/del?key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  /**
   * Check if a key exists.
   */
  async exists(key: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/exists?key=${encodeURIComponent(key)}`);
    const data = await response.json();
    return data.exists === 1;
  }

  /**
   * List all non-expired keys.
   */
  async keys(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/keys`);
    const data = await response.json();
    return data.keys;
  }

  /**
   * Start a fluent query.
   * Usage: await db.find('user', 'age').gt(30)
   */
  find<T = unknown>(collection: string, path: string): FluxQueryBuilder<T> {
    return new FluxQueryBuilder<T>(this.baseUrl, collection, path);
  }

  /**
   * Get all documents in a collection.
   */
  async all<T = unknown>(collection: string): Promise<T[]> {
    const response = await fetch(`${this.baseUrl}/get?key=${encodeURIComponent(collection)}`);
    const data = await response.json();
    return data.value || [];
  }
}
