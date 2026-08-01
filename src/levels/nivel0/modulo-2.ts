import type { ModuleContent } from '../types';

export const nivel0Mod2: ModuleContent = {
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
};
