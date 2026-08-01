import type { ModuleContent } from '../types';

export const nivel4Mod1: ModuleContent = {
  levelId: 4,
  moduleId: 1,
  title: 'ansible — Comando ad-hoc',
  objective: 'Dominar el comando ansible para ejecutar módulos directamente en hosts remotos sin necesidad de un playbook.',
  duration: '1 hora',
  objectives: [
    'Usar los flags -m, -a, -i, -b y -v del comando ansible',
    'Ejecutar comandos ad-hoc para diagnóstico, instalación y gestión de servicios',
    'Seleccionar hosts con patrones: grupos, wildcards, intersecciones y exclusiones',
    'Recopilar facts de hosts remotos con ansible -m setup',
  ],
  steps: [
    {
      title: 'Qué es un comando ad-hoc',
      body: `
        <p>Un comando ad-hoc es una forma de ejecutar un módulo de Ansible directamente en uno o más hosts, sin escribir un playbook. Es ideal para tareas rápidas, comprobaciones, o cuando necesitás ejecutar algo una sola vez.</p>
        <p>La sintaxis básica es: <code>ansible [patrón-hosts] -m [módulo] -a "[argumentos]" [opciones]</code></p>
      `
    },
    {
      title: 'Flags más importantes',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ansible-flags.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># -m: módulo a ejecutar (default: command)
ansible servidores_web -m ping

# -a: argumentos del módulo
ansible servidores_web -m command -a "uptime"

# -i: archivo o directorio de inventario
ansible all -m ping -i inventario/

# -u: usuario SSH
ansible web1 -m ping -u ubuntu

# -b / --become: escalar privilegios (sudo)
ansible servidores_web -m package -a "name=nginx state=present" -b

# --become-user: usuario al que escalar (default: root)
ansible web1 -m command -a "whoami" -b --become-user=postgres

# -k: pedir contraseña SSH interactivamente
ansible web1 -m ping -k

# -K: pedir contraseña de sudo interactivamente
ansible web1 -m command -a "apt update" -b -K

# -f: número de forks paralelos (default: 5)
ansible all -m ping -f 20

# -v / -vv / -vvv: verbosidad (más v = más detalle)
ansible web1 -m ping -vvv

# --check: dry-run, simula sin ejecutar cambios
ansible all -m package -a "name=nginx state=present" --check

# -e: extra variables
ansible web1 -m debug -a "var=ansible_hostname" -e "extra=valor"</code></pre>
        </div>
      `
    },
    {
      title: 'Ejemplos prácticos de ad-hoc',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ad-hoc-ejemplos.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Verificar conectividad con todos los hosts
ansible all -m ping

# Ver uptime de servidores web
ansible servidores_web -m command -a "uptime"

# Instalar un paquete (requiere sudo)
ansible bases_de_datos -m package -a "name=postgresql state=present" -b

# Copiar un archivo
ansible web1 -m copy -a "src=/local/archivo.conf dest=/etc/app/archivo.conf mode=0644" -b

# Reiniciar un servicio
ansible servidores_web -m service -a "name=nginx state=restarted" -b

# Ejecutar un script local en hosts remotos
ansible all -m script -a "/path/local/mi-script.sh"

# Recopilar facts de un host
ansible web1 -m setup

# Recopilar solo facts de red
ansible web1 -m setup -a "filter=ansible_default_ipv4"

# Crear un usuario
ansible all -m user -a "name=deploy shell=/bin/bash groups=sudo" -b</code></pre>
        </div>
        <div class="next-chapter-box">
          <div class="next-chapter-arrow">→</div>
          <div>
            <div class="next-chapter-label">A continuación</div>
            <div class="next-chapter-title">ansible-playbook</div>
            <div class="next-chapter-desc">Cuando las tareas son múltiples y repetibles, las encapsulás en un playbook y lo ejecutás con ansible-playbook.</div>
          </div>
        </div>
      `
    }
  ],
  prerequisites: [
    'Completar el Nivel 0 — Fundamentos de Ansible',
    'Completar el Nivel 1 — Inventario y Conexión SSH',
    'Completar el Nivel 2 — Módulos esenciales',
  ],
  realWorldCase: 'Un SRE recibe una alerta de disco lleno en producción. En lugar de conectarse a cada servidor por SSH, ejecuta <code>ansible servidores_web -m command -a "df -h /var"</code> y en segundos tiene el estado de todos los nodos.',
  quiz: [
    {
      question: '¿Qué flag del comando ansible permite escalar privilegios a root en el host remoto?',
      options: ['-u root', '-b / --become', '--sudo', '-p'],
      correctIndex: 1,
      explanation: '-b (o --become) activa la escalada de privilegios. Por defecto usa sudo para convertirse en root, aunque se puede cambiar con --become-method y --become-user.',
    },
    {
      question: '¿Qué módulo se usa para recopilar facts (variables del sistema) de un host remoto?',
      options: ['ansible.builtin.facts', 'ansible.builtin.gather', 'ansible.builtin.setup', 'ansible.builtin.info'],
      correctIndex: 2,
      explanation: 'El módulo setup recopila todos los facts del host: distribución, IP, memoria, CPU, etc. Se puede filtrar con -a "filter=ansible_*".',
    },
    {
      question: '¿Cuál es la diferencia entre el módulo command y el módulo shell en comandos ad-hoc?',
      options: [
        'No hay diferencia, son alias',
        'shell permite pipes y redirecciones; command no',
        'command permite pipes; shell no',
        'shell solo funciona en Linux',
      ],
      correctIndex: 1,
      explanation: 'El módulo shell ejecuta el comando dentro de /bin/sh, lo que permite usar pipes (|), redirecciones (>) y variables de entorno. El módulo command los ejecuta directamente sin shell.',
    },
  ],
  troubleshooting: [
    {
      error: 'UNREACHABLE! => {"msg": "Failed to connect to the host via ssh"}',
      cause: 'Ansible no puede establecer la conexión SSH con el host: clave incorrecta, puerto diferente o host inaccesible.',
      fix: 'Verificá con ssh -v usuario@host. Revisá ansible_host, ansible_port y ansible_ssh_private_key_file en el inventario.',
    },
    {
      error: 'Missing sudo password',
      cause: 'Se usó -b (become) pero el usuario remoto requiere contraseña para sudo y no se proporcionó.',
      fix: 'Agregá -K para ingresar la contraseña de sudo interactivamente, o configurá NOPASSWD en /etc/sudoers del host remoto.',
    },
    {
      error: 'ERROR! No hosts matched the pattern',
      cause: 'El patrón de hosts no coincide con ningún host o grupo definido en el inventario.',
      fix: 'Verificá con ansible-inventory --list que el grupo o host existe. Comprobá que estás usando el inventario correcto con -i.',
    },
  ],
};
