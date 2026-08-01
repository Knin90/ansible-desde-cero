import type { ModuleContent } from './types';

export const nivel3Modules: ModuleContent[] = [
  {
    levelId: 3,
    moduleId: 1,
    title: 'Inventario estático INI',
    objective: 'Dominar el formato INI para definir hosts, grupos, variables de host y variables de grupo en inventarios estáticos.',
    duration: '1.5 horas',
    objectives: [
      'Crear un inventario INI con hosts, grupos y grupos de grupos',
      'Definir variables inline de host y variables de grupo con :vars',
      'Usar rangos numéricos y alfabéticos para grupos de hosts regulares',
      'Verificar el inventario resultante con ansible-inventory --graph',
    ],
    prerequisites: [
      'Nivel 0 completo: instalación y configuración básica de Ansible',
      'Nivel 1 completo: comandos ad-hoc y estructura de playbooks',
    ],
    realWorldCase: 'Un equipo de operaciones gestiona 40 servidores divididos en web, base de datos y caché: con un inventario INI bien estructurado pueden lanzar actualizaciones solo al grupo correcto con un único comando, sin tocar el resto.',
    quiz: [
      {
        question: '¿Qué sintaxis se usa en un inventario INI para definir variables comunes a todos los hosts de un grupo llamado "produccion"?',
        options: [
          '[produccion]',
          '[produccion:vars]',
          '[produccion:children]',
          '[produccion/vars]',
        ],
        correctIndex: 1,
        explanation: 'La sección [grupo:vars] es la forma correcta en formato INI para definir variables que aplican a todos los hosts de ese grupo. [grupo:children] define subgrupos, no variables.',
      },
      {
        question: '¿Qué expande el rango web[01:03].empresa.com en un inventario INI?',
        options: [
          'web01.empresa.com y web03.empresa.com únicamente',
          'web0.empresa.com, web1.empresa.com, web2.empresa.com y web3.empresa.com',
          'web01.empresa.com, web02.empresa.com y web03.empresa.com',
          'web1.empresa.com, web2.empresa.com y web3.empresa.com',
        ],
        correctIndex: 2,
        explanation: 'Los rangos numéricos en Ansible son inclusivos en ambos extremos. [01:03] genera 01, 02 y 03, manteniendo el padding de ceros, resultando en web01, web02 y web03.',
      },
      {
        question: '¿Qué hace la sección [produccion:children] en un inventario INI?',
        options: [
          'Define variables heredadas por los hijos de produccion',
          'Lista los hosts hijos del grupo produccion',
          'Define qué grupos forman parte del grupo produccion',
          'Crea subgrupos automáticamente a partir de produccion',
        ],
        correctIndex: 2,
        explanation: '[grupo:children] declara qué otros grupos son miembros del grupo padre. Los hosts de esos grupos heredan las variables de [grupo:vars] y Ansible los incluye al hacer plays contra ese grupo.',
      },
    ],
    troubleshooting: [
      {
        error: 'ERROR! No inventory was parsed, only implicit localhost is available',
        cause: 'Ansible no encuentra el archivo de inventario porque la ruta es incorrecta o no se pasó con -i.',
        fix: 'Verificar con ansible-inventory -i ruta/al/inventario.ini --list. Si el archivo existe, comprobar que ansible.cfg tenga inventory = inventario/hosts.ini en la sección [defaults].',
      },
      {
        error: 'El host aparece en el grupo incorrecto o no aparece en ningún grupo',
        cause: 'Error tipográfico en el nombre del grupo o el hostname está definido fuera de cualquier sección de grupo (va a "ungrouped").',
        fix: 'Ejecutar ansible-inventory -i hosts.ini --graph para ver la estructura real. Los hosts sin sección de grupo quedan en [ungrouped] — moverlos a la sección correcta.',
      },
      {
        error: 'Las variables inline del host no están siendo usadas: se usa el valor del grupo',
        cause: 'Las variables de grupo definidas en el playbook con vars: sobreescriben las variables de inventario porque tienen mayor precedencia.',
        fix: 'Verificar con ansible -i hosts.ini web1 -m debug -a "var=nombre_variable". Las variables inline de host (inventario) tienen baja precedencia: moverlas a host_vars/ o usar -e para forzar el valor.',
      },
    ],
    steps: [
      {
        title: 'Formato INI — estructura básica',
        body: `
          <p>El formato INI es el más antiguo y el más utilizado para inventarios pequeños. Es simple: cada línea es un host, los grupos se definen con <code>[nombre-grupo]</code>.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">inventario/hosts.ini</span></div>
            <pre class="language-ini"><code class="language-ini"># Hosts sin grupo (van al grupo "ungrouped")
bastion.empresa.com

# Grupo de servidores web
[servidores_web]
web1.empresa.com
web2.empresa.com ansible_port=2222 http_port=80

# Grupo de bases de datos
[bases_de_datos]
db1.empresa.com ansible_user=postgres
db2.empresa.com ansible_host=192.168.1.50

# Grupo padre que agrupa otros grupos
[produccion:children]
servidores_web
bases_de_datos

# Variables para todos los hosts del grupo produccion
[produccion:vars]
env=produccion
ansible_python_interpreter=/usr/bin/python3</code></pre>
          </div>
        `
      },
      {
        title: 'Variables de host inline',
        body: `
          <p>Podés definir variables directamente en la línea del host. Estas tienen alta precedencia sobre variables de grupo. Son útiles para diferencias específicas por host.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">inventario/hosts-con-vars.ini</span></div>
            <pre class="language-ini"><code class="language-ini">[servidores_web]
web1.empresa.com ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/web1_rsa
web2.empresa.com ansible_user=centos ansible_port=2222 nginx_workers=8
web3.empresa.com ansible_host=10.0.1.30  # IP privada, hostname público

[bases_de_datos]
# Usar alias en lugar del hostname real
db-primaria ansible_host=db1.interno.empresa.com ansible_user=deploy
db-replica   ansible_host=db2.interno.empresa.com ansible_user=deploy</code></pre>
          </div>
        `
      },
      {
        title: 'Rangos y patrones',
        body: `
          <p>Ansible soporta rangos numéricos y alfabéticos en los hostnames, lo que ahorra mucho escribir para grupos de máquinas con nombres regulares.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">inventario/hosts-rangos.ini</span></div>
            <pre class="language-ini"><code class="language-ini">[servidores_web]
# Expande a: web01, web02, ..., web10
web[01:10].empresa.com

[bases_de_datos]
# Expande a: db-a, db-b, db-c
db-[a:c].empresa.com

[servidores_kafka]
# Con paso de 2: kafka01, kafka03, kafka05
kafka[01:05:2].empresa.com</code></pre>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">Inventario estático YAML</div>
              <div class="next-chapter-desc">El formato YAML permite variables complejas (listas, diccionarios) imposibles en INI, y es más claro para inventarios grandes.</div>
            </div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 3,
    moduleId: 2,
    title: 'Inventario estático YAML',
    objective: 'Aprender el formato YAML para inventarios, más expresivo y estructurado que INI para inventarios complejos.',
    duration: '1 hora',
    prerequisites: [
      'Nivel 3, Módulo 1: Inventario estático INI (estructura de grupos y variables)',
      'Sintaxis YAML básica: listas, diccionarios y anidamiento',
    ],
    realWorldCase: 'Al incorporar el inventario a un repositorio Git con revisión de código, el formato YAML es preferido porque los IDEs pueden validarlo en tiempo real y los pull requests muestran diffs más legibles que el formato INI.',
    quiz: [
      {
        question: '¿Cuál es la clave correcta en YAML para definir grupos hijos dentro de un grupo padre?',
        options: [
          'subgroups:',
          'members:',
          'children:',
          'groups:',
        ],
        correctIndex: 2,
        explanation: 'En el formato YAML de inventario Ansible, "children:" es la clave reservada para definir subgrupos dentro de un grupo padre, equivalente a la sección [grupo:children] del formato INI.',
      },
      {
        question: '¿Qué ventaja tiene el formato YAML de inventario sobre el formato INI para las variables?',
        options: [
          'Las variables YAML tienen mayor precedencia que las INI',
          'YAML permite variables complejas como listas y diccionarios; INI solo soporta strings',
          'YAML es más rápido de procesar por Ansible',
          'En YAML no es necesario definir secciones de grupos',
        ],
        correctIndex: 1,
        explanation: 'El formato INI solo soporta pares clave=valor con strings simples. YAML permite listas (- elemento) y diccionarios anidados como valores de variables, lo que es imposible en INI.',
      },
      {
        question: 'En un inventario YAML, ¿dónde se definen las variables del grupo "servidores_web"?',
        options: [
          'Bajo la clave "all.servidores_web.variables:"',
          'Bajo la clave "vars:" dentro de "servidores_web:"',
          'En un archivo separado obligatoriamente',
          'Bajo la clave "group_vars:" al nivel de "all:"',
        ],
        correctIndex: 1,
        explanation: 'En el inventario YAML, las variables de un grupo se definen bajo la clave "vars:" anidada directamente dentro de ese grupo. Esto es equivalente a la sección [grupo:vars] del formato INI.',
      },
    ],
    troubleshooting: [
      {
        error: 'ERROR! Syntax Error while loading YAML filename, found character that cannot start any token',
        cause: 'El archivo de inventario YAML contiene tabs (tabulaciones) en lugar de espacios, o tiene caracteres especiales sin escapar.',
        fix: 'Configurar el editor para usar espacios en lugar de tabs y validar el YAML con: python3 -c "import yaml; yaml.safe_load(open(\'hosts.yml\'))" antes de ejecutar Ansible.',
      },
      {
        error: 'Los hosts del inventario YAML no aparecen al hacer ansible-inventory --list',
        cause: 'La estructura YAML no tiene el nivel raíz "all:" requerido, o los hosts están definidos bajo "hosts:" pero sin el nivel de grupo correcto.',
        fix: 'Todo inventario YAML debe comenzar con "all:" como raíz. Los hosts van bajo "all.hosts:" o bajo "all.children.<grupo>.hosts:". Verificar con ansible-inventory -i hosts.yml --graph.',
      },
      {
        error: 'Las variables con listas o diccionarios no se aplican correctamente',
        cause: 'Al mezclar inventario INI y YAML, se intenta usar sintaxis de lista YAML en un archivo INI, lo cual no es válido.',
        fix: 'Las variables complejas (listas, diccionarios) solo son posibles en archivos YAML: inventario YAML, group_vars/*.yml o host_vars/*.yml. Migrar ese host o grupo a un archivo YAML.',
      },
    ],
    objectives: [
      'Escribir un inventario YAML equivalente a un inventario INI existente',
      'Definir variables complejas (listas y diccionarios) en el inventario YAML',
      'Estructurar grupos padre e hijo con children en YAML',
      'Elegir entre formato INI y YAML según la complejidad del proyecto',
    ],
    steps: [
      {
        title: 'Formato YAML — estructura equivalente a INI',
        body: `
          <p>El formato YAML para inventarios es más verboso pero también más claro para inventarios con muchas variables o jerarquías de grupos complejas. Es el formato recomendado para inventarios que serán versionados en Git.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">inventario/hosts.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">all:
  vars:
    ansible_python_interpreter: /usr/bin/python3
    empresa: "Mi Empresa SA"

  children:
    servidores_web:
      vars:
        http_port: 80
        https_port: 443
      hosts:
        web1.empresa.com:
          ansible_user: ubuntu
          nginx_workers: 4
        web2.empresa.com:
          ansible_user: ubuntu
          ansible_port: 2222

    bases_de_datos:
      hosts:
        db1.empresa.com:
          ansible_user: postgres
          pg_max_connections: 200
        db2.empresa.com:
          ansible_user: postgres
          ansible_host: 192.168.1.50

    produccion:
      children:
        servidores_web:
        bases_de_datos:
      vars:
        env: produccion</code></pre>
          </div>
        `
      },
      {
        title: 'Ventajas del formato YAML',
        body: `
          <ul>
            <li><strong>Variables complejas</strong>: soporta listas y diccionarios como valores de variables, imposible en INI</li>
            <li><strong>Estructura explícita</strong>: la jerarquía de grupos es inmediatamente visible</li>
            <li><strong>Validación</strong>: los errores de sintaxis son más fáciles de detectar</li>
            <li><strong>Tooling</strong>: IDEs con soporte YAML dan autocompletado y validación</li>
          </ul>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">inventario/hosts-vars-complejas.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">all:
  children:
    servidores_web:
      hosts:
        web1.empresa.com:
          # Variables complejas: imposibles en formato INI
          nginx_server_names:
            - app.empresa.com
            - www.empresa.com
          ssl_certificates:
            - cert: /etc/ssl/certs/app.crt
              key: /etc/ssl/private/app.key</code></pre>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">Inventario dinámico</div>
              <div class="next-chapter-desc">En entornos cloud donde los hosts cambian constantemente, el inventario dinámico genera la lista automáticamente desde AWS, Azure o GCP.</div>
            </div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 3,
    moduleId: 3,
    title: 'Inventario dinámico',
    objective: 'Entender cómo funciona el inventario dinámico y cómo usar inventory plugins para obtener hosts automáticamente de proveedores cloud.',
    duration: '2 horas',
    prerequisites: [
      'Nivel 3, Módulo 2: Inventario estático YAML (estructura y formato)',
      'Credenciales de AWS configuradas (aws configure) o variables de entorno AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY',
      'Colección amazon.aws instalada: ansible-galaxy collection install amazon.aws',
    ],
    realWorldCase: 'Un equipo de plataforma gestiona un clúster de Kubernetes en AWS con instancias EC2 que escalan automáticamente: el inventory plugin de EC2 descubre y agrupa las instancias por tag de entorno en cada ejecución, eliminando la necesidad de actualizar el inventario manualmente tras cada escalado.',
    quiz: [
      {
        question: '¿Cuál es la diferencia principal entre un script de inventario (legacy) y un inventory plugin (moderno)?',
        options: [
          'Los scripts son más rápidos; los plugins consumen más memoria',
          'Los scripts son ejecutables externos que devuelven JSON; los plugins son módulos Python integrados en Ansible',
          'Los scripts solo funcionan con AWS; los plugins funcionan con cualquier proveedor',
          'Los plugins requieren Python 3.9+; los scripts funcionan con cualquier versión',
        ],
        correctIndex: 1,
        explanation: 'Los scripts de inventario (legacy) son programas externos ejecutables que Ansible lanza y captura su salida JSON. Los inventory plugins son módulos Python nativos dentro de Ansible, más integrados, con mejor manejo de errores y configuración declarativa en YAML.',
      },
      {
        question: '¿Qué hace la clave "keyed_groups" en la configuración del plugin aws_ec2?',
        options: [
          'Define qué campos de EC2 se usan como hostname del host',
          'Filtra las instancias por sus tags antes de agregarlas al inventario',
          'Crea grupos dinámicos automáticamente basados en valores de tags u otros atributos de EC2',
          'Mapea claves SSH a grupos de hosts',
        ],
        correctIndex: 2,
        explanation: 'keyed_groups toma un atributo de la instancia EC2 (como tags.Env o tags.Role) y crea automáticamente un grupo por cada valor único encontrado. Por ejemplo, si tags.Env tiene valores "produccion" y "staging", crea los grupos env_produccion y env_staging.',
      },
      {
        question: '¿Cómo combina Ansible múltiples inventarios (estático + dinámico) en una sola ejecución?',
        options: [
          'Solo se puede usar un inventario a la vez; hay que elegir uno',
          'Apuntando -i a un directorio, Ansible carga y combina todos los archivos de inventario que encuentra en él',
          'Usando la directiva include_inventory: en ansible.cfg',
          'Con el argumento --merge-inventories en la línea de comandos',
        ],
        correctIndex: 1,
        explanation: 'Cuando se pasa un directorio con -i inventario/ (o se configura en ansible.cfg), Ansible carga todos los archivos de inventario válidos en ese directorio y los combina automáticamente, unificando grupos y variables de todas las fuentes.',
      },
    ],
    troubleshooting: [
      {
        error: 'ERROR! Specified inventory directory inventario/ is not a directory or cannot be read',
        cause: 'El directorio de inventario no existe o hay un error de permisos. También ocurre si se pasa una ruta con slash final que el sistema no resuelve.',
        fix: 'Verificar que el directorio existe con ls -la inventario/ y que el usuario tiene permisos de lectura. Probar sin slash final: -i inventario.',
      },
      {
        error: 'botocore.exceptions.NoCredentialsError: Unable to locate credentials',
        cause: 'El plugin de AWS EC2 no encuentra las credenciales de AWS. No están configuradas en ~/.aws/credentials ni como variables de entorno.',
        fix: 'Ejecutar "aws configure" para configurar credenciales, o exportar AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY antes de ejecutar Ansible. Verificar con "aws sts get-caller-identity".',
      },
      {
        error: 'El inventario dinámico no descubre ningún host aunque existen instancias EC2',
        cause: 'El filtro "instance-state-name: running" en el plugin excluye instancias detenidas, o las instancias están en una región no listada en "regions:".',
        fix: 'Verificar las regiones configuradas y el estado de las instancias en la consola de AWS. Ampliar el filtro o agregar la región correcta en la lista "regions:" del archivo aws_ec2.yml.',
      },
    ],
    objectives: [
      'Configurar el inventory plugin de AWS EC2 para obtener hosts automáticamente',
      'Agrupar hosts dinámicos por tags con keyed_groups',
      'Combinar inventarios estáticos y dinámicos en un único directorio',
      'Depurar el resultado del plugin con ansible-inventory --list',
    ],
    steps: [
      {
        title: 'Qué es y por qué usarlo',
        body: `
          <p>Un inventario dinámico genera la lista de hosts en tiempo de ejecución consultando una fuente externa: AWS, Azure, GCP, VMware, Proxmox, una base de datos, Netbox. Es esencial en entornos cloud donde las instancias se crean y destruyen constantemente.</p>
          <p>Ansible soporta dos mecanismos: <strong>scripts de inventario</strong> (legacy) que son ejecutables que devuelven JSON, y <strong>inventory plugins</strong> (moderno) que son módulos Python integrados en Ansible.</p>
        `
      },
      {
        title: 'Inventory Plugin de AWS EC2',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">inventario/aws_ec2.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">plugin: amazon.aws.aws_ec2
regions:
  - us-east-1
  - us-west-2

# Filtrar solo instancias en estado running
filters:
  instance-state-name: running

# Agrupar por tags
keyed_groups:
  - key: tags.Env
    prefix: env
  - key: tags.Role
    prefix: role

# Usar el hostname público
hostnames:
  - public-dns-name
  - private-dns-name

# Variables extra por host
compose:
  ansible_host: public_ip_address
  ansible_user: "'ubuntu'"</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">usar-inventario-dinamico.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Ver qué hosts descubre el plugin
ansible-inventory -i inventario/aws_ec2.yml --list

# Ejecutar playbook con inventario dinámico
ansible-playbook -i inventario/aws_ec2.yml sitio.yml</code></pre>
          </div>
        `
      },
      {
        title: 'Combinar inventarios estáticos y dinámicos',
        body: `
          <p>Ansible puede combinar múltiples inventarios. Apuntás a un directorio y carga todos los archivos de inventario que encuentra.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">inventario-multiple.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Estructura del directorio de inventarios
inventario/
├── hosts.yml          # Hosts estáticos (bare-metal)
├── aws_ec2.yml        # Plugin AWS EC2
└── group_vars/
    ├── all.yml        # Variables para todos
    └── servidores_web.yml

# Ansible combina todos automáticamente
ansible-playbook -i inventario/ sitio.yml</code></pre>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">Variables de inventario</div>
              <div class="next-chapter-desc">Organizás las variables de hosts y grupos en los directorios host_vars y group_vars para mantener el inventario limpio y escalable.</div>
            </div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 3,
    moduleId: 4,
    title: 'Variables de inventario — host_vars y group_vars',
    objective: 'Dominar la organización de variables de inventario usando los directorios host_vars y group_vars.',
    duration: '1.5 horas',
    prerequisites: [
      'Nivel 3, Módulo 3: Inventario dinámico (estructura de directorios de inventario)',
      'Nivel 2: Roles y estructura de proyectos Ansible',
    ],
    realWorldCase: 'En un proyecto con 15 servidores web idénticos pero con diferente cantidad de CPUs, group_vars/servidores_web.yml define la configuración común de nginx y cada host_vars/webN.yml sobreescribe solo nginx_worker_processes con el valor correcto para ese servidor.',
    quiz: [
      {
        question: '¿Dónde busca Ansible los directorios group_vars y host_vars automáticamente?',
        options: [
          'Solo en /etc/ansible/',
          'Solo junto al archivo de inventario',
          'Junto al archivo de inventario Y junto al playbook que se está ejecutando',
          'Solo en el directorio actual donde se ejecuta ansible-playbook',
        ],
        correctIndex: 2,
        explanation: 'Ansible busca group_vars/ y host_vars/ en dos lugares: junto al archivo/directorio de inventario, y junto al playbook. Esto permite tener variables globales del inventario y variables específicas del playbook sin conflictos.',
      },
      {
        question: '¿Qué ventaja tiene crear un directorio host_vars/web1.empresa.com/ en lugar de un archivo host_vars/web1.empresa.com.yml?',
        options: [
          'El directorio tiene mayor precedencia que el archivo',
          'Permite separar variables normales (vars.yml) de variables encriptadas (vault.yml) en archivos distintos',
          'Ansible procesa los directorios más rápido que los archivos individuales',
          'Es la única forma de que las variables de host sobreescriban las de grupo',
        ],
        correctIndex: 1,
        explanation: 'Usar un directorio permite dividir las variables en múltiples archivos dentro de él. El patrón más común es vars.yml para variables en texto plano y vault.yml para secretos encriptados con ansible-vault, manteniendo los secretos separados del código normal.',
      },
      {
        question: '¿Qué ocurre cuando la misma variable está definida en group_vars/servidores_web.yml y en host_vars/web1.empresa.com.yml?',
        options: [
          'Ansible lanza un error por variable duplicada',
          'El valor de group_vars gana porque los grupos tienen mayor precedencia',
          'El valor de host_vars gana porque las variables de host tienen mayor precedencia que las de grupo',
          'Ansible usa el valor que encuentre primero alfabéticamente',
        ],
        correctIndex: 2,
        explanation: 'Las variables de host siempre tienen mayor precedencia que las variables de grupo en Ansible. Un valor en host_vars/ sobreescribe el mismo nombre de variable definido en group_vars/, lo que permite customizaciones por host sin duplicar toda la configuración.',
      },
    ],
    troubleshooting: [
      {
        error: 'Las variables de group_vars no se aplican aunque el archivo existe',
        cause: 'El nombre del archivo en group_vars/ no coincide exactamente con el nombre del grupo en el inventario (diferencia de mayúsculas, guiones vs guiones bajos).',
        fix: 'Verificar que group_vars/nombre_grupo.yml use exactamente el mismo nombre que aparece en el inventario. Ansible es case-sensitive: "Servidores_Web" y "servidores_web" son grupos distintos.',
      },
      {
        error: 'ansible-vault encrypted variables are not being decrypted',
        cause: 'El archivo vault.yml dentro de host_vars/ o group_vars/ está encriptado pero no se proporcionó la contraseña del vault al ejecutar Ansible.',
        fix: 'Agregar --ask-vault-pass o --vault-password-file ~/.vault_pass al comando ansible-playbook. También configurar vault_password_file en ansible.cfg para evitar especificarlo cada vez.',
      },
      {
        error: 'Las variables de host_vars no se ven cuando el host se descubre por inventario dinámico',
        cause: 'El nombre usado como clave en host_vars/ no coincide con el hostname que asigna el plugin dinámico. Los plugins suelen usar el ID de instancia o el DNS público.',
        fix: 'Ejecutar ansible-inventory --list para ver el hostname exacto que asigna el plugin. Renombrar el archivo en host_vars/ para que coincida, o usar la clave "hostnames:" en el plugin para controlar qué se usa como nombre.',
      },
    ],
    objectives: [
      'Estructurar variables en group_vars/all.yml, group_vars/<grupo>.yml y host_vars/',
      'Separar variables normales de variables encriptadas con vault en archivos distintos',
      'Sobrescribir variables de grupo con variables de host para casos específicos',
      'Verificar el valor final de una variable con ansible -m debug',
    ],
    steps: [
      {
        title: 'Directorios host_vars y group_vars',
        body: `
          <p>En lugar de poner todas las variables en el archivo de inventario, podés usar directorios <code>host_vars/</code> y <code>group_vars/</code>. Ansible los busca automáticamente junto al inventario o al playbook.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">estructura-vars.sh</span></div>
            <pre class="language-bash"><code class="language-bash">inventario/
├── hosts.yml
├── group_vars/
│   ├── all.yml              # Variables para TODOS los hosts
│   ├── all/                 # Alternativa: directorio con múltiples archivos
│   │   ├── vars.yml
│   │   └── vault.yml        # Variables encriptadas con ansible-vault
│   ├── servidores_web.yml   # Variables para el grupo servidores_web
│   └── bases_de_datos.yml
└── host_vars/
    ├── web1.empresa.com.yml # Variables específicas para web1
    └── db1.empresa.com/
        ├── vars.yml
        └── vault.yml</code></pre>
          </div>
        `
      },
      {
        title: 'Ejemplo de group_vars y host_vars',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">inventario/group_vars/servidores_web.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Variables comunes para todos los servidores web
ansible_user: ubuntu
http_port: 80
https_port: 443
nginx_worker_processes: auto
nginx_worker_connections: 1024
ssl_cert_dir: /etc/ssl/certs/empresa
log_dir: /var/log/nginx</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">inventario/host_vars/web1.empresa.com.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Variables SOLO para web1 — sobreescriben las del grupo
nginx_worker_processes: 4    # Este servidor tiene más CPUs
backup_enabled: true
backup_schedule: "0 2 * * *"</code></pre>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">Precedencia de variables</div>
              <div class="next-chapter-desc">Cuando la misma variable está definida en varios lugares, Ansible aplica una jerarquía de 16 niveles para decidir qué valor gana.</div>
            </div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 3,
    moduleId: 5,
    title: 'Precedencia de variables en el inventario',
    objective: 'Entender el orden de precedencia completo de las variables de inventario para predecir qué valor ganará cuando hay conflictos.',
    duration: '1 hora',
    prerequisites: [
      'Nivel 3, Módulo 4: Variables de inventario — host_vars y group_vars',
      'Nivel 2: Variables en playbooks (vars:, set_fact, register)',
    ],
    realWorldCase: 'Un equipo descubre que los despliegues a producción usan el puerto 80 en lugar del 443 esperado: el debug revela que una variable http_port definida en vars: del play sobreescribe la de group_vars, un clásico conflicto de precedencia que cuesta horas diagnosticar sin conocer la jerarquía.',
    quiz: [
      {
        question: '¿Qué fuente de variables tiene la mayor precedencia en Ansible, por encima de cualquier otra?',
        options: [
          'Variables definidas en roles (roles/myrole/vars/main.yml)',
          'Variables de host en host_vars/',
          'Extra vars pasadas con -e en la línea de comandos',
          'Variables definidas con set_fact en una tarea',
        ],
        correctIndex: 2,
        explanation: 'Las extra vars (-e) tienen la máxima precedencia en Ansible, por encima de todo: roles, set_fact, host_vars, group_vars, y cualquier otra fuente. Esto las hace útiles para overrides de emergencia pero peligrosas si se usan habitualmente.',
      },
      {
        question: 'Cuando la misma variable está definida en group_vars/all.yml y en group_vars/servidores_web.yml, ¿qué valor usa un host del grupo servidores_web?',
        options: [
          'El de group_vars/all.yml porque "all" siempre tiene mayor precedencia',
          'El de group_vars/servidores_web.yml porque los grupos específicos tienen mayor precedencia que "all"',
          'Ansible lanza un error por ambigüedad',
          'El primero que encuentra alfabéticamente',
        ],
        correctIndex: 1,
        explanation: 'En la jerarquía de Ansible, los grupos específicos (hijos) tienen mayor precedencia que el grupo "all". Un host en "servidores_web" usará el valor de group_vars/servidores_web.yml, que sobreescribe el de group_vars/all.yml para ese grupo.',
      },
      {
        question: '¿Cuál es la forma correcta de verificar qué valor tiene una variable específica en un host concreto, considerando todas las fuentes?',
        options: [
          'cat inventario/group_vars/servidores_web.yml',
          'ansible -i inventario/ web1 -m debug -a "var=nombre_variable"',
          'ansible-playbook sitio.yml --check --diff',
          'grep -r nombre_variable inventario/',
        ],
        correctIndex: 1,
        explanation: 'El módulo debug con var= es la forma definitiva: Ansible resuelve la variable aplicando toda la jerarquía de precedencia y muestra el valor final que usaría para ese host. cat o grep muestran solo lo que hay en un archivo, sin considerar sobreescrituras.',
      },
    ],
    troubleshooting: [
      {
        error: 'Una variable tiene un valor incorrecto en producción pero correcto en staging; ambos usan el mismo playbook',
        cause: 'Una variable está definida en múltiples fuentes con valores distintos. En producción, una fuente de mayor precedencia (como vars: en el play o un rol) sobreescribe el valor esperado de group_vars.',
        fix: 'Ejecutar ansible -i inventario/ host_produccion -m debug -a "var=nombre_variable" para ver el valor final. Luego buscar en qué fuente se define con el valor incorrecto y eliminar esa definición o corregirla.',
      },
      {
        error: 'ansible_user es diferente en distintos hosts del mismo grupo aunque está definido en group_vars',
        cause: 'Algunos hosts tienen ansible_user definido inline en el inventario o en host_vars/, lo que tiene mayor precedencia que group_vars.',
        fix: 'Buscar definiciones de ansible_user en el inventario INI/YAML inline y en los archivos host_vars/ de esos hosts. Eliminar las definiciones redundantes o asegurarse de que los valores sean consistentes.',
      },
      {
        error: 'Se usa -e para forzar un valor pero el playbook sigue usando el valor anterior',
        cause: 'El nombre de la variable en -e no coincide exactamente con el usado en el playbook (diferencia de mayúsculas, guiones vs guiones bajos).',
        fix: 'Ansible es case-sensitive: http_port y HTTP_PORT son variables distintas. Verificar el nombre exacto con ansible -m debug -a "var=hostvars[inventory_hostname]" y usarlo idéntico en -e.',
      },
    ],
    objectives: [
      'Enumerar los 16 niveles de precedencia de variables de Ansible en orden',
      'Predecir qué valor ganará cuando la misma variable está en group_vars y host_vars',
      'Usar -e para forzar un valor por encima de cualquier otra fuente',
      'Depurar conflictos de variables con ansible -m debug -a "var=nombre_var"',
    ],
    steps: [
      {
        title: 'Precedencia completa (menor a mayor)',
        body: `
          <p>Ansible tiene más de 20 lugares donde se pueden definir variables. La precedencia determina qué valor gana cuando la misma variable está definida en múltiples lugares. De menor a mayor precedencia:</p>
          <ol>
            <li>Variables del grupo <code>all</code> (command line o inventario)</li>
            <li>Variables de grupo padre</li>
            <li>Variables de grupo hijo</li>
            <li>Variables de host en el inventario</li>
            <li><code>host_vars/</code> del directorio de inventario</li>
            <li><code>group_vars/</code> del directorio del playbook</li>
            <li><code>host_vars/</code> del directorio del playbook</li>
            <li>Facts recolectados por <code>gather_facts</code></li>
            <li>Variables del play (<code>vars:</code>)</li>
            <li>Variables de rol (<code>roles/myrole/vars/main.yml</code>)</li>
            <li>Variables de bloque (<code>block: vars:</code>)</li>
            <li>Variables de tarea (<code>task: vars:</code>)</li>
            <li>Variables de <code>include_vars</code></li>
            <li>Variables registradas con <code>register:</code></li>
            <li><code>set_fact</code> / <code>cached</code></li>
            <li><strong>Extra vars</strong> (<code>-e</code>) — la mayor precedencia siempre</li>
          </ol>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Regla de oro:</strong> si querés forzar un valor sin importar nada más, usá <code>-e variable=valor</code>. Si querés un valor por defecto que puede ser sobreescrito, ponelo en <code>group_vars/all.yml</code>.</div>
          </div>
        `
      },
      {
        title: 'Verificar precedencia en práctica',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">debug-precedencia.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Ver todas las variables de un host (incluye fuente)
ansible -i inventario/ web1.empresa.com -m debug -a "var=hostvars['web1.empresa.com']"

# La -e siempre gana
ansible-playbook sitio.yml -e "http_port=9090"

# Ver el valor final de una variable específica
ansible -i inventario/ web1.empresa.com -m debug -a "var=http_port"</code></pre>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">Nivel 4 — Comandos CLI</div>
              <div class="next-chapter-desc">Con el inventario dominado, explorás todas las herramientas de línea de comandos: ansible, ansible-playbook, ansible-vault y más.</div>
            </div>
          </div>
        `
      }
    ]
  }
];
