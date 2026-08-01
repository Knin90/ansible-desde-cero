import type { ModuleContent } from './types';

export const nivel17Modules: ModuleContent[] = [
  {
    levelId: 17,
    moduleId: 1,
    title: 'Check Mode y Diff Mode',
    objective: 'Usar --check y --diff para validar cambios antes de aplicarlos en producción, evitando errores costosos con dry-runs informativos.',
    duration: '1–2 horas',
    objectives: [
      'Comprender por qué el dry-run es esencial antes de cambios en producción',
      'Usar --check para simular la ejecución sin aplicar cambios',
      'Usar --diff para visualizar las diferencias en archivos de texto',
      'Controlar qué tareas se ejecutan en check mode con check_mode: false y ansible_check_mode',
    ],
    prerequisites: [
      'Completados los Niveles 0–16',
      'Playbooks funcionales con al menos un entorno de staging',
      'Acceso SSH a hosts remotos',
    ],
    steps: [
      {
        title: '¿Por qué importa el dry-run antes de producción?',
        body: `
          <p>Producción es sagrado. Un error en un playbook puede dejar un servicio caído, borrar configuración crítica o romper la conectividad de red. El modo dry-run (simulación) de Ansible te permite ver exactamente qué va a pasar antes de que pase.</p>
          <div class="highlight-box">
            <p><strong>Regla de oro en infraestructura:</strong> nunca apliques un playbook en producción sin haberlo corrido primero con <code>--check --diff</code>. Esta práctica separa a los operadores experimentados de los que aprenden de accidentes.</p>
          </div>
          <p>Los dos modos se complementan:</p>
          <ul>
            <li><strong>--check</strong>: simula la ejecución, reporta qué cambiaría (sin tocar nada)</li>
            <li><strong>--diff</strong>: muestra el diff de archivos de texto que se modificarían</li>
          </ul>
          <div class="analogy-box">
            <div class="analogy-box-header">💡 Analogía</div>
            <p>Pensá en <code>--check</code> como el ensayo de una obra de teatro — los actores siguen el guión pero el escenario no cambia. <code>--diff</code> es el director que anota en el guión exactamente qué líneas van a cambiar.</p>
          </div>
        `,
      },
      {
        title: 'El flag --check: simulación completa',
        body: `
          <p>Con <code>--check</code>, Ansible ejecuta todos los módulos en modo simulación. Cada módulo reporta si <em>habría</em> hecho un cambio, pero no lo aplica.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">dry-run.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Dry-run básico
ansible-playbook site.yml --check

# Dry-run con inventario específico
ansible-playbook -i inventory/production site.yml --check

# Dry-run limitado a un grupo de hosts
ansible-playbook site.yml --check --limit webservers

# Dry-run de una sola tarea (por tag)
ansible-playbook site.yml --check --tags nginx</code></pre>
          </div>
          <p>La salida mostrará <code>changed</code> para tareas que habrían hecho algo, y <code>ok</code> para las que ya estaban en el estado deseado:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">text</span><span class="code-block-filename">output-check.txt</span></div>
            <pre class="language-text"><code class="language-text">TASK [nginx : Ensure nginx is installed]
ok: [web01]   ← ya estaba instalado, no habría cambio

TASK [nginx : Deploy nginx.conf]
changed: [web01]   ← habría sobreescrito el archivo

TASK [nginx : Start and enable nginx]
ok: [web01]   ← ya estaba corriendo</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Limitación importante:</strong> --check no puede simular correctamente tareas que dependen de archivos creados por tareas anteriores. Si la tarea A crea un archivo y la tarea B lo modifica, en --check la tarea B puede fallar porque el archivo no existe todavía.</div>
          </div>
        `,
      },
      {
        title: 'El flag --diff: ver los cambios en archivos',
        body: `
          <p><code>--diff</code> activa la visualización de diferencias para módulos que manipulan archivos de texto: <code>copy</code>, <code>template</code>, <code>lineinfile</code>, <code>blockinfile</code>, etc.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">diff-mode.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Lo más útil: check + diff juntos
ansible-playbook site.yml --check --diff

# Solo diff (aplica cambios pero muestra el diff)
ansible-playbook site.yml --diff</code></pre>
          </div>
          <p>La salida con <code>--diff</code> muestra el diff estilo Unix:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">text</span><span class="code-block-filename">output-diff.txt</span></div>
            <pre class="language-text"><code class="language-text">TASK [nginx : Deploy nginx.conf]
--- before: /etc/nginx/nginx.conf
+++ after: /home/user/.ansible/tmp/nginx.conf
@@ -10,7 +10,7 @@
     gzip on;
-    worker_processes 2;
+    worker_processes 4;
     keepalive_timeout 65;</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content">Las líneas con <code>-</code> (rojo) son lo que se <em>eliminaría</em>. Las líneas con <code>+</code> (verde) son lo que se <em>agregaría</em>. Exactamente como <code>git diff</code>.</div>
          </div>
        `,
      },
      {
        title: 'check_mode: false — tareas que siempre deben correr',
        body: `
          <p>Algunas tareas deben ejecutarse incluso en modo dry-run: validaciones, checks de estado, comandos de sólo lectura. Usá <code>check_mode: false</code> para forzar su ejecución.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">tasks/validate.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">- name: Verificar que el certificado SSL es válido (siempre ejecutar)
  ansible.builtin.command:
    cmd: openssl x509 -noout -checkend 86400 -in /etc/ssl/certs/site.crt
  check_mode: false   # ← se ejecuta incluso con --check
  register: cert_check
  failed_when: cert_check.rc != 0

- name: Obtener versión de nginx instalada
  ansible.builtin.command:
    cmd: nginx -v
  check_mode: false
  register: nginx_version
  changed_when: false  # este comando nunca "cambia" nada

- name: Mostrar versión detectada
  ansible.builtin.debug:
    msg: "Nginx: {{ nginx_version.stderr }}"</code></pre>
          </div>
          <div class="highlight-box">
            <p><strong>Cuándo usar check_mode: false:</strong></p>
            <ul>
              <li>Comandos de validación (<code>nginx -t</code>, <code>openssl verify</code>)</li>
              <li>Lecturas de estado que otras tareas necesitan como input</li>
              <li>Comandos de sólo lectura que nunca modifican el sistema</li>
            </ul>
          </div>
        `,
      },
      {
        title: 'La variable ansible_check_mode',
        body: `
          <p>Ansible expone la variable booleana <code>ansible_check_mode</code> que es <code>true</code> cuando corrés con <code>--check</code>. Podés usarla para comportamiento condicional.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">tasks/conditional-check.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">- name: Notificar que estamos en modo simulación
  ansible.builtin.debug:
    msg: "MODO DRY-RUN — ningún cambio será aplicado"
  when: ansible_check_mode

- name: Reiniciar nginx (solo en modo real)
  ansible.builtin.service:
    name: nginx
    state: restarted
  when: not ansible_check_mode   # evitar restart innecesario en dry-run
  notify: reload nginx

- name: Enviar alerta a Slack
  ansible.builtin.uri:
    url: "{{ slack_webhook_url }}"
    method: POST
    body_format: json
    body:
      text: "Deployment iniciado en {{ inventory_hostname }}"
  when: not ansible_check_mode   # no disparar alertas en dry-run</code></pre>
          </div>
          <div class="tech-term-box">
            <div class="tech-term-label">En términos técnicos</div>
            <code>ansible_check_mode</code> es una <em>magic variable</em> de Ansible — siempre disponible sin necesidad de definirla. Su valor es inyectado por el motor de Ansible en el momento de la ejecución.
          </div>
        `,
      },
      {
        title: 'Práctica: protocolo pre-producción con --check --diff',
        body: `
          <p>El protocolo profesional antes de cualquier deployment en producción combina --check y --diff como una compuerta de seguridad.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">deploy-protocol.sh</span></div>
            <pre class="language-bash"><code class="language-bash">#!/bin/bash
# Protocolo seguro de deployment

PLAYBOOK="site.yml"
INVENTORY="inventory/production"
LIMIT="\${1:-all}"  # parámetro opcional: grupo o host

echo "=== FASE 1: Dry-run con diff ==="
ansible-playbook -i "$INVENTORY" "$PLAYBOOK" \\
  --limit "$LIMIT" \\
  --check \\
  --diff

echo ""
echo "¿Revisaste el output? ¿Todo se ve correcto?"
read -p "Escribí 'DEPLOY' para continuar: " confirm

if [ "$confirm" = "DEPLOY" ]; then
  echo "=== FASE 2: Deployment real ==="
  ansible-playbook -i "$INVENTORY" "$PLAYBOOK" \\
    --limit "$LIMIT" \\
    --diff
else
  echo "Deployment cancelado."
  exit 1
fi</code></pre>
          </div>
          <div class="highlight-box">
            <p><strong>Protocolo mínimo para producción:</strong></p>
            <ol>
              <li>Correr <code>--check --diff</code> y revisar toda la salida</li>
              <li>Confirmar que los cambios esperados (y solo esos) aparecen como <code>changed</code></li>
              <li>Correr sin <code>--check</code> pero con <code>--diff</code> para tener el log del cambio real</li>
              <li>Verificar manualmente el servicio tras el deployment</li>
            </ol>
          </div>
        `,
      },
    ],
    quiz: [
      {
        question: '¿Cuál es la diferencia principal entre --check y --diff?',
        options: [
          '--check simula sin aplicar cambios; --diff muestra las diferencias en archivos de texto',
          '--check solo funciona con módulos de archivos; --diff funciona con todos los módulos',
          '--check requiere privilegios de root; --diff no',
          'Son sinónimos, hacen exactamente lo mismo',
        ],
        correctIndex: 0,
        explanation: '--check es el modo dry-run general (nada se aplica). --diff es complementario: muestra el diff de los archivos de texto que cambiarían. Se usan juntos: --check --diff.',
      },
      {
        question: '¿Para qué se usa check_mode: false en una tarea?',
        options: [
          'Para que la tarea nunca haga cambios',
          'Para forzar que la tarea se ejecute incluso cuando se corre con --check',
          'Para desactivar el modo diff en esa tarea',
          'Para hacer que la tarea corra solo en producción',
        ],
        correctIndex: 1,
        explanation: 'check_mode: false fuerza la ejecución de la tarea incluso en modo dry-run. Es útil para validaciones, checks de estado y comandos de solo lectura que otras tareas necesitan como input.',
      },
      {
        question: '¿Cuándo es true la variable ansible_check_mode?',
        options: [
          'Cuando el playbook no tiene errores',
          'Cuando se ejecuta el playbook con el flag --check',
          'Cuando check_mode: false está definido en la tarea',
          'Cuando Ansible detecta que el host es de producción',
        ],
        correctIndex: 1,
        explanation: 'ansible_check_mode es una magic variable que Ansible inyecta automáticamente. Es true cuando el playbook se ejecuta con --check, false en ejecución normal. Útil para condicionales como when: not ansible_check_mode.',
      },
    ],
    realWorldCase: 'Un equipo de SRE tiene la política de que ningún PR puede ser mergeado sin adjuntar la salida de --check --diff contra staging. Esto detectó un bug en un template Jinja2 que habría borrado 200 líneas de configuración de nginx en producción.',
    troubleshooting: [
      {
        error: 'La tarea B falla en --check porque el archivo creado por la tarea A no existe',
        cause: 'En check mode, la tarea A no creó el archivo real; B intenta procesarlo y falla porque físicamente no está ahí',
        fix: 'Agregá check_mode: false a la tarea A si es seguro ejecutarla, o usá when: not ansible_check_mode en la tarea B para saltearla en dry-run',
      },
      {
        error: '--diff no muestra diferencias para archivos binarios',
        cause: '--diff solo funciona con contenido de texto. Para archivos binarios (imágenes, PKI, etc.) solo muestra "binary files differ"',
        fix: 'Es comportamiento esperado. Para archivos binarios verificá el hash (checksum) manualmente o usá el módulo stat para comparar metadatos',
      },
      {
        error: 'El playbook reporta "changed" en --check pero "ok" al ejecutarlo realmente',
        cause: 'Algunos módulos tienen lógica de detección de cambios imperfecta o conservadora en check mode',
        fix: 'Es falso positivo benigno. Verificá el resultado real con --diff en la ejecución normal. Si persiste, revisá idempotencia de la tarea con ansible-lint',
      },
    ],
  },

  {
    levelId: 17,
    moduleId: 2,
    title: 'Molecule — Testing de Roles',
    objective: 'Implementar tests automatizados de roles Ansible con Molecule, usando Docker como driver para crear entornos de prueba reproducibles y multi-plataforma.',
    duration: '2–3 horas',
    objectives: [
      'Entender por qué el testing de roles es fundamental para infraestructura confiable',
      'Instalar y configurar Molecule con el driver Docker',
      'Escribir escenarios de test completos con converge.yml y verify.yml',
      'Ejecutar tests en múltiples plataformas (Ubuntu 22 + Rocky 9) simultáneamente',
    ],
    prerequisites: [
      'Completados los Niveles 0–16',
      'Docker instalado y corriendo localmente',
      'Al menos un rol Ansible propio escrito y funcional',
      'Python 3.8+ con pip disponible',
    ],
    steps: [
      {
        title: 'Por qué testear roles: TDD para infraestructura',
        body: `
          <p>Los roles Ansible son código. El código sin tests es deuda técnica que eventualmente cobra intereses. Un rol sin tests puede funcionar hoy en Ubuntu 22 pero romper mañana en Rocky 9, o funcionar en desarrollo pero fallar en producción con una configuración diferente.</p>
          <div class="highlight-box">
            <p><strong>Molecule aplica TDD a infraestructura:</strong> escribís el test primero (¿qué debe hacer este rol?), luego escribís el rol hasta que el test pase. Cada cambio al rol corre todos los tests automáticamente.</p>
          </div>
          <p>Molecule se encarga de:</p>
          <ul>
            <li>Crear un contenedor Docker limpio (como si fuera un servidor fresco)</li>
            <li>Aplicar tu rol (<code>converge</code>)</li>
            <li>Verificar que el resultado es correcto (<code>verify</code>)</li>
            <li>Destruir el contenedor (<code>destroy</code>)</li>
          </ul>
          <div class="analogy-box">
            <div class="analogy-box-header">💡 Analogía</div>
            <p>Molecule es para tus roles lo que pytest/jest son para tu código de aplicación. Cada rol debería tener su propio conjunto de tests que se pueden correr con un solo comando.</p>
          </div>
        `,
      },
      {
        title: 'Instalación de Molecule con Docker driver',
        body: `
          <p>Molecule se instala vía pip. El driver Docker es el más común para CI/CD porque Docker corre en cualquier runner de CI sin configuración adicional.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">install-molecule.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Crear virtualenv (recomendado)
python3 -m venv ~/.venv/ansible
source ~/.venv/ansible/bin/activate

# Instalar Molecule + driver Docker + Ansible
pip install molecule molecule-docker ansible

# Verificar instalación
molecule --version
# molecule 6.x.x using python 3.x

# Inicializar Molecule en un rol existente
cd roles/mi_rol
molecule init scenario --driver-name docker

# O crear un rol nuevo con Molecule incluido
molecule init role mi_nuevo_rol --driver-name docker</code></pre>
          </div>
          <p>Molecule crea la estructura <code>molecule/default/</code> dentro del rol:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">text</span><span class="code-block-filename">estructura-molecule.txt</span></div>
            <pre class="language-text"><code class="language-text">roles/mi_rol/
├── defaults/
├── tasks/
├── templates/
└── molecule/
    └── default/          ← escenario "default"
        ├── molecule.yml   ← configuración del escenario
        ├── converge.yml   ← playbook que aplica el rol
        └── verify.yml     ← playbook de verificación</code></pre>
          </div>
        `,
      },
      {
        title: 'molecule.yml — configuración del escenario',
        body: `
          <p>El archivo <code>molecule.yml</code> define las plataformas de test, el driver, el provisioner y el verifier.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">molecule/default/molecule.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
dependency:
  name: galaxy

driver:
  name: docker

platforms:
  - name: ubuntu-22
    image: geerlingguy/docker-ubuntu2204-ansible:latest
    pre_build_image: true
    privileged: true   # para systemd

  - name: rocky-9
    image: geerlingguy/docker-rockylinux9-ansible:latest
    pre_build_image: true
    privileged: true

provisioner:
  name: ansible
  playbooks:
    converge: converge.yml
    verify: verify.yml
  config_options:
    defaults:
      interpreter_python: auto_silent

verifier:
  name: ansible   # usa Ansible para verificar (vs Testinfra)

lint: |
  set -e
  yamllint .
  ansible-lint</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content">Las imágenes <code>geerlingguy/docker-*-ansible</code> de Jeff Geerling son el estándar de la comunidad para testing con Molecule. Incluyen Python, systemd y las dependencias de Ansible preinstaladas.</div>
          </div>
        `,
      },
      {
        title: 'converge.yml y verify.yml — el ciclo de test',
        body: `
          <p><code>converge.yml</code> aplica el rol bajo test. <code>verify.yml</code> verifica que el resultado es correcto usando módulos Ansible como assertions.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">molecule/default/converge.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Converge
  hosts: all
  become: true

  pre_tasks:
    - name: Update apt cache (Ubuntu)
      ansible.builtin.apt:
        update_cache: true
        cache_valid_time: 3600
      when: ansible_os_family == "Debian"

  roles:
    - role: mi_rol
      vars:
        nginx_port: 80
        nginx_worker_processes: 2</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">molecule/default/verify.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Verify
  hosts: all
  become: true

  tasks:
    - name: Verificar que nginx está instalado
      ansible.builtin.package_facts:
        manager: auto

    - name: Fallar si nginx no está instalado
      ansible.builtin.fail:
        msg: "nginx no está instalado"
      when: "'nginx' not in ansible_facts.packages"

    - name: Verificar que nginx está corriendo
      ansible.builtin.service_facts:

    - name: Confirmar estado del servicio
      ansible.builtin.assert:
        that:
          - ansible_facts.services['nginx.service'] is defined
          - ansible_facts.services['nginx.service'].state == 'running'
        fail_msg: "nginx no está corriendo"
        success_msg: "nginx está corriendo correctamente"

    - name: Verificar que el puerto 80 responde
      ansible.builtin.uri:
        url: "http://localhost:80"
        status_code: 200</code></pre>
          </div>
        `,
      },
      {
        title: 'CLI de Molecule: comandos esenciales',
        body: `
          <p>Molecule tiene comandos granulares para cada fase del ciclo de test, más el comando <code>test</code> que los corre todos en secuencia.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">molecule-commands.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Ciclo completo (create → converge → verify → destroy)
molecule test

# Solo crear los contenedores
molecule create

# Aplicar el rol (sin destruir después)
molecule converge

# Correr solo la verificación (el contenedor debe existir)
molecule verify

# Entrar al contenedor para debug
molecule login --host ubuntu-22

# Destruir contenedores
molecule destroy

# Ver el estado de los contenedores
molecule list

# Forzar recreación aunque ya existan los contenedores
molecule test --force

# Mantener contenedores tras fallo (para debug)
molecule test --destroy never</code></pre>
          </div>
          <div class="highlight-box">
            <p><strong>Flujo de desarrollo típico:</strong></p>
            <ol>
              <li><code>molecule create</code> — crear contenedores</li>
              <li>Editar la tarea del rol</li>
              <li><code>molecule converge</code> — aplicar el rol</li>
              <li><code>molecule verify</code> — verificar</li>
              <li>Repetir pasos 2–4 hasta que el test pase</li>
              <li><code>molecule test</code> — ciclo completo limpio antes de commit</li>
            </ol>
          </div>
        `,
      },
      {
        title: 'Testing multi-plataforma: Ubuntu 22 + Rocky 9',
        body: `
          <p>El verdadero valor de Molecule está en probar el mismo rol en múltiples distribuciones simultáneamente. Muchos roles funcionan en Ubuntu pero rompen en RHEL/Rocky porque los nombres de paquetes, paths y servicios son distintos.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">multi-platform-test.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Con molecule.yml que define ubuntu-22 y rocky-9,
# molecule test corre en AMBAS plataformas automáticamente

molecule test
# →  Creating ubuntu-22 ...
# →  Creating rocky-9 ...
# →  Converging ubuntu-22 ...
# →  Converging rocky-9 ...
# →  Verifying ubuntu-22 ...
# →  Verifying rocky-9 ...</code></pre>
          </div>
          <p>El converge.yml puede tener lógica condicional por plataforma:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">tasks/main.yml (el rol)</span></div>
            <pre class="language-yaml"><code class="language-yaml">- name: Instalar nginx (Debian/Ubuntu)
  ansible.builtin.apt:
    name: nginx
    state: present
  when: ansible_os_family == "Debian"

- name: Instalar nginx (RHEL/Rocky)
  ansible.builtin.dnf:
    name: nginx
    state: present
  when: ansible_os_family == "RedHat"</code></pre>
          </div>
        `,
      },
    ],
    quiz: [
      {
        question: '¿Qué hace molecule converge?',
        options: [
          'Crea los contenedores Docker de prueba',
          'Aplica el rol al contenedor existente ejecutando converge.yml',
          'Corre las verificaciones definidas en verify.yml',
          'Destruye los contenedores tras el test',
        ],
        correctIndex: 1,
        explanation: 'molecule converge ejecuta el playbook converge.yml contra los contenedores existentes, aplicando el rol bajo test. Es equivalente a "aplicar el rol en el entorno de prueba".',
      },
      {
        question: '¿Para qué sirve molecule login?',
        options: [
          'Para autenticarse con Docker Hub',
          'Para acceder interactivamente al contenedor de test y hacer debug',
          'Para iniciar sesión en el repositorio de roles de Ansible Galaxy',
          'Para conectarse con SSH al host remoto de producción',
        ],
        correctIndex: 1,
        explanation: 'molecule login abre una shell interactiva dentro del contenedor de test. Es fundamental para debug: podés inspeccionar el estado del sistema, ver logs y probar comandos manualmente cuando un test falla.',
      },
      {
        question: '¿Por qué se recomienda testear en Ubuntu 22 y Rocky 9 simultáneamente?',
        options: [
          'Para usar más CPU y detectar problemas de performance',
          'Porque los nombres de paquetes, paths y servicios difieren entre distros, y un rol puede funcionar en una pero fallar en otra',
          'Porque Ansible solo funciona correctamente cuando hay múltiples plataformas en el inventario',
          'Para cumplir con regulaciones de seguridad que exigen testing cross-platform',
        ],
        correctIndex: 1,
        explanation: 'Debian/Ubuntu y RHEL/Rocky tienen diferencias fundamentales: apt vs dnf, /etc/default vs /etc/sysconfig, nombre de paquetes distintos. Un rol robusto debe manejar ambas familias y Molecule permite verificarlo automáticamente.',
      },
    ],
    realWorldCase: 'Un equipo descubrió con Molecule que su rol de "hardening" instalaba correctamente en Ubuntu pero olvidaba habilitar SELinux en Rocky Linux. En producción, esto habría dejado 40 servidores RHEL sin la configuración de seguridad requerida por compliance.',
    troubleshooting: [
      {
        error: 'ERROR: Could not find a suitable provider/driver',
        cause: 'Docker no está corriendo en el sistema o molecule-docker no está instalado',
        fix: 'Verificar con docker ps que Docker está activo. Instalar molecule-docker: pip install molecule-docker. Confirmar con molecule drivers.',
      },
      {
        error: 'FAILED: systemctl not found (en el contenedor)',
        cause: 'La imagen Docker no tiene systemd disponible; se usó una imagen genérica en lugar de las imágenes diseñadas para Ansible testing',
        fix: 'Usar las imágenes de geerlingguy: geerlingguy/docker-ubuntu2204-ansible:latest. Agregar privileged: true en molecule.yml.',
      },
      {
        error: 'molecule test falla con "Image not found" aunque docker pull funciona',
        cause: 'La imagen especificada en molecule.yml tiene un tag incorrecto o fue eliminada del registro',
        fix: 'Verificar el tag exacto con docker pull seguido de la imagen. Actualizar molecule.yml con el tag correcto. Preferir tags :latest para imágenes de Molecule testing.',
      },
    ],
  },

  {
    levelId: 17,
    moduleId: 3,
    title: 'Ansible Lint y yamllint',
    objective: 'Integrar ansible-lint y yamllint como herramientas de calidad de código para detectar errores, malas prácticas y problemas de estilo antes de ejecutar cualquier playbook.',
    duration: '1 hora',
    objectives: [
      'Entender qué problemas detecta ansible-lint (FQCN, idempotencia, seguridad, estilo)',
      'Configurar .ansible-lint para personalizar reglas según el proyecto',
      'Configurar yamllint para estilo de YAML consistente en el equipo',
      'Integrar ambas herramientas en un pre-commit hook para enforcement automático',
    ],
    prerequisites: [
      'Completados los Niveles 0–16 y módulos 1–2 del Nivel 17',
      'Python 3.8+ con pip disponible',
      'Repositorio Git con playbooks y roles',
    ],
    steps: [
      {
        title: 'Qué verifica ansible-lint',
        body: `
          <p>ansible-lint analiza estáticamente tus playbooks y roles buscando problemas en cuatro categorías principales:</p>
          <ul>
            <li><strong>FQCN (Fully Qualified Collection Names):</strong> usar <code>ansible.builtin.copy</code> en lugar de solo <code>copy</code>. Evita ambigüedades cuando múltiples colecciones tienen módulos con el mismo nombre.</li>
            <li><strong>Idempotencia:</strong> detecta patrones que pueden no ser idempotentes, como usar <code>command</code> cuando existe un módulo específico.</li>
            <li><strong>Seguridad:</strong> contraseñas en texto plano, <code>no_log: false</code> en tareas sensibles, permisos demasiado permisivos.</li>
            <li><strong>Estilo:</strong> nombres de tareas en formato imperativo, indentación, uso de <code>true</code>/<code>false</code> vs <code>yes</code>/<code>no</code>.</li>
          </ul>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">usar-ansible-lint.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Instalar ansible-lint
pip install ansible-lint

# Lintear el directorio actual
ansible-lint

# Lintear un playbook específico
ansible-lint site.yml

# Ver todas las reglas disponibles
ansible-lint --list-rules

# Ver solo errores críticos (sin warnings)
ansible-lint --severity error</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">text</span><span class="code-block-filename">output-ansible-lint.txt</span></div>
            <pre class="language-text"><code class="language-text">WARNING  roles/nginx/tasks/main.yml:5 Task/Handler names should not
         start with a uppercase letter. (name[casing])

ERROR    roles/nginx/tasks/main.yml:12 Use FQCN for builtin module
         actions: copy → ansible.builtin.copy (fqcn[action-core])

ERROR    roles/nginx/tasks/main.yml:20 Commands should not change
         things if nothing needs doing. (command-instead-of-module)</code></pre>
          </div>
        `,
      },
      {
        title: 'Configuración .ansible-lint',
        body: `
          <p>El archivo <code>.ansible-lint</code> en la raíz del proyecto personaliza el comportamiento: qué reglas ignorar, qué paths excluir y el perfil de severidad.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.ansible-lint</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
# Perfil: basic, moderate, safety, shared, production
profile: production

# Excluir paths del análisis
exclude_paths:
  - .git/
  - .cache/
  - molecule/
  - vendor/

# Ignorar reglas específicas (documentar por qué)
warn_list:
  - experimental     # reglas en desarrollo
  - role-name        # nombres de roles con guión bajo

skip_list:
  - yaml[line-length]  # lineas largas en templates Jinja2 son inevitables

# Paths adicionales a analizar
extra_vars_files:
  - vars/vault.yml

# Configuración de variables
var_naming_pattern: ^[a-z_][a-z0-9_]*$</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content">El perfil <code>production</code> activa las reglas más estrictas, incluyendo chequeos de seguridad. Para proyectos nuevos, empezá con <code>basic</code> y subí gradualmente a <code>production</code> a medida que limpiás el código.</div>
          </div>
        `,
      },
      {
        title: 'yamllint — estilo de YAML consistente',
        body: `
          <p>yamllint verifica la sintaxis y el estilo de todos los archivos YAML del proyecto, independientemente de Ansible. Detecta indentación inconsistente, trailing spaces, líneas demasiado largas y comillas innecesarias.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalar-yamllint.sh</span></div>
            <pre class="language-bash"><code class="language-bash">pip install yamllint

# Lintear todos los YAML del proyecto
yamllint .

# Lintear un archivo específico
yamllint playbooks/site.yml</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.yamllint</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
extends: default

rules:
  line-length:
    max: 120           # permitir líneas hasta 120 chars (templates)
    level: warning     # warning, no error

  document-start:
    present: true      # exigir '---' al inicio de cada archivo

  truthy:
    allowed-values:
      - 'true'
      - 'false'        # no permitir yes/no/on/off

  indentation:
    spaces: 2
    indent-sequences: true
    check-multi-line-strings: false

  comments:
    min-spaces-from-content: 2  # '# comentario' no '#comentario'

ignore: |
  .git/
  molecule/
  vendor/</code></pre>
          </div>
        `,
      },
      {
        title: 'Pre-commit hook: enforcement automático',
        body: `
          <p>Un pre-commit hook garantiza que ningún commit pase sin pasar por ansible-lint y yamllint. El framework <code>pre-commit</code> hace esto trivial.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">setup-pre-commit.sh</span></div>
            <pre class="language-bash"><code class="language-bash">pip install pre-commit

# Inicializar en el repo (instala el hook en .git/hooks/pre-commit)
pre-commit install

# Correr manualmente sobre todos los archivos
pre-commit run --all-files</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.pre-commit-config.yaml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
repos:
  - repo: https://github.com/adrienverge/yamllint
    rev: v1.35.1
    hooks:
      - id: yamllint
        args: ['-c', '.yamllint']

  - repo: https://github.com/ansible/ansible-lint
    rev: v24.2.0
    hooks:
      - id: ansible-lint
        files: \\.(yml|yaml)$
        always_run: false

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-merge-conflict</code></pre>
          </div>
          <div class="highlight-box">
            <p>Ahora cada <code>git commit</code> ejecuta automáticamente yamllint y ansible-lint. Si alguno falla, el commit es rechazado hasta que se corrija el problema.</p>
          </div>
        `,
      },
    ],
    quiz: [
      {
        question: '¿Qué verifica la regla fqcn[action-core] de ansible-lint?',
        options: [
          'Que los nombres de los roles sean descriptivos',
          'Que los módulos builtin usen su nombre completo (ej: ansible.builtin.copy en lugar de copy)',
          'Que las variables sigan la convención de nombres snake_case',
          'Que cada tarea tenga una etiqueta (tag) definida',
        ],
        correctIndex: 1,
        explanation: 'fqcn[action-core] exige el uso de Fully Qualified Collection Names para módulos builtin. Esto evita ambigüedades: si tenés una colección custom con un módulo "copy", Ansible podría ejecutar el incorrecto sin FQCN.',
      },
      {
        question: '¿Para qué sirve skip_list en .ansible-lint?',
        options: [
          'Para excluir hosts del inventario del análisis',
          'Para ignorar reglas específicas que no aplican al proyecto',
          'Para saltear la ejecución de molecule durante el lint',
          'Para ignorar archivos YAML con errores de sintaxis',
        ],
        correctIndex: 1,
        explanation: 'skip_list permite deshabilitar reglas específicas que no aplican o son incompatibles con el proyecto. Se documenta en el mismo archivo .ansible-lint el motivo para ignorar cada regla.',
      },
      {
        question: '¿Qué ocurre al hacer git commit después de instalar el pre-commit hook?',
        options: [
          'El commit se hace directamente, el hook corre en background',
          'El hook corre yamllint y ansible-lint; si alguno falla, el commit es rechazado',
          'Se abre un editor para revisar los cambios antes de commitear',
          'El hook sube automáticamente el código a un runner de CI',
        ],
        correctIndex: 1,
        explanation: 'Un pre-commit hook es bloqueante: si cualquier check falla (yamllint, ansible-lint, etc.), git rechaza el commit. El desarrollador debe corregir los errores y hacer git add + git commit nuevamente.',
      },
    ],
    realWorldCase: 'Un equipo de 8 ingenieros integró ansible-lint y yamllint como pre-commit hooks. En las primeras 2 semanas, el hook bloqueó 34 commits con problemas reales: 12 por módulos sin FQCN, 8 por tareas sin nombre, 14 por YAML mal formateado. Todos fueron corregidos antes de llegar al repositorio.',
    troubleshooting: [
      {
        error: 'ansible-lint: WARNING: Listing 1 violation(s) that are fatal',
        cause: 'El perfil configurado en .ansible-lint es más estricto que el código actual; alguna regla crítica está siendo violada',
        fix: 'Correr ansible-lint -v para ver el detalle completo. Si la regla es válida, corregirla. Si no aplica al proyecto, agregarla a skip_list con un comentario explicando por qué.',
      },
      {
        error: 'yamllint: error: could not determine encoding',
        cause: 'El archivo YAML tiene una codificación no-UTF8 (BOM, latin-1, etc.) o caracteres especiales no escapados',
        fix: 'Convertir el archivo a UTF-8 sin BOM: usar "file archivo.yml" para detectar la codificación actual, luego iconv para convertir.',
      },
      {
        error: 'pre-commit hook: command not found: ansible-lint',
        cause: 'pre-commit usa su propio entorno virtual aislado; ansible-lint debe estar declarado en .pre-commit-config.yaml, no solo instalado globalmente',
        fix: 'Usar el repo oficial de ansible-lint en .pre-commit-config.yaml en lugar de un hook local. pre-commit instala automáticamente las dependencias de cada repo declarado.',
      },
    ],
  },

  {
    levelId: 17,
    moduleId: 4,
    title: 'CI/CD con GitHub Actions',
    objective: 'Construir un pipeline completo de CI/CD para proyectos Ansible usando GitHub Actions: lint automático en cada PR, Molecule tests en runners Docker, dry-run en staging y deployment automático a producción.',
    duration: '2–3 horas',
    objectives: [
      'Entender por qué CI/CD es indispensable para equipos que trabajan con Ansible',
      'Construir un workflow de GitHub Actions que integre lint, Molecule y ansible-playbook',
      'Gestionar secretos sensibles (Vault password, SSH keys) usando GitHub Secrets',
      'Implementar el patrón staging-gate: --check en staging antes de merge a main',
    ],
    prerequisites: [
      'Completados los Niveles 0–16 y módulos 1–3 del Nivel 17',
      'Repositorio Ansible en GitHub',
      'Molecule configurado en al menos un rol',
      'ansible-lint y yamllint configurados en el proyecto',
    ],
    steps: [
      {
        title: 'Por qué CI/CD para Ansible',
        body: `
          <p>Sin CI/CD, cada miembro del equipo ejecuta los tests localmente (o no los ejecuta). Los errores llegan a producción. La calidad depende de la disciplina individual, no del proceso.</p>
          <div class="highlight-box">
            <p><strong>CI/CD convierte el testing en una compuerta institucional:</strong> ningún cambio puede mergearse si no pasa lint, Molecule tests y el dry-run en staging. La calidad es sistémica, no individual.</p>
          </div>
          <p>Un pipeline completo de Ansible en GitHub Actions hace:</p>
          <ul>
            <li><strong>En cada PR:</strong> lint (ansible-lint + yamllint) y Molecule tests</li>
            <li><strong>Antes del merge:</strong> <code>ansible-playbook --check</code> en staging como gate</li>
            <li><strong>Tras merge a main:</strong> deployment real a producción con notificación</li>
          </ul>
          <div class="analogy-box">
            <div class="analogy-box-header">💡 Analogía</div>
            <p>Pensá en el pipeline como una línea de ensamblaje con estaciones de control de calidad. El código entra por un extremo (PR), pasa por cada estación (lint → tests → staging check), y solo llega a producción si supera todas las compuertas.</p>
          </div>
          <div class="tech-term-box">
            <div class="tech-term-label">En términos técnicos</div>
            GitHub Actions es una plataforma de CI/CD integrada en GitHub. Los workflows se definen en archivos YAML bajo <code>.github/workflows/</code>. Cada workflow tiene jobs que corren en runners (VMs o contenedores) y steps que ejecutan comandos o acciones.
          </div>
        `,
      },
      {
        title: 'Estructura del workflow de GitHub Actions',
        body: `
          <p>Un workflow de Ansible CI/CD tiene cuatro jobs principales que se ejecutan en secuencia o en paralelo según las dependencias.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/ansible-ci.yml (estructura)</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
name: Ansible CI/CD

on:
  pull_request:
    branches: [main]
    paths:
      - '**.yml'
      - '**.yaml'
      - '**.j2'
      - 'requirements.yml'
  push:
    branches: [main]

env:
  PYTHON_VERSION: '3.12'

jobs:
  lint:          # Job 1: análisis estático (PR + push)
    ...

  molecule:      # Job 2: tests de roles (PR + push)
    needs: lint
    ...

  staging-check: # Job 3: dry-run en staging (PR only)
    needs: molecule
    if: github.event_name == 'pull_request'
    ...

  deploy:        # Job 4: deployment real (push to main only)
    needs: molecule
    if: github.event_name == 'push' &amp;&amp; github.ref == 'refs/heads/main'
    ...</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content">El trigger <code>paths</code> evita correr el pipeline en PRs que solo cambian documentación o archivos Python. Esto reduce el tiempo de CI significativamente en proyectos grandes.</div>
          </div>
        `,
      },
      {
        title: 'Job lint: ansible-lint y yamllint en cada PR',
        body: `
          <p>El job de lint es el más rápido (~1-2 minutos) y debe correr primero. Falla rápido en problemas básicos antes de gastar tiempo en Molecule.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/ansible-ci.yml — job lint</span></div>
            <pre class="language-yaml"><code class="language-yaml">  lint:
    name: Lint
    runs-on: ubuntu-latest

    steps:
      - name: Checkout del repositorio
        uses: actions/checkout@v4

      - name: Configurar Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: pip

      - name: Instalar dependencias de lint
        run: pip install ansible-lint yamllint

      - name: Instalar colecciones de Ansible
        run: |
          if [ -f requirements.yml ]; then
            ansible-galaxy collection install -r requirements.yml
          fi

      - name: Ejecutar yamllint
        run: yamllint .

      - name: Ejecutar ansible-lint
        run: ansible-lint
        env:
          ANSIBLE_ROLES_PATH: roles/</code></pre>
          </div>
          <div class="highlight-box">
            <p>El uso de <code>cache: pip</code> en setup-python hace que las instalaciones de pip se cacheen entre runs. En proyectos con muchas dependencias, esto puede reducir el tiempo de CI de 3 minutos a 30 segundos.</p>
          </div>
        `,
      },
      {
        title: 'Job molecule: tests en Docker runners',
        body: `
          <p>GitHub Actions ofrece runners Ubuntu con Docker preinstalado. Molecule funciona directamente sin configuración adicional del runner.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/ansible-ci.yml — job molecule</span></div>
            <pre class="language-yaml"><code class="language-yaml">  molecule:
    name: Molecule Tests
    runs-on: ubuntu-latest
    needs: lint

    strategy:
      matrix:
        role:
          - nginx
          - postgresql
          - hardening
      fail-fast: false  # continuar con otros roles si uno falla

    steps:
      - name: Checkout del repositorio
        uses: actions/checkout@v4

      - name: Configurar Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: pip

      - name: Instalar dependencias de Molecule
        run: pip install molecule molecule-docker ansible

      - name: Instalar colecciones de Ansible
        run: |
          if [ -f requirements.yml ]; then
            ansible-galaxy collection install -r requirements.yml
          fi

      - name: Ejecutar Molecule para el rol
        run: molecule test
        working-directory: roles/nginx   # usar matrix.role en el workflow real
        env:
          PY_COLORS: '1'
          ANSIBLE_FORCE_COLOR: '1'</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content">La estrategia <code>matrix</code> corre Molecule en paralelo para cada rol. Con 3 roles, los tests corren simultáneamente en 3 jobs paralelos en lugar de secuencialmente, reduciendo el tiempo total a un tercio.</div>
          </div>
        `,
      },
      {
        title: 'Job staging-check: --check antes del merge',
        body: `
          <p>Este job conecta con el entorno de staging real y corre <code>--check --diff</code>. Si Ansible reporta algún error, el PR no puede mergearse.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/ansible-ci.yml — job staging-check</span></div>
            <pre class="language-yaml"><code class="language-yaml">  staging-check:
    name: Staging Dry-Run
    runs-on: ubuntu-latest
    needs: molecule
    if: github.event_name == 'pull_request'
    environment: staging   # entorno protegido de GitHub

    steps:
      - name: Checkout del repositorio
        uses: actions/checkout@v4

      - name: Configurar Python y Ansible
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: pip

      - name: Instalar Ansible y colecciones
        run: |
          pip install ansible
          ansible-galaxy collection install -r requirements.yml

      - name: Configurar clave SSH
        run: |
          mkdir -p ~/.ssh
          echo "$STAGING_SSH_KEY" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          ssh-keyscan -H "$STAGING_HOST" >> ~/.ssh/known_hosts
        env:
          STAGING_SSH_KEY: ${{ '{{' }} secrets.STAGING_SSH_KEY ${{ '}}' }}
          STAGING_HOST: ${{ '{{' }} secrets.STAGING_HOST ${{ '}}' }}

      - name: Configurar Ansible Vault password
        run: |
          echo "$ANSIBLE_VAULT_PASSWORD" > ~/.vault_pass
          chmod 600 ~/.vault_pass
        env:
          ANSIBLE_VAULT_PASSWORD: ${{ '{{' }} secrets.ANSIBLE_VAULT_PASSWORD ${{ '}}' }}

      - name: Dry-run en staging
        run: |
          ansible-playbook site.yml \\
            -i inventory/staging \\
            --check \\
            --diff \\
            --vault-password-file ~/.vault_pass
        env:
          ANSIBLE_HOST_KEY_CHECKING: 'false'</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content">El <code>environment: staging</code> activa las protecciones de entorno de GitHub: approval manual requerido, lista de reviewers autorizados, y restricción de qué branches pueden deployar. Siempre usá environments protegidos para staging y producción.</div>
          </div>
        `,
      },
      {
        title: 'Job deploy: deployment a producción tras merge',
        body: `
          <p>Este job corre solo en push a main (es decir, tras un merge). Aplica el playbook completo en producción.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/ansible-ci.yml — job deploy</span></div>
            <pre class="language-yaml"><code class="language-yaml">  deploy:
    name: Deploy a Producción
    runs-on: ubuntu-latest
    needs: molecule
    if: github.event_name == 'push' &amp;&amp; github.ref == 'refs/heads/main'
    environment: production   # entorno con approval manual

    steps:
      - name: Checkout del repositorio
        uses: actions/checkout@v4

      - name: Configurar Python y Ansible
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: pip

      - name: Instalar Ansible y colecciones
        run: |
          pip install ansible
          ansible-galaxy collection install -r requirements.yml

      - name: Configurar clave SSH de producción
        run: |
          mkdir -p ~/.ssh
          echo "$PROD_SSH_KEY" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          ssh-keyscan -H "$PROD_BASTION_HOST" >> ~/.ssh/known_hosts
        env:
          PROD_SSH_KEY: ${{ '{{' }} secrets.PROD_SSH_KEY ${{ '}}' }}
          PROD_BASTION_HOST: ${{ '{{' }} secrets.PROD_BASTION_HOST ${{ '}}' }}

      - name: Configurar Ansible Vault password
        run: |
          echo "$ANSIBLE_VAULT_PASSWORD" > ~/.vault_pass
          chmod 600 ~/.vault_pass
        env:
          ANSIBLE_VAULT_PASSWORD: ${{ '{{' }} secrets.ANSIBLE_VAULT_PASSWORD ${{ '}}' }}

      - name: Deploy a producción
        run: |
          ansible-playbook site.yml \\
            -i inventory/production \\
            --diff \\
            --vault-password-file ~/.vault_pass
        env:
          ANSIBLE_HOST_KEY_CHECKING: 'false'
          ANSIBLE_STDOUT_CALLBACK: yaml

      - name: Limpiar secretos
        if: always()
        run: rm -f ~/.vault_pass ~/.ssh/id_ed25519</code></pre>
          </div>
        `,
      },
      {
        title: 'Workflow completo: ansible-ci.yml',
        body: `
          <p>El archivo completo en un solo bloque para copiar directamente al repositorio.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/ansible-ci.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
name: Ansible CI/CD

on:
  pull_request:
    branches: [main]
    paths: ['**.yml', '**.yaml', '**.j2', 'requirements.yml']
  push:
    branches: [main]

env:
  PYTHON_VERSION: '3.12'

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: pip
      - run: pip install ansible-lint yamllint
      - run: |
          if [ -f requirements.yml ]; then
            ansible-galaxy collection install -r requirements.yml
          fi
      - run: yamllint .
      - run: ansible-lint

  molecule:
    name: Molecule Tests
    runs-on: ubuntu-latest
    needs: lint
    strategy:
      matrix:
        role: [nginx, postgresql, hardening]
      fail-fast: false
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: pip
      - run: pip install molecule molecule-docker ansible
      - run: molecule test
        working-directory: roles/nginx
        env:
          PY_COLORS: '1'
          ANSIBLE_FORCE_COLOR: '1'

  staging-check:
    name: Staging Dry-Run
    runs-on: ubuntu-latest
    needs: molecule
    if: github.event_name == 'pull_request'
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: pip
      - run: pip install ansible
      - run: ansible-galaxy collection install -r requirements.yml
      - run: |
          mkdir -p ~/.ssh
          echo "$STAGING_SSH_KEY" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          ssh-keyscan -H "$STAGING_HOST" >> ~/.ssh/known_hosts
          echo "$ANSIBLE_VAULT_PASSWORD" > ~/.vault_pass
          chmod 600 ~/.vault_pass
        env:
          STAGING_SSH_KEY: ${{ '{{' }} secrets.STAGING_SSH_KEY ${{ '}}' }}
          STAGING_HOST: ${{ '{{' }} secrets.STAGING_HOST ${{ '}}' }}
          ANSIBLE_VAULT_PASSWORD: ${{ '{{' }} secrets.ANSIBLE_VAULT_PASSWORD ${{ '}}' }}
      - run: |
          ansible-playbook site.yml \\
            -i inventory/staging \\
            --check --diff \\
            --vault-password-file ~/.vault_pass
        env:
          ANSIBLE_HOST_KEY_CHECKING: 'false'

  deploy:
    name: Deploy a Producción
    runs-on: ubuntu-latest
    needs: molecule
    if: github.event_name == 'push' &amp;&amp; github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: pip
      - run: pip install ansible
      - run: ansible-galaxy collection install -r requirements.yml
      - run: |
          mkdir -p ~/.ssh
          echo "$PROD_SSH_KEY" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          ssh-keyscan -H "$PROD_BASTION_HOST" >> ~/.ssh/known_hosts
          echo "$ANSIBLE_VAULT_PASSWORD" > ~/.vault_pass
          chmod 600 ~/.vault_pass
        env:
          PROD_SSH_KEY: ${{ '{{' }} secrets.PROD_SSH_KEY ${{ '}}' }}
          PROD_BASTION_HOST: ${{ '{{' }} secrets.PROD_BASTION_HOST ${{ '}}' }}
          ANSIBLE_VAULT_PASSWORD: ${{ '{{' }} secrets.ANSIBLE_VAULT_PASSWORD ${{ '}}' }}
      - run: |
          ansible-playbook site.yml \\
            -i inventory/production \\
            --diff \\
            --vault-password-file ~/.vault_pass
        env:
          ANSIBLE_HOST_KEY_CHECKING: 'false'
      - name: Limpiar secretos
        if: always()
        run: rm -f ~/.vault_pass ~/.ssh/id_ed25519</code></pre>
          </div>
        `,
      },
      {
        title: 'Gestión segura de secretos con GitHub Secrets',
        body: `
          <p>El Ansible Vault password es el secreto más crítico del pipeline. El patrón correcto lo mantiene fuera del repositorio y lo expone solo como variable de entorno en el runner.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">configurar-secrets.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Usar GitHub CLI para agregar secretos (recomendado)
gh secret set ANSIBLE_VAULT_PASSWORD --body "$(cat .vault_pass)"
gh secret set STAGING_SSH_KEY --body "$(cat ~/.ssh/id_ed25519_staging)"
gh secret set PROD_SSH_KEY --body "$(cat ~/.ssh/id_ed25519_prod)"
gh secret set STAGING_HOST --body "10.0.1.50"
gh secret set PROD_BASTION_HOST --body "bastion.empresa.com"

# Ver los secretos configurados (sin mostrar valores)
gh secret list</code></pre>
          </div>
          <div class="highlight-box">
            <p><strong>Reglas de seguridad para secretos en CI/CD:</strong></p>
            <ul>
              <li>Nunca escribas el Vault password en archivos del repositorio</li>
              <li>Usá SSH keys dedicadas para CI (sin passphrase, permisos mínimos)</li>
              <li>Rotá las claves de CI periódicamente (cada 90 días)</li>
              <li>Usá GitHub Environments protegidos para production: require approval</li>
              <li>Limpiá siempre los archivos temporales con <code>if: always()</code> para que corran incluso si el playbook falla</li>
            </ul>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Nunca uses</strong> el Vault password directamente en el argumento <code>--vault-password</code> — quedaría visible en los logs. Siempre usá variables de entorno y escríbilo a un archivo temporal con <code>--vault-password-file</code>.</div>
          </div>
        `,
      },
    ],
    quiz: [
      {
        question: '¿Cuándo se ejecuta el job staging-check en el workflow?',
        options: [
          'En cada push a cualquier rama',
          'Solo en Pull Requests hacia main',
          'Solo después de un merge exitoso a main',
          'Cada vez que cambia el archivo site.yml',
        ],
        correctIndex: 1,
        explanation: 'El job staging-check tiene la condición if: github.event_name == \'pull_request\'. Solo corre cuando se abre o actualiza un PR, actuando como gate antes del merge. Tras el merge (push a main), corre el job deploy en su lugar.',
      },
      {
        question: '¿Por qué se escribe el Vault password a un archivo temporal en lugar de pasarlo directamente como argumento?',
        options: [
          'Porque --vault-password no es una opción válida de ansible-playbook',
          'Para evitar que el password aparezca en los logs del workflow y en el historial de procesos del runner',
          'Porque GitHub Actions no soporta secrets en argumentos de comandos',
          'Para poder reutilizar el mismo password en múltiples playbooks',
        ],
        correctIndex: 1,
        explanation: 'Pasar el password directamente como argumento lo expone en los logs del runner y en la lista de procesos (ps aux). Un archivo temporal con permisos 600 es más seguro: solo el proceso de Ansible puede leerlo, y se limpia con if: always().',
      },
      {
        question: '¿Qué ventaja tiene la estrategia matrix en el job de Molecule?',
        options: [
          'Permite reutilizar el mismo runner para múltiples roles secuencialmente',
          'Corre los tests de cada rol en paralelo, reduciendo el tiempo total de CI',
          'Garantiza que los roles se ejecuten en el mismo orden que en producción',
          'Comparte el caché de Docker entre diferentes roles para acelerar las descargas',
        ],
        correctIndex: 1,
        explanation: 'La estrategia matrix crea un job separado para cada elemento de la lista. GitHub Actions los ejecuta en paralelo en diferentes runners, reduciendo el tiempo total de N × tiempo_por_rol a simplemente el tiempo del rol más lento.',
      },
    ],
    realWorldCase: 'Un equipo de DevOps con 6 ingenieros adoptó este pipeline para gestionar 300 servidores. En el primer mes, el staging-check bloqueó 11 PRs que habrían causado outages en producción. El tiempo medio de detección de errores bajó de "descubierto en producción" a "bloqueado en PR review".',
    troubleshooting: [
      {
        error: 'El job de Molecule falla con "Cannot connect to the Docker daemon" en GitHub Actions',
        cause: 'El runner no tiene Docker disponible o el daemon no está iniciado correctamente',
        fix: 'Usar "runs-on: ubuntu-latest" (incluye Docker preinstalado). Agregar "- uses: docker/setup-docker-action@v3" como primer step para garantizar que Docker esté listo antes de ejecutar Molecule.',
      },
      {
        error: 'ansible-playbook falla con "Vault password file was not found"',
        cause: 'El secret ANSIBLE_VAULT_PASSWORD no está configurado en el repositorio de GitHub, o el step de configuración no corrió correctamente',
        fix: 'Verificar que el secret existe con "gh secret list". Revisar que el step de configuración del vault_pass usa el nombre correcto del secret y que tiene los permisos de archivo 600.',
      },
      {
        error: 'El job de deploy corre en PRs aunque debería correr solo en push a main',
        cause: 'La condición if del job está mal formada o las expresiones de GitHub Actions tienen un error de sintaxis',
        fix: 'Verificar la sintaxis: if: github.event_name == \'push\' && github.ref == \'refs/heads/main\'. Usar el validador de GitHub Actions en el mismo repositorio para depurar la expresión.',
      },
    ],
  },
];
