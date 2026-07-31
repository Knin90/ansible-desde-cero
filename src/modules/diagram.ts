/**
 * diagram.ts
 * Lazy-loads Mermaid when #diagram enters the viewport (threshold 0.1).
 * Dynamic import keeps Mermaid out of the critical path.
 * The Ansible architecture DSL is defined inline here.
 */

const DIAGRAM_DSL = `flowchart TD
  A["Nodo de control<br/>ansible / ansible-playbook"] -->|lee| B["📋 Inventario<br/>(hosts)"]
  A -->|"SSH push (sin agente)"| C["Nodo gestionado 1"]
  A -->|"SSH push (sin agente)"| D["Nodo gestionado 2"]
  A -->|"SSH push (sin agente)"| E["Nodo gestionado 3"]
  B --> A
  A -->|módulos Python temporales| C
  A -->|módulos Python temporales| D
  A -->|módulos Python temporales| E
  C -->|"resultado JSON"| A
  D -->|"resultado JSON"| A
  E -->|"resultado JSON"| A`;

export function initDiagram(): void {
  const diagramEl = document.getElementById('diagram');
  if (!diagramEl) return;

  // Inject the DSL so Mermaid can pick it up via mermaid.run()
  diagramEl.textContent = DIAGRAM_DSL;

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

async function loadAndRenderMermaid(el: HTMLElement): Promise<void> {
  try {
    const mermaid = await import('mermaid');

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    mermaid.default.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose',
    });

    await mermaid.default.run({ nodes: [el] });
  } catch (err) {
    console.error('[diagram] Error al renderizar Mermaid:', err);
    el.textContent = 'Error al cargar el diagrama.';
  }
}
