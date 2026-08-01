import type { ModuleContent } from '../types';

export const nivel5Mod2: ModuleContent = {
  levelId: 5,
  moduleId: 2,
  title: 'Tasks y Play — Anatomía completa',
  objective: 'Entender todos los campos disponibles en un play y en una task, y cómo interactúan entre sí.',
  duration: '2 horas',
  objectives: [
    'Configurar todos los campos clave de un play: hosts, gather_facts, strategy, serial',
    'Usar register, when, failed_when y changed_when en una task',
    'Implementar retries con retries, delay y until para tareas que pueden fallar',
    'Aplicar become en el nivel de play y sobreescribirlo en tareas individuales',
  ],
  steps: [
    {
      title: 'Anatomía de un Play',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">anatomia-play.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">- name: Configurar servidores web          # Nombre del play (recomendado)
hosts: servidores_web                    # Patrón de hosts: grupo, lista, expresión
gather_facts: true                       # Recolectar facts (default: true)
become: true                             # Usar sudo para todo el play
become_user: root                        # Usuario al que escalar
become_method: sudo                      # Método de escalada
connection: ssh                          # Plugin de conexión
remote_user: ubuntu                      # Usuario SSH
port: 22                                 # Puerto SSH
strategy: linear                         # Strategy plugin
serial: 2                                # Rolling update: de a 2 hosts
max_fail_percentage: 30                  # Si falla >30%, abortar
any_errors_fatal: false                  # ¿Un error mata todo el play?
ignore_errors: false                     # ¿Ignorar errores en todas las tasks?
order: sorted                            # Orden de hosts: inventory|sorted|reverse_sorted|shuffle
vars:                                    # Variables del play
  http_port: 80
  nginx_version: "1.24"
vars_files:                              # Cargar variables desde archivos
  - vars/comunes.yml
  - "vars/{{ env }}.yml"
vars_prompt:                             # Pedir variables interactivamente
  - name: version_deploy
    prompt: "¿Qué versión deployar?"
environment:                             # Variables de entorno en el host remoto
  PATH: "/usr/local/bin:{{ ansible_env.PATH }}"
tags: [web, configuracion]               # Tags del play completo
pre_tasks: []                            # Se ejecutan ANTES de los roles
roles: []                                # Lista de roles
tasks: []                                # Tareas del play
post_tasks: []                           # Se ejecutan DESPUÉS de los roles
handlers: []                             # Handlers del play</code></pre>
        </div>
      `
    },
    {
      title: 'Anatomía de una Task',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">anatomia-task.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">tasks:
- name: Instalar nginx                    # Nombre descriptivo (muy recomendado)
  ansible.builtin.package:               # Módulo con FQCN (Fully Qualified Collection Name)
    name: nginx
    state: present

  # --- Control de ejecución ---
  when: ansible_os_family == "Debian"   # Condición para ejecutar

  loop:                                  # Iterar sobre una lista
    - nginx
    - curl
  loop_control:
    label: "{{ item }}"                 # Etiqueta en la salida

  # --- Escalada de privilegios ---
  become: true                          # Sobreescribe el del play
  become_user: root

  # --- Manejo de errores ---
  ignore_errors: true                   # No falla aunque la task falle
  failed_when: result.rc != 0          # Condición personalizada de fallo
  changed_when: false                   # Nunca reportar como "changed"

  # --- Retries ---
  retries: 5
  delay: 10
  until: result.rc == 0

  # --- Notificaciones ---
  notify:                               # Disparar handlers si hay cambios
    - Reiniciar nginx
    - Recargar configuración

  # --- Captura de resultado ---
  register: resultado_instalacion       # Guardar el resultado

  # --- Timeout ---
  timeout: 120                          # Tiempo máximo en segundos

  # --- Tags ---
  tags: [instalacion, nginx]

  # --- Variables locales ---
  vars:
    paquete_extra: libssl-dev</code></pre>
        </div>
        <div class="next-chapter-box">
          <div class="next-chapter-arrow">→</div>
          <div>
            <div class="next-chapter-label">A continuación</div>
            <div class="next-chapter-title">Handlers y Notify</div>
            <div class="next-chapter-desc">Ejecutás acciones como reiniciar servicios solo cuando algo realmente cambia, evitando interrupciones innecesarias.</div>
          </div>
        </div>
      `
    }
  ],
  prerequisites: [
    'Completar Módulo 1 del Nivel 5 — Sintaxis YAML completa en contexto Ansible',
  ],
  realWorldCase: 'Un playbook de deploy usa serial: 2 y max_fail_percentage: 30 para hacer rolling updates seguros: si más del 30% de los hosts falla, Ansible aborta antes de romper toda la flota. Sin conocer estos campos del play, un deploy defectuoso podría derribar todos los servidores simultáneamente.',
  quiz: [
    {
      question: '¿Cuál es la diferencia entre failed_when y ignore_errors en una task?',
      options: [
        'Son equivalentes; ambos evitan que el playbook falle',
        'failed_when define una condición personalizada para considerar la task fallida; ignore_errors hace que Ansible continúe aunque la task falle',
        'failed_when solo funciona con el módulo command; ignore_errors funciona con cualquier módulo',
        'ignore_errors es deprecated; se debe usar siempre failed_when',
      ],
      correctIndex: 1,
      explanation: 'failed_when te permite redefinir qué significa "fallo" (ej: `failed_when: result.rc > 1`). ignore_errors simplemente ignora cualquier fallo y continúa. Son complementarios: failed_when controla cuándo falla; ignore_errors controla qué pasa cuando falla.',
    },
    {
      question: '¿Qué campo de un play controla que se procesen los hosts de a 2 en un rolling update?',
      options: [
        'max_fail_percentage: 2',
        'strategy: 2',
        'serial: 2',
        'batch_size: 2',
      ],
      correctIndex: 2,
      explanation: 'serial: 2 hace que Ansible procese el play en lotes de 2 hosts. Completa todas las tasks en esos 2 hosts antes de pasar al siguiente lote. Es el mecanismo nativo de rolling update en Ansible.',
    },
    {
      question: '¿Qué combinación de campos permite reintentar una task hasta que tenga éxito?',
      options: [
        'retry: true y max_retries: 5',
        'retries: 5, delay: 10 y until: <condición>',
        'loop_control: { retries: 5 } y when: not result.failed',
        'failed_when: false y retries: 5',
      ],
      correctIndex: 1,
      explanation: 'La combinación retries + delay + until es el patrón correcto. `retries` define cuántos intentos, `delay` los segundos entre intentos, y `until` la condición que debe cumplirse para considerar la task exitosa. Los tres campos son obligatorios para que el retry funcione correctamente.',
    },
  ],
  troubleshooting: [
    {
      error: 'La task con register no tiene el campo rc disponible',
      cause: 'El módulo usado no devuelve rc. Solo los módulos que ejecutan comandos del sistema (command, shell, raw) incluyen rc en su resultado.',
      fix: 'Verificá la documentación del módulo para saber qué campos devuelve. Usá `- ansible.builtin.debug: var=resultado` justo después de la task con register para inspeccionar la estructura completa del resultado.',
    },
    {
      error: 'changed_when: false hace que los handlers no se ejecuten',
      cause: 'Los handlers solo se disparan cuando una task reporta changed: true. Si forzás changed_when: false, la task nunca reporta cambios aunque el notify esté definido.',
      fix: 'Usá changed_when: false solo en tareas de verificación o lectura que nunca deben considerarse como cambios. No lo uses en tareas que necesiten disparar handlers.',
    },
    {
      error: 'El playbook falla con "Timeout waiting for privilege escalation prompt"',
      cause: 'become: true está configurado pero el usuario remoto necesita contraseña para sudo y no se proveyó.',
      fix: 'Ejecutá el playbook con --ask-become-pass para que Ansible pida la contraseña de sudo. En producción, configurá el usuario en sudoers con NOPASSWD o usá ansible_become_password en vault.',
    },
  ],
};
