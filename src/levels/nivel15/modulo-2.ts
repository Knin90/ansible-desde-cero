import type { ModuleContent } from '../types';

export const nivel15Mod2: ModuleContent =   {
levelId: 15,
moduleId: 2,
title: 'Vault IDs y múltiples vaults',
objective: 'Gestionar múltiples contraseñas de vault para distintos entornos usando Vault IDs, y automatizar la obtención de contraseñas desde secret managers externos.',
duration: '2 horas',
objectives: [
  'Entender cuándo y por qué usar múltiples contraseñas de vault',
  'Crear y gestionar archivos vault con IDs etiquetados (dev, staging, prod)',
  'Ejecutar playbooks con múltiples vault IDs simultáneamente',
  'Escribir scripts de vault password que consultan secret managers externos',
],
prerequisites: [
  'Completado el Módulo 1 de Nivel 15',
  'Conceptos básicos de AES-256 y cómo funciona Vault',
],
steps: [
  {
    title: '¿Por qué múltiples vault IDs? El problema de entornos',
    body: `
      <p>Una empresa típica tiene al menos tres entornos: desarrollo, staging y producción. Cada entorno tiene sus propios secretos: diferentes contraseñas de BD, diferentes tokens de API. Pero ¿todos deben estar protegidos con la misma contraseña de vault?</p>
      <div class="highlight-box">
        <div class="box-content">
          <strong>El problema con un solo vault password:</strong><br>
          • Un desarrollador junior puede acceder a los secretos de producción<br>
          • Si la contraseña se filtra, todos los entornos quedan expuestos<br>
          • Rotar la contraseña requiere re-encriptar TODOS los archivos<br><br>
          <strong>La solución con múltiples vault IDs:</strong><br>
          • Cada entorno tiene su propia contraseña de vault<br>
          • Un desarrollador puede tener la contraseña de dev pero no la de prod<br>
          • Rotar la contraseña de producción no afecta a dev ni staging
        </div>
      </div>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Pensá en los vault IDs como llaves físicas numeradas en un hotel. La llave de la habitación 101 (dev) solo abre la 101. La llave maestra (prod) abre todo. Un empleado de limpieza tiene la llave 101, pero solo el gerente tiene la llave maestra. Los vault IDs funcionan igual: cada label corresponde a una llave diferente.</p>
      </div>
    `
  },
  {
    title: 'Crear y usar Vault IDs',
    body: `
      <p>Un vault ID tiene el formato <code>label@source</code> donde el label es un nombre identificador y source es dónde obtener la contraseña (prompt, archivo, o script).</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">vault-ids.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Crear archivos vault con IDs etiquetados por entorno
# Formato: --vault-id LABEL@SOURCE

# dev: contraseña interactiva (desarrolladores la conocen)
ansible-vault create --vault-id dev@prompt group_vars/dev/vault.yml

# staging: contraseña desde archivo (CI/CD de staging la tiene)
ansible-vault create --vault-id staging@~/.vault_pass_staging group_vars/staging/vault.yml

# prod: contraseña desde script que consulta AWS Secrets Manager
ansible-vault create --vault-id prod@scripts/get_prod_vault_pass.py group_vars/produccion/vault.yml

# Encriptar un string con un vault ID específico
ansible-vault encrypt_string 'prod-db-pass-2024' \
  --vault-id prod@prompt \
  --name 'vault_db_password'

# Ver el header del archivo encriptado — incluye el label
ansible-vault view --vault-id dev@prompt group_vars/dev/vault.yml</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">header-vault.txt</span></div>
        <pre class="language-bash"><code class="language-bash"># El archivo encriptado con vault ID guarda el label en el header:
# $ANSIBLE_VAULT;1.2;AES256;dev       ← "dev" es el label
# (comparado con vault sin label:)
# $ANSIBLE_VAULT;1.1;AES256           ← sin label</code></pre>
      </div>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>Vault format 1.1 vs 1.2:</strong> El formato 1.1 (sin vault ID) es el original. El formato 1.2 incluye el label del vault ID en el header. Ansible puede leer ambos formatos. Cuando usás --vault-id, Ansible automáticamente usa el formato 1.2 y guarda el label en el header para saber qué contraseña usar al descifrar.</div>
      </div>
    `
  },
  {
    title: 'Ejecutar playbooks con múltiples vault IDs',
    body: `
      <p>Al ejecutar un playbook con archivos de distintos entornos (o con distintos vault IDs), podés proveer múltiples contraseñas en el mismo comando.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">multi-vault-run.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Ejecutar con múltiples vault IDs
# Ansible auto-detecta qué contraseña corresponde a cada archivo por el label del header
ansible-playbook site.yml \
  --vault-id dev@prompt \
  --vault-id staging@~/.vault_pass_staging \
  --vault-id prod@scripts/get_prod_vault_pass.py

# Para playbooks que solo tocan prod:
ansible-playbook -i inventory/produccion site.yml \
  --vault-id prod@~/.vault_pass_prod

# Combinación: vault legacy (sin label) + vault con ID
ansible-playbook site.yml \
  --vault-id default@~/.vault_pass \
  --vault-id prod@~/.vault_pass_prod</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Autodetección por label:</strong> Cuando Ansible encuentra un archivo con <code>$ANSIBLE_VAULT;1.2;AES256;prod</code>, busca el vault ID con label "prod" entre los provistos. Si lo encuentra, usa esa contraseña. Si no, prueba todas las contraseñas disponibles en orden. Esto permite que un playbook use archivos de distintos entornos sin configuración adicional.</div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">ansible.cfg — vault IDs por defecto</span></div>
        <pre class="language-yaml"><code class="language-yaml">[defaults]
# Configurar vault IDs por defecto para no escribirlos en cada comando
# Formato: label@source,label@source,...
vault_identity_list = dev@~/.vault_pass_dev,prod@scripts/get_prod_vault_pass.py</code></pre>
      </div>
    `
  },
  {
    title: 'Scripts de vault password — integración con secret managers',
    body: `
      <p>En entornos productivos, la contraseña del vault no debería vivir en un archivo en disco. Un script ejecutable puede obtenerla dinámicamente de AWS Secrets Manager, HashiCorp Vault, Azure Key Vault, u otro sistema.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">scripts/vault_pass_aws.py</span></div>
        <pre class="language-python"><code class="language-python">#!/usr/bin/env python3
"""
Script de vault password: obtiene la contraseña desde AWS Secrets Manager.
Ansible lo ejecuta y lee la contraseña de stdout.
El script debe retornar exit code 0 en éxito y != 0 en error.
"""
import boto3
import sys
import json

def get_vault_password():
try:
    client = boto3.client('secretsmanager', region_name='us-east-1')
    response = client.get_secret_value(SecretId='ansible/vault-prod-password')

    # Si el secret es un JSON, extraer el campo
    secret = json.loads(response['SecretString'])
    print(secret['vault_password'], end='')  # sin newline al final

except Exception as e:
    print(f"Error obteniendo vault password: {e}", file=sys.stderr)
    sys.exit(1)

if __name__ == '__main__':
get_vault_password()</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">scripts/vault_pass_hashi.sh</span></div>
        <pre class="language-bash"><code class="language-bash">#!/bin/bash
# Script de vault password usando HashiCorp Vault
# Requiere: vault CLI autenticado, VAULT_ADDR configurado

set -e

# Obtener el secreto de HashiCorp Vault
vault kv get -field=ansible_vault_password secret/ansible/vault

# El script imprime la contraseña a stdout y sale con 0
# Si falla, vault CLI retorna != 0 y Ansible aborta</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">usar-scripts.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Hacer los scripts ejecutables
chmod 750 scripts/vault_pass_aws.py
chmod 750 scripts/vault_pass_hashi.sh

# Usar el script como fuente de contraseña
ansible-playbook site.yml --vault-password-file scripts/vault_pass_aws.py

# Con vault ID
ansible-playbook site.yml --vault-id prod@scripts/vault_pass_aws.py

# Verificar que el script funciona correctamente (debe imprimir la contraseña)
python3 scripts/vault_pass_aws.py</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Permisos del script:</strong> El script debe tener permisos 750 (rwxr-x---) o 700 (rwx------). Si otros usuarios pueden escribirlo, podrían modificarlo para exfiltrar la contraseña. El script nunca debe loguear la contraseña — solo imprimirla a stdout una vez para que Ansible la capture.</div>
      </div>
      <div class="lab-box">
        <div class="lab-header">🔬 Laboratorio</div>
        <div class="lab-content">
          <p><strong>Objetivo:</strong> Simular múltiples entornos con distintos vault IDs.</p>
          <ol>
            <li>Creá dos archivos vault: <code>ansible-vault create --vault-id dev@prompt group_vars/dev/vault.yml</code> con <code>vault_db_password: dev-pass-123</code></li>
            <li>Creá otro: <code>ansible-vault create --vault-id prod@prompt group_vars/prod/vault.yml</code> con <code>vault_db_password: prod-pass-seguro</code> usando UNA CONTRASEÑA DIFERENTE</li>
            <li>Inspeccioná los headers con <code>head -2 group_vars/dev/vault.yml</code> — verificá que dicen <code>;dev</code> y <code>;prod</code></li>
            <li>Ejecutá un playbook que cargue ambos con <code>--vault-id dev@prompt --vault-id prod@prompt</code></li>
          </ol>
        </div>
      </div>
    `
  },
],
glossary: [
  {
    term: 'Vault ID',
    definition: 'Identificador etiquetado para una contraseña de vault, con formato label@source. El label (ej: dev, prod) se guarda en el header del archivo encriptado para que Ansible sepa qué contraseña usar al descifrar. Permite múltiples contraseñas para distintos entornos en el mismo proyecto.',
  },
  {
    term: 'vault_identity_list',
    definition: 'Configuración en ansible.cfg que define los vault IDs por defecto para todas las ejecuciones. Formato: label@source,label@source. Equivalente a pasar --vault-id en cada comando, pero configurado globalmente para el proyecto.',
  },
  {
    term: 'Script de vault password',
    definition: 'Script ejecutable que Ansible lanza para obtener la contraseña del vault dinámicamente. Debe imprimir la contraseña a stdout y retornar exit code 0. Permite integrar Ansible con secret managers externos (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault) sin tener la contraseña en disco.',
  },
  {
    term: 'Vault format 1.2',
    definition: 'Versión del formato de archivo encriptado de Ansible Vault que incluye el label del vault ID en el header. Generado automáticamente cuando se usa --vault-id. Permite a Ansible autodetectar qué contraseña usar para cada archivo cuando se proveen múltiples vault IDs.',
  },
],
quiz: [
  {
    question: '¿Cuál es el formato correcto de un vault ID en Ansible?',
    options: [
      'label:source',
      'label@source',
      'source/label',
      'label#source',
    ],
    correctIndex: 1,
    explanation: 'El formato es label@source, donde label es el nombre identificador (ej: dev, prod) y source es de dónde obtener la contraseña: prompt para pedirla interactivamente, un path a un archivo, o un path a un script ejecutable. Ejemplo: prod@~/.vault_pass_prod o dev@scripts/get_vault_pass.py.',
  },
  {
    question: '¿Qué ventaja tiene usar múltiples vault IDs en comparación con un único vault password?',
    options: [
      'Los archivos se encriptan más rápido con AES-256',
      'Diferentes entornos (dev/staging/prod) pueden tener contraseñas independientes, limitando el acceso',
      'Ansible puede paralelizar el descifrado de múltiples archivos',
      'El vault ID elimina la necesidad de especificar la contraseña al ejecutar playbooks',
    ],
    correctIndex: 1,
    explanation: 'Con múltiples vault IDs, cada entorno tiene su propia contraseña. Un desarrollador puede conocer la contraseña de dev pero no la de prod. Si la contraseña de un entorno se compromete, los otros entornos siguen seguros. Además, rotar la contraseña de producción solo requiere re-encriptar los archivos de producción, no todos los archivos del proyecto.',
  },
  {
    question: '¿Qué debe hacer un script de vault password para ser válido?',
    options: [
      'Escribir la contraseña en un archivo temporal y retornar su path',
      'Imprimir la contraseña a stdout y retornar exit code 0',
      'Enviar la contraseña vía HTTP a Ansible en el puerto 8080',
      'Escribir la contraseña a stderr para mayor seguridad',
    ],
    correctIndex: 1,
    explanation: 'Ansible ejecuta el script y captura su stdout. El script debe imprimir la contraseña a stdout (sin newline extra al final con print(..., end="")) y retornar exit code 0. Si retorna un exit code distinto de 0, Ansible interpreta que hubo un error y aborta. Cualquier mensaje de error debe ir a stderr, no a stdout.',
  },
],
troubleshooting: [
  {
    error: "ERROR! The vault password script ... returned a non-zero exit code",
    cause: 'El script de vault password falló — puede ser por falta de credenciales AWS, el secret manager no está disponible, o un error de Python/bash en el script.',
    fix: 'Ejecutá el script manualmente para ver el error: python3 scripts/vault_pass.py. Verificá que las credenciales del secret manager estén configuradas (AWS_ACCESS_KEY_ID, VAULT_TOKEN, etc.). Revisá que el script retorne 0 en éxito y que imprima SOLO la contraseña a stdout (los logs de debug deben ir a stderr).',
  },
  {
    error: "ERROR! Attempting to decrypt but no vault secrets found",
    cause: 'El archivo fue encriptado con un vault ID (formato 1.2 con label), pero al ejecutar el playbook no se proveyó ese vault ID — se usó --ask-vault-pass o --vault-password-file sin especificar el label.',
    fix: 'Usá el vault ID correcto: --vault-id prod@prompt en lugar de --ask-vault-pass. Verificá el label del archivo con head -1 vault.yml — si dice $ANSIBLE_VAULT;1.2;AES256;prod, necesitás --vault-id prod@source.',
  },
  {
    error: "vault_identity_list not matching any vault files in the playbook",
    cause: 'La configuración vault_identity_list en ansible.cfg tiene labels que no coinciden con los headers de los archivos encriptados, o los archivos fueron encriptados sin vault ID (formato 1.1).',
    fix: 'Verificá los headers de los archivos vault con head -1 group_vars/*/vault.yml. Los archivos en formato 1.1 (sin label) se pueden descifrar con cualquier contraseña correcta. Para migrar a formato 1.2 con label, usá ansible-vault rekey --vault-id nuevo_label@prompt archivo.yml.',
  },
],
  };
