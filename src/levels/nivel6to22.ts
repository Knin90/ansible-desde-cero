import type { ModuleContent } from './types';

function comingSoon(levelId: number, moduleId: number, title: string): ModuleContent {
  return {
    levelId,
    moduleId,
    title,
    objective: `Explorar ${title} en profundidad con ejemplos anotados y diagramas interactivos.`,
    steps: [
      {
        title: 'Contenido en desarrollo',
        body: `
          <div class="info-box">
            <span class="box-icon">📚</span>
            <div class="box-content"><strong>Contenido completo próximamente</strong> — este módulo está en desarrollo activo. La estructura y navegación ya están disponibles.</div>
          </div>
        `
      }
    ]
  };
}

export const nivel6Modules: ModuleContent[] = [
  {
    levelId: 6,
    moduleId: 1,
    title: 'Tipos de variables en Ansible',
    objective: 'Entender todos los tipos y fuentes de variables disponibles en Ansible.',
    duration: '1.5 horas',
    steps: [
      {
        title: 'Fuentes de variables',
        body: `
          <p>Ansible tiene más de 20 fuentes distintas donde se pueden definir variables. Conocer todas es esencial para entender por qué una variable tiene el valor que tiene cuando corrés un playbook.</p>
          <p>Las principales fuentes son: variables de inventario, group_vars, host_vars, variables de play, variables de rol (defaults y vars), variables de tarea, facts recolectados, variables registradas, y extra-vars pasadas con <code>-e</code>.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">tipos-variables.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">- name: Demo de tipos de variables
  hosts: all
  vars:                              # Variables de play
    app_name: mi-app
    version: "2.1.0"

  vars_files:                        # Variables desde archivo
    - vars/comunes.yml

  tasks:
    - name: Variable registrada
      ansible.builtin.command: hostname
      register: hostname_result       # Registra el resultado

    - name: Usar variable registrada
      ansible.builtin.debug:
        msg: "El hostname es: {{ hostname_result.stdout }}"

    - name: Definir variable en tarea
      ansible.builtin.set_fact:       # Variable persistente
        ip_publica: "{{ ansible_default_ipv4.address }}"

    - name: Variable de entorno del host
      ansible.builtin.debug:
        msg: "PATH: {{ ansible_env.PATH }}"</code></pre>
          </div>
        `
      },
      {
        title: 'Variables especiales (magic variables)',
        body: `
          <p>Ansible inyecta automáticamente algunas variables especiales que siempre están disponibles:</p>
          <ul>
            <li><code>inventory_hostname</code> — nombre del host tal como aparece en el inventario</li>
            <li><code>ansible_hostname</code> — hostname real del host (fact)</li>
            <li><code>hostvars</code> — dict con variables de TODOS los hosts</li>
            <li><code>groups</code> — dict con todos los grupos y sus hosts</li>
            <li><code>group_names</code> — lista de grupos a los que pertenece el host actual</li>
            <li><code>play_hosts</code> — lista de hosts activos en el play actual</li>
            <li><code>ansible_play_batch</code> — hosts en el batch actual (con serial)</li>
          </ul>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">magic-vars.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">- name: Usar magic variables
  hosts: servidores_web
  tasks:
    - name: Ver IP de db1 desde web1
      ansible.builtin.debug:
        msg: "{{ hostvars['db1.empresa.com']['ansible_default_ipv4']['address'] }}"

    - name: Ver grupos del host actual
      ansible.builtin.debug:
        msg: "Grupos: {{ group_names | join(', ') }}"</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Tip:</strong> <code>hostvars</code> te permite acceder a variables de un host desde el contexto de otro host. Esto es útil para configurar nginx con las IPs reales de los backends.</div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 6,
    moduleId: 2,
    title: 'Variables registradas',
    objective: 'Usar register para capturar el resultado de tareas y usarlo en tareas posteriores.',
    duration: '1 hora',
    steps: [
      {
        title: 'Estructura de una variable registrada',
        body: `
          <p>Cuando usás <code>register: nombre</code> en una tarea, Ansible guarda el resultado completo del módulo en esa variable. La estructura varía por módulo, pero hay campos comunes.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">variables-registradas.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  - name: Ejecutar comando y capturar salida
    ansible.builtin.command:
      cmd: "cat /etc/os-release"
    register: os_info

  - name: Usar la salida capturada
    ansible.builtin.debug:
      msg:
        - "Salida stdout: {{ os_info.stdout }}"
        - "Código de salida: {{ os_info.rc }}"
        - "¿Hubo cambios?: {{ os_info.changed }}"
        - "¿Falló?: {{ os_info.failed }}"

  - name: Verificar si un servicio existe
    ansible.builtin.shell: "systemctl is-active nginx"
    register: nginx_status
    ignore_errors: true

  - name: Instalar nginx si no está activo
    ansible.builtin.package:
      name: nginx
      state: present
    when: nginx_status.rc != 0</code></pre>
          </div>
        `
      },
      {
        title: 'Campos comunes en variables registradas',
        body: `
          <table class="comparison-table">
            <thead><tr><th>Campo</th><th>Descripción</th><th>Módulos</th></tr></thead>
            <tbody>
              <tr><td><code>changed</code></td><td>¿La tarea realizó cambios?</td><td>Todos</td></tr>
              <tr><td><code>failed</code></td><td>¿La tarea falló?</td><td>Todos</td></tr>
              <tr><td><code>msg</code></td><td>Mensaje descriptivo</td><td>Todos</td></tr>
              <tr><td><code>stdout</code></td><td>Salida estándar</td><td>command, shell</td></tr>
              <tr><td><code>stderr</code></td><td>Salida de error</td><td>command, shell</td></tr>
              <tr><td><code>rc</code></td><td>Código de retorno</td><td>command, shell</td></tr>
              <tr><td><code>stdout_lines</code></td><td>stdout como lista de líneas</td><td>command, shell</td></tr>
              <tr><td><code>results</code></td><td>Lista de resultados cuando se usa loop</td><td>Todos con loop</td></tr>
            </tbody>
          </table>
        `
      }
    ]
  },
  {
    levelId: 6,
    moduleId: 3,
    title: 'Facts y Magic Variables',
    objective: 'Entender los facts recolectados automáticamente y las variables mágicas inyectadas por Ansible.',
    duration: '1.5 horas',
    steps: [
      {
        title: 'Qué son los facts',
        body: `
          <p>Los facts son información sobre el host remoto recolectada automáticamente por el módulo <code>setup</code> cuando <code>gather_facts: true</code>. Hay cientos de facts disponibles.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ver-facts.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Ver todos los facts de un host
ansible web1 -m setup

# Filtrar facts específicos
ansible web1 -m setup -a "filter=ansible_distribution*"
ansible web1 -m setup -a "filter=ansible_memory_mb"
ansible web1 -m setup -a "filter=ansible_interfaces"

# Facts más usados:
# ansible_os_family: "Debian" o "RedHat"
# ansible_distribution: "Ubuntu", "CentOS", etc.
# ansible_distribution_major_version: "22", "8"
# ansible_default_ipv4.address: IP principal
# ansible_memtotal_mb: RAM total en MB
# ansible_processor_vcpus: número de CPUs virtuales
# ansible_hostname: nombre del host
# ansible_fqdn: nombre completo (FQDN)</code></pre>
          </div>
        `
      },
      {
        title: 'Usar facts en playbooks',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">usar-facts.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  - name: Instalar paquete según distribución
    ansible.builtin.package:
      name: "{{ 'nginx' if ansible_os_family == 'Debian' else 'nginx' }}"
      state: present

  - name: Configurar workers según CPUs disponibles
    ansible.builtin.template:
      src: nginx.conf.j2
      dest: /etc/nginx/nginx.conf
    vars:
      worker_processes: "{{ ansible_processor_vcpus }}"

  - name: Usar IP del host en configuración
    ansible.builtin.template:
      src: app.conf.j2
      dest: /etc/app/config.yml
    vars:
      bind_address: "{{ ansible_default_ipv4.address }}"</code></pre>
          </div>
        `
      }
    ]
  },
  {
    levelId: 6,
    moduleId: 4,
    title: 'Precedencia completa de variables',
    objective: 'Dominar el orden completo de precedencia de las 22 fuentes de variables de Ansible.',
    duration: '1.5 horas',
    steps: [
      {
        title: 'Orden completo de precedencia (menor a mayor)',
        body: `
          <p>Cuando la misma variable existe en múltiples lugares, Ansible aplica un orden estricto de precedencia. El valor con mayor precedencia siempre gana.</p>
          <ol>
            <li>command line values (por ejemplo, -u user → no realmente una variable pero aplica el mismo principio)</li>
            <li>role defaults (roles/myrole/defaults/main.yml)</li>
            <li>inventory file or script group vars</li>
            <li>inventory group_vars/all</li>
            <li>playbook group_vars/all</li>
            <li>inventory group_vars/*</li>
            <li>playbook group_vars/*</li>
            <li>inventory file or script host vars</li>
            <li>inventory host_vars/*</li>
            <li>playbook host_vars/*</li>
            <li>host facts / cached set_facts</li>
            <li>play vars</li>
            <li>play vars_prompt</li>
            <li>play vars_files</li>
            <li>role vars (roles/myrole/vars/main.yml)</li>
            <li>block vars</li>
            <li>task vars</li>
            <li>include_vars</li>
            <li>set_facts / registered vars</li>
            <li>role (and include_role) params</li>
            <li>include params</li>
            <li><strong>extra vars (-e) — SIEMPRE gana</strong></li>
          </ol>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Regla práctica:</strong> defaults de rol para defaults que se pueden sobreescribir fácilmente. vars de rol para valores que el rol necesita y no deben sobreescribirse. group_vars/all para defaults globales del proyecto. -e solo para override de emergencia.</div>
          </div>
        `
      }
    ]
  }
];

