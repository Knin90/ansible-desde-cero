import type { ModuleContent } from '../types';

export const nivel4Mod8: ModuleContent = {
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
};
