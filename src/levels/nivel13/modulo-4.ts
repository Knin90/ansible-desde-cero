import type { ModuleContent } from '../types';

export const nivel13Mod4: ModuleContent =   {
levelId: 13,
moduleId: 4,
title: 'Callback Plugins',
objective: 'Configurar y entender callback plugins para mejorar la salida de Ansible, registrar logs de ejecución y enviar notificaciones, y crear un callback plugin básico personalizado.',
duration: '1.5 horas',
objectives: [
  'Configurar stdout_callback para cambiar el formato de salida',
  'Habilitar callbacks adicionales: timer, profile_tasks, log_plays',
  'Entender el ciclo de vida de un callback: v2_runner_on_ok, v2_playbook_on_stats, etc.',
  'Usar el callback de Slack para notificaciones de deploy',
  'Crear un callback plugin básico en Python',
],
prerequisites: [
  'Conocer ansible.cfg y su configuración',
  'Python básico para crear el callback personalizado',
],
steps: [
  {
    title: 'Configurar callbacks en ansible.cfg',
    body: `
      <p>Los callback plugins interceptan eventos del ciclo de vida de Ansible y reaccionan a ellos: formatear el output, guardar logs, enviar notificaciones. Se configuran sin modificar los playbooks.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
        <pre class="language-yaml"><code class="language-yaml">[defaults]
# stdout_callback: formato del output en terminal
# default: formato clásico (compacto)
# yaml: output YAML más legible, especialmente para tareas con datos complejos
# json: output JSON estructurado — ideal para CI/CD y parsing con jq
# dense: modo compacto, una línea por tarea
# minimal: solo muestra nombre de host y resultado
stdout_callback = yaml

# callbacks_enabled: callbacks adicionales activados
# (Antes llamado callback_whitelist en Ansible < 2.11)
callbacks_enabled = timer, profile_tasks, log_plays

# log_path: dónde guarda el log el callback log_plays
log_path = /var/log/ansible/ansible.log

# Formato de timestamp en el log
[callback_log_plays]
log_folder = /var/log/ansible/plays/</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">explorar-callbacks.sh</span></div>
        <pre class="language-yaml"><code class="language-yaml"># Ver todos los callbacks disponibles instalados
ansible-doc -t callback -l

# Ver documentación detallada de un callback
ansible-doc -t callback timer
ansible-doc -t callback profile_tasks
ansible-doc -t callback yaml

# Callbacks built-in más útiles:
# timer         — muestra tiempo total al final: "Playbook run took 0 days, 0 hours, 2 minutes, 30 seconds"
# profile_tasks — tabla con tiempo por tarea: identifica cuellos de botella
# log_plays     — guarda log completo en archivo
# json          — output JSON: útil para integración con sistemas de log
# yaml          — output YAML: más legible que el default para humans

# Callbacks de community.general (requiere instalar la collection)
# community.general.slack     — notificaciones a Slack
# community.general.mail      — notificaciones por email
# community.general.grafana_annotations — añade anotaciones a Grafana</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>stdout_callback = yaml:</strong> Activalo en todos tus proyectos. La diferencia de legibilidad es dramática especialmente cuando las tareas devuelven estructuras de datos complejas. Para CI/CD donde necesitás parsear el output, usá json y procesalo con jq.</div>
      </div>
    `
  },
  {
    title: 'Callback de Slack — notificaciones de deploy',
    body: `
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg — con Slack</span></div>
        <pre class="language-yaml"><code class="language-yaml">[defaults]
stdout_callback = yaml
callbacks_enabled = timer, profile_tasks, community.general.slack

[callback_slack]
webhook_url = https://hooks.slack.com/services/T.../B.../...
channel = #deploys
username = Ansible Bot
icon_emoji = :robot_face:
# Qué eventos notificar: all, start, end, error
notify_on = end, error</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">callback_plugins/deploy_notifier.py</span></div>
        <pre class="language-yaml"><code class="language-yaml">"""
Callback plugin personalizado que registra el inicio y fin de cada play.
Colocalos en callback_plugins/ relativo al playbook.
"""
from ansible.plugins.callback import CallbackBase
from datetime import datetime


class CallbackModule(CallbackBase):
"""
Callback personalizado: registra tiempos y resultados.
"""
CALLBACK_VERSION = 2.0
CALLBACK_TYPE = 'aggregate'       # 'stdout' o 'aggregate'
CALLBACK_NAME = 'deploy_notifier'
CALLBACK_NEEDS_ENABLED = True     # Requiere habilitarse explícitamente

def __init__(self):
    super(CallbackModule, self).__init__()
    self.inicio_play = {}
    self.tareas_fallidas = []
    self.tareas_cambiadas = 0

def v2_playbook_on_play_start(self, play):
    """Se llama cuando empieza un play."""
    self.inicio_play[play.name] = datetime.now()
    self._display.display(
        f"[DEPLOY] Iniciando play: {play.name} @ {datetime.now().strftime('%H:%M:%S')}",
        color='cyan'
    )

def v2_runner_on_ok(self, result):
    """Se llama cuando una tarea tiene éxito."""
    if result.is_changed():
        self.tareas_cambiadas += 1

def v2_runner_on_failed(self, result, ignore_errors=False):
    """Se llama cuando una tarea falla."""
    if not ignore_errors:
        self.tareas_fallidas.append(result._task.name)

def v2_playbook_on_stats(self, stats):
    """Se llama al final con las estadísticas globales."""
    hosts = sorted(stats.processed.keys())
    self._display.display("\n=== Resumen de Deploy ===", color='cyan')
    for host in hosts:
        t = stats.summarize(host)
        color = 'red' if t['failures'] or t['unreachable'] else 'green'
        self._display.display(
            f"  {host}: ok={t['ok']} changed={t['changed']} "
            f"failed={t['failures']}",
            color=color
        )
    if self.tareas_fallidas:
        self._display.display(
            f"Tareas fallidas: {', '.join(self.tareas_fallidas)}",
            color='red'
        )</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>CALLBACK_TYPE:</strong> Los callbacks de tipo 'stdout' reemplazan completamente la salida estándar — solo puede haber uno activo a la vez. Los de tipo 'aggregate' se añaden encima del stdout callback y puede haber varios activos simultáneamente.</div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'stdout_callback',
    definition: 'Opción de ansible.cfg que configura el formato del output en terminal. Solo puede estar activo uno a la vez. Valores comunes: yaml (legible), json (parseable), dense (compacto).',
  },
  {
    term: 'callbacks_enabled',
    definition: 'Opción de ansible.cfg (antes callback_whitelist) que lista los callbacks adicionales activados, separados por coma. A diferencia de stdout_callback, pueden estar activos múltiples al mismo tiempo.',
  },
  {
    term: 'profile_tasks',
    definition: 'Callback built-in de Ansible que registra el tiempo de ejecución de cada tarea y muestra un ranking al final del playbook. Esencial para identificar cuellos de botella de performance.',
  },
  {
    term: 'CallbackBase',
    definition: 'Clase base Python de la que heredan los callback plugins personalizados. Provee métodos v2_runner_on_ok, v2_runner_on_failed, v2_playbook_on_stats y otros hooks del ciclo de vida.',
  },
],
quiz: [
  {
    question: '¿Cuántos callbacks de tipo stdout_callback pueden estar activos simultáneamente?',
    options: [
      'Tantos como quieras',
      'Máximo dos',
      'Solo uno — si configurás otro, el primero se desactiva',
      'Depende de la versión de Ansible',
    ],
    correctIndex: 2,
    explanation: 'Solo puede haber UN stdout_callback activo a la vez porque controla el formato principal del output en terminal. Si especificás stdout_callback = yaml, eso reemplaza el formato por defecto. Los callbacks adicionales (timer, profile_tasks, slack) son de tipo aggregate y pueden coexistir múltiples simultáneamente.',
  },
  {
    question: '¿Cuál es la diferencia entre callback_whitelist y callbacks_enabled?',
    options: [
      'callback_whitelist es para callbacks de seguridad; callbacks_enabled para todos los demás',
      'Son la misma opción — callbacks_enabled es el nombre nuevo de callback_whitelist introducido en Ansible 2.11',
      'callbacks_enabled reemplaza stdout_callback; callback_whitelist no',
      'callback_whitelist es global; callbacks_enabled es por playbook',
    ],
    correctIndex: 1,
    explanation: 'En Ansible 2.11, callback_whitelist fue renombrado a callbacks_enabled para evitar la connotación del término "whitelist". Funcionalmente son idénticos. callback_whitelist sigue funcionando por compatibilidad, pero en proyectos nuevos es mejor usar callbacks_enabled.',
  },
],
troubleshooting: [
  {
    error: 'El callback de Slack no envía notificaciones',
    cause: 'La collection community.general no está instalada o el webhook_url no está configurado correctamente.',
    fix: 'Instalá la collection: ansible-galaxy collection install community.general. Verificá que el webhook_url en [callback_slack] es el URL completo de Slack Webhook. Probá el webhook directamente con curl: curl -X POST -d \'{"text":"test"}\' WEBHOOK_URL.',
  },
  {
    error: 'profile_tasks no muestra nada al final del playbook',
    cause: 'El callback no está en callbacks_enabled o hay un error de configuración.',
    fix: 'Verificá ansible.cfg: callbacks_enabled = profile_tasks. También podés activarlo temporalmente con variable de entorno: ANSIBLE_CALLBACKS_ENABLED=profile_tasks ansible-playbook playbook.yml.',
  },
],
realWorldCase: 'Un equipo de DevOps configuró callbacks_enabled = timer, profile_tasks en todos sus proyectos. Descubrieron que una tarea de "sincronizar archivos estáticos" tardaba 45 de los 50 segundos totales del deploy. Reemplazaron esa tarea con una solución basada en rsync con checksum, bajando el tiempo total a 8 segundos.',
  };
