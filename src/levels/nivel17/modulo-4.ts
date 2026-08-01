import type { ModuleContent } from '../types';
import { nivel17Mod4StepsA } from './modulo-4-steps-a';
import { nivel17Mod4StepsB } from './modulo-4-steps-b';

export const nivel17Mod4: ModuleContent =   {
levelId: 17,
moduleId: 4,
title: 'CI/CD con GitHub Actions',
objective: 'Construir un pipeline completo de CI/CD para proyectos Ansible usando GitHub Actions: lint automático en cada PR, Molecule tests en runners Docker, dry-run en staging y deployment automático a producción.',
duration: '2–3 horas',
objectives: [
  'Entender por qué CI/CD es indispensable para equipos que trabajan con Ansible',
  'Construir un workflow de GitHub Actions que integre lint, Molecule y ansible-playbook',
  'Gestionar secretos sensibles (Vault password, SSH keys) usando GitHub Secrets',
  'Implementar el patrón staging-gate: --check en staging antes de merge a main',
],
prerequisites: [
  'Completados los Niveles 0–16 y módulos 1–3 del Nivel 17',
  'Repositorio Ansible en GitHub',
  'Molecule configurado en al menos un rol',
  'ansible-lint y yamllint configurados en el proyecto',
],
steps: [...nivel17Mod4StepsA, ...nivel17Mod4StepsB],
quiz: [
  {
    question: '¿Cuándo se ejecuta el job staging-check en el workflow?',
    options: [
      'En cada push a cualquier rama',
      'Solo en Pull Requests hacia main',
      'Solo después de un merge exitoso a main',
      'Cada vez que cambia el archivo site.yml',
    ],
    correctIndex: 1,
    explanation: 'El job staging-check tiene la condición if: github.event_name == \'pull_request\'. Solo corre cuando se abre o actualiza un PR, actuando como gate antes del merge. Tras el merge (push a main), corre el job deploy en su lugar.',
  },
  {
    question: '¿Por qué se escribe el Vault password a un archivo temporal en lugar de pasarlo directamente como argumento?',
    options: [
      'Porque --vault-password no es una opción válida de ansible-playbook',
      'Para evitar que el password aparezca en los logs del workflow y en el historial de procesos del runner',
      'Porque GitHub Actions no soporta secrets en argumentos de comandos',
      'Para poder reutilizar el mismo password en múltiples playbooks',
    ],
    correctIndex: 1,
    explanation: 'Pasar el password directamente como argumento lo expone en los logs del runner y en la lista de procesos (ps aux). Un archivo temporal con permisos 600 es más seguro: solo el proceso de Ansible puede leerlo, y se limpia con if: always().',
  },
  {
    question: '¿Qué ventaja tiene la estrategia matrix en el job de Molecule?',
    options: [
      'Permite reutilizar el mismo runner para múltiples roles secuencialmente',
      'Corre los tests de cada rol en paralelo, reduciendo el tiempo total de CI',
      'Garantiza que los roles se ejecuten en el mismo orden que en producción',
      'Comparte el caché de Docker entre diferentes roles para acelerar las descargas',
    ],
    correctIndex: 1,
    explanation: 'La estrategia matrix crea un job separado para cada elemento de la lista. GitHub Actions los ejecuta en paralelo en diferentes runners, reduciendo el tiempo total de N × tiempo_por_rol a simplemente el tiempo del rol más lento.',
  },
],
realWorldCase: 'Un equipo de DevOps con 6 ingenieros adoptó este pipeline para gestionar 300 servidores. En el primer mes, el staging-check bloqueó 11 PRs que habrían causado outages en producción. El tiempo medio de detección de errores bajó de "descubierto en producción" a "bloqueado en PR review".',
troubleshooting: [
  {
    error: 'El job de Molecule falla con "Cannot connect to the Docker daemon" en GitHub Actions',
    cause: 'El runner no tiene Docker disponible o el daemon no está iniciado correctamente',
    fix: 'Usar "runs-on: ubuntu-latest" (incluye Docker preinstalado). Agregar "- uses: docker/setup-docker-action@v3" como primer step para garantizar que Docker esté listo antes de ejecutar Molecule.',
  },
  {
    error: 'ansible-playbook falla con "Vault password file was not found"',
    cause: 'El secret ANSIBLE_VAULT_PASSWORD no está configurado en el repositorio de GitHub, o el step de configuración no corrió correctamente',
    fix: 'Verificar que el secret existe con "gh secret list". Revisar que el step de configuración del vault_pass usa el nombre correcto del secret y que tiene los permisos de archivo 600.',
  },
  {
    error: 'El job de deploy corre en PRs aunque debería correr solo en push a main',
    cause: 'La condición if del job está mal formada o las expresiones de GitHub Actions tienen un error de sintaxis',
    fix: 'Verificar la sintaxis: if: github.event_name == \'push\' && github.ref == \'refs/heads/main\'. Usar el validador de GitHub Actions en el mismo repositorio para depurar la expresión.',
  },
],
  };
