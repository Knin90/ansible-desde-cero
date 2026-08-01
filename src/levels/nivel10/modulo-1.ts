import type { ModuleContent } from '../types';

export const nivel10Mod1: ModuleContent =   {
levelId: 10,
moduleId: 1,
title: 'Condicionales con when',
objective: 'Dominar la directiva when para ejecutar tareas condicionalmente, usando operadores de comparación, tests de tipo, condiciones múltiples y detección de sistema operativo.',
duration: '2 horas',
objectives: [
  'Escribir condiciones simples y múltiples con when usando AND implícito y OR explícito',
  'Usar operadores de comparación Jinja2: ==, !=, >, <, in, is defined, is not defined',
  'Detectar el sistema operativo con ansible_os_family y ansible_distribution',
  'Usar when en bloques para aplicar una condición a múltiples tareas',
  'Combinar when con register para decisiones basadas en resultados previos',
],
prerequisites: [
  'Conocer variables de Ansible (Nivel 4)',
  'Entender facts de Ansible: ansible_os_family, ansible_distribution (Nivel 3)',
  'Haber usado register para capturar resultados de tareas',
],
steps: [
  {
    title: '¿Qué es when y cómo funciona?',
    body: `
      <p>La directiva <code>when</code> acepta una expresión Jinja2 que se evalúa como booleano. Si es <code>true</code>, la tarea se ejecuta. Si es <code>false</code>, se omite con estado <code>skipped</code>.</p>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Imaginá que <code>when</code> es el guardia de la puerta de una discoteca. Cada tarea llega con sus credenciales (los valores de las variables) y el guardia decide si la deja pasar o le dice "esta noche no".</p>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Diferencia clave con templates:</strong> En <code>when</code> no usás las llaves <code>{{ }}</code>. Escribís la expresión directamente porque Ansible ya sabe que es Jinja2.
          <br><br>
          Correcto: <code>when: ansible_os_family == "Debian"</code><br>
          Incorrecto: <code>when: "{{ ansible_os_family }} == 'Debian'"</code>
        </div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">when-basico.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Demostración de when básico
  hosts: all
  tasks:
# Condición simple: comparación de string
- name: Instalar nginx en sistemas Debian
  ansible.builtin.apt:
    name: nginx
    state: present
  when: ansible_os_family == "Debian"

# Condición negada con not
- name: Solo en hosts que NO son de producción
  ansible.builtin.debug:
    msg: "Modo desarrollo activo"
  when: not (entorno == "produccion")

# Verificar si una variable está definida
- name: Usar configuración extra si existe
  ansible.builtin.debug:
    msg: "Config extra: {{ config_extra }}"
  when: config_extra is defined

# Verificar que NO está definida
- name: Advertir sobre variable faltante
  ansible.builtin.debug:
    msg: "ADVERTENCIA: config_extra no configurada, usando defaults"
  when: config_extra is not defined

# Condición basada en resultado anterior
- name: Verificar si nginx corre
  ansible.builtin.command: pgrep nginx
  register: nginx_running
  changed_when: false
  ignore_errors: true

- name: Iniciar nginx si estaba parado
  ansible.builtin.service:
    name: nginx
    state: started
  when: nginx_running.rc != 0</code></pre>
      </div>
    `
  },
  {
    title: 'Operadores de comparación y tests Jinja2',
    body: `
      <p>Jinja2 ofrece una variedad de operadores y tests para escribir condiciones expresivas. Los <em>tests</em> se usan con la palabra clave <code>is</code>.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">operadores-when.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">tasks:
  # Operadores de comparación
  - name: Versión mayor a 20
ansible.builtin.debug:
  msg: "Ubuntu moderno"
when: ansible_distribution_major_version | int >= 20

  # Operador 'in' — buscar en lista o string
  - name: Solo en servidores web o app
ansible.builtin.debug:
  msg: "Es servidor de aplicación"
when: inventory_hostname in groups['webservers'] + groups['appservers']

  - name: Verificar entorno válido
ansible.builtin.debug:
  msg: "Entorno reconocido"
when: entorno in ['dev', 'staging', 'produccion']

  # Test 'is string'
  - name: Verificar que el puerto es string
ansible.builtin.debug:
  msg: "Puerto como string: {{ app_port }}"
when: app_port is string

  # Test 'is number'
  - name: Verificar que workers es número
ansible.builtin.debug:
  msg: "Workers numérico: {{ workers }}"
when: workers is number

  # Test 'is truthy' / 'is falsy'
  - name: Solo si debug_mode es truthy
ansible.builtin.debug:
  msg: "Debug activado"
when: debug_mode is truthy

  # Conversión de tipo para comparaciones numéricas
  - name: Solo si hay más de 2GB de RAM
ansible.builtin.debug:
  msg: "Servidor con suficiente RAM"
when: (ansible_memtotal_mb | int) >= 2048</code></pre>
      </div>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>Test Jinja2:</strong> Una prueba de tipo o estado aplicada con <code>is</code>. Diferente a un filtro (que transforma valores), un test devuelve true o false. Ejemplos: <code>is defined</code>, <code>is string</code>, <code>is number</code>, <code>is truthy</code>, <code>is none</code>.</div>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Convertí antes de comparar números:</strong> Las variables de Ansible a veces son strings aunque contengan números. Si vas a comparar con operadores numéricos, usá <code>| int</code> o <code>| float</code> para asegurar el tipo correcto.</div>
      </div>
    `
  },
  {
    title: 'Condiciones múltiples: AND, OR y NOT',
    body: `
      <p>Hay dos formas de combinar condiciones en Ansible. La forma con lista es AND implícito; para OR necesitás usar el operador explícito.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">condiciones-multiples.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">tasks:
  # AND implícito: lista de condiciones — TODAS deben ser verdaderas
  - name: Solo en Ubuntu 22 en producción
ansible.builtin.debug:
  msg: "Ubuntu 22 productivo"
when:
  - ansible_distribution == "Ubuntu"
  - ansible_distribution_major_version == "22"
  - entorno == "produccion"

  # OR explícito: usar 'or' en una sola línea
  - name: En sistemas Debian o RedHat
ansible.builtin.debug:
  msg: "Sistema soportado"
when: >
  ansible_os_family == "Debian" or
  ansible_os_family == "RedHat"

  # Combinación AND + OR con paréntesis
  - name: Configuración especial para prod en cloud
ansible.builtin.debug:
  msg: "Cloud productivo"
when: >
  entorno == "produccion" and
  (proveedor == "aws" or proveedor == "gcp")

  # NOT con condición compuesta
  - name: No es dev ni staging
ansible.builtin.debug:
  msg: "Entorno de producción"
when: >
  not (entorno == "dev" or entorno == "staging")

  # Mezcla de lista (AND) con OR en elementos
  - name: Ubuntu O CentOS, en produccion
ansible.builtin.debug:
  msg: "Servidor productivo soportado"
when:
  - ansible_distribution == "Ubuntu" or ansible_distribution == "CentOS"
  - entorno == "produccion"</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Lista vs. or:</strong> Cuando usás una lista en <code>when</code>, es AND implícito. Si querés OR entre dos condiciones, necesitás el operador <code>or</code> explícito. Mezclar ambos formatos sin entenderlo lleva a condiciones incorrectas.</div>
      </div>
    `
  },
  {
    title: 'when en bloques y detección de OS',
    body: `
      <p>Podés aplicar <code>when</code> a un <code>block</code> completo para evitar repetir la misma condición en cada tarea. Es la forma idiomática de manejar diferencias entre distribuciones.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">when-bloques-os.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Instalar nginx según distribución
  hosts: all
  tasks:
# Block con when: aplica a todas las tareas del bloque
- name: Instalación en Debian/Ubuntu
  block:
    - name: Agregar repositorio nginx
      ansible.builtin.apt_repository:
        repo: "deb http://nginx.org/packages/ubuntu {{ ansible_distribution_release }} nginx"
        state: present

    - name: Instalar nginx desde repositorio oficial
      ansible.builtin.apt:
        name: nginx
        update_cache: true
        state: present

    - name: Configurar logrotate para Debian
      ansible.builtin.template:
        src: nginx-logrotate-debian.j2
        dest: /etc/logrotate.d/nginx
  when: ansible_os_family == "Debian"

- name: Instalación en RedHat/CentOS/Rocky
  block:
    - name: Instalar nginx desde dnf
      ansible.builtin.dnf:
        name: nginx
        state: present

    - name: Configurar SELinux para nginx
      ansible.posix.seboolean:
        name: httpd_can_network_connect
        state: true
        persistent: true

    - name: Configurar logrotate para RedHat
      ansible.builtin.template:
        src: nginx-logrotate-redhat.j2
        dest: /etc/logrotate.d/nginx
  when: ansible_os_family == "RedHat"

# Tarea común para todos: siempre se ejecuta
- name: Habilitar e iniciar nginx
  ansible.builtin.service:
    name: nginx
    state: started
    enabled: true</code></pre>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Variables clave para detección de OS:</strong><br>
          <ul>
            <li><code>ansible_os_family</code>: familia amplia — "Debian", "RedHat", "Suse", "Darwin"</li>
            <li><code>ansible_distribution</code>: distribución específica — "Ubuntu", "CentOS", "Fedora"</li>
            <li><code>ansible_distribution_version</code>: versión completa — "22.04", "9.2"</li>
            <li><code>ansible_distribution_major_version</code>: solo el mayor — "22", "9"</li>
            <li><code>ansible_distribution_release</code>: codename — "jammy", "focal"</li>
          </ul>
        </div>
      </div>
    `
  },
  {
    title: 'Laboratorio: condicionales por entorno',
    body: `
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio</div>
        <div class="lab-content">
          <p><strong>Objetivo:</strong> Crear un playbook que configure nginx de forma diferente según el sistema operativo y el entorno (dev/produccion).</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">lab-condicionales.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Lab — condicionales por entorno y OS
  hosts: localhost
  vars:
entorno: "dev"           # Cambiá a "produccion" para probar
app_workers: 2

  tasks:
- name: Validar entorno
  ansible.builtin.assert:
    that:
      - entorno in ['dev', 'staging', 'produccion']
      - app_workers is defined
      - app_workers | int >= 1
    fail_msg: "Variables inválidas: entorno={{ entorno }}, workers={{ app_workers }}"

- name: Configurar workers según entorno
  ansible.builtin.debug:
    msg: "Workers para {{ entorno }}: {{ app_workers if entorno == 'produccion' else 1 }}"

- name: Debug solo en entorno no-productivo
  ansible.builtin.debug:
    msg: "MODO DEBUG: entorno={{ entorno }}, OS={{ ansible_os_family }}"
  when: entorno != "produccion"

- name: Info de producción — solo en prod
  ansible.builtin.debug:
    msg: "Producción en {{ ansible_os_family }} con {{ ansible_processor_vcpus }} CPUs"
  when: entorno == "produccion"</code></pre>
          </div>
        </div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'when',
    definition: 'Directiva de Ansible que acepta una expresión Jinja2 booleana. La tarea se ejecuta si la expresión evalúa a verdadero, y se omite (skipped) si evalúa a falso.',
  },
  {
    term: 'ansible_os_family',
    definition: 'Fact de Ansible que contiene la familia del sistema operativo: "Debian" para Ubuntu/Debian, "RedHat" para CentOS/RHEL/Rocky/Fedora, "Suse" para openSUSE. Útil para escribir condicionales portables.',
  },
  {
    term: 'test Jinja2',
    definition: 'Prueba booleana aplicada a un valor con la palabra clave "is". Por ejemplo: "variable is defined", "valor is string", "numero is number". Devuelve true o false sin transformar el valor.',
  },
  {
    term: 'AND implícito',
    definition: 'Cuando when recibe una lista de condiciones YAML, Ansible las une con AND: todas deben ser verdaderas para que la tarea se ejecute. Es equivalente a escribir "cond1 and cond2 and cond3" en una sola línea.',
  },
],
quiz: [
  {
    question: '¿Cuál es la sintaxis correcta para usar when con múltiples condiciones AND?',
    options: [
      'when: "cond1 AND cond2"',
      'when: [cond1, cond2] en formato lista YAML',
      'when: cond1 && cond2',
      'when_all: [cond1, cond2]',
    ],
    correctIndex: 1,
    explanation: 'En Ansible, cuando when recibe una lista YAML, todas las condiciones se unen con AND implícito. Es la forma idiomática y más legible de escribir múltiples condiciones AND. El operador && no existe en Jinja2; se usa "and".',
  },
  {
    question: '¿Cómo verificás que una variable está definida en una condición when?',
    options: [
      'when: variable != null',
      'when: variable is defined',
      'when: defined(variable)',
      'when: variable exists',
    ],
    correctIndex: 1,
    explanation: 'En Jinja2, el test "is defined" verifica que una variable existe y tiene un valor. Su negación es "is not defined". Usar "variable != null" puede lanzar un error si la variable no existe; "is defined" es seguro incluso cuando la variable no existe.',
  },
  {
    question: '¿Qué fact usás para distinguir entre Ubuntu y CentOS de forma idiomática?',
    options: [
      'ansible_system',
      'ansible_kernel',
      'ansible_os_family',
      'ansible_platform',
    ],
    correctIndex: 2,
    explanation: 'ansible_os_family agrupa distribuciones relacionadas: "Debian" cubre Ubuntu, Debian y derivados; "RedHat" cubre CentOS, RHEL, Rocky y Fedora. Esto permite escribir condiciones que funcionan en toda una familia sin enumerar cada distribución.',
  },
  {
    question: '¿Cuál es la diferencia entre aplicar when a una tarea individual y aplicarlo a un block?',
    options: [
      'No hay diferencia práctica',
      'Con block, la condición se evalúa solo una vez y aplica a todas las tareas dentro del bloque',
      'when en block solo funciona con ansible_os_family',
      'when en block no permite condiciones OR',
    ],
    correctIndex: 1,
    explanation: 'Aplicar when a un block es la forma DRY (Don\'t Repeat Yourself) de evitar repetir la misma condición en cada tarea. La condición se evalúa una vez y si es falsa, todo el bloque se omite. Esto es especialmente útil para agrupar tareas específicas de un sistema operativo.',
  },
],
troubleshooting: [
  {
    error: "The conditional check 'variable' failed. The error was: error while evaluating conditional (variable): 'variable' is undefined",
    cause: 'La variable referenciada en when no existe. Ansible evalúa la expresión y encuentra que la variable no está en el scope actual.',
    fix: 'Agregá una verificación previa: "when: variable is defined and variable == valor". Alternativamente, definí un valor por defecto en defaults/ o group_vars. Para debugging, usá "ansible-playbook playbook.yml -e variable=test".',
  },
  {
    error: 'La tarea se ejecuta aunque la condición debería ser falsa',
    cause: 'Uso incorrecto de when con llaves {{ }}. Por ejemplo: when: "{{ variable == \'valor\' }}" devuelve un string no vacío que se evalúa como truthy.',
    fix: 'Eliminá las llaves de when. Escribí directamente: when: variable == "valor". Las llaves {{ }} en when son un error común de principiantes que causa comportamiento inesperado.',
  },
  {
    error: 'Comparación numérica falla: "2 > 10" evalúa como verdadero',
    cause: 'La variable contiene un string "2" que se compara lexicográficamente con "10". En comparación de strings, "2" > "10" porque "2" > "1".',
    fix: 'Convertí el tipo antes de comparar: "when: variable | int > 10". Siempre que compares con operadores <, >, <=, >= asegurate de que ambos lados sean del mismo tipo numérico.',
  },
],
realWorldCase: 'Un equipo de SRE gestiona 400 servidores con mezcla de Ubuntu 20/22 y CentOS 7/8. Usan when con ansible_os_family y ansible_distribution_major_version para aplicar configuraciones de seguridad específicas por versión, eliminando la necesidad de mantener inventarios separados por OS.',
  };
