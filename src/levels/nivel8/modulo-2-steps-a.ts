import type { StepContent } from '../types';

export const nivel8Mod2StepsA: StepContent[] = [
  {
    title: 'Gestión de paquetes: package, apt y dnf',
    body: `
      <p>Ansible tiene módulos tanto genéricos (multiplataforma) como específicos por distribución. Conocer cuándo usar cada uno es clave para escribir playbooks portables.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">gestion-paquetes.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Gestión de paquetes
  hosts: all
  tasks:
# ansible.builtin.package — multiplataforma
# Usa apt en Debian/Ubuntu, dnf/yum en RedHat, pkg en FreeBSD
- name: Instalar paquete (multiplataforma)
  ansible.builtin.package:
    name: nginx
    state: present   # present | absent | latest

# Instalar múltiples paquetes
- name: Instalar herramientas comunes
  ansible.builtin.package:
    name:
      - curl
      - git
      - vim
      - htop
    state: present

# ansible.builtin.apt — específico para Debian/Ubuntu
# Tiene opciones que package no soporta
- name: Actualizar caché e instalar con apt
  ansible.builtin.apt:
    name: nginx
    state: present
    update_cache: true           # Equivale a apt-get update
    cache_valid_time: 3600       # No actualiza si el caché es < 1h
  when: ansible_os_family == "Debian"

- name: Actualizar todos los paquetes (apt upgrade)
  ansible.builtin.apt:
    upgrade: dist                # dist | full | safe | yes
    update_cache: true
  when: ansible_os_family == "Debian"

# ansible.builtin.dnf — específico para RHEL/CentOS/Fedora
- name: Instalar grupo de paquetes con dnf
  ansible.builtin.dnf:
    name: "@Development Tools"  # @ indica grupo de paquetes
    state: present
  when: ansible_os_family == "RedHat"

# Eliminar paquete y sus dependencias no usadas
- name: Eliminar paquete obsoleto
  ansible.builtin.package:
    name: apache2
    state: absent

# Patrón recomendado: usar package para instalar, apt/dnf para opciones avanzadas
- name: Instalar nginx (multiplataforma con update_cache solo en Debian)
  ansible.builtin.package:
    name: nginx
    state: present

- name: Actualizar caché apt si es Debian
  ansible.builtin.apt:
    update_cache: true
    cache_valid_time: 3600
  when: ansible_os_family == "Debian"</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>state: latest vs state: present:</strong> <code>present</code> instala el paquete si no existe, pero NO actualiza si ya hay una versión instalada. <code>latest</code> siempre actualiza a la última versión disponible. Para servidores de producción, usá <code>present</code> para evitar actualizaciones inesperadas.</div>
      </div>
    `
  },
  {
    title: 'Gestión de servicios: service y systemd',
    body: `
      <p>Ansible tiene módulos para gestionar servicios tanto de forma genérica (<code>service</code>) como específica para systemd (<code>systemd</code>). El módulo systemd tiene capacidades adicionales.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">gestion-servicios.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Gestión de servicios
  hosts: all
  tasks:
# ansible.builtin.service — genérico (sysV, systemd, upstart)
- name: Iniciar y habilitar nginx
  ansible.builtin.service:
    name: nginx
    state: started    # started | stopped | restarted | reloaded
    enabled: true     # Habilitar en arranque

# ansible.builtin.systemd — específico para systemd (más opciones)
- name: Habilitar nginx con systemd
  ansible.builtin.systemd:
    name: nginx
    state: started
    enabled: true
    daemon_reload: true    # Equivale a: systemctl daemon-reload

# Reiniciar servicio solo si existe
- name: Reiniciar nginx si está activo
  ansible.builtin.service:
    name: nginx
    state: restarted
  when: ansible_facts.services['nginx.service'] is defined

# Patrón: instalar, configurar y gestionar en orden correcto
- name: Instalar nginx
  ansible.builtin.package:
    name: nginx
    state: present

- name: Copiar configuración de nginx
  ansible.builtin.template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
    owner: root
    group: root
    mode: '0644'
    validate: '/usr/sbin/nginx -t -c %s'  # Validar antes de reemplazar
  notify: Recargar nginx

- name: Asegurar que nginx está corriendo
  ansible.builtin.service:
    name: nginx
    state: started
    enabled: true

  handlers:
- name: Recargar nginx
  ansible.builtin.service:
    name: nginx
    state: reloaded</code></pre>
      </div>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>validate en template y copy:</strong> El parámetro <code>validate</code> ejecuta un comando con el archivo temporal antes de copiarlo al destino final. El <code>%s</code> se reemplaza por la ruta del archivo temporal. Si el comando falla (exit code != 0), Ansible no reemplaza el archivo y reporta error. Es una capa extra de seguridad para configuraciones críticas.</div>
      </div>
    `
  }
];
