import type { ModuleContent } from '../types';

export const nivel1Mod4: ModuleContent = {
  levelId: 1,
  moduleId: 4,
  title: 'Instalación de Ansible',
  objective: 'Instalar Ansible en el control node (Linux, macOS, WSL) y verificar la instalación con ansible --version.',
  duration: '30 minutos',
  objectives: [
    'Instalar Ansible en Linux, macOS o WSL usando pip',
    'Verificar la instalación con ansible --version e interpretar cada campo',
    'Crear un ansible.cfg básico con inventario y usuario SSH configurados',
    'Ejecutar ansible localhost -m ping y obtener SUCCESS',
  ],
  steps: [
    {
      title: 'Requisitos previos',
      body: `
        <p>Antes de instalar Ansible, verificá que tu sistema cumple los requisitos:</p>
        <ul>
          <li><strong>Sistema operativo</strong>: Linux o macOS (Windows con WSL)</li>
          <li><strong>Python 3.9+</strong> instalado</li>
          <li><strong>pip</strong> (gestor de paquetes Python)</li>
          <li>Acceso a internet para descargar paquetes</li>
        </ul>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">verificar-requisitos.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Verificar versión de Python
python3 --version              # necesitás 3.9 o superior
# Python 3.11.6

# Verificar pip
pip3 --version
# pip 23.x from /usr/lib/python3.11/site-packages/pip

# Verificar que SSH esté disponible
ssh -V
# OpenSSH_8.x, OpenSSL x.x</code></pre>
        </div>
      `
    },
    {
      title: 'Instalación en Linux (pip — recomendado)',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalar-linux-pip.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Opción 1: instalar en el entorno de usuario (recomendado)
pip3 install --user ansible

# Agregar el directorio de usuario al PATH si no está
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Opción 2: entorno virtual (mejor para proyectos específicos)
python3 -m venv ansible-env
source ansible-env/bin/activate
pip install ansible

# Opción 3: sistema (no recomendado — puede interferir con paquetes del SO)
sudo pip3 install ansible</code></pre>
        </div>
      `
    },
    {
      title: 'Instalación en Linux (gestor de paquetes)',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalar-linux-packages.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Ubuntu / Debian
sudo apt update
sudo apt install ansible

# RHEL / CentOS / Fedora
sudo dnf install ansible         # Fedora
sudo dnf install ansible-core    # RHEL 9 (paquete minimalista)

# Arch Linux
sudo pacman -S ansible

# Nota: los paquetes de distro pueden estar desactualizados.
# pip siempre tiene la versión más reciente.</code></pre>
        </div>
      `
    },
    {
      title: 'Instalación en macOS',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalar-macos.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Opción 1: Homebrew (recomendado para macOS)
brew install ansible

# Opción 2: pip (misma instalación que Linux)
pip3 install ansible

# Verificar
ansible --version</code></pre>
        </div>
      `
    },
    {
      title: 'Instalación en Windows (WSL)',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalar-wsl.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># 1. En PowerShell (como administrador), habilitar WSL
wsl --install                   # instala Ubuntu por defecto
# Reiniciar Windows

# 2. En la terminal WSL (Ubuntu)
sudo apt update
sudo apt install python3-pip
pip3 install --user ansible
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# 3. Verificar
ansible --version</code></pre>
        </div>
      `
    },
    {
      title: 'Verificar la instalación',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">verificar-instalacion.sh</span></div>
          <pre class="language-bash"><code class="language-bash">ansible --version
# ansible [core 2.17.x]       ← versión de ansible-core
#   config file = None         ← aún no hay ansible.cfg
#   configured module search path = ['/home/user/.ansible/plugins/modules', ...]
#   ansible python module location = /home/user/.local/lib/python3.11/site-packages/ansible
#   ansible collection location = /home/user/.ansible/collections:/usr/share/ansible/collections
#   executable location = /home/user/.local/bin/ansible
#   python version = 3.11.x   ← Python que usa Ansible
#   jinja version = 3.x        ← versión de Jinja2
#   libyaml = True             ← si es True, YAML parsing es más rápido

# Verificar subcomandos
ansible-playbook --version
ansible-galaxy --version
ansible-vault --version</code></pre>
        </div>
      `
    },
    {
      title: 'Estructura de directorios recomendada',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">estructura-proyecto.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Estructura recomendada para un proyecto Ansible
mi-proyecto/
├── ansible.cfg               # configuración local del proyecto
├── inventory/
│   ├── hosts.ini             # inventario estático
│   ├── group_vars/
│   │   ├── all.yml           # variables para todos los hosts
│   │   └── servidores_web.yml
│   └── host_vars/
│       └── web1.yml          # variables específicas de un host
├── playbooks/
│   ├── site.yml              # playbook principal
│   ├── servidores_web.yml
│   └── bases_de_datos.yml
└── roles/
  └── nginx/
      ├── tasks/main.yml
      └── handlers/main.yml</code></pre>
        </div>
      `
    },
    {
      title: 'ansible.cfg básico',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
          <pre class="language-ini"><code class="language-ini">[defaults]
inventory = ./inventory/hosts.ini    # ruta al inventario por defecto
remote_user = deploy                 # usuario SSH por defecto
host_key_checking = False            # deshabilitar verificación de host en lab
timeout = 30                         # segundos de timeout SSH
forks = 10                           # hosts paralelos por defecto

[privilege_escalation]
become = False                       # no usar sudo por defecto
become_method = sudo                 # método de escalada de privilegios
become_user = root                   # usuario objetivo de sudo

[ssh_connection]
pipelining = True                    # optimización de performance SSH</code></pre>
        </div>
      `
    },
    {
      title: 'Probar la conectividad',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">primer-ping.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Probar contra localhost (el control node mismo)
ansible localhost -m ping
# localhost | SUCCESS => {
#     "changed": false,
#     "ping": "pong"
# }

# Probar contra un inventario
ansible all -i inventory/hosts.ini -m ping

# Si usás contraseña SSH (no recomendado, usá claves)
ansible all -i inventory/hosts.ini -m ping -k    # -k pide contraseña SSH</code></pre>
        </div>
      `
    },
    {
      title: 'Resumen',
      body: `
        <div class="highlight-box">
          <p>Ansible está instalado en tu control node y verificaste que puede conectarse a los hosts. Tenés la estructura básica de un proyecto Ansible.</p>
        </div>
        <div class="challenge-box">
          <div class="challenge-title">🎯 Desafío</div>
          <div class="challenge-body">Instalá Ansible en tu máquina. Creá un <code>ansible.cfg</code> con tu configuración. Creá un inventario con al menos 2 hosts. Ejecutá <code>ansible all -m ping</code> y confirmá que ambos responden con SUCCESS.</div>
        </div>
      `
    }
  ],
  prerequisites: [
    'Haber completado el Módulo 3 (Características clave de Ansible)',
    'Tener Python 3.9 o superior instalado en el sistema',
    'Acceso a una terminal Linux, macOS, o WSL en Windows',
  ],
  quiz: [
    {
      question: '¿Cuál es el método de instalación recomendado para Ansible en Linux?',
      options: [
        'sudo apt install ansible (gestor de paquetes del sistema)',
        'pip3 install --user ansible (pip en el entorno de usuario)',
        'Descargar el binario directamente desde ansible.com',
        'Docker pull ansible/ansible',
      ],
      correctIndex: 1,
      explanation: 'pip3 install --user ansible es el método recomendado porque siempre instala la versión más reciente, no requiere privilegios de root, no interfiere con los paquetes del sistema, y el entorno virtual es una alternativa aún mejor para proyectos aislados. Los paquetes de la distro suelen estar desactualizados.',
    },
    {
      question: '¿Qué verifica el comando ansible --version además de la versión de Ansible?',
      options: [
        'Solo la versión de Ansible y nada más',
        'La versión de Ansible, el archivo de configuración activo, la versión de Python y de Jinja2',
        'Los hosts disponibles en el inventario por defecto',
        'La conectividad SSH con los Managed Nodes',
      ],
      correctIndex: 1,
      explanation: 'ansible --version muestra: la versión de ansible-core, el archivo ansible.cfg que está usando (o None si no hay ninguno), la ruta del módulo Python, las rutas de colecciones, la versión de Python usada, la versión de Jinja2, y si libyaml está habilitado (para parsing más rápido).',
    },
    {
      question: '¿Qué sucede cuando ejecutás ansible localhost -m ping?',
      options: [
        'Ansible hace un ping ICMP al localhost',
        'Ansible se conecta via SSH al localhost y ejecuta el módulo ping de Python',
        'Ansible verifica que el archivo de inventario tenga localhost definido',
        'El comando falla porque "localhost" no es un host válido sin un inventario',
      ],
      correctIndex: 1,
      explanation: 'ansible localhost -m ping se conecta via SSH (o una conexión local) al localhost, copia el módulo AnsiballZ_ping.py, lo ejecuta y espera la respuesta {"ping": "pong"}. Es la prueba mínima de que Ansible puede ejecutar módulos Python. "localhost" es un host implícito en Ansible sin necesitar inventario explícito.',
    },
  ],
  realWorldCase: 'Un nuevo desarrollador se incorpora a un equipo de infraestructura. En vez de seguir un documento de instalación de 20 pasos, ejecuta tres comandos: pip3 install --user ansible, crea un ansible.cfg apuntando al inventario de staging, y corre ansible all -m ping. En menos de 10 minutos tiene acceso completo a los 200 servidores del entorno de staging sin que nadie de operaciones tenga que intervenir.',
  troubleshooting: [
    {
      error: 'bash: ansible: command not found',
      cause: 'Ansible se instaló con pip --user pero ~/.local/bin no está en el PATH.',
      fix: 'echo \'export PATH="$HOME/.local/bin:$PATH"\' >> ~/.bashrc && source ~/.bashrc',
    },
    {
      error: 'ERROR! No module named ansible / ModuleNotFoundError: No module named ansible',
      cause: 'El entorno virtual que tiene Ansible no está activado, o se instaló con un Python diferente al que está en PATH.',
      fix: 'source ansible-env/bin/activate  —  luego verificá: which ansible && ansible --version',
    },
    {
      error: 'WARNING: ansible-core requires the locale encoding to be UTF-8',
      cause: 'La configuración regional del sistema no tiene UTF-8 como encoding por defecto.',
      fix: 'export LANG=en_US.UTF-8 && export LC_ALL=en_US.UTF-8  —  agregalo a ~/.bashrc para que persista.',
    },
  ],
};
