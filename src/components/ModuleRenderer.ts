import type { ModuleContent } from '../levels/types';
import { levelRegistry } from '../levels/registry';
import { getModuleContent } from './contentRouter';
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
  }

  async render(level: number, module: number): Promise<void> {
    await ensurePrism();

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

    this.renderModule(lvlMeta.badge, lvlMeta.title, lvlMeta.subtitle, lvlMeta.duration, content);
    this.renderDiagram(level, module);
    this.contentEl.scrollTop = 0;
    highlightAll();
    this.initScrollReveal();
  }

  private renderModule(
    badge: string,
    levelTitle: string,
    levelSubtitle: string,
    duration: string | undefined,
    content: ModuleContent
  ): void {
    const progressDots = content.steps.map((_, i) =>
      `<span class="progress-dot" data-step="${i}"></span>`
    ).join('');

    const stepsHtml = content.steps.map((step, i) => `
      <div class="methodology-step">
        <div class="step-number">${i + 1}</div>
        <div class="step-content">
          <div class="step-title">${escapeHtml(step.title)}</div>
          <div class="step-body">${step.body}</div>
        </div>
      </div>
    `).join('');

    this.contentEl.innerHTML = `
      <div class="module-header">
        <div class="module-header-meta">
          <span class="module-level-badge badge-${badge.toLowerCase()}">${escapeHtml(badge)}</span>
          <span style="font-size:0.85rem;color:var(--color-text-muted)">${escapeHtml(levelTitle)} — ${escapeHtml(levelSubtitle)}</span>
          ${duration ? `<span class="module-duration">⏱ ${escapeHtml(duration)}</span>` : ''}
          ${content.duration ? `<span class="module-duration">⏱ ${escapeHtml(content.duration)}</span>` : ''}
        </div>
        <h2 class="module-title">${escapeHtml(content.title)}</h2>
        <p class="module-objective">${escapeHtml(content.objective)}</p>
        <div class="module-progress">${progressDots}</div>
      </div>
      <div id="diagram-slot"></div>
      <div class="module-steps">${stepsHtml}</div>
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
    this.contentEl.innerHTML = `
      <div class="welcome-screen">
        <h2>Bienvenido al Curso Completo de <span>Ansible</span></h2>
        <p>Desde los fundamentos de Linux y YAML hasta el desarrollo de módulos y plugins propios. 23 niveles, decenas de módulos con diagramas interactivos y ejemplos anotados.</p>
        <div class="welcome-stats">
          <div class="welcome-stat">
            <div class="stat-num">23</div>
            <div class="stat-label">Niveles</div>
          </div>
          <div class="welcome-stat">
            <div class="stat-num">70+</div>
            <div class="stat-label">Módulos</div>
          </div>
          <div class="welcome-stat">
            <div class="stat-num">5</div>
            <div class="stat-label">Diagramas SVG</div>
          </div>
        </div>
        <p>Seleccioná un nivel en el menú lateral para comenzar, o empezá desde el principio.</p>
        <button class="start-btn" onclick="location.hash='#nivel-0/modulo-1'">Comenzar desde el principio →</button>
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
