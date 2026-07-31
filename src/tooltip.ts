let popupEl: HTMLDivElement | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

function getOrCreatePopup(): HTMLDivElement {
  if (!popupEl) {
    popupEl = document.createElement('div');
    popupEl.className = 'tooltip-popup';
    popupEl.style.display = 'none';
    document.body.appendChild(popupEl);
  }
  return popupEl;
}

function showTooltip(text: string, x: number, y: number): void {
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
  const popup = getOrCreatePopup();
  popup.textContent = text;
  popup.style.display = 'block';
  positionPopup(popup, x, y);
}

function hideTooltip(): void {
  hideTimer = setTimeout(() => {
    if (popupEl) popupEl.style.display = 'none';
  }, 120);
}

function positionPopup(popup: HTMLDivElement, x: number, y: number): void {
  const pw = popup.offsetWidth || 280;
  const ph = popup.offsetHeight || 60;
  let top = y + 14;
  let left = x + 10;
  if (top + ph > window.innerHeight - 8) top = y - ph - 10;
  if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 12;
  popup.style.top = `${Math.max(4, top)}px`;
  popup.style.left = `${Math.max(4, left)}px`;
}

export function initTooltips(): void {
  document.addEventListener('mouseover', (e) => {
    const target = (e.target as HTMLElement).closest('[data-tooltip]') as HTMLElement | null;
    if (target) {
      showTooltip(target.dataset.tooltip!, e.clientX, e.clientY);
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (popupEl && popupEl.style.display !== 'none') {
      positionPopup(popupEl, e.clientX, e.clientY);
    }
  });

  document.addEventListener('mouseout', (e) => {
    if ((e.target as HTMLElement).closest('[data-tooltip]')) {
      hideTooltip();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popupEl) {
      popupEl.style.display = 'none';
    }
  });
}
