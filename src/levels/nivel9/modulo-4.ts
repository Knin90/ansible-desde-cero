import type { ModuleContent } from '../types';
import { nivel9Mod4StepsA } from './modulo-4-steps-a';
import { nivel9Mod4StepsB } from './modulo-4-steps-b';

export const nivel9Mod4: ModuleContent =   {
levelId: 9,
moduleId: 4,
title: 'Macros e includes Jinja2',
objective: 'Aplicar el principio DRY en archivos de plantilla Jinja2 usando macros para encapsular bloques reutilizables, importar macros desde otros archivos e incluir fragmentos de plantilla para componer configuraciones complejas.',
duration: '2–3 horas',
objectives: [
  'Definir macros Jinja2 con parámetros y valores por defecto',
  'Llamar macros dentro del mismo archivo de plantilla',
  'Importar macros desde archivos externos con import',
  'Incluir fragmentos de plantilla con include para composición modular',
],
prerequisites: [
  'Haber completado los Módulos 1, 2 y 3 del Nivel 9',
  'Entender el módulo ansible.builtin.template y cómo funciona el directorio templates/',
  'Conocer la estructura básica de un archivo nginx.conf',
],
steps: [...nivel9Mod4StepsA, ...nivel9Mod4StepsB],
quiz: [
  {
    question: '¿Cuál es la diferencia entre {% import %} y {% include %} en Jinja2?',
    options: [
      'No hay diferencia, ambos insertan el contenido del archivo',
      'import carga macros (funciones) sin renderizar output; include inserta el contenido renderizado del archivo directamente',
      'include es más rápido que import',
      'import sólo funciona con archivos .j2; include funciona con cualquier archivo',
    ],
    correctIndex: 1,
    explanation: 'import carga las macros definidas en otro archivo sin insertar ningún output en el template — sólo hace disponibles las macros para ser llamadas. include en cambio renderiza el archivo referenciado y lo inserta textualmente en ese punto del template. Usás import para "importar funciones", e include para "insertar fragmentos de texto procesado".',
  },
  {
    question: 'Al definir una macro Jinja2 como {% macro host(dominio, puerto=80) %}, ¿qué significa que puerto tenga el valor 80?',
    options: [
      'Puerto es siempre 80 y no se puede cambiar al llamar la macro',
      'Puerto es un parámetro obligatorio que debe recibir el valor 80',
      'Puerto es un parámetro opcional con valor por defecto 80 — si no se pasa al llamar la macro, usa 80',
      'La macro fallará si se llama sin pasar el parámetro puerto',
    ],
    correctIndex: 2,
    explanation: 'En las macros de Jinja2, los parámetros con valor por defecto son opcionales. Si llamas host("api.ejemplo.com") sin pasar puerto, la macro usará 80. Si llamas host("api.ejemplo.com", 8080), usará 8080. Los parámetros sin default (como dominio en este ejemplo) son obligatorios — si no los pasás, la macro lanzará un error.',
  },
  {
    question: '¿Qué hace {% include "fragmento.j2" ignore missing %}?',
    options: [
      'Incluye el archivo pero ignora todos sus errores de renderizado',
      'Incluye el archivo sólo si no existe, y lo omite si existe',
      'Incluye el archivo si existe; si no existe, continúa sin error en lugar de fallar',
      'Es un error de sintaxis — ignore missing no es válido',
    ],
    correctIndex: 2,
    explanation: 'La directiva "ignore missing" hace que Jinja2 omita silenciosamente el include si el archivo referenciado no existe, en lugar de lanzar un TemplateNotFound error. Es útil para fragmentos opcionales, como overrides de configuración que quizás no están presentes en todos los entornos. Sin "ignore missing", un archivo faltante causa un error que detiene el playbook.',
  },
],
realWorldCase: 'Un equipo de infraestructura gestiona 15 microservicios en nginx con distintas configuraciones SSL, rate limiting y paths de proxy. En lugar de mantener 15 archivos de configuración separados, definen 4 macros en un archivo de biblioteca y generan todas las configuraciones desde un único template parametrizado, reduciendo 2000 líneas de configuración a 300.',
troubleshooting: [
  {
    error: "TemplateNotFound: macros/nginx_macros.j2",
    cause: 'Ansible busca los archivos de include/import relativos al directorio templates/ del rol actual. Si el path en el import no coincide con la estructura real del directorio, no lo encuentra.',
    fix: "Verificá que el archivo exista en roles/<rol>/templates/macros/nginx_macros.j2. En el template, usá el path relativo al directorio templates/: {% import 'macros/nginx_macros.j2' as nginx %}. Ansible resuelve los paths de template relativos al directorio templates/ del rol.",
  },
  {
    error: "UndefinedError: 'variable_name' is undefined (dentro de una macro importada con import)",
    cause: 'Por defecto, las macros importadas con {% import %} NO heredan el contexto global del template padre — sólo tienen acceso a sus propios parámetros.',
    fix: "Usá {% import 'archivo.j2' as alias with context %} para que las macros importadas hereden todas las variables del contexto. Alternativamente, pasá las variables como parámetros explícitos a la macro. Los includes sí heredan el contexto por defecto.",
  },
  {
    error: 'Líneas en blanco excesivas en el output del template generado',
    cause: 'Las etiquetas {% %} de Jinja2 dejan una línea en blanco donde estaban en el template. En configuraciones sensibles al whitespace esto puede causar problemas.',
    fix: "Usá el modificador de whitespace con guión: {%- macro ... -%} y {%- endmacro -%}. El guión antes del % consume el whitespace/newline precedente; el guión después del % consume el whitespace/newline siguiente. También podés configurar trim_blocks=True y lstrip_blocks=True en el template.",
  },
],
  };
