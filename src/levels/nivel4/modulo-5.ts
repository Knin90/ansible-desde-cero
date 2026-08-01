import type { ModuleContent } from '../types';

export const nivel4Mod5: ModuleContent = {
  levelId: 4,
  moduleId: 5,
  title: 'ansible-galaxy — Gestión de roles y collections',
  objective: 'Usar ansible-galaxy para instalar, crear y publicar roles y collections de Ansible Galaxy.',
  duration: '1.5 horas',
  objectives: [
    'Instalar roles y collections desde Galaxy usando requirements.yml',
    'Crear la estructura de un rol con ansible-galaxy role init',
    'Fijar versiones de dependencias en requirements.yml para reproducibilidad',
    'Inicializar el namespace de una collection propia',
  ],
  steps: [
    {
      title: 'Instalar roles y collections',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">galaxy-instalar.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Instalar un rol desde Galaxy
ansible-galaxy role install geerlingguy.nginx

# Instalar una versión específica
ansible-galaxy role install geerlingguy.nginx,3.1.0

# Instalar una collection
ansible-galaxy collection install community.general

# Instalar desde requirements.yml (la forma recomendada)
ansible-galaxy role install -r requirements.yml
ansible-galaxy collection install -r requirements.yml

# Ver roles instalados
ansible-galaxy role list

# Info de un rol
ansible-galaxy role info geerlingguy.nginx</code></pre>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">requirements.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">roles:
- name: geerlingguy.nginx
  version: "3.1.0"
- name: geerlingguy.postgresql
  version: "3.3.0"

collections:
- name: community.general
  version: ">=7.0.0"
- name: amazon.aws
  version: "6.0.0"</code></pre>
        </div>
      `
    },
    {
      title: 'Crear la estructura de un rol',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">galaxy-crear.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Crear la estructura de un rol nuevo
ansible-galaxy role init mi-rol

# La estructura creada:
# mi-rol/
# ├── README.md
# ├── defaults/
# │   └── main.yml      # Variables con defaults (menor precedencia)
# ├── files/            # Archivos estáticos
# ├── handlers/
# │   └── main.yml      # Handlers
# ├── meta/
# │   └── main.yml      # Metadatos y dependencias
# ├── tasks/
# │   └── main.yml      # Tareas principales
# ├── templates/        # Templates Jinja2
# ├── tests/            # Tests del rol
# └── vars/
#     └── main.yml      # Variables internas del rol (mayor precedencia)

# Crear un namespace de collection
ansible-galaxy collection init mi_empresa.mi_collection</code></pre>
        </div>
        <div class="next-chapter-box">
          <div class="next-chapter-arrow">→</div>
          <div>
            <div class="next-chapter-label">A continuación</div>
            <div class="next-chapter-title">ansible-vault</div>
            <div class="next-chapter-desc">Protegés contraseñas, claves API y otros secretos con encriptación AES-256 directamente en el repositorio Git.</div>
          </div>
        </div>
      `
    }
  ],
  prerequisites: [
    'Completar el Módulo 4 del Nivel 4 — ansible-doc',
  ],
  realWorldCase: 'Un equipo hereda un proyecto de Ansible sin documentación. Con <code>ansible-galaxy role install -r requirements.yml</code> instalan en segundos todos los roles de la comunidad que el proyecto necesita, reproduciendo el entorno original sin intervención manual.',
  quiz: [
    {
      question: '¿Cuál es la forma recomendada de instalar múltiples roles y collections en un proyecto Ansible?',
      options: [
        'Instalar cada uno con un comando separado',
        'Listarlos en requirements.yml y usar ansible-galaxy install -r requirements.yml',
        'Clonar los repositorios manualmente en la carpeta roles/',
        'Usar pip install para cada dependencia',
      ],
      correctIndex: 1,
      explanation: 'requirements.yml centraliza todas las dependencias (roles y collections) con sus versiones exactas. ansible-galaxy install -r requirements.yml instala todo de una vez, garantizando reproducibilidad.',
    },
    {
      question: '¿Qué comando crea la estructura de directorios estándar para un nuevo rol de Ansible?',
      options: [
        'ansible-galaxy role create mi-rol',
        'ansible-galaxy role init mi-rol',
        'ansible-galaxy new role mi-rol',
        'ansible-galaxy role scaffold mi-rol',
      ],
      correctIndex: 1,
      explanation: 'ansible-galaxy role init mi-rol crea la estructura completa: tasks/, handlers/, defaults/, vars/, files/, templates/, meta/ y tests/, siguiendo la convención estándar de roles.',
    },
    {
      question: '¿En qué directorio instala ansible-galaxy los roles por defecto?',
      options: [
        '/usr/share/ansible/roles',
        '~/.ansible/roles',
        './roles en el directorio actual',
        '/etc/ansible/roles',
      ],
      correctIndex: 1,
      explanation: 'Por defecto ansible-galaxy instala roles en ~/.ansible/roles. Se puede cambiar con roles_path en ansible.cfg o con el flag -p al instalar.',
    },
  ],
  troubleshooting: [
    {
      error: 'ERROR! the role \'geerlingguy.nginx\' was not found in /root/.ansible/roles',
      cause: 'Se referencia un rol en un playbook que no está instalado en ninguno de los roles_path configurados.',
      fix: 'Instalá el rol con ansible-galaxy role install geerlingguy.nginx o agregalo a requirements.yml y ejecutá ansible-galaxy install -r requirements.yml.',
    },
    {
      error: 'ERROR! No collection was found matching \'community.general\'',
      cause: 'Se usa un módulo de una collection que no está instalada en collections_paths.',
      fix: 'Instalá la collection con ansible-galaxy collection install community.general. Agregala a requirements.yml para reproducibilidad.',
    },
    {
      error: 'HttpError on GET https://galaxy.ansible.com/api/: 429 Too Many Requests',
      cause: 'Galaxy impone rate limiting. Se alcanzó el límite de peticiones desde la IP.',
      fix: 'Esperá unos minutos e intentá de nuevo. Para CI/CD, configurá un servidor Ansible Automation Hub privado o usá git como fuente en requirements.yml.',
    },
  ],
};
