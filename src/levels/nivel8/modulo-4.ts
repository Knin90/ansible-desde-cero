import type { ModuleContent } from '../types';

export const nivel8Mod4: ModuleContent =   {
levelId: 8,
moduleId: 4,
title: 'Idempotencia y retorno JSON',
objective: 'Dominar la estructura del retorno JSON de los módulos y controlar el comportamiento de changed y failed con changed_when y failed_when.',
duration: '2 horas',
objectives: [
  'Entender la estructura estándar del retorno JSON de cualquier módulo',
  'Usar changed_when para controlar cuándo una tarea reporta cambios',
  'Usar failed_when para definir condiciones personalizadas de fallo',
  'Habilitar y entender check_mode en módulos',
],
prerequisites: [
  'Entender register y variables registradas (Nivel 6, módulo 2)',
  'Conocer command vs shell (módulo anterior)',
],
steps: [
  {
    title: 'Anatomía del retorno JSON de un módulo',
    body: `
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>El retorno JSON de un módulo es como el recibo de una transacción bancaria. Siempre tiene campos estándar: ¿fue exitosa? (changed/failed), un mensaje de lo que pasó (msg), y datos específicos de la transacción (campos del módulo). Ansible "lee el recibo" para decidir si el play continúa o falla.</p>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">json</span><span class="code-block-filename">retorno-modulo-copy.json</span></div>
        <pre class="language-json"><code class="language-json">{
  "changed": true,
  "failed": false,
  "msg": "OK",
  "dest": "/etc/nginx/nginx.conf",
  "src": "/tmp/.ansible/tmp/ansible-tmp-xyz/nginx.conf",
  "checksum": "d41d8cd98f00b204e9800998ecf8427e",
  "size": 2048,
  "uid": 0,
  "gid": 0,
  "owner": "root",
  "group": "root",
  "mode": "0644",
  "state": "file",
  "backup_file": "/etc/nginx/nginx.conf.2024-01-15@10:30~"
}</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">json</span><span class="code-block-filename">retorno-modulo-command.json</span></div>
        <pre class="language-json"><code class="language-json">{
  "changed": true,
  "cmd": ["df", "-h", "/"],
  "rc": 0,
  "stdout": "Filesystem  Size  Used Avail Use% Mounted on\n/dev/sda1    50G   15G   33G  31% /",
  "stderr": "",
  "stdout_lines": ["Filesystem  Size  Used Avail Use% Mounted on", "/dev/sda1   50G  15G   33G 31% /"],
  "start": "2024-01-15 10:30:00.123456",
  "end": "2024-01-15 10:30:00.234567",
  "delta": "0:00:00.111111"
}</code></pre>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Campos universales presentes en TODOS los módulos:</strong>
          <ul>
            <li><code>changed</code> (bool) — ¿el módulo modificó el sistema?</li>
            <li><code>failed</code> (bool) — ¿el módulo falló?</li>
            <li><code>msg</code> (string) — mensaje descriptivo del resultado</li>
            <li><code>invocation</code> (dict) — los argumentos usados al llamar al módulo</li>
          </ul>
          <p>Campos adicionales varían por módulo: <code>rc</code>, <code>stdout</code>, <code>stderr</code> solo en command/shell; <code>checksum</code>, <code>dest</code>, <code>size</code> en copy; etc.</p>
        </div>
      </div>
    `
  },
  {
    title: 'changed_when y failed_when: control preciso de resultados',
    body: `
      <p>Por defecto, Ansible confía en que el módulo reporta <code>changed</code> y <code>failed</code> correctamente. Para módulos de ejecución (command, shell), podés sobreescribir este comportamiento.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">changed-failed-when.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Control de changed y failed
  hosts: all
  tasks:
# changed_when: false — comando de solo lectura
- name: Verificar espacio en disco
  ansible.builtin.command: df -h /
  register: disk_info
  changed_when: false    # Nunca reporta cambios

# changed_when con condición — changed solo si realmente cambió algo
- name: Compilar la aplicación
  ansible.builtin.command: make -C /opt/mi-app
  register: make_result
  changed_when: "'Nothing to be done' not in make_result.stdout"

# failed_when con condición personalizada de fallo
- name: Verificar que el disco tiene espacio suficiente
  ansible.builtin.command: df / --output=pcent
  register: disk_usage
  changed_when: false
  failed_when:
    - disk_usage.rc != 0
    - "'9' in disk_usage.stdout_lines[-1]"   # Falla si uso > 90%

# Combinar changed_when y failed_when
- name: Ejecutar script de validación
  ansible.builtin.shell: /opt/scripts/validar_config.sh
  register: validacion
  changed_when: "'CAMBIOS APLICADOS' in validacion.stdout"
  failed_when: "'ERROR' in validacion.stdout or validacion.rc != 0"

# failed_when: false — nunca falla (útil para comandos opcionales)
- name: Limpiar archivos temporales (si existen)
  ansible.builtin.command: rm -rf /tmp/mi-app-temp/
  changed_when: false
  failed_when: false   # No falla si el directorio no existe</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>No abuses de failed_when: false:</strong> Silenciar todos los errores puede ocultar problemas reales. Usá <code>failed_when: false</code> solo cuando un fallo es una condición esperada y manejada (como rm de un archivo que puede no existir). Para el resto, dejá que Ansible falle correctamente.</div>
      </div>
    `
  },
  {
    title: 'check_mode: ensayo en seco antes de ejecutar',
    body: `
      <p><code>check_mode</code> (o <code>--check</code> en CLI) ejecuta el playbook en "modo simulado". Los módulos informan qué harían sin hacer cambios reales. Es una forma de validar antes de ejecutar en producción.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">check-mode.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Ejecutar en modo simulado — no hace cambios reales
ansible-playbook site.yml --check

# Modo simulado con diff — muestra qué cambiaría en archivos
ansible-playbook site.yml --check --diff

# Solo mostrar diff de archivos específicos
ansible-playbook site.yml --check --diff --tags config</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">check-mode-tareas.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Play con control de check_mode por tarea
  hosts: all
  tasks:
# Esta tarea siempre se ejecuta, incluso en check_mode
# Útil para tareas de verificación que no hacen cambios
- name: Verificar que la app responde (siempre ejecutar)
  ansible.builtin.uri:
    url: http://localhost:8080/health
    method: GET
  check_mode: false   # Ignora --check, siempre ejecuta

# Esta tarea SOLO se ejecuta en check_mode
# Útil para simulaciones específicas
- name: Mostrar advertencia en check mode
  ansible.builtin.debug:
    msg: "Simulación: se instalaría nginx {{ nginx_version }}"
  when: ansible_check_mode   # Variable bool: true si --check

# Módulos que NO soportan check_mode: command, shell, raw
# Siempre ejecutan aunque se use --check
# Para evitar esto, agregar: check_mode: true (salta la tarea en check mode)
- name: Reiniciar servicio (omitir en check mode)
  ansible.builtin.service:
    name: nginx
    state: restarted
  check_mode: true   # En check_mode, solo reporta lo que haría sin hacer nada</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Flujo recomendado para cambios en producción:</strong> (1) <code>ansible-playbook --check --diff site.yml</code> para ver qué cambiaría. (2) Revisá el diff. (3) Si todo se ve bien, <code>ansible-playbook site.yml</code> para aplicar. Este flujo reduce significativamente el riesgo de cambios inesperados en producción.</div>
      </div>
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio: explorá el retorno JSON</div>
        <div class="lab-content">
          <p>Inspecciona el retorno completo de diferentes módulos:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">lab-retorno-json.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Lab — explorar retornos JSON
  hosts: localhost
  tasks:
- name: Resultado de stat
  ansible.builtin.stat:
    path: /tmp
  register: stat_result

- name: Ver estructura completa de stat
  ansible.builtin.debug:
    var: stat_result

- name: Resultado de command
  ansible.builtin.command: uptime
  register: uptime_result
  changed_when: false

- name: Ver estructura completa de command
  ansible.builtin.debug:
    var: uptime_result</code></pre>
          </div>
        </div>
      </div>
    `
  }
],
quiz: [
  {
    question: '¿Cuándo debería usar `changed_when: false`?',
    options: [
      'En todas las tareas para evitar que el playbook reporte cambios',
      'Solo en tareas de solo lectura que consultan pero no modifican el sistema',
      'Cuando el módulo falla con exit code 1',
      'Para que los handlers no se disparen',
    ],
    correctIndex: 1,
    explanation: 'changed_when: false es apropiado para tareas que solo consultan el sistema (df, uptime, cat, curl --head, etc.) sin modificarlo. Si una tarea realmente hace cambios pero ponés changed_when: false, estarás ocultando esos cambios de los reportes y los handlers no se dispararán correctamente.',
  },
  {
    question: '¿Cuál es el efecto de ejecutar `ansible-playbook --check --diff site.yml`?',
    options: [
      'Ejecuta el playbook y luego muestra un resumen de los cambios',
      'Simula la ejecución mostrando qué haría cada módulo, y muestra los diffs de archivos que cambiarían',
      'Verifica la sintaxis del playbook sin ejecutar nada',
      'Ejecuta solo las tareas con `check_mode: true`',
    ],
    correctIndex: 1,
    explanation: '--check activa el modo simulado: los módulos reportan qué harían sin hacer cambios reales. --diff agrega el diff (antes/después) de archivos que serían modificados por módulos como template, copy, lineinfile. Juntos, son la forma estándar de validar cambios antes de aplicarlos en producción.',
  },
  {
    question: '¿Por qué el módulo `command` reporta `changed: true` incluso cuando ejecuta un comando que no cambia nada?',
    options: [
      'Es un bug de Ansible que no se ha corregido',
      'command no tiene forma de saber si el comando modificó algo — eso depende del comando específico. Por seguridad, reporta changed:true siempre',
      'Solo pasa con el módulo command, no con shell',
      'Porque el módulo command siempre modifica el archivo de logs del sistema',
    ],
    correctIndex: 1,
    explanation: 'El módulo command ejecuta un proceso y recibe su exit code y stdout/stderr. No tiene forma de saber si ese proceso modificó el sistema o solo lo consultó. Por eso reporta changed:true conservadoramente. Para indicar que el comando no hace cambios, el operador debe agregar `changed_when: false` explícitamente.',
  },
],
troubleshooting: [
  {
    error: 'Handler no se dispara aunque la tarea reporta changed:true',
    cause: 'El handler solo se dispara si la tarea tiene changed:true Y la tarea ejecutó un `notify`. Si usás `changed_when: false`, el handler nunca se dispara aunque la tarea haya hecho cambios reales.',
    fix: 'Asegurate de que `changed_when` refleje si la tarea realmente hizo cambios. Si pusiste `changed_when: false` en una tarea que sí necesita disparar un handler, usá una condición más precisa o eliminá changed_when:false.',
  },
  {
    error: 'check_mode no detecta cambios en tareas con `command`',
    cause: 'Los módulos command, shell y raw no implementan check_mode: siempre ejecutan aunque se use --check.',
    fix: 'Para evitar que command/shell ejecuten en check_mode, agregá `when: not ansible_check_mode` a esas tareas. O usá `check_mode: true` en la tarea para que sea completamente skipped en modo simulado.',
  },
  {
    error: 'failed_when con múltiples condiciones no funciona como se espera',
    cause: 'En YAML, una lista bajo failed_when se evalúa con AND (todas deben ser verdad para fallar). Si querés OR, necesitás una expresión Jinja2.',
    fix: 'Para OR: `failed_when: "condicion1 or condicion2"`. Para AND: `failed_when: ["condicion1", "condicion2"]` (lista). Podés también usar `failed_when: "condicion1 and condicion2"` en una sola línea string.',
  },
],
  };
