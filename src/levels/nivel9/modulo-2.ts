import type { ModuleContent } from '../types';
import { nivel9Mod2StepsA } from './modulo-2-steps-a';
import { nivel9Mod2StepsB } from './modulo-2-steps-b';

export const nivel9Mod2: ModuleContent =   {
levelId: 9,
moduleId: 2,
title: 'Filtros Jinja2',
objective: 'Aprender a usar los filtros de Jinja2 para transformar datos: manipular strings, ordenar listas, convertir tipos y aplicar los filtros específicos de Ansible para criptografía, codificación, rutas de archivos y serialización.',
duration: '3–4 horas',
objectives: [
  'Aplicar filtros de string para normalizar y transformar texto',
  'Usar filtros de lista para ordenar, filtrar y transformar colecciones',
  'Convertir entre tipos de datos con filtros de conversión',
  'Usar filtros específicos de Ansible: default, password_hash, to_json, b64encode y regex_replace',
],
prerequisites: [
  'Haber completado el Módulo 1 de Nivel 9 (Variables y expresiones Jinja2)',
  'Entender la sintaxis básica de {{ }} en Ansible',
],
steps: [...nivel9Mod2StepsA, ...nivel9Mod2StepsB],
quiz: [
  {
    question: '¿Qué hace el filtro default(omit) en Ansible, a diferencia de default("valor")?',
    options: [
      'Ambos hacen lo mismo: establecen un valor por defecto',
      'default(omit) elimina la variable del scope, default("valor") la reemplaza',
      'default(omit) hace que Ansible omita completamente el parámetro de la tarea si la variable no está definida',
      'default(omit) sólo funciona en archivos .j2',
    ],
    correctIndex: 2,
    explanation: 'default(omit) es una instrucción especial de Ansible que le dice al módulo que ignore ese parámetro completamente si la variable no está definida. Es como si no hubieras escrito el parámetro. default("valor") en cambio reemplaza la variable con el string "valor". El primero es para parámetros opcionales de módulos; el segundo para proporcionar valores de fallback.',
  },
  {
    question: 'Tenés una lista de diccionarios con claves "nombre" y "activo". ¿Qué filtro usás para obtener sólo los elementos donde activo es true?',
    options: [
      '{{ lista | filter("activo", true) | list }}',
      '{{ lista | selectattr("activo", "equalto", true) | list }}',
      '{{ lista | where("activo == true") | list }}',
      '{{ lista | grep("activo") | list }}',
    ],
    correctIndex: 1,
    explanation: 'selectattr filtra una lista de objetos/dicts basándose en el valor de un atributo. La sintaxis es selectattr("nombre_atributo", "test_name", valor). Para igualdad se usa "equalto". Siempre hay que añadir | list al final porque selectattr devuelve un generador Python, no una lista. Los otros filtros mencionados no existen en Jinja2/Ansible.',
  },
  {
    question: '¿Por qué es importante usar | int antes de hacer aritmética con variables que vienen de --extra-vars o del inventario?',
    options: [
      'No es necesario, Ansible convierte automáticamente los tipos',
      'Porque esas variables llegan como strings, y sumar strings en Python concatena en lugar de sumar',
      'Porque | int es más rápido que la conversión automática',
      'Porque el inventario sólo acepta strings',
    ],
    correctIndex: 1,
    explanation: 'Las variables que llegan por --extra-vars, variables de inventario o variables de entorno son siempre strings en Ansible. Si hacés "8080" + 1 en Python (Jinja2), obtenés un error de tipo. Si hacés "8080" ~ 1 obtenés "80801". Para aritmética real necesitás convertir primero con | int: {{ puerto | int + 1 }} da 8081. Este es uno de los errores más comunes al empezar con Ansible.',
  },
],
realWorldCase: 'Un equipo de plataforma usa filtros Jinja2 para generar configuraciones de Kubernetes: combina el dict de config base con overrides por entorno (| combine), serializa el resultado a YAML (| to_yaml), y lo despliega como ConfigMap. Esto eliminó 12 archivos de configuración separados y reemplazó todo con un único playbook parametrizado.',
troubleshooting: [
  {
    error: "FilterError: No filter named 'ipaddr'",
    cause: 'El filtro ipaddr (y otros filtros de red como ipsubnet, hwaddr) requieren el paquete Python netaddr instalado en el nodo de control, y son parte de la colección community.general o ansible.utils, no del core de Ansible.',
    fix: 'pip install netaddr && ansible-galaxy collection install ansible.utils. Luego usá el FQCN: {{ ip | ansible.utils.ipaddr("network") }}.',
  },
  {
    error: "template error while templating string: expected token 'end of print block', got '|'",
    cause: "Se intentó usar una expresión Jinja2 con pipe (|) dentro de un contexto donde Ansible no puede resolverla, como en la definición de un loop o un when con sintaxis incorrecta.",
    fix: "Verificá que la expresión esté completa y bien formada. Si el filtro recibe argumentos con comillas, asegurate de no mezclar comillas simples y dobles que rompan el YAML. Usá comillas dobles en el YAML y simples dentro de la expresión Jinja2.",
  },
  {
    error: "TypeError: must be str, not int (o similar error de tipo en filtros de string)",
    cause: 'Se aplicó un filtro de string (como upper, lower, replace) a una variable que es un número entero o booleano en lugar de un string.',
    fix: 'Convertí a string primero: {{ numero | string | upper }}. El filtro string convierte cualquier tipo a su representación en texto.',
  },
],
  };
