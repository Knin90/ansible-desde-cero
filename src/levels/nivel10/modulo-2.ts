import type { ModuleContent } from '../types';

export const nivel10Mod2: ModuleContent =   {
levelId: 10,
moduleId: 2,
title: 'failed_when y changed_when',
objective: 'Controlar cuándo Ansible considera que una tarea falló o realizó cambios, sobreescribiendo el comportamiento por defecto de los módulos para mayor precisión.',
duration: '1.5 horas',
objectives: [
  'Entender por qué command y shell siempre reportan changed por defecto',
  'Usar changed_when: false para comandos de solo lectura',
  'Usar changed_when con condiciones basadas en stdout para detectar cambios reales',
  'Usar failed_when para definir condiciones de fallo personalizadas',
  'Combinar failed_when con ignore_errors de forma segura',
],
prerequisites: [
  'Haber usado register para capturar salida de comandos',
  'Entender los módulos command y shell de Ansible',
  'Conocer los campos rc, stdout y stderr del resultado de un comando',
],
steps: [
  {
    title: '¿Por qué command siempre reporta changed?',
    body: `
      <p>El módulo <code>command</code> (y <code>shell</code>) no puede saber si su ejecución produjo un cambio en el sistema. Ansible adopta la postura conservadora: si ejecutó algo, reporta <code>changed: true</code>.</p>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Es como un mensajero que reporta "entregué algo" cada vez que sale, sin importar si el paquete llegó o si la dirección no existía. <code>changed_when</code> le dice exactamente cuándo debe decir "hubo cambio".</p>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>El problema:</strong> Un <code>changed: true</code> innecesario dispara handlers. Si cada vez que corrés el playbook nginx "cambia", se reinicia nginx aunque no haya pasado nada. Esto rompe la idempotencia.
        </div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">changed-when.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">tasks:
  # MAL: df siempre reporta changed aunque no cambia nada
  - name: Verificar espacio (MAL)
ansible.builtin.command: df -h /
register: disk_info
# changed: true siempre — disparará handlers innecesariamente

  # BIEN: comandos de solo lectura siempre changed: false
  - name: Verificar espacio (BIEN)
ansible.builtin.command: df -h /
register: disk_info
changed_when: false         # Nunca changed: true

  # BIEN: changed solo si el make compiló algo nuevo
  - name: Compilar aplicación
ansible.builtin.command: make
args:
  chdir: /opt/mi-app
register: make_result
changed_when: "'Nothing to be done' not in make_result.stdout"

  # BIEN: changed solo si Django aplicó migraciones
  - name: Aplicar migraciones de base de datos
ansible.builtin.command: python manage.py migrate --no-input
args:
  chdir: /opt/mi-app
register: migrate_result
changed_when: >
  'No migrations to apply' not in migrate_result.stdout and
  migrate_result.rc == 0

  # BIEN: detect si puppet aplicó cambios reales
  - name: Aplicar configuración con Puppet
ansible.builtin.command: puppet agent --test
register: puppet_result
changed_when: "'Applied catalog' in puppet_result.stdout"
failed_when: puppet_result.rc not in [0, 2]</code></pre>
      </div>
    `
  },
  {
    title: 'failed_when — condiciones personalizadas de fallo',
    body: `
      <p>Por defecto, Ansible considera que una tarea falló si el código de retorno es distinto de 0. <code>failed_when</code> permite cambiar esa lógica — a veces un rc != 0 no es un error, o a veces un rc 0 sí lo es.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">failed-when.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">tasks:
  # grep devuelve rc=1 cuando NO encuentra nada — eso no es error aquí
  - name: Verificar si el proceso existe
ansible.builtin.command: pgrep nginx
register: nginx_check
changed_when: false
failed_when: nginx_check.rc > 1   # Solo falla si rc >= 2 (error real)
# rc=0: proceso encontrado, rc=1: no encontrado, rc>=2: error

  # Falla si el disco supera el 90%
  - name: Verificar espacio antes de deploy
ansible.builtin.shell: df --output=pcent / | tail -1 | tr -d '%'
register: disk_pct
changed_when: false
failed_when: disk_pct.stdout | int > 90

  # nginx -t devuelve rc=0 pero el mensaje es en stderr
  - name: Validar configuración de nginx
ansible.builtin.command: nginx -t
register: nginx_test
changed_when: false
failed_when:
  - nginx_test.rc != 0
  - "'syntax is ok' not in nginx_test.stderr"

  # Combinación: failed si stderr tiene contenido Y rc != 0
  - name: Ejecutar script de validación
ansible.builtin.script: scripts/validar.sh
register: validation
changed_when: false
failed_when:
  - validation.rc != 0
  - validation.stderr | length > 0</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>ignore_errors vs failed_when:</strong> <code>ignore_errors: true</code> ignora TODOS los errores sin distinción — la tarea sigue reportando failed en el recap pero el playbook continúa. <code>failed_when</code> redefine qué es un error de forma precisa. Preferí siempre <code>failed_when</code>.</div>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Campos útiles del resultado:</strong> <code>rc</code> es el código de retorno del proceso. <code>stdout</code> y <code>stderr</code> son la salida estándar y de error como string. <code>stdout_lines</code> y <code>stderr_lines</code> son los mismos pero como lista de líneas.</div>
      </div>
    `
  },
  {
    title: 'Laboratorio: auditoría de sistema',
    body: `
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio</div>
        <div class="lab-content">
          <p><strong>Objetivo:</strong> Crear un playbook de auditoría que use changed_when y failed_when correctamente.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">lab-auditoria.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Auditoría del sistema
  hosts: localhost
  tasks:
- name: Versión del kernel
  ansible.builtin.command: uname -r
  register: kernel
  changed_when: false

- name: Espacio en disco raíz
  ansible.builtin.shell: df --output=pcent / | tail -1 | tr -d ' %'
  register: disk_uso
  changed_when: false
  failed_when: disk_uso.stdout | int > 95

- name: Verificar conectividad DNS
  ansible.builtin.command: host google.com
  register: dns_check
  changed_when: false
  failed_when: dns_check.rc != 0

- name: Reporte de auditoría
  ansible.builtin.debug:
    msg:
      - "Kernel: {{ kernel.stdout }}"
      - "Disco usado: {{ disk_uso.stdout }}%"
      - "DNS: OK"</code></pre>
          </div>
        </div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'changed_when',
    definition: 'Directiva que sobreescribe cuándo Ansible reporta changed: true para una tarea. Acepta false (nunca changed), true (siempre changed) o una expresión Jinja2 que evalúe la salida del comando.',
  },
  {
    term: 'failed_when',
    definition: 'Directiva que redefine qué condición constituye un fallo de tarea. Sobreescribe el comportamiento por defecto de verificar solo el código de retorno (rc). Permite que rc != 0 no sea fallo, o que rc == 0 sí lo sea.',
  },
  {
    term: 'rc (return code)',
    definition: 'Código de salida del proceso ejecutado por command o shell. El valor 0 indica éxito por convención Unix. Disponible como result.rc después de usar register.',
  },
  {
    term: 'ignore_errors',
    definition: 'Directiva que hace que el playbook continúe aunque la tarea falle. A diferencia de failed_when, no redefine qué es un error — simplemente lo ignora. Usar con precaución ya que puede ocultar errores reales.',
  },
],
quiz: [
  {
    question: '¿Por qué el módulo command siempre reporta changed: true por defecto?',
    options: [
      'Es un bug de Ansible que nunca fue corregido',
      'Porque Ansible no puede saber si el comando externo produjo cambios reales en el sistema',
      'Porque command solo se usa para comandos que modifican el sistema',
      'Porque changed: true es necesario para que los handlers funcionen',
    ],
    correctIndex: 1,
    explanation: 'Ansible implementa idempotencia conociendo el estado esperado de los recursos (archivos, paquetes, servicios). Para comandos externos arbitrarios, no tiene forma de saber qué cambiaron. Adopta la postura conservadora de reportar changed: true para que los handlers se activen correctamente.',
  },
  {
    question: '¿Cuándo usarías failed_when en lugar de ignore_errors?',
    options: [
      'Nunca — ignore_errors es más simple y hace lo mismo',
      'Cuando querés que ciertos códigos de retorno no sean tratados como errores, siendo más preciso que ignorarlos todos',
      'Solo cuando el comando usa stderr para output normal',
      'Cuando el comando puede tardar más de 30 segundos',
    ],
    correctIndex: 1,
    explanation: 'failed_when te permite definir exactamente qué condición es un error real. Por ejemplo, grep devuelve rc=1 cuando no encuentra nada — con failed_when podés tratar rc=0 y rc=1 como éxito y solo fallar con rc>=2. ignore_errors ignoraría todos los fallos, incluyendo errores reales de infraestructura.',
  },
  {
    question: '¿Qué significa changed_when: false en una tarea?',
    options: [
      'La tarea no se ejecuta',
      'La tarea reporta changed: false siempre, sin importar qué hizo el comando',
      'La tarea falla si el comando no produjo cambios',
      'La tarea se salta si nada cambió',
    ],
    correctIndex: 1,
    explanation: 'changed_when: false indica que la tarea NUNCA debe reportar un cambio, independientemente del resultado del comando. Es adecuado para comandos de solo lectura como df, uname, pgrep, ya que no modifican el estado del sistema y no deben disparar handlers.',
  },
],
troubleshooting: [
  {
    error: 'Handler se dispara en cada ejecución del playbook aunque nada cambió',
    cause: 'El módulo command o shell reporta changed: true por defecto, disparando el handler en cada corrida aunque el comando no haya modificado nada.',
    fix: 'Agregá changed_when a la tarea del comando. Para comandos de solo lectura: changed_when: false. Para comandos que pueden o no cambiar cosas, evaluá la salida: changed_when: "\'ya actualizado\' not in resultado.stdout".',
  },
  {
    error: 'El playbook falla con "grep" aunque el proceso no existe (rc=1)',
    cause: 'grep devuelve rc=1 cuando no encuentra coincidencias, que es un comportamiento normal y no un error. Ansible lo trata como fallo por defecto.',
    fix: 'Agregá failed_when: resultado.rc > 1 (solo falla con rc >= 2, que indica un error real de grep como archivo no encontrado). Combinalo con changed_when: false si el grep es de solo lectura.',
  },
  {
    error: "AnsibleError: The 'changed_when' is not a valid attribute",
    cause: 'Se está usando changed_when en un módulo que no es command, shell, raw o script — por ejemplo en apt o template.',
    fix: 'changed_when solo es relevante para módulos que no implementan idempotencia nativa. Los módulos declarativos (apt, template, file, etc.) ya gestionan changed correctamente. Remové changed_when de esos módulos.',
  },
],
realWorldCase: 'Un equipo de CI/CD tenía su pipeline fallando porque el playbook de deploy mostraba "changed" en cada corrida, lo que marcaba builds como "modificados". Aplicaron changed_when: false a todos los comandos de verificación y changed_when basado en stdout para el comando de migración de base de datos, logrando idempotencia real y reportes de CI precisos.',
  };
