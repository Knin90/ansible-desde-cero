import type { ModuleContent } from '../types';

export const nivel12Mod3: ModuleContent =   {
levelId: 12,
moduleId: 3,
title: 'Dependencias entre roles',
objective: 'Declarar y gestionar dependencias entre roles en meta/main.yml, entender la resolución del árbol de dependencias y evitar problemas comunes como dependencias circulares.',
duration: '1.5 horas',
objectives: [
  'Declarar dependencias de un role en meta/main.yml',
  'Pasar variables a dependencias para configurarlas',
  'Entender el orden de ejecución con dependencias transitivas',
  'Controlar duplicados con allow_duplicates',
  'Incluir roles dinámicamente con include_role e import_role',
],
prerequisites: [
  'Dominar la estructura de un role (Módulo 1 de este nivel)',
  'Haber instalado roles desde Galaxy (Módulo 2 de este nivel)',
],
steps: [
  {
    title: 'meta/main.yml — metadatos y dependencias',
    body: `
      <p>El archivo <code>meta/main.yml</code> sirve dos propósitos: describe el role para Galaxy (autor, licencia, plataformas soportadas) y declara sus dependencias.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/servidor_web/meta/main.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
galaxy_info:
  # Metadatos para Ansible Galaxy (si vas a publicar el role)
  author: equipo_plataforma
  description: Configura nginx como servidor web con soporte SSL/TLS
  company: Mi Empresa SA
  license: MIT
  min_ansible_version: "2.14"

  # Plataformas soportadas (para documentación en Galaxy)
  platforms:
- name: Ubuntu
  versions:
    - "22.04"
    - "24.04"
- name: EL  # Enterprise Linux (RHEL, CentOS, Rocky, Alma)
  versions:
    - "8"
    - "9"

  # Tags para búsqueda en Galaxy
  galaxy_tags:
- nginx
- web
- proxy
- ssl

# Dependencias: roles que deben ejecutarse antes de este role
dependencies:
  # Dependencia simple: solo el nombre del role
  - role: common

  # Dependencia con configuración específica para este role
  - role: firewall
vars:
  firewall_reglas:
    - puerto: "{{ nginx_port }}"
      protocolo: tcp
    - puerto: "{{ nginx_ssl_port }}"
      protocolo: tcp
      cuando: "{{ nginx_ssl_enabled }}"

  # Dependencia de Galaxy (debe estar instalada)
  - role: geerlingguy.git</code></pre>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Cuándo declarar dependencias aquí vs en requirements.yml:</strong><br>
          <ul>
            <li><code>meta/main.yml</code>: roles que SIEMPRE son necesarios para que este role funcione</li>
            <li><code>requirements.yml</code>: dependencias del proyecto completo para instalación</li>
            <li>Podés necesitar ambos: declarar la dependencia en meta y también en requirements para que se instale</li>
          </ul>
        </div>
      </div>
    `
  },
  {
    title: 'Orden de ejecución y allow_duplicates',
    body: `
      <p>Ansible resuelve el árbol de dependencias completo antes de ejecutar. Las dependencias se ejecutan en profundidad primero (depth-first). Por defecto, un role solo se ejecuta una vez por play.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">orden-ejecucion.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml"># Escenario:
# servidor_web depende de: common, firewall, geerlingguy.git
# monitoring depende de: common, ntp
# common no tiene dependencias
# firewall depende de: common

- name: Configurar servidor completo
  hosts: webservers
  roles:
- servidor_web  # Ansible resuelve TODO el árbol
- monitoring

# Orden REAL de ejecución:
# 1. common          (dependencia de servidor_web → firewall → common)
# 2. firewall        (dependencia de servidor_web)
# 3. geerlingguy.git (dependencia de servidor_web)
# 4. servidor_web    (el role principal)
# 5. ntp             (dependencia de monitoring — common ya corrió, se salta)
# 6. monitoring      (el role principal)

# ¡common solo se ejecuta UNA vez aunque dos roles lo declaren como dependencia!</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">allow-duplicates.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml"># Escenario donde NECESITÁS que un role se ejecute dos veces:
# Por ejemplo, el role "crear_vhost" necesita correr para cada virtual host

# roles/crear_vhost/meta/main.yml
allow_duplicates: true

# Ahora podés llamar al mismo role múltiples veces con diferentes variables:
- name: Configurar virtual hosts
  hosts: webservers
  roles:
- role: crear_vhost
  vars: { vhost_nombre: blog, vhost_puerto: 3001 }
- role: crear_vhost
  vars: { vhost_nombre: api, vhost_puerto: 3002 }
- role: crear_vhost
  vars: { vhost_nombre: admin, vhost_puerto: 3003 }
  # Sin allow_duplicates: true, solo el primero se ejecutaría</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Dependencias circulares:</strong> Si role A depende de B y B depende de A, Ansible falla con "Found a role dependency cycle". Diseñá roles con dependencias en una sola dirección. Un role "common" que no depende de nadie es la base de la jerarquía.</div>
      </div>
    `
  },
  {
    title: 'include_role e import_role con variables dinámicas',
    body: `
      <p>Para mayor flexibilidad, podés llamar roles dinámicamente desde tasks, pasando variables calculadas en tiempo de ejecución.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles-dinamicos.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Configurar servicios dinámicamente
  hosts: all
  tasks:
# El role varía según el tipo de servidor detectado
- name: Determinar tipo de servidor
  ansible.builtin.set_fact:
    tipo_servidor: >-
      {{ 'webserver' if 'webservers' in group_names
         else ('database' if 'dbservers' in group_names
         else 'generic') }}

# include_role con nombre dinámico
- name: Aplicar role específico del tipo de servidor
  ansible.builtin.include_role:
    name: "configuracion_{{ tipo_servidor }}"
  # Aplica: configuracion_webserver, configuracion_database, o configuracion_generic

# include_role con tasks_from — ejecutar solo una parte del role
- name: Solo validar la configuración (sin instalar)
  ansible.builtin.include_role:
    name: servidor_web
    tasks_from: validate.yml   # Solo corre roles/servidor_web/tasks/validate.yml
  vars:
    nginx_port: "{{ custom_port | default(80) }}"

# import_role con defaults_from personalizado
- name: Aplicar role con defaults alternativos
  ansible.builtin.import_role:
    name: servidor_web
    defaults_from: production_defaults.yml  # roles/servidor_web/defaults/production_defaults.yml</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>tasks_from:</strong> El parámetro tasks_from de include_role e import_role permite ejecutar solo un archivo específico de tasks del role en lugar del main.yml por defecto. Útil para separar instalación (install.yml), configuración (configure.yml) y validación (validate.yml) dentro del mismo role.</div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'meta/main.yml',
    definition: 'Archivo de metadatos de un role. Define galaxy_info (autor, licencia, plataformas para publicación en Galaxy) y dependencies (roles que deben ejecutarse antes). Ansible resuelve las dependencias automáticamente.',
  },
  {
    term: 'allow_duplicates',
    definition: 'Campo en meta/main.yml que permite que un role sea ejecutado múltiples veces en el mismo play con diferentes variables. Por defecto es false — Ansible ejecuta cada role solo una vez por play.',
  },
  {
    term: 'tasks_from',
    definition: 'Parámetro de include_role e import_role que especifica qué archivo de tasks ejecutar en lugar del main.yml por defecto. Permite reusar partes específicas de un role.',
  },
  {
    term: 'dependencia transitiva',
    definition: 'Dependencia que se incluye indirectamente: si A depende de B y B depende de C, entonces C es una dependencia transitiva de A. Ansible las resuelve automáticamente en el orden correcto.',
  },
],
quiz: [
  {
    question: 'Si dos roles declaran "common" como dependencia, ¿cuántas veces se ejecutará common?',
    options: [
      'Dos veces — una por cada role que lo declara',
      'Una vez — Ansible deduplica dependencias por defecto',
      'Depende del orden de los roles en el play',
      'Solo si common tiene allow_duplicates: true',
    ],
    correctIndex: 1,
    explanation: 'Por defecto, Ansible ejecuta cada role solo UNA vez por play. Si dos roles declaran common como dependencia, Ansible lo ejecuta antes del primero que lo necesite y lo salta para el segundo. Para cambiar este comportamiento, el role dependencia necesita allow_duplicates: true en su meta/main.yml.',
  },
  {
    question: '¿Cuándo usarías tasks_from en include_role?',
    options: [
      'Siempre — tasks_from es la práctica recomendada',
      'Cuando querés ejecutar solo un archivo específico del role en lugar del main.yml completo',
      'Cuando el role no tiene un main.yml',
      'Para pasar variables adicionales al role',
    ],
    correctIndex: 1,
    explanation: 'tasks_from es útil cuando un role bien organizado tiene sus tareas divididas en archivos (install.yml, configure.yml, validate.yml) y querés ejecutar solo una parte. Por ejemplo, en un playbook de validación podés correr solo el validate.yml de varios roles sin ejecutar la instalación completa.',
  },
  {
    question: '¿Cuál es el orden correcto de ejecución si role_A depende de role_B y role_B depende de role_C?',
    options: [
      'role_A → role_B → role_C',
      'role_C → role_B → role_A',
      'Todos en paralelo',
      'El orden no es determinístico',
    ],
    correctIndex: 1,
    explanation: 'Ansible resuelve las dependencias en profundidad primero (depth-first) y ejecuta de las hojas hacia la raíz del árbol. role_C no tiene dependencias, se ejecuta primero. Luego role_B (que ya tiene su dependencia resuelta). Finalmente role_A. Este orden garantiza que cada role tiene todo lo que necesita disponible.',
  },
],
troubleshooting: [
  {
    error: 'Found a role dependency cycle in roles: role_A → role_B → role_A',
    cause: 'Los roles tienen dependencias circulares: A necesita B para funcionar y B necesita A.',
    fix: 'Refactorizá para extraer la funcionalidad compartida a un role "common" sin dependencias. El patrón correcto es: common (sin deps) → role_A y common → role_B. Nunca A → B → A.',
  },
  {
    error: 'El role dependencia se ejecuta con variables incorrectas',
    cause: 'Las variables pasadas en la declaración de dependencia no llegan al role en el contexto esperado.',
    fix: 'Verificá la sintaxis en meta/main.yml: la sección vars debe estar indentada bajo el role dependencia. Alternativa más robusta: usá include_role con vars explícito en lugar de dependencias en meta.',
  },
  {
    error: 'Una dependencia declarada en meta/main.yml no se encuentra',
    cause: 'El role dependencia no está instalado localmente aunque está en requirements.yml.',
    fix: 'Asegurate de ejecutar ansible-galaxy install -r requirements.yml antes de correr el playbook. En CI/CD, agregá este paso antes de ansible-playbook. Verificá con ansible-galaxy role list que el role está instalado.',
  },
],
realWorldCase: 'Una empresa de e-commerce tiene un role "aplicacion_web" que declara dependencias en meta/main.yml hacia "base_server", "nginx", "postgres_client" y "monitoring_agent". Cuando un nuevo desarrollador quiere desplegar la aplicación, solo llama al role aplicacion_web y Ansible instala y configura automáticamente toda la cadena de dependencias en el orden correcto, sin que el desarrollador necesite conocer los detalles de cada role.',
  };
