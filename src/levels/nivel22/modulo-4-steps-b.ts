import type { StepContent } from '../types';

export const nivel22Mod4StepsB: StepContent[] = [
  {
    title: 'Logging centralizado con Loki y Promtail',
    body: `
      <p>Loki es el sistema de logging de Grafana Labs, diseñado para ser el "Prometheus de los logs". No indexa el contenido de los logs (solo las etiquetas), lo que lo hace extremadamente eficiente en almacenamiento. Promtail es el agente que recolecta logs y los envía a Loki.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/promtail/tasks/main.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Descargar Promtail
  ansible.builtin.get_url:
url: "https://github.com/grafana/loki/releases/download/v{{ loki_version }}/promtail-linux-amd64.zip"
dest: /tmp/promtail.zip
checksum: "sha256:{{ promtail_checksum }}"

- name: Instalar unzip
  ansible.builtin.package:
name: unzip
state: present

- name: Extraer e instalar Promtail
  ansible.builtin.unarchive:
src: /tmp/promtail.zip
dest: /usr/local/bin/
remote_src: true
mode: '0755'

- name: Crear usuario promtail
  ansible.builtin.user:
name: promtail
system: true
shell: /sbin/nologin
groups:
  - systemd-journal
  - adm

- name: Configurar Promtail
  ansible.builtin.template:
src: promtail-config.yml.j2
dest: /etc/promtail/config.yml
owner: promtail
group: promtail
mode: '0640'
  notify: Reiniciar promtail</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/promtail/templates/promtail-config.yml.j2</span></div>
        <pre class="language-yaml"><code class="language-yaml">server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://{{ loki_server }}:3100/loki/api/v1/push

scrape_configs:
  - job_name: system
static_configs:
  - targets:
      - localhost
    labels:
      job: system-logs
      host: {{ inventory_hostname }}
      environment: {{ env | default('production') }}
      __path__: /var/log/syslog

  - job_name: nginx
static_configs:
  - targets:
      - localhost
    labels:
      job: nginx-access
      host: {{ inventory_hostname }}
      __path__: /var/log/nginx/access.log
pipeline_stages:
  - regex:
      expression: '^(?P<remote_addr>\S+) - (?P<remote_user>\S+) \[(?P<time_local>[^\]]+)\] "(?P<method>\S+) (?P<path>\S+) \S+" (?P<status>\d+) (?P<body_bytes_sent>\d+)'
  - labels:
      method:
      status:</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Eficiencia de Loki:</strong> a diferencia de Elasticsearch que indexa cada palabra de cada log, Loki solo indexa las etiquetas (labels). Esto reduce el almacenamiento necesario entre 10x y 100x. La búsqueda en Loki usa LogQL, un lenguaje similar a PromQL.</div>
      </div>
    `,
  },
  {
    title: 'Ansible callback plugins para métricas de playbooks',
    body: `
      <p>Ansible tiene plugins de callback que se ejecutan durante y después de los playbooks. Dos de los más útiles vienen incluidos: <code>timer</code> (tiempo total) y <code>profile_tasks</code> (tiempo por tarea).</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
        <pre class="language-ini"><code class="language-ini">[defaults]
# Habilitar múltiples plugins de callback
callbacks_enabled = timer, profile_tasks, ansible.posix.json

# El callback json genera salida estructurada (útil para CI/CD)
stdout_callback = yaml

[callback_profile_tasks]
# Mostrar las 20 tareas más lentas al final
task_output_limit = 20
sort_order = descending</code></pre>
      </div>
      <p>Con <code>profile_tasks</code> habilitado, al final de cada playbook ves algo así:</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">text</span><span class="code-block-filename">salida profile_tasks</span></div>
        <pre class="language-text"><code class="language-text">Saturday 31 July 2026 03:00:00 +0000 (0:00:10.456)  0:02:34.891 ****
===============================================================================
Instalar paquetes del sistema -------------- 45.23s
Descargar Prometheus ----------------------- 32.11s
Configurar nginx --------------------------- 8.54s
Generar certificado TLS -------------------- 6.23s
Verificar health checks -------------------- 5.89s
...
Playbook run took 0 days, 0 hours, 2 minutes, 34 seconds</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/monitoring/tasks/ansible_metrics.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# Exportar métricas de Ansible a un archivo que Prometheus puede scraping
- name: Registrar métricas de ejecución de playbook
  ansible.builtin.copy:
content: |
  # HELP ansible_play_duration_seconds Duración del último playbook en segundos
  # TYPE ansible_play_duration_seconds gauge
  ansible_play_duration_seconds{play="{{ ansible_play_name }}", host="{{ inventory_hostname }}"} {{ ansible_play_duration | default(0) }}
  # HELP ansible_play_changed_tasks Total de tareas que realizaron cambios
  # TYPE ansible_play_changed_tasks counter
  ansible_play_changed_tasks{play="{{ ansible_play_name }}", host="{{ inventory_hostname }}"} {{ ansible_stats.changed | default(0) }}
dest: /var/lib/node_exporter/textfile_collector/ansible_metrics.prom
mode: '0644'
  delegate_to: "{{ inventory_hostname }}"</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Textfile collector:</strong> node_exporter tiene un textfile collector que puede scraping archivos .prom en un directorio. Esto permite que cualquier script o playbook exporte métricas custom a Prometheus sin necesidad de un exporter dedicado.</div>
      </div>
    `,
  },
  {
    title: 'Alerting: reglas de Alertmanager con Ansible',
    body: `
      <p>Alertmanager recibe alertas de Prometheus y las enruta a los canales correctos (email, Slack, PagerDuty). Ansible puede gestionar tanto las reglas de alerta de Prometheus como la configuración de rutas de Alertmanager.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/prometheus/templates/alerts.yml.j2</span></div>
        <pre class="language-yaml"><code class="language-yaml">groups:
  - name: infraestructura
interval: 30s
rules:
  - alert: HostCaído
    expr: up == 0
    for: 2m
    labels:
      severity: critical
      team: infra
    annotations:
      summary: "Host {{ "{{ $labels.instance }}" }} caído"
      description: "{{ "{{ $labels.instance }}" }} no responde desde hace más de 2 minutos"
      runbook: "https://wiki.empresa.com/runbooks/host-caido"

  - alert: DiskSpaceBajo
    expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 15
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Espacio en disco bajo en {{ "{{ $labels.instance }}" }}"
      description: "Quedan menos del 15% de espacio en {{ "{{ $labels.mountpoint }}" }}"

  - alert: CertificadoTLSPorVencer
    expr: (probe_ssl_earliest_cert_expiry - time()) / 86400 < 30
    for: 1h
    labels:
      severity: warning
    annotations:
      summary: "Certificado TLS por vencer en {{ "{{ $labels.instance }}" }}"
      description: "El certificado vence en menos de 30 días"</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/alertmanager/templates/alertmanager.yml.j2</span></div>
        <pre class="language-yaml"><code class="language-yaml">global:
  slack_api_url: "{{ alertmanager_slack_webhook }}"
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'slack-default'
  routes:
- match:
    severity: critical
  receiver: 'pagerduty-critical'
  continue: true
- match:
    severity: warning
  receiver: 'slack-default'

receivers:
  - name: 'slack-default'
slack_configs:
  - channel: '#ops-alerts'
    title: '{{ "{{ .GroupLabels.alertname }}" }}'
    text: '{{ "{{ range .Alerts }}{{ .Annotations.description }}\n{{ end }}" }}'
    send_resolved: true

  - name: 'pagerduty-critical'
pagerduty_configs:
  - service_key: "{{ alertmanager_pagerduty_key }}"</code></pre>
      </div>
      <div class="lab-box">
        <div class="lab-box-header">🧪 Laboratorio final: Stack de observabilidad completo</div>
        <p><strong>Objetivo:</strong> desplegar el stack completo en un servidor de staging.</p>
        <ol>
          <li>Aplicá el rol <code>node_exporter</code> en todos los hosts del inventario</li>
          <li>Desplegá Prometheus en el servidor de monitoreo con targets generados dinámicamente</li>
          <li>Desplegá Grafana con el datasource de Prometheus y al menos un dashboard de node_exporter</li>
          <li>Configurá Alertmanager con al menos una regla de alerta y una ruta a Slack</li>
          <li>Desplegá Promtail en todos los hosts y Loki en el servidor de monitoreo</li>
          <li>Verificá el stack completo: generá carga en un host y confirmar que aparece en Grafana</li>
        </ol>
      </div>
      <div class="challenge-box">
        <div class="challenge-box-header">🏆 Desafío final del curso</div>
        <p>Creá un playbook <code>site.yml</code> que integre todo lo aprendido en el Nivel 22: hardening de Linux, gestión de certificados TLS, integración CI/CD y stack de observabilidad completo. Este playbook debe poder desplegar un servidor production-ready desde cero en menos de 15 minutos. ¡Eso es Ansible en producción real!</p>
      </div>
    `,
  }
];
