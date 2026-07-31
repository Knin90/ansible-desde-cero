import './styles/theme.css';
import './styles/layout.css';
import './styles/sidebar.css';
import './styles/diagram.css';
import './styles/animations.css';
import './styles/code.css';
import './styles/module.css';

import { initSidebar } from './sidebar';
import { initTooltips } from './tooltip';
import { onRouteChange } from './router';
import { ModuleRenderer } from './components/ModuleRenderer';
import { levelRegistry } from './levels/registry';

const renderer = new ModuleRenderer();

function getBreadcrumb(level: number, module: number): string {
  if (level < 0) return '';
  const lvl = levelRegistry.find(l => l.id === level);
  const mod = lvl?.modules.find(m => m.id === module);
  if (!lvl || !mod) return '';
  return `${lvl.title} / ${mod.title}`;
}

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initTooltips();

  const breadcrumbEl = document.getElementById('breadcrumb');

  onRouteChange(async ({ level, module }) => {
    await renderer.render(level, module);
    if (breadcrumbEl) {
      breadcrumbEl.textContent = getBreadcrumb(level, module);
    }
  });

  // Render initial state
  if (!window.location.hash) {
    renderer.render(-1, 1);
  }
});
