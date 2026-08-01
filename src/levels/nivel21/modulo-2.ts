import type { ModuleContent } from '../types';
import { nivel21Mod2StepsA } from './modulo-2-steps-a';
import { nivel21Mod2StepsB } from './modulo-2-steps-b';

export const nivel21Mod2: ModuleContent =   {
levelId: 21,
moduleId: 2,
title: 'Implementación completa',
duration: '3 horas',
objective: 'Implementar el playbook maestro site.yml con rolling updates, pre/post tasks y verificación de idempotencia.',
objectives: [
  'Implementar site.yml como orquestador que importa playbooks específicos',
  'Configurar rolling updates con serial, max_fail_percentage y pre/post tasks',
  'Integrar vault en group_vars con variables sensibles por ambiente',
  'Verificar idempotencia ejecutando el playbook dos veces y validando cero cambios',
],
prerequisites: [
  'Módulo 21.1: estructura del proyecto y configuración del inventario dinámico',
],
steps: [...nivel21Mod2StepsA, ...nivel21Mod2StepsB],
glossary: [
  {
    term: 'serial',
    definition: 'Parámetro de un play que controla cuántos hosts se actualizan simultáneamente en cada lote del rolling update. Acepta un número entero (ej: serial: 2), un porcentaje (ej: serial: "20%"), o una lista para lotes crecientes (ej: serial: [1, "20%", "100%"]).',
  },
  {
    term: 'max_fail_percentage',
    definition: 'Parámetro de un play que define el porcentaje máximo de hosts que puede fallar antes de abortar el play completo. Con max_fail_percentage: 10 y 20 hosts, si 3 hosts fallan (>10%), Ansible aborta el play para los hosts restantes.',
  },
  {
    term: 'pre_tasks / post_tasks',
    definition: 'Secciones de un play que se ejecutan antes (pre_tasks) y después (post_tasks) de los roles. Se usan para preparar el entorno antes del rol (sacar del load balancer, verificar precondiciones) y verificar el resultado después (smoke tests, re-agregar al load balancer).',
  },
  {
    term: 'import_playbook',
    definition: 'Directiva que incluye otro playbook de forma estática en tiempo de parsing. Las diferencias con include_playbook: los tags son transitivos, los errores de sintaxis se detectan antes de ejecutar, y no soporta condiciones (when). Recomendado para orquestadores como site.yml.',
  },
  {
    term: 'Idempotencia',
    definition: 'Propiedad de un playbook donde ejecutarlo múltiples veces sobre el mismo sistema produce el mismo estado final, sin cambios adicionales en las ejecuciones subsiguientes. Un playbook idempotente correctamente escrito reporta changed=0 en el segundo run.',
  },
],
quiz: [
  {
    question: '¿Qué hace max_fail_percentage: 10 en un play con 20 hosts?',
    options: [
      'Permite que hasta 10 hosts fallen antes de abortar',
      'Permite que hasta 2 hosts fallen (10% de 20) antes de abortar el play',
      'Reintenta hasta 10 veces en los hosts que fallan',
      'Solo aplica al 10% de los hosts del inventario',
    ],
    correctIndex: 1,
    explanation: 'max_fail_percentage: 10 significa que si más del 10% de los hosts falla, Ansible aborta el play. Con 20 hosts: 10% = 2 hosts. Si 3 hosts fallan (15%), el play se aborta para los hosts restantes. Esto evita que un problema en pocos hosts se propague a toda la infraestructura.',
  },
  {
    question: '¿Por qué se usa import_playbook en lugar de include_playbook en site.yml?',
    options: [
      'import_playbook es más rápido que include_playbook',
      'import_playbook resuelve dependencias en tiempo de parsing, permite tags transitivos y detecta errores de sintaxis antes de ejecutar',
      'include_playbook no funciona con inventarios dinámicos',
      'import_playbook soporta variables mientras include_playbook no',
    ],
    correctIndex: 1,
    explanation: 'import_playbook es estático: Ansible lo procesa en tiempo de parsing antes de ejecutar. Esto permite que los tags sean transitivos (--tags app funciona en todos los playbooks importados), que los errores de sintaxis se detecten antes de ejecutar, y que el comportamiento sea predecible. include_playbook es dinámico y útil para importación condicional.',
  },
  {
    question: '¿Cómo verificás que un playbook es idempotente?',
    options: [
      'Añadiendo la opción idempotent: true en ansible.cfg',
      'Ejecutando el playbook dos veces y verificando que el segundo run reporta 0 tareas changed',
      'Usando el flag --idempotency-check al ejecutar el playbook',
      'Molecule lo verifica automáticamente con --check en el primer run',
    ],
    correctIndex: 1,
    explanation: 'La verificación de idempotencia es conceptualmente simple: ejecutar el playbook dos veces. La primera ejecución aplica la configuración deseada. La segunda ejecución, sobre el sistema ya configurado, no debe producir cambios (changed=0). Molecule tiene un step "idempotence" que hace exactamente esto: ejecuta converge.yml por segunda vez y falla si hay algún changed.',
  },
],
troubleshooting: [
  {
    error: 'Tarea no idempotente: siempre muestra "changed" aunque no hay cambios reales',
    cause: 'Uso de ansible.builtin.command o shell sin creates/removes, o un módulo que no verifica el estado antes de actuar.',
    fix: 'Preferí módulos idempotentes por naturaleza (apt, service, template, lineinfile). Para command/shell, usá el parámetro creates (si el archivo ya existe, no ejecutar) o changed_when: false si el comando nunca cambia estado, o registrá el resultado y usá changed_when con una condición real.',
  },
  {
    error: 'El rolling update falla con "aborted play, not enough hosts" antes de terminar',
    cause: 'Más hosts fallaron que el umbral de max_fail_percentage.',
    fix: 'Revisá los errores de los hosts fallidos con ansible-playbook ... -v. Corregí el problema subyacente. Si necesitás continuar forzado, usá --force-handlers y revisá si max_fail_percentage está demasiado estricto para el número de hosts actuales.',
  },
  {
    error: 'pre_tasks se ejecutan pero el rol falla y post_tasks no se ejecutan',
    cause: 'Si un rol falla, las post_tasks por defecto no se ejecutan. Ansible para el play.',
    fix: 'Para garantizar que post_tasks se ejecuten aunque el rol falle (ej: re-agregar al load balancer), usá un bloque con rescue o mové las post_tasks críticas a un bloque always dentro del role. Alternativamente, usá ignore_errors: true en el role y verificá el resultado en post_tasks.',
  },
],
  };
