import type { ModuleContent } from '../types';

export const nivel0Mod4: ModuleContent = {
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
};
