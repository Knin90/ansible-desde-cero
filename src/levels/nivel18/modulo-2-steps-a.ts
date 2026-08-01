import type { StepContent } from '../types';

export const nivel18Mod2StepsA: StepContent[] = [
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
  }
];
