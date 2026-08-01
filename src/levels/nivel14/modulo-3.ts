import type { ModuleContent } from '../types';

export const nivel14Mod3: ModuleContent =   {
levelId: 14,
moduleId: 3,
title: 'Crear una collection propia',
objective: 'Diseñar, construir y distribuir una collection propia para encapsular módulos, plugins y roles internos de la organización.',
duration: '3 horas',
objectives: [
  'Inicializar la estructura de una collection con ansible-galaxy collection init',
  'Entender el propósito de cada directorio: plugins/, roles/, playbooks/, galaxy.yml',
  'Construir y distribuir una collection como tarball o publicarla en Galaxy',
  'Agregar roles y módulos Python personalizados a una collection',
],
prerequisites: [
  'Completados los Módulos 1 y 2 de Nivel 14',
  'Conocimiento básico de Python (para módulos personalizados)',
  'Manejo de roles de Ansible (Nivel 9)',
],
steps: [
  {
    title: 'Inicializar la estructura de la collection',
    body: `
      <p>El comando <code>ansible-galaxy collection init</code> genera el scaffold completo de una collection con todos los directorios y archivos necesarios.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">crear-collection.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Crear el scaffold de la collection
# Formato: ansible-galaxy collection init namespace.nombre
ansible-galaxy collection init mi_empresa.infraestructura

# Estructura creada:
# mi_empresa/infraestructura/
# ├── galaxy.yml              # OBLIGATORIO: metadatos, versión, dependencias
# ├── README.md               # Documentación de la collection
# ├── CHANGELOG.rst           # Historial de cambios
# ├── .galaxy_install_info    # Metadatos de instalación (generado automáticamente)
# ├── plugins/
# │   ├── modules/            # Módulos Python (.py)
# │   ├── lookup/             # Lookup plugins
# │   ├── filter/             # Filtros Jinja2 personalizados
# │   ├── callback/           # Callback plugins (output personalizado)
# │   └── action/             # Action plugins
# ├── roles/                  # Roles de Ansible incluidos en la collection
# ├── playbooks/              # Playbooks distribuibles con la collection
# └── tests/
#     ├── integration/        # Tests de integración
#     └── unit/               # Tests unitarios de módulos

# Agregar un rol a la collection
cd mi_empresa/infraestructura
ansible-galaxy role init roles/servidor_base
ansible-galaxy role init roles/base_seguridad</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Estructura de namespace:</strong> El comando crea los directorios <code>mi_empresa/infraestructura/</code>. Para trabajar con la collection, siempre trabajá desde el directorio raíz del namespace (<code>mi_empresa/</code>) — así Ansible puede encontrar la collection correctamente durante el desarrollo.</div>
      </div>
    `
  },
  {
    title: 'galaxy.yml — el manifiesto de la collection',
    body: `
      <p>El archivo <code>galaxy.yml</code> es el corazón de la collection: define su identidad, versión, dependencias y metadatos para publicación en Galaxy o Automation Hub.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">mi_empresa/infraestructura/galaxy.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
namespace: mi_empresa
name: infraestructura
version: 1.3.0           # Semver: MAJOR.MINOR.PATCH

readme: README.md
description: >
  Collection interna con módulos y roles de infraestructura para
  la gestión de servidores Linux y servicios de la empresa.

authors:
  - "Equipo de Infraestructura <infra@mi-empresa.com>"
  - "Juan García <jgarcia@mi-empresa.com>"

license:
  - GPL-2.0-or-later      # Para collections open source
# license: proprietary    # Para collections internas

tags:
  - infraestructura
  - linux
  - monitoring
  - networking

# Versiones de Ansible compatibles
requires_ansible: ">=2.14.0"

# Dependencias de otras collections
dependencies:
  "community.general": ">=7.0.0"
  "ansible.posix": ">=1.5.0"

# Archivos a excluir del tarball (glob patterns)
build_ignore:
  - "*.pyc"
  - "__pycache__"
  - "tests/"
  - ".github/"
  - "*.retry"</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>version en galaxy.yml es obligatoria:</strong> Antes de hacer el build, asegurate de actualizar la versión en galaxy.yml. Si publicás en Galaxy, no podés reutilizar una versión ya publicada — cada publicación debe tener una versión única.</div>
      </div>
    `
  },
  {
    title: 'Agregar módulos Python personalizados',
    body: `
      <p>Los módulos Python son la forma más poderosa de extender Ansible. Van en <code>plugins/modules/</code> y siguen la API de módulos de Ansible para integrarse correctamente con la gestión de errores, idempotencia y modo check.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">plugins/modules/deploy_app.py</span></div>
        <pre class="language-python"><code class="language-python">#!/usr/bin/python
# -*- coding: utf-8 -*-

DOCUMENTATION = r"""
---
module: deploy_app
short_description: Despliega una aplicación interna
description:
  - Gestiona el ciclo de vida del deployment de aplicaciones internas.
  - Soporta check mode para simulación.
options:
  name:
description: Nombre de la aplicación
required: true
type: str
  version:
description: Versión a desplegar
required: true
type: str
  state:
description: Estado deseado
choices: [present, absent]
default: present
type: str
"""

EXAMPLES = r"""
- name: Desplegar mi-app v2.0
  mi_empresa.infraestructura.deploy_app:
name: mi-app
version: "2.0.1"
state: present
"""

from ansible.module_utils.basic import AnsibleModule

def run_module():
module_args = dict(
    name=dict(type="str", required=True),
    version=dict(type="str", required=True),
    state=dict(type="str", default="present",
               choices=["present", "absent"]),
)
result = dict(changed=False, message="")
module = AnsibleModule(argument_spec=module_args,
                       supports_check_mode=True)

if module.check_mode:
    result["message"] = "Check mode: no se aplicaron cambios"
    module.exit_json(**result)

# Lógica del módulo aquí
result["changed"] = True
result["message"] = f"App {module.params['name']} desplegada"
module.exit_json(**result)

if __name__ == "__main__":
run_module()</code></pre>
      </div>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>supports_check_mode:</strong> Declarar <code>supports_check_mode=True</code> en tu módulo indica a Ansible que puede ejecutarse con <code>--check</code> sin hacer cambios reales. El módulo debe verificar <code>module.check_mode</code> y retornar sin modificar el sistema cuando es <code>True</code>.</div>
      </div>
    `
  },
  {
    title: 'Build, testing y distribución',
    body: `
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">build-publish.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># === BUILD ===
# Desde el directorio raíz del namespace
cd mi_empresa/infraestructura
ansible-galaxy collection build
# Genera: mi_empresa-infraestructura-1.3.0.tar.gz

# Con directorio de output específico
ansible-galaxy collection build --output-path /tmp/collections/

# === TESTING LOCAL ===
# Instalar el tarball localmente para probar
ansible-galaxy collection install mi_empresa-infraestructura-1.3.0.tar.gz --force

# Verificar que el módulo está disponible
ansible-doc mi_empresa.infraestructura.deploy_app

# Test básico
ansible -m mi_empresa.infraestructura.deploy_app \
  -a "name=test version=1.0" localhost

# === PUBLICACIÓN ===
# Publicar en Ansible Galaxy (requiere token de API)
ansible-galaxy collection publish mi_empresa-infraestructura-1.3.0.tar.gz \
  --api-key $GALAXY_API_KEY

# Publicar en Automation Hub privado
ansible-galaxy collection publish mi_empresa-infraestructura-1.3.0.tar.gz \
  --server https://automation.mi-empresa.com/api/galaxy/ \
  --api-key $AUTOMATION_HUB_TOKEN

# === USAR EN PLAYBOOKS ===
# Con FQCN (siempre preferido)
# mi_empresa.infraestructura.deploy_app:</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">usar-collection-propia.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Deployment usando collection interna
  hosts: app_servers
  tasks:
- name: Desplegar aplicación
  mi_empresa.infraestructura.deploy_app:
    name: mi-app
    version: "2.0.1"
    state: present

- name: Configurar servidor con rol de la collection
  ansible.builtin.include_role:
    name: mi_empresa.infraestructura.servidor_base</code></pre>
      </div>
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio</div>
        <div class="lab-content">
          <p><strong>Objetivo:</strong> Crear una micro-collection con un módulo personalizado y distribuirla como tarball.</p>
          <ol>
            <li>Ejecutá <code>ansible-galaxy collection init lab.prueba</code></li>
            <li>Editá <code>galaxy.yml</code> con datos reales (tu nombre, descripción)</li>
            <li>Creá un módulo simple en <code>plugins/modules/saludo.py</code> que retorne un mensaje de saludo</li>
            <li>Ejecutá <code>ansible-galaxy collection build</code> — verificá que genera el tarball</li>
            <li>Instalá el tarball y probá el módulo con <code>ansible -m lab.prueba.saludo -a "nombre=mundo" localhost</code></li>
          </ol>
        </div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'galaxy.yml',
    definition: 'Archivo de metadatos obligatorio en una collection. Define el namespace, nombre, versión, descripción, autores, licencia, dependencias de otras collections y versión mínima de Ansible requerida. Es el equivalente del package.json de Node.js para una collection de Ansible.',
  },
  {
    term: 'ansible-galaxy collection build',
    definition: 'Comando que empaqueta una collection en un archivo tarball (.tar.gz) listo para distribución o publicación. Respeta los patrones de exclusión definidos en build_ignore dentro de galaxy.yml.',
  },
  {
    term: 'AnsibleModule',
    definition: 'Clase Python del módulo ansible.module_utils.basic que provee la infraestructura base para escribir módulos: parsing de argumentos, manejo de errores estandarizado, soporte para check mode, y el protocolo de retorno de resultados (exit_json/fail_json).',
  },
  {
    term: 'supports_check_mode',
    definition: 'Parámetro de AnsibleModule que indica que el módulo es compatible con el flag --check de Ansible (dry-run). Cuando es True, el módulo debe verificar module.check_mode y retornar sin hacer cambios reales al sistema.',
  },
],
quiz: [
  {
    question: '¿Qué comando genera el scaffold inicial de una collection?',
    options: [
      'ansible-galaxy collection new namespace.nombre',
      'ansible-galaxy collection create namespace.nombre',
      'ansible-galaxy collection init namespace.nombre',
      'ansible-galaxy init collection namespace.nombre',
    ],
    correctIndex: 2,
    explanation: 'ansible-galaxy collection init namespace.nombre genera la estructura completa de directorios y archivos de una collection: galaxy.yml, plugins/ con subdirectorios para modules/filter/lookup/callback, roles/, playbooks/ y tests/. El formato del nombre debe seguir la convención namespace.nombre (ej: mi_empresa.infraestructura).',
  },
  {
    question: '¿Cuál es el propósito del archivo galaxy.yml en una collection?',
    options: [
      'Listar las collections a instalar como dependencias del proyecto',
      'Configurar las opciones de conexión SSH de Ansible',
      'Definir los metadatos de la collection: versión, autor, descripción y dependencias',
      'Declarar las variables por defecto de los roles incluidos',
    ],
    correctIndex: 2,
    explanation: 'galaxy.yml es el manifiesto de la collection: define su identidad (namespace, nombre), versión semver, autores, descripción, licencia, dependencias de otras collections, versión mínima de Ansible requerida y patrones de archivos a excluir del build. Es obligatorio y sin él ansible-galaxy collection build fallará.',
  },
  {
    question: '¿Qué debe hacer un módulo Python cuando detecta que se está ejecutando en check mode (module.check_mode == True)?',
    options: [
      'Lanzar una excepción para indicar que no soporta check mode',
      'Ejecutarse normalmente, el check mode es transparente para el módulo',
      'Retornar sin hacer cambios reales en el sistema, reportando qué habría cambiado',
      'Ignorar el check mode y hacer los cambios de todos modos',
    ],
    correctIndex: 2,
    explanation: 'Un módulo que soporta check mode (supports_check_mode=True) debe verificar module.check_mode al inicio. Si es True, debe calcular qué cambiaría y retornar ese resultado con changed=True/False pero SIN aplicar ningún cambio real al sistema. Esto permite que --check funcione correctamente con ese módulo. Si el módulo no verifica check_mode, hará cambios reales incluso en modo --check.',
  },
],
troubleshooting: [
  {
    error: "ERROR! galaxy.yml or MANIFEST.json not found in the collection",
    cause: 'Se está ejecutando ansible-galaxy collection build desde el directorio incorrecto. El comando debe ejecutarse desde dentro del directorio de la collection (donde está galaxy.yml).',
    fix: 'Navegá al directorio correcto: cd mi_empresa/infraestructura && ansible-galaxy collection build. Verificá que galaxy.yml existe en el directorio actual.',
  },
  {
    error: "ansible-doc devuelve 'No module named mi_empresa.infraestructura.mi_modulo'",
    cause: 'La collection no está instalada en el path de búsqueda de Ansible, o el módulo no está en plugins/modules/.',
    fix: 'Instalá el tarball: ansible-galaxy collection install mi_empresa-infraestructura-1.0.0.tar.gz. Verificá que el módulo .py está en plugins/modules/ (no en modules/ en la raíz). Confirmá la instalación con ansible-galaxy collection list.',
  },
  {
    error: "ERROR! The galaxy_namespace 'mi empresa' does not match the required regex",
    cause: 'El namespace o nombre de la collection contiene caracteres no válidos (espacios, guiones, caracteres especiales). Solo se permiten letras minúsculas, números y guiones bajos.',
    fix: 'Usá solo letras minúsculas, números y guiones bajos en el namespace y nombre: mi_empresa.infraestructura (correcto) vs mi-empresa.infra-estructura (incorrecto). Editá galaxy.yml y renombrá los directorios correspondientes.',
  },
],
  };
