import type { ModuleContent } from '../types';

export const nivel22Mod1: ModuleContent =   {
levelId: 22,
moduleId: 1,
title: 'Hardening de Linux con Ansible',
objective:
  'Aplicar endurecimiento de seguridad a servidores Linux de manera automatizada, reproducible y auditable usando Ansible, siguiendo los benchmarks CIS y mejores prácticas de la industria.',
duration: '5–6 horas',
objectives: [
  'Comprender por qué el hardening automatizado es superior al manual en entornos de producción',
  'Configurar SSH de forma segura bloqueando vectores de ataque comunes',
  'Gestionar firewalls (UFW y firewalld) y fail2ban desde playbooks Ansible',
  'Aplicar parámetros de kernel con sysctl para reducir la superficie de ataque de red',
],
prerequisites: [
  'Completar todos los niveles 0–21 del curso',
  'Entender roles y colecciones de Ansible Galaxy (Nivel 14)',
  'Conocer el módulo ansible.builtin.template (Nivel 8)',
],
steps: [
  {
    title: '¿Por qué hardening automatizado?',
    body: `
      <p>El hardening manual es lento, inconsistente y olvidado. Cuando configurás un servidor a mano, el siguiente servidor no queda idéntico. Con el tiempo, la <strong>configuration drift</strong> (deriva de configuración) convierte tu infraestructura en un campo minado de inconsistencias.</p>
      <div class="highlight-box">
        <p><strong>CIS Benchmarks</strong> son guías de seguridad publicadas por el Center for Internet Security, usadas por auditores de seguridad, organismos gubernamentales y empresas Fortune 500. Cubren más de 100 controles para Linux, SSH, kernels y más.</p>
      </div>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>El hardening manual es como revisar si apagaste el gas en cada departamento de un edificio. El hardening con Ansible es instalar detectores de gas conectados a un panel central — una vez configurado, todos los departamentos están protegidos automáticamente y el estado es auditable.</p>
      </div>
      <p>Los tres pilares del hardening automatizado con Ansible:</p>
      <ul>
        <li><strong>Consistencia:</strong> todos los servidores tienen exactamente la misma configuración de seguridad</li>
        <li><strong>Trazabilidad:</strong> cada cambio queda en Git, asociado a un commit, autor y fecha</li>
        <li><strong>Reversibilidad:</strong> un playbook de rollback puede deshacer cualquier cambio en minutos</li>
      </ul>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Dato real:</strong> el 85% de los brechas de seguridad en infraestructura on-premise son causadas por configuraciones incorrectas o inconsistentes, no por exploits de día cero. El hardening automatizado ataca el problema raíz.</div>
      </div>
    `,
  },
  {
    title: 'Hardening SSH',
    body: `
      <p>SSH es la puerta principal a tus servidores. Una configuración insegura es equivalente a dejar la llave bajo el felpudo. Estos son los parámetros críticos para endurecer <code>/etc/ssh/sshd_config</code>:</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/hardening/tasks/ssh.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Configurar parámetros seguros de SSH
  ansible.builtin.lineinfile:
path: /etc/ssh/sshd_config
regexp: "{{ item.regexp }}"
line: "{{ item.line }}"
state: present
backup: true
  loop:
- { regexp: '^#?PermitRootLogin', line: 'PermitRootLogin no' }
- { regexp: '^#?PasswordAuthentication', line: 'PasswordAuthentication no' }
- { regexp: '^#?MaxAuthTries', line: 'MaxAuthTries 3' }
- { regexp: '^#?PubkeyAuthentication', line: 'PubkeyAuthentication yes' }
- { regexp: '^#?X11Forwarding', line: 'X11Forwarding no' }
- { regexp: '^#?AllowTcpForwarding', line: 'AllowTcpForwarding no' }
- { regexp: '^#?ClientAliveInterval', line: 'ClientAliveInterval 300' }
- { regexp: '^#?ClientAliveCountMax', line: 'ClientAliveCountMax 2' }
- { regexp: '^#?LoginGraceTime', line: 'LoginGraceTime 30' }
- { regexp: '^#?Protocol', line: 'Protocol 2' }
  notify: Reiniciar sshd

- name: Restringir acceso SSH a usuarios autorizados
  ansible.builtin.lineinfile:
path: /etc/ssh/sshd_config
regexp: '^#?AllowUsers'
line: "AllowUsers {{ ssh_allowed_users | join(' ') }}"
state: present
  notify: Reiniciar sshd

- name: Verificar que sshd_config es válido antes de reiniciar
  ansible.builtin.command: sshd -t
  changed_when: false</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Regla crítica:</strong> Nunca reiniciés sshd sin tener otra sesión SSH activa o acceso por consola. Si la nueva configuración tiene un error, podés quedar bloqueado fuera del servidor. El paso <code>sshd -t</code> valida la sintaxis antes de reiniciar.</div>
      </div>
      <p>En <code>group_vars/all.yml</code> definís los usuarios permitidos:</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">group_vars/all.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">ssh_allowed_users:
  - deploy
  - ansible_svc
  - juan.garcia</code></pre>
      </div>
    `,
  },
  {
    title: 'Gestión de firewall: UFW y firewalld',
    body: `
      <p>Ansible puede gestionar ambos firewalls principales de Linux. La clave es detectar la distribución y usar el módulo correcto. Nunca mezclés UFW y firewalld en el mismo host.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/hardening/tasks/firewall.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# === UFW para Debian/Ubuntu ===
- name: Instalar UFW
  ansible.builtin.apt:
name: ufw
state: present
  when: ansible_os_family == 'Debian'

- name: Política por defecto: denegar entrada, permitir salida
  community.general.ufw:
direction: "{{ item.direction }}"
policy: "{{ item.policy }}"
  loop:
- { direction: incoming, policy: deny }
- { direction: outgoing, policy: allow }
  when: ansible_os_family == 'Debian'

- name: Permitir servicios necesarios (Debian/Ubuntu)
  community.general.ufw:
rule: allow
port: "{{ item.port }}"
proto: "{{ item.proto }}"
comment: "{{ item.comment }}"
  loop:
- { port: '22', proto: tcp, comment: 'SSH' }
- { port: '80', proto: tcp, comment: 'HTTP' }
- { port: '443', proto: tcp, comment: 'HTTPS' }
  when: ansible_os_family == 'Debian'

- name: Habilitar UFW
  community.general.ufw:
state: enabled
  when: ansible_os_family == 'Debian'

# === firewalld para RHEL/CentOS ===
- name: Instalar firewalld
  ansible.builtin.dnf:
name: firewalld
state: present
  when: ansible_os_family == 'RedHat'

- name: Habilitar y arrancar firewalld
  ansible.builtin.service:
name: firewalld
state: started
enabled: true
  when: ansible_os_family == 'RedHat'

- name: Configurar servicios permitidos (RHEL/CentOS)
  ansible.posix.firewalld:
service: "{{ item }}"
permanent: true
state: enabled
immediate: true
  loop:
- ssh
- http
- https
  when: ansible_os_family == 'RedHat'</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Best practice:</strong> Usá la variable <code>ansible_os_family</code> para hacer tu playbook portable. <code>Debian</code> cubre Ubuntu, Debian y sus derivados. <code>RedHat</code> cubre RHEL, CentOS, Rocky Linux, AlmaLinux y Fedora.</div>
      </div>
    `,
  },
  {
    title: 'fail2ban: protección contra fuerza bruta',
    body: `
      <p>fail2ban monitorea logs del sistema y bloquea IPs que generan demasiados intentos fallidos de autenticación. Es la primera línea de defensa contra ataques de fuerza bruta SSH.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/hardening/tasks/fail2ban.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Instalar fail2ban
  ansible.builtin.package:
name: fail2ban
state: present

- name: Configurar jail local (sobreescribe defaults)
  ansible.builtin.template:
src: jail.local.j2
dest: /etc/fail2ban/jail.local
owner: root
group: root
mode: '0644'
  notify: Reiniciar fail2ban

- name: Habilitar y arrancar fail2ban
  ansible.builtin.service:
name: fail2ban
state: started
enabled: true</code></pre>
      </div>
      <p>La plantilla Jinja2 para la configuración de fail2ban:</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">roles/hardening/templates/jail.local.j2</span></div>
        <pre class="language-ini"><code class="language-ini">[DEFAULT]
# Tiempo de baneo en segundos (1 hora)
bantime  = 3600
# Ventana de tiempo para contar intentos (10 minutos)
findtime = 600
# Máximo de intentos antes de banear
maxretry = {{ fail2ban_maxretry | default(5) }}
# Backend para monitorear logs (auto-detecta systemd)
backend  = auto

[sshd]
enabled  = true
port     = {{ ssh_port | default(22) }}
filter   = sshd
logpath  = %(sshd_log)s
maxretry = {{ fail2ban_ssh_maxretry | default(3) }}</code></pre>
      </div>
      <div class="highlight-box">
        <p><strong>Verificar IPs baneadas:</strong> podés ver las IPs baneadas en tiempo real con <code>ansible all -m command -a "fail2ban-client status sshd" -b</code></p>
      </div>
    `,
  },
  {
    title: 'Kernel security: parámetros sysctl',
    body: `
      <p>El kernel Linux expone cientos de parámetros de seguridad y red a través de <code>sysctl</code>. Algunos de ellos son críticos para prevenir ataques de red comunes: SYN floods, IP spoofing y redirecciones ICMP maliciosas.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/hardening/tasks/sysctl.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Aplicar parámetros sysctl de seguridad
  ansible.posix.sysctl:
name: "{{ item.name }}"
value: "{{ item.value }}"
state: present
reload: true
sysctl_file: /etc/sysctl.d/99-hardening.conf
  loop:
# Protección contra SYN flood
- { name: net.ipv4.tcp_syncookies, value: '1' }
- { name: net.ipv4.tcp_max_syn_backlog, value: '2048' }
# Deshabilitar IP forwarding (no es un router)
- { name: net.ipv4.ip_forward, value: '0' }
- { name: net.ipv6.conf.all.forwarding, value: '0' }
# Protección contra IP spoofing
- { name: net.ipv4.conf.all.rp_filter, value: '1' }
- { name: net.ipv4.conf.default.rp_filter, value: '1' }
# Ignorar redirecciones ICMP
- { name: net.ipv4.conf.all.accept_redirects, value: '0' }
- { name: net.ipv6.conf.all.accept_redirects, value: '0' }
- { name: net.ipv4.conf.all.send_redirects, value: '0' }
# Ignorar broadcasts ICMP (amplification attacks)
- { name: net.ipv4.icmp_echo_ignore_broadcasts, value: '1' }
# Protección contra mensajes ICMP maliciosos
- { name: net.ipv4.icmp_ignore_bogus_error_responses, value: '1' }
# Log de paquetes con rutas imposibles
- { name: net.ipv4.conf.all.log_martians, value: '1' }</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Nota importante:</strong> Si el servidor es un router o usa Docker/Kubernetes, <strong>no</strong> deshabilités <code>ip_forward</code>. Docker necesita este parámetro habilitado para el routing entre contenedores. Usá variables de grupo para diferenciar roles de servidor.</div>
      </div>
    `,
  },
  {
    title: 'Colección devsec.hardening de Galaxy',
    body: `
      <p>No necesitás escribir todo desde cero. La colección <code>devsec.hardening</code> de Ansible Galaxy implementa los benchmarks CIS completos y es mantenida activamente por la comunidad de seguridad.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">requirements.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
collections:
  - name: devsec.hardening
version: ">=8.0.0"</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalación</span></div>
        <pre class="language-bash"><code class="language-bash">ansible-galaxy collection install -r requirements.yml</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">hardening.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Hardening CIS completo
  hosts: production
  become: true
  vars:
# Variables del rol SSH
ssh_permit_root_login: 'no'
ssh_password_authentication: 'no'
ssh_max_auth_tries: 3
# Variables del rol OS
os_auth_pam_passwdqc_enable: true
os_security_suid_sgid_enforce: true
# Usuarios a excluir del hardening de sudo
sudo_include_run_sudo: false
  roles:
- devsec.hardening.ssh_hardening
- devsec.hardening.os_hardening</code></pre>
      </div>
      <div class="lab-box">
        <div class="lab-box-header">🧪 Laboratorio: Hardening con rollback</div>
        <p><strong>Objetivo:</strong> aplicar hardening y probar que funciona el rollback.</p>
        <ol>
          <li>Creá un snapshot del servidor antes: <code>ansible all -m setup -a "filter=ansible_hostname" -o</code></li>
          <li>Aplicá el hardening playbook en modo check primero: <code>ansible-playbook hardening.yml --check --diff</code></li>
          <li>Aplicá los cambios reales: <code>ansible-playbook hardening.yml</code></li>
          <li>Verificá SSH desde otra terminal antes de cerrar la sesión actual</li>
          <li>Creá un playbook <code>rollback.yml</code> que restaure <code>sshd_config</code> desde el backup creado por lineinfile (<code>.bak</code>)</li>
        </ol>
      </div>
      <div class="challenge-box">
        <div class="challenge-box-header">🏆 Desafío extra</div>
        <p>Agregá una tarea al final que ejecute <code>lynis audit system</code> (si está instalado) y guarde el reporte en <code>/var/log/lynis-audit-{{ ansible_date_time.date }}.log</code>. Lynis es la herramienta de auditoría de seguridad más usada en Linux.</p>
      </div>
    `,
  },
],
quiz: [
  {
    question: '¿Cuál es el riesgo de reiniciar sshd inmediatamente después de cambiar sshd_config sin validar?',
    options: [
      'No hay riesgo, sshd siempre valida la config antes de reiniciar',
      'Podés quedar bloqueado fuera del servidor si la config tiene errores de sintaxis',
      'El servicio se reinicia pero ignora la nueva configuración',
      'Solo afecta a nuevas conexiones, las sesiones activas continúan normalmente',
    ],
    correctIndex: 1,
    explanation:
      'Si sshd_config tiene errores de sintaxis, el servicio no podrá arrancar después del reinicio. Las sesiones SSH activas pueden cerrarse y no podrás conectarte nuevamente. Por eso siempre se ejecuta `sshd -t` para validar la sintaxis antes de reiniciar, y se mantiene una sesión SSH abierta como respaldo durante el proceso.',
  },
  {
    question: '¿Qué parámetro sysctl previene los ataques SYN flood?',
    options: [
      'net.ipv4.ip_forward = 1',
      'net.ipv4.conf.all.rp_filter = 1',
      'net.ipv4.tcp_syncookies = 1',
      'net.ipv4.icmp_echo_ignore_broadcasts = 1',
    ],
    correctIndex: 2,
    explanation:
      'tcp_syncookies habilita los "SYN cookies", un mecanismo que permite al servidor validar conexiones TCP sin mantener estado durante el three-way handshake. Esto evita que un atacante llene la tabla de conexiones semí-abiertas con paquetes SYN falsos. rp_filter protege contra IP spoofing, e ip_forward es para routing.',
  },
  {
    question: '¿Cuál es la ventaja principal de usar `devsec.hardening` de Galaxy en lugar de escribir tu propio rol de hardening?',
    options: [
      'Es más rápido de ejecutar porque usa módulos compilados',
      'Implementa benchmarks CIS completos y es mantenido activamente por la comunidad de seguridad',
      'No requiere privilegios de root para ejecutarse',
      'Es compatible únicamente con Ubuntu LTS, que es el más seguro',
    ],
    correctIndex: 1,
    explanation:
      'devsec.hardening implementa los benchmarks CIS (Center for Internet Security) completos, que son el estándar de la industria para hardening de Linux. Está mantenido activamente, tiene tests automatizados y cubre cientos de controles de seguridad que serían difíciles de implementar y mantener de forma individual.',
  },
],
realWorldCase:
  'Una empresa fintech con 200 servidores necesitaba pasar una auditoría PCI-DSS en 6 semanas. En lugar de contratar consultores externos para hardening manual (estimado: 3 meses), usaron Ansible con devsec.hardening para aplicar los controles CIS en todos los servidores en 2 días, con evidencia de cumplimiento generada automáticamente desde los logs de Ansible. Pasaron la auditoría.',
troubleshooting: [
  {
    error: 'UNREACHABLE: Failed to connect to the host via ssh: Permission denied (publickey)',
    cause:
      'El hardening deshabilitó PasswordAuthentication antes de copiar las claves SSH a los hosts, o AllowUsers no incluye el usuario de Ansible.',
    fix: 'Verificá que el usuario de Ansible esté en ssh_allowed_users. Ejecutá primero el playbook de distribución de claves SSH antes del hardening. Si quedaste bloqueado, usá la consola del proveedor cloud (EC2 Instance Connect, Azure Serial Console) para restaurar /etc/ssh/sshd_config desde el backup .bak.',
  },
  {
    error: 'Tarea sysctl falla con "sysctl: setting key net.ipv4.ip_forward: Read-only file system"',
    cause:
      'El servidor corre dentro de un contenedor (Docker, LXC) donde el namespace de red es read-only y no permite modificar parámetros del kernel del host.',
    fix: 'Usá `when: ansible_virtualization_type not in ["docker", "lxc"]` para saltear tareas sysctl en contenedores. Los parámetros de kernel en contenedores se configuran desde el host, no desde dentro del contenedor.',
  },
  {
    error: 'UFW bloquea el propio Ansible después de habilitarse (conexiones SSH caen)',
    cause:
      'La regla para SSH (puerto 22) no se agregó antes de ejecutar `ufw: state: enabled`, o el puerto SSH fue cambiado y la regla no refleja el nuevo puerto.',
    fix: 'Siempre agregá la regla de SSH antes de habilitar UFW en el playbook. Usá la variable `ssh_port` para definir el puerto en un solo lugar. Verificá el orden de las tareas: primero reglas, después `state: enabled`. En producción, considerá usar `--check` antes de aplicar cambios de firewall.',
  },
],
  };
