import type { ModuleContent } from '../types';

export const nivel8Mod1: ModuleContent =   {
levelId: 8,
moduleId: 1,
title: 'Cómo funcionan los módulos',
objective: 'Entender el ciclo de vida completo de un módulo Ansible: FQCN, transferencia, ejecución y retorno de resultados.',
duration: '2 horas',
objectives: [
  'Entender el ciclo de vida completo de un módulo: desde el control node hasta el host remoto',
  'Usar FQCN (Fully Qualified Collection Name) correctamente',
  'Distinguir cuándo usar command, shell, raw y script',
  'Entender qué significa idempotencia y cómo lograrla con command/shell',
],
prerequisites: [
  'Haber ejecutado al menos un playbook con tareas básicas',
  'Conocer la conexión SSH en Ansible (Nivel 2)',
],
steps: [
  {
    title: 'El ciclo de vida de un módulo Ansible',
    body: `
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Un módulo Ansible es como un mensajero especializado. Cuando le pedís a Ansible que instale nginx, Ansible busca al "mensajero de paquetes" (el módulo package), lo envía al servidor remoto con las instrucciones exactas, el mensajero hace el trabajo, te trae de vuelta un reporte JSON detallado ("instalé nginx versión X, cambié: sí"), y luego se destruye a sí mismo para no dejar rastros.</p>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Los 6 pasos del ciclo de vida de un módulo:</strong>
          <ol>
            <li>Ansible localiza el archivo Python del módulo en el control node</li>
            <li>Serializa los argumentos del módulo a JSON</li>
            <li>Transfiere el módulo al host remoto (por defecto a <code>/tmp/.ansible/tmp/</code>)</li>
            <li>Python ejecuta el módulo en el host remoto con los argumentos</li>
            <li>El módulo imprime un JSON en stdout y termina</li>
            <li>Ansible lee el JSON, interpreta el resultado, y borra el módulo del host</li>
          </ol>
        </div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">observar-transferencia.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Ver el proceso de transferencia y ejecución con -vvv
ansible-playbook -vvv mi-playbook.yml

# Verás algo como:
# TASK [Instalar nginx]
# Using module file /usr/lib/python3/dist-packages/ansible/modules/package.py
# Transferring module to remote: /tmp/.ansible/tmp/ansible-tmp-xyz/package.py
# EXEC /bin/sh -c 'python3 /tmp/.ansible/tmp/ansible-tmp-xyz/package.py'
# {"changed": true, "msg": "nginx 1.24.0 installed"}</code></pre>
      </div>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>pipelining:</strong> Con <code>pipelining = true</code> en ansible.cfg, Ansible omite el paso de transferencia física del módulo a disco. En su lugar, lo envía directamente por stdin de SSH. Reduce la latencia por tarea y requiere que <code>requiretty</code> no esté en sudoers.</div>
      </div>
    `
  },
  {
    title: 'FQCN: Fully Qualified Collection Name',
    body: `
      <p>Los módulos de Ansible se identifican por su <strong>Fully Qualified Collection Name (FQCN)</strong>: <code>namespace.colección.módulo</code>. Es la forma recomendada y sin ambigüedad para referenciar módulos.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">fqcn-ejemplos.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# Forma ANTIGUA (sin FQCN) — puede generar ambigüedad
- name: Instalar nginx (forma antigua)
  package:
name: nginx
state: present

# Forma CORRECTA con FQCN — sin ambigüedad
- name: Instalar nginx (FQCN)
  ansible.builtin.package:
name: nginx
state: present

# Comparación de módulos built-in vs colecciones externas:
# ansible.builtin.copy     → módulo incluido en Ansible core
# community.general.ufw    → módulo de la colección community.general
# amazon.aws.ec2_instance  → módulo de la colección amazon.aws

# Listar módulos disponibles:
# ansible-doc -l
# ansible-doc ansible.builtin.copy  (ver documentación de un módulo)</code></pre>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Estructura del FQCN:</strong>
          <ul>
            <li><code>ansible.builtin</code> — módulos incluidos en Ansible Core (siempre disponibles)</li>
            <li><code>community.general</code> — colección mantenida por la comunidad (requiere instalación)</li>
            <li><code>amazon.aws</code> — módulos para AWS (requiere instalación + boto3)</li>
            <li><code>azure.azcollection</code> — módulos para Azure (requiere instalación)</li>
            <li><code>google.cloud</code> — módulos para GCP (requiere instalación)</li>
          </ul>
        </div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalar-colecciones.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Instalar colección de la comunidad
ansible-galaxy collection install community.general

# Instalar colección de AWS
ansible-galaxy collection install amazon.aws
pip install boto3 botocore  # Dependencia Python

# Instalar múltiples colecciones desde archivo
# requirements.yml:
# collections:
#   - name: community.general
#   - name: amazon.aws
#     version: ">=6.0"
ansible-galaxy collection install -r requirements.yml

# Ver colecciones instaladas
ansible-galaxy collection list</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>¿Por qué usar FQCN?</strong> Sin FQCN, si tenés dos colecciones con un módulo del mismo nombre corto (como <code>copy</code>), Ansible puede usar el módulo incorrecto. El FQCN garantiza que siempre se use el módulo exacto que querés, sin importar qué colecciones tengas instaladas.</div>
      </div>
    `
  },
  {
    title: 'command vs shell vs raw vs script — cuándo usar cada uno',
    body: `
      <p>Ansible tiene cuatro módulos para ejecutar comandos. Elegir el correcto es importante para seguridad, idempotencia y compatibilidad.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">command-shell-raw-script.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Comparativa de módulos de ejecución
  hosts: all
  tasks:
# ansible.builtin.command
# - No usa /bin/sh, invoca directamente el binario
# - NO interpreta: |, &, >, <, $VAR, *, ~
# - Más seguro: sin riesgo de inyección de shell
# - Requiere Python en el host remoto
- name: command — ejecutar binario directamente
  ansible.builtin.command: /usr/bin/myapp --config /etc/myapp.conf
  register: app_result
  changed_when: "'Configuration loaded' in app_result.stdout"

# ansible.builtin.shell
# - Usa /bin/sh para ejecutar el comando
# - SÍ interpreta: |, &, >, <, $VAR, *, ~
# - Menos seguro si las variables no están bien escapadas
# - Requiere Python en el host remoto
- name: shell — cuando necesitás pipes o redirecciones
  ansible.builtin.shell: "journalctl -u nginx --since today | grep ERROR | wc -l"
  register: error_count
  changed_when: false

# ansible.builtin.raw
# - Ejecuta via SSH directamente, sin módulo Python
# - No requiere Python en el host remoto
# - Útil para: bootstrapping, hosts sin Python, dispositivos de red
# - Sin idempotencia automática, sin check_mode
- name: raw — cuando no hay Python en el host
  ansible.builtin.raw: apt-get install -y python3
  when: ansible_python_interpreter is not defined
  changed_when: false

# ansible.builtin.script
# - Transfiere un script local al host y lo ejecuta
# - El script puede ser bash, Python, Ruby, etc.
# - Útil para scripts complejos que no vale la pena convertir a módulos
- name: script — ejecutar script local en el host
  ansible.builtin.script: scripts/setup_app.sh
  args:
    creates: /opt/app/.configured   # Idempotente: no ejecuta si existe</code></pre>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Regla de decisión para elegir módulo de ejecución:</strong>
          <ol>
            <li>¿Existe un módulo específico para lo que necesitás? (apt, service, copy...) → <strong>Usá ese módulo</strong></li>
            <li>¿No necesitás shell features (pipes, variables de entorno)? → <strong>command</strong></li>
            <li>¿Necesitás pipes o redirecciones? → <strong>shell</strong></li>
            <li>¿El host no tiene Python? → <strong>raw</strong></li>
            <li>¿Tenés un script complejo que querés transferir y ejecutar? → <strong>script</strong></li>
          </ol>
        </div>
      </div>
    `
  },
  {
    title: 'Idempotencia: changed_when y creates/removes',
    body: `
      <p>Los módulos específicos (package, service, file, copy) son idempotentes por diseño. Los módulos de ejecución (command, shell) NO lo son por defecto — siempre reportan <code>changed: true</code>. Hay dos formas de hacerlos idempotentes:</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">idempotencia-commands.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Hacer commands idempotentes
  hosts: all
  tasks:
# Método 1: creates/removes — basado en existencia de archivos
- name: Extraer binario (solo si no existe)
  ansible.builtin.command: tar -xzf /opt/myapp.tar.gz -C /opt/
  args:
    creates: /opt/myapp/bin/myapp   # NO ejecuta si este archivo ya existe

- name: Limpiar archivo temporal (solo si existe)
  ansible.builtin.command: rm -f /tmp/install.lock
  args:
    removes: /tmp/install.lock       # NO ejecuta si este archivo NO existe

# Método 2: changed_when — controlar cuándo reportar cambios
# Nunca reporta cambios (comando de solo lectura)
- name: Verificar espacio en disco
  ansible.builtin.command: df -h /
  register: disk_info
  changed_when: false

# Reporta changed solo si la salida contiene cierto texto
- name: Compilar aplicación
  ansible.builtin.command: make -C /opt/mi-app
  register: make_result
  changed_when: "'Nothing to be done' not in make_result.stdout"

# Método 3: failed_when — controlar cuándo reportar fallo
- name: Verificar que la aplicación responde (no falla si está caída)
  ansible.builtin.command: curl -sf http://localhost:8080/health
  register: health_check
  changed_when: false
  failed_when: false    # Nunca falla, incluso si curl retorna non-zero

- name: Alertar si la app no responde
  ansible.builtin.debug:
    msg: "ALERTA: aplicación no responde"
  when: health_check.rc != 0</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>check_mode y command:</strong> Los módulos command, shell, y raw ejecutan igualmente en <code>--check</code> mode a menos que agregues <code>check_mode: false</code> explícitamente. Esto puede causar diferencias entre lo que check_mode reporta y lo que pasa en ejecución real.</div>
      </div>
    `
  }
],
quiz: [
  {
    question: '¿Qué significa el FQCN `ansible.builtin.copy`?',
    options: [
      'Un módulo de la colección "builtin" creada por "ansible" como organización',
      'El módulo "copy" que pertenece a la colección "builtin" del namespace "ansible" — es decir, incluido en el core de Ansible',
      'El módulo de copia más básico que existe en Ansible',
      'Un alias antiguo para el módulo copy que ya no funciona',
    ],
    correctIndex: 1,
    explanation: 'El FQCN tiene el formato namespace.colección.módulo. `ansible.builtin.copy` significa: namespace "ansible", colección "builtin" (los módulos incluidos en el core), módulo "copy". Los módulos ansible.builtin siempre están disponibles sin instalar colecciones adicionales.',
  },
  {
    question: '¿Cuándo debería usar `ansible.builtin.raw` en lugar de `ansible.builtin.command`?',
    options: [
      'Cuando el comando tiene pipes (|) o redirecciones (>)',
      'Cuando el host remoto no tiene Python instalado',
      'Cuando el módulo command es demasiado lento',
      'Cuando necesitás variables de entorno del shell',
    ],
    correctIndex: 1,
    explanation: 'raw ejecuta el comando via SSH directamente sin transferir ni ejecutar ningún módulo Python. Es la única opción para hosts que no tienen Python instalado (routers, switches, o sistemas mínimos de Linux durante el bootstrapping). Para hosts con Python, siempre preferí command o shell.',
  },
  {
    question: 'Una tarea con `ansible.builtin.command` siempre reporta `changed: true`. ¿Cuál es la forma correcta de indicar que es solo lectura?',
    options: [
      'Usar `state: query` en el módulo',
      'Agregar `changed_when: false` a la tarea',
      'Usar `ansible.builtin.shell` en lugar de `ansible.builtin.command`',
      'Agregar `--check` al comando',
    ],
    correctIndex: 1,
    explanation: '`changed_when: false` le indica a Ansible que esta tarea nunca reporta cambios, sin importar el resultado del comando. Es la forma estándar de marcar comandos de solo lectura (consultas, verificaciones) para que no contaminen el resumen de "changed" del playbook.',
  },
],
troubleshooting: [
  {
    error: 'Module "copy" not found — ERROR! No module named copy',
    cause: 'Estás usando el nombre corto "copy" en lugar del FQCN, y hay un conflicto con un módulo de otra colección instalada.',
    fix: 'Usá siempre el FQCN: `ansible.builtin.copy`. Si querés usar el nombre corto por compatibilidad, podés definir `collections:` al inicio del play para establecer el orden de búsqueda de colecciones.',
  },
  {
    error: 'command module no funciona con pipes (|) ni redirecciones (>)',
    cause: 'Correcto por diseño: `command` no usa /bin/sh y no interpreta metacaracteres de shell.',
    fix: 'Usá `ansible.builtin.shell` cuando necesitás pipes, redirecciones o expansión de variables de entorno. Recordá agregar `changed_when: false` o criterios de idempotencia.',
  },
  {
    error: 'Permission denied al ejecutar módulo en /tmp',
    cause: 'El directorio /tmp del host remoto tiene la opción noexec montada, o el usuario de Ansible no tiene permisos de escritura en /tmp.',
    fix: 'Cambiá el directorio temporal en ansible.cfg: `remote_tmp = ~/.ansible/tmp`. O usá `pipelining = true` para evitar escribir módulos a disco.',
  },
],
  };
