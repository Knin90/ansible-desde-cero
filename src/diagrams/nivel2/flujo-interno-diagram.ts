import { DiagramEngine } from '../DiagramEngine';

export class FlujoInternoDiagram extends DiagramEngine {
  render(): void {
    const titleEl = document.createElement('div');
    titleEl.className = 'diagram-title';
    titleEl.textContent = 'Flujo interno de Ansible — 13 pasos';
    this.container.appendChild(titleEl);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'diagram');
    svg.setAttribute('viewBox', '0 0 720 520');

    const nodes = [
      { id: 'n1', x: 10, y: 10, w: 90, label: 'CLI', sub: 'Usuario' },
      { id: 'n2', x: 120, y: 10, w: 90, label: 'Parser YAML', sub: 'Playbook' },
      { id: 'n3', x: 230, y: 10, w: 90, label: 'Inventory', sub: 'Hosts' },
      { id: 'n4', x: 340, y: 10, w: 90, label: 'Variables', sub: 'Merge' },
      { id: 'n5', x: 450, y: 10, w: 90, label: 'Facts', sub: 'setup module' },
      { id: 'n6', x: 560, y: 10, w: 110, label: 'Strategy', sub: 'linear/free' },
      { id: 'n7', x: 560, y: 120, w: 110, label: 'Task Queue', sub: 'Forks' },
      { id: 'n8', x: 420, y: 120, w: 120, label: 'SSH Plugin', sub: 'Conexión' },
      { id: 'n9', x: 280, y: 120, w: 120, label: 'Action Plugin', sub: 'Local/Remoto' },
      { id: 'n10', x: 140, y: 120, w: 120, label: 'Python Module', sub: 'Host remoto' },
      { id: 'n11', x: 10, y: 120, w: 110, label: 'JSON Result', sub: 'changed/failed' },
      { id: 'n12', x: 10, y: 230, w: 120, label: 'Callback Plugin', sub: 'Display/Log' },
      { id: 'n13', x: 150, y: 230, w: 110, label: 'Pantalla', sub: 'Resultado final' },
    ];

    let svgInner = `
      <defs>
        <marker id="ah-flujo" markerWidth="8" markerHeight="6"
          refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#f56a00"/>
        </marker>
      </defs>
    `;

    // Draw nodes
    nodes.forEach(n => {
      svgInner += `
        <g id="${n.id}" class="diagram-node">
          <rect x="${n.x}" y="${n.y}" width="${n.w}" height="52" rx="6"
            fill="#1a1d27" stroke="#2d3155" stroke-width="1.5"/>
          <text x="${n.x + n.w / 2}" y="${n.y + 22}" text-anchor="middle"
            fill="#e2e8f0" font-size="11" font-weight="600">${n.label}</text>
          <text x="${n.x + n.w / 2}" y="${n.y + 38}" text-anchor="middle"
            fill="#8892aa" font-size="10">${n.sub}</text>
        </g>
      `;
    });

    // Arrows between nodes (row 1)
    const row1Arrows = [
      { id: 'a1', x1: 100, y1: 36, x2: 120, y2: 36 },
      { id: 'a2', x1: 210, y1: 36, x2: 230, y2: 36 },
      { id: 'a3', x1: 320, y1: 36, x2: 340, y2: 36 },
      { id: 'a4', x1: 430, y1: 36, x2: 450, y2: 36 },
      { id: 'a5', x1: 540, y1: 36, x2: 560, y2: 36 },
    ];

    row1Arrows.forEach(a => {
      svgInner += `<path id="${a.id}" class="diagram-arrow"
        d="M${a.x1} ${a.y1} L${a.x2} ${a.y2}"
        stroke="#f56a00" stroke-width="1.5" fill="none" marker-end="url(#ah-flujo)"/>`;
    });

    // Arrow from Strategy down to Task Queue (right column turn)
    svgInner += `<path id="a6" class="diagram-arrow"
      d="M615 62 L615 120"
      stroke="#f56a00" stroke-width="1.5" fill="none" marker-end="url(#ah-flujo)"/>`;

    // Correct direction: task queue -> ssh -> action -> python -> json
    svgInner += `<path id="a7" class="diagram-arrow"
      d="M560 146 L542 146"
      stroke="#f56a00" stroke-width="1.5" fill="none" marker-end="url(#ah-flujo)"/>`;
    svgInner += `<path id="a8" class="diagram-arrow"
      d="M420 146 L402 146"
      stroke="#f56a00" stroke-width="1.5" fill="none" marker-end="url(#ah-flujo)"/>`;
    svgInner += `<path id="a9" class="diagram-arrow"
      d="M280 146 L262 146"
      stroke="#f56a00" stroke-width="1.5" fill="none" marker-end="url(#ah-flujo)"/>`;
    svgInner += `<path id="a10" class="diagram-arrow"
      d="M140 146 L122 146"
      stroke="#f56a00" stroke-width="1.5" fill="none" marker-end="url(#ah-flujo)"/>`;

    // Arrow from JSON result down to Callback
    svgInner += `<path id="a11" class="diagram-arrow"
      d="M65 172 L65 230"
      stroke="#34d399" stroke-width="1.5" fill="none" marker-end="url(#ah-flujo)"/>`;

    // Arrow Callback -> Pantalla
    svgInner += `<path id="a12" class="diagram-arrow"
      d="M130 255 L150 255"
      stroke="#34d399" stroke-width="1.5" fill="none" marker-end="url(#ah-flujo)"/>`;

    svg.innerHTML = svgInner;
    this.container.appendChild(svg);

    this.steps = [
      { label: 'Usuario invoca ansible-playbook desde la CLI', activate: () => this.activateNode('n1') },
      { label: 'CLI parsea argumentos y carga ansible.cfg', activate: () => { this.animateArrow('a1'); this.activateNode('n2'); } },
      { label: 'Parser YAML lee y valida el playbook', activate: () => { this.animateArrow('a2'); this.activateNode('n3'); } },
      { label: 'Inventory Engine resuelve hosts y grupos', activate: () => { this.animateArrow('a3'); this.activateNode('n4'); } },
      { label: 'Variables se mergean en orden de precedencia', activate: () => { this.animateArrow('a4'); this.activateNode('n5'); } },
      { label: 'Facts: el módulo setup recopila info del host', activate: () => { this.animateArrow('a5'); this.activateNode('n6'); } },
      { label: 'Strategy Plugin decide orden de ejecución', activate: () => { this.animateArrow('a6'); this.activateNode('n7'); } },
      { label: 'Task Queue distribuye tareas entre forks', activate: () => { this.animateArrow('a7'); this.activateNode('n8'); } },
      { label: 'SSH Plugin establece conexión segura', activate: () => { this.animateArrow('a8'); this.activateNode('n9'); } },
      { label: 'Action Plugin decide ejecución local o remota', activate: () => { this.animateArrow('a9'); this.activateNode('n10'); } },
      { label: 'Módulo Python se ejecuta en el host remoto', activate: () => { this.animateArrow('a10'); this.activateNode('n11'); } },
      { label: 'JSON result devuelve changed/failed/msg', activate: () => { this.animateArrow('a11'); this.activateNode('n12'); } },
      { label: 'Callback Plugin muestra resultado en pantalla', activate: () => { this.animateArrow('a12'); this.activateNodeSuccess('n13'); } },
    ];

    this.addControls();
  }
}
