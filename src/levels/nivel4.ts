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
    ],
    prerequisites: [
      'Completar el Nivel 0 — Fundamentos de Ansible',
      'Completar el Nivel 1 — Inventario y Conexión SSH',
      'Completar el Nivel 2 — Módulos esenciales',
    ],
    realWorldCase: 'Un SRE recibe una alerta de disco lleno en producción. En lugar de conectarse a cada servidor por SSH, ejecuta <code>ansible servidores_web -m command -a "df -h /var"</code> y en segundos tiene el estado de todos los nodos.',
    quiz: [
      {
        question: '¿Qué flag del comando ansible permite escalar privilegios a root en el host remoto?',
        options: ['-u root', '-b / --become', '--sudo', '-p'],
        correctIndex: 1,
        explanation: '-b (o --become) activa la escalada de privilegios. Por defecto usa sudo para convertirse en root, aunque se puede cambiar con --become-method y --become-user.',
      },
      {
        question: '¿Qué módulo se usa para recopilar facts (variables del sistema) de un host remoto?',
        options: ['ansible.builtin.facts', 'ansible.builtin.gather', 'ansible.builtin.setup', 'ansible.builtin.info'],
        correctIndex: 2,
        explanation: 'El módulo setup recopila todos los facts del host: distribución, IP, memoria, CPU, etc. Se puede filtrar con -a "filter=ansible_*".',
      },
      {
        question: '¿Cuál es la diferencia entre el módulo command y el módulo shell en comandos ad-hoc?',
        options: [
          'No hay diferencia, son alias',
          'shell permite pipes y redirecciones; command no',
          'command permite pipes; shell no',
          'shell solo funciona en Linux',
        ],
        correctIndex: 1,
        explanation: 'El módulo shell ejecuta el comando dentro de /bin/sh, lo que permite usar pipes (|), redirecciones (>) y variables de entorno. El módulo command los ejecuta directamente sin shell.',
      },
    ],
    troubleshooting: [
      {
        error: 'UNREACHABLE! => {"msg": "Failed to connect to the host via ssh"}',
        cause: 'Ansible no puede establecer la conexión SSH con el host: clave incorrecta, puerto diferente o host inaccesible.',
        fix: 'Verificá con ssh -v usuario@host. Revisá ansible_host, ansible_port y ansible_ssh_private_key_file en el inventario.',
      },
      {
        error: 'Missing sudo password',
        cause: 'Se usó -b (become) pero el usuario remoto requiere contraseña para sudo y no se proporcionó.',
        fix: 'Agregá -K para ingresar la contraseña de sudo interactivamente, o configurá NOPASSWD en /etc/sudoers del host remoto.',
      },
      {
        error: 'ERROR! No hosts matched the pattern',
        cause: 'El patrón de hosts no coincide con ningún host o grupo definido en el inventario.',
        fix: 'Verificá con ansible-inventory --list que el grupo o host existe. Comprobá que estás usando el inventario correcto con -i.',
      },
    ],
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
    ],
    prerequisites: [
      'Completar el Módulo 1 del Nivel 4 — ansible ad-hoc',
    ],
    realWorldCase: 'Un equipo de DevOps automatiza el despliegue de su aplicación ejecutando <code>ansible-playbook deploy.yml --limit produccion --tags app</code>, limitando el alcance a producción y solo las tareas de la aplicación, sin tocar la configuración del sistema.',
    quiz: [
      {
        question: '¿Qué flag de ansible-playbook activa el modo "dry run" sin ejecutar cambios reales?',
        options: ['--verbose', '--check', '--diff', '--syntax-check'],
        correctIndex: 1,
        explanation: '--check ejecuta el playbook en modo simulación: muestra qué cambiaría pero no aplica cambios reales en los hosts.',
      },
      {
        question: '¿Cómo se limita la ejecución de un playbook a un subconjunto de hosts del inventario?',
        options: ['--hosts web1,web2', '--limit web1,web2', '--filter web1,web2', '--target web1,web2'],
        correctIndex: 1,
        explanation: '--limit acepta nombres de hosts, grupos, y patrones de exclusión como "servidores_web:!web3". Permite ejecutar un playbook sobre un subconjunto sin modificar el inventario.',
      },
      {
        question: '¿Qué flag permite pasar variables extra desde la línea de comandos a un playbook?',
        options: ['-v', '-e / --extra-vars', '--vars', '--set'],
        correctIndex: 1,
        explanation: '-e (--extra-vars) tiene la mayor precedencia de todas las variables en Ansible. Se puede usar como string JSON, pares clave=valor, o apuntando a un archivo con @archivo.yml.',
      },
    ],
    troubleshooting: [
      {
        error: 'ERROR! the playbook: sitio.yml could not be found',
        cause: 'El archivo de playbook no existe en la ruta indicada o el comando se ejecuta desde el directorio equivocado.',
        fix: 'Verificá el directorio actual con pwd. Usá una ruta absoluta o relativa correcta al archivo .yml del playbook.',
      },
      {
        error: 'fatal: [web1]: FAILED! => {"msg": "Missing sudo password"}',
        cause: 'El playbook usa become: true pero el usuario remoto necesita contraseña para sudo.',
        fix: 'Ejecutá con -K para pedir la contraseña de become interactivamente, o configurá NOPASSWD para ese usuario en el host remoto.',
      },
      {
        error: 'WARNING: provided hosts list is empty, only localhost is available',
        cause: 'El patrón de hosts en el play no coincide con ningún host del inventario especificado.',
        fix: 'Verificá el inventario con ansible-inventory --list. Asegurate de pasar -i inventario/ o tener inventory configurado en ansible.cfg.',
      },
    ],
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
    ],
    prerequisites: [
      'Completar el Módulo 2 del Nivel 4 — ansible-playbook',
    ],
    realWorldCase: 'Un ingeniero detecta que sus playbooks tardan 40 segundos más de lo esperado. Con <code>ansible-config dump --only-changed</code> descubre que pipelining está desactivado y que forks está en 2. Corrige ambas opciones en ansible.cfg y reduce el tiempo de ejecución a la mitad.',
    quiz: [
      {
        question: '¿Qué subcomando de ansible-config muestra solo la configuración que difiere de los valores por defecto?',
        options: ['ansible-config list --modified', 'ansible-config dump --only-changed', 'ansible-config diff', 'ansible-config show --custom'],
        correctIndex: 1,
        explanation: 'ansible-config dump --only-changed filtra la salida para mostrar únicamente las opciones que han sido modificadas respecto a sus valores predeterminados, facilitando auditorías.',
      },
      {
        question: '¿Cómo se genera un archivo ansible.cfg de referencia con todas las opciones disponibles comentadas?',
        options: ['ansible-config list > ansible.cfg', 'ansible-config init > ansible.cfg', 'ansible-config dump --full > ansible.cfg', 'ansible-config export > ansible.cfg'],
        correctIndex: 1,
        explanation: 'ansible-config init genera un ansible.cfg completo con todas las opciones disponibles, cada una comentada con su descripción y valor por defecto.',
      },
      {
        question: '¿En qué orden de precedencia busca Ansible el archivo ansible.cfg?',
        options: [
          'ANSIBLE_CONFIG → /etc/ansible/ansible.cfg → ~/.ansible.cfg → ./ansible.cfg',
          'ANSIBLE_CONFIG → ./ansible.cfg → ~/.ansible.cfg → /etc/ansible/ansible.cfg',
          './ansible.cfg → ~/.ansible.cfg → /etc/ansible/ansible.cfg → ANSIBLE_CONFIG',
          '~/.ansible.cfg → ./ansible.cfg → ANSIBLE_CONFIG → /etc/ansible/ansible.cfg',
        ],
        correctIndex: 1,
        explanation: 'Ansible busca en este orden: variable de entorno ANSIBLE_CONFIG, luego ./ansible.cfg en el directorio actual, luego ~/.ansible.cfg y finalmente /etc/ansible/ansible.cfg. El primero encontrado gana.',
      },
    ],
    troubleshooting: [
      {
        error: 'Ansible is in a world writable directory, ignoring ansible.cfg',
        cause: 'El directorio donde está ansible.cfg tiene permisos de escritura para todos (world-writable), lo que representa un riesgo de seguridad.',
        fix: 'Corregí los permisos del directorio con chmod o-w . para quitar escritura a "otros". Ansible ignorará el cfg si el directorio es world-writable.',
      },
      {
        error: 'Invalid value for configuration option DEFAULT_FORKS',
        cause: 'El valor asignado a una opción de configuración no es del tipo esperado (por ejemplo, texto donde se espera un número).',
        fix: 'Revisá el tipo esperado con ansible-config list y corregí el valor en ansible.cfg. Para forks debe ser un entero positivo.',
      },
      {
        error: 'Could not find or access ansible.cfg',
        cause: 'Se especificó la variable ANSIBLE_CONFIG apuntando a un archivo que no existe.',
        fix: 'Verificá que la ruta en ANSIBLE_CONFIG es correcta con ls -la $ANSIBLE_CONFIG. O remové la variable de entorno para que Ansible use los paths por defecto.',
      },
    ],
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
    ],
    prerequisites: [
      'Completar el Módulo 3 del Nivel 4 — ansible-config',
    ],
    realWorldCase: 'Un desarrollador escribe un playbook que usa el módulo ansible.builtin.template pero no recuerda los parámetros exactos. Con <code>ansible-doc -s ansible.builtin.template</code> obtiene un snippet listo para copiar con todos los campos disponibles.',
    quiz: [
      {
        question: '¿Qué flag de ansible-doc muestra un snippet mínimo del módulo listo para usar en un playbook?',
        options: ['-l', '-t', '-s', '-e'],
        correctIndex: 2,
        explanation: '-s (--snippet) muestra un resumen conciso del módulo con los parámetros más importantes en formato YAML, listo para copiar en un playbook.',
      },
      {
        question: '¿Cómo se buscan todos los módulos disponibles que contienen la palabra "user"?',
        options: [
          'ansible-doc --search user',
          'ansible-doc -l | grep user',
          'ansible-doc -f user',
          'ansible-doc --find user',
        ],
        correctIndex: 1,
        explanation: 'ansible-doc -l lista todos los módulos disponibles. Combinado con grep se puede filtrar por nombre o descripción. Es la forma estándar de descubrir módulos relacionados con un tema.',
      },
      {
        question: '¿Qué flag de ansible-doc se usa para ver documentación de un inventory plugin en lugar de un módulo?',
        options: ['-m inventory', '-t inventory', '--plugin-type inventory', '--kind inventory'],
        correctIndex: 1,
        explanation: '-t (--type) especifica el tipo de plugin a documentar: inventory, callback, connection, lookup, become, etc. Por defecto ansible-doc muestra módulos (type=module).',
      },
    ],
    troubleshooting: [
      {
        error: 'ERROR! module ansible.builtin.copy was not found',
        cause: 'El nombre del módulo o la collection no está instalada, o se escribió mal el FQCN (Fully Qualified Collection Name).',
        fix: 'Verificá el nombre exacto con ansible-doc -l | grep copy. Para módulos de collections externas, instalá primero con ansible-galaxy collection install.',
      },
      {
        error: 'No module found matching ...',
        cause: 'Se usó un nombre corto de módulo que coincide con múltiples collections instaladas.',
        fix: 'Usá el FQCN completo, por ejemplo ansible.builtin.copy en lugar de solo copy. Así ansible-doc resuelve sin ambigüedad.',
      },
      {
        error: 'ansible-doc: error: no such option: --snippet',
        cause: 'Se usó --snippet en lugar de -s, ya que ansible-doc usa la forma corta para el snippet.',
        fix: 'Usá -s en lugar de --snippet. El flag largo correcto es --snippet solo en versiones modernas de Ansible; en otras es solo -s.',
      },
    ],
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
    ],
    prerequisites: [
      'Completar el Módulo 4 del Nivel 4 — ansible-doc',
    ],
    realWorldCase: 'Un equipo hereda un proyecto de Ansible sin documentación. Con <code>ansible-galaxy role install -r requirements.yml</code> instalan en segundos todos los roles de la comunidad que el proyecto necesita, reproduciendo el entorno original sin intervención manual.',
    quiz: [
      {
        question: '¿Cuál es la forma recomendada de instalar múltiples roles y collections en un proyecto Ansible?',
        options: [
          'Instalar cada uno con un comando separado',
          'Listarlos en requirements.yml y usar ansible-galaxy install -r requirements.yml',
          'Clonar los repositorios manualmente en la carpeta roles/',
          'Usar pip install para cada dependencia',
        ],
        correctIndex: 1,
        explanation: 'requirements.yml centraliza todas las dependencias (roles y collections) con sus versiones exactas. ansible-galaxy install -r requirements.yml instala todo de una vez, garantizando reproducibilidad.',
      },
      {
        question: '¿Qué comando crea la estructura de directorios estándar para un nuevo rol de Ansible?',
        options: [
          'ansible-galaxy role create mi-rol',
          'ansible-galaxy role init mi-rol',
          'ansible-galaxy new role mi-rol',
          'ansible-galaxy role scaffold mi-rol',
        ],
        correctIndex: 1,
        explanation: 'ansible-galaxy role init mi-rol crea la estructura completa: tasks/, handlers/, defaults/, vars/, files/, templates/, meta/ y tests/, siguiendo la convención estándar de roles.',
      },
      {
        question: '¿En qué directorio instala ansible-galaxy los roles por defecto?',
        options: [
          '/usr/share/ansible/roles',
          '~/.ansible/roles',
          './roles en el directorio actual',
          '/etc/ansible/roles',
        ],
        correctIndex: 1,
        explanation: 'Por defecto ansible-galaxy instala roles en ~/.ansible/roles. Se puede cambiar con roles_path en ansible.cfg o con el flag -p al instalar.',
      },
    ],
    troubleshooting: [
      {
        error: 'ERROR! the role \'geerlingguy.nginx\' was not found in /root/.ansible/roles',
        cause: 'Se referencia un rol en un playbook que no está instalado en ninguno de los roles_path configurados.',
        fix: 'Instalá el rol con ansible-galaxy role install geerlingguy.nginx o agregalo a requirements.yml y ejecutá ansible-galaxy install -r requirements.yml.',
      },
      {
        error: 'ERROR! No collection was found matching \'community.general\'',
        cause: 'Se usa un módulo de una collection que no está instalada en collections_paths.',
        fix: 'Instalá la collection con ansible-galaxy collection install community.general. Agregala a requirements.yml para reproducibilidad.',
      },
      {
        error: 'HttpError on GET https://galaxy.ansible.com/api/: 429 Too Many Requests',
        cause: 'Galaxy impone rate limiting. Se alcanzó el límite de peticiones desde la IP.',
        fix: 'Esperá unos minutos e intentá de nuevo. Para CI/CD, configurá un servidor Ansible Automation Hub privado o usá git como fuente en requirements.yml.',
      },
    ],
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
    ],
    prerequisites: [
      'Completar el Módulo 5 del Nivel 4 — ansible-galaxy',
    ],
    realWorldCase: 'Una startup almacena las contraseñas de base de datos y claves de API en archivos vault encriptados dentro de su repositorio Git. Con <code>ansible-vault edit</code> las actualiza sin desencriptarlas al disco, y los playbooks las leen automáticamente al ejecutarse con --vault-password-file.',
    quiz: [
      {
        question: '¿Qué subcomando de ansible-vault permite editar un archivo encriptado sin desencriptarlo permanentemente en disco?',
        options: ['ansible-vault open', 'ansible-vault edit', 'ansible-vault modify', 'ansible-vault change'],
        correctIndex: 1,
        explanation: 'ansible-vault edit desencripta el archivo en un editor temporal en memoria, guarda los cambios re-encriptados y elimina el archivo temporal. El archivo nunca queda en texto plano en disco.',
      },
      {
        question: '¿Cómo se encripta un valor individual para incluirlo directamente en un archivo YAML sin encriptar el archivo completo?',
        options: [
          'ansible-vault encrypt --inline "valor"',
          'ansible-vault encrypt_string "valor" --name variable',
          'ansible-vault inline "valor"',
          'ansible-vault string-encrypt "valor"',
        ],
        correctIndex: 1,
        explanation: 'ansible-vault encrypt_string genera un bloque !vault | con el valor encriptado que se puede pegar directamente en cualquier archivo YAML. Permite mezclar variables normales y encriptadas en el mismo archivo.',
      },
      {
        question: '¿Cuál es el patrón recomendado para organizar secretos con ansible-vault?',
        options: [
          'Encriptar todos los archivos group_vars completos',
          'Guardar todos los secretos en un vault.yml encriptado y referenciarlos desde vars.yml con prefijo vault_',
          'Usar encrypt_string en cada variable del playbook directamente',
          'Mantener los secretos en variables de entorno del sistema',
        ],
        correctIndex: 1,
        explanation: 'El patrón vault_/vars_ separa secrets (vault.yml encriptado con prefijo vault_) de referencias (vars.yml sin encriptar). Así podés ver qué variables existen sin revelar sus valores, y git diff es legible.',
      },
    ],
    troubleshooting: [
      {
        error: 'ERROR! Decryption failed (no vault secrets would decrypt) on ...',
        cause: 'La contraseña proporcionada no coincide con la usada para encriptar el archivo vault.',
        fix: 'Verificá que estás usando la contraseña correcta. Si usás --vault-password-file, revisá que el archivo contenga exactamente la contraseña sin espacios extra ni saltos de línea adicionales.',
      },
      {
        error: 'ERROR! A vault password must be specified to decrypt ...',
        cause: 'El playbook incluye variables vault pero no se proporcionó la contraseña de vault al ejecutarlo.',
        fix: 'Agregá --ask-vault-pass para ingresar la contraseña interactivamente, o --vault-password-file ~/.vault-pass para leerla de un archivo.',
      },
      {
        error: 'ansible-vault: [Errno 13] Permission denied: vault.yml',
        cause: 'El usuario que ejecuta ansible-vault no tiene permisos de escritura sobre el archivo vault.',
        fix: 'Verificá los permisos con ls -la vault.yml. Ajustá con chmod u+w vault.yml o ejecutá con el usuario propietario del archivo.',
      },
    ],
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
    ],
    prerequisites: [
      'Completar el Módulo 6 del Nivel 4 — ansible-vault',
    ],
    realWorldCase: 'Una empresa gestiona 5000 servidores web. En lugar de un control node central que empuja configuración, cada servidor ejecuta <code>ansible-pull</code> cada 30 minutos via cron, descargando y aplicando su configuración desde el repositorio Git corporativo de forma autónoma.',
    quiz: [
      {
        question: '¿Cuál es la diferencia fundamental entre el modelo push (ansible-playbook) y el modelo pull (ansible-pull)?',
        options: [
          'ansible-pull es más rápido que ansible-playbook',
          'En push el control node conecta a los hosts; en pull cada host se autoconfigura clonando el repositorio Git',
          'ansible-pull solo funciona con inventarios dinámicos',
          'En pull no se puede usar sudo/become',
        ],
        correctIndex: 1,
        explanation: 'En el modelo push (estándar), el control node SSH a cada host y ejecuta las tareas. En el modelo pull, cada host ejecuta ansible-pull que clona el repo Git localmente y aplica el playbook sobre sí mismo.',
      },
      {
        question: '¿Qué flag de ansible-pull especifica la URL del repositorio Git a clonar?',
        options: ['-r', '-U', '--repo', '--git-url'],
        correctIndex: 1,
        explanation: '-U (--url) es el flag obligatorio de ansible-pull que especifica la URL del repositorio Git. Sin este flag, el comando no puede ejecutarse.',
      },
      {
        question: '¿Cuál es la principal limitación del modelo pull respecto al modelo push?',
        options: [
          'No soporta variables',
          'No hay feedback inmediato al operador sobre el resultado de la ejecución en cada host',
          'Solo funciona con roles',
          'Requiere Python 3 en el control node',
        ],
        correctIndex: 1,
        explanation: 'En el modelo pull, cada host se autoconfigura de forma asíncrona. El operador no recibe feedback inmediato sobre si la ejecución fue exitosa o falló, a menos que implemente un sistema de reporte externo.',
      },
    ],
    troubleshooting: [
      {
        error: 'fatal: repository \'https://github.com/...\' not found',
        cause: 'La URL del repositorio es incorrecta, el repositorio es privado y no se proporcionaron credenciales, o la URL cambió.',
        fix: 'Verificá la URL del repositorio. Para repos privados, usá SSH con --private-key o configurá credenciales. Con HTTPS, usá tokens de acceso personal.',
      },
      {
        error: 'error: Your local changes to the following files would be overwritten by merge',
        cause: 'ansible-pull intenta hacer git pull pero hay cambios locales en el directorio de trabajo que entran en conflicto.',
        fix: 'ansible-pull usa --force por defecto en nuevas versiones. Si persiste, eliminá el directorio de trabajo con -d /ruta y dejá que lo clone de cero.',
      },
      {
        error: 'Could not find or access playbook: local.yml',
        cause: 'El playbook especificado no existe en la raíz del repositorio clonado.',
        fix: 'Verificá que el archivo local.yml existe en la raíz del repositorio. Podés especificar una ruta relativa diferente como último argumento de ansible-pull.',
      },
    ],
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
    ],
    prerequisites: [
      'Completar el Módulo 7 del Nivel 4 — ansible-pull',
    ],
    realWorldCase: 'Un administrador recibe una alerta de que un playbook falla con "host not in group". Con <code>ansible-inventory --graph --vars</code> verifica la jerarquía completa del inventario dinámico de AWS y detecta que un tag incorrecto en EC2 excluye el host del grupo esperado.',
    quiz: [
      {
        question: '¿Qué subcomando de ansible-inventory muestra todos los hosts y sus variables en formato JSON?',
        options: ['ansible-inventory --show', 'ansible-inventory --list', 'ansible-inventory --all', 'ansible-inventory --dump'],
        correctIndex: 1,
        explanation: '--list devuelve la representación completa del inventario en JSON, incluyendo grupos, hosts y variables. Es el formato que Ansible usa internamente y que los inventory scripts deben implementar.',
      },
      {
        question: '¿Cómo se inspeccionan las variables resueltas de un host específico con ansible-inventory?',
        options: [
          'ansible-inventory --vars web1',
          'ansible-inventory --host web1',
          'ansible-inventory --inspect web1',
          'ansible-inventory --show-host web1',
        ],
        correctIndex: 1,
        explanation: '--host <nombre> muestra todas las variables que Ansible resolvería para ese host específico, combinando variables del inventario, group_vars y host_vars con sus precedencias correctas.',
      },
      {
        question: '¿Qué flag de ansible-inventory muestra la jerarquía de grupos en formato árbol?',
        options: ['--tree', '--graph', '--hierarchy', '--structure'],
        correctIndex: 1,
        explanation: '--graph muestra la jerarquía de grupos como un árbol ASCII, útil para visualizar la estructura del inventario y verificar que los hosts están en los grupos correctos.',
      },
    ],
    troubleshooting: [
      {
        error: '[WARNING]: provided hosts list is empty, only localhost is available',
        cause: 'ansible-inventory no encontró hosts en el inventario especificado o el path del inventario es incorrecto.',
        fix: 'Verificá el path con -i inventario/ y que el directorio o archivo exista. Revisá también que los archivos de inventario tengan la extensión correcta (.yml, .ini, o sin extensión para scripts).',
      },
      {
        error: 'ERROR! Failed to parse inventario/aws_ec2.yml with auto plugin',
        cause: 'El inventory plugin dinámico (ej. aws_ec2) no está instalado o la collection requerida falta.',
        fix: 'Instalá la collection necesaria: ansible-galaxy collection install amazon.aws. Verificá que boto3 y botocore estén instalados con pip install boto3.',
      },
      {
        error: 'ansible-inventory: error: unrecognized arguments: --vars',
        cause: '--vars solo funciona combinado con --graph, no como flag independiente.',
        fix: 'Usá ansible-inventory --graph --vars en conjunto. El flag --vars solo tiene efecto para enriquecer la salida del grafo.',
      },
    ],
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
    ],
    prerequisites: [
      'Completar el Módulo 8 del Nivel 4 — ansible-inventory',
    ],
    realWorldCase: 'Durante un incidente en producción, un SRE abre <code>ansible-console servidores_web -b</code> y ejecuta módulos interactivamente en todos los nodos simultáneamente para diagnosticar y mitigar el problema en tiempo real, sin necesidad de escribir un playbook de emergencia.',
    quiz: [
      {
        question: '¿Qué comando dentro de la consola de ansible-console cambia el grupo de hosts objetivo?',
        options: ['switch <grupo>', 'cd <grupo>', 'use <grupo>', 'target <grupo>'],
        correctIndex: 1,
        explanation: 'Dentro de ansible-console, el comando cd <grupo> cambia el grupo de hosts sobre el que se ejecutan los módulos, de forma similar a navegar directorios en una shell.',
      },
      {
        question: '¿Cuál es el caso de uso principal de ansible-console respecto a los comandos ad-hoc regulares?',
        options: [
          'ansible-console es más rápido que ansible ad-hoc',
          'Permite ejecutar múltiples módulos interactivamente sin reescribir el comando completo cada vez',
          'ansible-console soporta más módulos que ansible ad-hoc',
          'Solo ansible-console puede usar become',
        ],
        correctIndex: 1,
        explanation: 'ansible-console mantiene el contexto de conexión y el grupo objetivo entre comandos. Ideal para sesiones de exploración o troubleshooting donde ejecutás varios módulos seguidos sin repetir flags.',
      },
      {
        question: '¿Qué información muestra el prompt de ansible-console como "[f:5]"?',
        options: [
          'El número de forks (conexiones paralelas) configurado',
          'El número de fallos en la última ejecución',
          'El número de facts cargados',
          'El número de archivos en el inventario',
        ],
        correctIndex: 0,
        explanation: 'El prompt de ansible-console muestra usuario@grupo (cantidad_hosts)[f:forks]. El "[f:5]" indica el número de forks paralelos configurado, equivalente al flag -f de ansible.',
      },
    ],
    troubleshooting: [
      {
        error: 'ansible-console: command not found',
        cause: 'ansible-console no está en el PATH o la instalación de Ansible no incluye todos los comandos CLI.',
        fix: 'Verificá la instalación con pip show ansible. En algunas distribuciones se instala como paquete separado. Probá pip install ansible para la instalación completa.',
      },
      {
        error: 'No hosts matched the pattern inside console',
        cause: 'Se ejecutó ansible-console con un grupo que no existe en el inventario o se omitió -i con el inventario correcto.',
        fix: 'Verificá los grupos disponibles con ansible-inventory --graph antes de abrir la consola. Asegurate de pasar -i inventario/ al iniciar ansible-console.',
      },
      {
        error: 'EOF when reading a line (consola se cierra inesperadamente)',
        cause: 'ansible-console recibió EOF en stdin, lo que ocurre cuando se intenta usar en pipelines o scripts no interactivos.',
        fix: 'ansible-console está diseñado solo para uso interactivo. Para scripts automatizados, usá comandos ansible ad-hoc normales en su lugar.',
      },
    ],
  }
];
