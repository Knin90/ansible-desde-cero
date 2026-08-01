import type { ModuleContent } from '../types';

export const nivel10Mod4: ModuleContent =   {
levelId: 10,
moduleId: 4,
title: 'until / retries / delay',
objective: 'Implementar reintentos y esperas para tareas que dependen de recursos externos que pueden tardar en estar disponibles, usando until, wait_for y wait_for_connection.',
duration: '1 hora',
objectives: [
  'Usar until con retries y delay para esperar condiciones dinámicas',
  'Distinguir cuándo usar until vs wait_for',
  'Esperar que puertos, archivos y strings aparezcan con wait_for',
  'Usar wait_for_connection para esperar que un host sea accesible',
],
prerequisites: [
  'Haber usado register para capturar resultados de tareas',
  'Entender el campo rc en resultados de command',
],
steps: [
  {
    title: 'until — reintentos con condición de éxito',
    body: `
      <p>El patrón <code>until/retries/delay</code> permite reintentar una tarea hasta que se cumpla una condición, esperando un intervalo entre intentos. Es la solución idiomática para esperar recursos que tardan en estar disponibles.</p>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Es como llamar a una puerta: intentás, esperás que alguien atienda, y si no contestan en 30 segundos volvés a intentar. <code>retries</code> es cuántas veces llamás, <code>delay</code> cuánto esperás entre llamadas, <code>until</code> es la condición "la puerta fue abierta".</p>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">until-retries.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">tasks:
  # Esperar que la app esté healthy
  - name: Esperar que la aplicación esté disponible
ansible.builtin.uri:
  url: "http://localhost:8080/health"
  status_code: 200
  return_content: true
register: health_check
until: >
  health_check.status == 200 and
  'status: ok' in health_check.content
retries: 12           # 12 intentos
delay: 10             # 10 segundos entre intentos = 2 minutos máximo

  # Esperar que PostgreSQL acepte conexiones
  - name: Esperar que PostgreSQL arranque
ansible.builtin.command: pg_isready -h "{{ db_host }}" -p 5432
register: pg_ready
until: pg_ready.rc == 0
retries: 10
delay: 6
changed_when: false

  # Polling de un job asíncrono
  - name: Lanzar trabajo largo en background
ansible.builtin.command: /opt/scripts/proceso-largo.sh
async: 3600    # Timeout máximo: 1 hora
poll: 0        # No bloquear — continuar inmediatamente
register: job

  - name: Esperar que el job termine
ansible.builtin.async_status:
  jid: "{{ job.ansible_job_id }}"
register: job_status
until: job_status.finished
retries: 60
delay: 30</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Tiempo máximo total:</strong> El tiempo máximo de espera es <code>retries × delay</code> segundos. Con retries=12 y delay=10, esperarás hasta 120 segundos. Si el servicio no arranca en ese tiempo, la tarea falla con "Maximum retries exceeded".</div>
      </div>
    `
  },
  {
    title: 'wait_for — esperar puertos y archivos',
    body: `
      <p>El módulo <code>ansible.builtin.wait_for</code> es más declarativo para esperar estados específicos: puerto abierto/cerrado, archivo presente/ausente, string en archivo.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">wait-for.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">tasks:
  # Esperar que el puerto 5432 esté abierto
  - name: Esperar que PostgreSQL esté escuchando
ansible.builtin.wait_for:
  host: "{{ inventory_hostname }}"
  port: 5432
  delay: 5          # Esperar 5s antes del primer intento
  timeout: 60       # Timeout total en segundos
  state: started    # started=puerto abierto, stopped=cerrado, drained=sin conexiones activas

  # Esperar que la app cree su PID file
  - name: Verificar que la aplicación inició
ansible.builtin.wait_for:
  path: /var/run/mi-app/mi-app.pid
  state: present
  timeout: 30

  # Esperar que el log indique que está listo
  - name: Esperar mensaje de inicio en el log
ansible.builtin.wait_for:
  path: /var/log/mi-app/startup.log
  search_regex: "Application started on port [0-9]+"
  timeout: 60

  # Esperar que el viejo proceso libere el puerto (restart graceful)
  - name: Verificar que el proceso viejo cerró
ansible.builtin.wait_for:
  port: 8080
  state: stopped
  timeout: 30

  # wait_for_connection: esperar que el host sea accesible por SSH
  - name: Esperar tras un reboot
ansible.builtin.reboot:
  reboot_timeout: 300

  - name: Verificar que el host volvió
ansible.builtin.wait_for_connection:
  delay: 10
  timeout: 180</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>until vs wait_for:</strong> Usá <code>until</code> para condiciones que requieren ejecutar un comando y evaluar su salida (como un health check HTTP). Usá <code>wait_for</code> para condiciones de red o sistema de archivos — es más declarativo y eficiente. <code>wait_for_connection</code> es específico para verificar conectividad SSH tras reboots.</div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'until',
    definition: 'Directiva de Ansible que convierte una tarea en un bucle de polling: la tarea se repite hasta que la expresión until evalúe a true, o hasta agotar los retries.',
  },
  {
    term: 'retries',
    definition: 'Número de veces que se reintenta una tarea con until antes de fallar. Por defecto es 3. El tiempo máximo total es retries × delay segundos.',
  },
  {
    term: 'delay',
    definition: 'Segundos de espera entre reintentos cuando se usa until. Por defecto es 5 segundos. El primer intento se ejecuta inmediatamente sin espera.',
  },
  {
    term: 'wait_for',
    definition: 'Módulo de Ansible que espera de forma declarativa que un puerto esté abierto/cerrado, que un archivo exista, o que un patrón aparezca en un archivo. Se ejecuta localmente (nodo de control) salvo que se especifique un host remoto.',
  },
],
quiz: [
  {
    question: '¿Cuál es la diferencia principal entre until y wait_for?',
    options: [
      'until es más moderno y wait_for está deprecado',
      'until evalúa la salida de un comando registrado; wait_for espera condiciones de red/archivos de forma declarativa',
      'until funciona en paralelo; wait_for es secuencial',
      'No hay diferencia práctica',
    ],
    correctIndex: 1,
    explanation: 'until requiere ejecutar una tarea y registrar su resultado para evaluar la condición. Es flexible para cualquier tipo de verificación pero más verboso. wait_for es declarativo para estados específicos de red (puertos) y sistema de archivos — más conciso para esos casos comunes.',
  },
  {
    question: 'Con retries: 10 y delay: 30, ¿cuánto tiempo máximo esperará Ansible?',
    options: [
      '30 segundos',
      '10 segundos',
      '300 segundos (5 minutos)',
      '600 segundos (10 minutos)',
    ],
    correctIndex: 2,
    explanation: 'El tiempo máximo total de espera es retries × delay = 10 × 30 = 300 segundos (5 minutos). Si la condición until se cumple antes, la tarea termina inmediatamente. Si no se cumple en 10 intentos, falla con "Maximum retries exceeded".',
  },
  {
    question: '¿Cuándo deberías usar wait_for_connection en lugar de wait_for?',
    options: [
      'Cuando esperás que un puerto específico se abra',
      'Cuando esperás que un archivo aparezca',
      'Después de un reboot del host para verificar que SSH volvió a estar disponible',
      'Para verificar conectividad HTTP',
    ],
    correctIndex: 2,
    explanation: 'wait_for_connection está diseñado específicamente para esperar que la conexión Ansible (SSH) sea restaurada, tipicamente después de un reboot. Maneja la reconexión automáticamente y espera que el host responda completamente, incluyendo que Python esté disponible en el host remoto.',
  },
],
troubleshooting: [
  {
    error: '"Maximum retries exceeded" antes de que el servicio esté listo',
    cause: 'El número de retries × delay no es suficiente para el tiempo que tarda el servicio en arrancar.',
    fix: 'Aumentá retries o delay para dar más tiempo. Un patrón robusto para servicios lentos: retries: 30, delay: 10 (5 minutos total). Para servicios de inicio muy lento, considerá async + async_status.',
  },
  {
    error: 'wait_for no detecta que el puerto está abierto aunque el servicio corre',
    cause: 'El servicio está escuchando en una interfaz específica (ej: 127.0.0.1) pero wait_for intenta conectarse desde el nodo de control a la IP pública del host.',
    fix: 'Especificá host: "127.0.0.1" si el módulo wait_for corre en el host remoto (por defecto), o verificá que el servicio escucha en la IP correcta. También revisá reglas de firewall que puedan bloquear la conexión de prueba.',
  },
  {
    error: 'La tarea until no falla aunque el servicio nunca arrancó',
    cause: 'La condición until es incorrecta y siempre evalúa a true aunque el servicio no esté disponible. Por ejemplo, verificar result.rc == 0 cuando el comando falla con rc=0 por otras razones.',
    fix: 'Verificá la condición until probando manualmente el comando y analizando su salida. Añadí debug: msg={{ resultado }} para ver exactamente qué valores tiene el resultado en cada intento.',
  },
],
realWorldCase: 'Un equipo de DevOps automatizó el proceso de reemplazo de instancias EC2: el playbook lanza la nueva instancia, espera con until que el health check HTTP retorne 200, luego actualiza el load balancer, y finalmente espera con wait_for state: stopped que el puerto de la instancia vieja se cierre antes de terminarla. El proceso completo tardaba 45 minutos manuales y ahora corre en 8 minutos sin intervención humana.',
  };
