import type { StepContent } from '../types';

export const nivel18Mod2StepsB: StepContent[] = [
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
  }
];
