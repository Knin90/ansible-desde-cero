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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  }
];
