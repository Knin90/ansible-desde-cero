import type { ModuleContent } from '../types';

export const nivel11Mod1: ModuleContent =   {
levelId: 11,
moduleId: 1,
title: 'loop básico',
objective: 'Dominar loop para iterar sobre listas simples y diccionarios, registrar resultados de iteraciones, y entender la migración desde with_items.',
duration: '2 horas',
objectives: [
  'Usar loop con listas simples, listas de diccionarios y variables',
  'Registrar resultados de loop y acceder al campo results[]',
  'Entender la diferencia entre loop y with_items y cuándo usar cada uno',
  'Usar loop con include_tasks para tareas complejas por iteración',
  'Filtrar y transformar datos antes de pasarlos a loop',
],
prerequisites: [
  'Conocer variables de Ansible y tipos de datos YAML (listas, dicts)',
  'Haber usado register para capturar resultados de tareas',
  'Entender módulos básicos: file, package, user, service',
],
steps: [
  {
    title: '¿Qué es loop y cómo funciona?',
    body: `
      <p>El parámetro <code>loop</code> convierte una tarea en un bucle: Ansible ejecuta la tarea una vez por cada elemento de la lista. El elemento actual está disponible como <code>{{ item }}</code>.</p>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Imaginá que tenés una plantilla de carta y una lista de direcciones. En lugar de copiar la carta 10 veces cambiando la dirección, usás un loop: la misma tarea (carta) se ejecuta para cada dirección (elemento). Ansible hace esto internamente para cada item.</p>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">loop-basico.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Ejemplos de loop básico
  hosts: all
  tasks:
# Lista inline — más compacto para listas cortas
- name: Instalar paquetes básicos
  ansible.builtin.package:
    name: "{{ item }}"
    state: present
  loop: [nginx, curl, git, vim, htop]

# Lista multilínea — más legible para listas largas
- name: Crear estructura de directorios
  ansible.builtin.file:
    path: "{{ item }}"
    state: directory
    mode: '0755'
    owner: deploy
    group: deploy
  loop:
    - /opt/mi-app
    - /opt/mi-app/logs
    - /opt/mi-app/data
    - /opt/mi-app/config
    - /opt/mi-app/tmp

# Lista de diccionarios — cada item es un objeto con múltiples campos
- name: Crear usuarios del sistema
  ansible.builtin.user:
    name: "{{ item.nombre }}"
    shell: "{{ item.shell }}"
    groups: "{{ item.grupos }}"
    state: present
  loop:
    - nombre: deploy
      shell: /usr/sbin/nologin
      grupos: "www-data,docker"
    - nombre: monitoreo
      shell: /bin/bash
      grupos: "adm,syslog"
    - nombre: backup
      shell: /usr/sbin/nologin
      grupos: "tape"

# Loop desde variable — más mantenible que listas inline
- name: Crear archivos de configuración
  ansible.builtin.template:
    src: "{{ item.src }}"
    dest: "{{ item.dest }}"
    owner: root
    mode: '0644'
  loop: "{{ configuraciones }}"
  vars:
    configuraciones:
      - src: nginx.conf.j2
        dest: /etc/nginx/nginx.conf
      - src: app.conf.j2
        dest: /etc/mi-app/app.conf
      - src: logrotate.j2
        dest: /etc/logrotate.d/mi-app</code></pre>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>loop vs with_items:</strong> <code>with_items</code> (legacy) aplana automáticamente listas anidadas antes de iterar. <code>loop</code> no aplana nada — lo que ponés es lo que itera. Esto hace <code>loop</code> más predecible y es el estándar actual desde Ansible 2.5.
        </div>
      </div>
    `
  },
  {
    title: 'register con loop — el campo results[]',
    body: `
      <p>Cuando combinás <code>register</code> con <code>loop</code>, la variable registrada no tiene directamente los campos habituales. Tiene un campo especial <code>results</code> que es una lista con el resultado de cada iteración.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">loop-register.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">tasks:
  # Verificar estado de múltiples servicios
  - name: Verificar servicios críticos
ansible.builtin.command: "systemctl is-active {{ item }}"
loop: [nginx, postgresql, redis, memcached]
register: servicios_estado
changed_when: false
ignore_errors: true

  # servicios_estado.results es una lista de resultados
  # cada resultado tiene: item, rc, stdout, stderr, changed, etc.
  - name: Mostrar resumen de servicios
ansible.builtin.debug:
  msg: >
    {{ item.item }}: {{ 'ACTIVO' if item.rc == 0 else 'CAÍDO' }}
loop: "{{ servicios_estado.results }}"

  - name: Alertar sobre servicios caídos
ansible.builtin.debug:
  msg: "ALERTA: El servicio {{ item.item }} está caído!"
loop: "{{ servicios_estado.results }}"
when: item.rc != 0

  # Contar cuántos servicios están caídos
  - name: Contar servicios caídos
ansible.builtin.debug:
  msg: >
    {{ servicios_estado.results | selectattr('rc', 'ne', 0) | list | length }}
    de {{ servicios_estado.results | length }} servicios están caídos

  # Ejemplo más complejo: crear usuarios y capturar sus IDs
  - name: Crear usuarios de base de datos
community.postgresql.postgresql_user:
  name: "{{ item.nombre }}"
  password: "{{ item.pass }}"
  state: present
loop: "{{ db_users }}"
register: db_results
vars:
  db_users:
    - nombre: api_user
      pass: "{{ vault_api_pass }}"
    - nombre: readonly_user
      pass: "{{ vault_ro_pass }}"

  - name: Reportar usuarios creados vs existentes
ansible.builtin.debug:
  msg: >
    {{ item.item.nombre }}:
    {{ 'CREADO' if item.changed else 'ya existía' }}
loop: "{{ db_results.results }}"</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>results vs stdout directo:</strong> Con loop, <code>servicios_estado.stdout</code> no existe. Debés iterar sobre <code>servicios_estado.results</code> y acceder a <code>item.stdout</code> en cada elemento. Confundir esto es el error más común al usar register con loop.</div>
      </div>
    `
  },
  {
    title: 'Loop con include_tasks y with_items legacy',
    body: `
      <p>Para tareas complejas por iteración, podés combinar <code>loop</code> con <code>include_tasks</code>. Para entender código heredado, también necesitás conocer los lookups <code>with_*</code>.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">loop-include.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">tasks:
  # Loop con include_tasks — útil cuando hay múltiples tareas por item
  - name: Configurar cada aplicación
ansible.builtin.include_tasks: configurar_app.yml
loop: "{{ aplicaciones }}"
loop_control:
  loop_var: app   # Renombrar item para evitar conflictos internos
vars:
  aplicaciones:
    - nombre: frontend
      puerto: 3000
      repo: "https://github.com/empresa/frontend"
    - nombre: backend
      puerto: 8080
      repo: "https://github.com/empresa/backend"

# En configurar_app.yml, usás {{ app.nombre }}, {{ app.puerto }}, etc.
# El archivo puede tener sus propios loops usando 'item' sin conflicto</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">with-items-legacy.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml"># LEGACY — with_items (equivalente pero deprecated)
# Entenderlo te ayuda a leer playbooks viejos

# with_items aplana listas anidadas — COMPORTAMIENTO DISTINTO a loop
- name: with_items con lista plana (idéntico a loop)
  ansible.builtin.debug:
msg: "{{ item }}"
  with_items: [a, b, c]

# with_dict — iterar sobre diccionario (clave/valor)
# Equivalente moderno: loop con dict2items
- name: with_dict (legacy)
  ansible.builtin.debug:
msg: "{{ item.key }} = {{ item.value }}"
  with_dict:
app_env: produccion
app_port: "8080"

# Equivalente moderno con loop:
- name: dict2items (moderno)
  ansible.builtin.debug:
msg: "{{ item.key }} = {{ item.value }}"
  loop: "{{ {'app_env': 'produccion', 'app_port': '8080'} | dict2items }}"</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Migración de with_items a loop:</strong> Para la mayoría de los casos, reemplazar <code>with_items</code> por <code>loop</code> es directo. La diferencia es el aplanamiento: si tenés <code>with_items: [[a, b], [c, d]]</code>, con loop recibirás listas como items, con with_items recibirías a, b, c, d por separado.</div>
      </div>
    `
  },
  {
    title: 'Laboratorio: aprovisionamiento de usuarios',
    body: `
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio</div>
        <div class="lab-content">
          <p><strong>Objetivo:</strong> Crear un playbook que aprovisione usuarios con sus directorios y claves SSH usando loop.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">lab-usuarios.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Lab — aprovisionamiento de usuarios
  hosts: localhost
  vars:
usuarios:
  - nombre: alice
    grupos: developers
    shell: /bin/bash
  - nombre: bob
    grupos: operators
    shell: /bin/bash
  - nombre: ci-runner
    grupos: docker
    shell: /usr/sbin/nologin

  tasks:
- name: Crear usuarios
  ansible.builtin.user:
    name: "{{ item.nombre }}"
    groups: "{{ item.grupos }}"
    shell: "{{ item.shell }}"
    state: present
    create_home: true
  loop: "{{ usuarios }}"
  register: usuarios_creados

- name: Crear directorio .ssh para cada usuario
  ansible.builtin.file:
    path: "/home/{{ item.item.nombre }}/.ssh"
    state: directory
    mode: '0700'
    owner: "{{ item.item.nombre }}"
  loop: "{{ usuarios_creados.results }}"

- name: Reporte de aprovisionamiento
  ansible.builtin.debug:
    msg: >
      Usuario {{ item.item.nombre }}:
      {{ 'CREADO' if item.changed else 'ya existía' }}
  loop: "{{ usuarios_creados.results }}"</code></pre>
          </div>
        </div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'loop',
    definition: 'Parámetro de tarea en Ansible que acepta una lista y ejecuta la tarea una vez por cada elemento. El elemento actual está disponible como {{ item }}. Reemplaza al legacy with_items.',
  },
  {
    term: 'item',
    definition: 'Variable especial disponible dentro de una tarea con loop que contiene el elemento actual de la iteración. Puede ser un string, número, diccionario u objeto complejo según la lista del loop.',
  },
  {
    term: 'results[]',
    definition: 'Campo especial en la variable registrada cuando se combina register con loop. Es una lista donde cada elemento contiene el resultado completo (rc, stdout, stderr, changed, item) de cada iteración del loop.',
  },
  {
    term: 'with_items',
    definition: 'Lookup plugin legacy de Ansible, equivalente a loop pero con comportamiento de aplanamiento automático de listas anidadas. Deprecado desde Ansible 2.5 en favor de loop.',
  },
],
quiz: [
  {
    question: '¿Cómo accedés a la salida stdout de la segunda iteración de un loop con register?',
    options: [
      'resultado.stdout[1]',
      'resultado.results[1].stdout',
      'resultado[1].stdout',
      'resultado.stdout_lines[1]',
    ],
    correctIndex: 1,
    explanation: 'Con register + loop, la variable tiene un campo "results" que es una lista con el resultado de cada iteración en orden. El resultado de la segunda iteración está en results[1], y dentro de ese objeto encontrás stdout, rc, stderr, item y changed.',
  },
  {
    question: '¿Cuál es la diferencia principal entre loop y with_items?',
    options: [
      'loop es más rápido que with_items',
      'with_items aplana listas anidadas automáticamente; loop no',
      'loop solo funciona con strings; with_items funciona con cualquier tipo',
      'No hay diferencia funcional',
    ],
    correctIndex: 1,
    explanation: 'with_items aplana automáticamente un nivel de listas anidadas: con_items: [[a,b],[c,d]] resultará en a, b, c, d como items separados. loop: [[a,b],[c,d]] iterará sobre [a,b] y [c,d] como listas completas. Esta diferencia es sutil pero importante al migrar playbooks legacy.',
  },
  {
    question: '¿Por qué usarías loop con include_tasks en lugar de poner directamente las tareas en el loop?',
    options: [
      'include_tasks es más rápido',
      'Cuando cada iteración requiere ejecutar múltiples tareas o lógica compleja que sería difícil de mantener inline',
      'loop no funciona directamente con módulos de Ansible',
      'include_tasks permite usar variables que loop no soporta',
    ],
    correctIndex: 1,
    explanation: 'Cuando cada iteración de un loop necesita ejecutar 3, 5 o 10 tareas relacionadas, incluirlas todas inline crea playbooks difíciles de leer. include_tasks permite organizar esas tareas en un archivo separado, manteniendo el playbook principal limpio y el archivo incluido enfocado en una responsabilidad.',
  },
],
troubleshooting: [
  {
    error: 'Error: "item" is undefined al usar register con loop',
    cause: 'Se está accediendo a resultado.item directamente en lugar de iterar sobre resultado.results.',
    fix: 'Con register + loop, la estructura es: resultado.results es una lista, y cada elemento de esa lista tiene .item (el elemento del loop), .stdout, .rc, etc. Iterar: loop: "{{ resultado.results }}" y usar item.item para el elemento original.',
  },
  {
    error: 'El loop itera sobre los caracteres individuales de un string en lugar del string completo',
    cause: 'Se pasó un string directamente a loop en lugar de una lista. Ansible itera sobre los caracteres del string.',
    fix: 'Asegurate de que la variable sea una lista YAML. En group_vars usa el formato de lista: variable: [item1, item2]. Si viene de un filter, terminá la cadena con | list para forzar el tipo lista.',
  },
  {
    error: 'loop con with_items migrado aplana incorrectamente datos anidados',
    cause: 'with_items aplanaba una lista de listas; al migrar a loop el comportamiento cambia y cada elemento es una lista completa en lugar de un valor individual.',
    fix: 'Si tu lista es [[a,b],[c,d]] y querés iterar a, b, c, d por separado, usá: loop: "{{ lista | flatten(1) }}". El filtro flatten(1) aplana exactamente un nivel, replicando el comportamiento de with_items.',
  },
],
realWorldCase: 'Un equipo de operaciones tenía 50 playbooks con tareas duplicadas para instalar paquetes, crear usuarios y configurar servicios. Refactorizaron usando loop con diccionarios de configuración, reduciendo el número de playbooks a 15 y moviendo los datos a archivos group_vars. El tiempo de mantenimiento bajó un 70% porque cambiar una configuración ahora requiere editar un archivo de datos, no buscar en múltiples playbooks.',
  };
