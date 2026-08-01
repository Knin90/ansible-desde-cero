import type { StepContent } from '../types';

export const nivel19Mod1StepsA: StepContent[] = [
  {
    title: 'Anatomía de un módulo Ansible: AnsibleModule y argument_spec',
    body: `
      <p>Un módulo Ansible es un script Python independiente que Ansible copia al host remoto, ejecuta, y del cual lee el JSON que imprime en stdout. No es un plugin que corre en el controller: corre <em>en el host destino</em>.</p>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Pensá en un módulo como un "formulario inteligente": Ansible rellena los campos (parámetros), lo envía al host, el formulario ejecuta su lógica y devuelve un comprobante (JSON con <code>changed</code>, datos extra, etc.). Si el formulario detecta un error grave, devuelve un comprobante de fallo con la causa.</p>
      </div>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>argument_spec:</strong> diccionario Python que declara qué parámetros acepta el módulo — tipo, valor por defecto, opciones válidas, si es requerido. AnsibleModule lo usa para validar y coercionar los argumentos automáticamente antes de que tu código los lea.</div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">library/mi_modulo.py</span></div>
        <pre class="language-python"><code class="language-python">#!/usr/bin/python
# -*- coding: utf-8 -*-

DOCUMENTATION = r"""
---
module: mi_modulo
short_description: Módulo de ejemplo con estructura completa
description:
  - Demuestra la anatomía completa de un módulo Ansible.
  - Soporta check mode y devuelve diff cuando hay cambios.
version_added: "1.0.0"
author:
  - Tu Nombre (@tu_github)
options:
  name:
description:
  - Nombre del recurso a gestionar.
required: true
type: str
  state:
description:
  - Estado deseado del recurso.
default: present
choices: [present, absent]
type: str
  timeout:
description:
  - Tiempo máximo de espera en segundos.
default: 30
type: int
"""

EXAMPLES = r"""
- name: Crear un recurso
  mi_modulo:
name: mi-recurso
state: present
timeout: 60

- name: Eliminar un recurso
  mi_modulo:
name: viejo-recurso
state: absent
"""

RETURN = r"""
name:
  description: Nombre del recurso gestionado.
  returned: always
  type: str
  sample: mi-recurso
message:
  description: Mensaje descriptivo del resultado.
  returned: always
  type: str
  sample: "Recurso 'mi-recurso' creado exitosamente"
"""

from ansible.module_utils.basic import AnsibleModule


def resource_exists(name):
"""Simulación: verifica si el recurso existe."""
# En un módulo real, acá iría una llamada a una API, archivo, BD, etc.
return False


def create_resource(name, timeout):
"""Simulación: crea el recurso y retorna sus datos."""
return {'id': f'id-{name}', 'created': True}


def delete_resource(name):
"""Simulación: elimina el recurso."""
pass


def run_module():
# 1. Declarar el argument_spec — contrato de la interfaz pública
module_args = dict(
    name=dict(type='str', required=True),
    state=dict(type='str', default='present',
               choices=['present', 'absent']),
    timeout=dict(type='int', default=30),
)

# 2. Inicializar el resultado (siempre incluir 'changed')
result = dict(
    changed=False,
    name='',
    message='',
)

# 3. Crear la instancia AnsibleModule — valida los args automáticamente
module = AnsibleModule(
    argument_spec=module_args,
    supports_check_mode=True,   # Declara que soportamos --check
)

# 4. Leer parámetros ya validados y coercionados
name    = module.params['name']
state   = module.params['state']
timeout = module.params['timeout']

# 5. Lógica principal con soporte de check mode
exists = resource_exists(name)

if state == 'present' and not exists:
    result['changed'] = True
    result['diff'] = {
        'before': '',
        'after': f'Recurso: {name}\n',
    }
    if not module.check_mode:          # En --check, NO ejecutar cambios
        data = create_resource(name, timeout)
        result['message'] = f"Recurso '{name}' creado (id={data['id']})"
    else:
        result['message'] = f"[CHECK] Se crearía el recurso '{name}'"

elif state == 'absent' and exists:
    result['changed'] = True
    result['diff'] = {
        'before': f'Recurso: {name}\n',
        'after': '',
    }
    if not module.check_mode:
        delete_resource(name)
        result['message'] = f"Recurso '{name}' eliminado"
    else:
        result['message'] = f"[CHECK] Se eliminaría el recurso '{name}'"

else:
    result['message'] = f"Recurso '{name}' ya está en estado '{state}' — sin cambios"

result['name'] = name

# 6. Salida exitosa — Ansible lee el JSON de stdout
module.exit_json(**result)


def main():
run_module()


if __name__ == '__main__':
main()</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>supports_check_mode=True:</strong> Si declarás esto, Ansible puede llamar tu módulo con <code>module.check_mode == True</code>. Tu responsabilidad es NO ejecutar cambios reales cuando sea True, pero sí calcular qué cambiaría y devolverlo en <code>result['diff']</code>.</div>
      </div>
    `
  },
  {
    title: 'exit_json, fail_json y el campo diff',
    body: `
      <p>Ansible determina el resultado de una tarea exclusivamente del JSON que devuelve tu módulo. Dos métodos de AnsibleModule controlan esto: <code>exit_json()</code> para éxito y <code>fail_json()</code> para fallo. Ambos terminan la ejecución del módulo inmediatamente.</p>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Campos especiales que Ansible interpreta:</strong><br>
          • <code>changed</code> (bool) — si el host fue modificado. Afecta handlers y la cuenta final.<br>
          • <code>failed</code> (bool) — si es True, Ansible marca la tarea como fallida.<br>
          • <code>msg</code> (str) — mensaje de error (requerido en fail_json).<br>
          • <code>diff</code> (dict con before/after) — mostrado con <code>--diff</code>.<br>
          • <code>rc</code> (int) — código de retorno de un subprocess, si aplica.<br>
          • <code>stdout</code> / <code>stderr</code> — salidas de subprocesos para debugging.
        </div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">exit_fail_examples.py</span></div>
        <pre class="language-python"><code class="language-python">from ansible.module_utils.basic import AnsibleModule

def run_module():
module = AnsibleModule(argument_spec=dict(
    path=dict(type='str', required=True),
))

path = module.params['path']

# --- Caso 1: éxito sin cambios (idempotencia) ---
if already_configured(path):
    module.exit_json(
        changed=False,
        msg=f"'{path}' ya está configurado correctamente",
    )

# --- Caso 2: éxito con cambios ---
try:
    old_content = read_config(path)
    write_config(path, new_content='...')
    module.exit_json(
        changed=True,
        msg=f"'{path}' actualizado",
        diff=dict(
            before=old_content,
            after='...',
        ),
    )
except PermissionError as e:
    # --- Caso 3: fallo controlado ---
    module.fail_json(
        msg=f"Sin permisos para escribir en '{path}': {e}",
        path=path,
        # Podés agregar cualquier campo extra para debugging
    )
except Exception as e:
    # --- Caso 4: fallo inesperado ---
    module.fail_json(
        msg=f"Error inesperado: {e}",
        exception=traceback.format_exc(),   # Muy útil para debugging
    )</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Nunca uses sys.exit() ni print():</strong> AnsibleModule escribe el JSON en stdout y termina con <code>exit_json()</code> o <code>fail_json()</code>. Llamar <code>sys.exit()</code> directamente o hacer <code>print()</code> corrompe la comunicación entre el módulo y Ansible y produce errores crípticos.</div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">usar-modulo.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Demostración de módulo propio
  hosts: localhost
  gather_facts: false

  tasks:
- name: Crear recurso (con check mode)
  mi_modulo:
    name: mi-recurso
    state: present
    timeout: 60
  register: resultado
  check_mode: true        # Solo para esta tarea

- name: Mostrar resultado
  ansible.builtin.debug:
    msg: "Cambio: {{ resultado.changed }} — {{ resultado.message }}"

- name: Crear recurso real
  mi_modulo:
    name: mi-recurso
    state: present
  notify: Reiniciar servicio

  handlers:
- name: Reiniciar servicio
  ansible.builtin.service:
    name: mi-servicio
    state: restarted</code></pre>
      </div>
    `
  }
];
