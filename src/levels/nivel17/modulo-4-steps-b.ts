import type { StepContent } from '../types';

export const nivel17Mod4StepsB: StepContent[] = [
  {
    title: 'Job staging-check: --check antes del merge',
    body: `
      <p>Este job conecta con el entorno de staging real y corre <code>--check --diff</code>. Si Ansible reporta algún error, el PR no puede mergearse.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/ansible-ci.yml — job staging-check</span></div>
        <pre class="language-yaml"><code class="language-yaml">  staging-check:
name: Staging Dry-Run
runs-on: ubuntu-latest
needs: molecule
if: github.event_name == 'pull_request'
environment: staging   # entorno protegido de GitHub

steps:
  - name: Checkout del repositorio
    uses: actions/checkout@v4

  - name: Configurar Python y Ansible
    uses: actions/setup-python@v5
    with:
      python-version: '3.12'
      cache: pip

  - name: Instalar Ansible y colecciones
    run: |
      pip install ansible
      ansible-galaxy collection install -r requirements.yml

  - name: Configurar clave SSH
    run: |
      mkdir -p ~/.ssh
      echo "$STAGING_SSH_KEY" > ~/.ssh/id_ed25519
      chmod 600 ~/.ssh/id_ed25519
      ssh-keyscan -H "$STAGING_HOST" >> ~/.ssh/known_hosts
    env:
      STAGING_SSH_KEY: ${'$'}{{ secrets.STAGING_SSH_KEY }}
      STAGING_HOST: ${'$'}{{ secrets.STAGING_HOST }}

  - name: Configurar Ansible Vault password
    run: |
      echo "$ANSIBLE_VAULT_PASSWORD" > ~/.vault_pass
      chmod 600 ~/.vault_pass
    env:
      ANSIBLE_VAULT_PASSWORD: ${'$'}{{ secrets.ANSIBLE_VAULT_PASSWORD }}

  - name: Dry-run en staging
    run: |
      ansible-playbook site.yml \\
        -i inventory/staging \\
        --check \\
        --diff \\
        --vault-password-file ~/.vault_pass
    env:
      ANSIBLE_HOST_KEY_CHECKING: 'false'</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content">El <code>environment: staging</code> activa las protecciones de entorno de GitHub: approval manual requerido, lista de reviewers autorizados, y restricción de qué branches pueden deployar. Siempre usá environments protegidos para staging y producción.</div>
      </div>
    `,
  },
  {
    title: 'Job deploy: deployment a producción tras merge',
    body: `
      <p>Este job corre solo en push a main (es decir, tras un merge). Aplica el playbook completo en producción.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/ansible-ci.yml — job deploy</span></div>
        <pre class="language-yaml"><code class="language-yaml">  deploy:
name: Deploy a Producción
runs-on: ubuntu-latest
needs: molecule
if: github.event_name == 'push' &amp;&amp; github.ref == 'refs/heads/main'
environment: production   # entorno con approval manual

steps:
  - name: Checkout del repositorio
    uses: actions/checkout@v4

  - name: Configurar Python y Ansible
    uses: actions/setup-python@v5
    with:
      python-version: '3.12'
      cache: pip

  - name: Instalar Ansible y colecciones
    run: |
      pip install ansible
      ansible-galaxy collection install -r requirements.yml

  - name: Configurar clave SSH de producción
    run: |
      mkdir -p ~/.ssh
      echo "$PROD_SSH_KEY" > ~/.ssh/id_ed25519
      chmod 600 ~/.ssh/id_ed25519
      ssh-keyscan -H "$PROD_BASTION_HOST" >> ~/.ssh/known_hosts
    env:
      PROD_SSH_KEY: ${'$'}{{ secrets.PROD_SSH_KEY }}
      PROD_BASTION_HOST: ${'$'}{{ secrets.PROD_BASTION_HOST }}

  - name: Configurar Ansible Vault password
    run: |
      echo "$ANSIBLE_VAULT_PASSWORD" > ~/.vault_pass
      chmod 600 ~/.vault_pass
    env:
      ANSIBLE_VAULT_PASSWORD: ${'$'}{{ secrets.ANSIBLE_VAULT_PASSWORD }}

  - name: Deploy a producción
    run: |
      ansible-playbook site.yml \\
        -i inventory/production \\
        --diff \\
        --vault-password-file ~/.vault_pass
    env:
      ANSIBLE_HOST_KEY_CHECKING: 'false'
      ANSIBLE_STDOUT_CALLBACK: yaml

  - name: Limpiar secretos
    if: always()
    run: rm -f ~/.vault_pass ~/.ssh/id_ed25519</code></pre>
      </div>
    `,
  },
  {
    title: 'Workflow completo: ansible-ci.yml',
    body: `
      <p>El archivo completo en un solo bloque para copiar directamente al repositorio.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/ansible-ci.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
name: Ansible CI/CD

on:
  pull_request:
branches: [main]
paths: ['**.yml', '**.yaml', '**.j2', 'requirements.yml']
  push:
branches: [main]

env:
  PYTHON_VERSION: '3.12'

jobs:
  lint:
name: Lint
runs-on: ubuntu-latest
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-python@v5
    with:
      python-version: '3.12'
      cache: pip
  - run: pip install ansible-lint yamllint
  - run: |
      if [ -f requirements.yml ]; then
        ansible-galaxy collection install -r requirements.yml
      fi
  - run: yamllint .
  - run: ansible-lint

  molecule:
name: Molecule Tests
runs-on: ubuntu-latest
needs: lint
strategy:
  matrix:
    role: [nginx, postgresql, hardening]
  fail-fast: false
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-python@v5
    with:
      python-version: '3.12'
      cache: pip
  - run: pip install molecule molecule-docker ansible
  - run: molecule test
    working-directory: roles/nginx
    env:
      PY_COLORS: '1'
      ANSIBLE_FORCE_COLOR: '1'

  staging-check:
name: Staging Dry-Run
runs-on: ubuntu-latest
needs: molecule
if: github.event_name == 'pull_request'
environment: staging
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-python@v5
    with:
      python-version: '3.12'
      cache: pip
  - run: pip install ansible
  - run: ansible-galaxy collection install -r requirements.yml
  - run: |
      mkdir -p ~/.ssh
      echo "$STAGING_SSH_KEY" > ~/.ssh/id_ed25519
      chmod 600 ~/.ssh/id_ed25519
      ssh-keyscan -H "$STAGING_HOST" >> ~/.ssh/known_hosts
      echo "$ANSIBLE_VAULT_PASSWORD" > ~/.vault_pass
      chmod 600 ~/.vault_pass
    env:
      STAGING_SSH_KEY: ${'$'}{{ secrets.STAGING_SSH_KEY }}
      STAGING_HOST: ${'$'}{{ secrets.STAGING_HOST }}
      ANSIBLE_VAULT_PASSWORD: ${'$'}{{ secrets.ANSIBLE_VAULT_PASSWORD }}
  - run: |
      ansible-playbook site.yml \\
        -i inventory/staging \\
        --check --diff \\
        --vault-password-file ~/.vault_pass
    env:
      ANSIBLE_HOST_KEY_CHECKING: 'false'

  deploy:
name: Deploy a Producción
runs-on: ubuntu-latest
needs: molecule
if: github.event_name == 'push' &amp;&amp; github.ref == 'refs/heads/main'
environment: production
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-python@v5
    with:
      python-version: '3.12'
      cache: pip
  - run: pip install ansible
  - run: ansible-galaxy collection install -r requirements.yml
  - run: |
      mkdir -p ~/.ssh
      echo "$PROD_SSH_KEY" > ~/.ssh/id_ed25519
      chmod 600 ~/.ssh/id_ed25519
      ssh-keyscan -H "$PROD_BASTION_HOST" >> ~/.ssh/known_hosts
      echo "$ANSIBLE_VAULT_PASSWORD" > ~/.vault_pass
      chmod 600 ~/.vault_pass
    env:
      PROD_SSH_KEY: ${'$'}{{ secrets.PROD_SSH_KEY }}
      PROD_BASTION_HOST: ${'$'}{{ secrets.PROD_BASTION_HOST }}
      ANSIBLE_VAULT_PASSWORD: ${'$'}{{ secrets.ANSIBLE_VAULT_PASSWORD }}
  - run: |
      ansible-playbook site.yml \\
        -i inventory/production \\
        --diff \\
        --vault-password-file ~/.vault_pass
    env:
      ANSIBLE_HOST_KEY_CHECKING: 'false'
  - name: Limpiar secretos
    if: always()
    run: rm -f ~/.vault_pass ~/.ssh/id_ed25519</code></pre>
      </div>
    `,
  },
  {
    title: 'Gestión segura de secretos con GitHub Secrets',
    body: `
      <p>El Ansible Vault password es el secreto más crítico del pipeline. El patrón correcto lo mantiene fuera del repositorio y lo expone solo como variable de entorno en el runner.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">configurar-secrets.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Usar GitHub CLI para agregar secretos (recomendado)
gh secret set ANSIBLE_VAULT_PASSWORD --body "$(cat .vault_pass)"
gh secret set STAGING_SSH_KEY --body "$(cat ~/.ssh/id_ed25519_staging)"
gh secret set PROD_SSH_KEY --body "$(cat ~/.ssh/id_ed25519_prod)"
gh secret set STAGING_HOST --body "10.0.1.50"
gh secret set PROD_BASTION_HOST --body "bastion.empresa.com"

# Ver los secretos configurados (sin mostrar valores)
gh secret list</code></pre>
      </div>
      <div class="highlight-box">
        <p><strong>Reglas de seguridad para secretos en CI/CD:</strong></p>
        <ul>
          <li>Nunca escribas el Vault password en archivos del repositorio</li>
          <li>Usá SSH keys dedicadas para CI (sin passphrase, permisos mínimos)</li>
          <li>Rotá las claves de CI periódicamente (cada 90 días)</li>
          <li>Usá GitHub Environments protegidos para production: require approval</li>
          <li>Limpiá siempre los archivos temporales con <code>if: always()</code> para que corran incluso si el playbook falla</li>
        </ul>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Nunca uses</strong> el Vault password directamente en el argumento <code>--vault-password</code> — quedaría visible en los logs. Siempre usá variables de entorno y escríbilo a un archivo temporal con <code>--vault-password-file</code>.</div>
      </div>
    `,
  }
];
