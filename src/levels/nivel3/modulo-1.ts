import type { ModuleContent } from '../types';

export const nivel3Mod1: ModuleContent = {
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
};
