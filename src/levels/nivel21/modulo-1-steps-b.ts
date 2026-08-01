import type { StepContent } from '../types';

export const nivel21Mod1StepsB: StepContent[] = [
  {
    title: 'Inventario dinámico: aws_ec2 y azure_rm',
    body: `
      <p>En entornos cloud, el inventario cambia constantemente: las instancias escalan, se destruyen y se crean. En lugar de mantener un inventario estático que siempre está desactualizado, se usa un inventory plugin dinámico que consulta el estado real de la nube en tiempo de ejecución.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">inventory/produccion/aws_ec2.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# Inventario dinámico de AWS EC2
# Requiere: pip install boto3 botocore
#           ansible-galaxy collection install amazon.aws

plugin: amazon.aws.aws_ec2

# Región(es) a consultar
regions:
  - us-east-1
  - us-west-2

# Filtrar solo instancias en estado "running"
filters:
  instance-state-name: running
  # Solo instancias con tag "Environment=produccion"
  "tag:Environment": produccion
  "tag:Project": mi-app

# Qué usar como nombre del host en el inventario
hostnames:
  - tag:Name           # Primero el tag Name
  - private-ip-address # Si no tiene tag Name, usar la IP privada

# Agrupar automáticamente por tags de AWS
keyed_groups:
  # Crea grupos como "tag_Role_webserver", "tag_Role_database", etc.
  - key: tags.Role
prefix: rol

  # Crea grupos como "tag_Environment_produccion"
  - key: tags.Environment
prefix: env

  # Crea grupos por tipo de instancia: "instance_type_t3_medium"
  - key: instance_type
prefix: instance_type

  # Crea grupos por región: "aws_region_us_east_1"
  - key: placement.region
prefix: aws_region

# Variables automáticas disponibles para cada host
compose:
  # Usar la IP privada para conectarse (no la pública)
  ansible_host: private_ip_address
  # Disponibilidad zone como variable
  aws_az: placement.availability_zone
  # Tags como variables individuales
  app_role: tags.Role | default('undefined')</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">verificar-inventario-dinamico.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Exportar credenciales AWS (o usar IAM role si corrés desde EC2/CI)
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_DEFAULT_REGION="us-east-1"

# Verificar que el inventario dinámico funciona
ansible-inventory -i inventory/produccion/ --list | python3 -m json.tool | head -50

# Ver los grupos disponibles
ansible-inventory -i inventory/produccion/ --list | python3 -c "
import json, sys
inv = json.load(sys.stdin)
print('Grupos disponibles:')
for group in sorted(inv.keys()):
if not group.startswith('_'):
    hosts = inv[group].get('hosts', [])
    print(f'  {group}: {len(hosts)} hosts')
"

# Ver los hosts y sus variables
ansible-inventory -i inventory/produccion/ --host web1.produccion

# Ejecutar un comando ad-hoc en un grupo dinámico
ansible -i inventory/produccion/ rol_webserver -m ansible.builtin.ping</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Cachear el inventario dinámico:</strong> En pipelines de CI con muchas ejecuciones paralelas, el inventario dinámico puede ser lento. Activá el caché con <code>cache: true</code> y <code>cache_timeout: 300</code> en aws_ec2.yml. Ansible guarda el resultado en <code>.cache/</code> y lo reutiliza durante 5 minutos.</div>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">inventory/produccion/azure_rm.yml (alternativa Azure)</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# Alternativa para Azure
# Requiere: pip install azure-identity azure-mgmt-compute
#           ansible-galaxy collection install azure.azcollection

plugin: azure.azcollection.azure_rm

# Resource groups a incluir
include_vm_resource_groups:
  - mi-rg-produccion
  - mi-rg-produccion-db

# Agrupar por tags
keyed_groups:
  - key: tags.Role
prefix: rol
  - key: tags.Environment
prefix: env

compose:
  ansible_host: private_ipv4_addresses[0]
  app_role: tags.Role</code></pre>
      </div>
    `
  },
  {
    title: 'Estrategia de tags y vault IDs por entorno',
    body: `
      <p>Una buena estrategia de tags permite hacer despliegues selectivos sin tener que mantener playbooks separados. Los vault IDs por entorno garantizan que los secretos de producción nunca se mezclan con los de staging.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">roles/servidor_web/tasks/main.yml (con tags)</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
# Estrategia de tags: base, security, app, monitoring
# Permite: --tags base,security para hardening sin instalar app

- name: Instalar paquetes base del sistema operativo
  ansible.builtin.apt:
name: "{{ item }}"
state: present
update_cache: true
  loop:
- curl
- wget
- htop
- vim
  tags:
- base
- packages

- name: Configurar reglas de firewall UFW
  community.general.ufw:
rule: allow
port: "{{ item }}"
proto: tcp
  loop:
- "22"
- "80"
- "443"
  tags:
- base
- security
- firewall

- name: Instalar y configurar Nginx
  ansible.builtin.apt:
name: nginx
state: present
  tags:
- app
- nginx

- name: Desplegar configuración de Nginx
  ansible.builtin.template:
src: nginx.conf.j2
dest: /etc/nginx/nginx.conf
mode: '0644'
validate: nginx -t -c %s
  notify: Recargar Nginx
  tags:
- app
- nginx
- config

- name: Configurar node_exporter para Prometheus
  ansible.builtin.include_role:
name: monitoreo
  tags:
- monitoring</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">despliegues-selectivos.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Solo hardening de seguridad (sin tocar la app)
ansible-playbook playbooks/site.yml --tags security

# Solo la app y su configuración
ansible-playbook playbooks/site.yml --tags app

# Todo excepto monitoring (para un deploy rápido)
ansible-playbook playbooks/site.yml --skip-tags monitoring

# Base + seguridad en un host específico (nuevo servidor)
ansible-playbook playbooks/site.yml \
--limit nuevo-servidor.empresa.com \
--tags base,security

# Configuración de Nginx en todos los webservers
ansible-playbook playbooks/webservers.yml \
--tags nginx,config \
--check --diff      # Dry run primero</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">vault-ids-por-entorno.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Cifrar un secreto para producción (con vault ID "prod")
ansible-vault encrypt_string 'mi-password-de-prod' \
--vault-id prod@.vault_pass_scripts/vault-prod.sh \
--stdin-name db_password

# Cifrar un secreto para staging (con vault ID "staging")
ansible-vault encrypt_string 'mi-password-de-staging' \
--vault-id staging@.vault_pass_scripts/vault-staging.sh \
--stdin-name db_password

# Cifrar un archivo vault completo para producción
ansible-vault encrypt inventory/produccion/group_vars/all/vault.yml \
--vault-id prod@.vault_pass_scripts/vault-prod.sh

# Al ejecutar el playbook, Ansible prueba ambos IDs automáticamente
# (configurado en ansible.cfg con vault_identity_list)
ansible-playbook playbooks/site.yml</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>Scripts de vault password en CI/CD:</strong> Los scripts <code>.vault_pass_scripts/vault-prod.sh</code> deben obtener el password de un servicio seguro (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault) — NUNCA hardcodearlo. El script imprime solo el password en stdout y termina. En el pipeline de CI, la variable de entorno con el acceso al servicio de secretos debe configurarse como secret en GitHub/GitLab.</div>
      </div>
    `
  }
];
