import type { StepContent } from '../types';

export const nivel9Mod2StepsB: StepContent[] = [
  {
    title: 'Filtros de conversión de tipos',
    body: `
      <p>Ansible recibe variables de múltiples fuentes (inventario, facts, CLI) como strings. Los filtros de conversión garantizan que los datos tengan el tipo correcto antes de usarlos.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">filtros-tipos.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Conversión de tipos
  hosts: localhost
  vars:
puerto_string: "8080"
activo_string: "true"
precio_string: "19.99"
numero_int: 42

  tasks:
- name: "int — convertir a entero"
  ansible.builtin.debug:
    msg: "Puerto + 1 = {{ puerto_string | int + 1 }}"
  # 8081  (sin | int daría error o concatenaría: "80801")

- name: "float — convertir a decimal"
  ansible.builtin.debug:
    msg: "Precio con IVA: {{ (precio_string | float * 1.21) | round(2) }}"
  # 24.19

- name: "bool — convertir a booleano"
  ansible.builtin.debug:
    msg: "¿Activo?: {{ activo_string | bool }}"
  # True

- name: "string — convertir a string"
  ansible.builtin.debug:
    msg: "Número como string: '{{ numero_int | string }}'"
  # '42'

# Caso práctico: calcular puerto SSL dinámicamente
- name: Puerto HTTPS basado en HTTP
  ansible.builtin.debug:
    msg: "HTTPS port: {{ (puerto_string | int) + 363 }}"
  # 8443

# bool acepta muchos formatos de "verdadero"
- name: "Valores que bool convierte a True"
  ansible.builtin.debug:
    msg:
      - "{{ 'yes' | bool }}"   # True
      - "{{ '1' | bool }}"    # True
      - "{{ 'True' | bool }}" # True
      - "{{ 'on' | bool }}"   # True
      - "{{ 'no' | bool }}"   # False
      - "{{ '0' | bool }}"    # False</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Siempre convertí antes de operar:</strong> cuando recibís variables como <code>--extra-vars</code> o del inventario, llegan como strings. Convertí con <code>| int</code> o <code>| bool</code> antes de usarlas en comparaciones o cálculos aritméticos.</div>
      </div>
    `
  },
  {
    title: 'Filtros de diccionario',
    body: `
      <p>Los filtros de diccionario permiten convertir dicts a listas (para iterar), fusionar configuraciones y manipular estructuras clave-valor.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">filtros-dict.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Filtros de diccionario
  hosts: localhost
  vars:
config_base:
  puerto: 80
  worker_processes: 2
  debug: false
config_override:
  puerto: 8080
  max_conexiones: 1000
variables_env:
  - key: DB_HOST
    value: "localhost"
  - key: DB_PORT
    value: "5432"
  - key: APP_ENV
    value: "staging"

  tasks:
# dict2items — diccionario a lista de {key, value}
- name: "dict2items — iterar sobre un diccionario"
  ansible.builtin.debug:
    msg: "{{ item.key }} = {{ item.value }}"
  loop: "{{ config_base | dict2items }}"

# items2dict — lista de {key, value} a diccionario
- name: "items2dict — reconstruir diccionario"
  ansible.builtin.debug:
    msg: "{{ variables_env | items2dict }}"
  # {DB_HOST: "localhost", DB_PORT: "5432", APP_ENV: "staging"}

# combine — fusionar diccionarios (el segundo sobreescribe al primero)
- name: "combine — merge de configuraciones"
  ansible.builtin.debug:
    msg: "{{ config_base | combine(config_override) }}"
  # {puerto: 8080, worker_processes: 2, debug: false, max_conexiones: 1000}

# Caso práctico: generar variables de entorno para systemd
- name: Crear archivo de variables de entorno
  ansible.builtin.lineinfile:
    path: /tmp/app.env
    line: "{{ item.key }}={{ item.value }}"
    create: true
  loop: "{{ variables_env }}"</code></pre>
      </div>
    `
  },
  {
    title: 'Filtros específicos de Ansible',
    body: `
      <p>Ansible extiende Jinja2 con docenas de filtros propios para tareas comunes de infraestructura: hashing de contraseñas, codificación Base64, serialización JSON/YAML, rutas de archivos y operaciones de red.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">filtros-ansible.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Filtros específicos de Ansible
  hosts: localhost
  vars:
contraseña: "s3cr3t0"
config_dict:
  host: "db.prod.local"
  puerto: 5432
json_string: '{"nombre": "web-01", "activo": true}'
ruta_config: "/etc/nginx/sites-available/mi-app.conf"

  tasks:
# Seguridad: hash de contraseñas
- name: "password_hash — hashear contraseña para /etc/shadow"
  ansible.builtin.debug:
    msg: "{{ contraseña | password_hash('sha512') }}"
  # $6$random_salt$...hash...

# default — valor por defecto si variable no definida
- name: "default — fallback para variables opcionales"
  ansible.builtin.debug:
    msg: "Puerto: {{ puerto_opcional | default(80) }}"
  # Si puerto_opcional no está definida: "Puerto: 80"

# default(omit) — omitir el parámetro si no está definido
- name: Usuario con grupo opcional
  ansible.builtin.user:
    name: deploy
    group: "{{ grupo_deploy | default(omit) }}"
  # Si grupo_deploy no existe, el parámetro group se omite completamente

# Serialización JSON y YAML
- name: "to_json — diccionario a string JSON"
  ansible.builtin.debug:
    msg: "{{ config_dict | to_json }}"

- name: "to_yaml — diccionario a string YAML"
  ansible.builtin.debug:
    msg: "{{ config_dict | to_yaml }}"

- name: "from_json — string JSON a diccionario"
  ansible.builtin.debug:
    msg: "Nombre: {{ (json_string | from_json).nombre }}"

# Codificación Base64
- name: "b64encode / b64decode"
  ansible.builtin.debug:
    msg:
      - "encoded: {{ contraseña | b64encode }}"
      - "decoded: {{ 'czNjcjN0MA==' | b64decode }}"

# Expresiones regulares
- name: "regex_replace — reemplazar con regex"
  ansible.builtin.debug:
    msg: "{{ 'web-server-01.prod.local' | regex_replace('^(\\w+)-.*$', '\\1') }}"
  # "web"

# Rutas de archivos
- name: "basename y dirname"
  ansible.builtin.debug:
    msg:
      - "archivo: {{ ruta_config | basename }}"
      - "directorio: {{ ruta_config | dirname }}"
      - "expanduser: {{ '~/config' | expanduser }}"
  # archivo: "mi-app.conf"
  # directorio: "/etc/nginx/sites-available"</code></pre>
      </div>
      <div class="highlight-box">
        <p><strong>default(omit) es especial:</strong> a diferencia de <code>default('valor')</code>, que sustituye el valor, <code>default(omit)</code> hace que Ansible ignore completamente ese parámetro de la tarea — como si no lo hubieras escrito. Perfecto para parámetros opcionales de módulos.</p>
      </div>
    `
  }
];
