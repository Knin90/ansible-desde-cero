import type { StepContent } from '../types';

export const nivel9Mod4StepsA: StepContent[] = [
  {
    title: '¿Por qué existen las macros? El problema DRY en templates',
    body: `
      <p>Cuando generás configuraciones complejas con templates Jinja2, es fácil caer en la repetición: el mismo bloque de configuración copiado y pegado con pequeñas variaciones. Las <strong>macros</strong> resuelven esto.</p>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Una macro en Jinja2 es como una función en Python: la definís una vez con parámetros, y la llamás tantas veces como necesités pasando distintos argumentos. El output se genera en el punto donde la llamás.</p>
      </div>
      <div class="highlight-box">
        <p><strong>¿Cuándo usar macros?</strong></p>
        <ul>
          <li>El mismo bloque de configuración aparece 2 o más veces en el template con variaciones</li>
          <li>Querés testear la lógica de generación de forma aislada</li>
          <li>Necesitás el mismo bloque en múltiples templates diferentes</li>
          <li>La lógica es lo suficientemente compleja como para merecer un nombre descriptivo</li>
        </ul>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">jinja2</span><span class="code-block-filename">templates/nginx-sin-macros.conf.j2</span></div>
        <pre class="language-jinja2"><code class="language-jinja2">{# ❌ ANTES: repetición sin macros #}
server {
listen 80;
server_name app.ejemplo.com;
root /var/www/app;
access_log /var/log/nginx/app-access.log;
error_log /var/log/nginx/app-error.log;
location / { proxy_pass http://localhost:8080; }
}

server {
listen 80;
server_name api.ejemplo.com;
root /var/www/api;
access_log /var/log/nginx/api-access.log;
error_log /var/log/nginx/api-error.log;
location / { proxy_pass http://localhost:8081; }
}

server {
listen 80;
server_name admin.ejemplo.com;
root /var/www/admin;
access_log /var/log/nginx/admin-access.log;
error_log /var/log/nginx/admin-error.log;
location / { proxy_pass http://localhost:8082; }
}</code></pre>
      </div>
      <p>Con macros, esto se convierte en una sola definición + tres llamadas. Veremos cómo en los próximos pasos.</p>
    `
  },
  {
    title: 'Definir macros con parámetros y defaults',
    body: `
      <p>Una macro se define con <code>{% macro nombre(param1, param2="default") %}</code> y se cierra con <code>{% endmacro %}</code>. Los parámetros pueden tener valores por defecto, exactamente como en Python.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">jinja2</span><span class="code-block-filename">templates/nginx.conf.j2</span></div>
        <pre class="language-jinja2"><code class="language-jinja2">{# Definición de la macro — sólo define, no genera output todavía #}
{% macro virtual_host(dominio, puerto_app, root="/var/www", escuchar=80, ssl=false) %}
server {
listen {{ escuchar }}{% if ssl %} ssl{% endif %};
server_name {{ dominio }};
root {{ root }}/{{ dominio.split('.')[0] }};

access_log /var/log/nginx/{{ dominio }}-access.log;
error_log /var/log/nginx/{{ dominio }}-error.log warn;

{% if ssl %}
ssl_certificate /etc/letsencrypt/live/{{ dominio }}/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/{{ dominio }}/privkey.pem;
{% endif %}

location / {
    proxy_pass http://localhost:{{ puerto_app }};
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
}
{% endmacro %}</code></pre>
      </div>
      <div class="highlight-box">
        <p><strong>Reglas de sintaxis de macros:</strong></p>
        <ul>
          <li>Los parámetros sin default son <strong>obligatorios</strong></li>
          <li>Los parámetros con default son <strong>opcionales</strong> — si no se pasan, usan el default</li>
          <li>La macro <strong>no genera output</strong> donde está definida — sólo cuando se llama</li>
          <li>El cuerpo de la macro tiene acceso a todas las variables del contexto global del template</li>
        </ul>
      </div>
    `
  },
  {
    title: 'Llamar macros dentro del mismo archivo',
    body: `
      <p>Una vez definida la macro, se llama como una función. El output se inserta en el punto exacto de la llamada.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">jinja2</span><span class="code-block-filename">templates/nginx.conf.j2</span></div>
        <pre class="language-jinja2"><code class="language-jinja2">{# Primero: definición de la macro #}
{% macro virtual_host(dominio, puerto_app, root="/var/www", escuchar=80, ssl=false) %}
server {
listen {{ escuchar }}{% if ssl %} ssl{% endif %};
server_name {{ dominio }};

access_log /var/log/nginx/{{ dominio }}-access.log;
error_log /var/log/nginx/{{ dominio }}-error.log warn;

{% if ssl %}
ssl_certificate /etc/letsencrypt/live/{{ dominio }}/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/{{ dominio }}/privkey.pem;
{% endif %}

location / {
    proxy_pass http://localhost:{{ puerto_app }};
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
}
{% endmacro %}

{# Configuración global de nginx #}
worker_processes {{ ansible_processor_vcpus | default(2) }};
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
worker_connections 1024;
}

http {
include /etc/nginx/mime.types;
default_type application/octet-stream;
sendfile on;
keepalive_timeout 65;

{# Llamadas a la macro con distintos argumentos #}
{{ virtual_host("app.ejemplo.com", 8080) }}
{{ virtual_host("api.ejemplo.com", 8081) }}
{{ virtual_host("admin.ejemplo.com", 8082, ssl=true, escuchar=443) }}

{# O iterando sobre una variable de Ansible #}
{% for vhost in nginx_vhosts %}
{{ virtual_host(vhost.dominio, vhost.puerto, ssl=vhost.ssl | default(false)) }}
{% endfor %}
}</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">group_vars/webservers.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">nginx_vhosts:
  - dominio: "tienda.ejemplo.com"
puerto: 3000
ssl: true
  - dominio: "blog.ejemplo.com"
puerto: 4000
ssl: false
  - dominio: "docs.ejemplo.com"
puerto: 5000
ssl: true</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Blancos en la salida:</strong> Jinja2 inserta líneas en blanco donde hay tags <code>{% %}</code>. Para controlar el whitespace, usá guiones: <code>{%- macro ... -%}</code> o <code>{{- valor -}}</code>. El guión consume el whitespace adyacente.</div>
      </div>
    `
  }
];
