import type { ModuleContent } from '../types';

export const nivel4Mod3: ModuleContent = {
  levelId: 4,
  moduleId: 3,
  title: 'ansible-config — Gestión de configuración',
  objective: 'Aprender a inspeccionar y gestionar la configuración de Ansible usando ansible-config.',
  duration: '45 minutos',
  objectives: [
    'Listar la configuración activa y sus fuentes con ansible-config dump',
    'Identificar qué opciones están modificadas respecto a los defaults',
    'Generar un ansible.cfg de referencia con ansible-config init',
    'Configurar las opciones de rendimiento y conexión más importantes',
  ],
  steps: [
    {
      title: 'Comandos principales de ansible-config',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ansible-config-comandos.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Ver toda la configuración activa con sus fuentes
ansible-config dump

# Ver solo configuración no-default (lo que modificaste)
ansible-config dump --only-changed

# Ver lista de todas las opciones de configuración disponibles
ansible-config list

# Generar un ansible.cfg con todas las opciones comentadas
ansible-config init > ansible.cfg.ejemplo

# Ver configuración como YAML
ansible-config dump --format yaml</code></pre>
        </div>
      `
    },
    {
      title: 'ansible.cfg más comunes',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
          <pre class="language-ini"><code class="language-ini">[defaults]
# Inventario por defecto
inventory = inventario/

# Usuario SSH por defecto
remote_user = ubuntu

# Número de forks paralelos
forks = 10

# Timeout de conexión SSH (segundos)
timeout = 30

# Callback para la salida
stdout_callback = yaml
callback_enabled = timer, profile_tasks

# Deshabilitar host key checking (solo para desarrollo)
host_key_checking = False

# Archivo de log
log_path = /var/log/ansible.log

# Roles paths
roles_path = roles:~/.ansible/roles

# Collections paths
collections_paths = ~/.ansible/collections:/etc/ansible/collections

[privilege_escalation]
become = True
become_method = sudo
become_user = root

[ssh_connection]
# SSH multiplexing para mejor performance
control_path_dir = /tmp/ansible-ssh-%%h-%%p-%%r
pipelining = True</code></pre>
        </div>
        <div class="next-chapter-box">
          <div class="next-chapter-arrow">→</div>
          <div>
            <div class="next-chapter-label">A continuación</div>
            <div class="next-chapter-title">ansible-doc</div>
            <div class="next-chapter-desc">Consultás la documentación de cualquier módulo o plugin directamente desde la terminal, sin salir del flujo de trabajo.</div>
          </div>
        </div>
      `
    }
  ],
  prerequisites: [
    'Completar el Módulo 2 del Nivel 4 — ansible-playbook',
  ],
  realWorldCase: 'Un ingeniero detecta que sus playbooks tardan 40 segundos más de lo esperado. Con <code>ansible-config dump --only-changed</code> descubre que pipelining está desactivado y que forks está en 2. Corrige ambas opciones en ansible.cfg y reduce el tiempo de ejecución a la mitad.',
  quiz: [
    {
      question: '¿Qué subcomando de ansible-config muestra solo la configuración que difiere de los valores por defecto?',
      options: ['ansible-config list --modified', 'ansible-config dump --only-changed', 'ansible-config diff', 'ansible-config show --custom'],
      correctIndex: 1,
      explanation: 'ansible-config dump --only-changed filtra la salida para mostrar únicamente las opciones que han sido modificadas respecto a sus valores predeterminados, facilitando auditorías.',
    },
    {
      question: '¿Cómo se genera un archivo ansible.cfg de referencia con todas las opciones disponibles comentadas?',
      options: ['ansible-config list > ansible.cfg', 'ansible-config init > ansible.cfg', 'ansible-config dump --full > ansible.cfg', 'ansible-config export > ansible.cfg'],
      correctIndex: 1,
      explanation: 'ansible-config init genera un ansible.cfg completo con todas las opciones disponibles, cada una comentada con su descripción y valor por defecto.',
    },
    {
      question: '¿En qué orden de precedencia busca Ansible el archivo ansible.cfg?',
      options: [
        'ANSIBLE_CONFIG → /etc/ansible/ansible.cfg → ~/.ansible.cfg → ./ansible.cfg',
        'ANSIBLE_CONFIG → ./ansible.cfg → ~/.ansible.cfg → /etc/ansible/ansible.cfg',
        './ansible.cfg → ~/.ansible.cfg → /etc/ansible/ansible.cfg → ANSIBLE_CONFIG',
        '~/.ansible.cfg → ./ansible.cfg → ANSIBLE_CONFIG → /etc/ansible/ansible.cfg',
      ],
      correctIndex: 1,
      explanation: 'Ansible busca en este orden: variable de entorno ANSIBLE_CONFIG, luego ./ansible.cfg en el directorio actual, luego ~/.ansible.cfg y finalmente /etc/ansible/ansible.cfg. El primero encontrado gana.',
    },
  ],
  troubleshooting: [
    {
      error: 'Ansible is in a world writable directory, ignoring ansible.cfg',
      cause: 'El directorio donde está ansible.cfg tiene permisos de escritura para todos (world-writable), lo que representa un riesgo de seguridad.',
      fix: 'Corregí los permisos del directorio con chmod o-w . para quitar escritura a "otros". Ansible ignorará el cfg si el directorio es world-writable.',
    },
    {
      error: 'Invalid value for configuration option DEFAULT_FORKS',
      cause: 'El valor asignado a una opción de configuración no es del tipo esperado (por ejemplo, texto donde se espera un número).',
      fix: 'Revisá el tipo esperado con ansible-config list y corregí el valor en ansible.cfg. Para forks debe ser un entero positivo.',
    },
    {
      error: 'Could not find or access ansible.cfg',
      cause: 'Se especificó la variable ANSIBLE_CONFIG apuntando a un archivo que no existe.',
      fix: 'Verificá que la ruta en ANSIBLE_CONFIG es correcta con ls -la $ANSIBLE_CONFIG. O remové la variable de entorno para que Ansible use los paths por defecto.',
    },
  ],
};
