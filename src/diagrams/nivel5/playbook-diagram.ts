import { DiagramEngine } from '../DiagramEngine';

export class PlaybookDiagram extends DiagramEngine {
  render(): void {
    const titleEl = document.createElement('div');
    titleEl.className = 'diagram-title';
    titleEl.textContent = 'Ejecución de un Playbook';
    this.container.appendChild(titleEl);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'diagram');
    svg.setAttribute('viewBox', '0 0 700 400');

    svg.innerHTML = `
      <defs>
        <marker id="ah-pb" markerWidth="8" markerHeight="6"
          refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#f56a00"/>
        </marker>
        <marker id="ah-pb-green" markerWidth="8" markerHeight="6"
          refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#34d399"/>
        </marker>
      </defs>

      <!-- Playbook -->
      <g id="pb-root" class="diagram-node">
        <rect x="290" y="10" width="120" height="45" rx="6" fill="#1a1d27" stroke="#f56a00" stroke-width="2"/>
        <text x="350" y="30" text-anchor="middle" fill="#f56a00" font-size="13" font-weight="700">📖 Playbook</text>
        <text x="350" y="47" text-anchor="middle" fill="#8892aa" font-size="10">sitio.yml</text>
      </g>

      <!-- Arrow to Play 1 -->
      <path id="pb-a1" class="diagram-arrow"
        d="M350 55 L350 90"
        stroke="#f56a00" stroke-width="2" fill="none" marker-end="url(#ah-pb)"/>

      <!-- Play 1 -->
      <g id="pb-play1" class="diagram-node">
        <rect x="240" y="95" width="220" height="45" rx="6" fill="#1a1d27" stroke="#2d3155" stroke-width="2"/>
        <text x="350" y="115" text-anchor="middle" fill="#e2e8f0" font-size="12" font-weight="600">🎭 Play 1</text>
        <text x="350" y="132" text-anchor="middle" fill="#8892aa" font-size="10">hosts: servidores_web</text>
      </g>

      <!-- Arrow to tasks -->
      <path id="pb-a2" class="diagram-arrow"
        d="M350 140 L350 175"
        stroke="#f56a00" stroke-width="2" fill="none" marker-end="url(#ah-pb)"/>

      <!-- Task 1 -->
      <g id="pb-task1" class="diagram-node">
        <rect x="200" y="180" width="300" height="38" rx="5" fill="#22263a" stroke="#2d3155" stroke-width="1.5"/>
        <text x="350" y="197" text-anchor="middle" fill="#e2e8f0" font-size="11" font-weight="600">Task: Instalar nginx</text>
        <text x="350" y="212" text-anchor="middle" fill="#8892aa" font-size="10">ansible.builtin.package | notify: Reiniciar nginx</text>
      </g>

      <!-- Arrow to task 2 -->
      <path id="pb-a3" class="diagram-arrow"
        d="M350 218 L350 248"
        stroke="#f56a00" stroke-width="1.5" fill="none" marker-end="url(#ah-pb)"/>

      <!-- Task 2 -->
      <g id="pb-task2" class="diagram-node">
        <rect x="200" y="253" width="300" height="38" rx="5" fill="#22263a" stroke="#2d3155" stroke-width="1.5"/>
        <text x="350" y="270" text-anchor="middle" fill="#e2e8f0" font-size="11" font-weight="600">Task: Copiar config nginx</text>
        <text x="350" y="285" text-anchor="middle" fill="#8892aa" font-size="10">ansible.builtin.template | notify: Reiniciar nginx</text>
      </g>

      <!-- Handler fires -->
      <path id="pb-a4" class="diagram-arrow"
        d="M500 270 L560 270 L560 330 L510 330"
        stroke="#34d399" stroke-width="1.5" fill="none" stroke-dasharray="5 3" marker-end="url(#ah-pb-green)"/>

      <!-- Handler box -->
      <g id="pb-handler" class="diagram-node">
        <rect x="390" y="310" width="120" height="45" rx="6" fill="#164e3a" stroke="#065f46" stroke-width="2"/>
        <text x="450" y="330" text-anchor="middle" fill="#34d399" font-size="11" font-weight="600">Handler</text>
        <text x="450" y="347" text-anchor="middle" fill="#34d399" font-size="10">Reiniciar nginx</text>
      </g>

      <text x="580" y="300" fill="#34d399" font-size="10">Solo si fue</text>
      <text x="580" y="314" fill="#34d399" font-size="10">notificado</text>
      <text x="580" y="328" fill="#34d399" font-size="10">(changed)</text>

      <!-- Play 2 -->
      <path id="pb-a5" class="diagram-arrow"
        d="M350 291 L350 356"
        stroke="#f56a00" stroke-width="1.5" fill="none" marker-end="url(#ah-pb)"/>

      <g id="pb-play2" class="diagram-node">
        <rect x="240" y="360" width="220" height="35" rx="6" fill="#1a1d27" stroke="#2d3155" stroke-width="2"/>
        <text x="350" y="376" text-anchor="middle" fill="#e2e8f0" font-size="12" font-weight="600">🎭 Play 2</text>
        <text x="350" y="389" text-anchor="middle" fill="#8892aa" font-size="10">hosts: bases_de_datos</text>
      </g>

      <!-- Sequential badge -->
      <rect x="10" y="175" width="80" height="20" rx="4" fill="#3b1f5e" stroke="#7c3aed"/>
      <text x="50" y="189" text-anchor="middle" fill="#c084fc" font-size="10">Secuencial</text>
    `;

    this.container.appendChild(svg);

    this.steps = [
      { label: 'Ansible carga el Playbook', activate: () => this.activateNode('pb-root') },
      { label: 'Comienza el Play 1 en servidores_web', activate: () => { this.animateArrow('pb-a1'); this.activateNode('pb-play1'); } },
      { label: 'Ejecuta la Task 1: Instalar nginx', activate: () => { this.animateArrow('pb-a2'); this.activateNode('pb-task1'); } },
      { label: 'Ejecuta la Task 2: Copiar config', activate: () => { this.animateArrow('pb-a3'); this.activateNode('pb-task2'); } },
      { label: 'Handlers se disparan al final del play (si hubo cambios)', activate: () => { this.animateArrow('pb-a4'); this.activateNodeSuccess('pb-handler'); } },
      { label: 'Comienza el Play 2 en bases_de_datos', activate: () => { this.animateArrow('pb-a5'); this.activateNode('pb-play2'); } },
    ];

    this.addControls();
  }
}
