import type { ModuleContent } from '../types';

export const nivel12Mod2: ModuleContent =   {
levelId: 12,
moduleId: 2,
title: 'Ansible Galaxy',
objective: 'Usar Ansible Galaxy para buscar, instalar y gestionar roles y collections de la comunidad, y declarar dependencias reproducibles con requirements.yml.',
duration: '1.5 horas',
objectives: [
  'Buscar e instalar roles y collections desde Ansible Galaxy',
  'Declarar dependencias con requirements.yml para reproducibilidad',
  'Fijar versiones de dependencias para ambientes de producción',
  'Entender la diferencia entre roles y collections en Galaxy',
],
prerequisites: [
  'Conocer la estructura de un role de Ansible (Módulo 1 de este nivel)',
  'Tener ansible-galaxy disponible en la terminal',
],
steps: [
  {
    title: 'Ansible Galaxy — el repositorio de roles y collections',
    body: `
      <p>Ansible Galaxy (galaxy.ansible.com) es el hub oficial de la comunidad Ansible. Aloja miles de roles y collections que podés instalar y usar directamente en tus proyectos.</p>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Galaxy es como npm para JavaScript o pip para Python, pero para Ansible. En lugar de escribir cada role desde cero, podés instalar roles mantenidos por la comunidad y los vendors.</p>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">galaxy-comandos.sh</span></div>
        <pre class="language-yaml"><code class="language-yaml"># ——— ROLES ———

# Buscar roles en Galaxy
ansible-galaxy search nginx --author geerlingguy

# Ver información detallada de un role
ansible-galaxy info geerlingguy.nginx

# Instalar un role
ansible-galaxy role install geerlingguy.nginx

# Instalar versión específica
ansible-galaxy role install geerlingguy.nginx,6.1.0

# Instalar en directorio del proyecto (recomendado)
ansible-galaxy role install geerlingguy.nginx --roles-path ./roles

# Ver roles instalados
ansible-galaxy role list

# Eliminar un role
ansible-galaxy role remove geerlingguy.nginx

# ——— COLLECTIONS ———

# Instalar collection
ansible-galaxy collection install community.general

# Instalar versión específica
ansible-galaxy collection install amazon.aws:6.5.0

# Ver collections instaladas
ansible-galaxy collection list

# Ver documentación de un módulo en una collection
ansible-doc amazon.aws.ec2_instance</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Roles vs Collections:</strong> Un rol es una unidad de automatización para una tarea específica (configurar nginx). Una collection es un paquete que puede contener múltiples roles, módulos, plugins y playbooks bajo un namespace (ej: community.general incluye 1000+ módulos). La tendencia moderna es distribuir todo como collections.</div>
      </div>
    `
  },
  {
    title: 'requirements.yml — dependencias declarativas y reproducibles',
    body: `
      <p>El archivo <code>requirements.yml</code> declara todas las dependencias externas con versiones fijadas. Es el equivalente de <code>package.json</code> o <code>requirements.txt</code> para Ansible.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">requirements.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
roles:
  # Role de Galaxy con versión exacta
  - name: geerlingguy.nginx
version: "6.1.0"

  # Role de Galaxy sin versión (última — no recomendado para producción)
  - name: geerlingguy.redis

  # Role desde GitHub (cualquier ref: tag, branch, commit)
  - src: https://github.com/mi-empresa/ansible-role-mi-app
name: mi_empresa.mi_app    # Nombre local del role
version: v2.3.0            # Tag de GitHub

  # Role desde un tarball
  - src: https://cdn.ejemplo.com/roles/mi_role-1.0.0.tar.gz
name: mi_role

collections:
  # Collection con versión exacta — recomendado para producción
  - name: community.general
version: "7.5.0"

  # Con rango de versión — permite patch updates automáticos
  - name: community.postgresql
version: ">=3.2.0,<4.0.0"

  # Collection de vendor con autenticación (Ansible Automation Platform)
  - name: amazon.aws
version: "6.5.0"

  - name: kubernetes.core
version: "3.0.0"</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalar-dependencias.sh</span></div>
        <pre class="language-yaml"><code class="language-yaml"># Instalar TODO (roles y collections) desde requirements.yml
ansible-galaxy install -r requirements.yml

# Solo roles
ansible-galaxy role install -r requirements.yml

# Solo collections
ansible-galaxy collection install -r requirements.yml

# Instalar en directorio del proyecto para tener control de versiones
ansible-galaxy role install -r requirements.yml -p ./roles
ansible-galaxy collection install -r requirements.yml -p ./collections

# Forzar reinstalación (útil si hay actualizaciones)
ansible-galaxy role install -r requirements.yml --force

# En CI/CD — instalar sin prompts interactivos
ansible-galaxy collection install -r requirements.yml --no-deps</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
        <pre class="language-yaml"><code class="language-yaml">[defaults]
# Buscar roles primero en ./roles (proyecto), luego en ~/.ansible/roles
roles_path = ./roles:~/.ansible/roles

# Buscar collections primero en ./collections (proyecto)
collections_paths = ./collections:~/.ansible/collections</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Nunca uses versiones sin fijar en producción:</strong> Un role de Galaxy puede actualizarse y romper tu playbook. Siempre especificá versiones exactas en requirements.yml y actualizá deliberadamente después de probar en staging.</div>
      </div>
    `
  },
  {
    title: 'Laboratorio: proyecto con dependencias externas',
    body: `
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio</div>
        <div class="lab-content">
          <p><strong>Objetivo:</strong> Crear un proyecto con requirements.yml y usar un role de Galaxy.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">setup-proyecto.sh</span></div>
            <pre class="language-yaml"><code class="language-yaml">mkdir mi-proyecto && cd mi-proyecto
mkdir -p roles collections

# Crear requirements.yml
cat > requirements.yml << 'EOF'
roles:
  - name: geerlingguy.git
version: "3.0.0"
collections:
  - name: community.general
version: "7.5.0"
EOF

# Instalar dependencias localmente
ansible-galaxy role install -r requirements.yml -p ./roles
ansible-galaxy collection install -r requirements.yml -p ./collections

# Verificar instalación
ansible-galaxy role list --roles-path ./roles
ansible-galaxy collection list --collections-path ./collections</code></pre>
          </div>
        </div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'Ansible Galaxy',
    definition: 'Repositorio oficial de la comunidad Ansible (galaxy.ansible.com) donde se publican y comparten roles y collections. Accesible mediante el comando ansible-galaxy para instalar dependencias.',
  },
  {
    term: 'requirements.yml',
    definition: 'Archivo YAML que declara todas las dependencias externas de roles y collections de un proyecto Ansible, con sus versiones. Permite reproducibilidad entre entornos, similar a package.json o requirements.txt.',
  },
  {
    term: 'collection',
    definition: 'Paquete de distribución de Ansible que puede contener módulos, plugins, roles, playbooks y documentación bajo un namespace (ej: community.general, amazon.aws). El formato moderno de distribución reemplaza a los roles standalone.',
  },
  {
    term: 'FQCN (Fully Qualified Collection Name)',
    definition: 'Nombre completo de un módulo o plugin incluyendo su namespace y collection: namespace.collection.modulo. Ejemplo: ansible.builtin.copy, community.general.git_config. Recomendado para evitar ambigüedad.',
  },
],
quiz: [
  {
    question: '¿Por qué es importante fijar versiones exactas en requirements.yml para producción?',
    options: [
      'Para ahorrar espacio en disco',
      'Para evitar que una actualización del role rompa tus playbooks sin previo aviso',
      'Porque las versiones sin fijar no se pueden instalar',
      'Solo importa fijar versiones en colecciones, no en roles',
    ],
    correctIndex: 1,
    explanation: 'Los roles y collections en Galaxy se actualizan independientemente. Una actualización de versión mayor puede introducir cambios incompatibles (renombrado de variables, cambio en comportamiento). Fijando versiones exactas, controlás exactamente qué código se ejecuta y podés actualizar deliberadamente después de probar en staging.',
  },
  {
    question: '¿Cuál es la diferencia entre un role de Galaxy y una collection?',
    options: [
      'No hay diferencia práctica',
      'Un role es para Linux, una collection para Windows',
      'Una collection es un paquete que puede contener múltiples roles, módulos y plugins bajo un namespace',
      'Las collections solo contienen módulos, nunca roles',
    ],
    correctIndex: 2,
    explanation: 'Un role es una unidad de automatización para una tarea específica. Una collection es un paquete distribuible que puede contener múltiples roles, módulos custom, plugins de filtro, lookup plugins, y más, todo bajo un namespace namespace.collection. La tendencia moderna es distribuir todo como collections.',
  },
],
troubleshooting: [
  {
    error: 'WARNING: Skipping because this is already installed and we do not allow multiple installs',
    cause: 'El role ya está instalado con otra versión y --force no fue especificado.',
    fix: 'Usá --force para reinstalar: ansible-galaxy role install -r requirements.yml --force. Para actualizar a una versión específica más nueva, primero remové la actual: ansible-galaxy role remove nombre.role.',
  },
  {
    error: 'ERROR! No collection found: community.general:7.5.0',
    cause: 'La versión especificada no existe en Galaxy o hay un error en el formato de versión.',
    fix: 'Verificá versiones disponibles en galaxy.ansible.com. El formato correcto en requirements.yml es version: "7.5.0" (con comillas para evitar que YAML interprete el número). También podés buscar: ansible-galaxy collection list community.general.',
  },
  {
    error: 'El role instalado en ./roles no es encontrado por ansible-playbook',
    cause: 'El roles_path en ansible.cfg no incluye el directorio local ./roles.',
    fix: 'Agregá en ansible.cfg: [defaults] roles_path = ./roles:~/.ansible/roles. Los dos puntos separan múltiples rutas. Verificá que ansible.cfg esté en el directorio del proyecto o en el home.',
  },
],
realWorldCase: 'Un equipo de plataforma mantiene un requirements.yml con 8 roles de Galaxy y 5 collections. Tienen un job de CI/CD semanal que prueba la actualización de cada dependencia en un ambiente de staging. Esto les permite mantenerse actualizados con mejoras de seguridad sin el riesgo de romper producción inesperadamente.',
  };
