import type { ModuleContent } from '../types';
import { nivel18Mod3StepsA } from './modulo-3-steps-a';
import { nivel18Mod3StepsB } from './modulo-3-steps-b';

export const nivel18Mod3: ModuleContent =   {
levelId: 18,
moduleId: 3,
title: 'AWS, Azure y GCP con Ansible',
objective:
  'Provisionar y gestionar infraestructura cloud en AWS, Azure y GCP usando colecciones Ansible: amazon.aws, azure.azcollection y google.cloud, con inventario dinámico para autodescubrimiento de hosts.',
duration: '4–5 horas',
objectives: [
  'Entender el rol de Ansible en IaC cloud y cuándo usarlo vs. Terraform',
  'Provisionar recursos AWS (EC2, S3, RDS, IAM) con amazon.aws',
  'Configurar inventario dinámico con el plugin aws_ec2 para autodescubrimiento',
  'Gestionar VMs en Azure y GCP con sus respectivas colecciones de Ansible',
],
prerequisites: [
  'Módulo 2 de este nivel completado',
  'Cuenta en AWS, Azure o GCP con credenciales de acceso programático',
  'AWS CLI, Azure CLI o gcloud CLI instalados y configurados',
],
steps: [...nivel18Mod3StepsA, ...nivel18Mod3StepsB],
quiz: [
  {
    question:
      '¿Cuál es la principal ventaja del inventario dinámico con el plugin aws_ec2 sobre un inventario estático?',
    options: [
      'El inventario dinámico es más rápido de procesar que un archivo YAML estático',
      'Autodescubre las instancias EC2 en tiempo real sin necesidad de mantener el inventario manualmente',
      'Permite usar variables de grupo que el inventario estático no soporta',
      'Solo el inventario dinámico soporta múltiples regiones de AWS',
    ],
    correctIndex: 1,
    explanation:
      'El inventario dinámico con <code>aws_ec2</code> consulta la API de AWS en cada ejecución de Ansible. Cuando lanzás una nueva instancia con los tags correctos, aparece automáticamente. Cuando la terminás, desaparece. Esto elimina el riesgo de inventarios desincronizados con la infraestructura real, que es el problema crónico de los inventarios estáticos en entornos cloud dinámicos.',
  },
  {
    question:
      '¿Qué módulo de Ansible se usa para pasar la IP de una instancia recién provisionada del primer play al segundo play dentro del mismo playbook?',
    options: [
      'ansible.builtin.set_fact con hostvars',
      'ansible.builtin.add_host',
      'amazon.aws.ec2_instance con register',
      'ansible.builtin.include_vars',
    ],
    correctIndex: 1,
    explanation:
      '<code>ansible.builtin.add_host</code> agrega un host al inventario en memoria durante la ejecución del playbook. Esto permite que el play 1 provisionice la instancia, descubra su IP, la agregue a un grupo temporal, y el play 2 se conecte a ese grupo para configurar la máquina — todo dentro del mismo playbook, sin inventario externo.',
  },
  {
    question:
      '¿Cuándo es preferible usar Terraform en lugar de Ansible para gestionar infraestructura cloud?',
    options: [
      'Cuando necesitás configurar el sistema operativo de las VMs además de crearlas',
      'Cuando tenés infraestructura cloud compleja con dependencias entre recursos y necesitás gestión de estado robusta con plan/apply',
      'Cuando el equipo ya conoce Ansible y no quiere aprender otra herramienta',
      'Cuando necesitás conectarte a las VMs por SSH para ejecutar comandos',
    ],
    correctIndex: 1,
    explanation:
      'Terraform brilla cuando tenés infraestructura cloud compleja con muchas dependencias entre recursos (VPCs, subnets, security groups, etc.) y necesitás la capacidad de <code>terraform plan</code> para ver qué va a cambiar antes de aplicar. Su gestión de estado (tfstate) es más robusta para IaC puro. Ansible es mejor cuando necesitás combinar provisioning con configuración del SO en el mismo pipeline.',
  },
],
realWorldCase:
  'Un startup que migraba de ClickOps a IaC implementó Ansible para provisionar instancias EC2 con el módulo amazon.aws, luego configurarlas automáticamente: en cada PR merge, el pipeline crea el entorno de staging, corre las pruebas de integración y termina la instancia — eliminando costos de infraestructura idle y errores de configuración manual.',
troubleshooting: [
  {
    error: 'ModuleNotFoundError: No module named "botocore" o "boto3"',
    cause:
      'Los paquetes Python <code>boto3</code> y <code>botocore</code> no están instalados en el control node. Son las dependencias obligatorias de la colección <code>amazon.aws</code> para comunicarse con la API de AWS.',
    fix: 'Ejecutá <code>pip install boto3 botocore</code> en el entorno Python que usa Ansible. Verificá cuál Python usa Ansible con <code>ansible --version | grep python</code> e instalá los paquetes en ese entorno específico.',
  },
  {
    error: 'AuthFailure: AWS was not able to validate the provided access credentials',
    cause:
      'Las credenciales de AWS son incorrectas, han expirado, o no están disponibles en el entorno donde corre Ansible. Esto también ocurre cuando se usan perfiles AWS incorrectos.',
    fix: 'Verificá las credenciales con <code>aws sts get-caller-identity</code>. Asegurate de que las variables de entorno <code>AWS_ACCESS_KEY_ID</code> y <code>AWS_SECRET_ACCESS_KEY</code> están seteadas correctamente, o que <code>~/.aws/credentials</code> tiene el perfil correcto. En CI, usá IAM Roles para las instancias en lugar de credenciales estáticas.',
  },
  {
    error: 'azure.azcollection: No module named "azure.mgmt.compute"',
    cause:
      'Las dependencias Python de la colección azure.azcollection no están instaladas. Esta colección tiene muchas dependencias del SDK de Azure que deben instalarse desde su propio archivo requirements.txt.',
    fix: 'Instalá las dependencias correctas ejecutando: <code>pip install -r ~/.ansible/collections/ansible_collections/azure/azcollection/requirements.txt</code>. El archivo requirements.txt de la colección asegura que se instalen las versiones compatibles de todos los SDKs de Azure.',
  },
],
  };
