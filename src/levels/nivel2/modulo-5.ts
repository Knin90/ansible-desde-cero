import type { ModuleContent } from '../types';

export const nivel2Mod5: ModuleContent = {
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
};
