import type { StepContent } from '../types';

export const nivel18Mod1StepsA: StepContent[] = [
  {
    title: '¿Por qué Ansible en lugar de docker-compose directamente?',
    body: `
      <p>Si ya tenés <code>docker-compose.yml</code>, ¿para qué agregar Ansible? La respuesta está en la escala y la integración.</p>
      <div class="highlight-box">
        <p><strong>docker-compose resuelve un host. Ansible resuelve una flota.</strong> Cuando tenés 1 servidor, docker-compose alcanza. Cuando tenés 20 servidores con diferentes versiones de imágenes, configuraciones por ambiente y secretos distintos, necesitás Ansible.</p>
      </div>
      <p>Las ventajas concretas de usar Ansible para gestionar contenedores:</p>
      <ul>
        <li><strong>Flota unificada:</strong> el mismo playbook despliega el stack en dev, staging y producción con variables distintas</li>
        <li><strong>Integración nativa:</strong> instalás Docker, configurás el firewall, desplegás el stack y verificás health checks — todo en un solo playbook</li>
        <li><strong>Idempotencia real:</strong> Ansible no reinicia un contenedor que ya está corriendo con la configuración correcta</li>
        <li><strong>Secrets management:</strong> Ansible Vault cifra tus contraseñas de base de datos antes de pasarlas al contenedor</li>
        <li><strong>Rollbacks auditados:</strong> cada cambio queda en git y es reproducible</li>
      </ul>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>docker-compose es como configurar un restaurante a mano. Ansible es el sistema de franquicias que garantiza que los 50 locales tienen la misma configuración, el mismo menú y los mismos procesos — con variaciones controladas por ciudad.</p>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Cuándo NO usar Ansible para contenedores:</strong> si tu stack vive en Kubernetes, usá el módulo <code>kubernetes.core.k8s</code> (módulo 2 de este nivel). Ansible + contenedores directos es ideal para infraestructura sin orquestador o para bootstrapping del clúster K8s.</div>
      </div>
    `,
  },
  {
    title: 'Instalar community.docker y Docker Engine',
    body: `
      <p>Antes de gestionar contenedores necesitás dos cosas: la colección de Ansible y Docker Engine en los hosts.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalar-coleccion.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Instalar la colección en el control node
ansible-galaxy collection install community.docker

# Verificar instalación
ansible-galaxy collection list | grep docker

# También necesitás el SDK de Python de Docker en el control node
pip install docker docker-compose</code></pre>
      </div>
      <p>Ahora instalá Docker Engine en los hosts objetivo con un role:</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/docker/tasks/main.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Instalar dependencias previas
  ansible.builtin.apt:
name:
  - ca-certificates
  - curl
  - gnupg
state: present
update_cache: true

- name: Agregar clave GPG de Docker
  ansible.builtin.apt_key:
url: https://download.docker.com/linux/ubuntu/gpg
state: present

- name: Agregar repositorio de Docker
  ansible.builtin.apt_repository:
repo: "deb [arch=amd64] https://download.docker.com/linux/ubuntu {{ ansible_distribution_release }} stable"
state: present

- name: Instalar Docker Engine
  ansible.builtin.apt:
name:
  - docker-ce
  - docker-ce-cli
  - containerd.io
  - docker-buildx-plugin
  - docker-compose-plugin
state: present
update_cache: true

- name: Asegurar que Docker está activo y habilitado
  ansible.builtin.service:
name: docker
state: started
enabled: true

- name: Agregar usuario al grupo docker (sin sudo)
  ansible.builtin.user:
name: "{{ ansible_user }}"
groups: docker
append: true</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Reinicio de sesión:</strong> después de agregar el usuario al grupo <code>docker</code>, la sesión SSH actual no refleja el cambio. El usuario necesita salir y volver a entrar, o ejecutar <code>newgrp docker</code>. En pipelines de CI, usá <code>become: true</code> para evitar este problema.</div>
      </div>
    `,
  },
  {
    title: 'docker_container: desplegar, actualizar y eliminar',
    body: `
      <p>El módulo <code>community.docker.docker_container</code> es el equivalente a <code>docker run</code>, pero declarativo e idempotente.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">deploy-containers.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Gestión de contenedores con Ansible
  hosts: webservers
  become: true
  tasks:

# Desplegar un contenedor nginx
- name: Levantar nginx
  community.docker.docker_container:
    name: mi-nginx
    image: nginx:1.25
    state: started          # started | stopped | absent | present
    restart_policy: always  # always | unless-stopped | on-failure | no
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /srv/nginx/conf:/etc/nginx/conf.d:ro
      - /srv/nginx/html:/usr/share/nginx/html:ro
    env:
      NGINX_ENVSUBST_TEMPLATE_DIR: /etc/nginx/templates
    labels:
      app: frontend
      env: "{{ deploy_env }}"
    networks:
      - name: app-network

# Actualizar a una nueva versión (pull forzado)
- name: Actualizar imagen de nginx
  community.docker.docker_container:
    name: mi-nginx
    image: nginx:1.26          # nueva versión
    pull: always               # siempre hace pull antes de comparar
    state: started
    restart_policy: always
    ports:
      - "80:80"

# Eliminar un contenedor
- name: Eliminar contenedor viejo
  community.docker.docker_container:
    name: contenedor-viejo
    state: absent              # elimina el contenedor si existe

# Crear red antes de usarla
- name: Crear red de aplicación
  community.docker.docker_network:
    name: app-network
    state: present
    driver: bridge

# Crear volumen nombrado
- name: Crear volumen para datos
  community.docker.docker_volume:
    name: postgres-data
    state: present</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Idempotencia:</strong> si el contenedor ya existe con la misma imagen y configuración, Ansible no hace nada. Solo actúa cuando hay diferencias. Esto hace que podás ejecutar el playbook en cada deploy sin miedo.</div>
      </div>
    `,
  }
];
