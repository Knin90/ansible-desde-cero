import type { ModuleContent } from '../types';

export const nivel5Mod4: ModuleContent = {
  levelId: 5,
  moduleId: 4,
  title: 'Tags — Ejecución selectiva',
  objective: 'Usar tags para ejecutar o saltar partes específicas de un playbook.',
  duration: '1 hora',
  objectives: [
    'Asignar tags a tareas, plays y roles para ejecución selectiva',
    'Ejecutar solo tareas de configuración con --tags y saltar deploy con --skip-tags',
    'Usar los tags especiales always y never para tareas condicionales',
    'Listar todos los tags disponibles en un playbook con --list-tags',
  ],
  steps: [
    {
      title: 'Definir y usar tags',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbook-tags.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">- name: Deploy completo
hosts: servidores_web
tasks:
  - name: Instalar dependencias
    ansible.builtin.package:
      name: "{{ item }}"
      state: present
    loop: [nginx, curl, git]
    tags: [instalacion, dependencias]

  - name: Copiar configuración nginx
    ansible.builtin.template:
      src: nginx.conf.j2
      dest: /etc/nginx/nginx.conf
    tags: [configuracion, nginx]

  - name: Desplegar código
    ansible.builtin.git:
      repo: https://github.com/mi-org/app.git
      dest: /var/www/app
    tags: [deploy, codigo]

  - name: Reiniciar servicios
    ansible.builtin.service:
      name: "{{ item }}"
      state: restarted
    loop: [nginx, app]
    tags: [servicios, always]  # 'always' siempre se ejecuta</code></pre>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">usar-tags.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Solo ejecutar tareas de configuración
ansible-playbook sitio.yml --tags configuracion

# Solo ejecutar tareas de instalación y configuración
ansible-playbook sitio.yml --tags "instalacion,configuracion"

# Saltar las tareas de deploy
ansible-playbook sitio.yml --skip-tags deploy

# Ver qué tareas tienen qué tags
ansible-playbook sitio.yml --list-tags

# Tags especiales: always (siempre corre) y never (nunca corre sin pedirlo)
ansible-playbook sitio.yml --tags never  # Solo corre las marcadas con 'never'</code></pre>
        </div>
        <div class="next-chapter-box">
          <div class="next-chapter-arrow">→</div>
          <div>
            <div class="next-chapter-label">A continuación</div>
            <div class="next-chapter-title">Loops</div>
            <div class="next-chapter-desc">Iterás sobre listas y diccionarios para aplicar la misma tarea a múltiples elementos sin duplicar código.</div>
          </div>
        </div>
      `
    }
  ],
  prerequisites: [
    'Completar Módulo 3 del Nivel 5 — Handlers y Notify',
  ],
  realWorldCase: 'Un equipo ejecuta un playbook de deploy largo cada semana. Con tags, pueden correr solo --tags configuracion para aplicar cambios de configuración sin re-instalar paquetes, reduciendo el tiempo de ejecución de 20 minutos a 2 minutos.',
  quiz: [
    {
      question: '¿Qué hace el tag especial `always` cuando se asigna a una tarea?',
      options: [
        'La tarea siempre se ejecuta, incluso cuando se usa --skip-tags con ese tag',
        'La tarea se ejecuta siempre, sin importar qué tags se pasen con --tags o --skip-tags',
        'La tarea se marca como prioritaria y se ejecuta antes que las demás',
        'La tarea se ejecuta solo cuando no se especifica ningún --tags',
      ],
      correctIndex: 1,
      explanation: 'Una tarea marcada con el tag `always` se ejecuta siempre, independientemente de qué otros tags se filtren con --tags. La única excepción es si se usa explícitamente `--skip-tags always`. Es útil para tareas de limpieza o logging que deben correr en cualquier contexto.',
    },
    {
      question: '¿Cuál es el comando para listar todos los tags disponibles en un playbook sin ejecutarlo?',
      options: [
        'ansible-playbook sitio.yml --show-tags',
        'ansible-playbook sitio.yml --list-tags',
        'ansible-playbook sitio.yml --dry-run --tags',
        'ansible-tags sitio.yml',
      ],
      correctIndex: 1,
      explanation: '`ansible-playbook sitio.yml --list-tags` muestra todos los tags definidos en el playbook y en qué plays/tasks están, sin ejecutar nada. Es muy útil para descubrir qué tags existen antes de usar --tags en un playbook que no conocés.',
    },
    {
      question: '¿Qué hace el tag especial `never`?',
      options: [
        'La tarea nunca se ejecuta bajo ninguna circunstancia',
        'La tarea se salta siempre a menos que se llame explícitamente con --tags never',
        'La tarea falla silenciosamente sin reportar error',
        'La tarea se ejecuta solo si todas las demás fallan',
      ],
      correctIndex: 1,
      explanation: 'Una tarea con tag `never` se omite en ejecuciones normales y también cuando se usan --tags con otros nombres. Solo se ejecuta cuando se pide explícitamente con `--tags never`. Es ideal para tareas de debug, mantenimiento, o acciones destructivas que no deben correr accidentalmente.',
    },
  ],
  troubleshooting: [
    {
      error: 'Los tags definidos en un include_tasks no aparecen en --list-tags',
      cause: 'include_tasks es dinámico: el archivo incluido se carga en tiempo de ejecución, no en tiempo de carga. Por lo tanto, --list-tags no puede descubrir sus tags antes de ejecutar.',
      fix: 'Cambiá include_tasks por import_tasks para includes cuyo contenido es estático. Los imports son procesados en tiempo de carga y sus tags sí aparecen en --list-tags. Solo usá include_tasks cuando necesitás dinamismo (variables en el nombre del archivo o loops).',
    },
    {
      error: 'Al usar --tags con un tag, se ejecutan tareas de plays que no deberían correr',
      cause: 'Si un play completo tiene un tag asignado, ese tag aplica a todas sus tareas. Si una tarea tiene el mismo tag que el play, se ejecuta aunque no sea lo que esperabas filtrar.',
      fix: 'Revisá los tags asignados al nivel de play (tags: en el play mismo). Asegurate de que los tags de play sean suficientemente específicos (ej: produccion-web) y no colisionen con tags de tareas individuales.',
    },
    {
      error: 'El playbook con --tags solo ejecuta 1 tarea cuando debería ejecutar 5',
      cause: 'Solo las tareas que tienen exactamente ese tag asignado se ejecutan. Las tareas sin tag explícito no se incluyen en la selección.',
      fix: 'Para ejecutar varias tareas relacionadas, asignalas todas al mismo tag, o usá varios tags en el filtro: `--tags "instalacion,configuracion"`. También podés agrupar tareas en un block y asignar el tag al block.',
    },
  ],
};
