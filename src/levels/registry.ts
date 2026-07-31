export interface ModuleMeta {
  id: number;
  title: string;
  duration?: string;
}

export interface LevelMeta {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  duration?: string;
  modules: ModuleMeta[];
}

export const levelRegistry: LevelMeta[] = [
  {
    id: 0, title: 'Nivel 0', subtitle: 'Fundamentos Previos', badge: 'Requisito',
    duration: '1–2 semanas',
    modules: [
      { id: 1, title: 'Linux' },
      { id: 2, title: 'Redes' },
      { id: 3, title: 'YAML' },
      { id: 4, title: 'Python' },
    ]
  },
  {
    id: 1, title: 'Nivel 1', subtitle: 'Introducción a Ansible', badge: 'Principiante',
    duration: '1 semana',
    modules: [
      { id: 1, title: 'Historia y contexto' },
      { id: 2, title: 'Arquitectura general' },
      { id: 3, title: 'Características clave' },
      { id: 4, title: 'Instalación' },
      { id: 5, title: 'Primer comando' },
    ]
  },
  {
    id: 2, title: 'Nivel 2', subtitle: 'Arquitectura Interna', badge: 'Principiante+',
    modules: [
      { id: 1, title: 'Flujo interno completo' },
      { id: 2, title: 'Inventory Engine' },
      { id: 3, title: 'Strategy Plugin' },
      { id: 4, title: 'Action Plugins' },
      { id: 5, title: 'Callback Plugins' },
    ]
  },
  {
    id: 3, title: 'Nivel 3', subtitle: 'Inventarios', badge: 'Principiante+',
    modules: [
      { id: 1, title: 'Inventario estático INI' },
      { id: 2, title: 'Inventario estático YAML' },
      { id: 3, title: 'Inventario dinámico' },
      { id: 4, title: 'Variables de inventario' },
      { id: 5, title: 'Precedencia' },
    ]
  },
  {
    id: 4, title: 'Nivel 4', subtitle: 'Comandos CLI', badge: 'Intermedio',
    modules: [
      { id: 1, title: 'ansible' },
      { id: 2, title: 'ansible-playbook' },
      { id: 3, title: 'ansible-config' },
      { id: 4, title: 'ansible-doc' },
      { id: 5, title: 'ansible-galaxy' },
      { id: 6, title: 'ansible-vault' },
      { id: 7, title: 'ansible-pull' },
      { id: 8, title: 'ansible-inventory' },
      { id: 9, title: 'ansible-console' },
    ]
  },
  {
    id: 5, title: 'Nivel 5', subtitle: 'Playbooks en Profundidad', badge: 'Intermedio',
    modules: [
      { id: 1, title: 'Sintaxis YAML completa' },
      { id: 2, title: 'Tasks y Play' },
      { id: 3, title: 'Handlers y Notify' },
      { id: 4, title: 'Tags' },
      { id: 5, title: 'Loops' },
      { id: 6, title: 'Blocks, Rescue y Always' },
      { id: 7, title: 'Imports e Includes' },
    ]
  },
  {
    id: 6, title: 'Nivel 6', subtitle: 'Variables', badge: 'Intermedio',
    modules: [
      { id: 1, title: 'Tipos de variables' },
      { id: 2, title: 'Variables registradas' },
      { id: 3, title: 'Facts y Magic Variables' },
      { id: 4, title: 'Precedencia completa' },
    ]
  },
  {
    id: 7, title: 'Nivel 7', subtitle: 'Facts', badge: 'Intermedio',
    modules: [
      { id: 1, title: 'Módulo setup' },
      { id: 2, title: 'Custom Facts' },
      { id: 3, title: 'Fact Cache' },
    ]
  },
  {
    id: 8, title: 'Nivel 8', subtitle: 'Módulos', badge: 'Intermedio',
    modules: [
      { id: 1, title: 'Cómo funcionan los módulos' },
      { id: 2, title: 'Módulos de sistema' },
      { id: 3, title: 'Módulos de red y cloud' },
      { id: 4, title: 'Idempotencia y retorno JSON' },
    ]
  },
  {
    id: 9, title: 'Nivel 9', subtitle: 'Jinja2 Completo', badge: 'Intermedio',
    modules: [
      { id: 1, title: 'Variables y expresiones' },
      { id: 2, title: 'Filtros' },
      { id: 3, title: 'Tests y condicionales' },
      { id: 4, title: 'Macros e includes' },
    ]
  },
  {
    id: 10, title: 'Nivel 10', subtitle: 'Condicionales', badge: 'Intermedio',
    modules: [
      { id: 1, title: 'when' },
      { id: 2, title: 'failed_when / changed_when' },
      { id: 3, title: 'check_mode y assert' },
      { id: 4, title: 'until / retries / delay' },
    ]
  },
  {
    id: 11, title: 'Nivel 11', subtitle: 'Loops Avanzados', badge: 'Avanzado',
    modules: [
      { id: 1, title: 'loop básico' },
      { id: 2, title: 'dict2items y subelements' },
      { id: 3, title: 'product, zip y cartesian' },
      { id: 4, title: 'loop_control' },
    ]
  },
  {
    id: 12, title: 'Nivel 12', subtitle: 'Roles', badge: 'Avanzado',
    modules: [
      { id: 1, title: 'Estructura completa de un role' },
      { id: 2, title: 'Ansible Galaxy' },
      { id: 3, title: 'Dependencias entre roles' },
    ]
  },
  {
    id: 13, title: 'Nivel 13', subtitle: 'Plugins', badge: 'Avanzado',
    modules: [
      { id: 1, title: 'Action Plugins' },
      { id: 2, title: 'Lookup Plugins' },
      { id: 3, title: 'Filter Plugins' },
      { id: 4, title: 'Callback Plugins' },
      { id: 5, title: 'Inventory Plugins' },
    ]
  },
  {
    id: 14, title: 'Nivel 14', subtitle: 'Collections', badge: 'Avanzado',
    modules: [
      { id: 1, title: 'Qué son las collections' },
      { id: 2, title: 'Namespaces y versiones' },
      { id: 3, title: 'Crear una collection propia' },
    ]
  },
  {
    id: 15, title: 'Nivel 15', subtitle: 'Vault', badge: 'Avanzado',
    modules: [
      { id: 1, title: 'Encriptación básica' },
      { id: 2, title: 'Vault IDs y múltiples vaults' },
      { id: 3, title: 'Buenas prácticas de seguridad' },
    ]
  },
  {
    id: 16, title: 'Nivel 16', subtitle: 'Optimización', badge: 'Avanzado',
    modules: [
      { id: 1, title: 'SSH Multiplexing y Pipelining' },
      { id: 2, title: 'Forks y ejecución paralela' },
      { id: 3, title: 'Fact Cache' },
    ]
  },
  {
    id: 17, title: 'Nivel 17', subtitle: 'Testing', badge: 'Avanzado',
    modules: [
      { id: 1, title: 'Check Mode y Diff Mode' },
      { id: 2, title: 'Molecule' },
      { id: 3, title: 'Ansible Lint y yamllint' },
    ]
  },
  {
    id: 18, title: 'Nivel 18', subtitle: 'Automatización Empresarial', badge: 'Experto',
    modules: [
      { id: 1, title: 'Docker y Podman' },
      { id: 2, title: 'Kubernetes' },
      { id: 3, title: 'AWS, Azure y GCP' },
      { id: 4, title: 'VMware y Proxmox' },
    ]
  },
  {
    id: 19, title: 'Nivel 19', subtitle: 'Desarrollo Interno', badge: 'Experto',
    modules: [
      { id: 1, title: 'Crear módulos propios' },
      { id: 2, title: 'Crear plugins propios' },
      { id: 3, title: 'Collections propias' },
      { id: 4, title: 'Testing de módulos' },
    ]
  },
  {
    id: 20, title: 'Nivel 20', subtitle: 'Código Fuente de Ansible', badge: 'Experto',
    modules: [
      { id: 1, title: 'Estructura del repositorio' },
      { id: 2, title: 'Cómo interactúan los componentes' },
      { id: 3, title: 'Lectura del código fuente' },
    ]
  },
  {
    id: 21, title: 'Nivel 21', subtitle: 'Proyecto Integrador', badge: 'Experto',
    modules: [
      { id: 1, title: 'Diseño de la infraestructura' },
      { id: 2, title: 'Implementación completa' },
      { id: 3, title: 'CI/CD con Ansible' },
    ]
  },
  {
    id: 22, title: 'Nivel 22', subtitle: 'Casos Reales y Buenas Prácticas', badge: 'Experto',
    modules: [
      { id: 1, title: 'Hardening de Linux' },
      { id: 2, title: 'Gestión de certificados TLS' },
      { id: 3, title: 'Integración con DevOps' },
      { id: 4, title: 'Observabilidad y logging' },
    ]
  },
];
