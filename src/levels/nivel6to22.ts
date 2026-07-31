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
  comingSoon(7, 2, 'Custom Facts'),
  comingSoon(7, 3, 'Fact Cache'),
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
  comingSoon(8, 2, 'Módulos de sistema'),
  comingSoon(8, 3, 'Módulos de red y cloud'),
  comingSoon(8, 4, 'Idempotencia y retorno JSON'),
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
  comingSoon(9, 2, 'Filtros Jinja2'),
  comingSoon(9, 3, 'Tests y condicionales Jinja2'),
  comingSoon(9, 4, 'Macros e includes Jinja2'),
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
  comingSoon(10, 2, 'failed_when y changed_when'),
  comingSoon(10, 3, 'check_mode y assert'),
  comingSoon(10, 4, 'until / retries / delay'),
];

// Generador para niveles 11-22 con contenido básico
function makeLevel(levelId: number, modules: Array<[number, string]>): ModuleContent[] {
  return modules.map(([moduleId, title]) => {
    const contents: Record<string, { intro: string; code: string; tip: string; warning: string }> = {
      '11-1': {
        intro: 'El <code>loop</code> básico de Ansible reemplaza a <code>with_items</code> (deprecado). Itera sobre una lista y ejecuta la tarea para cada elemento, disponible como <code>item</code>.',
        code: `- name: Crear múltiples directorios\n  ansible.builtin.file:\n    path: "{{ item }}"\n    state: directory\n  loop:\n    - /opt/app/logs\n    - /opt/app/data\n    - /opt/app/config`,
        tip: 'Preferí loop sobre with_items. with_items está deprecado desde Ansible 2.5.',
        warning: 'El loop básico no soporta variables complejas con listas anidadas. Para eso usá with_subelements o el filtro subelements.'
      },
    };

    const key = `${levelId}-${moduleId}`;
    const c = contents[key];

    if (c) {
      return {
        levelId,
        moduleId,
        title,
        objective: `Dominar ${title} en Ansible con ejemplos prácticos y anotados.`,
        steps: [
          {
            title: 'Introducción',
            body: `<p>${c.intro}</p>
              <div class="code-block-wrapper">
                <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">ejemplo.yml</span></div>
                <pre class="language-yaml"><code class="language-yaml">${c.code}</code></pre>
              </div>
              <div class="tip-box"><span class="box-icon">💡</span><div class="box-content"><strong>Tip:</strong> ${c.tip}</div></div>
              <div class="warning-box"><span class="box-icon">⚠️</span><div class="box-content"><strong>Atención:</strong> ${c.warning}</div></div>
              <div class="info-box"><span class="box-icon">📚</span><div class="box-content"><strong>Contenido completo próximamente</strong> — este módulo está en desarrollo activo.</div></div>`
          }
        ]
      };
    }

    return comingSoon(levelId, moduleId, title);
  });
}

export const nivel11Modules: ModuleContent[] = makeLevel(11, [
  [1, 'loop básico'],
  [2, 'dict2items y subelements'],
  [3, 'product, zip y cartesian'],
  [4, 'loop_control'],
]);

export const nivel12Modules: ModuleContent[] = makeLevel(12, [
  [1, 'Estructura completa de un role'],
  [2, 'Ansible Galaxy'],
  [3, 'Dependencias entre roles'],
]);

export const nivel13Modules: ModuleContent[] = makeLevel(13, [
  [1, 'Action Plugins'],
  [2, 'Lookup Plugins'],
  [3, 'Filter Plugins'],
  [4, 'Callback Plugins'],
  [5, 'Inventory Plugins'],
]);

export const nivel14Modules: ModuleContent[] = makeLevel(14, [
  [1, 'Qué son las collections'],
  [2, 'Namespaces y versiones'],
  [3, 'Crear una collection propia'],
]);

export const nivel15Modules: ModuleContent[] = makeLevel(15, [
  [1, 'Encriptación básica con Vault'],
  [2, 'Vault IDs y múltiples vaults'],
  [3, 'Buenas prácticas de seguridad'],
]);

export const nivel16Modules: ModuleContent[] = makeLevel(16, [
  [1, 'SSH Multiplexing y Pipelining'],
  [2, 'Forks y ejecución paralela'],
  [3, 'Fact Cache'],
]);

export const nivel17Modules: ModuleContent[] = makeLevel(17, [
  [1, 'Check Mode y Diff Mode'],
  [2, 'Molecule'],
  [3, 'Ansible Lint y yamllint'],
]);

export const nivel18Modules: ModuleContent[] = makeLevel(18, [
  [1, 'Docker y Podman'],
  [2, 'Kubernetes'],
  [3, 'AWS, Azure y GCP'],
  [4, 'VMware y Proxmox'],
]);

export const nivel19Modules: ModuleContent[] = makeLevel(19, [
  [1, 'Crear módulos propios'],
  [2, 'Crear plugins propios'],
  [3, 'Collections propias'],
  [4, 'Testing de módulos'],
]);

export const nivel20Modules: ModuleContent[] = makeLevel(20, [
  [1, 'Estructura del repositorio de Ansible'],
  [2, 'Cómo interactúan los componentes'],
  [3, 'Lectura del código fuente'],
]);

export const nivel21Modules: ModuleContent[] = makeLevel(21, [
  [1, 'Diseño de la infraestructura'],
  [2, 'Implementación completa'],
  [3, 'CI/CD con Ansible'],
]);

export const nivel22Modules: ModuleContent[] = makeLevel(22, [
  [1, 'Hardening de Linux'],
  [2, 'Gestión de certificados TLS'],
  [3, 'Integración con DevOps'],
  [4, 'Observabilidad y logging'],
]);

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
