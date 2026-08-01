import type { ModuleContent } from '../types';

export const nivel4Mod4: ModuleContent = {
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
};
