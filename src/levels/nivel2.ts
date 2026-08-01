import type { ModuleContent } from './types';

export const nivel2Modules: ModuleContent[] = [
  {
    levelId: 2,
    moduleId: 1,
    title: 'Flujo interno completo de Ansible',
    objective: 'Entender los 13 pasos que ocurren internamente desde que ejecutás ansible-playbook hasta ver el resultado en pantalla.',
    duration: '2 horas',
    objectives: [
      'Describir los 13 pasos del flujo interno de ansible-playbook en orden',
      'Identificar en qué paso falla un playbook según el mensaje de error',
      'Explicar qué hace el Strategy Plugin y cómo afecta la ejecución paralela',
      'Usar ansible-playbook --syntax-check y ansible-inventory para depurar etapas tempranas',
    ],
    prerequisites: [
      'Nivel 0 completo: qué es Ansible, instalación y primer playbook',
      'Nivel 1 completo: playbooks, módulos, variables, handlers y roles',
    ],
    steps: [
      {
        title: 'Por qué importa conocer el flujo interno',
        body: `
          <p>Ansible parece simple desde afuera: escribís un playbook, lo ejecutás, funciona. Pero cuando algo falla, o cuando querés optimizar la velocidad, o cuando necesitás extender Ansible con plugins propios, necesitás entender qué pasa por dentro.</p>
          <p>El flujo interno de Ansible tiene 13 etapas bien definidas. Cada etapa tiene su propia responsabilidad y puntos de extensión. Conocerlas te convierte de un usuario de Ansible en alguien que puede diagnosticar cualquier problema.</p>
        `
      },
      {
        title: 'Paso 1-3: CLI, Parser YAML e Inventory',
        body: `
          <p><strong>Paso 1 — CLI</strong>: cuando ejecutás <code>ansible-playbook sitio.yml -i inventario/</code>, la CLI de Ansible parsea los argumentos, carga <code>ansible.cfg</code> (en el directorio actual, en <code>~/.ansible.cfg</code>, o en <code>/etc/ansible/ansible.cfg</code>) y establece las opciones de configuración.</p>
          <p><strong>Paso 2 — Parser YAML</strong>: el playbook se lee y valida como YAML. Si hay un error de sintaxis (un tab en lugar de espacios, comillas sin cerrar), falla aquí con un mensaje claro. El resultado es un árbol de objetos Python que representa el playbook.</p>
          <p><strong>Paso 3 — Inventory Engine</strong>: se carga el inventario (estático o dinámico). Se resuelven los grupos, se aplican las variables de inventario, <code>group_vars/</code> y <code>host_vars/</code>. El resultado es un diccionario con todos los hosts y sus variables iniciales.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">debug-flujo-interno.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Ver qué inventario se carga y cómo se resuelve
ansible-inventory -i inventario/ --list

# Ver configuración activa cargada por la CLI
ansible-config dump --only-changed

# Parsear un playbook sin ejecutarlo (solo sintaxis)
ansible-playbook --syntax-check sitio.yml</code></pre>
          </div>
        `
      },
      {
        title: 'Paso 4-6: Variables, Facts y Strategy',
        body: `
          <p><strong>Paso 4 — Variables</strong>: todas las fuentes de variables se mergean en orden de precedencia. Variables de inventario + group_vars + host_vars + vars del play + extra-vars. El resultado es un contexto de variables completo para cada host.</p>
          <p><strong>Paso 5 — Facts (gather_facts)</strong>: si <code>gather_facts: true</code> (el default), Ansible ejecuta el módulo <code>setup</code> en cada host remoto. Este módulo recolecta cientos de hechos sobre el sistema: distribución Linux, memoria RAM, interfaces de red, directorios montados. Los facts se agregan al contexto de variables del host.</p>
          <p><strong>Paso 6 — Strategy Plugin</strong>: el plugin de estrategia decide cómo distribuir la ejecución de las tareas entre múltiples hosts. La estrategia <code>linear</code> (default) ejecuta cada task en todos los hosts antes de pasar a la siguiente. La estrategia <code>free</code> deja que cada host avance a su propio ritmo.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">play-configuracion.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">- name: Configurar servidores web
  hosts: servidores_web
  gather_facts: true          # Paso 5: activa el módulo setup
  strategy: linear            # Paso 6: todos los hosts paso a paso
  vars:                       # Paso 4: variables del play
    http_port: 80
    max_workers: 4</code></pre>
          </div>
        `
      },
      {
        title: 'Paso 7-10: Task Queue, SSH, Action Plugin y Python',
        body: `
          <p><strong>Paso 7 — Task Queue</strong>: el Strategy Plugin construye una cola de tareas. Según el número de <em>forks</em> configurado (default: 5), Ansible puede ejecutar la misma tarea en hasta 5 hosts en paralelo usando procesos separados.</p>
          <p><strong>Paso 8 — SSH Plugin</strong>: para cada host, el Connection Plugin (por defecto <code>paramiko</code> o <code>ssh</code>) establece la conexión SSH. Ansible reutiliza conexiones SSH con ControlMaster para evitar el overhead de establecer una nueva conexión por cada tarea.</p>
          <p><strong>Paso 9 — Action Plugin</strong>: cada módulo tiene un Action Plugin asociado que decide si la lógica corre localmente (en el nodo de control) o remotamente (en el host). Por ejemplo, el módulo <code>template</code> renderiza el template Jinja2 localmente y luego copia el resultado al host remoto.</p>
          <p><strong>Paso 10 — Módulo Python</strong>: el módulo Python se transfiere al host remoto (vía SFTP o base64 en el canal SSH), se ejecuta con Python 3, y devuelve un JSON con los campos: <code>changed</code>, <code>failed</code>, <code>msg</code>, y los datos específicos del módulo.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">json</span><span class="code-block-filename">resultado-modulo.json</span></div>
            <pre class="language-json"><code class="language-json">{
  "changed": true,
  "msg": "service nginx restarted",
  "name": "nginx",
  "state": "started",
  "status": {
    "ActiveState": "active",
    "LoadState": "loaded"
  },
  "invocation": {
    "module_args": { "name": "nginx", "state": "restarted" }
  }
}</code></pre>
          </div>
        `
      },
      {
        title: 'Paso 11-13: JSON Result, Callback y Pantalla',
        body: `
          <p><strong>Paso 11 — JSON Result</strong>: el resultado JSON del módulo vuelve a Ansible Core. Si <code>failed: true</code> (o si el módulo terminó con código de salida no cero), Ansible marca la tarea como fallida. Si <code>changed: true</code>, los handlers asociados se encolan para dispararse al final del play.</p>
          <p><strong>Paso 12 — Callback Plugin</strong>: el resultado pasa por el Callback Plugin activo (configurado con <code>stdout_callback</code> en ansible.cfg). El callback default imprime la salida en la terminal. Existen callbacks para JSON, YAML, timer, mail, Slack, y más.</p>
          <p><strong>Paso 13 — Pantalla</strong>: el usuario ve el resultado final: <code>ok</code>, <code>changed</code>, <code>failed</code>, o <code>unreachable</code>. Al final del playbook se muestra el resumen (PLAY RECAP) con los contadores por host.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">salida-ansible.txt</span></div>
            <pre class="language-bash"><code class="language-bash">PLAY [Configurar servidores web] ***********************

TASK [Gathering Facts] *********************************
ok: [web1.ejemplo.com]
ok: [web2.ejemplo.com]

TASK [Instalar nginx] **********************************
changed: [web1.ejemplo.com]
changed: [web2.ejemplo.com]

RUNNING HANDLERS ************************************
changed: [web1.ejemplo.com] => handler: Reiniciar nginx

PLAY RECAP ******************************************
web1.ejemplo.com    : ok=3  changed=2  unreachable=0  failed=0
web2.ejemplo.com    : ok=2  changed=1  unreachable=0  failed=0</code></pre>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">Inventory Engine</div>
              <div class="next-chapter-desc">Profundizás en cómo Ansible construye el mapa de hosts y grupos a partir de múltiples fuentes de inventario.</div>
            </div>
          </div>
        `
      }
    ],
    quiz: [
      {
        question: '¿En qué paso del flujo interno falla un playbook si hay un error de indentación en el YAML?',
        options: [
          'Paso 1 — CLI (carga de ansible.cfg)',
          'Paso 2 — Parser YAML',
          'Paso 3 — Inventory Engine',
          'Paso 7 — Task Queue',
        ],
        correctIndex: 1,
        explanation: 'El Parser YAML (Paso 2) valida la sintaxis del playbook antes de cualquier ejecución. Un error de indentación o una coma faltante se detecta aquí con un mensaje "ERROR! Syntax Error".',
      },
      {
        question: '¿Qué componente decide si la tarea 1 se ejecuta en web1 y web2 antes de pasar a la tarea 2?',
        options: [
          'El SSH Plugin (Paso 8)',
          'El Action Plugin (Paso 9)',
          'El Strategy Plugin (Paso 6)',
          'El Callback Plugin (Paso 12)',
        ],
        correctIndex: 2,
        explanation: 'El Strategy Plugin (Paso 6) controla el orden y paralelismo de ejecución. La estrategia "linear" garantiza que todos los hosts completen la tarea N antes de avanzar a la tarea N+1.',
      },
      {
        question: '¿Por qué el módulo "template" renderiza el archivo Jinja2 localmente (Paso 9) y no en el host remoto?',
        options: [
          'Porque los hosts remotos no tienen Python instalado',
          'Porque Jinja2 no está disponible en los hosts remotos',
          'Porque las variables del contexto existen en el nodo de control, donde el Action Plugin puede accederlas directamente',
          'Porque es más rápido transferir el resultado ya renderizado',
        ],
        correctIndex: 2,
        explanation: 'El Action Plugin de "template" corre en el nodo de control donde viven todas las variables (hostvars, group_vars, facts). Renderizar ahí es correcto por diseño; la alternativa requeriría serializar y transferir todo el contexto de variables al host remoto.',
      },
    ],
    realWorldCase: 'Un ingeniero DevOps nota que su playbook falla con "UNREACHABLE" en el Paso 8 (SSH) pero no en el Paso 2 (Parser YAML). Conocer el flujo interno le permite diagnosticar inmediatamente que el problema es de conectividad SSH, no de sintaxis, y apunta directo a revisar claves, puertos y firewall en lugar de revisar el YAML.',
    troubleshooting: [
      {
        error: 'ERROR! Syntax Error while loading YAML.',
        cause: 'El playbook tiene un error de indentación, un tab en lugar de espacios, o comillas sin cerrar. El Parser YAML (Paso 2) rechaza el archivo antes de cualquier conexión.',
        fix: 'Ejecutá "ansible-playbook --syntax-check sitio.yml" para identificar la línea exacta. Usá un linter como "ansible-lint" o "yamllint" para prevenir estos errores.',
      },
      {
        error: 'fatal: [web1]: UNREACHABLE! => {"msg": "Failed to connect to the host via ssh"}',
        cause: 'El SSH Plugin (Paso 8) no pudo establecer conexión. Causas posibles: host apagado, puerto SSH incorrecto, clave SSH no autorizada, o firewall bloqueando el puerto.',
        fix: 'Verificá conectividad manual con "ssh -vvv usuario@web1". Revisá "ansible_port", "ansible_user" y "ansible_ssh_private_key_file" en tu inventario. Comprobá el firewall con "telnet web1 22".',
      },
      {
        error: 'El playbook termina sin errores pero los cambios no se aplicaron (changed=0 en todos los hosts)',
        cause: 'gather_facts falló silenciosamente (Paso 5) o las condiciones "when:" de las tareas evaluaron como false debido a facts incorrectos o variables no resueltas en el Paso 4.',
        fix: 'Ejecutá "ansible -m setup web1" para verificar que gather_facts funciona. Usá "ansible-playbook --verbose sitio.yml" y revisá el valor de las variables con "debug: var=mi_variable" antes de los condicionales.',
      },
    ],
  },
  {
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
  },
  {
    levelId: 2,
    moduleId: 3,
    title: 'Strategy Plugin — Control de ejecución',
    objective: 'Comprender cómo el Strategy Plugin controla el orden y paralelismo de ejecución de tareas en múltiples hosts.',
    duration: '1 hora',
    objectives: [
      'Distinguir el comportamiento de las estrategias linear, free y debug',
      'Elegir la estrategia correcta según el tipo de playbook y riesgo de fallo',
      'Usar la estrategia debug para inspeccionar variables en tareas fallidas',
      'Configurar serial para rolling updates controlados',
    ],
    prerequisites: [
      'Nivel 2, Módulo 2: Inventory Engine — Cómo Ansible resuelve los hosts',
    ],
    steps: [
      {
        title: 'Strategy linear (default)',
        body: `
          <p>La estrategia <code>linear</code> es el comportamiento default. Ansible ejecuta cada tarea en todos los hosts antes de avanzar a la siguiente tarea. Esto garantiza que todos los hosts estén en el mismo estado en cada punto de la ejecución.</p>
          <p>Ventaja: fácil de razonar, los handlers funcionan correctamente, los rolling updates son predecibles. Desventaja: un host lento retrasa a todos los demás.</p>
        `
      },
      {
        title: 'Strategy free y debug',
        body: `
          <p>La estrategia <code>free</code> deja que cada host avance a su propio ritmo. Un host puede estar ejecutando la tarea 10 mientras otro recién empieza la tarea 3. Esto maximiza el uso de los forks y es más rápido para playbooks con tareas de larga duración.</p>
          <p>La estrategia <code>debug</code> pausa la ejecución en cada tarea fallida y abre una consola interactiva para inspeccionar variables y ejecutar módulos manualmente. Muy útil para debugging.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbook-estrategias.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">- name: Deploy paralelo sin orden garantizado
  hosts: servidores_web
  strategy: free           # Cada host a su ritmo
  tasks:
    - name: Actualizar paquetes
      ansible.builtin.package:
        name: "*"
        state: latest

- name: Debug de tareas fallidas
  hosts: staging
  strategy: debug          # Pausa en errores para inspección
  tasks:
    - name: Task problemática
      ansible.builtin.command: mi-script-raro.sh</code></pre>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">Action Plugins</div>
              <div class="next-chapter-desc">Descubrís qué parte de la lógica se ejecuta localmente y qué parte va al host remoto, el corazón de la extensibilidad de Ansible.</div>
            </div>
          </div>
        `
      }
    ],
    quiz: [
      {
        question: 'Con la estrategia "linear" y forks=5, tenés 10 hosts. ¿Cuántos hosts ejecutan la Tarea 1 simultáneamente como máximo?',
        options: [
          '10 hosts — todos a la vez',
          '5 hosts — limitado por el número de forks',
          '1 host — linear ejecuta uno por uno',
          'Depende del número de cores de CPU del nodo de control',
        ],
        correctIndex: 1,
        explanation: '"forks" define el número máximo de procesos paralelos. Con forks=5 y 10 hosts, Ansible lanza 5 procesos simultáneos para la Tarea 1, espera a que terminen, lanza los 5 restantes, y recién entonces avanza a la Tarea 2. Linear garantiza el orden entre tareas, los forks controlan el paralelismo dentro de cada tarea.',
      },
      {
        question: '¿En qué escenario es PELIGROSO usar la estrategia "free"?',
        options: [
          'Cuando actualizás paquetes del sistema operativo',
          'Cuando tenés un handler que depende de que una tarea anterior termine en todos los hosts',
          'Cuando el playbook tiene más de 20 tareas',
          'Cuando usás módulos de la colección community.general',
        ],
        correctIndex: 1,
        explanation: 'Con "free", un host puede estar ejecutando la tarea 10 mientras otro ejecuta la tarea 2. Si un handler necesita que todos los hosts completen una tarea específica antes de dispararse, "free" puede generar race conditions. "linear" garantiza sincronización entre hosts en cada tarea.',
      },
      {
        question: '¿Cuál es el principal caso de uso de la estrategia "debug"?',
        options: [
          'Reducir el tiempo de ejecución en playbooks grandes',
          'Ejecutar tareas en paralelo en hosts de staging',
          'Pausar la ejecución en tareas fallidas y permitir inspección interactiva de variables',
          'Generar logs más detallados en ansible.cfg',
        ],
        correctIndex: 2,
        explanation: 'La estrategia "debug" pausa la ejecución cuando una tarea falla y abre una consola interactiva donde podés inspeccionar variables, ejecutar módulos manualmente, y decidir si saltear o reintentar la tarea. Es el equivalente de un breakpoint en un debugger de código.',
      },
    ],
    realWorldCase: 'Un equipo necesita hacer un rolling update de 100 servidores web sin downtime total. Usan "serial: 10" con estrategia "linear" para actualizar 10 servidores por vez, verificar que están healthy, y continuar con el siguiente batch, garantizando que al menos 90 servidores sirven tráfico en todo momento.',
    troubleshooting: [
      {
        error: 'El playbook es extremadamente lento con muchos hosts aunque las tareas son simples',
        cause: 'El número de forks es demasiado bajo (default: 5). Con 100 hosts y forks=5, la Tarea 1 necesita 20 rondas de ejecución secuencial antes de avanzar.',
        fix: 'Aumentá los forks en ansible.cfg: "forks = 20" o "forks = 50". También considerá "strategy: free" si las tareas son independientes entre hosts. Verificá que el nodo de control tiene suficiente memoria para los procesos adicionales.',
      },
      {
        error: 'fatal: [host1]: FAILED! y el playbook se detiene sin ejecutar el resto de los hosts',
        cause: 'Con la estrategia "linear", cuando un host falla, Ansible lo marca como "failed" pero continúa con los demás hosts en esa tarea. Sin embargo, si "any_errors_fatal: true" está configurado, un fallo en cualquier host detiene todo el play.',
        fix: 'Revisá si "any_errors_fatal: true" está en el play o en ansible.cfg. Usá "ignore_errors: true" en tareas no críticas. Para diagnóstico, cambiá temporalmente a "strategy: debug" para inspeccionar el estado del host fallido.',
      },
      {
        error: 'Con "serial: 10", los handlers se ejecutan después de cada batch en lugar de al final',
        cause: 'Este es el comportamiento correcto e intencional de "serial": los handlers se ejecutan al final de cada batch serial, no al final del play completo. Esto puede causar sorpresas si los handlers dependen de datos de todos los hosts.',
        fix: 'Si necesitás que un handler corra una sola vez al final del play completo, usá "run_once: true" en el handler. Para reiniciar un load balancer solo cuando todos los backends están listos, colocá esa lógica en un play separado después del play con "serial".',
      },
    ],
  },
  {
    levelId: 2,
    moduleId: 4,
    title: 'Action Plugins — Lógica local vs remota',
    objective: 'Entender qué son los Action Plugins y cómo deciden dónde se ejecuta la lógica de cada módulo.',
    duration: '1 hora',
    objectives: [
      'Explicar la diferencia entre un módulo y su Action Plugin asociado',
      'Identificar qué módulos ejecutan lógica en el control node (template, copy, fetch)',
      'Entender por qué template renderiza Jinja2 localmente antes de transferir el resultado',
      'Reconocer los Action Plugins como el principal punto de extensibilidad de Ansible',
    ],
    prerequisites: [
      'Nivel 2, Módulo 3: Strategy Plugin — Control de ejecución',
    ],
    steps: [
      {
        title: 'Qué es un Action Plugin',
        body: `
          <p>Cada módulo de Ansible tiene un Action Plugin asociado que se ejecuta en el nodo de control (tu máquina). El Action Plugin decide qué parte del trabajo se hace localmente y qué parte se transfiere y ejecuta en el host remoto.</p>
          <p>Para la mayoría de los módulos (como <code>ansible.builtin.package</code>), el Action Plugin simplemente transfiere el módulo Python al host y lo ejecuta. Pero para módulos como <code>template</code> o <code>copy</code>, el Action Plugin hace trabajo real localmente.</p>
        `
      },
      {
        title: 'Ejemplos de Action Plugins con lógica local',
        body: `
          <p><strong>template</strong>: el Action Plugin renderiza el archivo Jinja2 en el nodo de control (donde están las variables), luego transfiere el archivo renderizado al host remoto. Nunca transfiere el template original ni las variables al host.</p>
          <p><strong>copy</strong>: calcula el checksum del archivo localmente, lo compara con el checksum del host remoto (si existe), y solo transfiere si son diferentes.</p>
          <p><strong>fetch</strong>: trae un archivo del host remoto al nodo de control.</p>
          <p><strong>include_tasks / import_tasks</strong>: son puramente locales — leen y procesan archivos YAML sin ninguna conexión remota.</p>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Implicación práctica:</strong> los Action Plugins son el punto de extensión más poderoso de Ansible. Podés crear módulos que hagan cualquier cosa en el nodo de control antes o después de la ejecución remota.</div>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">Callback Plugins</div>
              <div class="next-chapter-desc">Controlás cómo Ansible formatea y envía la salida: terminal, JSON, Slack, correo y métricas.</div>
            </div>
          </div>
        `
      }
    ],
    quiz: [
      {
        question: '¿Por qué el módulo "template" no transfiere el archivo .j2 original al host remoto?',
        options: [
          'Porque Jinja2 no está instalado en los hosts remotos por defecto',
          'Porque el Action Plugin renderiza el template en el nodo de control donde viven las variables, y transfiere solo el resultado ya renderizado',
          'Porque transferir archivos .j2 no está soportado por el protocolo SSH',
          'Porque es una optimización de rendimiento para reducir el tamaño de la transferencia',
        ],
        correctIndex: 1,
        explanation: 'El Action Plugin de "template" corre en el nodo de control donde el contexto completo de variables (hostvars, facts, group_vars) está disponible. Renderizar remotamente requeriría serializar y transferir cientos de variables. Además, algunas variables (como lookup() de archivos locales) son imposibles de evaluar remotamente.',
      },
      {
        question: '¿Qué Action Plugin es "puramente local" — nunca establece conexión SSH al host remoto?',
        options: [
          'ansible.builtin.copy',
          'ansible.builtin.fetch',
          'ansible.builtin.import_tasks',
          'ansible.builtin.package',
        ],
        correctIndex: 2,
        explanation: '"import_tasks" e "include_tasks" son procesados completamente por el Action Plugin localmente: leen archivos YAML del nodo de control y los insertan en el flujo de ejecución. No hay conexión SSH ni transferencia de módulos. "copy", "fetch" y "package" todos requieren conexión remota.',
      },
      {
        question: 'Un módulo custom necesita leer un certificado de una Vault local ANTES de transferirlo al host remoto. ¿Dónde debería implementarse esa lógica?',
        options: [
          'En el módulo Python que corre en el host remoto',
          'En el Action Plugin que corre en el nodo de control, antes de la ejecución remota',
          'En un handler que se ejecuta después de la tarea',
          'En una tarea "delegate_to: localhost" separada',
        ],
        correctIndex: 1,
        explanation: 'El Action Plugin es el lugar correcto para lógica pre/post-ejecución en el nodo de control: autenticación con Vault, descifrado de secretos, procesamiento local de archivos. El módulo Python solo debería recibir el dato ya procesado y aplicarlo en el host remoto.',
      },
    ],
    realWorldCase: 'Un equipo de seguridad escribe un Action Plugin custom que intercepta el módulo "copy" para archivos con extensión ".pem": antes de transferir, verifica que el certificado no está vencido y que el hash coincide con el registro en su CA interna. Si la verificación falla, aborta la tarea con un mensaje descriptivo — todo sin modificar el módulo original ni los playbooks existentes.',
    troubleshooting: [
      {
        error: 'El módulo "template" genera el archivo correcto localmente pero falla al copiarlo al host',
        cause: 'El Action Plugin de "template" tiene dos fases: (1) renderizar Jinja2 localmente y (2) transferir via copy. La falla en la transferencia generalmente indica permisos insuficientes en el directorio destino del host remoto, o falta de espacio en disco.',
        fix: 'Verificá permisos con "ansible host -m shell -a \'ls -la /directorio/destino/\'". Comprobá espacio con "df -h". Si el problema es el propietario del directorio, usá "become: true" en la tarea de template o pre-crea el directorio con los permisos correctos.',
      },
      {
        error: 'ansible.builtin.fetch no trae el archivo — "msg": "file not found"',
        cause: 'El Action Plugin de "fetch" primero verifica que el archivo existe en el host remoto antes de transferirlo. Si la ruta es incorrecta o el archivo no existe en ese host, falla. También puede fallar si el usuario remoto no tiene permisos de lectura sobre el archivo.',
        fix: 'Verificá la existencia con "ansible host -m stat -a \'path=/ruta/al/archivo\'". Usá "fail_on_missing: false" si querés que la tarea continue cuando el archivo no existe. Para archivos de root, asegurate de usar "become: true".',
      },
      {
        error: 'Un Action Plugin custom no se carga — "ERROR! no action detected in task"',
        cause: 'Ansible busca Action Plugins en rutas específicas: action_plugins/ relativo al playbook, a los roles, o en las rutas configuradas en DEFAULT_ACTION_PLUGIN_PATH en ansible.cfg. Si el archivo no está en ninguna de esas rutas o tiene el nombre incorrecto, no se detecta.',
        fix: 'Verificá que el archivo está en "action_plugins/" relativo a tu playbook. El nombre del archivo debe ser "nombre_del_modulo.py" (sin "action_" prefix). Confirmá con "ansible-doc -t action -l" que el plugin aparece en la lista de plugins disponibles.',
      },
    ],
  },
  {
    levelId: 2,
    moduleId: 5,
    title: 'Callback Plugins — Control de la salida',
    objective: 'Aprender cómo los Callback Plugins controlan la salida de Ansible y cómo usarlos para logging, notificaciones y métricas.',
    duration: '45 minutos',
    objectives: [
      'Configurar stdout_callback en ansible.cfg para cambiar el formato de salida',
      'Usar el callback profile_tasks para identificar las tareas más lentas',
      'Parsear la salida JSON de Ansible con jq para integraciones externas',
      'Entender los hooks de ciclo de vida que expone el sistema de callbacks',
    ],
    prerequisites: [
      'Nivel 2, Módulo 4: Action Plugins — Lógica local vs remota',
    ],
    steps: [
      {
        title: 'Qué son los Callback Plugins',
        body: `
          <p>Los Callback Plugins son hooks que Ansible llama en puntos específicos de la ejecución: al iniciar un play, al terminar una tarea, al recibir un resultado, al finalizar el playbook. Son el mecanismo para personalizar completamente la salida y el comportamiento de Ansible.</p>
        `
      },
      {
        title: 'Callbacks integrados más útiles',
        body: `
          <p><strong>yaml</strong>: muestra la salida en formato YAML. Más legible que el default para debugging.</p>
          <p><strong>json</strong>: toda la salida en JSON. Ideal para parsear con <code>jq</code> o integrar con sistemas externos.</p>
          <p><strong>timer</strong>: agrega el tiempo de ejecución de cada tarea.</p>
          <p><strong>profile_tasks</strong>: muestra las 10 tareas más lentas al final. Esencial para optimización.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
            <pre class="language-ini"><code class="language-ini">[defaults]
stdout_callback = yaml
callback_enabled = timer, profile_tasks

# Alternativa: usar JSON para parsear con jq
# stdout_callback = json
# ansible-playbook sitio.yml | jq '.plays[].tasks[].hosts'</code></pre>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">Nivel 3 — Inventarios</div>
              <div class="next-chapter-desc">Con la arquitectura interna clara, ahora dominás la definición de hosts: inventarios INI, YAML, dinámicos y variables de inventario.</div>
            </div>
          </div>
        `
      }
    ],
    quiz: [
      {
        question: '¿Qué callback integrado de Ansible mostrás las 10 tareas más lentas al final de la ejecución?',
        options: [
          'ansible.posix.timer',
          'ansible.posix.profile_tasks',
          'community.general.json_logger',
          'ansible.builtin.verbose',
        ],
        correctIndex: 1,
        explanation: '"profile_tasks" es el callback para profiling de rendimiento: registra el tiempo de cada tarea y muestra un ranking de las más lentas al final. "timer" solo agrega la duración total del playbook. Son complementarios y se habilitan juntos en "callback_enabled".',
      },
      {
        question: 'Necesitás que Ansible envíe una notificación a Slack cada vez que un playbook falla en producción. ¿Cuál es la arquitectura correcta?',
        options: [
          'Agregar una tarea "uri" al final de cada playbook que llame a la API de Slack',
          'Implementar o configurar un Callback Plugin que reaccione al hook "v2_playbook_on_stats"',
          'Usar un handler global que se dispara en caso de error',
          'Configurar "notify: slack" en cada tarea crítica del playbook',
        ],
        correctIndex: 1,
        explanation: 'Los Callback Plugins son el mecanismo correcto para integraciones transversales porque se disparan automáticamente en hooks del ciclo de vida (on_stats, on_task_failed, on_play_start) sin modificar los playbooks. Una tarea "uri" al final no se ejecuta si el playbook falla antes de llegar a ella.',
      },
      {
        question: '¿Cómo activás múltiples callbacks adicionales (además del stdout_callback) en Ansible?',
        options: [
          'Listándolos en "stdout_callback" separados por comas',
          'Creando un archivo en callback_plugins/ por cada callback que querés activar',
          'Configurando "callback_enabled = timer, profile_tasks" en la sección [defaults] de ansible.cfg',
          'Usando "ansible-playbook --callback timer,profile_tasks sitio.yml"',
        ],
        correctIndex: 2,
        explanation: '"stdout_callback" solo acepta UN callback que controla el formato de salida en terminal. Los callbacks adicionales (notificaciones, métricas, logging) se activan en "callback_enabled" (antes llamado "callback_whitelist"). Múltiples callbacks en callback_enabled corren en paralelo sin conflictos.',
      },
    ],
    realWorldCase: 'Un equipo de operaciones configura tres callbacks simultáneamente: "yaml" para salida legible en terminal, "profile_tasks" para detectar cuellos de botella de rendimiento, y un callback custom que envía métricas de duración y conteo de cambios a Datadog — todo sin modificar un solo playbook existente, solo cambiando ansible.cfg.',
    troubleshooting: [
      {
        error: 'El callback "profile_tasks" no aparece en la salida aunque está en callback_enabled',
        cause: 'La clave de configuración cambió entre versiones. En Ansible 2.9 era "callback_whitelist", en Ansible 2.10+ es "callback_enabled". Si usás la clave vieja en una versión nueva (o viceversa), el callback se ignora silenciosamente.',
        fix: 'Verificá tu versión con "ansible --version". Para Ansible >= 2.10 usá "callback_enabled = profile_tasks". Para versiones anteriores usá "callback_whitelist = profile_tasks". También verificá que el callback esté disponible con "ansible-doc -t callback -l | grep profile".',
      },
      {
        error: 'stdout_callback = json genera salida inválida cuando hay caracteres especiales o encoding UTF-8 en los resultados',
        cause: 'Algunos módulos (especialmente "command" y "shell") pueden devolver bytes sin decodificar en sus campos "stdout"/"stderr". El callback JSON intenta serializar estos bytes y falla o produce JSON malformado.',
        fix: 'Agregá "environment: {PYTHONIOENCODING: utf-8}" al play o configurá "force_color = False" en ansible.cfg. Para parsear la salida JSON con jq, redirigí stderr a /dev/null: "ansible-playbook sitio.yml 2>/dev/null | jq ."',
      },
      {
        error: 'Un callback custom no se dispara — las notificaciones a Slack nunca llegan aunque el playbook falla',
        cause: 'El callback no implementa el hook correcto. Para capturar fallos de tareas individuales se necesita "v2_runner_on_failed"; para el resumen final (incluyendo hosts unreachable) se necesita "v2_playbook_on_stats". Implementar solo uno puede dejar casos sin cubrir.',
        fix: 'Revisá que el callback implementa todos los hooks relevantes. Para notificaciones de fallo completas, implementá "v2_runner_on_failed", "v2_runner_on_unreachable", y "v2_playbook_on_stats". Verificá que el callback está en la ruta correcta (callback_plugins/ relativo al playbook o en ANSIBLE_CALLBACK_PLUGINS).',
      },
    ],
  }
];
