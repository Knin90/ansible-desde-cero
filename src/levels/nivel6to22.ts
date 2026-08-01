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
    levelId: 17,
    moduleId: 1,
    title: 'Check Mode y Diff Mode',
    objective: 'Usar --check y --diff para validar cambios antes de aplicarlos en producción, evitando errores costosos con dry-runs informativos.',
    duration: '1–2 horas',
    objectives: [
      'Comprender por qué el dry-run es esencial antes de cambios en producción',
      'Usar --check para simular la ejecución sin aplicar cambios',
      'Usar --diff para visualizar las diferencias en archivos de texto',
      'Controlar qué tareas se ejecutan en check mode con check_mode: false y ansible_check_mode',
    ],
    prerequisites: [
      'Completados los Niveles 0–16',
      'Playbooks funcionales con al menos un entorno de staging',
      'Acceso SSH a hosts remotos',
    ],
    steps: [
      {
        title: '¿Por qué importa el dry-run antes de producción?',
        body: `
          <p>Producción es sagrado. Un error en un playbook puede dejar un servicio caído, borrar configuración crítica o romper la conectividad de red. El modo dry-run (simulación) de Ansible te permite ver exactamente qué va a pasar antes de que pase.</p>
          <div class="highlight-box">
            <p><strong>Regla de oro en infraestructura:</strong> nunca apliques un playbook en producción sin haberlo corrido primero con <code>--check --diff</code>. Esta práctica separa a los operadores experimentados de los que aprenden de accidentes.</p>
          </div>
          <p>Los dos modos se complementan:</p>
          <ul>
            <li><strong>--check</strong>: simula la ejecución, reporta qué cambiaría (sin tocar nada)</li>
            <li><strong>--diff</strong>: muestra el diff de archivos de texto que se modificarían</li>
          </ul>
          <div class="analogy-box">
            <div class="analogy-box-header">💡 Analogía</div>
            <p>Pensá en <code>--check</code> como el ensayo de una obra de teatro — los actores siguen el guión pero el escenario no cambia. <code>--diff</code> es el director que anota en el guión exactamente qué líneas van a cambiar.</p>
          </div>
        `,
      },
      {
        title: 'El flag --check: simulación completa',
        body: `
          <p>Con <code>--check</code>, Ansible ejecuta todos los módulos en modo simulación. Cada módulo reporta si <em>habría</em> hecho un cambio, pero no lo aplica.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">dry-run.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Dry-run básico
ansible-playbook site.yml --check

# Dry-run con inventario específico
ansible-playbook -i inventory/production site.yml --check

# Dry-run limitado a un grupo de hosts
ansible-playbook site.yml --check --limit webservers

# Dry-run de una sola tarea (por tag)
ansible-playbook site.yml --check --tags nginx</code></pre>
          </div>
          <p>La salida mostrará <code>changed</code> para tareas que habrían hecho algo, y <code>ok</code> para las que ya estaban en el estado deseado:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">text</span><span class="code-block-filename">output-check.txt</span></div>
            <pre class="language-text"><code class="language-text">TASK [nginx : Ensure nginx is installed]
ok: [web01]   ← ya estaba instalado, no habría cambio

TASK [nginx : Deploy nginx.conf]
changed: [web01]   ← habría sobreescrito el archivo

TASK [nginx : Start and enable nginx]
ok: [web01]   ← ya estaba corriendo</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Limitación importante:</strong> --check no puede simular correctamente tareas que dependen de archivos creados por tareas anteriores. Si la tarea A crea un archivo y la tarea B lo modifica, en --check la tarea B puede fallar porque el archivo no existe todavía.</div>
          </div>
        `,
      },
      {
        title: 'El flag --diff: ver los cambios en archivos',
        body: `
          <p><code>--diff</code> activa la visualización de diferencias para módulos que manipulan archivos de texto: <code>copy</code>, <code>template</code>, <code>lineinfile</code>, <code>blockinfile</code>, etc.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">diff-mode.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Lo más útil: check + diff juntos
ansible-playbook site.yml --check --diff

# Solo diff (aplica cambios pero muestra el diff)
ansible-playbook site.yml --diff</code></pre>
          </div>
          <p>La salida con <code>--diff</code> muestra el diff estilo Unix:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">text</span><span class="code-block-filename">output-diff.txt</span></div>
            <pre class="language-text"><code class="language-text">TASK [nginx : Deploy nginx.conf]
--- before: /etc/nginx/nginx.conf
+++ after: /home/user/.ansible/tmp/nginx.conf
@@ -10,7 +10,7 @@
     gzip on;
-    worker_processes 2;
+    worker_processes 4;
     keepalive_timeout 65;</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content">Las líneas con <code>-</code> (rojo) son lo que se <em>eliminaría</em>. Las líneas con <code>+</code> (verde) son lo que se <em>agregaría</em>. Exactamente como <code>git diff</code>.</div>
          </div>
        `,
      },
      {
        title: 'check_mode: false — tareas que siempre deben correr',
        body: `
          <p>Algunas tareas deben ejecutarse incluso en modo dry-run: validaciones, checks de estado, comandos de sólo lectura. Usá <code>check_mode: false</code> para forzar su ejecución.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">tasks/validate.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">- name: Verificar que el certificado SSL es válido (siempre ejecutar)
  ansible.builtin.command:
    cmd: openssl x509 -noout -checkend 86400 -in /etc/ssl/certs/site.crt
  check_mode: false   # ← se ejecuta incluso con --check
  register: cert_check
  failed_when: cert_check.rc != 0

- name: Obtener versión de nginx instalada
  ansible.builtin.command:
    cmd: nginx -v
  check_mode: false
  register: nginx_version
  changed_when: false  # este comando nunca "cambia" nada

- name: Mostrar versión detectada
  ansible.builtin.debug:
    msg: "Nginx: {{ nginx_version.stderr }}"</code></pre>
          </div>
          <div class="highlight-box">
            <p><strong>Cuándo usar check_mode: false:</strong></p>
            <ul>
              <li>Comandos de validación (<code>nginx -t</code>, <code>openssl verify</code>)</li>
              <li>Lecturas de estado que otras tareas necesitan como input</li>
              <li>Comandos de sólo lectura que nunca modifican el sistema</li>
            </ul>
          </div>
        `,
      },
      {
        title: 'La variable ansible_check_mode',
        body: `
          <p>Ansible expone la variable booleana <code>ansible_check_mode</code> que es <code>true</code> cuando corrés con <code>--check</code>. Podés usarla para comportamiento condicional.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">tasks/conditional-check.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">- name: Notificar que estamos en modo simulación
  ansible.builtin.debug:
    msg: "MODO DRY-RUN — ningún cambio será aplicado"
  when: ansible_check_mode

- name: Reiniciar nginx (solo en modo real)
  ansible.builtin.service:
    name: nginx
    state: restarted
  when: not ansible_check_mode   # evitar restart innecesario en dry-run
  notify: reload nginx

- name: Enviar alerta a Slack
  ansible.builtin.uri:
    url: "{{ slack_webhook_url }}"
    method: POST
    body_format: json
    body:
      text: "Deployment iniciado en {{ inventory_hostname }}"
  when: not ansible_check_mode   # no disparar alertas en dry-run</code></pre>
          </div>
          <div class="tech-term-box">
            <div class="tech-term-label">En términos técnicos</div>
            <code>ansible_check_mode</code> es una <em>magic variable</em> de Ansible — siempre disponible sin necesidad de definirla. Su valor es inyectado por el motor de Ansible en el momento de la ejecución.
          </div>
        `,
      },
      {
        title: 'Práctica: protocolo pre-producción con --check --diff',
        body: `
          <p>El protocolo profesional antes de cualquier deployment en producción combina --check y --diff como una compuerta de seguridad.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">deploy-protocol.sh</span></div>
            <pre class="language-bash"><code class="language-bash">#!/bin/bash
# Protocolo seguro de deployment

PLAYBOOK="site.yml"
INVENTORY="inventory/production"
LIMIT="\${1:-all}"  # parámetro opcional: grupo o host

echo "=== FASE 1: Dry-run con diff ==="
ansible-playbook -i "$INVENTORY" "$PLAYBOOK" \\
  --limit "$LIMIT" \\
  --check \\
  --diff

echo ""
echo "¿Revisaste el output? ¿Todo se ve correcto?"
read -p "Escribí 'DEPLOY' para continuar: " confirm

if [ "$confirm" = "DEPLOY" ]; then
  echo "=== FASE 2: Deployment real ==="
  ansible-playbook -i "$INVENTORY" "$PLAYBOOK" \\
    --limit "$LIMIT" \\
    --diff
else
  echo "Deployment cancelado."
  exit 1
fi</code></pre>
          </div>
          <div class="highlight-box">
            <p><strong>Protocolo mínimo para producción:</strong></p>
            <ol>
              <li>Correr <code>--check --diff</code> y revisar toda la salida</li>
              <li>Confirmar que los cambios esperados (y solo esos) aparecen como <code>changed</code></li>
              <li>Correr sin <code>--check</code> pero con <code>--diff</code> para tener el log del cambio real</li>
              <li>Verificar manualmente el servicio tras el deployment</li>
            </ol>
          </div>
        `,
      },
    ],
    quiz: [
      {
        question: '¿Cuál es la diferencia principal entre --check y --diff?',
        options: [
          '--check simula sin aplicar cambios; --diff muestra las diferencias en archivos de texto',
          '--check solo funciona con módulos de archivos; --diff funciona con todos los módulos',
          '--check requiere privilegios de root; --diff no',
          'Son sinónimos, hacen exactamente lo mismo',
        ],
        correctIndex: 0,
        explanation: '--check es el modo dry-run general (nada se aplica). --diff es complementario: muestra el diff de los archivos de texto que cambiarían. Se usan juntos: --check --diff.',
      },
      {
        question: '¿Para qué se usa check_mode: false en una tarea?',
        options: [
          'Para que la tarea nunca haga cambios',
          'Para forzar que la tarea se ejecute incluso cuando se corre con --check',
          'Para desactivar el modo diff en esa tarea',
          'Para hacer que la tarea corra solo en producción',
        ],
        correctIndex: 1,
        explanation: 'check_mode: false fuerza la ejecución de la tarea incluso en modo dry-run. Es útil para validaciones, checks de estado y comandos de solo lectura que otras tareas necesitan como input.',
      },
      {
        question: '¿Cuándo es true la variable ansible_check_mode?',
        options: [
          'Cuando el playbook no tiene errores',
          'Cuando se ejecuta el playbook con el flag --check',
          'Cuando check_mode: false está definido en la tarea',
          'Cuando Ansible detecta que el host es de producción',
        ],
        correctIndex: 1,
        explanation: 'ansible_check_mode es una magic variable que Ansible inyecta automáticamente. Es true cuando el playbook se ejecuta con --check, false en ejecución normal. Útil para condicionales como when: not ansible_check_mode.',
      },
    ],
    realWorldCase: 'Un equipo de SRE tiene la política de que ningún PR puede ser mergeado sin adjuntar la salida de --check --diff contra staging. Esto detectó un bug en un template Jinja2 que habría borrado 200 líneas de configuración de nginx en producción.',
    troubleshooting: [
      {
        error: 'La tarea B falla en --check porque el archivo creado por la tarea A no existe',
        cause: 'En check mode, la tarea A no creó el archivo real; B intenta procesarlo y falla porque físicamente no está ahí',
        fix: 'Agregá check_mode: false a la tarea A si es seguro ejecutarla, o usá when: not ansible_check_mode en la tarea B para saltearla en dry-run',
      },
      {
        error: '--diff no muestra diferencias para archivos binarios',
        cause: '--diff solo funciona con contenido de texto. Para archivos binarios (imágenes, PKI, etc.) solo muestra "binary files differ"',
        fix: 'Es comportamiento esperado. Para archivos binarios verificá el hash (checksum) manualmente o usá el módulo stat para comparar metadatos',
      },
      {
        error: 'El playbook reporta "changed" en --check pero "ok" al ejecutarlo realmente',
        cause: 'Algunos módulos tienen lógica de detección de cambios imperfecta o conservadora en check mode',
        fix: 'Es falso positivo benigno. Verificá el resultado real con --diff en la ejecución normal. Si persiste, revisá idempotencia de la tarea con ansible-lint',
      },
    ],
  },

  {
    levelId: 17,
    moduleId: 2,
    title: 'Molecule — Testing de Roles',
    objective: 'Implementar tests automatizados de roles Ansible con Molecule, usando Docker como driver para crear entornos de prueba reproducibles y multi-plataforma.',
    duration: '2–3 horas',
    objectives: [
      'Entender por qué el testing de roles es fundamental para infraestructura confiable',
      'Instalar y configurar Molecule con el driver Docker',
      'Escribir escenarios de test completos con converge.yml y verify.yml',
      'Ejecutar tests en múltiples plataformas (Ubuntu 22 + Rocky 9) simultáneamente',
    ],
    prerequisites: [
      'Completados los Niveles 0–16',
      'Docker instalado y corriendo localmente',
      'Al menos un rol Ansible propio escrito y funcional',
      'Python 3.8+ con pip disponible',
    ],
    steps: [
      {
        title: 'Por qué testear roles: TDD para infraestructura',
        body: `
          <p>Los roles Ansible son código. El código sin tests es deuda técnica que eventualmente cobra intereses. Un rol sin tests puede funcionar hoy en Ubuntu 22 pero romper mañana en Rocky 9, o funcionar en desarrollo pero fallar en producción con una configuración diferente.</p>
          <div class="highlight-box">
            <p><strong>Molecule aplica TDD a infraestructura:</strong> escribís el test primero (¿qué debe hacer este rol?), luego escribís el rol hasta que el test pase. Cada cambio al rol corre todos los tests automáticamente.</p>
          </div>
          <p>Molecule se encarga de:</p>
          <ul>
            <li>Crear un contenedor Docker limpio (como si fuera un servidor fresco)</li>
            <li>Aplicar tu rol (<code>converge</code>)</li>
            <li>Verificar que el resultado es correcto (<code>verify</code>)</li>
            <li>Destruir el contenedor (<code>destroy</code>)</li>
          </ul>
          <div class="analogy-box">
            <div class="analogy-box-header">💡 Analogía</div>
            <p>Molecule es para tus roles lo que pytest/jest son para tu código de aplicación. Cada rol debería tener su propio conjunto de tests que se pueden correr con un solo comando.</p>
          </div>
        `,
      },
      {
        title: 'Instalación de Molecule con Docker driver',
        body: `
          <p>Molecule se instala vía pip. El driver Docker es el más común para CI/CD porque Docker corre en cualquier runner de CI sin configuración adicional.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">install-molecule.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Crear virtualenv (recomendado)
python3 -m venv ~/.venv/ansible
source ~/.venv/ansible/bin/activate

# Instalar Molecule + driver Docker + Ansible
pip install molecule molecule-docker ansible

# Verificar instalación
molecule --version
# molecule 6.x.x using python 3.x

# Inicializar Molecule en un rol existente
cd roles/mi_rol
molecule init scenario --driver-name docker

# O crear un rol nuevo con Molecule incluido
molecule init role mi_nuevo_rol --driver-name docker</code></pre>
          </div>
          <p>Molecule crea la estructura <code>molecule/default/</code> dentro del rol:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">text</span><span class="code-block-filename">estructura-molecule.txt</span></div>
            <pre class="language-text"><code class="language-text">roles/mi_rol/
├── defaults/
├── tasks/
├── templates/
└── molecule/
    └── default/          ← escenario "default"
        ├── molecule.yml   ← configuración del escenario
        ├── converge.yml   ← playbook que aplica el rol
        └── verify.yml     ← playbook de verificación</code></pre>
          </div>
        `,
      },
      {
        title: 'molecule.yml — configuración del escenario',
        body: `
          <p>El archivo <code>molecule.yml</code> define las plataformas de test, el driver, el provisioner y el verifier.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">molecule/default/molecule.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
dependency:
  name: galaxy

driver:
  name: docker

platforms:
  - name: ubuntu-22
    image: geerlingguy/docker-ubuntu2204-ansible:latest
    pre_build_image: true
    privileged: true   # para systemd

  - name: rocky-9
    image: geerlingguy/docker-rockylinux9-ansible:latest
    pre_build_image: true
    privileged: true

provisioner:
  name: ansible
  playbooks:
    converge: converge.yml
    verify: verify.yml
  config_options:
    defaults:
      interpreter_python: auto_silent

verifier:
  name: ansible   # usa Ansible para verificar (vs Testinfra)

lint: |
  set -e
  yamllint .
  ansible-lint</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content">Las imágenes <code>geerlingguy/docker-*-ansible</code> de Jeff Geerling son el estándar de la comunidad para testing con Molecule. Incluyen Python, systemd y las dependencias de Ansible preinstaladas.</div>
          </div>
        `,
      },
      {
        title: 'converge.yml y verify.yml — el ciclo de test',
        body: `
          <p><code>converge.yml</code> aplica el rol bajo test. <code>verify.yml</code> verifica que el resultado es correcto usando módulos Ansible como assertions.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">molecule/default/converge.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Converge
  hosts: all
  become: true

  pre_tasks:
    - name: Update apt cache (Ubuntu)
      ansible.builtin.apt:
        update_cache: true
        cache_valid_time: 3600
      when: ansible_os_family == "Debian"

  roles:
    - role: mi_rol
      vars:
        nginx_port: 80
        nginx_worker_processes: 2</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">molecule/default/verify.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Verify
  hosts: all
  become: true

  tasks:
    - name: Verificar que nginx está instalado
      ansible.builtin.package_facts:
        manager: auto

    - name: Fallar si nginx no está instalado
      ansible.builtin.fail:
        msg: "nginx no está instalado"
      when: "'nginx' not in ansible_facts.packages"

    - name: Verificar que nginx está corriendo
      ansible.builtin.service_facts:

    - name: Confirmar estado del servicio
      ansible.builtin.assert:
        that:
          - ansible_facts.services['nginx.service'] is defined
          - ansible_facts.services['nginx.service'].state == 'running'
        fail_msg: "nginx no está corriendo"
        success_msg: "nginx está corriendo correctamente"

    - name: Verificar que el puerto 80 responde
      ansible.builtin.uri:
        url: "http://localhost:80"
        status_code: 200</code></pre>
          </div>
        `,
      },
      {
        title: 'CLI de Molecule: comandos esenciales',
        body: `
          <p>Molecule tiene comandos granulares para cada fase del ciclo de test, más el comando <code>test</code> que los corre todos en secuencia.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">molecule-commands.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Ciclo completo (create → converge → verify → destroy)
molecule test

# Solo crear los contenedores
molecule create

# Aplicar el rol (sin destruir después)
molecule converge

# Correr solo la verificación (el contenedor debe existir)
molecule verify

# Entrar al contenedor para debug
molecule login --host ubuntu-22

# Destruir contenedores
molecule destroy

# Ver el estado de los contenedores
molecule list

# Forzar recreación aunque ya existan los contenedores
molecule test --force

# Mantener contenedores tras fallo (para debug)
molecule test --destroy never</code></pre>
          </div>
          <div class="highlight-box">
            <p><strong>Flujo de desarrollo típico:</strong></p>
            <ol>
              <li><code>molecule create</code> — crear contenedores</li>
              <li>Editar la tarea del rol</li>
              <li><code>molecule converge</code> — aplicar el rol</li>
              <li><code>molecule verify</code> — verificar</li>
              <li>Repetir pasos 2–4 hasta que el test pase</li>
              <li><code>molecule test</code> — ciclo completo limpio antes de commit</li>
            </ol>
          </div>
        `,
      },
      {
        title: 'Testing multi-plataforma: Ubuntu 22 + Rocky 9',
        body: `
          <p>El verdadero valor de Molecule está en probar el mismo rol en múltiples distribuciones simultáneamente. Muchos roles funcionan en Ubuntu pero rompen en RHEL/Rocky porque los nombres de paquetes, paths y servicios son distintos.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">multi-platform-test.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Con molecule.yml que define ubuntu-22 y rocky-9,
# molecule test corre en AMBAS plataformas automáticamente

molecule test
# →  Creating ubuntu-22 ...
# →  Creating rocky-9 ...
# →  Converging ubuntu-22 ...
# →  Converging rocky-9 ...
# →  Verifying ubuntu-22 ...
# →  Verifying rocky-9 ...</code></pre>
          </div>
          <p>El converge.yml puede tener lógica condicional por plataforma:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">tasks/main.yml (el rol)</span></div>
            <pre class="language-yaml"><code class="language-yaml">- name: Instalar nginx (Debian/Ubuntu)
  ansible.builtin.apt:
    name: nginx
    state: present
  when: ansible_os_family == "Debian"

- name: Instalar nginx (RHEL/Rocky)
  ansible.builtin.dnf:
    name: nginx
    state: present
  when: ansible_os_family == "RedHat"</code></pre>
          </div>
        `,
      },
    ],
    quiz: [
      {
        question: '¿Qué hace molecule converge?',
        options: [
          'Crea los contenedores Docker de prueba',
          'Aplica el rol al contenedor existente ejecutando converge.yml',
          'Corre las verificaciones definidas en verify.yml',
          'Destruye los contenedores tras el test',
        ],
        correctIndex: 1,
        explanation: 'molecule converge ejecuta el playbook converge.yml contra los contenedores existentes, aplicando el rol bajo test. Es equivalente a "aplicar el rol en el entorno de prueba".',
      },
      {
        question: '¿Para qué sirve molecule login?',
        options: [
          'Para autenticarse con Docker Hub',
          'Para acceder interactivamente al contenedor de test y hacer debug',
          'Para iniciar sesión en el repositorio de roles de Ansible Galaxy',
          'Para conectarse con SSH al host remoto de producción',
        ],
        correctIndex: 1,
        explanation: 'molecule login abre una shell interactiva dentro del contenedor de test. Es fundamental para debug: podés inspeccionar el estado del sistema, ver logs y probar comandos manualmente cuando un test falla.',
      },
      {
        question: '¿Por qué se recomienda testear en Ubuntu 22 y Rocky 9 simultáneamente?',
        options: [
          'Para usar más CPU y detectar problemas de performance',
          'Porque los nombres de paquetes, paths y servicios difieren entre distros, y un rol puede funcionar en una pero fallar en otra',
          'Porque Ansible solo funciona correctamente cuando hay múltiples plataformas en el inventario',
          'Para cumplir con regulaciones de seguridad que exigen testing cross-platform',
        ],
        correctIndex: 1,
        explanation: 'Debian/Ubuntu y RHEL/Rocky tienen diferencias fundamentales: apt vs dnf, /etc/default vs /etc/sysconfig, nombre de paquetes distintos. Un rol robusto debe manejar ambas familias y Molecule permite verificarlo automáticamente.',
      },
    ],
    realWorldCase: 'Un equipo descubrió con Molecule que su rol de "hardening" instalaba correctamente en Ubuntu pero olvidaba habilitar SELinux en Rocky Linux. En producción, esto habría dejado 40 servidores RHEL sin la configuración de seguridad requerida por compliance.',
    troubleshooting: [
      {
        error: 'ERROR: Could not find a suitable provider/driver',
        cause: 'Docker no está corriendo en el sistema o molecule-docker no está instalado',
        fix: 'Verificar con docker ps que Docker está activo. Instalar molecule-docker: pip install molecule-docker. Confirmar con molecule drivers.',
      },
      {
        error: 'FAILED: systemctl not found (en el contenedor)',
        cause: 'La imagen Docker no tiene systemd disponible; se usó una imagen genérica en lugar de las imágenes diseñadas para Ansible testing',
        fix: 'Usar las imágenes de geerlingguy: geerlingguy/docker-ubuntu2204-ansible:latest. Agregar privileged: true en molecule.yml.',
      },
      {
        error: 'molecule test falla con "Image not found" aunque docker pull funciona',
        cause: 'La imagen especificada en molecule.yml tiene un tag incorrecto o fue eliminada del registro',
        fix: 'Verificar el tag exacto con docker pull seguido de la imagen. Actualizar molecule.yml con el tag correcto. Preferir tags :latest para imágenes de Molecule testing.',
      },
    ],
  },

  {
    levelId: 17,
    moduleId: 3,
    title: 'Ansible Lint y yamllint',
    objective: 'Integrar ansible-lint y yamllint como herramientas de calidad de código para detectar errores, malas prácticas y problemas de estilo antes de ejecutar cualquier playbook.',
    duration: '1 hora',
    objectives: [
      'Entender qué problemas detecta ansible-lint (FQCN, idempotencia, seguridad, estilo)',
      'Configurar .ansible-lint para personalizar reglas según el proyecto',
      'Configurar yamllint para estilo de YAML consistente en el equipo',
      'Integrar ambas herramientas en un pre-commit hook para enforcement automático',
    ],
    prerequisites: [
      'Completados los Niveles 0–16 y módulos 1–2 del Nivel 17',
      'Python 3.8+ con pip disponible',
      'Repositorio Git con playbooks y roles',
    ],
    steps: [
      {
        title: 'Qué verifica ansible-lint',
        body: `
          <p>ansible-lint analiza estáticamente tus playbooks y roles buscando problemas en cuatro categorías principales:</p>
          <ul>
            <li><strong>FQCN (Fully Qualified Collection Names):</strong> usar <code>ansible.builtin.copy</code> en lugar de solo <code>copy</code>. Evita ambigüedades cuando múltiples colecciones tienen módulos con el mismo nombre.</li>
            <li><strong>Idempotencia:</strong> detecta patrones que pueden no ser idempotentes, como usar <code>command</code> cuando existe un módulo específico.</li>
            <li><strong>Seguridad:</strong> contraseñas en texto plano, <code>no_log: false</code> en tareas sensibles, permisos demasiado permisivos.</li>
            <li><strong>Estilo:</strong> nombres de tareas en formato imperativo, indentación, uso de <code>true</code>/<code>false</code> vs <code>yes</code>/<code>no</code>.</li>
          </ul>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">usar-ansible-lint.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Instalar ansible-lint
pip install ansible-lint

# Lintear el directorio actual
ansible-lint

# Lintear un playbook específico
ansible-lint site.yml

# Ver todas las reglas disponibles
ansible-lint --list-rules

# Ver solo errores críticos (sin warnings)
ansible-lint --severity error</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">text</span><span class="code-block-filename">output-ansible-lint.txt</span></div>
            <pre class="language-text"><code class="language-text">WARNING  roles/nginx/tasks/main.yml:5 Task/Handler names should not
         start with a uppercase letter. (name[casing])

ERROR    roles/nginx/tasks/main.yml:12 Use FQCN for builtin module
         actions: copy → ansible.builtin.copy (fqcn[action-core])

ERROR    roles/nginx/tasks/main.yml:20 Commands should not change
         things if nothing needs doing. (command-instead-of-module)</code></pre>
          </div>
        `,
      },
      {
        title: 'Configuración .ansible-lint',
        body: `
          <p>El archivo <code>.ansible-lint</code> en la raíz del proyecto personaliza el comportamiento: qué reglas ignorar, qué paths excluir y el perfil de severidad.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.ansible-lint</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
# Perfil: basic, moderate, safety, shared, production
profile: production

# Excluir paths del análisis
exclude_paths:
  - .git/
  - .cache/
  - molecule/
  - vendor/

# Ignorar reglas específicas (documentar por qué)
warn_list:
  - experimental     # reglas en desarrollo
  - role-name        # nombres de roles con guión bajo

skip_list:
  - yaml[line-length]  # lineas largas en templates Jinja2 son inevitables

# Paths adicionales a analizar
extra_vars_files:
  - vars/vault.yml

# Configuración de variables
var_naming_pattern: ^[a-z_][a-z0-9_]*$</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content">El perfil <code>production</code> activa las reglas más estrictas, incluyendo chequeos de seguridad. Para proyectos nuevos, empezá con <code>basic</code> y subí gradualmente a <code>production</code> a medida que limpiás el código.</div>
          </div>
        `,
      },
      {
        title: 'yamllint — estilo de YAML consistente',
        body: `
          <p>yamllint verifica la sintaxis y el estilo de todos los archivos YAML del proyecto, independientemente de Ansible. Detecta indentación inconsistente, trailing spaces, líneas demasiado largas y comillas innecesarias.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalar-yamllint.sh</span></div>
            <pre class="language-bash"><code class="language-bash">pip install yamllint

# Lintear todos los YAML del proyecto
yamllint .

# Lintear un archivo específico
yamllint playbooks/site.yml</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.yamllint</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
extends: default

rules:
  line-length:
    max: 120           # permitir líneas hasta 120 chars (templates)
    level: warning     # warning, no error

  document-start:
    present: true      # exigir '---' al inicio de cada archivo

  truthy:
    allowed-values:
      - 'true'
      - 'false'        # no permitir yes/no/on/off

  indentation:
    spaces: 2
    indent-sequences: true
    check-multi-line-strings: false

  comments:
    min-spaces-from-content: 2  # '# comentario' no '#comentario'

ignore: |
  .git/
  molecule/
  vendor/</code></pre>
          </div>
        `,
      },
      {
        title: 'Pre-commit hook: enforcement automático',
        body: `
          <p>Un pre-commit hook garantiza que ningún commit pase sin pasar por ansible-lint y yamllint. El framework <code>pre-commit</code> hace esto trivial.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">setup-pre-commit.sh</span></div>
            <pre class="language-bash"><code class="language-bash">pip install pre-commit

# Inicializar en el repo (instala el hook en .git/hooks/pre-commit)
pre-commit install

# Correr manualmente sobre todos los archivos
pre-commit run --all-files</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.pre-commit-config.yaml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
repos:
  - repo: https://github.com/adrienverge/yamllint
    rev: v1.35.1
    hooks:
      - id: yamllint
        args: ['-c', '.yamllint']

  - repo: https://github.com/ansible/ansible-lint
    rev: v24.2.0
    hooks:
      - id: ansible-lint
        files: \\.(yml|yaml)$
        always_run: false

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-merge-conflict</code></pre>
          </div>
          <div class="highlight-box">
            <p>Ahora cada <code>git commit</code> ejecuta automáticamente yamllint y ansible-lint. Si alguno falla, el commit es rechazado hasta que se corrija el problema.</p>
          </div>
        `,
      },
    ],
    quiz: [
      {
        question: '¿Qué verifica la regla fqcn[action-core] de ansible-lint?',
        options: [
          'Que los nombres de los roles sean descriptivos',
          'Que los módulos builtin usen su nombre completo (ej: ansible.builtin.copy en lugar de copy)',
          'Que las variables sigan la convención de nombres snake_case',
          'Que cada tarea tenga una etiqueta (tag) definida',
        ],
        correctIndex: 1,
        explanation: 'fqcn[action-core] exige el uso de Fully Qualified Collection Names para módulos builtin. Esto evita ambigüedades: si tenés una colección custom con un módulo "copy", Ansible podría ejecutar el incorrecto sin FQCN.',
      },
      {
        question: '¿Para qué sirve skip_list en .ansible-lint?',
        options: [
          'Para excluir hosts del inventario del análisis',
          'Para ignorar reglas específicas que no aplican al proyecto',
          'Para saltear la ejecución de molecule durante el lint',
          'Para ignorar archivos YAML con errores de sintaxis',
        ],
        correctIndex: 1,
        explanation: 'skip_list permite deshabilitar reglas específicas que no aplican o son incompatibles con el proyecto. Se documenta en el mismo archivo .ansible-lint el motivo para ignorar cada regla.',
      },
      {
        question: '¿Qué ocurre al hacer git commit después de instalar el pre-commit hook?',
        options: [
          'El commit se hace directamente, el hook corre en background',
          'El hook corre yamllint y ansible-lint; si alguno falla, el commit es rechazado',
          'Se abre un editor para revisar los cambios antes de commitear',
          'El hook sube automáticamente el código a un runner de CI',
        ],
        correctIndex: 1,
        explanation: 'Un pre-commit hook es bloqueante: si cualquier check falla (yamllint, ansible-lint, etc.), git rechaza el commit. El desarrollador debe corregir los errores y hacer git add + git commit nuevamente.',
      },
    ],
    realWorldCase: 'Un equipo de 8 ingenieros integró ansible-lint y yamllint como pre-commit hooks. En las primeras 2 semanas, el hook bloqueó 34 commits con problemas reales: 12 por módulos sin FQCN, 8 por tareas sin nombre, 14 por YAML mal formateado. Todos fueron corregidos antes de llegar al repositorio.',
    troubleshooting: [
      {
        error: 'ansible-lint: WARNING: Listing 1 violation(s) that are fatal',
        cause: 'El perfil configurado en .ansible-lint es más estricto que el código actual; alguna regla crítica está siendo violada',
        fix: 'Correr ansible-lint -v para ver el detalle completo. Si la regla es válida, corregirla. Si no aplica al proyecto, agregarla a skip_list con un comentario explicando por qué.',
      },
      {
        error: 'yamllint: error: could not determine encoding',
        cause: 'El archivo YAML tiene una codificación no-UTF8 (BOM, latin-1, etc.) o caracteres especiales no escapados',
        fix: 'Convertir el archivo a UTF-8 sin BOM: usar "file archivo.yml" para detectar la codificación actual, luego iconv para convertir.',
      },
      {
        error: 'pre-commit hook: command not found: ansible-lint',
        cause: 'pre-commit usa su propio entorno virtual aislado; ansible-lint debe estar declarado en .pre-commit-config.yaml, no solo instalado globalmente',
        fix: 'Usar el repo oficial de ansible-lint en .pre-commit-config.yaml en lugar de un hook local. pre-commit instala automáticamente las dependencias de cada repo declarado.',
      },
    ],
  },

  {
    levelId: 17,
    moduleId: 4,
    title: 'CI/CD con GitHub Actions',
    objective: 'Construir un pipeline completo de CI/CD para proyectos Ansible usando GitHub Actions: lint automático en cada PR, Molecule tests en runners Docker, dry-run en staging y deployment automático a producción.',
    duration: '2–3 horas',
    objectives: [
      'Entender por qué CI/CD es indispensable para equipos que trabajan con Ansible',
      'Construir un workflow de GitHub Actions que integre lint, Molecule y ansible-playbook',
      'Gestionar secretos sensibles (Vault password, SSH keys) usando GitHub Secrets',
      'Implementar el patrón staging-gate: --check en staging antes de merge a main',
    ],
    prerequisites: [
      'Completados los Niveles 0–16 y módulos 1–3 del Nivel 17',
      'Repositorio Ansible en GitHub',
      'Molecule configurado en al menos un rol',
      'ansible-lint y yamllint configurados en el proyecto',
    ],
    steps: [
      {
        title: 'Por qué CI/CD para Ansible',
        body: `
          <p>Sin CI/CD, cada miembro del equipo ejecuta los tests localmente (o no los ejecuta). Los errores llegan a producción. La calidad depende de la disciplina individual, no del proceso.</p>
          <div class="highlight-box">
            <p><strong>CI/CD convierte el testing en una compuerta institucional:</strong> ningún cambio puede mergearse si no pasa lint, Molecule tests y el dry-run en staging. La calidad es sistémica, no individual.</p>
          </div>
          <p>Un pipeline completo de Ansible en GitHub Actions hace:</p>
          <ul>
            <li><strong>En cada PR:</strong> lint (ansible-lint + yamllint) y Molecule tests</li>
            <li><strong>Antes del merge:</strong> <code>ansible-playbook --check</code> en staging como gate</li>
            <li><strong>Tras merge a main:</strong> deployment real a producción con notificación</li>
          </ul>
          <div class="analogy-box">
            <div class="analogy-box-header">💡 Analogía</div>
            <p>Pensá en el pipeline como una línea de ensamblaje con estaciones de control de calidad. El código entra por un extremo (PR), pasa por cada estación (lint → tests → staging check), y solo llega a producción si supera todas las compuertas.</p>
          </div>
          <div class="tech-term-box">
            <div class="tech-term-label">En términos técnicos</div>
            GitHub Actions es una plataforma de CI/CD integrada en GitHub. Los workflows se definen en archivos YAML bajo <code>.github/workflows/</code>. Cada workflow tiene jobs que corren en runners (VMs o contenedores) y steps que ejecutan comandos o acciones.
          </div>
        `,
      },
      {
        title: 'Estructura del workflow de GitHub Actions',
        body: `
          <p>Un workflow de Ansible CI/CD tiene cuatro jobs principales que se ejecutan en secuencia o en paralelo según las dependencias.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/ansible-ci.yml (estructura)</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
name: Ansible CI/CD

on:
  pull_request:
    branches: [main]
    paths:
      - '**.yml'
      - '**.yaml'
      - '**.j2'
      - 'requirements.yml'
  push:
    branches: [main]

env:
  PYTHON_VERSION: '3.12'

jobs:
  lint:          # Job 1: análisis estático (PR + push)
    ...

  molecule:      # Job 2: tests de roles (PR + push)
    needs: lint
    ...

  staging-check: # Job 3: dry-run en staging (PR only)
    needs: molecule
    if: github.event_name == 'pull_request'
    ...

  deploy:        # Job 4: deployment real (push to main only)
    needs: molecule
    if: github.event_name == 'push' &amp;&amp; github.ref == 'refs/heads/main'
    ...</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content">El trigger <code>paths</code> evita correr el pipeline en PRs que solo cambian documentación o archivos Python. Esto reduce el tiempo de CI significativamente en proyectos grandes.</div>
          </div>
        `,
      },
      {
        title: 'Job lint: ansible-lint y yamllint en cada PR',
        body: `
          <p>El job de lint es el más rápido (~1-2 minutos) y debe correr primero. Falla rápido en problemas básicos antes de gastar tiempo en Molecule.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/ansible-ci.yml — job lint</span></div>
            <pre class="language-yaml"><code class="language-yaml">  lint:
    name: Lint
    runs-on: ubuntu-latest

    steps:
      - name: Checkout del repositorio
        uses: actions/checkout@v4

      - name: Configurar Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: pip

      - name: Instalar dependencias de lint
        run: pip install ansible-lint yamllint

      - name: Instalar colecciones de Ansible
        run: |
          if [ -f requirements.yml ]; then
            ansible-galaxy collection install -r requirements.yml
          fi

      - name: Ejecutar yamllint
        run: yamllint .

      - name: Ejecutar ansible-lint
        run: ansible-lint
        env:
          ANSIBLE_ROLES_PATH: roles/</code></pre>
          </div>
          <div class="highlight-box">
            <p>El uso de <code>cache: pip</code> en setup-python hace que las instalaciones de pip se cacheen entre runs. En proyectos con muchas dependencias, esto puede reducir el tiempo de CI de 3 minutos a 30 segundos.</p>
          </div>
        `,
      },
      {
        title: 'Job molecule: tests en Docker runners',
        body: `
          <p>GitHub Actions ofrece runners Ubuntu con Docker preinstalado. Molecule funciona directamente sin configuración adicional del runner.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/ansible-ci.yml — job molecule</span></div>
            <pre class="language-yaml"><code class="language-yaml">  molecule:
    name: Molecule Tests
    runs-on: ubuntu-latest
    needs: lint

    strategy:
      matrix:
        role:
          - nginx
          - postgresql
          - hardening
      fail-fast: false  # continuar con otros roles si uno falla

    steps:
      - name: Checkout del repositorio
        uses: actions/checkout@v4

      - name: Configurar Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: pip

      - name: Instalar dependencias de Molecule
        run: pip install molecule molecule-docker ansible

      - name: Instalar colecciones de Ansible
        run: |
          if [ -f requirements.yml ]; then
            ansible-galaxy collection install -r requirements.yml
          fi

      - name: Ejecutar Molecule para el rol
        run: molecule test
        working-directory: roles/nginx   # usar matrix.role en el workflow real
        env:
          PY_COLORS: '1'
          ANSIBLE_FORCE_COLOR: '1'</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content">La estrategia <code>matrix</code> corre Molecule en paralelo para cada rol. Con 3 roles, los tests corren simultáneamente en 3 jobs paralelos en lugar de secuencialmente, reduciendo el tiempo total a un tercio.</div>
          </div>
        `,
      },
      {
        title: 'Job staging-check: --check antes del merge',
        body: `
          <p>Este job conecta con el entorno de staging real y corre <code>--check --diff</code>. Si Ansible reporta algún error, el PR no puede mergearse.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/ansible-ci.yml — job staging-check</span></div>
            <pre class="language-yaml"><code class="language-yaml">  staging-check:
    name: Staging Dry-Run
    runs-on: ubuntu-latest
    needs: molecule
    if: github.event_name == 'pull_request'
    environment: staging   # entorno protegido de GitHub

    steps:
      - name: Checkout del repositorio
        uses: actions/checkout@v4

      - name: Configurar Python y Ansible
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: pip

      - name: Instalar Ansible y colecciones
        run: |
          pip install ansible
          ansible-galaxy collection install -r requirements.yml

      - name: Configurar clave SSH
        run: |
          mkdir -p ~/.ssh
          echo "$STAGING_SSH_KEY" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          ssh-keyscan -H "$STAGING_HOST" >> ~/.ssh/known_hosts
        env:
          STAGING_SSH_KEY: ${'$'}{{ secrets.STAGING_SSH_KEY }}
          STAGING_HOST: ${'$'}{{ secrets.STAGING_HOST }}

      - name: Configurar Ansible Vault password
        run: |
          echo "$ANSIBLE_VAULT_PASSWORD" > ~/.vault_pass
          chmod 600 ~/.vault_pass
        env:
          ANSIBLE_VAULT_PASSWORD: ${'$'}{{ secrets.ANSIBLE_VAULT_PASSWORD }}

      - name: Dry-run en staging
        run: |
          ansible-playbook site.yml \\
            -i inventory/staging \\
            --check \\
            --diff \\
            --vault-password-file ~/.vault_pass
        env:
          ANSIBLE_HOST_KEY_CHECKING: 'false'</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content">El <code>environment: staging</code> activa las protecciones de entorno de GitHub: approval manual requerido, lista de reviewers autorizados, y restricción de qué branches pueden deployar. Siempre usá environments protegidos para staging y producción.</div>
          </div>
        `,
      },
      {
        title: 'Job deploy: deployment a producción tras merge',
        body: `
          <p>Este job corre solo en push a main (es decir, tras un merge). Aplica el playbook completo en producción.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/ansible-ci.yml — job deploy</span></div>
            <pre class="language-yaml"><code class="language-yaml">  deploy:
    name: Deploy a Producción
    runs-on: ubuntu-latest
    needs: molecule
    if: github.event_name == 'push' &amp;&amp; github.ref == 'refs/heads/main'
    environment: production   # entorno con approval manual

    steps:
      - name: Checkout del repositorio
        uses: actions/checkout@v4

      - name: Configurar Python y Ansible
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: pip

      - name: Instalar Ansible y colecciones
        run: |
          pip install ansible
          ansible-galaxy collection install -r requirements.yml

      - name: Configurar clave SSH de producción
        run: |
          mkdir -p ~/.ssh
          echo "$PROD_SSH_KEY" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          ssh-keyscan -H "$PROD_BASTION_HOST" >> ~/.ssh/known_hosts
        env:
          PROD_SSH_KEY: ${'$'}{{ secrets.PROD_SSH_KEY }}
          PROD_BASTION_HOST: ${'$'}{{ secrets.PROD_BASTION_HOST }}

      - name: Configurar Ansible Vault password
        run: |
          echo "$ANSIBLE_VAULT_PASSWORD" > ~/.vault_pass
          chmod 600 ~/.vault_pass
        env:
          ANSIBLE_VAULT_PASSWORD: ${'$'}{{ secrets.ANSIBLE_VAULT_PASSWORD }}

      - name: Deploy a producción
        run: |
          ansible-playbook site.yml \\
            -i inventory/production \\
            --diff \\
            --vault-password-file ~/.vault_pass
        env:
          ANSIBLE_HOST_KEY_CHECKING: 'false'
          ANSIBLE_STDOUT_CALLBACK: yaml

      - name: Limpiar secretos
        if: always()
        run: rm -f ~/.vault_pass ~/.ssh/id_ed25519</code></pre>
          </div>
        `,
      },
      {
        title: 'Workflow completo: ansible-ci.yml',
        body: `
          <p>El archivo completo en un solo bloque para copiar directamente al repositorio.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/ansible-ci.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
name: Ansible CI/CD

on:
  pull_request:
    branches: [main]
    paths: ['**.yml', '**.yaml', '**.j2', 'requirements.yml']
  push:
    branches: [main]

env:
  PYTHON_VERSION: '3.12'

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: pip
      - run: pip install ansible-lint yamllint
      - run: |
          if [ -f requirements.yml ]; then
            ansible-galaxy collection install -r requirements.yml
          fi
      - run: yamllint .
      - run: ansible-lint

  molecule:
    name: Molecule Tests
    runs-on: ubuntu-latest
    needs: lint
    strategy:
      matrix:
        role: [nginx, postgresql, hardening]
      fail-fast: false
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: pip
      - run: pip install molecule molecule-docker ansible
      - run: molecule test
        working-directory: roles/nginx
        env:
          PY_COLORS: '1'
          ANSIBLE_FORCE_COLOR: '1'

  staging-check:
    name: Staging Dry-Run
    runs-on: ubuntu-latest
    needs: molecule
    if: github.event_name == 'pull_request'
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: pip
      - run: pip install ansible
      - run: ansible-galaxy collection install -r requirements.yml
      - run: |
          mkdir -p ~/.ssh
          echo "$STAGING_SSH_KEY" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          ssh-keyscan -H "$STAGING_HOST" >> ~/.ssh/known_hosts
          echo "$ANSIBLE_VAULT_PASSWORD" > ~/.vault_pass
          chmod 600 ~/.vault_pass
        env:
          STAGING_SSH_KEY: ${'$'}{{ secrets.STAGING_SSH_KEY }}
          STAGING_HOST: ${'$'}{{ secrets.STAGING_HOST }}
          ANSIBLE_VAULT_PASSWORD: ${'$'}{{ secrets.ANSIBLE_VAULT_PASSWORD }}
      - run: |
          ansible-playbook site.yml \\
            -i inventory/staging \\
            --check --diff \\
            --vault-password-file ~/.vault_pass
        env:
          ANSIBLE_HOST_KEY_CHECKING: 'false'

  deploy:
    name: Deploy a Producción
    runs-on: ubuntu-latest
    needs: molecule
    if: github.event_name == 'push' &amp;&amp; github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: pip
      - run: pip install ansible
      - run: ansible-galaxy collection install -r requirements.yml
      - run: |
          mkdir -p ~/.ssh
          echo "$PROD_SSH_KEY" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          ssh-keyscan -H "$PROD_BASTION_HOST" >> ~/.ssh/known_hosts
          echo "$ANSIBLE_VAULT_PASSWORD" > ~/.vault_pass
          chmod 600 ~/.vault_pass
        env:
          PROD_SSH_KEY: ${'$'}{{ secrets.PROD_SSH_KEY }}
          PROD_BASTION_HOST: ${'$'}{{ secrets.PROD_BASTION_HOST }}
          ANSIBLE_VAULT_PASSWORD: ${'$'}{{ secrets.ANSIBLE_VAULT_PASSWORD }}
      - run: |
          ansible-playbook site.yml \\
            -i inventory/production \\
            --diff \\
            --vault-password-file ~/.vault_pass
        env:
          ANSIBLE_HOST_KEY_CHECKING: 'false'
      - name: Limpiar secretos
        if: always()
        run: rm -f ~/.vault_pass ~/.ssh/id_ed25519</code></pre>
          </div>
        `,
      },
      {
        title: 'Gestión segura de secretos con GitHub Secrets',
        body: `
          <p>El Ansible Vault password es el secreto más crítico del pipeline. El patrón correcto lo mantiene fuera del repositorio y lo expone solo como variable de entorno en el runner.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">configurar-secrets.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Usar GitHub CLI para agregar secretos (recomendado)
gh secret set ANSIBLE_VAULT_PASSWORD --body "$(cat .vault_pass)"
gh secret set STAGING_SSH_KEY --body "$(cat ~/.ssh/id_ed25519_staging)"
gh secret set PROD_SSH_KEY --body "$(cat ~/.ssh/id_ed25519_prod)"
gh secret set STAGING_HOST --body "10.0.1.50"
gh secret set PROD_BASTION_HOST --body "bastion.empresa.com"

# Ver los secretos configurados (sin mostrar valores)
gh secret list</code></pre>
          </div>
          <div class="highlight-box">
            <p><strong>Reglas de seguridad para secretos en CI/CD:</strong></p>
            <ul>
              <li>Nunca escribas el Vault password en archivos del repositorio</li>
              <li>Usá SSH keys dedicadas para CI (sin passphrase, permisos mínimos)</li>
              <li>Rotá las claves de CI periódicamente (cada 90 días)</li>
              <li>Usá GitHub Environments protegidos para production: require approval</li>
              <li>Limpiá siempre los archivos temporales con <code>if: always()</code> para que corran incluso si el playbook falla</li>
            </ul>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Nunca uses</strong> el Vault password directamente en el argumento <code>--vault-password</code> — quedaría visible en los logs. Siempre usá variables de entorno y escríbilo a un archivo temporal con <code>--vault-password-file</code>.</div>
          </div>
        `,
      },
    ],
    quiz: [
      {
        question: '¿Cuándo se ejecuta el job staging-check en el workflow?',
        options: [
          'En cada push a cualquier rama',
          'Solo en Pull Requests hacia main',
          'Solo después de un merge exitoso a main',
          'Cada vez que cambia el archivo site.yml',
        ],
        correctIndex: 1,
        explanation: 'El job staging-check tiene la condición if: github.event_name == \'pull_request\'. Solo corre cuando se abre o actualiza un PR, actuando como gate antes del merge. Tras el merge (push a main), corre el job deploy en su lugar.',
      },
      {
        question: '¿Por qué se escribe el Vault password a un archivo temporal en lugar de pasarlo directamente como argumento?',
        options: [
          'Porque --vault-password no es una opción válida de ansible-playbook',
          'Para evitar que el password aparezca en los logs del workflow y en el historial de procesos del runner',
          'Porque GitHub Actions no soporta secrets en argumentos de comandos',
          'Para poder reutilizar el mismo password en múltiples playbooks',
        ],
        correctIndex: 1,
        explanation: 'Pasar el password directamente como argumento lo expone en los logs del runner y en la lista de procesos (ps aux). Un archivo temporal con permisos 600 es más seguro: solo el proceso de Ansible puede leerlo, y se limpia con if: always().',
      },
      {
        question: '¿Qué ventaja tiene la estrategia matrix en el job de Molecule?',
        options: [
          'Permite reutilizar el mismo runner para múltiples roles secuencialmente',
          'Corre los tests de cada rol en paralelo, reduciendo el tiempo total de CI',
          'Garantiza que los roles se ejecuten en el mismo orden que en producción',
          'Comparte el caché de Docker entre diferentes roles para acelerar las descargas',
        ],
        correctIndex: 1,
        explanation: 'La estrategia matrix crea un job separado para cada elemento de la lista. GitHub Actions los ejecuta en paralelo en diferentes runners, reduciendo el tiempo total de N × tiempo_por_rol a simplemente el tiempo del rol más lento.',
      },
    ],
    realWorldCase: 'Un equipo de DevOps con 6 ingenieros adoptó este pipeline para gestionar 300 servidores. En el primer mes, el staging-check bloqueó 11 PRs que habrían causado outages en producción. El tiempo medio de detección de errores bajó de "descubierto en producción" a "bloqueado en PR review".',
    troubleshooting: [
      {
        error: 'El job de Molecule falla con "Cannot connect to the Docker daemon" en GitHub Actions',
        cause: 'El runner no tiene Docker disponible o el daemon no está iniciado correctamente',
        fix: 'Usar "runs-on: ubuntu-latest" (incluye Docker preinstalado). Agregar "- uses: docker/setup-docker-action@v3" como primer step para garantizar que Docker esté listo antes de ejecutar Molecule.',
      },
      {
        error: 'ansible-playbook falla con "Vault password file was not found"',
        cause: 'El secret ANSIBLE_VAULT_PASSWORD no está configurado en el repositorio de GitHub, o el step de configuración no corrió correctamente',
        fix: 'Verificar que el secret existe con "gh secret list". Revisar que el step de configuración del vault_pass usa el nombre correcto del secret y que tiene los permisos de archivo 600.',
      },
      {
        error: 'El job de deploy corre en PRs aunque debería correr solo en push a main',
        cause: 'La condición if del job está mal formada o las expresiones de GitHub Actions tienen un error de sintaxis',
        fix: 'Verificar la sintaxis: if: github.event_name == \'push\' && github.ref == \'refs/heads/main\'. Usar el validador de GitHub Actions en el mismo repositorio para depurar la expresión.',
      },
    ],
  },
];

