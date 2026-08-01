import type { ModuleContent } from '../types';

export const nivel13Mod3: ModuleContent =   {
levelId: 13,
moduleId: 3,
title: 'Filter Plugins',
objective: 'Crear filtros Jinja2 personalizados en Python para transformar datos en templates y playbooks, y extender las capacidades de transformación de datos de Ansible.',
duration: '1.5 horas',
objectives: [
  'Crear un filter plugin Python básico con la clase FilterModule',
  'Registrar múltiples filtros desde un único archivo',
  'Usar filtros personalizados en templates Jinja2 y en parámetros de tareas',
  'Saber dónde colocar filter plugins para que Ansible los descubra',
  'Escribir filtros que aceptan parámetros adicionales',
],
prerequisites: [
  'Conocer filtros Jinja2 built-in (Nivel 9)',
  'Python básico: funciones con parámetros, clases',
  'Haber creado templates Jinja2 con Ansible',
],
steps: [
  {
    title: '¿Qué es un filter plugin y cuándo lo necesitás?',
    body: `
      <p>Los filtros built-in de Ansible son potentes, pero a veces necesitás transformaciones específicas del dominio de tu empresa. Los filter plugins te permiten agregar tus propios filtros al operador <code>|</code> de Jinja2.</p>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Cuándo crear un filter plugin:</strong>
          <ul>
            <li>Conversiones de formato específicas de tu infraestructura (ej: lista de IPs → bloque upstream nginx)</li>
            <li>Enmascarado de datos sensibles en logs (contraseñas en connection strings)</li>
            <li>Validaciones de formato (CIDR, semver, hostnames)</li>
            <li>Transformaciones que se repiten en múltiples templates</li>
          </ul>
        </div>
      </div>
    `
  },
  {
    title: 'Crear un filter plugin completo',
    body: `
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">filter_plugins/infraestructura.py</span></div>
        <pre class="language-yaml"><code class="language-yaml">"""
Filtros personalizados para transformaciones de infraestructura.
Colocalos en filter_plugins/ relativo al playbook o al role.
"""
import re
import ipaddress


def to_nginx_upstream(servers, weight=1, max_fails=3, fail_timeout='30s'):
"""
Convierte una lista de servers en bloque upstream nginx.

Uso: {{ backend_servers | to_nginx_upstream(weight=2) }}
"""
lineas = []
for servidor in servers:
    linea = f'    server {servidor}'
    linea += f' weight={weight}'
    linea += f' max_fails={max_fails}'
    linea += f' fail_timeout={fail_timeout};'
    lineas.append(linea)
return '\n'.join(lineas)


def to_env_file(variables, quoted=True):
"""
Convierte un dict en formato .env (KEY="value").

Uso: {{ app_vars | to_env_file }}
"""
lineas = []
for clave, valor in variables.items():
    if quoted:
        lineas.append(f'{clave}="{valor}"')
    else:
        lineas.append(f'{clave}={valor}')
return '\n'.join(lineas)


def mask_secret(texto, mask='****'):
"""
Enmascara contraseñas en connection strings y URLs.
postgres://user:SECRET@host → postgres://user:****@host

Uso: {{ db_url | mask_secret }}
"""
# Patrón: cualquier cosa entre : y @ que parezca una contraseña
return re.sub(r'(:)[^:@/\\s]+(@)', r'\\1' + mask + r'\\2', str(texto))


def is_valid_cidr(valor):
"""
Verifica si un string es un CIDR válido.

Uso: {{ red | is_valid_cidr }}
"""
try:
    ipaddress.ip_network(valor, strict=False)
    return True
except ValueError:
    return False


def cidr_to_netmask(cidr):
"""
Convierte CIDR a máscara de subred.
10.0.0.0/24 → 255.255.255.0

Uso: {{ red_cidr | cidr_to_netmask }}
"""
network = ipaddress.ip_network(cidr, strict=False)
return str(network.netmask)


class FilterModule:
"""
Registro de filtros — Ansible descubre esta clase automáticamente.
El método filters() debe devolver un dict {nombre_filtro: función}.
"""
def filters(self):
    return {
        'to_nginx_upstream': to_nginx_upstream,
        'to_env_file': to_env_file,
        'mask_secret': mask_secret,
        'is_valid_cidr': is_valid_cidr,
        'cidr_to_netmask': cidr_to_netmask,
    }</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">usar-filtros.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">vars:
  backend_servers:
- "10.0.1.10:3000"
- "10.0.1.11:3000"
- "10.0.1.12:3000"
  app_env:
DATABASE_URL: "postgres://user:s3cr3tp4ss@db:5432/myapp"
REDIS_URL: "redis://localhost:6379"
API_KEY: "abc123def456"
  redes_permitidas:
- "10.0.0.0/8"
- "192.168.1.0/24"
- "invalid-red"   # Esta debería fallar validación

tasks:
  - name: Verificar que todas las redes son CIDR válidos
ansible.builtin.assert:
  that:
    - item | is_valid_cidr
  fail_msg: "Red inválida: {{ item }}"
loop: "{{ redes_permitidas }}"

  - name: Mostrar DB URL enmascarada en log
ansible.builtin.debug:
  msg: "Conectando a: {{ app_env.DATABASE_URL | mask_secret }}"
# Output: "Conectando a: postgres://user:****@db:5432/myapp"

  - name: Crear archivo .env
ansible.builtin.copy:
  content: "{{ app_env | to_env_file }}\n"
  dest: /opt/mi-app/.env
  mode: '0600'</code></pre>
      </div>
    `
  },
  {
    title: 'Usar filtros en templates Jinja2',
    body: `
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">jinja2</span><span class="code-block-filename">templates/nginx-backend.conf.j2</span></div>
        <pre class="language-yaml"><code class="language-yaml"># Generado por Ansible — no editar manualmente
# Plantilla: nginx-backend.conf.j2

upstream backend_pool {
least_conn;
{{ backend_servers | to_nginx_upstream(weight=2, max_fails=5) }}
}

upstream admin_pool {
{{ admin_servers | to_nginx_upstream(weight=1) }}
}

server {
listen {{ nginx_port }};
server_name {{ app_domain }};

location / {
    proxy_pass http://backend_pool;
    proxy_set_header X-Real-IP $remote_addr;
}

location /admin {
    # Solo desde redes internas
    {% for red in redes_internas %}
    allow {{ red }};
    {% endfor %}
    deny all;
    proxy_pass http://admin_pool;
}
}</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Ubicación de filter plugins:</strong> Ansible busca en <code>filter_plugins/</code> relativo al playbook y relativo al role. Para compartir entre proyectos, configurá la ruta en ansible.cfg: <code>[defaults] filter_plugins = ~/.ansible/plugins/filter</code>. En collections modernas, van en <code>plugins/filter/</code>.</div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'filter plugin',
    definition: 'Plugin de Ansible que agrega funciones al operador | de Jinja2. Se implementa en Python como una función y se registra en la clase FilterModule.filters(). Pueden usarse en parámetros de tareas y en archivos de templates.',
  },
  {
    term: 'FilterModule',
    definition: 'Clase Python requerida en un filter plugin de Ansible. Debe implementar el método filters() que devuelve un diccionario mapping nombre_del_filtro → función Python.',
  },
  {
    term: 'filter_plugins/',
    definition: 'Directorio donde Ansible busca filter plugins. Puede estar relativo al playbook, relativo al role, o en rutas configuradas en ansible.cfg con filter_plugins = /ruta. En collections, la ubicación es plugins/filter/.',
  },
],
quiz: [
  {
    question: '¿Qué clase y método debe implementar obligatoriamente un filter plugin de Ansible?',
    options: [
      'Clase Plugin con método run()',
      'Clase FilterModule con método filters() que devuelve un dict',
      'Clase AnsibleFilter con método execute()',
      'No requiere una clase específica — solo funciones Python',
    ],
    correctIndex: 1,
    explanation: 'Ansible descubre filtros buscando una clase llamada FilterModule en el archivo Python. Esa clase debe tener un método filters() que retorna un diccionario donde las claves son los nombres de los filtros y los valores son las funciones Python correspondientes.',
  },
  {
    question: '¿Cómo llamarías a un filtro personalizado que acepta un parámetro adicional?',
    options: [
      '{{ lista | mi_filtro }} con mi_filtro(param=valor)',
      '{{ lista | mi_filtro(param=valor) }}',
      '{{ mi_filtro(lista, param=valor) }}',
      '{{ lista | mi_filtro | with_param(param=valor) }}',
    ],
    correctIndex: 1,
    explanation: 'En Jinja2, los parámetros de un filtro se pasan entre paréntesis después del nombre del filtro: {{ lista | mi_filtro(param=valor) }}. La función Python recibe la lista como primer argumento y param como argumento con nombre. También se puede pasar posicionalmente: {{ lista | mi_filtro(valor) }}.',
  },
],
troubleshooting: [
  {
    error: 'FilterError: no filter named "mi_filtro"',
    cause: 'Ansible no encuentra el filter plugin o la clase FilterModule no lo registra correctamente.',
    fix: 'Verificá: (1) el archivo está en filter_plugins/ relativo al playbook, (2) la clase se llama FilterModule, (3) el método filters() devuelve un dict con el nombre exacto del filtro como clave, (4) no hay errores de sintaxis Python en el archivo.',
  },
  {
    error: 'TypeError al ejecutar el filtro con parámetros',
    cause: 'La función Python no acepta el número de argumentos pasados desde Jinja2.',
    fix: 'El primer argumento de la función siempre es el valor que viene antes del pipe |. Los parámetros adicionales deben tener valores por defecto en la firma: def mi_filtro(valor, param1="default"). Verificá que la firma coincide con cómo se usa en el template.',
  },
],
realWorldCase: 'Un equipo de infraestructura desarrolló 12 filtros personalizados agrupados en filter_plugins/: conversiones de formatos de red, generadores de bloques nginx/haproxy, y validadores de formatos propietarios de la empresa. Estos filtros se comparten entre 30 proyectos de Ansible poniendo el directorio filter_plugins/ en un repositorio común y referenciándolo en ansible.cfg de cada proyecto.',
  };
