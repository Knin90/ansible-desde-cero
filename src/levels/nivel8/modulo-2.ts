import type { ModuleContent } from '../types';
import { nivel8Mod2StepsA } from './modulo-2-steps-a';
import { nivel8Mod2StepsB } from './modulo-2-steps-b';

export const nivel8Mod2: ModuleContent =   {
levelId: 8,
moduleId: 2,
title: 'Módulos de sistema',
objective: 'Dominar los módulos built-in más importantes para gestionar paquetes, servicios, archivos, usuarios y tareas programadas.',
duration: '2.5 horas',
objectives: [
  'Usar ansible.builtin.package, apt y dnf para gestión de paquetes multiplataforma',
  'Gestionar servicios con service y systemd',
  'Crear, modificar y eliminar archivos, directorios y symlinks con file, copy y template',
  'Gestionar usuarios, grupos y cron jobs idempotentemente',
],
prerequisites: [
  'Haber ejecutado tareas básicas de Ansible',
  'Entender idempotencia y FQCN (módulo anterior)',
],
steps: [...nivel8Mod2StepsA, ...nivel8Mod2StepsB],
quiz: [
  {
    question: '¿Cuál es la diferencia entre `ansible.builtin.service` y `ansible.builtin.systemd`?',
    options: [
      'Son completamente equivalentes, solo cambia el nombre',
      'service es genérico (soporta sysV, upstart, systemd); systemd es específico y tiene opciones adicionales como daemon_reload',
      'systemd es más antiguo y service es el moderno',
      'service solo funciona en Debian; systemd solo en RedHat',
    ],
    correctIndex: 1,
    explanation: '`service` es el módulo genérico que detecta el sistema de init disponible. `systemd` es específico para sistemas con systemd y tiene opciones adicionales como `daemon_reload`, `scope`, y manejo de unidades systemd avanzadas. Para operaciones básicas, service es suficiente. Para systemd avanzado, usá el módulo específico.',
  },
  {
    question: '¿Qué hace el parámetro `validate` en los módulos `copy` y `template`?',
    options: [
      'Verifica que el archivo fuente existe antes de copiarlo',
      'Ejecuta un comando con el archivo temporal para validar su contenido antes de copiarlo al destino final',
      'Valida que los permisos del archivo sean correctos',
      'Comprueba que el destino tiene suficiente espacio en disco',
    ],
    correctIndex: 1,
    explanation: '`validate` ejecuta el comando especificado con `%s` reemplazado por la ruta del archivo temporal. Si el comando retorna exit code != 0, Ansible no copia el archivo al destino y reporta error. Es ideal para validar configuraciones de nginx (`nginx -t`), Apache (`apachectl -t`), etc. antes de reemplazar el archivo en producción.',
  },
  {
    question: '¿Qué módulo usarías para modificar solo una línea específica en /etc/sysctl.conf sin reemplazar todo el archivo?',
    options: [
      'ansible.builtin.copy con content: para todo el archivo',
      'ansible.builtin.lineinfile con regexp para identificar la línea',
      'ansible.builtin.template con el archivo completo en Jinja2',
      'ansible.builtin.command con sed',
    ],
    correctIndex: 1,
    explanation: '`lineinfile` es idóneo para modificar líneas específicas: usa `regexp` para encontrar la línea existente y `line` para especificar el valor deseado. Si la línea existe, la actualiza; si no existe, la agrega al final del archivo. Es idempotente: si la línea ya tiene el valor correcto, no hace cambios.',
  },
],
troubleshooting: [
  {
    error: 'ansible.builtin.apt falla con "Could not get lock /var/lib/dpkg/lock"',
    cause: 'Otro proceso apt (o el automatic updates) está corriendo al mismo tiempo en el host.',
    fix: 'Esperá a que el proceso termine o usá `ansible.builtin.apt: lock_timeout: 300` para esperar hasta 5 minutos por el lock. Para evitar el problema recurrente, deshabilita automatic unattended-upgrades en los hosts administrados.',
  },
  {
    error: 'lineinfile agrega líneas duplicadas en cada ejecución',
    cause: 'El `regexp` no coincide con la línea que ya existe (quizás hay espacios o el patrón es incorrecto), o no se especificó regexp.',
    fix: 'Siempre especificá `regexp` que coincida exactamente con la línea existente. Probá el regex con `grep -n "tu_regex" /etc/tu_archivo`. Si la línea tiene variables, asegurate de que el regex coincida con el valor expandido, no con la plantilla Jinja2.',
  },
  {
    error: 'ansible.builtin.user no elimina al usuario de grupos secundarios',
    cause: 'Ansible user module no elimina usuarios de grupos por defecto. Con `append: false` (el default) se reemplaza la lista completa de grupos, pero requiere especificar todos los grupos deseados.',
    fix: 'Para quitar a un usuario de un grupo secundario, usá `groups: [lista_de_grupos_sin_el_que_queres_quitar]` con `append: false`. Esto reemplaza todos los grupos secundarios con la lista especificada.',
  },
],
  };
