import type { StepContent } from '../types';

export const nivel22Mod4StepsA: StepContent[] = [
  {
    title: '¿Por qué observabilidad como código?',
    body: `
      <p>Observabilidad significa poder responder la pregunta "¿qué está pasando en mi sistema?" sin necesidad de adivinar. Los tres pilares son: <strong>métricas</strong> (números que cambian en el tiempo), <strong>logs</strong> (eventos con contexto) y <strong>trazas</strong> (recorrido de un request a través del sistema).</p>
      <div class="highlight-box">
        <p><strong>El problema sin Ansible:</strong> configurás Grafana a mano, creás dashboards, definís reglas de alerting. Un mes después alguien modifica una regla "para probar" y no la restaura. Tres meses después el servidor de monitoreo falla y nadie recuerda cómo estaba configurado. Con Ansible, toda esa configuración vive en Git.</p>
      </div>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>La observabilidad manual es como intentar diagnosticar una enfermedad mirando al paciente sin instrumentos. Observabilidad como código con Ansible es como tener un hospital completamente instrumentado que se auto-configura: cada sala tiene los monitores correctos, las alarmas correctas y todos los médicos saben interpretarlos porque el sistema fue diseñado consistentemente.</p>
      </div>
      <p>Ventajas concretas de gestionar observabilidad con Ansible:</p>
      <ul>
        <li><strong>Recuperación rápida:</strong> si el servidor de monitoreo falla, lo reconstruís en 10 minutos</li>
        <li><strong>Consistencia:</strong> todos los ambientes (staging, producción) tienen el mismo stack de monitoreo</li>
        <li><strong>Revisión de cambios:</strong> las modificaciones a alertas pasan por code review como cualquier otro cambio</li>
        <li><strong>Documentación implícita:</strong> el playbook es la documentación de cómo está configurado el sistema</li>
      </ul>
    `,
  },
  {
    title: 'Despliegue del stack Prometheus',
    body: `
      <p>Prometheus es el motor de métricas. Scraping periódico de endpoints /metrics, almacenamiento local en time-series, PromQL para consultas. Ansible puede desplegarlo con configuración dinámica generada desde el inventario.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/prometheus/tasks/main.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Crear usuario prometheus
  ansible.builtin.user:
name: prometheus
system: true
shell: /sbin/nologin
home: /var/lib/prometheus
create_home: false

- name: Crear directorios de prometheus
  ansible.builtin.file:
path: "{{ item }}"
state: directory
owner: prometheus
group: prometheus
mode: '0755'
  loop:
- /etc/prometheus
- /var/lib/prometheus
- /etc/prometheus/rules.d
- /etc/prometheus/targets.d

- name: Descargar y extraer prometheus
  ansible.builtin.unarchive:
src: "https://github.com/prometheus/prometheus/releases/download/v{{ prometheus_version }}/prometheus-{{ prometheus_version }}.linux-amd64.tar.gz"
dest: /tmp/
remote_src: true

- name: Instalar binarios de prometheus
  ansible.builtin.copy:
src: "/tmp/prometheus-{{ prometheus_version }}.linux-amd64/{{ item }}"
dest: "/usr/local/bin/{{ item }}"
owner: prometheus
group: prometheus
mode: '0755'
remote_src: true
  loop:
- prometheus
- promtool
  notify: Reiniciar prometheus

- name: Generar prometheus.yml desde inventario
  ansible.builtin.template:
src: prometheus.yml.j2
dest: /etc/prometheus/prometheus.yml
owner: prometheus
group: prometheus
mode: '0644'
validate: /usr/local/bin/promtool check config %s
  notify: Reiniciar prometheus

- name: Crear servicio systemd
  ansible.builtin.template:
src: prometheus.service.j2
dest: /etc/systemd/system/prometheus.service
  notify:
- Recargar systemd
- Reiniciar prometheus

- name: Habilitar y arrancar prometheus
  ansible.builtin.service:
name: prometheus
state: started
enabled: true</code></pre>
      </div>
      <p>La plantilla de configuración genera targets dinámicamente desde el inventario:</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/prometheus/templates/prometheus.yml.j2</span></div>
        <pre class="language-yaml"><code class="language-yaml">global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
- static_configs:
    - targets: ['localhost:9093']

rule_files:
  - "rules.d/*.yml"

scrape_configs:
  - job_name: 'prometheus'
static_configs:
  - targets: ['localhost:9090']

  - job_name: 'node'
static_configs:
{% for host in groups['all'] %}
  - targets: ['{{ hostvars[host]['ansible_host'] }}:9100']
    labels:
      instance: '{{ host }}'
      environment: '{{ hostvars[host]['env'] | default("production") }}'
{% endfor %}</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>validate:</strong> El parámetro <code>validate</code> en el módulo template ejecuta <code>promtool check config</code> sobre el archivo generado antes de copiarlo al destino. Si la configuración tiene errores, la tarea falla sin afectar el archivo actual en producción. Esto es un pattern de seguridad importante para archivos de configuración críticos.</div>
      </div>
    `,
  },
  {
    title: 'Despliegue de Grafana con dashboards provisionados',
    body: `
      <p>Grafana tiene una característica de "provisioning" que permite definir datasources y dashboards como archivos YAML y JSON en disco. Ansible despliega esos archivos y Grafana los carga automáticamente — sin necesidad de configurar nada a mano en la UI.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/grafana/tasks/main.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Agregar repositorio de Grafana
  ansible.builtin.deb822_repository:
name: grafana
types: deb
uris: https://apt.grafana.com
suites: stable
components: main
signed_by: https://apt.grafana.com/gpg.key
state: present
  when: ansible_os_family == 'Debian'

- name: Instalar Grafana
  ansible.builtin.apt:
name: grafana
state: present
update_cache: true
  when: ansible_os_family == 'Debian'

- name: Configurar Grafana (grafana.ini)
  ansible.builtin.template:
src: grafana.ini.j2
dest: /etc/grafana/grafana.ini
owner: grafana
group: grafana
mode: '0640'
  notify: Reiniciar grafana

- name: Crear directorio de provisioning
  ansible.builtin.file:
path: "{{ item }}"
state: directory
owner: grafana
group: grafana
mode: '0755'
  loop:
- /etc/grafana/provisioning/datasources
- /etc/grafana/provisioning/dashboards
- /var/lib/grafana/dashboards

- name: Configurar datasource de Prometheus
  ansible.builtin.template:
src: prometheus-datasource.yml.j2
dest: /etc/grafana/provisioning/datasources/prometheus.yml
owner: grafana
group: grafana
mode: '0640'
  notify: Reiniciar grafana

- name: Copiar dashboards JSON a Grafana
  ansible.builtin.copy:
src: "{{ item }}"
dest: "/var/lib/grafana/dashboards/{{ item | basename }}"
owner: grafana
group: grafana
mode: '0644'
  with_fileglob:
- "{{ role_path }}/files/dashboards/*.json"
  notify: Reiniciar grafana

- name: Configurar dashboard provider
  ansible.builtin.template:
src: dashboard-provider.yml.j2
dest: /etc/grafana/provisioning/dashboards/provider.yml
owner: grafana
group: grafana
mode: '0640'
  notify: Reiniciar grafana</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/grafana/templates/dashboard-provider.yml.j2</span></div>
        <pre class="language-yaml"><code class="language-yaml">apiVersion: 1
providers:
  - name: ansible-managed
folder: Infrastructure
type: file
disableDeletion: true   # Grafana no puede borrar dashboards gestionados por Ansible
updateIntervalSeconds: 30
options:
  path: /var/lib/grafana/dashboards</code></pre>
      </div>
    `,
  }
];
