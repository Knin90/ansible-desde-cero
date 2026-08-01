import type { StepContent } from '../types';

export const nivel19Mod2StepsB: StepContent[] = [
  {
    title: 'Lookup plugin: obtener datos de fuentes externas',
    body: `
      <p>Los lookup plugins permiten leer datos de fuentes externas durante la ejecución de un playbook: archivos, APIs, bases de datos, servicios de configuración. Se usan con la función <code>lookup()</code> en Jinja2 y corren en el <em>controller</em>, no en los hosts.</p>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>LookupBase:</strong> clase base en <code>ansible.plugins.lookup</code> que todos los lookup plugins deben extender. El método <code>run(terms, variables, **kwargs)</code> recibe la lista de argumentos y debe devolver una lista de resultados (uno por término).</div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">lookup_plugins/config_service.py</span></div>
        <pre class="language-python"><code class="language-python">#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
Lookup plugin que obtiene configuración desde un servicio HTTP interno.

Uso en playbook:
  - ansible.builtin.debug:
  msg: "{{ lookup('config_service', 'db.host') }}"
  - ansible.builtin.debug:
  msg: "{{ lookup('config_service', 'db.host', 'db.port') }}"
"""

from __future__ import annotations

from ansible.errors import AnsibleError, AnsibleLookupError
from ansible.plugins.lookup import LookupBase
from ansible.utils.display import Display

display = Display()

try:
import requests
HAS_REQUESTS = True
except ImportError:
HAS_REQUESTS = False


class LookupModule(LookupBase):

def run(self, terms, variables=None, **kwargs):
    """
    Obtiene valores de configuración de un servicio HTTP.

    Args:
        terms: Lista de claves a buscar (ej: ['db.host', 'db.port'])
        variables: Variables del playbook (para acceder a vars de Ansible)
        **kwargs: Argumentos adicionales (base_url, timeout, env)
    """
    if not HAS_REQUESTS:
        raise AnsibleError(
            "El lookup 'config_service' requiere la librería 'requests'. "
            "Instalá con: pip install requests"
        )

    # Leer parámetros opcionales con valores por defecto
    base_url = kwargs.get('base_url', 'http://config-service.interno:8080')
    timeout  = int(kwargs.get('timeout', 5))
    env      = kwargs.get('env', 'production')

    results = []

    for term in terms:
        display.vvv(f"config_service lookup: buscando '{term}' en env='{env}'")

        try:
            url = f'{base_url}/api/v1/config/{env}/{term}'
            resp = requests.get(url, timeout=timeout)
            resp.raise_for_status()
            value = resp.json().get('value')

            if value is None:
                raise AnsibleLookupError(
                    f"La clave '{term}' no existe en el config service "
                    f"(env={env})"
                )

            results.append(value)
            display.vvv(f"config_service: '{term}' = [OCULTADO]")

        except requests.Timeout:
            raise AnsibleLookupError(
                f"Timeout alcanzado buscando '{term}' en config service "
                f"({base_url}). timeout={timeout}s"
            )
        except requests.RequestException as e:
            raise AnsibleLookupError(
                f"Error HTTP buscando '{term}' en config service: {e}"
            )

    return results</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">usar-lookup-plugin.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Usar lookup plugin propio
  hosts: appservers
  vars:
# Obtener configuración individual
db_host: "{{ lookup('config_service', 'db.host') }}"
db_port: "{{ lookup('config_service', 'db.port', env='staging') }}"

# Obtener múltiples valores de una vez
redis_config: "{{ lookup('config_service', 'redis.host', 'redis.port', base_url='http://otro-config:9090') }}"

  tasks:
- name: Configurar aplicación con datos del config service
  ansible.builtin.template:
    src: app.conf.j2
    dest: /etc/app/config.conf
  vars:
    database_host: "{{ db_host }}"
    database_port: "{{ db_port }}"

- name: Verificar conectividad con la base de datos
  ansible.builtin.wait_for:
    host: "{{ db_host }}"
    port: "{{ db_port | int }}"
    timeout: 10</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Los lookups corren en el controller:</strong> A diferencia de los módulos, los lookup plugins se ejecutan en la máquina desde donde corrés Ansible, no en los hosts remotos. Por eso no tenés acceso a los facts del host, pero sí tenés acceso a los archivos locales y a la red del controller.</div>
      </div>
    `
  },
  {
    title: 'Callback plugin: personalizar la salida de Ansible',
    body: `
      <p>Los callback plugins interceptan eventos del ciclo de vida de un playbook (start, task OK, task FAILED, playbook end) y te permiten personalizar la salida, enviar notificaciones, o escribir métricas a sistemas externos.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">callback_plugins/slack_notifier.py</span></div>
        <pre class="language-python"><code class="language-python">#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
Callback plugin que envía notificaciones de inicio y resultado a Slack.
"""

from __future__ import annotations

import os
import json
import datetime

from ansible.plugins.callback import CallbackBase

try:
import requests
HAS_REQUESTS = True
except ImportError:
HAS_REQUESTS = False

DOCUMENTATION = r"""
---
name: slack_notifier
type: notification
short_description: Notificaciones de playbooks a Slack
description:
  - Envía un mensaje a Slack cuando comienza y cuando termina un playbook.
  - El webhook de Slack se configura con la variable de entorno SLACK_WEBHOOK.
requirements:
  - requests
options:
  webhook_url:
description: URL del webhook de Slack.
env:
  - name: SLACK_WEBHOOK
"""


class CallbackModule(CallbackBase):
"""Plugin de callback que notifica a Slack."""

CALLBACK_VERSION = 2.0
CALLBACK_TYPE    = 'notification'   # No reemplaza el output por defecto
CALLBACK_NAME    = 'slack_notifier'
CALLBACK_NEEDS_ENABLED = True       # Requiere habilitación explícita

def __init__(self):
    super().__init__()
    self._webhook_url   = os.environ.get('SLACK_WEBHOOK', '')
    self._playbook_name = ''
    self._start_time    = None
    self._task_stats    = {'ok': 0, 'changed': 0, 'failed': 0, 'skipped': 0}

def v2_playbook_on_start(self, playbook):
    """Llamado cuando comienza el playbook."""
    self._playbook_name = playbook._file_name
    self._start_time    = datetime.datetime.now()
    self._send_slack(
        color='#439FE0',
        title=f':rocket: Playbook iniciado: {self._playbook_name}',
        text=f'Iniciado por: {os.environ.get("USER", "desconocido")}',
    )

def v2_runner_on_ok(self, result):
    """Llamado cuando una tarea termina OK."""
    if result.is_changed():
        self._task_stats['changed'] += 1
    else:
        self._task_stats['ok'] += 1

def v2_runner_on_failed(self, result, ignore_errors=False):
    """Llamado cuando una tarea falla."""
    if not ignore_errors:
        self._task_stats['failed'] += 1

def v2_playbook_on_stats(self, stats):
    """Llamado al final del playbook con las estadísticas globales."""
    duration = ''
    if self._start_time:
        elapsed = datetime.datetime.now() - self._start_time
        duration = f' ({int(elapsed.total_seconds())}s)'

    failed = self._task_stats['failed']
    color  = 'danger' if failed > 0 else 'good'
    icon   = ':x:' if failed > 0 else ':white_check_mark:'
    status = 'FALLIDO' if failed > 0 else 'EXITOSO'

    text_parts = [
        f'OK: {self._task_stats["ok"]}',
        f'Cambiado: {self._task_stats["changed"]}',
        f'Saltado: {self._task_stats["skipped"]}',
        f'Fallido: {failed}',
    ]

    self._send_slack(
        color=color,
        title=f'{icon} Playbook {status}{duration}: {self._playbook_name}',
        text=' | '.join(text_parts),
    )

def _send_slack(self, color, title, text):
    """Envía un mensaje al webhook de Slack."""
    if not self._webhook_url or not HAS_REQUESTS:
        return

    payload = {
        'attachments': [{
            'color': color,
            'title': title,
            'text': text,
            'footer': 'Ansible',
            'ts': int(datetime.datetime.now().timestamp()),
        }]
    }

    try:
        requests.post(self._webhook_url, json=payload, timeout=5)
    except Exception:
        pass   # Los callbacks nunca deben romper la ejecución</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
        <pre class="language-ini"><code class="language-ini">[defaults]
# Habilitar el callback propio (CALLBACK_NEEDS_ENABLED = True)
callback_enabled = slack_notifier

# El callback de output por defecto sigue funcionando
stdout_callback = yaml</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>CALLBACK_TYPE = notification:</strong> Con este tipo, tu callback coexiste con el callback de stdout (yaml, default, etc.). Con <code>stdout</code> reemplazaría la salida por pantalla. Con <code>aggregate</code> acumula información sin mostrar nada. Casi siempre querés <code>notification</code>.</div>
      </div>
    `
  }
];
