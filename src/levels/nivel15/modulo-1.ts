import type { ModuleContent } from '../types';

export const nivel15Mod1: ModuleContent =   {
levelId: 15,
moduleId: 1,
title: 'Encriptación básica con Vault',
objective: 'Usar Ansible Vault para encriptar secretos y gestionarlos de forma segura en repositorios de código usando AES-256.',
duration: '2 horas',
objectives: [
  'Comprender por qué Ansible Vault es necesario para gestionar secretos en Git',
  'Dominar los comandos create, encrypt, decrypt, view, edit y rekey',
  'Encriptar valores individuales con encrypt_string para incrustarlos en YAML',
  'Ejecutar playbooks con archivos encriptados usando --ask-vault-pass y --vault-password-file',
],
prerequisites: [
  'Completados los Niveles 0–14',
  'Playbooks funcionales con variables en group_vars',
  'Repositorio Git donde subir configuración de Ansible',
],
steps: [
  {
    title: '¿Por qué Vault? El problema de los secretos en Git',
    body: `
      <p>Todo proyecto serio de Ansible necesita manejar secretos: contraseñas de bases de datos, tokens de API, claves SSH, certificados. El problema es que estos secretos deben estar disponibles para los playbooks, pero no deben vivir en texto plano en el repositorio Git.</p>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Imaginá que tu repositorio Git es una caja de documentos que cualquier miembro del equipo puede ver. Ansible Vault es el equivalente a poner los documentos sensibles en un sobre lacrado dentro de esa caja: todos saben que existe el sobre, pero solo quien tiene la llave puede leerlo. El repositorio sigue siendo compartido, pero los secretos están protegidos.</p>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>El problema sin Vault:</strong><br>
          • Secretos en texto plano en group_vars → cualquiera con acceso al repo los ve<br>
          • Secretos en variables de entorno → difícil de versionar y compartir con el equipo<br>
          • Secretos fuera del repo → desincronización entre entornos<br><br>
          <strong>La solución con Vault:</strong><br>
          • Secretos encriptados con AES-256 → seguros en Git<br>
          • Versionados junto al código → sincronizados entre entornos<br>
          • Un único lugar de verdad → sin divergencias entre prod y staging
        </div>
      </div>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>AES-256:</strong> Advanced Encryption Standard con clave de 256 bits. El estándar de facto para encriptación simétrica, usado por bancos, gobiernos y agencias de inteligencia. Un archivo encriptado con AES-256 y una contraseña robusta es computacionalmente imposible de romper por fuerza bruta con la tecnología actual.</div>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Vault no es magia:</strong> Vault protege los secretos mientras están en reposo (en el repo). La contraseña del vault sigue siendo el punto débil — si alguien obtiene esa contraseña, puede descifrar todo. Por eso la contraseña del vault nunca va al repo y se gestiona por separado (en un secret manager del CI/CD o en un gestor de contraseñas del equipo).</div>
      </div>
    `
  },
  {
    title: 'Los siete comandos de Vault que necesitás dominar',
    body: `
      <p>Ansible Vault tiene un conjunto pequeño de comandos que cubren todo el ciclo de vida de los secretos. Dominarlos es sencillo — hay menos comandos que en git.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">vault-comandos.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># 1. CREATE — Crear un nuevo archivo encriptado desde cero
#    Abre el editor ($EDITOR, por defecto vi/nano) y encripta al guardar
ansible-vault create group_vars/all/vault.yml

# 2. ENCRYPT — Encriptar un archivo existente (en texto plano) in-place
#    El archivo original queda reemplazado por la versión encriptada
ansible-vault encrypt group_vars/produccion/vars.yml

# 3. VIEW — Ver el contenido descifrado sin editarlo
#    No modifica el archivo — solo muestra en pantalla
ansible-vault view group_vars/all/vault.yml

# 4. EDIT — Editar el contenido de un archivo encriptado
#    Desencripta temporalmente en memoria, abre el editor, re-encripta al guardar
ansible-vault edit group_vars/all/vault.yml

# 5. DECRYPT — Desencriptar un archivo a texto plano (en disco)
#    ¡CUIDADO! El archivo queda en texto plano — no commitear después
ansible-vault decrypt group_vars/all/vault.yml

# 6. REKEY — Cambiar la contraseña del vault (rotación de credenciales)
#    Pide la contraseña antigua y la nueva — re-encripta con la nueva
ansible-vault rekey group_vars/all/vault.yml

# 7. ENCRYPT_STRING — Encriptar un solo valor para pegar inline en YAML
#    Muy útil para un solo secreto en un archivo que mayormente es texto plano
ansible-vault encrypt_string 'mi-password-secreto' --name 'db_password'
ansible-vault encrypt_string 'sk-prod-abc123' --name 'api_token'</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>El editor del vault:</strong> Por defecto, <code>ansible-vault create</code> y <code>ansible-vault edit</code> abren el editor configurado en <code>$EDITOR</code>. Si no está configurado, usa vi. Podés cambiarlo con <code>export EDITOR=nano</code> antes de ejecutar el comando, o configurar <code>EDITOR=nano ansible-vault create vault.yml</code> como prefijo del comando.</div>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>decrypt es permanente:</strong> Después de ejecutar <code>ansible-vault decrypt</code>, el archivo queda en texto plano en disco. Si hacés commit de ese archivo por accidente, los secretos quedan expuestos en el historial de Git para siempre. Siempre revisá el output de <code>git diff --staged</code> antes de hacer commit.</div>
      </div>
    `
  },
  {
    title: 'encrypt_string — secretos inline en YAML',
    body: `
      <p>A veces no querés encriptar un archivo completo, sino solo el valor de una variable específica en un archivo que de otro modo es texto plano. <code>encrypt_string</code> genera un bloque YAML con el valor encriptado listo para pegar.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">encrypt-string.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Encriptar un string y generar el YAML directamente
ansible-vault encrypt_string 'postgres-pass-2024' --name 'vault_db_password'

# Output del comando:
# vault_db_password: !vault |
#   $ANSIBLE_VAULT;1.1;AES256
#   66386439653236336462626566653063336164663966303231363934653561363264383833643636
#   31653965...

# Encriptar leyendo desde stdin (para no tener el secreto en history)
echo -n 'mi-secret' | ansible-vault encrypt_string --stdin-name 'vault_api_key'

# Encriptar con vault-id específico
ansible-vault encrypt_string 'prod-pass' --vault-id prod@prompt --name 'vault_db_password'</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">group_vars/produccion/vars.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml"># Archivo mixto: texto plano + valores encriptados con !vault
db_host: db-prod.empresa.com
db_port: 5432
db_name: produccion_db

# Este valor está encriptado con ansible-vault encrypt_string
vault_db_password: !vault |
  $ANSIBLE_VAULT;1.1;AES256
  66386439653236336462626566653063336164663966303231363934653561363264383833643636
  3165396566663335663831303838613566653633656135640a383962643935396438386139663936
  62313665356631393562313530653964646436326533316436653762353332343535363839616638
  6263363565613234640a653663666535323365313066333034643233363630356438383339613665
  3261

vault_api_token: !vault |
  $ANSIBLE_VAULT;1.1;AES256
  34316665386635373664336166653432613430316234313638336438376133653930343534343036
  6332323036616233383934356132643463616534616564610a323164623431326633363230373866
  62333263626636393865623636363834623832623731356635336134623239376137393338623735
  3365363662616462650a323735646636373665306363636635343165396333336465343430363566
  6563</code></pre>
      </div>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>Tag YAML !vault:</strong> El marcador <code>!vault |</code> es un tag YAML personalizado que Ansible registra. Cuando el parser de YAML encuentra este tag, sabe que el valor multilínea siguiente debe ser descifrado por Ansible Vault antes de usarse. Sin la contraseña correcta, el valor es solo texto encriptado ilegible.</div>
      </div>
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio</div>
        <div class="lab-content">
          <p><strong>Objetivo:</strong> Encriptar tu primer secreto y verificar que funciona en un playbook.</p>
          <ol>
            <li>Ejecutá <code>ansible-vault encrypt_string 'password-de-prueba' --name 'vault_test_password'</code></li>
            <li>Copiá el bloque <code>!vault |</code> generado a un archivo <code>group_vars/all/vault.yml</code></li>
            <li>Creá un playbook que use <code>{{ vault_test_password }}</code> en un módulo debug</li>
            <li>Ejecutá con <code>ansible-playbook test.yml --ask-vault-pass</code> y verificá que imprime el valor descifrado</li>
          </ol>
        </div>
      </div>
    `
  },
  {
    title: 'Ejecutar playbooks con archivos encriptados',
    body: `
      <p>Ansible necesita la contraseña del vault para descifrar los valores en tiempo de ejecución. Hay tres formas de proveerla, con distinto balance entre conveniencia y seguridad.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">ejecutar-con-vault.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># OPCIÓN 1: Contraseña interactiva (ideal para desarrollo local)
#   Ansible pide la contraseña por stdin — no queda en el historial
ansible-playbook site.yml --ask-vault-pass

# OPCIÓN 2: Archivo con la contraseña (ideal para CI/CD)
#   El archivo debe contener SOLO la contraseña, sin newlines extra
echo -n 'mi-vault-password' > ~/.vault_pass
chmod 600 ~/.vault_pass
ansible-playbook site.yml --vault-password-file ~/.vault_pass

# Variable de entorno apuntando al archivo de contraseña
export ANSIBLE_VAULT_PASSWORD_FILE=~/.vault_pass
ansible-playbook site.yml    # ya no necesita --vault-password-file

# Configurar en ansible.cfg para no olvidarlo nunca
# [defaults]
# vault_password_file = ~/.vault_pass

# OPCIÓN 3: Script ejecutable como fuente de contraseña (ideal para prod)
#   El script debe imprimir la contraseña a stdout y retornar 0
chmod +x scripts/get_vault_pass.py
ansible-playbook site.yml --vault-password-file scripts/get_vault_pass.py</code></pre>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Regla de oro: dónde va cada opción</strong><br>
          • <strong>--ask-vault-pass</strong>: tu laptop en desarrollo — cómodo y seguro<br>
          • <strong>--vault-password-file ~/.vault_pass</strong>: servidores de CI/CD — el archivo viene de un secret<br>
          • <strong>--vault-password-file script.py</strong>: producción con secret manager — máxima seguridad
        </div>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Nunca en ansible.cfg del repo:</strong> No configures <code>vault_password_file</code> apuntando a un archivo que existe en el repo o que contiene la contraseña en texto plano. Si el archivo de contraseña queda en Git, todos los secretos quedan expuestos. Usá rutas absolutas fuera del proyecto (<code>~/.vault_pass</code>) o scripts que consultan external secret managers.</div>
      </div>
    `
  },
  {
    title: 'El patrón vars.yml + vault.yml — la convención del doble archivo',
    body: `
      <p>La convención más adoptada por la comunidad es separar cada grupo de variables en dos archivos: uno en texto plano con los valores no sensibles y referencias a variables de vault, y otro encriptado con los valores reales. El resultado: podés ver la estructura de variables sin revelar los secretos.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">group_vars/all/vars.yml (texto plano — va a Git)</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# Variables no sensibles — texto plano
db_host: db.empresa.com
db_port: 5432
db_name: produccion

# Variables sensibles — apuntan al vault (convención: prefijo vault_)
db_password: "{{ vault_db_password }}"
api_token: "{{ vault_api_token }}"
smtp_password: "{{ vault_smtp_password }}"
deploy_ssh_key: "{{ vault_deploy_ssh_key }}"</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">group_vars/all/vault.yml (encriptado — va a Git así encriptado)</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# Este archivo está COMPLETAMENTE encriptado con ansible-vault
# Contenido real (antes de encriptar):
vault_db_password: "postgres-prod-s3cur3!"
vault_api_token: "sk-prod-AbCdEfGhIjKlMnOpQrSt"
vault_smtp_password: "smtp-app-password-2024"
vault_deploy_ssh_key: |
  -----BEGIN OPENSSH PRIVATE KEY-----
  b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAE...
  -----END OPENSSH PRIVATE KEY-----</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">playbook.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Configurar base de datos
  hosts: db_servers
  tasks:
- name: Configurar la conexión a PostgreSQL
  ansible.builtin.template:
    src: pg_config.j2
    dest: /etc/myapp/database.conf
  # Ansible carga vars.yml y vault.yml automáticamente desde group_vars/all/
  # db_password resuelve a {{ vault_db_password }} que está descifrado del vault

- name: Crear usuario de BD
  community.postgresql.postgresql_user:
    name: app_user
    password: "{{ db_password }}"   # usa la variable "pública" que referencia al vault</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>¿Por qué el doble archivo vale la pena?</strong> Con este patrón, alguien nuevo en el equipo puede leer <code>vars.yml</code> y entender qué variables usa el playbook, sin necesidad de la contraseña del vault. Además, al revisar un PR en GitHub, podés ver si se agregaron variables nuevas (visibles en vars.yml) aunque no puedas ver sus valores (encriptados en vault.yml).</div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'Ansible Vault',
    definition: 'Sistema integrado en Ansible para encriptar archivos y valores individuales usando AES-256. Permite almacenar secretos (contraseñas, tokens, claves) en repositorios Git de forma segura, ya que el contenido encriptado es ilegible sin la contraseña correcta.',
  },
  {
    term: 'ansible-vault encrypt_string',
    definition: 'Subcomando de Vault que encripta un único valor de texto y genera el bloque YAML con el tag !vault listo para pegar en un archivo de variables. Es útil cuando solo un campo de un archivo necesita encriptación, sin encriptar el archivo completo.',
  },
  {
    term: 'Tag !vault',
    definition: 'Tag YAML personalizado que Ansible registra para identificar valores encriptados con Vault incrustados en archivos YAML. Al cargar el archivo, Ansible desencripta automáticamente cualquier valor marcado con !vault usando la contraseña del vault disponible.',
  },
  {
    term: '--vault-password-file',
    definition: 'Flag de ansible-playbook que especifica un archivo o script ejecutable del cual leer la contraseña del vault. Si el argumento es un script ejecutable (chmod +x), Ansible lo ejecuta y lee la contraseña de su stdout. Permite automatizar la provisión de contraseñas desde secret managers externos.',
  },
  {
    term: 'ANSIBLE_VAULT_PASSWORD_FILE',
    definition: 'Variable de entorno equivalente al flag --vault-password-file. Cuando está configurada, Ansible la usa automáticamente sin necesitar el flag en cada ejecución. Útil para configurar en el entorno del CI/CD o en el perfil del shell del usuario.',
  },
],
quiz: [
  {
    question: '¿Qué algoritmo de encriptación usa Ansible Vault?',
    options: [
      'RSA-2048',
      'AES-256',
      'MD5',
      'SHA-512',
    ],
    correctIndex: 1,
    explanation: 'Ansible Vault usa AES-256 (Advanced Encryption Standard con clave de 256 bits), el estándar de encriptación simétrica más robusto disponible. Es el mismo algoritmo usado por instituciones financieras y gubernamentales para proteger información sensible. La contraseña del vault se usa para derivar la clave AES-256 mediante PBKDF2.',
  },
  {
    question: '¿Qué diferencia hay entre "ansible-vault view" y "ansible-vault decrypt"?',
    options: [
      'No hay diferencia, hacen lo mismo',
      'view muestra el contenido temporalmente sin modificar el archivo; decrypt lo desencripta permanentemente en disco',
      'view solo funciona con archivos pequeños; decrypt con cualquier tamaño',
      'view requiere la contraseña; decrypt no',
    ],
    correctIndex: 1,
    explanation: 'ansible-vault view desencripta el archivo temporalmente en memoria y muestra el contenido en pantalla, sin modificar el archivo encriptado en disco. ansible-vault decrypt sobreescribe el archivo con su versión en texto plano de forma permanente. Después de decrypt, el archivo ya no está encriptado — si lo commitás por accidente, los secretos quedan expuestos.',
  },
  {
    question: '¿Cuál es la convención recomendada para nombrar variables en vault.yml?',
    options: [
      'Mismo nombre que la variable pública (ej: db_password)',
      'Prefijo secret_ (ej: secret_db_password)',
      'Prefijo vault_ (ej: vault_db_password)',
      'Sufijo _enc (ej: db_password_enc)',
    ],
    correctIndex: 2,
    explanation: 'La convención más adoptada es usar el prefijo vault_ en las variables encriptadas (vault_db_password, vault_api_token). El archivo vars.yml en texto plano define db_password: "{{ vault_db_password }}", apuntando al valor encriptado. Esto hace visible en el código qué variables son sensibles y de dónde vienen, sin revelar sus valores.',
  },
  {
    question: '¿Cuál es la forma más segura de proveer la contraseña del vault en producción?',
    options: [
      'Configurar vault_password_file en ansible.cfg con un archivo en el repo',
      'Usar --ask-vault-pass para ingresarla manualmente',
      'Un script ejecutable que consulta un secret manager externo (AWS Secrets Manager, Vault, etc.)',
      'Guardar la contraseña en una variable de entorno en el sistema operativo',
    ],
    correctIndex: 2,
    explanation: 'En producción, la forma más segura es un script ejecutable que consulta un secret manager externo (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault, etc.). El script nunca tiene la contraseña en texto plano — la obtiene dinámicamente en tiempo de ejecución. Ansible ejecuta el script y lee la contraseña de stdout. Esto elimina el riesgo de que la contraseña esté en disco o en variables de entorno del sistema.',
  },
],
troubleshooting: [
  {
    error: "ERROR! Decryption failed (no vault secrets were found that could decrypt)",
    cause: 'El playbook contiene variables encriptadas con Vault pero no se proporcionó la contraseña del vault. Ansible no sabe cómo descifrar los valores.',
    fix: 'Agregá --ask-vault-pass al comando: ansible-playbook site.yml --ask-vault-pass. O configurá ANSIBLE_VAULT_PASSWORD_FILE apuntando a un archivo con la contraseña. Verificá también que la contraseña es la correcta para ese vault específico.',
  },
  {
    error: "ERROR! Vault password files /tmp/.vault_pass were not found",
    cause: 'El archivo especificado en --vault-password-file o en ANSIBLE_VAULT_PASSWORD_FILE no existe en el path indicado.',
    fix: 'Verificá que el archivo existe: ls -la ~/.vault_pass. Comprobá los permisos (debe ser legible por el usuario actual). Si usás rutas relativas, recordá que se resuelven desde el directorio de trabajo actual, no desde el directorio del playbook.',
  },
  {
    error: "WARNING: Rekey failed: The vault password file /tmp/.vault_pass is empty",
    cause: 'El archivo de contraseña del vault está vacío o contiene solo espacios/newlines.',
    fix: 'Creá el archivo correctamente con el contenido exacto de la contraseña sin newlines: echo -n "mi-contraseña" > ~/.vault_pass. La opción -n de echo evita agregar un newline al final. Verificá el contenido con: wc -c ~/.vault_pass — el número de bytes debe coincidir con la longitud exacta de la contraseña.',
  },
],
  };
