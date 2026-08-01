import type { ModuleContent } from '../types';
import { nivel19Mod2StepsA } from './modulo-2-steps-a';
import { nivel19Mod2StepsB } from './modulo-2-steps-b';

export const nivel19Mod2: ModuleContent =   {
levelId: 19,
moduleId: 2,
title: 'Crear plugins propios',
duration: '2 horas',
objective: 'Desarrollar filter plugins, lookup plugins y callback plugins personalizados para extender Ansible.',
objectives: [
  'Escribir un filter plugin con la clase FilterModule y el método filters()',
  'Escribir un lookup plugin con la clase LookupModule y el método run()',
  'Escribir un callback plugin básico con CallbackModule',
  'Entender los directorios donde Ansible busca cada tipo de plugin',
],
prerequisites: [
  'Módulo 19.1 completado: AnsibleModule y argument_spec',
  'Conocer Jinja2 y cómo se usan los filtros en templates (Nivel 8)',
],
steps: [...nivel19Mod2StepsA, ...nivel19Mod2StepsB],
glossary: [
  {
    term: 'FilterModule',
    definition: 'Clase Python que todo filter plugin debe definir. Su único método obligatorio, filters(), retorna un diccionario que mapea nombre del filtro (string) a función Python. Ansible carga esta clase automáticamente desde archivos en filter_plugins/.',
  },
  {
    term: 'LookupBase',
    definition: 'Clase base de ansible.plugins.lookup que todos los lookup plugins extienden. El método run(terms, variables, **kwargs) recibe la lista de argumentos del lookup y debe retornar una lista con un resultado por término.',
  },
  {
    term: 'CallbackBase',
    definition: 'Clase base de ansible.plugins.callback que los callback plugins extienden. Define métodos gancho (hooks) para cada evento del ciclo de vida: v2_playbook_on_start, v2_runner_on_ok, v2_runner_on_failed, v2_playbook_on_stats, etc.',
  },
  {
    term: 'Display',
    definition: 'Objeto singleton de ansible.utils.display que permite a los plugins escribir mensajes en la salida de Ansible con diferentes niveles de verbosidad: display.v() (-v), display.vvv() (-vvv), display.warning(), display.error().',
  },
  {
    term: 'CALLBACK_NEEDS_ENABLED',
    definition: 'Atributo de clase en un CallbackModule. Si es True, el plugin debe listarse explícitamente en callback_enabled en ansible.cfg para activarse. Evita que callbacks de notificación se activen accidentalmente.',
  },
],
quiz: [
  {
    question: '¿Dónde corren los lookup plugins: en el controller o en los hosts remotos?',
    options: [
      'En cada host remoto, como los módulos',
      'En el controller (la máquina desde donde se ejecuta Ansible)',
      'En el host remoto designado como "lookup_host"',
      'Depende del tipo de lookup: unos en el controller, otros en el host',
    ],
    correctIndex: 1,
    explanation: 'Los lookup plugins siempre corren en el controller. Por eso pueden acceder a archivos locales del controller (como hace el lookup "file") y a servicios accesibles desde el controller, pero NO tienen acceso directo a los facts o al filesystem de los hosts remotos.',
  },
  {
    question: '¿Qué retorna el método filters() de la clase FilterModule?',
    options: [
      'Una lista con los nombres de los filtros disponibles',
      'Un diccionario que mapea nombre_del_filtro → función Python',
      'Un objeto FilterRegistry con los filtros registrados',
      'Una lista de tuplas (nombre, función)',
    ],
    correctIndex: 1,
    explanation: 'filters() debe retornar un diccionario donde las claves son los nombres que se usarán en Jinja2 (como "to_nginx_upstream") y los valores son las funciones Python correspondientes. Ansible registra estos filtros en el entorno Jinja2 automáticamente.',
  },
  {
    question: '¿Qué significa CALLBACK_TYPE = "notification" en un callback plugin?',
    options: [
      'El plugin solo envía notificaciones de tareas fallidas',
      'El plugin coexiste con el callback de stdout sin reemplazarlo',
      'El plugin reemplaza completamente la salida por pantalla',
      'El plugin requiere configuración de URL de notificación',
    ],
    correctIndex: 1,
    explanation: 'Con CALLBACK_TYPE = "notification", el plugin se ejecuta en paralelo al callback de stdout (yaml, default, etc.) sin reemplazarlo. El tipo "stdout" sí reemplaza la salida por pantalla. "notification" es el tipo correcto para callbacks de integración (Slack, webhooks, métricas).',
  },
],
troubleshooting: [
  {
    error: 'FilterModule no se carga: "no filter named X"',
    cause: 'El archivo no está en filter_plugins/ relativo al playbook, o el nombre de la función en el diccionario de filters() no coincide con el nombre usado en el template.',
    fix: 'Verificá que filter_plugins/ esté al mismo nivel que el playbook. Comprobá que filters() retorne {"nombre_exacto": funcion}. Podés añadir el path en ansible.cfg con filter_plugins = ./filter_plugins.',
  },
  {
    error: 'LookupError: lookup plugin "mi_lookup" not found',
    cause: 'El archivo del lookup plugin no está en lookup_plugins/ o no se llama igual que el primer argumento del lookup().',
    fix: 'El archivo debe llamarse exactamente como el nombre usado en lookup(): lookup("config_service", ...) busca lookup_plugins/config_service.py. También podés agregar el path en ansible.cfg con lookup_plugins = ./lookup_plugins.',
  },
  {
    error: 'El callback plugin no se activa aunque está en callback_plugins/',
    cause: 'Si CALLBACK_NEEDS_ENABLED = True, el plugin no se activa automáticamente aunque esté en el directorio correcto.',
    fix: 'Añadí el nombre del plugin a callback_enabled en ansible.cfg: callback_enabled = slack_notifier. O cambiá CALLBACK_NEEDS_ENABLED a False si querés que siempre se active (solo recomendable para plugins de stdout).',
  },
],
  };
