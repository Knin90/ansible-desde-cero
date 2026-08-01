import type { StepContent } from '../types';

export const nivel18Mod3StepsA: StepContent[] = [
  {
    title: 'Ansible y cloud: IaC vs. ClickOps',
    body: `
      <p><strong>ClickOps</strong> es el antipatrón de gestionar infraestructura cloud manualmente desde la consola web: hacer clic, configurar, esperar. Es lento, no reproducible y propenso a errores humanos.</p>
      <div class="highlight-box">
        <p><strong>IaC (Infrastructure as Code)</strong> describe la infraestructura en código versionado, revisable y automatizable. Ansible, Terraform y CloudFormation son herramientas de IaC. El código vive en git, los cambios se revisan en pull requests, y los entornos son reproducibles.</p>
      </div>
      <p>¿Cuándo usar Ansible para cloud en lugar de Terraform?</p>
      <table class="comparison-table">
        <tr><th>Ansible para cloud</th><th>Terraform para cloud</th></tr>
        <tr><td>Provisionás infraestructura Y configurás el SO en el mismo pipeline</td><td>Infraestructura pura, sin gestión de configuración</td></tr>
        <tr><td>Integración nativa con roles de configuración existentes</td><td>State management con tfstate — más robusto para IaC a gran escala</td></tr>
        <tr><td>Sin estado local que gestionar (stateless)</td><td>Requiere gestionar el tfstate (backend remoto)</td></tr>
        <tr><td>Ideal para equipos que ya usan Ansible para todo</td><td>Ideal cuando el equipo es dedicado a infraestructura cloud</td></tr>
      </table>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>El patrón mixto más común:</strong> Terraform gestiona la infraestructura base (VPCs, subnets, grupos de seguridad) y Ansible configura las VMs una vez aprovisionadas. Cada herramienta en lo que mejor hace.</div>
      </div>
    `,
  },
  {
    title: 'AWS con amazon.aws: EC2, S3, RDS e IAM',
    body: `
      <p>La colección <code>amazon.aws</code> cubre los servicios core de AWS. Para servicios adicionales está <code>community.aws</code>.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">setup-aws.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Instalar colección
ansible-galaxy collection install amazon.aws

# Dependencia Python
pip install boto3 botocore

# Configurar credenciales AWS (en el control node)
aws configure
# O mediante variables de entorno:
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_DEFAULT_REGION="us-east-1"</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">aws-resources.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Provisionar recursos AWS
  hosts: localhost
  connection: local
  gather_facts: false
  vars:
region: us-east-1
instance_type: t3.medium
ami_id: ami-0c55b159cbfafe1f0   # Amazon Linux 2023

  tasks:

# EC2 Instance
- name: Lanzar instancia EC2
  amazon.aws.ec2_instance:
    name: "web-server-{{ deploy_env }}"
    key_name: mi-keypair
    instance_type: "{{ instance_type }}"
    image_id: "{{ ami_id }}"
    region: "{{ region }}"
    security_group: web-sg
    vpc_subnet_id: subnet-abc123
    tags:
      Environment: "{{ deploy_env }}"
      ManagedBy: ansible
    wait: true
    state: running
  register: ec2_result

# S3 Bucket
- name: Crear bucket S3 para assets
  amazon.aws.s3_bucket:
    name: "mycompany-assets-{{ deploy_env }}"
    region: "{{ region }}"
    versioning: true
    encryption: aws:kms
    tags:
      Environment: "{{ deploy_env }}"
    state: present

# RDS Instance
- name: Crear base de datos RDS
  amazon.aws.rds_instance:
    db_instance_identifier: "myapp-db-{{ deploy_env }}"
    db_instance_class: db.t3.medium
    engine: postgres
    engine_version: "16.1"
    master_username: admin
    master_user_password: "{{ db_password }}"   # desde Vault
    allocated_storage: 20
    db_subnet_group_name: my-subnet-group
    vpc_security_group_ids:
      - sg-rds123
    tags:
      Environment: "{{ deploy_env }}"
    state: present

# IAM User para la aplicación
- name: Crear usuario IAM para la app
  amazon.aws.iam_user:
    name: "myapp-{{ deploy_env }}"
    state: present
    tags:
      ManagedBy: ansible</code></pre>
      </div>
    `,
  },
  {
    title: 'Inventario dinámico con aws_ec2',
    body: `
      <p>El inventario dinámico es uno de los features más poderosos de Ansible para cloud. En lugar de mantener un archivo de inventario estático con IPs, Ansible pregunta a AWS cuáles instancias existen en tiempo real.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">inventory/aws_ec2.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
plugin: amazon.aws.aws_ec2
regions:
  - us-east-1
  - us-west-2

# Filtrar solo instancias running con nuestros tags
filters:
  instance-state-name: running
  tag:ManagedBy: ansible

# Agrupar instancias por tag
keyed_groups:
  - key: tags.Environment
prefix: env
  - key: tags.Role
prefix: role
  - key: instance_type
prefix: type

# Usar el DNS privado como hostname (dentro de VPC)
hostnames:
  - private-dns-name

# Variables disponibles para cada host
compose:
  ansible_host: private_ip_address
  ansible_user: "'ec2-user'"</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">usar-inventario-dinamico.sh</span></div>
        <pre class="language-bash"><code class="language-bash"># Ver qué hosts descubre el plugin
ansible-inventory -i inventory/aws_ec2.yml --list

# Ver el árbol de grupos
ansible-inventory -i inventory/aws_ec2.yml --graph

# Ejecutar playbook contra instancias del ambiente prod
ansible-playbook -i inventory/aws_ec2.yml site.yml --limit env_production

# Ejecutar solo en instancias de tipo web
ansible-playbook -i inventory/aws_ec2.yml configure-web.yml --limit role_web</code></pre>
      </div>
      <div class="highlight-box">
        <p><strong>Cero mantenimiento del inventario:</strong> cuando lanzás una nueva instancia con el tag correcto, aparece automáticamente en el inventario. Cuando la terminás, desaparece. Sin archivos de inventario que sincronizar manualmente.</p>
      </div>
    `,
  }
];
