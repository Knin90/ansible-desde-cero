import type { ModuleContent } from '../types';

export const nivel7Mod3: ModuleContent =   {
levelId: 7,
moduleId: 3,
title: 'Fact Cache',
objective: 'Configurar y gestionar el caché de facts para optimizar el rendimiento de playbooks en flotas grandes.',
duration: '1.5 horas',
objectives: [
  'Entender los tres modos de gathering: implicit, explicit, smart',
  'Configurar fact caching con backends jsonfile y Redis',
  'Gestionar la invalidación del caché: --flush-cache y expiración',
  'Saber cuándo usar cada combinación de gathering y backend',
],
prerequisites: [
  'Entender cómo funciona gather_facts y el módulo setup (módulo anterior)',
],
steps: [
  {
    title: 'Los tres modos de gathering',
    body: `
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Imaginá que los facts son el historial médico de un paciente. Con <code>gathering = implicit</code>, el médico siempre hace exámenes completos desde cero, aunque el paciente haya estado ayer. Con <code>gathering = explicit</code>, el médico nunca hace exámenes a menos que se lo pidás. Con <code>gathering = smart</code>, el médico revisa el historial reciente: si tiene exámenes de las últimas 24h, los usa; si no, hace nuevos exámenes.</p>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg — modos de gathering</span></div>
        <pre class="language-ini"><code class="language-ini">[defaults]
# implicit (default): siempre recolecta facts antes de cada play
# equivalent a tener gather_facts: true en todos los plays
gathering = implicit

# explicit: nunca recolecta facts automáticamente
# equivalent a tener gather_facts: false en todos los plays
# Solo recolecta cuando usás ansible.builtin.setup manualmente
gathering = explicit

# smart: recolecta solo si no están en caché o expiradosm
# La opción más inteligente para flotas grandes
gathering = smart</code></pre>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Cuándo usar cada modo:</strong>
          <ul>
            <li><code>implicit</code> — desarrollo y testing donde siempre querés datos frescos</li>
            <li><code>explicit</code> — playbooks operacionales que no necesitan facts del OS (despliegues, reinicios)</li>
            <li><code>smart</code> — producción con flotas grandes, requiere configurar un backend de caché</li>
          </ul>
        </div>
      </div>
    `
  },
  {
    title: 'Configurar fact cache: jsonfile y Redis',
    body: `
      <p>Sin un backend de caché, <code>gathering = smart</code> recolecta facts en cada ejecución igual que <code>implicit</code>. El caché es lo que hace que <code>smart</code> sea realmente inteligente.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg — backend jsonfile</span></div>
        <pre class="language-ini"><code class="language-ini">[defaults]
# smart solo tiene efecto cuando hay un backend de caché configurado
gathering = smart

# jsonfile: un archivo JSON por host en el directorio especificado
# Ideal para un único control node
fact_caching = jsonfile
fact_caching_connection = /var/cache/ansible/facts
fact_caching_timeout = 86400   # 24 horas en segundos</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg — backend Redis</span></div>
        <pre class="language-ini"><code class="language-ini">[defaults]
gathering = smart

# redis: ideal para múltiples control nodes (CI/CD distribuido)
# Requiere: pip install ansible[redis] o pip install redis
fact_caching = redis
fact_caching_connection = redis://localhost:6379/0
# Con autenticación:
# fact_caching_connection = redis://:mi_password@redis.empresa.com:6379/1
fact_caching_timeout = 3600    # 1 hora</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">verificar-cache.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Verificar que el caché funciona
  hosts: all
  # Con gathering=smart en ansible.cfg, esto no debería
  # recolectar facts si el caché es válido

  tasks:
- name: Mostrar de dónde vienen los facts
  ansible.builtin.debug:
    msg: "OS: {{ ansible_distribution }} {{ ansible_distribution_version }}"

# Para forzar re-recolección en este play específico (ignorar caché):
- name: Setup explícito con gather_subset limitado
  ansible.builtin.setup:
    gather_subset: ['min']  # Solo lo mínimo, ignora caché</code></pre>
      </div>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>fact_caching_timeout:</strong> El tiempo en segundos después del cual los facts cacheados se consideran expirados y se re-recolectan. Con 86400 (24h), un host que cambió de IP a las 3am no tendrá el nuevo valor hasta la próxima recolección. Ajustá según la frecuencia de cambios en tu infraestructura.</div>
      </div>
    `
  },
  {
    title: 'Gestión del caché: invalidación y operaciones',
    body: `
      <p>Saber cuándo y cómo invalidar el caché es tan importante como configurarlo. Un caché desactualizado puede causar que Ansible opere con información incorrecta.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">gestionar-cache.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Invalidar caché de TODOS los hosts antes de correr el playbook
ansible-playbook site.yml --flush-cache

# Invalidar caché de hosts específicos (no hay flag directo,
# pero podés borrar el archivo de caché manualmente con jsonfile)
rm /var/cache/ansible/facts/web1.empresa.com

# Forzar re-recolección sin borrar: usar gathering: always en el play
# Esto ignora el caché para este play específico

# Ver qué hosts tienen caché válido y cuáles no
ls -la /var/cache/ansible/facts/
# Cada archivo es un host, el timestamp es cuándo se cachearon los facts

# Limpiar facts expirados manualmente (más de 24h)
find /var/cache/ansible/facts/ -mtime +1 -delete</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">play-con-gathering-override.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# Este play siempre recolecta facts frescos, ignorando el caché global
- name: Play con gathering explícito
  hosts: all
  gather_facts: true    # Sobreescribe gathering=smart de ansible.cfg

  tasks:
- name: Asegurar que tenemos facts frescos
  ansible.builtin.setup:
    gather_subset: all  # Recolectar todo, sin importar el caché</code></pre>
      </div>
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio: medir el impacto del caché</div>
        <div class="lab-content">
          <p>Comparación de tiempos con y sin caché:</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">medir-impacto.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Sin caché (borrar caché primero)
time ansible-playbook --flush-cache site.yml

# Con caché válido (segunda ejecución)
time ansible-playbook site.yml

# Comparar los tiempos — deberías ver diferencia notable con 10+ hosts</code></pre>
          </div>
        </div>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Cuándo invalidar el caché:</strong> Después de migrar hosts a nueva infraestructura, cambiar el sistema operativo, cambiar las IPs, o cualquier cambio de hardware. Un caché de 24h puede ser problemático si tus hosts cambian frecuentemente. Considerá un timeout más corto (3600 = 1h) en entornos dinámicos.</div>
      </div>
    `
  }
],
quiz: [
  {
    question: '¿Cuál es la diferencia entre `gathering = explicit` y `gather_facts: false` en un play?',
    options: [
      'Son completamente equivalentes',
      'gathering=explicit afecta todos los plays globalmente desde ansible.cfg; gather_facts:false es un override por play',
      'gathering=explicit deshabilita el fact cache; gather_facts:false no',
      'gather_facts:false es más rápido porque no inicializa el módulo setup',
    ],
    correctIndex: 1,
    explanation: 'gathering=explicit en ansible.cfg aplica a todos los plays como default global. gather_facts:false en un play específico sobreescribe el default solo para ese play. Podés tener gathering=smart globalmente y usar gather_facts:false en plays específicos que no necesitan facts.',
  },
  {
    question: '¿Qué sucede si configuras `gathering = smart` pero NO configuras un backend de caché?',
    options: [
      'Ansible lanza un error de configuración',
      'Funciona igual que gathering=implicit: recolecta facts en cada ejecución',
      'Ansible usa el sistema de archivos /tmp como caché automáticamente',
      'Solo recolecta facts en el primer play de cada ejecución',
    ],
    correctIndex: 1,
    explanation: 'Sin backend de caché, "smart" no tiene dónde guardar los facts entre ejecuciones. Se comporta exactamente como "implicit": recolecta facts al inicio de cada play en cada ejecución. El caché solo ayuda cuando fact_caching está configurado con jsonfile, redis, u otro backend.',
  },
  {
    question: '¿Cuándo usarías `--flush-cache` al ejecutar un playbook?',
    options: [
      'En cada ejecución, para asegurar datos frescos',
      'Después de cambios de hardware, IPs, o sistema operativo en los hosts',
      'Solo cuando el playbook falla',
      'Cuando el backend de caché es Redis (no necesario con jsonfile)',
    ],
    correctIndex: 1,
    explanation: '--flush-cache invalida el caché de todos los hosts y fuerza re-recolección. Usalo después de cambios de infraestructura significativos: nueva IP, cambio de distro, migración a nueva VM. Usarlo en cada ejecución elimina los beneficios del caché.',
  },
],
troubleshooting: [
  {
    error: 'gathering=smart sigue recolectando facts en cada ejecución (no usa caché)',
    cause: 'No hay backend de caché configurado, o el directorio de caché no existe, o los permisos del directorio son incorrectos.',
    fix: 'Verificá que `fact_caching` y `fact_caching_connection` estén configurados en ansible.cfg. Para jsonfile, creá el directorio: `mkdir -p /var/cache/ansible/facts && chmod 750 /var/cache/ansible/facts`. Ejecutá un playbook y verificá que los archivos se crean en ese directorio.',
  },
  {
    error: 'Playbook usa IP incorrecta de un host que fue migrado',
    cause: 'El fact cache tiene la IP anterior del host y no expiró. gathering=smart usa el valor cacheado.',
    fix: 'Ejecutá `ansible-playbook --flush-cache site.yml` para invalidar el caché de todos los hosts. O borrá el archivo de caché específico: `rm /var/cache/ansible/facts/hostname.empresa.com`.',
  },
  {
    error: 'redis.exceptions.ConnectionError: Error connecting to Redis',
    cause: 'El servidor Redis no está accesible desde el control node, o la URL de conexión es incorrecta.',
    fix: 'Verificá la conectividad: `redis-cli -h localhost ping`. Verificá que la URL en `fact_caching_connection` sea correcta. Como fallback temporal, cambiá a `fact_caching = jsonfile` hasta resolver el problema de Redis.',
  },
],
  };
