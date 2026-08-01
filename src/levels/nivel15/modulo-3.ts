import type { ModuleContent } from '../types';

export const nivel15Mod3: ModuleContent =   {
levelId: 15,
moduleId: 3,
title: 'Buenas prácticas de seguridad con Vault',
objective: 'Aplicar las mejores prácticas para gestionar secretos de Ansible de forma segura en equipos, pipelines de CI/CD y rotación de credenciales.',
duration: '2 horas',
objectives: [
  'Implementar el patrón doble archivo (vars.yml + vault.yml) correctamente',
  'Integrar Ansible Vault en pipelines de GitHub Actions y GitLab CI',
  'Aplicar no_log: true en tareas que usan variables sensibles',
  'Rotar contraseñas de vault con rekey de forma segura',
],
prerequisites: [
  'Completados los Módulos 1 y 2 de Nivel 15',
  'Repositorio de Ansible con grupo de hosts configurado',
],
steps: [
  {
    title: 'Estructura de proyecto — qué encriptar y qué no',
    body: `
      <p>Uno de los errores más comunes es encriptar archivos enteros cuando solo hace falta proteger algunos valores. Encriptar demasiado hace el proyecto difícil de mantener; encriptar muy poco expone información innecesariamente.</p>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Regla práctica — qué SIEMPRE encriptar:</strong><br>
          • Contraseñas de bases de datos<br>
          • Tokens de API y claves de acceso<br>
          • Claves SSH privadas<br>
          • Certificados TLS/SSL (claves privadas)<br>
          • Secretos de autenticación (client_secret de OAuth)<br><br>
          <strong>Qué NUNCA encriptar (texto plano está bien):</strong><br>
          • Hostnames y IPs de servidores<br>
          • Puertos y configuración de red<br>
          • Nombres de bases de datos y usuarios<br>
          • Parámetros de configuración sin secretos<br>
          • Variables de entorno no sensibles
        </div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">estructura-proyecto.txt</span></div>
        <pre class="language-bash"><code class="language-bash">proyecto-ansible/
├── ansible.cfg
├── requirements.yml
├── .gitignore              # CRÍTICO: excluir contraseñas de vault
├── inventory/
│   ├── produccion/
│   │   ├── hosts.yml       # Texto plano — hostnames/IPs
│   │   └── group_vars/
│   │       ├── all/
│   │       │   ├── vars.yml    # Texto plano — referencias a vault_*
│   │       │   └── vault.yml   # ENCRIPTADO — valores reales
│   │       └── webservers/
│   │           ├── vars.yml
│   │           └── vault.yml
│   └── staging/            # Estructura idéntica, vault diferente
├── roles/
│   └── app/
│       ├── tasks/main.yml
│       ├── defaults/main.yml   # Texto plano — valores por defecto no sensibles
│       └── vars/main.yml       # A veces encriptado si el rol tiene sus propios secretos
└── playbooks/
└── deploy.yml</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">text</span><span class="code-block-filename">.gitignore</span></div>
        <pre class="language-text"><code class="language-text"># Contraseñas de vault — NUNCA al repo
.vault_pass
.vault_pass_dev
.vault_pass_staging
.vault_pass_prod
*.vault_pass
vault_pass.txt

# Collections instaladas localmente
collections/ansible_collections/

# Caché de facts
.ansible/
/tmp/ansible_fact_cache/

# Archivos temporales de retry
*.retry</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Verificar que vault.yml está encriptado:</strong> Antes de hacer commit, verificá con <code>git diff --staged</code> que los archivos vault.yml NO muestran el contenido en texto plano. Un archivo vault correctamente encriptado empieza con <code>$ANSIBLE_VAULT;</code> — eso es lo que debe aparecer en el diff.</div>
      </div>
    `
  },
  {
    title: 'no_log: true — ocultar secretos en el output',
    body: `
      <p>Aunque las variables vengan de Vault, Ansible puede mostrar sus valores descifrados en el output de las tareas — en mensajes de error, en el resultado de <code>register</code>, o en modo verbose. <code>no_log: true</code> suprime completamente el output de una tarea.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">tasks/database.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Crear usuario de base de datos
  community.postgresql.postgresql_user:
name: app_user
password: "{{ db_password }}"    # viene del vault
priv: "mi_db.*:ALL"
  no_log: true    # ← la contraseña no aparece en el output ni en logs

- name: Configurar credenciales de API
  ansible.builtin.uri:
url: "https://api.empresa.com/auth"
method: POST
body_format: json
body:
  client_id: "{{ api_client_id }}"
  client_secret: "{{ api_client_secret }}"    # sensible
headers:
  Content-Type: application/json
  no_log: true    # ← el token de respuesta tampoco se loguea
  register: api_auth_result

- name: Usar el token de autenticación (mostrar solo el status)
  ansible.builtin.debug:
msg: "Auth exitosa: {{ api_auth_result.status }}"
  # no_log: false — el status code es información segura de mostrar</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>no_log: true no encripta nada:</strong> <code>no_log</code> solo suprime el output en pantalla y en los logs de Ansible. No encripta los datos en memoria ni protege contra acceso directo al sistema. Para secretos reales, siempre usá Vault para protegerlos en reposo y <code>no_log: true</code> para evitar que aparezcan en logs de CI/CD.</div>
      </div>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>ANSIBLE_NO_LOG:</strong> La variable de entorno <code>ANSIBLE_NO_LOG=True</code> activa <code>no_log</code> globalmente para todas las tareas. Útil en pipelines de producción donde cualquier output podría quedar en logs del CI/CD. Pero también hace el debugging más difícil — usalo con cuidado.</div>
      </div>
    `
  },
  {
    title: 'Integración con GitHub Actions y GitLab CI',
    body: `
      <p>En CI/CD, la contraseña del vault no puede pedirse interactivamente. La solución estándar es guardar la contraseña como secret en la plataforma de CI/CD y inyectarla en el pipeline.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/deploy.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">name: Deploy con Ansible Vault

on:
  push:
branches: [main]

jobs:
  deploy:
runs-on: ubuntu-latest
steps:
  - uses: actions/checkout@v4

  - name: Instalar Ansible y dependencias
    run: |
      pip install ansible boto3
      ansible-galaxy collection install -r requirements.yml

  - name: Configurar contraseña de vault
    run: |
      # Escribir el secret de GitHub Actions al archivo temporal
      # secrets.VAULT_PASSWORD se configura en: Settings → Secrets → Actions
      printf '%s' "${'$'}{{ secrets.VAULT_PASSWORD }}" > /tmp/.vault_pass
      chmod 600 /tmp/.vault_pass

  - name: Ejecutar playbook
    run: |
      ansible-playbook \
        -i inventory/produccion \
        --vault-password-file /tmp/.vault_pass \
        playbooks/deploy.yml
    env:
      ANSIBLE_HOST_KEY_CHECKING: "False"

  - name: Limpiar secretos
    if: always()    # ejecutar siempre, incluso si el playbook falla
    run: |
      rm -f /tmp/.vault_pass
      # Limpiar cualquier otro archivo temporal con secretos</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.gitlab-ci.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">deploy:
  image: python:3.11
  stage: deploy
  only:
- main
  script:
- pip install ansible
- ansible-galaxy collection install -r requirements.yml
# CI_VAULT_PASSWORD es una variable protegida en GitLab CI/CD Settings
- echo -n "$CI_VAULT_PASSWORD" > /tmp/.vault_pass
- ansible-playbook
    -i inventory/produccion
    --vault-password-file /tmp/.vault_pass
    playbooks/deploy.yml
  after_script:
- rm -f /tmp/.vault_pass  # limpiar siempre</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>printf vs echo:</strong> Usá <code>printf '%s' "$SECRET"</code> en lugar de <code>echo "$SECRET"</code> para escribir la contraseña al archivo. Echo agrega un newline al final que puede hacer que Ansible no reconozca la contraseña. Printf con %s no agrega newline.</div>
      </div>
    `
  },
  {
    title: 'Rotación de contraseñas con rekey',
    body: `
      <p>Rotar regularmente las contraseñas de vault es una práctica de seguridad fundamental. El comando <code>rekey</code> re-encripta un archivo con una nueva contraseña sin necesidad de desencriptarlo a texto plano primero.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">rekey-vault.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Rekey de un solo archivo (pide contraseña antigua y nueva interactivamente)
ansible-vault rekey group_vars/all/vault.yml

# Rekey con archivos de contraseña (ideal para automatización)
ansible-vault rekey \
  --vault-password-file ~/.vault_pass_viejo \
  --new-vault-password-file ~/.vault_pass_nuevo \
  group_vars/all/vault.yml

# Rekey de múltiples archivos en un solo comando
ansible-vault rekey \
  --vault-password-file ~/.vault_pass_viejo \
  --new-vault-password-file ~/.vault_pass_nuevo \
  group_vars/all/vault.yml \
  group_vars/webservers/vault.yml \
  group_vars/dbservers/vault.yml

# Rekey de todos los archivos vault en el proyecto (con find)
find . -name "vault.yml" -exec ansible-vault rekey \
  --vault-password-file ~/.vault_pass_viejo \
  --new-vault-password-file ~/.vault_pass_nuevo \
  {} \;

# Verificar que el rekey funcionó (debe pedir la NUEVA contraseña)
ansible-vault view --vault-password-file ~/.vault_pass_nuevo group_vars/all/vault.yml</code></pre>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Cuándo hacer rekey:</strong><br>
          • Cada N meses por política de seguridad (trimestral es común)<br>
          • Cuando un miembro del equipo con acceso a la contraseña se va<br>
          • Cuando sospechás que la contraseña pudo haberse filtrado<br>
          • Al migrar de un entorno a otro (dev → prod requiere contraseñas distintas)
        </div>
      </div>
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio</div>
        <div class="lab-content">
          <p><strong>Objetivo:</strong> Simular una rotación completa de contraseña de vault.</p>
          <ol>
            <li>Creá un vault con contraseña "pass-vieja-123": <code>ansible-vault create vault.yml</code>, agrega <code>vault_test: valor-secreto</code></li>
            <li>Prepará la nueva contraseña: <code>echo -n 'pass-nueva-456' > /tmp/nuevo_pass</code></li>
            <li>Ejecutá el rekey: <code>ansible-vault rekey --new-vault-password-file /tmp/nuevo_pass vault.yml</code></li>
            <li>Verificá que la contraseña vieja ya no funciona: <code>ansible-vault view vault.yml</code> (debería fallar)</li>
            <li>Verificá que la nueva contraseña funciona: <code>ansible-vault view --vault-password-file /tmp/nuevo_pass vault.yml</code></li>
            <li>Limpiá: <code>rm /tmp/nuevo_pass vault.yml</code></li>
          </ol>
        </div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'no_log: true',
    definition: 'Directiva de tarea en Ansible que suprime completamente el output de esa tarea en la salida del playbook, incluyendo mensajes de error y valores de variables registradas. Esencial para tareas que manejan contraseñas, tokens u otros secretos para que no aparezcan en logs de CI/CD.',
  },
  {
    term: 'ansible-vault rekey',
    definition: 'Comando que re-encripta un archivo vault con una nueva contraseña sin necesidad de desencriptarlo a texto plano. El proceso es atómico: si falla, el archivo queda con la contraseña original. Esencial para rotación periódica de credenciales y para cuando un miembro del equipo con acceso a la contraseña deja la organización.',
  },
  {
    term: 'GitHub Actions Secrets',
    definition: 'Variables encriptadas almacenadas en la configuración de un repositorio de GitHub (Settings → Secrets → Actions). No son visibles en el UI después de guardarse y no aparecen en los logs del pipeline. Son la forma recomendada de proveer la contraseña de vault a pipelines de CI/CD en GitHub.',
  },
  {
    term: 'Patrón doble archivo (vars.yml + vault.yml)',
    definition: 'Convención de organización de variables donde vars.yml contiene variables no sensibles y referencias {{ vault_variable }} en texto plano, mientras vault.yml (encriptado) contiene los valores reales con prefijo vault_. Permite revisar la estructura de variables sin necesitar la contraseña del vault.',
  },
],
quiz: [
  {
    question: '¿Qué hace no_log: true en una tarea de Ansible?',
    options: [
      'Encripta el output de la tarea con Vault antes de loguearlo',
      'Suprime el output de la tarea para que no aparezca en pantalla ni en logs',
      'Deshabilita el logging del sistema operativo en el host remoto',
      'Hace que la tarea se ejecute sin mostrar el play recap',
    ],
    correctIndex: 1,
    explanation: 'no_log: true suprime completamente el output de esa tarea — el módulo se ejecuta normalmente, pero ni el resultado, ni los parámetros, ni los errores se muestran en el output del playbook. Esto evita que contraseñas y tokens aparezcan en logs de CI/CD, terminales compartidas o archivos de log. No encripta nada — solo silencia el output.',
  },
  {
    question: '¿Cuándo es apropiado ejecutar ansible-vault rekey?',
    options: [
      'Solo cuando olvidás la contraseña del vault',
      'Cada vez que agregás una variable nueva al vault',
      'Periódicamente (ej: cada trimestre) y cuando alguien con acceso a la contraseña deja el equipo',
      'Solo cuando actualizás la versión de Ansible',
    ],
    correctIndex: 2,
    explanation: 'El rekey debe hacerse periódicamente como política de seguridad (trimestral es común) y obligatoriamente cuando alguien que conocía la contraseña deja la organización. También cuando sospechas que la contraseña pudo haberse comprometido. El rekey re-encripta el archivo con la nueva contraseña sin exponerlo en texto plano.',
  },
  {
    question: '¿Por qué se usa printf en lugar de echo para escribir el vault password en CI/CD?',
    options: [
      'printf es más rápido que echo para strings largos',
      'echo no existe en todos los shells de CI/CD',
      'echo agrega un newline al final que puede hacer que Ansible no reconozca la contraseña',
      'printf encripta el output antes de escribirlo al archivo',
    ],
    correctIndex: 2,
    explanation: 'echo por defecto agrega un newline (\\n) al final del string. Si el archivo de contraseña termina con un newline, Ansible puede interpretar ese newline como parte de la contraseña, haciendo que no coincida con la contraseña original y falle el descifrado. printf \'%s\' "$SECRET" escribe exactamente el contenido de la variable sin ningún carácter extra.',
  },
],
troubleshooting: [
  {
    error: "ERROR! The vault password provided does not appear to match the vault password for the encrypted variables",
    cause: 'La contraseña proporcionada no coincide con la que se usó para encriptar el vault. Puede ser porque el archivo fue encriptado con una contraseña diferente, o porque el archivo de contraseña contiene caracteres extra (newline, espacios).',
    fix: 'Verificá el contenido del archivo de contraseña: cat -A ~/.vault_pass — si ves $ al final (newline), el archivo tiene un newline extra. Recréalo con printf \'%s\' "tu-contraseña" > ~/.vault_pass. Si la contraseña es genuinamente incorrecta, necesitás hacer rekey con la contraseña correcta.',
  },
  {
    error: "La tarea muestra la contraseña en el output aunque viene del vault",
    cause: 'La tarea no tiene no_log: true. Las tareas que usan variables de vault muestran sus valores descifrados en el output si no se suprime explícitamente.',
    fix: 'Agregá no_log: true a todas las tareas que usan variables sensibles: contraseñas, tokens, claves privadas. Revisá también que el módulo debug no imprima variables sensibles directamente.',
  },
  {
    error: "ansible-vault rekey ERROR! Decryption failed on ...",
    cause: 'La contraseña "vieja" provista para el rekey es incorrecta. No se puede hacer rekey sin conocer la contraseña actual.',
    fix: 'El rekey requiere la contraseña actual del vault. No hay forma de recuperar el contenido sin la contraseña correcta — Ansible Vault no tiene backdoor. Si la contraseña se perdió, el único recurso es recuperarla del secret manager donde estaba almacenada, o restaurar el archivo desde un backup anterior a la encriptación.',
  },
],
  };
