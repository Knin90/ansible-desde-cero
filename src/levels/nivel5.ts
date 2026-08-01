import type { ModuleContent } from './types';

export const nivel5Modules: ModuleContent[] = [
  {
    levelId: 5,
    moduleId: 1,
    title: 'Sintaxis YAML completa en contexto Ansible',
    objective: 'Dominar todos los aspectos de YAML que se usan en Ansible: tipos de datos, anclas, referencias, multilínea y errores comunes.',
    duration: '2 horas',
    objectives: [
      'Aplicar tipos de datos YAML correctamente en el contexto de playbooks de Ansible',
      'Elegir entre | y > para bloques multilínea según el caso de uso',
      'Reutilizar configuración con anchors y aliases en inventarios YAML',
      'Identificar y corregir los errores YAML más frecuentes en Ansible',
    ],
    steps: [
      {
        title: 'YAML en Ansible — reglas críticas',
        body: `
          <p>Ansible usa YAML como lenguaje de configuración. A diferencia de JSON, YAML es sensible a la indentación y tiene varios "gotchas" que sorprenden a los principiantes.</p>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Regla #1:</strong> YAML usa SOLO espacios. Nunca tabs. Un tab rompe el parseo. Configurá tu editor para expandir tabs a espacios en archivos .yml y .yaml.</div>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">tipos-de-datos.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Strings — las comillas son opcionales salvo en casos especiales
nombre: servidor-web
version: "2.0"        # Comillas para que no se interprete como número
mensaje: 'it''s OK'   # Comillas simples: el '' dentro es un literal '

# Números
puerto: 80
timeout: 30.5
hex: 0xFF

# Booleanos — todas estas formas son válidas en YAML
debug: true
agentless: yes
reboot: on
# Cuidado: en Ansible, preferí true/false para evitar confusiones

# Null
valor_vacio: null
sin_valor: ~

# Listas
servidores:
  - web1.com
  - web2.com

# Inline list
puertos: [80, 443, 8080]

# Diccionarios / mappings
conexion:
  host: db1.com
  port: 5432
  ssl: true

# Inline dict
opts: {timeout: 30, retries: 3}</code></pre>
          </div>
        `
      },
      {
        title: 'Multilínea: | (literal) vs > (folded)',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">multilinea.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Literal block scalar (|) — preserva saltos de línea exactos
script: |
  #!/bin/bash
  echo "Instalando dependencias"
  apt-get update
  apt-get install -y nginx postgresql

# Folded block scalar (>) — colapsa saltos en espacios
descripcion: >
  Este servidor es el nodo principal
  de la infraestructura de producción.
  Maneja el tráfico de entrada.
# Resultado: "Este servidor es el nodo principal de la infraestructura..."

# Modificadores de bloque
# |- quita el newline final
# |+ mantiene newlines finales adicionales

comando: |-
  ls -la /etc/nginx
  cat nginx.conf</code></pre>
          </div>
        `
      },
      {
        title: 'Anchors y aliases — DRY en YAML',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">anchors-aliases.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Anchor: define un valor reutilizable con &nombre
defaults: &defaults
  ansible_user: ubuntu
  ansible_python_interpreter: /usr/bin/python3
  ansible_ssh_private_key_file: ~/.ssh/empresa_rsa

# Alias: reutiliza el anchor con *nombre
servidores:
  web1:
    <<: *defaults      # Merge key: copia todas las claves del anchor
    ansible_host: 10.0.1.10
  web2:
    <<: *defaults
    ansible_host: 10.0.1.11
    ansible_user: centos  # Sobreescribe el valor del anchor</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Nota:</strong> anchors y aliases son YAML puro, no específicos de Ansible. Son útiles en inventarios YAML y en archivos de variables para evitar repetición, pero no funcionan en playbooks porque Ansible procesa las tareas antes del merge.</div>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">Tasks y Play — Anatomía completa</div>
              <div class="next-chapter-desc">Explorás todos los campos disponibles en un play y en una task, y cómo controlar la ejecución con become, when, register y más.</div>
            </div>
          </div>
        `
      }
    ],
    prerequisites: [
      'Completar Nivel 0 — Conceptos básicos de automatización',
      'Completar Nivel 1 — Inventarios y conexión SSH',
      'Completar Nivel 2 — Módulos esenciales',
      'Completar Nivel 3 — Variables y plantillas Jinja2',
      'Completar Nivel 4 — Roles y estructura de proyectos',
    ],
    realWorldCase: 'Al escribir un playbook que lanza un script bash multilínea, un tab invisible en el YAML rompe el parseo y el deploy falla en producción. Conocer las reglas críticas de YAML evita horas de debugging en el momento más crítico.',
    quiz: [
      {
        question: '¿Cuál es la diferencia entre el operador | y > en YAML multilínea?',
        options: [
          '| colapsa los saltos de línea en espacios; > los preserva exactamente',
          '| preserva los saltos de línea exactamente; > colapsa los saltos en espacios',
          'Son equivalentes; solo difieren en estilo',
          '| se usa para strings; > se usa solo para comandos bash',
        ],
        correctIndex: 1,
        explanation: '| (literal block scalar) preserva cada salto de línea tal cual. > (folded block scalar) convierte los saltos de línea en espacios, produciendo un párrafo continuo. Usá | para scripts y comandos, > para descripciones largas.',
      },
      {
        question: '¿Qué hace el operador <<: en un diccionario YAML?',
        options: [
          'Agrega un comentario al bloque',
          'Define un anchor nuevo con ese nombre',
          'Fusiona todas las claves de un anchor en el diccionario actual (merge key)',
          'Redirige la salida del bloque a otro archivo',
        ],
        correctIndex: 2,
        explanation: '<<: es la "merge key" de YAML. Copia todas las claves del alias referenciado (*nombre) al diccionario actual. Si el diccionario define la misma clave, la sobreescribe. Es útil para heredar configuraciones base en inventarios YAML.',
      },
      {
        question: '¿Por qué Ansible recomienda usar true/false en lugar de yes/no para booleanos?',
        options: [
          'Porque yes/no son inválidos en YAML 1.2 y Ansible usa YAML 1.2',
          'Para mayor claridad y evitar ambigüedad, ya que YAML 1.1 acepta múltiples formas (yes, on, true) que pueden confundir',
          'Porque yes/no solo funcionan en Windows y true/false son multiplataforma',
          'No hay diferencia; Ansible acepta ambas formas de manera idéntica',
        ],
        correctIndex: 1,
        explanation: 'YAML 1.1 acepta yes, no, on, off, true, false como booleanos. Esto genera confusión (¿"on" es el string "on" o el booleano true?). Ansible recomienda true/false para eliminar esa ambigüedad y hacer el código más legible y predecible.',
      },
    ],
    troubleshooting: [
      {
        error: 'yaml.scanner.ScannerError: mapping values are not allowed here',
        cause: 'Un caracter tab fue usado en lugar de espacios para la indentación. YAML solo acepta espacios.',
        fix: 'Configurá tu editor para expandir tabs a espacios en archivos .yml. Ejecutá `cat -A archivo.yml | grep "^I"` para detectar tabs (se muestran como ^I).',
      },
      {
        error: 'El valor numérico "2.0" se interpreta como el número 2, no como el string "2.0"',
        cause: 'YAML infiere tipos automáticamente. Sin comillas, "2.0" se parsea como float.',
        fix: 'Rodeá el valor con comillas dobles: version: "2.0". Siempre usá comillas cuando un valor que parece número debe tratarse como string (versiones, IDs, etc.).',
      },
      {
        error: 'Los anchors definidos en un playbook no se expanden correctamente en las tasks',
        cause: 'Ansible procesa las tareas antes del merge YAML. Los anchors y aliases funcionan en inventarios YAML pero no dentro de la sección tasks: de un playbook.',
        fix: 'Usá anchors solo en inventarios YAML y archivos de variables. En playbooks, reutilizá configuración mediante variables, defaults de roles o import_tasks.',
      },
    ],
  },
  {
    levelId: 5,
    moduleId: 2,
    title: 'Tasks y Play — Anatomía completa',
    objective: 'Entender todos los campos disponibles en un play y en una task, y cómo interactúan entre sí.',
    duration: '2 horas',
    objectives: [
      'Configurar todos los campos clave de un play: hosts, gather_facts, strategy, serial',
      'Usar register, when, failed_when y changed_when en una task',
      'Implementar retries con retries, delay y until para tareas que pueden fallar',
      'Aplicar become en el nivel de play y sobreescribirlo en tareas individuales',
    ],
    steps: [
      {
        title: 'Anatomía de un Play',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">anatomia-play.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">- name: Configurar servidores web          # Nombre del play (recomendado)
  hosts: servidores_web                    # Patrón de hosts: grupo, lista, expresión
  gather_facts: true                       # Recolectar facts (default: true)
  become: true                             # Usar sudo para todo el play
  become_user: root                        # Usuario al que escalar
  become_method: sudo                      # Método de escalada
  connection: ssh                          # Plugin de conexión
  remote_user: ubuntu                      # Usuario SSH
  port: 22                                 # Puerto SSH
  strategy: linear                         # Strategy plugin
  serial: 2                                # Rolling update: de a 2 hosts
  max_fail_percentage: 30                  # Si falla >30%, abortar
  any_errors_fatal: false                  # ¿Un error mata todo el play?
  ignore_errors: false                     # ¿Ignorar errores en todas las tasks?
  order: sorted                            # Orden de hosts: inventory|sorted|reverse_sorted|shuffle
  vars:                                    # Variables del play
    http_port: 80
    nginx_version: "1.24"
  vars_files:                              # Cargar variables desde archivos
    - vars/comunes.yml
    - "vars/{{ env }}.yml"
  vars_prompt:                             # Pedir variables interactivamente
    - name: version_deploy
      prompt: "¿Qué versión deployar?"
  environment:                             # Variables de entorno en el host remoto
    PATH: "/usr/local/bin:{{ ansible_env.PATH }}"
  tags: [web, configuracion]               # Tags del play completo
  pre_tasks: []                            # Se ejecutan ANTES de los roles
  roles: []                                # Lista de roles
  tasks: []                                # Tareas del play
  post_tasks: []                           # Se ejecutan DESPUÉS de los roles
  handlers: []                             # Handlers del play</code></pre>
          </div>
        `
      },
      {
        title: 'Anatomía de una Task',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">anatomia-task.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  - name: Instalar nginx                    # Nombre descriptivo (muy recomendado)
    ansible.builtin.package:               # Módulo con FQCN (Fully Qualified Collection Name)
      name: nginx
      state: present

    # --- Control de ejecución ---
    when: ansible_os_family == "Debian"   # Condición para ejecutar

    loop:                                  # Iterar sobre una lista
      - nginx
      - curl
    loop_control:
      label: "{{ item }}"                 # Etiqueta en la salida

    # --- Escalada de privilegios ---
    become: true                          # Sobreescribe el del play
    become_user: root

    # --- Manejo de errores ---
    ignore_errors: true                   # No falla aunque la task falle
    failed_when: result.rc != 0          # Condición personalizada de fallo
    changed_when: false                   # Nunca reportar como "changed"

    # --- Retries ---
    retries: 5
    delay: 10
    until: result.rc == 0

    # --- Notificaciones ---
    notify:                               # Disparar handlers si hay cambios
      - Reiniciar nginx
      - Recargar configuración

    # --- Captura de resultado ---
    register: resultado_instalacion       # Guardar el resultado

    # --- Timeout ---
    timeout: 120                          # Tiempo máximo en segundos

    # --- Tags ---
    tags: [instalacion, nginx]

    # --- Variables locales ---
    vars:
      paquete_extra: libssl-dev</code></pre>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">Handlers y Notify</div>
              <div class="next-chapter-desc">Ejecutás acciones como reiniciar servicios solo cuando algo realmente cambia, evitando interrupciones innecesarias.</div>
            </div>
          </div>
        `
      }
    ],
    prerequisites: [
      'Completar Módulo 1 del Nivel 5 — Sintaxis YAML completa en contexto Ansible',
    ],
    realWorldCase: 'Un playbook de deploy usa serial: 2 y max_fail_percentage: 30 para hacer rolling updates seguros: si más del 30% de los hosts falla, Ansible aborta antes de romper toda la flota. Sin conocer estos campos del play, un deploy defectuoso podría derribar todos los servidores simultáneamente.',
    quiz: [
      {
        question: '¿Cuál es la diferencia entre failed_when y ignore_errors en una task?',
        options: [
          'Son equivalentes; ambos evitan que el playbook falle',
          'failed_when define una condición personalizada para considerar la task fallida; ignore_errors hace que Ansible continúe aunque la task falle',
          'failed_when solo funciona con el módulo command; ignore_errors funciona con cualquier módulo',
          'ignore_errors es deprecated; se debe usar siempre failed_when',
        ],
        correctIndex: 1,
        explanation: 'failed_when te permite redefinir qué significa "fallo" (ej: `failed_when: result.rc > 1`). ignore_errors simplemente ignora cualquier fallo y continúa. Son complementarios: failed_when controla cuándo falla; ignore_errors controla qué pasa cuando falla.',
      },
      {
        question: '¿Qué campo de un play controla que se procesen los hosts de a 2 en un rolling update?',
        options: [
          'max_fail_percentage: 2',
          'strategy: 2',
          'serial: 2',
          'batch_size: 2',
        ],
        correctIndex: 2,
        explanation: 'serial: 2 hace que Ansible procese el play en lotes de 2 hosts. Completa todas las tasks en esos 2 hosts antes de pasar al siguiente lote. Es el mecanismo nativo de rolling update en Ansible.',
      },
      {
        question: '¿Qué combinación de campos permite reintentar una task hasta que tenga éxito?',
        options: [
          'retry: true y max_retries: 5',
          'retries: 5, delay: 10 y until: <condición>',
          'loop_control: { retries: 5 } y when: not result.failed',
          'failed_when: false y retries: 5',
        ],
        correctIndex: 1,
        explanation: 'La combinación retries + delay + until es el patrón correcto. `retries` define cuántos intentos, `delay` los segundos entre intentos, y `until` la condición que debe cumplirse para considerar la task exitosa. Los tres campos son obligatorios para que el retry funcione correctamente.',
      },
    ],
    troubleshooting: [
      {
        error: 'La task con register no tiene el campo rc disponible',
        cause: 'El módulo usado no devuelve rc. Solo los módulos que ejecutan comandos del sistema (command, shell, raw) incluyen rc en su resultado.',
        fix: 'Verificá la documentación del módulo para saber qué campos devuelve. Usá `- ansible.builtin.debug: var=resultado` justo después de la task con register para inspeccionar la estructura completa del resultado.',
      },
      {
        error: 'changed_when: false hace que los handlers no se ejecuten',
        cause: 'Los handlers solo se disparan cuando una task reporta changed: true. Si forzás changed_when: false, la task nunca reporta cambios aunque el notify esté definido.',
        fix: 'Usá changed_when: false solo en tareas de verificación o lectura que nunca deben considerarse como cambios. No lo uses en tareas que necesiten disparar handlers.',
      },
      {
        error: 'El playbook falla con "Timeout waiting for privilege escalation prompt"',
        cause: 'become: true está configurado pero el usuario remoto necesita contraseña para sudo y no se proveyó.',
        fix: 'Ejecutá el playbook con --ask-become-pass para que Ansible pida la contraseña de sudo. En producción, configurá el usuario en sudoers con NOPASSWD o usá ansible_become_password en vault.',
      },
    ],
  },
  {
    levelId: 5,
    moduleId: 3,
    title: 'Handlers y Notify',
    objective: 'Dominar los handlers y el mecanismo notify para ejecutar acciones solo cuando algo cambia.',
    duration: '1.5 horas',
    objectives: [
      'Definir handlers y notificarlos desde tareas con notify',
      'Usar listen para que múltiples handlers respondan al mismo evento',
      'Forzar la ejecución anticipada de handlers con meta: flush_handlers',
      'Entender por qué un handler se ejecuta una sola vez aunque lo notifiquen varias tareas',
    ],
    steps: [
      {
        title: 'Cómo funcionan los handlers',
        body: `
          <p>Los handlers son tareas especiales que solo se ejecutan cuando son notificados por otra tarea que tuvo <code>changed: true</code>. Se ejecutan una sola vez al final del play, sin importar cuántas veces fueron notificados. Son perfectos para reiniciar servicios después de cambios de configuración.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">handlers-basico.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  - name: Instalar nginx
    ansible.builtin.package:
      name: nginx
      state: present
    notify: Reiniciar nginx             # Notifica al handler

  - name: Copiar configuración
    ansible.builtin.template:
      src: nginx.conf.j2
      dest: /etc/nginx/nginx.conf
    notify:                            # Puede notificar múltiples handlers
      - Reiniciar nginx
      - Verificar configuración

handlers:
  - name: Reiniciar nginx              # Nombre debe coincidir exactamente
    ansible.builtin.service:
      name: nginx
      state: restarted

  - name: Verificar configuración
    ansible.builtin.command:
      cmd: nginx -t</code></pre>
          </div>
        `
      },
      {
        title: 'Listen — Notificaciones con alias',
        body: `
          <p>El campo <code>listen</code> permite que un handler "escuche" en un tema. Múltiples handlers pueden escuchar el mismo tema. Una tarea notifica el tema y todos los handlers asociados se disparan.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">handlers-listen.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  - name: Actualizar configuración
    ansible.builtin.template:
      src: app.conf.j2
      dest: /etc/app/app.conf
    notify: reiniciar servicios app   # Notifica el tema

handlers:
  - name: Reiniciar aplicación
    listen: reiniciar servicios app   # Escucha el tema
    ansible.builtin.service:
      name: mi-app
      state: restarted

  - name: Reiniciar proxy
    listen: reiniciar servicios app   # También escucha el mismo tema
    ansible.builtin.service:
      name: nginx
      state: reloaded

  - name: Limpiar cache
    listen: reiniciar servicios app   # Y este también
    ansible.builtin.file:
      path: /tmp/app-cache
      state: absent</code></pre>
          </div>
        `
      },
      {
        title: 'Forzar handlers y handlers globales',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">handlers-avanzado.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  - name: Configurar nginx
    ansible.builtin.template:
      src: nginx.conf.j2
      dest: /etc/nginx/nginx.conf
    notify: Reiniciar nginx

  # Forzar ejecución de todos los handlers pendientes ahora
  - name: Flush handlers
    ansible.builtin.meta: flush_handlers

  # Después de este punto, los handlers ya se ejecutaron
  - name: Verificar que nginx responde
    ansible.builtin.uri:
      url: http://localhost
      status_code: 200

handlers:
  - name: Reiniciar nginx
    ansible.builtin.service:
      name: nginx
      state: restarted</code></pre>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">Tags</div>
              <div class="next-chapter-desc">Marcás tareas con etiquetas para ejecutar o saltar partes específicas de un playbook sin modificar el código.</div>
            </div>
          </div>
        `
      }
    ],
    prerequisites: [
      'Completar Módulo 2 del Nivel 5 — Tasks y Play: Anatomía completa',
    ],
    realWorldCase: 'Un playbook instala nginx, copia la configuración y reinicia el servicio en cada ejecución, aunque no haya cambios. Con handlers, el reinicio solo ocurre si la configuración realmente cambió, evitando interrupciones innecesarias del servicio en producción.',
    quiz: [
      {
        question: '¿Cuándo se ejecutan los handlers en un playbook de Ansible?',
        options: [
          'Inmediatamente después de la tarea que los notifica',
          'Al final del play, después de que todas las tareas completan',
          'Solo si el playbook se ejecuta con --handlers',
          'Una vez por host, sin importar cuántas veces fueron notificados',
        ],
        correctIndex: 1,
        explanation: 'Los handlers se ejecutan al final del play, no inmediatamente cuando son notificados. Si un handler es notificado múltiples veces (por distintas tasks), se ejecuta una sola vez. Esto evita reinicios innecesarios cuando varios cambios disparan el mismo handler.',
      },
      {
        question: '¿Para qué sirve `meta: flush_handlers`?',
        options: [
          'Para eliminar todos los handlers definidos en el play',
          'Para ejecutar inmediatamente todos los handlers pendientes en ese punto del playbook',
          'Para listar todos los handlers que fueron notificados',
          'Para forzar que los handlers se ejecuten incluso si no fueron notificados',
        ],
        correctIndex: 1,
        explanation: '`meta: flush_handlers` fuerza la ejecución de todos los handlers pendientes en el punto donde se inserta, sin esperar al final del play. Es útil cuando necesitás que un servicio esté reiniciado antes de ejecutar las tareas siguientes (ej: reiniciar nginx antes de verificar que responde).',
      },
      {
        question: '¿Cuál es la ventaja de usar `listen` en un handler en lugar de notificarlo directamente por nombre?',
        options: [
          'Los handlers con listen se ejecutan más rápido',
          'Permite que múltiples handlers respondan a un mismo evento, desacoplando el nombre del handler del evento que lo dispara',
          'listen es obligatorio en Ansible 2.9+; notify por nombre está deprecated',
          'Con listen se pueden pasar argumentos al handler',
        ],
        correctIndex: 1,
        explanation: 'Con `listen`, un handler puede suscribirse a un "topic" en lugar de requerir que las tasks conozcan su nombre exacto. Múltiples handlers pueden escuchar el mismo topic, y una task notifica el topic sin saber qué handlers existen. Esto desacopla los handlers de las tasks que los disparan.',
      },
    ],
    troubleshooting: [
      {
        error: 'Handler "restart nginx" was not found',
        cause: 'El nombre en notify no coincide exactamente (case-sensitive) con el name: del handler. Un espacio de más o diferencia en mayúsculas es suficiente para que no se encuentre.',
        fix: 'Verificá que el string en notify: sea idéntico carácter por carácter al name: del handler. Ansible es case-sensitive. Considera usar listen: con un topic en minúsculas para evitar este problema.',
      },
      {
        error: 'El handler se ejecuta aunque la task no haya cambiado nada',
        cause: 'La task que tiene el notify reporta changed: true en cada ejecución aunque no haya modificado nada. Esto ocurre frecuentemente con los módulos command y shell.',
        fix: 'Agregá changed_when a la task para definir con precisión cuándo debe considerarse un cambio. Ej: `changed_when: result.stdout != ""`. Así el handler solo se dispara cuando realmente hubo una modificación.',
      },
      {
        error: 'Los handlers no se ejecutan cuando el playbook falla a mitad',
        cause: 'Si el play termina con un error no manejado, Ansible aborta antes de llegar a la sección de handlers. Los handlers pendientes se pierden.',
        fix: 'Usá `meta: flush_handlers` en puntos críticos del play para ejecutar los handlers antes de que puedan perderse. Para garantizar la ejecución ante fallos, considerá combinar con blocks y rescue.',
      },
    ],
  },
  {
    levelId: 5,
    moduleId: 4,
    title: 'Tags — Ejecución selectiva',
    objective: 'Usar tags para ejecutar o saltar partes específicas de un playbook.',
    duration: '1 hora',
    objectives: [
      'Asignar tags a tareas, plays y roles para ejecución selectiva',
      'Ejecutar solo tareas de configuración con --tags y saltar deploy con --skip-tags',
      'Usar los tags especiales always y never para tareas condicionales',
      'Listar todos los tags disponibles en un playbook con --list-tags',
    ],
    steps: [
      {
        title: 'Definir y usar tags',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbook-tags.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">- name: Deploy completo
  hosts: servidores_web
  tasks:
    - name: Instalar dependencias
      ansible.builtin.package:
        name: "{{ item }}"
        state: present
      loop: [nginx, curl, git]
      tags: [instalacion, dependencias]

    - name: Copiar configuración nginx
      ansible.builtin.template:
        src: nginx.conf.j2
        dest: /etc/nginx/nginx.conf
      tags: [configuracion, nginx]

    - name: Desplegar código
      ansible.builtin.git:
        repo: https://github.com/mi-org/app.git
        dest: /var/www/app
      tags: [deploy, codigo]

    - name: Reiniciar servicios
      ansible.builtin.service:
        name: "{{ item }}"
        state: restarted
      loop: [nginx, app]
      tags: [servicios, always]  # 'always' siempre se ejecuta</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">usar-tags.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Solo ejecutar tareas de configuración
ansible-playbook sitio.yml --tags configuracion

# Solo ejecutar tareas de instalación y configuración
ansible-playbook sitio.yml --tags "instalacion,configuracion"

# Saltar las tareas de deploy
ansible-playbook sitio.yml --skip-tags deploy

# Ver qué tareas tienen qué tags
ansible-playbook sitio.yml --list-tags

# Tags especiales: always (siempre corre) y never (nunca corre sin pedirlo)
ansible-playbook sitio.yml --tags never  # Solo corre las marcadas con 'never'</code></pre>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">Loops</div>
              <div class="next-chapter-desc">Iterás sobre listas y diccionarios para aplicar la misma tarea a múltiples elementos sin duplicar código.</div>
            </div>
          </div>
        `
      }
    ],
    prerequisites: [
      'Completar Módulo 3 del Nivel 5 — Handlers y Notify',
    ],
    realWorldCase: 'Un equipo ejecuta un playbook de deploy largo cada semana. Con tags, pueden correr solo --tags configuracion para aplicar cambios de configuración sin re-instalar paquetes, reduciendo el tiempo de ejecución de 20 minutos a 2 minutos.',
    quiz: [
      {
        question: '¿Qué hace el tag especial `always` cuando se asigna a una tarea?',
        options: [
          'La tarea siempre se ejecuta, incluso cuando se usa --skip-tags con ese tag',
          'La tarea se ejecuta siempre, sin importar qué tags se pasen con --tags o --skip-tags',
          'La tarea se marca como prioritaria y se ejecuta antes que las demás',
          'La tarea se ejecuta solo cuando no se especifica ningún --tags',
        ],
        correctIndex: 1,
        explanation: 'Una tarea marcada con el tag `always` se ejecuta siempre, independientemente de qué otros tags se filtren con --tags. La única excepción es si se usa explícitamente `--skip-tags always`. Es útil para tareas de limpieza o logging que deben correr en cualquier contexto.',
      },
      {
        question: '¿Cuál es el comando para listar todos los tags disponibles en un playbook sin ejecutarlo?',
        options: [
          'ansible-playbook sitio.yml --show-tags',
          'ansible-playbook sitio.yml --list-tags',
          'ansible-playbook sitio.yml --dry-run --tags',
          'ansible-tags sitio.yml',
        ],
        correctIndex: 1,
        explanation: '`ansible-playbook sitio.yml --list-tags` muestra todos los tags definidos en el playbook y en qué plays/tasks están, sin ejecutar nada. Es muy útil para descubrir qué tags existen antes de usar --tags en un playbook que no conocés.',
      },
      {
        question: '¿Qué hace el tag especial `never`?',
        options: [
          'La tarea nunca se ejecuta bajo ninguna circunstancia',
          'La tarea se salta siempre a menos que se llame explícitamente con --tags never',
          'La tarea falla silenciosamente sin reportar error',
          'La tarea se ejecuta solo si todas las demás fallan',
        ],
        correctIndex: 1,
        explanation: 'Una tarea con tag `never` se omite en ejecuciones normales y también cuando se usan --tags con otros nombres. Solo se ejecuta cuando se pide explícitamente con `--tags never`. Es ideal para tareas de debug, mantenimiento, o acciones destructivas que no deben correr accidentalmente.',
      },
    ],
    troubleshooting: [
      {
        error: 'Los tags definidos en un include_tasks no aparecen en --list-tags',
        cause: 'include_tasks es dinámico: el archivo incluido se carga en tiempo de ejecución, no en tiempo de carga. Por lo tanto, --list-tags no puede descubrir sus tags antes de ejecutar.',
        fix: 'Cambiá include_tasks por import_tasks para includes cuyo contenido es estático. Los imports son procesados en tiempo de carga y sus tags sí aparecen en --list-tags. Solo usá include_tasks cuando necesitás dinamismo (variables en el nombre del archivo o loops).',
      },
      {
        error: 'Al usar --tags con un tag, se ejecutan tareas de plays que no deberían correr',
        cause: 'Si un play completo tiene un tag asignado, ese tag aplica a todas sus tareas. Si una tarea tiene el mismo tag que el play, se ejecuta aunque no sea lo que esperabas filtrar.',
        fix: 'Revisá los tags asignados al nivel de play (tags: en el play mismo). Asegurate de que los tags de play sean suficientemente específicos (ej: produccion-web) y no colisionen con tags de tareas individuales.',
      },
      {
        error: 'El playbook con --tags solo ejecuta 1 tarea cuando debería ejecutar 5',
        cause: 'Solo las tareas que tienen exactamente ese tag asignado se ejecutan. Las tareas sin tag explícito no se incluyen en la selección.',
        fix: 'Para ejecutar varias tareas relacionadas, asignalas todas al mismo tag, o usá varios tags en el filtro: `--tags "instalacion,configuracion"`. También podés agrupar tareas en un block y asignar el tag al block.',
      },
    ],
  },
  {
    levelId: 5,
    moduleId: 5,
    title: 'Loops — Iteración de tareas',
    objective: 'Dominar todos los mecanismos de iteración de Ansible: loop, with_*, y loop_control.',
    duration: '2 horas',
    objectives: [
      'Iterar tareas sobre listas simples y listas de diccionarios con loop',
      'Personalizar la etiqueta de salida y el nombre de variable con loop_control',
      'Convertir diccionarios a listas iterables con el filtro dict2items',
      'Usar subelements para iterar sobre subestructuras anidadas',
    ],
    steps: [
      {
        title: 'Loop básico con listas',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">loops-basico.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  # Loop sobre lista simple
  - name: Instalar paquetes
    ansible.builtin.package:
      name: "{{ item }}"
      state: present
    loop:
      - nginx
      - curl
      - git
      - htop

  # Loop sobre lista de diccionarios
  - name: Crear usuarios
    ansible.builtin.user:
      name: "{{ item.name }}"
      shell: "{{ item.shell }}"
      groups: "{{ item.groups }}"
    loop:
      - { name: deploy, shell: /bin/bash, groups: sudo }
      - { name: monitor, shell: /bin/false, groups: "" }
      - { name: app, shell: /bin/bash, groups: www-data }

  # Loop con variable
  - name: Instalar paquetes desde variable
    ansible.builtin.package:
      name: "{{ item }}"
      state: present
    loop: "{{ paquetes_requeridos }}"
    vars:
      paquetes_requeridos:
        - nginx
        - postgresql
        - redis</code></pre>
          </div>
        `
      },
      {
        title: 'Loop control — personalizar la iteración',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">loop-control.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  - name: Procesar usuarios
    ansible.builtin.user:
      name: "{{ item.username }}"
      state: present
    loop: "{{ usuarios }}"
    loop_control:
      label: "{{ item.username }}"    # Texto en la salida en lugar del dict completo
      loop_var: usuario               # Cambiar 'item' por otro nombre
      index_var: idx                  # Variable con el índice actual (0, 1, 2...)
      pause: 2                        # Pausa en segundos entre iteraciones

  - name: Crear directorios indexados
    ansible.builtin.file:
      path: "/data/worker-{{ idx }}"
      state: directory
    loop: "{{ range(5) | list }}"
    loop_control:
      index_var: idx</code></pre>
          </div>
        `
      },
      {
        title: 'Filtros útiles con loops',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">loops-filtros.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  # dict2items: convertir diccionario a lista para iterar
  - name: Configurar variables de entorno
    ansible.builtin.lineinfile:
      path: /etc/environment
      line: "{{ item.key }}={{ item.value }}"
    loop: "{{ env_vars | dict2items }}"
    vars:
      env_vars:
        DATABASE_URL: postgresql://db1:5432/app
        REDIS_URL: redis://cache:6379

  # Loop sobre subelementos
  - name: Crear archivos de configuración por usuario
    ansible.builtin.copy:
      content: "{{ item.1 }}"
      dest: "/home/{{ item.0.name }}/.config"
    loop: "{{ usuarios | subelements('config_files') }}"</code></pre>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">Blocks, Rescue y Always</div>
              <div class="next-chapter-desc">Agrupás tareas y agregás manejo de errores con rollback automático usando el patrón try-catch-finally de Ansible.</div>
            </div>
          </div>
        `
      }
    ],
    prerequisites: [
      'Completar Módulo 4 del Nivel 5 — Tags: Ejecución selectiva',
    ],
    realWorldCase: 'Un playbook necesita crear 50 usuarios con sus directorios home y claves SSH. Sin loops, son 150 tareas repetidas. Con loop sobre una lista de diccionarios, son 3 tareas genéricas que se aplican a todos los usuarios, haciendo el playbook legible y mantenible.',
    quiz: [
      {
        question: '¿Cómo se itera sobre un diccionario (mapping YAML) usando loop?',
        options: [
          'loop: "{{ mi_dict }}" y se accede con item.key e item.value directamente',
          'loop: "{{ mi_dict | dict2items }}" y se accede con item.key e item.value',
          'with_dict: mi_dict (la única forma válida de iterar diccionarios)',
          'loop: "{{ mi_dict.items() }}" usando la sintaxis de Python',
        ],
        correctIndex: 1,
        explanation: 'El filtro Jinja2 `dict2items` convierte un diccionario en una lista de objetos {key, value} que loop puede iterar. Dentro del loop se accede con `item.key` e `item.value`. Es la forma moderna y recomendada desde Ansible 2.6 (reemplaza el antiguo with_dict).',
      },
      {
        question: '¿Para qué sirve `loop_control.label`?',
        options: [
          'Para asignar un nombre único a cada iteración del loop',
          'Para controlar cuántas iteraciones se ejecutan en paralelo',
          'Para personalizar el texto que aparece en la salida de Ansible en lugar de mostrar el item completo',
          'Para pausar el loop cuando el label coincide con una condición',
        ],
        correctIndex: 2,
        explanation: 'Cuando loop itera sobre diccionarios complejos, la salida muestra el objeto completo en cada tarea, haciendo la salida ilegible. `loop_control.label` permite definir qué mostrar, por ejemplo `label: "{{ item.name }}"` en lugar de todo el diccionario.',
      },
      {
        question: '¿Cuál es la variable especial que contiene el índice numérico de la iteración actual en un loop?',
        options: [
          'item.index',
          'loop.index',
          'La variable definida en loop_control.index_var',
          'ansible_loop_var',
        ],
        correctIndex: 2,
        explanation: 'Para acceder al índice de la iteración, debés declarar `loop_control: { index_var: idx }` y luego usar `{{ idx }}` en la tarea. No existe una variable automática de índice como en otros lenguajes; hay que habilitarla explícitamente con index_var.',
      },
    ],
    troubleshooting: [
      {
        error: '"loop" no está definido / "with_items" es deprecated',
        cause: 'El playbook usa `with_items` (sintaxis antigua de Ansible < 2.5) o intenta usar un `loop` vacío.',
        fix: 'Migrá de `with_items` a `loop`. Son equivalentes para listas simples: `loop: [a, b, c]`. Para loops anidados que usaban `with_nested`, usá el filtro `product` de Jinja2: `loop: "{{ lista1 | product(lista2) | list }}"`. Asegurate de que la variable del loop no sea null o vacía.',
      },
      {
        error: 'El loop sobre `include_tasks` falla con "loop variables are not supported in include_tasks"',
        cause: 'Se intentó usar loop con import_tasks en lugar de include_tasks. Los imports son estáticos y no soportan loops.',
        fix: 'Reemplazá import_tasks por include_tasks cuando necesitás usar loop. Los includes son dinámicos y sí soportan iteración. Si también necesitás que los tags del archivo incluido sean visibles, estructurá el contenido en un role en su lugar.',
      },
      {
        error: 'Conflicto de variable "item" cuando se anidan loops en roles',
        cause: 'Ansible usa `item` como nombre de variable de loop por defecto. Si un role interno también usa loop, ambos comparten la misma variable y se pisan.',
        fix: 'Usá `loop_control: { loop_var: mi_variable }` para renombrar la variable del loop en el contexto exterior o interior. Define nombres diferentes en cada nivel de anidamiento para evitar colisiones.',
      },
    ],
  },
  {
    levelId: 5,
    moduleId: 6,
    title: 'Blocks, Rescue y Always',
    objective: 'Usar blocks para agrupar tareas, rescue para manejo de errores, y always para limpieza garantizada.',
    duration: '1.5 horas',
    objectives: [
      'Agrupar tareas con block para aplicarles when, become y tags comunes',
      'Implementar rollback automático con rescue ante fallos en el deploy',
      'Garantizar limpieza de recursos con always independientemente del resultado',
      'Combinar block/rescue/always para un patrón completo de deploy seguro',
    ],
    steps: [
      {
        title: 'Blocks — agrupación de tareas',
        body: `
          <p>Un <code>block</code> agrupa varias tareas y permite aplicarles propiedades comunes: <code>when</code>, <code>become</code>, <code>tags</code>, <code>vars</code>. Es análogo a un bloque try-catch-finally.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">blocks-basico.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  - block:
      - name: Instalar dependencias de compilación
        ansible.builtin.package:
          name: [gcc, make, libssl-dev]
          state: present

      - name: Compilar desde fuente
        ansible.builtin.command:
          cmd: make install
          chdir: /tmp/app-src

      - name: Configurar servicio
        ansible.builtin.template:
          src: app.service.j2
          dest: /etc/systemd/system/app.service

    # Estas propiedades se aplican a TODAS las tareas del block
    when: compile_from_source | default(false)
    become: true
    tags: [instalacion, compilacion]
    vars:
      compilador: gcc</code></pre>
          </div>
        `
      },
      {
        title: 'Rescue — manejo de errores',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">blocks-rescue.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  - name: Deploy con rollback automático
    block:
      - name: Hacer backup de la versión actual
        ansible.builtin.copy:
          src: /var/www/app/
          dest: /var/www/app-backup/
          remote_src: true

      - name: Desplegar nueva versión
        ansible.builtin.git:
          repo: https://github.com/mi-org/app.git
          dest: /var/www/app
          version: "{{ deploy_version }}"

      - name: Migrar base de datos
        ansible.builtin.command:
          cmd: python manage.py migrate
          chdir: /var/www/app
        register: migration_result

    rescue:
      # Se ejecuta solo si el block falló
      - name: Revertir al backup (rollback)
        ansible.builtin.copy:
          src: /var/www/app-backup/
          dest: /var/www/app/
          remote_src: true

      - name: Notificar fallo
        ansible.builtin.debug:
          msg: "Deploy fallido, se revirtió a la versión anterior"

    always:
      # Se ejecuta SIEMPRE, sin importar si hubo error o no
      - name: Limpiar archivos temporales
        ansible.builtin.file:
          path: /tmp/deploy-*
          state: absent

      - name: Registrar resultado del deploy
        ansible.builtin.lineinfile:
          path: /var/log/deploys.log
          line: "{{ ansible_date_time.iso8601 }} - Deploy {{ deploy_version }}: {{ ansible_failed_task.name | default('SUCCESS') }}"</code></pre>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">Imports e Includes</div>
              <div class="next-chapter-desc">Dividís playbooks grandes en archivos reutilizables con import_tasks (estático) e include_tasks (dinámico).</div>
            </div>
          </div>
        `
      }
    ],
    prerequisites: [
      'Completar Módulo 5 del Nivel 5 — Loops: Iteración de tareas',
    ],
    realWorldCase: 'Un playbook de deploy falla a mitad cuando la migración de base de datos encuentra un error. Con block/rescue, Ansible ejecuta automáticamente el rollback al código anterior y registra el fallo, en lugar de dejar el servidor en un estado inconsistente.',
    quiz: [
      {
        question: '¿Cuándo se ejecuta la sección `rescue` de un block?',
        options: [
          'Siempre, al final de cada block',
          'Solo si alguna tarea dentro del block falla',
          'Solo si se especifica --rescue en la línea de comandos',
          'Cuando se usa `meta: trigger_rescue` dentro del block',
        ],
        correctIndex: 1,
        explanation: 'La sección `rescue` se ejecuta solo cuando una tarea dentro del `block` produce un error. Si todas las tareas del block tienen éxito, rescue se saltea completamente. Es el equivalente al bloque `catch` en lenguajes de programación.',
      },
      {
        question: '¿En qué se diferencia `always` de `rescue` en un block?',
        options: [
          'always se ejecuta si hubo éxito; rescue se ejecuta si hubo error',
          'always se ejecuta siempre (éxito o error); rescue se ejecuta solo si hubo error en el block',
          'Son equivalentes pero always tiene mayor prioridad',
          'always es para limpieza; rescue solo para notificaciones',
        ],
        correctIndex: 1,
        explanation: '`always` se ejecuta incondicionalmente, tanto si el block tuvo éxito como si falló. `rescue` se ejecuta solo en caso de error. Un block puede tener ambas secciones: rescue maneja el error y always garantiza la limpieza en cualquier caso (equivale a try-catch-finally).',
      },
      {
        question: '¿Qué propiedad aplicada a un block afecta a TODAS las tareas dentro de él?',
        options: [
          'Solo name: se propaga a las tareas hijas',
          'when:, become:, tags: y vars: aplicados al block se heredan por todas sus tareas',
          'Solo become: se propaga; when: debe repetirse en cada tarea',
          'Las propiedades no se propagan; cada tarea del block debe definir las suyas',
        ],
        correctIndex: 1,
        explanation: 'Un block actúa como un "apply a todas": when:, become:, become_user:, tags:, vars:, ignore_errors:, no_log: y environment: definidos en el block se aplican a cada tarea dentro de él. Esto elimina la repetición y es una de las principales ventajas de usar blocks.',
      },
    ],
    troubleshooting: [
      {
        error: 'Las tareas en rescue se ejecutan aunque el block haya tenido éxito',
        cause: 'Esto no debería ocurrir con el comportamiento correcto. Si sucede, probablemente hay un error de indentación y las tareas de rescue están en el nivel incorrecto del YAML.',
        fix: 'Verificá que block:, rescue: y always: estén al mismo nivel de indentación. Las tareas dentro de cada sección deben tener 2 espacios más que su sección. Usá `ansible-playbook --syntax-check` para detectar errores estructurales.',
      },
      {
        error: 'El play continúa como exitoso después de rescue, aunque el deploy falló',
        cause: 'Cuando rescue se ejecuta y completa sin error, Ansible considera el play como exitoso, aunque haya habido un fallo en el block original.',
        fix: 'Si querés que el play falle después del rescue (para que el CI/CD lo detecte), agregá una tarea en rescue que falle explícitamente: `ansible.builtin.fail: msg: "Deploy fallido, rollback ejecutado"` al final del bloque rescue.',
      },
      {
        error: 'La variable `ansible_failed_task` no está disponible en always',
        cause: '`ansible_failed_task` solo está disponible en el contexto de rescue. En always, si hubo éxito, esa variable no existe y acceder a ella causa un error.',
        fix: 'Usá el filtro default para manejar el caso en que la variable no exista: `{{ ansible_failed_task.name | default("ninguna") }}`. Así el template funciona tanto en el camino de éxito como en el de error.',
      },
    ],
  },
  {
    levelId: 5,
    moduleId: 7,
    title: 'Imports e Includes — Modularización de playbooks',
    objective: 'Entender las diferencias entre import_tasks e include_tasks y cuándo usar cada uno.',
    duration: '1.5 horas',
    objectives: [
      'Distinguir import_tasks (estático) de include_tasks (dinámico) y sus consecuencias',
      'Usar include_tasks con variables en el nombre del archivo para configuración condicional',
      'Aplicar loop en include_tasks para procesar múltiples archivos de tareas',
      'Elegir correctamente entre import e include según el uso de tags y condicionales',
    ],
    steps: [
      {
        title: 'Import vs Include — diferencias clave',
        body: `
          <p>Ansible tiene dos mecanismos para reutilizar tareas de otros archivos. La diferencia es cuándo se procesan:</p>
          <ul>
            <li><strong>import_*</strong>: estático, procesado en tiempo de carga del playbook. El contenido se incrusta antes de ejecutar. Los tags y el --list-tasks funcionan correctamente.</li>
            <li><strong>include_*</strong>: dinámico, procesado en tiempo de ejecución. Permite usar variables en el nombre del archivo. Soporta loops.</li>
          </ul>
        `
      },
      {
        title: 'import_tasks e include_tasks',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbook-modular.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">- name: Deploy completo
  hosts: servidores_web
  tasks:
    # IMPORT: estático, se carga antes de ejecutar
    # Los tags de install-packages.yml son visibles con --list-tags
    - name: Instalar paquetes
      ansible.builtin.import_tasks: tasks/install-packages.yml

    # INCLUDE: dinámico, se evalúa en ejecución
    # Permite usar variables en el nombre del archivo
    - name: Configurar para el ambiente
      ansible.builtin.include_tasks: "tasks/configure-{{ env }}.yml"

    # Include con variables
    - name: Configurar cada servicio
      ansible.builtin.include_tasks: tasks/configure-service.yml
      loop: "{{ servicios }}"
      vars:
        servicio: "{{ item }}"

    # Import de playbook completo (en el contexto del playbook principal)
    - name: Tareas de seguridad
      ansible.builtin.import_playbook: security-hardening.yml</code></pre>
          </div>
        `
      },
      {
        title: 'Cuándo usar cada uno',
        body: `
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Característica</th>
                <th>import_tasks (estático)</th>
                <th>include_tasks (dinámico)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Momento de procesamiento</td>
                <td>Tiempo de carga (antes de ejecutar)</td>
                <td>Tiempo de ejecución</td>
              </tr>
              <tr>
                <td>Variables en nombre de archivo</td>
                <td class="winner">No soporta</td>
                <td class="winner">Sí soporta</td>
              </tr>
              <tr>
                <td>Loop sobre el include</td>
                <td>No soporta</td>
                <td class="winner">Sí soporta</td>
              </tr>
              <tr>
                <td>Tags visibles en --list-tags</td>
                <td class="winner">Sí</td>
                <td>No (se cargan en ejecución)</td>
              </tr>
              <tr>
                <td>when: se aplica a</td>
                <td>Cada tarea individual</td>
                <td>El include completo</td>
              </tr>
              <tr>
                <td>Uso recomendado</td>
                <td>Organización estática, roles</td>
                <td>Condicionales dinámicos, loops</td>
              </tr>
            </tbody>
          </table>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">Nivel 6 — Variables</div>
              <div class="next-chapter-desc">Dominás todas las fuentes de variables de Ansible: tipos, variables registradas, facts, magic variables y su precedencia completa.</div>
            </div>
          </div>
        `
      }
    ],
    prerequisites: [
      'Completar Módulo 6 del Nivel 5 — Blocks, Rescue y Always',
    ],
    realWorldCase: 'Un equipo mantiene playbooks de 800 líneas que son imposibles de entender. Al refactorizar con import_tasks para tareas estáticas e include_tasks para configuraciones por ambiente (configure-prod.yml, configure-staging.yml), cada archivo tiene menos de 50 líneas y el playbook principal es un índice legible.',
    quiz: [
      {
        question: '¿Cuál es la diferencia fundamental entre import_tasks e include_tasks?',
        options: [
          'import_tasks carga archivos locales; include_tasks puede cargar archivos remotos',
          'import_tasks es procesado en tiempo de carga (estático); include_tasks es procesado en tiempo de ejecución (dinámico)',
          'import_tasks soporta loops; include_tasks no',
          'Son equivalentes en Ansible 2.8+; la diferencia existía solo en versiones anteriores',
        ],
        correctIndex: 1,
        explanation: 'import_tasks es estático: el contenido del archivo se incrusta en el playbook antes de ejecutarlo. include_tasks es dinámico: el archivo se carga y procesa en el momento en que se llega a esa línea durante la ejecución. Esto tiene consecuencias importantes en el comportamiento de tags, loops y condicionales.',
      },
      {
        question: '¿Por qué no se puede usar una variable en el nombre del archivo con import_tasks?',
        options: [
          'Es una limitación de seguridad: solo se permiten rutas hardcodeadas',
          'Porque import_tasks se procesa antes de la ejecución, cuando las variables de runtime aún no están disponibles',
          'Las variables sí funcionan con import_tasks siempre que estén en el inventario',
          'Solo funciona con variables de entorno del sistema, no con variables de Ansible',
        ],
        correctIndex: 1,
        explanation: 'import_tasks procesa el archivo en tiempo de carga, antes de cualquier ejecución. En ese momento, variables como `{{ env }}` (que puede valer "prod" o "staging") aún no están resueltas. Por eso se necesita include_tasks para rutas dinámicas: se evalúa en tiempo de ejecución cuando las variables ya tienen valor.',
      },
      {
        question: '¿Qué ocurre cuando se aplica `when:` a un import_tasks versus a un include_tasks?',
        options: [
          'El comportamiento es idéntico en ambos casos',
          'En import_tasks, when: se aplica a cada tarea individual dentro del archivo; en include_tasks, when: controla si el include completo se ejecuta',
          'En import_tasks, when: controla si el include se ejecuta; en include_tasks, se replica en cada tarea',
          'when: no funciona con include_tasks; debe definirse en cada tarea del archivo incluido',
        ],
        correctIndex: 1,
        explanation: 'Con import_tasks, Ansible agrega el when: a cada tarea del archivo importado individualmente (porque el contenido se incrusta). Con include_tasks, el when: determina si el include completo se ejecuta o se salta. La diferencia importa cuando las variables usadas en when: cambian durante la ejecución del play.',
      },
    ],
    troubleshooting: [
      {
        error: 'include_tasks con loop falla con "You cannot use include_tasks with loop in this context"',
        cause: 'Se intentó usar include_tasks con loop dentro de un block o de un contexto que no soporta includes dinámicos con iteración.',
        fix: 'Asegurate de que el include_tasks con loop esté directamente en la lista de tasks del play, no anidado dentro de un block en algunos contextos. Si el error persiste, reestructurá el loop para que itere dentro del archivo incluido en lugar de sobre el include.',
      },
      {
        error: 'Los tags del archivo importado con import_tasks no aparecen en --list-tags',
        cause: 'En realidad sí deberían aparecer. Si no aparecen, probablemente se está usando include_tasks en lugar de import_tasks.',
        fix: 'Verificá que el playbook use import_tasks y no include_tasks. Solo los imports son estáticos y sus tags son visibles en tiempo de carga. Comprobá también que los archivos importados efectivamente tengan tags: definidos en sus tareas.',
      },
      {
        error: 'import_playbook dentro de tasks: falla con "import_playbook is not a valid attribute"',
        cause: 'import_playbook debe usarse a nivel de playbook (en la lista raíz de plays), no dentro de la sección tasks: de un play.',
        fix: 'Mové import_playbook al nivel raíz del playbook, junto con los otros plays (al mismo nivel que `- name: Mi play`). Para incluir tareas dentro de un play, usá import_tasks o include_tasks en cambio.',
      },
    ],
  }
];
