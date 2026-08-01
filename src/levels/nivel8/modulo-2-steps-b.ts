import type { StepContent } from '../types';

export const nivel8Mod2StepsB: StepContent[] = [
  {
    title: 'Gestión de archivos: file, copy, template y lineinfile',
    body: `
      <p>Estos son los módulos más usados en cualquier playbook. Cada uno tiene un caso de uso específico y todos son idempotentes.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">gestion-archivos.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Gestión de archivos
  hosts: all
  tasks:
# ansible.builtin.file — gestionar archivos, directorios y symlinks
- name: Crear directorio de la aplicación
  ansible.builtin.file:
    path: /opt/mi-app/data
    state: directory      # directory | file | link | absent | touch | hard
    owner: www-data
    group: www-data
    mode: '0750'
    recurse: true         # Aplica owner/group/mode recursivamente

- name: Crear symlink
  ansible.builtin.file:
    src: /opt/mi-app/current/bin/app
    dest: /usr/local/bin/app
    state: link

- name: Eliminar archivo
  ansible.builtin.file:
    path: /tmp/instalacion.lock
    state: absent

# ansible.builtin.copy — copiar archivos desde control node
- name: Copiar configuración
  ansible.builtin.copy:
    src: files/app.conf   # Relativo al playbook o roles/myrole/files/
    dest: /etc/mi-app/app.conf
    owner: root
    group: root
    mode: '0644'
    backup: true          # Crea backup antes de sobreescribir

- name: Copiar contenido inline (sin archivo fuente)
  ansible.builtin.copy:
    content: |
      [database]
      host={{ db_host }}
      port={{ db_port }}
    dest: /etc/mi-app/db.conf
    mode: '0600'

# ansible.builtin.template — Jinja2 → archivo en el host
- name: Generar configuración dinámica
  ansible.builtin.template:
    src: templates/nginx.conf.j2
    dest: /etc/nginx/nginx.conf
    owner: root
    mode: '0644'
    validate: '/usr/sbin/nginx -t -c %s'
  notify: Reload nginx

# ansible.builtin.lineinfile — agregar/modificar líneas en archivos
- name: Habilitar IP forwarding en sysctl
  ansible.builtin.lineinfile:
    path: /etc/sysctl.conf
    regexp: '^net.ipv4.ip_forward'    # Si existe, sobreescribirla
    line: 'net.ipv4.ip_forward = 1'   # Valor deseado
    state: present

# ansible.builtin.blockinfile — insertar bloque completo
- name: Agregar configuración de SSH
  ansible.builtin.blockinfile:
    path: /etc/ssh/sshd_config
    marker: "# {mark} ANSIBLE MANAGED BLOCK"
    block: |
      MaxAuthTries 3
      PermitRootLogin no
      PasswordAuthentication no</code></pre>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>¿Cuándo usar copy vs template?</strong>
          <ul>
            <li><code>copy</code> — cuando el archivo es estático y no necesita variables de Ansible</li>
            <li><code>template</code> — cuando el archivo tiene variables (<code>{{ }}</code>) que Ansible debe evaluar</li>
            <li><code>lineinfile</code> — cuando solo necesitás modificar una línea específica de un archivo existente</li>
            <li><code>blockinfile</code> — cuando necesitás insertar un bloque de texto que Ansible pueda identificar y actualizar</li>
          </ul>
        </div>
      </div>
    `
  },
  {
    title: 'Gestión de usuarios, grupos y cron',
    body: `
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">usuarios-grupos-cron.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Usuarios, grupos y cron
  hosts: all
  become: true
  tasks:
# ansible.builtin.group — gestión de grupos
- name: Crear grupo de aplicación
  ansible.builtin.group:
    name: appgroup
    gid: 1500
    state: present   # present | absent

# ansible.builtin.user — gestión de usuarios
- name: Crear usuario de deploy
  ansible.builtin.user:
    name: deploy
    uid: 1500
    group: appgroup          # Grupo primario
    groups:                  # Grupos secundarios
      - sudo
      - docker
    append: true             # No elimina grupos existentes
    shell: /bin/bash
    home: /home/deploy
    create_home: true
    comment: "Usuario de despliegue CI/CD"
    password_lock: false
    state: present

# Clave SSH para el usuario
- name: Agregar clave SSH para deploy
  ansible.posix.authorized_key:
    user: deploy
    key: "{{ lookup('file', 'files/deploy_key.pub') }}"
    state: present
    exclusive: false   # No elimina otras claves

# Eliminar usuario
- name: Eliminar usuario temporal
  ansible.builtin.user:
    name: temporal
    state: absent
    remove: true       # Elimina home y mail spool

# ansible.builtin.cron — gestión de cron jobs
- name: Backup de base de datos a las 2:30am
  ansible.builtin.cron:
    name: "Backup diario DB"   # Identificador único — clave para idempotencia
    minute: "30"
    hour: "2"
    day: "*"
    month: "*"
    weekday: "*"
    job: "/opt/scripts/backup_db.sh >> /var/log/backup.log 2>&1"
    user: deploy
    state: present

- name: Variable de entorno en crontab
  ansible.builtin.cron:
    name: PATH
    env: true               # Define variable de entorno en crontab
    value: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin"
    user: deploy

- name: Eliminar cron job obsoleto
  ansible.builtin.cron:
    name: "Tarea obsoleta"
    state: absent</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Idempotencia en cron:</strong> El campo <code>name</code> es el identificador único del cron job. Si cambiás la expresión de tiempo o el comando pero mantenés el mismo nombre, Ansible <em>actualizará</em> el cron existente. Si no ponés name, Ansible no puede identificar el cron y puede crear duplicados.</div>
      </div>
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio: idempotencia en práctica</div>
        <div class="lab-content">
          <p>Verificá la idempotencia ejecutando el playbook dos veces y comparando el output:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">test-idempotencia.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Primera ejecución — debería mostrar "changed" en las tareas
ansible-playbook usuarios-grupos-cron.yml

# Segunda ejecución — todas las tareas deberían ser "ok" (sin cambios)
ansible-playbook usuarios-grupos-cron.yml

# Si alguna tarea sigue mostrando "changed" en la segunda ejecución,
# hay un problema de idempotencia que debés investigar</code></pre>
          </div>
        </div>
      </div>
    `
  }
];
