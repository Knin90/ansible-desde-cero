import { levelRegistry } from './levels/registry';
import { navigate } from './router';

export function initSidebar(): void {
  const navTree = document.getElementById('nav-tree')!;
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar')!;

  buildNavTree(navTree, sidebar);
  initSearch(searchInput, navTree);
  initToggle(sidebarToggle, sidebar);
  updateActiveItem();

  window.addEventListener('hashchange', updateActiveItem);
}

function buildNavTree(navTree: HTMLElement, sidebar: HTMLElement): void {
  levelRegistry.forEach(level => {
    const group = document.createElement('div');
    group.className = 'level-group';
    group.dataset.levelId = String(level.id);

    const header = document.createElement('div');
    header.className = 'level-header';
    header.innerHTML = `
      <span class="level-arrow">▶</span>
      <span>${level.title} — <span style="color:var(--color-text-muted);font-weight:400">${level.subtitle}</span></span>
      <span class="level-badge badge-${level.badge.toLowerCase()}">${level.badge}</span>
    `;

    const moduleList = document.createElement('div');
    moduleList.className = 'level-modules';

    level.modules.forEach(mod => {
      const item = document.createElement('div');
      item.className = 'module-item';
      item.textContent = `${mod.id}. ${mod.title}`;
      item.dataset.levelId = String(level.id);
      item.dataset.moduleId = String(mod.id);

      item.addEventListener('click', () => {
        navigate(level.id, mod.id);
        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('open');
        }
      });

      moduleList.appendChild(item);
    });

    header.addEventListener('click', () => {
      group.classList.toggle('expanded');
    });

    group.appendChild(header);
    group.appendChild(moduleList);
    navTree.appendChild(group);
  });
}

function initSearch(input: HTMLInputElement, navTree: HTMLElement): void {
  input.addEventListener('input', () => {
    const query = input.value.toLowerCase().trim();

    navTree.querySelectorAll('.module-item').forEach(el => {
      const item = el as HTMLElement;
      const text = item.textContent?.toLowerCase() ?? '';
      if (query === '' || text.includes(query)) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });

    if (query.length > 0) {
      // Expand groups that have visible items
      navTree.querySelectorAll('.level-group').forEach(group => {
        const hasVisible = group.querySelector('.module-item:not(.hidden)');
        if (hasVisible) group.classList.add('expanded');
      });
    }
  });
}

function initToggle(toggle: HTMLElement | null, sidebar: HTMLElement): void {
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle('open');
    } else {
      sidebar.classList.toggle('collapsed');
    }
  });
}

function updateActiveItem(): void {
  const hash = window.location.hash.replace('#', '');
  if (!hash) return;

  const [levelPart, modulePart] = hash.split('/');
  const levelId = parseInt(levelPart?.replace('nivel-', '') ?? 'NaN');
  const moduleId = parseInt(modulePart?.replace('modulo-', '') ?? 'NaN');

  document.querySelectorAll('.module-item').forEach(el => {
    const item = el as HTMLElement;
    const iLevel = parseInt(item.dataset.levelId ?? '-1');
    const iModule = parseInt(item.dataset.moduleId ?? '-1');
    const isActive = iLevel === levelId && iModule === moduleId;
    item.classList.toggle('active', isActive);

    if (isActive) {
      const group = item.closest('.level-group') as HTMLElement | null;
      group?.classList.add('expanded');
    }
  });
}
