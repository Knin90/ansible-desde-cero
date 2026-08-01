import type { ModuleContent } from '../types';
import { nivel19Mod1StepsA } from './modulo-1-steps-a';
import { nivel19Mod1StepsB } from './modulo-1-steps-b';

export const nivel19Mod1: ModuleContent =   {
levelId: 19,
moduleId: 1,
title: 'Crear módulos propios',
duration: '3 horas',
objective: 'Escribir módulos Python personalizados para Ansible siguiendo las convenciones oficiales de AnsibleModule, argument_spec y valores de retorno.',
objectives: [
  'Comprender la anatomía completa de un módulo Ansible en Python',
  'Usar AnsibleModule con argument_spec, validaciones y check mode',
  'Devolver resultados correctos con exit_json y fail_json',
  'Compartir código entre módulos usando module_utils',
  'Documentar módulos con los bloques DOCUMENTATION, EXAMPLES y RETURN',
],
prerequisites: [
  'Python básico (funciones, diccionarios, manejo de excepciones)',
  'Ansible instalado y playbooks funcionando (Niveles 0–18)',
  'Conocer la estructura de roles y collections (Niveles 14–15)',
],
steps: [...nivel19Mod1StepsA, ...nivel19Mod1StepsB],
glossary: [
  {
    term: 'AnsibleModule',
    definition: 'Clase base de Python (en ansible.module_utils.basic) que todo módulo Ansible instancia. Valida argumentos, gestiona check mode, serializa el resultado JSON y maneja la comunicación con el controller.',
  },
  {
    term: 'argument_spec',
    definition: 'Diccionario Python que declara los parámetros que acepta un módulo: tipo (str, int, bool, list, dict), si es requerido, valor por defecto, opciones válidas (choices) y si debe ser ocultado en logs (no_log).',
  },
  {
    term: 'module_utils',
    definition: 'Directorio especial (module_utils/ en la raíz o plugins/module_utils/ en una collection) donde se coloca código Python compartido entre múltiples módulos. Ansible lo empaqueta y transfiere al host remoto junto con el módulo que lo importa.',
  },
  {
    term: 'check mode',
    definition: 'Modo de ejecución (--check) en el que Ansible no aplica cambios reales. Los módulos que lo soportan (supports_check_mode=True) deben detectar module.check_mode == True y omitir las operaciones destructivas, pero sí calcular y devolver qué cambiaría.',
  },
  {
    term: 'exit_json / fail_json',
    definition: 'Métodos de AnsibleModule que terminan la ejecución del módulo. exit_json serializa el diccionario de resultado como JSON en stdout y sale con código 0. fail_json hace lo mismo pero marca el resultado como fallido y sale con código 1.',
  },
  {
    term: 'no_log',
    definition: 'Atributo de argument_spec que indica que el valor de ese parámetro no debe aparecer en logs, output ni callbacks. Imprescindible para contraseñas, tokens y cualquier dato sensible.',
  },
],
quiz: [
  {
    question: '¿Qué método de AnsibleModule debés llamar para indicar que una tarea falló con un mensaje de error?',
    options: [
      'module.exit_json(failed=True, msg="error")',
      'module.fail_json(msg="error")',
      'raise AnsibleError("error")',
      'sys.exit(1)',
    ],
    correctIndex: 1,
    explanation: 'fail_json() es el método correcto. Acepta un parámetro msg obligatorio y cualquier campo extra para debugging. exit_json(failed=True) técnicamente también funciona, pero es una mala práctica. sys.exit() y raise corrompen la comunicación JSON.',
  },
  {
    question: '¿Qué debe hacer un módulo cuando module.check_mode es True?',
    options: [
      'Lanzar un error indicando que check mode no está soportado',
      'Ejecutar todos los cambios normalmente y devolver changed=False',
      'Calcular qué cambiaría sin aplicar cambios reales, y devolver el diff',
      'Ignorar el parámetro check_mode y proceder normalmente',
    ],
    correctIndex: 2,
    explanation: 'En check mode el módulo debe simular la operación sin realizar cambios. Calcula el estado antes y después (diff), lo incluye en el resultado, y devuelve changed=True si habría cambios. Esto permite a los usuarios hacer "dry runs" seguros.',
  },
  {
    question: '¿Por qué se usa no_log=True en un parámetro de argument_spec?',
    options: [
      'Para evitar que el parámetro sea validado por AnsibleModule',
      'Para que el valor no aparezca en logs, output ni callbacks de Ansible',
      'Para que el parámetro sea opcional aunque no tenga default',
      'Para deshabilitar el check mode en ese parámetro específico',
    ],
    correctIndex: 1,
    explanation: 'no_log=True instruye a Ansible a censurar el valor de ese parámetro en cualquier salida: logs con -v, callbacks de auditoría, registros de AWX/AAP. Es imprescindible para contraseñas, tokens API, claves privadas y cualquier secreto.',
  },
  {
    question: '¿En qué directorio se coloca el código Python compartido entre varios módulos?',
    options: [
      'library/shared/',
      'plugins/common/',
      'module_utils/',
      'roles/shared/files/',
    ],
    correctIndex: 2,
    explanation: 'module_utils/ es el directorio especial que Ansible reconoce para código compartido entre módulos. En una collection el path es plugins/module_utils/. El código se importa con from ansible.module_utils.mi_archivo import ... y Ansible lo transfiere automáticamente al host remoto.',
  },
],
troubleshooting: [
  {
    error: 'MODULE FAILURE: No JSON object could be decoded',
    cause: 'El módulo imprimió algo antes del JSON (un print(), un import que genera output, o un error de Python sin capturar que va a stdout).',
    fix: 'Revisá que no haya print() en el código. Toda salida debe ir a través de exit_json() o fail_json(). Ejecutá el módulo directamente con python library/mi_modulo.py args para ver la salida raw.',
  },
  {
    error: 'TypeError: argument of type NoneType is not iterable al inicializar AnsibleModule',
    cause: 'El argumento argument_spec recibió None o un valor inválido, o falta la variable ANSIBLE_MODULE_ARGS al ejecutar el módulo directamente.',
    fix: 'Verificá que argument_spec sea un diccionario Python válido. Para probar el módulo fuera de Ansible, creá un archivo JSON con {"ANSIBLE_MODULE_ARGS": {...}} y pasalo como ANSIBLE_ARGS o usá el helper set_module_args() en los tests.',
  },
  {
    error: 'El módulo no encuentra ansible.module_utils.mi_utils (ImportError)',
    cause: 'Ansible no está encontrando el directorio module_utils/ o la ruta no está correctamente configurada en el playbook/role.',
    fix: 'Verificá que module_utils/ esté al mismo nivel que library/ (o en la collection bajo plugins/module_utils/). Confirmá el path con ANSIBLE_LIBRARY=library ANSIBLE_MODULE_UTILS=module_utils ansible-playbook ...',
  },
],
  };
