# Ansible Course — Documentación del Proyecto

## Visión General

SPA interactiva para aprender Ansible desde cero hasta nivel experto. 23 niveles progresivos con 70+ módulos, diagramas SVG animados, resaltado de sintaxis, navegación por hash y soporte de tema claro/oscuro.

Construido con Vite 6 + TypeScript puro, sin frameworks de UI. El contenido está hardcodeado en TypeScript como datos estructurados (no CMS, no Markdown externo).

Cada módulo incluye: objetivo, tiempo estimado, prerequisitos, glosario contextual con tooltips, mini cuestionario, casos reales, sección de troubleshooting y laboratorio práctico.

---

## Stack Técnico

| Categoría | Tecnología |
|---|---|
| Build | Vite 6 |
| Lenguaje | TypeScript 5 (`strict`, `noUnusedLocals`, `exactOptionalPropertyTypes`) |
| Highlight | PrismJS (carga dinámica: yaml, bash, python, ini, json) |
| Íconos | Material Symbols Outlined (Google Fonts) + `reicon` |
| Tests | Vitest 4 + jsdom |
| Target JS | ES2020 |
| Module resolution | `bundler` |

Sin React, Vue, Angular ni ningún framework. Toda la UI se construye con DOM imperativo.

---

## Estructura de Directorios

```
src/
├── main.ts                     # Entry point: tema, sidebar, tooltip, routing
├── router.ts                   # Hash router (getCurrentRoute, navigate, getPrevNext)
├── sidebar.ts                  # Sidebar: nav tree, búsqueda, toggle, active state
├── tooltip.ts                  # Tooltips globales
│
├── components/
│   ├── contentRouter.ts        # Switch que mapea (level, module) → ModuleContent
│   ├── ModuleRenderer.ts       # Renderiza módulo completo, diagramas y copy buttons
│   └── contentRouter.test.ts
│
├── levels/
│   ├── types.ts                # Interfaces: StepContent, ModuleContent, LevelMeta, ModuleMeta
│   ├── registry.ts             # levelRegistry: metadatos de todos los niveles y módulos
│   ├── nivel0.ts               # Fundamentos Previos (4 módulos, ~2000 líneas)
│   ├── nivel1.ts               # Introducción a Ansible (5 módulos, ~2200 líneas)
│   ├── nivel2.ts               # Arquitectura Interna (5 módulos, ~2400 líneas)
│   ├── nivel3.ts               # Inventarios (5 módulos, ~2300 líneas)
│   ├── nivel4.ts               # Comandos CLI (9 módulos, ~3500 líneas)
│   ├── nivel5.ts               # Playbooks en Profundidad (7 módulos, ~3200 líneas)
│   ├── nivel6to22.ts           # Niveles 6–22 (~10000 líneas, niveles 9/17/18/22 completos)
│   └── registry.test.ts
│
├── content/
│   ├── cheatSheet.ts           # Datos del Cheat Sheet (6 categorías)
│   └── snippets.ts             # Biblioteca de snippets (6 categorías)
│
├── diagrams/
│   ├── DiagramEngine.ts        # Base class para diagramas SVG
│   ├── nivel0/yaml-diagram.ts
│   ├── nivel1/arquitectura-diagram.ts
│   ├── nivel2/flujo-interno-diagram.ts
│   ├── nivel3/inventario-diagram.ts
│   └── nivel5/playbook-diagram.ts
│
├── utils/
│   ├── icons.ts                # Constantes SVG/Material Symbols
│   ├── sanitizeBadge.ts        # Normaliza badge string a clase CSS válida
│   └── sanitizeBadge.test.ts
│
└── styles/
    ├── theme.css               # Variables CSS: colores dark/light, tipografía, spacing
    ├── layout.css              # Layout general: sidebar + content
    ├── sidebar.css             # Sidebar: brand, nav tree, search, toggle, badges
    ├── module.css              # Hero del módulo, steps, progress bar, nav buttons
    ├── code.css                # Code blocks: titlebar, dots MacOS, copy button
    ├── diagram.css             # Contenedor de diagramas SVG
    └── animations.css          # Scroll reveal, transiciones
```

---

## Arquitectura

### Routing

Hash-based. El formato es `#nivel-{N}/modulo-{M}`.

```
window.location.hash → getCurrentRoute() → { level, module }
                     ↓
             onRouteChange(callback)
                     ↓
         ModuleRenderer.render(level, module)
```

`getPrevNext()` construye una lista plana de todos los pares `[nivel, módulo]` desde `levelRegistry` y devuelve el par anterior y siguiente con disponibilidad de contenido.

Páginas especiales (`cheat-sheet`, `snippets`) se detectan en `getCurrentRoute()` y renderizan a través de `SPECIAL_PAGES` map en el router.

### Contenido

```
getModuleContent(level, module)
  → switch(level) 0–5: arrays importados directamente
  → default (6–22): getNivel6to22Content(level, module)
  → ModuleContent | undefined
```

`ModuleContent` incluye:

| Campo | Tipo | Descripción |
|---|---|---|
| `levelId` / `moduleId` | number | Identificadores |
| `title` | string | Título del módulo |
| `objective` | string | Objetivo principal |
| `duration` | string | Tiempo estimado (ej. "2–3 horas") |
| `objectives` | string[] | Lista de objetivos específicos |
| `prerequisites` | string[] | Prerequisitos del módulo |
| `steps` | StepContent[] | Pasos con `title` y `body` (HTML) |
| `glossary` | GlossaryTerm[] | Términos con tooltip |
| `quiz` | QuizQuestion[] | Mini cuestionario con opciones |
| `troubleshooting` | TroubleshootingItem[] | Errores comunes + causa + solución |

