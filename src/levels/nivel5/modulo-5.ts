import type { ModuleContent } from '../types';

export const nivel5Mod5: ModuleContent = {
  levelId: 5,
  moduleId: 5,
  title: 'Loops — Iteración de tareas',
  objective: 'Dominar todos los mecanismos de iteración de Ansible: loop, with_*, y loop_control.',
  duration: '2 horas',
  objectives: [
    'Iterar tareas sobre listas simples y listas de diccionarios con loop',
    'Personalizar la etiqueta de salida y el nombre de variable con loop_control',
    'Convertir diccionarios a listas iterables con el filtro dict2items',
    'Usar subelements para iterar sobre subestructuras anidadas',
  ],
  steps: [
    {
      title: 'Loop básico con listas',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">loops-basico.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">tasks:
# Loop sobre lista simple
- name: Instalar paquetes
  ansible.builtin.package:
    name: "{{ item }}"
    state: present
  loop:
    - nginx
    - curl
    - git
    - htop

# Loop sobre lista de diccionarios
- name: Crear usuarios
  ansible.builtin.user:
    name: "{{ item.name }}"
    shell: "{{ item.shell }}"
    groups: "{{ item.groups }}"
  loop:
    - { name: deploy, shell: /bin/bash, groups: sudo }
    - { name: monitor, shell: /bin/false, groups: "" }
    - { name: app, shell: /bin/bash, groups: www-data }

# Loop con variable
- name: Instalar paquetes desde variable
  ansible.builtin.package:
    name: "{{ item }}"
    state: present
  loop: "{{ paquetes_requeridos }}"
  vars:
    paquetes_requeridos:
      - nginx
      - postgresql
      - redis</code></pre>
        </div>
      `
    },
    {
      title: 'Loop control — personalizar la iteración',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">loop-control.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">tasks:
- name: Procesar usuarios
  ansible.builtin.user:
    name: "{{ item.username }}"
    state: present
  loop: "{{ usuarios }}"
  loop_control:
    label: "{{ item.username }}"    # Texto en la salida en lugar del dict completo
    loop_var: usuario               # Cambiar 'item' por otro nombre
    index_var: idx                  # Variable con el índice actual (0, 1, 2...)
    pause: 2                        # Pausa en segundos entre iteraciones

- name: Crear directorios indexados
  ansible.builtin.file:
    path: "/data/worker-{{ idx }}"
    state: directory
  loop: "{{ range(5) | list }}"
  loop_control:
    index_var: idx</code></pre>
        </div>
      `
    },
    {
      title: 'Filtros útiles con loops',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">loops-filtros.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">tasks:
# dict2items: convertir diccionario a lista para iterar
- name: Configurar variables de entorno
  ansible.builtin.lineinfile:
    path: /etc/environment
    line: "{{ item.key }}={{ item.value }}"
  loop: "{{ env_vars | dict2items }}"
  vars:
    env_vars:
      DATABASE_URL: postgresql://db1:5432/app
      REDIS_URL: redis://cache:6379

# Loop sobre subelementos
- name: Crear archivos de configuración por usuario
  ansible.builtin.copy:
    content: "{{ item.1 }}"
    dest: "/home/{{ item.0.name }}/.config"
  loop: "{{ usuarios | subelements('config_files') }}"</code></pre>
        </div>
        <div class="next-chapter-box">
          <div class="next-chapter-arrow">→</div>
          <div>
            <div class="next-chapter-label">A continuación</div>
            <div class="next-chapter-title">Blocks, Rescue y Always</div>
            <div class="next-chapter-desc">Agrupás tareas y agregás manejo de errores con rollback automático usando el patrón try-catch-finally de Ansible.</div>
          </div>
        </div>
      `
    }
  ],
  prerequisites: [
    'Completar Módulo 4 del Nivel 5 — Tags: Ejecución selectiva',
  ],
  realWorldCase: 'Un playbook necesita crear 50 usuarios con sus directorios home y claves SSH. Sin loops, son 150 tareas repetidas. Con loop sobre una lista de diccionarios, son 3 tareas genéricas que se aplican a todos los usuarios, haciendo el playbook legible y mantenible.',
  quiz: [
    {
      question: '¿Cómo se itera sobre un diccionario (mapping YAML) usando loop?',
      options: [
        'loop: "{{ mi_dict }}" y se accede con item.key e item.value directamente',
        'loop: "{{ mi_dict | dict2items }}" y se accede con item.key e item.value',
        'with_dict: mi_dict (la única forma válida de iterar diccionarios)',
        'loop: "{{ mi_dict.items() }}" usando la sintaxis de Python',
      ],
      correctIndex: 1,
      explanation: 'El filtro Jinja2 `dict2items` convierte un diccionario en una lista de objetos {key, value} que loop puede iterar. Dentro del loop se accede con `item.key` e `item.value`. Es la forma moderna y recomendada desde Ansible 2.6 (reemplaza el antiguo with_dict).',
    },
    {
      question: '¿Para qué sirve `loop_control.label`?',
      options: [
        'Para asignar un nombre único a cada iteración del loop',
        'Para controlar cuántas iteraciones se ejecutan en paralelo',
        'Para personalizar el texto que aparece en la salida de Ansible en lugar de mostrar el item completo',
        'Para pausar el loop cuando el label coincide con una condición',
      ],
      correctIndex: 2,
      explanation: 'Cuando loop itera sobre diccionarios complejos, la salida muestra el objeto completo en cada tarea, haciendo la salida ilegible. `loop_control.label` permite definir qué mostrar, por ejemplo `label: "{{ item.name }}"` en lugar de todo el diccionario.',
    },
    {
      question: '¿Cuál es la variable especial que contiene el índice numérico de la iteración actual en un loop?',
      options: [
        'item.index',
        'loop.index',
        'La variable definida en loop_control.index_var',
        'ansible_loop_var',
      ],
      correctIndex: 2,
      explanation: 'Para acceder al índice de la iteración, debés declarar `loop_control: { index_var: idx }` y luego usar `{{ idx }}` en la tarea. No existe una variable automática de índice como en otros lenguajes; hay que habilitarla explícitamente con index_var.',
    },
  ],
  troubleshooting: [
    {
      error: '"loop" no está definido / "with_items" es deprecated',
      cause: 'El playbook usa `with_items` (sintaxis antigua de Ansible < 2.5) o intenta usar un `loop` vacío.',
      fix: 'Migrá de `with_items` a `loop`. Son equivalentes para listas simples: `loop: [a, b, c]`. Para loops anidados que usaban `with_nested`, usá el filtro `product` de Jinja2: `loop: "{{ lista1 | product(lista2) | list }}"`. Asegurate de que la variable del loop no sea null o vacía.',
    },
    {
      error: 'El loop sobre `include_tasks` falla con "loop variables are not supported in include_tasks"',
      cause: 'Se intentó usar loop con import_tasks en lugar de include_tasks. Los imports son estáticos y no soportan loops.',
      fix: 'Reemplazá import_tasks por include_tasks cuando necesitás usar loop. Los includes son dinámicos y sí soportan iteración. Si también necesitás que los tags del archivo incluido sean visibles, estructurá el contenido en un role en su lugar.',
    },
    {
      error: 'Conflicto de variable "item" cuando se anidan loops en roles',
      cause: 'Ansible usa `item` como nombre de variable de loop por defecto. Si un role interno también usa loop, ambos comparten la misma variable y se pisan.',
      fix: 'Usá `loop_control: { loop_var: mi_variable }` para renombrar la variable del loop en el contexto exterior o interior. Define nombres diferentes en cada nivel de anidamiento para evitar colisiones.',
    },
  ],
};
