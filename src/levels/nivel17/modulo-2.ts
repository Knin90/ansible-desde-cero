import type { ModuleContent } from '../types';

export const nivel17Mod2: ModuleContent =   {
levelId: 17,
moduleId: 2,
title: 'Molecule — Testing de Roles',
objective: 'Implementar tests automatizados de roles Ansible con Molecule, usando Docker como driver para crear entornos de prueba reproducibles y multi-plataforma.',
duration: '2–3 horas',
objectives: [
  'Entender por qué el testing de roles es fundamental para infraestructura confiable',
  'Instalar y configurar Molecule con el driver Docker',
  'Escribir escenarios de test completos con converge.yml y verify.yml',
  'Ejecutar tests en múltiples plataformas (Ubuntu 22 + Rocky 9) simultáneamente',
],
prerequisites: [
  'Completados los Niveles 0–16',
  'Docker instalado y corriendo localmente',
  'Al menos un rol Ansible propio escrito y funcional',
  'Python 3.8+ con pip disponible',
],
steps: [
  {
    title: 'Por qué testear roles: TDD para infraestructura',
    body: `
      <p>Los roles Ansible son código. El código sin tests es deuda técnica que eventualmente cobra intereses. Un rol sin tests puede funcionar hoy en Ubuntu 22 pero romper mañana en Rocky 9, o funcionar en desarrollo pero fallar en producción con una configuración diferente.</p>
      <div class="highlight-box">
        <p><strong>Molecule aplica TDD a infraestructura:</strong> escribís el test primero (¿qué debe hacer este rol?), luego escribís el rol hasta que el test pase. Cada cambio al rol corre todos los tests automáticamente.</p>
      </div>
      <p>Molecule se encarga de:</p>
      <ul>
        <li>Crear un contenedor Docker limpio (como si fuera un servidor fresco)</li>
        <li>Aplicar tu rol (<code>converge</code>)</li>
        <li>Verificar que el resultado es correcto (<code>verify</code>)</li>
        <li>Destruir el contenedor (<code>destroy</code>)</li>
      </ul>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Molecule es para tus roles lo que pytest/jest son para tu código de aplicación. Cada rol debería tener su propio conjunto de tests que se pueden correr con un solo comando.</p>
      </div>
    `,
  },
  {
    title: 'Instalación de Molecule con Docker driver',
    body: `
      <p>Molecule se instala vía pip. El driver Docker es el más común para CI/CD porque Docker corre en cualquier runner de CI sin configuración adicional.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">install-molecule.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Crear virtualenv (recomendado)
python3 -m venv ~/.venv/ansible
source ~/.venv/ansible/bin/activate

# Instalar Molecule + driver Docker + Ansible
pip install molecule molecule-docker ansible

# Verificar instalación
molecule --version
# molecule 6.x.x using python 3.x

# Inicializar Molecule en un rol existente
cd roles/mi_rol
molecule init scenario --driver-name docker

# O crear un rol nuevo con Molecule incluido
molecule init role mi_nuevo_rol --driver-name docker</code></pre>
      </div>
      <p>Molecule crea la estructura <code>molecule/default/</code> dentro del rol:</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">text</span><span class="code-block-filename">estructura-molecule.txt</span></div>
        <pre class="language-text"><code class="language-text">roles/mi_rol/
├── defaults/
├── tasks/
├── templates/
└── molecule/
└── default/          ← escenario "default"
    ├── molecule.yml   ← configuración del escenario
    ├── converge.yml   ← playbook que aplica el rol
    └── verify.yml     ← playbook de verificación</code></pre>
      </div>
    `,
  },
  {
    title: 'molecule.yml — configuración del escenario',
    body: `
      <p>El archivo <code>molecule.yml</code> define las plataformas de test, el driver, el provisioner y el verifier.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">molecule/default/molecule.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
dependency:
  name: galaxy

driver:
  name: docker

platforms:
  - name: ubuntu-22
image: geerlingguy/docker-ubuntu2204-ansible:latest
pre_build_image: true
privileged: true   # para systemd

  - name: rocky-9
image: geerlingguy/docker-rockylinux9-ansible:latest
pre_build_image: true
privileged: true

provisioner:
  name: ansible
  playbooks:
converge: converge.yml
verify: verify.yml
  config_options:
defaults:
  interpreter_python: auto_silent

verifier:
  name: ansible   # usa Ansible para verificar (vs Testinfra)

lint: |
  set -e
  yamllint .
  ansible-lint</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content">Las imágenes <code>geerlingguy/docker-*-ansible</code> de Jeff Geerling son el estándar de la comunidad para testing con Molecule. Incluyen Python, systemd y las dependencias de Ansible preinstaladas.</div>
      </div>
    `,
  },
  {
    title: 'converge.yml y verify.yml — el ciclo de test',
    body: `
      <p><code>converge.yml</code> aplica el rol bajo test. <code>verify.yml</code> verifica que el resultado es correcto usando módulos Ansible como assertions.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">molecule/default/converge.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Converge
  hosts: all
  become: true

  pre_tasks:
- name: Update apt cache (Ubuntu)
  ansible.builtin.apt:
    update_cache: true
    cache_valid_time: 3600
  when: ansible_os_family == "Debian"

  roles:
- role: mi_rol
  vars:
    nginx_port: 80
    nginx_worker_processes: 2</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">molecule/default/verify.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Verify
  hosts: all
  become: true

  tasks:
- name: Verificar que nginx está instalado
  ansible.builtin.package_facts:
    manager: auto

- name: Fallar si nginx no está instalado
  ansible.builtin.fail:
    msg: "nginx no está instalado"
  when: "'nginx' not in ansible_facts.packages"

- name: Verificar que nginx está corriendo
  ansible.builtin.service_facts:

- name: Confirmar estado del servicio
  ansible.builtin.assert:
    that:
      - ansible_facts.services['nginx.service'] is defined
      - ansible_facts.services['nginx.service'].state == 'running'
    fail_msg: "nginx no está corriendo"
    success_msg: "nginx está corriendo correctamente"

- name: Verificar que el puerto 80 responde
  ansible.builtin.uri:
    url: "http://localhost:80"
    status_code: 200</code></pre>
      </div>
    `,
  },
  {
    title: 'CLI de Molecule: comandos esenciales',
    body: `
      <p>Molecule tiene comandos granulares para cada fase del ciclo de test, más el comando <code>test</code> que los corre todos en secuencia.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">molecule-commands.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Ciclo completo (create → converge → verify → destroy)
molecule test

# Solo crear los contenedores
molecule create

# Aplicar el rol (sin destruir después)
molecule converge

# Correr solo la verificación (el contenedor debe existir)
molecule verify

# Entrar al contenedor para debug
molecule login --host ubuntu-22

# Destruir contenedores
molecule destroy

# Ver el estado de los contenedores
molecule list

# Forzar recreación aunque ya existan los contenedores
molecule test --force

# Mantener contenedores tras fallo (para debug)
molecule test --destroy never</code></pre>
      </div>
      <div class="highlight-box">
        <p><strong>Flujo de desarrollo típico:</strong></p>
        <ol>
          <li><code>molecule create</code> — crear contenedores</li>
          <li>Editar la tarea del rol</li>
          <li><code>molecule converge</code> — aplicar el rol</li>
          <li><code>molecule verify</code> — verificar</li>
          <li>Repetir pasos 2–4 hasta que el test pase</li>
          <li><code>molecule test</code> — ciclo completo limpio antes de commit</li>
        </ol>
      </div>
    `,
  },
  {
    title: 'Testing multi-plataforma: Ubuntu 22 + Rocky 9',
    body: `
      <p>El verdadero valor de Molecule está en probar el mismo rol en múltiples distribuciones simultáneamente. Muchos roles funcionan en Ubuntu pero rompen en RHEL/Rocky porque los nombres de paquetes, paths y servicios son distintos.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">multi-platform-test.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Con molecule.yml que define ubuntu-22 y rocky-9,
# molecule test corre en AMBAS plataformas automáticamente

molecule test
# →  Creating ubuntu-22 ...
# →  Creating rocky-9 ...
# →  Converging ubuntu-22 ...
# →  Converging rocky-9 ...
# →  Verifying ubuntu-22 ...
# →  Verifying rocky-9 ...</code></pre>
      </div>
      <p>El converge.yml puede tener lógica condicional por plataforma:</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">tasks/main.yml (el rol)</span></div>
        <pre class="language-yaml"><code class="language-yaml">- name: Instalar nginx (Debian/Ubuntu)
  ansible.builtin.apt:
name: nginx
state: present
  when: ansible_os_family == "Debian"

- name: Instalar nginx (RHEL/Rocky)
  ansible.builtin.dnf:
name: nginx
state: present
  when: ansible_os_family == "RedHat"</code></pre>
      </div>
    `,
  },
],
quiz: [
  {
    question: '¿Qué hace molecule converge?',
    options: [
      'Crea los contenedores Docker de prueba',
      'Aplica el rol al contenedor existente ejecutando converge.yml',
      'Corre las verificaciones definidas en verify.yml',
      'Destruye los contenedores tras el test',
    ],
    correctIndex: 1,
    explanation: 'molecule converge ejecuta el playbook converge.yml contra los contenedores existentes, aplicando el rol bajo test. Es equivalente a "aplicar el rol en el entorno de prueba".',
  },
  {
    question: '¿Para qué sirve molecule login?',
    options: [
      'Para autenticarse con Docker Hub',
      'Para acceder interactivamente al contenedor de test y hacer debug',
      'Para iniciar sesión en el repositorio de roles de Ansible Galaxy',
      'Para conectarse con SSH al host remoto de producción',
    ],
    correctIndex: 1,
    explanation: 'molecule login abre una shell interactiva dentro del contenedor de test. Es fundamental para debug: podés inspeccionar el estado del sistema, ver logs y probar comandos manualmente cuando un test falla.',
  },
  {
    question: '¿Por qué se recomienda testear en Ubuntu 22 y Rocky 9 simultáneamente?',
    options: [
      'Para usar más CPU y detectar problemas de performance',
      'Porque los nombres de paquetes, paths y servicios difieren entre distros, y un rol puede funcionar en una pero fallar en otra',
      'Porque Ansible solo funciona correctamente cuando hay múltiples plataformas en el inventario',
      'Para cumplir con regulaciones de seguridad que exigen testing cross-platform',
    ],
    correctIndex: 1,
    explanation: 'Debian/Ubuntu y RHEL/Rocky tienen diferencias fundamentales: apt vs dnf, /etc/default vs /etc/sysconfig, nombre de paquetes distintos. Un rol robusto debe manejar ambas familias y Molecule permite verificarlo automáticamente.',
  },
],
realWorldCase: 'Un equipo descubrió con Molecule que su rol de "hardening" instalaba correctamente en Ubuntu pero olvidaba habilitar SELinux en Rocky Linux. En producción, esto habría dejado 40 servidores RHEL sin la configuración de seguridad requerida por compliance.',
troubleshooting: [
  {
    error: 'ERROR: Could not find a suitable provider/driver',
    cause: 'Docker no está corriendo en el sistema o molecule-docker no está instalado',
    fix: 'Verificar con docker ps que Docker está activo. Instalar molecule-docker: pip install molecule-docker. Confirmar con molecule drivers.',
  },
  {
    error: 'FAILED: systemctl not found (en el contenedor)',
    cause: 'La imagen Docker no tiene systemd disponible; se usó una imagen genérica en lugar de las imágenes diseñadas para Ansible testing',
    fix: 'Usar las imágenes de geerlingguy: geerlingguy/docker-ubuntu2204-ansible:latest. Agregar privileged: true en molecule.yml.',
  },
  {
    error: 'molecule test falla con "Image not found" aunque docker pull funciona',
    cause: 'La imagen especificada en molecule.yml tiene un tag incorrecto o fue eliminada del registro',
    fix: 'Verificar el tag exacto con docker pull seguido de la imagen. Actualizar molecule.yml con el tag correcto. Preferir tags :latest para imágenes de Molecule testing.',
  },
],
  };
