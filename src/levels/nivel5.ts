import type { ModuleContent } from './types';

export const nivel5Modules: ModuleContent[] = [
  {
    levelId: 5,
    moduleId: 1,
    title: 'Sintaxis YAML completa en contexto Ansible',
    objective: 'Dominar todos los aspectos de YAML que se usan en Ansible: tipos de datos, anclas, referencias, multilínea y errores comunes.',
    duration: '2 horas',
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
        `
      }
    ]
  },
  {
    levelId: 5,
    moduleId: 2,
    title: 'Tasks y Play — Anatomía completa',
    objective: 'Entender todos los campos disponibles en un play y en una task, y cómo interactúan entre sí.',
    duration: '2 horas',
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
        `
      }
    ]
  },
  {
    levelId: 5,
    moduleId: 3,
    title: 'Handlers y Notify',
    objective: 'Dominar los handlers y el mecanismo notify para ejecutar acciones solo cuando algo cambia.',
    duration: '1.5 horas',
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
        `
      }
    ]
  },
  {
    levelId: 5,
    moduleId: 4,
    title: 'Tags — Ejecución selectiva',
    objective: 'Usar tags para ejecutar o saltar partes específicas de un playbook.',
    duration: '1 hora',
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
        `
      }
    ]
  },
  {
    levelId: 5,
    moduleId: 5,
    title: 'Loops — Iteración de tareas',
    objective: 'Dominar todos los mecanismos de iteración de Ansible: loop, with_*, y loop_control.',
    duration: '2 horas',
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
        `
      }
    ]
  },
  {
    levelId: 5,
    moduleId: 6,
    title: 'Blocks, Rescue y Always',
    objective: 'Usar blocks para agrupar tareas, rescue para manejo de errores, y always para limpieza garantizada.',
    duration: '1.5 horas',
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
        `
      }
    ]
  },
  {
    levelId: 5,
    moduleId: 7,
    title: 'Imports e Includes — Modularización de playbooks',
    objective: 'Entender las diferencias entre import_tasks e include_tasks y cuándo usar cada uno.',
    duration: '1.5 horas',
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
        `
      }
    ]
  }
];
