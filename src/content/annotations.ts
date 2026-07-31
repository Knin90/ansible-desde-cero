/**
 * annotations.ts
 * Typed annotation data for the two annotated code snippets shown in section 5.
 * Each snippet has a unique id, a Spanish title, the raw code, and per-line
 * Spanish annotations keyed by 1-based line number.
 */

/** Maps a 1-based line number to a Spanish explanation string. */
export interface AnnotationMap {
  [lineNumber: number]: string;
}

/** A single annotated code snippet shown in section 5. */
export interface CodeSnippet {
  /** Unique identifier used as the HTML element id: snippet-{id}. */
  id: string;
  /** Display title shown above the code block (Spanish). */
  title: string;
  /** PrismJS language identifier, e.g. "yaml", "bash". */
  language: string;
  /** Raw source code string. */
  code: string;
  /** Per-line annotations; keys are 1-based line numbers. */
  annotations: AnnotationMap;
}

/**
 * Snippet 1 — Playbook básico
 * Illustrates a complete play targeting a host group with vars and two tasks.
 */
const playbookBasico: CodeSnippet = {
  id: 'playbook-basico',
  title: 'Playbook básico',
  language: 'yaml',
  code: `---
- name: Configurar servidor web
  hosts: servidores_web
  become: true
  vars:
    puerto_http: 80
  tasks:
    - name: Instalar nginx
      ansible.builtin.package:
        name: nginx
        state: present
    - name: Iniciar servicio nginx
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true`,
  annotations: {
    1: 'Separador YAML obligatorio que indica el inicio de un documento. En Ansible marca el comienzo del playbook.',
    2: 'El nombre descriptivo del play. Aparece en la salida cuando Ansible ejecuta el playbook.',
    3: "Define qué hosts del inventory recibirán las tareas. 'servidores_web' es un grupo definido en hosts.ini.",
    4: 'Indica que las tareas se ejecutarán con privilegios de superusuario (sudo). Equivale a sudo su en la terminal.',
    5: 'Bloque de variables locales al play. Tienen mayor prioridad que defaults/ pero menor que las variables extra (-e).',
    6: "Variable 'puerto_http' con valor 80. Se puede usar en templates como {{ puerto_http }}.",
    7: 'Lista de tareas que se ejecutarán en orden en cada host del grupo.',
    8: 'Nombre descriptivo de la tarea. Ansible lo muestra durante la ejecución y lo usa para el control de idempotencia.',
    9: 'Módulo de Ansible para gestionar paquetes. ansible.builtin.package es el nombre completamente calificado (FQCN).',
    10: "Nombre del paquete a instalar. En sistemas Debian se instala 'nginx'; en RedHat también.",
    11: "Estado deseado del paquete. 'present' significa que debe estar instalado. Si ya lo está, Ansible no hace nada (idempotente).",
    12: 'Segunda tarea: iniciar el servicio nginx después de instalarlo.',
    13: 'Módulo ansible.builtin.service para gestionar servicios del sistema operativo.',
    14: 'Nombre del servicio a gestionar. Debe coincidir con el nombre del servicio en el SO.',
    15: "Estado deseado del servicio. 'started' asegura que esté corriendo.",
    16: 'Habilita el servicio para que arranque automáticamente cuando el servidor se reinicie.',
  },
};

/**
 * Snippet 2 — Role task con template
 * Illustrates a tasks/main.yml inside a role that copies a Jinja2 template
 * and opens a firewall port using firewalld.
 */
const roleTaskTemplate: CodeSnippet = {
  id: 'role-task-template',
  title: 'Role: task con template y firewall',
  language: 'yaml',
  code: `---
- name: Copiar configuración de nginx
  ansible.builtin.template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
    owner: root
    group: root
    mode: '0644'
  notify: Reiniciar nginx

- name: Asegurar que el puerto está abierto
  ansible.builtin.firewalld:
    port: "{{ puerto_http }}/tcp"
    permanent: true
    state: enabled
    immediate: true`,
  annotations: {
    1: 'Inicio del documento YAML. Este archivo es tasks/main.yml dentro del role servidor_web.',
    2: 'Tarea que copia y procesa un template Jinja2 al servidor remoto.',
    3: 'Módulo template: lee un archivo .j2 de la carpeta templates/, reemplaza variables Jinja2, y lo deposita en el destino.',
    4: 'Archivo fuente en templates/nginx.conf.j2 (relativo al role). Ansible lo busca automáticamente en esa carpeta.',
    5: 'Ruta absoluta en el servidor remoto donde se copiará el archivo procesado.',
    6: "Propietario del archivo en el servidor. 'root' garantiza que solo root puede modificarlo.",
    7: 'Grupo del archivo. En este caso también root.',
    8: 'Permisos del archivo en notación octal. 0644 = rw-r--r-- (lectura para todos, escritura solo para root).',
    9: "Dispara el handler 'Reiniciar nginx' si esta tarea produce algún cambio. Los handlers se ejecutan al final del play.",
    10: 'Línea vacía para separar visualmente las tareas. No tiene efecto en Ansible.',
    11: 'Segunda tarea: abre el puerto HTTP en el firewall usando firewalld.',
    12: 'Módulo firewalld para gestionar reglas de firewall en sistemas RedHat/Fedora/CentOS.',
    13: 'Puerto a abrir, usando la variable {{ puerto_http }} definida en vars/. El /tcp especifica el protocolo.',
    14: 'Hace la regla permanente (persiste tras reinicios del firewall).',
    15: 'Estado deseado: la regla debe estar habilitada.',
    16: 'Aplica la regla inmediatamente sin necesidad de reiniciar firewalld.',
  },
};

/** All annotated snippets rendered in section 5. */
export const snippets: CodeSnippet[] = [playbookBasico, roleTaskTemplate];
