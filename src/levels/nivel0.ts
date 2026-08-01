import type { ModuleContent } from './types';

export const nivel0Modules: ModuleContent[] = [
  {
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
  },
  {
    levelId: 0,
    moduleId: 2,
    title: 'Redes — Fundamentos para Ansible',
    objective: 'Entender los conceptos de red que Ansible usa para conectarse a los hosts remotos: IP, DNS, SSH y herramientas de diagnóstico.',
    duration: '2–3 horas',
    objectives: [
      'Interpretar direcciones IP y rangos CIDR en inventarios de Ansible',
      'Configurar y verificar resolución DNS para hosts administrados',
      'Diagnosticar problemas de conectividad SSH antes de ejecutar playbooks',
      'Configurar variables de red en el inventario de Ansible',
    ],
    prerequisites: ['Haber completado el módulo de Linux (Módulo 1 del Nivel 0)'],
    steps: [
      {
        title: 'Por qué las redes importan en Ansible',
        body: `
          <p>Ansible necesita llegar a los hosts remotos a través de la red. Si hay problemas de conectividad, los playbooks fallan antes de ejecutar una sola tarea. Entender redes te permite diagnosticar estos problemas rápidamente.</p>
          <div class="highlight-box"><p>El error más común en Ansible principiante es intentar ejecutar un playbook cuando el host remoto no es alcanzable por red, o cuando SSH está bloqueado por firewall.</p></div>
        `
      },
      {
        title: 'Direcciones IP y CIDR',
        body: `
          <p>Cada host en la red tiene una dirección IP que lo identifica. Ansible usa estas IPs (o nombres DNS) en el inventario.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">network-basics.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Ver tu dirección IP
ip addr show
# O el comando clásico:
ifconfig

# Rango de red CIDR — notación importante para inventarios dinámicos
# 192.168.1.0/24  →  256 hosts (192.168.1.0 a 192.168.1.255)
# 10.0.0.0/8      →  16 millones de hosts
# 172.16.0.0/16   →  65536 hosts

# En Ansible inventory podés usar rangos:
# [servidores]
# web[1:10].ejemplo.com   ← web1 a web10
# 192.168.1.[10:20]       ← IPs 192.168.1.10 a 192.168.1.20</code></pre>
          </div>
        `
      },
      {
        title: 'DNS — resolución de nombres',
        body: `
          <p>DNS convierte nombres como <code>web1.ejemplo.com</code> en direcciones IP como <code>192.168.1.10</code>. En el inventario de Ansible podés usar tanto IPs como nombres DNS.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">dns-commands.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Resolver un nombre a IP
nslookup web1.ejemplo.com
dig web1.ejemplo.com

# Ver la configuración DNS de tu sistema
cat /etc/resolv.conf
# nameserver 8.8.8.8    ← servidor DNS configurado

# El archivo /etc/hosts — resolución local sin DNS
# Ansible busca aquí antes que en DNS
cat /etc/hosts
# 127.0.0.1   localhost
# 192.168.1.10   web1.ejemplo.com   web1  ← alias manual

# Verificar qué IP resuelve un nombre
getent hosts web1.ejemplo.com</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content">En entornos de laboratorio sin DNS real, podés agregar los hosts a <code>/etc/hosts</code> del control node. Ansible resolverá los nombres localmente.</div>
          </div>
        `
      },
      {
        title: 'SSH en detalle',
        body: `
          <p>SSH (Secure Shell) usa el puerto 22 por defecto. El handshake SSH tiene varios pasos: negociación de algoritmos, autenticación del servidor, autenticación del cliente.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ssh-details.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Conectarse por SSH (modo verbose para diagnosticar)
ssh -v usuario@192.168.1.10
# -v muestra el proceso de handshake completo

# Conectarse a un puerto SSH no estándar
ssh -p 2222 usuario@servidor.ejemplo.com

# En Ansible, esto se configura con variables:
# ansible_port: 2222
# ansible_user: usuario

# Ver si el puerto SSH está abierto
nc -z -w 3 192.168.1.10 22 && echo "Puerto 22 abierto" || echo "Puerto cerrado"

# Verificar la clave del servidor (fingerprint)
ssh-keyscan -H 192.168.1.10 >> ~/.ssh/known_hosts</code></pre>
          </div>
        `
      },
      {
        title: 'Firewall — por qué bloquea Ansible',
        body: `
          <p>El firewall puede bloquear las conexiones SSH de Ansible. Necesitás entender cómo verificar y ajustar reglas básicas.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">firewall.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Ubuntu / Debian — ufw (Uncomplicated Firewall)
sudo ufw status                    # ver reglas actuales
sudo ufw allow 22/tcp              # permitir SSH
sudo ufw allow from 192.168.1.0/24 # permitir toda una red

# RHEL / CentOS — firewalld
sudo firewall-cmd --list-all       # ver reglas
sudo firewall-cmd --add-service=ssh --permanent  # permitir SSH
sudo firewall-cmd --reload         # aplicar cambios

# Ver reglas iptables directamente (bajo nivel)
sudo iptables -L -n --line-numbers</code></pre>
          </div>
        `
      },
      {
        title: 'Comandos de diagnóstico de red',
        body: `
          <p>Estos comandos te permiten verificar la conectividad antes de ejecutar un playbook, y diagnosticar por qué Ansible no puede llegar a un host.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">network-debug.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Probar alcanzabilidad básica (ICMP)
ping -c 4 192.168.1.10

# Probar puerto específico (SSH = 22)
nc -z -w 5 192.168.1.10 22

# Ver ruta de los paquetes hasta el destino
traceroute 192.168.1.10

# Probar HTTP con curl (útil para verificar aplicaciones desplegadas)
curl -I http://192.168.1.10/

# Verificar todos los puertos abiertos en un host (si tenés nmap)
nmap -p 22,80,443 192.168.1.10

# Diagnóstico completo con Ansible
ansible all -i inventory -m ping -vvv    # -vvv = máximo verbose</code></pre>
          </div>
        `
      },
      {
        title: 'Variables de red en Ansible',
        body: `
          <p>Ansible tiene variables especiales para controlar cómo se conecta a los hosts:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">inventory/hosts.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">all:
  hosts:
    servidor-web:
      ansible_host: 192.168.1.10      # IP real (si el nombre no resuelve)
      ansible_port: 22                # puerto SSH (22 es el default)
      ansible_user: deploy            # usuario SSH
      ansible_ssh_private_key_file: ~/.ssh/id_ed25519  # clave SSH específica
      ansible_ssh_common_args: '-o StrictHostKeyChecking=no'  # opciones SSH extra</code></pre>
          </div>
        `
      },
      {
        title: 'Latencia y timeouts',
        body: `
          <p>En redes lentas o con alta latencia, Ansible puede agotar el tiempo de espera. Sabé dónde ajustar estos valores.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
            <pre class="language-ini"><code class="language-ini">[defaults]
timeout = 30                  # segundos para establecer conexión SSH
gather_timeout = 60           # tiempo para recopilar facts

[ssh_connection]
ssh_args = -o ConnectTimeout=30 -o ServerAliveInterval=10
retries = 3                   # reintentar conexión 3 veces</code></pre>
          </div>
        `
      },
      {
        title: 'Práctica: verificar conectividad',
        body: `
          <p>Antes de ejecutar cualquier playbook, verificá la conectividad manualmente:</p>
          <ol>
            <li>Ping al host: <code>ping -c 3 servidor.ejemplo.com</code></li>
            <li>Verificar puerto SSH: <code>nc -z servidor.ejemplo.com 22</code></li>
            <li>Conectarse por SSH: <code>ssh usuario@servidor.ejemplo.com</code></li>
            <li>Ejecutar ping de Ansible: <code>ansible all -i inventario -m ping</code></li>
          </ol>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content">Si el paso 3 (SSH manual) falla, el paso 4 (Ansible ping) también va a fallar. Siempre verificá la conectividad SSH antes de culpar a Ansible.</div>
          </div>
        `
      },
      {
        title: 'Resumen',
        body: `
          <div class="highlight-box">
            <p>Entendés las bases de red que necesita Ansible: IPs, DNS, SSH y cómo diagnosticar problemas de conectividad. Con esto podés resolver el 80% de los problemas de "Ansible no puede conectarse al host".</p>
          </div>
          <div class="challenge-box">
            <div class="challenge-title">🎯 Desafío</div>
            <div class="challenge-body">Configurá dos máquinas virtuales en la misma red. Generá claves SSH. Verificá conectividad con los comandos de diagnóstico. Luego usá <code>ansible all -m ping</code> para confirmar que Ansible puede llegar a ambas.</div>
          </div>
        `
      }
    ],
    quiz: [
      {
        question: '¿Cuál es la causa más común de que Ansible no pueda conectarse a un host?',
        options: [
          'El playbook tiene errores de sintaxis YAML',
          'SSH está bloqueado o el host no es alcanzable',
          'Ansible no está instalado en el host remoto',
          'La versión de Python no es compatible',
        ],
        correctIndex: 1,
        explanation: 'Si el host no es alcanzable por red o el puerto 22 está bloqueado por el firewall, Ansible fallará antes de ejecutar cualquier tarea. Siempre verificá la conectividad SSH manualmente antes de culpar a Ansible.',
      },
      {
        question: '¿En qué archivo podés agregar un host con su IP para que resuelva localmente sin DNS?',
        options: ['/etc/resolv.conf', '/etc/hosts', '/etc/network/interfaces', '/etc/ssh/sshd_config'],
        correctIndex: 1,
        explanation: 'El archivo /etc/hosts permite resolver nombres de host a IPs sin necesitar un servidor DNS. Ansible busca aquí antes que en DNS real. Muy útil en laboratorios.',
      },
      {
        question: '¿Qué comando de Ansible confirma que la conectividad SSH y Python funcionan correctamente?',
        options: ['ansible all -m command -a "ping"', 'ansible all -m ping', 'ansible-playbook --check', 'ansible all --test'],
        correctIndex: 1,
        explanation: 'ansible all -m ping verifica toda la cadena: conectividad de red → SSH → Python instalado en el host remoto. Si responde "pong", todo está funcionando.',
      },
    ],
    realWorldCase: 'Un equipo de DevOps en una empresa de e-commerce usa Ansible para gestionar 50 servidores distribuidos en 3 regiones. Antes de cada despliegue, verifican automáticamente la conectividad con ansible all -m ping. Si algún servidor falla, lo detectan antes de empezar el deploy — no durante.',
  },
  {
    levelId: 0,
    moduleId: 3,
    title: 'YAML — El lenguaje de Ansible',
    objective: 'Dominar la sintaxis YAML que Ansible usa en playbooks, inventarios y roles. Entender escalares, listas, diccionarios, multilínea y anchors.',
    duration: '3–4 horas',
    objectives: [
      'Escribir escalares, listas y diccionarios YAML correctamente',
      'Usar bloques multilínea con | y > según el caso de uso',
      'Aplicar anchors y aliases para evitar repetición en configuraciones',
      'Detectar y corregir los errores de sintaxis YAML más comunes',
      'Validar un playbook con yamllint y ansible --syntax-check',
    ],
    steps: [
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
      },
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
    ],
    prerequisites: [
      'Haber completado el módulo de Redes (Módulo 2 del Nivel 0)',
      'Tener un editor de texto configurado con soporte YAML (VSCode, Neovim, etc.)',
    ],
    quiz: [
      {
        question: '¿Qué carácter se usa en YAML para definir una lista?',
        options: ['*', '-', '|', '#'],
        correctIndex: 1,
        explanation: 'El guión "-" seguido de un espacio define cada ítem de una lista en YAML. Por ejemplo: "- nginx" define un ítem de lista con el valor "nginx".',
      },
      {
        question: '¿Cuál es la diferencia entre los operadores "|" y ">" para texto multilínea en YAML?',
        options: [
          '| preserva saltos de línea; > los colapsa en un espacio',
          '| colapsa saltos de línea; > los preserva',
          'Ambos hacen lo mismo, son intercambiables',
          '| es para comentarios; > es para multilínea',
        ],
        correctIndex: 0,
        explanation: 'El operador "|" (literal block) preserva cada salto de línea tal cual. El operador ">" (folded block) colapsa los saltos de línea en espacios, produciendo un solo párrafo. En Ansible usás "|" cuando necesitás scripts o contenido donde los saltos de línea importan.',
      },
      {
        question: 'En YAML, ¿cuál es el tipo de dato del valor en `habilitado: true`?',
        options: ['String "true"', 'Booleano verdadero', 'Número 1', 'Depende del contexto'],
        correctIndex: 1,
        explanation: 'En YAML, `true`, `false`, `yes`, `no`, `on` y `off` (sin comillas) son booleanos. Si querés el string "true", debés escribirlo entre comillas: `habilitado: "true"`. Ansible es sensible a esta distinción en parámetros de módulos.',
      },
    ],
    realWorldCase: 'En un equipo de infraestructura que gestiona cientos de servidores, todos los playbooks, inventarios y archivos de variables están escritos en YAML. Un error de indentación o un carácter especial sin comillas puede hacer fallar un despliegue entero — por eso se usa yamllint como parte del pipeline de CI/CD antes de ejecutar cualquier playbook en producción.',
    troubleshooting: [
      {
        error: 'yaml.scanner.ScannerError: mapping values are not allowed here',
        cause: 'Hay un ":" en un valor sin comillas, o indentación incorrecta cerca de ese punto.',
        fix: 'Envolvé el valor: mensaje: "Error: host no encontrado"  —  Validá con: yamllint playbook.yml',
      },
      {
        error: 'expected <block mapping start>, but found <scalar>',
        cause: 'Mezcla de tabs y espacios, o nivel de indentación incorrecto en esa línea.',
        fix: 'Configurá tu editor para usar 2 espacios (no tabs). Verificá tabs con: cat -A archivo.yml  (tabs aparecen como ^I)',
      },
      {
        error: 'ERROR! Syntax Error while loading YAML. found character that cannot start any token',
        cause: 'Un caracter especial (@, `, |, {) al inicio de un valor sin comillas, o un tab en lugar de espacios.',
        fix: 'ansible-playbook --syntax-check mi-playbook.yml  —  localiza la línea exacta del error.',
      },
    ],
  },
  {
    levelId: 0,
    moduleId: 4,
    title: 'Python — Fundamentos para Ansible',
    objective: 'Entender el rol de Python en Ansible: los módulos están escritos en Python, los hosts remotos necesitan Python, y los resultados son JSON.',
    duration: '2 horas',
    objectives: [
      'Reconocer los tipos de datos Python que corresponden a YAML y JSON',
      'Leer un traceback Python para diagnosticar fallos de módulos',
      'Entender el rol de Python en el control node y en los hosts remotos',
      'Usar filtros Jinja2 que se derivan de funciones Python',
    ],
    steps: [
      {
        title: 'Por qué Python es fundamental en Ansible',
        body: `
          <p>Ansible está escrito en Python. Más importante aún: cuando Ansible ejecuta un módulo en un host remoto, copia un archivo Python al host y lo ejecuta. Por esto, Python debe estar instalado en todos los hosts gestionados.</p>
          <div class="highlight-box">
            <p><strong>Requisito del host remoto:</strong> Python 3.x debe estar instalado. Si no está disponible, Ansible no puede ejecutar módulos. La única excepción son los módulos <code>raw</code> y <code>script</code>, que no requieren Python.</p>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">python-check.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Verificar Python en el host remoto
ansible all -m raw -a "which python3"

# Instalar Python si no está
ansible all -m raw -a "apt install -y python3" --become  # Debian/Ubuntu
ansible all -m raw -a "dnf install -y python3" --become  # RHEL/Fedora

# Especificar el intérprete Python en el inventario
# ansible_python_interpreter: /usr/bin/python3</code></pre>
          </div>
        `
      },
      {
        title: 'Variables y tipos de datos',
        body: `
          <p>Python tiene tipos de datos que mapean directamente a YAML y JSON — los formatos que Ansible usa constantemente.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">tipos.py</span></div>
            <pre class="language-python"><code class="language-python"># Strings — equivalen a strings YAML
nombre = "Ansible"
version = 'Red Hat'

# Enteros y flotantes — equivalen a números YAML
puerto = 80
timeout = 30.5

# Booleanos — True/False (mayúscula en Python, minúscula en YAML)
agentless = True       # en YAML sería: agentless: true
usa_ssh = True

# None — equivale a null en YAML
valor = None

# Listas — equivalen a listas YAML
paquetes = ["nginx", "postgresql", "python3"]
puertos = [80, 443, 8080]

# Diccionarios — equivalen a diccionarios YAML / objetos JSON
servidor = {
    "hostname": "web1.ejemplo.com",
    "ip": "192.168.1.10",
    "puerto": 80
}

# Acceder a valores del diccionario
print(servidor["hostname"])           # notación de corchetes
print(servidor.get("puerto", 80))     # .get() con valor por defecto</code></pre>
          </div>
        `
      },
      {
        title: 'JSON — el formato de respuesta de Ansible',
        body: `
          <p>Cuando un módulo de Ansible termina, devuelve un JSON con el resultado. Entender JSON es clave para entender las respuestas de Ansible y usar la directiva <code>register</code>.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">json-ejemplo.py</span></div>
            <pre class="language-python"><code class="language-python">import json

# Un módulo de Ansible devuelve algo similar a esto
resultado_modulo = {
    "changed": True,             # ¿cambió algo en el host?
    "failed": False,             # ¿falló la tarea?
    "msg": "Service nginx restarted",  # mensaje descriptivo
    "name": "nginx",
    "state": "started",
    "enabled": True
}

# Convertir a string JSON (lo que el módulo envía de vuelta)
json_string = json.dumps(resultado_modulo, indent=2)
print(json_string)

# Parsear JSON de vuelta a diccionario Python
parsed = json.loads(json_string)
print(parsed["changed"])         # True
print(parsed["msg"])             # "Service nginx restarted"</code></pre>
          </div>
          <p>En Ansible, cuando hacés <code>register: resultado</code>, podés acceder a estos campos:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">register-ejemplo.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">- name: Verificar si nginx está corriendo
  ansible.builtin.service:
    name: nginx
    state: started
  register: resultado_nginx          # guardar el JSON de respuesta

- name: Mostrar el resultado
  ansible.builtin.debug:
    msg: "Changed: {{ resultado_nginx.changed }}, Estado: {{ resultado_nginx.state }}"</code></pre>
          </div>
        `
      },
      {
        title: 'Funciones básicas de Python',
        body: `
          <p>No necesitás ser desarrollador Python para usar Ansible, pero entender la estructura básica de funciones te ayuda cuando lees el código fuente de los módulos.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">funciones.py</span></div>
            <pre class="language-python"><code class="language-python"># Función básica
def saludar(nombre):
    return f"Hola, {nombre}!"

resultado = saludar("Ansible")
print(resultado)                  # "Hola, Ansible!"

# Función con valor por defecto
def conectar(host, puerto=22, usuario="root"):
    return f"ssh {usuario}@{host}:{puerto}"

print(conectar("web1.ejemplo.com"))           # usa defaults
print(conectar("web1.ejemplo.com", 2222))     # puerto personalizado

# Así es como un módulo Ansible básico funciona
def ejecutar_modulo(params):
    """
    Los módulos de Ansible reciben un diccionario de parámetros
    y devuelven un diccionario con el resultado.
    """
    nombre_servicio = params.get("name", "")
    estado_deseado = params.get("state", "started")

    # lógica del módulo aquí...

    return {
        "changed": True,
        "failed": False,
        "msg": f"Service {nombre_servicio} is now {estado_deseado}"
    }</code></pre>
          </div>
        `
      },
      {
        title: 'Cómo los módulos de Ansible usan Python',
        body: `
          <p>Cada módulo de Ansible es un archivo Python. Cuando Ansible ejecuta una tarea, copia ese archivo al host remoto en <code>/tmp</code> y lo ejecuta.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">modulo-simplificado.py</span></div>
            <pre class="language-python"><code class="language-python">#!/usr/bin/python3
# Versión muy simplificada de cómo funciona un módulo Ansible

from ansible.module_utils.basic import AnsibleModule
import subprocess

def main():
    # Definir los parámetros que acepta el módulo
    module = AnsibleModule(
        argument_spec=dict(
            name=dict(type='str', required=True),    # parámetro obligatorio
            state=dict(type='str', default='present',
                      choices=['present', 'absent']), # solo estos valores
        ),
        supports_check_mode=True   # soporta --check de Ansible
    )

    nombre = module.params['name']
    estado = module.params['state']

    if module.check_mode:
        # En check mode, no hacemos cambios reales
        module.exit_json(changed=False, msg="Check mode")

    # Lógica real del módulo
    if estado == 'present':
        # instalar paquete...
        module.exit_json(changed=True, msg=f"{nombre} installed")
    else:
        # desinstalar...
        module.exit_json(changed=True, msg=f"{nombre} removed")

if __name__ == '__main__':
    main()</code></pre>
          </div>
        `
      },
      {
        title: 'Jinja2 y Python en plantillas',
        body: `
          <p>Ansible usa Jinja2 (un motor de templates Python) para las expresiones <code>{{ variable }}</code> en playbooks y templates. Entender que Jinja2 es Python te ayuda a usar filtros y expresiones avanzadas.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">jinja2-en-ansible.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">vars:
  paquetes: [nginx, postgresql, python3]
  nombre: "mi-servidor"
  version: 2

tasks:
  - name: Mostrar número de paquetes
    debug:
      msg: "Hay {{ paquetes | length }} paquetes"   # filtro Python: len()

  - name: Convertir a mayúsculas
    debug:
      msg: "{{ nombre | upper }}"                   # filtro: str.upper()

  - name: Cálculo
    debug:
      msg: "Versión doble: {{ version * 2 }}"       # expresión Python

  - name: Condicional
    debug:
      msg: "OK"
    when: paquetes | length > 0                      # condición Python</code></pre>
          </div>
        `
      },
      {
        title: 'Manejo de archivos en Python',
        body: `
          <p>Ansible gestiona archivos constantemente. Entender cómo Python lee y escribe archivos te ayuda a entender qué hacen módulos como <code>copy</code>, <code>template</code> y <code>lineinfile</code>.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">archivos.py</span></div>
            <pre class="language-python"><code class="language-python"># Leer un archivo
with open('/etc/nginx/nginx.conf', 'r') as f:
    contenido = f.read()
    lineas = f.readlines()

# Escribir un archivo (lo que hace el módulo copy de Ansible)
with open('/etc/nginx/nginx.conf', 'w') as f:
    f.write("server {\n    listen 80;\n}\n")

# Verificar si un archivo existe (módulo stat de Ansible)
import os
existe = os.path.exists('/etc/nginx/nginx.conf')

# Obtener información del archivo (módulo stat)
import stat
info = os.stat('/etc/nginx/nginx.conf')
permisos = oct(stat.S_IMODE(info.st_mode))  # '0o644'</code></pre>
          </div>
        `
      },
      {
        title: 'Relación Python → Ansible',
        body: `
          <p>Resumen de cómo Python aparece en el día a día con Ansible:</p>
          <table class="comparison-table">
            <tr><th>Contexto</th><th>Rol de Python</th></tr>
            <tr><td>Control Node</td><td>Ansible mismo está escrito en Python — necesitás Python 3.9+ para instalar Ansible</td></tr>
            <tr><td>Host Remoto</td><td>Python 3.x debe estar instalado — los módulos se ejecutan aquí</td></tr>
            <tr><td>Módulos</td><td>Archivos .py que se copian y ejecutan en los hosts remotos</td></tr>
            <tr><td>Jinja2</td><td>Motor de templates Python — evalúa todas las expresiones {{ }}</td></tr>
            <tr><td>Plugins</td><td>Extienden Ansible — también escritos en Python</td></tr>
            <tr><td>API de Ansible</td><td>Podés llamar Ansible programáticamente desde Python</td></tr>
          </table>
        `
      },
      {
        title: 'Diagnóstico con Python en Ansible',
        body: `
          <p>Cuando un módulo falla, Ansible muestra un traceback Python. Saber leer un traceback te ahorra horas de debugging.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">traceback.txt</span></div>
            <pre class="language-bash"><code class="language-bash">FAILED! => {
    "changed": false,
    "module_stderr": "Traceback (most recent call last):\n
      File \"/tmp/ansible-tmp-xxx/module.py\", line 42, in main\n
        import boto3\n
    ModuleNotFoundError: No module named 'boto3'",
    "msg": "MODULE FAILURE"
}

# Interpretación:
# 1. El módulo es /tmp/ansible-tmp-xxx/module.py
# 2. Falló en la línea 42 al importar boto3
# 3. boto3 no está instalado en el host remoto
# Solución: instalar boto3 con pip3 install boto3</code></pre>
          </div>
        `
      },
      {
        title: 'Resumen',
        body: `
          <div class="highlight-box">
            <p>Python es el lenguaje que hace funcionar Ansible. No necesitás ser programador Python experto, pero entender tipos, funciones, JSON y cómo leer un traceback es suficiente para usar Ansible profesionalmente.</p>
          </div>
          <div class="challenge-box">
            <div class="challenge-title">🎯 Desafío</div>
            <div class="challenge-body">Escribí un script Python que lea un archivo JSON, modifique un valor, y lo escriba de vuelta. Luego mirá el código fuente del módulo <code>ansible.builtin.copy</code> en GitHub — encontrá dónde lee el archivo origen y dónde lo escribe en el destino.</div>
          </div>
        `
      }
    ],
    prerequisites: [
      'Haber completado el módulo de Linux (Módulo 1 del Nivel 0)',
      'Haber completado el módulo de Redes (Módulo 2 del Nivel 0)',
      'Haber completado el módulo de YAML (Módulo 3 del Nivel 0)',
      'Python 3.x instalado en tu máquina local',
    ],
    quiz: [
      {
        question: '¿Por qué los hosts remotos necesitan Python instalado para que Ansible funcione?',
        options: [
          'Para ejecutar el proceso de SSH en el host remoto',
          'Porque Ansible copia y ejecuta módulos Python directamente en cada host',
          'Para procesar las plantillas Jinja2 en el host remoto',
          'Python no es necesario si usás Ansible en modo agentless',
        ],
        correctIndex: 1,
        explanation: 'Ansible copia cada módulo (un archivo .py) al directorio /tmp del host remoto y lo ejecuta usando el intérprete Python local. Sin Python 3.x en el host, los módulos no pueden correr. La única excepción son los módulos "raw" y "script" que usan SSH puro sin Python.',
      },
      {
        question: 'En un traceback de Ansible como "ModuleNotFoundError: No module named boto3", ¿qué indica este error?',
        options: [
          'Boto3 no está instalado en el control node',
          'El módulo boto3 de Ansible no existe en esa versión',
          'Boto3 no está instalado en el host remoto donde se ejecutó el módulo',
          'El nombre del módulo en el playbook está mal escrito',
        ],
        correctIndex: 2,
        explanation: 'El traceback se genera en el host remoto, donde el módulo Python de Ansible intentó importar boto3 y no lo encontró. La solución es instalar boto3 en el host remoto con "pip3 install boto3", no en el control node.',
      },
      {
        question: '¿Qué relación tienen los filtros Jinja2 de Ansible (como `| length` o `| upper`) con Python?',
        options: [
          'Son funciones propias de Ansible sin relación con Python',
          'Son equivalentes a métodos y funciones nativas de Python (len(), str.upper())',
          'Son funciones de JavaScript transpiladas para Ansible',
          'No tienen relación — Jinja2 es un sistema separado de Python',
        ],
        correctIndex: 1,
        explanation: 'Jinja2 es un motor de templates escrito en Python que Ansible usa para evaluar expresiones {{ }}. Los filtros como `| length` mapean directamente a `len()` de Python, y `| upper` a `str.upper()`. Entender Python te permite usar filtros Jinja2 con mayor confianza y creatividad.',
      },
    ],
    realWorldCase: 'En empresas que usan Ansible para provisionar infraestructura en AWS, el módulo amazon.aws.ec2_instance está escrito en Python y requiere la librería boto3 en los hosts que lo ejecutan. Los equipos de platform engineering gestionan las versiones de Python y sus dependencias como parte del proceso de bootstrap de cada nuevo servidor — antes de poder usar Ansible con él.',
    troubleshooting: [
      {
        error: '/usr/bin/python3: No such file or directory',
        cause: 'Python 3 no está instalado en el host remoto, o el intérprete está en una ruta diferente a la que Ansible detectó automáticamente.',
        fix: 'Instalá Python con el módulo raw: `ansible all -m raw -a "apt install -y python3"`. Luego especificá la ruta correcta en el inventario con: `ansible_python_interpreter: /usr/bin/python3.11`',
      },
      {
        error: 'ModuleNotFoundError: No module named \'MODULE_NAME\'',
        cause: 'El módulo Python requerido por la tarea (boto3, psycopg2, paramiko, etc.) no está instalado en el host remoto donde Ansible ejecuta el módulo.',
        fix: 'Instalá la dependencia en el host remoto antes de usarla: `ansible all -m pip -a "name=boto3 state=present"`. Para módulos de colecciones cloud, revisá los requirements de la colección en su documentación oficial.',
      },
      {
        error: 'INTERPRETER_PYTHON_FALLBACK: /usr/bin/python3 is not being used — using /usr/bin/python instead',
        cause: 'Ansible está usando Python 2 como intérprete porque `ansible_python_interpreter` no está configurado y Python 3 no es el default del sistema.',
        fix: 'Forzá Python 3 en el inventario o group_vars: `ansible_python_interpreter: /usr/bin/python3`. Para toda la flota, configuralo en `group_vars/all.yml`. Ansible 2.12+ usa Python 3 por default, pero sistemas antiguos pueden tener Python 2 como fallback.',
      },
    ],
  }
];
