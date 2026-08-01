import type { ModuleContent } from '../types';

export const nivel11Mod4: ModuleContent =   {
levelId: 11,
moduleId: 4,
title: 'loop_control',
objective: 'Controlar el comportamiento, presentación y variables de los loops con loop_control para código más legible y robusto.',
duration: '1.5 horas',
objectives: [
  'Limpiar la salida de loops con label para mostrar solo información relevante',
  'Agregar pausas entre iteraciones con pause para respetar rate limits',
  'Acceder al índice de la iteración con index_var',
  'Evitar conflictos de variables en loops anidados con loop_var',
  'Combinar loop_control con include_tasks para workflows complejos',
],
prerequisites: [
  'Dominar loop básico e include_tasks (Módulos 1 y 3 de este nivel)',
  'Haber trabajado con roles de Ansible (Nivel 12 o conceptualmente)',
],
steps: [
  {
    title: 'label — output limpio en loops',
    body: `
      <p>Por defecto, Ansible imprime el valor completo de <code>item</code> en cada iteración. Con diccionarios complejos, esto produce salidas de 20+ líneas por iteración. <code>label</code> permite mostrar solo la información relevante.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">loop-label.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">tasks:
  # Sin label — Ansible muestra el dict completo en cada iteración
  # TASK [Instalar paquetes] ****
  # ok: [web01] => (item={'nombre': 'nginx', 'version': '1.24', ...más campos...})
  - name: Instalar paquetes (sin label — verboso)
ansible.builtin.package:
  name: "{{ item.nombre }}"
  state: present
loop: "{{ paquetes }}"

  # Con label — salida limpia y legible
  # TASK [Instalar paquetes] ****
  # ok: [web01] => (item=nginx 1.24 [alta prioridad])
  - name: Instalar paquetes con salida limpia
ansible.builtin.package:
  name: "{{ item.nombre }}"
  state: present
loop: "{{ paquetes }}"
loop_control:
  label: "{{ item.nombre }} {{ item.version }} [{{ item.prioridad }} prioridad]"
vars:
  paquetes:
    - nombre: nginx
      version: "1.24"
      prioridad: alta
      deps: [pcre, zlib, openssl]
      config: {worker_processes: auto, worker_connections: 1024}
    - nombre: redis
      version: "7.0"
      prioridad: media
      deps: [libc]
      config: {maxmemory: 256mb}</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Regla de oro:</strong> Si cada elemento del loop es un diccionario con más de 2-3 campos, usá <code>label</code>. Tu output será mucho más legible y será más fácil identificar en qué item falló una tarea.</div>
      </div>
    `
  },
  {
    title: 'pause, index_var y extended',
    body: `
      <p>Los otros controles de loop_control permiten gestionar el tempo de ejecución y acceder a metadatos del loop.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">loop-control-avanzado.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">tasks:
  # pause: segundos de espera entre iteraciones
  # Útil para APIs con rate limiting o deploys graduales
  - name: Desplegar instancias gradualmente
ansible.builtin.debug:
  msg: "Desplegando instancia {{ item }}"
loop: "{{ instancias }}"
loop_control:
  label: "instancia {{ item }}"
  pause: 30    # Esperar 30s entre cada instancia

  # index_var: variable con el índice actual (0-based)
  - name: Configurar servidores con número de secuencia
ansible.builtin.template:
  src: servidor.conf.j2
  dest: "/etc/cluster/{{ item.nombre }}.conf"
loop: "{{ servidores }}"
loop_control:
  index_var: idx
  label: "{{ idx + 1 }}/{{ servidores | length }} - {{ item.nombre }}"
# En el template tenés disponible {{ idx }}, {{ item }}, y todas las vars

  # Todos juntos: label + pause + index_var
  - name: Registrar lotes de datos en API externa
ansible.builtin.uri:
  url: "https://api.ejemplo.com/registros"
  method: POST
  body: "{{ item | to_json }}"
  body_format: json
  headers:
    Authorization: "Bearer {{ api_token }}"
loop: "{{ registros }}"
loop_control:
  label: "registro {{ idx + 1 }}/{{ registros | length }}: {{ item.id }}"
  index_var: idx
  pause: 1    # Respetar rate limit de la API: máx 1 req/segundo</code></pre>
      </div>
    `
  },
  {
    title: 'loop_var — loops anidados sin conflictos',
    body: `
      <p>Cuando un loop llama a <code>include_tasks</code> que a su vez contiene otro loop, ambos usan <code>item</code> por defecto. El loop interno sobreescribe el externo. <code>loop_var</code> soluciona esto.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">loop-var-anidado.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml"># playbook.yml — loop externo
tasks:
  - name: Configurar cada servidor de base de datos
ansible.builtin.include_tasks: configurar_bd.yml
loop: "{{ servidores_bd }}"
loop_control:
  loop_var: servidor   # Renombrar 'item' del loop externo a 'servidor'
  label: "{{ servidor.nombre }}"
vars:
  servidores_bd:
    - nombre: db-01
      bases_de_datos: [users, products, orders]
      max_conn: 200
    - nombre: db-02
      bases_de_datos: [analytics, logs]
      max_conn: 100</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">configurar_bd.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# Este archivo puede usar 'item' libremente para sus propios loops
# 'servidor' viene del loop externo y nunca se pisará

- name: Crear bases de datos en {{ servidor.nombre }}
  community.postgresql.postgresql_db:
name: "{{ item }}"
state: present
  loop: "{{ servidor.bases_de_datos }}"
  # 'item' aquí es "users", "products", "orders" etc.
  # 'servidor' sigue siendo el objeto del loop externo

- name: Configurar max_connections para {{ servidor.nombre }}
  community.postgresql.postgresql_set:
name: max_connections
value: "{{ servidor.max_conn }}"</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Regla preventiva:</strong> Cuando usés <code>include_tasks</code> dentro de un loop, usá siempre <code>loop_var</code> para renombrar la variable del loop externo. Aunque no haya conflicto hoy, el archivo incluido podría agregar loops internos en el futuro y el bug aparecería de forma difícil de diagnosticar.</div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'loop_control',
    definition: 'Parámetro de tarea que controla el comportamiento de un loop. Acepta label (texto a mostrar por iteración), pause (segundos entre iteraciones), index_var (variable con el índice), loop_var (nombre alternativo para item) y extended (info adicional de la iteración).',
  },
  {
    term: 'label',
    definition: 'Campo de loop_control que define qué texto mostrar en el output de Ansible para cada iteración. Puede usar expresiones Jinja2. Reemplaza la visualización por defecto del valor completo de item.',
  },
  {
    term: 'index_var',
    definition: 'Campo de loop_control que define el nombre de la variable que contendrá el índice (0-based) de la iteración actual. Útil para numerar elementos, calcular offsets o mostrar progreso.',
  },
  {
    term: 'loop_var',
    definition: 'Campo de loop_control que cambia el nombre de la variable del elemento actual del loop (por defecto "item"). Esencial cuando se usan loops anidados con include_tasks para evitar que el loop interno sobreescriba la variable del loop externo.',
  },
],
quiz: [
  {
    question: '¿Para qué sirve label en loop_control?',
    options: [
      'Para nombrar el loop y referenciarlo desde otra tarea',
      'Para controlar qué texto muestra Ansible en la salida por cada iteración, reemplazando el valor completo de item',
      'Para agregar un nombre descriptivo a la variable item',
      'Para filtrar qué iteraciones se ejecutan',
    ],
    correctIndex: 1,
    explanation: 'label define exactamente qué texto aparece en la salida de Ansible para cada iteración. Sin label, Ansible muestra el valor completo de item — si es un diccionario complejo puede ser muy verboso. Con label podés mostrar solo los campos relevantes, haciendo el output mucho más legible.',
  },
  {
    question: '¿Por qué es necesario loop_var al usar include_tasks dentro de un loop?',
    options: [
      'include_tasks requiere loop_var para funcionar con loop',
      'Evita que el loop interno del archivo incluido sobreescriba la variable item del loop externo',
      'Mejora el performance del loop',
      'Loop_var es obligatorio para todos los loops en Ansible moderno',
    ],
    correctIndex: 1,
    explanation: 'Si el loop externo usa item y el archivo incluido tiene su propio loop que también usa item, el item externo se pierde dentro del archivo incluido. Renombrando con loop_var: servidor, el archivo incluido puede usar item para sus propios loops y servidor para el contexto externo sin conflictos.',
  },
  {
    question: '¿Qué valor tiene index_var en la primera iteración de un loop?',
    options: [
      '1',
      '0',
      '-1',
      'Depende de la longitud del loop',
    ],
    correctIndex: 1,
    explanation: 'index_var es 0-based (basado en cero), igual que los índices de listas en Python. La primera iteración tiene índice 0, la segunda 1, etc. Para mostrar un contador legible (comenzando en 1) se usa idx + 1 en el template o label.',
  },
],
troubleshooting: [
  {
    error: 'La variable del loop externo tiene valor incorrecto dentro del archivo incluido',
    cause: 'Se está usando "item" tanto en el loop externo como en loops internos del archivo incluido, y el interno sobreescribe al externo.',
    fix: 'Agregá loop_var al loop externo para renombrar la variable: loop_control: loop_var: mi_objeto_externo. Dentro del archivo incluido usá {{ mi_objeto_externo }} para el contexto externo e {{ item }} para los loops internos.',
  },
  {
    error: 'pause en loop_control no espera el tiempo esperado',
    cause: 'pause está en segundos y es entero. Valores decimales se truncan.',
    fix: 'Usá valores enteros para pause. Si necesitás esperas de milisegundos, considerá otras soluciones. Para esperas largas (30+ segundos) evaluá si async + poll es más apropiado.',
  },
  {
    error: 'index_var tiene un valor inesperado en el loop',
    cause: 'Se está usando el nombre de index_var como variable en otras tareas fuera del loop.',
    fix: 'Las variables definidas en index_var son locales al loop pero persisten en el scope del play. Usá nombres descriptivos y únicos para index_var (ej: paquete_idx, servicio_idx) para evitar colisiones con otras variables.',
  },
],
realWorldCase: 'Un equipo gestiona el despliegue a 30 instancias de producción. Usan loop_control con label para ver claramente qué instancia está siendo desplegada, pause: 60 para el cooldown entre instancias (permitiendo que cada una pase el health check), e index_var para calcular el porcentaje de progreso. El output limpio permite monitorear el deploy en tiempo real y detectar rápidamente cuál instancia tuvo un problema.',
  };
