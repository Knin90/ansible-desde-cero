import type { ModuleContent } from '../types';

export const nivel5Mod7: ModuleContent = {
  levelId: 5,
  moduleId: 7,
  title: 'Imports e Includes — Modularización de playbooks',
  objective: 'Entender las diferencias entre import_tasks e include_tasks y cuándo usar cada uno.',
  duration: '1.5 horas',
  objectives: [
    'Distinguir import_tasks (estático) de include_tasks (dinámico) y sus consecuencias',
    'Usar include_tasks con variables en el nombre del archivo para configuración condicional',
    'Aplicar loop en include_tasks para procesar múltiples archivos de tareas',
    'Elegir correctamente entre import e include según el uso de tags y condicionales',
  ],
  steps: [
    {
      title: 'Import vs Include — diferencias clave',
      body: `
        <p>Ansible tiene dos mecanismos para reutilizar tareas de otros archivos. La diferencia es cuándo se procesan:</p>
        <ul>
          <li><strong>import_*</strong>: estático, procesado en tiempo de carga del playbook. El contenido se incrusta antes de ejecutar. Los tags y el --list-tasks funcionan correctamente.</li>
          <li><strong>include_*</strong>: dinámico, procesado en tiempo de ejecución. Permite usar variables en el nombre del archivo. Soporta loops.</li>
        </ul>
      `
    },
    {
      title: 'import_tasks e include_tasks',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbook-modular.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">- name: Deploy completo
hosts: servidores_web
tasks:
  # IMPORT: estático, se carga antes de ejecutar
  # Los tags de install-packages.yml son visibles con --list-tags
  - name: Instalar paquetes
    ansible.builtin.import_tasks: tasks/install-packages.yml

  # INCLUDE: dinámico, se evalúa en ejecución
  # Permite usar variables en el nombre del archivo
  - name: Configurar para el ambiente
    ansible.builtin.include_tasks: "tasks/configure-{{ env }}.yml"

  # Include con variables
  - name: Configurar cada servicio
    ansible.builtin.include_tasks: tasks/configure-service.yml
    loop: "{{ servicios }}"
    vars:
      servicio: "{{ item }}"

  # Import de playbook completo (en el contexto del playbook principal)
  - name: Tareas de seguridad
    ansible.builtin.import_playbook: security-hardening.yml</code></pre>
        </div>
      `
    },
    {
      title: 'Cuándo usar cada uno',
      body: `
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Característica</th>
              <th>import_tasks (estático)</th>
              <th>include_tasks (dinámico)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Momento de procesamiento</td>
              <td>Tiempo de carga (antes de ejecutar)</td>
              <td>Tiempo de ejecución</td>
            </tr>
            <tr>
              <td>Variables en nombre de archivo</td>
              <td class="winner">No soporta</td>
              <td class="winner">Sí soporta</td>
            </tr>
            <tr>
              <td>Loop sobre el include</td>
              <td>No soporta</td>
              <td class="winner">Sí soporta</td>
            </tr>
            <tr>
              <td>Tags visibles en --list-tags</td>
              <td class="winner">Sí</td>
              <td>No (se cargan en ejecución)</td>
            </tr>
            <tr>
              <td>when: se aplica a</td>
              <td>Cada tarea individual</td>
              <td>El include completo</td>
            </tr>
            <tr>
              <td>Uso recomendado</td>
              <td>Organización estática, roles</td>
              <td>Condicionales dinámicos, loops</td>
            </tr>
          </tbody>
        </table>
        <div class="next-chapter-box">
          <div class="next-chapter-arrow">→</div>
          <div>
            <div class="next-chapter-label">A continuación</div>
            <div class="next-chapter-title">Nivel 6 — Variables</div>
            <div class="next-chapter-desc">Dominás todas las fuentes de variables de Ansible: tipos, variables registradas, facts, magic variables y su precedencia completa.</div>
          </div>
        </div>
      `
    }
  ],
  prerequisites: [
    'Completar Módulo 6 del Nivel 5 — Blocks, Rescue y Always',
  ],
  realWorldCase: 'Un equipo mantiene playbooks de 800 líneas que son imposibles de entender. Al refactorizar con import_tasks para tareas estáticas e include_tasks para configuraciones por ambiente (configure-prod.yml, configure-staging.yml), cada archivo tiene menos de 50 líneas y el playbook principal es un índice legible.',
  quiz: [
    {
      question: '¿Cuál es la diferencia fundamental entre import_tasks e include_tasks?',
      options: [
        'import_tasks carga archivos locales; include_tasks puede cargar archivos remotos',
        'import_tasks es procesado en tiempo de carga (estático); include_tasks es procesado en tiempo de ejecución (dinámico)',
        'import_tasks soporta loops; include_tasks no',
        'Son equivalentes en Ansible 2.8+; la diferencia existía solo en versiones anteriores',
      ],
      correctIndex: 1,
      explanation: 'import_tasks es estático: el contenido del archivo se incrusta en el playbook antes de ejecutarlo. include_tasks es dinámico: el archivo se carga y procesa en el momento en que se llega a esa línea durante la ejecución. Esto tiene consecuencias importantes en el comportamiento de tags, loops y condicionales.',
    },
    {
      question: '¿Por qué no se puede usar una variable en el nombre del archivo con import_tasks?',
      options: [
        'Es una limitación de seguridad: solo se permiten rutas hardcodeadas',
        'Porque import_tasks se procesa antes de la ejecución, cuando las variables de runtime aún no están disponibles',
        'Las variables sí funcionan con import_tasks siempre que estén en el inventario',
        'Solo funciona con variables de entorno del sistema, no con variables de Ansible',
      ],
      correctIndex: 1,
      explanation: 'import_tasks procesa el archivo en tiempo de carga, antes de cualquier ejecución. En ese momento, variables como `{{ env }}` (que puede valer "prod" o "staging") aún no están resueltas. Por eso se necesita include_tasks para rutas dinámicas: se evalúa en tiempo de ejecución cuando las variables ya tienen valor.',
    },
    {
      question: '¿Qué ocurre cuando se aplica `when:` a un import_tasks versus a un include_tasks?',
      options: [
        'El comportamiento es idéntico en ambos casos',
        'En import_tasks, when: se aplica a cada tarea individual dentro del archivo; en include_tasks, when: controla si el include completo se ejecuta',
        'En import_tasks, when: controla si el include se ejecuta; en include_tasks, se replica en cada tarea',
        'when: no funciona con include_tasks; debe definirse en cada tarea del archivo incluido',
      ],
      correctIndex: 1,
      explanation: 'Con import_tasks, Ansible agrega el when: a cada tarea del archivo importado individualmente (porque el contenido se incrusta). Con include_tasks, el when: determina si el include completo se ejecuta o se salta. La diferencia importa cuando las variables usadas en when: cambian durante la ejecución del play.',
    },
  ],
  troubleshooting: [
    {
      error: 'include_tasks con loop falla con "You cannot use include_tasks with loop in this context"',
      cause: 'Se intentó usar include_tasks con loop dentro de un block o de un contexto que no soporta includes dinámicos con iteración.',
      fix: 'Asegurate de que el include_tasks con loop esté directamente en la lista de tasks del play, no anidado dentro de un block en algunos contextos. Si el error persiste, reestructurá el loop para que itere dentro del archivo incluido en lugar de sobre el include.',
    },
    {
      error: 'Los tags del archivo importado con import_tasks no aparecen en --list-tags',
      cause: 'En realidad sí deberían aparecer. Si no aparecen, probablemente se está usando include_tasks en lugar de import_tasks.',
      fix: 'Verificá que el playbook use import_tasks y no include_tasks. Solo los imports son estáticos y sus tags son visibles en tiempo de carga. Comprobá también que los archivos importados efectivamente tengan tags: definidos en sus tareas.',
    },
    {
      error: 'import_playbook dentro de tasks: falla con "import_playbook is not a valid attribute"',
      cause: 'import_playbook debe usarse a nivel de playbook (en la lista raíz de plays), no dentro de la sección tasks: de un play.',
      fix: 'Mové import_playbook al nivel raíz del playbook, junto con los otros plays (al mismo nivel que `- name: Mi play`). Para incluir tareas dentro de un play, usá import_tasks o include_tasks en cambio.',
    },
  ],
};
