import { levelRegistry } from './levels/registry';
import { navigate } from './router';
import { sanitizeBadge } from './utils/sanitizeBadge';
import { Icons } from './utils/icons';

export function initSidebar(): void {
  const navTree = document.getElementById('nav-tree')!;
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar')!;

  // Inject brand header above the search area
  if (!sidebar.querySelector('.sidebar-brand')) {
    const brand = document.createElement('div');
    brand.className = 'sidebar-brand';
    brand.innerHTML = `
      <div class="sidebar-brand-icon">
        ${Icons.terminal}
      </div>
      <div class="sidebar-brand-text">
        <h1 class="sidebar-brand-name">Ansible</h1>
        <p class="sidebar-brand-subtitle">Curso Completo</p>
      </div>
    `;
    sidebar.insertBefore(brand, sidebar.firstChild);
  }

  // Inject search icon
  const searchWrapper = document.getElementById('sidebar-search');
  if (searchWrapper && !searchWrapper.querySelector('.search-icon')) {
    const iconSpan = document.createElement('span');
    iconSpan.className = 'search-icon';
    iconSpan.innerHTML = Icons.search;
    searchWrapper.insertBefore(iconSpan, searchInput);
  }

  // Swap sidebar-toggle to use SVG menu icon
  if (sidebarToggle && !sidebarToggle.querySelector('svg')) {
    sidebarToggle.innerHTML = Icons.menu;
  }

  buildNavTree(navTree, sidebar);
  initSearch(searchInput, navTree);
  initToggle(sidebarToggle, sidebar);
  initBackdrop(sidebar);
  updateActiveItem();

  window.addEventListener('hashchange', updateActiveItem);

  // Reset sidebar state on resize to avoid stuck states
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove('open');
      document.getElementById('main-layout')?.classList.remove('sidebar-open');
    } else {
      // On mobile: clear desktop inline styles so CSS media query takes over
      sidebar.classList.remove('collapsed');
      const topBar = document.getElementById('top-bar');
      const content = document.getElementById('content');
      if (topBar) topBar.style.left = '';
      if (content) content.style.marginLeft = '';
    }
  });
}

function buildNavTree(navTree: HTMLElement, sidebar: HTMLElement): void {
  levelRegistry.forEach(level => {
    const group = document.createElement('div');
    group.className = 'level-group';
    group.dataset.levelId = String(level.id);

    const header = document.createElement('div');
    header.className = 'level-header';
    header.innerHTML = `
      <span class="level-arrow">${Icons.chevronRight}</span>
      <span class="level-title-text">${level.title} — <span style="color:var(--color-text-muted);font-weight:400">${level.subtitle}</span></span>
      <span class="level-badge badge-${sanitizeBadge(level.badge)}">${level.badge}</span>
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

function applyCollapsedLayout(collapsed: boolean): void {
  const topBar = document.getElementById('top-bar');
  const content = document.getElementById('content');
  const w = collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)';
  if (topBar) topBar.style.left = w;
  if (content) content.style.marginLeft = w;
}

function initToggle(toggle: HTMLElement | null, sidebar: HTMLElement): void {
  if (!toggle) return;

  // Apply saved collapsed state on init (desktop only)
  if (window.innerWidth > 768) {
    const saved = localStorage.getItem('sidebarCollapsed') === 'true';
    if (saved) {
      sidebar.classList.add('collapsed');
      applyCollapsedLayout(true);
      toggle.setAttribute('aria-expanded', 'false');
    }
  }

  toggle.addEventListener('click', () => {
    const mainLayout = document.getElementById('main-layout');
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle('open');
      mainLayout?.classList.toggle('sidebar-open', sidebar.classList.contains('open'));
    } else {
      const isCollapsed = sidebar.classList.toggle('collapsed');
      applyCollapsedLayout(isCollapsed);
      toggle.setAttribute('aria-expanded', String(!isCollapsed));
      localStorage.setItem('sidebarCollapsed', String(isCollapsed));
    }
  });
}

function initBackdrop(sidebar: HTMLElement): void {
  const backdrop = document.getElementById('backdrop');
  if (!backdrop) return;
  backdrop.addEventListener('click', () => {
    const mainLayout = document.getElementById('main-layout');
    sidebar.classList.remove('open');
    mainLayout?.classList.remove('sidebar-open');
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
