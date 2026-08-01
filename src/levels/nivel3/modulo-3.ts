import type { ModuleContent } from '../types';

export const nivel3Mod3: ModuleContent = {
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
};
