import type { ModuleContent } from './types';

export const nivel9Modules: ModuleContent[] = [
  {
    levelId: 9,
    moduleId: 1,
    title: 'Variables y expresiones Jinja2',
    objective: 'Dominar la sintaxis de Jinja2 en Ansible: delimitadores, acceso a variables en estructuras complejas, expresiones condicionales inline y la diferencia crítica entre usar Jinja2 en tareas versus en archivos de plantilla.',
    duration: '2–3 horas',
    objectives: [
      'Identificar y usar los tres delimitadores Jinja2: {{ }}, {% %} y {# #}',
      'Acceder a variables en diccionarios anidados, listas y variables mágicas de Ansible',
      'Escribir expresiones ternarias y condicionales inline con Jinja2',
      'Distinguir cuándo usar Jinja2 en parámetros de tareas vs. en archivos .j2',
    ],
    prerequisites: [
      'Conocer variables de Ansible: host_vars, group_vars, vars_files (Nivel 4)',
      'Haber usado el módulo ansible.builtin.template al menos una vez',
      'Entender la diferencia entre inventario y playbook',
    ],
    steps: [
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
      },
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
      },
    ],
    quiz: [
      {
        question: '¿Cuál es la diferencia entre los operadores + y ~ para concatenar strings en Jinja2?',
        options: [
          'No hay diferencia, ambos hacen lo mismo',
          '~ convierte automáticamente a string mientras que + requiere que ambos operandos sean strings',
          '+ es más rápido que ~',
          '~ sólo funciona en archivos .j2, no en playbooks',
        ],
        correctIndex: 1,
        explanation: 'El operador ~ (tilde) convierte automáticamente cualquier tipo a string antes de concatenar, por lo que funciona con números, booleanos y variables de cualquier tipo. El operador + sólo funciona cuando ambos operandos son strings; si uno es un número, Ansible lanzará un error de tipo.',
      },
      {
        question: '¿Dónde funciona la etiqueta de bloque {% for item in lista %}?',
        options: [
          'Sólo en parámetros de tareas en el playbook',
          'En cualquier lugar donde se use Jinja2',
          'Sólo en archivos de plantilla .j2 procesados por el módulo template',
          'En el inventario de Ansible',
        ],
        correctIndex: 2,
        explanation: 'Las etiquetas de bloque {% %} sólo funcionan en archivos de plantilla .j2 procesados por el módulo ansible.builtin.template. En los parámetros de tareas del playbook, Ansible sólo procesa expresiones {{ }}. Para iterar en tareas, usás el parámetro nativo "loop:" de Ansible.',
      },
      {
        question: '¿Qué variable mágica de Ansible contiene el nombre del host tal como aparece en el inventario?',
        options: [
          'ansible_hostname',
          'ansible_host',
          'inventory_hostname',
          'host_name',
        ],
        correctIndex: 2,
        explanation: 'inventory_hostname es la variable mágica que contiene el nombre del host exactamente como figura en el inventario. Es diferente a ansible_hostname (que obtiene el hostname real del sistema operativo vía facts) y ansible_host (que contiene la IP o dirección de conexión). inventory_hostname_short da el nombre sin el dominio.',
      },
    ],
    realWorldCase: 'En un entorno multi-región AWS, un equipo usa expresiones Jinja2 con inventory_hostname y hostvars para construir dinámicamente las URLs de endpoints y cadenas de conexión entre microservicios, eliminando 200 líneas de variables hardcodeadas en los playbooks.',
    troubleshooting: [
      {
        error: "AnsibleUndefinedVariable: 'variable_name' is undefined",
        cause: 'La variable referenciada en la expresión {{ }} no existe en el scope actual, o se está referenciando antes de ser definida.',
        fix: 'Usá el filtro default: {{ variable_name | default("valor_por_defecto") }}. Para debugging, ejecutá ansible-playbook --extra-vars "variable_name=test" o verificá con el módulo debug que la variable existe antes de usarla.',
      },
      {
        error: "We were unable to read either as JSON nor YAML, these are not dictionaries",
        cause: 'Se intentó usar etiquetas de bloque {% %} directamente en un parámetro de tarea del playbook en lugar de en un archivo .j2.',
        fix: 'Mové la lógica compleja a un archivo .j2 y usá el módulo template para procesarlo. Para iteraciones simples en tareas, usá el parámetro loop: nativo de Ansible.',
      },
      {
        error: "Jinja2 variable 'dict_key' — consider using dot notation or bracket notation carefully",
        cause: "La clave del diccionario contiene un guión (-) o un espacio, y se está usando notación de punto (dict.mi-clave) que Jinja2 interpreta como resta.",
        fix: "Usá notación de corchetes: {{ dict['mi-clave'] }}. Las claves con guiones, espacios o que coincidan con métodos de Python siempre requieren corchetes.",
      },
    ],
  },
  {
    levelId: 9,
    moduleId: 2,
    title: 'Filtros Jinja2',
    objective: 'Aprender a usar los filtros de Jinja2 para transformar datos: manipular strings, ordenar listas, convertir tipos y aplicar los filtros específicos de Ansible para criptografía, codificación, rutas de archivos y serialización.',
    duration: '3–4 horas',
    objectives: [
      'Aplicar filtros de string para normalizar y transformar texto',
      'Usar filtros de lista para ordenar, filtrar y transformar colecciones',
      'Convertir entre tipos de datos con filtros de conversión',
      'Usar filtros específicos de Ansible: default, password_hash, to_json, b64encode y regex_replace',
    ],
    prerequisites: [
      'Haber completado el Módulo 1 de Nivel 9 (Variables y expresiones Jinja2)',
      'Entender la sintaxis básica de {{ }} en Ansible',
    ],
    steps: [
      {
        title: '¿Qué son los filtros y cómo funciona el pipe |?',
        body: `
          <p>Un <strong>filtro</strong> en Jinja2 es una función que transforma un valor. Se aplica con el operador <code>|</code> (pipe) entre el valor de entrada y el nombre del filtro.</p>
          <div class="analogy-box">
            <div class="analogy-box-header">💡 Analogía</div>
            <p>Pensá en los filtros como una tubería de producción: el valor entra por un extremo, pasa por cada filtro en orden, y sale transformado por el otro. Es igual que el pipe <code>|</code> en bash, pero para datos en lugar de comandos.</p>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">intro-filtros.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Introducción a filtros
  hosts: localhost
  vars:
    texto: "  Hola Mundo  "
    numero: "42"
    lista: [3, 1, 4, 1, 5, 9, 2, 6]

  tasks:
    # Filtro simple
    - name: Trim + mayúsculas
      ansible.builtin.debug:
        msg: "{{ texto | trim | upper }}"
      # Output: "HOLA MUNDO"

    # Cadena de filtros (pipes encadenados)
    - name: Número como string
      ansible.builtin.debug:
        msg: "Tipo: {{ numero | int | type_debug }}"
      # Output: "Tipo: int"

    # Filtros sobre listas
    - name: Lista ordenada y única
      ansible.builtin.debug:
        msg: "{{ lista | sort | unique }}"
      # Output: [1, 2, 3, 4, 5, 6, 9]</code></pre>
          </div>
          <div class="highlight-box">
            <p><strong>Sintaxis:</strong> <code>{{ valor | filtro1 | filtro2(argumento) | filtro3 }}</code></p>
            <p>Los filtros se encadenan de izquierda a derecha. Algunos aceptan argumentos entre paréntesis.</p>
          </div>
        `
      },
      {
        title: 'Filtros de string',
        body: `
          <p>Los filtros de string permiten normalizar, transformar y manipular texto. Son especialmente útiles para construir nombres de archivos, URLs y configuraciones dinámicas.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">filtros-string.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Filtros de string en Ansible
  hosts: localhost
  vars:
    nombre_app: "  Mi Aplicación Web  "
    frase: "El servidor está CORRIENDO en producción"
    csv_entornos: "dev,staging,prod"
    partes: ["nginx", "1", "20", "2"]

  tasks:
    # Normalización de espacios y capitalización
    - name: "trim — eliminar espacios al inicio/final"
      ansible.builtin.debug:
        msg: "{{ nombre_app | trim }}"
      # "Mi Aplicación Web"

    - name: "lower / upper / title — cambiar capitalización"
      ansible.builtin.debug:
        msg:
          - "lower: {{ nombre_app | trim | lower }}"
          - "upper: {{ nombre_app | trim | upper }}"
          - "title: {{ 'hola mundo' | title }}"
      # lower: "mi aplicación web"
      # upper: "MI APLICACIÓN WEB"
      # title: "Hola Mundo"

    - name: "replace — reemplazar texto"
      ansible.builtin.debug:
        msg: "{{ frase | replace('CORRIENDO', 'activo') }}"
      # "El servidor está activo en producción"

    - name: "split — string a lista"
      ansible.builtin.debug:
        msg: "{{ csv_entornos | split(',') }}"
      # ["dev", "staging", "prod"]

    - name: "join — lista a string"
      ansible.builtin.debug:
        msg: "{{ partes | join('.') }}"
      # "nginx.1.20.2"

    # Uso práctico: slug para nombre de directorio
    - name: "Crear slug de la app"
      ansible.builtin.debug:
        msg: "{{ nombre_app | trim | lower | replace(' ', '-') }}"
      # "mi-aplicación-web"</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Patrón común:</strong> para crear nombres de directorios o slugs a partir de nombres con espacios, encadenás <code>trim | lower | replace(' ', '-')</code>. Es una combinación que usarás constantemente.</div>
          </div>
        `
      },
      {
        title: 'Filtros de lista',
        body: `
          <p>Los filtros de lista permiten transformar colecciones: ordenarlas, filtrar elementos, aplanar estructuras anidadas y seleccionar subconjuntos.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">filtros-lista.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Filtros de lista
  hosts: localhost
  vars:
    numeros: [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
    servidores:
      - nombre: "web-01"
        activo: true
        puerto: 80
      - nombre: "web-02"
        activo: false
        puerto: 80
      - nombre: "api-01"
        activo: true
        puerto: 8080
    lista_anidada: [[1, 2], [3, 4], [5, [6, 7]]]

  tasks:
    - name: "sort / unique — ordenar y deduplicar"
      ansible.builtin.debug:
        msg:
          - "sort: {{ numeros | sort }}"
          - "unique: {{ numeros | unique }}"
          - "sort + unique: {{ numeros | sort | unique }}"

    - name: "first / last — primer y último elemento"
      ansible.builtin.debug:
        msg:
          - "primero: {{ numeros | sort | first }}"
          - "último: {{ numeros | sort | last }}"

    - name: "length — cantidad de elementos"
      ansible.builtin.debug:
        msg: "Total servidores: {{ servidores | length }}"

    - name: "flatten — aplanar listas anidadas"
      ansible.builtin.debug:
        msg: "{{ lista_anidada | flatten }}"
      # [1, 2, 3, 4, 5, 6, 7]

    # selectattr y rejectattr — filtrar por atributo de objeto
    - name: "selectattr — sólo servidores activos"
      ansible.builtin.debug:
        msg: "{{ servidores | selectattr('activo', 'equalto', true) | list }}"

    - name: "rejectattr — excluir servidores activos"
      ansible.builtin.debug:
        msg: "{{ servidores | rejectattr('activo', 'equalto', true) | list }}"

    # map — extraer atributo de cada elemento
    - name: "map — lista de nombres"
      ansible.builtin.debug:
        msg: "{{ servidores | map(attribute='nombre') | list }}"
      # ["web-01", "web-02", "api-01"]</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>selectattr y map devuelven generadores:</strong> siempre añadí <code>| list</code> al final cuando usás <code>selectattr</code>, <code>rejectattr</code> o <code>map</code>. Sin <code>| list</code>, el resultado es un generador Python que puede causar comportamientos inesperados en Ansible.</div>
          </div>
        `
      },
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
      },
    ],
    quiz: [
      {
        question: '¿Qué hace el filtro default(omit) en Ansible, a diferencia de default("valor")?',
        options: [
          'Ambos hacen lo mismo: establecen un valor por defecto',
          'default(omit) elimina la variable del scope, default("valor") la reemplaza',
          'default(omit) hace que Ansible omita completamente el parámetro de la tarea si la variable no está definida',
          'default(omit) sólo funciona en archivos .j2',
        ],
        correctIndex: 2,
        explanation: 'default(omit) es una instrucción especial de Ansible que le dice al módulo que ignore ese parámetro completamente si la variable no está definida. Es como si no hubieras escrito el parámetro. default("valor") en cambio reemplaza la variable con el string "valor". El primero es para parámetros opcionales de módulos; el segundo para proporcionar valores de fallback.',
      },
      {
        question: 'Tenés una lista de diccionarios con claves "nombre" y "activo". ¿Qué filtro usás para obtener sólo los elementos donde activo es true?',
        options: [
          '{{ lista | filter("activo", true) | list }}',
          '{{ lista | selectattr("activo", "equalto", true) | list }}',
          '{{ lista | where("activo == true") | list }}',
          '{{ lista | grep("activo") | list }}',
        ],
        correctIndex: 1,
        explanation: 'selectattr filtra una lista de objetos/dicts basándose en el valor de un atributo. La sintaxis es selectattr("nombre_atributo", "test_name", valor). Para igualdad se usa "equalto". Siempre hay que añadir | list al final porque selectattr devuelve un generador Python, no una lista. Los otros filtros mencionados no existen en Jinja2/Ansible.',
      },
      {
        question: '¿Por qué es importante usar | int antes de hacer aritmética con variables que vienen de --extra-vars o del inventario?',
        options: [
          'No es necesario, Ansible convierte automáticamente los tipos',
          'Porque esas variables llegan como strings, y sumar strings en Python concatena en lugar de sumar',
          'Porque | int es más rápido que la conversión automática',
          'Porque el inventario sólo acepta strings',
        ],
        correctIndex: 1,
        explanation: 'Las variables que llegan por --extra-vars, variables de inventario o variables de entorno son siempre strings en Ansible. Si hacés "8080" + 1 en Python (Jinja2), obtenés un error de tipo. Si hacés "8080" ~ 1 obtenés "80801". Para aritmética real necesitás convertir primero con | int: {{ puerto | int + 1 }} da 8081. Este es uno de los errores más comunes al empezar con Ansible.',
      },
    ],
    realWorldCase: 'Un equipo de plataforma usa filtros Jinja2 para generar configuraciones de Kubernetes: combina el dict de config base con overrides por entorno (| combine), serializa el resultado a YAML (| to_yaml), y lo despliega como ConfigMap. Esto eliminó 12 archivos de configuración separados y reemplazó todo con un único playbook parametrizado.',
    troubleshooting: [
      {
        error: "FilterError: No filter named 'ipaddr'",
        cause: 'El filtro ipaddr (y otros filtros de red como ipsubnet, hwaddr) requieren el paquete Python netaddr instalado en el nodo de control, y son parte de la colección community.general o ansible.utils, no del core de Ansible.',
        fix: 'pip install netaddr && ansible-galaxy collection install ansible.utils. Luego usá el FQCN: {{ ip | ansible.utils.ipaddr("network") }}.',
      },
      {
        error: "template error while templating string: expected token 'end of print block', got '|'",
        cause: "Se intentó usar una expresión Jinja2 con pipe (|) dentro de un contexto donde Ansible no puede resolverla, como en la definición de un loop o un when con sintaxis incorrecta.",
        fix: "Verificá que la expresión esté completa y bien formada. Si el filtro recibe argumentos con comillas, asegurate de no mezclar comillas simples y dobles que rompan el YAML. Usá comillas dobles en el YAML y simples dentro de la expresión Jinja2.",
      },
      {
        error: "TypeError: must be str, not int (o similar error de tipo en filtros de string)",
        cause: 'Se aplicó un filtro de string (como upper, lower, replace) a una variable que es un número entero o booleano en lugar de un string.',
        fix: 'Convertí a string primero: {{ numero | string | upper }}. El filtro string convierte cualquier tipo a su representación en texto.',
      },
    ],
  },
  {
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
  },
  {
    levelId: 9,
    moduleId: 4,
    title: 'Macros e includes Jinja2',
    objective: 'Aplicar el principio DRY en archivos de plantilla Jinja2 usando macros para encapsular bloques reutilizables, importar macros desde otros archivos e incluir fragmentos de plantilla para componer configuraciones complejas.',
    duration: '2–3 horas',
    objectives: [
      'Definir macros Jinja2 con parámetros y valores por defecto',
      'Llamar macros dentro del mismo archivo de plantilla',
      'Importar macros desde archivos externos con import',
      'Incluir fragmentos de plantilla con include para composición modular',
    ],
    prerequisites: [
      'Haber completado los Módulos 1, 2 y 3 del Nivel 9',
      'Entender el módulo ansible.builtin.template y cómo funciona el directorio templates/',
      'Conocer la estructura básica de un archivo nginx.conf',
    ],
    steps: [
      {
        title: '¿Por qué existen las macros? El problema DRY en templates',
        body: `
          <p>Cuando generás configuraciones complejas con templates Jinja2, es fácil caer en la repetición: el mismo bloque de configuración copiado y pegado con pequeñas variaciones. Las <strong>macros</strong> resuelven esto.</p>
          <div class="analogy-box">
            <div class="analogy-box-header">💡 Analogía</div>
            <p>Una macro en Jinja2 es como una función en Python: la definís una vez con parámetros, y la llamás tantas veces como necesités pasando distintos argumentos. El output se genera en el punto donde la llamás.</p>
          </div>
          <div class="highlight-box">
            <p><strong>¿Cuándo usar macros?</strong></p>
            <ul>
              <li>El mismo bloque de configuración aparece 2 o más veces en el template con variaciones</li>
              <li>Querés testear la lógica de generación de forma aislada</li>
              <li>Necesitás el mismo bloque en múltiples templates diferentes</li>
              <li>La lógica es lo suficientemente compleja como para merecer un nombre descriptivo</li>
            </ul>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">jinja2</span><span class="code-block-filename">templates/nginx-sin-macros.conf.j2</span></div>
            <pre class="language-jinja2"><code class="language-jinja2">{# ❌ ANTES: repetición sin macros #}
server {
    listen 80;
    server_name app.ejemplo.com;
    root /var/www/app;
    access_log /var/log/nginx/app-access.log;
    error_log /var/log/nginx/app-error.log;
    location / { proxy_pass http://localhost:8080; }
}

server {
    listen 80;
    server_name api.ejemplo.com;
    root /var/www/api;
    access_log /var/log/nginx/api-access.log;
    error_log /var/log/nginx/api-error.log;
    location / { proxy_pass http://localhost:8081; }
}

server {
    listen 80;
    server_name admin.ejemplo.com;
    root /var/www/admin;
    access_log /var/log/nginx/admin-access.log;
    error_log /var/log/nginx/admin-error.log;
    location / { proxy_pass http://localhost:8082; }
}</code></pre>
          </div>
          <p>Con macros, esto se convierte en una sola definición + tres llamadas. Veremos cómo en los próximos pasos.</p>
        `
      },
      {
        title: 'Definir macros con parámetros y defaults',
        body: `
          <p>Una macro se define con <code>{% macro nombre(param1, param2="default") %}</code> y se cierra con <code>{% endmacro %}</code>. Los parámetros pueden tener valores por defecto, exactamente como en Python.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">jinja2</span><span class="code-block-filename">templates/nginx.conf.j2</span></div>
            <pre class="language-jinja2"><code class="language-jinja2">{# Definición de la macro — sólo define, no genera output todavía #}
{% macro virtual_host(dominio, puerto_app, root="/var/www", escuchar=80, ssl=false) %}
server {
    listen {{ escuchar }}{% if ssl %} ssl{% endif %};
    server_name {{ dominio }};
    root {{ root }}/{{ dominio.split('.')[0] }};

    access_log /var/log/nginx/{{ dominio }}-access.log;
    error_log /var/log/nginx/{{ dominio }}-error.log warn;

    {% if ssl %}
    ssl_certificate /etc/letsencrypt/live/{{ dominio }}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/{{ dominio }}/privkey.pem;
    {% endif %}

    location / {
        proxy_pass http://localhost:{{ puerto_app }};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
{% endmacro %}</code></pre>
          </div>
          <div class="highlight-box">
            <p><strong>Reglas de sintaxis de macros:</strong></p>
            <ul>
              <li>Los parámetros sin default son <strong>obligatorios</strong></li>
              <li>Los parámetros con default son <strong>opcionales</strong> — si no se pasan, usan el default</li>
              <li>La macro <strong>no genera output</strong> donde está definida — sólo cuando se llama</li>
              <li>El cuerpo de la macro tiene acceso a todas las variables del contexto global del template</li>
            </ul>
          </div>
        `
      },
      {
        title: 'Llamar macros dentro del mismo archivo',
        body: `
          <p>Una vez definida la macro, se llama como una función. El output se inserta en el punto exacto de la llamada.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">jinja2</span><span class="code-block-filename">templates/nginx.conf.j2</span></div>
            <pre class="language-jinja2"><code class="language-jinja2">{# Primero: definición de la macro #}
{% macro virtual_host(dominio, puerto_app, root="/var/www", escuchar=80, ssl=false) %}
server {
    listen {{ escuchar }}{% if ssl %} ssl{% endif %};
    server_name {{ dominio }};

    access_log /var/log/nginx/{{ dominio }}-access.log;
    error_log /var/log/nginx/{{ dominio }}-error.log warn;

    {% if ssl %}
    ssl_certificate /etc/letsencrypt/live/{{ dominio }}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/{{ dominio }}/privkey.pem;
    {% endif %}

    location / {
        proxy_pass http://localhost:{{ puerto_app }};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
{% endmacro %}

{# Configuración global de nginx #}
worker_processes {{ ansible_processor_vcpus | default(2) }};
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    sendfile on;
    keepalive_timeout 65;

    {# Llamadas a la macro con distintos argumentos #}
    {{ virtual_host("app.ejemplo.com", 8080) }}
    {{ virtual_host("api.ejemplo.com", 8081) }}
    {{ virtual_host("admin.ejemplo.com", 8082, ssl=true, escuchar=443) }}

    {# O iterando sobre una variable de Ansible #}
    {% for vhost in nginx_vhosts %}
    {{ virtual_host(vhost.dominio, vhost.puerto, ssl=vhost.ssl | default(false)) }}
    {% endfor %}
}</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">group_vars/webservers.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">nginx_vhosts:
  - dominio: "tienda.ejemplo.com"
    puerto: 3000
    ssl: true
  - dominio: "blog.ejemplo.com"
    puerto: 4000
    ssl: false
  - dominio: "docs.ejemplo.com"
    puerto: 5000
    ssl: true</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Blancos en la salida:</strong> Jinja2 inserta líneas en blanco donde hay tags <code>{% %}</code>. Para controlar el whitespace, usá guiones: <code>{%- macro ... -%}</code> o <code>{{- valor -}}</code>. El guión consume el whitespace adyacente.</div>
          </div>
        `
      },
      {
        title: 'import — usar macros desde otros archivos',
        body: `
          <p>Cuando las macros son útiles en múltiples templates, podés moverlas a un archivo dedicado e importarlas con <code>{% import %}</code>. Esto crea una biblioteca de macros reutilizable.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">jinja2</span><span class="code-block-filename">templates/macros/nginx_macros.j2</span></div>
            <pre class="language-jinja2"><code class="language-jinja2">{# Biblioteca de macros para nginx #}
{# Este archivo SÓLO define macros — no genera output directamente #}

{% macro virtual_host(dominio, puerto_app, escuchar=80, ssl=false) %}
server {
    listen {{ escuchar }}{% if ssl %} ssl{% endif %};
    server_name {{ dominio }};
    access_log /var/log/nginx/{{ dominio }}-access.log;
    error_log /var/log/nginx/{{ dominio }}-error.log warn;
    location / {
        proxy_pass http://localhost:{{ puerto_app }};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
{% endmacro %}

{% macro upstream_block(nombre, servidores) %}
upstream {{ nombre }} {
    {% for server in servidores %}
    server {{ server.ip }}:{{ server.puerto }} weight={{ server.weight | default(1) }};
    {% endfor %}
}
{% endmacro %}

{% macro ssl_params() %}
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
{% endmacro %}</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">jinja2</span><span class="code-block-filename">templates/nginx.conf.j2</span></div>
            <pre class="language-jinja2"><code class="language-jinja2">{# Importar todas las macros del archivo de biblioteca #}
{% import 'macros/nginx_macros.j2' as nginx %}

worker_processes auto;

http {
    {# Usar macros con el prefijo del alias #}
    {{ nginx.upstream_block("backend", upstream_servers) }}

    {% for vhost in nginx_vhosts %}
    {{ nginx.virtual_host(vhost.dominio, vhost.puerto, ssl=vhost.ssl | default(false)) }}
    {% endfor %}
}

{# También podés importar macros específicas sin alias #}
{# {% from 'macros/nginx_macros.j2' import virtual_host, ssl_params %} #}
{# virtual_host(...) — usada sin prefijo #}</code></pre>
          </div>
          <div class="highlight-box">
            <p><strong>Dos formas de importar:</strong></p>
            <ul>
              <li><code>{% import 'archivo.j2' as alias %}</code> → usás las macros con el prefijo: <code>alias.macro()</code></li>
              <li><code>{% from 'archivo.j2' import macro1, macro2 %}</code> → usás las macros directamente sin prefijo</li>
            </ul>
          </div>
        `
      },
      {
        title: 'include — insertar fragmentos de template',
        body: `
          <p><code>{% include %}</code> es diferente a <code>{% import %}</code>: en lugar de cargar macros, <strong>inserta directamente el contenido renderizado</strong> de otro archivo en ese punto. Es como un <code>cat</code> del template procesado.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">jinja2</span><span class="code-block-filename">templates/nginx/ssl_params.j2</span></div>
            <pre class="language-jinja2"><code class="language-jinja2">{# Fragmento reutilizable: parámetros SSL #}
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;
    add_header Strict-Transport-Security "max-age=63072000" always;</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">jinja2</span><span class="code-block-filename">templates/nginx/gzip_params.j2</span></div>
            <pre class="language-jinja2"><code class="language-jinja2">{# Fragmento: configuración gzip #}
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level {{ gzip_level | default(6) }};
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">jinja2</span><span class="code-block-filename">templates/nginx.conf.j2</span></div>
            <pre class="language-jinja2"><code class="language-jinja2">{% import 'macros/nginx_macros.j2' as nginx %}

worker_processes {{ ansible_processor_vcpus | default(2) }};

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    {# Incluir fragmento de gzip — se renderiza con las variables del contexto actual #}
    {% include 'nginx/gzip_params.j2' %}

    {% for vhost in nginx_vhosts %}
    server {
        listen 80;
        server_name {{ vhost.dominio }};

        {% if vhost.ssl | default(false) %}
        listen 443 ssl;
        ssl_certificate /etc/letsencrypt/live/{{ vhost.dominio }}/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/{{ vhost.dominio }}/privkey.pem;

        {# Incluir parámetros SSL como fragmento reutilizable #}
        {% include 'nginx/ssl_params.j2' %}
        {% endif %}

        location / {
            proxy_pass http://localhost:{{ vhost.puerto }};
        }
    }
    {% endfor %}
}

{# include con ignore missing — no falla si el archivo no existe #}
{% include 'nginx/custom_overrides.j2' ignore missing %}</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>include vs. import:</strong> usá <code>include</code> cuando querés insertar texto renderizado (fragmentos de configuración). Usá <code>import</code> cuando querés cargar macros (funciones reutilizables). Los includes heredan el contexto completo del template padre; los imports también, a menos que uses <code>import ... with context</code>.</div>
          </div>
        `
      },
      {
        title: 'Ejemplo completo: nginx.conf.j2 con macros para virtual hosts',
        body: `
          <div class="lab-box">
            <div class="lab-box-header">🧪 Ejemplo completo — nginx con macros</div>
            <div class="lab-section">
              <div class="lab-section-title">Estructura del proyecto</div>
              <div class="code-block-wrapper">
                <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">estructura-templates/</span></div>
                <pre class="language-bash"><code class="language-bash">roles/nginx/
├── tasks/
│   └── main.yml
├── templates/
│   ├── macros/
│   │   └── nginx_macros.j2     # biblioteca de macros
│   ├── nginx/
│   │   ├── ssl_params.j2       # fragmento SSL
│   │   └── gzip_params.j2      # fragmento gzip
│   └── nginx.conf.j2           # template principal
└── vars/
    └── main.yml</code></pre>
              </div>
            </div>
            <div class="lab-section">
              <div class="lab-section-title">Playbook de despliegue</div>
              <div class="code-block-wrapper">
                <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/nginx/tasks/main.yml</span></div>
                <pre class="language-yaml"><code class="language-yaml">---
- name: Instalar nginx
  ansible.builtin.package:
    name: nginx
    state: present

- name: Generar configuración principal con template
  ansible.builtin.template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
    owner: root
    group: root
    mode: '0644'
    validate: 'nginx -t -c %s'   # validar antes de instalar
  notify: reload nginx

- name: Verificar que nginx está corriendo
  ansible.builtin.service:
    name: nginx
    state: started
    enabled: true</code></pre>
              </div>
            </div>
            <div class="lab-section">
              <div class="lab-section-title">Variables (group_vars/webservers.yml)</div>
              <div class="code-block-wrapper">
                <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">group_vars/webservers.yml</span></div>
                <pre class="language-yaml"><code class="language-yaml">gzip_level: 6

nginx_vhosts:
  - dominio: "tienda.ejemplo.com"
    puerto: 3000
    ssl: true
  - dominio: "api.ejemplo.com"
    puerto: 8080
    ssl: true
  - dominio: "monitor.ejemplo.com"
    puerto: 9090
    ssl: false

upstream_servers:
  - ip: "10.0.1.10"
    puerto: 3000
    weight: 2
  - ip: "10.0.1.11"
    puerto: 3000
    weight: 1</code></pre>
              </div>
            </div>
            <div class="lab-section">
              <div class="lab-section-title">Resultado esperado</div>
              <div class="lab-expected">
                <div class="lab-expected-item"><span class="lab-expected-check">✓</span> <code>ansible-playbook site.yml --tags nginx</code> genera /etc/nginx/nginx.conf sin errores</div>
                <div class="lab-expected-item"><span class="lab-expected-check">✓</span> <code>nginx -t</code> valida la configuración generada</div>
                <div class="lab-expected-item"><span class="lab-expected-check">✓</span> Cada vhost en nginx_vhosts tiene su bloque server generado</div>
                <div class="lab-expected-item"><span class="lab-expected-check">✓</span> Los bloques SSL sólo aparecen en los vhosts con ssl: true</div>
                <div class="lab-expected-item"><span class="lab-expected-check">✓</span> La macro upstream_block genera el bloque upstream correctamente</div>
              </div>
            </div>
          </div>
        `
      },
    ],
    quiz: [
      {
        question: '¿Cuál es la diferencia entre {% import %} y {% include %} en Jinja2?',
        options: [
          'No hay diferencia, ambos insertan el contenido del archivo',
          'import carga macros (funciones) sin renderizar output; include inserta el contenido renderizado del archivo directamente',
          'include es más rápido que import',
          'import sólo funciona con archivos .j2; include funciona con cualquier archivo',
        ],
        correctIndex: 1,
        explanation: 'import carga las macros definidas en otro archivo sin insertar ningún output en el template — sólo hace disponibles las macros para ser llamadas. include en cambio renderiza el archivo referenciado y lo inserta textualmente en ese punto del template. Usás import para "importar funciones", e include para "insertar fragmentos de texto procesado".',
      },
      {
        question: 'Al definir una macro Jinja2 como {% macro host(dominio, puerto=80) %}, ¿qué significa que puerto tenga el valor 80?',
        options: [
          'Puerto es siempre 80 y no se puede cambiar al llamar la macro',
          'Puerto es un parámetro obligatorio que debe recibir el valor 80',
          'Puerto es un parámetro opcional con valor por defecto 80 — si no se pasa al llamar la macro, usa 80',
          'La macro fallará si se llama sin pasar el parámetro puerto',
        ],
        correctIndex: 2,
        explanation: 'En las macros de Jinja2, los parámetros con valor por defecto son opcionales. Si llamas host("api.ejemplo.com") sin pasar puerto, la macro usará 80. Si llamas host("api.ejemplo.com", 8080), usará 8080. Los parámetros sin default (como dominio en este ejemplo) son obligatorios — si no los pasás, la macro lanzará un error.',
      },
      {
        question: '¿Qué hace {% include "fragmento.j2" ignore missing %}?',
        options: [
          'Incluye el archivo pero ignora todos sus errores de renderizado',
          'Incluye el archivo sólo si no existe, y lo omite si existe',
          'Incluye el archivo si existe; si no existe, continúa sin error en lugar de fallar',
          'Es un error de sintaxis — ignore missing no es válido',
        ],
        correctIndex: 2,
        explanation: 'La directiva "ignore missing" hace que Jinja2 omita silenciosamente el include si el archivo referenciado no existe, en lugar de lanzar un TemplateNotFound error. Es útil para fragmentos opcionales, como overrides de configuración que quizás no están presentes en todos los entornos. Sin "ignore missing", un archivo faltante causa un error que detiene el playbook.',
      },
    ],
    realWorldCase: 'Un equipo de infraestructura gestiona 15 microservicios en nginx con distintas configuraciones SSL, rate limiting y paths de proxy. En lugar de mantener 15 archivos de configuración separados, definen 4 macros en un archivo de biblioteca y generan todas las configuraciones desde un único template parametrizado, reduciendo 2000 líneas de configuración a 300.',
    troubleshooting: [
      {
        error: "TemplateNotFound: macros/nginx_macros.j2",
        cause: 'Ansible busca los archivos de include/import relativos al directorio templates/ del rol actual. Si el path en el import no coincide con la estructura real del directorio, no lo encuentra.',
        fix: "Verificá que el archivo exista en roles/<rol>/templates/macros/nginx_macros.j2. En el template, usá el path relativo al directorio templates/: {% import 'macros/nginx_macros.j2' as nginx %}. Ansible resuelve los paths de template relativos al directorio templates/ del rol.",
      },
      {
        error: "UndefinedError: 'variable_name' is undefined (dentro de una macro importada con import)",
        cause: 'Por defecto, las macros importadas con {% import %} NO heredan el contexto global del template padre — sólo tienen acceso a sus propios parámetros.',
        fix: "Usá {% import 'archivo.j2' as alias with context %} para que las macros importadas hereden todas las variables del contexto. Alternativamente, pasá las variables como parámetros explícitos a la macro. Los includes sí heredan el contexto por defecto.",
      },
      {
        error: 'Líneas en blanco excesivas en el output del template generado',
        cause: 'Las etiquetas {% %} de Jinja2 dejan una línea en blanco donde estaban en el template. En configuraciones sensibles al whitespace esto puede causar problemas.',
        fix: "Usá el modificador de whitespace con guión: {%- macro ... -%} y {%- endmacro -%}. El guión antes del % consume el whitespace/newline precedente; el guión después del % consume el whitespace/newline siguiente. También podés configurar trim_blocks=True y lstrip_blocks=True en el template.",
      },
    ],
  },
];
