import type { StepContent } from '../types';

export const nivel21Mod2StepsB: StepContent[] = [
  {
    title: 'Rolling updates: serial, max_fail_percentage y pre/post tasks',
    body: `
      <p>Un rolling update actualiza los hosts de a grupos, nunca todos a la vez, para mantener el servicio disponible durante el despliegue. Ansible lo gestiona con <code>serial</code>, <code>max_fail_percentage</code>, y las tareas de pre y post actualización.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbooks/webservers.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Configurar y actualizar servidores web con rolling update
  hosts: rol_webserver
  become: true

  # Rolling update: actualizar un 20% de los hosts a la vez
  # Con 10 servidores: lote de 2 hosts × 5 rondas
  serial: "20%"

  # Si más del 10% de los hosts falla, abortar el deploy
  max_fail_percentage: 10

  # gather_facts: necesario para ansible_distribution, etc.
  gather_facts: true

  pre_tasks:
# ① Sacar el host del load balancer ANTES de actualizarlo
- name: Sacar host del load balancer (AWS ALB)
  amazon.aws.elb_target:
    target_group_arn: "{{ alb_target_group_arn }}"
    target_id: "{{ ec2_instance_id }}"
    state: absent
    wait: true            # Esperar hasta que el ALB lo desregistre
    wait_timeout: 60
  delegate_to: localhost  # La llamada a la API de AWS va desde el controller
  tags: [rolling, lb]

# ② Esperar que el tráfico existente drene
- name: Esperar drenaje de conexiones (30 segundos)
  ansible.builtin.wait_for:
    timeout: 30
  delegate_to: localhost
  tags: [rolling]

  roles:
- role: servidor_web
  tags: [app, nginx]

- role: despliegue_app
  tags: [app, deploy]

  post_tasks:
# ③ Smoke test: verificar que la app responde antes de re-agregar al LB
- name: Verificar que la aplicación responde
  ansible.builtin.uri:
    url: "http://{{ ansible_host }}/health"
    method: GET
    status_code: 200
    timeout: 10
  register: health_check
  retries: 5
  delay: 10
  until: health_check.status == 200
  delegate_to: localhost
  tags: [rolling, verify]

# ④ Re-agregar al load balancer SOLO si el smoke test pasó
- name: Re-agregar host al load balancer
  amazon.aws.elb_target:
    target_group_arn: "{{ alb_target_group_arn }}"
    target_id: "{{ ec2_instance_id }}"
    state: present
    wait: true
    wait_timeout: 120     # Esperar hasta que el ALB marque el target healthy
  delegate_to: localhost
  tags: [rolling, lb]

# ⑤ Notificar en Slack el resultado
- name: Notificar deploy exitoso en Slack
  community.general.slack:
    token: "{{ vault_slack_token }}"
    channel: "#deploys"
    msg: ":white_check_mark: {{ inventory_hostname }} actualizado exitosamente ({{ app_version }})"
  delegate_to: localhost
  when: not ansible_check_mode
  tags: [notify]</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbooks/databases.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Configurar bases de datos (failover-safe)
  hosts: rol_database
  become: true

  # Bases de datos: SIEMPRE de a uno por vez
  # Nunca actualizar primaria y réplica al mismo tiempo
  serial: 1

  # Tolerancia cero a fallos en BD
  max_fail_percentage: 0

  gather_facts: true

  pre_tasks:
- name: Verificar que este nodo NO es el primario de PostgreSQL
  ansible.builtin.command: psql -U postgres -c "SELECT pg_is_in_recovery();"
  register: pg_recovery_status
  changed_when: false
  failed_when: false
  tags: [database, verify]

- name: Fallar si es el primario (actualizar réplicas primero)
  ansible.builtin.fail:
    msg: |
      {{ inventory_hostname }} es el primario de PostgreSQL.
      Actualizá las réplicas primero y hacé failover antes de actualizar el primario.
  when:
    - pg_recovery_status.rc == 0
    - "'f' in pg_recovery_status.stdout"   # "f" = not in recovery = primary
  tags: [database, verify]

  roles:
- role: base_de_datos
  tags: [database]
- role: monitoreo
  tags: [monitoring]

  post_tasks:
- name: Verificar replicación después del update
  ansible.builtin.command: >
    psql -U postgres -c
    "SELECT client_addr, state, sent_lsn, write_lsn, flush_lsn, replay_lsn
     FROM pg_stat_replication;"
  register: replication_status
  changed_when: false
  tags: [database, verify]

- name: Mostrar estado de replicación
  ansible.builtin.debug:
    var: replication_status.stdout_lines
  tags: [database, verify]</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>serial: "20%" con hosts impares:</strong> Si tenés 5 hosts y usás serial: "20%", Ansible redondeará a 1 host por lote (20% de 5 = 1). Con serial: "50%" serían 2 hosts por lote. Si el cálculo produce 0, Ansible lo redondea a 1 para garantizar que al menos un host se actualice por ronda. Verificá el comportamiento esperado con --check antes del primer deploy.</div>
      </div>
    `
  },
  {
    title: 'Verificación de idempotencia',
    body: `
      <p>La idempotencia es una propiedad fundamental de los playbooks Ansible: ejecutarlo una segunda vez sobre un sistema ya configurado no debe producir cambios. Testear la idempotencia es parte esencial del proceso de CI.</p>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>Idempotencia:</strong> Una operación es idempotente si aplicarla una o más veces produce el mismo resultado. En Ansible: el segundo run de un playbook bien escrito debe terminar con 0 tareas changed. Si hay changed en el segundo run, hay una tarea no idempotente que necesita revisión.</div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">test-idempotencia.sh</span></div>
        <pre class="language-bash"><code class="language-bash">#!/bin/bash
# Script para verificar idempotencia del playbook

PLAYBOOK="playbooks/site.yml"
INVENTORY="inventory/staging"
VAULT_PASS="--vault-id staging@.vault_pass_scripts/vault-staging.sh"

echo "=== PRIMER RUN (aplicar configuración) ==="
ansible-playbook -i "$INVENTORY" "$PLAYBOOK" $VAULT_PASS \
--limit "staging_webservers[0]"  # Solo 1 host para el test

if [ $? -ne 0 ]; then
echo "ERROR: El primer run falló"
exit 1
fi

echo ""
echo "=== SEGUNDO RUN (verificar idempotencia) ==="
ansible-playbook -i "$INVENTORY" "$PLAYBOOK" $VAULT_PASS \
--limit "staging_webservers[0]" 2>&1 | tee /tmp/second_run.log

# Verificar que no hubo cambios en el segundo run
if grep -q "changed=[^0]" /tmp/second_run.log; then
echo ""
echo "FALLO DE IDEMPOTENCIA: El segundo run produjo cambios"
echo "Tareas no idempotentes:"
grep "changed=1\|CHANGED" /tmp/second_run.log
exit 1
else
echo ""
echo "OK: El playbook es idempotente (0 cambios en el segundo run)"
fi</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">molecule/default/converge.yml (idempotencia con Molecule)</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# molecule/default/converge.yml
# Molecule ejecuta este playbook dos veces y verifica idempotencia
- name: Converge
  hosts: all
  gather_facts: true
  become: true

  pre_tasks:
- name: Actualizar cache de apt
  ansible.builtin.apt:
    update_cache: true
    cache_valid_time: 3600
  when: ansible_os_family == "Debian"

  roles:
- role: servidor_web</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">molecule/default/molecule.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
dependency:
  name: galaxy

driver:
  name: docker

platforms:
  - name: ubuntu2204
image: geerlingguy/docker-ubuntu2204-ansible:latest
pre_build_image: true
privileged: true
volumes:
  - /sys/fs/cgroup:/sys/fs/cgroup:rw
command: /lib/systemd/systemd
tmpfs:
  - /run
  - /tmp

provisioner:
  name: ansible
  config_options:
defaults:
  stdout_callback: yaml

verifier:
  name: ansible

# Molecule ejecuta automáticamente:
# 1. molecule create     → crear el contenedor Docker
# 2. molecule converge   → ejecutar converge.yml (primera vez)
# 3. molecule idempotence → ejecutar converge.yml (segunda vez y verificar changed=0)
# 4. molecule verify     → ejecutar verify.yml (assertions sobre el estado final)
# 5. molecule destroy    → destruir el contenedor</code></pre>
      </div>
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio</div>
        <div class="lab-content">
          <p>Identificá y corregí una tarea no idempotente:</p>
          <ol>
            <li>Creá una tarea que use <code>ansible.builtin.command</code> para agregar una línea a un archivo: <code>echo "texto" >> /etc/mi-config</code></li>
            <li>Ejecutá el playbook dos veces: verás que la segunda vez también reporta <code>changed=True</code> — no es idempotente</li>
            <li>Reemplazá con <code>ansible.builtin.lineinfile</code>: esta sí es idempotente porque verifica si la línea ya existe antes de agregar</li>
            <li>Verificá que el segundo run muestra <code>changed=False</code></li>
          </ol>
        </div>
      </div>
    `
  }
];
