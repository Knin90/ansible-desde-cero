import type { ModuleContent } from '../types';

export const nivel11Mod3: ModuleContent =   {
levelId: 11,
moduleId: 3,
title: 'product, zip y cartesian',
objective: 'Generar combinaciones y pares de elementos de múltiples listas para loops avanzados, y dominar with_sequence y with_fileglob para casos específicos.',
duration: '1 hora',
objectives: [
  'Usar with_sequence para generar secuencias numéricas',
  'Usar with_fileglob para iterar sobre archivos del sistema de archivos',
  'Entender y evitar loops anidados con product',
  'Transformar y filtrar listas con selectattr, map y reject antes de iterar',
],
prerequisites: [
  'Dominar loop básico y dict2items (Módulos 1 y 2 de este nivel)',
  'Conocer filtros Jinja2 de listas (Nivel 9)',
],
steps: [
  {
    title: 'with_sequence — generación de secuencias numéricas',
    body: `
      <p><code>with_sequence</code> genera una secuencia numérica o alfanumérica sin necesidad de definir la lista manualmente. Ideal para crear múltiples recursos numerados.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">with-sequence.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">tasks:
  # Crear 5 particiones con nombre numerado
  - name: Crear directorios numerados
ansible.builtin.file:
  path: "/data/shard-{{ item }}"
  state: directory
with_sequence: start=1 end=5
# Crea: /data/shard-1, shard-2, shard-3, shard-4, shard-5

  # Con formato de padding (ceros a la izquierda)
  - name: Crear workers numerados con padding
ansible.builtin.file:
  path: "/opt/workers/worker-{{ item }}"
  state: directory
with_sequence: start=1 end=10 format="%02d"
# Crea: worker-01, worker-02, ..., worker-10

  # Equivalente moderno con loop y range
  - name: Crear directorios con range (moderno)
ansible.builtin.file:
  path: "/data/shard-{{ item }}"
  state: directory
loop: "{{ range(1, 6) | list }}"

  # Con step
  - name: Configurar puertos en secuencia
ansible.builtin.debug:
  msg: "Puerto disponible: {{ item }}"
with_sequence: start=8080 end=8090 stride=2
# Genera: 8080, 8082, 8084, 8086, 8088, 8090</code></pre>
      </div>
    `
  },
  {
    title: 'with_fileglob — iterar sobre archivos del sistema',
    body: `
      <p><code>with_fileglob</code> itera sobre archivos del nodo de control que coinciden con un patrón glob. Útil para desplegar múltiples archivos de configuración o templates.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">with-fileglob.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">tasks:
  # Copiar todos los archivos de configuración nginx
  - name: Copiar configuraciones nginx
ansible.builtin.copy:
  src: "{{ item }}"
  dest: "/etc/nginx/conf.d/{{ item | basename }}"
  owner: root
  mode: '0644'
with_fileglob: "files/nginx/*.conf"
notify: Recargar nginx

  # Copiar todos los templates de un directorio
  - name: Procesar todos los templates
ansible.builtin.template:
  src: "{{ item }}"
  dest: "/etc/mi-app/{{ item | basename | regex_replace('\\.j2$', '') }}"
with_fileglob: "templates/mi-app/*.j2"

  # Equivalente moderno con query y loop
  - name: Copiar configs con loop moderno
ansible.builtin.copy:
  src: "{{ item }}"
  dest: "/etc/nginx/conf.d/{{ item | basename }}"
loop: "{{ query('ansible.builtin.fileglob', 'files/nginx/*.conf') }}"</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>with_fileglob corre en el nodo de control:</strong> El patrón glob se resuelve en la máquina desde donde corrés Ansible, no en el host remoto. Si necesitás iterar sobre archivos del host remoto, usá find + register + loop.</div>
      </div>
    `
  },
  {
    title: 'Transformaciones antes del loop: selectattr, map, reject',
    body: `
      <p>Frecuentemente necesitás filtrar o transformar una lista antes de iterar. Jinja2 ofrece <code>selectattr</code>, <code>map</code> y <code>reject</code> para estas operaciones.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">transformar-listas.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">vars:
  servicios:
- nombre: nginx
  activo: true
  puerto: 80
- nombre: mysql
  activo: false
  puerto: 3306
- nombre: redis
  activo: true
  puerto: 6379
- nombre: memcached
  activo: true
  puerto: 11211

tasks:
  # selectattr: filtrar objetos por atributo
  - name: Iniciar solo servicios activos
ansible.builtin.service:
  name: "{{ item.nombre }}"
  state: started
loop: "{{ servicios | selectattr('activo', 'equalto', true) | list }}"

  # selectattr con test is: filtrar donde atributo es verdadero
  - name: Servicios activos en puertos > 1024
ansible.builtin.debug:
  msg: "{{ item.nombre }}:{{ item.puerto }}"
loop: >
  {{
    servicios |
    selectattr('activo') |
    selectattr('puerto', 'gt', 1024) |
    list
  }}

  # map: extraer un campo de una lista de objetos
  - name: Abrir puertos en firewall
ansible.posix.firewalld:
  port: "{{ item }}/tcp"
  state: enabled
  permanent: true
loop: >
  {{
    servicios |
    selectattr('activo') |
    map(attribute='puerto') |
    list
  }}

  # reject: excluir elementos que cumplen una condición
  - name: Todos los servicios excepto base de datos
ansible.builtin.debug:
  msg: "{{ item.nombre }}"
loop: >
  {{
    servicios |
    reject('search', 'sql') |
    list
  }}</code></pre>
      </div>
    `
  },
],
glossary: [
  {
    term: 'with_sequence',
    definition: 'Lookup plugin de Ansible que genera una secuencia numérica para usar en loops. Acepta start, end, stride (paso) y format (formato del output). Equivalente moderno: loop con range().',
  },
  {
    term: 'with_fileglob',
    definition: 'Lookup plugin que itera sobre archivos del nodo de control que coinciden con un patrón glob (comodines). Útil para copiar todos los archivos de un directorio. El glob se resuelve localmente, no en el host remoto.',
  },
  {
    term: 'selectattr',
    definition: 'Filtro Jinja2 que filtra una lista de objetos según el valor de un atributo. Sintaxis: lista | selectattr(\'campo\', \'operador\', valor). Con solo el campo: selectattr(\'campo\') filtra objetos donde el campo es truthy.',
  },
  {
    term: 'map(attribute=)',
    definition: 'Filtro Jinja2 que extrae un campo específico de cada objeto de una lista. Transforma una lista de objetos en una lista de valores de un campo: lista | map(attribute=\'nombre\') | list.',
  },
],
quiz: [
  {
    question: '¿Dónde se resuelve el patrón glob en with_fileglob?',
    options: [
      'En el host remoto que se está configurando',
      'En el nodo de control desde donde se ejecuta Ansible',
      'En el nodo de control si el path es relativo, en el host si es absoluto',
      'Depende del módulo que usa el with_fileglob',
    ],
    correctIndex: 1,
    explanation: 'with_fileglob siempre resuelve el patrón en el nodo de control (la máquina donde corrés ansible-playbook). Si necesitás iterar sobre archivos en el host remoto, debés usar el módulo find para obtener la lista de archivos y luego registrar ese resultado para usarlo en un loop.',
  },
  {
    question: '¿Qué hace selectattr("activo") sin operador en una lista de objetos?',
    options: [
      'Falla porque falta el operador',
      'Filtra objetos donde el campo "activo" es truthy (no vacío, no false, no null)',
      'Selecciona el campo "activo" de todos los objetos',
      'Ordena la lista por el campo "activo"',
    ],
    correctIndex: 1,
    explanation: 'Cuando selectattr recibe solo el nombre del atributo sin operador y valor, funciona como un test de truthiness: filtra y devuelve solo los objetos donde el campo especificado tiene un valor truthy (true, número no cero, string no vacío). Es equivalente a selectattr("activo", "equalto", true) para booleanos.',
  },
  {
    question: '¿Cómo extraerías solo los nombres de una lista de diccionarios con campo "nombre"?',
    options: [
      'lista | dict2items | map(attribute="nombre") | list',
      'lista | select("nombre") | list',
      'lista | map(attribute="nombre") | list',
      'lista | extract("nombre") | list',
    ],
    correctIndex: 2,
    explanation: 'El filtro map(attribute="campo") extrae el valor del campo especificado de cada objeto en la lista, devolviendo una lista plana de valores. Requiere | list al final para materializar el generador. Es el equivalente Jinja2 de [obj["nombre"] for obj in lista] en Python.',
  },
],
troubleshooting: [
  {
    error: 'with_fileglob no encuentra archivos aunque existen en el directorio',
    cause: 'La ruta del patrón glob es relativa y no coincide con el directorio actual. Ansible resuelve rutas relativas desde el directorio del playbook.',
    fix: 'Usá la ruta relativa al archivo de playbook, o usá el módulo lookup con ruta absoluta: loop: "{{ query(\'ansible.builtin.fileglob\', playbook_dir + \'/files/*.conf\') }}".',
  },
  {
    error: 'selectattr devuelve lista vacía aunque hay objetos con el atributo',
    cause: 'El operador o el valor usado en selectattr no coincide con el tipo real del atributo. Por ejemplo, comparar string "true" con booleano true.',
    fix: 'Verificá el tipo del atributo con debug. Para booleanos usa equalto True/False (mayúsculas en Python). Para strings usa "equalto", "match" o "search". Para números usa "gt", "lt", "ge", "le".',
  },
  {
    error: 'range() en loop genera KeyError o el loop no itera',
    cause: 'range() devuelve un objeto de tipo range que algunos filtros de Ansible no reconocen directamente.',
    fix: 'Siempre convertí range() a lista: loop: "{{ range(1, 11) | list }}". El | list es obligatorio para materializar el generador de range.',
  },
],
realWorldCase: 'Un equipo de seguridad usa with_fileglob para desplegar automáticamente nuevas reglas de auditoría. Cuando agregan un nuevo archivo .rules en files/audit/, el playbook lo detecta y lo despliega en todos los servidores sin necesidad de modificar el playbook — los archivos son la fuente de verdad.',
  };
