import type { StepContent } from '../types';

export const nivel9Mod4StepsB: StepContent[] = [
  {
    title: 'import — usar macros desde otros archivos',
    body: `
      <p>Cuando las macros son útiles en múltiples templates, podés moverlas a un archivo dedicado e importarlas con <code>{% import %}</code>. Esto crea una biblioteca de macros reutilizable.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">jinja2</span><span class="code-block-filename">templates/macros/nginx_macros.j2</span></div>
        <pre class="language-jinja2"><code class="language-jinja2">{# Biblioteca de macros para nginx #}
{# Este archivo SÓLO define macros — no genera output directamente #}

{% macro virtual_host(dominio, puerto_app, escuchar=80, ssl=false) %}
server {
listen {{ escuchar }}{% if ssl %} ssl{% endif %};
server_name {{ dominio }};
access_log /var/log/nginx/{{ dominio }}-access.log;
error_log /var/log/nginx/{{ dominio }}-error.log warn;
location / {
    proxy_pass http://localhost:{{ puerto_app }};
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
}
{% endmacro %}

{% macro upstream_block(nombre, servidores) %}
upstream {{ nombre }} {
{% for server in servidores %}
server {{ server.ip }}:{{ server.puerto }} weight={{ server.weight | default(1) }};
{% endfor %}
}
{% endmacro %}

{% macro ssl_params() %}
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
{% endmacro %}</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">jinja2</span><span class="code-block-filename">templates/nginx.conf.j2</span></div>
        <pre class="language-jinja2"><code class="language-jinja2">{# Importar todas las macros del archivo de biblioteca #}
{% import 'macros/nginx_macros.j2' as nginx %}

worker_processes auto;

http {
{# Usar macros con el prefijo del alias #}
{{ nginx.upstream_block("backend", upstream_servers) }}

{% for vhost in nginx_vhosts %}
{{ nginx.virtual_host(vhost.dominio, vhost.puerto, ssl=vhost.ssl | default(false)) }}
{% endfor %}
}

{# También podés importar macros específicas sin alias #}
{# {% from 'macros/nginx_macros.j2' import virtual_host, ssl_params %} #}
{# virtual_host(...) — usada sin prefijo #}</code></pre>
      </div>
      <div class="highlight-box">
        <p><strong>Dos formas de importar:</strong></p>
        <ul>
          <li><code>{% import 'archivo.j2' as alias %}</code> → usás las macros con el prefijo: <code>alias.macro()</code></li>
          <li><code>{% from 'archivo.j2' import macro1, macro2 %}</code> → usás las macros directamente sin prefijo</li>
        </ul>
      </div>
    `
  },
  {
    title: 'include — insertar fragmentos de template',
    body: `
      <p><code>{% include %}</code> es diferente a <code>{% import %}</code>: en lugar de cargar macros, <strong>inserta directamente el contenido renderizado</strong> de otro archivo en ese punto. Es como un <code>cat</code> del template procesado.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">jinja2</span><span class="code-block-filename">templates/nginx/ssl_params.j2</span></div>
        <pre class="language-jinja2"><code class="language-jinja2">{# Fragmento reutilizable: parámetros SSL #}
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers off;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;
add_header Strict-Transport-Security "max-age=63072000" always;</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">jinja2</span><span class="code-block-filename">templates/nginx/gzip_params.j2</span></div>
        <pre class="language-jinja2"><code class="language-jinja2">{# Fragmento: configuración gzip #}
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level {{ gzip_level | default(6) }};
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">jinja2</span><span class="code-block-filename">templates/nginx.conf.j2</span></div>
        <pre class="language-jinja2"><code class="language-jinja2">{% import 'macros/nginx_macros.j2' as nginx %}

worker_processes {{ ansible_processor_vcpus | default(2) }};

http {
include /etc/nginx/mime.types;
default_type application/octet-stream;

{# Incluir fragmento de gzip — se renderiza con las variables del contexto actual #}
{% include 'nginx/gzip_params.j2' %}

{% for vhost in nginx_vhosts %}
server {
    listen 80;
    server_name {{ vhost.dominio }};

    {% if vhost.ssl | default(false) %}
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/{{ vhost.dominio }}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/{{ vhost.dominio }}/privkey.pem;

    {# Incluir parámetros SSL como fragmento reutilizable #}
    {% include 'nginx/ssl_params.j2' %}
    {% endif %}

    location / {
        proxy_pass http://localhost:{{ vhost.puerto }};
    }
}
{% endfor %}
}

{# include con ignore missing — no falla si el archivo no existe #}
{% include 'nginx/custom_overrides.j2' ignore missing %}</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>include vs. import:</strong> usá <code>include</code> cuando querés insertar texto renderizado (fragmentos de configuración). Usá <code>import</code> cuando querés cargar macros (funciones reutilizables). Los includes heredan el contexto completo del template padre; los imports también, a menos que uses <code>import ... with context</code>.</div>
      </div>
    `
  },
  {
    title: 'Ejemplo completo: nginx.conf.j2 con macros para virtual hosts',
    body: `
      <div class="lab-box">
        <div class="lab-box-header">🧪 Ejemplo completo — nginx con macros</div>
        <div class="lab-section">
          <div class="lab-section-title">Estructura del proyecto</div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">estructura-templates/</span></div>
            <pre class="language-bash"><code class="language-bash">roles/nginx/
├── tasks/
│   └── main.yml
├── templates/
│   ├── macros/
│   │   └── nginx_macros.j2     # biblioteca de macros
│   ├── nginx/
│   │   ├── ssl_params.j2       # fragmento SSL
│   │   └── gzip_params.j2      # fragmento gzip
│   └── nginx.conf.j2           # template principal
└── vars/
└── main.yml</code></pre>
          </div>
        </div>
        <div class="lab-section">
          <div class="lab-section-title">Playbook de despliegue</div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/nginx/tasks/main.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Instalar nginx
  ansible.builtin.package:
name: nginx
state: present

- name: Generar configuración principal con template
  ansible.builtin.template:
src: nginx.conf.j2
dest: /etc/nginx/nginx.conf
owner: root
group: root
mode: '0644'
validate: 'nginx -t -c %s'   # validar antes de instalar
  notify: reload nginx

- name: Verificar que nginx está corriendo
  ansible.builtin.service:
name: nginx
state: started
enabled: true</code></pre>
          </div>
        </div>
        <div class="lab-section">
          <div class="lab-section-title">Variables (group_vars/webservers.yml)</div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">group_vars/webservers.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">gzip_level: 6

nginx_vhosts:
  - dominio: "tienda.ejemplo.com"
puerto: 3000
ssl: true
  - dominio: "api.ejemplo.com"
puerto: 8080
ssl: true
  - dominio: "monitor.ejemplo.com"
puerto: 9090
ssl: false

upstream_servers:
  - ip: "10.0.1.10"
puerto: 3000
weight: 2
  - ip: "10.0.1.11"
puerto: 3000
weight: 1</code></pre>
          </div>
        </div>
        <div class="lab-section">
          <div class="lab-section-title">Resultado esperado</div>
          <div class="lab-expected">
            <div class="lab-expected-item"><span class="lab-expected-check">✓</span> <code>ansible-playbook site.yml --tags nginx</code> genera /etc/nginx/nginx.conf sin errores</div>
            <div class="lab-expected-item"><span class="lab-expected-check">✓</span> <code>nginx -t</code> valida la configuración generada</div>
            <div class="lab-expected-item"><span class="lab-expected-check">✓</span> Cada vhost en nginx_vhosts tiene su bloque server generado</div>
            <div class="lab-expected-item"><span class="lab-expected-check">✓</span> Los bloques SSL sólo aparecen en los vhosts con ssl: true</div>
            <div class="lab-expected-item"><span class="lab-expected-check">✓</span> La macro upstream_block genera el bloque upstream correctamente</div>
          </div>
        </div>
      </div>
    `
  }
];
