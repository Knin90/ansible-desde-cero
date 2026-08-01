import type { StepContent } from '../types';

export const nivel18Mod4StepsB: StepContent[] = [
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
  }
];
