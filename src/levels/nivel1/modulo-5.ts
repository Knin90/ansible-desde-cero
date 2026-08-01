import type { ModuleContent } from '../types';

export const nivel1Mod5: ModuleContent = {
  levelId: 1,
  moduleId: 5,
  title: 'Tu primer comando Ansible',
  objective: 'Entender en profundidad qué sucede cuando ejecutás ansible all -m ping y cómo interpretar el resultado.',
  duration: '1 hora',
  objectives: [
    'Diseccionar cada parte del comando ansible all -m ping',
    'Interpretar el resultado JSON de un módulo exitoso y de uno fallido',
    'Usar los niveles de verbose (-v, -vv, -vvv) para diagnosticar problemas',
    'Ejecutar comandos ad-hoc con diferentes módulos y patrones de hosts',
  ],
  steps: [
    {
      title: 'El comando más simple',
      body: `
        <p>El primer comando que ejecuta todo el mundo con Ansible es:</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span></div>
          <pre class="language-bash"><code class="language-bash">ansible all -m ping</code></pre>
        </div>
        <p>Parece simple, pero hay mucho sucediendo debajo. Vamos a diseccionarlo parte por parte.</p>
      `
    },
    {
      title: 'Anatomía del comando',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">anatomia.sh</span></div>
          <pre class="language-bash"><code class="language-bash">ansible    all    -m ping
#  │         │       │
#  │         │       └── -m = module; "ping" = nombre del módulo a ejecutar
#  │         │
#  │         └── "all" = pattern de hosts; aplica a TODOS los hosts del inventario
#  │              Alternativas: "servidores_web", "web1.ejemplo.com", "web*"
#  │
#  └── el binario "ansible" — para comandos ad-hoc (una sola tarea)
#      Diferente de "ansible-playbook" que corre un archivo completo

# Otro ejemplo con más opciones:
ansible servidores_web -m command -a "uptime" -i inventory/hosts.ini -u deploy -b
#                       │            │          │                      │       │
#                       │            │          │                      │       └── -b = become (sudo)
#                       │            │          │                      └── -u = usuario SSH
#                       │            │          └── -i = inventario explícito
#                       │            └── -a = arguments (argumentos del módulo)
#                       └── patrón de hosts (grupo "servidores_web")</code></pre>
        </div>
      `
    },
    {
      title: 'El módulo ping — qué hace realmente',
      body: `
        <p>El módulo <code>ping</code> de Ansible NO hace un ping ICMP. Es un módulo Python que:</p>
        <ol>
          <li>Se conecta al host via SSH</li>
          <li>Copia un pequeño script Python al host</li>
          <li>Ejecuta ese script (que no hace casi nada — solo responde "pong")</li>
          <li>Devuelve el resultado JSON</li>
        </ol>
        <div class="internal-flow">
          <div class="internal-flow-header">🔍 ¿Qué ocurre internamente?</div>
          <div class="internal-flow-steps">
            <div class="flow-step">
              <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
              <div class="flow-step-body">
                <div class="flow-step-title">Ansible lee ansible.cfg</div>
                <div class="flow-step-desc">Busca el archivo de configuración en el directorio actual, luego en ~/.ansible.cfg, luego en /etc/ansible/ansible.cfg.</div>
              </div>
            </div>
            <div class="flow-step">
              <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
              <div class="flow-step-body">
                <div class="flow-step-title">Carga el inventario</div>
                <div class="flow-step-desc">Parsea el archivo de inventario y construye el grafo de hosts y grupos. Resuelve qué hosts aplican al patrón "all".</div>
              </div>
            </div>
            <div class="flow-step">
              <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
              <div class="flow-step-body">
                <div class="flow-step-title">Abre conexión SSH</div>
                <div class="flow-step-desc">Establece una conexión SSH con multiplexing (ControlMaster) al host remoto. Usa la clave privada de ~/.ssh/ o la configurada en ansible_ssh_private_key_file.</div>
              </div>
            </div>
            <div class="flow-step">
              <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
              <div class="flow-step-body">
                <div class="flow-step-title">Copia el módulo ping.py a /tmp</div>
                <div class="flow-step-desc">Transfiere el archivo AnsiballZ_ping.py al directorio temporal del host remoto mediante sftp o scp.</div>
              </div>
            </div>
            <div class="flow-step">
              <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
              <div class="flow-step-body">
                <div class="flow-step-title">Ejecuta Python en el host remoto</div>
                <div class="flow-step-desc">Corre: <code>python3 /tmp/.ansible/tmp/.../AnsiballZ_ping.py</code>. El módulo simplemente devuelve {"ping": "pong"}.</div>
              </div>
            </div>
            <div class="flow-step">
              <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
              <div class="flow-step-body">
                <div class="flow-step-title">Recibe el JSON de respuesta</div>
                <div class="flow-step-desc">Ansible lee stdout del proceso remoto: {"changed": false, "ping": "pong"}. Si hay errores, los encuentra en stderr.</div>
              </div>
            </div>
            <div class="flow-step">
              <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
              <div class="flow-step-body">
                <div class="flow-step-title">Borra el archivo temporal</div>
                <div class="flow-step-desc">El módulo se ejecuta como: <code>python3 ping.py && rm -f ping.py</code>. El host remoto queda exactamente igual que antes.</div>
              </div>
            </div>
            <div class="flow-step">
              <div class="flow-step-connector"><div class="flow-step-dot"></div></div>
              <div class="flow-step-body">
                <div class="flow-step-title">Muestra el resultado</div>
                <div class="flow-step-desc">El control node procesa el JSON y muestra: <code>hostname | SUCCESS => {"changed": false, "ping": "pong"}</code>.</div>
              </div>
            </div>
          </div>
        </div>
        <p>Si el ping tiene éxito, confirmás que: la conexión SSH funciona, Python está instalado, y el usuario tiene permisos para ejecutar Python en <code>/tmp</code>.</p>
      `
    },
    {
      title: 'Interpretar el resultado exitoso',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">resultado-ping.txt</span></div>
          <pre class="language-bash"><code class="language-bash">web1.ejemplo.com | SUCCESS => {      # nombre del host | estado
  "changed": false,                 # false = no cambió nada (ping no cambia nada)
  "ping": "pong"                    # la respuesta del módulo ping
}
web2.ejemplo.com | SUCCESS => {
  "changed": false,
  "ping": "pong"
}</code></pre>
        </div>
        <ul>
          <li><strong>SUCCESS</strong>: el módulo se ejecutó sin errores</li>
          <li><strong>changed: false</strong>: el módulo no realizó ningún cambio en el host</li>
          <li><strong>"ping": "pong"</strong>: la respuesta específica del módulo ping</li>
        </ul>
      `
    },
    {
      title: 'Errores comunes y cómo diagnosticarlos',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">errores-ping.txt</span></div>
          <pre class="language-bash"><code class="language-bash"># Error 1: No se puede conectar por SSH
web1.ejemplo.com | UNREACHABLE! => {
  "changed": false,
  "msg": "Failed to connect to the host via ssh: ssh: connect to host web1.ejemplo.com port 22: Connection refused",
  "unreachable": true
}
# Diagnóstico: ¿está el servidor encendido? ¿SSH está corriendo? ¿el firewall bloquea el puerto 22?

# Error 2: Autenticación fallida
web1.ejemplo.com | UNREACHABLE! => {
  "msg": "Failed to connect to the host via ssh: Permission denied (publickey,password)."
}
# Diagnóstico: ¿está la clave pública en authorized_keys? ¿el usuario es correcto?

# Error 3: Python no encontrado
web1.ejemplo.com | FAILED! => {
  "msg": "/usr/bin/python3: not found"
}
# Solución: instalar python3 en el host remoto, o cambiar ansible_python_interpreter

# Error 4: Host key verification failed
web1.ejemplo.com | UNREACHABLE! => {
  "msg": "Failed to connect via ssh: Host key verification failed."
}
# Solución: agregar el host a known_hosts o deshabilitar host_key_checking</code></pre>
        </div>
      `
    },
    {
      title: 'Modo verbose para diagnosticar',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">verbose.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># -v: verbose básico — muestra más info del resultado
ansible all -m ping -v

# -vv: más verbose — muestra las variables y paths
ansible all -m ping -vv

# -vvv: mucho verbose — muestra cada conexión SSH (lo que usarás para debug)
ansible all -m ping -vvv
# <web1.ejemplo.com> ESTABLISH SSH CONNECTION FOR USER deploy
# <web1.ejemplo.com> SSH: EXEC ssh -C -o ControlMaster=auto ...
# <web1.ejemplo.com> PUT /tmp/.ansible/tmp/ansible-tmp-xxx/AnsiballZ_ping.py
# <web1.ejemplo.com> EXEC /bin/sh -c 'python3 AnsiballZ_ping.py && rm -f AnsiballZ_ping.py'

# -vvvv: debug extremo — incluye información de plugins
ansible all -m ping -vvvv</code></pre>
        </div>
      `
    },
    {
      title: 'Otros comandos ad-hoc esenciales',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ad-hoc-commands.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Ejecutar un comando en todos los hosts
ansible all -m command -a "uptime"
ansible all -m command -a "df -h"

# Ejecutar con sudo
ansible all -m command -a "apt update" -b

# Copiar un archivo
ansible all -m copy -a "src=/local/file.txt dest=/remote/path/"

# Ver hechos (facts) de los hosts
ansible all -m setup

# Ver sólo algunos facts
ansible all -m setup -a "filter=ansible_distribution*"

# Apagar todos los servidores (¡cuidado!)
ansible all -m command -a "shutdown -h now" -b</code></pre>
        </div>
      `
    },
    {
      title: 'Patterns de hosts — selección flexible',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">patterns.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Todos los hosts
ansible all -m ping

# Un grupo específico
ansible servidores_web -m ping

# Un host específico
ansible web1.ejemplo.com -m ping

# Wildcard
ansible "web*.ejemplo.com" -m ping

# Intersección — hosts en ambos grupos
ansible "servidores_web:&produccion" -m ping

# Diferencia — en servidores_web pero NO en mantenimiento
ansible "servidores_web:!mantenimiento" -m ping

# Lista explícita
ansible "web1.ejemplo.com,web2.ejemplo.com" -m ping

# Limitar con --limit
ansible all -m ping --limit web1.ejemplo.com</code></pre>
        </div>
      `
    },
    {
      title: 'Diferencia entre ansible y ansible-playbook',
      body: `
        <table class="comparison-table">
          <thead>
            <tr><th>ansible (ad-hoc)</th><th>ansible-playbook</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Una sola tarea</td>
              <td>Múltiples tareas en secuencia</td>
            </tr>
            <tr>
              <td>Resultado inmediato</td>
              <td>Playbook guardado en archivo .yml</td>
            </tr>
            <tr>
              <td>Para diagnóstico y tareas únicas</td>
              <td>Para automatización repetible</td>
            </tr>
            <tr>
              <td>ansible all -m command -a "id"</td>
              <td>ansible-playbook sitio.yml</td>
            </tr>
          </tbody>
        </table>
      `
    },
    {
      title: 'Resumen',
      body: `
        <div class="highlight-box">
          <p><code>ansible all -m ping</code> parece simple pero verifica toda la cadena: inventario → SSH → Python → módulo → resultado JSON. Con esto sabés que tu entorno está funcionando correctamente.</p>
        </div>
        <div class="challenge-box">
          <div class="challenge-title">🎯 Desafío</div>
          <div class="challenge-body">Ejecutá <code>ansible all -m ping -vvv</code> y analizá la salida completa. Identificá: a qué IP se conectó, qué usuario usó, qué archivo Python copió, y qué comando ejecutó. Luego ejecutá <code>ansible all -m setup -a "filter=ansible_os_family"</code> para ver la distribución Linux de tus hosts.</div>
        </div>
      `
    }
  ],
  prerequisites: [
    'Haber completado el Módulo 4 (Instalación de Ansible)',
    'Tener Ansible instalado y ansible --version funcionando',
    'Tener al menos un host accesible via SSH o el localhost disponible',
  ],
  quiz: [
    {
      question: '¿Qué verifica realmente el módulo ping de Ansible?',
      options: [
        'Que el host responde a paquetes ICMP (ping de red)',
        'Que la conexión SSH funciona, Python está disponible, y Ansible puede ejecutar módulos en el host',
        'Que el inventario tiene la dirección IP correcta del host',
        'Que el host tiene conectividad a internet',
      ],
      correctIndex: 1,
      explanation: 'El módulo ping de Ansible NO es un ping ICMP. Verifica la cadena completa: conexión SSH → copia de módulo Python a /tmp → ejecución de Python en el host remoto → respuesta JSON. Si ping responde con SUCCESS, tenés todo lo necesario para gestionar ese host con Ansible.',
    },
    {
      question: '¿Qué significa el flag -vvv en ansible all -m ping -vvv?',
      options: [
        'Ejecutar el ping tres veces para verificar consistencia',
        'Validar el vocabulario, versión y variables del inventario',
        'Activar el modo de máxima verbosidad, mostrando cada conexión SSH, archivo copiado y comando ejecutado',
        'Ejecutar contra tres grupos de hosts simultáneamente',
      ],
      correctIndex: 2,
      explanation: 'Con -vvv Ansible muestra en detalle: qué conexión SSH estableció, qué usuario usó, qué archivo Python copió a /tmp, y qué comando ejecutó en el host remoto. Es el nivel de verbose más útil para diagnosticar problemas de conectividad o ejecución.',
    },
    {
      question: '¿Cuál es la diferencia entre "ansible all" y "ansible-playbook sitio.yml"?',
      options: [
        'No hay diferencia — ambos ejecutan las mismas tareas',
        '"ansible all" solo funciona con el módulo ping; ansible-playbook funciona con cualquier módulo',
        '"ansible all" ejecuta una sola tarea ad-hoc inmediatamente; ansible-playbook ejecuta múltiples tareas definidas en un archivo YAML',
        '"ansible all" requiere privilegios de root; ansible-playbook no',
      ],
      correctIndex: 2,
      explanation: '"ansible" es para comandos ad-hoc: una sola tarea, resultado inmediato, ideal para diagnóstico. "ansible-playbook" ejecuta un archivo .yml con múltiples tareas en secuencia, es la herramienta para automatización repetible y versionada en Git.',
    },
  ],
  realWorldCase: 'Un ingeniero de operaciones recibe una alerta: un servidor de producción no está respondiendo correctamente. En vez de conectarse manualmente por SSH, ejecuta ansible web-prod -m command -a "systemctl status nginx" -b para ver el estado del servicio en todos los servidores web del grupo al mismo tiempo. En segundos tiene el estado de 50 servidores en una pantalla, identifica cuáles tienen nginx caído, y ejecuta ansible web-prod -m service -a "name=nginx state=restarted" -b para reiniciarlo solo en esos hosts.',
  troubleshooting: [
    {
      error: 'UNREACHABLE! Failed to connect to the host via ssh: Connection refused',
      cause: 'SSH no está corriendo en el host remoto, o el firewall bloquea el puerto 22.',
      fix: 'Verificá manualmente: ping host && nc -z host 22 && ssh usuario@host  —  si alguno falla, ese es el problema, no Ansible.',
    },
    {
      error: 'WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!',
      cause: 'La clave SSH del servidor cambió (reinstalación del OS, nueva VM con la misma IP). SSH bloquea por seguridad.',
      fix: 'ssh-keygen -R hostname  —  para borrar la clave antigua. En laboratorio: host_key_checking = False en ansible.cfg.',
    },
    {
      error: 'FAILED! => {"msg": "Missing sudo password"}',
      cause: 'La tarea usa become: true pero el usuario no tiene configurado sudo sin contraseña.',
      fix: 'Ejecutá con: ansible-playbook playbook.yml -K  (pide contraseña de sudo). En producción: configurá NOPASSWD en /etc/sudoers.',
    },
  ],
};
