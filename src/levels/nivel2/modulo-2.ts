import type { ModuleContent } from '../types';

export const nivel2Mod2: ModuleContent = {
  levelId: 2,
  moduleId: 2,
  title: 'Inventory Engine — Cómo Ansible resuelve los hosts',
  objective: 'Entender cómo el Inventory Engine parsea, resuelve y combina múltiples fuentes de inventario para construir el contexto completo de cada host.',
  duration: '1.5 horas',
  objectives: [
    'Describir cómo el Inventory Engine construye el grafo de hosts y grupos',
    'Combinar múltiples fuentes de inventario (estático + cloud) en un solo directorio',
    'Inspeccionar variables resueltas de un host con ansible-inventory',
    'Entender el orden de merging de variables entre group_vars y host_vars',
  ],
  prerequisites: [
    'Nivel 2, Módulo 1: Flujo interno completo de Ansible',
  ],
  steps: [
    {
      title: 'Qué es el Inventory Engine',
      body: `
        <p>El Inventory Engine es el componente de Ansible que transforma tu inventario (un archivo INI, YAML, un script Python, o un plugin cloud) en un diccionario Python con todos los hosts, sus grupos, y sus variables.</p>
        <p>Puede combinar múltiples fuentes simultáneamente. Podés tener inventario estático para tus servidores bare-metal y un inventory plugin de AWS para tus instancias EC2, y Ansible los combina automáticamente.</p>
      `
    },
    {
      title: 'Resolución de grupos y hosts',
      body: `
        <p>El Inventory Engine construye un grafo de grupos. Todos los hosts pertenecen implícitamente al grupo <code>all</code>. Los grupos pueden anidarse con <code>:children</code> en INI o <code>children:</code> en YAML.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">inventario/hosts.ini</span></div>
          <pre class="language-ini"><code class="language-ini">[servidores_web]
web1.ejemplo.com
web2.ejemplo.com ansible_port=2222

[bases_de_datos]
db1.ejemplo.com ansible_user=postgres

[produccion:children]
servidores_web
bases_de_datos

[produccion:vars]
env=produccion
ansible_python_interpreter=/usr/bin/python3</code></pre>
        </div>
        <div class="tip-box">
          <span class="box-icon">💡</span>
          <div class="box-content"><strong>Tip:</strong> el grupo <code>ungrouped</code> contiene todos los hosts que no pertenecen a ningún grupo explícito. El grupo <code>all</code> siempre contiene todos los hosts.</div>
        </div>
      `
    },
    {
      title: 'Merging de variables',
      body: `
        <p>El Inventory Engine mergea variables de múltiples fuentes. La precedencia (de menor a mayor):</p>
        <ol>
          <li>Variables de grupo <code>all</code> (group_vars/all)</li>
          <li>Variables de grupo padre</li>
          <li>Variables de grupo hijo</li>
          <li>Variables de host en el inventario</li>
          <li>Variables en <code>host_vars/nombre-del-host/</code></li>
        </ol>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">verificar-variables.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Ver todas las variables de un host específico
ansible -i inventario/ web1.ejemplo.com -m debug -a "var=hostvars['web1.ejemplo.com']"

# Ver el inventario en formato JSON
ansible-inventory -i inventario/ --host web1.ejemplo.com</code></pre>
        </div>
        <div class="next-chapter-box">
          <div class="next-chapter-arrow">→</div>
          <div>
            <div class="next-chapter-label">A continuación</div>
            <div class="next-chapter-title">Strategy Plugin</div>
            <div class="next-chapter-desc">Controlás cómo Ansible distribuye la ejecución entre múltiples hosts: linear, free y debug.</div>
          </div>
        </div>
      `
    }
  ],
  quiz: [
    {
      question: '¿Qué grupo contiene SIEMPRE a todos los hosts del inventario, sin importar cómo estén agrupados?',
      options: [
        'El grupo "ungrouped"',
        'El grupo "default"',
        'El grupo "all"',
        'El grupo definido en ansible.cfg',
      ],
      correctIndex: 2,
      explanation: 'El grupo "all" es implícito e incluye todos los hosts del inventario. El grupo "ungrouped" contiene solo los hosts que no pertenecen a ningún grupo explícito. Variables en group_vars/all/ aplican a toda la infraestructura.',
    },
    {
      question: 'Tenés una variable "env" definida en group_vars/all/ con valor "dev" y también en group_vars/produccion/ con valor "prod". Si "web1" pertenece al grupo "produccion", ¿qué valor tiene "env" para ese host?',
      options: [
        '"dev", porque group_vars/all/ tiene mayor precedencia',
        '"prod", porque el grupo hijo sobreescribe al grupo all',
        'Ansible lanza un error por variable duplicada',
        'El valor depende del orden alfabético de los archivos',
      ],
      correctIndex: 1,
      explanation: 'Las variables de grupo hijo (produccion) tienen mayor precedencia que el grupo all. El orden de merging es: all → grupo padre → grupo hijo → host. Por eso "env=prod" de group_vars/produccion/ gana sobre "env=dev" de group_vars/all/.',
    },
    {
      question: '¿Cuál es la forma correcta de inspeccionar todas las variables resueltas de un host específico desde la línea de comandos?',
      options: [
        'cat inventario/host_vars/web1.ejemplo.com.yml',
        'ansible-inventory -i inventario/ --host web1.ejemplo.com',
        'ansible-playbook --list-hosts web1.ejemplo.com',
        'ansible-config dump --only-changed',
      ],
      correctIndex: 1,
      explanation: '"ansible-inventory --host" devuelve el JSON con todas las variables mergeadas del host: las de inventario, group_vars y host_vars ya combinadas. Es la única forma de ver el resultado final del merge, no las fuentes individuales.',
    },
  ],
  realWorldCase: 'Un equipo tiene servidores bare-metal en group_vars/produccion/ y 50 instancias EC2 que aparecen via un inventory plugin de AWS. El Inventory Engine las combina automáticamente en el grupo "aws_ec2", permitiendo aplicar el mismo role de hardening a toda la infraestructura con un solo playbook sin duplicar configuración.',
  troubleshooting: [
    {
      error: 'WARNING: Host file not found: /etc/ansible/hosts',
      cause: 'No se especificó inventario con "-i" y no hay un inventario por defecto configurado en ansible.cfg. Ansible intenta leer /etc/ansible/hosts y no lo encuentra.',
      fix: 'Siempre especificá el inventario explícitamente: "ansible-playbook -i inventario/ sitio.yml". Alternativamente, configurá "inventory = inventario/" en la sección [defaults] de ansible.cfg.',
    },
    {
      error: 'fatal: [web1]: FAILED! => {"msg": "\'mi_variable\' is undefined"}',
      cause: 'La variable se definió en group_vars/ de un grupo al que el host no pertenece, o hay un error de nombre en el archivo YAML del grupo (nombre de archivo no coincide con el nombre del grupo en el inventario).',
      fix: 'Verificá la membresía del host con "ansible-inventory --host web1" y comprobá que el nombre del archivo en group_vars/ coincide exactamente con el nombre del grupo. Revisá también que el YAML no tiene errores de sintaxis.',
    },
    {
      error: 'Variables de host_vars no se aplican — la variable del grupo sigue ganando',
      cause: 'host_vars tiene mayor precedencia que group_vars, pero hay una variable extra-var ("-e") o una variable de play que está sobreescribiendo el valor, ya que ambas tienen mayor precedencia que host_vars.',
      fix: 'Usá "ansible-playbook -v sitio.yml" para ver qué valor tiene la variable en cada host. La precedencia completa en Ansible tiene 22 niveles; extra_vars siempre gana. Evitá "-e" para variables de configuración permanente.',
    },
  ],
};
