import { describe, it, expect } from 'vitest';
import { getModuleContent } from './contentRouter';

describe('getModuleContent', () => {
  it('returns content for a known level 0 module', () => {
    const content = getModuleContent(0, 1);
    expect(content).toBeDefined();
    expect(content?.levelId).toBe(0);
    expect(content?.moduleId).toBe(1);
  });

  it('returns content for a known level 5 module', () => {
    const content = getModuleContent(5, 1);
    expect(content).toBeDefined();
    expect(content?.levelId).toBe(5);
  });

  it('returns content for a nivel6to22 level', () => {
    const content = getModuleContent(6, 1);
    expect(content).toBeDefined();
    expect(content?.levelId).toBe(6);
  });

  it('returns undefined for an unknown level', () => {
    expect(getModuleContent(999, 1)).toBeUndefined();
  });

  it('returns undefined for a valid level but non-existent module', () => {
    expect(getModuleContent(0, 999)).toBeUndefined();
  });

  it('every returned content has title, objective, and at least one step', () => {
    const content = getModuleContent(1, 2);
    expect(content?.title).toBeTruthy();
    expect(content?.objective).toBeTruthy();
    expect(content?.steps.length).toBeGreaterThan(0);
  });
});
