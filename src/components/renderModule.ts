import type { ModuleContent } from '../levels/types';
import { getPrevNext } from '../router';
import { Icons } from '../utils/icons';
import { levelRegistry } from '../levels/registry';
import { sanitizeBadge } from '../utils/sanitizeBadge';
import { escapeHtml } from './escapeHtml';

export function renderModule(
  contentEl: HTMLElement,
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

  // Get prev/next for this module
  const { prev, next } = getPrevNext(level, module);

  const prevTitle = prev?.title ?? '';
  const nextTitle = next?.title ?? '';

  const prevBtnAttrs = prev && prev.available
    ? `data-href="#nivel-${prev.nivel}/modulo-${prev.modulo}"`
    : 'disabled';
  const nextBtnAttrs = next && next.available
    ? `data-href="#nivel-${next.nivel}/modulo-${next.modulo}"`
    : 'disabled';

  const breadcrumbHtml = `
    <nav aria-label="breadcrumb" class="breadcrumb">
      <a href="#nivel-0/modulo-1">Cursos</a>
      <span class="breadcrumb-sep">${Icons.chevronRightSm}</span>
      <a href="#nivel-${level}/modulo-1">${escapeHtml(levelTitle)} — ${escapeHtml(levelSubtitle)}</a>
      <span class="breadcrumb-sep">${Icons.chevronRightSm}</span>
      <span class="breadcrumb-current" aria-current="page">${escapeHtml(content.title)}</span>
    </nav>
  `;

  contentEl.innerHTML = `
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

export function renderWelcome(contentEl: HTMLElement): void {
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

  contentEl.innerHTML = `
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
