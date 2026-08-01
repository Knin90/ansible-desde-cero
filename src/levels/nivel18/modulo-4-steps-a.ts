import type { StepContent } from '../types';

export const nivel18Mod4StepsA: StepContent[] = [
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
  }
];
