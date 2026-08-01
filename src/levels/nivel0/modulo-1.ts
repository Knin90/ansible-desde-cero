import type { ModuleContent } from '../types';

export const nivel0Mod1: ModuleContent = {
  levelId: 0,
  moduleId: 1,
  title: 'Linux — Fundamentos para Ansible',
  objective: 'Dominar los conceptos de Linux imprescindibles para gestionar hosts remotos con Ansible: sistema de archivos, permisos, servicios y SSH.',
  duration: '3–4 horas',
  objectives: [
    'Navegar el sistema de archivos Linux y entender la jerarquía de directorios',
    'Gestionar permisos de archivos con chmod y chown',
    'Controlar servicios del sistema con systemctl',
    'Configurar autenticación SSH sin contraseña',
    'Ejecutar comandos de diagnóstico para verificar el estado del servidor',
  ],
  prerequisites: [
    'Acceso a una terminal (Linux, macOS, o WSL en Windows)',
    'Curiosidad sobre cómo funcionan los servidores',
  ],
  steps: [
    {
      title: '¿Por qué Linux antes de Ansible?',
      body: `
        <p>Ansible gestiona servidores. La inmensa mayoría de esos servidores corren Linux. Antes de automatizar, necesitás entender qué estás automatizando.</p>
        <p>Cuando Ansible ejecuta un playbook, básicamente envía comandos a un servidor Linux a través de SSH. Si no entendés cómo funciona Linux, no vas a poder escribir playbooks correctos ni diagnosticar errores.</p>
        <div class="highlight-box"><p><strong>Regla de oro:</strong> Ansible no es magia — es Linux automatizado. Todo lo que Ansible hace, lo podrías hacer a mano con SSH. La diferencia es que Ansible lo hace de manera repetible y declarativa.</p></div>
        <div class="analogy-box">
          <div class="analogy-box-header">💡 Analogía</div>
          <p>Pensá en Linux como el idioma nativo de los servidores. Ansible es el traductor — pero el traductor necesita conocer el idioma antes de poder traducirlo.</p>
        </div>
        <div class="tech-term-box">
          <div class="tech-term-label">En términos técnicos</div>
          Linux es un kernel de sistema operativo de código abierto. Ansible se comunica con él mediante SSH, ejecutando comandos shell y módulos Python directamente en el sistema de archivos del host remoto.
        </div>
      `
    },
    {
      title: 'Sistema de archivos Linux',
      body: `
        <p>Linux organiza todo en un árbol de directorios que empieza en <code>/</code> (la raíz). Cada directorio tiene un propósito bien definido:</p>
        <ul>
          <li><strong>/etc</strong> — Archivos de configuración del sistema. Ansible modifica archivos aquí constantemente (nginx.conf, ssh/sshd_config, etc.)</li>
          <li><strong>/var</strong> — Datos variables: logs (<code>/var/log</code>), bases de datos, colas de correo</li>
          <li><strong>/home</strong> — Directorios personales de los usuarios</li>
          <li><strong>/usr</strong> — Programas instalados (<code>/usr/bin</code>, <code>/usr/lib</code>)</li>
          <li><strong>/tmp</strong> — Archivos temporales. Ansible usa este directorio para copiar y ejecutar módulos Python</li>
          <li><strong>/opt</strong> — Software de terceros instalado manualmente</li>
        </ul>
        <div class="tip-box">
          <span class="box-icon">💡</span>
          <div class="box-content"><strong>Dato Ansible:</strong> cuando Ansible ejecuta un módulo, copia el módulo Python a <code>/tmp</code> del host remoto, lo ejecuta, y luego lo borra. Por eso <code>/tmp</code> debe ser escribible.</div>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">explorar-filesystem.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Ver el directorio raíz
ls /

# Ver configuraciones del sistema
ls /etc/ | head -20

# Ver logs recientes (Ansible registra acciones aquí)
ls /var/log/

# Ver los binarios disponibles
ls /usr/bin/ | grep ansible</code></pre>
        </div>
      `
    },
    {
      title: 'Permisos en Linux',
      body: `
        <p>Linux protege archivos y directorios con un sistema de permisos basado en tres actores: <strong>owner</strong> (propietario), <strong>group</strong> (grupo) y <strong>others</strong> (todos los demás). Cada actor tiene tres permisos posibles: <strong>r</strong> (read/leer), <strong>w</strong> (write/escribir), <strong>x</strong> (execute/ejecutar).</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">permisos.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Ver permisos de archivos
ls -la /etc/nginx/nginx.conf
# -rw-r--r-- 1 root root 1234 Jan 1 12:00 nginx.conf
# │││ │││ │││
# │││ │││ └── others: r (sólo lectura)
# │││ └────── group:  r (sólo lectura)
# └────────── owner:  rw (leer y escribir)

# Cambiar permisos — chmod
chmod 644 /etc/mi-config.conf   # owner: rw, group: r, others: r
chmod 755 /usr/local/bin/script  # owner: rwx, group: rx, others: rx
chmod +x /opt/mi-script.sh       # agregar ejecución a todos

# Cambiar propietario — chown
chown usuario:grupo archivo.txt
chown -R deploy:deploy /var/www/html   # -R: recursivo

# Ejecutar como root — sudo
sudo systemctl restart nginx
sudo apt install curl</code></pre>
        </div>
        <div class="warning-box">
          <span class="box-icon">⚠️</span>
          <div class="box-content"><strong>Ansible y permisos:</strong> el usuario con el que Ansible se conecta (ansible_user) necesita permisos suficientes. Para tareas de administración usás <code>become: true</code> que equivale a <code>sudo</code>.</div>
        </div>
      `
    },
    {
      title: 'Gestión de servicios con systemctl',
      body: `
        <p><code>systemctl</code> es la herramienta principal para gestionar servicios en sistemas Linux modernos (Ubuntu 16+, RHEL 7+, Debian 8+). Ansible usa el módulo <code>ansible.builtin.service</code> que internamente llama a systemctl.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">servicios.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Ver estado de un servicio
systemctl status nginx
# ● nginx.service - A high performance web server
#    Loaded: loaded (/lib/systemd/system/nginx.service)
#    Active: active (running) since Mon 2024-01-01 12:00:00 UTC

# Iniciar un servicio
sudo systemctl start nginx

# Detener un servicio
sudo systemctl stop nginx

# Reiniciar (stop + start)
sudo systemctl restart nginx

# Recargar configuración sin interrumpir conexiones
sudo systemctl reload nginx

# Habilitar para que inicie con el sistema
sudo systemctl enable nginx

# Deshabilitar inicio automático
sudo systemctl disable nginx

# Ver todos los servicios activos
systemctl list-units --type=service --state=active</code></pre>
        </div>
        <p>En Ansible, esto se escribe como:</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbook-service.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml">- name: Gestionar nginx          # nombre descriptivo de la tarea
ansible.builtin.service:       # módulo de gestión de servicios
  name: nginx                  # nombre del servicio
  state: started               # estado deseado (started/stopped/restarted)
  enabled: true                # equivale a systemctl enable</code></pre>
        </div>
      `
    },
    {
      title: 'SSH — el protocolo que usa Ansible',
      body: `
        <p>SSH (Secure Shell) es el protocolo que Ansible usa para conectarse a los hosts remotos. Entender SSH es fundamental para entender cómo funciona Ansible internamente.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ssh-setup.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># 1. Generar un par de claves SSH (en tu máquina local)
ssh-keygen -t ed25519 -C "ansible-control-node"
# Crea dos archivos:
# ~/.ssh/id_ed25519      ← clave PRIVADA (nunca compartas esto)
# ~/.ssh/id_ed25519.pub  ← clave PÚBLICA (la copiarás al servidor)

# 2. Copiar la clave pública al servidor remoto
ssh-copy-id -i ~/.ssh/id_ed25519.pub usuario@servidor.ejemplo.com
# Esto agrega tu clave a:
# /home/usuario/.ssh/authorized_keys en el servidor

# 3. Conectarte sin contraseña
ssh usuario@servidor.ejemplo.com
# Ansible hace exactamente esto internamente

# 4. Probar conectividad con Ansible
ansible all -i servidor.ejemplo.com, -m ping -u usuario
# Si funciona, Ansible puede gestionar ese servidor</code></pre>
        </div>
        <div class="highlight-box">
          <p><strong>Cómo funciona la autenticación por clave:</strong> tu clave privada en el control node "firma" la conexión. El servidor verifica la firma contra tu clave pública en <code>authorized_keys</code>. Si coincide, la conexión se autentica sin contraseña. Esto es exactamente lo que Ansible usa.</p>
        </div>
      `
    },
    {
      title: 'Variables de entorno',
      body: `
        <p>Las variables de entorno son valores que el sistema operativo pone a disposición de todos los procesos. Ansible las usa internamente y también puede establecerlas en los hosts remotos.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">env-vars.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Ver todas las variables de entorno
env | sort

# Variables importantes
echo $PATH           # directorios donde el sistema busca ejecutables
echo $HOME           # directorio personal del usuario actual
echo $USER           # nombre del usuario actual
echo $HOSTNAME       # nombre del host

# Definir una variable temporal (sólo para la sesión actual)
export MI_VARIABLE="valor"
echo $MI_VARIABLE

# Variables de Ansible relevantes
export ANSIBLE_HOST_KEY_CHECKING=False  # no preguntar por fingerprint SSH
export ANSIBLE_INVENTORY=./inventory    # ruta al inventario por defecto
export ANSIBLE_ROLES_PATH=./roles       # dónde buscar roles</code></pre>
        </div>
      `
    },
    {
      title: 'Comandos de diagnóstico esenciales',
      body: `
        <p>Estos comandos te permiten diagnosticar problemas en servidores remotos — los mismos que usarás cuando un playbook falle.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">diagnosticos.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Ver procesos corriendo
ps aux | grep nginx

# Ver puertos en uso
ss -tulnp          # moderno
netstat -tulnp     # clásico

# Ver logs del sistema
journalctl -u nginx -f    # logs de nginx en tiempo real
tail -f /var/log/syslog   # log del sistema

# Espacio en disco (vital antes de instalar software)
df -h              # uso de discos
du -sh /var/log/*  # tamaño de cada directorio de logs

# Memoria RAM
free -h

# CPU y carga del sistema
top                # interactivo
uptime             # carga promedio</code></pre>
        </div>
      `
    },
    {
      title: 'Relación directa con Ansible',
      body: `
        <p>Todo lo que hiciste a mano hasta ahora, Ansible lo automatiza. La equivalencia es directa:</p>
        <table class="comparison-table">
          <tr><th>Comando Linux manual</th><th>Módulo Ansible equivalente</th></tr>
          <tr><td>systemctl start nginx</td><td>ansible.builtin.service: state=started</td></tr>
          <tr><td>apt install nginx</td><td>ansible.builtin.apt: name=nginx state=present</td></tr>
          <tr><td>cp archivo.conf /etc/nginx/</td><td>ansible.builtin.copy: src/dest</td></tr>
          <tr><td>useradd deploy</td><td>ansible.builtin.user: name=deploy</td></tr>
          <tr><td>chmod 644 archivo</td><td>ansible.builtin.file: mode=0644</td></tr>
        </table>
      `
    },
    {
      title: 'Práctica guiada',
      body: `
        <div class="lab-box">
          <div class="lab-box-header">🧪 Laboratorio</div>
          <div class="lab-section">
            <div class="lab-section-title">Objetivo</div>
            <p style="font-size:0.9rem;color:var(--color-text-muted);line-height:1.65">Practicar los comandos Linux esenciales en una máquina virtual o tu propia máquina, simulando lo que Ansible hará de forma automática.</p>
          </div>
          <div class="lab-section">
            <div class="lab-section-title">Pasos</div>
            <ol>
              <li>Navegá el sistema de archivos: explorá <code>/etc</code>, <code>/var/log</code>, <code>/usr/bin</code></li>
              <li>Creá un archivo, cambiale los permisos con <code>chmod</code>, y verificá con <code>ls -la</code></li>
              <li>Instalá nginx (si tenés sudo) con <code>apt install nginx</code> o <code>dnf install nginx</code></li>
              <li>Verificá el estado del servicio con <code>systemctl status nginx</code></li>
              <li>Generá un par de claves SSH con <code>ssh-keygen -t ed25519</code></li>
            </ol>
          </div>
          <div class="lab-section">
            <div class="lab-section-title">Verificación</div>
            <ul>
              <li>El archivo que creaste muestra los permisos correctos con <code>ls -la</code></li>
              <li><code>systemctl status nginx</code> muestra <code>active (running)</code></li>
              <li>Los archivos <code>~/.ssh/id_ed25519</code> y <code>~/.ssh/id_ed25519.pub</code> existen</li>
            </ul>
          </div>
          <div class="lab-section">
            <div class="lab-section-title">Resultado esperado</div>
            <div class="lab-expected">
              <div class="lab-expected-item"><span class="lab-expected-check">✓</span> El filesystem responde correctamente a <code>ls /etc</code> y <code>ls /var/log</code></div>
              <div class="lab-expected-item"><span class="lab-expected-check">✓</span> Los permisos del archivo cambiado se muestran correctamente con <code>ls -la</code></div>
              <div class="lab-expected-item"><span class="lab-expected-check">✓</span> <code>systemctl status nginx</code> muestra <code>active (running)</code></div>
              <div class="lab-expected-item"><span class="lab-expected-check">✓</span> El par de claves SSH existe en <code>~/.ssh/id_ed25519</code> y <code>~/.ssh/id_ed25519.pub</code></div>
            </div>
          </div>
          <div class="lab-section">
            <div class="lab-section-title">Preguntas para reflexionar</div>
            <ul>
              <li>¿Qué diferencia hay entre <code>chmod 644</code> y <code>chmod 755</code>?</li>
              <li>¿Por qué Ansible copia módulos a <code>/tmp</code> en lugar de <code>/home</code>?</li>
              <li>¿Qué pasa si el usuario SSH de Ansible no tiene acceso a <code>sudo</code>?</li>
            </ul>
          </div>
        </div>
      `
    },
    {
      title: 'Resumen y próximos pasos',
      body: `
        <div class="highlight-box">
          <p>Aprendiste los fundamentos de Linux que Ansible necesita: sistema de archivos, permisos, servicios y SSH. Con esto podés entender qué hace Ansible cuando ejecuta un playbook en un host remoto.</p>
        </div>
        <div class="lab-box">
          <div class="lab-box-header">🧪 Laboratorio final</div>
          <div class="lab-section">
            <div class="lab-section-title">Objetivo</div>
            <p style="font-size:0.9rem;color:var(--color-text-muted);line-height:1.65">Preparar un entorno Linux completo que luego usarás como managed node de Ansible.</p>
          </div>
          <div class="lab-section">
            <div class="lab-section-title">Pasos</div>
            <ol>
              <li>Configurá una máquina virtual Linux con Ubuntu 22.04 o Rocky Linux 9</li>
              <li>Generá un par de claves SSH con <code>ssh-keygen -t ed25519</code></li>
              <li>Copiá la clave pública al servidor con <code>ssh-copy-id</code></li>
              <li>Conectate por SSH sin contraseña</li>
              <li>Instalá nginx manualmente y verificá con <code>systemctl status nginx</code></li>
            </ol>
          </div>
          <div class="lab-section">
            <div class="lab-section-title">Verificación</div>
            <ul>
              <li>Podés hacer <code>ssh usuario@servidor</code> sin que pida contraseña</li>
              <li>nginx responde en <code>http://IP-del-servidor</code></li>
            </ul>
          </div>
          <div class="lab-section">
            <div class="lab-section-title">Preguntas para reflexionar</div>
            <ul>
              <li>¿Qué comandos de este módulo vas a ver automatizados por Ansible en el Nivel 1?</li>
              <li>¿Cuál es la diferencia entre el usuario del sistema y el usuario SSH de Ansible?</li>
            </ul>
          </div>
        </div>
        <div class="next-chapter-box">
          <div class="next-chapter-arrow">→</div>
          <div>
            <div class="next-chapter-label">A continuación</div>
            <div class="next-chapter-title">Redes para Ansible</div>
            <div class="next-chapter-desc">Aprendés las bases de IP, DNS, SSH y diagnóstico de red que Ansible necesita para conectarse a los hosts remotos.</div>
          </div>
        </div>
      `
    }
  ],
  quiz: [
    {
      question: '¿Qué directorio usa Ansible para copiar y ejecutar módulos Python en el host remoto?',
      options: ['/home', '/tmp', '/usr/bin', '/etc'],
      correctIndex: 1,
      explanation: 'Ansible copia los módulos Python a /tmp del host remoto, los ejecuta, y luego los borra. Por eso /tmp debe ser escribible.',
    },
    {
      question: '¿Qué equivalente tiene "systemctl start nginx" en Ansible?',
      options: [
        'ansible.builtin.shell: systemctl start nginx',
        'ansible.builtin.service: name=nginx state=started',
        'ansible.builtin.command: start nginx',
        'ansible.builtin.apt: name=nginx state=started',
      ],
      correctIndex: 1,
      explanation: 'El módulo ansible.builtin.service gestiona servicios de forma declarativa e idempotente. Escribís el estado deseado (started), no el comando.',
    },
    {
      question: '¿Qué protocolo usa Ansible para conectarse a los hosts remotos?',
      options: ['HTTP', 'RDP', 'SSH', 'Telnet'],
      correctIndex: 2,
      explanation: 'Ansible usa SSH (Secure Shell) para conectarse a los hosts remotos. Esto es lo que lo hace "agentless" — SSH ya está instalado en todos los servidores Linux.',
    },
  ],
  realWorldCase: 'Una empresa con 200 servidores web usa Ansible para configurar nginx en todos ellos de forma simultánea. Lo que antes tomaba días de trabajo manual ahora se ejecuta en minutos con un solo comando. Los mismos comandos Linux que aprendiste aquí son los que Ansible automatiza.',
  troubleshooting: [
    {
      error: 'Permission denied (publickey,gssapi-keyex,gssapi-with-mic)',
      cause: 'La clave pública SSH no está en authorized_keys del servidor, o el usuario no existe en el host remoto.',
      fix: 'ssh-copy-id -i ~/.ssh/id_ed25519.pub usuario@servidor.ejemplo.com',
    },
    {
      error: 'sudo: command not found / sudo: no se ha encontrado la orden',
      cause: 'El usuario SSH de Ansible no tiene sudo instalado o no pertenece al grupo sudoers/wheel.',
      fix: 'apt install sudo && usermod -aG sudo usuario  (Debian/Ubuntu)  |  dnf install sudo && usermod -aG wheel usuario  (RHEL/Fedora)',
    },
    {
      error: 'chdir /tmp/ansible-tmp-xxx/: Permission denied',
      cause: 'El directorio /tmp no es escribible por el usuario, o está montado con noexec.',
      fix: 'Verificá permisos: ls -la / | grep tmp  —  Ansible requiere /tmp escribible y ejecutable para copiar módulos Python.',
    },
  ],
};
