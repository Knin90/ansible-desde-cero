import type { ModuleContent } from '../types';

export const nivel13Mod1: ModuleContent =   {
levelId: 13,
moduleId: 1,
title: 'Action Plugins',
objective: 'Entender el modelo de plugins de Ansible, qué son los action plugins, cuándo se ejecutan en el nodo de control, y cómo crear uno básico para extender Ansible.',
duration: '2 horas',
objectives: [
  'Entender la arquitectura de plugins de Ansible: tipos y responsabilidades',
  'Distinguir la diferencia entre un módulo y un action plugin',
  'Identificar los action plugins built-in más conocidos: template, copy, fetch',
  'Crear un action plugin básico en Python que corre en el nodo de control',
  'Saber dónde colocar plugins para que Ansible los descubra automáticamente',
],
prerequisites: [
  'Conocer Python básico (funciones, clases, herencia)',
  'Haber trabajado con roles y playbooks en Ansible (Nivel 12)',
  'Entender la diferencia entre nodo de control y host remoto',
],
steps: [
  {
    title: 'Arquitectura de plugins de Ansible',
    body: `
      <p>Ansible es extensible mediante una arquitectura de plugins. Cada tipo de plugin tiene una responsabilidad específica en el pipeline de ejecución.</p>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Tipos de plugins en Ansible:</strong>
          <ul>
            <li><strong>action</strong>: coordinan la ejecución entre control node y host remoto</li>
            <li><strong>module</strong>: código que se ejecuta en el host remoto (idempotencia)</li>
            <li><strong>lookup</strong>: leen datos de fuentes externas en el control node</li>
            <li><strong>filter</strong>: transforman datos en expresiones Jinja2</li>
            <li><strong>callback</strong>: reaccionan a eventos del ciclo de vida de ejecución</li>
            <li><strong>connection</strong>: gestionan el canal de comunicación con hosts remotos</li>
            <li><strong>inventory</strong>: generan inventarios dinámicos desde fuentes externas</li>
            <li><strong>vars</strong>: proveen variables desde fuentes externas</li>
          </ul>
        </div>
      </div>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Pensá en Ansible como una orquesta. El <em>action plugin</em> es el director: coordina qué pasa y cuándo. El <em>módulo</em> es el músico en el escenario (host remoto) que ejecuta la partitura. Los <em>lookups</em> son los archivistas que traen la información de los archivos. Los <em>callbacks</em> son los críticos que reportan cómo salió todo.</p>
      </div>
    `
  },
  {
    title: 'Action plugins built-in — los que ya usás sin saberlo',
    body: `
      <p>Varios módulos "comunes" de Ansible son en realidad action plugins. Se ejecutan en el nodo de control porque necesitan acceder a archivos locales antes de interactuar con el host remoto.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">action-plugins-builtin.sh</span></div>
        <pre class="language-yaml"><code class="language-yaml"># Ver todos los action plugins disponibles
ansible-doc -t action -l

# Módulos conocidos que son action plugins:
# ansible.builtin.template  — lee el .j2 localmente, renderiza, sube el resultado
# ansible.builtin.copy      — lee el archivo local, lo transfiere al host
# ansible.builtin.fetch     — descarga archivo del host al control node
# ansible.builtin.include_vars — carga variables desde archivo local
# ansible.builtin.debug     — evalúa mensajes en el control node

# Para confirmar que un módulo es action plugin:
ls $(python3 -c "import ansible; print(ansible.__file__[:-12])")/plugins/action/</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">donde-colocar-plugins.sh</span></div>
        <pre class="language-yaml"><code class="language-yaml"># Ansible busca action plugins en estas ubicaciones (en orden):
# 1. action_plugins/ relativo al playbook
# 2. action_plugins/ dentro de un role
# 3. Rutas configuradas en ansible.cfg:

# ansible.cfg
[defaults]
action_plugins = ~/.ansible/plugins/action:./action_plugins

# Para collections — la ubicación es dentro de la collection:
# mi_namespace/mi_collection/plugins/action/mi_plugin.py</code></pre>
      </div>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>Diferencia módulo vs action plugin:</strong> Un módulo es código Python que Ansible transfiere al host remoto y ejecuta allí. Un action plugin corre en el nodo de control y puede opcionalmente llamar un módulo en el host remoto. Los action plugins tienen acceso al sistema de archivos del control node.</div>
      </div>
    `
  },
  {
    title: 'Crear un action plugin desde cero',
    body: `
      <p>Un action plugin es una clase Python que hereda de <code>ActionBase</code>. El método <code>run()</code> contiene la lógica principal.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">action_plugins/verificar_prerequisitos.py</span></div>
        <pre class="language-yaml"><code class="language-yaml">from ansible.plugins.action import ActionBase
from ansible.errors import AnsibleActionFail
import os

class ActionModule(ActionBase):
"""
Action plugin que verifica prerequisitos locales antes de ejecutar.
Se ejecuta en el nodo de control.
"""

# Si el plugin transfiere archivos al host remoto, ponelo en True
TRANSFERS_FILES = False

def run(self, tmp=None, task_vars=None):
    if task_vars is None:
        task_vars = {}

    # Siempre llamar al padre primero
    result = super(ActionModule, self).run(tmp, task_vars)
    result['changed'] = False

    # Leer argumentos del módulo definidos en el playbook
    archivos_requeridos = self._task.args.get('archivos', [])
    variables_env = self._task.args.get('variables_env', [])

    # Lógica en el nodo de control: verificar archivos locales
    archivos_faltantes = []
    for archivo in archivos_requeridos:
        if not os.path.exists(archivo):
            archivos_faltantes.append(archivo)

    # Verificar variables de entorno
    vars_faltantes = []
    for var in variables_env:
        if not os.environ.get(var):
            vars_faltantes.append(var)

    # Si hay problemas, fallar con mensaje descriptivo
    if archivos_faltantes or vars_faltantes:
        errores = []
        if archivos_faltantes:
            errores.append(f"Archivos faltantes: {', '.join(archivos_faltantes)}")
        if vars_faltantes:
            errores.append(f"Variables de entorno faltantes: {', '.join(vars_faltantes)}")
        raise AnsibleActionFail('\n'.join(errores))

    # También podés ejecutar comandos en el host remoto:
    # resultado_remoto = self._execute_module(
    #     module_name='ansible.builtin.command',
    #     module_args={'argv': ['uname', '-r']},
    #     task_vars=task_vars
    # )

    result['archivos_verificados'] = archivos_requeridos
    result['variables_verificadas'] = variables_env
    result['msg'] = 'Todos los prerequisitos presentes'
    return result</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">usar-action-plugin.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">tasks:
  - name: Verificar prerequisitos del deploy
verificar_prerequisitos:   # nombre del archivo sin .py
  archivos:
    - "files/app-{{ version }}.tar.gz"
    - "~/.ssh/id_ed25519"
  variables_env:
    - AWS_ACCESS_KEY_ID
    - AWS_SECRET_ACCESS_KEY
    - DEPLOY_TOKEN

  - name: El deploy recién empieza aquí
ansible.builtin.debug:
  msg: "Todos los prerequisitos OK, iniciando deploy"</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Action plugins y colecciones:</strong> En proyectos modernos, los action plugins deben estar dentro de collections para ser distribuidores correctamente. Colocallos en <code>plugins/action/</code> dentro de la collection. Para desarrollo local, el directorio <code>action_plugins/</code> junto al playbook sigue funcionando.</div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'action plugin',
    definition: 'Tipo de plugin de Ansible que se ejecuta en el nodo de control (no en el host remoto). Coordina la comunicación entre control node y host. Template, copy y fetch son action plugins built-in.',
  },
  {
    term: 'ActionBase',
    definition: 'Clase base de Python de la que deben heredar todos los action plugins de Ansible. Provee métodos para ejecutar módulos remotos (_execute_module), transferir archivos y acceder a variables de tarea.',
  },
  {
    term: 'TRANSFERS_FILES',
    definition: 'Atributo de clase en un action plugin que indica si el plugin transfiere archivos al host remoto. Si es True, Ansible prepara el mecanismo de transferencia antes de llamar a run().',
  },
  {
    term: 'AnsibleActionFail',
    definition: 'Excepción Python que un action plugin debe lanzar cuando necesita hacer fallar la tarea con un mensaje personalizado. Más limpio que devolver un dict con failed: True.',
  },
],
quiz: [
  {
    question: '¿Dónde se ejecuta el código de un action plugin?',
    options: [
      'En el host remoto que se está configurando',
      'En el nodo de control desde donde se ejecuta Ansible',
      'En ambos — la mitad en cada lugar',
      'En un worker separado de Ansible',
    ],
    correctIndex: 1,
    explanation: 'Los action plugins se ejecutan siempre en el nodo de control (la máquina donde corrés ansible-playbook). Esto los diferencia de los módulos normales que se transfieren y ejecutan en el host remoto. Los action plugins pueden opcionalmente llamar módulos remotos usando self._execute_module().',
  },
  {
    question: '¿Qué módulo conocido de Ansible es en realidad un action plugin?',
    options: [
      'ansible.builtin.apt',
      'ansible.builtin.template',
      'ansible.builtin.service',
      'ansible.builtin.user',
    ],
    correctIndex: 1,
    explanation: 'ansible.builtin.template es un action plugin porque necesita leer el archivo .j2 del nodo de control, procesarlo con Jinja2 localmente, y luego transferir el resultado al host remoto. apt, service y user son módulos normales que se ejecutan directamente en el host remoto.',
  },
  {
    question: '¿Cuándo crearías un action plugin en lugar de un módulo normal?',
    options: [
      'Cuando el módulo necesita acceso a la base de datos del host remoto',
      'Cuando la lógica necesita acceder a archivos locales del nodo de control o coordinar entre control node y host',
      'Cuando el módulo es demasiado lento',
      'Para todos los módulos custom — es la práctica recomendada',
    ],
    correctIndex: 1,
    explanation: 'Los action plugins son ideales cuando la lógica necesita: leer archivos del nodo de control antes de transferirlos, coordinar múltiples operaciones entre control node y host, o ejecutar código que no debería ser transferido al host remoto (por seguridad o disponibilidad de librerías). Para lógica puramente remota, un módulo normal es más simple.',
  },
],
troubleshooting: [
  {
    error: 'ERROR! no action detected in task. This often indicates a misspelled module name',
    cause: 'Ansible no encuentra el action plugin porque el archivo no está en ninguna de las rutas de búsqueda configuradas.',
    fix: 'Verificá que el archivo esté en action_plugins/ relativo al playbook, o que la ruta esté en ansible.cfg. El nombre del módulo en el playbook debe coincidir exactamente con el nombre del archivo Python sin la extensión .py.',
  },
  {
    error: 'TypeError: run() missing 1 required positional argument: task_vars',
    cause: 'La firma del método run() no coincide con lo que Ansible espera.',
    fix: 'La firma correcta es: def run(self, tmp=None, task_vars=None). Ambos argumentos deben tener valores por defecto. Verificá también que la primera línea del método llame al padre: result = super(ActionModule, self).run(tmp, task_vars).',
  },
  {
    error: 'AttributeError: self._task.args retorna None',
    cause: 'Se está accediendo a _task.args antes de verificar que existen parámetros.',
    fix: 'Usá .get() con valores por defecto: self._task.args.get("parametro", valor_default). Para parámetros obligatorios, verificá explícitamente y lanzá AnsibleActionFail si faltan.',
  },
],
realWorldCase: 'Un equipo de seguridad creó un action plugin "security_preflight" que se ejecuta antes de cada deploy. El plugin verifica en el nodo de control que: los archivos de certificados SSL están presentes y son válidos, las variables de credenciales están definidas como variables de entorno (no en playbooks), y que el artifact a desplegar tiene la firma GPG correcta. Si cualquier verificación falla, el deploy se aborta antes de tocar un solo servidor.',
  };
