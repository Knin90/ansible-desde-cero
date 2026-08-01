import type { ModuleContent } from '../types';

export const nivel6Mod1: ModuleContent =   {
levelId: 6,
moduleId: 1,
title: 'Tipos de variables en Ansible',
objective: 'Entender todos los tipos y fuentes de variables disponibles en Ansible y cuándo usar cada una.',
duration: '2 horas',
objectives: [
  'Identificar las más de 20 fuentes de variables que existen en Ansible',
  'Usar vars, vars_files, vars_prompt y set_fact correctamente',
  'Aplicar filtros Jinja2 esenciales sobre variables: default(), | int, | bool, | list',
  'Comprender cuándo una variable puede no estar definida y cómo protegerse',
],
prerequisites: [
  'Haber escrito al menos un playbook con hosts y tasks (Nivel 2)',
  'Conocer la estructura básica de inventario con group_vars y host_vars (Nivel 3)',
],
steps: [
  {
    title: 'El modelo mental: dónde viven las variables',
    body: `
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Pensá en las variables de Ansible como capas de pintura. Cada capa puede cubrir a la anterior. La última capa que se aplica es el color que ves. Las variables de extra-vars son la capa más superficial — siempre ganan. Los role defaults son la capa base — muy fácil de cubrir.</p>
      </div>
      <p>Ansible tiene más de 22 fuentes distintas donde se pueden definir variables. En la práctica, las más usadas son:</p>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Las 6 fuentes más usadas en orden de uso frecuente:</strong>
          <ol>
            <li><code>group_vars/</code> y <code>host_vars/</code> — variables por entorno y por host</li>
            <li><code>vars:</code> en el play — variables locales al playbook</li>
            <li><code>vars_files:</code> — variables en archivos YAML separados</li>
            <li><code>roles/myrole/defaults/main.yml</code> — defaults de rol</li>
            <li><code>set_fact</code> — variables calculadas en tiempo de ejecución</li>
            <li><code>-e</code> / <code>--extra-vars</code> — override de emergencia desde CLI</li>
          </ol>
        </div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">fuentes-variables.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Demostración de fuentes de variables
  hosts: webservers
  vars:                              # Fuente 12: play vars
app_name: mi-app
version: "2.1.0"
debug_mode: false

  vars_files:                        # Fuente 14: vars_files
- vars/comunes.yml
- vars/secretos.yml

  vars_prompt:                       # Fuente 13: interactivo
- name: entorno_destino
  prompt: "¿A qué entorno deployás? (dev/staging/prod)"
  private: false
  default: dev

  tasks:
- name: Mostrar variables de play
  ansible.builtin.debug:
    msg: "Deploying {{ app_name }} v{{ version }} to {{ entorno_destino }}"

- name: set_fact — variable calculada
  ansible.builtin.set_fact:      # Fuente 19: set_facts
    app_dir: "/opt/{{ app_name }}/{{ version }}"

- name: Usar variable calculada
  ansible.builtin.debug:
    msg: "Directorio: {{ app_dir }}"</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>vars_prompt en CI/CD:</strong> Si corrés Ansible en modo no interactivo (CI/CD), <code>vars_prompt</code> falla a menos que proveas el valor vía <code>-e entorno_destino=prod</code>. Siempre definí un <code>default</code> seguro.</div>
      </div>
    `
  },
  {
    title: 'vars_files: cargar variables desde archivos externos',
    body: `
      <p>Separar variables en archivos es una buena práctica. Permite versionarlas por separado, tener diferentes archivos por entorno, y mantener el playbook limpio.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">text</span><span class="code-block-filename">estructura de directorios</span></div>
        <pre class="language-text"><code class="language-text">proyecto/
├── playbook.yml
└── vars/
├── comunes.yml        # Variables compartidas entre entornos
├── dev.yml            # Overrides para desarrollo
├── staging.yml        # Overrides para staging
└── prod.yml           # Overrides para producción</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">vars/comunes.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
app_name: mi-app
app_port: 8080
log_level: info
max_connections: 100
backup_retention_days: 7</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">vars/prod.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
log_level: warning       # Override: menos verboso en prod
max_connections: 1000    # Override: más conexiones en prod
backup_retention_days: 30</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbook.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Deploy con variables por entorno
  hosts: all
  vars_files:
- vars/comunes.yml
- "vars/{{ entorno | default('dev') }}.yml"  # Carga según entorno

  tasks:
- name: Mostrar configuración efectiva
  ansible.builtin.debug:
    msg: "log_level={{ log_level }}, max_conn={{ max_connections }}"</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Orden importa en vars_files:</strong> Los archivos se cargan en orden. Si <code>prod.yml</code> redefine <code>log_level</code>, ese valor pisa al de <code>comunes.yml</code>. Es el mismo principio que el CSS en cascada.</div>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Archivo no encontrado:</strong> Si el archivo especificado en <code>vars_files</code> no existe, el playbook falla. Usá el módulo <code>include_vars</code> con <code>ignore_errors</code>, o validá la existencia del archivo antes.</div>
      </div>
    `
  },
  {
    title: 'set_fact: variables calculadas y persistentes',
    body: `
      <p><code>set_fact</code> define variables que persisten durante todo el play (a diferencia de <code>vars</code> en una tarea, que solo existe dentro de esa tarea). Se ejecuta en runtime, por lo que puede usar el resultado de tareas anteriores.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">set-fact-ejemplos.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Ejemplos de set_fact
  hosts: all
  tasks:
# set_fact simple — persiste en el play completo
- name: Calcular directorio de la aplicación
  ansible.builtin.set_fact:
    app_install_dir: "/opt/{{ app_name }}/{{ app_version }}"
    app_log_dir: "/var/log/{{ app_name }}"

# set_fact basado en facts del sistema
- name: Configurar workers según hardware
  ansible.builtin.set_fact:
    optimal_workers: "{{ (ansible_processor_vcpus * 2) | int }}"
    memory_limit_mb: "{{ (ansible_memtotal_mb * 0.8) | int }}"

# set_fact condicional
- name: Determinar repositorio según arquitectura
  ansible.builtin.set_fact:
    package_arch: "{{ 'arm64' if ansible_architecture == 'aarch64' else 'amd64' }}"

# set_fact persistente entre hosts (cacheable)
- name: Marcar host como configurado
  ansible.builtin.set_fact:
    host_configured: true
    config_timestamp: "{{ ansible_date_time.iso8601 }}"
    cacheable: true  # Persiste en fact cache entre ejecuciones

- name: Verificar el resultado
  ansible.builtin.debug:
    msg:
      - "Directorio: {{ app_install_dir }}"
      - "Workers: {{ optimal_workers }}"
      - "Arch: {{ package_arch }}"</code></pre>
      </div>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>cacheable: true en set_fact:</strong> Cuando usás <code>cacheable: true</code>, la variable se guarda en el fact cache (si está configurado). Esto permite que un playbook que configura algo deje una "huella" que el próximo playbook puede leer sin reconectar al host.</div>
      </div>
    `
  },
  {
    title: 'Filtros Jinja2 esenciales para variables',
    body: `
      <p>Los filtros transforman el valor de una variable. Se aplican con el operador <code>|</code>. Son cruciales para convertir tipos, proporcionar valores por defecto y manipular datos.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">filtros-esenciales.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Filtros Jinja2 esenciales
  hosts: all
  vars:
puerto_str: "8080"
habilitado_str: "true"
lista_hosts: "web1,web2,web3"
valor_nulo: null

  tasks:
# default() — valor por defecto si la variable es undefined o falsy
- name: Puerto con fallback
  ansible.builtin.debug:
    msg: "Puerto: {{ app_port | default(8080) }}"

# default(omit) — omite el parámetro si la variable no está definida
- name: Crear usuario (timeout opcional)
  ansible.builtin.user:
    name: deploy
    password: "{{ user_password | default(omit) }}"  # No setea password si no está definido

# Conversión de tipos
- name: Conversión explícita de tipos
  ansible.builtin.debug:
    msg:
      - "Como int: {{ puerto_str | int }}"           # "8080" → 8080
      - "Como bool: {{ habilitado_str | bool }}"     # "true" → True
      - "Como float: {{ '3.14' | float }}"           # "3.14" → 3.14
      - "Como string: {{ 8080 | string }}"           # 8080 → "8080"

# Manipulación de listas y strings
- name: Convertir string CSV a lista
  ansible.builtin.debug:
    msg: "Hosts: {{ lista_hosts | split(',') }}"     # → ['web1', 'web2', 'web3']

- name: Unir lista a string
  ansible.builtin.debug:
    msg: "{{ ['web1', 'web2'] | join(', ') }}"       # → "web1, web2"

# Filtros de tests
- name: Verificar si variable está definida
  ansible.builtin.debug:
    msg: "Valor presente"
  when: valor_nulo is defined and valor_nulo is not none

# upper, lower, capitalize
- name: Transformaciones de texto
  ansible.builtin.debug:
    msg:
      - "Mayúsculas: {{ app_name | upper }}"
      - "Minúsculas: {{ app_name | lower }}"
      - "Capitalizado: {{ app_name | capitalize }}"</code></pre>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Filtros más usados en producción:</strong>
          <ul>
            <li><code>| default(valor)</code> — protección contra variables indefinidas</li>
            <li><code>| default(omit)</code> — omite el parámetro del módulo completamente</li>
            <li><code>| int</code> — conversión segura a entero</li>
            <li><code>| bool</code> — convierte "yes", "true", "1", True</li>
            <li><code>| list</code> — asegura que la variable sea una lista</li>
            <li><code>| length</code> — cantidad de elementos</li>
            <li><code>| selectattr('estado', '==', 'activo')</code> — filtrar lista de dicts</li>
          </ul>
        </div>
      </div>
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio</div>
        <div class="lab-content">
          <p>Ejecutá este comando ad-hoc para explorar filtros en tu inventario:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">terminal</span></div>
            <pre class="language-bash"><code class="language-bash"># Probar filtros desde la línea de comandos
ansible localhost -m debug -a "msg={{ '8080' | int + 1 }}"
ansible localhost -m debug -a "msg={{ ['a','b','c'] | join('-') }}"
ansible localhost -m debug -a "msg={{ variable_inexistente | default('fallback') }}"</code></pre>
          </div>
        </div>
      </div>
    `
  }
],
quiz: [
  {
    question: '¿Qué hace el filtro `| default(omit)` en el parámetro de un módulo?',
    options: [
      'Establece el valor en null si la variable no está definida',
      'Omite completamente el parámetro del módulo si la variable no está definida',
      'Genera un error si la variable no está definida',
      'Devuelve una cadena vacía si la variable no está definida',
    ],
    correctIndex: 1,
    explanation: '`| default(omit)` es especial: le dice a Ansible que omita ese parámetro del módulo por completo si la variable no está definida. Es muy útil para parámetros opcionales como `password` en el módulo `user`.',
  },
  {
    question: '¿En qué se diferencia `set_fact` con `cacheable: true` de un `set_fact` normal?',
    options: [
      'No hay diferencia funcional, es solo documentación',
      'La variable persiste en el fact cache y puede leerse en la próxima ejecución del playbook',
      'La variable se comparte con todos los hosts del inventario inmediatamente',
      'La variable deja de ser sobreescribible por otras tareas del mismo play',
    ],
    correctIndex: 1,
    explanation: 'Con `cacheable: true`, el fact se guarda en el backend de fact cache (jsonfile, Redis, etc.). En la próxima ejecución, si `gathering = smart`, Ansible usa ese valor cacheado en lugar de reconectar al host para recolectarlo.',
  },
  {
    question: '¿Qué pasa si un archivo listado en `vars_files` no existe?',
    options: [
      'Ansible lo ignora y continúa con el siguiente archivo',
      'Ansible usa valores por defecto para todas las variables del archivo',
      'El playbook falla con un error de archivo no encontrado',
      'Ansible busca el archivo en el directorio home del usuario',
    ],
    correctIndex: 2,
    explanation: 'Si un archivo de `vars_files` no existe, Ansible falla inmediatamente con un error. Para carga condicional de archivos, usá el módulo `ansible.builtin.include_vars` dentro de una tarea con `ignore_errors: true` o verificá la existencia del archivo antes.',
  },
],
troubleshooting: [
  {
    error: 'VARIABLE IS NOT DEFINED — La variable X no tiene valor',
    cause: 'La variable se referencia en el playbook pero no está definida en ninguna fuente, o está definida en un scope que no alcanza a la tarea actual.',
    fix: 'Usá `| default(valor)` como protección. Para depurar, ejecutá `ansible-playbook -e "variable=test" playbook.yml` o agregá una tarea `ansible.builtin.debug: var: hostvars[inventory_hostname]` para ver todas las variables disponibles en ese host.',
  },
  {
    error: 'TypeError: unsupported operand type(s) for +: int and str',
    cause: 'Intentás hacer aritmética con una variable que es string en lugar de int. Ocurre típicamente cuando la variable viene de inventario YAML o vars_files como string.',
    fix: 'Aplicá el filtro `| int` antes de la operación aritmética: `{{ (workers | int) + 2 }}`. También verificá que el YAML no tenga el número entre comillas.',
  },
  {
    error: 'vars_prompt no pregunta al usuario en modo no interactivo',
    cause: 'En entornos CI/CD o cuando se ejecuta con `--extra-vars`, `vars_prompt` no muestra el prompt interactivo.',
    fix: 'Siempre definí `default:` en cada `vars_prompt`. Para CI/CD, pasá los valores via `-e variable=valor` en la línea de comandos del pipeline.',
  },
],
  };
