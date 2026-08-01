import type { StepContent } from '../types';

export const nivel18Mod3StepsB: StepContent[] = [
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
  }
];
