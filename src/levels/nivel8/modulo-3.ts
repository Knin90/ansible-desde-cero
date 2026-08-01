import type { ModuleContent } from '../types';

export const nivel8Mod3: ModuleContent =   {
levelId: 8,
moduleId: 3,
title: 'Módulos de red y cloud',
objective: 'Usar módulos para peticiones HTTP, descargas, gestión de firewalls y aprovisionamiento básico en la nube.',
duration: '2 horas',
objectives: [
  'Usar ansible.builtin.uri para interactuar con APIs REST',
  'Descargar archivos con get_url y verificar integridad con checksum',
  'Configurar firewall con community.general.ufw y ansible.posix.firewalld',
  'Entender las dependencias para módulos de nube (amazon.aws, azure.azcollection)',
],
prerequisites: [
  'Haber usado módulos de sistema básicos (módulo anterior)',
  'Conocer FQCN y cómo instalar colecciones',
],
steps: [
  {
    title: 'ansible.builtin.uri: interacción con APIs REST',
    body: `
      <p>El módulo <code>uri</code> permite realizar peticiones HTTP desde Ansible. Es el reemplazo idiomático para <code>curl</code> en playbooks: idempotente, con soporte para todas las operaciones REST, y con integración nativa con los handlers de Ansible.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">modulo-uri.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Ejemplos del módulo uri
  hosts: all
  tasks:
# GET básico — verificar health check
- name: Esperar a que la aplicación esté lista
  ansible.builtin.uri:
    url: "http://localhost:8080/actuator/health"
    method: GET
    status_code: 200
    return_content: true
  register: health_check
  until: health_check.status == 200           # Reintentar hasta que sea 200
  retries: 30                                  # Máximo 30 intentos
  delay: 5                                     # Esperar 5 segundos entre intentos

- name: Verificar que el campo status sea "UP"
  ansible.builtin.assert:
    that:
      - health_check.json.status == "UP"
    fail_msg: "La aplicación no está saludable: {{ health_check.json }}"

# POST con body JSON y autenticación
- name: Registrar host en CMDB
  ansible.builtin.uri:
    url: "https://cmdb.empresa.com/api/v1/hosts"
    method: POST
    body_format: json
    body:
      hostname: "{{ inventory_hostname }}"
      ip: "{{ ansible_default_ipv4.address }}"
      os: "{{ ansible_distribution }} {{ ansible_distribution_version }}"
      environment: "{{ entorno }}"
    headers:
      Authorization: "Bearer {{ cmdb_api_token }}"
      Content-Type: "application/json"
    status_code: [200, 201, 409]   # 409 = ya existe, también válido
  register: cmdb_result

# PUT para actualizar recurso existente
- name: Actualizar configuración via API
  ansible.builtin.uri:
    url: "https://api.empresa.com/config/{{ inventory_hostname }}"
    method: PUT
    body_format: json
    body:
      max_connections: "{{ db_max_connections }}"
    headers:
      Authorization: "Bearer {{ api_token }}"
    status_code: 200
    validate_certs: true   # false solo para entornos dev con cert auto-firmado

# GET con autenticación básica
- name: Descargar configuración desde Vault
  ansible.builtin.uri:
    url: "https://vault.empresa.com/v1/secret/data/mi-app"
    method: GET
    headers:
      X-Vault-Token: "{{ vault_token }}"
    return_content: true
  register: vault_secret
  no_log: true   # No mostrar el contenido en los logs</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>until + retries + delay:</strong> Esta combinación convierte al módulo uri en un waiter confiable para servicios que tardan en arrancar. Muy útil después de desplegar una nueva versión: esperás hasta 150 segundos (30 * 5) a que el health check pase.</div>
      </div>
    `
  },
  {
    title: 'get_url: descarga de archivos con verificación de integridad',
    body: `
      <p><code>get_url</code> descarga archivos de forma idempotente: si el archivo ya existe en el destino con el checksum correcto, no lo descarga de nuevo.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">get-url-ejemplos.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Descarga de archivos con get_url
  hosts: all
  tasks:
# Descarga básica con checksum (idempotente)
- name: Descargar binario de la aplicación
  ansible.builtin.get_url:
    url: "https://releases.empresa.com/myapp-{{ app_version }}-linux-amd64.tar.gz"
    dest: /opt/downloads/myapp-{{ app_version }}.tar.gz
    checksum: "sha256:{{ app_sha256_checksum }}"   # Verifica integridad
    owner: root
    group: root
    mode: '0644'
    timeout: 120   # Timeout en segundos para la descarga

- name: Extraer binario (idempotente con creates)
  ansible.builtin.unarchive:
    src: /opt/downloads/myapp-{{ app_version }}.tar.gz
    dest: /opt/myapp/
    remote_src: true   # El archivo está en el host remoto, no en el control node
    creates: /opt/myapp/bin/myapp   # No descomprime si ya existe

# Descarga con autenticación HTTP básica
- name: Descargar artefacto desde Nexus
  ansible.builtin.get_url:
    url: "https://nexus.empresa.com/repository/releases/myapp-{{ app_version }}.jar"
    dest: /opt/app/myapp.jar
    url_username: "{{ nexus_user }}"
    url_password: "{{ nexus_password }}"
    checksum: "md5:{{ jar_md5 }}"
    force: false   # No re-descarga si el checksum ya coincide

# Descarga de clave GPG para repositorio
- name: Descargar clave GPG de Docker
  ansible.builtin.get_url:
    url: https://download.docker.com/linux/ubuntu/gpg
    dest: /etc/apt/keyrings/docker.asc
    mode: '0644'</code></pre>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>uri vs get_url — cuándo usar cada uno:</strong>
          <table class="comparison-table">
            <thead><tr><th>Criterio</th><th>uri</th><th>get_url</th></tr></thead>
            <tbody>
              <tr><td>Propósito</td><td>APIs REST, webhooks, health checks</td><td>Descargar archivos</td></tr>
              <tr><td>Métodos HTTP</td><td>GET, POST, PUT, DELETE, PATCH</td><td>Solo GET</td></tr>
              <tr><td>Checksum</td><td>No</td><td>Sí (sha256, md5, sha1)</td></tr>
              <tr><td>Idempotencia</td><td>Manual con status_code</td><td>Automática si el checksum coincide</td></tr>
              <tr><td>Timeout</td><td>timeout param</td><td>timeout param</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `
  },
  {
    title: 'Firewall: ufw y firewalld',
    body: `
      <p>Ansible tiene módulos específicos para los dos firewalls más comunes en Linux: UFW (Ubuntu/Debian) y firewalld (RHEL/CentOS/Fedora). Ambos son idempotentes.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">firewall.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Configuración de firewall
  hosts: all
  become: true
  tasks:
# community.general.ufw — para Ubuntu/Debian
- name: Instalar ufw
  ansible.builtin.package:
    name: ufw
    state: present
  when: ansible_os_family == "Debian"

- name: Resetear ufw a estado inicial
  community.general.ufw:
    state: reset   # Cuidado: elimina todas las reglas
  when: ufw_fresh_install | default(false) | bool

- name: Permitir SSH (antes de habilitar ufw)
  community.general.ufw:
    rule: allow
    port: "22"
    proto: tcp
    comment: "SSH access"
  when: ansible_os_family == "Debian"

- name: Permitir puertos de la aplicación web
  community.general.ufw:
    rule: allow
    port: "{{ item.port }}"
    proto: "{{ item.proto | default('tcp') }}"
    comment: "{{ item.comment | default('') }}"
  loop:
    - { port: "80", comment: "HTTP" }
    - { port: "443", comment: "HTTPS" }
    - { port: "8080", comment: "App server" }
  when: ansible_os_family == "Debian"

- name: Denegar todo y habilitar ufw
  community.general.ufw:
    state: enabled
    policy: deny     # Denegar por defecto
  when: ansible_os_family == "Debian"

# ansible.posix.firewalld — para RHEL/CentOS/Fedora
- name: Habilitar e iniciar firewalld
  ansible.builtin.service:
    name: firewalld
    state: started
    enabled: true
  when: ansible_os_family == "RedHat"

- name: Permitir HTTP y HTTPS en firewalld
  ansible.posix.firewalld:
    service: "{{ item }}"
    permanent: true   # Persistir al reiniciar
    state: enabled
    immediate: true   # Aplicar inmediatamente sin reiniciar
  loop: [http, https]
  when: ansible_os_family == "RedHat"

- name: Abrir puerto personalizado en firewalld
  ansible.posix.firewalld:
    port: 8080/tcp
    permanent: true
    state: enabled
    immediate: true
    zone: public     # Zona de firewalld
  when: ansible_os_family == "RedHat"</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Dependencias de colecciones:</strong> <code>community.general.ufw</code> requiere la colección <code>community.general</code>. <code>ansible.posix.firewalld</code> requiere la colección <code>ansible.posix</code>. Instalá con <code>ansible-galaxy collection install community.general ansible.posix</code>.</div>
      </div>
    `
  }
],
quiz: [
  {
    question: '¿Cómo se hace que el módulo `uri` reintente hasta que la aplicación responda?',
    options: [
      'No es posible, uri solo hace una petición',
      'Con `retry: 30` en el módulo uri',
      'Con `until`, `retries` y `delay` en la tarea',
      'Con `loop` y múltiples URLs',
    ],
    correctIndex: 2,
    explanation: 'La combinación `until: condición`, `retries: N`, `delay: S` hace que Ansible repita la tarea hasta N veces con S segundos de espera entre intentos, hasta que la condición sea verdadera. Es el patrón estándar para esperar que un servicio arranque.',
  },
  {
    question: '¿Por qué `get_url` no re-descarga un archivo si ya existe en el destino?',
    options: [
      'Siempre descarga de nuevo, no tiene idempotencia',
      'Si el checksum especificado coincide con el archivo existente, no lo descarga de nuevo',
      'Solo re-descarga si el archivo tiene más de 24 horas',
      'Compara el tamaño del archivo, no el contenido',
    ],
    correctIndex: 1,
    explanation: 'get_url calcula el checksum del archivo existente en el destino y lo compara con el checksum especificado en el parámetro `checksum`. Si coinciden, reporta `changed: false` sin descargar. Si no hay checksum especificado, siempre descarga cuando `force: false` compara el tamaño.',
  },
  {
    question: 'En `ansible.posix.firewalld`, ¿qué diferencia hay entre `permanent: true` con y sin `immediate: true`?',
    options: [
      'No hay diferencia funcional',
      'permanent:true con immediate:true guarda la regla en disco Y la activa ahora; sin immediate solo la guarda en disco pero no la activa hasta el próximo reinicio de firewalld',
      'immediate:true es más rápido que permanent:true',
      'permanent:true sin immediate solo funciona en CentOS, no en RHEL',
    ],
    correctIndex: 1,
    explanation: 'En firewalld, una regla puede ser "runtime" (activa ahora pero no persiste al reiniciar) o "permanent" (persiste pero no activa ahora). Con `permanent: true` y `immediate: true`, Ansible aplica la regla en ambos contextos: activa ahora Y persiste al reiniciar. Solo permanent sin immediate requiere `firewall-cmd --reload` para activarse.',
  },
],
troubleshooting: [
  {
    error: 'ansible.builtin.uri falla con SSL certificate verification failed',
    cause: 'El certificado SSL del servidor no es de confianza (auto-firmado, expirado, o la CA raíz no está en el bundle del control node).',
    fix: 'Para desarrollo/staging: agrega `validate_certs: false`. Para producción: instala el certificado CA en el control node o usa `ca_path` para especificar el bundle de CAs. Nunca deshabilites validate_certs en producción.',
  },
  {
    error: 'community.general.ufw falla con "Module not found"',
    cause: 'La colección community.general no está instalada en el control node o en el entorno virtual de Python.',
    fix: 'Instalá la colección: `ansible-galaxy collection install community.general`. Si usás un entorno virtual, asegurate de activarlo antes de ejecutar ansible-galaxy.',
  },
  {
    error: 'get_url falla con "Checksum mismatch" aunque el archivo parece correcto',
    cause: 'El checksum esperado no coincide con el del archivo descargado. Puede ser que el proveedor actualizó el archivo sin cambiar la URL, o que el checksum en la variable esté mal.',
    fix: 'Verificá el checksum manualmente: `sha256sum /opt/archivo.tar.gz` y compará con el esperado. Si el proveedor actualizó el binario, necesitás actualizar el checksum en tus variables.',
  },
],
  };
