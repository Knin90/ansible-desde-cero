import type { StepContent } from '../types';

export const nivel9Mod1StepsA: StepContent[] = [
  {
    title: '¿Por qué Jinja2? Los tres delimitadores',
    body: `
      <p>Ansible usa <strong>Jinja2</strong> como motor de plantillas. Cada vez que escribís <code>{{ variable }}</code> en un playbook, Ansible delega esa evaluación a Jinja2 antes de ejecutar la tarea.</p>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Pensá en Jinja2 como un procesador de texto inteligente. Antes de que Ansible envíe cualquier cosa al servidor remoto, pasa por el "filtro Jinja2" que reemplaza las expresiones por sus valores reales.</p>
      </div>
      <div class="highlight-box">
        <p><strong>Los tres delimitadores de Jinja2:</strong></p>
        <ul>
          <li><code>{{ expresión }}</code> — evalúa y sustituye el resultado (el más usado)</li>
          <li><code>{% statement %}</code> — lógica de control: if, for, set, block</li>
          <li><code>{# comentario #}</code> — comentarios que no aparecen en el output</li>
        </ul>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">ejemplo-delimitadores.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Demostración de delimitadores Jinja2
  hosts: webservers
  vars:
app_name: "mi-app"
puerto: 8080
debug_mode: false

  tasks:
# {{ }} — interpolación de variables
- name: Mostrar nombre de la app
  ansible.builtin.debug:
    msg: "Aplicación: {{ app_name }} en puerto {{ puerto }}"

# {% %} — lógica de control (en templates)
# {# #} — comentarios (en templates)
- name: Copiar configuración con template
  ansible.builtin.template:
    src: app.conf.j2   # aquí se usan los tres delimitadores
    dest: /etc/app/app.conf</code></pre>
      </div>
      <div class="tech-term-box">
        <div class="tech-term-label">En términos técnicos</div>
        Jinja2 es un motor de plantillas Python. Ansible lo llama en dos momentos distintos: (1) al cargar el playbook, para resolver expresiones <code>{{ }}</code> en parámetros de tareas, y (2) al procesar archivos <code>.j2</code> con el módulo <code>template</code>, donde los tres delimitadores están disponibles.
      </div>
    `
  },
  {
    title: 'Acceso a variables: dicts, listas y vars mágicas',
    body: `
      <p>Jinja2 permite acceder a estructuras de datos complejas con una sintaxis natural. Ansible agrega además sus propias <em>variables mágicas</em> disponibles en cualquier playbook.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">acceso-variables.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Acceso a estructuras de datos
  hosts: all
  vars:
servidor:
  nombre: "web-prod-01"
  recursos:
    cpu: 4
    ram_gb: 16
  interfaces:
    - nombre: eth0
      ip: "10.0.1.10"
    - nombre: eth1
      ip: "10.0.2.10"
entornos: ["dev", "staging", "prod"]

  tasks:
# Acceso a diccionario anidado — dos sintaxis equivalentes
- name: Acceso con punto
  ansible.builtin.debug:
    msg: "CPU: {{ servidor.recursos.cpu }} cores"

- name: Acceso con corchetes (más seguro con keys dinámicas)
  ansible.builtin.debug:
    msg: "RAM: {{ servidor['recursos']['ram_gb'] }} GB"

# Acceso a lista por índice
- name: Primera interfaz
  ansible.builtin.debug:
    msg: "IP principal: {{ servidor.interfaces[0].ip }}"

# Último elemento de lista
- name: Último entorno
  ansible.builtin.debug:
    msg: "Último entorno: {{ entornos[-1] }}"

# Variables mágicas de Ansible
- name: Información del host actual
  ansible.builtin.debug:
    msg:
      - "Hostname: {{ inventory_hostname }}"
      - "Hostname corto: {{ inventory_hostname_short }}"
      - "Grupos: {{ group_names }}"
      - "Todos los hosts: {{ groups['all'] }}"
      - "IP del nodo de control: {{ hostvars[inventory_hostname]['ansible_host'] | default(inventory_hostname) }}"</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Punto vs. corchetes:</strong> la notación de punto (<code>var.key</code>) falla si la clave contiene guiones o espacios. En esos casos, usá siempre corchetes: <code>var['mi-clave']</code>. También fallará si la clave tiene el mismo nombre que un atributo de Python.</div>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Variables mágicas clave:</strong> <code>inventory_hostname</code> es el nombre del host tal como aparece en el inventario. <code>hostvars</code> es un diccionario gigante con todas las variables de todos los hosts — útil para referencias cruzadas entre hosts.</div>
      </div>
    `
  },
  {
    title: 'Expresiones ternarias y condicionales inline',
    body: `
      <p>Jinja2 permite escribir lógica condicional directamente dentro de expresiones <code>{{ }}</code>, evitando tener que crear variables auxiliares o tareas separadas.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">ternarios.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Expresiones condicionales Jinja2
  hosts: all
  vars:
entorno: "prod"
debug_habilitado: false
max_workers: 0

  tasks:
# Ternario clásico: valor_si_true if condicion else valor_si_false
- name: Nivel de log según entorno
  ansible.builtin.debug:
    msg: "Log level: {{ 'info' if entorno == 'prod' else 'debug' }}"

# Ternario con variable booleana
- name: Estado de debug
  ansible.builtin.debug:
    msg: "Debug: {{ 'ACTIVADO' if debug_habilitado else 'DESACTIVADO' }}"

# Ternario anidado (con moderación)
- name: Entorno clasificado
  ansible.builtin.debug:
    msg: >-
      {{ 'producción' if entorno == 'prod'
         else ('staging' if entorno == 'staging'
         else 'desarrollo') }}

# Uso real: elegir paquete según distro
- name: Nombre del paquete según OS
  ansible.builtin.package:
    name: "{{ 'httpd' if ansible_os_family == 'RedHat' else 'apache2' }}"
    state: present

# Fallback con 'or' para valores vacíos/falsy
- name: Workers con fallback
  ansible.builtin.debug:
    msg: "Workers: {{ max_workers or ansible_processor_vcpus }}"</code></pre>
      </div>
      <div class="highlight-box">
        <p><strong>Sintaxis del ternario Jinja2:</strong> <code>{{ valor_true if condicion else valor_false }}</code></p>
        <p>Es diferente al ternario de Python clásico pero con la misma lógica. El <code>else</code> es obligatorio en Jinja2 si la expresión está dentro de <code>{{ }}</code>.</p>
      </div>
    `
  }
];
