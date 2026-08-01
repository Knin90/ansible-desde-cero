import type { ModuleContent } from '../types';

export const nivel22Mod2: ModuleContent =   {
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
  };
