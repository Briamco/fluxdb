import { describe, it, expect, beforeEach } from 'vitest';
import { Store } from '../../src/core/store';

describe('Store', () => {
  let store: Store;

  beforeEach(() => {
    store = new Store();
  });

  it('should set and get a value', () => {
    store.set('name', 'Briam');
    expect(store.get('name')).toBe('Briam');
  });

  it('should return null for non-existent key', () => {
    expect(store.get('notfound')).toBeNull();
  });

  it('should handle nested paths in get', () => {
    store.set('user', { profile: { name: 'Alice' } });
    expect(store.get('user.profile.name')).toBe('Alice');
  });

  it('should handle partial updates with set', () => {
    store.set('user', { name: 'Alice' });
    store.set('user.age', 30);
    expect(store.get('user')).toEqual({ name: 'Alice', age: 30 });
  });

  it('should expire keys based on TTL', async () => {
    store.set('temp', 'value', 10); // 10ms TTL
    expect(store.get('temp')).toBe('value');

    // Wait for expiration
    await new Promise((resolve) => setTimeout(resolve, 15));

    expect(store.get('temp')).toBeNull();
  });

  it('should return collections as arrays', () => {
    store.set('user:1', { name: 'Alice' });
    store.set('user:2', { name: 'Bob' });

    const users = store.get('user');
    expect(Array.isArray(users)).toBe(true);
    expect(users).toHaveLength(2);
    expect(users).toContainEqual({ id: '1', name: 'Alice' });
    expect(users).toContainEqual({ id: '2', name: 'Bob' });
  });
});
