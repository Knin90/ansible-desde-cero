import type { StepContent } from '../types';

export const nivel21Mod3StepsA: StepContent[] = [
  {
    title: 'Pipeline de lint y validación en cada PR',
    body: `
      <p>El primer nivel del pipeline verifica que el código Ansible cumpla los estándares de calidad antes de que llegue a ningún entorno. Esto corre en cada Pull Request y es el filtro más rápido y barato.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/lint.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
name: Lint y Validación

on:
  pull_request:
branches: [main, develop]
  push:
branches: [main]

jobs:
  yamllint:
name: YAML Lint
runs-on: ubuntu-latest
steps:
  - name: Checkout del código
    uses: actions/checkout@v4

  - name: Instalar yamllint
    run: pip install yamllint

  - name: Validar YAML
    run: yamllint .

  ansible-lint:
name: Ansible Lint
runs-on: ubuntu-latest
steps:
  - name: Checkout del código
    uses: actions/checkout@v4

  - name: Instalar Ansible y ansible-lint
    run: pip install ansible ansible-lint

  - name: Instalar collections requeridas
    run: ansible-galaxy collection install -r requirements.yml

  - name: Ejecutar ansible-lint
    run: ansible-lint playbooks/site.yml --profile=production

  syntax-check:
name: Syntax Check
runs-on: ubuntu-latest
steps:
  - name: Checkout del código
    uses: actions/checkout@v4

  - name: Instalar Ansible
    run: pip install ansible

  - name: Instalar dependencias
    run: ansible-galaxy install -r requirements.yml

  - name: Syntax check del playbook maestro
    run: |
      ansible-playbook playbooks/site.yml \
        --syntax-check \
        -i inventory/staging/ \
        --vault-password-file /dev/null  # Fake password para syntax check

  molecule:
name: Molecule Tests (${'$'}{{ matrix.role }})
runs-on: ubuntu-latest
strategy:
  matrix:
    role: [common, servidor_web, seguridad]
  fail-fast: false    # Si un rol falla, seguir con los demás

steps:
  - name: Checkout del código
    uses: actions/checkout@v4

  - name: Instalar Python y dependencias
    run: |
      pip install ansible molecule molecule-plugins[docker] docker

  - name: Ejecutar Molecule para el role ${'$'}{{ matrix.role }}
    run: |
      cd roles/${'$'}{{ matrix.role }}
      molecule test</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.yamllint.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
extends: default

rules:
  line-length:
max: 120
level: warning      # Warning, no error
  truthy:
allowed-values:
  - 'true'
  - 'false'
  - 'yes'
  - 'no'
check-keys: false
  comments:
min-spaces-from-content: 1
  braces:
max-spaces-inside: 1</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>matrix.role para Molecule en paralelo:</strong> La estrategia de matrix ejecuta Molecule para cada role en paralelo. Con 3 roles, el tiempo total es el del role más lento, no la suma. Añadí fail-fast: false para que si un role falla, los demás sigan corriendo — así tenés el reporte completo de todos los roles en un solo run.</div>
      </div>
    `
  }
];
