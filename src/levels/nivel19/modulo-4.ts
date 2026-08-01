import type { ModuleContent } from '../types';

export const nivel19Mod4: ModuleContent =   {
levelId: 19,
moduleId: 4,
title: 'Testing de módulos',
duration: '1.5 horas',
objective: 'Escribir tests unitarios con pytest y ejecutar sanity checks con ansible-test para garantizar la calidad de los módulos propios.',
objectives: [
  'Usar set_module_args() y AnsibleModule con pytest para tests unitarios',
  'Testear los tres caminos: éxito sin cambios, éxito con cambios, y fallo',
  'Ejecutar ansible-test sanity para verificar estilo y documentación',
  'Organizar tests en la estructura que espera ansible-test units',
],
prerequisites: [
  'Módulos 19.1–19.3 completados',
  'Python básico y conceptos de testing con pytest',
],
steps: [
  {
    title: 'Tests unitarios con pytest y set_module_args',
    body: `
      <p>Ansible provee utilidades específicas para testear módulos con pytest. El patrón clave es <code>set_module_args()</code> para configurar los argumentos que el módulo recibirá, y capturar el <code>SystemExit</code> que lanza <code>exit_json()</code> o <code>fail_json()</code>.</p>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>set_module_args():</strong> función helper que simula los argumentos que Ansible pasaría al módulo en producción. Los escribe en el formato interno que AnsibleModule espera leer. Sin esto, AnsibleModule no puede inicializarse en un test.</div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">setup-testing.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Instalar dependencias de testing
pip install pytest pytest-mock ansible

# Estructura de tests para ansible-test
# (dentro de la collection mi_empresa/infraestructura/)
mkdir -p tests/unit/plugins/modules

# Para proyectos fuera de collection (library/ simple)
mkdir -p tests/unit</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">tests/unit/plugins/modules/test_mi_modulo.py</span></div>
        <pre class="language-python"><code class="language-python">"""
Tests unitarios para library/mi_modulo.py
"""
import json
import sys
import pytest
from unittest.mock import patch, MagicMock

# Añadir library/ al path para importar el módulo
sys.path.insert(0, 'library')

from ansible.module_utils import basic
from ansible.module_utils.common.text.converters import to_bytes


def set_module_args(args):
"""
Configura los argumentos que recibirá AnsibleModule.
Simula lo que Ansible hace internamente antes de ejecutar el módulo.
"""
args_json = json.dumps({'ANSIBLE_MODULE_ARGS': args})
basic._ANSIBLE_ARGS = to_bytes(args_json)


class TestMiModulo:
"""Tests para mi_modulo."""

def test_modulo_crea_recurso_cuando_no_existe(self):
    """
    Caso: state=present y el recurso NO existe.
    Esperado: changed=True, sin error.
    """
    set_module_args({
        'name': 'nuevo-recurso',
        'state': 'present',
        'timeout': 30,
    })

    # Parcheamos resource_exists para que retorne False (no existe)
    with patch('mi_modulo.resource_exists', return_value=False):
        with patch('mi_modulo.create_resource',
                   return_value={'id': 'id-test'}) as mock_create:
            with pytest.raises(SystemExit) as exc:
                import mi_modulo
                mi_modulo.main()

            assert exc.value.code == 0   # 0 = éxito

            # Verificar que create_resource fue llamado
            mock_create.assert_called_once_with('nuevo-recurso', 30)

def test_modulo_idempotente_cuando_recurso_existe(self):
    """
    Caso: state=present y el recurso YA existe.
    Esperado: changed=False (idempotencia).
    """
    set_module_args({
        'name': 'recurso-existente',
        'state': 'present',
    })

    with patch('mi_modulo.resource_exists', return_value=True):
        with patch('mi_modulo.create_resource') as mock_create:
            with pytest.raises(SystemExit) as exc:
                import mi_modulo
                importlib.reload(mi_modulo)   # Forzar reimport limpio
                mi_modulo.main()

            assert exc.value.code == 0
            # create_resource NO debe llamarse si ya existe
            mock_create.assert_not_called()

def test_modulo_elimina_recurso(self):
    """
    Caso: state=absent y el recurso existe.
    Esperado: changed=True.
    """
    set_module_args({
        'name': 'recurso-a-eliminar',
        'state': 'absent',
    })

    with patch('mi_modulo.resource_exists', return_value=True):
        with patch('mi_modulo.delete_resource') as mock_delete:
            with pytest.raises(SystemExit) as exc:
                import mi_modulo
                mi_modulo.main()

            assert exc.value.code == 0
            mock_delete.assert_called_once_with('recurso-a-eliminar')

def test_modulo_falla_con_argumento_requerido_ausente(self):
    """
    Caso: parámetro 'name' requerido no enviado.
    Esperado: exit_code=1 (fail_json llamado).
    """
    set_module_args({})   # Sin 'name' — es required=True

    with pytest.raises(SystemExit) as exc:
        import mi_modulo
        mi_modulo.main()

    assert exc.value.code == 1   # 1 = fallo

def test_modulo_check_mode_no_aplica_cambios(self):
    """
    Caso: check_mode=True con recurso ausente.
    Esperado: changed=True (habría cambios) pero create_resource NO llamado.
    """
    set_module_args({
        'name': 'recurso-nuevo',
        'state': 'present',
        '_ansible_check_mode': True,   # Activar check mode
    })

    with patch('mi_modulo.resource_exists', return_value=False):
        with patch('mi_modulo.create_resource') as mock_create:
            with pytest.raises(SystemExit) as exc:
                import mi_modulo
                mi_modulo.main()

            assert exc.value.code == 0
            # En check mode, nunca debe crear el recurso real
            mock_create.assert_not_called()</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">correr-tests.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Correr todos los tests con output detallado
pytest tests/unit/ -v

# Correr con cobertura
pytest tests/unit/ -v --cov=library --cov-report=html

# Correr un test específico
pytest tests/unit/plugins/modules/test_mi_modulo.py::TestMiModulo::test_modulo_crea_recurso_cuando_no_existe -v</code></pre>
      </div>
    `
  },
  {
    title: 'ansible-test sanity: validación de calidad',
    body: `
      <p><code>ansible-test sanity</code> ejecuta un conjunto de validadores automáticos sobre el código de una collection: estilo de código, documentación válida, imports correctos, etc. Es el gate de calidad que usa el proyecto Ansible oficialmente.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ansible-test-sanity.sh</span></div>
        <pre class="language-bash"><code class="language-bash">cd mi_empresa/infraestructura

# Correr todos los sanity checks (requiere estar dentro de la collection)
ansible-test sanity --python 3.11

# Ver qué checks están disponibles
ansible-test sanity --list-tests

# Correr solo checks específicos
ansible-test sanity --test pep8 --python 3.11
ansible-test sanity --test validate-modules --python 3.11
ansible-test sanity --test documentation --python 3.11

# Ignorar un check específico para un archivo
# (crear archivo .ignore en tests/sanity/)
echo "plugins/modules/mi_modulo.py pep8" >> tests/sanity/ignore.txt</code></pre>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Los sanity checks más importantes:</strong><br>
          • <code>validate-modules</code> — verifica DOCUMENTATION, EXAMPLES, RETURN correctos<br>
          • <code>pep8</code> — estilo Python (PEP 8)<br>
          • <code>pylint</code> — análisis estático de Python<br>
          • <code>import</code> — todos los imports son resolvibles<br>
          • <code>shebang</code> — el shebang #!/usr/bin/python está presente<br>
          • <code>no-get-exception</code> — no usar get_exception() deprecated<br>
          • <code>future-import-boilerplate</code> — from __future__ imports requeridos
        </div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ansible-test-units.sh</span></div>
        <pre class="language-bash"><code class="language-bash">cd mi_empresa/infraestructura

# Correr tests unitarios con ansible-test (más estricto que pytest directo)
ansible-test units --python 3.11 plugins/modules/mi_modulo.py

# Correr todos los unit tests de la collection
ansible-test units --python 3.11

# Con Docker (entorno aislado — recomendado para CI)
ansible-test units --python 3.11 --docker default</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>ansible-test vs pytest directo:</strong> <code>ansible-test units</code> usa pytest internamente pero establece el PYTHONPATH correcto para resolver imports de ansible.module_utils y plugins. Si los tests pasan con pytest directo pero fallan con ansible-test, es casi siempre un problema de imports relativos o paths.</div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'set_module_args',
    definition: 'Función helper de ansible.module_utils.basic que simula los argumentos que Ansible pasaría al módulo. Escribe el JSON de argumentos en la variable interna que AnsibleModule lee al inicializarse. Imprescindible para tests unitarios.',
  },
  {
    term: 'ansible-test sanity',
    definition: 'Herramienta de Ansible que ejecuta validaciones automáticas sobre el código de una collection: estilo PEP8, documentación válida, imports correctos, convenciones de módulos. Es el estándar de calidad del proyecto Ansible.',
  },
  {
    term: 'ansible-test units',
    definition: 'Subcomando de ansible-test que ejecuta los tests unitarios de una collection con el entorno Python correcto. Internamente usa pytest pero configura el PYTHONPATH para resolver correctamente los imports de ansible.module_utils.',
  },
  {
    term: 'SystemExit en tests de módulos',
    definition: 'exit_json() y fail_json() de AnsibleModule llaman sys.exit() internamente. Los tests deben capturar este SystemExit con pytest.raises(SystemExit). El código de salida es 0 para éxito y 1 para fallo.',
  },
],
quiz: [
  {
    question: '¿Por qué los tests de módulos Ansible capturan SystemExit en lugar de verificar un valor de retorno?',
    options: [
      'Por un bug histórico en AnsibleModule que nunca fue corregido',
      'Porque exit_json() y fail_json() llaman sys.exit() internamente para terminar el proceso',
      'Porque los módulos siempre fallan con SystemExit',
      'Porque pytest requiere que todos los tests sean funciones generadoras',
    ],
    correctIndex: 1,
    explanation: 'exit_json() y fail_json() serializan el resultado JSON en stdout y luego llaman sys.exit(0) o sys.exit(1) respectivamente. Esto termina el proceso Python. En un test, capturamos ese SystemExit con pytest.raises(SystemExit) y verificamos el código de salida (0=éxito, 1=fallo).',
  },
  {
    question: '¿Qué verifica el sanity check "validate-modules"?',
    options: [
      'Que el módulo funcione correctamente en un host remoto',
      'Que los bloques DOCUMENTATION, EXAMPLES y RETURN sean YAML válido y completo',
      'Que el módulo no tenga vulnerabilidades de seguridad',
      'Que el módulo sea idempotente',
    ],
    correctIndex: 1,
    explanation: 'validate-modules verifica que los tres bloques de docstring (DOCUMENTATION, EXAMPLES, RETURN) sean YAML válido, que los argumentos documentados coincidan con argument_spec, que los tipos declarados sean correctos, y que los campos obligatorios como short_description y description estén presentes.',
  },
  {
    question: '¿Cuántos casos de test son mínimo necesarios para cubrir la lógica básica de un módulo con state=present/absent?',
    options: [
      '1 — un test de happy path es suficiente',
      '2 — un test por cada valor de state',
      '4+ — present sin existir, present existiendo (idempotencia), absent existiendo, absent sin existir (idempotencia)',
      '10+ — uno por cada combinación de parámetros',
    ],
    correctIndex: 2,
    explanation: 'Para cubrir los caminos correctamente necesitás al menos 4 tests: (1) state=present y recurso NO existe → changed=True, (2) state=present y recurso YA existe → changed=False (idempotencia), (3) state=absent y recurso existe → changed=True, (4) state=absent y recurso NO existe → changed=False. Además idealmente un test para check_mode y uno para parámetros inválidos.',
  },
],
troubleshooting: [
  {
    error: 'ImportError: No module named ansible.module_utils.basic en los tests',
    cause: 'ansible-core no está instalado en el entorno Python donde se corren los tests.',
    fix: 'Instalá ansible-core en el entorno de testing: pip install ansible-core. Verificá con: python -c "from ansible.module_utils.basic import AnsibleModule; print(\'OK\')"',
  },
  {
    error: 'AnsibleModule falla con "No argument list passed" en los tests',
    cause: 'set_module_args() no fue llamado antes de invocar el módulo, o fue llamado con un diccionario vacío para un módulo con parámetros required=True.',
    fix: 'Asegurate de llamar set_module_args({...}) con todos los parámetros requeridos antes de cada llamada a modulo.main(). Verificá que basic._ANSIBLE_ARGS esté seteado correctamente.',
  },
  {
    error: 'ansible-test sanity falla con "missing required documentation key"',
    cause: 'El bloque DOCUMENTATION no tiene uno de los campos obligatorios: module, short_description, description, o version_added.',
    fix: 'Revisá el bloque DOCUMENTATION contra la plantilla oficial. Los campos mínimos son: module (nombre), short_description (una línea), description (lista de ítems), version_added, y options con description/type/required para cada parámetro.',
  },
],
  };
