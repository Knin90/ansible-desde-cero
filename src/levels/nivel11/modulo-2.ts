import type { ModuleContent } from '../types';

export const nivel11Mod2: ModuleContent =   {
levelId: 11,
moduleId: 2,
title: 'dict2items y subelements',
objective: 'Iterar sobre diccionarios y estructuras anidadas usando dict2items, items2dict y subelements para manejar datos complejos en loops.',
duration: '1.5 horas',
objectives: [
  'Convertir diccionarios a listas iterables con dict2items',
  'Reconstruir diccionarios desde listas con items2dict',
  'Iterar sobre estructuras padre-hijo con subelements',
  'Usar selectattr y map para filtrar y transformar antes de iterar',
],
prerequisites: [
  'Dominar loop básico con listas (Módulo 1 de este nivel)',
  'Conocer filtros Jinja2 básicos (Nivel 9)',
  'Entender diccionarios y listas anidadas en YAML',
],
steps: [
  {
    title: 'dict2items — convertir diccionarios en listas iterables',
    body: `
      <p>Los diccionarios no se pueden iterar directamente con <code>loop</code>. El filtro <code>dict2items</code> los convierte en una lista de objetos con campos <code>key</code> y <code>value</code>.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">dict2items.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">vars:
  versiones_paquetes:
nginx: "1.24.0"
postgresql: "15.3"
redis: "7.0.12"

  variables_entorno:
APP_ENV: produccion
APP_PORT: "8080"
APP_DEBUG: "false"
DATABASE_URL: "postgres://user:pass@db:5432/myapp"

tasks:
  # Iterar sobre dict — cada item tiene .key y .value
  - name: Mostrar versiones a instalar
ansible.builtin.debug:
  msg: "Instalando {{ item.key }} versión {{ item.value }}"
loop: "{{ versiones_paquetes | dict2items }}"

  # Usar dict2items para crear archivo .env
  - name: Escribir variables de entorno en archivo
ansible.builtin.lineinfile:
  path: /opt/mi-app/.env
  line: '{{ item.key }}="{{ item.value }}"'
  regexp: "^{{ item.key }}="
  create: true
loop: "{{ variables_entorno | dict2items }}"

  # Nombres de clave personalizados para mayor claridad
  - name: Configurar nginx upstreams
ansible.builtin.template:
  src: upstream.conf.j2
  dest: "/etc/nginx/conf.d/{{ item.nombre }}.conf"
loop: >
  {{
    upstreams | dict2items(key_name='nombre', value_name='config')
  }}
vars:
  upstreams:
    frontend:
      servers: ["10.0.1.10:3000", "10.0.1.11:3000"]
      weight: 1
    backend:
      servers: ["10.0.2.10:8080"]
      weight: 3

  # Filtrar solo algunos items del dict antes de iterar
  - name: Solo paquetes de versión mayor a 7
ansible.builtin.debug:
  msg: "{{ item.key }}: {{ item.value }}"
loop: >
  {{
    versiones_paquetes | dict2items |
    selectattr('value', 'version_compare', '7', '>=') |
    list
  }}</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>items2dict:</strong> El filtro inverso es <code>items2dict</code>. Convierte una lista de objetos con key/value de vuelta a un diccionario. Útil cuando transformás datos de un loop y querés el resultado como dict.</div>
      </div>
    `
  },
  {
    title: 'subelements — iterar sobre estructuras padre-hijo',
    body: `
      <p><code>subelements</code> genera el producto cartesiano entre una lista de objetos padre y la sublista de cada uno. Perfecto para relaciones "un usuario tiene muchas claves SSH", "un servidor tiene muchos discos".</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">subelements.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">vars:
  usuarios:
- nombre: juan
  uid: 1001
  claves_ssh:
    - "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5... juan@laptop"
    - "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5... juan@trabajo"
- nombre: maria
  uid: 1002
  claves_ssh:
    - "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5... maria@laptop"
- nombre: deploy
  uid: 1100
  claves_ssh: []   # Sin claves SSH

tasks:
  # item.0 = objeto padre (usuario completo)
  # item.1 = elemento hijo (una clave SSH individual)
  - name: Agregar todas las claves SSH de todos los usuarios
ansible.posix.authorized_key:
  user: "{{ item.0.nombre }}"
  key: "{{ item.1 }}"
  state: present
loop: "{{ usuarios | subelements('claves_ssh') }}"
# Itera: [juan, clave1], [juan, clave2], [maria, clave1]
# Deploy tiene claves_ssh=[] así que se salta — 0 iteraciones para él

  # Gestionar discos adicionales de servidores
  - name: Formatear discos extra
ansible.builtin.filesystem:
  fstype: ext4
  dev: "{{ item.1.dispositivo }}"
loop: "{{ servidores | subelements('discos_extra') }}"
vars:
  servidores:
    - nombre: db-01
      discos_extra:
        - dispositivo: /dev/sdb
          mountpoint: /var/lib/postgresql
        - dispositivo: /dev/sdc
          mountpoint: /var/lib/postgresql/wal
    - nombre: web-01
      discos_extra: []   # No tiene discos extra

  # Acceder a campos del padre desde el hijo
  - name: Montar discos
ansible.posix.mount:
  path: "{{ item.1.mountpoint }}"
  src: "{{ item.1.dispositivo }}"
  fstype: ext4
  state: mounted
loop: "{{ servidores | subelements('discos_extra') }}"
when: item.1.dispositivo is defined
vars:
  servidores: "{{ hostvars | dict2items | ... }}"</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Listas vacías:</strong> Si un objeto padre tiene la sublista vacía <code>[]</code>, subelements simplemente no genera iteraciones para ese padre — no falla. Podés controlar este comportamiento con el segundo argumento: <code>subelements('campo', skip_missing=True)</code> para saltar objetos sin el campo.</div>
      </div>
    `
  },
  {
    title: 'product y zip — combinaciones avanzadas',
    body: `
      <p>Para generar combinaciones entre múltiples listas independientes, usás <code>product</code> (producto cartesiano) o <code>zip</code> (emparejamiento posicional).</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">product-zip.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">tasks:
  # product: todas las combinaciones posibles
  # [usuario1,dev] [usuario1,docker] [usuario2,dev] [usuario2,docker]
  - name: Agregar usuarios a todos sus grupos
ansible.builtin.user:
  name: "{{ item.0 }}"
  groups: "{{ item.1 }}"
  append: true
loop: "{{ ['alice', 'bob'] | product(['developers', 'docker']) | list }}"

  # Crear estructura de directorios por entorno y componente
  - name: Crear directorios por entorno
ansible.builtin.file:
  path: "/opt/{{ item.0 }}/{{ item.1 }}"
  state: directory
  mode: '0755'
loop: "{{ entornos | product(componentes) | list }}"
vars:
  entornos: [dev, staging, produccion]
  componentes: [logs, data, config, tmp]

  # zip: emparejar posicionalmente (el primero con el primero, etc.)
  - name: Configurar /etc/hosts con nombres e IPs
ansible.builtin.lineinfile:
  path: /etc/hosts
  line: "{{ item.1 }}  {{ item.0 }}"
  regexp: "{{ item.0 }}$"
loop: "{{ nombres | zip(ips) | list }}"
vars:
  nombres: [web-01, web-02, db-01]
  ips: ["10.0.1.10", "10.0.1.11", "10.0.2.10"]

  # zip con tres listas
  - name: Configurar proxies con nombre, ip y puerto
ansible.builtin.template:
  src: proxy.conf.j2
  dest: "/etc/haproxy/{{ item.0 }}.cfg"
loop: "{{ nombres | zip(ips, puertos) | list }}"
vars:
  nombres: [frontend, api, admin]
  ips: ["10.0.1.10", "10.0.1.11", "10.0.1.12"]
  puertos: [3000, 8080, 9000]</code></pre>
      </div>
    `
  },
],
glossary: [
  {
    term: 'dict2items',
    definition: 'Filtro Jinja2 que convierte un diccionario en una lista de objetos con campos "key" y "value". Permite iterar sobre diccionarios con loop. Acepta parámetros key_name y value_name para cambiar los nombres de los campos.',
  },
  {
    term: 'subelements',
    definition: 'Filtro Jinja2 que genera el producto cartesiano entre una lista de objetos padre y la sublista de cada uno. En cada iteración, item.0 es el padre e item.1 es el elemento hijo.',
  },
  {
    term: 'product',
    definition: 'Filtro Jinja2 que genera todas las combinaciones posibles entre dos o más listas (producto cartesiano matemático). Requiere | list al final para convertir el generador en lista.',
  },
  {
    term: 'zip',
    definition: 'Filtro Jinja2 que empareja elementos de múltiples listas por posición. El resultado tiene tantos elementos como la lista más corta. Requiere | list al final.',
  },
],
quiz: [
  {
    question: 'Si tenés un diccionario vars: {a: 1, b: 2, c: 3} y querés iterarlo con loop, ¿qué hacés?',
    options: [
      'loop: "{{ vars }}" directamente',
      'loop: "{{ vars | dict2items }}" y accedés con item.key e item.value',
      'with_dict: "{{ vars }}"',
      'loop: "{{ vars.keys() | list }}"',
    ],
    correctIndex: 1,
    explanation: 'dict2items convierte el diccionario en una lista de objetos [{key: "a", value: 1}, {key: "b", value: 2}, ...]. Esto permite usar loop y acceder a item.key para la clave e item.value para el valor. with_dict también funciona pero es legacy.',
  },
  {
    question: '¿Qué contiene item.0 e item.1 cuando usás subelements?',
    options: [
      'item.0 es el índice de la iteración e item.1 es el elemento',
      'item.0 es el objeto padre completo e item.1 es el elemento de la sublista',
      'item.0 es el primer campo del objeto e item.1 el segundo',
      'Son índices de dos listas separadas como en zip',
    ],
    correctIndex: 1,
    explanation: 'Con subelements, para cada iteración item.0 contiene el objeto padre completo (con todos sus campos) e item.1 contiene un elemento individual de la sublista especificada. Esto permite acceder a campos del padre (item.0.nombre) y al elemento hijo (item.1) en la misma tarea.',
  },
  {
    question: '¿Cuándo usarías product en lugar de subelements?',
    options: [
      'Cuando las listas tienen diferente longitud',
      'Cuando querés todas las combinaciones posibles entre listas independientes, sin relación padre-hijo',
      'Cuando necesitás iterar sobre un solo diccionario',
      'product y subelements son equivalentes',
    ],
    correctIndex: 1,
    explanation: 'product es para listas independientes donde querés todas las combinaciones: usuarios × grupos, entornos × componentes. subelements es para cuando cada padre tiene su propia sublista asociada: cada usuario tiene sus propias claves SSH, no se combinan con las de otros usuarios.',
  },
],
troubleshooting: [
  {
    error: 'Error al iterar con dict2items: "object is not iterable"',
    cause: 'La variable pasada a dict2items es None o no existe en ese scope.',
    fix: 'Verificá que la variable está definida antes de usar dict2items: when: mi_dict is defined and mi_dict | length > 0. Alternativamente, usá un default: loop: "{{ mi_dict | default({}) | dict2items }}".',
  },
  {
    error: 'subelements falla con "field not found" aunque el campo existe en algunos objetos',
    cause: 'Algunos objetos padre no tienen el campo de la sublista definido.',
    fix: 'Usá skip_missing=True: "{{ lista | subelements(\'campo\', skip_missing=True) }}". Esto hace que subelements omita objetos que no tienen el campo en lugar de fallar.',
  },
  {
    error: 'product genera el doble de combinaciones esperadas',
    cause: 'Se pasaron las listas en orden incorrecto, o una de las variables contiene duplicados.',
    fix: 'Verificá las listas con debug antes del loop. Asegurate de que no hay duplicados con: lista | unique | list. El número de iteraciones de product es siempre len(lista1) × len(lista2).',
  },
],
realWorldCase: 'Una empresa de hosting usa subelements para gestionar claves SSH de 200 usuarios en 50 servidores. Cada usuario tiene entre 1 y 5 claves (laptop, trabajo, emergencia). Un solo playbook con subelements gestiona las ~500 combinaciones únicas usuario-clave, manteniéndolas sincronizadas cuando los usuarios agregan o revocan claves.',
  };
