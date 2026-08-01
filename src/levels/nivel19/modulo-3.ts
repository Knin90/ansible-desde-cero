import type { ModuleContent } from '../types';

export const nivel19Mod3: ModuleContent =   {
levelId: 19,
moduleId: 3,
title: 'Collections propias',
duration: '2 horas',
objective: 'Empaquetar módulos, plugins y roles en una collection propia con galaxy.yml y publicarla.',
objectives: [
  'Comprender la estructura de directorios de una collection',
  'Crear galaxy.yml con metadatos correctos',
  'Empaquetar la collection con ansible-galaxy collection build',
  'Publicar en Ansible Galaxy con ansible-galaxy collection publish',
  'Distribuir una collection privada sin Galaxy',
],
prerequisites: [
  'Módulos 19.1 y 19.2: módulos y plugins propios',
  'Conocer el sistema de collections (Nivel 14)',
],
steps: [
  {
    title: 'Estructura de una collection y galaxy.yml',
    body: `
      <p>Una collection es un paquete que agrupa módulos, plugins, roles y playbooks bajo un namespace. El formato del nombre es siempre <code>namespace.nombre</code> — dos palabras en minúsculas separadas por punto.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">crear-collection.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Crear la estructura base de la collection
ansible-galaxy collection init mi_empresa.infraestructura

# Estructura generada:
# mi_empresa/infraestructura/
#   README.md
#   galaxy.yml              ← metadatos de la collection
#   MANIFEST.json           ← generado al hacer build
#   FILES.json              ← generado al hacer build
#   plugins/
#     modules/              ← módulos Python
#     filter/               ← filter plugins
#     lookup/               ← lookup plugins
#     callback/             ← callback plugins
#     inventory/            ← inventory plugins
#     module_utils/         ← código compartido entre módulos
#   roles/                  ← roles incluidos en la collection
#   playbooks/              ← playbooks de ejemplo
#   tests/
#     integration/          ← tests de integración (ansible-test)
#     unit/                 ← tests unitarios (pytest)
#   docs/                   ← documentación adicional</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">mi_empresa/infraestructura/galaxy.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# Namespace y nombre — deben coincidir con la estructura de directorios
namespace: mi_empresa
name: infraestructura

# Versión semántica: MAJOR.MINOR.PATCH
version: 1.2.0

# Descripción corta (visible en Galaxy)
readme: README.md
description: >
  Collection interna de automatización de infraestructura para mi_empresa.
  Incluye módulos para gestionar la plataforma, plugins de filtros de empresa
  y roles para configurar el stack de aplicaciones.

# Licencia (SPDX identifier)
license:
  - MIT

# Tags para búsqueda en Galaxy
tags:
  - linux
  - nginx
  - postgresql
  - devops
  - infrastructure

# Dependencias de otras collections (semver)
dependencies:
  community.general: ">=7.0.0,<9.0.0"
  ansible.posix: ">=1.5.0"

# Autor principal
authors:
  - Tu Equipo de Infraestructura <infra@mi-empresa.com>

# URLs del proyecto
homepage: https://github.com/mi-empresa/ansible-infraestructura
issues: https://github.com/mi-empresa/ansible-infraestructura/issues
repository: https://github.com/mi-empresa/ansible-infraestructura

# Archivos a excluir del paquete (soporta glob)
build_ignore:
  - '*.pyc'
  - '.git'
  - '.github'
  - 'tests/output'
  - 'molecule'
  - '*.log'</code></pre>
      </div>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>MANIFEST.json y FILES.json:</strong> Se generan automáticamente al hacer <code>ansible-galaxy collection build</code>. MANIFEST.json describe los metadatos del paquete. FILES.json contiene el hash SHA256 de cada archivo incluido. No los edites manualmente; son el "sello de integridad" de la collection.</div>
      </div>
    `
  },
  {
    title: 'Agregar módulos y plugins a la collection',
    body: `
      <p>Una vez creada la estructura, podés mover los módulos y plugins que desarrollaste en los módulos anteriores a los directorios correctos dentro de la collection.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">poblar-collection.sh</span></div>
        <pre class="language-bash"><code class="language-bash">cd mi_empresa/infraestructura

# Copiar módulos Python al directorio de módulos de la collection
cp ../../library/mi_modulo.py plugins/modules/
cp ../../library/modulo_web.py plugins/modules/

# Copiar módulos utils compartidos
cp ../../module_utils/empresa_api.py plugins/module_utils/

# Copiar filter plugins
cp ../../filter_plugins/empresa_filters.py plugins/filter/

# Copiar lookup plugins
cp ../../lookup_plugins/config_service.py plugins/lookup/

# Copiar callback plugins
cp ../../callback_plugins/slack_notifier.py plugins/callback/

# Los roles tienen su propia estructura — se copian enteros
cp -r ../../roles/servidor_web roles/
cp -r ../../roles/base_de_datos roles/</code></pre>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Convención de FQCN dentro de la collection:</strong><br>
          Al usar recursos de tu propia collection en un playbook, la referencia correcta es:<br>
          • Módulo: <code>mi_empresa.infraestructura.mi_modulo</code><br>
          • Filtro: <code>{{ variable | mi_empresa.infraestructura.to_nginx_upstream }}</code><br>
          • Lookup: <code>{{ lookup('mi_empresa.infraestructura.config_service', 'clave') }}</code><br>
          • Role: <code>mi_empresa.infraestructura.servidor_web</code>
        </div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbooks/ejemplo.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Usar recursos de la collection propia
  hosts: webservers
  collections:
- mi_empresa.infraestructura   # Permite nombres cortos en este play

  tasks:
- name: Usar módulo propio con FQCN completo
  mi_empresa.infraestructura.mi_modulo:
    name: "{{ inventory_hostname }}"
    state: present

- name: Usar role de la collection
  ansible.builtin.include_role:
    name: mi_empresa.infraestructura.servidor_web

- name: Usar filter plugin de la collection
  ansible.builtin.debug:
    msg: "{{ backend_ips | to_nginx_upstream(8080) }}"</code></pre>
      </div>
    `
  },
  {
    title: 'Build, test local y publicación en Galaxy',
    body: `
      <p>El proceso de publicación tiene tres pasos: build (genera el tarball), instalación local para verificar, y publish a Ansible Galaxy o a un repositorio privado.</p>
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio</div>
        <div class="lab-content">
          <p>Completá el flujo completo de empaquetado y verificación:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">build-y-test.sh</span></div>
            <pre class="language-bash"><code class="language-bash">cd mi_empresa/infraestructura

# 1. Validar galaxy.yml antes de hacer build
ansible-galaxy collection verify . --offline

# 2. Hacer build — genera mi_empresa-infraestructura-1.2.0.tar.gz
ansible-galaxy collection build --output-path ../../dist/

# 3. Inspeccionar el contenido del paquete antes de publicar
tar -tzf ../../dist/mi_empresa-infraestructura-1.2.0.tar.gz | head -30

# 4. Instalar localmente para probar que la collection funciona
ansible-galaxy collection install ../../dist/mi_empresa-infraestructura-1.2.0.tar.gz \\
--force   # Sobreescribir si ya está instalada

# 5. Verificar que se instaló correctamente
ansible-galaxy collection list | grep mi_empresa

# 6. Probar que los módulos son accesibles
ansible-doc mi_empresa.infraestructura.mi_modulo

# 7. Publicar en Ansible Galaxy (requiere API key de galaxy.ansible.com)
ansible-galaxy collection publish ../../dist/mi_empresa-infraestructura-1.2.0.tar.gz \\
--api-key "$GALAXY_API_KEY"</code></pre>
          </div>
        </div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">distribucion-privada.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Opción A: Instalar desde tarball en el repositorio (Git LFS o releases)
# requirements.yml del proyecto que usa la collection:

# Opción B: Servidor Galaxy privado (Pulp, Nexus, AWX Private Automation Hub)
# requirements.yml con servidor personalizado:

# requirements.yml ejemplo
cat requirements.yml</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">requirements.yml (distribución privada)</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
collections:
  # Desde Ansible Galaxy (público)
  - name: community.general
version: ">=7.0.0"

  # Desde un repositorio Galaxy privado (Automation Hub, Pulp)
  - name: mi_empresa.infraestructura
version: "1.2.0"
source: https://galaxy-privado.mi-empresa.com/api/

  # Desde un tarball en un servidor HTTP interno
  - name: mi_empresa.herramientas
source: https://artifacts.mi-empresa.com/ansible/mi_empresa-herramientas-2.0.0.tar.gz

  # Desde un repositorio Git directamente
  - name: mi_empresa.experimental
source: https://github.com/mi-empresa/ansible-experimental.git
version: main
type: git</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Versionado semántico obligatorio:</strong> Galaxy rechaza versiones que no siguen MAJOR.MINOR.PATCH estrictamente. Establecé un proceso de tagging: cada PR que agrega funcionalidad bumps MINOR, cada bugfix bumps PATCH, cambios que rompen compatibilidad bumps MAJOR.</div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'galaxy.yml',
    definition: 'Archivo de metadatos en la raíz de una collection que declara namespace, nombre, versión, descripción, dependencias, autores y tags. Es el equivalente del package.json de npm o el Cargo.toml de Rust para las collections de Ansible.',
  },
  {
    term: 'MANIFEST.json',
    definition: 'Archivo generado automáticamente por ansible-galaxy collection build. Describe los metadatos de la collection y actúa como índice del paquete. No se edita manualmente.',
  },
  {
    term: 'FILES.json',
    definition: 'Archivo generado automáticamente al hacer build. Contiene el hash SHA256 de cada archivo incluido en la collection. Permite verificar la integridad del paquete con ansible-galaxy collection verify.',
  },
  {
    term: 'ansible-galaxy collection build',
    definition: 'Comando que empaqueta una collection en un tarball (.tar.gz) con el formato namespace-nombre-version.tar.gz. Aplica las reglas de build_ignore de galaxy.yml y genera MANIFEST.json y FILES.json.',
  },
  {
    term: 'Automation Hub',
    definition: 'Servidor privado de distribución de collections de Red Hat (disponible con suscripción AAP). Permite a las empresas distribuir collections internas de forma segura sin depender de Ansible Galaxy público.',
  },
],
quiz: [
  {
    question: '¿Cuál es el formato correcto del nombre de una collection?',
    options: [
      'mi-empresa-infraestructura (con guiones)',
      'MiEmpresa.Infraestructura (CamelCase)',
      'mi_empresa.infraestructura (dos palabras en minúsculas con punto)',
      'mi_empresa/infraestructura (con barra)',
    ],
    correctIndex: 2,
    explanation: 'El formato es siempre namespace.nombre con palabras en minúsculas y guiones bajos permitidos. El punto separa el namespace (quien lo publica) del nombre de la collection. Ni guiones, ni mayúsculas, ni barras son aceptados por Galaxy.',
  },
  {
    question: '¿Qué archivo de una collection declara las dependencias en otras collections?',
    options: [
      'requirements.yml dentro de la collection',
      'galaxy.yml — en la clave dependencies',
      'MANIFEST.json — en la clave requires',
      'collection.yml — en la clave needs',
    ],
    correctIndex: 1,
    explanation: 'Las dependencias se declaran en galaxy.yml bajo la clave dependencies, con el formato nombre_collection: "rango_semver". Cuando alguien instala tu collection, Galaxy descarga automáticamente las dependencias declaradas.',
  },
  {
    question: '¿Qué hace el campo build_ignore en galaxy.yml?',
    options: [
      'Ignora errores de validación durante el build',
      'Lista archivos y directorios que NO deben incluirse en el tarball generado',
      'Lista módulos que no deben ejecutarse durante los tests',
      'Indica qué versiones de Ansible deben ignorar esta collection',
    ],
    correctIndex: 1,
    explanation: 'build_ignore es una lista de patrones glob de archivos que ansible-galaxy collection build excluye del tarball. Se usa para omitir archivos de desarrollo: .git, molecule, archivos .pyc, logs, etc. que no son necesarios para usar la collection.',
  },
],
troubleshooting: [
  {
    error: 'ERROR! Collection "mi_empresa.infraestructura" found, but is not a tarball',
    cause: 'ansible-galaxy collection install apunta a un directorio en lugar de a un tarball .tar.gz, o el tarball está corrupto.',
    fix: 'Ejecutá ansible-galaxy collection build primero para generar el tarball. Luego instalá el .tar.gz generado: ansible-galaxy collection install dist/mi_empresa-infraestructura-1.0.0.tar.gz',
  },
  {
    error: 'galaxy.yml: key "version" is required but missing o versión inválida',
    cause: 'galaxy.yml tiene la versión en formato incorrecto (ej: "1.0" en lugar de "1.0.0") o le falta el campo version.',
    fix: 'La versión debe seguir semver estricto: MAJOR.MINOR.PATCH (tres números). Verificá con: python3 -c "import yaml; d=yaml.safe_load(open(\'galaxy.yml\')); print(d.get(\'version\'))"',
  },
  {
    error: 'Módulo de la collection no encontrado al usar FQCN',
    cause: 'La collection no está instalada o el archivo del módulo no está en plugins/modules/ dentro de la collection.',
    fix: 'Verificá con ansible-galaxy collection list que la collection aparece. Comprobá que el módulo esté en ~/.ansible/collections/ansible_collections/mi_empresa/infraestructura/plugins/modules/.',
  },
],
  };
