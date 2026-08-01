import type { ModuleContent } from '../types';

export const nivel20Mod2: ModuleContent =   {
levelId: 20,
moduleId: 2,
title: 'Cómo interactúan los componentes',
duration: '2 horas',
objective: 'Seguir el flujo de ejecución completo desde ansible-playbook hasta el resultado JSON de un módulo.',
objectives: [
  'Trazar el camino completo desde el CLI hasta la ejecución del módulo',
  'Entender qué hace TaskExecutor en cada tarea',
  'Comprender cómo los action plugins median entre Ansible y los módulos',
  'Entender las diferencias de código entre la estrategia linear y free',
],
prerequisites: [
  'Módulo 20.1: estructura del repositorio de Ansible',
],
steps: [
  {
    title: 'El camino completo: CLI → PlaybookExecutor → TaskExecutor → Módulo',
    body: `
      <p>Cuando ejecutás <code>ansible-playbook site.yml</code>, se desencadena una cadena de llamadas entre 7 componentes principales. Conocer esta cadena te permite entender dónde agregar debugging, cómo funcionan las estrategias de ejecución y por qué los módulos se ejecutan en el host remoto.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">flujo-ejecucion-completo.py</span></div>
        <pre class="language-python"><code class="language-python"># ============================================================
# PASO 1: CLI (bin/ansible-playbook)
# ============================================================
# bin/ansible-playbook llama lib/ansible/cli/playbook.py

class PlaybookCLI(CLI):
def run(self):
    # Parsea argumentos (--limit, --tags, --check, etc.)
    # Carga ansible.cfg
    # Inicializa el loader, inventory, variable_manager
    loader           = DataLoader()
    inventory        = InventoryManager(loader, sources=[...])
    variable_manager = VariableManager(loader, inventory)

    # Delega al ejecutor principal
    pbex = PlaybookExecutor(
        playbooks=['site.yml'],
        inventory=inventory,
        variable_manager=variable_manager,
        loader=loader,
        passwords={},
    )
    pbex.run()


# ============================================================
# PASO 2: PlaybookExecutor (lib/ansible/executor/playbook_executor.py)
# ============================================================
class PlaybookExecutor:
def run(self):
    for playbook_path in self._playbooks:
        # Carga el YAML del playbook y lo parsea en objetos Play
        pb = Playbook.load(playbook_path, ...)
        plays = pb.get_plays()

        for play in plays:
            # Para cada play, crea el iterador de tareas
            # (respeta tags, hosts, serial, etc.)
            iterator = PlayIterator(
                inventory=self._inventory,
                play=play,
                play_context=play_context,
                ...
            )
            # La estrategia decide el ORDEN de ejecución
            strategy = strategy_loader.get(play.strategy, self._tqm)
            rc = strategy.run(iterator, play_context)


# ============================================================
# PASO 3: StrategyBase (lib/ansible/plugins/strategy/)
# ============================================================
class StrategyLinear(StrategyBase):
"""
Estrategia linear: todos los hosts ejecutan la tarea 1 antes
de que cualquiera ejecute la tarea 2. Es la estrategia por defecto.
"""
def run(self, iterator, play_context):
    while not iterator.is_failed() and not iterator.is_complete():
        # Obtener la siguiente "ronda" de tareas
        # (una tarea por cada host activo)
        hosts_tasks = self._get_next_task_lockstep(iterator)

        # Encolar cada (host, tarea) como un trabajo para los workers
        for host, task in hosts_tasks:
            self._queue_task(host, task, ...)

        # Esperar a que todos terminen antes de la próxima ronda
        self._wait_on_pending_results(iterator)


class StrategyFree(StrategyBase):
"""
Estrategia free: cada host avanza a su propio ritmo.
No espera a que todos terminen una tarea antes de continuar.
Más rápido pero menos predecible.
"""
def run(self, iterator, play_context):
    while not iterator.is_failed() and not iterator.is_complete():
        # Obtener TODAS las tareas disponibles para TODOS los hosts
        # (no solo una ronda)
        for host in self._inventory.get_hosts(play.hosts):
            task = iterator.get_next_task_for_host(host)
            if task:
                self._queue_task(host, task, ...)
        # No hay lockstep: solo procesamos resultados disponibles
        self._process_pending_results(iterator, max_passes=1)


# ============================================================
# PASO 4: TaskExecutor (lib/ansible/executor/task_executor.py)
# ============================================================
# Un worker independiente ejecuta TaskExecutor por cada (host, tarea)
class TaskExecutor:
def run(self):
    # 4a. Resolver variables para este host en este momento
    variables = self._variable_manager.get_vars(
        play=self._play,
        host=self._host,
        task=self._task,
    )

    # 4b. Evaluar la condición 'when'
    if not self._evaluate_conditional(self._task.when, variables):
        return dict(skipped=True)

    # 4c. Aplicar el loop (loop, with_items, etc.)
    results = []
    for item in self._get_loop_items():
        result = self._execute(variables, item)
        results.append(result)

    return results

def _execute(self, variables, loop_item):
    # 4d. Renderizar templates en los parámetros de la tarea
    #     ({{ variable }} → valor real)
    templar = Templar(loader=self._loader, variables=variables)
    task_vars = templar.template(self._task.args)

    # 4e. Cargar el Action Plugin correspondiente
    action = action_loader.get(
        self._task.action,    # ej: "ansible.builtin.copy"
        task=self._task,
        connection=self._connection,
        ...
    )

    # 4f. Ejecutar el action plugin
    result = action.run(task_vars=task_vars)
    return result


# ============================================================
# PASO 5: Action Plugin (lib/ansible/plugins/action/)
# ============================================================
class ActionModule(ActionBase):
"""Action plugin para el módulo 'copy' (simplificado)."""

def run(self, tmp=None, task_vars=None):
    # Para módulos "normales": transfiere el módulo al host remoto
    # y lo ejecuta via SSH

    # Serializar los argumentos del módulo
    module_args = self._task.args.copy()

    # Transferir y ejecutar el módulo en el host remoto
    result = self._execute_module(
        module_name='ansible.legacy.copy',
        module_args=module_args,
        task_vars=task_vars,
    )

    # El resultado llega como JSON: {"changed": true, "dest": "...", ...}
    return result


# ============================================================
# PASO 6: Módulo Python se ejecuta en el HOST REMOTO
# ============================================================
# Ansible copia el módulo .py (con sus dependencias) al host via SSH
# Lo ejecuta: python /tmp/.ansible/tmp-xxx/mi_modulo.py
# El módulo imprime JSON en stdout y termina
# Ansible lee stdout y parsea el JSON

# {"changed": true, "msg": "archivo copiado", "dest": "/etc/app.conf"}


# ============================================================
# PASO 7: Callback Plugin procesa el resultado
# ============================================================
class CallbackModule(CallbackBase):
def v2_runner_on_ok(self, result):
    """Llamado cuando una tarea termina OK."""
    # Muestra "ok: [hostname]" o "changed: [hostname]"
    # Escribe en logs, notifica a Slack, etc.</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>ANSIBLE_DEBUG=1 para ver el flujo en vivo:</strong> Exportá <code>ANSIBLE_DEBUG=1</code> antes de ejecutar un playbook. Verás mensajes de cada componente incluyendo qué action plugin se carga, qué variables se resuelven, y el JSON que devuelve cada módulo. Es verboso pero invaluable para debugging avanzado.</div>
      </div>
    `
  },
  {
    title: 'La capa de conexión: SSH, local y docker',
    body: `
      <p>Los action plugins no hablan directamente con los hosts: usan una capa de conexión abstracta (<code>Connection</code>) que puede ser SSH, una conexión local, Docker exec, kubectl exec, etc. Esto es lo que hace a Ansible extensible a cualquier tipo de host.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">plugins/connection/ssh.py (simplificado)</span></div>
        <pre class="language-python"><code class="language-python"># lib/ansible/plugins/connection/ssh.py — simplificado

class Connection(ConnectionBase):
"""Plugin de conexión SSH."""

transport = 'ssh'

def exec_command(self, cmd, in_data=None, sudoable=True):
    """Ejecuta un comando en el host remoto via SSH."""
    # Construye el comando SSH con todos los flags configurados:
    # ControlMaster, ControlPersist, StrictHostKeyChecking, etc.
    ssh_cmd = self._build_ssh_cmd(cmd, sudoable)

    # Ejecuta el proceso SSH
    p = subprocess.Popen(
        ssh_cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    stdout, stderr = p.communicate(in_data)
    return p.returncode, stdout, stderr

def put_file(self, in_path, out_path):
    """Copia un archivo al host remoto (scp o sftp)."""
    ...

def fetch_file(self, in_path, out_path):
    """Descarga un archivo del host remoto."""
    ...

def close(self):
    """Cierra la conexión SSH (libera el ControlMaster socket)."""
    ...</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">tipos-conexion.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# Ansible tiene connection plugins para diferentes backends:

# SSH (por defecto para hosts Linux/Unix)
- name: Configurar servidor remoto
  hosts: webservers
  # connection: ssh   ← es el default, no necesita declararse

# Local (el controller ejecuta la tarea sobre sí mismo)
- name: Tarea local en el controller
  hosts: localhost
  connection: local

# Docker exec (ejecutar en un contenedor Docker local)
- name: Configurar contenedor Docker
  hosts: mi_contenedor
  connection: community.docker.docker

# kubectl exec (ejecutar en un pod de Kubernetes)
- name: Configurar pod
  hosts: mi_pod
  connection: community.kubernetes.kubectl

# winrm (Windows Remote Management — para hosts Windows)
- name: Configurar Windows Server
  hosts: winservers
  connection: ansible.builtin.winrm
  vars:
ansible_winrm_transport: ntlm</code></pre>
      </div>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>ControlMaster / ControlPersist:</strong> Opciones SSH que permiten reutilizar la misma conexión TCP para múltiples comandos (multiplexing). Sin esto, Ansible abriría una nueva conexión SSH para cada tarea, lo que sería extremadamente lento. Configurado en ansible.cfg como <code>ssh_args = -o ControlMaster=auto -o ControlPersist=60s</code>.</div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'PlaybookExecutor',
    definition: 'Clase en lib/ansible/executor/playbook_executor.py que orquesta la ejecución de un playbook completo. Itera sobre los plays, crea el PlayIterator para cada uno, y delega la ejecución de tareas a la estrategia (StrategyBase).',
  },
  {
    term: 'TaskExecutor',
    definition: 'Clase en lib/ansible/executor/task_executor.py que ejecuta una tarea individual sobre un host. Es el componente que resuelve variables, evalúa when, procesa loops, renderiza templates y llama al action plugin.',
  },
  {
    term: 'StrategyBase / StrategyLinear / StrategyFree',
    definition: 'Clases que implementan las estrategias de ejecución. Linear espera que todos los hosts terminen cada tarea antes de pasar a la siguiente (comportamiento por defecto). Free permite que cada host avance a su propio ritmo sin esperar a los demás.',
  },
  {
    term: 'Action Plugin',
    definition: 'Plugin que se ejecuta en el controller (no en el host remoto) y decide cómo implementar una tarea. Para la mayoría de módulos, el action plugin empaqueta y transfiere el módulo Python al host remoto. Para módulos como template, el action plugin hace procesamiento local antes de enviar.',
  },
  {
    term: 'ConnectionBase',
    definition: 'Clase base abstracta que todos los connection plugins extienden. Define la interfaz: exec_command(), put_file(), fetch_file(), close(). Los action plugins usan esta interfaz sin conocer si están hablando via SSH, Docker, WinRM u otro backend.',
  },
],
quiz: [
  {
    question: '¿En qué máquina se ejecuta un Action Plugin: en el controller o en el host remoto?',
    options: [
      'En el host remoto, igual que los módulos',
      'En el controller (la máquina desde donde se corre ansible-playbook)',
      'En una máquina dedicada de orquestación',
      'Depende del tipo de connection plugin usado',
    ],
    correctIndex: 1,
    explanation: 'Los Action Plugins siempre se ejecutan en el controller. Su trabajo es preparar la ejecución de la tarea, posiblemente hacer procesamiento local (como el action plugin de template que renderiza el template antes de enviarlo), y luego transferir y ejecutar el módulo Python en el host remoto via la capa de conexión.',
  },
  {
    question: '¿Cuál es la diferencia principal entre la estrategia "linear" y "free"?',
    options: [
      'Linear usa SSH y free usa conexiones locales',
      'Linear espera que todos los hosts terminen cada tarea antes de la siguiente; free permite que cada host avance a su ritmo',
      'Linear ejecuta tareas en secuencia; free las ejecuta en paralelo',
      'Linear soporta handlers; free no',
    ],
    correctIndex: 1,
    explanation: 'Ambas estrategias ejecutan tareas en paralelo (usando forks). La diferencia es el lockstep: linear obliga a que todos los hosts terminen la tarea N antes de que cualquiera empiece la tarea N+1. Free elimina ese lockstep, permitiendo que hosts más rápidos avancen sin esperar a los más lentos.',
  },
  {
    question: '¿Qué hace el TaskExecutor antes de llamar al action plugin?',
    options: [
      'Solo llama al action plugin directamente sin hacer nada más',
      'Establece la conexión SSH con el host remoto',
      'Resuelve variables, evalúa when, procesa loops y renderiza templates en los parámetros',
      'Copia el módulo Python al host remoto',
    ],
    correctIndex: 2,
    explanation: 'TaskExecutor hace varios pasos antes de llamar al action plugin: (1) llama a VariableManager para resolver todas las variables del host, (2) evalúa la condición when, (3) procesa los loops, y (4) usa Templar para renderizar todos los {{ templates }} en los argumentos de la tarea. Solo después pasa el resultado al action plugin.',
  },
],
troubleshooting: [
  {
    error: 'Necesito saber exactamente qué variables tiene un host en un momento dado',
    cause: 'No hay visibilidad directa del estado del VariableManager en tiempo de ejecución.',
    fix: 'Usá la tarea ansible.builtin.debug: var=hostvars[inventory_hostname] para ver todas las variables de un host. O añadí una tarea con debug: var=vars para ver el scope completo. Con ANSIBLE_DEBUG=1 verás el dump completo de variables en cada TaskExecutor.',
  },
  {
    error: 'No entiendo por qué una tarea se ejecuta con "local" connection en lugar de SSH',
    cause: 'El host en el inventario tiene ansible_connection: local, o la tarea especifica connection: local, o el host es "localhost".',
    fix: 'Revisá el inventario con ansible-inventory --host tu_host para ver todas las variables incluyendo ansible_connection. También verificá si hay group_vars/all.yml que sobreescriba la conexión.',
  },
  {
    error: 'Un playbook con "free" strategy produce resultados inconsistentes',
    cause: 'La estrategia free no garantiza orden entre hosts. Si una tarea depende del resultado de otra en otro host, free puede causar condiciones de carrera.',
    fix: 'Usá la estrategia free solo para tareas verdaderamente independientes entre hosts. Si necesitás sincronización entre hosts, usá ansible.builtin.wait_for o volvé a la estrategia linear.',
  },
],
  };
