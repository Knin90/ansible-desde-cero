import type { ModuleContent } from './types';

export const nivel3Modules: ModuleContent[] = [
  {
    levelId: 3,
    moduleId: 1,
    title: 'Inventario estático INI',
    objective: 'Dominar el formato INI para definir hosts, grupos, variables de host y variables de grupo en inventarios estáticos.',
    duration: '1.5 horas',
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
        `
      }
    ]
  }
];
