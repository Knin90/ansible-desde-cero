import type { ModuleContent } from '../types';

export const nivel2Mod4: ModuleContent = {
  levelId: 2,
  moduleId: 4,
  title: 'Action Plugins — Lógica local vs remota',
  objective: 'Entender qué son los Action Plugins y cómo deciden dónde se ejecuta la lógica de cada módulo.',
  duration: '1 hora',
  objectives: [
    'Explicar la diferencia entre un módulo y su Action Plugin asociado',
    'Identificar qué módulos ejecutan lógica en el control node (template, copy, fetch)',
    'Entender por qué template renderiza Jinja2 localmente antes de transferir el resultado',
    'Reconocer los Action Plugins como el principal punto de extensibilidad de Ansible',
  ],
  prerequisites: [
    'Nivel 2, Módulo 3: Strategy Plugin — Control de ejecución',
  ],
  steps: [
    {
      title: 'Qué es un Action Plugin',
      body: `
        <p>Cada módulo de Ansible tiene un Action Plugin asociado que se ejecuta en el nodo de control (tu máquina). El Action Plugin decide qué parte del trabajo se hace localmente y qué parte se transfiere y ejecuta en el host remoto.</p>
        <p>Para la mayoría de los módulos (como <code>ansible.builtin.package</code>), el Action Plugin simplemente transfiere el módulo Python al host y lo ejecuta. Pero para módulos como <code>template</code> o <code>copy</code>, el Action Plugin hace trabajo real localmente.</p>
      `
    },
    {
      title: 'Ejemplos de Action Plugins con lógica local',
      body: `
        <p><strong>template</strong>: el Action Plugin renderiza el archivo Jinja2 en el nodo de control (donde están las variables), luego transfiere el archivo renderizado al host remoto. Nunca transfiere el template original ni las variables al host.</p>
        <p><strong>copy</strong>: calcula el checksum del archivo localmente, lo compara con el checksum del host remoto (si existe), y solo transfiere si son diferentes.</p>
        <p><strong>fetch</strong>: trae un archivo del host remoto al nodo de control.</p>
        <p><strong>include_tasks / import_tasks</strong>: son puramente locales — leen y procesan archivos YAML sin ninguna conexión remota.</p>
        <div class="tip-box">
          <span class="box-icon">💡</span>
          <div class="box-content"><strong>Implicación práctica:</strong> los Action Plugins son el punto de extensión más poderoso de Ansible. Podés crear módulos que hagan cualquier cosa en el nodo de control antes o después de la ejecución remota.</div>
        </div>
        <div class="next-chapter-box">
          <div class="next-chapter-arrow">→</div>
          <div>
            <div class="next-chapter-label">A continuación</div>
            <div class="next-chapter-title">Callback Plugins</div>
            <div class="next-chapter-desc">Controlás cómo Ansible formatea y envía la salida: terminal, JSON, Slack, correo y métricas.</div>
          </div>
        </div>
      `
    }
  ],
  quiz: [
    {
      question: '¿Por qué el módulo "template" no transfiere el archivo .j2 original al host remoto?',
      options: [
        'Porque Jinja2 no está instalado en los hosts remotos por defecto',
        'Porque el Action Plugin renderiza el template en el nodo de control donde viven las variables, y transfiere solo el resultado ya renderizado',
        'Porque transferir archivos .j2 no está soportado por el protocolo SSH',
        'Porque es una optimización de rendimiento para reducir el tamaño de la transferencia',
      ],
      correctIndex: 1,
      explanation: 'El Action Plugin de "template" corre en el nodo de control donde el contexto completo de variables (hostvars, facts, group_vars) está disponible. Renderizar remotamente requeriría serializar y transferir cientos de variables. Además, algunas variables (como lookup() de archivos locales) son imposibles de evaluar remotamente.',
    },
    {
      question: '¿Qué Action Plugin es "puramente local" — nunca establece conexión SSH al host remoto?',
      options: [
        'ansible.builtin.copy',
        'ansible.builtin.fetch',
        'ansible.builtin.import_tasks',
        'ansible.builtin.package',
      ],
      correctIndex: 2,
      explanation: '"import_tasks" e "include_tasks" son procesados completamente por el Action Plugin localmente: leen archivos YAML del nodo de control y los insertan en el flujo de ejecución. No hay conexión SSH ni transferencia de módulos. "copy", "fetch" y "package" todos requieren conexión remota.',
    },
    {
      question: 'Un módulo custom necesita leer un certificado de una Vault local ANTES de transferirlo al host remoto. ¿Dónde debería implementarse esa lógica?',
      options: [
        'En el módulo Python que corre en el host remoto',
        'En el Action Plugin que corre en el nodo de control, antes de la ejecución remota',
        'En un handler que se ejecuta después de la tarea',
        'En una tarea "delegate_to: localhost" separada',
      ],
      correctIndex: 1,
      explanation: 'El Action Plugin es el lugar correcto para lógica pre/post-ejecución en el nodo de control: autenticación con Vault, descifrado de secretos, procesamiento local de archivos. El módulo Python solo debería recibir el dato ya procesado y aplicarlo en el host remoto.',
    },
  ],
  realWorldCase: 'Un equipo de seguridad escribe un Action Plugin custom que intercepta el módulo "copy" para archivos con extensión ".pem": antes de transferir, verifica que el certificado no está vencido y que el hash coincide con el registro en su CA interna. Si la verificación falla, aborta la tarea con un mensaje descriptivo — todo sin modificar el módulo original ni los playbooks existentes.',
  troubleshooting: [
    {
      error: 'El módulo "template" genera el archivo correcto localmente pero falla al copiarlo al host',
      cause: 'El Action Plugin de "template" tiene dos fases: (1) renderizar Jinja2 localmente y (2) transferir via copy. La falla en la transferencia generalmente indica permisos insuficientes en el directorio destino del host remoto, o falta de espacio en disco.',
      fix: 'Verificá permisos con "ansible host -m shell -a \'ls -la /directorio/destino/\'". Comprobá espacio con "df -h". Si el problema es el propietario del directorio, usá "become: true" en la tarea de template o pre-crea el directorio con los permisos correctos.',
    },
    {
      error: 'ansible.builtin.fetch no trae el archivo — "msg": "file not found"',
      cause: 'El Action Plugin de "fetch" primero verifica que el archivo existe en el host remoto antes de transferirlo. Si la ruta es incorrecta o el archivo no existe en ese host, falla. También puede fallar si el usuario remoto no tiene permisos de lectura sobre el archivo.',
      fix: 'Verificá la existencia con "ansible host -m stat -a \'path=/ruta/al/archivo\'". Usá "fail_on_missing: false" si querés que la tarea continue cuando el archivo no existe. Para archivos de root, asegurate de usar "become: true".',
    },
    {
      error: 'Un Action Plugin custom no se carga — "ERROR! no action detected in task"',
      cause: 'Ansible busca Action Plugins en rutas específicas: action_plugins/ relativo al playbook, a los roles, o en las rutas configuradas en DEFAULT_ACTION_PLUGIN_PATH en ansible.cfg. Si el archivo no está en ninguna de esas rutas o tiene el nombre incorrecto, no se detecta.',
      fix: 'Verificá que el archivo está en "action_plugins/" relativo a tu playbook. El nombre del archivo debe ser "nombre_del_modulo.py" (sin "action_" prefix). Confirmá con "ansible-doc -t action -l" que el plugin aparece en la lista de plugins disponibles.',
    },
  ],
};
