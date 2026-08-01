import type { ModuleContent } from '../types';

export const nivel2Mod1: ModuleContent = {
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
};
