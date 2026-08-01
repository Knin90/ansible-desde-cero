import type { ModuleContent } from '../types';

export const nivel16Mod3: ModuleContent =   {
levelId: 16,
moduleId: 3,
title: 'Fact Cache y selective gathering',
objective: 'Eliminar el overhead de gather_facts con caché de facts y recolección selectiva, y aplicar otras técnicas de optimización como --limit y --tags para ejecuciones parciales.',
duration: '2 horas',
objectives: [
  'Configurar fact_caching con backends jsonfile y Redis',
  'Usar gather_subset para recolectar solo los facts necesarios',
  'Deshabilitar gather_facts selectivamente en plays donde no es necesario',
  'Aplicar --limit, --tags y --skip-tags para ejecuciones quirúrgicas',
],
prerequisites: [
  'Completados los Módulos 1 y 2 de Nivel 16',
  'Playbooks con múltiples hosts donde gather_facts es una fracción significativa del tiempo',
],
steps: [
  {
    title: '¿Por qué gather_facts es el mayor cuello de botella?',
    body: `
      <p>Gather_facts es la primera tarea que ejecuta Ansible en cada play. Recolecta información del sistema: CPU, RAM, interfaces de red, OS, discos, variables de entorno, etc. Sobre 100 hosts, esto puede representar el 40-60% del tiempo total de ejecución de un playbook simple.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">medir-gather-facts.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Cuánto tarda gather_facts en tu entorno
# Activar profile_tasks en ansible.cfg primero:
# callbacks_enabled = profile_tasks

ansible-playbook site.yml

# Output al final:
# TASK [Gathering Facts] ********************
# Wednesday ...
# ============================================================
# Gathering Facts    0:01:23.456   ← puede ser el task más lento de todos

# Cuántos facts recolecta Ansible por defecto
ansible localhost -m ansible.builtin.setup | wc -l
# Puede ser 500+ líneas de JSON con facts del sistema</code></pre>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>El problema de gather_facts a escala:</strong><br>
          • 1 host: 1-2 segundos para gather_facts → aceptable<br>
          • 10 hosts con forks=5: ~2-4 segundos en total → aceptable<br>
          • 100 hosts con forks=20: ~10-20 segundos → notable<br>
          • 500 hosts con forks=20: ~50-120 segundos → problemático<br><br>
          Con fact cache y forks suficientes: siempre bajo 5 segundos
        </div>
      </div>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Gather_facts es como pedirle a cada empleado que complete un formulario de 200 preguntas al inicio de cada reunión, aunque solo vayas a usar 3 de esas respuestas. El fact cache es guardar las respuestas del formulario de la semana pasada y reutilizarlas — si la situación del empleado no cambió, las respuestas siguen siendo válidas.</p>
      </div>
    `
  },
  {
    title: 'Configurar fact_caching — jsonfile y Redis',
    body: `
      <p>El fact cache guarda los facts recolectados en el primer run y los reutiliza en ejecuciones posteriores. Con <code>gathering = smart</code>, Ansible solo recolecta facts si no hay caché válido para ese host.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg — backend jsonfile (un desarrollador o runner único)</span></div>
        <pre class="language-ini"><code class="language-ini">[defaults]
# smart: usa caché si existe y no expiró
# always: siempre recolecta (default — sin caché)
# explicit: nunca recolecta automáticamente (usá gather_facts: true cuando necesites)
gathering = smart

# jsonfile: un JSON por host en el directorio configurado
fact_caching = jsonfile
fact_caching_connection = /tmp/ansible_fact_cache
fact_caching_timeout = 86400    # 24 horas en segundos

# Crear el directorio si no existe
# mkdir -p /tmp/ansible_fact_cache</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg — backend Redis (equipo o múltiples runners)</span></div>
        <pre class="language-ini"><code class="language-ini">[defaults]
gathering = smart

# redis: caché compartido entre múltiples usuarios y runners de CI/CD
fact_caching = redis
fact_caching_connection = redis://localhost:6379/0
fact_caching_timeout = 86400

# Redis con autenticación y TLS:
# fact_caching_connection = rediss://usuario:password@redis.empresa.com:6380/0

# Instalar dependencia Python:
# pip install redis</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">gestionar-fact-cache.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Ver qué hosts tienen facts en caché (backend jsonfile)
ls -lh /tmp/ansible_fact_cache/
# web01.empresa.com  web02.empresa.com  db01.empresa.com  ...

# Ver los facts de un host específico
cat /tmp/ansible_fact_cache/web01.empresa.com | python3 -m json.tool | head -30

# Invalidar el caché de un host específico (forzar re-recolección)
rm /tmp/ansible_fact_cache/web01.empresa.com

# Invalidar todo el caché
rm -rf /tmp/ansible_fact_cache/*

# Invalidar caché desde Ansible
ansible-playbook site.yml --flush-cache

# Verificar que el caché funciona:
# Primera ejecución: "Gathering Facts" aparece como changed
# Ejecuciones posteriores: "Gathering Facts" aparece como ok (desde caché)</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Redis para CI/CD multi-runner:</strong> Si tu CI/CD usa múltiples runners en paralelo, un runner puede recolectar los facts de un host y otro runner reutilizarlos del caché compartido en Redis. Esto es especialmente valioso en pipelines grandes donde varios jobs de Ansible se ejecutan sobre la misma flota.</div>
      </div>
    `
  },
  {
    title: 'gather_subset y gather_facts: false — recolección selectiva',
    body: `
      <p>No siempre necesitás todos los facts. Si solo necesitás saber la distribución de Linux o la dirección IP, podés recolectar solo esa información con <code>gather_subset</code>, reduciendo el tiempo drásticamente.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">gather-selectivo.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# CASO 1: Deshabilitar completamente gather_facts
# Usar cuando el play no necesita NINGÚN fact del host
- name: Play sin facts (más rápido)
  hosts: all
  gather_facts: false    # ← elimina completamente la tarea "Gathering Facts"
  tasks:
- name: Ping básico sin facts
  ansible.builtin.ping:

- name: Ejecutar comando simple
  ansible.builtin.command: uptime

---
# CASO 2: Recolectar solo los facts que necesitás
# Ver la lista completa: ansible-doc ansible.builtin.setup
- name: Play con facts mínimos
  hosts: all
  gather_facts: true
  gather_subset:
- network       # interfaces de red, IPs → ansible_default_ipv4, ansible_interfaces
- hardware      # CPU, RAM → ansible_processor_count, ansible_memtotal_mb
- virtual       # si el host es VM → ansible_virtualization_type
- "!all"        # excluir todos los otros subsets
- "!min"        # solo los subsets listados arriba
  tasks:
- name: Mostrar IP del host
  ansible.builtin.debug:
    msg: "{{ ansible_default_ipv4.address }}"

---
# CASO 3: Solo los facts mínimos (OS y arquitectura)
- name: Solo facts mínimos
  hosts: all
  gather_subset:
- "!all"      # excluir todo
- "min"       # excepto los mínimos: OS, hostname, arquitectura
  tasks:
- name: Mostrar OS
  ansible.builtin.debug:
    msg: "{{ ansible_distribution }} {{ ansible_distribution_version }}"</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ver-subsets-disponibles.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Ver todos los subsets disponibles y qué facts incluyen
ansible localhost -m ansible.builtin.setup -a "gather_subset=network"

# Comparar la cantidad de facts: todos vs solo network
ansible localhost -m ansible.builtin.setup | wc -l           # ~500 líneas
ansible localhost -m ansible.builtin.setup \
  -a "gather_subset=!all,network" | wc -l                    # ~50 líneas</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>gather_facts: false en roles:</strong> Si deshabilitás gather_facts a nivel de play pero un role interno usa facts del sistema (como <code>ansible_os_family</code> o <code>ansible_default_ipv4</code>), el role fallará. Siempre verificá qué facts usan tus roles antes de deshabilitar gather_facts.</div>
      </div>
    `
  },
  {
    title: '--limit, --tags y --skip-tags — ejecuciones quirúrgicas',
    body: `
      <p>Más allá de la optimización del control node y SSH, la forma más efectiva de acelerar ejecuciones frecuentes es ejecutar solo lo que necesitás.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ejecuciones-parciales.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># --limit: ejecutar solo en hosts específicos
ansible-playbook site.yml --limit web01.empresa.com
ansible-playbook site.yml --limit "web01,web02,web03"
ansible-playbook site.yml --limit "webservers:!web03"   # todos excepto web03
ansible-playbook site.yml --limit "@failed_hosts.retry" # solo los que fallaron

# --tags: ejecutar solo tareas con ese tag
ansible-playbook site.yml --tags "nginx,ssl"
ansible-playbook site.yml --tags "deploy"

# --skip-tags: saltar tareas con ese tag
ansible-playbook site.yml --skip-tags "restart"

# Combinaciones efectivas
ansible-playbook site.yml --limit webservers --tags deploy --check --diff</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">site.yml — taggear correctamente las tareas</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Deploy completo
  hosts: all
  tasks:
- name: Instalar paquetes base
  ansible.builtin.package:
    name: "{{ item }}"
    state: present
  loop: "{{ base_packages }}"
  tags:
    - packages
    - base
    - always-run

- name: Configurar nginx
  ansible.builtin.template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
  tags:
    - nginx
    - config

- name: Deploy código de la aplicación
  ansible.builtin.git:
    repo: "https://github.com/empresa/mi-app.git"
    dest: /opt/mi-app
    version: "{{ app_version }}"
  tags:
    - deploy
    - app

- name: Reiniciar nginx
  ansible.builtin.service:
    name: nginx
    state: restarted
  tags:
    - nginx
    - restart</code></pre>
      </div>
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio</div>
        <div class="lab-content">
          <p><strong>Objetivo:</strong> Configurar fact cache y medir su impacto con profile_tasks.</p>
          <ol>
            <li>Activá <code>callbacks_enabled = profile_tasks</code> en ansible.cfg</li>
            <li>Ejecutá tu playbook y anotá el tiempo de "Gathering Facts"</li>
            <li>Configurá <code>gathering = smart</code>, <code>fact_caching = jsonfile</code> y <code>fact_caching_connection = /tmp/fc</code></li>
            <li>Creá el directorio: <code>mkdir -p /tmp/fc</code></li>
            <li>Ejecutá el playbook dos veces: la primera recolecta, la segunda usa caché</li>
            <li>Compará los tiempos de "Gathering Facts" entre la primera y segunda ejecución</li>
          </ol>
        </div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'fact_caching',
    definition: 'Sistema de Ansible que almacena los facts recolectados de los hosts para reutilizarlos en ejecuciones posteriores. Configurado con fact_caching (backend), fact_caching_connection (ubicación) y fact_caching_timeout (expiración en segundos) en ansible.cfg. Reduce drásticamente el tiempo de gather_facts en ejecuciones frecuentes.',
  },
  {
    term: 'gathering = smart',
    definition: 'Modo de recolección de facts que usa el caché cuando existe y no ha expirado, y recolecta normalmente cuando no hay caché o expiró. La alternativa "always" recolecta siempre (default sin caché), y "explicit" nunca recolecta automáticamente (requiere gather_facts: true en cada play que los necesite).',
  },
  {
    term: 'gather_subset',
    definition: 'Directiva de play que especifica qué subconjunto de facts recolectar, en lugar de todos. Acepta nombres de subsets (network, hardware, virtual, packages) y operadores de exclusión con !. Ejemplo: gather_subset: ["!all", "network"] recolecta solo facts de red, reduciendo el tiempo de gather_facts en un 80-90%.',
  },
  {
    term: '--flush-cache',
    definition: 'Flag de ansible-playbook que invalida el fact cache antes de ejecutar el playbook, forzando una re-recolección de todos los facts. Equivale a borrar manualmente el directorio de caché. Útil después de cambios de infraestructura que invalidan los facts cacheados.',
  },
  {
    term: '--limit',
    definition: 'Flag de ansible-playbook que restringe la ejecución a un subconjunto del inventario. Acepta hostnames, grupos, patrones con comodines (*), exclusiones (!), y el archivo .retry generado automáticamente cuando un playbook falla.',
  },
],
quiz: [
  {
    question: '¿Qué modo de gathering usa el caché cuando existe pero recolecta cuando no hay caché o expiró?',
    options: [
      'gathering = always',
      'gathering = explicit',
      'gathering = smart',
      'gathering = cached',
    ],
    correctIndex: 2,
    explanation: '"gathering = smart" usa el fact cache si existe y no expiró (fact_caching_timeout), y hace gather_facts normalmente cuando no hay caché válido. Es el modo más útil para proyectos con fact_caching configurado — obtiene lo mejor de ambos mundos: velocidad con caché fresco y actualización automática cuando expira.',
  },
  {
    question: '¿Qué hace gather_subset: ["!all", "network"] en un play?',
    options: [
      'Deshabilita gather_facts completamente',
      'Recolecta todos los facts excepto los de red',
      'Recolecta solo los facts de red, excluyendo el resto',
      'Recolecta facts de red y además los mínimos por defecto',
    ],
    correctIndex: 2,
    explanation: '"!all" excluye todos los subsets de facts (no recolectar nada por defecto), y luego "network" agrega de vuelta solo los facts de red: ansible_interfaces, ansible_default_ipv4, ansible_default_ipv6, y facts de cada interfaz de red. Esto reduce masivamente la cantidad de datos recolectados cuando el play solo necesita información de red.',
  },
  {
    question: '¿Cuándo es apropiado usar gather_facts: false en un play?',
    options: [
      'Siempre, para máxima velocidad en cualquier playbook',
      'Solo cuando se usa gathering = smart en ansible.cfg',
      'Cuando el play no usa ningún fact del sistema (ansible_os_family, ansible_default_ipv4, etc.)',
      'Cuando el fact cache ya tiene datos recientes de esos hosts',
    ],
    correctIndex: 2,
    explanation: 'gather_facts: false es apropiado cuando el play (y todos sus roles) no usan ningún fact del sistema. Antes de deshabilitarlo, verificá todos los roles y templates incluidos — si alguno usa ansible_os_family, ansible_distribution, ansible_default_ipv4 u otros facts automáticos, el play fallará. Para plays simples de monitoreo, ping o tareas de sólo texto es perfectamente apropiado.',
  },
],
troubleshooting: [
  {
    error: "The task includes an option with an undefined variable. 'ansible_default_ipv4' is undefined",
    cause: 'Se usó gather_facts: false o gather_subset que excluye el subset "network", pero el play o algún rol usa el fact ansible_default_ipv4.',
    fix: 'Habilitá gather_facts: true o agregá "network" al gather_subset: gather_subset: ["!all", "network"]. Alternativa: usá la variable de inventario ansible_host en lugar del fact, que no requiere gather_facts.',
  },
  {
    error: "Los facts siguen siendo los viejos aunque el host cambió de IP hace una hora",
    cause: 'El fact cache tiene el valor antiguo y todavía no expiró (fact_caching_timeout no se cumplió).',
    fix: 'Invalidá el caché del host específico: rm /tmp/ansible_fact_cache/nombre-del-host. O invalidá todo el caché: ansible-playbook site.yml --flush-cache. Para cambios de infraestructura conocidos, siempre ejecutá con --flush-cache para forzar re-recolección.',
  },
  {
    error: "ERROR! Could not find or access /tmp/ansible_fact_cache",
    cause: 'El directorio configurado en fact_caching_connection no existe. Ansible no lo crea automáticamente.',
    fix: 'Creá el directorio manualmente: mkdir -p /tmp/ansible_fact_cache. Verificá permisos: chmod 755 /tmp/ansible_fact_cache. Si usás un path diferente, asegurate de que el usuario que ejecuta ansible tenga permisos de escritura en ese directorio.',
  },
],
  };
