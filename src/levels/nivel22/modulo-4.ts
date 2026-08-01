import type { ModuleContent } from '../types';
import { nivel22Mod4StepsA } from './modulo-4-steps-a';
import { nivel22Mod4StepsB } from './modulo-4-steps-b';


export const nivel22Mod4: ModuleContent =   {
levelId: 22,
moduleId: 4,
title: 'Observabilidad y Logging con Ansible',
objective:
  'Desplegar y configurar un stack completo de observabilidad (métricas, logs, alertas) usando Ansible, incluyendo Prometheus, Grafana, Loki y Alertmanager, con integración de callback plugins para métricas de los propios playbooks.',
duration: '5–6 horas',
objectives: [
  'Desplegar el stack Prometheus completo (prometheus, node_exporter, alertmanager) con Ansible',
  'Instalar y configurar Grafana con dashboards provisionados automáticamente',
  'Implementar logging centralizado con Loki y Promtail mediante Ansible',
  'Configurar reglas de alerting en Alertmanager usando templates Jinja2',
],
prerequisites: [
  'Completar el Módulo 3 de Nivel 22 (Integración con DevOps)',
  'Conocer ansible.builtin.template y Jinja2 avanzado (Nivel 8)',
  'Entender el módulo ansible.builtin.uri para health checks',
],
  steps: [...nivel22Mod4StepsA, ...nivel22Mod4StepsB],
quiz: [
  {
    question: '¿Por qué Loki es más eficiente en almacenamiento que Elasticsearch para logs?',
    options: [
      'Porque Loki comprime los logs con un algoritmo más eficiente',
      'Porque Loki solo indexa las etiquetas (labels), no el contenido completo de los logs',
      'Porque Loki elimina automáticamente los logs duplicados',
      'Porque Loki usa una base de datos relacional que es más compacta',
    ],
    correctIndex: 1,
    explanation:
      'Elasticsearch indexa cada palabra de cada log para permitir búsquedas de texto completo, lo que requiere mucho espacio. Loki solo indexa las etiquetas (host, job, environment, etc.) que asignás a cada stream de logs. El contenido de los logs se almacena comprimido sin indexar. Las búsquedas usan filtros de etiquetas primero y luego buscan en el texto comprimido, siendo menos flexible pero mucho más eficiente en costo.',
  },
  {
    question: '¿Qué hace el parámetro `validate` en el módulo ansible.builtin.template?',
    options: [
      'Valida que el archivo de template Jinja2 tenga sintaxis correcta antes de renderizarlo',
      'Ejecuta un comando externo sobre el archivo generado antes de copiarlo al destino final, fallando si el comando retorna un error',
      'Verifica que las variables Jinja2 usadas en el template estén definidas en el inventario',
      'Comprueba que el archivo de destino no haya sido modificado manualmente',
    ],
    correctIndex: 1,
    explanation:
      'El parámetro `validate` en template (y copy) recibe un comando con %s como placeholder para el path del archivo temporal. Ansible renderiza el template a un archivo temporal, ejecuta el comando de validación sobre ese archivo, y solo si el comando retorna código 0 copia el archivo al destino final. Esto previene que una configuración inválida (ej: prometheus.yml con sintaxis incorrecta) reemplace la configuración actual y rompa el servicio.',
  },
  {
    question: '¿Cuál es el propósito del textfile collector de node_exporter?',
    options: [
      'Exportar logs de texto plano a Prometheus',
      'Parsear archivos de configuración y convertirlos en métricas',
      'Permitir que scripts y herramientas externas exporten métricas custom a Prometheus escribiendo archivos .prom',
      'Generar reportes de métricas en formato de texto para enviar por email',
    ],
    correctIndex: 2,
    explanation:
      'El textfile collector de node_exporter monitorea un directorio (generalmente /var/lib/node_exporter/textfile_collector/) y cuando encuentra archivos .prom con el formato Prometheus exposition format, los expone como métricas. Esto permite que cualquier script, playbook o herramienta exporte métricas custom sin necesidad de un exporter dedicado. Los archivos .prom son texto plano con el formato `metric_name{labels} valor`.',
  },
],
realWorldCase:
  'Una empresa de logística con 300 servidores distribuidos en 3 regiones no tenía visibilidad centralizada: cada equipo tenía sus propios dashboards desconectados y las alertas llegaban tarde o directamente no llegaban. Implementaron el stack Prometheus+Grafana+Loki con Ansible en un sprint de 2 semanas. En el primer mes detectaron y resolvieron 12 incidentes antes de que impactaran a usuarios finales. El MTTR (tiempo medio de resolución) bajó de 4.5 horas a 35 minutos gracias a tener logs y métricas correlacionados en Grafana.',
troubleshooting: [
  {
    error: 'Prometheus falla con "INVALID: /etc/prometheus/prometheus.yml: error parsing YAML file"',
    cause:
      'La plantilla Jinja2 genera YAML inválido, típicamente por indentación incorrecta en loops o por variables con caracteres especiales que no se escapan correctamente.',
    fix: 'Usá el parámetro `validate: /usr/local/bin/promtool check config %s` en el módulo template para detectar el error antes de copiar el archivo. Para depurar, usá `ansible-playbook --check -vvv` y buscá el archivo temporal generado en /tmp. Prestá especial atención a la indentación dentro de bloques `{% for %}` en la plantilla.',
  },
  {
    error: 'Grafana muestra "datasource not found" aunque el provisioning file existe',
    cause:
      'El archivo de datasource tiene permisos incorrectos (Grafana no puede leerlo), o el nombre del datasource en el dashboard JSON no coincide exactamente con el name definido en el provisioning file.',
    fix: 'Verificá permisos: los archivos en /etc/grafana/provisioning/ deben ser propiedad de grafana:grafana con permisos 640. Comprobá que el campo "uid" o "name" en el datasource provisioning coincida exactamente con el usado en los dashboards JSON. Revisá los logs de Grafana: `journalctl -u grafana-server -n 50`.',
  },
  {
    error: 'Alertmanager no envía alertas a Slack aunque las reglas están disparadas en Prometheus',
    cause:
      'El webhook URL de Slack está incorrecto o expiró, las rutas de Alertmanager no coinciden con las labels de las alertas, o hay un inhibition rule que silencia las alertas.',
    fix: 'Verificá el webhook con curl: `curl -X POST -H "Content-type: application/json" --data \'{"text":"test"}\' YOUR_WEBHOOK_URL`. Revisá el status de Alertmanager en http://alertmanager:9093/api/v2/alerts para ver qué alertas están activas. Verificá que no haya silences activos en la UI de Alertmanager. Comprobá que las labels de las alertas coincidan con los matchers de las rutas.',
  },
],
};
