import type { StepContent } from '../types';

export const nivel17Mod4StepsA: StepContent[] = [
  {
    title: 'Por qué CI/CD para Ansible',
    body: `
      <p>Sin CI/CD, cada miembro del equipo ejecuta los tests localmente (o no los ejecuta). Los errores llegan a producción. La calidad depende de la disciplina individual, no del proceso.</p>
      <div class="highlight-box">
        <p><strong>CI/CD convierte el testing en una compuerta institucional:</strong> ningún cambio puede mergearse si no pasa lint, Molecule tests y el dry-run en staging. La calidad es sistémica, no individual.</p>
      </div>
      <p>Un pipeline completo de Ansible en GitHub Actions hace:</p>
      <ul>
        <li><strong>En cada PR:</strong> lint (ansible-lint + yamllint) y Molecule tests</li>
        <li><strong>Antes del merge:</strong> <code>ansible-playbook --check</code> en staging como gate</li>
        <li><strong>Tras merge a main:</strong> deployment real a producción con notificación</li>
      </ul>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Pensá en el pipeline como una línea de ensamblaje con estaciones de control de calidad. El código entra por un extremo (PR), pasa por cada estación (lint → tests → staging check), y solo llega a producción si supera todas las compuertas.</p>
      </div>
      <div class="tech-term-box">
        <div class="tech-term-label">En términos técnicos</div>
        GitHub Actions es una plataforma de CI/CD integrada en GitHub. Los workflows se definen en archivos YAML bajo <code>.github/workflows/</code>. Cada workflow tiene jobs que corren en runners (VMs o contenedores) y steps que ejecutan comandos o acciones.
      </div>
    `,
  },
  {
    title: 'Estructura del workflow de GitHub Actions',
    body: `
      <p>Un workflow de Ansible CI/CD tiene cuatro jobs principales que se ejecutan en secuencia o en paralelo según las dependencias.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/ansible-ci.yml (estructura)</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
name: Ansible CI/CD

on:
  pull_request:
branches: [main]
paths:
  - '**.yml'
  - '**.yaml'
  - '**.j2'
  - 'requirements.yml'
  push:
branches: [main]

env:
  PYTHON_VERSION: '3.12'

jobs:
  lint:          # Job 1: análisis estático (PR + push)
...

  molecule:      # Job 2: tests de roles (PR + push)
needs: lint
...

  staging-check: # Job 3: dry-run en staging (PR only)
needs: molecule
if: github.event_name == 'pull_request'
...

  deploy:        # Job 4: deployment real (push to main only)
needs: molecule
if: github.event_name == 'push' &amp;&amp; github.ref == 'refs/heads/main'
...</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content">El trigger <code>paths</code> evita correr el pipeline en PRs que solo cambian documentación o archivos Python. Esto reduce el tiempo de CI significativamente en proyectos grandes.</div>
      </div>
    `,
  },
  {
    title: 'Job lint: ansible-lint y yamllint en cada PR',
    body: `
      <p>El job de lint es el más rápido (~1-2 minutos) y debe correr primero. Falla rápido en problemas básicos antes de gastar tiempo en Molecule.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/ansible-ci.yml — job lint</span></div>
        <pre class="language-yaml"><code class="language-yaml">  lint:
name: Lint
runs-on: ubuntu-latest

steps:
  - name: Checkout del repositorio
    uses: actions/checkout@v4

  - name: Configurar Python
    uses: actions/setup-python@v5
    with:
      python-version: '3.12'
      cache: pip

  - name: Instalar dependencias de lint
    run: pip install ansible-lint yamllint

  - name: Instalar colecciones de Ansible
    run: |
      if [ -f requirements.yml ]; then
        ansible-galaxy collection install -r requirements.yml
      fi

  - name: Ejecutar yamllint
    run: yamllint .

  - name: Ejecutar ansible-lint
    run: ansible-lint
    env:
      ANSIBLE_ROLES_PATH: roles/</code></pre>
      </div>
      <div class="highlight-box">
        <p>El uso de <code>cache: pip</code> en setup-python hace que las instalaciones de pip se cacheen entre runs. En proyectos con muchas dependencias, esto puede reducir el tiempo de CI de 3 minutos a 30 segundos.</p>
      </div>
    `,
  },
  {
    title: 'Job molecule: tests en Docker runners',
    body: `
      <p>GitHub Actions ofrece runners Ubuntu con Docker preinstalado. Molecule funciona directamente sin configuración adicional del runner.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/ansible-ci.yml — job molecule</span></div>
        <pre class="language-yaml"><code class="language-yaml">  molecule:
name: Molecule Tests
runs-on: ubuntu-latest
needs: lint

strategy:
  matrix:
    role:
      - nginx
      - postgresql
      - hardening
  fail-fast: false  # continuar con otros roles si uno falla

steps:
  - name: Checkout del repositorio
    uses: actions/checkout@v4

  - name: Configurar Python
    uses: actions/setup-python@v5
    with:
      python-version: '3.12'
      cache: pip

  - name: Instalar dependencias de Molecule
    run: pip install molecule molecule-docker ansible

  - name: Instalar colecciones de Ansible
    run: |
      if [ -f requirements.yml ]; then
        ansible-galaxy collection install -r requirements.yml
      fi

  - name: Ejecutar Molecule para el rol
    run: molecule test
    working-directory: roles/nginx   # usar matrix.role en el workflow real
    env:
      PY_COLORS: '1'
      ANSIBLE_FORCE_COLOR: '1'</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content">La estrategia <code>matrix</code> corre Molecule en paralelo para cada rol. Con 3 roles, los tests corren simultáneamente en 3 jobs paralelos en lugar de secuencialmente, reduciendo el tiempo total a un tercio.</div>
      </div>
    `,
  }
];
