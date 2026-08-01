import type { ModuleContent } from '../levels/types';
import { CHEAT_SHEET } from '../content/cheatSheet';
import { SNIPPETS } from '../content/snippets';
import { applyGlossary } from '../glossary';
import { levelRegistry } from '../levels/registry';
import { getModuleContent } from './contentRouter';
import { sanitizeBadge } from '../utils/sanitizeBadge';
import { getPrevNext, navigate } from '../router';
import { Icons } from '../utils/icons';
import { ArquitecturaDiagram } from '../diagrams/nivel1/arquitectura-diagram';
import { FlujoInternoDiagram } from '../diagrams/nivel2/flujo-interno-diagram';
import { InventarioDiagram } from '../diagrams/nivel3/inventario-diagram';
import { PlaybookDiagram } from '../diagrams/nivel5/playbook-diagram';
import { YamlDiagram } from '../diagrams/nivel0/yaml-diagram';

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
      this.handleCopySimple(csCopyBtn, csCopyBtn.dataset['cmd'] ?? '');
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
      this.handleCopySimple(spCopyBtn, spCopyBtn.dataset['code'] ?? '');
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
      this.handleCopy(copyBtn, text);
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

  private handleCopy(btn: HTMLElement, text: string): void {
    const copyText = async () => {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback: textarea + execCommand
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    };

    copyText()
      .then(() => {
        btn.innerHTML = `${Icons.copySuccess} COPIADO`;
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = `${Icons.copy} COPIAR CÓDIGO`;
          btn.classList.remove('copied');
        }, 2000);
      })
      .catch(() => {
        btn.innerHTML = `${Icons.copyError} ERROR`;
        btn.classList.add('copy-error');
        setTimeout(() => {
          btn.innerHTML = `${Icons.copy} COPIAR CÓDIGO`;
          btn.classList.remove('copy-error');
        }, 2000);
      });
  }

  private handleCopySimple(btn: HTMLElement, text: string): void {
    const originalHtml = btn.innerHTML;
    const copyAsync = async () => {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    };
    copyAsync()
      .then(() => {
        btn.innerHTML = '✓';
        setTimeout(() => { btn.innerHTML = originalHtml; }, 1500);
      })
      .catch(() => {
        btn.innerHTML = '✗';
        setTimeout(() => { btn.innerHTML = originalHtml; }, 1500);
      });
  }

  private renderCheatSheet(): void {
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

    this.contentEl.innerHTML = `
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

  private renderSnippets(): void {
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

    this.contentEl.innerHTML = `
      <div class="snippets-page">
        <div class="sp-header">
          <h2 class="sp-title">🧩 Snippets — YAML listo para usar</h2>
          <p class="sp-subtitle">Fragmentos de código organizados por categoría. Copiá y adaptá a tu caso.</p>
        </div>
        <div class="sp-tabs">${tabsHtml}</div>
        <div class="sp-body">${categoriesHtml}</div>
      </div>
    `;

    this.injectCopyButtons();
    highlightAll();
  }

  async render(level: number, module: number): Promise<void> {
    await ensurePrism();

    if (level === -2) { this.renderCheatSheet(); return; }
    if (level === -3) { this.renderSnippets(); return; }

    if (level < 0) {
      this.renderWelcome();
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

    this.renderModule(level, module, lvlMeta.badge, lvlMeta.title, lvlMeta.subtitle, lvlMeta.duration, content);
    this.renderDiagram(level, module);
    this.injectCopyButtons();
    document.getElementById('content')?.scrollTo({ top: 0, behavior: 'instant' });
    highlightAll();
    this.initScrollReveal();
    applyGlossary(this.contentEl);
  }

  // Walk .code-block-titlebar elements and inject decorative dots + copy buttons
  private injectCopyButtons(): void {
    this.contentEl.querySelectorAll('.code-block-titlebar').forEach(titlebar => {
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

  private renderModule(
    level: number,
    module: number,
    badge: string,
    levelTitle: string,
    levelSubtitle: string,
    duration: string | undefined,
    content: ModuleContent
  ): void {
    const difficultyMap: Record<string, { dot: string; label: string }> = {
      'requisito': { dot: '', label: 'Requisito previo' },
      'principiante': { dot: '', label: 'Principiante' },
      'principiante-plus': { dot: 'med', label: 'Principiante+' },
      'intermedio': { dot: 'med', label: 'Intermedio' },
      'avanzado': { dot: 'high', label: 'Avanzado' },
      'experto': { dot: 'expert', label: 'Experto' },
    };
    const badgeKey = badge.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const difficulty = difficultyMap[badgeKey] ?? { dot: '', label: badge };
    const difficultyDotClass = difficulty.dot;
    const difficultyLabel = difficulty.label;

    const prerequisitesHtml = content.prerequisites && content.prerequisites.length > 0
      ? `<div class="prerequisites-box">
      <div class="prerequisites-header">⚠️ Requisitos previos</div>
      <ul>${content.prerequisites.map(p => `<li>✓ ${escapeHtml(p)}</li>`).join('')}</ul>
    </div>`
      : '';

    const objectivesHtml = content.objectives && content.objectives.length > 0
      ? `<div class="learning-objectives">
      <div class="learning-objectives-header">🎯 Al finalizar este módulo podrás</div>
      <ul>${content.objectives.map(o => `<li>${escapeHtml(o)}</li>`).join('')}</ul>
    </div>`
      : '';

    const durationHtml = content.duration
      ? `<span class="module-duration-tag">⏱ ${escapeHtml(content.duration)}</span>`
      : '';

    const troubleshootingHtml = content.troubleshooting && content.troubleshooting.length > 0
      ? `<div class="troubleshooting-box">
      <div class="ts-header">🔧 Errores frecuentes</div>
      ${content.troubleshooting.map(item => `
        <div class="ts-item">
          <div class="ts-error"><span class="ts-error-label">ERROR</span><code>${escapeHtml(item.error)}</code></div>
          <div class="ts-cause"><span class="ts-label">CAUSA</span> ${escapeHtml(item.cause)}</div>
          <div class="ts-fix"><span class="ts-label">SOLUCIÓN</span><code>${escapeHtml(item.fix)}</code></div>
        </div>
      `).join('')}
    </div>`
      : '';

    const quizHtml = content.quiz && content.quiz.length > 0
      ? `<div class="module-quiz">
      <div class="quiz-header">📝 Verificá tu comprensión</div>
      ${content.quiz.map((q, qi) => `
        <div class="quiz-question" data-correct="${q.correctIndex}">
          <div class="quiz-q-text">Pregunta ${qi + 1}: ${escapeHtml(q.question)}</div>
          <div class="quiz-options">
            ${q.options.map((opt, oi) => `<button class="quiz-option" data-index="${oi}">○ ${escapeHtml(opt)}</button>`).join('')}
          </div>
          <div class="quiz-explanation hidden">💡 ${escapeHtml(q.explanation)}</div>
        </div>
      `).join('')}
    </div>`
      : '';

    const realWorldHtml = content.realWorldCase
      ? `<div class="real-world-box">
      <div class="real-world-header">🏢 ¿Cómo se usa esto en una empresa?</div>
      <p>${escapeHtml(content.realWorldCase)}</p>
    </div>`
      : '';

    const progressDots = content.steps.map((_, i) =>
      `<span class="progress-dot" data-step="${i}"></span>`
    ).join('');

    const totalSteps = content.steps.length;
    const progressPct = totalSteps > 0 ? 100 : 100;

    const stepsHtml = content.steps.map((step, i) => `
      <div class="methodology-step">
        <div class="step-number">${i + 1}</div>
        <div class="step-content">
          <div class="step-title">${escapeHtml(step.title)}</div>
          <div class="step-body">${step.body}</div>
        </div>
      </div>
    `).join('');

    // TASK 02+06: Get prev/next for this module
    const { prev, next } = getPrevNext(level, module);

    // Get titles for prev/next buttons
    const prevTitle = prev?.title ?? '';
    const nextTitle = next?.title ?? '';

    const prevBtnAttrs = prev && prev.available
      ? `data-href="#nivel-${prev.nivel}/modulo-${prev.modulo}"`
      : 'disabled';
    const nextBtnAttrs = next && next.available
      ? `data-href="#nivel-${next.nivel}/modulo-${next.modulo}"`
      : 'disabled';

    // Breadcrumb — "Cursos > Nivel N > Module Title"
    const breadcrumbHtml = `
      <nav aria-label="breadcrumb" class="breadcrumb">
        <a href="#nivel-0/modulo-1">Cursos</a>
        <span class="breadcrumb-sep">${Icons.chevronRightSm}</span>
        <a href="#nivel-${level}/modulo-1">${escapeHtml(levelTitle)} — ${escapeHtml(levelSubtitle)}</a>
        <span class="breadcrumb-sep">${Icons.chevronRightSm}</span>
        <span class="breadcrumb-current" aria-current="page">${escapeHtml(content.title)}</span>
      </nav>
    `;

    this.contentEl.innerHTML = `
      ${breadcrumbHtml}
      ${prerequisitesHtml}
      ${objectivesHtml}
      <div class="module-hero">
        <div class="module-hero-bg-glow"></div>
        <div class="module-tags">
          <span class="module-requisite-tag">
            ${Icons.tag}
            ${escapeHtml(badge)}
          </span>
          <span class="module-level-label">${escapeHtml(levelTitle)} — ${escapeHtml(levelSubtitle)}</span>
          <span class="module-difficulty">
            <span class="difficulty-dot ${difficultyDotClass}"></span>
            ${difficultyLabel}
          </span>
          ${durationHtml}
        </div>
        <h2 class="module-title">${escapeHtml(content.title)}</h2>
        <p class="module-objective">${escapeHtml(content.objective)}</p>
        <div class="progress-bar-track">
          <div class="progress-bar-fill" style="width: ${progressPct}%"></div>
        </div>
        <div class="module-progress">${progressDots}</div>
      </div>
      <div id="diagram-slot"></div>
      <div class="module-steps">${stepsHtml}</div>
      ${troubleshootingHtml}
      ${quizHtml}
      ${realWorldHtml}
      <nav class="module-nav">
        <button class="nav-btn prev-btn" ${prevBtnAttrs}>
          <span class="nav-btn-icon">${Icons.arrowLeft}</span>
          <span class="nav-btn-info">
            <span class="nav-btn-label">ANTERIOR</span>
            <span class="nav-btn-title">${escapeHtml(prevTitle)}</span>
          </span>
        </button>
        <button class="nav-btn next-btn" ${nextBtnAttrs}>
          <span class="nav-btn-info" style="text-align:right">
            <span class="nav-btn-label">SIGUIENTE</span>
            <span class="nav-btn-title">${escapeHtml(nextTitle)}</span>
          </span>
          <span class="nav-btn-icon">${Icons.arrowRight}</span>
        </button>
      </nav>
    `;
  }

  private renderDiagram(level: number, module: number): void {
    const slot = document.getElementById('diagram-slot');
    if (!slot) return;
    slot.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'diagram-container';
    slot.appendChild(wrapper);

    let diagramCreated = false;

    if (level === 0 && module === 3) {
      new YamlDiagram(wrapper).render();
      diagramCreated = true;
    } else if (level === 1 && module === 2) {
      new ArquitecturaDiagram(wrapper).render();
      diagramCreated = true;
    } else if (level === 2 && module === 1) {
      new FlujoInternoDiagram(wrapper).render();
      diagramCreated = true;
    } else if (level === 3 && module === 1) {
      new InventarioDiagram(wrapper).render();
      diagramCreated = true;
    } else if (level === 5 && module === 2) {
      new PlaybookDiagram(wrapper).render();
      diagramCreated = true;
    }

    if (!diagramCreated) {
      slot.innerHTML = '';
    }
  }

  private renderWelcome(): void {
    const currentLevel = parseInt(localStorage.getItem('lastLevel') ?? '0') || 0;
    const progressPct = Math.round((currentLevel / 23) * 100);

    const pathNodes = levelRegistry.map(lvl => {
      const slug = sanitizeBadge(lvl.badge);
      const isActive = lvl.id === currentLevel && currentLevel > 0;
      return `
        <div class="lp-node${isActive ? ' lp-node--active' : ''}" onclick="location.hash='nivel-${lvl.id}/modulo-1'" role="button" tabindex="0">
          <div class="lp-node-num">Nivel ${lvl.id}</div>
          <div class="lp-node-title">${escapeHtml(lvl.title)}</div>
          <span class="lp-node-badge badge-${slug}">${escapeHtml(lvl.badge)}</span>
        </div>
      `;
    }).join('');

    this.contentEl.innerHTML = `
      <div class="welcome-screen">
        <h2>Bienvenido al Curso Completo de <span>Ansible</span></h2>
        <p class="welcome-intro">Este curso está diseñado para llevarte desde los conceptos fundamentales de Linux y YAML hasta la automatización de infraestructuras completas con Ansible, siguiendo una ruta de aprendizaje progresiva y orientada a la práctica.</p>
        <p>Desde los fundamentos de Linux y YAML hasta el desarrollo de módulos y plugins propios. 23 niveles, decenas de módulos con diagramas interactivos y ejemplos anotados.</p>
        <div class="welcome-stats-card">
          <div class="wsc-item"><span class="wsc-icon">📚</span><span class="wsc-val">23</span><span class="wsc-label">Niveles</span></div>
          <div class="wsc-item"><span class="wsc-icon">🧩</span><span class="wsc-val">70+</span><span class="wsc-label">Módulos</span></div>
          <div class="wsc-item"><span class="wsc-icon">💻</span><span class="wsc-val">150+</span><span class="wsc-label">Ejemplos</span></div>
          <div class="wsc-item"><span class="wsc-icon">🧪</span><span class="wsc-val">80+</span><span class="wsc-label">Laboratorios</span></div>
          <div class="wsc-item"><span class="wsc-icon">📈</span><span class="wsc-val">Principiante → Experto</span><span class="wsc-label">Nivel</span></div>
        </div>
        <p>Seleccioná un nivel en el menú lateral para comenzar, o empezá desde el principio.</p>
        <button class="start-btn" onclick="location.hash='#nivel-0/modulo-1'">Comenzar desde el principio →</button>
        <div class="learning-path">
          <div class="lp-progress">
            <div class="lp-progress-label">Tu progreso</div>
            <div class="lp-progress-bar-track">
              <div class="lp-progress-bar-fill" style="width: ${progressPct}%"></div>
            </div>
            <div class="lp-progress-text">Nivel ${currentLevel} de 23</div>
          </div>
          <div class="learning-path-title">Mapa del curso</div>
          <div class="learning-path-grid">${pathNodes}</div>
        </div>
      </div>`;
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
