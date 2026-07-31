/**
 * diagram.ts
 * Lazy-loads Mermaid via CDN when #ansible-diagram enters the viewport.
 * Loading is deferred until scroll-into-view to reduce initial parse cost.
 * Falls back gracefully (shows raw DSL) when the CDN is unreachable.
 *
 * Note: Mermaid is NOT bundled into the single-file output to stay under
 * the 1 MB size budget. The CDN script is injected on demand.
 */

const MERMAID_CDN =
  'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';

declare global {
  interface Window {
    mermaid?: {
      initialize: (config: Record<string, unknown>) => void;
      run: (opts: { nodes: HTMLElement[] }) => Promise<void>;
    };
  }
}

export function initDiagram(): void {
  // Look for the element that holds the Mermaid DSL (section 2)
  const diagramEl = document.getElementById('ansible-diagram');
  if (!diagramEl) return;

  let initialized = false;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !initialized) {
          initialized = true;
          observer.disconnect();
          loadAndRenderMermaid(diagramEl);
        }
      }
    },
    { threshold: 0.1 }
  );

  observer.observe(diagramEl);
}

function loadAndRenderMermaid(el: HTMLElement): void {
  if (window.mermaid) {
    renderMermaid(el);
    return;
  }

  const script = document.createElement('script');
  script.src = MERMAID_CDN;
  script.crossOrigin = 'anonymous';

  script.onload = () => renderMermaid(el);
  script.onerror = () => {
    console.warn('[diagram] Mermaid CDN no disponible — mostrando DSL sin procesar.');
    el.classList.add('mermaid-fallback');
  };

  document.head.appendChild(script);
}

function renderMermaid(el: HTMLElement): void {
  if (!window.mermaid) return;

  try {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    window.mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose',
    });

    window.mermaid.run({ nodes: [el] }).catch((err: unknown) => {
      console.error('[diagram] Error al renderizar Mermaid:', err);
    });
  } catch (err) {
    console.error('[diagram] Error al inicializar Mermaid:', err);
  }
}
