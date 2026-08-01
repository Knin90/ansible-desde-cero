import type { StepContent } from '../types';

export const nivel0Mod3StepsB: StepContent[] = [
    {
      title: 'Anchors y Aliases — reutilización de contenido',
      body: `
        <p>Los anchors (<code>&</code>) y aliases (<code>*</code>) permiten reutilizar partes del documento YAML sin repetirlas. Útil para evitar duplicación en configuraciones complejas.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">anchors.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml"># Definir un anchor con &
configuracion_base: &base_config      # & define el anchor llamado "base_config"
timeout: 30
retries: 3
log_level: info

# Usar el alias con *
servidor_web:
<<: *base_config                    # << = merge — incluye todas las claves del anchor
puerto: 80                          # clave adicional propia de este diccionario
tipo: web

servidor_db:
<<: *base_config                    # reutiliza la misma configuración base
puerto: 5432                        # clave adicional
tipo: database

# Resultado efectivo de servidor_web:
# timeout: 30
# retries: 3
# log_level: info
# puerto: 80
# tipo: web

# Anchor en lista
paquetes_comunes: &pkgs_comunes
- curl
- wget
- vim
- git

servidor_staging:
paquetes:
  - *pkgs_comunes                   # incluye todos los paquetes comunes
  - nodejs                          # y agrega uno más</code></pre>
        </div>
        <div class="warning-box">
          <span class="box-icon">⚠️</span>
          <div class="box-content">Los anchors solo funcionan dentro del mismo documento YAML. No podés referenciar anchors de otro archivo. Para reutilización entre archivos en Ansible, usá variables y el directorio <code>group_vars/</code>.</div>
        </div>
      `
    },
    {
      title: 'Errores comunes de YAML',
      body: `
        <p>Estos errores rompen el parsing de Ansible y son muy comunes en principiantes:</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">errores-comunes.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml"># ❌ ERROR: Tab en lugar de espacios
servidor:
	puerto: 80          # tab — yaml-lint va a reportar error

# ✅ CORRECTO: 2 espacios
servidor:
puerto: 80

# ❌ ERROR: Inconsistencia de indentación
lista:
- item1
 - item2              # 3 espacios — inconsistente

# ✅ CORRECTO
lista:
- item1
- item2

# ❌ ERROR: Dos puntos sin espacio
nombre:Ansible          # parser no reconoce como clave: valor

# ✅ CORRECTO
nombre: Ansible

# ❌ ERROR: Caracteres especiales sin comillas
mensaje: Hello: World   # los : en el valor rompen el parse

# ✅ CORRECTO
mensaje: "Hello: World"
mensaje: 'Hello: World'

# Validar tu YAML antes de ejecutar Ansible
# ansible-playbook --syntax-check mi-playbook.yml
# yamllint mi-playbook.yml</code></pre>
        </div>
      `
    },
    {
      title: 'YAML en el contexto de Ansible',
      body: `
        <p>Todo en Ansible está escrito en YAML. Reconocé estos patrones fundamentales:</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbook-anatomia.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">---                                    # inicio del documento YAML (opcional pero recomendado)
- name: Configurar servidor web        # play — comienza con -
hosts: servidores_web                # a qué hosts aplica (string o lista)
become: true                         # usar sudo
vars:                                # diccionario de variables del play
  http_port: 80
  paquetes_web:                      # variable de tipo lista
    - nginx
    - certbot

tasks:                               # lista de tareas
  - name: Instalar paquetes          # tarea 1 — diccionario con -
    ansible.builtin.apt:             # módulo a usar
      name: "{{ paquetes_web }}"     # parámetro — Jinja2 para referenciar variable
      state: present
      update_cache: true

  - name: Iniciar y habilitar nginx  # tarea 2
    ansible.builtin.service:
      name: nginx
      state: started
      enabled: true
...</code></pre>
        </div>
      `
    },
    {
      title: 'Herramientas para YAML',
      body: `
        <p>Estas herramientas te ayudan a escribir y validar YAML correctamente:</p>
        <ul>
          <li><strong>yamllint</strong> — linter para YAML: <code>pip install yamllint</code></li>
          <li><strong>ansible-lint</strong> — linter específico de Ansible: <code>pip install ansible-lint</code></li>
          <li><strong>VSCode + extensión YAML</strong> — resaltado de sintaxis y validación en tiempo real</li>
          <li><strong>online-yaml.com</strong> — parser online para verificar rápidamente</li>
        </ul>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">validar.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Verificar sintaxis de un playbook
ansible-playbook --syntax-check mi-playbook.yml

# Lintear YAML puro
yamllint mi-playbook.yml

# Lintear con reglas de Ansible
ansible-lint mi-playbook.yml</code></pre>
        </div>
      `
    },
    {
      title: 'Resumen',
      body: `
        <div class="highlight-box">
          <p>Dominás YAML: escalares, listas, diccionarios, multilínea y anchors. Con esto podés leer y escribir cualquier playbook, inventario o archivo de variables de Ansible.</p>
        </div>
        <div class="lab-box">
          <div class="lab-box-header">🧪 Laboratorio</div>
          <div class="lab-section">
            <div class="lab-section-title">Objetivo</div>
            <p style="font-size:0.9rem;color:var(--color-text-muted);line-height:1.65">Escribir un archivo YAML completo que combine todos los tipos de datos vistos, y validarlo con yamllint.</p>
          </div>
          <div class="lab-section">
            <div class="lab-section-title">Pasos</div>
            <ol>
              <li>Creá un archivo <code>practica.yml</code></li>
              <li>Definí un diccionario con configuración de un servidor (nombre, IP, puerto, habilitado)</li>
              <li>Agregá una lista de paquetes a instalar</li>
              <li>Incluí un bloque multilínea con un script bash usando <code>|</code></li>
              <li>Creá un anchor y reutilizalo en dos servidores distintos</li>
              <li>Validá el archivo con <code>yamllint practica.yml</code></li>
            </ol>
          </div>
          <div class="lab-section">
            <div class="lab-section-title">Verificación</div>
            <ul>
              <li><code>yamllint practica.yml</code> no muestra errores</li>
              <li>El archivo es legible para alguien que no lo escribió</li>
            </ul>
          </div>
          <div class="lab-section">
            <div class="lab-section-title">Resultado esperado</div>
            <div class="lab-expected">
              <div class="lab-expected-item"><span class="lab-expected-check">✓</span> <code>yamllint archivo.yml</code> no reporta errores</div>
              <div class="lab-expected-item"><span class="lab-expected-check">✓</span> El diccionario de servidor tiene al menos 4 claves</div>
              <div class="lab-expected-item"><span class="lab-expected-check">✓</span> El anchor se referencia correctamente en al menos dos lugares</div>
              <div class="lab-expected-item"><span class="lab-expected-check">✓</span> El bloque multilínea preserva los saltos de línea con <code>|</code></div>
            </div>
          </div>
          <div class="lab-section">
            <div class="lab-section-title">Preguntas para reflexionar</div>
            <ul>
              <li>¿Cuándo preferirías usar <code>|</code> en lugar de <code>&gt;</code> para texto multilínea?</li>
              <li>¿Por qué Ansible prefiere YAML sobre JSON para los playbooks?</li>
            </ul>
          </div>
        </div>
        <div class="next-chapter-box">
          <div class="next-chapter-arrow">→</div>
          <div>
            <div class="next-chapter-label">A continuación</div>
            <div class="next-chapter-title">Python para Ansible</div>
            <div class="next-chapter-desc">Ansible está escrito en Python y los módulos se ejecutan como scripts Python en el host remoto. Entender lo básico hace que todo el resto encaje.</div>
          </div>
        </div>
      `
    }
];
