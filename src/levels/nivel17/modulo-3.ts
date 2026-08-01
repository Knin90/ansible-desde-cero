import type { ModuleContent } from '../types';

export const nivel17Mod3: ModuleContent =   {
levelId: 17,
moduleId: 3,
title: 'Ansible Lint y yamllint',
objective: 'Integrar ansible-lint y yamllint como herramientas de calidad de código para detectar errores, malas prácticas y problemas de estilo antes de ejecutar cualquier playbook.',
duration: '1 hora',
objectives: [
  'Entender qué problemas detecta ansible-lint (FQCN, idempotencia, seguridad, estilo)',
  'Configurar .ansible-lint para personalizar reglas según el proyecto',
  'Configurar yamllint para estilo de YAML consistente en el equipo',
  'Integrar ambas herramientas en un pre-commit hook para enforcement automático',
],
prerequisites: [
  'Completados los Niveles 0–16 y módulos 1–2 del Nivel 17',
  'Python 3.8+ con pip disponible',
  'Repositorio Git con playbooks y roles',
],
steps: [
  {
    title: 'Qué verifica ansible-lint',
    body: `
      <p>ansible-lint analiza estáticamente tus playbooks y roles buscando problemas en cuatro categorías principales:</p>
      <ul>
        <li><strong>FQCN (Fully Qualified Collection Names):</strong> usar <code>ansible.builtin.copy</code> en lugar de solo <code>copy</code>. Evita ambigüedades cuando múltiples colecciones tienen módulos con el mismo nombre.</li>
        <li><strong>Idempotencia:</strong> detecta patrones que pueden no ser idempotentes, como usar <code>command</code> cuando existe un módulo específico.</li>
        <li><strong>Seguridad:</strong> contraseñas en texto plano, <code>no_log: false</code> en tareas sensibles, permisos demasiado permisivos.</li>
        <li><strong>Estilo:</strong> nombres de tareas en formato imperativo, indentación, uso de <code>true</code>/<code>false</code> vs <code>yes</code>/<code>no</code>.</li>
      </ul>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">usar-ansible-lint.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Instalar ansible-lint
pip install ansible-lint

# Lintear el directorio actual
ansible-lint

# Lintear un playbook específico
ansible-lint site.yml

# Ver todas las reglas disponibles
ansible-lint --list-rules

# Ver solo errores críticos (sin warnings)
ansible-lint --severity error</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">text</span><span class="code-block-filename">output-ansible-lint.txt</span></div>
        <pre class="language-text"><code class="language-text">WARNING  roles/nginx/tasks/main.yml:5 Task/Handler names should not
     start with a uppercase letter. (name[casing])

ERROR    roles/nginx/tasks/main.yml:12 Use FQCN for builtin module
     actions: copy → ansible.builtin.copy (fqcn[action-core])

ERROR    roles/nginx/tasks/main.yml:20 Commands should not change
     things if nothing needs doing. (command-instead-of-module)</code></pre>
      </div>
    `,
  },
  {
    title: 'Configuración .ansible-lint',
    body: `
      <p>El archivo <code>.ansible-lint</code> en la raíz del proyecto personaliza el comportamiento: qué reglas ignorar, qué paths excluir y el perfil de severidad.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.ansible-lint</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# Perfil: basic, moderate, safety, shared, production
profile: production

# Excluir paths del análisis
exclude_paths:
  - .git/
  - .cache/
  - molecule/
  - vendor/

# Ignorar reglas específicas (documentar por qué)
warn_list:
  - experimental     # reglas en desarrollo
  - role-name        # nombres de roles con guión bajo

skip_list:
  - yaml[line-length]  # lineas largas en templates Jinja2 son inevitables

# Paths adicionales a analizar
extra_vars_files:
  - vars/vault.yml

# Configuración de variables
var_naming_pattern: ^[a-z_][a-z0-9_]*$</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content">El perfil <code>production</code> activa las reglas más estrictas, incluyendo chequeos de seguridad. Para proyectos nuevos, empezá con <code>basic</code> y subí gradualmente a <code>production</code> a medida que limpiás el código.</div>
      </div>
    `,
  },
  {
    title: 'yamllint — estilo de YAML consistente',
    body: `
      <p>yamllint verifica la sintaxis y el estilo de todos los archivos YAML del proyecto, independientemente de Ansible. Detecta indentación inconsistente, trailing spaces, líneas demasiado largas y comillas innecesarias.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalar-yamllint.sh</span></div>
        <pre class="language-bash"><code class="language-bash">pip install yamllint

# Lintear todos los YAML del proyecto
yamllint .

# Lintear un archivo específico
yamllint playbooks/site.yml</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.yamllint</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
extends: default

rules:
  line-length:
max: 120           # permitir líneas hasta 120 chars (templates)
level: warning     # warning, no error

  document-start:
present: true      # exigir '---' al inicio de cada archivo

  truthy:
allowed-values:
  - 'true'
  - 'false'        # no permitir yes/no/on/off

  indentation:
spaces: 2
indent-sequences: true
check-multi-line-strings: false

  comments:
min-spaces-from-content: 2  # '# comentario' no '#comentario'

ignore: |
  .git/
  molecule/
  vendor/</code></pre>
      </div>
    `,
  },
  {
    title: 'Pre-commit hook: enforcement automático',
    body: `
      <p>Un pre-commit hook garantiza que ningún commit pase sin pasar por ansible-lint y yamllint. El framework <code>pre-commit</code> hace esto trivial.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">setup-pre-commit.sh</span></div>
        <pre class="language-bash"><code class="language-bash">pip install pre-commit

# Inicializar en el repo (instala el hook en .git/hooks/pre-commit)
pre-commit install

# Correr manualmente sobre todos los archivos
pre-commit run --all-files</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.pre-commit-config.yaml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
repos:
  - repo: https://github.com/adrienverge/yamllint
rev: v1.35.1
hooks:
  - id: yamllint
    args: ['-c', '.yamllint']

  - repo: https://github.com/ansible/ansible-lint
rev: v24.2.0
hooks:
  - id: ansible-lint
    files: \\.(yml|yaml)$
    always_run: false

  - repo: https://github.com/pre-commit/pre-commit-hooks
rev: v4.6.0
hooks:
  - id: trailing-whitespace
  - id: end-of-file-fixer
  - id: check-yaml
  - id: check-merge-conflict</code></pre>
      </div>
      <div class="highlight-box">
        <p>Ahora cada <code>git commit</code> ejecuta automáticamente yamllint y ansible-lint. Si alguno falla, el commit es rechazado hasta que se corrija el problema.</p>
      </div>
    `,
  },
],
quiz: [
  {
    question: '¿Qué verifica la regla fqcn[action-core] de ansible-lint?',
    options: [
      'Que los nombres de los roles sean descriptivos',
      'Que los módulos builtin usen su nombre completo (ej: ansible.builtin.copy en lugar de copy)',
      'Que las variables sigan la convención de nombres snake_case',
      'Que cada tarea tenga una etiqueta (tag) definida',
    ],
    correctIndex: 1,
    explanation: 'fqcn[action-core] exige el uso de Fully Qualified Collection Names para módulos builtin. Esto evita ambigüedades: si tenés una colección custom con un módulo "copy", Ansible podría ejecutar el incorrecto sin FQCN.',
  },
  {
    question: '¿Para qué sirve skip_list en .ansible-lint?',
    options: [
      'Para excluir hosts del inventario del análisis',
      'Para ignorar reglas específicas que no aplican al proyecto',
      'Para saltear la ejecución de molecule durante el lint',
      'Para ignorar archivos YAML con errores de sintaxis',
    ],
    correctIndex: 1,
    explanation: 'skip_list permite deshabilitar reglas específicas que no aplican o son incompatibles con el proyecto. Se documenta en el mismo archivo .ansible-lint el motivo para ignorar cada regla.',
  },
  {
    question: '¿Qué ocurre al hacer git commit después de instalar el pre-commit hook?',
    options: [
      'El commit se hace directamente, el hook corre en background',
      'El hook corre yamllint y ansible-lint; si alguno falla, el commit es rechazado',
      'Se abre un editor para revisar los cambios antes de commitear',
      'El hook sube automáticamente el código a un runner de CI',
    ],
    correctIndex: 1,
    explanation: 'Un pre-commit hook es bloqueante: si cualquier check falla (yamllint, ansible-lint, etc.), git rechaza el commit. El desarrollador debe corregir los errores y hacer git add + git commit nuevamente.',
  },
],
realWorldCase: 'Un equipo de 8 ingenieros integró ansible-lint y yamllint como pre-commit hooks. En las primeras 2 semanas, el hook bloqueó 34 commits con problemas reales: 12 por módulos sin FQCN, 8 por tareas sin nombre, 14 por YAML mal formateado. Todos fueron corregidos antes de llegar al repositorio.',
troubleshooting: [
  {
    error: 'ansible-lint: WARNING: Listing 1 violation(s) that are fatal',
    cause: 'El perfil configurado en .ansible-lint es más estricto que el código actual; alguna regla crítica está siendo violada',
    fix: 'Correr ansible-lint -v para ver el detalle completo. Si la regla es válida, corregirla. Si no aplica al proyecto, agregarla a skip_list con un comentario explicando por qué.',
  },
  {
    error: 'yamllint: error: could not determine encoding',
    cause: 'El archivo YAML tiene una codificación no-UTF8 (BOM, latin-1, etc.) o caracteres especiales no escapados',
    fix: 'Convertir el archivo a UTF-8 sin BOM: usar "file archivo.yml" para detectar la codificación actual, luego iconv para convertir.',
  },
  {
    error: 'pre-commit hook: command not found: ansible-lint',
    cause: 'pre-commit usa su propio entorno virtual aislado; ansible-lint debe estar declarado en .pre-commit-config.yaml, no solo instalado globalmente',
    fix: 'Usar el repo oficial de ansible-lint en .pre-commit-config.yaml en lugar de un hook local. pre-commit instala automáticamente las dependencias de cada repo declarado.',
  },
],
  };
