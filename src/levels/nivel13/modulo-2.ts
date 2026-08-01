import type { ModuleContent } from '../types';

export const nivel13Mod2: ModuleContent =   {
levelId: 13,
moduleId: 2,
title: 'Lookup Plugins',
objective: 'Usar lookup plugins para leer datos de fuentes externas en el nodo de control: archivos locales, variables de entorno, contraseñas, templates y servicios de secretos.',
duration: '1.5 horas',
objectives: [
  'Usar los lookups built-in más importantes: file, env, fileglob, password, template',
  'Entender la diferencia entre lookup() y query()',
  'Usar lookups en la sección vars para cargar datos al inicio del playbook',
  'Combinar lookups con filtros para transformar datos leídos',
  'Cargar secretos desde fuentes externas con hashi_vault y env',
],
prerequisites: [
  'Entender Jinja2 básico en Ansible (Nivel 9)',
  'Conocer la diferencia entre nodo de control y host remoto',
],
steps: [
  {
    title: 'Lookups — leer datos en el nodo de control',
    body: `
      <p>Los lookup plugins se ejecutan en el nodo de control y devuelven datos para usar en variables o tareas. No modifican el estado del sistema — solo leen.</p>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Los lookups son como un asistente que puede traerte información de cualquier fuente antes de que empieces a trabajar: leer un archivo, consultar una variable de entorno, obtener un secreto del vault. Te da los datos, vos decidís qué hacer con ellos.</p>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">lookups-builtin.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">vars:
  # file: leer contenido de un archivo local
  clave_ssh_publica: "{{ lookup('ansible.builtin.file', '~/.ssh/id_ed25519.pub') }}"

  # env: leer variable de entorno del nodo de control
  token_deploy: "{{ lookup('ansible.builtin.env', 'DEPLOY_TOKEN') }}"

  # password: generar (y recordar) contraseña aleatoria en archivo local
  # La próxima vez que se ejecute, devuelve la misma contraseña del archivo
  db_password: >-
{{ lookup('ansible.builtin.password',
          'credentials/db_password.txt length=32 chars=ascii_letters,digits') }}

  # template: renderizar un template local y devolver el resultado como string
  config_nginx: "{{ lookup('ansible.builtin.template', 'templates/nginx-upstream.j2') }}"

tasks:
  # Leer contenido de archivo para uso en tarea
  - name: Agregar clave SSH del operador
ansible.posix.authorized_key:
  user: deploy
  key: "{{ clave_ssh_publica }}"
  state: present

  # fileglob: obtener lista de archivos que coinciden con patrón
  - name: Copiar todos los scripts de inicialización
ansible.builtin.copy:
  src: "{{ item }}"
  dest: "/opt/scripts/{{ item | basename }}"
  mode: '0755'
loop: "{{ lookup('ansible.builtin.fileglob', 'files/scripts/*.sh', wantlist=True) }}"

  # lines: leer salida de comando local como lista de líneas
  - name: Obtener lista de ramas activas de Git
ansible.builtin.debug:
  msg: "Rama activa: {{ item }}"
loop: "{{ lookup('ansible.builtin.lines', 'git branch --remote', wantlist=True) }}"</code></pre>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>lookup() vs query():</strong><br>
          <code>lookup('plugin', args)</code> devuelve un string con los elementos separados por coma.<br>
          <code>query('plugin', args)</code> siempre devuelve una lista.<br>
          <code>lookup('plugin', args, wantlist=True)</code> equivale a query().<br><br>
          Para usar con <code>loop:</code>, preferí siempre <code>query()</code>.
        </div>
      </div>
    `
  },
  {
    title: 'Lookups para gestión de secretos',
    body: `
      <p>Los lookups son ideales para cargar secretos de fuentes externas sin hardcodearlos en playbooks o variables.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">lookups-secretos.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">vars:
  # Cargar secretos desde variables de entorno (CI/CD)
  db_host: "{{ lookup('ansible.builtin.env', 'DB_HOST') }}"
  db_password: "{{ lookup('ansible.builtin.env', 'DB_PASSWORD') }}"
  api_key: "{{ lookup('ansible.builtin.env', 'API_KEY') }}"

  # HashiCorp Vault (requiere collection community.hashi_vault)
  vault_db_creds: >-
{{ lookup('community.hashi_vault.hashi_vault',
          'secret/data/produccion/db',
          token=vault_token,
          url='https://vault.empresa.com') }}

tasks:
  # Validar que los secretos están definidos antes de usarlos
  - name: Validar secrets de entorno
ansible.builtin.assert:
  that:
    - db_host | length > 0
    - db_password | length >= 16
    - api_key | length > 0
  fail_msg: >
    Secretos de entorno faltantes. Definí las variables de entorno:
    DB_HOST, DB_PASSWORD (min 16 chars), API_KEY

  # Usar secreto de Vault
  - name: Configurar conexión a base de datos
ansible.builtin.template:
  src: database.yml.j2
  dest: /opt/mi-app/config/database.yml
  mode: '0600'   # Solo lectura por el owner
vars:
  db_user: "{{ vault_db_creds.data.username }}"
  db_pass: "{{ vault_db_creds.data.password }}"

  # Leer archivo de template local y usar su resultado
  - name: Generar configuración dinámica
ansible.builtin.copy:
  content: "{{ lookup('ansible.builtin.template', 'templates/app-config.j2') }}"
  dest: /opt/mi-app/config/app.conf</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Seguridad de secretos:</strong> Los valores devueltos por lookups están en memoria y pueden aparecer en logs si usás verbose. Usá <code>no_log: true</code> en tareas que manejan secretos para evitar que se registren. Nunca comités archivos generados por el lookup password a Git.</div>
      </div>
    `
  },
  {
    title: 'Laboratorio: gestión de configuración con lookups',
    body: `
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio</div>
        <div class="lab-content">
          <p><strong>Objetivo:</strong> Crear un playbook que cargue su configuración desde archivos locales y variables de entorno usando lookups.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">lab-lookups.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Lab — configuración con lookups
  hosts: localhost
  vars:
# Leer clave SSH del operador
ssh_key: "{{ lookup('ansible.builtin.file', '~/.ssh/id_ed25519.pub',
                     errors='ignore') | default('no-key') }}"
# Leer variable de entorno con default
entorno: "{{ lookup('ansible.builtin.env', 'ANSIBLE_ENV') | default('dev') }}"
# Leer listado de archivos de configuración disponibles
configs_disponibles: >-
  {{ query('ansible.builtin.fileglob', 'files/*.conf') }}

  tasks:
- name: Mostrar configuración cargada
  ansible.builtin.debug:
    msg:
      - "Entorno: {{ entorno }}"
      - "Clave SSH: {{ ssh_key[:30] }}..."
      - "Configs encontrados: {{ configs_disponibles | length }}"

- name: Listar archivos de configuración
  ansible.builtin.debug:
    msg: "Config: {{ item | basename }}"
  loop: "{{ configs_disponibles }}"</code></pre>
          </div>
        </div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'lookup plugin',
    definition: 'Plugin de Ansible que se ejecuta en el nodo de control para leer datos de fuentes externas. Se invoca con lookup("plugin", args) o query("plugin", args). No modifica el estado del sistema.',
  },
  {
    term: 'query()',
    definition: 'Función de Ansible similar a lookup() pero que siempre devuelve una lista. Preferida cuando el resultado se usa con loop: porque garantiza el tipo de dato correcto.',
  },
  {
    term: 'lookup("ansible.builtin.password")',
    definition: 'Lookup que genera una contraseña aleatoria y la guarda en un archivo local. En ejecuciones posteriores, devuelve la misma contraseña del archivo. Acepta parámetros length y chars para controlar el formato.',
  },
  {
    term: 'no_log',
    definition: 'Directiva de tarea que suprime el logging del resultado de la tarea. Esencial para tareas que manejan secretos o contraseñas para evitar que aparezcan en logs y output de Ansible.',
  },
],
quiz: [
  {
    question: '¿Cuál es la diferencia entre lookup() y query()?',
    options: [
      'No hay diferencia — son alias del mismo plugin',
      'query() siempre devuelve una lista; lookup() devuelve un string con elementos separados por coma por defecto',
      'lookup() es más rápido que query()',
      'query() solo funciona con fileglob; lookup() con todos los plugins',
    ],
    correctIndex: 1,
    explanation: 'lookup("fileglob", "*.conf") devuelve un string "file1.conf,file2.conf,file3.conf". query("fileglob", "*.conf") devuelve ["file1.conf", "file2.conf", "file3.conf"]. Para usar con loop, necesitás una lista, por eso query() es más apropiado. También podés usar lookup(..., wantlist=True) para obtener lista.',
  },
  {
    question: '¿Dónde se ejecutan los lookup plugins?',
    options: [
      'En el host remoto que se está configurando',
      'En el nodo de control',
      'En un proceso separado de Ansible',
      'En el host remoto si el lookup accede a archivos remotos',
    ],
    correctIndex: 1,
    explanation: 'Los lookup plugins siempre se ejecutan en el nodo de control (donde corrés ansible-playbook). Por eso lookup("file", ruta) lee archivos del sistema de archivos local, y lookup("env", var) lee variables de entorno del proceso local de Ansible. Para acceder a archivos remotos, necesitás el módulo fetch primero.',
  },
  {
    question: '¿Qué hace no_log: true en una tarea que usa lookup("password")?',
    options: [
      'Desactiva el log de Ansible completamente',
      'Suprime el output de la tarea en el resultado para que la contraseña no aparezca en logs',
      'Hace que la contraseña no se guarde en el archivo local',
      'Cifra la contraseña en el log',
    ],
    correctIndex: 1,
    explanation: 'no_log: true hace que Ansible no registre el resultado de la tarea en el output ni en archivos de log. Esencial para tareas que manipulan contraseñas, tokens, o cualquier secreto. Sin él, la contraseña generada por lookup("password") podría aparecer en texto claro en los logs de CI/CD.',
  },
],
troubleshooting: [
  {
    error: 'lookup("ansible.builtin.file", ruta) falla con "could not locate file in lookup"',
    cause: 'La ruta es relativa y no se resuelve correctamente desde el directorio del playbook.',
    fix: 'Usá ruta absoluta o prefijá con playbook_dir: lookup("ansible.builtin.file", playbook_dir + "/files/mi_archivo"). Para rutas del home del usuario, ~ se expande correctamente: lookup("file", "~/.ssh/id_ed25519.pub").',
  },
  {
    error: 'lookup("ansible.builtin.env", VARIABLE) devuelve string vacío',
    cause: 'La variable de entorno no está definida en el proceso que ejecuta Ansible.',
    fix: 'Verificá que la variable está exportada: export VARIABLE=valor. En CI/CD, configurá la variable como variable de entorno del pipeline. Usá default para un fallback: lookup("env", "VAR") | default("valor_default").',
  },
  {
    error: 'query() con fileglob devuelve lista vacía aunque hay archivos',
    cause: 'El patrón glob no coincide con los archivos o la ruta es incorrecta.',
    fix: 'Probá el patrón manualmente en bash: ls files/*.conf. Verificá que estás ejecutando desde el directorio correcto. En el playbook, usá ruta absoluta: query("fileglob", playbook_dir + "/files/*.conf").',
  },
],
realWorldCase: 'Un equipo usa lookups para implementar "configuration as data": todas las claves SSH autorizadas están en files/ssh_keys/*.pub, los certificados SSL en files/certs/*.crt, y los scripts de inicialización en files/init.d/. Con fileglob y loop, el playbook carga automáticamente cualquier archivo que se agregue a esos directorios, sin modificar el playbook mismo.',
  };
