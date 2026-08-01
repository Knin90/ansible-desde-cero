import type { StepContent } from '../types';

export const nivel21Mod3StepsB: StepContent[] = [
  {
    title: 'Pipeline de deploy: staging automático y producción con aprobación',
    body: `
      <p>El pipeline de deploy tiene dos fases: staging se despliega automáticamente en cada merge a <code>main</code>, y producción requiere aprobación manual explícita. GitHub Environments gestiona esto de forma nativa.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/deploy.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
name: Deploy de Infraestructura

on:
  push:
branches: [main]      # Solo en merge a main
  workflow_dispatch:       # Permite ejecutar manualmente desde GitHub UI
inputs:
  target_env:
    description: 'Entorno objetivo'
    required: true
    default: staging
    type: choice
    options:
      - staging
      - produccion
  limit:
    description: 'Límite de hosts (dejar vacío para todos)'
    required: false
    type: string
  tags:
    description: 'Tags de Ansible (ej: app,nginx)'
    required: false
    type: string

jobs:
  deploy-staging:
name: Deploy a Staging
runs-on: ubuntu-latest
environment: staging   # Ambiente de GitHub (sin aprobación requerida)

steps:
  - name: Checkout del código
    uses: actions/checkout@v4

  - name: Instalar Python y Ansible
    run: |
      pip install ansible boto3 botocore

  - name: Instalar collections y roles
    run: ansible-galaxy install -r requirements.yml

  - name: Configurar credenciales AWS
    uses: aws-actions/configure-aws-credentials@v4
    with:
      aws-access-key-id: ${'$'}{{ secrets.AWS_ACCESS_KEY_ID_STAGING }}
      aws-secret-access-key: ${'$'}{{ secrets.AWS_SECRET_ACCESS_KEY_STAGING }}
      aws-region: us-east-1

  - name: Configurar clave SSH
    run: |
      mkdir -p ~/.ssh
      echo "${'$'}{{ secrets.SSH_PRIVATE_KEY_STAGING }}" > ~/.ssh/id_rsa
      chmod 600 ~/.ssh/id_rsa
      # Agregar hosts conocidos para evitar prompt interactivo
      ssh-keyscan -H staging.empresa.com >> ~/.ssh/known_hosts

  - name: Crear archivo de vault password
    run: |
      echo "${'$'}{{ secrets.VAULT_PASSWORD_STAGING }}" > /tmp/vault_pass_staging
      chmod 600 /tmp/vault_pass_staging

  - name: Deploy a Staging
    env:
      ANSIBLE_HOST_KEY_CHECKING: "False"
    run: |
      LIMIT="${'$'}{{ github.event.inputs.limit }}"
      TAGS="${'$'}{{ github.event.inputs.tags }}"

      CMD="ansible-playbook playbooks/site.yml"
      CMD="$CMD -i inventory/staging/"
      CMD="$CMD --vault-id staging@/tmp/vault_pass_staging"
      [ -n "$LIMIT" ] && CMD="$CMD --limit $LIMIT"
      [ -n "$TAGS" ]  && CMD="$CMD --tags $TAGS"

      echo "Ejecutando: $CMD"
      eval $CMD

  - name: Notificar resultado en Slack
    if: always()   # Ejecutar aunque el deploy falle
    uses: slackapi/slack-github-action@v1
    with:
      payload: |
        {
          "text": "${'$'}{{ job.status == 'success' && ':white_check_mark:' || ':x:' }} Deploy a STAGING: ${'$'}{{ job.status }}",
          "blocks": [{
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Deploy a Staging*: ${'$'}{{ job.status }}\nCommit: \`${'$'}{{ github.sha }}\`\nActor: ${'$'}{{ github.actor }}"
            }
          }]
        }
    env:
      SLACK_WEBHOOK_URL: ${'$'}{{ secrets.SLACK_WEBHOOK_URL }}

  deploy-produccion:
name: Deploy a Producción
runs-on: ubuntu-latest
needs: deploy-staging    # Solo después de que staging sea exitoso
environment: produccion  # Environment con aprobación manual requerida en GitHub

steps:
  - name: Checkout del código
    uses: actions/checkout@v4

  - name: Instalar Python y Ansible
    run: pip install ansible boto3 botocore

  - name: Instalar collections y roles
    run: ansible-galaxy install -r requirements.yml

  - name: Configurar credenciales AWS Producción
    uses: aws-actions/configure-aws-credentials@v4
    with:
      aws-access-key-id: ${'$'}{{ secrets.AWS_ACCESS_KEY_ID_PROD }}
      aws-secret-access-key: ${'$'}{{ secrets.AWS_SECRET_ACCESS_KEY_PROD }}
      aws-region: us-east-1

  - name: Configurar clave SSH de producción
    run: |
      mkdir -p ~/.ssh
      echo "${'$'}{{ secrets.SSH_PRIVATE_KEY_PROD }}" > ~/.ssh/id_rsa
      chmod 600 ~/.ssh/id_rsa

  - name: Crear archivo de vault password de producción
    run: |
      echo "${'$'}{{ secrets.VAULT_PASSWORD_PROD }}" > /tmp/vault_pass_prod
      chmod 600 /tmp/vault_pass_prod

  - name: Deploy a Producción (rolling update)
    env:
      ANSIBLE_HOST_KEY_CHECKING: "True"
    run: |
      ansible-playbook playbooks/site.yml \
        -i inventory/produccion/ \
        --vault-id prod@/tmp/vault_pass_prod \
        --diff

  - name: Registrar deploy en sistema de auditoria
    if: success()
    run: |
      curl -X POST "${'$'}{{ secrets.AUDIT_WEBHOOK_URL }}" \
        -H "Content-Type: application/json" \
        -d '{
          "event": "deploy",
          "environment": "produccion",
          "commit": "${'$'}{{ github.sha }}",
          "actor": "${'$'}{{ github.actor }}",
          "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
        }'

  - name: Notificar deploy a Slack
    if: always()
    uses: slackapi/slack-github-action@v1
    with:
      payload: |
        {
          "text": "${'$'}{{ job.status == 'success' && ':white_check_mark:' || ':x:' }} Deploy a PRODUCCIÓN: ${'$'}{{ job.status }}",
          "blocks": [{
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Deploy a Producción*: *${'$'}{{ job.status }}*\nCommit: \`${'$'}{{ github.sha }}\`\nAprobado por: ${'$'}{{ github.actor }}"
            }
          }]
        }
    env:
      SLACK_WEBHOOK_URL: ${'$'}{{ secrets.SLACK_WEBHOOK_URL }}</code></pre>
      </div>
      <div class="highlight-box">
        <div class="box-content">
          <strong>Cómo configurar la aprobación manual en GitHub:</strong><br>
          1. Ir a Settings → Environments → New environment → nombrar "produccion"<br>
          2. Activar "Required reviewers" y agregar el equipo de ops<br>
          3. Opcionalmente: "Wait timer" (ej: 5 minutos) para dar tiempo a cancelar<br>
          4. Opcionalmente: "Deployment branches" → only main branch<br>
          Cuando el job "deploy-produccion" esté listo, GitHub pausa y envía un email a los reviewers. El deploy no continúa hasta que alguien apruebe.
        </div>
      </div>
    `
  },
  {
    title: 'Gestión de secretos en CI: AWS Secrets Manager como vault password source',
    body: `
      <p>Guardar el vault password directamente en GitHub Secrets es simple pero tiene limitaciones: rotación manual, sin auditoría de acceso, y es todo-o-nada. Una práctica más robusta es usar un servicio de secretos como AWS Secrets Manager o HashiCorp Vault como fuente del vault password.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">.vault_pass_scripts/vault-prod.sh</span></div>
        <pre class="language-bash"><code class="language-bash">#!/bin/bash
# Script que obtiene el vault password de AWS Secrets Manager
# Ansible lo llama con: --vault-id prod@.vault_pass_scripts/vault-prod.sh

set -euo pipefail

SECRET_NAME="${'$'}{ANSIBLE_VAULT_SECRET_NAME:-ansible-vault-password-prod}"
AWS_REGION="${'$'}{AWS_DEFAULT_REGION:-us-east-1}"

# Obtener el secreto de AWS Secrets Manager
# Requiere: aws CLI configurado con permisos secretsmanager:GetSecretValue
aws secretsmanager get-secret-value \
--secret-id "$SECRET_NAME" \
--region "$AWS_REGION" \
--query SecretString \
--output text</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">.vault_pass_scripts/vault-hcp.sh (HashiCorp Vault)</span></div>
        <pre class="language-bash"><code class="language-bash">#!/bin/bash
# Alternativa: obtener vault password desde HashiCorp Vault

set -euo pipefail

VAULT_ADDR="${'$'}{VAULT_ADDR:-https://vault.empresa.com}"
VAULT_PATH="${'$'}{VAULT_PATH:-secret/data/ansible/vault-password-prod}"

# Autenticarse con el token de la CI (GitHub OIDC o AppRole)
vault kv get -field=password "$VAULT_PATH"</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">.github/workflows/deploy-con-aws-secretsmanager.yml (fragmento)</span></div>
        <pre class="language-yaml"><code class="language-yaml">      # Mejor práctica: usar OIDC para autenticación sin credenciales estáticas
  - name: Asumir role IAM via OIDC (sin credenciales en GitHub Secrets)
    uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123456789:role/github-actions-deploy-prod
      aws-region: us-east-1
      # GitHub Actions presenta un token OIDC que AWS valida
      # No necesitás guardar ACCESS_KEY_ID ni SECRET_ACCESS_KEY

  - name: Deploy (vault password viene de AWS Secrets Manager)
    run: |
      ansible-playbook playbooks/site.yml \
        -i inventory/produccion/ \
        --vault-id prod@.vault_pass_scripts/vault-prod.sh
      # El script vault-prod.sh llama a AWS Secrets Manager
      # usando el rol IAM asumido en el paso anterior</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>OIDC vs credenciales estáticas:</strong> Con GitHub OIDC (el parámetro role-to-assume), GitHub Actions puede asumir un role IAM sin necesitar Access Key ni Secret Key. El token JWT que genera GitHub se intercambia directamente por credenciales temporales de AWS. Esto elimina el secreto más crítico de tu pipeline: las credenciales AWS de larga duración.</div>
      </div>
    `
  }
];
