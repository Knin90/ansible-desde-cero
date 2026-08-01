import type { ModuleContent } from '../types';
import { nivel9Mod1StepsA } from './modulo-1-steps-a';
import { nivel9Mod1StepsB } from './modulo-1-steps-b';

export const nivel9Mod1: ModuleContent =   {
levelId: 9,
moduleId: 1,
title: 'Variables y expresiones Jinja2',
objective: 'Dominar la sintaxis de Jinja2 en Ansible: delimitadores, acceso a variables en estructuras complejas, expresiones condicionales inline y la diferencia crítica entre usar Jinja2 en tareas versus en archivos de plantilla.',
duration: '2–3 horas',
objectives: [
  'Identificar y usar los tres delimitadores Jinja2: {{ }}, {% %} y {# #}',
  'Acceder a variables en diccionarios anidados, listas y variables mágicas de Ansible',
  'Escribir expresiones ternarias y condicionales inline con Jinja2',
  'Distinguir cuándo usar Jinja2 en parámetros de tareas vs. en archivos .j2',
],
prerequisites: [
  'Conocer variables de Ansible: host_vars, group_vars, vars_files (Nivel 4)',
  'Haber usado el módulo ansible.builtin.template al menos una vez',
  'Entender la diferencia entre inventario y playbook',
],
steps: [...nivel9Mod1StepsA, ...nivel9Mod1StepsB],
quiz: [
  {
    question: '¿Cuál es la diferencia entre los operadores + y ~ para concatenar strings en Jinja2?',
    options: [
      'No hay diferencia, ambos hacen lo mismo',
      '~ convierte automáticamente a string mientras que + requiere que ambos operandos sean strings',
      '+ es más rápido que ~',
      '~ sólo funciona en archivos .j2, no en playbooks',
    ],
    correctIndex: 1,
    explanation: 'El operador ~ (tilde) convierte automáticamente cualquier tipo a string antes de concatenar, por lo que funciona con números, booleanos y variables de cualquier tipo. El operador + sólo funciona cuando ambos operandos son strings; si uno es un número, Ansible lanzará un error de tipo.',
  },
  {
    question: '¿Dónde funciona la etiqueta de bloque {% for item in lista %}?',
    options: [
      'Sólo en parámetros de tareas en el playbook',
      'En cualquier lugar donde se use Jinja2',
      'Sólo en archivos de plantilla .j2 procesados por el módulo template',
      'En el inventario de Ansible',
    ],
    correctIndex: 2,
    explanation: 'Las etiquetas de bloque {% %} sólo funcionan en archivos de plantilla .j2 procesados por el módulo ansible.builtin.template. En los parámetros de tareas del playbook, Ansible sólo procesa expresiones {{ }}. Para iterar en tareas, usás el parámetro nativo "loop:" de Ansible.',
  },
  {
    question: '¿Qué variable mágica de Ansible contiene el nombre del host tal como aparece en el inventario?',
    options: [
      'ansible_hostname',
      'ansible_host',
      'inventory_hostname',
      'host_name',
    ],
    correctIndex: 2,
    explanation: 'inventory_hostname es la variable mágica que contiene el nombre del host exactamente como figura en el inventario. Es diferente a ansible_hostname (que obtiene el hostname real del sistema operativo vía facts) y ansible_host (que contiene la IP o dirección de conexión). inventory_hostname_short da el nombre sin el dominio.',
  },
],
realWorldCase: 'En un entorno multi-región AWS, un equipo usa expresiones Jinja2 con inventory_hostname y hostvars para construir dinámicamente las URLs de endpoints y cadenas de conexión entre microservicios, eliminando 200 líneas de variables hardcodeadas en los playbooks.',
troubleshooting: [
  {
    error: "AnsibleUndefinedVariable: 'variable_name' is undefined",
    cause: 'La variable referenciada en la expresión {{ }} no existe en el scope actual, o se está referenciando antes de ser definida.',
    fix: 'Usá el filtro default: {{ variable_name | default("valor_por_defecto") }}. Para debugging, ejecutá ansible-playbook --extra-vars "variable_name=test" o verificá con el módulo debug que la variable existe antes de usarla.',
  },
  {
    error: "We were unable to read either as JSON nor YAML, these are not dictionaries",
    cause: 'Se intentó usar etiquetas de bloque {% %} directamente en un parámetro de tarea del playbook en lugar de en un archivo .j2.',
    fix: 'Mové la lógica compleja a un archivo .j2 y usá el módulo template para procesarlo. Para iteraciones simples en tareas, usá el parámetro loop: nativo de Ansible.',
  },
  {
    error: "Jinja2 variable 'dict_key' — consider using dot notation or bracket notation carefully",
    cause: "La clave del diccionario contiene un guión (-) o un espacio, y se está usando notación de punto (dict.mi-clave) que Jinja2 interpreta como resta.",
    fix: "Usá notación de corchetes: {{ dict['mi-clave'] }}. Las claves con guiones, espacios o que coincidan con métodos de Python siempre requieren corchetes.",
  },
],
  };
