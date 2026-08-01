import type { StepContent } from '../types';

export const nivel19Mod1StepsB: StepContent[] = [
  {
    title: 'module_utils: código compartido entre módulos',
    body: `
      <p>Cuando varios módulos comparten lógica (autenticación con una API, validaciones comunes, helpers de formato), podés extraerla en <code>module_utils/</code>. Ansible la transfiere al host remoto junto con el módulo que la usa.</p>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>module_utils/:</strong> directorio especial que Ansible empaqueta junto al módulo cuando lo transfiere al host. El código en <code>module_utils/</code> se importa con <code>from ansible.module_utils.mi_utils import ...</code>. En una collection, el path es <code>plugins/module_utils/</code>.</div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">estructura-module-utils.sh</span></div>
        <pre class="language-bash"><code class="language-bash">library/
  modulo_web.py       # Gestiona recursos web
  modulo_db.py        # Gestiona recursos de BD
module_utils/
  empresa_api.py      # Código compartido: cliente HTTP, autenticación</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">module_utils/empresa_api.py</span></div>
        <pre class="language-python"><code class="language-python"># module_utils/empresa_api.py
# Código compartido entre todos los módulos de nuestra empresa

import json

try:
import requests
HAS_REQUESTS = True
except ImportError:
HAS_REQUESTS = False


class EmpresaAPIError(Exception):
pass


class EmpresaAPIClient:
"""Cliente HTTP reutilizable para la API interna."""

def __init__(self, base_url, token, timeout=30):
    self.base_url = base_url.rstrip('/')
    self.token = token
    self.timeout = timeout
    self.session = requests.Session()
    self.session.headers.update({
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
    })

def get(self, endpoint):
    try:
        resp = self.session.get(
            f'{self.base_url}/{endpoint}',
            timeout=self.timeout,
        )
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as e:
        raise EmpresaAPIError(f"GET {endpoint} falló: {e}")

def post(self, endpoint, data):
    try:
        resp = self.session.post(
            f'{self.base_url}/{endpoint}',
            json=data,
            timeout=self.timeout,
        )
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as e:
        raise EmpresaAPIError(f"POST {endpoint} falló: {e}")

def delete(self, endpoint):
    try:
        resp = self.session.delete(
            f'{self.base_url}/{endpoint}',
            timeout=self.timeout,
        )
        resp.raise_for_status()
    except requests.RequestException as e:
        raise EmpresaAPIError(f"DELETE {endpoint} falló: {e}")


def check_dependencies(module):
"""Verifica dependencias de terceros y falla con mensaje claro."""
if not HAS_REQUESTS:
    module.fail_json(
        msg="La librería 'requests' es requerida. "
            "Instalá con: pip install requests"
    )</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">library/modulo_web.py</span></div>
        <pre class="language-python"><code class="language-python">#!/usr/bin/python
# -*- coding: utf-8 -*-

from ansible.module_utils.basic import AnsibleModule
from ansible.module_utils.empresa_api import (
EmpresaAPIClient, EmpresaAPIError, check_dependencies
)


def run_module():
module_args = dict(
    api_url=dict(type='str', required=True),
    api_token=dict(type='str', required=True, no_log=True),
    site_name=dict(type='str', required=True),
    state=dict(type='str', default='present',
               choices=['present', 'absent']),
)

module = AnsibleModule(argument_spec=module_args,
                       supports_check_mode=True)

# Verificar dependencias antes de cualquier otra cosa
check_dependencies(module)

client = EmpresaAPIClient(
    base_url=module.params['api_url'],
    token=module.params['api_token'],
)

name = module.params['site_name']

try:
    existing = client.get(f'sites/{name}')
    exists = existing.get('status') == 'active'
except EmpresaAPIError:
    exists = False

result = dict(changed=False, site=name)

if module.params['state'] == 'present' and not exists:
    result['changed'] = True
    if not module.check_mode:
        data = client.post('sites', {'name': name, 'state': 'active'})
        result['site_id'] = data.get('id')
elif module.params['state'] == 'absent' and exists:
    result['changed'] = True
    if not module.check_mode:
        client.delete(f'sites/{name}')

module.exit_json(**result)


def main():
run_module()

if __name__ == '__main__':
main()</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>no_log=True:</strong> Marcá siempre los parámetros que contienen credenciales con <code>no_log=True</code> en el argument_spec. Ansible los omite de los logs, del output con <code>-v</code> y de cualquier callback. Sin esto, los tokens aparecen en texto plano en el historial de ejecución.</div>
      </div>
    `
  },
  {
    title: 'Bloques DOCUMENTATION, EXAMPLES y RETURN',
    body: `
      <p>Los tres bloques de docstring en el módulo no son decorativos: <code>ansible-doc</code> los parsea para mostrar ayuda y la web de documentación de Ansible los usa para generar páginas automáticamente. Un módulo sin documentación no pasará sanity checks.</p>
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio</div>
        <div class="lab-content">
          <p>Probá ver la documentación de un módulo built-in para entender el formato:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ver-docs.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Ver documentación renderizada de un módulo instalado
ansible-doc ansible.builtin.copy

# Ver la fuente del módulo (incluyendo DOCUMENTATION raw)
ansible-doc -s ansible.builtin.copy

# Si tu módulo está en library/, podés verlo así:
ANSIBLE_LIBRARY=library ansible-doc mi_modulo</code></pre>
          </div>
        </div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">library/modulo_completo.py (docstrings)</span></div>
        <pre class="language-python"><code class="language-python">DOCUMENTATION = r"""
---
module: modulo_completo
short_description: Gestiona recursos de la plataforma interna
description:
  - Crea, actualiza o elimina recursos en la plataforma interna de la empresa.
  - Soporta check mode y devuelve diff completo.
version_added: "1.0.0"
author:
  - Ana García (@anagarcia)
notes:
  - Requiere el paquete Python C(requests>=2.28).
  - La API key debe tener permisos de escritura en el namespace destino.
seealso:
  - module: ansible.builtin.uri
description: Para llamadas HTTP genéricas sin este módulo.
options:
  name:
description:
  - Nombre único del recurso.
  - Debe tener entre 3 y 64 caracteres alfanuméricos con guiones.
required: true
type: str
  state:
description:
  - V(present) crea o actualiza el recurso.
  - V(absent) lo elimina si existe.
default: present
choices: [present, absent]
type: str
  tags:
description:
  - Diccionario de tags clave-valor para el recurso.
default: {}
type: dict
  api_url:
description:
  - URL base de la API interna.
default: https://api.interna.empresa.com
type: str
  api_token:
description:
  - Token de autenticación Bearer.
  - Evitá hardcodearlo; usá C(ansible-vault) o variables de entorno.
required: true
type: str
no_log: true
"""

EXAMPLES = r"""
- name: Crear recurso con tags
  mi_empresa.plataforma.modulo_completo:
name: app-produccion
state: present
tags:
  env: prod
  equipo: backend
api_token: "{{ vault_api_token }}"

- name: Idempotencia — segunda ejecución no debe cambiar nada
  mi_empresa.plataforma.modulo_completo:
name: app-produccion
state: present
api_token: "{{ vault_api_token }}"

- name: Eliminar recurso (con check mode primero)
  mi_empresa.plataforma.modulo_completo:
name: app-vieja
state: absent
api_token: "{{ vault_api_token }}"
  check_mode: true
"""

RETURN = r"""
name:
  description: Nombre del recurso gestionado.
  returned: always
  type: str
  sample: app-produccion
resource_id:
  description: ID único asignado por la plataforma.
  returned: when state=present and changed=true
  type: str
  sample: "res-a1b2c3d4"
tags:
  description: Tags actuales del recurso tras la operación.
  returned: when state=present
  type: dict
  sample: {env: prod, equipo: backend}
"""</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>DOCUMENTATION es YAML dentro de Python:</strong> Es una cadena que contiene YAML válido. Un error de indentación en DOCUMENTATION rompe <code>ansible-doc</code> y falla los sanity checks. Validá con: <code>python -c "import yaml; yaml.safe_load(open('library/mi_modulo.py').read().split('DOCUMENTATION = r"""')[1].split('"""')[0])"</code></div>
      </div>
    `
  }
];
