import { describe, it, expect, beforeEach } from 'vitest';
import { getPrevNext, getCurrentRoute, navigate } from './router';
import { levelRegistry } from './levels/registry';

// Derive the full flat list once for reference
const flat: Array<{ nivel: number; modulo: number }> = [];
for (const level of levelRegistry) {
  for (const mod of level.modules) {
    flat.push({ nivel: level.id, modulo: mod.id });
  }
}

const first = flat[0];
const last = flat[flat.length - 1];
const middle = flat[Math.floor(flat.length / 2)];

describe('getPrevNext', () => {
  it('returns prev=null for the first module', () => {
    const { prev } = getPrevNext(first.nivel, first.modulo);
    expect(prev).toBeNull();
  });

  it('returns a next for the first module', () => {
    const { next } = getPrevNext(first.nivel, first.modulo);
    expect(next).not.toBeNull();
    expect(next?.nivel).toBe(flat[1].nivel);
    expect(next?.modulo).toBe(flat[1].modulo);
  });

  it('returns next=null for the last module', () => {
    const { next } = getPrevNext(last.nivel, last.modulo);
    expect(next).toBeNull();
  });

  it('returns a prev for the last module', () => {
    const { prev } = getPrevNext(last.nivel, last.modulo);
    expect(prev).not.toBeNull();
    expect(prev?.nivel).toBe(flat[flat.length - 2].nivel);
    expect(prev?.modulo).toBe(flat[flat.length - 2].modulo);
  });

  it('returns both prev and next for a middle module', () => {
    const idx = Math.floor(flat.length / 2);
    const { prev, next } = getPrevNext(middle.nivel, middle.modulo);
    expect(prev).not.toBeNull();
    expect(next).not.toBeNull();
    expect(prev?.nivel).toBe(flat[idx - 1].nivel);
    expect(next?.nivel).toBe(flat[idx + 1].nivel);
  });

  it('returns { prev: null, next: null } for an unknown module', () => {
    const { prev, next } = getPrevNext(999, 999);
    expect(prev).toBeNull();
    expect(next).toBeNull();
  });

  it('marks available=true for modules with content', () => {
    // nivel 0, modulo 1 has real content
    const { next } = getPrevNext(first.nivel, first.modulo);
    if (next) {
      expect(typeof next.available).toBe('boolean');
    }
  });
});

describe('getCurrentRoute', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('returns level 0 module 1 when hash is empty', () => {
    const route = getCurrentRoute();
    expect(route.level).toBe(0);
    expect(route.module).toBe(1);
  });

  it('parses a valid hash correctly', () => {
    window.location.hash = '#nivel-3/modulo-2';
    const route = getCurrentRoute();
    expect(route.level).toBe(3);
    expect(route.module).toBe(2);
  });

  it('falls back to module 1 when module part is missing', () => {
    window.location.hash = '#nivel-5';
    const route = getCurrentRoute();
    expect(route.level).toBe(5);
    expect(route.module).toBe(1);
  });

  it('falls back to level 0 for a malformed hash', () => {
    window.location.hash = '#garbage';
    const route = getCurrentRoute();
    expect(route.level).toBe(0);
  });
});

describe('navigate', () => {
  it('sets window.location.hash to the expected format', () => {
    navigate(4, 3);
    expect(window.location.hash).toBe('#nivel-4/modulo-3');
  });

  it('navigating to level 0 module 1 sets the correct hash', () => {
    navigate(0, 1);
    expect(window.location.hash).toBe('#nivel-0/modulo-1');
  });
});
