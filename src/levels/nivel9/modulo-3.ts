import type { ModuleContent } from '../types';

export const nivel9Mod3: ModuleContent =   {
levelId: 9,
moduleId: 3,
title: 'Tests y condicionales Jinja2',
objective: 'Usar los tests de Jinja2 para escribir condiciones robustas en Ansible: verificar si variables están definidas, distinguir tipos de datos, comparar versiones semánticas y combinar múltiples tests en condiciones complejas.',
duration: '2–3 horas',
objectives: [
  'Usar is defined, is undefined e is none para guard clauses en playbooks',
  'Aplicar tests de tipo para validar la estructura de variables antes de usarlas',
  'Distinguir entre match y search para condiciones basadas en expresiones regulares',
  'Comparar versiones de software con el test version para lógica de compatibilidad',
],
prerequisites: [
  'Haber completado el Módulo 1 de Nivel 9 (Variables y expresiones Jinja2)',
  'Haber completado el Módulo 2 de Nivel 9 (Filtros Jinja2)',
  'Saber usar el parámetro when: en tareas de Ansible',
],
steps: [
  {
    title: 'is defined / is undefined / is none — los tests más críticos',
    body: `
      <p>Los tests de definición son los más usados en Ansible. Un playbook robusto siempre verifica que las variables existen antes de usarlas.</p>
      <div class="highlight-box">
        <p><strong>La diferencia entre defined, undefined y none:</strong></p>
        <ul>
          <li><code>is defined</code> — la variable existe y tiene algún valor (incluso vacío o false)</li>
          <li><code>is undefined</code> — la variable no existe en ningún scope</li>
          <li><code>is none</code> — la variable existe pero su valor es <code>null</code> / <code>~</code> en YAML</li>
        </ul>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">tests-definicion.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Tests de definición
  hosts: localhost
  vars:
variable_definida: "tengo un valor"
variable_vacia: ""
variable_nula: ~          # ~ es null en YAML
variable_false: false
# variable_inexistente NO está definida

  tasks:
# is defined — existe con cualquier valor
- name: Tarea que sólo corre si variable_definida existe
  ansible.builtin.debug:
    msg: "Variable existe: {{ variable_definida }}"
  when: variable_definida is defined

# is undefined — para detectar variables faltantes
- name: Advertir si falta configuración crítica
  ansible.builtin.fail:
    msg: "ERROR: La variable 'db_password' es requerida pero no está definida"
  when: db_password is undefined

# is none — la variable existe pero vale null
- name: Sólo ejecutar si la variable no es null
  ansible.builtin.debug:
    msg: "Variable tiene valor real"
  when: variable_nula is not none

# Combinaciones importantes
- name: Verificar que la variable existe Y tiene valor
  ansible.builtin.debug:
    msg: "Variable útil: {{ variable_definida }}"
  when:
    - variable_definida is defined
    - variable_definida | length > 0

# variable_false es defined pero es falsy — ojo con esto
- name: Diferencia entre defined y truthy
  ansible.builtin.debug:
    msg:
      - "is defined: {{ variable_false is defined }}"   # True
      - "truthy: {{ variable_false | bool }}"            # False</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>No confundas defined con truthy:</strong> <code>when: variable is defined</code> ejecuta la tarea si la variable existe, incluso si es <code>false</code>, <code>0</code> o <code>""</code>. Si necesitás que tenga un valor "verdadero", usá <code>when: variable</code> (evaluación truthy directa).</div>
      </div>
    `
  },
  {
    title: 'Tests de tipo',
    body: `
      <p>Los tests de tipo permiten validar la estructura de los datos antes de procesarlos, evitando errores de runtime cuando las variables tienen tipos inesperados.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">tests-tipo.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Tests de tipo en Jinja2
  hosts: localhost
  vars:
mi_string: "hola"
mi_numero: 42
mi_lista: [1, 2, 3]
mi_dict: {clave: "valor"}
mi_bool: true

  tasks:
# Tests de tipo básicos
- name: Verificar tipos
  ansible.builtin.debug:
    msg:
      - "string: {{ mi_string is string }}"       # True
      - "número: {{ mi_numero is number }}"       # True
      - "iterable: {{ mi_lista is iterable }}"   # True
      - "mapping: {{ mi_dict is mapping }}"       # True (dict es un mapping)
      - "sequence: {{ mi_lista is sequence }}"   # True (lista es una sequence)

# is iterable incluye strings (¡cuidado!)
- name: "String también es iterable — ojo"
  ansible.builtin.debug:
    msg:
      - "lista es iterable: {{ mi_lista is iterable }}"   # True
      - "string es iterable: {{ mi_string is iterable }}" # True también

# Para distinguir lista de string, usar mapping + string
- name: ¿Es realmente una lista (no string, no dict)?
  ansible.builtin.debug:
    msg: "Es lista: {{ mi_lista is sequence and mi_lista is not string and mi_lista is not mapping }}"

# Uso práctico: procesar variable que puede ser string o lista
- name: Normalizar variable que puede ser string o lista
  vars:
    servidores_input: "web-01"    # puede ser un string o una lista
  ansible.builtin.set_fact:
    servidores_lista: >-
      {{ [servidores_input] if servidores_input is string
         else servidores_input }}

- name: Usar la lista normalizada
  ansible.builtin.debug:
    msg: "Servidor: {{ item }}"
  loop: "{{ servidores_lista }}"</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Patrón normalizar string/lista:</strong> un patrón muy común es aceptar que una variable puede ser un string o una lista. El ternario <code>[var] if var is string else var</code> convierte ambos formatos a lista, permitiendo usar <code>loop:</code> siempre.</div>
      </div>
    `
  },
  {
    title: 'match vs. search — tests basados en regex',
    body: `
      <p>Jinja2 provee dos tests para comparar strings contra expresiones regulares. La diferencia entre ellos es sutil pero importante.</p>
      <div class="highlight-box">
        <p><strong>match</strong> — intenta hacer match desde el <em>inicio</em> del string (como <code>re.match</code> en Python)</p>
        <p><strong>search</strong> — busca el patrón en <em>cualquier parte</em> del string (como <code>re.search</code> en Python)</p>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">tests-regex.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Tests match y search
  hosts: localhost
  vars:
hostname_web: "web-prod-01.empresa.com"
hostname_db: "db-staging-02.empresa.com"
hostname_api: "api-prod-01.empresa.com"
version_string: "nginx/1.20.2"

  tasks:
# match — desde el inicio del string
- name: "match busca desde el inicio"
  ansible.builtin.debug:
    msg:
      - "¿Empieza con 'web'? {{ hostname_web is match('web.*') }}"    # True
      - "¿Empieza con 'prod'? {{ hostname_web is match('prod.*') }}"  # False (no empieza así)
      - "¿Empieza con 'web'? {{ hostname_db is match('web.*') }}"     # False

# search — en cualquier parte
- name: "search busca en cualquier posición"
  ansible.builtin.debug:
    msg:
      - "¿Contiene 'prod'? {{ hostname_web is search('prod') }}"   # True
      - "¿Contiene 'prod'? {{ hostname_db is search('prod') }}"    # False (es staging)
      - "¿Contiene 'staging'? {{ hostname_db is search('staging') }}" # True

# Uso práctico: aplicar tarea sólo en hosts de producción
- name: Configuración especial sólo en prod
  ansible.builtin.debug:
    msg: "Configurando servidor de producción: {{ inventory_hostname }}"
  when: inventory_hostname is search('prod')

# Extraer versión con regex
- name: ¿Es nginx mayor a versión 1.x?
  ansible.builtin.debug:
    msg: "Es nginx: {{ version_string is match('nginx/.*') }}"

# search con grupos de captura — usando regex_search filter
- name: Extraer número de versión
  ansible.builtin.debug:
    msg: "Versión: {{ version_string | regex_search('(\\d+\\.\\d+\\.\\d+)', '\\1') | first }}"
  # "1.20.2"</code></pre>
      </div>
    `
  },
  {
    title: 'Test version — comparar versiones semánticas',
    body: `
      <p>El test <code>version</code> (o <code>version_compare</code>) permite comparar versiones de software de forma inteligente, entendiendo la semántica de versiones como <code>1.9 < 1.10</code> (que un string simple no haría correctamente).</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">test-version.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Comparación de versiones semánticas
  hosts: all
  tasks:
# Recopilar versión de Python instalado
- name: Obtener versión de Python
  ansible.builtin.command: python3 --version
  register: python_version_output
  changed_when: false

- name: Extraer número de versión
  ansible.builtin.set_fact:
    python_version: "{{ python_version_output.stdout | regex_search('(\\d+\\.\\d+\\.\\d+)') }}"

# Comparar con operadores: ==, !=, <, >, <=, >=
- name: Verificar que Python >= 3.9
  ansible.builtin.assert:
    that:
      - python_version is version('3.9', '>=')
    fail_msg: "Se requiere Python 3.9 o superior. Instalado: {{ python_version }}"
    success_msg: "Python {{ python_version }} cumple el requisito (>= 3.9)"

# Ejemplo con Ansible version
- name: Características disponibles según versión de Ansible
  ansible.builtin.debug:
    msg: "Módulo ansible.builtin.deb822_repository disponible"
  when: ansible_version.full is version('2.15', '>=')

# Comparación de versiones con semver estricto
- name: Verificar versión de nginx (si está instalado)
  ansible.builtin.debug:
    msg: "Nginx {{ item }} instalado, requiere actualización"
  when: item is version('1.20', '<')
  loop:
    - "1.18.0"   # ← se ejecuta (< 1.20)
    - "1.20.2"   # ← NO se ejecuta (>= 1.20)
    - "1.24.0"   # ← NO se ejecuta (>= 1.20)

# version con 'strict=true' para semver estricto
- name: Comparación semver estricta
  ansible.builtin.debug:
    msg: "Usando comparación semver estricta"
  when: "'2.1.0' is version('2.0.9', '>', strict=True)"</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Por qué version y no comparación de strings:</strong> comparar "1.9" y "1.10" como strings con &gt; daría "1.9" > "1.10" porque "9" > "1" lexicográficamente. El test <code>version</code> entiende la semántica numérica: 1.10 > 1.9.</div>
      </div>
    `
  },
  {
    title: 'Combinando tests con when: — condiciones complejas',
    body: `
      <p>En Ansible, el parámetro <code>when:</code> acepta una expresión Jinja2 o una lista de expresiones (todas deben ser verdaderas). Combinando tests y filtros, podés construir condiciones precisas y legibles.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">when-combinado.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Condiciones complejas con when
  hosts: all
  vars:
entorno: "prod"
habilitar_backup: true
version_minima: "8.0"

  tasks:
# Lista en when: = AND implícito (todas deben ser true)
- name: Backup sólo en prod con backup habilitado
  ansible.builtin.debug:
    msg: "Ejecutando backup..."
  when:
    - entorno == "prod"
    - habilitar_backup | bool
    - ansible_os_family == "Debian"

# OR explícito — usar 'or' en la expresión
- name: Instalar en Debian o RedHat
  ansible.builtin.debug:
    msg: "Instalando en {{ ansible_os_family }}"
  when: ansible_os_family == "Debian" or ansible_os_family == "RedHat"

# Combinación de AND y OR con paréntesis
- name: Configuración especial
  ansible.builtin.debug:
    msg: "Configuración especial aplicada"
  when: >
    (entorno == "prod" or entorno == "staging") and
    ansible_memtotal_mb >= 4096 and
    habilitar_backup | bool

# Condición con test + filtro
- name: Sólo en hosts web con versión adecuada
  ansible.builtin.debug:
    msg: "Aplicando configuración web"
  when:
    - inventory_hostname is search('web')
    - mysql_version is defined
    - mysql_version is version(version_minima, '>=')

# Negación con 'not' o 'is not'
- name: Sólo si NO es producción
  ansible.builtin.debug:
    msg: "Ejecutando en entorno no productivo"
  when: entorno is not match('prod.*')

# Condición compleja en un registro previo
- name: Verificar si servicio está corriendo
  ansible.builtin.command: systemctl is-active nginx
  register: nginx_estado
  failed_when: false
  changed_when: false

- name: Reiniciar nginx si no está activo
  ansible.builtin.systemd:
    name: nginx
    state: started
  when: nginx_estado.stdout != "active"</code></pre>
      </div>
      <div class="highlight-box">
        <p><strong>YAML list en when: = AND:</strong> cuando <code>when:</code> recibe una lista YAML, Ansible evalúa cada condición por separado y aplica AND entre todas. Esto es más legible que escribir <code>condicion1 and condicion2 and condicion3</code> en una sola línea.</p>
      </div>
    `
  },
],
quiz: [
  {
    question: '¿Cuál es la diferencia entre los tests `match` y `search` en Jinja2?',
    options: [
      'No hay diferencia, ambos buscan el patrón en el string completo',
      'match requiere que el patrón coincida desde el inicio del string; search busca el patrón en cualquier posición',
      'match usa expresiones regulares; search usa búsqueda de substring simple',
      'match es más rápido que search',
    ],
    correctIndex: 1,
    explanation: 'match intenta hacer coincidir el patrón desde el inicio del string (como re.match en Python). Por ejemplo, "web-01" is match("web") es True, pero "server-web-01" is match("web") es False. search en cambio busca el patrón en cualquier posición, por lo que "server-web-01" is search("web") sería True. Elegir entre uno y otro depende de si necesitás que el patrón empiece al inicio o pueda estar en cualquier lugar.',
  },
  {
    question: '¿Por qué es necesario usar el test `version` en lugar de comparar strings con > o < para comparar versiones como "1.9" y "1.10"?',
    options: [
      'No es necesario, la comparación de strings funciona igual para versiones',
      'Porque version es más rápido que la comparación de strings',
      'Porque la comparación de strings es lexicográfica: "1.9" > "1.10" (ya que "9" > "1"), pero version entiende que 1.10 > 1.9 numéricamente',
      'Porque version soporta más formatos de versión',
    ],
    correctIndex: 2,
    explanation: 'En comparación lexicográfica (de strings), "1.9" > "1.10" porque se compara carácter a carácter y "9" tiene mayor valor que "1". Esto es incorrecto para versiones donde 1.10 es mayor que 1.9. El test version en Ansible/Jinja2 hace una comparación numérica semántica, entendiendo que 1.10 = (1, 10, 0) que es mayor que 1.9 = (1, 9, 0).',
  },
  {
    question: 'En un `when:` con lista YAML (múltiples condiciones en líneas separadas), ¿qué operador lógico se aplica entre las condiciones?',
    options: [
      'OR — al menos una debe ser verdadera',
      'XOR — exactamente una debe ser verdadera',
      'AND — todas deben ser verdaderas',
      'Depende de la indentación',
    ],
    correctIndex: 2,
    explanation: 'Cuando when: recibe una lista YAML (cada condición en su propia línea con guión), Ansible aplica AND implícito entre todas las condiciones — todas deben ser verdaderas para que la tarea se ejecute. Es equivalente a escribir "condicion1 and condicion2 and condicion3" en una sola línea. Para OR, necesitás escribir explícitamente "condicion1 or condicion2" dentro de una sola expresión de la lista.',
  },
],
realWorldCase: 'Un equipo de DevOps usa tests de versión para gestionar upgrades de PostgreSQL en un clúster heterogéneo: el playbook detecta la versión instalada en cada nodo, aplica steps de migración diferentes según si es 13.x, 14.x o 15.x, y salta automáticamente los pasos ya aplicados usando combinaciones de is defined e is version.',
troubleshooting: [
  {
    error: "AnsibleUndefinedVariable: 'variable' is undefined (en una condición when:)",
    cause: 'Se está evaluando una variable en when: que no existe, y Ansible no puede resolver la condición. El parámetro when: no tiene acceso al filtro default() de la misma manera.',
    fix: "Protegé la condición con 'is defined': when: variable is defined and variable == 'valor'. O usá el filtro default antes: when: (variable | default('')) == 'valor'. En ambos casos, la evaluación falla gracefully.",
  },
  {
    error: "The conditional check 'mi_var is version(\"2.0\", \">=\")' failed",
    cause: "La variable no contiene una versión en formato string numérico puro, sino algo como 'v2.0.1' con prefijo 'v' o '2.0.1-beta' con sufijo.",
    fix: "Extraé el número de versión con regex antes de comparar: when: (mi_var | regex_search('(\\\\d+\\\\.\\\\d+\\\\.\\\\d+)')) is version('2.0', '>='). También podés limpiar el prefijo: when: (mi_var | replace('v', '')) is version('2.0', '>=').",
  },
  {
    error: "Invalid conditional detected: the conditional includes an 'is' operator",
    cause: 'Se escribió el test Jinja2 sin las llaves {{ }}, o la sintaxis del test está mal formada en el contexto del YAML.',
    fix: "Los tests en when: NO necesitan {{ }}: when: variable is defined es correcto. INCORRECTO: when: \"{{ variable is defined }}\". Si el YAML requiere comillas, usá comillas simples: when: 'variable is defined'.",
  },
],
  };
