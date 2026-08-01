import type { ModuleContent } from '../types';
import { nivel0Mod3StepsA } from './modulo-3-steps-a';
import { nivel0Mod3StepsB } from './modulo-3-steps-b';

export const nivel0Mod3: ModuleContent = {
  levelId: 0,
  moduleId: 3,
  title: 'YAML — El lenguaje de Ansible',
  objective: 'Dominar la sintaxis YAML que Ansible usa en playbooks, inventarios y roles. Entender escalares, listas, diccionarios, multilínea y anchors.',
  duration: '3–4 horas',
  objectives: [
    'Escribir escalares, listas y diccionarios YAML correctamente',
    'Usar bloques multilínea con | y > según el caso de uso',
    'Aplicar anchors y aliases para evitar repetición en configuraciones',
    'Detectar y corregir los errores de sintaxis YAML más comunes',
    'Validar un playbook con yamllint y ansible --syntax-check',
  ],
  steps: [...nivel0Mod3StepsA, ...nivel0Mod3StepsB],
  prerequisites: [
    'Haber completado el módulo de Redes (Módulo 2 del Nivel 0)',
    'Tener un editor de texto configurado con soporte YAML (VSCode, Neovim, etc.)',
  ],
  quiz: [
    {
      question: '¿Qué carácter se usa en YAML para definir una lista?',
      options: ['*', '-', '|', '#'],
      correctIndex: 1,
      explanation: 'El guión "-" seguido de un espacio define cada ítem de una lista en YAML. Por ejemplo: "- nginx" define un ítem de lista con el valor "nginx".',
    },
    {
      question: '¿Cuál es la diferencia entre los operadores "|" y ">" para texto multilínea en YAML?',
      options: [
        '| preserva saltos de línea; > los colapsa en un espacio',
        '| colapsa saltos de línea; > los preserva',
        'Ambos hacen lo mismo, son intercambiables',
        '| es para comentarios; > es para multilínea',
      ],
      correctIndex: 0,
      explanation: 'El operador "|" (literal block) preserva cada salto de línea tal cual. El operador ">" (folded block) colapsa los saltos de línea en espacios, produciendo un solo párrafo. En Ansible usás "|" cuando necesitás scripts o contenido donde los saltos de línea importan.',
    },
    {
      question: 'En YAML, ¿cuál es el tipo de dato del valor en `habilitado: true`?',
      options: ['String "true"', 'Booleano verdadero', 'Número 1', 'Depende del contexto'],
      correctIndex: 1,
      explanation: 'En YAML, `true`, `false`, `yes`, `no`, `on` y `off` (sin comillas) son booleanos. Si querés el string "true", debés escribirlo entre comillas: `habilitado: "true"`. Ansible es sensible a esta distinción en parámetros de módulos.',
    },
  ],
  realWorldCase: 'En un equipo de infraestructura que gestiona cientos de servidores, todos los playbooks, inventarios y archivos de variables están escritos en YAML. Un error de indentación o un carácter especial sin comillas puede hacer fallar un despliegue entero — por eso se usa yamllint como parte del pipeline de CI/CD antes de ejecutar cualquier playbook en producción.',
  troubleshooting: [
    {
      error: 'yaml.scanner.ScannerError: mapping values are not allowed here',
      cause: 'Hay un ":" en un valor sin comillas, o indentación incorrecta cerca de ese punto.',
      fix: 'Envolvé el valor: mensaje: "Error: host no encontrado"  —  Validá con: yamllint playbook.yml',
    },
    {
      error: 'expected <block mapping start>, but found <scalar>',
      cause: 'Mezcla de tabs y espacios, o nivel de indentación incorrecto en esa línea.',
      fix: 'Configurá tu editor para usar 2 espacios (no tabs). Verificá tabs con: cat -A archivo.yml  (tabs aparecen como ^I)',
    },
    {
      error: 'ERROR! Syntax Error while loading YAML. found character that cannot start any token',
      cause: 'Un caracter especial (@, `, |, {) al inicio de un valor sin comillas, o un tab en lugar de espacios.',
      fix: 'ansible-playbook --syntax-check mi-playbook.yml  —  localiza la línea exacta del error.',
    },
  ],
};
