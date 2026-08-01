import type { ModuleContent } from '../types';

export const nivel20Mod1: ModuleContent =   {
levelId: 20,
moduleId: 1,
title: 'Estructura del repositorio de Ansible',
duration: '2 horas',
objective: 'Entender cómo está organizado el código fuente de Ansible Core y qué responsabilidad tiene cada paquete Python.',
objectives: [
  'Clonar y navegar el repositorio ansible/ansible en GitHub',
  'Identificar la responsabilidad de cada subdirectorio en lib/ansible/',
  'Entender la separación entre ansible-core y las collections',
  'Localizar módulos, plugins y utilidades en el árbol de fuentes',
],
prerequisites: [
  'Todos los niveles 0–19 completados',
  'Python básico: importar paquetes, entender clases',
  'Git básico: clonar un repositorio',
],
steps: [
  {
    title: 'Clonar y explorar el repositorio ansible/ansible',
    body: `
      <p>El código fuente de Ansible Core está en <code>github.com/ansible/ansible</code>. Leer el código fuente es la forma más directa de entender por qué Ansible se comporta de cierta manera cuando la documentación no es suficiente.</p>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Leer el código fuente de Ansible es como leer el reglamento oficial de un deporte en lugar del resumen de un fanático. El resumen es más rápido de leer, pero cuando hay un caso límite o un comportamiento inesperado, el reglamento original es la única fuente de verdad.</p>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">clonar-explorar.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Clonar solo el último commit (más rápido, sin historia completa)
git clone https://github.com/ansible/ansible --depth=1
cd ansible

# Ver el tamaño del repositorio
du -sh .

# Contar líneas de código Python
find lib/ansible -name "*.py" | xargs wc -l | tail -1

# Ver los commits recientes para entender qué está cambiando
git log --oneline -20

# Ver las ramas activas (versiones en desarrollo)
git branch -r | grep stable | head -10</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">estructura-ansible-core.sh</span></div>
        <pre class="language-bash"><code class="language-bash">ansible/
├── bin/                        # Scripts de entrada — los comandos que ejecutás
│   ├── ansible                 # Ejecución ad-hoc (ansible host -m ping)
│   ├── ansible-playbook        # Ejecutar playbooks
│   ├── ansible-vault           # Cifrado/descifrado de secretos
│   ├── ansible-galaxy          # Gestión de roles y collections
│   ├── ansible-inventory       # Inspeccionar inventario
│   ├── ansible-doc             # Documentación de módulos
│   └── ansible-config          # Gestión de configuración
│
├── lib/ansible/                # Paquete Python principal
│   ├── cli/                    # Parsers de CLI y lógica de arranque
│   ├── executor/               # Motor de ejecución: el corazón de Ansible
│   ├── inventory/              # Parsing y gestión de inventario
│   ├── playbook/               # Modelos de datos: Play, Task, Block, Role
│   ├── plugins/                # Sistema de plugins (todos los tipos)
│   ├── template/               # Motor de templates Jinja2 (clase Templar)
│   ├── vars/                   # Resolución y precedencia de variables
│   ├── module_utils/           # Código base para módulos (AnsibleModule)
│   ├── parsing/                # Parsers YAML, dataloader
│   ├── errors/                 # Jerarquía de excepciones de Ansible
│   └── utils/                  # Utilidades generales (display, path, etc.)
│
├── test/                       # Suite de tests
│   ├── units/                  # Tests unitarios (pytest)
│   ├── integration/            # Tests de integración contra hosts reales
│   └── sanity/                 # Tests de sanidad (estilo, docs)
│
└── changelogs/                 # Historial de cambios por versión
└── CHANGELOG-v2.*.rst</code></pre>
      </div>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>ansible-core vs ansible:</strong> Desde Ansible 2.10, el paquete <code>ansible-core</code> contiene únicamente el motor de ejecución y los módulos built-in esenciales. El paquete <code>ansible</code> es una distribución que incluye ansible-core más un conjunto curado de collections comunitarias. El repositorio github.com/ansible/ansible corresponde a ansible-core.</div>
      </div>
    `
  },
  {
    title: 'Anatomía de lib/ansible/: cada paquete y su rol',
    body: `
      <p>El paquete <code>lib/ansible/</code> está dividido en subdirectories con responsabilidades muy bien definidas. Conocerlos te permite ir directamente al código correcto cuando estás investigando un problema.</p>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Los 8 paquetes más importantes que deberías conocer:</strong>
        </div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">paquetes-clave.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># 1. executor/ — El corazón: orquesta toda la ejecución
ls lib/ansible/executor/
# playbook_executor.py  ← orquestador de playbooks
# task_executor.py      ← ejecutor por tarea (el más importante)
# play_iterator.py      ← itera tareas respetando tags, when, etc.
# process/worker.py     ← workers en paralelo (forks)

# 2. playbook/ — Modelos de datos que representan el YAML parseado
ls lib/ansible/playbook/
# play.py               ← clase Play (un bloque "- hosts: ...")
# task.py               ← clase Task (una tarea individual)
# block.py              ← clase Block (bloque block/rescue/always)
# role/                 ← sistema de roles completo

# 3. plugins/ — Todos los tipos de plugins
ls lib/ansible/plugins/
# action/               ← action plugins (template, copy, command...)
# callback/             ← callback plugins (output, notificaciones)
# connection/           ← SSH, local, docker, kubectl
# inventory/            ← parsers de inventario (ini, yaml, script)
# lookup/               ← plugins de lookup (file, env, template...)
# filter/               ← filtros Jinja2 built-in
# vars/                 ← plugins de variables (host_vars, group_vars)
# strategy/             ← estrategias de ejecución (linear, free, debug)

# 4. vars/ — Resolución de variables y precedencia
ls lib/ansible/vars/
# manager.py            ← VariableManager: el único punto de verdad
#                          sobre qué variable tiene qué valor y con
#                          qué precedencia

# 5. template/ — Motor Jinja2
ls lib/ansible/template/
# __init__.py           ← clase Templar: evalúa {{ expresiones }}

# 6. inventory/ — Parseo y gestión del inventario
ls lib/ansible/inventory/
# manager.py            ← InventoryManager
# data.py               ← InventoryData (estructura en memoria)
# group.py              ← clase Group
# host.py               ← clase Host

# 7. errors/ — Jerarquía de excepciones
ls lib/ansible/errors/
# __init__.py           ← AnsibleError, AnsibleParserError,
#                          AnsibleUndefinedVariable, etc.

# 8. module_utils/ — Base para módulos
ls lib/ansible/module_utils/
# basic.py              ← AnsibleModule (la clase que todos los
#                          módulos instancian)
# common/               ← utilidades compartidas
# facts/                ← recolección de facts</code></pre>
      </div>
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio</div>
        <div class="lab-content">
          <p>Buscá en el código fuente dónde se implementa la precedencia de variables:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">explorar-vars.sh</span></div>
            <pre class="language-bash"><code class="language-bash">cd ansible

# Abrir el archivo principal de gestión de variables
less lib/ansible/vars/manager.py

# Buscar el método que ensambla las variables con toda su precedencia
grep -n "def get_vars" lib/ansible/vars/manager.py

# Ver la lista de precedencias — buscá el comentario con la lista ordenada
grep -n "precedence\|priority\|order" lib/ansible/vars/manager.py | head -20</code></pre>
          </div>
        </div>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>changelogs/ como roadmap:</strong> El directorio <code>changelogs/</code> contiene el historial de cambios de cada versión mayor. Si notás que algo cambió entre versiones, buscá en los changelogs. También podés ver los milestones de GitHub: <code>github.com/ansible/ansible/milestones</code> para ver qué está planeado.</div>
      </div>
    `
  },
  {
    title: 'Cómo se carga un plugin: PluginLoader y search paths',
    body: `
      <p>Ansible usa un sistema centralizado para descubrir y cargar plugins: la clase <code>PluginLoader</code>. Entender cómo funciona explica por qué a veces los plugins no se cargan y cómo Ansible decide cuál usar cuando hay múltiples con el mismo nombre.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">plugins/__init__.py (simplificado)</span></div>
        <pre class="language-python"><code class="language-python"># lib/ansible/plugins/__init__.py — simplificado para entender el concepto

class PluginLoader:
"""
Carga plugins de múltiples rutas de búsqueda con prioridad.
Prioridad (de mayor a menor):
  1. Rutas del usuario (configuradas en ansible.cfg o variable de entorno)
  2. Rutas de collections instaladas
  3. Rutas del paquete ansible-core (built-in)
"""

def __init__(self, class_name, package, config, subdir):
    # class_name: nombre de la clase a buscar (ej: "FilterModule")
    # package: paquete Python (ej: "ansible.plugins.filter")
    # config: variable de configuración (ej: "DEFAULT_FILTER_PLUGIN_PATH")
    # subdir: subdirectorio (ej: "filter_plugins")
    self.class_name    = class_name
    self._search_paths = self._build_search_paths(config, subdir)

def find_plugin(self, name):
    """
    Busca un plugin por nombre en todas las rutas de búsqueda.
    Devuelve el path al archivo Python del primer match.
    """
    for path in self._search_paths:
        full_path = os.path.join(path, f'{name}.py')
        if os.path.isfile(full_path):
            return full_path
    return None   # No encontrado

def get(self, name):
    """Carga y retorna la clase del plugin."""
    path = self.find_plugin(name)
    if not path:
        raise AnsiblePluginNotFound(f"Plugin '{name}' no encontrado")
    # Cargar el módulo Python dinámicamente
    spec   = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    # Retornar la clase (FilterModule, LookupModule, etc.)
    return getattr(module, self.class_name)

# Los loaders globales para cada tipo de plugin
action_loader     = PluginLoader('ActionModule',   'ansible.plugins.action',     ...)
callback_loader   = PluginLoader('CallbackModule', 'ansible.plugins.callback',   ...)
connection_loader = PluginLoader('Connection',     'ansible.plugins.connection', ...)
filter_loader     = PluginLoader('FilterModule',   'ansible.plugins.filter',     ...)
lookup_loader     = PluginLoader('LookupModule',   'ansible.plugins.lookup',     ...)</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">debug-plugin-paths.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Ver las rutas de búsqueda actuales para cada tipo de plugin
ansible-config dump | grep "PLUGIN_PATH\|FILTER\|LOOKUP\|CALLBACK" | head -20

# Ver EXACTAMENTE qué rutas se buscan para filter plugins
ansible-config dump | grep DEFAULT_FILTER_PLUGIN_PATH

# Diagnosticar por qué un plugin no se encuentra
ANSIBLE_DEBUG=1 ansible-playbook playbook.yml 2>&1 | grep "Loading\|plugin\|filter" | head -30

# Ver qué collections aportan plugins y desde qué path
ansible-galaxy collection list
ansible-doc -l --type filter | grep "mi_empresa"</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>El orden de búsqueda importa:</strong> Ansible carga el PRIMER plugin que encuentra con el nombre buscado. Si tenés un filter llamado "default" en tu filter_plugins/ local, sobreescribirá el filtro built-in de Ansible. Esto puede ser intencional (monkey-patching) o un bug difícil de encontrar.</div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'ansible-core',
    definition: 'Paquete Python que contiene el motor de ejecución de Ansible y los módulos built-in esenciales. El repositorio github.com/ansible/ansible corresponde a ansible-core. El paquete "ansible" es una distribución que incluye ansible-core más un conjunto curado de collections.',
  },
  {
    term: 'PluginLoader',
    definition: 'Clase interna de Ansible (lib/ansible/plugins/__init__.py) responsable de descubrir y cargar plugins de múltiples rutas de búsqueda. Hay un PluginLoader por tipo de plugin: action_loader, callback_loader, filter_loader, etc.',
  },
  {
    term: 'lib/ansible/executor/',
    definition: 'Directorio que contiene el motor de ejecución de Ansible: PlaybookExecutor (orquestador), TaskExecutor (ejecutor por tarea), PlayIterator (iterador respetando tags y condiciones), y los workers de paralelismo.',
  },
  {
    term: 'lib/ansible/vars/manager.py',
    definition: 'El VariableManager: clase responsable de ensamblar las variables disponibles para cada host en cada momento de la ejecución, respetando las 22 capas de precedencia de Ansible. Todo lo relacionado con "¿cuál variable gana?" empieza aquí.',
  },
],
quiz: [
  {
    question: '¿Qué diferencia hay entre el paquete "ansible" y "ansible-core"?',
    options: [
      'Son exactamente lo mismo, solo tienen distintos nombres históricos',
      'ansible-core es el motor de ejecución y módulos built-in; ansible incluye ansible-core más collections comunitarias',
      'ansible-core incluye todas las collections; ansible solo el motor',
      'ansible es la versión open source y ansible-core es la versión comercial',
    ],
    correctIndex: 1,
    explanation: 'ansible-core contiene únicamente el motor de ejecución (executor, plugins base, módulos esenciales). El paquete "ansible" es una distribución más grande que incluye ansible-core más un conjunto curado de collections comunitarias como community.general, amazon.aws, etc.',
  },
  {
    question: '¿En qué archivo de lib/ansible/ encontrarías la lógica de resolución de precedencia de variables?',
    options: [
      'lib/ansible/playbook/play.py',
      'lib/ansible/template/__init__.py',
      'lib/ansible/vars/manager.py',
      'lib/ansible/executor/task_executor.py',
    ],
    correctIndex: 2,
    explanation: 'lib/ansible/vars/manager.py contiene el VariableManager, específicamente su método get_vars() que ensambla todas las variables para un host dado, respetando las 22 capas de precedencia de Ansible. Si querés entender por qué una variable gana sobre otra, ese es el archivo.',
  },
  {
    question: '¿Cuál es el orden de prioridad del PluginLoader cuando busca un plugin?',
    options: [
      'Primero los built-in de ansible-core, luego collections, luego rutas del usuario',
      'Primero las rutas del usuario, luego collections, luego los built-in de ansible-core',
      'Primero las collections, luego las rutas del usuario, luego los built-in',
      'Todos los paths tienen la misma prioridad — se usa el primero encontrado aleatoriamente',
    ],
    correctIndex: 1,
    explanation: 'El PluginLoader prioriza las rutas del usuario (configuradas en ansible.cfg o variables de entorno), luego las collections instaladas, y finalmente los built-in de ansible-core. Esto permite que los usuarios sobreescriban plugins built-in con sus propias versiones.',
  },
],
troubleshooting: [
  {
    error: 'No encuentro el archivo donde Ansible resuelve una variable específica',
    cause: 'No se conoce el punto de entrada correcto en el código fuente.',
    fix: 'Empezá siempre por lib/ansible/vars/manager.py → método get_vars(). Para saber qué módulo ejecuta una tarea, buscá en lib/ansible/plugins/action/ el archivo con el nombre del módulo. Para el output por pantalla: lib/ansible/plugins/callback/default.py.',
  },
  {
    error: 'ANSIBLE_DEBUG=1 produce demasiada salida para ser útil',
    cause: 'ANSIBLE_DEBUG activa logging en todos los componentes simultáneamente.',
    fix: 'Filtrá con grep: ANSIBLE_DEBUG=1 ansible-playbook playbook.yml 2>&1 | grep "PluginLoader\\|Loading" para ver solo la carga de plugins. O usá python -m pdb lib/ansible/executor/task_executor.py para debugging interactivo.',
  },
  {
    error: 'No sé qué versión de Ansible introdujo cierto comportamiento',
    cause: 'La documentación no siempre menciona la versión exacta del cambio.',
    fix: 'Buscá en changelogs/: grep -r "término_buscado" changelogs/ --include="*.rst". También podés usar git log --oneline --all | head -50 o explorar los milestones de GitHub en github.com/ansible/ansible/milestones.',
  },
],
  };
