# Ansible Course — Documentación del Proyecto

## Visión General

SPA interactiva para aprender Ansible desde cero hasta nivel experto. 23 niveles progresivos con 70+ módulos, diagramas SVG animados, resaltado de sintaxis, navegación por hash y soporte de tema claro/oscuro.

Construido con Vite 6 + TypeScript puro, sin frameworks de UI. El contenido está hardcodeado en TypeScript como datos estructurados (no CMS, no Markdown externo).

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
│   ├── contentRouter.test.ts
│
├── levels/
│   ├── types.ts                # Interfaces: StepContent, ModuleContent, LevelMeta, ModuleMeta
│   ├── registry.ts             # levelRegistry: metadatos de todos los niveles y módulos
│   ├── nivel0.ts               # Contenido: Fundamentos Previos (4 módulos, ~1100 líneas)
│   ├── nivel1.ts               # Contenido: Introducción a Ansible (5 módulos, ~1060 líneas)
│   ├── nivel2.ts               # Contenido: Arquitectura Interna (5 módulos)
│   ├── nivel3.ts               # Contenido: Inventarios (5 módulos)
│   ├── nivel4.ts               # Contenido: Comandos CLI (9 módulos)
│   ├── nivel5.ts               # Contenido: Playbooks en Profundidad (7 módulos)
│   ├── nivel6to22.ts           # Contenido: Niveles 6–22 (~4500 líneas)
│   └── registry.test.ts
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

### Contenido

```
getModuleContent(level, module)
  → switch(level) 0–5: arrays importados directamente
  → default (6–22): getNivel6to22Content(level, module)
  → ModuleContent | undefined
```

`ModuleContent` tiene: `levelId`, `moduleId`, `title`, `objective`, `steps[]`. Cada step tiene `title` y `body` (puede contener HTML crudo para code blocks).

### Renderizado

`ModuleRenderer` es una clase que toma `#module-content` del DOM en su constructor y escucha clics delegados (copy + navegación). El método `render()` hace:

1. Llama `ensurePrism()` (carga lazy)
2. Busca metadata en `levelRegistry`
3. Llama `getModuleContent()` 
4. Llama `renderModule()` → inyecta HTML completo
5. Llama `renderDiagram()` → monta SVG si aplica
6. Llama `injectCopyButtons()` → agrega botones en `.code-block-titlebar`
7. Scroll to top
8. `highlightAll()` con Prism
9. `initScrollReveal()` con IntersectionObserver

### Diagramas SVG

Cada diagrama extiende `DiagramEngine` e implementa `render()`. Se montan en `#diagram-slot` dentro del contenido. Hay 5 diagramas disponibles, uno por nivel/módulo específico:

| Nivel | Módulo | Diagrama |
|---|---|---|
| 0 | 3 | YAML structure |
| 1 | 2 | Arquitectura Ansible |
| 2 | 1 | Flujo interno completo |
| 3 | 1 | Inventario diagram |
| 5 | 2 | Playbook flow |

### Sidebar

Construida dinámicamente desde `levelRegistry`. Soporta:
- Expansión/colapso por nivel (toggle de `.level-group`)
- Búsqueda en tiempo real filtrando `.module-item`
- Estado activo sincronizado con el hash
- Modo collapsed en desktop (persiste en `localStorage`)
- Modo mobile: overlay con backdrop y clase `.open`

### Tema

Dos temas: `dark` (default) y `light`. Se aplican como clase en `<html>`. Persiste en `localStorage`. El toggle está en el top bar.

---

## Datos del Curso

### Niveles y Badges

| Nivel | Subtítulo | Badge |
|---|---|---|
| 0 | Fundamentos Previos | Requisito |
| 1 | Introducción a Ansible | Principiante |
| 2 | Arquitectura Interna | Principiante+ |
| 3 | Inventarios | Principiante+ |
| 4 | Comandos CLI | Intermedio |
| 5 | Playbooks en Profundidad | Intermedio |
| 6 | Variables | Intermedio |
| 7 | Facts | Intermedio |
| 8 | Módulos | Intermedio |
| 9 | Jinja2 Completo | Intermedio |
| 10 | Condicionales | Intermedio |
| 11 | Loops Avanzados | Avanzado |
| 12 | Roles | Avanzado |
| 13 | Plugins | Avanzado |
| 14 | Collections | Avanzado |
| 15 | Vault | Avanzado |
| 16 | Optimización | Avanzado |
| 17 | Testing | Avanzado |
| 18 | Automatización Empresarial | Experto |
| 19 | Desarrollo Interno | Experto |
| 20 | Código Fuente de Ansible | Experto |
| 21 | Proyecto Integrador | Experto |
| 22 | Casos Reales y Buenas Prácticas | Experto |

Contenido completo escrito para niveles 0–5 (~8000 líneas de TS). Niveles 6–22 generados/resumidos en `nivel6to22.ts` (~4500 líneas).

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
- **Contenido en TS**: los módulos de contenido son arrays de `ModuleContent`. El `body` de cada step puede tener HTML con code blocks pre-formateados.
- **CSS variables**: todos los colores, tamaños y breakpoints viven en `theme.css`.
- **Hash routing**: no hay server-side routing. La URL siempre es `index.html#nivel-N/modulo-M`.
- **Scroll to top**: `ModuleRenderer.render()` hace scroll to top en `#content` al cambiar de módulo.
- **Copy buttons**: se inyectan dinámicamente buscando `.code-block-titlebar` en el HTML renderizado.
- **Prism**: carga lazy la primera vez que se renderiza un módulo.
