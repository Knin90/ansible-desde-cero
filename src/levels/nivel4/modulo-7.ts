import type { ModuleContent } from '../types';

export const nivel4Mod7: ModuleContent = {
  levelId: 4,
  moduleId: 7,
  title: 'ansible-pull — Modelo pull',
  objective: 'Entender el modelo pull de Ansible y cuándo usarlo en lugar del modelo push estándar.',
  duration: '1 hora',
  objectives: [
    'Explicar cuándo el modelo pull escala mejor que el modelo push',
    'Configurar ansible-pull para clonar un repositorio Git y ejecutar un playbook local',
    'Automatizar ansible-pull como cron job en cada host',
    'Identificar las limitaciones del modelo pull respecto al feedback inmediato',
  ],
  steps: [
    {
      title: 'Qué es ansible-pull',
      body: `
        <p>Ansible opera en modelo push: el nodo de control se conecta a los hosts y ejecuta las tareas. <code>ansible-pull</code> invierte este modelo: cada host clona el repositorio Git con los playbooks y se auto-configura. Es útil para:</p>
        <ul>
          <li>Flotas de miles de máquinas donde el push no escala</li>
          <li>Entornos sin conectividad directa desde el control node</li>
          <li>Bootstrap de nuevas máquinas sin intervención manual</li>
          <li>Configuración de estaciones de trabajo</li>
        </ul>
      `
    },
    {
      title: 'Uso de ansible-pull',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ansible-pull-ejemplo.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Sintaxis básica: cada host clona el repo y ejecuta el playbook
ansible-pull -U https://github.com/mi-org/ansible-config.git local.yml

# Con rama específica
ansible-pull -U git@github.com:mi-org/config.git -C produccion local.yml

# Con directorio de trabajo específico
ansible-pull -U https://github.com/mi-org/config.git -d /opt/ansible local.yml

# Con clave privada para el repo Git
ansible-pull -U git@github.com:mi-org/config.git --private-key ~/.ssh/deploy_key local.yml

# Como cron job (cada 30 minutos)
# En /etc/cron.d/ansible-pull:
# */30 * * * * root ansible-pull -U https://... local.yml >> /var/log/ansible-pull.log 2>&1</code></pre>
        </div>
        <div class="next-chapter-box">
          <div class="next-chapter-arrow">→</div>
          <div>
            <div class="next-chapter-label">A continuación</div>
            <div class="next-chapter-title">ansible-inventory</div>
            <div class="next-chapter-desc">Inspeccionás y depurás inventarios complejos para ver exactamente qué hosts, grupos y variables resuelve Ansible.</div>
          </div>
        </div>
      `
    }
  ],
  prerequisites: [
    'Completar el Módulo 6 del Nivel 4 — ansible-vault',
  ],
  realWorldCase: 'Una empresa gestiona 5000 servidores web. En lugar de un control node central que empuja configuración, cada servidor ejecuta <code>ansible-pull</code> cada 30 minutos via cron, descargando y aplicando su configuración desde el repositorio Git corporativo de forma autónoma.',
  quiz: [
    {
      question: '¿Cuál es la diferencia fundamental entre el modelo push (ansible-playbook) y el modelo pull (ansible-pull)?',
      options: [
        'ansible-pull es más rápido que ansible-playbook',
        'En push el control node conecta a los hosts; en pull cada host se autoconfigura clonando el repositorio Git',
        'ansible-pull solo funciona con inventarios dinámicos',
        'En pull no se puede usar sudo/become',
      ],
      correctIndex: 1,
      explanation: 'En el modelo push (estándar), el control node SSH a cada host y ejecuta las tareas. En el modelo pull, cada host ejecuta ansible-pull que clona el repo Git localmente y aplica el playbook sobre sí mismo.',
    },
    {
      question: '¿Qué flag de ansible-pull especifica la URL del repositorio Git a clonar?',
      options: ['-r', '-U', '--repo', '--git-url'],
      correctIndex: 1,
      explanation: '-U (--url) es el flag obligatorio de ansible-pull que especifica la URL del repositorio Git. Sin este flag, el comando no puede ejecutarse.',
    },
    {
      question: '¿Cuál es la principal limitación del modelo pull respecto al modelo push?',
      options: [
        'No soporta variables',
        'No hay feedback inmediato al operador sobre el resultado de la ejecución en cada host',
        'Solo funciona con roles',
        'Requiere Python 3 en el control node',
      ],
      correctIndex: 1,
      explanation: 'En el modelo pull, cada host se autoconfigura de forma asíncrona. El operador no recibe feedback inmediato sobre si la ejecución fue exitosa o falló, a menos que implemente un sistema de reporte externo.',
    },
  ],
  troubleshooting: [
    {
      error: 'fatal: repository \'https://github.com/...\' not found',
      cause: 'La URL del repositorio es incorrecta, el repositorio es privado y no se proporcionaron credenciales, o la URL cambió.',
      fix: 'Verificá la URL del repositorio. Para repos privados, usá SSH con --private-key o configurá credenciales. Con HTTPS, usá tokens de acceso personal.',
    },
    {
      error: 'error: Your local changes to the following files would be overwritten by merge',
      cause: 'ansible-pull intenta hacer git pull pero hay cambios locales en el directorio de trabajo que entran en conflicto.',
      fix: 'ansible-pull usa --force por defecto en nuevas versiones. Si persiste, eliminá el directorio de trabajo con -d /ruta y dejá que lo clone de cero.',
    },
    {
      error: 'Could not find or access playbook: local.yml',
      cause: 'El playbook especificado no existe en la raíz del repositorio clonado.',
      fix: 'Verificá que el archivo local.yml existe en la raíz del repositorio. Podés especificar una ruta relativa diferente como último argumento de ansible-pull.',
    },
  ],
};
