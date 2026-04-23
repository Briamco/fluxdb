export interface StoreValue {
  value: unknown;
  expiresAt: number | null;
  lastAccessed: number;
}

export class Store {
  private data: Map<string, StoreValue> = new Map();

  set(key: string, value: unknown, ttl?: number): string {
    const dotIndex = key.indexOf('.');

    if (dotIndex === -1) {
      // Standard set
      const expiresAt = ttl ? Date.now() + ttl : null;
      this.data.set(key, {
        value,
        expiresAt,
        lastAccessed: Date.now(),
      });
      return 'OK';
    }

    // Path-based set (e.g., "user:1.age")
    const baseKey = key.substring(0, dotIndex);
    const path = key.substring(dotIndex + 1);

    let entry = this.data.get(baseKey);

    // If it doesn't exist or is expired, create a new object
    if (!entry || (entry.expiresAt && entry.expiresAt < Date.now())) {
      entry = {
        value: {},
        expiresAt: ttl ? Date.now() + ttl : null,
        lastAccessed: Date.now(),
      };
    }

    entry.value = this.setPath(entry.value, path, value);
    entry.lastAccessed = Date.now();
    this.data.set(baseKey, entry);

    return 'OK';
  }

  private setPath(obj: unknown, path: string, value: unknown): unknown {
    let target: Record<string, unknown>;
    if (obj === null || typeof obj !== 'object') {
      target = {};
    } else {
      target = obj as Record<string, unknown>;
    }

    const parts = path.split('.');
    let current = target;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (
        current[part] === undefined ||
        current[part] === null ||
        typeof current[part] !== 'object'
      ) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = value;
    return target;
  }

  get(key: string): unknown | null {
    // 1. Try exact match
    const entry = this.data.get(key);
    if (entry) {
      if (entry.expiresAt && entry.expiresAt < Date.now()) {
        this.data.delete(key);
        return null;
      }
      entry.lastAccessed = Date.now();
      return entry.value;
    }

    // 2. Check if it's a JSON path (e.g., "user:1.name")
    const dotIndex = key.indexOf('.');
    if (dotIndex !== -1) {
      const baseKey = key.substring(0, dotIndex);
      const path = key.substring(dotIndex + 1);
      const baseEntry = this.data.get(baseKey);

      if (baseEntry) {
        if (baseEntry.expiresAt && baseEntry.expiresAt < Date.now()) {
          this.data.delete(baseKey);
          return null;
        }
        baseEntry.lastAccessed = Date.now();
        return this.resolvePath(baseEntry.value, path);
      }
    }

    // 3. Check if it's a collection (e.g., "users" -> "users:*")
    const prefix = key + ':';
    const collectionResults: unknown[] = [];
    let found = false;

    for (const [k, v] of this.data.entries()) {
      if (k.startsWith(prefix)) {
        if (v.expiresAt && v.expiresAt < Date.now()) {
          this.data.delete(k);
          continue;
        }
        const id = k.includes(':') ? k.split(':')[1] : k;
        const val = v.value;
        const result =
          typeof val === 'object' && val !== null
            ? { id, ...(val as Record<string, unknown>) }
            : { id, value: val };
        collectionResults.push(result);
        found = true;
      }
    }

    return found ? collectionResults : null;
  }

  private resolvePath(obj: unknown, path: string): unknown | null {
    const parts = path.split('.');
    let current: unknown = obj;

    for (const part of parts) {
      if (current === null || typeof current !== 'object') {
        return null;
      }
      current = (current as Record<string, unknown>)[part];
      if (current === undefined) {
        return null;
      }
    }

    return current ?? null;
  }

  del(key: string): number {
    return this.data.delete(key) ? 1 : 0;
  }

  exists(key: string): number {
    const val = this.get(key);
    return val !== null ? 1 : 0;
  }

  keys(): string[] {
    const result: string[] = [];
    const now = Date.now();
    for (const [key, entry] of this.data.entries()) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.data.delete(key);
      } else {
        result.push(key);
      }
    }
    return result;
  }

  getRaw(key: string): unknown | null {
    const entry = this.data.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.data.delete(key);
      return null;
    }
    return entry.value;
  }
}

export const globalStore = new Store();
