import type { StepContent } from '../types';

export const nivel18Mod1StepsB: StepContent[] = [
  {
    title: 'docker_compose_v2: despliegue de stacks completos',
    body: `
      <p>Para stacks multi-servicio, <code>community.docker.docker_compose_v2</code> trabaja con tu <code>docker-compose.yml</code> existente. Es ideal cuando ya tenés los compose files y querés orquestarlos con Ansible.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">docker-compose.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">services:
  web:
image: "myapp:{{ app_version }}"    # variable de Ansible
ports:
  - "8080:8080"
environment:
  DATABASE_URL: "postgresql://app:{{ db_password }}@db:5432/appdb"
depends_on:
  db:
    condition: service_healthy

  db:
image: postgres:16
volumes:
  - pgdata:/var/lib/postgresql/data
environment:
  POSTGRES_PASSWORD: "{{ db_password }}"
healthcheck:
  test: ["CMD", "pg_isready", "-U", "postgres"]
  interval: 10s
  timeout: 5s
  retries: 5

volumes:
  pgdata:</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">deploy-stack.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Desplegar stack de aplicación
  hosts: app_servers
  become: true
  vars:
app_version: "2.1.0"
deploy_dir: /opt/myapp
  tasks:

- name: Crear directorio de despliegue
  ansible.builtin.file:
    path: "{{ deploy_dir }}"
    state: directory
    mode: '0755'

- name: Copiar compose file con variables resueltas
  ansible.builtin.template:
    src: docker-compose.yml.j2
    dest: "{{ deploy_dir }}/docker-compose.yml"

- name: Levantar el stack
  community.docker.docker_compose_v2:
    project_src: "{{ deploy_dir }}"   # directorio con el compose file
    state: present                     # present | absent
    pull: always                       # siempre actualizar imágenes
    recreate: auto                     # recrear si hay cambios

- name: Escalar el servicio web a 3 réplicas
  community.docker.docker_compose_v2:
    project_src: "{{ deploy_dir }}"
    services:
      web:
        scale: 3</code></pre>
      </div>
    `,
  },
  {
    title: 'Podman rootless con containers.podman',
    body: `
      <p>Podman es una alternativa a Docker que corre contenedores sin daemon y sin root — ideal para entornos de seguridad elevada. La colección <code>containers.podman</code> ofrece módulos equivalentes.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalar-podman.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Instalar la colección
ansible-galaxy collection install containers.podman

# Dependencia Python en el control node
pip install podman</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">podman-rootless.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Desplegar contenedores rootless con Podman
  hosts: secure_servers
  become: false          # IMPORTANTE: rootless = sin sudo
  tasks:

- name: Instalar Podman
  ansible.builtin.package:
    name: podman
    state: present
  become: true       # solo para instalar el paquete

- name: Crear red Podman
  containers.podman.podman_network:
    name: app-net
    state: present

- name: Desplegar contenedor nginx rootless
  containers.podman.podman_container:
    name: nginx-rootless
    image: docker.io/nginx:1.25
    state: started
    ports:
      - "8080:80"      # puerto ≥ 1024 para rootless
    volumes:
      - /home/{{ ansible_user }}/html:/usr/share/nginx/html:ro
    network: app-net
    restart_policy: always
    generate_systemd:          # generar unit de systemd
      path: ~/.config/systemd/user/
      restart_policy: always

- name: Habilitar servicio systemd del usuario (persiste tras reboot)
  ansible.builtin.systemd:
    name: container-nginx-rootless
    enabled: true
    state: started
    scope: user</code></pre>
      </div>
      <div class="highlight-box">
        <p><strong>Rootless vs Docker:</strong> los contenedores Podman rootless corren con el UID del usuario, no como root. Si el contenedor es comprometido, el atacante obtiene permisos de usuario normal — no de root del sistema. Es más seguro para workloads sensibles.</p>
      </div>
    `,
  },
  {
    title: 'Práctica: stack nginx + postgres con Ansible',
    body: `
      <p>Construí un playbook completo que despliega nginx como frontend y PostgreSQL como backend usando contenedores gestionados por Ansible.</p>
      <div class="lab-box">
        <div class="lab-box-header">🧪 Laboratorio: Stack Web Completo</div>
        <p><strong>Objetivo:</strong> Desplegar nginx + PostgreSQL en un servidor remoto, con healthchecks y variables cifradas con Vault.</p>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">deploy-full-stack.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Desplegar stack nginx + PostgreSQL
  hosts: app_servers
  become: true
  vars_files:
- vault/secrets.yml      # db_password cifrado con Vault
  vars:
app_network: webapp-net
postgres_volume: pgdata-vol

  tasks:

- name: Crear red Docker compartida
  community.docker.docker_network:
    name: "{{ app_network }}"
    state: present

- name: Crear volumen persistente para PostgreSQL
  community.docker.docker_volume:
    name: "{{ postgres_volume }}"
    state: present

- name: Desplegar PostgreSQL
  community.docker.docker_container:
    name: postgres
    image: postgres:16-alpine
    state: started
    restart_policy: unless-stopped
    networks:
      - name: "{{ app_network }}"
    volumes:
      - "{{ postgres_volume }}:/var/lib/postgresql/data"
    env:
      POSTGRES_DB: appdb
      POSTGRES_USER: app
      POSTGRES_PASSWORD: "{{ db_password }}"
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "app", "-d", "appdb"]
      interval: 10s
      timeout: 5s
      retries: 5

- name: Esperar a que PostgreSQL esté listo
  community.docker.docker_container_info:
    name: postgres
  register: pg_info
  until: pg_info.container.State.Health.Status == "healthy"
  retries: 12
  delay: 5

- name: Copiar configuración de nginx
  ansible.builtin.template:
    src: nginx.conf.j2
    dest: /etc/nginx/conf.d/app.conf

- name: Desplegar nginx
  community.docker.docker_container:
    name: nginx
    image: nginx:1.25-alpine
    state: started
    restart_policy: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    networks:
      - name: "{{ app_network }}"
    volumes:
      - /etc/nginx/conf.d:/etc/nginx/conf.d:ro
      - /var/www/html:/usr/share/nginx/html:ro

- name: Verificar que nginx responde
  ansible.builtin.uri:
    url: http://localhost:80/health
    status_code: 200
  retries: 3
  delay: 5</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Próximo paso:</strong> agregá un role <code>docker</code> para reutilizar la instalación de Docker Engine en múltiples proyectos. Así el playbook queda limpio y el role es portable.</div>
      </div>
    `,
  }
];
