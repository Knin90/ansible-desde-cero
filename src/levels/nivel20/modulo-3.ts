import type { ModuleContent } from '../types';

export const nivel20Mod3: ModuleContent =   {
levelId: 20,
moduleId: 3,
title: 'Lectura del código fuente',
duration: '2 horas',
objective: 'Navegar el código fuente de Ansible como herramienta de diagnóstico y aprendizaje avanzado.',
objectives: [
  'Saber dónde mirar según el tipo de problema que se investiga',
  'Usar git log y git blame para entender por qué algo funciona así',
  'Configurar el entorno de desarrollo para modificar Ansible localmente',
  'Contribuir al proyecto Ansible con el proceso correcto',
],
prerequisites: [
  'Módulos 20.1 y 20.2 completados',
],
steps: [
  {
    title: 'Mapa de diagnóstico: dónde mirar según el problema',
    body: `
      <p>Cuando algo en Ansible no funciona como esperás, saber el archivo exacto donde buscar en el código fuente te ahorra horas de trial and error. Este mapa relaciona síntomas con archivos fuente.</p>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Síntoma → Archivo fuente donde investigar:</strong>
        </div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">mapa-diagnostico.sh</span></div>
        <pre class="language-bash"><code class="language-bash">cd ansible  # en el repositorio clonado

# ① Variable no tiene el valor esperado / precedencia incorrecta
less lib/ansible/vars/manager.py          # método get_vars()
# → buscar la lista de precedencias y el orden de merge

# ② Template {{ variable }} produce resultado inesperado
less lib/ansible/template/__init__.py     # clase Templar, método template()
# → ver cómo se evalúan las expresiones Jinja2

# ③ Módulo command/shell no ejecuta como esperás
less lib/ansible/modules/command.py       # el módulo mismo

# ④ La recopilación de facts (gather_facts) es lenta o incompleta
less lib/ansible/module_utils/facts/collector.py
# → ver qué collectors están activos y en qué orden

# ⑤ Problemas de conexión SSH (timeout, autenticación)
less lib/ansible/plugins/connection/ssh.py
# → buscar _build_ssh_cmd() y las opciones ControlMaster

# ⑥ Handler no se ejecuta cuando debería (o ejecuta de más)
less lib/ansible/executor/play_iterator.py
# → buscar la lógica de handler notification y deduplication

# ⑦ ansible.builtin.template produce salida inesperada
less lib/ansible/plugins/action/template.py  # action plugin de template
# → ver cómo preprocesa el template antes de copiarlo

# ⑧ Comportamiento inesperado de block/rescue/always
less lib/ansible/playbook/block.py
# → lógica de captura de errores y ejecución condicional

# ⑨ Cómo funciona exactamente --check --diff juntos
less lib/ansible/executor/task_executor.py   # método _execute()
# → buscar check_mode y diff_mode en la lógica de ejecución

# ⑩ El módulo X no pasa el resultado correcto
less lib/ansible/plugins/action/normal.py    # action plugin genérico
# → ver cómo se serializa y deserializa el JSON del módulo</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">buscar-en-fuente.sh</span></div>
        <pre class="language-bash"><code class="language-bash">cd ansible

# Buscar dónde se define un error específico por su texto
grep -r "MODULE_REQUIRE_ARGS" lib/ansible/ --include="*.py" -l
grep -r "is not a valid attribute" lib/ansible/ --include="*.py" -n | head -5

# Buscar cómo se implementa una opción de configuración
grep -r "ANSIBLE_PIPELINING\|pipelining" lib/ansible/ --include="*.py" -n | head -10

# Ver la historia de cambios de un archivo específico
git log --oneline lib/ansible/vars/manager.py | head -20

# Ver qué cambió en un commit específico que afecta a un módulo
git show abc1234 -- lib/ansible/modules/command.py

# Encontrar cuándo se introdujo una funcionalidad
git log --all --oneline --grep="serial" lib/ansible/ | head -10</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>git blame para entender decisiones:</strong> Cuando ves código que parece incorrecto, usá <code>git blame lib/ansible/vars/manager.py | grep -n "linea_sospechosa"</code> para ver el commit que lo introdujo, y luego <code>git show COMMIT_HASH</code> para leer el mensaje del commit y entender el razonamiento detrás del cambio.</div>
      </div>
    `
  },
  {
    title: 'Entorno de desarrollo y contribución al proyecto',
    body: `
      <p>Tener Ansible instalado en modo desarrollo te permite modificar el código fuente y probar los cambios inmediatamente sin reinstalar. Esto es invaluable para debugging profundo y para contribuir al proyecto.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">setup-dev-env.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># 1. Fork el repositorio en GitHub (botón Fork en github.com/ansible/ansible)

# 2. Clonar tu fork
git clone https://github.com/TU_USUARIO/ansible
cd ansible

# 3. Agregar el upstream original como remote
git remote add upstream https://github.com/ansible/ansible
git fetch upstream

# 4. Crear un virtualenv para desarrollo
python3 -m venv venv-ansible-dev
source venv-ansible-dev/bin/activate

# 5. Instalar Ansible en modo desarrollo (editable install)
#    Los cambios en lib/ansible/ se reflejan inmediatamente
pip install -e ".[dev]"

# 6. Verificar que estamos usando el Ansible del repo (no el global)
which ansible-playbook
# → debe apuntar al venv: venv-ansible-dev/bin/ansible-playbook

ansible --version
# → debe mostrar el path al código del repo

# 7. Crear una rama para tu cambio
git checkout -b fix/mi-corrección-de-variable

# 8. Hacer el cambio en lib/ansible/...
# (editar el archivo correspondiente)

# 9. Probar el cambio con un playbook
ansible-playbook -i localhost, tests/integration/targets/mi_area/...</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">correr-tests-dev.sh</span></div>
        <pre class="language-bash"><code class="language-bash">cd ansible
source venv-ansible-dev/bin/activate

# Correr los unit tests del área que modificaste
python -m pytest test/units/vars/test_variable_manager.py -v

# Correr los unit tests de un módulo específico
python -m pytest test/units/modules/test_command.py -v

# Correr sanity checks del área modificada
ansible-test sanity lib/ansible/vars/manager.py --python 3.11

# Correr todos los tests unitarios (más lento)
ansible-test units --python 3.11

# Ver el CONTRIBUTING.md para el proceso completo de PR
cat CONTRIBUTING.md | less</code></pre>
      </div>
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio</div>
        <div class="lab-content">
          <p>Instalá Ansible en modo desarrollo y añadí un mensaje de debug personalizado:</p>
          <ol>
            <li>Instalá en modo desarrollo con <code>pip install -e .</code></li>
            <li>Abrí <code>lib/ansible/executor/task_executor.py</code></li>
            <li>Buscá el método <code>run()</code> y añadí: <code>print(f"DEBUG: Ejecutando tarea {self._task.name}", file=__import__('sys').stderr)</code></li>
            <li>Ejecutá cualquier playbook y observá el output: verás tu mensaje por cada tarea</li>
            <li>Revertí el cambio cuando termines el experimento</li>
          </ol>
        </div>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Antes de abrir un PR:</strong> El proyecto Ansible requiere que firmes el CLA (Contributor License Agreement) en la primera contribución. El bot lo pide automáticamente en el PR. También asegurate de correr <code>ansible-test sanity</code> y los unit tests relevantes: los CI checks deben pasar para que el PR sea revisado.</div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'git blame',
    definition: 'Comando de Git que muestra qué commit y autor introdujo cada línea de un archivo. Invaluable para entender por qué un comportamiento específico fue implementado así — el commit message generalmente explica la razón.',
  },
  {
    term: 'Editable install (pip install -e .)',
    definition: 'Modo de instalación de Python donde el paquete no se copia a site-packages sino que apunta directamente al directorio del repositorio. Los cambios en el código fuente se reflejan inmediatamente sin necesidad de reinstalar.',
  },
  {
    term: 'Templar',
    definition: 'Clase en lib/ansible/template/__init__.py que maneja toda la evaluación de templates Jinja2 en Ansible. Resuelve {{ variables }}, aplica filtros, ejecuta funciones Jinja2 y maneja errores de variables undefined.',
  },
  {
    term: 'CLA (Contributor License Agreement)',
    definition: 'Acuerdo legal que los contribuyentes del proyecto Ansible deben firmar antes de que su código pueda ser aceptado. Lo gestiona un bot automáticamente al abrir el primer PR.',
  },
],
quiz: [
  {
    question: '¿En qué archivo de lib/ansible/ buscarías el código que resuelve el comportamiento de block/rescue/always?',
    options: [
      'lib/ansible/executor/task_executor.py',
      'lib/ansible/playbook/block.py',
      'lib/ansible/plugins/strategy/linear.py',
      'lib/ansible/vars/manager.py',
    ],
    correctIndex: 1,
    explanation: 'lib/ansible/playbook/block.py contiene la clase Block que modela el bloque block/rescue/always del YAML. La lógica de cuándo ejecutar rescue (cuando hay error) y always (siempre) está implementada ahí, junto con la lógica de captura de errores.',
  },
  {
    question: '¿Qué ventaja tiene instalar Ansible con "pip install -e ." para desarrollo?',
    options: [
      'Instala la versión más reciente de Galaxy automáticamente',
      'Los cambios en el código fuente se reflejan inmediatamente sin reinstalar',
      'Instala en modo aislado sin afectar el sistema',
      'Permite usar ansible-test sanity sin dependencias adicionales',
    ],
    correctIndex: 1,
    explanation: 'El flag -e (editable) hace que pip no copie el código a site-packages, sino que crea un enlace al directorio del repositorio. Cualquier cambio que hagas en lib/ansible/ es inmediatamente visible cuando ejecutás ansible-playbook, sin necesidad de reinstalar el paquete.',
  },
  {
    question: '¿Cuál es el primer paso para contribuir al repositorio ansible/ansible en GitHub?',
    options: [
      'Clonar directamente el repositorio ansible/ansible y hacer push',
      'Crear un fork del repositorio en tu cuenta de GitHub y clonar ese fork',
      'Pedir acceso de escritura al equipo de Ansible',
      'Registrarte en Red Hat Developer antes de poder contribuir',
    ],
    correctIndex: 1,
    explanation: 'El proceso estándar de contribución open source es: (1) Fork del repositorio en tu cuenta de GitHub, (2) Clonar tu fork, (3) Añadir upstream como remote para mantenerte actualizado, (4) Crear una rama, (5) Hacer cambios, (6) Abrir un PR desde tu fork hacia ansible/ansible.',
  },
],
troubleshooting: [
  {
    error: 'Instalé Ansible con pip install -e . pero ansible-playbook sigue usando la versión global',
    cause: 'El virtualenv no está activado, o el PATH apunta al Ansible global antes que al del venv.',
    fix: 'Verificá con which ansible-playbook. Si no apunta al venv, activalo: source venv-ansible-dev/bin/activate. Comprobá con ansible --version que muestra el path correcto al repo.',
  },
  {
    error: 'Los unit tests fallan con "ModuleNotFoundError: No module named ansible"',
    cause: 'Pytest se ejecuta fuera del virtualenv de desarrollo o sin el entorno correcto.',
    fix: 'Ejecutá pytest desde el mismo entorno Python donde instalaste Ansible en modo dev: source venv-ansible-dev/bin/activate && python -m pytest test/units/... También asegurate de estar en el directorio raíz del repositorio.',
  },
  {
    error: 'No encuentro el código fuente de un módulo de una collection (ej: community.general.ufw)',
    cause: 'Los módulos de collections no están en lib/ansible/modules/ sino en el directorio de la collection instalada.',
    fix: 'Las collections están en ~/.ansible/collections/ansible_collections/community/general/plugins/modules/ufw.py. O encontrá el repositorio de la collection: github.com/ansible-collections/community.general.',
  },
],
  };
