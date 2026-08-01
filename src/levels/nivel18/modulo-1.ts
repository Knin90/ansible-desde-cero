import type { ModuleContent } from '../types';
import { nivel18Mod1StepsA } from './modulo-1-steps-a';
import { nivel18Mod1StepsB } from './modulo-1-steps-b';

export const nivel18Mod1: ModuleContent =   {
levelId: 18,
moduleId: 1,
title: 'Docker y Podman con Ansible',
objective:
  'Gestionar contenedores Docker y Podman a escala usando Ansible: instalación, despliegue, actualización y orquestación de stacks completos con community.docker y containers.podman.',
duration: '3–4 horas',
objectives: [
  'Entender por qué Ansible supera a docker-compose para gestión de flotas de contenedores',
  'Instalar la colección community.docker y Docker Engine mediante Ansible',
  'Desplegar, actualizar y eliminar contenedores con docker_container y docker_compose_v2',
  'Gestionar contenedores rootless con Podman usando containers.podman',
],
prerequisites: [
  'Niveles 0–17 completados',
  'Conceptos básicos de Docker (imágenes, contenedores, redes, volúmenes)',
  'Control node con Python 3.8+ y acceso a hosts objetivo',
],
steps: [...nivel18Mod1StepsA, ...nivel18Mod1StepsB],
quiz: [
  {
    question:
      '¿Cuál es la principal ventaja de usar Ansible en lugar de docker-compose para gestionar contenedores en producción?',
    options: [
      'Ansible es más rápido que docker-compose para iniciar contenedores',
      'Ansible permite gestionar flotas de múltiples hosts con variables por ambiente de forma uniforme',
      'docker-compose no soporta volúmenes persistentes',
      'Ansible no requiere instalar Docker en el host',
    ],
    correctIndex: 1,
    explanation:
      'La ventaja clave de Ansible sobre docker-compose es la gestión de flotas: el mismo playbook puede desplegar stacks en decenas de hosts con variables diferentes por ambiente (dev/staging/prod). docker-compose es excelente para un solo host, pero no escala a infraestructuras múltiples.',
  },
  {
    question:
      '¿Qué parámetro del módulo docker_container garantiza que siempre se descargue la última versión de la imagen antes de comparar?',
    options: [
      'state: latest',
      'update: always',
      'pull: always',
      'image_force: true',
    ],
    correctIndex: 2,
    explanation:
      'El parámetro <code>pull: always</code> en <code>community.docker.docker_container</code> fuerza un <code>docker pull</code> antes de verificar si el contenedor necesita recrearse. Sin este parámetro, Ansible usa la imagen local aunque exista una versión más nueva en el registro.',
  },
  {
    question:
      '¿Por qué los contenedores Podman rootless son más seguros que los contenedores Docker estándar?',
    options: [
      'Podman usa cifrado TLS para todas las comunicaciones entre contenedores',
      'Podman no permite montar volúmenes del host',
      'Los contenedores rootless corren con el UID del usuario, no como root del sistema',
      'Podman utiliza namespaces diferentes que Docker',
    ],
    correctIndex: 2,
    explanation:
      'Los contenedores Podman rootless se ejecutan mapeados al UID del usuario que los inicia. Si un atacante compromete el contenedor y escapa al host, obtiene los permisos del usuario normal — no de root. Esto reduce drásticamente el impacto de una brecha de seguridad en comparación con Docker, donde el daemon corre como root.',
  },
],
realWorldCase:
  'Una empresa de SaaS migra su pipeline de despliegue de scripts bash + docker-compose a Ansible: un único playbook instala Docker Engine, configura el firewall, despliega el stack de 6 servicios con secrets cifrados con Vault y verifica healthchecks — eliminando inconsistencias entre 30 servidores de producción.',
troubleshooting: [
  {
    error: 'ModuleNotFoundError: No module named "docker"',
    cause:
      'El SDK de Python de Docker no está instalado en el control node. Ansible necesita este paquete para comunicarse con el daemon Docker del host remoto.',
    fix: 'Ejecutá <code>pip install docker</code> en el control node. Si usás un virtualenv de Ansible, asegurate de instalarlo dentro del entorno virtual: <code>pip install docker docker-compose</code>.',
  },
  {
    error: 'community.docker not found — colección no instalada',
    cause:
      'La colección <code>community.docker</code> no está instalada en el control node o no está en el <code>ANSIBLE_COLLECTIONS_PATH</code>.',
    fix: 'Instalá la colección con <code>ansible-galaxy collection install community.docker</code>. Para proyectos, definila en <code>requirements.yml</code> y ejecutá <code>ansible-galaxy collection install -r requirements.yml</code> en CI.',
  },
  {
    error: 'Got permission denied while trying to connect to the Docker daemon socket',
    cause:
      'El usuario remoto no tiene permisos para acceder al socket Docker. Esto ocurre cuando el usuario no está en el grupo <code>docker</code> o la sesión no se reinició después de agregarlo.',
    fix: 'Agregá <code>become: true</code> en las tareas Docker, o asegurate de que el usuario esté en el grupo docker (<code>usermod -aG docker usuario</code>) y que haya iniciado una nueva sesión SSH. Verificá con <code>docker info</code> en el host.',
  },
],
  };
