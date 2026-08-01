import type { ModuleContent } from '../types';

export const nivel3Mod2: ModuleContent = {
  levelId: 3,
  moduleId: 2,
  title: 'Inventario estático YAML',
  objective: 'Aprender el formato YAML para inventarios, más expresivo y estructurado que INI para inventarios complejos.',
  duration: '1 hora',
  prerequisites: [
    'Nivel 3, Módulo 1: Inventario estático INI (estructura de grupos y variables)',
    'Sintaxis YAML básica: listas, diccionarios y anidamiento',
  ],
  realWorldCase: 'Al incorporar el inventario a un repositorio Git con revisión de código, el formato YAML es preferido porque los IDEs pueden validarlo en tiempo real y los pull requests muestran diffs más legibles que el formato INI.',
  quiz: [
    {
      question: '¿Cuál es la clave correcta en YAML para definir grupos hijos dentro de un grupo padre?',
      options: [
        'subgroups:',
        'members:',
        'children:',
        'groups:',
      ],
      correctIndex: 2,
      explanation: 'En el formato YAML de inventario Ansible, "children:" es la clave reservada para definir subgrupos dentro de un grupo padre, equivalente a la sección [grupo:children] del formato INI.',
    },
    {
      question: '¿Qué ventaja tiene el formato YAML de inventario sobre el formato INI para las variables?',
      options: [
        'Las variables YAML tienen mayor precedencia que las INI',
        'YAML permite variables complejas como listas y diccionarios; INI solo soporta strings',
        'YAML es más rápido de procesar por Ansible',
        'En YAML no es necesario definir secciones de grupos',
      ],
      correctIndex: 1,
      explanation: 'El formato INI solo soporta pares clave=valor con strings simples. YAML permite listas (- elemento) y diccionarios anidados como valores de variables, lo que es imposible en INI.',
    },
    {
      question: 'En un inventario YAML, ¿dónde se definen las variables del grupo "servidores_web"?',
      options: [
        'Bajo la clave "all.servidores_web.variables:"',
        'Bajo la clave "vars:" dentro de "servidores_web:"',
        'En un archivo separado obligatoriamente',
        'Bajo la clave "group_vars:" al nivel de "all:"',
      ],
      correctIndex: 1,
      explanation: 'En el inventario YAML, las variables de un grupo se definen bajo la clave "vars:" anidada directamente dentro de ese grupo. Esto es equivalente a la sección [grupo:vars] del formato INI.',
    },
  ],
  troubleshooting: [
    {
      error: 'ERROR! Syntax Error while loading YAML filename, found character that cannot start any token',
      cause: 'El archivo de inventario YAML contiene tabs (tabulaciones) en lugar de espacios, o tiene caracteres especiales sin escapar.',
      fix: 'Configurar el editor para usar espacios en lugar de tabs y validar el YAML con: python3 -c "import yaml; yaml.safe_load(open(\'hosts.yml\'))" antes de ejecutar Ansible.',
    },
    {
      error: 'Los hosts del inventario YAML no aparecen al hacer ansible-inventory --list',
      cause: 'La estructura YAML no tiene el nivel raíz "all:" requerido, o los hosts están definidos bajo "hosts:" pero sin el nivel de grupo correcto.',
      fix: 'Todo inventario YAML debe comenzar con "all:" como raíz. Los hosts van bajo "all.hosts:" o bajo "all.children.<grupo>.hosts:". Verificar con ansible-inventory -i hosts.yml --graph.',
    },
    {
      error: 'Las variables con listas o diccionarios no se aplican correctamente',
      cause: 'Al mezclar inventario INI y YAML, se intenta usar sintaxis de lista YAML en un archivo INI, lo cual no es válido.',
      fix: 'Las variables complejas (listas, diccionarios) solo son posibles en archivos YAML: inventario YAML, group_vars/*.yml o host_vars/*.yml. Migrar ese host o grupo a un archivo YAML.',
    },
  ],
  objectives: [
    'Escribir un inventario YAML equivalente a un inventario INI existente',
    'Definir variables complejas (listas y diccionarios) en el inventario YAML',
    'Estructurar grupos padre e hijo con children en YAML',
    'Elegir entre formato INI y YAML según la complejidad del proyecto',
  ],
  steps: [
    {
      title: 'Formato YAML — estructura equivalente a INI',
      body: `
        <p>El formato YAML para inventarios es más verboso pero también más claro para inventarios con muchas variables o jerarquías de grupos complejas. Es el formato recomendado para inventarios que serán versionados en Git.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">inventario/hosts.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">all:
vars:
  ansible_python_interpreter: /usr/bin/python3
  empresa: "Mi Empresa SA"

children:
  servidores_web:
    vars:
      http_port: 80
      https_port: 443
    hosts:
      web1.empresa.com:
        ansible_user: ubuntu
        nginx_workers: 4
      web2.empresa.com:
        ansible_user: ubuntu
        ansible_port: 2222

  bases_de_datos:
    hosts:
      db1.empresa.com:
        ansible_user: postgres
        pg_max_connections: 200
      db2.empresa.com:
        ansible_user: postgres
        ansible_host: 192.168.1.50

  produccion:
    children:
      servidores_web:
      bases_de_datos:
    vars:
      env: produccion</code></pre>
        </div>
      `
    },
    {
      title: 'Ventajas del formato YAML',
      body: `
        <ul>
          <li><strong>Variables complejas</strong>: soporta listas y diccionarios como valores de variables, imposible en INI</li>
          <li><strong>Estructura explícita</strong>: la jerarquía de grupos es inmediatamente visible</li>
          <li><strong>Validación</strong>: los errores de sintaxis son más fáciles de detectar</li>
          <li><strong>Tooling</strong>: IDEs con soporte YAML dan autocompletado y validación</li>
        </ul>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">inventario/hosts-vars-complejas.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">all:
children:
  servidores_web:
    hosts:
      web1.empresa.com:
        # Variables complejas: imposibles en formato INI
        nginx_server_names:
          - app.empresa.com
          - www.empresa.com
        ssl_certificates:
          - cert: /etc/ssl/certs/app.crt
            key: /etc/ssl/private/app.key</code></pre>
        </div>
        <div class="next-chapter-box">
          <div class="next-chapter-arrow">→</div>
          <div>
            <div class="next-chapter-label">A continuación</div>
            <div class="next-chapter-title">Inventario dinámico</div>
            <div class="next-chapter-desc">En entornos cloud donde los hosts cambian constantemente, el inventario dinámico genera la lista automáticamente desde AWS, Azure o GCP.</div>
          </div>
        </div>
      `
    }
  ]
};
