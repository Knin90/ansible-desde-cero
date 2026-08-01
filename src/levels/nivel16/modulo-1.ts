import type { ModuleContent } from '../types';

export const nivel16Mod1: ModuleContent =   {
levelId: 16,
moduleId: 1,
title: 'SSH Multiplexing y Pipelining',
objective: 'Configurar SSH multiplexing y pipelining para reducir drásticamente el overhead de conexión en flotas grandes, entendiendo exactamente qué ocurre en cada conexión SSH.',
duration: '2 horas',
objectives: [
  'Entender cuántas conexiones SSH abre Ansible por tarea sin optimizaciones',
  'Configurar ControlMaster y ControlPersist para reutilizar conexiones SSH',
  'Habilitar pipelining para eliminar escrituras de módulos a disco',
  'Resolver el conflicto entre pipelining y requiretty en sudoers',
],
prerequisites: [
  'Completados los Niveles 0–15',
  'Entornos con múltiples hosts manejados por Ansible',
  'Acceso sudo a los hosts para modificar sudoers si es necesario',
],
steps: [
  {
    title: '¿Cuánto tiempo se pierde en SSH? El problema de las conexiones',
    body: `
      <p>Antes de optimizar, hay que entender exactamente qué ocurre en cada tarea de Ansible. Por defecto, cada tarea abre una o más conexiones SSH al host remoto — y cada conexión incluye el overhead del handshake criptográfico.</p>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Sin optimizaciones — lo que hace Ansible por tarea (sin pipelining):</strong><br>
          1. Conexión SSH #1: Autenticación → copiar el módulo Python a /tmp/<br>
          2. Conexión SSH #2: Autenticación → ejecutar el módulo Python<br>
          3. Conexión SSH #3: Autenticación → borrar el módulo de /tmp/<br><br>
          <strong>Costo típico por handshake SSH en red LAN:</strong> 50-100ms<br>
          <strong>Costo típico en WAN/cloud:</strong> 200-500ms<br><br>
          <strong>Ejemplo real:</strong> 20 tareas × 50 hosts × 3 conexiones × 100ms = <strong>5 minutos</strong> solo en overhead SSH
        </div>
      </div>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Imaginá que para cada tarea del hogar (lavar un plato, barrer el piso, tirar la basura), tuvieras que salir de tu casa, viajar al trabajo, hacer el trámite de entrada y volver. Con SSH multiplexing, la puerta queda abierta todo el tiempo que estás en el trabajo — sin volver a hacer el trámite de entrada para cada tarea.</p>
      </div>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>SSH Handshake:</strong> El proceso de establecer una conexión SSH segura incluye: intercambio de claves Diffie-Hellman, verificación del host key, autenticación del usuario (clave pública o contraseña) y negociación de cifrado. Este proceso toma entre 50ms y 500ms dependiendo de la latencia de red y la velocidad de los algoritmos criptográficos.</div>
      </div>
    `
  },
  {
    title: 'SSH Multiplexing — ControlMaster y ControlPersist',
    body: `
      <p>SSH multiplexing mantiene una conexión "maestra" abierta y crea conexiones secundarias (multiplexadas) que comparten el socket de la maestra, eliminando el overhead del handshake para las conexiones subsiguientes.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
        <pre class="language-ini"><code class="language-ini">[ssh_connection]
# ControlMaster=auto: crea el socket maestro si no existe; lo reutiliza si existe
# ControlPersist=60s: mantiene el socket maestro vivo 60s después del último uso
# Cambiar a ControlPersist=10m para playbooks con muchas tareas lentas
ssh_args = -o ControlMaster=auto -o ControlPersist=60s

# Directorio donde se guardan los sockets Unix del control master
# El directorio debe existir — Ansible no lo crea automáticamente
control_path_dir = ~/.ansible/cp

# Formato del path del socket (por defecto es adecuado para la mayoría de casos)
# control_path = %(directory)s/%%h-%%r</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">verificar-multiplexing.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Crear el directorio de control si no existe
mkdir -p ~/.ansible/cp

# Verificar que el directorio existe y tiene permisos correctos
ls -la ~/.ansible/cp

# Durante la ejecución del playbook, ver los sockets activos
ls -la ~/.ansible/cp/
# Verás archivos como: web01.empresa.com-ansible
# Estos son sockets Unix que mantienen la conexión SSH abierta

# Medir el impacto: ejecutar con timing
time ansible-playbook site.yml               # sin optimizaciones
time ansible-playbook site.yml               # segunda vez (con multiplexing activo)
# La segunda ejecución debería ser notablemente más rápida</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>ControlPersist y el control node:</strong> El socket maestro queda como proceso en background en el control node (tu máquina o el runner de CI/CD). Verificá con <code>ps aux | grep ssh</code> durante la ejecución — verás procesos SSH maestros por cada host. Se terminan solos después del timeout de ControlPersist.</div>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Límite de sockets en macOS:</strong> macOS tiene un límite en la longitud del path de sockets Unix. Si Ansible falla con "path too long for unix socket", configurá <code>control_path_dir = /tmp/cp</code> para usar un path más corto.</div>
      </div>
    `
  },
  {
    title: 'Pipelining — eliminar las escrituras a disco',
    body: `
      <p>SSH multiplexing elimina la reconexión. Pipelining va un paso más allá: elimina las escrituras de módulos Python a disco en el host remoto, reduciendo el número de operaciones SSH de 3 a 1 por tarea.</p>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Sin pipelining (comportamiento default):</strong><br>
          1. SSH → escribir módulo.py en /tmp/ansible-tmp-xxx/<br>
          2. SSH → python3 /tmp/ansible-tmp-xxx/modulo.py<br>
          3. SSH → rm -rf /tmp/ansible-tmp-xxx/<br><br>
          <strong>Con pipelining habilitado:</strong><br>
          1. SSH → cat | python3 (el módulo se envía por stdin, se ejecuta en memoria)
        </div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
        <pre class="language-ini"><code class="language-ini">[connection]
# Elimina escritura del módulo Python a disco en el host remoto
# Reduce conexiones SSH de 3 a 1 por tarea
# REQUIERE que requiretty esté deshabilitado en sudoers
pipelining = True</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">verificar-pipelining.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Verificar si requiretty está habilitado en los hosts
# (pipelining falla si está habilitado)
ansible all -m ansible.builtin.command -a "grep requiretty /etc/sudoers" --become

# Si la salida muestra "Defaults requiretty", necesitás deshabilitar
# Crear archivo en sudoers.d para override (más seguro que editar sudoers directamente)
ansible all -m ansible.builtin.copy --become \
  -a "content='Defaults !requiretty\n' dest=/etc/sudoers.d/ansible mode=0440"

# Verificar que pipelining funciona
ansible all -m ansible.builtin.ping  # debe funcionar sin errores</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>requiretty y pipelining — el conflicto clásico:</strong> <code>requiretty</code> en sudoers exige que sudo se ejecute desde una terminal real (TTY). Pipelining envía los módulos por stdin sin TTY, lo que hace que sudo los rechace. La solución es agregar <code>Defaults !requiretty</code> en <code>/etc/sudoers.d/ansible</code>. En sistemas RHEL/CentOS modernos esta línea ya está comentada por defecto, pero en sistemas más viejos puede ser un problema.</div>
      </div>
    `
  },
  {
    title: 'Configuración completa optimizada y medición de impacto',
    body: `
      <p>La combinación de multiplexing + pipelining puede reducir el tiempo de ejecución en un 40-70% dependiendo de la latencia de red y el número de tareas.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg — configuración de producción optimizada</span></div>
        <pre class="language-ini"><code class="language-ini">[defaults]
# Paralelismo — regla de oro: núcleos del control node × 2
forks = 20

# Gathering inteligente
gathering = smart
fact_caching = jsonfile
fact_caching_connection = /tmp/ansible_fact_cache
fact_caching_timeout = 86400

# Profiling para identificar tareas lentas
# callback_whitelist = profile_tasks,timer

[connection]
pipelining = True

[ssh_connection]
ssh_args = -o ControlMaster=auto -o ControlPersist=60s -o ServerAliveInterval=30
control_path_dir = ~/.ansible/cp

# Desactivar checking de host key en entornos de desarrollo (NO en producción)
# ssh_args = -o ControlMaster=auto -o ControlPersist=60s -o StrictHostKeyChecking=no</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">ansible.cfg — activar profiling de tareas</span></div>
        <pre class="language-yaml"><code class="language-yaml"># En ansible.cfg, habilitar el profiler para ver qué tareas son lentas:
[defaults]
callbacks_enabled = profile_tasks,timer

# Output al final del playbook:
# Tuesday 15 October  14:30:22 +0000 (0:00:15.234)  0:02:45.891
# ============================================================
# Gather facts            : 0:00:45.123   ← gather_facts es el más lento
# Deploy nginx.conf       : 0:00:12.456
# Restart nginx           : 0:00:08.234
# Install packages        : 0:00:05.678
# ...</code></pre>
      </div>
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio</div>
        <div class="lab-content">
          <p><strong>Objetivo:</strong> Medir el impacto real del multiplexing y pipelining en tu entorno.</p>
          <ol>
            <li>Creá un playbook con 10 tareas simples (debug o ping) sobre al menos 3 hosts</li>
            <li>Medí el tiempo sin optimizaciones: <code>time ansible-playbook sin-opt.yml</code></li>
            <li>Agregá la configuración de multiplexing y pipelining a ansible.cfg</li>
            <li>Medí de nuevo: <code>time ansible-playbook sin-opt.yml</code></li>
            <li>Calculá el porcentaje de mejora — debería ser notable incluso en LAN</li>
          </ol>
        </div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'SSH Multiplexing (ControlMaster)',
    definition: 'Técnica SSH que mantiene una conexión "maestra" abierta y permite que múltiples sesiones SSH compartan esa conexión sin repetir el handshake criptográfico. Configurado con ControlMaster=auto y ControlPersist en ssh_args de ansible.cfg. Puede reducir el tiempo de ejecución a la mitad en redes con alta latencia.',
  },
  {
    term: 'ControlPersist',
    definition: 'Opción de OpenSSH que define cuánto tiempo mantener viva la conexión maestra después del último uso. Con ControlPersist=60s, la conexión queda abierta 60 segundos adicionales. Durante ese tiempo, nuevas conexiones al mismo host la reutilizan instantáneamente sin handshake.',
  },
  {
    term: 'Pipelining',
    definition: 'Optimización de Ansible que elimina las escrituras de módulos Python a disco en el host remoto. En lugar de copiar el módulo a /tmp/, ejecutarlo, y borrarlo (3 conexiones SSH), el módulo se envía directamente por stdin al intérprete Python (1 conexión). Requiere que requiretty esté deshabilitado en sudoers.',
  },
  {
    term: 'requiretty (sudoers)',
    definition: 'Directiva de sudoers que exige que sudo se ejecute desde una terminal TTY real. Entra en conflicto con el pipelining de Ansible porque los módulos enviados por stdin no tienen TTY. Se deshabilita con Defaults !requiretty en /etc/sudoers.d/ansible.',
  },
  {
    term: 'profile_tasks callback',
    definition: 'Plugin callback de Ansible que mide el tiempo de ejecución de cada tarea y lo muestra ordenado al final del playbook. Se activa con callbacks_enabled = profile_tasks en ansible.cfg. Indispensable para identificar qué tareas son el cuello de botella antes de optimizar.',
  },
],
quiz: [
  {
    question: '¿Cuántas conexiones SSH abre Ansible por tarea sin ninguna optimización (sin pipelining)?',
    options: [
      '1 conexión (una sola para copiar y ejecutar)',
      '2 conexiones (copiar + ejecutar)',
      '3 conexiones (copiar módulo + ejecutar módulo + borrar módulo)',
      '5 conexiones (una por cada operación atómica)',
    ],
    correctIndex: 2,
    explanation: 'Sin pipelining, Ansible abre 3 conexiones SSH separadas por tarea: una para copiar el módulo Python al directorio temporal del host, una para ejecutarlo, y una para borrar el directorio temporal. Con SSH multiplexing, estas 3 conexiones reutilizan el socket maestro sin handshake. Con pipelining, se reduce a 1 sola conexión.',
  },
  {
    question: '¿Por qué pipelining requiere deshabilitar "requiretty" en sudoers?',
    options: [
      'Porque pipelining usa un protocolo diferente a SSH',
      'Porque los módulos enviados por stdin no tienen TTY, y requiretty exige TTY para sudo',
      'Porque pipelining necesita permisos de root directamente',
      'Porque requiretty bloquea conexiones paralelas',
    ],
    correctIndex: 1,
    explanation: 'requiretty en sudoers exige que sudo se ejecute desde una terminal (TTY) real. Cuando Ansible usa pipelining, envía el módulo Python por stdin de la conexión SSH — no hay TTY asignada. Al intentar hacer sudo con become: true, el sistema rechaza la operación porque no hay TTY. La solución es agregar "Defaults !requiretty" en /etc/sudoers.d/ansible.',
  },
  {
    question: '¿Qué callback de Ansible muestra el tiempo de ejecución de cada tarea al final del playbook?',
    options: [
      'timer_tasks',
      'profile_tasks',
      'debug_tasks',
      'benchmark',
    ],
    correctIndex: 1,
    explanation: 'El callback profile_tasks (activado con callbacks_enabled = profile_tasks en ansible.cfg) mide el tiempo de cada tarea y muestra un resumen ordenado al final del playbook. Es la herramienta principal para identificar cuellos de botella antes de optimizar. El callback timer muestra el tiempo total del playbook, y profile_tasks muestra el desglose por tarea.',
  },
],
troubleshooting: [
  {
    error: "Failed to connect to the host via ssh: unix_listener: ... path too long for Unix domain socket",
    cause: 'La ruta del socket de control SSH (control_path) es demasiado larga. Ocurre especialmente en macOS donde el límite de path para sockets Unix es más restrictivo que en Linux.',
    fix: 'Configurá un directorio de control con path más corto: en ansible.cfg agrega control_path_dir = /tmp/cp. Creá el directorio con mkdir -p /tmp/cp. El socket tendrá un path del tipo /tmp/cp/hostname-user.',
  },
  {
    error: "sudo: sorry, you must have a tty to run sudo",
    cause: 'Pipelining está habilitado pero el host tiene requiretty en /etc/sudoers. Cuando Ansible intenta ejecutar tareas con become: true vía pipelining (sin TTY), sudo rechaza la operación.',
    fix: 'Agregá "Defaults !requiretty" en /etc/sudoers.d/ansible en los hosts afectados: ansible all -m ansible.builtin.copy --become -a "content=\'Defaults !requiretty\\n\' dest=/etc/sudoers.d/ansible mode=0440". Alternativa temporal: deshabilitar pipelining con pipelining = False en ansible.cfg.',
  },
  {
    error: "Warning: Permanently added host to the list of known hosts — múltiples veces por host",
    cause: 'Los sockets de control SSH no persisten entre ejecuciones (ControlPersist expiró) o no están configurados correctamente, causando que Ansible reconecte y re-verifique el host key en cada tarea.',
    fix: 'Verificá que el directorio control_path_dir existe y tiene permisos correctos: mkdir -p ~/.ansible/cp && ls -la ~/.ansible/cp. Comprobá que ssh_args en ansible.cfg incluye -o ControlMaster=auto -o ControlPersist=60s. Verificá que no hay otra configuración SSH en ~/.ssh/config que sobreescriba estas opciones.',
  },
],
  };
