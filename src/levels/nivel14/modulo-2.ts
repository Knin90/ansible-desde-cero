import type { ModuleContent } from '../types';

export const nivel14Mod2: ModuleContent =   {
levelId: 14,
moduleId: 2,
title: 'Namespaces y versiones',
objective: 'Gestionar versiones de collections con requirements.yml, entender el sistema de versionado semántico y manejar instalación offline.',
duration: '2 horas',
objectives: [
  'Crear y mantener un requirements.yml completo con versiones fijadas',
  'Instalar collections con control de versión usando ansible-galaxy',
  'Configurar fuentes alternativas (Automation Hub, repositorios privados)',
  'Instalar collections offline con tarballs para entornos air-gapped',
],
prerequisites: [
  'Completado el Módulo 1 de Nivel 14',
  'Entender semver (MAJOR.MINOR.PATCH)',
],
steps: [
  {
    title: 'requirements.yml — el manifiesto de dependencias',
    body: `
      <p>El archivo <code>requirements.yml</code> es el equivalente de <code>package.json</code> o <code>requirements.txt</code> para Ansible: declara todas las collections y roles que necesita tu proyecto, con sus versiones exactas.</p>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Pensá en <code>requirements.yml</code> como el <code>package.json</code> de Node.js pero para Ansible. Define qué colecciones necesitás y en qué versiones, de forma reproducible. Cualquier miembro del equipo puede ejecutar <code>ansible-galaxy collection install -r requirements.yml</code> y obtener exactamente las mismas versiones.</p>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">requirements.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# Formato combinado: collections + roles en el mismo archivo
collections:
  # Versión exacta — máxima reproducibilidad (recomendado en producción)
  - name: community.general
version: "7.5.0"

  # Rango de versión semver — permite patch updates automáticamente
  - name: community.postgresql
version: ">=3.2.0,<4.0.0"

  # Versión mínima — flexible pero peligroso en prod
  - name: community.docker
version: ">=3.0.0"

  # Sin versión — siempre instala la más reciente (NUNCA en producción)
  - name: community.mysql

  # Desde Automation Hub privado
  - name: mi_empresa.infraestructura
source: https://automation.mi-empresa.com/api/galaxy/
version: "2.1.0"

  # Desde Ansible Galaxy con namespace específico
  - name: amazon.aws
version: "6.5.0"

  # Desde un repositorio git (para desarrollo)
  - name: mi_empresa.experimental
source: git+https://github.com/mi-empresa/ansible-collection.git
version: main

roles:
  # Roles de Galaxy también pueden ir en requirements.yml
  - name: geerlingguy.docker
version: "6.1.0"
  - name: geerlingguy.nginx</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Fijar versiones en producción:</strong> Nunca uses collections sin versión fijada en ambientes de producción. Una actualización silenciosa de <code>community.general</code> puede cambiar el comportamiento de un módulo y romper tu pipeline en el peor momento posible.</div>
      </div>
    `
  },
  {
    title: 'Comandos de gestión de collections',
    body: `
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">gestionar-collections.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Instalar desde requirements.yml (el comando más usado en CI/CD)
ansible-galaxy collection install -r requirements.yml

# Instalar en directorio local del proyecto (recomendado para equipos)
ansible-galaxy collection install -r requirements.yml -p ./collections

# Instalar una sola collection
ansible-galaxy collection install community.general

# Instalar versión exacta
ansible-galaxy collection install "amazon.aws:==6.5.0"

# Instalar versión mínima
ansible-galaxy collection install "community.general:>=7.0.0"

# Actualizar todas las collections del requirements.yml
ansible-galaxy collection install -r requirements.yml --upgrade

# Ver todas las collections instaladas con sus versiones
ansible-galaxy collection list

# Ver versión de una collection específica
ansible-galaxy collection list community.general

# Ver documentación de un módulo
ansible-doc community.general.ufw

# Buscar collections disponibles en Galaxy
ansible-galaxy collection search docker

# Instalar ignorando el caché de Galaxy
ansible-galaxy collection install community.general --no-cache</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>CI/CD con requirements.yml:</strong> En tu pipeline, siempre ejecutá <code>ansible-galaxy collection install -r requirements.yml</code> antes del primer playbook. Muchos equipos agregan este paso como parte del "setup" del job, junto con la instalación de Ansible.</div>
      </div>
    `
  },
  {
    title: 'Instalación offline — entornos air-gapped',
    body: `
      <p>En entornos corporativos sin acceso a internet (air-gapped), necesitás descargar las collections en una máquina con acceso y distribuirlas como tarballs.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">offline-install.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># === En máquina CON acceso a internet ===

# Descargar collection como tarball sin instalar
ansible-galaxy collection download community.general:7.5.0 -p ./offline-collections

# Descargar todas las collections del requirements.yml
ansible-galaxy collection download -r requirements.yml -p ./offline-collections

# Los tarballs quedan en ./offline-collections/
# community-general-7.5.0.tar.gz
# amazon-aws-6.5.0.tar.gz
# etc.

# Copiar ./offline-collections/ al entorno air-gapped
# (USB, servidor de archivos interno, etc.)

# === En máquina SIN acceso a internet ===

# Instalar desde tarball local
ansible-galaxy collection install ./offline-collections/community-general-7.5.0.tar.gz

# Instalar todos los tarballs de un directorio
for tarball in ./offline-collections/*.tar.gz; do
  ansible-galaxy collection install "$tarball"
done

# Alternativa: Automation Hub o servidor Pulp como mirror interno
# Configurar en ansible.cfg:
# [galaxy]
# server_list = automation_hub
# [galaxy_server.automation_hub]
# url = https://automation-hub.empresa.com/api/galaxy/
# auth_url = https://sso.empresa.com/auth/token</code></pre>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Opciones para entornos air-gapped:</strong><br>
          1. <strong>Tarballs manuales:</strong> simple pero requiere actualización manual<br>
          2. <strong>Automation Hub (Red Hat):</strong> mirror completo de Galaxy, requiere suscripción<br>
          3. <strong>Pulp:</strong> solución open-source para mirror de Galaxy, más compleja de mantener<br>
          4. <strong>Gitea/Nexus:</strong> servidor git/artifacts que puede servir como fuente de collections
        </div>
      </div>
    `
  },
  {
    title: 'Resolución de conflictos de versión',
    body: `
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">conflictos-versiones.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Conflicto típico: versión instalada != versión requerida
# Error: "community.general 6.0.0 is already installed.
#         You can use --upgrade to install newest version."

# Solución 1: forzar upgrade
ansible-galaxy collection install community.general:7.5.0 --upgrade

# Solución 2: forzar reinstalación
ansible-galaxy collection install community.general:7.5.0 --force

# Verificar qué versión está realmente instalada después
ansible-galaxy collection list community.general

# Ver si hay conflictos de dependencias entre collections
# (community.general puede requerir una versión mínima de community.crypto)
ansible-galaxy collection install -r requirements.yml --upgrade -v

# La opción -v (verbose) muestra las dependencias resueltas</code></pre>
      </div>
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio</div>
        <div class="lab-content">
          <p><strong>Objetivo:</strong> Crear un requirements.yml para un proyecto hipotético y verificar la instalación.</p>
          <ol>
            <li>Creá un archivo <code>requirements.yml</code> con al menos 3 collections con versiones fijadas</li>
            <li>Ejecutá <code>ansible-galaxy collection install -r requirements.yml -p ./collections</code></li>
            <li>Verificá con <code>ansible-galaxy collection list</code> que las versiones coincidan exactamente</li>
            <li>Intentá instalar una versión diferente de una collection ya instalada sin <code>--upgrade</code> — observá el error</li>
            <li>Resolvé el conflicto con <code>--force</code></li>
          </ol>
        </div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'requirements.yml',
    definition: 'Archivo de manifiesto que declara las collections y roles que necesita un proyecto Ansible, con sus versiones. Equivalente a package.json en Node.js o requirements.txt en Python. Se instala con ansible-galaxy collection install -r requirements.yml.',
  },
  {
    term: 'Semantic Versioning (semver)',
    definition: 'Sistema de versionado con formato MAJOR.MINOR.PATCH. MAJOR indica breaking changes, MINOR agrega funcionalidad de forma compatible, PATCH corrige bugs. Las collections de Ansible siguen semver: puedes confiar en que 7.5.1 es compatible con 7.5.0, pero 8.0.0 puede no serlo.',
  },
  {
    term: 'Automation Hub',
    definition: 'Repositorio privado de Red Hat para collections certificadas y contenido de partners. Ofrece colecciones con soporte empresarial y puede actuar como mirror de Ansible Galaxy para entornos air-gapped. Requiere suscripción de Red Hat Ansible Automation Platform.',
  },
  {
    term: 'Air-gapped',
    definition: 'Entorno sin acceso a internet, típico en sistemas de seguridad crítica (gobierno, banca, infraestructura crítica). Requiere distribución manual de collections como tarballs o mediante un servidor mirror interno (Automation Hub, Pulp, Nexus).',
  },
],
quiz: [
  {
    question: '¿Cuál es la forma más segura de especificar la versión de una collection en requirements.yml para producción?',
    options: [
      'No especificar versión para obtener siempre la más reciente',
      'Especificar solo la versión mínima: ">=7.0.0"',
      'Especificar versión exacta: "7.5.0"',
      'Especificar un rango amplio: ">=6.0.0,<10.0.0"',
    ],
    correctIndex: 2,
    explanation: 'La versión exacta (version: "7.5.0") garantiza reproducibilidad total: todos los entornos y todos los runs del pipeline usarán exactamente los mismos módulos con el mismo comportamiento. Los rangos y la ausencia de versión permiten que actualizaciones automáticas introduzcan cambios de comportamiento que pueden romper deployments en producción.',
  },
  {
    question: '¿Qué comando instala las collections del requirements.yml en un directorio local del proyecto?',
    options: [
      'ansible-galaxy collection install -r requirements.yml --local',
      'ansible-galaxy collection install -r requirements.yml -p ./collections',
      'ansible-galaxy collection install requirements.yml ./collections',
      'ansible-galaxy install -r requirements.yml --path collections',
    ],
    correctIndex: 1,
    explanation: 'El flag -p (o --collections-path) especifica el directorio destino de la instalación. Con -p ./collections las collections quedan en el directorio del proyecto, aisladas de la instalación global. Este directorio se agrega al .gitignore del proyecto y se instala fresco en cada entorno (CI/CD, staging, producción).',
  },
  {
    question: '¿Qué opción de ansible-galaxy collection install permite instalar collections en un entorno sin conexión a internet?',
    options: [
      'ansible-galaxy collection install --offline',
      'ansible-galaxy collection install archivo.tar.gz',
      'ansible-galaxy collection install --no-internet',
      'ansible-galaxy collection install --air-gapped',
    ],
    correctIndex: 1,
    explanation: 'Las collections pueden instalarse directamente desde un archivo tarball (.tar.gz) descargado previamente. No existe un flag --offline; simplemente se pasa el path del tarball como argumento. Primero se descarga en un entorno con internet con ansible-galaxy collection download, y luego se instala offline con ansible-galaxy collection install archivo.tar.gz.',
  },
],
troubleshooting: [
  {
    error: "ERROR! community.general 6.0.0 is already installed, use --upgrade to install latest",
    cause: 'La versión instalada es diferente a la requerida en requirements.yml. Ansible detecta la discrepancia pero no sobreescribe por defecto para evitar actualizaciones accidentales.',
    fix: 'Usá ansible-galaxy collection install -r requirements.yml --upgrade para permitir actualizaciones, o ansible-galaxy collection install community.general:7.5.0 --force para forzar la versión específica. En CI/CD siempre incluí --upgrade o --force para garantizar que se instale la versión correcta.',
  },
  {
    error: "ERROR! Cannot install community.general:7.5.0 due to dependency conflict",
    cause: 'Otra collection ya instalada requiere una versión incompatible de community.general como dependencia.',
    fix: 'Ejecutá con -vvv para ver las dependencias en detalle: ansible-galaxy collection install -r requirements.yml -vvv. Identificá qué collection genera el conflicto y ajustá las versiones en requirements.yml para que sean compatibles.',
  },
  {
    error: "Connection timed out when fetching https://galaxy.ansible.com",
    cause: 'Entorno sin acceso a internet o Galaxy no disponible.',
    fix: 'Para entornos air-gapped: descargá los tarballs previamente con ansible-galaxy collection download en una máquina con internet y transferilos al entorno. Alternativa: configurar un servidor Automation Hub o Pulp como mirror interno y apuntar ansible.cfg a ese servidor.',
  },
],
  };