El `body` de cada step puede contener HTML con code blocks, cajas pedagógicas (`analogy-box`, `tip-box`, `warning-box`, `challenge-box`, `tech-term-box`, `lab-box`) y elementos interactivos.

### Renderizado

`ModuleRenderer` es una clase que toma `#module-content` del DOM en su constructor y escucha clics delegados (copy + navegación). El método `render()` hace:

1. Llama `ensurePrism()` (carga lazy)
2. Busca metadata en `levelRegistry`
3. Llama `getModuleContent()`
4. Llama `renderModule()` → inyecta HTML completo (hero, prerequisitos, steps, glosario, quiz, troubleshooting)
5. Llama `renderDiagram()` → monta SVG si aplica
6. Llama `injectCopyButtons()` → agrega botones en `.code-block-titlebar`
7. Scroll to top
8. `highlightAll()` con Prism
9. `initScrollReveal()` con IntersectionObserver

### Diagramas SVG

Cada diagrama extiende `DiagramEngine` e implementa `render()`. Se montan en `#diagram-slot` dentro del contenido. Hay 5 diagramas disponibles:

| Nivel | Módulo | Diagrama |
|---|---|---|
| 0 | 3 | YAML structure |
| 1 | 2 | Arquitectura Ansible |
| 2 | 1 | Flujo interno completo |
| 3 | 1 | Inventario diagram |
| 5 | 2 | Playbook flow |

### Sidebar

Construida dinámicamente desde `levelRegistry`. Oculta por defecto — se abre/cierra con el botón ≡ del top bar. Soporta:

- Apertura/cierre con animación `transform: translateX` en todos los viewports
- Expansión/colapso por nivel (toggle de `.level-group`)
- Búsqueda en tiempo real filtrando `.module-item`
- Estado activo sincronizado con el hash
- Backdrop con cierre al hacer clic (mobile y desktop)

### Tema

Dos temas: `dark` (default) y `light`. Se aplican como clase en `<html>`. Persiste en `localStorage`. El toggle está en el top bar.

---

## Datos del Curso

### Niveles y Badges

| Nivel | Subtítulo | Badge | Estado |
|---|---|---|---|
| 0 | Fundamentos Previos | Requisito | Completo |
| 1 | Introducción a Ansible | Principiante | Completo |
| 2 | Arquitectura Interna | Principiante+ | Completo |
| 3 | Inventarios | Principiante+ | Completo |
| 4 | Comandos CLI | Intermedio | Completo |
| 5 | Playbooks en Profundidad | Intermedio | Completo |
| 6 | Variables | Intermedio | Básico |
| 7 | Facts | Intermedio | Básico |
| 8 | Módulos | Intermedio | Básico |
| 9 | Jinja2 Completo | Intermedio | Completo |
| 10 | Condicionales | Intermedio | Básico |
| 11 | Loops Avanzados | Avanzado | Básico |
| 12 | Roles | Avanzado | Básico |
| 13 | Plugins | Avanzado | Básico |
| 14 | Collections | Avanzado | Básico |
| 15 | Vault | Avanzado | Básico |
| 16 | Optimización | Avanzado | Básico |
| 17 | Testing y CI/CD | Avanzado | Completo |
| 18 | Docker y Contenedores | Experto | Completo |
| 19 | Desarrollo Interno | Experto | Básico |
| 20 | Código Fuente de Ansible | Experto | Básico |
| 21 | Proyecto Integrador | Experto | Básico |
| 22 | Hardening y Buenas Prácticas | Experto | Completo |

**Completo**: módulos con todas las cajas pedagógicas, quiz, troubleshooting y labs.  
**Básico**: estructura presente, contenido a expandir.

---

## Testing

Runner: Vitest 4 con entorno jsdom.

| Archivo | Qué cubre |
|---|---|
| `src/router.test.ts` | `getCurrentRoute`, `navigate`, `getPrevNext` |
| `src/levels/registry.test.ts` | Integridad de `levelRegistry` |
| `src/components/contentRouter.test.ts` | `getModuleContent` para todos los niveles |
| `src/utils/sanitizeBadge.test.ts` | Sanitización de badges |

```bash
npm test          # vitest run (una vez)
npm run test:watch  # vitest en modo watch
```

---

## Scripts

```bash
npm run dev       # Vite dev server
npm run build     # Build de producción → dist/
npm run preview   # Preview del build
npm test          # Vitest run
npm run test:watch
```

---

## Convenciones

- **Sin frameworks**: todo DOM imperativo.
- **Sin dependencias runtime** salvo `prismjs` (lazy) y `reicon` (íconos).
- **Contenido en TS**: los módulos son arrays de `ModuleContent`. El `body` de cada step puede tener HTML con code blocks pre-formateados y cajas pedagógicas.
- **CSS variables**: todos los colores, tamaños y breakpoints viven en `theme.css`.
- **Hash routing**: no hay server-side routing. La URL siempre es `index.html#nivel-N/modulo-M`.
- **Scroll to top**: `ModuleRenderer.render()` hace scroll to top en `#content` al cambiar de módulo.
- **Copy buttons**: se inyectan dinámicamente buscando `.code-block-titlebar` en el HTML renderizado.
- **Prism**: carga lazy la primera vez que se renderiza un módulo.
- **Cajas pedagógicas**: `analogy-box`, `tip-box`, `warning-box`, `challenge-box`, `tech-term-box`, `highlight-box`, `lab-box` — definidas en `module.css`.
