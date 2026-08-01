import type { ModuleContent } from '../types';
import { nivel18Mod2StepsA } from './modulo-2-steps-a';
import { nivel18Mod2StepsB } from './modulo-2-steps-b';

export const nivel18Mod2: ModuleContent =   {
levelId: 18,
moduleId: 2,
title: 'Kubernetes con Ansible',
objective:
  'Gestionar recursos de Kubernetes y charts de Helm usando Ansible: desde provisionar el clúster hasta desplegar Deployments, Services y ConfigMaps con kubernetes.core.',
duration: '3–4 horas',
objectives: [
  'Comprender por qué combinar Ansible y Kubernetes en el mismo pipeline',
  'Usar kubernetes.core.k8s para gestionar cualquier recurso de K8s de forma declarativa',
  'Desplegar y actualizar Helm charts con kubernetes.core.helm',
  'Generar manifiestos K8s dinámicos con templates Jinja2',
],
prerequisites: [
  'Módulo 1 de este nivel completado',
  'Conceptos básicos de Kubernetes (Pod, Deployment, Service, Namespace)',
  'kubectl instalado y clúster accesible (Minikube, Kind o clúster real)',
],
steps: [...nivel18Mod2StepsA, ...nivel18Mod2StepsB],
quiz: [
  {
    question:
      '¿En qué host se ejecutan los módulos de kubernetes.core por defecto?',
    options: [
      'En cada nodo worker del clúster Kubernetes',
      'En el nodo master del clúster',
      'En el control node de Ansible (localhost con connection: local)',
      'En el primer host del inventario de Ansible',
    ],
    correctIndex: 2,
    explanation:
      'Los módulos de <code>kubernetes.core</code> se ejecutan en el control node de Ansible (tu máquina o el servidor de CI), no en los nodos del clúster. Se comunican con la API de Kubernetes usando el kubeconfig disponible en el control node. Por eso se usa <code>hosts: localhost</code> y <code>connection: local</code>.',
  },
  {
    question:
      '¿Qué hace el parámetro <code>atomic: true</code> en kubernetes.core.helm?',
    options: [
      'Instala el chart en modo atómico usando transacciones SQL',
      'Hace rollback automático a la versión anterior si el despliegue falla',
      'Previene que otros procesos modifiquen el chart durante la instalación',
      'Fuerza la reinstalación completa en lugar de un upgrade incremental',
    ],
    correctIndex: 1,
    explanation:
      'El parámetro <code>atomic: true</code> en Helm significa que si el despliegue falla (los pods no pasan a estado Ready dentro del timeout), Helm hace automáticamente rollback a la release anterior. Es una red de seguridad esencial para producción: garantiza que un deploy fallido no deja el sistema en estado inconsistente.',
  },
  {
    question:
      '¿Cuál es la ventaja principal de usar templates Jinja2 para generar manifiestos K8s en lugar de tener múltiples carpetas de YAMLs por ambiente?',
    options: [
      'Los templates Jinja2 son más rápidos de procesar que YAML estático',
      'Kubernetes solo acepta manifiestos generados con Jinja2',
      'Un único conjunto de templates con variables por ambiente elimina la duplicación y el riesgo de inconsistencias entre ambientes',
      'Los templates permiten usar tipos de datos que YAML no soporta nativamente',
    ],
    correctIndex: 2,
    explanation:
      'Con templates Jinja2, tenés una única fuente de verdad para los manifiestos K8s. Las diferencias entre dev, staging y producción (réplicas, límites de recursos, imágenes) se controlan con variables de Ansible. Esto elimina el problema clásico de tener carpetas <code>k8s/dev/</code>, <code>k8s/staging/</code>, <code>k8s/prod/</code> que se sincronizan manualmente y acaban divergiendo.',
  },
],
realWorldCase:
  'Un equipo de plataforma usa Ansible para provisionar clústeres EKS con eksctl, configurar los namespaces y RBAC, instalar ingress-nginx y cert-manager con Helm, y finalmente desplegar 12 microservicios — todo en un único pipeline de GitLab CI que tarda 8 minutos de extremo a extremo.',
troubleshooting: [
  {
    error: 'No module named "kubernetes" — ImportError en el módulo k8s',
    cause:
      'El paquete Python <code>kubernetes</code> no está instalado en el control node. Este paquete es la dependencia obligatoria de <code>kubernetes.core</code> para comunicarse con la API de K8s.',
    fix: 'Ejecutá <code>pip install kubernetes openshift</code> en el control node. Si usás un virtualenv de Ansible, instalalo dentro del entorno: <code>pip install kubernetes>=26.1.0</code>. Verificá con <code>python -c "import kubernetes; print(kubernetes.__version__)"</code>.',
  },
  {
    error: 'FileNotFoundError: kubeconfig file not found at ~/.kube/config',
    cause:
      'No hay un kubeconfig disponible en el control node o la ruta por defecto no existe. Esto ocurre en entornos CI/CD donde el clúster no está configurado localmente.',
    fix: 'Usá el parámetro <code>kubeconfig: /ruta/al/kubeconfig</code> en el módulo, o la variable de entorno <code>K8S_AUTH_KUBECONFIG</code>. En CI, guardá el kubeconfig cifrado en Ansible Vault y copialo al control node antes de ejecutar el playbook.',
  },
  {
    error: 'Helm chart upgrade failed: timed out waiting for the condition',
    cause:
      'Los pods del chart no pasaron a estado Ready dentro del timeout configurado. Puede ser por resources insuficientes, imagen incorrecta, ConfigMap faltante o error en el liveness probe.',
    fix: 'Verificá los pods con <code>kubectl get pods -n &lt;namespace&gt;</code> y los logs con <code>kubectl logs &lt;pod-name&gt;</code>. Si usás <code>atomic: true</code>, Helm habrá hecho rollback automático. Ajustá el timeout con <code>wait_timeout: "10m"</code> o corregí el error en los recursos del chart.',
  },
],
  };
