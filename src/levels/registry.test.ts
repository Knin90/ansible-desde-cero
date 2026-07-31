import { describe, it, expect } from 'vitest';
import { levelRegistry } from './registry';

describe('levelRegistry', () => {
  it('has 23 levels (0 through 22)', () => {
    expect(levelRegistry).toHaveLength(23);
  });

  it('all level IDs are unique', () => {
    const ids = levelRegistry.map(l => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every level has a non-empty title, subtitle, and badge', () => {
    for (const level of levelRegistry) {
      expect(level.title).toBeTruthy();
      expect(level.subtitle).toBeTruthy();
      expect(level.badge).toBeTruthy();
    }
  });

  it('every level has at least one module', () => {
    for (const level of levelRegistry) {
      expect(level.modules.length).toBeGreaterThan(0);
    }
  });

  it('module IDs within each level are unique', () => {
    for (const level of levelRegistry) {
      const ids = level.modules.map(m => m.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
