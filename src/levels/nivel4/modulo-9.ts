import type { ModuleContent } from '../types';

export const nivel4Mod9: ModuleContent = {
  levelId: 4,
  moduleId: 9,
  title: 'ansible-console — Consola interactiva',
  objective: 'Usar ansible-console para ejecutar módulos interactivamente en hosts remotos como si fuera una sesión de shell.',
  duration: '30 minutos',
  objectives: [
    'Abrir una sesión de ansible-console contra un grupo de hosts',
    'Ejecutar módulos interactivamente y cambiar de grupo con cd',
    'Probar módulos antes de incorporarlos a un playbook',
    'Usar ansible-console para troubleshooting en múltiples servidores simultáneamente',
  ],
  steps: [
    {
      title: 'Uso de ansible-console',
      body: `
        <p>ansible-console abre una consola interactiva donde podés ejecutar módulos de Ansible en hosts remotos de forma iterativa, sin tener que escribir el comando completo cada vez.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ansible-console-sesion.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Abrir consola contra el grupo servidores_web
ansible-console servidores_web -i inventario/

# Dentro de la consola:
# username@servidores_web (2)[f:5]$ ping
# username@servidores_web (2)[f:5]$ setup filter=ansible_distribution
# username@servidores_web (2)[f:5]$ command uptime

# Cambiar el grupo target dentro de la consola
# cd bases_de_datos

# Ver hosts del grupo actual
# list

# Salir
# exit

# Con become habilitado
ansible-console servidores_web -b</code></pre>
        </div>
        <div class="tip-box">
          <span class="box-icon">💡</span>
          <div class="box-content"><strong>Cuándo usarlo:</strong> ansible-console es ideal para explorar el estado de un grupo de hosts, probar módulos antes de escribirlos en un playbook, o realizar tareas de troubleshooting interactivo en múltiples servidores.</div>
        </div>
        <div class="next-chapter-box">
          <div class="next-chapter-arrow">→</div>
          <div>
            <div class="next-chapter-label">A continuación</div>
            <div class="next-chapter-title">Nivel 5 — Playbooks en Profundidad</div>
            <div class="next-chapter-desc">Con el tooling dominado, profundizás en la anatomía completa de playbooks: plays, tasks, handlers, tags, loops y blocks.</div>
          </div>
        </div>
      `
    }
  ],
  prerequisites: [
    'Completar el Módulo 8 del Nivel 4 — ansible-inventory',
  ],
  realWorldCase: 'Durante un incidente en producción, un SRE abre <code>ansible-console servidores_web -b</code> y ejecuta módulos interactivamente en todos los nodos simultáneamente para diagnosticar y mitigar el problema en tiempo real, sin necesidad de escribir un playbook de emergencia.',
  quiz: [
    {
      question: '¿Qué comando dentro de la consola de ansible-console cambia el grupo de hosts objetivo?',
      options: ['switch <grupo>', 'cd <grupo>', 'use <grupo>', 'target <grupo>'],
      correctIndex: 1,
      explanation: 'Dentro de ansible-console, el comando cd <grupo> cambia el grupo de hosts sobre el que se ejecutan los módulos, de forma similar a navegar directorios en una shell.',
    },
    {
      question: '¿Cuál es el caso de uso principal de ansible-console respecto a los comandos ad-hoc regulares?',
      options: [
        'ansible-console es más rápido que ansible ad-hoc',
        'Permite ejecutar múltiples módulos interactivamente sin reescribir el comando completo cada vez',
        'ansible-console soporta más módulos que ansible ad-hoc',
        'Solo ansible-console puede usar become',
      ],
      correctIndex: 1,
      explanation: 'ansible-console mantiene el contexto de conexión y el grupo objetivo entre comandos. Ideal para sesiones de exploración o troubleshooting donde ejecutás varios módulos seguidos sin repetir flags.',
    },
    {
      question: '¿Qué información muestra el prompt de ansible-console como "[f:5]"?',
      options: [
        'El número de forks (conexiones paralelas) configurado',
        'El número de fallos en la última ejecución',
        'El número de facts cargados',
        'El número de archivos en el inventario',
      ],
      correctIndex: 0,
      explanation: 'El prompt de ansible-console muestra usuario@grupo (cantidad_hosts)[f:forks]. El "[f:5]" indica el número de forks paralelos configurado, equivalente al flag -f de ansible.',
    },
  ],
  troubleshooting: [
    {
      error: 'ansible-console: command not found',
      cause: 'ansible-console no está en el PATH o la instalación de Ansible no incluye todos los comandos CLI.',
      fix: 'Verificá la instalación con pip show ansible. En algunas distribuciones se instala como paquete separado. Probá pip install ansible para la instalación completa.',
    },
    {
      error: 'No hosts matched the pattern inside console',
      cause: 'Se ejecutó ansible-console con un grupo que no existe en el inventario o se omitió -i con el inventario correcto.',
      fix: 'Verificá los grupos disponibles con ansible-inventory --graph antes de abrir la consola. Asegurate de pasar -i inventario/ al iniciar ansible-console.',
    },
    {
      error: 'EOF when reading a line (consola se cierra inesperadamente)',
      cause: 'ansible-console recibió EOF en stdin, lo que ocurre cuando se intenta usar en pipelines o scripts no interactivos.',
      fix: 'ansible-console está diseñado solo para uso interactivo. Para scripts automatizados, usá comandos ansible ad-hoc normales en su lugar.',
    },
  ],
};
