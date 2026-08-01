import type { StepContent } from '../types';

export const nivel21Mod1StepsA: StepContent[] = [
  {
    title: 'Estructura de directorios de producción',
    body: `
      <p>Un proyecto Ansible empresarial separa claramente inventario, roles, variables por entorno, playbooks y pipelines. Esta separación permite que distintos equipos trabajen en paralelo sin pisarse, y facilita promover cambios de staging a producción de forma segura.</p>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>La estructura de un proyecto Ansible bien organizado es como el plano de un edificio: los roles son las habitaciones (cada una con su propósito), el inventario es el mapa de las plantas, las group_vars son las especificaciones por piso, y los playbooks son las instrucciones de trabajo para el equipo de construcción. Sin un plano claro, el edificio crece de forma caótica.</p>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">bash</span><span class="code-block-filename">estructura-proyecto-completo.sh</span></div>
        <pre class="language-bash"><code class="language-bash">proyecto-infraestructura/
├── ansible.cfg                        # Configuración global del proyecto
├── requirements.yml                   # Collections y roles de Galaxy
│
├── inventory/
│   ├── produccion/
│   │   ├── aws_ec2.yml                # Inventario dinámico AWS EC2
│   │   ├── group_vars/
│   │   │   ├── all/
│   │   │   │   ├── vars.yml           # Variables no sensibles (texto plano)
│   │   │   │   └── vault.yml          # Secretos cifrados (@vault-prod)
│   │   │   ├── servidores_web/
│   │   │   │   ├── vars.yml
│   │   │   │   └── vault.yml
│   │   │   └── bases_de_datos/
│   │   │       ├── vars.yml
│   │   │       └── vault.yml
│   │   └── host_vars/
│   │       └── db1.prod.empresa.com/
│   │           ├── vars.yml
│   │           └── vault.yml
│   │
│   └── staging/
│       ├── aws_ec2.yml                # Inventario dinámico (env=staging)
│       ├── group_vars/
│       │   └── all/
│       │       ├── vars.yml
│       │       └── vault.yml          # Secretos cifrados (@vault-staging)
│       └── host_vars/
│
├── roles/
│   ├── common/                        # Base: usuarios, SSH, NTP, swap
│   ├── servidor_web/                  # Nginx + app + certificados
│   ├── base_de_datos/                 # PostgreSQL + backups
│   ├── monitoreo/                     # node_exporter + alertmanager rules
│   ├── seguridad/                     # Hardening CIS, fail2ban, firewall
│   └── despliegue_app/                # Deploy de la aplicación
│
├── playbooks/
│   ├── site.yml                       # Playbook maestro (orquestador)
│   ├── webservers.yml                 # Solo servidores web
│   ├── databases.yml                  # Solo bases de datos
│   ├── hardening.yml                  # Solo hardening de seguridad
│   ├── deploy_app.yml                 # Solo despliegue de la aplicación
│   └── rolling_update.yml             # Rolling update de la aplicación
│
├── files/                             # Archivos estáticos compartidos
│   ├── sudoers.d/                     # Reglas sudo por equipo
│   └── logrotate.d/                   # Configuraciones de logrotate
│
├── templates/                         # Templates Jinja2 compartidos
│   └── motd.j2                        # Message of the Day
│
├── molecule/                          # Tests de integración con Molecule
│   ├── default/                       # Scenario por defecto
│   └── production-like/               # Scenario que simula producción
│
├── .github/
│   └── workflows/
│       ├── lint.yml                   # Linting en cada PR
│       ├── molecule.yml               # Tests Molecule en cada PR
│       └── deploy.yml                 # Deploy en merge a main
│
└── .vault_pass_scripts/               # Scripts para obtener vault passwords
├── vault-prod.sh                  # Obtiene password de AWS Secrets Manager
└── vault-staging.sh               # Obtiene password para staging</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">ini</span><span class="code-block-filename">ansible.cfg</span></div>
        <pre class="language-ini"><code class="language-ini">[defaults]
inventory             = inventory/produccion
roles_path            = roles
collections_paths     = ./collections:~/.ansible/collections
host_key_checking     = True              # En producción: siempre True
gathering             = smart
fact_caching          = jsonfile
fact_caching_connection = .cache/facts
fact_caching_timeout  = 3600             # 1 hora
stdout_callback       = yaml
callback_enabled      = timer, profile_tasks

# Vault con IDs por entorno
vault_identity_list   = prod@.vault_pass_scripts/vault-prod.sh, staging@.vault_pass_scripts/vault-staging.sh

[ssh_connection]
pipelining            = True
ssh_args              = -o ControlMaster=auto -o ControlPersist=60s -o StrictHostKeyChecking=yes
control_path_dir      = ~/.ansible/cp

[privilege_escalation]
become                = False            # No asumir escalada por defecto
become_method         = sudo</code></pre>
      </div>
      <div class="tech-term-box">
        <span class="box-icon">📖</span>
        <div class="box-content"><strong>Vault IDs por entorno:</strong> La opción <code>vault_identity_list</code> permite tener passwords distintos para producción y staging. Un secreto cifrado con <code>--vault-id prod@...</code> solo puede descifrarse con el script/password correcto para producción. Esto evita usar el mismo secreto en ambos entornos.</div>
      </div>
    `
  }
];
