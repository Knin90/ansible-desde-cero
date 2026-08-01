import type { ModuleContent } from '../types';
import { nivel21Mod1StepsA } from './modulo-1-steps-a';
import { nivel21Mod1StepsB } from './modulo-1-steps-b';

export const nivel21Mod1: ModuleContent =   {
levelId: 21,
moduleId: 1,
title: 'Diseño de la infraestructura',
duration: '2 horas',
objective: 'Diseñar la estructura completa de un proyecto Ansible empresarial con inventario dinámico, vault por entorno y organización de roles.',
objectives: [
  'Diseñar la estructura de directorios de un proyecto Ansible de producción',
  'Configurar inventario dinámico con aws_ec2 o azure_rm',
  'Organizar group_vars y host_vars por entorno con vault IDs separados',
  'Implementar una estrategia de tags para despliegues selectivos',
],
prerequisites: [
  'Todos los niveles 0–20 completados',
  'Conocer roles, collections, vault y dynamic inventory (Niveles 10–17)',
],
steps: [...nivel21Mod1StepsA, ...nivel21Mod1StepsB],
glossary: [
  {
    term: 'Inventario dinámico',
    definition: 'Inventory plugin que consulta una fuente externa (AWS, Azure, GCP, Terraform state, etc.) en tiempo real para obtener la lista de hosts y sus variables. A diferencia del inventario estático, siempre refleja el estado actual de la infraestructura.',
  },
  {
    term: 'Vault ID',
    definition: 'Identificador que permite usar múltiples passwords de vault simultáneamente. El formato es "id@fuente" donde fuente puede ser un archivo, un script o la palabra "prompt". Permite tener passwords distintos para producción y staging en el mismo proyecto.',
  },
  {
    term: 'keyed_groups',
    definition: 'Opción de los inventory plugins dinámicos (aws_ec2, azure_rm, etc.) que crea grupos automáticamente basados en atributos de los hosts (tags, tipo de instancia, región). Evita tener que definir manualmente los grupos en un archivo estático.',
  },
  {
    term: 'compose',
    definition: 'Opción de los inventory plugins que permite definir variables para cada host usando expresiones Jinja2 sobre los atributos del host. Por ejemplo: ansible_host: private_ip_address genera la variable ansible_host con la IP privada del host.',
  },
  {
    term: 'vault_identity_list',
    definition: 'Opción de ansible.cfg que configura múltiples vault IDs con sus fuentes de password. Ansible prueba cada ID en orden hasta que uno consiga descifrar el secreto. Permite tener secretos de producción y staging en el mismo repositorio.',
  },
],
quiz: [
  {
    question: '¿Cuál es la ventaja principal del inventario dinámico sobre el estático en un entorno cloud?',
    options: [
      'El inventario dinámico es más rápido de ejecutar',
      'El inventario dinámico siempre refleja el estado actual de la infraestructura sin mantenimiento manual',
      'El inventario dinámico permite usar más variables por host',
      'El inventario dinámico no requiere credenciales del proveedor cloud',
    ],
    correctIndex: 1,
    explanation: 'En entornos cloud donde las instancias escalan y cambian constantemente, un inventario estático siempre estará desactualizado. El inventario dinámico consulta la API del proveedor (AWS, Azure, etc.) en tiempo real y siempre tiene la lista correcta de hosts, sus IPs, y sus atributos actuales.',
  },
  {
    question: '¿Para qué sirve la opción "keyed_groups" en un inventory plugin como aws_ec2?',
    options: [
      'Para ordenar los hosts por clave SSH',
      'Para crear grupos automáticamente basados en atributos de los hosts como tags o tipo de instancia',
      'Para encriptar las variables del inventario',
      'Para limitar la consulta a ciertos grupos de recursos',
    ],
    correctIndex: 1,
    explanation: 'keyed_groups crea grupos dinámicos basados en atributos de los hosts. Por ejemplo, con key: tags.Role y prefix: rol, una instancia con tag Role=webserver aparece automáticamente en el grupo "rol_webserver". Elimina la necesidad de mantener grupos manuales en el inventario.',
  },
  {
    question: '¿Cómo garantizás con vault IDs que los secretos de producción no se usen en staging?',
    options: [
      'Usando passwords distintos por entorno: los secretos de prod se cifran con @vault-prod y solo se descifran con ese password',
      'Guardando los vault.yml en directorios diferentes',
      'Usando ansible-vault encrypt con diferentes algoritmos de cifrado',
      'No es posible, vault usa el mismo password para todos los entornos',
    ],
    correctIndex: 0,
    explanation: 'Con vault IDs distintos (prod@script-prod.sh y staging@script-staging.sh), los secretos de producción se cifran con el password de producción y los de staging con el password de staging. Aunque ambos vault.yml estén en el repositorio, cada uno solo puede descifrarse con el ID correcto. Un operador que solo tiene el password de staging no puede descifrar los secretos de producción.',
  },
],
troubleshooting: [
  {
    error: 'El inventario dinámico de aws_ec2 no devuelve hosts',
    cause: 'Las credenciales AWS no están configuradas, el filtro de tags no coincide, o las instancias no están en estado "running".',
    fix: 'Ejecutá ansible-inventory --list y observá si hay error de autenticación. Verificá los filtros en aws_ec2.yml con AWS CLI: aws ec2 describe-instances --filters "Name=tag:Environment,Values=produccion" --query "Reservations[].Instances[].InstanceId"',
  },
  {
    error: 'ERROR: Decryption failed (no vault secrets would work for encryption found)',
    cause: 'El vault ID con el que se cifró el secreto no coincide con ninguno de los configurados en vault_identity_list.',
    fix: 'Verificá qué vault ID se usó para cifrar: ansible-vault view --vault-id prod@prompt archivo.yml. Si el archivo fue cifrado con un ID diferente, recífralo con el ID correcto o añadí el ID faltante a vault_identity_list en ansible.cfg.',
  },
  {
    error: 'Los hosts del inventario dinámico tienen IPs incorrectas (IPs públicas en lugar de privadas)',
    cause: 'El inventory plugin usa public_ip_address por defecto cuando hay IP pública disponible.',
    fix: 'Añadí en aws_ec2.yml la sección compose: con ansible_host: private_ip_address para forzar el uso de la IP privada. Asegurate de que el controller tenga acceso de red a esas IPs privadas (VPN, bastion host, etc.).',
  },
],
  };
