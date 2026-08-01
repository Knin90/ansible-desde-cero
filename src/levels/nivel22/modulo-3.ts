import type { ModuleContent } from '../types';
import { nivel22Mod3StepsA } from './modulo-3-steps-a';
import { nivel22Mod3StepsB } from './modulo-3-steps-b';

export const nivel22Mod3: ModuleContent =   {
levelId: 22,
moduleId: 3,
title: 'Integración con DevOps y Pipelines CI/CD',
objective:
  'Integrar Ansible en flujos de trabajo DevOps modernos: GitOps, pipelines CI/CD, despliegue de herramientas de observabilidad y automatización de runbooks operacionales.',
duration: '5–6 horas',
objectives: [
  'Posicionar Ansible correctamente dentro del ciclo DevOps (dónde sí y dónde no usarlo)',
  'Implementar GitOps con Ansible: cambios de infraestructura mediante Pull Requests',
  'Integrar playbooks en pipelines de GitHub Actions y GitLab CI',
  'Automatizar notificaciones a Slack/Teams y runbooks operacionales',
],
prerequisites: [
  'Completar el Módulo 2 de Nivel 22 (Gestión de Certificados TLS)',
  'Conocer Ansible Vault para secretos (Nivel 16)',
  'Entender roles y colecciones (Nivel 14)',
],
steps: [...nivel22Mod3StepsA, ...nivel22Mod3StepsB],
quiz: [
  {
    question: '¿Cuál es el propósito del filtro `paths` en el trigger de GitHub Actions?',
    options: [
      'Limitar el deploy a ciertos servidores del inventario',
      'Evitar que el pipeline se dispare cuando solo cambian archivos irrelevantes (docs, README)',
      'Filtrar los hosts de Ansible por directorio',
      'Restringir qué usuarios pueden hacer push al repositorio',
    ],
    correctIndex: 1,
    explanation:
      'El filtro `paths` en GitHub Actions hace que el workflow solo se dispare cuando cambian archivos en los paths especificados. Sin este filtro, un cambio en el README dispararía un deploy completo, desperdiciando tiempo de pipeline y creando riesgo innecesario. Con el filtro, solo los cambios en playbooks, roles e inventarios disparan el deploy.',
  },
  {
    question: '¿Por qué se usa `delegate_to: localhost` y `run_once: true` en las notificaciones de Slack?',
    options: [
      'Porque Slack solo acepta conexiones desde localhost',
      'Para que Ansible se conecte a Slack directamente desde el nodo controlador, no desde cada host remoto',
      'Para que la notificación use el inventario local en lugar del remoto',
      'Porque el módulo community.general.slack no funciona en hosts remotos',
    ],
    correctIndex: 1,
    explanation:
      'delegate_to: localhost hace que la tarea se ejecute en el nodo controlador (tu máquina o el runner de CI) en lugar de en cada host remoto. run_once: true asegura que la notificación se envíe solo una vez, no una vez por cada host del inventario. Sin estos modificadores, recibirías una notificación de Slack por cada servidor en el playbook.',
  },
  {
    question: '¿Qué ventaja principal tiene convertir un runbook manual en un playbook Ansible?',
    options: [
      'Los playbooks son más fáciles de leer que los documentos en Confluence',
      'Ansible ejecuta más rápido que un humano siguiendo instrucciones',
      'El procedimiento se vuelve reproducible, auditable y no puede ser ejecutado incorrectamente por error humano',
      'Los playbooks se pueden ejecutar sin acceso SSH al servidor',
    ],
    correctIndex: 2,
    explanation:
      'La ventaja principal no es la velocidad sino la reproducibilidad y eliminación del error humano. Un runbook manual puede seguirse incorrectamente, saltarse pasos o interpretarse diferente por cada persona. Un playbook Ansible siempre ejecuta exactamente los mismos pasos en el mismo orden, con la misma configuración, y genera un log completo de lo que hizo y cuándo.',
  },
],
realWorldCase:
  'Un equipo de SRE en una startup de e-commerce tenía 47 runbooks documentados en Confluence. Cada incidente requería seguirlos manualmente, lo que tomaba entre 20 y 90 minutos. Convirtieron los 12 más frecuentes en playbooks Ansible disparados desde Slack con un bot (usando slash commands). El tiempo de respuesta a incidentes bajó de 45 minutos promedio a 8 minutos, y los errores de procedimiento desaparecieron completamente.',
troubleshooting: [
  {
    error: 'community.general.slack falla con "token invalid" aunque el token es correcto',
    cause:
      'El token de Slack cambió de formato: las versiones modernas usan tokens de Bot (xoxb-) mientras que los tokens legacy de Webhook tienen formato diferente. La colección community.general espera el formato correcto según la versión.',
    fix: 'Verificá el tipo de token: para Slack Apps modernas usá un Bot User OAuth Token (xoxb-). Para webhooks entrantes simples, usá el módulo community.general.slack con el parámetro `webhook` en lugar de `token`. Actualizá la colección: `ansible-galaxy collection install community.general --upgrade`.',
  },
  {
    error: 'GitHub Actions falla con "WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED" durante ansible-playbook',
    cause:
      'La clave SSH del host remoto cambió (típicamente después de recrear un servidor) y el archivo known_hosts en el runner de GitHub Actions tiene la clave anterior.',
    fix: 'Agregá `-o StrictHostKeyChecking=no` como variable de entorno ANSIBLE_SSH_EXTRA_ARGS en el workflow, o mejor: regenerá el known_hosts del runner después de recrear servidores. Para producción, usá `ansible_ssh_extra_args: "-o StrictHostKeyChecking=accept-new"` en el inventario, que acepta nuevas claves pero rechaza cambios sospechosos.',
  },
  {
    error: 'El playbook de CI/CD falla con "Vault password required" aunque se configuró --vault-password-file',
    cause:
      'El archivo de vault password se creó con un salto de línea al final (el comportamiento por defecto de echo en bash), o el path al archivo tiene espacios o caracteres especiales.',
    fix: 'Usá `printf` en lugar de `echo` para evitar el salto de línea: `printf "%s" "${{ secrets.ANSIBLE_VAULT_PASSWORD }}" > /tmp/.vault_pass`. Verificá que el path no tenga espacios. Alternativa: pasá la contraseña directamente con `--vault-password-file <(echo -n "$VAULT_PASS")` usando process substitution.',
  },
],
  };
