import type { ModuleContent } from '../types';

export const nivel6Mod4: ModuleContent =   {
levelId: 6,
moduleId: 4,
title: 'Precedencia completa de variables',
objective: 'Dominar el orden de precedencia de las 22 fuentes de variables para predecir con certeza qué valor tendrá una variable en cualquier contexto.',
duration: '2 horas',
objectives: [
  'Enumerar las 22 fuentes de variables en orden de menor a mayor precedencia',
  'Predecir qué valor tendrá una variable cuando está definida en múltiples lugares',
  'Saber cuándo usar role defaults vs role vars vs group_vars',
  'Depurar problemas de precedencia con las herramientas de Ansible',
],
prerequisites: [
  'Conocer fuentes de variables: vars_files, group_vars, host_vars, set_fact (módulos anteriores de este nivel)',
  'Haber trabajado con roles básicos (Nivel 5)',
],
steps: [
  {
    title: 'El orden completo de precedencia (menor → mayor)',
    body: `
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>La precedencia de variables es como la cascada en CSS: el estilo más específico y más tardío gana. El role default es como el estilo base del navegador (muy fácil de pisar). Las extra-vars son como el atributo <code>style=""</code> directo en el HTML — siempre ganan, sin excepción.</p>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Las 22 fuentes en orden de menor a mayor precedencia:</strong>
          <ol>
            <li>Role defaults (<code>roles/mi-rol/defaults/main.yml</code>)</li>
            <li>Inventory file group vars</li>
            <li><code>inventory/group_vars/all</code></li>
            <li><code>playbook/group_vars/all</code></li>
            <li><code>inventory/group_vars/*</code> (grupos específicos)</li>
            <li><code>playbook/group_vars/*</code></li>
            <li>Inventory file host vars</li>
            <li><code>inventory/host_vars/*</code></li>
            <li><code>playbook/host_vars/*</code></li>
            <li>Host facts / set_facts cacheados</li>
            <li>Play vars (<code>vars:</code> en el play)</li>
            <li>Play vars_prompt</li>
            <li>Play vars_files</li>
            <li>Role vars (<code>roles/mi-rol/vars/main.yml</code>)</li>
            <li>Block vars</li>
            <li>Task vars (<code>vars:</code> en una tarea)</li>
            <li><code>include_vars</code></li>
            <li>set_facts / registered vars</li>
            <li>Role params / include_role params</li>
            <li>Include params</li>
            <li><strong>Extra vars (<code>-e</code>) — SIEMPRE gana</strong></li>
          </ol>
        </div>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>El error más común:</strong> Definir la misma variable en <code>group_vars/all</code> y en <code>host_vars/mi-host</code> y no entender por qué el host_vars no gana. En realidad sí gana — host_vars tiene mayor precedencia que group_vars. Si no funciona, hay una fuente con precedencia aún mayor que está pisando el valor.</div>
      </div>
    `
  },
  {
    title: 'Role defaults vs role vars — cuándo usar cada uno',
    body: `
      <p>Esta es la distinción más importante para escribir roles reutilizables. <code>defaults/main.yml</code> y <code>vars/main.yml</code> tienen precedencias muy distintas:</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">text</span><span class="code-block-filename">estructura del rol</span></div>
        <pre class="language-text"><code class="language-text">roles/mi-webserver/
├── defaults/
│   └── main.yml   # Precedencia 1 (MUY BAJA) — fácil de sobreescribir
└── vars/
└── main.yml   # Precedencia 14 (ALTA) — difícil de sobreescribir</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/mi-webserver/defaults/main.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# defaults/main.yml — valores que el usuario del rol PUEDE sobreescribir
# en group_vars, host_vars, o al incluir el rol
webserver_port: 80
webserver_worker_processes: "{{ ansible_processor_vcpus | default(2) }}"
webserver_max_clients: 1024
webserver_enable_ssl: false
webserver_document_root: /var/www/html</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/mi-webserver/vars/main.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# vars/main.yml — valores internos del rol que NO deberían cambiar
# Solo pueden sobreescribirse con -e (extra-vars)
_webserver_config_path: /etc/nginx/nginx.conf
_webserver_pid_file: /var/run/nginx.pid
_webserver_log_dir: /var/log/nginx
_webserver_supported_os: ['Debian', 'RedHat']</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Convención de nombres:</strong> Muchos roles usan el prefijo <code>_</code> para variables internas en <code>vars/</code> (como <code>_webserver_config_path</code>) para señalar visualmente "estas no son para que el usuario las modifique". Es una convención, no una restricción técnica.</div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">group_vars/produccion.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# Sobreescribir defaults del rol para producción
# Esto FUNCIONA porque group_vars tiene mayor precedencia que defaults/main.yml
webserver_port: 443
webserver_max_clients: 10000
webserver_enable_ssl: true</code></pre>
      </div>
    `
  },
  {
    title: 'Depurar problemas de precedencia',
    body: `
      <p>Cuando una variable no tiene el valor esperado, necesitás herramientas para ver todas las fuentes que están afectando ese valor.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">debug-precedencia.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Ver todas las variables de un host específico (incluyendo fuentes)
ansible-inventory --host web1 --yaml

# Ver todas las variables combinadas del inventario
ansible-inventory --list --yaml

# Ejecutar playbook en modo verbose para ver variables
ansible-playbook -vv mi-playbook.yml

# Ver solo las variables de un host sin ejecutar tareas
ansible web1 -m debug -a "var=hostvars[inventory_hostname]"

# Ejecutar ad-hoc para ver el valor efectivo de una variable
ansible web1 -m debug -a "msg={{ mi_variable }}"

# Ver si una variable viene de role defaults o de otra fuente
# Agregá una tarea de debug al play:
# - ansible.builtin.debug:
#     msg: "mi_var = {{ mi_variable }} (tipo: {{ mi_variable | type_debug }})"</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">debug-variables.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Depuración de precedencia de variables
  hosts: problematic-host
  tasks:
- name: Ver TODAS las variables del host
  ansible.builtin.debug:
    var: hostvars[inventory_hostname]

- name: Ver solo la variable problemática
  ansible.builtin.debug:
    msg:
      - "Valor: {{ mi_variable | default('NO DEFINIDA') }}"
      - "Tipo: {{ mi_variable | type_debug | default('N/A') }}"

- name: Forzar override con extra-vars (prueba de precedencia)
  # Ejecutar con: ansible-playbook -e "mi_variable=test_value"
  ansible.builtin.debug:
    msg: "Con override: {{ mi_variable }}"</code></pre>
      </div>
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio de precedencia</div>
        <div class="lab-content">
          <p>Experimentá con el siguiente escenario para entender la precedencia:</p>
          <ol>
            <li>Definí <code>mi_var: "desde_group_vars"</code> en <code>group_vars/all.yml</code></li>
            <li>Definí <code>mi_var: "desde_host_vars"</code> en <code>host_vars/web1.yml</code></li>
            <li>Definí <code>mi_var: "desde_play_vars"</code> en <code>vars:</code> del play</li>
            <li>Ejecutá el playbook y observá qué valor gana</li>
            <li>Ahora ejecutalo con <code>-e "mi_var=desde_extra_vars"</code></li>
          </ol>
        </div>
      </div>
    `
  }
],
quiz: [
  {
    question: '¿Cuál tiene mayor precedencia: `role defaults` o `group_vars/all`?',
    options: [
      'Role defaults — porque los roles tienen prioridad',
      'group_vars/all — porque las variables de inventario van después de los defaults del rol',
      'Son iguales en precedencia',
      'Depende de en qué orden se definen en el playbook',
    ],
    correctIndex: 1,
    explanation: 'Role defaults tienen la precedencia más baja (nivel 1) de todas las fuentes. group_vars/all tiene precedencia 3-4. Esto es intencional: los defaults del rol son "valores sugeridos" que cualquier variable de inventario puede sobreescribir.',
  },
  {
    question: 'Un rol define `max_workers: 4` en `vars/main.yml`. El operador ejecuta el playbook con `-e "max_workers=8"`. ¿Cuál gana?',
    options: [
      'vars/main.yml gana porque los vars del rol tienen alta precedencia',
      '-e "max_workers=8" gana porque extra-vars siempre tiene la precedencia máxima',
      'Ansible lanza un error de conflicto de variables',
      'El primero en definirse gana',
    ],
    correctIndex: 1,
    explanation: 'Extra-vars (-e) siempre tiene la precedencia máxima (nivel 22), superando incluso a los vars/main.yml del rol (nivel 14). Esta es la única manera de sobreescribir variables de rol vars desde fuera del rol.',
  },
  {
    question: '¿Por qué se recomienda usar `defaults/main.yml` en lugar de `vars/main.yml` para la mayoría de las variables de un rol?',
    options: [
      'Porque defaults/ carga más rápido',
      'Porque defaults/ tiene precedencia muy baja, lo que permite que los usuarios del rol sobreescriban esos valores fácilmente via group_vars o host_vars',
      'Porque vars/main.yml no soporta Jinja2',
      'No hay diferencia práctica, es solo una convención de nombres',
    ],
    correctIndex: 1,
    explanation: 'defaults/main.yml tiene precedencia 1 (la más baja). Cualquier variable del inventario (group_vars, host_vars) o del play puede pisar esos valores. Eso hace que el rol sea reutilizable: los consumidores del rol pueden adaptar su comportamiento sin modificar el código del rol.',
  },
],
troubleshooting: [
  {
    error: 'Mi variable en host_vars no tiene efecto — el playbook usa el valor de group_vars',
    cause: 'Esto NO debería ocurrir en teoría (host_vars tiene mayor precedencia que group_vars). Puede significar que el valor está siendo sobreescrito por una fuente de precedencia aún mayor: play vars, task vars, set_fact, o role vars.',
    fix: 'Ejecutá el playbook con `-vv` y buscá qué fuente está definiendo la variable. Usá `ansible.builtin.debug: var: hostvars[inventory_hostname]` para ver el valor efectivo y rastrear el origen.',
  },
  {
    error: 'Variable definida en role vars/main.yml no puede sobreescribirse desde group_vars',
    cause: 'Correcto por diseño: role vars (precedencia 14) tiene mayor prioridad que group_vars (precedencia 3-6). Esto es intencional para variables internas del rol.',
    fix: 'Si necesitás que los consumidores del rol puedan sobreescribir esa variable, moverla a defaults/main.yml. Si el valor necesita ser configurable pero con mayor control, aceptarlo como parámetro del rol via `roles:` en el play.',
  },
  {
    error: 'extra-vars (-e) no pisa una variable en ciertos contextos',
    cause: 'Muy raro, pero puede ocurrir con variables definidas con set_fact en versiones muy antiguas de Ansible o con algunos comportamientos de include_vars.',
    fix: 'En Ansible moderno (2.8+), -e siempre tiene la precedencia máxima. Actualizá Ansible. Si el problema persiste, verificá que no haya un set_fact posterior que esté sobreescribiendo el valor de -e.',
  },
],
  };
