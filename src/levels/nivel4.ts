import type { ModuleContent } from './types';

export const nivel4Modules: ModuleContent[] = [
  {
    levelId: 4,
    moduleId: 1,
    title: 'ansible — Comando ad-hoc',
    objective: 'Dominar el comando ansible para ejecutar módulos directamente en hosts remotos sin necesidad de un playbook.',
    duration: '1 hora',
    objectives: [
      'Usar los flags -m, -a, -i, -b y -v del comando ansible',
      'Ejecutar comandos ad-hoc para diagnóstico, instalación y gestión de servicios',
      'Seleccionar hosts con patrones: grupos, wildcards, intersecciones y exclusiones',
      'Recopilar facts de hosts remotos con ansible -m setup',
    ],
    steps: [
      {
        title: 'Qué es un comando ad-hoc',
        body: `
          <p>Un comando ad-hoc es una forma de ejecutar un módulo de Ansible directamente en uno o más hosts, sin escribir un playbook. Es ideal para tareas rápidas, comprobaciones, o cuando necesitás ejecutar algo una sola vez.</p>
          <p>La sintaxis básica es: <code>ansible [patrón-hosts] -m [módulo] -a "[argumentos]" [opciones]</code></p>
        `
      },
      {
        title: 'Flags más importantes',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ansible-flags.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># -m: módulo a ejecutar (default: command)
ansible servidores_web -m ping

# -a: argumentos del módulo
ansible servidores_web -m command -a "uptime"

# -i: archivo o directorio de inventario
ansible all -m ping -i inventario/

# -u: usuario SSH
ansible web1 -m ping -u ubuntu

# -b / --become: escalar privilegios (sudo)
ansible servidores_web -m package -a "name=nginx state=present" -b

# --become-user: usuario al que escalar (default: root)
ansible web1 -m command -a "whoami" -b --become-user=postgres

# -k: pedir contraseña SSH interactivamente
ansible web1 -m ping -k

# -K: pedir contraseña de sudo interactivamente
ansible web1 -m command -a "apt update" -b -K

# -f: número de forks paralelos (default: 5)
ansible all -m ping -f 20

# -v / -vv / -vvv: verbosidad (más v = más detalle)
ansible web1 -m ping -vvv

# --check: dry-run, simula sin ejecutar cambios
ansible all -m package -a "name=nginx state=present" --check

# -e: extra variables
ansible web1 -m debug -a "var=ansible_hostname" -e "extra=valor"</code></pre>
          </div>
        `
      },
      {
        title: 'Ejemplos prácticos de ad-hoc',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ad-hoc-ejemplos.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Verificar conectividad con todos los hosts
ansible all -m ping

# Ver uptime de servidores web
ansible servidores_web -m command -a "uptime"

# Instalar un paquete (requiere sudo)
ansible bases_de_datos -m package -a "name=postgresql state=present" -b

# Copiar un archivo
ansible web1 -m copy -a "src=/local/archivo.conf dest=/etc/app/archivo.conf mode=0644" -b

# Reiniciar un servicio
ansible servidores_web -m service -a "name=nginx state=restarted" -b

# Ejecutar un script local en hosts remotos
ansible all -m script -a "/path/local/mi-script.sh"

# Recopilar facts de un host
ansible web1 -m setup

# Recopilar solo facts de red
ansible web1 -m setup -a "filter=ansible_default_ipv4"

# Crear un usuario
ansible all -m user -a "name=deploy shell=/bin/bash groups=sudo" -b</code></pre>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">ansible-playbook</div>
              <div class="next-chapter-desc">Cuando las tareas son múltiples y repetibles, las encapsulás en un playbook y lo ejecutás con ansible-playbook.</div>
            </div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 4,
    moduleId: 2,
    title: 'ansible-playbook — Ejecutar playbooks',
    objective: 'Dominar todas las opciones del comando ansible-playbook para controlar la ejecución de playbooks.',
    duration: '1.5 horas',
    objectives: [
      'Usar --limit, --tags y --skip-tags para ejecuciones parciales',
      'Ejecutar dry-runs con --check y --diff para previsualizar cambios',
      'Empezar desde una tarea específica con --start-at-task',
      'Pasar variables en línea de comandos con -e y desde archivos con -e @archivo.yml',
    ],
    steps: [
      {
        title: 'Opciones fundamentales',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ansible-playbook-flags.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Ejecución básica
ansible-playbook sitio.yml

# Con inventario específico
ansible-playbook -i inventario/produccion/ sitio.yml

# Limitar a hosts/grupos específicos
ansible-playbook sitio.yml --limit servidores_web
ansible-playbook sitio.yml --limit "web1,web2"
ansible-playbook sitio.yml --limit "servidores_web:!web3"  # excluir web3

# Solo ejecutar tareas con ciertos tags
ansible-playbook sitio.yml --tags nginx,ssl
ansible-playbook sitio.yml --skip-tags debug

# Dry-run completo
ansible-playbook sitio.yml --check

# Ver diferencias en archivos (con --check)
ansible-playbook sitio.yml --check --diff

# Empezar desde una tarea específica
ansible-playbook sitio.yml --start-at-task="Configurar nginx"

# Hacer pausa antes de cada tarea
ansible-playbook sitio.yml --step

# Extra variables
ansible-playbook sitio.yml -e "version=2.1.0 env=staging"
ansible-playbook sitio.yml -e @variables-extra.yml

# Syntax check
ansible-playbook sitio.yml --syntax-check

# Lista de tareas que se ejecutarían
ansible-playbook sitio.yml --list-tasks

# Lista de hosts afectados
ansible-playbook sitio.yml --list-hosts</code></pre>
          </div>
        `
      },
      {
        title: 'Opciones de escalada de privilegios y conexión',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ansible-playbook-conexion.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Usuario SSH
ansible-playbook -u ubuntu sitio.yml

# Clave SSH específica
ansible-playbook --private-key ~/.ssh/produccion_rsa sitio.yml

# Become (sudo)
ansible-playbook -b sitio.yml

# Contraseña de become interactiva
ansible-playbook -b -K sitio.yml

# Contraseña SSH interactiva
ansible-playbook -k sitio.yml

# Número de conexiones paralelas
ansible-playbook -f 20 sitio.yml

# Timeout de conexión (segundos)
ansible-playbook --timeout 60 sitio.yml</code></pre>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">ansible-config</div>
              <div class="next-chapter-desc">Inspeccionás y gestionás la configuración activa de Ansible: qué archivo se carga, qué opciones están activas y cómo generar un ansible.cfg completo.</div>
            </div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 4,
    moduleId: 3,
    title: 'ansible-config — Gestión de configuración',
    objective: 'Aprender a inspeccionar y gestionar la configuración de Ansible usando ansible-config.',
    duration: '45 minutos',
    objectives: [
      'Listar la configuración activa y sus fuentes con ansible-config dump',
      'Identificar qué opciones están modificadas respecto a los defaults',
      'Generar un ansible.cfg de referencia con ansible-config init',
      'Configurar las opciones de rendimiento y conexión más importantes',
    ],
    steps: [
      {
        title: 'Comandos principales de ansible-config',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ansible-config-comandos.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Ver toda la configuración activa con sus fuentes
ansible-config dump

# Ver solo configuración no-default (lo que modificaste)
ansible-config dump --only-changed

# Ver lista de todas las opciones de configuración disponibles
ansible-config list

# Generar un ansible.cfg con todas las opciones comentadas
ansible-config init > ansible.cfg.ejemplo

# Ver configuración como YAML
ansible-config dump --format yaml</code></pre>
          </div>
        `
      },
      {
        title: 'ansible.cfg más comunes',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
            <pre class="language-ini"><code class="language-ini">[defaults]
# Inventario por defecto
inventory = inventario/

# Usuario SSH por defecto
remote_user = ubuntu

# Número de forks paralelos
forks = 10

# Timeout de conexión SSH (segundos)
timeout = 30

# Callback para la salida
stdout_callback = yaml
callback_enabled = timer, profile_tasks

# Deshabilitar host key checking (solo para desarrollo)
host_key_checking = False

# Archivo de log
log_path = /var/log/ansible.log

# Roles paths
roles_path = roles:~/.ansible/roles

# Collections paths
collections_paths = ~/.ansible/collections:/etc/ansible/collections

[privilege_escalation]
become = True
become_method = sudo
become_user = root

[ssh_connection]
# SSH multiplexing para mejor performance
control_path_dir = /tmp/ansible-ssh-%%h-%%p-%%r
pipelining = True</code></pre>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">ansible-doc</div>
              <div class="next-chapter-desc">Consultás la documentación de cualquier módulo o plugin directamente desde la terminal, sin salir del flujo de trabajo.</div>
            </div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 4,
    moduleId: 4,
    title: 'ansible-doc — Documentación de módulos',
    objective: 'Usar ansible-doc para consultar documentación de módulos, plugins y roles directamente desde la terminal.',
    duration: '30 minutos',
    objectives: [
      'Consultar la documentación completa y los ejemplos de cualquier módulo',
      'Buscar módulos por palabra clave con ansible-doc -l | grep',
      'Listar plugins de inventario, callback y connection disponibles',
      'Usar el modo snippet (-s) para obtener la estructura mínima de un módulo',
    ],
    steps: [
      {
        title: 'Comandos de ansible-doc',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ansible-doc-ejemplos.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Documentación completa de un módulo
ansible-doc ansible.builtin.copy

# Solo ejemplos (snippet) — muy útil para empezar
ansible-doc -s ansible.builtin.template

# Buscar módulos por texto
ansible-doc -l | grep "nginx"
ansible-doc -l | grep "file"

# Listar todos los módulos disponibles
ansible-doc -l

# Documentación de un inventory plugin
ansible-doc -t inventory amazon.aws.aws_ec2

# Documentación de un callback plugin
ansible-doc -t callback yaml

# Documentación de un connection plugin
ansible-doc -t connection ssh

# Listar todos los plugins de un tipo
ansible-doc -t inventory -l
ansible-doc -t callback -l</code></pre>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">ansible-galaxy</div>
              <div class="next-chapter-desc">Instalás roles y collections de la comunidad, y creás la estructura base de tus propios roles con un solo comando.</div>
            </div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 4,
    moduleId: 5,
    title: 'ansible-galaxy — Gestión de roles y collections',
    objective: 'Usar ansible-galaxy para instalar, crear y publicar roles y collections de Ansible Galaxy.',
    duration: '1.5 horas',
    objectives: [
      'Instalar roles y collections desde Galaxy usando requirements.yml',
      'Crear la estructura de un rol con ansible-galaxy role init',
      'Fijar versiones de dependencias en requirements.yml para reproducibilidad',
      'Inicializar el namespace de una collection propia',
    ],
    steps: [
      {
        title: 'Instalar roles y collections',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">galaxy-instalar.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Instalar un rol desde Galaxy
ansible-galaxy role install geerlingguy.nginx

# Instalar una versión específica
ansible-galaxy role install geerlingguy.nginx,3.1.0

# Instalar una collection
ansible-galaxy collection install community.general

# Instalar desde requirements.yml (la forma recomendada)
ansible-galaxy role install -r requirements.yml
ansible-galaxy collection install -r requirements.yml

# Ver roles instalados
ansible-galaxy role list

# Info de un rol
ansible-galaxy role info geerlingguy.nginx</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">requirements.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">roles:
  - name: geerlingguy.nginx
    version: "3.1.0"
  - name: geerlingguy.postgresql
    version: "3.3.0"

collections:
  - name: community.general
    version: ">=7.0.0"
  - name: amazon.aws
    version: "6.0.0"</code></pre>
          </div>
        `
      },
      {
        title: 'Crear la estructura de un rol',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">galaxy-crear.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Crear la estructura de un rol nuevo
ansible-galaxy role init mi-rol

# La estructura creada:
# mi-rol/
# ├── README.md
# ├── defaults/
# │   └── main.yml      # Variables con defaults (menor precedencia)
# ├── files/            # Archivos estáticos
# ├── handlers/
# │   └── main.yml      # Handlers
# ├── meta/
# │   └── main.yml      # Metadatos y dependencias
# ├── tasks/
# │   └── main.yml      # Tareas principales
# ├── templates/        # Templates Jinja2
# ├── tests/            # Tests del rol
# └── vars/
#     └── main.yml      # Variables internas del rol (mayor precedencia)

# Crear un namespace de collection
ansible-galaxy collection init mi_empresa.mi_collection</code></pre>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">ansible-vault</div>
              <div class="next-chapter-desc">Protegés contraseñas, claves API y otros secretos con encriptación AES-256 directamente en el repositorio Git.</div>
            </div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 4,
    moduleId: 6,
    title: 'ansible-vault — Encriptación de secretos',
    objective: 'Proteger datos sensibles usando ansible-vault para encriptar variables, archivos y valores individuales.',
    duration: '1.5 horas',
    objectives: [
      'Encriptar archivos y valores individuales con ansible-vault encrypt y encrypt_string',
      'Editar archivos vault con ansible-vault edit sin desencriptarlos en disco',
      'Aplicar el patrón vault_/vars_ para separar secretos de variables normales',
      'Ejecutar playbooks con secretos vault usando --ask-vault-pass o --vault-password-file',
    ],
    steps: [
      {
        title: 'Comandos fundamentales de Vault',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">vault-comandos.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Encriptar un archivo completo
ansible-vault encrypt inventario/group_vars/all/vault.yml

# Desencriptar temporalmente para editar
ansible-vault edit inventario/group_vars/all/vault.yml

# Ver el contenido sin desencriptar el archivo
ansible-vault view inventario/group_vars/all/vault.yml

# Encriptar un valor individual (para pegar en YAML)
ansible-vault encrypt_string 'mi-password-secreto' --name 'db_password'

# Cambiar la contraseña de vault
ansible-vault rekey archivo.yml

# Desencriptar un archivo (dejarlo en texto plano)
ansible-vault decrypt archivo.yml

# Usar al ejecutar playbook
ansible-playbook sitio.yml --ask-vault-pass
ansible-playbook sitio.yml --vault-password-file ~/.vault-pass</code></pre>
          </div>
        `
      },
      {
        title: 'Buenas prácticas con Vault',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">group_vars/all/vault.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Convención: prefijo vault_ para variables encriptadas
vault_db_password: !vault |
  $ANSIBLE_VAULT;1.1;AES256
  61663864313937333535633438303037383361316663333637326135...
vault_api_key: !vault |
  $ANSIBLE_VAULT;1.1;AES256
  38656462363339396438353736376231...</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">group_vars/all/vars.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Variables normales referencian las vault_
db_password: "{{ vault_db_password }}"
api_key: "{{ vault_api_key }}"</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Patrón recomendado:</strong> mantener los archivos vault.yml encriptados y vars.yml sin encriptar. El vault solo contiene las variables con prefijo vault_. Esto permite inspeccionar qué variables existen sin revelar sus valores.</div>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">ansible-pull</div>
              <div class="next-chapter-desc">Invertís el modelo de ejecución: los propios hosts descargan y aplican sus playbooks desde Git, ideal para flotas de miles de máquinas.</div>
            </div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 4,
    moduleId: 7,
    title: 'ansible-pull — Modelo pull',
    objective: 'Entender el modelo pull de Ansible y cuándo usarlo en lugar del modelo push estándar.',
    duration: '1 hora',
    objectives: [
      'Explicar cuándo el modelo pull escala mejor que el modelo push',
      'Configurar ansible-pull para clonar un repositorio Git y ejecutar un playbook local',
      'Automatizar ansible-pull como cron job en cada host',
      'Identificar las limitaciones del modelo pull respecto al feedback inmediato',
    ],
    steps: [
      {
        title: 'Qué es ansible-pull',
        body: `
          <p>Ansible opera en modelo push: el nodo de control se conecta a los hosts y ejecuta las tareas. <code>ansible-pull</code> invierte este modelo: cada host clona el repositorio Git con los playbooks y se auto-configura. Es útil para:</p>
          <ul>
            <li>Flotas de miles de máquinas donde el push no escala</li>
            <li>Entornos sin conectividad directa desde el control node</li>
            <li>Bootstrap de nuevas máquinas sin intervención manual</li>
            <li>Configuración de estaciones de trabajo</li>
          </ul>
        `
      },
      {
        title: 'Uso de ansible-pull',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ansible-pull-ejemplo.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Sintaxis básica: cada host clona el repo y ejecuta el playbook
ansible-pull -U https://github.com/mi-org/ansible-config.git local.yml

# Con rama específica
ansible-pull -U git@github.com:mi-org/config.git -C produccion local.yml

# Con directorio de trabajo específico
ansible-pull -U https://github.com/mi-org/config.git -d /opt/ansible local.yml

# Con clave privada para el repo Git
ansible-pull -U git@github.com:mi-org/config.git --private-key ~/.ssh/deploy_key local.yml

# Como cron job (cada 30 minutos)
# En /etc/cron.d/ansible-pull:
# */30 * * * * root ansible-pull -U https://... local.yml >> /var/log/ansible-pull.log 2>&1</code></pre>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">ansible-inventory</div>
              <div class="next-chapter-desc">Inspeccionás y depurás inventarios complejos para ver exactamente qué hosts, grupos y variables resuelve Ansible.</div>
            </div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 4,
    moduleId: 8,
    title: 'ansible-inventory — Inspección del inventario',
    objective: 'Usar ansible-inventory para inspeccionar y depurar inventarios estáticos y dinámicos.',
    duration: '45 minutos',
    objectives: [
      'Listar todos los hosts y grupos en JSON con ansible-inventory --list',
      'Ver el grafo de grupos con --graph para verificar jerarquías',
      'Inspeccionar las variables resueltas de un host específico con --host',
      'Exportar el inventario normalizado en YAML con --list -y',
    ],
    steps: [
      {
        title: 'Comandos de ansible-inventory',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ansible-inventory-comandos.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Ver todos los hosts y grupos en JSON
ansible-inventory -i inventario/ --list

# Ver todos los hosts en formato simple
ansible-inventory -i inventario/ --list | jq '.all.hosts'

# Ver variables de un host específico
ansible-inventory -i inventario/ --host web1.empresa.com

# Grafo de grupos (requiere graphviz para --graph)
ansible-inventory -i inventario/ --graph

# Grafo con variables incluidas
ansible-inventory -i inventario/ --graph --vars

# Exportar inventario en formato YAML (normalizado)
ansible-inventory -i inventario/ --list -y

# Verificar que el inventario es válido
ansible-inventory -i inventario/ --list > /dev/null && echo "OK"</code></pre>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">ansible-console</div>
              <div class="next-chapter-desc">Una consola interactiva para explorar hosts y probar módulos en tiempo real, sin escribir un playbook completo.</div>
            </div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 4,
    moduleId: 9,
    title: 'ansible-console — Consola interactiva',
    objective: 'Usar ansible-console para ejecutar módulos interactivamente en hosts remotos como si fuera una sesión de shell.',
    duration: '30 minutos',
    objectives: [
      'Abrir una sesión de ansible-console contra un grupo de hosts',
      'Ejecutar módulos interactivamente y cambiar de grupo con cd',
      'Probar módulos antes de incorporarlos a un playbook',
      'Usar ansible-console para troubleshooting en múltiples servidores simultáneamente',
    ],
    steps: [
      {
        title: 'Uso de ansible-console',
        body: `
          <p>ansible-console abre una consola interactiva donde podés ejecutar módulos de Ansible en hosts remotos de forma iterativa, sin tener que escribir el comando completo cada vez.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ansible-console-sesion.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Abrir consola contra el grupo servidores_web
ansible-console servidores_web -i inventario/

# Dentro de la consola:
# username@servidores_web (2)[f:5]$ ping
# username@servidores_web (2)[f:5]$ setup filter=ansible_distribution
# username@servidores_web (2)[f:5]$ command uptime

# Cambiar el grupo target dentro de la consola
# cd bases_de_datos

# Ver hosts del grupo actual
# list

# Salir
# exit

# Con become habilitado
ansible-console servidores_web -b</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Cuándo usarlo:</strong> ansible-console es ideal para explorar el estado de un grupo de hosts, probar módulos antes de escribirlos en un playbook, o realizar tareas de troubleshooting interactivo en múltiples servidores.</div>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">Nivel 5 — Playbooks en Profundidad</div>
              <div class="next-chapter-desc">Con el tooling dominado, profundizás en la anatomía completa de playbooks: plays, tasks, handlers, tags, loops y blocks.</div>
            </div>
          </div>
        `
      }
    ]
  }
];
