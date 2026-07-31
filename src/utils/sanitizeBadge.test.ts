import { describe, it, expect } from 'vitest';
import { sanitizeBadge } from './sanitizeBadge';

describe('sanitizeBadge', () => {
  it('lowercases a standard badge', () => {
    expect(sanitizeBadge('Intermedio')).toBe('intermedio');
  });

  it('replaces + with -plus in Principiante+', () => {
    expect(sanitizeBadge('Principiante+')).toBe('principiante-plus');
  });

  it('handles empty string', () => {
    expect(sanitizeBadge('')).toBe('');
  });

  it('leaves already-sanitized string unchanged', () => {
    expect(sanitizeBadge('principiante-plus')).toBe('principiante-plus');
  });

  it('replaces multiple + in one string', () => {
    expect(sanitizeBadge('a+b+')).toBe('a-plusb-plus');
  });
});
