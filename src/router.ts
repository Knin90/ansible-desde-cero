import { levelRegistry } from './levels/registry';
import { getModuleContent } from './components/contentRouter';

export interface Route {
  level: number;
  module: number;
}

export interface RouteRef {
  nivel: number;
  modulo: number;
  title: string;
  available: boolean;
}

export const SPECIAL_PAGES: Record<string, Route> = {
  'cheat-sheet': { level: -2, module: 0 },
  'snippets': { level: -3, module: 0 },
};

export function getCurrentRoute(): Route {
  const hash = window.location.hash.replace('#', '');

  if (SPECIAL_PAGES[hash]) {
    return SPECIAL_PAGES[hash];
  }

  const [levelPart, modulePart] = hash.split('/');
  const level = parseInt(levelPart?.replace('nivel-', '') ?? '0');
  const module = parseInt(modulePart?.replace('modulo-', '') ?? '1');
  return { level: isNaN(level) ? 0 : level, module: isNaN(module) ? 1 : module };
}

export function navigateToPage(slug: string): void {
  window.location.hash = slug;
}

export function navigate(level: number, module: number): void {
  if (level >= 0) {
    localStorage.setItem('lastLevel', String(level));
  }
  window.location.hash = `nivel-${level}/modulo-${module}`;
}

export function onRouteChange(callback: (route: Route) => void): void {
  window.addEventListener('hashchange', () => callback(getCurrentRoute()));
  // Initial load
  if (window.location.hash) {
    callback(getCurrentRoute());
  }
}

export function getPrevNext(
  nivel: number,
  modulo: number
): { prev: RouteRef | null; next: RouteRef | null } {
  // Build a flat ordered list of all [nivel, modulo] pairs from the registry
  const flat: Array<{ nivel: number; modulo: number; title: string }> = [];
  for (const level of levelRegistry) {
    for (const mod of level.modules) {
      flat.push({ nivel: level.id, modulo: mod.id, title: mod.title });
    }
  }

  const currentIndex = flat.findIndex(
    (entry) => entry.nivel === nivel && entry.modulo === modulo
  );

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  function toRouteRef(entry: { nivel: number; modulo: number; title: string }): RouteRef {
    const content = getModuleContent(entry.nivel, entry.modulo);
    return {
      nivel: entry.nivel,
      modulo: entry.modulo,
      title: entry.title,
      available: content !== undefined,
    };
  }

  const prev = currentIndex > 0 ? toRouteRef(flat[currentIndex - 1]) : null;
  const next = currentIndex < flat.length - 1 ? toRouteRef(flat[currentIndex + 1]) : null;

  return { prev, next };
}
