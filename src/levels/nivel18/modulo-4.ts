import type { ModuleContent } from '../types';
import { nivel18Mod4StepsA } from './modulo-4-steps-a';
import { nivel18Mod4StepsB } from './modulo-4-steps-b';

export const nivel18Mod4: ModuleContent =   {
levelId: 18,
moduleId: 4,
title: 'VMware y Proxmox con Ansible',
objective:
  'Gestionar virtualización empresarial y de homelab usando Ansible: provisionar VMs en vSphere con community.vmware y en Proxmox con community.general, incluyendo snapshots, templates y gestión del ciclo de vida.',
duration: '3–4 horas',
objectives: [
  'Usar community.vmware para gestionar el ciclo de vida de VMs en vSphere',
  'Automatizar snapshots, clones desde template y estados de energía en VMware',
  'Provisionar VMs en Proxmox con los módulos de community.general',
  'Crear VMs desde templates en Proxmox para despliegues reproducibles',
],
prerequisites: [
  'Módulo 3 de este nivel completado',
  'Acceso a un entorno VMware vSphere o Proxmox (puede ser laboratorio)',
  'Credenciales de administrador para el hipervisor objetivo',
],
steps: [...nivel18Mod4StepsA, ...nivel18Mod4StepsB],
quiz: [
  {
    question:
      '¿Qué parámetro en vmware_guest garantiza que Ansible espere a que vSphere complete la personalización del SO antes de continuar?',
    options: [
      'wait_for_ip: true',
      'state: poweredon',
      'wait_for_customization: true',
      'customization_timeout: 300',
    ],
    correctIndex: 2,
    explanation:
      'El parámetro <code>wait_for_customization: true</code> hace que Ansible espere a que vSphere complete la personalización del SO (hostname, configuración de red, etc.) antes de devolver el control. Sin este parámetro, el siguiente task que intente conectarse por SSH podría fallar porque la VM todavía no tiene la IP asignada o el hostname configurado.',
  },
  {
    question:
      '¿Por qué es necesario instalar el paquete Python <code>proxmoxer</code> para usar los módulos de Proxmox en Ansible?',
    options: [
      'proxmoxer reemplaza a Python en la comunicación con Proxmox',
      'Es la librería que Ansible usa para autenticarse por SSH en el nodo Proxmox',
      'Es el SDK Python que los módulos community.general usan para comunicarse con la API REST de Proxmox',
      'proxmoxer gestiona el estado de las VMs en el archivo de inventario',
    ],
    correctIndex: 2,
    explanation:
      'Los módulos de Proxmox en <code>community.general</code> no se comunican con Proxmox por SSH — usan la API REST de Proxmox VE. <code>proxmoxer</code> es la librería Python que abstrae esa API REST. Sin ella instalada en el control node, Ansible no puede hablar con Proxmox y los módulos fallan con un ImportError.',
  },
  {
    question:
      '¿Cuál es el beneficio del patrón "snapshot pre-update + rollback automático" en VMware con Ansible?',
    options: [
      'Los snapshots mejoran el rendimiento de la VM durante la actualización',
      'Permite revertir la VM a su estado previo automáticamente si la actualización falla, sin intervención manual',
      'Los snapshots reemplazan la necesidad de backups regulares',
      'Ansible solo puede hacer rollback en entornos VMware, no en otros hipervisores',
    ],
    correctIndex: 1,
    explanation:
      'El patrón consiste en: crear snapshot → aplicar cambios → verificar resultado → si falla, revertir snapshot automáticamente con una tarea condicional (<code>when: update_failed</code>). Esto permite actualizaciones seguras con rollback automático sin intervención manual, algo que en entornos manuales requería disponibilidad del equipo de ops fuera del horario laboral.',
  },
],
realWorldCase:
  'Un equipo de infraestructura usa Ansible para gestionar 200 VMs VMware: cada semana un playbook crea snapshots de todos los servidores, aplica patches de seguridad, verifica que los servicios responden y elimina los snapshots si todo está OK — o revierte automáticamente y crea un ticket en Jira si algo falla.',
troubleshooting: [
  {
    error: 'ImportError: No module named "pyVmomi"',
    cause:
      'El paquete Python <code>pyVmomi</code> (SDK oficial de VMware para Python) no está instalado en el control node. Es la dependencia obligatoria de todos los módulos <code>community.vmware</code>.',
    fix: 'Instalá el paquete con <code>pip install pyVmomi</code> en el entorno Python que usa Ansible. Verificá el entorno correcto con <code>ansible --version | grep python</code>. Para algunas operaciones también necesitás <code>pip install PyVim</code>.',
  },
  {
    error: 'proxmoxer.backends.https.AuthenticationError: Couldn\'t authenticate user',
    cause:
      'Las credenciales de Proxmox son incorrectas o el usuario no tiene los permisos necesarios en Proxmox VE. El formato del usuario en Proxmox incluye el realm: <code>root@pam</code>, no solo <code>root</code>.',
    fix: 'Verificá que el usuario tiene el formato correcto con realm: <code>root@pam</code> para el usuario root, o <code>usuario@pve</code> para usuarios Proxmox nativos. Comprobá los permisos en Datacenter → Permissions en la UI de Proxmox. También podés crear un usuario dedicado para Ansible con los permisos mínimos necesarios (VM.Allocate, VM.Config.*, Pool.Allocate).',
  },
  {
    error: 'community.vmware.vmware_guest: [Errno 111] Connection refused a vcenter:443',
    cause:
      'Ansible no puede conectarse al servidor vCenter. Puede ser un problema de red, firewall, o que el hostname del vCenter no resuelve desde el control node.',
    fix: 'Verificá conectividad con <code>curl -k https://vcenter.empresa.local/sdk</code> desde el control node. Comprobá que el puerto 443 está abierto en el firewall entre el control node y el vCenter. Si el certificado SSL es autofirmado, usá <code>validate_certs: false</code> temporalmente para diagnóstico (habilitalo en producción con el cert correcto).',
  },
],
  };
