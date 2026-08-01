import { CHEAT_SHEET } from '../content/cheatSheet';
import { escapeHtml } from './escapeHtml';

export function renderCheatSheet(contentEl: HTMLElement): void {
  const tabsHtml = [
    `<button class="cs-tab active" data-filter="all">Todos</button>`,
    ...CHEAT_SHEET.map(cat =>
      `<button class="cs-tab" data-filter="${escapeHtml(cat.id)}">${escapeHtml(cat.id)}</button>`
    ),
  ].join('');

  const categoriesHtml = CHEAT_SHEET.map(cat => `
    <div class="cs-category" data-cat="${escapeHtml(cat.id)}">
      <h3 class="cs-category-title">${escapeHtml(cat.title)}</h3>
      <div class="cs-commands">
        ${cat.commands.map(c => `
          <div class="cs-row">
            <code class="cs-cmd">${escapeHtml(c.cmd)}</code>
            <span class="cs-desc">${escapeHtml(c.desc)}</span>
            <button class="cs-copy-btn" data-cmd="${escapeHtml(c.cmd)}">&#x29C9;</button>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  contentEl.innerHTML = `
    <div class="cheat-sheet-page">
      <div class="cs-header">
        <h2 class="cs-title">📋 Cheat Sheet — Ansible</h2>
        <p class="cs-subtitle">Referencia rápida de comandos. Hacé clic en cualquier comando para copiarlo.</p>
      </div>
      <div class="cs-tabs">${tabsHtml}</div>
      <div class="cs-body">${categoriesHtml}</div>
    </div>
  `;
}
