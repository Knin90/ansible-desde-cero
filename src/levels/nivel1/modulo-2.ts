import type { ModuleContent } from '../types';

export const nivel1Mod2: ModuleContent = {
  levelId: 1,
  moduleId: 2,
  title: 'Arquitectura general de Ansible',
  objective: 'Entender los componentes principales de Ansible: control node, managed nodes, inventario, playbooks y el rol de SSH y Python.',
  duration: '1.5 horas',
  objectives: [
    'Identificar los cinco componentes principales de Ansible y su función',
    'Describir el flujo completo de ejecución de un módulo desde el control node',
    'Configurar el intérprete Python en el inventario según el sistema operativo',
    'Explicar por qué Ansible es agentless y qué implica para los managed nodes',
  ],
  prerequisites: ['Historia y contexto de Ansible (Módulo 1 del Nivel 1)'],
  steps: [
    {
      title: 'Los cinco componentes principales',
      body: `
        <p>La arquitectura de Ansible es simple. Hay cinco conceptos que debés entender desde el principio:</p>
        <ol>
          <li><strong>Control Node</strong>: tu máquina, donde Ansible está instalado</li>
          <li><strong>Managed Nodes</strong>: los servidores que Ansible gestiona</li>
          <li><strong>Inventory</strong>: la lista de managed nodes</li>
          <li><strong>Playbook</strong>: las instrucciones de configuración en YAML</li>
          <li><strong>SSH + Python</strong>: el mecanismo de transporte y ejecución</li>
        </ol>
        <div class="analogy-box">
          <div class="analogy-box-header">💡 Analogía</div>
          <p>Pensá en Ansible como una empresa de logística. Vos sos la central de operaciones (control node), el camión es SSH, los almacenes son los servidores (managed nodes), el manifiesto de carga es el playbook, y el directorio de destinos es el inventario.</p>
        </div>
        <div class="tech-term-box">
          <div class="tech-term-label">En términos técnicos</div>
          El control node es la máquina donde Ansible está instalado y desde donde se ejecutan los playbooks. Los managed nodes son los servidores remotos gestionados, que solo requieren Python 3 y acceso SSH. El inventario es el archivo que mapea hosts a grupos, y el playbook es el documento YAML que declara el estado deseado.
        </div>
        <p>El diagrama de abajo muestra cómo estos componentes se relacionan:</p>
      `
    },
    {
      title: 'Control Node — tu punto de comando',
      body: `
        <p>El control node es la máquina donde instalás Ansible. Desde aquí ejecutás todos los playbooks y comandos. El control node necesita:</p>
        <ul>
          <li>Python 3.9 o superior</li>
          <li>Ansible instalado via pip</li>
          <li>Acceso SSH a los managed nodes</li>
          <li>El inventario de hosts a gestionar</li>
        </ul>
        <div class="warning-box">
          <span class="box-icon">⚠️</span>
          <div class="box-content"><strong>Ansible no funciona como control node en Windows.</strong> En Windows, usás WSL (Windows Subsystem for Linux) o una VM Linux como control node. Los managed nodes sí pueden ser Windows (usando WinRM en lugar de SSH).</div>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalar-ansible.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># En el control node — instalar Ansible
pip3 install ansible

# Verificar instalación
ansible --version
# ansible [core 2.17.x]
#   config file = /etc/ansible/ansible.cfg
#   python version = 3.11.x
#   jinja version = 3.x</code></pre>
        </div>
      `
    },
    {
      title: 'Managed Nodes — los servidores gestionados',
      body: `
        <p>Los managed nodes son los servidores que Ansible configura. <strong>No necesitan tener Ansible instalado</strong> — solo necesitan:</p>
        <ul>
          <li>Python 3.x instalado (para ejecutar módulos)</li>
          <li>Un servidor SSH corriendo (normalmente OpenSSH)</li>
          <li>Un usuario con acceso SSH (con clave pública del control node)</li>
          <li>Acceso a <code>sudo</code> si las tareas requieren privilegios</li>
        </ul>
        <p>Esto es lo que hace a Ansible "agentless" — no hay ningún daemon ni servicio especial corriendo en el managed node.</p>
        <div class="tip-box">
          <span class="box-icon">💡</span>
          <div class="box-content">Python ya viene instalado en casi todas las distribuciones Linux modernas. En Ubuntu 22.04, Debian 12, RHEL 9, etc., Python 3 está disponible por defecto.</div>
        </div>
      `
    },
    {
      title: 'El Inventario — el registro de hosts',
      body: `
        <p>El inventario es el archivo donde listás los managed nodes. Puede ser tan simple como una lista de IPs, o tan complejo como un sistema dinámico que consulta AWS o Azure.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">inventario/hosts.ini</span></div>
          <pre class="language-ini"><code class="language-ini"># Hosts sueltos
servidor-backup.ejemplo.com

# Grupo de servidores web
[servidores_web]
web1.ejemplo.com
web2.ejemplo.com

# Grupo de bases de datos
[bases_de_datos]
db1.ejemplo.com  ansible_user=postgres

# Grupo de grupos
[produccion:children]
servidores_web
bases_de_datos</code></pre>
        </div>
        <p>El inventario se pasa a Ansible con <code>-i inventario/hosts.ini</code> o se configura en <code>ansible.cfg</code>.</p>
      `
    },
    {
      title: 'El Playbook — las instrucciones',
      body: `
        <p>Un playbook es un archivo YAML que describe el estado deseado de los managed nodes. Define <strong>qué</strong> tiene que estar configurado, no <strong>cómo</strong> configurarlo.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">mi-primer-playbook.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">---
- name: Configurar servidor web completo     # nombre descriptivo del play
hosts: servidores_web                      # a qué grupo del inventario aplica
become: true                               # usar sudo para las tareas

tasks:                                     # lista de tareas a ejecutar
  - name: Instalar nginx
    ansible.builtin.apt:
      name: nginx
      state: present

  - name: Asegurar que nginx está corriendo
    ansible.builtin.service:
      name: nginx
      state: started
      enabled: true</code></pre>
        </div>
      `
    },
    {
      title: 'SSH como transporte',
      body: `
        <p>Ansible usa SSH para comunicarse con los managed nodes. El proceso es:</p>
        <ol>
          <li>Ansible abre una conexión SSH al managed node</li>
          <li>Copia el módulo Python (el código que ejecuta la tarea) a <code>/tmp</code> del host remoto</li>
          <li>Ejecuta el módulo Python en el host remoto</li>
          <li>Lee el resultado JSON que devuelve el módulo</li>
          <li>Borra el archivo temporal de <code>/tmp</code></li>
          <li>Cierra la conexión SSH (o la mantiene con multiplexing)</li>
        </ol>
        <div class="analogy-box">
          <div class="analogy-box-header">💡 Analogía</div>
          <p>SSH es el cartero de Ansible. Cada vez que Ansible necesita hacer algo en un servidor, le entrega el mensaje (el módulo Python), espera que lo ejecute, y trae la respuesta de vuelta.</p>
        </div>
        <div class="tech-term-box">
          <div class="tech-term-label">En términos técnicos</div>
          Ansible utiliza OpenSSH con multiplexing (ControlMaster) para reutilizar la misma conexión TCP entre múltiples tareas del mismo play, reduciendo la latencia. Cada módulo se transfiere como un archivo Python cifrado y se ejecuta con el intérprete configurado en <code>ansible_python_interpreter</code>.
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ver-conexion.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Ejecutar con máximo verbose para ver cada paso SSH
ansible all -m ping -vvv

# Verás algo como:
# <web1.ejemplo.com> SSH: EXEC ssh -C -o ControlMaster=auto ...
# <web1.ejemplo.com> PUT /tmp/ansible-tmp-xxx/ping.py
# <web1.ejemplo.com> EXEC python3 /tmp/ansible-tmp-xxx/ping.py
# <web1.ejemplo.com> FETCH /tmp/ansible-tmp-xxx/ping.py (deleted)</code></pre>
        </div>
      `
    },
    {
      title: 'Python en los hosts remotos',
      body: `
        <p>Python es el "motor" que ejecuta los módulos en el managed node. El intérprete Python debe ser detectable por Ansible.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">inventario/hosts.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">all:
hosts:
  servidor-rhel:
    ansible_python_interpreter: /usr/bin/python3    # explícito
  servidor-ubuntu:
    ansible_python_interpreter: auto                # detección automática
  servidor-legacy:
    ansible_python_interpreter: /usr/bin/python     # Python 2 (no recomendado)</code></pre>
        </div>
        <p>Con <code>auto</code>, Ansible busca Python 3 en las rutas comunes. Desde Ansible 2.12, <code>auto</code> es el comportamiento por defecto.</p>
      `
    },
    {
      title: 'El flujo completo en acción',
      body: `
        <p>Cuando ejecutás <code>ansible-playbook sitio.yml -i inventory/hosts.ini</code>:</p>
        <ol>
          <li>Ansible parsea el playbook YAML y valida la sintaxis</li>
          <li>Carga el inventario y resuelve qué hosts aplicar</li>
          <li>Recopila facts de los hosts (a menos que lo deshabilites)</li>
          <li>Para cada tarea, determina qué módulo usar</li>
          <li>Copia el módulo a los hosts vía SSH y lo ejecuta</li>
          <li>Procesa el resultado JSON — ¿cambió algo? ¿falló?</li>
          <li>Si hay handlers notificados, los ejecuta al final del play</li>
          <li>Muestra el resumen del playbook (ok, changed, failed)</li>
        </ol>
        <div class="internal-flow">
          <div class="internal-flow-header">🔍 ¿Qué ocurre internamente cuando ejecutás ansible-playbook?</div>
          <div class="internal-flow-steps">
            <div class="flow-step">
              <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
              <div class="flow-step-body">
                <div class="flow-step-title">Parser YAML</div>
                <div class="flow-step-desc">Ansible usa PyYAML para parsear el playbook. Si hay errores de sintaxis, el proceso falla aquí antes de conectarse a ningún host.</div>
              </div>
            </div>
            <div class="flow-step">
              <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
              <div class="flow-step-body">
                <div class="flow-step-title">Resolución de inventario</div>
                <div class="flow-step-desc">El inventory plugin carga y parsea el inventario. Resuelve grupos, variables de grupo (group_vars/) y variables de host (host_vars/).</div>
              </div>
            </div>
            <div class="flow-step">
              <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
              <div class="flow-step-body">
                <div class="flow-step-title">Recopilación de facts (gather_facts)</div>
                <div class="flow-step-desc">Ansible ejecuta el módulo setup en cada host para recolectar información del sistema: OS, interfaces de red, memoria, CPU, etc. Estos facts están disponibles como variables en el playbook.</div>
              </div>
            </div>
            <div class="flow-step">
              <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
              <div class="flow-step-body">
                <div class="flow-step-title">Ejecución de tareas (task loop)</div>
                <div class="flow-step-desc">Para cada tarea: evalúa condiciones (when), resuelve variables Jinja2, selecciona el módulo, genera el código Python con los parámetros, y lo envía a los hosts (en paralelo si forks > 1).</div>
              </div>
            </div>
            <div class="flow-step">
              <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
              <div class="flow-step-body">
                <div class="flow-step-title">Procesamiento del resultado</div>
                <div class="flow-step-desc">Si changed=true, registra el cambio. Si notify está definido, marca el handler para ejecutar al final del play. Si failed=true, por defecto detiene la ejecución para ese host.</div>
              </div>
            </div>
            <div class="flow-step">
              <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
              <div class="flow-step-body">
                <div class="flow-step-title">Ejecución de handlers</div>
                <div class="flow-step-desc">Al finalizar el play, se ejecutan los handlers que fueron notificados durante la ejecución de tareas. Un handler se ejecuta una sola vez, sin importar cuántas tareas lo notificaron.</div>
              </div>
            </div>
            <div class="flow-step">
              <div class="flow-step-connector"><div class="flow-step-dot"></div></div>
              <div class="flow-step-body">
                <div class="flow-step-title">Play recap</div>
                <div class="flow-step-desc">Muestra el resumen final: ok=X changed=Y unreachable=Z failed=W. Si failed o unreachable > 0, el proceso termina con código de salida no-cero.</div>
              </div>
            </div>
          </div>
        </div>
      `
    },
    {
      title: 'Múltiples tipos de transporte',
      body: `
        <p>Aunque SSH es el transporte por defecto, Ansible soporta otros:</p>
        <ul>
          <li><strong>SSH</strong> (default): para Linux/macOS managed nodes</li>
          <li><strong>WinRM</strong>: para Windows managed nodes</li>
          <li><strong>Local</strong>: ejecutar en el control node mismo</li>
          <li><strong>Docker</strong>: ejecutar en contenedores</li>
          <li><strong>Podman</strong>: igual que Docker</li>
          <li><strong>Network CLI</strong>: para dispositivos de red (Cisco, Juniper)</li>
        </ul>
      `
    },
    {
      title: 'Resumen de arquitectura',
      body: `
        <div class="highlight-box">
          <p><strong>Control Node</strong> (tiene Ansible) → SSH → <strong>Managed Node</strong> (tiene Python) → ejecuta módulo → devuelve JSON → <strong>Control Node</strong> muestra resultado.</p>
        </div>
        <div class="lab-box">
          <div class="lab-box-header">🧪 Laboratorio</div>
          <div class="lab-section">
            <div class="lab-section-title">Objetivo</div>
            <p style="font-size:0.9rem;color:var(--color-text-muted);line-height:1.65">Observar en tiempo real cómo Ansible usa SSH para conectarse a los hosts y ejecutar módulos.</p>
          </div>
          <div class="lab-section">
            <div class="lab-section-title">Pasos</div>
            <ol>
              <li>Creá un inventario con al menos 2 hosts (pueden ser VMs locales)</li>
              <li>Verificá conectividad SSH sin contraseña a ambos hosts</li>
              <li>Ejecutá <code>ansible all -m ping -vv</code> y observá la salida</li>
              <li>Ejecutá <code>ansible all -m ping -vvv</code> para ver los comandos SSH exactos</li>
            </ol>
          </div>
          <div class="lab-section">
            <div class="lab-section-title">Verificación</div>
            <ul>
              <li>Ambos hosts responden con <code>SUCCESS</code> y <code>"ping": "pong"</code></li>
              <li>En la salida <code>-vvv</code> podés ver la línea <code>PUT /tmp/.ansible/tmp/.../AnsiballZ_ping.py</code></li>
            </ul>
          </div>
          <div class="lab-section">
            <div class="lab-section-title">Resultado esperado</div>
            <div class="lab-expected">
              <div class="lab-expected-item"><span class="lab-expected-check">✓</span> <code>ansible all -m ping</code> responde <code>SUCCESS</code> en ambos hosts</div>
              <div class="lab-expected-item"><span class="lab-expected-check">✓</span> La salida con <code>-vvv</code> muestra claramente el proceso de copia del módulo Python</div>
              <div class="lab-expected-item"><span class="lab-expected-check">✓</span> El inventario tiene al menos dos hosts en grupos separados</div>
            </div>
          </div>
          <div class="lab-section">
            <div class="lab-section-title">Preguntas para reflexionar</div>
            <ul>
              <li>¿Cuántas conexiones SSH abre Ansible por tarea cuando hay 10 hosts?</li>
              <li>¿Qué ventaja tiene el SSH multiplexing (<code>ControlPersist</code>) para Ansible?</li>
            </ul>
          </div>
        </div>
        <div class="next-chapter-box">
          <div class="next-chapter-arrow">→</div>
          <div>
            <div class="next-chapter-label">A continuación</div>
            <div class="next-chapter-title">Características clave de Ansible</div>
            <div class="next-chapter-desc">Agentless, idempotencia, declarativo, push model, SSH nativo — las cinco decisiones de diseño que hacen que Ansible sea único.</div>
          </div>
        </div>
      `
    }
  ],
  quiz: [
    {
      question: '¿Cuáles son los 5 componentes principales de Ansible?',
      options: [
        'Control Node, Agente, Servidor, Base de datos, Dashboard',
        'Control Node, Managed Nodes, Inventory, Playbook, SSH + Python',
        'Master, Worker, Queue, Storage, Monitor',
        'Controller, Runner, Parser, Executor, Logger',
      ],
      correctIndex: 1,
      explanation: 'Los 5 componentes son: Control Node (tu máquina con Ansible), Managed Nodes (los servidores), Inventory (la lista de hosts), Playbook (las instrucciones en YAML), y SSH + Python (el transporte y ejecución).',
    },
    {
      question: '¿Qué ocurre en el host remoto cuando Ansible ejecuta una tarea?',
      options: [
        'Ansible instala un agente permanente que espera órdenes',
        'Ansible copia un módulo Python a /tmp, lo ejecuta y lo borra',
        'El host remoto descarga el playbook de Internet',
        'Ansible modifica el registro del sistema operativo',
      ],
      correctIndex: 1,
      explanation: 'Ansible copia el módulo Python al /tmp del host remoto, lo ejecuta (obteniendo un resultado JSON), y luego lo borra. El host queda exactamente igual que antes excepto por el cambio que hizo el módulo.',
    },
    {
      question: '¿Por qué Windows NO puede ser Control Node de Ansible?',
      options: [
        'Windows no soporta Python',
        'Ansible no tiene versión para Windows',
        'El intérprete de Python no es compatible con Windows',
        'Ansible no soporta OpenSSH nativo en Windows como control node',
      ],
      correctIndex: 3,
      explanation: 'Ansible requiere un entorno Unix-like como Control Node porque depende de OpenSSH y del sistema de archivos Unix. En Windows, se usa WSL (Windows Subsystem for Linux). Los Managed Nodes sí pueden ser Windows (usando WinRM).',
    },
  ],
  realWorldCase: 'Una empresa de hosting gestiona 3.000 servidores con un único Control Node Ansible. Cuando necesitan aplicar un parche de seguridad, ejecutan un playbook que alcanza todos los servidores en paralelo (forks). Lo que manualmente tomaría semanas se completa en horas — y es idempotente, por lo que pueden repetirlo sin riesgo.',
};
