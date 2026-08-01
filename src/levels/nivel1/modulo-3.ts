import type { ModuleContent } from '../types';

export const nivel1Mod3: ModuleContent = {
  levelId: 1,
  moduleId: 3,
  title: 'Características clave de Ansible',
  objective: 'Comprender en profundidad las cinco características que diferencian a Ansible: agentless, idempotencia, declarativo, push model, y SSH nativo.',
  duration: '1.5 horas',
  objectives: [
    'Verificar la idempotencia ejecutando el mismo playbook dos veces',
    'Distinguir entre código imperativo y declarativo con ejemplos concretos',
    'Explicar las ventajas del modelo push sobre el modelo pull',
    'Identificar casos donde Ansible no es la herramienta más apropiada',
  ],
  steps: [
    {
      title: 'Las cinco características fundamentales',
      body: `
        <p>Ansible tiene cinco características de diseño que lo distinguen de otras herramientas de automatización. Entenderlas a fondo te ayuda a usarlo de manera correcta y a diseñar playbooks robustos.</p>
      `
    },
    {
      title: '1. Agentless — sin agentes',
      body: `
        <p>El diseño agentless significa que no hay ningún software adicional corriendo en los managed nodes. Comparado con herramientas que requieren agentes:</p>
        <ul>
          <li><strong>Sin overhead</strong>: ningún proceso consumiendo CPU/RAM constantemente en cada servidor</li>
          <li><strong>Sin superficie de ataque adicional</strong>: menos software = menos vulnerabilidades potenciales</li>
          <li><strong>Sin problema de "huevo y gallina"</strong>: no necesitás automatización para instalar tu herramienta de automatización</li>
          <li><strong>Sin gestión de versiones de agentes</strong>: mantener 1.000 agentes actualizados es un problema en sí mismo</li>
          <li><strong>Funciona desde el día 1</strong>: cualquier servidor con SSH y Python ya es gestionable</li>
        </ul>
        <div class="highlight-box">
          <p>La ventaja más práctica: podés incorporar un servidor existente a la gestión de Ansible sin ninguna preparación previa. Solo necesitás acceso SSH.</p>
        </div>
      `
    },
    {
      title: '2. Idempotencia — el resultado siempre es el mismo',
      body: `
        <p>Idempotencia significa que ejecutar el mismo playbook múltiples veces produce exactamente el mismo resultado que ejecutarlo una sola vez. Ansible no "aplica" cambios, sino que "asegura el estado deseado".</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">idempotencia-ejemplo.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml"># Este playbook es idempotente — podés ejecutarlo 100 veces
- name: Asegurar que nginx esté instalado y corriendo
hosts: servidores_web
become: true
tasks:
  - name: Instalar nginx
    ansible.builtin.apt:
      name: nginx
      state: present       # "que esté presente" — si ya está, no hace nada

  - name: Iniciar nginx
    ansible.builtin.service:
      name: nginx
      state: started       # "que esté started" — si ya corre, no hace nada

# Primera ejecución: changed=2 (instaló + inició)
# Segunda ejecución:  changed=0 (ya estaba instalado y corriendo)
# Décima ejecución:   changed=0 (mismo resultado)</code></pre>
        </div>
        <div class="analogy-box">
          <div class="analogy-box-header">💡 Analogía</div>
          <p>La idempotencia en Ansible es como pintar una pared de blanco. Si la pared ya es blanca, pasarle la brocha no cambia nada. Si es roja, la pinta de blanco. El resultado final es siempre el mismo sin importar el estado inicial.</p>
        </div>
        <div class="tech-term-box">
          <div class="tech-term-label">En términos técnicos</div>
          La idempotencia en Ansible se implementa a nivel de módulo: cada módulo compara el estado actual del sistema con el estado deseado antes de hacer cualquier cambio. Si el estado ya es el correcto, el módulo retorna <code>changed: false</code> sin ejecutar ninguna acción.
        </div>
        <div class="warning-box">
          <span class="box-icon">⚠️</span>
          <div class="box-content">No todos los módulos son idempotentes. El módulo <code>shell</code> y <code>command</code> NO son idempotentes por defecto — ejecutan el comando cada vez. Para hacerlos idempotentes, usá <code>creates</code>, <code>removes</code>, o <code>changed_when</code>.</div>
        </div>
      `
    },
    {
      title: '3. Declarativo — describís el estado, no los pasos',
      body: `
        <p>En programación imperativa describís los pasos. En programación declarativa describís el resultado deseado. Ansible es declarativo.</p>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">imperativo-vs-declarativo.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Enfoque IMPERATIVO (script bash) — describes los pasos
if ! dpkg -l nginx &>/dev/null; then
  apt update
  apt install -y nginx
fi
if ! systemctl is-active nginx; then
  systemctl start nginx
fi
systemctl enable nginx

# Problema: este script asume el estado actual del sistema.
# Si nginx ya está instalado pero deshabilitado, el script
# podría no manejar todos los casos correctamente.</code></pre>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">declarativo.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml"># Enfoque DECLARATIVO (Ansible) — describes el estado final
- name: Asegurar que nginx esté instalado, corriendo y habilitado
hosts: servidores_web
become: true
tasks:
  - ansible.builtin.apt:
      name: nginx
      state: present

  - ansible.builtin.service:
      name: nginx
      state: started
      enabled: true

# Ansible determina los pasos necesarios.
# No importa el estado actual — el resultado es siempre el mismo.</code></pre>
        </div>
        <div class="analogy-box">
          <div class="analogy-box-header">💡 Analogía</div>
          <p>Es como pedirle a un arquitecto que construya una casa con 3 habitaciones. Vos describís el resultado (casa con 3 habitaciones), no los pasos (comprar ladrillos, mezclar cemento). El arquitecto decide cómo lograrlo.</p>
        </div>
        <div class="tech-term-box">
          <div class="tech-term-label">En términos técnicos</div>
          El modelo declarativo de Ansible describe el estado final deseado del sistema, no los pasos para llegar a él. El motor de ejecución de Ansible traduce esa descripción en acciones concretas dependiendo del estado actual de cada host, garantizando convergencia.
        </div>
      `
    },
    {
      title: '4. Push model — el control node envía',
      body: `
        <p>Ansible usa un modelo push: el control node envía las instrucciones a los managed nodes. Alternativas como Puppet y Chef usan un modelo pull (los agentes descargan periódicamente su configuración).</p>
        <p><strong>Ventajas del modelo push:</strong></p>
        <ul>
          <li>Cambios inmediatos — no esperar el próximo ciclo de pull (30 min en Puppet por defecto)</li>
          <li>Control explícito — nada cambia sin que vos lo ordenes</li>
          <li>Orden garantizado — los hosts se configuran en el orden que definís</li>
          <li>Feedback inmediato — ves el resultado mientras se ejecuta</li>
        </ul>
        <div class="tip-box">
          <span class="box-icon">💡</span>
          <div class="box-content"><strong>ansible-pull</strong> es la excepción: permite que los managed nodes descarguen y ejecuten playbooks de un repositorio Git. Útil para configuraciones de desktops o cuando querés escalar a miles de hosts sin un control node centralizado.</div>
        </div>
      `
    },
    {
      title: '5. SSH nativo — sin reinventar la rueda',
      body: `
        <p>Ansible usa OpenSSH, el estándar de facto para acceso seguro a servidores Linux. No reinventa el transporte — usa lo que ya existe.</p>
        <p><strong>Ventajas de SSH nativo:</strong></p>
        <ul>
          <li>Mismo mecanismo de autenticación que usás a diario</li>
          <li>Mismas claves SSH que ya tenés configuradas</li>
          <li>Mismo manejo de <code>known_hosts</code></li>
          <li>Sin puertos adicionales que abrir en el firewall (solo 22)</li>
          <li>Soporte nativo de SSH multiplexing para mejorar performance</li>
          <li>Funciona a través de bastiones/jump hosts con <code>ProxyJump</code></li>
        </ul>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
          <pre class="language-ini"><code class="language-ini">[ssh_connection]
# Ansible usa las mismas opciones SSH que usarías en la línea de comandos
ssh_args = -o ControlMaster=auto -o ControlPersist=60s

# Para acceder via bastion host
# ansible_ssh_common_args = -o ProxyJump=bastion.ejemplo.com</code></pre>
        </div>
      `
    },
    {
      title: 'Cómo interactúan estas características',
      body: `
        <p>Estas cinco características no son independientes — se refuerzan mutuamente:</p>
        <ul>
          <li><strong>Agentless</strong> es posible gracias a <strong>SSH nativo</strong></li>
          <li><strong>Idempotencia</strong> es lo que hace útil al modelo <strong>declarativo</strong></li>
          <li><strong>Push model</strong> + <strong>idempotencia</strong> = podés ejecutar el playbook cada vez que cambia la configuración sin miedo</li>
        </ul>
        <div class="highlight-box">
          <p>El resultado de estas características combinadas: podés tener tu infraestructura en Git, ejecutar el playbook en cada commit de la rama main, y estar seguro de que la infraestructura siempre coincide con el repositorio.</p>
        </div>
      `
    },
    {
      title: 'Limitaciones de Ansible',
      body: `
        <p>Ansible no es perfecto para todo. Conocer sus limitaciones es tan importante como conocer sus fortalezas:</p>
        <ul>
          <li><strong>No hay estado persistente</strong>: Ansible no sabe qué cambió entre ejecuciones. Terraform mantiene un state file; Ansible no.</li>
          <li><strong>Performance en escala</strong>: gestionar 10.000 hosts con forks requiere planificación. Cada tarea abre conexiones SSH.</li>
          <li><strong>Debugging difícil</strong>: cuando un playbook falla en el paso 15 de 30, reiniciarlo desde el paso 16 requiere configuración.</li>
          <li><strong>No es un lenguaje de programación</strong>: lógica compleja en playbooks puede volverse frágil. Para lógica muy compleja, mejor escribir un módulo Python.</li>
          <li><strong>Orden de ejecución</strong>: en el modo "free", el orden de tareas no es garantizado entre hosts.</li>
        </ul>
      `
    },
    {
      title: 'Cuándo usar (y cuándo no usar) Ansible',
      body: `
        <table class="comparison-table">
          <thead>
            <tr><th>Usar Ansible para...</th><th>Considerar alternativas para...</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Configuración de SO y middleware</td>
              <td>Provisioning de infraestructura cloud → Terraform</td>
            </tr>
            <tr>
              <td>Deployment de aplicaciones</td>
              <td>Gestión de contenedores a escala → Kubernetes</td>
            </tr>
            <tr>
              <td>Hardening de seguridad</td>
              <td>Configuración de red de alto nivel → NAPALM/Netmiko</td>
            </tr>
            <tr>
              <td>Automatización de tareas ad-hoc</td>
              <td>Workflows muy complejos → Rundeck/Airflow</td>
            </tr>
            <tr>
              <td>Orchestration de deploys</td>
              <td>Inmutable infrastructure → Packer + AMIs</td>
            </tr>
          </tbody>
        </table>
      `
    },
    {
      title: 'Resumen',
      body: `
        <div class="highlight-box">
          <p>Las cinco características de Ansible — agentless, idempotencia, declarativo, push model, SSH nativo — no son solo marketing. Son decisiones de diseño que se refuerzan mutuamente y que hacen que Ansible sea fiable, predecible y fácil de razonar.</p>
        </div>
        <div class="lab-box">
          <div class="lab-box-header">🧪 Laboratorio</div>
          <div class="lab-section">
            <div class="lab-section-title">Objetivo</div>
            <p style="font-size:0.9rem;color:var(--color-text-muted);line-height:1.65">Verificar la idempotencia en la práctica ejecutando el mismo playbook dos veces y comparando los resultados.</p>
          </div>
          <div class="lab-section">
            <div class="lab-section-title">Pasos</div>
            <ol>
              <li>Creá un playbook que instale nginx y lo inicie</li>
              <li>Ejecutalo por primera vez: anotá cuántas tareas dicen <code>changed</code></li>
              <li>Ejecutalo por segunda vez: todas las tareas deberían decir <code>ok</code></li>
              <li>Detené nginx manualmente con <code>systemctl stop nginx</code></li>
              <li>Ejecutalo por tercera vez: observá cuál tarea dice <code>changed</code> ahora</li>
            </ol>
          </div>
          <div class="lab-section">
            <div class="lab-section-title">Verificación</div>
            <ul>
              <li>Segunda ejecución: <code>changed=0</code> en todas las tareas</li>
              <li>Tercera ejecución (después de detener nginx): solo la tarea de <code>service</code> dice <code>changed=1</code></li>
            </ul>
          </div>
          <div class="lab-section">
            <div class="lab-section-title">Resultado esperado</div>
            <div class="lab-expected">
              <div class="lab-expected-item"><span class="lab-expected-check">✓</span> La primera ejecución muestra <code>changed=2</code> (o más)</div>
              <div class="lab-expected-item"><span class="lab-expected-check">✓</span> La segunda ejecución muestra <code>changed=0</code> en todas las tareas</div>
              <div class="lab-expected-item"><span class="lab-expected-check">✓</span> Identificaste al menos una tarea que NO sería idempotente con <code>shell</code> o <code>command</code></div>
            </div>
          </div>
          <div class="lab-section">
            <div class="lab-section-title">Preguntas para reflexionar</div>
            <ul>
              <li>¿Por qué el módulo <code>shell</code> no es idempotente por defecto?</li>
              <li>¿Cómo usarías <code>changed_when: false</code> para suprimir un cambio que no es realmente un cambio?</li>
            </ul>
          </div>
        </div>
        <div class="next-chapter-box">
          <div class="next-chapter-arrow">→</div>
          <div>
            <div class="next-chapter-label">A continuación</div>
            <div class="next-chapter-title">Instalación de Ansible</div>
            <div class="next-chapter-desc">Las bases teóricas están. Ahora instalamos Ansible en el control node y verificamos que todo funciona.</div>
          </div>
        </div>
      `
    }
  ],
  prerequisites: [
    'Haber completado el Módulo 1 (Historia y contexto de Ansible)',
    'Haber completado el Módulo 2 (Arquitectura agentless)',
    'Entender la diferencia entre Control Node y Managed Node',
  ],
  quiz: [
    {
      question: '¿Qué significa que Ansible sea "agentless"?',
      options: [
        'Que Ansible no requiere Python en el Control Node',
        'Que no hay ningún software adicional corriendo permanentemente en los Managed Nodes',
        'Que Ansible no usa agentes de monitoreo',
        'Que no se necesita un archivo de inventario',
      ],
      correctIndex: 1,
      explanation: 'Agentless significa que los Managed Nodes no requieren ningún daemon o agente instalado. Ansible se conecta via SSH, copia un módulo Python temporalmente, lo ejecuta, y borra el archivo. No queda ningún proceso corriendo.',
    },
    {
      question: '¿Cuál es la diferencia entre un enfoque imperativo y uno declarativo en Ansible?',
      options: [
        'El enfoque imperativo es más rápido que el declarativo',
        'El imperativo describe los pasos a seguir; el declarativo describe el estado final deseado',
        'El declarativo requiere más código que el imperativo',
        'No hay diferencia práctica entre ambos enfoques',
      ],
      correctIndex: 1,
      explanation: 'Ansible es declarativo: describís "quiero que nginx esté instalado y corriendo" — no "ejecutá apt install, luego systemctl start". Ansible determina qué pasos ejecutar según el estado actual del sistema para alcanzar el estado deseado.',
    },
    {
      question: '¿Cuándo el módulo shell o command NO es idempotente?',
      options: [
        'Nunca, todos los módulos de Ansible son idempotentes por diseño',
        'Solo cuando se usa con become: true',
        'Cuando no se especifica creates, removes, o changed_when para controlar cuándo se considera que "cambió"',
        'Solo en la primera ejecución del playbook',
      ],
      correctIndex: 2,
      explanation: 'Los módulos shell y command ejecutan el comando cada vez, sin verificar si el resultado ya existe. Para hacerlos idempotentes debés usar: creates (si el archivo ya existe, no ejecuta), removes (si el archivo no existe, no ejecuta), o changed_when: false (nunca reporta cambio).',
    },
  ],
  realWorldCase: 'Un equipo de DevOps aplica el mismo playbook de hardening (deshabilitar servicios, configurar firewall, instalar parches) a 500 servidores cada lunes a las 3 AM. Gracias a la idempotencia, si el servidor ya está en el estado correcto no ocurre ningún cambio — y gracias al modelo push, el equipo dispara la ejecución desde un único lugar sin depender de que los agentes en cada servidor hagan pull.',
  troubleshooting: [
    {
      error: 'El playbook muestra "changed" en cada ejecución aunque nada debería cambiar',
      cause: 'Alguna tarea usa el módulo shell o command sin changed_when, o usa un módulo que no es idempotente por naturaleza.',
      fix: 'Revisá cada tarea que reporta changed. Si usa shell/command, agregá changed_when: false si el comando es de consulta, o creates/removes si crea o elimina un archivo.',
    },
    {
      error: 'ansible-playbook no encuentra el módulo — "module not found"',
      cause: 'Se usa el nombre corto del módulo (ping) en vez del FQCN (ansible.builtin.ping) y la colección no está instalada o en el search path.',
      fix: 'Usá el nombre completo del módulo (ansible.builtin.ping, ansible.builtin.apt). Instalá colecciones externas con: ansible-galaxy collection install nombre.coleccion',
    },
    {
      error: 'WARNING: Consider using the "become" option instead of running ssh as root',
      cause: 'El usuario remoto es root directamente en lugar de usar un usuario normal con sudo.',
      fix: 'Cambiá el remote_user a un usuario sin privilegios y agregá become: true a las tareas que lo requieren. Evitá conectarte como root directamente.',
    },
  ],
};
