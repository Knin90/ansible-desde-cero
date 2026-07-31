/**
 * tooltip.ts
 * TooltipEngine: one shared floating div[role=tooltip] appended to body.
 * Attaches to [data-tooltip] and .anno[data-annotation] elements.
 * Handles: mouseenter/focusin → show, mouseleave/focusout → hide, Escape → hide.
 * Placement: prefers below; flips above when insufficient space below.
 * Edge-flip: adjusts left position to stay within viewport.
 * Accessibility: aria-describedby wired on show, cleared on hide.
 */

const TOOLTIP_CLASS = 'tooltip-popup';
const VISIBLE_CLASS = 'tooltip-visible';
const ABOVE_CLASS = 'tooltip-above';
const BELOW_CLASS = 'tooltip-below';

let tooltipEl: HTMLDivElement | null = null;
let currentAnchor: HTMLElement | null = null;
let hideTimeout = 0;

function getOrCreateTooltip(): HTMLDivElement {
  if (tooltipEl) return tooltipEl;

  const el = document.createElement('div');
  el.className = TOOLTIP_CLASS;
  el.setAttribute('role', 'tooltip');
  el.id = 'tooltip-singleton';
  document.body.appendChild(el);
  tooltipEl = el;
  return el;
}

function resolveText(el: HTMLElement): string {
  return (
    el.dataset['tooltip'] ??
    el.dataset['annotation'] ??
    ''
  );
}

function positionTooltip(anchor: HTMLElement): void {
  const tip = getOrCreateTooltip();
  const anchorRect = anchor.getBoundingClientRect();
  const tipRect = tip.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const GAP = 8;

  // Decide vertical placement
  const spaceBelow = vh - anchorRect.bottom;
  const spaceAbove = anchorRect.top;
  const preferBelow = spaceBelow >= tipRect.height + GAP || spaceBelow >= spaceAbove;

  tip.classList.remove(ABOVE_CLASS, BELOW_CLASS);

  let top: number;
  if (preferBelow) {
    top = anchorRect.bottom + GAP;
    tip.classList.add(BELOW_CLASS);
  } else {
    top = anchorRect.top - tipRect.height - GAP;
    tip.classList.add(ABOVE_CLASS);
  }

  // Horizontal: align with anchor left, then clamp to viewport
  let left = anchorRect.left;
  const maxLeft = vw - tipRect.width - GAP;
  left = Math.max(GAP, Math.min(left, maxLeft));

  tip.style.top = `${top}px`;
  tip.style.left = `${left}px`;
}

function showTooltip(anchor: HTMLElement): void {
  const text = resolveText(anchor);
  if (!text) return;

  clearTimeout(hideTimeout);
  currentAnchor = anchor;

  const tip = getOrCreateTooltip();
  tip.textContent = text;

  // Reset position so getBoundingClientRect is accurate for the new content
  tip.style.top = '0';
  tip.style.left = '0';
  tip.classList.remove(VISIBLE_CLASS);

  // Wire aria-describedby
  anchor.setAttribute('aria-describedby', 'tooltip-singleton');

  // Position, then reveal
  requestAnimationFrame(() => {
    positionTooltip(anchor);
    tip.classList.add(VISIBLE_CLASS);
  });
}

function hideTooltip(): void {
  hideTimeout = window.setTimeout(() => {
    if (!tooltipEl) return;
    tooltipEl.classList.remove(VISIBLE_CLASS);
    currentAnchor?.removeAttribute('aria-describedby');
    currentAnchor = null;
  }, 80);
}

export class TooltipEngine {
  attach(root: HTMLElement): void {
    const selector = '[data-tooltip], .anno[data-annotation]';
    root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      el.addEventListener('mouseenter', () => showTooltip(el));
      el.addEventListener('focusin', () => showTooltip(el));
      el.addEventListener('mouseleave', hideTooltip);
      el.addEventListener('focusout', hideTooltip);
    });
  }

  show(el: HTMLElement): void {
    showTooltip(el);
  }

  hide(): void {
    hideTooltip();
  }
}

export function initTooltips(): void {
  // Create tooltip element early so it's ready
  getOrCreateTooltip();

  // Global Escape handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentAnchor) {
      hideTooltip();
      currentAnchor?.focus();
    }
  });

  // Attach to document body for any existing [data-tooltip] elements
  const engine = new TooltipEngine();
  engine.attach(document.body);
}
