import { DiagramEngine } from '../DiagramEngine';

interface YamlNode {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  type: string;
  color: string;
  strokeColor: string;
  explanation: string;
}

export class YamlDiagram extends DiagramEngine {
  private yamlNodes: YamlNode[] = [];
  private tooltip: HTMLDivElement | null = null;

  render(): void {
    const titleEl = document.createElement('div');
    titleEl.className = 'diagram-title';
    titleEl.textContent = 'Estructura visual de YAML — haz hover sobre cada elemento';
    this.container.appendChild(titleEl);

    this.yamlNodes = [
      {
        id: 'yaml-dict-root', x: 20, y: 20, w: 660, h: 360,
        label: 'Diccionario raíz (mapping)', type: 'Diccionario',
        color: '#1a1d27', strokeColor: '#f56a00',
        explanation: 'El documento YAML es siempre un diccionario en la raíz. Cada línea en el nivel principal es un par clave: valor.'
      },
      {
        id: 'yaml-scalar-name', x: 40, y: 50, w: 280, h: 36,
        label: 'nombre: "Ansible"', type: 'Escalar (string)',
        color: '#164e3a', strokeColor: '#34d399',
        explanation: 'Escalar de tipo string. Las comillas son opcionales si no hay caracteres especiales. Valor: "Ansible"'
      },
      {
        id: 'yaml-scalar-version', x: 340, y: 50, w: 320, h: 36,
        label: 'version: 2.15', type: 'Escalar (número)',
        color: '#1e3a5f', strokeColor: '#60a5fa',
        explanation: 'Escalar numérico. YAML detecta automáticamente el tipo. Si querés que sea string escribí version: "2.15"'
      },
      {
        id: 'yaml-scalar-bool', x: 40, y: 105, w: 200, h: 36,
        label: 'agentless: true', type: 'Escalar (booleano)',
        color: '#3b2e0a', strokeColor: '#fbbf24',
        explanation: 'Booleano. Valores válidos: true/false, yes/no, on/off. Ansible reconoce todas estas formas.'
      },
      {
        id: 'yaml-list', x: 40, y: 160, w: 300, h: 100,
        label: 'plataformas:\n  - Linux\n  - macOS\n  - Windows', type: 'Lista (sequence)',
        color: '#3b1f5e', strokeColor: '#c084fc',
        explanation: 'Lista YAML. Cada ítem comienza con "- " (guión + espacio). Equivale a un array en JSON: ["Linux", "macOS", "Windows"]'
      },
      {
        id: 'yaml-nested-dict', x: 360, y: 105, w: 300, h: 155,
        label: 'configuracion:\n  timeout: 30\n  retries: 3\n  ssh_port: 22', type: 'Diccionario anidado',
        color: '#1a2a1a', strokeColor: '#34d399',
        explanation: 'Diccionario anidado. Los hijos se indentan 2 espacios. Jamás uses tabs — YAML solo acepta espacios para la indentación.'
      },
      {
        id: 'yaml-multiline', x: 40, y: 275, w: 620, h: 90,
        label: 'descripcion: |\n  Esta es una descripción\n  que ocupa varias líneas.\n  El | preserva saltos de línea.', type: 'Multilínea literal (|)',
        color: '#2a1a1a', strokeColor: '#f87171',
        explanation: 'Bloque literal con |. Preserva los saltos de línea exactamente como están escritos. Alternativa: > (folded) que los colapsa en espacios.'
      },
    ];

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'diagram');
    svg.setAttribute('viewBox', '0 0 700 400');
    svg.style.cursor = 'default';

    let svgInner = '';

    this.yamlNodes.forEach(node => {
      const lines = node.label.split('\n');
      svgInner += `
        <g id="${node.id}" class="yaml-node diagram-node" data-tooltip="${node.id}">
          <rect x="${node.x}" y="${node.y}" width="${node.w}" height="${node.h}"
            rx="5" fill="${node.color}" stroke="${node.strokeColor}" stroke-width="1.5"/>
          ${lines.map((line, i) =>
            `<text x="${node.x + 10}" y="${node.y + 20 + i * 16}"
              fill="#e2e8f0" font-size="11" font-family="monospace">${escapeHtml(line)}</text>`
          ).join('')}
          <text x="${node.x + node.w - 6}" y="${node.y + 14}"
            text-anchor="end" fill="${node.strokeColor}" font-size="9" font-weight="600">${node.type}</text>
        </g>
      `;
    });

    svg.innerHTML = svgInner;
    this.container.appendChild(svg);

    // Tooltip setup
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'yaml-tooltip';
    this.tooltip.style.display = 'none';
    this.container.style.position = 'relative';
    this.container.appendChild(this.tooltip);

    // Hover events
    this.yamlNodes.forEach(node => {
      const el = svg.querySelector(`#${node.id}`);
      if (!el) return;

      el.addEventListener('mouseenter', (e) => {
        if (!this.tooltip) return;
        this.tooltip.innerHTML = `<strong style="color:${node.strokeColor}">${node.type}</strong><br>${node.explanation}`;
        this.tooltip.style.display = 'block';
        this.positionTooltip(e as MouseEvent);
      });

      el.addEventListener('mousemove', (e) => {
        this.positionTooltip(e as MouseEvent);
      });

      el.addEventListener('mouseleave', () => {
        if (this.tooltip) this.tooltip.style.display = 'none';
      });
    });

    // For this diagram, steps show/highlight each node type
    this.steps = [
      { label: 'Diccionario raíz — todo documento YAML comienza aquí', activate: () => this.activateNode('yaml-dict-root') },
      { label: 'Escalar string — valor de texto simple', activate: () => this.activateNode('yaml-scalar-name') },
      { label: 'Escalar numérico — YAML detecta el tipo automáticamente', activate: () => this.activateNode('yaml-scalar-version') },
      { label: 'Escalar booleano — true/false, yes/no, on/off', activate: () => this.activateNode('yaml-scalar-bool') },
      { label: 'Lista — cada ítem con guión + espacio', activate: () => this.activateNode('yaml-list') },
      { label: 'Diccionario anidado — 2 espacios de indentación', activate: () => this.activateNode('yaml-nested-dict') },
      { label: 'Multilínea literal con | — preserva saltos de línea', activate: () => this.activateNode('yaml-multiline') },
    ];

    this.addControls();
  }

  private positionTooltip(e: MouseEvent): void {
    if (!this.tooltip) return;
    const rect = this.container.getBoundingClientRect();
    let x = e.clientX - rect.left + 12;
    let y = e.clientY - rect.top + 12;
    const tw = 240;
    if (x + tw > rect.width) x = e.clientX - rect.left - tw - 8;
    this.tooltip.style.left = `${x}px`;
    this.tooltip.style.top = `${y}px`;
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
