import type { ModuleContent } from './types';

export const nivel22Modules: ModuleContent[] = [
  {
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
  },

  {
    levelId: 22,
    moduleId: 2,
    title: 'Gestión de Certificados TLS con Ansible',
    objective:
      'Automatizar el ciclo de vida completo de certificados TLS — emisión, renovación y despliegue — usando Ansible, tanto con Let\'s Encrypt para dominios públicos como con OpenSSL para servicios internos.',
    duration: '4–5 horas',
    objectives: [
      'Emitir certificados Let\'s Encrypt con certbot de manera automatizada para múltiples dominios',
      'Configurar renovación automática de certificados antes de su vencimiento',
      'Generar y desplegar certificados auto-firmados para servicios internos con OpenSSL',
      'Monitorear fechas de vencimiento de certificados usando Ansible facts y assertions',
    ],
    prerequisites: [
      'Completar el Módulo 1 de Nivel 22 (Hardening de Linux)',
      'Conocer el módulo ansible.builtin.cron (Nivel 10)',
      'Entender handlers en Ansible (Nivel 7)',
    ],
    steps: [
      {
        title: '¿Por qué gestionar TLS con Ansible?',
        body: `
          <p>Un certificado TLS vencido es una de las causas más frecuentes de incidentes en producción. La mayoría de los equipos tienen entre 10 y 200 certificados distribuidos en múltiples servidores, y sin automatización, alguno inevitablemente vence en el peor momento posible.</p>
          <div class="highlight-box">
            <p><strong>Estadística real:</strong> El 60% de las organizaciones reportan al menos un incidente de producción causado por un certificado TLS vencido, según el Ponemon Institute. El costo promedio de un incidente por certificado vencido es de $15,000 USD en tiempo de ingenieros y pérdida de servicio.</p>
          </div>
          <div class="analogy-box">
            <div class="analogy-box-header">💡 Analogía</div>
            <p>Gestionar certificados TLS manualmente es como renovar el pasaporte de cada empleado de tu empresa a mano, uno por uno, recordando cada fecha de vencimiento en tu cabeza. Con Ansible es como tener un sistema de RRHH que avisa con 60 días de anticipación y puede iniciar el trámite solo.</p>
          </div>
          <p>Las ventajas concretas del enfoque con Ansible:</p>
          <ul>
            <li><strong>Renovación proactiva:</strong> certifica antes de que venza, no cuando ya venció</li>
            <li><strong>Multi-host:</strong> un playbook puede renovar y desplegar en 50 servidores simultáneamente</li>
            <li><strong>Consistencia:</strong> configuración idéntica de cipher suites y protocolos en todos los servidores</li>
            <li><strong>Auditoría:</strong> historial completo de qué certificado se instaló en qué servidor y cuándo</li>
          </ul>
        `,
      },
      {
        title: "Let's Encrypt con certbot: emisión inicial",
        body: `
          <p>Let's Encrypt ofrece certificados TLS gratuitos con validez de 90 días. Certbot es el cliente oficial para emitirlos y renovarlos automáticamente.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/tls/tasks/letsencrypt.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Instalar certbot (Ubuntu/Debian)
  ansible.builtin.apt:
    name:
      - certbot
      - python3-certbot-nginx
    state: present
    update_cache: true
  when: ansible_os_family == 'Debian'

- name: Instalar certbot (RHEL/CentOS via snapd)
  block:
    - ansible.builtin.dnf:
        name: snapd
        state: present
    - ansible.builtin.command: snap install --classic certbot
      args:
        creates: /usr/bin/certbot
    - ansible.builtin.file:
        src: /snap/bin/certbot
        dest: /usr/bin/certbot
        state: link
  when: ansible_os_family == 'RedHat'

- name: Emitir certificado para dominio simple
  ansible.builtin.command: >
    certbot certonly
    --nginx
    --non-interactive
    --agree-tos
    --email {{ letsencrypt_email }}
    --domains {{ item }}
    --deploy-hook "systemctl reload nginx"
  args:
    creates: "/etc/letsencrypt/live/{{ item }}/fullchain.pem"
  loop: "{{ tls_domains }}"
  when: not tls_wildcard | default(false)

- name: Emitir certificado wildcard (requiere DNS challenge)
  ansible.builtin.command: >
    certbot certonly
    --dns-cloudflare
    --dns-cloudflare-credentials /root/.cloudflare.ini
    --non-interactive
    --agree-tos
    --email {{ letsencrypt_email }}
    --domains "*.{{ tls_base_domain }},{{ tls_base_domain }}"
  args:
    creates: "/etc/letsencrypt/live/{{ tls_base_domain }}/fullchain.pem"
  when: tls_wildcard | default(false)</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Wildcard vs. single domain:</strong> Los certificados wildcard (<code>*.dominio.com</code>) cubren todos los subdominios pero requieren un DNS challenge (no puedes usarlos con el método HTTP). Para dominios simples, el método --nginx o --apache es más simple y no requiere acceso a tu DNS.</div>
          </div>
        `,
      },
      {
        title: 'Renovación automática con cron',
        body: `
          <p>Los certificados de Let's Encrypt vencen cada 90 días. Certbot recomienda intentar la renovación cada 12 horas — solo renueva si el certificado tiene menos de 30 días de vida restante.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/tls/tasks/renewal.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Configurar cron para renovación automática de certificados
  ansible.builtin.cron:
    name: "Renovación automática Let's Encrypt"
    minute: "0"
    hour: "3,15"
    job: "/usr/bin/certbot renew --quiet --deploy-hook 'systemctl reload nginx'"
    user: root
    state: present

- name: Verificar que la renovación funciona (dry-run)
  ansible.builtin.command: certbot renew --dry-run
  register: certbot_dryrun
  changed_when: false
  failed_when: certbot_dryrun.rc != 0

- name: Mostrar resultado del dry-run
  ansible.builtin.debug:
    msg: "{{ certbot_dryrun.stdout_lines }}"</code></pre>
          </div>
          <div class="highlight-box">
            <p><strong>¿Por qué 2 veces al día?</strong> Let's Encrypt puede tener outages temporales. Verificar a las 3:00 y 15:00 aumenta la probabilidad de que al menos uno de los intentos tenga éxito. El flag <code>--quiet</code> suprime la salida para que cron no envíe emails innecesarios.</p>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/tls/tasks/renewal.yml (continuación)</span></div>
            <pre class="language-yaml"><code class="language-yaml"># Hook post-renovación personalizado
- name: Crear script de post-renovación
  ansible.builtin.template:
    src: post-renewal.sh.j2
    dest: /etc/letsencrypt/renewal-hooks/deploy/10-reload-services.sh
    mode: '0755'</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">roles/tls/templates/post-renewal.sh.j2</span></div>
            <pre class="language-bash"><code class="language-bash">#!/bin/bash
# Ejecutado por certbot después de cada renovación exitosa
{% for service in tls_reload_services | default(['nginx']) %}
systemctl reload {{ service }} && echo "$(date): {{ service }} recargado después de renovación TLS" >> /var/log/certbot-deploy.log
{% endfor %}</code></pre>
          </div>
        `,
      },
      {
        title: 'Certificados auto-firmados para servicios internos',
        body: `
          <p>Para servicios internos (APIs internas, servicios de monitoreo, bases de datos) que no son accesibles desde Internet, los certificados auto-firmados son la solución correcta. No necesitás una CA pública para cifrar tráfico interno.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/tls/tasks/self_signed.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Crear directorio para certificados internos
  ansible.builtin.file:
    path: /etc/ssl/internal
    state: directory
    owner: root
    group: root
    mode: '0755'

- name: Generar clave privada RSA 4096-bit
  community.crypto.openssl_privatekey:
    path: /etc/ssl/internal/{{ tls_service_name }}.key
    size: 4096
    type: RSA
    mode: '0600'

- name: Generar Certificate Signing Request (CSR)
  community.crypto.openssl_csr:
    path: /etc/ssl/internal/{{ tls_service_name }}.csr
    privatekey_path: /etc/ssl/internal/{{ tls_service_name }}.key
    common_name: "{{ tls_service_name }}.{{ internal_domain }}"
    organization_name: "{{ org_name }}"
    country_name: "{{ org_country | default('AR') }}"
    subject_alt_name:
      - "DNS:{{ tls_service_name }}.{{ internal_domain }}"
      - "DNS:localhost"
      - "IP:{{ ansible_default_ipv4.address }}"

- name: Generar certificado auto-firmado (validez 825 días)
  community.crypto.x509_certificate:
    path: /etc/ssl/internal/{{ tls_service_name }}.crt
    privatekey_path: /etc/ssl/internal/{{ tls_service_name }}.key
    csr_path: /etc/ssl/internal/{{ tls_service_name }}.csr
    provider: selfsigned
    selfsigned_not_after: "+825d"
    mode: '0644'</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Subject Alternative Names (SAN):</strong> Los navegadores modernos y clientes TLS rechazan certificados sin SAN, incluso si el CN es correcto. Siempre incluí SAN con el nombre DNS y la IP del servicio. El módulo <code>community.crypto.openssl_csr</code> lo hace fácil.</div>
          </div>
        `,
      },
      {
        title: 'Despliegue a nginx/apache con handlers',
        body: `
          <p>Instalar el certificado es solo la mitad del trabajo. El servidor web necesita recargarse para usar el nuevo certificado, y esto debe hacerse de manera graceful para no interrumpir conexiones activas.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/tls/tasks/deploy.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Configurar bloque SSL en nginx
  ansible.builtin.template:
    src: nginx-ssl.conf.j2
    dest: /etc/nginx/sites-available/{{ vhost_name }}-ssl.conf
    validate: nginx -t -c /dev/stdin < %s
  notify: Recargar nginx

- name: Habilitar sitio SSL
  ansible.builtin.file:
    src: /etc/nginx/sites-available/{{ vhost_name }}-ssl.conf
    dest: /etc/nginx/sites-enabled/{{ vhost_name }}-ssl.conf
    state: link
  notify: Recargar nginx</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">nginx</span><span class="code-block-filename">roles/tls/templates/nginx-ssl.conf.j2</span></div>
            <pre class="language-nginx"><code class="language-nginx">server {
    listen 443 ssl http2;
    server_name {{ vhost_name }};

    ssl_certificate     /etc/letsencrypt/live/{{ vhost_name }}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/{{ vhost_name }}/privkey.pem;

    # Configuración TLS moderna (Mozilla Intermediate compatibility)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # HSTS (186 días)
    add_header Strict-Transport-Security "max-age=15768000; includeSubDomains" always;

    root {{ webroot }};
    index index.html;
}

# Redirect HTTP a HTTPS
server {
    listen 80;
    server_name {{ vhost_name }};
    return 301 https://$host$request_uri;
}</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/tls/handlers/main.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Recargar nginx
  ansible.builtin.service:
    name: nginx
    state: reloaded  # reload, no restart — no interrumpe conexiones activas</code></pre>
          </div>
        `,
      },
      {
        title: 'Monitoreo de vencimiento con Ansible facts',
        body: `
          <p>El último eslabón de la cadena: saber cuándo van a vencer tus certificados <em>antes</em> de que venza. Ansible puede leer los metadatos del certificado y generar alertas proactivas.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbooks/check-tls-expiry.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Verificar vencimiento de certificados TLS
  hosts: webservers
  gather_facts: false
  tasks:
    - name: Leer información del certificado
      community.crypto.x509_certificate_info:
        path: /etc/letsencrypt/live/{{ item }}/fullchain.pem
      register: cert_info
      loop: "{{ tls_domains }}"

    - name: Calcular días hasta vencimiento
      ansible.builtin.set_fact:
        cert_expiry_days: >-
          {{
            (
              (cert_info.results[0].not_after | to_datetime('%Y%m%d%H%M%SZ')) -
              (ansible_date_time.iso8601 | to_datetime('%Y-%m-%dT%H:%M:%SZ'))
            ).days
          }}

    - name: Alertar si el certificado vence en menos de 30 días
      ansible.builtin.assert:
        that:
          - cert_expiry_days | int > 30
        fail_msg: >
          ⚠️ ALERTA: El certificado para {{ inventory_hostname }}
          vence en {{ cert_expiry_days }} días.
          Ejecutá: certbot renew --force-renewal
        success_msg: >
          ✅ Certificado OK: vence en {{ cert_expiry_days }} días.

    - name: Enviar alerta a Slack si queda poco tiempo
      community.general.slack:
        token: "{{ slack_token }}"
        channel: "#ops-alerts"
        msg: "🔴 Certificado TLS en {{ inventory_hostname }} vence en {{ cert_expiry_days }} días"
      when: cert_expiry_days | int < 30
      delegate_to: localhost</code></pre>
          </div>
          <div class="lab-box">
            <div class="lab-box-header">🧪 Laboratorio: Pipeline TLS completo</div>
            <p>Creá un rol <code>tls_manager</code> que encadene todos los pasos: instalación de certbot → emisión → cron de renovación → despliegue a nginx → verificación de vencimiento. Ejecutalo contra un servidor de staging y verificá que nginx sirve HTTPS con el certificado correcto usando <code>openssl s_client -connect dominio:443</code>.</p>
          </div>
        `,
      },
    ],
    quiz: [
      {
        question: '¿Por qué se usa `state: reloaded` en lugar de `state: restarted` para nginx después de instalar un certificado?',
        options: [
          'Porque reloaded es más rápido que restarted',
          'Porque reloaded aplica la nueva configuración sin cerrar las conexiones TCP activas',
          'Porque restarted no funciona con certificados TLS',
          'Porque reloaded valida la sintaxis de nginx antes de aplicar cambios',
        ],
        correctIndex: 1,
        explanation:
          'nginx reload (SIGHUP) recarga la configuración sin cerrar el proceso master ni las conexiones existentes. Los workers actuales terminan de servir sus requests en curso, mientras nuevos workers con la nueva configuración atienden las nuevas conexiones. Un restart cierra todo y abre de nuevo, causando una interrupción del servicio de varios segundos.',
      },
      {
        question: '¿Qué challenge debe usarse para emitir un certificado wildcard (*.dominio.com) con Let\'s Encrypt?',
        options: [
          'HTTP-01 challenge (acceso por puerto 80)',
          'TLS-ALPN-01 challenge (acceso por puerto 443)',
          'DNS-01 challenge (crear registro TXT en el DNS)',
          'Email challenge (verificación por correo)',
        ],
        correctIndex: 2,
        explanation:
          "Let's Encrypt solo permite emitir certificados wildcard usando el DNS-01 challenge. Esto requiere que crees un registro TXT en tu DNS (ej: _acme-challenge.dominio.com). Los challenges HTTP-01 y TLS-ALPN-01 no están disponibles para wildcards porque no pueden probar control sobre todos los subdominios.",
      },
      {
        question: '¿Cuál es el propósito de incluir Subject Alternative Names (SAN) en un certificado auto-firmado interno?',
        options: [
          'Para hacer el certificado más seguro con criptografía adicional',
          'Para que el certificado pueda ser firmado por múltiples CAs',
          'Porque los clientes TLS modernos rechazan certificados sin SAN, incluso si el CN es correcto',
          'Para reducir el tiempo de validación del certificado',
        ],
        correctIndex: 2,
        explanation:
          'Desde Chrome 58 (2017) y otros navegadores/clientes modernos, el campo Common Name (CN) es ignorado para la validación del hostname. Solo se usan los Subject Alternative Names. Si tu certificado no tiene SAN, recibirás un error de "nombre no coincide" aunque el CN sea correcto. El módulo community.crypto.openssl_csr facilita agregar SANs.',
      },
    ],
    realWorldCase:
      'Un banco regional con 47 certificados TLS distribuidos en servicios internos y externos sufrió un incidente de 4 horas cuando vencieron 3 certificados el mismo día. Implementaron Ansible para gestionar todo el ciclo de vida TLS: el playbook de monitoreo corre diariamente y envía alertas a Slack con 60 días de anticipación. En 18 meses sin el sistema, tuvieron 3 incidentes. En los 18 meses siguientes con Ansible, tuvieron cero.',
    troubleshooting: [
      {
        error: 'certbot: error: Problem binding to port 80: Could not bind to IPv4 or IPv6',
        cause:
          'nginx (u otro servicio) ya está usando el puerto 80 cuando certbot intenta levantar su propio servidor temporal para el HTTP-01 challenge con el método --standalone.',
        fix: 'Usá `--nginx` o `--apache` en lugar de `--standalone`. Estos plugins aprovechan el servidor web existente para responder el challenge sin ocupar el puerto. Si necesitás standalone, primero parás nginx con un pre-hook: `certbot certonly --standalone --pre-hook "systemctl stop nginx" --post-hook "systemctl start nginx"`.',
      },
      {
        error: 'community.crypto.x509_certificate falla: "privatekey_path not found"',
        cause:
          'Las tareas de generación de clave y CSR no corrieron antes de la tarea del certificado, o la clave se generó en un directorio diferente al esperado.',
        fix: 'Verificá el orden de las tareas en el rol: primero openssl_privatekey, luego openssl_csr, finalmente x509_certificate. Asegurate de que todos usen el mismo path para la clave privada. Usá `ansible.builtin.stat` para verificar que el archivo de clave existe antes de intentar crear el CSR.',
      },
      {
        error: 'nginx -t falla con "SSL_CTX_use_PrivateKey_file failed" después de renovación',
        cause:
          'Los permisos del archivo de clave privada no permiten que nginx los lea, o el deploy-hook de certbot no se ejecutó correctamente y nginx todavía referencia el certificado anterior.',
        fix: 'Verificá que /etc/letsencrypt/live/ y /etc/letsencrypt/archive/ sean legibles por el usuario con el que corre nginx (normalmente www-data o nginx). Añadí el usuario al grupo de letsencrypt: `usermod -aG ssl-cert www-data`. Verificá los logs de certbot en /var/log/letsencrypt/letsencrypt.log para confirmar que el deploy-hook se ejecutó.',
      },
    ],
  },

  {
    levelId: 22,
    moduleId: 3,
    title: 'Integración con DevOps y Pipelines CI/CD',
    objective:
      'Integrar Ansible en flujos de trabajo DevOps modernos: GitOps, pipelines CI/CD, despliegue de herramientas de observabilidad y automatización de runbooks operacionales.',
    duration: '5–6 horas',
    objectives: [
      'Posicionar Ansible correctamente dentro del ciclo DevOps (dónde sí y dónde no usarlo)',
      'Implementar GitOps con Ansible: cambios de infraestructura mediante Pull Requests',
      'Integrar playbooks en pipelines de GitHub Actions y GitLab CI',
      'Automatizar notificaciones a Slack/Teams y runbooks operacionales',
    ],
    prerequisites: [
      'Completar el Módulo 2 de Nivel 22 (Gestión de Certificados TLS)',
      'Conocer Ansible Vault para secretos (Nivel 16)',
      'Entender roles y colecciones (Nivel 14)',
    ],
    steps: [
      {
        title: 'Ansible en el bucle DevOps: ¿dónde encaja?',
        body: `
          <p>DevOps no es una herramienta — es una cultura y un conjunto de prácticas. Ansible es una de las piezas del puzzle, pero no todas las piezas. Entender dónde encaja evita el error de usarlo para todo.</p>
          <div class="highlight-box">
            <p><strong>Ansible brilla en:</strong> provisioning de servidores, gestión de configuración, despliegue de aplicaciones a servidores, tareas operacionales (backups, rotación de logs, parches). <strong>No es la herramienta ideal para:</strong> orquestación de contenedores (Kubernetes hace eso mejor), pipelines de build (Jenkins/GitHub Actions), o gestión de estado de infraestructura compleja (Terraform).</p>
          </div>
          <p>El bucle DevOps típico con Ansible integrado:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">text</span><span class="code-block-filename">devops-loop.txt</span></div>
            <pre class="language-text"><code class="language-text">┌─────────────────────────────────────────────────────────┐
│                    BUCLE DEVOPS                          │
│                                                         │
│  Plan → Code → Build → Test → Release → Deploy → Operate│
│                                    ↑            ↑       │
│                              Terraform      ANSIBLE     │
│                              (infra)     (config+app)   │
└─────────────────────────────────────────────────────────┘</code></pre>
          </div>
          <div class="analogy-box">
            <div class="analogy-box-header">💡 Analogía</div>
            <p>Terraform construye el edificio (servidores, redes, base de datos en la nube). Ansible lo amuebla y mantiene (configuración, software, actualizaciones). Docker/Kubernetes gestiona los residentes (contenedores). Son complementarios, no sustitutos.</p>
          </div>
        `,
      },
      {
        title: 'GitOps con Ansible: infraestructura como Pull Requests',
        body: `
          <p>GitOps aplica los principios de desarrollo de software (revisión de código, pull requests, CI/CD) a la gestión de infraestructura. Con Ansible y GitOps, ningún cambio de infraestructura sucede sin pasar por Git.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">text</span><span class="code-block-filename">gitops-flow.txt</span></div>
            <pre class="language-text"><code class="language-text">Ingeniero → PR en GitHub → Review del equipo → Merge a main
                                                      ↓
                                           GitHub Actions trigger
                                                      ↓
                                    ansible-playbook en pipeline CI/CD
                                                      ↓
                                           Cambio aplicado en producción
                                                      ↓
                                           Notificación a Slack</code></pre>
          </div>
          <p>Estructura de repositorio GitOps recomendada:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">text</span><span class="code-block-filename">estructura-gitops.txt</span></div>
            <pre class="language-text"><code class="language-text">infrastructure/
├── inventories/
│   ├── production/
│   │   ├── hosts.yml
│   │   └── group_vars/
│   └── staging/
│       ├── hosts.yml
│       └── group_vars/
├── roles/
│   ├── webserver/
│   ├── database/
│   └── monitoring/
├── playbooks/
│   ├── deploy-app.yml
│   ├── configure-servers.yml
│   └── maintenance.yml
├── .github/
│   └── workflows/
│       ├── lint.yml          ← ansible-lint en PR
│       └── deploy.yml        ← ansible-playbook en merge
└── ansible.cfg</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Protección de rama main:</strong> Configurá branch protection rules en GitHub para requerir al menos un reviewer y que el CI (ansible-lint) pase antes de poder hacer merge. Esto garantiza que ningún playbook con errores de sintaxis o estilo llegue a producción.</div>
          </div>
        `,
      },
      {
        title: 'Despliegue de Prometheus y node_exporter',
        body: `
          <p>Prometheus es el estándar de facto para monitoreo de infraestructura. node_exporter expone métricas del sistema operativo que Prometheus recolecta. Ansible puede desplegar ambos de manera idempotente.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/node_exporter/tasks/main.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Crear usuario para node_exporter (sin shell)
  ansible.builtin.user:
    name: node_exporter
    system: true
    shell: /sbin/nologin
    create_home: false

- name: Descargar node_exporter
  ansible.builtin.get_url:
    url: "https://github.com/prometheus/node_exporter/releases/download/v{{ node_exporter_version }}/node_exporter-{{ node_exporter_version }}.linux-amd64.tar.gz"
    dest: /tmp/node_exporter.tar.gz
    checksum: "sha256:{{ node_exporter_checksum }}"

- name: Extraer node_exporter
  ansible.builtin.unarchive:
    src: /tmp/node_exporter.tar.gz
    dest: /tmp/
    remote_src: true

- name: Instalar binario de node_exporter
  ansible.builtin.copy:
    src: "/tmp/node_exporter-{{ node_exporter_version }}.linux-amd64/node_exporter"
    dest: /usr/local/bin/node_exporter
    owner: node_exporter
    group: node_exporter
    mode: '0755'
    remote_src: true
  notify: Reiniciar node_exporter

- name: Crear servicio systemd para node_exporter
  ansible.builtin.template:
    src: node_exporter.service.j2
    dest: /etc/systemd/system/node_exporter.service
  notify:
    - Recargar systemd
    - Reiniciar node_exporter

- name: Habilitar y arrancar node_exporter
  ansible.builtin.service:
    name: node_exporter
    state: started
    enabled: true</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">roles/node_exporter/templates/node_exporter.service.j2</span></div>
            <pre class="language-ini"><code class="language-ini">[Unit]
Description=Prometheus Node Exporter
After=network.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter \
  --web.listen-address=:{{ node_exporter_port | default(9100) }} \
  --collector.systemd \
  --collector.processes

[Install]
WantedBy=multi-user.target</code></pre>
          </div>
        `,
      },
      {
        title: 'Notificaciones a Slack desde Ansible',
        body: `
          <p>Ansible puede enviar notificaciones a Slack durante la ejecución de playbooks. Esto convierte tus deploys en eventos visibles para todo el equipo, sin necesidad de que nadie mire los logs.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbooks/deploy-app.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Desplegar aplicación con notificaciones
  hosts: webservers
  vars:
    app_version: "{{ lookup('env', 'APP_VERSION') }}"
    deployer: "{{ lookup('env', 'GITHUB_ACTOR') | default('manual') }}"
  tasks:
    - name: Notificar inicio de deploy a Slack
      community.general.slack:
        token: "{{ slack_token }}"
        channel: "#deployments"
        color: "warning"
        msg: |
          🚀 *Deploy iniciado*
          • Versión: \`{{ app_version }}\`
          • Ambiente: \`{{ inventory_hostname }}\`
          • Iniciado por: \`{{ deployer }}\`
        attachments:
          - title: "Detalles"
            text: "El deploy está en curso. Próxima actualización en ~5 minutos."
      delegate_to: localhost
      run_once: true

    - name: Desplegar la aplicación
      # ... tareas de deploy ...

    - name: Verificar health check
      ansible.builtin.uri:
        url: "http://{{ ansible_host }}/health"
        status_code: 200
      register: health_check
      retries: 5
      delay: 10
      until: health_check.status == 200

    - name: Notificar éxito a Slack
      community.general.slack:
        token: "{{ slack_token }}"
        channel: "#deployments"
        color: "good"
        msg: |
          ✅ *Deploy completado exitosamente*
          • Versión: \`{{ app_version }}\`
          • Tiempo total: \`{{ ansible_play_duration | default('N/A') }}\`
      delegate_to: localhost
      run_once: true

  rescue:
    - name: Notificar fallo a Slack
      community.general.slack:
        token: "{{ slack_token }}"
        channel: "#deployments"
        color: "danger"
        msg: |
          🔴 *Deploy FALLIDO*
          • Versión: \`{{ app_version }}\`
          • Tarea fallida: \`{{ ansible_failed_task.name }}\`
          • Error: \`{{ ansible_failed_result.msg }}\`
      delegate_to: localhost
      run_once: true</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Secretos en CI/CD:</strong> el <code>slack_token</code> nunca debe estar en el repositorio. Guardalo en GitHub Secrets (o GitLab CI Variables) y referencialos en el pipeline como variables de entorno. En el playbook, usás <code>lookup('env', 'SLACK_TOKEN')</code> o lo pasás como extra-var encriptada con Vault.</div>
          </div>
        `,
      },
      {
        title: 'Triggers desde GitHub Actions y GitLab CI',
        body: `
          <p>La integración real de Ansible con CI/CD significa que tu pipeline dispara los playbooks automáticamente cuando hay un merge a main. Sin intervención humana, sin "acordarse de correr el playbook".</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/deploy.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">name: Deploy con Ansible

on:
  push:
    branches: [main]
    paths:
      - 'playbooks/**'
      - 'roles/**'
      - 'inventories/**'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Instalar ansible-lint
        run: pip install ansible-lint
      - name: Ejecutar lint
        run: ansible-lint playbooks/

  deploy:
    needs: lint
    runs-on: ubuntu-latest
    environment: production  # requiere aprovación manual en GitHub
    steps:
      - uses: actions/checkout@v4

      - name: Instalar Ansible
        run: |
          pip install ansible
          ansible-galaxy collection install -r requirements.yml

      - name: Configurar clave SSH
        run: |
          mkdir -p ~/.ssh
          echo "${'$'}{{ secrets.ANSIBLE_SSH_KEY }}" > ~/.ssh/ansible
          chmod 600 ~/.ssh/ansible

      - name: Crear archivo de vault password
        run: echo "${'$'}{{ secrets.ANSIBLE_VAULT_PASSWORD }}" > /tmp/.vault_pass

      - name: Ejecutar playbook de deploy
        run: |
          ansible-playbook \
            -i inventories/production/ \
            --private-key ~/.ssh/ansible \
            --vault-password-file /tmp/.vault_pass \
            -e "app_version=${'$'}{{ github.sha }}" \
            playbooks/deploy-app.yml

      - name: Limpiar secretos
        if: always()
        run: |
          rm -f ~/.ssh/ansible /tmp/.vault_pass</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>paths filter:</strong> El trigger <code>paths</code> evita que el deploy se dispare cuando solo cambia documentación o el README. Solo hace deploy cuando cambian archivos relevantes de Ansible. Ahorrás tiempo de pipeline y reduces el riesgo de deploys accidentales.</div>
          </div>
        `,
      },
      {
        title: 'Runbook automation: procedimientos manuales → playbooks',
        body: `
          <p>Un runbook es un documento que describe cómo responder a un incidente o hacer un procedimiento operacional. La mayoría de los equipos tienen runbooks en Confluence o Notion que nadie sigue exactamente. Ansible convierte esos runbooks en código ejecutable y reproducible.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbooks/runbook-db-backup.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
# Runbook: Backup de base de datos antes de deploy mayor
# Equivalente manual: 45 minutos. Con Ansible: 8 minutos.
- name: "[RUNBOOK] Backup pre-deploy de PostgreSQL"
  hosts: databases
  become: true
  vars:
    backup_dir: /var/backups/postgresql
    backup_date: "{{ ansible_date_time.date }}-{{ ansible_date_time.hour }}{{ ansible_date_time.minute }}"
  tasks:
    - name: Verificar espacio disponible en disco
      ansible.builtin.assert:
        that:
          - (ansible_mounts | selectattr('mount', 'equalto', '/var') | list | first).size_available > 10737418240
        fail_msg: "ABORTAR: Menos de 10GB disponibles en /var. Liberar espacio antes de continuar."

    - name: Crear directorio de backup
      ansible.builtin.file:
        path: "{{ backup_dir }}/{{ backup_date }}"
        state: directory
        owner: postgres
        mode: '0700'

    - name: Ejecutar pg_dump para cada base de datos
      ansible.builtin.command: >
        pg_dump
        --format=custom
        --compress=9
        --file={{ backup_dir }}/{{ backup_date }}/{{ item }}.dump
        {{ item }}
      become_user: postgres
      loop: "{{ postgresql_databases }}"
      register: backup_result

    - name: Verificar integridad de backups
      ansible.builtin.command: >
        pg_restore --list {{ backup_dir }}/{{ backup_date }}/{{ item }}.dump
      become_user: postgres
      loop: "{{ postgresql_databases }}"
      changed_when: false

    - name: Registrar backup en inventario de backups
      ansible.builtin.lineinfile:
        path: /var/log/backup-inventory.log
        line: "{{ backup_date }} | {{ inventory_hostname }} | {{ postgresql_databases | join(',') }} | OK"
        create: true</code></pre>
          </div>
          <div class="challenge-box">
            <div class="challenge-box-header">🏆 Desafío: Convertir tu runbook</div>
            <p>Tomá el procedimiento más repetitivo de tu equipo (rotación de logs, limpieza de sesiones, restart de servicios en orden) y convertilo en un playbook Ansible. Medí el tiempo manual vs. el tiempo automatizado y documentá el ahorro en el README del playbook.</p>
          </div>
        `,
      },
    ],
    quiz: [
      {
        question: '¿Cuál es el propósito del filtro `paths` en el trigger de GitHub Actions?',
        options: [
          'Limitar el deploy a ciertos servidores del inventario',
          'Evitar que el pipeline se dispare cuando solo cambian archivos irrelevantes (docs, README)',
          'Filtrar los hosts de Ansible por directorio',
          'Restringir qué usuarios pueden hacer push al repositorio',
        ],
        correctIndex: 1,
        explanation:
          'El filtro `paths` en GitHub Actions hace que el workflow solo se dispare cuando cambian archivos en los paths especificados. Sin este filtro, un cambio en el README dispararía un deploy completo, desperdiciando tiempo de pipeline y creando riesgo innecesario. Con el filtro, solo los cambios en playbooks, roles e inventarios disparan el deploy.',
      },
      {
        question: '¿Por qué se usa `delegate_to: localhost` y `run_once: true` en las notificaciones de Slack?',
        options: [
          'Porque Slack solo acepta conexiones desde localhost',
          'Para que Ansible se conecte a Slack directamente desde el nodo controlador, no desde cada host remoto',
          'Para que la notificación use el inventario local en lugar del remoto',
          'Porque el módulo community.general.slack no funciona en hosts remotos',
        ],
        correctIndex: 1,
        explanation:
          'delegate_to: localhost hace que la tarea se ejecute en el nodo controlador (tu máquina o el runner de CI) en lugar de en cada host remoto. run_once: true asegura que la notificación se envíe solo una vez, no una vez por cada host del inventario. Sin estos modificadores, recibirías una notificación de Slack por cada servidor en el playbook.',
      },
      {
        question: '¿Qué ventaja principal tiene convertir un runbook manual en un playbook Ansible?',
        options: [
          'Los playbooks son más fáciles de leer que los documentos en Confluence',
          'Ansible ejecuta más rápido que un humano siguiendo instrucciones',
          'El procedimiento se vuelve reproducible, auditable y no puede ser ejecutado incorrectamente por error humano',
          'Los playbooks se pueden ejecutar sin acceso SSH al servidor',
        ],
        correctIndex: 2,
        explanation:
          'La ventaja principal no es la velocidad sino la reproducibilidad y eliminación del error humano. Un runbook manual puede seguirse incorrectamente, saltarse pasos o interpretarse diferente por cada persona. Un playbook Ansible siempre ejecuta exactamente los mismos pasos en el mismo orden, con la misma configuración, y genera un log completo de lo que hizo y cuándo.',
      },
    ],
    realWorldCase:
      'Un equipo de SRE en una startup de e-commerce tenía 47 runbooks documentados en Confluence. Cada incidente requería seguirlos manualmente, lo que tomaba entre 20 y 90 minutos. Convirtieron los 12 más frecuentes en playbooks Ansible disparados desde Slack con un bot (usando slash commands). El tiempo de respuesta a incidentes bajó de 45 minutos promedio a 8 minutos, y los errores de procedimiento desaparecieron completamente.',
    troubleshooting: [
      {
        error: 'community.general.slack falla con "token invalid" aunque el token es correcto',
        cause:
          'El token de Slack cambió de formato: las versiones modernas usan tokens de Bot (xoxb-) mientras que los tokens legacy de Webhook tienen formato diferente. La colección community.general espera el formato correcto según la versión.',
        fix: 'Verificá el tipo de token: para Slack Apps modernas usá un Bot User OAuth Token (xoxb-). Para webhooks entrantes simples, usá el módulo community.general.slack con el parámetro `webhook` en lugar de `token`. Actualizá la colección: `ansible-galaxy collection install community.general --upgrade`.',
      },
      {
        error: 'GitHub Actions falla con "WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED" durante ansible-playbook',
        cause:
          'La clave SSH del host remoto cambió (típicamente después de recrear un servidor) y el archivo known_hosts en el runner de GitHub Actions tiene la clave anterior.',
        fix: 'Agregá `-o StrictHostKeyChecking=no` como variable de entorno ANSIBLE_SSH_EXTRA_ARGS en el workflow, o mejor: regenerá el known_hosts del runner después de recrear servidores. Para producción, usá `ansible_ssh_extra_args: "-o StrictHostKeyChecking=accept-new"` en el inventario, que acepta nuevas claves pero rechaza cambios sospechosos.',
      },
      {
        error: 'El playbook de CI/CD falla con "Vault password required" aunque se configuró --vault-password-file',
        cause:
          'El archivo de vault password se creó con un salto de línea al final (el comportamiento por defecto de echo en bash), o el path al archivo tiene espacios o caracteres especiales.',
        fix: 'Usá `printf` en lugar de `echo` para evitar el salto de línea: `printf "%s" "${{ secrets.ANSIBLE_VAULT_PASSWORD }}" > /tmp/.vault_pass`. Verificá que el path no tenga espacios. Alternativa: pasá la contraseña directamente con `--vault-password-file <(echo -n "$VAULT_PASS")` usando process substitution.',
      },
    ],
  },

  {
    levelId: 22,
    moduleId: 4,
    title: 'Observabilidad y Logging con Ansible',
    objective:
      'Desplegar y configurar un stack completo de observabilidad (métricas, logs, alertas) usando Ansible, incluyendo Prometheus, Grafana, Loki y Alertmanager, con integración de callback plugins para métricas de los propios playbooks.',
    duration: '5–6 horas',
    objectives: [
      'Desplegar el stack Prometheus completo (prometheus, node_exporter, alertmanager) con Ansible',
      'Instalar y configurar Grafana con dashboards provisionados automáticamente',
      'Implementar logging centralizado con Loki y Promtail mediante Ansible',
      'Configurar reglas de alerting en Alertmanager usando templates Jinja2',
    ],
    prerequisites: [
      'Completar el Módulo 3 de Nivel 22 (Integración con DevOps)',
      'Conocer ansible.builtin.template y Jinja2 avanzado (Nivel 8)',
      'Entender el módulo ansible.builtin.uri para health checks',
    ],
    steps: [
      {
        title: '¿Por qué observabilidad como código?',
        body: `
          <p>Observabilidad significa poder responder la pregunta "¿qué está pasando en mi sistema?" sin necesidad de adivinar. Los tres pilares son: <strong>métricas</strong> (números que cambian en el tiempo), <strong>logs</strong> (eventos con contexto) y <strong>trazas</strong> (recorrido de un request a través del sistema).</p>
          <div class="highlight-box">
            <p><strong>El problema sin Ansible:</strong> configurás Grafana a mano, creás dashboards, definís reglas de alerting. Un mes después alguien modifica una regla "para probar" y no la restaura. Tres meses después el servidor de monitoreo falla y nadie recuerda cómo estaba configurado. Con Ansible, toda esa configuración vive en Git.</p>
          </div>
          <div class="analogy-box">
            <div class="analogy-box-header">💡 Analogía</div>
            <p>La observabilidad manual es como intentar diagnosticar una enfermedad mirando al paciente sin instrumentos. Observabilidad como código con Ansible es como tener un hospital completamente instrumentado que se auto-configura: cada sala tiene los monitores correctos, las alarmas correctas y todos los médicos saben interpretarlos porque el sistema fue diseñado consistentemente.</p>
          </div>
          <p>Ventajas concretas de gestionar observabilidad con Ansible:</p>
          <ul>
            <li><strong>Recuperación rápida:</strong> si el servidor de monitoreo falla, lo reconstruís en 10 minutos</li>
            <li><strong>Consistencia:</strong> todos los ambientes (staging, producción) tienen el mismo stack de monitoreo</li>
            <li><strong>Revisión de cambios:</strong> las modificaciones a alertas pasan por code review como cualquier otro cambio</li>
            <li><strong>Documentación implícita:</strong> el playbook es la documentación de cómo está configurado el sistema</li>
          </ul>
        `,
      },
      {
        title: 'Despliegue del stack Prometheus',
        body: `
          <p>Prometheus es el motor de métricas. Scraping periódico de endpoints /metrics, almacenamiento local en time-series, PromQL para consultas. Ansible puede desplegarlo con configuración dinámica generada desde el inventario.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/prometheus/tasks/main.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Crear usuario prometheus
  ansible.builtin.user:
    name: prometheus
    system: true
    shell: /sbin/nologin
    home: /var/lib/prometheus
    create_home: false

- name: Crear directorios de prometheus
  ansible.builtin.file:
    path: "{{ item }}"
    state: directory
    owner: prometheus
    group: prometheus
    mode: '0755'
  loop:
    - /etc/prometheus
    - /var/lib/prometheus
    - /etc/prometheus/rules.d
    - /etc/prometheus/targets.d

- name: Descargar y extraer prometheus
  ansible.builtin.unarchive:
    src: "https://github.com/prometheus/prometheus/releases/download/v{{ prometheus_version }}/prometheus-{{ prometheus_version }}.linux-amd64.tar.gz"
    dest: /tmp/
    remote_src: true

- name: Instalar binarios de prometheus
  ansible.builtin.copy:
    src: "/tmp/prometheus-{{ prometheus_version }}.linux-amd64/{{ item }}"
    dest: "/usr/local/bin/{{ item }}"
    owner: prometheus
    group: prometheus
    mode: '0755'
    remote_src: true
  loop:
    - prometheus
    - promtool
  notify: Reiniciar prometheus

- name: Generar prometheus.yml desde inventario
  ansible.builtin.template:
    src: prometheus.yml.j2
    dest: /etc/prometheus/prometheus.yml
    owner: prometheus
    group: prometheus
    mode: '0644'
    validate: /usr/local/bin/promtool check config %s
  notify: Reiniciar prometheus

- name: Crear servicio systemd
  ansible.builtin.template:
    src: prometheus.service.j2
    dest: /etc/systemd/system/prometheus.service
  notify:
    - Recargar systemd
    - Reiniciar prometheus

- name: Habilitar y arrancar prometheus
  ansible.builtin.service:
    name: prometheus
    state: started
    enabled: true</code></pre>
          </div>
          <p>La plantilla de configuración genera targets dinámicamente desde el inventario:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/prometheus/templates/prometheus.yml.j2</span></div>
            <pre class="language-yaml"><code class="language-yaml">global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']

rule_files:
  - "rules.d/*.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node'
    static_configs:
{% for host in groups['all'] %}
      - targets: ['{{ hostvars[host]['ansible_host'] }}:9100']
        labels:
          instance: '{{ host }}'
          environment: '{{ hostvars[host]['env'] | default("production") }}'
{% endfor %}</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>validate:</strong> El parámetro <code>validate</code> en el módulo template ejecuta <code>promtool check config</code> sobre el archivo generado antes de copiarlo al destino. Si la configuración tiene errores, la tarea falla sin afectar el archivo actual en producción. Esto es un pattern de seguridad importante para archivos de configuración críticos.</div>
          </div>
        `,
      },
      {
        title: 'Despliegue de Grafana con dashboards provisionados',
        body: `
          <p>Grafana tiene una característica de "provisioning" que permite definir datasources y dashboards como archivos YAML y JSON en disco. Ansible despliega esos archivos y Grafana los carga automáticamente — sin necesidad de configurar nada a mano en la UI.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/grafana/tasks/main.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Agregar repositorio de Grafana
  ansible.builtin.deb822_repository:
    name: grafana
    types: deb
    uris: https://apt.grafana.com
    suites: stable
    components: main
    signed_by: https://apt.grafana.com/gpg.key
    state: present
  when: ansible_os_family == 'Debian'

- name: Instalar Grafana
  ansible.builtin.apt:
    name: grafana
    state: present
    update_cache: true
  when: ansible_os_family == 'Debian'

- name: Configurar Grafana (grafana.ini)
  ansible.builtin.template:
    src: grafana.ini.j2
    dest: /etc/grafana/grafana.ini
    owner: grafana
    group: grafana
    mode: '0640'
  notify: Reiniciar grafana

- name: Crear directorio de provisioning
  ansible.builtin.file:
    path: "{{ item }}"
    state: directory
    owner: grafana
    group: grafana
    mode: '0755'
  loop:
    - /etc/grafana/provisioning/datasources
    - /etc/grafana/provisioning/dashboards
    - /var/lib/grafana/dashboards

- name: Configurar datasource de Prometheus
  ansible.builtin.template:
    src: prometheus-datasource.yml.j2
    dest: /etc/grafana/provisioning/datasources/prometheus.yml
    owner: grafana
    group: grafana
    mode: '0640'
  notify: Reiniciar grafana

- name: Copiar dashboards JSON a Grafana
  ansible.builtin.copy:
    src: "{{ item }}"
    dest: "/var/lib/grafana/dashboards/{{ item | basename }}"
    owner: grafana
    group: grafana
    mode: '0644'
  with_fileglob:
    - "{{ role_path }}/files/dashboards/*.json"
  notify: Reiniciar grafana

- name: Configurar dashboard provider
  ansible.builtin.template:
    src: dashboard-provider.yml.j2
    dest: /etc/grafana/provisioning/dashboards/provider.yml
    owner: grafana
    group: grafana
    mode: '0640'
  notify: Reiniciar grafana</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/grafana/templates/dashboard-provider.yml.j2</span></div>
            <pre class="language-yaml"><code class="language-yaml">apiVersion: 1
providers:
  - name: ansible-managed
    folder: Infrastructure
    type: file
    disableDeletion: true   # Grafana no puede borrar dashboards gestionados por Ansible
    updateIntervalSeconds: 30
    options:
      path: /var/lib/grafana/dashboards</code></pre>
          </div>
        `,
      },
      {
        title: 'Logging centralizado con Loki y Promtail',
        body: `
          <p>Loki es el sistema de logging de Grafana Labs, diseñado para ser el "Prometheus de los logs". No indexa el contenido de los logs (solo las etiquetas), lo que lo hace extremadamente eficiente en almacenamiento. Promtail es el agente que recolecta logs y los envía a Loki.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/promtail/tasks/main.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Descargar Promtail
  ansible.builtin.get_url:
    url: "https://github.com/grafana/loki/releases/download/v{{ loki_version }}/promtail-linux-amd64.zip"
    dest: /tmp/promtail.zip
    checksum: "sha256:{{ promtail_checksum }}"

- name: Instalar unzip
  ansible.builtin.package:
    name: unzip
    state: present

- name: Extraer e instalar Promtail
  ansible.builtin.unarchive:
    src: /tmp/promtail.zip
    dest: /usr/local/bin/
    remote_src: true
    mode: '0755'

- name: Crear usuario promtail
  ansible.builtin.user:
    name: promtail
    system: true
    shell: /sbin/nologin
    groups:
      - systemd-journal
      - adm

- name: Configurar Promtail
  ansible.builtin.template:
    src: promtail-config.yml.j2
    dest: /etc/promtail/config.yml
    owner: promtail
    group: promtail
    mode: '0640'
  notify: Reiniciar promtail</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/promtail/templates/promtail-config.yml.j2</span></div>
            <pre class="language-yaml"><code class="language-yaml">server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://{{ loki_server }}:3100/loki/api/v1/push

scrape_configs:
  - job_name: system
    static_configs:
      - targets:
          - localhost
        labels:
          job: system-logs
          host: {{ inventory_hostname }}
          environment: {{ env | default('production') }}
          __path__: /var/log/syslog

  - job_name: nginx
    static_configs:
      - targets:
          - localhost
        labels:
          job: nginx-access
          host: {{ inventory_hostname }}
          __path__: /var/log/nginx/access.log
    pipeline_stages:
      - regex:
          expression: '^(?P<remote_addr>\S+) - (?P<remote_user>\S+) \[(?P<time_local>[^\]]+)\] "(?P<method>\S+) (?P<path>\S+) \S+" (?P<status>\d+) (?P<body_bytes_sent>\d+)'
      - labels:
          method:
          status:</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Eficiencia de Loki:</strong> a diferencia de Elasticsearch que indexa cada palabra de cada log, Loki solo indexa las etiquetas (labels). Esto reduce el almacenamiento necesario entre 10x y 100x. La búsqueda en Loki usa LogQL, un lenguaje similar a PromQL.</div>
          </div>
        `,
      },
      {
        title: 'Ansible callback plugins para métricas de playbooks',
        body: `
          <p>Ansible tiene plugins de callback que se ejecutan durante y después de los playbooks. Dos de los más útiles vienen incluidos: <code>timer</code> (tiempo total) y <code>profile_tasks</code> (tiempo por tarea).</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
            <pre class="language-ini"><code class="language-ini">[defaults]
# Habilitar múltiples plugins de callback
callbacks_enabled = timer, profile_tasks, ansible.posix.json

# El callback json genera salida estructurada (útil para CI/CD)
stdout_callback = yaml

[callback_profile_tasks]
# Mostrar las 20 tareas más lentas al final
task_output_limit = 20
sort_order = descending</code></pre>
          </div>
          <p>Con <code>profile_tasks</code> habilitado, al final de cada playbook ves algo así:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">text</span><span class="code-block-filename">salida profile_tasks</span></div>
            <pre class="language-text"><code class="language-text">Saturday 31 July 2026 03:00:00 +0000 (0:00:10.456)  0:02:34.891 ****
===============================================================================
Instalar paquetes del sistema -------------- 45.23s
Descargar Prometheus ----------------------- 32.11s
Configurar nginx --------------------------- 8.54s
Generar certificado TLS -------------------- 6.23s
Verificar health checks -------------------- 5.89s
...
Playbook run took 0 days, 0 hours, 2 minutes, 34 seconds</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/monitoring/tasks/ansible_metrics.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
# Exportar métricas de Ansible a un archivo que Prometheus puede scraping
- name: Registrar métricas de ejecución de playbook
  ansible.builtin.copy:
    content: |
      # HELP ansible_play_duration_seconds Duración del último playbook en segundos
      # TYPE ansible_play_duration_seconds gauge
      ansible_play_duration_seconds{play="{{ ansible_play_name }}", host="{{ inventory_hostname }}"} {{ ansible_play_duration | default(0) }}
      # HELP ansible_play_changed_tasks Total de tareas que realizaron cambios
      # TYPE ansible_play_changed_tasks counter
      ansible_play_changed_tasks{play="{{ ansible_play_name }}", host="{{ inventory_hostname }}"} {{ ansible_stats.changed | default(0) }}
    dest: /var/lib/node_exporter/textfile_collector/ansible_metrics.prom
    mode: '0644'
  delegate_to: "{{ inventory_hostname }}"</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>Textfile collector:</strong> node_exporter tiene un textfile collector que puede scraping archivos .prom en un directorio. Esto permite que cualquier script o playbook exporte métricas custom a Prometheus sin necesidad de un exporter dedicado.</div>
          </div>
        `,
      },
      {
        title: 'Alerting: reglas de Alertmanager con Ansible',
        body: `
          <p>Alertmanager recibe alertas de Prometheus y las enruta a los canales correctos (email, Slack, PagerDuty). Ansible puede gestionar tanto las reglas de alerta de Prometheus como la configuración de rutas de Alertmanager.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/prometheus/templates/alerts.yml.j2</span></div>
            <pre class="language-yaml"><code class="language-yaml">groups:
  - name: infraestructura
    interval: 30s
    rules:
      - alert: HostCaído
        expr: up == 0
        for: 2m
        labels:
          severity: critical
          team: infra
        annotations:
          summary: "Host {{ "{{ $labels.instance }}" }} caído"
          description: "{{ "{{ $labels.instance }}" }} no responde desde hace más de 2 minutos"
          runbook: "https://wiki.empresa.com/runbooks/host-caido"

      - alert: DiskSpaceBajo
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 15
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Espacio en disco bajo en {{ "{{ $labels.instance }}" }}"
          description: "Quedan menos del 15% de espacio en {{ "{{ $labels.mountpoint }}" }}"

      - alert: CertificadoTLSPorVencer
        expr: (probe_ssl_earliest_cert_expiry - time()) / 86400 < 30
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "Certificado TLS por vencer en {{ "{{ $labels.instance }}" }}"
          description: "El certificado vence en menos de 30 días"</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/alertmanager/templates/alertmanager.yml.j2</span></div>
            <pre class="language-yaml"><code class="language-yaml">global:
  slack_api_url: "{{ alertmanager_slack_webhook }}"
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'slack-default'
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty-critical'
      continue: true
    - match:
        severity: warning
      receiver: 'slack-default'

receivers:
  - name: 'slack-default'
    slack_configs:
      - channel: '#ops-alerts'
        title: '{{ "{{ .GroupLabels.alertname }}" }}'
        text: '{{ "{{ range .Alerts }}{{ .Annotations.description }}\n{{ end }}" }}'
        send_resolved: true

  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: "{{ alertmanager_pagerduty_key }}"</code></pre>
          </div>
          <div class="lab-box">
            <div class="lab-box-header">🧪 Laboratorio final: Stack de observabilidad completo</div>
            <p><strong>Objetivo:</strong> desplegar el stack completo en un servidor de staging.</p>
            <ol>
              <li>Aplicá el rol <code>node_exporter</code> en todos los hosts del inventario</li>
              <li>Desplegá Prometheus en el servidor de monitoreo con targets generados dinámicamente</li>
              <li>Desplegá Grafana con el datasource de Prometheus y al menos un dashboard de node_exporter</li>
              <li>Configurá Alertmanager con al menos una regla de alerta y una ruta a Slack</li>
              <li>Desplegá Promtail en todos los hosts y Loki en el servidor de monitoreo</li>
              <li>Verificá el stack completo: generá carga en un host y confirmar que aparece en Grafana</li>
            </ol>
          </div>
          <div class="challenge-box">
            <div class="challenge-box-header">🏆 Desafío final del curso</div>
            <p>Creá un playbook <code>site.yml</code> que integre todo lo aprendido en el Nivel 22: hardening de Linux, gestión de certificados TLS, integración CI/CD y stack de observabilidad completo. Este playbook debe poder desplegar un servidor production-ready desde cero en menos de 15 minutos. ¡Eso es Ansible en producción real!</p>
          </div>
        `,
      },
    ],
    quiz: [
      {
        question: '¿Por qué Loki es más eficiente en almacenamiento que Elasticsearch para logs?',
        options: [
          'Porque Loki comprime los logs con un algoritmo más eficiente',
          'Porque Loki solo indexa las etiquetas (labels), no el contenido completo de los logs',
          'Porque Loki elimina automáticamente los logs duplicados',
          'Porque Loki usa una base de datos relacional que es más compacta',
        ],
        correctIndex: 1,
        explanation:
          'Elasticsearch indexa cada palabra de cada log para permitir búsquedas de texto completo, lo que requiere mucho espacio. Loki solo indexa las etiquetas (host, job, environment, etc.) que asignás a cada stream de logs. El contenido de los logs se almacena comprimido sin indexar. Las búsquedas usan filtros de etiquetas primero y luego buscan en el texto comprimido, siendo menos flexible pero mucho más eficiente en costo.',
      },
      {
        question: '¿Qué hace el parámetro `validate` en el módulo ansible.builtin.template?',
        options: [
          'Valida que el archivo de template Jinja2 tenga sintaxis correcta antes de renderizarlo',
          'Ejecuta un comando externo sobre el archivo generado antes de copiarlo al destino final, fallando si el comando retorna un error',
          'Verifica que las variables Jinja2 usadas en el template estén definidas en el inventario',
          'Comprueba que el archivo de destino no haya sido modificado manualmente',
        ],
        correctIndex: 1,
        explanation:
          'El parámetro `validate` en template (y copy) recibe un comando con %s como placeholder para el path del archivo temporal. Ansible renderiza el template a un archivo temporal, ejecuta el comando de validación sobre ese archivo, y solo si el comando retorna código 0 copia el archivo al destino final. Esto previene que una configuración inválida (ej: prometheus.yml con sintaxis incorrecta) reemplace la configuración actual y rompa el servicio.',
      },
      {
        question: '¿Cuál es el propósito del textfile collector de node_exporter?',
        options: [
          'Exportar logs de texto plano a Prometheus',
          'Parsear archivos de configuración y convertirlos en métricas',
          'Permitir que scripts y herramientas externas exporten métricas custom a Prometheus escribiendo archivos .prom',
          'Generar reportes de métricas en formato de texto para enviar por email',
        ],
        correctIndex: 2,
        explanation:
          'El textfile collector de node_exporter monitorea un directorio (generalmente /var/lib/node_exporter/textfile_collector/) y cuando encuentra archivos .prom con el formato Prometheus exposition format, los expone como métricas. Esto permite que cualquier script, playbook o herramienta exporte métricas custom sin necesidad de un exporter dedicado. Los archivos .prom son texto plano con el formato `metric_name{labels} valor`.',
      },
    ],
    realWorldCase:
      'Una empresa de logística con 300 servidores distribuidos en 3 regiones no tenía visibilidad centralizada: cada equipo tenía sus propios dashboards desconectados y las alertas llegaban tarde o directamente no llegaban. Implementaron el stack Prometheus+Grafana+Loki con Ansible en un sprint de 2 semanas. En el primer mes detectaron y resolvieron 12 incidentes antes de que impactaran a usuarios finales. El MTTR (tiempo medio de resolución) bajó de 4.5 horas a 35 minutos gracias a tener logs y métricas correlacionados en Grafana.',
    troubleshooting: [
      {
        error: 'Prometheus falla con "INVALID: /etc/prometheus/prometheus.yml: error parsing YAML file"',
        cause:
          'La plantilla Jinja2 genera YAML inválido, típicamente por indentación incorrecta en loops o por variables con caracteres especiales que no se escapan correctamente.',
        fix: 'Usá el parámetro `validate: /usr/local/bin/promtool check config %s` en el módulo template para detectar el error antes de copiar el archivo. Para depurar, usá `ansible-playbook --check -vvv` y buscá el archivo temporal generado en /tmp. Prestá especial atención a la indentación dentro de bloques `{% for %}` en la plantilla.',
      },
      {
        error: 'Grafana muestra "datasource not found" aunque el provisioning file existe',
        cause:
          'El archivo de datasource tiene permisos incorrectos (Grafana no puede leerlo), o el nombre del datasource en el dashboard JSON no coincide exactamente con el name definido en el provisioning file.',
        fix: 'Verificá permisos: los archivos en /etc/grafana/provisioning/ deben ser propiedad de grafana:grafana con permisos 640. Comprobá que el campo "uid" o "name" en el datasource provisioning coincida exactamente con el usado en los dashboards JSON. Revisá los logs de Grafana: `journalctl -u grafana-server -n 50`.',
      },
      {
        error: 'Alertmanager no envía alertas a Slack aunque las reglas están disparadas en Prometheus',
        cause:
          'El webhook URL de Slack está incorrecto o expiró, las rutas de Alertmanager no coinciden con las labels de las alertas, o hay un inhibition rule que silencia las alertas.',
        fix: 'Verificá el webhook con curl: `curl -X POST -H "Content-type: application/json" --data \'{"text":"test"}\' YOUR_WEBHOOK_URL`. Revisá el status de Alertmanager en http://alertmanager:9093/api/v2/alerts para ver qué alertas están activas. Verificá que no haya silences activos en la UI de Alertmanager. Comprobá que las labels de las alertas coincidan con los matchers de las rutas.',
      },
    ],
  },
];
