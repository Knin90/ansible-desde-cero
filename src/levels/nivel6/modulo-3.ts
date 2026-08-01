import type { ModuleContent } from '../types';

export const nivel6Mod3: ModuleContent =   {
levelId: 6,
moduleId: 3,
title: 'Facts y Magic Variables',
objective: 'Dominar las magic variables de Ansible y saber cuándo y cómo usarlas para construir playbooks dinámicos.',
duration: '2 horas',
objectives: [
  'Conocer las magic variables más importantes: hostvars, groups, inventory_hostname, play_hosts',
  'Usar hostvars para referencias cruzadas entre hosts',
  'Acceder a facts del sistema en playbooks condicionales',
  'Distinguir inventory_hostname de ansible_hostname y saber cuándo usar cada uno',
],
prerequisites: [
  'Entender la estructura de inventario con grupos (Nivel 3)',
  'Haber usado variables en playbooks (Nivel 6, módulos anteriores)',
],
steps: [
  {
    title: 'Magic variables: las variables que siempre están disponibles',
    body: `
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Las magic variables son como las variables de entorno del sistema operativo (<code>$HOME</code>, <code>$PATH</code>): siempre están disponibles sin que tengas que definirlas. Ansible las inyecta automáticamente al inicio de cada play basándose en el inventario y el contexto de ejecución.</p>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">magic-variables.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Explorar magic variables
  hosts: all
  tasks:
- name: Variables de identidad del host
  ansible.builtin.debug:
    msg:
      - "inventory_hostname: {{ inventory_hostname }}"
      - "inventory_hostname_short: {{ inventory_hostname_short }}"
      - "ansible_hostname: {{ ansible_hostname }}"
      - "ansible_fqdn: {{ ansible_fqdn }}"

- name: Variables de grupos
  ansible.builtin.debug:
    msg:
      - "Grupos del host actual: {{ group_names }}"
      - "¿Está en producción?: {{ 'produccion' in group_names }}"
      - "Todos los hosts del grupo web: {{ groups['webservers'] | default([]) }}"
      - "Todos los hosts: {{ groups['all'] }}"

- name: Variables de play y ejecución
  ansible.builtin.debug:
    msg:
      - "Hosts activos en este play: {{ ansible_play_hosts }}"
      - "Hosts batch actual (serial): {{ ansible_play_batch }}"
      - "Nodo de control: {{ ansible_controller_host }}"

- name: Variables del entorno
  ansible.builtin.debug:
    msg:
      - "Usuario de conexión: {{ ansible_user }}"
      - "Puerto SSH: {{ ansible_port | default(22) }}"
      - "Directorio temporal: {{ ansible_remote_tmp }}"</code></pre>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>inventory_hostname vs ansible_hostname:</strong>
          <ul>
            <li><code>inventory_hostname</code> — el nombre tal como aparece en el inventario. Puede ser un alias, un FQDN, o una IP. SIEMPRE disponible, incluso si gather_facts está deshabilitado.</li>
            <li><code>ansible_hostname</code> — el hostname real que retorna el sistema operativo del host. Solo disponible después de gather_facts. Puede diferir si usás alias en el inventario.</li>
          </ul>
        </div>
      </div>
    `
  },
  {
    title: 'hostvars: referencias cruzadas entre hosts',
    body: `
      <p><code>hostvars</code> es un diccionario especial que contiene todas las variables de todos los hosts del inventario. Te permite acceder a la configuración de un host desde el contexto de otro host.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">hostvars-ejemplos.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# Inventario de ejemplo:
# [webservers]
# web1 ansible_host=10.0.1.10
# web2 ansible_host=10.0.1.11
#
# [databases]
# db1 ansible_host=10.0.2.10 db_port=5432

- name: Ejemplos de hostvars
  hosts: webservers
  tasks:
# Acceder a la IP de un host de base de datos desde los webservers
- name: Configurar conexión a base de datos
  ansible.builtin.template:
    src: app.conf.j2
    dest: /etc/mi-app/app.conf
  vars:
    db_host: "{{ hostvars['db1']['ansible_host'] }}"
    db_port: "{{ hostvars['db1']['db_port'] | default(5432) }}"

# Construir lista de IPs de todos los webservers (para balanceador)
- name: Obtener IPs de todos los webservers
  ansible.builtin.debug:
    msg: "IPs de webservers: {{ groups['webservers'] | map('extract', hostvars, 'ansible_default_ipv4') | map(attribute='address') | list }}"

# Condicional basado en variable de otro host
- name: Solo actuar si el db1 ya está configurado
  ansible.builtin.debug:
    msg: "DB lista"
  when: hostvars['db1']['db_configured'] | default(false) | bool

# Acceder a facts de otro host (requiere que ese host haya sido procesado antes)
- name: Verificar sistema operativo de db1
  ansible.builtin.debug:
    msg: "DB corre en: {{ hostvars['db1']['ansible_distribution'] | default('desconocido') }}"</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Precondición de hostvars con facts:</strong> Para que <code>hostvars['otro-host']['ansible_distribution']</code> funcione, el otro host debe haber ejecutado <code>gather_facts</code> en el mismo play o en un play anterior de la misma ejecución. Si el otro host no procesó gather_facts, ese fact no estará disponible en hostvars.</div>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Caso de uso clásico:</strong> Configurar nginx como balanceador de carga con las IPs reales de los backends. El play que configura nginx usa <code>hostvars</code> para obtener las IPs de los servidores de aplicación definidos en otro grupo del inventario.</div>
      </div>
    `
  },
  {
    title: 'Facts del sistema en playbooks condicionales',
    body: `
      <p>Los facts del sistema son variables especiales que Ansible recolecta automáticamente al inicio de cada play. Son la base para escribir playbooks que se adaptan al sistema operativo y hardware del host.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">facts-condicionales.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Playbook adaptativo con facts
  hosts: all
  tasks:
# Condicional por distribución
- name: Instalar herramientas de monitoreo (Debian)
  ansible.builtin.apt:
    name: [htop, iotop, nethogs]
    state: present
    update_cache: true
  when: ansible_os_family == "Debian"

- name: Instalar herramientas de monitoreo (RedHat)
  ansible.builtin.dnf:
    name: [htop, iotop]
    state: present
  when: ansible_os_family == "RedHat"

# Condicionar por versión mayor del OS
- name: Usar systemd en sistemas modernos
  ansible.builtin.systemd:
    name: nginx
    state: started
    enabled: true
  when: ansible_distribution_major_version | int >= 20

# Configuración adaptada al hardware
- name: Configurar workers según CPUs
  ansible.builtin.template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
  vars:
    worker_processes: "{{ ansible_processor_vcpus }}"
    worker_connections: "{{ [1024, (ansible_memtotal_mb / 2) | int] | max }}"

# Condicionar por arquitectura
- name: Descargar binario correcto según arquitectura
  ansible.builtin.get_url:
    url: "https://releases.example.com/app-{{ ansible_architecture }}.tar.gz"
    dest: /opt/app.tar.gz
  when: ansible_architecture in ['x86_64', 'aarch64']

# Detectar entorno virtualizado
- name: Optimización específica para VMs
  ansible.builtin.lineinfile:
    path: /etc/sysctl.conf
    line: "vm.swappiness = 10"
  when:
    - ansible_virtualization_type is defined
    - ansible_virtualization_role == "guest"</code></pre>
      </div>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>ansible_os_family vs ansible_distribution:</strong> <code>ansible_os_family</code> agrupa distribuciones relacionadas: "Debian" incluye Ubuntu y Debian; "RedHat" incluye CentOS, RHEL, Fedora, Rocky, AlmaLinux. Usá <code>ansible_os_family</code> para lógica por familia de distro, y <code>ansible_distribution</code> cuando necesitás distinguir entre Ubuntu y Debian específicamente.</div>
      </div>
    `
  }
],
quiz: [
  {
    question: '¿Cuál es la diferencia entre `inventory_hostname` y `ansible_hostname`?',
    options: [
      'Son exactamente iguales, son aliases del mismo valor',
      'inventory_hostname es el nombre en el inventario (siempre disponible); ansible_hostname es el hostname real del OS (requiere gather_facts)',
      'ansible_hostname es el FQDN completo; inventory_hostname es solo el nombre corto',
      'inventory_hostname solo existe cuando gather_facts está habilitado',
    ],
    correctIndex: 1,
    explanation: 'inventory_hostname es siempre el nombre exacto del host tal como aparece en el inventario (puede ser un alias o IP). ansible_hostname es un fact del sistema operativo (lo que retorna `hostname` en el host remoto). Si deshabilito gather_facts, ansible_hostname no estará disponible pero inventory_hostname sí.',
  },
  {
    question: '¿Para qué necesito que un host haya ejecutado gather_facts antes de acceder a sus facts via hostvars desde otro host?',
    options: [
      'No es necesario, hostvars siempre tiene todos los facts',
      'Solo es necesario para facts de red, no para otros facts',
      'Porque los facts solo se almacenan en hostvars cuando gather_facts los recolecta. Si no se ejecutó, las claves de facts no existen en hostvars',
      'Solo es necesario si se usa fact_caching',
    ],
    correctIndex: 2,
    explanation: 'hostvars contiene variables del inventario (host_vars, group_vars) incluso sin gather_facts. Pero los facts del sistema (ansible_distribution, ansible_default_ipv4, etc.) solo aparecen en hostvars si ese host ejecutó gather_facts en la misma ejecución o los tiene en el fact cache.',
  },
  {
    question: '¿Qué contiene `ansible_play_batch` y cuándo difiere de `ansible_play_hosts`?',
    options: [
      'Son siempre idénticos',
      'ansible_play_batch contiene solo los hosts fallidos; ansible_play_hosts contiene todos',
      'Cuando se usa `serial`, ansible_play_batch contiene solo los hosts del lote actual; ansible_play_hosts contiene todos los hosts activos del play',
      'ansible_play_batch incluye hosts de plays anteriores',
    ],
    correctIndex: 2,
    explanation: 'Con `serial: 3`, Ansible procesa los hosts de a 3. En cada ronda, ansible_play_batch tiene esos 3 hosts del lote actual, mientras que ansible_play_hosts tiene todos los hosts activos del play completo. Sin serial, ambos son iguales.',
  },
],
troubleshooting: [
  {
    error: 'hostvars[hostname] does not contain ansible_distribution',
    cause: 'El host referenciado en hostvars no ejecutó gather_facts en esta ejecución, o gather_facts está deshabilitado globalmente.',
    fix: 'Asegurate de que el host referenciado pertenezca a un play anterior que ejecutó gather_facts, o habilitá el fact cache (gathering = smart) para que los facts persistan entre ejecuciones.',
  },
  {
    error: 'groups[\'mi-grupo\'] no existe o retorna KeyError',
    cause: 'El grupo referenciado no está definido en el inventario, o está mal escrito.',
    fix: 'Usá `groups[\'mi-grupo\'] | default([])` para evitar el error si el grupo puede no existir. Verificá el nombre exacto del grupo con `ansible-inventory --list`.',
  },
  {
    error: 'ansible_default_ipv4 is undefined en un host',
    cause: 'El host no tiene una interfaz de red con ruta por defecto (gateway). Puede ocurrir en contenedores o hosts con configuración de red inusual.',
    fix: 'Usá `ansible_default_ipv4 | default({})` y luego `ansible_default_ipv4.address | default(ansible_all_ipv4_addresses[0] | default(\'127.0.0.1\'))` para un fallback robusto.',
  },
],
  };