export const nivel7Modules: ModuleContent[] = [
  {
    levelId: 7,
    moduleId: 1,
    title: 'Módulo setup — Recolección de facts',
    objective: 'Usar el módulo setup para recolectar y filtrar información del sistema.',
    duration: '1 hora',
    steps: [
      {
        title: 'El módulo setup en detalle',
        body: `
          <p>El módulo <code>setup</code> recolecta información del sistema remoto y la pone disponible como variables (facts). Se ejecuta automáticamente al inicio de cada play cuando <code>gather_facts: true</code>.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">setup-module.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">- name: Recolectar facts manualmente
  hosts: all
  gather_facts: false    # Deshabilitar recolección automática
  tasks:
    - name: Recolectar solo facts de red (más rápido)
      ansible.builtin.setup:
        filter: ansible_default_ipv4

    - name: Recolectar facts específicos
      ansible.builtin.setup:
        filter:
          - ansible_distribution*
          - ansible_memory_mb
          - ansible_processor*

    - name: Recolectar facts de un subconjunto
      ansible.builtin.setup:
        gather_subset:
          - network
          - hardware
          - '!all'     # Excluir todos los demás</code></pre>
          </div>
        `
      },
      {
        title: 'Facts de red y hardware más usados',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">facts-utiles.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Facts de red
ansible_default_ipv4.address      # IP principal
ansible_default_ipv4.gateway      # Gateway por defecto
ansible_all_ipv4_addresses        # Todas las IPs IPv4
ansible_interfaces                 # Lista de interfaces

# Facts de sistema operativo
ansible_distribution               # Ubuntu, CentOS, Debian
ansible_distribution_version       # 22.04, 8.5
ansible_os_family                  # Debian, RedHat, Suse
ansible_architecture               # x86_64, aarch64

# Facts de hardware
ansible_processor_vcpus            # CPUs virtuales
ansible_memtotal_mb                # RAM total
ansible_mounts                     # Puntos de montaje
ansible_devices                    # Dispositivos de bloque</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Performance:</strong> deshabilitar gather_facts o usar gather_subset reducción significativa del tiempo de inicio de un playbook. En flotas de 1000+ hosts, esto puede ahorrar minutos.</div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 7,
    moduleId: 2,
    title: 'Custom Facts',
    objective: 'Crear facts personalizados en los hosts administrados para exponer información propia de la aplicación o del entorno.',
    duration: '1 hora',
    steps: [
      {
        title: 'Qué son los custom facts y cómo se crean',
        body: `
          <p>Los custom facts son archivos colocados en <code>/etc/ansible/facts.d/</code> del host administrado. Ansible los recolecta automáticamente durante la fase de gather_facts y los expone bajo la variable <code>ansible_local</code>.</p>
          <p>Pueden ser archivos <code>.ini</code>, <code>.json</code>, o scripts ejecutables que devuelvan JSON por stdout. El nombre del archivo (sin extensión) se convierte en la clave bajo <code>ansible_local</code>.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">json</span><span class="code-block-filename">/etc/ansible/facts.d/app.json</span></div>
            <pre class="language-yaml"><code class="language-yaml">{
  "version": "2.1",
  "env": "prod",
  "db_host": "db.empresa.com",
  "max_connections": 100
}</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">usar-custom-facts.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  - name: Usar custom fact de versión de la app
    ansible.builtin.debug:
      msg: "Versión: {{ ansible_local.app.version }} en {{ ansible_local.app.env }}"

  - name: Condicional basado en custom fact
    ansible.builtin.debug:
      msg: "Entorno de producción detectado"
    when: ansible_local.app.env == "prod"</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Tip:</strong> Los custom facts permiten que los hosts se "auto-describan". Útil para exponer versiones de aplicaciones instaladas, configuraciones de entorno, o cualquier metadata que los playbooks deban consumir.</div>
          </div>
        `
      },
      {
        title: 'Desplegar custom facts con Ansible',
        body: `
          <p>El propio Ansible puede encargarse de crear el directorio y copiar el archivo de facts al host. Después de copiar, hay que re-recolectar los facts para que el valor esté disponible en el mismo play.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">deploy-custom-facts.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">- name: Desplegar custom facts
  hosts: all
  become: true
  tasks:
    - name: Crear directorio de facts
      ansible.builtin.file:
        path: /etc/ansible/facts.d
        state: directory
        mode: '0755'

    - name: Copiar fact de la aplicación
      ansible.builtin.copy:
        content: |
          {
            "version": "{{ app_version }}",
            "env": "{{ environment }}",
            "deploy_date": "{{ ansible_date_time.iso8601 }}"
          }
        dest: /etc/ansible/facts.d/app.json
        mode: '0644'

    - name: Re-recolectar facts para incluir los nuevos
      ansible.builtin.setup:      # Vuelve a ejecutar gather_facts
        filter: ansible_local     # Solo re-recolecta los facts locales

    - name: Verificar que el fact está disponible
      ansible.builtin.debug:
        msg: "App v{{ ansible_local.app.version }} en {{ ansible_local.app.env }}"</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Importante:</strong> Si copiás el archivo de fact y luego intentás usarlo en el mismo play <em>sin</em> el paso de re-recolección (<code>ansible.builtin.setup</code>), <code>ansible_local</code> todavía tendrá el valor viejo. Siempre re-ejecutá setup después de modificar facts.</div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 7,
    moduleId: 3,
    title: 'Fact Cache',
    objective: 'Configurar el caché de facts para acelerar playbooks evitando la recolección repetida en cada ejecución.',
    duration: '1 hora',
    steps: [
      {
        title: 'Por qué y cómo configurar el fact cache',
        body: `
          <p>La recolección de facts (<code>gather_facts</code>) añade 1-3 segundos por host. En flotas de 100+ hosts, ese tiempo suma. El fact cache guarda los facts en disco (o Redis/memcached) y los reutiliza si no han expirado.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
            <pre class="language-yaml"><code class="language-yaml">[defaults]
# "smart" solo recolecta facts si no están en caché o si expiraron
gathering = smart

# Backend de caché: jsonfile (simple), redis, memcached
fact_caching = jsonfile

# Directorio donde se guardan los facts (un archivo JSON por host)
fact_caching_connection = /tmp/ansible_facts_cache

# Tiempo de expiración en segundos (86400 = 24 horas)
fact_caching_timeout = 86400</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>gathering = smart:</strong> Con este valor, Ansible recolecta facts solo si el host no tiene facts válidos en caché. Si los facts están en caché y no expiraron, los usa directamente sin conectarse a recolectarlos.</div>
          </div>
        `
      },
      {
        title: 'Backends de caché y operaciones de invalidación',
        body: `
          <p>El backend <code>jsonfile</code> es suficiente para un control node único. Para entornos distribuidos o CI/CD con múltiples runners, usá <code>redis</code> o <code>memcached</code>.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg — backend Redis</span></div>
            <pre class="language-yaml"><code class="language-yaml">[defaults]
gathering = smart
fact_caching = redis
fact_caching_connection = redis://localhost:6379/0
fact_caching_timeout = 86400</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">invalidar-cache.sh</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Forzar re-recolección de facts (ignorar caché) para todos los hosts
ansible-playbook site.yml --flush-cache

# Forzar solo para un host específico
ansible web1 -m setup --flush-cache

# Forzar re-recolección en un play específico
# (gathering: smart ignora el caché si el host no está en él)
# Para forzar siempre, usar gathering: always en el play</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Cuidado:</strong> Con <code>gathering = smart</code> y caché habilitado, si un host cambia de hardware o distribución, el fact cacheado puede estar desactualizado. Usá <code>--flush-cache</code> después de cambios de infraestructura importantes o ajustá <code>fact_caching_timeout</code> a un valor más corto.</div>
          </div>
        `
      }
    ]
  },
];

export const nivel8Modules: ModuleContent[] = [
  {
    levelId: 8,
    moduleId: 1,
    title: 'Cómo funcionan los módulos',
    objective: 'Entender el ciclo de vida de un módulo Ansible: transferencia, ejecución y retorno de resultados.',
    duration: '1.5 horas',
    steps: [
      {
        title: 'Ciclo de vida de un módulo',
        body: `
          <p>Un módulo de Ansible es un script Python (o PowerShell para Windows) que se transfiere al host remoto, se ejecuta, y devuelve un JSON con el resultado. Todo esto ocurre a través de SSH.</p>
          <ol>
            <li>Ansible localiza el archivo Python del módulo en el nodo de control</li>
            <li>Serializa los argumentos del módulo a JSON</li>
            <li>Transfiere el módulo al host remoto (por defecto a /tmp)</li>
            <li>Python ejecuta el módulo en el host remoto</li>
            <li>El módulo imprime JSON en stdout y sale</li>
            <li>Ansible lee el JSON, interpreta el resultado, y borra el módulo del host</li>
          </ol>
        `
      },
      {
        title: 'Idempotencia — el principio fundamental',
        body: `
          <p>Un módulo idempotente produce el mismo resultado si se ejecuta una vez o cien veces. Si el estado ya es el deseado, no hace nada y reporta <code>changed: false</code>.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">idempotencia.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  # IDEMPOTENTE: verifica si nginx está instalado antes de instalarlo
  - name: Instalar nginx
    ansible.builtin.package:
      name: nginx
      state: present     # "asegurar que exista", no "instalar"

  # IDEMPOTENTE: crea el directorio solo si no existe
  - name: Crear directorio de configuración
    ansible.builtin.file:
      path: /etc/mi-app
      state: directory
      mode: '0755'

  # NO IDEMPOTENTE: el comando siempre reporta changed
  - name: Esto SIEMPRE reporta changed (evitar)
    ansible.builtin.command: echo "hola"

  # Solución: usar changed_when: false si el cambio no importa
  - name: Comando idempotente artificialmente
    ansible.builtin.command: echo "hola"
    changed_when: false</code></pre>
          </div>
        `
      }
    ]
  },
  {
    levelId: 8,
    moduleId: 2,
    title: 'Módulos de sistema',
    objective: 'Conocer los módulos built-in más importantes para gestionar paquetes, servicios, archivos, usuarios y tareas programadas.',
    duration: '2 horas',
    steps: [
      {
        title: 'Gestión de paquetes, servicios y archivos',
        body: `
          <p>Estos son los módulos que usarás en casi cualquier playbook. Todos son idempotentes: verifican el estado actual antes de actuar.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">modulos-sistema.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  # Gestión de paquetes (multiplataforma)
  - name: Instalar nginx
    ansible.builtin.package:       # Usa apt/dnf/yum según la distro
      name: nginx
      state: present               # present | absent | latest

  # Solo en Debian/Ubuntu
  - name: Instalar paquetes con apt
    ansible.builtin.apt:
      name: [nginx, curl, git]
      state: present
      update_cache: true           # Equivale a apt-get update

  # Solo en RedHat/CentOS/Fedora
  - name: Instalar paquetes con dnf
    ansible.builtin.dnf:
      name: nginx
      state: present

  # Gestión de servicios
  - name: Habilitar e iniciar nginx
    ansible.builtin.service:
      name: nginx
      state: started               # started | stopped | restarted | reloaded
      enabled: true                # Habilitar en arranque del sistema

  # Gestión de archivos y directorios
  - name: Crear directorio con permisos
    ansible.builtin.file:
      path: /opt/mi-app/data
      state: directory             # directory | file | link | absent | touch
      owner: www-data
      group: www-data
      mode: '0750'

  # Copiar archivo al host remoto
  - name: Copiar configuración
    ansible.builtin.copy:
      src: files/app.conf          # Relativo al playbook o rol
      dest: /etc/mi-app/app.conf
      owner: root
      group: root
      mode: '0644'
      backup: true                 # Guarda backup si el archivo ya existe

  # Desplegar template Jinja2
  - name: Generar configuración dinámica
    ansible.builtin.template:
      src: templates/nginx.conf.j2
      dest: /etc/nginx/nginx.conf
      owner: root
      mode: '0644'
    notify: Recargar nginx         # Dispara handler si hay cambios</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>ansible.builtin.package vs apt/dnf:</strong> Usa <code>package</code> cuando el playbook debe correr en múltiples distribuciones. Usa <code>apt</code> o <code>dnf</code> cuando necesitás opciones específicas de esa distro (como <code>update_cache</code>).</div>
          </div>
        `
      },
      {
        title: 'Gestión de usuarios, grupos y cron',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">usuarios-cron.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  # Gestión de grupos
  - name: Crear grupo de aplicación
    ansible.builtin.group:
      name: appgroup
      gid: 1500
      state: present

  # Gestión de usuarios
  - name: Crear usuario de deploy
    ansible.builtin.user:
      name: deploy
      uid: 1500
      group: appgroup
      groups: [sudo, docker]       # Grupos secundarios
      shell: /bin/bash
      home: /home/deploy
      create_home: true
      comment: "Usuario de despliegue"
      state: present               # present | absent

  # Eliminar usuario (y su home)
  - name: Eliminar usuario temporal
    ansible.builtin.user:
      name: temporal
      state: absent
      remove: true                 # Elimina el directorio home

  # Gestión de cron jobs
  - name: Programar backup diario
    ansible.builtin.cron:
      name: "Backup base de datos"  # Identificador único
      minute: "30"
      hour: "2"
      day: "*"
      month: "*"
      weekday: "*"
      job: "/opt/scripts/backup.sh >> /var/log/backup.log 2>&1"
      user: deploy
      state: present</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Idempotencia en cron:</strong> El campo <code>name</code> en <code>ansible.builtin.cron</code> es el identificador único. Si cambiás la expresión de tiempo pero mantenés el mismo nombre, Ansible actualizará el cron existente en lugar de crear uno duplicado.</div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 8,
    moduleId: 3,
    title: 'Módulos de red y cloud',
    objective: 'Usar módulos para realizar peticiones HTTP, descargar archivos, gestionar firewalls y aprovisionar recursos en la nube.',
    duration: '1.5 horas',
    steps: [
      {
        title: 'Peticiones HTTP y descarga de archivos',
        body: `
          <p>Los módulos <code>uri</code> y <code>get_url</code> permiten interactuar con APIs REST y descargar recursos desde la red directamente desde Ansible, sin scripts auxiliares.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">modulos-red.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  # Petición HTTP GET a una API
  - name: Verificar health check de la aplicación
    ansible.builtin.uri:
      url: "http://localhost:8080/health"
      method: GET
      status_code: 200             # Falla si no recibe este código
      return_content: true         # Guarda el body en .content
    register: health_response

  - name: Mostrar respuesta
    ansible.builtin.debug:
      msg: "{{ health_response.json }}"  # Parsea JSON automáticamente

  # Petición POST con body JSON
  - name: Crear recurso vía API
    ansible.builtin.uri:
      url: "https://api.empresa.com/v1/hosts"
      method: POST
      body_format: json
      body:
        hostname: "{{ inventory_hostname }}"
        env: "{{ environment }}"
      headers:
        Authorization: "Bearer {{ api_token }}"
        Content-Type: "application/json"
      status_code: 201

  # Descargar archivo con verificación de checksum
  - name: Descargar binario de la aplicación
    ansible.builtin.get_url:
      url: "https://releases.empresa.com/myapp-{{ version }}.tar.gz"
      dest: /opt/downloads/myapp.tar.gz
      checksum: "sha256:{{ app_sha256 }}"  # Valida integridad
      mode: '0644'
      timeout: 60</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>uri vs get_url:</strong> Usá <code>uri</code> para interactuar con APIs (POST, PUT, DELETE, headers personalizados). Usá <code>get_url</code> para descargar archivos, ya que soporta checksum, timeouts largos y es idempotente (no descarga si el archivo ya existe con el checksum correcto).</div>
          </div>
        `
      },
      {
        title: 'Firewall y módulos de nube',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">firewall-cloud.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  # Reglas de firewall con ufw (Ubuntu/Debian)
  - name: Permitir SSH, HTTP y HTTPS
    community.general.ufw:
      rule: allow
      port: "{{ item }}"
      proto: tcp
    loop: ["22", "80", "443"]

  - name: Habilitar ufw
    community.general.ufw:
      state: enabled
      policy: deny               # Denegar todo lo que no esté permitido

  # Reglas de firewall con firewalld (RedHat/CentOS)
  - name: Abrir puerto 8080 en firewalld
    ansible.builtin.firewalld:
      port: 8080/tcp
      permanent: true
      state: enabled
      immediate: true            # Aplica sin reiniciar el servicio

  # Módulos de nube — crear instancia EC2
  - name: Crear instancia EC2
    amazon.aws.ec2_instance:
      name: web-server-01
      instance_type: t3.medium
      image_id: ami-0c55b159cbfafe1f0
      region: us-east-1
      key_name: mi-llave-ssh
      tags:
        Environment: produccion
        Role: webserver

  # Módulos de nube — crear VM en Azure
  - name: Crear VM en Azure
    azure.azcollection.azure_rm_virtualmachine:
      resource_group: mi-rg
      name: web-vm-01
      vm_size: Standard_B2s
      admin_username: azureuser
      image:
        offer: UbuntuServer
        publisher: Canonical
        sku: 22.04-LTS
        version: latest</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Dependencias de cloud:</strong> Los módulos de AWS requieren la colección <code>amazon.aws</code> y la librería <code>boto3</code>. Los de Azure requieren <code>azure.azcollection</code> y sus dependencias Python. Instalá con <code>ansible-galaxy collection install amazon.aws</code>.</div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 8,
    moduleId: 4,
    title: 'Idempotencia y retorno JSON',
    objective: 'Entender la estructura del retorno JSON de los módulos y cómo controlar el comportamiento de changed y failed con changed_when y failed_when.',
    duration: '1.5 horas',
    steps: [
      {
        title: 'Estructura del retorno JSON de un módulo',
        body: `
          <p>Todo módulo Ansible devuelve un objeto JSON con campos estándar. Ansible interpreta este JSON para determinar si la tarea cambió algo o falló. Podés registrar el resultado completo con <code>register</code>.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">json</span><span class="code-block-filename">retorno-modulo.json</span></div>
            <pre class="language-yaml"><code class="language-yaml">{
  "changed": true,          // ¿El módulo realizó cambios en el sistema?
  "failed": false,          // ¿El módulo falló?
  "msg": "archivo copiado", // Mensaje descriptivo del resultado

  // Campos específicos del módulo ansible.builtin.copy:
  "dest": "/etc/app.conf",
  "src": "/tmp/ansible/app.conf",
  "checksum": "d41d8cd98f00b204e9800998ecf8427e",
  "size": 1024,
  "uid": 0,
  "gid": 0,
  "mode": "0644",
  "backup_file": "/etc/app.conf.2024-01-15@10:30~"
}</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">changed-failed-when.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  # changed_when: false — el comando nunca "cambia" el sistema
  - name: Verificar espacio en disco
    ansible.builtin.command: df -h /
    register: disk_check
    changed_when: false            # Siempre reporta changed: false

  # failed_when: condición personalizada de fallo
  - name: Falla si el disco está lleno
    ansible.builtin.command: df -h /
    register: disk_check
    changed_when: false
    failed_when: "'100%' in disk_check.stdout"

  # Compilar código — changed solo si el binario realmente cambió
  - name: Compilar proyecto
    ansible.builtin.command: make
    args:
      chdir: /opt/mi-app
    register: make_result
    changed_when: "'Nothing to be done' not in make_result.stdout"</code></pre>
          </div>
        `
      },
      {
        title: 'command vs shell — diferencias e idempotencia',
        body: `
          <p>Ansible tiene dos módulos para ejecutar comandos: <code>command</code> y <code>shell</code>. Elegir el correcto importa tanto por seguridad como por idempotencia.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">command-vs-shell.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  # ansible.builtin.command — no usa shell, más seguro
  # No interpreta: |, &, >, $VAR, *, etc.
  - name: Ejecutar binario directamente (preferido)
    ansible.builtin.command: /usr/bin/myapp --config /etc/myapp.conf
    args:
      creates: /var/run/myapp.pid  # Idempotente: no ejecuta si el archivo existe
      removes: /tmp/lock.file      # Idempotente: no ejecuta si el archivo NO existe

  # ansible.builtin.shell — usa /bin/sh, necesario para pipes y redirecciones
  - name: Usar pipeline (necesita shell)
    ansible.builtin.shell: "ps aux | grep nginx | wc -l"
    register: nginx_procs
    changed_when: false

  # Idempotencia con creates/removes
  - name: Extraer tarball (solo si no existe el directorio)
    ansible.builtin.command: tar -xzf /opt/myapp.tar.gz -C /opt/
    args:
      creates: /opt/myapp/         # No ejecuta si este directorio ya existe</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Regla práctica:</strong> Usá <code>command</code> por defecto. Solo usá <code>shell</code> cuando necesitás pipes (<code>|</code>), redirecciones (<code>&gt;</code>), expansión de variables de entorno (<code>$VAR</code>), o globbing (<code>*</code>). <code>shell</code> es más vulnerable a inyección si usás variables sin escapar.</div>
          </div>
        `
      }
    ]
  },
];

export const nivel9Modules: ModuleContent[] = [
  {
    levelId: 9,
    moduleId: 1,
    title: 'Variables y expresiones Jinja2',
    objective: 'Dominar las expresiones Jinja2 para manipular variables en Ansible.',
    duration: '2 horas',
    steps: [
      {
        title: 'Sintaxis básica de Jinja2',
        body: `
          <p>Ansible usa Jinja2 como motor de templates. Las expresiones Jinja2 se delimitan con <code>{{ }}</code> para variables, <code>{% %}</code> para control de flujo, y <code>{# #}</code> para comentarios.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">jinja2-basico.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  - name: Expresiones básicas
    ansible.builtin.debug:
      msg:
        - "Variable simple: {{ app_name }}"
        - "Atributo: {{ ansible_default_ipv4.address }}"
        - "Índice de lista: {{ servidores[0] }}"
        - "Operación aritmética: {{ workers * 2 }}"
        - "Concatenación: {{ 'prefijo-' + nombre }}"
        - "Condicional inline: {{ 'prod' if env == 'produccion' else 'dev' }}"
        - "Default: {{ variable_opcional | default('valor-por-defecto') }}"</code></pre>
          </div>
        `
      },
      {
        title: 'Control de flujo en templates',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">jinja2</span><span class="code-block-filename">templates/nginx.conf.j2</span></div>
            <pre class="language-yaml"><code class="language-yaml">worker_processes {{ ansible_processor_vcpus }};

http {
    {% for server in nginx_servers %}
    server {
        listen {{ server.port }};
        server_name {{ server.name }};

        {% if server.ssl | default(false) %}
        ssl_certificate /etc/ssl/certs/{{ server.name }}.crt;
        ssl_certificate_key /etc/ssl/private/{{ server.name }}.key;
        {% endif %}

        location / {
            proxy_pass http://{{ server.backend }};
        }
    }
    {% endfor %}
}</code></pre>
          </div>
        `
      }
    ]
  },
  {
    levelId: 9,
    moduleId: 2,
    title: 'Filtros Jinja2',
    objective: 'Dominar los filtros más útiles de Jinja2 y Ansible para transformar strings, listas, dicts y tipos de datos.',
    duration: '2 horas',
    steps: [
      {
        title: 'Filtros de string, lista y tipo',
        body: `
          <p>Los filtros se aplican con el operador <code>|</code>. Pueden encadenarse. Ansible extiende los filtros de Jinja2 con docenas de filtros propios.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">filtros-string-lista.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">vars:
  nombre: "  ansible ROCKS  "
  servidores: [web3, web1, web1, web2]
  puertos: [8080, 8081, 8082]

tasks:
  # Filtros de string
  - ansible.builtin.debug:
      msg:
        - "{{ nombre | trim }}"               # "ansible ROCKS"
        - "{{ nombre | trim | lower }}"       # "ansible rocks"
        - "{{ nombre | trim | title }}"       # "Ansible Rocks"
        - "{{ nombre | trim | replace('ROCKS', 'rules') }}"  # "ansible rules"
        - "{{ 'a,b,c' | split(',') }}"        # ['a', 'b', 'c']
        - "{{ ['x','y','z'] | join('-') }}"   # "x-y-z"

  # Filtros de lista
  - ansible.builtin.debug:
      msg:
        - "{{ servidores | sort }}"           # [web1, web1, web2, web3]
        - "{{ servidores | unique }}"         # [web3, web1, web2]
        - "{{ servidores | unique | sort }}"  # [web1, web2, web3]
        - "{{ servidores | first }}"          # web3
        - "{{ servidores | last }}"           # web2
        - "{{ servidores | length }}"         # 4
        - "{{ [[1,2],[3,4]] | flatten }}"     # [1, 2, 3, 4]
        - "{{ servidores | select('match', 'web[12]') | list }}"  # [web1, web1, web2]

  # Filtros de tipo
  - ansible.builtin.debug:
      msg:
        - "{{ '42' | int }}"                  # 42 (entero)
        - "{{ '3.14' | float }}"              # 3.14
        - "{{ 1 | bool }}"                    # True
        - "{{ [1,2,3] | string }}"            # "[1, 2, 3]"</code></pre>
          </div>
        `
      },
      {
        title: 'Filtros de dict, default, crypto y Ansible específicos',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">filtros-avanzados.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">vars:
  config_base:
    debug: false
    workers: 4
  config_extra:
    workers: 8
    timeout: 30

tasks:
  # Filtros de dict
  - ansible.builtin.debug:
      msg:
        # dict2items: convierte dict en lista [{key, value}]
        - "{{ config_base | dict2items }}"
        # items2dict: convierte lista [{key, value}] en dict
        - "{{ [{'key': 'a', 'value': 1}] | items2dict }}"
        # combine: merge de dicts (el último gana en conflictos)
        - "{{ config_base | combine(config_extra) }}"
        # resultado: {debug: false, workers: 8, timeout: 30}

  # Filtros default y path
  - ansible.builtin.debug:
      msg:
        - "{{ variable_opcional | default('valor_por_defecto') }}"
        - "{{ '/etc/nginx/nginx.conf' | basename }}"    # nginx.conf
        - "{{ '/etc/nginx/nginx.conf' | dirname }}"     # /etc/nginx
        - "{{ '~/datos' | expanduser }}"                # /home/usuario/datos

  # Crypto
  - name: Crear usuario con contraseña hasheada
    ansible.builtin.user:
      name: deploy
      password: "{{ 'mi-secreto' | password_hash('sha512') }}"

  # Filtros de serialización Ansible
  - ansible.builtin.debug:
      msg:
        - "{{ config_base | to_json }}"       # JSON string
        - "{{ config_base | to_yaml }}"       # YAML string
        - "{{ '{\"key\": 1}' | from_json }}"  # Parsea JSON
        - "{{ 'key: value' | from_yaml }}"    # Parsea YAML

  # Regex
  - ansible.builtin.debug:
      msg: "{{ 'nginx/1.24.0' | regex_replace('(\\\\d+\\\\.\\\\d+)\\\\.\\\\d+', '\\\\1') }}"
      # resultado: "nginx/1.24"</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>default(omit):</strong> El filtro <code>default(omit)</code> es especial — si la variable no está definida, <em>omite el parámetro completo</em> del módulo. Útil para parámetros opcionales: <code>port: "{{ custom_port | default(omit) }}"</code>.</div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 9,
    moduleId: 3,
    title: 'Tests y condicionales Jinja2',
    objective: 'Usar los tests de Jinja2 con when para escribir condicionales expresivos y robustos.',
    duration: '1.5 horas',
    steps: [
      {
        title: 'Tests de definición, tipo y comparación',
        body: `
          <p>Los tests en Jinja2 se usan con <code>is</code> (o <code>is not</code>) y permiten verificar propiedades de una variable. Son la forma idiomática de escribir condiciones complejas en Ansible.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">tests-jinja2.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  # Definición
  - name: Solo si la variable está definida
    ansible.builtin.debug:
      msg: "{{ config_extra }}"
    when: config_extra is defined

  - name: Solo si la variable NO está definida
    ansible.builtin.debug:
      msg: "No hay configuración extra"
    when: config_extra is undefined

  - name: Verificar que no es null
    ansible.builtin.debug:
      msg: "Tiene valor"
    when: resultado is not none

  # Tests de tipo
  - name: Verificar que es string
    ansible.builtin.debug:
      msg: "Es un string: {{ valor }}"
    when: valor is string

  - name: Verificar que es número
    ansible.builtin.debug:
      msg: "Es un número"
    when: workers is number

  - name: Verificar que es iterable (lista o dict)
    ansible.builtin.debug:
      msg: "Puedo iterar sobre esto"
    when: servers is iterable and servers is not string

  # Pertenencia y comparación
  - name: Si el host está en el grupo web
    ansible.builtin.debug:
      msg: "Es servidor web"
    when: "'servidores_web' in group_names"

  - name: Comparación de versión de Ansible
    ansible.builtin.debug:
      msg: "Ansible 2.10 o superior"
    when: ansible_version.full is version('2.10', '>=')</code></pre>
          </div>
        `
      },
      {
        title: 'Tests de archivo y coincidencia con regex',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">tests-regex-archivo.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  # match: coincidencia desde el inicio del string
  - name: Aplicar solo a hostnames de producción
    ansible.builtin.debug:
      msg: "Host de producción"
    when: inventory_hostname is match("prod-.*")

  # search: busca patrón en cualquier parte del string
  - name: Verificar si la salida contiene error
    ansible.builtin.debug:
      msg: "Hay errores en el log"
    when: log_output.stdout is search("ERROR|CRITICAL")

  # Combinación de tests con and/or
  - name: Solo en Ubuntu >= 20 y en producción
    ansible.builtin.package:
      name: snapd
      state: absent
    when:
      - ansible_distribution == "Ubuntu"
      - ansible_distribution_major_version | int >= 20
      - env is defined and env == "produccion"

  # Verificar pertenencia a lista
  - name: Instalar herramientas solo en roles específicos
    ansible.builtin.package:
      name: htop
      state: present
    when: "'webserver' in group_names or 'database' in group_names"</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>match vs search:</strong> <code>match</code> verifica que el patrón coincida desde el <em>inicio</em> del string (como <code>^patron</code> en regex). <code>search</code> busca el patrón en <em>cualquier posición</em>. Para verificar si un string empieza con algo, usa <code>match</code>.</div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 9,
    moduleId: 4,
    title: 'Macros e includes Jinja2',
    objective: 'Crear templates reutilizables con macros, includes e imports de Jinja2 para evitar duplicación en configuraciones complejas.',
    duration: '1.5 horas',
    steps: [
      {
        title: 'Definir y usar macros en templates',
        body: `
          <p>Una macro Jinja2 es como una función: la definís una vez y la llamás múltiples veces con distintos argumentos. Ideal para generar bloques de configuración repetitivos como virtual hosts de nginx.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">jinja2</span><span class="code-block-filename">templates/nginx.conf.j2</span></div>
            <pre class="language-yaml"><code class="language-yaml">{% macro render_vhost(name, port, backend, ssl=false) %}
server {
    listen {{ port }}{% if ssl %} ssl{% endif %};
    server_name {{ name }};

    {% if ssl %}
    ssl_certificate     /etc/letsencrypt/live/{{ name }}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/{{ name }}/privkey.pem;
    {% endif %}

    location / {
        proxy_pass         http://{{ backend }};
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
    }
}
{% endmacro %}

{# Llamadas a la macro con distintos parámetros #}
{{ render_vhost('api.empresa.com', 443, 'localhost:3000', ssl=true) }}
{{ render_vhost('admin.empresa.com', 443, 'localhost:4000', ssl=true) }}
{{ render_vhost('static.empresa.com', 80, 'localhost:5000') }}</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Parámetros con default:</strong> Las macros soportan parámetros con valores por defecto (<code>ssl=false</code>). Esto hace la macro flexible sin obligar al llamador a pasar todos los argumentos.</div>
          </div>
        `
      },
      {
        title: 'include e import de templates',
        body: `
          <p>Para templates grandes, podés dividir el contenido en archivos separados y componerlos con <code>include</code> e <code>import</code>.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">jinja2</span><span class="code-block-filename">templates/nginx-main.conf.j2</span></div>
            <pre class="language-yaml"><code class="language-yaml">{# Incluir header estático — el archivo se inserta tal cual #}
{% include 'nginx-header.j2' %}

{# Importar macros de otro archivo para usarlas aquí #}
{% import 'macros/nginx-vhost.j2' as vhost_macros %}

http {
    {# Incluir configuración global de HTTP #}
    {% include 'nginx-http-common.j2' %}

    {# Usar macro importada para cada virtual host definido en vars #}
    {% for site in nginx_sites %}
    {{ vhost_macros.render_vhost(
        name=site.name,
        port=site.port | default(80),
        backend=site.backend,
        ssl=site.ssl | default(false)
    ) }}
    {% endfor %}
}</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbook.yml — definir los sitios</span></div>
            <pre class="language-yaml"><code class="language-yaml">vars:
  nginx_sites:
    - name: api.empresa.com
      port: 443
      backend: "localhost:3000"
      ssl: true
    - name: www.empresa.com
      port: 80
      backend: "localhost:8080"

tasks:
  - name: Generar configuración nginx
    ansible.builtin.template:
      src: templates/nginx-main.conf.j2
      dest: /etc/nginx/nginx.conf
    notify: Recargar nginx</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>include vs import:</strong> <code>include</code> inserta el contenido del archivo en ese punto del template. <code>import</code> carga el archivo para acceder a sus macros/variables. No uses <code>include</code> para macros — usá <code>import</code>.</div>
          </div>
        `
      }
    ]
  },
];

export const nivel10Modules: ModuleContent[] = [
  {
    levelId: 10,
    moduleId: 1,
    title: 'Condicionales con when',
    objective: 'Usar la directiva when para ejecutar tareas condicionalmente.',
    duration: '1.5 horas',
    steps: [
      {
        title: 'Sintaxis de when',
        body: `
          <p>La directiva <code>when</code> acepta una expresión Jinja2 que se evalúa como booleano. Si es verdadera, la tarea se ejecuta. Si es falsa, se salta con <code>skipped</code>.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">condicionales-when.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  # Basado en distribución
  - name: Instalar con apt (solo Debian/Ubuntu)
    ansible.builtin.apt:
      name: nginx
      state: present
    when: ansible_os_family == "Debian"

  # Basado en distribución (RedHat/CentOS)
  - name: Instalar con dnf (solo RedHat)
    ansible.builtin.dnf:
      name: nginx
      state: present
    when: ansible_os_family == "RedHat"

  # Múltiples condiciones (AND implícito con lista)
  - name: Solo en Ubuntu 22 en producción
    ansible.builtin.debug:
      msg: "Condición múltiple cumplida"
    when:
      - ansible_distribution == "Ubuntu"
      - ansible_distribution_major_version == "22"
      - env == "produccion"

  # OR con operador or
  - name: En Debian O Ubuntu
    ansible.builtin.debug:
      msg: "Sistema Debian-based"
    when: ansible_distribution == "Debian" or ansible_distribution == "Ubuntu"

  # Verificar si variable está definida
  - name: Solo si la variable existe
    ansible.builtin.debug:
      msg: "{{ config_extra }}"
    when: config_extra is defined

  # Verificar si un resultado tuvo éxito
  - name: Solo si el comando anterior funcionó
    ansible.builtin.debug:
      msg: "Continuar"
    when: resultado.rc == 0</code></pre>
          </div>
        `
      }
    ]
  },
  {
    levelId: 10,
    moduleId: 2,
    title: 'failed_when y changed_when',
    objective: 'Controlar cuándo Ansible considera que una tarea falló o realizó cambios, sobreescribiendo el comportamiento por defecto de los módulos.',
    duration: '1 hora',
    steps: [
      {
        title: 'changed_when — controlar qué reporta changed',
        body: `
          <p>Por defecto, <code>ansible.builtin.command</code> y <code>ansible.builtin.shell</code> siempre reportan <code>changed: true</code> porque Ansible no sabe qué hizo el comando. <code>changed_when</code> te permite sobreescribir este comportamiento.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">changed-when.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  # Comando de solo-lectura: nunca debería reportar changed
  - name: Verificar espacio en disco
    ansible.builtin.command: df -h /
    register: disk_check
    changed_when: false            # Siempre changed: false

  # Compilar código: changed solo si realmente compiló algo
  - name: Compilar código
    ansible.builtin.command: make
    args:
      chdir: /opt/mi-app
    register: make_result
    changed_when: "'Nothing to be done' not in make_result.stdout"

  # Sincronizar base de datos: changed solo si hubo migraciones
  - name: Ejecutar migraciones de DB
    ansible.builtin.command: python manage.py migrate
    args:
      chdir: /opt/mi-app
    register: migrate_result
    changed_when: "'No migrations to apply' not in migrate_result.stdout"</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Por qué importa:</strong> Un <code>changed: true</code> innecesario puede disparar handlers incorrectamente (por ejemplo, reiniciar nginx cuando no cambió nada). Usar <code>changed_when: false</code> en comandos de lectura mantiene la integridad del sistema de notificaciones.</div>
          </div>
        `
      },
      {
        title: 'failed_when — condiciones personalizadas de fallo',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">failed-when.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  # Falla si el disco está al 100%
  - name: Verificar disco antes de deploy
    ansible.builtin.command: df --output=pcent / | tail -1
    register: disk_usage
    changed_when: false
    failed_when: "'100%' in disk_usage.stdout"

  # Comando que devuelve rc != 0 pero no es error real
  # grep devuelve 1 si no encuentra nada — eso no es un error aquí
  - name: Verificar si nginx está en proceso
    ansible.builtin.command: pgrep nginx
    register: nginx_pgrep
    changed_when: false
    failed_when: nginx_pgrep.rc > 1     # Solo falla en errores reales (rc 2+)

  # Combinar failed_when con múltiples condiciones
  - name: Validar configuración de nginx
    ansible.builtin.command: nginx -t
    register: nginx_test
    changed_when: false
    failed_when:
      - nginx_test.rc != 0
      - "'successful' not in nginx_test.stderr"</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>ignore_errors vs failed_when:</strong> Evitá usar <code>ignore_errors: true</code> indiscriminadamente — ignora todos los errores incluyendo los reales. <code>failed_when</code> es más preciso: define exactamente qué condición constituye un fallo.</div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 10,
    moduleId: 3,
    title: 'check_mode y assert',
    objective: 'Usar el modo de verificación en seco (dry run) y el módulo assert para validar precondiciones antes de realizar cambios.',
    duration: '1 hora',
    steps: [
      {
        title: 'check_mode — dry run de playbooks',
        body: `
          <p>El flag <code>--check</code> ejecuta el playbook sin realizar cambios reales. Los módulos reportan qué harían pero no actúan. Es fundamental para auditar cambios antes de aplicarlos.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">dry-run.sh</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Dry run — muestra qué cambiaría sin hacer nada
ansible-playbook site.yml --check

# Dry run con diff — muestra el contenido exacto que cambiaría en archivos
ansible-playbook site.yml --check --diff</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">check-mode-tasks.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  # Esta tarea SIEMPRE se ejecuta, incluso con --check
  # Útil para tareas que solo leen o validan
  - name: Verificar conectividad (siempre ejecutar)
    ansible.builtin.ping:
    check_mode: false

  # Esta tarea SOLO se ejecuta en check mode, nunca en producción
  # Útil para tareas de validación que no quieres en producción normal
  - name: Reportar configuración (solo en dry run)
    ansible.builtin.debug:
      msg: "Configuración a aplicar: {{ config }}"
    check_mode: true

  # Tarea normal — respeta el flag --check del usuario
  - name: Copiar configuración
    ansible.builtin.copy:
      src: files/app.conf
      dest: /etc/app.conf</code></pre>
          </div>
        `
      },
      {
        title: 'assert — validar precondiciones',
        body: `
          <p>El módulo <code>ansible.builtin.assert</code> valida condiciones y falla con un mensaje claro si no se cumplen. Úsalo para validar variables de entrada antes de realizar cambios destructivos.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">assert-validaciones.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  - name: Validar variables de configuración
    ansible.builtin.assert:
      that:
        - app_version is defined             # Variable debe existir
        - app_version is string              # Debe ser string
        - app_version | length > 0           # No puede estar vacío
        - workers is defined
        - workers | int >= 1                 # Al menos 1 worker
        - workers | int <= 32               # Máximo razonable
        - environment in ['dev', 'staging', 'produccion']
      fail_msg: >
        Validación fallida. Verificá: app_version (definida, no vacía),
        workers (número entre 1 y 32), environment (dev/staging/produccion).
      success_msg: "Todas las variables validadas correctamente"

  - name: Verificar espacio disponible antes de deploy
    ansible.builtin.assert:
      that:
        - ansible_mounts | selectattr('mount', 'equalto', '/') | map(attribute='size_available') | first > 1073741824
      fail_msg: "Menos de 1GB disponible en /. El deploy fue abortado."
      success_msg: "Espacio en disco suficiente"</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Cuándo usar assert:</strong> Poné assertions al inicio del playbook para validar variables requeridas, versiones mínimas, y condiciones del sistema. Un fallo temprano con mensaje claro es mucho mejor que un error críptico a mitad de la ejecución.</div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 10,
    moduleId: 4,
    title: 'until / retries / delay',
    objective: 'Implementar reintentos y esperas para tareas que dependen de recursos externos que pueden tardar en estar disponibles.',
    duration: '1 hora',
    steps: [
      {
        title: 'Reintentos con until, retries y delay',
        body: `
          <p>Algunos recursos (servicios, APIs, bases de datos) tardan en arrancar. <code>until</code> permite reintentar una tarea hasta que se cumpla una condición, con una espera entre intentos.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">until-retries.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  # Esperar que el health check responda 200
  - name: Esperar que la aplicación esté disponible
    ansible.builtin.uri:
      url: "http://localhost:8080/health"
      status_code: 200
    register: health_check
    until: health_check.status == 200   # Condición de éxito
    retries: 10                          # Máximo 10 intentos
    delay: 5                             # 5 segundos entre intentos
    # Total máximo de espera: 10 * 5 = 50 segundos

  # Esperar que un servicio arranque
  - name: Verificar que PostgreSQL acepta conexiones
    ansible.builtin.command: pg_isready -h localhost -p 5432
    register: pg_ready
    until: pg_ready.rc == 0
    retries: 12
    delay: 5
    changed_when: false</code></pre>
          </div>
        `
      },
      {
        title: 'wait_for — esperar puertos y archivos',
        body: `
          <p>El módulo <code>ansible.builtin.wait_for</code> es más declarativo: espera que un puerto esté abierto, un archivo exista, o un string aparezca en un archivo.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">wait-for.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  # Esperar que el puerto 5432 esté abierto
  - name: Esperar que PostgreSQL esté escuchando
    ansible.builtin.wait_for:
      host: "{{ inventory_hostname }}"
      port: 5432
      delay: 5          # Esperar 5s antes del primer intento
      timeout: 60       # Timeout total en segundos
      state: started    # started (puerto abierto) | stopped (cerrado) | drained

  # Esperar que un archivo exista (ej: PID file del proceso)
  - name: Esperar que la app cree su PID file
    ansible.builtin.wait_for:
      path: /var/run/mi-app.pid
      state: present
      timeout: 30

  # Esperar que un string aparezca en un archivo de log
  - name: Esperar que el log indique que está listo
    ansible.builtin.wait_for:
      path: /var/log/mi-app/app.log
      search_regex: "Application started successfully"
      timeout: 60

  # Esperar que un puerto se cierre (útil después de un stop)
  - name: Verificar que el servicio viejo cerró
    ansible.builtin.wait_for:
      port: 8080
      state: stopped
      timeout: 30</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>until vs wait_for:</strong> Usá <code>until</code> cuando necesitás evaluar la salida de un comando o la respuesta de una API. Usá <code>wait_for</code> para esperar que un puerto esté disponible o que aparezca un archivo — es más declarativo y no requiere registrar variables.</div>
          </div>
        `
      }
    ]
  },
];

export const nivel11Modules: ModuleContent[] = [
  {
    levelId: 11,
    moduleId: 1,
    title: 'loop básico',
    objective: 'Usar loop para iterar sobre listas y ejecutar tareas repetitivas de forma concisa.',
    duration: '1 hora',
    steps: [
      {
        title: 'Iterar con loop',
        body: `
          <p>El <code>loop</code> básico de Ansible reemplaza a <code>with_items</code> (deprecado desde 2.5). Itera sobre una lista y ejecuta la tarea para cada elemento, disponible como <code>item</code>.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">loop-basico.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  - name: Crear múltiples directorios
    ansible.builtin.file:
      path: "{{ item }}"
      state: directory
      mode: '0755'
    loop:
      - /opt/app/logs
      - /opt/app/data
      - /opt/app/config

  - name: Instalar múltiples paquetes
    ansible.builtin.package:
      name: "{{ item }}"
      state: present
    loop: [nginx, curl, git, vim]

  - name: Loop sobre lista de dicts
    ansible.builtin.user:
      name: "{{ item.nombre }}"
      shell: "{{ item.shell }}"
      state: present
    loop:
      - { nombre: juan, shell: /bin/bash }
      - { nombre: maria, shell: /bin/zsh }
      - { nombre: deploy, shell: /usr/sbin/nologin }</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>loop vs with_items:</strong> Preferí <code>loop</code>. <code>with_items</code> aplana listas anidadas automáticamente, lo que puede causar comportamiento inesperado. <code>loop</code> es explícito y predecible.</div>
          </div>
        `
      },
      {
        title: 'Registrar resultados de un loop',
        body: `
          <p>Cuando usás <code>register</code> con un <code>loop</code>, la variable registrada tiene un campo <code>results</code> que es una lista con el resultado de cada iteración.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">loop-register.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  - name: Verificar servicios
    ansible.builtin.command: "systemctl is-active {{ item }}"
    loop: [nginx, postgresql, redis]
    register: services_check
    changed_when: false
    ignore_errors: true

  - name: Mostrar servicios caídos
    ansible.builtin.debug:
      msg: "Servicio caído: {{ item.item }}"
    loop: "{{ services_check.results }}"
    when: item.rc != 0</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>results vs stdout:</strong> Con loop, la variable registrada no tiene directamente <code>.stdout</code>. Tenés que iterar sobre <code>.results</code> y acceder a <code>item.stdout</code> para cada elemento.</div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 11,
    moduleId: 2,
    title: 'dict2items y subelements',
    objective: 'Iterar sobre diccionarios y estructuras anidadas usando dict2items y subelements.',
    duration: '1.5 horas',
    steps: [
      {
        title: 'dict2items — iterar sobre diccionarios',
        body: `
          <p><code>dict2items</code> convierte un diccionario en una lista de objetos con campos <code>key</code> y <code>value</code>, permitiendo iterar sobre él con <code>loop</code>.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">dict2items.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">vars:
  paquetes:
    nginx: "1.24"
    postgresql: "15"
    redis: "7.0"

tasks:
  - name: Mostrar paquete y versión
    ansible.builtin.debug:
      msg: "Instalar {{ item.key }} versión {{ item.value }}"
    loop: "{{ paquetes | dict2items }}"

  # Con nombres de clave personalizados
  - name: Configurar variables de entorno
    ansible.builtin.lineinfile:
      path: /etc/environment
      line: '{{ item.key }}="{{ item.value }}"'
    loop: "{{ env_vars | dict2items(key_name='var', value_name='val') }}"
    vars:
      env_vars:
        APP_ENV: produccion
        APP_PORT: "8080"
        APP_DEBUG: "false"</code></pre>
          </div>
        `
      },
      {
        title: 'subelements — estructuras anidadas',
        body: `
          <p><code>subelements</code> permite iterar sobre una lista de objetos donde cada objeto tiene un campo que es a su vez una lista. El resultado es el producto cartesiano: cada par (objeto_padre, elemento_hijo).</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">subelements.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">vars:
  usuarios:
    - nombre: juan
      claves_ssh:
        - "ssh-ed25519 AAAA...juan-laptop"
        - "ssh-rsa AAAA...juan-trabajo"
    - nombre: maria
      claves_ssh:
        - "ssh-ed25519 BBBB...maria-laptop"

tasks:
  # item.0 = el usuario (objeto padre)
  # item.1 = la clave SSH individual (elemento hijo)
  - name: Agregar todas las claves SSH
    ansible.posix.authorized_key:
      user: "{{ item.0.nombre }}"
      key: "{{ item.1 }}"
      state: present
    loop: "{{ usuarios | subelements('claves_ssh') }}"</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>item.0 e item.1:</strong> Con <code>subelements</code>, <code>item.0</code> siempre es el objeto padre completo y <code>item.1</code> es el elemento de la sublista. Podés acceder a cualquier campo del padre con <code>item.0.campo</code>.</div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 11,
    moduleId: 3,
    title: 'product, zip y cartesian',
    objective: 'Generar combinaciones y pares de elementos de múltiples listas para loops avanzados.',
    duration: '1 hora',
    steps: [
      {
        title: 'product — combinaciones cartesianas',
        body: `
          <p>El filtro <code>product</code> genera todas las combinaciones posibles de dos o más listas. Equivale al producto cartesiano matemático.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">product.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  # Crear usuario juan y maria en grupos dev y docker
  # Combinaciones: [juan,dev] [juan,docker] [maria,dev] [maria,docker]
  - name: Agregar usuarios a grupos
    ansible.builtin.user:
      name: "{{ item.0 }}"
      groups: "{{ item.1 }}"
      append: true
    loop: "{{ ['juan', 'maria'] | product(['dev', 'docker']) | list }}"

  # Crear directorios para cada app en cada entorno
  - name: Crear estructura de directorios
    ansible.builtin.file:
      path: "/opt/{{ item.0 }}/{{ item.1 }}"
      state: directory
    loop: "{{ apps | product(entornos) | list }}"
    vars:
      apps: [frontend, backend, worker]
      entornos: [logs, data, config]</code></pre>
          </div>
        `
      },
      {
        title: 'zip — combinar listas en paralelo',
        body: `
          <p>El filtro <code>zip</code> combina dos listas emparejando elementos por posición. El primero con el primero, el segundo con el segundo, etc.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">zip.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">vars:
  nombres: [web1, web2, web3]
  ips: ["10.0.1.1", "10.0.1.2", "10.0.1.3"]
  puertos: [8080, 8081, 8082]

tasks:
  # Emparejar nombre con IP
  - name: Mostrar servidor y su IP
    ansible.builtin.debug:
      msg: "{{ item.0 }} → {{ item.1 }}"
    loop: "{{ nombres | zip(ips) | list }}"

  # Agregar entradas al /etc/hosts
  - name: Configurar /etc/hosts
    ansible.builtin.lineinfile:
      path: /etc/hosts
      line: "{{ item.1 }}  {{ item.0 }}"
    loop: "{{ nombres | zip(ips) | list }}"

  # zip con tres listas
  - name: Configurar servidores con puerto
    ansible.builtin.debug:
      msg: "{{ item.0 }}:{{ item.2 }} → {{ item.1 }}"
    loop: "{{ nombres | zip(ips, puertos) | list }}"</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Longitudes distintas:</strong> <code>zip</code> se detiene en la lista más corta. Si las listas tienen distinto tamaño, usá <code>zip_longest</code> (con un valor de relleno) para procesar todos los elementos.</div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 11,
    moduleId: 4,
    title: 'loop_control',
    objective: 'Personalizar el comportamiento de los loops con loop_control para mejorar la legibilidad y controlar la ejecución.',
    duration: '1 hora',
    steps: [
      {
        title: 'label, pause e index_var',
        body: `
          <p><code>loop_control</code> permite controlar cómo se muestra el progreso del loop, añadir pausas entre iteraciones, y acceder al índice actual.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">loop-control.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  - name: Instalar paquetes con salida limpia
    ansible.builtin.package:
      name: "{{ item.nombre }}"
      state: present
    loop:
      - { nombre: nginx, version: "1.24", prioridad: alta }
      - { nombre: redis, version: "7.0", prioridad: media }
      - { nombre: htop, version: "3.2", prioridad: baja }
    loop_control:
      # Solo muestra el nombre, no todo el dict en la salida
      label: "{{ item.nombre }} ({{ item.prioridad }})"
      # Pausa 2 segundos entre iteraciones (útil para APIs con rate limit)
      pause: 2
      # Variable con el índice actual (0, 1, 2...)
      index_var: idx

  - name: Numerar tareas
    ansible.builtin.debug:
      msg: "Procesando item {{ idx + 1 }} de {{ loop_items | length }}: {{ item }}"
    loop: "{{ loop_items }}"
    vars:
      loop_items: [alpha, beta, gamma]
    loop_control:
      index_var: idx</code></pre>
          </div>
        `
      },
      {
        title: 'loop_var — evitar conflictos en roles anidados',
        body: `
          <p>Cuando un rol llama a otro rol que también usa <code>loop</code>, ambos usan <code>item</code> por defecto, lo que causa conflictos. <code>loop_var</code> permite renombrar la variable del loop.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">loop-var-anidado.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  # Rol externo usa 'servidor' como loop_var
  - name: Configurar servidores
    ansible.builtin.include_tasks: configurar_servidor.yml
    loop: "{{ servidores }}"
    loop_control:
      loop_var: servidor   # Evita conflicto con loops internos de include

  # En configurar_servidor.yml, el loop interno puede usar 'item' sin conflicto:
  # - name: Instalar paquetes del servidor
  #   ansible.builtin.package:
  #     name: "{{ item }}"
  #   loop: "{{ servidor.paquetes }}"
  #   # 'item' aquí es del loop interno, 'servidor' es del loop externo</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Regla de oro:</strong> Cuando usás <code>include_tasks</code> dentro de un loop, siempre renombrá la variable con <code>loop_var</code> para evitar que el loop externo interfiera con loops internos del archivo incluido.</div>
          </div>
        `
      }
    ]
  },
];

export const nivel12Modules: ModuleContent[] = [
  {
    levelId: 12,
    moduleId: 1,
    title: 'Estructura completa de un role',
    objective: 'Conocer cada directorio y archivo de un role de Ansible y crear un role funcional completo.',
    duration: '2 horas',
    steps: [
      {
        title: 'Estructura de directorios de un role',
        body: `
          <p>Un role organiza tareas, handlers, templates, archivos, variables y metadatos en una estructura de directorios estándar. Ansible descubre y carga cada pieza automáticamente.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">estructura-role.sh</span></div>
            <pre class="language-yaml"><code class="language-yaml">roles/servidor_web/
├── tasks/
│   └── main.yml       # Punto de entrada: tareas principales del role
├── handlers/
│   └── main.yml       # Handlers: restart, reload, etc.
├── templates/
│   └── nginx.conf.j2  # Templates Jinja2 (procesados antes de copiar)
├── files/
│   └── index.html     # Archivos estáticos (copiados sin procesar)
├── vars/
│   └── main.yml       # Variables del role — alta prioridad, no sobreescribibles fácil
├── defaults/
│   └── main.yml       # Variables con defaults — baja prioridad, fáciles de sobreescribir
├── meta/
│   └── main.yml       # Metadatos: autor, licencia, dependencias de otros roles
├── tests/
│   └── test.yml       # Tests del role (Molecule)
└── README.md          # Documentación del role</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>defaults vs vars:</strong> Usá <code>defaults/main.yml</code> para valores que el usuario del role puede sobreescribir fácilmente. Usá <code>vars/main.yml</code> para valores internos que el role necesita y que no deberían cambiar desde fuera.</div>
          </div>
        `
      },
      {
        title: 'Ejemplo completo: role servidor_web',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/servidor_web/defaults/main.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">nginx_port: 80
nginx_worker_processes: "{{ ansible_processor_vcpus }}"
nginx_sites: []</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/servidor_web/tasks/main.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Instalar nginx
  ansible.builtin.package:
    name: nginx
    state: present

- name: Copiar configuración principal
  ansible.builtin.template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
    owner: root
    mode: '0644'
  notify: Recargar nginx

- name: Habilitar e iniciar nginx
  ansible.builtin.service:
    name: nginx
    state: started
    enabled: true</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/servidor_web/handlers/main.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Recargar nginx
  ansible.builtin.service:
    name: nginx
    state: reloaded

- name: Reiniciar nginx
  ansible.builtin.service:
    name: nginx
    state: restarted</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Handlers y notify:</strong> El nombre en <code>notify</code> debe coincidir exactamente (incluyendo mayúsculas) con el nombre del handler. Los handlers se ejecutan una sola vez al final del play, aunque múltiples tareas lo notifiquen.</div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 12,
    moduleId: 2,
    title: 'Ansible Galaxy',
    objective: 'Usar Ansible Galaxy para buscar, instalar y gestionar roles y collections de la comunidad.',
    duration: '1 hora',
    steps: [
      {
        title: 'Buscar e instalar desde Galaxy',
        body: `
          <p>Ansible Galaxy es el repositorio oficial de roles y collections de la comunidad. Podés instalar roles probados y mantenidos en lugar de escribir todo desde cero.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">galaxy-comandos.sh</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Buscar roles relacionados con nginx
ansible-galaxy search nginx

# Instalar un role popular
ansible-galaxy role install geerlingguy.nginx

# Los roles se instalan en ~/.ansible/roles/ por defecto
# o en roles/ del proyecto si está configurado en ansible.cfg

# Ver roles instalados
ansible-galaxy role list

# Eliminar un role
ansible-galaxy role remove geerlingguy.nginx

# Instalar collection
ansible-galaxy collection install community.general

# Ver collections instaladas
ansible-galaxy collection list</code></pre>
          </div>
        `
      },
      {
        title: 'requirements.yml — gestión declarativa de dependencias',
        body: `
          <p>El archivo <code>requirements.yml</code> declara todas las dependencias del proyecto (roles y collections) con versiones fijadas. Permite reproducibilidad entre entornos.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">requirements.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">roles:
  - name: geerlingguy.nginx
    version: 6.1.0
  - name: geerlingguy.postgresql
    version: 3.3.2
  - src: https://github.com/mi-empresa/mi-role
    name: mi_role
    version: main

collections:
  - name: community.general
    version: ">=7.0.0"
  - name: community.postgresql
    version: "3.2.0"
  - name: amazon.aws
    version: "6.5.0"</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalar-requirements.sh</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Instalar todo lo declarado en requirements.yml
ansible-galaxy install -r requirements.yml

# Instalar roles y collections por separado
ansible-galaxy role install -r requirements.yml
ansible-galaxy collection install -r requirements.yml

# Actualizar collections a la última versión compatible
ansible-galaxy collection install -r requirements.yml --upgrade</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Fijar versiones:</strong> Siempre especificá versiones exactas en <code>requirements.yml</code> para proyectos de producción. Roles y collections actualizados pueden introducir cambios incompatibles.</div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 12,
    moduleId: 3,
    title: 'Dependencias entre roles',
    objective: 'Declarar dependencias entre roles en meta/main.yml para garantizar el orden correcto de ejecución.',
    duration: '1 hora',
    steps: [
      {
        title: 'Declarar dependencias en meta/main.yml',
        body: `
          <p>Un role puede declarar que depende de otros roles en su <code>meta/main.yml</code>. Ansible resuelve y ejecuta las dependencias automáticamente antes del role principal.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/servidor_web/meta/main.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">galaxy_info:
  author: mi_empresa
  description: Configura servidor web nginx con SSL
  license: MIT
  min_ansible_version: "2.14"
  platforms:
    - name: Ubuntu
      versions: ["22.04", "24.04"]

dependencies:
  # Dependencia simple: role del mismo proyecto
  - role: common

  # Dependencia con variables específicas
  - role: ssl_certificates
    vars:
      domain: "{{ app_domain }}"
      email: "{{ admin_email }}"

  # Dependencia de Galaxy con versión fija
  - role: geerlingguy.nginx
    version: "6.1.0"</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Orden de ejecución:</strong> Ansible ejecuta las dependencias primero, en el orden en que están declaradas. Si dos roles dependen del mismo role, Ansible lo ejecuta solo una vez (a menos que uses <code>allow_duplicates: true</code>).</div>
          </div>
        `
      },
      {
        title: 'Resolución de dependencias y errores comunes',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">site.yml — orden de ejecución</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Si servidor_web depende de: common → ssl_certificates → geerlingguy.nginx
# El orden real de ejecución es:
# 1. common
# 2. ssl_certificates
# 3. geerlingguy.nginx
# 4. servidor_web  (el role principal)

- name: Configurar servidores web
  hosts: servidores_web
  roles:
    - servidor_web    # Ansible resuelve todo el árbol de dependencias</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">allow-duplicates.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml"># roles/mi_role/meta/main.yml
# Por defecto, Ansible no ejecuta un role más de una vez por play.
# Para permitir múltiples ejecuciones (con distintas vars):
allow_duplicates: true</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Dependencias circulares:</strong> Si el role A depende de B y B depende de A, Ansible detecta la dependencia circular y falla con un error claro. Diseñá los roles con dependencias en una sola dirección.</div>
          </div>
        `
      }
    ]
  },
];

export const nivel13Modules: ModuleContent[] = [
  {
    levelId: 13,
    moduleId: 1,
    title: 'Action Plugins',
    objective: 'Entender qué son los action plugins, cuándo se ejecutan en el nodo de control, y cómo crear uno básico.',
    duration: '1.5 horas',
    steps: [
      {
        title: 'Qué son los action plugins',
        body: `
          <p>Los action plugins se ejecutan en el <strong>nodo de control</strong>, no en el host remoto. Esto los hace ideales para operaciones que involucran archivos locales que deben procesarse antes de enviarse (como compilar un template Jinja2).</p>
          <p>Módulos conocidos que son en realidad action plugins: <code>ansible.builtin.template</code> (lee el .j2 localmente, renderiza, y sube el resultado), <code>ansible.builtin.copy</code> (lee el archivo local y lo transfiere).</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ubicación-action-plugins.sh</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Ubicaciones donde Ansible busca action plugins:
# 1. action_plugins/ en el directorio del playbook
# 2. action_plugins/ dentro de un rol
# 3. Configurado en ansible.cfg:
#    [defaults]
#    action_plugins = ~/.ansible/plugins/action:/usr/share/ansible/plugins/action</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Diferencia clave:</strong> Un módulo normal se transfiere al host y se ejecuta allí. Un action plugin corre en el control node y puede decidir si y cómo transferir datos al host remoto. Son la capa que coordina la comunicación.</div>
          </div>
        `
      },
      {
        title: 'Esqueleto mínimo de un action plugin',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">action_plugins/mi_action.py</span></div>
            <pre class="language-yaml"><code class="language-yaml">from ansible.plugins.action import ActionBase

class ActionModule(ActionBase):
    """Action plugin que se ejecuta en el nodo de control."""

    TRANSFERS_FILES = False  # True si el plugin transfiere archivos al host

    def run(self, tmp=None, task_vars=None):
        # Llamar siempre al padre primero
        result = super(ActionModule, self).run(tmp, task_vars)

        # Leer argumentos pasados al módulo en el playbook
        nombre = self._task.args.get('nombre', 'mundo')

        # Ejecutar lógica en el nodo de control
        mensaje = f"Hola, {nombre}! (ejecutado en el control node)"

        # También podés ejecutar un módulo en el host remoto:
        # remote_result = self._execute_module(
        #     module_name='ansible.builtin.command',
        #     module_args={'cmd': 'hostname'},
        #     task_vars=task_vars
        # )

        result['changed'] = False
        result['msg'] = mensaje
        return result</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">usar-action-plugin.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  - name: Usar mi action plugin
    mi_action:          # Nombre del archivo sin .py
      nombre: "Ansible"</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Nombres coincidentes:</strong> Si un action plugin tiene el mismo nombre que un módulo, el action plugin toma precedencia. Esto es lo que hace que <code>template</code> funcione como action plugin aunque también exista como módulo.</div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 13,
    moduleId: 2,
    title: 'Lookup Plugins',
    objective: 'Usar lookup plugins para leer datos de fuentes externas: archivos locales, variables de entorno, contraseñas y secretos.',
    duration: '1.5 horas',
    steps: [
      {
        title: 'Lookups built-in más útiles',
        body: `
          <p>Los lookup plugins se ejecutan en el nodo de control y devuelven datos que podés usar en variables o tareas. Se invocan con <code>lookup('plugin', args)</code>.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">lookups.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  # Leer contenido de un archivo local
  - ansible.builtin.debug:
      msg: "{{ lookup('ansible.builtin.file', '/etc/hostname') }}"

  # Leer variable de entorno del nodo de control
  - ansible.builtin.debug:
      msg: "HOME del control node: {{ lookup('ansible.builtin.env', 'HOME') }}"

  # Leer múltiples archivos (devuelve lista)
  - ansible.builtin.debug:
      msg: "{{ lookup('ansible.builtin.fileglob', '/etc/nginx/conf.d/*.conf') }}"

  # Generar contraseña aleatoria y guardarla en archivo local
  - name: Crear usuario con contraseña segura
    ansible.builtin.user:
      name: deploy
      password: "{{ lookup('ansible.builtin.password', '/tmp/deploy.pass length=20 chars=ascii_letters,digits') | password_hash('sha512') }}"

  # Leer secreto de HashiCorp Vault
  - ansible.builtin.debug:
      msg: "{{ lookup('community.hashi_vault.hashi_vault', 'secret/data/mi-app token=' + vault_token) }}"

  # Leer líneas de un archivo como lista
  - ansible.builtin.debug:
      msg: "{{ lookup('ansible.builtin.lines', 'cat /etc/hosts') }}"</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>query() vs lookup():</strong> <code>query('plugin', args)</code> siempre devuelve una lista. <code>lookup('plugin', args)</code> devuelve un string (los elementos unidos por coma) por defecto. Para obtener una lista con lookup, usá <code>lookup(..., wantlist=True)</code>.</div>
          </div>
        `
      },
      {
        title: 'Lookup en vars y condicionales',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">lookup-vars.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">vars:
  # Lookup en la sección vars: se evalúa una vez al inicio
  clave_publica: "{{ lookup('ansible.builtin.file', '~/.ssh/id_rsa.pub') }}"
  token_ci: "{{ lookup('ansible.builtin.env', 'CI_TOKEN') }}"

tasks:
  - name: Agregar clave SSH del usuario actual
    ansible.posix.authorized_key:
      user: deploy
      key: "{{ clave_publica }}"

  - name: Verificar que el token de CI está definido
    ansible.builtin.assert:
      that:
        - token_ci | length > 0
      fail_msg: "La variable de entorno CI_TOKEN no está definida"

  # Lookup con multiple return: leer todas las claves del directorio
  - name: Agregar todas las claves SSH autorizadas
    ansible.posix.authorized_key:
      user: deploy
      key: "{{ item }}"
    loop: "{{ query('ansible.builtin.fileglob', 'files/ssh_keys/*.pub') | map('ansible.builtin.file') | list }}"</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Lookups y seguridad:</strong> Los lookups se ejecutan en el nodo de control con los permisos del usuario que corre Ansible. El lookup <code>password</code> guarda la contraseña en un archivo local — asegurate de proteger ese archivo y no comitearlo a Git.</div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 13,
    moduleId: 3,
    title: 'Filter Plugins',
    objective: 'Crear filtros Jinja2 personalizados en Python para transformar datos en templates y playbooks.',
    duration: '1.5 horas',
    steps: [
      {
        title: 'Crear un filter plugin personalizado',
        body: `
          <p>Los filter plugins son funciones Python que se pueden usar con el operador <code>|</code> en Jinja2. Se colocan en <code>filter_plugins/</code> en el directorio del playbook o del rol.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">filter_plugins/nginx_filters.py</span></div>
            <pre class="language-yaml"><code class="language-yaml">def to_nginx_upstream(servers, weight=1):
    """Convierte una lista de servidores en bloque upstream de nginx."""
    lines = [f'  server {s} weight={weight};' for s in servers]
    return '\n'.join(lines)

def to_env_file(variables):
    """Convierte un dict en formato .env (KEY=value)."""
    return '\n'.join(f'{k}={v}' for k, v in variables.items())

def mask_password(connection_string):
    """Enmascara la contraseña en una connection string."""
    import re
    return re.sub(r'(:)[^:@]+(@)', r'\\1****\\2', connection_string)

class FilterModule:
    """Registro de filtros — Ansible descubre esta clase automáticamente."""
    def filters(self):
        return {
            'to_nginx_upstream': to_nginx_upstream,
            'to_env_file': to_env_file,
            'mask_password': mask_password,
        }</code></pre>
          </div>
        `
      },
      {
        title: 'Usar filtros personalizados en templates y playbooks',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">jinja2</span><span class="code-block-filename">templates/nginx-upstream.conf.j2</span></div>
            <pre class="language-yaml"><code class="language-yaml">upstream backend {
{{ backend_servers | to_nginx_upstream(weight=2) }}
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
    }
}</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">usar-filtros.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">vars:
  backend_servers:
    - "10.0.1.10:3000"
    - "10.0.1.11:3000"
    - "10.0.1.12:3000"
  app_env:
    DATABASE_URL: "postgres://user:secret@db:5432/myapp"
    REDIS_URL: "redis://localhost:6379"

tasks:
  - name: Generar configuración nginx
    ansible.builtin.template:
      src: nginx-upstream.conf.j2
      dest: /etc/nginx/conf.d/upstream.conf

  - name: Mostrar DB URL enmascarada en logs
    ansible.builtin.debug:
      msg: "{{ app_env.DATABASE_URL | mask_password }}"
      # Output: postgres://user:****@db:5432/myapp

  - name: Crear archivo .env
    ansible.builtin.copy:
      content: "{{ app_env | to_env_file }}"
      dest: /opt/mi-app/.env</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Ubicación:</strong> Ansible busca filter plugins en <code>filter_plugins/</code> relativo al playbook o al rol. También podés configurar rutas adicionales en <code>ansible.cfg</code> con <code>filter_plugins = /ruta/mis-filtros</code>.</div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 13,
    moduleId: 4,
    title: 'Callback Plugins',
    objective: 'Configurar callback plugins para mejorar la salida de Ansible y registrar logs de ejecución.',
    duration: '1 hora',
    steps: [
      {
        title: 'Configurar callbacks en ansible.cfg',
        body: `
          <p>Los callback plugins interceptan eventos de Ansible (inicio de tarea, resultado, finalización de play) y pueden formatear la salida, guardar logs, o enviar notificaciones.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
            <pre class="language-yaml"><code class="language-yaml">[defaults]
# Formato de salida — yaml es más legible que el default
stdout_callback = yaml

# Para salida legible por máquinas (CI/CD, parsing)
# stdout_callback = json

# Callbacks adicionales separados por coma
# timer: muestra tiempo total de ejecución
# profile_tasks: muestra tiempo por tarea
# log_plays: guarda log en archivo
callback_whitelist = timer, profile_tasks, log_plays

# Ruta del log (para log_plays callback)
log_path = /var/log/ansible/ansible.log</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>stdout_callback = yaml:</strong> La salida YAML es mucho más legible que el formato por defecto, especialmente para tareas con salida larga. Activalo en todos tus proyectos.</div>
          </div>
        `
      },
      {
        title: 'Callbacks útiles de community.general',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg — callbacks avanzados</span></div>
            <pre class="language-yaml"><code class="language-yaml">[defaults]
stdout_callback = yaml
callback_whitelist = timer, profile_tasks, community.general.slack

# Configuración del callback de Slack
[callback_slack]
webhook_url = https://hooks.slack.com/services/T.../B.../...
channel = #ansible-deploys
username = Ansible Bot</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ver-callbacks-disponibles.sh</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Ver todos los callbacks disponibles
ansible-doc -t callback -l

# Ver documentación de un callback específico
ansible-doc -t callback timer
ansible-doc -t callback profile_tasks

# Callbacks más útiles:
# timer          — tiempo total de ejecución
# profile_tasks  — tiempo por tarea (identifica cuellos de botella)
# log_plays      — guarda log en archivo
# json           — salida JSON para parsing
# community.general.slack — notificaciones a Slack</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>callback_whitelist vs callbacks_enabled:</strong> En Ansible 2.11+, la opción se renombró a <code>callbacks_enabled</code>. <code>callback_whitelist</code> sigue funcionando por compatibilidad, pero en nuevos proyectos usá <code>callbacks_enabled</code>.</div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 13,
    moduleId: 5,
    title: 'Inventory Plugins',
    objective: 'Configurar inventory plugins para generar inventarios dinámicos desde fuentes externas como AWS, Azure o archivos YAML.',
    duration: '1.5 horas',
    steps: [
      {
        title: 'Habilitar y configurar inventory plugins',
        body: `
          <p>Los inventory plugins generan el inventario dinámicamente consultando fuentes externas. Se configuran en <code>ansible.cfg</code> y se usan mediante archivos de configuración YAML con extensión específica.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
            <pre class="language-yaml"><code class="language-yaml">[inventory]
# Plugins habilitados — Ansible los prueba en orden hasta que uno acepta el archivo
enable_plugins = host_list, yaml, ini, auto, amazon.aws.aws_ec2</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">inventory/aws_ec2.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml"># El nombre del archivo debe terminar en aws_ec2.yml o aws_ec2.yaml
plugin: amazon.aws.aws_ec2
regions:
  - us-east-1
  - us-west-2

# Filtrar instancias por tags
filters:
  tag:Environment: produccion
  instance-state-name: running

# Agrupar hosts por tags automáticamente
keyed_groups:
  - key: tags.Role
    prefix: role
  - key: tags.Environment
    prefix: env

# Usar IP privada para conexión
hostnames:
  - private-ip-address</code></pre>
          </div>
        `
      },
      {
        title: 'Inventario construido (constructed) e inventario YAML',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">inventory/constructed.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml"># El plugin "constructed" añade grupos y vars basados en otros facts/vars
plugin: ansible.builtin.constructed

# Crear grupos dinámicamente basados en variables existentes
groups:
  servidores_ubuntu: ansible_distribution == "Ubuntu"
  servidores_redhat: ansible_os_family == "RedHat"
  servidores_prod: "'produccion' in group_names"

# Añadir variables a hosts basadas en condiciones
compose:
  ansible_user: "'deploy' if env == 'produccion' else 'vagrant'"
  ansible_port: "22 if env == 'produccion' else 2222"</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">verificar-inventario.sh</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Verificar qué hosts y grupos genera el inventory plugin
ansible-inventory -i inventory/ --list

# Ver en formato gráfico
ansible-inventory -i inventory/ --graph

# Ver variables de un host específico
ansible-inventory -i inventory/ --host web1.empresa.com</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>auto plugin:</strong> El plugin <code>auto</code> detecta automáticamente qué plugin usar basándose en el campo <code>plugin:</code> del archivo de inventario YAML. Es la forma más conveniente de usar múltiples plugins en el mismo directorio de inventario.</div>
          </div>
        `
      }
    ]
  },
];

export const nivel14Modules: ModuleContent[] = [
  {
    levelId: 14,
    moduleId: 1,
    title: 'Qué son las collections',
    objective: 'Entender el modelo de distribución de Collections: namespaces, FQCN, y cómo se instalan y usan.',
    duration: '1 hora',
    steps: [
      {
        title: 'Collections: el modelo moderno de distribución',
        body: `
          <p>Una collection es un paquete que puede incluir módulos, plugins, roles y playbooks, distribuidos bajo un namespace uniforme. Reemplaza al modelo antiguo donde todo se instalaba globalmente.</p>
          <p>El formato es <code>namespace.collection</code>: por ejemplo, <code>community.general</code>, <code>amazon.aws</code>, <code>kubernetes.core</code>.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">fqcn-ejemplos.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  # FQCN (Fully Qualified Collection Name) — forma recomendada
  - ansible.builtin.copy:         # namespace: ansible, collection: builtin
      src: files/app.conf
      dest: /etc/app.conf

  - community.general.ufw:        # namespace: community, collection: general
      rule: allow
      port: "80"

  - amazon.aws.ec2_instance:      # namespace: amazon, collection: aws
      name: mi-servidor
      state: present

  # Forma corta (solo si la collection está importada en el play)
  - name: Sin FQCN (evitar en proyectos serios)
    copy:                         # Ambiguo: podría ser de cualquier collection
      src: files/app.conf
      dest: /etc/app.conf</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Siempre usá FQCN:</strong> El nombre completo (<code>ansible.builtin.copy</code>) hace el playbook auto-documentado y evita ambigüedades cuando múltiples collections tienen módulos con el mismo nombre.</div>
          </div>
        `
      },
      {
        title: 'Dónde se instalan las collections',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ubicaciones-collections.sh</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Ubicaciones de instalación (en orden de búsqueda):
# 1. collections/ en el directorio del playbook (preferida para proyectos)
# 2. ~/.ansible/collections/ansible_collections/
# 3. Rutas configuradas en ansible.cfg:

# ansible.cfg
[defaults]
collections_path = ./collections:~/.ansible/collections

# Ver collections instaladas y sus rutas
ansible-galaxy collection list

# Estructura en disco:
# ~/.ansible/collections/ansible_collections/
# └── community/
#     └── general/
#         ├── plugins/
#         │   ├── modules/
#         │   └── filter/
#         └── roles/</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>collections/ en el proyecto:</strong> Agregar una carpeta <code>collections/</code> al proyecto y listarlo en <code>.gitignore</code> (igual que <code>node_modules/</code>) es la práctica recomendada para proyectos de equipo. Instalá con <code>ansible-galaxy collection install -r requirements.yml -p ./collections</code>.</div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 14,
    moduleId: 2,
    title: 'Namespaces y versiones',
    objective: 'Gestionar versiones de collections con requirements.yml y entender el sistema de versionado semántico.',
    duration: '1 hora',
    steps: [
      {
        title: 'Instalar y gestionar versiones',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">gestionar-collections.sh</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Instalar la última versión
ansible-galaxy collection install community.general

# Instalar versión exacta
ansible-galaxy collection install amazon.aws:==6.5.0

# Instalar versión mínima
ansible-galaxy collection install community.general:>=7.0.0

# Actualizar a la última versión compatible
ansible-galaxy collection install community.general --upgrade

# Instalar desde requirements.yml
ansible-galaxy collection install -r requirements.yml

# Ver todas las collections instaladas con versiones
ansible-galaxy collection list</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">requirements.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">collections:
  # Versión exacta — máxima reproducibilidad
  - name: community.general
    version: "7.5.0"

  # Rango de versión — permite updates de patch
  - name: community.postgresql
    version: ">=3.2.0,<4.0.0"

  # Sin versión — siempre instala la más reciente (no recomendado en prod)
  - name: community.docker

  # Desde una URL alternativa (Automation Hub, Pulp, etc.)
  - name: mi_empresa.infraestructura
    source: https://automation.mi-empresa.com/api/galaxy/
    version: "1.2.0"</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Fijar versiones exactas en producción:</strong> Usa <code>version: "7.5.0"</code> en vez de <code>>=7.0.0</code> para deployments de producción. Las collections siguen semver, pero un bump de minor puede introducir cambios de comportamiento.</div>
          </div>
        `
      },
      {
        title: 'Verificar y resolver conflictos de versión',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">verificar-collections.sh</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Ver versión instalada de una collection específica
ansible-galaxy collection list community.general

# Ver documentación de un módulo de una collection
ansible-doc community.general.ufw
ansible-doc amazon.aws.ec2_instance

# Verificar que los módulos usados existen en las versiones instaladas
ansible-playbook site.yml --syntax-check

# Si hay conflicto de versiones entre requirements:
# Error: "community.general 7.0.0 is already installed. Use --upgrade to install latest"
# Solución: especificar versión exacta o usar --upgrade
ansible-galaxy collection install -r requirements.yml --upgrade --force</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>ansible.builtin no se instala:</strong> La collection <code>ansible.builtin</code> viene incluida con Ansible y no se puede actualizar separadamente. Su versión está ligada a la versión de Ansible que instalás.</div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 14,
    moduleId: 3,
    title: 'Crear una collection propia',
    objective: 'Crear una collection propia para distribuir módulos, plugins y roles internos de la empresa.',
    duration: '2 horas',
    steps: [
      {
        title: 'Inicializar y estructurar una collection',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">crear-collection.sh</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Crear el scaffold de la collection
ansible-galaxy collection init mi_empresa.infraestructura

# Estructura creada:
# mi_empresa/infraestructura/
# ├── galaxy.yml          # Metadatos: versión, autor, descripción, dependencias
# ├── README.md
# ├── plugins/
# │   ├── modules/        # Módulos personalizados
# │   ├── lookup/         # Lookup plugins
# │   ├── filter/         # Filter plugins
# │   └── action/         # Action plugins
# ├── roles/              # Roles incluidos en la collection
# └── playbooks/          # Playbooks distribuibles

# Agregar módulo
mkdir -p mi_empresa/infraestructura/plugins/modules
# Crear: mi_empresa/infraestructura/plugins/modules/mi_modulo.py

# Agregar rol
cd mi_empresa/infraestructura
ansible-galaxy role init roles/servidor_base</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">mi_empresa/infraestructura/galaxy.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">namespace: mi_empresa
name: infraestructura
version: 1.0.0
readme: README.md
authors:
  - Equipo de Infraestructura <infra@mi-empresa.com>
description: Collection interna con módulos y roles de infraestructura
license: proprietary
tags: [infraestructura, networking, monitoring]
dependencies:
  community.general: ">=7.0.0"</code></pre>
          </div>
        `
      },
      {
        title: 'Build y distribución de la collection',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">build-publish.sh</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Construir el tarball de la collection
cd mi_empresa/infraestructura
ansible-galaxy collection build
# Genera: mi_empresa-infraestructura-1.0.0.tar.gz

# Instalar localmente para testing
ansible-galaxy collection install mi_empresa-infraestructura-1.0.0.tar.gz

# Publicar en Ansible Galaxy (requiere API key)
ansible-galaxy collection publish mi_empresa-infraestructura-1.0.0.tar.gz \
  --api-key $GALAXY_API_KEY

# Publicar en Automation Hub interno
ansible-galaxy collection publish mi_empresa-infraestructura-1.0.0.tar.gz \
  --server https://automation.mi-empresa.com/api/galaxy/ \
  --api-key $AUTOMATION_HUB_TOKEN</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">usar-collection-propia.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">- name: Usar módulos de la collection interna
  hosts: all
  collections:
    - mi_empresa.infraestructura   # Importar para usar sin FQCN

  tasks:
    # Con FQCN (recomendado)
    - mi_empresa.infraestructura.mi_modulo:
        nombre: test

    # Sin FQCN (porque declaramos la collection arriba)
    - mi_empresa.infraestructura.servidor_base:</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div name="box-content"><strong>Semantic Versioning:</strong> Seguí semver estrictamente: MAJOR.MINOR.PATCH. Un bump de MAJOR indica breaking changes. Esto ayuda a los usuarios a saber cuándo actualizar es seguro.</div>
          </div>
        `
      }
    ]
  },
];

export const nivel15Modules: ModuleContent[] = [
  {
    levelId: 15,
    moduleId: 1,
    title: 'Encriptación básica con Vault',
    objective: 'Usar Ansible Vault para encriptar secretos y gestionarlos de forma segura en repositorios.',
    duration: '1.5 horas',
    steps: [
      {
        title: 'Comandos básicos de Vault',
        body: `
          <p>Ansible Vault usa AES-256 para encriptar archivos y strings. Los archivos encriptados pueden commitearse a Git sin exponer su contenido.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">vault-basico.sh</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Crear un archivo encriptado nuevo (abre editor)
ansible-vault create secrets.yml

# Encriptar un archivo existente (in-place)
ansible-vault encrypt group_vars/all/vault.yml

# Ver el contenido sin desencriptar en disco
ansible-vault view secrets.yml

# Editar archivo encriptado (abre editor con contenido descifrado)
ansible-vault edit secrets.yml

# Cambiar la contraseña del vault
ansible-vault rekey secrets.yml

# Desencriptar (CUIDADO: deja el secreto en texto plano)
ansible-vault decrypt secrets.yml

# Encriptar solo un string (para pegar inline en YAML)
ansible-vault encrypt_string 'mi-password-super-secreto' --name 'db_password'
# Output listo para pegar en un YAML:</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">group_vars/all/vault.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">db_password: !vault |
  $ANSIBLE_VAULT;1.1;AES256
  66386439653236336462626566653063336164663966303231363934653561363264383833643636
  3165396566663335663831303838613566653633656135640a383962643935396438386139663936
  62313665356631393562313530653964646436326533316436653762353332343535363839616638
  6263363565613234640a653663666535323365313066333034643233363630356438383339613665
  3261</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ejecutar-con-vault.sh</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Pedir contraseña interactivamente
ansible-playbook site.yml --ask-vault-pass

# Usar archivo con la contraseña (para CI/CD)
ansible-playbook site.yml --vault-password-file ~/.vault_pass</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>encrypt_string:</strong> Es útil para encriptar un solo valor y pegarlo directamente en un archivo YAML que no está completamente encriptado. El valor <code>!vault |</code> le indica a Ansible que debe desencriptarlo.</div>
          </div>
        `
      },
      {
        title: 'Referenciar variables de vault en playbooks',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">group_vars/all/vars.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Archivo en texto plano — referencia variables del vault
db_host: db.empresa.com
db_port: 5432
db_name: produccion

# Referencia a la variable encriptada en vault.yml
# El nombre con prefijo vault_ es una convención recomendada
db_password: "{{ vault_db_password }}"
api_token: "{{ vault_api_token }}"</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">group_vars/all/vault.yml (encriptado)</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Este archivo está completamente encriptado con ansible-vault
vault_db_password: "mi-password-super-secreto"
vault_api_token: "sk-prod-1234567890abcdef"</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Nunca commites la contraseña del vault:</strong> El archivo <code>.vault_pass</code> o cualquier archivo con la contraseña debe estar en <code>.gitignore</code>. La contraseña debe vivir en el gestor de secretos del CI/CD (GitHub Actions Secrets, GitLab CI Variables, etc.).</div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 15,
    moduleId: 2,
    title: 'Vault IDs y múltiples vaults',
    objective: 'Gestionar múltiples contraseñas de vault para distintos entornos usando Vault IDs.',
    duration: '1 hora',
    steps: [
      {
        title: 'Vault IDs para múltiples entornos',
        body: `
          <p>Los Vault IDs permiten usar distintas contraseñas para distintos archivos. Esto es útil cuando dev, staging y producción tienen secretos diferentes con contraseñas diferentes.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">vault-ids.sh</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Crear vault con ID específico
# Formato: --vault-id LABEL@SOURCE
# SOURCE puede ser: prompt (pedir interactivo), archivo, o script

ansible-vault create --vault-id dev@prompt secrets_dev.yml
ansible-vault create --vault-id staging@prompt secrets_staging.yml
ansible-vault create --vault-id prod@/etc/ansible/vault_prod.pass secrets_prod.yml

# Encriptar string con vault ID específico
ansible-vault encrypt_string 'prod-secret' --vault-id prod@prompt --name 'db_password'

# Ejecutar playbook con múltiples vault passwords
ansible-playbook site.yml \
  --vault-id dev@prompt \
  --vault-id prod@/etc/ansible/vault_prod.pass

# Ansible detecta automáticamente qué vault ID usar para cada archivo</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>El label en el header:</strong> Cuando encriptás con <code>--vault-id dev@prompt</code>, el archivo encriptado guarda el label <code>dev</code> en el header. Al descifrar, Ansible busca el vault ID que corresponde al label del archivo.</div>
          </div>
        `
      },
      {
        title: 'Scripts como fuente de contraseña de vault',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">scripts/vault_pass.py</span></div>
            <pre class="language-yaml"><code class="language-yaml">#!/usr/bin/env python3
"""
Script de vault password: obtiene la contraseña de un secret manager.
Ansible lo ejecuta y lee la contraseña de stdout.
"""
import subprocess
import sys

def get_vault_password():
    # Ejemplo: leer de AWS Secrets Manager
    result = subprocess.run(
        ['aws', 'secretsmanager', 'get-secret-value',
         '--secret-id', 'ansible/vault-password',
         '--query', 'SecretString',
         '--output', 'text'],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        sys.exit(1)
    print(result.stdout.strip())

get_vault_password()</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">usar-script-vault.sh</span></div>
            <pre class="language-yaml"><code class="language-yaml">chmod +x scripts/vault_pass.py

# Usar el script como fuente de contraseña
ansible-playbook site.yml --vault-password-file scripts/vault_pass.py

# O configurar en ansible.cfg
# [defaults]
# vault_password_file = scripts/vault_pass.py</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Seguridad del script:</strong> El script de vault password debe estar protegido con permisos 700 y no debe contener la contraseña en texto plano. Debe obtenerla de un sistema externo (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault, etc.).</div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 15,
    moduleId: 3,
    title: 'Buenas prácticas de seguridad',
    objective: 'Aplicar las mejores prácticas para gestionar secretos de Ansible de forma segura en equipos y pipelines de CI/CD.',
    duration: '1 hora',
    steps: [
      {
        title: 'Estructura recomendada de group_vars con vault',
        body: `
          <p>La mejor práctica es separar variables en dos archivos: uno en texto plano con referencias, y otro completamente encriptado con los valores reales. Esto permite ver qué variables existen sin revelar sus valores.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">estructura-vault.sh</span></div>
            <pre class="language-yaml"><code class="language-yaml">group_vars/
├── all/
│   ├── vars.yml      # Texto plano — referencia a variables vault
│   └── vault.yml     # Encriptado — valores reales con prefijo vault_
├── produccion/
│   ├── vars.yml
│   └── vault.yml     # Secretos específicos de producción
└── staging/
    ├── vars.yml
    └── vault.yml     # Secretos específicos de staging</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.gitignore</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Nunca commitear contraseñas de vault
.vault_pass
*.vault_pass
vault_pass.txt

# No commitear collections instaladas localmente
collections/ansible_collections/

# No commitear el caché de facts
.ansible/
/tmp/ansible_facts_cache/</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Convención vault_:</strong> Nombrar las variables encriptadas con el prefijo <code>vault_</code> (ej: <code>vault_db_password</code>) hace inmediatamente visible dónde viene cada secreto. La variable "pública" <code>db_password</code> referencia a <code>vault_db_password</code>.</div>
          </div>
        `
      },
      {
        title: 'Integración con CI/CD',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/deploy.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">name: Deploy con Ansible Vault
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Instalar Ansible
        run: pip install ansible

      - name: Crear archivo de vault password
        run: echo "$\{{ secrets.VAULT_PASSWORD }}" > /tmp/.vault_pass
        # El secret VAULT_PASSWORD se configura en GitHub → Settings → Secrets

      - name: Instalar dependencias
        run: ansible-galaxy install -r requirements.yml

      - name: Ejecutar playbook
        run: >
          ansible-playbook -i inventory/produccion
          --vault-password-file /tmp/.vault_pass
          playbooks/site.yml

      - name: Limpiar vault password
        if: always()
        run: rm -f /tmp/.vault_pass</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Limpiar después del uso:</strong> Siempre eliminá el archivo temporal de contraseña en un paso <code>if: always()</code> para garantizar que se borre incluso si el pipeline falla. En entornos más seguros, usá el script de vault que consulta el secret manager directamente sin escribir a disco.</div>
          </div>
        `
      }
    ]
  },
];

export const nivel16Modules: ModuleContent[] = [
  {
    levelId: 16,
    moduleId: 1,
    title: 'SSH Multiplexing y Pipelining',
    objective: 'Configurar SSH multiplexing y pipelining para reducir drásticamente el overhead de conexión en flotas grandes.',
    duration: '1 hora',
    steps: [
      {
        title: 'SSH Multiplexing — reutilizar conexiones',
        body: `
          <p>Por defecto, Ansible abre y cierra una conexión SSH por tarea. Con SSH multiplexing, la primera conexión queda abierta y las siguientes tareas la reutilizan, eliminando el handshake SSH por tarea.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
            <pre class="language-yaml"><code class="language-yaml">[ssh_connection]
# ControlMaster=auto: reutiliza conexiones SSH existentes
# ControlPersist=60s: mantiene la conexión abierta 60s después del último uso
ssh_args = -o ControlMaster=auto -o ControlPersist=60s

# Directorio donde se guardan los sockets de control
control_path_dir = ~/.ansible/cp

# Deshabilitar comprobación de host conocido (solo en entornos de lab)
# ssh_args = -o StrictHostKeyChecking=no</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Impacto:</strong> En un playbook con 20 tareas sobre 50 hosts, el multiplexing elimina ~19 handshakes SSH por host. En redes con alta latencia (100ms+), esto puede reducir el tiempo de ejecución a la mitad.</div>
          </div>
        `
      },
      {
        title: 'Pipelining — eliminar escrituras temporales',
        body: `
          <p>Sin pipelining, Ansible escribe el módulo Python en un archivo temporal en el host, lo ejecuta, y luego lo borra. Con pipelining, el código se envía directamente a stdin de Python, eliminando esas escrituras.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
            <pre class="language-yaml"><code class="language-yaml">[connection]
pipelining = True    # Elimina escritura de módulo a disco en el host remoto
                     # Reduce conexiones SSH de 3 a 1 por tarea</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg — configuración completa optimizada</span></div>
            <pre class="language-yaml"><code class="language-yaml">[defaults]
forks = 20                    # Paralelismo
gathering = smart             # Fact cache
fact_caching = jsonfile
fact_caching_connection = /tmp/ansible_fact_cache
fact_caching_timeout = 86400

[connection]
pipelining = True

[ssh_connection]
ssh_args = -o ControlMaster=auto -o ControlPersist=60s
control_path_dir = ~/.ansible/cp</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Pipelining y requiretty:</strong> Pipelining no funciona si el host tiene <code>requiretty</code> habilitado en sudoers. Para solucionarlo, agregá <code>Defaults !requiretty</code> en <code>/etc/sudoers.d/ansible</code> en los hosts administrados.</div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 16,
    moduleId: 2,
    title: 'Forks y ejecución paralela',
    objective: 'Configurar forks, serial y estrategias de ejecución para controlar el paralelismo y hacer rolling updates.',
    duration: '1.5 horas',
    steps: [
      {
        title: 'Forks y estrategias de ejecución',
        body: `
          <p>Ansible ejecuta tareas en paralelo sobre múltiples hosts. El número de hosts procesados simultáneamente se controla con <code>forks</code>. La estrategia determina el orden de ejecución.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
            <pre class="language-yaml"><code class="language-yaml">[defaults]
# Por defecto: 5 hosts en paralelo — aumentar según capacidad del control node
forks = 20</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">estrategias.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">- name: Estrategia linear (por defecto)
  hosts: servidores_web
  strategy: linear    # Todos los hosts ejecutan tarea 1, luego tarea 2, etc.
  tasks:
    - ansible.builtin.debug: msg="Tarea 1"
    - ansible.builtin.debug: msg="Tarea 2"

- name: Estrategia free — cada host va a su propio ritmo
  hosts: servidores_web
  strategy: free      # Los hosts rápidos no esperan a los lentos
  tasks:
    - ansible.builtin.command: /opt/scripts/tarea-larga.sh

- name: Rolling update — actualizar de a lotes
  hosts: servidores_web
  serial: 2           # Actualizar 2 hosts a la vez (también acepta %)
  # serial: "25%"     # Actualizar 25% de los hosts a la vez
  tasks:
    - ansible.builtin.service:
        name: mi-app
        state: restarted</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>serial con porcentaje:</strong> <code>serial: "25%"</code> es ideal para rolling updates en flotas de tamaño variable. Si tenés 100 servidores, actualiza de a 25. Si tenés 8, actualiza de a 2 (25% redondeado).</div>
          </div>
        `
      },
      {
        title: 'Tareas largas en background con async y poll',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">async-poll.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">tasks:
  # Lanzar tarea larga en background (no bloquea el play)
  - name: Iniciar backup en background
    ansible.builtin.command: /opt/scripts/backup-completo.sh
    async: 3600      # Timeout máximo en segundos
    poll: 0          # poll: 0 = fire and forget (no esperar resultado)
    register: backup_job

  # Seguir con otras tareas mientras el backup corre...
  - name: Actualizar paquetes mientras hace backup
    ansible.builtin.package:
      name: "*"
      state: latest

  # Verificar resultado de la tarea async
  - name: Esperar que el backup termine
    ansible.builtin.async_status:
      jid: "{{ backup_job.ansible_job_id }}"
    register: backup_result
    until: backup_result.finished
    retries: 60
    delay: 60        # Verificar cada minuto

  # Alternativa: poll > 0 espera activamente
  - name: Tarea larga con polling activo
    ansible.builtin.command: /opt/scripts/migracion.sh
    async: 1800      # Timeout: 30 minutos
    poll: 30         # Verificar cada 30 segundos (bloquea hasta terminar)</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>async con become:</strong> Las tareas async con <code>become: true</code> pueden tener problemas. El proceso se lanza con sudo pero el status check puede no encontrar el job. Usá <code>become_flags: -i</code> o evitá async con become cuando sea posible.</div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 16,
    moduleId: 3,
    title: 'Fact Cache',
    objective: 'Configurar el caché de facts para evitar la recolección repetida y acelerar playbooks en entornos grandes.',
    duration: '1 hora',
    steps: [
      {
        title: 'Configurar fact_caching en ansible.cfg',
        body: `
          <p>El fact cache guarda los facts recolectados por host y los reutiliza en ejecuciones posteriores. Con <code>gathering = smart</code>, Ansible solo recolecta si el caché expiró.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
            <pre class="language-yaml"><code class="language-yaml">[defaults]
# smart: usa caché si existe y no expiró; always: siempre recolecta; explicit: nunca recolecta automáticamente
gathering = smart

# Backend jsonfile: simple, sin dependencias, un JSON por host en el directorio
fact_caching = jsonfile
fact_caching_connection = /tmp/ansible_fact_cache
fact_caching_timeout = 86400    # 24 horas en segundos</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg — backend Redis (entornos distribuidos)</span></div>
            <pre class="language-yaml"><code class="language-yaml">[defaults]
gathering = smart
fact_caching = redis
fact_caching_connection = redis://localhost:6379/0
fact_caching_timeout = 86400

# Para Redis con autenticación:
# fact_caching_connection = redis://usuario:password@redis.empresa.com:6379/0</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Redis para equipos:</strong> Si múltiples usuarios o runners de CI/CD ejecutan playbooks sobre la misma flota, usá Redis como backend de fact cache. Todos compartirán el mismo caché y evitarán recolectar facts redundantemente.</div>
          </div>
        `
      },
      {
        title: 'Invalidar y gestionar el caché',
        body: `
          <p>Podés invalidar el fact cache de un host específico borrando su archivo, o forzar una recolección fresca con <code>gather_facts: true</code> y <code>fact_caching_timeout: 0</code>.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">gestionar-fact-cache.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Borrar cache de un host específico (jsonfile backend)
rm /tmp/ansible_fact_cache/web1.empresa.com

# Borrar todo el cache
rm -rf /tmp/ansible_fact_cache/*

# Forzar recolección ignorando cache
ansible-playbook site.yml -e "gather_facts=true" --flush-cache

# Ver qué hosts tienen facts cacheados
ls -lh /tmp/ansible_fact_cache/</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Facts desactualizados:</strong> Si un host cambia de IP, nombre de host o hardware, los facts cacheados estarán desactualizados. Establecé un <code>fact_caching_timeout</code> razonable (86400 = 24h) o invalidá el cache manualmente después de cambios de infraestructura.</div>
          </div>
        `
      }
    ]
  },
];

export const nivel17Modules: ModuleContent[] = [
  {
    levelId: 17, moduleId: 1, title: 'Check Mode y Diff Mode', duration: '1 hora',
    objective: 'Usar --check y --diff para validar cambios sin aplicarlos.',
    steps: [{
      title: 'Dry run y visualización de diferencias',
      body: `
        <p><code>--check</code> ejecuta el playbook sin hacer cambios reales. <code>--diff</code> muestra exactamente qué cambiaría en archivos de texto. Combinados son la herramienta más potente para revisar antes de aplicar.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">check-diff.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Dry run completo — no toca nada
ansible-playbook site.yml --check

# Mostrar diff de archivos que cambiarían
ansible-playbook site.yml --check --diff

# Forzar que una tarea específica siempre corra en check mode
# (útil para tareas de validación que no hacen daño)
# En el playbook:
# - name: Validar configuración
#   check_mode: false   # Siempre ejecuta, incluso con --check</code></pre>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">check-mode-control.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">tasks:
  - name: Crear directorio (siempre corre, incluso en --check)
    ansible.builtin.file:
      path: /opt/app
      state: directory
    check_mode: false

  - name: Copiar config (respeta --check)
    ansible.builtin.template:
      src: app.conf.j2
      dest: /etc/app/app.conf
    # check_mode: true es el default — respeta --check

  - name: Tarea solo en check mode (para validaciones)
    ansible.builtin.assert:
      that:
        - ansible_memtotal_mb >= 2048
      fail_msg: "El host necesita al menos 2 GB de RAM"
    when: ansible_check_mode</code></pre>
        </div>
        <div class="tip-box"><span class="box-icon">💡</span><div class="box-content"><strong>Flujo recomendado:</strong> Siempre corré <code>--check --diff</code> antes de aplicar cambios en producción. Si el diff se ve bien, correlo sin <code>--check</code>.</div></div>
      `
    }]
  },
  {
    levelId: 17, moduleId: 2, title: 'Molecule', duration: '2 horas',
    objective: 'Testear roles de Ansible con Molecule y Docker.',
    steps: [{
      title: 'Instalar y usar Molecule',
      body: `
        <p>Molecule es el framework de testing para roles de Ansible. Crea infraestructura temporal (Docker, Vagrant, etc.), aplica el role, verifica el resultado y destruye la infraestructura.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">molecule-setup.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Instalar Molecule con driver Docker
pip install molecule molecule-docker

# Inicializar Molecule en un role existente
cd roles/servidor_web
molecule init scenario

# Estructura creada:
# molecule/default/
#   molecule.yml    — configuración del driver
#   converge.yml    — aplica el role
#   verify.yml      — tests de verificación

# Comandos principales
molecule test        # Ciclo completo: create→converge→verify→destroy
molecule converge    # Solo aplica el role (útil durante desarrollo)
molecule verify      # Solo corre los tests
molecule destroy     # Destruye los contenedores
molecule login       # SSH al contenedor de test</code></pre>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">molecule/default/molecule.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">---
dependency:
  name: galaxy

driver:
  name: docker

platforms:
  - name: ubuntu-22
    image: geerlingguy/docker-ubuntu2204-ansible
    pre_build_image: true
  - name: centos-9
    image: geerlingguy/docker-centos9-ansible
    pre_build_image: true

provisioner:
  name: ansible

verifier:
  name: ansible</code></pre>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">molecule/default/verify.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">---
- name: Verificar que nginx está instalado y corriendo
  hosts: all
  tasks:
    - name: Verificar que nginx está instalado
      ansible.builtin.package_facts:
        manager: auto

    - name: Fallar si nginx no está instalado
      ansible.builtin.assert:
        that: "'nginx' in ansible_facts.packages"
        fail_msg: "nginx no está instalado"

    - name: Verificar que el servicio está activo
      ansible.builtin.service_facts:

    - name: Fallar si nginx no está corriendo
      ansible.builtin.assert:
        that: "ansible_facts.services['nginx.service'].state == 'running'"</code></pre>
        </div>
        <div class="tip-box"><span class="box-icon">💡</span><div class="box-content"><strong>CI/CD:</strong> Integrá Molecule en GitHub Actions para que cada push al role corra los tests automáticamente.</div></div>
      `
    }]
  },
  {
    levelId: 17, moduleId: 3, title: 'Ansible Lint y yamllint', duration: '1 hora',
    objective: 'Detectar errores y aplicar buenas prácticas automáticamente.',
    steps: [{
      title: 'Linting de playbooks y roles',
      body: `
        <p><code>ansible-lint</code> detecta problemas de estilo, seguridad y compatibilidad en tus playbooks. <code>yamllint</code> verifica la sintaxis YAML pura.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">lint.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Instalar
pip install ansible-lint yamllint

# Ejecutar sobre playbook
ansible-lint playbooks/site.yml

# Ejecutar sobre todos los roles
ansible-lint roles/

# yamllint
yamllint playbooks/site.yml</code></pre>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.ansible-lint</span></div>
          <pre class="language-yaml"><code class="language-yaml">---
# Reglas a ignorar
skip_list:
  - yaml[line-length]    # Líneas largas en bloques de texto
  - name[casing]         # Nombres en español con mayúsculas

# Niveles: warning, error
warn_list:
  - experimental

# Directorios a excluir
exclude_paths:
  - .cache/
  - molecule/</code></pre>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.yamllint</span></div>
          <pre class="language-yaml"><code class="language-yaml">---
extends: default
rules:
  line-length:
    max: 120
  truthy:
    allowed-values: ['true', 'false']</code></pre>
        </div>
        <div class="tip-box"><span class="box-icon">💡</span><div class="box-content"><strong>Pre-commit hook:</strong> Instalá <code>pre-commit</code> y configuralo para correr ansible-lint y yamllint antes de cada commit.</div></div>
      `
    }]
  },
];

export const nivel18Modules: ModuleContent[] = [
  {
    levelId: 18, moduleId: 1, title: 'Docker y Podman', duration: '2 horas',
    objective: 'Gestionar contenedores Docker y Podman con Ansible.',
    steps: [{
      title: 'Módulos de contenedores',
      body: `
        <p>La collection <code>community.docker</code> provee módulos para gestionar contenedores, imágenes, redes y volúmenes Docker. Funciona igual con Podman usando <code>containers.podman</code>.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">docker-deploy.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">- name: Desplegar contenedores con Ansible
  hosts: servidores_docker
  tasks:
    - name: Instalar Docker
      ansible.builtin.package:
        name: docker-ce
        state: present

    - name: Iniciar servicio Docker
      ansible.builtin.service:
        name: docker
        state: started
        enabled: true

    - name: Desplegar contenedor nginx
      community.docker.docker_container:
        name: nginx-web
        image: "nginx:{{ nginx_version | default('1.25') }}"
        ports:
          - "80:80"
          - "443:443"
        volumes:
          - /opt/web:/usr/share/nginx/html:ro
          - /etc/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
        restart_policy: unless-stopped
        state: started

    - name: Desplegar stack completo con Compose
      community.docker.docker_compose_v2:
        project_src: /opt/mi-app
        state: present</code></pre>
        </div>
        <div class="tip-box"><span class="box-icon">💡</span><div class="box-content"><strong>Podman rootless:</strong> Para Podman sin root usá <code>containers.podman.podman_container</code> con <code>become: false</code> y el usuario correcto.</div></div>
      `
    }]
  },
  {
    levelId: 18, moduleId: 2, title: 'Kubernetes', duration: '2 horas',
    objective: 'Desplegar y gestionar recursos de Kubernetes con Ansible.',
    steps: [{
      title: 'Collection kubernetes.core',
      body: `
        <p>La collection <code>kubernetes.core</code> permite gestionar cualquier recurso de Kubernetes desde Ansible, usando el mismo kubeconfig de <code>kubectl</code>.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalar-collection.sh</span></div>
          <pre class="language-bash"><code class="language-bash">ansible-galaxy collection install kubernetes.core</code></pre>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">k8s-deploy.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">- name: Desplegar en Kubernetes
  hosts: localhost
  gather_facts: false
  tasks:
    - name: Crear namespace
      kubernetes.core.k8s:
        state: present
        definition:
          apiVersion: v1
          kind: Namespace
          metadata:
            name: mi-app

    - name: Desplegar aplicación
      kubernetes.core.k8s:
        state: present
        definition:
          apiVersion: apps/v1
          kind: Deployment
          metadata:
            name: mi-app
            namespace: mi-app
          spec:
            replicas: "{{ replicas | default(3) }}"
            selector:
              matchLabels:
                app: mi-app
            template:
              metadata:
                labels:
                  app: mi-app
              spec:
                containers:
                  - name: mi-app
                    image: "mi-app:{{ app_version }}"
                    ports:
                      - containerPort: 8080

    - name: Esperar que el deploy esté listo
      kubernetes.core.k8s_info:
        kind: Deployment
        name: mi-app
        namespace: mi-app
      register: deploy_info
      until: deploy_info.resources[0].status.readyReplicas == replicas | int
      retries: 20
      delay: 10</code></pre>
        </div>
      `
    }]
  },
  {
    levelId: 18, moduleId: 3, title: 'AWS, Azure y GCP', duration: '3 horas',
    objective: 'Provisionar infraestructura cloud con Ansible.',
    steps: [{
      title: 'Módulos cloud',
      body: `
        <p>Ansible tiene collections oficiales para los principales proveedores cloud. Permiten provisionar VMs, redes, storage y servicios administrados.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalar-collections.sh</span></div>
          <pre class="language-bash"><code class="language-bash">ansible-galaxy collection install amazon.aws
ansible-galaxy collection install azure.azcollection
ansible-galaxy collection install google.cloud</code></pre>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">aws-ec2.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">- name: Provisionar en AWS
  hosts: localhost
  tasks:
    - name: Crear instancia EC2
      amazon.aws.ec2_instance:
        name: web-server-01
        instance_type: t3.medium
        image_id: ami-0c55b159cbfafe1f0
        region: us-east-1
        vpc_subnet_id: "{{ subnet_id }}"
        security_groups: [sg-web]
        key_name: mi-llave-ssh
        tags:
          Environment: produccion
          Role: webserver
      register: ec2_result

    - name: Agregar host al inventory dinámico
      ansible.builtin.add_host:
        name: "{{ ec2_result.instances[0].public_ip_address }}"
        groups: nuevos_servidores</code></pre>
        </div>
        <div class="tip-box"><span class="box-icon">💡</span><div class="box-content"><strong>Credenciales:</strong> Usá variables de entorno (<code>AWS_ACCESS_KEY_ID</code>, <code>AWS_SECRET_ACCESS_KEY</code>) o roles IAM para autenticación. Nunca pongas credenciales en el playbook.</div></div>
      `
    }]
  },
  {
    levelId: 18, moduleId: 4, title: 'VMware y Proxmox', duration: '2 horas',
    objective: 'Gestionar VMs en VMware vSphere y Proxmox con Ansible.',
    steps: [{
      title: 'Módulos de virtualización',
      body: `
        <p>Para entornos on-premise, Ansible se integra con VMware vSphere via <code>community.vmware</code> y con Proxmox via <code>community.general</code>.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">vmware-clone.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">- name: Clonar VM en vSphere
  hosts: localhost
  tasks:
    - name: Clonar desde template
      community.vmware.vmware_guest:
        hostname: "{{ vcenter_hostname }}"
        username: "{{ vcenter_username }}"
        password: "{{ vcenter_password }}"
        validate_certs: false
        datacenter: DC-Principal
        name: "web-server-{{ inventory_hostname }}"
        template: Ubuntu-22-Template
        folder: /VMs/Produccion
        hardware:
          memory_mb: 4096
          num_cpus: 2
        networks:
          - name: VM Network
            ip: "{{ vm_ip }}"
            netmask: 255.255.255.0
            gateway: "{{ gateway }}"
        state: poweredon
        wait_for_ip_address: true</code></pre>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">proxmox-lxc.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">- name: Crear contenedor LXC en Proxmox
  hosts: localhost
  tasks:
    - name: Crear LXC
      community.general.proxmox:
        api_host: pve.empresa.com
        api_user: root@pam
        api_password: "{{ proxmox_password }}"
        vmid: "{{ vmid }}"
        node: pve1
        ostemplate: local:vztmpl/ubuntu-22.04-standard.tar.zst
        hostname: "{{ inventory_hostname }}"
        memory: 2048
        disk: local-lvm:20
        netif:
          net0: name=eth0,bridge=vmbr0,ip={{ vm_ip }}/24,gw={{ gateway }}
        state: present</code></pre>
        </div>
      `
    }]
  },
];

export const nivel19Modules: ModuleContent[] = [
  {
    levelId: 19, moduleId: 1, title: 'Crear módulos propios', duration: '3 horas',
    objective: 'Escribir módulos Python personalizados para Ansible.',
    steps: [{
      title: 'Estructura de un módulo Ansible',
      body: `
        <p>Un módulo de Ansible es un script Python que recibe argumentos, ejecuta lógica, y devuelve un JSON. Se coloca en <code>library/</code> junto al playbook o dentro de un role.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">library/mi_modulo.py</span></div>
          <pre class="language-python"><code class="language-python">#!/usr/bin/python
# -*- coding: utf-8 -*-

DOCUMENTATION = r"""
module: mi_modulo
short_description: Módulo de ejemplo
description:
  - Demuestra la estructura básica de un módulo Ansible.
options:
  name:
    description: Nombre del recurso
    required: true
    type: str
  state:
    description: Estado deseado
    default: present
    choices: [present, absent]
    type: str
"""

from ansible.module_utils.basic import AnsibleModule

def run_module():
    # Definir los argumentos aceptados
    module_args = dict(
        name=dict(type='str', required=True),
        state=dict(type='str', default='present',
                   choices=['present', 'absent']),
    )

    result = dict(changed=False, message='', name='')
    module = AnsibleModule(
        argument_spec=module_args,
        supports_check_mode=True,  # Soportar --check
    )

    name = module.params['name']
    state = module.params['state']

    # En check mode, no hacer cambios reales
    if module.check_mode:
        module.exit_json(**result)

    # Tu lógica aquí
    if state == 'present':
        result['changed'] = True
        result['message'] = f"Recurso '{name}' creado"
        result['name'] = name
    else:
        result['changed'] = True
        result['message'] = f"Recurso '{name}' eliminado"

    module.exit_json(**result)

def main():
    run_module()

if __name__ == '__main__':
    main()</code></pre>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">usar-modulo.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">- name: Usar módulo propio
  hosts: localhost
  tasks:
    - name: Crear recurso
      mi_modulo:
        name: mi-recurso
        state: present
      register: resultado

    - ansible.builtin.debug:
        msg: "{{ resultado.message }}"</code></pre>
        </div>
        <div class="tip-box"><span class="box-icon">💡</span><div class="box-content"><strong>Retorno:</strong> Siempre incluí <code>changed</code> y <code>failed</code> en el resultado. Ansible los usa para handlers y lógica condicional.</div></div>
      `
    }]
  },
  {
    levelId: 19, moduleId: 2, title: 'Crear plugins propios', duration: '2 horas',
    objective: 'Desarrollar filter plugins y lookup plugins personalizados.',
    steps: [{
      title: 'Filter plugin y Lookup plugin',
      body: `
        <p>Los filter plugins agregan funciones Jinja2 personalizadas. Los lookup plugins permiten obtener datos de fuentes externas.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">filter_plugins/empresa_filters.py</span></div>
          <pre class="language-python"><code class="language-python">def to_nginx_upstream(servers, port=80):
    """Convierte lista de IPs a bloque upstream de nginx."""
    lines = [f'  server {s}:{port};' for s in servers]
    return '\n'.join(lines)

def mask_password(conn_string):
    """Enmascara contraseñas en connection strings."""
    import re
    return re.sub(r'://([^:]+):([^@]+)@', r'://\\1:****@', conn_string)

class FilterModule:
    def filters(self):
        return {
            'to_nginx_upstream': to_nginx_upstream,
            'mask_password': mask_password,
        }</code></pre>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">lookup_plugins/config_service.py</span></div>
          <pre class="language-python"><code class="language-python">from ansible.plugins.lookup import LookupBase
import requests

class LookupModule(LookupBase):
    def run(self, terms, variables=None, **kwargs):
        """Obtiene configuración de un servicio HTTP interno."""
        results = []
        for key in terms:
            resp = requests.get(f"http://config-service/api/{key}")
            results.append(resp.json()['value'])
        return results</code></pre>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">usar-plugins.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">tasks:
  - name: Usar filter plugin
    ansible.builtin.template:
      src: nginx.conf.j2
      dest: /etc/nginx/nginx.conf
    vars:
      upstream_block: "{{ backend_ips | to_nginx_upstream(8080) }}"

  - name: Usar lookup plugin
    ansible.builtin.debug:
      msg: "{{ lookup('config_service', 'db.host') }}"</code></pre>
        </div>
      `
    }]
  },
  {
    levelId: 19, moduleId: 3, title: 'Collections propias', duration: '2 horas',
    objective: 'Empaquetar módulos, plugins y roles en una collection propia.',
    steps: [{
      title: 'Crear y publicar una collection',
      body: `
        <p>Una collection agrupa módulos, plugins, roles y playbooks bajo un namespace. El formato es <code>namespace.collection</code>.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">crear-collection.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Crear estructura base
ansible-galaxy collection init mi_empresa.infraestructura

# Estructura generada:
# mi_empresa/infraestructura/
#   README.md
#   galaxy.yml          — metadatos de la collection
#   plugins/
#     modules/          — módulos Python
#     filter/           — filter plugins
#     lookup/           — lookup plugins
#   roles/              — roles incluidos
#   playbooks/          — playbooks de ejemplo
#   docs/

# Agregar el módulo que creamos
cp library/mi_modulo.py mi_empresa/infraestructura/plugins/modules/

# Agregar el filter plugin
cp filter_plugins/empresa_filters.py mi_empresa/infraestructura/plugins/filter/

# Build
cd mi_empresa/infraestructura
ansible-galaxy collection build

# Publicar en Galaxy (requiere API key)
ansible-galaxy collection publish mi_empresa-infraestructura-1.0.0.tar.gz</code></pre>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">mi_empresa/infraestructura/galaxy.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">namespace: mi_empresa
name: infraestructura
version: 1.0.0
readme: README.md
description: Collection interna de automatización de infraestructura
license:
  - MIT
tags: [linux, nginx, postgresql, devops]
dependencies:
  community.general: ">=7.0.0"</code></pre>
        </div>
      `
    }]
  },
  {
    levelId: 19, moduleId: 4, title: 'Testing de módulos', duration: '1.5 horas',
    objective: 'Escribir tests unitarios para módulos Ansible con pytest.',
    steps: [{
      title: 'Unit tests con pytest',
      body: `
        <p>Los módulos Ansible se pueden testear con pytest usando el helper <code>set_module_args</code> de ansible-test.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">setup-tests.sh</span></div>
          <pre class="language-bash"><code class="language-bash">pip install pytest pytest-mock

# Estructura de tests
# tests/unit/plugins/modules/test_mi_modulo.py</code></pre>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">tests/unit/test_mi_modulo.py</span></div>
          <pre class="language-python"><code class="language-python">import pytest
from unittest.mock import patch
from ansible.module_utils import basic
from ansible.module_utils.common.text.converters import to_bytes
import json

# Importar el módulo a testear
import sys
sys.path.insert(0, 'library')
import mi_modulo

def set_module_args(args):
    """Helper para configurar argumentos del módulo."""
    args = json.dumps({'ANSIBLE_MODULE_ARGS': args})
    basic._ANSIBLE_ARGS = to_bytes(args)

def test_module_present():
    set_module_args({'name': 'test-recurso', 'state': 'present'})
    with pytest.raises(SystemExit) as ex:
        mi_modulo.main()
    # SystemExit(0) = success
    assert ex.value.code == 0

def test_module_absent():
    set_module_args({'name': 'test-recurso', 'state': 'absent'})
    with pytest.raises(SystemExit) as ex:
        mi_modulo.main()
    assert ex.value.code == 0

def test_module_missing_required():
    set_module_args({})  # Falta 'name' que es required
    with pytest.raises(SystemExit) as ex:
        mi_modulo.main()
    assert ex.value.code == 1  # failure</code></pre>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">correr-tests.sh</span></div>
          <pre class="language-bash"><code class="language-bash">pytest tests/unit/ -v</code></pre>
        </div>
      `
    }]
  },
];

export const nivel20Modules: ModuleContent[] = [
  {
    levelId: 20, moduleId: 1, title: 'Estructura del repositorio de Ansible', duration: '2 horas',
    objective: 'Entender cómo está organizado el código fuente de Ansible Core.',
    steps: [{
      title: 'Mapa del repositorio',
      body: `
        <p>El código fuente de Ansible está en <a href="https://github.com/ansible/ansible">github.com/ansible/ansible</a>. Conocer su estructura te permite entender qué ocurre internamente y contribuir al proyecto.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">estructura-ansible-core.sh</span></div>
          <pre class="language-bash"><code class="language-bash">ansible/
├── bin/                    # Ejecutables CLI
│   ├── ansible             # Comando ad-hoc
│   ├── ansible-playbook    # Ejecutar playbooks
│   ├── ansible-vault       # Gestión de secretos
│   └── ansible-galaxy      # Gestión de roles/collections
│
└── lib/ansible/
    ├── cli/                # Parsers de argumentos CLI
    │   ├── __init__.py     # CLI base class
    │   ├── playbook.py     # ansible-playbook CLI
    │   └── adhoc.py        # ansible ad-hoc CLI
    │
    ├── executor/           # Motor de ejecución
    │   ├── playbook_executor.py   # Orquestador principal
    │   ├── task_executor.py       # Ejecutor por tarea
    │   └── play_iterator.py       # Iterador de plays
    │
    ├── inventory/          # Gestión de inventario
    │   ├── manager.py      # InventoryManager
    │   └── data.py         # InventoryData
    │
    ├── playbook/           # Modelos de datos
    │   ├── play.py         # Clase Play
    │   ├── task.py         # Clase Task
    │   ├── block.py        # Clase Block
    │   └── role/           # Sistema de roles
    │
    ├── plugins/            # Sistema de plugins
    │   ├── action/         # Action plugins
    │   ├── callback/       # Callback plugins
    │   ├── connection/     # Connection plugins (SSH, local, etc.)
    │   ├── lookup/         # Lookup plugins
    │   └── filter/         # Filter plugins
    │
    ├── template/           # Motor Jinja2
    │   └── __init__.py     # Clase Templar
    │
    ├── vars/               # Gestión de variables
    │   └── manager.py      # VariableManager
    │
    └── module_utils/       # Utilidades para módulos
        └── basic.py        # AnsibleModule base class</code></pre>
        </div>
        <div class="tip-box"><span class="box-icon">💡</span><div class="box-content"><strong>Clonar el repo:</strong> <code>git clone https://github.com/ansible/ansible --depth=1</code> para explorar sin descargar toda la historia.</div></div>
      `
    }]
  },
  {
    levelId: 20, moduleId: 2, title: 'Cómo interactúan los componentes', duration: '2 horas',
    objective: 'Seguir el flujo de ejecución a través del código fuente.',
    steps: [{
      title: 'Flujo de ejecución en el código',
      body: `
        <p>Cuando ejecutás <code>ansible-playbook site.yml</code>, estas clases interactúan en secuencia:</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">flujo-simplificado.py</span></div>
          <pre class="language-python"><code class="language-python"># 1. CLI (bin/ansible-playbook → lib/ansible/cli/playbook.py)
#    Parsea argumentos, carga ansible.cfg

# 2. PlaybookExecutor (lib/ansible/executor/playbook_executor.py)
class PlaybookExecutor:
    def run(self):
        for playbook in self._playbooks:
            # Carga el YAML del playbook
            pb = Playbook.load(playbook)
            for play in pb.get_plays():
                self._do_handler_run(play)

# 3. StrategyBase decide el orden (linear/free)
#    Distribuye tareas a TaskQueueManager

# 4. TaskExecutor (por cada host + tarea)
class TaskExecutor:
    def run(self):
        # Resuelve variables (VariableManager)
        # Crea la conexión SSH
        # Llama al Action Plugin
        action = self._get_action_handler()
        result = action.run()

# 5. Action Plugin (copy, template, command, etc.)
#    Transfiere el módulo Python al host remoto

# 6. Módulo Python se ejecuta en el host remoto
#    Devuelve JSON: {"changed": true, "msg": "..."}

# 7. Callback Plugin procesa el resultado
#    Muestra en pantalla, escribe logs</code></pre>
        </div>
        <div class="tip-box"><span class="box-icon">💡</span><div class="box-content"><strong>Debug mode:</strong> Exportá <code>ANSIBLE_DEBUG=1</code> antes de ejecutar un playbook para ver mensajes internos de cada componente.</div></div>
      `
    }]
  },
  {
    levelId: 20, moduleId: 3, title: 'Lectura del código fuente', duration: '2 horas',
    objective: 'Navegar y entender el código fuente de Ansible como herramienta de aprendizaje.',
    steps: [{
      title: 'Dónde mirar según el problema',
      body: `
        <p>Cuando algo no funciona como esperás, saber dónde mirar en el código fuente te permite entender el comportamiento real de Ansible.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">donde-mirar.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># ¿Cómo funciona un módulo específico?
cat lib/ansible/modules/command.py

# ¿Cómo se resuelve la precedencia de variables?
cat lib/ansible/vars/manager.py  # método get_vars()

# ¿Cómo funciona el módulo template internamente?
cat lib/ansible/plugins/action/template.py

# ¿Cómo establece Ansible la conexión SSH?
cat lib/ansible/plugins/connection/ssh.py

# ¿Cómo funciona el callback de salida?
cat lib/ansible/plugins/callback/default.py

# Buscar dónde se maneja un error específico
grep -r "MODULE_REQUIRE_ARGS" lib/ansible/ --include="*.py" -l</code></pre>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">contribuir.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Fork en GitHub, clonar tu fork
git clone https://github.com/TU_USUARIO/ansible
cd ansible

# Instalar en modo desarrollo
pip install -e .

# Crear rama para tu cambio
git checkout -b fix/mi-corrección

# Correr los tests del área que tocaste
python -m pytest test/units/modules/test_command.py -v

# Abrir PR hacia ansible/ansible</code></pre>
        </div>
        <div class="tip-box"><span class="box-icon">💡</span><div class="box-content"><strong>Guía de contribución:</strong> Revisá <code>CONTRIBUTING.md</code> en el repo. Ansible acepta contribuciones de módulos, documentación, tests y bug fixes.</div></div>
      `
    }]
  },
];

export const nivel21Modules: ModuleContent[] = [
  {
    levelId: 21, moduleId: 1, title: 'Diseño de la infraestructura', duration: '2 horas',
    objective: 'Diseñar la estructura de un proyecto Ansible empresarial completo.',
    steps: [{
      title: 'Estructura del proyecto integrador',
      body: `
        <p>Un proyecto Ansible bien estructurado separa el inventario, los roles, las variables y los playbooks en directorios claros. Esta es la estructura recomendada para un equipo de DevOps.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">estructura-proyecto.sh</span></div>
          <pre class="language-bash"><code class="language-bash">proyecto-infraestructura/
├── ansible.cfg                    # Configuración global
├── requirements.yml               # Dependencias de Galaxy
│
├── inventory/
│   ├── produccion/
│   │   ├── hosts.yml              # Inventario estático
│   │   ├── group_vars/
│   │   │   ├── all/
│   │   │   │   ├── vars.yml       # Variables globales (texto plano)
│   │   │   │   └── vault.yml      # Secretos cifrados con Vault
│   │   │   ├── servidores_web.yml
│   │   │   └── bases_de_datos.yml
│   │   └── host_vars/
│   │       └── web1.empresa.com.yml
│   └── staging/                   # Misma estructura para staging
│
├── roles/
│   ├── common/                    # Role base para todos los hosts
│   ├── servidor_web/              # Nginx + app
│   ├── base_de_datos/             # PostgreSQL
│   ├── monitoreo/                 # node_exporter
│   └── seguridad/                 # Hardening, fail2ban, certificados
│
├── playbooks/
│   ├── site.yml                   # Playbook maestro
│   ├── webservers.yml
│   ├── databases.yml
│   └── hardening.yml
│
└── .github/
    └── workflows/
        └── deploy.yml             # CI/CD pipeline</code></pre>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
          <pre class="language-ini"><code class="language-ini">[defaults]
inventory = inventory/produccion
roles_path = roles
collections_paths = ~/.ansible/collections
host_key_checking = False
gathering = smart
fact_caching = jsonfile
fact_caching_connection = .cache/facts
fact_caching_timeout = 86400
stdout_callback = yaml
callback_whitelist = timer, profile_tasks

[ssh_connection]
pipelining = True
ssh_args = -o ControlMaster=auto -o ControlPersist=60s</code></pre>
        </div>
      `
    }]
  },
  {
    levelId: 21, moduleId: 2, title: 'Implementación completa', duration: '3 horas',
    objective: 'Implementar el playbook maestro que orquesta toda la infraestructura.',
    steps: [{
      title: 'Playbook site.yml y rolling updates',
      body: `
        <p>El playbook <code>site.yml</code> orquesta todos los roles sobre todos los grupos. Usá <code>serial:</code> para hacer rolling updates sin downtime.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbooks/site.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">---
# Playbook maestro — aplica toda la infraestructura

- name: Configurar todos los hosts (base común)
  hosts: all
  roles:
    - common
    - seguridad

- name: Configurar servidores web (rolling update)
  hosts: servidores_web
  serial: "25%"           # Actualizar 25% de los hosts a la vez
  max_fail_percentage: 10 # Si falla >10%, parar
  roles:
    - servidor_web
    - monitoreo

- name: Configurar bases de datos (uno a la vez)
  hosts: bases_de_datos
  serial: 1               # DB: siempre uno por vez
  roles:
    - base_de_datos
    - monitoreo</code></pre>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">deploy-comandos.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Deploy completo
ansible-playbook playbooks/site.yml --vault-password-file .vault_pass

# Solo webservers
ansible-playbook playbooks/site.yml --limit servidores_web

# Solo el role de seguridad
ansible-playbook playbooks/site.yml --tags seguridad

# Dry run antes de aplicar
ansible-playbook playbooks/site.yml --check --diff

# Deploy a staging
ansible-playbook playbooks/site.yml -i inventory/staging</code></pre>
        </div>
      `
    }]
  },
  {
    levelId: 21, moduleId: 3, title: 'CI/CD con Ansible', duration: '2 horas',
    objective: 'Integrar Ansible en un pipeline de GitHub Actions.',
    steps: [{
      title: 'Pipeline de despliegue automático',
      body: `
        <p>Un pipeline CI/CD con Ansible garantiza que cada merge a <code>main</code> despliegue automáticamente a producción, pasando por lint y validación primero.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/deploy.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">---
name: Deploy Infrastructure

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Instalar dependencias
        run: pip install ansible ansible-lint yamllint
      - name: yamllint
        run: yamllint .
      - name: ansible-lint
        run: ansible-lint playbooks/site.yml

  deploy-staging:
    name: Deploy to Staging
    needs: lint
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Instalar Ansible
        run: pip install ansible
      - name: Instalar dependencias Galaxy
        run: ansible-galaxy install -r requirements.yml
      - name: Configurar SSH
        run: |
          mkdir -p ~/.ssh
          echo "$\{{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
      - name: Deploy a staging
        run: ansible-playbook -i inventory/staging playbooks/site.yml
        env:
          ANSIBLE_VAULT_PASSWORD: $\{{ secrets.VAULT_PASSWORD }}

  deploy-produccion:
    name: Deploy to Production
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: produccion    # Requiere aprobación manual en GitHub
    steps:
      - uses: actions/checkout@v4
      - name: Deploy a producción
        run: ansible-playbook -i inventory/produccion playbooks/site.yml
        env:
          ANSIBLE_VAULT_PASSWORD: $\{{ secrets.VAULT_PASSWORD }}</code></pre>
        </div>
        <div class="tip-box"><span class="box-icon">💡</span><div class="box-content"><strong>Aprobación manual:</strong> Configurá un <em>Environment</em> llamado <code>produccion</code> en GitHub con revisores requeridos. Así el deploy a prod espera aprobación explícita.</div></div>
      `
    }]
  },
];

export const nivel22Modules: ModuleContent[] = [
  {
    levelId: 22, moduleId: 1, title: 'Hardening de Linux', duration: '2 horas',
    objective: 'Asegurar servidores Linux con Ansible según estándares CIS.',
    steps: [{
      title: 'Hardening automatizado',
      body: `
        <p>El hardening de Linux implica configurar SSH, firewall, fail2ban, permisos y auditoría. Ansible permite aplicarlo de forma consistente en toda la flota.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/seguridad/tasks/main.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">---
- name: Configurar SSH seguro
  ansible.builtin.lineinfile:
    path: /etc/ssh/sshd_config
    regexp: "{{ item.regexp }}"
    line: "{{ item.line }}"
    validate: sshd -t -f %s
  loop:
    - { regexp: '^PermitRootLogin', line: 'PermitRootLogin no' }
    - { regexp: '^PasswordAuthentication', line: 'PasswordAuthentication no' }
    - { regexp: '^X11Forwarding', line: 'X11Forwarding no' }
    - { regexp: '^MaxAuthTries', line: 'MaxAuthTries 3' }
    - { regexp: '^Protocol', line: 'Protocol 2' }
  notify: Reiniciar sshd

- name: Configurar firewall (UFW en Debian/Ubuntu)
  community.general.ufw:
    rule: allow
    port: "{{ item }}"
    proto: tcp
  loop:
    - "22"
    - "80"
    - "443"
  when: ansible_os_family == "Debian"

- name: Habilitar UFW
  community.general.ufw:
    state: enabled
    policy: deny
    direction: incoming
  when: ansible_os_family == "Debian"

- name: Instalar y configurar fail2ban
  ansible.builtin.package:
    name: fail2ban
    state: present

- name: Configurar fail2ban para SSH
  ansible.builtin.copy:
    dest: /etc/fail2ban/jail.local
    content: |
      [sshd]
      enabled = true
      maxretry = 3
      bantime = 3600
      findtime = 600
  notify: Reiniciar fail2ban

- name: Deshabilitar servicios innecesarios
  ansible.builtin.service:
    name: "{{ item }}"
    state: stopped
    enabled: false
  loop: "{{ servicios_a_deshabilitar | default([]) }}"
  ignore_errors: true</code></pre>
        </div>
        <div class="warning-box"><span class="box-icon">⚠️</span><div class="box-content"><strong>Cuidado con SSH:</strong> Siempre testéá el hardening de SSH en una VM de prueba antes de aplicarlo en producción. Un error en sshd_config puede bloquearte fuera del servidor.</div></div>
      `
    }]
  },
  {
    levelId: 22, moduleId: 2, title: 'Gestión de certificados TLS', duration: '1.5 horas',
    objective: 'Automatizar la emisión y renovación de certificados SSL/TLS con Ansible.',
    steps: [{
      title: "Let's Encrypt con certbot",
      body: `
        <p>Ansible puede automatizar completamente el ciclo de vida de certificados TLS: emisión inicial, configuración en nginx, y renovación automática.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/servidor_web/tasks/tls.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">---
- name: Instalar certbot
  ansible.builtin.package:
    name:
      - certbot
      - python3-certbot-nginx
    state: present

- name: Obtener certificado Let's Encrypt
  ansible.builtin.command:
    cmd: >
      certbot certonly --nginx
      --non-interactive
      --agree-tos
      --email {{ admin_email }}
      --domains {{ tls_domains | join(',') }}
    creates: "/etc/letsencrypt/live/{{ tls_domains[0] }}/fullchain.pem"
  notify: Recargar nginx

- name: Configurar renovación automática via systemd timer
  ansible.builtin.copy:
    dest: /etc/systemd/system/certbot-renew.service
    content: |
      [Unit]
      Description=Renovar certificados Let's Encrypt
      [Service]
      Type=oneshot
      ExecStart=/usr/bin/certbot renew --quiet --deploy-hook "systemctl reload nginx"

- name: Activar timer de renovación (2 veces por día)
  ansible.builtin.systemd:
    name: certbot.timer
    state: started
    enabled: true
    daemon_reload: true</code></pre>
        </div>
        <div class="tip-box"><span class="box-icon">💡</span><div class="box-content"><strong>Wildcard certs:</strong> Para certificados wildcard (<code>*.empresa.com</code>), usá el challenge DNS-01 con el plugin del proveedor DNS (<code>python3-certbot-dns-route53</code> para AWS Route 53).</div></div>
      `
    }]
  },
  {
    levelId: 22, moduleId: 3, title: 'Integración con DevOps', duration: '2 horas',
    objective: 'Conectar Ansible con herramientas del ecosistema DevOps.',
    steps: [{
      title: 'Notificaciones, Git y herramientas externas',
      body: `
        <p>Ansible puede integrarse con Slack, Git, sistemas de tickets y otras herramientas para crear flujos de despliegue completos y auditables.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbooks/notify-deploy.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">tasks:
  - name: Notificar inicio de deploy en Slack
    community.general.slack:
      token: "{{ slack_token }}"
      channel: "#deployments"
      msg: "🚀 Iniciando deploy de {{ app_name }} v{{ app_version }} en producción"
      color: warning
    delegate_to: localhost
    run_once: true

  # ... tareas de deploy ...

  - name: Crear tag en Git
    ansible.builtin.command:
      cmd: "git tag deploy-{{ ansible_date_time.iso8601_basic_short }}"
    delegate_to: localhost
    run_once: true

  - name: Notificar resultado en Slack
    community.general.slack:
      token: "{{ slack_token }}"
      channel: "#deployments"
      msg: "✅ Deploy de {{ app_name }} v{{ app_version }} completado exitosamente"
      color: good
    delegate_to: localhost
    run_once: true</code></pre>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbooks/zero-downtime.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">- name: Deploy sin downtime con health checks
  hosts: servidores_web
  serial: 1
  tasks:
    - name: Sacar host del balanceador
      community.general.haproxy:
        state: disabled
        host: "{{ inventory_hostname }}"
        backend: web_backend
      delegate_to: "{{ balancer_host }}"

    - name: Actualizar aplicación
      ansible.builtin.package:
        name: "mi-app={{ app_version }}"
        state: present

    - name: Verificar que la app responde
      ansible.builtin.uri:
        url: "http://localhost:8080/health"
        status_code: 200
      retries: 10
      delay: 5

    - name: Volver a agregar al balanceador
      community.general.haproxy:
        state: enabled
        host: "{{ inventory_hostname }}"
        backend: web_backend
      delegate_to: "{{ balancer_host }}"</code></pre>
        </div>
      `
    }]
  },
  {
    levelId: 22, moduleId: 4, title: 'Observabilidad y logging', duration: '1.5 horas',
    objective: 'Configurar logging centralizado y monitoreo con Ansible.',
    steps: [{
      title: 'Logging centralizado y métricas',
      body: `
        <p>La observabilidad en Ansible tiene dos dimensiones: el logging de la propia ejecución de Ansible, y la configuración de logging/métricas en los hosts gestionados.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg — logging de Ansible</span></div>
          <pre class="language-ini"><code class="language-ini">[defaults]
# Log de todas las ejecuciones
log_path = /var/log/ansible/ansible.log

# Callback para métricas de tiempo
callback_whitelist = timer, profile_tasks, profile_roles

# Formato de salida legible
stdout_callback = yaml</code></pre>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/monitoreo/tasks/main.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">---
- name: Instalar node_exporter (métricas para Prometheus)
  ansible.builtin.package:
    name: prometheus-node-exporter
    state: present

- name: Habilitar y arrancar node_exporter
  ansible.builtin.service:
    name: prometheus-node-exporter
    state: started
    enabled: true

- name: Configurar rsyslog — envío a servidor central
  ansible.builtin.template:
    src: rsyslog-central.conf.j2
    dest: /etc/rsyslog.d/50-central.conf
  notify: Reiniciar rsyslog

- name: Instalar filebeat (logs a Elasticsearch)
  ansible.builtin.package:
    name: filebeat
    state: present

- name: Configurar filebeat
  ansible.builtin.template:
    src: filebeat.yml.j2
    dest: /etc/filebeat/filebeat.yml
  notify: Reiniciar filebeat</code></pre>
        </div>
        <div class="tip-box"><span class="box-icon">💡</span><div class="box-content"><strong>Stack recomendado:</strong> Prometheus + Grafana para métricas (node_exporter en todos los hosts), y Loki + Grafana para logs. Ansible puede desplegar toda esta stack en minutos.</div></div>
      `
    }]
  },
];

export function getNivel6to22Content(level: number, module: number): ModuleContent | undefined {
  const maps: Record<number, ModuleContent[]> = {
    6: nivel6Modules,
    7: nivel7Modules,
    8: nivel8Modules,
    9: nivel9Modules,
    10: nivel10Modules,
    11: nivel11Modules,
    12: nivel12Modules,
    13: nivel13Modules,
    14: nivel14Modules,
    15: nivel15Modules,
    16: nivel16Modules,
    17: nivel17Modules,
    18: nivel18Modules,
    19: nivel19Modules,
    20: nivel20Modules,
    21: nivel21Modules,
    22: nivel22Modules,
  };
  return maps[level]?.find(m => m.moduleId === module);
}
