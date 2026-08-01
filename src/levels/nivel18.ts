import type { ModuleContent } from './types';

export const nivel18Modules: ModuleContent[] = [
  {
    levelId: 18,
    moduleId: 1,
    title: 'Docker y Podman con Ansible',
    objective:
      'Gestionar contenedores Docker y Podman a escala usando Ansible: instalación, despliegue, actualización y orquestación de stacks completos con community.docker y containers.podman.',
    duration: '3–4 horas',
    objectives: [
      'Entender por qué Ansible supera a docker-compose para gestión de flotas de contenedores',
      'Instalar la colección community.docker y Docker Engine mediante Ansible',
      'Desplegar, actualizar y eliminar contenedores con docker_container y docker_compose_v2',
      'Gestionar contenedores rootless con Podman usando containers.podman',
    ],
    prerequisites: [
      'Niveles 0–17 completados',
      'Conceptos básicos de Docker (imágenes, contenedores, redes, volúmenes)',
      'Control node con Python 3.8+ y acceso a hosts objetivo',
    ],
    steps: [
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
      },
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
      },
    ],
    quiz: [
      {
        question:
          '¿Cuál es la principal ventaja de usar Ansible en lugar de docker-compose para gestionar contenedores en producción?',
        options: [
          'Ansible es más rápido que docker-compose para iniciar contenedores',
          'Ansible permite gestionar flotas de múltiples hosts con variables por ambiente de forma uniforme',
          'docker-compose no soporta volúmenes persistentes',
          'Ansible no requiere instalar Docker en el host',
        ],
        correctIndex: 1,
        explanation:
          'La ventaja clave de Ansible sobre docker-compose es la gestión de flotas: el mismo playbook puede desplegar stacks en decenas de hosts con variables diferentes por ambiente (dev/staging/prod). docker-compose es excelente para un solo host, pero no escala a infraestructuras múltiples.',
      },
      {
        question:
          '¿Qué parámetro del módulo docker_container garantiza que siempre se descargue la última versión de la imagen antes de comparar?',
        options: [
          'state: latest',
          'update: always',
          'pull: always',
          'image_force: true',
        ],
        correctIndex: 2,
        explanation:
          'El parámetro <code>pull: always</code> en <code>community.docker.docker_container</code> fuerza un <code>docker pull</code> antes de verificar si el contenedor necesita recrearse. Sin este parámetro, Ansible usa la imagen local aunque exista una versión más nueva en el registro.',
      },
      {
        question:
          '¿Por qué los contenedores Podman rootless son más seguros que los contenedores Docker estándar?',
        options: [
          'Podman usa cifrado TLS para todas las comunicaciones entre contenedores',
          'Podman no permite montar volúmenes del host',
          'Los contenedores rootless corren con el UID del usuario, no como root del sistema',
          'Podman utiliza namespaces diferentes que Docker',
        ],
        correctIndex: 2,
        explanation:
          'Los contenedores Podman rootless se ejecutan mapeados al UID del usuario que los inicia. Si un atacante compromete el contenedor y escapa al host, obtiene los permisos del usuario normal — no de root. Esto reduce drásticamente el impacto de una brecha de seguridad en comparación con Docker, donde el daemon corre como root.',
      },
    ],
    realWorldCase:
      'Una empresa de SaaS migra su pipeline de despliegue de scripts bash + docker-compose a Ansible: un único playbook instala Docker Engine, configura el firewall, despliega el stack de 6 servicios con secrets cifrados con Vault y verifica healthchecks — eliminando inconsistencias entre 30 servidores de producción.',
    troubleshooting: [
      {
        error: 'ModuleNotFoundError: No module named "docker"',
        cause:
          'El SDK de Python de Docker no está instalado en el control node. Ansible necesita este paquete para comunicarse con el daemon Docker del host remoto.',
        fix: 'Ejecutá <code>pip install docker</code> en el control node. Si usás un virtualenv de Ansible, asegurate de instalarlo dentro del entorno virtual: <code>pip install docker docker-compose</code>.',
      },
      {
        error: 'community.docker not found — colección no instalada',
        cause:
          'La colección <code>community.docker</code> no está instalada en el control node o no está en el <code>ANSIBLE_COLLECTIONS_PATH</code>.',
        fix: 'Instalá la colección con <code>ansible-galaxy collection install community.docker</code>. Para proyectos, definila en <code>requirements.yml</code> y ejecutá <code>ansible-galaxy collection install -r requirements.yml</code> en CI.',
      },
      {
        error: 'Got permission denied while trying to connect to the Docker daemon socket',
        cause:
          'El usuario remoto no tiene permisos para acceder al socket Docker. Esto ocurre cuando el usuario no está en el grupo <code>docker</code> o la sesión no se reinició después de agregarlo.',
        fix: 'Agregá <code>become: true</code> en las tareas Docker, o asegurate de que el usuario esté en el grupo docker (<code>usermod -aG docker usuario</code>) y que haya iniciado una nueva sesión SSH. Verificá con <code>docker info</code> en el host.',
      },
    ],
  },
  {
    levelId: 18,
    moduleId: 2,
    title: 'Kubernetes con Ansible',
    objective:
      'Gestionar recursos de Kubernetes y charts de Helm usando Ansible: desde provisionar el clúster hasta desplegar Deployments, Services y ConfigMaps con kubernetes.core.',
    duration: '3–4 horas',
    objectives: [
      'Comprender por qué combinar Ansible y Kubernetes en el mismo pipeline',
      'Usar kubernetes.core.k8s para gestionar cualquier recurso de K8s de forma declarativa',
      'Desplegar y actualizar Helm charts con kubernetes.core.helm',
      'Generar manifiestos K8s dinámicos con templates Jinja2',
    ],
    prerequisites: [
      'Módulo 1 de este nivel completado',
      'Conceptos básicos de Kubernetes (Pod, Deployment, Service, Namespace)',
      'kubectl instalado y clúster accesible (Minikube, Kind o clúster real)',
    ],
    steps: [
      {
        title: '¿Por qué Ansible + Kubernetes?',
        body: `
          <p>Kubernetes gestiona la vida de las aplicaciones una vez que están corriendo. Ansible gestiona todo lo que rodea a Kubernetes: el clúster mismo, los nodos, los namespaces, los secrets y el pipeline de despliegue.</p>
          <div class="highlight-box">
            <p><strong>La combinación ganadora:</strong> Ansible provisiona el clúster (instala kubeadm, configura nodos, aplica CNI), luego despliega las aplicaciones con el mismo playbook. Un solo pipeline, una sola fuente de verdad.</p>
          </div>
          <p>Casos donde Ansible supera a kubectl/Helm puros:</p>
          <ul>
            <li><strong>Bootstrap del clúster:</strong> crear VMs, instalar dependencias, inicializar el clúster y deployar apps — todo en un playbook</li>
            <li><strong>Variables dinámicas:</strong> generar manifiestos K8s con Jinja2 usando variables de Ansible (versiones, configuraciones por ambiente)</li>
            <li><strong>Orquestación multi-capa:</strong> aplicar migrations de base de datos, desplegar en K8s y verificar smoke tests, en orden</li>
            <li><strong>Gestión de secrets:</strong> sacar valores de Ansible Vault e inyectarlos como K8s Secrets — sin exponerlos en git</li>
          </ul>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>¿Cuándo usar kubectl directamente?</strong> Para operaciones one-off de debugging o cuando el equipo es puramente de plataforma y ya tiene flujos establecidos con kubectl/Helm. Ansible + K8s brilla en pipelines automatizados y en entornos mixtos (VMs + contenedores + K8s).</div>
          </div>
        `,
      },
      {
        title: 'Instalar la colección kubernetes.core',
        body: `
          <p>La colección <code>kubernetes.core</code> (anteriormente <code>community.kubernetes</code>) es la suite oficial para interactuar con Kubernetes desde Ansible.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">instalar-k8s.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Instalar la colección
ansible-galaxy collection install kubernetes.core

# Dependencias Python en el control node
pip install kubernetes openshift

# Para Helm también necesitás el binario instalado
# En el control node:
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verificar que todo está disponible
kubectl version --client
helm version
ansible-galaxy collection list | grep kubernetes</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">requirements.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
collections:
  - name: kubernetes.core
    version: ">=3.0.0"
  - name: community.docker
    version: ">=3.0.0"</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Kubeconfig:</strong> el módulo <code>kubernetes.core.k8s</code> busca la configuración del clúster en <code>~/.kube/config</code> por defecto. Podés sobreescribir esto con el parámetro <code>kubeconfig</code> o la variable de entorno <code>K8S_AUTH_KUBECONFIG</code>. En CI, pasalo como variable cifrada con Vault.</div>
          </div>
        `,
      },
      {
        title: 'kubernetes.core.k8s: gestionar cualquier recurso',
        body: `
          <p>El módulo <code>kubernetes.core.k8s</code> puede gestionar cualquier recurso de Kubernetes — Deployments, Services, ConfigMaps, Secrets, Namespaces, CRDs. Es el <code>kubectl apply</code> de Ansible, pero declarativo e idempotente.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">deploy-k8s-resources.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Desplegar aplicación en Kubernetes
  hosts: localhost          # k8s.core corre en el control node
  connection: local
  gather_facts: false
  vars:
    app_namespace: production
    app_version: "2.1.0"
    replica_count: 3

  tasks:

    - name: Crear namespace si no existe
      kubernetes.core.k8s:
        api_version: v1
        kind: Namespace
        name: "{{ app_namespace }}"
        state: present

    - name: Crear ConfigMap con configuración
      kubernetes.core.k8s:
        state: present
        definition:
          apiVersion: v1
          kind: ConfigMap
          metadata:
            name: app-config
            namespace: "{{ app_namespace }}"
          data:
            LOG_LEVEL: info
            MAX_CONNECTIONS: "100"
            FEATURE_FLAG_NEW_UI: "true"

    - name: Crear Secret desde Vault
      kubernetes.core.k8s:
        state: present
        definition:
          apiVersion: v1
          kind: Secret
          metadata:
            name: app-secrets
            namespace: "{{ app_namespace }}"
          type: Opaque
          stringData:
            DATABASE_URL: "{{ db_connection_string }}"  # desde Vault
            API_KEY: "{{ api_key }}"                    # desde Vault

    - name: Desplegar aplicación
      kubernetes.core.k8s:
        state: present
        definition:
          apiVersion: apps/v1
          kind: Deployment
          metadata:
            name: myapp
            namespace: "{{ app_namespace }}"
          spec:
            replicas: "{{ replica_count }}"
            selector:
              matchLabels:
                app: myapp
            template:
              metadata:
                labels:
                  app: myapp
                  version: "{{ app_version }}"
              spec:
                containers:
                  - name: myapp
                    image: "myregistry/myapp:{{ app_version }}"
                    envFrom:
                      - configMapRef:
                          name: app-config
                      - secretRef:
                          name: app-secrets

    - name: Esperar a que el Deployment esté listo
      kubernetes.core.k8s_info:
        api_version: apps/v1
        kind: Deployment
        name: myapp
        namespace: "{{ app_namespace }}"
        wait: true
        wait_condition:
          type: Available
          status: "True"
        wait_timeout: 120</code></pre>
          </div>
        `,
      },
      {
        title: 'kubernetes.core.helm: gestión de Helm charts',
        body: `
          <p>El módulo <code>kubernetes.core.helm</code> instala, actualiza y elimina Helm charts desde Ansible. Podés combinar repositorios públicos de charts con valores generados dinámicamente con Jinja2.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">helm-deploy.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Gestionar Helm charts con Ansible
  hosts: localhost
  connection: local
  gather_facts: false

  tasks:

    - name: Agregar repositorio de Helm (cert-manager)
      kubernetes.core.helm_repository:
        name: jetstack
        repo_url: https://charts.jetstack.io
        state: present

    - name: Agregar repositorio de ingress-nginx
      kubernetes.core.helm_repository:
        name: ingress-nginx
        repo_url: https://kubernetes.github.io/ingress-nginx
        state: present

    - name: Instalar cert-manager
      kubernetes.core.helm:
        name: cert-manager
        chart_ref: jetstack/cert-manager
        chart_version: "v1.14.0"
        release_namespace: cert-manager
        create_namespace: true
        values:
          installCRDs: true
          replicaCount: 2
        state: present
        wait: true
        wait_timeout: "5m"

    - name: Instalar ingress-nginx con valores dinámicos
      kubernetes.core.helm:
        name: ingress-nginx
        chart_ref: ingress-nginx/ingress-nginx
        chart_version: "4.9.0"
        release_namespace: ingress-nginx
        create_namespace: true
        values:
          controller:
            replicaCount: "{{ ingress_replicas | default(2) }}"
            service:
              type: LoadBalancer
              annotations:
                service.beta.kubernetes.io/aws-load-balancer-type: nlb
        state: present

    - name: Actualizar mi app con nuevo chart
      kubernetes.core.helm:
        name: myapp
        chart_ref: ./charts/myapp     # chart local
        release_namespace: production
        values_files:
          - values/base.yml
          - values/production.yml     # override de producción
        values:
          image.tag: "{{ app_version }}"    # variable de Ansible
        state: present
        atomic: true            # rollback automático si falla</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>atomic: true</strong> es tu red de seguridad en producción. Si el chart falla en desplegarse (pods no Ready en el timeout), Helm hace rollback automático a la release anterior. Siempre usalo en ambientes productivos.</div>
          </div>
        `,
      },
      {
        title: 'Manifiestos K8s con templates Jinja2',
        body: `
          <p>En lugar de incrustar el YAML de K8s directamente en el playbook, podés usar templates Jinja2 para generar manifiestos dinámicos. Esto es especialmente útil cuando el mismo template se usa para múltiples ambientes.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">templates/deployment.yml.j2</span></div>
            <pre class="language-yaml"><code class="language-yaml">apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ app_name }}
  namespace: {{ app_namespace }}
  labels:
    app: {{ app_name }}
    env: {{ deploy_env }}
    version: {{ app_version }}
spec:
  replicas: {{ replica_count }}
  selector:
    matchLabels:
      app: {{ app_name }}
  template:
    metadata:
      labels:
        app: {{ app_name }}
    spec:
      containers:
        - name: {{ app_name }}
          image: {{ container_registry }}/{{ app_name }}:{{ app_version }}
          resources:
            requests:
              cpu: {{ cpu_request | default('100m') }}
              memory: {{ memory_request | default('128Mi') }}
            limits:
              cpu: {{ cpu_limit | default('500m') }}
              memory: {{ memory_limit | default('512Mi') }}
{% if env_vars is defined %}
          env:
{% for key, value in env_vars.items() %}
            - name: {{ key }}
              value: "{{ value }}"
{% endfor %}
{% endif %}</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">apply-templates.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Aplicar manifiestos K8s desde templates
  hosts: localhost
  connection: local
  vars_files:
    - vars/{{ deploy_env }}.yml   # vars/production.yml, vars/staging.yml
  tasks:

    - name: Aplicar Deployment desde template
      kubernetes.core.k8s:
        state: present
        template: templates/deployment.yml.j2   # Jinja2 nativo en k8s

    - name: Aplicar desde directorio de templates
      kubernetes.core.k8s:
        state: present
        template: "{{ item }}"
      loop: "{{ query('fileglob', 'templates/*.yml.j2') }}"</code></pre>
          </div>
          <div class="highlight-box">
            <p><strong>Ventaja sobre kubectl apply -f:</strong> los templates Jinja2 te permiten un único conjunto de manifiestos para todos los ambientes. Las diferencias (réplicas, recursos, imágenes) viven en archivos de variables por ambiente, no en múltiples carpetas de manifiestos duplicados.</p>
          </div>
        `,
      },
      {
        title: 'Práctica: Deployment + Service + ConfigMap',
        body: `
          <p>Desplegá una aplicación completa en Kubernetes usando Ansible: un Deployment, un Service de tipo LoadBalancer y un ConfigMap con la configuración de la aplicación.</p>
          <div class="lab-box">
            <div class="lab-box-header">🧪 Laboratorio: App completa en K8s</div>
            <p><strong>Objetivo:</strong> Desplegar una aplicación web en el namespace <code>lab</code>, exponerla y verificar que está healthy.</p>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">lab-k8s-deploy.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Lab — App completa en Kubernetes
  hosts: localhost
  connection: local
  gather_facts: false
  vars:
    namespace: lab
    app: demo-web
    image: nginx:1.25-alpine
    replicas: 2

  tasks:

    - name: Crear namespace lab
      kubernetes.core.k8s:
        api_version: v1
        kind: Namespace
        name: "{{ namespace }}"
        state: present

    - name: ConfigMap con página HTML
      kubernetes.core.k8s:
        state: present
        definition:
          apiVersion: v1
          kind: ConfigMap
          metadata:
            name: "{{ app }}-html"
            namespace: "{{ namespace }}"
          data:
            index.html: |
              <!DOCTYPE html>
              <html><body>
                <h1>Desplegado por Ansible 🚀</h1>
                <p>Versión: {{ app_version | default('1.0.0') }}</p>
                <p>Ambiente: {{ deploy_env | default('lab') }}</p>
              </body></html>

    - name: Deployment nginx
      kubernetes.core.k8s:
        state: present
        definition:
          apiVersion: apps/v1
          kind: Deployment
          metadata:
            name: "{{ app }}"
            namespace: "{{ namespace }}"
          spec:
            replicas: "{{ replicas }}"
            selector:
              matchLabels:
                app: "{{ app }}"
            template:
              metadata:
                labels:
                  app: "{{ app }}"
              spec:
                containers:
                  - name: nginx
                    image: "{{ image }}"
                    ports:
                      - containerPort: 80
                    volumeMounts:
                      - name: html
                        mountPath: /usr/share/nginx/html
                volumes:
                  - name: html
                    configMap:
                      name: "{{ app }}-html"

    - name: Service LoadBalancer
      kubernetes.core.k8s:
        state: present
        definition:
          apiVersion: v1
          kind: Service
          metadata:
            name: "{{ app }}-svc"
            namespace: "{{ namespace }}"
          spec:
            selector:
              app: "{{ app }}"
            ports:
              - port: 80
                targetPort: 80
            type: LoadBalancer

    - name: Verificar pods running
      kubernetes.core.k8s_info:
        kind: Pod
        namespace: "{{ namespace }}"
        label_selectors:
          - "app={{ app }}"
        wait: true
        wait_condition:
          type: Ready
          status: "True"

    - name: Mostrar URL del servicio
      kubernetes.core.k8s_info:
        kind: Service
        name: "{{ app }}-svc"
        namespace: "{{ namespace }}"
      register: svc_info

    - name: Imprimir IP externa
      ansible.builtin.debug:
        msg: "App disponible en: http://{{ svc_info.resources[0].status.loadBalancer.ingress[0].ip }}"</code></pre>
          </div>
        `,
      },
    ],
    quiz: [
      {
        question:
          '¿En qué host se ejecutan los módulos de kubernetes.core por defecto?',
        options: [
          'En cada nodo worker del clúster Kubernetes',
          'En el nodo master del clúster',
          'En el control node de Ansible (localhost con connection: local)',
          'En el primer host del inventario de Ansible',
        ],
        correctIndex: 2,
        explanation:
          'Los módulos de <code>kubernetes.core</code> se ejecutan en el control node de Ansible (tu máquina o el servidor de CI), no en los nodos del clúster. Se comunican con la API de Kubernetes usando el kubeconfig disponible en el control node. Por eso se usa <code>hosts: localhost</code> y <code>connection: local</code>.',
      },
      {
        question:
          '¿Qué hace el parámetro <code>atomic: true</code> en kubernetes.core.helm?',
        options: [
          'Instala el chart en modo atómico usando transacciones SQL',
          'Hace rollback automático a la versión anterior si el despliegue falla',
          'Previene que otros procesos modifiquen el chart durante la instalación',
          'Fuerza la reinstalación completa en lugar de un upgrade incremental',
        ],
        correctIndex: 1,
        explanation:
          'El parámetro <code>atomic: true</code> en Helm significa que si el despliegue falla (los pods no pasan a estado Ready dentro del timeout), Helm hace automáticamente rollback a la release anterior. Es una red de seguridad esencial para producción: garantiza que un deploy fallido no deja el sistema en estado inconsistente.',
      },
      {
        question:
          '¿Cuál es la ventaja principal de usar templates Jinja2 para generar manifiestos K8s en lugar de tener múltiples carpetas de YAMLs por ambiente?',
        options: [
          'Los templates Jinja2 son más rápidos de procesar que YAML estático',
          'Kubernetes solo acepta manifiestos generados con Jinja2',
          'Un único conjunto de templates con variables por ambiente elimina la duplicación y el riesgo de inconsistencias entre ambientes',
          'Los templates permiten usar tipos de datos que YAML no soporta nativamente',
        ],
        correctIndex: 2,
        explanation:
          'Con templates Jinja2, tenés una única fuente de verdad para los manifiestos K8s. Las diferencias entre dev, staging y producción (réplicas, límites de recursos, imágenes) se controlan con variables de Ansible. Esto elimina el problema clásico de tener carpetas <code>k8s/dev/</code>, <code>k8s/staging/</code>, <code>k8s/prod/</code> que se sincronizan manualmente y acaban divergiendo.',
      },
    ],
    realWorldCase:
      'Un equipo de plataforma usa Ansible para provisionar clústeres EKS con eksctl, configurar los namespaces y RBAC, instalar ingress-nginx y cert-manager con Helm, y finalmente desplegar 12 microservicios — todo en un único pipeline de GitLab CI que tarda 8 minutos de extremo a extremo.',
    troubleshooting: [
      {
        error: 'No module named "kubernetes" — ImportError en el módulo k8s',
        cause:
          'El paquete Python <code>kubernetes</code> no está instalado en el control node. Este paquete es la dependencia obligatoria de <code>kubernetes.core</code> para comunicarse con la API de K8s.',
        fix: 'Ejecutá <code>pip install kubernetes openshift</code> en el control node. Si usás un virtualenv de Ansible, instalalo dentro del entorno: <code>pip install kubernetes>=26.1.0</code>. Verificá con <code>python -c "import kubernetes; print(kubernetes.__version__)"</code>.',
      },
      {
        error: 'FileNotFoundError: kubeconfig file not found at ~/.kube/config',
        cause:
          'No hay un kubeconfig disponible en el control node o la ruta por defecto no existe. Esto ocurre en entornos CI/CD donde el clúster no está configurado localmente.',
        fix: 'Usá el parámetro <code>kubeconfig: /ruta/al/kubeconfig</code> en el módulo, o la variable de entorno <code>K8S_AUTH_KUBECONFIG</code>. En CI, guardá el kubeconfig cifrado en Ansible Vault y copialo al control node antes de ejecutar el playbook.',
      },
      {
        error: 'Helm chart upgrade failed: timed out waiting for the condition',
        cause:
          'Los pods del chart no pasaron a estado Ready dentro del timeout configurado. Puede ser por resources insuficientes, imagen incorrecta, ConfigMap faltante o error en el liveness probe.',
        fix: 'Verificá los pods con <code>kubectl get pods -n &lt;namespace&gt;</code> y los logs con <code>kubectl logs &lt;pod-name&gt;</code>. Si usás <code>atomic: true</code>, Helm habrá hecho rollback automático. Ajustá el timeout con <code>wait_timeout: "10m"</code> o corregí el error en los recursos del chart.',
      },
    ],
  },
  {
    levelId: 18,
    moduleId: 3,
    title: 'AWS, Azure y GCP con Ansible',
    objective:
      'Provisionar y gestionar infraestructura cloud en AWS, Azure y GCP usando colecciones Ansible: amazon.aws, azure.azcollection y google.cloud, con inventario dinámico para autodescubrimiento de hosts.',
    duration: '4–5 horas',
    objectives: [
      'Entender el rol de Ansible en IaC cloud y cuándo usarlo vs. Terraform',
      'Provisionar recursos AWS (EC2, S3, RDS, IAM) con amazon.aws',
      'Configurar inventario dinámico con el plugin aws_ec2 para autodescubrimiento',
      'Gestionar VMs en Azure y GCP con sus respectivas colecciones de Ansible',
    ],
    prerequisites: [
      'Módulo 2 de este nivel completado',
      'Cuenta en AWS, Azure o GCP con credenciales de acceso programático',
      'AWS CLI, Azure CLI o gcloud CLI instalados y configurados',
    ],
    steps: [
      {
        title: 'Ansible y cloud: IaC vs. ClickOps',
        body: `
          <p><strong>ClickOps</strong> es el antipatrón de gestionar infraestructura cloud manualmente desde la consola web: hacer clic, configurar, esperar. Es lento, no reproducible y propenso a errores humanos.</p>
          <div class="highlight-box">
            <p><strong>IaC (Infrastructure as Code)</strong> describe la infraestructura en código versionado, revisable y automatizable. Ansible, Terraform y CloudFormation son herramientas de IaC. El código vive en git, los cambios se revisan en pull requests, y los entornos son reproducibles.</p>
          </div>
          <p>¿Cuándo usar Ansible para cloud en lugar de Terraform?</p>
          <table class="comparison-table">
            <tr><th>Ansible para cloud</th><th>Terraform para cloud</th></tr>
            <tr><td>Provisionás infraestructura Y configurás el SO en el mismo pipeline</td><td>Infraestructura pura, sin gestión de configuración</td></tr>
            <tr><td>Integración nativa con roles de configuración existentes</td><td>State management con tfstate — más robusto para IaC a gran escala</td></tr>
            <tr><td>Sin estado local que gestionar (stateless)</td><td>Requiere gestionar el tfstate (backend remoto)</td></tr>
            <tr><td>Ideal para equipos que ya usan Ansible para todo</td><td>Ideal cuando el equipo es dedicado a infraestructura cloud</td></tr>
          </table>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>El patrón mixto más común:</strong> Terraform gestiona la infraestructura base (VPCs, subnets, grupos de seguridad) y Ansible configura las VMs una vez aprovisionadas. Cada herramienta en lo que mejor hace.</div>
          </div>
        `,
      },
      {
        title: 'AWS con amazon.aws: EC2, S3, RDS e IAM',
        body: `
          <p>La colección <code>amazon.aws</code> cubre los servicios core de AWS. Para servicios adicionales está <code>community.aws</code>.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">setup-aws.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Instalar colección
ansible-galaxy collection install amazon.aws

# Dependencia Python
pip install boto3 botocore

# Configurar credenciales AWS (en el control node)
aws configure
# O mediante variables de entorno:
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_DEFAULT_REGION="us-east-1"</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">aws-resources.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Provisionar recursos AWS
  hosts: localhost
  connection: local
  gather_facts: false
  vars:
    region: us-east-1
    instance_type: t3.medium
    ami_id: ami-0c55b159cbfafe1f0   # Amazon Linux 2023

  tasks:

    # EC2 Instance
    - name: Lanzar instancia EC2
      amazon.aws.ec2_instance:
        name: "web-server-{{ deploy_env }}"
        key_name: mi-keypair
        instance_type: "{{ instance_type }}"
        image_id: "{{ ami_id }}"
        region: "{{ region }}"
        security_group: web-sg
        vpc_subnet_id: subnet-abc123
        tags:
          Environment: "{{ deploy_env }}"
          ManagedBy: ansible
        wait: true
        state: running
      register: ec2_result

    # S3 Bucket
    - name: Crear bucket S3 para assets
      amazon.aws.s3_bucket:
        name: "mycompany-assets-{{ deploy_env }}"
        region: "{{ region }}"
        versioning: true
        encryption: aws:kms
        tags:
          Environment: "{{ deploy_env }}"
        state: present

    # RDS Instance
    - name: Crear base de datos RDS
      amazon.aws.rds_instance:
        db_instance_identifier: "myapp-db-{{ deploy_env }}"
        db_instance_class: db.t3.medium
        engine: postgres
        engine_version: "16.1"
        master_username: admin
        master_user_password: "{{ db_password }}"   # desde Vault
        allocated_storage: 20
        db_subnet_group_name: my-subnet-group
        vpc_security_group_ids:
          - sg-rds123
        tags:
          Environment: "{{ deploy_env }}"
        state: present

    # IAM User para la aplicación
    - name: Crear usuario IAM para la app
      amazon.aws.iam_user:
        name: "myapp-{{ deploy_env }}"
        state: present
        tags:
          ManagedBy: ansible</code></pre>
          </div>
        `,
      },
      {
        title: 'Inventario dinámico con aws_ec2',
        body: `
          <p>El inventario dinámico es uno de los features más poderosos de Ansible para cloud. En lugar de mantener un archivo de inventario estático con IPs, Ansible pregunta a AWS cuáles instancias existen en tiempo real.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">inventory/aws_ec2.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
plugin: amazon.aws.aws_ec2
regions:
  - us-east-1
  - us-west-2

# Filtrar solo instancias running con nuestros tags
filters:
  instance-state-name: running
  tag:ManagedBy: ansible

# Agrupar instancias por tag
keyed_groups:
  - key: tags.Environment
    prefix: env
  - key: tags.Role
    prefix: role
  - key: instance_type
    prefix: type

# Usar el DNS privado como hostname (dentro de VPC)
hostnames:
  - private-dns-name

# Variables disponibles para cada host
compose:
  ansible_host: private_ip_address
  ansible_user: "'ec2-user'"</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">usar-inventario-dinamico.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Ver qué hosts descubre el plugin
ansible-inventory -i inventory/aws_ec2.yml --list

# Ver el árbol de grupos
ansible-inventory -i inventory/aws_ec2.yml --graph

# Ejecutar playbook contra instancias del ambiente prod
ansible-playbook -i inventory/aws_ec2.yml site.yml --limit env_production

# Ejecutar solo en instancias de tipo web
ansible-playbook -i inventory/aws_ec2.yml configure-web.yml --limit role_web</code></pre>
          </div>
          <div class="highlight-box">
            <p><strong>Cero mantenimiento del inventario:</strong> cuando lanzás una nueva instancia con el tag correcto, aparece automáticamente en el inventario. Cuando la terminás, desaparece. Sin archivos de inventario que sincronizar manualmente.</p>
          </div>
        `,
      },
      {
        title: 'Azure con azure.azcollection',
        body: `
          <p>La colección <code>azure.azcollection</code> cubre todos los servicios de Azure: VMs, redes, almacenamiento, bases de datos y servicios gestionados.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">setup-azure.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Instalar colección
ansible-galaxy collection install azure.azcollection

# Instalar dependencias Python
pip install -r ~/.ansible/collections/ansible_collections/azure/azcollection/requirements.txt

# Autenticar (Service Principal)
export AZURE_CLIENT_ID="..."
export AZURE_SECRET="..."
export AZURE_SUBSCRIPTION_ID="..."
export AZURE_TENANT="..."</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">azure-vm.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Provisionar VM en Azure
  hosts: localhost
  connection: local
  gather_facts: false
  vars:
    resource_group: myapp-rg
    location: eastus
    vm_name: "web-vm-{{ deploy_env }}"

  tasks:

    - name: Crear Resource Group
      azure.azcollection.azure_rm_resourcegroup:
        name: "{{ resource_group }}"
        location: "{{ location }}"
        state: present

    - name: Crear Virtual Network
      azure.azcollection.azure_rm_virtualnetwork:
        resource_group: "{{ resource_group }}"
        name: myapp-vnet
        address_prefixes: "10.0.0.0/16"

    - name: Crear subnet
      azure.azcollection.azure_rm_subnet:
        resource_group: "{{ resource_group }}"
        name: myapp-subnet
        virtual_network: myapp-vnet
        address_prefix: "10.0.1.0/24"

    - name: Crear IP pública
      azure.azcollection.azure_rm_publicipaddress:
        resource_group: "{{ resource_group }}"
        name: "{{ vm_name }}-pip"
        allocation_method: static
      register: pip_output

    - name: Crear VM Linux
      azure.azcollection.azure_rm_virtualmachine:
        resource_group: "{{ resource_group }}"
        name: "{{ vm_name }}"
        vm_size: Standard_B2s
        admin_username: azureuser
        ssh_password_enabled: false
        ssh_public_keys:
          - path: /home/azureuser/.ssh/authorized_keys
            key_data: "{{ lookup('file', '~/.ssh/id_ed25519.pub') }}"
        image:
          offer: UbuntuServer
          publisher: Canonical
          sku: 22.04-LTS
          version: latest
        tags:
          ManagedBy: ansible
          Environment: "{{ deploy_env }}"</code></pre>
          </div>
        `,
      },
      {
        title: 'GCP con google.cloud',
        body: `
          <p>La colección <code>google.cloud</code> gestiona recursos de Google Cloud Platform: Compute Engine, Cloud Storage, Cloud SQL y más.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">setup-gcp.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Instalar colección
ansible-galaxy collection install google.cloud

# Dependencias Python
pip install google-auth requests

# Autenticar con service account
export GCP_AUTH_KIND=serviceaccount
export GCP_SERVICE_ACCOUNT_FILE=/path/to/sa-key.json
export GCP_PROJECT=mi-proyecto-gcp</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">gcp-resources.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Provisionar recursos en GCP
  hosts: localhost
  connection: local
  gather_facts: false
  vars:
    project: mi-proyecto-gcp
    zone: us-central1-a
    region: us-central1

  tasks:

    - name: Crear instancia Compute Engine
      google.cloud.gcp_compute_instance:
        name: "web-vm-{{ deploy_env }}"
        machine_type: n2-standard-2
        zone: "{{ zone }}"
        project: "{{ project }}"
        auth_kind: serviceaccount
        service_account_file: /path/to/sa-key.json
        disks:
          - auto_delete: true
            boot: true
            initialize_params:
              source_image: projects/ubuntu-os-cloud/global/images/family/ubuntu-2204-lts
              disk_size_gb: 50
        network_interfaces:
          - network:
              selfLink: global/networks/default
            access_configs:
              - name: External NAT
                type: ONE_TO_ONE_NAT
        labels:
          env: "{{ deploy_env }}"
          managed-by: ansible
        state: present
      register: gcp_instance

    - name: Crear bucket de Cloud Storage
      google.cloud.gcp_storage_bucket:
        name: "myapp-assets-{{ project }}-{{ deploy_env }}"
        project: "{{ project }}"
        auth_kind: serviceaccount
        service_account_file: /path/to/sa-key.json
        location: "{{ region }}"
        storage_class: STANDARD
        versioning:
          enabled: true
        state: present</code></pre>
          </div>
        `,
      },
      {
        title: 'Práctica: provisionar EC2, esperar SSH y configurar',
        body: `
          <p>El flujo completo de provisioning cloud con Ansible: creás la instancia, esperás que esté disponible por SSH, y en el mismo playbook la configurás.</p>
          <div class="lab-box">
            <div class="lab-box-header">🧪 Laboratorio: EC2 end-to-end</div>
            <p><strong>Objetivo:</strong> Provisionar una instancia EC2, esperar a que SSH esté disponible, y luego instalar nginx en ella — todo en un único playbook.</p>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">lab-ec2-provision-configure.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
# Play 1: Provisionar la instancia
- name: Provisionar EC2
  hosts: localhost
  connection: local
  gather_facts: false
  vars:
    region: us-east-1
    ami_id: ami-0c55b159cbfafe1f0
    instance_type: t3.micro
    key_name: mi-keypair

  tasks:

    - name: Lanzar instancia EC2
      amazon.aws.ec2_instance:
        name: "lab-web-server"
        key_name: "{{ key_name }}"
        instance_type: "{{ instance_type }}"
        image_id: "{{ ami_id }}"
        region: "{{ region }}"
        security_groups:
          - web-sg
        tags:
          Name: lab-web-server
          ManagedBy: ansible
        wait: true
        state: running
      register: ec2

    - name: Agregar al inventario dinámico en memoria
      ansible.builtin.add_host:
        name: "{{ ec2.instances[0].public_ip_address }}"
        groups: newly_provisioned
        ansible_user: ec2-user
        ansible_ssh_private_key_file: ~/.ssh/mi-keypair.pem
        ansible_ssh_extra_args: '-o StrictHostKeyChecking=no'

    - name: Esperar a que SSH esté disponible
      ansible.builtin.wait_for:
        host: "{{ ec2.instances[0].public_ip_address }}"
        port: 22
        delay: 10
        timeout: 300
        state: started

# Play 2: Configurar la instancia recién creada
- name: Configurar el servidor web
  hosts: newly_provisioned
  gather_facts: true
  become: true

  tasks:

    - name: Actualizar paquetes
      ansible.builtin.dnf:
        name: "*"
        state: latest
        update_cache: true

    - name: Instalar nginx
      ansible.builtin.dnf:
        name: nginx
        state: present

    - name: Iniciar y habilitar nginx
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true

    - name: Verificar que nginx responde
      ansible.builtin.uri:
        url: "http://{{ ansible_host }}/index.html"
        status_code: 200
      delegate_to: localhost</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>add_host</strong> es el truco que permite pasar información entre plays en el mismo playbook. El primer play descubre la IP de la instancia y la agrega a un grupo temporal en memoria. El segundo play se conecta a ese grupo y configura la máquina.</div>
          </div>
        `,
      },
    ],
    quiz: [
      {
        question:
          '¿Cuál es la principal ventaja del inventario dinámico con el plugin aws_ec2 sobre un inventario estático?',
        options: [
          'El inventario dinámico es más rápido de procesar que un archivo YAML estático',
          'Autodescubre las instancias EC2 en tiempo real sin necesidad de mantener el inventario manualmente',
          'Permite usar variables de grupo que el inventario estático no soporta',
          'Solo el inventario dinámico soporta múltiples regiones de AWS',
        ],
        correctIndex: 1,
        explanation:
          'El inventario dinámico con <code>aws_ec2</code> consulta la API de AWS en cada ejecución de Ansible. Cuando lanzás una nueva instancia con los tags correctos, aparece automáticamente. Cuando la terminás, desaparece. Esto elimina el riesgo de inventarios desincronizados con la infraestructura real, que es el problema crónico de los inventarios estáticos en entornos cloud dinámicos.',
      },
      {
        question:
          '¿Qué módulo de Ansible se usa para pasar la IP de una instancia recién provisionada del primer play al segundo play dentro del mismo playbook?',
        options: [
          'ansible.builtin.set_fact con hostvars',
          'ansible.builtin.add_host',
          'amazon.aws.ec2_instance con register',
          'ansible.builtin.include_vars',
        ],
        correctIndex: 1,
        explanation:
          '<code>ansible.builtin.add_host</code> agrega un host al inventario en memoria durante la ejecución del playbook. Esto permite que el play 1 provisionice la instancia, descubra su IP, la agregue a un grupo temporal, y el play 2 se conecte a ese grupo para configurar la máquina — todo dentro del mismo playbook, sin inventario externo.',
      },
      {
        question:
          '¿Cuándo es preferible usar Terraform en lugar de Ansible para gestionar infraestructura cloud?',
        options: [
          'Cuando necesitás configurar el sistema operativo de las VMs además de crearlas',
          'Cuando tenés infraestructura cloud compleja con dependencias entre recursos y necesitás gestión de estado robusta con plan/apply',
          'Cuando el equipo ya conoce Ansible y no quiere aprender otra herramienta',
          'Cuando necesitás conectarte a las VMs por SSH para ejecutar comandos',
        ],
        correctIndex: 1,
        explanation:
          'Terraform brilla cuando tenés infraestructura cloud compleja con muchas dependencias entre recursos (VPCs, subnets, security groups, etc.) y necesitás la capacidad de <code>terraform plan</code> para ver qué va a cambiar antes de aplicar. Su gestión de estado (tfstate) es más robusta para IaC puro. Ansible es mejor cuando necesitás combinar provisioning con configuración del SO en el mismo pipeline.',
      },
    ],
    realWorldCase:
      'Un startup que migraba de ClickOps a IaC implementó Ansible para provisionar instancias EC2 con el módulo amazon.aws, luego configurarlas automáticamente: en cada PR merge, el pipeline crea el entorno de staging, corre las pruebas de integración y termina la instancia — eliminando costos de infraestructura idle y errores de configuración manual.',
    troubleshooting: [
      {
        error: 'ModuleNotFoundError: No module named "botocore" o "boto3"',
        cause:
          'Los paquetes Python <code>boto3</code> y <code>botocore</code> no están instalados en el control node. Son las dependencias obligatorias de la colección <code>amazon.aws</code> para comunicarse con la API de AWS.',
        fix: 'Ejecutá <code>pip install boto3 botocore</code> en el entorno Python que usa Ansible. Verificá cuál Python usa Ansible con <code>ansible --version | grep python</code> e instalá los paquetes en ese entorno específico.',
      },
      {
        error: 'AuthFailure: AWS was not able to validate the provided access credentials',
        cause:
          'Las credenciales de AWS son incorrectas, han expirado, o no están disponibles en el entorno donde corre Ansible. Esto también ocurre cuando se usan perfiles AWS incorrectos.',
        fix: 'Verificá las credenciales con <code>aws sts get-caller-identity</code>. Asegurate de que las variables de entorno <code>AWS_ACCESS_KEY_ID</code> y <code>AWS_SECRET_ACCESS_KEY</code> están seteadas correctamente, o que <code>~/.aws/credentials</code> tiene el perfil correcto. En CI, usá IAM Roles para las instancias en lugar de credenciales estáticas.',
      },
      {
        error: 'azure.azcollection: No module named "azure.mgmt.compute"',
        cause:
          'Las dependencias Python de la colección azure.azcollection no están instaladas. Esta colección tiene muchas dependencias del SDK de Azure que deben instalarse desde su propio archivo requirements.txt.',
        fix: 'Instalá las dependencias correctas ejecutando: <code>pip install -r ~/.ansible/collections/ansible_collections/azure/azcollection/requirements.txt</code>. El archivo requirements.txt de la colección asegura que se instalen las versiones compatibles de todos los SDKs de Azure.',
      },
    ],
  },
  {
    levelId: 18,
    moduleId: 4,
    title: 'VMware y Proxmox con Ansible',
    objective:
      'Gestionar virtualización empresarial y de homelab usando Ansible: provisionar VMs en vSphere con community.vmware y en Proxmox con community.general, incluyendo snapshots, templates y gestión del ciclo de vida.',
    duration: '3–4 horas',
    objectives: [
      'Usar community.vmware para gestionar el ciclo de vida de VMs en vSphere',
      'Automatizar snapshots, clones desde template y estados de energía en VMware',
      'Provisionar VMs en Proxmox con los módulos de community.general',
      'Crear VMs desde templates en Proxmox para despliegues reproducibles',
    ],
    prerequisites: [
      'Módulo 3 de este nivel completado',
      'Acceso a un entorno VMware vSphere o Proxmox (puede ser laboratorio)',
      'Credenciales de administrador para el hipervisor objetivo',
    ],
    steps: [
      {
        title: 'community.vmware: gestión de vSphere',
        body: `
          <p>La colección <code>community.vmware</code> cubre la API de VMware vSphere para gestionar VMs, templates, redes, almacenamiento y clústeres ESXi desde Ansible.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">setup-vmware.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># Instalar colección
ansible-galaxy collection install community.vmware

# Dependencias Python
pip install pyVmomi PyVim

# Las credenciales se pasan como variables o se definen en el playbook
# Nunca hardcodees contraseñas — usá Ansible Vault</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">group_vars/all/vmware.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
# Variables de conexión vSphere (las sensibles van en Vault)
vcenter_hostname: vcenter.empresa.local
vcenter_username: ansible@vsphere.local
vcenter_password: "{{ vault_vcenter_password }}"
vcenter_validate_certs: false    # true en producción con cert válido
datacenter_name: DC-Principal
cluster_name: Cluster-Produccion
datastore_name: SAN-Produccion</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">vmware-deploy.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Provisionar VM en VMware vSphere
  hosts: localhost
  connection: local
  gather_facts: false

  tasks:

    - name: Crear VM desde template
      community.vmware.vmware_guest:
        hostname: "{{ vcenter_hostname }}"
        username: "{{ vcenter_username }}"
        password: "{{ vcenter_password }}"
        validate_certs: "{{ vcenter_validate_certs }}"
        datacenter: "{{ datacenter_name }}"
        cluster: "{{ cluster_name }}"
        datastore: "{{ datastore_name }}"
        folder: "/{{ datacenter_name }}/vm/Produccion"
        name: "web-vm-{{ inventory_hostname }}"
        template: Ubuntu-22.04-Template
        state: poweredon
        hardware:
          num_cpus: 4
          memory_mb: 8192
        networks:
          - name: VLAN-Produccion
            ip: "{{ vm_ip }}"
            netmask: 255.255.255.0
            gateway: 192.168.10.1
        customization:
          hostname: "web-{{ inventory_hostname }}"
          dns_servers:
            - 192.168.1.1
            - 8.8.8.8
        wait_for_customization: true
      register: vm_result</code></pre>
          </div>
          <div class="tip-box">
            <span class="box-icon">💡</span>
            <div class="box-content"><strong>wait_for_customization: true</strong> hace que Ansible espere a que vSphere complete la personalización del SO (hostname, red, etc.) antes de continuar. Sin esto, el siguiente play que intente conectarse por SSH podría fallar porque la VM aún no tiene la IP asignada.</div>
          </div>
        `,
      },
      {
        title: 'Snapshots, clones y gestión de estado en VMware',
        body: `
          <p>Ansible puede gestionar el ciclo de vida completo de VMs VMware: snapshots antes de updates, rollback en caso de error, apagado/encendido programado.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">vmware-lifecycle.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Gestión de ciclo de vida VMware
  hosts: localhost
  connection: local
  gather_facts: false
  vars:
    vcenter_common: &vcenter
      hostname: "{{ vcenter_hostname }}"
      username: "{{ vcenter_username }}"
      password: "{{ vcenter_password }}"
      validate_certs: false
      datacenter: "{{ datacenter_name }}"

  tasks:

    # Snapshot antes de una actualización mayor
    - name: Crear snapshot pre-update
      community.vmware.vmware_guest_snapshot:
        <<: *vcenter
        name: "{{ vm_name }}"
        state: present
        snapshot_name: "pre-update-{{ ansible_date_time.date }}"
        description: "Snapshot automático antes de actualización — Ansible"
        memory_dump: false

    # Ejecutar actualización (con otros módulos)
    - name: Simular actualización (aquí irían tus tasks)
      ansible.builtin.debug:
        msg: "Actualizando {{ vm_name }}..."

    # Revertir si algo salió mal (condicional)
    - name: Revertir snapshot si hubo error
      community.vmware.vmware_guest_snapshot:
        <<: *vcenter
        name: "{{ vm_name }}"
        state: revert
        snapshot_name: "pre-update-{{ ansible_date_time.date }}"
      when: update_failed | default(false)

    # Gestión de estado de energía
    - name: Apagar VM limpiamente
      community.vmware.vmware_guest_powerstate:
        <<: *vcenter
        name: "{{ vm_name }}"
        state: shutdown-guest    # graceful shutdown
        state_change_timeout: 120

    - name: Encender VM
      community.vmware.vmware_guest_powerstate:
        <<: *vcenter
        name: "{{ vm_name }}"
        state: powered-on

    # Eliminar snapshots viejos (limpieza)
    - name: Eliminar snapshots de más de 30 días
      community.vmware.vmware_guest_snapshot:
        <<: *vcenter
        name: "{{ vm_name }}"
        state: absent
        snapshot_name: "pre-update-{{ old_date }}"
      vars:
        old_date: "{{ (ansible_date_time.epoch | int - 2592000) | strftime('%Y-%m-%d') }}"</code></pre>
          </div>
          <div class="highlight-box">
            <p><strong>Patrón pre/post snapshot:</strong> creá siempre un snapshot antes de cambios mayores (updates de SO, migración de versiones). Ansible puede automatizar este patrón: snapshot → cambio → verificación → eliminar snapshot si OK / revertir si falla.</p>
          </div>
        `,
      },
      {
        title: 'Proxmox con community.general',
        body: `
          <p>Proxmox VE es una plataforma de virtualización open source muy popular en homelab y entornos empresariales sin licencia VMware. Ansible la gestiona con módulos de la colección <code>community.general</code>.</p>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">setup-proxmox.sh</span></div>
            <pre class="language-bash"><code class="language-bash"># community.general incluye los módulos de Proxmox
ansible-galaxy collection install community.general

# Dependencia Python para la API de Proxmox
pip install proxmoxer requests</code></pre>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">proxmox-vm.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
- name: Gestión de VMs en Proxmox
  hosts: localhost
  connection: local
  gather_facts: false
  vars:
    proxmox_host: proxmox.homelab.local
    proxmox_user: root@pam
    proxmox_password: "{{ vault_proxmox_password }}"
    proxmox_node: pve

  tasks:

    # Crear VM nueva
    - name: Crear VM en Proxmox
      community.general.proxmox_kvm:
        api_host: "{{ proxmox_host }}"
        api_user: "{{ proxmox_user }}"
        api_password: "{{ proxmox_password }}"
        node: "{{ proxmox_node }}"
        vmid: 200
        name: "web-server-01"
        memory: 4096            # MB
        cores: 2
        sockets: 1
        net:
          net0: "virtio,bridge=vmbr0"
        scsi:
          scsi0: "local-lvm:32,format=raw"
        ide:
          ide2: "local:iso/ubuntu-22.04.iso,media=cdrom"
        boot: "order=scsi0;ide2"
        ostype: l26
        state: present

    # Clonar desde template
    - name: Clonar VM desde template cloud-init
      community.general.proxmox_kvm:
        api_host: "{{ proxmox_host }}"
        api_user: "{{ proxmox_user }}"
        api_password: "{{ proxmox_password }}"
        node: "{{ proxmox_node }}"
        newid: 201
        name: "web-server-02"
        clone: ubuntu-22-template    # nombre del template en Proxmox
        full: true                   # full clone (no linked)
        storage: local-lvm
        state: present
      register: clone_result

    # Configurar cloud-init en la VM clonada
    - name: Configurar cloud-init
      community.general.proxmox_kvm:
        api_host: "{{ proxmox_host }}"
        api_user: "{{ proxmox_user }}"
        api_password: "{{ proxmox_password }}"
        node: "{{ proxmox_node }}"
        vmid: 201
        ciuser: ubuntu
        cipassword: "{{ vault_vm_password }}"
        sshkeys: "{{ lookup('file', '~/.ssh/id_ed25519.pub') }}"
        ipconfig:
          ipconfig0: "ip=192.168.1.201/24,gw=192.168.1.1"
        nameservers:
          - 1.1.1.1
          - 8.8.8.8
        update: true              # actualizar la VM existente

    # Gestionar estado
    - name: Iniciar VM
      community.general.proxmox_kvm:
        api_host: "{{ proxmox_host }}"
        api_user: "{{ proxmox_user }}"
        api_password: "{{ proxmox_password }}"
        node: "{{ proxmox_node }}"
        vmid: 201
        state: started</code></pre>
          </div>
        `,
      },
      {
        title: 'Práctica: crear VM desde template en Proxmox',
        body: `
          <p>Un flujo completo de aprovisionamiento en Proxmox: clonar desde template, configurar con cloud-init, esperar SSH y configurar el servidor.</p>
          <div class="lab-box">
            <div class="lab-box-header">🧪 Laboratorio: VM desde template en Proxmox</div>
            <p><strong>Pre-requisito:</strong> tener un template de VM en Proxmox con cloud-init instalado (el template debe tener el paquete <code>cloud-init</code> instalado y la partición configurada).</p>
          </div>
          <div class="code-block-wrapper">
            <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">lab-proxmox-full.yml</span></div>
            <pre class="language-yaml"><code class="language-yaml">---
# Play 1: Provisionar VM en Proxmox
- name: Provisionar VM desde template
  hosts: localhost
  connection: local
  gather_facts: false
  vars:
    pve_host: 192.168.1.10
    pve_user: root@pam
    pve_node: pve
    new_vmid: 300
    new_vm_name: lab-ansible-vm
    new_vm_ip: 192.168.1.100
    template_name: ubuntu-22-cloud-template

  tasks:

    - name: Clonar template
      community.general.proxmox_kvm:
        api_host: "{{ pve_host }}"
        api_user: "{{ pve_user }}"
        api_password: "{{ vault_pve_password }}"
        node: "{{ pve_node }}"
        newid: "{{ new_vmid }}"
        name: "{{ new_vm_name }}"
        clone: "{{ template_name }}"
        full: true
        storage: local-lvm
        state: present

    - name: Configurar cloud-init (IP, usuario, SSH key)
      community.general.proxmox_kvm:
        api_host: "{{ pve_host }}"
        api_user: "{{ pve_user }}"
        api_password: "{{ vault_pve_password }}"
        node: "{{ pve_node }}"
        vmid: "{{ new_vmid }}"
        ciuser: ubuntu
        sshkeys: "{{ lookup('file', '~/.ssh/id_ed25519.pub') }}"
        ipconfig:
          ipconfig0: "ip={{ new_vm_ip }}/24,gw=192.168.1.1"
        nameservers:
          - 1.1.1.1
        update: true

    - name: Iniciar la VM
      community.general.proxmox_kvm:
        api_host: "{{ pve_host }}"
        api_user: "{{ pve_user }}"
        api_password: "{{ vault_pve_password }}"
        node: "{{ pve_node }}"
        vmid: "{{ new_vmid }}"
        state: started

    - name: Esperar que SSH esté disponible
      ansible.builtin.wait_for:
        host: "{{ new_vm_ip }}"
        port: 22
        delay: 15
        timeout: 300
        state: started

    - name: Agregar VM al inventario en memoria
      ansible.builtin.add_host:
        name: "{{ new_vm_ip }}"
        groups: proxmox_new_vms
        ansible_user: ubuntu
        ansible_ssh_private_key_file: ~/.ssh/id_ed25519

# Play 2: Configurar la VM recién provisionada
- name: Configurar VM
  hosts: proxmox_new_vms
  gather_facts: true
  become: true

  tasks:

    - name: Actualizar sistema
      ansible.builtin.apt:
        upgrade: dist
        update_cache: true

    - name: Instalar paquetes base
      ansible.builtin.apt:
        name:
          - nginx
          - curl
          - htop
          - vim
        state: present

    - name: Habilitar nginx
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true

    - name: Verificar
      ansible.builtin.uri:
        url: "http://{{ ansible_host }}"
        status_code: 200
      delegate_to: localhost

    - name: Mostrar resultado
      ansible.builtin.debug:
        msg: "VM {{ inventory_hostname }} provisionada y configurada exitosamente"</code></pre>
          </div>
          <div class="warning-box">
            <span class="box-icon">⚠️</span>
            <div class="box-content"><strong>Preparar el template:</strong> para que cloud-init funcione en Proxmox, el template debe tener instalado el paquete <code>cloud-init</code> y agregar un disco <code>CloudInit Drive</code> en la configuración de hardware antes de convertirlo en template. Sin el drive cloud-init, las configuraciones de red y SSH key no se aplican al arrancar.</div>
          </div>
        `,
      },
    ],
    quiz: [
      {
        question:
          '¿Qué parámetro en vmware_guest garantiza que Ansible espere a que vSphere complete la personalización del SO antes de continuar?',
        options: [
          'wait_for_ip: true',
          'state: poweredon',
          'wait_for_customization: true',
          'customization_timeout: 300',
        ],
        correctIndex: 2,
        explanation:
          'El parámetro <code>wait_for_customization: true</code> hace que Ansible espere a que vSphere complete la personalización del SO (hostname, configuración de red, etc.) antes de devolver el control. Sin este parámetro, el siguiente task que intente conectarse por SSH podría fallar porque la VM todavía no tiene la IP asignada o el hostname configurado.',
      },
      {
        question:
          '¿Por qué es necesario instalar el paquete Python <code>proxmoxer</code> para usar los módulos de Proxmox en Ansible?',
        options: [
          'proxmoxer reemplaza a Python en la comunicación con Proxmox',
          'Es la librería que Ansible usa para autenticarse por SSH en el nodo Proxmox',
          'Es el SDK Python que los módulos community.general usan para comunicarse con la API REST de Proxmox',
          'proxmoxer gestiona el estado de las VMs en el archivo de inventario',
        ],
        correctIndex: 2,
        explanation:
          'Los módulos de Proxmox en <code>community.general</code> no se comunican con Proxmox por SSH — usan la API REST de Proxmox VE. <code>proxmoxer</code> es la librería Python que abstrae esa API REST. Sin ella instalada en el control node, Ansible no puede hablar con Proxmox y los módulos fallan con un ImportError.',
      },
      {
        question:
          '¿Cuál es el beneficio del patrón "snapshot pre-update + rollback automático" en VMware con Ansible?',
        options: [
          'Los snapshots mejoran el rendimiento de la VM durante la actualización',
          'Permite revertir la VM a su estado previo automáticamente si la actualización falla, sin intervención manual',
          'Los snapshots reemplazan la necesidad de backups regulares',
          'Ansible solo puede hacer rollback en entornos VMware, no en otros hipervisores',
        ],
        correctIndex: 1,
        explanation:
          'El patrón consiste en: crear snapshot → aplicar cambios → verificar resultado → si falla, revertir snapshot automáticamente con una tarea condicional (<code>when: update_failed</code>). Esto permite actualizaciones seguras con rollback automático sin intervención manual, algo que en entornos manuales requería disponibilidad del equipo de ops fuera del horario laboral.',
      },
    ],
    realWorldCase:
      'Un equipo de infraestructura usa Ansible para gestionar 200 VMs VMware: cada semana un playbook crea snapshots de todos los servidores, aplica patches de seguridad, verifica que los servicios responden y elimina los snapshots si todo está OK — o revierte automáticamente y crea un ticket en Jira si algo falla.',
    troubleshooting: [
      {
        error: 'ImportError: No module named "pyVmomi"',
        cause:
          'El paquete Python <code>pyVmomi</code> (SDK oficial de VMware para Python) no está instalado en el control node. Es la dependencia obligatoria de todos los módulos <code>community.vmware</code>.',
        fix: 'Instalá el paquete con <code>pip install pyVmomi</code> en el entorno Python que usa Ansible. Verificá el entorno correcto con <code>ansible --version | grep python</code>. Para algunas operaciones también necesitás <code>pip install PyVim</code>.',
      },
      {
        error: 'proxmoxer.backends.https.AuthenticationError: Couldn\'t authenticate user',
        cause:
          'Las credenciales de Proxmox son incorrectas o el usuario no tiene los permisos necesarios en Proxmox VE. El formato del usuario en Proxmox incluye el realm: <code>root@pam</code>, no solo <code>root</code>.',
        fix: 'Verificá que el usuario tiene el formato correcto con realm: <code>root@pam</code> para el usuario root, o <code>usuario@pve</code> para usuarios Proxmox nativos. Comprobá los permisos en Datacenter → Permissions en la UI de Proxmox. También podés crear un usuario dedicado para Ansible con los permisos mínimos necesarios (VM.Allocate, VM.Config.*, Pool.Allocate).',
      },
      {
        error: 'community.vmware.vmware_guest: [Errno 111] Connection refused a vcenter:443',
        cause:
          'Ansible no puede conectarse al servidor vCenter. Puede ser un problema de red, firewall, o que el hostname del vCenter no resuelve desde el control node.',
        fix: 'Verificá conectividad con <code>curl -k https://vcenter.empresa.local/sdk</code> desde el control node. Comprobá que el puerto 443 está abierto en el firewall entre el control node y el vCenter. Si el certificado SSL es autofirmado, usá <code>validate_certs: false</code> temporalmente para diagnóstico (habilitalo en producción con el cert correcto).',
      },
    ],
  },
];
