import { SNIPPETS } from '../content/snippets';
import { escapeHtml } from './escapeHtml';
import { injectCopyButtons } from './injectCopyButtons';

declare function highlightAll(): void;

export function renderSnippets(contentEl: HTMLElement, highlightAllFn: () => void): void {
  const tabsHtml = [
    `<button class="sp-tab active" data-filter="all">Todos</button>`,
    ...SNIPPETS.map(cat =>
      `<button class="sp-tab" data-filter="${escapeHtml(cat.id)}">${escapeHtml(cat.icon)} ${escapeHtml(cat.title)}</button>`
    ),
  ].join('');

  const categoriesHtml = SNIPPETS.map(cat => `
    <div class="sp-category" data-cat="${escapeHtml(cat.id)}">
      <h3 class="sp-category-title">${escapeHtml(cat.icon)} ${escapeHtml(cat.title)}</h3>
      ${cat.snippets.map(s => `
        <div class="sp-card">
          <div class="sp-card-header">
            <div>
              <div class="sp-card-title">${escapeHtml(s.title)}</div>
              <div class="sp-card-desc">${escapeHtml(s.description)}</div>
            </div>
            <button class="sp-copy-btn" data-code="${escapeHtml(s.code)}">&#x29C9; Copiar</button>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">${escapeHtml(s.lang)}</span></div>
            <pre class="language-${escapeHtml(s.lang)}"><code class="language-${escapeHtml(s.lang)}">${escapeHtml(s.code)}</code></pre>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');

  contentEl.innerHTML = `
    <div class="snippets-page">
      <div class="sp-header">
        <h2 class="sp-title">🧩 Snippets — YAML listo para usar</h2>
        <p class="sp-subtitle">Fragmentos de código organizados por categoría. Copiá y adaptá a tu caso.</p>
      </div>
      <div class="sp-tabs">${tabsHtml}</div>
      <div class="sp-body">${categoriesHtml}</div>
    </div>
  `;

  injectCopyButtons(contentEl);
  highlightAllFn();
}
