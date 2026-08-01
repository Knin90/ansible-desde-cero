import type { ModuleContent } from '../types';

export const nivel7Mod1: ModuleContent =   {
levelId: 7,
moduleId: 1,
title: 'Módulo setup — Recolección de facts',
objective: 'Dominar el módulo setup para recolectar, filtrar y optimizar la recolección de información del sistema.',
duration: '2 horas',
objectives: [
  'Entender qué es el namespace ansible_facts vs las variables legacy de nivel superior',
  'Usar filter y gather_subset para acelerar la recolección de facts',
  'Conocer los facts de hardware, red y sistema operativo más útiles',
  'Saber cuándo deshabilitar gather_facts por performance',
],
prerequisites: [
  'Haber ejecutado al menos un playbook con gather_facts: true',
  'Conocer las magic variables de Ansible (Nivel 6, módulo 3)',
],
steps: [
  {
    title: 'Cómo funciona gather_facts internamente',
    body: `
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>El módulo setup es como un médico que examina al paciente antes de operar. No lo haría sin esta revisión previa. Ansible ejecuta este "examen" (gather_facts) automáticamente para conocer el estado del host antes de ejecutar cualquier tarea. Sin este examen, no sabría qué distribución está corriendo ni cuánta RAM tiene.</p>
      </div>
      <p>Cuando <code>gather_facts: true</code> (el valor por defecto), Ansible ejecuta el módulo <code>setup</code> antes de la primera tarea del play. El resultado se guarda en dos lugares:</p>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Dos namespaces de facts:</strong>
          <ul>
            <li><code>ansible_facts</code> — el namespace moderno. Accedés con <code>ansible_facts['distribution']</code></li>
            <li>Variables de nivel superior — el estilo legacy. Accedés con <code>ansible_distribution</code> directamente</li>
          </ul>
          <p>Ambos apuntan a los mismos datos. Por compatibilidad, la mayoría del código usa el estilo legacy (<code>ansible_distribution</code>). El namespace <code>ansible_facts</code> es preferible en código nuevo porque evita contaminación del namespace global.</p>
        </div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">namespaces-facts.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Comparar namespaces de facts
  hosts: all
  tasks:
# Estilo legacy (más común en código existente)
- name: Distribución - estilo legacy
  ansible.builtin.debug:
    msg: "Distribución: {{ ansible_distribution }}"

# Estilo moderno (namespace ansible_facts)
- name: Distribución - estilo moderno
  ansible.builtin.debug:
    msg: "Distribución: {{ ansible_facts['distribution'] }}"

# Ambos son equivalentes
- name: Son idénticos
  ansible.builtin.assert:
    that:
      - ansible_distribution == ansible_facts['distribution']
      - ansible_memtotal_mb == ansible_facts['memtotal_mb']</code></pre>
      </div>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>inject_facts_as_vars:</strong> En <code>ansible.cfg</code>, la opción <code>inject_facts_as_vars = false</code> deshabilita las variables legacy de nivel superior (solo quedan disponibles via <code>ansible_facts.*</code>). Algunos equipos la activan para mantener el namespace limpio, pero puede romper playbooks legacy.</div>
      </div>
    `
  },
  {
    title: 'gather_subset: recolección selectiva para mejor performance',
    body: `
      <p>Por defecto, <code>setup</code> recolecta toda la información disponible. Esto puede tomar 1-3 segundos por host. Con <code>gather_subset</code> podés elegir solo los subconjuntos que necesitás.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">gather-subset.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# Opción 1: gather_subset a nivel de play
- name: Solo recolectar facts de red y SO
  hosts: all
  gather_facts: true
  gather_subset:
- network
- distribution
- '!hardware'    # El ! excluye un subconjunto específico
- '!virtual'

# Opción 2: deshabilitar y recolectar manualmente solo lo que necesitás
- name: Recolección manual y selectiva
  hosts: all
  gather_facts: false
  tasks:
- name: Solo facts de red (más rápido)
  ansible.builtin.setup:
    gather_subset:
      - '!all'      # Excluir todo primero
      - '!min'      # Excluir el subconjunto mínimo
      - network     # Incluir solo red

- name: Solo facts de sistema operativo
  ansible.builtin.setup:
    gather_subset:
      - '!all'
      - distribution</code></pre>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Subconjuntos disponibles en gather_subset:</strong>
          <table class="comparison-table">
            <thead><tr><th>Subconjunto</th><th>Qué incluye</th><th>Velocidad relativa</th></tr></thead>
            <tbody>
              <tr><td><code>all</code></td><td>Todo (default)</td><td>Lenta</td></tr>
              <tr><td><code>min</code></td><td>Facts mínimos: hostname, OS</td><td>Muy rápida</td></tr>
              <tr><td><code>hardware</code></td><td>CPU, RAM, discos, dispositivos</td><td>Lenta</td></tr>
              <tr><td><code>network</code></td><td>IPs, interfaces, DNS, routing</td><td>Media</td></tr>
              <tr><td><code>distribution</code></td><td>OS, versión, familia</td><td>Rápida</td></tr>
              <tr><td><code>virtual</code></td><td>Tipo de virtualización</td><td>Media</td></tr>
              <tr><td><code>facter</code></td><td>Facts de Facter (si está instalado)</td><td>Variable</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Performance en producción:</strong> En una flota de 500 hosts, reducir el gather_facts de "all" a solo "min + network" puede reducir el tiempo total de 15-20 minutos a 3-4 minutos. Es una de las optimizaciones de mayor impacto.</div>
      </div>
    `
  },
  {
    title: 'Catálogo de facts: los más usados en la práctica',
    body: `
      <p>Hay más de 200 facts disponibles. Estos son los que usarás en el 90% de los casos:</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">catalogo-facts.sh</span></div>
        <pre class="language-bash"><code class="language-bash">## ── Sistema Operativo ──────────────────────────────────────
ansible_distribution          # "Ubuntu", "CentOS", "Debian", "Fedora"
ansible_distribution_version  # "22.04", "8.5", "11"
ansible_distribution_major_version  # "22", "8", "11"
ansible_os_family             # "Debian", "RedHat", "Suse", "Windows"
ansible_architecture          # "x86_64", "aarch64", "i386"

## ── Hardware ────────────────────────────────────────────────
ansible_processor_vcpus       # 4 (CPUs virtuales)
ansible_processor_count       # 1 (sockets físicos)
ansible_processor_cores       # 2 (cores por socket)
ansible_memtotal_mb           # 8192 (RAM total en MB)
ansible_memfree_mb            # 2048 (RAM libre en MB)
ansible_swaptotal_mb          # 4096 (swap total)

## ── Discos y almacenamiento ─────────────────────────────────
ansible_mounts                # Lista de puntos de montaje
ansible_devices               # Dict de dispositivos de bloque
# Ejemplo: ansible_mounts[0].mount == "/"
#          ansible_mounts[0].size_total == 53687091200

## ── Red ─────────────────────────────────────────────────────
ansible_default_ipv4.address  # "10.0.1.10" (IP principal)
ansible_default_ipv4.gateway  # "10.0.1.1"
ansible_default_ipv4.interface # "eth0"
ansible_all_ipv4_addresses    # ["10.0.1.10", "192.168.1.5"]
ansible_interfaces            # ["lo", "eth0", "eth1"]
ansible_eth0.ipv4.address     # IP específica de eth0
ansible_dns.nameservers       # ["8.8.8.8", "8.8.4.4"]

## ── Identidad del host ───────────────────────────────────────
ansible_hostname              # "web-prod-01" (sin dominio)
ansible_fqdn                  # "web-prod-01.empresa.com"
ansible_nodename              # igual que fqdn normalmente

## ── Virtualización ───────────────────────────────────────────
ansible_virtualization_type   # "kvm", "vmware", "docker", "none"
ansible_virtualization_role   # "guest", "host"

## ── Tiempo ───────────────────────────────────────────────────
ansible_date_time.iso8601     # "2024-01-15T10:30:00Z"
ansible_date_time.epoch       # "1705314600"
ansible_date_time.date        # "2024-01-15"
ansible_date_time.time        # "10:30:00"
ansible_date_time.tz          # "UTC"</code></pre>
      </div>
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio</div>
        <div class="lab-content">
          <p>Explorá los facts de tu inventario con estos comandos:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">explorar-facts.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Ver TODOS los facts de un host
ansible web1 -m setup | less

# Filtrar facts de red
ansible web1 -m setup -a "filter=ansible_default_ipv4"

# Filtrar por patrón glob
ansible web1 -m setup -a "filter=ansible_distribution*"
ansible web1 -m setup -a "filter=ansible_mem*"
ansible web1 -m setup -a "filter=ansible_proc*"

# Recolectar facts de múltiples hosts y guardar en archivo
ansible all -m setup --tree /tmp/facts/</code></pre>
          </div>
        </div>
      </div>
    `
  }
],
quiz: [
  {
    question: '¿Cuál es la diferencia entre `ansible_distribution` y `ansible_facts["distribution"]`?',
    options: [
      'Son fuentes diferentes de información — una viene del OS y la otra del inventario',
      'Son accesos equivalentes al mismo valor: legacy vs namespace moderno',
      'ansible_facts["distribution"] es más preciso y puede tener un valor diferente',
      'ansible_distribution solo funciona en sistemas Debian',
    ],
    correctIndex: 1,
    explanation: 'Ambos acceden exactamente al mismo dato. `ansible_distribution` es el estilo legacy (variable de nivel superior), `ansible_facts["distribution"]` es el namespace moderno. Ansible los sincroniza automáticamente. La mayoría del código legacy usa el estilo con prefijo `ansible_`.',
  },
  {
    question: '¿Qué significa `gather_subset: ["!all", "!min", "network"]`?',
    options: [
      'Excluir todo y solo recolectar facts de red',
      'Recolectar todo excepto los facts de red',
      'Error de sintaxis — no se pueden mezclar inclusiones y exclusiones',
      'Recolectar solo facts de red más los facts de hardware',
    ],
    correctIndex: 0,
    explanation: '`!all` excluye todos los subconjuntos, `!min` excluye el subconjunto mínimo, y luego `network` incluye solo los facts de red. El resultado es: solo facts de red, sin los facts mínimos de OS/hostname. Útil cuando solo necesitás IPs.',
  },
  {
    question: 'Un playbook usa `ansible_default_ipv4.address` pero falla en un host de contenedor Docker. ¿Cuál es la causa más probable?',
    options: [
      'Docker no soporta Ansible',
      'Los contenedores no tienen una ruta por defecto (gateway), por lo que ansible_default_ipv4 no existe',
      'ansible_default_ipv4 es solo para IPv6',
      'Se necesita gather_subset: network para que este fact esté disponible',
    ],
    correctIndex: 1,
    explanation: 'ansible_default_ipv4 se determina buscando la interfaz con la ruta por defecto (gateway). Los contenedores Docker a menudo no tienen una ruta por defecto configurada o usan redes bridge especiales, por lo que el fact puede estar vacío o indefinido. Usá `| default({})` y un fallback a `ansible_all_ipv4_addresses[0]`.',
  },
],
troubleshooting: [
  {
    error: 'ansible_default_ipv4 is undefined',
    cause: 'El host no tiene una interfaz de red con ruta por defecto. Común en contenedores, hosts con múltiples interfaces sin gateway configurado, o cuando gather_subset no incluyó "network".',
    fix: 'Usá `ansible_default_ipv4 | default({})` y luego accedé al address con `ansible_default_ipv4.address | default(ansible_all_ipv4_addresses[0] | default("127.0.0.1"))`. También verificá con `ansible host -m setup -a "filter=ansible_default_ipv4"`.',
  },
  {
    error: 'gather_facts tarda 10+ segundos por host',
    cause: 'Se está recolectando el subconjunto "all" (default). Hardware facts como disk I/O stats o lshw pueden ser lentos en ciertos sistemas.',
    fix: 'Cambiá a `gather_subset: ["min", "network"]` o deshabilitalos completamente con `gather_facts: false` cuando no los necesitás. Para scripts de CI que no necesitan adaptarse al OS, considera deshabilitarlos totalmente.',
  },
  {
    error: 'ansible_mounts no muestra el disco esperado',
    cause: 'ansible_mounts solo lista sistemas de archivos montados actualmente. Un disco sin particionar o sin montar no aparece.',
    fix: 'Para ver todos los dispositivos de bloque (incluso sin montar), usá `ansible_devices`. Para ver el espacio libre en un punto de montaje específico, filtrá: `ansible_mounts | selectattr("mount", "==", "/") | first`.',
  },
],
  };
