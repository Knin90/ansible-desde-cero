import type { ModuleContent } from '../types';

export const nivel7Mod2: ModuleContent =   {
levelId: 7,
moduleId: 2,
title: 'Custom Facts',
objective: 'Crear facts personalizados en los hosts para que se auto-describan con información de aplicaciones y entorno.',
duration: '1.5 horas',
objectives: [
  'Crear custom facts en formato JSON, INI y como scripts ejecutables',
  'Entender cómo Ansible carga los facts desde /etc/ansible/facts.d/',
  'Desplegar y actualizar custom facts con playbooks',
  'Usar ansible_local para acceder a custom facts en playbooks',
],
prerequisites: [
  'Conocer el módulo setup y cómo funciona gather_facts (módulo anterior)',
  'Haber usado los módulos file y copy de Ansible (Nivel 4)',
],
steps: [
  {
    title: '¿Qué son los custom facts y por qué usarlos?',
    body: `
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Los custom facts son como una "tarjeta de identificación" que el propio host lleva. En lugar de que Ansible tenga que averiguar todo sobre el host (versión de la app instalada, entorno, última fecha de deploy), el host lo declara él mismo en un archivo estático o script. Ansible solo lo lee al inicio del play.</p>
      </div>
      <p>Los custom facts se colocan en <code>/etc/ansible/facts.d/</code> del host administrado. Pueden ser:</p>
      <ul>
        <li>Archivos <strong>.json</strong> — datos estáticos en formato JSON</li>
        <li>Archivos <strong>.ini</strong> — datos estáticos en formato INI</li>
        <li>Scripts ejecutables (sin extensión o con extensión propia) — ejecutados por Ansible, deben imprimir JSON en stdout</li>
      </ul>
      <p>El nombre del archivo (sin extensión) se convierte en la clave bajo <code>ansible_local</code>.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">json</span><span class="code-block-filename">/etc/ansible/facts.d/aplicacion.json</span></div>
        <pre class="language-json"><code class="language-json">{
  "version": "2.3.1",
  "entorno": "produccion",
  "db_host": "db-prod.empresa.com",
  "db_port": 5432,
  "ultimo_deploy": "2024-01-15T10:30:00Z",
  "feature_flags": {
"nuevo_checkout": true,
"beta_dashboard": false
  }
}</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">/etc/ansible/facts.d/servidor.ini</span></div>
        <pre class="language-ini"><code class="language-ini">[roles]
tipo = webserver
tier = frontend
region = us-east-1

[mantenimiento]
ventana_inicio = 02:00
ventana_fin = 04:00
notificar = ops@empresa.com</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">usar-custom-facts.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Usar custom facts en playbook
  hosts: all
  tasks:
- name: Mostrar versión de la aplicación
  ansible.builtin.debug:
    msg: "App {{ ansible_local.aplicacion.version }} en {{ ansible_local.aplicacion.entorno }}"

- name: Condicional basado en entorno
  ansible.builtin.debug:
    msg: "Configurando para producción"
  when: ansible_local.aplicacion.entorno == "produccion"

- name: Usar dato del INI
  ansible.builtin.debug:
    msg: "Este servidor es {{ ansible_local.servidor.roles.tipo }}"

- name: Acceder a dict anidado en JSON
  ansible.builtin.debug:
    msg: "Nuevo checkout: {{ ansible_local.aplicacion.feature_flags.nuevo_checkout }}"</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Caso de uso real:</strong> Después de desplegar una versión de la app, escribí un custom fact con la versión desplegada. En el próximo playbook, podés leer ese fact para saber qué versión está corriendo actualmente y decidir si es necesario un nuevo deploy.</div>
      </div>
    `
  },
  {
    title: 'Custom facts como scripts ejecutables',
    body: `
      <p>Cuando un custom fact es un script ejecutable, Ansible lo ejecuta y usa lo que imprime en stdout como el JSON del fact. Esto permite facts dinámicos calculados en tiempo real.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">/etc/ansible/facts.d/estado_app.sh</span></div>
        <pre class="language-bash"><code class="language-bash">#!/bin/bash
# Este script es ejecutado por Ansible durante gather_facts
# DEBE imprimir JSON válido en stdout

APP_VERSION=$(cat /opt/mi-app/VERSION 2>/dev/null || echo "desconocida")
APP_PID=$(pgrep -f mi-app || echo "")
APP_RUNNING="false"
[ -n "$APP_PID" ] && APP_RUNNING="true"

DISK_USAGE=$(df /opt/mi-app --output=pcent 2>/dev/null | tail -1 | tr -d ' %' || echo "0")

cat <<EOF
{
  "version": "${'$'}{APP_VERSION}",
  "running": ${'$'}{APP_RUNNING},
  "pid": "${'$'}{APP_PID}",
  "disk_usage_percent": ${'$'}{DISK_USAGE}
}
EOF</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">deploy-script-fact.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Desplegar script de custom fact
  hosts: all
  become: true
  tasks:
- name: Copiar script de fact
  ansible.builtin.copy:
    src: facts/estado_app.sh
    dest: /etc/ansible/facts.d/estado_app.sh
    owner: root
    group: root
    mode: '0755'   # Debe ser ejecutable

- name: Re-recolectar facts locales
  ansible.builtin.setup:
    filter: ansible_local

- name: Verificar resultado del script
  ansible.builtin.debug:
    msg:
      - "Versión: {{ ansible_local.estado_app.version }}"
      - "Corriendo: {{ ansible_local.estado_app.running }}"</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>El script DEBE ser ejecutable (chmod +x) y retornar JSON válido en stdout.</strong> Si el script falla o retorna JSON inválido, gather_facts falla para ese host. Siempre probá el script manualmente antes de desplegarlo: <code>bash /etc/ansible/facts.d/mi_fact.sh | python3 -m json.tool</code></div>
      </div>
    `
  },
  {
    title: 'Desplegar y actualizar custom facts con Ansible',
    body: `
      <p>El flujo completo para gestionar custom facts: crear el directorio, copiar el archivo, y re-recolectar facts para que estén disponibles en el mismo play.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">gestionar-custom-facts.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Gestión completa de custom facts
  hosts: all
  become: true
  vars:
app_version: "2.3.1"
app_env: "{{ entorno | default('dev') }}"

  tasks:
# Paso 1: Crear directorio (idempotente)
- name: Crear directorio de custom facts
  ansible.builtin.file:
    path: /etc/ansible/facts.d
    state: directory
    owner: root
    group: root
    mode: '0755'

# Paso 2: Desplegar fact de la aplicación
- name: Escribir custom fact de la aplicación
  ansible.builtin.copy:
    content: |
      {
        "version": "{{ app_version }}",
        "entorno": "{{ app_env }}",
        "deploy_timestamp": "{{ ansible_date_time.iso8601 }}",
        "deployed_by": "{{ lookup('env', 'USER') | default('ansible') }}"
      }
    dest: /etc/ansible/facts.d/aplicacion.json
    owner: root
    group: root
    mode: '0644'
  notify: Refresh facts   # Solo re-recolecta si el fact cambió

# Paso 3: Re-recolectar si cambió (via handler)
# O re-recolectar siempre de forma explícita:
- name: Re-recolectar facts locales
  ansible.builtin.setup:
    filter: ansible_local

# Paso 4: Verificar y usar el fact
- name: Confirmar fact disponible
  ansible.builtin.debug:
    msg: "App v{{ ansible_local.aplicacion.version }} en {{ ansible_local.aplicacion.entorno }}"

# Paso 5: Eliminar un custom fact
- name: Eliminar fact obsoleto
  ansible.builtin.file:
    path: /etc/ansible/facts.d/fact_obsoleto.json
    state: absent

  handlers:
- name: Refresh facts
  ansible.builtin.setup:
    filter: ansible_local</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Siempre re-recolectá después de modificar facts:</strong> Si copiás un fact y luego intentás usarlo en el mismo play sin ejecutar <code>ansible.builtin.setup: filter: ansible_local</code>, <code>ansible_local</code> tendrá el valor previo (o no existirá). El handler solo se ejecuta al final del play, así que si necesitás el valor inmediatamente, usá la tarea explícita.</div>
      </div>
    `
  }
],
quiz: [
  {
    question: '¿Bajo qué variable de Ansible quedan disponibles los custom facts?',
    options: [
      'ansible_facts["custom"]',
      'ansible_local["nombre_archivo"]',
      'ansible_custom["nombre_archivo"]',
      'hostvars["custom_facts"]',
    ],
    correctIndex: 1,
    explanation: 'Los custom facts se agrupan bajo `ansible_local`. El nombre del archivo (sin extensión) se convierte en la clave. Un archivo `/etc/ansible/facts.d/aplicacion.json` queda disponible como `ansible_local.aplicacion` (o `ansible_local["aplicacion"]`).',
  },
  {
    question: '¿Qué debe hacer un script de custom fact ejecutable para que Ansible lo procese correctamente?',
    options: [
      'Escribir el resultado en un archivo temporal en /tmp',
      'Imprimir JSON válido en stdout y retornar exit code 0',
      'Escribir en /etc/ansible/facts.d/output.json',
      'Llamar al módulo setup de Ansible internamente',
    ],
    correctIndex: 1,
    explanation: 'Los scripts de custom facts deben: (1) ser ejecutables (chmod +x), (2) imprimir JSON válido en stdout, (3) retornar exit code 0. Ansible lee el stdout del script y lo parsea como JSON. Si el script falla o el JSON es inválido, gather_facts falla para ese host.',
  },
  {
    question: '¿Por qué hay que ejecutar `ansible.builtin.setup: filter: ansible_local` después de copiar un custom fact?',
    options: [
      'No es necesario, Ansible detecta automáticamente los cambios',
      'Porque gather_facts ya se ejecutó al inicio del play, y los custom facts no se recargan automáticamente',
      'Para limpiar el caché de facts del host',
      'Por seguridad, para validar que el JSON es válido',
    ],
    correctIndex: 1,
    explanation: 'gather_facts se ejecuta una sola vez al inicio del play. Si después copias un custom fact, ansible_local ya tiene el snapshot del inicio. Necesitás re-ejecutar setup (opcionalmente con filter: ansible_local para ser rápido) para que Ansible lea el nuevo archivo y actualice la variable ansible_local.',
  },
],
troubleshooting: [
  {
    error: 'ansible_local.mi_fact is undefined después de copiar el archivo',
    cause: 'El archivo de fact fue copiado después de que gather_facts ya ejecutó al inicio del play, y no se re-ejecutó setup.',
    fix: 'Agregá una tarea `ansible.builtin.setup: filter: ansible_local` después de copiar el archivo de fact. Esto re-recolecta solo los facts locales sin el overhead de recolectar todo.',
  },
  {
    error: 'gather_facts falla en un host con "Failed to parse fact"',
    cause: 'Un custom fact script retornó JSON inválido o el archivo .json está malformado.',
    fix: 'Conectate al host y probá manualmente: `bash /etc/ansible/facts.d/mi_fact.sh | python3 -m json.tool`. Si es un archivo estático, validalo con `python3 -m json.tool /etc/ansible/facts.d/mi_fact.json`. El error JSON más común es una coma extra al final.',
  },
  {
    error: 'El script de custom fact funciona manualmente pero no desde Ansible',
    cause: 'El script puede depender de variables de entorno ($HOME, $PATH) o comandos que no están en el PATH cuando Ansible lo ejecuta. Ansible ejecuta los scripts en un entorno mínimo.',
    fix: 'Usá rutas absolutas en el script (`/usr/bin/python3` en lugar de `python3`). Al inicio del script, establecé explícitamente: `export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`.',
  },
],
  };
