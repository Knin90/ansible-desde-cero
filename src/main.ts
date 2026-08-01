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
import { Icons } from './utils/icons';

const renderer = new ModuleRenderer();

function getBreadcrumb(level: number, module: number): string {
  if (level < 0) return '';
  const lvl = levelRegistry.find(l => l.id === level);
  const mod = lvl?.modules.find(m => m.id === module);
  if (!lvl || !mod) return '';
  return `${lvl.title} / ${mod.title}`;
}

function initTheme(): void {
  const html = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('theme');

  const apply = (theme: 'dark' | 'light') => {
    html.classList.toggle('light', theme === 'light');
    if (btn) btn.innerHTML = theme === 'light' ? Icons.moon : Icons.sun;
    localStorage.setItem('theme', theme);
  };

  apply((saved === 'light' ? 'light' : 'dark') as 'dark' | 'light');
  btn?.addEventListener('click', () => {
    apply(html.classList.contains('light') ? 'dark' : 'light');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  // Inject reicon icons into static HTML elements
  const toggleBtn = document.getElementById('sidebar-toggle');
  if (toggleBtn) toggleBtn.innerHTML = Icons.menu;

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
