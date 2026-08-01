import type { ModuleContent } from '../types';

export const nivel3Mod5: ModuleContent = {
  levelId: 3,
  moduleId: 5,
  title: 'Precedencia de variables en el inventario',
  objective: 'Entender el orden de precedencia completo de las variables de inventario para predecir qué valor ganará cuando hay conflictos.',
  duration: '1 hora',
  prerequisites: [
    'Nivel 3, Módulo 4: Variables de inventario — host_vars y group_vars',
    'Nivel 2: Variables en playbooks (vars:, set_fact, register)',
  ],
  realWorldCase: 'Un equipo descubre que los despliegues a producción usan el puerto 80 en lugar del 443 esperado: el debug revela que una variable http_port definida en vars: del play sobreescribe la de group_vars, un clásico conflicto de precedencia que cuesta horas diagnosticar sin conocer la jerarquía.',
  quiz: [
    {
      question: '¿Qué fuente de variables tiene la mayor precedencia en Ansible, por encima de cualquier otra?',
      options: [
        'Variables definidas en roles (roles/myrole/vars/main.yml)',
        'Variables de host en host_vars/',
        'Extra vars pasadas con -e en la línea de comandos',
        'Variables definidas con set_fact en una tarea',
      ],
      correctIndex: 2,
      explanation: 'Las extra vars (-e) tienen la máxima precedencia en Ansible, por encima de todo: roles, set_fact, host_vars, group_vars, y cualquier otra fuente. Esto las hace útiles para overrides de emergencia pero peligrosas si se usan habitualmente.',
    },
    {
      question: 'Cuando la misma variable está definida en group_vars/all.yml y en group_vars/servidores_web.yml, ¿qué valor usa un host del grupo servidores_web?',
      options: [
        'El de group_vars/all.yml porque "all" siempre tiene mayor precedencia',
        'El de group_vars/servidores_web.yml porque los grupos específicos tienen mayor precedencia que "all"',
        'Ansible lanza un error por ambigüedad',
        'El primero que encuentra alfabéticamente',
      ],
      correctIndex: 1,
      explanation: 'En la jerarquía de Ansible, los grupos específicos (hijos) tienen mayor precedencia que el grupo "all". Un host en "servidores_web" usará el valor de group_vars/servidores_web.yml, que sobreescribe el de group_vars/all.yml para ese grupo.',
    },
    {
      question: '¿Cuál es la forma correcta de verificar qué valor tiene una variable específica en un host concreto, considerando todas las fuentes?',
      options: [
        'cat inventario/group_vars/servidores_web.yml',
        'ansible -i inventario/ web1 -m debug -a "var=nombre_variable"',
        'ansible-playbook sitio.yml --check --diff',
        'grep -r nombre_variable inventario/',
      ],
      correctIndex: 1,
      explanation: 'El módulo debug con var= es la forma definitiva: Ansible resuelve la variable aplicando toda la jerarquía de precedencia y muestra el valor final que usaría para ese host. cat o grep muestran solo lo que hay en un archivo, sin considerar sobreescrituras.',
    },
  ],
  troubleshooting: [
    {
      error: 'Una variable tiene un valor incorrecto en producción pero correcto en staging; ambos usan el mismo playbook',
      cause: 'Una variable está definida en múltiples fuentes con valores distintos. En producción, una fuente de mayor precedencia (como vars: en el play o un rol) sobreescribe el valor esperado de group_vars.',
      fix: 'Ejecutar ansible -i inventario/ host_produccion -m debug -a "var=nombre_variable" para ver el valor final. Luego buscar en qué fuente se define con el valor incorrecto y eliminar esa definición o corregirla.',
    },
    {
      error: 'ansible_user es diferente en distintos hosts del mismo grupo aunque está definido en group_vars',
      cause: 'Algunos hosts tienen ansible_user definido inline en el inventario o en host_vars/, lo que tiene mayor precedencia que group_vars.',
      fix: 'Buscar definiciones de ansible_user en el inventario INI/YAML inline y en los archivos host_vars/ de esos hosts. Eliminar las definiciones redundantes o asegurarse de que los valores sean consistentes.',
    },
    {
      error: 'Se usa -e para forzar un valor pero el playbook sigue usando el valor anterior',
      cause: 'El nombre de la variable en -e no coincide exactamente con el usado en el playbook (diferencia de mayúsculas, guiones vs guiones bajos).',
      fix: 'Ansible es case-sensitive: http_port y HTTP_PORT son variables distintas. Verificar el nombre exacto con ansible -m debug -a "var=hostvars[inventory_hostname]" y usarlo idéntico en -e.',
    },
  ],
  objectives: [
    'Enumerar los 16 niveles de precedencia de variables de Ansible en orden',
    'Predecir qué valor ganará cuando la misma variable está en group_vars y host_vars',
    'Usar -e para forzar un valor por encima de cualquier otra fuente',
    'Depurar conflictos de variables con ansible -m debug -a "var=nombre_var"',
  ],
  steps: [
    {
      title: 'Precedencia completa (menor a mayor)',
      body: `
        <p>Ansible tiene más de 20 lugares donde se pueden definir variables. La precedencia determina qué valor gana cuando la misma variable está definida en múltiples lugares. De menor a mayor precedencia:</p>
        <ol>
          <li>Variables del grupo <code>all</code> (command line o inventario)</li>
          <li>Variables de grupo padre</li>
          <li>Variables de grupo hijo</li>
          <li>Variables de host en el inventario</li>
          <li><code>host_vars/</code> del directorio de inventario</li>
          <li><code>group_vars/</code> del directorio del playbook</li>
          <li><code>host_vars/</code> del directorio del playbook</li>
          <li>Facts recolectados por <code>gather_facts</code></li>
          <li>Variables del play (<code>vars:</code>)</li>
          <li>Variables de rol (<code>roles/myrole/vars/main.yml</code>)</li>
          <li>Variables de bloque (<code>block: vars:</code>)</li>
          <li>Variables de tarea (<code>task: vars:</code>)</li>
          <li>Variables de <code>include_vars</code></li>
          <li>Variables registradas con <code>register:</code></li>
          <li><code>set_fact</code> / <code>cached</code></li>
          <li><strong>Extra vars</strong> (<code>-e</code>) — la mayor precedencia siempre</li>
        </ol>
        <div class="warning-box">
          <span class="box-icon">⚠️</span>
          <div class="box-content"><strong>Regla de oro:</strong> si querés forzar un valor sin importar nada más, usá <code>-e variable=valor</code>. Si querés un valor por defecto que puede ser sobreescrito, ponelo en <code>group_vars/all.yml</code>.</div>
        </div>
      `
    },
    {
      title: 'Verificar precedencia en práctica',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">debug-precedencia.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Ver todas las variables de un host (incluye fuente)
ansible -i inventario/ web1.empresa.com -m debug -a "var=hostvars['web1.empresa.com']"

# La -e siempre gana
ansible-playbook sitio.yml -e "http_port=9090"

# Ver el valor final de una variable específica
ansible -i inventario/ web1.empresa.com -m debug -a "var=http_port"</code></pre>
        </div>
        <div class="next-chapter-box">
          <div class="next-chapter-arrow">→</div>
          <div>
            <div class="next-chapter-label">A continuación</div>
            <div class="next-chapter-title">Nivel 4 — Comandos CLI</div>
            <div class="next-chapter-desc">Con el inventario dominado, explorás todas las herramientas de línea de comandos: ansible, ansible-playbook, ansible-vault y más.</div>
          </div>
        </div>
      `
    }
  ]
};
