import type { ModuleContent } from '../types';

export const nivel5Mod1: ModuleContent = {
  levelId: 5,
  moduleId: 1,
  title: 'Sintaxis YAML completa en contexto Ansible',
  objective: 'Dominar todos los aspectos de YAML que se usan en Ansible: tipos de datos, anclas, referencias, multilínea y errores comunes.',
  duration: '2 horas',
  objectives: [
    'Aplicar tipos de datos YAML correctamente en el contexto de playbooks de Ansible',
    'Elegir entre | y > para bloques multilínea según el caso de uso',
    'Reutilizar configuración con anchors y aliases en inventarios YAML',
    'Identificar y corregir los errores YAML más frecuentes en Ansible',
  ],
  steps: [
    {
      title: 'YAML en Ansible — reglas críticas',
      body: `
        <p>Ansible usa YAML como lenguaje de configuración. A diferencia de JSON, YAML es sensible a la indentación y tiene varios "gotchas" que sorprenden a los principiantes.</p>
        <div class="warning-box">
          <span class="box-icon">⚠️</span>
          <div class="box-content"><strong>Regla #1:</strong> YAML usa SOLO espacios. Nunca tabs. Un tab rompe el parseo. Configurá tu editor para expandir tabs a espacios en archivos .yml y .yaml.</div>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">tipos-de-datos.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml"># Strings — las comillas son opcionales salvo en casos especiales
nombre: servidor-web
version: "2.0"        # Comillas para que no se interprete como número
mensaje: 'it''s OK'   # Comillas simples: el '' dentro es un literal '

# Números
puerto: 80
timeout: 30.5
hex: 0xFF

# Booleanos — todas estas formas son válidas en YAML
debug: true
agentless: yes
reboot: on
# Cuidado: en Ansible, preferí true/false para evitar confusiones

# Null
valor_vacio: null
sin_valor: ~

# Listas
servidores:
- web1.com
- web2.com

# Inline list
puertos: [80, 443, 8080]

# Diccionarios / mappings
conexion:
host: db1.com
port: 5432
ssl: true

# Inline dict
opts: {timeout: 30, retries: 3}</code></pre>
        </div>
      `
    },
    {
      title: 'Multilínea: | (literal) vs > (folded)',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">multilinea.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml"># Literal block scalar (|) — preserva saltos de línea exactos
script: |
#!/bin/bash
echo "Instalando dependencias"
apt-get update
apt-get install -y nginx postgresql

# Folded block scalar (>) — colapsa saltos en espacios
descripcion: >
Este servidor es el nodo principal
de la infraestructura de producción.
Maneja el tráfico de entrada.
# Resultado: "Este servidor es el nodo principal de la infraestructura..."

# Modificadores de bloque
# |- quita el newline final
# |+ mantiene newlines finales adicionales

comando: |-
ls -la /etc/nginx
cat nginx.conf</code></pre>
        </div>
      `
    },
    {
      title: 'Anchors y aliases — DRY en YAML',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">anchors-aliases.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml"># Anchor: define un valor reutilizable con &nombre
defaults: &defaults
ansible_user: ubuntu
ansible_python_interpreter: /usr/bin/python3
ansible_ssh_private_key_file: ~/.ssh/empresa_rsa

# Alias: reutiliza el anchor con *nombre
servidores:
web1:
  <<: *defaults      # Merge key: copia todas las claves del anchor
  ansible_host: 10.0.1.10
web2:
  <<: *defaults
  ansible_host: 10.0.1.11
  ansible_user: centos  # Sobreescribe el valor del anchor</code></pre>
        </div>
        <div class="tip-box">
          <span class="box-icon">💡</span>
          <div class="box-content"><strong>Nota:</strong> anchors y aliases son YAML puro, no específicos de Ansible. Son útiles en inventarios YAML y en archivos de variables para evitar repetición, pero no funcionan en playbooks porque Ansible procesa las tareas antes del merge.</div>
        </div>
        <div class="next-chapter-box">
          <div class="next-chapter-arrow">→</div>
          <div>
            <div class="next-chapter-label">A continuación</div>
            <div class="next-chapter-title">Tasks y Play — Anatomía completa</div>
            <div class="next-chapter-desc">Explorás todos los campos disponibles en un play y en una task, y cómo controlar la ejecución con become, when, register y más.</div>
          </div>
        </div>
      `
    }
  ],
  prerequisites: [
    'Completar Nivel 0 — Conceptos básicos de automatización',
    'Completar Nivel 1 — Inventarios y conexión SSH',
    'Completar Nivel 2 — Módulos esenciales',
    'Completar Nivel 3 — Variables y plantillas Jinja2',
    'Completar Nivel 4 — Roles y estructura de proyectos',
  ],
  realWorldCase: 'Al escribir un playbook que lanza un script bash multilínea, un tab invisible en el YAML rompe el parseo y el deploy falla en producción. Conocer las reglas críticas de YAML evita horas de debugging en el momento más crítico.',
  quiz: [
    {
      question: '¿Cuál es la diferencia entre el operador | y > en YAML multilínea?',
      options: [
        '| colapsa los saltos de línea en espacios; > los preserva exactamente',
        '| preserva los saltos de línea exactamente; > colapsa los saltos en espacios',
        'Son equivalentes; solo difieren en estilo',
        '| se usa para strings; > se usa solo para comandos bash',
      ],
      correctIndex: 1,
      explanation: '| (literal block scalar) preserva cada salto de línea tal cual. > (folded block scalar) convierte los saltos de línea en espacios, produciendo un párrafo continuo. Usá | para scripts y comandos, > para descripciones largas.',
    },
    {
      question: '¿Qué hace el operador <<: en un diccionario YAML?',
      options: [
        'Agrega un comentario al bloque',
        'Define un anchor nuevo con ese nombre',
        'Fusiona todas las claves de un anchor en el diccionario actual (merge key)',
        'Redirige la salida del bloque a otro archivo',
      ],
      correctIndex: 2,
      explanation: '<<: es la "merge key" de YAML. Copia todas las claves del alias referenciado (*nombre) al diccionario actual. Si el diccionario define la misma clave, la sobreescribe. Es útil para heredar configuraciones base en inventarios YAML.',
    },
    {
      question: '¿Por qué Ansible recomienda usar true/false en lugar de yes/no para booleanos?',
      options: [
        'Porque yes/no son inválidos en YAML 1.2 y Ansible usa YAML 1.2',
        'Para mayor claridad y evitar ambigüedad, ya que YAML 1.1 acepta múltiples formas (yes, on, true) que pueden confundir',
        'Porque yes/no solo funcionan en Windows y true/false son multiplataforma',
        'No hay diferencia; Ansible acepta ambas formas de manera idéntica',
      ],
      correctIndex: 1,
      explanation: 'YAML 1.1 acepta yes, no, on, off, true, false como booleanos. Esto genera confusión (¿"on" es el string "on" o el booleano true?). Ansible recomienda true/false para eliminar esa ambigüedad y hacer el código más legible y predecible.',
    },
  ],
  troubleshooting: [
    {
      error: 'yaml.scanner.ScannerError: mapping values are not allowed here',
      cause: 'Un caracter tab fue usado en lugar de espacios para la indentación. YAML solo acepta espacios.',
      fix: 'Configurá tu editor para expandir tabs a espacios en archivos .yml. Ejecutá `cat -A archivo.yml | grep "^I"` para detectar tabs (se muestran como ^I).',
    },
    {
      error: 'El valor numérico "2.0" se interpreta como el número 2, no como el string "2.0"',
      cause: 'YAML infiere tipos automáticamente. Sin comillas, "2.0" se parsea como float.',
      fix: 'Rodeá el valor con comillas dobles: version: "2.0". Siempre usá comillas cuando un valor que parece número debe tratarse como string (versiones, IDs, etc.).',
    },
    {
      error: 'Los anchors definidos en un playbook no se expanden correctamente en las tasks',
      cause: 'Ansible procesa las tareas antes del merge YAML. Los anchors y aliases funcionan en inventarios YAML pero no dentro de la sección tasks: de un playbook.',
      fix: 'Usá anchors solo en inventarios YAML y archivos de variables. En playbooks, reutilizá configuración mediante variables, defaults de roles o import_tasks.',
    },
  ],
};
