export interface Route {
  level: number;
  module: number;
}

export function getCurrentRoute(): Route {
  const hash = window.location.hash.replace('#', '');
  const [levelPart, modulePart] = hash.split('/');
  const level = parseInt(levelPart?.replace('nivel-', '') ?? '0');
  const module = parseInt(modulePart?.replace('modulo-', '') ?? '1');
  return { level: isNaN(level) ? 0 : level, module: isNaN(module) ? 1 : module };
}

export function navigate(level: number, module: number): void {
  window.location.hash = `nivel-${level}/modulo-${module}`;
}

export function onRouteChange(callback: (route: Route) => void): void {
  window.addEventListener('hashchange', () => callback(getCurrentRoute()));
  // Initial load
  if (window.location.hash) {
    callback(getCurrentRoute());
  }
}
