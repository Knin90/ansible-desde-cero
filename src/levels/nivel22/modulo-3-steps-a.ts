import type { StepContent } from '../types';

export const nivel22Mod3StepsA: StepContent[] = [
  {
    title: 'Ansible en el bucle DevOps: ¿dónde encaja?',
    body: `
      <p>DevOps no es una herramienta — es una cultura y un conjunto de prácticas. Ansible es una de las piezas del puzzle, pero no todas las piezas. Entender dónde encaja evita el error de usarlo para todo.</p>
      <div class="highlight-box">
        <p><strong>Ansible brilla en:</strong> provisioning de servidores, gestión de configuración, despliegue de aplicaciones a servidores, tareas operacionales (backups, rotación de logs, parches). <strong>No es la herramienta ideal para:</strong> orquestación de contenedores (Kubernetes hace eso mejor), pipelines de build (Jenkins/GitHub Actions), o gestión de estado de infraestructura compleja (Terraform).</p>
      </div>
      <p>El bucle DevOps típico con Ansible integrado:</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">text</span><span class="code-block-filename">devops-loop.txt</span></div>
        <pre class="language-text"><code class="language-text">┌─────────────────────────────────────────────────────────┐
│                    BUCLE DEVOPS                          │
│                                                         │
│  Plan → Code → Build → Test → Release → Deploy → Operate│
│                                    ↑            ↑       │
│                              Terraform      ANSIBLE     │
│                              (infra)     (config+app)   │
└─────────────────────────────────────────────────────────┘</code></pre>
      </div>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Terraform construye el edificio (servidores, redes, base de datos en la nube). Ansible lo amuebla y mantiene (configuración, software, actualizaciones). Docker/Kubernetes gestiona los residentes (contenedores). Son complementarios, no sustitutos.</p>
      </div>
    `,
  },
  {
    title: 'GitOps con Ansible: infraestructura como Pull Requests',
    body: `
      <p>GitOps aplica los principios de desarrollo de software (revisión de código, pull requests, CI/CD) a la gestión de infraestructura. Con Ansible y GitOps, ningún cambio de infraestructura sucede sin pasar por Git.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">text</span><span class="code-block-filename">gitops-flow.txt</span></div>
        <pre class="language-text"><code class="language-text">Ingeniero → PR en GitHub → Review del equipo → Merge a main
                                                  ↓
                                       GitHub Actions trigger
                                                  ↓
                                ansible-playbook en pipeline CI/CD
                                                  ↓
                                       Cambio aplicado en producción
                                                  ↓
                                       Notificación a Slack</code></pre>
      </div>
      <p>Estructura de repositorio GitOps recomendada:</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">text</span><span class="code-block-filename">estructura-gitops.txt</span></div>
        <pre class="language-text"><code class="language-text">infrastructure/
├── inventories/
│   ├── production/
│   │   ├── hosts.yml
│   │   └── group_vars/
│   └── staging/
│       ├── hosts.yml
│       └── group_vars/
├── roles/
│   ├── webserver/
│   ├── database/
│   └── monitoring/
├── playbooks/
│   ├── deploy-app.yml
│   ├── configure-servers.yml
│   └── maintenance.yml
├── .github/
│   └── workflows/
│       ├── lint.yml          ← ansible-lint en PR
│       └── deploy.yml        ← ansible-playbook en merge
└── ansible.cfg</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Protección de rama main:</strong> Configurá branch protection rules en GitHub para requerir al menos un reviewer y que el CI (ansible-lint) pase antes de poder hacer merge. Esto garantiza que ningún playbook con errores de sintaxis o estilo llegue a producción.</div>
      </div>
    `,
  },
  {
    title: 'Despliegue de Prometheus y node_exporter',
    body: `
      <p>Prometheus es el estándar de facto para monitoreo de infraestructura. node_exporter expone métricas del sistema operativo que Prometheus recolecta. Ansible puede desplegar ambos de manera idempotente.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/node_exporter/tasks/main.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Crear usuario para node_exporter (sin shell)
  ansible.builtin.user:
name: node_exporter
system: true
shell: /sbin/nologin
create_home: false

- name: Descargar node_exporter
  ansible.builtin.get_url:
url: "https://github.com/prometheus/node_exporter/releases/download/v{{ node_exporter_version }}/node_exporter-{{ node_exporter_version }}.linux-amd64.tar.gz"
dest: /tmp/node_exporter.tar.gz
checksum: "sha256:{{ node_exporter_checksum }}"

- name: Extraer node_exporter
  ansible.builtin.unarchive:
src: /tmp/node_exporter.tar.gz
dest: /tmp/
remote_src: true

- name: Instalar binario de node_exporter
  ansible.builtin.copy:
src: "/tmp/node_exporter-{{ node_exporter_version }}.linux-amd64/node_exporter"
dest: /usr/local/bin/node_exporter
owner: node_exporter
group: node_exporter
mode: '0755'
remote_src: true
  notify: Reiniciar node_exporter

- name: Crear servicio systemd para node_exporter
  ansible.builtin.template:
src: node_exporter.service.j2
dest: /etc/systemd/system/node_exporter.service
  notify:
- Recargar systemd
- Reiniciar node_exporter

- name: Habilitar y arrancar node_exporter
  ansible.builtin.service:
name: node_exporter
state: started
enabled: true</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">roles/node_exporter/templates/node_exporter.service.j2</span></div>
        <pre class="language-ini"><code class="language-ini">[Unit]
Description=Prometheus Node Exporter
After=network.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter \
  --web.listen-address=:{{ node_exporter_port | default(9100) }} \
  --collector.systemd \
  --collector.processes

[Install]
WantedBy=multi-user.target</code></pre>
      </div>
    `,
  }
];
