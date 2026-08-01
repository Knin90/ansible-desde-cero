import type { ModuleContent } from '../types';

export const nivel13Mod5: ModuleContent =   {
levelId: 13,
moduleId: 5,
title: 'Inventory Plugins',
objective: 'Configurar inventory plugins para generar inventarios dinámicos desde fuentes externas como AWS EC2, Azure, GCP, y usar el plugin constructed para enriquecer inventarios estáticos.',
duration: '2 horas',
objectives: [
  'Entender la diferencia entre scripts de inventario dinámico (legacy) y inventory plugins (moderno)',
  'Configurar el plugin aws_ec2 para obtener hosts de AWS',
  'Agrupar automáticamente hosts por tags usando keyed_groups',
  'Usar el plugin constructed para crear grupos dinámicos basados en facts',
  'Combinar múltiples fuentes de inventario en un solo directorio',
],
prerequisites: [
  'Conocer inventarios estáticos YAML/INI de Ansible (Nivel 2)',
  'Tener acceso a alguna fuente de infraestructura dinámica (AWS, GCP, Azure)',
],
steps: [
  {
    title: 'Inventory plugins — el modelo moderno de inventarios dinámicos',
    body: `
      <p>Antes de Ansible 2.4, los inventarios dinámicos eran scripts Python que devolvían JSON. Los inventory plugins son el modelo moderno: archivos YAML declarativos con extensiones específicas.</p>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Un inventario dinámico es como una guía telefónica automática: en lugar de escribir a mano todos los números (inventario estático), el sistema consulta el directorio de la empresa (AWS, Azure, GCP) y genera la lista actualizada en tiempo real cada vez que la necesitás.</p>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
        <pre class="language-yaml"><code class="language-yaml">[inventory]
# Plugins habilitados — Ansible los prueba en orden
# El plugin "auto" detecta automáticamente cuál usar basándose en el campo "plugin:"
enable_plugins = host_list, yaml, ini, auto, amazon.aws.aws_ec2, google.cloud.gcp_compute

[defaults]
# Directorio de inventario — puede contener múltiples fuentes
inventory = ./inventory/</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">inventario-comandos.sh</span></div>
        <pre class="language-yaml"><code class="language-yaml"># Ver todos los inventory plugins disponibles
ansible-doc -t inventory -l

# Ver documentación de un plugin específico
ansible-doc -t inventory amazon.aws.aws_ec2
ansible-doc -t inventory ansible.builtin.constructed

# Verificar qué genera tu inventario
ansible-inventory -i inventory/ --list
ansible-inventory -i inventory/ --graph
ansible-inventory -i inventory/ --host nombre-instancia</code></pre>
      </div>
    `
  },
  {
    title: 'Plugin aws_ec2 — inventario dinámico desde AWS',
    body: `
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">inventory/aws_produccion.aws_ec2.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml"># El nombre del archivo DEBE terminar en aws_ec2.yml o aws_ec2.yaml
# para que Ansible reconozca qué plugin usar
plugin: amazon.aws.aws_ec2

# Regiones a consultar
regions:
  - us-east-1
  - sa-east-1

# Filtrar instancias: solo las de producción que están corriendo
filters:
  tag:Environment: produccion
  instance-state-name: running
  # Múltiples valores para el mismo filtro (OR):
  # instance-type: [m5.large, m5.xlarge, c5.large]

# Cómo nombrar los hosts (en orden de preferencia)
hostnames:
  - tag:Name           # Primero intenta usar el tag Name
  - private-dns-name   # Si no tiene tag Name, usa el DNS privado
  - private-ip-address # Fallback final

# Qué IP/hostname usar para conectarse
# Usá private si corrés Ansible desde dentro de la VPC
# Usá public si corrés desde fuera
compose:
  ansible_host: private_ip_address

# Crear grupos automáticamente basados en valores de tags
keyed_groups:
  # Grupo por rol: role_webserver, role_database, role_cache
  - key: tags.Role
prefix: role
separator: "_"

  # Grupo por entorno: env_produccion, env_staging
  - key: tags.Environment
prefix: env
separator: "_"

  # Grupo por tipo de instancia: instance_m5_large
  - key: instance_type
prefix: instance
separator: "_"

# Variables adicionales basadas en condiciones
compose:
  ansible_user: "'ec2-user' if 'amazon' in platform_details.lower() else 'ubuntu'"
  ansible_python_interpreter: /usr/bin/python3

# Cachear el inventario para evitar llamadas a la API en cada tarea
cache: true
cache_plugin: jsonfile
cache_timeout: 3600  # 1 hora
cache_connection: /tmp/ansible_aws_cache</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Autenticación AWS:</strong> El plugin aws_ec2 usa las credenciales de AWS configuradas en el nodo de control. Podés usar variables de entorno (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY), el archivo ~/.aws/credentials, o un IAM Role si estás en una instancia EC2.</div>
      </div>
    `
  },
  {
    title: 'Plugin constructed — enriquecer inventarios con lógica',
    body: `
      <p>El plugin <code>constructed</code> no genera hosts — los toma de otras fuentes y agrega grupos y variables dinámicamente basados en facts y variables existentes.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">inventory/grupos_construidos.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">plugin: ansible.builtin.constructed

# Crear grupos dinámicamente basados en variables o facts
groups:
  # Hosts que corren Ubuntu
  ubuntu: ansible_distribution == "Ubuntu"
  # Hosts con más de 4GB de RAM
  high_memory: ansible_memtotal_mb > 4096
  # Hosts en el grupo webservers Y en produccion
  prod_web: "'webservers' in group_names and entorno == 'produccion'"
  # Hosts con tag específico de AWS
  bd_cluster: "'db_cluster' in tags"

# Añadir o sobreescribir variables por condición
compose:
  # El usuario SSH varía según el OS
  ansible_user: "'ubuntu' if ansible_distribution == 'Ubuntu' else 'ec2-user'"
  # Puerto SSH varía según entorno
  ansible_port: "22 if entorno == 'produccion' else 2222"
  # Variables calculadas
  app_workers: "ansible_processor_vcpus * 2"

# Sección strictness: si es true, falla si una variable del compose no existe
strict: false</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">inventory/static_hosts.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml"># Inventario estático base (también en el directorio inventory/)
all:
  children:
webservers:
  hosts:
    web-01:
      ansible_host: 10.0.1.10
      entorno: produccion
    web-02:
      ansible_host: 10.0.1.11
      entorno: produccion
    web-dev:
      ansible_host: 192.168.1.10
      entorno: dev
dbservers:
  hosts:
    db-01:
      ansible_host: 10.0.2.10
      entorno: produccion</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Combinar fuentes:</strong> Podés tener en el directorio inventory/ archivos de inventario estático YAML, el plugin aws_ec2 para hosts en AWS, y el plugin constructed para agregar lógica de agrupamiento. Ansible los combina automáticamente.</div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'inventory plugin',
    definition: 'Componente moderno de Ansible para generar inventarios dinámicos mediante archivos YAML declarativos. Reemplaza a los scripts de inventario dinámico legacy. Se configura mediante archivos con extensiones específicas.',
  },
  {
    term: 'keyed_groups',
    definition: 'Sección de configuración de inventory plugins como aws_ec2 que crea grupos automáticamente basados en atributos de las instancias. Por ejemplo, key: tags.Role con prefix: role crea grupos role_webserver, role_database, etc.',
  },
  {
    term: 'plugin constructed',
    definition: 'Inventory plugin de Ansible que no descubre hosts sino que agrega grupos y variables dinámicamente a hosts ya existentes en el inventario, basándose en sus variables y facts.',
  },
  {
    term: 'compose',
    definition: 'Sección de configuración en inventory plugins que permite añadir o sobreescribir variables de host usando expresiones Jinja2. Útil para calcular ansible_user, ansible_host, y otras variables de conexión basadas en atributos del host.',
  },
],
quiz: [
  {
    question: '¿Cuál es la ventaja de los inventory plugins sobre los scripts de inventario dinámico legacy?',
    options: [
      'Los plugins son más rápidos porque están escritos en C',
      'Los plugins son archivos YAML declarativos, con caché integrado, documentación y configuración estándar',
      'Los plugins solo funcionan con AWS; los scripts con cualquier proveedor',
      'No hay diferencia práctica — es solo una cuestión de estilo',
    ],
    correctIndex: 1,
    explanation: 'Los inventory plugins modernos son archivos YAML declarativos que se configuran sin escribir código Python. Ofrecen caché integrado, documentación con ansible-doc, configuración estandarizada, y mejor integración con el sistema de variables de Ansible. Los scripts legacy requieren código Python, no tienen caché ni documentación estándar.',
  },
  {
    question: '¿Qué hace el plugin "constructed"?',
    options: [
      'Construye instancias en la nube automáticamente',
      'Combina múltiples archivos de inventario en uno',
      'Agrega grupos y variables dinámicamente a hosts ya existentes en el inventario',
      'Construye el inventario desde cero consultando todos los proveedores cloud',
    ],
    correctIndex: 2,
    explanation: 'El plugin constructed no descubre ni crea hosts — toma los hosts que ya existen en el inventario y los enriquece: crea grupos dinámicos basados en condiciones (entorno == "produccion"), y agrega/sobreescribe variables usando expresiones Jinja2. Es la solución para agregar lógica de agrupamiento sin modificar el inventario estático base.',
  },
  {
    question: '¿Para qué sirve keyed_groups en el plugin aws_ec2?',
    options: [
      'Para filtrar qué instancias incluir en el inventario',
      'Para crear grupos automáticamente basados en atributos de las instancias como tags',
      'Para definir qué usuario SSH usar',
      'Para ordenar los hosts del inventario',
    ],
    correctIndex: 1,
    explanation: 'keyed_groups genera grupos automáticamente usando el valor de un atributo de la instancia. Con key: tags.Role y prefix: role, si una instancia tiene el tag Role=webserver, se agrega automáticamente al grupo role_webserver. Esto elimina la necesidad de mantener manualmente la asignación host→grupo.',
  },
],
troubleshooting: [
  {
    error: 'ERROR! No inventory was parsed. Check your inventory source.',
    cause: 'El archivo de inventario del plugin no tiene la extensión correcta o el plugin no está habilitado en ansible.cfg.',
    fix: 'Para aws_ec2, el archivo debe terminar en aws_ec2.yml o aws_ec2.yaml. Verificá que enable_plugins en [inventory] incluye amazon.aws.aws_ec2. También podés usar el plugin auto con el campo plugin: en el archivo YAML.',
  },
  {
    error: 'botocore.exceptions.NoCredentialsError: Unable to locate credentials',
    cause: 'Las credenciales de AWS no están configuradas en el nodo de control.',
    fix: 'Configurá credenciales AWS: export AWS_ACCESS_KEY_ID=... AWS_SECRET_ACCESS_KEY=..., o creá ~/.aws/credentials, o usá un IAM Role si estás en EC2. Verificá con: aws sts get-caller-identity.',
  },
  {
    error: 'El inventario constructed no aplica los grupos definidos en groups:',
    cause: 'strict: true falla si alguna variable referenciada en la condición no existe para algunos hosts.',
    fix: 'Establecé strict: false para que hosts sin la variable simplemente no sean incluidos en el grupo. Alternatively, usá el filtro default en la condición: ansible_distribution | default("") == "Ubuntu".',
  },
],
realWorldCase: 'Una empresa con 500 instancias EC2 en múltiples regiones y entornos tenía un inventario estático de 800 líneas que se desactualizaba constantemente. Migraron a aws_ec2 plugin con keyed_groups por Environment, Role y Region. Ahora el inventario se genera automáticamente desde los tags de AWS, y agregar una nueva instancia solo requiere etiquetarla correctamente — el playbook la incluye en el grupo correcto sin ningún cambio manual.',
  };
