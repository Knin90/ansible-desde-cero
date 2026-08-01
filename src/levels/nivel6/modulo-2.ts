import type { ModuleContent } from '../types';

export const nivel6Mod2: ModuleContent =   {
levelId: 6,
moduleId: 2,
title: 'Variables registradas',
objective: 'Usar register para capturar el resultado de tareas y tomar decisiones basadas en ese resultado.',
duration: '1.5 horas',
objectives: [
  'Capturar el resultado de cualquier módulo con register',
  'Navegar la estructura JSON de una variable registrada',
  'Usar variables registradas en condiciones when y en tareas posteriores',
  'Iterar sobre resultados de loops registrados',
],
prerequisites: [
  'Conocer los delimitadores Jinja2 y acceso a dicts (Nivel 6, módulo 1)',
],
steps: [
  {
    title: 'Anatomía de una variable registrada',
    body: `
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Imaginá que <code>register</code> es como fotografiar el estado del sistema después de que un módulo actúa. La foto (la variable registrada) captura todo: qué cambió, qué salió por consola, si hubo error, el código de retorno. Después podés "mirar la foto" en cualquier tarea posterior.</p>
      </div>
      <p>Cuando aplicás <code>register: mi_variable</code> a una tarea, Ansible guarda el resultado completo del módulo en esa variable. La estructura varía por módulo, pero siempre hay campos comunes.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">register-basico.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Demostración de register
  hosts: all
  tasks:
- name: Obtener versión del sistema operativo
  ansible.builtin.command:
    cmd: "cat /etc/os-release"
  register: os_info           # Captura el resultado completo

- name: Inspeccionar la variable registrada
  ansible.builtin.debug:
    var: os_info              # Muestra la estructura JSON completa

- name: Acceder a campos específicos
  ansible.builtin.debug:
    msg:
      - "stdout: {{ os_info.stdout }}"
      - "líneas: {{ os_info.stdout_lines | length }}"
      - "exit code: {{ os_info.rc }}"
      - "¿cambió?: {{ os_info.changed }}"
      - "¿falló?: {{ os_info.failed }}"</code></pre>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Campos presentes en TODAS las variables registradas:</strong>
          <table class="comparison-table">
            <thead><tr><th>Campo</th><th>Tipo</th><th>Descripción</th></tr></thead>
            <tbody>
              <tr><td><code>changed</code></td><td>bool</td><td>¿El módulo realizó cambios en el sistema?</td></tr>
              <tr><td><code>failed</code></td><td>bool</td><td>¿El módulo falló?</td></tr>
              <tr><td><code>skipped</code></td><td>bool</td><td>¿La tarea fue omitida por un when?</td></tr>
              <tr><td><code>msg</code></td><td>string</td><td>Mensaje descriptivo del resultado</td></tr>
              <tr><td><code>rc</code></td><td>int</td><td>Exit code (solo command/shell/raw)</td></tr>
              <tr><td><code>stdout</code></td><td>string</td><td>Salida estándar (command/shell/raw)</td></tr>
              <tr><td><code>stderr</code></td><td>string</td><td>Salida de error (command/shell/raw)</td></tr>
              <tr><td><code>stdout_lines</code></td><td>list</td><td>stdout dividido por líneas</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `
  },
  {
    title: 'Patrones de uso: condicionales y flujo de control',
    body: `
      <p>El uso más poderoso de <code>register</code> es tomar decisiones en tareas posteriores basándose en el resultado de tareas anteriores.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">register-condicionales.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Patrones de uso de register
  hosts: all
  tasks:
# Patrón 1: verificar si algo existe antes de actuar
- name: Verificar si el servicio nginx está activo
  ansible.builtin.command: systemctl is-active nginx
  register: nginx_status
  ignore_errors: true           # No falla el play si nginx no está activo
  changed_when: false           # Solo consulta, no cambia nada

- name: Instalar nginx si no está activo
  ansible.builtin.package:
    name: nginx
    state: present
  when: nginx_status.rc != 0   # rc=0 significa activo, rc=3 significa inactivo

# Patrón 2: usar la salida de un comando en la configuración
- name: Obtener la versión de Java instalada
  ansible.builtin.command: java -version
  register: java_version
  ignore_errors: true
  changed_when: false

- name: Instalar Java si no está disponible
  ansible.builtin.package:
    name: openjdk-17-jdk
    state: present
  when: java_version.rc != 0 or java_version is failed

# Patrón 3: verificar contenido de un archivo
- name: Leer archivo de configuración actual
  ansible.builtin.slurp:
    src: /etc/app/config.yml
  register: config_actual
  ignore_errors: true

- name: Configurar solo si el archivo existe y tiene el key correcto
  ansible.builtin.template:
    src: config.yml.j2
    dest: /etc/app/config.yml
  when:
    - config_actual is succeeded
    - "'version' not in (config_actual.content | b64decode)"</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>ignore_errors vs failed_when:</strong> <code>ignore_errors: true</code> hace que Ansible continúe incluso si la tarea falla, y marca <code>failed: true</code> en la variable registrada. <code>failed_when: false</code> hace que Ansible nunca considere la tarea como fallida. Usá el primero cuando el fallo es esperado y querés manejarlo manualmente.</div>
      </div>
    `
  },
  {
    title: 'Variables registradas con loop',
    body: `
      <p>Cuando una tarea con <code>register</code> usa <code>loop</code>, la variable registrada tiene una estructura diferente: contiene el campo <code>results</code>, que es una lista con el resultado de cada iteración.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">register-con-loop.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Register con loop
  hosts: all
  tasks:
- name: Verificar estado de múltiples servicios
  ansible.builtin.command: "systemctl is-active {{ item }}"
  register: servicios_status
  ignore_errors: true
  changed_when: false
  loop:
    - nginx
    - postgresql
    - redis

# La variable servicios_status.results es una lista
# Cada elemento tiene: item, rc, stdout, failed, etc.
- name: Mostrar estado de cada servicio
  ansible.builtin.debug:
    msg: "{{ item.item }}: {{ 'activo' if item.rc == 0 else 'inactivo' }}"
  loop: "{{ servicios_status.results }}"

# Filtrar solo los servicios que fallaron
- name: Listar servicios inactivos
  ansible.builtin.debug:
    msg: "Servicios inactivos: {{ servicios_status.results | selectattr('rc', '!=', 0) | map(attribute='item') | list }}"

# Patrón: instalar solo los paquetes que faltan
- name: Verificar paquetes instalados
  ansible.builtin.command: "rpm -q {{ item }}"
  register: paquetes_check
  ignore_errors: true
  changed_when: false
  loop: [nginx, git, curl, vim]

- name: Instalar paquetes faltantes
  ansible.builtin.package:
    name: "{{ item.item }}"
    state: present
  loop: "{{ paquetes_check.results }}"
  when: item.rc != 0</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Estructura de results con loop:</strong> El campo <code>item</code> dentro de cada elemento de <code>results</code> contiene el valor del loop en esa iteración. No confundas <code>item.item</code> (el valor del loop) con <code>item.rc</code> (el código de retorno de esa iteración).</div>
      </div>
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio</div>
        <div class="lab-content">
          <p>Explorá la estructura completa de una variable registrada con loop:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">lab-register.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">- name: Lab — inspeccionar register con loop
  hosts: localhost
  tasks:
- name: Listar directorios del sistema
  ansible.builtin.stat:
    path: "{{ item }}"
  register: dirs_stat
  loop: ["/tmp", "/opt", "/nonexistent"]

- name: Ver estructura completa
  ansible.builtin.debug:
    var: dirs_stat

- name: Solo los que existen
  ansible.builtin.debug:
    msg: "{{ item.item }} existe"
  loop: "{{ dirs_stat.results }}"
  when: item.stat.exists</code></pre>
          </div>
        </div>
      </div>
    `
  }
],
quiz: [
  {
    question: 'Una tarea con `register: resultado` usa `loop: [a, b, c]`. ¿Cómo accedés al exit code de la segunda iteración?',
    options: [
      '`resultado.rc`',
      '`resultado.results[1].rc`',
      '`resultado[1].rc`',
      '`resultado.stdout_lines[1]`',
    ],
    correctIndex: 1,
    explanation: 'Con loop, la variable registrada tiene un campo `results` que es una lista con el resultado de cada iteración. El índice 1 corresponde a la segunda iteración. Cada elemento de la lista tiene los mismos campos que tendría sin loop: `rc`, `stdout`, `changed`, etc.',
  },
  {
    question: '¿Cuál es la diferencia entre `ignore_errors: true` y `failed_when: false`?',
    options: [
      'Son equivalentes, cualquiera sirve en los mismos casos',
      'ignore_errors continúa el play pero registra failed:true; failed_when:false hace que la tarea nunca sea considerada fallida',
      'failed_when:false solo funciona con el módulo command',
      'ignore_errors:true solo funciona con register',
    ],
    correctIndex: 1,
    explanation: 'Con `ignore_errors: true`, si la tarea falla, la variable registrada tendrá `failed: true` y Ansible continúa el play. Con `failed_when: false`, Ansible nunca considera esa tarea como fallida (ni siquiera si el exit code es 1), útil para comandos que retornan no-cero en casos válidos.',
  },
  {
    question: '¿Qué contiene el campo `item` dentro de cada elemento de `results` cuando se usa loop?',
    options: [
      'El índice numérico de la iteración',
      'El resultado del módulo para esa iteración',
      'El valor del loop en esa iteración',
      'Siempre es null cuando se usa loop',
    ],
    correctIndex: 2,
    explanation: 'El campo `item` dentro de cada resultado en la lista `results` contiene el valor del elemento del loop en esa iteración. Por eso accedés al nombre del servicio con `resultado.results[0].item` y al estado con `resultado.results[0].rc`.',
  },
],
troubleshooting: [
  {
    error: 'AttributeError: dict object has no attribute stdout',
    cause: 'Intentás acceder a `resultado.stdout` pero la tarea usó un módulo que no genera stdout (como `file`, `copy`, `package`). Solo los módulos `command`, `shell` y `raw` tienen el campo `stdout`.',
    fix: 'Usá `ansible.builtin.debug: var: resultado` para inspeccionar la estructura real de la variable registrada. Cada módulo devuelve campos diferentes. Para `copy`, usará `resultado.checksum` o `resultado.dest`.',
  },
  {
    error: 'La variable registrada está en skipped y los campos no existen',
    cause: 'La tarea fue omitida por un `when` condition. Si la tarea no se ejecutó, la variable registrada tiene `skipped: true` pero NO tiene los campos normales como `stdout` o `rc`.',
    fix: 'Antes de acceder a campos de una variable registrada potencialmente omitida, verificá: `when: mi_var is not skipped and mi_var.rc == 0`. O usá `| default("")` para evitar errores.',
  },
  {
    error: 'El mismo register en un loop solo guarda el último resultado',
    cause: 'Esto ya no ocurre en Ansible moderno, pero si usás versiones antiguas (< 2.5), el register en loop sobreescribía en cada iteración.',
    fix: 'En Ansible moderno (2.5+), register con loop acumula todos los resultados en `.results`. Si usás una versión antigua, actualizá Ansible o usá `set_fact` para acumular manualmente.',
  },
],
  };