export const nivel18Modules: ModuleContent[] = [
  {
    levelId: 18,
    moduleId: 1,
    title: 'Docker y Podman con Ansible',
    objective:
      'Gestionar contenedores Docker y Podman a escala usando Ansible: instalación, despliegue, actualización y orquestación de stacks completos con community.docker y containers.podman.',
    duration: '3–4 horas',
    objectives: [
      'Entender por qué Ansible supera a docker-compose para gestión de flotas de contenedores',
      'Instalar la colección community.docker y Docker Engine mediante Ansible',
      'Desplegar, actualizar y eliminar contenedores con docker_container y docker_compose_v2',
      'Gestionar contenedores rootless con Podman usando containers.podman',
    ],
    prerequisites: [
      'Niveles 0–17 completados',
      'Conceptos básicos de Docker (imágenes, contenedores, redes, volúmenes)',
      'Control node con Python 3.8+ y acceso a hosts objetivo',
    ],
    steps: [
      {
        title: '¿Por qué Ansible en lugar de docker-compose directamente?',
        body: `
          <p>Si ya tenés <code>docker-compose.yml</code>, ¿para qué agregar Ansible? La respuesta está en la escala y la integración.</p>
          <div class="highlight-box">
            <p><strong>docker-compose resuelve un host. Ansible resuelve una flota.</strong> Cuando tenés 1 servidor, docker-compose alcanza. Cuando tenés 20 servidores con diferentes versiones de imágenes, configuraciones por ambiente y secretos distintos, necesitás Ansible.</p>
          </div>
          <p>Las ventajas concretas de usar Ansible para gestionar contenedores:</p>
          <ul>
            <li><strong>Flota unificada:</strong> el mismo playbook despliega el stack en dev, staging y producción con variables distintas</li>
            <li><strong>Integración nativa:</strong> instalás Docker, configurás el firewall, desplegás el stack y verificás health checks — todo en un solo playbook</li>
            <li><strong>Idempotencia real:</strong> Ansible no reinicia un contenedor que ya está corriendo con la configuración correcta</li>
            <li><strong>Secrets management:</strong> Ansible Vault cifra tus contraseñas de base de datos antes de pasarlas al contenedor</li>
            <li><strong>Rollbacks auditados:</strong> cada cambio queda en git y es reproducible</li>
          </ul>
          <div class="analogy-box">
            <div class="analogy-box-header">💡 Analogía</div>
            <p>docker-compose es como configurar un restaurante a mano. Ansible es el sistema de franquicias que garantiza que los 50 locales tienen la misma configuración, el mismo menú y los mismos procesos — con variaciones controladas por ciudad.</p>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Cuándo NO usar Ansible para contenedores:</strong> si tu stack vive en Kubernetes, usá el módulo <code>kubernetes.core.k8s</code> (módulo 2 de este nivel). Ansible + contenedores directos es ideal para infraestructura sin orquestador o para bootstrapping del clúster K8s.</div>
          </div>
        `,
      },
      {
        title: 'Instalar community.docker y Docker Engine',
        body: `
          <p>Antes de gestionar contenedores necesitás dos cosas: la colección de Ansible y Docker Engine en los hosts.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalar-coleccion.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Instalar la colección en el control node
ansible-galaxy collection install community.docker

# Verificar instalación
ansible-galaxy collection list | grep docker

# También necesitás el SDK de Python de Docker en el control node
pip install docker docker-compose</code></pre>
          </div>
          <p>Ahora instalá Docker Engine en los hosts objetivo con un role:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/docker/tasks/main.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Instalar dependencias previas
  ansible.builtin.apt:
    name:
      - ca-certificates
      - curl
      - gnupg
    state: present
    update_cache: true

- name: Agregar clave GPG de Docker
  ansible.builtin.apt_key:
    url: https://download.docker.com/linux/ubuntu/gpg
    state: present

- name: Agregar repositorio de Docker
  ansible.builtin.apt_repository:
    repo: "deb [arch=amd64] https://download.docker.com/linux/ubuntu {{ ansible_distribution_release }} stable"
    state: present

- name: Instalar Docker Engine
  ansible.builtin.apt:
    name:
      - docker-ce
      - docker-ce-cli
      - containerd.io
      - docker-buildx-plugin
      - docker-compose-plugin
    state: present
    update_cache: true

- name: Asegurar que Docker está activo y habilitado
  ansible.builtin.service:
    name: docker
    state: started
    enabled: true

- name: Agregar usuario al grupo docker (sin sudo)
  ansible.builtin.user:
    name: "{{ ansible_user }}"
    groups: docker
    append: true</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Reinicio de sesión:</strong> después de agregar el usuario al grupo <code>docker</code>, la sesión SSH actual no refleja el cambio. El usuario necesita salir y volver a entrar, o ejecutar <code>newgrp docker</code>. En pipelines de CI, usá <code>become: true</code> para evitar este problema.</div>
          </div>
        `,
      },
      {
        title: 'docker_container: desplegar, actualizar y eliminar',
        body: `
          <p>El módulo <code>community.docker.docker_container</code> es el equivalente a <code>docker run</code>, pero declarativo e idempotente.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">deploy-containers.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Gestión de contenedores con Ansible
  hosts: webservers
  become: true
  tasks:

    # Desplegar un contenedor nginx
    - name: Levantar nginx
      community.docker.docker_container:
        name: mi-nginx
        image: nginx:1.25
        state: started          # started | stopped | absent | present
        restart_policy: always  # always | unless-stopped | on-failure | no
        ports:
          - "80:80"
          - "443:443"
        volumes:
          - /srv/nginx/conf:/etc/nginx/conf.d:ro
          - /srv/nginx/html:/usr/share/nginx/html:ro
        env:
          NGINX_ENVSUBST_TEMPLATE_DIR: /etc/nginx/templates
        labels:
          app: frontend
          env: "{{ deploy_env }}"
        networks:
          - name: app-network

    # Actualizar a una nueva versión (pull forzado)
    - name: Actualizar imagen de nginx
      community.docker.docker_container:
        name: mi-nginx
        image: nginx:1.26          # nueva versión
        pull: always               # siempre hace pull antes de comparar
        state: started
        restart_policy: always
        ports:
          - "80:80"

    # Eliminar un contenedor
    - name: Eliminar contenedor viejo
      community.docker.docker_container:
        name: contenedor-viejo
        state: absent              # elimina el contenedor si existe

    # Crear red antes de usarla
    - name: Crear red de aplicación
      community.docker.docker_network:
        name: app-network
        state: present
        driver: bridge

    # Crear volumen nombrado
    - name: Crear volumen para datos
      community.docker.docker_volume:
        name: postgres-data
        state: present</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Idempotencia:</strong> si el contenedor ya existe con la misma imagen y configuración, Ansible no hace nada. Solo actúa cuando hay diferencias. Esto hace que podás ejecutar el playbook en cada deploy sin miedo.</div>
          </div>
        `,
      },
      {
        title: 'docker_compose_v2: despliegue de stacks completos',
        body: `
          <p>Para stacks multi-servicio, <code>community.docker.docker_compose_v2</code> trabaja con tu <code>docker-compose.yml</code> existente. Es ideal cuando ya tenés los compose files y querés orquestarlos con Ansible.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">docker-compose.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">services:
  web:
    image: "myapp:{{ app_version }}"    # variable de Ansible
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: "postgresql://app:{{ db_password }}@db:5432/appdb"
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: "{{ db_password }}"
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">deploy-stack.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Desplegar stack de aplicación
  hosts: app_servers
  become: true
  vars:
    app_version: "2.1.0"
    deploy_dir: /opt/myapp
  tasks:

    - name: Crear directorio de despliegue
      ansible.builtin.file:
        path: "{{ deploy_dir }}"
        state: directory
        mode: '0755'

    - name: Copiar compose file con variables resueltas
      ansible.builtin.template:
        src: docker-compose.yml.j2
        dest: "{{ deploy_dir }}/docker-compose.yml"

    - name: Levantar el stack
      community.docker.docker_compose_v2:
        project_src: "{{ deploy_dir }}"   # directorio con el compose file
        state: present                     # present | absent
        pull: always                       # siempre actualizar imágenes
        recreate: auto                     # recrear si hay cambios

    - name: Escalar el servicio web a 3 réplicas
      community.docker.docker_compose_v2:
        project_src: "{{ deploy_dir }}"
        services:
          web:
            scale: 3</code></pre>
          </div>
        `,
      },
      {
        title: 'Podman rootless con containers.podman',
        body: `
          <p>Podman es una alternativa a Docker que corre contenedores sin daemon y sin root — ideal para entornos de seguridad elevada. La colección <code>containers.podman</code> ofrece módulos equivalentes.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalar-podman.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Instalar la colección
ansible-galaxy collection install containers.podman

# Dependencia Python en el control node
pip install podman</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">podman-rootless.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Desplegar contenedores rootless con Podman
  hosts: secure_servers
  become: false          # IMPORTANTE: rootless = sin sudo
  tasks:

    - name: Instalar Podman
      ansible.builtin.package:
        name: podman
        state: present
      become: true       # solo para instalar el paquete

    - name: Crear red Podman
      containers.podman.podman_network:
        name: app-net
        state: present

    - name: Desplegar contenedor nginx rootless
      containers.podman.podman_container:
        name: nginx-rootless
        image: docker.io/nginx:1.25
        state: started
        ports:
          - "8080:80"      # puerto ≥ 1024 para rootless
        volumes:
          - /home/{{ ansible_user }}/html:/usr/share/nginx/html:ro
        network: app-net
        restart_policy: always
        generate_systemd:          # generar unit de systemd
          path: ~/.config/systemd/user/
          restart_policy: always

    - name: Habilitar servicio systemd del usuario (persiste tras reboot)
      ansible.builtin.systemd:
        name: container-nginx-rootless
        enabled: true
        state: started
        scope: user</code></pre>
          </div>
          <div class="highlight-box">
            <p><strong>Rootless vs Docker:</strong> los contenedores Podman rootless corren con el UID del usuario, no como root. Si el contenedor es comprometido, el atacante obtiene permisos de usuario normal — no de root del sistema. Es más seguro para workloads sensibles.</p>
          </div>
        `,
      },
      {
        title: 'Práctica: stack nginx + postgres con Ansible',
        body: `
          <p>Construí un playbook completo que despliega nginx como frontend y PostgreSQL como backend usando contenedores gestionados por Ansible.</p>
          <div class="lab-box">
            <div class="lab-box-header">🧪 Laboratorio: Stack Web Completo</div>
            <p><strong>Objetivo:</strong> Desplegar nginx + PostgreSQL en un servidor remoto, con healthchecks y variables cifradas con Vault.</p>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">deploy-full-stack.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Desplegar stack nginx + PostgreSQL
  hosts: app_servers
  become: true
  vars_files:
    - vault/secrets.yml      # db_password cifrado con Vault
  vars:
    app_network: webapp-net
    postgres_volume: pgdata-vol

  tasks:

    - name: Crear red Docker compartida
      community.docker.docker_network:
        name: "{{ app_network }}"
        state: present

    - name: Crear volumen persistente para PostgreSQL
      community.docker.docker_volume:
        name: "{{ postgres_volume }}"
        state: present

    - name: Desplegar PostgreSQL
      community.docker.docker_container:
        name: postgres
        image: postgres:16-alpine
        state: started
        restart_policy: unless-stopped
        networks:
          - name: "{{ app_network }}"
        volumes:
          - "{{ postgres_volume }}:/var/lib/postgresql/data"
        env:
          POSTGRES_DB: appdb
          POSTGRES_USER: app
          POSTGRES_PASSWORD: "{{ db_password }}"
        healthcheck:
          test: ["CMD", "pg_isready", "-U", "app", "-d", "appdb"]
          interval: 10s
          timeout: 5s
          retries: 5

    - name: Esperar a que PostgreSQL esté listo
      community.docker.docker_container_info:
        name: postgres
      register: pg_info
      until: pg_info.container.State.Health.Status == "healthy"
      retries: 12
      delay: 5

    - name: Copiar configuración de nginx
      ansible.builtin.template:
        src: nginx.conf.j2
        dest: /etc/nginx/conf.d/app.conf

    - name: Desplegar nginx
      community.docker.docker_container:
        name: nginx
        image: nginx:1.25-alpine
        state: started
        restart_policy: unless-stopped
        ports:
          - "80:80"
          - "443:443"
        networks:
          - name: "{{ app_network }}"
        volumes:
          - /etc/nginx/conf.d:/etc/nginx/conf.d:ro
          - /var/www/html:/usr/share/nginx/html:ro

    - name: Verificar que nginx responde
      ansible.builtin.uri:
        url: http://localhost:80/health
        status_code: 200
      retries: 3
      delay: 5</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Próximo paso:</strong> agregá un role <code>docker</code> para reutilizar la instalación de Docker Engine en múltiples proyectos. Así el playbook queda limpio y el role es portable.</div>
          </div>
        `,
      },
    ],
    quiz: [
      {
        question:
          '¿Cuál es la principal ventaja de usar Ansible en lugar de docker-compose para gestionar contenedores en producción?',
        options: [
          'Ansible es más rápido que docker-compose para iniciar contenedores',
          'Ansible permite gestionar flotas de múltiples hosts con variables por ambiente de forma uniforme',
          'docker-compose no soporta volúmenes persistentes',
          'Ansible no requiere instalar Docker en el host',
        ],
        correctIndex: 1,
        explanation:
          'La ventaja clave de Ansible sobre docker-compose es la gestión de flotas: el mismo playbook puede desplegar stacks en decenas de hosts con variables diferentes por ambiente (dev/staging/prod). docker-compose es excelente para un solo host, pero no escala a infraestructuras múltiples.',
      },
      {
        question:
          '¿Qué parámetro del módulo docker_container garantiza que siempre se descargue la última versión de la imagen antes de comparar?',
        options: [
          'state: latest',
          'update: always',
          'pull: always',
          'image_force: true',
        ],
        correctIndex: 2,
        explanation:
          'El parámetro <code>pull: always</code> en <code>community.docker.docker_container</code> fuerza un <code>docker pull</code> antes de verificar si el contenedor necesita recrearse. Sin este parámetro, Ansible usa la imagen local aunque exista una versión más nueva en el registro.',
      },
      {
        question:
          '¿Por qué los contenedores Podman rootless son más seguros que los contenedores Docker estándar?',
        options: [
          'Podman usa cifrado TLS para todas las comunicaciones entre contenedores',
          'Podman no permite montar volúmenes del host',
          'Los contenedores rootless corren con el UID del usuario, no como root del sistema',
          'Podman utiliza namespaces diferentes que Docker',
        ],
        correctIndex: 2,
        explanation:
          'Los contenedores Podman rootless se ejecutan mapeados al UID del usuario que los inicia. Si un atacante compromete el contenedor y escapa al host, obtiene los permisos del usuario normal — no de root. Esto reduce drásticamente el impacto de una brecha de seguridad en comparación con Docker, donde el daemon corre como root.',
      },
    ],
    realWorldCase:
      'Una empresa de SaaS migra su pipeline de despliegue de scripts bash + docker-compose a Ansible: un único playbook instala Docker Engine, configura el firewall, despliega el stack de 6 servicios con secrets cifrados con Vault y verifica healthchecks — eliminando inconsistencias entre 30 servidores de producción.',
    troubleshooting: [
      {
        error: 'ModuleNotFoundError: No module named "docker"',
        cause:
          'El SDK de Python de Docker no está instalado en el control node. Ansible necesita este paquete para comunicarse con el daemon Docker del host remoto.',
        fix: 'Ejecutá <code>pip install docker</code> en el control node. Si usás un virtualenv de Ansible, asegurate de instalarlo dentro del entorno virtual: <code>pip install docker docker-compose</code>.',
      },
      {
        error: 'community.docker not found — colección no instalada',
        cause:
          'La colección <code>community.docker</code> no está instalada en el control node o no está en el <code>ANSIBLE_COLLECTIONS_PATH</code>.',
        fix: 'Instalá la colección con <code>ansible-galaxy collection install community.docker</code>. Para proyectos, definila en <code>requirements.yml</code> y ejecutá <code>ansible-galaxy collection install -r requirements.yml</code> en CI.',
      },
      {
        error: 'Got permission denied while trying to connect to the Docker daemon socket',
        cause:
          'El usuario remoto no tiene permisos para acceder al socket Docker. Esto ocurre cuando el usuario no está en el grupo <code>docker</code> o la sesión no se reinició después de agregarlo.',
        fix: 'Agregá <code>become: true</code> en las tareas Docker, o asegurate de que el usuario esté en el grupo docker (<code>usermod -aG docker usuario</code>) y que haya iniciado una nueva sesión SSH. Verificá con <code>docker info</code> en el host.',
      },
    ],
  },
  {
    levelId: 18,
    moduleId: 2,
    title: 'Kubernetes con Ansible',
    objective:
      'Gestionar recursos de Kubernetes y charts de Helm usando Ansible: desde provisionar el clúster hasta desplegar Deployments, Services y ConfigMaps con kubernetes.core.',
    duration: '3–4 horas',
    objectives: [
      'Comprender por qué combinar Ansible y Kubernetes en el mismo pipeline',
      'Usar kubernetes.core.k8s para gestionar cualquier recurso de K8s de forma declarativa',
      'Desplegar y actualizar Helm charts con kubernetes.core.helm',
      'Generar manifiestos K8s dinámicos con templates Jinja2',
    ],
    prerequisites: [
      'Módulo 1 de este nivel completado',
      'Conceptos básicos de Kubernetes (Pod, Deployment, Service, Namespace)',
      'kubectl instalado y clúster accesible (Minikube, Kind o clúster real)',
    ],
    steps: [
      {
        title: '¿Por qué Ansible + Kubernetes?',
        body: `
          <p>Kubernetes gestiona la vida de las aplicaciones una vez que están corriendo. Ansible gestiona todo lo que rodea a Kubernetes: el clúster mismo, los nodos, los namespaces, los secrets y el pipeline de despliegue.</p>
          <div class="highlight-box">
            <p><strong>La combinación ganadora:</strong> Ansible provisiona el clúster (instala kubeadm, configura nodos, aplica CNI), luego despliega las aplicaciones con el mismo playbook. Un solo pipeline, una sola fuente de verdad.</p>
          </div>
          <p>Casos donde Ansible supera a kubectl/Helm puros:</p>
          <ul>
            <li><strong>Bootstrap del clúster:</strong> crear VMs, instalar dependencias, inicializar el clúster y deployar apps — todo en un playbook</li>
            <li><strong>Variables dinámicas:</strong> generar manifiestos K8s con Jinja2 usando variables de Ansible (versiones, configuraciones por ambiente)</li>
            <li><strong>Orquestación multi-capa:</strong> aplicar migrations de base de datos, desplegar en K8s y verificar smoke tests, en orden</li>
            <li><strong>Gestión de secrets:</strong> sacar valores de Ansible Vault e inyectarlos como K8s Secrets — sin exponerlos en git</li>
          </ul>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>¿Cuándo usar kubectl directamente?</strong> Para operaciones one-off de debugging o cuando el equipo es puramente de plataforma y ya tiene flujos establecidos con kubectl/Helm. Ansible + K8s brilla en pipelines automatizados y en entornos mixtos (VMs + contenedores + K8s).</div>
          </div>
        `,
      },
      {
        title: 'Instalar la colección kubernetes.core',
        body: `
          <p>La colección <code>kubernetes.core</code> (anteriormente <code>community.kubernetes</code>) es la suite oficial para interactuar con Kubernetes desde Ansible.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalar-k8s.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Instalar la colección
ansible-galaxy collection install kubernetes.core

# Dependencias Python en el control node
pip install kubernetes openshift

# Para Helm también necesitás el binario instalado
# En el control node:
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verificar que todo está disponible
kubectl version --client
helm version
ansible-galaxy collection list | grep kubernetes</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">requirements.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
collections:
  - name: kubernetes.core
    version: ">=3.0.0"
  - name: community.docker
    version: ">=3.0.0"</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Kubeconfig:</strong> el módulo <code>kubernetes.core.k8s</code> busca la configuración del clúster en <code>~/.kube/config</code> por defecto. Podés sobreescribir esto con el parámetro <code>kubeconfig</code> o la variable de entorno <code>K8S_AUTH_KUBECONFIG</code>. En CI, pasalo como variable cifrada con Vault.</div>
          </div>
        `,
      },
      {
        title: 'kubernetes.core.k8s: gestionar cualquier recurso',
        body: `
          <p>El módulo <code>kubernetes.core.k8s</code> puede gestionar cualquier recurso de Kubernetes — Deployments, Services, ConfigMaps, Secrets, Namespaces, CRDs. Es el <code>kubectl apply</code> de Ansible, pero declarativo e idempotente.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">deploy-k8s-resources.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Desplegar aplicación en Kubernetes
  hosts: localhost          # k8s.core corre en el control node
  connection: local
  gather_facts: false
  vars:
    app_namespace: production
    app_version: "2.1.0"
    replica_count: 3

  tasks:

    - name: Crear namespace si no existe
      kubernetes.core.k8s:
        api_version: v1
        kind: Namespace
        name: "{{ app_namespace }}"
        state: present

    - name: Crear ConfigMap con configuración
      kubernetes.core.k8s:
        state: present
        definition:
          apiVersion: v1
          kind: ConfigMap
          metadata:
            name: app-config
            namespace: "{{ app_namespace }}"
          data:
            LOG_LEVEL: info
            MAX_CONNECTIONS: "100"
            FEATURE_FLAG_NEW_UI: "true"

    - name: Crear Secret desde Vault
      kubernetes.core.k8s:
        state: present
        definition:
          apiVersion: v1
          kind: Secret
          metadata:
            name: app-secrets
            namespace: "{{ app_namespace }}"
          type: Opaque
          stringData:
            DATABASE_URL: "{{ db_connection_string }}"  # desde Vault
            API_KEY: "{{ api_key }}"                    # desde Vault

    - name: Desplegar aplicación
      kubernetes.core.k8s:
        state: present
        definition:
          apiVersion: apps/v1
          kind: Deployment
          metadata:
            name: myapp
            namespace: "{{ app_namespace }}"
          spec:
            replicas: "{{ replica_count }}"
            selector:
              matchLabels:
                app: myapp
            template:
              metadata:
                labels:
                  app: myapp
                  version: "{{ app_version }}"
              spec:
                containers:
                  - name: myapp
                    image: "myregistry/myapp:{{ app_version }}"
                    envFrom:
                      - configMapRef:
                          name: app-config
                      - secretRef:
                          name: app-secrets

    - name: Esperar a que el Deployment esté listo
      kubernetes.core.k8s_info:
        api_version: apps/v1
        kind: Deployment
        name: myapp
        namespace: "{{ app_namespace }}"
        wait: true
        wait_condition:
          type: Available
          status: "True"
        wait_timeout: 120</code></pre>
          </div>
        `,
      },
      {
        title: 'kubernetes.core.helm: gestión de Helm charts',
        body: `
          <p>El módulo <code>kubernetes.core.helm</code> instala, actualiza y elimina Helm charts desde Ansible. Podés combinar repositorios públicos de charts con valores generados dinámicamente con Jinja2.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">helm-deploy.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Gestionar Helm charts con Ansible
  hosts: localhost
  connection: local
  gather_facts: false

  tasks:

    - name: Agregar repositorio de Helm (cert-manager)
      kubernetes.core.helm_repository:
        name: jetstack
        repo_url: https://charts.jetstack.io
        state: present

    - name: Agregar repositorio de ingress-nginx
      kubernetes.core.helm_repository:
        name: ingress-nginx
        repo_url: https://kubernetes.github.io/ingress-nginx
        state: present

    - name: Instalar cert-manager
      kubernetes.core.helm:
        name: cert-manager
        chart_ref: jetstack/cert-manager
        chart_version: "v1.14.0"
        release_namespace: cert-manager
        create_namespace: true
        values:
          installCRDs: true
          replicaCount: 2
        state: present
        wait: true
        wait_timeout: "5m"

    - name: Instalar ingress-nginx con valores dinámicos
      kubernetes.core.helm:
        name: ingress-nginx
        chart_ref: ingress-nginx/ingress-nginx
        chart_version: "4.9.0"
        release_namespace: ingress-nginx
        create_namespace: true
        values:
          controller:
            replicaCount: "{{ ingress_replicas | default(2) }}"
            service:
              type: LoadBalancer
              annotations:
                service.beta.kubernetes.io/aws-load-balancer-type: nlb
        state: present

    - name: Actualizar mi app con nuevo chart
      kubernetes.core.helm:
        name: myapp
        chart_ref: ./charts/myapp     # chart local
        release_namespace: production
        values_files:
          - values/base.yml
          - values/production.yml     # override de producción
        values:
          image.tag: "{{ app_version }}"    # variable de Ansible
        state: present
        atomic: true            # rollback automático si falla</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>atomic: true</strong> es tu red de seguridad en producción. Si el chart falla en desplegarse (pods no Ready en el timeout), Helm hace rollback automático a la release anterior. Siempre usalo en ambientes productivos.</div>
          </div>
        `,
      },
      {
        title: 'Manifiestos K8s con templates Jinja2',
        body: `
          <p>En lugar de incrustar el YAML de K8s directamente en el playbook, podés usar templates Jinja2 para generar manifiestos dinámicos. Esto es especialmente útil cuando el mismo template se usa para múltiples ambientes.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">templates/deployment.yml.j2</span></div>
            <pre class="language-yaml"><code class="language-yaml">apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ app_name }}
  namespace: {{ app_namespace }}
  labels:
    app: {{ app_name }}
    env: {{ deploy_env }}
    version: {{ app_version }}
spec:
  replicas: {{ replica_count }}
  selector:
    matchLabels:
      app: {{ app_name }}
  template:
    metadata:
      labels:
        app: {{ app_name }}
    spec:
      containers:
        - name: {{ app_name }}
          image: {{ container_registry }}/{{ app_name }}:{{ app_version }}
          resources:
            requests:
              cpu: {{ cpu_request | default('100m') }}
              memory: {{ memory_request | default('128Mi') }}
            limits:
              cpu: {{ cpu_limit | default('500m') }}
              memory: {{ memory_limit | default('512Mi') }}
{% if env_vars is defined %}
          env:
{% for key, value in env_vars.items() %}
            - name: {{ key }}
              value: "{{ value }}"
{% endfor %}
{% endif %}</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">apply-templates.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Aplicar manifiestos K8s desde templates
  hosts: localhost
  connection: local
  vars_files:
    - vars/{{ deploy_env }}.yml   # vars/production.yml, vars/staging.yml
  tasks:

    - name: Aplicar Deployment desde template
      kubernetes.core.k8s:
        state: present
        template: templates/deployment.yml.j2   # Jinja2 nativo en k8s

    - name: Aplicar desde directorio de templates
      kubernetes.core.k8s:
        state: present
        template: "{{ item }}"
      loop: "{{ query('fileglob', 'templates/*.yml.j2') }}"</code></pre>
          </div>
          <div class="highlight-box">
            <p><strong>Ventaja sobre kubectl apply -f:</strong> los templates Jinja2 te permiten un único conjunto de manifiestos para todos los ambientes. Las diferencias (réplicas, recursos, imágenes) viven en archivos de variables por ambiente, no en múltiples carpetas de manifiestos duplicados.</p>
          </div>
        `,
      },
      {
        title: 'Práctica: Deployment + Service + ConfigMap',
        body: `
          <p>Desplegá una aplicación completa en Kubernetes usando Ansible: un Deployment, un Service de tipo LoadBalancer y un ConfigMap con la configuración de la aplicación.</p>
          <div class="lab-box">
            <div class="lab-box-header">🧪 Laboratorio: App completa en K8s</div>
            <p><strong>Objetivo:</strong> Desplegar una aplicación web en el namespace <code>lab</code>, exponerla y verificar que está healthy.</p>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">lab-k8s-deploy.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Lab — App completa en Kubernetes
  hosts: localhost
  connection: local
  gather_facts: false
  vars:
    namespace: lab
    app: demo-web
    image: nginx:1.25-alpine
    replicas: 2

  tasks:

    - name: Crear namespace lab
      kubernetes.core.k8s:
        api_version: v1
        kind: Namespace
        name: "{{ namespace }}"
        state: present

    - name: ConfigMap con página HTML
      kubernetes.core.k8s:
        state: present
        definition:
          apiVersion: v1
          kind: ConfigMap
          metadata:
            name: "{{ app }}-html"
            namespace: "{{ namespace }}"
          data:
            index.html: |
              <!DOCTYPE html>
              <html><body>
                <h1>Desplegado por Ansible 🚀</h1>
                <p>Versión: {{ app_version | default('1.0.0') }}</p>
                <p>Ambiente: {{ deploy_env | default('lab') }}</p>
              </body></html>

    - name: Deployment nginx
      kubernetes.core.k8s:
        state: present
        definition:
          apiVersion: apps/v1
          kind: Deployment
          metadata:
            name: "{{ app }}"
            namespace: "{{ namespace }}"
          spec:
            replicas: "{{ replicas }}"
            selector:
              matchLabels:
                app: "{{ app }}"
            template:
              metadata:
                labels:
                  app: "{{ app }}"
              spec:
                containers:
                  - name: nginx
                    image: "{{ image }}"
                    ports:
                      - containerPort: 80
                    volumeMounts:
                      - name: html
                        mountPath: /usr/share/nginx/html
                volumes:
                  - name: html
                    configMap:
                      name: "{{ app }}-html"

    - name: Service LoadBalancer
      kubernetes.core.k8s:
        state: present
        definition:
          apiVersion: v1
          kind: Service
          metadata:
            name: "{{ app }}-svc"
            namespace: "{{ namespace }}"
          spec:
            selector:
              app: "{{ app }}"
            ports:
              - port: 80
                targetPort: 80
            type: LoadBalancer

    - name: Verificar pods running
      kubernetes.core.k8s_info:
        kind: Pod
        namespace: "{{ namespace }}"
        label_selectors:
          - "app={{ app }}"
        wait: true
        wait_condition:
          type: Ready
          status: "True"

    - name: Mostrar URL del servicio
      kubernetes.core.k8s_info:
        kind: Service
        name: "{{ app }}-svc"
        namespace: "{{ namespace }}"
      register: svc_info

    - name: Imprimir IP externa
      ansible.builtin.debug:
        msg: "App disponible en: http://{{ svc_info.resources[0].status.loadBalancer.ingress[0].ip }}"</code></pre>
          </div>
        `,
      },
    ],
    quiz: [
      {
        question:
          '¿En qué host se ejecutan los módulos de kubernetes.core por defecto?',
        options: [
          'En cada nodo worker del clúster Kubernetes',
          'En el nodo master del clúster',
          'En el control node de Ansible (localhost con connection: local)',
          'En el primer host del inventario de Ansible',
        ],
        correctIndex: 2,
        explanation:
          'Los módulos de <code>kubernetes.core</code> se ejecutan en el control node de Ansible (tu máquina o el servidor de CI), no en los nodos del clúster. Se comunican con la API de Kubernetes usando el kubeconfig disponible en el control node. Por eso se usa <code>hosts: localhost</code> y <code>connection: local</code>.',
      },
      {
        question:
          '¿Qué hace el parámetro <code>atomic: true</code> en kubernetes.core.helm?',
        options: [
          'Instala el chart en modo atómico usando transacciones SQL',
          'Hace rollback automático a la versión anterior si el despliegue falla',
          'Previene que otros procesos modifiquen el chart durante la instalación',
          'Fuerza la reinstalación completa en lugar de un upgrade incremental',
        ],
        correctIndex: 1,
        explanation:
          'El parámetro <code>atomic: true</code> en Helm significa que si el despliegue falla (los pods no pasan a estado Ready dentro del timeout), Helm hace automáticamente rollback a la release anterior. Es una red de seguridad esencial para producción: garantiza que un deploy fallido no deja el sistema en estado inconsistente.',
      },
      {
        question:
          '¿Cuál es la ventaja principal de usar templates Jinja2 para generar manifiestos K8s en lugar de tener múltiples carpetas de YAMLs por ambiente?',
        options: [
          'Los templates Jinja2 son más rápidos de procesar que YAML estático',
          'Kubernetes solo acepta manifiestos generados con Jinja2',
          'Un único conjunto de templates con variables por ambiente elimina la duplicación y el riesgo de inconsistencias entre ambientes',
          'Los templates permiten usar tipos de datos que YAML no soporta nativamente',
        ],
        correctIndex: 2,
        explanation:
          'Con templates Jinja2, tenés una única fuente de verdad para los manifiestos K8s. Las diferencias entre dev, staging y producción (réplicas, límites de recursos, imágenes) se controlan con variables de Ansible. Esto elimina el problema clásico de tener carpetas <code>k8s/dev/</code>, <code>k8s/staging/</code>, <code>k8s/prod/</code> que se sincronizan manualmente y acaban divergiendo.',
      },
    ],
    realWorldCase:
      'Un equipo de plataforma usa Ansible para provisionar clústeres EKS con eksctl, configurar los namespaces y RBAC, instalar ingress-nginx y cert-manager con Helm, y finalmente desplegar 12 microservicios — todo en un único pipeline de GitLab CI que tarda 8 minutos de extremo a extremo.',
    troubleshooting: [
      {
        error: 'No module named "kubernetes" — ImportError en el módulo k8s',
        cause:
          'El paquete Python <code>kubernetes</code> no está instalado en el control node. Este paquete es la dependencia obligatoria de <code>kubernetes.core</code> para comunicarse con la API de K8s.',
        fix: 'Ejecutá <code>pip install kubernetes openshift</code> en el control node. Si usás un virtualenv de Ansible, instalalo dentro del entorno: <code>pip install kubernetes>=26.1.0</code>. Verificá con <code>python -c "import kubernetes; print(kubernetes.__version__)"</code>.',
      },
      {
        error: 'FileNotFoundError: kubeconfig file not found at ~/.kube/config',
        cause:
          'No hay un kubeconfig disponible en el control node o la ruta por defecto no existe. Esto ocurre en entornos CI/CD donde el clúster no está configurado localmente.',
        fix: 'Usá el parámetro <code>kubeconfig: /ruta/al/kubeconfig</code> en el módulo, o la variable de entorno <code>K8S_AUTH_KUBECONFIG</code>. En CI, guardá el kubeconfig cifrado en Ansible Vault y copialo al control node antes de ejecutar el playbook.',
      },
      {
        error: 'Helm chart upgrade failed: timed out waiting for the condition',
        cause:
          'Los pods del chart no pasaron a estado Ready dentro del timeout configurado. Puede ser por resources insuficientes, imagen incorrecta, ConfigMap faltante o error en el liveness probe.',
        fix: 'Verificá los pods con <code>kubectl get pods -n &lt;namespace&gt;</code> y los logs con <code>kubectl logs &lt;pod-name&gt;</code>. Si usás <code>atomic: true</code>, Helm habrá hecho rollback automático. Ajustá el timeout con <code>wait_timeout: "10m"</code> o corregí el error en los recursos del chart.',
      },
    ],
  },
  {
    levelId: 18,
    moduleId: 3,
    title: 'AWS, Azure y GCP con Ansible',
    objective:
      'Provisionar y gestionar infraestructura cloud en AWS, Azure y GCP usando colecciones Ansible: amazon.aws, azure.azcollection y google.cloud, con inventario dinámico para autodescubrimiento de hosts.',
    duration: '4–5 horas',
    objectives: [
      'Entender el rol de Ansible en IaC cloud y cuándo usarlo vs. Terraform',
      'Provisionar recursos AWS (EC2, S3, RDS, IAM) con amazon.aws',
      'Configurar inventario dinámico con el plugin aws_ec2 para autodescubrimiento',
      'Gestionar VMs en Azure y GCP con sus respectivas colecciones de Ansible',
    ],
    prerequisites: [
      'Módulo 2 de este nivel completado',
      'Cuenta en AWS, Azure o GCP con credenciales de acceso programático',
      'AWS CLI, Azure CLI o gcloud CLI instalados y configurados',
    ],
    steps: [
      {
        title: 'Ansible y cloud: IaC vs. ClickOps',
        body: `
          <p><strong>ClickOps</strong> es el antipatrón de gestionar infraestructura cloud manualmente desde la consola web: hacer clic, configurar, esperar. Es lento, no reproducible y propenso a errores humanos.</p>
          <div class="highlight-box">
            <p><strong>IaC (Infrastructure as Code)</strong> describe la infraestructura en código versionado, revisable y automatizable. Ansible, Terraform y CloudFormation son herramientas de IaC. El código vive en git, los cambios se revisan en pull requests, y los entornos son reproducibles.</p>
          </div>
          <p>¿Cuándo usar Ansible para cloud en lugar de Terraform?</p>
          <table class="comparison-table">
            <tr><th>Ansible para cloud</th><th>Terraform para cloud</th></tr>
            <tr><td>Provisionás infraestructura Y configurás el SO en el mismo pipeline</td><td>Infraestructura pura, sin gestión de configuración</td></tr>
            <tr><td>Integración nativa con roles de configuración existentes</td><td>State management con tfstate — más robusto para IaC a gran escala</td></tr>
            <tr><td>Sin estado local que gestionar (stateless)</td><td>Requiere gestionar el tfstate (backend remoto)</td></tr>
            <tr><td>Ideal para equipos que ya usan Ansible para todo</td><td>Ideal cuando el equipo es dedicado a infraestructura cloud</td></tr>
          </table>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>El patrón mixto más común:</strong> Terraform gestiona la infraestructura base (VPCs, subnets, grupos de seguridad) y Ansible configura las VMs una vez aprovisionadas. Cada herramienta en lo que mejor hace.</div>
          </div>
        `,
      },
      {
        title: 'AWS con amazon.aws: EC2, S3, RDS e IAM',
        body: `
          <p>La colección <code>amazon.aws</code> cubre los servicios core de AWS. Para servicios adicionales está <code>community.aws</code>.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">setup-aws.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Instalar colección
ansible-galaxy collection install amazon.aws

# Dependencia Python
pip install boto3 botocore

# Configurar credenciales AWS (en el control node)
aws configure
# O mediante variables de entorno:
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_DEFAULT_REGION="us-east-1"</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">aws-resources.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Provisionar recursos AWS
  hosts: localhost
  connection: local
  gather_facts: false
  vars:
    region: us-east-1
    instance_type: t3.medium
    ami_id: ami-0c55b159cbfafe1f0   # Amazon Linux 2023

  tasks:

    # EC2 Instance
    - name: Lanzar instancia EC2
      amazon.aws.ec2_instance:
        name: "web-server-{{ deploy_env }}"
        key_name: mi-keypair
        instance_type: "{{ instance_type }}"
        image_id: "{{ ami_id }}"
        region: "{{ region }}"
        security_group: web-sg
        vpc_subnet_id: subnet-abc123
        tags:
          Environment: "{{ deploy_env }}"
          ManagedBy: ansible
        wait: true
        state: running
      register: ec2_result

    # S3 Bucket
    - name: Crear bucket S3 para assets
      amazon.aws.s3_bucket:
        name: "mycompany-assets-{{ deploy_env }}"
        region: "{{ region }}"
        versioning: true
        encryption: aws:kms
        tags:
          Environment: "{{ deploy_env }}"
        state: present

    # RDS Instance
    - name: Crear base de datos RDS
      amazon.aws.rds_instance:
        db_instance_identifier: "myapp-db-{{ deploy_env }}"
        db_instance_class: db.t3.medium
        engine: postgres
        engine_version: "16.1"
        master_username: admin
        master_user_password: "{{ db_password }}"   # desde Vault
        allocated_storage: 20
        db_subnet_group_name: my-subnet-group
        vpc_security_group_ids:
          - sg-rds123
        tags:
          Environment: "{{ deploy_env }}"
        state: present

    # IAM User para la aplicación
    - name: Crear usuario IAM para la app
      amazon.aws.iam_user:
        name: "myapp-{{ deploy_env }}"
        state: present
        tags:
          ManagedBy: ansible</code></pre>
          </div>
        `,
      },
      {
        title: 'Inventario dinámico con aws_ec2',
        body: `
          <p>El inventario dinámico es uno de los features más poderosos de Ansible para cloud. En lugar de mantener un archivo de inventario estático con IPs, Ansible pregunta a AWS cuáles instancias existen en tiempo real.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">inventory/aws_ec2.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
plugin: amazon.aws.aws_ec2
regions:
  - us-east-1
  - us-west-2

# Filtrar solo instancias running con nuestros tags
filters:
  instance-state-name: running
  tag:ManagedBy: ansible

# Agrupar instancias por tag
keyed_groups:
  - key: tags.Environment
    prefix: env
  - key: tags.Role
    prefix: role
  - key: instance_type
    prefix: type

# Usar el DNS privado como hostname (dentro de VPC)
hostnames:
  - private-dns-name

# Variables disponibles para cada host
compose:
  ansible_host: private_ip_address
  ansible_user: "'ec2-user'"</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">usar-inventario-dinamico.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Ver qué hosts descubre el plugin
ansible-inventory -i inventory/aws_ec2.yml --list

# Ver el árbol de grupos
ansible-inventory -i inventory/aws_ec2.yml --graph

# Ejecutar playbook contra instancias del ambiente prod
ansible-playbook -i inventory/aws_ec2.yml site.yml --limit env_production

# Ejecutar solo en instancias de tipo web
ansible-playbook -i inventory/aws_ec2.yml configure-web.yml --limit role_web</code></pre>
          </div>
          <div class="highlight-box">
            <p><strong>Cero mantenimiento del inventario:</strong> cuando lanzás una nueva instancia con el tag correcto, aparece automáticamente en el inventario. Cuando la terminás, desaparece. Sin archivos de inventario que sincronizar manualmente.</p>
          </div>
        `,
      },
      {
        title: 'Azure con azure.azcollection',
        body: `
          <p>La colección <code>azure.azcollection</code> cubre todos los servicios de Azure: VMs, redes, almacenamiento, bases de datos y servicios gestionados.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">setup-azure.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Instalar colección
ansible-galaxy collection install azure.azcollection

# Instalar dependencias Python
pip install -r ~/.ansible/collections/ansible_collections/azure/azcollection/requirements.txt

# Autenticar (Service Principal)
export AZURE_CLIENT_ID="..."
export AZURE_SECRET="..."
export AZURE_SUBSCRIPTION_ID="..."
export AZURE_TENANT="..."</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">azure-vm.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Provisionar VM en Azure
  hosts: localhost
  connection: local
  gather_facts: false
  vars:
    resource_group: myapp-rg
    location: eastus
    vm_name: "web-vm-{{ deploy_env }}"

  tasks:

    - name: Crear Resource Group
      azure.azcollection.azure_rm_resourcegroup:
        name: "{{ resource_group }}"
        location: "{{ location }}"
        state: present

    - name: Crear Virtual Network
      azure.azcollection.azure_rm_virtualnetwork:
        resource_group: "{{ resource_group }}"
        name: myapp-vnet
        address_prefixes: "10.0.0.0/16"

    - name: Crear subnet
      azure.azcollection.azure_rm_subnet:
        resource_group: "{{ resource_group }}"
        name: myapp-subnet
        virtual_network: myapp-vnet
        address_prefix: "10.0.1.0/24"

    - name: Crear IP pública
      azure.azcollection.azure_rm_publicipaddress:
        resource_group: "{{ resource_group }}"
        name: "{{ vm_name }}-pip"
        allocation_method: static
      register: pip_output

    - name: Crear VM Linux
      azure.azcollection.azure_rm_virtualmachine:
        resource_group: "{{ resource_group }}"
        name: "{{ vm_name }}"
        vm_size: Standard_B2s
        admin_username: azureuser
        ssh_password_enabled: false
        ssh_public_keys:
          - path: /home/azureuser/.ssh/authorized_keys
            key_data: "{{ lookup('file', '~/.ssh/id_ed25519.pub') }}"
        image:
          offer: UbuntuServer
          publisher: Canonical
          sku: 22.04-LTS
          version: latest
        tags:
          ManagedBy: ansible
          Environment: "{{ deploy_env }}"</code></pre>
          </div>
        `,
      },
      {
        title: 'GCP con google.cloud',
        body: `
          <p>La colección <code>google.cloud</code> gestiona recursos de Google Cloud Platform: Compute Engine, Cloud Storage, Cloud SQL y más.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">setup-gcp.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Instalar colección
ansible-galaxy collection install google.cloud

# Dependencias Python
pip install google-auth requests

# Autenticar con service account
export GCP_AUTH_KIND=serviceaccount
export GCP_SERVICE_ACCOUNT_FILE=/path/to/sa-key.json
export GCP_PROJECT=mi-proyecto-gcp</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">gcp-resources.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Provisionar recursos en GCP
  hosts: localhost
  connection: local
  gather_facts: false
  vars:
    project: mi-proyecto-gcp
    zone: us-central1-a
    region: us-central1

  tasks:

    - name: Crear instancia Compute Engine
      google.cloud.gcp_compute_instance:
        name: "web-vm-{{ deploy_env }}"
        machine_type: n2-standard-2
        zone: "{{ zone }}"
        project: "{{ project }}"
        auth_kind: serviceaccount
        service_account_file: /path/to/sa-key.json
        disks:
          - auto_delete: true
            boot: true
            initialize_params:
              source_image: projects/ubuntu-os-cloud/global/images/family/ubuntu-2204-lts
              disk_size_gb: 50
        network_interfaces:
          - network:
              selfLink: global/networks/default
            access_configs:
              - name: External NAT
                type: ONE_TO_ONE_NAT
        labels:
          env: "{{ deploy_env }}"
          managed-by: ansible
        state: present
      register: gcp_instance

    - name: Crear bucket de Cloud Storage
      google.cloud.gcp_storage_bucket:
        name: "myapp-assets-{{ project }}-{{ deploy_env }}"
        project: "{{ project }}"
        auth_kind: serviceaccount
        service_account_file: /path/to/sa-key.json
        location: "{{ region }}"
        storage_class: STANDARD
        versioning:
          enabled: true
        state: present</code></pre>
          </div>
        `,
      },
      {
        title: 'Práctica: provisionar EC2, esperar SSH y configurar',
        body: `
          <p>El flujo completo de provisioning cloud con Ansible: creás la instancia, esperás que esté disponible por SSH, y en el mismo playbook la configurás.</p>
          <div class="lab-box">
            <div class="lab-box-header">🧪 Laboratorio: EC2 end-to-end</div>
            <p><strong>Objetivo:</strong> Provisionar una instancia EC2, esperar a que SSH esté disponible, y luego instalar nginx en ella — todo en un único playbook.</p>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">lab-ec2-provision-configure.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
# Play 1: Provisionar la instancia
- name: Provisionar EC2
  hosts: localhost
  connection: local
  gather_facts: false
  vars:
    region: us-east-1
    ami_id: ami-0c55b159cbfafe1f0
    instance_type: t3.micro
    key_name: mi-keypair

  tasks:

    - name: Lanzar instancia EC2
      amazon.aws.ec2_instance:
        name: "lab-web-server"
        key_name: "{{ key_name }}"
        instance_type: "{{ instance_type }}"
        image_id: "{{ ami_id }}"
        region: "{{ region }}"
        security_groups:
          - web-sg
        tags:
          Name: lab-web-server
          ManagedBy: ansible
        wait: true
        state: running
      register: ec2

    - name: Agregar al inventario dinámico en memoria
      ansible.builtin.add_host:
        name: "{{ ec2.instances[0].public_ip_address }}"
        groups: newly_provisioned
        ansible_user: ec2-user
        ansible_ssh_private_key_file: ~/.ssh/mi-keypair.pem
        ansible_ssh_extra_args: '-o StrictHostKeyChecking=no'

    - name: Esperar a que SSH esté disponible
      ansible.builtin.wait_for:
        host: "{{ ec2.instances[0].public_ip_address }}"
        port: 22
        delay: 10
        timeout: 300
        state: started

# Play 2: Configurar la instancia recién creada
- name: Configurar el servidor web
  hosts: newly_provisioned
  gather_facts: true
  become: true

  tasks:

    - name: Actualizar paquetes
      ansible.builtin.dnf:
        name: "*"
        state: latest
        update_cache: true

    - name: Instalar nginx
      ansible.builtin.dnf:
        name: nginx
        state: present

    - name: Iniciar y habilitar nginx
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true

    - name: Verificar que nginx responde
      ansible.builtin.uri:
        url: "http://{{ ansible_host }}/index.html"
        status_code: 200
      delegate_to: localhost</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>add_host</strong> es el truco que permite pasar información entre plays en el mismo playbook. El primer play descubre la IP de la instancia y la agrega a un grupo temporal en memoria. El segundo play se conecta a ese grupo y configura la máquina.</div>
          </div>
        `,
      },
    ],
    quiz: [
      {
        question:
          '¿Cuál es la principal ventaja del inventario dinámico con el plugin aws_ec2 sobre un inventario estático?',
        options: [
          'El inventario dinámico es más rápido de procesar que un archivo YAML estático',
          'Autodescubre las instancias EC2 en tiempo real sin necesidad de mantener el inventario manualmente',
          'Permite usar variables de grupo que el inventario estático no soporta',
          'Solo el inventario dinámico soporta múltiples regiones de AWS',
        ],
        correctIndex: 1,
        explanation:
          'El inventario dinámico con <code>aws_ec2</code> consulta la API de AWS en cada ejecución de Ansible. Cuando lanzás una nueva instancia con los tags correctos, aparece automáticamente. Cuando la terminás, desaparece. Esto elimina el riesgo de inventarios desincronizados con la infraestructura real, que es el problema crónico de los inventarios estáticos en entornos cloud dinámicos.',
      },
      {
        question:
          '¿Qué módulo de Ansible se usa para pasar la IP de una instancia recién provisionada del primer play al segundo play dentro del mismo playbook?',
        options: [
          'ansible.builtin.set_fact con hostvars',
          'ansible.builtin.add_host',
          'amazon.aws.ec2_instance con register',
          'ansible.builtin.include_vars',
        ],
        correctIndex: 1,
        explanation:
          '<code>ansible.builtin.add_host</code> agrega un host al inventario en memoria durante la ejecución del playbook. Esto permite que el play 1 provisionice la instancia, descubra su IP, la agregue a un grupo temporal, y el play 2 se conecte a ese grupo para configurar la máquina — todo dentro del mismo playbook, sin inventario externo.',
      },
      {
        question:
          '¿Cuándo es preferible usar Terraform en lugar de Ansible para gestionar infraestructura cloud?',
        options: [
          'Cuando necesitás configurar el sistema operativo de las VMs además de crearlas',
          'Cuando tenés infraestructura cloud compleja con dependencias entre recursos y necesitás gestión de estado robusta con plan/apply',
          'Cuando el equipo ya conoce Ansible y no quiere aprender otra herramienta',
          'Cuando necesitás conectarte a las VMs por SSH para ejecutar comandos',
        ],
        correctIndex: 1,
        explanation:
          'Terraform brilla cuando tenés infraestructura cloud compleja con muchas dependencias entre recursos (VPCs, subnets, security groups, etc.) y necesitás la capacidad de <code>terraform plan</code> para ver qué va a cambiar antes de aplicar. Su gestión de estado (tfstate) es más robusta para IaC puro. Ansible es mejor cuando necesitás combinar provisioning con configuración del SO en el mismo pipeline.',
      },
    ],
    realWorldCase:
      'Un startup que migraba de ClickOps a IaC implementó Ansible para provisionar instancias EC2 con el módulo amazon.aws, luego configurarlas automáticamente: en cada PR merge, el pipeline crea el entorno de staging, corre las pruebas de integración y termina la instancia — eliminando costos de infraestructura idle y errores de configuración manual.',
    troubleshooting: [
      {
        error: 'ModuleNotFoundError: No module named "botocore" o "boto3"',
        cause:
          'Los paquetes Python <code>boto3</code> y <code>botocore</code> no están instalados en el control node. Son las dependencias obligatorias de la colección <code>amazon.aws</code> para comunicarse con la API de AWS.',
        fix: 'Ejecutá <code>pip install boto3 botocore</code> en el entorno Python que usa Ansible. Verificá cuál Python usa Ansible con <code>ansible --version | grep python</code> e instalá los paquetes en ese entorno específico.',
      },
      {
        error: 'AuthFailure: AWS was not able to validate the provided access credentials',
        cause:
          'Las credenciales de AWS son incorrectas, han expirado, o no están disponibles en el entorno donde corre Ansible. Esto también ocurre cuando se usan perfiles AWS incorrectos.',
        fix: 'Verificá las credenciales con <code>aws sts get-caller-identity</code>. Asegurate de que las variables de entorno <code>AWS_ACCESS_KEY_ID</code> y <code>AWS_SECRET_ACCESS_KEY</code> están seteadas correctamente, o que <code>~/.aws/credentials</code> tiene el perfil correcto. En CI, usá IAM Roles para las instancias en lugar de credenciales estáticas.',
      },
      {
        error: 'azure.azcollection: No module named "azure.mgmt.compute"',
        cause:
          'Las dependencias Python de la colección azure.azcollection no están instaladas. Esta colección tiene muchas dependencias del SDK de Azure que deben instalarse desde su propio archivo requirements.txt.',
        fix: 'Instalá las dependencias correctas ejecutando: <code>pip install -r ~/.ansible/collections/ansible_collections/azure/azcollection/requirements.txt</code>. El archivo requirements.txt de la colección asegura que se instalen las versiones compatibles de todos los SDKs de Azure.',
      },
    ],
  },
  {
    levelId: 18,
    moduleId: 4,
    title: 'VMware y Proxmox con Ansible',
    objective:
      'Gestionar virtualización empresarial y de homelab usando Ansible: provisionar VMs en vSphere con community.vmware y en Proxmox con community.general, incluyendo snapshots, templates y gestión del ciclo de vida.',
    duration: '3–4 horas',
    objectives: [
      'Usar community.vmware para gestionar el ciclo de vida de VMs en vSphere',
      'Automatizar snapshots, clones desde template y estados de energía en VMware',
      'Provisionar VMs en Proxmox con los módulos de community.general',
      'Crear VMs desde templates en Proxmox para despliegues reproducibles',
    ],
    prerequisites: [
      'Módulo 3 de este nivel completado',
      'Acceso a un entorno VMware vSphere o Proxmox (puede ser laboratorio)',
      'Credenciales de administrador para el hipervisor objetivo',
    ],
    steps: [
      {
        title: 'community.vmware: gestión de vSphere',
        body: `
          <p>La colección <code>community.vmware</code> cubre la API de VMware vSphere para gestionar VMs, templates, redes, almacenamiento y clústeres ESXi desde Ansible.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">setup-vmware.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Instalar colección
ansible-galaxy collection install community.vmware

# Dependencias Python
pip install pyVmomi PyVim

# Las credenciales se pasan como variables o se definen en el playbook
# Nunca hardcodees contraseñas — usá Ansible Vault</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">group_vars/all/vmware.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
# Variables de conexión vSphere (las sensibles van en Vault)
vcenter_hostname: vcenter.empresa.local
vcenter_username: ansible@vsphere.local
vcenter_password: "{{ vault_vcenter_password }}"
vcenter_validate_certs: false    # true en producción con cert válido
datacenter_name: DC-Principal
cluster_name: Cluster-Produccion
datastore_name: SAN-Produccion</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">vmware-deploy.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Provisionar VM en VMware vSphere
  hosts: localhost
  connection: local
  gather_facts: false

  tasks:

    - name: Crear VM desde template
      community.vmware.vmware_guest:
        hostname: "{{ vcenter_hostname }}"
        username: "{{ vcenter_username }}"
        password: "{{ vcenter_password }}"
        validate_certs: "{{ vcenter_validate_certs }}"
        datacenter: "{{ datacenter_name }}"
        cluster: "{{ cluster_name }}"
        datastore: "{{ datastore_name }}"
        folder: "/{{ datacenter_name }}/vm/Produccion"
        name: "web-vm-{{ inventory_hostname }}"
        template: Ubuntu-22.04-Template
        state: poweredon
        hardware:
          num_cpus: 4
          memory_mb: 8192
        networks:
          - name: VLAN-Produccion
            ip: "{{ vm_ip }}"
            netmask: 255.255.255.0
            gateway: 192.168.10.1
        customization:
          hostname: "web-{{ inventory_hostname }}"
          dns_servers:
            - 192.168.1.1
            - 8.8.8.8
        wait_for_customization: true
      register: vm_result</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>wait_for_customization: true</strong> hace que Ansible espere a que vSphere complete la personalización del SO (hostname, red, etc.) antes de continuar. Sin esto, el siguiente play que intente conectarse por SSH podría fallar porque la VM aún no tiene la IP asignada.</div>
          </div>
        `,
      },
      {
        title: 'Snapshots, clones y gestión de estado en VMware',
        body: `
          <p>Ansible puede gestionar el ciclo de vida completo de VMs VMware: snapshots antes de updates, rollback en caso de error, apagado/encendido programado.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">vmware-lifecycle.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Gestión de ciclo de vida VMware
  hosts: localhost
  connection: local
  gather_facts: false
  vars:
    vcenter_common: &vcenter
      hostname: "{{ vcenter_hostname }}"
      username: "{{ vcenter_username }}"
      password: "{{ vcenter_password }}"
      validate_certs: false
      datacenter: "{{ datacenter_name }}"

  tasks:

    # Snapshot antes de una actualización mayor
    - name: Crear snapshot pre-update
      community.vmware.vmware_guest_snapshot:
        <<: *vcenter
        name: "{{ vm_name }}"
        state: present
        snapshot_name: "pre-update-{{ ansible_date_time.date }}"
        description: "Snapshot automático antes de actualización — Ansible"
        memory_dump: false

    # Ejecutar actualización (con otros módulos)
    - name: Simular actualización (aquí irían tus tasks)
      ansible.builtin.debug:
        msg: "Actualizando {{ vm_name }}..."

    # Revertir si algo salió mal (condicional)
    - name: Revertir snapshot si hubo error
      community.vmware.vmware_guest_snapshot:
        <<: *vcenter
        name: "{{ vm_name }}"
        state: revert
        snapshot_name: "pre-update-{{ ansible_date_time.date }}"
      when: update_failed | default(false)

    # Gestión de estado de energía
    - name: Apagar VM limpiamente
      community.vmware.vmware_guest_powerstate:
        <<: *vcenter
        name: "{{ vm_name }}"
        state: shutdown-guest    # graceful shutdown
        state_change_timeout: 120

    - name: Encender VM
      community.vmware.vmware_guest_powerstate:
        <<: *vcenter
        name: "{{ vm_name }}"
        state: powered-on

    # Eliminar snapshots viejos (limpieza)
    - name: Eliminar snapshots de más de 30 días
      community.vmware.vmware_guest_snapshot:
        <<: *vcenter
        name: "{{ vm_name }}"
        state: absent
        snapshot_name: "pre-update-{{ old_date }}"
      vars:
        old_date: "{{ (ansible_date_time.epoch | int - 2592000) | strftime('%Y-%m-%d') }}"</code></pre>
          </div>
          <div class="highlight-box">
            <p><strong>Patrón pre/post snapshot:</strong> creá siempre un snapshot antes de cambios mayores (updates de SO, migración de versiones). Ansible puede automatizar este patrón: snapshot → cambio → verificación → eliminar snapshot si OK / revertir si falla.</p>
          </div>
        `,
      },
      {
        title: 'Proxmox con community.general',
        body: `
          <p>Proxmox VE es una plataforma de virtualización open source muy popular en homelab y entornos empresariales sin licencia VMware. Ansible la gestiona con módulos de la colección <code>community.general</code>.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">setup-proxmox.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># community.general incluye los módulos de Proxmox
ansible-galaxy collection install community.general

# Dependencia Python para la API de Proxmox
pip install proxmoxer requests</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">proxmox-vm.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Gestión de VMs en Proxmox
  hosts: localhost
  connection: local
  gather_facts: false
  vars:
    proxmox_host: proxmox.homelab.local
    proxmox_user: root@pam
    proxmox_password: "{{ vault_proxmox_password }}"
    proxmox_node: pve

  tasks:

    # Crear VM nueva
    - name: Crear VM en Proxmox
      community.general.proxmox_kvm:
        api_host: "{{ proxmox_host }}"
        api_user: "{{ proxmox_user }}"
        api_password: "{{ proxmox_password }}"
        node: "{{ proxmox_node }}"
        vmid: 200
        name: "web-server-01"
        memory: 4096            # MB
        cores: 2
        sockets: 1
        net:
          net0: "virtio,bridge=vmbr0"
        scsi:
          scsi0: "local-lvm:32,format=raw"
        ide:
          ide2: "local:iso/ubuntu-22.04.iso,media=cdrom"
        boot: "order=scsi0;ide2"
        ostype: l26
        state: present

    # Clonar desde template
    - name: Clonar VM desde template cloud-init
      community.general.proxmox_kvm:
        api_host: "{{ proxmox_host }}"
        api_user: "{{ proxmox_user }}"
        api_password: "{{ proxmox_password }}"
        node: "{{ proxmox_node }}"
        newid: 201
        name: "web-server-02"
        clone: ubuntu-22-template    # nombre del template en Proxmox
        full: true                   # full clone (no linked)
        storage: local-lvm
        state: present
      register: clone_result

    # Configurar cloud-init en la VM clonada
    - name: Configurar cloud-init
      community.general.proxmox_kvm:
        api_host: "{{ proxmox_host }}"
        api_user: "{{ proxmox_user }}"
        api_password: "{{ proxmox_password }}"
        node: "{{ proxmox_node }}"
        vmid: 201
        ciuser: ubuntu
        cipassword: "{{ vault_vm_password }}"
        sshkeys: "{{ lookup('file', '~/.ssh/id_ed25519.pub') }}"
        ipconfig:
          ipconfig0: "ip=192.168.1.201/24,gw=192.168.1.1"
        nameservers:
          - 1.1.1.1
          - 8.8.8.8
        update: true              # actualizar la VM existente

    # Gestionar estado
    - name: Iniciar VM
      community.general.proxmox_kvm:
        api_host: "{{ proxmox_host }}"
        api_user: "{{ proxmox_user }}"
        api_password: "{{ proxmox_password }}"
        node: "{{ proxmox_node }}"
        vmid: 201
        state: started</code></pre>
          </div>
        `,
      },
      {
        title: 'Práctica: crear VM desde template en Proxmox',
        body: `
          <p>Un flujo completo de aprovisionamiento en Proxmox: clonar desde template, configurar con cloud-init, esperar SSH y configurar el servidor.</p>
          <div class="lab-box">
            <div class="lab-box-header">🧪 Laboratorio: VM desde template en Proxmox</div>
            <p><strong>Pre-requisito:</strong> tener un template de VM en Proxmox con cloud-init instalado (el template debe tener el paquete <code>cloud-init</code> instalado y la partición configurada).</p>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">lab-proxmox-full.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
# Play 1: Provisionar VM en Proxmox
- name: Provisionar VM desde template
  hosts: localhost
  connection: local
  gather_facts: false
  vars:
    pve_host: 192.168.1.10
    pve_user: root@pam
    pve_node: pve
    new_vmid: 300
    new_vm_name: lab-ansible-vm
    new_vm_ip: 192.168.1.100
    template_name: ubuntu-22-cloud-template

  tasks:

    - name: Clonar template
      community.general.proxmox_kvm:
        api_host: "{{ pve_host }}"
        api_user: "{{ pve_user }}"
        api_password: "{{ vault_pve_password }}"
        node: "{{ pve_node }}"
        newid: "{{ new_vmid }}"
        name: "{{ new_vm_name }}"
        clone: "{{ template_name }}"
        full: true
        storage: local-lvm
        state: present

    - name: Configurar cloud-init (IP, usuario, SSH key)
      community.general.proxmox_kvm:
        api_host: "{{ pve_host }}"
        api_user: "{{ pve_user }}"
        api_password: "{{ vault_pve_password }}"
        node: "{{ pve_node }}"
        vmid: "{{ new_vmid }}"
        ciuser: ubuntu
        sshkeys: "{{ lookup('file', '~/.ssh/id_ed25519.pub') }}"
        ipconfig:
          ipconfig0: "ip={{ new_vm_ip }}/24,gw=192.168.1.1"
        nameservers:
          - 1.1.1.1
        update: true

    - name: Iniciar la VM
      community.general.proxmox_kvm:
        api_host: "{{ pve_host }}"
        api_user: "{{ pve_user }}"
        api_password: "{{ vault_pve_password }}"
        node: "{{ pve_node }}"
        vmid: "{{ new_vmid }}"
        state: started

    - name: Esperar que SSH esté disponible
      ansible.builtin.wait_for:
        host: "{{ new_vm_ip }}"
        port: 22
        delay: 15
        timeout: 300
        state: started

    - name: Agregar VM al inventario en memoria
      ansible.builtin.add_host:
        name: "{{ new_vm_ip }}"
        groups: proxmox_new_vms
        ansible_user: ubuntu
        ansible_ssh_private_key_file: ~/.ssh/id_ed25519

# Play 2: Configurar la VM recién provisionada
- name: Configurar VM
  hosts: proxmox_new_vms
  gather_facts: true
  become: true

  tasks:

    - name: Actualizar sistema
      ansible.builtin.apt:
        upgrade: dist
        update_cache: true

    - name: Instalar paquetes base
      ansible.builtin.apt:
        name:
          - nginx
          - curl
          - htop
          - vim
        state: present

    - name: Habilitar nginx
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true

    - name: Verificar
      ansible.builtin.uri:
        url: "http://{{ ansible_host }}"
        status_code: 200
      delegate_to: localhost

    - name: Mostrar resultado
      ansible.builtin.debug:
        msg: "VM {{ inventory_hostname }} provisionada y configurada exitosamente"</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Preparar el template:</strong> para que cloud-init funcione en Proxmox, el template debe tener instalado el paquete <code>cloud-init</code> y agregar un disco <code>CloudInit Drive</code> en la configuración de hardware antes de convertirlo en template. Sin el drive cloud-init, las configuraciones de red y SSH key no se aplican al arrancar.</div>
          </div>
        `,
      },
    ],
    quiz: [
      {
        question:
          '¿Qué parámetro en vmware_guest garantiza que Ansible espere a que vSphere complete la personalización del SO antes de continuar?',
        options: [
          'wait_for_ip: true',
          'state: poweredon',
          'wait_for_customization: true',
          'customization_timeout: 300',
        ],
        correctIndex: 2,
        explanation:
          'El parámetro <code>wait_for_customization: true</code> hace que Ansible espere a que vSphere complete la personalización del SO (hostname, configuración de red, etc.) antes de devolver el control. Sin este parámetro, el siguiente task que intente conectarse por SSH podría fallar porque la VM todavía no tiene la IP asignada o el hostname configurado.',
      },
      {
        question:
          '¿Por qué es necesario instalar el paquete Python <code>proxmoxer</code> para usar los módulos de Proxmox en Ansible?',
        options: [
          'proxmoxer reemplaza a Python en la comunicación con Proxmox',
          'Es la librería que Ansible usa para autenticarse por SSH en el nodo Proxmox',
          'Es el SDK Python que los módulos community.general usan para comunicarse con la API REST de Proxmox',
          'proxmoxer gestiona el estado de las VMs en el archivo de inventario',
        ],
        correctIndex: 2,
        explanation:
          'Los módulos de Proxmox en <code>community.general</code> no se comunican con Proxmox por SSH — usan la API REST de Proxmox VE. <code>proxmoxer</code> es la librería Python que abstrae esa API REST. Sin ella instalada en el control node, Ansible no puede hablar con Proxmox y los módulos fallan con un ImportError.',
      },
      {
        question:
          '¿Cuál es el beneficio del patrón "snapshot pre-update + rollback automático" en VMware con Ansible?',
        options: [
          'Los snapshots mejoran el rendimiento de la VM durante la actualización',
          'Permite revertir la VM a su estado previo automáticamente si la actualización falla, sin intervención manual',
          'Los snapshots reemplazan la necesidad de backups regulares',
          'Ansible solo puede hacer rollback en entornos VMware, no en otros hipervisores',
        ],
        correctIndex: 1,
        explanation:
          'El patrón consiste en: crear snapshot → aplicar cambios → verificar resultado → si falla, revertir snapshot automáticamente con una tarea condicional (<code>when: update_failed</code>). Esto permite actualizaciones seguras con rollback automático sin intervención manual, algo que en entornos manuales requería disponibilidad del equipo de ops fuera del horario laboral.',
      },
    ],
    realWorldCase:
      'Un equipo de infraestructura usa Ansible para gestionar 200 VMs VMware: cada semana un playbook crea snapshots de todos los servidores, aplica patches de seguridad, verifica que los servicios responden y elimina los snapshots si todo está OK — o revierte automáticamente y crea un ticket en Jira si algo falla.',
    troubleshooting: [
      {
        error: 'ImportError: No module named "pyVmomi"',
        cause:
          'El paquete Python <code>pyVmomi</code> (SDK oficial de VMware para Python) no está instalado en el control node. Es la dependencia obligatoria de todos los módulos <code>community.vmware</code>.',
        fix: 'Instalá el paquete con <code>pip install pyVmomi</code> en el entorno Python que usa Ansible. Verificá el entorno correcto con <code>ansible --version | grep python</code>. Para algunas operaciones también necesitás <code>pip install PyVim</code>.',
      },
      {
        error: 'proxmoxer.backends.https.AuthenticationError: Couldn\'t authenticate user',
        cause:
          'Las credenciales de Proxmox son incorrectas o el usuario no tiene los permisos necesarios en Proxmox VE. El formato del usuario en Proxmox incluye el realm: <code>root@pam</code>, no solo <code>root</code>.',
        fix: 'Verificá que el usuario tiene el formato correcto con realm: <code>root@pam</code> para el usuario root, o <code>usuario@pve</code> para usuarios Proxmox nativos. Comprobá los permisos en Datacenter → Permissions en la UI de Proxmox. También podés crear un usuario dedicado para Ansible con los permisos mínimos necesarios (VM.Allocate, VM.Config.*, Pool.Allocate).',
      },
      {
        error: 'community.vmware.vmware_guest: [Errno 111] Connection refused a vcenter:443',
        cause:
          'Ansible no puede conectarse al servidor vCenter. Puede ser un problema de red, firewall, o que el hostname del vCenter no resuelve desde el control node.',
        fix: 'Verificá conectividad con <code>curl -k https://vcenter.empresa.local/sdk</code> desde el control node. Comprobá que el puerto 443 está abierto en el firewall entre el control node y el vCenter. Si el certificado SSL es autofirmado, usá <code>validate_certs: false</code> temporalmente para diagnóstico (habilitalo en producción con el cert correcto).',
      },
    ],
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
    levelId: 22,
    moduleId: 1,
    title: 'Hardening de Linux con Ansible',
    objective:
      'Aplicar endurecimiento de seguridad a servidores Linux de manera automatizada, reproducible y auditable usando Ansible, siguiendo los benchmarks CIS y mejores prácticas de la industria.',
    duration: '5–6 horas',
    objectives: [
      'Comprender por qué el hardening automatizado es superior al manual en entornos de producción',
      'Configurar SSH de forma segura bloqueando vectores de ataque comunes',
      'Gestionar firewalls (UFW y firewalld) y fail2ban desde playbooks Ansible',
      'Aplicar parámetros de kernel con sysctl para reducir la superficie de ataque de red',
    ],
    prerequisites: [
      'Completar todos los niveles 0–21 del curso',
      'Entender roles y colecciones de Ansible Galaxy (Nivel 14)',
      'Conocer el módulo ansible.builtin.template (Nivel 8)',
    ],
    steps: [
      {
        title: '¿Por qué hardening automatizado?',
        body: `
          <p>El hardening manual es lento, inconsistente y olvidado. Cuando configurás un servidor a mano, el siguiente servidor no queda idéntico. Con el tiempo, la <strong>configuration drift</strong> (deriva de configuración) convierte tu infraestructura en un campo minado de inconsistencias.</p>
          <div class="highlight-box">
            <p><strong>CIS Benchmarks</strong> son guías de seguridad publicadas por el Center for Internet Security, usadas por auditores de seguridad, organismos gubernamentales y empresas Fortune 500. Cubren más de 100 controles para Linux, SSH, kernels y más.</p>
          </div>
          <div class="analogy-box">
            <div class="analogy-box-header">💡 Analogía</div>
            <p>El hardening manual es como revisar si apagaste el gas en cada departamento de un edificio. El hardening con Ansible es instalar detectores de gas conectados a un panel central — una vez configurado, todos los departamentos están protegidos automáticamente y el estado es auditable.</p>
          </div>
          <p>Los tres pilares del hardening automatizado con Ansible:</p>
          <ul>
            <li><strong>Consistencia:</strong> todos los servidores tienen exactamente la misma configuración de seguridad</li>
            <li><strong>Trazabilidad:</strong> cada cambio queda en Git, asociado a un commit, autor y fecha</li>
            <li><strong>Reversibilidad:</strong> un playbook de rollback puede deshacer cualquier cambio en minutos</li>
          </ul>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Dato real:</strong> el 85% de los brechas de seguridad en infraestructura on-premise son causadas por configuraciones incorrectas o inconsistentes, no por exploits de día cero. El hardening automatizado ataca el problema raíz.</div>
          </div>
        `,
      },
      {
        title: 'Hardening SSH',
        body: `
          <p>SSH es la puerta principal a tus servidores. Una configuración insegura es equivalente a dejar la llave bajo el felpudo. Estos son los parámetros críticos para endurecer <code>/etc/ssh/sshd_config</code>:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/hardening/tasks/ssh.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Configurar parámetros seguros de SSH
  ansible.builtin.lineinfile:
    path: /etc/ssh/sshd_config
    regexp: "{{ item.regexp }}"
    line: "{{ item.line }}"
    state: present
    backup: true
  loop:
    - { regexp: '^#?PermitRootLogin', line: 'PermitRootLogin no' }
    - { regexp: '^#?PasswordAuthentication', line: 'PasswordAuthentication no' }
    - { regexp: '^#?MaxAuthTries', line: 'MaxAuthTries 3' }
    - { regexp: '^#?PubkeyAuthentication', line: 'PubkeyAuthentication yes' }
    - { regexp: '^#?X11Forwarding', line: 'X11Forwarding no' }
    - { regexp: '^#?AllowTcpForwarding', line: 'AllowTcpForwarding no' }
    - { regexp: '^#?ClientAliveInterval', line: 'ClientAliveInterval 300' }
    - { regexp: '^#?ClientAliveCountMax', line: 'ClientAliveCountMax 2' }
    - { regexp: '^#?LoginGraceTime', line: 'LoginGraceTime 30' }
    - { regexp: '^#?Protocol', line: 'Protocol 2' }
  notify: Reiniciar sshd

- name: Restringir acceso SSH a usuarios autorizados
  ansible.builtin.lineinfile:
    path: /etc/ssh/sshd_config
    regexp: '^#?AllowUsers'
    line: "AllowUsers {{ ssh_allowed_users | join(' ') }}"
    state: present
  notify: Reiniciar sshd

- name: Verificar que sshd_config es válido antes de reiniciar
  ansible.builtin.command: sshd -t
  changed_when: false</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Regla crítica:</strong> Nunca reiniciés sshd sin tener otra sesión SSH activa o acceso por consola. Si la nueva configuración tiene un error, podés quedar bloqueado fuera del servidor. El paso <code>sshd -t</code> valida la sintaxis antes de reiniciar.</div>
          </div>
          <p>En <code>group_vars/all.yml</code> definís los usuarios permitidos:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">group_vars/all.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">ssh_allowed_users:
  - deploy
  - ansible_svc
  - juan.garcia</code></pre>
          </div>
        `,
      },
      {
        title: 'Gestión de firewall: UFW y firewalld',
        body: `
          <p>Ansible puede gestionar ambos firewalls principales de Linux. La clave es detectar la distribución y usar el módulo correcto. Nunca mezclés UFW y firewalld en el mismo host.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/hardening/tasks/firewall.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
# === UFW para Debian/Ubuntu ===
- name: Instalar UFW
  ansible.builtin.apt:
    name: ufw
    state: present
  when: ansible_os_family == 'Debian'

- name: Política por defecto: denegar entrada, permitir salida
  community.general.ufw:
    direction: "{{ item.direction }}"
    policy: "{{ item.policy }}"
  loop:
    - { direction: incoming, policy: deny }
    - { direction: outgoing, policy: allow }
  when: ansible_os_family == 'Debian'

- name: Permitir servicios necesarios (Debian/Ubuntu)
  community.general.ufw:
    rule: allow
    port: "{{ item.port }}"
    proto: "{{ item.proto }}"
    comment: "{{ item.comment }}"
  loop:
    - { port: '22', proto: tcp, comment: 'SSH' }
    - { port: '80', proto: tcp, comment: 'HTTP' }
    - { port: '443', proto: tcp, comment: 'HTTPS' }
  when: ansible_os_family == 'Debian'

- name: Habilitar UFW
  community.general.ufw:
    state: enabled
  when: ansible_os_family == 'Debian'

# === firewalld para RHEL/CentOS ===
- name: Instalar firewalld
  ansible.builtin.dnf:
    name: firewalld
    state: present
  when: ansible_os_family == 'RedHat'

- name: Habilitar y arrancar firewalld
  ansible.builtin.service:
    name: firewalld
    state: started
    enabled: true
  when: ansible_os_family == 'RedHat'

- name: Configurar servicios permitidos (RHEL/CentOS)
  ansible.posix.firewalld:
    service: "{{ item }}"
    permanent: true
    state: enabled
    immediate: true
  loop:
    - ssh
    - http
    - https
  when: ansible_os_family == 'RedHat'</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Best practice:</strong> Usá la variable <code>ansible_os_family</code> para hacer tu playbook portable. <code>Debian</code> cubre Ubuntu, Debian y sus derivados. <code>RedHat</code> cubre RHEL, CentOS, Rocky Linux, AlmaLinux y Fedora.</div>
          </div>
        `,
      },
      {
        title: 'fail2ban: protección contra fuerza bruta',
        body: `
          <p>fail2ban monitorea logs del sistema y bloquea IPs que generan demasiados intentos fallidos de autenticación. Es la primera línea de defensa contra ataques de fuerza bruta SSH.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/hardening/tasks/fail2ban.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Instalar fail2ban
  ansible.builtin.package:
    name: fail2ban
    state: present

- name: Configurar jail local (sobreescribe defaults)
  ansible.builtin.template:
    src: jail.local.j2
    dest: /etc/fail2ban/jail.local
    owner: root
    group: root
    mode: '0644'
  notify: Reiniciar fail2ban

- name: Habilitar y arrancar fail2ban
  ansible.builtin.service:
    name: fail2ban
    state: started
    enabled: true</code></pre>
          </div>
          <p>La plantilla Jinja2 para la configuración de fail2ban:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">roles/hardening/templates/jail.local.j2</span></div>
            <pre class="language-ini"><code class="language-ini">[DEFAULT]
# Tiempo de baneo en segundos (1 hora)
bantime  = 3600
# Ventana de tiempo para contar intentos (10 minutos)
findtime = 600
# Máximo de intentos antes de banear
maxretry = {{ fail2ban_maxretry | default(5) }}
# Backend para monitorear logs (auto-detecta systemd)
backend  = auto

[sshd]
enabled  = true
port     = {{ ssh_port | default(22) }}
filter   = sshd
logpath  = %(sshd_log)s
maxretry = {{ fail2ban_ssh_maxretry | default(3) }}</code></pre>
          </div>
          <div class="highlight-box">
            <p><strong>Verificar IPs baneadas:</strong> podés ver las IPs baneadas en tiempo real con <code>ansible all -m command -a "fail2ban-client status sshd" -b</code></p>
          </div>
        `,
      },
      {
        title: 'Kernel security: parámetros sysctl',
        body: `
          <p>El kernel Linux expone cientos de parámetros de seguridad y red a través de <code>sysctl</code>. Algunos de ellos son críticos para prevenir ataques de red comunes: SYN floods, IP spoofing y redirecciones ICMP maliciosas.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/hardening/tasks/sysctl.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Aplicar parámetros sysctl de seguridad
  ansible.posix.sysctl:
    name: "{{ item.name }}"
    value: "{{ item.value }}"
    state: present
    reload: true
    sysctl_file: /etc/sysctl.d/99-hardening.conf
  loop:
    # Protección contra SYN flood
    - { name: net.ipv4.tcp_syncookies, value: '1' }
    - { name: net.ipv4.tcp_max_syn_backlog, value: '2048' }
    # Deshabilitar IP forwarding (no es un router)
    - { name: net.ipv4.ip_forward, value: '0' }
    - { name: net.ipv6.conf.all.forwarding, value: '0' }
    # Protección contra IP spoofing
    - { name: net.ipv4.conf.all.rp_filter, value: '1' }
    - { name: net.ipv4.conf.default.rp_filter, value: '1' }
    # Ignorar redirecciones ICMP
    - { name: net.ipv4.conf.all.accept_redirects, value: '0' }
    - { name: net.ipv6.conf.all.accept_redirects, value: '0' }
    - { name: net.ipv4.conf.all.send_redirects, value: '0' }
    # Ignorar broadcasts ICMP (amplification attacks)
    - { name: net.ipv4.icmp_echo_ignore_broadcasts, value: '1' }
    # Protección contra mensajes ICMP maliciosos
    - { name: net.ipv4.icmp_ignore_bogus_error_responses, value: '1' }
    # Log de paquetes con rutas imposibles
    - { name: net.ipv4.conf.all.log_martians, value: '1' }</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Nota importante:</strong> Si el servidor es un router o usa Docker/Kubernetes, <strong>no</strong> deshabilités <code>ip_forward</code>. Docker necesita este parámetro habilitado para el routing entre contenedores. Usá variables de grupo para diferenciar roles de servidor.</div>
          </div>
        `,
      },
      {
        title: 'Colección devsec.hardening de Galaxy',
        body: `
          <p>No necesitás escribir todo desde cero. La colección <code>devsec.hardening</code> de Ansible Galaxy implementa los benchmarks CIS completos y es mantenida activamente por la comunidad de seguridad.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">requirements.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
collections:
  - name: devsec.hardening
    version: ">=8.0.0"</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalación</span></div>
            <pre class="language-bash"><code class="language-bash">ansible-galaxy collection install -r requirements.yml</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">hardening.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Hardening CIS completo
  hosts: production
  become: true
  vars:
    # Variables del rol SSH
    ssh_permit_root_login: 'no'
    ssh_password_authentication: 'no'
    ssh_max_auth_tries: 3
    # Variables del rol OS
    os_auth_pam_passwdqc_enable: true
    os_security_suid_sgid_enforce: true
    # Usuarios a excluir del hardening de sudo
    sudo_include_run_sudo: false
  roles:
    - devsec.hardening.ssh_hardening
    - devsec.hardening.os_hardening</code></pre>
          </div>
          <div class="lab-box">
            <div class="lab-box-header">🧪 Laboratorio: Hardening con rollback</div>
            <p><strong>Objetivo:</strong> aplicar hardening y probar que funciona el rollback.</p>
            <ol>
              <li>Creá un snapshot del servidor antes: <code>ansible all -m setup -a "filter=ansible_hostname" -o</code></li>
              <li>Aplicá el hardening playbook en modo check primero: <code>ansible-playbook hardening.yml --check --diff</code></li>
              <li>Aplicá los cambios reales: <code>ansible-playbook hardening.yml</code></li>
              <li>Verificá SSH desde otra terminal antes de cerrar la sesión actual</li>
              <li>Creá un playbook <code>rollback.yml</code> que restaure <code>sshd_config</code> desde el backup creado por lineinfile (<code>.bak</code>)</li>
            </ol>
          </div>
          <div class="challenge-box">
            <div class="challenge-box-header">🏆 Desafío extra</div>
            <p>Agregá una tarea al final que ejecute <code>lynis audit system</code> (si está instalado) y guarde el reporte en <code>/var/log/lynis-audit-{{ ansible_date_time.date }}.log</code>. Lynis es la herramienta de auditoría de seguridad más usada en Linux.</p>
          </div>
        `,
      },
    ],
    quiz: [
      {
        question: '¿Cuál es el riesgo de reiniciar sshd inmediatamente después de cambiar sshd_config sin validar?',
        options: [
          'No hay riesgo, sshd siempre valida la config antes de reiniciar',
          'Podés quedar bloqueado fuera del servidor si la config tiene errores de sintaxis',
          'El servicio se reinicia pero ignora la nueva configuración',
          'Solo afecta a nuevas conexiones, las sesiones activas continúan normalmente',
        ],
        correctIndex: 1,
        explanation:
          'Si sshd_config tiene errores de sintaxis, el servicio no podrá arrancar después del reinicio. Las sesiones SSH activas pueden cerrarse y no podrás conectarte nuevamente. Por eso siempre se ejecuta `sshd -t` para validar la sintaxis antes de reiniciar, y se mantiene una sesión SSH abierta como respaldo durante el proceso.',
      },
      {
        question: '¿Qué parámetro sysctl previene los ataques SYN flood?',
        options: [
          'net.ipv4.ip_forward = 1',
          'net.ipv4.conf.all.rp_filter = 1',
          'net.ipv4.tcp_syncookies = 1',
          'net.ipv4.icmp_echo_ignore_broadcasts = 1',
        ],
        correctIndex: 2,
        explanation:
          'tcp_syncookies habilita los "SYN cookies", un mecanismo que permite al servidor validar conexiones TCP sin mantener estado durante el three-way handshake. Esto evita que un atacante llene la tabla de conexiones semí-abiertas con paquetes SYN falsos. rp_filter protege contra IP spoofing, e ip_forward es para routing.',
      },
      {
        question: '¿Cuál es la ventaja principal de usar `devsec.hardening` de Galaxy en lugar de escribir tu propio rol de hardening?',
        options: [
          'Es más rápido de ejecutar porque usa módulos compilados',
          'Implementa benchmarks CIS completos y es mantenido activamente por la comunidad de seguridad',
          'No requiere privilegios de root para ejecutarse',
          'Es compatible únicamente con Ubuntu LTS, que es el más seguro',
        ],
        correctIndex: 1,
        explanation:
          'devsec.hardening implementa los benchmarks CIS (Center for Internet Security) completos, que son el estándar de la industria para hardening de Linux. Está mantenido activamente, tiene tests automatizados y cubre cientos de controles de seguridad que serían difíciles de implementar y mantener de forma individual.',
      },
    ],
    realWorldCase:
      'Una empresa fintech con 200 servidores necesitaba pasar una auditoría PCI-DSS en 6 semanas. En lugar de contratar consultores externos para hardening manual (estimado: 3 meses), usaron Ansible con devsec.hardening para aplicar los controles CIS en todos los servidores en 2 días, con evidencia de cumplimiento generada automáticamente desde los logs de Ansible. Pasaron la auditoría.',
    troubleshooting: [
      {
        error: 'UNREACHABLE: Failed to connect to the host via ssh: Permission denied (publickey)',
        cause:
          'El hardening deshabilitó PasswordAuthentication antes de copiar las claves SSH a los hosts, o AllowUsers no incluye el usuario de Ansible.',
        fix: 'Verificá que el usuario de Ansible esté en ssh_allowed_users. Ejecutá primero el playbook de distribución de claves SSH antes del hardening. Si quedaste bloqueado, usá la consola del proveedor cloud (EC2 Instance Connect, Azure Serial Console) para restaurar /etc/ssh/sshd_config desde el backup .bak.',
      },
      {
        error: 'Tarea sysctl falla con "sysctl: setting key net.ipv4.ip_forward: Read-only file system"',
        cause:
          'El servidor corre dentro de un contenedor (Docker, LXC) donde el namespace de red es read-only y no permite modificar parámetros del kernel del host.',
        fix: 'Usá `when: ansible_virtualization_type not in ["docker", "lxc"]` para saltear tareas sysctl en contenedores. Los parámetros de kernel en contenedores se configuran desde el host, no desde dentro del contenedor.',
      },
      {
        error: 'UFW bloquea el propio Ansible después de habilitarse (conexiones SSH caen)',
        cause:
          'La regla para SSH (puerto 22) no se agregó antes de ejecutar `ufw: state: enabled`, o el puerto SSH fue cambiado y la regla no refleja el nuevo puerto.',
        fix: 'Siempre agregá la regla de SSH antes de habilitar UFW en el playbook. Usá la variable `ssh_port` para definir el puerto en un solo lugar. Verificá el orden de las tareas: primero reglas, después `state: enabled`. En producción, considerá usar `--check` antes de aplicar cambios de firewall.',
      },
    ],
  },

  {
    levelId: 22,
    moduleId: 2,
    title: 'Gestión de Certificados TLS con Ansible',
    objective:
      'Automatizar el ciclo de vida completo de certificados TLS — emisión, renovación y despliegue — usando Ansible, tanto con Let\'s Encrypt para dominios públicos como con OpenSSL para servicios internos.',
    duration: '4–5 horas',
    objectives: [
      'Emitir certificados Let\'s Encrypt con certbot de manera automatizada para múltiples dominios',
      'Configurar renovación automática de certificados antes de su vencimiento',
      'Generar y desplegar certificados auto-firmados para servicios internos con OpenSSL',
      'Monitorear fechas de vencimiento de certificados usando Ansible facts y assertions',
    ],
    prerequisites: [
      'Completar el Módulo 1 de Nivel 22 (Hardening de Linux)',
      'Conocer el módulo ansible.builtin.cron (Nivel 10)',
      'Entender handlers en Ansible (Nivel 7)',
    ],
    steps: [
      {
        title: '¿Por qué gestionar TLS con Ansible?',
        body: `
          <p>Un certificado TLS vencido es una de las causas más frecuentes de incidentes en producción. La mayoría de los equipos tienen entre 10 y 200 certificados distribuidos en múltiples servidores, y sin automatización, alguno inevitablemente vence en el peor momento posible.</p>
          <div class="highlight-box">
            <p><strong>Estadística real:</strong> El 60% de las organizaciones reportan al menos un incidente de producción causado por un certificado TLS vencido, según el Ponemon Institute. El costo promedio de un incidente por certificado vencido es de $15,000 USD en tiempo de ingenieros y pérdida de servicio.</p>
          </div>
          <div class="analogy-box">
            <div class="analogy-box-header">💡 Analogía</div>
            <p>Gestionar certificados TLS manualmente es como renovar el pasaporte de cada empleado de tu empresa a mano, uno por uno, recordando cada fecha de vencimiento en tu cabeza. Con Ansible es como tener un sistema de RRHH que avisa con 60 días de anticipación y puede iniciar el trámite solo.</p>
          </div>
          <p>Las ventajas concretas del enfoque con Ansible:</p>
          <ul>
            <li><strong>Renovación proactiva:</strong> certifica antes de que venza, no cuando ya venció</li>
            <li><strong>Multi-host:</strong> un playbook puede renovar y desplegar en 50 servidores simultáneamente</li>
            <li><strong>Consistencia:</strong> configuración idéntica de cipher suites y protocolos en todos los servidores</li>
            <li><strong>Auditoría:</strong> historial completo de qué certificado se instaló en qué servidor y cuándo</li>
          </ul>
        `,
      },
      {
        title: "Let's Encrypt con certbot: emisión inicial",
        body: `
          <p>Let's Encrypt ofrece certificados TLS gratuitos con validez de 90 días. Certbot es el cliente oficial para emitirlos y renovarlos automáticamente.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/tls/tasks/letsencrypt.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Instalar certbot (Ubuntu/Debian)
  ansible.builtin.apt:
    name:
      - certbot
      - python3-certbot-nginx
    state: present
    update_cache: true
  when: ansible_os_family == 'Debian'

- name: Instalar certbot (RHEL/CentOS via snapd)
  block:
    - ansible.builtin.dnf:
        name: snapd
        state: present
    - ansible.builtin.command: snap install --classic certbot
      args:
        creates: /usr/bin/certbot
    - ansible.builtin.file:
        src: /snap/bin/certbot
        dest: /usr/bin/certbot
        state: link
  when: ansible_os_family == 'RedHat'

- name: Emitir certificado para dominio simple
  ansible.builtin.command: >
    certbot certonly
    --nginx
    --non-interactive
    --agree-tos
    --email {{ letsencrypt_email }}
    --domains {{ item }}
    --deploy-hook "systemctl reload nginx"
  args:
    creates: "/etc/letsencrypt/live/{{ item }}/fullchain.pem"
  loop: "{{ tls_domains }}"
  when: not tls_wildcard | default(false)

- name: Emitir certificado wildcard (requiere DNS challenge)
  ansible.builtin.command: >
    certbot certonly
    --dns-cloudflare
    --dns-cloudflare-credentials /root/.cloudflare.ini
    --non-interactive
    --agree-tos
    --email {{ letsencrypt_email }}
    --domains "*.{{ tls_base_domain }},{{ tls_base_domain }}"
  args:
    creates: "/etc/letsencrypt/live/{{ tls_base_domain }}/fullchain.pem"
  when: tls_wildcard | default(false)</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Wildcard vs. single domain:</strong> Los certificados wildcard (<code>*.dominio.com</code>) cubren todos los subdominios pero requieren un DNS challenge (no puedes usarlos con el método HTTP). Para dominios simples, el método --nginx o --apache es más simple y no requiere acceso a tu DNS.</div>
          </div>
        `,
      },
      {
        title: 'Renovación automática con cron',
        body: `
          <p>Los certificados de Let's Encrypt vencen cada 90 días. Certbot recomienda intentar la renovación cada 12 horas — solo renueva si el certificado tiene menos de 30 días de vida restante.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/tls/tasks/renewal.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Configurar cron para renovación automática de certificados
  ansible.builtin.cron:
    name: "Renovación automática Let's Encrypt"
    minute: "0"
    hour: "3,15"
    job: "/usr/bin/certbot renew --quiet --deploy-hook 'systemctl reload nginx'"
    user: root
    state: present

- name: Verificar que la renovación funciona (dry-run)
  ansible.builtin.command: certbot renew --dry-run
  register: certbot_dryrun
  changed_when: false
  failed_when: certbot_dryrun.rc != 0

- name: Mostrar resultado del dry-run
  ansible.builtin.debug:
    msg: "{{ certbot_dryrun.stdout_lines }}"</code></pre>
          </div>
          <div class="highlight-box">
            <p><strong>¿Por qué 2 veces al día?</strong> Let's Encrypt puede tener outages temporales. Verificar a las 3:00 y 15:00 aumenta la probabilidad de que al menos uno de los intentos tenga éxito. El flag <code>--quiet</code> suprime la salida para que cron no envíe emails innecesarios.</p>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/tls/tasks/renewal.yml (continuación)</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Hook post-renovación personalizado
- name: Crear script de post-renovación
  ansible.builtin.template:
    src: post-renewal.sh.j2
    dest: /etc/letsencrypt/renewal-hooks/deploy/10-reload-services.sh
    mode: '0755'</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">roles/tls/templates/post-renewal.sh.j2</span></div>
            <pre class="language-bash"><code class="language-bash">#!/bin/bash
# Ejecutado por certbot después de cada renovación exitosa
{% for service in tls_reload_services | default(['nginx']) %}
systemctl reload {{ service }} && echo "$(date): {{ service }} recargado después de renovación TLS" >> /var/log/certbot-deploy.log
{% endfor %}</code></pre>
          </div>
        `,
      },
      {
        title: 'Certificados auto-firmados para servicios internos',
        body: `
          <p>Para servicios internos (APIs internas, servicios de monitoreo, bases de datos) que no son accesibles desde Internet, los certificados auto-firmados son la solución correcta. No necesitás una CA pública para cifrar tráfico interno.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/tls/tasks/self_signed.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Crear directorio para certificados internos
  ansible.builtin.file:
    path: /etc/ssl/internal
    state: directory
    owner: root
    group: root
    mode: '0755'

- name: Generar clave privada RSA 4096-bit
  community.crypto.openssl_privatekey:
    path: /etc/ssl/internal/{{ tls_service_name }}.key
    size: 4096
    type: RSA
    mode: '0600'

- name: Generar Certificate Signing Request (CSR)
  community.crypto.openssl_csr:
    path: /etc/ssl/internal/{{ tls_service_name }}.csr
    privatekey_path: /etc/ssl/internal/{{ tls_service_name }}.key
    common_name: "{{ tls_service_name }}.{{ internal_domain }}"
    organization_name: "{{ org_name }}"
    country_name: "{{ org_country | default('AR') }}"
    subject_alt_name:
      - "DNS:{{ tls_service_name }}.{{ internal_domain }}"
      - "DNS:localhost"
      - "IP:{{ ansible_default_ipv4.address }}"

- name: Generar certificado auto-firmado (validez 825 días)
  community.crypto.x509_certificate:
    path: /etc/ssl/internal/{{ tls_service_name }}.crt
    privatekey_path: /etc/ssl/internal/{{ tls_service_name }}.key
    csr_path: /etc/ssl/internal/{{ tls_service_name }}.csr
    provider: selfsigned
    selfsigned_not_after: "+825d"
    mode: '0644'</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Subject Alternative Names (SAN):</strong> Los navegadores modernos y clientes TLS rechazan certificados sin SAN, incluso si el CN es correcto. Siempre incluí SAN con el nombre DNS y la IP del servicio. El módulo <code>community.crypto.openssl_csr</code> lo hace fácil.</div>
          </div>
        `,
      },
      {
        title: 'Despliegue a nginx/apache con handlers',
        body: `
          <p>Instalar el certificado es solo la mitad del trabajo. El servidor web necesita recargarse para usar el nuevo certificado, y esto debe hacerse de manera graceful para no interrumpir conexiones activas.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/tls/tasks/deploy.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Configurar bloque SSL en nginx
  ansible.builtin.template:
    src: nginx-ssl.conf.j2
    dest: /etc/nginx/sites-available/{{ vhost_name }}-ssl.conf
    validate: nginx -t -c /dev/stdin < %s
  notify: Recargar nginx

- name: Habilitar sitio SSL
  ansible.builtin.file:
    src: /etc/nginx/sites-available/{{ vhost_name }}-ssl.conf
    dest: /etc/nginx/sites-enabled/{{ vhost_name }}-ssl.conf
    state: link
  notify: Recargar nginx</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">nginx</span><span class="code-block-filename">roles/tls/templates/nginx-ssl.conf.j2</span></div>
            <pre class="language-nginx"><code class="language-nginx">server {
    listen 443 ssl http2;
    server_name {{ vhost_name }};

    ssl_certificate     /etc/letsencrypt/live/{{ vhost_name }}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/{{ vhost_name }}/privkey.pem;

    # Configuración TLS moderna (Mozilla Intermediate compatibility)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # HSTS (186 días)
    add_header Strict-Transport-Security "max-age=15768000; includeSubDomains" always;

    root {{ webroot }};
    index index.html;
}

# Redirect HTTP a HTTPS
server {
    listen 80;
    server_name {{ vhost_name }};
    return 301 https://$host$request_uri;
}</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/tls/handlers/main.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Recargar nginx
  ansible.builtin.service:
    name: nginx
    state: reloaded  # reload, no restart — no interrumpe conexiones activas</code></pre>
          </div>
        `,
      },
      {
        title: 'Monitoreo de vencimiento con Ansible facts',
        body: `
          <p>El último eslabón de la cadena: saber cuándo van a vencer tus certificados <em>antes</em> de que venza. Ansible puede leer los metadatos del certificado y generar alertas proactivas.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbooks/check-tls-expiry.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Verificar vencimiento de certificados TLS
  hosts: webservers
  gather_facts: false
  tasks:
    - name: Leer información del certificado
      community.crypto.x509_certificate_info:
        path: /etc/letsencrypt/live/{{ item }}/fullchain.pem
      register: cert_info
      loop: "{{ tls_domains }}"

    - name: Calcular días hasta vencimiento
      ansible.builtin.set_fact:
        cert_expiry_days: >-
          {{
            (
              (cert_info.results[0].not_after | to_datetime('%Y%m%d%H%M%SZ')) -
              (ansible_date_time.iso8601 | to_datetime('%Y-%m-%dT%H:%M:%SZ'))
            ).days
          }}

    - name: Alertar si el certificado vence en menos de 30 días
      ansible.builtin.assert:
        that:
          - cert_expiry_days | int > 30
        fail_msg: >
          ⚠️ ALERTA: El certificado para {{ inventory_hostname }}
          vence en {{ cert_expiry_days }} días.
          Ejecutá: certbot renew --force-renewal
        success_msg: >
          ✅ Certificado OK: vence en {{ cert_expiry_days }} días.

    - name: Enviar alerta a Slack si queda poco tiempo
      community.general.slack:
        token: "{{ slack_token }}"
        channel: "#ops-alerts"
        msg: "🔴 Certificado TLS en {{ inventory_hostname }} vence en {{ cert_expiry_days }} días"
      when: cert_expiry_days | int < 30
      delegate_to: localhost</code></pre>
          </div>
          <div class="lab-box">
            <div class="lab-box-header">🧪 Laboratorio: Pipeline TLS completo</div>
            <p>Creá un rol <code>tls_manager</code> que encadene todos los pasos: instalación de certbot → emisión → cron de renovación → despliegue a nginx → verificación de vencimiento. Ejecutalo contra un servidor de staging y verificá que nginx sirve HTTPS con el certificado correcto usando <code>openssl s_client -connect dominio:443</code>.</p>
          </div>
        `,
      },
    ],
    quiz: [
      {
        question: '¿Por qué se usa `state: reloaded` en lugar de `state: restarted` para nginx después de instalar un certificado?',
        options: [
          'Porque reloaded es más rápido que restarted',
          'Porque reloaded aplica la nueva configuración sin cerrar las conexiones TCP activas',
          'Porque restarted no funciona con certificados TLS',
          'Porque reloaded valida la sintaxis de nginx antes de aplicar cambios',
        ],
        correctIndex: 1,
        explanation:
          'nginx reload (SIGHUP) recarga la configuración sin cerrar el proceso master ni las conexiones existentes. Los workers actuales terminan de servir sus requests en curso, mientras nuevos workers con la nueva configuración atienden las nuevas conexiones. Un restart cierra todo y abre de nuevo, causando una interrupción del servicio de varios segundos.',
      },
      {
        question: '¿Qué challenge debe usarse para emitir un certificado wildcard (*.dominio.com) con Let\'s Encrypt?',
        options: [
          'HTTP-01 challenge (acceso por puerto 80)',
          'TLS-ALPN-01 challenge (acceso por puerto 443)',
          'DNS-01 challenge (crear registro TXT en el DNS)',
          'Email challenge (verificación por correo)',
        ],
        correctIndex: 2,
        explanation:
          "Let's Encrypt solo permite emitir certificados wildcard usando el DNS-01 challenge. Esto requiere que crees un registro TXT en tu DNS (ej: _acme-challenge.dominio.com). Los challenges HTTP-01 y TLS-ALPN-01 no están disponibles para wildcards porque no pueden probar control sobre todos los subdominios.",
      },
      {
        question: '¿Cuál es el propósito de incluir Subject Alternative Names (SAN) en un certificado auto-firmado interno?',
        options: [
          'Para hacer el certificado más seguro con criptografía adicional',
          'Para que el certificado pueda ser firmado por múltiples CAs',
          'Porque los clientes TLS modernos rechazan certificados sin SAN, incluso si el CN es correcto',
          'Para reducir el tiempo de validación del certificado',
        ],
        correctIndex: 2,
        explanation:
          'Desde Chrome 58 (2017) y otros navegadores/clientes modernos, el campo Common Name (CN) es ignorado para la validación del hostname. Solo se usan los Subject Alternative Names. Si tu certificado no tiene SAN, recibirás un error de "nombre no coincide" aunque el CN sea correcto. El módulo community.crypto.openssl_csr facilita agregar SANs.',
      },
    ],
    realWorldCase:
      'Un banco regional con 47 certificados TLS distribuidos en servicios internos y externos sufrió un incidente de 4 horas cuando vencieron 3 certificados el mismo día. Implementaron Ansible para gestionar todo el ciclo de vida TLS: el playbook de monitoreo corre diariamente y envía alertas a Slack con 60 días de anticipación. En 18 meses sin el sistema, tuvieron 3 incidentes. En los 18 meses siguientes con Ansible, tuvieron cero.',
    troubleshooting: [
      {
        error: 'certbot: error: Problem binding to port 80: Could not bind to IPv4 or IPv6',
        cause:
          'nginx (u otro servicio) ya está usando el puerto 80 cuando certbot intenta levantar su propio servidor temporal para el HTTP-01 challenge con el método --standalone.',
        fix: 'Usá `--nginx` o `--apache` en lugar de `--standalone`. Estos plugins aprovechan el servidor web existente para responder el challenge sin ocupar el puerto. Si necesitás standalone, primero parás nginx con un pre-hook: `certbot certonly --standalone --pre-hook "systemctl stop nginx" --post-hook "systemctl start nginx"`.',
      },
      {
        error: 'community.crypto.x509_certificate falla: "privatekey_path not found"',
        cause:
          'Las tareas de generación de clave y CSR no corrieron antes de la tarea del certificado, o la clave se generó en un directorio diferente al esperado.',
        fix: 'Verificá el orden de las tareas en el rol: primero openssl_privatekey, luego openssl_csr, finalmente x509_certificate. Asegurate de que todos usen el mismo path para la clave privada. Usá `ansible.builtin.stat` para verificar que el archivo de clave existe antes de intentar crear el CSR.',
      },
      {
        error: 'nginx -t falla con "SSL_CTX_use_PrivateKey_file failed" después de renovación',
        cause:
          'Los permisos del archivo de clave privada no permiten que nginx los lea, o el deploy-hook de certbot no se ejecutó correctamente y nginx todavía referencia el certificado anterior.',
        fix: 'Verificá que /etc/letsencrypt/live/ y /etc/letsencrypt/archive/ sean legibles por el usuario con el que corre nginx (normalmente www-data o nginx). Añadí el usuario al grupo de letsencrypt: `usermod -aG ssl-cert www-data`. Verificá los logs de certbot en /var/log/letsencrypt/letsencrypt.log para confirmar que el deploy-hook se ejecutó.',
      },
    ],
  },

  {
    levelId: 22,
    moduleId: 3,
    title: 'Integración con DevOps y Pipelines CI/CD',
    objective:
      'Integrar Ansible en flujos de trabajo DevOps modernos: GitOps, pipelines CI/CD, despliegue de herramientas de observabilidad y automatización de runbooks operacionales.',
    duration: '5–6 horas',
    objectives: [
      'Posicionar Ansible correctamente dentro del ciclo DevOps (dónde sí y dónde no usarlo)',
      'Implementar GitOps con Ansible: cambios de infraestructura mediante Pull Requests',
      'Integrar playbooks en pipelines de GitHub Actions y GitLab CI',
      'Automatizar notificaciones a Slack/Teams y runbooks operacionales',
    ],
    prerequisites: [
      'Completar el Módulo 2 de Nivel 22 (Gestión de Certificados TLS)',
      'Conocer Ansible Vault para secretos (Nivel 16)',
      'Entender roles y colecciones (Nivel 14)',
    ],
    steps: [
      {
        title: 'Ansible en el bucle DevOps: ¿dónde encaja?',
        body: `
          <p>DevOps no es una herramienta — es una cultura y un conjunto de prácticas. Ansible es una de las piezas del puzzle, pero no todas las piezas. Entender dónde encaja evita el error de usarlo para todo.</p>
          <div class="highlight-box">
            <p><strong>Ansible brilla en:</strong> provisioning de servidores, gestión de configuración, despliegue de aplicaciones a servidores, tareas operacionales (backups, rotación de logs, parches). <strong>No es la herramienta ideal para:</strong> orquestación de contenedores (Kubernetes hace eso mejor), pipelines de build (Jenkins/GitHub Actions), o gestión de estado de infraestructura compleja (Terraform).</p>
          </div>
          <p>El bucle DevOps típico con Ansible integrado:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">text</span><span class="code-block-filename">devops-loop.txt</span></div>
            <pre class="language-text"><code class="language-text">┌─────────────────────────────────────────────────────────┐
│                    BUCLE DEVOPS                          │
│                                                         │
│  Plan → Code → Build → Test → Release → Deploy → Operate│
│                                    ↑            ↑       │
│                              Terraform      ANSIBLE     │
│                              (infra)     (config+app)   │
└─────────────────────────────────────────────────────────┘</code></pre>
          </div>
          <div class="analogy-box">
            <div class="analogy-box-header">💡 Analogía</div>
            <p>Terraform construye el edificio (servidores, redes, base de datos en la nube). Ansible lo amuebla y mantiene (configuración, software, actualizaciones). Docker/Kubernetes gestiona los residentes (contenedores). Son complementarios, no sustitutos.</p>
          </div>
        `,
      },
      {
        title: 'GitOps con Ansible: infraestructura como Pull Requests',
        body: `
          <p>GitOps aplica los principios de desarrollo de software (revisión de código, pull requests, CI/CD) a la gestión de infraestructura. Con Ansible y GitOps, ningún cambio de infraestructura sucede sin pasar por Git.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">text</span><span class="code-block-filename">gitops-flow.txt</span></div>
            <pre class="language-text"><code class="language-text">Ingeniero → PR en GitHub → Review del equipo → Merge a main
                                                      ↓
                                           GitHub Actions trigger
                                                      ↓
                                    ansible-playbook en pipeline CI/CD
                                                      ↓
                                           Cambio aplicado en producción
                                                      ↓
                                           Notificación a Slack</code></pre>
          </div>
          <p>Estructura de repositorio GitOps recomendada:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">text</span><span class="code-block-filename">estructura-gitops.txt</span></div>
            <pre class="language-text"><code class="language-text">infrastructure/
├── inventories/
│   ├── production/
│   │   ├── hosts.yml
│   │   └── group_vars/
│   └── staging/
│       ├── hosts.yml
│       └── group_vars/
├── roles/
│   ├── webserver/
│   ├── database/
│   └── monitoring/
├── playbooks/
│   ├── deploy-app.yml
│   ├── configure-servers.yml
│   └── maintenance.yml
├── .github/
│   └── workflows/
│       ├── lint.yml          ← ansible-lint en PR
│       └── deploy.yml        ← ansible-playbook en merge
└── ansible.cfg</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Protección de rama main:</strong> Configurá branch protection rules en GitHub para requerir al menos un reviewer y que el CI (ansible-lint) pase antes de poder hacer merge. Esto garantiza que ningún playbook con errores de sintaxis o estilo llegue a producción.</div>
          </div>
        `,
      },
      {
        title: 'Despliegue de Prometheus y node_exporter',
        body: `
          <p>Prometheus es el estándar de facto para monitoreo de infraestructura. node_exporter expone métricas del sistema operativo que Prometheus recolecta. Ansible puede desplegar ambos de manera idempotente.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/node_exporter/tasks/main.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Crear usuario para node_exporter (sin shell)
  ansible.builtin.user:
    name: node_exporter
    system: true
    shell: /sbin/nologin
    create_home: false

- name: Descargar node_exporter
  ansible.builtin.get_url:
    url: "https://github.com/prometheus/node_exporter/releases/download/v{{ node_exporter_version }}/node_exporter-{{ node_exporter_version }}.linux-amd64.tar.gz"
    dest: /tmp/node_exporter.tar.gz
    checksum: "sha256:{{ node_exporter_checksum }}"

- name: Extraer node_exporter
  ansible.builtin.unarchive:
    src: /tmp/node_exporter.tar.gz
    dest: /tmp/
    remote_src: true

- name: Instalar binario de node_exporter
  ansible.builtin.copy:
    src: "/tmp/node_exporter-{{ node_exporter_version }}.linux-amd64/node_exporter"
    dest: /usr/local/bin/node_exporter
    owner: node_exporter
    group: node_exporter
    mode: '0755'
    remote_src: true
  notify: Reiniciar node_exporter

- name: Crear servicio systemd para node_exporter
  ansible.builtin.template:
    src: node_exporter.service.j2
    dest: /etc/systemd/system/node_exporter.service
  notify:
    - Recargar systemd
    - Reiniciar node_exporter

- name: Habilitar y arrancar node_exporter
  ansible.builtin.service:
    name: node_exporter
    state: started
    enabled: true</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">roles/node_exporter/templates/node_exporter.service.j2</span></div>
            <pre class="language-ini"><code class="language-ini">[Unit]
Description=Prometheus Node Exporter
After=network.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter \
  --web.listen-address=:{{ node_exporter_port | default(9100) }} \
  --collector.systemd \
  --collector.processes

[Install]
WantedBy=multi-user.target</code></pre>
          </div>
        `,
      },
      {
        title: 'Notificaciones a Slack desde Ansible',
        body: `
          <p>Ansible puede enviar notificaciones a Slack durante la ejecución de playbooks. Esto convierte tus deploys en eventos visibles para todo el equipo, sin necesidad de que nadie mire los logs.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbooks/deploy-app.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Desplegar aplicación con notificaciones
  hosts: webservers
  vars:
    app_version: "{{ lookup('env', 'APP_VERSION') }}"
    deployer: "{{ lookup('env', 'GITHUB_ACTOR') | default('manual') }}"
  tasks:
    - name: Notificar inicio de deploy a Slack
      community.general.slack:
        token: "{{ slack_token }}"
        channel: "#deployments"
        color: "warning"
        msg: |
          🚀 *Deploy iniciado*
          • Versión: \`{{ app_version }}\`
          • Ambiente: \`{{ inventory_hostname }}\`
          • Iniciado por: \`{{ deployer }}\`
        attachments:
          - title: "Detalles"
            text: "El deploy está en curso. Próxima actualización en ~5 minutos."
      delegate_to: localhost
      run_once: true

    - name: Desplegar la aplicación
      # ... tareas de deploy ...

    - name: Verificar health check
      ansible.builtin.uri:
        url: "http://{{ ansible_host }}/health"
        status_code: 200
      register: health_check
      retries: 5
      delay: 10
      until: health_check.status == 200

    - name: Notificar éxito a Slack
      community.general.slack:
        token: "{{ slack_token }}"
        channel: "#deployments"
        color: "good"
        msg: |
          ✅ *Deploy completado exitosamente*
          • Versión: \`{{ app_version }}\`
          • Tiempo total: \`{{ ansible_play_duration | default('N/A') }}\`
      delegate_to: localhost
      run_once: true

  rescue:
    - name: Notificar fallo a Slack
      community.general.slack:
        token: "{{ slack_token }}"
        channel: "#deployments"
        color: "danger"
        msg: |
          🔴 *Deploy FALLIDO*
          • Versión: \`{{ app_version }}\`
          • Tarea fallida: \`{{ ansible_failed_task.name }}\`
          • Error: \`{{ ansible_failed_result.msg }}\`
      delegate_to: localhost
      run_once: true</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Secretos en CI/CD:</strong> el <code>slack_token</code> nunca debe estar en el repositorio. Guardalo en GitHub Secrets (o GitLab CI Variables) y referencialos en el pipeline como variables de entorno. En el playbook, usás <code>lookup('env', 'SLACK_TOKEN')</code> o lo pasás como extra-var encriptada con Vault.</div>
          </div>
        `,
      },
      {
        title: 'Triggers desde GitHub Actions y GitLab CI',
        body: `
          <p>La integración real de Ansible con CI/CD significa que tu pipeline dispara los playbooks automáticamente cuando hay un merge a main. Sin intervención humana, sin "acordarse de correr el playbook".</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/deploy.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">name: Deploy con Ansible

on:
  push:
    branches: [main]
    paths:
      - 'playbooks/**'
      - 'roles/**'
      - 'inventories/**'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Instalar ansible-lint
        run: pip install ansible-lint
      - name: Ejecutar lint
        run: ansible-lint playbooks/

  deploy:
    needs: lint
    runs-on: ubuntu-latest
    environment: production  # requiere aprovación manual en GitHub
    steps:
      - uses: actions/checkout@v4

      - name: Instalar Ansible
        run: |
          pip install ansible
          ansible-galaxy collection install -r requirements.yml

      - name: Configurar clave SSH
        run: |
          mkdir -p ~/.ssh
          echo "${'$'}{{ secrets.ANSIBLE_SSH_KEY }}" > ~/.ssh/ansible
          chmod 600 ~/.ssh/ansible

      - name: Crear archivo de vault password
        run: echo "${'$'}{{ secrets.ANSIBLE_VAULT_PASSWORD }}" > /tmp/.vault_pass

      - name: Ejecutar playbook de deploy
        run: |
          ansible-playbook \
            -i inventories/production/ \
            --private-key ~/.ssh/ansible \
            --vault-password-file /tmp/.vault_pass \
            -e "app_version=${'$'}{{ github.sha }}" \
            playbooks/deploy-app.yml

      - name: Limpiar secretos
        if: always()
        run: |
          rm -f ~/.ssh/ansible /tmp/.vault_pass</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>paths filter:</strong> El trigger <code>paths</code> evita que el deploy se dispare cuando solo cambia documentación o el README. Solo hace deploy cuando cambian archivos relevantes de Ansible. Ahorrás tiempo de pipeline y reduces el riesgo de deploys accidentales.</div>
          </div>
        `,
      },
      {
        title: 'Runbook automation: procedimientos manuales → playbooks',
        body: `
          <p>Un runbook es un documento que describe cómo responder a un incidente o hacer un procedimiento operacional. La mayoría de los equipos tienen runbooks en Confluence o Notion que nadie sigue exactamente. Ansible convierte esos runbooks en código ejecutable y reproducible.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbooks/runbook-db-backup.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
# Runbook: Backup de base de datos antes de deploy mayor
# Equivalente manual: 45 minutos. Con Ansible: 8 minutos.
- name: "[RUNBOOK] Backup pre-deploy de PostgreSQL"
  hosts: databases
  become: true
  vars:
    backup_dir: /var/backups/postgresql
    backup_date: "{{ ansible_date_time.date }}-{{ ansible_date_time.hour }}{{ ansible_date_time.minute }}"
  tasks:
    - name: Verificar espacio disponible en disco
      ansible.builtin.assert:
        that:
          - (ansible_mounts | selectattr('mount', 'equalto', '/var') | list | first).size_available > 10737418240
        fail_msg: "ABORTAR: Menos de 10GB disponibles en /var. Liberar espacio antes de continuar."

    - name: Crear directorio de backup
      ansible.builtin.file:
        path: "{{ backup_dir }}/{{ backup_date }}"
        state: directory
        owner: postgres
        mode: '0700'

    - name: Ejecutar pg_dump para cada base de datos
      ansible.builtin.command: >
        pg_dump
        --format=custom
        --compress=9
        --file={{ backup_dir }}/{{ backup_date }}/{{ item }}.dump
        {{ item }}
      become_user: postgres
      loop: "{{ postgresql_databases }}"
      register: backup_result

    - name: Verificar integridad de backups
      ansible.builtin.command: >
        pg_restore --list {{ backup_dir }}/{{ backup_date }}/{{ item }}.dump
      become_user: postgres
      loop: "{{ postgresql_databases }}"
      changed_when: false

    - name: Registrar backup en inventario de backups
      ansible.builtin.lineinfile:
        path: /var/log/backup-inventory.log
        line: "{{ backup_date }} | {{ inventory_hostname }} | {{ postgresql_databases | join(',') }} | OK"
        create: true</code></pre>
          </div>
          <div class="challenge-box">
            <div class="challenge-box-header">🏆 Desafío: Convertir tu runbook</div>
            <p>Tomá el procedimiento más repetitivo de tu equipo (rotación de logs, limpieza de sesiones, restart de servicios en orden) y convertilo en un playbook Ansible. Medí el tiempo manual vs. el tiempo automatizado y documentá el ahorro en el README del playbook.</p>
          </div>
        `,
      },
    ],
    quiz: [
      {
        question: '¿Cuál es el propósito del filtro `paths` en el trigger de GitHub Actions?',
        options: [
          'Limitar el deploy a ciertos servidores del inventario',
          'Evitar que el pipeline se dispare cuando solo cambian archivos irrelevantes (docs, README)',
          'Filtrar los hosts de Ansible por directorio',
          'Restringir qué usuarios pueden hacer push al repositorio',
        ],
        correctIndex: 1,
        explanation:
          'El filtro `paths` en GitHub Actions hace que el workflow solo se dispare cuando cambian archivos en los paths especificados. Sin este filtro, un cambio en el README dispararía un deploy completo, desperdiciando tiempo de pipeline y creando riesgo innecesario. Con el filtro, solo los cambios en playbooks, roles e inventarios disparan el deploy.',
      },
      {
        question: '¿Por qué se usa `delegate_to: localhost` y `run_once: true` en las notificaciones de Slack?',
        options: [
          'Porque Slack solo acepta conexiones desde localhost',
          'Para que Ansible se conecte a Slack directamente desde el nodo controlador, no desde cada host remoto',
          'Para que la notificación use el inventario local en lugar del remoto',
          'Porque el módulo community.general.slack no funciona en hosts remotos',
        ],
        correctIndex: 1,
        explanation:
          'delegate_to: localhost hace que la tarea se ejecute en el nodo controlador (tu máquina o el runner de CI) en lugar de en cada host remoto. run_once: true asegura que la notificación se envíe solo una vez, no una vez por cada host del inventario. Sin estos modificadores, recibirías una notificación de Slack por cada servidor en el playbook.',
      },
      {
        question: '¿Qué ventaja principal tiene convertir un runbook manual en un playbook Ansible?',
        options: [
          'Los playbooks son más fáciles de leer que los documentos en Confluence',
          'Ansible ejecuta más rápido que un humano siguiendo instrucciones',
          'El procedimiento se vuelve reproducible, auditable y no puede ser ejecutado incorrectamente por error humano',
          'Los playbooks se pueden ejecutar sin acceso SSH al servidor',
        ],
        correctIndex: 2,
        explanation:
          'La ventaja principal no es la velocidad sino la reproducibilidad y eliminación del error humano. Un runbook manual puede seguirse incorrectamente, saltarse pasos o interpretarse diferente por cada persona. Un playbook Ansible siempre ejecuta exactamente los mismos pasos en el mismo orden, con la misma configuración, y genera un log completo de lo que hizo y cuándo.',
      },
    ],
    realWorldCase:
      'Un equipo de SRE en una startup de e-commerce tenía 47 runbooks documentados en Confluence. Cada incidente requería seguirlos manualmente, lo que tomaba entre 20 y 90 minutos. Convirtieron los 12 más frecuentes en playbooks Ansible disparados desde Slack con un bot (usando slash commands). El tiempo de respuesta a incidentes bajó de 45 minutos promedio a 8 minutos, y los errores de procedimiento desaparecieron completamente.',
    troubleshooting: [
      {
        error: 'community.general.slack falla con "token invalid" aunque el token es correcto',
        cause:
          'El token de Slack cambió de formato: las versiones modernas usan tokens de Bot (xoxb-) mientras que los tokens legacy de Webhook tienen formato diferente. La colección community.general espera el formato correcto según la versión.',
        fix: 'Verificá el tipo de token: para Slack Apps modernas usá un Bot User OAuth Token (xoxb-). Para webhooks entrantes simples, usá el módulo community.general.slack con el parámetro `webhook` en lugar de `token`. Actualizá la colección: `ansible-galaxy collection install community.general --upgrade`.',
      },
      {
        error: 'GitHub Actions falla con "WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED" durante ansible-playbook',
        cause:
          'La clave SSH del host remoto cambió (típicamente después de recrear un servidor) y el archivo known_hosts en el runner de GitHub Actions tiene la clave anterior.',
        fix: 'Agregá `-o StrictHostKeyChecking=no` como variable de entorno ANSIBLE_SSH_EXTRA_ARGS en el workflow, o mejor: regenerá el known_hosts del runner después de recrear servidores. Para producción, usá `ansible_ssh_extra_args: "-o StrictHostKeyChecking=accept-new"` en el inventario, que acepta nuevas claves pero rechaza cambios sospechosos.',
      },
      {
        error: 'El playbook de CI/CD falla con "Vault password required" aunque se configuró --vault-password-file',
        cause:
          'El archivo de vault password se creó con un salto de línea al final (el comportamiento por defecto de echo en bash), o el path al archivo tiene espacios o caracteres especiales.',
        fix: 'Usá `printf` en lugar de `echo` para evitar el salto de línea: `printf "%s" "${{ secrets.ANSIBLE_VAULT_PASSWORD }}" > /tmp/.vault_pass`. Verificá que el path no tenga espacios. Alternativa: pasá la contraseña directamente con `--vault-password-file <(echo -n "$VAULT_PASS")` usando process substitution.',
      },
    ],
  },

  {
    levelId: 22,
    moduleId: 4,
    title: 'Observabilidad y Logging con Ansible',
    objective:
      'Desplegar y configurar un stack completo de observabilidad (métricas, logs, alertas) usando Ansible, incluyendo Prometheus, Grafana, Loki y Alertmanager, con integración de callback plugins para métricas de los propios playbooks.',
    duration: '5–6 horas',
    objectives: [
      'Desplegar el stack Prometheus completo (prometheus, node_exporter, alertmanager) con Ansible',
      'Instalar y configurar Grafana con dashboards provisionados automáticamente',
      'Implementar logging centralizado con Loki y Promtail mediante Ansible',
      'Configurar reglas de alerting en Alertmanager usando templates Jinja2',
    ],
    prerequisites: [
      'Completar el Módulo 3 de Nivel 22 (Integración con DevOps)',
      'Conocer ansible.builtin.template y Jinja2 avanzado (Nivel 8)',
      'Entender el módulo ansible.builtin.uri para health checks',
    ],
    steps: [
      {
        title: '¿Por qué observabilidad como código?',
        body: `
          <p>Observabilidad significa poder responder la pregunta "¿qué está pasando en mi sistema?" sin necesidad de adivinar. Los tres pilares son: <strong>métricas</strong> (números que cambian en el tiempo), <strong>logs</strong> (eventos con contexto) y <strong>trazas</strong> (recorrido de un request a través del sistema).</p>
          <div class="highlight-box">
            <p><strong>El problema sin Ansible:</strong> configurás Grafana a mano, creás dashboards, definís reglas de alerting. Un mes después alguien modifica una regla "para probar" y no la restaura. Tres meses después el servidor de monitoreo falla y nadie recuerda cómo estaba configurado. Con Ansible, toda esa configuración vive en Git.</p>
          </div>
          <div class="analogy-box">
            <div class="analogy-box-header">💡 Analogía</div>
            <p>La observabilidad manual es como intentar diagnosticar una enfermedad mirando al paciente sin instrumentos. Observabilidad como código con Ansible es como tener un hospital completamente instrumentado que se auto-configura: cada sala tiene los monitores correctos, las alarmas correctas y todos los médicos saben interpretarlos porque el sistema fue diseñado consistentemente.</p>
          </div>
          <p>Ventajas concretas de gestionar observabilidad con Ansible:</p>
          <ul>
            <li><strong>Recuperación rápida:</strong> si el servidor de monitoreo falla, lo reconstruís en 10 minutos</li>
            <li><strong>Consistencia:</strong> todos los ambientes (staging, producción) tienen el mismo stack de monitoreo</li>
            <li><strong>Revisión de cambios:</strong> las modificaciones a alertas pasan por code review como cualquier otro cambio</li>
            <li><strong>Documentación implícita:</strong> el playbook es la documentación de cómo está configurado el sistema</li>
          </ul>
        `,
      },
      {
        title: 'Despliegue del stack Prometheus',
        body: `
          <p>Prometheus es el motor de métricas. Scraping periódico de endpoints /metrics, almacenamiento local en time-series, PromQL para consultas. Ansible puede desplegarlo con configuración dinámica generada desde el inventario.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/prometheus/tasks/main.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Crear usuario prometheus
  ansible.builtin.user:
    name: prometheus
    system: true
    shell: /sbin/nologin
    home: /var/lib/prometheus
    create_home: false

- name: Crear directorios de prometheus
  ansible.builtin.file:
    path: "{{ item }}"
    state: directory
    owner: prometheus
    group: prometheus
    mode: '0755'
  loop:
    - /etc/prometheus
    - /var/lib/prometheus
    - /etc/prometheus/rules.d
    - /etc/prometheus/targets.d

- name: Descargar y extraer prometheus
  ansible.builtin.unarchive:
    src: "https://github.com/prometheus/prometheus/releases/download/v{{ prometheus_version }}/prometheus-{{ prometheus_version }}.linux-amd64.tar.gz"
    dest: /tmp/
    remote_src: true

- name: Instalar binarios de prometheus
  ansible.builtin.copy:
    src: "/tmp/prometheus-{{ prometheus_version }}.linux-amd64/{{ item }}"
    dest: "/usr/local/bin/{{ item }}"
    owner: prometheus
    group: prometheus
    mode: '0755'
    remote_src: true
  loop:
    - prometheus
    - promtool
  notify: Reiniciar prometheus

- name: Generar prometheus.yml desde inventario
  ansible.builtin.template:
    src: prometheus.yml.j2
    dest: /etc/prometheus/prometheus.yml
    owner: prometheus
    group: prometheus
    mode: '0644'
    validate: /usr/local/bin/promtool check config %s
  notify: Reiniciar prometheus

- name: Crear servicio systemd
  ansible.builtin.template:
    src: prometheus.service.j2
    dest: /etc/systemd/system/prometheus.service
  notify:
    - Recargar systemd
    - Reiniciar prometheus

- name: Habilitar y arrancar prometheus
  ansible.builtin.service:
    name: prometheus
    state: started
    enabled: true</code></pre>
          </div>
          <p>La plantilla de configuración genera targets dinámicamente desde el inventario:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/prometheus/templates/prometheus.yml.j2</span></div>
            <pre class="language-yaml"><code class="language-yaml">global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']

rule_files:
  - "rules.d/*.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node'
    static_configs:
{% for host in groups['all'] %}
      - targets: ['{{ hostvars[host]['ansible_host'] }}:9100']
        labels:
          instance: '{{ host }}'
          environment: '{{ hostvars[host]['env'] | default("production") }}'
{% endfor %}</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>validate:</strong> El parámetro <code>validate</code> en el módulo template ejecuta <code>promtool check config</code> sobre el archivo generado antes de copiarlo al destino. Si la configuración tiene errores, la tarea falla sin afectar el archivo actual en producción. Esto es un pattern de seguridad importante para archivos de configuración críticos.</div>
          </div>
        `,
      },
      {
        title: 'Despliegue de Grafana con dashboards provisionados',
        body: `
          <p>Grafana tiene una característica de "provisioning" que permite definir datasources y dashboards como archivos YAML y JSON en disco. Ansible despliega esos archivos y Grafana los carga automáticamente — sin necesidad de configurar nada a mano en la UI.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/grafana/tasks/main.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Agregar repositorio de Grafana
  ansible.builtin.deb822_repository:
    name: grafana
    types: deb
    uris: https://apt.grafana.com
    suites: stable
    components: main
    signed_by: https://apt.grafana.com/gpg.key
    state: present
  when: ansible_os_family == 'Debian'

- name: Instalar Grafana
  ansible.builtin.apt:
    name: grafana
    state: present
    update_cache: true
  when: ansible_os_family == 'Debian'

- name: Configurar Grafana (grafana.ini)
  ansible.builtin.template:
    src: grafana.ini.j2
    dest: /etc/grafana/grafana.ini
    owner: grafana
    group: grafana
    mode: '0640'
  notify: Reiniciar grafana

- name: Crear directorio de provisioning
  ansible.builtin.file:
    path: "{{ item }}"
    state: directory
    owner: grafana
    group: grafana
    mode: '0755'
  loop:
    - /etc/grafana/provisioning/datasources
    - /etc/grafana/provisioning/dashboards
    - /var/lib/grafana/dashboards

- name: Configurar datasource de Prometheus
  ansible.builtin.template:
    src: prometheus-datasource.yml.j2
    dest: /etc/grafana/provisioning/datasources/prometheus.yml
    owner: grafana
    group: grafana
    mode: '0640'
  notify: Reiniciar grafana

- name: Copiar dashboards JSON a Grafana
  ansible.builtin.copy:
    src: "{{ item }}"
    dest: "/var/lib/grafana/dashboards/{{ item | basename }}"
    owner: grafana
    group: grafana
    mode: '0644'
  with_fileglob:
    - "{{ role_path }}/files/dashboards/*.json"
  notify: Reiniciar grafana

- name: Configurar dashboard provider
  ansible.builtin.template:
    src: dashboard-provider.yml.j2
    dest: /etc/grafana/provisioning/dashboards/provider.yml
    owner: grafana
    group: grafana
    mode: '0640'
  notify: Reiniciar grafana</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/grafana/templates/dashboard-provider.yml.j2</span></div>
            <pre class="language-yaml"><code class="language-yaml">apiVersion: 1
providers:
  - name: ansible-managed
    folder: Infrastructure
    type: file
    disableDeletion: true   # Grafana no puede borrar dashboards gestionados por Ansible
    updateIntervalSeconds: 30
    options:
      path: /var/lib/grafana/dashboards</code></pre>
          </div>
        `,
      },
      {
        title: 'Logging centralizado con Loki y Promtail',
        body: `
          <p>Loki es el sistema de logging de Grafana Labs, diseñado para ser el "Prometheus de los logs". No indexa el contenido de los logs (solo las etiquetas), lo que lo hace extremadamente eficiente en almacenamiento. Promtail es el agente que recolecta logs y los envía a Loki.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/promtail/tasks/main.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Descargar Promtail
  ansible.builtin.get_url:
    url: "https://github.com/grafana/loki/releases/download/v{{ loki_version }}/promtail-linux-amd64.zip"
    dest: /tmp/promtail.zip
    checksum: "sha256:{{ promtail_checksum }}"

- name: Instalar unzip
  ansible.builtin.package:
    name: unzip
    state: present

- name: Extraer e instalar Promtail
  ansible.builtin.unarchive:
    src: /tmp/promtail.zip
    dest: /usr/local/bin/
    remote_src: true
    mode: '0755'

- name: Crear usuario promtail
  ansible.builtin.user:
    name: promtail
    system: true
    shell: /sbin/nologin
    groups:
      - systemd-journal
      - adm

- name: Configurar Promtail
  ansible.builtin.template:
    src: promtail-config.yml.j2
    dest: /etc/promtail/config.yml
    owner: promtail
    group: promtail
    mode: '0640'
  notify: Reiniciar promtail</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/promtail/templates/promtail-config.yml.j2</span></div>
            <pre class="language-yaml"><code class="language-yaml">server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://{{ loki_server }}:3100/loki/api/v1/push

scrape_configs:
  - job_name: system
    static_configs:
      - targets:
          - localhost
        labels:
          job: system-logs
          host: {{ inventory_hostname }}
          environment: {{ env | default('production') }}
          __path__: /var/log/syslog

  - job_name: nginx
    static_configs:
      - targets:
          - localhost
        labels:
          job: nginx-access
          host: {{ inventory_hostname }}
          __path__: /var/log/nginx/access.log
    pipeline_stages:
      - regex:
          expression: '^(?P<remote_addr>\S+) - (?P<remote_user>\S+) \[(?P<time_local>[^\]]+)\] "(?P<method>\S+) (?P<path>\S+) \S+" (?P<status>\d+) (?P<body_bytes_sent>\d+)'
      - labels:
          method:
          status:</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Eficiencia de Loki:</strong> a diferencia de Elasticsearch que indexa cada palabra de cada log, Loki solo indexa las etiquetas (labels). Esto reduce el almacenamiento necesario entre 10x y 100x. La búsqueda en Loki usa LogQL, un lenguaje similar a PromQL.</div>
          </div>
        `,
      },
      {
        title: 'Ansible callback plugins para métricas de playbooks',
        body: `
          <p>Ansible tiene plugins de callback que se ejecutan durante y después de los playbooks. Dos de los más útiles vienen incluidos: <code>timer</code> (tiempo total) y <code>profile_tasks</code> (tiempo por tarea).</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
            <pre class="language-ini"><code class="language-ini">[defaults]
# Habilitar múltiples plugins de callback
callbacks_enabled = timer, profile_tasks, ansible.posix.json

# El callback json genera salida estructurada (útil para CI/CD)
stdout_callback = yaml

[callback_profile_tasks]
# Mostrar las 20 tareas más lentas al final
task_output_limit = 20
sort_order = descending</code></pre>
          </div>
          <p>Con <code>profile_tasks</code> habilitado, al final de cada playbook ves algo así:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">text</span><span class="code-block-filename">salida profile_tasks</span></div>
            <pre class="language-text"><code class="language-text">Saturday 31 July 2026 03:00:00 +0000 (0:00:10.456)  0:02:34.891 ****
===============================================================================
Instalar paquetes del sistema -------------- 45.23s
Descargar Prometheus ----------------------- 32.11s
Configurar nginx --------------------------- 8.54s
Generar certificado TLS -------------------- 6.23s
Verificar health checks -------------------- 5.89s
...
Playbook run took 0 days, 0 hours, 2 minutes, 34 seconds</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/monitoring/tasks/ansible_metrics.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
# Exportar métricas de Ansible a un archivo que Prometheus puede scraping
- name: Registrar métricas de ejecución de playbook
  ansible.builtin.copy:
    content: |
      # HELP ansible_play_duration_seconds Duración del último playbook en segundos
      # TYPE ansible_play_duration_seconds gauge
      ansible_play_duration_seconds{play="{{ ansible_play_name }}", host="{{ inventory_hostname }}"} {{ ansible_play_duration | default(0) }}
      # HELP ansible_play_changed_tasks Total de tareas que realizaron cambios
      # TYPE ansible_play_changed_tasks counter
      ansible_play_changed_tasks{play="{{ ansible_play_name }}", host="{{ inventory_hostname }}"} {{ ansible_stats.changed | default(0) }}
    dest: /var/lib/node_exporter/textfile_collector/ansible_metrics.prom
    mode: '0644'
  delegate_to: "{{ inventory_hostname }}"</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Textfile collector:</strong> node_exporter tiene un textfile collector que puede scraping archivos .prom en un directorio. Esto permite que cualquier script o playbook exporte métricas custom a Prometheus sin necesidad de un exporter dedicado.</div>
          </div>
        `,
      },
      {
        title: 'Alerting: reglas de Alertmanager con Ansible',
        body: `
          <p>Alertmanager recibe alertas de Prometheus y las enruta a los canales correctos (email, Slack, PagerDuty). Ansible puede gestionar tanto las reglas de alerta de Prometheus como la configuración de rutas de Alertmanager.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/prometheus/templates/alerts.yml.j2</span></div>
            <pre class="language-yaml"><code class="language-yaml">groups:
  - name: infraestructura
    interval: 30s
    rules:
      - alert: HostCaído
        expr: up == 0
        for: 2m
        labels:
          severity: critical
          team: infra
        annotations:
          summary: "Host {{ "{{ $labels.instance }}" }} caído"
          description: "{{ "{{ $labels.instance }}" }} no responde desde hace más de 2 minutos"
          runbook: "https://wiki.empresa.com/runbooks/host-caido"

      - alert: DiskSpaceBajo
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 15
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Espacio en disco bajo en {{ "{{ $labels.instance }}" }}"
          description: "Quedan menos del 15% de espacio en {{ "{{ $labels.mountpoint }}" }}"

      - alert: CertificadoTLSPorVencer
        expr: (probe_ssl_earliest_cert_expiry - time()) / 86400 < 30
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "Certificado TLS por vencer en {{ "{{ $labels.instance }}" }}"
          description: "El certificado vence en menos de 30 días"</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/alertmanager/templates/alertmanager.yml.j2</span></div>
            <pre class="language-yaml"><code class="language-yaml">global:
  slack_api_url: "{{ alertmanager_slack_webhook }}"
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'slack-default'
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty-critical'
      continue: true
    - match:
        severity: warning
      receiver: 'slack-default'

receivers:
  - name: 'slack-default'
    slack_configs:
      - channel: '#ops-alerts'
        title: '{{ "{{ .GroupLabels.alertname }}" }}'
        text: '{{ "{{ range .Alerts }}{{ .Annotations.description }}\n{{ end }}" }}'
        send_resolved: true

  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: "{{ alertmanager_pagerduty_key }}"</code></pre>
          </div>
          <div class="lab-box">
            <div class="lab-box-header">🧪 Laboratorio final: Stack de observabilidad completo</div>
            <p><strong>Objetivo:</strong> desplegar el stack completo en un servidor de staging.</p>
            <ol>
              <li>Aplicá el rol <code>node_exporter</code> en todos los hosts del inventario</li>
              <li>Desplegá Prometheus en el servidor de monitoreo con targets generados dinámicamente</li>
              <li>Desplegá Grafana con el datasource de Prometheus y al menos un dashboard de node_exporter</li>
              <li>Configurá Alertmanager con al menos una regla de alerta y una ruta a Slack</li>
              <li>Desplegá Promtail en todos los hosts y Loki en el servidor de monitoreo</li>
              <li>Verificá el stack completo: generá carga en un host y confirmar que aparece en Grafana</li>
            </ol>
          </div>
          <div class="challenge-box">
            <div class="challenge-box-header">🏆 Desafío final del curso</div>
            <p>Creá un playbook <code>site.yml</code> que integre todo lo aprendido en el Nivel 22: hardening de Linux, gestión de certificados TLS, integración CI/CD y stack de observabilidad completo. Este playbook debe poder desplegar un servidor production-ready desde cero en menos de 15 minutos. ¡Eso es Ansible en producción real!</p>
          </div>
        `,
      },
    ],
    quiz: [
      {
        question: '¿Por qué Loki es más eficiente en almacenamiento que Elasticsearch para logs?',
        options: [
          'Porque Loki comprime los logs con un algoritmo más eficiente',
          'Porque Loki solo indexa las etiquetas (labels), no el contenido completo de los logs',
          'Porque Loki elimina automáticamente los logs duplicados',
          'Porque Loki usa una base de datos relacional que es más compacta',
        ],
        correctIndex: 1,
        explanation:
          'Elasticsearch indexa cada palabra de cada log para permitir búsquedas de texto completo, lo que requiere mucho espacio. Loki solo indexa las etiquetas (host, job, environment, etc.) que asignás a cada stream de logs. El contenido de los logs se almacena comprimido sin indexar. Las búsquedas usan filtros de etiquetas primero y luego buscan en el texto comprimido, siendo menos flexible pero mucho más eficiente en costo.',
      },
      {
        question: '¿Qué hace el parámetro `validate` en el módulo ansible.builtin.template?',
        options: [
          'Valida que el archivo de template Jinja2 tenga sintaxis correcta antes de renderizarlo',
          'Ejecuta un comando externo sobre el archivo generado antes de copiarlo al destino final, fallando si el comando retorna un error',
          'Verifica que las variables Jinja2 usadas en el template estén definidas en el inventario',
          'Comprueba que el archivo de destino no haya sido modificado manualmente',
        ],
        correctIndex: 1,
        explanation:
          'El parámetro `validate` en template (y copy) recibe un comando con %s como placeholder para el path del archivo temporal. Ansible renderiza el template a un archivo temporal, ejecuta el comando de validación sobre ese archivo, y solo si el comando retorna código 0 copia el archivo al destino final. Esto previene que una configuración inválida (ej: prometheus.yml con sintaxis incorrecta) reemplace la configuración actual y rompa el servicio.',
      },
      {
        question: '¿Cuál es el propósito del textfile collector de node_exporter?',
        options: [
          'Exportar logs de texto plano a Prometheus',
          'Parsear archivos de configuración y convertirlos en métricas',
          'Permitir que scripts y herramientas externas exporten métricas custom a Prometheus escribiendo archivos .prom',
          'Generar reportes de métricas en formato de texto para enviar por email',
        ],
        correctIndex: 2,
        explanation:
          'El textfile collector de node_exporter monitorea un directorio (generalmente /var/lib/node_exporter/textfile_collector/) y cuando encuentra archivos .prom con el formato Prometheus exposition format, los expone como métricas. Esto permite que cualquier script, playbook o herramienta exporte métricas custom sin necesidad de un exporter dedicado. Los archivos .prom son texto plano con el formato `metric_name{labels} valor`.',
      },
    ],
    realWorldCase:
      'Una empresa de logística con 300 servidores distribuidos en 3 regiones no tenía visibilidad centralizada: cada equipo tenía sus propios dashboards desconectados y las alertas llegaban tarde o directamente no llegaban. Implementaron el stack Prometheus+Grafana+Loki con Ansible en un sprint de 2 semanas. En el primer mes detectaron y resolvieron 12 incidentes antes de que impactaran a usuarios finales. El MTTR (tiempo medio de resolución) bajó de 4.5 horas a 35 minutos gracias a tener logs y métricas correlacionados en Grafana.',
    troubleshooting: [
      {
        error: 'Prometheus falla con "INVALID: /etc/prometheus/prometheus.yml: error parsing YAML file"',
        cause:
          'La plantilla Jinja2 genera YAML inválido, típicamente por indentación incorrecta en loops o por variables con caracteres especiales que no se escapan correctamente.',
        fix: 'Usá el parámetro `validate: /usr/local/bin/promtool check config %s` en el módulo template para detectar el error antes de copiar el archivo. Para depurar, usá `ansible-playbook --check -vvv` y buscá el archivo temporal generado en /tmp. Prestá especial atención a la indentación dentro de bloques `{% for %}` en la plantilla.',
      },
      {
        error: 'Grafana muestra "datasource not found" aunque el provisioning file existe',
        cause:
          'El archivo de datasource tiene permisos incorrectos (Grafana no puede leerlo), o el nombre del datasource en el dashboard JSON no coincide exactamente con el name definido en el provisioning file.',
        fix: 'Verificá permisos: los archivos en /etc/grafana/provisioning/ deben ser propiedad de grafana:grafana con permisos 640. Comprobá que el campo "uid" o "name" en el datasource provisioning coincida exactamente con el usado en los dashboards JSON. Revisá los logs de Grafana: `journalctl -u grafana-server -n 50`.',
      },
      {
        error: 'Alertmanager no envía alertas a Slack aunque las reglas están disparadas en Prometheus',
        cause:
          'El webhook URL de Slack está incorrecto o expiró, las rutas de Alertmanager no coinciden con las labels de las alertas, o hay un inhibition rule que silencia las alertas.',
        fix: 'Verificá el webhook con curl: `curl -X POST -H "Content-type: application/json" --data \'{"text":"test"}\' YOUR_WEBHOOK_URL`. Revisá el status de Alertmanager en http://alertmanager:9093/api/v2/alerts para ver qué alertas están activas. Verificá que no haya silences activos en la UI de Alertmanager. Comprobá que las labels de las alertas coincidan con los matchers de las rutas.',
      },
    ],
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
