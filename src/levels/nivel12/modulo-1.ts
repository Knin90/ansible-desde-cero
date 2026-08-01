import type { ModuleContent } from '../types';

export const nivel12Mod1: ModuleContent =   {
levelId: 12,
moduleId: 1,
title: 'Estructura completa de un role',
objective: 'Dominar la estructura de directorios de un role de Ansible, entender la diferencia entre defaults y vars, y crear roles reutilizables y bien organizados.',
duration: '2.5 horas',
objectives: [
  'Conocer el propósito de cada directorio de un role: tasks, handlers, defaults, vars, files, templates, meta, tests',
  'Entender la diferencia de precedencia entre defaults/main.yml y vars/main.yml',
  'Usar include_tasks e import_tasks como puntos de entrada modulares en tasks/main.yml',
  'Llamar roles desde playbooks con roles:, include_role: e import_role:',
  'Pasar variables cuando se llama a un role para configurar su comportamiento',
],
prerequisites: [
  'Haber escrito playbooks con tareas, handlers y templates (Niveles 5-8)',
  'Conocer variables de Ansible y su precedencia (Nivel 4)',
  'Entender módulos file, template, service, package',
],
steps: [
  {
    title: 'La anatomía de un role',
    body: `
      <p>Un role es una unidad de reutilización en Ansible. Organiza todo lo relacionado con una responsabilidad (ej: "configurar nginx") en una estructura de directorios estándar que Ansible descubre automáticamente.</p>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Un role es como una receta de cocina completa: tiene la lista de ingredientes (defaults), las instrucciones paso a paso (tasks), las variaciones según el cocinero (vars), los utensilios necesarios (files/templates), y las notas del chef (meta). Podés compartir la receta con otros y ellos pueden seguirla exactamente o ajustar los ingredientes según su gusto.</p>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">estructura-role.sh</span></div>
        <pre class="language-yaml"><code class="language-yaml">roles/servidor_web/
├── tasks/
│   ├── main.yml        # ENTRADA: orquesta todas las tareas del role
│   ├── install.yml     # Subtareas de instalación
│   ├── configure.yml   # Subtareas de configuración
│   └── ssl.yml         # Subtareas de SSL (opcional)
│
├── handlers/
│   └── main.yml        # restart nginx, reload nginx, etc.
│
├── templates/
│   ├── nginx.conf.j2   # Template de configuración principal
│   ├── vhost.conf.j2   # Template de virtual host
│   └── ssl.conf.j2     # Template de SSL
│
├── files/
│   ├── nginx-logrotate  # Archivo estático (copiado sin procesar)
│   └── error-pages/     # Directorio de páginas de error
│       ├── 404.html
│       └── 500.html
│
├── vars/
│   └── main.yml        # Variables INTERNAS del role — alta prioridad
│
├── defaults/
│   └── main.yml        # Defaults del role — baja prioridad, sobrescribibles
│
├── meta/
│   └── main.yml        # Metadatos: autor, dependencias, plataformas
│
├── tests/
│   ├── inventory       # Inventario de test (ej: localhost)
│   └── test.yml        # Playbook de test mínimo
│
└── README.md           # Documentación para usuarios del role</code></pre>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Directorios opcionales:</strong> Solo <code>tasks/</code> es estrictamente necesario. Los demás son opcionales — Ansible los ignora si no existen. Creá solo los que tu role realmente necesite.
        </div>
      </div>
    `
  },
  {
    title: 'defaults vs vars — la diferencia de precedencia',
    body: `
      <p>Esta es la distinción más importante al diseñar roles. Defaults tienen la precedencia más baja de todas las variables — cualquier variable definida en otro lado las sobreescribe. Vars tienen precedencia muy alta.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/servidor_web/defaults/main.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# defaults/main.yml — valores que el USUARIO puede cambiar fácilmente
# Filosofía: "estos son los valores recomendados, pero podés ajustarlos"

nginx_port: 80
nginx_ssl_port: 443
nginx_worker_processes: "{{ ansible_processor_vcpus }}"
nginx_worker_connections: 1024
nginx_keepalive_timeout: 65
nginx_client_max_body_size: "1m"
nginx_gzip: true
nginx_sites: []          # Sin sites configurados por defecto
nginx_ssl_enabled: false # SSL desactivado por defecto
nginx_access_log: /var/log/nginx/access.log
nginx_error_log: /var/log/nginx/error.log</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/servidor_web/vars/main.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# vars/main.yml — valores INTERNOS que el role necesita para funcionar
# Filosofía: "el usuario del role NO debería cambiar esto"

# Nombre del servicio según distribución
nginx_service_name: >-
  {{ 'nginx' if ansible_os_family in ['Debian', 'RedHat'] else 'nginx' }}

# Directorio de configuración según distribución
nginx_conf_dir: >-
  {{ '/etc/nginx' if ansible_os_family != 'Alpine' else '/etc/nginx' }}

# Paths internos que el role usa en múltiples places
_nginx_pid_file: /var/run/nginx.pid
_nginx_sites_available: "{{ nginx_conf_dir }}/sites-available"
_nginx_sites_enabled: "{{ nginx_conf_dir }}/sites-enabled"</code></pre>
      </div>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>Precedencia de variables:</strong> La precedencia de menor a mayor es: defaults → group_vars → host_vars → vars → extra_vars. Las variables en <code>defaults/</code> son las más fáciles de sobreescribir (hasta desde group_vars). Las variables en <code>vars/</code> solo las sobreescriben extra_vars y variables de tarea.</div>
      </div>
    `
  },
  {
    title: 'tasks/main.yml — modularización con include_tasks e import_tasks',
    body: `
      <p>El archivo <code>tasks/main.yml</code> es el punto de entrada. Para roles medianos y grandes, es mejor delegar a subtareas organizadas por responsabilidad.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/servidor_web/tasks/main.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# tasks/main.yml — el director de orquesta del role

# import_tasks: se carga en tiempo de parseo (estático)
# Usar cuando el archivo siempre se ejecuta y no necesita condicionales
- name: Instalar nginx y dependencias
  ansible.builtin.import_tasks: install.yml

# include_tasks: se carga en tiempo de ejecución (dinámico)
# Usar cuando se necesita condicional o variable en el nombre del archivo
- name: Configurar nginx
  ansible.builtin.include_tasks: configure.yml

- name: Configurar SSL si está habilitado
  ansible.builtin.include_tasks: ssl.yml
  when: nginx_ssl_enabled</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/servidor_web/tasks/install.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Instalar nginx
  ansible.builtin.package:
name: nginx
state: present

- name: Crear directorio de sites-available
  ansible.builtin.file:
path: "{{ _nginx_sites_available }}"
state: directory
mode: '0755'

- name: Crear directorio de sites-enabled
  ansible.builtin.file:
path: "{{ _nginx_sites_enabled }}"
state: directory
mode: '0755'</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/servidor_web/tasks/configure.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Generar configuración principal de nginx
  ansible.builtin.template:
src: nginx.conf.j2
dest: "{{ nginx_conf_dir }}/nginx.conf"
owner: root
group: root
mode: '0644'
validate: nginx -t -c %s
  notify: Recargar nginx

- name: Configurar virtual hosts
  ansible.builtin.template:
src: vhost.conf.j2
dest: "{{ _nginx_sites_available }}/{{ item.nombre }}.conf"
owner: root
mode: '0644'
  loop: "{{ nginx_sites }}"
  notify: Recargar nginx

- name: Habilitar virtual hosts
  ansible.builtin.file:
src: "{{ _nginx_sites_available }}/{{ item.nombre }}.conf"
dest: "{{ _nginx_sites_enabled }}/{{ item.nombre }}.conf"
state: link
  loop: "{{ nginx_sites }}"
  notify: Recargar nginx

- name: Iniciar y habilitar nginx
  ansible.builtin.service:
name: "{{ nginx_service_name }}"
state: started
enabled: true</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>import_tasks vs include_tasks:</strong> <code>import_tasks</code> es estático — Ansible lo procesa al leer el playbook. <code>include_tasks</code> es dinámico — se procesa en ejecución. La diferencia importa cuando usás tags: con import, los tags del padre se propagan a las subtareas. Con include, no.</div>
      </div>
    `
  },
  {
    title: 'Handlers en roles y uso del role en playbooks',
    body: `
      <p>Los handlers de un role tienen scope limitado: solo las tareas del mismo role pueden notificarlos. Para usar el role en playbooks, hay tres formas.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/servidor_web/handlers/main.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Recargar nginx
  ansible.builtin.service:
name: "{{ nginx_service_name }}"
state: reloaded

- name: Reiniciar nginx
  ansible.builtin.service:
name: "{{ nginx_service_name }}"
state: restarted

- name: Validar configuración nginx
  ansible.builtin.command: nginx -t
  changed_when: false
  listen: Recargar nginx  # Este handler también se ejecuta cuando se notifica "Recargar nginx"</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">site.yml — tres formas de usar roles</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# Forma 1: roles: (estática, se ejecuta antes de tasks)
- name: Servidores web
  hosts: webservers
  roles:
- role: servidor_web
  vars:
    nginx_port: 8080
    nginx_ssl_enabled: true
    nginx_sites:
      - nombre: mi-app
        dominio: app.ejemplo.com
        backend: "localhost:3000"

# Forma 2: include_role (dinámica, inline en tasks)
- name: Configuración dinámica
  hosts: all
  tasks:
- name: Incluir role de webserver para distribuciones Debian
  ansible.builtin.include_role:
    name: servidor_web
  vars:
    nginx_port: 80
  when: ansible_os_family == "Debian"

# Forma 3: import_role (estática inline, permite tags y condicionales de parseo)
- name: Importar role de webserver
  ansible.builtin.import_role:
    name: servidor_web
  vars:
    nginx_port: 443</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>¿Cuándo usar roles: vs include_role?</strong> Usá <code>roles:</code> cuando el role siempre se aplica al play completo. Usá <code>include_role:</code> cuando la aplicación del role es condicional o depende de variables calculadas en tiempo de ejecución.</div>
      </div>
    `
  },
  {
    title: 'Laboratorio: crear el role "base_server"',
    body: `
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio</div>
        <div class="lab-content">
          <p><strong>Objetivo:</strong> Crear un role base_server que instale paquetes comunes, configure timezone y gestione el hostname.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">crear-role.sh</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Crear estructura de directorios
mkdir -p roles/base_server/{tasks,defaults,handlers,templates,files,meta}

# O usar ansible-galaxy para scaffolding:
ansible-galaxy role init roles/base_server</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/base_server/defaults/main.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
base_timezone: America/Buenos_Aires
base_paquetes_comunes:
  - vim
  - curl
  - wget
  - git
  - htop
  - jq
base_hostname: "{{ inventory_hostname }}"</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/base_server/tasks/main.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Instalar paquetes base
  ansible.builtin.package:
name: "{{ item }}"
state: present
  loop: "{{ base_paquetes_comunes }}"

- name: Configurar timezone
  community.general.timezone:
name: "{{ base_timezone }}"

- name: Configurar hostname
  ansible.builtin.hostname:
name: "{{ base_hostname }}"</code></pre>
          </div>
        </div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'role',
    definition: 'Unidad de reutilización en Ansible que organiza tareas, handlers, templates, archivos y variables relacionados en una estructura de directorios estándar. Permite compartir y reusar lógica de automatización.',
  },
  {
    term: 'defaults/main.yml',
    definition: 'Archivo de variables con la precedencia más baja del sistema de variables de Ansible. Define valores por defecto que cualquier usuario del role puede sobreescribir fácilmente desde group_vars, host_vars o la sección vars del play.',
  },
  {
    term: 'vars/main.yml',
    definition: 'Archivo de variables con alta precedencia en un role. Define valores internos que el role necesita y que generalmente no deben ser sobreescritos por los usuarios. Solo extra_vars tiene mayor precedencia.',
  },
  {
    term: 'import_tasks vs include_tasks',
    definition: 'import_tasks es estático: se procesa en tiempo de parseo, los tags se propagan, no acepta variables en el nombre. include_tasks es dinámico: se procesa en tiempo de ejecución, permite condicionales y variables en el nombre del archivo.',
  },
],
quiz: [
  {
    question: '¿Dónde deberías definir el puerto por defecto de nginx (80) en un role que otros equipos van a usar?',
    options: [
      'En vars/main.yml',
      'En defaults/main.yml',
      'En tasks/main.yml como variable local',
      'En el playbook que usa el role',
    ],
    correctIndex: 1,
    explanation: 'defaults/main.yml es para valores que los usuarios del role deben poder cambiar fácilmente. El puerto 80 es un default razonable pero diferentes equipos podrían necesitar 8080, 443, etc. Al ponerlo en defaults, se puede sobreescribir desde group_vars, host_vars o la sección vars del play sin modificar el role.',
  },
  {
    question: '¿Qué diferencia hay entre usar include_role: y poner el role en la sección roles:?',
    options: [
      'No hay diferencia funcional',
      'roles: ejecuta el role antes de las tasks del play; include_role: lo ejecuta en el orden en que aparece entre las tasks',
      'include_role: es más rápido',
      'roles: permite pasar variables; include_role: no',
    ],
    correctIndex: 1,
    explanation: 'La sección roles: se ejecuta ANTES de las tasks del play, independientemente del orden en que estén escritas. include_role: dentro de tasks: se ejecuta en el orden normal de las tareas. Esto es importante cuando necesitás que algunas tareas se ejecuten antes de aplicar el role.',
  },
  {
    question: '¿Cuándo usarías include_tasks en lugar de import_tasks en tasks/main.yml?',
    options: [
      'Siempre — include_tasks es más moderno',
      'Cuando querés aplicar tags a las subtareas',
      'Cuando la inclusión es condicional (when:) o el nombre del archivo depende de una variable',
      'include_tasks e import_tasks son equivalentes',
    ],
    correctIndex: 2,
    explanation: 'include_tasks es dinámico y se resuelve en tiempo de ejecución, lo que permite: nombres de archivo con variables (include_tasks: "{{ item }}.yml"), condicionales (when:) que se evalúan por host. import_tasks es estático y es mejor cuando siempre se ejecuta y querés que los tags del padre se propaguen.',
  },
],
troubleshooting: [
  {
    error: 'ERROR! the role "mi_role" was not found in /etc/ansible/roles',
    cause: 'Ansible no encuentra el role porque el directorio roles/ del proyecto no está en la ruta de búsqueda configurada.',
    fix: 'Configurá roles_path en ansible.cfg: [defaults] roles_path = ./roles:~/.ansible/roles. Alternativamente, colocá los roles en un directorio "roles" al mismo nivel que el playbook — Ansible lo busca automáticamente allí.',
  },
  {
    error: 'Handler "Recargar nginx" no se dispara aunque la tarea reportó changed',
    cause: 'El nombre en notify no coincide exactamente con el nombre del handler (diferencia de mayúsculas o espacios).',
    fix: 'Verificá que el texto en notify: sea exactamente igual al name: del handler, incluyendo mayúsculas y espacios. Los handlers en roles solo son accesibles desde el mismo role — si la tarea está en otro role, el handler no será encontrado.',
  },
  {
    error: 'Variables de defaults/ del role están siendo ignoradas — se usan valores de group_vars',
    cause: 'Este es el comportamiento esperado: defaults/ tiene la precedencia más baja. group_vars siempre sobreescribe defaults del role.',
    fix: 'Si el comportamiento es intencional (correcto). Si querés que el role use SUS valores sin que group_vars los pise, movelos a vars/ — pero documentá este comportamiento claramente para los usuarios del role.',
  },
],
realWorldCase: 'Una empresa con 15 equipos de desarrollo tenía 200 playbooks con tareas duplicadas para configurar servidores. Extrajeron la configuración común a roles base_server, nginx, postgresql y monitoring. Ahora cada equipo hereda las mejores prácticas automáticamente y los cambios de seguridad se aplican a todos actualizando un solo role.',
  };
