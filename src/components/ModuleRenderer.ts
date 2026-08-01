import type { ModuleContent } from '../levels/types';
import { applyGlossary } from '../glossary';
import { levelRegistry } from '../levels/registry';
import { getModuleContent } from './contentRouter';
import { navigate } from '../router';
import { renderModule, renderWelcome } from './renderModule';
import { renderDiagram } from './renderDiagram';
import { renderCheatSheet } from './renderCheatSheet';
import { renderSnippets } from './renderSnippets';
import { injectCopyButtons } from './injectCopyButtons';
import { handleCopy, handleCopySimple } from './renderCopyHandlers';

// Dynamic Prism import with language support
let prismLoaded = false;

async function ensurePrism(): Promise<void> {
  if (prismLoaded) return;
  try {
    const Prism = await import('prismjs');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore — prism language components lack TS declarations
    await Promise.all([
      // @ts-ignore
      import('prismjs/components/prism-yaml'),
      // @ts-ignore
      import('prismjs/components/prism-bash'),
      // @ts-ignore
      import('prismjs/components/prism-python'),
      // @ts-ignore
      import('prismjs/components/prism-ini'),
      // @ts-ignore
      import('prismjs/components/prism-json'),
    ]);
    prismLoaded = true;
    (window as any).__Prism = Prism.default ?? Prism;
  } catch {
    // Prism unavailable — graceful degradation
  }
}

function highlightAll(): void {
  const Prism = (window as any).__Prism;
  if (Prism?.highlightAll) Prism.highlightAll();
}

export class ModuleRenderer {
  private contentEl: HTMLElement;

  constructor() {
    this.contentEl = document.getElementById('module-content')!;
    // TASK 03: Single delegated click listener bound once in constructor
    this.contentEl.addEventListener('click', this.handleContentClick.bind(this));
  }

  // TASK 03 + TASK 06: Delegated click handler
  private handleContentClick(e: Event): void {
    const target = e.target as HTMLElement;

    // Cheat sheet copy button
    const csCopyBtn = target.closest('.cs-copy-btn') as HTMLElement | null;
    if (csCopyBtn) {
      handleCopySimple(csCopyBtn, csCopyBtn.dataset['cmd'] ?? '');
      return;
    }

    // Cheat sheet tab filter
    const csTab = target.closest('.cs-tab') as HTMLElement | null;
    if (csTab) {
      this.contentEl.querySelectorAll('.cs-tab').forEach(t => t.classList.remove('active'));
      csTab.classList.add('active');
      const filter = csTab.dataset['filter'] ?? 'all';
      this.contentEl.querySelectorAll('.cs-category').forEach(cat => {
        const el = cat as HTMLElement;
        if (filter === 'all' || el.dataset['cat'] === filter) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      });
      return;
    }

    // Snippets copy button
    const spCopyBtn = target.closest('.sp-copy-btn') as HTMLElement | null;
    if (spCopyBtn) {
      handleCopySimple(spCopyBtn, spCopyBtn.dataset['code'] ?? '');
      return;
    }

    // Snippets tab filter
    const spTab = target.closest('.sp-tab') as HTMLElement | null;
    if (spTab) {
      this.contentEl.querySelectorAll('.sp-tab').forEach(t => t.classList.remove('active'));
      spTab.classList.add('active');
      const filter = spTab.dataset['filter'] ?? 'all';
      this.contentEl.querySelectorAll('.sp-category').forEach(cat => {
        const el = cat as HTMLElement;
        if (filter === 'all' || el.dataset['cat'] === filter) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      });
      return;
    }

    // Copy button
    const copyBtn = target.closest('.copy-btn') as HTMLElement | null;
    if (copyBtn) {
      const wrapper = copyBtn.closest('.code-block-wrapper');
      const codeEl = wrapper?.querySelector('code');
      const text = codeEl?.textContent ?? '';
      handleCopy(copyBtn, text);
      return;
    }

    // Quiz option click
    const quizOption = target.closest('.quiz-option') as HTMLElement | null;
    if (quizOption) {
      const questionEl = quizOption.closest('.quiz-question') as HTMLElement | null;
      if (!questionEl) return;

      // Prevent re-answering
      if (questionEl.dataset['answered'] === 'true') return;
      questionEl.dataset['answered'] = 'true';

      const correctIndex = parseInt(questionEl.dataset['correct'] ?? '0', 10);
      const clickedIndex = parseInt(quizOption.dataset['index'] ?? '-1', 10);

      // Disable all options and mark correct/wrong
      questionEl.querySelectorAll('.quiz-option').forEach((opt, idx) => {
        const btn = opt as HTMLButtonElement;
        btn.disabled = true;
        if (idx === correctIndex) {
          btn.classList.add('quiz-option--correct');
        } else if (idx === clickedIndex) {
          btn.classList.add('quiz-option--wrong');
        }
      });

      // Show explanation
      const explanation = questionEl.querySelector('.quiz-explanation') as HTMLElement | null;
      if (explanation) explanation.classList.remove('hidden');
      return;
    }

    // Prev/Next navigation
    const navBtn = target.closest('[data-href]') as HTMLElement | null;
    if (navBtn) {
      const href = navBtn.dataset['href'];
      if (href) {
        window.location.hash = href.replace('#', '');
      }
    }
  }

  async render(level: number, module: number): Promise<void> {
    await ensurePrism();

    if (level === -2) { renderCheatSheet(this.contentEl); return; }
    if (level === -3) { renderSnippets(this.contentEl, highlightAll); return; }

    if (level < 0) {
      renderWelcome(this.contentEl);
      return;
    }

    const lvlMeta = levelRegistry.find(l => l.id === level);
    const modMeta = lvlMeta?.modules.find(m => m.id === module);

    if (!lvlMeta || !modMeta) {
      this.contentEl.innerHTML = `
        <div style="padding:3rem;text-align:center;color:var(--color-text-muted)">
          <p>Módulo no encontrado. Nivel ${level}, Módulo ${module}.</p>
        </div>`;
      return;
    }

    const content = getModuleContent(level, module);
    if (!content) {
      this.contentEl.innerHTML = `
        <div style="padding:3rem;text-align:center;color:var(--color-text-muted)">
          <p>Contenido aún no disponible para este módulo.</p>
        </div>`;
      return;
    }

    renderModule(this.contentEl, level, module, lvlMeta.badge, lvlMeta.title, lvlMeta.subtitle, lvlMeta.duration, content);
    renderDiagram(level, module);
    injectCopyButtons(this.contentEl);
    document.getElementById('content')?.scrollTo({ top: 0, behavior: 'instant' });
    highlightAll();
    this.initScrollReveal();
    applyGlossary(this.contentEl);
  }

  private initScrollReveal(): void {
    const items = this.contentEl.querySelectorAll('.methodology-step, .diagram-container');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.opacity = '1';
          (e.target as HTMLElement).style.transform = 'none';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });

    items.forEach(el => {
      const h = el as HTMLElement;
      h.style.opacity = '0';
      h.style.transform = 'translateY(16px)';
      h.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      obs.observe(h);
    });
  }
}
