import { Icons } from '../utils/icons';

export function injectCopyButtons(contentEl: HTMLElement): void {
  contentEl.querySelectorAll('.code-block-titlebar').forEach(titlebar => {
    // Inject macOS-style decorative dots if not already present
    if (!titlebar.querySelector('.code-block-dots')) {
      const dots = document.createElement('span');
      dots.className = 'code-block-dots';
      dots.innerHTML = `
        <span class="code-block-dot code-block-dot--close"></span>
        <span class="code-block-dot code-block-dot--min"></span>
        <span class="code-block-dot code-block-dot--max"></span>
      `;
      titlebar.insertBefore(dots, titlebar.firstChild);
    }

    // Avoid double-injection of copy button
    if (titlebar.querySelector('.copy-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.setAttribute('aria-label', 'Copiar código');
    btn.innerHTML = `${Icons.copy} COPIAR CÓDIGO`;
    titlebar.appendChild(btn);
  });
}
