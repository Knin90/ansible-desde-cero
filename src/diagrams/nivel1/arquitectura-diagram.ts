import { DiagramEngine } from '../DiagramEngine';

export class ArquitecturaDiagram extends DiagramEngine {
  render(): void {
    const svgNS = 'http://www.w3.org/2000/svg';

    const titleEl = document.createElement('div');
    titleEl.className = 'diagram-title';
    titleEl.textContent = 'Flujo de ejecución de Ansible';
    this.container.appendChild(titleEl);

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'diagram');
    svg.setAttribute('viewBox', '0 0 700 420');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Diagrama de arquitectura de Ansible');

    svg.innerHTML = `
      <defs>
        <marker id="arrowhead-arch" markerWidth="10" markerHeight="7"
          refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#f56a00"/>
        </marker>
        <filter id="glow-arch">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <!-- Administrador -->
      <g id="node-admin" class="diagram-node">
        <rect x="260" y="20" width="180" height="50" rx="8"
          fill="#1a1d27" stroke="#2d3155" stroke-width="2"/>
        <text x="350" y="42" text-anchor="middle" fill="#e2e8f0" font-size="13" font-weight="600">👤 Administrador</text>
        <text x="350" y="60" text-anchor="middle" fill="#8892aa" font-size="11">Tu máquina local</text>
      </g>

      <!-- Arrow 1 -->
      <path id="arrow-1" class="diagram-arrow"
        d="M350 70 L350 105"
        stroke="#f56a00" stroke-width="2" fill="none"
        marker-end="url(#arrowhead-arch)"/>

      <!-- Ansible Core -->
      <g id="node-core" class="diagram-node">
        <rect x="240" y="110" width="220" height="55" rx="8"
          fill="#1a1d27" stroke="#2d3155" stroke-width="2"/>
        <text x="350" y="132" text-anchor="middle" fill="#e2e8f0" font-size="13" font-weight="600">⚙️ Ansible Core</text>
        <text x="350" y="152" text-anchor="middle" fill="#8892aa" font-size="11">Parser • Inventory • Strategy</text>
      </g>

      <!-- Arrow 2 -->
      <path id="arrow-2" class="diagram-arrow"
        d="M350 165 L350 200"
        stroke="#f56a00" stroke-width="2" fill="none"
        marker-end="url(#arrowhead-arch)"/>

      <!-- SSH Layer -->
      <g id="node-ssh" class="diagram-node">
        <rect x="255" y="205" width="190" height="50" rx="8"
          fill="#1a1d27" stroke="#2d3155" stroke-width="2"/>
        <text x="350" y="227" text-anchor="middle" fill="#e2e8f0" font-size="13" font-weight="600">🔒 SSH</text>
        <text x="350" y="245" text-anchor="middle" fill="#8892aa" font-size="11">Conexión cifrada puerto 22</text>
      </g>

      <!-- Arrow 3 -->
      <path id="arrow-3" class="diagram-arrow"
        d="M350 255 L350 290"
        stroke="#f56a00" stroke-width="2" fill="none"
        marker-end="url(#arrowhead-arch)"/>

      <!-- Host Remoto -->
      <g id="node-host" class="diagram-node">
        <rect x="240" y="295" width="220" height="50" rx="8"
          fill="#1a1d27" stroke="#2d3155" stroke-width="2"/>
        <text x="350" y="317" text-anchor="middle" fill="#e2e8f0" font-size="13" font-weight="600">🖥️ Host Remoto</text>
        <text x="350" y="335" text-anchor="middle" fill="#8892aa" font-size="11">Servidor Linux gestionado</text>
      </g>

      <!-- Arrow 4 (to Python) -->
      <path id="arrow-4" class="diagram-arrow"
        d="M470 320 L530 320"
        stroke="#f56a00" stroke-width="2" fill="none"
        marker-end="url(#arrowhead-arch)"/>

      <!-- Python Module -->
      <g id="node-python" class="diagram-node">
        <rect x="535" y="295" width="140" height="50" rx="8"
          fill="#1a1d27" stroke="#2d3155" stroke-width="2"/>
        <text x="605" y="317" text-anchor="middle" fill="#e2e8f0" font-size="12" font-weight="600">🐍 Python</text>
        <text x="605" y="335" text-anchor="middle" fill="#8892aa" font-size="11">Módulo ejecutado</text>
      </g>

      <!-- Arrow 5 (return) -->
      <path id="arrow-5" class="diagram-arrow"
        d="M605 295 L605 200 L560 200 L490 165"
        stroke="#34d399" stroke-width="2" fill="none" stroke-dasharray="6 3"
        marker-end="url(#arrowhead-arch)"/>

      <!-- Resultado label -->
      <g id="node-resultado" class="diagram-node">
        <rect x="530" y="155" width="140" height="40" rx="6"
          fill="#164e3a" stroke="#065f46" stroke-width="1.5"/>
        <text x="600" y="172" text-anchor="middle" fill="#34d399" font-size="12" font-weight="600">✅ Resultado JSON</text>
        <text x="600" y="187" text-anchor="middle" fill="#34d399" font-size="10">changed / failed / msg</text>
      </g>

      <!-- Left label -->
      <text x="30" y="330" fill="#8892aa" font-size="11">Control Node</text>
      <rect x="10" y="5" width="110" height="390" rx="4"
        fill="none" stroke="#2d3155" stroke-width="1" stroke-dasharray="4 3"/>
      <text x="35" y="22" fill="#f56a00" font-size="10" font-weight="600">TU MÁQUINA</text>
    `;

    this.container.appendChild(svg);

    this.steps = [
      {
        label: 'El administrador invoca Ansible',
        activate: () => this.activateNode('node-admin')
      },
      {
        label: 'Ansible Core parsea el playbook',
        activate: () => {
          this.animateArrow('arrow-1');
          this.activateNode('node-core');
        }
      },
      {
        label: 'Ansible establece conexión SSH',
        activate: () => {
          this.animateArrow('arrow-2');
          this.activateNode('node-ssh');
        }
      },
      {
        label: 'Conexión llegó al host remoto',
        activate: () => {
          this.animateArrow('arrow-3');
          this.activateNode('node-host');
        }
      },
      {
        label: 'Python ejecuta el módulo en el host',
        activate: () => {
          this.animateArrow('arrow-4');
          this.activateNode('node-python');
        }
      },
      {
        label: 'El resultado JSON vuelve a Ansible',
        activate: () => {
          this.animateArrow('arrow-5');
          this.activateNodeSuccess('node-resultado');
        }
      },
    ];

    this.addControls();
  }
}
