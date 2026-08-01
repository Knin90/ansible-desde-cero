import type { ModuleContent } from '../types';

export const nivel5Mod3: ModuleContent = {
  levelId: 5,
  moduleId: 3,
  title: 'Handlers y Notify',
  objective: 'Dominar los handlers y el mecanismo notify para ejecutar acciones solo cuando algo cambia.',
  duration: '1.5 horas',
  objectives: [
    'Definir handlers y notificarlos desde tareas con notify',
    'Usar listen para que múltiples handlers respondan al mismo evento',
    'Forzar la ejecución anticipada de handlers con meta: flush_handlers',
    'Entender por qué un handler se ejecuta una sola vez aunque lo notifiquen varias tareas',
  ],
  steps: [
    {
      title: 'Cómo funcionan los handlers',
      body: `
        <p>Los handlers son tareas especiales que solo se ejecutan cuando son notificados por otra tarea que tuvo <code>changed: true</code>. Se ejecutan una sola vez al final del play, sin importar cuántas veces fueron notificados. Son perfectos para reiniciar servicios después de cambios de configuración.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">handlers-basico.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">tasks:
- name: Instalar nginx
  ansible.builtin.package:
    name: nginx
    state: present
  notify: Reiniciar nginx             # Notifica al handler

- name: Copiar configuración
  ansible.builtin.template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
  notify:                            # Puede notificar múltiples handlers
    - Reiniciar nginx
    - Verificar configuración

handlers:
- name: Reiniciar nginx              # Nombre debe coincidir exactamente
  ansible.builtin.service:
    name: nginx
    state: restarted

- name: Verificar configuración
  ansible.builtin.command:
    cmd: nginx -t</code></pre>
        </div>
      `
    },
    {
      title: 'Listen — Notificaciones con alias',
      body: `
        <p>El campo <code>listen</code> permite que un handler "escuche" en un tema. Múltiples handlers pueden escuchar el mismo tema. Una tarea notifica el tema y todos los handlers asociados se disparan.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">handlers-listen.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">tasks:
- name: Actualizar configuración
  ansible.builtin.template:
    src: app.conf.j2
    dest: /etc/app/app.conf
  notify: reiniciar servicios app   # Notifica el tema

handlers:
- name: Reiniciar aplicación
  listen: reiniciar servicios app   # Escucha el tema
  ansible.builtin.service:
    name: mi-app
    state: restarted

- name: Reiniciar proxy
  listen: reiniciar servicios app   # También escucha el mismo tema
  ansible.builtin.service:
    name: nginx
    state: reloaded

- name: Limpiar cache
  listen: reiniciar servicios app   # Y este también
  ansible.builtin.file:
    path: /tmp/app-cache
    state: absent</code></pre>
        </div>
      `
    },
    {
      title: 'Forzar handlers y handlers globales',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">handlers-avanzado.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">tasks:
- name: Configurar nginx
  ansible.builtin.template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
  notify: Reiniciar nginx

# Forzar ejecución de todos los handlers pendientes ahora
- name: Flush handlers
  ansible.builtin.meta: flush_handlers

# Después de este punto, los handlers ya se ejecutaron
- name: Verificar que nginx responde
  ansible.builtin.uri:
    url: http://localhost
    status_code: 200

handlers:
- name: Reiniciar nginx
  ansible.builtin.service:
    name: nginx
    state: restarted</code></pre>
        </div>
        <div class="next-chapter-box">
          <div class="next-chapter-arrow">→</div>
          <div>
            <div class="next-chapter-label">A continuación</div>
            <div class="next-chapter-title">Tags</div>
            <div class="next-chapter-desc">Marcás tareas con etiquetas para ejecutar o saltar partes específicas de un playbook sin modificar el código.</div>
          </div>
        </div>
      `
    }
  ],
  prerequisites: [
    'Completar Módulo 2 del Nivel 5 — Tasks y Play: Anatomía completa',
  ],
  realWorldCase: 'Un playbook instala nginx, copia la configuración y reinicia el servicio en cada ejecución, aunque no haya cambios. Con handlers, el reinicio solo ocurre si la configuración realmente cambió, evitando interrupciones innecesarias del servicio en producción.',
  quiz: [
    {
      question: '¿Cuándo se ejecutan los handlers en un playbook de Ansible?',
      options: [
        'Inmediatamente después de la tarea que los notifica',
        'Al final del play, después de que todas las tareas completan',
        'Solo si el playbook se ejecuta con --handlers',
        'Una vez por host, sin importar cuántas veces fueron notificados',
      ],
      correctIndex: 1,
      explanation: 'Los handlers se ejecutan al final del play, no inmediatamente cuando son notificados. Si un handler es notificado múltiples veces (por distintas tasks), se ejecuta una sola vez. Esto evita reinicios innecesarios cuando varios cambios disparan el mismo handler.',
    },
    {
      question: '¿Para qué sirve `meta: flush_handlers`?',
      options: [
        'Para eliminar todos los handlers definidos en el play',
        'Para ejecutar inmediatamente todos los handlers pendientes en ese punto del playbook',
        'Para listar todos los handlers que fueron notificados',
        'Para forzar que los handlers se ejecuten incluso si no fueron notificados',
      ],
      correctIndex: 1,
      explanation: '`meta: flush_handlers` fuerza la ejecución de todos los handlers pendientes en el punto donde se inserta, sin esperar al final del play. Es útil cuando necesitás que un servicio esté reiniciado antes de ejecutar las tareas siguientes (ej: reiniciar nginx antes de verificar que responde).',
    },
    {
      question: '¿Cuál es la ventaja de usar `listen` en un handler en lugar de notificarlo directamente por nombre?',
      options: [
        'Los handlers con listen se ejecutan más rápido',
        'Permite que múltiples handlers respondan a un mismo evento, desacoplando el nombre del handler del evento que lo dispara',
        'listen es obligatorio en Ansible 2.9+; notify por nombre está deprecated',
        'Con listen se pueden pasar argumentos al handler',
      ],
      correctIndex: 1,
      explanation: 'Con `listen`, un handler puede suscribirse a un "topic" en lugar de requerir que las tasks conozcan su nombre exacto. Múltiples handlers pueden escuchar el mismo topic, y una task notifica el topic sin saber qué handlers existen. Esto desacopla los handlers de las tasks que los disparan.',
    },
  ],
  troubleshooting: [
    {
      error: 'Handler "restart nginx" was not found',
      cause: 'El nombre en notify no coincide exactamente (case-sensitive) con el name: del handler. Un espacio de más o diferencia en mayúsculas es suficiente para que no se encuentre.',
      fix: 'Verificá que el string en notify: sea idéntico carácter por carácter al name: del handler. Ansible es case-sensitive. Considera usar listen: con un topic en minúsculas para evitar este problema.',
    },
    {
      error: 'El handler se ejecuta aunque la task no haya cambiado nada',
      cause: 'La task que tiene el notify reporta changed: true en cada ejecución aunque no haya modificado nada. Esto ocurre frecuentemente con los módulos command y shell.',
      fix: 'Agregá changed_when a la task para definir con precisión cuándo debe considerarse un cambio. Ej: `changed_when: result.stdout != ""`. Así el handler solo se dispara cuando realmente hubo una modificación.',
    },
    {
      error: 'Los handlers no se ejecutan cuando el playbook falla a mitad',
      cause: 'Si el play termina con un error no manejado, Ansible aborta antes de llegar a la sección de handlers. Los handlers pendientes se pierden.',
      fix: 'Usá `meta: flush_handlers` en puntos críticos del play para ejecutar los handlers antes de que puedan perderse. Para garantizar la ejecución ante fallos, considerá combinar con blocks y rescue.',
    },
  ],
};
