import type { ModuleContent } from './types';

export const nivel1Modules: ModuleContent[] = [
  {
    levelId: 1,
    moduleId: 1,
    title: 'Historia y contexto de Ansible',
    objective: 'Entender por qué Ansible fue creado, cómo evolucionó, y por qué se convirtió en la herramienta de automatización más popular del mundo.',
    duration: '1 hora',
    objectives: [
      'Explicar el problema que Ansible resolvió en 2012 comparado con Puppet y Chef',
      'Describir los hitos clave de la evolución de Ansible hasta la actualidad',
      'Identificar cuándo usar Ansible y cuándo preferir Terraform o Kubernetes',
    ],
    steps: [
      {
        title: 'El problema que Ansible resolvió',
        body: `
          <p>En 2012, administrar 100 servidores era una pesadilla. Los equipos de operaciones tenían varias opciones, ninguna ideal:</p>
          <ul>
            <li><strong>Scripts Bash inconsistentes</strong>: cada sysadmin tenía sus propios scripts, imposibles de mantener en equipo</li>
            <li><strong>Puppet</strong>: requería instalar un agente en cada servidor, una DSL propia (Ruby), y una infraestructura de masters/agents compleja</li>
            <li><strong>Chef</strong>: similar a Puppet, curva de aprendizaje muy alta, necesitaba programadores Ruby</li>
            <li><strong>SaltStack</strong>: más flexible pero también basado en agentes y complejo de operar</li>
            <li><strong>CFEngine</strong>: poderoso pero con una sintaxis críptica</li>
          </ul>
          <div class="analogy-box">
            <div class="analogy-box-header">💡 Analogía</div>
            <p>Imaginate que tenés 200 empleados y querés darles a todos la misma instrucción. Podés llamar a cada uno por teléfono (scripts manuales), o podés enviar un memorando a todos a la vez y que ellos lo apliquen (Puppet/Chef — modelo pull), o podés tener un mensajero que va a entregar el mensaje a cada uno directamente cuando vos lo ordenés (Ansible — modelo push).</p>
          </div>
          <div class="tech-term-box">
            <div class="tech-term-label">En términos técnicos</div>
            Ansible usa un modelo push: el control node inicia activamente la conexión SSH con cada managed node, copia el módulo Python a <code>/tmp</code>, lo ejecuta y recibe el resultado JSON. No hay ningún daemon esperando órdenes en el servidor.
          </div>
          <div class="highlight-box">
            <p><strong>El patrón común:</strong> todas estas herramientas requerían agentes instalados en los servidores, lenguajes de configuración propios (DSL), o ambos. El equipo de operaciones necesitaba aprender un nuevo lenguaje solo para automatizar su trabajo.</p>
          </div>
        `
      },
      {
        title: 'Línea de tiempo de Ansible',
        body: `
          <ul>
            <li><strong>Febrero 2012</strong>: Michael DeHaan crea Ansible. Antes había trabajado en Cobbler (herramienta de provisioning) y en Func (sistema de gestión remota). Quería una herramienta sin agentes, usando SSH nativo.</li>
            <li><strong>2012–2014</strong>: crecimiento orgánico en la comunidad open source. La simplicidad de YAML atrae a sysadmins que no eran programadores.</li>
            <li><strong>2013</strong>: se lanza Ansible Galaxy, el repositorio de roles compartidos por la comunidad.</li>
            <li><strong>2014</strong>: AnsibleWorks (la empresa) recibe $6M en financiamiento Series A.</li>
            <li><strong>Octubre 2015</strong>: Red Hat adquiere Ansible por aproximadamente $150 millones. En ese momento Ansible tenía más de 1.000 contribuidores y era el proyecto de automatización de infraestructura más activo en GitHub.</li>
            <li><strong>2019</strong>: Ansible se integra en Red Hat Enterprise Linux 8. AWX (la versión open source de Ansible Tower/AAP) se hace público.</li>
            <li><strong>2022</strong>: Ansible 6 introduce las collections como unidad principal de distribución de contenido.</li>
            <li><strong>2023–2024</strong>: Ansible Automation Platform 2.x, integración con Event-Driven Ansible, y el ecosistema de collections crece a miles de módulos.</li>
          </ul>
        `
      },
      {
        title: 'Comparación con herramientas alternativas',
        body: `
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Característica</th>
                <th>Ansible</th>
                <th>Puppet</th>
                <th>Chef</th>
                <th>SaltStack</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Agentes requeridos</td>
                <td class="winner">No (agentless)</td>
                <td>Sí (puppet agent)</td>
                <td>Sí (chef-client)</td>
                <td>Sí (salt-minion)</td>
              </tr>
              <tr>
                <td>Lenguaje de config</td>
                <td class="winner">YAML</td>
                <td>Puppet DSL (Ruby)</td>
                <td>Ruby (Recipes)</td>
                <td>YAML + Jinja2</td>
              </tr>
              <tr>
                <td>Curva de aprendizaje</td>
                <td class="winner">Baja</td>
                <td>Alta</td>
                <td>Muy alta</td>
                <td>Media-Alta</td>
              </tr>
              <tr>
                <td>Modelo push/pull</td>
                <td class="winner">Push (y pull con ansible-pull)</td>
                <td>Pull</td>
                <td>Pull</td>
                <td>Push y Pull</td>
              </tr>
              <tr>
                <td>Protocolo de transporte</td>
                <td class="winner">SSH nativo</td>
                <td>HTTPS + cert custom</td>
                <td>HTTPS</td>
                <td>ZeroMQ / SSH</td>
              </tr>
              <tr>
                <td>Requisito en hosts</td>
                <td class="winner">Solo Python 3</td>
                <td>Puppet agent</td>
                <td>Chef client</td>
                <td>Python + ZMQ</td>
              </tr>
            </tbody>
          </table>
        `
      },
      {
        title: 'Por qué Ansible ganó la batalla',
        body: `
          <p>Ansible creció más rápido que sus competidores por varias razones concretas:</p>
          <ol>
            <li><strong>Zero barrier to entry</strong>: instalar Ansible en el control node con <code>pip install ansible</code> y ya podés gestionar servidores. No hay nada que instalar en los hosts.</li>
            <li><strong>YAML es accesible</strong>: un sysadmin sin experiencia en programación puede leer un playbook y entender qué hace. Con Puppet o Chef necesitabas entender Ruby.</li>
            <li><strong>Usa infraestructura existente</strong>: SSH ya está instalado en todos los servidores Linux. Ansible no agrega nueva infraestructura de red ni puertos a abrir.</li>
            <li><strong>Idempotencia por defecto</strong>: podés ejecutar el mismo playbook 100 veces y el resultado es el mismo. Esto es fundamental para automatización confiable.</li>
            <li><strong>Comunidad activa</strong>: Ansible Galaxy tiene miles de roles compartidos. No tenés que escribir todo desde cero.</li>
          </ol>
        `
      },
      {
        title: 'Ansible en el ecosistema DevOps',
        body: `
          <p>Ansible ocupa un lugar específico en el ecosistema DevOps, complementando otras herramientas:</p>
          <ul>
            <li><strong>Terraform</strong> crea la infraestructura (VMs, redes, storage). <strong>Ansible</strong> la configura.</li>
            <li><strong>Jenkins / GitLab CI</strong> orchesta el pipeline. <strong>Ansible</strong> hace el deployment.</li>
            <li><strong>Docker / Kubernetes</strong> gestiona contenedores. <strong>Ansible</strong> gestiona el host y el cluster.</li>
            <li><strong>Nagios / Prometheus</strong> monitorea. <strong>Ansible</strong> remedia automáticamente (Event-Driven Ansible).</li>
          </ul>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content">Ansible no compite con Terraform — se complementan. Terraform para "infraestructura como código" (provisioning), Ansible para "configuración como código" (gestión del estado del SO).</div>
          </div>
        `
      },
      {
        title: 'Ansible en números (2024)',
        body: `
          <ul>
            <li>Más de <strong>20.000 commits</strong> en el repositorio principal</li>
            <li>Más de <strong>5.000 módulos</strong> disponibles en collections</li>
            <li>Más de <strong>10.000 roles</strong> en Ansible Galaxy</li>
            <li><strong>#1</strong> herramienta de automatización de infraestructura según múltiples encuestas</li>
            <li>Usada por <strong>Red Hat, NASA, Spotify, Twitter, Deutsche Telekom</strong> y miles de empresas más</li>
          </ul>
        `
      },
      {
        title: 'El modelo de negocio',
        body: `
          <p>Ansible tiene dos versiones:</p>
          <ul>
            <li><strong>Ansible community edition</strong>: completamente open source (GPLv3). Es lo que instalás con <code>pip install ansible</code>. Gratis para siempre.</li>
            <li><strong>Ansible Automation Platform (AAP)</strong>: la versión empresarial de Red Hat. Incluye AWX/Tower (UI web), RBAC (roles y permisos), logs centralizados, soporte certificado. Cuesta dinero.</li>
          </ul>
          <p>Para este curso usaremos la versión community edition. Todo lo que aprendas aplica directamente a AAP también.</p>
        `
      },
      {
        title: 'Michael DeHaan y la filosofía de Ansible',
        body: `
          <p>Michael DeHaan diseñó Ansible con una filosofía central: <em>"la herramienta de automatización debe ser tan simple que incluso alguien que no conoce Ansible pueda leer un playbook y entender qué está haciendo"</em>.</p>
          <p>Esta filosofía se refleja en cada decisión de diseño: usar YAML en lugar de una DSL, usar SSH en lugar de agentes, usar push en lugar de pull, documentar primero.</p>
          <div class="highlight-box">
            <p>En Ansible, el código auto-documentado no es una aspiración — es el objetivo de diseño. Si tu playbook necesita un README largo para ser entendido, algo está mal.</p>
          </div>
        `
      },
      {
        title: 'Recursos para profundizar',
        body: `
          <ul>
            <li><strong>ansible.com</strong> — sitio oficial con documentación completa</li>
            <li><strong>docs.ansible.com</strong> — referencia de módulos y plugins</li>
            <li><strong>github.com/ansible/ansible</strong> — código fuente</li>
            <li><strong>galaxy.ansible.com</strong> — roles y collections de la comunidad</li>
            <li>Blog post original de Michael DeHaan: "Ansible: A Simpler Way to Automate" (2012)</li>
          </ul>
        `
      },
      {
        title: 'Resumen',
        body: `
          <div class="highlight-box">
            <p>Ansible nació en 2012 como respuesta a la complejidad de Puppet y Chef. Su filosofía de agentless + YAML + SSH nativo lo llevó a convertirse en la herramienta de automatización más popular del mundo, adquirida por Red Hat en 2015 por $150M.</p>
          </div>
          <div class="lab-box">
            <div class="lab-box-header">🧪 Laboratorio</div>
            <div class="lab-section">
              <div class="lab-section-title">Objetivo</div>
              <p style="font-size:0.9rem;color:var(--color-text-muted);line-height:1.65">Reflexionar sobre el contexto histórico de Ansible y preparar el terreno para entender su arquitectura.</p>
            </div>
            <div class="lab-section">
              <div class="lab-section-title">Pasos</div>
              <ol>
                <li>Buscá en internet el blog post original de Michael DeHaan de 2012 sobre Ansible</li>
                <li>Identificá qué problemas concretos menciona que quería resolver</li>
                <li>Compará con las herramientas que usás actualmente en tu trabajo o proyecto</li>
              </ol>
            </div>
            <div class="lab-section">
              <div class="lab-section-title">Verificación</div>
              <ul>
                <li>Podés nombrar al menos 3 diferencias concretas entre Ansible y Puppet/Chef</li>
                <li>Entendés por qué Red Hat pagó $150M por una herramienta open source gratuita</li>
              </ul>
            </div>
            <div class="lab-section">
              <div class="lab-section-title">Resultado esperado</div>
              <div class="lab-expected">
                <div class="lab-expected-item"><span class="lab-expected-check">✓</span> Podés describir con tus palabras las diferencias entre Puppet, Chef y Ansible</div>
                <div class="lab-expected-item"><span class="lab-expected-check">✓</span> Identificaste al menos dos herramientas de automatización que usás o conocés</div>
                <div class="lab-expected-item"><span class="lab-expected-check">✓</span> Podés explicar por qué Ansible eligió SSH sobre agentes propios</div>
              </div>
            </div>
            <div class="lab-section">
              <div class="lab-section-title">Preguntas para reflexionar</div>
              <ul>
                <li>¿Qué herramienta de automatización usás actualmente? ¿Qué problemas tenés con ella?</li>
                <li>¿Cuándo NO usarías Ansible? ¿Cuál sería la alternativa?</li>
              </ul>
            </div>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">Arquitectura de Ansible</div>
              <div class="next-chapter-desc">Conocés la historia; ahora entendés cómo funciona internamente: control node, managed nodes, inventario, playbooks y SSH.</div>
            </div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 1,
    moduleId: 2,
    title: 'Arquitectura general de Ansible',
    objective: 'Entender los componentes principales de Ansible: control node, managed nodes, inventario, playbooks y el rol de SSH y Python.',
    duration: '1.5 horas',
    objectives: [
      'Identificar los cinco componentes principales de Ansible y su función',
      'Describir el flujo completo de ejecución de un módulo desde el control node',
      'Configurar el intérprete Python en el inventario según el sistema operativo',
      'Explicar por qué Ansible es agentless y qué implica para los managed nodes',
    ],
    steps: [
      {
        title: 'Los cinco componentes principales',
        body: `
          <p>La arquitectura de Ansible es simple. Hay cinco conceptos que debés entender desde el principio:</p>
          <ol>
            <li><strong>Control Node</strong>: tu máquina, donde Ansible está instalado</li>
            <li><strong>Managed Nodes</strong>: los servidores que Ansible gestiona</li>
            <li><strong>Inventory</strong>: la lista de managed nodes</li>
            <li><strong>Playbook</strong>: las instrucciones de configuración en YAML</li>
            <li><strong>SSH + Python</strong>: el mecanismo de transporte y ejecución</li>
          </ol>
          <div class="analogy-box">
            <div class="analogy-box-header">💡 Analogía</div>
            <p>Pensá en Ansible como una empresa de logística. Vos sos la central de operaciones (control node), el camión es SSH, los almacenes son los servidores (managed nodes), el manifiesto de carga es el playbook, y el directorio de destinos es el inventario.</p>
          </div>
          <div class="tech-term-box">
            <div class="tech-term-label">En términos técnicos</div>
            El control node es la máquina donde Ansible está instalado y desde donde se ejecutan los playbooks. Los managed nodes son los servidores remotos gestionados, que solo requieren Python 3 y acceso SSH. El inventario es el archivo que mapea hosts a grupos, y el playbook es el documento YAML que declara el estado deseado.
          </div>
          <p>El diagrama de abajo muestra cómo estos componentes se relacionan:</p>
        `
      },
      {
        title: 'Control Node — tu punto de comando',
        body: `
          <p>El control node es la máquina donde instalás Ansible. Desde aquí ejecutás todos los playbooks y comandos. El control node necesita:</p>
          <ul>
            <li>Python 3.9 o superior</li>
            <li>Ansible instalado via pip</li>
            <li>Acceso SSH a los managed nodes</li>
            <li>El inventario de hosts a gestionar</li>
          </ul>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Ansible no funciona como control node en Windows.</strong> En Windows, usás WSL (Windows Subsystem for Linux) o una VM Linux como control node. Los managed nodes sí pueden ser Windows (usando WinRM en lugar de SSH).</div>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalar-ansible.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># En el control node — instalar Ansible
pip3 install ansible

# Verificar instalación
ansible --version
# ansible [core 2.17.x]
#   config file = /etc/ansible/ansible.cfg
#   python version = 3.11.x
#   jinja version = 3.x</code></pre>
          </div>
        `
      },
      {
        title: 'Managed Nodes — los servidores gestionados',
        body: `
          <p>Los managed nodes son los servidores que Ansible configura. <strong>No necesitan tener Ansible instalado</strong> — solo necesitan:</p>
          <ul>
            <li>Python 3.x instalado (para ejecutar módulos)</li>
            <li>Un servidor SSH corriendo (normalmente OpenSSH)</li>
            <li>Un usuario con acceso SSH (con clave pública del control node)</li>
            <li>Acceso a <code>sudo</code> si las tareas requieren privilegios</li>
          </ul>
          <p>Esto es lo que hace a Ansible "agentless" — no hay ningún daemon ni servicio especial corriendo en el managed node.</p>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content">Python ya viene instalado en casi todas las distribuciones Linux modernas. En Ubuntu 22.04, Debian 12, RHEL 9, etc., Python 3 está disponible por defecto.</div>
          </div>
        `
      },
      {
        title: 'El Inventario — el registro de hosts',
        body: `
          <p>El inventario es el archivo donde listás los managed nodes. Puede ser tan simple como una lista de IPs, o tan complejo como un sistema dinámico que consulta AWS o Azure.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">inventario/hosts.ini</span></div>
            <pre class="language-ini"><code class="language-ini"># Hosts sueltos
servidor-backup.ejemplo.com

# Grupo de servidores web
[servidores_web]
web1.ejemplo.com
web2.ejemplo.com

# Grupo de bases de datos
[bases_de_datos]
db1.ejemplo.com  ansible_user=postgres

# Grupo de grupos
[produccion:children]
servidores_web
bases_de_datos</code></pre>
          </div>
          <p>El inventario se pasa a Ansible con <code>-i inventario/hosts.ini</code> o se configura en <code>ansible.cfg</code>.</p>
        `
      },
      {
        title: 'El Playbook — las instrucciones',
        body: `
          <p>Un playbook es un archivo YAML que describe el estado deseado de los managed nodes. Define <strong>qué</strong> tiene que estar configurado, no <strong>cómo</strong> configurarlo.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">mi-primer-playbook.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Configurar servidor web completo     # nombre descriptivo del play
  hosts: servidores_web                      # a qué grupo del inventario aplica
  become: true                               # usar sudo para las tareas

  tasks:                                     # lista de tareas a ejecutar
    - name: Instalar nginx
      ansible.builtin.apt:
        name: nginx
        state: present

    - name: Asegurar que nginx está corriendo
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true</code></pre>
          </div>
        `
      },
      {
        title: 'SSH como transporte',
        body: `
          <p>Ansible usa SSH para comunicarse con los managed nodes. El proceso es:</p>
          <ol>
            <li>Ansible abre una conexión SSH al managed node</li>
            <li>Copia el módulo Python (el código que ejecuta la tarea) a <code>/tmp</code> del host remoto</li>
            <li>Ejecuta el módulo Python en el host remoto</li>
            <li>Lee el resultado JSON que devuelve el módulo</li>
            <li>Borra el archivo temporal de <code>/tmp</code></li>
            <li>Cierra la conexión SSH (o la mantiene con multiplexing)</li>
          </ol>
          <div class="analogy-box">
            <div class="analogy-box-header">💡 Analogía</div>
            <p>SSH es el cartero de Ansible. Cada vez que Ansible necesita hacer algo en un servidor, le entrega el mensaje (el módulo Python), espera que lo ejecute, y trae la respuesta de vuelta.</p>
          </div>
          <div class="tech-term-box">
            <div class="tech-term-label">En términos técnicos</div>
            Ansible utiliza OpenSSH con multiplexing (ControlMaster) para reutilizar la misma conexión TCP entre múltiples tareas del mismo play, reduciendo la latencia. Cada módulo se transfiere como un archivo Python cifrado y se ejecuta con el intérprete configurado en <code>ansible_python_interpreter</code>.
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ver-conexion.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Ejecutar con máximo verbose para ver cada paso SSH
ansible all -m ping -vvv

# Verás algo como:
# <web1.ejemplo.com> SSH: EXEC ssh -C -o ControlMaster=auto ...
# <web1.ejemplo.com> PUT /tmp/ansible-tmp-xxx/ping.py
# <web1.ejemplo.com> EXEC python3 /tmp/ansible-tmp-xxx/ping.py
# <web1.ejemplo.com> FETCH /tmp/ansible-tmp-xxx/ping.py (deleted)</code></pre>
          </div>
        `
      },
      {
        title: 'Python en los hosts remotos',
        body: `
          <p>Python es el "motor" que ejecuta los módulos en el managed node. El intérprete Python debe ser detectable por Ansible.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">inventario/hosts.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">all:
  hosts:
    servidor-rhel:
      ansible_python_interpreter: /usr/bin/python3    # explícito
    servidor-ubuntu:
      ansible_python_interpreter: auto                # detección automática
    servidor-legacy:
      ansible_python_interpreter: /usr/bin/python     # Python 2 (no recomendado)</code></pre>
          </div>
          <p>Con <code>auto</code>, Ansible busca Python 3 en las rutas comunes. Desde Ansible 2.12, <code>auto</code> es el comportamiento por defecto.</p>
        `
      },
      {
        title: 'El flujo completo en acción',
        body: `
          <p>Cuando ejecutás <code>ansible-playbook sitio.yml -i inventory/hosts.ini</code>:</p>
          <ol>
            <li>Ansible parsea el playbook YAML y valida la sintaxis</li>
            <li>Carga el inventario y resuelve qué hosts aplicar</li>
            <li>Recopila facts de los hosts (a menos que lo deshabilites)</li>
            <li>Para cada tarea, determina qué módulo usar</li>
            <li>Copia el módulo a los hosts vía SSH y lo ejecuta</li>
            <li>Procesa el resultado JSON — ¿cambió algo? ¿falló?</li>
            <li>Si hay handlers notificados, los ejecuta al final del play</li>
            <li>Muestra el resumen del playbook (ok, changed, failed)</li>
          </ol>
          <div class="internal-flow">
            <div class="internal-flow-header">🔍 ¿Qué ocurre internamente cuando ejecutás ansible-playbook?</div>
            <div class="internal-flow-steps">
              <div class="flow-step">
                <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
                <div class="flow-step-body">
                  <div class="flow-step-title">Parser YAML</div>
                  <div class="flow-step-desc">Ansible usa PyYAML para parsear el playbook. Si hay errores de sintaxis, el proceso falla aquí antes de conectarse a ningún host.</div>
                </div>
              </div>
              <div class="flow-step">
                <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
                <div class="flow-step-body">
                  <div class="flow-step-title">Resolución de inventario</div>
                  <div class="flow-step-desc">El inventory plugin carga y parsea el inventario. Resuelve grupos, variables de grupo (group_vars/) y variables de host (host_vars/).</div>
                </div>
              </div>
              <div class="flow-step">
                <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
                <div class="flow-step-body">
                  <div class="flow-step-title">Recopilación de facts (gather_facts)</div>
                  <div class="flow-step-desc">Ansible ejecuta el módulo setup en cada host para recolectar información del sistema: OS, interfaces de red, memoria, CPU, etc. Estos facts están disponibles como variables en el playbook.</div>
                </div>
              </div>
              <div class="flow-step">
                <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
                <div class="flow-step-body">
                  <div class="flow-step-title">Ejecución de tareas (task loop)</div>
                  <div class="flow-step-desc">Para cada tarea: evalúa condiciones (when), resuelve variables Jinja2, selecciona el módulo, genera el código Python con los parámetros, y lo envía a los hosts (en paralelo si forks > 1).</div>
                </div>
              </div>
              <div class="flow-step">
                <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
                <div class="flow-step-body">
                  <div class="flow-step-title">Procesamiento del resultado</div>
                  <div class="flow-step-desc">Si changed=true, registra el cambio. Si notify está definido, marca el handler para ejecutar al final del play. Si failed=true, por defecto detiene la ejecución para ese host.</div>
                </div>
              </div>
              <div class="flow-step">
                <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
                <div class="flow-step-body">
                  <div class="flow-step-title">Ejecución de handlers</div>
                  <div class="flow-step-desc">Al finalizar el play, se ejecutan los handlers que fueron notificados durante la ejecución de tareas. Un handler se ejecuta una sola vez, sin importar cuántas tareas lo notificaron.</div>
                </div>
              </div>
              <div class="flow-step">
                <div class="flow-step-connector"><div class="flow-step-dot"></div></div>
                <div class="flow-step-body">
                  <div class="flow-step-title">Play recap</div>
                  <div class="flow-step-desc">Muestra el resumen final: ok=X changed=Y unreachable=Z failed=W. Si failed o unreachable > 0, el proceso termina con código de salida no-cero.</div>
                </div>
              </div>
            </div>
          </div>
        `
      },
      {
        title: 'Múltiples tipos de transporte',
        body: `
          <p>Aunque SSH es el transporte por defecto, Ansible soporta otros:</p>
          <ul>
            <li><strong>SSH</strong> (default): para Linux/macOS managed nodes</li>
            <li><strong>WinRM</strong>: para Windows managed nodes</li>
            <li><strong>Local</strong>: ejecutar en el control node mismo</li>
            <li><strong>Docker</strong>: ejecutar en contenedores</li>
            <li><strong>Podman</strong>: igual que Docker</li>
            <li><strong>Network CLI</strong>: para dispositivos de red (Cisco, Juniper)</li>
          </ul>
        `
      },
      {
        title: 'Resumen de arquitectura',
        body: `
          <div class="highlight-box">
            <p><strong>Control Node</strong> (tiene Ansible) → SSH → <strong>Managed Node</strong> (tiene Python) → ejecuta módulo → devuelve JSON → <strong>Control Node</strong> muestra resultado.</p>
          </div>
          <div class="lab-box">
            <div class="lab-box-header">🧪 Laboratorio</div>
            <div class="lab-section">
              <div class="lab-section-title">Objetivo</div>
              <p style="font-size:0.9rem;color:var(--color-text-muted);line-height:1.65">Observar en tiempo real cómo Ansible usa SSH para conectarse a los hosts y ejecutar módulos.</p>
            </div>
            <div class="lab-section">
              <div class="lab-section-title">Pasos</div>
              <ol>
                <li>Creá un inventario con al menos 2 hosts (pueden ser VMs locales)</li>
                <li>Verificá conectividad SSH sin contraseña a ambos hosts</li>
                <li>Ejecutá <code>ansible all -m ping -vv</code> y observá la salida</li>
                <li>Ejecutá <code>ansible all -m ping -vvv</code> para ver los comandos SSH exactos</li>
              </ol>
            </div>
            <div class="lab-section">
              <div class="lab-section-title">Verificación</div>
              <ul>
                <li>Ambos hosts responden con <code>SUCCESS</code> y <code>"ping": "pong"</code></li>
                <li>En la salida <code>-vvv</code> podés ver la línea <code>PUT /tmp/.ansible/tmp/.../AnsiballZ_ping.py</code></li>
              </ul>
            </div>
            <div class="lab-section">
              <div class="lab-section-title">Resultado esperado</div>
              <div class="lab-expected">
                <div class="lab-expected-item"><span class="lab-expected-check">✓</span> <code>ansible all -m ping</code> responde <code>SUCCESS</code> en ambos hosts</div>
                <div class="lab-expected-item"><span class="lab-expected-check">✓</span> La salida con <code>-vvv</code> muestra claramente el proceso de copia del módulo Python</div>
                <div class="lab-expected-item"><span class="lab-expected-check">✓</span> El inventario tiene al menos dos hosts en grupos separados</div>
              </div>
            </div>
            <div class="lab-section">
              <div class="lab-section-title">Preguntas para reflexionar</div>
              <ul>
                <li>¿Cuántas conexiones SSH abre Ansible por tarea cuando hay 10 hosts?</li>
                <li>¿Qué ventaja tiene el SSH multiplexing (<code>ControlPersist</code>) para Ansible?</li>
              </ul>
            </div>
          </div>
          <div class="next-chapter-box">
            <div class="next-chapter-arrow">→</div>
            <div>
              <div class="next-chapter-label">A continuación</div>
              <div class="next-chapter-title">Características clave de Ansible</div>
              <div class="next-chapter-desc">Agentless, idempotencia, declarativo, push model, SSH nativo — las cinco decisiones de diseño que hacen que Ansible sea único.</div>
            </div>
          </div>
        `
      }
    ]
  },
  {
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
    ]
  },
  {
    levelId: 1,
    moduleId: 4,
    title: 'Instalación de Ansible',
    objective: 'Instalar Ansible en el control node (Linux, macOS, WSL) y verificar la instalación con ansible --version.',
    duration: '30 minutos',
    objectives: [
      'Instalar Ansible en Linux, macOS o WSL usando pip',
      'Verificar la instalación con ansible --version e interpretar cada campo',
      'Crear un ansible.cfg básico con inventario y usuario SSH configurados',
      'Ejecutar ansible localhost -m ping y obtener SUCCESS',
    ],
    steps: [
      {
        title: 'Requisitos previos',
        body: `
          <p>Antes de instalar Ansible, verificá que tu sistema cumple los requisitos:</p>
          <ul>
            <li><strong>Sistema operativo</strong>: Linux o macOS (Windows con WSL)</li>
            <li><strong>Python 3.9+</strong> instalado</li>
            <li><strong>pip</strong> (gestor de paquetes Python)</li>
            <li>Acceso a internet para descargar paquetes</li>
          </ul>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">verificar-requisitos.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Verificar versión de Python
python3 --version              # necesitás 3.9 o superior
# Python 3.11.6

# Verificar pip
pip3 --version
# pip 23.x from /usr/lib/python3.11/site-packages/pip

# Verificar que SSH esté disponible
ssh -V
# OpenSSH_8.x, OpenSSL x.x</code></pre>
          </div>
        `
      },
      {
        title: 'Instalación en Linux (pip — recomendado)',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalar-linux-pip.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Opción 1: instalar en el entorno de usuario (recomendado)
pip3 install --user ansible

# Agregar el directorio de usuario al PATH si no está
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Opción 2: entorno virtual (mejor para proyectos específicos)
python3 -m venv ansible-env
source ansible-env/bin/activate
pip install ansible

# Opción 3: sistema (no recomendado — puede interferir con paquetes del SO)
sudo pip3 install ansible</code></pre>
          </div>
        `
      },
      {
        title: 'Instalación en Linux (gestor de paquetes)',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalar-linux-packages.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Ubuntu / Debian
sudo apt update
sudo apt install ansible

# RHEL / CentOS / Fedora
sudo dnf install ansible         # Fedora
sudo dnf install ansible-core    # RHEL 9 (paquete minimalista)

# Arch Linux
sudo pacman -S ansible

# Nota: los paquetes de distro pueden estar desactualizados.
# pip siempre tiene la versión más reciente.</code></pre>
          </div>
        `
      },
      {
        title: 'Instalación en macOS',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalar-macos.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Opción 1: Homebrew (recomendado para macOS)
brew install ansible

# Opción 2: pip (misma instalación que Linux)
pip3 install ansible

# Verificar
ansible --version</code></pre>
          </div>
        `
      },
      {
        title: 'Instalación en Windows (WSL)',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalar-wsl.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># 1. En PowerShell (como administrador), habilitar WSL
wsl --install                   # instala Ubuntu por defecto
# Reiniciar Windows

# 2. En la terminal WSL (Ubuntu)
sudo apt update
sudo apt install python3-pip
pip3 install --user ansible
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# 3. Verificar
ansible --version</code></pre>
          </div>
        `
      },
      {
        title: 'Verificar la instalación',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">verificar-instalacion.sh</span></div>
            <pre class="language-bash"><code class="language-bash">ansible --version
# ansible [core 2.17.x]       ← versión de ansible-core
#   config file = None         ← aún no hay ansible.cfg
#   configured module search path = ['/home/user/.ansible/plugins/modules', ...]
#   ansible python module location = /home/user/.local/lib/python3.11/site-packages/ansible
#   ansible collection location = /home/user/.ansible/collections:/usr/share/ansible/collections
#   executable location = /home/user/.local/bin/ansible
#   python version = 3.11.x   ← Python que usa Ansible
#   jinja version = 3.x        ← versión de Jinja2
#   libyaml = True             ← si es True, YAML parsing es más rápido

# Verificar subcomandos
ansible-playbook --version
ansible-galaxy --version
ansible-vault --version</code></pre>
          </div>
        `
      },
      {
        title: 'Estructura de directorios recomendada',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">estructura-proyecto.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Estructura recomendada para un proyecto Ansible
mi-proyecto/
├── ansible.cfg               # configuración local del proyecto
├── inventory/
│   ├── hosts.ini             # inventario estático
│   ├── group_vars/
│   │   ├── all.yml           # variables para todos los hosts
│   │   └── servidores_web.yml
│   └── host_vars/
│       └── web1.yml          # variables específicas de un host
├── playbooks/
│   ├── site.yml              # playbook principal
│   ├── servidores_web.yml
│   └── bases_de_datos.yml
└── roles/
    └── nginx/
        ├── tasks/main.yml
        └── handlers/main.yml</code></pre>
          </div>
        `
      },
      {
        title: 'ansible.cfg básico',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
            <pre class="language-ini"><code class="language-ini">[defaults]
inventory = ./inventory/hosts.ini    # ruta al inventario por defecto
remote_user = deploy                 # usuario SSH por defecto
host_key_checking = False            # deshabilitar verificación de host en lab
timeout = 30                         # segundos de timeout SSH
forks = 10                           # hosts paralelos por defecto

[privilege_escalation]
become = False                       # no usar sudo por defecto
become_method = sudo                 # método de escalada de privilegios
become_user = root                   # usuario objetivo de sudo

[ssh_connection]
pipelining = True                    # optimización de performance SSH</code></pre>
          </div>
        `
      },
      {
        title: 'Probar la conectividad',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">primer-ping.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Probar contra localhost (el control node mismo)
ansible localhost -m ping
# localhost | SUCCESS => {
#     "changed": false,
#     "ping": "pong"
# }

# Probar contra un inventario
ansible all -i inventory/hosts.ini -m ping

# Si usás contraseña SSH (no recomendado, usá claves)
ansible all -i inventory/hosts.ini -m ping -k    # -k pide contraseña SSH</code></pre>
          </div>
        `
      },
      {
        title: 'Resumen',
        body: `
          <div class="highlight-box">
            <p>Ansible está instalado en tu control node y verificaste que puede conectarse a los hosts. Tenés la estructura básica de un proyecto Ansible.</p>
          </div>
          <div class="challenge-box">
            <div class="challenge-title">🎯 Desafío</div>
            <div class="challenge-body">Instalá Ansible en tu máquina. Creá un <code>ansible.cfg</code> con tu configuración. Creá un inventario con al menos 2 hosts. Ejecutá <code>ansible all -m ping</code> y confirmá que ambos responden con SUCCESS.</div>
          </div>
        `
      }
    ]
  },
  {
    levelId: 1,
    moduleId: 5,
    title: 'Tu primer comando Ansible',
    objective: 'Entender en profundidad qué sucede cuando ejecutás ansible all -m ping y cómo interpretar el resultado.',
    duration: '1 hora',
    objectives: [
      'Diseccionar cada parte del comando ansible all -m ping',
      'Interpretar el resultado JSON de un módulo exitoso y de uno fallido',
      'Usar los niveles de verbose (-v, -vv, -vvv) para diagnosticar problemas',
      'Ejecutar comandos ad-hoc con diferentes módulos y patrones de hosts',
    ],
    steps: [
      {
        title: 'El comando más simple',
        body: `
          <p>El primer comando que ejecuta todo el mundo con Ansible es:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span></div>
            <pre class="language-bash"><code class="language-bash">ansible all -m ping</code></pre>
          </div>
          <p>Parece simple, pero hay mucho sucediendo debajo. Vamos a diseccionarlo parte por parte.</p>
        `
      },
      {
        title: 'Anatomía del comando',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">anatomia.sh</span></div>
            <pre class="language-bash"><code class="language-bash">ansible    all    -m ping
#  │         │       │
#  │         │       └── -m = module; "ping" = nombre del módulo a ejecutar
#  │         │
#  │         └── "all" = pattern de hosts; aplica a TODOS los hosts del inventario
#  │              Alternativas: "servidores_web", "web1.ejemplo.com", "web*"
#  │
#  └── el binario "ansible" — para comandos ad-hoc (una sola tarea)
#      Diferente de "ansible-playbook" que corre un archivo completo

# Otro ejemplo con más opciones:
ansible servidores_web -m command -a "uptime" -i inventory/hosts.ini -u deploy -b
#                       │            │          │                      │       │
#                       │            │          │                      │       └── -b = become (sudo)
#                       │            │          │                      └── -u = usuario SSH
#                       │            │          └── -i = inventario explícito
#                       │            └── -a = arguments (argumentos del módulo)
#                       └── patrón de hosts (grupo "servidores_web")</code></pre>
          </div>
        `
      },
      {
        title: 'El módulo ping — qué hace realmente',
        body: `
          <p>El módulo <code>ping</code> de Ansible NO hace un ping ICMP. Es un módulo Python que:</p>
          <ol>
            <li>Se conecta al host via SSH</li>
            <li>Copia un pequeño script Python al host</li>
            <li>Ejecuta ese script (que no hace casi nada — solo responde "pong")</li>
            <li>Devuelve el resultado JSON</li>
          </ol>
          <div class="internal-flow">
            <div class="internal-flow-header">🔍 ¿Qué ocurre internamente?</div>
            <div class="internal-flow-steps">
              <div class="flow-step">
                <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
                <div class="flow-step-body">
                  <div class="flow-step-title">Ansible lee ansible.cfg</div>
                  <div class="flow-step-desc">Busca el archivo de configuración en el directorio actual, luego en ~/.ansible.cfg, luego en /etc/ansible/ansible.cfg.</div>
                </div>
              </div>
              <div class="flow-step">
                <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
                <div class="flow-step-body">
                  <div class="flow-step-title">Carga el inventario</div>
                  <div class="flow-step-desc">Parsea el archivo de inventario y construye el grafo de hosts y grupos. Resuelve qué hosts aplican al patrón "all".</div>
                </div>
              </div>
              <div class="flow-step">
                <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
                <div class="flow-step-body">
                  <div class="flow-step-title">Abre conexión SSH</div>
                  <div class="flow-step-desc">Establece una conexión SSH con multiplexing (ControlMaster) al host remoto. Usa la clave privada de ~/.ssh/ o la configurada en ansible_ssh_private_key_file.</div>
                </div>
              </div>
              <div class="flow-step">
                <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
                <div class="flow-step-body">
                  <div class="flow-step-title">Copia el módulo ping.py a /tmp</div>
                  <div class="flow-step-desc">Transfiere el archivo AnsiballZ_ping.py al directorio temporal del host remoto mediante sftp o scp.</div>
                </div>
              </div>
              <div class="flow-step">
                <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
                <div class="flow-step-body">
                  <div class="flow-step-title">Ejecuta Python en el host remoto</div>
                  <div class="flow-step-desc">Corre: <code>python3 /tmp/.ansible/tmp/.../AnsiballZ_ping.py</code>. El módulo simplemente devuelve {"ping": "pong"}.</div>
                </div>
              </div>
              <div class="flow-step">
                <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
                <div class="flow-step-body">
                  <div class="flow-step-title">Recibe el JSON de respuesta</div>
                  <div class="flow-step-desc">Ansible lee stdout del proceso remoto: {"changed": false, "ping": "pong"}. Si hay errores, los encuentra en stderr.</div>
                </div>
              </div>
              <div class="flow-step">
                <div class="flow-step-connector"><div class="flow-step-dot"></div><div class="flow-step-line"></div></div>
                <div class="flow-step-body">
                  <div class="flow-step-title">Borra el archivo temporal</div>
                  <div class="flow-step-desc">El módulo se ejecuta como: <code>python3 ping.py && rm -f ping.py</code>. El host remoto queda exactamente igual que antes.</div>
                </div>
              </div>
              <div class="flow-step">
                <div class="flow-step-connector"><div class="flow-step-dot"></div></div>
                <div class="flow-step-body">
                  <div class="flow-step-title">Muestra el resultado</div>
                  <div class="flow-step-desc">El control node procesa el JSON y muestra: <code>hostname | SUCCESS => {"changed": false, "ping": "pong"}</code>.</div>
                </div>
              </div>
            </div>
          </div>
          <p>Si el ping tiene éxito, confirmás que: la conexión SSH funciona, Python está instalado, y el usuario tiene permisos para ejecutar Python en <code>/tmp</code>.</p>
        `
      },
      {
        title: 'Interpretar el resultado exitoso',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">resultado-ping.txt</span></div>
            <pre class="language-bash"><code class="language-bash">web1.ejemplo.com | SUCCESS => {      # nombre del host | estado
    "changed": false,                 # false = no cambió nada (ping no cambia nada)
    "ping": "pong"                    # la respuesta del módulo ping
}
web2.ejemplo.com | SUCCESS => {
    "changed": false,
    "ping": "pong"
}</code></pre>
          </div>
          <ul>
            <li><strong>SUCCESS</strong>: el módulo se ejecutó sin errores</li>
            <li><strong>changed: false</strong>: el módulo no realizó ningún cambio en el host</li>
            <li><strong>"ping": "pong"</strong>: la respuesta específica del módulo ping</li>
          </ul>
        `
      },
      {
        title: 'Errores comunes y cómo diagnosticarlos',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">errores-ping.txt</span></div>
            <pre class="language-bash"><code class="language-bash"># Error 1: No se puede conectar por SSH
web1.ejemplo.com | UNREACHABLE! => {
    "changed": false,
    "msg": "Failed to connect to the host via ssh: ssh: connect to host web1.ejemplo.com port 22: Connection refused",
    "unreachable": true
}
# Diagnóstico: ¿está el servidor encendido? ¿SSH está corriendo? ¿el firewall bloquea el puerto 22?

# Error 2: Autenticación fallida
web1.ejemplo.com | UNREACHABLE! => {
    "msg": "Failed to connect to the host via ssh: Permission denied (publickey,password)."
}
# Diagnóstico: ¿está la clave pública en authorized_keys? ¿el usuario es correcto?

# Error 3: Python no encontrado
web1.ejemplo.com | FAILED! => {
    "msg": "/usr/bin/python3: not found"
}
# Solución: instalar python3 en el host remoto, o cambiar ansible_python_interpreter

# Error 4: Host key verification failed
web1.ejemplo.com | UNREACHABLE! => {
    "msg": "Failed to connect via ssh: Host key verification failed."
}
# Solución: agregar el host a known_hosts o deshabilitar host_key_checking</code></pre>
          </div>
        `
      },
      {
        title: 'Modo verbose para diagnosticar',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">verbose.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># -v: verbose básico — muestra más info del resultado
ansible all -m ping -v

# -vv: más verbose — muestra las variables y paths
ansible all -m ping -vv

# -vvv: mucho verbose — muestra cada conexión SSH (lo que usarás para debug)
ansible all -m ping -vvv
# <web1.ejemplo.com> ESTABLISH SSH CONNECTION FOR USER deploy
# <web1.ejemplo.com> SSH: EXEC ssh -C -o ControlMaster=auto ...
# <web1.ejemplo.com> PUT /tmp/.ansible/tmp/ansible-tmp-xxx/AnsiballZ_ping.py
# <web1.ejemplo.com> EXEC /bin/sh -c 'python3 AnsiballZ_ping.py && rm -f AnsiballZ_ping.py'

# -vvvv: debug extremo — incluye información de plugins
ansible all -m ping -vvvv</code></pre>
          </div>
        `
      },
      {
        title: 'Otros comandos ad-hoc esenciales',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ad-hoc-commands.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Ejecutar un comando en todos los hosts
ansible all -m command -a "uptime"
ansible all -m command -a "df -h"

# Ejecutar con sudo
ansible all -m command -a "apt update" -b

# Copiar un archivo
ansible all -m copy -a "src=/local/file.txt dest=/remote/path/"

# Ver hechos (facts) de los hosts
ansible all -m setup

# Ver sólo algunos facts
ansible all -m setup -a "filter=ansible_distribution*"

# Apagar todos los servidores (¡cuidado!)
ansible all -m command -a "shutdown -h now" -b</code></pre>
          </div>
        `
      },
      {
        title: 'Patterns de hosts — selección flexible',
        body: `
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">patterns.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Todos los hosts
ansible all -m ping

# Un grupo específico
ansible servidores_web -m ping

# Un host específico
ansible web1.ejemplo.com -m ping

# Wildcard
ansible "web*.ejemplo.com" -m ping

# Intersección — hosts en ambos grupos
ansible "servidores_web:&produccion" -m ping

# Diferencia — en servidores_web pero NO en mantenimiento
ansible "servidores_web:!mantenimiento" -m ping

# Lista explícita
ansible "web1.ejemplo.com,web2.ejemplo.com" -m ping

# Limitar con --limit
ansible all -m ping --limit web1.ejemplo.com</code></pre>
          </div>
        `
      },
      {
        title: 'Diferencia entre ansible y ansible-playbook',
        body: `
          <table class="comparison-table">
            <thead>
              <tr><th>ansible (ad-hoc)</th><th>ansible-playbook</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Una sola tarea</td>
                <td>Múltiples tareas en secuencia</td>
              </tr>
              <tr>
                <td>Resultado inmediato</td>
                <td>Playbook guardado en archivo .yml</td>
              </tr>
              <tr>
                <td>Para diagnóstico y tareas únicas</td>
                <td>Para automatización repetible</td>
              </tr>
              <tr>
                <td>ansible all -m command -a "id"</td>
                <td>ansible-playbook sitio.yml</td>
              </tr>
            </tbody>
          </table>
        `
      },
      {
        title: 'Resumen',
        body: `
          <div class="highlight-box">
            <p><code>ansible all -m ping</code> parece simple pero verifica toda la cadena: inventario → SSH → Python → módulo → resultado JSON. Con esto sabés que tu entorno está funcionando correctamente.</p>
          </div>
          <div class="challenge-box">
            <div class="challenge-title">🎯 Desafío</div>
            <div class="challenge-body">Ejecutá <code>ansible all -m ping -vvv</code> y analizá la salida completa. Identificá: a qué IP se conectó, qué usuario usó, qué archivo Python copió, y qué comando ejecutó. Luego ejecutá <code>ansible all -m setup -a "filter=ansible_os_family"</code> para ver la distribución Linux de tus hosts.</div>
          </div>
        `
      }
    ]
  }
];
