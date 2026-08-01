export const GLOSSARY: Record<string, string> = {
  'Inventory': 'Lista de hosts gestionados por Ansible, definida en formato INI o YAML. Puede ser estática o dinámica.',
  'Inventario': 'Lista de hosts gestionados por Ansible, definida en formato INI o YAML. Puede ser estática o dinámica.',
  'Handler': 'Tarea especial que solo se ejecuta cuando es notificada por otra tarea. Ideal para reinicios de servicios.',
  'Fact': 'Variable recopilada automáticamente por Ansible sobre un host (SO, IP, CPU, memoria, etc.) mediante el módulo gather_facts.',
  'Role': 'Unidad reutilizable de organización de playbooks que agrupa tasks, handlers, variables, templates y archivos.',
  'Collection': 'Formato de distribución de contenido Ansible que empaqueta módulos, plugins, roles y playbooks.',
  'Playbook': 'Archivo YAML que define una lista de plays: qué hosts gestionar y qué tasks ejecutar en ellos.',
  'Control Node': 'La máquina donde está instalado Ansible y desde donde se lanzan los playbooks. Requiere Linux/macOS.',
  'Managed Node': 'Host remoto gestionado por Ansible. Solo necesita SSH y Python — no requiere instalar Ansible.',
  'idempotente': 'Propiedad de una operación que produce el mismo resultado sin importar cuántas veces se ejecute.',
  'idempotencia': 'Propiedad de una operación que produce el mismo resultado sin importar cuántas veces se ejecute.',
};

// Sorted by length descending to match longer terms first (e.g., "Control Node" before "Node")
const GLOSSARY_ENTRIES = Object.entries(GLOSSARY).sort((a, b) => b[0].length - a[0].length);

export function applyGlossary(root: HTMLElement): void {
  const seen = new Set<string>();

  const stepBodies = root.querySelectorAll('.step-body');
  stepBodies.forEach(stepBody => {
    const walker = document.createTreeWalker(
      stepBody,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node: Node): number {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toUpperCase();
          if (tag === 'CODE' || tag === 'PRE' || tag === 'ABBR' || tag === 'A') {
            return NodeFilter.FILTER_REJECT;
          }
          // Also skip if any ancestor is CODE/PRE/ABBR/A
          let ancestor = parent.parentElement;
          while (ancestor) {
            const aTag = ancestor.tagName.toUpperCase();
            if (aTag === 'CODE' || aTag === 'PRE' || aTag === 'ABBR' || aTag === 'A') {
              return NodeFilter.FILTER_REJECT;
            }
            ancestor = ancestor.parentElement;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    const textNodes: Text[] = [];
    let current = walker.nextNode();
    while (current) {
      textNodes.push(current as Text);
      current = walker.nextNode();
    }

    for (const textNode of textNodes) {
      const text = textNode.textContent ?? '';
      if (!text.trim()) continue;

      let matched = false;
      for (const [term, def] of GLOSSARY_ENTRIES) {
        const termKey = term.toLowerCase();
        if (seen.has(termKey)) continue;

        const regex = new RegExp(`(${escapeRegex(term)})`, 'i');
        const match = regex.exec(text);
        if (!match) continue;

        seen.add(termKey);

        const before = text.slice(0, match.index);
        const matched_text = match[0];
        const after = text.slice(match.index + matched_text.length);

        const abbr = document.createElement('abbr');
        abbr.className = 'gl-term';
        abbr.setAttribute('data-def', def);
        abbr.textContent = matched_text;

        const parent = textNode.parentNode;
        if (!parent) continue;

        const fragment = document.createDocumentFragment();
        if (before) fragment.appendChild(document.createTextNode(before));
        fragment.appendChild(abbr);
        if (after) fragment.appendChild(document.createTextNode(after));

        parent.replaceChild(fragment, textNode);
        matched = true;
        break;
      }

      // If we matched, textNode is already replaced — continue to next
      void matched;
    }
  });
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
