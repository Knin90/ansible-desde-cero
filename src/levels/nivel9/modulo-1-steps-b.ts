import type { StepContent } from '../types';

export const nivel9Mod1StepsB: StepContent[] = [
  {
    title: 'Concatenación y operaciones de strings',
    body: `
      <p>Jinja2 ofrece operadores aritméticos, de comparación y de string nativos. Combinados con filtros (próximo módulo), permiten manipulaciones poderosas.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">operaciones-strings.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Operaciones en Jinja2
  hosts: all
  vars:
base_dir: "/opt"
app_name: "mi-app"
version: "2.3.1"
puerto_base: 8000
instancia: 3

  tasks:
# Concatenación con ~  (operador tilde — convierte a string automáticamente)
- name: Ruta completa con tilde
  ansible.builtin.debug:
    msg: "{{ base_dir ~ '/' ~ app_name ~ '-' ~ version }}"
  # Output: /opt/mi-app-2.3.1

# Concatenación con +  (sólo strings — no convierte tipos)
- name: Directorio de la app
  ansible.builtin.debug:
    msg: "{{ base_dir + '/' + app_name }}"

# Aritmética directa en expresiones
- name: Puerto de la instancia
  ansible.builtin.debug:
    msg: "Puerto: {{ puerto_base + instancia }}"
  # Output: Puerto: 8003

# Repetición de string
- name: Separador visual
  ansible.builtin.debug:
    msg: "{{ '=' * 40 }}"

# Comparaciones (retornan True/False)
- name: ¿Es producción?
  vars:
    es_prod: "{{ entorno == 'prod' }}"
  ansible.builtin.debug:
    msg: "Producción: {{ es_prod }}"

# Uso práctico: construir nombre de servicio dinámico
- name: Habilitar servicio de la instancia
  ansible.builtin.systemd:
    name: "{{ app_name }}-{{ instancia }}"
    state: started
    enabled: true</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Preferí el operador ~:</strong> es el más seguro para concatenar porque convierte automáticamente números e items a string, mientras que <code>+</code> falla si mezclas tipos.</div>
      </div>
    `
  },
  {
    title: 'Jinja2 en tareas vs. en archivos .j2 — la diferencia clave',
    body: `
      <p>Este es uno de los puntos de confusión más comunes en Ansible. Jinja2 funciona en <strong>dos contextos distintos</strong> con capacidades diferentes:</p>
      <div class="highlight-box">
        <p><strong>Contexto 1 — Parámetros de tareas en el playbook:</strong> sólo <code>{{ }}</code> funciona. Las etiquetas de bloque <code>{% %}</code> y los comentarios <code>{# #}</code> NO están disponibles aquí.</p>
        <p><strong>Contexto 2 — Archivos de plantilla .j2:</strong> los tres delimitadores funcionan, junto con bucles, condicionales completos y macros.</p>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbook-con-template.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Diferencia tarea vs. template
  hosts: webservers
  vars:
app_port: 8080
workers: 4
dominios:
  - "app.ejemplo.com"
  - "api.ejemplo.com"

  tasks:
# ✅ CORRECTO: {{ }} en parámetros de tarea
- name: Mensaje de debug con variable
  ansible.builtin.debug:
    msg: "Puerto: {{ app_port }}"

# ❌ INCORRECTO: {% %} en parámetros NO funciona
# - name: Intento de loop en parámetro
#   ansible.builtin.debug:
#     msg: "{% for d in dominios %}{{ d }}{% endfor %}"
#   # → Ansible rechaza esto con un error de sintaxis YAML

# ✅ CORRECTO: usar loop nativo de Ansible en lugar de {% for %}
- name: Listar dominios (forma correcta)
  ansible.builtin.debug:
    msg: "Dominio: {{ item }}"
  loop: "{{ dominios }}"

# ✅ Para lógica compleja, usar template .j2
- name: Generar configuración compleja
  ansible.builtin.template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
    owner: root
    group: root
    mode: '0644'</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">jinja2</span><span class="code-block-filename">templates/nginx.conf.j2</span></div>
        <pre class="language-jinja2"><code class="language-jinja2">{# Generado por Ansible — no editar manualmente #}
worker_processes {{ workers }};

events {
worker_connections 1024;
}

http {
{% for dominio in dominios %}
server {
    listen {{ app_port }};
    server_name {{ dominio }};

    location / {
        proxy_pass http://localhost:{{ app_port }};
    }
}
{% endfor %}
}</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Regla práctica:</strong> si necesitás un <code>for</code> o un <code>if</code> complejo, usá un archivo <code>.j2</code>. Si sólo necesitás insertar un valor, usá <code>{{ variable }}</code> directamente en el parámetro de la tarea.</div>
      </div>
    `
  },
  {
    title: 'Lab: playbook con expresiones Jinja2',
    body: `
      <div class="lab-box">
        <div class="lab-box-header">🧪 Laboratorio — Expresiones Jinja2 en acción</div>
        <div class="lab-section">
          <div class="lab-section-title">Objetivo</div>
          <p style="font-size:0.9rem;color:var(--color-text-muted);line-height:1.65">Escribir un playbook que recopile y muestre información del servidor usando expresiones Jinja2 de distintos tipos: acceso a dicts, ternarios, concatenación y vars mágicas.</p>
        </div>
        <div class="lab-section">
          <div class="lab-section-title">Pasos</div>
          <ol>
            <li>Creá <code>lab-jinja2.yml</code> con el contenido siguiente</li>
            <li>Ejecutá con <code>ansible-playbook lab-jinja2.yml -i localhost,</code></li>
            <li>Observá cada output y verificá que las expresiones se resuelven correctamente</li>
          </ol>
        </div>
        <div class="lab-section">
          <div class="lab-section-title">Playbook de práctica</div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">lab-jinja2.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: "Lab: Expresiones Jinja2"
  hosts: localhost
  connection: local
  gather_facts: true
  vars:
config:
  entorno: "staging"
  max_conexiones: 100
  bases_de_datos:
    - nombre: "users_db"
      puerto: 5432
    - nombre: "logs_db"
      puerto: 5433

  tasks:
- name: "1. Acceso a dict anidado"
  ansible.builtin.debug:
    msg: "Entorno: {{ config.entorno }} | Max conn: {{ config.max_conexiones }}"

- name: "2. Acceso a lista por índice"
  ansible.builtin.debug:
    msg: >-
      DB principal: {{ config.bases_de_datos[0].nombre }}
      en puerto {{ config.bases_de_datos[0].puerto }}

- name: "3. Ternario según entorno"
  ansible.builtin.debug:
    msg: >-
      Modo: {{ 'PRODUCCIÓN (alta disponibilidad)'
               if config.entorno == 'prod'
               else 'NO PRODUCTIVO (sin HA)' }}

- name: "4. Concatenación con tilde"
  ansible.builtin.debug:
    msg: "Servidor: {{ inventory_hostname ~ ' (' ~ ansible_os_family ~ ')' }}"

- name: "5. Variables mágicas"
  ansible.builtin.debug:
    msg:
      - "Hostname en inventario: {{ inventory_hostname }}"
      - "Arquitectura: {{ ansible_architecture }}"
      - "CPUs disponibles: {{ ansible_processor_vcpus }}"
      - "RAM total: {{ (ansible_memtotal_mb / 1024) | round(1) }} GB"</code></pre>
          </div>
        </div>
        <div class="lab-section">
          <div class="lab-section-title">Resultado esperado</div>
          <div class="lab-expected">
            <div class="lab-expected-item"><span class="lab-expected-check">✓</span> Tarea 1 muestra "Entorno: staging | Max conn: 100"</div>
            <div class="lab-expected-item"><span class="lab-expected-check">✓</span> Tarea 2 muestra "DB principal: users_db en puerto 5432"</div>
            <div class="lab-expected-item"><span class="lab-expected-check">✓</span> Tarea 3 muestra el modo "NO PRODUCTIVO"</div>
            <div class="lab-expected-item"><span class="lab-expected-check">✓</span> Tarea 5 muestra datos reales de tu sistema</div>
          </div>
        </div>
      </div>
    `
  }
];
