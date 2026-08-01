import type { StepContent } from '../types';

export const nivel22Mod3StepsB: StepContent[] = [
  {
    title: 'Notificaciones a Slack desde Ansible',
    body: `
      <p>Ansible puede enviar notificaciones a Slack durante la ejecución de playbooks. Esto convierte tus deploys en eventos visibles para todo el equipo, sin necesidad de que nadie mire los logs.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbooks/deploy-app.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Desplegar aplicación con notificaciones
  hosts: webservers
  vars:
app_version: "{{ lookup('env', 'APP_VERSION') }}"
deployer: "{{ lookup('env', 'GITHUB_ACTOR') | default('manual') }}"
  tasks:
- name: Notificar inicio de deploy a Slack
  community.general.slack:
    token: "{{ slack_token }}"
    channel: "#deployments"
    color: "warning"
    msg: |
      🚀 *Deploy iniciado*
      • Versión: \`{{ app_version }}\`
      • Ambiente: \`{{ inventory_hostname }}\`
      • Iniciado por: \`{{ deployer }}\`
    attachments:
      - title: "Detalles"
        text: "El deploy está en curso. Próxima actualización en ~5 minutos."
  delegate_to: localhost
  run_once: true

- name: Desplegar la aplicación
  # ... tareas de deploy ...

- name: Verificar health check
  ansible.builtin.uri:
    url: "http://{{ ansible_host }}/health"
    status_code: 200
  register: health_check
  retries: 5
  delay: 10
  until: health_check.status == 200

- name: Notificar éxito a Slack
  community.general.slack:
    token: "{{ slack_token }}"
    channel: "#deployments"
    color: "good"
    msg: |
      ✅ *Deploy completado exitosamente*
      • Versión: \`{{ app_version }}\`
      • Tiempo total: \`{{ ansible_play_duration | default('N/A') }}\`
  delegate_to: localhost
  run_once: true

  rescue:
- name: Notificar fallo a Slack
  community.general.slack:
    token: "{{ slack_token }}"
    channel: "#deployments"
    color: "danger"
    msg: |
      🔴 *Deploy FALLIDO*
      • Versión: \`{{ app_version }}\`
      • Tarea fallida: \`{{ ansible_failed_task.name }}\`
      • Error: \`{{ ansible_failed_result.msg }}\`
  delegate_to: localhost
  run_once: true</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Secretos en CI/CD:</strong> el <code>slack_token</code> nunca debe estar en el repositorio. Guardalo en GitHub Secrets (o GitLab CI Variables) y referencialos en el pipeline como variables de entorno. En el playbook, usás <code>lookup('env', 'SLACK_TOKEN')</code> o lo pasás como extra-var encriptada con Vault.</div>
      </div>
    `,
  },
  {
    title: 'Triggers desde GitHub Actions y GitLab CI',
    body: `
      <p>La integración real de Ansible con CI/CD significa que tu pipeline dispara los playbooks automáticamente cuando hay un merge a main. Sin intervención humana, sin "acordarse de correr el playbook".</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/deploy.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">name: Deploy con Ansible

on:
  push:
branches: [main]
paths:
  - 'playbooks/**'
  - 'roles/**'
  - 'inventories/**'

jobs:
  lint:
runs-on: ubuntu-latest
steps:
  - uses: actions/checkout@v4
  - name: Instalar ansible-lint
    run: pip install ansible-lint
  - name: Ejecutar lint
    run: ansible-lint playbooks/

  deploy:
needs: lint
runs-on: ubuntu-latest
environment: production  # requiere aprovación manual en GitHub
steps:
  - uses: actions/checkout@v4

  - name: Instalar Ansible
    run: |
      pip install ansible
      ansible-galaxy collection install -r requirements.yml

  - name: Configurar clave SSH
    run: |
      mkdir -p ~/.ssh
      echo "${'$'}{{ secrets.ANSIBLE_SSH_KEY }}" > ~/.ssh/ansible
      chmod 600 ~/.ssh/ansible

  - name: Crear archivo de vault password
    run: echo "${'$'}{{ secrets.ANSIBLE_VAULT_PASSWORD }}" > /tmp/.vault_pass

  - name: Ejecutar playbook de deploy
    run: |
      ansible-playbook \
        -i inventories/production/ \
        --private-key ~/.ssh/ansible \
        --vault-password-file /tmp/.vault_pass \
        -e "app_version=${'$'}{{ github.sha }}" \
        playbooks/deploy-app.yml

  - name: Limpiar secretos
    if: always()
    run: |
      rm -f ~/.ssh/ansible /tmp/.vault_pass</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>paths filter:</strong> El trigger <code>paths</code> evita que el deploy se dispare cuando solo cambia documentación o el README. Solo hace deploy cuando cambian archivos relevantes de Ansible. Ahorrás tiempo de pipeline y reduces el riesgo de deploys accidentales.</div>
      </div>
    `,
  },
  {
    title: 'Runbook automation: procedimientos manuales → playbooks',
    body: `
      <p>Un runbook es un documento que describe cómo responder a un incidente o hacer un procedimiento operacional. La mayoría de los equipos tienen runbooks en Confluence o Notion que nadie sigue exactamente. Ansible convierte esos runbooks en código ejecutable y reproducible.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbooks/runbook-db-backup.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# Runbook: Backup de base de datos antes de deploy mayor
# Equivalente manual: 45 minutos. Con Ansible: 8 minutos.
- name: "[RUNBOOK] Backup pre-deploy de PostgreSQL"
  hosts: databases
  become: true
  vars:
backup_dir: /var/backups/postgresql
backup_date: "{{ ansible_date_time.date }}-{{ ansible_date_time.hour }}{{ ansible_date_time.minute }}"
  tasks:
- name: Verificar espacio disponible en disco
  ansible.builtin.assert:
    that:
      - (ansible_mounts | selectattr('mount', 'equalto', '/var') | list | first).size_available > 10737418240
    fail_msg: "ABORTAR: Menos de 10GB disponibles en /var. Liberar espacio antes de continuar."

- name: Crear directorio de backup
  ansible.builtin.file:
    path: "{{ backup_dir }}/{{ backup_date }}"
    state: directory
    owner: postgres
    mode: '0700'

- name: Ejecutar pg_dump para cada base de datos
  ansible.builtin.command: >
    pg_dump
    --format=custom
    --compress=9
    --file={{ backup_dir }}/{{ backup_date }}/{{ item }}.dump
    {{ item }}
  become_user: postgres
  loop: "{{ postgresql_databases }}"
  register: backup_result

- name: Verificar integridad de backups
  ansible.builtin.command: >
    pg_restore --list {{ backup_dir }}/{{ backup_date }}/{{ item }}.dump
  become_user: postgres
  loop: "{{ postgresql_databases }}"
  changed_when: false

- name: Registrar backup en inventario de backups
  ansible.builtin.lineinfile:
    path: /var/log/backup-inventory.log
    line: "{{ backup_date }} | {{ inventory_hostname }} | {{ postgresql_databases | join(',') }} | OK"
    create: true</code></pre>
      </div>
      <div class="challenge-box">
        <div class="challenge-box-header">🏆 Desafío: Convertir tu runbook</div>
        <p>Tomá el procedimiento más repetitivo de tu equipo (rotación de logs, limpieza de sesiones, restart de servicios en orden) y convertilo en un playbook Ansible. Medí el tiempo manual vs. el tiempo automatizado y documentá el ahorro en el README del playbook.</p>
      </div>
    `,
  }
];
