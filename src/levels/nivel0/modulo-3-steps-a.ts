import type { StepContent } from '../types';

export const nivel0Mod3StepsA: StepContent[] = [
    {
      title: 'Por qué Ansible usa YAML',
      body: `
        <p>YAML (YAML Ain't Markup Language) fue elegido por Ansible por su legibilidad. Un playbook debe ser comprensible incluso por alguien que no conoce Ansible — los comentarios en español explican qué hace cada parte.</p>
        <div class="highlight-box">
          <p><strong>Regla absoluta de YAML:</strong> usa siempre <strong>2 espacios</strong> para indentar. Nunca tabs. Un tab en lugar de espacios rompe el parsing silenciosamente en algunos editores — es uno de los errores más comunes.</p>
        </div>
        <div class="analogy-box">
          <div class="analogy-box-header">💡 Analogía</div>
          <p>Pensá en YAML como el formulario que llenás para instruir a Ansible. El sangrado (indentación) es como los campos del formulario — si los completás en el lugar equivocado, el formulario no tiene sentido.</p>
        </div>
        <div class="tech-term-box">
          <div class="tech-term-label">En términos técnicos</div>
          YAML (YAML Ain't Markup Language) es un formato de serialización de datos legible por humanos. La indentación con espacios define la jerarquía de los nodos en el árbol de datos que Ansible parsea con PyYAML.
        </div>
        <div class="tip-box">
          <span class="box-icon">💡</span>
          <div class="box-content">Configurá tu editor para que inserte 2 espacios cuando presionás Tab. En VSCode: <code>Editor: Tab Size = 2</code> + <code>Editor: Insert Spaces = true</code>.</div>
        </div>
      `
    },
    {
      title: 'Escalares — el tipo de dato básico',
      body: `
        <p>Un escalar es un valor simple: string, número, booleano o null. Son los ladrillos de cualquier documento YAML.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">escalares.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml"># Strings — texto
nombre: "Ansible"             # con comillas dobles
apellido: 'Red Hat'           # con comillas simples
version: ansible              # sin comillas (si no hay caracteres especiales)

# Números
puerto: 80                    # entero
timeout: 30.5                 # flotante
version_num: 2.15             # también flotante

# Booleanos — YAML acepta múltiples formas
habilitado: true              # recomendado por Ansible
deshabilitado: false
activo: yes                   # equivale a true
inactivo: no                  # equivale a false
encendido: on                 # equivale a true
apagado: off                  # equivale a false

# Null — valor vacío
valor_nulo: null              # explícito
valor_nulo_2: ~               # tilde = null en YAML
valor_vacio:                  # valor no definido (también es null)

# Cadenas que parecen otros tipos — usá comillas
puerto_texto: "80"            # string, no número
verdad_texto: "true"          # string, no booleano
nulo_texto: "null"            # string, no null</code></pre>
        </div>
      `
    },
    {
      title: 'Listas — secuencias de valores',
      body: `
        <p>Las listas (sequences) almacenan múltiples valores en orden. Son fundamentales en Ansible para definir paquetes a instalar, hosts, tareas, etc.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">listas.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml"># Lista con guión (la forma más común en Ansible)
paquetes:              # clave del diccionario padre
- nginx              # ítem 1 — guión + espacio + valor
- postgresql         # ítem 2
- python3            # ítem 3
- git                # ítem 4

# Lista en línea (flow style)
puertos: [80, 443, 8080]

# Lista de strings
etiquetas:
- produccion
- web
- nginx

# Lista de diccionarios (muy común en tasks de Ansible)
usuarios:
- nombre: deploy     # primer diccionario en la lista
  uid: 1001
  shell: /bin/bash
- nombre: backup     # segundo diccionario
  uid: 1002
  shell: /bin/sh

# Lista vacía
sin_elementos: []</code></pre>
        </div>
        <div class="analogy-box">
          <div class="analogy-box-header">💡 Analogía</div>
          <p>Una lista YAML es exactamente como una lista de compras. Cada ítem empieza con un guión, uno debajo del otro, en el mismo nivel de indentación.</p>
        </div>
        <div class="tech-term-box">
          <div class="tech-term-label">En términos técnicos</div>
          En YAML, una secuencia (lista) es una colección ordenada de nodos. Cada elemento se indica con el carácter <code>- </code> seguido de su valor. En Python, una lista YAML se deserializa como <code>list</code>.
        </div>
        <div class="tip-box">
          <span class="box-icon">💡</span>
          <div class="box-content">En Ansible, las <code>tasks</code> de un play son una lista de diccionarios. Cada tarea es un <code>- name: ...</code>.</div>
        </div>
      `
    },
    {
      title: 'Diccionarios — pares clave-valor',
      body: `
        <p>Los diccionarios (mappings) asocian claves con valores. Son el tipo más usado en Ansible: playbooks, inventory, variables, y módulos son todos diccionarios.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">diccionarios.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml"># Diccionario simple
servidor:
hostname: web1.ejemplo.com    # clave: valor
ip: 192.168.1.10
puerto: 80
habilitado: true

# Diccionario en línea (flow style)
colores: {rojo: "#ff0000", verde: "#00ff00", azul: "#0000ff"}

# Diccionario anidado (nested)
configuracion:
base_de_datos:                # clave con valor de tipo diccionario
  host: db.ejemplo.com
  puerto: 5432
  nombre: mi_app
  credenciales:               # otro nivel de anidamiento
    usuario: app_user
    password: "{{ db_password }}"  # Jinja2 — variable de Ansible

# Diccionario vacío
sin_configuracion: {}

# Cómo Ansible usa diccionarios — ejemplo real de task
- name: Instalar nginx            # diccionario de tarea
ansible.builtin.apt:            # clave = módulo
  name: nginx                   # parámetros del módulo
  state: present
  update_cache: true</code></pre>
        </div>
      `
    },
    {
      title: 'Cadenas multilínea',
      body: `
        <p>YAML tiene dos formas de escribir texto en múltiples líneas. La elección importa en Ansible cuando generás archivos de configuración con templates.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">multilinea.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml"># Literal block — | — preserva los saltos de línea exactamente
script: |
#!/bin/bash
echo "Hola Ansible"
apt update
apt install -y nginx
# El valor es el texto completo con saltos de línea reales

# Folded block — > — colapsa saltos de línea en espacios
descripcion: >
Este es un texto muy largo que ocupa
varias líneas en el YAML pero en el
valor final será una sola línea.
# El valor es: "Este es un texto muy largo que ocupa varias líneas en el YAML pero en el valor final será una sola línea."

# Variantes con control de newline final
literal_sin_newline: |-      # |- elimina el newline final
texto sin
newline al final

folded_sin_newline: >-       # >- elimina el newline final
texto que se
colapsa sin newline

# Uso en Ansible — script shell multilínea
- name: Ejecutar script de configuración
ansible.builtin.shell: |
  cd /opt/app
  git pull origin main
  pip install -r requirements.txt
  systemctl restart app</code></pre>
        </div>
      `
    }
];
