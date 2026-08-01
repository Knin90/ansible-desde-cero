import type { ModuleContent } from '../types';
import { nivel21Mod3StepsA } from './modulo-3-steps-a';
import { nivel21Mod3StepsB } from './modulo-3-steps-b';

export const nivel21Mod3: ModuleContent =   {
levelId: 21,
moduleId: 3,
title: 'CI/CD con Ansible',
duration: '2 horas',
objective: 'Implementar un pipeline completo de CI/CD con GitHub Actions que incluya lint, Molecule tests, deploy a staging y deploy a producción con aprobación manual.',
objectives: [
  'Configurar un pipeline de lint con yamllint y ansible-lint',
  'Integrar Molecule tests en el pipeline de CI',
  'Implementar deploy a staging automático en merge a main',
  'Configurar deploy a producción con aprobación manual en GitHub Environments',
  'Gestionar secretos de vault en el pipeline con GitHub Secrets',
],
prerequisites: [
  'Módulos 21.1 y 21.2 completados',
  'Conocer Molecule (Nivel 16)',
  'Cuenta de GitHub con GitHub Actions disponible',
],
steps: [...nivel21Mod3StepsA, ...nivel21Mod3StepsB],
glossary: [
  {
    term: 'GitHub Environments',
    definition: 'Funcionalidad de GitHub Actions que asocia un conjunto de secretos, variables y reglas de protección a un entorno nombrado (staging, produccion). Permite requerir aprobación manual antes de que un job que usa ese environment pueda ejecutarse.',
  },
  {
    term: 'workflow_dispatch',
    description: 'Trigger de GitHub Actions que permite ejecutar el workflow manualmente desde la UI de GitHub o via API. Acepta inputs con tipo, opciones y valores por defecto, lo que lo convierte en una interfaz de deploy manual con parámetros.',
    definition: 'Trigger de GitHub Actions que permite ejecutar el workflow manualmente desde la UI de GitHub o via API. Acepta inputs tipados con opciones y valores por defecto.',
  },
  {
    term: 'AWS Secrets Manager',
    definition: 'Servicio de AWS para almacenar, rotar y auditar secretos. Se usa como fuente del vault password en el pipeline de CI a través de un script que llama a la API de AWS. Ventajas sobre GitHub Secrets: rotación automática, auditoría de acceso, y políticas IAM granulares.',
  },
  {
    term: 'OIDC (OpenID Connect) para GitHub Actions',
    definition: 'Protocolo que permite a GitHub Actions asumir roles IAM de AWS sin necesitar credenciales estáticas (Access Key/Secret Key). GitHub presenta un token JWT firmado que AWS verifica para emitir credenciales temporales. Elimina el secreto más crítico del pipeline.',
  },
  {
    term: 'ansible-lint --profile=production',
    definition: 'Perfil de ansible-lint con las reglas más estrictas para código en producción. Incluye todas las reglas de los perfiles básico y estándar, más verificaciones adicionales como FQCN obligatorio, no usar command cuando hay módulo equivalente, y documentación completa de roles.',
  },
],
quiz: [
  {
    question: '¿Cómo se configura la aprobación manual antes del deploy a producción en GitHub Actions?',
    options: [
      'Añadiendo needs: manual-approval en el job de producción',
      'Usando un GitHub Environment con "Required reviewers" configurados',
      'Añadiendo una tarea wait_for_approval en el playbook de Ansible',
      'Creando un job separado de "approval" con un sleep de 24 horas',
    ],
    correctIndex: 1,
    explanation: 'GitHub Environments permite configurar "Required reviewers" para un ambiente como "produccion". Cuando un job usa environment: produccion, GitHub automáticamente pausa la ejecución y notifica a los reviewers configurados. El job solo continúa cuando alguien con permisos aprueba el deploy.',
  },
  {
    question: '¿Cuál es la ventaja de usar OIDC (role-to-assume) en lugar de AWS_ACCESS_KEY_ID en GitHub Secrets?',
    options: [
      'OIDC es más rápido que usar credenciales estáticas',
      'OIDC elimina las credenciales de larga duración: GitHub obtiene credenciales temporales sin necesitar Access Key/Secret Key en los secrets',
      'OIDC permite acceder a AWS desde cualquier región',
      'OIDC funciona sin configurar permisos IAM',
    ],
    correctIndex: 1,
    explanation: 'Con OIDC, GitHub Actions presenta un token JWT firmado por GitHub que AWS verifica para emitir credenciales temporales. No se necesitan credenciales estáticas (Access Key ID / Secret Access Key) en GitHub Secrets. Las credenciales temporales expiran automáticamente y el acceso puede auditarse y revocarse por rol IAM.',
  },
  {
    question: '¿Qué hace la opción "fail-fast: false" en la estrategia matrix de GitHub Actions?',
    options: [
      'Ignora todos los fallos y marca el job como exitoso siempre',
      'Permite que todos los jobs del matrix continúen aunque alguno falle, dando un reporte completo',
      'Ejecuta los jobs del matrix más rápido omitiendo validaciones',
      'Solo aplica el primer job del matrix y cancela los demás',
    ],
    correctIndex: 1,
    explanation: 'Por defecto con matrix, si un job falla, GitHub cancela todos los demás jobs del matrix (fail-fast: true). Con fail-fast: false, todos los jobs corren hasta completarse. Para Molecule tests de múltiples roles, esto es preferible: si el role "servidor_web" falla, querés igual saber si "seguridad" pasa o falla.',
  },
],
troubleshooting: [
  {
    error: 'El job de producción en GitHub Actions no aparece como "waiting for approval"',
    cause: 'El Environment "produccion" no tiene "Required reviewers" configurados, o el job no usa la clave environment: correctamente.',
    fix: 'Verificá en Settings → Environments → produccion que hay al menos un reviewer agregado. En el workflow, asegurate de que el job tenga exactamente environment: produccion (el nombre debe coincidir exactamente, case-sensitive con el Environment configurado en GitHub).',
  },
  {
    error: 'El script vault-prod.sh no puede acceder a AWS Secrets Manager en el pipeline',
    cause: 'El role IAM asumido no tiene permisos secretsmanager:GetSecretValue, o el SecretId no existe en la región configurada.',
    fix: 'Verificá los permisos del role IAM: aws iam simulate-principal-policy --policy-source-arn arn:aws:iam::xxx:role/github-actions-deploy-prod --action-names secretsmanager:GetSecretValue --resource-arns arn:aws:secretsmanager:us-east-1:xxx:secret:ansible-vault-password-prod. Confirmá también la región con echo $AWS_DEFAULT_REGION en el step anterior.',
  },
  {
    error: 'ansible-lint falla en el pipeline pero pasa localmente',
    cause: 'Versión diferente de ansible-lint entre local y CI, o el perfil en CI es más estricto.',
    fix: 'Fijá la versión en el pipeline: pip install ansible-lint==6.22.0. Configurá el mismo .ansible-lint en la raíz del proyecto para que tanto CI como entorno local usen las mismas reglas. Ejecutá localmente con el mismo perfil: ansible-lint --profile=production.',
  },
],
  };
