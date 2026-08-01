import type { ModuleContent } from '../types';

export const nivel4Mod2: ModuleContent = {
  levelId: 4,
  moduleId: 2,
  title: 'ansible-playbook — Ejecutar playbooks',
  objective: 'Dominar todas las opciones del comando ansible-playbook para controlar la ejecución de playbooks.',
  duration: '1.5 horas',
  objectives: [
    'Usar --limit, --tags y --skip-tags para ejecuciones parciales',
    'Ejecutar dry-runs con --check y --diff para previsualizar cambios',
    'Empezar desde una tarea específica con --start-at-task',
    'Pasar variables en línea de comandos con -e y desde archivos con -e @archivo.yml',
  ],
  steps: [
    {
      title: 'Opciones fundamentales',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ansible-playbook-flags.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Ejecución básica
ansible-playbook sitio.yml

# Con inventario específico
ansible-playbook -i inventario/produccion/ sitio.yml

# Limitar a hosts/grupos específicos
ansible-playbook sitio.yml --limit servidores_web
ansible-playbook sitio.yml --limit "web1,web2"
ansible-playbook sitio.yml --limit "servidores_web:!web3"  # excluir web3

# Solo ejecutar tareas con ciertos tags
ansible-playbook sitio.yml --tags nginx,ssl
ansible-playbook sitio.yml --skip-tags debug

# Dry-run completo
ansible-playbook sitio.yml --check

# Ver diferencias en archivos (con --check)
ansible-playbook sitio.yml --check --diff

# Empezar desde una tarea específica
ansible-playbook sitio.yml --start-at-task="Configurar nginx"

# Hacer pausa antes de cada tarea
ansible-playbook sitio.yml --step

# Extra variables
ansible-playbook sitio.yml -e "version=2.1.0 env=staging"
ansible-playbook sitio.yml -e @variables-extra.yml

# Syntax check
ansible-playbook sitio.yml --syntax-check

# Lista de tareas que se ejecutarían
ansible-playbook sitio.yml --list-tasks

# Lista de hosts afectados
ansible-playbook sitio.yml --list-hosts</code></pre>
        </div>
      `
    },
    {
      title: 'Opciones de escalada de privilegios y conexión',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ansible-playbook-conexion.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Usuario SSH
ansible-playbook -u ubuntu sitio.yml

# Clave SSH específica
ansible-playbook --private-key ~/.ssh/produccion_rsa sitio.yml

# Become (sudo)
ansible-playbook -b sitio.yml

# Contraseña de become interactiva
ansible-playbook -b -K sitio.yml

# Contraseña SSH interactiva
ansible-playbook -k sitio.yml

# Número de conexiones paralelas
ansible-playbook -f 20 sitio.yml

# Timeout de conexión (segundos)
ansible-playbook --timeout 60 sitio.yml</code></pre>
        </div>
        <div class="next-chapter-box">
          <div class="next-chapter-arrow">→</div>
          <div>
            <div class="next-chapter-label">A continuación</div>
            <div class="next-chapter-title">ansible-config</div>
            <div class="next-chapter-desc">Inspeccionás y gestionás la configuración activa de Ansible: qué archivo se carga, qué opciones están activas y cómo generar un ansible.cfg completo.</div>
          </div>
        </div>
      `
    }
  ],
  prerequisites: [
    'Completar el Módulo 1 del Nivel 4 — ansible ad-hoc',
  ],
  realWorldCase: 'Un equipo de DevOps automatiza el despliegue de su aplicación ejecutando <code>ansible-playbook deploy.yml --limit produccion --tags app</code>, limitando el alcance a producción y solo las tareas de la aplicación, sin tocar la configuración del sistema.',
  quiz: [
    {
      question: '¿Qué flag de ansible-playbook activa el modo "dry run" sin ejecutar cambios reales?',
      options: ['--verbose', '--check', '--diff', '--syntax-check'],
      correctIndex: 1,
      explanation: '--check ejecuta el playbook en modo simulación: muestra qué cambiaría pero no aplica cambios reales en los hosts.',
    },
    {
      question: '¿Cómo se limita la ejecución de un playbook a un subconjunto de hosts del inventario?',
      options: ['--hosts web1,web2', '--limit web1,web2', '--filter web1,web2', '--target web1,web2'],
      correctIndex: 1,
      explanation: '--limit acepta nombres de hosts, grupos, y patrones de exclusión como "servidores_web:!web3". Permite ejecutar un playbook sobre un subconjunto sin modificar el inventario.',
    },
    {
      question: '¿Qué flag permite pasar variables extra desde la línea de comandos a un playbook?',
      options: ['-v', '-e / --extra-vars', '--vars', '--set'],
      correctIndex: 1,
      explanation: '-e (--extra-vars) tiene la mayor precedencia de todas las variables en Ansible. Se puede usar como string JSON, pares clave=valor, o apuntando a un archivo con @archivo.yml.',
    },
  ],
  troubleshooting: [
    {
      error: 'ERROR! the playbook: sitio.yml could not be found',
      cause: 'El archivo de playbook no existe en la ruta indicada o el comando se ejecuta desde el directorio equivocado.',
      fix: 'Verificá el directorio actual con pwd. Usá una ruta absoluta o relativa correcta al archivo .yml del playbook.',
    },
    {
      error: 'fatal: [web1]: FAILED! => {"msg": "Missing sudo password"}',
      cause: 'El playbook usa become: true pero el usuario remoto necesita contraseña para sudo.',
      fix: 'Ejecutá con -K para pedir la contraseña de become interactivamente, o configurá NOPASSWD para ese usuario en el host remoto.',
    },
    {
      error: 'WARNING: provided hosts list is empty, only localhost is available',
      cause: 'El patrón de hosts en el play no coincide con ningún host del inventario especificado.',
      fix: 'Verificá el inventario con ansible-inventory --list. Asegurate de pasar -i inventario/ o tener inventory configurado en ansible.cfg.',
    },
  ],
};
