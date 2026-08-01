import type { ModuleContent } from '../types';

export const nivel5Mod6: ModuleContent = {
  levelId: 5,
  moduleId: 6,
  title: 'Blocks, Rescue y Always',
  objective: 'Usar blocks para agrupar tareas, rescue para manejo de errores, y always para limpieza garantizada.',
  duration: '1.5 horas',
  objectives: [
    'Agrupar tareas con block para aplicarles when, become y tags comunes',
    'Implementar rollback automático con rescue ante fallos en el deploy',
    'Garantizar limpieza de recursos con always independientemente del resultado',
    'Combinar block/rescue/always para un patrón completo de deploy seguro',
  ],
  steps: [
    {
      title: 'Blocks — agrupación de tareas',
      body: `
        <p>Un <code>block</code> agrupa varias tareas y permite aplicarles propiedades comunes: <code>when</code>, <code>become</code>, <code>tags</code>, <code>vars</code>. Es análogo a un bloque try-catch-finally.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">blocks-basico.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">tasks:
- block:
    - name: Instalar dependencias de compilación
      ansible.builtin.package:
        name: [gcc, make, libssl-dev]
        state: present

    - name: Compilar desde fuente
      ansible.builtin.command:
        cmd: make install
        chdir: /tmp/app-src

    - name: Configurar servicio
      ansible.builtin.template:
        src: app.service.j2
        dest: /etc/systemd/system/app.service

  # Estas propiedades se aplican a TODAS las tareas del block
  when: compile_from_source | default(false)
  become: true
  tags: [instalacion, compilacion]
  vars:
    compilador: gcc</code></pre>
        </div>
      `
    },
    {
      title: 'Rescue — manejo de errores',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">blocks-rescue.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">tasks:
- name: Deploy con rollback automático
  block:
    - name: Hacer backup de la versión actual
      ansible.builtin.copy:
        src: /var/www/app/
        dest: /var/www/app-backup/
        remote_src: true

    - name: Desplegar nueva versión
      ansible.builtin.git:
        repo: https://github.com/mi-org/app.git
        dest: /var/www/app
        version: "{{ deploy_version }}"

    - name: Migrar base de datos
      ansible.builtin.command:
        cmd: python manage.py migrate
        chdir: /var/www/app
      register: migration_result

  rescue:
    # Se ejecuta solo si el block falló
    - name: Revertir al backup (rollback)
      ansible.builtin.copy:
        src: /var/www/app-backup/
        dest: /var/www/app/
        remote_src: true

    - name: Notificar fallo
      ansible.builtin.debug:
        msg: "Deploy fallido, se revirtió a la versión anterior"

  always:
    # Se ejecuta SIEMPRE, sin importar si hubo error o no
    - name: Limpiar archivos temporales
      ansible.builtin.file:
        path: /tmp/deploy-*
        state: absent

    - name: Registrar resultado del deploy
      ansible.builtin.lineinfile:
        path: /var/log/deploys.log
        line: "{{ ansible_date_time.iso8601 }} - Deploy {{ deploy_version }}: {{ ansible_failed_task.name | default('SUCCESS') }}"</code></pre>
        </div>
        <div class="next-chapter-box">
          <div class="next-chapter-arrow">→</div>
          <div>
            <div class="next-chapter-label">A continuación</div>
            <div class="next-chapter-title">Imports e Includes</div>
            <div class="next-chapter-desc">Dividís playbooks grandes en archivos reutilizables con import_tasks (estático) e include_tasks (dinámico).</div>
          </div>
        </div>
      `
    }
  ],
  prerequisites: [
    'Completar Módulo 5 del Nivel 5 — Loops: Iteración de tareas',
  ],
  realWorldCase: 'Un playbook de deploy falla a mitad cuando la migración de base de datos encuentra un error. Con block/rescue, Ansible ejecuta automáticamente el rollback al código anterior y registra el fallo, en lugar de dejar el servidor en un estado inconsistente.',
  quiz: [
    {
      question: '¿Cuándo se ejecuta la sección `rescue` de un block?',
      options: [
        'Siempre, al final de cada block',
        'Solo si alguna tarea dentro del block falla',
        'Solo si se especifica --rescue en la línea de comandos',
        'Cuando se usa `meta: trigger_rescue` dentro del block',
      ],
      correctIndex: 1,
      explanation: 'La sección `rescue` se ejecuta solo cuando una tarea dentro del `block` produce un error. Si todas las tareas del block tienen éxito, rescue se saltea completamente. Es el equivalente al bloque `catch` en lenguajes de programación.',
    },
    {
      question: '¿En qué se diferencia `always` de `rescue` en un block?',
      options: [
        'always se ejecuta si hubo éxito; rescue se ejecuta si hubo error',
        'always se ejecuta siempre (éxito o error); rescue se ejecuta solo si hubo error en el block',
        'Son equivalentes pero always tiene mayor prioridad',
        'always es para limpieza; rescue solo para notificaciones',
      ],
      correctIndex: 1,
      explanation: '`always` se ejecuta incondicionalmente, tanto si el block tuvo éxito como si falló. `rescue` se ejecuta solo en caso de error. Un block puede tener ambas secciones: rescue maneja el error y always garantiza la limpieza en cualquier caso (equivale a try-catch-finally).',
    },
    {
      question: '¿Qué propiedad aplicada a un block afecta a TODAS las tareas dentro de él?',
      options: [
        'Solo name: se propaga a las tareas hijas',
        'when:, become:, tags: y vars: aplicados al block se heredan por todas sus tareas',
        'Solo become: se propaga; when: debe repetirse en cada tarea',
        'Las propiedades no se propagan; cada tarea del block debe definir las suyas',
      ],
      correctIndex: 1,
      explanation: 'Un block actúa como un "apply a todas": when:, become:, become_user:, tags:, vars:, ignore_errors:, no_log: y environment: definidos en el block se aplican a cada tarea dentro de él. Esto elimina la repetición y es una de las principales ventajas de usar blocks.',
    },
  ],
  troubleshooting: [
    {
      error: 'Las tareas en rescue se ejecutan aunque el block haya tenido éxito',
      cause: 'Esto no debería ocurrir con el comportamiento correcto. Si sucede, probablemente hay un error de indentación y las tareas de rescue están en el nivel incorrecto del YAML.',
      fix: 'Verificá que block:, rescue: y always: estén al mismo nivel de indentación. Las tareas dentro de cada sección deben tener 2 espacios más que su sección. Usá `ansible-playbook --syntax-check` para detectar errores estructurales.',
    },
    {
      error: 'El play continúa como exitoso después de rescue, aunque el deploy falló',
      cause: 'Cuando rescue se ejecuta y completa sin error, Ansible considera el play como exitoso, aunque haya habido un fallo en el block original.',
      fix: 'Si querés que el play falle después del rescue (para que el CI/CD lo detecte), agregá una tarea en rescue que falle explícitamente: `ansible.builtin.fail: msg: "Deploy fallido, rollback ejecutado"` al final del bloque rescue.',
    },
    {
      error: 'La variable `ansible_failed_task` no está disponible en always',
      cause: '`ansible_failed_task` solo está disponible en el contexto de rescue. En always, si hubo éxito, esa variable no existe y acceder a ella causa un error.',
      fix: 'Usá el filtro default para manejar el caso en que la variable no exista: `{{ ansible_failed_task.name | default("ninguna") }}`. Así el template funciona tanto en el camino de éxito como en el de error.',
    },
  ],
};
