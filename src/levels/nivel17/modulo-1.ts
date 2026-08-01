import type { ModuleContent } from '../types';

export const nivel17Mod1: ModuleContent =   {
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
  };
