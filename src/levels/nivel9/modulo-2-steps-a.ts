import type { StepContent } from '../types';

export const nivel9Mod2StepsA: StepContent[] = [
  {
    title: '¿Qué son los filtros y cómo funciona el pipe |?',
    body: `
      <p>Un <strong>filtro</strong> en Jinja2 es una función que transforma un valor. Se aplica con el operador <code>|</code> (pipe) entre el valor de entrada y el nombre del filtro.</p>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Pensá en los filtros como una tubería de producción: el valor entra por un extremo, pasa por cada filtro en orden, y sale transformado por el otro. Es igual que el pipe <code>|</code> en bash, pero para datos en lugar de comandos.</p>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">intro-filtros.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Introducción a filtros
  hosts: localhost
  vars:
texto: "  Hola Mundo  "
numero: "42"
lista: [3, 1, 4, 1, 5, 9, 2, 6]

  tasks:
# Filtro simple
- name: Trim + mayúsculas
  ansible.builtin.debug:
    msg: "{{ texto | trim | upper }}"
  # Output: "HOLA MUNDO"

# Cadena de filtros (pipes encadenados)
- name: Número como string
  ansible.builtin.debug:
    msg: "Tipo: {{ numero | int | type_debug }}"
  # Output: "Tipo: int"

# Filtros sobre listas
- name: Lista ordenada y única
  ansible.builtin.debug:
    msg: "{{ lista | sort | unique }}"
  # Output: [1, 2, 3, 4, 5, 6, 9]</code></pre>
      </div>
      <div class="highlight-box">
        <p><strong>Sintaxis:</strong> <code>{{ valor | filtro1 | filtro2(argumento) | filtro3 }}</code></p>
        <p>Los filtros se encadenan de izquierda a derecha. Algunos aceptan argumentos entre paréntesis.</p>
      </div>
    `
  },
  {
    title: 'Filtros de string',
    body: `
      <p>Los filtros de string permiten normalizar, transformar y manipular texto. Son especialmente útiles para construir nombres de archivos, URLs y configuraciones dinámicas.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">filtros-string.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Filtros de string en Ansible
  hosts: localhost
  vars:
nombre_app: "  Mi Aplicación Web  "
frase: "El servidor está CORRIENDO en producción"
csv_entornos: "dev,staging,prod"
partes: ["nginx", "1", "20", "2"]

  tasks:
# Normalización de espacios y capitalización
- name: "trim — eliminar espacios al inicio/final"
  ansible.builtin.debug:
    msg: "{{ nombre_app | trim }}"
  # "Mi Aplicación Web"

- name: "lower / upper / title — cambiar capitalización"
  ansible.builtin.debug:
    msg:
      - "lower: {{ nombre_app | trim | lower }}"
      - "upper: {{ nombre_app | trim | upper }}"
      - "title: {{ 'hola mundo' | title }}"
  # lower: "mi aplicación web"
  # upper: "MI APLICACIÓN WEB"
  # title: "Hola Mundo"

- name: "replace — reemplazar texto"
  ansible.builtin.debug:
    msg: "{{ frase | replace('CORRIENDO', 'activo') }}"
  # "El servidor está activo en producción"

- name: "split — string a lista"
  ansible.builtin.debug:
    msg: "{{ csv_entornos | split(',') }}"
  # ["dev", "staging", "prod"]

- name: "join — lista a string"
  ansible.builtin.debug:
    msg: "{{ partes | join('.') }}"
  # "nginx.1.20.2"

# Uso práctico: slug para nombre de directorio
- name: "Crear slug de la app"
  ansible.builtin.debug:
    msg: "{{ nombre_app | trim | lower | replace(' ', '-') }}"
  # "mi-aplicación-web"</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Patrón común:</strong> para crear nombres de directorios o slugs a partir de nombres con espacios, encadenás <code>trim | lower | replace(' ', '-')</code>. Es una combinación que usarás constantemente.</div>
      </div>
    `
  },
  {
    title: 'Filtros de lista',
    body: `
      <p>Los filtros de lista permiten transformar colecciones: ordenarlas, filtrar elementos, aplanar estructuras anidadas y seleccionar subconjuntos.</p>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">filtros-lista.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Filtros de lista
  hosts: localhost
  vars:
numeros: [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
servidores:
  - nombre: "web-01"
    activo: true
    puerto: 80
  - nombre: "web-02"
    activo: false
    puerto: 80
  - nombre: "api-01"
    activo: true
    puerto: 8080
lista_anidada: [[1, 2], [3, 4], [5, [6, 7]]]

  tasks:
- name: "sort / unique — ordenar y deduplicar"
  ansible.builtin.debug:
    msg:
      - "sort: {{ numeros | sort }}"
      - "unique: {{ numeros | unique }}"
      - "sort + unique: {{ numeros | sort | unique }}"

- name: "first / last — primer y último elemento"
  ansible.builtin.debug:
    msg:
      - "primero: {{ numeros | sort | first }}"
      - "último: {{ numeros | sort | last }}"

- name: "length — cantidad de elementos"
  ansible.builtin.debug:
    msg: "Total servidores: {{ servidores | length }}"

- name: "flatten — aplanar listas anidadas"
  ansible.builtin.debug:
    msg: "{{ lista_anidada | flatten }}"
  # [1, 2, 3, 4, 5, 6, 7]

# selectattr y rejectattr — filtrar por atributo de objeto
- name: "selectattr — sólo servidores activos"
  ansible.builtin.debug:
    msg: "{{ servidores | selectattr('activo', 'equalto', true) | list }}"

- name: "rejectattr — excluir servidores activos"
  ansible.builtin.debug:
    msg: "{{ servidores | rejectattr('activo', 'equalto', true) | list }}"

# map — extraer atributo de cada elemento
- name: "map — lista de nombres"
  ansible.builtin.debug:
    msg: "{{ servidores | map(attribute='nombre') | list }}"
  # ["web-01", "web-02", "api-01"]</code></pre>
      </div>
      <div class="warning-box">
        <span class="box-icon">⚠️</span>
        <div class="box-content"><strong>selectattr y map devuelven generadores:</strong> siempre añadí <code>| list</code> al final cuando usás <code>selectattr</code>, <code>rejectattr</code> o <code>map</code>. Sin <code>| list</code>, el resultado es un generador Python que puede causar comportamientos inesperados en Ansible.</div>
      </div>
    `
  }
];
