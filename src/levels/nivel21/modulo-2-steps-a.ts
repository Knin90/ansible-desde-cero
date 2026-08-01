import type { StepContent } from '../types';

export const nivel21Mod2StepsA: StepContent[] = [
  {
    title: 'site.yml como orquestador: import_playbook',
    body: `
      <p>El playbook <code>site.yml</code> no debería contener lógica de configuración directamente. Su rol es ser el orquestador: importar los playbooks específicos en el orden correcto. Esto permite ejecutar cada playbook por separado cuando sea necesario, sin duplicar código.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbooks/site.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# site.yml — Playbook maestro
# Importa los playbooks específicos en el orden correcto
# Ejecutar todo: ansible-playbook playbooks/site.yml
# Ejecutar solo webservers: ansible-playbook playbooks/webservers.yml

# 1. Configuración base para TODOS los hosts
- import_playbook: common.yml

# 2. Hardening de seguridad (todos los hosts)
- import_playbook: hardening.yml

# 3. Configurar servidores web (con rolling update)
- import_playbook: webservers.yml

# 4. Configurar bases de datos
- import_playbook: databases.yml

# 5. Configurar monitoring
- import_playbook: monitoring.yml</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbooks/common.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Configuración base para todos los hosts
  hosts: all
  gather_facts: true
  become: true

  pre_tasks:
- name: Verificar conectividad antes de empezar
  ansible.builtin.ping:
  tags: always   # 'always' se ejecuta incluso con --tags otro-tag

- name: Mostrar información del host
  ansible.builtin.debug:
    msg: "Configurando {{ inventory_hostname }} ({{ ansible_distribution }} {{ ansible_distribution_version }})"
  tags: always

  roles:
- role: common
  tags: [base, common]

  post_tasks:
- name: Verificar que todos los servicios base están activos
  ansible.builtin.service:
    name: "{{ item }}"
    state: started
    enabled: true
  loop: "{{ base_services }}"  # Definido en group_vars/all/vars.yml
  tags: [base, verify]</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>import_playbook vs include_playbook:</strong> Usá siempre <code>import_playbook</code> (estático) en lugar de <code>include_playbook</code> (dinámico) para el orquestador. Con import, las dependencias se resuelven en tiempo de parsing, los tags son transitivos, y los errores se detectan antes de ejecutar. include_playbook tiene su uso en importación condicional, pero es la excepción.</div>
      </div>
    `
  }
];
