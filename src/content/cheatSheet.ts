export interface CheatCommand {
  cmd: string;
  desc: string;
}

export interface CheatCategory {
  id: string;
  title: string;
  commands: CheatCommand[];
}

export const CHEAT_SHEET: CheatCategory[] = [
  {
    id: 'ansible',
    title: 'ansible — Comandos ad-hoc',
    commands: [
      { cmd: 'ansible all -m ping', desc: 'Verificar conectividad con todos los hosts' },
      { cmd: 'ansible all -m ping -vvv', desc: 'Verbose: ver el proceso SSH y Python completo' },
      { cmd: 'ansible all -m setup', desc: 'Recopilar todos los facts del sistema' },
      { cmd: 'ansible all -m setup -a "filter=ansible_distribution*"', desc: 'Facts filtrados por patrón' },
      { cmd: 'ansible webservers -m command -a "uptime"', desc: 'Ejecutar comando en grupo específico' },
      { cmd: 'ansible all -m package -a "name=nginx state=present" -b', desc: 'Instalar paquete (multi-distro)' },
      { cmd: 'ansible all -m service -a "name=nginx state=started enabled=true" -b', desc: 'Iniciar y habilitar servicio' },
      { cmd: 'ansible all -m user -a "name=deploy state=present groups=sudo" -b', desc: 'Crear usuario con grupo' },
      { cmd: 'ansible all -m copy -a "src=./config.conf dest=/etc/ mode=0644" -b', desc: 'Copiar archivo con permisos' },
      { cmd: 'ansible webservers -m shell -a "df -h | grep /dev/sd"', desc: 'Shell con pipes (cuando command no alcanza)' },
    ],
  },
  {
    id: 'ansible-playbook',
    title: 'ansible-playbook — Ejecución',
    commands: [
      { cmd: 'ansible-playbook site.yml', desc: 'Ejecutar playbook con inventario por defecto' },
      { cmd: 'ansible-playbook site.yml -i inventory/', desc: 'Inventario específico (directorio o archivo)' },
      { cmd: 'ansible-playbook site.yml --check', desc: 'Dry-run: ver qué cambiaría sin aplicar cambios' },
      { cmd: 'ansible-playbook site.yml --diff', desc: 'Mostrar diferencias en archivos modificados' },
      { cmd: 'ansible-playbook site.yml --check --diff', desc: 'Dry-run + mostrar diferencias (auditoría)' },
      { cmd: 'ansible-playbook site.yml --limit webservers', desc: 'Limitar ejecución a grupo o host específico' },
      { cmd: 'ansible-playbook site.yml --tags deploy', desc: 'Ejecutar solo tareas con este tag' },
      { cmd: 'ansible-playbook site.yml --skip-tags setup', desc: 'Saltar tareas con este tag' },
      { cmd: 'ansible-playbook site.yml -v / -vv / -vvv', desc: 'Nivel de verbose: info / detalle / debug SSH' },
      { cmd: 'ansible-playbook site.yml -e "env=prod version=2.1"', desc: 'Variables extra (máxima prioridad)' },
      { cmd: 'ansible-playbook site.yml --start-at-task "Instalar nginx"', desc: 'Continuar desde una tarea específica' },
      { cmd: 'ansible-playbook site.yml -K', desc: 'Pedir contraseña de sudo (become)' },
      { cmd: 'ansible-playbook site.yml --syntax-check', desc: 'Verificar sintaxis YAML sin ejecutar' },
      { cmd: 'ansible-playbook site.yml --list-tasks', desc: 'Listar tareas sin ejecutarlas' },
      { cmd: 'ansible-playbook site.yml --list-hosts', desc: 'Listar hosts afectados sin ejecutar' },
    ],
  },
  {
    id: 'ansible-vault',
    title: 'ansible-vault — Secretos',
    commands: [
      { cmd: 'ansible-vault create secrets.yml', desc: 'Crear nuevo archivo encriptado' },
      { cmd: 'ansible-vault edit secrets.yml', desc: 'Editar archivo encriptado en el editor' },
      { cmd: 'ansible-vault encrypt vars/secrets.yml', desc: 'Encriptar archivo existente en disco' },
      { cmd: 'ansible-vault decrypt vars/secrets.yml', desc: 'Desencriptar archivo (¡cuidado en producción!)' },
      { cmd: 'ansible-vault view secrets.yml', desc: 'Ver contenido sin desencriptar a disco' },
      { cmd: 'ansible-vault rekey secrets.yml', desc: 'Cambiar contraseña del vault' },
      { cmd: 'ansible-playbook site.yml --ask-vault-pass', desc: 'Pedir contraseña de vault interactivamente' },
      { cmd: 'ansible-playbook site.yml --vault-password-file .vault_pass', desc: 'Usar archivo de contraseña' },
      { cmd: 'ansible-vault encrypt_string "mi_password" --name db_pass', desc: 'Encriptar string inline para vars' },
    ],
  },
  {
    id: 'ansible-galaxy',
    title: 'ansible-galaxy — Roles y Collections',
    commands: [
      { cmd: 'ansible-galaxy role install geerlingguy.nginx', desc: 'Instalar rol desde Galaxy' },
      { cmd: 'ansible-galaxy collection install community.general', desc: 'Instalar collection' },
      { cmd: 'ansible-galaxy collection install community.general:>=7.0', desc: 'Instalar versión específica' },
      { cmd: 'ansible-galaxy role install -r requirements.yml', desc: 'Instalar desde archivo requirements' },
      { cmd: 'ansible-galaxy role init mi_empresa.nginx', desc: 'Crear estructura de rol nuevo' },
      { cmd: 'ansible-galaxy list', desc: 'Listar roles instalados localmente' },
      { cmd: 'ansible-galaxy collection list', desc: 'Listar collections instaladas' },
    ],
  },
  {
    id: 'ansible-inventory',
    title: 'ansible-inventory — Inspección',
    commands: [
      { cmd: 'ansible-inventory --list', desc: 'Ver inventario completo como JSON' },
      { cmd: 'ansible-inventory --graph', desc: 'Ver árbol jerárquico de grupos y hosts' },
      { cmd: 'ansible-inventory --host web1.ejemplo.com', desc: 'Ver variables de un host específico' },
      { cmd: 'ansible-inventory -i inventory/ --list', desc: 'Inventario desde directorio específico' },
    ],
  },
  {
    id: 'ansible-doc',
    title: 'ansible-doc — Documentación',
    commands: [
      { cmd: 'ansible-doc ansible.builtin.copy', desc: 'Documentación completa del módulo copy' },
      { cmd: 'ansible-doc --snippet ansible.builtin.copy', desc: 'Ejemplo de uso mínimo del módulo' },
      { cmd: 'ansible-doc -l', desc: 'Listar todos los módulos disponibles' },
      { cmd: 'ansible-doc -l | grep aws', desc: 'Filtrar módulos por keyword' },
      { cmd: 'ansible-doc -t callback -l', desc: 'Listar plugins de tipo callback' },
      { cmd: 'ansible-doc -t lookup -l', desc: 'Listar plugins de tipo lookup' },
    ],
  },
];
