import type { ModuleContent } from '../types';

export const nivel14Mod1: ModuleContent =   {
levelId: 14,
moduleId: 1,
title: 'Qué son las collections',
objective: 'Entender el modelo de distribución de Collections: namespaces, FQCN, y cómo se instalan y usan en playbooks modernos.',
duration: '2 horas',
objectives: [
  'Comprender la diferencia entre el modelo antiguo de módulos y el modelo de collections',
  'Usar FQCN (Fully Qualified Collection Name) correctamente en playbooks',
  'Identificar las collections built-in más importantes de Ansible',
  'Entender la estructura de directorios de una collection en disco',
],
prerequisites: [
  'Completados los Niveles 0–13',
  'Ansible instalado y funcional con playbooks básicos',
  'Acceso a internet para descargar collections (o entorno offline configurado)',
],
steps: [
  {
    title: '¿Por qué existen las collections? El problema que resuelven',
    body: `
      <p>Antes de Ansible 2.9, todos los módulos vivían en el core de Ansible. Agregar o actualizar un módulo requería una nueva versión de Ansible completo. El resultado: ciclos de release lentos, módulos desactualizados y el equipo de Red Hat bloqueado revisando miles de contribuciones de la comunidad.</p>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Imaginá que para instalar una nueva app en tu teléfono, tuvieras que esperar la próxima versión del sistema operativo completo. Las collections son el equivalente a la App Store para Ansible: cada vendor publica y actualiza sus módulos independientemente, con su propio ciclo de versiones.</p>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Antes (modelo antiguo):</strong> todos los módulos en el core → actualización de Ansible = actualización de todos los módulos<br><br>
          <strong>Ahora (collections):</strong> cada collection tiene su ciclo de vida independiente → podés actualizar <code>community.general</code> sin tocar la versión de Ansible
        </div>
      </div>
      <p>Una collection es un paquete que puede incluir módulos, plugins de filtro, plugins de lookup, roles y playbooks, todo bajo un namespace uniforme con formato <code>namespace.nombre_collection</code>.</p>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>FQCN (Fully Qualified Collection Name):</strong> el nombre completo de un recurso de una collection, con formato <code>namespace.collection.recurso</code>. Ejemplo: <code>community.general.ufw</code> — namespace: community, collection: general, módulo: ufw.</div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">fqcn-ejemplos.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">tasks:
  # FQCN (Fully Qualified Collection Name) — forma recomendada
  - ansible.builtin.copy:         # namespace: ansible, collection: builtin
  src: files/app.conf
  dest: /etc/app.conf

  - community.general.ufw:        # namespace: community, collection: general
  rule: allow
  port: "80"

  - amazon.aws.ec2_instance:      # namespace: amazon, collection: aws
  name: mi-servidor
  state: present

  - kubernetes.core.k8s:          # namespace: kubernetes, collection: core
  state: present
  definition:
    apiVersion: v1
    kind: Namespace
    metadata:
      name: mi-app

  # Forma corta (ambigua — evitar en proyectos serios)
  - name: Sin FQCN — potencialmente peligroso
copy:
  src: files/app.conf
  dest: /etc/app.conf</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Siempre usá FQCN:</strong> El nombre completo hace el playbook auto-documentado y evita ambigüedades. Si tenés <code>community.general</code> y <code>mi_empresa.general</code> instaladas, y ambas tienen un módulo <code>deploy</code>, sin FQCN Ansible no sabe cuál usar.</div>
      </div>
    `
  },
  {
    title: 'Las collections más importantes: built-in y community',
    body: `
      <p>Ansible viene con un conjunto de collections pre-instaladas. Entender cuáles son y qué contienen es clave para saber qué podés usar sin instalar nada adicional.</p>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Collections incluidas en Ansible (no requieren instalación):</strong><br>
          • <code>ansible.builtin</code> — módulos core: copy, template, service, package, file, command, shell, uri, user, group, etc.<br>
          • <code>ansible.posix</code> — módulos POSIX: authorized_key, firewalld, mount, patch, sysctl, synchronize<br>
          • <code>ansible.utils</code> — filtros avanzados: ip_address, cidr_merge, validate
        </div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">collections-comunes.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml"># ansible.builtin — siempre disponible, sin instalar nada
- ansible.builtin.apt:
name: nginx
state: present
- ansible.builtin.template:
src: nginx.conf.j2
dest: /etc/nginx/nginx.conf
- ansible.builtin.service:
name: nginx
state: started
enabled: true

# ansible.posix — POSIX utilities (incluida en ansible-core)
- ansible.posix.authorized_key:
user: deploy
key: "{{ lookup('file', '~/.ssh/id_rsa.pub') }}"
- ansible.posix.firewalld:
port: 80/tcp
permanent: true
state: enabled

# community.general — la collection comunitaria más grande (1000+ módulos)
# Requiere: ansible-galaxy collection install community.general
- community.general.ufw:         # Uncomplicated Firewall (Ubuntu)
rule: allow
port: "443"
proto: tcp
- community.general.timezone:    # Configurar zona horaria
name: America/Argentina/Buenos_Aires
- community.general.ini_file:    # Modificar archivos .ini
path: /etc/myapp.conf
section: database
option: host
value: db.empresa.com

# community.docker — gestión de Docker
# Requiere: ansible-galaxy collection install community.docker
- community.docker.docker_container:
name: mi-app
image: mi-empresa/mi-app:latest
state: started
ports:
  - "8080:8080"

# community.postgresql — gestión de PostgreSQL
# Requiere: ansible-galaxy collection install community.postgresql
- community.postgresql.postgresql_db:
name: produccion
state: present</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>ansible.posix vs ansible.builtin:</strong> Algunos módulos como <code>authorized_key</code> y <code>synchronize</code> fueron movidos a <code>ansible.posix</code>. Si usás módulos por su nombre corto (sin FQCN) y aparecen como "deprecated", revisá si el módulo fue movido a otra collection.</div>
      </div>
    `
  },
  {
    title: 'Estructura de una collection en disco',
    body: `
      <p>Cuando instalás una collection, Ansible la guarda en una estructura de directorios específica. Entender esta estructura te ayuda a saber dónde buscar módulos, roles y documentación.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">estructura-collection.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Ver dónde están instaladas las collections
ansible-galaxy collection list

# La estructura en disco (ejemplo: community.general)
# ~/.ansible/collections/ansible_collections/
# └── community/
#     └── general/
#         ├── galaxy.yml          # Metadatos: versión, autor, dependencias
#         ├── README.md
#         ├── CHANGELOG.rst
#         ├── plugins/
#         │   ├── modules/        # Módulos Python (.py)
#         │   │   ├── ufw.py
#         │   │   ├── timezone.py
#         │   │   └── ini_file.py
#         │   ├── filter/         # Filtros Jinja2
#         │   ├── lookup/         # Lookup plugins
#         │   ├── callback/       # Callback plugins
#         │   └── inventory/      # Inventory plugins
#         ├── roles/              # Roles distribuidos con la collection
#         │   └── setup/
#         └── playbooks/          # Playbooks de ejemplo

# Ver documentación de cualquier módulo de una collection
ansible-doc community.general.ufw
ansible-doc community.general.timezone

# Buscar módulos disponibles en una collection instalada
ansible-doc -l | grep community.general | head -20</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>collections_path:</strong> Podés configurar rutas adicionales de búsqueda en <code>ansible.cfg</code> con <code>collections_path = ./collections:~/.ansible/collections</code>. Esto permite tener una carpeta <code>collections/</code> en tu proyecto (en <code>.gitignore</code>) igual que <code>node_modules/</code>.</div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
        <pre class="language-ini"><code class="language-ini">[defaults]
# Busca collections en ./collections primero, luego en el path global
collections_path = ./collections:~/.ansible/collections</code></pre>
      </div>
    `
  },
  {
    title: 'La clave collections: en plays — atajo para FQCN',
    body: `
      <p>La clave <code>collections:</code> a nivel de play funciona como un "import" de Python: te permite usar nombres cortos de módulos sin escribir el FQCN completo cada vez. Pero tiene sus riesgos.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">collections-key.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Play con collections declaradas
  hosts: webservers
  collections:
- community.general    # Permite usar módulos sin prefijo community.general.
- community.docker     # Permite usar módulos sin prefijo community.docker.

  tasks:
# Sin collections: key usarías community.general.ufw
- name: Permitir puerto 80
  ufw:                 # ⚠ Funciona porque community.general está declarada
    rule: allow
    port: "80"

# Sin collections: key usarías community.docker.docker_container
- name: Iniciar contenedor
  docker_container:    # ⚠ Funciona porque community.docker está declarada
    name: web
    image: nginx:latest
    state: started

# Siempre podés usar FQCN aunque collections: esté declarada
- name: FQCN siempre funciona
  community.general.timezone:
    name: UTC</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Riesgo de ambigüedad:</strong> Si usás <code>collections:</code> con múltiples collections que tienen módulos con el mismo nombre, Ansible usará el primero en la lista. Esto puede generar comportamientos difíciles de debuggear. Para playbooks en producción y código de equipo, siempre preferí FQCN explícito.</div>
      </div>
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio</div>
        <div class="lab-content">
          <p><strong>Objetivo:</strong> Verificar qué collections tenés instaladas y usar FQCN en un playbook básico.</p>
          <ol>
            <li>Ejecutá <code>ansible-galaxy collection list</code> — anotá las collections disponibles</li>
            <li>Ejecutá <code>ansible-doc ansible.builtin.copy</code> — leé la documentación del módulo</li>
            <li>Creá un playbook que use al menos 3 módulos distintos con FQCN completo</li>
            <li>Verificá con <code>ansible-playbook --syntax-check mi-playbook.yml</code></li>
          </ol>
        </div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'Collection',
    definition: 'Paquete de distribución de contenido Ansible que agrupa módulos, plugins, roles y playbooks bajo un namespace uniforme con formato namespace.nombre. Permite versioning independiente del core de Ansible.',
  },
  {
    term: 'FQCN (Fully Qualified Collection Name)',
    definition: 'Nombre completo de un recurso de Ansible incluyendo namespace, nombre de collection y nombre del recurso. Formato: namespace.collection.recurso. Ejemplo: community.general.ufw. Elimina ambigüedades cuando múltiples collections tienen recursos con el mismo nombre.',
  },
  {
    term: 'ansible.builtin',
    definition: 'Collection que viene incluida con ansible-core y contiene todos los módulos fundamentales: copy, template, service, package, file, command, shell, uri, user, group, etc. No requiere instalación adicional y su versión está ligada a la versión de ansible-core.',
  },
  {
    term: 'Namespace',
    definition: 'Primera parte del nombre de una collection (ej: community, amazon, kubernetes). Agrupa collections del mismo vendor o ecosistema. Red Hat/Ansible usa el namespace "ansible", AWS usa "amazon", la comunidad usa "community".',
  },
  {
    term: 'community.general',
    definition: 'La collection comunitaria más grande, con más de 1000 módulos para gestionar herramientas y servicios que no tienen su propia collection dedicada: UFW, timezone, ini_file, htpasswd, git_config, etc.',
  },
],
quiz: [
  {
    question: '¿Cuál es el formato correcto de un FQCN en Ansible?',
    options: [
      'collection.namespace.modulo',
      'namespace.collection.modulo',
      'modulo.namespace.collection',
      'namespace/collection/modulo',
    ],
    correctIndex: 1,
    explanation: 'El formato correcto es namespace.collection.modulo. Por ejemplo: community.general.ufw — donde "community" es el namespace, "general" es el nombre de la collection, y "ufw" es el módulo. Este orden refleja la jerarquía: primero el vendor/org, luego el paquete, luego el recurso específico.',
  },
  {
    question: '¿Qué collection de Ansible contiene los módulos más fundamentales como copy, template y service?',
    options: [
      'community.general',
      'ansible.posix',
      'ansible.builtin',
      'ansible.utils',
    ],
    correctIndex: 2,
    explanation: 'ansible.builtin contiene todos los módulos core de Ansible: copy, template, service, package, file, command, shell, uri, user, group, etc. Es la única collection que viene incluida directamente en ansible-core y no puede actualizarse independientemente. Su versión está 100% ligada a la versión de ansible-core que instalás.',
  },
  {
    question: '¿Cuál es el riesgo principal de usar la clave "collections:" en un play en lugar de FQCN?',
    options: [
      'El playbook se ejecuta más lento',
      'Las collections no se cargan correctamente',
      'Ambigüedad si varias collections tienen módulos con el mismo nombre',
      'No funciona con Ansible 2.10+',
    ],
    correctIndex: 2,
    explanation: 'La clave collections: actúa como un "import" de namespaces: permite usar nombres cortos sin el prefijo de la collection. El riesgo es que si dos collections declaradas tienen un módulo con el mismo nombre (ej: deploy), Ansible usará el de la primera collection en la lista, generando comportamientos difíciles de debuggear. FQCN explícito elimina completamente esta ambigüedad.',
  },
],
troubleshooting: [
  {
    error: "ERROR! couldn't resolve module/action 'community.general.ufw'",
    cause: 'La collection community.general no está instalada en el sistema o en el path de collections configurado en ansible.cfg.',
    fix: 'Instalá la collection: ansible-galaxy collection install community.general. Para proyectos de equipo, agregá la collection al requirements.yml y ejecutá ansible-galaxy collection install -r requirements.yml antes de cada run.',
  },
  {
    error: "WARNING: Ansible is in the process of deprecating the short module name 'copy'",
    cause: 'Se está usando el nombre corto de un módulo sin FQCN. Ansible puede resolver el módulo, pero advierte que en versiones futuras el nombre corto sin contexto será ambiguo.',
    fix: "Reemplazá el nombre corto por el FQCN completo: 'copy' → 'ansible.builtin.copy', 'service' → 'ansible.builtin.service', etc. Ejecutá ansible-playbook --syntax-check para identificar todos los módulos sin FQCN.",
  },
  {
    error: "ERROR! The module copy was not found in configured module paths",
    cause: 'Se está usando el nombre corto en un entorno donde el path de búsqueda de módulos no incluye ansible.builtin, o hay un conflicto de nombres con otra collection.',
    fix: 'Usá siempre FQCN: ansible.builtin.copy. Verificá con ansible-galaxy collection list que ansible.builtin esté disponible (siempre debería estarlo si Ansible está instalado correctamente).',
  },
],
  };
