import type { ModuleContent } from '../types';

export const nivel10Mod3: ModuleContent =   {
levelId: 10,
moduleId: 3,
title: 'check_mode y assert',
objective: 'Usar el modo de verificación en seco (dry run) y el módulo assert para validar precondiciones y garantizar que el playbook falla rápido con mensajes claros.',
duration: '1.5 horas',
objectives: [
  'Ejecutar playbooks con --check y --diff para previsualizar cambios',
  'Controlar qué tareas se ejecutan en check_mode con check_mode: false/true',
  'Usar assert para validar variables requeridas al inicio del playbook',
  'Combinar assert con condiciones complejas para validaciones de infraestructura',
  'Entender la diferencia entre fail y assert',
],
prerequisites: [
  'Conocer el ciclo de vida de una tarea Ansible (ok/changed/failed/skipped)',
  'Entender variables y tipos de datos en Ansible',
  'Haber ejecutado playbooks desde la línea de comandos',
],
steps: [
  {
    title: 'check_mode — el dry run de Ansible',
    body: `
      <p>El flag <code>--check</code> ejecuta el playbook en modo simulación: los módulos reportan qué harían pero no realizan cambios reales. Es esencial antes de aplicar cambios en producción.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">dry-run.sh</span></div>
        <pre class="language-yaml"><code class="language-yaml"># Solo check: muestra qué cambiaría
ansible-playbook site.yml --check

# Check + diff: muestra qué cambiaría y el contenido exacto de cada archivo
ansible-playbook site.yml --check --diff

# Limitar scope del check a un grupo
ansible-playbook site.yml --check --limit webservers

# Ver exactamente qué template generaría
ansible-playbook site.yml --check --diff --tags templates</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">check-mode-control.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">tasks:
  # check_mode: false — siempre se ejecuta, incluso con --check
  # Útil para tareas de validación que necesitan datos reales
  - name: Recopilar facts adicionales
ansible.builtin.setup:
  gather_subset: ['network']
check_mode: false

  - name: Verificar conectividad con ping
ansible.builtin.ping:
check_mode: false

  # check_mode: true — SOLO se ejecuta en modo check, nunca en producción
  # Útil para tareas que reportan el estado sin cambiar nada
  - name: Mostrar configuración que se aplicaría (solo dry run)
ansible.builtin.debug:
  msg: "Se aplicaría: workers={{ workers }}, entorno={{ entorno }}"
check_mode: true

  # Tarea normal — respeta el modo del usuario
  - name: Copiar configuración de aplicación
ansible.builtin.template:
  src: app.conf.j2
  dest: /etc/mi-app/app.conf
  owner: root
  mode: '0644'
notify: Reiniciar aplicación</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>--diff con templates:</strong> Combinar <code>--check --diff</code> con el módulo template muestra exactamente las líneas que cambiarían en cada archivo de configuración. Indispensable para revisar cambios antes de un deploy a producción.</div>
      </div>
    `
  },
  {
    title: 'assert — validar antes de actuar',
    body: `
      <p>El módulo <code>ansible.builtin.assert</code> valida condiciones y falla con un mensaje claro y descriptivo si no se cumplen. El principio es "fail fast" — mejor fallar al inicio con un mensaje claro que fallar a mitad de la ejecución con un error críptico.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">assert-validaciones.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Deploy con validaciones previas
  hosts: servidores
  tasks:
# Validaciones al inicio — antes de hacer cualquier cambio
- name: Validar variables de entrada obligatorias
  ansible.builtin.assert:
    that:
      - app_version is defined
      - app_version is string
      - app_version | length > 0
      - app_version is match('^[0-9]+\.[0-9]+\.[0-9]+$')
      - entorno is defined
      - entorno in ['dev', 'staging', 'produccion']
      - db_host is defined
    fail_msg: >
      Variables obligatorias faltantes o inválidas.
      Requeridas: app_version (semver ej: 1.2.3),
      entorno (dev/staging/produccion), db_host.
    success_msg: "Variables validadas: v{{ app_version }} en {{ entorno }}"

- name: Validar resources mínimos para producción
  ansible.builtin.assert:
    that:
      - ansible_memtotal_mb >= 2048
      - ansible_processor_vcpus >= 2
    fail_msg: >
      Servidor insuficiente para producción.
      RAM: {{ ansible_memtotal_mb }}MB (mínimo 2048MB),
      CPUs: {{ ansible_processor_vcpus }} (mínimo 2).
  when: entorno == "produccion"

- name: Validar espacio en disco antes de deploy
  ansible.builtin.assert:
    that:
      - ansible_mounts | selectattr('mount', 'equalto', '/') |
        map(attribute='size_available') | first > 2147483648
    fail_msg: "Menos de 2GB disponibles en /. Liberá espacio antes del deploy."
    success_msg: "Espacio en disco suficiente"

# El deploy recién empieza aquí
- name: Descargar artefacto de deploy
  ansible.builtin.get_url:
    url: "https://releases.ejemplo.com/mi-app-{{ app_version }}.tar.gz"
    dest: "/tmp/mi-app-{{ app_version }}.tar.gz"</code></pre>
      </div>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>fail_msg vs success_msg:</strong> <code>fail_msg</code> se muestra cuando alguna condición es falsa — debe explicar exactamente qué falló y cómo corregirlo. <code>success_msg</code> es opcional y aparece cuando todas las condiciones son verdaderas — útil para confirmar que la validación pasó correctamente.</div>
      </div>
    `
  },
  {
    title: 'assert vs fail — cuándo usar cada uno',
    body: `
      <p>El módulo <code>ansible.builtin.fail</code> es más simple: siempre falla con el mensaje dado. <code>assert</code> evalúa condiciones. Cada uno tiene su lugar.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">fail-vs-assert.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">tasks:
  # assert: para validar condiciones de variables/sistema
  - name: assert — validar que version es semver
ansible.builtin.assert:
  that:
    - app_version is match('^[0-9]+\.[0-9]+\.[0-9]+$')
  fail_msg: "app_version debe ser semver (ej: 1.2.3), recibido: {{ app_version }}"

  # fail: para "salidas de emergencia" condicionales
  - name: Verificar rollback permitido
ansible.builtin.command: cat /etc/no-rollback
register: no_rollback_flag
changed_when: false
ignore_errors: true

  - name: Abortar si rollback está bloqueado
ansible.builtin.fail:
  msg: >
    ROLLBACK BLOQUEADO: El archivo /etc/no-rollback existe.
    Fue creado el {{ no_rollback_flag.stdout }}.
    Contactá al DBA antes de continuar.
when: no_rollback_flag.rc == 0

  # assert con múltiples condiciones — fallan una por una con mensajes separados
  - name: Verificar múltiples condiciones con assert separados
ansible.builtin.assert:
  that: "{{ check.condition }}"
  fail_msg: "{{ check.mensaje }}"
loop:
  - condition: "app_port | int > 1024"
    mensaje: "Puerto debe ser > 1024 (no-privilegiado)"
  - condition: "app_port | int < 65535"
    mensaje: "Puerto debe ser < 65535"
  - condition: "app_port | int != 8080"
    mensaje: "Puerto 8080 reservado para otro servicio"
loop_control:
  loop_var: check</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>assert y check_mode:</strong> Las tareas de assert se ejecutan incluso con --check porque no modifican el sistema. Esto es el comportamiento correcto — querés que las validaciones corran antes de simular los cambios.</div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'check_mode (--check)',
    definition: 'Modo de ejecución en seco donde Ansible simula las tareas sin realizar cambios reales. Los módulos reportan qué harían. Combinado con --diff muestra los cambios exactos de contenido en archivos.',
  },
  {
    term: 'assert',
    definition: 'Módulo de Ansible que evalúa una lista de condiciones Jinja2 y falla con un mensaje descriptivo si alguna es falsa. Implementa el principio de "fail fast" — detectar problemas al inicio antes de realizar cambios.',
  },
  {
    term: 'fail_msg',
    definition: 'Parámetro del módulo assert que define el mensaje de error mostrado cuando una condición falla. Debe explicar qué falló y cómo corregirlo. Puede incluir expresiones {{ }} para mostrar los valores actuales.',
  },
  {
    term: 'fail fast',
    definition: 'Principio de diseño donde el sistema detecta y reporta errores lo antes posible, antes de realizar operaciones costosas o destructivas. En Ansible, se implementa con assert al inicio del playbook.',
  },
],
quiz: [
  {
    question: '¿Qué sucede con las tareas de assert cuando ejecutás un playbook con --check?',
    options: [
      'Se saltan porque --check omite todas las tareas',
      'Se ejecutan normalmente porque no modifican el sistema',
      'Depende del valor de check_mode en cada assert',
      'Solo se ejecutan si tienen check_mode: false',
    ],
    correctIndex: 1,
    explanation: 'Las tareas de assert se ejecutan en check_mode porque no modifican el estado del sistema — solo leen variables y evalúan condiciones. Esto es el comportamiento deseable: querés que las validaciones corran para detectar errores de configuración antes de que el dry run reporte cambios falsos.',
  },
  {
    question: '¿Cuál es la diferencia principal entre assert y fail?',
    options: [
      'assert es más antiguo y fail es el módulo moderno',
      'assert evalúa condiciones y falla si son falsas; fail siempre falla con el mensaje dado',
      'assert solo funciona al inicio del playbook',
      'fail no permite mensajes personalizados',
    ],
    correctIndex: 1,
    explanation: 'assert evalúa expresiones Jinja2 y falla si alguna es falsa, mostrando fail_msg. fail siempre falla con el mensaje dado — es útil como "salida de emergencia" dentro de un when condicional. assert es para validación de precondiciones; fail es para abortos condicionales durante la ejecución.',
  },
  {
    question: '¿Qué hace check_mode: false en una tarea dentro de un playbook ejecutado con --check?',
    options: [
      'La tarea se salta',
      'La tarea se ejecuta realmente, ignorando el --check del playbook',
      'La tarea falla con un error',
      'La tarea usa el modo check del playbook padre',
    ],
    correctIndex: 1,
    explanation: 'check_mode: false en una tarea individual hace que esa tarea se ejecute SIEMPRE, incluso cuando el playbook corre con --check. Útil para tareas de recopilación de datos (setup, command con changed_when: false) que necesitan ejecutarse realmente para que las validaciones y checks funcionen correctamente.',
  },
],
troubleshooting: [
  {
    error: 'assert falla con "is not a valid attribute for a TaskInclude"',
    cause: 'Se está usando assert incorrectamente como directiva de tarea en lugar de como módulo.',
    fix: 'assert es un módulo de Ansible, se usa como nombre de tarea: "ansible.builtin.assert:" con sus parámetros "that:" y "fail_msg:" indentados debajo.',
  },
  {
    error: 'El playbook con --check reporta "changed" en tareas que no deberían cambiar nada',
    cause: 'Algunos módulos no soportan completamente check_mode y reportan "changed" aunque en realidad no harían nada distinto.',
    fix: 'Verificá la documentación del módulo para check_mode support. Para módulos que no lo soportan bien, podés agregar check_mode: false para que se ejecuten realmente y producir datos precisos.',
  },
  {
    error: 'assert pasa pero el playbook falla más adelante con la misma condición',
    cause: 'Las variables cambian entre la validación y el uso — por ejemplo, se sobreescriben por vars_files o set_fact posterior.',
    fix: 'Mové las validaciones del assert lo más cerca posible de donde se usan las variables. Considerá usar block para agrupar la validación con las tareas que dependen de ella.',
  },
],
realWorldCase: 'Un equipo de plataforma tiene playbooks de deploy que antes fallaban en producción con errores crípticos de "undefined variable" a mitad de la ejecución, requiriendo rollbacks manuales. Implementaron assert al inicio de cada playbook validando variables requeridas, versión mínima de Ansible y recursos del servidor. Los fallos ahora ocurren antes de tocar nada, con mensajes que indican exactamente qué variable configurar.',
  };
