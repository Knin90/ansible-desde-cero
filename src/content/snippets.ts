export interface Snippet {
  title: string;
  description: string;
  lang: 'yaml' | 'ini' | 'bash';
  code: string;
}

export interface SnippetCategory {
  id: string;
  icon: string;
  title: string;
  snippets: Snippet[];
}

export const SNIPPETS: SnippetCategory[] = [
  {
    id: 'paquetes',
    icon: '📦',
    title: 'Gestión de paquetes',
    snippets: [
      {
        title: 'Instalar paquete (multi-distro)',
        description: 'Usa ansible.builtin.package para soportar apt, dnf y yum automáticamente',
        lang: 'yaml',
        code: `- name: Instalar paquete (compatible con cualquier distro)
  ansible.builtin.package:
    name: nginx
    state: present
  become: true`,
      },
      {
        title: 'Instalar múltiples paquetes con loop',
        description: 'Instala una lista de paquetes de forma eficiente',
        lang: 'yaml',
        code: `- name: Instalar paquetes base del sistema
  ansible.builtin.package:
    name: "{{ item }}"
    state: present
  loop:
    - nginx
    - curl
    - git
    - vim
    - python3-pip
  become: true`,
      },
      {
        title: 'Actualizar todos los paquetes',
        description: 'Equivalente a apt upgrade o dnf update',
        lang: 'yaml',
        code: `- name: Actualizar todos los paquetes del sistema
  ansible.builtin.package:
    name: "*"
    state: latest
  become: true
  # CUIDADO: puede romper dependencias. Usá en staging primero.`,
      },
    ],
  },
  {
    id: 'archivos',
    icon: '📄',
    title: 'Archivos y directorios',
    snippets: [
      {
        title: 'Crear directorio con permisos',
        description: 'Crea un directorio recursivamente con propietario y permisos definidos',
        lang: 'yaml',
        code: `- name: Crear directorio de la aplicación
  ansible.builtin.file:
    path: /opt/mi-app
    state: directory
    owner: deploy
    group: deploy
    mode: '0755'
  become: true`,
      },
      {
        title: 'Copiar archivo con validación de checksum',
        description: 'Copia un archivo local al servidor remoto solo si es diferente',
        lang: 'yaml',
        code: `- name: Copiar archivo de configuración
  ansible.builtin.copy:
    src: files/nginx.conf
    dest: /etc/nginx/nginx.conf
    owner: root
    group: root
    mode: '0644'
    backup: true          # crea backup del archivo anterior
  become: true
  notify: Reload nginx`,
      },
      {
        title: 'Template con variables Jinja2',
        description: 'Genera archivos de configuración dinámicos desde plantillas',
        lang: 'yaml',
        code: `# En el playbook:
- name: Generar configuración desde template
  ansible.builtin.template:
    src: templates/app.conf.j2
    dest: /etc/mi-app/app.conf
    owner: root
    mode: '0640'
  become: true
  notify: Restart app

# En templates/app.conf.j2:
# server_name = {{ ansible_hostname }}
# port = {{ app_port | default(8080) }}
# debug = {{ app_debug | lower }}`,
      },
      {
        title: 'Agregar línea a un archivo',
        description: 'Inserta o modifica una línea específica de forma idempotente',
        lang: 'yaml',
        code: `- name: Agregar entrada a /etc/hosts
  ansible.builtin.lineinfile:
    path: /etc/hosts
    line: "192.168.1.10  db.internal"
    state: present
    backup: true
  become: true`,
      },
    ],
  },
  {
    id: 'servicios',
    icon: '⚙️',
    title: 'Servicios del sistema',
    snippets: [
      {
        title: 'Gestionar servicio + handler',
        description: 'Patrón completo: tarea que notifica + handler que reinicia',
        lang: 'yaml',
        code: `tasks:
  - name: Copiar configuración de nginx
    ansible.builtin.copy:
      src: files/nginx.conf
      dest: /etc/nginx/nginx.conf
    notify: Reload nginx        # notifica al handler

handlers:
  - name: Reload nginx          # el handler solo se ejecuta si hubo cambio
    ansible.builtin.service:
      name: nginx
      state: reloaded           # reloaded es más suave que restarted`,
      },
      {
        title: 'Iniciar, habilitar y verificar servicio',
        description: 'Asegura que el servicio está corriendo y configurado para arrancar con el sistema',
        lang: 'yaml',
        code: `- name: Asegurar que nginx está corriendo y habilitado
  ansible.builtin.service:
    name: nginx
    state: started    # started | stopped | restarted | reloaded
    enabled: true     # equivale a systemctl enable
  become: true`,
      },
    ],
  },
  {
    id: 'usuarios',
    icon: '👤',
    title: 'Usuarios y SSH',
    snippets: [
      {
        title: 'Crear usuario con clave SSH',
        description: 'Crea usuario, directorio .ssh y agrega clave pública autorizada',
        lang: 'yaml',
        code: `- name: Crear usuario de deploy
  ansible.builtin.user:
    name: deploy
    shell: /bin/bash
    create_home: true
    state: present
  become: true

- name: Agregar clave SSH al usuario deploy
  ansible.posix.authorized_key:
    user: deploy
    key: "{{ lookup('file', '~/.ssh/id_ed25519.pub') }}"
    state: present
  become: true`,
      },
      {
        title: 'Configurar sudo sin contraseña',
        description: 'Permite a un usuario ejecutar sudo sin contraseña (común para usuarios de Ansible)',
        lang: 'yaml',
        code: `- name: Configurar sudoers para usuario deploy
  ansible.builtin.lineinfile:
    path: /etc/sudoers.d/deploy
    line: "deploy ALL=(ALL) NOPASSWD:ALL"
    create: true
    mode: '0440'
    validate: 'visudo -cf %s'  # valida antes de escribir
  become: true`,
      },
    ],
  },
  {
    id: 'web',
    icon: '🌐',
    title: 'Servidor web',
    snippets: [
      {
        title: 'Deploy completo de Nginx',
        description: 'Instala, configura y arranca Nginx con virtual host',
        lang: 'yaml',
        code: `- name: Deploy servidor web Nginx
  hosts: webservers
  become: true
  vars:
    server_name: "mi-app.ejemplo.com"
    app_port: 3000

  tasks:
    - name: Instalar Nginx
      ansible.builtin.package:
        name: nginx
        state: present

    - name: Configurar virtual host
      ansible.builtin.template:
        src: templates/vhost.conf.j2
        dest: "/etc/nginx/sites-available/{{ server_name }}"
      notify: Reload Nginx

    - name: Habilitar virtual host
      ansible.builtin.file:
        src: "/etc/nginx/sites-available/{{ server_name }}"
        dest: "/etc/nginx/sites-enabled/{{ server_name }}"
        state: link

    - name: Asegurar que Nginx corre
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true

  handlers:
    - name: Reload Nginx
      ansible.builtin.service:
        name: nginx
        state: reloaded`,
      },
    ],
  },
  {
    id: 'condicionales',
    icon: '🔀',
    title: 'Lógica y condicionales',
    snippets: [
      {
        title: 'Condicional por distribución Linux',
        description: 'Ejecuta tareas diferentes según la distro del host',
        lang: 'yaml',
        code: `- name: Instalar dependencias (Ubuntu/Debian)
  ansible.builtin.apt:
    name: python3-pip
    state: present
  when: ansible_facts['os_family'] == 'Debian'

- name: Instalar dependencias (RHEL/Fedora)
  ansible.builtin.dnf:
    name: python3-pip
    state: present
  when: ansible_facts['os_family'] == 'RedHat'`,
      },
      {
        title: 'Registrar resultado y usar en condición',
        description: 'Captura la salida de una tarea y la usa en las siguientes',
        lang: 'yaml',
        code: `- name: Verificar si el servicio existe
  ansible.builtin.command: systemctl status mi-servicio
  register: servicio_status
  ignore_errors: true         # no fallar si el servicio no existe

- name: Instalar servicio si no existe
  ansible.builtin.package:
    name: mi-paquete
    state: present
  when: servicio_status.rc != 0   # rc=0 significa éxito`,
      },
      {
        title: 'Loop con diccionario de usuarios',
        description: 'Crea múltiples usuarios con diferentes configuraciones',
        lang: 'yaml',
        code: `- name: Crear usuarios del sistema
  ansible.builtin.user:
    name: "{{ item.name }}"
    shell: "{{ item.shell | default('/bin/bash') }}"
    groups: "{{ item.groups | default([]) }}"
    state: present
  loop:
    - { name: deploy, groups: ['sudo', 'docker'] }
    - { name: backup, shell: '/bin/sh', groups: [] }
    - { name: monitor, groups: ['sudo'] }
  become: true`,
      },
    ],
  },
];
