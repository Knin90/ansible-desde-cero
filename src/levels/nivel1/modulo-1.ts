import type { ModuleContent } from '../types';

export const nivel1Mod1: ModuleContent = {
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
  prerequisites: ['Haber completado el Nivel 0 completo (Linux, Redes, YAML y Python)'],
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
  ],
  quiz: [
    {
      question: '¿En qué año fue creado Ansible y por quién?',
      options: ['2010, Mitchell Hashimoto', '2012, Michael DeHaan', '2014, Red Hat', '2009, Luke Kanies'],
      correctIndex: 1,
      explanation: 'Ansible fue creado por Michael DeHaan en 2012. Antes había trabajado en Cobbler y Func, y quería una herramienta de automatización simple, agentless y basada en SSH.',
    },
    {
      question: '¿Qué diferencia principal tiene Ansible respecto a Puppet y Chef?',
      options: [
        'Ansible es más rápido en todos los casos',
        'Ansible usa JSON en lugar de YAML',
        'Ansible no requiere instalar agentes en los servidores gestionados',
        'Ansible solo funciona con servidores Linux',
      ],
      correctIndex: 2,
      explanation: 'La principal ventaja de Ansible es ser "agentless" — no necesita ningún software adicional en los hosts gestionados. Solo necesita SSH y Python, que ya vienen en todos los servidores Linux.',
    },
    {
      question: '¿Cuál es la relación correcta entre Ansible y Terraform?',
      options: [
        'Son competidores directos — usar uno excluye al otro',
        'Terraform reemplazó a Ansible en 2019',
        'Terraform crea la infraestructura; Ansible la configura',
        'Ansible incluye Terraform como dependencia',
      ],
      correctIndex: 2,
      explanation: 'Se complementan perfectamente: Terraform provee la infraestructura (crea VMs, redes, etc.) y Ansible la configura (instala software, ajusta archivos). Muchos equipos usan ambos juntos.',
    },
  ],
  realWorldCase: 'Spotify, la NASA y Deutsche Telekom usan Ansible para gestionar miles de servidores. En Spotify, Ansible automatiza el despliegue de microservicios. En la NASA, gestiona configuraciones de infraestructura crítica. Lo que aprendés aquí es exactamente lo que usan estas empresas en producción.',
};
