import { DiagramEngine } from '../DiagramEngine';

export class InventarioDiagram extends DiagramEngine {
  render(): void {
    const titleEl = document.createElement('div');
    titleEl.className = 'diagram-title';
    titleEl.textContent = 'Resolución del inventario de Ansible';
    this.container.appendChild(titleEl);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'diagram');
    svg.setAttribute('viewBox', '0 0 700 380');

    svg.innerHTML = `
      <defs>
        <marker id="ah-inv" markerWidth="8" markerHeight="6"
          refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#60a5fa"/>
        </marker>
      </defs>

      <!-- Inventory file -->
      <g id="inv-file" class="diagram-node">
        <rect x="20" y="160" width="130" height="55" rx="6" fill="#1a1d27" stroke="#2d3155" stroke-width="2"/>
        <text x="85" y="183" text-anchor="middle" fill="#e2e8f0" font-size="12" font-weight="600">📄 Inventory File</text>
        <text x="85" y="200" text-anchor="middle" fill="#8892aa" font-size="10">hosts.ini / hosts.yml</text>
        <text x="85" y="213" text-anchor="middle" fill="#8892aa" font-size="10">Dynamic Plugin</text>
      </g>

      <!-- Arrow 1 -->
      <path id="inv-a1" class="diagram-arrow"
        d="M150 187 L195 187"
        stroke="#60a5fa" stroke-width="2" fill="none" marker-end="url(#ah-inv)"/>

      <!-- Group resolution -->
      <g id="inv-groups" class="diagram-node">
        <rect x="200" y="130" width="140" height="115" rx="6" fill="#1a1d27" stroke="#2d3155" stroke-width="2"/>
        <text x="270" y="152" text-anchor="middle" fill="#60a5fa" font-size="12" font-weight="600">Grupos</text>
        <rect x="215" y="160" width="110" height="24" rx="4" fill="#22263a" stroke="#2d3155"/>
        <text x="270" y="177" text-anchor="middle" fill="#e2e8f0" font-size="11">[servidores_web]</text>
        <rect x="215" y="192" width="110" height="24" rx="4" fill="#22263a" stroke="#2d3155"/>
        <text x="270" y="209" text-anchor="middle" fill="#e2e8f0" font-size="11">[bases_de_datos]</text>
        <rect x="215" y="224" width="110" height="18" rx="4" fill="#22263a" stroke="#2d3155"/>
        <text x="270" y="237" text-anchor="middle" fill="#8892aa" font-size="10">[produccion:children]</text>
      </g>

      <!-- Arrow 2 -->
      <path id="inv-a2" class="diagram-arrow"
        d="M340 187 L385 187"
        stroke="#60a5fa" stroke-width="2" fill="none" marker-end="url(#ah-inv)"/>

      <!-- Host resolution -->
      <g id="inv-hosts" class="diagram-node">
        <rect x="390" y="130" width="140" height="115" rx="6" fill="#1a1d27" stroke="#2d3155" stroke-width="2"/>
        <text x="460" y="152" text-anchor="middle" fill="#60a5fa" font-size="12" font-weight="600">Hosts</text>
        <rect x="405" y="160" width="110" height="20" rx="4" fill="#22263a" stroke="#2d3155"/>
        <text x="460" y="175" text-anchor="middle" fill="#e2e8f0" font-size="10">web1.ejemplo.com</text>
        <rect x="405" y="186" width="110" height="20" rx="4" fill="#22263a" stroke="#2d3155"/>
        <text x="460" y="201" text-anchor="middle" fill="#e2e8f0" font-size="10">web2.ejemplo.com</text>
        <rect x="405" y="212" width="110" height="20" rx="4" fill="#22263a" stroke="#2d3155"/>
        <text x="460" y="227" text-anchor="middle" fill="#e2e8f0" font-size="10">db1.ejemplo.com</text>
        <rect x="405" y="234" width="110" height="8" rx="4" fill="#2d3155"/>
      </g>

      <!-- Arrow 3 -->
      <path id="inv-a3" class="diagram-arrow"
        d="M530 187 L565 187"
        stroke="#60a5fa" stroke-width="2" fill="none" marker-end="url(#ah-inv)"/>

      <!-- Final host vars -->
      <g id="inv-vars" class="diagram-node">
        <rect x="570" y="130" width="110" height="115" rx="6" fill="#164e3a" stroke="#065f46" stroke-width="2"/>
        <text x="625" y="152" text-anchor="middle" fill="#34d399" font-size="12" font-weight="600">Host Vars</text>
        <text x="625" y="172" text-anchor="middle" fill="#34d399" font-size="10">ansible_host</text>
        <text x="625" y="190" text-anchor="middle" fill="#34d399" font-size="10">ansible_user</text>
        <text x="625" y="208" text-anchor="middle" fill="#34d399" font-size="10">ansible_port</text>
        <text x="625" y="226" text-anchor="middle" fill="#34d399" font-size="10">http_port</text>
        <text x="625" y="244" text-anchor="middle" fill="#34d399" font-size="10">+ group_vars</text>
      </g>

      <!-- Variable flow labels -->
      <text x="350" y="30" text-anchor="middle" fill="#8892aa" font-size="11" font-weight="600">PRECEDENCIA DE VARIABLES</text>
      <text x="350" y="50" text-anchor="middle" fill="#8892aa" font-size="10">host_vars > group_vars/group > group_vars/all > inventory vars</text>

      <!-- Inventory group variables annotation -->
      <g id="inv-groupvars" class="diagram-node">
        <rect x="150" y="310" width="180" height="50" rx="6" fill="#1e3a5f" stroke="#1d4ed8" stroke-width="1.5"/>
        <text x="240" y="330" text-anchor="middle" fill="#60a5fa" font-size="11" font-weight="600">group_vars/servidores_web</text>
        <text x="240" y="350" text-anchor="middle" fill="#8892aa" font-size="10">http_port: 80 | ansible_user: deploy</text>
      </g>
      <line x1="270" y1="245" x2="240" y2="310" stroke="#1d4ed8" stroke-width="1" stroke-dasharray="4 3"/>

      <g id="inv-hostvars" class="diagram-node">
        <rect x="390" y="310" width="160" height="50" rx="6" fill="#1e3a5f" stroke="#1d4ed8" stroke-width="1.5"/>
        <text x="470" y="330" text-anchor="middle" fill="#60a5fa" font-size="11" font-weight="600">host_vars/web2</text>
        <text x="470" y="350" text-anchor="middle" fill="#8892aa" font-size="10">ansible_port: 2222</text>
      </g>
      <line x1="460" y1="245" x2="470" y2="310" stroke="#1d4ed8" stroke-width="1" stroke-dasharray="4 3"/>
    `;

    this.container.appendChild(svg);

    this.steps = [
      { label: 'Ansible lee el archivo de inventario', activate: () => this.activateNode('inv-file') },
      { label: 'Resuelve grupos y relaciones entre ellos', activate: () => { this.animateArrow('inv-a1'); this.activateNode('inv-groups'); } },
      { label: 'Expande los hosts dentro de cada grupo', activate: () => { this.animateArrow('inv-a2'); this.activateNode('inv-hosts'); } },
      { label: 'Carga group_vars para cada grupo', activate: () => this.activateNode('inv-groupvars') },
      { label: 'Carga host_vars para cada host específico', activate: () => this.activateNode('inv-hostvars') },
      { label: 'Mergea variables en orden de precedencia', activate: () => { this.animateArrow('inv-a3'); this.activateNodeSuccess('inv-vars'); } },
    ];

    this.addControls();
  }
}
