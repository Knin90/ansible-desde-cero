import type { ModuleContent } from '../types';

export const nivel4Mod6: ModuleContent = {
  levelId: 4,
  moduleId: 6,
  title: 'ansible-vault — Encriptación de secretos',
  objective: 'Proteger datos sensibles usando ansible-vault para encriptar variables, archivos y valores individuales.',
  duration: '1.5 horas',
  objectives: [
    'Encriptar archivos y valores individuales con ansible-vault encrypt y encrypt_string',
    'Editar archivos vault con ansible-vault edit sin desencriptarlos en disco',
    'Aplicar el patrón vault_/vars_ para separar secretos de variables normales',
    'Ejecutar playbooks con secretos vault usando --ask-vault-pass o --vault-password-file',
  ],
  steps: [
    {
      title: 'Comandos fundamentales de Vault',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">vault-comandos.sh</span></div>
          <pre class="language-bash"><code class="language-bash"># Encriptar un archivo completo
ansible-vault encrypt inventario/group_vars/all/vault.yml

# Desencriptar temporalmente para editar
ansible-vault edit inventario/group_vars/all/vault.yml

# Ver el contenido sin desencriptar el archivo
ansible-vault view inventario/group_vars/all/vault.yml

# Encriptar un valor individual (para pegar en YAML)
ansible-vault encrypt_string 'mi-password-secreto' --name 'db_password'

# Cambiar la contraseña de vault
ansible-vault rekey archivo.yml

# Desencriptar un archivo (dejarlo en texto plano)
ansible-vault decrypt archivo.yml

# Usar al ejecutar playbook
ansible-playbook sitio.yml --ask-vault-pass
ansible-playbook sitio.yml --vault-password-file ~/.vault-pass</code></pre>
        </div>
      `
    },
    {
      title: 'Buenas prácticas con Vault',
      body: `
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">group_vars/all/vault.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml"># Convención: prefijo vault_ para variables encriptadas
vault_db_password: !vault |
$ANSIBLE_VAULT;1.1;AES256
61663864313937333535633438303037383361316663333637326135...
vault_api_key: !vault |
$ANSIBLE_VAULT;1.1;AES256
38656462363339396438353736376231...</code></pre>
        </div>
        <div class="code-block-wrapper">
          <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">group_vars/all/vars.yml</span></div>
          <pre class="language-yaml"><code class="language-yaml"># Variables normales referencian las vault_
db_password: "{{ vault_db_password }}"
api_key: "{{ vault_api_key }}"</code></pre>
        </div>
        <div class="tip-box">
          <span class="box-icon">💡</span>
          <div class="box-content"><strong>Patrón recomendado:</strong> mantener los archivos vault.yml encriptados y vars.yml sin encriptar. El vault solo contiene las variables con prefijo vault_. Esto permite inspeccionar qué variables existen sin revelar sus valores.</div>
        </div>
        <div class="next-chapter-box">
          <div class="next-chapter-arrow">→</div>
          <div>
            <div class="next-chapter-label">A continuación</div>
            <div class="next-chapter-title">ansible-pull</div>
            <div class="next-chapter-desc">Invertís el modelo de ejecución: los propios hosts descargan y aplican sus playbooks desde Git, ideal para flotas de miles de máquinas.</div>
          </div>
        </div>
      `
    }
  ],
  prerequisites: [
    'Completar el Módulo 5 del Nivel 4 — ansible-galaxy',
  ],
  realWorldCase: 'Una startup almacena las contraseñas de base de datos y claves de API en archivos vault encriptados dentro de su repositorio Git. Con <code>ansible-vault edit</code> las actualiza sin desencriptarlas al disco, y los playbooks las leen automáticamente al ejecutarse con --vault-password-file.',
  quiz: [
    {
      question: '¿Qué subcomando de ansible-vault permite editar un archivo encriptado sin desencriptarlo permanentemente en disco?',
      options: ['ansible-vault open', 'ansible-vault edit', 'ansible-vault modify', 'ansible-vault change'],
      correctIndex: 1,
      explanation: 'ansible-vault edit desencripta el archivo en un editor temporal en memoria, guarda los cambios re-encriptados y elimina el archivo temporal. El archivo nunca queda en texto plano en disco.',
    },
    {
      question: '¿Cómo se encripta un valor individual para incluirlo directamente en un archivo YAML sin encriptar el archivo completo?',
      options: [
        'ansible-vault encrypt --inline "valor"',
        'ansible-vault encrypt_string "valor" --name variable',
        'ansible-vault inline "valor"',
        'ansible-vault string-encrypt "valor"',
      ],
      correctIndex: 1,
      explanation: 'ansible-vault encrypt_string genera un bloque !vault | con el valor encriptado que se puede pegar directamente en cualquier archivo YAML. Permite mezclar variables normales y encriptadas en el mismo archivo.',
    },
    {
      question: '¿Cuál es el patrón recomendado para organizar secretos con ansible-vault?',
      options: [
        'Encriptar todos los archivos group_vars completos',
        'Guardar todos los secretos en un vault.yml encriptado y referenciarlos desde vars.yml con prefijo vault_',
        'Usar encrypt_string en cada variable del playbook directamente',
        'Mantener los secretos en variables de entorno del sistema',
      ],
      correctIndex: 1,
      explanation: 'El patrón vault_/vars_ separa secrets (vault.yml encriptado con prefijo vault_) de referencias (vars.yml sin encriptar). Así podés ver qué variables existen sin revelar sus valores, y git diff es legible.',
    },
  ],
  troubleshooting: [
    {
      error: 'ERROR! Decryption failed (no vault secrets would decrypt) on ...',
      cause: 'La contraseña proporcionada no coincide con la usada para encriptar el archivo vault.',
      fix: 'Verificá que estás usando la contraseña correcta. Si usás --vault-password-file, revisá que el archivo contenga exactamente la contraseña sin espacios extra ni saltos de línea adicionales.',
    },
    {
      error: 'ERROR! A vault password must be specified to decrypt ...',
      cause: 'El playbook incluye variables vault pero no se proporcionó la contraseña de vault al ejecutarlo.',
      fix: 'Agregá --ask-vault-pass para ingresar la contraseña interactivamente, o --vault-password-file ~/.vault-pass para leerla de un archivo.',
    },
    {
      error: 'ansible-vault: [Errno 13] Permission denied: vault.yml',
      cause: 'El usuario que ejecuta ansible-vault no tiene permisos de escritura sobre el archivo vault.',
      fix: 'Verificá los permisos con ls -la vault.yml. Ajustá con chmod u+w vault.yml o ejecutá con el usuario propietario del archivo.',
    },
  ],
};
