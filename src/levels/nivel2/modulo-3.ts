import type { ModuleContent } from '../types';

export const nivel2Mod3: ModuleContent = {
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
};
