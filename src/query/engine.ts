import { Store } from '../core/store';

export class QueryEngine {
  constructor(private store: Store) {}

  find(
    collection: string,
    condition?: { path: string; operator: string; value: unknown }
  ): unknown[] {
    const allKeys = this.store.keys();
    const prefix = collection + ':';

    const collectionKeys = allKeys.filter((k) => k.startsWith(prefix));
    const results: unknown[] = [];

    for (const key of collectionKeys) {
      const doc = this.store.getRaw(key);
      if (doc === null) continue;

      const id = key.includes(':') ? key.split(':')[1] : key;
      const docWithId =
        typeof doc === 'object' && doc !== null
          ? { id, ...(doc as Record<string, unknown>) }
          : { id, value: doc };

      if (!condition) {
        results.push(docWithId);
        continue;
      }

      const val = this.resolvePath(doc, condition.path);
      if (this.applyCondition(val, condition.operator, condition.value)) {
        results.push(docWithId);
      }
    }

    return results;
  }

  private resolvePath(obj: unknown, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = obj;
    for (const part of parts) {
      if (current === null || typeof current !== 'object') return null;
      current = (current as Record<string, unknown>)[part];
      if (current === undefined) return null;
    }
    return current;
  }

  private applyCondition(actual: unknown, operator: string, expected: unknown): boolean {
    switch (operator) {
      case '=':
        return actual == expected;
      case '>':
        return (actual as number | string) > (expected as number | string);
      case '<':
        return (actual as number | string) < (expected as number | string);
      default:
        return false;
    }
  }
}
