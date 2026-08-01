import type { ModuleContent } from '../types';

export const nivel3Mod4: ModuleContent = {
  levelId: 3,
  moduleId: 4,
  title: 'Variables de inventario — host_vars y group_vars',
  objective: 'Dominar la organización de variables de inventario usando los directorios host_vars y group_vars.',
  duration: '1.5 horas',
  prerequisites: [
    'Nivel 3, Módulo 3: Inventario dinámico (estructura de directorios de inventario)',
    'Nivel 2: Roles y estructura de proyectos Ansible',
  ],
  realWorldCase: 'En un proyecto con 15 servidores web idénticos pero con diferente cantidad de CPUs, group_vars/servidores_web.yml define la configuración común de nginx y cada host_vars/webN.yml sobreescribe solo nginx_worker_processes con el valor correcto para ese servidor.',
  quiz: [
    {
      question: '¿Dónde busca Ansible los directorios group_vars y host_vars automáticamente?',
      options: [
        'Solo en /etc/ansible/',
        'Solo junto al archivo de inventario',
        'Junto al archivo de inventario Y junto al playbook que se está ejecutando',
        'Solo en el directorio actual donde se ejecuta ansible-playbook',
      ],
      correctIndex: 2,
      explanation: 'Ansible busca group_vars/ y host_vars/ en dos lugares: junto al archivo/directorio de inventario, y junto al playbook. Esto permite tener variables globales del inventario y variables específicas del playbook sin conflictos.',
    },
    {
      question: '¿Qué ventaja tiene crear un directorio host_vars/web1.empresa.com/ en lugar de un archivo host_vars/web1.empresa.com.yml?',
      options: [
        'El directorio tiene mayor precedencia que el archivo',
        'Permite separar variables normales (vars.yml) de variables encriptadas (vault.yml) en archivos distintos',
        'Ansible procesa los directorios más rápido que los archivos individuales',
        'Es la única forma de que las variables de host sobreescriban las de grupo',
      ],
      correctIndex: 1,
      explanation: 'Usar un directorio permite dividir las variables en múltiples archivos dentro de él. El patrón más común es vars.yml para variables en texto plano y vault.yml para secretos encriptados con ansible-vault, manteniendo los secretos separados del código normal.',
    },
    {
      question: '¿Qué ocurre cuando la misma variable está definida en group_vars/servidores_web.yml y en host_vars/web1.empresa.com.yml?',
      options: [
        'Ansible lanza un error por variable duplicada',
        'El valor de group_vars gana porque los grupos tienen mayor precedencia',
        'El valor de host_vars gana porque las variables de host tienen mayor precedencia que las de grupo',
        'Ansible usa el valor que encuentre primero alfabéticamente',
      ],
      correctIndex: 2,
      explanation: 'Las variables de host siempre tienen mayor precedencia que las variables de grupo en Ansible. Un valor en host_vars/ sobreescribe el mismo nombre de variable definido en group_vars/, lo que permite customizaciones por host sin duplicar toda la configuración.',
    },
  ],
  troubleshooting: [
    {
      error: 'Las variables de group_vars no se aplican aunque el archivo existe',
      cause: 'El nombre del archivo en group_vars/ no coincide exactamente con el nombre del grupo en el inventario (diferencia de mayúsculas, guiones vs guiones bajos).',
      fix: 'Verificar que group_vars/nombre_grupo.yml use exactamente el mismo nombre que aparece en el inventario. Ansible es case-sensitive: "Servidores_Web" y "servidores_web" son grupos distintos.',
    },
    {
      error: 'ansible-vault encrypted variables are not being decrypted',
      cause: 'El archivo vault.yml dentro de host_vars/ o group_vars/ está encriptado pero no se proporcionó la contraseña del vault al ejecutar Ansible.',
      fix: 'Agregar --ask-vault-pass o --vault-password-file ~/.vault_pass al comando ansible-playbook. También configurar vault_password_file en ansible.cfg para evitar especificarlo cada vez.',
    },
    {
      error: 'Las variables de host_vars no se ven cuando el host se descubre por inventario dinámico',
      cause: 'El nombre usado como clave en host_vars/ no coincide con el hostname que asigna el plugin dinámico. Los plugins suelen usar el ID de instancia o el DNS público.',
      fix: 'Ejecutar ansible-inventory --list para ver el hostname exacto que asigna el plugin. Renombrar el archivo en host_vars/ para que coincida, o usar la clave "hostnames:" en el plugin para controlar qué se usa como nombre.',
    },
  ],
  objectives: [
    'Estructurar variables en group_vars/all.yml, group_vars/<grupo>.yml y host_vars/',
    'Separar variables normales de variables encriptadas con vault en archivos distintos',
    'Sobrescribir variables de grupo con variables de host para casos específicos',
    'Verificar el valor final de una variable con ansible -m debug',
  ],
  steps: [
    {
      title: 'Directorios host_vars y group_vars',
      body: `
        <p>En lugar de poner todas las variables en el archivo de inventario, podés usar directorios <code>host_vars/</code> y <code>group_vars/</code>. Ansible los busca automáticamente junto al inventario o al playbook.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">estructura-vars.sh</span></div>
          <pre class="language-bash"><code class="language-bash">inventario/
├── hosts.yml
├── group_vars/
│   ├── all.yml              # Variables para TODOS los hosts
│   ├── all/                 # Alternativa: directorio con múltiples archivos
│   │   ├── vars.yml
│   │   └── vault.yml        # Variables encriptadas con ansible-vault
│   ├── servidores_web.yml   # Variables para el grupo servidores_web
│   └── bases_de_datos.yml
└── host_vars/
  ├── web1.empresa.com.yml # Variables específicas para web1
  └── db1.empresa.com/
      ├── vars.yml
      └── vault.yml</code></pre>
        </div>
      `
    },
    {
      title: 'Ejemplo de group_vars y host_vars',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">inventario/group_vars/servidores_web.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml"># Variables comunes para todos los servidores web
ansible_user: ubuntu
http_port: 80
https_port: 443
nginx_worker_processes: auto
nginx_worker_connections: 1024
ssl_cert_dir: /etc/ssl/certs/empresa
log_dir: /var/log/nginx</code></pre>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">inventario/host_vars/web1.empresa.com.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml"># Variables SOLO para web1 — sobreescriben las del grupo
nginx_worker_processes: 4    # Este servidor tiene más CPUs
backup_enabled: true
backup_schedule: "0 2 * * *"</code></pre>
        </div>
        <div class="next-chapter-box">
          <div class="next-chapter-arrow">→</div>
          <div>
            <div class="next-chapter-label">A continuación</div>
            <div class="next-chapter-title">Precedencia de variables</div>
            <div class="next-chapter-desc">Cuando la misma variable está definida en varios lugares, Ansible aplica una jerarquía de 16 niveles para decidir qué valor gana.</div>
          </div>
        </div>
      `
    }
  ]
};
