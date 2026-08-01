import type { ModuleContent } from '../types';

export const nivel16Mod2: ModuleContent =   {
levelId: 16,
moduleId: 2,
title: 'Forks, estrategias y ejecución paralela',
objective: 'Controlar el paralelismo de Ansible con forks, estrategias de ejecución y serial para implementar rolling updates seguros en flotas de producción.',
duration: '2 horas',
objectives: [
  'Entender qué son los forks y cómo afectan al paralelismo',
  'Comparar las estrategias linear, free y host_pinned con casos de uso reales',
  'Implementar rolling updates con serial incluyendo porcentajes progresivos',
  'Usar async y poll para lanzar tareas de larga duración sin bloquear el play',
],
prerequisites: [
  'Completado el Módulo 1 de Nivel 16',
  'Playbooks con múltiples hosts en distintos grupos',
],
steps: [
  {
    title: 'Forks — cuántos hosts en paralelo',
    body: `
      <p>Ansible ejecuta tareas en paralelo — no sobre todos los hosts a la vez, sino sobre un número configurable llamado <code>forks</code>. El valor por defecto es 5, lo que significa que Ansible procesa máximo 5 hosts simultáneamente.</p>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Imaginá que tenés 100 cartas para escribir a mano. Con forks=5, tenés 5 escritorios y 5 personas trabajando al mismo tiempo — cuando una termina una carta, empieza la siguiente. Aumentar forks es agregar más escritorios. El límite real es la capacidad de tu sala (el control node) y el ancho de banda de red.</p>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
        <pre class="language-ini"><code class="language-ini">[defaults]
# Por defecto: 5 — muy conservador para flotas grandes
# Regla de oro: núcleos del control node × 2 (pero probá con tu carga real)
forks = 20

# Verificar el número de núcleos del control node:
# nproc --all</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">forks-benchmark.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Sobrescribir forks desde la línea de comandos (sin cambiar ansible.cfg)
ansible-playbook site.yml --forks 50

# Ver cuántos núcleos tiene el control node
nproc --all

# Benchmark: probar distintos valores de forks
for f in 5 10 20 50; do
  echo "=== forks=$f ==="
  time ansible-playbook -i inventory/produccion site.yml --forks $f
done

# El tiempo mejora hasta llegar a un plateau —
# ese plateau indica el cuello de botella real (CPU, red, o los hosts remotos)</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Forks y el control node:</strong> Cada fork es un proceso Python en el control node. Con forks=100 sobre 100 hosts, estás ejecutando 100 procesos Python en tu máquina simultáneamente. Subir forks infinitamente no ayuda — en algún punto la CPU del control node o el ancho de banda de red se convierte en el cuello de botella.</div>
      </div>
    `
  },
  {
    title: 'Estrategias de ejecución: linear, free y host_pinned',
    body: `
      <p>La estrategia controla el orden en que Ansible ejecuta las tareas sobre múltiples hosts. Cada estrategia tiene casos de uso específicos.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">estrategias.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# ESTRATEGIA: linear (por defecto)
# Todos los hosts ejecutan la tarea 1 antes de que cualquiera empiece la tarea 2
# Garantiza consistencia: todos en el mismo paso siempre
- name: Play con linear (default)
  hosts: webservers
  strategy: linear
  tasks:
- name: Tarea 1 — se ejecuta en TODOS los hosts antes de pasar a la 2
  ansible.builtin.debug:
    msg: "Hola desde {{ inventory_hostname }}"

- name: Tarea 2 — ningún host llega aquí hasta que todos terminen la 1
  ansible.builtin.service:
    name: nginx
    state: restarted

---
# ESTRATEGIA: free
# Cada host avanza a su propio ritmo — no espera a los demás
# Los hosts rápidos terminan antes; los lentos no bloquean a nadie
- name: Play con free
  hosts: all
  strategy: free
  tasks:
- name: Actualizar paquetes (puede tardar diferente en cada host)
  ansible.builtin.package:
    name: "*"
    state: latest

- name: Reiniciar servicio (no espera a que todos terminen update)
  ansible.builtin.service:
    name: myapp
    state: restarted

---
# ESTRATEGIA: host_pinned
# Igual que free PERO Ansible no empieza en un host nuevo hasta que
# el host actual haya completado TODAS sus tareas
# Útil para hosts con recursos limitados o que no toleran la simultaneidad
- name: Play con host_pinned
  hosts: embedded_devices
  strategy: host_pinned
  tasks:
- ansible.builtin.command: /opt/update.sh</code></pre>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Cuándo usar cada estrategia:</strong><br>
          • <strong>linear</strong>: deployments donde todos los hosts deben estar en el mismo estado (balanceadores de carga, clusters)<br>
          • <strong>free</strong>: tareas independientes donde la velocidad importa más que el orden (actualizaciones masivas)<br>
          • <strong>host_pinned</strong>: dispositivos embebidos o hosts con poca capacidad de manejar carga simultánea
        </div>
      </div>
    `
  },
  {
    title: 'serial — rolling updates seguros',
    body: `
      <p>La clave <code>serial</code> define cuántos hosts se actualizan en cada "batch". Ansible completa todos los tasks del play en el batch actual antes de pasar al siguiente — esto permite implementar rolling updates donde siempre hay hosts en producción atendiendo tráfico.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">rolling-update.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# EJEMPLO 1: Número fijo — actualizar 2 hosts a la vez
- name: Rolling update — 2 a la vez
  hosts: webservers    # Supongamos 10 hosts
  serial: 2            # Batch 1: web01, web02 → Batch 2: web03, web04 → etc.
  tasks:
- name: Sacar del load balancer antes de actualizar
  ansible.builtin.uri:
    url: "http://lb.empresa.com/api/hosts/{{ inventory_hostname }}/disable"
    method: POST

- name: Actualizar la aplicación
  ansible.builtin.package:
    name: mi-app
    state: latest

- name: Reiniciar servicio
  ansible.builtin.service:
    name: mi-app
    state: restarted

- name: Verificar que el servicio responde antes de continuar
  ansible.builtin.uri:
    url: "http://{{ inventory_hostname }}:8080/health"
    status_code: 200
  retries: 5
  delay: 10

- name: Agregar de vuelta al load balancer
  ansible.builtin.uri:
    url: "http://lb.empresa.com/api/hosts/{{ inventory_hostname }}/enable"
    method: POST

---
# EJEMPLO 2: Porcentaje progresivo — canary release
# Primero 10%, después 25%, después el resto
- name: Canary deployment
  hosts: webservers
  serial:
- "10%"    # Batch 1: 10% de los hosts (canary)
- "25%"    # Batch 2: 25% más
- "100%"   # Batch 3: el resto (incluyendo el 65% restante)
  tasks:
- name: Deploy de la nueva versión
  ansible.builtin.package:
    name: "mi-app-{{ app_version }}"
    state: present</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>max_fail_percentage:</strong> Combiná <code>serial</code> con <code>max_fail_percentage</code> para abortar el rolling update si demasiados hosts fallan. Con <code>max_fail_percentage: 20</code>, si más del 20% de los hosts en un batch falla, Ansible detiene el play en lugar de continuar con el siguiente batch.</div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">rolling-safe.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">- name: Rolling update con abort automático
  hosts: webservers
  serial: "25%"
  max_fail_percentage: 10    # Si falla más del 10% del batch, abortar todo
  any_errors_fatal: false    # Cada host falla individualmente sin abortar los demás en el batch
  tasks:
- name: Deploy...
  # tareas...</code></pre>
      </div>
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio</div>
        <div class="lab-content">
          <p><strong>Objetivo:</strong> Simular un rolling update con 6 hosts usando serial y verificación de salud.</p>
          <ol>
            <li>Creá un inventario con 6 hosts (pueden ser localhost con alias diferentes en inventario)</li>
            <li>Escribí un playbook con <code>serial: 2</code> que: imprime "iniciando actualización de {{ inventory_hostname }}", espera 2 segundos, e imprime "actualización completada"</li>
            <li>Observá cómo el output muestra los batches de 2 en 2</li>
            <li>Modificá para usar <code>serial: ["1", "2", "100%"]</code> — canary release simulado</li>
          </ol>
        </div>
      </div>
    `
  },
  {
    title: 'async y poll — tareas de larga duración',
    body: `
      <p>Algunas tareas tardan mucho tiempo: backups, compilaciones, migraciones de base de datos. Por defecto, Ansible bloquea el play hasta que cada tarea termine. Con <code>async</code> y <code>poll</code> podés lanzarlas en background y continuar con otras tareas.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">async-poll.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">tasks:
  # MODO 1: Fire and forget (poll: 0)
  # Lanzar la tarea en background y continuar inmediatamente
  - name: Iniciar backup completo en background
ansible.builtin.command: /opt/scripts/backup-completo.sh
async: 7200       # Timeout máximo: 2 horas
poll: 0           # poll: 0 = no esperar, continuar inmediatamente
register: backup_job

  # Continuar con otras tareas mientras el backup corre en background
  - name: Actualizar paquetes mientras el backup corre
ansible.builtin.package:
  name: "*"
  state: latest

  - name: Reiniciar aplicación mientras el backup corre
ansible.builtin.service:
  name: mi-app
  state: restarted

  # DESPUÉS verificar que el backup terminó correctamente
  - name: Esperar que el backup complete
ansible.builtin.async_status:
  jid: "{{ backup_job.ansible_job_id }}"
register: backup_result
until: backup_result.finished
retries: 120      # Verificar hasta 120 veces
delay: 60         # Verificar cada 60 segundos → máximo 2 horas de espera

  - name: Verificar resultado del backup
ansible.builtin.fail:
  msg: "El backup falló: {{ backup_result.stderr }}"
when: backup_result.rc != 0

  # MODO 2: Polling activo (poll > 0)
  # Esperar la tarea con polling periódico — bloquea el play pero da feedback
  - name: Ejecutar migración de base de datos con polling
ansible.builtin.command: /opt/scripts/migrate-db.sh
async: 1800       # Timeout: 30 minutos
poll: 30          # Verificar cada 30 segundos, mostrar output periódico</code></pre>
      </div>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>ansible_job_id:</strong> Cuando una tarea corre con poll: 0, Ansible le asigna un job ID y lo almacena en la variable registrada como <code>ansible_job_id</code>. El módulo <code>async_status</code> usa ese ID para consultar el estado del job en el host remoto. Los jobs asíncronos se guardan en ~/.ansible_async/ en el host remoto.</div>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>async con become — problema conocido:</strong> Las tareas asíncronas con <code>become: true</code> pueden fallar al verificar el status porque el job se guarda con el usuario escalado pero async_status lo busca con el usuario SSH. Si tenés este problema, evitá combinar async con become, o usá un wrapper script que no requiera sudo.</div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'forks',
    definition: 'Número máximo de hosts procesados en paralelo por Ansible. Por defecto es 5. Cada fork es un proceso Python en el control node. Aumentar forks reduce el tiempo total de ejecución hasta que el cuello de botella sea la CPU del control node o el ancho de banda de red. Se configura en ansible.cfg o con --forks en la línea de comandos.',
  },
  {
    term: 'Estrategia linear',
    definition: 'Estrategia de ejecución por defecto de Ansible: todos los hosts ejecutan la tarea N antes de que cualquier host empiece la tarea N+1. Garantiza que todos los hosts estén en el mismo estado en cada punto del play. Ideal para deployments donde la consistencia es crítica.',
  },
  {
    term: 'Estrategia free',
    definition: 'Estrategia de ejecución donde cada host avanza a su propio ritmo sin esperar a los demás. Un host puede estar en la tarea 10 mientras otro todavía está en la tarea 3. Maximiza el throughput pero no garantiza que los hosts estén sincronizados.',
  },
  {
    term: 'serial',
    definition: 'Directiva de play que controla cuántos hosts se actualizan en cada batch de un rolling update. Acepta número fijo (serial: 2), porcentaje (serial: "25%"), o lista progresiva (serial: ["1", "25%", "100%"]). Ansible completa todos los tasks del play en el batch actual antes de pasar al siguiente.',
  },
  {
    term: 'async / poll',
    definition: 'Mecanismo de Ansible para ejecutar tareas de larga duración en background. async define el timeout máximo en segundos. poll define con qué frecuencia verificar el estado (poll: 0 significa fire-and-forget). El módulo async_status permite verificar el resultado más tarde usando el ansible_job_id registrado.',
  },
],
quiz: [
  {
    question: '¿Qué diferencia hay entre la estrategia "linear" y "free" en Ansible?',
    options: [
      'linear usa más forks que free',
      'linear garantiza que todos los hosts ejecuten tarea N antes de que cualquiera empiece tarea N+1; free deja que cada host avance a su ritmo',
      'free solo funciona con un fork; linear funciona con múltiples forks',
      'linear y free son idénticas pero free usa menos memoria',
    ],
    correctIndex: 1,
    explanation: 'Con la estrategia linear, Ansible espera que todos los hosts terminen la tarea actual antes de avanzar a la siguiente — garantizando sincronización. Con free, cada host avanza independientemente: un host puede estar en la tarea 10 mientras otro sigue en la tarea 3. Free maximiza el throughput; linear garantiza consistencia.',
  },
  {
    question: 'En un rolling update con serial: "25%" sobre 20 hosts, ¿cuántos hosts se actualizan en el primer batch?',
    options: [
      '1 host (25% redondeado para abajo)',
      '5 hosts (25% de 20)',
      '4 hosts (redondeado para abajo)',
      'Todos los hosts a la vez',
    ],
    correctIndex: 1,
    explanation: 'El 25% de 20 hosts es exactamente 5. Ansible actualizará primero 5 hosts, esperará a que terminen (incluyendo verificaciones de salud), luego actualizará los siguientes 5, y así sucesivamente. Con serial: "25%", si el número de hosts no es divisible exactamente, Ansible redondea para abajo pero garantiza que todos los hosts sean procesados en el último batch.',
  },
  {
    question: '¿Qué significa poll: 0 en una tarea con async?',
    options: [
      'La tarea nunca se ejecuta',
      'La tarea se ejecuta de forma síncrona sin timeout',
      'La tarea se lanza en background y Ansible continúa inmediatamente sin esperar el resultado',
      'Ansible verifica el resultado 0 veces (equivale a no ejecutar la tarea)',
    ],
    correctIndex: 2,
    explanation: 'poll: 0 significa "fire and forget": Ansible lanza la tarea en background en el host remoto y continúa inmediatamente con la siguiente tarea sin esperar el resultado. El job ID se guarda en la variable registrada para poder verificar el resultado más tarde con el módulo async_status. Es útil para tareas largas (backups, compilaciones) que pueden correr en paralelo con otras tareas del play.',
  },
],
troubleshooting: [
  {
    error: "FAILED! => async_status job ID ... no longer exists",
    cause: 'El job asíncrono fue limpiado del host remoto antes de que async_status pudiera verificarlo. Puede ser porque el sistema operativo del host borra ~/.ansible_async/ periódicamente, o porque el timeout de async expiró.',
    fix: 'Aumentá el valor de async al lanzar la tarea para que el job no expire antes de la verificación. Verificá que ~/.ansible_async/ no esté siendo limpiado por un cron job o por un sistema de limpieza de /tmp. El directorio ~/.ansible_async/ en el host remoto almacena el estado del job.',
  },
  {
    error: "El playbook tarda lo mismo con forks=50 que con forks=10",
    cause: 'El cuello de botella no son los forks sino otro recurso: CPU del control node saturada, ancho de banda de red agotado, o los hosts remotos son el bottleneck (tardan lo mismo sin importar cuántos se procesen en paralelo).',
    fix: 'Activá profile_tasks para identificar qué tareas son lentas. Monitoreá la CPU del control node durante la ejecución: top o htop. Si la CPU está al 100%, reducí forks. Si la CPU está libre, el cuello de botella está en la red o en los hosts remotos — considerá fact cache y pipelining.',
  },
  {
    error: "La estrategia serial actualiza todos los hosts a la vez en lugar de en batches",
    cause: 'serial está configurado en el play incorrecto o hay un error de indentación que hace que serial no se aplique al play deseado.',
    fix: 'Verificá que serial está a nivel de play (mismo nivel que hosts y tasks), no dentro de tasks. Comprobá la indentación — en YAML, un espacio extra puede cambiar completamente la estructura. Ejecutá con --check -vv para ver cómo Ansible parsea el playbook.',
  },
],
  };
